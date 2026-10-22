import puppeteer from 'puppeteer';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { authManager } = require('../src/server/auth/desktop-auth.js');

const BRAIN_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function captureWaterOceanProofs() {
    console.log('📸 Launching Puppeteer for 1080p Water & Coastal Ocean Overhaul Proofs...');
    
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
            const questTracker = document.getElementById('quest-tracker-hud');
            if (questTracker) questTracker.style.display = 'none';
        });

        // Wait for 3D world to initialize
        console.log('  Waiting for OpenWorld3D engine initialization...');
        await page.waitForFunction(() => {
            return window.openWorld3D && window.openWorld3D.worldComposition && window.worldContext;
        }, { timeout: 35000 });

        await new Promise(r => setTimeout(r, 3000));
        console.log('  ✨ 3D World fully ready for cinematic water capture.\n');

        // Helper function for positioning and snapping
        async function snapProof(shotName, setupFn, delayMs = 2000) {
            await page.evaluate(setupFn);
            await new Promise(r => setTimeout(r, delayMs));
            const outPath = path.join(BRAIN_DIR, shotName);
            await page.screenshot({ path: outPath, type: 'png' });
            console.log(`✓ Captured ${shotName} -> ${outPath}`);
        }

        // PROOF 1: Coastal Ocean Gerstner Swells & Shinkai Sun Specular from Pier looking South
        await snapProof('proof_water_1_coastal_ocean_gerstner_swells.png', () => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = true;
            // Out on the wooden pier (x: 10.5, z: 92.0) looking south across the rolling swells
            ow.camera.position.set(10.5, 2.6, 92.0);
            ow.camera.lookAt(10.5, 0.4, 160.0);
            if (ow.orbitControls) {
                ow.orbitControls.target.set(10.5, 0.4, 160.0);
                ow.orbitControls.update();
            }
            if (ow.player) {
                ow.player.position.set(10.5, 0.72, 97.0);
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = 0.0; // facing south towards the open ocean
                }
            }
        });

        // PROOF 2: Shoreline Contact Foam & Tide Margin (From dunes looking across surf)
        await snapProof('proof_water_2_shoreline_contact_foam_wash.png', () => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = true;
            ow.camera.position.set(24.0, 2.2, 75.0);
            ow.camera.lookAt(6.0, 0.0, 90.0);
            if (ow.orbitControls) {
                ow.orbitControls.target.set(6.0, 0.0, 90.0);
                ow.orbitControls.update();
            }
            if (ow.player) {
                ow.player.position.set(12.0, 0.15, 80.0);
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = -Math.PI * 0.4;
                }
            }
        });

        // PROOF 3: Meandering River Valley & Arched Timber Bridge
        await snapProof('proof_water_3_arched_bridge_meandering_river.png', () => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = true;
            ow.camera.position.set(-6.0, 3.2, 20.0);
            ow.camera.lookAt(14.0, 0.0, 30.0);
            if (ow.orbitControls) {
                ow.orbitControls.target.set(14.0, 0.0, 30.0);
                ow.orbitControls.update();
            }
            if (ow.player) {
                ow.player.position.set(4.0, 1.35, 27.5); // standing gracefully on the bridge
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = Math.PI * 0.35;
                }
            }
        });

        // PROOF 4: Mountain Stream Cascades flowing through the Maple Valley
        await snapProof('proof_water_4_mountain_stream_cascades.png', () => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = true;
            ow.camera.position.set(24.0, 4.5, -24.0);
            ow.camera.lookAt(33.0, 1.0, -32.0);
            if (ow.orbitControls) {
                ow.orbitControls.target.set(33.0, 1.0, -32.0);
                ow.orbitControls.update();
            }
            if (ow.player) {
                ow.player.position.set(30.0, 1.2, -26.0);
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = Math.PI * 0.6;
                }
            }
        });

        // PROOF 5: Terraced Rice Paddies & Sky Reflection
        await snapProof('proof_water_5_terraced_rice_paddy_reflections.png', () => {
            const ow = window.openWorld3D;
            ow.isCinematicCamera = true;
            ow.camera.position.set(-28.0, 4.8, -2.0);
            ow.camera.lookAt(-14.0, 0.2, -14.0);
            if (ow.orbitControls) {
                ow.orbitControls.target.set(-14.0, 0.2, -14.0);
                ow.orbitControls.update();
            }
            if (ow.player) {
                ow.player.position.set(-20.0, 0.85, -8.0);
                if (ow.playerMesh) {
                    ow.playerMesh.position.copy(ow.player.position);
                    ow.playerMesh.rotation.y = -Math.PI * 0.25;
                }
            }
        });

        console.log('\n🎉 ALL 5 1080P WATER & OCEAN PROOFS CAPTURED SUCCESSFULLY!');
    } catch (err) {
        console.error('❌ Error capturing water proofs:', err);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
}

captureWaterOceanProofs();
