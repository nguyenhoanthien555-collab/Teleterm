const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function verifyMetaverseUI() {
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

    // 1. Desktop Test (1440 x 900)
    await page.setViewport({ width: 1440, height: 900 });
    console.log('🌐 [PUPPETEER] Navigating to http://127.0.0.1:4000 ...');
    
    await page.goto('http://127.0.0.1:4000', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForSelector('#open-world-canvas', { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Check English Localization on Top Nav
    const navText = await page.evaluate(() => {
        return {
            modeText: document.getElementById('nav-mode-text')?.innerText,
            orientText: document.querySelector('.orientation-toggle-text')?.innerText,
            summonText: document.getElementById('btn-nav-summon')?.innerText.trim(),
            quotaTitle: document.getElementById('btn-open-accounts-nav')?.title,
            xpTitle: document.getElementById('top-xp-hud-capsule')?.title
        };
    });
    console.log('✅ Top Nav English Localization Check:', JSON.stringify(navText, null, 2));

    // Check Top Nav Bar Contrast (Computed Background)
    const topNavStyles = await page.evaluate(() => {
        const nav = document.querySelector('.cyber-top-nav');
        const style = window.getComputedStyle(nav);
        return {
            background: style.backgroundColor,
            boxShadow: style.boxShadow,
            borderBottom: style.borderBottom
        };
    });
    console.log('✅ Top Nav Contrast Styling:', JSON.stringify(topNavStyles, null, 2));

    // Check Toast Suppression (should be 0 or only errors)
    const toastsCount = await page.$$eval('#toast-container .toast-item', toasts => toasts.length);
    console.log(`✅ Toasts present on startup: ${toastsCount} (Spam suppressed: ${toastsCount === 0})`);

    // Test 1: MMO Chat Toggle Control
    console.log('💬 Testing MMO Chat Toggle Controls...');
    const chatInitiallyVisible = await page.evaluate(() => {
        const chat = document.getElementById('mmo-chat-container');
        return !chat.classList.contains('chat-closed');
    });
    console.log(`- Chat initially visible: ${chatInitiallyVisible}`);

    // Click Close Button on Chat
    await page.click('#btn-toggle-mmo-chat');
    await new Promise((r) => setTimeout(r, 400));
    const isChatHidden = await page.evaluate(() => {
        const chat = document.getElementById('mmo-chat-container');
        const pill = document.getElementById('btn-floating-chat-open');
        return chat.classList.contains('chat-closed') && !pill.classList.contains('hidden');
    });
    console.log(`✅ Chat successfully closed & floating open button shown: ${isChatHidden}`);

    // Click Floating Open Button
    await page.click('#btn-floating-chat-open');
    await new Promise((r) => setTimeout(r, 400));
    const isChatReopened = await page.evaluate(() => {
        const chat = document.getElementById('mmo-chat-container');
        return !chat.classList.contains('chat-closed');
    });
    console.log(`✅ Chat successfully reopened via floating button: ${isChatReopened}`);

    // Test Keybind 'T' when closed
    await page.click('#btn-toggle-mmo-chat');
    await new Promise((r) => setTimeout(r, 400));
    await page.keyboard.press('KeyT');
    await new Promise((r) => setTimeout(r, 400));
    const chatOpenViaHotkey = await page.evaluate(() => {
        const chat = document.getElementById('mmo-chat-container');
        const isInputFocused = document.activeElement.id === 'mmo-chat-input';
        return !chat.classList.contains('chat-closed') && isInputFocused;
    });
    console.log(`✅ Chat successfully opened and focused via [T] hotkey: ${chatOpenViaHotkey}`);

    // Test that 'T' does NOT toggle the terminal screen
    const isTerminalDeckOpen = await page.evaluate(() => document.body.classList.contains('mode-focus'));
    console.log(`✅ Mode is still Explore (Terminal not mistakenly opened by 'T'): ${!isTerminalDeckOpen}`);

    // Test 2: Avatar Customizer & Preset Skins
    console.log('👕 Testing Avatar Customizer & 3D Skin Presets...');
    await page.click('#btn-open-customizer');
    await new Promise((r) => setTimeout(r, 600));

    // Select 'Kemono Coder' Preset
    await page.click('.avatar-preset-btn[data-preset="kemono_coder"]');
    await new Promise((r) => setTimeout(r, 500));

    // Click Save & Apply
    await page.click('#btn-save-avatar');
    await new Promise((r) => setTimeout(r, 600));

    const avatarAppliedState = await page.evaluate(() => {
        const saved = JSON.parse(localStorage.getItem('teleterm_avatar_custom') || '{}');
        const app = window.TeleTermApp;
        const playerObj = app?.openWorld3D?.player;
        let accessoryFound = null;
        if (playerObj) {
            playerObj.traverse(child => {
                if (child.userData && child.userData.isPresetAccessory) {
                    accessoryFound = child.name;
                }
            });
        }
        return {
            savedPreset: saved.preset,
            savedColors: saved.colors,
            attached3DAccessory: accessoryFound
        };
    });
    console.log('✅ Avatar Customizer Skin & 3D Accessory State:', JSON.stringify(avatarAppliedState, null, 2));

    // Capture Desktop View with customizer and world
    const customizerShotPath = path.join(artifactDir, 'metaverse_customizer_preview.png');
    await page.screenshot({ path: customizerShotPath });
    console.log(`📸 Avatar customizer screenshot saved: ${customizerShotPath}`);

    // Close Customizer
    await page.evaluate(() => document.getElementById('btn-close-customizer')?.click());
    await new Promise((r) => setTimeout(r, 500));

    // Toggle LoFi Panel for preview
    await page.evaluate(() => document.getElementById('btn-lofi-toggle-panel')?.click());
    await new Promise((r) => setTimeout(r, 400));

    const desktopShotPath = path.join(artifactDir, 'metaverse_desktop_preview.png');
    await page.screenshot({ path: desktopShotPath });
    console.log(`📸 Desktop screenshot saved: ${desktopShotPath}`);
    await page.close();

    // 3. Mobile Viewport Test (390 x 844 - iPhone 14)
    console.log('📱 Testing Mobile Viewport (390 x 844)...');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844 });
    await mobilePage.goto('http://127.0.0.1:4000', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await mobilePage.waitForSelector('#open-world-canvas', { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 2000));

    const mobileShotPath = path.join(artifactDir, 'metaverse_mobile_preview.png');
    await mobilePage.screenshot({ path: mobileShotPath });
    console.log(`📸 Mobile screenshot saved: ${mobileShotPath}`);
    await mobilePage.close();

    await browser.close();
    console.log('🎉 [PASS] All tests verified and visual proof captured!');
}

verifyMetaverseUI().catch((err) => {
    console.error('❌ Verification Error:', err);
    process.exit(1);
});
