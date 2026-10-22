import * as THREE from '/vendor/three/build/three.module.js';

/**
 * ARASHIYAMA ONSEN RETREAT SYSTEM (SUỐI NƯỚC NÓNG RỪNG TRÚC)
 * TeleTerm 3D — Social Break-time & Cozy Vibes (Sprint 2.1)
 * 
 * Location: Northwest Bamboo Glade (Center x: -28.0, z: -30.0)
 * 
 * Features:
 * - Natural volcanic river stones embankment using InstancedMesh (Zero extra draw calls)
 * - Translucent warm azure mineral spring water with animated gentle ripples
 * - Zero-GC Steam Particles system (Pre-allocated Float32Array buffer pool)
 * - Traditional Japanese Taiko-bashi (Red Drum Bridge) over mineral stream
 * - Floating Hinoki Wooden Bath Tray with Matcha tea set and mini cyberpunk laptop
 * - Kasuga Toro carved stone lanterns with warm ambient amber glow
 * - Interactive Onsen Soaking spot with avatar relaxation state and Zen Focus Pomodoro rewards
 * - Strictly 0 additional cast shadow meshes to maintain global shadow budget <= 453
 */
export class BambooOnsenSystem {
    constructor(scene, terrainSystem, options = {}) {
        this.scene = scene;
        this.terrain = terrainSystem;
        this.onToast = options.onToast || null;
        this.onReward = options.onReward || null;

        // Spatial Center (Northwest serene bamboo clearing)
        this.center = new THREE.Vector3(-36.0, 0, -38.0);
        this.radiusX = 4.8;
        this.radiusZ = 3.6;
        this.waterY = 0.5;

        // Scene Graph Groups
        this.group = new THREE.Group();
        this.group.name = 'BambooOnsenSystem';

        // Meshes & Components
        this.waterMesh = null;
        this.steamParticles = null;
        this.steamPositions = null;
        this.steamLifes = null;
        this.steamCount = 48;
        this.floatingTray = null;
        this.lanternLights = [];
        this.rippleMesh = null;

        // Player Soaking State
        this.isPlayerSoaking = false;
        this.soakTimer = 0;
        this.soakTotalSeconds = 0;
        this.originalPlayerY = null;
        this.savedCameraOffset = null;

        // Animation clock
        this.elapsedTime = 0;
    }

    build() {
        // Derive elevation from terrain
        const groundY = this.terrain && typeof this.terrain.getTerrainHeight === 'function'
            ? this.terrain.getTerrainHeight(this.center.x, this.center.z)
            : (this.terrain && typeof this.terrain.getHeightAt === 'function' ? this.terrain.getHeightAt(this.center.x, this.center.z) : 0.6);

        this.waterY = Math.max(0.4, groundY - 0.22);
        this.center.y = this.waterY;

        // 1. Build Volcanic River Stone Embankment (InstancedMesh)
        this.buildStoneEmbankment();

        // 2. Build Translucent Warm Azure Mineral Water Surface
        this.buildMineralWater();

        // 3. Build Zero-GC Steam Vapor Particles Pool
        this.buildSteamParticles();

        // 4. Build Taiko-bashi (Red Arched Drum Wooden Bridge)
        this.buildDrumBridge();

        // 5. Build Floating Hinoki Wooden Bath Tray
        this.buildFloatingTray();

        // 6. Build Kasuga Toro Stone Lanterns with Amber Glow
        this.buildStoneLanterns();

        // 7. Build Avatar Soaking Ripple Effect
        this.buildSoakingRipples();

        this.scene.add(this.group);
    }

    /**
     * 1. Volcanic Stone Basin Ring using InstancedMesh
     * Zero new shadow casters (castShadow = false, receiveShadow = true)
     */
    buildStoneEmbankment() {
        const stoneCount = 36;
        const stoneGeo = new THREE.DodecahedronGeometry(0.55, 1);
        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0x334155, // Basalt river rock
            roughness: 0.88,
            metalness: 0.08
        });

        const instancedStones = new THREE.InstancedMesh(stoneGeo, stoneMat, stoneCount);
        instancedStones.name = 'OnsenBasaltStones';
        instancedStones.castShadow = false;
        instancedStones.receiveShadow = true;

        const dummy = new THREE.Object3D();
        for (let i = 0; i < stoneCount; i++) {
            const angle = (i / stoneCount) * Math.PI * 2;
            const rx = this.radiusX + Math.sin(angle * 3.5) * 0.35;
            const rz = this.radiusZ + Math.cos(angle * 2.5) * 0.28;

            const px = this.center.x + Math.cos(angle) * rx;
            const pz = this.center.z + Math.sin(angle) * rz;
            const py = this.waterY + 0.14 + (Math.sin(angle * 4.0) * 0.08);

            dummy.position.set(px, py, pz);
            dummy.scale.set(
                0.75 + (Math.sin(i * 1.7) * 0.35 + 0.35),
                0.65 + (Math.cos(i * 2.1) * 0.25 + 0.25),
                0.75 + (Math.sin(i * 3.3) * 0.35 + 0.35)
            );
            dummy.rotation.set(
                Math.sin(i) * 0.4,
                angle + Math.cos(i) * 0.5,
                Math.cos(i * 1.5) * 0.3
            );
            dummy.updateMatrix();
            instancedStones.setMatrixAt(i, dummy.matrix);
        }

        instancedStones.instanceMatrix.needsUpdate = true;
        this.group.add(instancedStones);
    }

    /**
     * 2. Warm Azure Mineral Spring Water
     */
    buildMineralWater() {
        const waterGeo = new THREE.CircleGeometry(this.radiusX - 0.2, 32);
        waterGeo.rotateX(-Math.PI / 2);
        waterGeo.scale(1.0, 1.0, this.radiusZ / this.radiusX);

        // Water Material: Soft turquoise mineral thermal spring
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x14b8a6,      // Teal-500 mineral water
            emissive: 0x042f2e,   // Subtle warm inner glow
            roughness: 0.12,
            metalness: 0.18,
            transparent: true,
            opacity: 0.88,
            depthWrite: false
        });

        this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
        this.waterMesh.name = 'OnsenMineralWater';
        this.waterMesh.position.set(this.center.x, this.waterY, this.center.z);
        this.waterMesh.receiveShadow = true;
        this.group.add(this.waterMesh);
    }

    /**
     * 3. Zero-GC Steam Particles Pool
     * Static Float32Array allocations; scalar math in update loop
     */
    buildSteamParticles() {
        const count = this.steamCount;
        const positions = new Float32Array(count * 3);
        const lifes = new Float32Array(count);
        const maxLife = 3.2;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * (this.radiusX - 0.8);
            const px = this.center.x + Math.cos(angle) * r;
            const pz = this.center.z + Math.sin(angle) * (r * (this.radiusZ / this.radiusX));
            const py = this.waterY + Math.random() * 1.8;

            positions[i * 3] = px;
            positions[i * 3 + 1] = py;
            positions[i * 3 + 2] = pz;
            lifes[i] = Math.random() * maxLife;
        }

        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Procedural soft cloud sprite canvas
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
        grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.45)');
        grad.addColorStop(0.4, 'rgba(240, 253, 250, 0.25)');
        grad.addColorStop(1.0, 'rgba(204, 251, 241, 0.0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);

        const steamTex = new THREE.CanvasTexture(canvas);
        const steamMat = new THREE.PointsMaterial({
            map: steamTex,
            size: 1.6,
            transparent: true,
            opacity: 0.65,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.steamParticles = new THREE.Points(pGeo, steamMat);
        this.steamParticles.name = 'OnsenSteamVapor';
        this.steamPositions = positions;
        this.steamLifes = lifes;
        this.group.add(this.steamParticles);
    }

    /**
     * 4. Taiko-bashi (Red Drum Wooden Bridge)
     * Arched vermillion pedestrian crossing over the hot spring outlet channel
     */
    buildDrumBridge() {
        const bridgeGroup = new THREE.Group();
        bridgeGroup.name = 'TaikoBashiDrumBridge';
        bridgeGroup.position.set(this.center.x + 4.5, this.waterY - 0.1, this.center.z);

        const vermillionMat = new THREE.MeshStandardMaterial({
            color: 0xb91c1c, // Vermillion red
            roughness: 0.42,
            metalness: 0.12
        });

        const blackLacquerMat = new THREE.MeshStandardMaterial({
            color: 0x171717,
            roughness: 0.25,
            metalness: 0.35
        });

        // Arched bridge deck using segments
        const plankCount = 14;
        const bridgeSpan = 4.2;
        const dummy = new THREE.Object3D();
        const plankGeo = new THREE.BoxGeometry(0.26, 0.08, 1.6);
        const instancedPlanks = new THREE.InstancedMesh(plankGeo, vermillionMat, plankCount);
        instancedPlanks.castShadow = false;
        instancedPlanks.receiveShadow = true;

        for (let i = 0; i < plankCount; i++) {
            const t = (i / (plankCount - 1)) - 0.5; // -0.5 to 0.5
            const px = t * bridgeSpan;
            const arch = Math.cos(t * Math.PI) * 0.42; // Arched crown
            const py = arch + 0.12;

            dummy.position.set(px, py, 0);
            dummy.rotation.set(0, 0, -t * 0.45);
            dummy.updateMatrix();
            instancedPlanks.setMatrixAt(i, dummy.matrix);
        }
        instancedPlanks.instanceMatrix.needsUpdate = true;
        bridgeGroup.add(instancedPlanks);

        // Handrails
        const railGeo = new THREE.CylinderGeometry(0.04, 0.04, bridgeSpan + 0.2, 8);
        railGeo.rotateZ(Math.PI / 2);

        const railNorth = new THREE.Mesh(railGeo, blackLacquerMat);
        railNorth.position.set(0, 0.72, 0.75);
        bridgeGroup.add(railNorth);

        const railSouth = new THREE.Mesh(railGeo, blackLacquerMat);
        railSouth.position.set(0, 0.72, -0.75);
        bridgeGroup.add(railSouth);

        // Rail Posts
        const postGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.75, 8);
        for (let side of [-0.75, 0.75]) {
            for (let px of [-1.8, -0.6, 0.6, 1.8]) {
                const post = new THREE.Mesh(postGeo, vermillionMat);
                const t = px / bridgeSpan;
                const arch = Math.cos(t * Math.PI) * 0.42;
                post.position.set(px, arch + 0.38, side);
                bridgeGroup.add(post);
            }
        }

        this.group.add(bridgeGroup);
    }

    /**
     * 5. Floating Hinoki Wooden Bath Tray
     * Floating tea ceremony set & miniature laptop
     */
    buildFloatingTray() {
        const trayGroup = new THREE.Group();
        trayGroup.name = 'OnsenFloatingTray';
        trayGroup.position.set(this.center.x - 1.4, this.waterY + 0.02, this.center.z + 1.2);

        // Tray body
        const trayMat = new THREE.MeshStandardMaterial({
            color: 0xd97706, // Hinoki Cypress wood
            roughness: 0.55,
            metalness: 0.05
        });
        const trayMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.04, 0.52), trayMat);
        trayMesh.castShadow = false;
        trayMesh.receiveShadow = true;
        trayGroup.add(trayMesh);

        // Teapot (Ceramic porcelain)
        const potMat = new THREE.MeshStandardMaterial({
            color: 0x0d9488, // Celadon jade ceramic
            roughness: 0.25,
            metalness: 0.15
        });
        const teapot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.10, 10), potMat);
        teapot.position.set(-0.16, 0.07, -0.10);
        trayGroup.add(teapot);

        // Matcha cup
        const cupMat = new THREE.MeshStandardMaterial({
            color: 0xf5f5f4, // White ceramic
            roughness: 0.2,
            metalness: 0.1
        });
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.07, 8), cupMat);
        cup.position.set(-0.16, 0.055, 0.10);
        trayGroup.add(cup);

        // Mini Cyberpunk Laptop
        const laptopBaseMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.35,
            metalness: 0.7
        });
        const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.015, 0.18), laptopBaseMat);
        laptopBase.position.set(0.16, 0.025, 0);
        trayGroup.add(laptopBase);

        // Screen glowing slightly
        const screenMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8 // Cyan code glow
        });
        const screen = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.01), screenMat);
        screen.position.set(0.16, 0.10, -0.09);
        screen.rotation.x = 0.22;
        trayGroup.add(screen);

        this.floatingTray = trayGroup;
        this.group.add(trayGroup);
    }

    /**
     * 6. Kasuga Toro (Stone Lanterns) with Warm Amber Glow
     */
    buildStoneLanterns() {
        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0x64748b, // Grey granite
            roughness: 0.85,
            metalness: 0.08
        });

        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xfbbf24 // Warm paper lantern glow
        });

        const lanternOffsets = [
            { x: -5.2, z: -2.8 },
            { x: -4.8, z: 3.2 }
        ];

        lanternOffsets.forEach((offset, idx) => {
            const lGroup = new THREE.Group();
            lGroup.name = `KasugaLantern_${idx}`;
            lGroup.position.set(this.center.x + offset.x, this.waterY + 0.1, this.center.z + offset.z);

            // Base
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 0.22, 6), stoneMat);
            base.position.y = 0.11;
            lGroup.add(base);

            // Pillar
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.85, 6), stoneMat);
            pillar.position.y = 0.64;
            lGroup.add(pillar);

            // Light Chamber (Hibukuro)
            const chamber = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.35, 6), glowMat);
            chamber.position.y = 1.20;
            lGroup.add(chamber);

            // Roof (Kasa)
            const roof = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.30, 6), stoneMat);
            roof.position.y = 1.52;
            lGroup.add(roof);

            // Jewel Finial (Hoju)
            const finial = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), stoneMat);
            finial.position.y = 1.72;
            lGroup.add(finial);

            // Ambient gentle warm point light (castShadow = false for budget safety)
            const pLight = new THREE.PointLight(0xf59e0b, 0.95, 7.5, 2.0);
            pLight.position.y = 1.20;
            pLight.castShadow = false;
            lGroup.add(pLight);
            this.lanternLights.push(pLight);

            this.group.add(lGroup);
        });
    }

    /**
     * 7. Avatar Soaking Water Ripples (Concentric ring)
     */
    buildSoakingRipples() {
        const ringGeo = new THREE.RingGeometry(0.3, 0.7, 32);
        ringGeo.rotateX(-Math.PI / 2);

        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xccfbf1,
            transparent: true,
            opacity: 0.0,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.rippleMesh = new THREE.Mesh(ringGeo, ringMat);
        this.rippleMesh.name = 'OnsenSoakingRipples';
        this.rippleMesh.position.set(this.center.x, this.waterY + 0.02, this.center.z);
        this.group.add(this.rippleMesh);
    }

    /**
     * Proximity prompt for interaction
     */
    getNearbyPrompt(playerPos) {
        if (!playerPos) return null;

        const dx = playerPos.x - this.center.x;
        const dz = playerPos.z - this.center.z;
        const distToCenter = Math.sqrt(dx * dx + dz * dz);

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';

        if (this.isPlayerSoaking) {
            return {
                text: isVi ? '[E] Rời khỏi suối nước nóng' : '[E] Step out of Hot Spring',
                action: () => this.toggleSoaking(playerPos)
            };
        }

        // Within hot spring pool radius + 1.2m margin
        if (distToCenter <= this.radiusX + 1.2) {
            return {
                text: isVi ? '[E] Ngâm mình thư giãn (Suối Nước Nóng)' : '[E] Soak & Relax in Hot Spring',
                action: () => this.toggleSoaking(playerPos)
            };
        }

        return null;
    }

    /**
     * Toggle Player Soaking State
     */
    toggleSoaking(playerPos) {
        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';

        if (this.isPlayerSoaking) {
            // Exit soaking
            this.isPlayerSoaking = false;
            if (this.rippleMesh) this.rippleMesh.material.opacity = 0.0;

            const toastMsg = isVi
                ? `Đã hoàn thành phiên ngâm mình! Bạn đã thư giãn trong ${Math.round(this.soakTotalSeconds)} giây.`
                : `Stepped out of the hot spring! You relaxed for ${Math.round(this.soakTotalSeconds)} seconds.`;

            if (this.onToast) this.onToast(toastMsg, 'info');
            this.soakTotalSeconds = 0;
        } else {
            // Enter soaking
            this.isPlayerSoaking = true;
            this.soakTimer = 0;
            this.soakTotalSeconds = 0;

            // Place avatar into water center-left
            if (playerPos) {
                playerPos.x = this.center.x - 0.8;
                playerPos.z = this.center.z + 0.5;
            }

            if (this.rippleMesh) {
                this.rippleMesh.position.set(this.center.x - 0.8, this.waterY + 0.02, this.center.z + 0.5);
                this.rippleMesh.material.opacity = 0.75;
            }

            const toastMsg = isVi
                ? 'Đang ngâm mình trong suối khoáng Arashiyama... (Tích lũy Zen Focus Time + Dev Coins)'
                : 'Soaking in Arashiyama Onsen... (Accumulating Zen Focus Time + Dev Coins)';

            if (this.onToast) this.onToast(toastMsg, 'success');
        }
    }

    /**
     * Zero-GC Tick Loop Update
     */
    update(delta, timeOfDay = 12, playerPos = null) {
        this.elapsedTime += delta;
        const time = this.elapsedTime;

        // 1. Water Surface Sine Pulse
        if (this.waterMesh) {
            const waterMat = this.waterMesh.material;
            if (waterMat.emissive) {
                const pulse = 0.08 + Math.sin(time * 1.8) * 0.03;
                waterMat.emissive.setRGB(0.02 * pulse, 0.12 * pulse, 0.18 * pulse);
            }
        }

        // 2. Zero-GC Steam Particles Update (Pre-allocated scalar operations)
        if (this.steamParticles && this.steamPositions) {
            const count = this.steamCount;
            const pos = this.steamParticles.geometry.attributes.position;
            const positions = this.steamPositions;
            const lifes = this.steamLifes;
            const maxLife = 3.2;

            for (let i = 0; i < count; i++) {
                lifes[i] += delta;
                const idx = i * 3;

                // Drift upwards
                positions[idx + 1] += 0.42 * delta;
                // Subtle gentle horizontal sway
                positions[idx] += Math.sin(time * 1.5 + i * 0.7) * 0.015 * delta;
                positions[idx + 2] += Math.cos(time * 1.2 + i * 0.9) * 0.012 * delta;

                // Recycle particle smoothly back to pool surface
                if (lifes[i] > maxLife || positions[idx + 1] > this.waterY + 2.4) {
                    lifes[i] = 0;
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.sqrt(Math.random()) * (this.radiusX - 0.6);
                    positions[idx] = this.center.x + Math.cos(angle) * r;
                    positions[idx + 1] = this.waterY + 0.05 + Math.random() * 0.15;
                    positions[idx + 2] = this.center.z + Math.sin(angle) * (r * (this.radiusZ / this.radiusX));
                }
            }
            pos.needsUpdate = true;
        }

        // 3. Floating Hinoki Bath Tray Physics (Gentle bob & roll)
        if (this.floatingTray) {
            this.floatingTray.position.y = this.waterY + 0.02 + Math.sin(time * 2.2) * 0.018;
            this.floatingTray.rotation.z = Math.sin(time * 1.8) * 0.028;
            this.floatingTray.rotation.x = Math.cos(time * 1.4) * 0.022;
        }

        // 4. Kasuga Toro Lantern Lights (Intensify at dusk/night: 18h - 6h)
        const isNight = timeOfDay >= 18.0 || timeOfDay <= 6.0;
        const targetIntensity = isNight ? 1.4 : 0.45;
        this.lanternLights.forEach((light) => {
            light.intensity += (targetIntensity - light.intensity) * delta * 2.0;
        });

        // 5. Soaking Player Zen Focus Loop & Ripples
        if (this.isPlayerSoaking) {
            this.soakTimer += delta;
            this.soakTotalSeconds += delta;

            // Expand and pulse ripples
            if (this.rippleMesh) {
                const scale = 1.0 + (this.soakTimer % 2.5) * 0.6;
                this.rippleMesh.scale.set(scale, scale, scale);
                this.rippleMesh.material.opacity = Math.max(0.0, 0.75 - (this.soakTimer % 2.5) * 0.3);
            }

            // Award Zen Focus Dev Coins every 30 seconds
            if (this.soakTimer >= 30.0) {
                this.soakTimer = 0;
                if (this.onReward) {
                    this.onReward({ coins: 15, xp: 25, reason: 'Zen Focus Hot Spring Soaking' });
                }
                const i18n = window.TeleTermI18n;
                const isVi = i18n && i18n.getLanguage() === 'vi';
                if (this.onToast) {
                    this.onToast(isVi ? '+15 Dev Coins từ Suối Nước Nóng Arashiyama! ♨️' : '+15 Dev Coins from Arashiyama Onsen! ♨️', 'success');
                }
            }
        }
    }
}
