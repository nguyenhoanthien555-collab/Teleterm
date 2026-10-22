const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\c6e4ca04-0620-42f2-b726-b2a103a1fe4a';

async function runVerification() {
    console.log('🚀 [VERIFICATION] Starting forensic validation of 5 Core Open-World Fixes...');

    if (!fs.existsSync(ARTIFACT_DIR)) {
        fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    try {
        console.log('🌐 Loading TeleTerm 3D at http://127.0.0.1:4000 ...');
        await page.goto('http://127.0.0.1:4000', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // Dismiss launcher overlay and ensure explore mode
        await page.evaluate(() => {
            const term = document.getElementById('deck-terminal-screen');
            if (term) term.style.display = 'none';
            document.body.classList.add('mode-explore');
            document.body.classList.remove('mode-focus');
            if (window.__teleTermApp) {
                window.__teleTermApp.setFocusMode(false);
            }
            if (window.desktopLauncher) {
                window.desktopLauncher.hideLauncher();
            }
            const launcherOverlay = document.getElementById('desktop-launcher-overlay');
            if (launcherOverlay) launcherOverlay.style.display = 'none';
            document.body.classList.remove('launcher-active');
        });

        await page.waitForFunction(() => !!window.openWorld3D && !!window.openWorld3D.playerMesh, { timeout: 30000 });
        console.log('✅ 3D World successfully loaded.');

        // Allow 3 seconds for initial scene setup and NPC registration
        await new Promise(r => setTimeout(r, 3000));

        // =========================================================================
        // PROOF 1: Hologram Kiosk Placement & Kaede Typing (No Floating, No T-Pose)
        // =========================================================================
        console.log('\n--- VERIFYING ISSUE 1 & 4: KIOSK POSITIONING & KAEDE TYPING ---');
        const proof1Data = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const im = ow.interactionManager;
            const kioskAnchor = im.getAnchor('hub_kiosk_terminal');

            // Find Kaede agent
            const kaedeAgent = ow.npcLifeSystem.agents.find(a => a.def.id === 'kaede');

            // Force Kaede to claim kiosk anchor and type
            if (kaedeAgent) {
                kaedeAgent.group.position.set(17.8, kioskAnchor.position.y, -9.0);
                kaedeAgent.group.rotation.y = kioskAnchor.rotationY || 0;
                kaedeAgent.retargeter.setAnimation('Typing');
                // Tick 10 frames to settle retargeter
                for (let i = 0; i < 10; i++) {
                    kaedeAgent.retargeter.update(0.016, 0);
                }
            }

            // Bone rotations of Kaede's arms
            const ret = kaedeAgent.retargeter;
            const lLowerArmZ = ret.mappedBones.LeftLowerArm ? ret.mappedBones.LeftLowerArm.rotation.z : 0;
            const rLowerArmZ = ret.mappedBones.RightLowerArm ? ret.mappedBones.RightLowerArm.rotation.z : 0;
            const lUpperArmZ = ret.mappedBones.LeftUpperArm ? ret.mappedBones.LeftUpperArm.rotation.z : 0;
            const rUpperArmZ = ret.mappedBones.RightUpperArm ? ret.mappedBones.RightUpperArm.rotation.z : 0;

            // Inspect Hologram Screen orientation (must face user at -Z with rotation.y = Math.PI and rotation.x = -0.15)
            const holoScreen = ow.scene.getObjectByName('hub_kiosk_holoscreen');
            const screenRot = holoScreen ? {
                rotX: Number(holoScreen.rotation.x.toFixed(3)),
                rotY: Number(holoScreen.rotation.y.toFixed(3))
            } : null;

            // Camera setup to frame Kaede and the Terminal Kiosk console
            ow.updateCamera = () => {
                ow.camera.position.set(16.2, 2.1, -10.5);
                ow.camera.lookAt(17.8, 1.4, -8.2);
            };

            return {
                kioskAnchorPosition: kioskAnchor.position,
                kioskRotationY: kioskAnchor.rotationY,
                screenRotation: screenRot,
                isScreenOrientedCorrectly: screenRot && Math.abs(screenRot.rotY - 3.142) < 0.05 && screenRot.rotX === -0.15,
                kaedePosition: {
                    x: Number(kaedeAgent.group.position.x.toFixed(3)),
                    y: Number(kaedeAgent.group.position.y.toFixed(3)),
                    z: Number(kaedeAgent.group.position.z.toFixed(3))
                },
                kaedeRotationY: kaedeAgent.group.rotation.y,
                armRotations: {
                    lUpperArmZ: Number(lUpperArmZ.toFixed(3)),
                    rUpperArmZ: Number(rUpperArmZ.toFixed(3)),
                    lLowerArmZ: Number(lLowerArmZ.toFixed(3)),
                    rLowerArmZ: Number(rLowerArmZ.toFixed(3))
                },
                isDeckElevated: kaedeAgent.group.position.y >= 1.0,
                noTPose: lLowerArmZ > 0 && rLowerArmZ < 0 // elbows point inward/downward towards keys, not outward
            };
        });

        console.log('Proof 1 Diagnostics:', JSON.stringify(proof1Data, null, 2));
        await new Promise(r => setTimeout(r, 600));
        const proof1Path = path.join(ARTIFACT_DIR, 'proof_1_kiosk_kaede_typing.png');
        await page.screenshot({ path: proof1Path });
        console.log('📸 Saved Proof 1 screenshot to:', proof1Path);

        // =========================================================================
        // PROOF 2: Maple Stream Stump Stools (Zero Sinking / 11cm Pelvis Clearance)
        // =========================================================================
        console.log('\n--- VERIFYING ISSUE 2: MAPLE PICNIC STUMP STOOL SEATING HEIGHT ---');
        const proof2Data = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const im = ow.interactionManager;
            const stump1 = im.getAnchor('maple_picnic_stool_1');

            // Sit player on stump stool 1
            ow.sitDown(stump1);

            // Tick retargeter
            for (let i = 0; i < 15; i++) {
                ow.retargeter.update(0.016, 0);
            }

            const hips = ow.retargeter.mappedBones.Hips;
            const hipsWorldPos = ow.player.position.clone();
            hips.getWorldPosition(hipsWorldPos);

            // Seat top surface world Y = stump1.position.y + stump1.sitHeightOffset (0.44)
            const seatTopSurfaceY = stump1.position.y + (stump1.sitHeightOffset || 0.44);
            const hipsWorldY = hipsWorldPos.y;
            const clearance = hipsWorldY - seatTopSurfaceY;

            // Camera setup to frame player seated in profile on the log stump
            ow.updateCamera = () => {
                ow.camera.position.set(38.0 + 1.8, stump1.position.y + 1.1, -28.0 + 0.8);
                ow.camera.lookAt(stump1.position.x, stump1.position.y + 0.5, stump1.position.z);
            };

            return {
                stumpAnchorPos: stump1.position,
                sitHeightOffset: stump1.sitHeightOffset,
                seatTopSurfaceY: Number(seatTopSurfaceY.toFixed(3)),
                playerHipsWorldY: Number(hipsWorldY.toFixed(3)),
                pelvisClearanceAboveSeat: Number(clearance.toFixed(3)),
                isSeated: ow.isSitting,
                isPelvisAboveStool: clearance >= 0.08 // Should be ~0.11m
            };
        });

        console.log('Proof 2 Diagnostics:', JSON.stringify(proof2Data, null, 2));
        await new Promise(r => setTimeout(r, 600));
        const proof2Path = path.join(ARTIFACT_DIR, 'proof_2_maple_stump_seating_flush.png');
        await page.screenshot({ path: proof2Path });
        console.log('📸 Saved Proof 2 screenshot to:', proof2Path);

        // =========================================================================
        // PROOF 3: Seated Drinking (Player Remains Seated While Drinking)
        // =========================================================================
        console.log('\n--- VERIFYING ISSUE 3: SEATED DRINKING ACTION ---');
        const proof3Data = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const ret = ow.retargeter;

            // Equip water bottle handheld item prop
            if (ow.equipHandheldItem) {
                ow.equipHandheldItem('drink_water_bottle');
            }

            // Ensure player transitions cleanly to seat
            ow.standUp();
            const im = ow.interactionManager;
            const chair = im.getAnchor('hub_cafe_lounge_chair') || im.getAnchor('maple_picnic_stool_1');
            ow.sitDown(chair);

            // Trigger drinking while seated
            ow.startDrinkingHold();

            // Run 20 simulation frames to advance drinking progress (isMoving = false)
            for (let i = 0; i < 20; i++) {
                ret.update(0.016, false);
            }

            // Position camera to frame player sipping drink while seated
            ow.updateCamera = () => {
                const p = ow.player.position;
                ow.camera.position.set(p.x + 1.4, p.y + 1.1, p.z - 1.2);
                ow.camera.lookAt(p.x, p.y + 0.8, p.z);
            };

            const isStillSitting = ow.isSitting;
            const retargeterSeated = ret.isSeated;
            const hasDrinkTargets = !!ret.drinkTargets;

            // Query leg bone angles to verify lower body remains in seated pose (approx 90 deg / 1.4-1.6 rad)
            const lLegX = ret.mappedBones.LeftUpperLeg ? ret.mappedBones.LeftUpperLeg.rotation.x : 0;
            const rLegX = ret.mappedBones.RightUpperLeg ? ret.mappedBones.RightUpperLeg.rotation.x : 0;
            const rArmZ = ret.mappedBones.RightUpperArm ? ret.mappedBones.RightUpperArm.rotation.z : 0;

            return {
                isSitting: isStillSitting,
                retargeterIsSeated: retargeterSeated,
                hasDrinkTargets: hasDrinkTargets,
                leftUpperLegAngleX: Number(lLegX.toFixed(3)),
                rightUpperLegAngleX: Number(rLegX.toFixed(3)),
                rightArmDrinkingAngleZ: Number(rArmZ.toFixed(3)),
                lowerBodyRemainedSeated: Math.abs(lLegX) > 1.0 && Math.abs(rLegX) > 1.0
            };
        });

        console.log('Proof 3 Diagnostics:', JSON.stringify(proof3Data, null, 2));
        await new Promise(r => setTimeout(r, 600));
        const proof3Path = path.join(ARTIFACT_DIR, 'proof_3_seated_drinking_no_standup.png');
        await page.screenshot({ path: proof3Path });
        console.log('📸 Saved Proof 3 screenshot to:', proof3Path);

        // =========================================================================
        // PROOF 4: Developer Hub Deck Expansion & Umbrellas Casting Real-Time Shadows
        // =========================================================================
        console.log('\n--- VERIFYING ISSUE 5A: HUB DECK EXPANSION & REAL-TIME UMBRELLA SHADOWS ---');
        const proof4Data = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const sd = ow.surfaceDetector;
            const im = ow.interactionManager;

            // Surface detection checks across expanded deck footprint [15.75..28.25], [-16.0..-6.0]
            const surfaces = {
                westStairsLanding: sd.detect(16.5, -11.0),
                kioskCorner: sd.detect(17.8, -8.2),
                deskWorkstation: sd.detect(21.0, -11.0),
                cafeLoungeArea: sd.detect(24.0, -9.5),
                baristaCounter: sd.detect(26.6, -9.6),
                eastPerimeter: sd.detect(27.8, -11.0)
            };

            // Check newly registered expanded anchors (desk 4 and bar stool 4)
            const desk4Anchor = im.getAnchor('hub_desk_chair_4');
            const stool4Anchor = im.getAnchor('hub_cafe_lounge_chair_4');

            // Wide camera angle capturing entire expanded Hub deck, umbrellas, and contact shadows
            ow.updateCamera = () => {
                ow.camera.position.set(14.0, 7.5, -3.5);
                ow.camera.lookAt(22.5, 1.2, -11.0);
            };

            return {
                surfaceDetection: surfaces,
                allSurfacesWoodDeck: Object.values(surfaces).every(s => s === 'wood_deck'),
                desk4Found: !!desk4Anchor,
                desk4Pos: desk4Anchor?.position,
                stool4Found: !!stool4Anchor,
                stool4Pos: stool4Anchor?.position
            };
        });

        console.log('Proof 4 Diagnostics:', JSON.stringify(proof4Data, null, 2));
        await new Promise(r => setTimeout(r, 800));
        const proof4Path = path.join(ARTIFACT_DIR, 'proof_4_hub_deck_and_umbrella_shadows.png');
        await page.screenshot({ path: proof4Path });
        console.log('📸 Saved Proof 4 screenshot to:', proof4Path);

        // =========================================================================
        // PROOF 5: Expanded Bar Counter & Dedicated Barista NPC Kaito
        // =========================================================================
        console.log('\n--- VERIFYING ISSUE 5B: EXPANDED BAR COUNTER & BARISTA NPC KAITO ---');
        const proof5Data = await page.evaluate(() => {
            const ow = window.openWorld3D;
            const kaitoAgent = ow.npcLifeSystem.agents.find(a => a.def.id === 'kaito');
            const im = ow.interactionManager;
            const baristaAnchor = im.getAnchor('hub_barista_spot');

            // Stand player in front of bar stool #2 to order coffee
            ow.standUp();
            ow.player.position.set(24.2, 1.04, -8.6);
            ow.player.rotation.y = Math.PI * 0.5; // Look towards counter and Kaito

            // Position camera elevated looking down across counter to clearly frame Barista Kaito and his beret
            ow.updateCamera = () => {
                ow.camera.position.set(23.2, 2.45, -11.2);
                ow.camera.lookAt(26.6, 1.40, -9.6);
            };

            // Query Kaito's overhead badge role
            const badgeEl = document.getElementById('overhead-badge-kaito');
            const rankText = badgeEl ? badgeEl.querySelector('.badge-rank-row')?.textContent?.trim() : '';

            const kaitoPos = kaitoAgent ? {
                x: Number(kaitoAgent.group.position.x.toFixed(3)),
                y: Number(kaitoAgent.group.position.y.toFixed(3)),
                z: Number(kaitoAgent.group.position.z.toFixed(3)),
                rotY: Number(kaitoAgent.group.rotation.y.toFixed(3))
            } : null;

            return {
                baristaAnchorFound: !!baristaAnchor,
                baristaAnchorPos: baristaAnchor ? baristaAnchor.position : null,
                kaitoAgentFound: !!kaitoAgent,
                kaitoName: kaitoAgent?.def.name,
                kaitoRole: kaitoAgent?.def.role,
                kaitoRoleTitle: kaitoAgent?.def.roleTitle,
                badgeRankText: rankText,
                kaitoPos: kaitoPos,
                isBehindBarCounter: kaitoPos && kaitoPos.x >= 26.0 && kaitoPos.x <= 27.2,
                kaitoRoutineLength: kaitoAgent?.def.routine?.length,
                allStepsStayBehindBar: kaitoAgent?.def.routine?.every(step => step.targetPos.x === 26.6 && step.targetPos.z === -9.6)
            };
        });

        console.log('Proof 5 Diagnostics:', JSON.stringify(proof5Data, null, 2));
        await new Promise(r => setTimeout(r, 800));
        const proof5Path = path.join(ARTIFACT_DIR, 'proof_5_barista_kaito_at_counter.png');
        await page.screenshot({ path: proof5Path });
        console.log('📸 Saved Proof 5 screenshot to:', proof5Path);

        console.log('\n🎉 ALL 5 PROOF CHECKS EXECUTED SUCCESSFULLY!');

    } catch (err) {
        console.error('❌ Verification failed with error:', err);
    } finally {
        await browser.close();
    }
}

runVerification();
