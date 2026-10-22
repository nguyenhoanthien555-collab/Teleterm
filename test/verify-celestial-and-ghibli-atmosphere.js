const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function runVerification() {
    console.log('=======================================================================');
    console.log('TELETERM 3D — MILESTONE 3 VERIFICATION: CELESTIAL CYCLE & GHIBLI ATMOSPHERE');
    console.log('=======================================================================');

    const results = {
        timestamp: new Date().toISOString(),
        assertions: [],
        passed: 0,
        failed: 0
    };

    function assert(name, condition, details = {}) {
        const pass = Boolean(condition);
        if (pass) {
            results.passed++;
            console.log(`  [PASS] ${name}`);
        } else {
            results.failed++;
            console.error(`  [FAIL] ${name}`, details);
        }
        results.assertions.push({ name, pass, details });
    }

    // --- PHASE 1: WebSocket Authoritative Chrono-Sync Validation ---
    console.log('\n--- Phase 1: Authoritative Chrono-Sync Multi-Client WebSocket Protocol ---');
    let clientA = null;
    let clientB = null;

    try {
        const wsUrl = 'ws://localhost:4000/ws/world';

        function createWsClient() {
            return new Promise((resolve, reject) => {
                const ws = new WebSocket(wsUrl);
                const queue = [];
                ws.on('open', () => resolve({ ws, queue }));
                ws.on('message', (data) => {
                    try {
                        queue.push(JSON.parse(data.toString()));
                    } catch (e) {}
                });
                ws.on('error', reject);
            });
        }

        const connA = await createWsClient();
        const connB = await createWsClient();
        clientA = connA.ws;
        clientB = connB.ws;
        const queueA = connA.queue;
        const queueB = connB.queue;

        // Handshake
        clientA.send(JSON.stringify({
            type: 'join',
            username: 'AstronomerA',
            position: { x: 15.0, y: 0.8, z: 16.0 }
        }));

        clientB.send(JSON.stringify({
            type: 'join',
            username: 'StargazerB',
            position: { x: 16.0, y: 0.8, z: 16.5 }
        }));

        await new Promise(r => setTimeout(r, 600));

        const welcomeA = queueA.find(p => p.type === 'welcome');
        assert('Client A receives welcome packet with timeSync', Boolean(welcomeA?.timeSync));
        assert('timeSync includes authoritative gameTime and 24m cycle', 
            typeof welcomeA?.timeSync?.gameTime === 'number' && welcomeA?.timeSync?.cycleMinutes === 24,
            { timeSync: welcomeA?.timeSync }
        );

        // 1. Time Sync Request
        queueA.length = 0;
        clientA.send(JSON.stringify({ type: 'time_sync_req' }));
        await new Promise(r => setTimeout(r, 300));
        const syncResp = queueA.find(p => p.type === 'time_sync');
        assert('Server responds to time_sync_req with time_sync packet', Boolean(syncResp), { syncResp });

        // 2. Authoritative Time Set Broadcast: Twilight (18.5)
        queueA.length = 0;
        queueB.length = 0;
        clientA.send(JSON.stringify({ type: 'time_set_req', gameTime: 18.5 }));
        await new Promise(r => setTimeout(r, 400));

        const twilightA = queueA.find(p => p.type === 'time_sync');
        const twilightB = queueB.find(p => p.type === 'time_sync');
        assert('Client A receives time_sync broadcast for 18.5 (Twilight)', twilightA?.gameTime === 18.5);
        assert('Client B receives synchronized time_sync broadcast in realtime', twilightB?.gameTime === 18.5);

        // 3. Authoritative Time Set Broadcast: Midnight (23.5)
        queueA.length = 0;
        queueB.length = 0;
        clientA.send(JSON.stringify({ type: 'time_set_req', gameTime: 23.5 }));
        await new Promise(r => setTimeout(r, 400));

        const nightA = queueA.find(p => p.type === 'time_sync');
        assert('Authoritative time_sync broadcast updates to 23.5 (Midnight)', nightA?.gameTime === 23.5);

        // 4. Restore Midday (12.0)
        clientA.send(JSON.stringify({ type: 'time_set_req', gameTime: 12.0 }));
        await new Promise(r => setTimeout(r, 300));

    } catch (err) {
        assert('Phase 1 Authoritative Chrono-Sync without exception', false, { error: err.message });
    } finally {
        if (clientA && clientA.readyState === WebSocket.OPEN) clientA.close();
        if (clientB && clientB.readyState === WebSocket.OPEN) clientB.close();
    }

    // --- PHASE 2: Puppeteer Shader, Celestial Lighting & Particle Validation ---
    console.log('\n--- Phase 2: Puppeteer Ghibli Sky Dome, Starfield & Fireflies E2E ---');
    let browser = null;

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--autoplay-policy=no-user-gesture-required',
                '--use-gl=angle',
                '--use-angle=default'
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });

        console.log('Navigating to http://localhost:4000/?test=1&explore=1...');
        await page.goto('http://localhost:4000/?test=1&explore=1', { waitUntil: 'networkidle2', timeout: 35000 });

        // Wait for core systems
        await page.waitForFunction(() => {
            return window.openWorld3D &&
                   window.dayNightCycleSystem &&
                   window.dayNightCycleSystem.ghibliSkyDome &&
                   window.dayNightCycleSystem.fireflySwarm;
        }, { timeout: 25000 });

        console.log('Celestial & Ghibli Atmosphere systems initialized.');

        // 1. Architecture Check: Ghibli Sky Dome & Starfield
        const ghibliArch = await page.evaluate(() => {
            const dome = window.dayNightCycleSystem.ghibliSkyDome;
            const mat = dome.skyMaterial;
            const starfield = dome.starfield;

            return {
                hasMesh: Boolean(dome.skyMesh),
                hasShaderMat: Boolean(mat && mat.isShaderMaterial),
                hasSunUniform: Boolean(mat?.uniforms?.uSunPosition),
                hasGhibliBands: mat?.uniforms?.uGhibliBands?.value >= 4.0,
                bandsValue: mat?.uniforms?.uGhibliBands?.value,
                starCount: starfield?.geometry?.attributes?.position?.count || 0
            };
        });

        assert('Ghibli Sky Dome uses custom WebGL ShaderMaterial', ghibliArch.hasShaderMat);
        assert('Ghibli Sky Dome has normalized sun position uniform', ghibliArch.hasSunUniform);
        assert('Ghibli Sky Dome enforces stepped watercolor color banding (>= 4 bands)', ghibliArch.hasGhibliBands, { bands: ghibliArch.bandsValue });
        assert('Twinkling Starfield point cloud contains 1,200 astronomical stars', ghibliArch.starCount === 1200, { starCount: ghibliArch.starCount });

        // 2. Architecture Check: Firefly Swarm System
        const fireflyArch = await page.evaluate(() => {
            const ff = window.dayNightCycleSystem.fireflySwarm;
            return {
                hasMesh: Boolean(ff.instancedMesh),
                instanceCount: ff.instancedMesh?.count || 0,
                fireflyDataCount: ff.fireflies?.length || 0
            };
        });

        assert('Firefly Swarm System utilizes GPU InstancedMesh', fireflyArch.hasMesh);
        assert('Firefly Swarm contains 140 bioluminescent instances across glades', 
            fireflyArch.instanceCount === 140 && fireflyArch.fireflyDataCount === 140,
            fireflyArch
        );

        // 3. Midday Testing (12:00)
        await page.evaluate(() => {
            window.dayNightCycleSystem.lockTime(12.0);
            window.dayNightCycleSystem.update(0.016);
            if (window.openWorld3D?.camera) {
                // Pitch camera slightly upward to look at the majestic Ghibli sky dome
                window.openWorld3D.camera.position.set(15.0, 1.8, 16.0);
                window.openWorld3D.camera.lookAt(15.0, 35.0, -80.0);
            }
        });

        await new Promise(r => setTimeout(r, 600));

        const middayState = await page.evaluate(() => {
            const sys = window.dayNightCycleSystem;
            const dome = sys.ghibliSkyDome;
            const ff = sys.fireflySwarm;
            const sunY = sys.celestialLight?.position?.y || 0;
            const nightFactor = dome.skyMaterial.uniforms.uNightFactor.value;
            const fireflyVisible = ff.instancedMesh.visible;

            return { sunY, nightFactor, fireflyVisible };
        });

        assert('Midday celestial sun elevation is high in sky (Y > 100)', middayState.sunY > 100, { sunY: middayState.sunY });
        assert('Midday night factor is 0.0 (full daylight)', middayState.nightFactor === 0.0);
        assert('Fireflies are invisible during bright daylight', middayState.fireflyVisible === false);

        // Capture Midday proof screenshot
        const proofMidday = path.join(ARTIFACT_DIR, 'proof_milestone3_ghibli_sky_midday.png');
        await page.screenshot({ path: proofMidday, fullPage: false });
        console.log(`  [PROOF] Saved Midday Ghibli Sky proof to: ${proofMidday}`);
        assert('Screenshot proof_milestone3_ghibli_sky_midday.png captured', fs.existsSync(proofMidday));

        // 4. Sunset / Twilight Testing (18.5)
        await page.evaluate(() => {
            window.dayNightCycleSystem.lockTime(18.5);
            window.dayNightCycleSystem.update(0.016);
            if (window.openWorld3D?.camera) {
                // Face western sunset horizon
                window.openWorld3D.camera.lookAt(-100.0, 15.0, 16.0);
            }
        });

        await new Promise(r => setTimeout(r, 600));

        const sunsetState = await page.evaluate(() => {
            const sys = window.dayNightCycleSystem;
            const dome = sys.ghibliSkyDome;
            const ff = sys.fireflySwarm;
            const nightFactor = dome.skyMaterial.uniforms.uNightFactor.value;
            const ffOpacity = ff.material.opacity;
            const ffVisible = ff.instancedMesh.visible;

            return { nightFactor, ffOpacity, ffVisible };
        });

        assert('Twilight night factor is transitioning (0.2 - 0.6)', 
            sunsetState.nightFactor >= 0.2 && sunsetState.nightFactor <= 0.6,
            { nightFactor: sunsetState.nightFactor }
        );
        assert('Fireflies become active and glowing during twilight', 
            sunsetState.ffVisible === true && sunsetState.ffOpacity > 0.1,
            sunsetState
        );

        // Capture Sunset proof screenshot
        const proofSunset = path.join(ARTIFACT_DIR, 'proof_milestone3_ghibli_sky_sunset.png');
        await page.screenshot({ path: proofSunset, fullPage: false });
        console.log(`  [PROOF] Saved Sunset Ghibli Sky proof to: ${proofSunset}`);
        assert('Screenshot proof_milestone3_ghibli_sky_sunset.png captured', fs.existsSync(proofSunset));

        // 5. Midnight Testing (23.5)
        await page.evaluate(() => {
            window.dayNightCycleSystem.lockTime(23.5);
            window.dayNightCycleSystem.update(0.016);
            if (window.openWorld3D?.camera) {
                // Look up toward starry celestial dome
                window.openWorld3D.camera.lookAt(15.0, 60.0, 16.0);
            }
        });

        await new Promise(r => setTimeout(r, 600));

        const nightState = await page.evaluate(() => {
            const sys = window.dayNightCycleSystem;
            const dome = sys.ghibliSkyDome;
            const ff = sys.fireflySwarm;
            const nightFactor = dome.skyMaterial.uniforms.uNightFactor.value;
            const starNightFactor = dome.starMaterial.uniforms.uNightFactor.value;
            const ffOpacity = ff.material.opacity;
            const ffVisible = ff.instancedMesh.visible;
            const isNight = sys.isNight();

            return { nightFactor, starNightFactor, ffOpacity, ffVisible, isNight };
        });

        assert('Midnight isNight() evaluates to true', nightState.isNight === true);
        assert('Midnight Ghibli Sky Dome night factor reaches 1.0', nightState.nightFactor === 1.0);
        assert('Twinkling Starfield shader night factor is 1.0', nightState.starNightFactor === 1.0);
        assert('Fireflies fully active with high bioluminescent opacity (> 0.8)', 
            nightState.ffVisible === true && nightState.ffOpacity > 0.8,
            nightState
        );

        // Capture Night & Fireflies proof screenshot
        const proofNight = path.join(ARTIFACT_DIR, 'proof_milestone3_ghibli_sky_night_fireflies.png');
        await page.screenshot({ path: proofNight, fullPage: false });
        console.log(`  [PROOF] Saved Night Starfield proof to: ${proofNight}`);
        assert('Screenshot proof_milestone3_ghibli_sky_night_fireflies.png captured', fs.existsSync(proofNight));

    } catch (err) {
        assert('Phase 2 Puppeteer E2E validation without exception', false, { error: err.message });
    } finally {
        if (browser) await browser.close();
    }

    // --- PHASE 3: Results Summary & Artifact Persistence ---
    const totalAssertions = results.passed + results.failed;
    const passRate = totalAssertions > 0 ? ((results.passed / totalAssertions) * 100).toFixed(1) : 0;

    console.log('\n=======================================================================');
    console.log(`MILESTONE 3 VERIFICATION SUMMARY: ${results.passed}/${totalAssertions} (${passRate}%) PASSED`);
    console.log('=======================================================================');

    const resultsArtifactPath = path.join(ARTIFACT_DIR, 'milestone3_celestial_and_ghibli_results.json');
    fs.writeFileSync(resultsArtifactPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`Saved results artifact: ${resultsArtifactPath}`);

    if (results.failed > 0) {
        process.exit(1);
    }
}

runVerification().catch(err => {
    console.error('Fatal verification runner error:', err);
    process.exit(1);
});
