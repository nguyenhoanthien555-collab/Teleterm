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

    const details = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const atmo = ow.atmosphereSystem;
        return {
            hasAtmo: !!atmo,
            skyMesh: !!atmo?.skyMesh,
            skyMeshType: atmo?.skyMesh?.type,
            skyMeshMat: atmo?.skyMesh?.material?.type,
            skyMeshChildren: atmo?.skyMesh?.children?.length,
            sceneChildrenWithSky: ow.scene.children.filter(c => c.name?.toLowerCase().includes('sky') || c.geometry?.type?.includes('Sphere')).map(c => ({
                name: c.name,
                type: c.type,
                geo: c.geometry?.type,
                mat: c.material?.type,
                radius: c.geometry?.parameters?.radius
            }))
        };
    });

    console.log('--- SKY DETAILS ---', JSON.stringify(details, null, 2));
    await browser.close();
})();
