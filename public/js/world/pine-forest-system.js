import * as THREE from 'three';

/**
 * ALPINE PINE WOODS & MOUNTAIN TRAIL SYSTEM (RỪNG THÔNG TUYẾT CHÍNH BẮC)
 * Far North Biome: z in [-85, -45], x in [-45, 45]
 * Features:
 * - 70+ Instanced Conical Mountain Pines (Matsue & Alpine Firs)
 * - Scaling with elevation up the mountain slopes (6m to 12m height)
 * - Deep emerald needle foliage with subtle snow-kissed caps
 * - Craggy alpine boulders and mossy stones around tree root mounds
 */
export class PineForestSystem {
    constructor(scene, terrainSystem) {
        this.scene = scene;
        this.terrain = terrainSystem;
        this.trunkMesh = null;
        this.crownTier1Mesh = null;
        this.crownTier2Mesh = null;
        this.crownTier3Mesh = null;
        this.boulderMesh = null;
        this.count = 75;
    }

    build() {
        const pineGroup = new THREE.Group();
        pineGroup.name = 'PineForestSystem';

        // 1. Materials
        const barkMat = new THREE.MeshStandardMaterial({
            color: 0x3d2817, // Rugged dark pine bark
            roughness: 0.92
        });

        const needleLowerMat = new THREE.MeshStandardMaterial({
            color: 0x14532d, // Deep alpine evergreen
            roughness: 0.78,
            metalness: 0.02
        });

        const needleMidMat = new THREE.MeshStandardMaterial({
            color: 0x166534, // Mountain pine green
            roughness: 0.75,
            metalness: 0.02
        });

        const needleCapMat = new THREE.MeshStandardMaterial({
            color: 0x34d399, // Frosted snow-kissed pine cap
            roughness: 0.65,
            metalness: 0.05
        });

        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0x64748b, // Weathered mountain granite
            roughness: 0.94
        });

        // 2. Geometries (Tall conical pine silhouette with scalloped needle skirts)
        const trunkGeo = new THREE.CylinderGeometry(0.15, 0.28, 4.5, 8);
        trunkGeo.translate(0, 2.25, 0);

        // Helper: Organic scalloped pine needle skirt with radial flutes & edge droop
        const createScallopedPineTierGeo = (radius, height, segments) => {
            const geo = new THREE.ConeGeometry(radius, height, segments, 3, false);
            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const y = pos.getY(i);
                // Perturb lower and mid skirt rings, leaving the peak sharp
                if (y < height * 0.4) {
                    const x = pos.getX(i);
                    const z = pos.getZ(i);
                    const angle = Math.atan2(z, x);
                    const scallop = 1.0 + Math.sin(angle * 8.0) * 0.14 + (Math.sin(angle * 16.0) * 0.04);
                    pos.setX(i, x * scallop);
                    pos.setZ(i, z * scallop);
                    pos.setY(i, y - Math.abs(Math.sin(angle * 4.0)) * 0.12);
                }
            }
            geo.computeVertexNormals();
            geo.translate(0, height / 2, 0);
            return geo;
        };

        const tier1Geo = createScallopedPineTierGeo(2.4, 2.8, 16);
        const tier2Geo = createScallopedPineTierGeo(1.8, 2.4, 16);
        const tier3Geo = createScallopedPineTierGeo(1.2, 2.0, 14);

        const boulderGeo = new THREE.DodecahedronGeometry(0.85, 1);

        // 3. Instanced Meshes
        this.trunkMesh = new THREE.InstancedMesh(trunkGeo, barkMat, this.count);
        this.trunkMesh.castShadow = true;
        this.trunkMesh.receiveShadow = true;

        this.crownTier1Mesh = new THREE.InstancedMesh(tier1Geo, needleLowerMat, this.count);
        this.crownTier1Mesh.castShadow = true;

        this.crownTier2Mesh = new THREE.InstancedMesh(tier2Geo, needleMidMat, this.count);
        this.crownTier2Mesh.castShadow = true;

        this.crownTier3Mesh = new THREE.InstancedMesh(tier3Geo, needleCapMat, this.count);
        this.crownTier3Mesh.castShadow = true;

        const boulderCount = 30;
        this.boulderMesh = new THREE.InstancedMesh(boulderGeo, stoneMat, boulderCount);
        this.boulderMesh.castShadow = true;
        this.boulderMesh.receiveShadow = true;

        const dummy = new THREE.Object3D();

        // Path clearance helper for Alpine Ascent Trail
        const isNearAlpineTrail = (x, z) => {
            const waypoints = [
                { x: 0.0, z: -32.0 },
                { x: 6.0, z: -42.0 },
                { x: 18.0, z: -50.0 },
                { x: 28.0, z: -49.0 },
                { x: 33.2, z: -46.5 }
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

        // 4. Distribution across Alpine Foothills (z < -45, x in [-45, 45])
        let seed = 9991;
        const rnd = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        let placed = 0;
        let bPlaced = 0;

        for (let i = 0; i < this.count; i++) {
            const px = -42.0 + rnd() * 84.0;
            const pz = -46.0 - rnd() * 34.0; // z from -46 to -80

            // Exclude Alpine Overlook observation deck at (34.0, -48.0)
            const distToOverlook = Math.hypot(px - 34.0, pz - -48.0);
            if (distToOverlook < 4.5) {
                continue;
            }

            // Exclude Alpine Ascent trail corridor (2.5m buffer)
            if (isNearAlpineTrail(px, pz)) {
                continue;
            }

            // Exclude central trail corridor around (0, pz) if near village approach
            if (Math.abs(px) < 3.0 && pz > -55.0) {
                continue;
            }

            const py = this.terrain.getTerrainHeight(px, pz);
            // Elevation scaling: trees grow larger and denser on high mountain terrain
            const elevBonus = Math.max(0, py * 0.08);
            const scale = 0.90 + rnd() * 0.45 + elevBonus;
            const rotY = rnd() * Math.PI * 2;
            const tilt = (rnd() - 0.5) * 0.08;

            // Trunk
            dummy.position.set(px, py, pz);
            dummy.scale.set(scale, scale * 1.15, scale);
            dummy.rotation.set(tilt, rotY, tilt);
            dummy.updateMatrix();
            this.trunkMesh.setMatrixAt(placed, dummy.matrix);

            // Tier 1 Crown (Base skirt)
            dummy.position.set(px, py + 2.5 * scale, pz);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(0, rotY, 0);
            dummy.updateMatrix();
            this.crownTier1Mesh.setMatrixAt(placed, dummy.matrix);

            // Tier 2 Crown (Mid cone)
            dummy.position.set(px, py + 4.2 * scale, pz);
            dummy.scale.set(scale * 0.92, scale * 0.95, scale * 0.92);
            dummy.rotation.set(0, rotY + 0.5, 0);
            dummy.updateMatrix();
            this.crownTier2Mesh.setMatrixAt(placed, dummy.matrix);

            // Tier 3 Crown (Snow-dusted apex)
            dummy.position.set(px, py + 5.8 * scale, pz);
            dummy.scale.set(scale * 0.85, scale * 0.9, scale * 0.85);
            dummy.rotation.set(0, rotY + 1.0, 0);
            dummy.updateMatrix();
            this.crownTier3Mesh.setMatrixAt(placed, dummy.matrix);

            // Occasional boulder beside tree root
            if (bPlaced < boulderCount && rnd() < 0.42) {
                const bx = px + (rnd() - 0.5) * 2.2;
                const bz = pz + (rnd() - 0.5) * 2.2;
                const by = this.terrain.getTerrainHeight(bx, bz) + 0.2;
                dummy.position.set(bx, by, bz);
                dummy.scale.set(0.6 + rnd() * 0.6, 0.4 + rnd() * 0.4, 0.6 + rnd() * 0.6);
                dummy.rotation.set(rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI);
                dummy.updateMatrix();
                this.boulderMesh.setMatrixAt(bPlaced++, dummy.matrix);
            }

            placed++;
        }

        this.trunkMesh.count = placed;
        this.crownTier1Mesh.count = placed;
        this.crownTier2Mesh.count = placed;
        this.crownTier3Mesh.count = placed;
        this.boulderMesh.count = bPlaced;

        this.trunkMesh.instanceMatrix.needsUpdate = true;
        this.crownTier1Mesh.instanceMatrix.needsUpdate = true;
        this.crownTier2Mesh.instanceMatrix.needsUpdate = true;
        this.crownTier3Mesh.instanceMatrix.needsUpdate = true;
        this.boulderMesh.instanceMatrix.needsUpdate = true;

        pineGroup.add(this.trunkMesh);
        pineGroup.add(this.crownTier1Mesh);
        pineGroup.add(this.crownTier2Mesh);
        pineGroup.add(this.crownTier3Mesh);
        pineGroup.add(this.boulderMesh);

        this.scene.add(pineGroup);
    }
}
