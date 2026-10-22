const fs = require('fs');
const path = require('path');
const logger = require('../logger');

const dataDir = process.env.TELETERM_USER_DATA_PATH || path.join(__dirname, '../../../');
const DB_PATH = path.join(dataDir, '.dev_metaverse_profiles.json');

class ProfileRepository {
    constructor() {
        this.cache = new Map();
        this.init();
    }

    init() {
        try {
            if (fs.existsSync(DB_PATH)) {
                const raw = fs.readFileSync(DB_PATH, 'utf8');
                const data = JSON.parse(raw);
                if (data && typeof data === 'object') {
                    for (const [key, val] of Object.entries(data)) {
                        this.cache.set(key, val);
                    }
                }
            } else {
                this.persist();
            }
        } catch (err) {
            logger.error('[ProfileRepository] Failed to read database, creating fresh cache:', err.message);
        }
    }

    persist() {
        try {
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            const obj = {};
            for (const [key, val] of this.cache.entries()) {
                obj[key] = val;
            }
            fs.writeFileSync(DB_PATH, JSON.stringify(obj, null, 2), 'utf8');
            return true;
        } catch (err) {
            logger.error('[ProfileRepository] Failed to write database:', err.message);
            return false;
        }
    }

    get(userId) {
        if (!userId) return null;
        if (!this.cache.has(userId) && fs.existsSync(DB_PATH)) {
            this.init();
        }
        return this.cache.get(userId) || null;
    }

    getOrCreate(userId, fallbackInfo = {}) {
        if (!userId) return null;
        if (!this.cache.has(userId) && fs.existsSync(DB_PATH)) {
            this.init();
        }
        let profile = this.cache.get(userId);
        if (!profile) {
            profile = {
                id: userId,
                username: fallbackInfo.username || 'Coder_' + userId.slice(0, 5),
                displayName: fallbackInfo.displayName || fallbackInfo.username || 'Coder_' + userId.slice(0, 5),
                avatarUrl: fallbackInfo.avatarUrl || null,
                presetId: fallbackInfo.presetId || 'sakura_alice',
                customColors: fallbackInfo.customColors || {
                    hair: '#e2e8f0',
                    eyes: '#38bdf8',
                    outfit: '#38bdf8',
                    aura: '#00f0ff'
                },
                customModelUrl: null,
                level: 1,
                totalXp: 0,
                currentLevelXp: 0,
                title: 'Novice',
                teleCoins: typeof fallbackInfo.teleCoins === 'number' ? fallbackInfo.teleCoins : 120,
                inventory: fallbackInfo.inventory || [null, null, null, null, null, null, null, null, null],
                equippedItem: fallbackInfo.equippedItem || null,
                achievements: ['first_steps'],
                stats: {
                    commandsExecuted: 0,
                    buildsPassed: 0,
                    testsPassed: 0,
                    aiChats: 0,
                    focusMinutes: 0
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.cache.set(userId, profile);
            this.persist();
        }
        if (!profile.inventory) {
            profile.inventory = [null, null, null, null, null, null, null, null, null];
        }
        if (typeof profile.teleCoins !== 'number') {
            profile.teleCoins = 120;
        }
        if (profile.title === 'Script Novice') {
            profile.title = 'Novice';
        }
        return profile;
    }

    save(profile) {
        if (!profile || !profile.id) return;
        profile.updatedAt = new Date().toISOString();
        this.cache.set(profile.id, profile);
        this.persist();
    }

    delete(userId) {
        if (!userId || !this.cache.has(userId)) return false;
        const profile = this.cache.get(userId);
        this.cache.delete(userId);
        if (!this.persist()) {
            this.cache.set(userId, profile);
            return false;
        }
        return true;
    }

    claimLegacyProfile(legacyId, accountId, provider) {
        if (!legacyId || !accountId || legacyId === accountId) return { success: false, error: 'invalid_profile_claim' };
        const legacy = this.cache.get(legacyId);
        const account = this.cache.get(accountId);
        if (!legacy || legacy.verifiedAccount || !account?.verifiedAccount) return { success: false, error: 'profile_claim_not_available' };
        const accountHasProgress = (account.totalXp || 0) > 0 || (account.level || 1) > 1 ||
            (Array.isArray(account.achievements) && account.achievements.some(item => item !== 'first_steps')) ||
            (Array.isArray(account.inventory) && account.inventory.some(Boolean));
        if (accountHasProgress) return { success: false, error: 'target_profile_has_progress' };
        const transferableFields = [
            'username', 'displayName', 'avatarUrl', 'presetId', 'customColors', 'customModelUrl',
            'level', 'totalXp', 'currentLevelXp', 'title', 'inventory', 'equippedItem',
            'achievements', 'stats', 'unlockedRewards'
        ];
        const claimed = { ...account };
        for (const field of transferableFields) if (legacy[field] !== undefined) claimed[field] = legacy[field];
        const safeName = value => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 30) : '';
        claimed.displayName = safeName(claimed.displayName) || account.displayName;
        claimed.username = safeName(claimed.username) || claimed.displayName;
        if (typeof claimed.presetId !== 'string' || !/^[a-z0-9_-]{1,64}$/i.test(claimed.presetId)) claimed.presetId = 'sakura_alice';
        const sourceColors = claimed.customColors && typeof claimed.customColors === 'object' && !Array.isArray(claimed.customColors) ? claimed.customColors : {};
        claimed.customColors = Object.fromEntries(['hair', 'eyes', 'outfit', 'aura']
            .filter(key => typeof sourceColors[key] === 'string' && /^#[0-9a-f]{6}$/i.test(sourceColors[key]))
            .map(key => [key, sourceColors[key]]));
        if (claimed.customModelUrl && !/^\/models\/custom\/[a-z0-9_.-]+\.(glb|vrm)$/i.test(claimed.customModelUrl)) claimed.customModelUrl = null;
        if (claimed.avatarUrl && !(typeof claimed.avatarUrl === 'string' && /^https:\/\//i.test(claimed.avatarUrl))) claimed.avatarUrl = null;
        claimed.id = accountId;
        claimed.verifiedAccount = true;
        claimed.authProvider = provider;
        claimed.updatedAt = new Date().toISOString();
        this.cache.set(accountId, claimed);
        this.cache.delete(legacyId);
        if (!this.persist()) {
            this.cache.set(accountId, account);
            this.cache.set(legacyId, legacy);
            return { success: false, error: 'profile_store_unavailable' };
        }
        return { success: true, profile: claimed };
    }

    getAllTopPlayers(limit = 10) {
        const all = Array.from(this.cache.values());
        all.sort((a, b) => (b.totalXp || 0) - (a.totalXp || 0));
        return all.slice(0, limit);
    }
}

module.exports = new ProfileRepository();
