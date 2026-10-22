const puppeteer = require('puppeteer');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

async function testInteractiveFlow() {
    console.log('=== RUNNING INTERACTIVE AGENT & VERIFICATION FLOW TEST ===\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => console.log(`[Browser Console] ${msg.text()}`));
    page.on('pageerror', err => console.error('[Browser Error]', err));

    console.log('1. Navigating to ADE...');
    await page.goto('http://localhost:4000/ade', { waitUntil: 'networkidle2' });

    await page.waitForSelector('#agent-prompt-input');
    await page.waitForSelector('#btn-agent-send');
    await page.waitForFunction(() => {
        const el = document.getElementById('topbar-conn-status');
        return el && el.textContent.includes('Live');
    }, { timeout: 10000 });
    console.log('  ✓ Live WebSocket connection established');

    // Ensure permission policy is reset to ASK_OUTSIDE_SCOPE for idempotent test run
    await page.select('#select-permission-policy', 'ASK_OUTSIDE_SCOPE');
    await page.$eval('#select-permission-policy', el => el.dispatchEvent(new Event('change')));
    await new Promise(r => setTimeout(r, 500));

    // 2. Submit prompt to edit a test file
    console.log('2. Sending prompt to Universal Agent to modify test_flow.txt...');
    const testFilePath = path.join(__dirname, '..', 'test_flow.txt');
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);

    await page.$eval('#agent-prompt-input', el => {
        el.value = 'edit test_flow.txt with content:\nInteractive ADE Flow Verified 100%';
    });
    await page.click('#btn-agent-send');

    // Wait for agent to process and complete
    console.log('3. Waiting for agent turn completion...');
    await page.waitForFunction(() => {
        const text = document.getElementById('agent-status-text');
        return text && text.textContent === 'COMPLETED';
    }, { timeout: 15000 });

    console.log('  ✓ Agent completed turn successfully');

    // Verify file on disk
    assert.ok(fs.existsSync(testFilePath), 'Expected test_flow.txt to be created on disk');
    const content = fs.readFileSync(testFilePath, 'utf8');
    assert.strictEqual(content, 'Interactive ADE Flow Verified 100%');
    console.log('  ✓ File written to disk accurately via Diff Authority & Workspace Filesystem');

    // Clean up test file
    fs.unlinkSync(testFilePath);

    // 4. Test Verification Engine invocation
    console.log('4. Testing Verification Engine via UI...');
    await page.click('#btn-run-tests');
    await page.waitForSelector('#verification-card.visible', { timeout: 15000 });

    const summary = await page.$eval('#verification-summary-text', el => el.textContent);
    console.log(`  ✓ Verification result card displayed: "${summary}"`);

    // 5. Test Permission Mode Switch to ASK_ALWAYS & Approval Flow
    console.log('5. Testing Permission Pause & Approval Flow...');
    await page.select('#select-permission-policy', 'ASK_ALWAYS');
    await page.$eval('#select-permission-policy', el => el.dispatchEvent(new Event('change')));
    await new Promise(r => setTimeout(r, 500));

    await page.$eval('#agent-prompt-input', el => {
        el.value = 'edit test_flow_perm.txt with content:\nApproved by human';
    });
    await page.click('#btn-agent-send');

    // Wait for Approval card to appear
    await page.waitForSelector('#approval-alert-card.visible', { timeout: 10000 });
    console.log('  ✓ Approval Alert Card appeared (Execution halted asynchronously)');

    // Click Approve button
    await page.click('#btn-approve-req');
    console.log('  ✓ Clicked Approve button');

    // Wait for agent to finish
    await page.waitForFunction(() => {
        const text = document.getElementById('agent-status-text');
        return text && text.textContent === 'COMPLETED';
    }, { timeout: 15000 });

    const permFilePath = path.join(__dirname, '..', 'test_flow_perm.txt');
    assert.ok(fs.existsSync(permFilePath), 'Expected test_flow_perm.txt to be created after approval');
    fs.unlinkSync(permFilePath);
    console.log('  ✓ Real execution resumed and file created after approval');

    // Restore permission policy to ASK_OUTSIDE_SCOPE
    await page.select('#select-permission-policy', 'ASK_OUTSIDE_SCOPE');
    await page.$eval('#select-permission-policy', el => el.dispatchEvent(new Event('change')));
    await new Promise(r => setTimeout(r, 500));

    // Capture final screenshot
    const shotPath = path.join(__dirname, 'test_ade_flow_verified.png');
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`  ✓ Final flow screenshot saved: ${shotPath}`);

    await browser.close();
    console.log('\n=== ALL INTERACTIVE FLOW VERIFICATIONS PASSED 100%! ===');
}

testInteractiveFlow().catch(err => {
    console.error('Interactive Flow Test Failed:', err);
    process.exit(1);
});
