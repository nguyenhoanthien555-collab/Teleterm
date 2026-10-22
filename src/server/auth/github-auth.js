/**
 * Developer Identity & GitHub 1-Tap Auth
 * TeleTerm Master Architecture v2 - Section 10
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const profileRepo = require('../persistence/profile-repository');
const assetValidator = require('../avatar/asset-validator');
const xpService = require('../progression/xp-service');
const logger = require('../logger');
const security = require('./security');

const router = express.Router();

const CUSTOM_MODELS_DIR = process.env.TELETERM_USER_DATA_PATH
    ? path.join(process.env.TELETERM_USER_DATA_PATH, 'models', 'custom')
    : path.join(__dirname, '../../../public/models/custom');

// Ensure directory exists safely
try {
    if (!fs.existsSync(CUSTOM_MODELS_DIR)) {
        fs.mkdirSync(CUSTOM_MODELS_DIR, { recursive: true });
    }
} catch (e) {
    // Read-only filesystem fallback
}

// Every route here is mounted behind authenticated player middleware.
router.use((req, res, next) => {
    if (!req.authSession?.userId) return res.status(401).json({ success: false, error: 'authentication_required' });
    next();
});

// Profile Fetch / Update
router.get('/me', (req, res) => {
    const userId = req.authSession.userId;

    const profile = profileRepo.get(userId);
    if (!profile) {
        return res.status(404).json({ success: false, error: 'profile_not_found' });
    }

    res.json({ success: true, profile: security.publicProfile(profile) });
});

router.post('/profile', (req, res) => {
    const userId = req.authSession.userId;

    const profile = profileRepo.get(userId);
    if (!profile) {
        return res.status(404).json({ success: false, error: 'profile_not_found' });
    }

    const { displayName, presetId, customColors } = req.body || {};
    if (displayName) profile.displayName = String(displayName).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 30) || profile.displayName;
    if (typeof presetId === 'string' && /^[a-z0-9_-]{1,64}$/i.test(presetId)) profile.presetId = presetId;
    if (customColors && typeof customColors === 'object' && !Array.isArray(customColors)) {
        const validColor = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
        const allowedColors = ['hair', 'eyes', 'outfit', 'aura'];
        const sanitized = Object.fromEntries(allowedColors.filter(key => validColor(customColors[key])).map(key => [key, customColors[key]]));
        if (Object.keys(sanitized).length) profile.customColors = { ...profile.customColors, ...sanitized };
    }

    profileRepo.save(profile);
    res.json({ success: true, profile: security.publicProfile(profile) });
});

// 3. Top Leaderboard
router.get('/leaderboard', (req, res) => {
    const top = profileRepo.getAllTopPlayers(10_000)
        .filter(profile => profile.verifiedAccount === true)
        .slice(0, 15)
        .map(profile => security.publicProfile(profile));
    res.json({ success: true, leaderboard: top });
});

// 4. Custom 3D Avatar Upload with Strict 12MB Budget
router.post('/upload-avatar', express.raw({ type: ['application/octet-stream', 'model/gltf-binary'], limit: '15mb' }), (req, res) => {
    const userId = req.authSession.userId;
    if (!Buffer.isBuffer(req.body)) return res.status(400).json({ success: false, error: 'invalid_model_payload' });

    const filename = req.headers['x-filename'] || 'model.glb';
    const validation = assetValidator.validateBuffer(req.body, filename);

    if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
    }

    try {
        const safeFilename = `${userId}_${Date.now()}.${validation.format}`;
        const targetPath = path.join(CUSTOM_MODELS_DIR, safeFilename);
        fs.writeFileSync(targetPath, req.body);

        const publicUrl = `/models/custom/${safeFilename}`;
        const profile = profileRepo.get(userId);
        if (profile) {
            profile.customModelUrl = publicUrl;
            profileRepo.save(profile);
        }

        logger.info(`[Avatar] User ${userId} uploaded valid 3D model (${(validation.sizeBytes / 1024 / 1024).toFixed(2)}MB) -> ${publicUrl}`);

        res.json({
            success: true,
            modelUrl: publicUrl,
            sizeBytes: validation.sizeBytes,
            message: 'Model 3D đã được thẩm định an toàn và nạp vào hồ sơ!'
        });
    } catch (err) {
        logger.error('[Avatar] Failed to save custom model:', err.message);
        res.status(500).json({ success: false, error: 'Lỗi máy chủ khi lưu file model 3D' });
    }
});
// 5. Debug XP Report (Master Spec v4 Section 70)
router.get('/debug-xp', (req, res) => {
    const userId = req.authSession.userId;
    const report = xpService.getDebugXpReport(userId);
    res.json({ success: true, ...report });
});

// 6. Full Player Inventory & 9-Slot Hotbar (Minecraft-Style 36 Slots Total)
router.get('/inventory', (req, res) => {
    const userId = req.authSession.userId;
    const profile = profileRepo.getOrCreate(userId);
    let inv = profile.inventory || [];
    if (!Array.isArray(inv)) inv = [];
    while (inv.length < 36) inv.push(null);
    profile.inventory = inv;

    res.json({
        success: true,
        inventory: profile.inventory,
        equippedItem: profile.equippedItem || null,
        unlockedRewards: profile.unlockedRewards || []
    });
});

router.post('/inventory', (req, res) => {
    const userId = req.authSession.userId;
    const profile = profileRepo.getOrCreate(userId);
    const { inventory, equippedItem } = req.body || {};

    if (Array.isArray(inventory)) {
        let inv = inventory.slice(0, 36);
        while (inv.length < 36) inv.push(null);
        profile.inventory = inv;
    }
    if (equippedItem !== undefined) {
        profile.equippedItem = equippedItem;
    }
    profileRepo.save(profile);

    res.json({
        success: true,
        inventory: profile.inventory,
        equippedItem: profile.equippedItem
    });
});

// 7. Vending Machine Interaction
router.post('/vending/vend', (req, res) => {
    const userId = req.authSession.userId;
    const profile = profileRepo.getOrCreate(userId);
    if (!profile.inventory || !Array.isArray(profile.inventory)) {
        profile.inventory = Array(36).fill(null);
    }
    while (profile.inventory.length < 36) {
        profile.inventory.push(null);
    }

    const drinkItem = {
        id: 'drink_green_tea',
        name: 'Iced Green Tea Can',
        vi: 'Lon Trà Xanh Lạnh',
        type: 'consumable',
        holdable: true,
        stackable: false,
        handPose: 'small_can',
        useAnimation: 'DrinkCan',
        useSound: 'drink_soft',
        vfx: null
    };

    // Prioritize hotbar slots (0..8), then storage slots (9..35)
    let emptyIdx = profile.inventory.findIndex((s, idx) => idx < 9 && s === null);
    if (emptyIdx === -1) {
        emptyIdx = profile.inventory.findIndex(s => s === null);
    }

    if (emptyIdx === -1) {
        return res.status(400).json({ success: false, error: 'inventory_full', message: 'Túi đồ đã đầy (36/36 ô)!' });
    }

    profile.inventory[emptyIdx] = { ...drinkItem, slotIndex: emptyIdx };
    profileRepo.save(profile);

    res.json({
        success: true,
        item: profile.inventory[emptyIdx],
        slotIndex: emptyIdx,
        inventory: profile.inventory
    });
});

// 8. Cyber-Shop & TeleCoins Economy Endpoints
router.get('/coins', (req, res) => {
    const userId = req.authSession.userId;
    const profile = profileRepo.getOrCreate(userId);
    res.json({
        success: true,
        teleCoins: typeof profile.teleCoins === 'number' ? profile.teleCoins : 120
    });
});

router.get('/shop/catalog', (req, res) => {
    const gateway = require('../realtime/gateway');
    res.json({
        success: true,
        catalog: gateway.SHOP_CATALOG,
        sellPrices: gateway.FISH_SELL_PRICES
    });
});

router.post('/shop/buy', (req, res) => {
    const userId = req.authSession.userId;
    const profile = profileRepo.getOrCreate(userId);
    const { itemId } = req.body || {};
    const gateway = require('../realtime/gateway');
    const catalogItem = gateway.SHOP_CATALOG[itemId];

    if (!catalogItem) {
        return res.status(404).json({ success: false, error: 'item_not_found' });
    }

    if (typeof profile.teleCoins !== 'number') profile.teleCoins = 120;
    if (profile.teleCoins < catalogItem.price) {
        return res.status(400).json({ success: false, error: 'insufficient_coins', teleCoins: profile.teleCoins });
    }

    if (!Array.isArray(profile.inventory)) profile.inventory = Array(36).fill(null);
    while (profile.inventory.length < 36) profile.inventory.push(null);

    const emptyIdx = profile.inventory.findIndex(s => s === null);
    if (emptyIdx === -1) {
        return res.status(400).json({ success: false, error: 'inventory_full' });
    }

    profile.teleCoins -= catalogItem.price;
    const newItem = { ...catalogItem, slotIndex: emptyIdx };
    profile.inventory[emptyIdx] = newItem;
    profileRepo.save(profile);

    res.json({
        success: true,
        item: newItem,
        slotIndex: emptyIdx,
        teleCoins: profile.teleCoins,
        inventory: profile.inventory
    });
});

router.post('/shop/sell', (req, res) => {
    const userId = req.authSession.userId;
    const profile = profileRepo.getOrCreate(userId);
    const { slotIndex } = req.body || {};
    const idx = Number(slotIndex);

    if (!Array.isArray(profile.inventory) || idx < 0 || idx >= profile.inventory.length) {
        return res.status(400).json({ success: false, error: 'invalid_slot' });
    }

    const targetItem = profile.inventory[idx];
    if (!targetItem) {
        return res.status(400).json({ success: false, error: 'slot_empty' });
    }

    const gateway = require('../realtime/gateway');
    const sellPrice = gateway.FISH_SELL_PRICES[targetItem.id] || targetItem.value || 25;
    if (typeof profile.teleCoins !== 'number') profile.teleCoins = 120;
    profile.teleCoins += sellPrice;
    profile.inventory[idx] = null;

    if (profile.equippedItem && profile.equippedItem.id === targetItem.id) {
        profile.equippedItem = null;
    }

    profileRepo.save(profile);

    res.json({
        success: true,
        soldItem: targetItem,
        slotIndex: idx,
        earnedCoins: sellPrice,
        teleCoins: profile.teleCoins,
        inventory: profile.inventory
    });
});

module.exports = router;
