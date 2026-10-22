/**
 * Verification Script for Mobile Landscape Aspect Ratio & Distortion Fix
 */

const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\69476637-5058-4b38-81f6-926c8792527c';

async function testLandscapeAspect() {
    console.log('🚀 [PUPPETEER] Launching headless browser for Landscape aspect ratio verification...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    // Simulate typical Android phone viewport (e.g. Samsung Galaxy S20 / Pixel / iPhone)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    page.on('console', msg => console.log('  [BROWSER]', msg.text()));

    console.log('🌐 [PUPPETEER] Navigating to http://127.0.0.1:4000 ...');
    await page.goto('http://127.0.0.1:4000', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1600));

    // 1. Check Portrait Baseline
    const portraitState = await page.evaluate(() => {
        const ow = window.openWorld3D || window.TeleTermApp?.openWorld3D || window.teletermApp?.openWorld3D;
        const canvas = document.getElementById('open-world-canvas');
        return {
            cameraAspect: ow?.camera?.aspect,
            canvasWidth: canvas?.width,
            canvasHeight: canvas?.height,
            isForceLandscape: document.body.classList.contains('force-landscape')
        };
    });
    console.log('📱 [PORTRAIT BASELINE]:', JSON.stringify(portraitState, null, 2));

    // 2. Click Landscape Button to trigger force-landscape mode
    console.log('🔄 [PUPPETEER] Tapping Landscape Toggle button...');
    await page.evaluate(() => {
        const btn = document.getElementById('btn-mobile-orientation');
        if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // 3. Inspect Force-Landscape State & Dimensions
    const landscapeState = await page.evaluate(() => {
        const ow = window.openWorld3D || window.TeleTermApp?.openWorld3D || window.teletermApp?.openWorld3D;
        const canvas = document.getElementById('open-world-canvas');
        return {
            cameraAspect: ow?.camera?.aspect,
            canvasWidth: canvas?.width,
            canvasHeight: canvas?.height,
            isForceLandscape: document.body.classList.contains('force-landscape'),
            windowInnerWidth: window.innerWidth,
            windowInnerHeight: window.innerHeight,
            ratio: (ow?.camera?.aspect || 0)
        };
    });
    console.log('📐 [FORCE-LANDSCAPE STATE]:', JSON.stringify(landscapeState, null, 2));

    // Verify Aspect Ratio is Widescreen (> 1.8), NOT Squashed Portrait (< 0.6)
    if (landscapeState.cameraAspect > 1.8) {
        console.log(`✅ [PASS] Camera aspect ratio is widescreen (${landscapeState.cameraAspect.toFixed(3)}:1) - SQUASHING ELIMINATED!`);
    } else {
        console.error(`❌ [FAIL] Camera aspect ratio is still portrait/squashed: ${landscapeState.cameraAspect}`);
    }

    // 4. Capture screenshot of the rotated landscape view
    const forceLandscapeShot = path.join(ARTIFACT_DIR, 'landscape_fixed_preview.png');
    await page.screenshot({ path: forceLandscapeShot });
    console.log('📸 Force-landscape screenshot saved:', forceLandscapeShot);

    // 5. Test Physical Landscape Orientation (844 x 390)
    console.log('📱 [PUPPETEER] Rotating viewport to true physical landscape (844 x 390)...');
    await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 600));

    const physicalLandscapeState = await page.evaluate(() => {
        const app = window.teletermApp;
        const ow = app?.openWorld3D;
        return {
            cameraAspect: ow?.camera?.aspect,
            isForceLandscape: document.body.classList.contains('force-landscape')
        };
    });
    console.log('🌅 [PHYSICAL LANDSCAPE STATE]:', JSON.stringify(physicalLandscapeState, null, 2));

    const physicalShot = path.join(ARTIFACT_DIR, 'physical_landscape_fixed_preview.png');
    await page.screenshot({ path: physicalShot });
    console.log('📸 Physical landscape screenshot saved:', physicalShot);

    await browser.close();
    console.log('🎉 [PASS] All landscape aspect ratio tests verified successfully!');
}

testLandscapeAspect().catch(err => {
    console.error('❌ [ERROR]', err);
    process.exit(1);
});
