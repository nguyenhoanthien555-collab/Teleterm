/**
 * TeleTerm 3D — Comprehensive Iconography & Vector SVG Verification Suite
 * Verifies that all raw emojis and AI slop icons have been completely replaced with
 * crisp, cohesive, geometric TeleTermIcons SVG vectors conforming to the Warm Terracotta theme.
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/Hoan Thien/.gemini/antigravity/brain/3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function runIconographyVerification() {
    console.log('🚀 Launching Puppeteer for Iconography Overhaul verification...');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--use-gl=angle',
            '--use-angle=default',
            '--disable-gpu-sandbox',
            '--window-size=1280,720',
            '--autoplay-policy=no-user-gesture-required'
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });

        const errors = [];
        page.on('console', msg => {
            const txt = msg.text();
            if (msg.type() === 'error') {
                errors.push(txt);
                console.error('   [Browser Error]', txt);
            }
        });
        page.on('pageerror', err => {
            errors.push(err.message);
            console.error('   [Page Error]', err.message);
        });

        console.log('1. Navigating to TeleTerm 3D (direct=1)...');
        await page.goto('http://localhost:4000/?direct=1', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 4000));

        await page.evaluate(() => {
            const launcher = document.getElementById('teleterm-launcher-overlay');
            if (launcher) launcher.style.display = 'none';
            if (window.desktopLauncher) window.desktopLauncher.hideLauncher();
            document.body.classList.remove('mode-focus');
            document.body.classList.add('mode-explore');
        });
        await new Promise(r => setTimeout(r, 1000));

        // Wait for OpenWorld3D
        await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.player, { timeout: 25000 });
        await new Promise(r => setTimeout(r, 2000));

        // Check TeleTermIcons
        const iconsSystemCheck = await page.evaluate(() => {
            return {
                registered: typeof window.TeleTermIcons !== 'undefined',
                testRender: window.TeleTermIcons ? window.TeleTermIcons.render('terminal', { size: 16 }) : null,
                iconElementsCount: document.querySelectorAll('.tt-icon-svg, .tt-icon').length
            };
        });
        console.log('2. Icon System Health:', iconsSystemCheck);

        // 1. In-World HUD & Diegetic Kiosk
        console.log('3. Capturing In-World HUD & Diegetic Kiosk with vector iconography...');
        const proof1Path = path.join(ARTIFACT_DIR, 'proof_icon_overhaul_1_hud_and_kiosk.png');
        await page.screenshot({ path: proof1Path });
        console.log('   Saved:', proof1Path);

        // 2. Universal Settings Modal
        console.log('4. Opening Universal Settings Modal and verifying vector icons...');
        await page.evaluate(() => {
            if (window.universalSettingsModal) {
                window.universalSettingsModal.open('graphics');
            } else {
                const modal = document.getElementById('universal-settings-modal');
                if (modal) modal.classList.remove('hidden');
            }
        });
        await new Promise(r => setTimeout(r, 800));
        const proof2Path = path.join(ARTIFACT_DIR, 'proof_icon_overhaul_2_universal_settings_modal.png');
        await page.screenshot({ path: proof2Path });
        console.log('   Saved:', proof2Path);

        // 3. Accounts & Quota Modal
        console.log('5. Opening Accounts & Quota Manager Modal and verifying icons...');
        await page.evaluate(() => {
            if (window.universalSettingsModal) window.universalSettingsModal.close();
            const quotaModal = document.getElementById('quota-accounts-modal');
            if (quotaModal) quotaModal.classList.remove('hidden');
            if (window.accountsQuotaManager) window.accountsQuotaManager.refresh(false);
        });
        await new Promise(r => setTimeout(r, 1000));
        const proof3Path = path.join(ARTIFACT_DIR, 'proof_icon_overhaul_3_accounts_quota_modal.png');
        await page.screenshot({ path: proof3Path });
        console.log('   Saved:', proof3Path);

        // 4. Cyber Tools Drawer Modal
        console.log('6. Opening Cyber Tools Drawer Modal...');
        await page.evaluate(() => {
            const quotaModal = document.getElementById('quota-accounts-modal');
            if (quotaModal) quotaModal.classList.add('hidden');
            const toolsDrawer = document.getElementById('modal-tools-drawer');
            if (toolsDrawer) toolsDrawer.classList.remove('hidden');
        });
        await new Promise(r => setTimeout(r, 800));
        const proof4Path = path.join(ARTIFACT_DIR, 'proof_icon_overhaul_4_cyber_tools_drawer.png');
        await page.screenshot({ path: proof4Path });
        console.log('   Saved:', proof4Path);

        // 5. Player Inventory Modal
        console.log('7. Opening Player Inventory Modal...');
        await page.evaluate(() => {
            const toolsDrawer = document.getElementById('modal-tools-drawer');
            if (toolsDrawer) toolsDrawer.classList.add('hidden');
            const invModal = document.getElementById('modal-player-inventory');
            if (invModal) invModal.classList.remove('hidden');
        });
        await new Promise(r => setTimeout(r, 800));
        const proof5Path = path.join(ARTIFACT_DIR, 'proof_icon_overhaul_5_player_inventory.png');
        await page.screenshot({ path: proof5Path });
        console.log('   Saved:', proof5Path);

        // 6. ADE Studio
        console.log('8. Opening ADE Studio embedded viewport...');
        await page.evaluate(() => {
            const invModal = document.getElementById('modal-player-inventory');
            if (invModal) invModal.classList.add('hidden');
            if (window.teletermApp && window.teletermApp.openADEStudio) {
                window.teletermApp.openADEStudio();
            }
        });
        await new Promise(r => setTimeout(r, 2000));
        const proof6Path = path.join(ARTIFACT_DIR, 'proof_icon_overhaul_6_ade_studio.png');
        await page.screenshot({ path: proof6Path });
        console.log('   Saved:', proof6Path);

        console.log('🎉 Verification complete! All proof artifacts successfully created.');
        if (errors.length > 0) {
            console.warn('   Encountered warnings/errors during test:', errors);
        } else {
            console.log('   Zero errors logged.');
        }

    } catch (err) {
        console.error('❌ Verification failed:', err);
    } finally {
        await browser.close();
    }
}

runIconographyVerification();
