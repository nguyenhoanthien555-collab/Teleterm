/**
 * TELETERM 3D — RADIAL EMOTE WHEEL SYSTEM
 * Milestone 2: Expressive Gestures & Multiplayer Synchronized Emotes
 *
 * Implements:
 * - 8-slice SVG radial menu with pointer angle detection (atan2)
 * - Deadzone safety (r < 35px prevents accidental triggers)
 * - Keybind: Hold [G] to open, move cursor to slice, release [G] to trigger
 * - Network broadcast via window.multiplayerClient.sendEmote(emoteId)
 * - Optimistic local skeletal crossfade + 1.5s server cooldown safety
 * - Web Audio harmonic feedback chimes
 */

export const EMOTE_SLICES = [
    {
        id: 'wave',
        anim: 'Wave',
        label: 'Wave',
        labelVi: 'Vẫy Chào',
        icon: '👋',
        color: '#38bdf8'
    },
    {
        id: 'cheer',
        anim: 'Celebrate',
        label: 'Cheer',
        labelVi: 'Ăn Mừng',
        icon: '🎉',
        color: '#fbbf24'
    },
    {
        id: 'dance',
        anim: 'VibeDance',
        label: 'Dance',
        labelVi: 'Khiêu Vũ',
        icon: '💃',
        color: '#ec4899'
    },
    {
        id: 'bow',
        anim: 'Bow',
        label: 'Polite Bow',
        labelVi: 'Cúi Chào',
        icon: '🙇',
        color: '#a855f7'
    },
    {
        id: 'zen',
        anim: 'Meditate',
        label: 'Meditate',
        labelVi: 'Thiền Tịnh',
        icon: '🧘',
        color: '#10b981'
    },
    {
        id: 'coffee',
        anim: 'Coffee',
        label: 'Warm Sip',
        labelVi: 'Thưởng Trà',
        icon: '🍵',
        color: '#f97316'
    },
    {
        id: 'stretch',
        anim: 'Stretch',
        label: 'Stretch',
        labelVi: 'Vươn Vai',
        icon: '🙆',
        color: '#06b6d4'
    },
    {
        id: 'photo',
        anim: 'PhotoPose',
        label: 'Peace Pose',
        labelVi: 'Tạo Dáng',
        icon: '✌️',
        color: '#00f0ff'
    }
];

export class RadialEmoteWheel {
    constructor() {
        this.isOpen = false;
        this.activeSliceIdx = -1;
        this.audioCtx = null;
        this.lastHoverIdx = -1;

        this.modalEl = null;
        this.wheelContainer = null;
        this.slicesGroup = null;
        this.centerLabelEl = null;
        this.centerIconEl = null;

        this.centerX = 0;
        this.centerY = 0;
        this.isKeyDown = false;

        this.initDOM();
        this.bindEvents();

        if (typeof window !== 'undefined') {
            window.radialEmoteWheel = this;
        }
    }

    initDOM() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('modal-radial-emote-wheel')) {
            this.modalEl = document.getElementById('modal-radial-emote-wheel');
            this.bindElements();
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'modal-radial-emote-wheel';
        overlay.className = 'radial-emote-overlay hidden';
        overlay.innerHTML = `
            <div class="radial-emote-wrap" id="radial-emote-wrap">
                <svg class="radial-wheel-svg" viewBox="0 0 340 340">
                    <defs>
                        <radialGradient id="wheelCenterGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stop-color="rgba(56, 189, 248, 0.25)" />
                            <stop offset="100%" stop-color="rgba(15, 23, 42, 0)" />
                        </radialGradient>
                    </defs>
                    <circle cx="170" cy="170" r="160" class="wheel-outer-ring" />
                    <!-- Slices rendered dynamically -->
                    <g id="radial-slices-group"></g>
                    <!-- Center Deadzone -->
                    <circle cx="170" cy="170" r="42" class="wheel-center-deadzone" />
                </svg>

                <div class="wheel-center-hud">
                    <span class="center-emote-icon" id="wheel-center-icon">✨</span>
                    <span class="center-emote-label" id="wheel-center-label">EMOTE</span>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.modalEl = overlay;
        this.bindElements();
        this.renderSlices();
    }

    bindElements() {
        if (!this.modalEl) return;
        this.wheelContainer = this.modalEl.querySelector('#radial-emote-wrap');
        this.slicesGroup = this.modalEl.querySelector('#radial-slices-group');
        this.centerIconEl = this.modalEl.querySelector('#wheel-center-icon');
        this.centerLabelEl = this.modalEl.querySelector('#wheel-center-label');
    }

    renderSlices() {
        if (!this.slicesGroup) return;
        this.slicesGroup.innerHTML = '';

        const count = EMOTE_SLICES.length;
        const angleStep = (2 * Math.PI) / count;
        const radius = 158;
        const innerRadius = 45;
        const center = 170;

        EMOTE_SLICES.forEach((slice, idx) => {
            const startAngle = idx * angleStep - Math.PI / 2 - angleStep / 2;
            const endAngle = startAngle + angleStep;

            const x1 = center + radius * Math.cos(startAngle);
            const y1 = center + radius * Math.sin(startAngle);
            const x2 = center + radius * Math.cos(endAngle);
            const y2 = center + radius * Math.sin(endAngle);

            const ix1 = center + innerRadius * Math.cos(startAngle);
            const iy1 = center + innerRadius * Math.sin(startAngle);
            const ix2 = center + innerRadius * Math.cos(endAngle);
            const iy2 = center + innerRadius * Math.sin(endAngle);

            const pathData = `
                M ${ix1} ${iy1}
                L ${x1} ${y1}
                A ${radius} ${radius} 0 0 1 ${x2} ${y2}
                L ${ix2} ${iy2}
                A ${innerRadius} ${innerRadius} 0 0 0 ${ix1} ${iy1}
                Z
            `;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('class', 'emote-slice-path');
            path.setAttribute('data-slice-idx', idx);
            path.style.setProperty('--slice-color', slice.color);

            // Icon position (mid-angle between inner and outer)
            const midAngle = startAngle + angleStep / 2;
            const iconRadius = (radius + innerRadius) * 0.52;
            const iconX = center + iconRadius * Math.cos(midAngle);
            const iconY = center + iconRadius * Math.sin(midAngle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', iconX);
            text.setAttribute('y', iconY + 7);
            text.setAttribute('class', 'emote-slice-icon');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = slice.icon;

            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('class', 'emote-slice-group');
            g.setAttribute('id', `slice-group-${idx}`);
            g.appendChild(path);
            g.appendChild(text);

            this.slicesGroup.appendChild(g);
        });
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.closest('.xterm') || active.closest('#mmo-chat-container'))) {
                return;
            }

            if ((e.key === 'g' || e.key === 'G') && !this.isKeyDown) {
                e.preventDefault();
                this.isKeyDown = true;
                this.open();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'g' || e.key === 'G') {
                this.isKeyDown = false;
                if (this.isOpen) {
                    this.executeActiveSlice();
                    this.close();
                }
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isOpen) return;
            this.handlePointerMove(e.clientX, e.clientY);
        });
    }

    initAudio() {
        if (this.audioCtx) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.audioCtx = new AudioCtx();
        } catch (e) {}
    }

    playHoverTick() {
        this.initAudio();
        if (!this.audioCtx) return;
        try {
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(659.25, now); // E5
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.04);
        } catch (e) {}
    }

    playTriggerChime() {
        this.initAudio();
        if (!this.audioCtx) return;
        try {
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.12);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
        } catch (e) {}
    }

    open() {
        this.isOpen = true;
        this.activeSliceIdx = -1;
        this.lastHoverIdx = -1;
        this.modalEl?.classList.remove('hidden');

        // Center coordinates
        const rect = this.wheelContainer?.getBoundingClientRect();
        if (rect) {
            this.centerX = rect.left + rect.width / 2;
            this.centerY = rect.top + rect.height / 2;
        } else {
            this.centerX = window.innerWidth / 2;
            this.centerY = window.innerHeight / 2;
        }

        if (this.centerIconEl) this.centerIconEl.textContent = '✨';
        if (this.centerLabelEl) this.centerLabelEl.textContent = 'EMOTE';
    }

    close() {
        this.isOpen = false;
        this.modalEl?.classList.add('hidden');
        this.clearSliceHighlights();
    }

    handlePointerMove(clientX, clientY) {
        if (typeof clientX === 'object' && clientX !== null) {
            clientY = clientX.clientY;
            clientX = clientX.clientX;
        }
        const dx = clientX - this.centerX;
        const dy = clientY - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Deadzone check (r < 35px)
        if (dist < 35) {
            this.activeSliceIdx = -1;
            this.clearSliceHighlights();
            if (this.centerIconEl) this.centerIconEl.textContent = '✨';
            if (this.centerLabelEl) this.centerLabelEl.textContent = 'CANCEL';
            return;
        }

        // Angle theta calculation (-pi to +pi)
        let angle = Math.atan2(dy, dx); // 0 at East, +pi/2 at South, -pi/2 at North
        // Normalize angle so 0 is at North (-PI/2) and clockwise
        angle = angle + Math.PI / 2;
        if (angle < 0) angle += 2 * Math.PI;

        const count = EMOTE_SLICES.length;
        const angleStep = (2 * Math.PI) / count;
        // Shift by half step to center slices
        const sliceIndex = Math.floor(((angle + angleStep / 2) % (2 * Math.PI)) / angleStep);

        if (sliceIndex !== this.activeSliceIdx && sliceIndex >= 0 && sliceIndex < count) {
            this.activeSliceIdx = sliceIndex;
            this.highlightSlice(sliceIndex);

            if (this.activeSliceIdx !== this.lastHoverIdx) {
                this.playHoverTick();
                this.lastHoverIdx = this.activeSliceIdx;
            }
        }
    }

    highlightSlice(idx) {
        this.clearSliceHighlights();
        const slice = EMOTE_SLICES[idx];
        if (!slice) return;

        const g = this.modalEl?.querySelector(`#slice-group-${idx}`);
        if (g) {
            g.classList.add('active-slice');
        }

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';
        const label = isVi ? (slice.labelVi || slice.label) : slice.label;

        if (this.centerIconEl) this.centerIconEl.textContent = slice.icon;
        if (this.centerLabelEl) {
            this.centerLabelEl.textContent = label;
            this.centerLabelEl.style.color = slice.color;
        }
    }

    clearSliceHighlights() {
        const groups = this.modalEl?.querySelectorAll('.emote-slice-group');
        groups?.forEach(g => g.classList.remove('active-slice'));
    }

    executeActiveSlice() {
        if (this.activeSliceIdx < 0 || this.activeSliceIdx >= EMOTE_SLICES.length) {
            return;
        }

        const slice = EMOTE_SLICES[this.activeSliceIdx];
        if (!slice) return;

        this.playTriggerChime();

        // 1. Optimistic local skeletal animation trigger
        if (window.openWorld3D?.retargeter) {
            window.openWorld3D.retargeter.setAnimation(slice.anim);
        }

        // 2. Broadcast to network peers via WebSocket
        if (window.multiplayerClient && typeof window.multiplayerClient.sendEmote === 'function') {
            window.multiplayerClient.sendEmote(slice.anim);
        }

        // Toast feedback
        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';
        const label = isVi ? (slice.labelVi || slice.label) : slice.label;
        if (window.openWorld3D?.onToast) {
            window.openWorld3D.onToast(`${slice.icon} ${label}`, 'info');
        }
    }
}

export const radialEmoteWheel = new RadialEmoteWheel();
