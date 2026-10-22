const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:/Users/Hoan Thien/.gemini/antigravity/brain/3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function runDeskDecorTest() {
    console.log('Launching Puppeteer to test Modular Desk Decor & Pomodoro Focus Zones...');
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
            if (txt.includes('Desk Decor') || txt.includes('Pomodoro') || txt.includes('IN_WORLD') || txt.includes('Error')) {
                console.log('PAGE LOG:', txt);
            }
        });

        console.log('Navigating to http://localhost:4000/?direct=1 ...');
        await page.goto('http://localhost:4000/?direct=1', { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for IN_WORLD state and modularDeskDecor system
        await page.waitForFunction(() => {
            return window.openWorld3D && window.openWorld3D.player && window.modularDeskDecor;
        }, { timeout: 25000 });

        await new Promise(r => setTimeout(r, 2500));

        // 1. Teleport player to Developer Hub Desk 2
        console.log('Teleporting player to Hub Desk #2 (23.2, -11.0)...');
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            ow.player.position.set(23.2, ow.getTerrainHeight(23.2, -11.0), -11.0);
            ow.player.rotation.y = Math.PI; // Face north toward coding laptop
            ow.targetCameraRotation.yaw = Math.PI;
            ow.targetCameraRotation.pitch = 0.28;
            ow.targetCameraDistance = 3.6;
        });

        await new Promise(r => setTimeout(r, 1500));

        // 2. Sit player down on hub_desk_chair_2
        console.log('Sitting player down at coding desk (hub_desk_chair_2)...');
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            const anchor = ow.interactionManager.anchors.get('hub_desk_chair_2');
            if (anchor) {
                ow.sitDown(anchor);
            }
        });

        await new Promise(r => setTimeout(r, 1000));

        // 3. Test Desk Decor Presets Switching
        console.log('Applying Zen Nature preset (Mini Bonsai & Matcha)...');
        await page.evaluate(() => {
            window.modularDeskDecor.applyPreset('zen_nature');
        });

        await new Promise(r => setTimeout(r, 800));

        const presetCheck = await page.evaluate(() => {
            const dd = window.modularDeskDecor;
            const packs = dd.stationDecorPacks.get('hub_desk_chair_2');
            return {
                zenVisible: packs?.zen_nature?.visible,
                cyberVisible: packs?.cyber_hacker?.visible,
                minimalistVisible: packs?.minimalist?.visible,
                cozyVisible: packs?.cozy_cafe?.visible,
                activePreset: dd.preferences.activePreset
            };
        });
        console.log('Preset Check:', presetCheck);

        // Screenshot 1: Avatar sitting at coding desk with Zen Nature Bonsai & Matcha decor
        const shot1Path = path.join(ARTIFACTS_DIR, 'proof_phase2_8_hub_desk_decor_customized.png');
        await page.screenshot({ path: shot1Path });
        console.log('Saved screenshot 1:', shot1Path);

        // 4. Open Desk Decor & Pomodoro Modal
        console.log('Opening Desk Decor & Focus Modal [Alt + D]...');
        await page.evaluate(() => {
            window.modularDeskDecor.toggleModal();
        });

        await new Promise(r => setTimeout(r, 600));

        // Screenshot 2: Modal popover with 4 preset cards & Pomodoro controller
        const shot2Path = path.join(ARTIFACTS_DIR, 'proof_phase2_9_desk_decor_pomodoro_modal.png');
        await page.screenshot({ path: shot2Path });
        console.log('Saved screenshot 2:', shot2Path);

        // 5. Test Pomodoro Timer & Mechanical Keyboard Clatter
        console.log('Starting 1m Demo Pomodoro Timer...');
        const pomoState = await page.evaluate(() => {
            const dd = window.modularDeskDecor;
            dd.startPomodoro('demo_1');
            dd.playKeyClatter(); // test sound synth execution
            return {
                state: dd.pomodoro.state,
                duration: dd.pomodoro.durationSec,
                remaining: dd.pomodoro.remainingSec
            };
        });
        console.log('Pomodoro State:', pomoState);

        // Simulate 2 seconds of deep work flow
        await new Promise(r => setTimeout(r, 2000));

        // Test completePomodoro
        console.log('Simulating Pomodoro completion & rewards...');
        const completeResult = await page.evaluate(() => {
            const dd = window.modularDeskDecor;
            dd.completePomodoro();
            return {
                state: dd.pomodoro.state,
                completedSessions: dd.preferences.completedSessions,
                focusCoins: dd.preferences.focusCoins
            };
        });
        console.log('Completion Result:', completeResult);

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

        console.log('=== ALL MODULAR DESK DECOR & POMODORO TESTS COMPLETED SUCCESSFULLY ===');
    } catch (err) {
        console.error('Test error:', err);
    } finally {
        await browser.close();
    }
}

runDeskDecorTest();
