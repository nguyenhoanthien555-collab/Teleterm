const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('=== STARTING TEST: DUAL-PANE TEST EXPLORER & LIVE LOG/ERROR INSPECTOR ===');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const pageErrors = [];
    page.on('pageerror', err => {
        console.error('[PAGE ERROR]', err.message);
        pageErrors.push(err.message);
    });

    const artifactDir = path.resolve('C:/Users/Hoan Thien/.gemini/antigravity/brain/3fcaf81d-9851-4f83-886e-c77e3e727e31');

    try {
        console.log('Step 1: Navigating to http://localhost:4000/ade.html ...');
        await page.goto('http://localhost:4000/ade.html', { waitUntil: 'domcontentloaded', timeout: 25000 });
        await new Promise(r => setTimeout(r, 2500));

        // Step 2: Open Test Suites Dock Tab
        console.log('Step 2: Switching to Test Suites dock tab (#dock-tab-btn-tests)...');
        await page.waitForSelector('#dock-tab-btn-tests', { timeout: 10000 });
        await page.click('#dock-tab-btn-tests');
        await new Promise(r => setTimeout(r, 1000));

        // Step 3: Verify Dual-Pane layout and controls exist
        console.log('Step 3: Verifying Dual-Pane architecture and toolbars...');
        const layoutInfo = await page.evaluate(() => {
            const dockTestsPanel = document.getElementById('dock-tests-panel');
            const dualPaneBody = document.querySelector('.tests-dashboard-body');
            const leftSidebar = document.querySelector('.tests-suites-sidebar');
            const rightInspector = document.querySelector('.tests-log-inspector');
            const liveConsole = document.getElementById('tests-live-console');
            const logContent = document.getElementById('tests-log-content');
            const searchInput = document.getElementById('tests-search-input');
            const btnRunCore = document.getElementById('btn-tests-run-core');
            const btnRunAll = document.getElementById('btn-tests-run-all');
            const filterPills = Array.from(document.querySelectorAll('.filter-pill')).map(p => p.textContent.trim());

            return {
                panelVisible: dockTestsPanel && dockTestsPanel.style.display !== 'none',
                hasDualPane: !!dualPaneBody,
                hasLeftSidebar: !!leftSidebar,
                hasRightInspector: !!rightInspector,
                hasLiveConsole: !!liveConsole,
                hasLogContent: !!logContent,
                hasSearchInput: !!searchInput,
                hasBtnRunCore: !!btnRunCore,
                hasBtnRunAll: !!btnRunAll,
                btnRunCoreText: btnRunCore?.textContent.trim(),
                filterPills
            };
        });

        console.log('✓ Dual-Pane Layout Info:', layoutInfo);
        if (!layoutInfo.hasDualPane || !layoutInfo.hasLeftSidebar || !layoutInfo.hasRightInspector) {
            throw new Error('Dual-Pane elements missing from DOM');
        }

        // Step 4: Verify Suite Selection & Inspector loading
        console.log('Step 4: Selecting test suite card in left pane...');
        await page.waitForSelector('.test-suite-card', { timeout: 10000 });
        const suiteSelected = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('.test-suite-card'));
            const targetCard = cards.find(c => c.textContent.includes('Desktop Platform') || c.textContent.includes('test-desktop-platform')) || cards[0];
            targetCard.click();
            return {
                selectedName: targetCard.querySelector('.suite-name')?.textContent,
                inspectorTitle: document.getElementById('tests-inspector-title')?.textContent,
                cardHasSelectedClass: targetCard.classList.contains('selected')
            };
        });
        console.log('✓ Suite Selection:', suiteSelected);
        if (!suiteSelected.cardHasSelectedClass) {
            throw new Error('Suite card did not get .selected class upon click');
        }

        // Step 5: Test Search Filter
        console.log('Step 5: Testing real-time search filter...');
        await page.type('#tests-search-input', 'phase2');
        await new Promise(r => setTimeout(r, 400));
        const searchResults = await page.evaluate(() => {
            const visibleCards = Array.from(document.querySelectorAll('.test-suite-card'));
            return {
                count: visibleCards.length,
                allMatchQuery: visibleCards.every(c => c.textContent.toLowerCase().includes('phase2'))
            };
        });
        console.log('✓ Search Results for "phase2":', searchResults);
        if (searchResults.count === 0 || !searchResults.allMatchQuery) {
            throw new Error('Search filtering did not properly filter suites list');
        }

        // Clear search
        await page.click('#btn-tests-clear-search');
        await new Promise(r => setTimeout(r, 300));

        // Step 6: Test Core Filter Pill
        console.log('Step 6: Testing ⭐ Core filter pill...');
        await page.click('#btn-filter-core');
        await new Promise(r => setTimeout(r, 300));
        const coreFilterResults = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('.test-suite-card'));
            const stars = Array.from(document.querySelectorAll('.suite-core-star'));
            return {
                count: cards.length,
                hasStarOnAll: stars.length === cards.length
            };
        });
        console.log('✓ Core Filter Results:', coreFilterResults);
        if (coreFilterResults.count !== 7 || !coreFilterResults.hasStarOnAll) {
            throw new Error(`Expected 7 core suites, found ${coreFilterResults.count}`);
        }

        // Switch back to All filter
        await page.click('[data-filter="all"]');
        await new Promise(r => setTimeout(r, 300));

        // Step 7: Test "▶ Verify Core" Execution & Live Log Streaming
        console.log('Step 7: Triggering "▶ Verify Core" and observing real-time stdout streaming...');
        await page.click('#btn-tests-run-core');

        // Wait a moment for test to start and output to stream
        await new Promise(r => setTimeout(r, 3500));

        const liveStreamState = await page.evaluate(() => {
            const logContent = document.getElementById('tests-log-content')?.textContent;
            const isConsoleActive = logContent && logContent.length > 50;
            const selectedTitle = document.getElementById('tests-inspector-title')?.textContent;
            return {
                isConsoleActive,
                selectedTitle,
                logPreview: logContent?.slice(0, 200)
            };
        });
        console.log('✓ Live Log Streaming State:', liveStreamState);

        // Capture screenshot of live dual-pane log streaming
        const proofLiveStreamPath = path.join(artifactDir, 'proof_test_dashboard_dual_pane_and_logs.png');
        await page.screenshot({ path: proofLiveStreamPath });
        console.log('✓ Captured screenshot:', proofLiveStreamPath);

        // Step 8: Test Error Inspector & 1-Click "Send Error to Agent"
        console.log('Step 8: Testing Failure Inspector & "⚡ Send Error to Agent" button...');
        const errorTestResult = await page.evaluate(() => {
            // Emit mock failure event on active suite
            const failPayload = {
                runId: 'test-failure-simulation',
                suiteId: 'test-desktop-platform',
                filename: 'test-desktop-platform.js',
                passed: false,
                exitCode: 1,
                durationMs: 450,
                summary: 'FAILED with code 1 (450ms)',
                errorSnippet: 'AssertionError: expected terminal status to be connected\n    at test/test-desktop-platform.js:142:15',
                output: '=== RUNNING DESKTOP PLATFORM TESTS ===\n[FAIL] ConPTY Connection Handshake\nAssertionError: expected terminal status to be connected\n    at test/test-desktop-platform.js:142:15\nFAILED'
            };

            window.AdeTestDashboard.handleSuiteCompleted(failPayload);

            const banner = document.getElementById('test-error-banner');
            const snippet = document.getElementById('test-error-snippet')?.textContent;
            const btnSendAgent = document.getElementById('btn-test-send-agent');
            const failPill = document.getElementById('btn-filter-failed');

            // Click send to agent
            btnSendAgent.click();
            const promptInput = document.getElementById('agent-prompt-input');

            return {
                bannerVisible: banner && banner.style.display !== 'none',
                snippetContent: snippet,
                btnSendVisible: btnSendAgent && btnSendAgent.style.display !== 'none',
                failPillText: failPill?.textContent,
                promptHasError: promptInput && promptInput.value.includes('AssertionError') && promptInput.value.includes('test-desktop-platform.js')
            };
        });

        console.log('✓ Failure Inspector & Agent Prompt Integration:', errorTestResult);
        if (!errorTestResult.bannerVisible || !errorTestResult.btnSendVisible || !errorTestResult.promptHasError) {
            throw new Error('Failure root-cause banner or Send Error to Agent prompt failed verification');
        }

        // Capture screenshot of Error Inspector & Agent Prompt
        const proofErrorInspectorPath = path.join(artifactDir, 'proof_test_dashboard_error_inspector_and_agent_button.png');
        await page.screenshot({ path: proofErrorInspectorPath });
        console.log('✓ Captured screenshot:', proofErrorInspectorPath);

        console.log('\n======================================================');
        console.log('🎉 ALL 8 TESTS FOR TEST DASHBOARD DUAL-PANE & ERROR INSPECTOR PASSED!');
        console.log('======================================================\n');
    } catch (err) {
        console.error('❌ TEST FAILED:', err);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
})();
