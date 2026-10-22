const puppeteer = require('puppeteer');
const path = require('path');
const assert = require('assert');

async function testAdeInBrowser() {
    console.log('=== RUNNING PUPPETEER BROWSER RUNTIME VERIFICATION FOR TELETERM ADE ===\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const consoleLogs = [];
    page.on('console', msg => consoleLogs.push(`[Browser] ${msg.text()}`));
    page.on('pageerror', err => console.error('[Browser Error]', err));

    console.log('1. Navigating to http://localhost:4000/ade...');
    await page.goto('http://localhost:4000/ade', { waitUntil: 'networkidle2', timeout: 15000 });

    console.log('2. Verifying DOM Elements...');
    await page.waitForSelector('#ade-app', { timeout: 5000 });
    await page.waitForSelector('#workspace-name', { timeout: 5000 });

    const wsName = await page.$eval('#workspace-name', el => el.textContent);
    console.log(`  ✓ Workspace name displayed: "${wsName}"`);

    // Wait for file tree
    await page.waitForSelector('.tree-item', { timeout: 8000 });
    const treeCount = await page.$$eval('.tree-item', els => els.length);
    console.log(`  ✓ File tree populated with ${treeCount} visible entries`);
    assert.ok(treeCount > 0, 'Expected file tree to have entries');

    // Wait for Monaco Editor host
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
    console.log('  ✓ Monaco Editor initialized and active');

    // Wait for Terminal xterm
    await page.waitForSelector('.xterm-screen', { timeout: 8000 });
    console.log('  ✓ ConPTY xterm.js terminal dock initialized and rendering');

    // Test Quick Context Chip (+ @git)
    console.log('3. Testing Context Engine Quick Chip (+ @git)...');
    await page.click('[data-type="git"]');
    await page.waitForSelector('.ctx-pill', { timeout: 3000 });
    const pillText = await page.$eval('.ctx-pill', el => el.textContent);
    console.log(`  ✓ Context Pill created in tray: "${pillText.trim()}"`);

    // Take screenshot of ADE
    const screenshotPath = path.join(__dirname, 'test_ade_runtime.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  ✓ Screenshot captured: ${screenshotPath}`);

    await browser.close();
    console.log('\n=== PUPPETEER RUNTIME VERIFICATION COMPLETED SUCCESSFULLY! ===');
}

testAdeInBrowser().catch(err => {
    console.error('Puppeteer verification failed:', err);
    process.exit(1);
});
