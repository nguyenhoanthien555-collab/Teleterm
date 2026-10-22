const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function runAudit() {
    console.log('🔍 [PHASE 0 AUDIT] Starting comprehensive visual and runtime audit...');
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

    // Switch to Explore mode and dismiss launcher overlay
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

    // Wait for OpenWorld3D
    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 25000 });
    console.log('✨ 3D World and avatar loaded.');

    await new Promise(r => setTimeout(r, 1500));

    // Capture baseline metrics from Three.js renderer info
    const renderMetrics = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const info = ow.renderer.info;
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
            programs: info.programs ? info.programs.length : 0,
            pixelRatio: ow.renderer.getPixelRatio(),
            toneMapping: ow.renderer.toneMapping,
            exposure: ow.renderer.toneMappingExposure,
            shadowMapEnabled: ow.renderer.shadowMap.enabled,
            shadowMapType: ow.renderer.shadowMap.type
        };
    });
    console.log('📊 Renderer Metrics:', JSON.stringify(renderMetrics, null, 2));

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

    // 1. Hub overview
    await shotView('baseline_01_hub_overview.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(12, 5.5, 2);
        ow.camera.lookAt(22, 2.5, -11);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 2. Co-working deck & seating
    await shotView('baseline_02_coworking_deck.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(19, 3.2, -6.5);
        ow.camera.lookAt(23.5, 2.2, -12);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 3. Village plaza & bicycle
    await shotView('baseline_03_village_plaza.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(0, 2.8, -16);
        ow.camera.lookAt(3, 1.2, -22);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 4. Rice field terraces
    await shotView('baseline_04_rice_terraces.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(-8, 3.5, 2);
        ow.camera.lookAt(-22, 1.5, 6);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 5. River valley & arched bridge
    await shotView('baseline_05_river_bridge.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(3, 3.5, 14);
        ow.camera.lookAt(4, 1.5, 27);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 6. Bamboo zen pavilion
    await shotView('baseline_06_bamboo_zen_pavilion.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(-18, 3.0, -24);
        ow.camera.lookAt(-26, 1.8, -30);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 7. Maple valley stream
    await shotView('baseline_07_maple_stream.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(32, 3.8, -22);
        ow.camera.lookAt(42, 2.0, -32);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 8. Alpine foothills & mountains
    await shotView('baseline_08_alpine_foothills.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(28, 4.5, -38);
        ow.camera.lookAt(34, 4.0, -58);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 9. Coastal beach & pier
    await shotView('baseline_09_coastal_beach_pier.png', () => {
        const ow = window.openWorld3D;
        ow.camera.position.set(6, 3.0, 52);
        ow.camera.lookAt(10, 1.0, 76);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 10. Avatar close-up & character face
    await shotView('baseline_10_character_closeup.png', () => {
        const ow = window.openWorld3D;
        ow.player.position.set(2.8, ow.getTerrainHeight(2.8, 4.2), 4.2);
        ow.camera.position.set(2.8, ow.getTerrainHeight(2.8, 4.2) + 1.25, 6.0);
        ow.camera.lookAt(2.8, ow.getTerrainHeight(2.8, 4.2) + 1.2, 4.2);
        if (ow.overheadUi) ow.overheadUi.update();
    });

    // 11. ADE Editor Workspace
    console.log('🌐 Loading http://localhost:4000/ade...');
    await page.goto('http://localhost:4000/ade', { waitUntil: 'networkidle2', timeout: 25000 });
    await page.waitForSelector('#ade-app', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1200));

    const adeOutPath = path.join(ARTIFACT_DIR, 'baseline_11_ade_workspace.png');
    await page.screenshot({ path: adeOutPath });
    console.log(`  📸 Saved baseline_11_ade_workspace.png`);

    // 12. Mobile Viewport (390 x 844 iPhone 14 / modern Android)
    console.log('📱 Switching to Mobile Viewport (390x844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded', timeout: 25000 });
    await new Promise(r => setTimeout(r, 2000));
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
    });
    await new Promise(r => setTimeout(r, 1000));

    const mobileOutPath = path.join(ARTIFACT_DIR, 'baseline_12_mobile_viewport.png');
    await page.screenshot({ path: mobileOutPath });
    console.log(`  📸 Saved baseline_12_mobile_viewport.png`);

    await browser.close();

    const auditSummary = {
        metrics: renderMetrics,
        consoleErrors: consoleLogs.filter(l => l.type === 'error').map(l => l.text),
        pageErrors,
        totalLogs: consoleLogs.length
    };
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'audit_baseline_metrics.json'), JSON.stringify(auditSummary, null, 2));
    console.log('✅ [PHASE 0 AUDIT COMPLETE] Metrics and 12 baseline screenshots saved to artifacts directory.');
}

runAudit().catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
});
