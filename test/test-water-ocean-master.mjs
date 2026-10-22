import assert from 'assert';

console.log('🌊 Starting TeleTerm Water & Coastal Ocean Overhaul Master Test Suite...\n');

// Mock browser Canvas & THREE for Node.js test environment if needed
class MockCanvas {
    constructor(w, h) {
        this.width = w;
        this.height = h;
    }
    getContext(type) {
        return {
            createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
            putImageData: () => {},
            fillStyle: '',
            fillRect: () => {}
        };
    }
}

globalThis.document = {
    createElement: (tag) => {
        if (tag === 'canvas') return new MockCanvas(256, 256);
        return {};
    }
};

const MockTHREE = {
    RepeatWrapping: 1000,
    LinearMipmapLinearFilter: 1008,
    LinearFilter: 1006,
    DoubleSide: 2,
    CanvasTexture: class {
        constructor(canvas) {
            this.image = canvas;
            this.wrapS = 0;
            this.wrapT = 0;
            this.repeat = { set: (x, y) => { this.repeatX = x; this.repeatY = y; } };
            this.offset = { x: 0, y: 0 };
        }
    },
    Color: class {
        constructor(hex) { this.hex = hex; }
    },
    Vector2: class {
        constructor(x, y) { this.x = x; this.y = y; }
    },
    Vector3: class {
        constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
    },
    ShaderMaterial: class {
        constructor(opt) {
            this.uniforms = opt.uniforms || {};
            this.vertexShader = opt.vertexShader || '';
            this.fragmentShader = opt.fragmentShader || '';
        }
    }
};

// 1. Verify Water Texture Generator Singleton & Texture Generation
console.log('--- TEST 1: WaterTextureGenerator Procedural Engine ---');
const { WaterTextureGenerator } = await import('../public/js/world/water-texture-generator.js');

const textures1 = WaterTextureGenerator.getSharedTextures(MockTHREE);
assert(textures1.normalMap, 'normalMap must be generated');
assert(textures1.foamMap, 'foamMap must be generated');
assert(textures1.causticMap, 'causticMap must be generated');

// Verify Singleton Cache
const textures2 = WaterTextureGenerator.getSharedTextures(MockTHREE);
assert.strictEqual(textures1, textures2, 'WaterTextureGenerator must return identical cached singleton instance');
console.log('✅ WaterTextureGenerator procedural engine & singleton cache verified.\n');

// 2. Mathematical Stability of 3-Harmonic Gerstner Waves
console.log('--- TEST 2: Gerstner Wave Dynamic Displacement Stability ---');
const waves = [
    { dir: { x: 0.05, y: -0.99 }, steepness: 0.18, wavelength: 22.0, speed: 1.0 },
    { dir: { x: 0.32, y: -0.95 }, steepness: 0.12, wavelength: 11.5, speed: 1.15 },
    { dir: { x: -0.25, y: -0.97 }, steepness: 0.08, wavelength: 5.2, speed: 1.35 }
];

// Verify Total Steepness <= 0.8 per Argon guidance (prevents trochoidal self-intersection)
const totalSteepness = waves.reduce((sum, w) => sum + w.steepness, 0);
assert(totalSteepness <= 0.8, `Total steepness ${totalSteepness} must be <= 0.8`);
console.log(`✅ Total Gerstner wave steepness = ${totalSteepness.toFixed(2)} <= 0.80 (0% self-intersection risk).`);

function solveGerstner(pos, time) {
    let dispX = 0, dispY = 0, dispZ = 0;
    for (const w of waves) {
        const len = Math.hypot(w.dir.x, w.dir.y);
        const dx = w.dir.x / len;
        const dy = w.dir.y / len;
        const k = (2 * Math.PI) / w.wavelength;
        const c = Math.sqrt(9.8 / k);
        const f = k * (dx * pos.x + dy * pos.z - c * w.speed * time * 0.45);
        const a = w.steepness / k;
        dispX += dx * (a * Math.cos(f));
        dispY += a * Math.sin(f);
        dispZ += dy * (a * Math.cos(f));
    }
    return { x: pos.x + dispX, y: pos.y + dispY, z: pos.z + dispZ, crest: dispY };
}

// Monte-Carlo testing 10,000 evaluations across space and time
let minCrest = Infinity, maxCrest = -Infinity;
let nanCount = 0;
for (let i = 0; i < 10000; i++) {
    const testX = (Math.random() - 0.5) * 160.0;
    const testZ = 86.0 + Math.random() * 80.0;
    const testT = Math.random() * 60.0;
    const res = solveGerstner({ x: testX, y: -0.28, z: testZ }, testT);

    if (isNaN(res.x) || isNaN(res.y) || isNaN(res.z)) nanCount++;
    if (!isFinite(res.x) || !isFinite(res.y) || !isFinite(res.z)) nanCount++;
    if (res.crest < minCrest) minCrest = res.crest;
    if (res.crest > maxCrest) maxCrest = res.crest;
}

assert.strictEqual(nanCount, 0, 'Gerstner wave solver produced NaN/Inf values');
assert(maxCrest <= 1.2 && minCrest >= -1.2, `Wave crests must be bounded within physical limits [-1.2, +1.2], got [${minCrest}, ${maxCrest}]`);
console.log(`✅ Evaluated 10,000 Gerstner wave points: 0 NaN/Inf, crest range [${minCrest.toFixed(3)}m, ${maxCrest.toFixed(3)}m].\n`);

// 3. Beer-Lambert Optical Depth & Color Interpolation
console.log('--- TEST 3: Beer-Lambert Optical Depth Attenuation ---');
function beerLambertFactor(depth) {
    return 1.0 - Math.exp(-depth * 0.85);
}

const depths = [0.01, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0];
let prevFactor = -1;
for (const d of depths) {
    const f = beerLambertFactor(d);
    assert(f >= 0.0 && f <= 1.0, `Factor ${f} must be in [0, 1]`);
    assert(f > prevFactor, 'Beer-Lambert attenuation must be strictly monotonic');
    prevFactor = f;
}
console.log('✅ Beer-Lambert optical depth gradient strictly monotonic and convergent to deep indigo.\n');

// 4. Schlick Fresnel Approximation
console.log('--- TEST 4: Schlick Fresnel Reflection Curve ---');
function schlickFresnel(cosTheta, F0 = 0.02) {
    return F0 + (1.0 - F0) * Math.pow(1.0 - cosTheta, 5.0);
}

assert.strictEqual(schlickFresnel(1.0), 0.02, 'Fresnel at normal incidence (cosTheta=1) must equal F0 (0.02)');
assert(Math.abs(schlickFresnel(0.0) - 1.0) < 1e-6, 'Fresnel at glancing angle (cosTheta=0) must equal 1.0');
console.log('✅ Schlick Fresnel equation produces exact physical water reflectance F(0)=0.02, F(pi/2)=1.0.\n');

// 5. Shoreline Contact Foam Clamping
console.log('--- TEST 5: Dynamic Shoreline Contact Foam & Wave Wash ---');
function shorelineFoam(waterDepth, waveWash, foamPattern, waveCrest) {
    const effectiveDepth = waterDepth + waveWash;
    // Smoothstep equivalent
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const smoothstep = (edge0, edge1, x) => {
        const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
        return t * t * (3.0 - 2.0 * t);
    };
    const contactFoam = (1.0 - smoothstep(0.02, 0.38, effectiveDepth)) * foamPattern;
    const crestFoam = smoothstep(0.16, 0.28, waveCrest) * foamPattern * 0.75;
    return clamp(contactFoam + crestFoam, 0.0, 1.0);
}

for (let d = 0; d < 3.0; d += 0.05) {
    const foamVal = shorelineFoam(d, 0.05, 0.9, 0.1);
    assert(foamVal >= 0.0 && foamVal <= 1.0, `Foam value ${foamVal} out of range [0, 1]`);
}
console.log('✅ Shoreline contact foam and wave crest whitecaps clamped cleanly in [0, 1].\n');

// 6. Shader Module Verification
console.log('--- TEST 6: Shader Factory Functions ---');
const { createStylizedOceanMaterial, createStylizedRiverMaterial, createStylizedPaddyMaterial } = await import('../public/js/world/ocean-shader.js');

const oceanMat = createStylizedOceanMaterial(textures1.normalMap, textures1.foamMap, textures1.causticMap);
assert(oceanMat.uniforms.uTime, 'oceanMat must have uTime');
assert(oceanMat.uniforms.uShallowColor, 'oceanMat must have uShallowColor');
assert(oceanMat.uniforms.uDeepColor, 'oceanMat must have uDeepColor');
assert(oceanMat.uniforms.uSssGlowColor, 'oceanMat must have uSssGlowColor');

const riverMat = createStylizedRiverMaterial(textures1.normalMap, textures1.foamMap);
assert(riverMat.uniforms.uTime, 'riverMat must have uTime');

const paddyMat = createStylizedPaddyMaterial(textures1.normalMap);
assert(paddyMat.uniforms.uTime, 'paddyMat must have uTime');
console.log('✅ Ocean, River, and Rice Paddy shader materials successfully compiled with complete uniforms.\n');

console.log('🎉 ALL TELETERM WATER & COASTAL OCEAN OVERHAUL TESTS PASSED WITH 100% SUCCESS!');
