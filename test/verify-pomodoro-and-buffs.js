const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function runVerification() {
    console.log('=======================================================================');
    console.log('TELETERM 3D — MILESTONE 4 VERIFICATION: POMODORO & SYNCHRONIZED BUFFS');
    console.log('=======================================================================');

    const results = {
        timestamp: new Date().toISOString(),
        assertions: [],
        passed: 0,
        failed: 0
    };

    function assert(name, condition, details = {}) {
        const pass = Boolean(condition);
        if (pass) {
            results.passed++;
            console.log(`  [PASS] ${name}`);
        } else {
            results.failed++;
            console.error(`  [FAIL] ${name}`, details);
        }
        results.assertions.push({ name, pass, details });
    }

    // --- PHASE 1: Multi-Client WebSocket Focus Session & Buff Award ---
    console.log('\n--- Phase 1: WebSocket Pomodoro State Machine & Buff Award Protocol ---');
    let clientA = null;
    let clientB = null;

    try {
        const wsUrl = 'ws://localhost:4000/ws/world';

        function createWsClient(name) {
            return new Promise((resolve, reject) => {
                const ws = new WebSocket(wsUrl);
                const queue = [];
                ws.on('open', () => resolve({ ws, queue }));
                ws.on('message', (data) => {
                    try {
                        queue.push(JSON.parse(data.toString()));
                    } catch (e) {}
                });
                ws.on('error', reject);
            });
        }

        const connA = await createWsClient('StudentA');
        const connB = await createWsClient('StudentB');
        clientA = connA.ws;
        clientB = connB.ws;
        const queueA = connA.queue;
        const queueB = connB.queue;

        // Handshake Student A & B inside Zen Garden zone (36.0, 0.8, -24.5)
        clientA.send(JSON.stringify({
            type: 'join',
            username: 'StudentA',
            position: { x: 36.2, y: 0.8, z: -24.0 }
        }));

        clientB.send(JSON.stringify({
            type: 'join',
            username: 'StudentB',
            position: { x: 35.8, y: 0.8, z: -25.0 }
        }));

        await new Promise(r => setTimeout(r, 600));

        const welcomeA = queueA.find(p => p.type === 'welcome');
        assert('Client A receives welcome packet with pomodoroSession', Boolean(welcomeA?.pomodoroSession));

        // 1. Sync Request
        queueA.length = 0;
        clientA.send(JSON.stringify({ type: 'pomodoro_sync_req' }));
        await new Promise(r => setTimeout(r, 300));

        const syncResp = queueA.find(p => p.type === 'pomodoro_sync');
        assert('Server responds to pomodoro_sync_req with pomodoro_sync', Boolean(syncResp));
        assert('Pomodoro session anchor is centered at Zen Garden (x: 36.0, z: -24.5, radius: 15.0)',
            syncResp?.center?.x === 36.0 && syncResp?.center?.z === -24.5 && syncResp?.radius === 15.0,
            syncResp?.center
        );

        // 2. Start Focus Session (Fast 3-second cycle for automated verification)
        queueA.length = 0;
        queueB.length = 0;
        clientA.send(JSON.stringify({ type: 'pomodoro_start', durationSec: 3 }));
        await new Promise(r => setTimeout(r, 400));

        const focusSyncA = queueA.find(p => p.type === 'pomodoro_sync');
        const focusSyncB = queueB.find(p => p.type === 'pomodoro_sync');
        assert('Initiating Pomodoro transitions session to FOCUS_ACTIVE', focusSyncA?.state === 'FOCUS_ACTIVE');
        assert('Remote peers receive real-time broadcast of FOCUS_ACTIVE', focusSyncB?.state === 'FOCUS_ACTIVE');

        // 3. Client B Joins Group Focus
        queueA.length = 0;
        queueB.length = 0;
        clientB.send(JSON.stringify({ type: 'pomodoro_join' }));
        await new Promise(r => setTimeout(r, 400));

        const joinSync = queueA.find(p => p.type === 'pomodoro_sync');
        assert('Multiplayer join sync updates participants list with both users', 
            joinSync?.participants?.length >= 2,
            { participants: joinSync?.participants }
        );

        // 4. Wait for Focus Timer Completion (3.5 seconds)
        console.log('Waiting for focus countdown completion...');
        queueA.length = 0;
        queueB.length = 0;
        await new Promise(r => setTimeout(r, 3600));

        const buffAwardA = queueA.find(p => p.type === 'pomodoro_buff_awarded');
        const breakSyncA = queueA.find(p => p.type === 'pomodoro_sync' && p.state === 'BREAK_ACTIVE');

        assert('Session transitions to BREAK_ACTIVE after timer completion', Boolean(breakSyncA));
        assert('Client A receives pomodoro_buff_awarded with +25% XP multiplier', 
            buffAwardA?.buff?.buffId === 'zen_focus_25' && buffAwardA?.buff?.multiplier === 1.25,
            buffAwardA?.buff
        );

    } catch (err) {
        assert('Phase 1 WebSocket Pomodoro protocol without exception', false, { error: err.message });
    } finally {
        if (clientA && clientA.readyState === WebSocket.OPEN) clientA.close();
        if (clientB && clientB.readyState === WebSocket.OPEN) clientB.close();
    }

    // --- PHASE 2: XP Multiplier Integration Verification ---
    console.log('\n--- Phase 2: XP Service Active Multiplier Buff Integration ---');
    try {
        const xpService = require('../src/server/progression/xp-service.js');
        const testUserId = 'test_zen_student_multiplier';

        // Add Zen Focus buff (+25% XP)
        xpService.addBuff(testUserId, {
            buffId: 'zen_focus_25',
            multiplier: 1.25,
            name: 'Zen Mind Focus',
            expiresAt: Date.now() + 1800000
        });

        const activeBuffs = xpService.getActiveBuffs(testUserId);
        assert('Player profile contains active zen_focus_25 buff', 
            activeBuffs.some(b => b.buffId === 'zen_focus_25' && b.multiplier === 1.25),
            activeBuffs
        );

        // Award base 100 XP -> Expect 125 XP awarded (+25% multiplier)
        const xpResult = xpService.awardDirectXp(testUserId, 100, 'Test Coding Task');
        assert('XP Service multiplies base XP by 1.25 (+25% bonus)', 
            xpResult.awarded === 125,
            { awarded: xpResult.awarded, base: 100 }
        );

    } catch (err) {
        assert('Phase 2 XP Service Multiplier execution without exception', false, { error: err.message });
    }

    // --- PHASE 3: Puppeteer Visual, 3D Entity & Focus Aura Verification ---
    console.log('\n--- Phase 3: Puppeteer Zen Sanctuary Entity, Modal & Focus Auras ---');
    let browser = null;

    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--autoplay-policy=no-user-gesture-required',
                '--use-gl=angle',
                '--use-angle=default'
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });

        console.log('Navigating to http://localhost:4000/?test=1&explore=1...');
        await page.goto('http://localhost:4000/?test=1&explore=1', { waitUntil: 'networkidle2', timeout: 35000 });

        await page.waitForFunction(() => {
            return window.openWorld3D &&
                   window.zenGardenPomodoro &&
                   window.zenGardenPomodoro.auraMesh;
        }, { timeout: 25000 });

        console.log('Zen Garden Pomodoro System initialized.');

        // 1. Architecture Check: 3D Sanctuary Prop & InstancedMesh Auras
        const archCheck = await page.evaluate(() => {
            const zen = window.zenGardenPomodoro;
            return {
                exists: Boolean(zen),
                hasProp: Boolean(zen.sanctuaryGroup),
                hasAuraMesh: Boolean(zen.auraMesh && zen.auraMesh.isInstancedMesh),
                maxAuras: zen.maxAuras,
                center: { x: zen.center.x, y: zen.center.y, z: zen.center.z },
                radius: zen.radius
            };
        });

        assert('ZenGardenPomodoroSystem instantiated and mounted in world', archCheck.exists);
        assert('3D Sanctuary Altar and Singing Bowl prop built at Zen Garden', archCheck.hasProp);
        assert('Focus Auras utilize GPU InstancedMesh (1 draw call for all students)', archCheck.hasAuraMesh);
        assert('Sanctuary coordinates match Argon specifications (36.0, 0.8, -24.5, radius: 15.0)',
            archCheck.center.x === 36.0 && archCheck.center.z === -24.5 && archCheck.radius === 15.0,
            archCheck
        );

        // 2. Open Pomodoro HUD Modal
        await page.evaluate(() => {
            window.zenGardenPomodoro.open();
        });

        await new Promise(r => setTimeout(r, 400));

        const hudState = await page.evaluate(() => {
            const modal = document.getElementById('modal-zen-pomodoro');
            const countdownEl = document.getElementById('pomodoro-countdown-text');
            const ringEl = document.getElementById('pomodoro-ring-progress');
            const badgeEl = document.getElementById('pomodoro-status-badge');

            return {
                isVisible: modal && !modal.classList.contains('hidden'),
                timeText: countdownEl ? countdownEl.textContent.trim() : '',
                hasRing: Boolean(ringEl),
                badgeText: badgeEl ? badgeEl.textContent.trim() : ''
            };
        });

        assert('Zen Pomodoro Focus HUD modal is visible when opened', hudState.isVisible);
        assert('Pomodoro HUD displays countdown clock and circular SVG ring', 
            hudState.timeText.length > 0 && hudState.hasRing,
            hudState
        );

        // Capture HUD Proof
        const proofHud = path.join(ARTIFACT_DIR, 'proof_milestone4_pomodoro_hud.png');
        await page.screenshot({ path: proofHud, fullPage: false });
        console.log(`  [PROOF] Saved Pomodoro HUD proof to: ${proofHud}`);
        assert('Screenshot proof_milestone4_pomodoro_hud.png captured', fs.existsSync(proofHud));

        // 3. Test Focus Aura Rendering during FOCUS_ACTIVE
        await page.evaluate(() => {
            if (window.openWorld3D?.player?.position) {
                window.openWorld3D.player.position.set(36.0, 0.8, -24.5);
            }
            // Activate session for local player
            window.zenGardenPomodoro.syncState({
                state: 'FOCUS_ACTIVE',
                endsAt: Date.now() + 120000,
                durationSec: 1500,
                participants: ['local_player']
            });
            // Update aura position at player feet
            window.zenGardenPomodoro.update(0.016, { x: 36.0, y: 0.8, z: -24.5 });

            if (window.openWorld3D?.camera) {
                // Focus camera on player feet to frame glowing aura ring
                window.openWorld3D.camera.position.set(36.0, 3.2, -21.0);
                window.openWorld3D.camera.lookAt(36.0, 0.8, -24.5);
            }
        });

        await new Promise(r => setTimeout(r, 500));

        const auraState = await page.evaluate(() => {
            const zen = window.zenGardenPomodoro;
            return {
                meshVisible: zen.auraMesh.visible,
                opacity: zen.auraMaterial.opacity
            };
        });

        assert('Focus Aura InstancedMesh is visible during FOCUS_ACTIVE', auraState.meshVisible);

        // Capture Focus Aura Proof
        const proofAura = path.join(ARTIFACT_DIR, 'proof_milestone4_focus_aura_ring.png');
        await page.screenshot({ path: proofAura, fullPage: false });
        console.log(`  [PROOF] Saved Focus Aura proof to: ${proofAura}`);
        assert('Screenshot proof_milestone4_focus_aura_ring.png captured', fs.existsSync(proofAura));

        // 4. Test Proximity Validation (Walking outside 15m radius aborts session)
        const proximityResult = await page.evaluate(() => {
            const zen = window.zenGardenPomodoro;
            if (window.openWorld3D?.player?.position) {
                window.openWorld3D.player.position.set(65.0, 0.8, -24.5);
            }
            // Player walks 25 meters away to x: 65, z: -24.5
            zen.update(0.016, { x: 65.0, y: 0.8, z: -24.5 });
            const isStillJoined = zen.participants.has('local_player');
            return { isStillJoined };
        });

        assert('Exiting 15m Zen Garden radius gracefully pauses participant session', 
            proximityResult.isStillJoined === false,
            proximityResult
        );

    } catch (err) {
        assert('Phase 3 Puppeteer E2E validation without exception', false, { error: err.message });
    } finally {
        if (browser) await browser.close();
    }

    // --- PHASE 4: Summary & Artifact Persistence ---
    const totalAssertions = results.passed + results.failed;
    const passRate = totalAssertions > 0 ? ((results.passed / totalAssertions) * 100).toFixed(1) : 0;

    console.log('\n=======================================================================');
    console.log(`MILESTONE 4 VERIFICATION SUMMARY: ${results.passed}/${totalAssertions} (${passRate}%) PASSED`);
    console.log('=======================================================================');

    const resultsArtifactPath = path.join(ARTIFACT_DIR, 'milestone4_pomodoro_and_buffs_results.json');
    fs.writeFileSync(resultsArtifactPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`Saved results artifact: ${resultsArtifactPath}`);

    if (results.failed > 0) {
        process.exit(1);
    }
}

runVerification().catch(err => {
    console.error('Fatal verification runner error:', err);
    process.exit(1);
});
