import * as THREE from '/vendor/three/build/three.module.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * TREE SYSTEM (RỪNG HOA ANH ĐÀO THÔN QUÊ - SAKURA GROVE)
 * Slender, Elegant Tapered Trunks, Elevated Fluffy Canopies & Wide Open Mountain Sightlines
 */
export class TreeSystem {
    constructor(scene, terrainSystem) {
        this.scene = scene;
        this.terrainSystem = terrainSystem;
        this.trees = [];
    }

    build() {
        // 1. Procedural Lush Watercolor Sakura Blossom Petal Texture
        const bCanvas = document.createElement('canvas');
        bCanvas.width = 512;
        bCanvas.height = 512;
        const bctx = bCanvas.getContext('2d');

        // Soft pastel blush pink base
        bctx.fillStyle = '#fce7f3';
        bctx.fillRect(0, 0, 512, 512);

        const drawPetalCluster = (cx, cy, r, petalColor, centerColor) => {
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5;
                const px = cx + Math.cos(angle) * (r * 0.52);
                const py = cy + Math.sin(angle) * (r * 0.52);
                bctx.fillStyle = petalColor;
                bctx.beginPath();
                bctx.ellipse(px, py, r * 0.44, r * 0.3, angle, 0, Math.PI * 2);
                bctx.fill();
            }
            bctx.fillStyle = centerColor;
            bctx.beginPath();
            bctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2);
            bctx.fill();
        };

        for (let i = 0; i < 180; i++) {
            const bx = Math.random() * 512;
            const by = Math.random() * 512;
            const br = 20 + Math.random() * 32;
            const pColors = [
                'rgba(255, 255, 255, 0.95)',  // Crisp white petal highlight
                'rgba(254, 215, 230, 0.92)',  // Soft blush pink
                'rgba(251, 182, 206, 0.88)',  // Rose quartz
                'rgba(244, 114, 182, 0.78)'   // Blossom core pink
            ];
            drawPetalCluster(bx, by, br, pColors[i % pColors.length], '#f43f5e');
        }

        const blossomTex = new THREE.CanvasTexture(bCanvas);
        blossomTex.wrapS = THREE.RepeatWrapping;
        blossomTex.wrapT = THREE.RepeatWrapping;
        blossomTex.repeat.set(2, 2);

        const blossomMat = new THREE.MeshStandardMaterial({
            map: blossomTex,
            emissive: 0xfbcfe8,
            emissiveIntensity: 0.18,
            roughness: 0.65,
            metalness: 0.02,
            shadowSide: THREE.DoubleSide
        });

        // Warm Organic Cherry Bark Material (Weathered cedar & loam)
        const trunkMat = new THREE.MeshStandardMaterial({
            color: 0x634b3d,
            roughness: 0.88,
            shadowSide: THREE.DoubleSide
        });

        // Rich Japanese Mountain Evergreen / Cedar Material (Sugi & Hinoki)
        const cedarMat = new THREE.MeshStandardMaterial({
            color: 0x1b4332, // Deep alpine cypress/pine green
            roughness: 0.78,
            metalness: 0.02,
            emissive: 0x0f291e,
            emissiveIntensity: 0.06,
            shadowSide: THREE.DoubleSide
        });

        // 2. Comprehensive Multi-Biome Tree Population (50+ Trees)
        // Layered across Eastern Hillside Grove, Alpine Foothills, River Valley, and Village Outskirts
        const treePlacements = [
            // --- Wayside Hero Sakura & Hub Environs ---
            { x: 9.2,   z: -8.0,  s: 1.25, rot: -0.35, mat: blossomMat },
            { x: 5.5,   z: -9.5,  s: 1.15, rot: 0.45,  mat: blossomMat },
            { x: 12.0,  z: -2.0,  s: 1.10, rot: -0.20, mat: blossomMat },
            { x: 6.8,   z: 8.5,   s: 1.15, rot: 0.30,  mat: blossomMat }, // Shifted clear of main road

            // --- Eastern Hillside Cherry Blossom Grove & Trail Avenue ---
            { x: 5.6,   z: -18.5, s: 1.20, rot: 0.25,  mat: blossomMat }, // Shifted 5.2m west of trail
            { x: 5.8,   z: -13.0, s: 1.15, rot: -0.30, mat: blossomMat }, // Shifted 5.4m west of trail and steps
            { x: 19.5,  z: -27.5, s: 1.25, rot: -0.40, mat: blossomMat },
            { x: 18.0,  z: -26.0, s: 1.25, rot: 0.50,  mat: blossomMat }, // Shifted clear of hill ascent trail
            { x: 26.5,  z: -16.0, s: 1.25, rot: -0.25, mat: blossomMat },
            { x: 27.0,  z: -28.0, s: 1.15, rot: 0.60,  mat: blossomMat },
            { x: 22.0,  z: -34.0, s: 1.20, rot: -0.45, mat: blossomMat },
            { x: 29.0,  z: -36.0, s: 1.30, rot: 0.15,  mat: blossomMat },
            { x: 36.5,  z: -32.5, s: 1.10, rot: -0.55, mat: blossomMat }, // Shifted clear of maple branch
            { x: 35.0,  z: -42.0, s: 1.25, rot: 0.35,  mat: blossomMat },
            { x: 28.0,  z: -48.0, s: 1.20, rot: -0.20, mat: blossomMat },
            { x: 38.5,  z: -45.5, s: 1.15, rot: -0.30, mat: blossomMat },

            // --- North Village Perimeter & Distant Foothill Woods ---
            { x: -5.0,  z: -36.0, s: 1.25, rot: 0.20,  mat: cedarMat },
            { x: 2.0,   z: -38.0, s: 1.20, rot: -0.40, mat: blossomMat },
            { x: 8.0,   z: -35.0, s: 1.15, rot: 0.35,  mat: cedarMat },
            { x: -12.0, z: -42.0, s: 1.30, rot: -0.15, mat: cedarMat },
            { x: -2.0,  z: -48.0, s: 1.25, rot: 0.50,  mat: cedarMat },
            { x: 14.0,  z: -46.0, s: 1.35, rot: -0.35, mat: cedarMat },
            { x: -22.0, z: -52.0, s: 1.30, rot: 0.25,  mat: cedarMat },
            { x: -32.0, z: -50.0, s: 1.20, rot: -0.40, mat: cedarMat },
            { x: -16.0, z: -58.0, s: 1.15, rot: 0.45,  mat: cedarMat },
            { x: 0.0,   z: -62.0, s: 1.30, rot: -0.20, mat: cedarMat },
            { x: 18.0,  z: -58.0, s: 1.25, rot: 0.30,  mat: cedarMat },
            { x: 26.0,  z: -56.0, s: 1.20, rot: -0.50, mat: cedarMat },

            // --- Western Agricultural Ridge Windbreak Copse (Completely clear of active rice paddies) ---
            { x: -16.0, z: -17.5, s: 1.25, rot: 0.35,  mat: cedarMat },
            { x: -44.5, z: -4.0,  s: 1.30, rot: 0.40,  mat: cedarMat },
            { x: -46.0, z: 6.0,   s: 1.25, rot: -0.30, mat: cedarMat },
            { x: -45.0, z: 16.0,  s: 1.20, rot: 0.25,  mat: cedarMat },
            { x: -47.0, z: 22.0,  s: 1.35, rot: -0.40, mat: cedarMat },

            // --- River Valley Margins & Riverside Shady Banks ---
            { x: 8.5,   z: 16.5,  s: 1.25, rot: 0.50,  mat: blossomMat },
            { x: 16.0,  z: 17.0,  s: 1.30, rot: -0.35, mat: blossomMat },
            { x: 22.0,  z: 18.5,  s: 1.20, rot: 0.25,  mat: cedarMat },
            { x: 28.0,  z: 22.0,  s: 1.35, rot: -0.45, mat: cedarMat },
            { x: -8.5,  z: 18.5,  s: 1.20, rot: -0.30, mat: blossomMat },
            { x: -18.0, z: 19.0,  s: 1.25, rot: 0.40,  mat: cedarMat },
            { x: -28.0, z: 22.0,  s: 1.30, rot: -0.25, mat: cedarMat },
            { x: 12.0,  z: 36.0,  s: 1.25, rot: 0.35,  mat: blossomMat },
            { x: 20.0,  z: 37.5,  s: 1.20, rot: -0.40, mat: cedarMat },
            { x: -6.0,  z: 35.5,  s: 1.15, rot: 0.20,  mat: cedarMat },
            { x: -16.0, z: 36.0,  s: 1.25, rot: -0.30, mat: cedarMat },

            // --- Southern Coastal Dunes Wind-Bent Pines ---
            { x: 12.0,  z: 48.0,  s: 1.15, rot: 0.60,  mat: cedarMat },
            { x: 18.0,  z: 52.0,  s: 1.10, rot: -0.50, mat: cedarMat },
            { x: 2.0,   z: 50.0,  s: 1.15, rot: 0.40,  mat: cedarMat },
            { x: -8.0,  z: 54.0,  s: 1.20, rot: -0.35, mat: cedarMat },
            { x: 24.0,  z: 60.0,  s: 1.05, rot: 0.70,  mat: cedarMat }
        ];

        if (typeof mergeGeometries === 'function') {
            const trunkGeos = [];
            const blossomGeos = [];
            const cedarGeos = [];

            // Shared branch and cluster archetypes
            const branchDefs = [
                { angle: 0.3,   h: 4.2, len: 1.8, pitch: 0.38 },
                { angle: 2.2,   h: 4.5, len: 1.7, pitch: 0.35 },
                { angle: -1.8,  h: 4.7, len: 1.8, pitch: 0.36 },
                { angle: 1.2,   h: 4.8, len: 1.6, pitch: 0.32 }
            ];

            const clusterDefs = [
                { x: 0.0,  y: 5.8, z: 0.0,  r: 2.90 },
                { x: 0.1,  y: 6.7, z: 0.1,  r: 2.20 },
                { x: -1.8, y: 5.6, z: 0.6,  r: 2.35 },
                { x: 1.9,  y: 5.5, z: -0.5, r: 2.40 },
                { x: 0.3,  y: 5.7, z: -1.8, r: 2.30 },
                { x: -0.4, y: 5.5, z: 1.7,  r: 2.25 },
                { x: 2.2,  y: 4.8, z: 1.0,  r: 1.85 },
                { x: -2.1, y: 4.9, z: -1.1, r: 1.80 }
            ];

            treePlacements.forEach(t => {
                const ty = this.terrainSystem.getTerrainHeight(t.x, t.z);
                const scale = t.s;
                const baseRot = t.rot;

                const treeM4 = new THREE.Matrix4().compose(
                    new THREE.Vector3(t.x, ty, t.z),
                    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), baseRot),
                    new THREE.Vector3(1, 1, 1)
                );

                // 1. Trunk
                const trunkH = 5.6 * scale;
                const trunkGeo = new THREE.CylinderGeometry(0.18 * scale, 0.36 * scale, trunkH, 8);
                const trunkLocalM4 = new THREE.Matrix4().compose(
                    new THREE.Vector3(0.12 * scale, trunkH / 2, 0),
                    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.06),
                    new THREE.Vector3(1, 1, 1)
                );
                trunkGeo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(treeM4, trunkLocalM4));
                trunkGeos.push(trunkGeo);

                // 2. Root Flare
                const flareH = 0.7 * scale;
                const flareGeo = new THREE.CylinderGeometry(0.36 * scale, 0.62 * scale, flareH, 8);
                const flareLocalM4 = new THREE.Matrix4().makeTranslation(0.12 * scale, flareH / 2 - 0.04, 0);
                flareGeo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(treeM4, flareLocalM4));
                trunkGeos.push(flareGeo);

                // 3. Surface Roots
                for (let r = 0; r < 3; r++) {
                    const rAng = (r * Math.PI * 2) / 3 + 0.35;
                    const rootGeo = new THREE.ConeGeometry(0.15 * scale, 0.72 * scale, 5);
                    const rootEuler = new THREE.Euler(Math.PI / 2, 0, rAng, 'ZXY');
                    const rootLocalM4 = new THREE.Matrix4().compose(
                        new THREE.Vector3(0.12 * scale + Math.cos(rAng) * 0.40 * scale, 0.06 * scale, Math.sin(rAng) * 0.40 * scale),
                        new THREE.Quaternion().setFromEuler(rootEuler),
                        new THREE.Vector3(1, 1, 1)
                    );
                    rootGeo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(treeM4, rootLocalM4));
                    trunkGeos.push(rootGeo);
                }

                // 4. Scaffold Branches
                branchDefs.forEach(b => {
                    const branchGeo = new THREE.CylinderGeometry(0.09 * scale, 0.16 * scale, b.len * scale, 6);
                    const bx = Math.cos(b.angle) * (0.8 * scale);
                    const bz = Math.sin(b.angle) * (0.8 * scale);
                    const bEuler = new THREE.Euler(0, b.angle, b.pitch, 'YXZ');
                    const branchLocalM4 = new THREE.Matrix4().compose(
                        new THREE.Vector3(bx, b.h * scale, bz),
                        new THREE.Quaternion().setFromEuler(bEuler),
                        new THREE.Vector3(1, 1, 1)
                    );
                    branchGeo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(treeM4, branchLocalM4));
                    trunkGeos.push(branchGeo);
                });

                // 5. Canopy Clusters
                const targetCanopyList = (t.mat === cedarMat) ? cedarGeos : blossomGeos;
                clusterDefs.forEach((c, idx) => {
                    const cGeo = new THREE.DodecahedronGeometry(c.r * scale, 2);
                    cGeo.scale(1.22, 0.72, 1.18);
                    const pos = cGeo.attributes.position;
                    for (let p = 0; p < pos.count; p++) {
                        const vx = pos.getX(p);
                        const vy = pos.getY(p);
                        const vz = pos.getZ(p);
                        const n = 1.0 + Math.sin(vx * 2.8 + vy * 3.2) * 0.08 + Math.cos(vz * 2.5) * 0.06;
                        pos.setXYZ(p, vx * n, vy * (0.94 + Math.sin(vx * 4.0) * 0.06), vz * n);
                    }
                    cGeo.computeVertexNormals();

                    const cEuler = new THREE.Euler(idx * 0.4, idx * 0.8, 0);
                    const cLocalM4 = new THREE.Matrix4().compose(
                        new THREE.Vector3(c.x * scale, c.y * scale, c.z * scale),
                        new THREE.Quaternion().setFromEuler(cEuler),
                        new THREE.Vector3(1, 1, 1)
                    );
                    cGeo.applyMatrix4(new THREE.Matrix4().multiplyMatrices(treeM4, cLocalM4));
                    targetCanopyList.push(cGeo);
                });

                this.trees.push({
                    position: new THREE.Vector3(t.x, ty, t.z),
                    scale: t.s,
                    rotation: t.rot,
                    type: (t.mat === cedarMat) ? 'cedar' : 'sakura'
                });
            });

            // Merge into unified single draw call meshes
            if (trunkGeos.length > 0) {
                const mergedTrunkGeo = mergeGeometries(trunkGeos, false);
                this.trunkMesh = new THREE.Mesh(mergedTrunkGeo, trunkMat);
                this.trunkMesh.name = 'MergedTreeTrunks';
                this.trunkMesh.castShadow = true;
                this.trunkMesh.receiveShadow = true;
                this.scene.add(this.trunkMesh);
                trunkGeos.forEach(g => g.dispose());
            }

            if (blossomGeos.length > 0) {
                const mergedBlossomGeo = mergeGeometries(blossomGeos, false);
                this.blossomMesh = new THREE.Mesh(mergedBlossomGeo, blossomMat);
                this.blossomMesh.name = 'MergedSakuraCanopies';
                this.blossomMesh.castShadow = true;
                this.blossomMesh.receiveShadow = true;
                this.scene.add(this.blossomMesh);
                blossomGeos.forEach(g => g.dispose());
            }

            if (cedarGeos.length > 0) {
                const mergedCedarGeo = mergeGeometries(cedarGeos, false);
                this.cedarMesh = new THREE.Mesh(mergedCedarGeo, cedarMat);
                this.cedarMesh.name = 'MergedCedarCanopies';
                this.cedarMesh.castShadow = true;
                this.cedarMesh.receiveShadow = true;
                this.scene.add(this.cedarMesh);
                cedarGeos.forEach(g => g.dispose());
            }
        } else {
            // Graceful fallback for non-bundled test runners
            treePlacements.forEach(t => {
                const tree = this.buildOrganicTree(t.s, t.rot, trunkMat, t.mat || blossomMat);
                const ty = this.terrainSystem.getTerrainHeight(t.x, t.z);
                tree.position.set(t.x, ty, t.z);
                this.scene.add(tree);
                this.trees.push(tree);
            });
        }
    }


    buildOrganicTree(scale, baseRotation, trunkMat, blossomMat) {
        const group = new THREE.Group();
        group.rotation.y = baseRotation;

        // Slender, Graceful Tapered Trunk (Height 5.4m - 6.6m) with slight natural wabi-sabi lean
        const trunkH = 5.6 * scale;
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18 * scale, 0.36 * scale, trunkH, 8),
            trunkMat
        );
        trunk.position.set(0.12 * scale, trunkH / 2, 0);
        trunk.rotation.z = -0.06;
        trunk.castShadow = true;
        group.add(trunk);

        // Flared Root Collar & Buttress Roots (Bám rễ sâu vào đất, không cụt lủn)
        const flareH = 0.7 * scale;
        const rootFlare = new THREE.Mesh(
            new THREE.CylinderGeometry(0.36 * scale, 0.62 * scale, flareH, 8),
            trunkMat
        );
        rootFlare.position.set(0.12 * scale, flareH / 2 - 0.04, 0);
        rootFlare.castShadow = true;
        group.add(rootFlare);

        // 3 Organic Surface Roots spreading into the turf
        for (let r = 0; r < 3; r++) {
            const rAng = (r * Math.PI * 2) / 3 + 0.35;
            const rMesh = new THREE.Mesh(
                new THREE.ConeGeometry(0.15 * scale, 0.72 * scale, 5),
                trunkMat
            );
            rMesh.rotation.x = Math.PI / 2;
            rMesh.rotation.z = rAng;
            rMesh.position.set(
                0.12 * scale + Math.cos(rAng) * 0.40 * scale,
                0.06 * scale,
                Math.sin(rAng) * 0.40 * scale
            );
            rMesh.castShadow = true;
            group.add(rMesh);
        }

        // Elegant Scaffold Branches reaching upwards into the floral cloud clusters
        const branches = [
            { angle: 0.3,   h: 4.2, len: 1.8, pitch: 0.38 },
            { angle: 2.2,   h: 4.5, len: 1.7, pitch: 0.35 },
            { angle: -1.8,  h: 4.7, len: 1.8, pitch: 0.36 },
            { angle: 1.2,   h: 4.8, len: 1.6, pitch: 0.32 }
        ];

        branches.forEach(b => {
            const bMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(0.09 * scale, 0.16 * scale, b.len * scale, 6),
                trunkMat
            );
            const bx = Math.cos(b.angle) * (0.8 * scale);
            const bz = Math.sin(b.angle) * (0.8 * scale);
            bMesh.position.set(bx, b.h * scale, bz);
            bMesh.rotation.y = b.angle;
            bMesh.rotation.z = b.pitch;
            bMesh.castShadow = true;
            group.add(bMesh);
        });

        // Elevated Tiered Cloud-like Blossom Cushions (Broad umbrella canopy casting wide, lush shade)
        const clusters = [
            // Broad Core Canopy (Spanning radius 2.9m for wide ground shade)
            { x: 0.0,  y: 5.8, z: 0.0,  r: 2.90 },
            // High Central Crest
            { x: 0.1,  y: 6.7, z: 0.1,  r: 2.20 },
            // Left Upper Cloud Mass
            { x: -1.8, y: 5.6, z: 0.6,  r: 2.35 },
            // Right Upper Cloud Mass
            { x: 1.9,  y: 5.5, z: -0.5, r: 2.40 },
            // Back Canopy Cloud
            { x: 0.3,  y: 5.7, z: -1.8, r: 2.30 },
            // Forward Canopy Cloud
            { x: -0.4, y: 5.5, z: 1.7,  r: 2.25 },
            // Outreaching Lateral Cushions
            { x: 2.2,  y: 4.8, z: 1.0,  r: 1.85 },
            { x: -2.1, y: 4.9, z: -1.1, r: 1.80 }
        ];

        clusters.forEach((c, idx) => {
            const cGeo = new THREE.DodecahedronGeometry(c.r * scale, 2);
            cGeo.scale(1.22, 0.72, 1.18);
            const pos = cGeo.attributes.position;
            for (let p = 0; p < pos.count; p++) {
                const vx = pos.getX(p);
                const vy = pos.getY(p);
                const vz = pos.getZ(p);
                const n = 1.0 + Math.sin(vx * 2.8 + vy * 3.2) * 0.08 + Math.cos(vz * 2.5) * 0.06;
                pos.setXYZ(p, vx * n, vy * (0.94 + Math.sin(vx * 4.0) * 0.06), vz * n);
            }
            cGeo.computeVertexNormals();

            const cMesh = new THREE.Mesh(cGeo, blossomMat);
            cMesh.position.set(c.x * scale, c.y * scale, c.z * scale);
            cMesh.rotation.set(idx * 0.4, idx * 0.8, 0);
            cMesh.castShadow = true;
            cMesh.receiveShadow = true;
            group.add(cMesh);
        });

        return group;
    }
}
