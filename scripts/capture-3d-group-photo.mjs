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
                    return resolve(true);
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
    console.log('[Capture] Checking server on 4000...');
    let server = null;
    try {
        await waitServer(4000, 1000);
        console.log('[Capture] Server already running.');
    } catch (e) {
        console.log('[Capture] Spawning server...');
        server = spawn('node', ['src/server/index.js'], {
            env: { ...process.env, PORT: '4000' },
            stdio: 'pipe'
        });
        await waitServer(4000, 15000);
    }

    const chromePath = findChromePath();
    if (!chromePath) {
        console.error('No Chrome/Edge path found.');
        process.exit(1);
    }

    console.log('[Capture] Launching Chrome with GPU / WebGL enabled...');
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1.0 },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--enable-webgl',
            '--ignore-gpu-blocklist',
            '--use-gl=angle'
        ]
    });

    const page = await browser.newPage();
    page.on('console', msg => console.log('  [Studio Console]', msg.text()));

    console.log('[Capture] Navigating to http://127.0.0.1:4000/group-photo-studio.html ...');
    await page.goto('http://127.0.0.1:4000/group-photo-studio.html', { waitUntil: 'domcontentloaded' });

    console.log('[Capture] Waiting for 3D anime models to load and render (__photoSceneReady)...');
    await page.waitForFunction(() => window.__photoSceneReady === true, { timeout: 45000 });
    console.log('✓ 3D Photo Scene successfully staged and rendered!');

    // Hide status HUD
    await page.evaluate(() => {
        const hud = document.getElementById('status-hud');
        if (hud) hud.style.display = 'none';
    });

    // Wait a brief moment for smooth render settlement
    await new Promise(r => setTimeout(r, 1200));

    // Capture screenshot
    const outPath = 'public/anime-world-preview.png';
    const scratchPath = 'scratch/actual_in_game_3d_group_photo.png';

    await page.screenshot({ path: outPath, type: 'png' });
    await page.screenshot({ path: scratchPath, type: 'png' });
    console.log(`✓ Saved 3D in-game group photo to ${outPath} and ${scratchPath}!`);

    await browser.close();
    if (server) server.kill('SIGTERM');
    process.exit(0);
}

run().catch(err => {
    console.error('Capture failed:', err);
    process.exit(1);
});
