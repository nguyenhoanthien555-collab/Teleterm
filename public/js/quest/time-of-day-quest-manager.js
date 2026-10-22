/**
 * TELETERM 3D — TIME-OF-DAY QUEST CONTROLLER
 * Dynamically updates available quests based on the 4-phase celestial day-night cycle:
 * - Dawn (05:00 - 08:00): Lumina Morning Bug Hunt (Q_TOD_DAWN)
 * - Midday (08:00 - 17:00): Sakura Architecture Sync (Q_TOD_NOON)
 * - Twilight (17:00 - 20:00): Ren Twilight Reflection (Q_TOD_TWILIGHT)
 * - Night (20:00 - 05:00): Kaede Midnight Cyber Jam (Q_TOD_NIGHT)
 */

export class TimeOfDayQuestManager {
    constructor(dayNightCycle, persistenceManager) {
        this.dayNightCycle = dayNightCycle;
        this.persistenceManager = persistenceManager;
        this.currentPhaseId = null;

        this.quests = {
            dawn: {
                id: 'Q_TOD_DAWN',
                npc: 'Lumina',
                title: 'Săn Bug Bình Minh Cùng Lumina',
                desc: 'Gặp gỡ Lumina lúc bình minh tại Developer Hub',
                rewardXp: 150,
                completed: false
            },
            midday: {
                id: 'Q_TOD_NOON',
                npc: 'Sakura',
                title: 'Đồng Bộ Kiến Trúc Buổi Trưa Cùng Sakura',
                desc: 'Đồng bộ kiến trúc mô-đun với Sakura cạnh Hồ Zen',
                rewardXp: 200,
                completed: false
            },
            twilight: {
                id: 'Q_TOD_TWILIGHT',
                npc: 'Ren',
                title: 'Trà Chiều Hoàng Hôn Cùng Ren',
                desc: 'Gặp Ren tại Đỉnh Đồi lúc hoàng hôn để đàm đạo',
                rewardXp: 250,
                completed: false
            },
            night: {
                id: 'Q_TOD_NIGHT',
                npc: 'Kaede',
                title: 'Giao Hưởng Đêm Cyberpunk Cùng Kaede',
                desc: 'Nhảy VibeDance cùng Kaede trên Cầu Neon lúc nửa đêm',
                rewardXp: 300,
                completed: false
            }
        };

        this.loadCompletedState();
    }

    async loadCompletedState() {
        if (!this.persistenceManager) return;
        const profile = await this.persistenceManager.getUserProfile();
        if (profile && profile.completedTodQuests) {
            for (const qId of profile.completedTodQuests) {
                for (const phase of Object.values(this.quests)) {
                    if (phase.id === qId) phase.completed = true;
                }
            }
        }
    }

    update(timeOfDay) {
        if (!this.dayNightCycle) return;
        const phase = this.dayNightCycle.getCurrentPhase();
        if (!phase) return;

        if (this.currentPhaseId !== phase.id) {
            const prevPhase = this.currentPhaseId;
            this.currentPhaseId = phase.id;
            this.onPhaseTransition(prevPhase, this.currentPhaseId);
        }
    }

    onPhaseTransition(prevPhase, newPhase) {
        const quest = this.quests[newPhase];
        if (quest && !quest.completed) {
            this.showPhaseQuestToast(newPhase, quest);
        }
    }

    showPhaseQuestToast(phaseId, quest) {
        const phaseTitles = {
            dawn: 'BÌNH MINH // DAWN',
            midday: 'GIỮA TRƯA // NOON',
            twilight: 'HOÀNG HÔN // TWILIGHT',
            night: 'ĐÊM CYBER // NIGHT'
        };

        const phaseIconName = {
            dawn: 'sun',
            midday: 'sun',
            twilight: 'sun-moon',
            night: 'moon'
        }[phaseId] || 'clock';

        const phaseIconSvg = (typeof window !== 'undefined' && window.TeleTermIcons)
            ? window.TeleTermIcons.render(phaseIconName, { size: 13, color: '#da7756' })
            : '';
        const scrollSvg = (typeof window !== 'undefined' && window.TeleTermIcons)
            ? window.TeleTermIcons.render('file-text', { size: 14, color: '#da7756' })
            : '';

        const toast = document.createElement('div');
        toast.className = 'tod-quest-toast animate-slide-in';
        toast.innerHTML = `
            <div style="display:flex;align-items:center;gap:6px;font-size: 11px; letter-spacing: 0.12em; color: #da7756; text-transform: uppercase; font-weight: 700;">
                ${phaseIconSvg} <span>${phaseTitles[phaseId] || 'NHIỆM VỤ THEO GIỜ'}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;font-size: 14px; font-weight: 600; color: #edeae3; margin: 3px 0;">
                ${scrollSvg} <span>${quest.title}</span>
            </div>
            <div style="font-size: 12px; color: #a39e93;">
                ${quest.desc} — Thưởng <b style="color: #d49746;">+${quest.rewardXp} XP</b>
            </div>
        `;
        Object.assign(toast.style, {
            position: 'fixed',
            top: '72px',
            right: '24px',
            backgroundColor: 'rgba(24, 24, 26, 0.95)',
            borderLeft: '3px solid #da7756',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '12px 18px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            color: '#edeae3',
            zIndex: '9999',
            fontFamily: '\'Plus Jakarta Sans\', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        });

        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    }

    /**
     * Checks if interacting with an NPC completes the current phase quest
     */
    async onNpcInteracted(npcName) {
        const currentQuest = this.quests[this.currentPhaseId];
        if (!currentQuest || currentQuest.completed) return false;

        if (currentQuest.npc.toLowerCase() === npcName.toLowerCase()) {
            currentQuest.completed = true;
            await this.awardQuestCompletion(currentQuest);
            return true;
        }
        return false;
    }

    async awardQuestCompletion(quest) {
        // 1. Dispatch XP to persistence
        if (this.persistenceManager) {
            const profile = await this.persistenceManager.getUserProfile() || {};
            profile.xp = (profile.xp || 0) + quest.rewardXp;
            profile.completedTodQuests = profile.completedTodQuests || [];
            if (!profile.completedTodQuests.includes(quest.id)) {
                profile.completedTodQuests.push(quest.id);
            }
            await this.persistenceManager.saveUserProfile(profile);
        }

        const awardSvg = (typeof window !== 'undefined' && window.TeleTermIcons)
            ? window.TeleTermIcons.render('award', { size: 16, color: '#52a373' })
            : '';

        // 2. Play level up sound / toast (Claude Warm Emerald & Terracotta style)
        const toast = document.createElement('div');
        toast.innerHTML = `
            <div style="display:flex;align-items:center;gap:6px;font-size: 14px; font-weight: 600; color: #52a373;">
                ${awardSvg} <span>HOÀN THÀNH NHIỆM VỤ: ${quest.title}</span>
            </div>
            <div style="font-size: 13px; color: #a39e93; margin-top: 4px;">
                Nhận thành công <b style="color: #da7756;">+${quest.rewardXp} XP</b>! Nhấn <kbd style="background: rgba(218, 119, 86, 0.2); border: 1px solid #da7756; color: #ea8867; padding: 1px 6px; border-radius: 4px; font-size: 11px;">K</kbd> để mở Cửa Hàng.
            </div>
        `;
        Object.assign(toast.style, {
            position: 'fixed',
            top: '72px',
            right: '24px',
            backgroundColor: 'rgba(24, 24, 26, 0.96)',
            borderLeft: '3px solid #52a373',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '14px 20px',
            boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            color: '#edeae3',
            zIndex: '9999',
            fontFamily: '\'Plus Jakarta Sans\', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        });
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4500);

        // Dispatch global event for XP hud update
        window.dispatchEvent(new CustomEvent('teleterm:xp_gained', { detail: { xp: quest.rewardXp } }));
    }

    getActivePhaseQuest() {
        return this.quests[this.currentPhaseId] || null;
    }
}
