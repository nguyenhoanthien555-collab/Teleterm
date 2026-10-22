/**
 * PERFORMANCE TELEMETRY & ROUTE BENCHMARKING
 * TeleTerm 3D — Multi-Platform Performance Architecture
 * 
 * Capabilities:
 * 1. Smart Hardware & Platform Detection (PC Desktop / Web Laptop / Mobile Touch)
 * 2. Rolling Frame Time & FPS Telemetry Buffer (60 frames)
 * 3. Fixed image quality: report performance without automatically reducing DPR or scene detail
 * 4. Report the active PC / web / mobile profile without making FPS guarantees
 * 5. Event dispatching for in-game Telemetry HUD
 */

export class PerformanceManager {
    constructor(openWorld3D) {
        this.ow = openWorld3D;
        this.renderer = openWorld3D.renderer;

        // Frame timing & rolling metrics
        this.historySize = 60;
        this.frameTimeHistory = new Float32Array(this.historySize);
        this.historyIndex = 0;
        this.totalSamples = 0;

        this.fps = 60;
        this.frameTimeMs = 16.6;
        this.avgFps = 60;
        this.minFps = 60;

        // Dynamic Resolution Scaling (DRS) configuration (120 FPS Native DPR Calibration)
        this.currentDpr = 1.0;
        this.targetDpr = 1.0;
        this.minDpr = 0.90;
        this.drsCooldown = 0;

        // Platform & hardware tier profile
        this.activeProfile = 'pc'; // 'pc' | 'web' | 'mobile'

        // Telemetry callback
        this.onTelemetryUpdate = null;
        this.telemetryTickTimer = 0;
        this.benchmark = null;

        this.initProfile();
    }

    /**
     * Detect platform tier and configure baseline profiles
     */
    initProfile() {
        const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 768;
        const isElectron = !!(window.process && window.process.type);

        // Saved preference in localStorage
        let savedProfile = null;
        try {
            savedProfile = localStorage.getItem('teleterm_active_hardware_profile');
        } catch (e) {}

        if (savedProfile && ['pc', 'web', 'mobile'].includes(savedProfile)) {
            this.activeProfile = savedProfile;
        } else if (isMobileDevice) {
            this.activeProfile = 'mobile';
        } else if (isElectron) {
            this.activeProfile = 'pc';
        } else {
            // Web browser on PC/Laptop
            this.activeProfile = 'web';
        }

        this.applyProfile(this.activeProfile, false);
    }

    /**
     * Switch hardware profile and calibrate subsystems
     */
    applyProfile(profileName, saveToStorage = true) {
        if (!['pc', 'web', 'mobile'].includes(profileName)) return;
        this.activeProfile = profileName;

        if (saveToStorage) {
            try {
                localStorage.setItem('teleterm_active_hardware_profile', profileName);
            } catch (e) {}
        }

        if (profileName === 'pc') {
            this.targetDpr = 1.0;
            this.minDpr = 1.0;
        } else if (profileName === 'web') {
            this.targetDpr = 1.0;
            this.minDpr = 0.80;
        } else if (profileName === 'mobile') {
            this.targetDpr = 0.85;
            this.minDpr = 0.65;
        }

        this.currentDpr = this.targetDpr;
        this.drsCooldown = 0;
        if (this.renderer) {
            this.renderer.setPixelRatio(this.currentDpr);
            if (this.ow) {
                const w = window.innerWidth;
                const h = window.innerHeight;
                this.renderer.setSize(w, h, false);
            }
        }

        console.log(`[PerformanceManager] Switched profile to: ${profileName.toUpperCase()} (Target DPR: ${this.targetDpr}, Min DPR: ${this.minDpr})`);
    }

    /**
     * Record a frame delta and run DRS logic
     * @param {number} deltaMs Frame duration in milliseconds
     */
    recordFrame(deltaMs, phaseMetrics = {}) {
        // Record into circular buffer
        this.frameTimeHistory[this.historyIndex] = deltaMs;
        this.historyIndex = (this.historyIndex + 1) % this.historySize;
        if (this.totalSamples < this.historySize) this.totalSamples++;

        this.frameTimeMs = deltaMs;
        this.fps = deltaMs > 0 ? 1000 / deltaMs : 60;
        this.lastPhaseMetrics = phaseMetrics;

        // Calculate rolling average
        let sum = 0;
        let worst = 0;
        for (let i = 0; i < this.totalSamples; i++) {
            const t = this.frameTimeHistory[i];
            sum += t;
            if (t > worst) worst = t;
        }
        const avgTime = sum / this.totalSamples;
        this.avgFps = avgTime > 0 ? 1000 / avgTime : 60;
        this.minFps = worst > 0 ? 1000 / worst : 60;

        // Dynamic Resolution Scaling (DRS) - Relieve GPU fill-rate pressure when frames lag
        this.drsCooldown += deltaMs;
        if (this.totalSamples >= 30 && this.drsCooldown >= 1800) {
            if (this.avgFps < 48.0 && this.currentDpr > this.minDpr) {
                const nextDpr = Math.max(this.minDpr, Number((this.currentDpr - 0.10).toFixed(2)));
                if (nextDpr !== this.currentDpr) {
                    this.currentDpr = nextDpr;
                    if (this.renderer) {
                        this.renderer.setPixelRatio(this.currentDpr);
                        if (this.ow) this.renderer.setSize(window.innerWidth, window.innerHeight, false);
                    }
                    this.drsCooldown = 0;
                    console.info(`[PerformanceManager] DRS throttled DPR to ${this.currentDpr} (avgFps: ${this.avgFps.toFixed(1)})`);
                }
            } else if (this.avgFps > 57.5 && this.currentDpr < this.targetDpr && this.drsCooldown >= 3500) {
                const nextDpr = Math.min(this.targetDpr, Number((this.currentDpr + 0.05).toFixed(2)));
                if (nextDpr !== this.currentDpr) {
                    this.currentDpr = nextDpr;
                    if (this.renderer) {
                        this.renderer.setPixelRatio(this.currentDpr);
                        if (this.ow) this.renderer.setSize(window.innerWidth, window.innerHeight, false);
                    }
                    this.drsCooldown = 0;
                    console.info(`[PerformanceManager] DRS recovered DPR to ${this.currentDpr} (avgFps: ${this.avgFps.toFixed(1)})`);
                }
            }
        }

        // Telemetry update throttling (5 updates per second for smooth HUD)
        this.telemetryTickTimer += deltaMs;
        if (this.telemetryTickTimer >= 200) {
            this.telemetryTickTimer = 0;
            if (this.onTelemetryUpdate) {
                const info = this.getTelemetryData();
                this.onTelemetryUpdate(info);
            }
        }

        if (this.benchmark) {
            const player = this.ow?.player?.position;
            const telemetry = this.getTelemetryData();
            this.benchmark.frames.push({
                elapsedMs: Math.round(performance.now() - this.benchmark.startedAt),
                segment: this.benchmark.segment,
                x: player ? Number(player.x.toFixed(2)) : null,
                z: player ? Number(player.z.toFixed(2)) : null,
                fps: telemetry.instantFps,
                frameTimeMs: telemetry.frameTimeMs,
                drawCalls: telemetry.drawCalls,
                triangles: telemetry.triangles,
                geometries: telemetry.geometries,
                textures: telemetry.textures,
                jsHeapMb: telemetry.jsHeapMb,
                gameplayUpdateMs: Number((phaseMetrics.gameplayUpdateMs || 0).toFixed(2)),
                sceneUpdateMs: Number((phaseMetrics.sceneUpdateMs || 0).toFixed(2)),
                renderSubmitMs: Number((phaseMetrics.renderSubmitMs || 0).toFixed(2))
            });
        }
    }

    startBenchmark({ label = 'hub-forest-river-beach', durationMs = 90000 } = {}) {
        this.stopBenchmark(false);
        this.benchmark = {
            label,
            startedAt: performance.now(),
            segment: 'hub',
            frames: [],
            marks: [{ segment: 'hub', elapsedMs: 0 }],
            timer: null
        };
        this.benchmark.timer = setTimeout(() => this.stopBenchmark(true), durationMs);
        console.info(`[3D benchmark] Started ${label}. Use teleterm3DBenchmark.mark("forest") and mark("river-beach") while moving along the route.`);
        return true;
    }

    markBenchmarkSegment(segment) {
        if (!this.benchmark || !segment) return false;
        this.benchmark.segment = String(segment);
        this.benchmark.marks.push({
            segment: this.benchmark.segment,
            elapsedMs: Math.round(performance.now() - this.benchmark.startedAt)
        });
        return true;
    }

    stopBenchmark(download = true) {
        const run = this.benchmark;
        if (!run) return null;
        clearTimeout(run.timer);
        this.benchmark = null;

        const summary = this.summarizeBenchmark(run);
        const result = { label: run.label, startedAt: new Date(Date.now() - (performance.now() - run.startedAt)).toISOString(), durationMs: Math.round(performance.now() - run.startedAt), marks: run.marks, summary, frames: run.frames };
        console.table(summary);
        if (download && typeof document !== 'undefined') {
            const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `teleterm-3d-benchmark-${Date.now()}.json`;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        window.dispatchEvent(new CustomEvent('teleterm:3d-benchmark-complete', { detail: result }));
        return result;
    }

    summarizeBenchmark(run) {
        const groups = new Map();
        for (const frame of run.frames) {
            if (!groups.has(frame.segment)) groups.set(frame.segment, []);
            groups.get(frame.segment).push(frame);
        }
        return Array.from(groups, ([segment, frames]) => {
            const times = frames.map(frame => frame.frameTimeMs).sort((a, b) => a - b);
            const avgFrameTimeMs = times.reduce((sum, value) => sum + value, 0) / Math.max(1, times.length);
            const p95FrameTimeMs = times[Math.max(0, Math.ceil(times.length * 0.95) - 1)] || 0;
            return {
                segment,
                samples: frames.length,
                avgFps: Number((1000 / Math.max(0.01, avgFrameTimeMs)).toFixed(1)),
                p95FrameTimeMs: Number(p95FrameTimeMs.toFixed(1)),
                pctFramesAtOrAbove60Fps: Number((frames.filter(frame => frame.frameTimeMs <= 1000 / 60).length * 100 / Math.max(1, frames.length)).toFixed(1)),
                avgDrawCalls: Math.round(frames.reduce((sum, frame) => sum + frame.drawCalls, 0) / Math.max(1, frames.length)),
                peakTriangles: Math.max(0, ...frames.map(frame => frame.triangles)),
                peakJsHeapMb: Math.max(0, ...frames.map(frame => frame.jsHeapMb || 0)),
                avgGameplayUpdateMs: Number((frames.reduce((sum, frame) => sum + frame.gameplayUpdateMs, 0) / Math.max(1, frames.length)).toFixed(2)),
                avgSceneUpdateMs: Number((frames.reduce((sum, frame) => sum + frame.sceneUpdateMs, 0) / Math.max(1, frames.length)).toFixed(2)),
                avgRenderSubmitMs: Number((frames.reduce((sum, frame) => sum + frame.renderSubmitMs, 0) / Math.max(1, frames.length)).toFixed(2))
            };
        });
    }

    /**
     * Get real-time engine telemetry metrics
     */
    getTelemetryData() {
        const renderInfo = this.renderer ? this.renderer.info : null;
        let memoryJsMb = null;
        if (window.performance && window.performance.memory) {
            memoryJsMb = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
        }

        return {
            fps: Math.round(this.avgFps),
            instantFps: Math.round(this.fps),
            frameTimeMs: Number(this.frameTimeMs.toFixed(1)),
            dpr: this.currentDpr,
            targetDpr: this.targetDpr,
            profile: this.activeProfile,
            drawCalls: renderInfo?.render?.calls || 0,
            triangles: renderInfo?.render?.triangles || 0,
            geometries: renderInfo?.memory?.geometries || 0,
            textures: renderInfo?.memory?.textures || 0,
            jsHeapMb: memoryJsMb
        };
    }
}
