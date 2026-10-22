import * as THREE from 'three';
import { WaterTextureGenerator } from './water-texture-generator.js?v=37';
import { createStylizedOceanMaterial } from './ocean-shader.js?v=37';

/**
 * BEACH & COASTAL SYSTEM — AZURE OCEAN, SHORELINE & WOODEN PIER
 * Implements Section 9, 48, and 49 of TeleTerm Living Open World Master Spec v3.
 * Features:
 * - Coastal dry sand dunes transitioning to wet sand tide-line
 * - Layered gentle ocean water with oscillating shoreline surf
 * - Dynamic white foam crest edge
 * - Rustic wooden fishing dock / pier extending into the sea
 * - Weathered driftwood logs, seashells & beach umbrellas
 */
export class BeachSystem {
    constructor(scene, terrainSystem, waterSystem) {
        this.scene = scene;
        this.terrainSystem = terrainSystem;
        this.waterSystem = waterSystem;
        this.oceanMesh = null;
        this.oceanMat = null;
        this.foamMesh = null;
        this.time = 0;
    }

    build() {
        const beachGroup = new THREE.Group();

        // 1. Dry Beach Sand Expanse & Dunes (z: 48 to 74, x: -45 to 65)
        this.buildDuneSand(beachGroup);

        // 2. Wet Sand Shoreline Band (z: 74 to 86)
        this.buildWetSandBand(beachGroup);

        // 3. Azure Coastal Ocean Water (z: 86 to 180, x: -90 to 90)
        this.buildOceanWater(beachGroup);

        // 4. White Shoreline Foam Wave
        this.buildFoamEdge(beachGroup);

        // 5. Rustic Wooden Fishing Pier / Dock
        this.buildWoodenPier(beachGroup, 10.5, 76.0, 24.0);

        // 6. Coastal Dressing: Driftwood, Beach Umbrellas & Seaside Benches
        this.buildBeachProps(beachGroup);

        // 120 FPS Static Matrix Freezing (except dynamic foam mesh)
        beachGroup.traverse(child => {
            if (child.isMesh && child !== this.foamMesh) {
                child.matrixAutoUpdate = false;
                child.updateMatrix();
            }
        });

        this.scene.add(beachGroup);
    }

    buildDuneSand(group) {
        // High-Quality Warm Golden Sand Texture (Calibrated anime ochre to eliminate bloom whiteout)
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#cba36e'; // Calibrated warm anime golden-ochre sand
        ctx.fillRect(0, 0, 256, 256);

        // Micro-grains and gentle wind ripples
        for (let i = 0; i < 400; i++) {
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(185, 145, 95, 0.40)' : 'rgba(220, 180, 130, 0.35)';
            ctx.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
        }

        const sandTex = new THREE.CanvasTexture(canvas);
        sandTex.wrapS = THREE.RepeatWrapping;
        sandTex.wrapT = THREE.RepeatWrapping;
        sandTex.repeat.set(8, 6);

        const sandMat = new THREE.MeshStandardMaterial({
            map: sandTex,
            roughness: 0.98,
            metalness: 0.0
        });

        const duneGeo = new THREE.PlaneGeometry(120, 28, 32, 12);
        duneGeo.rotateX(-Math.PI / 2);

        // Subtle undulating dunes
        const pos = duneGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const vx = pos.getX(i);
            const vz = pos.getZ(i);
            const duneY = Math.sin(vx * 0.12) * 0.22 + Math.cos(vz * 0.15) * 0.18;
            pos.setY(i, duneY);
        }
        duneGeo.computeVertexNormals();

        const duneMesh = new THREE.Mesh(duneGeo, sandMat);
        duneMesh.position.set(10.0, -0.05, 61.0); // centered at z: 61
        duneMesh.receiveShadow = true;
        group.add(duneMesh);
    }

    buildWetSandBand(group) {
        // Wet sand with glistening mirror reflection of coastal sky
        const wetCanvas = document.createElement('canvas');
        wetCanvas.width = 256;
        wetCanvas.height = 256;
        const wctx = wetCanvas.getContext('2d');
        wctx.fillStyle = '#a6885e'; // Darker moist wet sand
        wctx.fillRect(0, 0, 256, 256);

        for (let i = 0; i < 200; i++) {
            wctx.fillStyle = 'rgba(145, 115, 80, 0.35)';
            wctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
        }

        const wetTex = new THREE.CanvasTexture(wetCanvas);
        wetTex.wrapS = THREE.RepeatWrapping;
        wetTex.wrapT = THREE.RepeatWrapping;
        wetTex.repeat.set(8, 4);

        const wetMat = new THREE.MeshStandardMaterial({
            map: wetTex,
            roughness: 0.90, // Soft satin wet sand sheen without blinding specular blowout
            metalness: 0.0
        });

        const wetGeo = new THREE.PlaneGeometry(130, 14);
        wetGeo.rotateX(-Math.PI / 2);
        const wetMesh = new THREE.Mesh(wetGeo, wetMat);
        wetMesh.position.set(10.0, -0.16, 80.0);
        wetMesh.receiveShadow = true;
        group.add(wetMesh);
    }

    buildOceanWater(group) {
        // Expansive coastal ocean covering the entire southern horizon (z: 70 to 330, x: -250 to 250)
        const oceanGeo = new THREE.PlaneGeometry(500, 260, 192, 96);
        oceanGeo.rotateX(-Math.PI / 2);

        // Expand bounding box on Y to prevent accidental camera frustum culling per Argon directive
        oceanGeo.computeBoundingBox();
        if (oceanGeo.boundingBox) {
            oceanGeo.boundingBox.min.y -= 2.0;
            oceanGeo.boundingBox.max.y += 2.0;
        }
        oceanGeo.computeBoundingSphere();
        if (oceanGeo.boundingSphere) {
            oceanGeo.boundingSphere.radius += 2.5;
        }

        // Shared Procedural Textures (Normal, Voronoi Seafoam, Solar Caustics)
        const textures = WaterTextureGenerator.getSharedTextures(THREE);
        this.oceanMat = createStylizedOceanMaterial(textures.normalMap, textures.foamMap, textures.causticMap);

        this.oceanMesh = new THREE.Mesh(oceanGeo, this.oceanMat);
        this.oceanMesh.position.set(0.0, -0.28, 200.0);
        this.oceanMesh.renderOrder = 10; // Gemini 4 Argon: render after ground and pier for clean alpha-blending
        this.oceanMesh.receiveShadow = true;
        group.add(this.oceanMesh);
    }

    buildFoamEdge(group) {
        // Dynamic oscillating shoreline wave crest
        const foamGeo = new THREE.PlaneGeometry(140, 2.2, 40, 2);
        foamGeo.rotateX(-Math.PI / 2);

        const foamMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.75,
            side: THREE.DoubleSide
        });

        this.foamMesh = new THREE.Mesh(foamGeo, foamMat);
        this.foamMesh.position.set(10.0, -0.18, 86.5);
        group.add(this.foamMesh);
    }

    buildWoodenPier(group, startX, startZ, pierLength) {
        const pier = new THREE.Group();
        pier.position.set(startX, 0, startZ + pierLength / 2);

        const woodMat = new THREE.MeshStandardMaterial({
            color: 0x543822, // Weathered sea-salted timber
            roughness: 0.88,
            metalness: 0.02
        });
        const pilingMat = new THREE.MeshStandardMaterial({
            color: 0x3b2414,
            roughness: 0.95
        });

        const pierWidth = 3.4;
        const plankCount = 36;
        const segLen = pierLength / plankCount;

        // Deck planks (top surface elevated to exactly y = 0.20m)
        for (let i = 0; i < plankCount; i++) {
            const z = (i - plankCount / 2 + 0.5) * segLen;
            const plank = new THREE.Mesh(new THREE.BoxGeometry(pierWidth, 0.08, segLen * 0.92), woodMat);
            plank.position.set(0, 0.16, z); // center 0.16 + half height 0.04 = 0.20m top
            plank.castShadow = false;
            plank.receiveShadow = true;
            pier.add(plank);
        }

        // Heavy support pilings into seabed
        const pilingPairs = 8;
        for (let j = 0; j < pilingPairs; j++) {
            const pz = (j / (pilingPairs - 1) - 0.5) * (pierLength - 2.0);
            [-pierWidth / 2 + 0.25, pierWidth / 2 - 0.25].forEach(px => {
                const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.2, 8), pilingMat);
                piling.position.set(px, -0.65, pz);
                pier.add(piling);
            });
        }

        // Pier end terminal platform (wider tee at sea end, top surface y = 0.20m)
        const teeMat = woodMat;
        const tee = new THREE.Mesh(new THREE.BoxGeometry(pierWidth + 2.5, 0.08, 4.0), teeMat);
        tee.position.set(0, 0.16, pierLength / 2 - 2.0);
        tee.castShadow = true;
        pier.add(tee);

        // Seaside Resting Bench at tip of dock (Full wooden bench with backrest)
        const dockBenchMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.90 });
        const dockIronMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.7 });
        const benchGroup = new THREE.Group();
        benchGroup.position.set(0, 0.20, pierLength / 2 - 2.0);

        for (let i = 0; i < 3; i++) {
            const plank = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.12), dockBenchMat);
            plank.position.set(0, 0.44, -0.12 + i * 0.14);
            plank.castShadow = false;
            benchGroup.add(plank);
        }
        for (let i = 0; i < 2; i++) {
            const bPlank = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.04), dockBenchMat);
            bPlank.position.set(0, 0.65 + i * 0.16, -0.22);
            bPlank.castShadow = false;
            benchGroup.add(bPlank);
        }
        [-0.6, 0.6].forEach(lx => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.4), dockIronMat);
            leg.position.set(lx, 0.22, 0);
            benchGroup.add(leg);
        });
        pier.add(benchGroup);

        group.add(pier);
    }

    buildBeachProps(group) {
        // 1. Weathered Driftwood logs
        const logMat = new THREE.MeshStandardMaterial({ color: 0x7c6a58, roughness: 0.92 });
        const logCoords = [
            { x: -8.0, z: 66.0, rotY: 0.4 },
            { x: 2.0,  z: 71.0, rotY: -0.6 },
            { x: 26.0, z: 64.0, rotY: 0.8 },
            { x: 38.0, z: 69.0, rotY: -0.3 }
        ];

        logCoords.forEach(c => {
            const log = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 3.2, 7), logMat);
            log.position.set(c.x, -0.04, c.z);
            log.rotation.z = Math.PI / 2;
            log.rotation.y = c.rotY;
            log.castShadow = false;
            group.add(log);
        });

        // 2. Coastal Umbrellas & Loungers for Developer Relaxation
        const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.6 }); // Cyan umbrella
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.5, roughness: 0.3 });

        [
            { x: -4.0, z: 58.0 },
            { x: 22.0, z: 56.0 }
        ].forEach(pos => {
            const uGroup = new THREE.Group();
            uGroup.position.set(pos.x, 0, pos.z);

            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 8), poleMat);
            pole.position.y = 1.2;
            uGroup.add(pole);

            const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.55, 8), umbrellaMat);
            canopy.position.y = 2.2;
            uGroup.add(canopy);

            group.add(uGroup);
        });

        // 3. Seaside Wooden Bench on Beach Sand Dunes (Grounded seating under umbrella)
        const benchMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.90 });
        const benchIronMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.7 });
        const shoreBench = new THREE.Group();
        shoreBench.position.set(22.0, 0, 56.0);

        for (let i = 0; i < 3; i++) {
            const plank = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.12), benchMat);
            plank.position.set(0, 0.44, -0.12 + i * 0.14);
            plank.castShadow = false;
            shoreBench.add(plank);
        }
        for (let i = 0; i < 2; i++) {
            const bPlank = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.12, 0.04), benchMat);
            bPlank.position.set(0, 0.65 + i * 0.16, -0.22);
            bPlank.castShadow = false;
            shoreBench.add(bPlank);
        }
        [-0.6, 0.6].forEach(lx => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.44, 0.4), benchIronMat);
            leg.position.set(lx, 0.22, 0);
            shoreBench.add(leg);
        });
        group.add(shoreBench);
    }

    update(delta) {
        this.time += delta;
        // Modulo 3600 per Argon directive to prevent precision jitter
        const safeTime = this.time % 3600.0;

        // Update GPU Ocean Shader Uniform
        if (this.oceanMat && this.oceanMat.uniforms && this.oceanMat.uniforms.uTime) {
            this.oceanMat.uniforms.uTime.value = safeTime;
        }

        // Soft shoreline foam wash motion
        if (this.foamMesh) {
            const waveOffset = Math.sin(safeTime * 1.6) * 1.4;
            this.foamMesh.position.z = 86.5 + waveOffset;
            this.foamMesh.material.opacity = 0.50 + Math.sin(safeTime * 1.6) * 0.25;
        }
    }
}
