/**
 * TELETERM ANTIGRAVITY 3D DECK CONTROLLER
 * Process monitor (PIDs, RAM, Active Profile), session databases, model selector, live prompt injection,
 * interactive session selection modal, and rich transcript viewer.
 */

export class AntigravityDeck {
    constructor(options = {}) {
        this.onToast = options.onToast || console.log;
        this.onPulse = options.onPulse || null;

        this.statusBadge = document.getElementById('agy-proc-status');
        this.ramVal = document.getElementById('agy-ram-val');
        this.pidsVal = document.getElementById('agy-pids-val');
        this.activeProfileVal = document.getElementById('agy-active-profile-val');
        this.sessionsContainer = document.getElementById('agy-sessions-container');
        this.modelSelect = document.getElementById('agy-model-select');
        this.promptInput = document.getElementById('agy-prompt-input');
        this.btnSend = document.getElementById('btn-agy-send');

        this.btnStart = document.getElementById('btn-agy-start');
        this.btnRestart = document.getElementById('btn-agy-restart');
        this.btnStop = document.getElementById('btn-agy-stop');

        // Session Action Modal Elements
        this.modalActions = document.getElementById('modal-agy-session-actions');
        this.btnCloseAction = document.getElementById('btn-close-agy-action-modal');
        this.actionSessionIdEl = document.getElementById('agy-action-session-id');
        this.actionSessionMetaEl = document.getElementById('agy-action-session-meta');
        this.btnLaunchTerminal = document.getElementById('btn-agy-launch-terminal');
        this.btnViewTranscript = document.getElementById('btn-agy-view-transcript');
        this.btnCopyId = document.getElementById('btn-agy-copy-id');

        // Transcript Viewer Modal Elements
        this.modalTranscript = document.getElementById('modal-agy-transcript');
        this.btnCloseTranscript = document.getElementById('btn-close-agy-transcript');
        this.transcriptTitleEl = document.getElementById('agy-transcript-title');
        this.transcriptMessagesEl = document.getElementById('agy-transcript-messages');

        this.statusData = null;
        this.pollTimer = null;
        this.selectedSession = null;

        this.init();
    }

    init() {
        if (this.btnSend) {
            this.btnSend.addEventListener('click', () => this.sendPrompt());
        }

        if (this.promptInput) {
            this.promptInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendPrompt();
                }
            });
        }

        // App lifecycle buttons
        if (this.btnStart) this.btnStart.addEventListener('click', () => this.handleAppAction('start'));
        if (this.btnRestart) this.btnRestart.addEventListener('click', () => this.handleAppAction('restart'));
        if (this.btnStop) this.btnStop.addEventListener('click', () => this.handleAppAction('stop'));

        // Modal Action listeners
        if (this.btnCloseAction) {
            this.btnCloseAction.addEventListener('click', () => this.closeActionModal());
        }
        if (this.modalActions) {
            this.modalActions.addEventListener('click', (e) => {
                if (e.target === this.modalActions) this.closeActionModal();
            });
        }
        if (this.btnLaunchTerminal) {
            this.btnLaunchTerminal.addEventListener('click', () => this.launchSessionInTerminal());
        }
        if (this.btnViewTranscript) {
            this.btnViewTranscript.addEventListener('click', () => this.openTranscriptModal());
        }
        if (this.btnCopyId) {
            this.btnCopyId.addEventListener('click', () => this.copySessionId());
        }

        // Transcript Modal listeners
        if (this.btnCloseTranscript) {
            this.btnCloseTranscript.addEventListener('click', () => this.closeTranscriptModal());
        }
        if (this.modalTranscript) {
            this.modalTranscript.addEventListener('click', (e) => {
                if (e.target === this.modalTranscript) this.closeTranscriptModal();
            });
        }

        this.loadStatus();
        this.pollTimer = setInterval(() => this.loadStatus(), 6000);
    }

    async loadStatus() {
        try {
            const res = await fetch('/api/antigravity/status');
            if (!res.ok) return;
            const data = await res.json();
            if (data.success) {
                this.statusData = data;
                this.renderStatus(data);
            }
        } catch (e) {
            console.warn('[Antigravity Status Error]', e);
        }
    }

    renderStatus(data) {
        const app = data.status?.app || {};
        const isRunning = app.isRunning;

        if (this.statusBadge) {
            const i18n = window.TeleTermI18n;
            this.statusBadge.textContent = i18n 
                ? i18n.t(isRunning ? 'agy_status_running' : 'agy_status_stopped') 
                : (isRunning ? 'RUNNING' : 'STOPPED');
            this.statusBadge.className = `agy-status-chip ${isRunning ? 'running' : 'stopped'}`;
        }

        if (this.ramVal) {
            this.ramVal.textContent = isRunning ? `${app.memoryMB || 0} MB` : '0 MB';
        }

        if (this.pidsVal) {
            const pids = app.pids || [];
            this.pidsVal.textContent = isRunning ? (pids.length > 0 ? pids.join(', ') : 'Active') : 'None';
        }

        if (this.activeProfileVal && app.activeProfile) {
            const p = app.activeProfile;
            if (p.email && p.name && p.name !== p.email) {
                this.activeProfileVal.textContent = `${p.name} • ${p.email}`;
            } else {
                this.activeProfileVal.textContent = p.email || p.name || 'Google Profile';
            }
        }

        // Models dropdown
        if (this.modelSelect && Array.isArray(data.models) && this.modelSelect.children.length === 0) {
            this.modelSelect.innerHTML = '';
            data.models.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = m.name;
                this.modelSelect.appendChild(opt);
            });
        }

        // Conversations / Databases list
        if (this.sessionsContainer && Array.isArray(data.conversations)) {
            this.sessionsContainer.innerHTML = '';
            if (data.conversations.length === 0) {
                const i18n = window.TeleTermI18n;
                const emptyMsg = i18n ? i18n.t('agy_no_conversations') : 'No conversations yet';
                this.sessionsContainer.innerHTML = `<div style="color:var(--text-dim);font-size:11px;padding:8px;">${emptyMsg}</div>`;
                return;
            }

            data.conversations.slice(0, 10).forEach(c => {
                const card = document.createElement('div');
                const isSelected = this.selectedSession && this.selectedSession.id === c.id;
                card.className = `agy-session-card ${isSelected ? 'selected' : ''}`;
                card.dataset.sessionId = c.id;

                const rawDate = c.updatedAt || c.lastModified || Date.now();
                const dateStr = new Date(rawDate).toLocaleDateString('vi-VN', {
                    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
                });
                const sizeMB = c.sizeMB || (c.size ? (c.size / (1024 * 1024)).toFixed(1) : '0.1');
                const displayTitle = c.title ? c.title : `${c.id.substring(0, 14)}…`;

                card.innerHTML = `
                    <div class="agy-sess-left">
                        <span class="sess-dot"></span>
                        <span class="sess-title" title="${c.id}">${this.escapeHtml(displayTitle)}</span>
                    </div>
                    <div class="agy-sess-right">
                        <span class="sess-time">${dateStr}</span>
                        <span class="sess-size">${sizeMB} MB</span>
                    </div>
                `;

                // Interactive tap handler to select session & open action options
                card.addEventListener('click', () => {
                    this.selectSession(c, card);
                });

                this.sessionsContainer.appendChild(card);
            });
        }
    }

    selectSession(session, cardEl) {
        this.selectedSession = session;
        if (this.sessionsContainer) {
            this.sessionsContainer.querySelectorAll('.agy-session-card').forEach(el => {
                el.classList.toggle('selected', el.dataset.sessionId === session.id);
            });
        }
        this.openActionModal(session);
    }

    openActionModal(session) {
        if (!this.modalActions) return;
        if (this.actionSessionIdEl) {
            this.actionSessionIdEl.textContent = `ID: ${session.id}`;
        }
        if (this.actionSessionMetaEl) {
            const rawDate = session.updatedAt || session.lastModified || Date.now();
            const isVi = window.TeleTermI18n && window.TeleTermI18n.getCurrentLanguage() === 'vi';
            const dateStr = new Date(rawDate).toLocaleDateString(isVi ? 'vi-VN' : 'en-US', {
                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
            });
            const sizeMB = session.sizeMB || (session.size ? (session.size / (1024 * 1024)).toFixed(1) : '0.1');
            const title = session.title ? `"${session.title}"` : 'Antigravity Session';
            const metaUpdated = isVi ? 'Cập nhật' : 'Updated';
            const metaSize = isVi ? 'Kích thước' : 'Size';
            this.actionSessionMetaEl.textContent = `${title} • ${metaUpdated}: ${dateStr} • ${metaSize}: ${sizeMB} MB`;
        }
        this.modalActions.classList.remove('hidden');
    }

    closeActionModal() {
        if (this.modalActions) {
            this.modalActions.classList.add('hidden');
        }
    }

    async launchSessionInTerminal() {
        if (!this.selectedSession) return;
        const session = this.selectedSession;
        this.closeActionModal();

        const isVi = window.TeleTermI18n && window.TeleTermI18n.getCurrentLanguage() === 'vi';
        const sessionName = session.title ? session.title.substring(0, 18) : session.id.substring(0, 8);
        this.onToast(isVi ? 'Đang kết nối phiên Antigravity vào Terminal...' : 'Connecting Antigravity session to Terminal...', 'info');

        try {
            const res = await fetch('/api/antigravity/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: session.id,
                    name: sessionName
                })
            });
            const data = await res.json();
            if (data.success && data.session) {
                this.onToast(isVi ? 'Đã kết nối phiên vào Terminal!' : 'Connected session to Terminal!', 'success');

                // Switch to terminal view and switch active session
                if (window.TeleTermApp) {
                    if (window.TeleTermApp.terminalManager) {
                        await window.TeleTermApp.terminalManager.loadSessions();
                        window.TeleTermApp.terminalManager.switchSession(data.session.id);
                    }
                    window.TeleTermApp.switchView('terminal');
                }
            } else {
                this.onToast(data.message || (isVi ? 'Không thể mở session trong Terminal' : 'Failed to open session in Terminal'), 'error');
            }
        } catch (e) {
            this.onToast((isVi ? 'Lỗi mở session: ' : 'Error opening session: ') + e.message, 'error');
        }
    }

    async openTranscriptModal() {
        if (!this.selectedSession) return;
        const session = this.selectedSession;
        this.closeActionModal();

        if (this.modalTranscript) {
            this.modalTranscript.classList.remove('hidden');
        }
        if (this.transcriptTitleEl) {
            const chatSvg = window.TeleTermIcons ? window.TeleTermIcons.render('message-square', { size: 14 }) : '';
            this.transcriptTitleEl.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">${chatSvg} <span>${this.escapeHtml(session.title ? session.title.substring(0, 40) : session.id.substring(0, 14))}</span></span>`;
        }
        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getCurrentLanguage() === 'vi';
        if (this.transcriptMessagesEl) {
            const loadingMsg = i18n ? i18n.t('agy_loading_messages') : '⧖ Loading message history...';
            this.transcriptMessagesEl.innerHTML = `<div style="color:var(--text-dim);font-size:12px;padding:30px;text-align:center;">${loadingMsg}</div>`;
        }

        try {
            const res = await fetch(`/api/antigravity/session/${encodeURIComponent(session.id)}/messages`);
            const data = await res.json();
            if (data.success && Array.isArray(data.messages)) {
                this.renderTranscriptMessages(data.messages);
            } else {
                if (this.transcriptMessagesEl) {
                    const notFoundMsg = isVi ? 'Không tìm thấy dữ liệu hội thoại.' : 'Conversation data not found.';
                    this.transcriptMessagesEl.innerHTML = `<div style="color:var(--text-dim);font-size:12px;padding:30px;text-align:center;">${data.message || notFoundMsg}</div>`;
                }
            }
        } catch (e) {
            if (this.transcriptMessagesEl) {
                const errMsg = isVi ? 'Lỗi tải tin nhắn: ' : 'Error loading messages: ';
                this.transcriptMessagesEl.innerHTML = `<div style="color:var(--cyber-rose);font-size:12px;padding:30px;text-align:center;">${errMsg}${e.message}</div>`;
            }
        }
    }

    renderTranscriptMessages(messages) {
        if (!this.transcriptMessagesEl) return;
        this.transcriptMessagesEl.innerHTML = '';

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getCurrentLanguage() === 'vi';
        if (messages.length === 0) {
            const noMsg = i18n ? i18n.t('agy_no_messages') : 'No messages in this session';
            this.transcriptMessagesEl.innerHTML = `<div style="color:var(--text-dim);font-size:12px;padding:30px;text-align:center;">${noMsg}</div>`;
            return;
        }

        messages.forEach(msg => {
            const isUser = msg.role === 'user';
            const msgDiv = document.createElement('div');
            msgDiv.className = isUser ? 'codex-turn-user' : 'codex-turn-assistant';

            const timeStr = msg.timestamp 
                ? new Date(msg.timestamp).toLocaleTimeString(isVi ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })
                : '';

            const timeBadge = timeStr ? `<span style="font-size:9px;color:var(--text-dim);margin-left:6px;">${timeStr}</span>` : '';
            const userIcon = window.TeleTermIcons ? window.TeleTermIcons.render('users', { size: 11 }) : '';
            const userLabel = i18n ? i18n.t('agy_user_label') : 'YOU';

            if (isUser) {
                msgDiv.innerHTML = `
                    <div class="turn-bubble user">
                        <div style="font-weight:700;font-size:10px;margin-bottom:4px;color:var(--cyber-cyan);display:flex;align-items:center;gap:4px;">${userIcon} <span>${userLabel}</span> ${timeBadge}</div>
                        <div>${this.escapeHtml(msg.content).replace(/\n/g, '<br>')}</div>
                    </div>
                `;
            } else {
                let toolChipsHtml = '';
                if (Array.isArray(msg.tools) && msg.tools.length > 0) {
                    const cpuIcon = window.TeleTermIcons ? window.TeleTermIcons.render('cpu', { size: 10 }) : '';
                    const toolTags = msg.tools.slice(0, 5).map(t => `<span style="font-size:9px;background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.1);font-family:var(--font-mono);display:inline-flex;align-items:center;gap:4px;">${cpuIcon} <span>${this.escapeHtml(t.name || 'tool')}</span></span>`).join(' ');
                    toolChipsHtml = `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">${toolTags}</div>`;
                }

                const orbitIcon = window.TeleTermIcons ? window.TeleTermIcons.render('orbit', { size: 12 }) : '';
                msgDiv.innerHTML = `
                    <div class="turn-bubble assistant">
                        <div style="font-weight:700;font-size:10px;margin-bottom:6px;color:var(--cyber-emerald);display:flex;align-items:center;justify-content:space-between;">
                            <span style="display:inline-flex;align-items:center;gap:4px;">${orbitIcon} <span>ANTIGRAVITY AGENT</span></span>
                            ${timeBadge}
                        </div>
                        ${toolChipsHtml}
                        <div>${this.formatMarkdown(msg.content)}</div>
                    </div>
                `;
            }
            this.transcriptMessagesEl.appendChild(msgDiv);
        });

        // Auto scroll to bottom
        setTimeout(() => {
            this.transcriptMessagesEl.scrollTop = this.transcriptMessagesEl.scrollHeight;
        }, 50);
    }

    closeTranscriptModal() {
        if (this.modalTranscript) {
            this.modalTranscript.classList.add('hidden');
        }
    }

    copySessionId() {
        if (!this.selectedSession) return;
        const id = this.selectedSession.id;
        const isVi = window.TeleTermI18n && window.TeleTermI18n.getCurrentLanguage() === 'vi';
        const msg = isVi ? `Đã sao chép ID: ${id.substring(0, 14)}…` : `Copied ID: ${id.substring(0, 14)}…`;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(id).then(() => {
                this.onToast(msg, 'success');
            }).catch(() => {
                this.fallbackCopy(id);
            });
        } else {
            this.fallbackCopy(id);
        }
    }

    fallbackCopy(text) {
        const isVi = window.TeleTermI18n && window.TeleTermI18n.getCurrentLanguage() === 'vi';
        const msg = isVi ? `Đã sao chép ID: ${text.substring(0, 14)}…` : `Copied ID: ${text.substring(0, 14)}…`;
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        this.onToast(msg, 'success');
    }

    async handleAppAction(action) {
        const isVi = window.TeleTermI18n && window.TeleTermI18n.getCurrentLanguage() === 'vi';
        const actionNamesVi = {
            'start': 'khởi động',
            'restart': 'khởi động lại',
            'stop': 'dừng'
        };
        const actionNamesEn = {
            'start': 'start',
            'restart': 'restart',
            'stop': 'stop'
        };
        const name = isVi ? (actionNamesVi[action] || action) : (actionNamesEn[action] || action);
        const confirmMsg = isVi ? 'Bạn có chắc muốn dừng Antigravity.exe?' : 'Are you sure you want to stop Antigravity.exe?';
        if (action === 'stop' && !confirm(confirmMsg)) return;

        const infoMsg = isVi ? `Đang ${name} Antigravity...` : `Sending ${action} command to Antigravity...`;
        this.onToast(infoMsg, 'info');
        try {
            const res = await fetch('/api/antigravity/app', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.success) {
                const succMsg = isVi ? `Đã ${name} Antigravity thành công!` : `Antigravity ${action} command succeeded!`;
                this.onToast(succMsg, 'success');
                setTimeout(() => this.loadStatus(), 1200);
            } else {
                const errPrefix = isVi ? `Lỗi ${name} Antigravity` : `Antigravity ${action} error`;
                this.onToast(data.error || errPrefix, 'error');
            }
        } catch (e) {
            const sendErr = isVi ? 'Lỗi gửi lệnh: ' : 'Error sending command: ';
            this.onToast(sendErr + e.message, 'error');
        }
    }

    async sendPrompt() {
        if (!this.promptInput) return;
        const prompt = this.promptInput.value.trim();
        if (!prompt) return;

        const isVi = window.TeleTermI18n && window.TeleTermI18n.getCurrentLanguage() === 'vi';
        const model = this.modelSelect ? this.modelSelect.value : undefined;
        this.promptInput.value = '';
        this.onToast(isVi ? 'Đang gửi lệnh tới Antigravity...' : 'Sending prompt to Antigravity...', 'info');
        if (this.onPulse) this.onPulse();

        try {
            const res = await fetch('/api/antigravity/prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    model: model
                })
            });
            const data = await res.json();
            if (data.success) {
                this.onToast(isVi ? 'Đã nạp prompt vào Antigravity!' : 'Prompt sent to Antigravity!', 'success');
                setTimeout(() => this.loadStatus(), 1000);
            } else {
                const promptErr = isVi ? 'Lỗi gửi prompt tới Antigravity' : 'Error sending prompt to Antigravity';
                this.onToast(data.error || promptErr, 'error');
            }
        } catch (e) {
            const connErr = isVi ? 'Lỗi kết nối Antigravity: ' : 'Antigravity connection error: ';
            this.onToast(connErr + e.message, 'error');
        }
    }

    formatMarkdown(text) {
        if (!text) return '';
        let html = this.escapeHtml(text);
        html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, (match, lang, code) => {
            return `<div class="code-block" style="background:#090b14;border:1px solid rgba(255,255,255,0.08);border-radius:6px;margin:6px 0;padding:8px;font-family:var(--font-mono);font-size:11px;overflow-x:auto;"><div style="color:var(--cyber-cyan);font-size:9px;text-transform:uppercase;margin-bottom:4px;">${lang || 'code'}</div><pre style="margin:0;"><code>${code.trim()}</code></pre></div>`;
        });
        html = html.replace(/`([^`]+)`/g, '<code class="inline-code" style="background:rgba(255,255,255,0.08);padding:1px 4px;border-radius:3px;font-family:var(--font-mono);color:var(--cyber-cyan);">$1</code>');
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n\n/g, '<br><br>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    escapeHtml(text) {
        if (!text) return '';
        return String(text).replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m]));
    }
}
