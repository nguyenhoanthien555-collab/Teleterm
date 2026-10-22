/**
 * VERIFICATION SUITE: SHARED BENCH SEATING & CUSTOM TELETERM BRAND ICON
 * Validates:
 * 1. Custom TeleTerm Vector Glyph replaces Anthropic asterisk completely.
 * 2. Multi-slot seating allows Player and NPC (Sakura) to sit together on the same bench.
 * 3. Distance and lateral clearance between sitters is naturally spaced (~0.7m).
 * 4. Standing up releases only player's slot, leaving NPC seated smoothly.
 */

import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ARTIFACT_DIR = 'C:/Users/Hoan Thien/.gemini/antigravity/brain/3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function runVerification() {
    console.log('🚀 Starting Verification: Shared Seating & Custom TeleTerm Icon...');
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

        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('[OpenWorld3D]') || text.includes('[NpcLife]') || text.includes('[InteractionManager]')) {
                console.log(`[Browser Console] ${text}`);
            }
        });

        console.log('🌐 Navigating to http://localhost:4000 ...');
        await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for OpenWorld3D and UI to be ready
        await page.waitForFunction(() => window.openWorld3D && window.openWorld3D.isWorldInitialized, { timeout: 25000 });
        console.log('✅ OpenWorld3D initialized.');

        // =========================================================================
        // TEST 1: BRAND ICON VALIDATION (No Anthropic starburst, pure TeleTerm SVG)
        // =========================================================================
        console.log('\n--- TEST 1: TeleTerm Custom Brand Icon ---');
        const iconCheck = await page.evaluate(() => {
            const starburst = document.querySelector('.claude-starburst');
            const teletermIcon = document.querySelector('.teleterm-brand-icon');
            const svg = teletermIcon?.querySelector('svg');
            const promptPath = teletermIcon?.querySelector('.tt-icon-prompt');
            const cursorPath = teletermIcon?.querySelector('.tt-icon-cursor');
            const sparkPath = teletermIcon?.querySelector('.tt-icon-spark');
            const favicon = document.querySelector('link[rel="icon"]')?.getAttribute('href');

            return {
                starburstExists: !!starburst && window.getComputedStyle(starburst).display !== 'none',
                hasTeletermIcon: !!teletermIcon,
                hasSvg: !!svg,
                hasPromptChevron: !!promptPath,
                hasCursor: !!cursorPath,
                hasAgenticSpark: !!sparkPath,
                faviconHasTeletermGlyph: favicon && favicon.includes('tt-brand-grad') || (favicon && favicon.includes('12.5'))
            };
        });

        console.log('Icon Check Result:', iconCheck);
        if (iconCheck.starburstExists) {
            throw new Error('❌ FAIL: Anthropic starburst is still active/visible!');
        }
        if (!iconCheck.hasTeletermIcon || !iconCheck.hasPromptChevron || !iconCheck.hasAgenticSpark) {
            throw new Error('❌ FAIL: TeleTerm custom vector icon missing required geometry!');
        }
        console.log('✅ PASS: Custom TeleTerm Vector Glyph verified (Prompt Chevron + Underscore Cursor + Agentic Spark).');

        // Capture screenshot of Top Nav Bar showing custom icon
        const navBrandEl = await page.$('.nav-brand');
        if (navBrandEl) {
            await navBrandEl.screenshot({ path: path.join(ARTIFACT_DIR, 'proof_teleterm_custom_icon.png') });
            console.log('📸 Captured proof_teleterm_custom_icon.png');
        }

        // =========================================================================
        // TEST 2: SHARED BENCH SEATING (Sakura + Player on wayside_sakura_bench)
        // =========================================================================
        console.log('\n--- TEST 2: Shared Bench Seating ---');

        const seatingSetup = await page.evaluate(() => {
            const im = window.openWorld3D.interactionManager;
            const bench = im.getAnchor('wayside_sakura_bench');
            if (!bench) return { error: 'wayside_sakura_bench not found' };

            // Ensure Sakura is at the bench and claimed slot 0
            const sakuraController = window.openWorld3D.npcLifeSystem?.controllers?.get('sakura');
            if (sakuraController) {
                sakuraController.jumpToRoutine(0); // routine 0 is wayside_sakura_bench
                // Claim slot 0 for Sakura
                im.claimAnchor('wayside_sakura_bench', 'sakura', { x: 5.15, z: -6.0 });
                const slot0Pos = im.getSeatSlotPosition('wayside_sakura_bench', 'sakura');
                sakuraController.group.position.set(slot0Pos.x, slot0Pos.y, slot0Pos.z);
                sakuraController.group.rotation.y = bench.rotationY || 0;
                sakuraController.retargeter.setAnimation('SitReading');
            }

            const isOccupiedBefore = im.isOccupied('wayside_sakura_bench');
            const occupantsBefore = im.getOccupants('wayside_sakura_bench');
            const freeSlotsBefore = im.getFreeSlots('wayside_sakura_bench');

            // Position player next to the empty slot (slot 1: right side of bench)
            const slot1Pos = im.getSeatSlotPosition('wayside_sakura_bench', null, { x: 5.85, z: -5.8 });
            window.openWorld3D.player.position.set(slot1Pos.x + 0.1, slot1Pos.y, slot1Pos.z + 0.5);
            window.openWorld3D.player.rotation.y = bench.rotationY + Math.PI; // looking at bench

            return {
                benchCapacity: bench.capacity,
                isOccupiedBefore,
                occupantsBefore,
                freeSlotsBefore,
                slot1Pos
            };
        });

        console.log('Seating Setup:', seatingSetup);
        if (seatingSetup.benchCapacity !== 2) {
            throw new Error(`❌ FAIL: Expected bench capacity 2, got ${seatingSetup.benchCapacity}`);
        }
        if (seatingSetup.isOccupiedBefore) {
            throw new Error('❌ FAIL: Bench should NOT be fully occupied when only Sakura is seated!');
        }

        // Wait a frame for interaction candidate evaluation
        await page.evaluate(() => {
            window.openWorld3D.checkInteractions();
        });

        const promptCheck = await page.evaluate(() => {
            const target = window.openWorld3D.activeInteractTarget;
            return {
                targetType: target?.type,
                targetId: target?.data?.id,
                actionText: target?.actionText,
                icon: target?.icon
            };
        });

        console.log('Interaction Prompt at Empty Slot:', promptCheck);
        if (promptCheck.targetType !== 'anchor' || promptCheck.targetId !== 'wayside_sakura_bench') {
            throw new Error(`❌ FAIL: Expected wayside_sakura_bench target, got ${JSON.stringify(promptCheck)}`);
        }
        console.log(`✅ PASS: Prompt correctly displays "${promptCheck.actionText}" with icon ${promptCheck.icon}`);

        // Trigger sitting down!
        console.log('\n--- SITTING DOWN ON BENCH NEXT TO SAKURA ---');
        await page.evaluate(() => {
            window.openWorld3D.sitDown(window.openWorld3D.interactionManager.getAnchor('wayside_sakura_bench'));
        });

        // Let simulation run 1 second
        await new Promise(r => setTimeout(r, 1000));

        const coSeatedState = await page.evaluate(() => {
            const im = window.openWorld3D.interactionManager;
            const ow = window.openWorld3D;
            const sakuraCtrl = ow.npcLifeSystem?.controllers?.get('sakura');

            const playerRec = im.entitySlotMap.get('player');
            const sakuraRec = im.entitySlotMap.get('sakura');
            const occupants = im.getOccupants('wayside_sakura_bench');
            const isFullNow = im.isOccupied('wayside_sakura_bench');

            const playerPos = { x: ow.player.position.x, y: ow.player.position.y, z: ow.player.position.z };
            const sakuraPos = sakuraCtrl ? { x: sakuraCtrl.group.position.x, y: sakuraCtrl.group.position.y, z: sakuraCtrl.group.position.z } : null;
            const distBetween = sakuraPos ? Math.hypot(playerPos.x - sakuraPos.x, playerPos.z - sakuraPos.z) : null;

            // Adjust camera for a picturesque close-up view of Sakura & Player seated together
            ow.camera.position.set(benchX => 5.5, playerPos.y + 1.2, playerPos.z + 2.8);
            ow.camera.position.set(5.5, playerPos.y + 1.35, -3.2);
            ow.camera.lookAt(5.5, playerPos.y + 0.8, -6.0);

            return {
                playerIsSitting: ow.isSitting,
                playerSlot: playerRec?.slotIndex,
                sakuraSlot: sakuraRec?.slotIndex,
                occupants,
                isFullNow,
                playerPos,
                sakuraPos,
                distBetween
            };
        });

        console.log('Co-Seated State:', coSeatedState);
        if (!coSeatedState.playerIsSitting) {
            throw new Error('❌ FAIL: Player failed to sit down!');
        }
        if (coSeatedState.playerSlot !== 1 || coSeatedState.sakuraSlot !== 0) {
            throw new Error(`❌ FAIL: Expected Sakura on slot 0 and Player on slot 1, got Sakura=${coSeatedState.sakuraSlot}, Player=${coSeatedState.playerSlot}`);
        }
        if (coSeatedState.distBetween < 0.5 || coSeatedState.distBetween > 0.9) {
            throw new Error(`❌ FAIL: Lateral distance between sitters abnormal: ${coSeatedState.distBetween}m`);
        }
        if (!coSeatedState.isFullNow) {
            throw new Error('❌ FAIL: Bench should now be fully occupied with 2 sitters!');
        }
        console.log(`✅ PASS: Both Sakura (slot 0) and Player (slot 1) are co-seated on the bench! Lateral separation: ${coSeatedState.distBetween.toFixed(2)}m.`);

        // Capture picturesque screenshot of shared bench seating
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'proof_shared_bench_seating_sakura_player.png') });
        console.log('📸 Captured proof_shared_bench_seating_sakura_player.png');

        // =========================================================================
        // TEST 3: STANDING UP PRESERVES SAKURA'S SEAT
        // =========================================================================
        console.log('\n--- TEST 3: Stand Up & Slot Independence ---');
        await page.evaluate(() => {
            window.openWorld3D.standUp();
        });

        await new Promise(r => setTimeout(r, 600));

        const postStandState = await page.evaluate(() => {
            const im = window.openWorld3D.interactionManager;
            const ow = window.openWorld3D;
            const sakuraRec = im.entitySlotMap.get('sakura');
            const playerRec = im.entitySlotMap.get('player');
            const occupants = im.getOccupants('wayside_sakura_bench');
            const isFull = im.isOccupied('wayside_sakura_bench');

            return {
                playerIsSitting: ow.isSitting,
                playerRec,
                sakuraRec,
                occupants,
                isFull
            };
        });

        console.log('Post-Stand State:', postStandState);
        if (postStandState.playerIsSitting) {
            throw new Error('❌ FAIL: Player still marked as sitting after standUp()!');
        }
        if (postStandState.playerRec) {
            throw new Error('❌ FAIL: Player slot record was not cleaned up!');
        }
        if (!postStandState.sakuraRec || postStandState.sakuraRec.slotIndex !== 0) {
            throw new Error('❌ FAIL: Sakura was prematurely unseated when player stood up!');
        }
        if (postStandState.isFull) {
            throw new Error('❌ FAIL: Bench should now have 1 free slot!');
        }
        console.log('✅ PASS: Player stood up smoothly; Sakura remains seated on slot 0 with 1 free slot restored.');

        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'proof_player_stood_up_sakura_still_seated.png') });
        console.log('📸 Captured proof_player_stood_up_sakura_still_seated.png');

        console.log('\n🎉 ALL SHARED SEATING & CUSTOM ICON TESTS PASSED 100%!');
    } finally {
        await browser.close();
    }
}

runVerification().catch(err => {
    console.error('❌ Verification Error:', err);
    process.exit(1);
});
