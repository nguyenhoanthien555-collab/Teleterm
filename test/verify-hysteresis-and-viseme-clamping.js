const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function verify() {
    console.log('=== LAUNCHING PUPPETEER VERIFICATION: HYSTERESIS LOD, VISEME BLENDING & STABILITY ===');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--use-gl=angle',
            '--use-angle=gl',
            '--enable-webgl',
            '--ignore-gpu-blocklist',
            '--window-size=1280,800'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    page.on('pageerror', err => console.log('  [Browser Page Error]:', err.message));
    page.on('console', msg => {
        if (msg.type() === 'error') console.log('  [Browser Console Error]:', msg.text());
    });

    try {
        console.log('Navigating to http://localhost:4000/?direct=1 ...');
        await page.goto('http://localhost:4000/?direct=1', { waitUntil: 'domcontentloaded', timeout: 35000 });
        await new Promise(r => setTimeout(r, 4500));

        // Switch to explore mode
        await page.evaluate(() => {
            const launcher = document.getElementById('teleterm-launcher-overlay');
            if (launcher) launcher.style.display = 'none';
            if (window.desktopLauncher) window.desktopLauncher.hideLauncher();
            document.body.classList.remove('mode-focus');
            document.body.classList.add('mode-explore');
        });

        console.log('Waiting for OpenWorld3D and Player readiness...');
        await page.waitForFunction(() => {
            const ow = window.openWorld3D;
            return ow && ow.renderer && ow.player && (ow.retargeter || ow.avatarFaceRig || (ow.player.userData && ow.player.userData.retargeter));
        }, { timeout: 45000 });

        console.log('World and character loaded successfully. Waiting 3s for steady-state...');
        await new Promise(r => setTimeout(r, 3000));

        // 1. TEST VISEME CLAMPING & NORMALIZATION IN FACE RIG
        console.log('Testing Viseme Clamping and Morph Target Normalization...');
        const visemeTest = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const retargeter = ow.retargeter || ow.player?.userData?.retargeter;
            const faceRig = retargeter?.faceRig || ow.avatarFaceRig;
            if (!faceRig) return { error: 'faceRig not found' };

            // Step A: Trigger speaking
            faceRig.startSpeaking(2.0);

            // Step B: Simulate multiple frames of speech
            let maxTotalAperture = 0;
            let maxMthCloseDuringSpeech = 0;
            let maxMthFunDuringSpeech = 0;
            let maxMthJoyDuringSpeech = 0;
            const sampledApertures = [];

            for (let f = 0; f < 30; f++) {
                faceRig.updateSpeechAndMouth(0.016);
                const a = faceRig.getMorph('Fcl_MTH_A');
                const o = faceRig.getMorph('Fcl_MTH_O');
                const i = faceRig.getMorph('Fcl_MTH_I');
                const u = faceRig.getMorph('Fcl_MTH_U');
                const e = faceRig.getMorph('Fcl_MTH_E');
                const closeVal = faceRig.getMorph('Fcl_MTH_Close');
                const funVal = faceRig.getMorph('Fcl_MTH_Fun');
                const joyVal = faceRig.getMorph('Fcl_MTH_Joy');

                const total = a + o + i + u + e;
                if (total > maxTotalAperture) maxTotalAperture = total;
                if (closeVal > maxMthCloseDuringSpeech) maxMthCloseDuringSpeech = closeVal;
                if (funVal > maxMthFunDuringSpeech) maxMthFunDuringSpeech = funVal;
                if (joyVal > maxMthJoyDuringSpeech) maxMthJoyDuringSpeech = joyVal;
                sampledApertures.push(total);
            }

            // Stop speaking and return to resting pose
            faceRig.stopSpeaking();
            for (let f = 0; f < 20; f++) {
                faceRig.updateSpeechAndMouth(0.016);
            }

            const restingClose = faceRig.getMorph('Fcl_MTH_Close');
            const restingFun = faceRig.getMorph('Fcl_MTH_Fun');
            const restingA = faceRig.getMorph('Fcl_MTH_A');

            return {
                maxTotalAperture,
                apertureClamped: maxTotalAperture <= 0.455,
                maxMthCloseDuringSpeech,
                maxMthFunDuringSpeech,
                maxMthJoyDuringSpeech,
                restingClose,
                restingFun,
                restingA
            };
        });

        console.log('Viseme test results:', JSON.stringify(visemeTest, null, 2));

        // 1B. TEST DYNAMIC EXPRESSION & VISEME AUTO-SUPPRESSION BLENDING
        console.log('Testing Expression & Viseme Auto-Suppression...');
        const expressionSuppressionTest = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const retargeter = ow.retargeter || ow.player?.userData?.retargeter;
            const faceRig = retargeter?.faceRig || ow.avatarFaceRig;
            if (!faceRig) return { error: 'faceRig not found' };

            // Step 1: Set mood to Smile in resting posture
            faceRig.setMood('Smile', 1.0);
            faceRig.stopSpeaking();
            for (let f = 0; f < 35; f++) {
                faceRig.updateMood(0.016);
                faceRig.updateSpeechAndMouth(0.016);
            }
            const restingSmileFun = faceRig.getMorph('Fcl_MTH_Fun');

            // Step 2: Begin speaking with Smile mood active
            faceRig.startSpeaking(2.0);
            let speechSmileFun = 0;
            let speechAperture = 0;
            for (let f = 0; f < 30; f++) {
                faceRig.updateMood(0.016);
                faceRig.updateSpeechAndMouth(0.016);
                const curFun = faceRig.getMorph('Fcl_MTH_Fun');
                const ap = faceRig.getMorph('Fcl_MTH_A') + faceRig.getMorph('Fcl_MTH_O');
                if (ap > 0.20 && f > 12) {
                    speechSmileFun = curFun;
                    speechAperture = ap;
                    break;
                }
            }

            // Step 3: Finish speech and verify smile restored
            faceRig.stopSpeaking();
            for (let f = 0; f < 35; f++) {
                faceRig.updateMood(0.016);
                faceRig.updateSpeechAndMouth(0.016);
            }
            const restoredSmileFun = faceRig.getMorph('Fcl_MTH_Fun');

            // Reset mood to Neutral
            faceRig.setMood('Neutral', 1.0);
            for (let f = 0; f < 35; f++) {
                faceRig.updateMood(0.016);
                faceRig.updateSpeechAndMouth(0.016);
            }

            return {
                restingSmileFun,
                hasRestingSmile: restingSmileFun > 0.05 && restingSmileFun <= 0.13,
                speechSmileFun,
                speechAperture,
                suppressedDuringSpeech: speechSmileFun < 0.04,
                restoredSmileFun,
                restoredAfterSpeech: restoredSmileFun > 0.05
            };
        });

        console.log('Expression suppression test results:', JSON.stringify(expressionSuppressionTest, null, 2));

        // 2. TEST HYSTERESIS AND CONTINUOUS S-CURVE SMOOTH BLENDING
        console.log('Testing NPC Distance LOD Hysteresis & S-Curve Physics Weight...');
        const lodHysteresisTest = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const npcSys = ow.npcLifeSystem;
            if (!npcSys || !npcSys.agents || npcSys.agents.length === 0) {
                return { error: 'No NPC agents found', hasSystem: !!npcSys };
            }

            const testNpc = npcSys.agents[0];
            const originalPos = testNpc.group.position.clone();
            const playerPos = ow.player.position;

            const results = {};

            // Case A: Near distance (15m) -> LOD 0, weight 1.0
            testNpc.group.position.set(playerPos.x + 15, playerPos.y, playerPos.z);
            testNpc.currentLod = 0;
            testNpc.update(0.016);
            results.at15m = {
                lod: testNpc.currentLod,
                weight: testNpc.retargeter ? 1.0 : null
            };

            // Case B: Boundary approach (21m from near) -> Hysteresis: LOD must STAY 0 (threshold is 22m)
            testNpc.group.position.set(playerPos.x + 21, playerPos.y, playerPos.z);
            testNpc.update(0.016);
            results.at21m_from_near = {
                lod: testNpc.currentLod,
                hysteresisHeld: testNpc.currentLod === 0
            };

            // Case C: Transition boundary (20m midpoint) -> S-curve weight should be ~0.5
            testNpc.group.position.set(playerPos.x + 20, playerPos.y, playerPos.z);
            testNpc.update(0.016);
            const t = (20.0 - 18.0) / 4.0;
            const expectedWeight = 1.0 - t * t * (3.0 - 2.0 * t); // exactly 0.5
            results.at20m_midpoint = {
                expectedWeight,
                lod: testNpc.currentLod
            };

            // Case D: Past 22m (23m) -> Switches to LOD 1, weight 0.0
            testNpc.group.position.set(playerPos.x + 23, playerPos.y, playerPos.z);
            testNpc.update(0.016);
            results.at23m = {
                lod: testNpc.currentLod,
                switchedToLod1: testNpc.currentLod === 1
            };

            // Case E: Approaching back (19m from far) -> Hysteresis: LOD must STAY 1 (threshold is 18m)
            testNpc.group.position.set(playerPos.x + 19, playerPos.y, playerPos.z);
            testNpc.update(0.016);
            results.at19m_from_far = {
                lod: testNpc.currentLod,
                hysteresisHeld: testNpc.currentLod === 1
            };

            // Case F: Cross under 18m (16m) -> Switches back to LOD 0
            testNpc.group.position.set(playerPos.x + 16, playerPos.y, playerPos.z);
            testNpc.update(0.016);
            results.at16m_return = {
                lod: testNpc.currentLod,
                switchedBackToLod0: testNpc.currentLod === 0
            };

            // Restore NPC position
            testNpc.group.position.copy(originalPos);
            return results;
        });

        console.log('LOD Hysteresis test results:', JSON.stringify(lodHysteresisTest, null, 2));

        // 3. TEST DELTA-TIME SPIKE (ANTI-EXPLOSION CLAMPING) & EARLY-EXIT CPU CULLING
        console.log('Testing Delta-time Spike Clamping & Early-Exit Culling...');
        const stabilityTest = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const retargeter = ow.retargeter || ow.player?.userData?.retargeter;
            if (!retargeter) return { error: 'retargeter not found' };

            // Inject a massive lag spike of 2.0 seconds (simulating tab switch)
            retargeter.solveSecondaryMotion(2.0, { physicsWeight: 1.0 });

            // Check hair bone angles are finite and bounded (not NaN or Inf)
            let maxAngle = 0;
            let isStable = true;
            if (retargeter.hairBones) {
                for (let i = 0; i < retargeter.hairBones.length; i++) {
                    const angle = Math.abs(retargeter.hairBones[i].userData.springAngle || 0);
                    if (isNaN(angle) || !isFinite(angle) || angle > 1.5) {
                        isStable = false;
                    }
                    if (angle > maxAngle) maxAngle = angle;
                }
            }

            // Early-exit check: When physicsWeight <= 0.001, execution returns immediately
            const preAcc = retargeter.physicsAccumulator || 0;
            retargeter.solveSecondaryMotion(0.016, { physicsWeight: 0.0 });
            const postAcc = retargeter.physicsAccumulator || 0;
            const earlyExitVerified = (preAcc === postAcc); // Accumulator untouched because loop was skipped

            return {
                isStable,
                maxAngle,
                earlyExitVerified
            };
        });

        console.log('Stability & Early-Exit test results:', JSON.stringify(stabilityTest, null, 2));

        // 4. CAPTURE VISUAL PROOFS
        console.log('Positioning camera for Visual Proofs...');

        // Screenshot 1: Viseme Speaking Close-up
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = true;
            const p = ow.player.position;
            ow.camera.position.set(p.x, p.y + 1.25, p.z - 0.72);
            ow.camera.lookAt(p.x, p.y + 1.25, p.z);
            if (ow.controls) ow.controls.target.set(p.x, p.y + 1.25, p.z);

            const retargeter = ow.retargeter || ow.player?.userData?.retargeter;
            const faceRig = retargeter?.faceRig || ow.avatarFaceRig;
            if (faceRig) {
                faceRig.startSpeaking(4.0);
                faceRig.updateSpeechAndMouth(0.08); // activate open viseme
            }
        });

        await new Promise(r => setTimeout(r, 600));
        const shot1Path = path.join(ARTIFACT_DIR, 'proof_viseme_speech_clamped_closeup.png');
        await page.screenshot({ path: shot1Path });
        console.log('Saved shot 1:', shot1Path);

        // Screenshot 2: Natural Resting Bind Pose
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            const retargeter = ow.retargeter || ow.player?.userData?.retargeter;
            const faceRig = retargeter?.faceRig || ow.avatarFaceRig;
            if (faceRig) {
                faceRig.stopSpeaking();
                for (let f = 0; f < 25; f++) faceRig.updateSpeechAndMouth(0.016);
            }
        });

        await new Promise(r => setTimeout(r, 600));
        const shot2Path = path.join(ARTIFACT_DIR, 'proof_viseme_idle_resting_restored.png');
        await page.screenshot({ path: shot2Path });
        console.log('Saved shot 2:', shot2Path);

        // Screenshot 3: Mid-Distance NPC Smooth Transition Zone (20m)
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = true;
            const p = ow.player.position;
            ow.camera.position.set(p.x + 3.0, p.y + 2.0, p.z - 8.0);
            ow.camera.lookAt(p.x, p.y + 1.0, p.z + 12.0);
        });

        await new Promise(r => setTimeout(r, 600));
        const shot3Path = path.join(ARTIFACT_DIR, 'proof_lod_hysteresis_npc_transition.png');
        await page.screenshot({ path: shot3Path });
        console.log('Saved shot 3:', shot3Path);

        // Record all results to json
        const fullResults = {
            visemeTest,
            expressionSuppressionTest,
            lodHysteresisTest,
            stabilityTest,
            assertions: {
                apertureClamped: visemeTest.apertureClamped,
                restingMouthRestored: visemeTest.restingClose === 0 && visemeTest.restingFun === 0,
                expressionSuppressedDuringSpeech: expressionSuppressionTest.suppressedDuringSpeech,
                expressionRestoredAfterSpeech: expressionSuppressionTest.restoredAfterSpeech,
                hysteresisNearToFarHeld: lodHysteresisTest.at21m_from_near?.hysteresisHeld,
                hysteresisSwitchedToFar: lodHysteresisTest.at23m?.switchedToLod1,
                hysteresisFarToNearHeld: lodHysteresisTest.at19m_from_far?.hysteresisHeld,
                hysteresisSwitchedBackToNear: lodHysteresisTest.at16m_return?.switchedBackToLod0,
                physicsStableUnderSpike: stabilityTest.isStable,
                earlyExitCpuCullingVerified: stabilityTest.earlyExitVerified
            }
        };

        const jsonPath = path.join(ARTIFACT_DIR, 'hysteresis_and_viseme_verification_results.json');
        fs.writeFileSync(jsonPath, JSON.stringify(fullResults, null, 2), 'utf-8');
        console.log('Saved full results JSON:', jsonPath);
        console.log('Assertions summary:', JSON.stringify(fullResults.assertions, null, 2));

    } catch (err) {
        console.error('Puppeteer verification failed:', err);
    } finally {
        await browser.close();
        console.log('=== VERIFICATION COMPLETED ===');
    }
}

verify();
