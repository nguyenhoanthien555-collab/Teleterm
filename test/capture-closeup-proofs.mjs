/**
 * CAPTURE HIGH FIDELITY CLOSE-UPS: FACE RIG & BIOMECHANICAL LOCOMOTION
 */

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTIFACT_DIR = 'C:/Users/Hoan Thien/.gemini/antigravity/brain/3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function captureCloseups() {
    console.log('📸 Launching Puppeteer for cinematic close-up proofs...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--use-gl=angle',
            '--use-angle=default'
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });

        await page.goto('http://localhost:4000?direct=1', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForFunction(() => !!window.openWorld3D?.retargeter?.faceRig && !!window.questTrackerHud, { timeout: 35000 });

        // 1. Cinematic Close-up of Avatar Face Rig (Blinking + Joy Expression)
        console.log('Capturing Face Rig Close-up...');
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            const retargeter = ow.retargeter;
            const faceRig = retargeter.faceRig;

            // Set joyful smile and slight eye squint
            faceRig.setMood('Joy', 0.95);
            faceRig.setMorph('Fcl_EYE_Joy', 0.75);
            faceRig.setMorph('Fcl_MTH_Fun', 0.85);
            faceRig.setMorph('Fcl_BRW_Joy', 0.60);

            // Frontal close-up camera at face level (yaw = 0 faces the front of character)
            ow.targetCameraDistance = 0.72;
            ow.cameraDistance = 0.72;
            ow.targetCameraRotation.yaw = 0.0;
            ow.cameraRotation.yaw = 0.0;
            ow.targetCameraRotation.pitch = 0.04;
            ow.cameraRotation.pitch = 0.04;
        });

        await new Promise(r => setTimeout(r, 600));
        await page.screenshot({
            path: path.join(ARTIFACT_DIR, 'proof_avatar_face_blinking_and_expression.png')
        });
        console.log('✓ Saved: proof_avatar_face_blinking_and_expression.png');

        // 2. Cinematic Close-up of Biomechanical Locomotion (Foot Roll & Knee Flexion)
        console.log('Capturing Locomotion Close-up...');
        await page.evaluate(() => {
            const ow = window.openWorld3D;
            const retargeter = ow.retargeter;

            retargeter.speedNorm = 0.85;
            retargeter.turnVelocity = 2.0;
            retargeter.locomotionPhase = 0.15; // Heel strike phase on Left Foot

            // Focus on feet & lower legs from dynamic front-side 3/4 angle
            ow.targetCameraDistance = 1.35;
            ow.cameraDistance = 1.35;
            ow.targetCameraRotation.yaw = -0.32;
            ow.cameraRotation.yaw = -0.32;
            ow.targetCameraRotation.pitch = -0.35;
            ow.cameraRotation.pitch = -0.35;
        });

        await new Promise(r => setTimeout(r, 600));
        await page.screenshot({
            path: path.join(ARTIFACT_DIR, 'proof_avatar_locomotion_foot_roll.png')
        });
        console.log('✓ Saved: proof_avatar_locomotion_foot_roll.png');

        // 3. Zoomed-in crop of Left-Docked Bookmark Tab
        console.log('Capturing Collapsed Bookmark HUD Crop...');
        await page.evaluate(() => {
            const hud = window.questTrackerHud;
            if (hud) hud.collapse();
            // Restore normal explore camera
            const ow = window.openWorld3D;
            ow.targetCameraDistance = 2.8;
            ow.cameraDistance = 2.8;
            ow.targetCameraRotation.yaw = 0.0;
            ow.cameraRotation.yaw = 0.0;
            ow.targetCameraRotation.pitch = 0.08;
            ow.cameraRotation.pitch = 0.08;
        });

        await new Promise(r => setTimeout(r, 500));
        await page.screenshot({
            path: path.join(ARTIFACT_DIR, 'proof_quest_hud_bookmark_tab_closeup.png'),
            clip: { x: 0, y: 300, width: 220, height: 160 }
        });
        console.log('✓ Saved: proof_quest_hud_bookmark_tab_closeup.png');

        console.log('🎉 Close-up captures finished successfully!');
    } finally {
        await browser.close();
    }
}

captureCloseups().catch(err => {
    console.error('Error capturing closeups:', err);
    process.exit(1);
});
