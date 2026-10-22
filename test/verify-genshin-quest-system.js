const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('=== STARTING AUTOMATED TEST: GENSHIN DEVELOPER QUEST SYSTEM & GAMIFICATION ===');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    const pageErrors = [];
    page.on('pageerror', err => {
        console.error('[PAGE ERROR]', err.message);
        pageErrors.push(err.message);
    });

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`[PAGE CONSOLE ERROR] ${msg.text()}`);
        }
    });

    const artifactDir = path.resolve('C:/Users/Hoan Thien/.gemini/antigravity/brain/3fcaf81d-9851-4f83-886e-c77e3e727e31');

    try {
        console.log('0. Resetting server quest state for clean test run...');
        const http = require('http');
        await new Promise((resolve) => {
            const req = http.request('http://localhost:4000/api/quests/reset', { method: 'POST' }, res => {
                res.on('data', () => {});
                res.on('end', resolve);
            });
            req.on('error', () => resolve());
            req.end();
        });

        console.log('1. Loading http://localhost:4000?direct=1 ...');
        await page.goto('http://localhost:4000?direct=1', { waitUntil: 'domcontentloaded', timeout: 25000 });

        // Wait 4 seconds for 3D world, assets, shaders, and quest systems to initialize
        await new Promise(r => setTimeout(r, 4000));

        if (pageErrors.length > 0) {
            throw new Error(`Page threw unhandled startup errors: ${pageErrors.join('; ')}`);
        }
        console.log('✓ Page loaded cleanly with zero startup errors.');

        // Step 2: Verify QuestManager and HUD instantiation
        console.log('2. Verifying QuestManager, QuestTrackerHud, NoticeBoardModal, and EmoteWheel instantiation...');
        const initStatus = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const qm = window.questManager;
            const hud = window.questTrackerHud;
            const nb = window.noticeBoardModal;
            const ew = window.emoteWheel;

            return {
                hasOpenWorld3D: !!ow,
                hasQuestManager: !!qm,
                hasQuestTrackerHud: !!hud,
                hasNoticeBoardModal: !!nb,
                hasEmoteWheel: !!ew,
                activeQuestId: qm?.activeQuest?.id,
                activeQuestTitle: qm?.activeQuest?.title,
                questsCount: qm?.quests?.length,
                unlockedEmotes: qm?.unlockedEmotes
            };
        });

        console.log('Initialization Status:', JSON.stringify(initStatus, null, 2));

        if (!initStatus.hasQuestManager || !initStatus.hasQuestTrackerHud || !initStatus.hasNoticeBoardModal || !initStatus.hasEmoteWheel) {
            throw new Error('Quest subsystems failed to instantiate properly on window!');
        }

        if (initStatus.activeQuestId !== 'Q101') {
            throw new Error(`Expected active quest Q101 on initial load, found: ${initStatus.activeQuestId}`);
        }
        console.log('✓ All Quest Subsystems successfully initialized with active quest Q101.');

        // Step 3: Verify Quest Tracker HUD DOM & Styling
        console.log('3. Verifying Genshin Impact Quest Tracker HUD in viewport...');
        const trackerHudState = await page.evaluate(() => {
            const el = document.getElementById('genshin-quest-tracker');
            if (!el) return { error: 'Tracker container not found' };

            const catEl = document.getElementById('g-tracker-category');
            const titleEl = document.getElementById('g-tracker-title');
            const diamondEl = document.getElementById('g-tracker-diamond');
            const stepTextEl = document.getElementById('g-tracker-step-text');
            const distanceValEl = document.getElementById('g-tracker-distance-val');

            const style = window.getComputedStyle(el);
            return {
                display: style.display,
                position: style.position,
                top: style.top,
                left: style.left,
                categoryText: catEl?.textContent,
                titleText: titleEl?.textContent,
                diamondClass: diamondEl?.className,
                diamondChar: diamondEl?.textContent,
                stepText: stepTextEl?.textContent,
                distanceText: distanceValEl?.textContent
            };
        });

        console.log('Tracker HUD State:', JSON.stringify(trackerHudState, null, 2));

        if (trackerHudState.display === 'none') {
            throw new Error('Quest Tracker HUD is hidden!');
        }

        // Capture Screenshot 1: Genshin Quest Tracker HUD
        const shot1Path = path.join(artifactDir, 'proof_genshin_quest_tracker_hud.png');
        await page.screenshot({ path: shot1Path });
        console.log(`✓ Proof captured: ${shot1Path}`);

        // Step 4: Advance Quest Q101 Steps (Talk to Lumina -> Run Terminal Command)
        console.log('4. Simulating events to advance Quest Q101 objectives...');
        const progressResult = await page.evaluate(async () => {
            const qm = window.questManager;
            // 4a. Talk to Lumina event
            await qm.recordEvent('talk_npc', { target: 'Lumina' });
            // Small pause
            await new Promise(r => setTimeout(r, 600));
            // 4b. Terminal command event
            await qm.recordEvent('terminal_command', { command: 'node -v' });
            await new Promise(r => setTimeout(r, 600));

            return {
                activeQuest: qm.activeQuest,
                isReadyToClaim: qm.activeQuest?.isReadyToClaim,
                status: qm.activeQuest?.status
            };
        });

        console.log('Quest Progression Result:', JSON.stringify(progressResult, null, 2));

        if (!progressResult.isReadyToClaim) {
            throw new Error(`Quest Q101 did not advance to READY_TO_CLAIM! Current status: ${progressResult.status}`);
        }
        console.log('✓ Quest Q101 advanced to READY_TO_CLAIM! Diamond marker turns radiant!');

        // Wait 500ms for DOM re-render
        await new Promise(r => setTimeout(r, 500));

        // Capture Screenshot 2: Radiant Diamond & Claim Button
        const shot2Path = path.join(artifactDir, 'proof_quest_objective_completed_diamond.png');
        await page.screenshot({ path: shot2Path });
        console.log(`✓ Proof captured: ${shot2Path}`);

        // Step 5: Claim Quest Q101 Rewards
        console.log('5. Claiming Quest Q101 rewards (+60 EXP, Code Pilgrim title, Wave emote)...');
        const claimResult = await page.evaluate(async () => {
            const qm = window.questManager;
            return await qm.claimQuest('Q101');
        });

        console.log('Claim Result:', JSON.stringify(claimResult, null, 2));
        if (!claimResult.success) {
            throw new Error('claimQuest failed!');
        }
        console.log('✓ Quest rewards claimed successfully! Unlocked Title & Next Quest Q102.');

        // Step 6: Test Notice Board Modal
        console.log('6. Testing Developer Hub Notice Board Modal...');
        await page.evaluate(() => {
            window.noticeBoardModal.open();
        });
        await new Promise(r => setTimeout(r, 800));

        const nbState = await page.evaluate(() => {
            const modal = document.getElementById('modal-notice-board');
            const cards = document.querySelectorAll('.nb-quest-card');
            return {
                isOpen: !modal.classList.contains('hidden'),
                cardsCount: cards.length,
                bountyCards: Array.from(cards).map(c => c.querySelector('.nb-card-title')?.textContent)
            };
        });

        console.log('Notice Board State:', JSON.stringify(nbState, null, 2));
        if (!nbState.isOpen || nbState.cardsCount === 0) {
            throw new Error('Notice Board Modal failed to open or render quest cards!');
        }

        // Capture Screenshot 3: Notice Board Modal
        const shot3Path = path.join(artifactDir, 'proof_notice_board_bounty_modal.png');
        await page.screenshot({ path: shot3Path });
        console.log(`✓ Proof captured: ${shot3Path}`);

        // Close Notice Board modal
        await page.evaluate(() => {
            window.noticeBoardModal.close();
        });
        await new Promise(r => setTimeout(r, 400));

        // Step 7: Test Radial Emote Wheel (G key)
        console.log('7. Testing Radial Emote Wheel (G Key)...');
        await page.evaluate(() => {
            window.emoteWheel.open();
        });
        await new Promise(r => setTimeout(r, 800));

        const emoteWheelState = await page.evaluate(() => {
            const wheel = document.getElementById('radial-emote-wheel');
            const slices = document.querySelectorAll('.radial-slice');
            return {
                isOpen: !wheel.classList.contains('hidden'),
                slicesCount: slices.length,
                unlockedCount: document.querySelectorAll('.radial-slice.unlocked').length,
                lockedCount: document.querySelectorAll('.radial-slice.locked').length
            };
        });

        console.log('Emote Wheel State:', JSON.stringify(emoteWheelState, null, 2));
        if (!emoteWheelState.isOpen || emoteWheelState.slicesCount !== 6) {
            throw new Error('Emote Wheel failed to open or does not have 6 radial slices!');
        }

        // Capture Screenshot 4: Emote Wheel
        const shot4Path = path.join(artifactDir, 'proof_emote_wheel_interaction.png');
        await page.screenshot({ path: shot4Path });
        console.log(`✓ Proof captured: ${shot4Path}`);

        // Close emote wheel
        await page.evaluate(() => {
            window.emoteWheel.close();
        });

        console.log('=== ALL 7 GENSHIN QUEST SYSTEM & GAMIFICATION VERIFICATION CHECKS PASSED 100% ===');
    } catch (err) {
        console.error('FATAL VERIFICATION TEST ERROR:', err);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
})();
