import * as THREE from '/vendor/three/build/three.module.js';

/**
 * RICE FIELD SYSTEM (RUỘNG BẬC THANG & MƯƠNG TIÊU NƯỚC NÔNG THÔN NHẬT BẢN)
 * - Modern rural Japanese precast concrete drainage channel (U-channel flume)
 * - Closed trapezoidal earthen dikes (Aze 畦) concealing all water boundaries
 * - Structurally grounded timber footbridge perpendicular to canal
 * - Stylized young rice seedlings
 */
export class RiceFieldSystem {
    constructor(scene, waterSystem, terrainSystem) {
        this.scene = scene;
        this.waterSystem = waterSystem;
        this.terrainSystem = terrainSystem;
        this.seedlingInstancedMeshes = [];
        this.paddies = [];
        this.canalSegments = [];
        this.bridgeMesh = null;
        this.foliageProfile = 'pc';
    }

    build() {
        const startIdx = this.scene ? this.scene.children.length : 0;
        // 1. Nine Continuous Stepped Flooded Rice Terraces in Southwest Agricultural Plain (3x3 Grid)
        this.paddies = [
            // Tier 1 (Canal-side terraces - Lower Terrace in Southwest)
            { id: 'paddy_t1_north',   x: -16.175, z: -3.325,  w: 7.55, d: 8.65, density: 9, tint: 0x84cc16 },
            { id: 'paddy_t1_central', x: -16.175, z:  5.0,    w: 7.55, d: 8.65, density: 9, tint: 0x65a30d },
            { id: 'paddy_t1_south',   x: -16.175, z: 13.325,  w: 7.55, d: 8.65, density: 8, tint: 0x84cc16 },

            // Tier 2 (Mid-slope terraces - Middle Terrace in Southwest)
            { id: 'paddy_t2_north',   x: -23.975, z: -3.325,  w: 8.45, d: 8.65, density: 8, tint: 0xa3e635 },
            { id: 'paddy_t2_central', x: -23.975, z:  5.0,    w: 8.45, d: 8.65, density: 9, tint: 0x84cc16 },
            { id: 'paddy_t2_south',   x: -23.975, z: 13.325,  w: 8.45, d: 8.65, density: 9, tint: 0x65a30d },

            // Tier 3 (Upper hillside terraces - Top Terrace in Southwest)
            { id: 'paddy_t3_north',   x: -32.30,  z: -3.325,  w: 8.60, d: 8.65, density: 8, tint: 0x84cc16 },
            { id: 'paddy_t3_central', x: -32.30,  z:  5.0,    w: 8.60, d: 8.65, density: 8, tint: 0x65a30d },
            { id: 'paddy_t3_south',   x: -32.30,  z: 13.325,  w: 8.60, d: 8.65, density: 8, tint: 0xa3e635 }
        ];

        // Shared fertile flooded mud material with procedural alluvial silt texture and wet sheen
        const mudCanvas = document.createElement('canvas');
        mudCanvas.width = 128;
        mudCanvas.height = 128;
        const mctx = mudCanvas.getContext('2d');
        mctx.fillStyle = '#2d1e13';
        mctx.fillRect(0, 0, 128, 128);

        // Organic wet silt variations and subtle fine soil stippling
        for (let i = 0; i < 80; i++) {
            const mx = Math.random() * 128;
            const my = Math.random() * 128;
            const mr = 4 + Math.random() * 10;
            const mgrad = mctx.createRadialGradient(mx, my, 1, mx, my, mr);
            mgrad.addColorStop(0, 'rgba(24, 15, 9, 0.45)');
            mgrad.addColorStop(0.7, 'rgba(38, 25, 16, 0.20)');
            mgrad.addColorStop(1, 'rgba(45, 30, 19, 0)');
            mctx.fillStyle = mgrad;
            mctx.beginPath();
            mctx.arc(mx, my, mr, 0, Math.PI * 2);
            mctx.fill();
        }

        const mudTex = new THREE.CanvasTexture(mudCanvas);
        mudTex.wrapS = THREE.RepeatWrapping;
        mudTex.wrapT = THREE.RepeatWrapping;
        mudTex.repeat.set(4, 4);

        const mudMat = new THREE.MeshStandardMaterial({
            map: mudTex,
            color: 0x3d2a1c,
            roughness: 0.88,
            metalness: 0.08
        });

        this.paddies.forEach(p => {
            const th = this.terrainSystem.getTerrainHeight(p.x, p.z);
            // Stepped water plane sits comfortably above the flat terrace basin (+0.08m)
            p.yWater = th + 0.08;

            // Water sheet and alluvial soil bed extend under the earthen bunds, sealing completely without black gaps
            const waterW = p.w + 0.12;
            const waterD = p.d + 0.12;

            // Sunken alluvial soil bed resting directly under the water sheet
            const mudGeo = new THREE.PlaneGeometry(waterW, waterD);
            mudGeo.rotateX(-Math.PI / 2);
            const mudMesh = new THREE.Mesh(mudGeo, mudMat);
            mudMesh.position.set(p.x, p.yWater - 0.035, p.z);
            mudMesh.receiveShadow = true;
            this.scene.add(mudMesh);

            // Shimmering reflective water plane spanning the terrace, sealed under the berm perimeter
            this.waterSystem.createPaddyWater(waterW, waterD, p.x, p.yWater, p.z);

            // Plant lush, clustered rice bushes with golden ripening heads in agricultural rows
            this.plantRiceSeedlings(p);
        });

        // 2. Continuous Sloped Earthen Field Bunds (Aze 畦 - Bờ Ruộng Giữ Nước Khép Kín)
        this.buildTrapezoidalBerms();

        // 3. Modern Precast Concrete Drainage Flume (Mương Tiêu Nước Bê Tông Nhật Bản)
        this.buildConcreteDrainageFlume();

        // 4. Grounded Timber Footbridge (Cầu Gỗ Bắc Ngang Mương)
        this.buildPerpendicularFootbridge();

        // 120 FPS Static Matrix Freezing & Shadow Pruning
        if (this.scene && this.scene.children) {
            for (let i = startIdx; i < this.scene.children.length; i++) {
                const obj = this.scene.children[i];
                if (!obj) continue;
                obj.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = false;
                    }
                    child.matrixAutoUpdate = false;
                    child.updateMatrix();
                });
            }
        }
    }
    /**
     * Build continuous shared earthen bund network (Aze) enclosing every terrace with 0 gaps
     */
    buildTrapezoidalBerms() {
        const bermCanvas = document.createElement('canvas');
        bermCanvas.width = 128;
        bermCanvas.height = 128;
        const bctx = bermCanvas.getContext('2d');
        bctx.fillStyle = '#476326';
        bctx.fillRect(0, 0, 128, 128);

        // Compacted earthen footpath with short turf stippling and rich loam variation
        for (let i = 0; i < 90; i++) {
            const bx = Math.random() * 128;
            const by = Math.random() * 128;
            const br = 2 + Math.random() * 6;
            bctx.fillStyle = (i % 3 === 0) ? '#384d1e' : ((i % 3 === 1) ? '#5c7a2b' : '#4a3828');
            bctx.beginPath();
            bctx.arc(bx, by, br, 0, Math.PI * 2);
            bctx.fill();
        }

        const bermTex = new THREE.CanvasTexture(bermCanvas);
        bermTex.wrapS = THREE.RepeatWrapping;
        bermTex.wrapT = THREE.RepeatWrapping;
        bermTex.repeat.set(2, 6);

        const bermMat = new THREE.MeshStandardMaterial({
            map: bermTex,
            color: 0x5a862e, // Authentic agricultural grassy earthen bund
            roughness: 0.85,
            metalness: 0.02
        });
        const woodGateMat = new THREE.MeshStandardMaterial({
            color: 0x5a3d28, // Weathered timber sluice gate
            roughness: 0.85
        });

        const bermH = 0.18; // Sits above water surface
        const crestW = 0.52; // Authentic walking ridge width (Aze-michi)

        // North-South longitudinal continuous ridges (Span from z = -7.6 to z = 17.6, total 25.2m, centered at z = 5.0)
        const longitudinalRidges = [
            // East canal retaining ridge (Tier 1 east boundary)
            { x: -12.50, z: 5.0, w: crestW, d: 25.2, h: 0.28, y: -0.04 },
            // Tier 1-2 dividing retaining dike (Spans step from Tier 1 -0.08m to Tier 2 +0.16m)
            { x: -19.85, z: 5.0, w: 0.58,   d: 25.2, h: 0.52, y:  0.08 },
            // Tier 2-3 dividing retaining dike (Spans step from Tier 2 +0.16m to Tier 3 +0.42m)
            { x: -28.10, z: 5.0, w: 0.58,   d: 25.2, h: 0.54, y:  0.32 },
            // Western perimeter retaining ridge (Tier 3 west boundary)
            { x: -36.50, z: 5.0, w: crestW, d: 25.2, h: 0.28, y:  0.48 }
        ];

        longitudinalRidges.forEach(r => {
            const geo = new THREE.BoxGeometry(r.w, r.h, r.d);
            const mesh = new THREE.Mesh(geo, bermMat);
            mesh.position.set(r.x, r.y, r.z);
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        });

        // East-West latitudinal cross ridges segmented per tier to match stepped shelf elevations
        const zLines = [-7.4, 0.75, 9.25, 17.4];
        zLines.forEach(z => {
            // Tier 1 cross ridge segment (Lower terrace)
            const geoT1 = new THREE.BoxGeometry(7.55, 0.26, crestW);
            const meshT1 = new THREE.Mesh(geoT1, bermMat);
            meshT1.position.set(-16.175, -0.04, z);
            meshT1.receiveShadow = true;
            this.scene.add(meshT1);

            // Tier 2 cross ridge segment (Middle terrace)
            const geoT2 = new THREE.BoxGeometry(8.45, 0.26, crestW);
            const meshT2 = new THREE.Mesh(geoT2, bermMat);
            meshT2.position.set(-23.975, 0.20, z);
            meshT2.receiveShadow = true;
            this.scene.add(meshT2);

            // Tier 3 cross ridge segment (Upper terrace)
            const geoT3 = new THREE.BoxGeometry(8.60, 0.26, crestW);
            const meshT3 = new THREE.Mesh(geoT3, bermMat);
            meshT3.position.set(-32.30, 0.46, z);
            meshT3.receiveShadow = true;
            this.scene.add(meshT3);
        });

        // Wooden irrigation sluice gates (Tonbo) connecting terrace tiers
        const sluiceLocations = [
            { x: -12.50, z:  5.0, y: -0.04 }, // Canal drain
            { x: -19.85, z:  5.0, y:  0.10 }, // Tier 2 -> 1
            { x: -28.10, z:  5.0, y:  0.34 }, // Tier 3 -> 2
            { x: -12.50, z: 13.5, y: -0.04 }, // South canal drain
            { x: -19.85, z: 13.5, y:  0.10 }  // South Tier 2 -> 1
        ];

        sluiceLocations.forEach(loc => {
            const gateGroup = new THREE.Group();
            gateGroup.position.set(loc.x, loc.y + 0.08, loc.z);

            // Side timber guide posts
            [-0.22, 0.22].forEach(gz => {
                const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.08), woodGateMat);
                post.position.set(0, 0, gz);
                post.castShadow = true;
                gateGroup.add(post);
            });
            // Sluice board
            const board = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.40), woodGateMat);
            board.position.set(0, -0.04, 0);
            board.castShadow = true;
            gateGroup.add(board);

            this.scene.add(gateGroup);
        });
    }

    /**
     * Modern Rural Japanese Precast Concrete Flume (Segmented to follow terrain slope)
     */
    buildConcreteDrainageFlume() {
        // Texture: Weathered precast concrete with subtle moss & water stains
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#838e9b';
        ctx.fillRect(0, 0, 256, 256);

        // Weathering patina and moss patches
        for (let i = 0; i < 40; i++) {
            ctx.fillStyle = Math.random() > 0.4 ? 'rgba(65, 85, 55, 0.28)' : 'rgba(95, 105, 115, 0.35)';
            ctx.fillRect(Math.random() * 256, Math.random() * 256, 12 + Math.random() * 35, 10 + Math.random() * 25);
        }

        const concreteTex = new THREE.CanvasTexture(canvas);
        concreteTex.wrapS = THREE.RepeatWrapping;
        concreteTex.wrapT = THREE.RepeatWrapping;

        const concreteMat = new THREE.MeshStandardMaterial({
            map: concreteTex,
            roughness: 0.88,
            metalness: 0.04
        });

        const waterBedMat = new THREE.MeshStandardMaterial({
            color: 0x475569,
            roughness: 0.92
        });

        // Modular segments from z = 17.6 to z = -7.6 (length 25.2m along Tier 1 Eastern perimeter)
        const zStart = 17.6;
        const zEnd = -7.6;
        const segCount = 14;
        const segLen = (zStart - zEnd) / segCount; // ~1.8m per module

        const flumeGroup = new THREE.Group();

        // Dimensions (per spec)
        const wallThick = 0.20;
        const chWidth = 0.86;
        const chDepth = 0.22;
        const totalW = chWidth + wallThick * 2;
        const flumeX = -11.80;

        for (let i = 0; i < segCount; i++) {
            const z = zStart - (i + 0.5) * segLen;
            const yTerrain = this.terrainSystem.getTerrainHeight(flumeX, z);

            const segGroup = new THREE.Group();
            segGroup.position.set(flumeX, yTerrain, z);

            // Channel Bed (Bottom slab)
            const bedGeo = new THREE.BoxGeometry(totalW, 0.08, segLen + 0.04);
            const bed = new THREE.Mesh(bedGeo, waterBedMat);
            bed.position.y = -chDepth;
            segGroup.add(bed);

            // Left Concrete Wall (Facing rice fields to the west)
            const wallLGeo = new THREE.BoxGeometry(wallThick, chDepth + 0.04, segLen + 0.04);
            const wallL = new THREE.Mesh(wallLGeo, concreteMat);
            wallL.position.set(-chWidth / 2 - wallThick / 2, -(chDepth - 0.04) / 2, 0);
            wallL.receiveShadow = true;
            segGroup.add(wallL);

            // Right Concrete Wall (Facing eastern shoulder)
            const wallRGeo = new THREE.BoxGeometry(wallThick, chDepth + 0.04, segLen + 0.04);
            const wallR = new THREE.Mesh(wallRGeo, concreteMat);
            wallR.position.set(chWidth / 2 + wallThick / 2, -(chDepth - 0.04) / 2, 0);
            wallR.receiveShadow = true;
            segGroup.add(wallR);

            flumeGroup.add(segGroup);

            // Save segment position for surface detection
            this.canalSegments.push({ x: flumeX, z, y: yTerrain, width: totalW });
        }

        this.scene.add(flumeGroup);

        // Stream water flowing inside the channel trough
        this.waterSystem.createStreamWater(chWidth * 0.92, 25.2, flumeX, -0.06, 5.0, 0);
    }

    /**
     * Grounded Timber Footbridge perpendicular to canal
     */
    buildPerpendicularFootbridge() {
        const bridgeGroup = new THREE.Group();

        // Location: crossings at z = 5.0 (connecting farm path at x = -10.8 to central terrace ridge at x = -12.5)
        const bz = 5.0;
        const bx = -11.80; // Center of canal at z = 5.0
        const by = this.terrainSystem.getTerrainHeight(bx, bz);

        bridgeGroup.position.set(bx, by + 0.02, bz);

        const woodMat = new THREE.MeshStandardMaterial({
            color: 0x63452c, // Weathered Japanese cedar
            roughness: 0.88,
            metalness: 0.02
        });

        const span = 2.0; // Spans across the 1.26m flume onto both banks (x: -12.8 to -10.8)
        const bridgeW = 1.40; // Along Z (z: 4.3 to 5.7)
        const plankCount = 10;

        // Planks laid across the span in X direction
        for (let i = 0; i < plankCount; i++) {
            const pz = -bridgeW / 2 + (i + 0.5) * (bridgeW / plankCount);
            const plankGeo = new THREE.BoxGeometry(span, 0.05, bridgeW / plankCount - 0.02);
            const plank = new THREE.Mesh(plankGeo, woodMat);
            plank.position.set(0, 0.03, pz);
            plank.castShadow = true;
            plank.receiveShadow = true;
            bridgeGroup.add(plank);
        }

        // Side Support Beams (Stringers)
        const stringerGeo = new THREE.BoxGeometry(span + 0.1, 0.08, 0.08);
        const str1 = new THREE.Mesh(stringerGeo, woodMat);
        str1.position.set(0, -0.03, -bridgeW / 2 + 0.05);
        bridgeGroup.add(str1);

        const str2 = new THREE.Mesh(stringerGeo, woodMat);
        str2.position.set(0, -0.03, bridgeW / 2 - 0.05);
        bridgeGroup.add(str2);

        // Low rustic timber guide rails
        const postGeo = new THREE.BoxGeometry(0.08, 0.45, 0.08);
        const railGeo = new THREE.BoxGeometry(span + 0.1, 0.05, 0.05);

        [-bridgeW / 2 + 0.05, bridgeW / 2 - 0.05].forEach(sideZ => {
            const pL = new THREE.Mesh(postGeo, woodMat);
            pL.position.set(-span / 2 + 0.1, 0.22, sideZ);
            bridgeGroup.add(pL);

            const pR = new THREE.Mesh(postGeo, woodMat);
            pR.position.set(span / 2 - 0.1, 0.22, sideZ);
            bridgeGroup.add(pR);

            const rail = new THREE.Mesh(railGeo, woodMat);
            rail.position.set(0, 0.42, sideZ);
            bridgeGroup.add(rail);
        });

        this.bridgeMesh = bridgeGroup;
        this.scene.add(bridgeGroup);
    }

    /**
     * Plant lush, stylized anime rice clumps (Kabu 株) with vibrant chartreuse blades & golden tips
     */
    plantRiceSeedlings(paddy) {
        // Multi-blade radiating rice clump geometry
        const clumpGeo = new THREE.BufferGeometry();
        const positions = [];
        const uvs = [];
        const normals = [];

        // 8 arched blades fanning outward from base
        const bladeCount = 8;
        for (let b = 0; b < bladeCount; b++) {
            const angle = (b / bladeCount) * Math.PI * 2 + (Math.sin(b * 1.7) * 0.15);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const perpX = -sin;
            const perpZ = cos;

            const isInner = (b % 2 === 0);
            const bladeH = isInner ? 0.38 : 0.30;
            const archOut = isInner ? 0.12 : 0.18;
            const halfW1 = 0.024;
            const halfW2 = 0.018;

            // Segment 0: Base at water line
            const p0L = [ -halfW1 * perpX, 0, -halfW1 * perpZ ];
            const p0R = [  halfW1 * perpX, 0,  halfW1 * perpZ ];

            // Segment 1: Mid-arch
            const midH = bladeH * 0.58;
            const midArch = archOut * 0.45;
            const midCx = cos * midArch;
            const midCz = sin * midArch;
            const p1L = [ midCx - halfW2 * perpX, midH, midCz - halfW2 * perpZ ];
            const p1R = [ midCx + halfW2 * perpX, midH, midCz + halfW2 * perpZ ];

            // Segment 2: Drooping Tip with ripening head
            const tipCx = cos * archOut;
            const tipCz = sin * archOut;
            const tipH = bladeH;
            const p2Tip = [ tipCx, tipH, tipCz ];

            // Quad 1 (Base to Mid): 2 triangles
            positions.push(
                p0L[0], p0L[1], p0L[2],  p0R[0], p0R[1], p0R[2],  p1R[0], p1R[1], p1R[2],
                p0L[0], p0L[1], p0L[2],  p1R[0], p1R[1], p1R[2],  p1L[0], p1L[1], p1L[2]
            );
            uvs.push(0, 0,  1, 0,  1, 0.6,   0, 0,  1, 0.6,  0, 0.6);

            // Triangle 2 (Mid to Tip)
            positions.push(
                p1L[0], p1L[1], p1L[2],  p1R[0], p1R[1], p1R[2],  p2Tip[0], p2Tip[1], p2Tip[2]
            );
            uvs.push(0, 0.6,  1, 0.6,  0.5, 1.0);
        }

        clumpGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        clumpGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        clumpGeo.computeVertexNormals();

        // Stylized anime watercolor texture with golden ripening tips
        if (!this.riceTexture) {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');

            const grad = ctx.createLinearGradient(0, 128, 0, 0);
            grad.addColorStop(0.0, '#365314'); // Rich deep root stem green
            grad.addColorStop(0.35, '#65a30d'); // Spring paddy green
            grad.addColorStop(0.70, '#84cc16'); // Vibrant sunlit chartreuse
            grad.addColorStop(0.92, '#eab308'); // Warm golden grain head
            grad.addColorStop(1.0, '#fef08a'); // Bright golden sunlit tip
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 64, 128);

            this.riceTexture = new THREE.CanvasTexture(canvas);
        }

        const mat = new THREE.MeshStandardMaterial({
            map: this.riceTexture,
            color: paddy.tint,
            roughness: 0.62,
            metalness: 0.04,
            side: THREE.DoubleSide
        });

        let stepX = 0.42;
        let stepZ = 0.45;
        let castShadow = false; // Argon Optimization: Rice seedlings receive shadows but do not cast, saving shadow pass rasterization
        let receiveShadow = true;

        if (this.foliageProfile === 'web') {
            stepX = 0.50;
            stepZ = 0.54;
            castShadow = false;
            receiveShadow = true;
        } else if (this.foliageProfile === 'mobile') {
            stepX = 0.64;
            stepZ = 0.68;
            castShadow = false;
            receiveShadow = false;
        }

        const cols = Math.floor((paddy.w - 1.2) / stepX);
        const rows = Math.floor((paddy.d - 1.2) / stepZ);
        const count = rows * cols;
        const instMesh = new THREE.InstancedMesh(clumpGeo, mat, count);
        instMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage); // GPU VRAM cache
        instMesh.matrixAutoUpdate = false;
        const dummy = new THREE.Object3D();

        const startX = paddy.x - ((cols - 1) * stepX) / 2;
        const startZ = paddy.z - ((rows - 1) * stepZ) / 2;

        let idx = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                // Subtle organic transplanting jitter
                const rx = startX + c * stepX + (Math.sin(r * 2.3 + c) * 0.06);
                const rz = startZ + r * stepZ + (Math.cos(r + c * 1.8) * 0.06);
                const ry = paddy.yWater - 0.015;

                const scale = 0.92 + (Math.sin(r * 3 + c * 5) * 0.15);
                dummy.position.set(rx, ry, rz);
                dummy.rotation.y = (r * 1.5 + c * 2.2);
                dummy.scale.set(scale, scale, scale);
                dummy.updateMatrix();

                instMesh.setMatrixAt(idx++, dummy.matrix);
            }
        }

        instMesh.instanceMatrix.needsUpdate = true;
        instMesh.castShadow = castShadow;
        instMesh.receiveShadow = receiveShadow;

        // Accurate world-space bounding sphere for 100% reliable Three.js frustum culling
        const paddyCenter = new THREE.Vector3(paddy.x, paddy.yWater, paddy.z);
        const paddyRadius = Math.hypot(paddy.w, paddy.d) * 0.65;
        instMesh.geometry.boundingSphere = new THREE.Sphere(paddyCenter, paddyRadius);

        this.scene.add(instMesh);
        this.seedlingInstancedMeshes.push(instMesh);
    }

    /**
     * Dynamically adapt rice density tier across hardware profiles (PC / Web / Mobile)
     * @param {'pc' | 'web' | 'mobile'} profile 
     */
    setFoliageProfile(profile) {
        if (!['pc', 'web', 'mobile'].includes(profile) || this.foliageProfile === profile) return;
        this.foliageProfile = profile;

        // Remove existing instances and re-seed with adapted density
        this.seedlingInstancedMeshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
        });
        this.seedlingInstancedMeshes = [];

        this.paddies.forEach(p => this.plantRiceSeedlings(p));
        console.log(`[RiceFieldSystem] Re-seeded paddies for profile: ${profile.toUpperCase()} (${this.seedlingInstancedMeshes.reduce((a, m) => a + m.count, 0)} total clumps)`);
    }
}

