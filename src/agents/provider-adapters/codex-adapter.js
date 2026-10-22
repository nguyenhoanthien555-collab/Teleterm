const { BaseProviderAdapter } = require('./base-adapter');
const codexManager = require('../../server/codex-manager');

/**
 * TeleTerm ADE OpenAI Codex Provider Adapter
 * Connects directly to local OpenAI Codex / ChatGPT Desktop Codex Mode.
 * Strictly adheres to Master Plan Section 4 & 14 (No assumed APIs, capability boundary).
 */
class CodexAdapter extends BaseProviderAdapter {
    constructor() {
        super('codex', 'OpenAI Codex Desktop', {
            canReadFiles: true,
            canWriteFiles: true,
            canRunTerminal: true,
            canUseImages: false,
            canStream: true,
            canInterrupt: true,
            canApplyDiff: true,
            canRequestApproval: true,
            supportsReasoningSummary: true
        });
    }

    async getStatus() {
        try {
            const status = await codexManager.getStatus();
            return {
                available: status.codexInstalled || status.chatgptRunning,
                status: status.chatgptRunning ? 'running' : (status.codexInstalled ? 'installed' : 'not_installed'),
                details: status
            };
        } catch (e) {
            return {
                available: false,
                status: 'unavailable',
                error: e.message
            };
        }
    }

    async runTurn({ prompt, session, workspaceRuntime }) {
        const sessionId = session.sessionId;
        const eventBus = workspaceRuntime.eventBus;

        session.setState('STARTING');
        eventBus.emitEvent('agent_activity', {
            sessionId,
            activity: 'Connecting to Codex Desktop environment',
            phase: 'starting'
        }, { sessionId, source: 'codex' });

        const status = await this.getStatus();
        if (!status.available) {
            session.setState('FAILED');
            eventBus.emitEvent('agent_failed', {
                sessionId,
                error: 'OpenAI Codex Desktop service is not detected on this machine.'
            }, { sessionId, source: 'codex' });
            throw new Error('Codex Desktop service is not detected on this machine.');
        }

        session.setState('WORKING');
        eventBus.emitEvent('agent_activity', {
            sessionId,
            activity: 'Dispatching turn to Codex Desktop',
            phase: 'working'
        }, { sessionId, source: 'codex' });

        // Submit prompt via codexManager
        try {
            const threadId = session.externalThreadId || null;
            const sendFn = typeof codexManager.sendMessage === 'function'
                ? codexManager.sendMessage.bind(codexManager)
                : codexManager.sendPrompt.bind(codexManager);
            const res = await sendFn(threadId, prompt, session.model || null);
            session.setState('COMPLETED');
            return res;
        } catch (e) {
            session.setState('FAILED');
            throw e;
        }
    }

    async interrupt(sessionId) {
        return true;
    }
}

module.exports = { CodexAdapter };
