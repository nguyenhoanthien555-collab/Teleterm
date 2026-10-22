import * as THREE from 'three';

/**
 * PATH SYSTEM — INTERCONNECTED RURAL PATH NETWORK
 * Implements Section 14 & 48 of TeleTerm Living Open World Master Spec v3.
 * Organic dirt and gravel roads guiding player and NPCs to meaningful destinations:
 * - Main Road: Developer Hub -> Village Plaza -> River Bridge -> Coastal Beach
 * - Scenic Branch: Cherry Blossom Grove -> Hilltop Viewpoint
 * - Agricultural Branch: Rice Country dikes & canal flume
 * - Alpine Summit Trail: Winding ascent to the High Mountain Pass & Overlook
 */
export class PathSystem {
    constructor(scene, terrainSystem) {
        this.scene = scene;
        this.terrainSystem = terrainSystem;
        this.pathCurve = null;
        this.branchCurves = [];
        this.pathMesh = null;
    }

    build() {
        const pathGroup = new THREE.Group();

        // 1. Primary Arterial Road: Connects North Village through Hub down to South Beach
        // z: -32 (Village) -> 4.2 (Hub) -> 27 (River Bridge) -> 76 (Beach Pier)
        const mainWaypoints = [
            new THREE.Vector3(0.0, 0, -32),  // Village Plaza entrance
            new THREE.Vector3(1.2, 0, -22),  // Village Square
            new THREE.Vector3(1.8, 0, -14),  // Footbridge turn-off
            new THREE.Vector3(2.4, 0, -5),   // Approaching Cafe
            new THREE.Vector3(2.8, 0, 4.2),  // Hub spawn center
            new THREE.Vector3(3.2, 0, 14),   // South of Hub
            new THREE.Vector3(3.9, 0, 20.81),// River Bridge North Abutment
            new THREE.Vector3(4.0, 0, 27.91),// River Bridge Deck Arch Center
            new THREE.Vector3(4.1, 0, 35.01),// River Bridge South Abutment
            new THREE.Vector3(5.5, 0, 45),   // Approaching coastal dunes
            new THREE.Vector3(7.5, 0, 60),   // Dry sand path
            new THREE.Vector3(10.5, 0, 76)   // Pier dock entrance
        ];

        const mainCurvePoints = mainWaypoints.map(pt => {
            let y = this.terrainSystem.getTerrainHeight(pt.x, pt.z) + 0.045;
            // Bridge deck waypoints follow bridge arch elevation
            if (pt.z >= 20.81 && pt.z <= 35.01) {
                const span = 35.01 - 20.81;
                const t = (pt.z - 20.81) / span;
                const archY = Math.sin(t * Math.PI) * 0.68 + 0.24;
                y = archY + 0.045;
            }
            return new THREE.Vector3(pt.x, y, pt.z);
        });

        this.pathCurve = new THREE.CatmullRomCurve3(mainCurvePoints);

        // 2. Hilltop Overlook & Cherry Grove Branch: Curves gracefully along the western entrance of Developer Hub
        const hillWaypoints = [
            new THREE.Vector3(2.6, 0, -3.0),
            new THREE.Vector3(8.5, 0, -6.5),
            new THREE.Vector3(11.2, 0, -11.5), // West approach to Hub, directly in front of access steps with 3.0m clearance
            new THREE.Vector3(10.8, 0, -17.5), // Sweeps wide and completely clear of NW deck corner (deck at x: 15.75, z: -16.0)
            new THREE.Vector3(14.5, 0, -21.5), // Curves north of Hub deck into hillside Cherry Grove
            new THREE.Vector3(22.0, 0, -23.5),
            new THREE.Vector3(27.5, 0, -26.0),
            new THREE.Vector3(31.5, 0, -35.0), // High ridge
            new THREE.Vector3(32.6, 0, -43.8)  // Smooth approach ending at viewing pad perimeter
        ];

        const hillCurvePoints = hillWaypoints.map(pt => {
            const y = this.terrainSystem.getTerrainHeight(pt.x, pt.z) + 0.045;
            return new THREE.Vector3(pt.x, y, pt.z);
        });
        const hillCurve = new THREE.CatmullRomCurve3(hillCurvePoints);
        this.branchCurves.push(hillCurve);

        // 3. Bamboo Meditation Forest Branch: Branches from Village Road (1.2, -22) -> (-8, -23) -> Tea Pavilion (-20.5, -23.5) -> Bamboo Trail (-26, -28) -> (-31, -33.5) -> Onsen (-34, -37.5)
        const bambooWaypoints = [
            new THREE.Vector3(1.2, 0, -22.0),
            new THREE.Vector3(-8.0, 0, -23.0),
            new THREE.Vector3(-20.5, 0, -23.5),
            new THREE.Vector3(-26.0, 0, -28.0),
            new THREE.Vector3(-31.0, 0, -33.5),
            new THREE.Vector3(-34.0, 0, -37.5)
        ];
        const bambooCurvePoints = bambooWaypoints.map(pt => {
            const y = this.terrainSystem.getTerrainHeight(pt.x, pt.z) + 0.045;
            return new THREE.Vector3(pt.x, y, pt.z);
        });
        const bambooCurve = new THREE.CatmullRomCurve3(bambooCurvePoints);
        this.branchCurves.push(bambooCurve);

        // 4. Maple Valley Branch: Branches from Hill Trail (26, -22) -> (31, -25.5) -> (34.5, -28) -> (37.5, -28) -> (44, -28)
        const mapleWaypoints = [
            new THREE.Vector3(26.0, 0, -22.0),
            new THREE.Vector3(31.0, 0, -25.5),
            new THREE.Vector3(34.5, 0, -28.0),
            new THREE.Vector3(37.5, 0, -28.0),
            new THREE.Vector3(44.0, 0, -28.0)
        ];
        const mapleCurvePoints = mapleWaypoints.map(pt => {
            const y = this.terrainSystem.getTerrainHeight(pt.x, pt.z) + 0.045;
            return new THREE.Vector3(pt.x, y, pt.z);
        });
        const mapleCurve = new THREE.CatmullRomCurve3(mapleCurvePoints);
        this.branchCurves.push(mapleCurve);

        // 5. Alpine Trail Ascent to Mountain Summit Overlook:
        // Village (0, -32) -> Foothills (6, -42) -> Glacial stream crossing (14, -50) -> High Pass (2, -58) -> Summit Ridge (0, -68)
        const alpineWaypoints = [
            new THREE.Vector3(0.0, 0, -32.0),
            new THREE.Vector3(4.5, 0, -40.0),
            new THREE.Vector3(12.0, 0, -48.0),
            new THREE.Vector3(8.0, 0, -56.0),
            new THREE.Vector3(1.5, 0, -62.0),
            new THREE.Vector3(0.0, 0, -68.0)
        ];
        const alpineCurvePoints = alpineWaypoints.map(pt => {
            const y = this.terrainSystem.getTerrainHeight(pt.x, pt.z) + 0.055;
            return new THREE.Vector3(pt.x, y, pt.z);
        });
        const alpineCurve = new THREE.CatmullRomCurve3(alpineCurvePoints);
        this.branchCurves.push(alpineCurve);

        // Texture: Warm sun-baked Japanese rural loam with wheel tracks & fine gravel
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#b38a5b';
        ctx.fillRect(0, 0, 512, 512);

        const rutGrad = ctx.createLinearGradient(0, 0, 512, 0);
        rutGrad.addColorStop(0.0, 'rgba(84, 138, 38, 0.75)');
        rutGrad.addColorStop(0.12, 'rgba(179, 138, 91, 0)');
        rutGrad.addColorStop(0.30, 'rgba(138, 98, 60, 0.35)');
        rutGrad.addColorStop(0.50, 'rgba(202, 162, 118, 0.32)');
        rutGrad.addColorStop(0.70, 'rgba(138, 98, 60, 0.35)');
        rutGrad.addColorStop(0.88, 'rgba(179, 138, 91, 0)');
        rutGrad.addColorStop(1.0, 'rgba(84, 138, 38, 0.75)');
        ctx.fillStyle = rutGrad;
        ctx.fillRect(0, 0, 512, 512);

        for (let i = 0; i < 600; i++) {
            ctx.fillStyle = (Math.random() > 0.45) ? 'rgba(92, 67, 45, 0.42)' : 'rgba(235, 215, 185, 0.52)';
            ctx.beginPath();
            ctx.arc(Math.random() * 512, Math.random() * 512, 1.2 + Math.random() * 2.8, 0, Math.PI * 2);
            ctx.fill();
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.anisotropy = 8;

        const pathMat = new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.92,
            metalness: 0.02,
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: -4.0,
            polygonOffsetUnits: -4.0
        });

        // Generate Ribbon Mesh for Main Path
        const mainMesh = this.generateRibbonMesh(this.pathCurve, 120, 2.6, pathMat);
        pathGroup.add(mainMesh);

        // Generate Ribbon Mesh for Hilltop Branch
        const hillMesh = this.generateRibbonMesh(hillCurve, 60, 2.2, pathMat);
        pathGroup.add(hillMesh);

        // Generate Ribbon Mesh for Bamboo Forest Branch
        const bambooMesh = this.generateRibbonMesh(bambooCurve, 45, 2.0, pathMat);
        pathGroup.add(bambooMesh);

        // Generate Ribbon Mesh for Maple Valley Branch
        const mapleMesh = this.generateRibbonMesh(mapleCurve, 35, 1.8, pathMat);
        pathGroup.add(mapleMesh);

        // Generate Ribbon Mesh for Alpine Ascent Branch
        const alpineMesh = this.generateRibbonMesh(alpineCurve, 50, 2.0, pathMat);
        pathGroup.add(alpineMesh);

        // Generate Round Level Gravel Viewing Pad before the bench
        const padMesh = this.buildHilltopViewingPad(33.2, -46.5, 2.6, pathMat);
        pathGroup.add(padMesh);

        this.scene.add(pathGroup);
    }

    buildHilltopViewingPad(padX, padZ, radius, mat) {
        const segments = 32;
        const rings = 4;
        const geo = new THREE.BufferGeometry();
        const positions = [];
        const uvs = [];
        const normals = [];
        const indices = [];

        // Center vertex
        const centerY = this.terrainSystem.getTerrainHeight(padX, padZ) + 0.035;
        positions.push(padX, centerY, padZ);
        uvs.push(0.5, 0.5);
        normals.push(0, 1, 0);

        for (let r = 1; r <= rings; r++) {
            const rad = (r / rings) * radius;
            for (let s = 0; s < segments; s++) {
                const theta = (s / segments) * Math.PI * 2;
                const px = padX + Math.cos(theta) * rad;
                const pz = padZ + Math.sin(theta) * rad;
                const py = this.terrainSystem.getTerrainHeight(px, pz) + 0.035;
                positions.push(px, py, pz);
                uvs.push(0.5 + Math.cos(theta) * (r / rings) * 0.5, 0.5 + Math.sin(theta) * (r / rings) * 0.5);
                normals.push(0, 1, 0);
            }
        }

        // Indices for innermost ring from center
        for (let s = 0; s < segments; s++) {
            const next = (s + 1) % segments;
            indices.push(0, 1 + s, 1 + next);
        }

        // Indices for outer concentric rings
        for (let r = 1; r < rings; r++) {
            const innerStart = 1 + (r - 1) * segments;
            const outerStart = 1 + r * segments;
            for (let s = 0; s < segments; s++) {
                const next = (s + 1) % segments;
                const i0 = innerStart + s;
                const i1 = innerStart + next;
                const o0 = outerStart + s;
                const o1 = outerStart + next;
                indices.push(i0, o0, i1);
                indices.push(i1, o0, o1);
            }
        }

        geo.setIndex(indices);
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geo.computeVertexNormals();

        const padMesh = new THREE.Mesh(geo, mat);
        padMesh.renderOrder = 2;
        padMesh.receiveShadow = true;
        return padMesh;
    }

    generateRibbonMesh(curve, segments, width, mat) {
        const geo = new THREE.BufferGeometry();
        const positions = [];
        const uvs = [];
        const normals = [];

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const pt = curve.getPoint(t);
            const tangent = curve.getTangent(t);
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

            const leftX = pt.x + normal.x * (width / 2);
            const leftZ = pt.z + normal.z * (width / 2);
            const leftY = this.terrainSystem.getTerrainHeight(leftX, leftZ) + 0.045;

            const rightX = pt.x - normal.x * (width / 2);
            const rightZ = pt.z - normal.z * (width / 2);
            const rightY = this.terrainSystem.getTerrainHeight(rightX, rightZ) + 0.045;

            positions.push(leftX, leftY, leftZ);
            positions.push(rightX, rightY, rightZ);

            uvs.push(0, t * 24);
            uvs.push(1, t * 24);

            normals.push(0, 1, 0);
            normals.push(0, 1, 0);
        }

        const indices = [];
        for (let i = 0; i < segments; i++) {
            const base = i * 2;
            indices.push(base, base + 2, base + 1);
            indices.push(base + 1, base + 2, base + 3);
        }

        geo.setIndex(indices);
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geo.computeVertexNormals();

        const mesh = new THREE.Mesh(geo, mat);
        mesh.renderOrder = 2;
        mesh.receiveShadow = true;
        return mesh;
    }
}
