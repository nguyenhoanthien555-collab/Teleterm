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

    // Test different finger curls and can placements
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        ow.isCinematicCamera = true;

        ow.equipHandheldItem({
            id: 'drink_green_tea',
            name: 'Japanese Green Tea',
            gripProfile: 'small_can',
            handPose: 'small_can'
        });

        const ret = ow.retargeter;
        const hand = ret.mappedBones.RightHand;

        // Position camera to look directly at right hand and fingers from 3/4 angle
        const handPos = new THREE.Vector3();
        hand.getWorldPosition(handPos);
        ow.camera.position.set(handPos.x - 0.35, handPos.y + 0.05, handPos.z + 0.35);
        ow.camera.lookAt(handPos.x, handPos.y, handPos.z);
    });

    await page.screenshot({ path: 'finger_curl_test_initial.png' });

    // Let's test a natural curl: rotating fingers on X and Y
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const ret = ow.retargeter;

        const applyCurl = (bones, x, y, z) => {
            for (let i = 0; i < bones.length; i++) {
                bones[i].rotation.set(x, y, z);
            }
        };

        // Try negative X or positive X
        // Let's test:
        applyCurl(ret.fingerBones.rightIndex, -0.45, 0.45, 0.1);
        applyCurl(ret.fingerBones.rightMiddle, -0.45, 0.45, 0.05);
        applyCurl(ret.fingerBones.rightRing, -0.45, 0.45, 0.0);
        applyCurl(ret.fingerBones.rightLittle, -0.45, 0.45, -0.05);
        applyCurl(ret.fingerBones.rightThumb, 0.25, 0.35, 0.4);

        // Update mesh
        ow.playerMesh.updateMatrixWorld(true);
    });

    await page.screenshot({ path: 'finger_curl_test_curled_1.png' });

    // Try positive X
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const ret = ow.retargeter;

        const applyCurl = (bones, x, y, z) => {
            for (let i = 0; i < bones.length; i++) {
                bones[i].rotation.set(x, y, z);
            }
        };

        applyCurl(ret.fingerBones.rightIndex, 0.45, 0.45, 0.1);
        applyCurl(ret.fingerBones.rightMiddle, 0.45, 0.45, 0.05);
        applyCurl(ret.fingerBones.rightRing, 0.45, 0.45, 0.0);
        applyCurl(ret.fingerBones.rightLittle, 0.45, 0.45, -0.05);
        applyCurl(ret.fingerBones.rightThumb, 0.25, -0.35, 0.4);

        ow.playerMesh.updateMatrixWorld(true);
    });

    await page.screenshot({ path: 'finger_curl_test_curled_2.png' });

    await browser.close();
})();
