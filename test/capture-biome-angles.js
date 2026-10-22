const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BRAIN_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function captureBiomeAngles() {
    console.log('📸 Launching Puppeteer to capture multi-angle biome vistas...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded', timeout: 35000 });
        await new Promise(r => setTimeout(r, 2000));

        // Switch to Explore mode & dismiss launcher
        await page.evaluate(() => {
            const term = document.getElementById('deck-terminal-screen');
            if (term) term.style.display = 'none';
            document.body.classList.add('mode-explore');
            document.body.classList.remove('mode-focus');
            if (window.__teleTermApp) window.__teleTermApp.setFocusMode(false);
            if (window.desktopLauncher) window.desktopLauncher.hideLauncher();
            const modal = document.getElementById('desktop-launcher-modal');
            if (modal) modal.style.display = 'none';
            const promptBox = document.getElementById('chat-prompt-box');
            if (promptBox) promptBox.style.display = 'none';
        });

        // Wait for 3D world
        await page.waitForFunction(() => {
            return window.openWorld3D && window.openWorld3D.worldComposition && window.worldContext;
        }, { timeout: 30000 });

        await new Promise(r => setTimeout(r, 2000));

        // Angle 1: Camera aimed at Northwest Bamboo Meditation Forest & Zen Tea Pavilion
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            if (ow.player) {
                ow.player.position.set(-22.0, ow.getTerrainHeight(-22.0, -28.0), -28.0);
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = Math.PI * 0.7;
                }
                ow.cameraRotation.yaw = -Math.PI * 0.4;
                ow.cameraRotation.pitch = 0.12;
                ow.cameraDistance = 4.5;
            }
        });
        await new Promise(r => setTimeout(r, 1200));
        const shot1Path = path.join(BRAIN_DIR, 'test_biome_bamboo_zen_pavilion.png');
        await page.screenshot({ path: shot1Path });
        console.log('✓ Captured Angle 1: Bamboo Meditation Forest & Zen Tea Pavilion ->', shot1Path);

        // Angle 2: Camera aimed at Northeast Autumn Maple Valley & Stream Rest Stop
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            if (ow.player) {
                ow.player.position.set(30.0, ow.getTerrainHeight(30.0, -24.0), -24.0);
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = -Math.PI * 0.5;
                }
                ow.cameraRotation.yaw = Math.PI * 0.6;
                ow.cameraRotation.pitch = 0.15;
                ow.cameraDistance = 5.0;
            }
        });
        await new Promise(r => setTimeout(r, 1200));
        const shot2Path = path.join(BRAIN_DIR, 'test_biome_maple_stream_valley.png');
        await page.screenshot({ path: shot2Path });
        console.log('✓ Captured Angle 2: Autumn Maple Valley & Stream Rest Stop ->', shot2Path);

        // Angle 3: Camera aimed at North Alpine Overlook & Snowy Peaks
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            if (ow.player) {
                ow.player.position.set(28.0, ow.getTerrainHeight(28.0, -44.0), -44.0);
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = 0;
                }
                ow.cameraRotation.yaw = 0.0;
                ow.cameraRotation.pitch = 0.08;
                ow.cameraDistance = 5.5;
            }
        });
        await new Promise(r => setTimeout(r, 1200));
        const shot3Path = path.join(BRAIN_DIR, 'test_biome_alpine_mountain_overlook.png');
        await page.screenshot({ path: shot3Path });
        console.log('✓ Captured Angle 3: Alpine Mountain Overlook & Pine Woods ->', shot3Path);

        console.log('✨ All 3 multi-angle biome vista screenshots captured successfully!');
    } finally {
        await browser.close();
    }
}

captureBiomeAngles().catch(err => {
    console.error('Failed to capture biome angles:', err);
    process.exit(1);
});
