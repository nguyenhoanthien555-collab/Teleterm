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

        // 1. Full body front-3/4 view
        const p = ow.playerMesh.position;
        ow.camera.position.set(p.x - 1.2, p.y + 1.2, p.z + 1.8);
        ow.camera.lookAt(p.x, p.y + 1.0, p.z);
    });

    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: 'test_player_carry_fullbody.png' });

    // 2. Medium close up on torso and right hand
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        const hand = ow.retargeter.mappedBones.RightHand;
        const hp = new THREE.Vector3();
        hand.getWorldPosition(hp);
        // Look at hand from front-right
        ow.camera.position.set(hp.x - 0.55, hp.y + 0.15, hp.z + 0.55);
        ow.camera.lookAt(hp.x, hp.y, hp.z);
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'test_player_carry_hand_front.png' });

    // 3. Close up from side-right looking directly at fingers wrapped around cylinder
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        const hand = ow.retargeter.mappedBones.RightHand;
        const hp = new THREE.Vector3();
        hand.getWorldPosition(hp);
        // Look from slightly lower and to the right so we see finger tips wrapping
        ow.camera.position.set(hp.x - 0.40, hp.y - 0.05, hp.z + 0.30);
        ow.camera.lookAt(hp.x, hp.y, hp.z);
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: 'test_player_carry_fingers_wrap.png' });

    await browser.close();
    console.log('ALL CARRY VIEWS SAVED');
})();
