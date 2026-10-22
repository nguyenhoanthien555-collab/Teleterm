const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\69476637-5058-4b38-81f6-926c8792527c';

(async () => {
    console.log('📸 Launching Puppeteer to capture Audit Verification Images (Image 1 to 4)...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2500));

    // Switch to Explore mode
    await page.evaluate(() => {
        const term = document.getElementById('deck-terminal-screen');
        if (term) term.style.display = 'none';
        document.body.classList.add('mode-explore');
        document.body.classList.remove('mode-focus');
        if (window.__teleTermApp) {
            window.__teleTermApp.setFocusMode(false);
        }
    });

    // Wait for openWorld3D and player mesh
    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 25000 });
    console.log('✨ World and GLTF Models loaded.');

    // Wait 2 seconds for badges and initial routine setup
    await new Promise(r => setTimeout(r, 2000));

    // ==========================================
    // 1. IMAGE 1 CAPTURE: Low/Steep Angle Facing Player across Rice Fields
    // Verifies: Overhead badge safely clamped below top nav (minY: 56px), cerulean water
    // ==========================================
    console.log('Capturing Image 1 view (Steep angle badge safety & rice paddies)...');
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.player.position.set(2.8, ow.getTerrainHeight(2.8, 4.2), 4.2);
        ow.targetCameraRotation.yaw = -0.15;
        ow.targetCameraRotation.pitch = 0.45; // Steep upward look (low angle camera)
        ow.cameraRotation.yaw = -0.15;
        ow.cameraRotation.pitch = 0.45;
        ow.targetCameraDistance = 3.6;
        ow.cameraDistance = 3.6;
        ow.updateCamera(0.016);
        if (ow.overheadUi) ow.overheadUi.update();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_image1_overhead_clamp_and_paddies.png') });
    console.log('✅ Image 1 saved.');

    // ==========================================
    // 2. IMAGE 2 CAPTURE: Zoomed-out Wide Panorama
    // Verifies: Distance scaling of badges, depth separation, mountains & cherry grove
    // ==========================================
    console.log('Capturing Image 2 view (Wide zoom distance scaling & landscape depth)...');
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.player.position.set(4.5, ow.getTerrainHeight(4.5, 8.0), 8.0);
        ow.targetCameraRotation.yaw = -0.42;
        ow.targetCameraRotation.pitch = 0.12;
        ow.cameraRotation.yaw = -0.42;
        ow.cameraRotation.pitch = 0.12;
        ow.targetCameraDistance = 7.5; // Max zoom distance
        ow.cameraDistance = 7.5;
        ow.updateCamera(0.016);
        if (ow.overheadUi) ow.overheadUi.update();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_image2_wide_zoom_distance_scaling.png') });
    console.log('✅ Image 2 saved.');

    // ==========================================
    // 3. IMAGE 3 CAPTURE: Kaede at Kiosk Holographic Terminal
    // Verifies: Natural elbow flex typing stance (zero T-pose), cyberpunk kiosk screen
    // ==========================================
    console.log('Capturing Image 3 view (Kaede typing at Terminal Kiosk)...');
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        // Position Kaede at the terminal console
        const kaedeAgent = ow.npcLifeSystem.agents.find(a => a.def.id === 'kaede');
        if (kaedeAgent) {
            kaedeAgent.group.position.set(3.0, 0.25, 2.75);
            kaedeAgent.group.rotation.y = 0;
            kaedeAgent.retargeter.setAnimation('Typing');
            kaedeAgent.updateBadge('*benchmarking WebGL shaders*');
        }
        // Position camera right in front of the Terminal Kiosk facing Kaede
        ow.camera.position.set(3.0, 1.35, 4.2);
        ow.camera.lookAt(3.0, 1.15, 2.75);
        if (ow.overheadUi) ow.overheadUi.update();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_image3_kaede_terminal_typing.png') });
    console.log('✅ Image 3 saved.');

    // ==========================================
    // 4. IMAGE 4 CAPTURE: Lumina Coffee / Seated Lounge
    // Verifies: Lumina sitting comfortably ON seat, thighs forward, zero backward hip twist
    // ==========================================
    console.log('Capturing Image 4 view (Lumina seated enjoying coffee)...');
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        // Position Lumina at the lounge chair / coffee counter stool
        const luminaAgent = ow.npcLifeSystem.agents.find(a => a.def.id === 'lumina');
        if (luminaAgent) {
            luminaAgent.group.position.set(9.55, 0.74, 1.10);
            luminaAgent.group.rotation.y = Math.PI / 2;
            luminaAgent.retargeter.setAnimation('SitCoffee');
            luminaAgent.updateBadge('☕ sipping espresso latte');
        }
        // Position camera to view Lumina seated comfortably
        ow.camera.position.set(8.1, 1.45, 1.10);
        ow.camera.lookAt(9.55, 1.05, 1.10);
        if (ow.overheadUi) ow.overheadUi.update();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'audit_image4_lumina_coffee_chair_seating.png') });
    console.log('✅ Image 4 saved.');

    await browser.close();
    console.log('🎉 All 4 audit verification images captured successfully!');
})();
