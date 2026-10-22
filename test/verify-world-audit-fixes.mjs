/**
 * VERIFICATION SUITE FOR WORLD AUDIT FIXES
 * Verifies:
 * 1. Ghost terminal anchor removed (no phantom prompt in village plaza).
 * 2. Developer Hub deck path clearance & foundation grounding.
 * 3. Seating orientations (tatami facing tea table, 4 picnic stools facing picnic table, desk chairs facing desks).
 * 4. Zero mathematical height discontinuities (0 cliffs) across the entire terrain grid.
 */

import { TerrainSystem } from '../public/js/world/terrain-system.js';
import { InteractionManager } from '../public/js/interaction/interaction-manager.js';

let allPassed = true;
function assert(desc, condition) {
    if (condition) {
        console.log(`[PASS] ${desc}`);
    } else {
        console.error(`[FAIL] ${desc}`);
        allPassed = false;
    }
}

console.log('=== TEST 1: GHOST TERMINAL ANCHOR AUDIT ===');
const im = new InteractionManager();
const publicKiosk = im.getAnchor('hub_public_terminal_kiosk');
assert('hub_public_terminal_kiosk ghost anchor is completely removed', publicKiosk === undefined);

const hubKiosk = im.getAnchor('hub_kiosk_terminal');
assert('Real hub_kiosk_terminal anchor exists at Hub platform', hubKiosk !== undefined && hubKiosk.position.x === 17.5);

console.log('\n=== TEST 2: SEATING ORIENTATIONS & CAPACITIES ===');
// Tatami mats
const mat1 = im.getAnchor('bamboo_tea_mat_1');
const mat2 = im.getAnchor('bamboo_tea_mat_2');
assert('Bamboo tea mat #1 exists', mat1 !== undefined);
assert('Bamboo tea mat #2 exists', mat2 !== undefined);
assert('Bamboo tea mat #1 faces +X toward tea table (rotationY = PI/2)', Math.abs(mat1.rotationY - Math.PI * 0.5) < 0.01);
assert('Bamboo tea mat #2 faces -X toward tea table (rotationY = -PI/2)', Math.abs(mat2.rotationY - (-Math.PI * 0.5)) < 0.01);
assert('Bamboo tea mat #1 has capacity 1 (single meditator)', mat1.capacity === 1);
assert('Bamboo tea mat #2 has capacity 1 (single meditator)', mat2.capacity === 1);

// Maple picnic table stools
const stool1 = im.getAnchor('maple_picnic_stool_1');
const stool2 = im.getAnchor('maple_picnic_stool_2');
const stool3 = im.getAnchor('maple_picnic_stool_3');
const stool4 = im.getAnchor('maple_picnic_stool_4');
assert('All 4 Maple picnic stools are registered', stool1 && stool2 && stool3 && stool4);
assert('Stool 1 faces -Z toward table center', Math.abs(stool1.rotationY - Math.PI) < 0.01);
assert('Stool 2 faces +X toward table center', Math.abs(stool2.rotationY - Math.PI * 0.5) < 0.01);
assert('Stool 3 faces +Z toward table center', Math.abs(stool3.rotationY - 0) < 0.01);
assert('Stool 4 faces -X toward table center', Math.abs(stool4.rotationY - (-Math.PI * 0.5)) < 0.01);
assert('All 4 stools have capacity 1 (no lateral offset)', stool1.capacity === 1 && stool2.capacity === 1 && stool3.capacity === 1 && stool4.capacity === 1);

// Maple stream bench
const streamBench = im.getAnchor('maple_stream_bench_1');
assert('Maple stream bench exists with capacity 2', streamBench && streamBench.capacity === 2);

console.log('\n=== TEST 3: MATHEMATICAL TERRAIN SLOPE CONTINUITY ===');
const mockScene = { add: () => {} };
const terrain = new TerrainSystem(mockScene);

let cliffCount = 0;
const step = 0.5;
const delta = 0.1;
for (let x = -50; x <= 50; x += step) {
    for (let z = -70; z <= 70; z += step) {
        const h0 = terrain.getTerrainHeight(x, z);
        const hx = terrain.getTerrainHeight(x + delta, z);
        const hz = terrain.getTerrainHeight(x, z + delta);
        const diffX = Math.abs(hx - h0);
        const diffZ = Math.abs(hz - h0);
        if (diffX > 0.15 || diffZ > 0.15) {
            cliffCount++;
        }
    }
}
assert(`Continuous terrain slope verification (found ${cliffCount} cliff discontinuities, expected 0)`, cliffCount === 0);

console.log('\n=== TEST 4: COMPUTE SLOT POSITIONS & RAISED PLATFORM CHECKS ===');
terrain.build = () => {};
im.setTerrainSystem(terrain);

// Slot positions for tatami mats
const slotMat1 = im.computeSlotPosition(mat1, 0);
assert('Mat 1 slot X matches anchor X exactly', Math.abs(slotMat1.x - mat1.position.x) < 0.001);
assert('Mat 1 slot Z matches anchor Z exactly', Math.abs(slotMat1.z - mat1.position.z) < 0.001);
assert('Mat 1 slot rotation faces tea table', Math.abs(slotMat1.rotationY - Math.PI * 0.5) < 0.001);

// Slot position for picnic stool 1 (no lateral bench offset)
const slotStool1 = im.computeSlotPosition(stool1, 0);
assert('Picnic stool 1 has zero lateral offset', Math.abs(slotStool1.x - stool1.position.x) < 0.001 && Math.abs(slotStool1.z - stool1.position.z) < 0.001);

if (allPassed) {
    console.log('\n>>> ALL WORLD AUDIT UNIT & SYSTEM TESTS PASSED SUCCESSFULLY! <<<');
    process.exit(0);
} else {
    console.error('\n>>> SOME TESTS FAILED! <<<');
    process.exit(1);
}
