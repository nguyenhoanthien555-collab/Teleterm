import * as THREE from '/vendor/three/build/three.module.js';

/**
 * WEATHER & TIME-OF-DAY ATMOSPHERIC SYSTEM
 * Implements Section 11, 38, and 39 of TeleTerm Living Open World Master Spec v3.
 * Features:
 * - Dynamic 24-hour cinematic lighting cycle: Dawn -> Morning -> Golden Hour -> Twilight -> Night
 * - Weather conditions: Clear, Cloudy, Rain, Mist
 * - Dynamic sun elevation, ambient sky tones, depth fog colors
 * - Weather particle systems: Falling rain streaks & Night firefly swarms
 */
export class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.timeOfDay = 11.5; // Starts at 11:30 (radiant midday anime sunlight)
        this.timeSpeed = 0.05; // ~20 real minutes per in-game day (or manually controllable)
        this.weather = 'clear'; // 'clear', 'cloudy', 'rain', 'mist'
        this.verificationStatus = null; // 'PASSED' | 'FAILED' | null
        this.rainTargetOpacity = 0.0;
        this.weatherDimMultiplier = 1.0;
        this.targetWeatherDimMultiplier = 1.0;

        this.sunLight = null;
        this.hemiLight = null;
        this.rainParticles = null;
        this.fireflies = null;

        this.initLights();
        this.initFireflies();
        this.initRain();
    }

    initLights() {
        // Hemispherical anime sky/ground fill light - luminous sky and soft warm bounce (eliminates greenish shadows)
        this.hemiLight = new THREE.HemisphereLight(0xfff5eb, 0xf6ede6, 0.45);
        this.scene.add(this.hemiLight);

        // Main directional sun light (calibrated to 0.95 per Argon radiometric energy budget)
        this.sunLight = new THREE.DirectionalLight(0xfffaf0, 0.95);
        this.sunLight.position.set(45, 30, -55);
        this.sunLight.castShadow = true;
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (typeof window !== 'undefined' && window.innerWidth <= 768);
        const shadowRes = isMobile ? 1024 : 2048;
        this.sunLight.shadow.mapSize.width = shadowRes;
        this.sunLight.shadow.mapSize.height = shadowRes;
        this.sunLight.shadow.camera.near = 1.0;
        this.sunLight.shadow.camera.far = 95; // Tightened to 95m for high depth precision and active player radius (Argon Spec)
        const d = 34; // Tightened from 50 to 34 for 2.15x higher shadow resolution & focused coverage (Argon Spec)
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;
        this.sunLight.shadow.bias = -0.00012; // Tuned for PCFSoftShadowMap
        this.sunLight.shadow.normalBias = 0.030; // Eliminates shadow acne on character and trees
        this.scene.add(this.sunLight);
        this.scene.add(this.sunLight.target);
    }

    initFireflies() {
        // Night / Sunset glowing fireflies
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (typeof window !== 'undefined' && window.innerWidth <= 768);
        const pCount = isMobile ? 40 : 120;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(pCount * 3);
        const offsets = [];

        for (let i = 0; i < pCount; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = 0.4 + Math.random() * 3.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
            offsets.push(Math.random() * Math.PI * 2);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const rad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
        rad.addColorStop(0.0, '#fef08a');
        rad.addColorStop(0.4, 'rgba(163, 230, 53, 0.65)');
        rad.addColorStop(1.0, 'rgba(163, 230, 53, 0)');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, 64, 64);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.PointsMaterial({
            map: tex,
            size: 0.55,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.fireflies = new THREE.Points(geo, mat);
        this.fireflies.userData = { offsets };
        this.scene.add(this.fireflies);
    }

    initRain() {
        // Soft summer rain particles
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (typeof window !== 'undefined' && window.innerWidth <= 768);
        const count = isMobile ? 100 : 300;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 70;
            positions[i * 3 + 1] = Math.random() * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xc7d2fe,
            size: 0.18,
            transparent: true,
            opacity: 0.0 // hidden by default unless raining
        });

        this.rainParticles = new THREE.Points(geo, mat);
        this.scene.add(this.rainParticles);
    }

    setWeather(weatherType) {
        this.weather = weatherType;
        if (weatherType === 'rain' || weatherType === 'drizzle') {
            this.rainTargetOpacity = 0.70;
            this.targetWeatherDimMultiplier = 0.45;
        } else {
            this.rainTargetOpacity = 0.0;
            this.targetWeatherDimMultiplier = 1.0;
        }
    }

    /**
     * React dynamically to Verification Engine / Test state
     * FAILED: Overcast drizzle/rain, dimmed sky over Developer Hub
     * PASSED: Clear radiant sunny daylight with gentle breeze
     */
    setVerificationStatus(status) {
        this.verificationStatus = status;
        if (status === 'FAILED') {
            this.weather = 'drizzle';
            this.rainTargetOpacity = 0.25;
            this.targetWeatherDimMultiplier = 0.92;
        } else if (status === 'PASSED') {
            this.weather = 'clear';
            this.rainTargetOpacity = 0.0;
            this.targetWeatherDimMultiplier = 1.15;
        } else {
            this.rainTargetOpacity = 0.0;
            this.targetWeatherDimMultiplier = 1.0;
        }
    }

    update(delta, time = null, playerPos = null) {
        // Advance time of day slowly
        if (time !== null) {
            this.timeOfDay = time;
        } else {
            this.timeOfDay = (this.timeOfDay + delta * this.timeSpeed) % 24;
        }
        const t = this.timeOfDay;

        // Smoothly interpolate weather dimming & rain opacity
        const blend = Math.min(1.0, delta * 2.2);
        this.weatherDimMultiplier += (this.targetWeatherDimMultiplier - this.weatherDimMultiplier) * blend;
        if (this.rainParticles && this.rainParticles.material) {
            this.rainParticles.material.opacity += (this.rainTargetOpacity - this.rainParticles.material.opacity) * blend;
        }

        // Animate Fireflies
        if (this.fireflies && this.fireflies.geometry) {
            const isNightOrSunset = t > 17.0 || t < 6.5;
            this.fireflies.material.opacity = (isNightOrSunset && this.verificationStatus !== 'FAILED') ? 0.85 : 0.0;

            if (isNightOrSunset) {
                const pos = this.fireflies.geometry.attributes.position;
                const offsets = this.fireflies.userData.offsets;
                const timeSec = performance.now() / 1000;
                for (let i = 0; i < pos.count; i++) {
                    let y = pos.getY(i) + Math.sin(timeSec * 2.0 + offsets[i]) * 0.005;
                    let x = pos.getX(i) + Math.cos(timeSec * 1.5 + offsets[i]) * 0.004;
                    pos.setXY(i, x, y);
                }
                pos.needsUpdate = true;
            }
        }

        // Animate Rain
        if (this.rainParticles && this.rainParticles.material.opacity > 0.02) {
            const pos = this.rainParticles.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                let py = pos.getY(i) - delta * 26.0;
                if (py < 0) py = 18.0 + Math.random() * 4.0;
                pos.setY(i, py);
            }
            pos.needsUpdate = true;
        }

        // Adjust Lighting based on Time of Day & Verification Weather
        if (this.sunLight && this.hemiLight) {
            let offsetX = 32;
            let offsetY = 48;
            let offsetZ = -36;

            if (this.verificationStatus === 'FAILED') {
                // Soft poetic drizzle over the hub: Sky remains luminous and bright
                this.sunLight.color.setHex(0xf8fafc);
                this.sunLight.intensity = 1.35 * this.weatherDimMultiplier;
                this.hemiLight.color.setHex(0xe2e8f0);
                this.hemiLight.groundColor.setHex(0xf6ede6);
                this.hemiLight.intensity = 0.65 * this.weatherDimMultiplier;
                offsetX = 28;
                offsetY = 42;
                offsetZ = -32;
            } else if (t >= 16.5 && t <= 19.5) {
                // Golden Hour / Sunset (16:30 - 19:30)
                this.sunLight.color.setHex(0xffba7a);
                this.sunLight.intensity = 1.35 * this.weatherDimMultiplier;
                this.hemiLight.color.setHex(0xffedd5);
                this.hemiLight.groundColor.setHex(0xf6ede6);
                this.hemiLight.intensity = 0.70 * this.weatherDimMultiplier;
                offsetX = 42;
                offsetY = 24;
                offsetZ = -45;
            } else if (t > 19.5 || t < 5.5) {
                // Night / Cyberpunk Starlight (19:30 - 05:30)
                this.sunLight.color.setHex(0x38bdf8);
                this.sunLight.intensity = 0.35 * this.weatherDimMultiplier;
                this.hemiLight.color.setHex(0x1e293b);
                this.hemiLight.groundColor.setHex(0x0f172a);
                this.hemiLight.intensity = 0.50 * this.weatherDimMultiplier;
                offsetX = -25;
                offsetY = 40;
                offsetZ = 35;
            } else {
                // Daytime / Morning (05:30 - 16:30) - Soft warm bounce, radiant contours without blowout
                const isPassed = (this.verificationStatus === 'PASSED');
                this.sunLight.color.setHex(0xfffaf0);
                this.sunLight.intensity = (isPassed ? 1.32 : 1.25) * this.weatherDimMultiplier;
                this.hemiLight.color.setHex(0xfff5eb);
                this.hemiLight.groundColor.setHex(0xf6ede6);
                this.hemiLight.intensity = (isPassed ? 0.60 : 0.52) * this.weatherDimMultiplier;
                offsetX = 32;
                offsetY = 48;
                offsetZ = -36;
            }

            if (playerPos && this.sunLight.target) {
                this.sunLight.target.position.set(playerPos.x, playerPos.y, playerPos.z);
                this.sunLight.position.set(
                    playerPos.x + offsetX,
                    playerPos.y + offsetY,
                    playerPos.z + offsetZ
                );
                this.sunLight.target.updateMatrixWorld();
                this.sunLight.updateMatrixWorld();
            } else {
                this.sunLight.position.set(offsetX, offsetY, offsetZ);
            }
        }
    }
}
