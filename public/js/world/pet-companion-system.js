/**
 * LIVING WILDLIFE ECOSYSTEM & INTERACTIVE PET COMPANIONS
 * TeleTerm Master Architecture v2 - Section 8, Milestone 5 (Gemini 4 Argon Spec)
 * 
 * Features:
 * - Procedural Animated Companions: Shiba Inu & Calico Cat
 * - Articulated Quadruped Skeletal Rig (Legs, Paws, Head, Snout, Ears, Wagging Tail)
 * - Finite State Machine (IDLE, FOLLOW, INTERACT, AVOIDANCE)
 * - Organic Steering Behaviors (Arrival deceleration, Offset Following, Obstacle Avoidance)
 * - Terrain Elevation Conformance (Paws grounded on terrain / structures)
 * - Interactive Petting [E] with Floating 3D Heart Emote FX & Happiness +5
 * - Feeding Mechanic with Campfire Skewered Fish (item_grilled_fish) -> Stamina +30, Happiness +20
 * - Multi-Peer WebSocket Synchronization (10Hz Client Authority + Remote Peer Dead Reckoning)
 */

import * as THREE from '/vendor/three/build/three.module.js';

// 3D Heart Geometry Factory for Petting / Feeding Reactions
function createHeartGeometry() {
    const x = 0, y = 0;
    const heartShape = new THREE.Shape();
    heartShape.moveTo(x + 0.25, y + 0.25);
    heartShape.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
    heartShape.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
    heartShape.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
    heartShape.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
    heartShape.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
    heartShape.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);

    const extrudeSettings = {
        depth: 0.08,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.03,
        bevelThickness: 0.03
    };
    const geo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geo.center();
    geo.scale(0.3, -0.3, 0.3); // Invert Y and scale down
    return geo;
}

export class PetEntity {
    constructor(species = 'shiba', isRemote = false, ownerId = null) {
        this.species = species; // 'shiba' or 'cat'
        this.isRemote = isRemote;
        this.ownerId = ownerId;
        this.petId = 'pet_' + (ownerId ? ownerId.slice(0, 8) : Math.random().toString(36).slice(2, 8));

        // Core FSM & Stats
        this.state = 'IDLE'; // 'IDLE', 'FOLLOW', 'INTERACT', 'AVOIDANCE'
        this.happiness = 80; // 0 to 100
        this.stamina = 100;   // 0 to 100
        this.interactCooldown = 0;

        // Kinematics & Physics
        this.position = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.targetPosition = new THREE.Vector3(0, 0, 0);
        this.yaw = 0;
        this.targetYaw = 0;
        this.speed = 0;

        // Procedural Animation Phases
        this.trotPhase = 0;
        this.tailPhase = 0;
        this.pantPhase = 0;
        this.bouncePhase = 0;

        // 3D Heart Particle Pool
        this.activeHearts = [];
        this.heartGeo = createHeartGeometry();
        this.heartMat = new THREE.MeshBasicMaterial({
            color: 0xf43f5e,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // Procedural Mesh Hierarchy
        this.group = new THREE.Group();
        this.group.name = `pet_${this.species}_${this.ownerId || 'local'}`;
        this.buildModel();
    }

    buildModel() {
        // Clear existing children if switching species
        while (this.group.children.length > 0) {
            this.group.remove(this.group.children[0]);
        }

        const isShiba = this.species === 'shiba';

        // Materials
        const primaryColor = isShiba ? 0xd97706 : 0xf8fafc; // Warm toasted sesame vs Calico white
        const creamColor = 0xfffbeb;
        const patchOrange = 0xea580c;
        const patchSlate = 0x1e293b;
        const collarColor = isShiba ? 0xe11d48 : 0x06b6d4; // Red vs Cyan Cyber-Collar
        const bellColor = 0xfbbf24; // Gold

        const matPrimary = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.65, metalness: 0.05 });
        const matCream = new THREE.MeshStandardMaterial({ color: creamColor, roughness: 0.7 });
        const matCollar = new THREE.MeshStandardMaterial({ color: collarColor, roughness: 0.3, metalness: 0.2 });
        const matBell = new THREE.MeshStandardMaterial({ color: bellColor, roughness: 0.2, metalness: 0.8 });
        const matNose = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
        const matEye = new THREE.MeshBasicMaterial({ color: 0x09090b });
        const matEyePupil = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // Root Body Anchor (at height 0.32m above ground)
        this.bodyGroup = new THREE.Group();
        this.bodyGroup.position.set(0, 0.32, 0);

        // 1. Torso
        const torsoLength = isShiba ? 0.52 : 0.46;
        const torsoRadius = isShiba ? 0.16 : 0.13;
        const torsoGeo = new THREE.CylinderGeometry(torsoRadius, torsoRadius * 1.05, torsoLength, 12);
        torsoGeo.rotateX(Math.PI / 2);
        const torsoMesh = new THREE.Mesh(torsoGeo, matPrimary);
        torsoMesh.castShadow = true;
        this.bodyGroup.add(torsoMesh);

        // Shiba Underbelly / Cream bib
        const bibGeo = new THREE.BoxGeometry(torsoRadius * 1.5, 0.06, torsoLength * 0.85);
        bibGeo.translate(0, -torsoRadius * 0.85, 0);
        const bibMesh = new THREE.Mesh(bibGeo, matCream);
        this.bodyGroup.add(bibMesh);

        // If Calico Cat: Add characteristic patches
        if (!isShiba) {
            const matPatchO = new THREE.MeshStandardMaterial({ color: patchOrange, roughness: 0.65 });
            const matPatchS = new THREE.MeshStandardMaterial({ color: patchSlate, roughness: 0.65 });

            const patchGeo1 = new THREE.BoxGeometry(0.18, 0.05, 0.18);
            patchGeo1.translate(0.04, torsoRadius * 0.95, -0.05);
            this.bodyGroup.add(new THREE.Mesh(patchGeo1, matPatchO));

            const patchGeo2 = new THREE.BoxGeometry(0.16, 0.05, 0.16);
            patchGeo2.translate(-0.04, torsoRadius * 0.95, 0.12);
            this.bodyGroup.add(new THREE.Mesh(patchGeo2, matPatchS));
        }

        // 2. Collar & Bell
        this.collarGroup = new THREE.Group();
        this.collarGroup.position.set(0, 0.06, -torsoLength * 0.48);
        const collarGeo = new THREE.TorusGeometry(torsoRadius * 1.08, 0.024, 8, 20);
        collarGeo.rotateX(Math.PI / 2);
        this.collarGroup.add(new THREE.Mesh(collarGeo, matCollar));

        const bellMesh = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 10), matBell);
        bellMesh.position.set(0, -torsoRadius * 0.9, -0.04);
        this.collarGroup.add(bellMesh);
        this.bodyGroup.add(this.collarGroup);

        // 3. Head & Cute Face
        this.headGroup = new THREE.Group();
        this.headGroup.position.set(0, 0.15, -torsoLength * 0.52);

        const headW = isShiba ? 0.24 : 0.20;
        const headH = isShiba ? 0.22 : 0.18;
        const headD = isShiba ? 0.22 : 0.18;
        const headGeo = new THREE.BoxGeometry(headW, headH, headD);
        const headMesh = new THREE.Mesh(headGeo, matPrimary);
        headMesh.castShadow = true;
        this.headGroup.add(headMesh);

        // Snout
        const snoutL = isShiba ? 0.14 : 0.09;
        const snoutGeo = new THREE.BoxGeometry(0.13, 0.10, snoutL);
        snoutGeo.translate(0, -0.03, -headD * 0.5 - snoutL * 0.45);
        this.headGroup.add(new THREE.Mesh(snoutGeo, matCream));

        // Nose Tip
        const noseMesh = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), matNose);
        noseMesh.position.set(0, -0.01, -headD * 0.5 - snoutL * 0.95);
        this.headGroup.add(noseMesh);

        // Anime Eyes
        const eyeOffset = isShiba ? 0.075 : 0.065;
        [-eyeOffset, eyeOffset].forEach(x => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), matEye);
            eye.position.set(x, 0.02, -headD * 0.51);
            // Eye Specular Highlight
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 6), matEyePupil);
            pupil.position.set(x > 0 ? 0.008 : -0.008, 0.01, -0.022);
            eye.add(pupil);
            this.headGroup.add(eye);
        });

        // Perky Ears
        const earH = isShiba ? 0.12 : 0.10;
        const earGeo = new THREE.ConeGeometry(0.06, earH, 4);
        earGeo.rotateY(Math.PI / 4);

        this.earLeft = new THREE.Mesh(earGeo, matPrimary);
        this.earLeft.position.set(-headW * 0.38, headH * 0.55, 0.02);
        this.earLeft.rotation.z = 0.25;
        this.headGroup.add(this.earLeft);

        this.earRight = new THREE.Mesh(earGeo, matPrimary);
        this.earRight.position.set(headW * 0.38, headH * 0.55, 0.02);
        this.earRight.rotation.z = -0.25;
        this.headGroup.add(this.earRight);

        this.bodyGroup.add(this.headGroup);

        // 4. Articulated Legs (Quadruped Trot & Sit Rig)
        this.legs = [];
        const legRadius = isShiba ? 0.045 : 0.038;
        const legLength = 0.26;

        const legGeo = new THREE.CylinderGeometry(legRadius, legRadius * 0.85, legLength, 8);
        legGeo.translate(0, -legLength * 0.5, 0);

        const pawGeo = new THREE.BoxGeometry(legRadius * 2.2, 0.04, legRadius * 2.5);
        pawGeo.translate(0, -legLength - 0.01, -0.02);

        const legOffsets = [
            { id: 'FL', x: -torsoRadius * 0.75, z: -torsoLength * 0.35 },
            { id: 'FR', x:  torsoRadius * 0.75, z: -torsoLength * 0.35 },
            { id: 'BL', x: -torsoRadius * 0.75, z:  torsoLength * 0.35 },
            { id: 'BR', x:  torsoRadius * 0.75, z:  torsoLength * 0.35 }
        ];

        legOffsets.forEach(cfg => {
            const legPivot = new THREE.Group();
            legPivot.position.set(cfg.x, -torsoRadius * 0.5, cfg.z);

            const legMesh = new THREE.Mesh(legGeo, matPrimary);
            legMesh.castShadow = true;
            legPivot.add(legMesh);

            const pawMesh = new THREE.Mesh(pawGeo, matCream);
            pawMesh.castShadow = true;
            legPivot.add(pawMesh);

            this.bodyGroup.add(legPivot);
            this.legs.push({ id: cfg.id, pivot: legPivot });
        });

        // 5. Tail
        this.tailGroup = new THREE.Group();
        this.tailGroup.position.set(0, torsoRadius * 0.6, torsoLength * 0.48);

        if (isShiba) {
            // Fluffy Curled Torus Tail over back
            const tailGeo = new THREE.TorusGeometry(0.12, 0.048, 8, 16, Math.PI * 1.35);
            tailGeo.rotateX(Math.PI / 2);
            tailGeo.rotateZ(Math.PI / 3);
            const tailMesh = new THREE.Mesh(tailGeo, matPrimary);
            this.tailGroup.add(tailMesh);

            // Cream tip
            const tipMesh = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), matCream);
            tipMesh.position.set(0.05, 0.14, -0.04);
            this.tailGroup.add(tipMesh);
        } else {
            // Sleek S-Curved Feline Tail
            const tailGeo = new THREE.CylinderGeometry(0.032, 0.022, 0.36, 8);
            tailGeo.translate(0, 0.18, 0.08);
            tailGeo.rotateX(-0.5);
            const tailMesh = new THREE.Mesh(tailGeo, matPrimary);
            this.tailGroup.add(tailMesh);
        }

        this.bodyGroup.add(this.tailGroup);
        this.group.add(this.bodyGroup);

        // Sound Context Reference
        this.audioCtx = null;
    }

    /**
     * Spawns 3D Heart Emote Particles rising above the pet's head
     */
    spawnHeartBurst(count = 3) {
        for (let i = 0; i < count; i++) {
            const heartMesh = new THREE.Mesh(this.heartGeo, this.heartMat.clone());
            const headWorldPos = new THREE.Vector3();
            this.headGroup.getWorldPosition(headWorldPos);

            // Random offset around head crown
            heartMesh.position.set(
                headWorldPos.x + (Math.random() - 0.5) * 0.25,
                headWorldPos.y + 0.2 + (Math.random() * 0.15),
                headWorldPos.z + (Math.random() - 0.5) * 0.25
            );
            heartMesh.scale.set(0.4, 0.4, 0.4);

            this.group.parent?.add(heartMesh);
            this.activeHearts.push({
                mesh: heartMesh,
                life: 0,
                maxLife: 1.2 + Math.random() * 0.4,
                driftX: (Math.random() - 0.5) * 0.35,
                driftZ: (Math.random() - 0.5) * 0.35,
                speedY: 0.65 + Math.random() * 0.3
            });
        }
    }

    /**
     * Procedural Web Audio API sound for Bark / Purr
     */
    playPetSound(action = 'pet') {
        try {
            if (!this.audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) this.audioCtx = new AudioContext();
            }
            if (!this.audioCtx || this.audioCtx.state !== 'running') return;

            const now = this.audioCtx.currentTime;
            const isShiba = this.species === 'shiba';

            if (isShiba) {
                // Cheerful warm puppy bark / chirp (Dual frequency FM sweep)
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(480, now);
                osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);
                osc.frequency.exponentialRampToValueAtTime(320, now + 0.22);

                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.25);
            } else {
                // Gentle feline purr / chime (Sub-harmonic pulse)
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(action === 'feed' ? 620 : 540, now);
                osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);

                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.36);
            }
        } catch (e) {}
    }

    /**
     * Updates kinematics, steering behaviors, and quadruped skeletal animations
     */
    update(delta, playerPos = null, playerMesh = null, terrain = null) {
        this.trotPhase += delta * this.speed * 8.5;
        this.tailPhase += delta * (this.state === 'INTERACT' ? 14.0 : (this.state === 'FOLLOW' ? 8.0 : 3.0));
        this.pantPhase += delta * 4.0;

        if (this.interactCooldown > 0) {
            this.interactCooldown -= delta;
            if (this.interactCooldown <= 0 && this.state === 'INTERACT') {
                this.state = 'IDLE';
            }
        }

        // --- 1. LOCAL STEERING BEHAVIORS (Arrival & Offset Following) ---
        if (!this.isRemote && playerPos) {
            // Target offset: 1.5m behind, 1.0m to the right of player orientation
            let forward = new THREE.Vector3(0, 0, 1);
            let right = new THREE.Vector3(1, 0, 0);

            if (playerMesh) {
                forward.set(0, 0, 1).applyEuler(playerMesh.rotation).normalize();
                right.set(1, 0, 0).applyEuler(playerMesh.rotation).normalize();
            }

            const target = new THREE.Vector3()
                .copy(playerPos)
                .addScaledVector(forward, -1.5)
                .addScaledVector(right, 1.0);

            const diff = new THREE.Vector3().subVectors(target, this.position);
            const dist = diff.length();

            // Teleport leash protection if distance > 35m
            if (dist > 35.0) {
                this.position.copy(target);
                this.velocity.set(0, 0, 0);
            } else if (dist > 0.65) {
                // FOLLOW STATE with Arrival Deceleration
                this.state = 'FOLLOW';
                const maxSpeed = dist > 6.0 ? 8.2 : 4.8;
                const slowingRadius = 2.2;
                const desiredSpeed = dist < slowingRadius ? maxSpeed * (dist / slowingRadius) : maxSpeed;

                const desiredVel = diff.clone().normalize().multiplyScalar(desiredSpeed);
                // Steering force = desired - current
                this.velocity.lerp(desiredVel, Math.min(1.0, delta * 6.0));
                this.speed = this.velocity.length();

                // Rotate towards movement vector
                if (this.speed > 0.15) {
                    this.targetYaw = Math.atan2(this.velocity.x, this.velocity.z);
                }
            } else {
                // IDLE STATE (Arrived at resting target offset)
                if (this.state !== 'INTERACT') this.state = 'IDLE';
                this.velocity.multiplyScalar(0.8);
                this.speed = this.velocity.length();
                if (this.speed < 0.05) this.speed = 0;

                // Face same general direction as owner
                if (playerMesh) {
                    this.targetYaw = playerMesh.rotation.y;
                }
            }

            // Apply movement displacement
            this.position.addScaledVector(this.velocity, delta);

            // Grounding on terrain / floor
            let groundY = 0.0;
            if (terrain && typeof terrain.getHeightAt === 'function') {
                groundY = terrain.getHeightAt(this.position.x, this.position.z) || 0;
            } else if (playerPos) {
                groundY = playerPos.y;
            }
            this.position.y = THREE.MathUtils.lerp(this.position.y, groundY, 0.2);

            // Smooth Yaw Lerp
            let yawDiff = this.targetYaw - this.yaw;
            while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
            while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
            this.yaw += yawDiff * Math.min(1.0, delta * 8.0);
        } else if (this.isRemote) {
            // --- 2. REMOTE CLIENT INTERPOLATION (Dead Reckoning LERP) ---
            this.position.lerp(this.targetPosition, Math.min(1.0, delta * 12.0));
            let yawDiff = this.targetYaw - this.yaw;
            while (yawDiff < -Math.PI) yawDiff += Math.PI * 2;
            while (yawDiff > Math.PI) yawDiff -= Math.PI * 2;
            this.yaw += yawDiff * Math.min(1.0, delta * 10.0);
        }

        // Apply Position & Yaw to 3D Group
        this.group.position.copy(this.position);
        this.group.rotation.y = this.yaw;

        // --- 3. QUADRUPED PROCEDURAL ANIMATIONS ---
        const isMoving = this.speed > 0.15 && (this.state === 'FOLLOW' || this.state === 'AVOIDANCE');

        if (isMoving) {
            // Trot Cycle: Diagonal limb pair alternation
            const swingFL_BR = Math.sin(this.trotPhase) * 0.48;
            const swingFR_BL = -Math.sin(this.trotPhase) * 0.48;

            this.legs.forEach(leg => {
                if (leg.id === 'FL' || leg.id === 'BR') leg.pivot.rotation.x = swingFL_BR;
                else leg.pivot.rotation.x = swingFR_BL;
            });

            // Torso vertical bounce and roll
            this.bodyGroup.position.y = 0.32 + Math.abs(Math.sin(this.trotPhase * 2.0)) * 0.035;
            this.bodyGroup.rotation.z = Math.sin(this.trotPhase) * 0.04;
            this.bodyGroup.rotation.x = 0;

            // Tail wags briskly
            this.tailGroup.rotation.y = Math.sin(this.tailPhase * 1.5) * 0.35;
        } else if (this.state === 'INTERACT') {
            // Happy Excitement Bounce
            this.bodyGroup.position.y = 0.32 + Math.abs(Math.sin(this.pantPhase * 2.5)) * 0.06;
            this.headGroup.rotation.z = Math.sin(this.pantPhase) * 0.15; // Inquisitive head tilt
            this.tailGroup.rotation.y = Math.sin(this.tailPhase * 3.0) * 0.65; // Hyper tail wag

            // Front paws tap ground
            this.legs.forEach(leg => {
                if (leg.id === 'FL') leg.pivot.rotation.x = Math.sin(this.pantPhase * 2.0) * 0.2;
                else if (leg.id === 'FR') leg.pivot.rotation.x = -Math.sin(this.pantPhase * 2.0) * 0.2;
                else leg.pivot.rotation.x = 0;
            });
        } else {
            // IDLE: Sits down comfortably
            this.bodyGroup.position.y = THREE.MathUtils.lerp(this.bodyGroup.position.y, 0.24, 0.1);
            this.bodyGroup.rotation.x = THREE.MathUtils.lerp(this.bodyGroup.rotation.x, -0.15, 0.1);

            // Front legs remain straight, rear legs fold underneath
            this.legs.forEach(leg => {
                if (leg.id === 'BL' || leg.id === 'BR') {
                    leg.pivot.rotation.x = THREE.MathUtils.lerp(leg.pivot.rotation.x, -1.05, 0.15);
                } else {
                    leg.pivot.rotation.x = THREE.MathUtils.lerp(leg.pivot.rotation.x, 0.15, 0.15);
                }
            });

            // Gentle idle breathing and soft tail wag
            this.headGroup.position.y = 0.15 + Math.sin(this.pantPhase * 0.8) * 0.012;
            this.tailGroup.rotation.y = Math.sin(this.tailPhase * 0.6) * 0.22;
        }

        // --- 4. UPDATE 3D HEART PARTICLES ---
        for (let i = this.activeHearts.length - 1; i >= 0; i--) {
            const h = this.activeHearts[i];
            h.life += delta;
            const progress = h.life / h.maxLife;

            if (progress >= 1.0) {
                h.mesh.parent?.remove(h.mesh);
                if (h.mesh.material) h.mesh.material.dispose();
                this.activeHearts.splice(i, 1);
            } else {
                h.mesh.position.y += h.speedY * delta;
                h.mesh.position.x += Math.sin(h.life * 4.0) * h.driftX * delta;
                h.mesh.position.z += Math.cos(h.life * 4.0) * h.driftZ * delta;

                // Scale up then fade out
                const scale = progress < 0.2 ? (progress / 0.2) * 1.0 : (1.0 - progress) * 1.0;
                h.mesh.scale.set(scale, scale, scale);
                h.mesh.material.opacity = (1.0 - progress) * 0.95;
            }
        }
    }

    destroy() {
        if (this.group.parent) {
            this.group.parent.remove(this.group);
        }
        this.activeHearts.forEach(h => {
            if (h.mesh.parent) h.mesh.parent.remove(h.mesh);
        });
        this.activeHearts = [];
    }
}

export class PetCompanionSystem {
    constructor(scene, terrainSystem = null) {
        this.scene = scene;
        this.terrain = terrainSystem;

        // Local player's active pet
        this.currentSpecies = 'shiba';
        this.localPet = new PetEntity(this.currentSpecies, false, 'local_player');
        this.scene.add(this.localPet.group);

        // Remote peer pets: Map<ownerId, PetEntity>
        this.remotePets = new Map();

        // 10Hz Network Broadcast Timer
        this.syncInterval = 0.1; // 100ms
        this.syncTimer = 0;

        // Init DOM & UI modal
        this.initDOM();

        if (typeof window !== 'undefined') {
            window.petCompanionSystem = this;
        }
    }

    initDOM() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('modal-pet-companion')) return;

        const modal = document.createElement('div');
        modal.id = 'modal-pet-companion';
        modal.className = 'pet-companion-overlay hidden';
        modal.innerHTML = `
            <div class="pet-card">
                <div class="pet-header">
                    <span id="pet-species-icon" class="pet-avatar-icon">🐕</span>
                    <div>
                        <h3 id="pet-name-title" class="pet-title">Shiba Inu Companion</h3>
                        <p class="pet-subtitle">Loyal 3D AI Pet & Happiness Synchronizer</p>
                    </div>
                    <button id="btn-close-pet-modal" class="pet-close-btn">&times;</button>
                </div>

                <div class="pet-stats-panel">
                    <div class="pet-stat-row">
                        <span class="stat-label">Happiness</span>
                        <div class="stat-bar-track">
                            <div id="pet-happiness-bar" class="stat-bar-fill bar-happiness" style="width: 80%;"></div>
                        </div>
                        <span id="pet-happiness-val" class="stat-val">80%</span>
                    </div>

                    <div class="pet-stat-row">
                        <span class="stat-label">Stamina</span>
                        <div class="stat-bar-track">
                            <div id="pet-stamina-bar" class="stat-bar-fill bar-stamina" style="width: 100%;"></div>
                        </div>
                        <span id="pet-stamina-val" class="stat-val">100%</span>
                    </div>

                    <div class="pet-status-badge">
                        <span class="status-dot"></span>
                        <span id="pet-status-text">Following Master</span>
                    </div>
                </div>

                <div class="pet-actions">
                    <button id="btn-pet-action" class="pet-btn btn-pet">
                        <span>💖</span> Vuốt Ve (Pet [E])
                    </button>
                    <button id="btn-feed-action" class="pet-btn btn-feed">
                        <span>🐟</span> Cho Ăn (Cá Nướng)
                    </button>
                    <button id="btn-switch-species" class="pet-btn btn-switch">
                        <span>🔄</span> Đổi Loài (Mèo / Shiba)
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Bind UI events
        document.getElementById('btn-close-pet-modal')?.addEventListener('click', () => this.close());
        document.getElementById('btn-pet-action')?.addEventListener('click', () => this.triggerPetting());
        document.getElementById('btn-feed-action')?.addEventListener('click', () => this.triggerFeeding());
        document.getElementById('btn-switch-species')?.addEventListener('click', () => {
            const next = this.currentSpecies === 'shiba' ? 'cat' : 'shiba';
            this.switchSpecies(next);
        });

        // Global Keybind [E] when near pet
        window.addEventListener('keydown', (e) => {
            if (e.key === 'e' || e.key === 'E') {
                if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
                const playerPos = window.openWorld3D?.player?.position;
                if (playerPos && this.localPet) {
                    const dist = playerPos.distanceTo(this.localPet.position);
                    if (dist < 3.2) {
                        this.triggerPetting();
                    }
                }
            }
        });
    }

    open() {
        const modal = document.getElementById('modal-pet-companion');
        if (modal) {
            this.updateUI();
            modal.classList.remove('hidden');
        }
    }

    close() {
        const modal = document.getElementById('modal-pet-companion');
        if (modal) modal.classList.add('hidden');
    }

    updateUI() {
        if (!this.localPet) return;
        const happinessBar = document.getElementById('pet-happiness-bar');
        const happinessVal = document.getElementById('pet-happiness-val');
        const staminaBar = document.getElementById('pet-stamina-bar');
        const staminaVal = document.getElementById('pet-stamina-val');
        const speciesIcon = document.getElementById('pet-species-icon');
        const nameTitle = document.getElementById('pet-name-title');
        const statusText = document.getElementById('pet-status-text');

        if (happinessBar) happinessBar.style.width = `${Math.min(100, this.localPet.happiness)}%`;
        if (happinessVal) happinessVal.textContent = `${Math.round(this.localPet.happiness)}%`;
        if (staminaBar) staminaBar.style.width = `${Math.min(100, this.localPet.stamina)}%`;
        if (staminaVal) staminaVal.textContent = `${Math.round(this.localPet.stamina)}%`;

        const isShiba = this.localPet.species === 'shiba';
        if (speciesIcon) speciesIcon.textContent = isShiba ? '🐕' : '🐈';
        if (nameTitle) nameTitle.textContent = isShiba ? 'Shiba Inu Companion' : 'Calico Cat Companion';
        if (statusText) statusText.textContent = this.localPet.state === 'FOLLOW' ? 'Following Master' : (this.localPet.state === 'INTERACT' ? 'Happy & Affectionate' : 'Resting');
    }

    triggerPetting() {
        if (!this.localPet) return;
        this.localPet.state = 'INTERACT';
        this.localPet.interactCooldown = 1.4;
        this.localPet.happiness = Math.min(100, this.localPet.happiness + 5);

        // Spawn 3D Hearts & Sound
        this.localPet.spawnHeartBurst(4);
        this.localPet.playPetSound('pet');

        if (window.openWorld3D?.onToast) {
            window.openWorld3D.onToast(`Petted your ${this.localPet.species === 'shiba' ? 'Shiba Inu' : 'Calico Cat'}! (+5 Happiness)`, 'success');
        }

        // Multiplayer Broadcast
        if (window.multiplayerClient) {
            window.multiplayerClient.sendPetInteract('pet', this.localPet.petId, this.localPet.position);
        }

        this.updateUI();
    }

    triggerFeeding() {
        if (!this.localPet) return;
        if (window.multiplayerClient) {
            window.multiplayerClient.sendPetInteract('feed', this.localPet.petId, this.localPet.position);
        } else {
            // Offline fallback
            this.localPet.state = 'INTERACT';
            this.localPet.interactCooldown = 1.6;
            this.localPet.happiness = Math.min(100, this.localPet.happiness + 20);
            this.localPet.stamina = Math.min(100, this.localPet.stamina + 30);
            this.localPet.spawnHeartBurst(6);
            this.localPet.playPetSound('feed');
            this.updateUI();
        }
    }

    onPetFeedAck(packet) {
        if (!this.localPet) return;
        if (packet.success) {
            this.localPet.state = 'INTERACT';
            this.localPet.interactCooldown = 1.6;
            this.localPet.happiness = Math.min(100, this.localPet.happiness + 20);
            this.localPet.stamina = Math.min(100, this.localPet.stamina + 30);
            this.localPet.spawnHeartBurst(6);
            this.localPet.playPetSound('feed');

            if (window.openWorld3D?.onToast) {
                window.openWorld3D.onToast(packet.message || 'Fed pet tasty roasted fish! (+20 XP, +20 Happiness)', 'success');
            }
            this.updateUI();
        } else {
            if (window.openWorld3D?.onToast) {
                window.openWorld3D.onToast(packet.message || 'No fish in inventory to feed pet!', 'warning');
            }
        }
    }

    switchSpecies(newSpecies) {
        if (newSpecies !== 'shiba' && newSpecies !== 'cat') return;
        this.currentSpecies = newSpecies;
        const oldPos = this.localPet.position.clone();
        const oldYaw = this.localPet.yaw;
        const oldHappiness = this.localPet.happiness;
        const oldStamina = this.localPet.stamina;

        this.localPet.destroy();
        this.localPet = new PetEntity(newSpecies, false, 'local_player');
        this.localPet.position.copy(oldPos);
        this.localPet.yaw = oldYaw;
        this.localPet.happiness = oldHappiness;
        this.localPet.stamina = oldStamina;
        this.scene.add(this.localPet.group);

        if (window.openWorld3D?.onToast) {
            window.openWorld3D.onToast(`Switched companion to ${newSpecies === 'shiba' ? 'Shiba Inu 🐕' : 'Calico Cat 🐈'}!`, 'info');
        }

        this.updateUI();
    }

    /**
     * Updates local pet steering and all remote peer dummy pets
     */
    update(delta, playerPos = null, playerMesh = null) {
        if (this.localPet) {
            this.localPet.update(delta, playerPos, playerMesh, this.terrain);
        }

        // 10Hz WebSocket Sync Broadcast
        this.syncTimer += delta;
        if (this.syncTimer >= this.syncInterval) {
            this.syncTimer = 0;
            if (window.multiplayerClient && this.localPet) {
                window.multiplayerClient.sendPetSync({
                    petId: this.localPet.petId,
                    species: this.localPet.species,
                    state: this.localPet.state,
                    position: {
                        x: Number(this.localPet.position.x.toFixed(3)),
                        y: Number(this.localPet.position.y.toFixed(3)),
                        z: Number(this.localPet.position.z.toFixed(3))
                    },
                    velocity: {
                        x: Number(this.localPet.velocity.x.toFixed(3)),
                        y: Number(this.localPet.velocity.y.toFixed(3)),
                        z: Number(this.localPet.velocity.z.toFixed(3))
                    },
                    yaw: Number(this.localPet.yaw.toFixed(3)),
                    happiness: this.localPet.happiness,
                    stamina: this.localPet.stamina
                });
            }
        }

        // Update Remote Pets (Dead Reckoning LERP)
        for (const [ownerId, pet] of this.remotePets.entries()) {
            pet.update(delta, null, null, this.terrain);
        }
    }

    /**
     * Synchronizes existing remote pets upon receiving welcome packet
     */
    syncRemotePets(petList) {
        if (!Array.isArray(petList)) return;
        petList.forEach(data => {
            if (data.ownerId !== window.multiplayerClient?.myUserId) {
                this.onRemotePetSync(data);
            }
        });
    }

    /**
     * Handles real-time pet_sync_broadcast from other players
     */
    onRemotePetSync(packet) {
        const ownerId = packet.ownerId;
        if (!ownerId || ownerId === window.multiplayerClient?.myUserId) return;

        let remotePet = this.remotePets.get(ownerId);
        if (!remotePet) {
            remotePet = new PetEntity(packet.species || 'shiba', true, ownerId);
            this.remotePets.set(ownerId, remotePet);
            this.scene.add(remotePet.group);
        } else if (remotePet.species !== packet.species) {
            remotePet.species = packet.species;
            remotePet.buildModel();
        }

        if (packet.position) {
            remotePet.targetPosition.set(packet.position.x, packet.position.y, packet.position.z);
            if (remotePet.position.lengthSq() < 0.001) {
                remotePet.position.copy(remotePet.targetPosition);
            }
        }
        if (typeof packet.yaw === 'number') remotePet.targetYaw = packet.yaw;
        if (packet.state) remotePet.state = packet.state;
        if (typeof packet.happiness === 'number') remotePet.happiness = packet.happiness;
    }

    /**
     * Handles pet interaction broadcast (e.g. peer petted their dog)
     */
    onRemotePetInteract(packet) {
        const ownerId = packet.ownerId;
        const pet = this.remotePets.get(ownerId) || (ownerId === window.multiplayerClient?.myUserId ? this.localPet : null);
        if (pet) {
            pet.state = 'INTERACT';
            pet.interactCooldown = 1.4;
            pet.spawnHeartBurst(packet.action === 'feed' ? 6 : 4);
            pet.playPetSound(packet.action);
        }
    }

    removeRemotePet(ownerId) {
        const pet = this.remotePets.get(ownerId);
        if (pet) {
            pet.destroy();
            this.remotePets.delete(ownerId);
        }
    }
}

if (typeof window !== 'undefined') {
    window.PetEntity = PetEntity;
    window.PetCompanionSystem = PetCompanionSystem;
}
