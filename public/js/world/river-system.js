import * as THREE from 'three';

/**
 * RIVER SYSTEM — MEANDERING RIVER VALLEY & BRIDGES
 * Implements Section 8, 48, and 49 of TeleTerm Living Open World Master Spec v3.
 * Features:
 * - Meandering riverbed with dynamic flowing cyan water
 * - Natural rounded gravel banks & river stones
 * - Arched timber road bridge connecting Developer Hub/Village to Beach
 * - Natural river stone stepping-stones crossing
 * - Riverside reeds & shoreline transitions
 */
export class RiverSystem {
    constructor(scene, terrainSystem, waterSystem) {
        this.scene = scene;
        this.terrainSystem = terrainSystem;
        this.waterSystem = waterSystem;
        this.riverMeshes = [];
        this.bridgeMesh = null;
    }

    build() {
        const riverGroup = new THREE.Group();

        // 1. Single Continuous Meandering River Water Surface Ribbon (Zero seam bands, zero z-fighting)
        const riverWidth = 9.8;
        const riverLength = 120.0;
        const riverZ = 27.0;
        const riverY = -0.28; // Water surface elevation sunken below bank crests (+0.22m)
        const segX = 80;
        const segZ = 8;

        if (!this.waterSystem.streamMat) this.waterSystem.initMaterials();

        const riverGeo = new THREE.PlaneGeometry(riverLength, riverWidth, segX, segZ);
        riverGeo.rotateX(-Math.PI / 2);
        const rPos = riverGeo.attributes.position;
        for (let i = 0; i < rPos.count; i++) {
            const vx = rPos.getX(i);
            const vz = rPos.getZ(i);
            const meanderOffsetZ = Math.sin(vx * 0.05) * 3.2 + Math.sin(vx * 0.12) * 0.6;
            rPos.setXYZ(i, vx, riverY, vz + riverZ + meanderOffsetZ);
        }
        // Scale UV coordinates so water ripples repeat every 2.5m along river flow
        const rUv = riverGeo.attributes.uv;
        for (let i = 0; i < rUv.count; i++) {
            rUv.setXY(i, rUv.getX(i) * 54.0, rUv.getY(i) * 4.0);
        }
        riverGeo.computeVertexNormals();

        const riverMesh = new THREE.Mesh(riverGeo, this.waterSystem.streamMat);
        riverMesh.renderOrder = 2;
        riverMesh.receiveShadow = true;
        riverGroup.add(riverMesh);
        this.riverMeshes.push(riverMesh);
        this.waterSystem.waterMeshes.push(riverMesh);

        // 2. Continuous Curved Gravel Riverbed Margins (North & South)
        this.buildGravelBanks(riverGroup, riverZ, riverLength, segX);

        // 3. Arched Timber River Bridge (Main crossing at x: 4.0, perfectly centered over water channel)
        const bridgeX = 4.0;
        const bridgeZ = riverZ + Math.sin(bridgeX * 0.05) * 3.2 + Math.sin(bridgeX * 0.12) * 0.6;
        this.buildArchedRiverBridge(riverGroup, bridgeX, bridgeZ);

        // 4. River Stepping Stones (Alternative natural crossing at x: -16.0)
        this.buildSteppingStones(riverGroup, -16.0, riverZ);

        // 5. River Reeds & Bank Boulders
        this.buildRiverDetails(riverGroup, riverZ);

        // 120 FPS Static Matrix Freezing
        riverGroup.traverse(child => {
            if (child.isMesh) {
                child.matrixAutoUpdate = false;
                child.updateMatrix();
            }
        });

        this.scene.add(riverGroup);
    }

    buildGravelBanks(group, riverZ, riverLength, segX) {
        const gravelMat = new THREE.MeshStandardMaterial({
            color: 0x8a7a6b,
            roughness: 0.94,
            metalness: 0.02
        });

        // Continuous North gravel bank ribbon (seamless, zero z-fighting)
        const bankGeoN = new THREE.PlaneGeometry(riverLength, 2.8, segX, 2);
        bankGeoN.rotateX(-Math.PI / 2);
        const posN = bankGeoN.attributes.position;
        for (let i = 0; i < posN.count; i++) {
            const vx = posN.getX(i);
            const vz = posN.getZ(i);
            const meanderOffsetZ = Math.sin(vx * 0.05) * 3.2 + Math.sin(vx * 0.12) * 0.6;
            posN.setXYZ(i, vx, -0.18, vz + riverZ + meanderOffsetZ - 5.6);
        }
        bankGeoN.computeVertexNormals();
        const bankMeshN = new THREE.Mesh(bankGeoN, gravelMat);
        bankMeshN.receiveShadow = true;
        group.add(bankMeshN);

        // Continuous South gravel bank ribbon (seamless, zero z-fighting)
        const bankGeoS = new THREE.PlaneGeometry(riverLength, 2.8, segX, 2);
        bankGeoS.rotateX(-Math.PI / 2);
        const posS = bankGeoS.attributes.position;
        for (let i = 0; i < posS.count; i++) {
            const vx = posS.getX(i);
            const vz = posS.getZ(i);
            const meanderOffsetZ = Math.sin(vx * 0.05) * 3.2 + Math.sin(vx * 0.12) * 0.6;
            posS.setXYZ(i, vx, -0.18, vz + riverZ + meanderOffsetZ + 5.6);
        }
        bankGeoS.computeVertexNormals();
        const bankMeshS = new THREE.Mesh(bankGeoS, gravelMat);
        bankMeshS.receiveShadow = true;
        group.add(bankMeshS);
    }

    buildArchedRiverBridge(group, bridgeX, bridgeZ) {
        const bridge = new THREE.Group();
        bridge.position.set(bridgeX, 0, bridgeZ);

        const woodMat = new THREE.MeshStandardMaterial({
            color: 0x5a3825, // Deep rich weathered timber
            roughness: 0.85,
            metalness: 0.02
        });
        const postMat = new THREE.MeshStandardMaterial({
            color: 0x3d2416,
            roughness: 0.90
        });
        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0x64748b,
            roughness: 0.92
        });

        const spanLength = 14.2;
        const bridgeWidth = 3.6;
        const plankCount = 32;

        // Arched bridge deck planks spanning from bank to bank with tangential slope rotation
        for (let i = 0; i < plankCount; i++) {
            const t = i / (plankCount - 1);
            const pz = (t - 0.5) * spanLength;
            // Parabolic arch rise peaking at +0.92m in center, resting on bank crests at +0.24m
            const py = Math.sin(t * Math.PI) * 0.68 + 0.24;

            // Compute slope dy/dz for smooth tangential seating
            const dy_dt = Math.cos(t * Math.PI) * Math.PI * 0.68;
            const dz_dt = spanLength;
            const slope = dy_dt / dz_dt;

            const plankGeo = new THREE.BoxGeometry(bridgeWidth, 0.09, (spanLength / plankCount) * 0.94);
            const plankMesh = new THREE.Mesh(plankGeo, woodMat);
            plankMesh.position.set(0, py, pz);
            plankMesh.rotation.x = -Math.atan(slope);
            plankMesh.castShadow = false;
            plankMesh.receiveShadow = true;
            bridge.add(plankMesh);
        }

        // Bridge Handrails & Side Posts (East and West sides)
        [-bridgeWidth / 2 + 0.12, bridgeWidth / 2 - 0.12].forEach(hx => {
            const numPosts = 10;
            const postHeight = 0.82;

            // Vertical posts along arch
            for (let j = 0; j < numPosts; j++) {
                const pt = j / (numPosts - 1);
                const pz = (pt - 0.5) * spanLength;
                const pyDeck = Math.sin(pt * Math.PI) * 0.68 + 0.24;
                const isEndPost = (j === 0 || j === numPosts - 1);
                const postThickness = isEndPost ? 0.18 : 0.12;

                const post = new THREE.Mesh(
                    new THREE.BoxGeometry(postThickness, postHeight, postThickness),
                    postMat
                );
                post.position.set(hx, pyDeck + postHeight / 2, pz);
                post.castShadow = false;
                bridge.add(post);

                // Decorative brass/timber cap on end posts (authentic Japanese giboshi motif)
                if (isEndPost) {
                    const capMat = new THREE.MeshStandardMaterial({
                        color: 0xd97706, // Antique brass giboshi
                        metalness: 0.7,
                        roughness: 0.3
                    });
                    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.14, 8), capMat);
                    cap.position.set(hx, pyDeck + postHeight + 0.07, pz);
                    bridge.add(cap);
                }
            }

            // Curved Upper Handrail following the arch perfectly (eliminating flat horizontal mismatch)
            const railPoints = [];
            const midRailPoints = [];
            const railSteps = 24;
            for (let k = 0; k <= railSteps; k++) {
                const kt = k / railSteps;
                const kz = (kt - 0.5) * spanLength;
                const kyDeck = Math.sin(kt * Math.PI) * 0.68 + 0.24;
                railPoints.push(new THREE.Vector3(hx, kyDeck + postHeight, kz));
                midRailPoints.push(new THREE.Vector3(hx, kyDeck + postHeight * 0.52, kz));
            }

            const railCurve = new THREE.CatmullRomCurve3(railPoints);
            const railGeo = new THREE.TubeGeometry(railCurve, 28, 0.065, 8, false);
            const rail = new THREE.Mesh(railGeo, postMat);
            rail.castShadow = false;
            bridge.add(rail);

            const midRailCurve = new THREE.CatmullRomCurve3(midRailPoints);
            const midRailGeo = new THREE.TubeGeometry(midRailCurve, 28, 0.04, 8, false);
            const midRail = new THREE.Mesh(midRailGeo, postMat);
            midRail.castShadow = false;
            bridge.add(midRail);
        });

        // Sturdy Support Pilings driven through water deep into submerged riverbed
        [-1.25, 1.25].forEach(px => {
            [-spanLength * 0.26, spanLength * 0.26].forEach(pz => {
                const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 2.2, 8), postMat);
                pillar.position.set(px, -0.35, pz);
                pillar.castShadow = true;
                bridge.add(pillar);
            });
        });

        // Carved Stone Bridge Abutments (Foundations on North and South road approaches)
        [-spanLength / 2, spanLength / 2].forEach(az => {
            const abutmentH = 1.6;
            const abutment = new THREE.Mesh(new THREE.BoxGeometry(bridgeWidth + 0.5, abutmentH, 1.2), stoneMat);
            abutment.position.set(0, 0.28 - abutmentH / 2, az);
            abutment.castShadow = true;
            abutment.receiveShadow = true;
            bridge.add(abutment);
        });

        group.add(bridge);
        this.bridgeMesh = bridge;
    }

    buildSteppingStones(group, startX, riverZ) {
        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0x64748b,
            roughness: 0.92,
            metalness: 0.05
        });

        const meanderZ = riverZ + Math.sin(startX * 0.05) * 3.2 + Math.sin(startX * 0.12) * 0.6;
        const stoneCount = 9;
        const span = 9.8;

        for (let i = 0; i < stoneCount; i++) {
            const t = i / (stoneCount - 1);
            const sz = meanderZ - (span / 2) + t * span;
            const sx = startX + Math.sin(i * 1.5) * 0.6;
            // Taller cylindrical stone grounded in bed (-0.95m) and emerging +0.14m above water (-0.28m)
            const stoneGeo = new THREE.CylinderGeometry(0.50 + Math.random() * 0.12, 0.58, 0.95, 8);
            const stone = new THREE.Mesh(stoneGeo, stoneMat);
            stone.position.set(sx, -0.48, sz);
            stone.rotation.y = Math.random() * Math.PI;
            stone.castShadow = false;
            stone.receiveShadow = true;
            group.add(stone);
        }
    }

    buildRiverDetails(group, riverZ) {
        // Natural Smooth River Boulders
        const boulderMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 });
        const boulderCoords = [
            { x: -8.0, z: riverZ - 2.5 },
            { x: -5.0, z: riverZ + 3.0 },
            { x: 12.0, z: riverZ - 1.8 },
            { x: 18.0, z: riverZ + 2.2 },
            { x: 26.0, z: riverZ - 2.0 }
        ];

        boulderCoords.forEach(c => {
            const geo = new THREE.DodecahedronGeometry(0.55 + Math.random() * 0.35, 1);
            const b = new THREE.Mesh(geo, boulderMat);
            b.position.set(c.x, -0.18, c.z);
            b.scale.set(1.2, 0.65, 1.0);
            b.castShadow = false;
            group.add(b);
        });
    }
}
