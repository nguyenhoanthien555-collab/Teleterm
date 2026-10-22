import * as THREE from 'three';

/**
 * TELETERM 3D — DYNAMIC BIOME WEATHER & SPATIAL ATMOSPHERE SYSTEM
 * High-performance GPU particle simulation with smooth spatial crossfading:
 * 1. Neon Rain (Developer Hub): Vertical cyber-luminescent streaks with ground ripples
 * 2. Drifting Sakura & Maple Leaves (Zen Pond): Rotational fluttering petals in wind
 * 3. Alpine Snowflakes (Alpine Summit): Soft crystalline flakes with sinusoidal drift
 * 4. Bamboo Valley Mist (Bamboo Forest): Low-lying volumetric atmospheric mist sheets
 * 
 * Synchronized with TimeOfDay lighting and player position with zero frame drops.
 */
export class DynamicWeatherSpatialSystem {
    constructor(scene) {
        this.scene = scene;
        this.activeWeatherType = 'neon_rain';
        this.targetWeatherType = 'neon_rain';
        this.weatherBlend = 1.0;

        // Particle containers
        this.rainMesh = null;
        this.leavesMesh = null;
        this.snowMesh = null;
        this.mistMesh = null;

        // Target opacities for smooth crossfading
        this.opacities = {
            neon_rain: 0.0,
            leaves: 0.0,
            snow: 0.0,
            mist: 0.0
        };

        // Biome definitions with center coordinates and radius
        this.biomes = [
            { id: 'hub', weather: 'neon_rain', x: 21, z: -11, radius: 40 },
            { id: 'zen_pond', weather: 'leaves', x: -18, z: -25, radius: 45 },
            { id: 'alpine_summit', weather: 'snow', x: 75, z: -85, radius: 55 },
            { id: 'bamboo_forest', weather: 'mist', x: -40, z: 25, radius: 45 }
        ];

        this.initRain();
        this.initLeaves();
        this.initSnow();
        this.initMist();
    }

    createCanvasTexture(width, height, drawFn) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        drawFn(ctx, width, height);
        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        return tex;
    }

    initRain() {
        // Vertical neon cyber streaks
        const count = 450;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = Math.random() * 25;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
            velocities[i]        = 22.0 + Math.random() * 10.0;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

        const tex = this.createCanvasTexture(16, 64, (ctx, w, h) => {
            const grad = ctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0.0, 'rgba(56, 189, 248, 0)');
            grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.85)');
            grad.addColorStop(1.0, 'rgba(232, 121, 249, 1.0)'); // Neon cyan to magenta
            ctx.fillStyle = grad;
            ctx.fillRect(w * 0.35, 0, w * 0.3, h);
        });

        const mat = new THREE.PointsMaterial({
            map: tex,
            size: 0.85,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.rainMesh = new THREE.Points(geo, mat);
        this.scene.add(this.rainMesh);
    }

    initLeaves() {
        // Drifting pink sakura & orange maple leaves
        const count = 220;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const leafData = []; // { swayOffset, rotSpeed, fallSpeed }

        for (let i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = 0.5 + Math.random() * 15;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            leafData.push({
                offset: Math.random() * Math.PI * 2,
                rotSpeed: 1.5 + Math.random() * 2.0,
                fallSpeed: 1.2 + Math.random() * 1.5
            });
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const tex = this.createCanvasTexture(64, 64, (ctx, w, h) => {
            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.rotate(0.3);
            ctx.beginPath();
            ctx.ellipse(0, 0, w * 0.35, h * 0.18, 0, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, w * 0.35);
            grad.addColorStop(0.0, '#fb7185'); // Rose petal
            grad.addColorStop(0.8, '#f43f5e');
            grad.addColorStop(1.0, 'rgba(244, 63, 94, 0)');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.restore();
        });

        const mat = new THREE.PointsMaterial({
            map: tex,
            size: 0.65,
            transparent: true,
            opacity: 0.0,
            blending: THREE.NormalBlending,
            depthWrite: false
        });

        this.leavesMesh = new THREE.Points(geo, mat);
        this.leavesMesh.userData = { leafData };
        this.scene.add(this.leavesMesh);
    }

    initSnow() {
        // Crystalline soft snowflakes
        const count = 350;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const snowData = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = 1.0 + Math.random() * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
            snowData.push({
                sway: Math.random() * Math.PI * 2,
                speed: 1.4 + Math.random() * 1.6
            });
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const tex = this.createCanvasTexture(64, 64, (ctx, w, h) => {
            const rad = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w * 0.45);
            rad.addColorStop(0.0, '#ffffff');
            rad.addColorStop(0.4, 'rgba(224, 242, 254, 0.85)');
            rad.addColorStop(1.0, 'rgba(224, 242, 254, 0)');
            ctx.fillStyle = rad;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, w * 0.45, 0, Math.PI * 2);
            ctx.fill();
        });

        const mat = new THREE.PointsMaterial({
            map: tex,
            size: 0.55,
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.snowMesh = new THREE.Points(geo, mat);
        this.snowMesh.userData = { snowData };
        this.scene.add(this.snowMesh);
    }

    initMist() {
        // Low-lying soft atmospheric mist sheets
        const count = 80;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 70;
            positions[i * 3 + 1] = 0.4 + Math.random() * 2.2; // Hovering near ground
            positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const tex = this.createCanvasTexture(128, 128, (ctx, w, h) => {
            const rad = ctx.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, w * 0.48);
            rad.addColorStop(0.0, 'rgba(240, 253, 250, 0.5)');
            rad.addColorStop(0.6, 'rgba(204, 251, 241, 0.2)');
            rad.addColorStop(1.0, 'rgba(204, 251, 241, 0)');
            ctx.fillStyle = rad;
            ctx.fillRect(0, 0, w, h);
        });

        const mat = new THREE.PointsMaterial({
            map: tex,
            size: 4.5,
            transparent: true,
            opacity: 0.0,
            blending: THREE.NormalBlending,
            depthWrite: false
        });

        this.mistMesh = new THREE.Points(geo, mat);
        this.scene.add(this.mistMesh);
    }

    /**
     * Determines active weather based on player's 3D coordinates
     */
    updateBiomeProximity(playerPos) {
        if (!playerPos) return;

        let activeBiome = this.biomes[0];
        let minDistSq = Infinity;

        for (const biome of this.biomes) {
            const dx = playerPos.x - biome.x;
            const dz = playerPos.z - biome.z;
            const distSq = dx * dx + dz * dz;
            if (distSq < minDistSq) {
                minDistSq = distSq;
                activeBiome = biome;
            }
        }

        this.targetWeatherType = activeBiome.weather;
    }

    /**
     * Advances simulation loop, centers particle volumes on the player, and updates opacities
     */
    update(delta, playerPos, timeOfDay = 12.0) {
        if (!playerPos) return;
        const dt = Math.min(delta, 0.05);
        const time = performance.now() * 0.001;

        // 1. Detect biome weather
        this.updateBiomeProximity(playerPos);

        // 2. Smoothly ramp opacities (2.0s crossfade between weather conditions)
        const rampSpeed = dt * 1.8;
        const targetRain = (this.targetWeatherType === 'neon_rain') ? 0.75 : 0.0;
        const targetLeaves = (this.targetWeatherType === 'leaves') ? 0.85 : 0.0;
        const targetSnow = (this.targetWeatherType === 'snow') ? 0.80 : 0.0;
        const targetMist = (this.targetWeatherType === 'mist') ? 0.40 : 0.0;

        this.opacities.neon_rain += (targetRain - this.opacities.neon_rain) * rampSpeed;
        this.opacities.leaves += (targetLeaves - this.opacities.leaves) * rampSpeed;
        this.opacities.snow += (targetSnow - this.opacities.snow) * rampSpeed;
        this.opacities.mist += (targetMist - this.opacities.mist) * rampSpeed;

        // Apply opacities
        if (this.rainMesh) this.rainMesh.material.opacity = this.opacities.neon_rain;
        if (this.leavesMesh) this.leavesMesh.material.opacity = this.opacities.leaves;
        if (this.snowMesh) this.snowMesh.material.opacity = this.opacities.snow;
        if (this.mistMesh) this.mistMesh.material.opacity = this.opacities.mist;

        // 3. Center particle volumes around player
        const px = playerPos.x;
        const py = playerPos.y;
        const pz = playerPos.z;

        // Rain simulation
        if (this.rainMesh && this.opacities.neon_rain > 0.01) {
            const pos = this.rainMesh.geometry.attributes.position.array;
            const vel = this.rainMesh.geometry.attributes.velocity.array;
            for (let i = 0; i < pos.length; i += 3) {
                pos[i + 1] -= vel[i / 3] * dt;
                // Wrap around player height
                if (pos[i + 1] < py - 1.0) {
                    pos[i + 1] = py + 22.0 + Math.random() * 4.0;
                    pos[i] = px + (Math.random() - 0.5) * 55;
                    pos[i + 2] = pz + (Math.random() - 0.5) * 55;
                }
            }
            this.rainMesh.geometry.attributes.position.needsUpdate = true;
        }

        // Leaves simulation (fluttering sway)
        if (this.leavesMesh && this.opacities.leaves > 0.01) {
            const pos = this.leavesMesh.geometry.attributes.position.array;
            const data = this.leavesMesh.userData.leafData;
            for (let i = 0; i < data.length; i++) {
                const idx = i * 3;
                const d = data[i];
                pos[idx + 1] -= d.fallSpeed * dt;
                pos[idx] += Math.sin(time * d.rotSpeed + d.offset) * 0.04;
                pos[idx + 2] += Math.cos(time * d.rotSpeed + d.offset) * 0.03;

                if (pos[idx + 1] < py - 0.5) {
                    pos[idx + 1] = py + 12.0 + Math.random() * 4.0;
                    pos[idx] = px + (Math.random() - 0.5) * 45;
                    pos[idx + 2] = pz + (Math.random() - 0.5) * 45;
                }
            }
            this.leavesMesh.geometry.attributes.position.needsUpdate = true;
        }

        // Snow simulation
        if (this.snowMesh && this.opacities.snow > 0.01) {
            const pos = this.snowMesh.geometry.attributes.position.array;
            const data = this.snowMesh.userData.snowData;
            for (let i = 0; i < data.length; i++) {
                const idx = i * 3;
                const d = data[i];
                pos[idx + 1] -= d.speed * dt;
                pos[idx] += Math.sin(time * 1.5 + d.sway) * 0.025;
                pos[idx + 2] += Math.cos(time * 1.2 + d.sway) * 0.02;

                if (pos[idx + 1] < py - 0.5) {
                    pos[idx + 1] = py + 18.0 + Math.random() * 4.0;
                    pos[idx] = px + (Math.random() - 0.5) * 55;
                    pos[idx + 2] = pz + (Math.random() - 0.5) * 55;
                }
            }
            this.snowMesh.geometry.attributes.position.needsUpdate = true;
        }

        // Mist simulation
        if (this.mistMesh && this.opacities.mist > 0.01) {
            const pos = this.mistMesh.geometry.attributes.position.array;
            for (let i = 0; i < pos.length; i += 3) {
                pos[i] += Math.sin(time * 0.3 + i) * 0.015;
                pos[i + 2] += Math.cos(time * 0.2 + i) * 0.015;
                // Keep mist bounded around player
                if (Math.abs(pos[i] - px) > 35) pos[i] = px + (Math.random() - 0.5) * 35;
                if (Math.abs(pos[i + 2] - pz) > 35) pos[i + 2] = pz + (Math.random() - 0.5) * 35;
            }
            this.mistMesh.geometry.attributes.position.needsUpdate = true;
        }
    }

    setParticleScale(scale = 1.0) {
        this.particleScale = Math.max(0.1, Math.min(1.0, scale));
        if (this.rainMesh?.geometry) {
            this.rainMesh.geometry.setDrawRange(0, Math.floor(450 * this.particleScale));
        }
        if (this.leavesMesh?.geometry) {
            this.leavesMesh.geometry.setDrawRange(0, Math.floor(220 * this.particleScale));
        }
        if (this.snowMesh?.geometry) {
            this.snowMesh.geometry.setDrawRange(0, Math.floor(550 * this.particleScale));
        }
        if (this.mistMesh?.geometry) {
            this.mistMesh.geometry.setDrawRange(0, Math.floor(120 * this.particleScale));
        }
    }

    getCurrentWeather() {
        return this.targetWeatherType;
    }
}
