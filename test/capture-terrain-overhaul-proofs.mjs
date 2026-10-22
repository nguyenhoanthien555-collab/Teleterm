import puppeteer from 'puppeteer';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { authManager } = require('../src/server/auth/desktop-auth.js');

const BRAIN_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function captureTerrainProofs() {
    console.log('📸 Launching Puppeteer for 1080p Terrain & Hydrology Overhaul Proofs...');
    
    // Create valid local session token for owner authentication
    const session = authManager.createSession('tt_usr_dev_player', 'local', 'dev_123', { displayName: 'DevArchitect' });
    console.log('  ✓ Authenticated local session token generated:', session.token.slice(0, 16) + '...');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--enable-webgl',
            '--use-gl=angle',
            '--use-angle=default'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1.0 });

    // Set authenticated cookie to prevent redirect to launcher.html?login=1
    await page.setCookie({
        name: 'teleterm_session',
        value: session.token,
        domain: 'localhost',
        path: '/'
    });

    try {
        console.log('  Navigating to http://localhost:4000/?direct=1 ...');
        await page.goto('http://localhost:4000/?direct=1', { waitUntil: 'domcontentloaded', timeout: 35000 });
        await new Promise(r => setTimeout(r, 2000));

        // Switch to Explore mode & clean UI
        await page.evaluate(() => {
            const term = document.getElementById('deck-terminal-screen');
            if (term) term.style.display = 'none';
            const launcher = document.getElementById('teleterm-launcher-overlay');
            if (launcher) {
                launcher.style.display = 'none';
                launcher.classList.add('hidden');
            }
            document.body.classList.remove('launcher-active');
            document.body.classList.add('mode-explore');
            document.body.classList.remove('mode-focus');
            if (window.__teleTermApp) window.__teleTermApp.setFocusMode(false);
            if (window.desktopLauncher) window.desktopLauncher.hideLauncher();
            const modal = document.getElementById('desktop-launcher-modal');
            if (modal) modal.style.display = 'none';
            const promptBox = document.getElementById('chat-prompt-box');
            if (promptBox) promptBox.style.display = 'none';
        });

        // Wait for 3D world to initialize
        console.log('  Waiting for OpenWorld3D engine initialization...');
        await page.waitForFunction(() => {
            return window.openWorld3D && window.openWorld3D.worldComposition && window.worldContext;
        }, { timeout: 35000 });

        await new Promise(r => setTimeout(r, 2500));
        console.log('  ✨ 3D World fully ready for cinematic capture.\n');

        // Helper function for positioning and snapping
        async function snapProof(shotName, setupFn, delayMs = 1500) {
            await page.evaluate(setupFn);
            await new Promise(r => setTimeout(r, delayMs));
            const outPath = path.join(BRAIN_DIR, shotName);
            await page.screenshot({ path: outPath, type: 'png' });
            console.log(`✓ Captured ${shotName} -> ${outPath}`);
        }

        // PROOF 1: Northern Alpine Summit Panorama looking South over the entire valley
        await snapProof('proof_terrain_1_alpine_summit_panorama.png', () => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = true;
            ow.camera.position.set(0.0, 16.5, -62.0);
            ow.camera.lookAt(0.0, 1.5, 5.0);
            if (ow.orbitControls) {
                ow.orbitControls.target.set(0.0, 1.5, 5.0);
                ow.orbitControls.update();
            }
            if (ow.player) {
                const py = ow.getTerrainHeight(0.0, -56.0);
                ow.player.position.set(0.0, py, -56.0);
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = 0.0;
                }
            }
        });

        // PROOF 2: Eastern Sakura Hillside overlooking the river valley and village
        await snapProof('proof_terrain_2_eastern_sakura_overlook.png', () => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = true;
            ow.camera.position.set(38.0, 7.8, -2.0);
            ow.camera.lookAt(2.0, 0.5, 12.0);
            if (ow.orbitControls) {
                ow.orbitControls.target.set(2.0, 0.5, 12.0);
                ow.orbitControls.update();
            }
            if (ow.player) {
                const py = ow.getTerrainHeight(28.0, 4.0);
                ow.player.position.set(28.0, py, 4.0);
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = -Math.PI * 0.6;
                }
            }
        });

        // PROOF 3: Mountain Stream Cascades flowing through the Maple Valley
        await snapProof('proof_terrain_3_maple_mountain_stream.png', () => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = true;
            ow.camera.position.set(22.0, 5.2, -22.0);
            ow.camera.lookAt(32.0, 1.2, -34.0);
            if (ow.orbitControls) {
                ow.orbitControls.target.set(32.0, 1.2, -34.0);
                ow.orbitControls.update();
            }
            if (ow.player) {
                const py = ow.getTerrainHeight(27.0, -25.0);
                ow.player.position.set(27.0, py, -25.0);
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = Math.PI * 0.5;
                }
            }
        });

        // PROOF 4: Grand Arched River Bridge with natural gravel banks and flowing water
        await snapProof('proof_terrain_4_arched_river_bridge.png', () => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = true;
            ow.camera.position.set(4.0, 2.8, 14.5);
            ow.camera.lookAt(4.0, 0.4, 28.0);
            if (ow.orbitControls) {
                ow.orbitControls.target.set(4.0, 0.4, 28.0);
                ow.orbitControls.update();
            }
            if (ow.player) {
                const py = ow.getTerrainHeight(4.0, 20.0);
                ow.player.position.set(4.0, py, 20.0);
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = 0.0;
                }
            }
        });

        // PROOF 5: Terraced Rice Paddies reflecting the sky with earthen dikes
        await snapProof('proof_terrain_5_terraced_rice_paddies.png', () => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = true;
            ow.camera.position.set(-16.0, 3.2, -2.0);
            ow.camera.lookAt(-26.0, 0.2, 10.0);
            if (ow.orbitControls) {
                ow.orbitControls.target.set(-26.0, 0.2, 10.0);
                ow.orbitControls.update();
            }
            if (ow.player) {
                const py = ow.getTerrainHeight(-19.0, 2.0);
                ow.player.position.set(-19.0, py, 2.0);
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = Math.PI * 0.7;
                }
            }
        });

        // PROOF 6: Southern Estuary & coastal beach shoreline
        await snapProof('proof_terrain_6_southern_coastal_estuary.png', () => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = true;
            ow.camera.position.set(12.5, 3.8, 52.0);
            ow.camera.lookAt(-4.0, 0.0, 68.0);
            if (ow.orbitControls) {
                ow.orbitControls.target.set(-4.0, 0.0, 68.0);
                ow.orbitControls.update();
            }
            if (ow.player) {
                const py = ow.getTerrainHeight(6.0, 56.0);
                ow.player.position.set(6.0, py, 56.0);
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = 0.0;
                }
            }
        });

        console.log('\n🎉 ALL 6 TERRAIN OVERHAUL 1080P PROOF SCREENSHOTS CAPTURED SUCCESSFULLY!');
    } catch (err) {
        console.error('❌ Error during capture:', err);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

captureTerrainProofs();
