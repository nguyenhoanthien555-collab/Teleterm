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
        ow.isCinematicCamera = true;

        ow.equipHandheldItem({
            id: 'drink_green_tea',
            name: 'Japanese Green Tea',
            gripProfile: 'small_can',
            handPose: 'small_can'
        });

        const hand = ow.retargeter.mappedBones.RightHand;
        const handPos = new THREE.Vector3();
        hand.getWorldPosition(handPos);

        // Position camera to look directly at right hand from slightly in front and side
        ow.camera.position.set(handPos.x - 0.35, handPos.y + 0.05, handPos.z + 0.35);
        ow.camera.lookAt(handPos.x, handPos.y, handPos.z);
    });

    // Wait 1 second for retargeter finger curl animation to settle
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: 'test_grip_view_argon.png' });

    // Also take a second view from the other side (back of hand / fingers wrap)
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        const hand = ow.retargeter.mappedBones.RightHand;
        const handPos = new THREE.Vector3();
        hand.getWorldPosition(handPos);
        ow.camera.position.set(handPos.x + 0.30, handPos.y + 0.05, handPos.z + 0.25);
        ow.camera.lookAt(handPos.x, handPos.y, handPos.z);
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'test_grip_view_side.png' });

    await browser.close();
    console.log('HAND GRIP VIEWS SAVED');
})();
