import * as THREE from 'three';

/**
 * ZEN KOI POND & ROCK WATERFALL CASCADE SYSTEM
 * Part of TeleTerm Living World & In-World 3D Hologram Ecosystem.
 * 
 * Features:
 * - Organic kidney-shaped pond basin surrounded by mossy river stones and stone lanterns
 * - Cascading rock waterfall connecting the Maple stream to the pond with animated foam
 * - 16 Swimming Koi Fish using InstancedMesh with GPU sinusoidal spine wave deformation
 * - Floating water lilies & lotus blossoms
 * - Bioluminescent glow at dusk/night & eco-cyber attraction to holographic light
 */
export class ZenPondSystem {
    constructor(scene, terrainSystem, waterSystem = null) {
        this.scene = scene;
        this.terrain = terrainSystem;
        this.waterSystem = waterSystem;

        // Pond Basin Center & Boundaries (Autumn Maple Valley, outside Hub workspace)
        this.center = new THREE.Vector3(38.0, 0, -26.0);
        this.radiusX = 5.2;
        this.radiusZ = 4.0;
        this.waterElevation = 0; // Derived from terrain

        // Meshes
        this.group = new THREE.Group();
        this.group.name = 'ZenPondSystem';
        this.waterMesh = null;
        this.koiMesh = null;
        this.liliesMesh = null;
        this.waterfallMesh = null;
        this.mistParticles = null;
        this.lanternLight = null;

        // Koi Fish State
        this.koiCount = 16;
        this.koiData = [];
        this.koiUniforms = null;

        // Waterfall State
        this.waterfallUniforms = null;
    }

    build() {
        const baseElevation = this.terrain ? this.terrain.getTerrainHeight(this.center.x, this.center.z) : 0.8;
        this.waterElevation = baseElevation - 0.28;
        this.center.y = this.waterElevation;

        // 1. Build Stone Embankment & Basin
        this.buildPondBasin();

        // 2. Build Translucent Crystalline Water Surface
        this.buildWaterSurface();

        // 3. Build Cascading Rock Waterfall & Plunge Foam
        this.buildWaterfall();

        // 4. Build Floating Water Lilies & Lotus Blossoms
        this.buildWaterLilies();

        // 5. Build Swimming Koi Fish (GPU Vertex Spine Animation)
        this.buildKoiFish();

        // 6. Build Zen Garden Accents: Kasuga Stone Lantern
        this.buildStoneLantern();

        this.scene.add(this.group);
    }

    buildPondBasin() {
        const basinGroup = new THREE.Group();

        // Stone boundary ring around the oval pond perimeter
        const stoneCount = 36;
        const stoneGeo = new THREE.DodecahedronGeometry(0.52, 1);
        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0x475569, // Slate river rock
            roughness: 0.85,
            metalness: 0.12
        });

        const dummy = new THREE.Object3D();
        const instancedStones = new THREE.InstancedMesh(stoneGeo, stoneMat, stoneCount);
        instancedStones.castShadow = true;
        instancedStones.receiveShadow = true;

        for (let i = 0; i < stoneCount; i++) {
            const angle = (i / stoneCount) * Math.PI * 2;
            const noise = Math.sin(angle * 3.5) * 0.35;
            const rx = this.radiusX + noise;
            const rz = this.radiusZ + noise * 0.75;

            const px = this.center.x + Math.cos(angle) * rx;
            const pz = this.center.z + Math.sin(angle) * rz;
            const py = (this.terrain ? this.terrain.getTerrainHeight(px, pz) : this.waterElevation) + 0.16;

            dummy.position.set(px, py, pz);
            dummy.scale.set(
                0.8 + Math.random() * 0.45,
                0.6 + Math.random() * 0.35,
                0.8 + Math.random() * 0.45
            );
            dummy.rotation.set(Math.random() * 0.4, angle + Math.random() * 0.5, Math.random() * 0.4);
            dummy.updateMatrix();
            instancedStones.setMatrixAt(i, dummy.matrix);
        }
        instancedStones.instanceMatrix.needsUpdate = true;
        basinGroup.add(instancedStones);

        // Organic Gravel bottom basin bed (true elliptical geometry, ZERO square corners)
        const bedGeo = new THREE.CircleGeometry(1.0, 32);
        bedGeo.scale(this.radiusX * 1.08, this.radiusZ * 1.08, 1.0);
        bedGeo.rotateX(-Math.PI / 2);
        const bPos = bedGeo.attributes.position;
        for (let i = 0; i < bPos.count; i++) {
            const x = bPos.getX(i);
            const z = bPos.getZ(i);
            const distNorm = Math.hypot(x / (this.radiusX * 1.08), z / (this.radiusZ * 1.08));
            const depth = distNorm < 1.0 ? Math.cos(distNorm * Math.PI * 0.5) * 0.65 : 0.0;
            bPos.setY(i, -depth);
        }
        bedGeo.computeVertexNormals();

        const bedMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b, // Dark alluvial gravel
            roughness: 0.94,
            metalness: 0.05
        });
        const bedMesh = new THREE.Mesh(bedGeo, bedMat);
        bedMesh.position.copy(this.center);
        bedMesh.receiveShadow = true;
        basinGroup.add(bedMesh);

        this.group.add(basinGroup);
    }

    buildWaterSurface() {
        // True organic elliptical water disc (Zero square corners, zero Hub clipping)
        const waterGeo = new THREE.CircleGeometry(1.0, 48);
        waterGeo.scale(this.radiusX, this.radiusZ, 1.0);
        waterGeo.rotateX(-Math.PI / 2);

        // Natural translucent jade/teal water material matching Autumn Maple Valley
        const waterMat = new THREE.MeshStandardMaterial({
            color: 0x164e63, // Deep natural translucent teal
            roughness: 0.06,
            metalness: 0.22,
            transparent: true,
            opacity: 0.84,
            depthWrite: false
        });

        this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
        this.waterMesh.position.set(this.center.x, this.waterElevation + 0.02, this.center.z);
        this.waterMesh.receiveShadow = true;
        this.waterMesh.renderOrder = 4;
        this.group.add(this.waterMesh);

        if (this.waterSystem && this.waterSystem.waterMeshes) {
            this.waterSystem.waterMeshes.push(this.waterMesh);
        }
    }

    buildWaterfall() {
        const fallGroup = new THREE.Group();

        // Waterfall coordinates: Cascades from upper stream (x: 40.0, z: -29.8, y: +1.25) into pond (x: 38.6, z: -28.2)
        const topPos = new THREE.Vector3(40.0, this.waterElevation + 1.25, -29.8);
        const bottomPos = new THREE.Vector3(38.6, this.waterElevation, -28.2);

        // Stacked granite ledge boulders forming the cascade steps
        const rockGeo = new THREE.DodecahedronGeometry(0.85, 1);
        const rockMat = new THREE.MeshStandardMaterial({
            color: 0x334155,
            roughness: 0.82,
            metalness: 0.15
        });

        const r1 = new THREE.Mesh(rockGeo, rockMat);
        r1.position.set(40.4, this.waterElevation + 0.8, -29.4);
        r1.scale.set(1.4, 0.9, 1.2);
        fallGroup.add(r1);

        const r2 = new THREE.Mesh(rockGeo, rockMat);
        r2.position.set(39.2, this.waterElevation + 0.45, -28.9);
        r2.scale.set(1.1, 0.7, 1.3);
        fallGroup.add(r2);

        const r3 = new THREE.Mesh(rockGeo, rockMat);
        r3.position.set(38.2, this.waterElevation + 0.35, -28.1);
        r3.scale.set(1.2, 0.8, 1.0);
        fallGroup.add(r3);

        // Animated Cascading Water Curtain Sheet
        const curtainGeo = new THREE.PlaneGeometry(1.6, 1.8, 12, 16);
        curtainGeo.rotateX(-Math.PI * 0.32);

        this.waterfallUniforms = {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(0x38bdf8) },
            uFoamColor: { value: new THREE.Color(0xf8fafc) }
        };

        const curtainMat = new THREE.ShaderMaterial({
            uniforms: this.waterfallUniforms,
            vertexShader: `
                uniform float uTime;
                varying vec2 vUv;
                varying float vElevation;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    // Turbulence fluttering
                    pos.z += sin(pos.y * 8.0 - uTime * 14.0) * 0.05 * (1.0 - uv.y);
                    vElevation = pos.y;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uColor;
                uniform vec3 uFoamColor;
                varying vec2 vUv;
                varying float vElevation;
                void main() {
                    // Vertical cascading streaks
                    float streak = sin((vUv.x * 24.0) + sin(vUv.y * 12.0 - uTime * 8.0));
                    float foam = step(0.15, streak * sin(vUv.y * 30.0 - uTime * 18.0));
                    
                    // Foam denser near bottom impact
                    float bottomFoam = smoothstep(0.4, 0.0, vUv.y);
                    foam = max(foam * 0.6, bottomFoam * 0.85);

                    vec3 finalColor = mix(uColor, uFoamColor, foam);
                    float alpha = mix(0.72, 0.95, foam);
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        this.waterfallMesh = new THREE.Mesh(curtainGeo, curtainMat);
        this.waterfallMesh.position.set(39.1, this.waterElevation + 0.68, -28.8);
        this.waterfallMesh.renderOrder = 5;
        fallGroup.add(this.waterfallMesh);

        // Foam splash pool at plunge zone
        const plungeGeo = new THREE.RingGeometry(0.2, 1.3, 16);
        plungeGeo.rotateX(-Math.PI / 2);
        const plungeMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.55,
            depthWrite: false
        });
        const plungeMesh = new THREE.Mesh(plungeGeo, plungeMat);
        plungeMesh.position.set(bottomPos.x, this.waterElevation + 0.03, bottomPos.z);
        plungeMesh.renderOrder = 5;
        fallGroup.add(plungeMesh);

        this.group.add(fallGroup);
    }

    buildWaterLilies() {
        const lilyCount = 14;
        const lilyGeo = new THREE.CircleGeometry(0.38, 14, 0, Math.PI * 1.82); // Notch cutout for authentic Japanese lily pad
        lilyGeo.rotateX(-Math.PI / 2);

        const padMat = new THREE.MeshStandardMaterial({
            color: 0x15803d, // Rich lily green
            roughness: 0.65,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        this.liliesMesh = new THREE.InstancedMesh(lilyGeo, padMat, lilyCount);
        this.liliesMesh.receiveShadow = true;

        const dummy = new THREE.Object3D();
        const blossomGeo = new THREE.ConeGeometry(0.12, 0.16, 6);
        const blossomMat = new THREE.MeshStandardMaterial({
            color: 0xf472b6, // Lotus pink
            roughness: 0.4
        });
        const blossomGroup = new THREE.Group();

        for (let i = 0; i < lilyCount; i++) {
            const angle = (i / lilyCount) * Math.PI * 2 + 0.3;
            const dist = 0.9 + (i % 4) * 0.65;
            const lx = this.center.x + Math.cos(angle) * (dist * 1.15);
            const lz = this.center.z + Math.sin(angle) * (dist * 0.9);
            const ly = this.waterElevation + 0.025;

            dummy.position.set(lx, ly, lz);
            dummy.scale.setScalar(0.75 + (i % 3) * 0.25);
            dummy.rotation.y = angle * 2.3;
            dummy.updateMatrix();
            this.liliesMesh.setMatrixAt(i, dummy.matrix);

            // Add pink lotus blossom to every 3rd pad
            if (i % 3 === 0) {
                const b = new THREE.Mesh(blossomGeo, blossomMat);
                b.position.set(lx, ly + 0.08, lz);
                b.rotation.y = Math.random() * Math.PI;
                blossomGroup.add(b);
            }
        }
        this.liliesMesh.instanceMatrix.needsUpdate = true;
        this.group.add(this.liliesMesh);
        this.group.add(blossomGroup);
    }

    buildKoiFish() {
        // Low-poly stylized Japanese Koi Fish geometry:
        // Torso tapered from head to tail, pectoral fins, dorsal fin, caudal fin
        const fishGeo = new THREE.BufferGeometry();
        
        // 8 Body cross-sections along Z axis (head at Z=-0.45, tail at Z=+0.45)
        const vertices = [];
        const uvs = [];
        const indices = [];

        const segments = 7;
        const rings = 6;
        for (let i = 0; i <= segments; i++) {
            const tz = i / segments; // 0 to 1
            const z = -0.42 + tz * 0.84;
            // Spindle profile (widest at tz=0.3)
            const radius = Math.sin(tz * Math.PI) * (0.09 + 0.04 * (1.0 - tz));
            const yRadius = radius * 1.25; // Lateral compression

            for (let j = 0; j <= rings; j++) {
                const tr = (j / rings) * Math.PI * 2;
                const x = Math.cos(tr) * radius;
                const y = Math.sin(tr) * yRadius;
                vertices.push(x, y, z);
                uvs.push(j / rings, tz);
            }
        }

        // Indices for body cylinder rings
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < rings; j++) {
                const a = i * (rings + 1) + j;
                const b = a + (rings + 1);
                indices.push(a, b, a + 1);
                indices.push(a + 1, b, b + 1);
            }
        }

        // Add Caudal Tail Fin (triangles extending back from Z=0.42 to 0.65)
        const tailBaseIdx = vertices.length / 3;
        vertices.push(
            0.0,  0.02, 0.42, // Tail root top
            0.0, -0.02, 0.42, // Tail root bot
            0.0,  0.12, 0.64, // Tail tip top
            0.0, -0.10, 0.64  // Tail tip bot
        );
        uvs.push(0.5, 0.85, 0.5, 0.85, 0.5, 1.0, 0.5, 1.0);
        indices.push(tailBaseIdx, tailBaseIdx + 1, tailBaseIdx + 2);
        indices.push(tailBaseIdx + 1, tailBaseIdx + 3, tailBaseIdx + 2);

        fishGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        fishGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        fishGeo.setIndex(indices);
        fishGeo.computeVertexNormals();

        // Custom Shader Material for Swimming Koi Fish:
        // GPU Sinusoidal Spine Wave: x' = x + A_max * pow(clamp(z/L, 0.0, 1.0), 1.6) * sin(time * freq - kappa*z + phi)
        this.koiUniforms = {
            uTime: { value: 0 },
            uBioluminescent: { value: 0.0 }
        };

        const koiShaderMat = new THREE.ShaderMaterial({
            uniforms: this.koiUniforms,
            vertexShader: `
                uniform float uTime;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vWorldPos;

                void main() {
                    vUv = uv;
                    vec3 pos = position;

                    // Sinusoidal spine wave along body Z axis
                    // Head (z < 0) remains stable, body and tail (z > 0) flex organically
                    float zNorm = clamp((pos.z + 0.42) / 0.84, 0.0, 1.0);
                    float flexFactor = pow(zNorm, 1.6);
                    
                    // High-frequency natural swimming undulation
                    float wave = sin(uTime * 6.5 - pos.z * 7.5);
                    pos.x += wave * 0.065 * flexFactor;

                    // Transform via instance matrix
                    vec4 worldPos = instanceMatrix * vec4(pos, 1.0);
                    vWorldPos = worldPos.xyz;
                    vNormal = normalize((instanceMatrix * vec4(normal, 0.0)).xyz);
                    gl_Position = projectionMatrix * viewMatrix * worldPos;
                }
            `,
            fragmentShader: `
                uniform float uBioluminescent;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vWorldPos;

                void main() {
                    // Japanese Koi Color Patterns:
                    // Kohaku (Pure white base with vermilion-orange patches)
                    vec3 whiteBase = vec3(0.96, 0.95, 0.92);
                    vec3 redPatch = vec3(0.92, 0.22, 0.08);
                    vec3 goldPatch = vec3(0.95, 0.72, 0.12);
                    vec3 blackPatch = vec3(0.12, 0.12, 0.14);

                    // Procedural spotted markings on scales
                    float pattern = sin(vUv.x * 6.28) * sin(vUv.y * 14.0 + vWorldPos.x * 0.8);
                    vec3 color = whiteBase;

                    if (pattern > 0.15) {
                        color = redPatch;
                    } else if (pattern < -0.65) {
                        color = blackPatch;
                    } else if (vUv.y > 0.7) {
                        color = mix(color, redPatch, 0.5);
                    }

                    // Sunlight lighting
                    vec3 lightDir = normalize(vec3(0.4, 0.8, 0.3));
                    float diff = max(dot(vNormal, lightDir), 0.2);
                    vec3 litColor = color * (0.55 + diff * 0.55);

                    // Bioluminescent night glow
                    vec3 glowColor = vec3(0.2, 0.9, 0.7) * uBioluminescent * 0.6;
                    litColor += glowColor;

                    gl_FragColor = vec4(litColor, 0.92);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.koiMesh = new THREE.InstancedMesh(fishGeo, koiShaderMat, this.koiCount);
        this.koiMesh.castShadow = true;
        this.koiMesh.frustumCulled = false;

        // Initialize organic swim paths for each Koi fish
        for (let i = 0; i < this.koiCount; i++) {
            this.koiData.push({
                angle: (i / this.koiCount) * Math.PI * 2,
                orbitRadiusX: 1.6 + (i % 5) * 0.55,
                orbitRadiusZ: 1.2 + (i % 4) * 0.48,
                speed: 0.45 + (i % 3) * 0.15,
                depthOffset: -0.18 - (i % 4) * 0.08,
                phase: Math.random() * Math.PI * 2
            });
        }

        this.updateKoiPositions(0);
        this.group.add(this.koiMesh);
    }

    buildStoneLantern() {
        // Traditional Japanese Kasuga Stone Lantern (Tōrō) on pond shore
        const lanternGroup = new THREE.Group();
        const lx = this.center.x - this.radiusX * 0.85;
        const lz = this.center.z + this.radiusZ * 0.75;
        const ly = (this.terrain ? this.terrain.getTerrainHeight(lx, lz) : this.waterElevation) + 0.1;
        lanternGroup.position.set(lx, ly, lz);

        const stoneMat = new THREE.MeshStandardMaterial({
            color: 0x64748b,
            roughness: 0.9
        });

        // 1. Base pedestal
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.25, 6), stoneMat);
        base.position.y = 0.125;
        lanternGroup.add(base);

        // 2. Shaft pillar
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.8, 6), stoneMat);
        shaft.position.y = 0.65;
        lanternGroup.add(shaft);

        // 3. Middle platform
        const mid = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.15, 6), stoneMat);
        mid.position.y = 1.1;
        lanternGroup.add(mid);

        // 4. Firebox with glowing lantern core
        const coreGeo = new THREE.BoxGeometry(0.32, 0.35, 0.32);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Warm lantern candlelight
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.y = 1.35;
        lanternGroup.add(core);

        // 5. Pagoda roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.35, 6), stoneMat);
        roof.position.y = 1.7;
        lanternGroup.add(roof);

        // Warm point light for night illumination
        this.lanternLight = new THREE.PointLight(0xfef08a, 0.8, 8.0);
        this.lanternLight.position.set(0, 1.35, 0);
        lanternGroup.add(this.lanternLight);

        this.group.add(lanternGroup);
    }

    updateKoiPositions(time, playerPos = null) {
        if (!this.koiMesh) return;

        const dummy = new THREE.Object3D();
        for (let i = 0; i < this.koiCount; i++) {
            const k = this.koiData[i];
            
            // Advance orbital swim angle around pond basin
            k.angle += k.speed * 0.015;
            
            // Subtle Lissajous perturbation
            let x = this.center.x + Math.cos(k.angle) * k.orbitRadiusX + Math.sin(k.angle * 2.3 + k.phase) * 0.4;
            let z = this.center.z + Math.sin(k.angle) * k.orbitRadiusZ + Math.cos(k.angle * 1.8 + k.phase) * 0.4;
            let y = this.waterElevation + k.depthOffset + Math.sin(time * 1.2 + k.phase) * 0.04;

            // Eco-Cyber Reactivity: If player is standing within 6m of pond shore with active hologram,
            // Koi gently veer toward the light source!
            if (playerPos) {
                const distToPlayer = Math.hypot(playerPos.x - this.center.x, playerPos.z - this.center.z);
                if (distToPlayer < 7.5) {
                    const steerX = (playerPos.x - x) * 0.08;
                    const steerZ = (playerPos.z - z) * 0.08;
                    x += steerX;
                    z += steerZ;
                }
            }

            // Derive heading forward vector for natural orientation
            const nextAngle = k.angle + 0.05;
            const nextX = this.center.x + Math.cos(nextAngle) * k.orbitRadiusX;
            const nextZ = this.center.z + Math.sin(nextAngle) * k.orbitRadiusZ;
            const heading = Math.atan2(nextX - x, nextZ - z);

            dummy.position.set(x, y, z);
            dummy.rotation.set(0, heading, 0);
            dummy.scale.set(0.9, 0.9, 0.9);
            dummy.updateMatrix();

            this.koiMesh.setMatrixAt(i, dummy.matrix);
        }
        this.koiMesh.instanceMatrix.needsUpdate = true;
    }

    update(delta, timeOfDay = null, playerPos = null) {
        const time = performance.now() * 0.001;

        // Update Waterfall Shaders
        if (this.waterfallUniforms) {
            this.waterfallUniforms.uTime.value = time;
        }

        // Update Koi Fish Swimming & Shaders
        if (this.koiUniforms) {
            this.koiUniforms.uTime.value = time;
            // Nighttime bioluminescence
            const isNight = timeOfDay ? (timeOfDay < 0.25 || timeOfDay > 0.75) : false;
            this.koiUniforms.uBioluminescent.value = isNight ? 1.0 : 0.0;
            if (this.lanternLight) {
                this.lanternLight.intensity = isNight ? 1.4 : 0.2;
            }
        }

        // Update Swimming Koi transforms along paths
        this.updateKoiPositions(time, playerPos);
    }
}
