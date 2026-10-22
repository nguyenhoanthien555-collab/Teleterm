const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BRAIN_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\fd0b9efe-c0f6-4d49-a8ef-bae96a3a5da2';
const TEST_DIR = path.resolve(__dirname);

function saveArtifact(filename, buffer) {
    fs.writeFileSync(path.join(TEST_DIR, filename), buffer);
    if (fs.existsSync(BRAIN_DIR)) {
        fs.writeFileSync(path.join(BRAIN_DIR, filename), buffer);
    }
}

(async () => {
    console.log('🚀 Launching Puppeteer for 4-Fixes Verification Suite...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    // High-resolution viewport for crisp anime character details
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('[Multi-Slot]') || text.includes('[OverheadUi]') || text.includes('[SpeechBubble]')) {
            console.log('Browser log:', text);
        }
    });

    console.log('Navigating to http://localhost:4000 ...');
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Switch to Explore mode so 3D overhead badges and speech bubbles are active
    await page.evaluate(() => {
        const term = document.getElementById('deck-terminal-screen');
        if (term) term.style.display = 'none';
        document.body.classList.add('mode-explore');
        document.body.classList.remove('mode-focus');
        if (window.__teleTermApp) {
            window.__teleTermApp.setFocusMode(false);
        }
    });

    // Wait for openWorld3D and character mesh to be fully loaded
    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });
    console.log('✨ 3D World, character and NPC meshes fully loaded.');

    // Wait 2.5s for initial NPC routines
    await new Promise(r => setTimeout(r, 2500));

    // =========================================================================
    // TEST 1: Chat Speech Bubble Positioning Bug
    // Verifies: Local player chat bubble anchors right above local player's head
    // in foreground, NOT floating high in sky over Sakura on park bench.
    // =========================================================================
    console.log('\n--- Running Test 1: Chat Speech Bubble Positioning ---');
    const bubbleReport = await page.evaluate(() => {
        const ow = window.openWorld3D;
        // Position local player in foreground facing towards camera / scenic view
        ow.player.position.set(2.8, ow.getTerrainHeight(2.8, 4.2), 4.2);
        ow.player.rotation.y = Math.PI; // Face forward/camera
        ow.isSitting = false;

        // Position Sakura in background on wayside bench (matching user's reported screenshot scene)
        const sakura = ow.npcLifeSystem.agents.find(a => a.def.id === 'sakura');
        if (sakura) {
            sakura.group.position.set(5.5, ow.getTerrainHeight(5.5, -6.0), -6.0);
            sakura.group.rotation.y = -0.3;
        }

        // Camera looking at local player in foreground with Sakura visible in background
        ow.camera.position.set(2.8, 1.45, 6.8);
        ow.camera.lookAt(2.8, 1.25, 4.2);
        ow.updateCamera = () => {
            ow.camera.position.set(2.8, 1.45, 6.8);
            ow.camera.lookAt(2.8, 1.25, 4.2);
        };

        // Trigger local player speech bubble
        window.mmoChat.displaySpeechBubble('player', 'dwdaw (testing speech bubble positioning)');

        // Force update speech bubble positions
        window.mmoChat.updateSpeechBubblesPositions(ow.camera, ow);
        if (ow.overheadUi) ow.overheadUi.update();

        // Query bubble element on screen
        const bubbleEl = document.querySelector('.anime-comic-speech-bubble');
        const bubbleRect = bubbleEl ? bubbleEl.getBoundingClientRect() : null;

        // Query 3D player head world position projected to screen
        const headBone = ow.retargeter?.mappedBones?.Head;
        const headPos = ow.player.position.clone();
        if (headBone) {
            headBone.getWorldPosition(headPos);
        } else {
            ow.player.getWorldPosition(headPos);
            headPos.y += 1.60;
        }
        const projectedHead = headPos.clone().project(ow.camera);
        const screenHeadX = (projectedHead.x * 0.5 + 0.5) * window.innerWidth;
        const screenHeadY = (-(projectedHead.y * 0.5) + 0.5) * window.innerHeight;

        return {
            hasBubble: !!bubbleEl,
            bubbleText: bubbleEl ? bubbleEl.textContent : '',
            bubbleRect: bubbleRect ? {
                top: Math.round(bubbleRect.top),
                left: Math.round(bubbleRect.left),
                width: Math.round(bubbleRect.width),
                height: Math.round(bubbleRect.height)
            } : null,
            screenHeadX: Math.round(screenHeadX),
            screenHeadY: Math.round(screenHeadY),
            playerPos: { x: ow.player.position.x, y: ow.player.position.y, z: ow.player.position.z }
        };
    });

    console.log('Bubble Test Report:', JSON.stringify(bubbleReport, null, 2));

    await new Promise(r => setTimeout(r, 600));
    const buf1 = await page.screenshot({ fullPage: false });
    saveArtifact('verify_chat_bubble_local_player.png', buf1);
    console.log('📸 Saved verify_chat_bubble_local_player.png');


    // =========================================================================
    // TEST 2: Pier Walkway & Dock Collision / Elevation Bug
    // Verifies: Player walking on wooden pier planks has legs/feet cleanly on top
    // (elevation y = 0.22m), NOT submerged into sea water (y = -0.55m).
    // =========================================================================
    console.log('\n--- Running Test 2: Pier Walkway Collision & Elevation ---');
    const pierReport = await page.evaluate(() => {
        const ow = window.openWorld3D;
        // Position player in the middle of wooden pier walkway (z = 84.0, x = 10.5)
        const pierX = 10.5;
        const pierZ = 84.0;
        const walkableH = ow.getTerrainHeight(pierX, pierZ);

        ow.player.position.set(pierX, walkableH, pierZ);
        ow.player.rotation.y = 0; // facing towards sea / tee platform
        ow.isSitting = false;
        ow.retargeter.setAnimation('Walk'); // verify walk stance elevation

        // Position camera to view player full body from side-quarter angle on pier planks
        ow.camera.position.set(7.5, 1.25, 81.5);
        ow.camera.lookAt(10.5, 0.85, 84.0);
        ow.updateCamera = () => {
            ow.camera.position.set(7.5, 1.25, 81.5);
            ow.camera.lookAt(10.5, 0.85, 84.0);
        };

        const ret = ow.retargeter;
        const getBoneWorldY = (bone) => {
            if (!bone) return null;
            const v = ow.player.position.clone();
            bone.getWorldPosition(v);
            return Number(v.y.toFixed(3));
        };

        // Also test surface detector
        const surf = ow.surfaceDetector ? ow.surfaceDetector.detectSurface(pierX, pierZ) : null;

        return {
            playerY: Number(ow.player.position.y.toFixed(3)),
            walkableHeight: Number(walkableH.toFixed(3)),
            detectedSurface: surf,
            leftFootY: getBoneWorldY(ret.mappedBones.LeftFoot),
            rightFootY: getBoneWorldY(ret.mappedBones.RightFoot),
            hipsY: getBoneWorldY(ret.mappedBones.Hips)
        };
    });

    console.log('Pier Elevation Report:', JSON.stringify(pierReport, null, 2));

    await new Promise(r => setTimeout(r, 600));
    const buf2 = await page.screenshot({ fullPage: false });
    saveArtifact('verify_pier_walkway_elevation.png', buf2);
    console.log('📸 Saved verify_pier_walkway_elevation.png');


    // =========================================================================
    // TEST 3: 2-Seater Multi-Slot Bench Seating
    // Verifies: Sakura and Player sitting side-by-side on wayside sakura bench
    // (capacity: 2, lateral slot offset +/-0.45m).
    // =========================================================================
    console.log('\n--- Running Test 3: 2-Seater Bench Seating (Sakura + Player) ---');
    const benchReport = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const im = ow.interactionManager;
        const benchAnchor = im.getAnchor('wayside_sakura_bench');

        // Reset previous claims if any
        im.releaseAnchor('wayside_sakura_bench', 'sakura');
        im.releaseAnchor('wayside_sakura_bench', 'player');

        // 1. Sakura claims slot 0
        const sakuraAgent = ow.npcLifeSystem.agents.find(a => a.def.id === 'sakura');
        const sakuraClaimed = im.claimAnchor('wayside_sakura_bench', 'sakura', { x: 5.5, y: 0.245, z: -6.0 });
        const sakuraSeatPos = im.getSeatSlotPosition('wayside_sakura_bench', 'sakura');

        if (sakuraAgent && sakuraSeatPos) {
            sakuraAgent.group.position.set(sakuraSeatPos.x, sakuraSeatPos.y, sakuraSeatPos.z);
            sakuraAgent.group.rotation.y = benchAnchor.rotationY;
            sakuraAgent.retargeter.setAnimation('SitRelaxed');
            sakuraAgent.updateBadge('🌸 enjoying cherry blossoms');
        }

        // 2. Player approaches and sits down on same bench -> claims slot 1
        ow.player.position.set(5.5, ow.getTerrainHeight(5.5, -5.2), -5.2);
        ow.sitDown(benchAnchor);

        // Position camera in front of bench to clearly see both characters sitting side-by-side
        ow.camera.position.set(5.2, 1.20, -3.8);
        ow.camera.lookAt(5.5, 0.78, -6.0);
        ow.updateCamera = () => {
            ow.camera.position.set(5.2, 1.20, -3.8);
            ow.camera.lookAt(5.5, 0.78, -6.0);
        };
        if (ow.overheadUi) ow.overheadUi.update();

        const slotMap = im.entitySlotMap.get('wayside_sakura_bench');
        const sakuraSlot = slotMap ? slotMap.get('sakura') : null;
        const playerSlot = slotMap ? slotMap.get('player') : null;

        const dist = Math.hypot(
            sakuraAgent.group.position.x - ow.player.position.x,
            sakuraAgent.group.position.z - ow.player.position.z
        );

        return {
            anchorCapacity: benchAnchor.capacity,
            sakuraClaimed,
            isPlayerSitting: ow.isSitting,
            sakuraSlot,
            playerSlot,
            sakuraPos: {
                x: Number(sakuraAgent.group.position.x.toFixed(3)),
                y: Number(sakuraAgent.group.position.y.toFixed(3)),
                z: Number(sakuraAgent.group.position.z.toFixed(3))
            },
            playerPos: {
                x: Number(ow.player.position.x.toFixed(3)),
                y: Number(ow.player.position.y.toFixed(3)),
                z: Number(ow.player.position.z.toFixed(3))
            },
            distanceBetweenSeats: Number(dist.toFixed(3))
        };
    });

    console.log('2-Seater Bench Report:', JSON.stringify(benchReport, null, 2));

    await new Promise(r => setTimeout(r, 800));
    const buf3 = await page.screenshot({ fullPage: false });
    saveArtifact('verify_2_seater_bench_sitting.png', buf3);
    console.log('📸 Saved verify_2_seater_bench_sitting.png');


    // =========================================================================
    // TEST 4: NPC Appearance Differentiation & Procedural 3D Anime Accessories
    // Verifies: Lumina, Sakura, Ren, Kaede showcase distinct hair, outfits,
    // and head accessories (visor, kanzashi flower, scholar barrette, goggles).
    // =========================================================================
    console.log('\n--- Running Test 4: NPC Appearance Differentiation & Accessories ---');
    const npcReport = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const agents = ow.npcLifeSystem.agents;

        // Close chat window to give full unobstructed view of all 4 NPCs
        if (window.mmoChat && typeof window.mmoChat.closeChat === 'function') {
            window.mmoChat.closeChat();
        }

        // Stand up player and move aside
        ow.standUp();
        ow.player.position.set(-20, 0, -20);

        // Position 4 NPCs in a tidy lineup facing the camera on the hub wooden deck
        // Lumina, Sakura, Ren, Kaede
        const lineupConfig = [
            { id: 'lumina', x: 5.6, z: 0.0, anim: 'Thinking', badge: '⚡ Lumina: Cyber-Visor' },
            { id: 'sakura', x: 6.6, z: 0.0, anim: 'Idle',     badge: '🌸 Sakura: Kanzashi Flower' },
            { id: 'ren',    x: 7.6, z: 0.0, anim: 'Dance',    badge: '🔮 Ren: Scholar Gem Barrette' },
            { id: 'kaede',  x: 8.6, z: 0.0, anim: 'Typing',   badge: '⚙️ Kaede: Brass Goggles' }
        ];

        const details = [];

        lineupConfig.forEach(cfg => {
            const agent = agents.find(a => a.def.id === cfg.id);
            if (agent) {
                const y = ow.getTerrainHeight(cfg.x, cfg.z);
                agent.group.position.set(cfg.x, y, cfg.z);
                agent.group.rotation.y = 0; // Face camera at +Z
                agent.retargeter.setAnimation(cfg.anim);
                agent.updateBadge(cfg.badge);

                // Check head bone children (accessories)
                const headBone = agent.retargeter?.mappedBones?.Head;
                const accessoryCount = headBone ? headBone.children.length : 0;
                details.push({
                    id: cfg.id,
                    pos: { x: cfg.x, y: Number(y.toFixed(3)), z: cfg.z },
                    accessoryCount,
                    hasHeadBone: !!headBone
                });
            }
        });

        // Position camera to frame all 4 NPCs chest-up and face-forward
        ow.camera.position.set(7.1, 1.40, 2.9);
        ow.camera.lookAt(7.1, 1.28, 0.0);
        ow.updateCamera = () => {
            ow.camera.position.set(7.1, 1.40, 2.9);
            ow.camera.lookAt(7.1, 1.28, 0.0);
        };
        if (ow.overheadUi) ow.overheadUi.update();

        return { lineup: details };
    });

    console.log('NPC Diversity Report:', JSON.stringify(npcReport, null, 2));

    await new Promise(r => setTimeout(r, 1000));
    const buf4 = await page.screenshot({ fullPage: false });
    saveArtifact('verify_npc_diversity_accessories.png', buf4);
    console.log('📸 Saved verify_npc_diversity_accessories.png');

    await browser.close();
    console.log('\n🎉 All 4 verification tests completed and screenshots captured!');
})();
