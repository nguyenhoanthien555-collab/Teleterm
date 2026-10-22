/**
 * TELETERM ANTIGRAVITY WEB CHAT CONTROLLER
 * 100% Interactive Web Chat with Live Real-time Sync & Photo Attachments.
 * - Real-time stream & live status telemetry (Executing, Thinking, Choice question, Plan approval).
 * - Multi-image uploader (Camera, File picker, Clipboard Paste Ctrl+V, Drag & Drop).
 * - High-res Lightbox preview for photos and screenshots.
 * - Continuous background sync loop (no premature timer kill).
 */

import { MarkdownRenderer } from './markdown-renderer.js';

export class AntigravityWebChat {
    constructor(options = {}) {
        this.onToast = options.onToast || console.log;
        this.onPulse = options.onPulse || null;

        // Container elements
        this.containerEl = document.getElementById('panel-antigravity');
        this.chatFeedEl = document.getElementById('agy-web-chat-feed');
        this.promptInput = document.getElementById('agy-web-prompt-input');
        this.btnSend = document.getElementById('btn-agy-web-send');
        this.modelSelect = document.getElementById('agy-web-model-select');
        this.btnNewSession = document.getElementById('btn-agy-new-session');
        this.btnToggleSessions = document.getElementById('btn-agy-toggle-sessions');
        this.sessionsDrawer = document.getElementById('agy-sessions-drawer');
        this.sessionsListEl = document.getElementById('agy-web-sessions-list');
        this.currentSessionTitleEl = document.getElementById('agy-active-session-title');

        // Header Quota pills
        this.quota5hPill = document.getElementById('agy-web-quota-5h');
        this.quotaCreditsPill = document.getElementById('agy-web-credits');
        this.quotaProfilePill = document.getElementById('agy-web-profile');

        // Live Telemetry Bar elements
        this.liveStatusBar = document.getElementById('agy-live-status-bar');
        this.livePulseDot = document.getElementById('agy-live-pulse-dot');
        this.liveStatusText = document.getElementById('agy-live-status-text');
        this.liveStepBadge = document.getElementById('agy-live-step-badge');

        // Photo / Attachment controls
        this.btnAttachPhoto = document.getElementById('btn-agy-attach-photo');
        this.inputPhoto = document.getElementById('input-agy-photo');
        this.attachedPreviewDock = document.getElementById('agy-attached-preview-dock');

        // Image Lightbox elements
        this.lightboxModal = document.getElementById('modal-image-lightbox');
        this.lightboxImg = document.getElementById('lightbox-img');
        this.lightboxClose = document.getElementById('btn-lightbox-close');

        this.currentSessionId = null;
        this.currentSessionTitle = 'New Session';
        this.conversations = [];
        this.isWaitingResponse = false;
        this.quotaTimer = null;
        this.liveSyncTimer = null;

        this.attachedFiles = []; // Array of { file, name, size, type, dataUrl }
        this.lastMessagesFingerprint = '';
        this.isSyncing = false;

        // User scroll tracking state
        this.isUserScrolledUp = false;
        this.jumpBottomBtn = null;

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
            // Auto-expand input height
            this.promptInput.addEventListener('input', () => {
                this.promptInput.style.height = 'auto';
                this.promptInput.style.height = Math.min(this.promptInput.scrollHeight, 140) + 'px';
            });
        }

        if (this.btnNewSession) {
            this.btnNewSession.addEventListener('click', () => this.startNewSession());
        }

        if (this.btnToggleSessions) {
            this.btnToggleSessions.addEventListener('click', () => this.toggleSessionsDrawer());
        }

        // Close drawer when clicking outside
        document.addEventListener('click', (e) => {
            if (this.sessionsDrawer && !this.sessionsDrawer.classList.contains('hidden')) {
                if (!this.sessionsDrawer.contains(e.target) && (!this.btnToggleSessions || !this.btnToggleSessions.contains(e.target))) {
                    this.sessionsDrawer.classList.add('hidden');
                }
            }
        });

        // Quick prompt suggestions
        document.querySelectorAll('.agy-quick-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                if (this.promptInput) {
                    this.promptInput.value = chip.dataset.prompt || chip.textContent;
                    this.promptInput.focus();
                }
            });
        });

        // Slash command suggestions (/plan, /grill-me, /boost, /goal, etc.)
        document.querySelectorAll('.agy-slash-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.promptInput) {
                    const cmd = btn.dataset.cmd || btn.textContent.trim();
                    const cur = this.promptInput.value.trim();
                    this.promptInput.value = cur ? `${cmd} ${cur}` : `${cmd} `;
                    this.promptInput.focus();
                }
            });
        });

        // Initialize Photo Upload & Clipboard Paste System
        this.initPhotoUploader();

        // Initialize Lightbox Modal
        this.initLightbox();

        this.loadInitialData();

        // Start Quota Poller
        this.quotaTimer = setInterval(() => this.fetchQuota(), 25000);

        // Start Real-Time Continuous Live Sync Loop (Every 1.6s)
        this.startContinuousLiveSync();
    }

    /* ==================== PHOTO ATTACHMENT SYSTEM ==================== */

    initPhotoUploader() {
        // 1. Button click triggers native file picker / camera
        if (this.btnAttachPhoto && this.inputPhoto) {
            this.btnAttachPhoto.addEventListener('click', () => {
                this.inputPhoto.value = '';
                this.inputPhoto.click();
            });
        }

        // 2. File input change
        if (this.inputPhoto) {
            this.inputPhoto.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    this.handleFilesSelected(Array.from(e.target.files));
                }
            });
        }

        // 3. Clipboard Paste handler (Ctrl+V with screenshots)
        window.addEventListener('paste', (e) => {
            // Only capture paste if Antigravity panel is visible
            if (this.containerEl && this.containerEl.classList.contains('hidden')) return;

            const items = e.clipboardData?.items;
            if (!items) return;

            const imageFiles = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type && items[i].type.startsWith('image/')) {
                    const blob = items[i].getAsFile();
                    if (blob) imageFiles.push(blob);
                }
            }

            if (imageFiles.length > 0) {
                e.preventDefault();
                this.handleFilesSelected(imageFiles);
                this.onToast(`Pasted ${imageFiles.length} image(s) from clipboard!`, 'info');
            }
        });

        // 4. Drag and Drop handlers
        if (this.containerEl) {
            this.containerEl.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            this.containerEl.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer?.files?.length > 0) {
                    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                    if (files.length > 0) {
                        this.handleFilesSelected(files);
                        this.onToast(`Attached ${files.length} image(s) via drag & drop!`, 'info');
                    }
                }
            });
        }

        // Initialize smart scroll tracking
        this.initScrollTracking();
    }

    initScrollTracking() {
        if (!this.chatFeedEl) return;

        let jumpBtn = document.getElementById('agy-jump-bottom-btn');
        if (!jumpBtn) {
            jumpBtn = document.createElement('button');
            jumpBtn.id = 'agy-jump-bottom-btn';
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
            const parent = this.chatFeedEl.parentElement || this.containerEl;
            if (parent) {
                parent.style.position = 'relative';
                parent.appendChild(jumpBtn);
            }
        }
        this.jumpBottomBtn = jumpBtn;

        this.chatFeedEl.addEventListener('scroll', () => {
            const threshold = 120;
            const distFromBottom = this.chatFeedEl.scrollHeight - this.chatFeedEl.scrollTop - this.chatFeedEl.clientHeight;
            const scrolledUp = distFromBottom > threshold;
            this.isUserScrolledUp = scrolledUp;
            if (this.jumpBottomBtn) {
                this.jumpBottomBtn.classList.toggle('hidden', !scrolledUp);
            }
        }, { passive: true });
    }

    async handleFilesSelected(files) {
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            if (file.size > 20 * 1024 * 1024) {
                this.onToast(`File ${file.name} exceeds 20MB limit`, 'error');
                continue;
            }

            const dataUrl = await this.readFileAsDataUrl(file);
            this.attachedFiles.push({
                file,
                name: file.name || `photo_${Date.now()}.png`,
                size: file.size,
                type: file.type || 'image/png',
                dataUrl
            });
        }

        this.renderAttachedPreview();
        if (this.promptInput) this.promptInput.focus();
    }

    readFileAsDataUrl(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
        });
    }

    renderAttachedPreview() {
        if (!this.attachedPreviewDock) return;

        if (this.attachedFiles.length === 0) {
            this.attachedPreviewDock.classList.add('hidden');
            this.attachedPreviewDock.innerHTML = '';
            return;
        }

        this.attachedPreviewDock.classList.remove('hidden');
        this.attachedPreviewDock.innerHTML = '';

        this.attachedFiles.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'agy-attached-preview-card';
            const sizeKb = Math.round(item.size / 1024);

                const removeIcon = window.TeleTermIcons ? window.TeleTermIcons.render('x', { size: 10 }) : '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
                card.innerHTML = `
                    <img src="${item.dataUrl}" class="agy-attached-preview-img" alt="Thumbnail">
                    <div class="agy-attached-preview-info">
                        <span class="agy-attached-preview-name" title="${this.escapeHtml(item.name)}">${this.escapeHtml(item.name)}</span>
                        <span class="agy-attached-preview-size">${sizeKb} KB</span>
                    </div>
                    <button class="agy-attached-remove-btn" title="Remove" data-idx="${index}">${removeIcon}</button>
                `;

            card.querySelector('.agy-attached-remove-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeAttachedFile(index);
            });

            // Click preview thumbnail to view enlarged
            card.querySelector('.agy-attached-preview-img').addEventListener('click', () => {
                this.openLightbox(item.dataUrl);
            });

            this.attachedPreviewDock.appendChild(card);
        });
    }

    removeAttachedFile(index) {
        this.attachedFiles.splice(index, 1);
        this.renderAttachedPreview();
    }

    /* ==================== LIGHTBOX MODAL ==================== */

    initLightbox() {
        if (this.lightboxClose && this.lightboxModal) {
            this.lightboxClose.addEventListener('click', () => this.closeLightbox());
            this.lightboxModal.addEventListener('click', (e) => {
                if (e.target === this.lightboxModal) this.closeLightbox();
            });
        }
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.lightboxModal && !this.lightboxModal.classList.contains('hidden')) {
                this.closeLightbox();
            }
        });
    }

    openLightbox(imgSrc) {
        if (!this.lightboxModal || !this.lightboxImg) return;
        this.lightboxImg.src = imgSrc;
        this.lightboxModal.style.display = 'flex';
        this.lightboxModal.classList.remove('hidden');
    }

    closeLightbox() {
        if (!this.lightboxModal) return;
        this.lightboxModal.style.display = 'none';
        this.lightboxModal.classList.add('hidden');
        if (this.lightboxImg) this.lightboxImg.src = '';
    }

    /* ==================== REAL-TIME CONTINUOUS SYNC ENGINE ==================== */

    startContinuousLiveSync() {
        if (this.liveSyncTimer) clearInterval(this.liveSyncTimer);

        this.liveSyncTimer = setInterval(async () => {
            // Only perform active sync if Antigravity panel is displayed
            if (this.containerEl && this.containerEl.classList.contains('hidden')) return;
            if (this.isSyncing) return;

            this.isSyncing = true;
            try {
                await Promise.all([
                    this.syncLiveSessionProgress(),
                    this.syncMessagesRealtime()
                ]);
            } catch (e) {
                // Ignore silent sync glitches
            } finally {
                this.isSyncing = false;
            }
        }, 1600);
    }

    async syncLiveSessionProgress() {
        try {
            const url = this.currentSessionId 
                ? `/api/antigravity/live-session?sessionId=${encodeURIComponent(this.currentSessionId)}` 
                : '/api/antigravity/live-session';
            const res = await fetch(url);
            if (!res.ok) return;
            const data = await res.json();
            if (!data || !data.success) return;

            // If the server progress belongs to a different conversation, do not contaminate this conversation's UI
            if (this.currentSessionId && data.conversationId && data.conversationId !== this.currentSessionId) {
                return;
            }

            // Update live status bar UI
            if (this.liveStatusText) {
                const stepNum = data.currentStep || 'Sync';
                if (this.liveStepBadge) {
                    this.liveStepBadge.textContent = (data.statusType === 'running' || data.statusType === 'thinking') 
                        ? `Step ${stepNum}` 
                        : 'Ready';
                }

                if (data.statusType === 'running') {
                    if (this.livePulseDot) {
                        this.livePulseDot.className = 'live-pulse-dot running';
                    }
                    const actionName = data.lastAction?.summary || data.lastAction?.action || 'Executing tools...';
                    this.liveStatusText.textContent = `Executing: ${actionName}`;
                    this.showTypingIndicator(`Executing: ${actionName}`);
                } else if (data.statusType === 'thinking') {
                    if (this.livePulseDot) {
                        this.livePulseDot.className = 'live-pulse-dot thinking';
                    }
                    this.liveStatusText.textContent = 'Antigravity is thinking & analyzing...';
                    this.showTypingIndicator('Antigravity is thinking & analyzing...');
                } else if (data.statusType === 'waiting_interactive_question') {
                    if (this.livePulseDot) {
                        this.livePulseDot.className = 'live-pulse-dot waiting';
                    }
                    this.liveStatusText.textContent = 'Waiting for your choice (/grill-me)';
                    this.hideTypingIndicator();
                } else if (data.statusType === 'waiting_plan_approval') {
                    if (this.livePulseDot) {
                        this.livePulseDot.className = 'live-pulse-dot waiting';
                    }
                    this.liveStatusText.textContent = 'Waiting for plan approval';
                    this.hideTypingIndicator();
                } else {
                    if (this.livePulseDot) {
                        this.livePulseDot.className = 'live-pulse-dot';
                    }
                    this.liveStatusText.textContent = 'Antigravity Engine Ready';
                    this.hideTypingIndicator();
                    this.isWaitingResponse = false;
                }
            }
        } catch (e) {}
    }

    async syncMessagesRealtime() {
        if (!this.currentSessionId) return;

        try {
            const res = await fetch(`/api/antigravity/session/${encodeURIComponent(this.currentSessionId)}/messages`);
            if (!res.ok) return;
            const data = await res.json();
            if (!data.success || !Array.isArray(data.messages)) return;

            // Generate fingerprint to avoid unnecessary re-rendering
            const lastMsg = data.messages[data.messages.length - 1];
            const fingerprint = `${data.messages.length}_${lastMsg ? lastMsg.id + '_' + (lastMsg.content || '').length + '_' + (lastMsg.tools?.length || 0) : '0'}`;

            if (fingerprint !== this.lastMessagesFingerprint) {
                this.lastMessagesFingerprint = fingerprint;
                this.renderChatFeed(data.messages, false);
            }
        } catch (e) {}
    }

    /* ==================== INITIAL DATA & SESSIONS ==================== */

    async loadInitialData() {
        await Promise.all([
            this.loadSessionsAndStatus(),
            this.fetchQuota()
        ]);
    }

    async loadSessionsAndStatus() {
        try {
            const res = await fetch('/api/antigravity/status');
            if (!res.ok) return;
            const data = await res.json();
            if (data.success) {
                // Models
                if (this.modelSelect && Array.isArray(data.models) && this.modelSelect.children.length === 0) {
                    this.modelSelect.innerHTML = '';
                    data.models.forEach(m => {
                        const opt = document.createElement('option');
                        opt.value = m.id;
                        opt.textContent = m.name;
                        if (m.name.includes('3.8 Flash High') || m.id.includes('3.8-flash-high')) {
                            opt.selected = true;
                        }
                        this.modelSelect.appendChild(opt);
                    });
                }

                // Profile
                const app = data.status?.app || {};
                if (this.quotaProfilePill && app.activeProfile) {
                    const p = app.activeProfile;
                    const email = p.email || p.name || 'Google Account';
                    this.quotaProfilePill.textContent = email.length > 22 ? email.substring(0, 20) + '…' : email;
                    this.quotaProfilePill.title = email;
                }

                // Conversations
                if (Array.isArray(data.conversations) && data.conversations.length > 0) {
                    this.conversations = data.conversations;
                    this.renderSessionsList();
                    // Auto-load most recent session if none selected
                    if (!this.currentSessionId) {
                        this.switchSession(data.conversations[0]);
                    }
                } else {
                    this.renderEmptyState('Start your first conversation with Antigravity!');
                }
            }
        } catch (e) {
            console.warn('[Antigravity Web Chat] Load status error:', e);
        }
    }

    async fetchQuota() {
        try {
            const res = await fetch('/api/antigravity/quota');
            if (!res.ok) return;
            const data = await res.json();
            if (data.success) {
                // 1. Credits
                if (this.quotaCreditsPill && data.account) {
                    const zapIcon = window.TeleTermIcons ? window.TeleTermIcons.render('zap', { size: 11 }) : '';
                    this.quotaCreditsPill.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;">${zapIcon} <span>${data.account.promptCredits || 500} credits</span></span>`;
                }

                // 2. 5h Rolling Limit
                if (this.quota5hPill && Array.isArray(data.modelQuotas)) {
                    let activeModel = null;
                    for (const m of data.modelQuotas) {
                        if (m.resetHours > 0) {
                            if (!activeModel || m.resetHours < activeModel.resetHours) {
                                activeModel = m;
                            }
                        }
                    }
                    const clockIcon = window.TeleTermIcons ? window.TeleTermIcons.render('clock', { size: 11 }) : '';
                    if (activeModel) {
                        this.quota5hPill.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;">${clockIcon} <span>5h: ${activeModel.remainingPercent}% (Resets in ${activeModel.resetHours}h)</span></span>`;
                        this.quota5hPill.className = activeModel.remainingPercent < 30 ? 'agy-pill pill-warning' : 'agy-pill pill-cyan';
                    } else {
                        this.quota5hPill.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;">${clockIcon} <span>5h: 100% Ready</span></span>`;
                        this.quota5hPill.className = 'agy-pill pill-cyan';
                    }
                }
            }
        } catch (e) {}
    }

    renderSessionsList() {
        if (!this.sessionsListEl) return;
        this.sessionsListEl.innerHTML = '';

        this.conversations.slice(0, 15).forEach(c => {
            const item = document.createElement('div');
            const isActive = this.currentSessionId === c.id;
            item.className = `agy-sess-drawer-item ${isActive ? 'active' : ''}`;
            const title = c.title || c.id.substring(0, 16);
            const rawDate = c.updatedAt || c.lastModified || Date.now();
            const dateStr = new Date(rawDate).toLocaleDateString('en-US', {
                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
            });

            item.innerHTML = `
                <div class="drawer-sess-title" title="${title}">${this.escapeHtml(title)}</div>
                <div class="drawer-sess-meta">
                    <span>${dateStr}</span>
                    <span>${c.sizeMB || '0.1'} MB</span>
                </div>
            `;

            item.addEventListener('click', () => {
                this.switchSession(c);
                if (this.sessionsDrawer) this.sessionsDrawer.classList.add('hidden');
            });

            this.sessionsListEl.appendChild(item);
        });
    }

    toggleSessionsDrawer() {
        if (!this.sessionsDrawer) return;
        this.sessionsDrawer.classList.toggle('hidden');
    }

    startNewSession() {
        this.currentSessionId = null;
        this.currentSessionTitle = 'New Session (Unsaved)';
        this.lastMessagesFingerprint = '';
        this.isUserScrolledUp = false;
        if (this.jumpBottomBtn) this.jumpBottomBtn.classList.add('hidden');
        if (this.currentSessionTitleEl) {
            const orbitIcon = window.TeleTermIcons ? window.TeleTermIcons.render('orbit', { size: 13 }) : '';
            this.currentSessionTitleEl.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">${orbitIcon} <span>${this.escapeHtml(this.currentSessionTitle)}</span></span>`;
        }
        if (this.sessionsDrawer) this.sessionsDrawer.classList.add('hidden');
        this.renderEmptyState('New session. Send your first prompt or photo below!');
        if (this.promptInput) this.promptInput.focus();
        this.onToast('Created new session. Send a prompt to start!', 'info');
    }

    switchSession(session) {
        if (!session || !session.id) return;
        this.currentSessionId = session.id;
        this.currentSessionTitle = session.title || session.id.substring(0, 18);
        this.lastMessagesFingerprint = '';
        this.isUserScrolledUp = false;
        if (this.jumpBottomBtn) this.jumpBottomBtn.classList.add('hidden');

        if (this.currentSessionTitleEl) {
            const orbitIcon = window.TeleTermIcons ? window.TeleTermIcons.render('orbit', { size: 13 }) : '';
            this.currentSessionTitleEl.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">${orbitIcon} <span>${this.escapeHtml(this.currentSessionTitle)}</span></span>`;
            this.currentSessionTitleEl.title = session.title || session.id;
        }

        // Immediately reset transient waiting indicators for the newly switched session
        this.hideTypingIndicator();
        this.isWaitingResponse = false;
        if (this.liveStatusText) {
            this.liveStatusText.textContent = 'Antigravity Engine Ready';
        }
        if (this.liveStepBadge) {
            this.liveStepBadge.textContent = 'Ready';
        }
        if (this.livePulseDot) {
            this.livePulseDot.className = 'live-pulse-dot';
        }

        this.renderSessionsList();
        this.loadSessionMessages(session.id);
        this.syncLiveSessionProgress();
    }

    async loadSessionMessages(sessionId, isSilent = false) {
        if (!isSilent && this.chatFeedEl) {
            const orbSvg = window.TeleTermIcons ? window.TeleTermIcons.render('orbit', { size: 18 }) : '';
            this.chatFeedEl.innerHTML = `
                <div class="agy-chat-loading">
                    <span class="loading-orb">${orbSvg}</span>
                    <span>Loading Antigravity conversation data...</span>
                </div>
            `;
        }

        try {
            const res = await fetch(`/api/antigravity/session/${encodeURIComponent(sessionId)}/messages`);
            const data = await res.json();
            if (data.success && Array.isArray(data.messages)) {
                this.renderChatFeed(data.messages, true);
            } else {
                if (!isSilent) {
                    this.renderEmptyState(data.message || 'No messages in this session yet.');
                }
            }
        } catch (e) {
            if (!isSilent && this.chatFeedEl) {
                this.chatFeedEl.innerHTML = `<div class="agy-chat-error">Connection error: ${e.message}</div>`;
            }
        }
    }

    /* ==================== CHAT FEED RENDERING ==================== */

    renderChatFeed(messages, forceScroll = false) {
        if (!this.chatFeedEl) return;
        const wasScrolledUp = this.isUserScrolledUp;
        const prevScrollTop = this.chatFeedEl.scrollTop;
        this.chatFeedEl.innerHTML = '';

        if (messages.length === 0) {
            this.renderEmptyState('No messages in this session yet. Send your first prompt below!');
            return;
        }

        messages.forEach(msg => {
            const turn = document.createElement('div');
            const isUser = msg.role === 'user';
            turn.className = `agy-web-turn ${isUser ? 'user-turn' : 'agent-turn'}`;

            const timeStr = msg.timestamp 
                ? new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : '';

            if (isUser) {
                // Parse embedded or uploaded images in user turn
                const imagesHtml = this.extractImagesFromContent(msg.content);

                // Clean text of meta tags
                let cleanContent = msg.content || '';
                cleanContent = cleanContent.replace(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/g, '$1');
                cleanContent = cleanContent.replace(/<ADDITIONAL_METADATA>[\s\S]*?<\/ADDITIONAL_METADATA>/g, '');
                cleanContent = cleanContent.replace(/The user has uploaded \d+ image\(s\):[\s\S]*?(\n\n|$)/g, '');

                const userIcon = window.TeleTermIcons ? window.TeleTermIcons.render('users', { size: 11 }) : '';
                turn.innerHTML = `
                    <div class="agy-web-bubble user">
                        <div class="bubble-header">
                            <span class="bubble-author" style="display:inline-flex;align-items:center;gap:4px;">${userIcon} <span>YOU</span></span>
                            <span class="bubble-time">${timeStr}</span>
                        </div>
                        ${imagesHtml}
                        <div class="bubble-text">${this.escapeHtml(cleanContent.trim()).replace(/\n/g, '<br>')}</div>
                    </div>
                `;
            } else {
                // Tool calls chips row
                let toolsHtml = '';
                if (Array.isArray(msg.tools) && msg.tools.length > 0) {
                    const toolBadges = msg.tools.map(t => {
                        const icon = this.getToolIcon(t.name);
                        const label = t.action || t.name;
                        return `<span class="agy-tool-chip"><span style="display:inline-flex;align-items:center;">${icon}</span> <span>${this.escapeHtml(label)}</span></span>`;
                    }).join(' ');
                    toolsHtml = `<div class="agy-tools-strip">${toolBadges}</div>`;
                }

                // Interactive question buttons (if any)
                let questionHtml = '';
                if (msg.interactiveQuestion && Array.isArray(msg.interactiveQuestion.options)) {
                    const arrowIcon = window.TeleTermIcons ? window.TeleTermIcons.render('arrow-right', { size: 11 }) : '->';
                    const qOptions = msg.interactiveQuestion.options.map(opt => {
                        return `<button class="agy-question-option-btn" data-answer="${this.escapeHtml(opt)}"><span style="display:inline-flex;align-items:center;">${arrowIcon}</span> <span>${this.escapeHtml(opt)}</span></button>`;
                    }).join('');
                    const helpIcon = window.TeleTermIcons ? window.TeleTermIcons.render('sparkles', { size: 12 }) : '';
                    questionHtml = `
                        <div class="agy-question-card">
                            <div class="q-title" style="display:inline-flex;align-items:center;gap:6px;">${helpIcon} <span>${this.escapeHtml(msg.interactiveQuestion.question || 'Choice question:')}</span></div>
                            <div class="q-options-grid">${qOptions}</div>
                        </div>
                    `;
                }

                // 1. Thinking Drawer (Thought for Xs ▾) - matches screenshot 3
                let thoughtHtml = '';
                if (msg.thinking && msg.thinking.trim()) {
                    const dur = msg.thinkingDuration || 8;
                    const cpuIcon = window.TeleTermIcons ? window.TeleTermIcons.render('cpu', { size: 12 }) : '';
                    thoughtHtml = `
                        <details class="agy-thought-drawer">
                            <summary class="agy-thought-summary">
                                <span class="thought-brain-icon" style="display:inline-flex;align-items:center;">${cpuIcon}</span>
                                <span class="thought-title">Thought for ${dur}s</span>
                                <span class="thought-chevron">▾</span>
                            </summary>
                            <div class="agy-thought-content">
                                ${MarkdownRenderer.render(msg.thinking)}
                            </div>
                        </details>
                    `;
                }

                // 2. Subagents list (if any)
                let subagentsHtml = '';
                if (Array.isArray(msg.subagents) && msg.subagents.length > 0) {
                    const cpuSvg = window.TeleTermIcons ? window.TeleTermIcons.render('cpu', { size: 11 }) : '';
                    const subPills = msg.subagents.map(s => {
                        return `<span class="agy-subagent-pill" title="${this.escapeHtml(s.prompt || '')}"><span style="display:inline-flex;align-items:center;">${cpuSvg}</span> <strong>${this.escapeHtml(s.role)}</strong></span>`;
                    }).join(' ');
                    subagentsHtml = `<div class="agy-subagents-strip">${subPills}</div>`;
                }

                // Extract any generated images or media referenced in assistant turn
                const assistantImagesHtml = this.extractImagesFromContent(msg.content);
                const agentOrbitIcon = window.TeleTermIcons ? window.TeleTermIcons.render('orbit', { size: 12 }) : '';

                turn.innerHTML = `
                    <div class="agy-web-bubble agent">
                        <div class="bubble-header">
                            <span class="bubble-author" style="display:inline-flex;align-items:center;gap:4px;">${agentOrbitIcon} <span>ANTIGRAVITY AGENT</span></span>
                            <span class="bubble-time">${timeStr}</span>
                        </div>
                        ${thoughtHtml}
                        ${subagentsHtml}
                        ${toolsHtml}
                        ${assistantImagesHtml}
                        <div class="bubble-text">${MarkdownRenderer.render(msg.content)}</div>
                        ${questionHtml}
                    </div>
                `;

                // Wire up question buttons
                turn.querySelectorAll('.agy-question-option-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const answer = btn.dataset.answer;
                        if (answer) {
                            if (this.promptInput) this.promptInput.value = answer;
                            this.sendPrompt();
                        }
                    });
                });
            }

            // Wire up image lightbox clicks
            turn.querySelectorAll('.agy-chat-image-thumb').forEach(img => {
                img.addEventListener('click', () => this.openLightbox(img.src));
            });

            this.chatFeedEl.appendChild(turn);
        });

        // Bind interactive copy & run buttons across chat feed
        MarkdownRenderer.bindInteractiveButtons(this.chatFeedEl);

        // Maintain scroll position if reading, or smoothly pin to bottom if at bottom
        if (forceScroll || !wasScrolledUp) {
            this.scrollToBottom(forceScroll);
        } else {
            this.chatFeedEl.scrollTop = prevScrollTop;
            if (this.jumpBottomBtn) {
                this.jumpBottomBtn.classList.remove('hidden');
            }
        }
    }

    scrollToBottom(force = false) {
        if (!this.chatFeedEl) return;
        if (this.isUserScrolledUp && !force) return;
        requestAnimationFrame(() => {
            if (!this.chatFeedEl) return;
            this.chatFeedEl.scrollTop = this.chatFeedEl.scrollHeight;
            setTimeout(() => {
                if (this.chatFeedEl && (!this.isUserScrolledUp || force)) {
                    this.chatFeedEl.scrollTop = this.chatFeedEl.scrollHeight;
                }
            }, 80);
        });
    }

    extractImagesFromContent(content) {
        if (!content || typeof content !== 'string') return '';

        const imageFilenames = new Set();
        // Match user-uploaded media files (e.g. media_1791234868207.png)
        const re = /(media_\d+\.(?:png|jpg|jpeg|webp))/gi;
        let match;
        while ((match = re.exec(content)) !== null) {
            imageFilenames.add(match[1]);
        }

        if (imageFilenames.size === 0) return '';

        const thumbs = Array.from(imageFilenames).map(fn => {
            return `
                <img class="agy-chat-image-thumb" 
                     src="/uploads/${fn}" 
                     alt="${this.escapeHtml(fn)}" 
                     title="Click to enlarge"
                     loading="lazy"
                     onerror="this.onerror=null; this.remove();">
            `;
        }).join('');

        return `<div class="agy-bubble-images-grid">${thumbs}</div>`;
    }

    renderEmptyState(text) {
        if (!this.chatFeedEl) return;
        const orbitIcon = window.TeleTermIcons ? window.TeleTermIcons.render('orbit', { size: 36 }) : '';
        this.chatFeedEl.innerHTML = `
            <div class="agy-chat-empty">
                <div class="empty-icon" style="display:flex;justify-content:center;align-items:center;">${orbitIcon}</div>
                <div class="empty-title">Google Antigravity Interactive AI</div>
                <div class="empty-desc">${this.escapeHtml(text)}</div>
            </div>
        `;
    }

    /* ==================== SEND PROMPT & ATTACHMENTS ==================== */

    async sendPrompt() {
        if (!this.promptInput || this.isWaitingResponse) return;
        const promptText = this.promptInput.value.trim();
        const hasAttachments = this.attachedFiles.length > 0;

        if (!promptText && !hasAttachments) return;

        const model = this.modelSelect ? this.modelSelect.value : undefined;
        this.promptInput.value = '';
        this.promptInput.style.height = 'auto';

        const filesToSend = [...this.attachedFiles];
        this.attachedFiles = [];
        this.renderAttachedPreview();

        // 1. Upload files first if present
        let uploadedPaths = [];
        if (filesToSend.length > 0) {
            this.showTypingIndicator(`Uploading ${filesToSend.length} photo(s)...`);
            for (let i = 0; i < filesToSend.length; i++) {
                const item = filesToSend[i];
                const ext = item.name.split('.').pop() || 'png';
                const filename = `media_${Date.now()}_${i}.${ext}`;
                const brainTargetDir = `C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\${this.currentSessionId || 'default'}\\.user_uploaded`;

                try {
                    // Upload to .user_uploaded so Antigravity agent inspects it
                    const res1 = await fetch('/api/files/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            filename,
                            base64Data: item.dataUrl,
                            targetDir: brainTargetDir
                        })
                    });
                    const d1 = await res1.json();
                    if (d1.success && d1.path) {
                        uploadedPaths.push(d1.path);
                    }

                    // Also upload copy to public/uploads/ for web UI preview
                    await fetch('/api/files/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            filename,
                            base64Data: item.dataUrl,
                            targetDir: 'public/uploads'
                        })
                    });
                } catch (err) {
                    console.warn('[Upload error]', err);
                }
            }
        }

        // 2. Format complete prompt
        let finalPrompt = promptText;
        if (uploadedPaths.length > 0) {
            const imagesBlock = `\n\n<ADDITIONAL_METADATA>\nThe user has uploaded ${uploadedPaths.length} image(s):\n` +
                uploadedPaths.map(p => `- ${p.replace(/\\/g, '/')}`).join('\n') +
                `\nYou can embed these images in an artifact if you need the USER to review them.\n</ADDITIONAL_METADATA>`;
            
            finalPrompt = `<USER_REQUEST>\n${promptText || 'Please inspect the uploaded photo(s).'}\n</USER_REQUEST>${imagesBlock}`;
        }

        // Add user turn optimistically
        this.appendOptimisticUserMessage(promptText || 'Attached photo(s)', filesToSend.map(f => f.dataUrl));
        this.isWaitingResponse = true;
        this.showTypingIndicator('Antigravity is thinking & executing tools...');
        if (this.onPulse) this.onPulse();

        window.dispatchEvent(new CustomEvent('teleterm:ai-prompt', { detail: { tool: 'antigravity', prompt: promptText } }));

        try {
            const res = await fetch('/api/antigravity/prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    model: model,
                    conversationId: this.currentSessionId || undefined
                })
            });
            const data = await res.json();
            if (data.success) {
                // If a new conversation was created on server, update active session ID
                if (data.conversationId && (!this.currentSessionId || data.isNewConversation)) {
                    this.currentSessionId = data.conversationId;
                }
                this.syncMessagesRealtime();
            } else {
                this.hideTypingIndicator();
                this.isWaitingResponse = false;
                this.onToast(data.message || data.error || 'Error sending prompt', 'error');
            }
        } catch (e) {
            this.hideTypingIndicator();
            this.isWaitingResponse = false;
            this.onToast('Antigravity connection error: ' + e.message, 'error');
        }
    }

    appendOptimisticUserMessage(content, previewUrls = []) {
        if (!this.chatFeedEl) return;
        const turn = document.createElement('div');
        turn.className = 'agy-web-turn user-turn';
        const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        let imagesHtml = '';
        if (previewUrls.length > 0) {
            imagesHtml = `
                <div class="agy-bubble-images-grid">
                    ${previewUrls.map(url => `<img src="${url}" class="agy-chat-image-thumb" alt="Attached photo">`).join('')}
                </div>
            `;
        }

        const userIcon = window.TeleTermIcons ? window.TeleTermIcons.render('user', { size: 12, className: 'bubble-author-icon' }) : '';
        turn.innerHTML = `
            <div class="agy-web-bubble user">
                <div class="bubble-header">
                    <span class="bubble-author">${userIcon} YOU</span>
                    <span class="bubble-time">${timeStr}</span>
                </div>
                ${imagesHtml}
                <div class="bubble-text">${this.escapeHtml(content).replace(/\n/g, '<br>')}</div>
            </div>
        `;

        turn.querySelectorAll('.agy-chat-image-thumb').forEach(img => {
            img.addEventListener('click', () => this.openLightbox(img.src));
        });

        this.chatFeedEl.appendChild(turn);
        this.isUserScrolledUp = false;
        if (this.jumpBottomBtn) this.jumpBottomBtn.classList.add('hidden');
        this.scrollToBottom(true);
    }

    showTypingIndicator(customText = 'Antigravity is thinking & executing tools...') {
        this.hideTypingIndicator();
        if (!this.chatFeedEl) return;
        const ind = document.createElement('div');
        ind.id = 'agy-typing-indicator';
        ind.className = 'agy-web-turn agent-turn';
        ind.innerHTML = `
            <div class="agy-web-bubble agent typing">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
                <span class="typing-text">${this.escapeHtml(customText)}</span>
            </div>
        `;
        this.chatFeedEl.appendChild(ind);
        if (!this.isUserScrolledUp) {
            this.scrollToBottom(false);
        }
    }

    hideTypingIndicator() {
        const el = document.getElementById('agy-typing-indicator');
        if (el) el.remove();
    }

    getToolIcon(name = '') {
        const n = name.toLowerCase();
        if (!window.TeleTermIcons) return '';
        if (n.includes('file') || n.includes('write') || n.includes('edit')) return window.TeleTermIcons.render('file-text', { size: 11 });
        if (n.includes('command') || n.includes('exec') || n.includes('terminal')) return window.TeleTermIcons.render('zap', { size: 11 });
        if (n.includes('search') || n.includes('find')) return window.TeleTermIcons.render('compass', { size: 11 });
        if (n.includes('agent') || n.includes('subagent')) return window.TeleTermIcons.render('cpu', { size: 11 });
        return window.TeleTermIcons.render('sliders', { size: 11 });
    }

    formatMarkdown(text) {
        if (!text) return '';
        let html = this.escapeHtml(text);
        // Code blocks
        const copyIcon = window.TeleTermIcons ? window.TeleTermIcons.render('clipboard', { size: 10 }) : '';
        html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, (match, lang, code) => {
            return `
                <div class="code-block-box">
                    <div class="code-block-head">
                        <span>${lang || 'code'}</span>
                        <button class="btn-copy-code" style="display:inline-flex;align-items:center;gap:4px;" onclick="navigator.clipboard.writeText(this.closest('.code-block-box').querySelector('code').innerText)">${copyIcon} <span>Copy</span></button>
                    </div>
                    <pre><code>${code.trim()}</code></pre>
                </div>
            `;
        });
        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code class="code-inline">$1</code>');
        // Bold
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        // Paragraph breaks
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
