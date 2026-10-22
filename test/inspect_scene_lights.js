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

    const lights = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const list = [];
        ow.scene.traverse(obj => {
            if (obj.isLight) {
                list.push({
                    type: obj.type,
                    name: obj.name,
                    color: '#' + obj.color.getHexString(),
                    groundColor: obj.groundColor ? '#' + obj.groundColor.getHexString() : null,
                    intensity: obj.intensity,
                    pos: [obj.position.x, obj.position.y, obj.position.z],
                    parent: obj.parent?.type
                });
            }
        });
        return list;
    });

    console.log('--- ALL SCENE LIGHTS ---');
    console.log(JSON.stringify(lights, null, 2));
    await browser.close();
})();
