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
        const hp = new THREE.Vector3();
        hand.getWorldPosition(hp);

        // Frame player torso and right hand clearly
        ow.camera.position.set(hp.x - 0.50, hp.y + 0.05, hp.z + 0.50);
        ow.camera.lookAt(hp.x, hp.y, hp.z);
    });

    await new Promise(r => setTimeout(r, 1200));

    // Test angles
    const testRots = [
        { name: 'rot_base', rot: [Math.PI / 2, 0.0, -0.15] },
        { name: 'rot_upright_1', rot: [Math.PI / 2 + 0.35, 0.10, -0.15] },
        { name: 'rot_upright_2', rot: [Math.PI / 2 - 0.35, -0.10, -0.15] }
    ];

    for (const t of testRots) {
        await page.evaluate((r) => {
            const m = window.openWorld3D.handheldItemMesh;
            if (m) m.rotation.set(r[0], r[1], r[2]);
        }, t.rot);
        await new Promise(r => setTimeout(r, 300));
        await page.screenshot({ path: `test_can_${t.name}.png` });
    }

    await browser.close();
    console.log('ROTATION TESTS CAPTURED');
})();
