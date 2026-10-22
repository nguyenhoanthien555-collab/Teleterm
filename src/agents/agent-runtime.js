/**
 * TeleTerm ADE Agent Runtime
 * Mandated by Master Plan Section 12 & 32:
 * Strict State Machine: IDLE -> STARTING -> PLANNING -> WORKING -> WAITING_FOR_APPROVAL -> COMPLETED / FAILED / INTERRUPTED
 */

const AGENT_STATES = {
    IDLE: 'IDLE',
    STARTING: 'STARTING',
    PLANNING: 'PLANNING',
    WORKING: 'WORKING',
    WAITING_FOR_APPROVAL: 'WAITING_FOR_APPROVAL',
    INTERRUPTING: 'INTERRUPTING',
    INTERRUPTED: 'INTERRUPTED',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
};

class AgentRuntime {
    constructor({ sessionId, workspaceId, providerAdapter, workspaceRuntime, model = 'default' }) {
        this.sessionId = sessionId || `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        this.workspaceId = workspaceId || 'ws-default';
        this.providerAdapter = providerAdapter;
        this.workspaceRuntime = workspaceRuntime;
        this.model = model;
        this.state = AGENT_STATES.IDLE;
        this.capabilities = providerAdapter.getCapabilities();
        this.startTime = Date.now();
        this.history = [];
        this.currentTask = null;
    }

    setState(newState) {
        if (!AGENT_STATES[newState]) {
            throw new Error(`Invalid agent state: ${newState}`);
        }
        const oldState = this.state;
        this.state = newState;

        if (this.workspaceRuntime.eventBus) {
            this.workspaceRuntime.eventBus.emitEvent('agent_status', {
                sessionId: this.sessionId,
                state: this.state,
                oldState,
                timestamp: Date.now()
            }, { sessionId: this.sessionId, source: 'agent' });
        }
    }

    getState() {
        return this.state;
    }

    /**
     * Submit prompt and execute turn through ContextEngine and ProviderAdapter
     */
    async submitPrompt(rawPrompt, options = {}) {
        if (this.state === AGENT_STATES.WORKING || this.state === AGENT_STATES.PLANNING) {
            throw new Error('Agent is already processing a task. Please wait or interrupt.');
        }

        this.currentTask = rawPrompt;
        this.currentModel = options.model || this.model || 'claude-3-7-sonnet';
        this.setState(AGENT_STATES.STARTING);

        if (this.workspaceRuntime.eventBus) {
            this.workspaceRuntime.eventBus.emitEvent('agent_started', {
                sessionId: this.sessionId,
                provider: this.providerAdapter.id,
                model: this.currentModel,
                task: rawPrompt
            }, { sessionId: this.sessionId, source: 'agent' });
        }

        // 1. Resolve rich context through ContextEngine
        const resolvedContext = await this.workspaceRuntime.contextEngine.resolveContext({
            prompt: rawPrompt,
            explicitItems: options.explicitItems || [],
            codeSelection: options.codeSelection || null
        });

        // 2. Dispatch turn to Provider Adapter
        try {
            const turnResult = await this.providerAdapter.runTurn({
                prompt: resolvedContext.finalPrompt,
                session: this,
                workspaceRuntime: this.workspaceRuntime,
                model: this.currentModel,
                onStreamChunk: (chunk) => {
                    if (this.workspaceRuntime.eventBus) {
                        this.workspaceRuntime.eventBus.emitEvent('agent_output', {
                            sessionId: this.sessionId,
                            chunk,
                            model: this.currentModel
                        }, { sessionId: this.sessionId, source: 'agent' });
                    }
                }
            });

            if (turnResult) {
                turnResult.model = this.currentModel;
            }

            this.history.push({
                prompt: rawPrompt,
                model: this.currentModel,
                contextPills: resolvedContext.pills,
                result: turnResult,
                timestamp: Date.now()
            });

            if (this.workspaceRuntime.eventBus) {
                this.workspaceRuntime.eventBus.emitEvent('agent_turn_completed', {
                    sessionId: this.sessionId,
                    provider: this.providerAdapter.id,
                    model: this.currentModel,
                    summary: turnResult ? (turnResult.summary || turnResult.message) : '',
                    success: turnResult ? turnResult.success : true
                }, { sessionId: this.sessionId, source: 'agent' });
            }

            return turnResult;
        } catch (err) {
            this.setState(AGENT_STATES.FAILED);
            throw err;
        }
    }

    async interrupt() {
        this.setState(AGENT_STATES.INTERRUPTING);
        if (this.workspaceRuntime) {
            if (this.workspaceRuntime.permissionEngine) {
                this.workspaceRuntime.permissionEngine.cancelSessionRequests(this.sessionId);
            }
            if (this.workspaceRuntime.agentManager) {
                this.workspaceRuntime.agentManager.releaseSessionAdvisories(this.sessionId);
            }
        }
        await this.providerAdapter.interrupt(this.sessionId);
        this.setState(AGENT_STATES.INTERRUPTED);
        return true;
    }
}

module.exports = {
    AgentRuntime,
    AGENT_STATES
};
