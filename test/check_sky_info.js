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

    const skyInfo = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const atmo = ow.atmosphereSystem;
        const tod = ow.timeOfDaySystem;

        return {
            sceneBg: ow.scene.background ? '#' + ow.scene.background.getHexString() : null,
            fogNear: ow.scene.fog?.near,
            fogFar: ow.scene.fog?.far,
            fogColor: ow.scene.fog?.color ? '#' + ow.scene.fog.color.getHexString() : null,
            skyMeshVisible: atmo?.skyMesh?.visible,
            skyMeshRadius: atmo?.skyMesh?.geometry?.parameters?.radius,
            skyMeshColor: atmo?.skyMesh?.material?.color ? '#' + atmo.skyMesh.material.color.getHexString() : null,
            hasMap: !!atmo?.skyMesh?.material?.map,
            mapOffset: atmo?.skyMesh?.material?.map?.offset,
            timeOfDayCurrentSky: '#' + tod?.currentSkyColor?.getHexString(),
            timeOfDayCurrentFog: '#' + tod?.currentFogColor?.getHexString(),
            timeOfDayTime: tod?.currentTime
        };
    });

    console.log('--- SKY INFO ---', JSON.stringify(skyInfo, null, 2));
    await browser.close();
})();
