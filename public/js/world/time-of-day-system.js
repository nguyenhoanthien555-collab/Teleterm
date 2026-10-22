import * as THREE from '/vendor/three/build/three.module.js';

/**
 * TELETERM 3D WORLD 24-MINUTE DAY/NIGHT CYCLE & CYBERPUNK LIGHTING ENGINE
 * Mandated by Phase 2 Upgrade Suite:
 * - 24-minute real-time day/night cycle (1 real second = 1 game minute => 24 real minutes = 24 game hours)
 * - 4 distinct astronomical phases:
 *   - Dawn (05:00 - 08:00): Warm golden-pink sunrise (#ff8f70), soft shadows, streetlights dimming
 *   - Midday (08:00 - 17:00): Radiant azure sky (#87ceeb), warm anime sunlight, fluttering blossoms
 *   - Sunset (17:00 - 20:00): Dramatic orange-violet gradient (#ff5722 to #5e35b1), long shadows
 *   - Cyberpunk Night (20:00 - 05:00): Deep navy sky (#050814), twinkling stars, warm flickering PointLights on lanterns and torches, boosted emissive screens
 * - Time locking controls: Auto Cycle (24 min), Lock Day, Lock Sunset, Lock Cyberpunk Night, Lock Dawn
 * - Interpolated Sun/Moon trajectory, hemisphere lighting, depth fog, and lantern glow
 */
export class TimeOfDaySystem {
    constructor(scene) {
        this.scene = scene;

        // Game clock: 1 real second = 1 in-game minute = 1/60 game hours
        // 24 real minutes = 1440 real seconds = 24 game hours
        this.timeSpeed = 1 / 60; // game hours per real second
        this.time = 11.5; // Starts at 11:30 (radiant daytime anime sun)
        this.isLocked = false;
        this.lockedPhase = 'auto'; // 'auto' | 'dawn' | 'day' | 'sunset' | 'night'

        // Lighting references
        this.sunLight = null;
        this.ambientLight = null;
        this.moonLight = null;

        // Current evaluated lighting parameters
        this.currentSunColor = new THREE.Color(0xfff5ea);
        this.currentAmbientColor = new THREE.Color(0xffffff);
        this.currentFogColor = new THREE.Color(0xdceefb);
        this.currentSkyColor = new THREE.Color(0xffffff);
        this.sunIntensity = 1.45;
        this.ambientIntensity = 0.82;
        this.lanternPointLightIntensity = 0.0;
        this.screenEmissiveBoost = 1.0;

        // Load persisted preference if available
        this.loadPreference();

        if (typeof window !== 'undefined') {
            window.timeOfDaySystem = this;
        }
    }

    loadPreference() {
        if (typeof localStorage === 'undefined') return;
        try {
            const saved = localStorage.getItem('teleterm_time_of_day_phase');
            if (saved && ['auto', 'dawn', 'day', 'sunset', 'night'].includes(saved)) {
                this.lockTime(saved, false);
            }
        } catch (_) {}
    }

    savePreference() {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem('teleterm_time_of_day_phase', this.lockedPhase);
        } catch (_) {}
    }

    setTime(hours) {
        this.time = ((hours % 24) + 24) % 24;
    }

    getTime() {
        return this.time;
    }

    /**
     * Get human-readable formatted time string (e.g. "17:30")
     */
    getFormattedTime() {
        const hours = Math.floor(this.time);
        const mins = Math.floor(((this.time - hours) * 60) % 60);
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    /**
     * Lock time to a specific phase or unlock to auto 24-min cycle
     * Options: 'auto' | 'dawn' | 'day' | 'sunset' | 'night'
     */
    lockTime(phase, persist = true) {
        this.lockedPhase = phase || 'auto';
        if (phase === 'dawn') {
            this.isLocked = true;
            this.setTime(6.5); // 06:30 AM
        } else if (phase === 'day' || phase === 'midday') {
            this.isLocked = true;
            this.setTime(12.0); // 12:00 PM
        } else if (phase === 'sunset') {
            this.isLocked = true;
            this.setTime(18.5); // 06:30 PM
        } else if (phase === 'night' || phase === 'cyberpunk_night') {
            this.isLocked = true;
            this.setTime(22.5); // 10:30 PM
        } else {
            this.isLocked = false;
            this.lockedPhase = 'auto';
        }

        if (persist) {
            this.savePreference();
        }

        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('teleterm:time-of-day-changed', {
                detail: { phase: this.getPhase(), time: this.time, locked: this.isLocked, lockedPhase: this.lockedPhase }
            }));
        }
    }

    /**
     * Get current astronomical phase
     */
    getPhase() {
        const t = this.time;
        if (t >= 5.0 && t < 8.0) {
            const progress = (t - 5.0) / 3.0;
            return { id: 'dawn', name: 'Dawn', time: t, isNight: false, progress };
        } else if (t >= 8.0 && t < 17.0) {
            const progress = (t - 8.0) / 9.0;
            return { id: 'midday', name: 'Midday', time: t, isNight: false, progress };
        } else if (t >= 17.0 && t < 20.0) {
            const progress = (t - 17.0) / 3.0;
            return { id: 'sunset', name: 'Sunset', time: t, isNight: false, progress };
        } else {
            // 20:00 to 05:00
            const progress = t >= 20.0 ? (t - 20.0) / 9.0 : (t + 4.0) / 9.0;
            return { id: 'night', name: 'Cyberpunk Night', time: t, isNight: true, progress };
        }
    }

    isNight() {
        return this.time >= 20.0 || this.time < 5.0;
    }

    isSunset() {
        return this.time >= 17.0 && this.time < 20.0;
    }

    /**
     * Advance clock and compute dynamic atmosphere parameters
     */
    update(delta, verificationStatus = null) {
        if (!this.isLocked) {
            this.time = (this.time + delta * this.timeSpeed) % 24;
        }

        const t = this.time;
        const timeSec = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;

        // Compute Sun Position orbit (smooth 360 rotation around Z/X plane)
        // At 12:00 (midday): sun is high in sky (y > 0)
        // At 00:00 (midnight): sun is below horizon, moon is high
        const sunAngle = ((t - 6.0) / 24.0) * Math.PI * 2;
        const sunDist = 90;
        const sunX = Math.cos(sunAngle) * sunDist;
        const sunY = Math.sin(sunAngle) * sunDist * 0.85;
        const sunZ = Math.sin(sunAngle * 0.5) * 45;

        // Astronomical Phase Color Palettes:
        // Dawn: 05:00 - 08:00
        // Midday: 08:00 - 17:00
        // Sunset: 17:00 - 20:00
        // Cyberpunk Night: 20:00 - 05:00
        if (t >= 5.0 && t < 8.0) {
            // DAWN
            const p = (t - 5.0) / 3.0;
            this.currentSunColor.setRGB(
                THREE.MathUtils.lerp(0.55, 1.0, p),
                THREE.MathUtils.lerp(0.70, 0.96, p),
                THREE.MathUtils.lerp(0.95, 0.88, p)
            );
            this.currentAmbientColor.setRGB(
                THREE.MathUtils.lerp(0.45, 0.95, p),
                THREE.MathUtils.lerp(0.50, 0.96, p),
                THREE.MathUtils.lerp(0.65, 1.0, p)
            );
            this.currentFogColor.setRGB(
                THREE.MathUtils.lerp(0.35, 0.86, p),
                THREE.MathUtils.lerp(0.45, 0.93, p),
                THREE.MathUtils.lerp(0.60, 0.98, p)
            );
            this.currentSkyColor.setRGB(
                THREE.MathUtils.lerp(0.55, 1.0, p),
                THREE.MathUtils.lerp(0.65, 1.0, p),
                THREE.MathUtils.lerp(0.80, 1.0, p)
            );
            this.sunIntensity = THREE.MathUtils.lerp(0.65, 1.55, p);
            this.ambientIntensity = THREE.MathUtils.lerp(0.60, 0.85, p);
            this.lanternPointLightIntensity = THREE.MathUtils.lerp(2.2, 0.0, p);
            this.screenEmissiveBoost = THREE.MathUtils.lerp(1.8, 1.0, p);
        } else if (t >= 8.0 && t < 17.0) {
            // MIDDAY (Radiant anime sunny day, soft clear diffuse shadows, no eye strain)
            this.currentSunColor.setHex(0xfffaf0);
            this.currentAmbientColor.setHex(0xffffff);
            this.currentFogColor.setHex(0xdceefb);
            this.currentSkyColor.setHex(0xffffff);
            this.sunIntensity = 1.30;
            this.ambientIntensity = 0.68;
            this.lanternPointLightIntensity = 0.0;
            this.screenEmissiveBoost = 1.0;
        } else if (t >= 17.0 && t < 20.0) {
            // SUNSET / GOLDEN HOUR (Warm luminous anime glow, transparent soft shadows)
            const p = (t - 17.0) / 3.0;
            this.currentSunColor.setRGB(
                THREE.MathUtils.lerp(1.0, 1.0, p),
                THREE.MathUtils.lerp(0.98, 0.65, p),
                THREE.MathUtils.lerp(0.85, 0.35, p)
            );
            this.currentAmbientColor.setRGB(
                THREE.MathUtils.lerp(1.0, 0.78, p),
                THREE.MathUtils.lerp(0.95, 0.65, p),
                THREE.MathUtils.lerp(0.92, 0.75, p)
            ); // Luminous warm ambient so shadows are never dark or muddy
            this.currentFogColor.setRGB(
                THREE.MathUtils.lerp(0.86, 0.50, p),
                THREE.MathUtils.lerp(0.93, 0.35, p),
                THREE.MathUtils.lerp(0.98, 0.62, p)
            );
            this.currentSkyColor.setRGB(
                THREE.MathUtils.lerp(1.0, 0.85, p),
                THREE.MathUtils.lerp(1.0, 0.55, p),
                THREE.MathUtils.lerp(1.0, 0.75, p)
            );
            this.sunIntensity = THREE.MathUtils.lerp(1.45, 0.95, p);
            this.ambientIntensity = THREE.MathUtils.lerp(0.85, 0.65, p);
            this.lanternPointLightIntensity = THREE.MathUtils.lerp(0.0, 2.2, p);
            this.screenEmissiveBoost = THREE.MathUtils.lerp(1.0, 1.8, p);
        } else {
            // CYBERPUNK NIGHT (20:00 - 05:00) - Luminous starlight & bright neon
            this.currentSunColor.setHex(0x60a5fa); // Moonlight
            this.currentAmbientColor.setHex(0x1e293b); // Luminous midnight navy (not pitch black)
            this.currentFogColor.setHex(0x0f172a);
            this.currentSkyColor.setHex(0x334155);
            this.sunIntensity = 0.55;
            this.ambientIntensity = 0.45;
            this.lanternPointLightIntensity = 2.2;
            this.screenEmissiveBoost = 2.0;
        }

        // Add organic warm lantern flicker when lights are active
        if (this.lanternPointLightIntensity > 0.05) {
            const flicker = 0.88 + 0.12 * Math.sin(timeSec * 7.5) * Math.cos(timeSec * 4.3);
            this.lanternPointLightIntensity *= flicker;
        }

        // Apply Weather verification override if FAILED (gentle cloud haze, never gloomy or pitch black)
        if (verificationStatus === 'FAILED') {
            this.currentFogColor.setHex(0xb0c4de);
            this.currentAmbientColor.setHex(0xe2e8f0);
            this.ambientIntensity = Math.max(0.75, this.ambientIntensity * 0.92);
            this.sunIntensity = Math.max(1.20, this.sunIntensity * 0.88);
        }

        return {
            time: this.time,
            phase: this.getPhase(),
            sunPosition: { x: sunX, y: Math.max(-10, sunY), z: sunZ },
            sunColor: this.currentSunColor,
            sunIntensity: this.sunIntensity,
            ambientColor: this.currentAmbientColor,
            ambientIntensity: this.ambientIntensity,
            fogColor: this.currentFogColor,
            skyColor: this.currentSkyColor,
            lanternIntensity: this.lanternPointLightIntensity,
            screenEmissiveBoost: this.screenEmissiveBoost
        };
    }
}
