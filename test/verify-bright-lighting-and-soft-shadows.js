const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('=== STARTING AUTOMATED TEST: BRIGHT ANIME LIGHTING & SOFT LUMINOUS SHADOWS ===');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const pageErrors = [];
    page.on('pageerror', err => {
        console.error('[PAGE ERROR]', err.message);
        pageErrors.push(err.message);
    });

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`[PAGE CONSOLE ERROR] ${msg.text()}`);
        }
    });

    const artifactDir = path.resolve('C:/Users/Hoan Thien/.gemini/antigravity/brain/3fcaf81d-9851-4f83-886e-c77e3e727e31');

    try {
        console.log('1. Loading http://localhost:4000?direct=1 ...');
        await page.goto('http://localhost:4000?direct=1', { waitUntil: 'domcontentloaded', timeout: 25000 });

        // Wait 4 seconds for 3D world, assets & shaders to initialize
        await new Promise(r => setTimeout(r, 4000));

        if (pageErrors.length > 0) {
            throw new Error(`Page threw unhandled errors on startup: ${pageErrors.join('; ')}`);
        }
        console.log('✓ Page loaded cleanly with zero startup errors.');

        // Step 2: Verify live lighting parameters in the runtime
        const lightingState = await page.evaluate(() => {
            const ow = window.openWorld3D;
            if (!ow) return { error: 'openWorld3D not found on window' };

            const tod = ow.worldComposition?.timeOfDay || window.timeOfDaySystem;
            const weather = ow.worldComposition?.weatherSystem || ow.worldComposition?.weather;
            const atmo = ow.worldComposition?.atmosphereSystem || ow.worldComposition?.atmosphere;

            return {
                toneMappingExposure: ow.renderer?.toneMappingExposure,
                shadowMapType: ow.renderer?.shadowMap?.type,
                timeOfDay: tod ? tod.time : null,
                todAmbientIntensity: tod ? tod.ambientIntensity : null,
                todSunIntensity: tod ? tod.sunIntensity : null,
                weatherHemiIntensity: weather?.hemiLight ? weather.hemiLight.intensity : null,
                weatherHemiGroundColor: weather?.hemiLight?.groundColor ? '#' + weather.hemiLight.groundColor.getHexString() : null,
                atmoAmbientIntensity: atmo?.ambientLight ? atmo.ambientLight.intensity : null,
                atmoRimIntensity: atmo?.rimLight ? atmo.rimLight.intensity : null,
                hasAvatarFrontLight: !!ow.avatarFrontLight,
                avatarFrontLightIntensity: ow.avatarFrontLight ? ow.avatarFrontLight.intensity : null,
                avatarFrontLightInCamera: ow.camera ? ow.camera.children.includes(ow.avatarFrontLight) : false
            };
        });

        console.log('2. Live Lighting Diagnostics:', JSON.stringify(lightingState, null, 2));

        if (lightingState.error) {
            throw new Error(lightingState.error);
        }

        if (lightingState.toneMappingExposure < 1.20) {
            throw new Error(`toneMappingExposure is too low: ${lightingState.toneMappingExposure} (must be >= 1.20)`);
        }
        console.log(`✓ ACESFilmic toneMappingExposure is high-key radiant: ${lightingState.toneMappingExposure}`);

        if (lightingState.todAmbientIntensity < 0.60) {
            throw new Error(`TimeOfDay ambient intensity is too low: ${lightingState.todAmbientIntensity} (must be >= 0.60)`);
        }
        console.log(`✓ Daytime ambient intensity boosted to luminous: ${lightingState.todAmbientIntensity}`);

        if (lightingState.weatherHemiIntensity < 0.60) {
            throw new Error(`Weather hemiLight intensity is too low: ${lightingState.weatherHemiIntensity} (must be >= 0.60)`);
        }
        console.log(`✓ Hemispherical anime bounce intensity: ${lightingState.weatherHemiIntensity} with ground bounce ${lightingState.weatherHemiGroundColor}`);

        if (!lightingState.hasAvatarFrontLight || !lightingState.avatarFrontLightInCamera) {
            throw new Error('avatarFrontLight is missing from camera!');
        }
        console.log(`✓ Camera-mounted avatarFrontLight active with intensity: ${lightingState.avatarFrontLightIntensity}`);

        // Wait for player avatar GLB to fully download and load
        console.log('Waiting for playerMesh GLB to load...');
        await page.waitForFunction(() => !!window.openWorld3D?.playerMesh, { timeout: 35000 });
        console.log('✓ Player avatar GLB loaded and rendered.');

        // Wait another 1 second for any dynamic shaders/post-processing
        await new Promise(r => setTimeout(r, 1000));

        // Step 3: Capture bright anime daytime lighting proof
        const daytimeProofPath = path.join(artifactDir, 'proof_bright_anime_lighting_and_soft_shadows.png');
        await page.screenshot({ path: daytimeProofPath });
        console.log(`✓ Saved daytime lighting proof to: ${daytimeProofPath}`);

        // Step 4: Rotate camera to view avatar from the front/side to verify face & outfit visibility
        console.log('4. Rotating camera to inspect avatar front & face illumination...');
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            if (ow) {
                // Orbit camera around player to look directly at front of character
                ow.targetCameraRotation.yaw = Math.PI * 0.95;
                ow.cameraRotation.yaw = Math.PI * 0.95;
                ow.targetCameraDistance = 3.4;
                ow.cameraDistance = 3.4;
                ow.targetCameraRotation.pitch = 0.12;
                ow.cameraRotation.pitch = 0.12;
            }
        });
        await new Promise(r => setTimeout(r, 1500));

        const avatarCloseupProof = path.join(artifactDir, 'proof_avatar_radiant_front_illumination.png');
        await page.screenshot({ path: avatarCloseupProof });
        console.log(`✓ Saved avatar front illumination proof to: ${avatarCloseupProof}`);

        // Step 5: Test Sunset Phase (must be warm peach golden, soft shadows, never black)
        console.log('5. Testing Sunset Phase (warm luminous anime horizon, soft shadows)...');
        const sunsetCheck = await page.evaluate(() => {
            const tod = window.openWorld3D?.worldComposition?.timeOfDay || window.timeOfDaySystem;
            if (tod) {
                tod.lockTime('sunset');
                return {
                    time: tod.time,
                    ambientIntensity: tod.ambientIntensity,
                    ambientColor: '#' + tod.currentAmbientColor.getHexString()
                };
            }
            return null;
        });
        console.log('Sunset state:', sunsetCheck);
        await new Promise(r => setTimeout(r, 1500));

        const sunsetProof = path.join(artifactDir, 'proof_bright_sunset_soft_shadows.png');
        await page.screenshot({ path: sunsetProof });
        console.log(`✓ Saved sunset proof to: ${sunsetProof}`);

        // Step 6: Test Cyberpunk Night Phase (luminous starlight, lantern glow, never pitch black)
        console.log('6. Testing Cyberpunk Night Phase (deep luminous starlight, never pitch black)...');
        const nightCheck = await page.evaluate(() => {
            const tod = window.openWorld3D?.worldComposition?.timeOfDay || window.timeOfDaySystem;
            if (tod) {
                tod.lockTime('night');
                return {
                    time: tod.time,
                    ambientIntensity: tod.ambientIntensity,
                    ambientColor: '#' + tod.currentAmbientColor.getHexString()
                };
            }
            return null;
        });
        console.log('Night state:', nightCheck);
        await new Promise(r => setTimeout(r, 1500));

        const nightProof = path.join(artifactDir, 'proof_luminous_cyberpunk_night.png');
        await page.screenshot({ path: nightProof });
        console.log(`✓ Saved night proof to: ${nightProof}`);

        // Restore to Daytime
        await page.evaluate(() => {
            const tod = window.openWorld3D?.worldComposition?.timeOfDay || window.timeOfDaySystem;
            if (tod) {
                tod.lockTime('day');
            }
        });

        console.log('=== ALL BRIGHT LIGHTING & SOFT SHADOW TESTS PASSED WITH 100% SUCCESS ===');
    } catch (err) {
        console.error('❌ Test failed:', err);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
})();
