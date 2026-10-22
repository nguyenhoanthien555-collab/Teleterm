/**
 * TELETERM UNIVERSAL AGENT DECK
 * Monitors and renders all unsupported or third-party AI agents (OpenClaw, Claude Code, Cursor, Aider, etc.)
 * in TeleTerm's unified Cyber-Studio interface with GFM Markdown, Thinking drawers, and Tool badges.
 */

import { MarkdownRenderer } from './markdown-renderer.js';

export class UniversalAgentDeck {
    constructor(options = {}) {
        this.onToast = options.onToast || console.log;

        this.agentsListEl = document.getElementById('universal-agents-list');
        this.turnsContainer = document.getElementById('universal-turns-container');
        this.titleEl = document.getElementById('universal-active-agent-title');
        this.statusBadgeEl = document.getElementById('universal-agent-status-badge');
        this.btnRefresh = document.getElementById('btn-refresh-universal-agents');
        this.filterInput = document.getElementById('universal-agents-filter');

        this.currentAgentType = null;
        this.currentSessionId = null;
        this.detectedAgents = [];
        this.isPanelActive = false;
        this.refreshTimer = null;
        this.isLoadingAgents = false;

        this.isUserScrolledUp = false;
        this.jumpBottomBtn = null;

        this.init();
    }

    init() {
        if (this.btnRefresh) {
            this.btnRefresh.addEventListener('click', () => {
                this.loadAgents(true);
            });
        }

        this.filterInput?.addEventListener('input', () => this.renderAgentsList(this.detectedAgents));

        this.initScrollTracking();
        this.loadAgents(false);
    }

    initScrollTracking() {
        if (!this.turnsContainer) return;

        let jumpBtn = document.getElementById('u-jump-bottom-btn');
        if (!jumpBtn) {
            jumpBtn = document.createElement('button');
            jumpBtn.id = 'u-jump-bottom-btn';
            jumpBtn.type = 'button';
            jumpBtn.className = 'chat-jump-bottom-btn hidden';
            jumpBtn.innerHTML = `<span class="tt-icon tt-icon-14" data-icon="corner-down-left"></span> <span>Latest Messages</span>`;
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

    async loadAgents(notify = false) {
        if (!this.agentsListEl || this.isLoadingAgents) return;
        this.isLoadingAgents = true;
        try {
            const res = await fetch('/api/agents/detected');
            if (!res.ok) throw new Error(`Agent scan failed (${res.status})`);
            const data = await res.json();
            if (data.success && Array.isArray(data.detectedAgents)) {
                this.detectedAgents = data.detectedAgents;
                this.renderAgentsList(this.detectedAgents);
                if (notify) this.onToast('Scanned & updated agent list', 'info');
            } else if (notify) {
                this.onToast(data.error || 'Agent scan failed; showing the last successful results', 'error');
            }
        } catch (e) {
            console.warn('[UniversalAgentDeck] Error scanning agents:', e);
            if (notify) this.onToast('Agent scan failed; showing the last successful results', 'error');
        } finally {
            this.isLoadingAgents = false;
        }
    }

    setPanelActive(active) {
        this.isPanelActive = !!active;
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
        if (this.isPanelActive) {
            this.refreshTimer = setInterval(() => this.loadAgents(false), 30000);
        }
    }

    renderAgentsList(agents) {
        if (!this.agentsListEl) return;
        const scrollTop = this.agentsListEl.scrollTop;
        const query = (this.filterInput?.value || '').trim().toLocaleLowerCase();
        this.agentsListEl.innerHTML = '';

        if (agents.length === 0) {
            this.agentsListEl.innerHTML = `
                <div style="color:var(--text-dim);font-size:11px;padding:16px;">
                    No background agents detected yet.<br>
                    Run Claude, OpenClaw, or Aider on your machine to auto-detect.
                </div>
            `;
            return;
        }

        const visibleAgents = agents.map(agent => {
            const agentMatches = `${agent.name || ''} ${agent.id || ''}`.toLocaleLowerCase().includes(query);
            return {
                ...agent,
                sessions: !query || agentMatches ? (agent.sessions || []) : (agent.sessions || []).filter(session =>
                    `${session.title || ''} ${session.id || ''}`.toLocaleLowerCase().includes(query)
                )
            };
        }).filter(agent => !query || agent.name?.toLocaleLowerCase().includes(query) || agent.id?.toLocaleLowerCase().includes(query) || agent.sessions.length > 0);

        if (visibleAgents.length === 0) {
            this.agentsListEl.innerHTML = '<div style="color:var(--text-dim);font-size:11px;padding:16px;">No agents or sessions match this filter.</div>';
            return;
        }

        visibleAgents.forEach(agent => {
            const group = document.createElement('div');
            group.className = 'universal-agent-group';

            const runningBadge = agent.isRunning 
                ? '<span class="agent-running-pulse">● active</span>' 
                : '<span class="agent-idle-tag">saved</span>';

            const agentIcon = window.TeleTermIcons
                ? window.TeleTermIcons.render('terminal', { size: 14, class: 'tt-icon-accent' })
                : '<span class="tt-icon tt-icon-14" data-icon="terminal"></span>';

            group.innerHTML = `
                <div class="agent-group-header">
                    <span class="agent-icon">${agentIcon}</span>
                    <span class="agent-name">${this.escapeHtml(agent.name)}</span>
                    ${runningBadge}
                </div>
                <div class="agent-sessions-list"></div>
            `;

            const sessContainer = group.querySelector('.agent-sessions-list');
            const sessions = agent.sessions || [];

            if (sessions.length === 0) {
                sessContainer.innerHTML = '<div style="font-size:10px;color:var(--text-dim);padding:6px 12px;">No saved sessions</div>';
            } else {
                sessions.forEach(s => {
                    const item = document.createElement('div');
                    const isActive = this.currentAgentType === agent.id && this.currentSessionId === s.id;
                    item.className = `universal-session-item ${isActive ? 'active' : ''}`;
                    item.innerHTML = `
                        <span class="u-sess-title" title="${this.escapeHtml(s.title || s.id)}">${this.escapeHtml(s.title || s.id)}</span>
                        <span class="u-sess-size">${s.sizeKB || 1}KB</span>
                    `;

                    item.addEventListener('click', () => {
                        this.currentAgentType = agent.id;
                        this.currentSessionId = s.id;
                        this.renderAgentsList(agents);
                        this.loadSession(agent.id, s.id, s.title || agent.name);
                    });

                    sessContainer.appendChild(item);
                });
            }

            this.agentsListEl.appendChild(group);
        });
        this.agentsListEl.scrollTop = scrollTop;

        if (window.TeleTermIcons) {
            window.TeleTermIcons.hydrate(this.agentsListEl);
        }

        // Auto-select first session if none selected
        if (!this.currentSessionId && agents.length > 0 && agents[0].sessions?.length > 0) {
            const first = agents[0];
            const firstSess = first.sessions[0];
            this.currentAgentType = first.id;
            this.currentSessionId = firstSess.id;
            this.loadSession(first.id, firstSess.id, firstSess.title || first.name);
        }
    }

    async loadSession(agentType, sessionId, title = '') {
        if (!this.turnsContainer) return;
        this.isUserScrolledUp = false;
        if (this.jumpBottomBtn) this.jumpBottomBtn.classList.add('hidden');

        if (this.titleEl) {
            this.titleEl.innerHTML = `<span class="tt-icon tt-icon-16 tt-icon-accent" data-icon="globe"></span> <span>${this.escapeHtml(title || sessionId)}</span>`;
        }
        if (this.statusBadgeEl) {
            this.statusBadgeEl.textContent = agentType.toUpperCase();
            this.statusBadgeEl.className = 'acc-badge badge-active';
        }

        this.turnsContainer.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:40px;color:var(--text-dim);font-size:12px;">
                <span class="loading-orb"><span class="tt-icon tt-icon-16 tt-icon-accent" data-icon="orbit"></span></span> Loading ${agentType} session data...
            </div>
        `;

        try {
            const res = await fetch(`/api/agents/${encodeURIComponent(agentType)}/${encodeURIComponent(sessionId)}/messages`);
            const data = await res.json();
            if (data.success && Array.isArray(data.messages)) {
                this.renderSessionTurns(data.messages, true);
            } else {
                this.turnsContainer.innerHTML = `<div style="padding:24px;color:var(--text-dim);font-size:12px;">${data.error || 'No readable messages in this transcript.'}</div>`;
            }
        } catch (e) {
            this.turnsContainer.innerHTML = `<div style="padding:24px;color:var(--cyber-rose);font-size:12px;">Error loading agent messages: ${e.message}</div>`;
        }
    }

    renderSessionTurns(messages, forceScroll = false) {
        if (!this.turnsContainer) return;
        const wasScrolledUp = this.isUserScrolledUp;
        const prevScrollTop = this.turnsContainer.scrollTop;
        this.turnsContainer.innerHTML = '';

        if (messages.length === 0) {
            this.turnsContainer.innerHTML = '<div style="padding:30px;color:var(--text-dim);text-align:center;">No messages recorded in this session</div>';
            return;
        }

        messages.forEach(msg => {
            const turn = document.createElement('div');
            const isUser = msg.role === 'user';
            turn.className = `universal-turn ${isUser ? 'user-turn' : 'agent-turn'}`;

            const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';

            if (isUser) {
                turn.innerHTML = `
                    <div class="u-bubble user">
                        <div class="bubble-header"><span class="user-label-wrap"><span class="tt-icon tt-icon-14" data-icon="users"></span> USER</span><span>${timeStr}</span></div>
                        <div class="bubble-text">${this.escapeHtml(msg.content).replace(/\n/g, '<br>')}</div>
                    </div>
                `;
            } else {
                let thoughtHtml = '';
                if (msg.thinking && msg.thinking.trim()) {
                    thoughtHtml = `
                        <details class="agy-thought-drawer">
                            <summary class="agy-thought-summary">
                                <span class="tt-icon tt-icon-14 tt-icon-accent" data-icon="sparkles"></span> <span>Thought for ${msg.thinkingDuration || 8}s</span> <span>▾</span>
                            </summary>
                            <div class="agy-thought-content">${MarkdownRenderer.render(msg.thinking)}</div>
                        </details>
                    `;
                }

                turn.innerHTML = `
                    <div class="u-bubble agent">
                        <div class="bubble-header"><span class="agent-label-wrap"><span class="tt-icon tt-icon-14 tt-icon-accent" data-icon="terminal"></span> AGENT</span><span>${timeStr}</span></div>
                        ${thoughtHtml}
                        <div class="bubble-text">${MarkdownRenderer.render(msg.content)}</div>
                    </div>
                `;
            }

            this.turnsContainer.appendChild(turn);
        });

        // Hydrate SVG icons
        if (window.TeleTermIcons) {
            window.TeleTermIcons.hydrate(this.turnsContainer);
        }

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

    escapeHtml(text = '') {
        return String(text).replace(/[&<>"']/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
    }
}
