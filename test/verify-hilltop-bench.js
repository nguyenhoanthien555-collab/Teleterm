const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BRAIN_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\69476637-5058-4b38-81f6-926c8792527c';
const TEST_DIR = path.resolve(__dirname);

function saveArtifact(filename, buffer) {
    fs.writeFileSync(path.join(TEST_DIR, filename), buffer);
    if (fs.existsSync(BRAIN_DIR)) {
        fs.writeFileSync(path.join(BRAIN_DIR, filename), buffer);
    }
}

(async () => {
    console.log('🚀 Launching Puppeteer for Hilltop Panorama Bench Verification...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('Navigating to http://localhost:4000 ...');
    await page.goto('http://localhost:4000', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });
    console.log('✨ 3D World and characters fully loaded.');

    // Switch to Explore mode
    await page.evaluate(() => {
        const term = document.getElementById('deck-terminal-screen');
        if (term) term.style.display = 'none';
        document.body.classList.add('mode-explore');
        document.body.classList.remove('mode-focus');
        if (window.__teleTermApp) {
            window.__teleTermApp.setFocusMode(false);
        }
    });

    // Wait 2.5s for initial setup
    await new Promise(r => setTimeout(r, 2500));

    const report = await page.evaluate(() => {
        const ow = window.openWorld3D;
        const im = ow.interactionManager;
        const benchAnchor = im.getAnchor('hilltop_panorama_bench');

        // Set distinct preset for player so player has cyber visor / starlight style vs Sakura's floral pink
        ow.setPreset('hacker_hoodie');

        // Close chat window for clean screenshot
        if (window.mmoChat && typeof window.mmoChat.closeChat === 'function') {
            window.mmoChat.closeChat();
        }

        // Reset previous claims if any
        im.releaseAnchor('hilltop_panorama_bench', 'sakura');
        im.releaseAnchor('hilltop_panorama_bench', 'player');

        // 1. Sakura claims slot 0
        const sakuraAgent = ow.npcLifeSystem.agents.find(a => a.def.id === 'sakura');
        const sakuraClaimed = im.claimAnchor('hilltop_panorama_bench', 'sakura', { x: 34.0, y: benchAnchor.position.y, z: -48.0 });
        const sakuraSeatPos = im.getSeatSlotPosition('hilltop_panorama_bench', 'sakura');

        if (sakuraAgent && sakuraSeatPos) {
            sakuraAgent.group.position.set(sakuraSeatPos.x, sakuraSeatPos.y, sakuraSeatPos.z);
            sakuraAgent.group.rotation.y = benchAnchor.rotationY;
            if (sakuraAgent.retargeter.setSeatConfig) {
                sakuraAgent.retargeter.setSeatConfig(benchAnchor);
            }
            sakuraAgent.retargeter.setAnimation('SitLookingAtView');
            sakuraAgent.updateBadge('🌸 Sakura: admiring alpine snow peaks');
        }

        // 2. Player approaches and sits down on same bench -> claims slot 1
        ow.player.position.set(34.0, ow.getTerrainHeight(34.0, -47.2), -47.2);
        ow.sitDown(benchAnchor);

        // Find the physical bench in the scene
        let benchObj = null;
        ow.scene.traverse(obj => {
            if (obj.children && obj.children.length === 7 && obj.position.z < -40) {
                benchObj = obj;
            }
        });

        // Find nearest tree in scene
        let nearestTreeDist = Infinity;
        let nearestTreePos = null;
        const treeList = (ow.worldComposition?.trees?.trees || ow.worldComposition?.treeSystem?.trees);
        if (treeList && treeList.length > 0) {
            treeList.forEach(t => {
                const dist = Math.hypot(t.position.x - benchAnchor.position.x, t.position.z - benchAnchor.position.z);
                if (dist < nearestTreeDist) {
                    nearestTreeDist = dist;
                    nearestTreePos = { x: t.position.x, y: t.position.y, z: t.position.z };
                }
            });
        }

        // Get avatar bone world positions
        const getBoneWorldY = (ret, boneName, rootObj) => {
            const bone = ret?.mappedBones?.[boneName];
            if (!bone || !rootObj) return null;
            const v = rootObj.position.clone();
            bone.getWorldPosition(v);
            return Number(v.y.toFixed(3));
        };

        const sakuraRet = sakuraAgent?.retargeter;
        const playerRet = ow.retargeter;

        // Position camera in front of bench looking directly at both characters sitting side-by-side
        // Bench is at (34.0, -48.0) facing -Math.PI * 0.85 (North-West)
        // Camera in front facing characters: (32.3, 5.30, -50.8) looking at (34.0, 5.15, -48.0)
        ow.camera.position.set(32.3, 5.30, -50.8);
        ow.camera.lookAt(34.0, 5.15, -48.0);
        ow.updateCamera = () => {
            ow.camera.position.set(32.3, 5.30, -50.8);
            ow.camera.lookAt(34.0, 5.15, -48.0);
        };

        if (ow.overheadUi) ow.overheadUi.update();

        const slotMap = im.slotOccupants.get('hilltop_panorama_bench');
        const sakuraSlot = im.entitySlotMap.get('sakura')?.slotIndex;
        const playerSlot = im.entitySlotMap.get('player')?.slotIndex;

        const distBetweenSeats = Math.hypot(
            sakuraAgent.group.position.x - ow.player.position.x,
            sakuraAgent.group.position.z - ow.player.position.z
        );

        return {
            benchAnchor: {
                id: benchAnchor.id,
                capacity: benchAnchor.capacity,
                pos: benchAnchor.position,
                rotY: benchAnchor.rotationY
            },
            benchObjPos: benchObj ? { x: benchObj.position.x, y: benchObj.position.y, z: benchObj.position.z } : null,
            nearestTreeDist: Number(nearestTreeDist.toFixed(3)),
            nearestTreePos,
            treeClearanceAbove2_5m: nearestTreeDist >= 2.5,
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
            distBetweenSeats: Number(distBetweenSeats.toFixed(3)),
            sakuraHipsY: getBoneWorldY(sakuraRet, 'Hips', sakuraAgent.group),
            sakuraLeftFootY: getBoneWorldY(sakuraRet, 'LeftFoot', sakuraAgent.group),
            sakuraRightFootY: getBoneWorldY(sakuraRet, 'RightFoot', sakuraAgent.group),
            playerHipsY: getBoneWorldY(playerRet, 'Hips', ow.player),
            playerLeftFootY: getBoneWorldY(playerRet, 'LeftFoot', ow.player),
            playerRightFootY: getBoneWorldY(playerRet, 'RightFoot', ow.player)
        };
    });

    console.log('Hilltop Bench Verification Report:');
    console.log(JSON.stringify(report, null, 2));

    await new Promise(r => setTimeout(r, 1000));
    const buf = await page.screenshot({ fullPage: false });
    saveArtifact('verify_hilltop_bench_sitting.png', buf);
    console.log('📸 Saved verify_hilltop_bench_sitting.png');

    // SHOT 2: Wide cinematic establishing shot of the Hilltop Panorama Viewpoint
    await page.evaluate(() => {
        const ow = window.openWorld3D;
        // Elevate camera slightly and pull back to show full clearing, gravel viewing pad, bench, telescope, sakura tree, and mountains
        ow.camera.position.set(30.0, 5.8, -43.0);
        ow.camera.lookAt(34.0, 4.9, -48.0);
        ow.updateCamera = () => {
            ow.camera.position.set(30.0, 5.8, -43.0);
            ow.camera.lookAt(34.0, 4.9, -48.0);
        };
        if (ow.overheadUi) ow.overheadUi.update();
    });

    await new Promise(r => setTimeout(r, 800));
    const buf2 = await page.screenshot({ fullPage: false });
    saveArtifact('verify_hilltop_bench_panoramic_vista.png', buf2);
    console.log('📸 Saved verify_hilltop_bench_panoramic_vista.png');

    await browser.close();
})();
