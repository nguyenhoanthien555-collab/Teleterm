const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });

    const handData = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const hand = ow.retargeter.mappedBones.RightHand;
        const index1 = ow.retargeter.fingerBones.rightIndex[0];
        const thumb1 = ow.retargeter.fingerBones.rightThumb[0];
        const middle1 = ow.retargeter.fingerBones.rightMiddle[0];
        const ring1 = ow.retargeter.fingerBones.rightRing[0];
        const little1 = ow.retargeter.fingerBones.rightLittle[0];

        return {
            handRotation: [hand.rotation.x, hand.rotation.y, hand.rotation.z],
            indexPos: [index1.position.x, index1.position.y, index1.position.z],
            middlePos: [middle1.position.x, middle1.position.y, middle1.position.z],
            thumbPos: [thumb1.position.x, thumb1.position.y, thumb1.position.z],
            littlePos: [little1.position.x, little1.position.y, little1.position.z],
            indexRot: [index1.rotation.x, index1.rotation.y, index1.rotation.z],
            // Check bounding box of hand mesh
            handWorldPos: hand.getWorldPosition(new window.THREE.Vector3()),
            indexWorldPos: index1.getWorldPosition(new window.THREE.Vector3())
        };
    });

    console.log('--- HAND BONE OFFSETS ---', JSON.stringify(handData, null, 2));
    await browser.close();
})();
