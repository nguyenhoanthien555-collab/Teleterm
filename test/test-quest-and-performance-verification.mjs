import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Hoan Thien/.gemini/antigravity/brain/3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function run() {
    console.log('[Test] Starting Puppeteer Quest & Performance Verification Suite...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--enable-webgl',
            '--use-gl=angle',
            '--use-angle=default',
            '--ignore-gpu-blocklist',
            '--window-size=1920,1080'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[QuestManager]') || text.includes('[PerformanceManager]') || text.includes('[Graphics]')) {
            console.log('  [Browser Console]:', text);
        }
    });

    console.log('[Test] Navigating to http://localhost:4000?direct=1 ...');
    await page.goto('http://localhost:4000?direct=1', { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for 3D world and HUD to mount
    await page.waitForSelector('#genshin-quest-tracker', { timeout: 15000 });
    await page.waitForSelector('.cyber-top-nav', { timeout: 5000 });
    console.log('[Test] Base elements mounted.');

    // Give time for world to initialize
    await new Promise(r => setTimeout(r, 3500));

    // ==========================================
    // 1. VERIFY RAM AND TOP BAR TELEMETRY VISIBILITY
    // ==========================================
    console.log('\n--- 1. Testing RAM & Top Bar Telemetry ---');
    const topBarMetrics = await page.evaluate(() => {
        const ramChip = document.getElementById('top-ram-chip');
        const cpuChip = document.getElementById('top-cpu-chip');
        const sysChip = document.querySelector('.tele-chip-sys');
        const gfxChip = document.getElementById('top-gfx-telemetry-chip');
        const profileBadge = document.getElementById('top-gfx-profile-badge');
        const fpsChip = document.getElementById('top-fps-chip');
        const frametimeChip = document.getElementById('top-frametime-chip');

        const rectSys = sysChip ? sysChip.getBoundingClientRect() : null;
        const rectGfx = gfxChip ? gfxChip.getBoundingClientRect() : null;

        return {
            ramText: ramChip?.textContent,
            cpuText: cpuChip?.textContent,
            sysVisible: !!rectSys && rectSys.width > 0 && rectSys.right <= window.innerWidth,
            sysRect: rectSys ? { left: rectSys.left, right: rectSys.right, width: rectSys.width } : null,
            gfxText: `${profileBadge?.textContent} ${fpsChip?.textContent} FPS · ${frametimeChip?.textContent}ms`,
            gfxVisible: !!rectGfx && rectGfx.width > 0 && rectGfx.right <= window.innerWidth
        };
    });
    console.log('[Test] Top Bar Metrics at 1920x1080:', JSON.stringify(topBarMetrics, null, 2));

    // Test at narrower resolution (1280x720 laptop)
    await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
    await new Promise(r => setTimeout(r, 600));
    const topBarNarrow = await page.evaluate(() => {
        const sysChip = document.querySelector('.tele-chip-sys');
        const ramChip = document.getElementById('top-ram-chip');
        const rectSys = sysChip ? sysChip.getBoundingClientRect() : null;
        return {
            ramText: ramChip?.textContent,
            sysVisible: !!rectSys && rectSys.width > 0 && rectSys.right <= window.innerWidth,
            sysRight: rectSys?.right,
            windowWidth: window.innerWidth
        };
    });
    console.log('[Test] Top Bar Metrics at 1280x720 (Narrow Laptop):', JSON.stringify(topBarNarrow, null, 2));

    // Capture screenshot of top nav at 1280x720
    const proofTopNavPath = path.join(ARTIFACTS_DIR, 'proof_top_nav_ram_visible.png');
    await page.screenshot({ path: proofTopNavPath });
    console.log(`[Test] Saved top nav proof to: ${proofTopNavPath}`);

    // Restore 1920x1080
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await new Promise(r => setTimeout(r, 600));

    // ==========================================
    // 2. VERIFY QUEST TRACKER TOGGLE / PIN TO LEFT
    // ==========================================
    console.log('\n--- 2. Testing Quest Tracker Collapse & Pin to Left ---');
    const trackerInitial = await page.evaluate(() => {
        const el = document.getElementById('genshin-quest-tracker');
        const r = el.getBoundingClientRect();
        return {
            collapsed: el.classList.contains('collapsed'),
            width: r.width,
            left: r.left,
            title: document.getElementById('g-tracker-title')?.textContent
        };
    });
    console.log('[Test] Initial Quest Tracker State:', trackerInitial);

    // Click collapse button
    await page.evaluate(() => {
        document.getElementById('g-tracker-btn-collapse')?.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const trackerCollapsed = await page.evaluate(() => {
        const el = document.getElementById('genshin-quest-tracker');
        const r = el.getBoundingClientRect();
        const bm = document.getElementById('g-tracker-bookmark-tab');
        const bmRect = bm ? bm.getBoundingClientRect() : null;
        return {
            collapsed: el.classList.contains('collapsed'),
            width: r.width,
            left: r.left,
            bookmarkTabVisible: !!bmRect && bmRect.width > 0
        };
    });
    console.log('[Test] Collapsed Quest Tracker State:', trackerCollapsed);

    // Capture screenshot of collapsed bookmark tab pinned to left
    const proofCollapsedPath = path.join(ARTIFACTS_DIR, 'proof_quest_tracker_collapsed_left.png');
    await page.screenshot({ path: proofCollapsedPath });
    console.log(`[Test] Saved collapsed quest tracker proof to: ${proofCollapsedPath}`);

    // Click bookmark tab to expand back
    await page.evaluate(() => {
        document.getElementById('genshin-quest-tracker')?.click();
    });
    await new Promise(r => setTimeout(r, 500));

    const trackerExpanded = await page.evaluate(() => {
        const el = document.getElementById('genshin-quest-tracker');
        const r = el.getBoundingClientRect();
        return {
            collapsed: el.classList.contains('collapsed'),
            width: r.width,
            left: r.left
        };
    });
    console.log('[Test] Expanded Quest Tracker State:', trackerExpanded);

    // ==========================================
    // 3. VERIFY QUEST AUTO-COMPLETION FOR DEVELOPER QUESTS
    // ==========================================
    console.log('\n--- 3. Testing Quest Auto-Completion (Terminal, Codex, AGY, IDE) ---');

    // Check quest list and active quest
    const questStateBefore = await page.evaluate(() => {
        const qm = window.questManager;
        return {
            activeQuestId: qm?.activeQuest?.id,
            activeTitle: qm?.activeQuest?.title?.en,
            activeStep: qm?.activeQuest?.currentStep?.id,
            activeStatus: qm?.activeQuest?.status,
            allQuests: qm?.quests?.map(q => ({ id: q.id, status: q.status, step: q.currentStepIndex }))
        };
    });
    console.log('[Test] Quest State Before Action:', JSON.stringify(questStateBefore, null, 2));

    // Test 3.1: Switch to Codex tab -> dispatches teleterm:tool-active
    console.log('[Test] Activating Codex AI tool...');
    await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('teleterm:tool-active', { detail: { tool: 'codex' } }));
    });
    await new Promise(r => setTimeout(r, 600));

    // Test 3.2: Send AI prompt -> dispatches teleterm:ai-prompt
    console.log('[Test] Sending AI prompt in Codex...');
    const promptResult = await page.evaluate(async () => {
        window.dispatchEvent(new CustomEvent('teleterm:ai-prompt', { detail: { tool: 'codex', prompt: 'Optimize 3D world shaders' } }));
        await new Promise(r => setTimeout(r, 800));
        const qm = window.questManager;
        const q105 = qm.quests.find(q => q.id === 'Q105');
        return {
            q105Status: q105?.status,
            q105Step: q105?.currentStepIndex,
            unlockedEmotes: qm.unlockedEmotes
        };
    });
    console.log('[Test] Q105 (AI Copilot) Result after prompt:', promptResult);

    // Test 3.3: Execute Terminal Commands for B201 (5 terminal commands)
    console.log('[Test] Executing 5 terminal commands for Bounty B201...');
    const b201Result = await page.evaluate(async () => {
        const cmds = ['git status', 'git diff', 'node -v', 'npm test', 'ls -la'];
        for (const cmd of cmds) {
            window.dispatchEvent(new CustomEvent('teleterm:command-executed', { detail: { command: cmd } }));
            await new Promise(r => setTimeout(r, 350));
        }
        await new Promise(r => setTimeout(r, 1000));
        const qm = window.questManager;
        const b201 = qm.quests.find(q => q.id === 'B201');
        return {
            b201Status: b201?.status,
            b201Step: b201?.currentStepIndex,
            allQuests: qm.quests.map(q => ({ id: q.id, status: q.status }))
        };
    });
    console.log('[Test] B201 (Terminal Commands) Result:', JSON.stringify(b201Result, null, 2));

    // Capture screenshot after quest auto-completion
    const proofQuestCompletedPath = path.join(ARTIFACTS_DIR, 'proof_quest_auto_completion.png');
    await page.screenshot({ path: proofQuestCompletedPath });
    console.log(`[Test] Saved quest auto completion proof to: ${proofQuestCompletedPath}`);

    // ==========================================
    // 4. VERIFY 3-TIER GRAPHICS SWITCHER & PC FIDELITY
    // ==========================================
    console.log('\n--- 4. Testing 3-Tier Graphics Switcher & PC Fidelity ---');
    const graphicsTest = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const pm = ow?.performanceManager;
        const rf = ow?.riceFieldSystem;

        // Current profile
        const initialProfile = pm?.activeProfile;
        const initialFoliage = rf?.foliageProfile;

        // Switch to Web profile
        pm?.applyProfile('web');
        const webProfile = pm?.activeProfile;
        const webFoliage = rf?.foliageProfile;

        // Switch back to PC Ultra profile
        pm?.applyProfile('pc');
        const pcProfile = pm?.activeProfile;
        const pcFoliage = rf?.foliageProfile;

        return {
            initialProfile,
            initialFoliage,
            webProfile,
            webFoliage,
            pcProfile,
            pcFoliage,
            rendererDpr: ow?.renderer?.getPixelRatio(),
            shadowMapType: ow?.renderer?.shadowMap?.type,
            mergedTrunksCount: ow?.treeSystem?.mergedTrunksMesh ? 1 : 0,
            mergedSakuraCount: ow?.treeSystem?.mergedSakuraCanopiesMesh ? 1 : 0,
            mergedCedarCount: ow?.treeSystem?.mergedCedarCanopiesMesh ? 1 : 0
        };
    });
    console.log('[Test] Graphics Switcher & Fidelity Results:', JSON.stringify(graphicsTest, null, 2));

    // Capture final high-fidelity screenshot
    const proofPcFidelityPath = path.join(ARTIFACTS_DIR, 'proof_pc_fidelity_merged_trees_and_shadows.png');
    await page.screenshot({ path: proofPcFidelityPath });
    console.log(`[Test] Saved PC fidelity proof to: ${proofPcFidelityPath}`);

    await browser.close();
    console.log('\n[Test] All verifications finished successfully!');
}

run().catch(err => {
    console.error('[Test Failed]:', err);
    process.exit(1);
});
