const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\69476637-5058-4b38-81f6-926c8792527c';

(async () => {
    console.log('🚀 Running forensic validation for Sitting Fixes & Illogical Game Details...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    // Use mobile portrait resolution like user phone (1080 x 2400 scaled)
    await page.setViewport({ width: 450, height: 950 });

    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 25000 });
    console.log('✨ 3D World loaded in mobile view.');

    // Wait 2.5s for initial NPC positioning and schedule start
    await new Promise(r => setTimeout(r, 2500));

    // TEST 1: Inspect Lumina sitting at Hub Coding Desk #1
    const test1Report = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const luminaAgent = ow.npcLifeSystem.agents.find(a => a.def.id === 'lumina');
        const ret = luminaAgent.retargeter;

        // Position camera to view Lumina seated in profile
        ow.camera.position.set(4.4, 1.25, 0.05);
        ow.camera.lookAt(6.2, 0.95, 0.05);

        const getPos = (obj) => {
            const v = ow.player.position.clone();
            obj.getWorldPosition(v);
            return { x: Number(v.x.toFixed(3)), y: Number(v.y.toFixed(3)), z: Number(v.z.toFixed(3)) };
        };

        return {
            luminaGroupPos: { x: luminaAgent.group.position.x, y: luminaAgent.group.position.y, z: luminaAgent.group.position.z },
            luminaAnim: ret.getAnimation(),
            hips: getPos(ret.mappedBones.Hips),
            leftKnee: getPos(ret.mappedBones.LeftLowerLeg),
            leftFoot: getPos(ret.mappedBones.LeftFoot),
            rightKnee: getPos(ret.mappedBones.RightLowerLeg),
            rightFoot: getPos(ret.mappedBones.RightFoot)
        };
    });

    console.log('Lumina Seated Report:', JSON.stringify(test1Report, null, 2));

    // Let camera update and take screenshot of Lumina seated
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        // Temporarily override camera follow
        ow.updateCamera = () => {
            ow.camera.position.set(4.5, 1.15, -0.15);
            ow.camera.lookAt(6.2, 0.85, -0.15);
        };
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_lumina_seated_properly.png') });
    console.log('📸 Saved verify_lumina_seated_properly.png');

    // TEST 2: Player sitting at Hot Desk #3 in profile view (exact replica of user Image 2)
    const test2Report = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const im = ow.interactionManager;
        const desk3 = im.getAnchor('hub_desk_chair_3');

        ow.sitDown(desk3);

        const ret = ow.retargeter;
        const getPos = (obj) => {
            const v = ow.player.position.clone();
            obj.getWorldPosition(v);
            return { x: Number(v.x.toFixed(3)), y: Number(v.y.toFixed(3)), z: Number(v.z.toFixed(3)) };
        };

        // Position camera to profile view of desk #3 (looking from +X towards player sitting)
        ow.updateCamera = () => {
            ow.camera.position.set(6.6, 1.15, -1.16);
            ow.camera.lookAt(5.01, 0.85, -1.16);
        };

        return {
            isSitting: ow.isSitting,
            playerGroupPos: { x: ow.player.position.x, y: ow.player.position.y, z: ow.player.position.z },
            hips: getPos(ret.mappedBones.Hips),
            leftKnee: getPos(ret.mappedBones.LeftLowerLeg),
            leftFoot: getPos(ret.mappedBones.LeftFoot)
        };
    });

    console.log('Player Seated Report (Desk #3):', JSON.stringify(test2Report, null, 2));
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_player_seated_profile.png') });
    console.log('📸 Saved verify_player_seated_profile.png');

    // TEST 3: Focus Mode (Terminal/Chat Open) - Verify NO badges or prompt floating over
    await page.evaluate(() => {
        document.body.classList.add('mode-focus');
        document.body.classList.remove('mode-explore');
        const term = document.getElementById('deck-terminal-screen');
        if (term) {
            term.style.display = 'block';
            term.style.visibility = 'visible';
            term.style.opacity = '1';
        }
        window.openWorld3D.overheadUi.update();
    });
    await new Promise(r => setTimeout(r, 600));

    const modalTest = await page.evaluate(() => {
        const badgesContainer = document.getElementById('world-overhead-badges-container');
        const prompt = document.getElementById('world-interact-prompt');
        return {
            badgesDisplay: badgesContainer ? getComputedStyle(badgesContainer).display : null,
            badgesOpacity: badgesContainer ? getComputedStyle(badgesContainer).opacity : null,
            promptDisplay: prompt ? getComputedStyle(prompt).display : null
        };
    });
    console.log('Modal Overlap Test (Focus Mode):', modalTest);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_focus_mode_clean_overlay.png') });
    console.log('📸 Saved verify_focus_mode_clean_overlay.png');

    // TEST 4: Return to explore mode and verify badge anti-overlap and walking text
    await page.evaluate(() => {
        document.body.classList.remove('mode-focus');
        document.body.classList.add('mode-explore');
        const term = document.getElementById('deck-terminal-screen');
        if (term) {
            term.style.display = 'none';
        }
        const ow = window.openWorld3D;
        ow.standUp();
        ow.player.position.set(2.8, ow.getTerrainHeight(2.8, 4.2), 4.2);
        // Restore standard camera follow
        ow.updateCamera = window.openWorld3D.constructor.prototype.updateCamera;
        ow.targetCameraRotation.yaw = -0.18;
        ow.targetCameraRotation.pitch = 0.08;
        ow.cameraRotation.yaw = -0.18;
        ow.cameraRotation.pitch = 0.08;
        ow.cameraDistance = 4.0;
        ow.overheadUi.update();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verify_explore_mode_mobile_badges.png') });
    console.log('📸 Saved verify_explore_mode_mobile_badges.png');

    await browser.close();
    console.log('🎉 Forensic validation completed successfully!');
})();
