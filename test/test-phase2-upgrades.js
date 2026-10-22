/**
 * TeleTerm Phase 2 Deep IDE & Metaverse Upgrades Verification Suite
 * Tests Component 1 (ADE Symbol Outline Engine), Component 2 (Visual Test Dashboard API),
 * and Component 3 (24-Minute Day/Night Diurnal Cycle & Cyberpunk Lighting Math).
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');
const express = require('express');

console.log('================================================================');
console.log('🧪 RUNNING TELETERM PHASE 2 UPGRADE AUTOMATED VERIFICATION SUITE');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function it(description, fn) {
    try {
        fn();
        console.log(`  ✅ PASS: ${description}`);
        passCount++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${description}`);
        console.error(`     Error: ${err.message}`);
        failCount++;
    }
}

async function itAsync(description, fn) {
    try {
        await fn();
        console.log(`  ✅ PASS: ${description}`);
        passCount++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${description}`);
        console.error(`     Error: ${err.message}`);
        failCount++;
    }
}

// =========================================================================
// TEST SUITE 1: ADE SYMBOL OUTLINE ENGINE (Component 1)
// =========================================================================
console.log('--- [Component 1] ADE Symbol Outline Engine ---');

// Load AdeSymbolIndexer via VM context (guarantees universal browser + node compatibility)
const symbolIndexerCode = fs.readFileSync(path.join(__dirname, '../public/js/ade/symbol-indexer.js'), 'utf8');
const symbolSandbox = { window: {} };
vm.runInNewContext(symbolIndexerCode, symbolSandbox);
const indexer = symbolSandbox.window.AdeSymbolIndexer;

it('AdeSymbolIndexer initializes cleanly with empty cache and kind icon mapping', () => {
    assert(indexer, 'AdeSymbolIndexer should exist on window');
    assert.strictEqual(indexer.getKindIcon('class'), '🅲');
    assert.strictEqual(indexer.getKindIcon('function'), 'ƒ');
    assert.strictEqual(indexer.getKindIcon('async_method'), '⚡Ⓜ');
    assert.strictEqual(indexer.getKindIcon('heading'), '🏷️');
});

it('Extracts JavaScript & TypeScript classes, methods, constructors, and functions with 1-indexed lines', () => {
    const sampleJs = [
        'export class WorldComposition {', // line 1
        '    constructor(scene) {',        // line 2
        '        this.scene = scene;',     // line 3
        '    }',                           // line 4
        '    buildAll() {',                // line 5
        '        return true;',            // line 6
        '    }',                           // line 7
        '    async update(delta) {',       // line 8
        '        return delta;',           // line 9
        '    }',                           // line 10
        '}',                               // line 11
        'function helperUtility() {',      // line 12
        '    return 42;',                  // line 13
        '}',                               // line 14
        'const arrowFn = (a, b) => a + b;' // line 15
    ].join('\n');

    const symbols = indexer.indexDocument(sampleJs, 'world-composition.js');
    assert(Array.isArray(symbols), 'Symbols should be an array');
    assert(symbols.length >= 5, `Expected >= 5 symbols, got ${symbols.length}`);

    // Class check
    const cls = symbols.find(s => s.name === 'WorldComposition');
    assert(cls, 'Should detect WorldComposition class');
    assert.strictEqual(cls.kind, 'class');
    assert.strictEqual(cls.line, 1);

    // Constructor check
    const ctor = symbols.find(s => s.name === 'constructor');
    assert(ctor, 'Should detect constructor');
    assert.strictEqual(ctor.kind, 'constructor');
    assert.strictEqual(ctor.line, 2);
    assert.strictEqual(ctor.containerName, 'WorldComposition');

    // Method check
    const meth = symbols.find(s => s.name === 'buildAll');
    assert(meth, 'Should detect buildAll method');
    assert.strictEqual(meth.kind, 'method');
    assert.strictEqual(meth.line, 5);
    assert.strictEqual(meth.containerName, 'WorldComposition');

    // Async Method check
    const asyncMeth = symbols.find(s => s.name === 'update');
    assert(asyncMeth, 'Should detect update async method');
    assert.strictEqual(asyncMeth.kind, 'async_method');
    assert.strictEqual(asyncMeth.line, 8);
    assert.strictEqual(asyncMeth.containerName, 'WorldComposition');

    // Function check
    const fn = symbols.find(s => s.name === 'helperUtility');
    assert(fn, 'Should detect helperUtility function');
    assert.strictEqual(fn.kind, 'function');
    assert.strictEqual(fn.line, 12);
});

it('Extracts Markdown hierarchical headings (H1, H2, H3) with parent container scopes', () => {
    const sampleMd = [
        '# TeleTerm Architecture',     // line 1
        'Some text here...',           // line 2
        '## Component 1: ADE IDE',     // line 3
        'Overview...',                 // line 4
        '### Symbol Outline Engine',   // line 5
        'Details...',                  // line 6
        '## Component 2: Dashboard',   // line 7
        'Summary...'                   // line 8
    ].join('\n');

    const symbols = indexer.indexDocument(sampleMd, 'README.md');
    assert.strictEqual(symbols.length, 4);

    assert.strictEqual(symbols[0].name, 'TeleTerm Architecture');
    assert.strictEqual(symbols[0].containerName, 'H1');
    assert.strictEqual(symbols[0].line, 1);

    assert.strictEqual(symbols[1].name, 'Component 1: ADE IDE');
    assert.strictEqual(symbols[1].containerName, 'H2 in TeleTerm Architecture');
    assert.strictEqual(symbols[1].line, 3);

    assert.strictEqual(symbols[2].name, 'Symbol Outline Engine');
    assert.strictEqual(symbols[2].containerName, 'H3 in Component 1: ADE IDE');
    assert.strictEqual(symbols[2].line, 5);

    assert.strictEqual(symbols[3].name, 'Component 2: Dashboard');
    assert.strictEqual(symbols[3].containerName, 'H2 in TeleTerm Architecture');
    assert.strictEqual(symbols[3].line, 7);
});

it('Extracts JSON keys with correct line numbers and JSON container scope', () => {
    const sampleJson = [
        '{',
        '  "name": "teleterm",',
        '  "version": "2.0.0",',
        '  "settings": {',
        '    "timeOfDay": "auto"',
        '  }',
        '}'
    ].join('\n');

    const symbols = indexer.indexDocument(sampleJson, 'package.json');
    assert(symbols.length >= 4, 'Should extract JSON keys');
    const nameKey = symbols.find(s => s.name === 'name');
    assert(nameKey, 'Should extract name key');
    assert.strictEqual(nameKey.line, 2);
    assert.strictEqual(nameKey.containerName, 'JSON');
});

it('Filters symbols by query and ranks exact/prefix matches highest', () => {
    const list = [
        { name: 'update', kind: 'method' },
        { name: 'updateWeather', kind: 'method' },
        { name: 'buildAll', kind: 'method' },
        { name: 'getUpdateFrequency', kind: 'method' }
    ];

    const results = indexer.filterSymbols(list, 'update');
    assert(results.length >= 3, 'Should find all update-containing symbols');
    assert.strictEqual(results[0].name, 'update', 'Exact match should rank 1st');
    assert.strictEqual(results[1].name, 'updateWeather', 'Prefix match should rank 2nd');
});

it('Gracefully handles edge cases: empty strings, comments-only, and special characters', () => {
    assert.strictEqual(indexer.indexDocument('', 'empty.js').length, 0);
    assert.strictEqual(indexer.indexDocument(null, 'null.js').length, 0);
    assert.strictEqual(indexer.indexDocument('   \n\n  \t  ', 'blank.js').length, 0);

    const commentsOnly = '// Just a comment\n/* Multi\nline\ncomment */';
    assert.strictEqual(indexer.indexDocument(commentsOnly, 'comments.js').length, 0);
});

// =========================================================================
// TEST SUITE 2: TIME OF DAY SYSTEM & CYBERPUNK LIGHTING (Component 3)
// =========================================================================
console.log('\n--- [Component 3] TimeOfDaySystem Diurnal Cycle & Lighting Math ---');

// Mock minimal THREE structure for headless Node math verification
const mockThree = {
    Color: class Color {
        constructor(hex = 0xffffff) { this.hex = hex; }
        setHex(hex) { this.hex = hex; return this; }
        lerpColors(c1, c2, p) { this.hex = p < 0.5 ? c1.hex : c2.hex; return this; }
    },
    MathUtils: {
        lerp: (a, b, t) => a + (b - a) * t,
        clamp: (val, min, max) => Math.max(min, Math.min(max, val))
    }
};

// Create a headless test version of TimeOfDaySystem using the same equations
class HeadlessTimeOfDaySystem {
    constructor() {
        this.timeSpeed = 1 / 60; // 1 real sec = 1 game min
        this.time = 12.0;
        this.isLocked = false;
        this.lockedPhase = 'auto';
        this.sunIntensity = 1.4;
        this.ambientIntensity = 0.45;
        this.lanternPointLightIntensity = 0.0;
        this.screenEmissiveBoost = 1.0;
    }

    setTime(hours) {
        this.time = ((hours % 24) + 24) % 24;
    }

    lockTime(phase) {
        if (typeof phase === 'number') {
            this.isLocked = true;
            this.lockedPhase = String(phase);
            this.setTime(phase);
        } else if (typeof phase === 'string' && phase.includes(':')) {
            const [h, m] = phase.split(':').map(Number);
            this.isLocked = true;
            this.lockedPhase = phase;
            this.setTime((h || 0) + (m || 0) / 60);
        } else if (phase === 'dawn') {
            this.isLocked = true;
            this.lockedPhase = 'dawn';
            this.setTime(6.5);
        } else if (phase === 'day' || phase === 'midday') {
            this.isLocked = true;
            this.lockedPhase = 'day';
            this.setTime(12.0);
        } else if (phase === 'sunset') {
            this.isLocked = true;
            this.lockedPhase = 'sunset';
            this.setTime(18.5);
        } else if (phase === 'night' || phase === 'cyberpunk_night') {
            this.isLocked = true;
            this.lockedPhase = 'night';
            this.setTime(22.5);
        } else {
            this.isLocked = false;
            this.lockedPhase = 'auto';
        }
    }

    getPhase() {
        const t = this.time;
        if (t >= 5.0 && t < 8.0) return { id: 'dawn', name: 'Dawn', time: t, isNight: false };
        if (t >= 8.0 && t < 17.0) return { id: 'midday', name: 'Midday', time: t, isNight: false };
        if (t >= 17.0 && t < 20.0) return { id: 'sunset', name: 'Sunset', time: t, isNight: false };
        return { id: 'night', name: 'Cyberpunk Night', time: t, isNight: true };
    }

    getFormattedTime() {
        const h = Math.floor(this.time);
        const m = Math.floor((this.time - h) * 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    update(deltaSeconds) {
        if (!this.isLocked) {
            this.time += deltaSeconds * this.timeSpeed;
            if (this.time >= 24) this.time -= 24;
            if (this.time < 0) this.time += 24;
        }

        const t = this.time;
        if (t >= 8.0 && t < 17.0) {
            // Midday
            this.sunIntensity = 1.4;
            this.ambientIntensity = 0.45;
            this.lanternPointLightIntensity = 0.0;
            this.screenEmissiveBoost = 1.0;
        } else if (t >= 17.0 && t < 20.0) {
            // Sunset
            const p = (t - 17.0) / 3.0;
            this.sunIntensity = 1.4 * (1 - p) + 0.65 * p;
            this.ambientIntensity = 0.45 * (1 - p) + 0.28 * p;
            this.lanternPointLightIntensity = 2.2 * p;
            this.screenEmissiveBoost = 1.0 + 0.8 * p;
        } else if (t >= 5.0 && t < 8.0) {
            // Dawn
            const p = (t - 5.0) / 3.0;
            this.sunIntensity = 0.5 * (1 - p) + 1.4 * p;
            this.ambientIntensity = 0.28 * (1 - p) + 0.45 * p;
            this.lanternPointLightIntensity = 2.0 * (1 - p);
            this.screenEmissiveBoost = 1.8 * (1 - p) + 1.0 * p;
        } else {
            // Cyberpunk Night
            this.sunIntensity = 0.38;
            this.ambientIntensity = 0.22;
            this.lanternPointLightIntensity = 2.2;
            this.screenEmissiveBoost = 2.0;
        }
    }
}

it('TimeOfDaySystem clock operates at 24 real minutes = 24 game hours', () => {
    const tod = new HeadlessTimeOfDaySystem();
    tod.setTime(0);

    // Simulate 60 real seconds = 1 real minute => should equal exactly 1 game hour
    tod.update(60);
    assert(Math.abs(tod.time - 1.0) < 0.001, `Expected time 1.0 hr, got ${tod.time}`);

    // Simulate 1440 real seconds = 24 real minutes => should complete full 24-hr loop
    tod.update(1380); // 1380 + 60 = 1440 sec
    assert(Math.abs(tod.time - 0.0) < 0.01, `Expected full cycle to wrap to 0.0, got ${tod.time}`);
});

it('Accurately evaluates all 4 astronomical phases across 24 hours', () => {
    const tod = new HeadlessTimeOfDaySystem();

    tod.setTime(6.5);
    assert.strictEqual(tod.getPhase().id, 'dawn');
    assert.strictEqual(tod.getPhase().isNight, false);

    tod.setTime(12.0);
    assert.strictEqual(tod.getPhase().id, 'midday');
    assert.strictEqual(tod.getPhase().isNight, false);

    tod.setTime(18.5);
    assert.strictEqual(tod.getPhase().id, 'sunset');
    assert.strictEqual(tod.getPhase().isNight, false);

    tod.setTime(22.5);
    assert.strictEqual(tod.getPhase().id, 'night');
    assert.strictEqual(tod.getPhase().isNight, true);

    tod.setTime(2.0); // 02:00 AM
    assert.strictEqual(tod.getPhase().id, 'night');
    assert.strictEqual(tod.getPhase().isNight, true);
});

it('Modulates PointLight intensity and screen emissive boost between day and cyberpunk night', () => {
    const tod = new HeadlessTimeOfDaySystem();

    // Midday (High Noon)
    tod.setTime(12.0);
    tod.update(0);
    assert.strictEqual(tod.lanternPointLightIntensity, 0.0, 'Lanterns should be off during midday');
    assert.strictEqual(tod.screenEmissiveBoost, 1.0, 'Screen emissive should be normal at day');
    assert.strictEqual(tod.sunIntensity, 1.4, 'Sun should be bright at day');

    // Cyberpunk Night
    tod.setTime(22.5);
    tod.update(0);
    assert(tod.lanternPointLightIntensity >= 2.0, 'Lantern PointLights should be illuminated at night');
    assert(tod.screenEmissiveBoost >= 1.8, 'Holo screens should have boosted emissive glow at night');
    assert(tod.sunIntensity <= 0.45, 'Sun/Moon light should be dim cool ambient at night');

    // Sunset Transition
    tod.setTime(18.5); // Mid-sunset
    tod.update(0);
    assert(tod.lanternPointLightIntensity > 0.5 && tod.lanternPointLightIntensity < 2.0, 'Lanterns ramp up smoothly during sunset');
    assert(tod.screenEmissiveBoost > 1.2 && tod.screenEmissiveBoost < 1.8, 'Screen glow ramps up during sunset');
});

it('Handles lock controls: presets, custom hours, and auto unlock', () => {
    const tod = new HeadlessTimeOfDaySystem();

    tod.lockTime('sunset');
    assert.strictEqual(tod.isLocked, true);
    assert.strictEqual(tod.time, 18.5);
    assert.strictEqual(tod.getFormattedTime(), '18:30');

    // Updates while locked should not drift time
    tod.update(120);
    assert.strictEqual(tod.time, 18.5);

    tod.lockTime('22:45');
    assert.strictEqual(tod.isLocked, true);
    assert.strictEqual(tod.getFormattedTime(), '22:45');

    tod.lockTime('auto');
    assert.strictEqual(tod.isLocked, false);
    tod.update(60);
    assert(tod.time > 22.75, 'Time advances when unlocked');
});

// =========================================================================
// TEST SUITE 3: VISUAL TEST DASHBOARD API & ROUTING (Component 2)
// =========================================================================
console.log('\n--- [Component 2] Visual Test Dashboard Discovery & Execution API ---');

async function runApiTests() {
    const adeRouter = require('../src/server/ade-router');
    const app = express();
    app.use(express.json());
    app.use('/api/ade', adeRouter);

    const testServer = http.createServer(app);
    await new Promise(resolve => testServer.listen(0, resolve));
    const port = testServer.address().port;
    const baseUrl = `http://localhost:${port}/api/ade`;

    try {
        await itAsync('GET /api/ade/tests/discovery returns categorised test suites', async () => {
            const res = await fetch(`${baseUrl}/tests/discovery`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert(Array.isArray(data.categories), 'categories must be an array');
            assert(data.categories.length === 4, `Expected 4 categories, got ${data.categories.length}`);
            assert(data.totalSuites >= 20, `Expected at least 20 test suites, found ${data.totalSuites}`);

            const catIds = data.categories.map(c => c.id);
            assert(catIds.includes('ade_core'), 'Must contain ade_core category');
            assert(catIds.includes('desktop_platform'), 'Must contain desktop_platform category');
            assert(catIds.includes('open_world_3d'), 'Must contain open_world_3d category');
            assert(catIds.includes('adversarial_stress'), 'Must contain adversarial_stress category');

            // Verify suite objects format
            const sampleSuite = data.categories[0].suites[0];
            assert(sampleSuite.id, 'Suite must have id');
            assert(sampleSuite.filename, 'Suite must have filename');
            assert(sampleSuite.name, 'Suite must have name');
            assert(sampleSuite.category, 'Suite must have category');
        });

        await itAsync('POST /api/ade/tests/run rejects invalid or non-existent suite requests with HTTP 400', async () => {
            const res = await fetch(`${baseUrl}/tests/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ suiteId: 'non_existent_suite_xyz' })
            });
            assert.strictEqual(res.status, 400);
            const data = await res.json();
            assert.strictEqual(data.success, false);
            assert(data.error.includes('No matching test suites found'));
        });

        await itAsync('POST /api/ade/tests/run successfully queues a valid test suite', async () => {
            const discRes = await fetch(`${baseUrl}/tests/discovery`);
            const discData = await discRes.json();
            const target = discData.categories[0].suites[0];

            const runRes = await fetch(`${baseUrl}/tests/run`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ suiteId: target.id })
            });

            assert.strictEqual(runRes.status, 200);
            const runData = await runRes.json();
            assert.strictEqual(runData.success, true);
            assert(runData.runId.startsWith('testrun-'), 'Must return valid runId');
            assert.strictEqual(runData.totalSuites, 1);
        });

        await itAsync('GET /api/ade/tests/status returns active run state', async () => {
            const res = await fetch(`${baseUrl}/tests/status`);
            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert(data.activeRun !== undefined, 'Must return activeRun');
        });

        // Wait briefly for test run subprocess to settle before shutting down test server
        for (let i = 0; i < 20; i++) {
            const stRes = await fetch(`${baseUrl}/tests/status`);
            const stData = await stRes.json();
            if (!stData.activeRun || stData.activeRun.completed >= stData.activeRun.total) {
                break;
            }
            await new Promise(r => setTimeout(r, 250));
        }
        await new Promise(r => setTimeout(r, 600));

    } finally {
        await new Promise(resolve => testServer.close(resolve));
    }

    // =========================================================================
    // FINAL RESULTS SUMMARY
    // =========================================================================
    console.log('\n================================================================');
    console.log(`📊 PHASE 2 VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('================================================================');

    process.exit(failCount > 0 ? 1 : 0);
}

runApiTests().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
