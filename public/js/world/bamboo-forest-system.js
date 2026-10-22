import * as THREE from '/vendor/three/build/three.module.js';

/**
 * BAMBOO MEDITATION FOREST SYSTEM (RỪNG TRÚC THIỀN ĐỊNH TÂY BẮC)
 * Northwest Biome: x in [-38, -14], z in [-45, -15]
 * Features:
 * - 120+ Instanced bamboo stalks with segmented culm nodes and natural curvature
 * - Instanced slender bamboo leaf sprays clustered at upper segments
 * - Sprouted bamboo shoots (takenoko) dotting the forest floor
 * - Gentle drifting bamboo leaf particles caught in the mountain breeze
 */
export class BambooForestSystem {
    constructor(scene, terrainSystem) {
        this.scene = scene;
        this.terrain = terrainSystem;
        this.stalkMesh = null;
        this.leafMesh = null;
        this.shootMesh = null;
        this.particles = null;
        this.count = 140;
    }

    build() {
        const forestGroup = new THREE.Group();
        forestGroup.name = 'BambooForestSystem';

        // 1. Materials
        const culmCanvas = document.createElement('canvas');
        culmCanvas.width = 64;
        culmCanvas.height = 256;
        const cctx = culmCanvas.getContext('2d');

        // Fine vertical grain & bamboo stalk color gradient
        const cgrad = cctx.createLinearGradient(0, 0, 64, 0);
        cgrad.addColorStop(0.0, '#38a169');
        cgrad.addColorStop(0.3, '#48bb78');
        cgrad.addColorStop(0.7, '#68d391');
        cgrad.addColorStop(1.0, '#2f855a');
        cctx.fillStyle = cgrad;
        cctx.fillRect(0, 0, 64, 256);

        // Fine vertical fibrous grain lines
        cctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
        cctx.lineWidth = 1;
        for (let x = 2; x < 64; x += 3) {
            cctx.beginPath();
            cctx.moveTo(x, 0);
            cctx.lineTo(x, 256);
            cctx.stroke();
        }

        // Pale powdery culm nodes (the characteristic white bloom right at the node rings)
        for (let y = 32; y < 256; y += 64) {
            cctx.fillStyle = '#22543d';
            cctx.fillRect(0, y - 2, 64, 3);
            const bloomGrad = cctx.createLinearGradient(0, y + 1, 0, y + 16);
            bloomGrad.addColorStop(0.0, 'rgba(240, 253, 244, 0.55)');
            bloomGrad.addColorStop(1.0, 'rgba(240, 253, 244, 0.0)');
            cctx.fillStyle = bloomGrad;
            cctx.fillRect(0, y + 1, 64, 15);
        }

        const culmTex = new THREE.CanvasTexture(culmCanvas);
        culmTex.wrapS = THREE.RepeatWrapping;
        culmTex.wrapT = THREE.RepeatWrapping;
        culmTex.repeat.set(1, 4);

        const culmMat = new THREE.MeshStandardMaterial({
            map: culmTex,
            roughness: 0.58,
            metalness: 0.06
        });

        const foliageMat = new THREE.MeshStandardMaterial({
            color: 0x22c55e, // Emerald bamboo foliage
            roughness: 0.72,
            metalness: 0.02,
            side: THREE.DoubleSide
        });

        const shootMat = new THREE.MeshStandardMaterial({
            color: 0x65a30d, // Fresh young spring bamboo green
            roughness: 0.68,
            metalness: 0.04,
            side: THREE.DoubleSide
        });

        // 2. Bamboo Culm Geometry (Segmented stalk with raised culm nodes Setsu & gentle taper)
        const stalkGeo = new THREE.CylinderGeometry(0.065, 0.095, 8.5, 10, 24);
        stalkGeo.translate(0, 4.25, 0);
        const sPos = stalkGeo.attributes.position;
        for (let i = 0; i < sPos.count; i++) {
            const y = sPos.getY(i);
            const nodeInterval = 1.25;
            const distToNode = Math.abs((y % nodeInterval) - (nodeInterval * 0.5));
            if (distToNode < 0.09) {
                // Raised culm node ring
                const ringFactor = 1.0 + (0.09 - distToNode) * 2.4;
                sPos.setX(i, sPos.getX(i) * ringFactor);
                sPos.setZ(i, sPos.getZ(i) * ringFactor);
            }
        }
        stalkGeo.computeVertexNormals();

        // 3. Bamboo Foliage Cluster Geometry (Fan of slender pointed leaves)
        const leafClusterGeo = new THREE.BufferGeometry();
        const leafPositions = [];
        const leafNormals = [];
        const leafIndices = [];

        for (let l = 0; l < 6; l++) {
            const angle = (l / 6) * Math.PI * 2 + (l % 2) * 0.3;
            const length = 1.1 + (l % 3) * 0.25;
            const width = 0.18;
            const baseIdx = leafPositions.length / 3;

            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            // Leaf diamond quad
            leafPositions.push(0, 0, 0);
            leafPositions.push(cos * length * 0.45 - sin * width, length * 0.15, sin * length * 0.45 + cos * width);
            leafPositions.push(cos * length, length * 0.08, sin * length);
            leafPositions.push(cos * length * 0.45 + sin * width, length * 0.15, sin * length * 0.45 - cos * width);

            for (let k = 0; k < 4; k++) leafNormals.push(0, 1, 0);
            leafIndices.push(baseIdx, baseIdx + 1, baseIdx + 2);
            leafIndices.push(baseIdx, baseIdx + 2, baseIdx + 3);
        }

        leafClusterGeo.setAttribute('position', new THREE.Float32BufferAttribute(leafPositions, 3));
        leafClusterGeo.setAttribute('normal', new THREE.Float32BufferAttribute(leafNormals, 3));
        leafClusterGeo.setIndex(leafIndices);

        // 4. Instanced Meshes
        this.stalkMesh = new THREE.InstancedMesh(stalkGeo, culmMat, this.count);
        this.stalkMesh.castShadow = true;
        this.stalkMesh.receiveShadow = true;

        this.leafMesh = new THREE.InstancedMesh(leafClusterGeo, foliageMat, this.count * 2);
        this.leafMesh.castShadow = true;

        // Young Bamboo Sprouts (Natural slender young culms with leaf plumes, replacing primitive cone spam)
        const sproutStalkGeo = new THREE.CylinderGeometry(0.024, 0.045, 1.4, 8, 8);
        sproutStalkGeo.translate(0, 0.70, 0);
        const stPos = sproutStalkGeo.attributes.position;
        for (let i = 0; i < stPos.count; i++) {
            const py = stPos.getY(i);
            stPos.setX(i, stPos.getX(i) + Math.sin(py * 2.2) * 0.05);
        }
        sproutStalkGeo.computeVertexNormals();

        const spPositions = [];
        const spNormals = [];
        const spIndices = [];
        for (let l = 0; l < 4; l++) {
            const angle = (l / 4) * Math.PI * 2 + 0.3;
            const length = 0.52;
            const width = 0.09;
            const baseIdx = spPositions.length / 3;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const tipY = 1.36;

            spPositions.push(0, tipY, 0);
            spPositions.push(cos * length * 0.5 - sin * width, tipY + 0.10, sin * length * 0.5 + cos * width);
            spPositions.push(cos * length, tipY + 0.05, sin * length);
            spPositions.push(cos * length * 0.5 + sin * width, tipY + 0.10, sin * length * 0.5 - cos * width);

            for (let k = 0; k < 4; k++) spNormals.push(0, 1, 0);
            spIndices.push(baseIdx, baseIdx + 1, baseIdx + 2);
            spIndices.push(baseIdx, baseIdx + 2, baseIdx + 3);
        }

        const p1 = sproutStalkGeo.attributes.position.array;
        const n1 = sproutStalkGeo.attributes.normal.array;
        const idx1 = sproutStalkGeo.index.array;
        const vCount1 = p1.length / 3;

        const mergedPos = new Float32Array(p1.length + spPositions.length);
        mergedPos.set(p1, 0);
        mergedPos.set(spPositions, p1.length);

        const mergedNorm = new Float32Array(n1.length + spNormals.length);
        mergedNorm.set(n1, 0);
        mergedNorm.set(spNormals, n1.length);

        const mergedIndices = new Uint16Array(idx1.length + spIndices.length);
        mergedIndices.set(idx1, 0);
        for (let i = 0; i < spIndices.length; i++) {
            mergedIndices[idx1.length + i] = spIndices[i] + vCount1;
        }

        const shootGeo = new THREE.BufferGeometry();
        shootGeo.setAttribute('position', new THREE.BufferAttribute(mergedPos, 3));
        shootGeo.setAttribute('normal', new THREE.BufferAttribute(mergedNorm, 3));
        shootGeo.setIndex(new THREE.BufferAttribute(mergedIndices, 1));

        const shootCount = 35;
        this.shootMesh = new THREE.InstancedMesh(shootGeo, shootMat, shootCount);
        this.shootMesh.castShadow = true;
        this.shootMesh.receiveShadow = true;

        const dummy = new THREE.Object3D();

        // Path clearance helper for Bamboo Meditation trail
        const isNearBambooTrail = (x, z) => {
            const waypoints = [
                { x: 1.2, z: -22.0 },
                { x: -6.0, z: -24.0 },
                { x: -15.0, z: -27.0 },
                { x: -24.0, z: -29.5 }
            ];
            for (let p = 0; p < waypoints.length - 1; p++) {
                const p1 = waypoints[p];
                const p2 = waypoints[p + 1];
                const l2 = (p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2;
                const t = Math.max(0, Math.min(1, ((x - p1.x) * (p2.x - p1.x) + (z - p1.z) * (p2.z - p1.z)) / l2));
                const px = p1.x + t * (p2.x - p1.x);
                const pz = p1.z + t * (p2.z - p1.z);
                if (Math.hypot(x - px, z - pz) < 2.5) return true;
            }
            return false;
        };

        // 5. Generate Organic Clustered Distribution across Northwest Plateau
        // Bounds: x in [-36, -16], z in [-42, -16]
        // Avoid the Zen Tea Pavilion clearing at (-26, -30)
        let placedStalks = 0;
        let shootIdx = 0;

        // Seeded pseudorandom generator for deterministic, stable forest placement
        let seed = 42;
        const rnd = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        for (let i = 0; i < this.count; i++) {
            // Cluster centers around grove groves
            const cluster = rnd();
            let bx, bz;
            if (cluster < 0.35) {
                // Grove 1: West edge near terraced slope
                bx = -34.0 + rnd() * 10.0;
                bz = -20.0 - rnd() * 12.0;
            } else if (cluster < 0.70) {
                // Grove 2: North plateau towards mountain foot
                bx = -28.0 + rnd() * 11.0;
                bz = -32.0 - rnd() * 10.0;
            } else {
                // Grove 3: East perimeter near village pathway
                bx = -22.0 + rnd() * 7.0;
                bz = -18.0 - rnd() * 14.0;
            }

            // Exclude Zen Pavilion clearing radius
            const distToPavilion = Math.hypot(bx - -26.0, bz - -30.0);
            if (distToPavilion < 4.2) {
                // Push outward from pavilion clearing
                const pushAngle = Math.atan2(bz - -30.0, bx - -26.0);
                bx = -26.0 + Math.cos(pushAngle) * (4.5 + rnd() * 3.0);
                bz = -30.0 + Math.sin(pushAngle) * (4.5 + rnd() * 3.0);
            }

            // Exclude Bamboo Meditation Trail corridor (2.5m clearance)
            if (isNearBambooTrail(bx, bz)) {
                continue;
            }

            const by = this.terrain.getTerrainHeight(bx, bz);
            const scaleY = 0.85 + rnd() * 0.40;
            const scaleXZ = 0.90 + rnd() * 0.25;
            const leanAngle = (rnd() - 0.5) * 0.12;
            const leanDir = rnd() * Math.PI * 2;

            dummy.position.set(bx, by, bz);
            dummy.scale.set(scaleXZ, scaleY, scaleXZ);
            dummy.rotation.set(
                Math.sin(leanDir) * leanAngle,
                rnd() * Math.PI * 2,
                Math.cos(leanDir) * leanAngle
            );
            dummy.updateMatrix();
            this.stalkMesh.setMatrixAt(placedStalks, dummy.matrix);

            // Foliage cluster 1 (mid-high)
            const foliageH1 = by + (5.5 + rnd() * 1.2) * scaleY;
            dummy.position.set(bx + Math.sin(leanDir) * 0.4, foliageH1, bz + Math.cos(leanDir) * 0.4);
            dummy.scale.set(scaleXZ * 1.2, scaleXZ * 1.2, scaleXZ * 1.2);
            dummy.rotation.set(0.1, rnd() * Math.PI * 2, -0.1);
            dummy.updateMatrix();
            this.leafMesh.setMatrixAt(placedStalks * 2, dummy.matrix);

            // Foliage cluster 2 (treetop plume)
            const foliageH2 = by + (7.6 + rnd() * 0.8) * scaleY;
            dummy.position.set(bx + Math.sin(leanDir) * 0.7, foliageH2, bz + Math.cos(leanDir) * 0.7);
            dummy.scale.set(scaleXZ * 0.95, scaleXZ * 0.95, scaleXZ * 0.95);
            dummy.rotation.set(-0.15, rnd() * Math.PI * 2, 0.15);
            dummy.updateMatrix();
            this.leafMesh.setMatrixAt(placedStalks * 2 + 1, dummy.matrix);

            // Periodically place bamboo shoot near base
            if (shootIdx < shootCount && rnd() < 0.28) {
                const sx = bx + (rnd() - 0.5) * 1.2;
                const sz = bz + (rnd() - 0.5) * 1.2;
                const sy = this.terrain.getTerrainHeight(sx, sz);
                dummy.position.set(sx, sy, sz);
                dummy.scale.set(0.8 + rnd() * 0.4, 0.8 + rnd() * 0.4, 0.8 + rnd() * 0.4);
                dummy.rotation.set((rnd() - 0.5) * 0.15, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.15);
                dummy.updateMatrix();
                this.shootMesh.setMatrixAt(shootIdx++, dummy.matrix);
            }

            // Per-instance maturity color tint (fresh vs mature vs sunlit bamboo)
            const stalkColor = new THREE.Color();
            const colChoice = rnd();
            if (colChoice < 0.40) {
                stalkColor.setHex(0x4ade80); // Fresh vibrant bamboo
            } else if (colChoice < 0.75) {
                stalkColor.setHex(0x65a30d); // Mature deep bamboo
            } else {
                stalkColor.setHex(0x84cc16); // Sunlit golden-green bamboo
            }
            this.stalkMesh.setColorAt(placedStalks, stalkColor);

            const leafColor = new THREE.Color();
            leafColor.setHSL(0.33 + (rnd() - 0.5) * 0.05, 0.72, 0.44 + (rnd() - 0.5) * 0.08);
            this.leafMesh.setColorAt(placedStalks * 2, leafColor);
            this.leafMesh.setColorAt(placedStalks * 2 + 1, leafColor);

            placedStalks++;
        }

        this.stalkMesh.instanceMatrix.needsUpdate = true;
        if (this.stalkMesh.instanceColor) this.stalkMesh.instanceColor.needsUpdate = true;
        this.leafMesh.instanceMatrix.needsUpdate = true;
        if (this.leafMesh.instanceColor) this.leafMesh.instanceColor.needsUpdate = true;
        this.shootMesh.instanceMatrix.needsUpdate = true;

        forestGroup.add(this.stalkMesh);
        forestGroup.add(this.leafMesh);
        forestGroup.add(this.shootMesh);

        // 6. Floating Bamboo Leaf Particle Effect
        this.buildFloatingLeaves(forestGroup);

        this.scene.add(forestGroup);
    }

    buildFloatingLeaves(group) {
        const pCount = 65;
        const pGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(pCount * 3);
        const velocities = [];

        for (let i = 0; i < pCount; i++) {
            positions[i * 3]     = -36.0 + Math.random() * 22.0;
            positions[i * 3 + 1] = 1.2 + Math.random() * 7.0;
            positions[i * 3 + 2] = -42.0 + Math.random() * 26.0;

            velocities.push({
                x: 0.15 + Math.random() * 0.35,
                y: -0.12 - Math.random() * 0.18,
                z: 0.10 + Math.random() * 0.25
            });
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#86efac';
        ctx.beginPath();
        ctx.ellipse(16, 16, 14, 4, Math.PI / 3, 0, Math.PI * 2);
        ctx.fill();

        const pTex = new THREE.CanvasTexture(canvas);
        const pMat = new THREE.PointsMaterial({
            map: pTex,
            size: 0.35,
            transparent: true,
            opacity: 0.85,
            depthWrite: false
        });

        this.particles = new THREE.Points(pGeo, pMat);
        this.particles.userData = { vel: velocities };
        group.add(this.particles);
    }

    update(delta) {
        if (!this.particles || !this.particles.userData.vel) return;
        const pos = this.particles.geometry.attributes.position;
        const vel = this.particles.userData.vel;
        for (let i = 0; i < pos.count; i++) {
            let px = pos.getX(i) + vel[i].x * delta;
            let py = pos.getY(i) + vel[i].y * delta;
            let pz = pos.getZ(i) + vel[i].z * delta;

            px += Math.sin(py * 2.0 + i) * 0.012;

            if (py < 0.2) {
                py = 6.0 + Math.random() * 3.0;
                px = -36.0 + Math.random() * 22.0;
                pz = -42.0 + Math.random() * 26.0;
            }

            pos.setXYZ(i, px, py, pz);
        }
        pos.needsUpdate = true;
    }
}
