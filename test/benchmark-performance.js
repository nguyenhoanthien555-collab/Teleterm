const puppeteer = require('puppeteer');

async function benchmark() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu-sandbox',
            '--use-gl=angle',
            '--use-angle=default',
            '--window-size=1280,800'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log('Navigating to http://localhost:4000/?direct=1 ...');
        await page.goto('http://localhost:4000/?direct=1', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 4500));

        await page.evaluate(() => {
            const launcher = document.getElementById('teleterm-launcher-overlay');
            if (launcher) launcher.style.display = 'none';
            if (window.desktopLauncher) window.desktopLauncher.hideLauncher();
            document.body.classList.remove('mode-focus');
            document.body.classList.add('mode-explore');
        });

        await page.waitForFunction(() => {
            return window.openWorld3D && window.openWorld3D.renderer && window.openWorld3D.camera;
        }, { timeout: 30000 });

        // Reset performance manager rolling buffer to discard initial GLTF unpacking hitch
        await page.evaluate(() => {
            const pm = window.openWorld3D?.performanceManager;
            if (pm) {
                pm.frameTimeHistory.fill(16.6);
                pm.historyIndex = 0;
                pm.totalSamples = 0;
            }
        });

        // Let renderer run 60 steady-state frames
        await new Promise(r => setTimeout(r, 2500));

        const stats = await page.evaluate(() => {
            const ow = window.openWorld3D;
            if (!ow || !ow.renderer) return { error: 'openWorld3D or renderer missing' };
            const r = ow.renderer;
            const pm = ow.performanceManager;
            const info = r.info;
            
            // Count total scene objects
            let meshCount = 0;
            let groupCount = 0;
            let instancedCount = 0;
            let castShadowCount = 0;
            let receiveShadowCount = 0;
            let matrixAutoUpdateCount = 0;
            // Reset performance manager rolling buffer to measure steady-state FPS without loading hitch
            if (pm) {
                pm.frameTimeHistory.fill(16.6);
                pm.historyIndex = 0;
                pm.totalSamples = 0;
            }

            const matrixAutoUpdateByType = {};
            const shadowCastersByType = {};
            ow.scene.traverse(obj => {
                let p = obj;
                let label = obj.name || '';
                while (p && !label) {
                    if (p.name) label = p.name;
                    p = p.parent;
                }
                label = label || obj.constructor.name;

                if (obj.isMesh) {
                    meshCount++;
                    if (obj.isInstancedMesh) instancedCount++;
                    if (obj.castShadow) {
                        castShadowCount++;
                        shadowCastersByType[label] = (shadowCastersByType[label] || 0) + 1;
                    }
                    if (obj.receiveShadow) receiveShadowCount++;
                    if (obj.matrixAutoUpdate) {
                        matrixAutoUpdateCount++;
                        matrixAutoUpdateByType[label] = (matrixAutoUpdateByType[label] || 0) + 1;
                    }
                } else if (obj.isGroup) {
                    groupCount++;
                    if (obj.matrixAutoUpdate) {
                        matrixAutoUpdateCount++;
                        matrixAutoUpdateByType[label] = (matrixAutoUpdateByType[label] || 0) + 1;
                    }
                }
            });

            return {
                drawCalls: info.render.calls,
                triangles: info.render.triangles,
                points: info.render.points,
                lines: info.render.lines,
                geometriesInMemory: info.memory.geometries,
                texturesInMemory: info.memory.textures,
                fps: pm ? pm.fps : null,
                avgFps: pm ? pm.avgFps : null,
                minFps: pm ? pm.minFps : null,
                frameTimeMs: pm ? pm.frameTimeMs : null,
                activeProfile: pm ? pm.activeProfile : null,
                currentDpr: pm ? pm.currentDpr : null,
                meshCount,
                groupCount,
                instancedCount,
                castShadowCount,
                receiveShadowCount,
                matrixAutoUpdateCount,
                matrixAutoUpdateByType,
                shadowCastersByType,
                shadowMapEnabled: r.shadowMap.enabled,
                shadowMapType: r.shadowMap.type,
                sunShadowCamera: ow.worldComposition?.weatherSystem?.sunLight?.shadow?.camera ? {
                    near: ow.worldComposition.weatherSystem.sunLight.shadow.camera.near,
                    far: ow.worldComposition.weatherSystem.sunLight.shadow.camera.far,
                    left: ow.worldComposition.weatherSystem.sunLight.shadow.camera.left,
                    right: ow.worldComposition.weatherSystem.sunLight.shadow.camera.right,
                    top: ow.worldComposition.weatherSystem.sunLight.shadow.camera.top,
                    bottom: ow.worldComposition.weatherSystem.sunLight.shadow.camera.bottom,
                    mapSize: {
                        width: ow.worldComposition.weatherSystem.sunLight.shadow.mapSize.width,
                        height: ow.worldComposition.weatherSystem.sunLight.shadow.mapSize.height
                    }
                } : null
            };
        });

        console.log('=== RUNTIME PERFORMANCE BENCHMARK ===');
        console.log(JSON.stringify(stats, null, 2));

    } catch (err) {
        console.error('Benchmark Error:', err);
    } finally {
        await browser.close();
    }
}

benchmark();
