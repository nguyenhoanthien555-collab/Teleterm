/**
 * TeleTerm ADE Permission Engine
 * Implements real execution pause/resume for agent tool operations.
 * Mandated by Master Plan Section 17 & 18:
 * - Policies: ASK_ALWAYS, ASK_OUTSIDE_SCOPE, AUTO_APPROVE, DENY
 * - Real asynchronous pause via Promises until user responds
 */

const PERMISSION_POLICIES = {
    ASK_ALWAYS: 'ASK_ALWAYS',
    ASK_OUTSIDE_SCOPE: 'ASK_OUTSIDE_SCOPE',
    AUTO_APPROVE: 'AUTO_APPROVE',
    DENY: 'DENY'
};

class PermissionEngine {
    constructor({ eventBus, workspaceManager } = {}) {
        this.eventBus = eventBus;
        this.workspaceManager = workspaceManager;
        this.currentPolicy = PERMISSION_POLICIES.ASK_OUTSIDE_SCOPE;
        this.pendingRequests = new Map(); // Map<requestId, PendingRequest>
    }

    setPolicy(policy) {
        if (!PERMISSION_POLICIES[policy]) {
            throw new Error(`Invalid permission policy: ${policy}`);
        }
        this.currentPolicy = policy;
        if (this.eventBus) {
            this.eventBus.emitEvent('permission_policy_changed', { policy: this.currentPolicy }, { source: 'permission_engine' });
        }
    }

    getPolicy() {
        return this.currentPolicy;
    }

    getPendingRequests() {
        return Array.from(this.pendingRequests.values()).map(req => ({
            requestId: req.requestId,
            sessionId: req.sessionId,
            type: req.type,
            target: req.target,
            details: req.details,
            scope: req.scope,
            createdAt: req.createdAt
        }));
    }

    /**
     * Request permission before executing an action.
     * Halts execution asynchronously if user approval is required.
     * @returns {Promise<{ approved: boolean, reason?: string }>}
     */
    async requestPermission({ sessionId, type, target, details = {}, isOutsideScope = false, isDestructive = false }) {
        // 1. Immediate DENY policy
        if (this.currentPolicy === PERMISSION_POLICIES.DENY) {
            return { approved: false, reason: 'DENIED_BY_POLICY' };
        }

        // 2. AUTO_APPROVE policy (unless destructive)
        if (this.currentPolicy === PERMISSION_POLICIES.AUTO_APPROVE && !isDestructive && !isOutsideScope) {
            return { approved: true };
        }

        // 3. ASK_OUTSIDE_SCOPE policy
        if (this.currentPolicy === PERMISSION_POLICIES.ASK_OUTSIDE_SCOPE) {
            // Read-only inside workspace is safe
            if (type === 'file_read' && !isOutsideScope) {
                return { approved: true };
            }
            // If inside workspace and not destructive and safe edit, auto approve
            if (!isOutsideScope && !isDestructive && type === 'file_write') {
                return { approved: true };
            }
        }

        // 4. Execution Pause: User approval required
        const requestId = `perm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        
        return new Promise((resolve) => {
            const timeoutId = setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    resolve({ approved: false, reason: 'APPROVAL_TIMEOUT' });
                }
            }, 5 * 60 * 1000); // 5 min timeout

            const pending = {
                requestId,
                sessionId,
                type,
                target,
                details,
                scope: isOutsideScope ? 'OUTSIDE_WORKSPACE' : 'WORKSPACE',
                createdAt: Date.now(),
                timeoutId,
                resolve
            };

            this.pendingRequests.set(requestId, pending);

            // Broadcast approval request event to connected ADE clients
            if (this.eventBus) {
                this.eventBus.emitEvent('agent_approval_request', {
                    requestId,
                    sessionId,
                    type,
                    target,
                    details,
                    scope: pending.scope
                }, { sessionId, source: 'permission_engine' });
            }
        });
    }

    /**
     * Resolve pending request with user APPROVAL
     */
    approve(requestId) {
        const req = this.pendingRequests.get(requestId);
        if (!req) return false;

        clearTimeout(req.timeoutId);
        this.pendingRequests.delete(requestId);
        req.resolve({ approved: true });

        if (this.eventBus) {
            this.eventBus.emitEvent('agent_approval_resolved', {
                requestId,
                sessionId: req.sessionId,
                decision: 'APPROVED'
            }, { sessionId: req.sessionId, source: 'permission_engine' });
        }

        return true;
    }

    /**
     * Resolve pending request with user REJECTION
     */
    reject(requestId, reason = 'User denied permission') {
        const req = this.pendingRequests.get(requestId);
        if (!req) return false;

        clearTimeout(req.timeoutId);
        this.pendingRequests.delete(requestId);
        req.resolve({ approved: false, reason });

        if (this.eventBus) {
            this.eventBus.emitEvent('agent_approval_resolved', {
                requestId,
                sessionId: req.sessionId,
                decision: 'REJECTED',
                reason
            }, { sessionId: req.sessionId, source: 'permission_engine' });
        }

        return true;
    }

    /**
     * Cancel and reject all pending requests for a specific session (e.g. on interrupt or disconnect)
     */
    cancelSessionRequests(sessionId, reason = 'Agent session interrupted or closed') {
        let count = 0;
        for (const [requestId, req] of this.pendingRequests.entries()) {
            if (req.sessionId === sessionId) {
                clearTimeout(req.timeoutId);
                this.pendingRequests.delete(requestId);
                req.resolve({ approved: false, reason });

                if (this.eventBus) {
                    this.eventBus.emitEvent('agent_approval_resolved', {
                        requestId,
                        sessionId: req.sessionId,
                        decision: 'REJECTED',
                        reason
                    }, { sessionId: req.sessionId, source: 'permission_engine' });
                }
                count++;
            }
        }
        return count;
    }

    /**
     * Cancel and reject all pending requests across all sessions (e.g. on workspace shutdown)
     */
    cancelAllRequests(reason = 'Permission engine shutdown or reset') {
        let count = 0;
        for (const [requestId, req] of this.pendingRequests.entries()) {
            clearTimeout(req.timeoutId);
            this.pendingRequests.delete(requestId);
            req.resolve({ approved: false, reason });

            if (this.eventBus) {
                this.eventBus.emitEvent('agent_approval_resolved', {
                    requestId,
                    sessionId: req.sessionId,
                    decision: 'REJECTED',
                    reason
                }, { sessionId: req.sessionId, source: 'permission_engine' });
            }
            count++;
        }
        return count;
    }
}

module.exports = {
    PermissionEngine,
    PERMISSION_POLICIES
};
