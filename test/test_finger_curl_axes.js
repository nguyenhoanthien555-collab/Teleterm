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

    const curlResult = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;
        const index1 = ow.retargeter.fingerBones.rightIndex[0];
        const index3 = ow.retargeter.fingerBones.rightIndex[2];

        // Measure tip position relative to hand bone
        const hand = ow.retargeter.mappedBones.RightHand;

        const getTipLocal = () => {
            hand.updateMatrixWorld(true);
            const wPos = new THREE.Vector3();
            index3.getWorldPosition(wPos);
            return hand.worldToLocal(wPos);
        };

        const base = getTipLocal();

        index1.rotation.set(0.5, 0, 0);
        const rX = getTipLocal();

        index1.rotation.set(0, 0.5, 0);
        const rY = getTipLocal();

        index1.rotation.set(0, 0, 0.5);
        const rZ = getTipLocal();

        return {
            base,
            diffX: { dx: rX.x - base.x, dy: rX.y - base.y, dz: rX.z - base.z },
            diffY: { dx: rY.x - base.x, dy: rY.y - base.y, dz: rY.z - base.z },
            diffZ: { dx: rZ.x - base.x, dy: rZ.y - base.y, dz: rZ.z - base.z }
        };
    });

    console.log('Finger curl axis test:', JSON.stringify(curlResult, null, 2));
    await browser.close();
})();
