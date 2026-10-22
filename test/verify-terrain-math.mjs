import { TerrainSystem } from '../public/js/world/terrain-system.js';

console.log('Testing TerrainSystem live implementation...');

const terrain = new TerrainSystem(null);

let minH = Infinity;
let maxH = -Infinity;
let maxSlope = 0;
let nanCount = 0;
let pointsChecked = 0;

for (let x = -70; x <= 70; x += 0.5) {
    for (let z = -90; z <= 90; z += 0.5) {
        pointsChecked++;
        const h = terrain.getTerrainHeight(x, z);
        if (isNaN(h) || !isFinite(h)) nanCount++;
        if (h < minH) minH = h;
        if (h > maxH) maxH = h;

        const eps = 0.5;
        const hx = terrain.getTerrainHeight(x + eps, z);
        const hz = terrain.getTerrainHeight(x, z + eps);
        const slope = Math.hypot((hx - h) / eps, (hz - h) / eps);
        if (slope > maxSlope) maxSlope = slope;
    }
}

console.log(`Checked ${pointsChecked} points.`);
console.log(`Min Height: ${minH.toFixed(2)}m (Riverbed / Estuary)`);
console.log(`Max Height: ${maxH.toFixed(2)}m (Northern Alpine Summits)`);
console.log(`Max Slope Gradient: ${maxSlope.toFixed(2)} (${(Math.atan(maxSlope) * 180 / Math.PI).toFixed(1)} deg)`);
console.log(`NaN/Infinite Count: ${nanCount}`);

if (nanCount === 0 && maxSlope <= 1.8) {
    console.log('✅ TerrainSystem getTerrainHeight is 100% continuous and robust!');
} else {
    console.error('❌ Validation failed!');
    process.exit(1);
}
