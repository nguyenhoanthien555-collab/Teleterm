/**
 * TeleTerm ADE Workspace Client & WebSocket Gateway Manager
 * Handles REST API calls and sequence-numbered real-time stream with reconnect replay.
 */
class AdeClient {
    constructor() {
        this.ws = null;
        this.lastSequence = 0;
        this.reconnectTimer = null;
        this.isConnected = false;
        this.eventHandlers = new Map();
        this.outgoingQueue = [];
    }

    on(type, handler) {
        if (!this.eventHandlers.has(type)) {
            this.eventHandlers.set(type, new Set());
        }
        this.eventHandlers.get(type).add(handler);
        return () => this.eventHandlers.get(type).delete(handler);
    }

    emitLocal(type, data) {
        const handlers = this.eventHandlers.get(type);
        if (handlers) {
            for (const h of handlers) h(data);
        }
    }

    connect() {
        if (this.ws) {
            try { this.ws.close(); } catch (e) {}
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/ade-stream`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            this.isConnected = true;
            this.emitLocal('connected', { sequence: this.lastSequence });
            window.AdeState.notify('connection', { connected: true, sequence: this.lastSequence });

            // Flush queued messages
            while (this.outgoingQueue.length > 0) {
                const item = this.outgoingQueue.shift();
                try {
                    this.ws.send(JSON.stringify(item));
                } catch (e) {}
            }

            // If reconnecting with previous sequence, request missed events
            if (this.lastSequence > 0) {
                this.send('replay', { fromSequence: this.lastSequence });
            }
        };

        this.ws.onclose = () => {
            this.isConnected = false;
            window.AdeState.notify('connection', { connected: false });
            this.emitLocal('disconnected');
            // Schedule reconnect
            if (!this.reconnectTimer) {
                this.reconnectTimer = setTimeout(() => {
                    this.reconnectTimer = null;
                    this.connect();
                }, 2000);
            }
        };

        this.ws.onerror = (err) => {
            console.warn('ADE WebSocket error:', err);
        };

        this.ws.onmessage = (evt) => {
            try {
                const msg = JSON.parse(evt.data);
                this.handleServerMessage(msg);
            } catch (e) {
                console.error('Failed to parse WebSocket message:', e);
            }
        };
    }

    handleServerMessage(msg) {
        if (msg.type === 'hello') {
            window.AdeState.setWorkspace(msg.workspace);
            if (msg.workspace.permissionPolicy) {
                window.AdeState.setPermissionPolicy(msg.workspace.permissionPolicy);
            }
            if (msg.sessions) {
                window.AdeState.setSessions(msg.sessions, msg.activeSessionId);
            }
            if (msg.workspace.git) {
                window.AdeState.setGit(msg.workspace.git);
            }
            if (msg.currentSequence && this.lastSequence === 0) {
                this.lastSequence = msg.currentSequence;
            }
            this.emitLocal('hello', msg);
            return;
        }

        if (msg.type === 'replay_batch') {
            const events = msg.events || [];
            for (const evt of events) {
                this.processNormalizedEvent(evt);
            }
            return;
        }

        if (msg.type === 'event' && msg.event) {
            this.processNormalizedEvent(msg.event);
        }
    }

    processNormalizedEvent(event) {
        // Enforce sequence ordering
        if (event.sequence > this.lastSequence) {
            this.lastSequence = event.sequence;
            window.AdeState.sequence = this.lastSequence;
        }

        this.emitLocal(event.type, event.payload);
        this.emitLocal('*', event);

        // Update AdeState domains based on event type
        switch (event.type) {
            case 'agent_status':
                window.AdeState.setAgentStatus(event.payload.state);
                break;
            case 'agent_activity':
                window.AdeState.setAgentActivity(event.payload.activity);
                break;
            case 'agent_approval_request':
                window.AdeState.addPendingApproval(event.payload);
                break;
            case 'agent_approval_resolved':
                window.AdeState.removePendingApproval(event.payload.requestId);
                break;
            case 'permission_policy_changed':
                window.AdeState.setPermissionPolicy(event.payload.policy);
                break;
            case 'session_list_updated':
                window.AdeState.setSessions(event.payload.sessions, event.payload.activeSessionId);
                break;
            case 'session_switched':
                window.AdeState.setActiveSession(event.payload.sessionId);
                break;
            case 'verification_completed':
                window.AdeState.setVerificationResult(event.payload);
                break;
            case 'git_status_changed':
                window.AdeState.setGit(event.payload);
                break;
            case 'file_changed':
            case 'file_created':
            case 'file_deleted':
                this.emitLocal('workspace_files_changed', event.payload);
                break;
            default:
                break;
        }
    }

    send(type, payload = {}) {
        const msg = { type, payload };
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(msg));
        } else {
            this.outgoingQueue.push(msg);
        }
    }

    // --- REST API CALLS ---
    async api(path, options = {}) {
        const res = await fetch(`/api/ade${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'API request failed');
        return data;
    }

    async getFilesTree() {
        const res = await this.api('/files/tree');
        window.AdeState.setTree(res.tree);
        return res.tree;
    }

    async readFile(filePath) {
        const res = await this.api(`/files/read?path=${encodeURIComponent(filePath)}`);
        return res.file;
    }

    async writeFile(filePath, content, baseRevision, baseHash) {
        const res = await this.api('/files/write', {
            method: 'POST',
            body: JSON.stringify({ path: filePath, content, baseRevision, baseHash })
        });
        return res.result;
    }

    async getGitStatus() {
        const res = await this.api('/git/status');
        window.AdeState.setGit(res.status);
        return res.status;
    }

    async getGitDiff(path = '', cached = false) {
        const res = await this.api(`/git/diff?path=${encodeURIComponent(path)}&cached=${cached}`);
        return res.diff;
    }

    async getDiffSession(diffId) {
        const res = await this.api(`/diffs/${diffId}`);
        return res.diff;
    }

    async acceptDiff(diffId) {
        const res = await this.api(`/diffs/${diffId}/accept`, { method: 'POST' });
        return res.diff;
    }

    async applyDiff(diffId) {
        const res = await this.api(`/diffs/${diffId}/apply`, { method: 'POST' });
        return res.diff;
    }

    async rejectDiff(diffId) {
        const res = await this.api(`/diffs/${diffId}/reject`, { method: 'POST' });
        return res.diff;
    }

    async getSessions() {
        const res = await this.api('/sessions');
        if (res.sessions) {
            window.AdeState.setSessions(res.sessions, res.activeSessionId);
        }
        return res;
    }

    switchSession(sessionId) {
        this.send('switch_session', { sessionId });
    }

    setPermissionPolicy(policy) {
        this.send('set_permission_policy', { policy });
    }

    async resolveApproval(requestId, decision, reason = '') {
        this.send('approval_response', { requestId, decision, reason });
    }

    async submitPrompt(prompt, codeSelection = null, explicitItems = [], model = null) {
        this.send('prompt', { prompt, codeSelection, explicitItems, model });
    }

    async interrupt() {
        this.send('interrupt');
    }

    async runVerification(command = null) {
        this.send('verify_run', { command });
    }

    async searchWorkspace(options = {}) {
        const res = await this.api('/search', {
            method: 'POST',
            body: JSON.stringify(options)
        });
        return res;
    }
}

window.AdeClient = new AdeClient();
