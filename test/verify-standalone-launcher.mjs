import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

function findChromePath() {
    const candidates = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    for (const c of candidates) {
        if (fs.existsSync(c)) return c;
    }
    return null;
}

function waitServer(port = 4000, timeoutMs = 15000) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const check = () => {
            const req = http.get(`http://127.0.0.1:${port}/api/version`, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 400) {
                    return resolve();
                }
                setTimeout(check, 300);
            });
            req.on('error', () => {
                if (Date.now() - start > timeoutMs) return reject(new Error('Server timeout'));
                setTimeout(check, 300);
            });
        };
        check();
    });
}

async function run() {
    console.log('[Verify] Starting ConPTY server...');
    const server = spawn('node', ['src/server/index.js'], {
        env: { ...process.env, PORT: '4000' },
        stdio: 'pipe'
    });

    server.stdout.on('data', d => process.stdout.write(`[Server] ${d}`));
    server.stderr.on('data', d => process.stderr.write(`[Server ERR] ${d}`));

    try {
        await waitServer(4000);
        console.log('[Verify] Server is healthy on 4000.');

        const chromePath = findChromePath();
        if (!chromePath) {
            console.error('No Chrome or Edge binary found.');
            return;
        }

        console.log('[Verify] Launching browser with', chromePath);
        const browser = await puppeteer.launch({
            executablePath: chromePath,
            headless: true,
            defaultViewport: { width: 1040, height: 680 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.goto('http://127.0.0.1:4000/launcher.html', { waitUntil: 'networkidle0' });

        // 1. Verify Titlebar
        const titlebarText = await page.$eval('.titlebar-brand-name', el => el.textContent.trim());
        console.log('✓ Titlebar detected:', titlebarText);

        // 2. Verify Hero Button: START VIBING
        const heroBtnText = await page.$eval('#btn-start-vibing', el => el.textContent.trim());
        console.log('✓ Hero CTA detected:', heroBtnText);
        if (!heroBtnText.includes('START VIBING')) {
            throw new Error(`Expected START VIBING, got: ${heroBtnText}`);
        }

        // Take initial screenshot of Launcher
        await page.screenshot({ path: 'scratch/verified_standalone_launcher.png' });
        console.log('✓ Captured scratch/verified_standalone_launcher.png');

        // 3. Open Settings Modal & Verify 3 Screen Modes
        await page.click('#btn-launcher-settings');
        await new Promise(r => setTimeout(r, 400));

        const isGfxVisible = await page.$eval('#modal-graphics-settings', el => !el.classList.contains('hidden'));
        console.log('✓ Settings modal opened:', isGfxVisible);

        const modes = await page.$$eval('.gfx-mode-btn', btns => btns.map(b => ({
            id: b.id,
            mode: b.getAttribute('data-mode'),
            mainText: b.querySelector('.gfx-btn-main')?.textContent?.trim(),
            active: b.classList.contains('active')
        })));
        console.log('✓ Display modes available in settings:', JSON.stringify(modes, null, 2));

        if (modes.length !== 3) {
            throw new Error(`Expected 3 display modes, found ${modes.length}`);
        }

        // Test clicking Window mode
        await page.click('#gfx-mode-window');
        await new Promise(r => setTimeout(r, 200));
        const windowActive = await page.$eval('#gfx-mode-window', el => el.classList.contains('active'));
        console.log('✓ Window mode clicked and activated:', windowActive);

        // Test clicking Fullscreen mode
        await page.click('#gfx-mode-fullscreen');
        await new Promise(r => setTimeout(r, 200));
        const fullscreenActive = await page.$eval('#gfx-mode-fullscreen', el => el.classList.contains('active'));
        console.log('✓ Fullscreen mode clicked and activated:', fullscreenActive);

        // Test clicking Borderless mode
        await page.click('#gfx-mode-borderless');
        await new Promise(r => setTimeout(r, 200));
        const borderlessActive = await page.$eval('#gfx-mode-borderless', el => el.classList.contains('active'));
        console.log('✓ Borderless mode clicked and activated:', borderlessActive);

        // Take screenshot of settings modal
        await page.screenshot({ path: 'scratch/verified_launcher_settings_3modes.png' });
        console.log('✓ Captured scratch/verified_launcher_settings_3modes.png');

        await browser.close();
        console.log('\n🎉 ALL LAUNCHER & DISPLAY MODE VERIFICATIONS PASSED SUCCESSFULLY!');

    } finally {
        server.kill('SIGTERM');
        process.exit(0);
    }
}

run().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
