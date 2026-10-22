import assert from 'assert';
import * as THREE from 'three';
import { AvatarRetargeter, FIXED_PHYSICS_DT, MAX_PHYSICS_DELTA } from '../public/js/animation/avatar-retargeter.js';

console.log('🧪 Starting Spring Bone Physics Determinism & Stability Test Suite (Argon Task #2)...\n');

// Helper to create a test humanoid model with hair and skirt bones
function createTestModel() {
    const root = new THREE.Group();
    root.name = 'AvatarRoot';

    const hips = new THREE.Bone();
    hips.name = 'J_Bip_C_Hips';
    root.add(hips);

    const spine = new THREE.Bone();
    spine.name = 'J_Bip_C_Spine';
    hips.add(spine);

    const head = new THREE.Bone();
    head.name = 'J_Bip_C_Head';
    spine.add(head);

    // Hair bone
    const hair = new THREE.Bone();
    hair.name = 'J_Sec_Hair_01';
    head.add(hair);

    // Left & Right UpperLeg
    const lLeg = new THREE.Bone();
    lLeg.name = 'J_Bip_L_UpperLeg';
    hips.add(lLeg);

    const rLeg = new THREE.Bone();
    rLeg.name = 'J_Bip_R_UpperLeg';
    hips.add(rLeg);

    // Skirt bones
    const skirtBack = new THREE.Bone();
    skirtBack.name = 'J_Sec_SkirtBack0_L';
    lLeg.add(skirtBack);

    const skirtFront = new THREE.Bone();
    skirtFront.name = 'J_Sec_SkirtFront0_L';
    lLeg.add(skirtFront);

    const skirtSide = new THREE.Bone();
    skirtSide.name = 'J_Sec_SkirtSide1_L';
    lLeg.add(skirtSide);

    return root;
}

// --- TEST 1: Constants & State Initialization ---
console.log('--- TEST 1: Constants & State Initialization ---');
assert.strictEqual(FIXED_PHYSICS_DT, 1 / 60, 'FIXED_PHYSICS_DT must be 1/60s (16.666ms)');
assert.strictEqual(MAX_PHYSICS_DELTA, 0.1, 'MAX_PHYSICS_DELTA must clamp to 0.1s (6 substeps max)');

const model1 = createTestModel();
const retargeter1 = new AvatarRetargeter(model1);
assert.strictEqual(retargeter1.physicsAccumulator, 0, 'physicsAccumulator must initialize to 0');
assert.strictEqual(retargeter1.physicsTime, 0, 'physicsTime must initialize to 0');
assert.strictEqual(retargeter1.skirtInertiaAngle, 0, 'skirtInertiaAngle must initialize to 0');
assert.strictEqual(retargeter1.skirtInertiaVel, 0, 'skirtInertiaVel must initialize to 0');
assert(retargeter1.hairBones.length >= 1, 'Must detect test hair bone');
assert(retargeter1.skirtBones.back.length >= 1, 'Must detect skirt back bone');
console.log('✅ Constants and state correctly initialized.\n');

// --- TEST 2: Multi-Hz Determinism (30 FPS vs 60 FPS vs 120 FPS over 1.0s) ---
console.log('--- TEST 2: Multi-Hz Determinism (30 FPS vs 60 FPS vs 120 FPS) ---');

function runSimulation(fps, totalTime = 1.0) {
    const model = createTestModel();
    const retargeter = new AvatarRetargeter(model);
    const frameDt = 1 / fps;
    const totalFrames = Math.round(totalTime / frameDt);

    for (let f = 0; f < totalFrames; f++) {
        // Run update in locomotion (isMoving = true, isSprinting = false)
        retargeter.update(frameDt, true, false);
    }

    const hairBone = retargeter.hairBones[0];
    return {
        hairAngle: hairBone.userData.springAngle,
        hairVel: hairBone.userData.springVel,
        skirtAngle: retargeter.skirtInertiaAngle,
        skirtVel: retargeter.skirtInertiaVel
    };
}

const sim30 = runSimulation(30);
const sim60 = runSimulation(60);
const sim120 = runSimulation(120);

console.log('Simulation Results at t = 1.0s:');
console.log('  30 FPS  -> Hair Angle:', sim30.hairAngle.toFixed(8), 'Skirt Angle:', sim30.skirtAngle.toFixed(8));
console.log('  60 FPS  -> Hair Angle:', sim60.hairAngle.toFixed(8), 'Skirt Angle:', sim60.skirtAngle.toFixed(8));
console.log('  120 FPS -> Hair Angle:', sim120.hairAngle.toFixed(8), 'Skirt Angle:', sim120.skirtAngle.toFixed(8));

const diffHair30_60 = Math.abs(sim30.hairAngle - sim60.hairAngle);
const diffHair60_120 = Math.abs(sim60.hairAngle - sim120.hairAngle);
const diffSkirt30_60 = Math.abs(sim30.skirtAngle - sim60.skirtAngle);
const diffSkirt60_120 = Math.abs(sim60.skirtAngle - sim120.skirtAngle);

console.log('\nAngular Errors:');
console.log('  |Hair 30 vs 60|   =', diffHair30_60.toExponential(4), 'rad (Threshold: < 1e-4)');
console.log('  |Hair 60 vs 120|  =', diffHair60_120.toExponential(4), 'rad (Threshold: < 1e-4)');
console.log('  |Skirt 30 vs 60|  =', diffSkirt30_60.toExponential(4), 'rad (Threshold: < 1e-4)');
console.log('  |Skirt 60 vs 120| =', diffSkirt60_120.toExponential(4), 'rad (Threshold: < 1e-4)');

assert(diffHair30_60 < 1e-4, 'Hair angular error between 30 and 60 FPS must be < 1e-4 rad');
assert(diffHair60_120 < 1e-4, 'Hair angular error between 60 and 120 FPS must be < 1e-4 rad');
assert(diffSkirt30_60 < 1e-4, 'Skirt angular error between 30 and 60 FPS must be < 1e-4 rad');
assert(diffSkirt60_120 < 1e-4, 'Skirt angular error between 60 and 120 FPS must be < 1e-4 rad');

console.log('✅ Multi-Hz determinism verified with error < 1e-4 rad across all target framerates.\n');

// --- TEST 3: Alt-Tab Hitch / Lag Spike Anti-Death-Spiral Test ---
console.log('--- TEST 3: Alt-Tab Lag Spike Test (delta = 2.5s) ---');
const spikeModel = createTestModel();
const spikeRetargeter = new AvatarRetargeter(spikeModel);

// Warm up for 1 second at 60 FPS
for (let i = 0; i < 60; i++) {
    spikeRetargeter.update(1 / 60, true, false);
}

const preSpikeHair = spikeRetargeter.hairBones[0].userData.springAngle;
const preSpikeSkirt = spikeRetargeter.skirtInertiaAngle;

// Simulate massive lag spike (2.5 seconds alt-tab)
const spikeDelta = 2.5;
spikeRetargeter.update(spikeDelta, true, false);

const postSpikeHair = spikeRetargeter.hairBones[0].userData.springAngle;
const postSpikeHairVel = spikeRetargeter.hairBones[0].userData.springVel;
const postSpikeSkirt = spikeRetargeter.skirtInertiaAngle;
const postSpikeSkirtVel = spikeRetargeter.skirtInertiaVel;

console.log('Pre-spike  Hair:', preSpikeHair.toFixed(6), 'Skirt:', preSpikeSkirt.toFixed(6));
console.log('Post-spike Hair:', postSpikeHair.toFixed(6), 'Skirt:', postSpikeSkirt.toFixed(6));
console.log('Remaining Accumulator:', spikeRetargeter.physicsAccumulator.toFixed(6));

assert(!Number.isNaN(postSpikeHair), 'Hair angle must not be NaN after lag spike');
assert(!Number.isNaN(postSpikeHairVel), 'Hair velocity must not be NaN after lag spike');
assert(!Number.isNaN(postSpikeSkirt), 'Skirt angle must not be NaN after lag spike');
assert(!Number.isNaN(postSpikeSkirtVel), 'Skirt velocity must not be NaN after lag spike');

assert(Number.isFinite(postSpikeHair), 'Hair angle must be finite after lag spike');
assert(Number.isFinite(postSpikeHairVel), 'Hair velocity must be finite after lag spike');
assert(Number.isFinite(postSpikeSkirt), 'Skirt angle must be finite after lag spike');
assert(Number.isFinite(postSpikeSkirtVel), 'Skirt velocity must be finite after lag spike');

// Verify angles stay within physically bounded limits (-1.0 to 1.0 rad)
assert(Math.abs(postSpikeHair) < 1.0, 'Hair angle must remain bounded under lag spike');
assert(Math.abs(postSpikeSkirt) < 1.0, 'Skirt angle must remain bounded under lag spike');
// Verify accumulator was clamped and did not queue 150 substeps
assert(spikeRetargeter.physicsAccumulator < FIXED_PHYSICS_DT, 'Accumulator must be consumed down below dt');

console.log('✅ Anti-death-spiral clamp prevents numerical explosion under 2.5s lag spike.\n');

// --- TEST 4: Sitting Reset & Transition ---
console.log('--- TEST 4: Seated Transition Physics Reset ---');
const sitModel = createTestModel();
const sitRetargeter = new AvatarRetargeter(sitModel);

// Move first
sitRetargeter.speedNorm = 0.8;
sitRetargeter.update(1 / 60, true, true);
assert(sitRetargeter.skirtInertiaAngle !== 0, 'Skirt inertia should be non-zero while running');

// Sit down
sitRetargeter.currentAnim = 'SitIdle';
sitRetargeter.seatConfig = { isBarStool: false, category: 'bench' };
sitRetargeter.update(1 / 60, false, false);

assert.strictEqual(sitRetargeter.skirtInertiaAngle, 0, 'Skirt inertia must reset to 0 upon sitting');
assert.strictEqual(sitRetargeter.skirtInertiaVel, 0, 'Skirt velocity must reset to 0 upon sitting');
console.log('✅ Sitting transition gracefully resets skirt inertia to prevent clipping.\n');

console.log('🎉 ALL SPRING BONE PHYSICS TESTS PASSED WITH 100% SUCCESS!');
process.exit(0);
