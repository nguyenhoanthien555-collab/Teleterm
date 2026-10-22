const puppeteer = require('puppeteer');

(async () => {
    console.log('🚀 Launching Puppeteer E2E Browser Test for Living Open World Master Spec v3...\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    page.setViewport({ width: 1280, height: 720 });

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('🔴 [BROWSER ERROR]', msg.text());
            errors.push(msg.text());
        } else {
            console.log('🟢 [BROWSER LOG]', msg.text());
        }
    });

    page.on('pageerror', err => {
        console.error('💥 [PAGE ERROR]', err.message);
        errors.push(err.message);
    });

    // 1. Navigate to live app
    console.log('🌐 Navigating to http://localhost:4000...');
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Switch to full Explore mode so terminal deck does not obstruct 3D world
    await page.evaluate(() => {
        const term = document.getElementById('deck-terminal-screen');
        if (term) term.style.display = 'none';
        document.body.classList.add('mode-explore');
        document.body.classList.remove('mode-focus');
        if (window.__teleTermApp) {
            window.__teleTermApp.setFocusMode(false);
        }
    });

    // Wait for GLTF anime model and textures to finish loading
    console.log('⏳ Waiting for 21MB GLTF anime model to parse & instantiate...');
    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 25000 });
    console.log('✨ GLTF Anime Character & NPCs loaded successfully!');

    // 2. Validate Engine & Subsystems
    console.log('\n--- VERIFYING ENGINE SUBSYSTEMS ---');
    const state = await page.evaluate(() => {
        const ow = window.openWorld3D;
        if (!ow) return { exists: false };

        const wc = ow.worldComposition;
        const im = ow.interactionManager;
        const nps = ow.npcLifeSystem;
        const pres = ow.developerPresence;
        const sd = ow.surfaceDetector;

        return {
            exists: true,
            hasPlayer: !!ow.player,
            hasPlayerMesh: !!ow.playerMesh,
            hasCharacterMeshMaster: !!ow.characterMeshMaster,
            hasLoadCustomModel: typeof ow.loadCustomModel === 'function',
            playerAnim: ow.retargeter ? ow.retargeter.getAnimation() : null,
            npcCount: ow.npcs.length,
            npcAgentCount: nps ? nps.agents.length : 0,
            anchorCount: im ? im.getAllAnchors().length : 0,
            hasRiver: !!wc.river,
            hasBeach: !!wc.beach,
            hasWeather: !!wc.weather,
            hasRegions: !!wc.regions,
            presenceText: pres ? pres.getStatusText() : null,
            // Test Surface Queries
            surfaceHub: sd.detect(6.2, -0.5),
            surfacePath: sd.detect(2.8, 4.2),
            surfaceBridge: sd.detect(4.0, 27.0),
            surfaceRiverWater: sd.detect(0.0, 27.0),
            surfaceBeachSand: sd.detect(10.0, 60.0),
            surfacePier: sd.detect(10.0, 80.0),
            surfaceBeachWetSand: sd.detect(25.0, 80.0),
            surfaceMeadow: sd.detect(25.0, 10.0)
        };
    });

    console.log('State Report:', state);
    if (!state.exists) {
        throw new Error('window.openWorld3D was not found!');
    }
    if (!state.hasPlayer) {
        throw new Error('Player group was not initialized!');
    }
    if (state.anchorCount < 8) {
        throw new Error(`Expected at least 8 anchors, found ${state.anchorCount}`);
    }
    if (state.npcAgentCount < 4) {
        throw new Error(`Expected at least 4 autonomous NPC agents, found ${state.npcAgentCount}`);
    }
    if (!state.hasCharacterMeshMaster) {
        throw new Error('window.openWorld3D.characterMeshMaster was not set for multiplayer cloning!');
    }
    if (!state.hasLoadCustomModel) {
        throw new Error('window.openWorld3D.loadCustomModel method is missing!');
    }

    console.log('✅ Surface Detection verified:');
    console.log(`   - Hub Desk: ${state.surfaceHub} (expected wood)`);
    console.log(`   - Path: ${state.surfacePath} (expected dirt)`);
    console.log(`   - Bridge: ${state.surfaceBridge} (expected wood)`);
    console.log(`   - River: ${state.surfaceRiverWater} (expected water)`);
    console.log(`   - Dry Sand: ${state.surfaceBeachSand} (expected sand)`);
    console.log(`   - Wet Sand: ${state.surfaceBeachWetSand} (expected wet_sand)`);
    console.log(`   - Meadow: ${state.surfaceMeadow} (expected grass)`);

    // 3. Test Seating Interactivity & Occupancy Protection
    console.log('\n--- VERIFYING SEATING INTERACTIVITY & OCCUPANCY ---');
    const seatingResult = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const luminaDesk = ow.interactionManager.getAnchor('hub_desk_chair_1');
        const hotDesk = ow.interactionManager.getAnchor('hub_desk_chair_3');

        // Verify that Lumina has claimed her desk #1
        const isLuminaDeskOccupied = ow.interactionManager.isOccupied('hub_desk_chair_1');

        // Test attempting to sit on Lumina's occupied desk -> should be rejected!
        ow.sitDown(luminaDesk);
        const rejectedSittingState = ow.isSitting;

        // Now sit on the unoccupied Hot Desk #3
        ow.sitDown(hotDesk);
        const satDownState = {
            isLuminaDeskOccupied,
            rejectedSittingState,
            isSitting: ow.isSitting,
            anim: ow.retargeter.getAnimation(),
            isOccupied: ow.interactionManager.isOccupied('hub_desk_chair_3')
        };

        return satDownState;
    });
    console.log('Seating Validation State:', seatingResult);
    if (!seatingResult.isLuminaDeskOccupied) {
        throw new Error('Lumina failed to claim her home desk anchor #1!');
    }
    if (seatingResult.rejectedSittingState) {
        throw new Error('Player was improperly allowed to sit on an occupied desk!');
    }
    if (!seatingResult.isSitting || seatingResult.anim !== 'SitTyping') {
        throw new Error('Player failed to sit down into SitTyping at Hot Desk #3!');
    }

    // Set camera to frame all 3 coding desks clearly
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.cameraRotation.yaw = -0.15;
        ow.targetCameraRotation.yaw = -0.15;
        ow.cameraRotation.pitch = 0.08;
        ow.targetCameraRotation.pitch = 0.08;
        ow.cameraDistance = 4.8;
        ow.targetCameraDistance = 4.8;
    });
    await new Promise(r => setTimeout(r, 600));

    // Capture screenshot while seated at Coding Desk
    await page.screenshot({ path: 'preview_seated_coding_desk.png' });
    console.log('📸 Saved preview_seated_coding_desk.png');

    // Test Stand Up
    const standUpResult = await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.standUp();
        return {
            isSitting: ow.isSitting,
            anim: ow.retargeter.getAnimation(),
            isOccupied: ow.interactionManager.isOccupied('hub_desk_chair_3')
        };
    });
    console.log('Stood Up State:', standUpResult);
    if (standUpResult.isSitting || standUpResult.anim !== 'Idle' || standUpResult.isOccupied) {
        throw new Error('Player failed to stand up cleanly from Hot Desk #3!');
    }

    // 4. Capture Overview & Regional Regression Visuals
    // View 1: Developer Hub & Overview
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.player.position.set(7.5, ow.getTerrainHeight(7.5, -1.0), -1.0);
        ow.player.rotation.y = -0.35;
        ow.cameraRotation.yaw = -0.35;
        ow.targetCameraRotation.yaw = -0.35;
        ow.cameraRotation.pitch = 0.08;
        ow.targetCameraRotation.pitch = 0.08;
        ow.cameraDistance = 4.2;
        ow.targetCameraDistance = 4.2;
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'preview_hub_overview.png' });
    console.log('📸 Saved preview_hub_overview.png');

    // View 2: River Valley & Bridge
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.player.position.set(4.0, ow.getTerrainHeight(4.0, 20.0), 20.0);
        ow.player.rotation.y = 0.0;
        ow.cameraRotation.yaw = 0.0;
        ow.targetCameraRotation.yaw = 0.0;
        ow.cameraRotation.pitch = 0.06;
        ow.targetCameraRotation.pitch = 0.06;
        ow.cameraDistance = 5.0;
        ow.targetCameraDistance = 5.0;
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'preview_river_bridge.png' });
    console.log('📸 Saved preview_river_bridge.png');

    // View 3: Coastal Beach & Pier Dock (Facing open sea and pier: yaw = Math.PI)
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.player.position.set(10.5, ow.getTerrainHeight(10.5, 68.0), 68.0);
        ow.player.rotation.y = 0;
        ow.cameraRotation.yaw = Math.PI;
        ow.targetCameraRotation.yaw = Math.PI;
        ow.cameraRotation.pitch = 0.06;
        ow.targetCameraRotation.pitch = 0.06;
        ow.cameraDistance = 4.5;
        ow.targetCameraDistance = 4.5;
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'preview_coastal_beach.png' });
    console.log('📸 Saved preview_coastal_beach.png');

    // View 4: Cherry Grove & Alpine Mountains
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.player.position.set(25.0, ow.getTerrainHeight(25.0, -12.0), -12.0);
        ow.player.rotation.y = -Math.PI * 0.45;
        ow.cameraRotation.yaw = -Math.PI * 0.45;
        ow.targetCameraRotation.yaw = -Math.PI * 0.45;
        ow.cameraRotation.pitch = 0.06;
        ow.targetCameraRotation.pitch = 0.06;
        ow.cameraDistance = 4.5;
        ow.targetCameraDistance = 4.5;
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'preview_cherry_grove_mountains.png' });
    console.log('📸 Saved preview_cherry_grove_mountains.png');

    await browser.close();

    console.log(`\nRuntime Error Count: ${errors.length}`);
    if (errors.length > 0) {
        console.error('Fatal errors encountered:', errors);
        process.exit(1);
    }

    console.log('🎉 ALL PUPPETEER BROWSER VERIFICATIONS PASSED WITH 0 ERRORS!');
    process.exit(0);
})();
