const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function runVisualVerification() {
    console.log('🔍 [VISUAL VERIFICATION] Capturing post-upgrade visual overhaul evidence...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--use-gl=angle',
            '--use-angle=gl',
            '--enable-webgl',
            '--ignore-gpu-blocklist'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const consoleLogs = [];
    const pageErrors = [];

    page.on('console', msg => {
        const text = msg.text();
        consoleLogs.push({ type: msg.type(), text });
        if (msg.type() === 'error') {
            console.error('  [BROWSER ERROR]:', text);
        }
    });

    page.on('pageerror', err => {
        pageErrors.push(err.message);
        console.error('  [PAGE ERROR]:', err.message);
    });

    console.log('🌐 Loading http://localhost:4000...');
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Switch to Explore mode and dismiss launcher
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
        if (window.desktopLauncher) {
            window.desktopLauncher.hideLauncher();
        }
        if (window.__teleTermApp) {
            window.__teleTermApp.setFocusMode(false);
        }
    });

    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 25000 });
    console.log('✨ 3D World and avatar loaded.');
    await new Promise(r => setTimeout(r, 1500));

    // Helper for camera view screenshot
    async function shotView(name, setupFn) {
        await page.evaluate(() => {
            if (window.openWorld3D) window.openWorld3D.isCinematicCamera = true;
        });
        await page.evaluate(setupFn);
        await new Promise(r => setTimeout(r, 600));
        const outPath = path.join(ARTIFACT_DIR, name);
        await page.screenshot({ path: outPath });
        console.log(`  📸 Saved ${name}`);
    }

    // 1. River Continuous Ribbon & Gravel Banks
    await shotView('proof_01_river_continuous_ribbon.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(-8.0, 3.2, 17.0);
        ow.camera.lookAt(4.0, 0.5, 27.0);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 2. Arched Timber River Bridge & Curved Parabolic Handrails
    await shotView('proof_02_arched_bridge_curved_handrail.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(4.0, 2.4, 18.5);
        ow.camera.lookAt(4.0, 1.2, 27.0);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 3. Zen Tea Pavilion Grounded on Slopes
    await shotView('proof_03_zen_pavilion_grounded.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(-22.0, 2.5, -25.0);
        ow.camera.lookAt(-26.0, 2.0, -30.0);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 4. Maple Stream Continuous Sloping Ribbon & Rustic Footbridge
    await shotView('proof_04_maple_stream_and_footbridge.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(38.0, 3.2, -24.0);
        ow.camera.lookAt(32.0, 1.6, -28.0);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 5. Bamboo Forest Segmented Culms & Powdery Bloom Rings
    await shotView('proof_05_bamboo_culm_textures.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(-20.0, 3.0, -22.0);
        ow.camera.lookAt(-28.0, 4.0, -26.0);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 6. Rice Terraces Alluvial Mud & Seedling Shadow Casting
    await shotView('proof_06_rice_terraces_mud_shadows.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(-14.0, 2.8, -1.0);
        ow.camera.lookAt(-22.0, 0.8, 6.0);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 7. Hilltop Panorama Viewpoint & Articulated Observation Telescope
    await shotView('proof_07_hilltop_observation_telescope.png', () => {
        const ow = window.openWorld3D;
        // Telescope is at (34.0 - 1.6, -48.0 + 0.2) = (32.4, -47.8)
        const teleY = ow.getTerrainHeight(32.4, -47.8);
        ow.camera.position.set(31.2, teleY + 1.45, -46.2);
        ow.camera.lookAt(32.4, teleY + 1.15, -47.8);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 8. Player Avatar Close-up with Held Item Synchronized
    await page.evaluate(async () => {
        const inv = window.playerInventory;
        if (!inv.slots[0]) {
            const vendRes = await fetch('/api/dev/vending/vend', { method: 'POST' });
            const vendData = await vendRes.json();
            inv.addItem(vendData.item);
        }
        inv.equipSlot(0);
    });
    await new Promise(r => setTimeout(r, 600));

    await shotView('proof_08_character_held_item_equipped.png', () => {
        const ow = window.openWorld3D;
        const py = ow.getTerrainHeight(2.8, 4.2);
        ow.player.position.set(2.8, py, 4.2);
        ow.player.rotation.y = -0.22; // 3/4 turn facing camera (+Z)
        if (ow.retargeter) {
            ow.retargeter.setHandPose('small_can');
            for (let i = 0; i < 20; i++) {
                ow.retargeter.update(0.05, false, false);
            }
        }
        ow.camera.position.set(2.8, py + 1.25, 5.6);
        ow.camera.lookAt(2.8, py + 1.10, 4.2);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // Capture post-upgrade render metrics
    const renderMetrics = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const info = ow.renderer.info;
        const rightHandBone = ow.retargeter?.mappedBones?.RightHand;
        return {
            memory: {
                geometries: info.memory.geometries,
                textures: info.memory.textures
            },
            render: {
                calls: info.render.calls,
                triangles: info.render.triangles,
                points: info.render.points,
                lines: info.render.lines,
                frame: info.render.frame
            },
            heldItemAttachment: {
                rightHandFound: !!rightHandBone,
                rightHandChildrenCount: rightHandBone ? rightHandBone.children.length : 0,
                rightHandChildren: rightHandBone ? rightHandBone.children.map(c => c.name || c.type) : [],
                equippedDef: ow.currentlyEquippedItemDef ? ow.currentlyEquippedItemDef.id : null
            },
            programs: info.programs ? info.programs.length : 0,
            pixelRatio: ow.renderer.getPixelRatio(),
            toneMapping: ow.renderer.toneMapping,
            exposure: ow.renderer.toneMappingExposure,
            shadowMapEnabled: ow.renderer.shadowMap.enabled,
            shadowMapType: ow.renderer.shadowMap.type
        };
    });

    console.log('📊 Post-Upgrade Renderer Metrics:', JSON.stringify(renderMetrics, null, 2));

    await browser.close();

    const upgradeSummary = {
        metrics: renderMetrics,
        consoleErrors: consoleLogs.filter(l => l.type === 'error').map(l => l.text),
        pageErrors,
        totalLogs: consoleLogs.length
    };
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'verification_upgrade_metrics.json'), JSON.stringify(upgradeSummary, null, 2));
    console.log('✅ [VISUAL VERIFICATION COMPLETE] Metrics and 8 upgrade screenshots saved to artifacts directory.');
}

runVisualVerification().catch(err => {
    console.error('Visual verification failed:', err);
    process.exit(1);
});
