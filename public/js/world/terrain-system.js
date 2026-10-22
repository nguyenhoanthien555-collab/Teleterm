import * as THREE from 'three';

/**
 * TERRAIN SYSTEM — EXPANDED REGIONAL GEOGRAPHY & TOPOGRAPHY
 * Implements Section 4, 5, 40, and 48 of TeleTerm Living Open World Master Spec v3.
 * Continuous mathematical height formula and seamless painterly watercolor canvas
 * supporting 8 connected geographic regions:
 * - Developer Hub & Coding Cafe Plateau
 * - Countryside Village Plaza
 * - Terraced Rice Country Basins
 * - Meandering River Valley Channel
 * - Rolling Cherry Blossom Hills & Hilltop Viewpoint
 * - Alpine Foothills rising toward Mountain Backdrop
 * - Coastal Sand Dunes sloping toward Azure Sea
 */
export class TerrainSystem {
    constructor(scene) {
        this.scene = scene;
        this.groundMesh = null;
    }

    /**
     * Hermite smoothstep interpolation: 0 below edge0, 1 above edge1, cubic ease in-between.
     */
    smoothstep(edge0, edge1, x) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }

    /**
     * Continuous organic terrain height formula with regional identity
     * Mathematically verified: 0 discontinuous jumps across entire 450m x 450m world.
     */
    getTerrainHeight(x, z) {
        // 1. Subtle domain warping to break rigid grid alignment
        const wx = x + Math.sin(z * 0.04) * 1.5;
        const wz = z + Math.sin(x * 0.04) * 1.5;
        let h = Math.sin(wx * 0.025) * 0.22 + Math.cos(wz * 0.022) * 0.24 + Math.sin(wx * 0.065 + wz * 0.055) * 0.08;

        // 2. Rolling Hillside & Hilltop Overlook on the East
        // Hermite smoothstep transition from x = 12.0 to x = 20.0 prevents cliff edge at x = 14
        const eastWeight = this.smoothstep(12.0, 20.0, x);
        if (eastWeight > 0.0) {
            const riverMeanderZ = 27.0 + Math.sin(x * 0.05) * 3.2 + Math.sin(x * 0.12) * 0.6;
            const riverDist = Math.abs(z - riverMeanderZ);
            const riverAtten = this.smoothstep(4.5, 9.0, riverDist);

            const eastFactor = (x - 12.0) * 0.065 * riverAtten;
            // Hilltop Panorama Viewpoint in North-East (smooth transition in Z)
            const hillZWeight = this.smoothstep(-10.0, -32.0, z);
            const hillFactor = Math.min(4.2, Math.max(0, -12.0 - z) * 0.065) * hillZWeight;
            h += eastWeight * (eastFactor + hillFactor);
        }

        // 3. Rice Country Stepped Terraces in Southwest Plain (x in [-42, -10], z in [-11, 21])
        const riceXWeight = this.smoothstep(-10.0, -13.0, x) * this.smoothstep(-42.0, -38.0, x);
        const riceZWeight = this.smoothstep(-11.0, -7.0, z) * this.smoothstep(21.0, 17.0, z);
        const riceWeight = riceXWeight * riceZWeight;

        if (riceWeight > 0.0) {
            let terraceElev;
            if (x >= -12.5) {
                const s = this.smoothstep(-10.5, -12.5, x);
                terraceElev = -0.08 * s;
            } else if (x > -19.50) {
                terraceElev = -0.08;
            } else if (x >= -20.20) {
                const s = this.smoothstep(-19.50, -20.20, x);
                terraceElev = -0.08 + 0.24 * s;
            } else if (x > -27.80) {
                terraceElev = 0.16;
            } else if (x >= -28.50) {
                const s = this.smoothstep(-27.80, -28.50, x);
                terraceElev = 0.16 + 0.26 * s;
            } else if (x >= -36.50) {
                terraceElev = 0.42;
            } else {
                terraceElev = 0.42 + (-36.50 - x) * 0.045;
            }
            h = h * (1.0 - riceWeight) + (h + terraceElev) * riceWeight;
        }

        // 3b. Northwest Bamboo Forest elevated plateau (smooth blend on all 4 borders)
        const bambooXWeight = this.smoothstep(-12.0, -18.0, x);
        const bambooZWeight = this.smoothstep(-12.0, -18.0, z) * this.smoothstep(-55.0, -45.0, z);
        const bambooWeight = bambooXWeight * bambooZWeight;
        if (bambooWeight > 0.0) {
            let bambooRise = Math.min(0.85, Math.max(0, -12.0 - x) * 0.068);
            if (x < -26.0) {
                bambooRise += Math.min(3.2, (-26.0 - x) * 0.055);
            }
            h += bambooWeight * bambooRise;
        }

        // 3c. Far West slope (attenuates in river valley to allow natural gorge drainage)
        const riverMeanderZ = 27.0 + Math.sin(x * 0.05) * 3.2 + Math.sin(x * 0.12) * 0.6;
        const westRiverAtten = this.smoothstep(4.5, 9.0, Math.abs(z - riverMeanderZ));
        const westWeight = this.smoothstep(-22.0, -35.0, x) * (1.0 - riceWeight) * westRiverAtten;
        if (westWeight > 0.0) {
            h += westWeight * Math.min(4.0, (-22.0 - x) * 0.052);
        }

        // 4. Meandering River Valley Channel (Synchronized with river sinuous curve)
        const distToRiver = Math.abs(z - riverMeanderZ);
        if (distToRiver < 7.5) {
            const t = distToRiver / 7.5;
            const trough = Math.cos(t * Math.PI * 0.5) * 1.15;
            h -= trough;
        }

        // 4b. Autumn Maple Valley Stony Stream Bed Channel
        if (z >= -52.0 && z <= -12.0) {
            const streamZWeight = this.smoothstep(-12.0, -16.0, z) * this.smoothstep(-52.0, -46.0, z);
            const streamCenter = 32.0 + Math.sin(z * 0.18) * 3.5;
            const distToStream = Math.abs(x - streamCenter);
            if (distToStream < 2.6) {
                const st = distToStream / 2.6;
                const streamTrough = Math.cos(st * Math.PI * 0.5) * 0.38;
                h -= streamTrough * streamZWeight;
            }
        }

        // 5. Coastal Shoreline & Deep Seabed Descent
        if (z > 45.0) {
            // Smooth slope from meadow (z=45) down to beach tide level (z=74)
            const duneT = Math.min(1.0, (z - 45.0) / 29.0);
            h -= duneT * 0.48;

            // Submerged coastal shelf and deep ocean bed (z > 74)
            if (z > 74.0) {
                const oceanT = Math.min(1.0, (z - 74.0) / 36.0);
                const oceanEase = oceanT * oceanT * (3.0 - 2.0 * oceanT);
                h -= oceanEase * 2.2;
            }
        }

        // 6. Alpine Foothills & Mountain Ridge in the Far North (z < -30 with smooth ease-in)
        if (z < -30.0) {
            const tz = Math.min(1.0, (-30.0 - z) / 8.0);
            const ease = tz * tz * (3.0 - 2.0 * tz);
            const ridgeBase = (-30.0 - z) * 0.11;
            const ridgeHarmonics = Math.sin(x * 0.075) * 1.8 + Math.cos(x * 0.15) * 0.8;
            h += ease * Math.min(14.5, (ridgeBase + ridgeHarmonics * 0.5));
        }

        return h;
    }

    /**
     * Compute analytical central difference normal vector at world (x, z)
     */
    getTerrainNormal(x, z, eps = 0.5) {
        const hL = this.getTerrainHeight(x - eps, z);
        const hR = this.getTerrainHeight(x + eps, z);
        const hD = this.getTerrainHeight(x, z - eps);
        const hU = this.getTerrainHeight(x, z + eps);
        const normal = new THREE.Vector3(hL - hR, 2 * eps, hD - hU);
        return normal.normalize();
    }

    /**
     * Compute slope angle in radians (0 = completely flat, PI/2 = vertical cliff)
     */
    getTerrainSlope(x, z, eps = 0.5) {
        const normal = this.getTerrainNormal(x, z, eps);
        return Math.acos(Math.max(-1, Math.min(1, normal.y)));
    }


    build() {
        // Encompassing world terrain mesh: 450m x 450m
        const size = 450;
        const segs = 160;
        const groundGeo = new THREE.PlaneGeometry(size, size, segs, segs);
        groundGeo.rotateX(-Math.PI / 2);

        // Deform vertices according to organic terrain height
        const pos = groundGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const vx = pos.getX(i);
            const vz = pos.getZ(i);
            const vy = this.getTerrainHeight(vx, vz);
            pos.setY(i, vy);
        }
        groundGeo.computeVertexNormals();

        // High-Quality Seamless Watercolor Meadow Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Pastoral spring meadow green base
        ctx.fillStyle = '#558e2a';
        ctx.fillRect(0, 0, 512, 512);

        // Radially wrapped watercolor washes for seamless tiling
        const drawToroidalWash = (cx, cy, radius, stops) => {
            for (const ox of [-512, 0, 512]) {
                for (const oy of [-512, 0, 512]) {
                    const px = cx + ox;
                    const py = cy + oy;
                    if (px + radius >= 0 && px - radius <= 512 && py + radius >= 0 && py - radius <= 512) {
                        const radGrad = ctx.createRadialGradient(px, py, 2, px, py, radius);
                        stops.forEach(s => radGrad.addColorStop(s[0], s[1]));
                        ctx.fillStyle = radGrad;
                        ctx.beginPath();
                        ctx.arc(px, py, radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        };

        for (let i = 0; i < 240; i++) {
            const cx = Math.random() * 512;
            const cy = Math.random() * 512;
            const radius = 35 + Math.random() * 75;
            const r = Math.random();

            if (r < 0.45) {
                // Sunlit warm chartreuse highlight
                drawToroidalWash(cx, cy, radius, [
                    [0.0, 'rgba(142, 212, 38, 0.24)'],
                    [0.7, 'rgba(142, 212, 38, 0.08)'],
                    [1.0, 'rgba(142, 212, 38, 0)']
                ]);
            } else if (r < 0.82) {
                // Deep cool mossy emerald shadow
                drawToroidalWash(cx, cy, radius, [
                    [0.0, 'rgba(45, 85, 22, 0.22)'],
                    [0.7, 'rgba(45, 85, 22, 0.06)'],
                    [1.0, 'rgba(45, 85, 22, 0)']
                ]);
            } else {
                // Warm pastoral golden soil accent
                drawToroidalWash(cx, cy, radius, [
                    [0.0, 'rgba(163, 130, 77, 0.15)'],
                    [0.7, 'rgba(163, 130, 77, 0.04)'],
                    [1.0, 'rgba(163, 130, 77, 0)']
                ]);
            }
        }

        const groundTex = new THREE.CanvasTexture(canvas);
        groundTex.wrapS = THREE.RepeatWrapping;
        groundTex.wrapT = THREE.RepeatWrapping;
        groundTex.repeat.set(18, 18);
        groundTex.anisotropy = 8;

        // 1. Procedural High-Frequency Micro-Normal Detail Map (Argon Terrain Spec)
        const nSize = 256;
        const nCanvas = document.createElement('canvas');
        nCanvas.width = nSize;
        nCanvas.height = nSize;
        const nCtx = nCanvas.getContext('2d');
        const nImg = nCtx.createImageData(nSize, nSize);
        const nd = nImg.data;
        let seed = 43758;
        for (let i = 0; i < nd.length; i += 4) {
            seed = (seed * 1664525 + 1013904223) >>> 0;
            const nx = ((seed & 0xFF) / 255.0 - 0.5) * 0.45;
            seed = (seed * 1664525 + 1013904223) >>> 0;
            const ny = ((seed & 0xFF) / 255.0 - 0.5) * 0.45;
            nd[i] = Math.floor((nx * 0.5 + 0.5) * 255);
            nd[i + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
            nd[i + 2] = 238;
            nd[i + 3] = 255;
        }
        nCtx.putImageData(nImg, 0, 0);
        const microNormalTex = new THREE.CanvasTexture(nCanvas);
        microNormalTex.wrapS = microNormalTex.wrapT = THREE.RepeatWrapping;
        microNormalTex.repeat.set(36, 36);
        microNormalTex.anisotropy = 8;

        // 2. Chiseled Cliff Stone Strata Albedo Map for Slopes > 30 deg (Argon Terrain Spec)
        const rSize = 256;
        const rCanvas = document.createElement('canvas');
        rCanvas.width = rSize;
        rCanvas.height = rSize;
        const rCtx = rCanvas.getContext('2d');
        rCtx.fillStyle = '#6b6155'; // Natural weathered cliff stone
        rCtx.fillRect(0, 0, rSize, rSize);
        for (let i = 0; i < 35; i++) {
            const ry = Math.random() * rSize;
            const rh = 3 + Math.random() * 10;
            rCtx.fillStyle = i % 2 === 0 ? 'rgba(68, 60, 52, 0.48)' : 'rgba(142, 132, 120, 0.38)';
            rCtx.fillRect(0, ry, rSize, rh);
        }
        const rockTex = new THREE.CanvasTexture(rCanvas);
        rockTex.wrapS = rockTex.wrapT = THREE.RepeatWrapping;
        rockTex.repeat.set(12, 12);
        rockTex.anisotropy = 8;

        // 3. PBR Ground Material with Triplanar Slope Blending & Micro-Normal Details
        const groundMat = new THREE.MeshStandardMaterial({
            map: groundTex,
            normalMap: microNormalTex,
            normalScale: new THREE.Vector2(0.06, 0.06),
            roughness: 0.88,
            metalness: 0.02
        });

        // Inject Triplanar Slope Blending: Flat -> Lush Grass, Steep -> Cliff Rock
        groundMat.onBeforeCompile = (shader) => {
            shader.uniforms.tRockAlbedo = { value: rockTex };
            shader.uniforms.uSlopeThreshold = { value: 0.72 };
            shader.uniforms.uSlopeFalloff = { value: 0.12 };

            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `#include <common>
                 varying vec3 vWorldNormal;
                 varying vec3 vWorldPosition;`
            );

            shader.vertexShader = shader.vertexShader.replace(
                '#include <defaultnormal_vertex>',
                `#include <defaultnormal_vertex>
                 vWorldNormal = normalize(mat3(modelMatrix) * transformedNormal);`
            );

            shader.vertexShader = shader.vertexShader.replace(
                '#include <worldpos_vertex>',
                `#include <worldpos_vertex>
                 vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                `#include <common>
                 varying vec3 vWorldNormal;
                 varying vec3 vWorldPosition;
                 uniform sampler2D tRockAlbedo;
                 uniform float uSlopeThreshold;
                 uniform float uSlopeFalloff;`
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <map_fragment>',
                `#include <map_fragment>
                 float slope = dot(vWorldNormal, vec3(0.0, 1.0, 0.0));
                 float rockFactor = smoothstep(uSlopeThreshold + uSlopeFalloff, uSlopeThreshold - uSlopeFalloff, slope);
                 vec4 rockColor = texture2D(tRockAlbedo, vWorldPosition.xz * 0.12);
                 diffuseColor.rgb = mix(diffuseColor.rgb, rockColor.rgb, rockFactor);`
            );
        };

        this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
        this.groundMesh.receiveShadow = true;
        this.scene.add(this.groundMesh);
    }
}
