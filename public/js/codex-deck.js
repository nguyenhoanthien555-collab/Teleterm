/**
 * TELETERM CODEX 3D DECK CONTROLLER
 * Sidebar projects & threads, conversation turns with collapsible commands, diff badges, and prompt injection
 */

import { MarkdownRenderer } from './markdown-renderer.js';

export class CodexDeck {
    constructor(options = {}) {
        this.onToast = options.onToast || console.log;
        this.onPulse = options.onPulse || null;

        this.deckEl = document.getElementById('deck-codex-screen');
        this.threadsListEl = document.getElementById('codex-threads-list');
        this.turnsContainer = document.getElementById('codex-turns-container');
        this.inputEl = document.getElementById('codex-prompt-input');
        this.sendBtn = document.getElementById('btn-codex-send');
        this.modelSelect = document.getElementById('codex-model-select');
        this.activeThreadTitleEl = document.getElementById('codex-active-thread-title');
        this.diffBadgeEl = document.getElementById('codex-diff-summary');

        this.currentThreadId = null;
        this.pollTimer = null;
        this.isWorking = false;

        this.isUserScrolledUp = false;
        this.jumpBottomBtn = null;

        this.init();
    }

    init() {
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendPrompt());
        }

        if (this.inputEl) {
            this.inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendPrompt();
                }
            });
        }

        const btnRefreshSidebar = document.getElementById('btn-codex-refresh-sidebar');
        if (btnRefreshSidebar) {
            btnRefreshSidebar.addEventListener('click', () => this.loadSidebar(true));
        }

        this.initScrollTracking();
        this.loadSidebar(false);
    }

    initScrollTracking() {
        if (!this.turnsContainer) return;

        let jumpBtn = document.getElementById('codex-jump-bottom-btn');
        if (!jumpBtn) {
            jumpBtn = document.createElement('button');
            jumpBtn.id = 'codex-jump-bottom-btn';
            jumpBtn.type = 'button';
            jumpBtn.className = 'chat-jump-bottom-btn hidden';
            jumpBtn.innerHTML = `<span>⬇</span> <span>Latest Messages</span>`;
            jumpBtn.title = 'Scroll to latest messages';
            jumpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.isUserScrolledUp = false;
                jumpBtn.classList.add('hidden');
                this.scrollToBottom(true);
            });
            const parent = this.turnsContainer.parentElement;
            if (parent) {
                parent.style.position = 'relative';
                parent.appendChild(jumpBtn);
            }
        }
        this.jumpBottomBtn = jumpBtn;

        this.turnsContainer.addEventListener('scroll', () => {
            const threshold = 120;
            const distFromBottom = this.turnsContainer.scrollHeight - this.turnsContainer.scrollTop - this.turnsContainer.clientHeight;
            const scrolledUp = distFromBottom > threshold;
            this.isUserScrolledUp = scrolledUp;
            if (this.jumpBottomBtn) {
                this.jumpBottomBtn.classList.toggle('hidden', !scrolledUp);
            }
        }, { passive: true });
    }

    async loadSidebar(notify = false) {
        try {
            const res = await fetch('/api/codex/sidebar');
            if (!res.ok) return;
            const data = await res.json();
            if (data.success) {
                this.renderSidebar(data);
                if (!this.currentThreadId && data.currentThreadId) {
                    this.currentThreadId = data.currentThreadId;
                    this.loadThread(this.currentThreadId);
                }
                if (notify) this.onToast('Updated Codex threads list', 'info');
            }
        } catch (e) {
            console.warn('[Codex Sidebar Error]', e);
        }
    }

    renderSidebar(data) {
        if (!this.threadsListEl) return;
        this.threadsListEl.innerHTML = '';

        const threads = data.threads || data.recents || [];
        if (threads.length === 0) {
            this.threadsListEl.innerHTML = '<div style="color:var(--text-dim);font-size:11px;padding:12px;">No Codex sessions found</div>';
            return;
        }

        threads.forEach(t => {
            const item = document.createElement('div');
            item.className = `codex-thread-item ${t.id === this.currentThreadId ? 'active' : ''}`;
            
            const badge = t.badge === 'purple' ? '<span class="codex-badge-purple">Phase 5A</span>' : '';
            const spinner = t.isActive ? '<span class="codex-thread-spinner"></span>' : '';

            const threadIcon = window.TeleTermIcons ? window.TeleTermIcons.render('circle-dot', { size: 12 }) : '';
            item.innerHTML = `
                <span class="codex-thread-icon">${threadIcon}</span>
                <span class="codex-thread-name" title="${this.escapeHtml(t.rawTitle || t.title)}">${this.escapeHtml(t.title)}</span>
                ${spinner}
                ${badge}
            `;

            item.addEventListener('click', () => {
                this.currentThreadId = t.id;
                this.renderSidebar(data);
                this.loadThread(t.id);
            });

            this.threadsListEl.appendChild(item);
        });
    }

    async loadThread(threadId) {
        if (!threadId || !this.turnsContainer) return;
        this.isUserScrolledUp = false;
        if (this.jumpBottomBtn) this.jumpBottomBtn.classList.add('hidden');
        this.turnsContainer.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:40px;color:var(--text-dim);font-size:12px;">
                <span class="codex-spinner"></span> Loading Codex session...
            </div>
        `;

        try {
            const res = await fetch(`/api/codex/threads/${threadId}`);
            if (!res.ok) return;
            const data = await res.json();
            if (data.success && data.thread) {
                this.renderThread(data.thread, true);
                this.checkAutoPoll(data.thread);
            }
        } catch (e) {
            this.turnsContainer.innerHTML = '<div style="padding:20px;color:var(--cyber-rose);font-size:12px;">Error loading session</div>';
        }
    }

    renderThread(thread, forceScroll = false) {
        if (this.activeThreadTitleEl) {
            const threadDot = window.TeleTermIcons ? window.TeleTermIcons.render('circle-dot', { size: 12 }) : '';
            this.activeThreadTitleEl.innerHTML = `${threadDot} <span>${this.escapeHtml(thread.title || 'Codex Session')}</span>`;
        }
        const wasScrolledUp = this.isUserScrolledUp;
        const prevScrollTop = this.turnsContainer.scrollTop;

        // File diff summary
        if (this.diffBadgeEl) {
            if (thread.fileSummary && thread.fileSummary.filesCount > 0) {
                const folderIcon = window.TeleTermIcons ? window.TeleTermIcons.render('folder', { size: 12 }) : '';
                this.diffBadgeEl.style.display = 'inline-flex';
                this.diffBadgeEl.innerHTML = `
                    <span style="display:inline-flex;align-items:center;gap:4px;">${folderIcon} ${thread.fileSummary.filesCount} files</span>
                    <span style="color:var(--cyber-emerald);font-weight:700;">+${thread.fileSummary.additions || 0}</span>
                    <span style="color:var(--cyber-rose);font-weight:700;">-${thread.fileSummary.deletions || 0}</span>
                `;
            } else {
                this.diffBadgeEl.style.display = 'none';
            }
        }

        if (!this.turnsContainer || !Array.isArray(thread.turns)) return;
        this.turnsContainer.innerHTML = '';

        if (thread.turns.length === 0) {
            this.turnsContainer.innerHTML = '<div style="color:var(--text-dim);font-size:12px;padding:30px;text-align:center;">No messages in this session yet</div>';
            return;
        }

        thread.turns.forEach(turn => {
            if (!turn.items || turn.items.length === 0) return;

            let i = 0;
            while (i < turn.items.length) {
                const item = turn.items[i];
                if (item.type === 'user') {
                    const text = (item.text || '').trim();
                    if (text) {
                        const userDiv = document.createElement('div');
                        userDiv.className = 'codex-turn-user';
                        userDiv.innerHTML = `<div class="turn-bubble user">${this.escapeHtml(text).replace(/\n/g, '<br>')}</div>`;
                        this.turnsContainer.appendChild(userDiv);
                    }
                    i++;
                } else if (item.type === 'assistant') {
                    const rawText = (item.text || '').trim();
                    if (rawText) {
                        const rendered = MarkdownRenderer.render(rawText).trim();
                        if (rendered) {
                            const assistDiv = document.createElement('div');
                            assistDiv.className = 'codex-turn-assistant';
                            assistDiv.innerHTML = `<div class="turn-bubble assistant">${rendered}</div>`;
                            this.turnsContainer.appendChild(assistDiv);
                        }
                    }
                    i++;
                } else if (item.type === 'command' || item.type === 'thought') {
                    // Gather all intermediate execution & reasoning steps
                    const execItems = [];
                    while (i < turn.items.length && (turn.items[i].type === 'command' || turn.items[i].type === 'thought')) {
                        execItems.push(turn.items[i]);
                        i++;
                    }

                    const cmdItems = execItems.filter(x => x.type === 'command');
                    if (cmdItems.length === 1) {
                        this.turnsContainer.appendChild(this.createCommandCard(cmdItems[0]));
                    } else if (cmdItems.length > 1) {
                        const successCount = cmdItems.filter(c => c.exitCode === 0).length;
                        const groupDiv = document.createElement('div');
                        groupDiv.className = 'codex-cmd-group';
                        const zapSvg = window.TeleTermIcons ? window.TeleTermIcons.render('zap', { size: 12 }) : '';
                        groupDiv.innerHTML = `
                            <div class="codex-cmd-group-header">
                                <span class="codex-cmd-group-icon">${zapSvg}</span>
                                <span class="codex-cmd-group-title">Executed ${cmdItems.length} background commands</span>
                                <span class="codex-cmd-group-count">${successCount}/${cmdItems.length} passed</span>
                                <span class="codex-cmd-group-chevron">▾</span>
                            </div>
                            <div class="codex-cmd-group-body"></div>
                        `;
                        const groupBody = groupDiv.querySelector('.codex-cmd-group-body');
                        cmdItems.forEach(cmd => {
                            groupBody.appendChild(this.createCommandCard(cmd));
                        });

                        const groupHeader = groupDiv.querySelector('.codex-cmd-group-header');
                        groupHeader.addEventListener('click', () => {
                            groupDiv.classList.toggle('open');
                        });

                        this.turnsContainer.appendChild(groupDiv);
                    }
                } else {
                    i++;
                }
            }
        });

        // Bind interactive copy & run buttons
        MarkdownRenderer.bindInteractiveButtons(this.turnsContainer);

        // Maintain scroll position if reading, or smoothly pin to bottom
        if (forceScroll || !wasScrolledUp) {
            this.scrollToBottom(forceScroll);
        } else {
            this.turnsContainer.scrollTop = prevScrollTop;
            if (this.jumpBottomBtn) {
                this.jumpBottomBtn.classList.remove('hidden');
            }
        }
    }

    createCommandCard(item) {
        const cmdDiv = document.createElement('div');
        cmdDiv.className = 'codex-cmd-card';
        const exitCode = item.exitCode;
        const isSuccess = exitCode === 0;
        const exitBadge = exitCode !== undefined 
            ? `<span class="cmd-exit-badge ${isSuccess ? 'success' : 'fail'}">exit ${exitCode}</span>` 
            : '<span class="cmd-exit-badge running">⧖ running</span>';

        const rawCmd = (item.command || '').trim();
        let cmdDisplay = rawCmd;
        const pwshMatch = rawCmd.match(/-Command\s+'(.+?)'\s*$/s) || rawCmd.match(/-Command\s+"(.+?)"\s*$/s);
        if (pwshMatch) cmdDisplay = pwshMatch[1].trim();
        if (cmdDisplay.length > 90) cmdDisplay = cmdDisplay.substring(0, 88) + '…';

        const outputText = item.output || item.aggregatedOutput || 'No output recorded';

        const statusIcon = window.TeleTermIcons
            ? (isSuccess ? window.TeleTermIcons.render('check', { size: 12 }) : window.TeleTermIcons.render('zap', { size: 12 }))
            : (isSuccess ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>');

        cmdDiv.innerHTML = `
            <div class="cmd-card-header">
                <span class="cmd-icon">${statusIcon}</span>
                <span class="cmd-code-text" title="${this.escapeHtml(rawCmd)}">${this.escapeHtml(cmdDisplay || 'Command execution')}</span>
                ${exitBadge}
                <span class="cmd-chevron">▾</span>
            </div>
            <div class="cmd-card-body">
                <pre>${this.escapeHtml(outputText)}</pre>
            </div>
        `;

        const header = cmdDiv.querySelector('.cmd-card-header');
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            cmdDiv.classList.toggle('open');
        });

        return cmdDiv;
    }

    scrollToBottom(force = false) {
        if (!this.turnsContainer) return;
        if (this.isUserScrolledUp && !force) return;
        requestAnimationFrame(() => {
            if (!this.turnsContainer) return;
            this.turnsContainer.scrollTop = this.turnsContainer.scrollHeight;
            setTimeout(() => {
                if (this.turnsContainer && (!this.isUserScrolledUp || force)) {
                    this.turnsContainer.scrollTop = this.turnsContainer.scrollHeight;
                }
            }, 80);
        });
    }

    checkAutoPoll(thread) {
        if (this.pollTimer) clearInterval(this.pollTimer);
        if (thread.isWorking) {
            this.isWorking = true;
            this.pollTimer = setInterval(async () => {
                try {
                    const res = await fetch(`/api/codex/threads/${this.currentThreadId}`);
                    const data = await res.json();
                    if (data.success && data.thread) {
                        this.renderThread(data.thread, false);
                        if (!data.thread.isWorking) {
                            this.isWorking = false;
                            clearInterval(this.pollTimer);
                        }
                    }
                } catch (e) {}
            }, 2500);
        } else {
            this.isWorking = false;
        }
    }

    async sendPrompt() {
        if (!this.inputEl) return;
        const prompt = this.inputEl.value.trim();
        if (!prompt) return;

        this.isUserScrolledUp = false;
        if (this.jumpBottomBtn) this.jumpBottomBtn.classList.add('hidden');
        this.scrollToBottom(true);

        const model = this.modelSelect ? this.modelSelect.value : undefined;
        this.inputEl.value = '';
        this.onToast('Prompt sent to Codex...', 'info');
        if (this.onPulse) this.onPulse();

        window.dispatchEvent(new CustomEvent('teleterm:ai-prompt', { detail: { tool: 'codex', prompt } }));

        try {
            const res = await fetch('/api/codex/prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    threadId: this.currentThreadId,
                    model: model
                })
            });
            const data = await res.json();
            if (data.success) {
                this.onToast('Codex is processing...', 'success');
                setTimeout(() => this.loadThread(this.currentThreadId), 800);
            } else {
                this.onToast(data.error || 'Error sending Codex prompt', 'error');
            }
        } catch (e) {
            this.onToast('Prompt error: ' + e.message, 'error');
        }
    }

    formatMarkdown(text) {
        if (!text) return '';
        // Fast lightweight markdown parser for code blocks, bold, inline code
        let html = this.escapeHtml(text);
        html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, (match, lang, code) => {
            return `<div class="code-block"><div class="code-lang">${lang || 'code'}</div><pre><code>${code.trim()}</code></pre></div>`;
        });
        html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n\n/g, '<br><br>');
        return html;
    }

    escapeHtml(text) {
        if (!text) return '';
        return text.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m]));
    }
}
