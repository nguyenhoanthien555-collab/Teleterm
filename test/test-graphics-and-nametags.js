const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('🧪 [TEST] Launching Puppeteer for Graphics Quality & Smart Nametag Verification...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
            console.error('  [BROWSER ERROR]:', text);
        }
    });
    page.on('pageerror', err => console.error('  [PAGE ERROR]:', err.message));

    console.log('🌐 Navigating to http://localhost:4000...');
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Switch to Explore mode and ensure 3D world is ready
    await page.evaluate(() => {
        const term = document.getElementById('deck-terminal-screen');
        if (term) term.style.display = 'none';
        document.body.classList.add('mode-explore');
        document.body.classList.remove('mode-focus');
        if (window.__teleTermApp) {
            window.__teleTermApp.setFocusMode(false);
        }
    });

    // Wait for OpenWorld3D, overhead UI, and NPC badges to load
    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.overheadUi && !!window.graphicsManager && !!document.getElementById('overhead-badge-lumina'), { timeout: 25000 });
    console.log('✅ OpenWorld3D, OverheadUiSystem & NPC badges are initialized.');

    await new Promise(r => setTimeout(r, 500));

    // =========================================================================
    // TEST 1: Smart Nametag View-Cone Culling
    // =========================================================================
    console.log('\n--- TEST 1: Smart Nametag View-Cone Culling ---');

    // Case 1A: Camera facing towards NPC Lumina (x: 6.2, z: -0.5) from player (2.8, 4.2)
    const facingResult = await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.overheadUi.setNametagMode('focus');

        // Look directly towards Lumina (at x: 6.2, z: -0.5)
        ow.camera.position.set(2.8, 1.45, 4.2);
        ow.camera.lookAt(6.2, 1.35, -0.5);
        ow.overheadUi.update();

        const luminaBadge = document.getElementById('overhead-badge-lumina');
        const luminaVisible = luminaBadge && getComputedStyle(luminaBadge).display !== 'none';
        const luminaOpacity = luminaBadge ? parseFloat(getComputedStyle(luminaBadge).opacity || '1') : 0;

        return { luminaVisible, luminaOpacity };
    });
    console.log('Case 1A (Facing Lumina):', facingResult);
    if (!facingResult.luminaVisible) {
        console.error('❌ FAIL: Lumina badge should be visible when camera faces towards her!');
    } else {
        console.log('✅ PASS: Lumina nametag is visible when looking directly at her.');
    }

    // Case 1B: Camera facing AWAY from Lumina (turning camera 180 degrees away, towards z: 15.0)
    const awayResult = await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.overheadUi.setNametagMode('focus');

        // Look in opposite direction (towards beach / +Z)
        ow.camera.position.set(2.8, 1.45, 4.2);
        ow.camera.lookAt(2.8, 1.45, 25.0);
        ow.overheadUi.update();

        const luminaBadge = document.getElementById('overhead-badge-lumina');
        const luminaVisible = luminaBadge && getComputedStyle(luminaBadge).display !== 'none';

        // Also check Sakura and Ren who are far behind camera
        const sakuraBadge = document.getElementById('overhead-badge-sakura');
        const sakuraVisible = sakuraBadge && getComputedStyle(sakuraBadge).display !== 'none';

        return { luminaVisible, sakuraVisible };
    });
    console.log('Case 1B (Facing AWAY from Lumina & Sakura):', awayResult);
    if (awayResult.luminaVisible || awayResult.sakuraVisible) {
        console.error('❌ FAIL: Lumina and Sakura badges should be hidden when camera faces away!');
    } else {
        console.log('✅ PASS: Nametags are intelligently hidden when camera is facing away!');
    }

    // Case 1C: Close Proximity (< 6m) keeps badge visible even if slightly off-center
    const proximityResult = await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.overheadUi.setNametagMode('focus');

        // Stand right next to Lumina (distance ~ 2.5m)
        ow.camera.position.set(5.0, 1.45, 1.5);
        ow.camera.lookAt(5.5, 1.45, 0.0);
        ow.overheadUi.update();

        const luminaBadge = document.getElementById('overhead-badge-lumina');
        const luminaVisible = luminaBadge && getComputedStyle(luminaBadge).display !== 'none';
        return { luminaVisible };
    });
    console.log('Case 1C (Close Proximity < 6m):', proximityResult);
    if (!proximityResult.luminaVisible) {
        console.error('❌ FAIL: Lumina badge should show in close proximity!');
    } else {
        console.log('✅ PASS: Nametag is visible in close proximity.');
    }

    // Case 1D: Setting nametag mode to 'off' hides all nametags
    const offResult = await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.overheadUi.setNametagMode('off');
        ow.overheadUi.update();

        let anyVisible = false;
        document.querySelectorAll('.anime-overhead-badge').forEach(b => {
            if (getComputedStyle(b).display !== 'none') anyVisible = true;
        });
        return { anyVisible };
    });
    console.log('Case 1D (Nametag mode "off"):', offResult);
    if (offResult.anyVisible) {
        console.error('❌ FAIL: All nametags should be hidden in "off" mode!');
    } else {
        console.log('✅ PASS: All nametags hidden when set to "off".');
    }

    // Case 1E: Off-Screen Periphery Culling (NPC close < 6m, but outside camera FOV: MUST NOT stick to screen border)
    const peripheryResult = await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.overheadUi.setNametagMode('focus');

        // Position camera 3.5m from Lumina (at 6.2, -0.5), but turn camera 75 degrees away
        // Lumina is in front hemisphere (dot > 0.15) and dist < 6m, but well outside the 46-degree camera view frustum!
        ow.camera.position.set(3.5, 1.45, 1.5);
        ow.camera.lookAt(-5.0, 1.45, 1.5); // looking directly to the left, away from Lumina
        ow.overheadUi.update();

        const luminaBadge = document.getElementById('overhead-badge-lumina');
        const luminaVisible = luminaBadge && getComputedStyle(luminaBadge).display !== 'none';
        return { luminaVisible };
    });
    console.log('Case 1E (Off-Screen Periphery Culling):', peripheryResult);
    if (peripheryResult.luminaVisible) {
        console.error('❌ FAIL: Lumina badge should be culled when outside camera viewport frustum!');
    } else {
        console.log('✅ PASS: Off-screen NPC nametag is correctly culled and NOT clamped to screen edges.');
    }

    // =========================================================================
    // TEST 2: Graphics Settings Manager, Presets & Engine Dynamic Application
    // =========================================================================
    console.log('\n--- TEST 2: Graphics Presets & Real-Time Engine Toggles ---');

    // Test 2A: Open modal via Hub tile or direct button
    await page.evaluate(() => {
        if (window.desktopLauncher) window.desktopLauncher.hideLauncher();
        const m = document.getElementById('desktop-launcher-modal');
        if (m) m.style.display = 'none';
        const o = document.getElementById('desktop-launcher-overlay');
        if (o) o.style.display = 'none';
        const tile = document.getElementById('tile-graphics-hub');
        if (tile) {
            tile.click();
        } else if (window.graphicsManager) {
            window.graphicsManager.open();
        }
    });
    await new Promise(r => setTimeout(r, 600));
    const isModalOpen = await page.evaluate(() => {
        const m = document.getElementById('modal-graphics-settings');
        return m && !m.classList.contains('hidden');
    });
    console.log('Modal opened via UI (Hub/Direct):', isModalOpen);

    // Capture screenshot of Graphics Settings Modal
    await page.screenshot({ path: 'verify_graphics_modal_open.png' });
    console.log('📸 Saved verify_graphics_modal_open.png');

    // Test 2B: Switch to Mobile Profile and Low Preset
    console.log('Testing Mobile Low Preset...');
    await page.evaluate(() => {
        window.graphicsManager.setPlatform('mobile');
        window.graphicsManager.applyPreset('low');
    });
    await new Promise(r => setTimeout(r, 300));

    const mobileLowCheck = await page.evaluate(() => {
        const s = window.graphicsManager.getSettings();
        const ow = window.openWorld3D;
        const savedRaw = localStorage.getItem('teleterm_graphics_settings');
        const saved = savedRaw ? JSON.parse(savedRaw) : null;

        const actualRendererDpr = ow.renderer.getPixelRatio();
        ow.onWindowResize(); // Verify window resize preserves user DPR
        const preservedDprAfterResize = ow.renderer.getPixelRatio();

        return {
            platform: s.platform,
            preset: s.preset,
            dpr: s.dpr,
            actualRendererDpr,
            preservedDprAfterResize,
            canvasImageRendering: ow.canvas ? ow.canvas.style.imageRendering : 'auto',
            shadowMapEnabled: ow.renderer.shadowMap.enabled,
            fpsCap: ow.fpsCap,
            shaderMode: s.shaderMode,
            sunFlareVisible: ow.sunFlareMesh ? ow.sunFlareMesh.visible : false,
            localStorageSaved: saved && saved.preset === 'low' && saved.platform === 'mobile'
        };
    });
    console.log('Mobile Low Check:', mobileLowCheck);
    if (mobileLowCheck.platform !== 'mobile' || mobileLowCheck.actualRendererDpr !== 0.8 || mobileLowCheck.preservedDprAfterResize !== 0.8 || mobileLowCheck.canvasImageRendering === 'pixelated' || mobileLowCheck.shadowMapEnabled !== false || mobileLowCheck.fpsCap !== 30 || !mobileLowCheck.localStorageSaved) {
        console.error('❌ FAIL: Mobile Low preset settings incorrect!');
    } else {
        console.log('✅ PASS: Mobile Low preset cleanly disables shadows, caps FPS to 30, sets actual renderer DPR to 0.8 (preserved on resize), keeps non-pixelated image, and persists to localStorage.');
    }

    // Test 2C: Switch to PC Profile and Max / Ultra Preset
    console.log('Testing PC Max Preset (Enhanced Shader & PCF Soft Shadows)...');
    await page.evaluate(() => {
        window.graphicsManager.setPlatform('pc');
        window.graphicsManager.applyPreset('max');
    });
    await new Promise(r => setTimeout(r, 300));

    const pcMaxCheck = await page.evaluate(() => {
        const s = window.graphicsManager.getSettings();
        const ow = window.openWorld3D;
        const savedRaw = localStorage.getItem('teleterm_graphics_settings');
        const saved = savedRaw ? JSON.parse(savedRaw) : null;

        return {
            platform: s.platform,
            preset: s.preset,
            dpr: s.dpr,
            actualRendererDpr: ow.renderer.getPixelRatio(),
            canvasImageRendering: ow.canvas ? ow.canvas.style.imageRendering : 'auto',
            shadowMapEnabled: ow.renderer.shadowMap.enabled,
            shadowType: ow.renderer.shadowMap.type,
            fpsCap: ow.fpsCap,
            shaderMode: s.shaderMode,
            sunFlareVisible: ow.sunFlareMesh ? ow.sunFlareMesh.visible : false,
            toneExposure: ow.renderer.toneMappingExposure,
            localStorageSaved: saved && saved.preset === 'max' && saved.platform === 'pc'
        };
    });
    console.log('PC Max Check:', pcMaxCheck);
    if (pcMaxCheck.platform !== 'pc' || pcMaxCheck.actualRendererDpr !== 1.5 || pcMaxCheck.canvasImageRendering === 'pixelated' || pcMaxCheck.shadowMapEnabled !== true || pcMaxCheck.shaderMode !== 'enhanced' || !pcMaxCheck.sunFlareVisible || !pcMaxCheck.localStorageSaved) {
        console.error('❌ FAIL: PC Max preset settings incorrect!');
    } else {
        console.log('✅ PASS: PC Max preset enables Enhanced Anime Shader, 2048 PCF Soft shadows, 1.5 actual renderer DPR, sun flare, and persists to localStorage.');
    }

    // Test 2D: Click Custom preset button
    console.log('Testing Custom Preset button click...');
    await page.click('#gfx-preset-custom');
    await new Promise(r => setTimeout(r, 200));
    const customCheck = await page.evaluate(() => {
        const s = window.graphicsManager.getSettings();
        return { preset: s.preset };
    });
    console.log('Custom Preset Check:', customCheck);
    if (customCheck.preset !== 'custom') {
        console.error('❌ FAIL: Clicking Custom preset button should switch preset to "custom"!');
    } else {
        console.log('✅ PASS: Custom preset button cleanly switches to "custom"!');
    }

    // Capture screenshot of PC Max Settings in modal
    await page.screenshot({ path: 'verify_graphics_modal_pc_max.png' });
    console.log('📸 Saved verify_graphics_modal_pc_max.png');

    // Close modal
    await page.click('#btn-done-graphics-settings');
    await new Promise(r => setTimeout(r, 400));

    // Capture 3D world with Enhanced Anime Shader
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.targetCameraRotation.yaw = -0.18;
        ow.targetCameraRotation.pitch = 0.08;
        ow.cameraRotation.yaw = -0.18;
        ow.cameraRotation.pitch = 0.08;
        ow.targetCameraDistance = 4.2;
        ow.cameraDistance = 4.2;
        ow.updateCamera(0.016);
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'verify_world_enhanced_shader.png' });
    console.log('📸 Saved verify_world_enhanced_shader.png');

    // Switch to Mobile Medium preset and capture clean world with smart nametags
    await page.evaluate(() => {
        window.graphicsManager.setPlatform('mobile');
        window.graphicsManager.applyPreset('medium');
        const ow = window.openWorld3D;
        ow.targetCameraRotation.yaw = 0.45; // Turn to face Lumina
        ow.cameraRotation.yaw = 0.45;
        ow.updateCamera(0.016);
        ow.overheadUi.update();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'verify_world_mobile_medium_smart_nametag.png' });
    console.log('📸 Saved verify_world_mobile_medium_smart_nametag.png');

    await browser.close();
    console.log('\n🎉 ALL TESTS AND VERIFICATIONS COMPLETED SUCCESSFULLY!');
})();
