const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BRAIN_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\69476637-5058-4b38-81f6-926c8792527c';
const TEST_DIR = path.resolve(__dirname);

function saveArtifact(filename, buffer) {
    fs.writeFileSync(path.join(TEST_DIR, filename), buffer);
    if (fs.existsSync(BRAIN_DIR)) {
        fs.writeFileSync(path.join(BRAIN_DIR, filename), buffer);
    }
}

(async () => {
    console.log('🚀 Launching Puppeteer for Vintage Bicycle Relocation & Fix Verification...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[OpenWorld3D]') || text.includes('[Bicycle]')) {
            console.log('Browser log:', text);
        }
    });

    console.log('Navigating to http://localhost:4000 ...');
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Ensure 3D world is in explore mode
    await page.evaluate(() => {
        const term = document.getElementById('deck-terminal-screen');
        if (term) term.style.display = 'none';
        document.body.classList.add('mode-explore');
        document.body.classList.remove('mode-focus');
        if (window.__teleTermApp) {
            window.__teleTermApp.setFocusMode(false);
        }
    });

    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });
    console.log('✨ 3D World and character meshes loaded.');

    await new Promise(r => setTimeout(r, 2000));

    // =========================================================================
    // TEST 1: VERIFY WAYSIDE SAKURA BENCH IS FREE OF BICYCLE CLIPPING
    // =========================================================================
    console.log('\n--- Test 1: Wayside Sakura Bench Clean Vista ---');
    const waysideReport = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const benchPos = { x: 5.5, y: 0.245, z: -6.0 };

        // Position camera to look directly at the Wayside Sakura Bench
        ow.player.position.set(5.5, 0.25, -3.2);
        ow.player.rotation.y = Math.PI; // Face bench
        ow.camera.position.set(5.5, 1.4, -2.2);
        ow.camera.lookAt(5.5, 0.6, -6.0);

        // Check distance to any bicycle
        let minBikeDist = Infinity;
        let bikeFound = null;
        const tempV = ow.camera.position.clone();
        ow.scene.traverse(obj => {
            if (obj.isMesh && (obj.geometry?.type === 'TorusGeometry' || obj.name?.includes('bike'))) {
                obj.getWorldPosition(tempV);
                const dx = tempV.x - benchPos.x;
                const dy = tempV.y - benchPos.y;
                const dz = tempV.z - benchPos.z;
                const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
                // If it's a wheel-like torus near the bench
                if (d < minBikeDist && obj.geometry?.parameters?.radius > 0.25) {
                    minBikeDist = d;
                    bikeFound = { x: tempV.x, y: tempV.y, z: tempV.z };
                }
            }
        });

        return {
            benchPos,
            minBikeDist,
            bikeFarAwayFromBench: minBikeDist > 10.0
        };
    });

    console.log('Wayside Bench Report:', JSON.stringify(waysideReport, null, 2));
    await new Promise(r => setTimeout(r, 800));
    const benchBuf = await page.screenshot();
    saveArtifact('verify_wayside_bench_clean.png', benchBuf);
    console.log('📸 Saved verify_wayside_bench_clean.png');

    // =========================================================================
    // TEST 2: VERIFY VINTAGE BICYCLE DETAILS, SPOKES, AND VILLAGE PLAZA PLACEMENT
    // =========================================================================
    console.log('\n--- Test 2: Vintage Bicycle Relocation & High-Fidelity Geometry ---');
    const bikeReport = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const im = ow.interactionManager;
        const bikeAnchor = im ? im.getAnchor('village_vintage_bicycle') : null;

        // Teleport camera right next to the new bicycle in Village Plaza
        ow.player.position.set(-3.2, -0.04, -19.5);
        ow.player.rotation.y = -Math.PI * 0.5; // Look at bike
        ow.camera.position.set(-3.2, 0.85, -18.2);
        ow.camera.lookAt(-4.2, 0.5, -19.5);

        // Inspect scene objects at bike position (-4.2, -19.5)
        let spokeCount = 0;
        let hasBasket = false;
        let hasSaddle = false;
        let hasKickstand = false;
        let tireBottomY = null;
        let groundYAtBike = ow.getTerrainHeight(-4.2, -19.5);

        const tempWp = ow.camera.position.clone();
        ow.scene.traverse(obj => {
            if (obj.isMesh) {
                obj.getWorldPosition(tempWp);
                if (Math.abs(tempWp.x - (-4.2)) < 1.5 && Math.abs(tempWp.z - (-19.5)) < 1.5) {
                    // Check spokes: thin cylinders of length ~0.56
                    if (obj.geometry?.type === 'CylinderGeometry' && obj.geometry?.parameters?.radiusTop < 0.005) {
                        spokeCount++;
                    }
                    if (obj.geometry?.type === 'TorusGeometry' && obj.geometry?.parameters?.radius > 0.28) {
                        const bY = tempWp.y - obj.geometry.parameters.radius;
                        if (tireBottomY === null || bY < tireBottomY) tireBottomY = bY;
                    }
                }
            }
        });

        return {
            bikeAnchor,
            spokeCount,
            tireBottomY,
            groundYAtBike,
            groundAlignmentDelta: tireBottomY !== null ? Math.abs(tireBottomY - groundYAtBike) : null,
            isGroundedAccurately: tireBottomY !== null && Math.abs(tireBottomY - groundYAtBike) < 0.08
        };
    });

    console.log('Bicycle Inspection Report:', JSON.stringify(bikeReport, null, 2));
    await new Promise(r => setTimeout(r, 800));
    const bikeCloseUpBuf = await page.screenshot();
    saveArtifact('verify_vintage_bicycle_close_up.png', bikeCloseUpBuf);
    console.log('📸 Saved verify_vintage_bicycle_close_up.png');

    // =========================================================================
    // TEST 3: VILLAGE SQUARE CONTEXT (BICYCLE NEXT TO RETRO VENDING MACHINE)
    // =========================================================================
    console.log('\n--- Test 3: Village Square Atmospheric Context ---');
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        // Step back camera to frame the Vending Machine, Bicycle, and Notice Board together
        ow.player.position.set(-1.0, 0.0, -17.0);
        ow.player.rotation.y = -Math.PI * 0.75;
        ow.camera.position.set(-1.0, 1.6, -15.5);
        ow.camera.lookAt(-3.5, 0.8, -20.5);
    });

    await new Promise(r => setTimeout(r, 800));
    const squareBuf = await page.screenshot();
    saveArtifact('verify_bicycle_village_square_context.png', squareBuf);
    console.log('📸 Saved verify_bicycle_village_square_context.png');

    // =========================================================================
    // TEST 4: INTERACTION PROMPT & BELL RINGING ACTION
    // =========================================================================
    console.log('\n--- Test 4: Bicycle Bell Interaction ---');
    const interactReport = await page.evaluate(() => {
        const ow = window.openWorld3D;
        // Move player right into interaction range (1.2m from bicycle)
        ow.player.position.set(-4.0, ow.getTerrainHeight(-4.0, -18.6), -18.6);
        ow.checkInteractions();

        const promptBox = ow.interactPromptEl || document.getElementById('interact-prompt');
        const promptVisible = promptBox && promptBox.style.display !== 'none' && !promptBox.classList.contains('hidden');
        const promptText = promptBox ? promptBox.innerText : '';

        // Test bell ringing trigger
        let bellTriggered = false;
        try {
            ow.playBicycleBellSound();
            bellTriggered = true;
        } catch (e) {
            bellTriggered = false;
        }

        return {
            promptVisible,
            promptText,
            bellTriggered
        };
    });

    console.log('Interaction Report:', JSON.stringify(interactReport, null, 2));

    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.camera.position.set(-3.2, 1.2, -17.2);
        ow.camera.lookAt(-4.2, 0.8, -19.5);
    });
    await new Promise(r => setTimeout(r, 500));
    const bellPromptBuf = await page.screenshot();
    saveArtifact('verify_bicycle_bell_interaction_prompt.png', bellPromptBuf);
    console.log('📸 Saved verify_bicycle_bell_interaction_prompt.png');

    await browser.close();
    console.log('🎉 All bicycle relocation and visual verification tests completed!');
})();
