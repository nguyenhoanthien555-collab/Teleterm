const WebSocket = require('ws');
const { defaultWorkspaceManager } = require('../../workspace/workspace-manager');
const { defaultEventBus } = require('../../events/event-bus');

/**
 * TeleTerm ADE Real-time Streaming Gateway
 * WebSocket endpoint: /ws/ade-stream
 * Mandated by Master Plan:
 * - Real-time sequence-numbered normalized event broadcast
 * - Reconnection resync / event replay from ring buffer
 * - Client interactive controls: prompt, approval, diff, terminal, verification
 */
class AdeGateway {
    constructor() {
        this.wss = new WebSocket.Server({ noServer: true, maxPayload: 256 * 1024 });
        this.workspaceRuntime = defaultWorkspaceManager.getDefaultWorkspace();
        this.clients = new Set();

        // Broadcast every normalized event from EventBus to all connected ADE clients
        defaultEventBus.on('*', (event) => {
            const message = JSON.stringify({
                type: 'event',
                event
            });
            for (const client of this.clients) {
                if (client.readyState === WebSocket.OPEN) {
                    try {
                        client.send(message);
                    } catch (err) {
                        this.clients.delete(client);
                    }
                }
            }
        });

        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
    }

    handleUpgrade(request, socket, head) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss.emit('connection', ws, request);
        });
    }

    async handleConnection(ws, req) {
        this.clients.add(ws);

        ws.on('close', () => {
            this.clients.delete(ws);
        });

        ws.on('error', (err) => {
            this.clients.delete(ws);
        });

        // Send hello handshake with workspace state and current sequence
        try {
            const wsInfo = await this.workspaceRuntime.getInfo();
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'hello',
                    workspace: wsInfo,
                    currentSequence: defaultEventBus.getCurrentSequence(),
                    capabilities: this.workspaceRuntime.agentManager.getAdapters(),
                    sessions: this.workspaceRuntime.agentManager.listSessions(),
                    activeSessionId: this.workspaceRuntime.agentManager.activeSessionId
                }));
            }
        } catch (err) {
            this.clients.delete(ws);
        }

        ws.on('message', async (data) => {
            try {
                const msg = JSON.parse(data.toString());
                await this.handleClientMessage(ws, msg);
            } catch (e) {
                try {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            error: e.message
                        }));
                    }
                } catch (_) {}
            }
        });
    }

    async handleClientMessage(ws, msg) {
        const type = msg.type;
        const payload = msg.payload || {};

        switch (type) {
            case 'replay': {
                // Client requests missed events on reconnect
                const fromSeq = payload.fromSequence || 0;
                const missed = defaultEventBus.getEventsSince(fromSeq);
                ws.send(JSON.stringify({
                    type: 'replay_batch',
                    events: missed
                }));
                break;
            }

            case 'prompt': {
                // Submit prompt to active or specified agent session
                const sessionId = payload.sessionId || this.workspaceRuntime.agentManager.activeSessionId;
                const session = this.workspaceRuntime.agentManager.getSession(sessionId) ||
                                this.workspaceRuntime.agentManager.getActiveSession();
                if (!session) {
                    throw new Error('No active agent session available');
                }

                // Run turn asynchronously (events will stream)
                session.submitPrompt(payload.prompt, {
                    codeSelection: payload.codeSelection,
                    explicitItems: payload.explicitItems,
                    model: payload.model
                }).catch(err => {
                    console.error('[AdeGateway] Prompt turn execution failed:', err);
                    defaultEventBus.emitEvent('agent_error', {
                        sessionId: session.sessionId,
                        error: err.message
                    }, { sessionId: session.sessionId, source: 'agent' });
                });
                break;
            }

            case 'interrupt': {
                const sessionId = payload.sessionId || this.workspaceRuntime.agentManager.activeSessionId;
                const session = this.workspaceRuntime.agentManager.getSession(sessionId);
                if (session) {
                    await session.interrupt();
                }
                this.workspaceRuntime.permissionEngine.cancelSessionRequests(sessionId);
                break;
            }

            case 'approval_response': {
                // User approves or rejects a pending tool execution
                const { requestId, decision, reason } = payload;
                if (decision === 'APPROVED') {
                    this.workspaceRuntime.permissionEngine.approve(requestId);
                } else {
                    this.workspaceRuntime.permissionEngine.reject(requestId, reason);
                }
                break;
            }

            case 'apply_diff': {
                const { diffId } = payload;
                await this.workspaceRuntime.diffManager.applyDiffSession(diffId);
                break;
            }

            case 'accept_file':
            case 'accept_diff': {
                const { diffId } = payload;
                await this.workspaceRuntime.diffManager.acceptFile(diffId);
                break;
            }

            case 'reject_diff': {
                const { diffId } = payload;
                this.workspaceRuntime.diffManager.rejectFile(diffId);
                break;
            }

            case 'hunk_decision': {
                const { diffId, hunkId, decision } = payload;
                if (decision === 'ACCEPTED') {
                    this.workspaceRuntime.diffManager.acceptHunk(diffId, hunkId);
                } else {
                    this.workspaceRuntime.diffManager.rejectHunk(diffId, hunkId);
                }
                break;
            }

            case 'terminal_input': {
                const { terminalId, data } = payload;
                this.workspaceRuntime.terminalService.writeInput(terminalId, data);
                break;
            }

            case 'terminal_resize': {
                const { terminalId, cols, rows } = payload;
                this.workspaceRuntime.terminalService.resize(terminalId, cols, rows);
                break;
            }

            case 'terminal_spawn': {
                const newSession = this.workspaceRuntime.terminalService.createSession({
                    name: payload.name || 'Terminal',
                    shellId: payload.shellId || 'powershell'
                });
                ws.send(JSON.stringify({
                    type: 'terminal_spawned',
                    session: {
                        id: newSession.id,
                        name: newSession.name
                    }
                }));
                break;
            }

            case 'verify_run': {
                const { command, sessionId } = payload;
                this.workspaceRuntime.verificationRunner.runVerification({ command, sessionId }).catch(err => {
                    // verification_completed event will handle error reporting
                });
                break;
            }

            case 'set_permission_policy': {
                const { policy } = payload;
                this.workspaceRuntime.permissionEngine.setPolicy(policy);
                break;
            }

            case 'switch_session': {
                const { sessionId } = payload;
                this.workspaceRuntime.agentManager.setActiveSession(sessionId);
                break;
            }

            case 'create_session': {
                const { providerId, name, model } = payload;
                const newSess = this.workspaceRuntime.agentManager.createSession({ providerId, name, model });
                this.workspaceRuntime.agentManager.setActiveSession(newSess.sessionId);
                break;
            }

            default:
                break;
        }
    }
}

if (!global.__adeGatewayInstance) {
    global.__adeGatewayInstance = new AdeGateway();
}
const adeGateway = global.__adeGatewayInstance;

module.exports = adeGateway;
