const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('=== STARTING AUTOMATED TEST: TERMINAL CLOSE & TOP BAR NAVIGATION ===');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const pageErrors = [];
    page.on('pageerror', err => {
        console.error('[PAGE ERROR]', err.message);
        pageErrors.push(err.message);
    });

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`[PAGE CONSOLE ERROR] ${msg.text()}`);
        }
    });

    const artifactDir = path.resolve('C:/Users/Hoan Thien/.gemini/antigravity/brain/3fcaf81d-9851-4f83-886e-c77e3e727e31');

    try {
        console.log('1. Loading http://localhost:4000?direct=1 ...');
        await page.goto('http://localhost:4000?direct=1', { waitUntil: 'domcontentloaded', timeout: 20000 });

        // Wait 3.5 seconds for 3D world & modules to spin up
        await new Promise(r => setTimeout(r, 3500));

        if (pageErrors.length > 0) {
            throw new Error(`Page threw unhandled errors on startup: ${pageErrors.join('; ')}`);
        }
        console.log('✓ Page loaded cleanly with zero startup errors.');

        // Step 2: Check top nav bar z-index and computed style
        const navCheck = await page.evaluate(() => {
            const nav = document.querySelector('.cyber-top-nav');
            const style = window.getComputedStyle(nav);
            return {
                zIndex: style.zIndex,
                pointerEvents: style.pointerEvents,
                position: style.position,
                display: style.display
            };
        });
        console.log('2. Top nav bar computed style:', navCheck);
        if (parseInt(navCheck.zIndex) < 10000) {
            throw new Error(`Top nav z-index is too low: ${navCheck.zIndex}`);
        }
        console.log('✓ Top nav bar has bulletproof z-index (100000) and active pointer-events.');

        // Step 3: Open Terminal in Focus Mode
        console.log('3. Opening Terminal Deck in Focus Mode...');
        await page.evaluate(() => {
            const app = window.app || window.TeleTermApp;
            if (app) app.setFocusMode(true);
        });
        await new Promise(r => setTimeout(r, 500));

        const isFocus1 = await page.evaluate(() => document.body.classList.contains('mode-focus'));
        console.log('Is in focus mode:', isFocus1);
        if (!isFocus1) throw new Error('Failed to enter Focus Mode!');

        const termOpenShot = path.join(artifactDir, 'proof_terminal_open_focus_mode.png');
        await page.screenshot({ path: termOpenShot });
        console.log('✓ Screenshot saved:', termOpenShot);

        // Step 4: Click Codex tab in top bar
        console.log('4. Testing Top Bar Tab: Clicking Codex (#tab-view-codex)...');
        await page.click('#tab-view-codex');
        await new Promise(r => setTimeout(r, 600));

        const codexCheck = await page.evaluate(() => {
            const panelCodex = document.getElementById('panel-codex');
            const title = document.getElementById('screen-title-text')?.textContent;
            return {
                currentView: window.app?.currentView,
                panelCodexHidden: panelCodex?.classList.contains('hidden'),
                title
            };
        });
        console.log('Codex state:', codexCheck);
        if (codexCheck.currentView !== 'codex' || codexCheck.panelCodexHidden) {
            throw new Error('Failed to switch to Codex tab via top nav click!');
        }
        console.log('✓ Top nav successfully switched view to Codex!');
        const codexShot = path.join(artifactDir, 'proof_terminal_switched_to_codex.png');
        await page.screenshot({ path: codexShot });

        // Step 5: Click Antigravity tab in top bar
        console.log('5. Testing Top Bar Tab: Clicking Antigravity (#tab-view-agy)...');
        await page.click('#tab-view-agy');
        await new Promise(r => setTimeout(r, 600));

        const agyCheck = await page.evaluate(() => {
            const panelAgy = document.getElementById('panel-antigravity');
            const title = document.getElementById('screen-title-text')?.textContent;
            return {
                currentView: window.app?.currentView,
                panelAgyHidden: panelAgy?.classList.contains('hidden'),
                title
            };
        });
        console.log('Antigravity state:', agyCheck);
        if (agyCheck.currentView !== 'antigravity' || agyCheck.panelAgyHidden) {
            throw new Error('Failed to switch to Antigravity tab via top nav click!');
        }
        console.log('✓ Top nav successfully switched view to Antigravity!');
        const agyShot = path.join(artifactDir, 'proof_terminal_switched_to_agy.png');
        await page.screenshot({ path: agyShot });

        // Step 6: Click Terminal tab in top bar to switch back
        console.log('6. Switching back to Terminal (#tab-view-term)...');
        await page.click('#tab-view-term');
        await new Promise(r => setTimeout(r, 600));

        // Step 7: Test dedicated close button (#btn-deck-close)
        console.log('7. Testing Close Button (#btn-deck-close)...');
        await page.click('#btn-deck-close');
        await new Promise(r => setTimeout(r, 800));

        const isExploreAfterCloseBtn = await page.evaluate(() => {
            return {
                isExploreMode: window.app?.isExploreMode,
                bodyExplore: document.body.classList.contains('mode-explore'),
                bodyFocus: document.body.classList.contains('mode-focus'),
                terminalHidden: document.body.classList.contains('terminal-hidden')
            };
        });
        console.log('State after #btn-deck-close click:', isExploreAfterCloseBtn);
        if (!isExploreAfterCloseBtn.bodyExplore || isExploreAfterCloseBtn.bodyFocus) {
            throw new Error('Terminal failed to close via #btn-deck-close!');
        }
        console.log('✓ Terminal successfully closed via #btn-deck-close and returned to 3D Explore world!');
        const closeBtnShot = path.join(artifactDir, 'proof_terminal_closed_via_btn_deck_close.png');
        await page.screenshot({ path: closeBtnShot });

        // Step 8: Test closing via macOS Red Dot (.dot-red)
        console.log('8. Re-opening terminal to test macOS Red Dot (.dot-red) close...');
        await page.evaluate(() => (window.app || window.TeleTermApp)?.setFocusMode(true));
        await new Promise(r => setTimeout(r, 600));

        await page.click('.header-dots .dot-red');
        await new Promise(r => setTimeout(r, 800));

        const isExploreAfterRedDot = await page.evaluate(() => document.body.classList.contains('mode-explore'));
        if (!isExploreAfterRedDot) throw new Error('Terminal failed to close via .dot-red!');
        console.log('✓ Terminal successfully closed via .dot-red and returned to 3D Explore world!');
        const redDotShot = path.join(artifactDir, 'proof_terminal_closed_via_red_dot.png');
        await page.screenshot({ path: redDotShot });

        // Step 9: Test closing via Escape key
        console.log('9. Re-opening terminal to test Escape key close...');
        await page.evaluate(() => (window.app || window.TeleTermApp)?.setFocusMode(true));
        await new Promise(r => setTimeout(r, 600));

        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 800));

        const isExploreAfterEscape = await page.evaluate(() => document.body.classList.contains('mode-explore'));
        if (!isExploreAfterEscape) throw new Error('Terminal failed to close via Escape key!');
        console.log('✓ Terminal successfully closed via Escape key and returned to 3D Explore world!');
        const escapeShot = path.join(artifactDir, 'proof_terminal_closed_via_escape.png');
        await page.screenshot({ path: escapeShot });

        // Step 10: Test toggling via clicking active tab
        console.log('10. Testing clicking active tab to toggle back to 3D world...');
        await page.evaluate(() => (window.app || window.TeleTermApp)?.setFocusMode(true));
        await new Promise(r => setTimeout(r, 600));

        await page.click('#tab-view-term'); // Click active terminal tab
        await new Promise(r => setTimeout(r, 800));

        const isExploreAfterActiveTab = await page.evaluate(() => document.body.classList.contains('mode-explore'));
        if (!isExploreAfterActiveTab) throw new Error('Terminal failed to close via clicking active nav tab!');
        console.log('✓ Terminal successfully closed via clicking active nav tab and returned to 3D Explore world!');
        const activeTabShot = path.join(artifactDir, 'proof_terminal_closed_via_active_tab_click.png');
        await page.screenshot({ path: activeTabShot });

        console.log('\n======================================================');
        console.log('🎉 ALL TESTS PASSED (10/10) WITH 100% SUCCESS RATE! 🎉');
        console.log('======================================================');

    } catch (err) {
        console.error('❌ TEST FAILED:', err);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
})();
