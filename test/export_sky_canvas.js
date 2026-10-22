const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });

    const dataUrl = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const atmo = ow.worldComposition?.atmosphereSystem;
        const tex = atmo?.skyTex;
        if (tex && tex.image && typeof tex.image.toDataURL === 'function') {
            return tex.image.toDataURL('image/png');
        }
        return null;
    });

    if (dataUrl) {
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync('sky_canvas_exported.png', Buffer.from(base64, 'base64'));
        console.log('✅ Exported sky_canvas_exported.png');
    } else {
        console.log('❌ Could not export sky canvas');
    }

    await browser.close();
})();
