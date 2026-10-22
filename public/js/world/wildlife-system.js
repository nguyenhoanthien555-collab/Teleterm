import * as THREE from 'three';

/**
 * WILDLIFE & LIVING ECOSYSTEM (CHIM MUÔNG, CÔN TRÙNG & ÂM THANH KHÔNG GIAN)
 * Part of TeleTerm Living World & In-World 3D Hologram Ecosystem.
 * 
 * Features:
 * - 48 Soaring Flocking Birds with Boids algorithm & GPU Vertex Shader wing flapping
 * - 12 Perching Birds on branches and roofs with proximity takeoff FSM
 * - Diurnal Insects: Daytime Fluttering Butterflies & Nighttime Bioluminescent Fireflies
 * - 3D Positional Spatial Audio for waterfalls, flapping wings, and birdsong
 */
export class WildlifeSystem {
    constructor(scene, terrainSystem, ambientAudio = null) {
        this.scene = scene;
        this.terrain = terrainSystem;
        this.ambientAudio = ambientAudio;

        this.group = new THREE.Group();
        this.group.name = 'WildlifeSystem';

        // Flocking Birds
        this.flockCount = 48;
        this.boids = [];
        this.birdInstancedMesh = null;
        this.birdUniforms = null;
        this.boidsBounds = { minX: -55, maxX: 55, minY: 14, maxY: 38, minZ: -75, maxZ: 75 };
        this.flockWaypoints = [
            new THREE.Vector3(15, 24, -55),  // Alpine foothills
            new THREE.Vector3(28, 20, -18),  // Zen Pond & Maple Forest
            new THREE.Vector3(8, 16, 28),    // Arched Bridge & River
            new THREE.Vector3(12, 18, 65),   // South Beach & Pier
            new THREE.Vector3(-22, 19, 5)    // Rice Terraces
        ];
        this.currentWaypointIdx = 0;

        // Perching Birds
        this.perchCount = 12;
        this.perchedBirds = [];
        this.perchMesh = null;
        this.perchUniforms = null;

        // Butterflies & Fireflies
        this.insectMesh = null;
        this.insectCount = 36;
        this.insectData = [];
        this.insectUniforms = null;

        // 3D Spatial Audio Nodes
        this.audioCtx = null;
        this.waterfallPanner = null;
        this.waterfallGain = null;
        this.wingSoundCooldown = 0;

        // Zero-allocation reusable scratch objects for high-performance 60FPS physics
        this._scratchDiff = new THREE.Vector3();
        this._scratchSep = new THREE.Vector3();
        this._scratchAli = new THREE.Vector3();
        this._scratchCoh = new THREE.Vector3();
        this._scratchTargetForce = new THREE.Vector3();
        this._scratchBoundForce = new THREE.Vector3();
        this._dummy = new THREE.Object3D();
    }

    build() {
        // 1. Build Flocking Birds (Boids + GPU Vertex Wing Flapping)
        this.buildFlockingBirds();

        // 2. Build Perching Birds with Proximity FSM
        this.buildPerchingBirds();

        // 3. Build Butterflies & Fireflies
        this.buildInsects();

        // 4. Initialize Spatial Nature Audio
        this.initSpatialAudio();

        this.scene.add(this.group);
    }

    buildFlockingBirds() {
        // True Anatomical Stylized Anime Bird (Swift / Dove):
        // Sculpted body, head crown, sharp golden beak, articulated swept wings, and fan tail
        const birdGeo = new THREE.BufferGeometry();
        
        // 34 sculpted vertices
        const vertices = new Float32Array([
            // 0: Beak tip
            0.0, 0.05, -0.48,
            // 1: Beak top root
            0.0, 0.08, -0.32,
            // 2: Beak bottom root
            0.0, 0.02, -0.32,
            // 3: Beak left root
            -0.035, 0.05, -0.32,
            // 4: Beak right root
            0.035, 0.05, -0.32,
            // 5: Head crown
            0.0, 0.12, -0.22,
            // 6: Left Eye
            -0.055, 0.09, -0.22,
            // 7: Right Eye
            0.055, 0.09, -0.22,
            // 8: Nape (neck back)
            0.0, 0.10, -0.12,
            // 9: Throat
            0.0, -0.01, -0.20,
            // 10: Breast (chest front)
            0.0, -0.08, -0.08,
            // 11: Belly center
            0.0, -0.08, 0.08,
            // 12: Vent / under tail
            0.0, -0.02, 0.24,
            // 13: Spine / back center
            0.0, 0.08, 0.04,
            // 14: Rump (upper tail root)
            0.0, 0.05, 0.24,
            // 15: Left shoulder flank
            -0.08, 0.02, -0.06,
            // 16: Right shoulder flank
            0.08, 0.02, -0.06,
            // 17: Left hip flank
            -0.06, 0.01, 0.16,
            // 18: Right hip flank
            0.06, 0.01, 0.16,
            // Tail Fan:
            // 19: Tail tip center
            0.0, 0.06, 0.52,
            // 20: Tail tip left
            -0.14, 0.07, 0.46,
            // 21: Tail tip right
            0.14, 0.07, 0.46,
            // Left Swept Articulated Wing:
            // 22: Left inner wing front
            -0.32, 0.05, -0.04,
            // 23: Left outer mid-joint
            -0.58, 0.06, 0.02,
            // 24: Left wingtip primary
            -0.92, 0.07, 0.08,
            // 25: Left wingtip secondary
            -0.72, 0.04, 0.18,
            // 26: Left wing trailing mid
            -0.42, 0.03, 0.16,
            // 27: Left wing trailing root
            -0.10, 0.02, 0.10,
            // Right Swept Articulated Wing:
            // 28: Right inner wing front
            0.32, 0.05, -0.04,
            // 29: Right outer mid-joint
            0.58, 0.06, 0.02,
            // 30: Right wingtip primary
            0.92, 0.07, 0.08,
            // 31: Right wingtip secondary
            0.72, 0.04, 0.18,
            // 32: Right wing trailing mid
            0.42, 0.03, 0.16,
            // 33: Right wing trailing root
            0.10, 0.02, 0.10
        ]);

        const indices = [
            // Beak 4-sided pyramid
            0, 1, 3,
            0, 4, 1,
            0, 3, 2,
            0, 2, 4,
            // Head & Neck
            1, 5, 6,
            1, 7, 5,
            1, 6, 9,
            1, 9, 7,
            5, 8, 6,
            5, 7, 8,
            // Neck to Body
            8, 13, 15,
            8, 16, 13,
            8, 15, 6,
            8, 7, 16,
            9, 15, 10,
            9, 10, 16,
            6, 15, 9,
            7, 9, 16,
            // Torso / Body Fuselage
            10, 11, 15,
            10, 16, 11,
            15, 11, 17,
            16, 18, 11,
            13, 17, 14,
            13, 14, 18,
            13, 15, 17,
            13, 18, 16,
            11, 12, 17,
            11, 18, 12,
            // Tail Fan
            14, 17, 20,
            14, 20, 19,
            14, 19, 21,
            14, 21, 18,
            12, 19, 20,
            12, 21, 19,
            // Left Articulated Swept Wing (Double-sided)
            15, 22, 27,
            22, 26, 27,
            22, 23, 26,
            23, 25, 26,
            23, 24, 25,
            15, 27, 22,
            22, 27, 26,
            22, 26, 23,
            23, 26, 25,
            23, 25, 24,
            // Right Articulated Swept Wing (Double-sided)
            16, 33, 28,
            28, 33, 32,
            28, 32, 29,
            29, 32, 31,
            29, 31, 30,
            16, 28, 33,
            28, 32, 33,
            28, 29, 32,
            29, 31, 32,
            29, 30, 31
        ];

        // Semantic Vertex Colors: Golden Beak, Obsidian Eyes, Pearl Body, Slate Wingtips
        const colors = new Float32Array(34 * 3);
        const colBeak = [0.98, 0.65, 0.14];
        const colEye = [0.12, 0.12, 0.15];
        const colBody = [0.96, 0.97, 0.99];
        const colSlate = [0.35, 0.38, 0.46];

        for (let i = 0; i < 34; i++) {
            let c = colBody;
            if (i <= 4) c = colBeak;
            else if (i === 6 || i === 7) c = colEye;
            else if (i === 23 || i === 24 || i === 25 || i === 29 || i === 30 || i === 31) c = colSlate;
            else if (i >= 19 && i <= 21) c = colSlate;
            colors[i * 3] = c[0];
            colors[i * 3 + 1] = c[1];
            colors[i * 3 + 2] = c[2];
        }

        birdGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        birdGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        birdGeo.setIndex(indices);
        birdGeo.computeVertexNormals();

        this.birdUniforms = {
            uTime: { value: 0 }
        };

        const birdMat = new THREE.ShaderMaterial({
            uniforms: this.birdUniforms,
            vertexShader: `
                uniform float uTime;
                attribute vec3 color;
                varying vec3 vNormal;
                varying vec3 vColor;

                void main() {
                    vec3 pos = position;
                    // Realistic GPU Wing Flapping with dynamic twist
                    if (abs(pos.x) > 0.08) {
                        float span = abs(pos.x);
                        float flapPhase = uTime * 14.0 + float(gl_InstanceID) * 0.85;
                        float flap = sin(flapPhase);
                        float twist = cos(flapPhase) * 0.15;
                        
                        pos.y += flap * pow(span, 1.25) * 0.44;
                        pos.z += twist * span * 0.18;
                    }

                    // Tail subtle pitch counter-motion
                    if (pos.z > 0.25) {
                        float tailWobble = sin(uTime * 14.0 + float(gl_InstanceID) * 0.85 + 1.2);
                        pos.y += tailWobble * 0.03;
                    }

                    vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
                    vNormal = normalize((instanceMatrix * vec4(normal, 0.0)).xyz);
                    vColor = color;
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vColor;

                void main() {
                    vec3 lightDir = normalize(vec3(0.4, 0.9, 0.2));
                    float diff = max(dot(vNormal, lightDir), 0.25);
                    float cel = smoothstep(0.28, 0.35, diff) * 0.35 + diff * 0.65;
                    vec3 shadowTint = vec3(0.72, 0.76, 0.84);
                    vec3 col = vColor * mix(shadowTint, vec3(1.0), cel);
                    gl_FragColor = vec4(col, 1.0);
                }
            `,
            side: THREE.DoubleSide
        });

        this.birdInstancedMesh = new THREE.InstancedMesh(birdGeo, birdMat, this.flockCount);
        this.birdInstancedMesh.castShadow = true;
        this.birdInstancedMesh.frustumCulled = false;

        // Initialize Boids Agents
        for (let i = 0; i < this.flockCount; i++) {
            this.boids.push({
                position: new THREE.Vector3(
                    (Math.random() - 0.5) * 60,
                    20 + Math.random() * 12,
                    (Math.random() - 0.5) * 60
                ),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 6
                ).normalize().multiplyScalar(4.5 + Math.random() * 2.0),
                acceleration: new THREE.Vector3(),
                maxSpeed: 6.8,
                maxForce: 0.18
            });
        }

        this.group.add(this.birdInstancedMesh);
    }

    buildPerchingBirds() {
        // 12 Perching spots across the world
        const perchSpots = [
            // Sakura Branches near Hub
            { x: 5.5, y: 3.4, z: -8.5, rotY: 0.6 },
            { x: -4.2, y: 3.8, z: -10.2, rotY: 2.1 },
            { x: 9.8, y: 3.6, z: -14.5, rotY: -1.2 },
            // Village Notice Board & Fence
            { x: 1.8, y: 2.65, z: -23.8, rotY: 0.2 },
            { x: 3.6, y: 2.45, z: -21.4, rotY: -1.5 },
            // Arched Bridge Railing
            { x: 3.2, y: 1.6, z: 23.5, rotY: 1.57 },
            { x: 4.8, y: 1.7, z: 28.5, rotY: -1.57 },
            // Zen Pond Rock & Stone Lantern (Autumn Maple Valley)
            { x: 36.5, y: 1.8, z: -24.2, rotY: 0.8 },
            { x: 39.2, y: 2.2, z: -28.0, rotY: -2.3 },
            // Coastal Pier Post
            { x: 10.2, y: 1.4, z: 74.5, rotY: 0.0 },
            { x: 11.5, y: 1.4, z: 78.2, rotY: 3.14 },
            { x: 8.8, y: 1.4, z: 76.0, rotY: 1.2 }
        ];

        // Sculpted Low-Poly Anime Songbird (Turquoise Bluebird / Finch)
        const pGeo = new THREE.BufferGeometry();
        const pVerts = new Float32Array([
            // 0: Beak tip
            0.0, 0.12, -0.22,
            // 1: Beak top
            0.0, 0.14, -0.14,
            // 2: Beak bottom
            0.0, 0.10, -0.14,
            // 3: Beak left
            -0.025, 0.12, -0.14,
            // 4: Beak right
            0.025, 0.12, -0.14,
            // 5: Head crown
            0.0, 0.20, -0.06,
            // 6: Left Eye
            -0.05, 0.16, -0.08,
            // 7: Right Eye
            0.05, 0.16, -0.08,
            // 8: Nape back
            0.0, 0.18, 0.02,
            // 9: Throat
            0.0, 0.08, -0.08,
            // 10: Breast front
            0.0, 0.04, -0.04,
            // 11: Belly
            0.0, 0.01, 0.06,
            // 12: Back spine
            0.0, 0.14, 0.08,
            // 13: Rump
            0.0, 0.10, 0.18,
            // 14: Left Folded Wing
            -0.085, 0.08, 0.06,
            // 15: Right Folded Wing
            0.085, 0.08, 0.06,
            // 16: Left Wingtip
            -0.05, 0.09, 0.22,
            // 17: Right Wingtip
            0.05, 0.09, 0.22,
            // 18: Tail center
            0.0, 0.12, 0.32,
            // 19: Tail left
            -0.06, 0.13, 0.29,
            // 20: Tail right
            0.06, 0.13, 0.29
        ]);

        const pIndices = [
            // Beak pyramid
            0, 1, 3,
            0, 4, 1,
            0, 3, 2,
            0, 2, 4,
            // Head
            1, 5, 6,
            1, 7, 5,
            1, 6, 9,
            1, 9, 7,
            5, 8, 6,
            5, 7, 8,
            // Throat to Breast
            9, 10, 6,
            9, 7, 10,
            6, 10, 14,
            7, 15, 10,
            8, 6, 14,
            8, 15, 7,
            8, 14, 12,
            8, 12, 15,
            // Belly & Back
            10, 11, 14,
            10, 15, 11,
            14, 11, 16,
            15, 17, 11,
            12, 14, 13,
            12, 13, 15,
            14, 16, 13,
            15, 13, 17,
            // Tail Fan
            13, 19, 18,
            13, 18, 20,
            11, 18, 19,
            11, 20, 18
        ];

        // Vertex Colors: Golden Beak, Obsidian Eyes, Turquoise Body & Azure Wings
        const pColors = new Float32Array(21 * 3);
        const pColBeak = [0.98, 0.68, 0.14];
        const pColEye = [0.12, 0.12, 0.15];
        const pColBody = [0.18, 0.72, 0.94]; // Kingfisher turquoise
        const pColWing = [0.12, 0.52, 0.82]; // Deep azure blue
        for (let i = 0; i < 21; i++) {
            let c = pColBody;
            if (i <= 4) c = pColBeak;
            else if (i === 6 || i === 7) c = pColEye;
            else if (i === 14 || i === 15 || i === 16 || i === 17) c = pColWing;
            else if (i >= 18) c = pColWing;
            pColors[i * 3] = c[0];
            pColors[i * 3 + 1] = c[1];
            pColors[i * 3 + 2] = c[2];
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(pVerts, 3));
        pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
        pGeo.setIndex(pIndices);
        pGeo.computeVertexNormals();

        const pMat = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.55,
            metalness: 0.1
        });

        this.perchMesh = new THREE.InstancedMesh(pGeo, pMat, this.perchCount);
        this.perchMesh.castShadow = true;
        this.perchMesh.frustumCulled = false;

        for (let i = 0; i < this.perchCount; i++) {
            const spot = perchSpots[i];
            this.perchedBirds.push({
                origin: new THREE.Vector3(spot.x, spot.y, spot.z),
                current: new THREE.Vector3(spot.x, spot.y, spot.z),
                velocity: new THREE.Vector3(),
                rotY: spot.rotY,
                state: 'PERCHED', // PERCHED, STARTLED, CIRCLING, RETURNING
                stateTimer: 0
            });

            this._dummy.position.set(spot.x, spot.y, spot.z);
            this._dummy.rotation.set(0, spot.rotY, 0);
            this._dummy.updateMatrix();
            this.perchMesh.setMatrixAt(i, this._dummy.matrix);
        }
        this.perchMesh.instanceMatrix.needsUpdate = true;
        this.group.add(this.perchMesh);
    }

    buildInsects() {
        // Butterflies & Fireflies: Instanced tiny quads
        const insectGeo = new THREE.PlaneGeometry(0.18, 0.18);
        
        this.insectUniforms = {
            uTime: { value: 0 },
            uIsNight: { value: 0.0 }
        };

        const insectMat = new THREE.ShaderMaterial({
            uniforms: this.insectUniforms,
            vertexShader: `
                uniform float uTime;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec4 worldPos = instanceMatrix * vec4(position, 1.0);
                    // Billboard facing camera
                    vec4 mvPos = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPos;
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform float uIsNight;
                varying vec2 vUv;
                void main() {
                    float dist = length(vUv - vec2(0.5));
                    if (dist > 0.48) discard;

                    // Daytime: Colorful fluttering butterfly wing
                    vec3 butterflyColor = vec3(0.98, 0.72, 0.25);
                    // Nighttime: Pulsating bioluminescent firefly glow (emerald-amber)
                    float pulse = 0.6 + 0.4 * sin(uTime * 3.5);
                    vec3 fireflyColor = vec3(0.4, 0.95, 0.35) * pulse * 1.5;

                    vec3 finalCol = mix(butterflyColor, fireflyColor, uIsNight);
                    float alpha = smoothstep(0.48, 0.15, dist);
                    gl_FragColor = vec4(finalCol, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        this.insectMesh = new THREE.InstancedMesh(insectGeo, insectMat, this.insectCount);
        this.insectMesh.frustumCulled = false;

        for (let i = 0; i < this.insectCount; i++) {
            this.insectData.push({
                center: new THREE.Vector3(
                    15 + (Math.random() - 0.5) * 35,
                    1.2 + Math.random() * 2.2,
                    -15 + (Math.random() - 0.5) * 30
                ),
                speed: 0.8 + Math.random() * 0.8,
                phase: Math.random() * Math.PI * 2,
                radius: 1.2 + Math.random() * 2.0
            });
        }

        this.group.add(this.insectMesh);
    }

    initSpatialAudio() {
        // Continuous lowpass noise (waterfall pink noise) and droning oscillators eliminated
        // per user directive to eliminate the annoying 'ù ù ù' humming sound.
        this.audioCtx = null;
    }

    playFlapSound(position) {
        // Silenced to prevent low-frequency flutter noise
    }

    updateBoids(delta) {
        if (!this.birdInstancedMesh) return;

        const target = this.flockWaypoints[this.currentWaypointIdx];

        // Check if flock leader arrived at current waypoint
        const leadBoid = this.boids[0];
        if (leadBoid.position.distanceTo(target) < 12.0) {
            this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.flockWaypoints.length;
        }

        const neighborDist = 6.0;
        const desiredSeparation = 2.4;
        const desiredSepSq = desiredSeparation * desiredSeparation;
        const neighborDistSq = neighborDist * neighborDist;

        // Reusable scratch vectors — ZERO per-frame heap allocations!
        const sep = this._scratchSep;
        const ali = this._scratchAli;
        const coh = this._scratchCoh;
        const diff = this._scratchDiff;
        const targetForce = this._scratchTargetForce;
        const boundForce = this._scratchBoundForce;
        const dummy = this._dummy;

        for (let i = 0; i < this.flockCount; i++) {
            const boid = this.boids[i];
            
            sep.set(0, 0, 0);
            ali.set(0, 0, 0);
            coh.set(0, 0, 0);
            let neighborCount = 0;
            let sepCount = 0;

            for (let j = 0; j < this.flockCount; j++) {
                if (i === j) continue;
                const other = this.boids[j];
                const dx = boid.position.x - other.position.x;
                const dy = boid.position.y - other.position.y;
                const dz = boid.position.z - other.position.z;
                const dSq = dx * dx + dy * dy + dz * dz;

                if (dSq > 0.0001 && dSq < desiredSepSq) {
                    const d = Math.sqrt(dSq);
                    diff.set(dx / d, dy / d, dz / d).divideScalar(d);
                    sep.add(diff);
                    sepCount++;
                }

                if (dSq > 0.0001 && dSq < neighborDistSq) {
                    ali.add(other.velocity);
                    coh.add(other.position);
                    neighborCount++;
                }
            }

            if (sepCount > 0) {
                sep.divideScalar(sepCount).normalize().multiplyScalar(boid.maxSpeed).sub(boid.velocity).clampLength(0, boid.maxForce * 1.5);
                boid.acceleration.addScaledVector(sep, 1.5);
            }
            if (neighborCount > 0) {
                ali.divideScalar(neighborCount).normalize().multiplyScalar(boid.maxSpeed).sub(boid.velocity).clampLength(0, boid.maxForce);
                coh.divideScalar(neighborCount).sub(boid.position).normalize().multiplyScalar(boid.maxSpeed).sub(boid.velocity).clampLength(0, boid.maxForce * 0.8);
                boid.acceleration.add(ali);
                boid.acceleration.addScaledVector(coh, 0.9);
            }

            // 2. Waypoint Attraction
            targetForce.subVectors(target, boid.position).normalize().multiplyScalar(boid.maxSpeed).sub(boid.velocity).clampLength(0, boid.maxForce * 0.6);
            boid.acceleration.addScaledVector(targetForce, 1.2);

            // 3. Boundaries Soft-Repulsion
            boundForce.set(0, 0, 0);
            if (boid.position.x < this.boidsBounds.minX) boundForce.x = boid.maxSpeed;
            else if (boid.position.x > this.boidsBounds.maxX) boundForce.x = -boid.maxSpeed;
            if (boid.position.y < this.boidsBounds.minY) boundForce.y = boid.maxSpeed;
            else if (boid.position.y > this.boidsBounds.maxY) boundForce.y = -boid.maxSpeed;
            if (boid.position.z < this.boidsBounds.minZ) boundForce.z = boid.maxSpeed;
            else if (boid.position.z > this.boidsBounds.maxZ) boundForce.z = -boid.maxSpeed;
            boid.acceleration.addScaledVector(boundForce, 0.8);

            // Integrate Euler Physics
            boid.velocity.addScaledVector(boid.acceleration, delta);
            boid.velocity.clampLength(2.5, boid.maxSpeed);
            boid.position.addScaledVector(boid.velocity, delta);
            boid.acceleration.set(0, 0, 0);

            // Derive 3D heading and bank angle
            const heading = Math.atan2(boid.velocity.x, boid.velocity.z);
            const pitch = -Math.asin(Math.max(-1, Math.min(1, boid.velocity.y / boid.velocity.length())));
            const roll = Math.sin(heading) * 0.25;

            dummy.position.copy(boid.position);
            dummy.rotation.set(pitch, heading, roll);
            dummy.updateMatrix();

            this.birdInstancedMesh.setMatrixAt(i, dummy.matrix);
        }
        this.birdInstancedMesh.instanceMatrix.needsUpdate = true;
    }

    updatePerchedBirds(delta, playerPos) {
        if (!this.perchMesh) return;
        const dummy = this._dummy;

        for (let i = 0; i < this.perchCount; i++) {
            const bird = this.perchedBirds[i];

            if (bird.state === 'PERCHED') {
                // If player is close (< 4.5m), startle and take off!
                if (playerPos) {
                    const dist = Math.hypot(playerPos.x - bird.current.x, playerPos.z - bird.current.z);
                    if (dist < 4.5) {
                        bird.state = 'STARTLED';
                        bird.stateTimer = 0;
                        bird.velocity.set(
                            (Math.random() - 0.5) * 3,
                            5.5 + Math.random() * 2.0,
                            (Math.random() - 0.5) * 3
                        );
                        this.playFlapSound(bird.current);
                    }
                }
            } else if (bird.state === 'STARTLED') {
                bird.stateTimer += delta;
                bird.current.addScaledVector(bird.velocity, delta);
                if (bird.stateTimer > 2.5) {
                    bird.state = 'CIRCLING';
                    bird.stateTimer = 0;
                }
            } else if (bird.state === 'CIRCLING') {
                bird.stateTimer += delta;
                const circleAngle = bird.stateTimer * 1.5;
                bird.current.x = bird.origin.x + Math.cos(circleAngle) * 8.0;
                bird.current.z = bird.origin.z + Math.sin(circleAngle) * 8.0;
                bird.current.y = bird.origin.y + 6.0 + Math.sin(circleAngle * 2) * 1.0;

                // After 18s, glide back to perch
                if (bird.stateTimer > 18.0) {
                    bird.state = 'RETURNING';
                }
            } else if (bird.state === 'RETURNING') {
                // Smooth glide descent back to perch origin
                bird.current.lerp(bird.origin, delta * 1.5);
                if (bird.current.distanceTo(bird.origin) < 0.15) {
                    bird.current.copy(bird.origin);
                    bird.state = 'PERCHED';
                }
            }

            dummy.position.copy(bird.current);
            dummy.rotation.set(0, bird.rotY, 0);
            dummy.updateMatrix();
            this.perchMesh.setMatrixAt(i, dummy.matrix);
        }
        this.perchMesh.instanceMatrix.needsUpdate = true;
    }

    updateInsects(delta, time, isNight) {
        if (!this.insectMesh) return;
        const dummy = this._dummy;

        for (let i = 0; i < this.insectCount; i++) {
            const ins = this.insectData[i];
            const theta = time * ins.speed + ins.phase;
            
            // Lissajous 3D flight trajectory
            const x = ins.center.x + Math.sin(theta) * ins.radius;
            const z = ins.center.z + Math.sin(theta * 2.0) * (ins.radius * 0.7);
            const y = ins.center.y + Math.cos(theta * 3.0) * 0.45;

            dummy.position.set(x, y, z);
            dummy.scale.setScalar(0.8 + Math.sin(theta * 10.0) * 0.2); // Wing flutter scale
            dummy.updateMatrix();

            this.insectMesh.setMatrixAt(i, dummy.matrix);
        }
        this.insectMesh.instanceMatrix.needsUpdate = true;

        if (this.insectUniforms) {
            this.insectUniforms.uTime.value = time;
            this.insectUniforms.uIsNight.value = isNight ? 1.0 : 0.0;
        }
    }

    update(delta, timeOfDay = null, playerPos = null) {
        const time = performance.now() * 0.001;
        const isNight = timeOfDay ? (timeOfDay < 0.25 || timeOfDay > 0.75) : false;

        // 1. Update Flocking Boids
        if (this.birdUniforms) {
            this.birdUniforms.uTime.value = time;
        }
        this.updateBoids(delta);

        // 2. Update Perched Birds FSM
        this.updatePerchedBirds(delta, playerPos);

        // 3. Update Butterflies & Fireflies
        this.updateInsects(delta, time, isNight);

        // 4. Update Audio Listener Position in 3D Space
        if (this.audioCtx && playerPos && this.audioCtx.listener) {
            if (this.audioCtx.listener.positionX) {
                this.audioCtx.listener.positionX.value = playerPos.x;
                this.audioCtx.listener.positionY.value = playerPos.y || 1.6;
                this.audioCtx.listener.positionZ.value = playerPos.z;
            } else if (this.audioCtx.listener.setPosition) {
                this.audioCtx.listener.setPosition(playerPos.x, playerPos.y || 1.6, playerPos.z);
            }
        }
    }
}
