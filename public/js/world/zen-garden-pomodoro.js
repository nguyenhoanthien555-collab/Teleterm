import * as THREE from '/vendor/three/build/three.module.js';

/**
 * TELETERM 3D — SHARED POMODORO ZEN GARDEN & GROUP SYNCHRONIZED BUFFS
 * Milestone 4: Spatial Focus Timer, Multi-Client Auras & Persistent XP Multiplier
 *
 * Implements:
 * 1. Centralized Server-Authoritative Focus Session (25m Focus, 5m Break)
 * 2. Focus Aura Particle Rings (InstancedMesh Torus with Azure-to-Gold color lerp)
 * 3. Proximity validation within 15m radius of Zen Garden Sanctuary (36.0, 0.8, -24.5)
 * 4. Procedural Web Audio Tibetan Singing Bowl chime (432Hz harmonic meditation bell)
 * 5. Persistent +25% XP Multiplier Buff (zen_focus_25)
 * 6. Interactive 3D Meditation Bowl & Cyber-Zen HUD modal
 */

export class ZenGardenPomodoroSystem {
    constructor(scene) {
        this.scene = scene;
        this.center = new THREE.Vector3(36.0, 0.8, -24.5);
        this.radius = 15.0;

        this.state = 'IDLE'; // 'IDLE' | 'FOCUS_ACTIVE' | 'BREAK_ACTIVE'
        this.endsAt = 0;
        this.startedAt = 0;
        this.durationSec = 1500;
        this.remainingSec = 0;
        this.participants = new Set();
        this.activeBuff = null;

        // Visual 3D Entity
        this.sanctuaryGroup = new THREE.Group();
        this.sanctuaryGroup.name = 'ZenPomodoroSanctuary';

        // Focus Aura InstancedMesh (Argon Spec: 1 draw call for all players)
        this.auraMesh = null;
        this.maxAuras = 32;
        this.dummy = new THREE.Object3D();

        // Web Audio Context for Singing Bowl
        this.audioCtx = null;

        this.buildSanctuaryProp();
        this.initAuraInstancedMesh();
        this.initDOM();

        if (this.scene) {
            this.scene.add(this.sanctuaryGroup);
        }

        if (typeof window !== 'undefined') {
            window.zenGardenPomodoro = this;
        }
    }

    buildSanctuaryProp() {
        const group = new THREE.Group();
        group.position.copy(this.center);

        // 1. Dark Cedar Meditation Table / Altar
        const tableGeo = new THREE.BoxGeometry(1.6, 0.55, 0.9);
        const tableMat = new THREE.MeshStandardMaterial({ color: 0x271911, roughness: 0.82 });
        const table = new THREE.Mesh(tableGeo, tableMat);
        table.position.y = 0.275;
        group.add(table);

        // 2. Silk Meditation Cushion (Zafu)
        const zafuGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.12, 16);
        const zafuMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.9 });
        const zafu = new THREE.Mesh(zafuGeo, zafuMat);
        zafu.position.set(0, 0.61, 0);
        group.add(zafu);

        // 3. Antique Bronze Tibetan Singing Bowl
        const bowlGeo = new THREE.CylinderGeometry(0.22, 0.12, 0.18, 24, 1, true);
        const bowlMat = new THREE.MeshStandardMaterial({
            color: 0xd97706, // Polished bronze
            metalness: 0.85,
            roughness: 0.28
        });
        const bowl = new THREE.Mesh(bowlGeo, bowlMat);
        bowl.position.set(0, 0.74, 0);
        group.add(bowl);

        // Bowl interior rim
        const rimGeo = new THREE.TorusGeometry(0.21, 0.015, 8, 24);
        rimGeo.rotateX(Math.PI / 2);
        const rim = new THREE.Mesh(rimGeo, bowlMat);
        rim.position.set(0, 0.83, 0);
        group.add(rim);

        // Wooden Mallet resting beside bowl
        const malletGeo = new THREE.CylinderGeometry(0.016, 0.02, 0.26, 8);
        malletGeo.rotateZ(Math.PI / 3);
        const malletMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
        const mallet = new THREE.Mesh(malletGeo, malletMat);
        mallet.position.set(0.35, 0.57, 0.15);
        group.add(mallet);

        // Subtle incense smoke / particle glow anchor
        const glowGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.8 });
        const burner = new THREE.Mesh(glowGeo, glowMat);
        burner.position.set(-0.45, 0.58, -0.15);
        group.add(burner);

        this.sanctuaryGroup.add(group);
    }

    initAuraInstancedMesh() {
        // Torus focus ring floating at player's feet
        const ringGeo = new THREE.TorusGeometry(0.95, 0.035, 12, 36);
        ringGeo.rotateX(Math.PI / 2);

        this.auraMaterial = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.auraMesh = new THREE.InstancedMesh(ringGeo, this.auraMaterial, this.maxAuras);
        this.auraMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.auraMesh.frustumCulled = false;
        this.auraMesh.visible = false;

        this.sanctuaryGroup.add(this.auraMesh);
    }

    initDOM() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('modal-zen-pomodoro')) return;

        const modal = document.createElement('div');
        modal.id = 'modal-zen-pomodoro';
        modal.className = 'zen-pomodoro-overlay hidden';
        modal.innerHTML = `
            <div class="pomodoro-card">
                <div class="pomodoro-header">
                    <span class="pomodoro-icon">🧘</span>
                    <div>
                        <h3 class="pomodoro-title">Zen Garden Focus Sanctuary</h3>
                        <p class="pomodoro-subtitle">Synchronized 25m Pomodoro & +25% XP Buff</p>
                    </div>
                    <button id="btn-close-pomodoro" class="pomodoro-close-btn">&times;</button>
                </div>

                <div class="pomodoro-timer-display">
                    <div class="pomodoro-clock-ring">
                        <svg class="ring-svg" width="160" height="160" viewBox="0 0 160 160">
                            <circle class="ring-track" cx="80" cy="80" r="70" />
                            <circle id="pomodoro-ring-progress" class="ring-progress" cx="80" cy="80" r="70" />
                        </svg>
                        <div class="clock-inner">
                            <span id="pomodoro-status-badge" class="pomodoro-badge badge-idle">IDLE</span>
                            <span id="pomodoro-countdown-text" class="pomodoro-time">25:00</span>
                            <span id="pomodoro-cycle-label" class="pomodoro-cycle">Focus Session</span>
                        </div>
                    </div>
                </div>

                <div class="pomodoro-buff-banner">
                    <span class="buff-icon">✨</span>
                    <div class="buff-info">
                        <span class="buff-title">Zen Mind Multiplier (+25% XP)</span>
                        <span id="pomodoro-buff-timer" class="buff-timer">Complete 25m Focus to Earn</span>
                    </div>
                </div>

                <div class="pomodoro-actions">
                    <button id="btn-pomodoro-action" class="pomodoro-btn-primary">▶ Start 25m Focus Session</button>
                    <button id="btn-pomodoro-optin" class="pomodoro-btn-secondary">✨ Join Group Focus</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#btn-close-pomodoro')?.addEventListener('click', () => {
            this.close();
        });

        modal.querySelector('#btn-pomodoro-action')?.addEventListener('click', () => {
            if (this.state === 'IDLE') {
                if (window.multiplayerClient) {
                    window.multiplayerClient.sendPomodoroStart(1500);
                } else {
                    this.state = 'FOCUS_ACTIVE';
                    this.durationSec = 1500;
                    this.endsAt = Date.now() + 1500 * 1000;
                    this.updateUI();
                }
            }
        });

        modal.querySelector('#btn-pomodoro-optin')?.addEventListener('click', () => {
            const myId = window.multiplayerClient?.myUserId || 'local_player';
            if (this.participants.has(myId)) {
                if (window.multiplayerClient) window.multiplayerClient.sendPomodoroLeave();
                this.participants.delete(myId);
            } else {
                if (window.multiplayerClient) window.multiplayerClient.sendPomodoroJoin();
                this.participants.add(myId);
            }
            this.updateUI();
        });
    }

    open() {
        const modal = document.getElementById('modal-zen-pomodoro');
        if (modal) modal.classList.remove('hidden');
        this.updateUI();
    }

    close() {
        const modal = document.getElementById('modal-zen-pomodoro');
        if (modal) modal.classList.add('hidden');
    }

    syncState(packet) {
        if (!packet) return;
        const prevState = this.state;
        this.state = packet.state || 'IDLE';
        this.endsAt = packet.endsAt || 0;
        this.startedAt = packet.startedAt || 0;
        this.durationSec = packet.durationSec || 1500;
        this.remainingSec = typeof packet.remainingSec === 'number' ? packet.remainingSec : 0;

        if (Array.isArray(packet.participants)) {
            this.participants = new Set(packet.participants);
        }

        // Trigger singing bowl chime locally upon state transition to BREAK_ACTIVE
        if (prevState === 'FOCUS_ACTIVE' && this.state === 'BREAK_ACTIVE') {
            this.playSingingBowlChime();
        }

        this.updateUI();
    }

    onBuffAwarded(packet) {
        if (packet.buff) {
            this.activeBuff = packet.buff;
        }
        this.playSingingBowlChime();
        if (window.openWorld3D?.onToast) {
            window.openWorld3D.onToast('🧘 Zen Mind Buff Activated! +25% XP for 30 minutes.', 'success');
        }
        this.updateUI();
    }

    updateUI() {
        const badgeEl = document.getElementById('pomodoro-status-badge');
        const countdownEl = document.getElementById('pomodoro-countdown-text');
        const cycleLabelEl = document.getElementById('pomodoro-cycle-label');
        const ringProgressEl = document.getElementById('pomodoro-ring-progress');
        const actionBtn = document.getElementById('btn-pomodoro-action');
        const optInBtn = document.getElementById('btn-pomodoro-optin');
        const buffTimerEl = document.getElementById('pomodoro-buff-timer');

        // Remaining seconds calculation
        const now = Date.now();
        let remSec = 0;
        if (this.state !== 'IDLE' && this.endsAt > now) {
            remSec = Math.ceil((this.endsAt - now) / 1000);
        } else if (this.state === 'IDLE') {
            remSec = 1500;
        }

        const mins = Math.floor(remSec / 60);
        const secs = remSec % 60;
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (countdownEl) countdownEl.textContent = timeStr;

        if (badgeEl) {
            badgeEl.className = 'pomodoro-badge';
            if (this.state === 'FOCUS_ACTIVE') {
                badgeEl.classList.add('badge-focus');
                badgeEl.textContent = 'FOCUS ACTIVE';
            } else if (this.state === 'BREAK_ACTIVE') {
                badgeEl.classList.add('badge-break');
                badgeEl.textContent = 'BREAK REST';
            } else {
                badgeEl.classList.add('badge-idle');
                badgeEl.textContent = 'IDLE';
            }
        }

        if (cycleLabelEl) {
            cycleLabelEl.textContent = this.state === 'BREAK_ACTIVE' ? 'Restorative Break' : 'Deep Work Cadence';
        }

        // SVG Ring progress (circumference = 2 * PI * 70 = 439.82)
        if (ringProgressEl) {
            const totalDuration = this.state === 'BREAK_ACTIVE' ? 300 : this.durationSec;
            const progressRatio = totalDuration > 0 ? (remSec / totalDuration) : 1.0;
            const dashOffset = 439.82 * (1.0 - progressRatio);
            ringProgressEl.style.strokeDashoffset = String(dashOffset);

            if (this.state === 'BREAK_ACTIVE') {
                ringProgressEl.style.stroke = '#10b981'; // Emerald break
            } else {
                // Color lerp from azure to gold
                ringProgressEl.style.stroke = progressRatio > 0.3 ? '#38bdf8' : '#fbbf24';
            }
        }

        // Buttons
        const myId = window.multiplayerClient?.myUserId || 'local_player';
        const isJoined = this.participants.has(myId);

        if (actionBtn) {
            if (this.state === 'IDLE') {
                actionBtn.textContent = '▶ Start 25m Focus Session';
                actionBtn.disabled = false;
            } else if (this.state === 'FOCUS_ACTIVE') {
                actionBtn.textContent = '⏳ Focus in Progress...';
                actionBtn.disabled = true;
            } else {
                actionBtn.textContent = '🍵 Break in Progress...';
                actionBtn.disabled = true;
            }
        }

        if (optInBtn) {
            optInBtn.textContent = isJoined ? '✓ Studying with Group (Joined)' : '✨ Join Group Focus';
            optInBtn.style.borderColor = isJoined ? '#10b981' : '#38bdf8';
        }

        // Buff Timer
        if (buffTimerEl) {
            if (this.activeBuff && this.activeBuff.expiresAt > now) {
                const buffRemMin = Math.ceil((this.activeBuff.expiresAt - now) / 60000);
                buffTimerEl.textContent = `Active: +25% XP Multiplier (${buffRemMin}m remaining)`;
                buffTimerEl.style.color = '#38bdf8';
            } else {
                buffTimerEl.textContent = 'Complete 25m Focus to Earn';
                buffTimerEl.style.color = '#94a3b8';
            }
        }
    }

    /**
     * Procedural Web Audio Tibetan Singing Bowl Chime (432Hz fundamental + harmonics)
     */
    playSingingBowlChime() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            if (!this.audioCtx) this.audioCtx = new AudioCtx();
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

            const now = this.audioCtx.currentTime;
            // 432Hz (Sacred meditation bowl tuning) + natural overtones
            const frequencies = [432.0, 864.0, 1296.0, 1728.0];
            const gains = [0.28, 0.12, 0.06, 0.025];
            const decay = 3.5; // Long resonant decay

            frequencies.forEach((freq, i) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                gain.gain.setValueAtTime(gains[i], now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);

                osc.start(now);
                osc.stop(now + decay);
            });
        } catch (e) {}
    }

    /**
     * Updates focus auras and local proximity validation
     */
    update(delta, playerPos = null) {
        // 1. Proximity check for opt-in participants
        if (playerPos) {
            const dx = playerPos.x - this.center.x;
            const dz = playerPos.z - this.center.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            const myId = window.multiplayerClient?.myUserId;

            if (dist > this.radius) {
                let changed = false;
                if (myId && this.participants.has(myId)) {
                    this.participants.delete(myId);
                    changed = true;
                }
                if (this.participants.has('local_player')) {
                    this.participants.delete('local_player');
                    changed = true;
                }

                if (changed) {
                    if (window.multiplayerClient) window.multiplayerClient.sendPomodoroLeave();
                    if (window.openWorld3D?.onToast) {
                        window.openWorld3D.onToast('Exited Zen Garden Focus Zone. Focus session paused.', 'warning');
                    }
                    this.updateUI();
                }
            }
        }

        // 2. Render Focus Auras for active participants during FOCUS_ACTIVE
        if (!this.auraMesh) return;

        if (this.state !== 'FOCUS_ACTIVE' || this.participants.size === 0) {
            this.auraMesh.visible = false;
            return;
        }

        this.auraMesh.visible = true;

        const time = performance.now() / 1000.0;
        const totalDuration = this.durationSec || 1500;
        const remSec = Math.max(0, (this.endsAt - Date.now()) / 1000);
        const focusProgress = 1.0 - (remSec / totalDuration); // 0.0 to 1.0

        // Parametric scale: Radius = R_base + sin(t * omega) * 0.15
        const breathingScale = 1.0 + Math.sin(time * 2.2) * 0.12;

        // Color lerp from calm Azure (#38bdf8) to Gold (#fbbf24)
        const azure = new THREE.Color(0x38bdf8);
        const gold = new THREE.Color(0xfbbf24);
        this.auraMaterial.color.copy(azure).lerp(gold, focusProgress);

        let auraIdx = 0;

        // Render local player's aura if participating
        const myId = window.multiplayerClient?.myUserId;
        const isMeParticipating = (myId && this.participants.has(myId)) || this.participants.has('local_player');
        if (isMeParticipating && playerPos) {
            this.dummy.position.set(playerPos.x, playerPos.y + 0.06, playerPos.z);
            this.dummy.scale.set(breathingScale, breathingScale, breathingScale);
            this.dummy.updateMatrix();
            this.auraMesh.setMatrixAt(auraIdx++, this.dummy.matrix);
        }

        // Render remote players' auras if participating
        if (window.multiplayerClient?.remotePlayers) {
            window.multiplayerClient.remotePlayers.forEach((rp, rId) => {
                if (this.participants.has(rId) && rp.group && auraIdx < this.maxAuras) {
                    this.dummy.position.set(rp.group.position.x, rp.group.position.y + 0.06, rp.group.position.z);
                    this.dummy.scale.set(breathingScale, breathingScale, breathingScale);
                    this.dummy.updateMatrix();
                    this.auraMesh.setMatrixAt(auraIdx++, this.dummy.matrix);
                }
            });
        }

        // Hide unused instances
        for (let i = auraIdx; i < this.maxAuras; i++) {
            this.dummy.position.set(0, -9999, 0);
            this.dummy.updateMatrix();
            this.auraMesh.setMatrixAt(i, this.dummy.matrix);
        }

        this.auraMesh.instanceMatrix.needsUpdate = true;
    }
}

if (typeof window !== 'undefined') {
    window.ZenGardenPomodoroSystem = ZenGardenPomodoroSystem;
}
