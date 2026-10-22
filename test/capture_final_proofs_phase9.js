const puppeteer = require('puppeteer');

(async () => {
    console.log('🚀 Running Final Comprehensive Proof Capture...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('error') || text.includes('Error') || text.includes('OpenWorld3D')) {
            console.log('BROWSER_LOG:', text);
        }
    });

    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2500));

    // Hide launcher overlay & terminal
    await page.evaluate(() => {
        if (window.desktopLauncher && typeof window.desktopLauncher.hideLauncher === 'function') {
            window.desktopLauncher.hideLauncher();
        }
        const overlay = document.getElementById('desktop-launcher-overlay');
        if (overlay) overlay.style.display = 'none';

        const term = document.getElementById('deck-terminal-screen');
        if (term) term.style.display = 'none';

        document.body.classList.add('mode-explore');
        document.body.classList.remove('mode-focus');
        if (window.__teleTermApp) {
            window.__teleTermApp.setFocusMode(false);
        }
    });

    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });
    console.log('✅ OpenWorld3D & PlayerMesh loaded.');

    // Equip drink_green_tea
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const itemDef = {
            id: 'drink_green_tea',
            name: 'Japanese Green Tea',
            icon: '🍵',
            gripProfile: 'small_can',
            handPose: 'small_can'
        };
        ow.equipHandheldItem(itemDef);
        if (ow.retargeter) {
            ow.retargeter.setHandPose('small_can');
        }
    });

    // Wait 1.5 seconds for retargeter blend & materials to stabilize
    await new Promise(r => setTimeout(r, 1500));

    // 1. PROOF 1: Front Face Close-up
    console.log('📸 Capturing Proof 1: Face Features & Shading...');
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        ow.isCinematicCamera = true;
        const head = ow.retargeter.mappedBones.Head;
        const headPos = new THREE.Vector3();
        head.getWorldPosition(headPos);
        ow.camera.position.set(headPos.x, headPos.y + 0.02, headPos.z + 0.65);
        ow.camera.lookAt(headPos.x, headPos.y, headPos.z);
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'proof_1_avatar_face_features.png' });

    // 2. PROOF 2: Hand and Can Socket Close-up
    console.log('📸 Capturing Proof 2: Hand & Can Grip Alignment...');
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        ow.isCinematicCamera = true;
        const hand = ow.retargeter.mappedBones.RightHand;
        const handPos = new THREE.Vector3();
        hand.getWorldPosition(handPos);
        ow.camera.position.set(handPos.x - 0.38, handPos.y + 0.12, handPos.z + 0.38);
        ow.camera.lookAt(handPos.x, handPos.y, handPos.z);
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'proof_2_avatar_hand_can_socket.png' });

    // 3. PROOF 3: Full Body Front (Relaxed Natural Arm Carry & Refined Dress)
    console.log('📸 Capturing Proof 3: Full Body Relaxed Carry & Dress...');
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.isCinematicCamera = true;
        const p = ow.player.position;
        ow.camera.position.set(p.x, p.y + 1.05, p.z + 2.2);
        ow.camera.lookAt(p.x, p.y + 0.85, p.z);
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'proof_3_avatar_natural_relaxed_carry.png' });

    // 4. PROOF 4: Right Side Profile of Arm Posture
    console.log('📸 Capturing Proof 4: Side Profile of Arm Posture...');
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.isCinematicCamera = true;
        const p = ow.player.position;
        ow.camera.position.set(p.x - 1.8, p.y + 0.95, p.z + 0.1);
        ow.camera.lookAt(p.x, p.y + 0.85, p.z);
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'proof_4_avatar_side_profile_arm.png' });

    // 5. PROOF 5: Locomotion Carry & Skirt Sway
    console.log('📸 Capturing Proof 5: Locomotion Carry & Skirt Sway...');
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        // Simulate walking forward
        ow.keys.forward = true;
    });
    // Wait 800ms while character walks
    await new Promise(r => setTimeout(r, 800));
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.isCinematicCamera = true;
        const p = ow.player.position;
        ow.camera.position.set(p.x - 1.2, p.y + 0.95, p.z + 1.6);
        ow.camera.lookAt(p.x, p.y + 0.80, p.z);
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'proof_5_locomotion_carry_and_skirt_sway.png' });
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.keys.forward = false;
    });

    // 6. PROOF 6: Sky, Clouds & Horizon Panorama (From Coastal Pier / Dunes)
    console.log('📸 Capturing Proof 6: Sky Dome & Multi-scale Clouds...');
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.isCinematicCamera = true;
        // Open beach vista (x: 10, z: 75), looking North across the entire valley towards the mountains & sky
        ow.camera.position.set(10.5, 4.5, 72.0);
        ow.camera.lookAt(10.5, 14.0, 0.0);
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'proof_6_sky_clouds_panorama.png' });

    // 7. PROOF 7: Terraced Flooded Rice Paddies
    console.log('📸 Capturing Proof 7: Translucent Rice Paddies...');
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.isCinematicCamera = true;
        // Looking over rice fields at x: -16, z: 2.5
        ow.camera.position.set(-10.0, 2.4, 4.2);
        ow.camera.lookAt(-24.0, 0.4, 8.0);
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'proof_7_rice_fields_translucent_water.png' });

    await browser.close();
    console.log('🎉 All proofs captured successfully!');
})();
