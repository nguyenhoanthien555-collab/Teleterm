/**
 * Base Provider Adapter Contract
 * Mandated by Master Plan Section 13 & 14:
 * Clear capability boundary without faking or assuming undocumented internals.
 */
class BaseProviderAdapter {
    constructor(id, name, capabilities = {}) {
        this.id = id;
        this.name = name;
        this.capabilities = {
            canReadFiles: true,
            canWriteFiles: true,
            canRunTerminal: true,
            canUseImages: false,
            canStream: true,
            canInterrupt: true,
            canApplyDiff: true,
            canRequestApproval: true,
            supportsReasoningSummary: false,
            ...capabilities
        };
    }

    getCapabilities() {
        return { ...this.capabilities };
    }

    async getStatus() {
        return { available: true, status: 'ready' };
    }

    /**
     * Execute turn / prompt
     * @param {object} params - { prompt, session, workspaceRuntime }
     */
    async runTurn(params) {
        throw new Error('Not implemented');
    }

    async interrupt(sessionId) {
        return true;
    }
}

module.exports = { BaseProviderAdapter };
