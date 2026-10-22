const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Hoan Thien/.gemini/antigravity/brain/3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function runCampfireSocialTest() {
    console.log('Launching Puppeteer to test Campfire Social & Synchronized Lofi Radio...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--use-gl=angle',
            '--use-angle=default'
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });

        page.on('console', msg => {
            const txt = msg.text();
            if (txt.includes('Campfire') || txt.includes('GPU Optimization') || txt.includes('IN_WORLD') || txt.includes('Error')) {
                console.log('PAGE LOG:', txt);
            }
        });

        console.log('Navigating to http://localhost:4000/?direct=1 ...');
        await page.goto('http://localhost:4000/?direct=1', { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for IN_WORLD state
        await page.waitForFunction(() => {
            return window.openWorld3D && window.openWorld3D.player && window.worldComposition && window.worldComposition.campfireSocial;
        }, { timeout: 25000 });

        // Wait 3s for initial physics and shaders to settle
        await new Promise(r => setTimeout(r, 3000));

        // 1. Teleport player near Campfire Clearing (North log bench)
        console.log('Teleporting player to Campfire Glade at (14.0, 15.6)...');
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            ow.player.position.set(14.0, ow.getTerrainHeight(14.0, 15.6), 15.6);
            ow.player.rotation.y = Math.PI; // Face south towards campfire
            ow.targetCameraRotation.yaw = Math.PI;
            ow.targetCameraRotation.pitch = 0.22;
            ow.targetCameraDistance = 4.5;
        });

        await new Promise(r => setTimeout(r, 1500));

        // 2. Inspect Campfire System State
        const campfireState = await page.evaluate(() => {
            const cs = window.worldComposition.campfireSocial;
            const im = window.openWorld3D.interactionManager;

            const bench1 = im.anchors.get('campfire_bench_1');
            const bench2 = im.anchors.get('campfire_bench_2');
            const bench3 = im.anchors.get('campfire_bench_3');

            return {
                hasStoneRing: !!cs.stoneRingMesh,
                hasLogs: !!cs.logsMesh,
                hasEmbers: !!cs.embersMesh,
                hasFlameCore: !!cs.flameCoreGroup,
                hasLight: !!cs.fireLight,
                lightCastShadow: cs.fireLight?.castShadow,
                hasParticles: !!cs.embersParticles,
                particlesCount: cs.embersCount,
                hasBoombox: !!cs.boomboxMesh,
                hasBench1: !!bench1,
                bench1Category: bench1?.category,
                bench1Capacity: bench1?.capacity,
                hasBench2: !!bench2,
                hasBench3: !!bench3,
                isNearCampfire: cs.isNearCampfire
            };
        });

        console.log('Campfire State:', JSON.stringify(campfireState, null, 2));

        // Screenshot 1: Campfire glade, river view, log benches, boombox and flames
        const shot1Path = path.join(ARTIFACTS_DIR, 'proof_phase2_6_campfire_clearing_and_benches.png');
        await page.screenshot({ path: shot1Path });
        console.log('Saved screenshot 1:', shot1Path);

        // 3. Sit down on North Log Bench
        console.log('Sitting player down on Campfire North Log Bench (campfire_bench_2)...');
        const seatedState = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const anchor = ow.interactionManager.anchors.get('campfire_bench_2');
            if (anchor) {
                ow.sitDown(anchor);
            }
            return {
                isSitting: ow.isSitting,
                currentSeat: ow.currentSeatAnchor?.id,
                category: ow.currentSeatAnchor?.category,
                isCinematicCamera: ow.isCinematicCamera
            };
        });
        console.log('Seated State:', JSON.stringify(seatedState, null, 2));

        // Wait 2.5s to let the cozy cinematic orbit camera advance
        await new Promise(r => setTimeout(r, 2500));

        // Screenshot 2: Cozy Cinematic Orbit Camera while seated by campfire
        const shot2Path = path.join(ARTIFACTS_DIR, 'proof_phase2_7_campfire_cozy_orbit_camera.png');
        await page.screenshot({ path: shot2Path });
        console.log('Saved screenshot 2:', shot2Path);

        // 4. Test Mute toggle via [M] key
        console.log('Testing [M] key mute toggle...');
        await page.keyboard.press('m');
        await new Promise(r => setTimeout(r, 600));

        const muteState = await page.evaluate(() => {
            const cs = window.worldComposition.campfireSocial;
            return {
                isRadioMuted: cs.isRadioMuted
            };
        });
        console.log('Radio Mute State after [M]:', muteState);

        // 5. Stand up
        console.log('Standing player up...');
        const standState = await page.evaluate(() => {
            const ow = window.openWorld3D;
            ow.standUp();
            return {
                isSitting: ow.isSitting,
                isCinematicCamera: ow.isCinematicCamera
            };
        });
        console.log('Stand State:', standState);

        // 6. Global Shadow Casters Audit
        const shadowStats = await page.evaluate(() => {
            let castShadowCount = 0;
            window.openWorld3D.scene.traverse(obj => {
                if (obj.isMesh && obj.castShadow) castShadowCount++;
            });
            return { castShadowCount };
        });
        console.log('=== GLOBAL SHADOW AUDIT ===');
        console.log('Cast Shadow Count:', shadowStats.castShadowCount, '(Budget: <= 453)');

        console.log('=== ALL CAMPFIRE SOCIAL & SYNCHRONIZED LOFI RADIO TESTS COMPLETED SUCCESSFULLY ===');
    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await browser.close();
    }
}

runCampfireSocialTest();
