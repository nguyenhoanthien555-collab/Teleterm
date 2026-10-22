const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BRAIN_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\fb5ef480-faa4-4156-8ec0-1c210d4ba0be';
const TEST_DIR = path.resolve(__dirname);

function saveArtifact(filename, buffer) {
    fs.writeFileSync(path.join(TEST_DIR, filename), buffer);
    if (fs.existsSync(BRAIN_DIR)) {
        fs.writeFileSync(path.join(BRAIN_DIR, filename), buffer);
    }
}

(async () => {
    console.log('🚀 Launching Puppeteer for 4 Fixes Verification Suite...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[Antigravity]') || text.includes('[Codex]')) {
            console.log('Browser log:', text);
        }
    });

    console.log('Navigating to http://localhost:4000 ...');
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Dismiss launcher overlay if present
    await page.evaluate(() => {
        if (window.__teleTermApp && window.__teleTermApp.desktopLauncher) {
            window.__teleTermApp.desktopLauncher.handleStartVibing();
        }
        const overlay = document.getElementById('launcher-overlay');
        if (overlay) overlay.style.display = 'none';
        const startBtn = document.getElementById('btn-start-vibing');
        if (startBtn) startBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Switch to explore mode
    await page.evaluate(() => {
        if (window.__teleTermApp) {
            window.__teleTermApp.setFocusMode(false);
        } else {
            document.body.classList.add('mode-explore');
            document.body.classList.remove('mode-focus');
        }
    });

    // Wait for 3D world to initialize
    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });
    console.log('✨ 3D World loaded successfully.');
    await new Promise(r => setTimeout(r, 2000));

    // =========================================================================
    // TEST 1: Developer Hub Staircase & Handrails
    // =========================================================================
    console.log('\n--- Running Test 1: Developer Hub Staircase & Handrails ---');
    const stairReport = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const playerX = 13.5;
        const playerZ = -10.2;
        const groundY = ow.getTerrainHeight(playerX, playerZ);
        ow.player.position.set(playerX, groundY, playerZ);
        ow.player.rotation.y = Math.PI * 0.75;
        ow.isSitting = false;
        ow.retargeter.setAnimation('Idle');

        // Position camera to view Developer Hub stairs and handrails exactly like Image 1
        ow.camera.position.set(11.8, 1.85, -8.8);
        ow.camera.lookAt(15.5, 0.75, -12.2);
        ow.updateCamera = () => {
            ow.camera.position.set(11.8, 1.85, -8.8);
            ow.camera.lookAt(15.5, 0.75, -12.2);
        };

        return {
            playerPos: { x: playerX, y: groundY, z: playerZ },
            cameraPos: { x: ow.camera.position.x, y: ow.camera.position.y, z: ow.camera.position.z }
        };
    });
    console.log('Stairs Camera Setup:', stairReport);

    await new Promise(r => setTimeout(r, 1000));
    const buf1 = await page.screenshot({ fullPage: false });
    saveArtifact('verify_fix1_hub_staircase_angle1.png', buf1);
    console.log('📸 Saved verify_fix1_hub_staircase_angle1.png');

    // Close-up perspective right at the steps to verify 0 z-fighting and handrail alignment
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        ow.camera.position.set(12.8, 1.3, -11.0);
        ow.camera.lookAt(15.8, 0.8, -12.0);
        ow.updateCamera = () => {
            ow.camera.position.set(12.8, 1.3, -11.0);
            ow.camera.lookAt(15.8, 0.8, -12.0);
        };
    });
    await new Promise(r => setTimeout(r, 800));
    const buf1b = await page.screenshot({ fullPage: false });
    saveArtifact('verify_fix1_hub_staircase_closeup.png', buf1b);
    console.log('📸 Saved verify_fix1_hub_staircase_closeup.png');

    // =========================================================================
    // TEST 2: AGY Live Status Transition & Idle State
    // =========================================================================
    console.log('\n--- Running Test 2: AGY Live Status & Idle Transition ---');
    const agyReport = await page.evaluate(async () => {
        const app = window.__teleTermApp;
        if (app) {
            app.setFocusMode(true);
            app.switchView('antigravity');
            if (app.antigravityWebChat) {
                app.antigravityWebChat.switchSession({ id: '3fcaf81d-9851-4f83-886e-c77e3e727e31', title: 'Developer Hub & Biomes Fixes' });
            }
        }

        // Wait 2.0s for conversation loading & live session polling
        await new Promise(r => setTimeout(r, 2000));

        const liveTextEl = document.getElementById('agy-live-status-text');
        const liveStepBadge = document.getElementById('agy-live-step-badge');
        const typingEl = document.getElementById('agy-typing-indicator');
        const chatFeed = document.getElementById('agy-web-chat-feed');

        // Check computed scrollbar styles on chat feed
        const scrollbarStyle = chatFeed ? window.getComputedStyle(chatFeed).scrollbarColor : null;
        const scrollbarWidth = chatFeed ? window.getComputedStyle(chatFeed).scrollbarWidth : null;

        return {
            liveStatusText: liveTextEl ? liveTextEl.textContent.trim() : null,
            liveStepBadgeText: liveStepBadge ? liveStepBadge.textContent.trim() : null,
            hasTypingIndicator: !!typingEl,
            scrollbarColor: scrollbarStyle,
            scrollbarWidth: scrollbarWidth
        };
    });
    console.log('AGY Status Report:', agyReport);

    await new Promise(r => setTimeout(r, 600));
    const buf2 = await page.screenshot({ fullPage: false });
    saveArtifact('verify_fix2_agy_idle_status.png', buf2);
    console.log('📸 Saved verify_fix2_agy_idle_status.png');

    // =========================================================================
    // TEST 3 & 4: Codex Dividers & Sleek Cyberpunk Scrollbars
    // =========================================================================
    console.log('\n--- Running Test 3 & 4: Codex Dividers & Sleek Scrollbars ---');
    const codexReport = await page.evaluate(async () => {
        const app = window.__teleTermApp;
        if (app) {
            app.switchView('codex');
        }

        await new Promise(r => setTimeout(r, 1000));

        // Load the specific thread "Tìm nguyên nhân máy chạy chậm"
        const threadId = '01a11f58-ec27-7501-94fb-55b1b533feaf';
        if (app && app.codexDeck) {
            await app.codexDeck.loadThread(threadId);
        }

        await new Promise(r => setTimeout(r, 1500));

        const turnsContainer = document.getElementById('codex-turns-container');
        const hrElements = turnsContainer ? turnsContainer.querySelectorAll('hr, .markdown-hr') : [];
        const cmdCards = turnsContainer ? turnsContainer.querySelectorAll('.codex-cmd-card') : [];
        const assistantBubbles = turnsContainer ? turnsContainer.querySelectorAll('.codex-turn-assistant') : [];

        // Check computed scrollbar on codex container
        const computedStyle = turnsContainer ? window.getComputedStyle(turnsContainer) : null;

        return {
            threadTitle: document.getElementById('codex-active-thread-title')?.textContent,
            totalAssistantBubbles: assistantBubbles.length,
            totalCommandCards: cmdCards.length,
            totalHrDividers: hrElements.length,
            scrollbarWidth: computedStyle ? computedStyle.scrollbarWidth : null,
            scrollbarColor: computedStyle ? computedStyle.scrollbarColor : null
        };
    });
    console.log('Codex Report:', codexReport);

    await new Promise(r => setTimeout(r, 600));
    const buf3 = await page.screenshot({ fullPage: false });
    saveArtifact('verify_fix3_fix4_codex_clean_scrollbars.png', buf3);
    console.log('📸 Saved verify_fix3_fix4_codex_clean_scrollbars.png');

    await browser.close();
    console.log('🏁 Verification suite completed successfully!');
})();
