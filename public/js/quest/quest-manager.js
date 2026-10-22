/**
 * TELETERM 3D — CLIENT QUEST & GAMIFICATION MANAGER
 * Synchronizes with server-authoritative quest service, tracks live world objectives,
 * evaluates proximity to targets, and dispatches unlock rewards.
 */

export class QuestManager {
    constructor(options = {}) {
        this.apiBase = options.apiBase || '/api/quests';
        this.onToast = options.onToast || console.log;
        
        // Quest state cache
        this.activeQuest = null;
        this.quests = [];
        this.unlockedEmotes = ['wave'];
        this.unlockedLofiTracks = [];

        this.lastPlayerPos = { x: 0, y: 0, z: 0 };
        this.posCheckInterval = null;
        this.isInitialized = false;

        this.init();
    }

    async init() {
        await this.fetchState();
        this.bindEvents();
        this.startPositionTracker();
        this.isInitialized = true;
        console.log('[QuestManager] Initialized with', this.quests.length, 'quests. Active:', this.activeQuest?.id);
    }

    /**
     * Fetch full quest state from server
     */
    async fetchState() {
        try {
            const res = await fetch(`${this.apiBase}/state`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            this.activeQuest = data.activeQuest;
            this.quests = data.quests || [];
            this.unlockedEmotes = data.unlockedEmotes || ['wave'];
            this.unlockedLofiTracks = data.unlockedLofiTracks || [];

            this.dispatchUpdate();
            return data;
        } catch (err) {
            console.warn('[QuestManager] Failed to fetch quest state:', err);
            return null;
        }
    }

    /**
     * Record an event on the server
     */
    async recordEvent(type, data = {}) {
        try {
            const res = await fetch(`${this.apiBase}/event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventType: type, type, data })
            });
            if (!res.ok) return null;
            const resData = await res.json();

            if (resData.completedSteps?.length > 0) {
                // Play subtle objective complete sound if available
                this.playQuestStepSound();
            }

            if (resData.autoCompletedQuests?.length > 0) {
                // Fanfare & celebratory toast for auto-completed quests
                resData.autoCompletedQuests.forEach(ac => {
                    this.playQuestClaimFanfare();
                    const lang = this.getLang();
                    const titleStr = ac.title ? (ac.title[lang] || ac.title.en) : ac.id;
                    const rewards = ac.rewards || {};
                    let rewardText = `+${rewards.xp || 0} EXP`;
                    if (rewards.title) {
                        const titleStr = lang === 'vi' ? (rewards.titleVi || rewards.title) : rewards.title;
                        rewardText += ` • [Title] ${titleStr}`;
                    }
                    if (rewards.unlockEmoteName) {
                        rewardText += ` • [Emote] ${rewards.unlockEmoteName}`;
                    }
                    const toastMsg = lang === 'vi' 
                        ? `Hoàn thành: ${titleStr}!\n${rewardText}`
                        : `Completed: ${titleStr}!\n${rewardText}`;
                    if (this.onToast) this.onToast(toastMsg, 'success');

                    window.dispatchEvent(new CustomEvent('teleterm:quest-claimed', {
                        detail: { quest: ac, rewards }
                    }));

                    if (rewards.unlockLofiTrack && window.lofiEngine) {
                        try {
                            if (typeof window.lofiEngine.unlockTrack === 'function') {
                                window.lofiEngine.unlockTrack(rewards.unlockLofiTrack);
                            }
                        } catch (e) {}
                    }
                });
            }

            // If quest state changed, update local cache
            const state = resData.state || resData.clientState;
            if (state) {
                this.activeQuest = state.activeQuest;
                this.quests = state.quests || [];
                this.unlockedEmotes = state.unlockedEmotes || this.unlockedEmotes;
                this.unlockedLofiTracks = state.unlockedLofiTracks || this.unlockedLofiTracks;
                this.dispatchUpdate();
            }

            return resData;
        } catch (err) {
            console.warn('[QuestManager] Error recording event:', err);
            return null;
        }
    }

    /**
     * Accept a quest
     */
    async acceptQuest(questId) {
        try {
            const res = await fetch(`${this.apiBase}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId })
            });
            const data = await res.json();
            const state = data.state || data.clientState;
            if (data.success && state) {
                this.activeQuest = state.activeQuest;
                this.quests = state.quests;
                this.dispatchUpdate();
                
                const lang = this.getLang();
                const q = this.quests.find(item => item.id === questId);
                const title = q ? (q.title[lang] || q.title.en) : questId;
                const msg = lang === 'vi' ? `Đã nhận nhiệm vụ: ${title}` : `Accepted Quest: ${title}`;
                if (this.onToast) this.onToast(msg, 'info');
            }
            return data;
        } catch (err) {
            console.error('[QuestManager] acceptQuest failed:', err);
            return null;
        }
    }

    /**
     * Set a quest as currently tracked active quest
     */
    async setActiveQuest(questId) {
        try {
            const res = await fetch(`${this.apiBase}/set-active`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId })
            });
            const data = await res.json();
            const state = data.state || data.clientState;
            if (data.success && state) {
                this.activeQuest = state.activeQuest;
                this.dispatchUpdate();
            }
            return data;
        } catch (err) {
            console.error('[QuestManager] setActiveQuest failed:', err);
            return null;
        }
    }

    /**
     * Claim completed quest rewards
     */
    async claimQuest(questId) {
        try {
            const res = await fetch(`${this.apiBase}/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId })
            });
            const data = await res.json();
            if (data.success) {
                // Update local state
                const state = data.state || data.clientState;
                if (state) {
                    this.activeQuest = state.activeQuest;
                    this.quests = state.quests;
                    this.unlockedEmotes = state.unlockedEmotes;
                    this.unlockedLofiTracks = state.unlockedLofiTracks;
                }

                // Celebrate claim with audio & visual effects
                this.playQuestClaimFanfare();

                const lang = this.getLang();
                const q = data.quest;
                const title = q ? (q.title[lang] || q.title.en) : questId;
                const rewards = data.rewards || {};
                
                // Construct celebration toast
                let rewardText = `+${rewards.xp || 0} EXP`;
                if (rewards.title) {
                    const titleStr = lang === 'vi' ? (rewards.titleVi || rewards.title) : rewards.title;
                    rewardText += ` • [Title] ${titleStr}`;
                }
                if (rewards.unlockEmoteName) {
                    rewardText += ` • [Emote] ${rewards.unlockEmoteName}`;
                }

                const toastMsg = lang === 'vi' 
                    ? `Hoàn thành: ${title}!\n${rewardText}`
                    : `Completed: ${title}!\n${rewardText}`;

                if (this.onToast) this.onToast(toastMsg, 'success');

                // Trigger celebration event
                window.dispatchEvent(new CustomEvent('teleterm:quest-claimed', {
                    detail: { quest: q, rewards }
                }));

                // Unlock LoFi track if provided
                if (rewards.unlockLofiTrack && window.lofiEngine) {
                    try {
                        if (typeof window.lofiEngine.unlockTrack === 'function') {
                            window.lofiEngine.unlockTrack(rewards.unlockLofiTrack);
                        }
                    } catch (e) {}
                }

                this.dispatchUpdate();
            }
            return data;
        } catch (err) {
            console.error('[QuestManager] claimQuest failed:', err);
            return null;
        }
    }

    /**
     * Calculate live distance to active quest objective target
     */
    getDistanceToActiveTarget(playerPos) {
        if (!playerPos || !this.activeQuest || !this.activeQuest.currentStep) return null;
        const targetPos = this.activeQuest.currentStep.targetPos;
        if (!targetPos) return null;

        const dx = playerPos.x - targetPos.x;
        const dz = playerPos.z - targetPos.z;
        return Math.hypot(dx, dz);
    }

    /**
     * Bind system-wide developer and exploration events
     */
    bindEvents() {
        // 1. Terminal commands (e.g. version checks, git, build)
        window.addEventListener('teleterm:command-executed', (e) => {
            const cmd = e.detail?.command || '';
            if (cmd) {
                this.recordEvent('terminal_command', { command: cmd });
            }
        });

        // 2. ADE Verification Run
        window.addEventListener('teleterm:verification-status', (e) => {
            this.recordEvent('verification_run', { status: e.detail?.status || 'passed' });
        });

        // 3. Sitting at anchors (Tatami, Benches, Desks)
        window.addEventListener('teleterm:sit-down', (e) => {
            this.recordEvent('sit_anchor', {
                category: e.detail?.category || null,
                anchorId: e.detail?.anchorId || null
            });
        });

        // 4. Consuming items (Tea, Coffee)
        window.addEventListener('teleterm:drink-item', (e) => {
            this.recordEvent('drink_item', { itemId: e.detail?.itemId || null });
        });

        // 5. Holding items (Hotbar selection)
        window.addEventListener('teleterm:hotbar-select', (e) => {
            const item = e.detail?.item;
            if (item) {
                this.recordEvent('hold_item', { itemId: item.id });
            }
        });

        // 6. NPC Interaction
        window.addEventListener('teleterm:npc-talk', (e) => {
            this.recordEvent('talk_npc', { target: e.detail?.npcName || e.detail?.npcId });
        });

        // 7. Object interaction (Bicycle, Vending)
        window.addEventListener('teleterm:interact-object', (e) => {
            this.recordEvent('interact_object', { target: e.detail?.target });
        });

        // 8. Tool / Workspace Active (Terminal, Codex, Antigravity, ADE, Universal)
        window.addEventListener('teleterm:tool-active', (e) => {
            const tool = e.detail?.tool;
            if (tool) {
                this.recordEvent('tool_active', { tool });
            }
        });

        // 9. AI Copilot Prompt sent (Codex, Antigravity)
        window.addEventListener('teleterm:ai-prompt', (e) => {
            const tool = e.detail?.tool;
            const prompt = e.detail?.prompt;
            if (tool) {
                this.recordEvent('ai_prompt', { tool, prompt });
            }
        });

        // 10. Language changes
        window.addEventListener('teleterm-language-changed', () => {
            this.dispatchUpdate();
        });
    }

    /**
     * Start periodic position checker for geographic objectives
     */
    startPositionTracker() {
        if (this.posCheckInterval) clearInterval(this.posCheckInterval);
        this.posCheckInterval = setInterval(() => {
            if (window.openWorld3D?.player?.position) {
                const pos = window.openWorld3D.player.position;
                this.lastPlayerPos = { x: pos.x, y: pos.y, z: pos.z };

                // Only emit if active quest has a reach_region requirement
                if (this.activeQuest?.currentStep?.type === 'reach_region') {
                    this.recordEvent('reach_region', this.lastPlayerPos);
                }
            }
        }, 1200);
    }

    /**
     * Notify listeners that quest state changed
     */
    dispatchUpdate() {
        window.dispatchEvent(new CustomEvent('teleterm:quest-updated', {
            detail: {
                activeQuest: this.activeQuest,
                quests: this.quests,
                unlockedEmotes: this.unlockedEmotes,
                unlockedLofiTracks: this.unlockedLofiTracks
            }
        }));
    }

    /**
     * Current language helper
     */
    getLang() {
        return (window.TeleTermI18n && window.TeleTermI18n.currentLang) || 'en';
    }

    /**
     * Procedural Web Audio: Step Completion Chime
     */
    playQuestStepSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const t = ctx.currentTime;
            [
                { freq: 880, time: 0.0, dur: 0.15 },
                { freq: 1174.66, time: 0.12, dur: 0.25 }
            ].forEach(note => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(note.freq, t + note.time);
                gain.gain.setValueAtTime(0.18, t + note.time);
                gain.gain.exponentialRampToValueAtTime(0.001, t + note.time + note.dur);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t + note.time);
                osc.stop(t + note.time + note.dur);
            });
        } catch (e) {}
    }

    /**
     * Procedural Web Audio: Fanfare for Quest Claim
     */
    playQuestClaimFanfare() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const t = ctx.currentTime;
            // Radiant major chord fanfare (Genshin impact aesthetic)
            [
                { freq: 523.25, time: 0.00, dur: 0.22 }, // C5
                { freq: 659.25, time: 0.14, dur: 0.22 }, // E5
                { freq: 783.99, time: 0.28, dur: 0.35 }, // G5
                { freq: 1046.50, time: 0.44, dur: 0.70 } // C6
            ].forEach(note => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(note.freq, t + note.time);
                gain.gain.setValueAtTime(0.22, t + note.time);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + note.time + note.dur);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t + note.time);
                osc.stop(t + note.time + note.dur);
            });
        } catch (e) {}
    }
}
