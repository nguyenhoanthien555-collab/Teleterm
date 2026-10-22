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

    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;

        ow.equipHandheldItem({
            id: 'drink_green_tea',
            name: 'Japanese Green Tea',
            gripProfile: 'small_can',
            handPose: 'small_can'
        });

        const ret = ow.retargeter;
        ret.setHandPose('small_can');

        const origUpdate = ret.update.bind(ret);
        ret.update = function(delta) {
            origUpdate(delta);
            if (this.currentHandPose && this.currentHandPose !== 'empty_hand' && !this.drinkTargets) {
                const breathSway = Math.sin(this.time * 1.8) * 0.008;
                // Natural forward carry at waist height, held slightly toward center of body
                if (this.mappedBones.RightUpperArm) {
                    this.mappedBones.RightUpperArm.rotation.set(-0.20, -0.08, 1.25 + breathSway);
                }
                if (this.mappedBones.RightLowerArm) {
                    this.mappedBones.RightLowerArm.rotation.set(-0.25, 1.05, -0.42 - breathSway);
                }
                if (this.mappedBones.RightHand) {
                    // Turn hand so palm faces slightly up and inward, cradling the can vertically
                    this.mappedBones.RightHand.rotation.set(0.12, -0.18, 0.38);
                }
                // Relaxed left arm
                if (this.mappedBones.LeftUpperArm) {
                    this.mappedBones.LeftUpperArm.rotation.set(-0.10, 0.04, -1.22 - breathSway);
                }
                if (this.mappedBones.LeftLowerArm) {
                    this.mappedBones.LeftLowerArm.rotation.set(-0.06, -0.16, 0.10);
                }
            }
        };

        const can = ow.handheldItemMesh;
        if (can) {
            // Reorient can upright: silver lid at top, green tea label readable, nestled in fingers
            can.position.set(-0.052, -0.010, 0.006);
            can.rotation.set(0.08, -0.22, 1.55);
        }

        const curlFingers = (bones, x, y, z) => {
            for (let i = 0; i < bones.length; i++) {
                bones[i].rotation.set(x, y, z);
            }
        };

        // Realistic finger wrap around cylinder:
        // Fingers curl around cylinder
        curlFingers(ret.fingerBones.rightIndex, -0.32, 0.45, 0.10);
        curlFingers(ret.fingerBones.rightMiddle, -0.36, 0.50, 0.06);
        curlFingers(ret.fingerBones.rightRing, -0.35, 0.48, 0.02);
        curlFingers(ret.fingerBones.rightLittle, -0.30, 0.42, -0.02);
        // Thumb rests against front-side of can
        curlFingers(ret.fingerBones.rightThumb, 0.20, 0.22, 0.30);

        ow.playerMesh.updateMatrixWorld(true);
    });

    await new Promise(r => setTimeout(r, 600));

    // Capture front
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.isCinematicCamera = true;
        const p = ow.player.position;
        ow.camera.position.set(p.x, p.y + 1.02, p.z + 1.9);
        ow.camera.lookAt(p.x, p.y + 0.82, p.z);
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'test_pose_front_v3.png' });

    // Capture side
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.isCinematicCamera = true;
        const p = ow.player.position;
        ow.camera.position.set(p.x - 1.5, p.y + 0.95, p.z + 0.2);
        ow.camera.lookAt(p.x, p.y + 0.85, p.z);
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'test_pose_side_v3.png' });

    // Capture closeup from 3/4 front-right
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        ow.isCinematicCamera = true;
        const hand = ow.retargeter.mappedBones.RightHand;
        const handPos = new THREE.Vector3();
        hand.getWorldPosition(handPos);
        ow.camera.position.set(handPos.x - 0.26, handPos.y + 0.12, handPos.z + 0.30);
        ow.camera.lookAt(handPos.x, handPos.y, handPos.z);
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'test_pose_closeup_v3.png' });

    await browser.close();
})();
