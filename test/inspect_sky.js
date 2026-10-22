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

    // Look straight up at the sky and north at 30 deg up
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.isCinematicCamera = true;
        // From player position looking towards -Z and up 35 degrees
        const p = ow.player.position;
        ow.camera.position.set(p.x, p.y + 1.6, p.z);
        ow.camera.lookAt(p.x, p.y + 35.0, p.z - 50.0);
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'test_sky_look_up.png' });

    await browser.close();
})();
