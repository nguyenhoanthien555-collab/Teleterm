/**
 * TELETERM 3D — SERVER-AUTHORITATIVE QUEST & BOUNTY ENGINE
 * Handles quest progression, criteria evaluation, rewards dispatch, and unlocked cosmetics.
 */

const { QUEST_DEFINITIONS } = require('./quest-definitions');
const xpService = require('./xp-service');
const titleService = require('./title-service');
const profileRepo = require('../persistence/profile-repository');
const logger = require('../logger');

class QuestService {
    constructor() {
        // Map<userId, { activeQuestId: string, quests: { [questId]: QuestState }, unlockedEmotes: string[], unlockedLofiTracks: any[] }>
        this.userStates = new Map();
        this.questMap = new Map();
        QUEST_DEFINITIONS.forEach(q => this.questMap.set(q.id, q));
    }

    /**
     * Get or initialize player quest state
     */
    getUserState(userId = 'default_user') {
        if (!this.userStates.has(userId)) {
            const state = {
                activeQuestId: 'Q101',
                quests: {},
                unlockedEmotes: ['wave'], // default starting emote
                unlockedLofiTracks: []
            };

            // Initialize all quests
            QUEST_DEFINITIONS.forEach(q => {
                if (q.autoAccept) {
                    state.quests[q.id] = {
                        id: q.id,
                        status: 'ACTIVE',
                        currentStepIndex: 0,
                        stepProgress: {},
                        acceptedAt: Date.now()
                    };
                } else if (!q.requires || q.requires.length === 0) {
                    state.quests[q.id] = {
                        id: q.id,
                        status: 'AVAILABLE',
                        currentStepIndex: 0,
                        stepProgress: {}
                    };
                } else {
                    state.quests[q.id] = {
                        id: q.id,
                        status: 'LOCKED',
                        currentStepIndex: 0,
                        stepProgress: {}
                    };
                }
            });

            this.userStates.set(userId, state);
        }
        return this.userStates.get(userId);
    }

    /**
     * Get full public state for client HUD and Quest Log
     */
    getClientQuestState(userId = 'default_user') {
        const userState = this.getUserState(userId);
        const result = {
            activeQuest: null,
            quests: [],
            unlockedEmotes: userState.unlockedEmotes,
            unlockedLofiTracks: userState.unlockedLofiTracks
        };

        QUEST_DEFINITIONS.forEach(def => {
            const st = userState.quests[def.id] || { status: 'LOCKED', currentStepIndex: 0 };
            const qData = {
                ...def,
                status: st.status,
                currentStepIndex: st.currentStepIndex || 0,
                currentStep: def.steps[st.currentStepIndex || 0] || null,
                isCompleted: st.status === 'COMPLETED',
                isReadyToClaim: st.status === 'READY_TO_CLAIM',
                isActive: st.status === 'ACTIVE'
            };

            result.quests.push(qData);

            if (userState.activeQuestId === def.id && (st.status === 'ACTIVE' || st.status === 'READY_TO_CLAIM')) {
                result.activeQuest = qData;
            }
        });

        // Fallback activeQuest if current was completed
        if (!result.activeQuest) {
            const firstActive = result.quests.find(q => q.status === 'ACTIVE' || q.status === 'READY_TO_CLAIM');
            if (firstActive) {
                userState.activeQuestId = firstActive.id;
                result.activeQuest = firstActive;
            } else {
                const firstAvailable = result.quests.find(q => q.status === 'AVAILABLE');
                if (firstAvailable) {
                    userState.activeQuestId = firstAvailable.id;
                    result.activeQuest = firstAvailable;
                }
            }
        }

        return result;
    }

    /**
     * Accept a quest from NPC or Notice Board
     */
    acceptQuest(userId = 'default_user', questId) {
        const userState = this.getUserState(userId);
        const def = this.questMap.get(questId);
        if (!def) return { success: false, error: 'quest_not_found' };

        const st = userState.quests[questId];
        if (st && st.status === 'COMPLETED') {
            return { success: false, error: 'already_completed' };
        }

        userState.quests[questId] = {
            id: questId,
            status: 'ACTIVE',
            currentStepIndex: 0,
            stepProgress: {},
            acceptedAt: Date.now()
        };
        userState.activeQuestId = questId;

        logger.info(`[QuestService] User ${userId} accepted quest ${questId}`);
        const clientState = this.getClientQuestState(userId);
        return { success: true, quest: clientState.activeQuest, state: clientState, clientState };
    }

    /**
     * Switch active tracking quest
     */
    setActiveQuest(userId = 'default_user', questId) {
        const userState = this.getUserState(userId);
        if (userState.quests[questId]) {
            userState.activeQuestId = questId;
            return { success: true, activeQuest: this.getClientQuestState(userId).activeQuest };
        }
        return { success: false, error: 'invalid_quest' };
    }

    /**
     * Claim completed quest rewards
     */
    claimQuest(userId = 'default_user', questId) {
        const userState = this.getUserState(userId);
        const def = this.questMap.get(questId);
        if (!def) return { success: false, error: 'quest_not_found' };

        const st = userState.quests[questId];
        if (!st || st.status !== 'READY_TO_CLAIM') {
            return { success: false, error: 'not_ready_to_claim' };
        }

        st.status = 'COMPLETED';
        st.completedAt = Date.now();

        // Award Rewards
        const rewards = def.rewards || {};
        let xpResult = null;
        if (rewards.xp) {
            try {
                // Award XP through xpService
                if (typeof xpService.awardDirectXp === 'function') {
                    xpResult = xpService.awardDirectXp(userId, rewards.xp, `Quest Completed: ${def.id}`);
                } else if (typeof xpService.awardXp === 'function') {
                    xpResult = xpService.awardXp(userId, 'git_commit', { questBonus: rewards.xp });
                }
            } catch (e) {
                logger.warn(`[QuestService] Error granting XP: ${e.message}`);
            }
        }

        // Title unlock
        if (rewards.title && titleService) {
            try {
                if (typeof titleService.grantCustomTitle === 'function') {
                    titleService.grantCustomTitle(userId, rewards.title);
                }
            } catch (e) {}
        }

        // Emote unlock
        if (rewards.unlockEmote && !userState.unlockedEmotes.includes(rewards.unlockEmote)) {
            userState.unlockedEmotes.push(rewards.unlockEmote);
        }

        // Lo-Fi track unlock
        if (rewards.unlockLofiTrack) {
            const hasTrack = userState.unlockedLofiTracks.some(t => t.id === rewards.unlockLofiTrack.id);
            if (!hasTrack) {
                userState.unlockedLofiTracks.push(rewards.unlockLofiTrack);
            }
        }

        // Unlock next quests that depend on this
        QUEST_DEFINITIONS.forEach(nextDef => {
            const nextSt = userState.quests[nextDef.id];
            if (nextSt && nextSt.status === 'LOCKED' && nextDef.requires) {
                const allMet = nextDef.requires.every(reqId => userState.quests[reqId]?.status === 'COMPLETED');
                if (allMet) {
                    nextSt.status = (nextDef.autoAccept !== false) ? 'ACTIVE' : 'AVAILABLE';
                    if (nextSt.status === 'ACTIVE' && (!userState.activeQuestId || userState.activeQuestId === questId)) {
                        userState.activeQuestId = nextDef.id;
                    }
                    logger.info(`[QuestService] Unlocked next quest ${nextDef.id} (status: ${nextSt.status}) for user ${userId}`);
                }
            }
        });

        // Set next active quest if current is finished
        if (userState.activeQuestId === questId) {
            const nextActive = QUEST_DEFINITIONS.find(q => userState.quests[q.id]?.status === 'ACTIVE');
            if (nextActive) {
                userState.activeQuestId = nextActive.id;
            } else {
                const nextAvail = QUEST_DEFINITIONS.find(q => userState.quests[q.id]?.status === 'AVAILABLE');
                if (nextAvail) {
                    userState.activeQuestId = nextAvail.id;
                }
            }
        }

        logger.info(`[QuestService] User ${userId} claimed rewards for quest ${questId}`);
        const clientState = this.getClientQuestState(userId);
        return {
            success: true,
            claimedQuestId: questId,
            rewards,
            xpResult,
            state: clientState,
            clientState
        };
    }

    /**
     * Record a gameplay event and advance matching active quests with auto-completion
     */
    recordEvent(userId = 'default_user', eventType, data = {}) {
        const userState = this.getUserState(userId);
        let anyProgress = false;
        const updatedQuests = [];
        const completedSteps = [];
        const autoCompletedQuests = [];

        // Helper to normalize tool identifiers across ADE, IDE, CLI, Terminal, Codex, Antigravity
        const normalizeTool = (t) => {
            if (!t) return '';
            const s = String(t).toLowerCase().trim();
            if (s === 'terminal' || s === 'term' || s === 'cli' || s === 'powershell' || s === 'bash' || s === 'cmd') return 'terminal';
            if (s === 'codex' || s === 'openai' || s === 'chatgpt') return 'codex';
            if (s === 'antigravity' || s === 'agy' || s === 'gemini') return 'antigravity';
            if (s === 'ade' || s === 'test' || s === 'verification') return 'ade';
            if (s === 'universal' || s === 'ide' || s === 'editor' || s === 'code') return 'universal';
            return s;
        };

        QUEST_DEFINITIONS.forEach(def => {
            let st = userState.quests[def.id];
            if (!st) return;

            // Auto-activate available quests if an action matching their step arrives
            if (st.status === 'AVAILABLE' && (def.autoAccept !== false || def.category === 'bounty' || def.category === 'story')) {
                st.status = 'ACTIVE';
                st.acceptedAt = Date.now();
                if (!userState.activeQuestId) {
                    userState.activeQuestId = def.id;
                }
            }

            if (st.status !== 'ACTIVE') return;

            const step = def.steps[st.currentStepIndex];
            if (!step) return;

            const isTypeMatch = (step.type === eventType) ||
                (eventType === 'terminal_command' && (step.type === 'command_counter' || step.type === 'cli_command')) ||
                ((eventType === 'use_tool' || eventType === 'tool_active') && (step.type === 'use_tool' || step.type === 'tool_active')) ||
                (eventType === 'terminal_command' && step.type === 'verification_run' && data.command && /npm\s+test|npm\s+run\s+test|jest|mocha|vitest|pytest/i.test(data.command)) ||
                (eventType === 'ai_prompt' && (step.type === 'ai_prompt' || step.type === 'use_tool' || step.type === 'tool_active'));

            if (!isTypeMatch) return;

            let stepComplete = false;

            switch (eventType) {
                case 'talk_npc': {
                    const npc = (data.target || data.npcName || data.npcId || '').toLowerCase();
                    if (npc && step.target && (npc === step.target.toLowerCase() || npc.includes(step.target.toLowerCase()))) {
                        stepComplete = true;
                    }
                    break;
                }

                case 'terminal_command': {
                    if (step.type === 'command_counter') {
                        st.stepProgress.count = (st.stepProgress.count || 0) + 1;
                        if (st.stepProgress.count >= (step.targetCount || 1)) {
                            stepComplete = true;
                        }
                        anyProgress = true;
                    } else if (step.type === 'verification_run') {
                        stepComplete = true;
                    } else {
                        const cmd = data.command || data.cmd || '';
                        if (step.pattern) {
                            const regex = new RegExp(step.pattern, 'i');
                            if (regex.test(cmd)) {
                                stepComplete = true;
                            }
                        } else {
                            stepComplete = true;
                        }
                    }
                    break;
                }

                case 'command_counter':
                    st.stepProgress.count = (st.stepProgress.count || 0) + 1;
                    if (st.stepProgress.count >= (step.targetCount || 1)) {
                        stepComplete = true;
                    }
                    anyProgress = true;
                    break;

                case 'use_tool':
                case 'tool_active': {
                    const tool = normalizeTool(data.tool);
                    let targetTools = [];
                    if (Array.isArray(step.tool)) {
                        targetTools = step.tool.map(normalizeTool);
                    } else if (step.tool || step.target) {
                        targetTools = [normalizeTool(step.tool || step.target)];
                    }

                    if (targetTools.length === 0 || targetTools.includes(tool) || targetTools.some(tgt => tool.includes(tgt) || tgt.includes(tool))) {
                        stepComplete = true;
                    }
                    break;
                }

                case 'ai_prompt': {
                    const tool = normalizeTool(data.tool);
                    if (!step.tool) {
                        stepComplete = true;
                    } else {
                        let targetTools = Array.isArray(step.tool) ? step.tool.map(normalizeTool) : [normalizeTool(step.tool)];
                        if (targetTools.includes(tool) || targetTools.some(tgt => tool.includes(tgt) || tgt.includes(tool))) {
                            stepComplete = true;
                        }
                    }
                    break;
                }

                case 'verification_run':
                    stepComplete = true;
                    break;

                case 'hold_item': {
                    const held = data.itemId || data.id || '';
                    if (held === step.itemId) {
                        stepComplete = true;
                    }
                    break;
                }

                case 'sit_anchor': {
                    const cat = data.category || '';
                    const anchorId = data.anchorId || data.id || '';
                    if (step.category && cat === step.category) {
                        stepComplete = true;
                    } else if (step.anchorId && anchorId === step.anchorId) {
                        stepComplete = true;
                    } else if (!step.category && !step.anchorId) {
                        stepComplete = true;
                    }
                    break;
                }

                case 'drink_item': {
                    const item = data.itemId || data.id || '';
                    if (item === step.itemId || !step.itemId) {
                        stepComplete = true;
                    }
                    break;
                }

                case 'interact_object': {
                    const tgt = data.target || data.objectId || '';
                    if (tgt === step.target) {
                        stepComplete = true;
                    }
                    break;
                }

                case 'reach_region':
                    if (data.x !== undefined && data.z !== undefined && step.targetPos) {
                        const dist = Math.hypot(data.x - step.targetPos.x, data.z - step.targetPos.z);
                        if (dist <= (step.radius || 10)) {
                            stepComplete = true;
                        }
                    }
                    break;
            }

            if (stepComplete) {
                anyProgress = true;
                completedSteps.push({ questId: def.id, stepId: step.id });
                st.currentStepIndex++;
                st.stepProgress = {};

                if (st.currentStepIndex >= def.steps.length) {
                    st.status = 'READY_TO_CLAIM';
                    logger.info(`[QuestService] Quest ${def.id} ready to claim for user ${userId}, auto-completing...`);

                    const claimRes = this.claimQuest(userId, def.id);
                    if (claimRes && claimRes.success) {
                        autoCompletedQuests.push({
                            id: def.id,
                            title: def.title,
                            rewards: claimRes.rewards,
                            xpResult: claimRes.xpResult
                        });
                    }
                }

                updatedQuests.push(def.id);
            }
        });

        const clientState = this.getClientQuestState(userId);
        return {
            success: true,
            anyProgress,
            updatedQuests,
            completedSteps,
            autoCompletedQuests,
            state: clientState,
            clientState
        };
    }

    resetUserState(userId = 'default_user') {
        this.userStates.delete(userId);
        return this.getUserState(userId);
    }

    deleteUserState(userId) {
        return this.userStates.delete(userId);
    }
}

const instance = new QuestService();
module.exports = instance;
