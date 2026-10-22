/**
 * TeleTerm ADE Agent Command Center Controller
 * Mandated by Master Plan Section 45, 16, 17, 18, 30:
 * Real-time activity stream, Pending Approvals, Context Pills, and Prompt Execution.
 */
class AdeAgentDeck {
    constructor() {
        this.historyStream = [];
    }

    init() {
        this.bindEvents();
        this.subscribeState();
    }

    bindEvents() {
        const sendBtn = document.getElementById('btn-agent-send');
        const promptInput = document.getElementById('agent-prompt-input');
        const interruptBtn = document.getElementById('btn-agent-interrupt');

        if (sendBtn && promptInput) {
            sendBtn.onclick = () => this.submitPrompt();
            promptInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    this.submitPrompt();
                }
            });
        }

        if (interruptBtn) {
            interruptBtn.onclick = () => window.AdeClient.interrupt();
        }

        // Quick Context Chips
        document.querySelectorAll('.quick-chip').forEach(chip => {
            chip.onclick = () => {
                const type = chip.getAttribute('data-type');
                this.addQuickContext(type);
            };
        });

        // Verification Card / Action
        const verifyBtn = document.getElementById('btn-run-tests');
        if (verifyBtn) {
            verifyBtn.onclick = () => window.AdeClient.runVerification();
        }

        // Listen for Verification Results from WebSocket
        window.AdeClient.on('verification_completed', (res) => {
            this.showVerificationCard(res);
            if (res.status) {
                window.dispatchEvent(new CustomEvent('teleterm:verification-status', { detail: { status: res.status } }));
            }
            if (res.summary) {
                window.dispatchEvent(new CustomEvent('teleterm:terminal-output', { detail: { data: `\r\n[VERIFY] ${res.summary}\r\n` } }));
            }
        });

        // Listen for Verification streaming output
        window.AdeClient.on('verification_output', (payload) => {
            if (payload?.data) {
                window.dispatchEvent(new CustomEvent('teleterm:terminal-output', { detail: { data: payload.data } }));
            }
        });

        // Listen for Diff Created events
        window.AdeClient.on('diff_created', (diff) => {
            this.showDiffBanner(diff.diffId, diff.filePath);
        });

        // Listen for agent turn completed
        window.AdeClient.on('agent_turn_completed', (payload) => {
            this.showAgentTurnCompleted(payload);
        });

        // Listen for agent started
        window.AdeClient.on('agent_started', (payload) => {
            if (payload?.model) {
                this.updateActivity(`Working with ${this.formatModelName(payload.model)}...`);
            }
        });

        // Setup AI Reasoning Model Selector
        const modelSelect = document.getElementById('select-agent-model');
        const savedModel = localStorage.getItem('teleterm_ade_agent_model') || 'claude-3-7-sonnet';
        if (modelSelect) {
            modelSelect.value = savedModel;
            this.updateModelTag(savedModel);
            modelSelect.addEventListener('change', () => {
                const val = modelSelect.value;
                localStorage.setItem('teleterm_ade_agent_model', val);
                this.updateModelTag(val);
            });
        }
    }

    subscribeState() {
        window.AdeState.subscribe((domain, payload, state) => {
            if (domain === 'agent_status') {
                this.updateStatusBadge(state.agents.currentState);
            } else if (domain === 'agent_activity') {
                this.updateActivity(state.agents.currentActivity);
            } else if (domain === 'approvals') {
                this.renderApprovals(state.agents.pendingApprovals);
            } else if (domain === 'context') {
                this.renderContextPills(state.context.chips, state.context.totalEstimatedTokens);
            }
        });
    }

    updateStatusBadge(status) {
        const dot = document.getElementById('agent-status-dot');
        const text = document.getElementById('agent-status-text');
        const intBtn = document.getElementById('btn-agent-interrupt');

        if (dot && text) {
            dot.className = `status-dot ${status.toLowerCase()}`;
            text.textContent = status;
        }

        if (intBtn) {
            intBtn.style.display = (status === 'WORKING' || status === 'PLANNING' || status === 'WAITING_FOR_APPROVAL') ? 'inline-flex' : 'none';
        }
    }

    updateActivity(activityText) {
        const actEl = document.getElementById('agent-activity-detail');
        if (actEl) actEl.textContent = activityText || 'Idle';
    }

    renderApprovals(pendingList) {
        const card = document.getElementById('approval-alert-card');
        const targetEl = document.getElementById('approval-target-desc');
        const approveBtn = document.getElementById('btn-approve-req');
        const rejectBtn = document.getElementById('btn-reject-req');

        if (!card || !targetEl) return;

        if (pendingList && pendingList.length > 0) {
            const req = pendingList[0];
            card.classList.add('visible');
            targetEl.textContent = `[${req.type}] ${req.target} (${req.scope})`;

            approveBtn.onclick = () => {
                window.AdeClient.resolveApproval(req.requestId, 'APPROVED');
            };

            rejectBtn.onclick = () => {
                window.AdeClient.resolveApproval(req.requestId, 'REJECTED', 'User rejected approval request');
            };
        } else {
            card.classList.remove('visible');
        }
    }

    renderContextPills(chips, totalTokens) {
        const tray = document.getElementById('context-pills-tray');
        const meter = document.getElementById('context-budget-meter');
        if (!tray) return;

        tray.innerHTML = '';
        chips.forEach(c => {
            const pill = document.createElement('span');
            pill.className = 'ctx-pill';
            pill.innerHTML = `
                <span>${c.label} (~${c.tokens || 10} tok)</span>
                <span class="pill-del" data-id="${c.id}">×</span>
            `;
            pill.querySelector('.pill-del').onclick = () => {
                window.AdeState.removeContextChip(c.id);
            };
            tray.appendChild(pill);
        });

        if (meter) {
            meter.textContent = `Context Budget: ${totalTokens} / 32,000 tokens`;
        }
    }

    addQuickContext(type) {
        if (type === 'code') {
            const sel = window.AdeMonaco.getSelectedCode();
            if (sel) {
                window.AdeState.addContextChip({
                    id: `ctx-code-${Date.now()}`,
                    type: 'code',
                    label: `@code:${sel.filePath.split('/').pop()} [${sel.startLine}-${sel.endLine}]`,
                    tokens: Math.ceil(sel.code.length / 3.8),
                    payload: sel
                });
            } else {
                alert('Please select code inside the Monaco editor first to attach @code.');
            }
        } else if (type === 'file') {
            const activeTab = window.AdeState.getActiveTab();
            if (activeTab) {
                window.AdeState.addContextChip({
                    id: `ctx-file-${activeTab.path}`,
                    type: 'file',
                    label: `@file:${activeTab.path}`,
                    tokens: Math.ceil((activeTab.content || '').length / 3.8),
                    payload: { filePath: activeTab.path }
                });
            } else {
                alert('No active file open in editor.');
            }
        } else if (type === 'terminal_error') {
            window.AdeTerminal.sendErrorToAgent();
        } else if (type === 'git') {
            window.AdeState.addContextChip({
                id: 'ctx-git',
                type: 'git',
                label: `@git (${window.AdeState.git.branch || 'HEAD'})`,
                tokens: 50,
                payload: {}
            });
        }
    }

    showDiffBanner(diffId, filePath) {
        const stream = document.getElementById('agent-history-stream');
        if (!stream) return;

        const card = document.createElement('div');
        card.className = 'msg-turn agent';
        const modelName = this.formatModelName(this.getActiveModel());
        card.innerHTML = `
            <div class="msg-header">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span>PROPOSED DIFF</span>
                    <span class="agent-model-pill">${modelName}</span>
                </div>
                <span>Diff Session: ${diffId.slice(-6)}</span>
            </div>
            <div class="msg-body">
                <div>Proposed modifications to <strong>${filePath}</strong></div>
                <div style="margin-top:8px;">
                    <button class="ade-btn ade-btn-sm ade-btn-primary" id="btn-view-diff-${diffId}">Inspect Side-by-Side Diff</button>
                </div>
            </div>
        `;

        card.querySelector(`#btn-view-diff-${diffId}`).onclick = () => {
            window.AdeDiffViewer.showDiffSession(diffId);
        };

        stream.appendChild(card);
        stream.scrollTop = stream.scrollHeight;
    }

    showVerificationCard(result) {
        const card = document.getElementById('verification-card');
        const text = document.getElementById('verification-summary-text');
        if (!card || !text) return;

        card.className = `verification-card visible ${result.status.toLowerCase()}`;
        text.textContent = `${result.summary} (Exit code: ${result.exitCode}, Duration: ${result.durationMs}ms)`;
    }

    getActiveModel() {
        const modelSelect = document.getElementById('select-agent-model');
        return (modelSelect && modelSelect.value) || localStorage.getItem('teleterm_ade_agent_model') || 'claude-3-7-sonnet';
    }

    formatModelName(modelId) {
        const names = {
            'claude-3-7-sonnet': 'Claude 3.7 Sonnet',
            'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
            'gpt-4o': 'GPT-4o Omni',
            'o3-mini': 'o3-mini Logic',
            'gemini-2-flash': 'Gemini 2.0 Flash',
            'deepseek-r1': 'DeepSeek R1',
            'local-ollama': 'Local Ollama'
        };
        return names[modelId] || modelId;
    }

    updateModelTag(modelId) {
        const tag = document.getElementById('agent-active-model-tag');
        if (tag) {
            const shortNames = {
                'claude-3-7-sonnet': 'Claude 3.7',
                'claude-3-5-sonnet': 'Claude 3.5',
                'gpt-4o': 'GPT-4o',
                'o3-mini': 'o3-mini',
                'gemini-2-flash': 'Gemini Flash',
                'deepseek-r1': 'DeepSeek R1',
                'local-ollama': 'Ollama'
            };
            tag.textContent = shortNames[modelId] || modelId;
        }
    }

    showAgentTurnCompleted(payload) {
        const stream = document.getElementById('agent-history-stream');
        if (!stream) return;

        const card = document.createElement('div');
        card.className = `msg-turn agent ${payload?.success === false ? 'failed' : ''}`;
        const modelName = this.formatModelName(payload?.model || this.getActiveModel());
        const providerName = (payload?.provider || 'Universal Agent').toUpperCase();

        const botIcon = window.TeleTermIcons ? window.TeleTermIcons.render('bot', { size: 13 }) : '';
        card.innerHTML = `
            <div class="msg-header">
                <div style="display:flex; align-items:center; gap:6px;">
                    <span style="display:inline-flex; align-items:center; gap:4px;">${botIcon} ${providerName}</span>
                    <span class="agent-model-pill">${modelName}</span>
                </div>
                <span>${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="msg-body">${this.escapeHtml(payload?.summary || 'Execution completed.')}</div>
        `;
        stream.appendChild(card);
        stream.scrollTop = stream.scrollHeight;
    }

    async submitPrompt() {
        const input = document.getElementById('agent-prompt-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        input.value = '';

        const activeModel = this.getActiveModel();
        const modelLabel = this.formatModelName(activeModel);

        // Append user message to stream with clear model routing indication
        const stream = document.getElementById('agent-history-stream');
        if (stream) {
            const arrowIcon = window.TeleTermIcons ? window.TeleTermIcons.render('arrow-right', { size: 10 }) : '';
            const msgEl = document.createElement('div');
            msgEl.className = 'msg-turn user';
            msgEl.innerHTML = `
                <div class="msg-header">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span>YOU</span>
                        <span class="agent-model-pill" style="background:rgba(88,166,255,0.15); color:var(--accent-blue); border-color:rgba(88,166,255,0.3); display:inline-flex; align-items:center; gap:4px;">${arrowIcon} ${modelLabel}</span>
                    </div>
                    <span>${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="msg-body">${this.escapeHtml(text)}</div>
            `;
            stream.appendChild(msgEl);
            stream.scrollTop = stream.scrollHeight;
        }

        // Collect code selection
        const codeSel = window.AdeMonaco.getSelectedCode();
        const chips = [...window.AdeState.context.chips];

        // Send prompt to Agent with explicitly designated active model
        await window.AdeClient.submitPrompt(text, codeSel, chips, activeModel);
    }

    escapeHtml(text) {
        return (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

window.AdeAgentDeck = new AdeAgentDeck();

if (typeof document !== 'undefined') {
    const initModelSelectEarly = () => {
        const sel = document.getElementById('select-agent-model');
        if (sel) {
            const saved = localStorage.getItem('teleterm_ade_agent_model') || 'claude-3-7-sonnet';
            sel.value = saved;
            if (window.AdeAgentDeck) window.AdeAgentDeck.updateModelTag(saved);
            sel.addEventListener('change', () => {
                localStorage.setItem('teleterm_ade_agent_model', sel.value);
                if (window.AdeAgentDeck) window.AdeAgentDeck.updateModelTag(sel.value);
            });
        }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModelSelectEarly);
    } else {
        initModelSelectEarly();
    }
}
