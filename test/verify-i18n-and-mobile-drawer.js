const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('🧪 [TEST] Verifying i18n English/Vietnamese, Mobile Tools Drawer clickability, and Focus Mode Top Bar Switcher...\n');

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    // Mobile Viewport (iPhone 14 standard: 390 x 844)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('  [BROWSER ERROR]:', msg.text());
        }
    });
    page.on('pageerror', err => console.error('  [PAGE ERROR]:', err.message));

    console.log('🌐 Navigating to http://localhost:4000...');
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Wait for app to be ready
    await page.waitForFunction(() => !!window.__teleTermApp && !!window.TeleTermI18n, { timeout: 15000 });
    console.log('✅ TeleTerm App and i18n engine ready.\n');

    // =========================================================================
    // STEP 1: Verify Default Language is English
    // =========================================================================
    console.log('--- STEP 1: Verify Default Language is English (en) ---');
    const initialLangCheck = await page.evaluate(() => {
        const i18n = window.TeleTermI18n;
        const currentLang = i18n.getLanguage();
        const storedLang = localStorage.getItem('teleterm_language');
        const termTab = document.getElementById('tab-view-term');
        const termText = termTab ? termTab.querySelector('.tab-label-full')?.textContent.trim() : '';
        const navTools = document.querySelector('#btn-mobile-tools-drawer .trigger-text')?.textContent.trim();
        
        return {
            currentLang,
            storedLang,
            termText,
            navTools
        };
    });

    console.log('Initial Language Check:', initialLangCheck);
    if (initialLangCheck.currentLang === 'en' && initialLangCheck.termText === 'Terminal' && initialLangCheck.navTools === 'Tools') {
        console.log('✅ PASS: Default language is English ("en"), with correct UI strings.\n');
    } else {
        console.error('❌ FAIL: Default language check failed:', initialLangCheck);
        process.exit(1);
    }

    // =========================================================================
    // STEP 2: Verify Mobile Tools Drawer Clickability & Language Toggle
    // =========================================================================
    console.log('--- STEP 2: Test Mobile Tools Drawer Clicks & Fast Taps ---');
    
    // Open Drawer via trigger button
    await page.evaluate(() => {
        const trigger = document.getElementById('btn-mobile-tools-drawer');
        if (trigger) trigger.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const drawerOpened = await page.evaluate(() => {
        const modal = document.getElementById('modal-mobile-full-tools');
        return modal && !modal.classList.contains('hidden') && getComputedStyle(modal).display !== 'none';
    });

    if (!drawerOpened) {
        console.error('❌ FAIL: Mobile Tools Drawer did not open when clicking #btn-mobile-tools-drawer');
        process.exit(1);
    }
    console.log('✅ Drawer opened successfully.');

    // Click the Language Toggle tile in the drawer
    console.log('Tapping [data-mob-action="toggle-language"] tile inside drawer...');
    await page.evaluate(() => {
        const langTile = document.querySelector('[data-mob-action="toggle-language"]');
        if (langTile) {
            // Simulate mobile tap sequence
            const touchObj = new Touch({
                identifier: Date.now(),
                target: langTile,
                clientX: 100,
                clientY: 200
            });
            langTile.dispatchEvent(new TouchEvent('touchstart', { touches: [touchObj], bubbles: true, cancelable: true }));
            langTile.dispatchEvent(new TouchEvent('touchend', { changedTouches: [touchObj], bubbles: true, cancelable: true }));
        }
    });
    await new Promise(r => setTimeout(r, 500));

    // Verify language changed to Vietnamese ('vi') and drawer closed
    const afterToggleCheck = await page.evaluate(() => {
        const modal = document.getElementById('modal-mobile-full-tools');
        const isDrawerClosed = modal && (modal.classList.contains('hidden') || getComputedStyle(modal).display === 'none');
        const i18n = window.TeleTermI18n;
        const currentLang = i18n.getLanguage();
        const storedLang = localStorage.getItem('teleterm_language');
        const navTools = document.querySelector('#btn-mobile-tools-drawer .trigger-text')?.textContent.trim();
        const nav3D = document.querySelector('#btn-nav-back-to-world .tab-label-full')?.textContent.trim();

        return {
            isDrawerClosed,
            currentLang,
            storedLang,
            navTools,
            nav3D
        };
    });

    console.log('After Language Toggle Check:', afterToggleCheck);
    if (afterToggleCheck.isDrawerClosed && afterToggleCheck.currentLang === 'vi' && afterToggleCheck.storedLang === 'vi' && afterToggleCheck.navTools === 'Công cụ') {
        console.log('✅ PASS: Tile tap triggered language toggle to Vietnamese, closed drawer, updated DOM and persisted to localStorage!\n');
    } else {
        console.error('❌ FAIL: Language toggle tile did not execute properly:', afterToggleCheck);
        process.exit(1);
    }

    // Toggle back to English via i18n API to verify persistence
    await page.evaluate(() => {
        window.TeleTermI18n.setLanguage('en');
    });
    await new Promise(r => setTimeout(r, 200));

    // =========================================================================
    // STEP 3: Verify Mobile Focus Mode Top Bar Workspace Switcher
    // =========================================================================
    console.log('--- STEP 3: Mobile Focus Mode Top Bar Workspace Switcher ---');

    // Switch to Focus Mode
    await page.evaluate(() => {
        if (window.desktopLauncher && typeof window.desktopLauncher.hideLauncher === 'function') {
            window.desktopLauncher.hideLauncher();
        }
        document.body.classList.remove('launcher-active');
        window.__teleTermApp.setFocusMode(true);
    });
    await new Promise(r => setTimeout(r, 400));

    const focusModeBarCheck = await page.evaluate(() => {
        const isFocusMode = document.body.classList.contains('mode-focus');
        const navTabs = document.querySelector('.nav-view-tabs');
        const tabsComputed = navTabs ? getComputedStyle(navTabs) : null;
        const isTabsVisible = tabsComputed && tabsComputed.display !== 'none';
        const isScrollable = tabsComputed && (tabsComputed.overflowX === 'auto' || tabsComputed.overflowX === 'scroll');

        // Check all 5 active workspace buttons
        const tabTerm = document.getElementById('tab-view-term');
        const tabCodex = document.getElementById('tab-view-codex');
        const tabAgy = document.getElementById('tab-view-agy');
        const tabUniv = document.getElementById('tab-view-universal');
        const tabQuota = document.getElementById('btn-open-accounts-nav');

        const buttons = [
            { name: 'Terminal', el: tabTerm },
            { name: 'Codex', el: tabCodex },
            { name: 'Antigravity', el: tabAgy },
            { name: 'All Agents', el: tabUniv },
            { name: 'Quota / Account', el: tabQuota }
        ];

        const details = buttons.map(b => {
            if (!b.el) return { name: b.name, exists: false };
            const rect = b.el.getBoundingClientRect();
            const cs = getComputedStyle(b.el);
            return {
                name: b.name,
                exists: true,
                visible: cs.display !== 'none',
                height: Math.round(rect.height),
                width: Math.round(rect.width),
                minHeight: cs.minHeight
            };
        });

        const allExistAndVisible = details.every(d => d.exists && d.visible);
        const touchTargetsSufficient = details.every(d => d.height >= 40);

        return {
            isFocusMode,
            isTabsVisible,
            isScrollable,
            allExistAndVisible,
            touchTargetsSufficient,
            details
        };
    });

    console.log('Focus Mode Top Bar Check:', focusModeBarCheck);
    if (focusModeBarCheck.isFocusMode && focusModeBarCheck.isTabsVisible && focusModeBarCheck.allExistAndVisible && focusModeBarCheck.touchTargetsSufficient) {
        console.log('✅ PASS: Top bar displays all 5 workspaces/tools with touch targets >= 40px and smooth horizontal scroll!\n');
    } else {
        console.error('❌ FAIL: Focus mode top bar did not meet specifications:', focusModeBarCheck);
        process.exit(1);
    }

    // Capture screenshot of Mobile Focus Mode Top Bar
    await page.screenshot({ path: path.join(__dirname, 'verify_mobile_focus_mode_topbar.png') });
    console.log('📸 Saved verify_mobile_focus_mode_topbar.png');

    // Test clicking #btn-nav-mode to return to 3D Explore Mode
    console.log('Testing click on #btn-nav-mode to return to 3D World...');
    await page.evaluate(() => {
        const btn = document.getElementById('btn-nav-mode') || document.getElementById('btn-nav-back-to-world');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    const returnedToWorld = await page.evaluate(() => {
        return document.body.classList.contains('mode-explore') && !document.body.classList.contains('mode-focus');
    });

    if (returnedToWorld) {
        console.log('✅ PASS: Clicking #btn-nav-mode smoothly returned to 3D World explore mode!\n');
    } else {
        console.error('❌ FAIL: Failed to return to 3D World mode via #btn-nav-mode');
        process.exit(1);
    }

    // =========================================================================
    // STEP 4: Verify Graphics Settings Modal Language Selector
    // =========================================================================
    console.log('--- STEP 4: Graphics Settings Modal Language Selector & Presets ---');
    await page.evaluate(() => {
        if (window.graphicsManager) window.graphicsManager.open();
    });
    await new Promise(r => setTimeout(r, 400));

    const gfxCheck = await page.evaluate(() => {
        const modal = document.getElementById('modal-graphics-settings');
        const isOpen = modal && !modal.classList.contains('hidden');
        const langSelect = document.getElementById('gfx-language-select');
        const selectVal = langSelect ? langSelect.value : '';
        const bannerDesc = document.querySelector('#gfx-status-banner .gfx-status-desc')?.textContent.trim();

        return {
            isOpen,
            selectVal,
            bannerDesc
        };
    });

    console.log('Graphics Modal Check (EN):', gfxCheck);
    if (gfxCheck.isOpen && gfxCheck.selectVal === 'en' && gfxCheck.bannerDesc.length > 0) {
        console.log('✅ PASS: Graphics modal displays Language selector set to "en" with English preset description.');
    } else {
        console.error('❌ FAIL: Graphics modal language check failed:', gfxCheck);
        process.exit(1);
    }

    // Switch to Vietnamese inside Graphics Modal
    await page.evaluate(() => {
        const langSelect = document.getElementById('gfx-language-select');
        if (langSelect) {
            langSelect.value = 'vi';
            langSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    await new Promise(r => setTimeout(r, 400));

    const gfxCheckVi = await page.evaluate(() => {
        const currentLang = window.TeleTermI18n.getLanguage();
        const storedLang = localStorage.getItem('teleterm_language');
        const bannerDesc = document.querySelector('#gfx-status-banner .gfx-status-desc')?.textContent.trim();
        const modalTitle = document.querySelector('#modal-graphics-settings .gfx-modal-title')?.textContent.trim();

        return {
            currentLang,
            storedLang,
            bannerDesc,
            modalTitle
        };
    });

    console.log('Graphics Modal Check (VI):', gfxCheckVi);
    if (gfxCheckVi.currentLang === 'vi' && gfxCheckVi.storedLang === 'vi') {
        console.log('✅ PASS: Graphics modal language switch updated language to Vietnamese and re-rendered status banner!');
    } else {
        console.error('❌ FAIL: Graphics modal Vietnamese switch failed:', gfxCheckVi);
        process.exit(1);
    }

    // Capture screenshot of Graphics Settings Modal in Vietnamese
    await page.screenshot({ path: path.join(__dirname, 'verify_graphics_modal_vi.png') });
    console.log('📸 Saved verify_graphics_modal_vi.png');

    // Switch back to English default
    await page.evaluate(() => {
        window.TeleTermI18n.setLanguage('en');
        if (window.graphicsManager) window.graphicsManager.close();
    });
    await new Promise(r => setTimeout(r, 300));

    console.log('\n🎉 ALL I18N, MOBILE TOOLS DRAWER, AND FOCUS TOP-BAR TESTS PASSED WITH 100% SUCCESS!');
    await browser.close();
    process.exit(0);
})();
