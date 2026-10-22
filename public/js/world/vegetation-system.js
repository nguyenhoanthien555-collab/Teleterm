import * as THREE from '/vendor/three/build/three.module.js';

/**
 * VEGETATION SYSTEM (CỎ & HOA ĐỒNG NỘI NHẬT BẢN)
 * Delicate Nanohana Wildflowers, White Daisies & Organic Grass Clusters (No cone spikes!)
 */
export class VegetationSystem {
    constructor(scene, terrainSystem, pathCurve) {
        this.scene = scene;
        this.terrainSystem = terrainSystem;
        this.pathCurve = pathCurve;
        this.grassMesh = null;
        this.yellowFlowerMesh = null;
        this.whiteFlowerMesh = null;
        this.time = 0;
    }

    build() {
        if (!this.pathCurve) return;

        // 1. DELICATE WILDFLOWERS (Nanohana & Daisies)
        // Scaled realistically: tiny, subtle floral accents (Radius 0.018m)
        const flowerGeo = new THREE.SphereGeometry(0.018, 4, 4);

        // Standard materials so flowers receive soft sunlight & ambient bounce (No neon LED glow!)
        const yellowMat = new THREE.MeshStandardMaterial({
            color: 0xeab308, // Soft golden rapeseed yellow
            roughness: 0.72,
            metalness: 0.02
        });
        const whiteMat = new THREE.MeshStandardMaterial({
            color: 0xf1f5f9, // Soft white daisy
            roughness: 0.75,
            metalness: 0.02
        });

        const fCount = 260;
        this.yellowFlowerMesh = new THREE.InstancedMesh(flowerGeo, yellowMat, fCount);
        this.whiteFlowerMesh = new THREE.InstancedMesh(flowerGeo, whiteMat, Math.floor(fCount * 0.45));

        const dummy = new THREE.Object3D();
        let yIdx = 0;
        let wIdx = 0;

        for (let i = 0; i < fCount; i++) {
            const t = Math.random();
            const pt = this.pathCurve.getPoint(t);
            const side = Math.random() > 0.5 ? 1 : -1;
            // Distribute strictly along road shoulders and canal banks (outside path width)
            const offset = side * (1.45 + Math.random() * 1.6);

            let fx = pt.x + offset;
            let fz = pt.z + (Math.random() - 0.5) * 1.2;

            // Strict Agricultural Protection: Never spawn wild meadow flowers inside flooded rice country
            if (fx < 0.25 && fz > -36.0 && fz < 16.0) {
                fx = Math.abs(fx) + 1.85; // Shift to East road shoulder
            }

            const ty = this.terrainSystem.getTerrainHeight(fx, fz);
            const fy = ty + 0.03 + Math.random() * 0.05;
            const scale = 0.65 + Math.random() * 0.5;

            dummy.position.set(fx, fy, fz);
            dummy.scale.set(scale, scale * 1.2, scale);
            dummy.updateMatrix();

            this.yellowFlowerMesh.setMatrixAt(yIdx++, dummy.matrix);

            if (i % 2 === 0 && wIdx < Math.floor(fCount * 0.45)) {
                dummy.position.set(fx + 0.08, ty + 0.025 + Math.random() * 0.04, fz + 0.08);
                dummy.scale.set(scale * 0.8, scale * 0.9, scale * 0.8);
                dummy.updateMatrix();
                this.whiteFlowerMesh.setMatrixAt(wIdx++, dummy.matrix);
            }
        }

        this.yellowFlowerMesh.instanceMatrix.needsUpdate = true;
        this.whiteFlowerMesh.instanceMatrix.needsUpdate = true;
        this.yellowFlowerMesh.receiveShadow = true;
        this.whiteFlowerMesh.receiveShadow = true;
        this.scene.add(this.yellowFlowerMesh);
        this.scene.add(this.whiteFlowerMesh);

        // 2. ORGANIC GRASS BLADE CLUSTERS (Slender, delicate foliage tufts)
        this.buildOrganicGrassTufts();
    }

    buildOrganicGrassTufts() {
        const bladeW = 0.016;
        const bladeH = 0.14;
        const bladeGeo = new THREE.BufferGeometry();

        // 2 intersecting slender grass blades forming a delicate tapered natural cross-tuft
        const vertices = new Float32Array([
            // Blade 1 (tapered to fine tip)
            -bladeW, 0, 0,
             bladeW, 0, 0,
             0, bladeH, 0.02,
            // Blade 2 (angled ~70 degrees, tapered to tip)
             0, 0, -bladeW,
             0, 0,  bladeW,
             0.02, bladeH, 0
        ]);

        bladeGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        bladeGeo.computeVertexNormals();

        const grassMat = new THREE.MeshStandardMaterial({
            color: 0x6ea72d, // Vibrant spring pasture green harmonious with watercolor meadow
            roughness: 0.72,
            metalness: 0.02,
            side: THREE.DoubleSide
        });

        const gCount = 1200;
        this.grassMesh = new THREE.InstancedMesh(bladeGeo, grassMat, gCount);
        const dummy = new THREE.Object3D();

        let gIdx = 0;
        for (let i = 0; i < gCount; i++) {
            let gx, gz;
            if (i < 700) {
                // Along path shoulders and road margins
                const t = Math.random();
                const pt = this.pathCurve.getPoint(t);
                const side = Math.random() > 0.5 ? 1 : -1;
                const offset = side * (1.3 + Math.random() * 2.5);
                gx = pt.x + offset;
                gz = pt.z + (Math.random() - 0.5) * 1.8;

                // Strict Agricultural Protection: Never spawn wild lawn grass tufts in flooded paddies
                if (gx < 0.25 && gz > -36.0 && gz < 16.0) {
                    gx = Math.abs(gx) + 1.85; // Shift to East road verge
                }
            } else {
                // Naturally scattered on rolling Eastern Cherry Hills (x: 12 to 34, z: -10 to -45)
                gx = 12.0 + Math.random() * 22.0;
                gz = -10.0 - Math.random() * 35.0;
            }
            const gy = this.terrainSystem.getTerrainHeight(gx, gz);
            const scale = 0.75 + Math.random() * 0.55;

            dummy.position.set(gx, gy, gz);
            dummy.rotation.y = Math.random() * Math.PI * 2;
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();

            this.grassMesh.setMatrixAt(gIdx++, dummy.matrix);
        }

        this.grassMesh.instanceMatrix.needsUpdate = true;
        this.grassMesh.receiveShadow = true;
        this.scene.add(this.grassMesh);
    }
}
