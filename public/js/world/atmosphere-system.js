import * as THREE from '/vendor/three/build/three.module.js';

/**
 * ATMOSPHERE & LIGHTING SYSTEM — PHASE 9 MULTI-SCALE SKY & CLOUD ARCHITECTURE
 * Authentic Makoto Shinkai / KyoAni Painterly Anime Sky, Multi-Tier Cloud Formations,
 * Volumetric Shading with Cool Violet Undersides, and Balanced Diffuse Lighting.
 */
export class AtmosphereSystem {
    constructor(scene) {
        this.scene = scene;
        this.sunLight = null;
        this.ambientLight = null;
        this.rimLight = null;
        this.skyMesh = null;
        this.skyTex = null;

        // Unified Global World Wind Signal (Argon Atmosphere Spec)
        this.wind = {
            direction: new THREE.Vector2(0.85, 0.52).normalize(),
            speed: 1.0,
            gust: 0.0,
            time: 0.0,
            getVector(target) {
                const strength = this.speed + this.gust;
                if (target) {
                    target.set(this.direction.x * strength, 0, this.direction.y * strength);
                    return target;
                }
                return new THREE.Vector3(this.direction.x * strength, 0, this.direction.y * strength);
            }
        };
    }

    build() {
        // 1. Exponential Squared Atmospheric Depth Fog (Soft Morning Haze, smooth distance fading)
        this.scene.fog = new THREE.FogExp2(0xdceefb, 0.0075);

        // 2. High-Resolution Anime Sky Dome (2048x1024 for pristine gradients)
        const skyGeo = new THREE.SphereGeometry(360, 48, 32);
        const skyCanvas = document.createElement('canvas');
        skyCanvas.width = 2048;
        skyCanvas.height = 1024;
        const sctx = skyCanvas.getContext('2d');

        // Continuous Atmospheric Sky Gradient: Zenith Deep Azure -> Radiant Sky Blue -> Horizon Warm Pearl Glow
        // In SphereGeometry: u=0.75 (x=1536) faces -Z (camera sightline), y=512 is Horizon (Equator)
        const grad = sctx.createLinearGradient(0, 0, 0, 1024);
        grad.addColorStop(0.00, '#0284c7'); // Deep radiant azure zenith
        grad.addColorStop(0.18, '#0ea5e9'); // Vivid cerulean
        grad.addColorStop(0.32, '#38bdf8'); // Radiant anime sky blue
        grad.addColorStop(0.44, '#60a5fa'); // Vibrant atmospheric blue
        grad.addColorStop(0.49, '#93c5fd'); // Soft pastel blue above horizon
        grad.addColorStop(0.51, '#bae6fd'); // Horizon pearl haze
        grad.addColorStop(0.54, '#fef08a'); // Warm golden dawn rim
        grad.addColorStop(0.58, '#fffbeb'); // Soft morning light
        grad.addColorStop(1.00, '#e0f2fe'); // Gentle ground bounce under sphere
        sctx.fillStyle = grad;
        sctx.fillRect(0, 0, 2048, 1024);

        // --- LAYER A: High-Altitude Cirrus Wisps (Semi-transparent, stretched wind drifts) ---
        const drawCirrusWisp = (x, y, len, thickness, alpha) => {
            const wispGrad = sctx.createLinearGradient(x - len * 0.5, y, x + len * 0.5, y);
            wispGrad.addColorStop(0.0, 'rgba(255, 255, 255, 0)');
            wispGrad.addColorStop(0.2, `rgba(255, 255, 255, ${alpha * 0.6})`);
            wispGrad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha})`);
            wispGrad.addColorStop(0.8, `rgba(255, 255, 255, ${alpha * 0.6})`);
            wispGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');

            sctx.save();
            sctx.fillStyle = wispGrad;
            sctx.beginPath();
            sctx.ellipse(x, y, len * 0.5, thickness, -0.06, 0, Math.PI * 2);
            sctx.fill();
            sctx.restore();
        };

        // Draw delicate high cirrus trails
        drawCirrusWisp(1536, 130, 480, 12, 0.42);
        drawCirrusWisp(1200, 170, 360, 9, 0.35);
        drawCirrusWisp(1850, 150, 410, 10, 0.38);
        drawCirrusWisp(600,  140, 520, 14, 0.40);
        drawCirrusWisp(300,  180, 340, 8, 0.32);

        // --- LAYER B & C: Painterly Anime Cumulus Formations ---
        // Organic lobes with bright sunlit white crests and cool sky-scattered lavender undersides
        const drawOrganicCloudLobe = (cx, cy, r, alpha, isUnderside = false) => {
            const rad = sctx.createRadialGradient(cx - r * 0.15, cy - r * 0.30, r * 0.05, cx, cy, r);
            if (isUnderside) {
                // Cool atmospheric Rayleigh scattering lavender/periwinkle underside
                rad.addColorStop(0.0, `rgba(185, 205, 235, ${alpha})`);
                rad.addColorStop(0.50, `rgba(145, 175, 218, ${alpha * 0.98})`);
                rad.addColorStop(0.85, `rgba(115, 150, 198, ${alpha * 0.90})`);
                rad.addColorStop(1.0, 'rgba(145, 175, 218, 0)');
            } else {
                // Brilliant sunlit white crest with warm ivory edge
                rad.addColorStop(0.0, `rgba(255, 255, 255, ${alpha})`);
                rad.addColorStop(0.65, `rgba(255, 255, 255, ${alpha * 0.98})`);
                rad.addColorStop(0.88, `rgba(225, 238, 252, ${alpha * 0.90})`);
                rad.addColorStop(1.0, 'rgba(195, 220, 245, 0)');
            }
            sctx.fillStyle = rad;
            sctx.beginPath();
            sctx.arc(cx, cy, r, 0, Math.PI * 2);
            sctx.fill();
        };

        const drawCumulusMass = (baseX, baseY, scale, alpha) => {
            // 1. Shaded Base Shelf (Flat, calm lower boundary with cool sky bounce)
            const baseW = 180 * scale;
            const baseH = 45 * scale;
            const shelfGrad = sctx.createLinearGradient(baseX, baseY - baseH, baseX, baseY + baseH);
            shelfGrad.addColorStop(0.0, `rgba(185, 208, 238, ${alpha * 0.92})`);
            shelfGrad.addColorStop(0.6, `rgba(138, 172, 216, ${alpha * 0.96})`);
            shelfGrad.addColorStop(1.0, 'rgba(138, 172, 216, 0)');
            sctx.fillStyle = shelfGrad;
            sctx.beginPath();
            sctx.ellipse(baseX, baseY + 18 * scale, baseW * 0.8, baseH * 0.75, 0, 0, Math.PI * 2);
            sctx.fill();

            // 2. Middle & Lower Shaded Lobes
            drawOrganicCloudLobe(baseX - 70 * scale, baseY + 10 * scale, 58 * scale, alpha * 0.94, true);
            drawOrganicCloudLobe(baseX + 75 * scale, baseY + 8 * scale,  62 * scale, alpha * 0.92, true);
            drawOrganicCloudLobe(baseX,              baseY + 15 * scale, 65 * scale, alpha * 0.95, true);

            // 3. Central & Upper Sunlit Billows (Crisp sculptural volume)
            drawOrganicCloudLobe(baseX - 110 * scale, baseY - 5 * scale,  48 * scale, alpha * 0.92);
            drawOrganicCloudLobe(baseX + 115 * scale, baseY - 8 * scale,  52 * scale, alpha * 0.94);
            drawOrganicCloudLobe(baseX - 55 * scale,  baseY - 22 * scale, 68 * scale, alpha * 0.98);
            drawOrganicCloudLobe(baseX + 50 * scale,  baseY - 26 * scale, 72 * scale, alpha * 0.98);
            drawOrganicCloudLobe(baseX,               baseY - 45 * scale, 82 * scale, alpha * 1.0); // Majestic summit billow
            drawOrganicCloudLobe(baseX + 15 * scale,  baseY - 75 * scale, 56 * scale, alpha * 0.98); // High crown

            // 4. Fine Drifting Cloudlets & Edge Wisps
            drawOrganicCloudLobe(baseX - 165 * scale, baseY + 12 * scale, 28 * scale, alpha * 0.78);
            drawOrganicCloudLobe(baseX + 175 * scale, baseY + 10 * scale, 30 * scale, alpha * 0.80);
            drawOrganicCloudLobe(baseX - 85 * scale,  baseY - 60 * scale, 32 * scale, alpha * 0.88);
            drawOrganicCloudLobe(baseX + 90 * scale,  baseY - 55 * scale, 34 * scale, alpha * 0.88);
        };

        // --- LAYER D: Distant Horizon Cloud Banks (Framing the mountain skyline) ---
        const drawHorizonCloudBank = (bx, by, w, h, alpha) => {
            const hGrad = sctx.createLinearGradient(bx, by - h, bx, by + h);
            hGrad.addColorStop(0.0, `rgba(255, 255, 255, ${alpha})`);
            hGrad.addColorStop(0.35, `rgba(245, 250, 255, ${alpha * 0.95})`);
            hGrad.addColorStop(0.70, `rgba(175, 202, 236, ${alpha * 0.85})`);
            hGrad.addColorStop(1.0, 'rgba(175, 202, 236, 0)');
            sctx.fillStyle = hGrad;
            sctx.beginPath();
            sctx.ellipse(bx, by, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
            sctx.fill();
        };

        // Distant horizon cloud clusters (just above horizon line at y: 485-505)
        drawHorizonCloudBank(1536, 492, 850, 56, 0.85);
        drawHorizonCloudBank(1120, 496, 680, 50, 0.80);
        drawHorizonCloudBank(1960, 494, 700, 52, 0.80);
        drawHorizonCloudBank(480,  498, 750, 52, 0.78);

        // Monumental Grand Anime Cumulus Formations in Viewable FOV (baseY at 455-470)
        // Facing True North (-Z, u=0.75, x=1536): Central majestic cumulus tower
        drawCumulusMass(1536, 460, 1.35, 1.0); // Central grand tower
        drawCumulusMass(1200, 470, 1.12, 0.98); // Western flanking cumulus
        drawCumulusMass(1840, 465, 1.15, 0.98); // Eastern flanking cumulus
        drawCumulusMass(800,  460, 1.25, 0.98); // South-west sky bank
        drawCumulusMass(240,  465, 1.18, 0.98); // East-flank sky bank

        this.skyTex = new THREE.CanvasTexture(skyCanvas);
        this.skyTex.wrapS = THREE.RepeatWrapping;
        this.skyTex.wrapT = THREE.ClampToEdgeWrapping;
        this.skyTex.anisotropy = 8;

        const skyMat = new THREE.MeshBasicMaterial({
            map: this.skyTex,
            side: THREE.BackSide,
            depthWrite: false,
            fog: false
        });
        this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
        // Milestone 3: If Ghibli Sky Dome is active, hide static canvas sky mesh
        if (typeof window !== 'undefined' && (window.ghibliSkyDome || window.dayNightCycleSystem?.ghibliSkyDome)) {
            this.skyMesh.visible = false;
        }
        this.scene.add(this.skyMesh);

        // 3. Radiant Spring Sunlight (Soft fill - directional shadows managed by WeatherSystem)
        this.sunLight = new THREE.DirectionalLight(0xfff8ee, 0.24);
        this.sunLight.position.set(38, 56, 28);
        this.sunLight.castShadow = false;
        this.scene.add(this.sunLight);

        // 4. Balanced Ambient Light (Soft sky/earth diffuse fill, preventing facial & terrain blowout)
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.26);
        this.scene.add(this.ambientLight);

        // 5. Stylized Anime Rim Light (Crisp contour definition on character & foliage)
        this.rimLight = new THREE.DirectionalLight(0xffedd5, 0.22);
        this.rimLight.position.set(-36, 26, -30);
        this.scene.add(this.rimLight);
    }

    setVerificationStatus(status) {
        this.verificationStatus = status;
        if (!this.scene.fog) return;

        if (status === 'FAILED') {
            this.scene.fog.color.setHex(0xd0e2ee);
            if (this.scene.fog.isFogExp2) {
                this.scene.fog.density = 0.0125;
            } else {
                this.scene.fog.near = 35;
                this.scene.fog.far = 200;
            }

            if (this.skyMesh?.material) {
                this.skyMesh.material.color.setHex(0xf1f5f9);
            }
            if (this.sunLight) this.sunLight.intensity = 0.30;
            if (this.ambientLight) {
                this.ambientLight.color.setHex(0xffffff);
                this.ambientLight.intensity = 0.35;
            }
        } else {
            this.scene.fog.color.setHex(0xdceefb);
            if (this.scene.fog.isFogExp2) {
                this.scene.fog.density = 0.0075;
            } else {
                this.scene.fog.near = 38;
                this.scene.fog.far = 220;
            }

            if (this.skyMesh?.material) {
                this.skyMesh.material.color.setHex(0xffffff);
            }
            if (this.sunLight) this.sunLight.intensity = 0.38;
            if (this.ambientLight) {
                this.ambientLight.color.setHex(0xffffff);
                this.ambientLight.intensity = 0.32;
            }
        }
    }

    update(timeOfDaySystem, delta = 0.016) {
        // Update Unified World Wind Signal
        if (this.wind) {
            this.wind.time += delta;
            this.wind.gust = Math.sin(this.wind.time * 0.45) * 0.35 + Math.sin(this.wind.time * 1.25) * 0.15;
        }

        // Subtle, continuous cloud drift across the sky dome coupled with wind
        if (this.skyTex) {
            const windFactor = this.wind ? (this.wind.speed + this.wind.gust * 0.5) : 1.0;
            this.skyTex.offset.x = (this.skyTex.offset.x + delta * 0.00035 * windFactor) % 1.0;
        }

        if (!timeOfDaySystem) return;

        if (this.scene.fog) {
            this.scene.fog.color.copy(timeOfDaySystem.currentFogColor);
            if (this.scene.background) {
                this.scene.background.copy(timeOfDaySystem.currentFogColor);
            } else {
                this.scene.background = timeOfDaySystem.currentFogColor.clone();
            }
            const phase = timeOfDaySystem.getPhase();
            if (this.scene.fog.isFogExp2) {
                if (phase.id === 'night') {
                    this.scene.fog.density = 0.0115;
                } else if (phase.id === 'sunset') {
                    this.scene.fog.density = 0.0092;
                } else {
                    this.scene.fog.density = 0.0075;
                }
            } else {
                if (phase.id === 'night') {
                    this.scene.fog.near = 20;
                    this.scene.fog.far = 145;
                } else if (phase.id === 'sunset') {
                    this.scene.fog.near = 28;
                    this.scene.fog.far = 185;
                } else {
                    this.scene.fog.near = 38;
                    this.scene.fog.far = 220;
                }
            }
        }

        if (this.skyMesh?.material) {
            if (typeof window !== 'undefined' && (window.ghibliSkyDome || window.dayNightCycleSystem?.ghibliSkyDome)) {
                this.skyMesh.visible = false;
            } else {
                this.skyMesh.material.color.copy(timeOfDaySystem.currentSkyColor);
            }
        }

        if (this.sunLight) {
            this.sunLight.color.copy(timeOfDaySystem.currentSunColor);
            this.sunLight.intensity = Math.max(0.15, timeOfDaySystem.sunIntensity * 0.28);
        }

        if (this.ambientLight) {
            this.ambientLight.color.copy(timeOfDaySystem.currentAmbientColor);
            this.ambientLight.intensity = Math.max(0.20, timeOfDaySystem.ambientIntensity * 0.42);
        }
    }
}
