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

    // Experiment with arm poses and finger curl
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

        // Let's test a natural carrying pose in update override:
        const ret = ow.retargeter;
        ret.setHandPose('small_can');

        // Let's inspect bone rotations on RightUpperArm, RightLowerArm, RightHand
        // In VRoid:
        // RightUpperArm: z rotates down from T-pose (z ~ 1.25 is straight down along torso).
        // x rotates forward/backward (x < 0 is forward pitch).
        // y rotates arm axial twist.
        // RightLowerArm: in VRoid, elbow flexion is usually along Y or Z or X?
        // Let's test rotating RightLowerArm along X, Y, Z to see which axis cleanly flexes the elbow forward!
    });

    // Let's test elbow flexion axes
    const elbowTest = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        const lower = ow.retargeter.mappedBones.RightLowerArm;
        const hand = ow.retargeter.mappedBones.RightHand;

        // Reset
        lower.rotation.set(0, 0, 0);
        lower.updateMatrixWorld(true);
        const p0 = new THREE.Vector3();
        hand.getWorldPosition(p0);

        // Test rotX = 0.5
        lower.rotation.set(0.5, 0, 0);
        lower.updateMatrixWorld(true);
        const pX = new THREE.Vector3();
        hand.getWorldPosition(pX);

        // Test rotY = 0.5
        lower.rotation.set(0, 0.5, 0);
        lower.updateMatrixWorld(true);
        const pY = new THREE.Vector3();
        hand.getWorldPosition(pY);

        // Test rotZ = 0.5
        lower.rotation.set(0, 0, 0.5);
        lower.updateMatrixWorld(true);
        const pZ = new THREE.Vector3();
        hand.getWorldPosition(pZ);

        return {
            base: p0,
            diffX: { dx: pX.x - p0.x, dy: pX.y - p0.y, dz: pX.z - p0.z },
            diffY: { dx: pY.x - p0.x, dy: pY.y - p0.y, dz: pY.z - p0.z },
            diffZ: { dx: pZ.x - p0.x, dy: pZ.y - p0.y, dz: pZ.z - p0.z }
        };
    });

    console.log('Elbow axis test:', elbowTest);
    await browser.close();
})();
