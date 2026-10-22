const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    await page.evaluate(() => {
        if (window.desktopLauncher && typeof window.desktopLauncher.hideLauncher === 'function') {
            window.desktopLauncher.hideLauncher();
        }
        const overlay = document.getElementById('desktop-launcher-overlay');
        if (overlay) overlay.style.display = 'none';
        document.body.classList.add('mode-explore');
        document.body.classList.remove('mode-focus');
    });

    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });

    // Inject refined natural carry pose & grip profile into live runtime
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        const ret = ow.retargeter;

        // 1. Refined Natural Carrying Arm Pose:
        // RightUpperArm: hangs close to ribcage, angled slightly forward (-0.25 rad) and down (1.22 rad)
        // RightLowerArm: flexed forward at ~65 deg (y: 1.15 rad), angled inward toward navel (z: -0.32 rad, x: -0.15 rad)
        // RightHand: cradles item comfortably upright, palm angled inward/upward
        // LeftUpperArm: relaxed natural hang (-0.12, 0.05, -1.18)
        // LeftLowerArm: relaxed natural gentle bend (-0.08, -0.22, 0.10)

        // Let's hook into retargeter targets by patching solveIdle or retargeter.update
        const origUpdate = ret.update.bind(ret);
        ret.update = function(delta) {
            origUpdate(delta);
            // If holding an item and not drinking
            if (this.currentHandPose && this.currentHandPose !== 'empty_hand' && !this.drinkTargets) {
                const breathSway = Math.sin(this.time * 1.8) * 0.01;
                // Right Arm: Relaxed forward carry
                if (this.mappedBones.RightUpperArm) {
                    this.mappedBones.RightUpperArm.rotation.set(-0.25 + breathSway * 0.5, -0.08, 1.22 + breathSway);
                }
                if (this.mappedBones.RightLowerArm) {
                    this.mappedBones.RightLowerArm.rotation.set(-0.15, 1.15 - breathSway * 0.5, -0.32);
                }
                if (this.mappedBones.RightHand) {
                    this.mappedBones.RightHand.rotation.set(0.15, -0.20, 0.35);
                }
                // Left Arm: Relaxed natural drape (not stiff A-pose!)
                if (this.mappedBones.LeftUpperArm) {
                    this.mappedBones.LeftUpperArm.rotation.set(-0.12, 0.05, -1.18 - breathSway);
                }
                if (this.mappedBones.LeftLowerArm) {
                    this.mappedBones.LeftLowerArm.rotation.set(-0.08, -0.22 + breathSway * 0.5, 0.10);
                }
                if (this.mappedBones.LeftHand) {
                    this.mappedBones.LeftHand.rotation.set(-0.05, 0.0, -0.04);
                }
            }
        };

        // Equip can
        ow.equipHandheldItem({
            id: 'drink_green_tea',
            name: 'Japanese Green Tea',
            gripProfile: 'small_can',
            handPose: 'small_can'
        });
        ret.setHandPose('small_can');
    });

    await new Promise(r => setTimeout(r, 600));

    // Capture front full body
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.isCinematicCamera = true;
        const p = ow.player.position;
        ow.camera.position.set(p.x, p.y + 1.05, p.z + 2.2);
        ow.camera.lookAt(p.x, p.y + 0.85, p.z);
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'test_pose_front.png' });

    // Capture side profile
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.isCinematicCamera = true;
        const p = ow.player.position;
        ow.camera.position.set(p.x - 1.8, p.y + 0.95, p.z + 0.1);
        ow.camera.lookAt(p.x, p.y + 0.85, p.z);
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'test_pose_side.png' });

    // Capture hand closeup
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        ow.isCinematicCamera = true;
        const hand = ow.retargeter.mappedBones.RightHand;
        const handPos = new THREE.Vector3();
        hand.getWorldPosition(handPos);
        ow.camera.position.set(handPos.x - 0.40, handPos.y + 0.15, handPos.z + 0.45);
        ow.camera.lookAt(handPos.x, handPos.y, handPos.z);
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'test_pose_hand.png' });

    await browser.close();
})();
