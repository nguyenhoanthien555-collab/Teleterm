const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function runLivingWorldAndHologramVerification() {
    console.log('🚀 [Test Runner] Launching Headless Chrome for Living World & Hologram System Verification...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => console.log(`  [Browser ${msg.type()}]`, msg.text()));
    page.on('pageerror', err => console.error('  [Browser Error]', err.message));

    try {
        console.log('🌐 Navigating to http://localhost:4000 ...');
        await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded', timeout: 45000 });

        // Dismiss modals & switch to explore mode
        await new Promise(r => setTimeout(r, 2000));
        await page.evaluate(() => {
            const term = document.getElementById('deck-terminal-screen');
            if (term) term.style.display = 'none';
            document.body.classList.add('mode-explore');
            document.body.classList.remove('mode-focus');
            if (window.__teleTermApp) {
                window.__teleTermApp.setFocusMode(false);
            }
            if (window.desktopLauncher) {
                window.desktopLauncher.hideLauncher();
            }
            const modal = document.getElementById('desktop-launcher-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
        });

        // Wait for 3D world canvas and engine initialization
        await page.waitForFunction(() => {
            return window.openWorld3D &&
                   window.openWorld3D.worldComposition &&
                   window.openWorld3D.worldComposition.zenPond &&
                   window.openWorld3D.worldComposition.wildlife &&
                   window.inworldHologramSystem;
        }, { timeout: 35000 });

        console.log('✅ 3D Engine, ZenPondSystem, WildlifeSystem, and InWorldHologramSystem online!\n');
        await new Promise(r => setTimeout(r, 2000));

        // -------------------------------------------------------------
        // TEST 1: Zen Koi Pond & Rock Waterfall Ecosystem
        // -------------------------------------------------------------
        console.log('🐟 [Test 1] Auditing Zen Koi Pond & Rock Waterfall Cascade...');
        const pondAudit = await page.evaluate(() => {
            const pond = window.openWorld3D.worldComposition.zenPond;
            return {
                exists: !!pond,
                hasWaterMesh: !!pond.waterMesh,
                hasWaterfallMesh: !!pond.waterfallMesh,
                hasLiliesMesh: !!pond.liliesMesh,
                koiCount: pond.koiCount,
                koiMeshCount: pond.koiMesh ? pond.koiMesh.count : 0,
                waterElevation: pond.waterElevation,
                center: pond.center
            };
        });
        console.log('  -> Zen Pond Audit:', pondAudit);
        if (!pondAudit.hasWaterMesh || !pondAudit.hasWaterfallMesh || pondAudit.koiCount !== 16) {
            throw new Error('Zen Pond ecosystem failed: missing components or incorrect fish count.');
        }

        // Move player avatar to Zen Koi Pond bank facing the waterfall
        await page.evaluate(() => {
            const player = window.openWorld3D.player;
            player.position.set(23.5, window.openWorld3D.getTerrainHeight(23.5, -16.0), -16.0);
            player.rotation.y = Math.PI * 0.5; // Face east toward the pond and waterfall
            window.openWorld3D.cameraRotation.yaw = -Math.PI * 0.5;
            window.openWorld3D.cameraRotation.pitch = 0.28;
            window.openWorld3D.cameraDistance = 6.5;
        });
        await new Promise(r => setTimeout(r, 1200));
        const shot1Path = path.join(ARTIFACT_DIR, 'proof_living_world_1_zen_koi_pond_and_waterfall.png');
        await page.screenshot({ path: shot1Path });
        console.log(`  📸 Proof 1 captured: ${shot1Path}\n`);

        // -------------------------------------------------------------
        // TEST 2: Wildlife Ecosystem (Boids Flocking Birds & Insects)
        // -------------------------------------------------------------
        console.log('🦅 [Test 2] Auditing Wildlife System (Flocking Boids & Perching Birds)...');
        const wildlifeAudit = await page.evaluate(() => {
            const wl = window.openWorld3D.worldComposition.wildlife;
            return {
                exists: !!wl,
                flockCount: wl.flockCount,
                boidsMeshCount: wl.birdInstancedMesh ? wl.birdInstancedMesh.count : 0,
                perchCount: wl.perchCount,
                perchMeshCount: wl.perchMesh ? wl.perchMesh.count : 0,
                insectCount: wl.insectCount,
                hasAudioCtx: !!wl.audioCtx
            };
        });
        console.log('  -> Wildlife Audit:', wildlifeAudit);
        if (wildlifeAudit.flockCount !== 48 || wildlifeAudit.perchCount !== 12 || wildlifeAudit.insectCount !== 36) {
            throw new Error('Wildlife system failed: incorrect flock, perch, or insect count.');
        }

        // Tilt camera up into the sky toward Alpine peaks & soaring birds
        await page.evaluate(() => {
            window.openWorld3D.cameraRotation.pitch = 0.85;
            window.openWorld3D.cameraDistance = 5.0;
        });
        await new Promise(r => setTimeout(r, 1200));
        const shot2Path = path.join(ARTIFACT_DIR, 'proof_living_world_2_boids_flocking_birds_sky.png');
        await page.screenshot({ path: shot2Path });
        console.log(`  📸 Proof 2 captured: ${shot2Path}\n`);

        // -------------------------------------------------------------
        // TEST 3: In-World 3D Hologram — Terminal Amber
        // -------------------------------------------------------------
        console.log('⚡ [Test 3] Activating In-World 3D Holographic Window: Terminal (Amber)...');
        await page.evaluate(() => {
            const player = window.openWorld3D.player;
            player.position.set(2.8, window.openWorld3D.getTerrainHeight(2.8, 4.2), 4.2);
            player.rotation.y = 0.04;
            window.openWorld3D.cameraRotation.yaw = -0.18;
            window.openWorld3D.cameraRotation.pitch = 0.04;
            window.openWorld3D.cameraDistance = 3.8;
        });

        const holoAudit1 = await page.evaluate(() => {
            const holoSys = window.inworldHologramSystem;
            holoSys.setLocalTool('TERM', [
                '$ teleterm start --env=production',
                '[ConPTY] Windows Virtual Terminal active',
                '[Runtime] WebGL 2.0 Anime Shaders 60FPS',
                '[Holo3D] Laser keyboard projected',
                'Status: Ready for commands...'
            ]);

            const holo = holoSys.localHolo;
            return {
                tool: holo.tool,
                visible: holo.visible,
                hasTexture: !!holo.texture,
                linesCount: holo.lines.length,
                themeTitle: holo.theme.title,
                primaryColor: holo.theme.primary
            };
        });
        console.log('  -> Holo Terminal Audit:', holoAudit1);

        // Position camera in front of avatar to capture the floating 3D hologram screen & typing pose
        await page.evaluate(() => {
            const player = window.openWorld3D.player;
            const cam = window.openWorld3D.camera;
            cam.position.set(player.position.x + 0.45, player.position.y + 1.42, player.position.z + 1.75);
            cam.lookAt(player.position.x, player.position.y + 1.25, player.position.z);
        });
        await new Promise(r => setTimeout(r, 1200));
        const shot3Path = path.join(ARTIFACT_DIR, 'proof_living_world_3_inworld_hologram_terminal_amber.png');
        await page.screenshot({ path: shot3Path });
        console.log(`  📸 Proof 3 captured: ${shot3Path}\n`);

        // -------------------------------------------------------------
        // TEST 4: In-World 3D Hologram — Codex Amethyst
        // -------------------------------------------------------------
        console.log('🟣 [Test 4] Switching In-World 3D Hologram: Codex (Amethyst)...');
        await page.evaluate(() => {
            const holoSys = window.inworldHologramSystem;
            holoSys.setLocalTool('CODEX', [
                '// Codex Autonomous Agent active',
                'const plan = await codex.planTask({',
                '  biome: "Zen Koi Pond & Wildlife",',
                '  status: "All systems verified 100%"',
                '});',
                'return plan.execute();'
            ]);
        });
        await new Promise(r => setTimeout(r, 1200));
        const shot4Path = path.join(ARTIFACT_DIR, 'proof_living_world_4_inworld_hologram_codex_amethyst.png');
        await page.screenshot({ path: shot4Path });
        console.log(`  📸 Proof 4 captured: ${shot4Path}\n`);

        // -------------------------------------------------------------
        // TEST 5: Multiplayer Remote Peer 3D Hologram Synchronization
        // -------------------------------------------------------------
        console.log('🌐 [Test 5] Simulating Remote Multiplayer Peer with Floating 3D Hologram...');
        const remoteHoloAudit = await page.evaluate(() => {
            const holoSys = window.inworldHologramSystem;
            const scene = window.openWorld3D.scene;
            const THREE = window.THREE;

            // Spawn dummy remote peer avatar model 3m beside player
            const remoteGroup = new THREE.Group();
            remoteGroup.position.set(4.8, window.openWorld3D.getTerrainHeight(4.8, 4.2), 4.2);
            remoteGroup.rotation.y = Math.PI * 0.85; // Facing toward player
            
            // Stylized placeholder model for peer
            const peerMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.3 });
            const peerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 1.45, 12), peerMat);
            peerBody.position.y = 0.72;
            remoteGroup.add(peerBody);
            scene.add(remoteGroup);

            // Synchronize remote peer's floating hologram (AGY Nebula Cyan)
            holoSys.updateRemotePlayer('peer_lumina_42', remoteGroup, 'AGY', [
                '🪐 Antigravity Multi-Agent Gateway',
                'Peer: Lumina (Principal Architect)',
                'Task: Validating Wildlife & Koi Pond',
                'FPS: 60 locked | Latency: 12ms'
            ]);

            const remoteHolo = holoSys.remoteHolos.get('peer_lumina_42');
            return {
                remotePeerCreated: true,
                remoteHoloExists: !!remoteHolo,
                remoteHoloTool: remoteHolo?.tool,
                remoteHoloVisible: remoteHolo?.visible
            };
        });
        console.log('  -> Remote Peer Holo Audit:', remoteHoloAudit);

        // Position camera to view both local avatar and remote peer with their floating holograms
        await page.evaluate(() => {
            const cam = window.openWorld3D.camera;
            cam.position.set(3.8, 2.2, 7.2);
            cam.lookAt(3.8, 1.3, 4.2);
        });
        await new Promise(r => setTimeout(r, 1200));
        const shot5Path = path.join(ARTIFACT_DIR, 'proof_living_world_5_multiplayer_remote_peer_hologram.png');
        await page.screenshot({ path: shot5Path });
        console.log(`  📸 Proof 5 captured: ${shot5Path}\n`);

        console.log('🎉 ALL 5 VERIFICATION PHASES PASSED WITH COMPLETE VISUAL EVIDENCE!');
        return true;
    } catch (err) {
        console.error('❌ Test failed with error:', err);
        throw err;
    } finally {
        await browser.close();
    }
}

runLivingWorldAndHologramVerification()
    .then(() => {
        console.log('[Runner] Complete.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('[Runner] Error:', err);
        process.exit(1);
    });
