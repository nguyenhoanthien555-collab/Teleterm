/**
 * MMO Chat & Social System
 * TeleTerm Master Architecture v2 - Section 8
 */

// Module scratchpad for zero-allocation speech bubble projection (Argon Task #3)
let _bubbleAnchorPos = null;
let _bubbleScreenCoords = null;
function getBubbleAnchorPos() {
    if (!_bubbleAnchorPos && window.THREE) {
        _bubbleAnchorPos = new window.THREE.Vector3();
    }
    return _bubbleAnchorPos;
}
function getBubbleScreenCoords() {
    if (!_bubbleScreenCoords && window.THREE) {
        _bubbleScreenCoords = new window.THREE.Vector3();
    }
    return _bubbleScreenCoords;
}

class MmoChatClient {
    constructor() {
        this.isOpen = false;
        this.currentChannel = 'global';
        this.whisperTargetId = null;
        this.whisperTargetName = '';
        this.lastWhisperSender = null; // { id, name } for /r quick reply
        this.speechBubbles = new Map(); // Map<userId, { element: HTMLElement, timer: number }>

        this.initDOM();
        this.bindEvents();
    }

    initDOM() {
        window.addEventListener('DOMContentLoaded', () => {
            this.container = document.getElementById('mmo-chat-container');
            this.messagesList = document.getElementById('mmo-chat-messages');
            this.chatInput = document.getElementById('mmo-chat-input');
            this.btnSend = document.getElementById('btn-mmo-chat-send');
            this.tabGlobal = document.getElementById('chat-tab-global');
            this.tabWhisper = document.getElementById('chat-tab-whisper');
            this.whisperBanner = document.getElementById('chat-whisper-banner');
            this.btnCloseChat = document.getElementById('btn-toggle-mmo-chat');
            this.btnFloatingOpen = document.getElementById('btn-floating-chat-open');

            if (this.container) {
                this.container.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
                this.container.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });
            }

            if (this.tabGlobal) {
                this.tabGlobal.addEventListener('click', () => this.switchChannel('global'));
            }
            if (this.tabWhisper) {
                this.tabWhisper.addEventListener('click', () => this.switchChannel('whisper'));
            }
            if (this.btnSend) {
                this.btnSend.addEventListener('click', () => this.sendMessage());
            }
            if (this.btnCloseChat) {
                const handleClose = (e) => {
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    this.closeChat();
                };
                this.btnCloseChat.addEventListener('click', handleClose);
                this.btnCloseChat.addEventListener('touchend', handleClose);
                this.btnCloseChat.addEventListener('pointerup', handleClose);
            }
            if (this.btnFloatingOpen) {
                const handleOpen = (e) => {
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    this.openChat();
                };
                this.btnFloatingOpen.addEventListener('click', handleOpen);
                this.btnFloatingOpen.addEventListener('touchend', handleOpen);
                this.btnFloatingOpen.addEventListener('pointerup', handleOpen);
            }
            if (this.chatInput) {
                this.chatInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.sendMessage();
                    } else if (e.key === 'Escape') {
                        this.unfocusChat();
                        this.closeChat();
                    }
                });
            }

            // Mobile viewport optimization: start closed so 3D world, character & interactions are not obscured
            const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
            if (isMobile) {
                this.closeChat();
            }
        });
    }

    bindEvents() {
        // Hotkey 'T' to focus/toggle chat input
        window.addEventListener('keydown', (e) => {
            // Ignore if already typing in an input, textarea or terminal
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.classList.contains('xterm-helper-textarea')) {
                return;
            }

            if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                if (!this.isOpen || (this.container && this.container.classList.contains('chat-closed'))) {
                    this.openChat();
                } else {
                    this.focusChat();
                }
            }
        });
    }

    openChat() {
        if (this.container) {
            this.container.classList.remove('chat-closed');
        }
        if (this.btnFloatingOpen) {
            this.btnFloatingOpen.classList.add('hidden');
        }
        this.isOpen = true;
        this.focusChat();
    }

    closeChat() {
        if (this.container) {
            this.container.classList.add('chat-closed');
        }
        if (this.btnFloatingOpen) {
            this.btnFloatingOpen.classList.remove('hidden');
        }
        this.isOpen = false;
        if (this.chatInput) {
            this.chatInput.blur();
        }
    }

    toggleChat() {
        if (this.isOpen && this.container && !this.container.classList.contains('chat-closed')) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    focusChat() {
        if (!this.container || !this.chatInput) return;
        this.container.classList.remove('chat-closed');
        if (this.btnFloatingOpen) this.btnFloatingOpen.classList.add('hidden');
        this.chatInput.focus();
        this.isOpen = true;
    }

    unfocusChat() {
        if (!this.chatInput) return;
        this.chatInput.blur();
    }

    switchChannel(channel) {
        this.currentChannel = channel;
        if (this.tabGlobal) this.tabGlobal.classList.toggle('active', channel === 'global');
        if (this.tabWhisper) this.tabWhisper.classList.toggle('active', channel === 'whisper');
        if (this.whisperBanner) {
            this.whisperBanner.classList.toggle('hidden', channel !== 'whisper');
            if (channel === 'whisper') {
                const i18n = window.TeleTermI18n;
                const nameStr = this.whisperTargetName || '...';
                const label = i18n ? i18n.t('whisper_banner', { name: nameStr }) : `Whispering to: ${nameStr}`;
                const lockIcon = window.TeleTermIcons ? window.TeleTermIcons.render('lock', { size: 12 }) : '';
                const cancelIcon = window.TeleTermIcons ? window.TeleTermIcons.render('x', { size: 11 }) : '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
                this.whisperBanner.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">${lockIcon} ${escapeHtml(label)}</span><button type="button" class="chat-whisper-cancel" title="Cancel Whisper">${cancelIcon}</button>`;
                const btnCancel = this.whisperBanner.querySelector('.chat-whisper-cancel');
                if (btnCancel) {
                    btnCancel.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.clearWhisperTarget();
                    });
                }
            }
        }
    }

    setWhisperTarget(userId, name) {
        this.whisperTargetId = userId;
        this.whisperTargetName = name;
        this.switchChannel('whisper');
        this.focusChat();
    }

    clearWhisperTarget() {
        this.whisperTargetId = null;
        this.whisperTargetName = '';
        this.switchChannel('global');
    }

    parseInput(raw) {
        if (!raw) return { isGlobal: true, message: '' };
        const whisperMatch = raw.match(/^\/(?:m|w)(?:\s+("([^"]+)"|'([^']+)'|(\S+))(?:\s+(.+))?)?$/i);
        if (whisperMatch) {
            const target = whisperMatch[2] || whisperMatch[3] || whisperMatch[4];
            const msg = whisperMatch[5] ? whisperMatch[5].trim() : '';
            return { isWhisper: true, recipient: target, message: msg };
        }
        const replyMatch = raw.match(/^\/r(?:\s+(.+))?$/i);
        if (replyMatch) {
            const msg = replyMatch[1] ? replyMatch[1].trim() : '';
            return { isWhisper: true, isReply: true, recipient: this.lastWhisperSender?.name || null, message: msg };
        }
        return { isGlobal: true, message: raw };
    }

    sendMessage() {
        if (!this.chatInput) return;
        const raw = this.chatInput.value.trim();
        if (!raw) return;

        const i18n = window.TeleTermI18n;

        // Command: /m <target> <message> or /w <target> <message> (supports quotes)
        const whisperMatch = raw.match(/^\/(?:m|w)(?:\s+("([^"]+)"|'([^']+)'|(\S+))(?:\s+(.+))?)?$/i);
        if (whisperMatch) {
            const target = whisperMatch[2] || whisperMatch[3] || whisperMatch[4];
            const msg = whisperMatch[5] ? whisperMatch[5].trim() : '';

            if (!target || !msg) {
                const err = i18n ? i18n.t('whisper_err_no_target') : 'Usage: /m <player> <message>';
                this.addSystemMessage(err);
                return;
            }

            this.setWhisperTarget(target, target);
            this.sendWhisperTo(target, msg, target);
            this.chatInput.value = '';
            return;
        }

        // Command: /r <message>
        const replyMatch = raw.match(/^\/r(?:\s+(.+))?$/i);
        if (replyMatch) {
            const msg = replyMatch[1] ? replyMatch[1].trim() : '';
            if (!this.lastWhisperSender) {
                const err = i18n ? i18n.t('whisper_err_no_reply') : 'No previous whisper to reply to.';
                this.addSystemMessage(err);
                return;
            }
            if (!msg) {
                this.setWhisperTarget(this.lastWhisperSender.id, this.lastWhisperSender.name);
                this.chatInput.value = '';
                return;
            }
            this.setWhisperTarget(this.lastWhisperSender.id, this.lastWhisperSender.name);
            this.sendWhisperTo(this.lastWhisperSender.id, msg, this.lastWhisperSender.name);
            this.chatInput.value = '';
            return;
        }

        // If in Whisper Channel
        if (this.currentChannel === 'whisper') {
            if (!this.whisperTargetId) {
                const err = i18n ? i18n.t('whisper_err_no_target') : 'Please select a player to whisper to.';
                this.addSystemMessage(err);
                return;
            }
            this.sendWhisperTo(this.whisperTargetId, raw, this.whisperTargetName);
            this.chatInput.value = '';
            return;
        }

        // Global Channel
        if (window.multiplayerClient && window.multiplayerClient.isConnected) {
            window.multiplayerClient.sendChat(raw);
        } else {
            const myName = localStorage.getItem('teleterm_dev_name') || 'Tris';
            const myId = (window.multiplayerClient && window.multiplayerClient.myUserId) ? window.multiplayerClient.myUserId : 'player';
            this.onIncomingMessage({
                senderId: myId,
                senderName: myName,
                senderLevel: 1,
                text: raw,
                channel: 'global',
                timestamp: Date.now()
            });
        }
        this.chatInput.value = '';
    }

    sendWhisperTo(targetId, text, targetName) {
        if (window.multiplayerClient && window.multiplayerClient.isConnected) {
            window.multiplayerClient.sendWhisper(targetId, text, targetName);
        } else {
            // Local fallback
            const myName = localStorage.getItem('teleterm_dev_name') || 'Tris';
            const myId = (window.multiplayerClient && window.multiplayerClient.myUserId) ? window.multiplayerClient.myUserId : 'player';
            this.onIncomingMessage({
                senderId: myId,
                senderName: myName,
                senderLevel: 1,
                recipientId: targetId,
                recipientName: targetName || targetId,
                text: text,
                channel: 'whisper',
                timestamp: Date.now()
            });
        }
    }

    onIncomingMessage(msg) {
        if (!this.messagesList) return;

        const isWhisper = msg.channel === 'whisper';
        const myId = (window.multiplayerClient && window.multiplayerClient.myUserId) ? window.multiplayerClient.myUserId : 'player';
        const isFromMe = msg.senderId === myId;

        if (isWhisper && !isFromMe) {
            this.lastWhisperSender = {
                id: msg.senderId,
                name: msg.senderName
            };
        }

        const item = document.createElement('div');
        item.className = `chat-message-row ${isWhisper ? 'is-whisper' : ''}`;

        const timeStr = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const i18n = window.TeleTermI18n;

        if (isWhisper) {
            const replyBtnText = i18n ? i18n.t('whisper_reply_btn') : 'Reply';
            const lockSvg = window.TeleTermIcons ? window.TeleTermIcons.render('lock', { size: 10 }) : '';
            if (isFromMe) {
                // Outgoing whisper
                const toLabel = i18n ? i18n.t('whisper_to') : 'To';
                const recName = msg.recipientName || this.whisperTargetName || 'Player';
                item.innerHTML = `
                    <span class="chat-time">${timeStr}</span>
                    <span class="chat-whisper-badge" style="display:inline-flex;align-items:center;gap:4px;">${lockSvg} ${toLabel} [${escapeHtml(recName)}]</span>
                    <span class="chat-content">${escapeHtml(msg.text)}</span>
                `;
            } else {
                // Incoming whisper
                const fromLabel = i18n ? i18n.t('whisper_from') : 'From';
                const replyIcon = window.TeleTermIcons ? window.TeleTermIcons.render('corner-down-left', { size: 10 }) : '↩';
                item.innerHTML = `
                    <span class="chat-time">${timeStr}</span>
                    <span class="chat-whisper-badge" style="display:inline-flex;align-items:center;gap:4px;">${lockSvg} ${fromLabel} [${escapeHtml(msg.senderName)}]</span>
                    <span class="chat-content">${escapeHtml(msg.text)}</span>
                    <button type="button" class="chat-whisper-reply-btn" data-sender-id="${escapeHtml(msg.senderId)}" data-sender-name="${escapeHtml(msg.senderName)}" style="display:inline-flex;align-items:center;gap:4px;">${replyIcon} <span>${escapeHtml(replyBtnText)}</span></button>
                `;

                const replyBtn = item.querySelector('.chat-whisper-reply-btn');
                if (replyBtn) {
                    replyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.setWhisperTarget(msg.senderId, msg.senderName);
                    });
                }
            }
        } else {
            // Global message
            item.innerHTML = `
                <span class="chat-time">${timeStr}</span>
                <span class="chat-lvl-badge">Lv.${msg.senderLevel || 1}</span>
                <span class="chat-sender clickable-name" title="Click to whisper">${escapeHtml(msg.senderName)}:</span>
                <span class="chat-content">${escapeHtml(msg.text)}</span>
            `;

            const nameEl = item.querySelector('.clickable-name');
            if (nameEl) {
                nameEl.addEventListener('click', () => {
                    this.setWhisperTarget(msg.senderId, msg.senderName);
                });
            }
        }

        this.messagesList.appendChild(item);
        this.messagesList.scrollTop = this.messagesList.scrollHeight;

        // Trigger 3D overhead speech bubble if user is present in open world
        this.displaySpeechBubble(msg.senderId, msg.text);
    }

    onChatError(data) {
        const i18n = window.TeleTermI18n;
        if (data.error === 'recipient_not_found') {
            const target = data.target || 'Player';
            const msg = i18n ? i18n.t('whisper_err_offline', { name: target }) : `Player "${target}" is not online.`;
            this.addSystemMessage(msg);
        } else {
            this.addSystemMessage(data.message || `Chat error: ${data.error}`);
        }
    }

    addSystemMessage(text) {
        if (!this.messagesList) return;
        const item = document.createElement('div');
        item.className = 'chat-message-row is-system';
        const bellIcon = window.TeleTermIcons ? window.TeleTermIcons.render('bell', { size: 11 }) : '';
        item.innerHTML = `<span class="chat-system-tag" style="display:inline-flex;align-items:center;gap:4px;">${bellIcon} <span>System:</span></span> <span class="chat-content">${escapeHtml(text)}</span>`;
        this.messagesList.appendChild(item);
        this.messagesList.scrollTop = this.messagesList.scrollHeight;
    }

    displaySpeechBubble(userId, text) {
        // Normalize local player ID so bubble is always matched reliably
        let key = userId;
        if (window.multiplayerClient && (userId === window.multiplayerClient.myUserId || userId === 'player')) {
            key = 'player';
        }

        // Speech bubble DOM injection for 3D world positioning
        let bubbleObj = this.speechBubbles.get(key);
        if (bubbleObj) {
            clearTimeout(bubbleObj.timer);
            if (bubbleObj.element) bubbleObj.element.remove();
        }

        const bubbleEl = document.createElement('div');
        bubbleEl.className = 'anime-comic-speech-bubble';
        bubbleEl.innerHTML = `<div class="bubble-arrow"></div><div class="bubble-text">${escapeHtml(text)}</div>`;
        document.body.appendChild(bubbleEl);

        const timer = setTimeout(() => {
            bubbleEl.classList.add('fading');
            setTimeout(() => {
                bubbleEl.remove();
                this.speechBubbles.delete(key);
            }, 500);
        }, 7000); // 7s lifetime as specified in Master Architecture v2

        this.speechBubbles.set(key, { element: bubbleEl, timer });
    }

    updateSpeechBubblesPositions(camera, openWorld3D) {
        if (!camera || !openWorld3D) return;

        const isModalActive = document.body.classList.contains('mode-focus') ||
            !document.body.classList.contains('mode-explore') ||
            document.querySelector('.anime-dialogue-overlay:not(.hidden)');

        if (isModalActive) {
            for (const [, bubble] of this.speechBubbles.entries()) {
                if (bubble.element) bubble.element.style.display = 'none';
            }
            return;
        }

        for (const [userId, bubble] of this.speechBubbles.entries()) {
            if (!bubble.element) continue;

            const tempAnchor = getBubbleAnchorPos();
            let anchorPos = null;
            const isLocalPlayer = (userId === 'player' || (window.multiplayerClient && userId === window.multiplayerClient.myUserId));

            if (isLocalPlayer) {
                // Priority 1: Query OverheadUiSystem for exact player badge head anchor
                if (openWorld3D.overheadUi && typeof openWorld3D.overheadUi.getAnchorWorldPosition === 'function') {
                    const pos = openWorld3D.overheadUi.getAnchorWorldPosition('player');
                    if (pos && tempAnchor) {
                        tempAnchor.copy(pos);
                        anchorPos = tempAnchor;
                    }
                }
                // Priority 2: Query player retargeter Head bone
                if (!anchorPos && openWorld3D.retargeter?.mappedBones?.Head && tempAnchor) {
                    openWorld3D.retargeter.mappedBones.Head.getWorldPosition(tempAnchor);
                    tempAnchor.y += 0.38;
                    anchorPos = tempAnchor;
                }
                // Priority 3: Query openWorld3D.player root group with seated/standing height
                if (!anchorPos && openWorld3D.player && tempAnchor) {
                    openWorld3D.player.getWorldPosition(tempAnchor);
                    tempAnchor.y += (openWorld3D.isSitting ? 1.35 : 1.90);
                    anchorPos = tempAnchor;
                }
            } else if (window.multiplayerClient && window.multiplayerClient.remotePlayers.has(userId)) {
                if (openWorld3D.overheadUi && typeof openWorld3D.overheadUi.getAnchorWorldPosition === 'function') {
                    const pos = openWorld3D.overheadUi.getAnchorWorldPosition(userId);
                    if (pos && tempAnchor) {
                        tempAnchor.copy(pos);
                        anchorPos = tempAnchor;
                    }
                }
                if (!anchorPos) {
                    const rp = window.multiplayerClient.remotePlayers.get(userId);
                    if (rp?.group && tempAnchor) {
                        rp.group.getWorldPosition(tempAnchor);
                        tempAnchor.y += 1.90;
                        anchorPos = tempAnchor;
                    }
                }
            } else if (openWorld3D.npcs) {
                const npc = openWorld3D.npcs.find(n => n.userData && (n.userData.id === userId || n.userData.name === userId));
                if (npc) {
                    if (openWorld3D.overheadUi && typeof openWorld3D.overheadUi.getAnchorWorldPosition === 'function') {
                        const pos = openWorld3D.overheadUi.getAnchorWorldPosition(npc.userData.id);
                        if (pos && tempAnchor) {
                            tempAnchor.copy(pos);
                            anchorPos = tempAnchor;
                        }
                    }
                    if (!anchorPos && tempAnchor) {
                        npc.getWorldPosition(tempAnchor);
                        tempAnchor.y += 1.90;
                        anchorPos = tempAnchor;
                    }
                }
            }

            if (!anchorPos) {
                bubble.element.style.display = 'none';
                continue;
            }

            // Project 3D head position to screen space (Zero-Allocation)
            const screenCoords = getBubbleScreenCoords();
            if (!screenCoords) {
                bubble.element.style.display = 'none';
                continue;
            }
            screenCoords.copy(anchorPos).project(camera);
            if (screenCoords.z > 1.0 || screenCoords.z < -1.0) {
                bubble.element.style.display = 'none'; // Behind camera or outside frustum
                continue;
            }

            const rawX = (screenCoords.x * 0.5 + 0.5) * window.innerWidth;
            const rawY = (-(screenCoords.y * 0.5) + 0.5) * window.innerHeight;

            // Viewport clamping to prevent bubble from clipping off top or sides
            const halfW = 95;
            const x = Math.max(halfW + 12, Math.min(window.innerWidth - halfW - 12, rawX));
            const y = Math.max(50, Math.min(window.innerHeight - 60, rawY));

            bubble.element.style.display = 'block';
            bubble.element.style.left = `${x}px`;
            bubble.element.style.top = `${y}px`;
        }
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.mmoChat = new MmoChatClient();
