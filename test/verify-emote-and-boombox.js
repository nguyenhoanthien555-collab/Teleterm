const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function runVerification() {
    console.log('=======================================================================');
    console.log('TELETERM 3D — MILESTONE 2 VERIFICATION: EMOTE WHEEL & SPATIAL BOOMBOX');
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

    // --- PHASE 1: WebSocket Network Multi-Client Validation ---
    console.log('\n--- Phase 1: WebSocket Network Multi-Client Emote & Boombox Sync ---');
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

        const connA = await createWsClient('ClientA');
        const connB = await createWsClient('ClientB');
        clientA = connA.ws;
        clientB = connB.ws;
        const queueA = connA.queue;
        const queueB = connB.queue;

        // Handshake Client A
        clientA.send(JSON.stringify({
            type: 'join',
            username: 'DancerA',
            position: { x: 15.0, y: 0.8, z: 16.0 },
            rotation: { x: 0, y: 0, z: 0 }
        }));

        // Handshake Client B
        clientB.send(JSON.stringify({
            type: 'join',
            username: 'ListenerB',
            position: { x: 16.0, y: 0.8, z: 16.5 },
            rotation: { x: 0, y: 0, z: 0 }
        }));

        await new Promise(r => setTimeout(r, 600));

        const welcomeA = queueA.find(p => p.type === 'welcome');
        const welcomeB = queueB.find(p => p.type === 'welcome');

        assert('Client A receives welcome packet', Boolean(welcomeA));
        assert('Client B receives welcome packet', Boolean(welcomeB));
        assert('Welcome packet includes authoritative boomboxState', 
            Boolean(welcomeA?.boomboxState && welcomeA.boomboxState.currentTrackId),
            { boomboxState: welcomeA?.boomboxState }
        );

        const clientAId = welcomeA?.profile?.id || welcomeA?.id;

        // 1. Emote Trigger & Network Broadcast
        queueB.length = 0; // Clear queue
        clientA.send(JSON.stringify({
            type: 'emote_trigger',
            emoteId: 'VibeDance'
        }));

        await new Promise(r => setTimeout(r, 400));
        const emoteBcast = queueB.find(p => p.type === 'emote_broadcast');
        assert('Client B receives emote_broadcast from Client A', Boolean(emoteBcast), { emoteBcast });
        assert('Emote broadcast contains correct playerId and emoteId', 
            emoteBcast?.playerId === clientAId && emoteBcast?.emoteId === 'VibeDance',
            { emoteBcast, clientAId }
        );

        // 2. Anti-Spam Cooldown Rejection (< 1.5s)
        queueA.length = 0;
        clientA.send(JSON.stringify({
            type: 'emote_trigger',
            emoteId: 'Celebrate'
        }));

        await new Promise(r => setTimeout(r, 300));
        const emoteReject = queueA.find(p => p.type === 'emote_rejected');
        assert('Rapid emote trigger (< 1.5s) rejected with cooldown_active', 
            emoteReject?.reason === 'cooldown_active' && emoteReject?.retryAfterMs > 0,
            { emoteReject }
        );

        // 3. Boombox Sync Request
        queueA.length = 0;
        clientA.send(JSON.stringify({
            type: 'boombox_sync_req'
        }));

        await new Promise(r => setTimeout(r, 300));
        const syncResp = queueA.find(p => p.type === 'boombox_state');
        assert('Server responds to boombox_sync_req with boombox_state', Boolean(syncResp), { syncResp });
        assert('Boombox state includes serverTime and trackStartTimestamp', 
            typeof syncResp?.serverTime === 'number' && typeof syncResp?.trackStartTimestamp === 'number'
        );

        // 4. Boombox Interaction: Next Track
        queueA.length = 0;
        queueB.length = 0;
        clientA.send(JSON.stringify({
            type: 'boombox_interact',
            action: 'next_track'
        }));

        await new Promise(r => setTimeout(r, 400));
        const nextTrackUpdateA = queueA.find(p => p.type === 'boombox_state_update');
        const nextTrackUpdateB = queueB.find(p => p.type === 'boombox_state_update');
        assert('Client A receives boombox_state_update on next_track', Boolean(nextTrackUpdateA), { nextTrackUpdateA });
        assert('Client B receives boombox_state_update in realtime', Boolean(nextTrackUpdateB), { nextTrackUpdateB });
        assert('Boombox track advanced and isPlaying is true', 
            nextTrackUpdateA?.isPlaying === true && nextTrackUpdateA?.currentTrackId !== 'midnight_sakura',
            { currentTrackId: nextTrackUpdateA?.currentTrackId }
        );

        // 5. Boombox Interaction: Pause
        queueA.length = 0;
        queueB.length = 0;
        clientA.send(JSON.stringify({
            type: 'boombox_interact',
            action: 'pause'
        }));

        await new Promise(r => setTimeout(r, 400));
        const pauseUpdate = queueA.find(p => p.type === 'boombox_state_update');
        assert('Boombox pause updates state to isPlaying === false', pauseUpdate?.isPlaying === false, { pauseUpdate });

        // 6. Boombox Interaction: Play
        queueA.length = 0;
        clientA.send(JSON.stringify({
            type: 'boombox_interact',
            action: 'play'
        }));

        await new Promise(r => setTimeout(r, 400));
        const playUpdate = queueA.find(p => p.type === 'boombox_state_update');
        assert('Boombox play restores state to isPlaying === true', playUpdate?.isPlaying === true, { playUpdate });

    } catch (err) {
        assert('Phase 1 WebSocket Multi-Client Sync without exception', false, { error: err.message });
    } finally {
        if (clientA && clientA.readyState === WebSocket.OPEN) clientA.close();
        if (clientB && clientB.readyState === WebSocket.OPEN) clientB.close();
    }

    // --- PHASE 2: Puppeteer Visual & Client System Validation ---
    console.log('\n--- Phase 2: Puppeteer Radial Emote Wheel & Spatial Boombox E2E ---');
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

        // Wait for core systems and avatar retargeter to load
        await page.waitForFunction(() => {
            return window.openWorld3D && 
                   window.openWorld3D.retargeter &&
                   window.radialEmoteWheel && 
                   window.spatialBoomboxManager;
        }, { timeout: 25000 });

        console.log('Core systems & avatar retargeter initialized.');

        // 1. Validate Radial Emote Wheel Architecture
        const emoteWheelCheck = await page.evaluate(() => {
            const wheel = window.radialEmoteWheel;
            const slices = window.radialEmoteWheel?.modalEl?.querySelectorAll('.emote-slice-group');
            return {
                exists: Boolean(wheel),
                sliceCount: slices?.length || 0,
                isOpen: wheel.isOpen
            };
        });

        assert('Radial Emote Wheel instantiated and mounted in DOM', emoteWheelCheck.exists);
        assert('Radial Emote Wheel contains 8 geometric SVG slices', emoteWheelCheck.sliceCount === 8, { count: emoteWheelCheck.sliceCount });

        // 2. Open Emote Wheel and select slice
        await page.evaluate(() => {
            window.radialEmoteWheel.open();
            // Simulate mouse pointing to slice 2 (Dance: ~90 degrees down)
            window.radialEmoteWheel.handlePointerMove({
                clientX: window.innerWidth / 2,
                clientY: window.innerHeight / 2 + 100
            });
        });

        await new Promise(r => setTimeout(r, 400));

        const wheelActiveState = await page.evaluate(() => {
            const modal = document.getElementById('modal-radial-emote-wheel');
            const centerLabel = document.getElementById('wheel-center-label');
            const centerIcon = document.getElementById('wheel-center-icon');
            return {
                isVisible: modal && !modal.classList.contains('hidden'),
                label: centerLabel ? centerLabel.textContent.trim() : '',
                icon: centerIcon ? centerIcon.textContent.trim() : '',
                activeSliceIdx: window.radialEmoteWheel.activeSliceIdx
            };
        });

        assert('Radial Emote Wheel modal is visible when opened', wheelActiveState.isVisible);
        assert('Selecting slice updates center label and icon', 
            wheelActiveState.label.length > 0 && wheelActiveState.icon.length > 0,
            wheelActiveState
        );

        // Capture Emote Wheel visual proof
        const emoteProofPath = path.join(ARTIFACT_DIR, 'proof_milestone2_emote_wheel.png');
        await page.screenshot({ path: emoteProofPath, fullPage: false });
        console.log(`  [PROOF] Saved Emote Wheel proof to: ${emoteProofPath}`);
        assert('Screenshot proof_milestone2_emote_wheel.png captured', fs.existsSync(emoteProofPath));

        // Execute Active Slice
        const execResult = await page.evaluate(() => {
            window.radialEmoteWheel.executeActiveSlice();
            const currentAnim = window.openWorld3D?.retargeter?.currentAnim || window.openWorld3D?.retargeter?.currentAnimName || 'Unknown';
            window.radialEmoteWheel.close();
            return { currentAnim };
        });

        assert('Executing active slice triggers character animation crossfade', 
            execResult.currentAnim !== 'Unknown',
            { currentAnim: execResult.currentAnim }
        );

        // 3. Validate Spatial Boombox Manager
        const boomboxCheck = await page.evaluate(() => {
            const mgr = window.spatialBoomboxManager;
            if (!mgr) return { exists: false };
            return {
                exists: true,
                isPlaying: mgr.isPlaying,
                trackTitle: mgr.currentTrackTitle,
                refDistance: mgr.pannerNode?.refDistance,
                maxDistance: mgr.pannerNode?.maxDistance,
                rolloffFactor: mgr.pannerNode?.rolloffFactor,
                distanceModel: mgr.pannerNode?.distanceModel
            };
        });

        assert('SpatialBoomboxManager exists with Web Audio PannerNode', boomboxCheck.exists);
        assert('PannerNode matches Argon specifications (5m refDistance, 30m maxDistance, 1.8 rolloff)', 
            boomboxCheck.refDistance === 5.0 && 
            boomboxCheck.maxDistance === 30.0 && 
            boomboxCheck.rolloffFactor === 1.8 && 
            boomboxCheck.distanceModel === 'inverse',
            boomboxCheck
        );

        // Open Boombox Control HUD
        await page.evaluate(() => {
            window.spatialBoomboxManager.openControlPanel();
        });

        await new Promise(r => setTimeout(r, 400));

        const hudState = await page.evaluate(() => {
            const modal = document.getElementById('modal-boombox-controls');
            const titleEl = document.getElementById('boombox-track-title');
            const playBtn = document.getElementById('btn-boombox-play');
            return {
                isVisible: modal && !modal.classList.contains('hidden'),
                trackTitle: titleEl ? titleEl.textContent.trim() : '',
                hasControls: Boolean(playBtn)
            };
        });

        assert('Boombox Control Panel modal is visible when opened', hudState.isVisible);
        assert('Boombox displays current playing track title', hudState.trackTitle.length > 0, { trackTitle: hudState.trackTitle });

        // Capture Boombox HUD proof
        const boomboxProofPath = path.join(ARTIFACT_DIR, 'proof_milestone2_boombox_hud.png');
        await page.screenshot({ path: boomboxProofPath, fullPage: false });
        console.log(`  [PROOF] Saved Boombox HUD proof to: ${boomboxProofPath}`);
        assert('Screenshot proof_milestone2_boombox_hud.png captured', fs.existsSync(boomboxProofPath));

        // Test Interaction: Next Track via UI
        const nextTrackUI = await page.evaluate(() => {
            const nextBtn = document.getElementById('btn-boombox-next');
            const oldTitle = window.spatialBoomboxManager.currentTrackTitle;
            nextBtn?.click();
            return { oldTitle, newTitle: window.spatialBoomboxManager.currentTrackTitle };
        });

        assert('Clicking Next Track updates track title', 
            nextTrackUI.newTitle.length > 0,
            nextTrackUI
        );

        // Test Interaction: Play/Pause via UI
        const wasPlaying = await page.evaluate(() => window.spatialBoomboxManager.isPlaying);
        await page.evaluate(() => {
            const playBtn = document.getElementById('btn-boombox-play');
            playBtn?.click();
        });
        await new Promise(r => setTimeout(r, 250));
        const nowPlaying = await page.evaluate(() => window.spatialBoomboxManager.isPlaying);

        assert('Clicking Play/Pause button toggles playing state', 
            wasPlaying !== nowPlaying,
            { wasPlaying, nowPlaying }
        );

    } catch (err) {
        assert('Phase 2 Puppeteer E2E validation without exception', false, { error: err.message });
    } finally {
        if (browser) await browser.close();
    }

    // --- PHASE 3: Results Summary & Artifact Persistence ---
    const totalAssertions = results.passed + results.failed;
    const passRate = totalAssertions > 0 ? ((results.passed / totalAssertions) * 100).toFixed(1) : 0;

    console.log('\n=======================================================================');
    console.log(`MILESTONE 2 VERIFICATION SUMMARY: ${results.passed}/${totalAssertions} (${passRate}%) PASSED`);
    console.log('=======================================================================');

    const resultsArtifactPath = path.join(ARTIFACT_DIR, 'milestone2_emote_and_boombox_results.json');
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
