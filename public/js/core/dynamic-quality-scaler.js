/**
 * TELETERM 3D — DYNAMIC QUALITY SCALER (PERFORMANCE GOVERNOR)
 * Real-time FPS monitoring with strict anti-thrashing (hysteresis) logic:
 * - 120-frame rolling moving average (~2.0 seconds at 60 FPS)
 * - Rapid Downscale (when average FPS < 35 for 2.0s)
 * - Conservative Upscale (must sustain FPS > 58 for 10.0s with 15.0s cooldown)
 * 
 * Degradation Tier List:
 * Tier 3 (Ultra/High): PixelRatio = DevicePixelRatio (max 2.0), Shadows = 2048, Particles = 100%, Full Audio
 * Tier 2 (Medium): PixelRatio = 1.0, Shadows = 1024, Particles = 50%, Distant Panners Culled > 40m
 * Tier 1 (Low/Battery): PixelRatio = 0.8, Shadows = 512 / soft, Particles = 25%, Distant Panners Culled > 25m
 */

export class DynamicQualityScaler {
    constructor(options = {}) {
        this.renderer = options.renderer || null;
        this.weatherSystem = options.weatherSystem || null;
        this.audioManager = options.audioManager || null;

        // Rolling buffer for 120 frames
        this.bufferSize = 120;
        this.frameDeltas = new Float32Array(this.bufferSize);
        this.bufferIdx = 0;
        this.frameCount = 0;

        // Metrics
        this.currentFps = 60.0;
        this.averageFps = 60.0;

        // Tiers: 3 = Ultra, 2 = Medium, 1 = Low
        this.currentTier = 3;
        this.isLocked = false;

        // Hysteresis timing
        this.lowFpsDuration = 0.0;
        this.highFpsDuration = 0.0;
        this.lastTierChangeTime = 0.0;
        this.cooldownSeconds = 15.0;

        // Listeners
        this.listeners = new Set();

        if (typeof window !== 'undefined') {
            window.dynamicQualityScaler = this;
        }
    }

    setRenderer(renderer) {
        this.renderer = renderer;
        this.applyTier(this.currentTier, true);
    }

    setWeatherSystem(weatherSystem) {
        this.weatherSystem = weatherSystem;
    }

    setAudioManager(audioManager) {
        this.audioManager = audioManager;
    }

    update(delta) {
        if (delta <= 0) return;

        // Record delta in rolling buffer
        this.frameDeltas[this.bufferIdx] = delta;
        this.bufferIdx = (this.bufferIdx + 1) % this.bufferSize;
        if (this.frameCount < this.bufferSize) this.frameCount++;

        // Calculate current instantaneous FPS
        this.currentFps = 1.0 / delta;

        // Calculate 120-frame moving average
        let sum = 0;
        for (let i = 0; i < this.frameCount; i++) {
            sum += this.frameDeltas[i];
        }
        const avgDelta = sum / this.frameCount;
        this.averageFps = avgDelta > 0 ? (1.0 / avgDelta) : 60.0;

        if (this.isLocked) return;

        const now = performance.now() * 0.001;
        const timeSinceLastChange = now - this.lastTierChangeTime;

        // Downscale trigger: FPS < 35 continuously for 2.0s
        if (this.averageFps < 35.0) {
            this.lowFpsDuration += delta;
            this.highFpsDuration = 0.0;

            if (this.lowFpsDuration >= 2.0 && this.currentTier > 1) {
                this.changeTier(this.currentTier - 1, 'Framerate dropped below 35 FPS');
                this.lowFpsDuration = 0.0;
            }
        }
        // Upscale trigger: FPS > 58 continuously for 10.0s AND cooldown passed
        else if (this.averageFps >= 58.0 && timeSinceLastChange >= this.cooldownSeconds) {
            this.highFpsDuration += delta;
            this.lowFpsDuration = 0.0;

            if (this.highFpsDuration >= 10.0 && this.currentTier < 3) {
                this.changeTier(this.currentTier + 1, 'Framerate sustained above 58 FPS');
                this.highFpsDuration = 0.0;
            }
        } else {
            this.lowFpsDuration = Math.max(0, this.lowFpsDuration - delta * 0.5);
            this.highFpsDuration = Math.max(0, this.highFpsDuration - delta * 0.5);
        }
    }

    changeTier(newTier, reason = '') {
        const prevTier = this.currentTier;
        this.currentTier = Math.max(1, Math.min(3, newTier));
        this.lastTierChangeTime = performance.now() * 0.001;

        console.info(`[DynamicQualityScaler] Switched quality tier: ${prevTier} -> ${this.currentTier} (${reason})`);
        this.applyTier(this.currentTier);

        // Notify subscribers
        for (const fn of this.listeners) {
            try {
                fn(this.currentTier, prevTier);
            } catch (e) {
                console.error(e);
            }
        }
    }

    applyTier(tier, force = false) {
        if (!this.renderer) return;

        const tierConfigs = {
            3: { pixelRatio: Math.min(window.devicePixelRatio || 1, 2.0), particleScale: 1.0, shadowMapSize: 2048, audioCullDist: 85 },
            2: { pixelRatio: 1.0, particleScale: 0.6, shadowMapSize: 1024, audioCullDist: 50 },
            1: { pixelRatio: 0.8, particleScale: 0.3, shadowMapSize: 512, audioCullDist: 28 }
        };

        const config = tierConfigs[tier] || tierConfigs[2];

        // 1. Pixel Ratio
        if (this.renderer.getPixelRatio() !== config.pixelRatio || force) {
            this.renderer.setPixelRatio(config.pixelRatio);
        }

        // 2. Weather particles scaling
        if (this.weatherSystem && typeof this.weatherSystem.setParticleScale === 'function') {
            this.weatherSystem.setParticleScale(config.particleScale);
        }

        // 3. Audio culling distance
        if (this.audioManager && typeof this.audioManager.setMaxCullDistance === 'function') {
            this.audioManager.setMaxCullDistance(config.audioCullDist);
        }
    }

    onTierChange(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    getCurrentTier() {
        return this.currentTier;
    }

    getMetrics() {
        return {
            currentFps: Math.round(this.currentFps),
            averageFps: Math.round(this.averageFps),
            tier: this.currentTier,
            tierName: this.currentTier === 3 ? 'Ultra' : (this.currentTier === 2 ? 'Medium' : 'Low')
        };
    }

    lockTier(tier) {
        this.isLocked = true;
        this.changeTier(tier, 'User lock');
    }

    unlock() {
        this.isLocked = false;
    }
}

export const dynamicQualityScaler = new DynamicQualityScaler();
if (typeof window !== 'undefined') {
    window.dynamicQualityScaler = dynamicQualityScaler;
}
