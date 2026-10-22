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

    // Test face lighting & skin shader calibration
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const THREE = window.THREE;

        // 1. Calibrate HemisphereLight to soft warm ground bounce
        if (ow.weatherSystem?.hemiLight) {
            ow.weatherSystem.hemiLight.color.setHex(0xfff5eb);
            ow.weatherSystem.hemiLight.groundColor.setHex(0xfaeee6); // warm gentle bounce, zero green tint!
            ow.weatherSystem.hemiLight.intensity = 0.45;
        }

        // 2. Adjust skin materials on player mesh: zero emissive, soft natural anime warmth
        ow.playerMesh.traverse(child => {
            if (child.isMesh && child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(mat => {
                    const name = mat.name || '';
                    if (name.includes('SKIN')) {
                        mat.color.setHex(0xffede4); // Soft healthy peach anime complexion
                        mat.emissive.setHex(0x000000);
                        mat.emissiveIntensity = 0.0;
                        mat.roughness = 0.72; // Soft matte skin texture
                    }
                    if (name.includes('FaceMouth')) {
                        // Ensure crisp anime mouth line
                        mat.color.setHex(0x5a2d2d); // Crisp dark warm contour for mouth
                        mat.opacity = 1.0;
                        mat.alphaTest = 0.02;
                    }
                    if (name.includes('FaceBrow')) {
                        mat.color.setHex(0x2a1a1a); // Crisp brows
                        mat.opacity = 1.0;
                        mat.alphaTest = 0.02;
                    }
                });
            }
        });

        // Position camera right at face
        ow.isCinematicCamera = true;
        const head = ow.retargeter.mappedBones.Head;
        const headPos = new THREE.Vector3();
        head.getWorldPosition(headPos);
        ow.camera.position.set(headPos.x, headPos.y + 0.02, headPos.z + 0.65);
        ow.camera.lookAt(headPos.x, headPos.y, headPos.z);
    });

    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: 'test_face_calibrated.png' });

    await browser.close();
})();
