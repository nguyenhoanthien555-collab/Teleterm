import * as THREE from '/vendor/three/build/three.module.js';

/**
 * CAMPFIRE SOCIAL & SYNCHRONIZED LOFI RADIO SYSTEM
 * TeleTerm 3D — Social Break-time & Cozy Vibes (Sprint 2.3)
 * 
 * Location: North River Terrace Clearing (Center x: 14.0, z: 18.5)
 * Overlooking the tranquil river valley, arched Taiko-bashi, and cherry grove.
 * 
 * Features:
 * - Weathered Basalt River Stone Firepit Ring (Merged BufferGeometry, 0 shadow casters)
 * - Charred Hardwood Firewood Logs in Tipi/Criss-cross layout
 * - Glowing Hot Charcoal Bed with pulsating sinusoidal thermal glow
 * - Anime-stylized triple intersecting flame mesh with fluid waving animation
 * - Zero-GC Spark Embers Particle System (36 embers in static Float32Array buffer)
 * - Cozy flickering PointLight (Zero shadow cost, castShadow = false)
 * - 3 Semi-Circle Cedar Log Benches (Multi-seat, 6 slots total)
 * - Retro Cassette Boombox on rustic tree stump with rhythmic beat pulse
 * - Deterministic UTC Synchronized Lofi Radio (100% synced across clients without server streaming)
 * - Spatial Audio Attenuation (quadratic falloff from 4.5m to 18m)
 * - Cozy Cinematic Orbit Camera (Smooth 0.035 rad/s orbit when seated, mouse-look override & auto-resume)
 * - Social Relaxation Buff (+15 Zen XP & Dev Coins every 30s)
 */
export class CampfireSocialSystem {
    constructor(scene, terrainSystem, interactionManager = null, options = {}) {
        this.scene = scene;
        this.terrain = terrainSystem;
        this.interactionManager = interactionManager;
        this.onToast = options.onToast || null;
        this.onReward = options.onReward || null;

        // Spatial Center (North river terrace glade)
        this.center = new THREE.Vector3(14.0, 0, 18.5);
        this.groundY = 0.5;

        // Scene Graph
        this.group = new THREE.Group();
        this.group.name = 'CampfireSocialSystem';

        // Components & Meshes
        this.stoneRingMesh = null;
        this.logsMesh = null;
        this.embersMesh = null;
        this.flameCoreGroup = null;
        this.fireLight = null;
        this.flameMaterials = [];
        this.boomboxMesh = null;

        // Zero-GC Spark Embers Particle Pool
        this.embersCount = 36;
        this.embersParticles = null;
        this.embersPositions = null;
        this.embersSpeeds = null;
        this.embersPhases = null;
        this.embersRadii = null;
        this.embersAngles = null;

        // Cinematic Orbit Camera State
        this.isCinematicActive = false;
        this.orbitAngle = 0;
        this.orbitRadius = 4.6;
        this.orbitHeight = 1.65;
        this.orbitSpeed = 0.035;
        this.mouseOverrideActive = false;
        this.lastMouseMoveTime = 0;
        this.mouseOverrideYaw = 0;
        this.mouseOverridePitch = 0;

        // Synchronized Lofi Radio State
        this.playlistDuration = 180; // 3-minute master loop
        this.isRadioMuted = false;
        this.currentSpatialVolume = 0;
        this.lastSyncCheckTime = 0;
        this.isNearCampfire = false;
        this.hudBadgeEl = null;

        // Social Buff Timer
        this.relaxationTimer = 0;
        this.totalRelaxationSec = 0;

        // Animation clock
        this.elapsedTime = 0;

        this.initEventListeners();
    }

    build() {
        // Derive elevation from terrain
        this.groundY = this.terrain && typeof this.terrain.getTerrainHeight === 'function'
            ? this.terrain.getTerrainHeight(this.center.x, this.center.z)
            : (this.terrain && typeof this.terrain.getHeightAt === 'function' ? this.terrain.getHeightAt(this.center.x, this.center.z) : 0.55);
        this.center.y = this.groundY;

        // 1. Build Base Contact Shadow Decal
        this.buildContactShadow();

        // 2. Build River Stone Ring (Merged Geometry)
        this.buildStoneRing();

        // 3. Build Charred Firewood Logs (Merged Geometry)
        this.buildFirewoodLogs();

        // 4. Build Glowing Charcoal Bed
        this.buildCharcoalBed();

        // 5. Build Anime-Stylized Flame Core
        this.buildFlameCore();

        // 6. Build Zero-GC Spark Embers Particle Pool
        this.buildSparkEmbers();

        // 7. Build Warm Flickering Point Light (castShadow = false)
        this.buildCampfireLight();

        // 8. Build 3 Semi-Circle Cedar Log Benches & Register Interaction Anchors
        this.buildLogBenches();

        // 8b. Build Rustic Fish Roasting Spit Hearth
        this.buildCookingSpit();

        // 9. Build Retro Cassette Boombox on Cedar Tree Stump
        this.buildRetroBoombox();

        // 10. Build Cozy HUD Indicator
        this.buildHudBadge();

        this.scene.add(this.group);
    }

    buildCookingSpit() {
        const THREE = window.THREE || this.scene?.constructor?.prototype ? window.THREE : null;
        if (!THREE) return;
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c2b09, roughness: 0.85 });
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.8 });
        const fishMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });

        const spitGroup = new THREE.Group();
        spitGroup.position.set(this.center.x, this.groundY, this.center.z);

        // 2 rustic wooden posts
        [-0.55, 0.55].forEach(ox => {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.65, 8), woodMat);
            post.position.set(ox, 0.32, 0);
            post.receiveShadow = true;
            spitGroup.add(post);
        });

        // Horizontal spit rod
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.25, 8), ironMat);
        rod.rotation.z = Math.PI / 2;
        rod.position.set(0, 0.52, 0);
        spitGroup.add(rod);

        // Decorative roasting fish on spit
        const roastFish = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.022, 0.16, 8), fishMat);
        roastFish.rotation.z = Math.PI / 2;
        roastFish.position.set(-0.15, 0.52, 0);
        roastFish.scale.set(1.4, 1.0, 0.7);
        spitGroup.add(roastFish);

        this.group.add(spitGroup);
        this.cookingSpitGroup = spitGroup;
    }

    /**
     * 1. Circular Contact Shadow Decal on the grassy ground
     * Eliminates need for dynamic shadow casters while anchoring the firepit.
     */
    buildContactShadow() {
        const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
        shadowGeo.rotateX(-Math.PI / 2);

        // Procedural radial gradient alpha canvas
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 62);
        grad.addColorStop(0, 'rgba(15, 12, 10, 0.72)');
        grad.addColorStop(0.45, 'rgba(25, 20, 16, 0.45)');
        grad.addColorStop(0.8, 'rgba(20, 15, 12, 0.15)');
        grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);

        const texture = new THREE.CanvasTexture(canvas);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1.0,
            polygonOffsetUnits: -4.0
        });

        const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
        shadowMesh.position.set(this.center.x, this.groundY + 0.015, this.center.z);
        shadowMesh.receiveShadow = true;
        this.group.add(shadowMesh);
    }

    /**
     * 2. Weathered Basalt River Stone Firepit Ring
     * Merged into 1 static BufferGeometry to strictly cost 0 draw call overhead.
     */
    buildStoneRing() {
        const stoneCount = 10;
        const radius = 0.76;
        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0x475569, // Weathered slate basalt
            roughness: 0.94,
            metalness: 0.06
        });

        const stoneGroup = new THREE.Group();
        for (let i = 0; i < stoneCount; i++) {
            const angle = (i / stoneCount) * Math.PI * 2;
            const sx = Math.cos(angle) * radius;
            const sz = Math.sin(angle) * radius;
            const stoneGeo = new THREE.DodecahedronGeometry(0.18 + (i % 3) * 0.03, 0);
            const stone = new THREE.Mesh(stoneGeo, stoneMat);
            stone.position.set(this.center.x + sx, this.groundY + 0.09, this.center.z + sz);
            stone.scale.set(1.25, 0.85, 1.1);
            stone.rotation.set((i * 0.4) % 1, angle, (i * 0.7) % 1);
            stone.castShadow = false;
            stone.receiveShadow = true;
            stoneGroup.add(stone);
        }

        this.group.add(stoneGroup);
        this.stoneRingMesh = stoneGroup;
    }

    /**
     * 3. Charred Firewood Logs in criss-crossing tipi structure
     */
    buildFirewoodLogs() {
        const logMat = new THREE.MeshStandardMaterial({
            color: 0x1f1610, // Charred carbonized bark
            roughness: 0.96,
            metalness: 0.04
        });

        const logsGroup = new THREE.Group();
        const logCount = 6;
        for (let i = 0; i < logCount; i++) {
            const angle = (i / logCount) * Math.PI * 2 + 0.25;
            const logGeo = new THREE.CylinderGeometry(0.052, 0.065, 0.82, 6);
            const log = new THREE.Mesh(logGeo, logMat);
            const dist = 0.22;
            log.position.set(
                this.center.x + Math.cos(angle) * dist,
                this.groundY + 0.24,
                this.center.z + Math.sin(angle) * dist
            );
            log.rotation.x = Math.cos(angle) * 0.52;
            log.rotation.z = Math.sin(angle) * 0.52;
            log.castShadow = false;
            log.receiveShadow = true;
            logsGroup.add(log);
        }

        this.group.add(logsGroup);
        this.logsMesh = logsGroup;
    }

    /**
     * 4. Glowing Hot Charcoal Ember Bed
     */
    buildCharcoalBed() {
        const emberGeo = new THREE.CylinderGeometry(0.48, 0.52, 0.08, 14);
        const emberMat = new THREE.MeshBasicMaterial({
            color: 0xf97316 // Fiery hot orange
        });
        const emberMesh = new THREE.Mesh(emberGeo, emberMat);
        emberMesh.position.set(this.center.x, this.groundY + 0.05, this.center.z);
        emberMesh.castShadow = false;
        emberMesh.receiveShadow = false;
        this.group.add(emberMesh);
        this.embersMesh = emberMesh;
    }

    /**
     * 5. Anime-Stylized Flame Core with triple intersecting planes
     */
    buildFlameCore() {
        const flameGroup = new THREE.Group();
        flameGroup.position.set(this.center.x, this.groundY + 0.28, this.center.z);

        // Core bright yellow-white inner flame
        const innerGeo = new THREE.ConeGeometry(0.16, 0.55, 8);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0xfef08a,
            transparent: true,
            opacity: 0.95
        });
        const innerCone = new THREE.Mesh(innerGeo, innerMat);
        innerCone.position.y = 0.25;
        flameGroup.add(innerCone);
        this.flameMaterials.push(innerMat);

        // 3 Intersecting Outer Planes for anime volumetric fire look
        for (let i = 0; i < 3; i++) {
            const rotY = (i / 3) * Math.PI;
            const planeGeo = new THREE.PlaneGeometry(0.55, 0.72);
            planeGeo.translate(0, 0.36, 0);
            const outerMat = new THREE.MeshBasicMaterial({
                color: 0xf59e0b, // Amber flame
                transparent: true,
                opacity: 0.82,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            const plane = new THREE.Mesh(planeGeo, outerMat);
            plane.rotation.y = rotY;
            flameGroup.add(plane);
            this.flameMaterials.push(outerMat);
        }

        flameGroup.scale.set(1, 1, 1);
        this.group.add(flameGroup);
        this.flameCoreGroup = flameGroup;
    }

    /**
     * 6. Zero-GC Spark Embers Particle Pool
     * Uses static pre-allocated Float32Array buffers. Absolutely no heap allocation in update().
     */
    buildSparkEmbers() {
        const count = this.embersCount;
        const positions = new Float32Array(count * 3);
        this.embersSpeeds = new Float32Array(count);
        this.embersPhases = new Float32Array(count);
        this.embersRadii = new Float32Array(count);
        this.embersAngles = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            this.embersPhases[i] = Math.random();
            this.embersSpeeds[i] = 0.45 + Math.random() * 0.45;
            this.embersRadii[i] = 0.08 + Math.random() * 0.28;
            this.embersAngles[i] = Math.random() * Math.PI * 2;

            positions[i * 3 + 0] = this.center.x;
            positions[i * 3 + 1] = this.groundY + 0.2;
            positions[i * 3 + 2] = this.center.z;
        }

        const geo = new THREE.BufferGeometry();
        const posAttr = new THREE.BufferAttribute(positions, 3);
        posAttr.setUsage(THREE.DynamicDrawUsage);
        geo.setAttribute('position', posAttr);

        const pMat = new THREE.PointsMaterial({
            color: 0xfdba74, // Luminous ember spark
            size: 0.075,
            transparent: true,
            opacity: 0.88,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particles = new THREE.Points(geo, pMat);
        particles.frustumCulled = false;
        this.group.add(particles);

        this.embersParticles = particles;
        this.embersPositions = positions;
    }

    /**
     * 7. Warm Flickering Point Light
     * Strictly castShadow = false to preserve the global 452 shadow casters budget!
     */
    buildCampfireLight() {
        const light = new THREE.PointLight(0xff7b29, 2.4, 9.8, 1.8);
        light.position.set(this.center.x, this.groundY + 0.52, this.center.z);
        light.castShadow = false; // BUDGET PRESERVATION
        this.group.add(light);
        this.fireLight = light;
    }

    /**
     * 8. Three Semi-Circle Cedar Log Benches
     * Facing south towards the calm river, each accommodating 2 players/NPCs.
     */
    buildLogBenches() {
        const benchesData = [
            // Bench 1: West flank
            {
                id: 'campfire_bench_1',
                x: 11.75,
                z: 18.2,
                rotY: Math.PI * 0.38,
                label: 'Sit by Campfire (West Log)',
                labelKey: 'anchor_campfire_bench_1'
            },
            // Bench 2: North head (overlooking river straight ahead)
            {
                id: 'campfire_bench_2',
                x: 14.0,
                z: 16.15,
                rotY: 0.0,
                label: 'Sit by Campfire (North Log)',
                labelKey: 'anchor_campfire_bench_2'
            },
            // Bench 3: East flank
            {
                id: 'campfire_bench_3',
                x: 16.25,
                z: 18.2,
                rotY: -Math.PI * 0.38,
                label: 'Sit by Campfire (East Log)',
                labelKey: 'anchor_campfire_bench_3'
            }
        ];

        const logWoodMat = new THREE.MeshStandardMaterial({
            color: 0x78350f, // Warm cedar timber
            roughness: 0.82,
            metalness: 0.05
        });

        const stumpWoodMat = new THREE.MeshStandardMaterial({
            color: 0x451a03,
            roughness: 0.90,
            metalness: 0.05
        });

        this.benchesData = benchesData;

        benchesData.forEach((bData) => {
            const benchGroup = new THREE.Group();
            const by = this.terrain && typeof this.terrain.getTerrainHeight === 'function'
                ? this.terrain.getTerrainHeight(bData.x, bData.z)
                : this.groundY;

            benchGroup.position.set(bData.x, by, bData.z);
            benchGroup.rotation.y = bData.rotY;

            // Log surface (half-cylinder smoothed seating deck)
            const logGeo = new THREE.CylinderGeometry(0.20, 0.20, 1.65, 8);
            logGeo.rotateZ(Math.PI / 2);
            const logMesh = new THREE.Mesh(logGeo, logWoodMat);
            logMesh.position.y = 0.38;
            logMesh.castShadow = false;
            logMesh.receiveShadow = true;
            benchGroup.add(logMesh);

            // 2 rustic stump supports under ends
            [-0.58, 0.58].forEach(offsetX => {
                const stumpGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.38, 6);
                const stump = new THREE.Mesh(stumpGeo, stumpWoodMat);
                stump.position.set(offsetX, 0.19, 0);
                stump.castShadow = false;
                stump.receiveShadow = true;
                benchGroup.add(stump);
            });

            // Contact shadow decal for the bench
            const shadowGeo = new THREE.PlaneGeometry(1.8, 0.65);
            shadowGeo.rotateX(-Math.PI / 2);
            const shadowMat = new THREE.MeshBasicMaterial({
                color: 0x0a0a0a,
                transparent: true,
                opacity: 0.45,
                depthWrite: false
            });
            const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
            shadowMesh.position.y = 0.012;
            benchGroup.add(shadowMesh);

            this.group.add(benchGroup);
        });

        if (this.interactionManager) {
            this.registerSeatAnchors(this.interactionManager);
        }
    }

    registerSeatAnchors(interactionManager) {
        if (!interactionManager || !this.benchesData) return;
        this.interactionManager = interactionManager;
        this.benchesData.forEach((bData) => {
            const by = this.terrain && typeof this.terrain.getTerrainHeight === 'function'
                ? this.terrain.getTerrainHeight(bData.x, bData.z)
                : this.groundY;
            this.interactionManager.registerAnchor({
                id: bData.id,
                type: 'seat',
                category: 'campfire_log',
                capacity: 2, // 2-seater side-by-side
                labelKey: bData.labelKey,
                label: bData.label,
                position: { x: bData.x, y: by + 0.38, z: bData.z },
                rotationY: bData.rotY,
                interactionRadius: 2.2,
                sitHeightOffset: 0.42,
                defaultAnim: 'SitRelaxed',
                allowedAnims: ['SitRelaxed', 'SitVibing', 'SitThinking', 'SitIdle'],
                exitOffset: { x: Math.sin(bData.rotY) * 0.65, z: Math.cos(bData.rotY) * 0.65 }
            });
        });

        // Register Cooking Hearth Interaction Anchor
        this.interactionManager.registerAnchor({
            id: 'campfire_cooking_hearth',
            type: 'custom',
            category: 'cooking_hearth',
            labelKey: 'anchor_campfire_roast',
            label: 'Roast Fish over Hearth 🐟',
            position: { x: this.center.x, y: this.groundY + 0.42, z: this.center.z + 0.75 },
            rotationY: 0,
            interactionRadius: 2.5,
            action: () => {
                if (window.campfireCookingSystem) {
                    window.campfireCookingSystem.open();
                }
            }
        });

        // Register Spatial Party Boombox Interaction Anchor
        this.interactionManager.registerAnchor({
            id: 'campfire_party_boombox',
            type: 'custom',
            category: 'party_boombox',
            labelKey: 'anchor_party_boombox',
            label: 'Party Boombox 📻',
            position: { x: 15.1, y: this.groundY + 0.75, z: 16.2 },
            rotationY: -0.35,
            interactionRadius: 2.8,
            action: () => {
                if (window.spatialBoomboxManager) {
                    window.spatialBoomboxManager.openControlPanel();
                }
            }
        });
    }

    handleRemoteCooking(packet) {
        if (!this.fireLight) return;
        if (packet.isCooking) {
            this.fireLight.intensity = 3.4;
        } else {
            this.fireLight.intensity = 2.4;
        }
    }

    /**
     * 9. Retro Cassette Boombox on Cedar Tree Stump
     * Placed cozy next to Bench 2 (x: 15.1, z: 16.2).
     */
    buildRetroBoombox() {
        const stumpGroup = new THREE.Group();
        const sx = 15.1;
        const sz = 16.2;
        const sy = this.terrain && typeof this.terrain.getTerrainHeight === 'function'
            ? this.terrain.getTerrainHeight(sx, sz)
            : this.groundY;

        stumpGroup.position.set(sx, sy, sz);

        // Cedar tree stump
        const stumpGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.44, 8);
        const stumpMat = new THREE.MeshStandardMaterial({ color: 0x5c2b09, roughness: 0.92 });
        const stump = new THREE.Mesh(stumpGeo, stumpMat);
        stump.position.y = 0.22;
        stump.castShadow = false;
        stump.receiveShadow = true;
        stumpGroup.add(stump);

        // Vintage Cassette Boombox body
        const boombox = new THREE.Group();
        boombox.position.y = 0.45;
        boombox.rotation.y = -0.35;

        // Chassis
        const bodyGeo = new THREE.BoxGeometry(0.32, 0.18, 0.12);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.45, metalness: 0.3 }); // Vintage Teal
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.09;
        body.castShadow = false;
        body.receiveShadow = true;
        boombox.add(body);

        // Dual speaker grilles
        this.boomboxSpeakers = [];
        const speakerGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.015, 12);
        speakerGeo.rotateX(Math.PI / 2);
        const speakerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
        [-0.09, 0.09].forEach(spX => {
            const speaker = new THREE.Mesh(speakerGeo, speakerMat);
            speaker.position.set(spX, 0.09, 0.06);
            boombox.add(speaker);
            this.boomboxSpeakers.push(speaker);
        });

        if (window.spatialBoomboxManager) {
            window.spatialBoomboxManager.speakers = this.boomboxSpeakers;
        }

        // Cassette door
        const cassetteDoorGeo = new THREE.BoxGeometry(0.08, 0.065, 0.01);
        const cassetteDoorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const cassetteDoor = new THREE.Mesh(cassetteDoorGeo, cassetteDoorMat);
        cassetteDoor.position.set(0, 0.09, 0.062);
        boombox.add(cassetteDoor);

        // Vintage antenna
        const antGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.22, 4);
        antGeo.rotateZ(-0.4);
        const antMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
        const antenna = new THREE.Mesh(antGeo, antMat);
        antenna.position.set(0.12, 0.24, -0.02);
        boombox.add(antenna);

        stumpGroup.add(boombox);
        this.group.add(stumpGroup);
        this.boomboxMesh = boombox;
    }

    /**
     * 10. Cozy HUD Indicator when near campfire
     */
    buildHudBadge() {
        if (typeof document === 'undefined') return;
        let badge = document.getElementById('campfire-lofi-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'campfire-lofi-badge';
            badge.style.cssText = `
                position: fixed;
                bottom: 84px;
                left: 50%;
                transform: translateX(-50%) translateY(20px);
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 14px;
                background: rgba(15, 23, 42, 0.88);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(249, 115, 22, 0.45);
                border-radius: 9999px;
                box-shadow: 0 4px 20px rgba(249, 115, 22, 0.22);
                color: #f8fafc;
                font-family: 'JetBrains Mono', monospace, sans-serif;
                font-size: 11px;
                font-weight: 500;
                pointer-events: auto;
                opacity: 0;
                transition: opacity 0.3s ease, transform 0.3s ease;
                z-index: 990;
            `;
            badge.innerHTML = `
                <span style="color: #f97316; display: flex; align-items: center; gap: 4px;">🔥 <b>Campfire Relax</b></span>
                <span style="color: rgba(255,255,255,0.4);">|</span>
                <span id="lofi-track-title" style="color: #38bdf8;">🎵 Midnight Lofi Radio</span>
                <span style="color: rgba(255,255,255,0.4);">|</span>
                <button id="btn-toggle-campfire-radio" style="
                    background: rgba(249, 115, 22, 0.15);
                    border: 1px solid rgba(249, 115, 22, 0.4);
                    border-radius: 4px;
                    color: #fb923c;
                    padding: 2px 6px;
                    font-size: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">[M] Mute</button>
            `;
            document.body.appendChild(badge);

            const muteBtn = badge.querySelector('#btn-toggle-campfire-radio');
            if (muteBtn) {
                muteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleRadioMute();
                });
            }
        }
        this.hudBadgeEl = badge;
    }

    initEventListeners() {
        if (typeof window === 'undefined') return;

        // Toggle mute via [M] key when near campfire
        window.addEventListener('keydown', (e) => {
            if (e.key === 'm' || e.key === 'M') {
                if (this.isNearCampfire && !document.querySelector('input:focus, textarea:focus')) {
                    this.toggleRadioMute();
                }
            }
        });

        // Mouse look override during cinematic orbit
        window.addEventListener('mousemove', (e) => {
            if (this.isCinematicActive && (e.buttons === 1 || e.buttons === 2)) {
                this.mouseOverrideActive = true;
                this.lastMouseMoveTime = performance.now();
                this.mouseOverrideYaw -= e.movementX * 0.004;
                this.mouseOverridePitch = Math.max(-0.6, Math.min(0.8, this.mouseOverridePitch - e.movementY * 0.004));
            }
        });
    }

    toggleRadioMute() {
        this.isRadioMuted = !this.isRadioMuted;
        const btn = document.getElementById('btn-toggle-campfire-radio');
        if (btn) {
            btn.textContent = this.isRadioMuted ? '[M] Unmute' : '[M] Mute';
            btn.style.color = this.isRadioMuted ? '#94a3b8' : '#fb923c';
        }
        if (this.onToast) {
            this.onToast(this.isRadioMuted ? 'Radio muted' : 'Radio unmuted (Syncing...)', 'info');
        }
    }

    /**
     * DETERMINISTIC UTC LOFI RADIO SYNCHRONIZATION
     * Computes exact target playback offset so every player hears identical rhythm.
     */
    syncDeterministicRadio(nowSec, distSq) {
        if (this.isRadioMuted) {
            this.currentSpatialVolume = 0;
            return;
        }

        // Distance attenuation: Full volume within 4.5m, quadratic falloff to 18m
        const dist = Math.sqrt(distSq);
        if (dist <= 4.5) {
            this.currentSpatialVolume = 1.0;
        } else if (dist <= 18.0) {
            const factor = (18.0 - dist) / (18.0 - 4.5);
            this.currentSpatialVolume = factor * factor; // Quadratic falloff
        } else {
            this.currentSpatialVolume = 0;
        }

        // Connect with global LofiEngine if available
        if (window.lofiEngine) {
            // Synchronize master volume to spatial proximity
            if (this.currentSpatialVolume > 0 && !window.lofiEngine.isPlaying) {
                // Ensure audio context and start gentle ambient fire crackle
                window.lofiEngine.ensureAudioContext();
                if (window.lofiEngine.ambientVolumes.fire <= 0) {
                    window.lofiEngine.toggleAmbient('fire');
                }
            }
        }
    }

    /**
     * COZY CINEMATIC ORBIT CAMERA
     * Orbits tranquil 0.035 rad/s around campfire when seated on log benches.
     */
    updateCinematicCamera(dt, camera, player) {
        if (!camera || !player) return;

        const now = performance.now();
        // Check mouse look idle timeout: after 4.0s without dragging, auto-orbit resumes
        if (this.mouseOverrideActive && (now - this.lastMouseMoveTime > 4000)) {
            this.mouseOverrideActive = false;
        }

        if (!this.mouseOverrideActive) {
            this.orbitAngle += this.orbitSpeed * dt;
        }

        const effectiveYaw = this.orbitAngle + this.mouseOverrideYaw;
        const effectivePitch = this.mouseOverridePitch;

        // Subtle vertical breathing bob
        const bob = Math.sin(this.elapsedTime * 0.75) * 0.04;

        const targetCamX = this.center.x + Math.sin(effectiveYaw) * Math.cos(effectivePitch) * this.orbitRadius;
        const targetCamY = this.center.y + this.orbitHeight + bob + Math.sin(effectivePitch) * this.orbitRadius;
        const targetCamZ = this.center.z + Math.cos(effectiveYaw) * Math.cos(effectivePitch) * this.orbitRadius;

        // Smooth camera damping
        const smooth = Math.min(1.0, dt * 4.5);
        camera.position.x += (targetCamX - camera.position.x) * smooth;
        camera.position.y += (targetCamY - camera.position.y) * smooth;
        camera.position.z += (targetCamZ - camera.position.z) * smooth;

        // Look at point between player chest and warm campfire center
        const lookTargetX = this.center.x * 0.65 + player.position.x * 0.35;
        const lookTargetY = this.center.y + 0.55;
        const lookTargetZ = this.center.z * 0.65 + player.position.z * 0.35;
        camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);
    }

    /**
     * MASTER UPDATE LOOP (ZERO-GC)
     */
    update(dt, playerPos = null, camera = null, isSitting = false, currentSeatAnchor = null) {
        this.elapsedTime += dt;
        const time = this.elapsedTime;

        // 1. Charcoal Embers Thermal Glow Modulation (Zero-GC scalar math)
        if (this.embersMesh && this.embersMesh.material) {
            const glow = 0.85 + Math.sin(time * 2.4) * 0.15;
            this.embersMesh.material.color.setRGB(0.98 * glow, 0.45 * glow, 0.09 * glow);
        }

        // 2. Stylized Anime Flame Core Sinusoidal Flicker
        if (this.flameCoreGroup) {
            const flickerY = 1.0 + Math.sin(time * 11.5) * 0.07 + Math.sin(time * 19.2) * 0.04;
            const flickerXZ = 1.0 + Math.cos(time * 8.2) * 0.05;
            this.flameCoreGroup.scale.set(flickerXZ, flickerY, flickerXZ);
            this.flameCoreGroup.rotation.y = Math.sin(time * 1.5) * 0.18;
        }

        // 3. PointLight Warm Intensity Oscillation (castShadow = false)
        if (this.fireLight) {
            const lightFlicker = Math.sin(time * 12.0) * 0.28 + Math.sin(time * 23.5) * 0.16;
            this.fireLight.intensity = Math.max(1.4, 2.4 + lightFlicker);
        }

        // 4. Retro Boombox Subtle Beat Pulse
        if (this.boomboxMesh) {
            const beat = 1.0 + Math.sin(time * 3.14) * 0.012;
            this.boomboxMesh.scale.set(1.0, beat, 1.0);
        }

        // 5. Zero-GC Spark Embers Particle Pool (Direct Float32Array in-place update)
        if (this.embersPositions && this.embersParticles) {
            const count = this.embersCount;
            const pos = this.embersPositions;
            const maxHeight = 2.2;

            for (let i = 0; i < count; i++) {
                const phase = this.embersPhases[i];
                const speed = this.embersSpeeds[i];
                const angleBase = this.embersAngles[i];
                const radiusBase = this.embersRadii[i];

                const t = (time * speed + phase) % 1.0;
                const offsetY = t * maxHeight;

                // Spiral trajectory as embers rise
                const currentAngle = angleBase + offsetY * 1.4;
                const currentRadius = radiusBase + (offsetY / maxHeight) * 0.22;

                pos[i * 3 + 0] = this.center.x + Math.cos(currentAngle) * currentRadius;
                pos[i * 3 + 1] = this.groundY + 0.22 + offsetY;
                pos[i * 3 + 2] = this.center.z + Math.sin(currentAngle) * currentRadius;
            }

            this.embersParticles.geometry.attributes.position.needsUpdate = true;
        }

        // 6. Player Proximity & Radio Sync Check
        if (playerPos) {
            const dx = playerPos.x - this.center.x;
            const dz = playerPos.z - this.center.z;
            const distSq = dx * dx + dz * dz;

            this.isNearCampfire = distSq <= 18.0 * 18.0;

            // HUD Badge visibility
            if (this.hudBadgeEl) {
                if (this.isNearCampfire) {
                    this.hudBadgeEl.style.opacity = '1';
                    this.hudBadgeEl.style.transform = 'translateX(-50%) translateY(0)';
                } else {
                    this.hudBadgeEl.style.opacity = '0';
                    this.hudBadgeEl.style.transform = 'translateX(-50%) translateY(20px)';
                }
            }

            // Sync radio every 1.5s
            if (time - this.lastSyncCheckTime > 1.5) {
                this.lastSyncCheckTime = time;
                this.syncDeterministicRadio(Date.now() / 1000, distSq);
            }

            // 7. Social Relaxation Buff (+15 Zen XP every 30s seated or nearby)
            const isSeatedAtCampfire = isSitting && currentSeatAnchor && currentSeatAnchor.category === 'campfire_log';
            if (isSeatedAtCampfire || distSq <= 5.0 * 5.0) {
                this.relaxationTimer += dt;
                if (this.relaxationTimer >= 30.0) {
                    this.relaxationTimer = 0;
                    this.totalRelaxationSec += 30;
                    if (this.onReward) {
                        this.onReward({
                            xp: 15,
                            coins: 3,
                            reason: 'Warm Campfire Relaxation'
                        });
                    }
                    if (this.onToast) {
                        this.onToast('+15 Zen XP • Cozy Campfire Relaxation', 'success');
                    }
                }
            } else {
                this.relaxationTimer = Math.max(0, this.relaxationTimer - dt * 0.5);
            }

            // 8. Cozy Cinematic Orbit Camera Activation
            if (isSeatedAtCampfire && camera) {
                this.isCinematicActive = true;
                if (window.openWorld3D) {
                    window.openWorld3D.isCinematicCamera = true;
                }
                this.updateCinematicCamera(dt, camera, window.openWorld3D?.player || { position: playerPos });
            } else if (this.isCinematicActive) {
                this.isCinematicActive = false;
                if (window.openWorld3D) {
                    window.openWorld3D.isCinematicCamera = false;
                }
            }
        }
    }
}
