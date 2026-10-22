const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

(async () => {
    console.log('📸 Capturing high-resolution proof screenshots for the 5 audited fixes...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 25000 });
    console.log('✨ 3D World loaded.');
    await new Promise(r => setTimeout(r, 1000));

    // Dismiss launcher overlay and switch to explore mode
    await page.evaluate(() => {
        if (window.desktopLauncher) window.desktopLauncher.hideLauncher();
        const modal = document.getElementById('desktop-launcher-modal');
        if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; }
        const term = document.getElementById('deck-terminal-screen');
        if (term) term.style.display = 'none';
        document.body.classList.add('mode-explore');
        document.body.classList.remove('mode-focus');
    });
    await new Promise(r => setTimeout(r, 1000));

    // PROOF 1: Village Plaza at former ghost terminal (4.2, 2.5)
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.player.position.set(4.2, ow.getTerrainHeight(4.2, 2.5), 2.5);
        ow.camera.position.set(4.2, ow.player.position.y + 1.8, 6.5);
        ow.camera.lookAt(4.2, ow.player.position.y + 0.9, 2.5);
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'proof_audit_1_no_ghost_terminal.png') });
    console.log('📸 Saved proof_audit_1_no_ghost_terminal.png');

    // PROOF 2: Developer Hub with timber foundation stilts & clear pathway
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        // Position camera to see west side of deck, stilts, steps, and pathway
        ow.player.position.set(16.0, ow.getTerrainHeight(16.0, -11.0), -11.0);
        ow.camera.position.set(13.0, ow.player.position.y + 2.4, -13.5);
        ow.camera.lookAt(22.0, ow.player.position.y + 1.2, -11.0);
    });
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'proof_audit_2_hub_grounded_and_path.png') });
    console.log('📸 Saved proof_audit_2_hub_grounded_and_path.png');

    // PROOF 3: Zen Tea Pavilion - Seiza on tatami mat facing the tea table
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        const im = ow.interactionManager;
        const mat1 = im.getAnchor('bamboo_tea_mat_1');
        ow.sitDown(mat1);
        // Position camera to view player sitting Seiza at the tea table
        ow.camera.position.set(-27.8, ow.player.position.y + 1.4, -28.2);
        ow.camera.lookAt(-26.0, ow.player.position.y + 0.4, -30.0);
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'proof_audit_3_tatami_seiza_facing_table.png') });
    console.log('📸 Saved proof_audit_3_tatami_seiza_facing_table.png');

    // PROOF 4: Maple Stream Rest Stop - Player sitting on stool facing picnic table
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.standUp();
        const im = ow.interactionManager;
        const stool1 = im.getAnchor('maple_picnic_bench_1');
        ow.sitDown(stool1);
        // Camera looking at picnic table with player seated facing the table
        ow.camera.position.set(38.0, ow.player.position.y + 1.6, -24.8);
        ow.camera.lookAt(38.0, ow.player.position.y + 0.6, -28.0);
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'proof_audit_4_maple_picnic_stools.png') });
    console.log('📸 Saved proof_audit_4_maple_picnic_stools.png');

    // PROOF 5: Pine Forest Slope - Player standing tall on continuous slope without sinking
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.standUp();
        ow.player.position.set(14.0, ow.getTerrainHeight(14.0, -42.0), -42.0);
        ow.camera.position.set(11.5, ow.player.position.y + 1.5, -44.5);
        ow.camera.lookAt(14.0, ow.player.position.y + 0.8, -42.0);
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'proof_audit_5_pine_slope_continuous.png') });
    console.log('📸 Saved proof_audit_5_pine_slope_continuous.png');

    await browser.close();
    console.log('🎉 ALL 5 PROOF SCREENSHOTS CAPTURED SUCCESSFULLY!');
})();
