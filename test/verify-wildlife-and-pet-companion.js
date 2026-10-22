/**
 * TELETERM 3D — MILESTONE 5 VERIFICATION SUITE
 * LIVING WILDLIFE ECOSYSTEM & INTERACTIVE PET COMPANIONS
 * 
 * Verifies:
 * 1. WebSocket Pet State Synchronization & Multi-Peer Replication Protocol
 * 2. Pet Feeding with Campfire Roasted Fish & Inventory/XP Integration
 * 3. Puppeteer 3D Procedural Rig (Shiba Inu & Calico Cat), Quadruped Gait Kinematics
 * 4. 3D Heart Emote Particles, Petting [E], Audio Synthesis & Cyber-Cozy Pet HUD Modal
 */

const WebSocket = require('ws');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/Hoan Thien/.gemini/antigravity/brain/3fcaf81d-9851-4f83-886e-c77e3e727e31');

async function runMilestone5Verification() {
    console.log('=======================================================================');
    console.log('TELETERM 3D — MILESTONE 5 VERIFICATION: WILDLIFE & PET COMPANIONS');
    console.log('=======================================================================');

    const results = {
        total: 0,
        passed: 0,
        failed: 0,
        assertions: []
    };

    function assert(desc, condition, details = null) {
        results.total += 1;
        if (condition) {
            results.passed += 1;
            console.log(`  [PASS] ${desc}`);
            results.assertions.push({ desc, status: 'PASS' });
        } else {
            results.failed += 1;
            console.error(`  [FAIL] ${desc}`, details || '');
            results.assertions.push({ desc, status: 'FAIL', details });
        }
    }

    // --- PHASE 1: Multi-Client WebSocket Pet State Synchronization ---
    console.log('\n--- Phase 1: WebSocket Pet Synchronization & Remote Replication Protocol ---');
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

        // Handshake Student A & B
        clientA.send(JSON.stringify({ type: 'join', username: 'StudentA' }));
        clientB.send(JSON.stringify({ type: 'join', username: 'StudentB' }));
        await new Promise(r => setTimeout(r, 600));

        const welcomeA = queueA.find(p => p.type === 'welcome');
        assert('Client A receives welcome packet with pets array', Array.isArray(welcomeA?.pets));

        // 1. Client A broadcasts pet sync (10Hz protocol)
        queueA.length = 0;
        queueB.length = 0;
        clientA.send(JSON.stringify({
            type: 'pet_sync',
            petId: 'pet_shiba_student_a',
            species: 'shiba',
            state: 'FOLLOW',
            position: { x: 14.5, y: 0.8, z: -10.2 },
            velocity: { x: 1.5, y: 0, z: 0.8 },
            yaw: 1.57,
            happiness: 85,
            stamina: 95
        }));
        await new Promise(r => setTimeout(r, 400));

        const petSyncB = queueB.find(p => p.type === 'pet_sync_broadcast');
        assert('Remote Peer B receives pet_sync_broadcast from Client A', Boolean(petSyncB));
        assert('Remote Pet sync preserves species, state, and coordinates',
            petSyncB?.species === 'shiba' && petSyncB?.state === 'FOLLOW' && petSyncB?.position?.x === 14.5,
            petSyncB
        );

        // 2. Client A triggers Petting [E] interaction
        queueA.length = 0;
        queueB.length = 0;
        clientA.send(JSON.stringify({
            type: 'pet_interact',
            petId: 'pet_shiba_student_a',
            action: 'pet',
            position: { x: 14.5, y: 0.8, z: -10.2 }
        }));
        await new Promise(r => setTimeout(r, 400));

        const petInteractB = queueB.find(p => p.type === 'pet_interact_broadcast');
        assert('Remote peers receive pet_interact_broadcast for petting action',
            petInteractB?.action === 'pet' && petInteractB?.petId === 'pet_shiba_student_a',
            petInteractB
        );

        // 3. Test Pet Despawn on Disconnect
        queueB.length = 0;
        clientA.close();
        await new Promise(r => setTimeout(r, 400));

        const despawnB = queueB.find(p => p.type === 'pet_despawn');
        assert('Remote peers receive pet_despawn notification when owner leaves', Boolean(despawnB));

    } catch (err) {
        assert('Phase 1 WebSocket Pet synchronization without exception', false, { error: err.message });
    } finally {
        if (clientA && clientA.readyState === WebSocket.OPEN) clientA.close();
        if (clientB && clientB.readyState === WebSocket.OPEN) clientB.close();
    }

    // --- PHASE 2: Pet Feeding with Campfire Roasted Fish Integration ---
    console.log('\n--- Phase 2: Pet Feeding with Roasted Fish & Inventory Integration ---');
    let feedClient = null;
    try {
        const profileRepo = require('../src/server/persistence/profile-repository.js');
        const uniqueId = 'feeder_' + Date.now();
        const testUser = 'dev_' + uniqueId;
        const profile = profileRepo.getOrCreate(testUser, { username: uniqueId });

        if (!Array.isArray(profile.inventory)) profile.inventory = Array(36).fill(null);
        // Place Campfire Skewered Fish in slot 0
        profile.inventory[0] = {
            id: 'item_grilled_fish',
            name: 'Campfire Skewered Fish',
            type: 'consumable',
            value: 35
        };
        profileRepo.save(profile);

        const ws = new WebSocket('ws://localhost:4000/ws/world');
        const queue = [];
        await new Promise(resolve => {
            ws.on('open', resolve);
            ws.on('message', d => {
                try { queue.push(JSON.parse(d.toString())); } catch (e) {}
            });
        });
        feedClient = ws;

        ws.send(JSON.stringify({ type: 'join', username: uniqueId }));
        await new Promise(r => setTimeout(r, 600));

        queue.length = 0;
        ws.send(JSON.stringify({
            type: 'pet_interact',
            action: 'feed',
            petId: 'pet_feeder_shiba',
            position: { x: 15.0, y: 0.8, z: 16.0 }
        }));
        await new Promise(r => setTimeout(r, 600));

        const feedAck = queue.find(p => p.type === 'pet_feed_ack');
        assert('Server acknowledges pet feeding with pet_feed_ack', feedAck?.success === true, feedAck);
        assert('Inventory slot 0 is consumed and updated', feedAck?.inventory?.[0] === null);

        profileRepo.init(); // Reload from disk to verify server-side disk persistence
        const updatedProfile = profileRepo.get(testUser);
        assert('Profile inventory persisted without consumed fish', updatedProfile.inventory[0] === null);

    } catch (err) {
        assert('Phase 2 Pet Feeding integration without exception', false, { error: err.message });
    } finally {
        if (feedClient && feedClient.readyState === WebSocket.OPEN) feedClient.close();
    }

    // --- PHASE 3: Puppeteer 3D Model, Kinematics, Hearts & HUD ---
    console.log('\n--- Phase 3: Puppeteer 3D Pet Rig, Kinematics, 3D Hearts & HUD Modal ---');
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
        page.on('console', msg => {
            const txt = msg.text();
            if (txt.includes('Pet') || txt.includes('Error') || txt.includes('error') || txt.includes('exception')) {
                console.log('  [BROWSER]', txt);
            }
        });
        page.on('pageerror', err => console.error('  [PAGE ERROR]', err.message));

        console.log('Navigating to http://localhost:4000/?direct=1...');
        await page.goto('http://localhost:4000/?direct=1', { waitUntil: 'domcontentloaded', timeout: 35000 });

        await page.waitForFunction(() => {
            return window.openWorld3D &&
                   (window.petCompanionSystem || window.openWorld3D.petCompanionSystem) &&
                   (window.petCompanionSystem?.localPet || window.openWorld3D.petCompanionSystem?.localPet);
        }, { timeout: 25000 });

        console.log('Pet Companion System initialized.');

        // 1. Procedural 3D Rig Structure
        const rigState = await page.evaluate(() => {
            const petSys = window.petCompanionSystem || window.openWorld3D?.petCompanionSystem;
            const pet = petSys?.localPet;
            return {
                species: pet?.species,
                hasBody: Boolean(pet?.bodyGroup),
                hasHead: Boolean(pet?.headGroup),
                legCount: pet?.legs?.length || 0,
                hasTail: Boolean(pet?.tailGroup),
                happiness: pet?.happiness,
                stamina: pet?.stamina
            };
        });

        assert('PetEntity instantiated with Shiba Inu default species', rigState.species === 'shiba');
        assert('Procedural 3D Rig contains torso, cute head, collar and fluffy tail', 
            rigState.hasBody && rigState.hasHead && rigState.hasTail
        );
        assert('Quadruped rig contains 4 articulated legs (FL, FR, BL, BR)', rigState.legCount === 4);

        // 2. Test Quadruped Trot Kinematics (Leg swing angles during movement)
        const trotKinematics = await page.evaluate(() => {
            const petSys = window.petCompanionSystem || window.openWorld3D?.petCompanionSystem;
            const pet = petSys?.localPet;
            pet.speed = 4.0;
            pet.state = 'FOLLOW';
            // Simulate 0.3s of movement
            pet.update(0.3, { x: 5.0, y: 0.8, z: 5.0 });

            const rotFL = pet.legs.find(l => l.id === 'FL').pivot.rotation.x;
            const rotFR = pet.legs.find(l => l.id === 'FR').pivot.rotation.x;

            return {
                rotFL: Number(rotFL.toFixed(3)),
                rotFR: Number(rotFR.toFixed(3)),
                diagonalAlternation: (rotFL * rotFR) < 0 // Opposite phase swing
            };
        });

        assert('Quadruped trot gait articulates opposite phase diagonal leg swings',
            trotKinematics.diagonalAlternation,
            trotKinematics
        );

        // 3. Frame camera on Shiba Inu and capture screenshot
        await page.evaluate(() => {
            const petSys = window.petCompanionSystem || window.openWorld3D?.petCompanionSystem;
            const pet = petSys?.localPet;
            pet.position.set(2.0, 0.05, 2.0);
            pet.state = 'IDLE';
            pet.update(0.016, { x: 0, y: 0.05, z: 0 });

            if (window.openWorld3D?.camera) {
                window.openWorld3D.camera.position.set(2.0, 1.2, 4.2);
                window.openWorld3D.camera.lookAt(2.0, 0.35, 2.0);
            }
        });
        await new Promise(r => setTimeout(r, 400));

        const proofShiba = path.join(ARTIFACT_DIR, 'proof_milestone5_shiba_model.png');
        await page.screenshot({ path: proofShiba, fullPage: false });
        console.log(`  [PROOF] Saved Shiba Inu model proof to: ${proofShiba}`);
        assert('Screenshot proof_milestone5_shiba_model.png captured', fs.existsSync(proofShiba));

        // 4. Test Petting [E] & Floating 3D Heart Emote FX
        const heartState = await page.evaluate(() => {
            const petSys = window.petCompanionSystem;
            petSys.triggerPetting();
            const pet = petSys.localPet;

            return {
                happiness: pet.happiness,
                heartCount: pet.activeHearts.length,
                isInteracting: pet.state === 'INTERACT'
            };
        });

        assert('Petting [E] increments happiness (+5) and enters INTERACT state',
            heartState.happiness > 80 && heartState.isInteracting,
            heartState
        );
        assert('Petting spawns floating 3D Heart Emote particles', heartState.heartCount >= 3, heartState);

        // Wait 250ms for hearts to ascend and frame screenshot
        await new Promise(r => setTimeout(r, 250));
        const proofHearts = path.join(ARTIFACT_DIR, 'proof_milestone5_pet_heart_burst.png');
        await page.screenshot({ path: proofHearts, fullPage: false });
        console.log(`  [PROOF] Saved 3D Heart Emote proof to: ${proofHearts}`);
        assert('Screenshot proof_milestone5_pet_heart_burst.png captured', fs.existsSync(proofHearts));

        // 5. Test Species Switching to Calico Cat
        const catState = await page.evaluate(() => {
            const petSys = window.petCompanionSystem;
            petSys.switchSpecies('cat');
            return {
                currentSpecies: petSys.currentSpecies,
                modelSpecies: petSys.localPet.species
            };
        });

        assert('Companion successfully switches species to Calico Cat',
            catState.currentSpecies === 'cat' && catState.modelSpecies === 'cat',
            catState
        );

        await new Promise(r => setTimeout(r, 400));
        const proofCat = path.join(ARTIFACT_DIR, 'proof_milestone5_calico_cat_model.png');
        await page.screenshot({ path: proofCat, fullPage: false });
        console.log(`  [PROOF] Saved Calico Cat model proof to: ${proofCat}`);
        assert('Screenshot proof_milestone5_calico_cat_model.png captured', fs.existsSync(proofCat));

        // 6. Test Pet Companion HUD Modal
        await page.evaluate(() => {
            window.petCompanionSystem.open();
        });
        await new Promise(r => setTimeout(r, 400));

        const hudModalState = await page.evaluate(() => {
            const modal = document.getElementById('modal-pet-companion');
            const happinessBar = document.getElementById('pet-happiness-bar');
            const staminaBar = document.getElementById('pet-stamina-bar');
            const titleEl = document.getElementById('pet-name-title');

            return {
                isVisible: modal && !modal.classList.contains('hidden'),
                hasHappiness: Boolean(happinessBar),
                hasStamina: Boolean(staminaBar),
                titleText: titleEl ? titleEl.textContent.trim() : ''
            };
        });

        assert('Pet Companion HUD modal is visible when opened', hudModalState.isVisible);
        assert('Pet HUD displays live Happiness bar, Stamina bar and Title',
            hudModalState.hasHappiness && hudModalState.hasStamina && hudModalState.titleText.length > 0,
            hudModalState
        );

        const proofHud = path.join(ARTIFACT_DIR, 'proof_milestone5_pet_hud_modal.png');
        await page.screenshot({ path: proofHud, fullPage: false });
        console.log(`  [PROOF] Saved Pet HUD modal proof to: ${proofHud}`);
        assert('Screenshot proof_milestone5_pet_hud_modal.png captured', fs.existsSync(proofHud));

    } catch (err) {
        assert('Phase 3 Puppeteer 3D Pet Rig verification without exception', false, { error: err.message });
    } finally {
        if (browser) await browser.close();
    }

    // --- SUMMARY ---
    console.log('\n=======================================================================');
    const passRate = ((results.passed / results.total) * 100).toFixed(1);
    console.log(`MILESTONE 5 VERIFICATION SUMMARY: ${results.passed}/${results.total} (${passRate}%) PASSED`);
    console.log('=======================================================================');

    const artifactPath = path.join(ARTIFACT_DIR, 'milestone5_wildlife_and_pets_results.json');
    fs.writeFileSync(artifactPath, JSON.stringify(results, null, 2));
    console.log(`Saved results artifact: ${artifactPath}`);

    if (results.failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runMilestone5Verification().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});
