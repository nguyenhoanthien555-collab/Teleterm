import * as THREE from '/vendor/three/build/three.module.js';

/**
 * TELETERM 3D — GHIBLI SKY DOME & TWINKLING STARFIELD SYSTEM
 * Milestone 3: Dynamic Celestial Traversal & Ghibli Atmosphere
 *
 * Implements:
 * 1. Custom WebGL ShaderMaterial with Rayleigh/Mie scattering mapped to inverted sphere (R=750m)
 * 2. Painted Ghibli color banding (stepped threshold quantization mimicking watercolor brush strokes)
 * 3. Solar & Lunar celestial discs with forward Mie scattering and atmospheric corona
 * 4. Spherical point cloud starfield (1,200 stars) with localized non-uniform harmonic twinkling
 * 5. Smooth daytime-to-nighttime crossfade driven by sun elevation
 */

export class GhibliSkyDome {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.group.name = 'GhibliSkyDomeGroup';

        this.skyMesh = null;
        this.starfield = null;
        this.timeOfDay = 12.0;

        this.initSkyShader();
        this.initStarfield();

        if (this.scene) {
            this.scene.add(this.group);
        }

        if (typeof window !== 'undefined') {
            window.ghibliSkyDome = this;
        }
    }

    initSkyShader() {
        const skyGeo = new THREE.SphereGeometry(750, 36, 24);

        const uniforms = {
            uSunPosition: { value: new THREE.Vector3(0, 1, 0) },
            uTime: { value: 0.0 },
            uSkyTopColor: { value: new THREE.Color(0x1976d2) },
            uSkyHorizonColor: { value: new THREE.Color(0xbbdefb) },
            uSkyGroundColor: { value: new THREE.Color(0x334155) },
            uSunGlowColor: { value: new THREE.Color(0xfff3d6) },
            uGhibliBands: { value: 6.0 },
            uNightFactor: { value: 0.0 }
        };

        const vertexShader = `
            varying vec3 vDirection;
            varying vec3 vWorldPosition;

            void main() {
                vDirection = normalize(position);
                vec4 worldPos = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPos.xyz;
                gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
        `;

        const fragmentShader = `
            uniform vec3 uSunPosition;
            uniform vec3 uSkyTopColor;
            uniform vec3 uSkyHorizonColor;
            uniform vec3 uSkyGroundColor;
            uniform vec3 uSunGlowColor;
            uniform float uGhibliBands;
            uniform float uNightFactor;
            uniform float uTime;

            varying vec3 vDirection;
            varying vec3 vWorldPosition;

            void main() {
                vec3 dir = normalize(vDirection);
                float elevation = clamp(dir.y, 0.0, 1.0);

                // 1. Ghibli Stepped Quantization (Mimicking painted brush strokes)
                float bands = max(2.0, uGhibliBands);
                float stepIndex = floor(elevation * bands);
                float stepProgress = fract(elevation * bands);
                // Soft sigmoid edge to each painted color band
                float smoothEdge = smoothstep(0.0, 0.35, stepProgress) * 0.85 + stepProgress * 0.15;
                float finalElevation = (stepIndex + smoothEdge) / bands;

                vec3 skyColor = mix(uSkyHorizonColor, uSkyTopColor, pow(clamp(finalElevation, 0.0, 1.0), 0.88));

                // Ground hemisphere blend below horizon
                if (dir.y < 0.0) {
                    skyColor = mix(uSkyHorizonColor, uSkyGroundColor, clamp(-dir.y * 2.8, 0.0, 1.0));
                }

                // 2. Solar Disc & Mie Forward Scattering
                vec3 sunDir = normalize(uSunPosition);
                float cosSun = dot(dir, sunDir);

                // Mie forward scatter (atmospheric corona)
                float mieCorona = pow(max(0.0, cosSun), 28.0) * 0.42 * (1.0 - uNightFactor * 0.95);
                // Sharp anime sun disc with subtle glow rim
                float sunDisc = smoothstep(0.9972, 0.9992, cosSun) * 1.35 * (1.0 - uNightFactor);

                vec3 finalColor = skyColor + uSunGlowColor * (mieCorona + sunDisc);

                // 3. Lunar Disc & Soft Silvery Moon Halo
                vec3 moonDir = -sunDir;
                float cosMoon = dot(dir, moonDir);
                float moonDisc = smoothstep(0.9978, 0.9994, cosMoon) * 1.25 * uNightFactor;
                float moonHalo = pow(max(0.0, cosMoon), 22.0) * 0.30 * uNightFactor;
                vec3 moonTint = vec3(0.82, 0.92, 1.0);

                finalColor += moonTint * (moonDisc + moonHalo);

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        this.skyMaterial = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            side: THREE.BackSide,
            depthWrite: false,
            fog: false
        });

        this.skyMesh = new THREE.Mesh(skyGeo, this.skyMaterial);
        this.group.add(this.skyMesh);
    }

    initStarfield() {
        const starCount = 1200;
        const starGeo = new THREE.BufferGeometry();

        const positions = new Float32Array(starCount * 3);
        const twinkleFreqs = new Float32Array(starCount);
        const twinklePhases = new Float32Array(starCount);
        const starSizes = new Float32Array(starCount);

        const radius = 740;

        for (let i = 0; i < starCount; i++) {
            // Distribute across upper hemisphere (elevation y between 0.06 and 1.0)
            const phi = Math.acos(THREE.MathUtils.randFloat(0.06, 0.98));
            const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);

            positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.cos(phi);
            positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

            twinkleFreqs[i] = THREE.MathUtils.randFloat(1.5, 4.0);
            twinklePhases[i] = THREE.MathUtils.randFloat(0, Math.PI * 2);
            starSizes[i] = THREE.MathUtils.randFloat(2.5, 5.0);
        }

        starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeo.setAttribute('aFreq', new THREE.BufferAttribute(twinkleFreqs, 1));
        starGeo.setAttribute('aPhase', new THREE.BufferAttribute(twinklePhases, 1));
        starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));

        const starUniforms = {
            uTime: { value: 0.0 },
            uNightFactor: { value: 0.0 }
        };

        const starVertexShader = `
            attribute float aFreq;
            attribute float aPhase;
            attribute float aSize;

            uniform float uTime;
            uniform float uNightFactor;

            varying float vAlpha;

            void main() {
                // Non-uniform harmonic twinkle: sin(t * freq + phase)
                float twinkle = 0.65 + 0.35 * sin(uTime * aFreq + aPhase);
                vAlpha = twinkle * uNightFactor;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = aSize * (300.0 / -mvPosition.z) * (0.8 + 0.2 * twinkle);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;

        const starFragmentShader = `
            varying float vAlpha;

            void main() {
                if (vAlpha <= 0.01) discard;

                // Circular anti-aliased star point
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if (dist > 0.5) discard;

                float core = smoothstep(0.5, 0.0, dist);
                vec3 starColor = vec3(0.92, 0.96, 1.0);

                gl_FragColor = vec4(starColor, core * vAlpha);
            }
        `;

        this.starMaterial = new THREE.ShaderMaterial({
            uniforms: starUniforms,
            vertexShader: starVertexShader,
            fragmentShader: starFragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.starfield = new THREE.Points(starGeo, this.starMaterial);
        this.group.add(this.starfield);
    }

    /**
     * Updates celestial shader uniforms based on sun position and time-of-day
     */
    update(delta, sunDir, timeOfDay, atmosphereColors = null) {
        this.timeOfDay = timeOfDay;

        // 1. Calculate night factor (1.0 at midnight, 0.0 at midday)
        // Twilight transition between 17:30 and 20:00 (sunset), and 05:00 and 07:30 (sunrise)
        let nightFactor = 0.0;
        if (timeOfDay >= 20.0 || timeOfDay < 5.0) {
            nightFactor = 1.0;
        } else if (timeOfDay >= 17.5 && timeOfDay < 20.0) {
            nightFactor = (timeOfDay - 17.5) / 2.5; // Smoothstep to night
        } else if (timeOfDay >= 5.0 && timeOfDay < 7.5) {
            nightFactor = 1.0 - ((timeOfDay - 5.0) / 2.5); // Smoothstep to day
        }

        const nowSec = performance.now() / 1000.0;

        if (this.skyMaterial) {
            this.skyMaterial.uniforms.uTime.value = nowSec;
            this.skyMaterial.uniforms.uNightFactor.value = nightFactor;

            if (sunDir) {
                this.skyMaterial.uniforms.uSunPosition.value.copy(sunDir);
            }

            if (atmosphereColors) {
                if (atmosphereColors.skyTop) this.skyMaterial.uniforms.uSkyTopColor.value.copy(atmosphereColors.skyTop);
                if (atmosphereColors.skyHorizon) this.skyMaterial.uniforms.uSkyHorizonColor.value.copy(atmosphereColors.skyHorizon);
                if (atmosphereColors.sunColor) this.skyMaterial.uniforms.uSunGlowColor.value.copy(atmosphereColors.sunColor);
            }
        }

        if (this.starMaterial) {
            this.starMaterial.uniforms.uTime.value = nowSec;
            this.starMaterial.uniforms.uNightFactor.value = nightFactor;
        }
    }
}
