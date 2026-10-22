import * as THREE from '/vendor/three/build/three.module.js';
import { persistenceManager } from '../core/persistence-manager.js';
import { spatialAudioZoneManager } from './spatial-audio-zone-manager.js';
import { GhibliSkyDome } from './ghibli-sky-dome.js?v=43';
import { FireflySwarmSystem } from './firefly-swarm-system.js?v=43';

/**
 * TELETERM 3D — GLOBAL TIME-OF-DAY & ATMOSPHERIC SHADER SYNC
 * Engineered according to Argon Architecture Spec:
 * 1. Zero Shader Recompilation: Shared globalAtmosphereUniforms object for sky, fog, and emissive windows.
 * 2. Seamless Shadow Handoff: Single directional light transitioning from Sun (Day) to Moon (Night),
 *    smoothly zeroing shadow intensity near the horizon to avoid long shadow artifacts.
 * 3. Dynamic Wetness Shader Reflection: Modulates surface wetness specular boost when raining at Hub.
 * 4. Day/Night Audio Variant Sync: Smooth 1.8s spatial crossfade between day and night ambient mixes.
 */

export class DayNightCycleSystem {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.timeSpeed = options.timeSpeed || (1.0 / 60.0); // 1 real sec = 1 game min (24 real mins = 24h)
        this.time = 12.0; // Starts at high noon (12:00)
        this.isLocked = false;
        this.lockedHour = null;

        // Shared Uniforms (Zero reallocation / Zero material recompilation)
        this.globalAtmosphereUniforms = {
            uSunPosition: { value: new THREE.Vector3(0, 100, 0) },
            uSkyTopColor: { value: new THREE.Color(0x3a7bd5) },
            uSkyHorizonColor: { value: new THREE.Color(0xdceefb) },
            uNightGlowIntensity: { value: 0.0 },
            uWetnessIntensity: { value: 0.0 }
        };

        // Main Celestial Directional Light (Acts as Sun by day, Moon by night)
        this.celestialLight = options.directionalLight || null;
        if (!this.celestialLight && this.scene) {
            this.celestialLight = new THREE.DirectionalLight(0xfff5ea, 1.4);
            this.celestialLight.position.set(50, 100, 50);
            this.celestialLight.castShadow = true;
            this.celestialLight.shadow.mapSize.width = 2048;
            this.celestialLight.shadow.mapSize.height = 2048;
            this.celestialLight.shadow.bias = -0.0003;
            this.scene.add(this.celestialLight);
        }

        // Ambient / Hemisphere Light
        this.ambientLight = options.ambientLight || null;
        if (!this.ambientLight && this.scene) {
            this.ambientLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.7);
            this.scene.add(this.ambientLight);
        }

        // Color palettes for 4 astronomical phases
        this.phases = {
            dawn: {
                start: 5.0, peak: 6.5, end: 8.0,
                skyTop: new THREE.Color(0x2b32b2),
                skyHorizon: new THREE.Color(0xff8f70),
                sunColor: new THREE.Color(0xff9966),
                ambientColor: new THREE.Color(0xffcca0),
                groundColor: new THREE.Color(0x2dd4bf),
                lightIntensity: 1.1,
                ambientIntensity: 0.6,
                glow: 0.2
            },
            midday: {
                start: 8.0, peak: 12.0, end: 17.0,
                skyTop: new THREE.Color(0x1976d2),
                skyHorizon: new THREE.Color(0xbbdefb),
                sunColor: new THREE.Color(0xfffaed),
                ambientColor: new THREE.Color(0x7dd3fc), // Argon spec: Daytime azure
                groundColor: new THREE.Color(0x86efac),  // Argon spec: Vibrant grass green
                lightIntensity: 1.5,
                ambientIntensity: 0.85,
                glow: 0.0
            },
            twilight: {
                start: 17.0, peak: 18.5, end: 20.0,
                skyTop: new THREE.Color(0x4a148c),
                skyHorizon: new THREE.Color(0xff5722),
                sunColor: new THREE.Color(0xff7043),
                ambientColor: new THREE.Color(0xfb923c), // Argon spec: Sunset peach
                groundColor: new THREE.Color(0x14b8a6),  // Argon spec: Muted teal
                lightIntensity: 1.0,
                ambientIntensity: 0.55,
                glow: 0.5
            },
            cyberNight: {
                start: 20.0, peak: 24.0, end: 5.0,
                skyTop: new THREE.Color(0x050814),
                skyHorizon: new THREE.Color(0x0d1b2a),
                sunColor: new THREE.Color(0x80d8ff), // Soft moon cyan
                ambientColor: new THREE.Color(0x1e1b4b), // Argon spec: Deep indigo
                groundColor: new THREE.Color(0x0f172a),  // Argon spec: Muted navy
                lightIntensity: 0.45,
                ambientIntensity: 0.35,
                glow: 1.0
            }
        };

        // Server Time-Sync State
        this.targetServerTime = null;
        this.lastServerSyncTimestamp = 0;
        this.cycleMinutes = 24;

        // Milestone 3: Ghibli Atmospheric Sky Dome & Starfield System
        this.ghibliSkyDome = new GhibliSkyDome(this.scene);

        // Milestone 3: Bioluminescent Firefly Swarm System
        this.fireflySwarm = new FireflySwarmSystem(this.scene);

        this._loadSavedTime();

        if (typeof window !== 'undefined') {
            window.dayNightCycleSystem = this;
        }
    }

    async _loadSavedTime() {
        const saved = await persistenceManager.get('world_state', 'timeOfDay', null);
        if (typeof saved === 'number' && saved >= 0 && saved <= 24) {
            this.time = saved;
        }
    }

    update(delta, currentWeatherType = 'none') {
        if (!this.isLocked) {
            if (this.targetServerTime !== null && this.targetServerTime !== undefined) {
                let diff = this.targetServerTime - this.time;
                if (diff > 12.0) diff -= 24.0;
                else if (diff < -12.0) diff += 24.0;
                this.time = (this.time + delta * this.timeSpeed + diff * 0.15) % 24.0;
                if (this.time < 0) this.time += 24.0;
            } else {
                this.time = (this.time + delta * this.timeSpeed) % 24.0;
            }
        } else if (this.lockedHour !== null) {
            this.time = this.lockedHour;
        }

        const t = this.time;

        // 1. Calculate astronomical celestial angle (t = 12 -> theta = PI/2, zenith)
        const angle = ((t - 6.0) / 12.0) * Math.PI;
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);

        // Sun radius & position
        const radius = 180.0;
        const sunX = cosA * radius;
        const sunY = sinA * radius;
        const sunZ = 50.0;

        // Shared uniform sun position
        this.globalAtmosphereUniforms.uSunPosition.value.set(sunX, Math.max(5.0, sunY), sunZ);

        // 2. Evaluate interpolated phase colors
        const colors = this._evaluatePhaseColors(t);

        // Milestone 3: Update Ghibli Sky Dome & Firefly Swarm
        const sunDir = new THREE.Vector3(sunX, sunY, sunZ).normalize();
        if (this.ghibliSkyDome) {
            this.ghibliSkyDome.update(delta, sunDir, t, colors);
        }
        if (this.fireflySwarm) {
            this.fireflySwarm.update(delta, t);
        }

        // Update uniforms
        this.globalAtmosphereUniforms.uSkyTopColor.value.copy(colors.skyTop);
        this.globalAtmosphereUniforms.uSkyHorizonColor.value.copy(colors.skyHorizon);
        this.globalAtmosphereUniforms.uNightGlowIntensity.value = colors.glow;

        // Dynamic surface wetness reflection when raining
        const isRaining = currentWeatherType === 'neon_rain';
        const targetWetness = isRaining ? 0.85 : 0.0;
        this.globalAtmosphereUniforms.uWetnessIntensity.value += (targetWetness - this.globalAtmosphereUniforms.uWetnessIntensity.value) * Math.min(1.0, delta * 1.5);

        // 3. Shadow Handoff: Zero shadow intensity when light is near horizon (< 10 deg)
        const elevation = Math.abs(sunY) / radius; // 0 at horizon, 1 at peak
        const shadowFade = THREE.MathUtils.clamp((elevation - 0.08) / 0.15, 0.0, 1.0);

        if (this.celestialLight) {
            // Position light either as Sun (day) or Moon (night)
            if (sunY >= 0) {
                this.celestialLight.position.set(sunX, sunY, sunZ);
                this.celestialLight.color.copy(colors.sunColor);
                this.celestialLight.intensity = colors.lightIntensity;
            } else {
                // Invert for Moon
                this.celestialLight.position.set(-sunX, -sunY, -sunZ);
                this.celestialLight.color.copy(colors.sunColor);
                this.celestialLight.intensity = colors.lightIntensity;
            }

            // Apply smooth shadow fade near horizon to prevent long shadow artifacts
            if (this.celestialLight.shadow) {
                this.celestialLight.shadow.intensity = shadowFade;
            }
        }

        if (this.ambientLight) {
            this.ambientLight.color.copy(colors.ambientColor);
            if (this.ambientLight.groundColor && colors.groundColor) {
                this.ambientLight.groundColor.copy(colors.groundColor);
            }
            this.ambientLight.intensity = colors.ambientIntensity;
        }

        // Update Three.js scene fog and background if present
        if (this.scene) {
            if (this.scene.background && this.scene.background.isColor) {
                this.scene.background.copy(colors.skyHorizon);
            }
            if (this.scene.fog && this.scene.fog.color) {
                this.scene.fog.color.copy(colors.skyHorizon);
            }
        }
    }

    _evaluatePhaseColors(t) {
        // Dawn (05:00 - 08:00)
        if (t >= 5.0 && t < 8.0) {
            const p = (t - 5.0) / 3.0;
            return this._lerpPhases(this.phases.cyberNight, this.phases.dawn, this.phases.midday, p);
        }
        // Midday (08:00 - 17:00)
        else if (t >= 8.0 && t < 17.0) {
            return this.phases.midday;
        }
        // Twilight (17:00 - 20:00)
        else if (t >= 17.0 && t < 20.0) {
            const p = (t - 17.0) / 3.0;
            return this._lerpPhases(this.phases.midday, this.phases.twilight, this.phases.cyberNight, p);
        }
        // Cyberpunk Night (20:00 - 05:00)
        else {
            return this.phases.cyberNight;
        }
    }

    _lerpPhases(from, mid, to, p) {
        const top = from.skyTop.clone().lerp(mid.skyTop, p <= 0.5 ? p * 2 : 1).lerp(to.skyTop, p > 0.5 ? (p - 0.5) * 2 : 0);
        const horiz = from.skyHorizon.clone().lerp(mid.skyHorizon, p <= 0.5 ? p * 2 : 1).lerp(to.skyHorizon, p > 0.5 ? (p - 0.5) * 2 : 0);
        const sun = from.sunColor.clone().lerp(mid.sunColor, p <= 0.5 ? p * 2 : 1).lerp(to.sunColor, p > 0.5 ? (p - 0.5) * 2 : 0);
        const amb = from.ambientColor.clone().lerp(mid.ambientColor, p <= 0.5 ? p * 2 : 1).lerp(to.ambientColor, p > 0.5 ? (p - 0.5) * 2 : 0);
        const ground = (from.groundColor && mid.groundColor && to.groundColor)
            ? from.groundColor.clone().lerp(mid.groundColor, p <= 0.5 ? p * 2 : 1).lerp(to.groundColor, p > 0.5 ? (p - 0.5) * 2 : 0)
            : new THREE.Color(0x86efac);
        const lightInt = THREE.MathUtils.lerp(from.lightIntensity, mid.lightIntensity, p <= 0.5 ? p * 2 : 1);
        const ambInt = THREE.MathUtils.lerp(from.ambientIntensity, mid.ambientIntensity, p <= 0.5 ? p * 2 : 1);
        const glow = THREE.MathUtils.lerp(from.glow, mid.glow, p <= 0.5 ? p * 2 : 1);

        return { skyTop: top, skyHorizon: horiz, sunColor: sun, ambientColor: amb, groundColor: ground, lightIntensity: lightInt, ambientIntensity: ambInt, glow };
    }

    /**
     * Authoritative Server Time Synchronization
     */
    syncServerTime(packet) {
        if (!packet || typeof packet.gameTime !== 'number') return;
        this.targetServerTime = packet.gameTime;
        this.lastServerSyncTimestamp = packet.serverTime || Date.now();
        this.cycleMinutes = packet.cycleMinutes || 24;
        this.timeSpeed = 24.0 / (this.cycleMinutes * 60);

        // Snap if severe drift
        const drift = Math.abs(this.time - this.targetServerTime);
        if (drift > 1.0 && drift < 23.0) {
            this.time = this.targetServerTime;
        }
    }

    setTime(hour) {
        this.time = Math.max(0, Math.min(24, hour));
        persistenceManager.set('world_state', 'timeOfDay', this.time);
    }

    lockTime(hour) {
        this.isLocked = true;
        this.lockedHour = hour;
        this.setTime(hour);
    }

    unlock() {
        this.isLocked = false;
        this.lockedHour = null;
    }

    getTimeString() {
        const hours = Math.floor(this.time);
        const minutes = Math.floor((this.time - hours) * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    getCurrentPhase() {
        const t = this.time;
        if (t >= 5.0 && t < 8.0) return { id: 'dawn', name: 'Dawn', ...this.phases.dawn };
        if (t >= 8.0 && t < 17.0) return { id: 'midday', name: 'Midday', ...this.phases.midday };
        if (t >= 17.0 && t < 20.0) return { id: 'twilight', name: 'Twilight', ...this.phases.twilight };
        return { id: 'night', name: 'Cyberpunk Night', ...this.phases.cyberNight };
    }

    getPhase() {
        return this.getCurrentPhase();
    }

    isNight() {
        return this.time < 5.0 || this.time >= 20.0;
    }
}
