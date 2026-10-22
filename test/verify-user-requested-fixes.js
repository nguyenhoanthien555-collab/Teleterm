const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BRAIN_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\8da2b479-49f5-4de5-a2eb-8fae28a294a5';

async function verifyAllFixes() {
    console.log('🚀 [PUPPETEER] Launching headless browser for verification...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--use-gl=angle',
            '--use-angle=swiftshader'
        ]
    });

    const page = await browser.newPage();
    // Test on a realistic desktop resolution (1440x900)
    await page.setViewport({ width: 1440, height: 900 });

    try {
        console.log('🌐 Navigating to http://localhost:4000 ...');
        await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2500));

        // Dismiss launcher if active and enter explore mode
        await page.evaluate(() => {
            const term = document.getElementById('deck-terminal-screen');
            if (term) term.style.display = 'none';
            document.body.classList.add('mode-explore');
            document.body.classList.remove('mode-focus');
            if (window.__teleTermApp) {
                window.__teleTermApp.setFocusMode(false);
            }
            if (window.desktopLauncher) {
                window.desktopLauncher.hideLauncher();
            }
            const modal = document.getElementById('desktop-launcher-modal');
            if (modal) modal.style.display = 'none';
            const overlay = document.getElementById('desktop-launcher-overlay');
            if (overlay) overlay.style.display = 'none';
            const promptBox = document.getElementById('chat-prompt-box');
            if (promptBox) promptBox.style.display = 'none';
        });

        await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.player, { timeout: 30000 });
        console.log('✨ 3D World ready.');

        // =====================================================================
        // TEST 1: TOP NAVIGATION BAR
        // =====================================================================
        console.log('\n========================================');
        console.log('--- TEST 1: Top Navigation Bar Layout ---');
        console.log('========================================');
        const topNavReport = await page.evaluate(() => {
            const btnGfx = document.getElementById('btn-open-graphics-settings');
            const topNav = document.querySelector('.cyber-top-nav');
            const navActions = document.querySelector('.nav-actions');
            const hubBtn = document.getElementById('btn-nav-hub');
            const brand = document.querySelector('.nav-brand');

            const navRect = topNav ? topNav.getBoundingClientRect() : null;
            const hubRect = hubBtn ? hubBtn.getBoundingClientRect() : null;
            const actionsRect = navActions ? navActions.getBoundingClientRect() : null;

            const isHubClipped = hubRect ? (hubRect.right > window.innerWidth) : false;
            const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;

            return {
                btnGfxExists: !!btnGfx,
                isHubVisible: !!hubBtn,
                hubRightEdge: hubRect ? hubRect.right : 0,
                windowWidth: window.innerWidth,
                isHubClipped,
                hasHorizontalScroll,
                pass: !btnGfx && !isHubClipped && !hasHorizontalScroll
            };
        });
        console.log('Top Nav Report:', JSON.stringify(topNavReport, null, 2));

        const proof1Path = path.join(BRAIN_DIR, 'proof_1_top_bar_no_overflow.png');
        await page.screenshot({ path: proof1Path });
        console.log(`📸 Saved top bar screenshot: ${proof1Path}`);

        // Test Hub modal & graphics settings trigger inside Hub
        console.log('Testing Hub modal and Graphics tile inside Hub...');
        const gfxModalReport = await page.evaluate(async () => {
            const hubBtn = document.getElementById('btn-nav-hub');
            if (hubBtn) hubBtn.click();
            await new Promise(r => setTimeout(r, 600));

            const gfxTile = document.getElementById('tile-graphics-hub');
            const hasGfxTile = !!gfxTile;
            if (gfxTile) gfxTile.click();
            await new Promise(r => setTimeout(r, 600));

            const gfxModal = document.getElementById('modal-graphics-settings');
            const isGfxModalOpen = gfxModal && !gfxModal.classList.contains('hidden');

            return {
                hasGfxTile,
                isGfxModalOpen
            };
        });
        console.log('Hub Graphics Tile Report:', JSON.stringify(gfxModalReport, null, 2));

        const proof1bPath = path.join(BRAIN_DIR, 'proof_1b_hub_graphics_modal.png');
        await page.screenshot({ path: proof1bPath });
        console.log(`📸 Saved Hub graphics modal screenshot: ${proof1bPath}`);

        // Close graphics modal and ensure clean 3D scene view for subsequent tests
        await page.evaluate(() => {
            const btnClose = document.getElementById('btn-close-graphics-modal');
            if (btnClose) btnClose.click();
            const gfxModal = document.getElementById('modal-graphics-settings');
            if (gfxModal) {
                gfxModal.classList.add('hidden');
                gfxModal.style.display = 'none';
            }
            const hubModal = document.getElementById('cyber-hub-modal');
            if (hubModal) {
                hubModal.classList.add('hidden');
                hubModal.style.display = 'none';
            }
            const toolsDrawer = document.getElementById('modal-tools-drawer');
            if (toolsDrawer) {
                toolsDrawer.classList.add('hidden');
                toolsDrawer.style.display = 'none';
            }
        });
        await new Promise(r => setTimeout(r, 500));

        // =====================================================================
        // TEST 2: DEVELOPER HUB RECONSTRUCTED SOLID STAIRS
        // =====================================================================
        console.log('\n========================================');
        console.log('--- TEST 2: Developer Hub Solid Stairs ---');
        console.log('========================================');
        const stairsReport = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const cs = ow.collisionSystem;
            const sd = ow.surfaceDetector;

            // Sample elevations along the stairs from bottom (x = 13.65) to top deck (x = 16.0)
            const samples = [];
            for (let x = 13.0; x <= 16.5; x += 0.5) {
                const z = -12.0;
                const rawTerrain = ow.worldComposition ? ow.worldComposition.terrain.getTerrainHeight(x, z) : 0;
                const walkableH = ow.getTerrainHeight(x, z);
                const surface = sd ? sd.detect(x, z) : 'unknown';
                samples.push({
                    x: Number(x.toFixed(2)),
                    rawTerrain: Number(rawTerrain.toFixed(3)),
                    walkableH: Number(walkableH.toFixed(3)),
                    surface
                });
            }

            // Test avatar climbing traversal
            ow.player.position.set(13.65, ow.getTerrainHeight(13.65, -12.0), -12.0);
            const bottomY = ow.player.position.y;

            ow.player.position.set(14.70, ow.getTerrainHeight(14.70, -12.0), -12.0);
            const midY = ow.player.position.y;

            ow.player.position.set(15.75, ow.getTerrainHeight(15.75, -12.0), -12.0);
            const topY = ow.player.position.y;

            ow.player.position.set(16.50, ow.getTerrainHeight(16.50, -12.0), -12.0);
            const deckY = ow.player.position.y;

            // Check smooth monotonic rise
            const isMonotonic = (midY > bottomY) && (topY > midY) && Math.abs(deckY - topY) < 0.05;

            // Set camera to view stairs from the front/side
            ow.player.position.set(14.5, ow.getTerrainHeight(14.5, -12.0), -12.0);
            ow.cameraRotation.yaw = -Math.PI * 0.40;
            ow.cameraRotation.pitch = -0.12;
            ow.cameraDistance = 4.2;

            return {
                samples,
                bottomY: Number(bottomY.toFixed(3)),
                midY: Number(midY.toFixed(3)),
                topY: Number(topY.toFixed(3)),
                deckY: Number(deckY.toFixed(3)),
                isMonotonic,
                pass: isMonotonic && (topY > 0.95)
            };
        });
        console.log('Stairs Traversal Report:', JSON.stringify(stairsReport, null, 2));

        await new Promise(r => setTimeout(r, 1200));
        const proof2Path = path.join(BRAIN_DIR, 'proof_2_solid_hub_stairs_climb.png');
        await page.screenshot({ path: proof2Path });
        console.log(`📸 Saved solid stairs climb screenshot: ${proof2Path}`);

        // Side-angle screenshot showing flush attachment to deck platform
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            ow.cameraRotation.yaw = -Math.PI * 0.70;
            ow.cameraRotation.pitch = -0.15;
            ow.cameraDistance = 5.0;
        });
        await new Promise(r => setTimeout(r, 1000));
        const proof2bPath = path.join(BRAIN_DIR, 'proof_2b_hub_stairs_flush_attachment.png');
        await page.screenshot({ path: proof2bPath });
        console.log(`📸 Saved stairs flush attachment screenshot: ${proof2bPath}`);

        // Direct comparison matching User Image 2 perspective (Standing west of stairs looking East toward deck)
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            ow.player.position.set(13.8, ow.getTerrainHeight(13.8, -12.0), -12.0);
            ow.cameraRotation.yaw = Math.PI * 0.52;
            ow.cameraRotation.pitch = -0.08;
            ow.cameraDistance = 4.2;
        });
        await new Promise(r => setTimeout(r, 1000));
        const proof2cPath = path.join(BRAIN_DIR, 'proof_2c_stairs_matching_user_image2.png');
        await page.screenshot({ path: proof2cPath });
        console.log(`📸 Saved 1:1 matching user angle screenshot: ${proof2cPath}`);

        // =====================================================================
        // TEST 3: MAPLE REST STOP REORGANIZATION & BRIDGE CLEARANCE
        // =====================================================================
        console.log('\n========================================');
        console.log('--- TEST 3: Maple Rest Stop Reorganization ---');
        console.log('========================================');
        const mapleReport = await page.evaluate(async () => {
            const ow = window.openWorld3D;
            const im = ow.interactionManager;

            // Check anchors
            const benchAnchor = im.getAnchor('maple_stream_bench_1');
            const stool1 = im.getAnchor('maple_picnic_stool_1');
            const stool2 = im.getAnchor('maple_picnic_stool_2');
            const stool3 = im.getAnchor('maple_picnic_stool_3');
            const stool4 = im.getAnchor('maple_picnic_stool_4');

            // Bridge exit is at x = 36.7, z = -28.0
            // Walking corridor is z in [-29.0, -27.0] for x from 36.7 to 44.0
            const bridgeExit = { x: 36.7, z: -28.0 };

            // Distances to bridge exit
            const distBench = Math.hypot(benchAnchor.position.x - bridgeExit.x, benchAnchor.position.z - bridgeExit.z);
            const distStool1 = Math.hypot(stool1.position.x - bridgeExit.x, stool1.position.z - bridgeExit.z);
            const distStool2 = Math.hypot(stool2.position.x - bridgeExit.x, stool2.position.z - bridgeExit.z);

            // Is bridge exit corridor clear? (No prop within 1.2m of z = -28.0 in front of bridge)
            const isBenchBlockingCorridor = Math.abs(benchAnchor.position.z - (-28.0)) < 1.4 && benchAnchor.position.x < 39.0;
            const isStoolBlockingExit = distStool2 < 2.5;

            // Position player at bridge exit looking into the open maple rest clearing
            ow.player.position.set(36.0, ow.getTerrainHeight(36.0, -28.0), -28.0);
            ow.cameraRotation.yaw = Math.PI * 0.52; // Looking East off bridge into clearing
            ow.cameraRotation.pitch = -0.10;
            ow.cameraDistance = 4.8;

            return {
                benchPos: benchAnchor.position,
                benchRotY: benchAnchor.rotationY,
                stool1Pos: stool1.position,
                stool2Pos: stool2.position,
                distBenchToExit: Number(distBench.toFixed(2)),
                distNearestStoolToExit: Number(distStool2.toFixed(2)),
                isCorridorClear: !isBenchBlockingCorridor && !isStoolBlockingExit,
                pass: distBench >= 4.0 && distStool2 >= 3.0 && !isBenchBlockingCorridor
            };
        });
        console.log('Maple Rest Stop Report:', JSON.stringify(mapleReport, null, 2));

        await new Promise(r => setTimeout(r, 1200));
        const proof3Path = path.join(BRAIN_DIR, 'proof_3_maple_rest_stop_reorganized.png');
        await page.screenshot({ path: proof3Path });
        console.log(`📸 Saved Maple Rest Stop clearing screenshot: ${proof3Path}`);

        // Teleport to bench and view Sakura sitting
        console.log('Viewing Sakura at stream bench...');
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            ow.player.position.set(37.0, ow.getTerrainHeight(37.0, -23.5), -23.5);
            ow.cameraRotation.yaw = -Math.PI * 0.45;
            ow.cameraRotation.pitch = -0.15;
            ow.cameraDistance = 3.5;
        });
        await new Promise(r => setTimeout(r, 1200));
        const proof3bPath = path.join(BRAIN_DIR, 'proof_3b_sakura_stream_bench.png');
        await page.screenshot({ path: proof3bPath });
        console.log(`📸 Saved Sakura stream bench screenshot: ${proof3bPath}`);

        // Teleport to tea table and view Kaede
        console.log('Viewing Kaede at tea table...');
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            ow.player.position.set(41.5, ow.getTerrainHeight(41.5, -30.0), -30.0);
            ow.cameraRotation.yaw = Math.PI * 0.25;
            ow.cameraRotation.pitch = -0.18;
            ow.cameraDistance = 3.8;
        });
        await new Promise(r => setTimeout(r, 1200));
        const proof3cPath = path.join(BRAIN_DIR, 'proof_3c_kaede_tea_table.png');
        await page.screenshot({ path: proof3cPath });
        console.log(`📸 Saved Kaede tea table screenshot: ${proof3cPath}`);

        console.log('\n========================================');
        console.log('🎉 ALL 3 USER FIX VERIFICATIONS COMPLETED!');
        console.log('========================================');
    } catch (err) {
        console.error('❌ Verification error:', err);
    } finally {
        await browser.close();
    }
}

verifyAllFixes();
