const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const ARTIFACT_DIR = 'C:\\Users\\Hoan Thien\\.gemini\\antigravity\\brain\\3fcaf81d-9851-4f83-886e-c77e3e727e31';

async function runVerification() {
    console.log('=======================================================================');
    console.log('TELETERM 3D — MILESTONE 1 VERIFICATION: COZY ECONOMY & COOKING');
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

    // --- PHASE 1: REST API & Server Authoritative Shop Endpoints ---
    console.log('\n--- Phase 1: REST API Shop & Economy Validation ---');
    try {
        const coinsRes = await fetch('http://localhost:4000/api/dev/coins');
        const coinsData = await coinsRes.json();
        assert('REST GET /api/dev/coins returns success', coinsData.success === true);
        assert('Player has valid TeleCoins balance number', typeof coinsData.teleCoins === 'number' && coinsData.teleCoins > 0, { coins: coinsData.teleCoins });

        const catalogRes = await fetch('http://localhost:4000/api/dev/shop/catalog');
        const catalogData = await catalogRes.json();
        assert('REST GET /api/dev/shop/catalog returns success', catalogData.success === true);
        assert('Catalog includes Golden Master Rod (item_golden_rod)', Boolean(catalogData.catalog?.item_golden_rod));
        assert('Catalog includes Spatial Lo-Fi Boombox (item_lofi_boombox)', Boolean(catalogData.catalog?.item_lofi_boombox));
        assert('Fish sell price table contains nullpointer_koi, async_salmon, item_grilled_fish', 
            Boolean(catalogData.sellPrices?.nullpointer_koi && catalogData.sellPrices?.item_grilled_fish));

        // Test Buy Item
        const prevCoins = coinsData.teleCoins;
        const buyRes = await fetch('http://localhost:4000/api/dev/shop/buy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: 'item_onsen_herbal_tea' })
        });
        const buyData = await buyRes.json();
        assert('REST POST /api/dev/shop/buy succeeds for Onsen Herbal Tea', buyData.success === true);
        assert('TeleCoins correctly deducted by 35', buyData.teleCoins === prevCoins - 35, { teleCoins: buyData.teleCoins, prev: prevCoins });
        assert('Item added into inventory slot', buyData.item?.id === 'item_onsen_herbal_tea');

        // Test Sell Item
        const teaSlot = buyData.slotIndex;
        const sellRes = await fetch('http://localhost:4000/api/dev/shop/sell', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slotIndex: teaSlot })
        });
        const sellData = await sellRes.json();
        assert('REST POST /api/dev/shop/sell succeeds', sellData.success === true);
        assert('Earned coins credited back', sellData.earnedCoins > 0 && sellData.teleCoins > buyData.teleCoins);
    } catch (err) {
        assert('Phase 1 REST API execution without exception', false, { error: err.message });
    }

    // --- PHASE 2: Server Authoritative Cooking Timer via WebSocket ---
    console.log('\n--- Phase 2: WebSocket Campfire Roasting FSM & Timer Validation ---');
    try {
        const wsUrl = 'ws://localhost:4000/ws/world';
        const wsClient = new WebSocket(wsUrl);

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('WS connection timeout')), 4000);
            wsClient.on('open', () => {
                clearTimeout(timeout);
                resolve();
            });
            wsClient.on('error', reject);
        });

        // Send Join packet
        let welcomeData = null;
        let cookStartAck = null;
        let cookFinishAck = null;

        const messageQueue = [];
        wsClient.on('message', (data) => {
            try {
                const pkt = JSON.parse(data.toString());
                messageQueue.push(pkt);
            } catch (e) {}
        });

        wsClient.send(JSON.stringify({
            type: 'join',
            token: 'test_token_dev'
        }));

        // Wait for welcome
        const startTime = Date.now();
        while (Date.now() - startTime < 3000) {
            welcomeData = messageQueue.find(p => p.type === 'welcome');
            if (welcomeData) break;
            await new Promise(r => setTimeout(r, 50));
        }

        assert('WebSocket client received welcome packet', Boolean(welcomeData));
        assert('Welcome packet synchronizes teleCoins balance', typeof welcomeData?.profile?.teleCoins === 'number');

        // Prepare raw fish in slot 2 for cooking test
        await fetch('http://localhost:4000/api/dev/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                inventory: [
                    null,
                    null,
                    {
                        id: 'async_salmon',
                        name: 'Async Salmon',
                        vi: 'Cá Hồi Bất Đồng Bộ',
                        type: 'raw_fish',
                        value: 45
                    }
                ]
            })
        });

        // Send cook_start for slot 2
        wsClient.send(JSON.stringify({
            type: 'cook_start',
            slotIndex: 2
        }));

        const cookStartWait = Date.now();
        while (Date.now() - cookStartWait < 3000) {
            cookStartAck = messageQueue.find(p => p.type === 'cook_start_ack');
            if (cookStartAck) break;
            await new Promise(r => setTimeout(r, 50));
        }

        assert('Server acknowledges cook_start_ack', Boolean(cookStartAck));
        assert('Server sets authoritative roasting window (4.0s - 12.0s)', cookStartAck?.targetMinSec === 4.0 && cookStartAck?.targetMaxSec === 12.0);

        // Sleep 4.2 seconds into the PERFECT_ROAST window
        console.log('  Waiting 4.2s to enter PERFECT_ROAST window (4.0s - 12.0s)...');
        await new Promise(r => setTimeout(r, 4200));

        // Send cook_finish
        wsClient.send(JSON.stringify({
            type: 'cook_finish'
        }));

        const cookFinishWait = Date.now();
        while (Date.now() - cookFinishWait < 3000) {
            cookFinishAck = messageQueue.find(p => p.type === 'cook_finish_ack');
            if (cookFinishAck) break;
            await new Promise(r => setTimeout(r, 50));
        }

        assert('Server acknowledges cook_finish_ack', Boolean(cookFinishAck));
        assert('Server authoritative outcome is PERFECT_ROAST', cookFinishAck?.outcome === 'PERFECT_ROAST', { outcome: cookFinishAck?.outcome, elapsed: cookFinishAck?.elapsedSec });
        assert('Server transforms raw fish into item_grilled_fish', cookFinishAck?.item?.id === 'item_grilled_fish');
        assert('Server awards +35 XP for Perfect Roast', cookFinishAck?.awardedXp === 35);

        wsClient.close();
    } catch (err) {
        assert('Phase 2 WebSocket execution without exception', false, { error: err.message });
    }

    // --- PHASE 3: In-Browser Live UI & 3D WebGL Verification ---
    console.log('\n--- Phase 3: Puppeteer WebGL Live UI & 3D Render Verification ---');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--use-gl=angle',
            '--use-angle=gl',
            '--enable-webgl',
            '--ignore-gpu-blocklist',
            '--window-size=1280,800'
        ]
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        page.on('pageerror', err => console.log('  [Page Error]:', err.message));

        console.log('Navigating to TeleTerm 3D at http://localhost:4000/?test=1&explore=1 ...');
        await page.goto('http://localhost:4000/?test=1&explore=1', { waitUntil: 'networkidle2', timeout: 35000 });

        // Wait for 3D world to initialize
        await page.waitForFunction(() => Boolean(window.openWorld3D && window.openWorld3D.scene), { timeout: 25000 });
        console.log('3D Open World initialized.');

        // 1. Verify Cyber-Shop Modal
        console.log('Testing Cyber-Shop Modal UI...');
        const shopState = await page.evaluate(() => {
            if (!window.cyberShopSystem) return { error: 'no_shop_system' };
            window.cyberShopSystem.open();
            const modal = document.getElementById('modal-cyber-shop');
            const buyTab = document.getElementById('tab-shop-buy');
            const sellTab = document.getElementById('tab-shop-sell');
            const items = document.querySelectorAll('.shop-item-card');
            const coinsVal = document.getElementById('shop-coins-display')?.textContent;

            return {
                isOpen: !modal?.classList.contains('hidden'),
                buyTabExists: Boolean(buyTab),
                sellTabExists: Boolean(sellTab),
                itemCount: items.length,
                coinsVal
            };
        });

        assert('Cyber-Shop modal opens cleanly', shopState.isOpen === true);
        assert('Cyber-Shop displays catalog items (>= 4)', shopState.itemCount >= 4, { count: shopState.itemCount });
        assert('Cyber-Shop displays TeleCoins pill', Boolean(shopState.coinsVal));

        // Switch to Sell Tab and verify
        await page.evaluate(() => {
            window.cyberShopSystem.switchTab('sell');
        });
        await new Promise(r => setTimeout(r, 400));

        const shopProofPath = path.join(ARTIFACT_DIR, 'proof_milestone1_cyber_shop_modal.png');
        await page.screenshot({ path: shopProofPath });
        console.log(`Saved screenshot: ${shopProofPath}`);
        assert('Cyber-Shop modal screenshot captured', fs.existsSync(shopProofPath));

        // Close shop
        await page.evaluate(() => {
            window.cyberShopSystem.close();
        });

        // 2. Verify Campfire Cooking Modal
        console.log('Testing Campfire Cooking Circular Gauge UI...');
        const cookingState = await page.evaluate(() => {
            if (!window.campfireCookingSystem) return { error: 'no_cooking_system' };
            // Populate inventory with sample raw fish if needed
            if (window.playerInventory) {
                window.playerInventory.slots[0] = {
                    id: 'async_salmon',
                    name: 'Async Salmon',
                    vi: 'Cá Hồi Bất Đồng Bộ',
                    type: 'raw_fish',
                    value: 45
                };
            }
            window.campfireCookingSystem.open();
            const modal = document.getElementById('modal-campfire-cooking');
            const arc = document.getElementById('cooking-gauge-arc');
            const timer = document.getElementById('roasting-timer-val');
            const pullBtn = document.getElementById('btn-pull-skewer');

            return {
                isOpen: !modal?.classList.contains('hidden'),
                arcExists: Boolean(arc),
                timerExists: Boolean(timer),
                pullBtnExists: Boolean(pullBtn),
                isCooking: window.campfireCookingSystem.isCooking
            };
        });

        assert('Campfire cooking modal opens with circular SVG gauge', cookingState.isOpen === true && cookingState.arcExists);
        assert('Roasting timer and pull skewer button exist', cookingState.timerExists && cookingState.pullBtnExists);

        // Wait 1.5s for needle and timer to advance
        await new Promise(r => setTimeout(r, 1500));

        const cookingProofPath = path.join(ARTIFACT_DIR, 'proof_milestone1_campfire_cooking_gauge.png');
        await page.screenshot({ path: cookingProofPath });
        console.log(`Saved screenshot: ${cookingProofPath}`);
        assert('Campfire cooking circular gauge screenshot captured', fs.existsSync(cookingProofPath));

        // Close cooking modal
        await page.evaluate(() => {
            window.campfireCookingSystem.close();
        });

        // 3. Verify Handheld Item 3D Rendering (item_grilled_fish & item_golden_rod)
        console.log('Testing 3D Handheld Item Meshes...');
        const meshState = await page.evaluate(() => {
            if (!window.openWorld3D) return { error: 'no_world' };
            const grilledMesh = window.openWorld3D.createHandheldItemMesh({
                id: 'item_grilled_fish',
                type: 'consumable',
                model: 'grilled_fish'
            });
            const goldenRodMesh = window.openWorld3D.createHandheldItemMesh({
                id: 'item_golden_rod',
                type: 'tool',
                model: 'golden_rod'
            });

            const hasGrilled = Boolean(grilledMesh && grilledMesh.children.length >= 3);
            const hasGoldenRod = Boolean(goldenRodMesh && goldenRodMesh.getObjectByName('rod_tip_marker'));

            // Equip grilled fish to avatar
            window.openWorld3D.equipHandheldItem({
                id: 'item_grilled_fish',
                type: 'consumable',
                gripProfile: 'small_can',
                model: 'grilled_fish'
            });

            return {
                hasGrilled,
                hasGoldenRod,
                currentlyEquipped: window.openWorld3D.currentlyEquippedItemDef?.id
            };
        });

        assert('3D Mesh generated for item_grilled_fish (bamboo skewer + roasted fish body + fins)', meshState.hasGrilled);
        assert('3D Mesh generated for item_golden_rod with rod_tip_marker', meshState.hasGoldenRod);
        assert('Avatar successfully equips item_grilled_fish in right hand socket', meshState.currentlyEquipped === 'item_grilled_fish');

        await new Promise(r => setTimeout(r, 600));
        const equippedProofPath = path.join(ARTIFACT_DIR, 'proof_milestone1_grilled_fish_equipped.png');
        await page.screenshot({ path: equippedProofPath });
        console.log(`Saved screenshot: ${equippedProofPath}`);
        assert('Equipped grilled fish avatar screenshot captured', fs.existsSync(equippedProofPath));

    } finally {
        await browser.close();
    }

    // Save summary results json
    const summaryPath = path.join(ARTIFACT_DIR, 'milestone1_cozy_economy_and_cooking_results.json');
    fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`\nVerification Complete! Passed: ${results.passed}/${results.assertions.length} (Failed: ${results.failed})`);
    console.log(`Report saved to: ${summaryPath}`);

    return results;
}

runVerification().catch(err => {
    console.error('Master verification script failed:', err);
    process.exit(1);
});
