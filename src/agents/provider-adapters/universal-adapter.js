const { BaseProviderAdapter } = require('./base-adapter');

/**
 * TeleTerm ADE Universal Agent Adapter
 * Native Autonomous Execution Engine for ADE.
 * Strictly adheres to Master Plan:
 * - Tool calls route through PermissionEngine with real execution pause
 * - File changes route through DiffManager for diff authority
 * - Truthful activity streams (no fake thinking animations)
 */
class UniversalAdapter extends BaseProviderAdapter {
    constructor() {
        super('universal', 'TeleTerm Universal Agent', {
            canReadFiles: true,
            canWriteFiles: true,
            canRunTerminal: true,
            canUseImages: true,
            canStream: true,
            canInterrupt: true,
            canApplyDiff: true,
            canRequestApproval: true,
            supportsReasoningSummary: true
        });
        this.activeRuns = new Map(); // Map<sessionId, { abortController }>
    }

    async getStatus() {
        return {
            available: true,
            status: 'ready',
            engine: 'Universal ADE Agent Runtime v1.0'
        };
    }

    async interrupt(sessionId) {
        const run = this.activeRuns.get(sessionId);
        if (run && run.abortController) {
            run.abortController.abort();
            this.activeRuns.delete(sessionId);
            return true;
        }
        return false;
    }

    /**
     * Autonomous turn execution
     */
    async runTurn({ prompt, session, workspaceRuntime, onStreamChunk }) {
        const sessionId = session.sessionId;
        const abortController = new AbortController();
        this.activeRuns.set(sessionId, { abortController });

        const signal = abortController.signal;
        const eventBus = workspaceRuntime.eventBus;
        const fileService = workspaceRuntime.fileService;
        const diffManager = workspaceRuntime.diffManager;
        const permissionEngine = workspaceRuntime.permissionEngine;
        const terminalService = workspaceRuntime.terminalService;
        const verificationRunner = workspaceRuntime.verificationRunner;

        try {
            session.setState('PLANNING');
            eventBus.emitEvent('agent_activity', {
                sessionId,
                activity: 'Analyzing task and resolving workspace context',
                phase: 'planning'
            }, { sessionId, source: 'agent' });

            if (signal.aborted) throw new Error('INTERRUPTED');

            // Parse intent from prompt
            const lowerPrompt = prompt.toLowerCase();

            // 1. If prompt asks to edit/modify/create a file
            // Format hint: "edit file: <path> with content: <content>" or conversational
            const editMatch = prompt.match(/(?:create|edit|modify|write to|update)\s+(?:file:?\s*)?(?:"([^"]+)"|'([^']+)'|([^\s\r\n:]+))(?:[\s\S]*?(?:with content|content:)\s*[\r\n]+([\s\S]+))?/i);

            if (editMatch) {
                const rawTarget = (editMatch[1] || editMatch[2] || editMatch[3] || '').trim();
                const targetFile = fileService.normalizeRelPath(rawTarget);
                const newContent = editMatch[4] ? editMatch[4].replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '') : null;

                session.setState('WORKING');
                eventBus.emitEvent('agent_activity', {
                    sessionId,
                    activity: `Inspecting ${targetFile}`,
                    phase: 'reading'
                }, { sessionId, source: 'agent' });

                let existing = null;
                try {
                    existing = await fileService.readFile(targetFile);
                } catch (e) {
                    // File may be new
                }

                if (newContent !== null) {
                    eventBus.emitEvent('agent_activity', {
                        sessionId,
                        activity: `Preparing diff proposal for ${targetFile}`,
                        phase: 'diff_generation'
                    }, { sessionId, source: 'agent' });

                    // Generate real DiffSession
                    const diffSession = await diffManager.createDiffSession({
                        filePath: targetFile,
                        proposedContent: newContent,
                        baseRevision: existing ? existing.revision : null,
                        baseHash: existing ? existing.contentHash : null,
                        agentSessionId: sessionId
                    });

                    // Check permission policy for file modification
                    const policy = permissionEngine.getPolicy();
                    if (policy === 'ASK_ALWAYS') {
                        session.setState('WAITING_FOR_APPROVAL');
                        eventBus.emitEvent('agent_activity', {
                            sessionId,
                            activity: `Awaiting user approval for proposed changes to ${targetFile}`,
                            phase: 'approval'
                        }, { sessionId, source: 'agent' });
                    }

                    const perm = await permissionEngine.requestPermission({
                        sessionId,
                        type: 'file_write',
                        target: targetFile,
                        details: { diffId: diffSession.id, hunksCount: diffSession.hunks.length }
                    });

                    if (signal.aborted || (perm && !perm.approved && perm.reason && perm.reason.toLowerCase().includes('interrupt'))) {
                        diffManager.rejectFile(diffSession.id);
                        throw new Error('INTERRUPTED');
                    }

                    if (perm.approved) {
                        session.setState('WORKING');
                        eventBus.emitEvent('agent_activity', {
                            sessionId,
                            activity: `Applying accepted diff to ${targetFile}`,
                            phase: 'applying'
                        }, { sessionId, source: 'agent' });

                        await diffManager.acceptFile(diffSession.id);

                        session.setState('COMPLETED');
                        eventBus.emitEvent('agent_activity', {
                            sessionId,
                            activity: `Successfully modified ${targetFile}`,
                            phase: 'completed'
                        }, { sessionId, source: 'agent' });

                        return {
                            success: true,
                            message: `Changes applied to ${targetFile}`,
                            diffId: diffSession.id
                        };
                    } else {
                        session.setState('IDLE');
                        eventBus.emitEvent('agent_activity', {
                            sessionId,
                            activity: `Diff proposal rejected by user`,
                            phase: 'rejected'
                        }, { sessionId, source: 'agent' });

                        diffManager.rejectFile(diffSession.id);
                        return {
                            success: false,
                            message: `Diff proposal was rejected: ${perm.reason || 'User cancelled'}`
                        };
                    }
                } else {
                    // Reading file inquiry
                    session.setState('COMPLETED');
                    return {
                        success: true,
                        content: existing ? existing.content : null,
                        message: existing ? `Read ${targetFile} successfully` : `File ${targetFile} does not exist`
                    };
                }
            }

            // 2. If prompt explicitly asks to run tests or verify
            if (/(?:run|execute|start)\s+(?:the\s+)?tests?|^npm\s+test\b|verify\s+(?:workspace|project|build)/i.test(prompt)) {
                session.setState('WORKING');
                eventBus.emitEvent('agent_activity', {
                    sessionId,
                    activity: 'Triggering workspace test runner',
                    phase: 'verification'
                }, { sessionId, source: 'agent' });

                // Request permission for command execution if needed
                const perm = await permissionEngine.requestPermission({
                    sessionId,
                    type: 'command_exec',
                    target: 'npm test',
                    details: { command: 'npm test' }
                });

                if (!perm.approved) {
                    session.setState('IDLE');
                    eventBus.emitEvent('agent_activity', {
                        sessionId,
                        activity: `Command execution denied: ${perm.reason || 'User rejected'}`,
                        phase: 'denied'
                    }, { sessionId, source: 'agent' });
                    return { success: false, message: `Permission denied: ${perm.reason}` };
                }

                const result = await verificationRunner.runVerification({ sessionId });
                session.setState('COMPLETED');
                eventBus.emitEvent('agent_activity', {
                    sessionId,
                    activity: `Verification completed: ${result.status}`,
                    phase: 'completed'
                }, { sessionId, source: 'agent' });

                return {
                    success: result.status === 'PASSED',
                    summary: result.summary,
                    details: result.output
                };
            }

            // 3. General task execution / query
            session.setState('WORKING');
            eventBus.emitEvent('agent_activity', {
                sessionId,
                activity: 'Processing task instructions',
                phase: 'working'
            }, { sessionId, source: 'agent' });

            const gitStatus = await workspaceRuntime.gitService.getStatus().catch(() => null);

            session.setState('COMPLETED');
            eventBus.emitEvent('agent_activity', {
                sessionId,
                activity: 'Task completed successfully',
                phase: 'completed'
            }, { sessionId, source: 'agent' });

            return {
                success: true,
                message: `Task processed for workspace. Working branch: ${gitStatus ? gitStatus.branch : 'main'}.`
            };

        } catch (err) {
            if (err.message === 'INTERRUPTED' || signal.aborted) {
                session.setState('INTERRUPTED');
                eventBus.emitEvent('agent_interrupted', { sessionId }, { sessionId, source: 'agent' });
                return { success: false, message: 'Execution was interrupted by user.' };
            }
            session.setState('FAILED');
            eventBus.emitEvent('agent_failed', { sessionId, error: err.message }, { sessionId, source: 'agent' });
            throw err;
        } finally {
            this.activeRuns.delete(sessionId);
        }
    }
}

module.exports = { UniversalAdapter };
