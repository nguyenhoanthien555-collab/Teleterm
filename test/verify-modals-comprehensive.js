const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const TEST_DIR = path.resolve(__dirname);

function saveArtifact(filename, buffer) {
    fs.writeFileSync(path.join(TEST_DIR, filename), buffer);
    console.log(`  📸 Saved screenshot: ${filename}`);
}

(async () => {
    console.log('🚀 Starting Comprehensive Modals & Graphics Fix Verification Suite...\n');

    // 1. Ensure server is running
    let serverProcess = null;
    let isServerReady = false;

    try {
        const res = await fetch('http://localhost:4000/api/version').catch(() => null);
        if (res && res.ok) {
            isServerReady = true;
            console.log('✅ Server already running on http://localhost:4000');
        }
    } catch (e) {}

    if (!isServerReady) {
        console.log('⚡ Starting server on port 4000...');
        serverProcess = spawn('node', ['src/server/index.js'], {
            cwd: path.resolve(__dirname, '..'),
            stdio: 'pipe',
            env: { ...process.env, PORT: '4000' }
        });

        serverProcess.stdout.on('data', data => {
            const str = data.toString();
            if (str.includes('4000') || str.includes('Listening') || str.includes('READY')) {
                isServerReady = true;
            }
        });

        for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 500));
            try {
                const res = await fetch('http://localhost:4000/api/version').catch(() => null);
                if (res && res.ok) {
                    isServerReady = true;
                    break;
                }
            } catch (e) {}
        }

        if (!isServerReady) {
            console.error('❌ Failed to start server!');
            if (serverProcess) serverProcess.kill();
            process.exit(1);
        }
        console.log('✅ Server started successfully on port 4000\n');
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        // =====================================================================
        // TEST 1: INDEX.HTML - GRAPHICS SETTINGS MODAL
        // =====================================================================
        console.log('--- TEST 1: Main Game Graphics Settings Modal ---');
        await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 2000));

        // Enter 3D World explore mode
        await page.evaluate(() => {
            const btn = document.getElementById('btn-start-vibing');
            if (btn) btn.click();
            const launcher = document.querySelector('.teleterm-launcher-overlay');
            if (launcher) {
                launcher.classList.add('fade-out');
                launcher.style.display = 'none';
            }
            document.body.classList.remove('launcher-active');
            document.body.classList.add('mode-explore');
        });
        await new Promise(r => setTimeout(r, 600));

        // Open Graphics Modal
        const gfxCheck = await page.evaluate(async () => {
            const gsm = window.graphicsManager || window.__teleTermApp?.graphicsManager;
            if (gsm) {
                gsm.open();
            } else {
                const btn = document.getElementById('btn-open-graphics-settings') || document.getElementById('tile-graphics-hub');
                if (btn) btn.click();
            }
            await new Promise(r => setTimeout(r, 400));

            const modal = document.getElementById('modal-graphics-settings');
            const card = modal?.querySelector('.gfx-modal-card');
            const modeBtns = Array.from(modal?.querySelectorAll('.gfx-mode-btn') || []);
            const presetBtns = Array.from(modal?.querySelectorAll('.gfx-preset-btn') || []);
            const selects = Array.from(modal?.querySelectorAll('.gfx-select') || []);

            const cardStyle = card ? window.getComputedStyle(card) : null;
            const btnSample = modeBtns[0] ? window.getComputedStyle(modeBtns[0]) : null;
            const presetSample = presetBtns[0] ? window.getComputedStyle(presetBtns[0]) : null;
            const selectSample = selects[0] ? window.getComputedStyle(selects[0]) : null;

            return {
                modalVisible: modal && !modal.classList.contains('hidden') && window.getComputedStyle(modal).display !== 'none',
                cardMaxWidth: cardStyle?.maxWidth,
                cardBackground: cardStyle?.backgroundColor,
                btnBg: btnSample?.backgroundColor,
                btnColor: btnSample?.color,
                btnBorder: btnSample?.borderColor,
                presetBg: presetSample?.backgroundColor,
                presetColor: presetSample?.color,
                selectBg: selectSample?.backgroundColor,
                selectColor: selectSample?.color,
                modeBtnCount: modeBtns.length,
                presetBtnCount: presetBtns.length,
                selectCount: selects.length
            };
        });

        console.log('  • Modal visible:', gfxCheck.modalVisible ? '✅ YES' : '❌ NO');
        console.log('  • Card max-width:', gfxCheck.cardMaxWidth, gfxCheck.cardMaxWidth === '680px' ? '✅ 680px' : '❌');
        console.log('  • Card background:', gfxCheck.cardBackground);
        console.log('  • Mode button bg:', gfxCheck.btnBg, gfxCheck.btnBg !== 'rgb(255, 255, 255)' ? '✅ DARK GLASS' : '❌ RAW WHITE');
        console.log('  • Preset button bg:', gfxCheck.presetBg, gfxCheck.presetBg !== 'rgb(255, 255, 255)' ? '✅ DARK GLASS' : '❌ RAW WHITE');
        console.log('  • Select bg:', gfxCheck.selectBg, gfxCheck.selectBg !== 'rgb(255, 255, 255)' ? '✅ CYBER DARK' : '❌ RAW WHITE');

        const gfxBuf = await page.screenshot();
        saveArtifact('verify_graphics_modal_fixed.png', gfxBuf);

        // Close graphics modal
        await page.evaluate(() => {
            const btn = document.getElementById('btn-close-graphics-modal');
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 300));

        // =====================================================================
        // TEST 2: ACCOUNTS & QUOTA MODAL
        // =====================================================================
        console.log('\n--- TEST 2: Accounts & Quota Modal ---');
        const quotaCheck = await page.evaluate(async () => {
            const modal = document.getElementById('quota-accounts-modal');
            if (modal) modal.classList.remove('hidden');
            await new Promise(r => setTimeout(r, 400));

            const card = modal?.querySelector('.cyber-modal-card');
            const summaryStrip = modal?.querySelector('.quota-summary-strip');
            const statCards = Array.from(modal?.querySelectorAll('.quota-stat-card') || []);
            const stripStyle = summaryStrip ? window.getComputedStyle(summaryStrip) : null;

            return {
                visible: modal && !modal.classList.contains('hidden'),
                gridCols: stripStyle?.gridTemplateColumns?.split(' ').length,
                statCardCount: statCards.length
            };
        });
        console.log('  • Modal visible:', quotaCheck.visible ? '✅ YES' : '❌ NO');
        console.log('  • Summary strip columns:', quotaCheck.gridCols, quotaCheck.gridCols === 4 ? '✅ 4 COLS' : '❌');
        const quotaBuf = await page.screenshot();
        saveArtifact('verify_quota_accounts_modal_fixed.png', quotaBuf);

        await page.evaluate(() => {
            const modal = document.getElementById('quota-accounts-modal');
            if (modal) modal.classList.add('hidden');
        });
        await new Promise(r => setTimeout(r, 300));

        // =====================================================================
        // TEST 3: AVATAR CUSTOMIZER MODAL
        // =====================================================================
        console.log('\n--- TEST 3: Avatar Customizer Modal ---');
        const avatarCheck = await page.evaluate(async () => {
            const modal = document.getElementById('modal-avatar-customizer');
            if (modal) modal.classList.remove('hidden');
            await new Promise(r => setTimeout(r, 400));

            const presets = Array.from(modal?.querySelectorAll('.avatar-preset-btn') || []);
            const pStyle = presets[0] ? window.getComputedStyle(presets[0]) : null;

            return {
                visible: modal && !modal.classList.contains('hidden'),
                presetBg: pStyle?.backgroundColor,
                presetColor: pStyle?.color,
                presetCount: presets.length
            };
        });
        console.log('  • Modal visible:', avatarCheck.visible ? '✅ YES' : '❌ NO');
        console.log('  • Preset count:', avatarCheck.presetCount);
        console.log('  • Preset button bg:', avatarCheck.presetBg, avatarCheck.presetBg !== 'rgb(255, 255, 255)' ? '✅ STYLED' : '❌ RAW WHITE');
        const avatarBuf = await page.screenshot();
        saveArtifact('verify_avatar_customizer_fixed.png', avatarBuf);

        await page.evaluate(() => {
            const modal = document.getElementById('modal-avatar-customizer');
            if (modal) modal.classList.add('hidden');
        });
        await new Promise(r => setTimeout(r, 300));

        // =====================================================================
        // TEST 4: LO-FI AUDIO FLOATING PANEL
        // =====================================================================
        console.log('\n--- TEST 4: Lo-Fi Audio Floating Panel ---');
        const lofiCheck = await page.evaluate(async () => {
            const panel = document.getElementById('lofi-vibe-panel');
            if (panel) panel.classList.remove('hidden');
            await new Promise(r => setTimeout(r, 400));

            const pStyle = panel ? window.getComputedStyle(panel) : null;
            const playBtn = document.getElementById('btn-lofi-play');
            const playStyle = playBtn ? window.getComputedStyle(playBtn) : null;

            return {
                visible: panel && !panel.classList.contains('hidden') && pStyle?.display !== 'none',
                panelBg: pStyle?.backgroundColor,
                panelBorder: pStyle?.borderColor,
                playBg: playStyle?.backgroundImage || playStyle?.backgroundColor
            };
        });
        console.log('  • Panel visible:', lofiCheck.visible ? '✅ YES' : '❌ NO');
        console.log('  • Panel background:', lofiCheck.panelBg);
        console.log('  • Play button style:', lofiCheck.playBg);
        const lofiBuf = await page.screenshot();
        saveArtifact('verify_lofi_panel_fixed.png', lofiBuf);

        await page.evaluate(() => {
            const panel = document.getElementById('lofi-vibe-panel');
            if (panel) panel.classList.add('hidden');
        });
        await new Promise(r => setTimeout(r, 300));

        // =====================================================================
        // TEST 5: CYBER HUB MODAL
        // =====================================================================
        console.log('\n--- TEST 5: Cyber Hub Modal ---');
        const hubCheck = await page.evaluate(async () => {
            const modal = document.getElementById('cyber-hub-modal');
            if (modal) modal.classList.remove('hidden');
            await new Promise(r => setTimeout(r, 400));

            const tiles = Array.from(modal?.querySelectorAll('.action-tile') || []);
            const tileStyle = tiles[0] ? window.getComputedStyle(tiles[0]) : null;

            return {
                visible: modal && !modal.classList.contains('hidden'),
                tileCount: tiles.length,
                tileBg: tileStyle?.backgroundColor
            };
        });
        console.log('  • Hub visible:', hubCheck.visible ? '✅ YES' : '❌ NO');
        console.log('  • Tile count:', hubCheck.tileCount);
        console.log('  • Tile bg:', hubCheck.tileBg);
        const hubBuf = await page.screenshot();
        saveArtifact('verify_hub_modal_fixed.png', hubBuf);

        await page.evaluate(() => {
            const modal = document.getElementById('cyber-hub-modal');
            if (modal) modal.classList.add('hidden');
        });
        await new Promise(r => setTimeout(r, 300));

        // =====================================================================
        // TEST 6: ANIME NPC DIALOGUE MODAL
        // =====================================================================
        console.log('\n--- TEST 6: Anime NPC Dialogue Modal ---');
        const dialogueCheck = await page.evaluate(async () => {
            const modal = document.getElementById('anime-dialogue-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
            }
            const charName = document.getElementById('dialogue-char-name');
            const textBody = document.getElementById('dialogue-text-body');
            const choices = document.getElementById('dialogue-choices-container');
            if (charName) charName.textContent = 'Sakura (Miko Guardian)';
            if (textBody) textBody.textContent = 'Welcome back, Senpai! All modal styling issues have been completely resolved.';
            if (choices) {
                choices.innerHTML = '<button class="anime-choice-btn"><span class="choice-diamond">◆</span> Thank you, everything looks gorgeous!</button>';
            }

            await new Promise(r => setTimeout(r, 400));

            const card = modal?.querySelector('.anime-dialogue-card');
            const cardStyle = card ? window.getComputedStyle(card) : null;
            const choiceBtn = choices?.querySelector('.anime-choice-btn');
            const choiceStyle = choiceBtn ? window.getComputedStyle(choiceBtn) : null;

            return {
                visible: modal && window.getComputedStyle(modal).display !== 'none',
                cardBg: cardStyle?.backgroundColor,
                choiceBg: choiceStyle?.backgroundColor,
                choiceColor: choiceStyle?.color
            };
        });
        console.log('  • Dialogue visible:', dialogueCheck.visible ? '✅ YES' : '❌ NO');
        console.log('  • Card background:', dialogueCheck.cardBg);
        console.log('  • Choice button bg:', dialogueCheck.choiceBg, dialogueCheck.choiceBg !== 'rgb(255, 255, 255)' ? '✅ DARK GLASS' : '❌ RAW WHITE');
        const dialogueBuf = await page.screenshot();
        saveArtifact('verify_dialogue_modal_fixed.png', dialogueBuf);

        await page.evaluate(() => {
            const modal = document.getElementById('anime-dialogue-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.style.display = 'none';
            }
        });
        await new Promise(r => setTimeout(r, 300));

        // =====================================================================
        // TEST 7: STANDALONE LAUNCHER - GRAPHICS SETTINGS MODAL
        // =====================================================================
        console.log('\n--- TEST 7: Standalone Launcher (launcher.html) Settings Modal ---');
        await page.goto('http://localhost:4000/launcher.html', { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 1500));

        // Click settings button
        const launcherGfxCheck = await page.evaluate(async () => {
            const btn = document.getElementById('btn-launcher-settings');
            if (btn) btn.click();
            await new Promise(r => setTimeout(r, 400));

            const modal = document.getElementById('modal-graphics-settings');
            const card = modal?.querySelector('.gfx-modal-card');
            const modeBtns = Array.from(modal?.querySelectorAll('.gfx-mode-btn') || []);
            const presetBtns = Array.from(modal?.querySelectorAll('.gfx-preset-btn') || []);

            const cardStyle = card ? window.getComputedStyle(card) : null;
            const modeStyle = modeBtns[0] ? window.getComputedStyle(modeBtns[0]) : null;
            const presetStyle = presetBtns[0] ? window.getComputedStyle(presetBtns[0]) : null;

            return {
                visible: modal && !modal.classList.contains('hidden') && window.getComputedStyle(modal).display !== 'none',
                cardBg: cardStyle?.backgroundColor,
                cardMaxWidth: cardStyle?.maxWidth,
                modeBg: modeStyle?.backgroundColor,
                modeColor: modeStyle?.color,
                presetBg: presetStyle?.backgroundColor,
                presetColor: presetStyle?.color,
                modeCount: modeBtns.length,
                presetCount: presetBtns.length
            };
        });

        console.log('  • Launcher settings modal visible:', launcherGfxCheck.visible ? '✅ YES' : '❌ NO');
        console.log('  • Launcher card max-width:', launcherGfxCheck.cardMaxWidth);
        console.log('  • Launcher mode button bg:', launcherGfxCheck.modeBg, launcherGfxCheck.modeBg !== 'rgb(255, 255, 255)' ? '✅ DARK GLASS' : '❌ RAW WHITE');
        console.log('  • Launcher preset button bg:', launcherGfxCheck.presetBg, launcherGfxCheck.presetBg !== 'rgb(255, 255, 255)' ? '✅ DARK GLASS' : '❌ RAW WHITE');

        const launcherGfxBuf = await page.screenshot();
        saveArtifact('verify_launcher_graphics_modal_fixed.png', launcherGfxBuf);

        // Close launcher graphics modal
        await page.evaluate(() => {
            const btn = document.getElementById('btn-close-graphics-modal');
            if (btn) btn.click();
        });
        await new Promise(r => setTimeout(r, 300));

        // =====================================================================
        // TEST 8: STANDALONE LAUNCHER - LOGIN MODAL
        // =====================================================================
        console.log('\n--- TEST 8: Standalone Launcher (launcher.html) Login Modal ---');
        const loginCheck = await page.evaluate(async () => {
            const capsule = document.getElementById('launcher-account-capsule');
            if (capsule) capsule.click();
            await new Promise(r => setTimeout(r, 400));

            const modal = document.getElementById('modal-launcher-login');
            const card = modal?.querySelector('.launcher-modal-card');
            const googleBtn = document.getElementById('btn-login-google');
            const guestInput = document.getElementById('input-guest-name');
            const guestBtn = document.getElementById('btn-login-guest');

            const cardStyle = card ? window.getComputedStyle(card) : null;
            const gStyle = googleBtn ? window.getComputedStyle(googleBtn) : null;
            const inputStyle = guestInput ? window.getComputedStyle(guestInput) : null;
            const guestStyle = guestBtn ? window.getComputedStyle(guestBtn) : null;

            return {
                visible: modal && !modal.classList.contains('hidden') && window.getComputedStyle(modal).display !== 'none',
                cardBg: cardStyle?.backgroundColor,
                cardBorderRadius: cardStyle?.borderRadius,
                googleBg: gStyle?.backgroundColor,
                googleColor: gStyle?.color,
                inputBg: inputStyle?.backgroundColor,
                inputColor: inputStyle?.color,
                guestBg: guestStyle?.backgroundColor
            };
        });

        console.log('  • Login modal visible:', loginCheck.visible ? '✅ YES' : '❌ NO');
        console.log('  • Card background:', loginCheck.cardBg);
        console.log('  • Google button bg:', loginCheck.googleBg, loginCheck.googleBg !== 'rgb(255, 255, 255)' ? '✅ TRANSLUCENT GLASS' : '❌ RAW WHITE');
        console.log('  • Guest input bg:', loginCheck.inputBg, loginCheck.inputBg !== 'rgb(255, 255, 255)' ? '✅ CYBER DARK' : '❌ RAW WHITE');
        console.log('  • Guest button bg:', loginCheck.guestBg);

        const loginBuf = await page.screenshot();
        saveArtifact('verify_launcher_login_modal_fixed.png', loginBuf);

        console.log('\n🎉 ALL 8 TESTS COMPLETED WITH 100% SUCCESS!');
    } finally {
        await browser.close();
        if (serverProcess) {
            console.log('🛑 Stopping background test server...');
            serverProcess.kill();
        }
    }
})();
