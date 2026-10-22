const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });

    // Test different finger rotations and can transforms
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        ow.isCinematicCamera = true;

        // Position camera to look directly at right palm
        const hand = ow.retargeter.mappedBones.RightHand;
        const handPos = new THREE.Vector3();
        hand.getWorldPosition(handPos);

        // Let's look at hand from the palm side (front-ish)
        ow.camera.position.set(handPos.x - 0.25, handPos.y, handPos.z + 0.35);
        ow.camera.lookAt(handPos.x, handPos.y, handPos.z);
    });

    await page.screenshot({ path: 'hand_inspect_default.png' });

    // Let's test rotating index finger on X vs Y vs Z
    const axesResult = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const b = ow.retargeter.fingerBones.rightIndex[0];
        // Check rest rotation and parent orientation
        return {
            name: b.name,
            restRot: [b.rotation.x, b.rotation.y, b.rotation.z],
            parentName: b.parent.name
        };
    });
    console.log('Index bone parent:', axesResult);

    await browser.close();
})();
