/**
 * TeleTerm ADE Client State Store
 * Mandated by Master Plan Section 40:
 * Separated domains without duplicated truth or giant mutable globals.
 */
class AdeState {
    constructor() {
        this.workspace = {
            id: 'ws-default',
            rootPath: '',
            name: '',
            status: 'CONNECTING'
        };

        this.files = {
            tree: [],
            openTabs: [], // Array<{ path, name, dirty, revision, contentHash }>
            activePath: null,
            externalConflicts: new Map() // Map<path, conflictInfo>
        };

        this.git = {
            branch: 'main',
            isClean: true,
            files: []
        };

        this.agents = {
            sessions: [],
            activeSessionId: null,
            currentState: 'IDLE',
            currentActivity: 'Ready',
            pendingApprovals: [], // Array<ApprovalRequest>
            activeDiffSession: null
        };

        this.terminals = {
            sessions: [],
            activeTerminalId: null
        };

        this.context = {
            chips: [],
            totalEstimatedTokens: 0
        };

        this.verification = {
            lastResult: null,
            isRunning: false
        };

        this.permissionPolicy = 'ASK_OUTSIDE_SCOPE';
        this.sequence = 0;
        this.listeners = new Set();
    }

    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notify(domain, payload = {}) {
        for (const listener of this.listeners) {
            try {
                listener(domain, payload, this);
            } catch (e) {
                console.error('State listener error:', e);
            }
        }
    }

    setWorkspace(ws) {
        this.workspace = { ...this.workspace, ...ws };
        this.notify('workspace');
    }

    setGit(git) {
        this.git = { ...this.git, ...git };
        this.notify('git');
    }

    setTree(tree) {
        this.files.tree = tree;
        this.notify('files_tree');
    }

    openFile(path, content, revision, contentHash) {
        const existing = this.files.openTabs.find(t => t.path === path);
        if (!existing) {
            const name = path.split('/').pop();
            this.files.openTabs.push({
                path,
                name,
                content,
                originalContent: content,
                dirty: false,
                revision,
                contentHash
            });
        }
        this.files.activePath = path;
        this.notify('editor_tabs');
    }

    closeFile(path) {
        const idx = this.files.openTabs.findIndex(t => t.path === path);
        if (idx >= 0) {
            this.files.openTabs.splice(idx, 1);
            if (this.files.activePath === path) {
                this.files.activePath = this.files.openTabs.length > 0 ? this.files.openTabs[Math.max(0, idx - 1)].path : null;
            }
            this.notify('editor_tabs');
        }
    }

    setFileDirty(path, dirty) {
        const tab = this.files.openTabs.find(t => t.path === path);
        if (tab && tab.dirty !== dirty) {
            tab.dirty = dirty;
            this.notify('editor_tabs');
        }
    }

    getActiveTab() {
        return this.files.openTabs.find(t => t.path === this.files.activePath) || null;
    }

    setAgentStatus(status) {
        this.agents.currentState = status;
        this.notify('agent_status');
    }

    setAgentActivity(activity) {
        this.agents.currentActivity = activity;
        this.notify('agent_activity');
    }

    addPendingApproval(request) {
        this.agents.pendingApprovals.push(request);
        this.notify('approvals');
    }

    removePendingApproval(requestId) {
        this.agents.pendingApprovals = this.agents.pendingApprovals.filter(r => r.requestId !== requestId);
        this.notify('approvals');
    }

    setContextChips(chips) {
        this.context.chips = chips;
        this.context.totalEstimatedTokens = chips.reduce((sum, c) => sum + (c.tokens || 0), 0);
        this.notify('context');
    }

    addContextChip(chip) {
        if (!this.context.chips.some(c => c.label === chip.label)) {
            this.context.chips.push(chip);
            this.context.totalEstimatedTokens += (chip.tokens || 0);
            this.notify('context');
        }
    }

    removeContextChip(id) {
        this.context.chips = this.context.chips.filter(c => c.id !== id);
        this.context.totalEstimatedTokens = this.context.chips.reduce((sum, c) => sum + (c.tokens || 0), 0);
        this.notify('context');
    }

    setSessions(sessions, activeSessionId = null) {
        this.agents.sessions = sessions;
        if (activeSessionId) {
            this.agents.activeSessionId = activeSessionId;
        }
        this.notify('sessions');
    }

    setActiveSession(sessionId) {
        this.agents.activeSessionId = sessionId;
        this.notify('sessions');
    }

    setPermissionPolicy(policy) {
        this.permissionPolicy = policy;
        this.notify('permission_policy');
    }

    setVerificationResult(result) {
        this.verification.lastResult = result;
        this.verification.isRunning = false;
        this.notify('verification');
    }
}

window.AdeState = new AdeState();
