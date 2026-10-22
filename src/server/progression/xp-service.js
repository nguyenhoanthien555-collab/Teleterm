/**
 * Server-Authoritative EXP & Progression Engine
 * TeleTerm Master Architecture v2 - Section 13, 14, 15, 17
 */

const profileRepo = require('../persistence/profile-repository');
const titleService = require('./title-service');
const logger = require('../logger');

// Event rules: base XP, cooldown in seconds, repeat penalty threshold
const EVENT_RULES = {
    'test_passed': { base: 10, cooldown: 45, maxPerHour: 25 },
    'build_success': { base: 20, cooldown: 30, maxPerHour: 20 },
    'git_commit': { base: 50, cooldown: 90, maxPerHour: 15 },
    'ai_solution': { base: 15, cooldown: 30, maxPerHour: 30 },
    'focus_pulse': { base: 10, cooldown: 270, maxPerHour: 12 },
    'terminal_command': { base: 2, cooldown: 5, maxPerHour: 60 }
};

const LEVEL_REWARDS = {
    5: { id: 'hat_straw', name: 'Straw Maiden Hat', vi: 'Nón Rơm Thiếu Nữ', type: 'cosmetic' },
    10: { id: 'drink_green_tea', name: 'Iced Green Tea Can', vi: 'Lon Trà Xanh Lạnh', type: 'consumable', holdable: true, handPose: 'small_can', useAnimation: 'DrinkCan', useSound: 'drink_soft' },
    15: { id: 'aura_starlight', name: 'Starlight Aura', vi: 'Hào Quang Tinh Tú', type: 'aura' },
    20: { id: 'accessory_cyber_visor', name: 'Hologram Cyber Visor', vi: 'Kính Cyberpunk', type: 'accessory' },
    25: { id: 'reward_coffee_mug', name: 'Ceramic Coffee Mug', vi: 'Ly Cà Phê Gốm', type: 'consumable', holdable: true, handPose: 'cup', useAnimation: 'DrinkCan', useSound: 'drink_soft' },
    30: { id: 'collectible_trophy', name: 'Architect Trophy', vi: 'Cúp Kiến Trúc Sư', type: 'collectible', holdable: true, handPose: 'tool' }
};

class XpService {
    constructor() {
        // Map<userId, Map<eventType, { lastTime: number, hourlyCount: number, hourStart: number }>>
        this.cooldowns = new Map();
        this.onLevelUpCallbacks = [];
        this.lastAudits = new Map(); // Map<userId, auditRecord>
    }

    onLevelUp(cb) {
        if (typeof cb === 'function') this.onLevelUpCallbacks.push(cb);
    }

    /**
     * XP required to advance from `level` to `level + 1`
     * Formula: round(100 * level^1.5)
     */
    getXpRequiredForNextLevel(level) {
        return Math.round(100 * Math.pow(Math.max(1, level), 1.5));
    }

    /**
     * Process an authentic development action and award XP
     */
    awardXp(userId, eventType, metadata = {}) {
        const rule = EVENT_RULES[eventType];
        if (!rule) {
            return { awarded: 0, reason: 'unknown_event_type' };
        }

        const now = Date.now();
        if (!this.cooldowns.has(userId)) {
            this.cooldowns.set(userId, new Map());
        }
        const userCooldowns = this.cooldowns.get(userId);

        let tracker = userCooldowns.get(eventType);
        if (!tracker) {
            tracker = { lastTime: 0, hourlyCount: 0, hourStart: now };
            userCooldowns.set(eventType, tracker);
        }

        // Reset hourly counter if 1 hour has elapsed
        if (now - tracker.hourStart > 3600000) {
            tracker.hourlyCount = 0;
            tracker.hourStart = now;
        }

        // Check strict cooldown
        const elapsedSec = (now - tracker.lastTime) / 1000;
        if (elapsedSec < rule.cooldown) {
            const cooldownRemaining = Math.ceil(rule.cooldown - elapsedSec);
            this.lastAudits.set(userId, {
                lastEvent: eventType,
                baseXp: rule.base,
                cooldownStatus: `COOLDOWN (${cooldownRemaining}s)`,
                award: 0,
                timestamp: now
            });
            return {
                awarded: 0,
                cooldownRemaining,
                reason: 'cooldown_active'
            };
        }

        // Anti-abuse: Check repeat diminishing returns
        let awardAmount = rule.base;
        if (tracker.hourlyCount >= rule.maxPerHour) {
            awardAmount = Math.max(1, Math.floor(awardAmount * 0.25)); // Heavy penalty
        } else if (tracker.hourlyCount >= Math.floor(rule.maxPerHour * 0.7)) {
            awardAmount = Math.max(1, Math.floor(awardAmount * 0.5)); // Halved
        }

        tracker.lastTime = now;
        tracker.hourlyCount++;

        // Update persistent player profile
        const profile = profileRepo.getOrCreate(userId);
        if (!profile) return { awarded: 0, reason: 'profile_not_found' };

        // Milestone 4: Apply Active Multiplier Buffs (e.g. Zen Mind +25% XP)
        if (profile.activeBuffs && Array.isArray(profile.activeBuffs)) {
            const validBuffs = [];
            let totalMultiplier = 1.0;
            for (const b of profile.activeBuffs) {
                if (b.expiresAt > now) {
                    validBuffs.push(b);
                    totalMultiplier += (b.multiplier - 1.0);
                }
            }
            profile.activeBuffs = validBuffs;
            awardAmount = Math.round(awardAmount * totalMultiplier);
        }

        const oldLevel = profile.level || 1;
        profile.totalXp = (profile.totalXp || 0) + awardAmount;
        profile.currentLevelXp = (profile.currentLevelXp || 0) + awardAmount;

        // Check Level-Up cascades
        let leveledUp = false;
        let xpReq = this.getXpRequiredForNextLevel(profile.level);

        while (profile.currentLevelXp >= xpReq) {
            profile.currentLevelXp -= xpReq;
            profile.level += 1;
            leveledUp = true;
            xpReq = this.getXpRequiredForNextLevel(profile.level);
        }

        let grantedRewards = [];
        if (leveledUp) {
            profile.title = titleService.getTitleForLevel(profile.level);
            logger.info(`[XP] Player ${profile.username} (${userId}) leveled up to Lv.${profile.level}! Rank: ${profile.title}`);

            grantedRewards = this.checkAndGrantLevelRewards(profile, oldLevel, profile.level);

            // Fire level up listeners
            for (const cb of this.onLevelUpCallbacks) {
                try {
                    cb({
                        userId,
                        username: profile.username,
                        oldLevel,
                        newLevel: profile.level,
                        title: profile.title,
                        totalXp: profile.totalXp,
                        rewards: grantedRewards
                    });
                } catch (e) {}
            }
        }

        profileRepo.save(profile);

        // Store observable audit record for Section 70 Debug XP mode
        this.lastAudits.set(userId, {
            lastEvent: eventType,
            baseXp: rule.base,
            cooldownStatus: 'PASS',
            award: awardAmount,
            totalXp: profile.totalXp,
            level: profile.level,
            nextLevel: profile.level + 1,
            currentLevelXp: profile.currentLevelXp,
            nextLevelReq: xpReq,
            progressPercent: Math.min(100, Math.round((profile.currentLevelXp / Math.max(1, xpReq)) * 100)),
            title: profile.title,
            timestamp: now
        });

        return {
            awarded: awardAmount,
            totalXp: profile.totalXp,
            level: profile.level,
            currentLevelXp: profile.currentLevelXp,
            nextLevelReq: xpReq,
            title: profile.title,
            leveledUp,
            rewards: grantedRewards
        };
    }

    /**
     * Directly award explicit XP (e.g. from Quest completion) bypassing event cooldowns
     */
    awardDirectXp(userId, amount, reason = 'Quest Reward') {
        const profile = profileRepo.getOrCreate(userId);
        if (!profile) return { awarded: 0, reason: 'profile_not_found' };

        // Milestone 4: Apply Active Multiplier Buffs (e.g. Zen Mind +25% XP)
        let finalAmount = amount;
        if (profile.activeBuffs && Array.isArray(profile.activeBuffs)) {
            const now = Date.now();
            const validBuffs = [];
            let totalMultiplier = 1.0;
            for (const b of profile.activeBuffs) {
                if (b.expiresAt > now) {
                    validBuffs.push(b);
                    totalMultiplier += (b.multiplier - 1.0);
                }
            }
            profile.activeBuffs = validBuffs;
            finalAmount = Math.round(amount * totalMultiplier);
        }

        const oldLevel = profile.level || 1;
        profile.totalXp = (profile.totalXp || 0) + finalAmount;
        profile.currentLevelXp = (profile.currentLevelXp || 0) + finalAmount;

        let leveledUp = false;
        let xpReq = this.getXpRequiredForNextLevel(profile.level);

        while (profile.currentLevelXp >= xpReq) {
            profile.currentLevelXp -= xpReq;
            profile.level += 1;
            leveledUp = true;
            xpReq = this.getXpRequiredForNextLevel(profile.level);
        }

        let grantedRewards = [];
        if (leveledUp) {
            profile.title = titleService.getTitleForLevel(profile.level);
            logger.info(`[XP] Player ${profile.username} leveled up to Lv.${profile.level}! Rank: ${profile.title}`);
            grantedRewards = this.checkAndGrantLevelRewards(profile, oldLevel, profile.level);
            for (const cb of this.onLevelUpCallbacks) {
                try {
                    cb({
                        userId,
                        username: profile.username,
                        oldLevel,
                        newLevel: profile.level,
                        title: profile.title,
                        totalXp: profile.totalXp,
                        rewards: grantedRewards
                    });
                } catch (e) {}
            }
        }

        return {
            awarded: finalAmount,
            baseAmount: amount,
            reason,
            totalXp: profile.totalXp,
            level: profile.level,
            currentLevelXp: profile.currentLevelXp,
            nextLevelReq: xpReq,
            title: profile.title,
            leveledUp,
            rewards: grantedRewards
        };
    }

    /**
     * Milestone 4: Add persistent buff to player profile
     */
    addBuff(userId, buff) {
        const profile = profileRepo.getOrCreate(userId);
        if (!profile) return null;
        if (!Array.isArray(profile.activeBuffs)) profile.activeBuffs = [];
        const now = Date.now();
        // Filter out expired buffs and duplicate buffId
        profile.activeBuffs = profile.activeBuffs.filter(b => b.buffId !== buff.buffId && b.expiresAt > now);
        profile.activeBuffs.push(buff);
        profileRepo.save(profile);
        return profile.activeBuffs;
    }

    getActiveBuffs(userId) {
        const profile = profileRepo.getOrCreate(userId);
        if (!profile || !Array.isArray(profile.activeBuffs)) return [];
        const now = Date.now();
        profile.activeBuffs = profile.activeBuffs.filter(b => b.expiresAt > now);
        return profile.activeBuffs;
    }

    checkAndGrantLevelRewards(profile, oldLevel, newLevel) {
        const granted = [];
        if (!profile.inventory) profile.inventory = [null, null, null, null, null, null, null, null, null];
        if (!profile.unlockedRewards) profile.unlockedRewards = [];

        for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
            const reward = LEVEL_REWARDS[lvl];
            if (reward) {
                profile.unlockedRewards.push(reward.id);
                const emptyIdx = profile.inventory.findIndex(slot => slot === null);
                if (emptyIdx !== -1) {
                    profile.inventory[emptyIdx] = { ...reward, slotIndex: emptyIdx };
                }
                granted.push(reward);
                logger.info(`[XP] Granted Level ${lvl} reward [${reward.name}] to ${profile.username}`);
            }
        }
        return granted;
    }

    /**
     * Direct XP grant (bypasses cooldowns, for admin/milestones/tests)
     */
    addRawXp(userId, amount, source = 'system') {
        const profile = profileRepo.getOrCreate(userId);
        if (!profile) return { awarded: 0, reason: 'profile_not_found' };

        const oldLevel = profile.level || 1;
        profile.totalXp = (profile.totalXp || 0) + amount;
        profile.currentLevelXp = (profile.currentLevelXp || 0) + amount;

        let leveledUp = false;
        let xpReq = this.getXpRequiredForNextLevel(profile.level);

        while (profile.currentLevelXp >= xpReq) {
            profile.currentLevelXp -= xpReq;
            profile.level += 1;
            leveledUp = true;
            xpReq = this.getXpRequiredForNextLevel(profile.level);
        }

        let grantedRewards = [];
        if (leveledUp) {
            profile.title = titleService.getTitleForLevel(profile.level);
            logger.info(`[XP] Player ${profile.username} (${userId}) granted raw XP ${amount} -> Lv.${profile.level}! Rank: ${profile.title}`);
            grantedRewards = this.checkAndGrantLevelRewards(profile, oldLevel, profile.level);

            for (const cb of this.onLevelUpCallbacks) {
                try {
                    cb({
                        userId,
                        username: profile.username,
                        oldLevel,
                        newLevel: profile.level,
                        title: profile.title,
                        totalXp: profile.totalXp,
                        rewards: grantedRewards
                    });
                } catch (e) {}
            }
        }

        profileRepo.save(profile);

        this.lastAudits.set(userId, {
            lastEvent: source,
            baseXp: amount,
            cooldownStatus: 'PASS',
            award: amount,
            totalXp: profile.totalXp,
            level: profile.level,
            nextLevel: profile.level + 1,
            currentLevelXp: profile.currentLevelXp,
            nextLevelReq: xpReq,
            progressPercent: Math.min(100, Math.round((profile.currentLevelXp / Math.max(1, xpReq)) * 100)),
            title: profile.title,
            timestamp: Date.now()
        });

        return {
            awarded: amount,
            totalXp: profile.totalXp,
            level: profile.level,
            currentLevelXp: profile.currentLevelXp,
            nextLevelReq: xpReq,
            title: profile.title,
            leveledUp,
            rewards: grantedRewards
        };
    }

    /**
     * Observable Debug XP report conforming to Section 70
     */
    getDebugXpReport(userId = 'player') {
        const profile = profileRepo.getOrCreate(userId);
        const xpReq = this.getXpRequiredForNextLevel(profile.level);
        const audit = this.lastAudits.get(userId) || {
            lastEvent: 'build_success',
            baseXp: 20,
            cooldownStatus: 'PASS',
            award: 20
        };

        const pct = Math.min(100, Math.round((profile.currentLevelXp / Math.max(1, xpReq)) * 100));
        const filled = Math.min(10, Math.max(0, Math.round(pct / 10)));
        const empty = 10 - filled;
        const progressBar = '█'.repeat(filled) + '░'.repeat(empty);

        const formattedText = [
            `Last Event:`,
            `${audit.lastEvent}`,
            ``,
            `Base XP:`,
            `+${audit.baseXp}`,
            ``,
            `Cooldown:`,
            `${audit.cooldownStatus}`,
            ``,
            `Award:`,
            `+${audit.award}`,
            ``,
            `Total XP:`,
            `${profile.totalXp}`,
            ``,
            `Level:`,
            `${profile.level}`,
            ``,
            `Next Level:`,
            `${profile.level + 1}`,
            ``,
            `Progress:`,
            `${progressBar} ${pct}%`
        ].join('\n');

        return {
            lastEvent: audit.lastEvent,
            baseXp: audit.baseXp,
            cooldownStatus: audit.cooldownStatus,
            award: audit.award,
            totalXp: profile.totalXp,
            level: profile.level,
            nextLevel: profile.level + 1,
            currentLevelXp: profile.currentLevelXp,
            nextLevelReq: xpReq,
            progressPercent: pct,
            progressBar,
            title: profile.title,
            inventory: profile.inventory || [],
            unlockedRewards: profile.unlockedRewards || [],
            formattedText
        };
    }

    deleteUserData(userId) {
        this.cooldowns.delete(userId);
        this.lastAudits.delete(userId);
    }
}

module.exports = new XpService();
module.exports.LEVEL_REWARDS = LEVEL_REWARDS;
