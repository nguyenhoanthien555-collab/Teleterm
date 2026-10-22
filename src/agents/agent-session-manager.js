const { AgentRuntime } = require('./agent-runtime');
const { UniversalAdapter } = require('./provider-adapters/universal-adapter');
const { CodexAdapter } = require('./provider-adapters/codex-adapter');
const { AntigravityAdapter } = require('./provider-adapters/antigravity-adapter');

/**
 * TeleTerm ADE Agent Session Manager
 * Mandated by Master Plan Section 33 & 34:
 * Multi-Agent Coexistence, session switching, and advisory file ownership
 */
class AgentSessionManager {
    constructor({ workspaceRuntime }) {
        this.workspaceRuntime = workspaceRuntime;
        this.sessions = new Map(); // Map<sessionId, AgentRuntime>
        this.activeSessionId = null;
        this.activeFileAdvisory = new Map(); // Map<relPath, sessionId>

        // Register available provider adapters
        this.adapters = new Map([
            ['universal', new UniversalAdapter()],
            ['codex', new CodexAdapter()],
            ['antigravity', new AntigravityAdapter()]
        ]);

        // Auto-create initial default session
        this.createSession({ providerId: 'universal', name: 'Primary Agent' });
    }

    getAdapters() {
        const list = [];
        for (const [id, adapter] of this.adapters.entries()) {
            list.push({
                id,
                name: adapter.name,
                capabilities: adapter.getCapabilities()
            });
        }
        return list;
    }

    createSession({ providerId = 'universal', name = null, model = 'default' } = {}) {
        const adapter = this.adapters.get(providerId) || this.adapters.get('universal');
        const sessionId = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        const session = new AgentRuntime({
            sessionId,
            workspaceId: this.workspaceRuntime.workspaceId,
            providerAdapter: adapter,
            workspaceRuntime: this.workspaceRuntime,
            model
        });

        session.name = name || `${adapter.name} (${sessionId.slice(-4)})`;
        this.sessions.set(sessionId, session);

        if (!this.activeSessionId) {
            this.activeSessionId = sessionId;
        }

        if (this.workspaceRuntime.eventBus) {
            this.workspaceRuntime.eventBus.emitEvent('session_created', {
                sessionId,
                name: session.name,
                provider: providerId,
                model
            }, { sessionId, source: 'agent_manager' });

            this.workspaceRuntime.eventBus.emitEvent('session_list_updated', {
                sessions: this.listSessions(),
                activeSessionId: this.activeSessionId
            }, { sessionId, source: 'agent_manager' });
        }

        return session;
    }

    getSession(sessionId) {
        return this.sessions.get(sessionId) || null;
    }

    getActiveSession() {
        return this.sessions.get(this.activeSessionId) || null;
    }

    setActiveSession(sessionId) {
        if (!this.sessions.has(sessionId)) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        this.activeSessionId = sessionId;
        if (this.workspaceRuntime.eventBus) {
            this.workspaceRuntime.eventBus.emitEvent('session_switched', {
                sessionId
            }, { sessionId, source: 'agent_manager' });

            this.workspaceRuntime.eventBus.emitEvent('session_list_updated', {
                sessions: this.listSessions(),
                activeSessionId: this.activeSessionId
            }, { sessionId, source: 'agent_manager' });
        }
        return this.sessions.get(sessionId);
    }

    listSessions() {
        return Array.from(this.sessions.values()).map(s => ({
            sessionId: s.sessionId,
            name: s.name,
            provider: s.providerAdapter.id,
            state: s.state,
            currentTask: s.currentTask,
            startTime: s.startTime,
            isActive: s.sessionId === this.activeSessionId
        }));
    }

    /**
     * Advisory File Ownership Check (Section 34)
     * Warns if multiple agents attempt to propose edits on the same file concurrently
     */
    checkFileAdvisory(relPath, proposingSessionId) {
        const existingSessionId = this.activeFileAdvisory.get(relPath);
        if (existingSessionId && existingSessionId !== proposingSessionId) {
            const ownerSession = this.sessions.get(existingSessionId);
            let hasPendingDiff = false;
            if (this.workspaceRuntime && this.workspaceRuntime.diffManager && this.workspaceRuntime.diffManager.sessions) {
                for (const diff of this.workspaceRuntime.diffManager.sessions.values()) {
                    if (diff.filePath === relPath && diff.agentSessionId === existingSessionId && (diff.status === 'PENDING' || diff.status === 'PARTIAL')) {
                        hasPendingDiff = true;
                        break;
                    }
                }
            }

            const isBusy = ownerSession && (ownerSession.state === 'WORKING' || ownerSession.state === 'PLANNING' || ownerSession.state === 'WAITING_FOR_APPROVAL');

            if (ownerSession && (hasPendingDiff || isBusy)) {
                return {
                    hasAdvisoryConflict: true,
                    ownerSessionId: existingSessionId,
                    message: `File '${relPath}' currently has pending modifications from session '${existingSessionId}'`
                };
            }
            // Stale or finished session, release ownership
            this.activeFileAdvisory.delete(relPath);
        }
        this.activeFileAdvisory.set(relPath, proposingSessionId);
        return { hasAdvisoryConflict: false };
    }

    releaseFileAdvisory(relPath) {
        this.activeFileAdvisory.delete(relPath);
    }

    releaseSessionAdvisories(sessionId) {
        let count = 0;
        for (const [relPath, ownerId] of this.activeFileAdvisory.entries()) {
            if (ownerId === sessionId) {
                this.activeFileAdvisory.delete(relPath);
                count++;
            }
        }
        return count;
    }
}

module.exports = { AgentSessionManager };
