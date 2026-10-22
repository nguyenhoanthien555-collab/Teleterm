/**
 * CAMPFIRE COOKING & FISH ROASTING SYSTEM
 * TeleTerm 3D — Cozy Economy & Culinary Minigame (Milestone 1)
 *
 * Implements:
 * - Server-Authoritative Roasting Timer (4.0s - 12.0s Perfect Roast Window)
 * - Zero-GC Circular Progress Gauge HUD with SVG dynamic arc
 * - Web Audio procedural sizzle & ember crackle synthesizer
 * - Celebratory golden burst particle FX & XP award (+35 XP for Perfect Roast)
 * - Raw Fish -> Campfire Skewered Fish (item_grilled_fish) or Burnt Fish (item_burnt_fish)
 */

export class CampfireCookingSystem {
    constructor() {
        this.isOpen = false;
        this.isCooking = false;
        this.selectedSlotIndex = null;
        this.selectedFishItem = null;
        this.cookStartTime = 0;
        this.targetDurationSec = 16.0;
        this.perfectMinSec = 4.0;
        this.perfectMaxSec = 12.0;

        // Web Audio Synthesizer Nodes
        this.audioCtx = null;
        this.sizzleSource = null;
        this.sizzleGain = null;
        this.crackleTimer = null;

        // Animation frame
        this.animFrameId = null;

        // DOM elements
        this.modalEl = null;
        this.gaugeArcEl = null;
        this.needleEl = null;
        this.statusBadgeEl = null;
        this.timerTextEl = null;
        this.btnPullEl = null;
        this.fishSelectorContainer = null;
        this.fishPreviewEl = null;

        this.initDOM();
        this.bindEvents();

        if (typeof window !== 'undefined') {
            window.campfireCookingSystem = this;
        }
    }

    initDOM() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('modal-campfire-cooking')) {
            this.modalEl = document.getElementById('modal-campfire-cooking');
            this.bindElements();
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'modal-campfire-cooking';
        modal.className = 'campfire-cooking-overlay hidden';
        modal.innerHTML = `
            <div class="campfire-cooking-card">
                <div class="cooking-header">
                    <div class="cooking-title-group">
                        <span class="cooking-fire-icon">🔥</span>
                        <div>
                            <h3 class="cooking-title" id="cooking-title-text">Campfire Hearth Roasting</h3>
                            <p class="cooking-subtitle" id="cooking-subtitle-text">Roast fresh fish over glowing river stone embers</p>
                        </div>
                    </div>
                    <button class="cooking-close-btn" id="btn-close-cooking" title="Close [Esc]">✕</button>
                </div>

                <!-- Fish Selector Screen (shown if player has multiple fish) -->
                <div class="cooking-fish-selector" id="cooking-fish-selector">
                    <div class="selector-heading">Select fish to skewer on fire:</div>
                    <div class="fish-slots-grid" id="cooking-fish-grid"></div>
                </div>

                <!-- Active Roasting Gauge Screen -->
                <div class="cooking-gauge-panel hidden" id="cooking-gauge-panel">
                    <div class="gauge-center-wrapper">
                        <svg class="cooking-gauge-svg" viewBox="0 0 200 200">
                            <!-- Background Track -->
                            <circle class="gauge-track" cx="100" cy="100" r="82" />
                            <!-- Raw Zone (0s to 4s: 0% - 25%) -->
                            <circle class="gauge-zone-raw" cx="100" cy="100" r="82"
                                stroke-dasharray="128.8 386.4" stroke-dashoffset="0" />
                            <!-- Perfect Golden Zone (4s to 12s: 25% - 75%) -->
                            <circle class="gauge-zone-perfect" cx="100" cy="100" r="82"
                                stroke-dasharray="257.6 257.6" stroke-dashoffset="-128.8" />
                            <!-- Burnt Danger Zone (12s to 16s: 75% - 100%) -->
                            <circle class="gauge-zone-burnt" cx="100" cy="100" r="82"
                                stroke-dasharray="128.8 386.4" stroke-dashoffset="-386.4" />
                            <!-- Active Progress Indicator -->
                            <circle class="gauge-progress-arc" id="cooking-gauge-arc" cx="100" cy="100" r="82"
                                stroke-dasharray="515.2" stroke-dashoffset="515.2" />
                        </svg>

                        <!-- Center Fish Display & Timer -->
                        <div class="gauge-center-content">
                            <div class="roasting-fish-icon" id="roasting-fish-icon">🐟</div>
                            <div class="roasting-timer" id="roasting-timer-val">0.0s</div>
                            <div class="roasting-status-badge status-raw" id="roasting-status-badge">RAW</div>
                        </div>
                    </div>

                    <!-- Roasting Target Guide -->
                    <div class="roasting-guide-bar">
                        <span class="guide-item raw-guide">0s: Raw</span>
                        <span class="guide-item perfect-guide">★ 4s - 12s: PERFECT ROAST (+35 XP) ★</span>
                        <span class="guide-item burnt-guide">&gt; 12s: Burnt</span>
                    </div>

                    <!-- Action Button -->
                    <div class="cooking-actions">
                        <button class="btn-pull-skewer" id="btn-pull-skewer">
                            <span class="btn-pull-icon">🥢</span>
                            <span class="btn-pull-text" id="btn-pull-text">PULL SKEWER OFF FIRE [SPACE]</span>
                        </button>
                    </div>
                </div>

                <!-- Result Card overlay -->
                <div class="cooking-result-card hidden" id="cooking-result-card">
                    <div class="result-badge-icon" id="result-badge-icon">✨</div>
                    <h4 class="result-heading" id="result-heading">PERFECT ROAST!</h4>
                    <p class="result-desc" id="result-desc">Savory, golden-crisp skewered fish packed with delicious aroma!</p>
                    <div class="result-rewards">
                        <span class="reward-pill xp-pill" id="result-xp-pill">+35 XP</span>
                        <span class="reward-pill item-pill" id="result-item-pill">Grilled Fish Skewer</span>
                    </div>
                    <button class="btn-continue-cooking" id="btn-continue-cooking">Collect & Continue [Enter]</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalEl = modal;
        this.bindElements();
    }

    bindElements() {
        if (!this.modalEl) return;
        this.gaugeArcEl = this.modalEl.querySelector('#cooking-gauge-arc');
        this.timerTextEl = this.modalEl.querySelector('#roasting-timer-val');
        this.statusBadgeEl = this.modalEl.querySelector('#roasting-status-badge');
        this.btnPullEl = this.modalEl.querySelector('#btn-pull-skewer');
        this.fishSelectorContainer = this.modalEl.querySelector('#cooking-fish-selector');
        this.gaugePanel = this.modalEl.querySelector('#cooking-gauge-panel');
        this.fishGridEl = this.modalEl.querySelector('#cooking-fish-grid');
        this.resultCardEl = this.modalEl.querySelector('#cooking-result-card');
        this.btnCloseEl = this.modalEl.querySelector('#btn-close-cooking');
        this.btnContinueEl = this.modalEl.querySelector('#btn-continue-cooking');

        this.btnCloseEl?.addEventListener('click', () => this.close());
        this.btnContinueEl?.addEventListener('click', () => {
            this.resultCardEl?.classList.add('hidden');
            this.close();
        });

        this.btnPullEl?.addEventListener('click', () => this.finishCooking());
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
            } else if (e.key === ' ' || e.key === 'Enter') {
                if (this.resultCardEl && !this.resultCardEl.classList.contains('hidden')) {
                    e.preventDefault();
                    this.resultCardEl.classList.add('hidden');
                    this.close();
                } else if (this.isCooking) {
                    e.preventDefault();
                    this.finishCooking();
                }
            }
        });
    }

    initAudio() {
        if (this.audioCtx) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.audioCtx = new AudioCtx();
            }
        } catch (e) {}
    }

    startSizzleAudio() {
        this.initAudio();
        if (!this.audioCtx) return;
        try {
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

            // Procedural sizzling white noise + bandpass filter
            const bufferSize = this.audioCtx.sampleRate * 2;
            const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }

            const whiteNoise = this.audioCtx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;

            const bandpass = this.audioCtx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.value = 2400;
            bandpass.Q.value = 1.8;

            const gainNode = this.audioCtx.createGain();
            gainNode.gain.setValueAtTime(0.06, this.audioCtx.currentTime);

            whiteNoise.connect(bandpass);
            bandpass.connect(gainNode);
            gainNode.connect(this.audioCtx.destination);

            whiteNoise.start();
            this.sizzleSource = whiteNoise;
            this.sizzleGain = gainNode;

            // Random subtle charcoal pops
            this.crackleTimer = setInterval(() => {
                if (!this.isCooking) return;
                this.playCracklePop();
            }, 350 + Math.random() * 400);
        } catch (e) {}
    }

    playCracklePop() {
        if (!this.audioCtx || this.audioCtx.state !== 'running') return;
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            const now = this.audioCtx.currentTime;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300 + Math.random() * 900, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.05);

            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {}
    }

    stopSizzleAudio() {
        try {
            if (this.sizzleSource) {
                this.sizzleSource.stop();
                this.sizzleSource.disconnect();
                this.sizzleSource = null;
            }
            if (this.crackleTimer) {
                clearInterval(this.crackleTimer);
                this.crackleTimer = null;
            }
        } catch (e) {}
    }

    playChime(type = 'perfect') {
        this.initAudio();
        if (!this.audioCtx) return;
        try {
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            if (type === 'perfect') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.09); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.18); // G5
                osc.frequency.setValueAtTime(1046.50, now + 0.27); // C6
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
                osc.start(now);
                osc.stop(now + 0.55);
            } else if (type === 'burnt') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.exponentialRampToValueAtTime(75, now + 0.35);
                gain.gain.setValueAtTime(0.07, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            } else {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(320, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            }
        } catch (e) {}
    }

    /**
     * Opens the cooking interface. Checks for raw fish in bag.
     */
    open() {
        if (!window.playerInventory) return;
        const slots = window.playerInventory.slots || [];
        const rawFishSlots = [];

        slots.forEach((item, idx) => {
            if (item && (item.type === 'raw_fish' || item.id.includes('fish') || item.id.includes('koi') || item.id.includes('salmon') || item.id.includes('bass') || item.id.includes('eel') || item.id.includes('crab') || item.id.includes('ayu'))) {
                rawFishSlots.push({ item, slotIndex: idx });
            }
        });

        if (rawFishSlots.length === 0) {
            const i18n = window.TeleTermI18n;
            const msg = i18n && i18n.getLanguage() === 'vi'
                ? 'Bạn cần có cá tươi trong túi đồ để nướng! Hãy đi câu ở sông hoặc hồ Koi trước.'
                : 'You need fresh fish in your inventory to roast! Catch some at the river or koi pond first.';
            if (window.openWorld3D?.onToast) {
                window.openWorld3D.onToast(msg, 'warning');
            } else {
                alert(msg);
            }
            return;
        }

        this.isOpen = true;
        this.isCooking = false;
        this.modalEl?.classList.remove('hidden');
        this.resultCardEl?.classList.add('hidden');

        // If only 1 fish, select it immediately
        if (rawFishSlots.length === 1) {
            this.selectFishAndStart(rawFishSlots[0]);
        } else {
            this.renderFishSelector(rawFishSlots);
        }
    }

    renderFishSelector(rawFishSlots) {
        if (!this.fishGridEl) return;
        this.fishSelectorContainer?.classList.remove('hidden');
        this.gaugePanel?.classList.add('hidden');
        this.fishGridEl.innerHTML = '';

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';

        rawFishSlots.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'cooking-fish-slot-btn';
            const name = isVi ? (entry.item.vi || entry.item.name) : entry.item.name;
            const weightText = entry.item.weight ? `${entry.item.weight} kg` : 'Fresh';

            card.innerHTML = `
                <div class="slot-fish-icon">🐟</div>
                <div class="slot-fish-name">${name}</div>
                <div class="slot-fish-weight">${weightText}</div>
            `;
            card.addEventListener('click', () => {
                this.selectFishAndStart(entry);
            });
            this.fishGridEl.appendChild(card);
        });
    }

    selectFishAndStart(entry) {
        this.selectedFishItem = entry.item;
        this.selectedSlotIndex = entry.slotIndex;

        this.fishSelectorContainer?.classList.add('hidden');
        this.gaugePanel?.classList.remove('hidden');

        // Send cook_start to server
        if (window.multiplayerClient && typeof window.multiplayerClient.sendCookStart === 'function') {
            window.multiplayerClient.sendCookStart(this.selectedSlotIndex);
        } else {
            // Local fallback simulation
            this.handleServerCookStart({
                startTime: Date.now(),
                slotIndex: this.selectedSlotIndex
            });
        }
    }

    handleServerCookStart(packet) {
        this.isCooking = true;
        this.cookStartTime = packet.startTime || Date.now();
        this.startSizzleAudio();
        this.startGaugeLoop();
    }

    handleServerCookError(packet) {
        this.stopSizzleAudio();
        this.isCooking = false;
        const msg = packet.message || packet.error || 'Cooking error';
        if (window.openWorld3D?.onToast) {
            window.openWorld3D.onToast(msg, 'error');
        }
        this.close();
    }

    startGaugeLoop() {
        if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

        const circumference = 2 * Math.PI * 82; // ~515.2
        const updateGauge = () => {
            if (!this.isCooking || !this.isOpen) return;

            const now = Date.now();
            const elapsedSec = (now - this.cookStartTime) / 1000;
            const progressRatio = Math.min(1.0, elapsedSec / this.targetDurationSec);

            // Update SVG arc
            const strokeOffset = circumference * (1 - progressRatio);
            if (this.gaugeArcEl) {
                this.gaugeArcEl.style.strokeDashoffset = strokeOffset;
            }

            // Update timer text
            if (this.timerTextEl) {
                this.timerTextEl.textContent = `${elapsedSec.toFixed(1)}s`;
            }

            // Determine status
            let status = 'RAW';
            let badgeClass = 'status-raw';
            if (elapsedSec < this.perfectMinSec) {
                status = 'RAW';
                badgeClass = 'status-raw';
            } else if (elapsedSec <= this.perfectMaxSec) {
                status = 'PERFECT!';
                badgeClass = 'status-perfect';
            } else {
                status = 'BURNT';
                badgeClass = 'status-burnt';
            }

            if (this.statusBadgeEl) {
                this.statusBadgeEl.textContent = status;
                this.statusBadgeEl.className = `roasting-status-badge ${badgeClass}`;
            }

            this.animFrameId = requestAnimationFrame(updateGauge);
        };

        this.animFrameId = requestAnimationFrame(updateGauge);
    }

    finishCooking() {
        if (!this.isCooking) return;
        this.isCooking = false;
        this.stopSizzleAudio();
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        // Send cook_finish to server
        if (window.multiplayerClient && typeof window.multiplayerClient.sendCookFinish === 'function') {
            window.multiplayerClient.sendCookFinish();
        } else {
            // Local fallback simulation
            const elapsed = (Date.now() - this.cookStartTime) / 1000;
            let outcome = 'RAW';
            let item = this.selectedFishItem;
            let xp = 0;
            if (elapsed < 4.0) {
                outcome = 'RAW';
            } else if (elapsed <= 12.0) {
                outcome = 'PERFECT_ROAST';
                item = {
                    id: 'item_grilled_fish',
                    name: 'Campfire Skewered Fish',
                    vi: 'Cá Nướng Xiên Lửa Trại',
                    icon: 'flame',
                    type: 'consumable',
                    holdable: true,
                    handPose: 'small_can',
                    gripProfile: 'small_can',
                    model: 'grilled_fish'
                };
                xp = 35;
            } else {
                outcome = 'BURNT';
                item = {
                    id: 'item_burnt_fish',
                    name: 'Burnt Fish',
                    vi: 'Cá Cháy Khét',
                    icon: 'flame',
                    type: 'consumable',
                    holdable: true,
                    handPose: 'small_can',
                    gripProfile: 'small_can',
                    model: 'burnt_fish'
                };
                xp = 5;
            }
            this.handleServerCookFinish({
                outcome,
                elapsedSec: elapsed,
                item,
                awardedXp: xp,
                slotIndex: this.selectedSlotIndex
            });
        }
    }

    handleServerCookFinish(packet) {
        this.isCooking = false;
        this.stopSizzleAudio();
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';
        const outcome = packet.outcome || 'PERFECT_ROAST';

        if (this.resultCardEl) {
            this.resultCardEl.classList.remove('hidden');
            const hHeading = this.resultCardEl.querySelector('#result-heading');
            const pDesc = this.resultCardEl.querySelector('#result-desc');
            const pillXp = this.resultCardEl.querySelector('#result-xp-pill');
            const pillItem = this.resultCardEl.querySelector('#result-item-pill');
            const bIcon = this.resultCardEl.querySelector('#result-badge-icon');

            if (outcome === 'PERFECT_ROAST') {
                this.playChime('perfect');
                if (bIcon) bIcon.textContent = '🌟';
                if (hHeading) {
                    hHeading.textContent = isVi ? 'CHÍN VÀNG HOÀN HẢO!' : 'PERFECT ROAST!';
                    hHeading.style.color = '#fbbf24';
                }
                if (pDesc) {
                    pDesc.textContent = isVi
                        ? 'Cá nướng chín đều thơm lừng, thịt mềm mọng nước, vị giòn tan tuyệt đỉnh!'
                        : 'Golden crispy skin, steaming juicy meat, roasted to absolute perfection!';
                }
                if (pillXp) pillXp.textContent = `+${packet.awardedXp || 35} XP`;
                if (pillItem) pillItem.textContent = isVi ? 'Cá Nướng Xiên Lửa Trại' : 'Skewered Grilled Fish';
            } else if (outcome === 'BURNT') {
                this.playChime('burnt');
                if (bIcon) bIcon.textContent = '🔥';
                if (hHeading) {
                    hHeading.textContent = isVi ? 'CÁ BỊ CHÁY KHÉT!' : 'BURNT CINDER!';
                    hHeading.style.color = '#ef4444';
                }
                if (pDesc) {
                    pDesc.textContent = isVi
                        ? 'Để trên lửa quá lâu, cá đã hóa thành than đen khét lẹt!'
                        : 'Left over the fire for too long. Turned into a charred, bitter cinder!';
                }
                if (pillXp) pillXp.textContent = `+${packet.awardedXp || 5} XP`;
                if (pillItem) pillItem.textContent = isVi ? 'Cá Cháy Khét' : 'Burnt Fish';
            } else {
                this.playChime('raw');
                if (bIcon) bIcon.textContent = '🐟';
                if (hHeading) {
                    hHeading.textContent = isVi ? 'CÁ CHƯA KỊP CHÍN!' : 'STILL RAW!';
                    hHeading.style.color = '#38bdf8';
                }
                if (pDesc) {
                    pDesc.textContent = isVi
                        ? 'Nhấc ra quá sớm khi lửa chưa kịp làm ấm cá! Cá vẫn giữ nguyên tươi sống.'
                        : 'Pulled off too early before the embers could cook it. Kept raw in bag.';
                }
                if (pillXp) pillXp.textContent = '+0 XP';
                if (pillItem) pillItem.textContent = isVi ? 'Cá Tươi Sống' : 'Raw Fish';
            }
        }
    }

    close() {
        this.stopSizzleAudio();
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
        this.isCooking = false;
        this.isOpen = false;
        this.modalEl?.classList.add('hidden');
    }
}

export const campfireCookingSystem = new CampfireCookingSystem();
