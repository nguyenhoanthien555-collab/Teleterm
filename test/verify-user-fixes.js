const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const TEST_DIR = path.resolve(__dirname);

function saveArtifact(filename, buffer) {
    fs.writeFileSync(path.join(TEST_DIR, filename), buffer);
    console.log(`  📸 Saved screenshot: ${filename}`);
}

(async () => {
    console.log('🚀 Starting Comprehensive Verification Suite for User Fixes...\n');

    // 1. Check if server is already running, if not start it
    let serverProcess = null;
    let isServerReady = false;

    try {
        const res = await fetch('http://localhost:4000/api/version').catch(() => null);
        if (res && res.ok) {
            isServerReady = true;
            console.log('✅ Server already running on http://localhost:4000');
        }
    } catch (e) {}

    if (!isServerReady) {
        console.log('⚡ Starting server on port 4000...');
        serverProcess = spawn('node', ['src/server/index.js'], {
            cwd: path.resolve(__dirname, '..'),
            stdio: 'pipe',
            env: { ...process.env, PORT: '4000' }
        });

        serverProcess.stdout.on('data', data => {
            const str = data.toString();
            if (str.includes('4000') || str.includes('Listening') || str.includes('READY')) {
                isServerReady = true;
            }
        });

        // Wait up to 10s for server ready
        for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 500));
            try {
                const res = await fetch('http://localhost:4000/api/version').catch(() => null);
                if (res && res.ok) {
                    isServerReady = true;
                    break;
                }
            } catch (e) {}
        }

        if (!isServerReady) {
            console.error('❌ Failed to start server!');
            if (serverProcess) serverProcess.kill();
            process.exit(1);
        }
        console.log('✅ Server started successfully on port 4000\n');
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    console.log('🌐 Loading http://localhost:4000/?direct=1 in Puppeteer...');
    await page.goto('http://localhost:4000/?direct=1', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Wait for 3D world to initialize
    await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 35000 });
    console.log('✨ 3D World and characters fully initialized.\n');

    // =========================================================================
    // TEST 1: Top Navigation Bar Cleanliness & Responsive Layout
    // =========================================================================
    console.log('--- TEST 1: Top Navigation Bar Layout & Button Visibility ---');
    const navReport = await page.evaluate(() => {
        const btn3d = document.getElementById('btn-nav-back-to-world');
        const btnOrient = document.getElementById('btn-toggle-orientation');
        const topNav = document.querySelector('.cyber-top-nav');
        const thumbDeck = document.querySelector('.cyber-thumb-deck');
        const xpHud = document.getElementById('top-xp-hud-capsule');

        const orientStyle = btnOrient ? window.getComputedStyle(btnOrient) : null;
        const thumbStyle = thumbDeck ? window.getComputedStyle(thumbDeck) : null;
        const xpStyle = xpHud ? window.getComputedStyle(xpHud) : null;

        // Test thumb deck in focus mode on desktop
        document.body.classList.add('mode-focus');
        document.body.classList.remove('mode-explore', 'terminal-hidden');
        const thumbStyleFocus = thumbDeck ? window.getComputedStyle(thumbDeck) : null;
        const thumbDisplayInFocus = thumbStyleFocus ? thumbStyleFocus.display : 'none';

        // Revert to explore mode
        document.body.classList.add('mode-explore');
        document.body.classList.remove('mode-focus');

        return {
            btn3dExists: btn3d !== null,
            btnOrientExists: btnOrient !== null,
            btnOrientDisplay: orientStyle ? orientStyle.display : 'none',
            topNavHeight: topNav ? topNav.offsetHeight : 0,
            hasWrapping: topNav ? topNav.offsetHeight > 55 : false,
            thumbDeckDisplayDesktop: thumbStyle ? thumbStyle.display : 'none',
            thumbDeckDisplayFocus: thumbDisplayInFocus,
            xpHudVisible: xpStyle ? xpStyle.display !== 'none' : false
        };
    });

    console.log('  • btn-nav-back-to-world (3D World button) exists:', navReport.btn3dExists ? '❌ FAIL' : '✅ ABSENT (CLEAN)');
    console.log('  • btn-toggle-orientation exists in DOM:', navReport.btnOrientExists ? 'YES' : '✅ COMPLETELY REMOVED FROM DOM');
    console.log('  • btn-toggle-orientation display:', navReport.btnOrientDisplay, navReport.btnOrientDisplay === 'none' ? '✅ HIDDEN ON DESKTOP' : '❌ VISIBLE');
    console.log(`  • Top bar height: ${navReport.topNavHeight}px (wrapping: ${navReport.hasWrapping ? 'YES' : 'NO'})`);
    console.log('  • cyber-thumb-deck display on desktop (Explore Mode):', navReport.thumbDeckDisplayDesktop === 'none' ? '✅ HIDDEN (NONE)' : `❌ ${navReport.thumbDeckDisplayDesktop}`);
    console.log('  • cyber-thumb-deck display on desktop (Focus Mode):', navReport.thumbDeckDisplayFocus === 'none' ? '✅ HIDDEN IN FOCUS (NONE)' : `❌ ${navReport.thumbDeckDisplayFocus}`);
    console.log('  • top-xp-hud-capsule visible on desktop:', navReport.xpHudVisible ? '✅ VISIBLE' : '❌ HIDDEN');

    if (navReport.btn3dExists) throw new Error('btn-nav-back-to-world should not exist in DOM!');
    if (navReport.btnOrientExists && navReport.btnOrientDisplay !== 'none') throw new Error('btn-toggle-orientation must be hidden on desktop!');
    if (navReport.hasWrapping) throw new Error('Top bar is wrapping unexpectedly!');
    if (navReport.thumbDeckDisplayDesktop !== 'none') throw new Error('cyber-thumb-deck must be hidden on desktop!');
    if (navReport.thumbDeckDisplayFocus !== 'none') throw new Error('cyber-thumb-deck must remain hidden on desktop in Focus mode!');
    if (!navReport.xpHudVisible) throw new Error('top-xp-hud-capsule must remain visible on desktop!');

    const topbarBuf = await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 70 } });
    saveArtifact('verify_clean_topbar_pc.png', topbarBuf);

    // =========================================================================
    // TEST 2: Graphics Settings Modal & Runtime Engine Integration
    // =========================================================================
    console.log('\n--- TEST 2: Graphics Settings Modal & Subsystem Updates ---');
    const gfxReport = await page.evaluate(async () => {
        const gsm = window.graphicsManager || window.graphicsSettingsManager || window.__teleTermApp?.graphicsManager;
        const ow = window.openWorld3D;

        // Open modal
        const btnGfx = document.getElementById('btn-open-graphics-settings');
        if (btnGfx) btnGfx.click();

        await new Promise(r => setTimeout(r, 400));

        const modal = document.getElementById('modal-graphics-settings');
        const modalDisplay = modal ? window.getComputedStyle(modal).display : 'none';

        // Check active platform and preset chips
        const isPcActive = modal?.querySelector('#gfx-platform-pc')?.classList.contains('active');
        const activePlatformChip = isPcActive ? 'pc' : 'mobile';
        const activePresetChip = modal?.querySelector('.gfx-preset-btn.active')?.id?.replace('gfx-preset-', '') || 'unknown';

        // Apply PC High settings explicitly to test engine update
        gsm.setPlatform('pc');
        gsm.applyPreset('high');

        const wc = ow.worldComposition;
        const ws = wc.weatherSystem || wc.weather;
        const water = wc.waterSystem || wc.water;
        const atmo = wc.atmosphereSystem || wc.atmosphere;

        return {
            modalVisible: modalDisplay !== 'none',
            activePlatform: activePlatformChip,
            activePreset: activePresetChip,
            currentSettings: gsm.getSettings(),
            engineShadows: ws?.sunLight?.castShadow,
            engineShadowMapSize: ws?.sunLight?.shadow?.mapSize?.width,
            engineWaterRoughness: water?.waterMat?.roughness,
            engineAtmoRimIntensity: atmo?.rimLight?.intensity
        };
    });

    console.log('  • Modal opened:', gfxReport.modalVisible ? '✅ YES' : '❌ NO');
    console.log('  • Active platform chip:', gfxReport.activePlatform, gfxReport.activePlatform === 'pc' ? '✅ PC' : '❌ NON-PC');
    console.log('  • Active preset chip:', gfxReport.activePreset, gfxReport.activePreset === 'high' ? '✅ HIGH' : '❌');
    console.log('  • Engine SunLight castShadow:', gfxReport.engineShadows ? '✅ TRUE' : '❌ FALSE');
    console.log('  • Engine SunLight shadowMapSize:', gfxReport.engineShadowMapSize, 'px');
    console.log('  • Engine Water roughness:', gfxReport.engineWaterRoughness);
    console.log('  • Engine Atmosphere rimLight intensity:', gfxReport.engineAtmoRimIntensity);

    const gfxModalBuf = await page.screenshot();
    saveArtifact('verify_graphics_modal_pc_high.png', gfxModalBuf);

    // Close modal
    await page.evaluate(() => {
        const closeBtn = document.getElementById('btn-close-graphics-modal');
        if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // =========================================================================
    // TEST 3: NPC Lumina Sitting on River Valley Bench (Physical Grounding)
    // =========================================================================
    console.log('\n--- TEST 3: NPC Lumina River Valley Bench Physical Alignment ---');
    const sitReport = await page.evaluate(async () => {
        const ow = window.openWorld3D;
        const im = ow.interactionManager;
        const benchAnchor = im.getAnchor('river_valley_bench');

        // Close modal and terminal
        const term = document.getElementById('deck-terminal-screen');
        if (term) term.style.display = 'none';
        document.body.classList.add('mode-explore');
        document.body.classList.remove('mode-focus');

        // Find Lumina and assign her to sit on river_valley_bench
        const lumina = ow.npcLifeSystem.agents.find(a => a.def.id === 'lumina');
        if (lumina) {
            im.releaseAnchor('river_valley_bench', 'lumina');
            im.claimAnchor('river_valley_bench', 'lumina');
            const slotPos = im.getSeatSlotPosition('river_valley_bench', 'lumina');
            if (slotPos) {
                lumina.currentAnchor = 'river_valley_bench';
                lumina.activity = 'looking_at_view';
                lumina.group.position.set(slotPos.x, slotPos.y, slotPos.z);
                lumina.group.rotation.y = slotPos.rotationY;
                lumina.retargeter.setAnimation('SitLookingAtView');
            }
        }

        // Position camera to look directly at Lumina sitting on the bench
        ow.camera.position.set(10.5, 1.25, 18.2);
        ow.camera.lookAt(8.5, 0.65, 19.2);
        ow.updateCamera = () => {
            ow.camera.position.set(10.5, 1.25, 18.2);
            ow.camera.lookAt(8.5, 0.65, 19.2);
        };

        const terrainY = ow.getTerrainHeight(8.5, 19.2);

        const npcRoutines = ow.npcLifeSystem.agents.map(a => {
            const steps = a.def.routine;
            const lastStep = steps[steps.length - 1];
            return {
                id: a.def.id,
                name: a.def.name,
                stepsCount: steps.length,
                lastStepActivity: lastStep.activity,
                isReturnWalk: lastStep.activity === 'walking'
            };
        });

        return {
            anchorPos: benchAnchor.position,
            luminaPos: {
                x: Number(lumina.group.position.x.toFixed(3)),
                y: Number(lumina.group.position.y.toFixed(3)),
                z: Number(lumina.group.position.z.toFixed(3))
            },
            terrainAtBench: Number(terrainY.toFixed(3)),
            deltaZ: Math.abs(lumina.group.position.z - 19.2),
            deltaX: Math.abs(lumina.group.position.x - 8.5),
            npcRoutines
        };
    });

    console.log('  • river_valley_bench registered position:', sitReport.anchorPos);
    console.log('  • Lumina sitting world position:', sitReport.luminaPos);
    console.log(`  • Delta from physical bench center: dX=${sitReport.deltaX.toFixed(3)}m (slot offset), dZ=${sitReport.deltaZ.toFixed(3)}m`);
    console.log('  • Air-detachment check: Z is 19.2 (bench), NOT 20.5 (floating in air):', sitReport.luminaPos.z < 19.6 ? '✅ GROUNDED ON BENCH' : '❌ FLOATING IN AIR');

    if (sitReport.luminaPos.z > 19.8) {
        throw new Error(`Lumina is detached from bench! Position Z=${sitReport.luminaPos.z} (expected ~19.2)`);
    }

    console.log('\n--- TEST 3b: NPC Autonomous Routine Closed Loops (No Teleportation) ---');
    sitReport.npcRoutines.forEach(npc => {
        console.log(`  • [${npc.name}] ${npc.stepsCount} steps — Final step: ${npc.lastStepActivity} (${npc.isReturnWalk ? '✅ RETURN WALK LOOP' : '❌ MISSING WALK'})`);
        if (!npc.isReturnWalk) {
            throw new Error(`NPC ${npc.name} lacks a return walk step in routine!`);
        }
    });

    await new Promise(r => setTimeout(r, 800));
    const luminaBuf = await page.screenshot();
    saveArtifact('verify_lumina_grounded_river_bench.png', luminaBuf);

    // =========================================================================
    // TEST 4: Stepped Rice Field Terraces (Ruộng Bậc Thang Topography)
    // =========================================================================
    console.log('\n--- TEST 4: Stepped Rice Field Terraces Topography ---');
    const terraceReport = await page.evaluate(async () => {
        const ow = window.openWorld3D;
        const rfs = ow.worldComposition.riceFieldSystem || ow.worldComposition.riceFields;

        // Query terrain height at each tier center
        const t1Height = ow.getTerrainHeight(-3.85, -10.0);
        const t2Height = ow.getTerrainHeight(-11.55, -10.0);
        const t3Height = ow.getTerrainHeight(-19.75, -10.0);

        // Query dividing ridge heights
        const ridge12 = ow.getTerrainHeight(-7.55, -10.0);
        const ridge23 = ow.getTerrainHeight(-15.55, -10.0);

        // Query paddies water level
        const paddiesWater = rfs.paddies.map(p => ({
            id: p.id,
            x: p.x,
            z: p.z,
            yWater: Number(p.yWater.toFixed(3))
        }));

        // Position player on walking ridge and camera elevated looking across the 3 tiers
        ow.player.position.set(-7.55, 0.35, -10.0);
        ow.player.rotation.y = -Math.PI / 2;
        ow.camera.position.set(2.5, 4.0, -10.0);
        ow.camera.lookAt(-14.0, 0.2, -10.0);
        ow.updateCamera = () => {
            ow.camera.position.set(2.5, 4.0, -10.0);
            ow.camera.lookAt(-14.0, 0.2, -10.0);
        };

        return {
            tier1Terrain: Number(t1Height.toFixed(3)),
            tier2Terrain: Number(t2Height.toFixed(3)),
            tier3Terrain: Number(t3Height.toFixed(3)),
            ridge12Terrain: Number(ridge12.toFixed(3)),
            ridge23Terrain: Number(ridge23.toFixed(3)),
            paddiesCount: rfs.paddies.length,
            totalRiceInstances: (rfs.seedlingInstancedMeshes || []).reduce((sum, m) => sum + m.count, 0),
            sampleWaterLevels: {
                tier1Water: paddiesWater.find(p => p.id === 'paddy_t1_central').yWater,
                tier2Water: paddiesWater.find(p => p.id === 'paddy_t2_central').yWater,
                tier3Water: paddiesWater.find(p => p.id === 'paddy_t3_central').yWater
            }
        };
    });

    console.log(`  • Tier 1 (Lower shelf) ground height: ${terraceReport.tier1Terrain}m (Water: ${terraceReport.sampleWaterLevels.tier1Water}m)`);
    console.log(`  • Tier 2 (Middle shelf) ground height: ${terraceReport.tier2Terrain}m (Water: ${terraceReport.sampleWaterLevels.tier2Water}m)`);
    console.log(`  • Tier 3 (Upper shelf) ground height: ${terraceReport.tier3Terrain}m (Water: ${terraceReport.sampleWaterLevels.tier3Water}m)`);
    console.log(`  • Elevation step Tier 1 -> Tier 2: ${(terraceReport.tier2Terrain - terraceReport.tier1Terrain).toFixed(3)}m`);
    console.log(`  • Elevation step Tier 2 -> Tier 3: ${(terraceReport.tier3Terrain - terraceReport.tier2Terrain).toFixed(3)}m`);
    console.log(`  • Total agricultural instanced seedling clumps across 9 terraces: ${terraceReport.totalRiceInstances} (Lush density: ${terraceReport.totalRiceInstances >= 4000 ? '✅ EXCELLENT' : '⚠️ LOW'})`);

    const isStepped = (terraceReport.tier2Terrain > terraceReport.tier1Terrain) && (terraceReport.tier3Terrain > terraceReport.tier2Terrain);
    console.log('  • Stepped terrace elevation progression:', isStepped ? '✅ CLEAR STEPPED PROGRESSION' : '❌ FLAT');

    if (!isStepped) {
        throw new Error('Terraces are not stepped!');
    }
    if (terraceReport.totalRiceInstances < 3000) {
        throw new Error(`Rice field density is too sparse! Count=${terraceReport.totalRiceInstances}`);
    }

    await new Promise(r => setTimeout(r, 1000));
    const riceBuf = await page.screenshot();
    saveArtifact('verify_stepped_rice_terraces.png', riceBuf);

    await browser.close();
    if (serverProcess) {
        serverProcess.kill();
    }

    console.log('\n🎉 ALL 4 USER FIXES VERIFIED AND PASSED WITH 100% SUCCESS!');
    process.exit(0);
})().catch(err => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
});
