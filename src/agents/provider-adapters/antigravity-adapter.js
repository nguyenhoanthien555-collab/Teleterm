const { BaseProviderAdapter } = require('./base-adapter');
const antigravityManager = require('../../server/antigravity-manager');

/**
 * TeleTerm ADE Google Antigravity Provider Adapter
 * Connects to local Antigravity Language Server / CLI.
 * Strictly adheres to Master Plan Section 4 & 14 (No assumed APIs, capability boundary).
 */
class AntigravityAdapter extends BaseProviderAdapter {
    constructor() {
        super('antigravity', 'Google Antigravity', {
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
    }

    async getStatus() {
        try {
            const status = await antigravityManager.getStatus();
            return {
                available: !!status.isRunning || !!status.cliInstalled,
                status: status.isRunning ? 'running' : 'stopped',
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
            activity: 'Connecting to Google Antigravity runtime',
            phase: 'starting'
        }, { sessionId, source: 'antigravity' });

        const status = await this.getStatus();
        if (!status.available) {
            session.setState('FAILED');
            eventBus.emitEvent('agent_failed', {
                sessionId,
                error: 'Google Antigravity is not detected on this machine.'
            }, { sessionId, source: 'antigravity' });
            throw new Error('Google Antigravity is not detected on this machine.');
        }

        session.setState('WORKING');
        eventBus.emitEvent('agent_activity', {
            sessionId,
            activity: 'Dispatching prompt to Antigravity runtime',
            phase: 'working'
        }, { sessionId, source: 'antigravity' });

        try {
            // Send prompt to active session if available
            const sendFn = typeof antigravityManager.sendUserPrompt === 'function'
                ? antigravityManager.sendUserPrompt.bind(antigravityManager)
                : antigravityManager.sendLiveMessage.bind(antigravityManager);
            const res = await sendFn(prompt, session.externalThreadId || null, session.model || null);
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

module.exports = { AntigravityAdapter };
