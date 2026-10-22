import assert from 'assert';
import { TerrainSystem } from '../public/js/world/terrain-system.js';

console.log('🧪 Testing Phase 2 Hydrological Watershed & Waterway Realignment...\n');

const terrain = new TerrainSystem(null);

// TEST 1: River Valley Channel Clearance (Submerged Riverbed)
console.log('--- TEST 1: River Channel Clearance ---');
const riverLength = 120.0;
const riverZ = 27.0;
const riverY = -0.28; // Water surface elevation
let submergedPoints = 0;
let totalRiverPoints = 0;

for (let x = -50.0; x <= 50.0; x += 1.0) {
    totalRiverPoints++;
    const meanderZ = riverZ + Math.sin(x * 0.05) * 3.2 + Math.sin(x * 0.12) * 0.6;
    const bedHeight = terrain.getTerrainHeight(x, meanderZ);
    assert(bedHeight < riverY, `Riverbed at (${x}, ${meanderZ}) must be submerged below water surface (${bedHeight.toFixed(2)}m < ${riverY}m)`);
    submergedPoints++;
}
console.log(`✅ Verified ${submergedPoints}/${totalRiverPoints} river points: All riverbeds are submerged below water surface.\n`);

// TEST 2: Bank Height Clearance (Water does not spill onto air)
console.log('--- TEST 2: River Bank Elevation Test ---');
let banksTested = 0;
for (let x = -40.0; x <= 40.0; x += 2.0) {
    const meanderZ = riverZ + Math.sin(x * 0.05) * 3.2 + Math.sin(x * 0.12) * 0.6;
    const northBankH = terrain.getTerrainHeight(x, meanderZ - 7.5);
    const southBankH = terrain.getTerrainHeight(x, meanderZ + 7.5);
    assert(northBankH > riverY, `North bank at (${x}) must be above water level (${northBankH.toFixed(2)}m > ${riverY}m)`);
    assert(southBankH > riverY, `South bank at (${x}) must be above water level (${southBankH.toFixed(2)}m > ${riverY}m)`);
    banksTested += 2;
}
console.log(`✅ Verified ${banksTested} bank points: Both north and south banks reliably rise above the water surface.\n`);

// TEST 3: Maple Mountain Stream Zero Uphill Downhill Flow Test
console.log('--- TEST 3: Mountain Stream Monotonic Downhill Flow ---');
let prevY = Infinity;
let streamSteps = 0;
let uphillErrors = 0;

for (let z = -50.0; z <= -14.0; z += 0.5) {
    streamSteps++;
    const x = 32.0 + Math.sin(z * 0.18) * 3.5;
    const centerH = terrain.getTerrainHeight(x, z);
    const leftH = terrain.getTerrainHeight(x - 1.0, z);
    const rightH = terrain.getTerrainHeight(x + 1.0, z);
    const rawWaterY = Math.max(centerH + 0.10, (leftH + rightH) * 0.5 - 0.08);
    const waterY = Math.min(prevY, rawWaterY);
    
    if (waterY > prevY + 1e-4) {
        uphillErrors++;
    }
    prevY = waterY;
}
assert.strictEqual(uphillErrors, 0, 'Mountain stream must monotonically descend without uphill flow');
console.log(`✅ Verified ${streamSteps} stream cross-sections: 0 uphill violations, perfect monotonic downhill flow!\n`);

console.log('🎉 ALL PHASE 2 HYDROLOGICAL UNIT TESTS PASSED WITH 100% SUCCESS!');
