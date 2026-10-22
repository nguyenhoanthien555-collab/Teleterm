import * as THREE from '/vendor/three/build/three.module.js';

/**
 * TELETERM 3D — SYNCHRONIZED LIVING FIREFLY SWARM SYSTEM
 * Milestone 3: Ghibli Atmosphere & Twilight Bioluminescence
 *
 * Implements:
 * 1. InstancedMesh GPU-rendered bioluminescent fireflies (140 instances)
 * 2. Harmonic 3D drifting movement with individual frequency and phase offsets
 * 3. Twilight-synchronized activation (smoothstep fade in at dusk 18:30, fade out at dawn 05:30)
 * 4. Pulsating breathing glow with additive bioluminescent lime-yellow coloration
 * 5. Spatial distribution across Campfire Glade, Bamboo Grove, and Riverbank
 */

export class FireflySwarmSystem {
    constructor(scene) {
        this.scene = scene;
        this.fireflyCount = 140;

        this.instancedMesh = null;
        this.fireflies = [];
        this.dummy = new THREE.Object3D();

        this.initSwarm();

        if (typeof window !== 'undefined') {
            window.fireflySwarmSystem = this;
        }
    }

    initSwarm() {
        // Soft diamond billboard geometry for glowing particle
        const geo = new THREE.OctahedronGeometry(0.065, 0);

        // Bioluminescent warm lime-yellow glow material
        this.material = new THREE.MeshBasicMaterial({
            color: 0xd9f99d, // Lime-200 anime glow
            transparent: true,
            opacity: 0.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.instancedMesh = new THREE.InstancedMesh(geo, this.material, this.fireflyCount);
        this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.instancedMesh.frustumCulled = false;

        // Clusters definition
        const clusters = [
            // 1. Campfire Riverside Glade
            { count: 65, center: { x: 15.0, y: 1.1, z: 16.0 }, radius: 7.5, heightRange: 1.6 },
            // 2. Bamboo Onsen Stream
            { count: 45, center: { x: -42.0, y: 2.2, z: -18.0 }, radius: 8.0, heightRange: 1.8 },
            // 3. Central Village Waterway
            { count: 30, center: { x: 2.0, y: 0.8, z: 24.0 }, radius: 6.5, heightRange: 1.4 }
        ];

        let index = 0;
        clusters.forEach(cl => {
            for (let i = 0; i < cl.count && index < this.fireflyCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.sqrt(Math.random()) * cl.radius;

                const basePos = new THREE.Vector3(
                    cl.center.x + Math.cos(angle) * r,
                    cl.center.y + Math.random() * cl.heightRange,
                    cl.center.z + Math.sin(angle) * r
                );

                this.fireflies.push({
                    basePos,
                    currentPos: basePos.clone(),
                    speedX: 0.4 + Math.random() * 0.6,
                    speedY: 0.5 + Math.random() * 0.7,
                    speedZ: 0.3 + Math.random() * 0.5,
                    pulseSpeed: 1.8 + Math.random() * 2.2,
                    phase: Math.random() * Math.PI * 2,
                    scaleBase: 0.7 + Math.random() * 0.6
                });

                index++;
            }
        });

        if (this.scene) {
            this.scene.add(this.instancedMesh);
        }
    }

    /**
     * Updates firefly positions and visibility according to celestial time-of-day
     */
    update(delta, timeOfDay = 12.0) {
        if (!this.instancedMesh) return;

        // 1. Calculate Twilight Activation Factor
        // Active between 18:30 and 05:30
        let targetOpacity = 0.0;
        if (timeOfDay >= 19.5 || timeOfDay <= 4.5) {
            targetOpacity = 0.92;
        } else if (timeOfDay >= 18.0 && timeOfDay < 19.5) {
            // Dusk transition
            targetOpacity = ((timeOfDay - 18.0) / 1.5) * 0.92;
        } else if (timeOfDay > 4.5 && timeOfDay <= 6.0) {
            // Dawn transition
            targetOpacity = (1.0 - ((timeOfDay - 4.5) / 1.5)) * 0.92;
        }

        this.material.opacity = THREE.MathUtils.lerp(this.material.opacity, targetOpacity, Math.min(1.0, delta * 3.0));

        // Skip expensive matrix calculations if completely invisible in full daylight
        if (this.material.opacity < 0.01) {
            this.instancedMesh.visible = false;
            return;
        }
        this.instancedMesh.visible = true;

        const time = performance.now() / 1000.0;

        // 2. Harmonic organic floating drift
        for (let i = 0; i < this.fireflies.length; i++) {
            const f = this.fireflies[i];

            const dx = Math.sin(time * f.speedX + f.phase) * 0.55;
            const dy = Math.sin(time * f.speedY + f.phase * 1.5) * 0.35;
            const dz = Math.cos(time * f.speedZ + f.phase) * 0.55;

            this.dummy.position.set(
                f.basePos.x + dx,
                f.basePos.y + dy,
                f.basePos.z + dz
            );

            // Subtle breathing pulse scale
            const pulse = 0.65 + 0.35 * Math.sin(time * f.pulseSpeed + f.phase);
            const scale = f.scaleBase * pulse;
            this.dummy.scale.set(scale, scale, scale);

            this.dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        }

        this.instancedMesh.instanceMatrix.needsUpdate = true;
    }
}
