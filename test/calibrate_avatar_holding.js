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

    // Hide overlays
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
    });

    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });

    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.equipHandheldItem({
            id: 'drink_green_tea',
            name: 'Japanese Green Tea',
            gripProfile: 'small_can',
            handPose: 'small_can'
        });
        ow.retargeter.setHandPose('small_can');
    });

    // Let's test a natural carrying pose and check finger curls
    const poseInfo = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        ow.isCinematicCamera = true;

        const ret = ow.retargeter;
        const hand = ret.mappedBones.RightHand;
        const upper = ret.mappedBones.RightUpperArm;
        const lower = ret.mappedBones.RightLowerArm;

        // Print initial bone world matrices / positions
        const handW = new THREE.Vector3();
        hand.getWorldPosition(handW);
        const lowerW = new THREE.Vector3();
        lower.getWorldPosition(lowerW);
        const upperW = new THREE.Vector3();
        upper.getWorldPosition(upperW);

        return {
            upperPos: upperW,
            lowerPos: lowerW,
            handPos: handW,
            upperRot: [upper.rotation.x, upper.rotation.y, upper.rotation.z],
            lowerRot: [lower.rotation.x, lower.rotation.y, lower.rotation.z],
            handRot: [hand.rotation.x, hand.rotation.y, hand.rotation.z]
        };
    });

    console.log('Pose info:', poseInfo);
    await browser.close();
})();
