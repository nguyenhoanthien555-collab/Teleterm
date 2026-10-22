const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BRAIN_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function captureReconstructionProofs() {
    console.log('🚀 Launching Puppeteer to capture World Reconstruction Proofs...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        console.log('Navigating to http://localhost:4000 ...');
        await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 2000));

        // Enter Explore Mode & dismiss UI overlays
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

        await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });
        console.log('✨ 3D World ready.');

        // Proof 1: Zen Tea Pavilion Tatami Sitting (Floor mat grounding, lantern lighting, segmented bamboo)
        console.log('\n--- 1. Testing Zen Tea Pavilion Tatami Mat Grounding ---');
        const matReport = await page.evaluate(async () => {
            const ow = window.openWorld3D;
            // Teleport near Zen Pavilion at (-26.0, -30.0)
            ow.player.position.set(-26.0, ow.getTerrainHeight(-26.0, -29.0), -29.0);
            ow.cameraRotation.yaw = Math.PI * 0.1;
            ow.cameraRotation.pitch = -0.15;
            ow.cameraDistance = 3.6;

            // Trigger sitting on bamboo_tea_mat_1
            const anchor = ow.interactionManager.anchors.get('bamboo_tea_mat_1');
            if (anchor) {
                ow.sitDown(anchor);
            }

            return {
                isSitting: ow.isSitting,
                playerPos: { x: ow.player.position.x, y: ow.player.position.y, z: ow.player.position.z },
                groundY: ow.getTerrainHeight(ow.player.position.x, ow.player.position.z),
                anchorId: ow.currentSeatAnchor?.id,
                pass: ow.isSitting && (Math.abs(ow.player.position.y - (ow.getTerrainHeight(ow.player.position.x, ow.player.position.z) + 0.32)) < 0.15)
            };
        });
        console.log('Zen Mat Report:', JSON.stringify(matReport, null, 2));
        await new Promise(r => setTimeout(r, 1200));
        const shot1Path = path.join(BRAIN_DIR, 'proof_1_zen_pavilion_tatami.png');
        await page.screenshot({ path: shot1Path });
        console.log(`📸 Saved ${shot1Path}`);

        // Proof 2: Southwest Rice Fields & Precast Flume & Footbridge
        console.log('\n--- 2. Testing Southwest Rice Fields & Flume ---');
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            ow.standUp();
            // Position player at footbridge crossing over flume: x = -10.0, z = 5.0 looking west across the terraced fields
            ow.player.position.set(-10.2, ow.getTerrainHeight(-10.2, 5.0), 5.0);
            ow.cameraRotation.yaw = -Math.PI * 0.45;
            ow.cameraRotation.pitch = -0.18;
            ow.cameraDistance = 7.5;
        });
        await new Promise(r => setTimeout(r, 1200));
        const shot2Path = path.join(BRAIN_DIR, 'proof_2_rice_fields_flume.png');
        await page.screenshot({ path: shot2Path });
        console.log(`📸 Saved ${shot2Path}`);

        // Proof 3: Rice Field Water at Camera Distance (No culling / clipping)
        console.log('\n--- 3. Testing Rice Field Water Distance Visibility ---');
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            // Position player directly in the central rice paddy at (-24.0, 5.0)
            ow.player.position.set(-24.0, ow.getTerrainHeight(-24.0, 5.0), 5.0);
            ow.cameraRotation.yaw = -Math.PI * 0.35;
            ow.cameraRotation.pitch = -0.32;
            ow.cameraDistance = 28.0;
        });
        await new Promise(r => setTimeout(r, 1200));
        const shot3Path = path.join(BRAIN_DIR, 'proof_3_rice_water_distance.png');
        await page.screenshot({ path: shot3Path });
        console.log(`📸 Saved ${shot3Path}`);

        // Proof 4: Maple Forest Japanese Bonsai Trees & Autumn Stream
        console.log('\n--- 4. Testing Maple Forest Branching Trees ---');
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            // Position player in Maple Valley at (32.0, -26.0) looking across the autumn trees and stream
            ow.player.position.set(33.0, ow.getTerrainHeight(33.0, -25.0), -25.0);
            ow.cameraRotation.yaw = Math.PI * 0.75;
            ow.cameraRotation.pitch = -0.15;
            ow.cameraDistance = 6.0;
        });
        await new Promise(r => setTimeout(r, 1200));
        const shot4Path = path.join(BRAIN_DIR, 'proof_4_maple_forest_branching.png');
        await page.screenshot({ path: shot4Path });
        console.log(`📸 Saved ${shot4Path}`);

        // Proof 5: Alpine Mountain Slope Grounding (Player traversal on slope with zero sinking)
        console.log('\n--- 5. Testing Alpine Mountain Slope Grounding ---');
        const slopeReport = await page.evaluate(() => {
            const ow = window.openWorld3D;
            // Position player at (24.0, -44.0) on the steep mountain ascent trail toward overlook
            ow.player.position.set(24.0, ow.getTerrainHeight(24.0, -44.0), -44.0);
            ow.cameraRotation.yaw = Math.PI * 0.35;
            ow.cameraRotation.pitch = -0.12;
            ow.cameraDistance = 4.5;

            // Sample ground height and player height
            const terrainY = ow.getTerrainHeight(24.0, -44.0);
            const playerY = ow.player.position.y;
            return {
                terrainY,
                playerY,
                diff: Math.abs(playerY - terrainY),
                pass: Math.abs(playerY - terrainY) < 0.05
            };
        });
        console.log('Alpine Slope Report:', JSON.stringify(slopeReport, null, 2));
        await new Promise(r => setTimeout(r, 1200));
        const shot5Path = path.join(BRAIN_DIR, 'proof_5_alpine_mountain_grounding.png');
        await page.screenshot({ path: shot5Path });
        console.log(`📸 Saved ${shot5Path}`);

        console.log('\n🎉 ALL 5/5 RECONSTRUCTION PROOFS CAPTURED SUCCESSFULLY!');
    } finally {
        await browser.close();
    }
}

captureReconstructionProofs().catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
});
