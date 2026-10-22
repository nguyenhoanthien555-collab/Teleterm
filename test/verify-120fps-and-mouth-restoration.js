const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function verify() {
    console.log('=== LAUNCHING PUPPETEER 120 FPS & MOUTH RESTORATION VERIFICATION ===');
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

        // 1. VERIFY MOUTH ANATOMICAL RESTORATION
        console.log('Checking Mouth Anatomical Morph Targets...');
        const mouthStatus = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const retargeter = ow.retargeter || ow.player?.userData?.retargeter;
            const faceRig = retargeter?.faceRig || ow.avatarFaceRig;
            if (!faceRig) return { error: 'faceRig not found' };

            // Find face mesh morph target values
            let morphCloseVal = null;
            let morphFunVal = null;
            let morphJoyVal = null;

            if (faceRig.faceMeshes && faceRig.faceMeshes.length > 0) {
                const mesh = faceRig.faceMeshes[0];
                const dict = mesh.morphTargetDictionary || {};
                const inf = mesh.morphTargetInfluences || [];
                if (dict['Fcl_MTH_Close'] !== undefined) morphCloseVal = inf[dict['Fcl_MTH_Close']];
                if (dict['Fcl_MTH_Fun'] !== undefined) morphFunVal = inf[dict['Fcl_MTH_Fun']];
                if (dict['Fcl_MTH_Joy'] !== undefined) morphJoyVal = inf[dict['Fcl_MTH_Joy']];
            }

            return {
                currentMthClose: faceRig.currentMthClose,
                currentMthFun: faceRig.currentMthFun,
                morphCloseVal,
                morphFunVal,
                morphJoyVal
            };
        });

        console.log('Mouth Morph Status:', JSON.stringify(mouthStatus, null, 2));

        // Position camera directly in front of the avatar's face for front closeup
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            const THREE = window.THREE;
            ow.isCinematicCamera = true;
            const retargeter = ow.retargeter || ow.player?.userData?.retargeter;
            const head = retargeter?.mappedBones?.Head;
            const headPos = new THREE.Vector3();
            if (head) {
                head.getWorldPosition(headPos);
            } else {
                headPos.copy(ow.player.position).add(new THREE.Vector3(0, 1.48, 0));
            }

            // 32cm directly in front of face at eye/mouth height
            ow.camera.position.set(headPos.x, headPos.y - 0.04, headPos.z + 0.32);
            ow.camera.lookAt(headPos.x, headPos.y - 0.04, headPos.z);
        });
        await new Promise(r => setTimeout(r, 600));

        const proofMouth1 = path.join(ARTIFACT_DIR, 'proof_mouth_restored_1_front_closeup.png');
        await page.screenshot({ path: proofMouth1 });
        console.log('Saved Proof 1:', proofMouth1);

        // Position camera for 3/4 angle closeup
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            const THREE = window.THREE;
            const retargeter = ow.retargeter || ow.player?.userData?.retargeter;
            const head = retargeter?.mappedBones?.Head;
            const headPos = new THREE.Vector3();
            if (head) {
                head.getWorldPosition(headPos);
            } else {
                headPos.copy(ow.player.position).add(new THREE.Vector3(0, 1.48, 0));
            }

            // 3/4 angle perspective
            ow.camera.position.set(headPos.x + 0.22, headPos.y - 0.04, headPos.z + 0.28);
            ow.camera.lookAt(headPos.x, headPos.y - 0.04, headPos.z);
        });
        await new Promise(r => setTimeout(r, 600));

        const proofMouth2 = path.join(ARTIFACT_DIR, 'proof_mouth_restored_2_three_quarter.png');
        await page.screenshot({ path: proofMouth2 });
        console.log('Saved Proof 2:', proofMouth2);

        // 2. VERIFY 120 FPS OPTIMIZATION METRICS
        console.log('Benchmarking 120 FPS metrics & scene telemetry...');
        // Reset camera to standard orbit view
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = false;
            const p = ow.player.position;
            ow.camera.position.set(p.x + 2.5, p.y + 3.2, p.z + 6.0);
            ow.camera.lookAt(p.x, p.y + 1.2, p.z);
            if (ow.performanceManager) {
                ow.performanceManager.frameTimeHistory.fill(16.6);
                ow.performanceManager.historyIndex = 0;
                ow.performanceManager.totalSamples = 0;
            }
        });

        // Let 80 frames render
        await new Promise(r => setTimeout(r, 3500));

        const engineMetrics = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const r = ow.renderer;
            const pm = ow.performanceManager;
            const pp = ow.postProcessing;

            let meshCount = 0;
            let castShadowCount = 0;
            let receiveShadowCount = 0;
            let matrixAutoUpdateCount = 0;
            const shadowCastersByType = {};
            const matrixAutoUpdateByType = {};

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
                    if (obj.matrixAutoUpdate) {
                        matrixAutoUpdateCount++;
                        matrixAutoUpdateByType[label] = (matrixAutoUpdateByType[label] || 0) + 1;
                    }
                }
            });

            return {
                meshCount,
                castShadowCount,
                receiveShadowCount,
                matrixAutoUpdateCount,
                shadowCastersByType,
                matrixAutoUpdateByType,
                currentDpr: pm ? pm.currentDpr : null,
                targetDpr: pm ? pm.targetDpr : null,
                fps: pm ? pm.fps : null,
                avgFps: pm ? pm.avgFps : null,
                frameTimeMs: pm ? pm.frameTimeMs : null,
                bloomSize: pp?.bloomPass ? {
                    width: pp.bloomPass.resolution.x,
                    height: pp.bloomPass.resolution.y
                } : null
            };
        });

        console.log('Engine Optimization Metrics:', JSON.stringify(engineMetrics, null, 2));

        const proofWide = path.join(ARTIFACT_DIR, 'proof_120fps_wide_world_beauty.png');
        await page.screenshot({ path: proofWide });
        console.log('Saved Proof 3 (Wide Scene Beauty):', proofWide);

        // Verification assertions
        const assertions = {
            mouthRestored: mouthStatus.currentMthClose <= 0.05 && mouthStatus.currentMthFun <= 0.05,
            shadowCastersPruned: engineMetrics.castShadowCount <= 120, // Down from 448
            matrixUpdatesFrozen: engineMetrics.matrixAutoUpdateCount <= 260, // All world static props frozen
            nativeDprCalibrated: engineMetrics.currentDpr === 1.0,
            halfResBloomActive: !!engineMetrics.bloomSize && engineMetrics.bloomSize.width <= 640
        };

        console.log('=== VERIFICATION ASSERTIONS ===');
        console.log(JSON.stringify(assertions, null, 2));

        // Save detailed results to json
        fs.writeFileSync(
            path.join(ARTIFACT_DIR, 'optimization_120fps_verification_results.json'),
            JSON.stringify({ mouthStatus, engineMetrics, assertions }, null, 2)
        );

    } catch (err) {
        console.error('Verification failed with error:', err);
    } finally {
        await browser.close();
    }
}

verify();
