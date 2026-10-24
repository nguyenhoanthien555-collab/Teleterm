/**
 * TeleTerm Thermal & Battery Performance Governor (v2.0)
 * Architected in collaboration with Lead Architect Gemini 4 Argon (/ask-argon).
 * 
 * Protects hardware thermals, reduces CPU/GPU power draw, and eliminates laptop heat
 * while preserving AAA visual fidelity when actively playing.
 * 
 * Thermal States & FPS Budgets:
 * - ACTIVE (60 FPS): User actively moving, turning camera, or interacting.
 * - IDLE (30 FPS): User idle for > 3.0 seconds (halves GPU load & fan noise).
 * - FOCUS (15 FPS): User inside Terminal Web or AI Assistant mode.
 * - LAUNCHER (10 FPS): User at Start Screen / Desktop Launcher.
 * - PAUSED (0 FPS): Browser tab hidden or minimized.
 * - COOLING MODE (Toggle): Caps max FPS to 45/30, DPR to 1.0, disables heavy post-passes.
 */

export class ThermalGovernor {
    constructor(openWorld3D) {
        this.ow = openWorld3D;
        this.renderer = openWorld3D.renderer;

        // Configuration
        this.idleThresholdMs = 3000;
        this.isCoolingMode = false;
        
        // Load saved Cooling Mode preference
        try {
            const saved = localStorage.getItem('teleterm_cooling_mode');
            this.isCoolingMode = saved === 'true';
        } catch (e) {}

        // State
        this.currentState = 'ACTIVE'; // ACTIVE | IDLE | FOCUS | LAUNCHER | PAUSED
        this.lastInputTime = performance.now();
        this.lastShadowUpdateTime = 0;
        this.lastPlayerPos = { x: 0, y: 0, z: 0 };
        this.targetFPS = 60;
        this.targetInterval = 1000 / 60;

        // Shadow update throttling
        this.shadowUpdateIntervalMs = 350; // Update shadows at ~3Hz max instead of 60Hz
        this.shadowNeedsUpdate = true;

        this.init();
    }

    init() {
        // Configure Renderer for Cool Thermals
        if (this.renderer && this.renderer.shadowMap) {
            this.renderer.shadowMap.autoUpdate = false; // Disable continuous 60fps shadow re-rendering
            this.renderer.shadowMap.needsUpdate = true;
        }

        // Apply DPR cap
        this.applyThermalDPR();

        // Listen for user interactions to reset idle timer
        const onActivity = () => {
            this.lastInputTime = performance.now();
            if (this.currentState === 'IDLE') {
                this.evaluateState();
            }
        };

        window.addEventListener('pointermove', onActivity, { passive: true });
        window.addEventListener('keydown', onActivity, { passive: true });
        window.addEventListener('wheel', onActivity, { passive: true });
        window.addEventListener('touchstart', onActivity, { passive: true });

        // Visibility changes
        document.addEventListener('visibilitychange', () => {
            this.evaluateState();
        });

        // Initialize UI pill button if present
        this.initUiPill();
    }

    setCoolingMode(enabled) {
        this.isCoolingMode = !!enabled;
        try {
            localStorage.setItem('teleterm_cooling_mode', String(this.isCoolingMode));
        } catch (e) {}

        this.applyThermalDPR();
        this.evaluateState();
        this.updateUiPill();

        if (this.ow && this.ow.onToast) {
            this.ow.onToast(this.isCoolingMode ? '❄️ Cooling Mode: ON (Tiết kiệm pin & hạ nhiệt máy)' : '⚡ Performance Mode: ON (60 FPS)', 'info');
        }
    }

    toggleCoolingMode() {
        this.setCoolingMode(!this.isCoolingMode);
    }

    applyThermalDPR() {
        if (!this.renderer) return;
        const baseDpr = window.devicePixelRatio || 1;
        // In cooling mode, force crisp 1.0 DPR. Otherwise cap at 1.25.
        const targetDpr = this.isCoolingMode ? 1.0 : Math.min(baseDpr, 1.25);
        this.renderer.setPixelRatio(targetDpr);
        if (this.ow.postProcessing && this.ow.postProcessing.composer) {
            this.ow.postProcessing.composer.setPixelRatio(targetDpr);
        }
    }

    evaluateState() {
        if (document.hidden) {
            this.currentState = 'PAUSED';
            this.targetFPS = 0;
            this.targetInterval = 999999;
            return;
        }

        if (document.body.classList.contains('launcher-active')) {
            this.currentState = 'LAUNCHER';
            this.targetFPS = 12; // Serene low-power background
            this.targetInterval = 1000 / 12;
            return;
        }

        // Check if inside Terminal or AI Assistant focus mode
        const isFocusMode = document.body.classList.contains('mode-focus') || 
                            document.body.classList.contains('mode-terminal') ||
                            (this.ow && !this.ow.isExploreMode);

        if (isFocusMode) {
            this.currentState = 'FOCUS';
            this.targetFPS = this.isCoolingMode ? 10 : 15;
            this.targetInterval = 1000 / this.targetFPS;
            return;
        }

        // Check idle
        const now = performance.now();
        const isIdle = (now - this.lastInputTime) > this.idleThresholdMs;

        if (isIdle) {
            this.currentState = 'IDLE';
            this.targetFPS = this.isCoolingMode ? 24 : 30; // Half load
            this.targetInterval = 1000 / this.targetFPS;
            return;
        }

        // Active State
        this.currentState = 'ACTIVE';
        this.targetFPS = this.isCoolingMode ? 45 : 60;
        this.targetInterval = 1000 / this.targetFPS;
    }

    /**
     * Determines whether the current frame should be rendered based on thermal budget
     */
    shouldRenderFrame(now, lastRenderTime) {
        this.evaluateState();

        if (this.targetFPS <= 0) {
            return false;
        }

        const elapsed = now - lastRenderTime;
        return elapsed >= (this.targetInterval - 1.5);
    }

    /**
     * On-Demand Shadow Map Governor:
     * Only flags shadowMap.needsUpdate = true when player moves > 0.4m or interval expires.
     */
    governShadows(playerPos) {
        if (!this.renderer || !this.renderer.shadowMap || !this.renderer.shadowMap.enabled) {
            return;
        }

        const now = performance.now();

        // In Focus or Launcher, freeze shadow map recomputation
        if (this.currentState === 'FOCUS' || this.currentState === 'LAUNCHER' || this.currentState === 'PAUSED') {
            this.renderer.shadowMap.needsUpdate = false;
            return;
        }

        let moved = false;
        if (playerPos) {
            const dx = playerPos.x - this.lastPlayerPos.x;
            const dz = playerPos.z - this.lastPlayerPos.z;
            const distSq = dx * dx + dz * dz;
            if (distSq > 0.16) { // ~0.4 meter movement
                moved = true;
                this.lastPlayerPos.x = playerPos.x;
                this.lastPlayerPos.y = playerPos.y;
                this.lastPlayerPos.z = playerPos.z;
            }
        }

        const timeElapsed = (now - this.lastShadowUpdateTime) > this.shadowUpdateIntervalMs;

        if (moved || timeElapsed || this.shadowNeedsUpdate) {
            this.renderer.shadowMap.needsUpdate = true;
            this.lastShadowUpdateTime = now;
            this.shadowNeedsUpdate = false;
        } else {
            this.renderer.shadowMap.needsUpdate = false;
        }
    }

    initUiPill() {
        if (typeof document === 'undefined') return;
        
        let pill = document.getElementById('btn-cooling-mode-toggle');
        if (!pill) {
            const topStats = document.querySelector('.top-stats-capsule') || document.querySelector('.nav-actions');
            if (topStats) {
                pill = document.createElement('button');
                pill.id = 'btn-cooling-mode-toggle';
                pill.className = 'cyber-btn-nav btn-cooling-mode';
                pill.title = 'Hạ Nhiệt Máy & Tiết Kiệm Pin (Cooling Mode)';
                pill.innerHTML = `
                    <span class="cooling-icon">❄️</span>
                    <span class="cooling-text">Cool</span>
                `;
                pill.addEventListener('click', () => this.toggleCoolingMode());
                topStats.appendChild(pill);
            }
        } else {
            pill.addEventListener('click', () => this.toggleCoolingMode());
        }
        this.updateUiPill();
    }

    updateUiPill() {
        const pill = document.getElementById('btn-cooling-mode-toggle');
        if (!pill) return;
        if (this.isCoolingMode) {
            pill.classList.add('cooling-active');
            pill.innerHTML = `<span class="cooling-icon">❄️</span> <span class="cooling-text">Cool: ON</span>`;
        } else {
            pill.classList.remove('cooling-active');
            pill.innerHTML = `<span class="cooling-icon">⚡</span> <span class="cooling-text">Eco</span>`;
        }
    }
}
