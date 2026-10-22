const puppeteer = require('puppeteer');
const path = require('path');

async function verifyHubFixes() {
    console.log('🚀 [PUPPETEER] Launching headless browser for TeleTerm validation...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--autoplay-policy=no-user-gesture-required'
        ]
    });

    const artifactDir = path.join('C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\69476637-5058-4b38-81f6-926c8792527c');
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        console.log('🌐 Navigating to http://127.0.0.1:4000 ...');
        await page.goto('http://127.0.0.1:4000', { waitUntil: 'domcontentloaded', timeout: 20000 });
        await new Promise((r) => setTimeout(r, 2000));

        // 1. TEST HUB BUTTON: NO OVERLAPPING MODALS
        console.log('🔍 Test 1: Testing Hub button click...');
        await page.evaluate(() => document.getElementById('btn-nav-hub')?.click());
        await new Promise((r) => setTimeout(r, 800));

        const hubModalStatus = await page.evaluate(() => {
            const toolsDrawer = document.getElementById('modal-tools-drawer');
            const legacyHub = document.getElementById('cyber-hub-modal');
            return {
                toolsDrawerVisible: toolsDrawer && !toolsDrawer.classList.contains('hidden'),
                legacyHubHidden: !legacyHub || legacyHub.classList.contains('hidden')
            };
        });
        console.log('✅ Hub Modals Overlap Check:', JSON.stringify(hubModalStatus));

        // 2. TEST FILES TAB & FOLDER NAVIGATOR
        console.log('🔍 Test 2: Testing Files Tab & Folder Navigator...');
        await page.evaluate(() => document.querySelector('.tools-nav-tab[data-tab="files"]')?.click());
        await new Promise((r) => setTimeout(r, 1000));

        const fileNavStatus = await page.evaluate(() => {
            const nav = document.querySelector('.tools-folder-navigator');
            const input = document.getElementById('tools-path-input');
            const chips = Array.from(document.querySelectorAll('.btn-drive-chip')).map(c => c.textContent);
            const files = Array.from(document.querySelectorAll('.tools-file-row')).map(r => r.innerText.trim());
            const actions = {
                cdTerm: !!document.getElementById('btn-set-term-cwd'),
                newTerm: !!document.getElementById('btn-new-term-here'),
                copyPath: !!document.getElementById('btn-copy-dir-path')
            };
            return {
                hasNavigator: !!nav,
                currentPathValue: input ? input.value : '',
                driveChips: chips,
                filesCount: files.length,
                firstFewFiles: files.slice(0, 5),
                actions
            };
        });
        console.log('✅ File Navigator Status:', JSON.stringify(fileNavStatus, null, 2));

        await page.screenshot({ path: path.join(artifactDir, 'verify_hub_files_navigator.png') });
        console.log('📸 Screenshot saved: verify_hub_files_navigator.png');

        // 3. TEST PROCESSES TAB: ONLY ACTIVE POWERSHELL / TERMINAL
        console.log('🔍 Test 3: Testing Processes Tab (Filter headless processes)...');
        await page.evaluate(() => document.querySelector('.tools-nav-tab[data-tab="processes"]')?.click());
        await new Promise((r) => setTimeout(r, 3500));

        const processStatus = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('.tools-proc-card')).map(card => {
                return {
                    name: card.querySelector('.proc-name')?.textContent,
                    pid: card.querySelector('.proc-pid')?.textContent
                };
            });
            return {
                totalCount: cards.length,
                processes: cards
            };
        });
        console.log('✅ Processes Tab Filter Result:', JSON.stringify(processStatus, null, 2));

        await page.screenshot({ path: path.join(artifactDir, 'verify_hub_active_processes.png') });
        console.log('📸 Screenshot saved: verify_hub_active_processes.png');

        // Close Tools Drawer
        await page.evaluate(() => document.getElementById('btn-close-tools-drawer')?.click());
        await new Promise((r) => setTimeout(r, 500));

        // 4. TEST SMART SCROLL PINNING IN ANTIGRAVITY DECK
        console.log('🔍 Test 4: Testing Smart Scroll Pinning in Antigravity Chat...');
        await page.evaluate(() => document.getElementById('tab-view-agy')?.click());
        await page.waitForSelector('.agy-web-turn', { timeout: 15000 });
        await new Promise((r) => setTimeout(r, 1200));

        const scrollTestResult = await page.evaluate(async () => {
            const feed = document.getElementById('agy-web-chat-feed');
            if (!feed) return { error: 'Feed not found' };

            // Check initial scroll at bottom
            const initialScrollTop = feed.scrollTop;
            const scrollHeight = feed.scrollHeight;

            // Scroll up to read old messages (scroll to position 200px)
            feed.scrollTop = 200;
            feed.dispatchEvent(new Event('scroll'));

            await new Promise(r => setTimeout(r, 200));
            const jumpBtn = document.getElementById('agy-jump-bottom-btn');
            const jumpBtnVisible = jumpBtn && !jumpBtn.classList.contains('hidden');

            // Wait 2.8s for live progress poller to run while scrolled up
            await new Promise(r => setTimeout(r, 2800));

            // Scroll position after poller
            const postPollScrollTop = feed.scrollTop;

            // Click jump to bottom button
            if (jumpBtn) {
                jumpBtn.click();
            }
            await new Promise(r => setTimeout(r, 400));
            const afterJumpScrollTop = feed.scrollTop;

            return {
                initialScrollTop,
                scrollHeight,
                jumpBtnVisible,
                scrolledUpPosition: 200,
                postPollScrollTop,
                scrollPreservedDuringPoll: Math.abs(postPollScrollTop - 200) < 50,
                afterJumpScrollTop,
                jumpReturnedToBottom: afterJumpScrollTop > (scrollHeight - 400)
            };
        });
        console.log('✅ Scroll Pinning Test Result:', JSON.stringify(scrollTestResult, null, 2));

        await page.screenshot({ path: path.join(artifactDir, 'verify_antigravity_scroll_pinning.png') });
        console.log('📸 Screenshot saved: verify_antigravity_scroll_pinning.png');

    } catch (err) {
        console.error('❌ Error during verification:', err);
    } finally {
        await browser.close();
        console.log('🏁 Verification finished.');
    }
}

verifyHubFixes();
