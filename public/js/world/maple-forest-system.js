import * as THREE from 'three';

/**
 * AUTUMN MAPLE VALLEY SYSTEM (THUNG LŨNG PHONG ĐỎ MÙA THU ĐÔNG BẮC)
 * Northeast Biome: x in [18, 52], z in [-45, -15]
 * Features:
 * - 80+ Instanced Japanese Maple Trees (Momiji) with cascading autumn canopies
 * - Multi-tiered foliage in rich red, vermilion, amber, and golden-orange hues
 * - Natural stony stream channel & rustic wooden footbridge
 * - Drifting autumn maple leaf particle effect
 */
export class MapleForestSystem {
    constructor(scene, terrainSystem, waterSystem = null) {
        this.scene = scene;
        this.terrain = terrainSystem;
        this.waterSystem = waterSystem;
        this.trunkMesh = null;
        this.tier1Mesh = null;
        this.tier2Mesh = null;
        this.tier3Mesh = null;
        this.tier4Mesh = null;
        this.particles = null;
        this.streamMeshes = [];
        this.footbridgeMesh = null;
        this.count = 90;
    }

    isNearTrail(x, z, clearance = 3.8) {
        const trailSegments = [
            // 1. Hilltop Trail passing through Maple Valley
            [{ x: 10.8, z: -17.5 }, { x: 14.5, z: -21.5 }],
            [{ x: 14.5, z: -21.5 }, { x: 22.0, z: -23.5 }],
            [{ x: 22.0, z: -23.5 }, { x: 27.5, z: -26.0 }],
            [{ x: 27.5, z: -26.0 }, { x: 31.5, z: -35.0 }],
            [{ x: 31.5, z: -35.0 }, { x: 32.6, z: -43.8 }],
            // 2. Maple Valley branch spur towards picnic glade & footbridge
            [{ x: 26.0, z: -22.0 }, { x: 31.0, z: -25.5 }],
            [{ x: 31.0, z: -25.5 }, { x: 34.5, z: -28.0 }],
            [{ x: 34.5, z: -28.0 }, { x: 44.0, z: -28.0 }]
        ];
        for (const [p1, p2] of trailSegments) {
            const l2 = (p2.x - p1.x) ** 2 + (p2.z - p1.z) ** 2;
            if (l2 === 0) continue;
            const t = Math.max(0, Math.min(1, ((x - p1.x) * (p2.x - p1.x) + (z - p1.z) * (p2.z - p1.z)) / l2));
            const px = p1.x + t * (p2.x - p1.x);
            const pz = p1.z + t * (p2.z - p1.z);
            if (Math.hypot(x - px, z - pz) < clearance) return true;
        }
        return false;
    }

    build() {
        const mapleGroup = new THREE.Group();
        mapleGroup.name = 'MapleForestSystem';

        // 1. Materials
        const barkMat = new THREE.MeshStandardMaterial({
            color: 0x4a3728, // Weathered dark maple bark
            roughness: 0.88,
            shadowSide: THREE.DoubleSide
        });

        // Procedural watercolor momiji leaf pattern texture for rich painterly foliage
        const leafCanvas = document.createElement('canvas');
        leafCanvas.width = 128;
        leafCanvas.height = 128;
        const lctx = leafCanvas.getContext('2d');
        lctx.fillStyle = '#ffffff';
        lctx.fillRect(0, 0, 128, 128);
        for (let i = 0; i < 28; i++) {
            const cx = Math.random() * 128;
            const cy = Math.random() * 128;
            const r = 8 + Math.random() * 16;
            const grad = lctx.createRadialGradient(cx, cy, 2, cx, cy, r);
            grad.addColorStop(0, 'rgba(255, 230, 200, 0.45)');
            grad.addColorStop(0.5, 'rgba(230, 200, 180, 0.22)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            lctx.fillStyle = grad;
            lctx.beginPath();
            lctx.arc(cx, cy, r, 0, Math.PI * 2);
            lctx.fill();
        }
        const leafTex = new THREE.CanvasTexture(leafCanvas);
        leafTex.wrapS = THREE.RepeatWrapping;
        leafTex.wrapT = THREE.RepeatWrapping;
        leafTex.repeat.set(3, 3);

        // Vibrant autumn foliage palettes with subtle watercolor relief
        const redMat = new THREE.MeshStandardMaterial({
            color: 0xdc2626, // Crimson red
            roughness: 0.68,
            metalness: 0.02,
            bumpMap: leafTex,
            bumpScale: 0.035,
            shadowSide: THREE.DoubleSide
        });

        const amberMat = new THREE.MeshStandardMaterial({
            color: 0xea580c, // Fiery orange/amber
            roughness: 0.70,
            metalness: 0.02,
            bumpMap: leafTex,
            bumpScale: 0.035,
            shadowSide: THREE.DoubleSide
        });

        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, // Golden saffron
            roughness: 0.72,
            metalness: 0.02,
            bumpMap: leafTex,
            bumpScale: 0.035,
            shadowSide: THREE.DoubleSide
        });

        const wineMat = new THREE.MeshStandardMaterial({
            color: 0x991b1b, // Deep scarlet burgundy
            roughness: 0.68,
            metalness: 0.02,
            bumpMap: leafTex,
            bumpScale: 0.035,
            shadowSide: THREE.DoubleSide
        });

        // Helper: Self-contained zero-dependency buffer geometry merger
        const mergeGeos = (geos) => {
            const merged = new THREE.BufferGeometry();
            const positions = [];
            const normals = [];
            for (const g of geos) {
                const nonIndexed = g.index ? g.toNonIndexed() : g;
                const pos = nonIndexed.attributes.position;
                const norm = nonIndexed.attributes.normal;
                for (let i = 0; i < pos.count; i++) {
                    positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
                    if (norm) {
                        normals.push(norm.getX(i), norm.getY(i), norm.getZ(i));
                    } else {
                        normals.push(0, 1, 0);
                    }
                }
            }
            merged.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            merged.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
            return merged;
        };

        // 2. Geometry: Sculpted Branching Bonsai Armature (Base trunk + flared collar + 3 spreading boughs)
        const baseTrunk = new THREE.CylinderGeometry(0.14, 0.24, 2.2, 8);
        baseTrunk.translate(0, 1.1, 0);

        const flare = new THREE.CylinderGeometry(0.24, 0.44, 0.48, 8);
        flare.translate(0, 0.24, 0);

        const b1 = new THREE.CylinderGeometry(0.08, 0.13, 1.8, 6);
        b1.rotateZ(0.65);
        b1.rotateY(0.4);
        b1.translate(-0.55, 2.0, 0.15);

        const b2 = new THREE.CylinderGeometry(0.08, 0.13, 1.9, 6);
        b2.rotateZ(-0.62);
        b2.rotateY(-0.5);
        b2.translate(0.60, 2.2, -0.20);

        const b3 = new THREE.CylinderGeometry(0.07, 0.12, 1.7, 6);
        b3.rotateX(-0.35);
        b3.rotateZ(0.2);
        b3.translate(0.08, 2.9, 0.28);

        const trunkGeo = mergeGeos([baseTrunk, flare, b1, b2, b3]);

        // Helper: Organic Momiji ruffled fan foliage pad with serrated leaf perimeter
        const createMomijiFanGeo = (rx, ry, rz) => {
            const geo = new THREE.DodecahedronGeometry(1.0, 1);
            geo.scale(rx, ry, rz);
            const pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const vx = pos.getX(i);
                const vy = pos.getY(i);
                const vz = pos.getZ(i);
                const angle = Math.atan2(vz, vx);
                const noise = 1.0 + Math.sin(angle * 7.0) * 0.12 + Math.cos(vy * 6.0) * 0.08;
                pos.setXYZ(i, vx * noise, vy * (0.92 + Math.sin(vx * 4.0) * 0.08), vz * noise);
            }
            geo.computeVertexNormals();
            return geo;
        };

        const tier1Geo = createMomijiFanGeo(2.5, 0.55, 2.2);
        const tier2Geo = createMomijiFanGeo(2.2, 0.50, 1.9);
        const tier3Geo = createMomijiFanGeo(1.9, 0.46, 1.7);
        const tier4Geo = createMomijiFanGeo(1.6, 0.42, 1.4);

        // 3. Instanced Meshes
        this.trunkMesh = new THREE.InstancedMesh(trunkGeo, barkMat, this.count);
        this.trunkMesh.castShadow = true;
        this.trunkMesh.receiveShadow = true;

        this.tier1Mesh = new THREE.InstancedMesh(tier1Geo, redMat, this.count);
        this.tier1Mesh.castShadow = true;
        this.tier1Mesh.receiveShadow = true;

        this.tier2Mesh = new THREE.InstancedMesh(tier2Geo, amberMat, this.count);
        this.tier2Mesh.castShadow = true;
        this.tier2Mesh.receiveShadow = true;

        this.tier3Mesh = new THREE.InstancedMesh(tier3Geo, goldMat, this.count);
        this.tier3Mesh.castShadow = true;
        this.tier3Mesh.receiveShadow = true;

        this.tier4Mesh = new THREE.InstancedMesh(tier4Geo, wineMat, this.count);
        this.tier4Mesh.castShadow = true;
        this.tier4Mesh.receiveShadow = true;

        const dummy = new THREE.Object3D();

        // 4. Distribution across Northeast Maple Valley (x: [20, 50], z: [-44, -16])
        let seed = 1337;
        const rnd = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };

        let placed = 0;
        for (let i = 0; i < this.count; i++) {
            // Clustered across slopes and stream banks
            const mx = 20.0 + rnd() * 30.0;
            const mz = -44.0 + rnd() * 28.0;

            // Stream corridor clearance: stream center is at 32.0 + sin(mz * 0.18) * 3.5
            const streamCenter = 32.0 + Math.sin(mz * 0.18) * 3.5;
            const distToStream = Math.abs(mx - streamCenter);

            // Avoid planting directly inside stream bed
            if (distToStream < 1.6) {
                continue;
            }

            // Path Clearance: Ensure 2.6m clearance along walking paths (Hilltop Trail & Maple Branch)
            if (this.isNearTrail(mx, mz, 2.6)) {
                continue;
            }

            // Avoid Tea Table Area at (42.0, -32.0)
            const distToPicnic = Math.hypot(mx - 42.0, mz - -32.0);
            if (distToPicnic < 3.8) {
                continue;
            }

            // Avoid Stream Viewing Bench Clearing at (37.0, -23.5)
            const distToBench = Math.hypot(mx - 37.0, mz - -23.5);
            if (distToBench < 2.8) {
                continue;
            }

            const my = this.terrain.getTerrainHeight(mx, mz);
            const scale = 0.85 + rnd() * 0.35;
            const rotY = rnd() * Math.PI * 2;
            const tilt = (rnd() - 0.5) * 0.16;

            // Sculpted Multi-Branch Trunk
            dummy.position.set(mx, my, mz);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(tilt, rotY, tilt * 0.5);
            dummy.updateMatrix();
            this.trunkMesh.setMatrixAt(placed, dummy.matrix);

            // Canopy Pad 1 (Mounted at Left Bough tip)
            const b1Offset = new THREE.Vector3(-1.10 * scale, 2.75 * scale, 0.30 * scale).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
            dummy.position.set(mx + b1Offset.x, my + b1Offset.y, mz + b1Offset.z);
            dummy.scale.set(scale, scale, scale);
            dummy.rotation.set(tilt * 0.5, rotY + 0.3, 0.12);
            dummy.updateMatrix();
            this.tier1Mesh.setMatrixAt(placed, dummy.matrix);

            // Canopy Pad 2 (Mounted at Right Bough tip)
            const b2Offset = new THREE.Vector3(1.20 * scale, 2.95 * scale, -0.35 * scale).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
            dummy.position.set(mx + b2Offset.x, my + b2Offset.y, mz + b2Offset.z);
            dummy.scale.set(scale * 0.95, scale * 0.95, scale * 0.95);
            dummy.rotation.set(-0.1, rotY + 1.2, -tilt);
            dummy.updateMatrix();
            this.tier2Mesh.setMatrixAt(placed, dummy.matrix);

            // Canopy Pad 3 (Mounted at Upper Central Bough tip)
            const b3Offset = new THREE.Vector3(0.15 * scale, 3.65 * scale, 0.45 * scale).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
            dummy.position.set(mx + b3Offset.x, my + b3Offset.y, mz + b3Offset.z);
            dummy.scale.set(scale * 0.88, scale * 0.88, scale * 0.88);
            dummy.rotation.set(-tilt, rotY + 2.1, 0);
            dummy.updateMatrix();
            this.tier3Mesh.setMatrixAt(placed, dummy.matrix);

            // Canopy Pad 4 (Mounted at Crown Summit)
            const b4Offset = new THREE.Vector3(-0.15 * scale, 4.15 * scale, -0.15 * scale).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
            dummy.position.set(mx + b4Offset.x, my + b4Offset.y, mz + b4Offset.z);
            dummy.scale.set(scale * 0.80, scale * 0.80, scale * 0.80);
            dummy.rotation.set(0.05, rotY + 0.8, -0.05);
            dummy.updateMatrix();
            this.tier4Mesh.setMatrixAt(placed, dummy.matrix);

            placed++;
        }

        this.trunkMesh.count = placed;
        this.tier1Mesh.count = placed;
        this.tier2Mesh.count = placed;
        this.tier3Mesh.count = placed;
        this.tier4Mesh.count = placed;

        this.trunkMesh.instanceMatrix.needsUpdate = true;
        this.tier1Mesh.instanceMatrix.needsUpdate = true;
        this.tier2Mesh.instanceMatrix.needsUpdate = true;
        this.tier3Mesh.instanceMatrix.needsUpdate = true;
        this.tier4Mesh.instanceMatrix.needsUpdate = true;

        mapleGroup.add(this.trunkMesh);
        mapleGroup.add(this.tier1Mesh);
        mapleGroup.add(this.tier2Mesh);
        mapleGroup.add(this.tier3Mesh);
        mapleGroup.add(this.tier4Mesh);

        // 5. Build Stony Stream Corridor & Footbridge
        this.buildStreamCorridor(mapleGroup);
        this.buildStreamFootbridge(mapleGroup);

        // 6. Floating Autumn Leaves Particles
        this.buildFallingMapleLeaves(mapleGroup);

        // 120 FPS Static Matrix Freezing
        mapleGroup.traverse(child => {
            if (child.isMesh) {
                child.matrixAutoUpdate = false;
                child.updateMatrix();
            }
        });

        this.scene.add(mapleGroup);
    }

    buildStreamCorridor(group) {
        // Single Continuous Stony Stream Channel with Water & River Stones (Zero triangle artifacts poking through grass)
        // Route: z from -50.0 (Northern Alpine Gorge) to -14.0 (Valley River Confluence), x = 32.0 + sin(z * 0.18) * 3.5
        const segCount = 90;
        const streamWidth = 2.0;
        const positions = [];
        const uvs = [];
        const indices = [];

        const bedPositions = [];
        const bedUvs = [];
        const bedIndices = [];

        let prevWaterY = Infinity;

        // Continuous quad strip following the meandering hillside channel
        for (let i = 0; i <= segCount; i++) {
            const t = i / segCount;
            const z = -50.0 + t * 36.0;
            const x = 32.0 + Math.sin(z * 0.18) * 3.5;

            // Direction tangent dx/dz
            const dx = Math.cos(z * 0.18) * 0.18 * 3.5;
            const dz = 1.0;
            const len = Math.hypot(dx, dz);
            // Perpendicular normal in horizontal plane
            const nx = -dz / len;
            const nz = dx / len;

            const halfW = streamWidth / 2;
            const xL = x - nx * halfW;
            const zL = z - nz * halfW;
            const xR = x + nx * halfW;
            const zR = z + nz * halfW;

            const centerH = this.terrain.getTerrainHeight(x, z);
            const leftH = this.terrain.getTerrainHeight(xL, zL);
            const rightH = this.terrain.getTerrainHeight(xR, zR);
            // Monotonic downhill water elevation (Argon Hydrology Spec)
            const rawWaterY = Math.max(centerH + 0.10, (leftH + rightH) * 0.5 - 0.08);
            const waterY = Math.min(prevWaterY, rawWaterY);
            prevWaterY = waterY;

            // Add water vertices: Left then Right
            positions.push(xL, waterY, zL);
            positions.push(xR, waterY, zR);

            uvs.push(0, t * 24.0);
            uvs.push(1, t * 24.0);

            if (i < segCount) {
                const base = i * 2;
                indices.push(base, base + 1, base + 2);
                indices.push(base + 1, base + 3, base + 2);
            }

            // Dark stone / gravel bed ribbon underneath (seals gaps and forms authentic stream channel)
            const bedW = streamWidth + 0.8;
            const bHalfW = bedW / 2;
            const bxL = x - nx * bHalfW;
            const bzL = z - nz * bHalfW;
            const bxR = x + nx * bHalfW;
            const bzR = z + nz * bHalfW;
            const bedFloorY = waterY - 0.22;

            bedPositions.push(bxL, waterY - 0.02, bzL);
            bedPositions.push(x, bedFloorY, z);
            bedPositions.push(bxR, waterY - 0.02, bzR);

            bedUvs.push(0, t * 12.0);
            bedUvs.push(0.5, t * 12.0);
            bedUvs.push(1, t * 12.0);

            if (i < segCount) {
                const bBase = i * 3;
                const bNext = (i + 1) * 3;
                // Left channel slope
                bedIndices.push(bBase, bBase + 1, bNext);
                bedIndices.push(bNext, bBase + 1, bNext + 1);
                // Right channel slope
                bedIndices.push(bBase + 1, bBase + 2, bNext + 1);
                bedIndices.push(bNext + 1, bBase + 2, bNext + 2);
            }
        }

        // 1. Gravel Channel Bed Mesh
        const bedGeo = new THREE.BufferGeometry();
        bedGeo.setAttribute('position', new THREE.Float32BufferAttribute(bedPositions, 3));
        bedGeo.setAttribute('uv', new THREE.Float32BufferAttribute(bedUvs, 2));
        bedGeo.setIndex(bedIndices);
        bedGeo.computeVertexNormals();

        const channelMat = new THREE.MeshStandardMaterial({
            color: 0x44403c, // Dark wet river stone
            roughness: 0.90,
            metalness: 0.05
        });
        const bedMesh = new THREE.Mesh(bedGeo, channelMat);
        bedMesh.receiveShadow = true;
        group.add(bedMesh);

        // 2. Translucent Mountain Stream Surface
        const streamGeo = new THREE.BufferGeometry();
        streamGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        streamGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        streamGeo.setIndex(indices);
        streamGeo.computeVertexNormals();

        const streamWaterMat = (this.waterSystem && this.waterSystem.streamMat) ? this.waterSystem.streamMat : new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            roughness: 0.05,
            metalness: 0.24,
            transparent: true,
            opacity: 0.82,
            depthWrite: false
        });

        const streamMesh = new THREE.Mesh(streamGeo, streamWaterMat);
        streamMesh.renderOrder = 3;
        streamMesh.receiveShadow = true;
        group.add(streamMesh);
        this.streamMeshes.push(streamMesh);
        if (this.waterSystem && this.waterSystem.waterMeshes) {
            this.waterSystem.waterMeshes.push(streamMesh);
        }

        // Riverbed pebble stones along banks (filtered clear of walking trails and footbridge)
        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0x57534e,
            roughness: 0.92
        });

        for (let i = 0; i <= segCount; i += 3) {
            const z = -50.0 + (i / segCount) * 36.0;
            const x = 32.0 + Math.sin(z * 0.18) * 3.5;

            const sGeo = new THREE.DodecahedronGeometry(0.28 + Math.random() * 0.18, 0);
            const s1x = x - 1.25;
            const s1z = z;
            if (!this.isNearTrail(s1x, s1z, 2.8) && Math.abs(s1z - (-28.0)) >= 2.0) {
                const sMesh1 = new THREE.Mesh(sGeo, stoneMat);
                sMesh1.position.set(s1x, this.terrain.getTerrainHeight(s1x, s1z) + 0.06, s1z);
                sMesh1.castShadow = false;
                sMesh1.receiveShadow = true;
                sMesh1.matrixAutoUpdate = false;
                sMesh1.updateMatrix();
                group.add(sMesh1);
            }

            const s2x = x + 1.25;
            const s2z = z + 0.3;
            if (!this.isNearTrail(s2x, s2z, 2.8) && Math.abs(s2z - (-28.0)) >= 2.0) {
                const sMesh2 = new THREE.Mesh(sGeo, stoneMat);
                sMesh2.position.set(s2x, this.terrain.getTerrainHeight(s2x, s2z) + 0.06, s2z);
                sMesh2.castShadow = false;
                sMesh2.receiveShadow = true;
                sMesh2.matrixAutoUpdate = false;
                sMesh2.updateMatrix();
                group.add(sMesh2);
            }
        }
    }

    buildStreamFootbridge(group) {
        // Authentic Japanese rustic wooden footbridge crossing the stream at z = -28.0
        const bz = -28.0;
        const bx = 32.0 + Math.sin(bz * 0.18) * 3.5; // ~ 32.0m
        const by = this.terrain.getTerrainHeight(bx, bz) + 0.20;

        const bridgeGroup = new THREE.Group();
        bridgeGroup.position.set(bx, by, bz);

        const woodMat = new THREE.MeshStandardMaterial({
            color: 0x5c3d28,
            roughness: 0.86
        });
        const postMat = new THREE.MeshStandardMaterial({
            color: 0x452c1e,
            roughness: 0.90
        });
        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0x64748b,
            roughness: 0.92
        });

        // 1. Dual Carved Stone Abutment Piers embedded into creek banks
        [-1.45, 1.45].forEach(ax => {
            const abutment = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.55, 1.6), stoneMat);
            abutment.position.set(ax, -0.16, 0);
            abutment.castShadow = true;
            abutment.receiveShadow = true;
            bridgeGroup.add(abutment);
        });

        // 2. Dual Longitudinal Heavy Timber Stringers (Concealed beneath deck planks)
        [-0.45, 0.45].forEach(sz => {
            const stringer = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.14, 0.14), postMat);
            stringer.position.set(0, 0.0, sz);
            stringer.castShadow = false;
            bridgeGroup.add(stringer);
        });

        // 3. 12 Individual Transverse Weathered Timber Planks
        const plankCount = 12;
        const spanW = 2.9;
        const plankSpacing = spanW / plankCount;
        for (let p = 0; p < plankCount; p++) {
            const px = -spanW / 2 + (p + 0.5) * plankSpacing;
            const plankGeo = new THREE.BoxGeometry(plankSpacing * 0.90, 0.08, 1.48);
            const plank = new THREE.Mesh(plankGeo, woodMat);
            plank.position.set(px, 0.09 + (p % 2 === 0 ? 0.005 : -0.005), 0);
            plank.rotation.y = (p % 3 - 1) * 0.012; // subtle rustic artisanal variance
            plank.castShadow = false;
            plank.receiveShadow = true;
            bridgeGroup.add(plank);
        }

        // 4. Sturdy Timber Handrails & Posts
        [-0.65, 0.65].forEach(rz => {
            // Upper protective rounded log rail
            const railGeo = new THREE.CylinderGeometry(0.045, 0.045, 3.0, 8);
            railGeo.rotateZ(Math.PI / 2);
            const railMesh = new THREE.Mesh(railGeo, postMat);
            railMesh.position.set(0, 0.56, rz);
            railMesh.castShadow = true;
            bridgeGroup.add(railMesh);

            // Mid safety rail
            const midRailGeo = new THREE.CylinderGeometry(0.03, 0.03, 3.0, 8);
            midRailGeo.rotateZ(Math.PI / 2);
            const midRail = new THREE.Mesh(midRailGeo, postMat);
            midRail.position.set(0, 0.28, rz);
            midRail.castShadow = false;
            bridgeGroup.add(midRail);

            // Vertical support posts
            [-1.35, 0, 1.35].forEach(px => {
                const post = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.58, 0.10), postMat);
                post.position.set(px, 0.28, rz);
                post.castShadow = false;
                bridgeGroup.add(post);

                // Post pyramid chamfer cap
                const cap = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.08, 4), postMat);
                cap.position.set(px, 0.60, rz);
                cap.rotation.y = Math.PI / 4;
                bridgeGroup.add(cap);
            });
        });

        bridgeGroup.matrixAutoUpdate = false;
        bridgeGroup.updateMatrix();
        group.add(bridgeGroup);
        this.footbridgeMesh = bridgeGroup;
    }

    buildFallingMapleLeaves(group) {
        const pCount = 75;
        const pGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(pCount * 3);
        const velocities = [];

        for (let i = 0; i < pCount; i++) {
            positions[i * 3]     = 20.0 + Math.random() * 30.0;
            positions[i * 3 + 1] = 1.5 + Math.random() * 6.5;
            positions[i * 3 + 2] = -44.0 + Math.random() * 28.0;

            velocities.push({
                x: 0.22 + Math.random() * 0.45,
                y: -0.15 - Math.random() * 0.20,
                z: 0.15 + Math.random() * 0.35
            });
        }

        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Crimson maple leaf texture
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI * 2);
        ctx.fill();

        const pTex = new THREE.CanvasTexture(canvas);
        const pMat = new THREE.PointsMaterial({
            map: pTex,
            size: 0.38,
            transparent: true,
            opacity: 0.88,
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

            px += Math.sin(py * 2.5 + i) * 0.015;

            if (py < 0.2) {
                py = 6.0 + Math.random() * 3.5;
                px = 20.0 + Math.random() * 30.0;
                pz = -44.0 + Math.random() * 28.0;
            }

            pos.setXYZ(i, px, py, pz);
        }
        pos.needsUpdate = true;
    }
}
