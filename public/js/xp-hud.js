/**
 * Developer EXP Progression & Level-Up HUD
 * TeleTerm Master Architecture v2 - Section 17, 18, 20
 */

class XpHudManager {
    constructor() {
        this.currentLevel = 1;
        this.currentTitle = 'Script Novice';
        this.totalXp = 0;
        this.currentLevelXp = 0;
        this.nextLevelReq = 100;

        this.initDOM();
    }

    initDOM() {
        window.addEventListener('DOMContentLoaded', () => {
            this.lvlBadge = document.getElementById('hud-player-level');
            this.titleBadge = document.getElementById('hud-player-title');
            this.xpBarFill = document.getElementById('hud-xp-bar-fill');
            this.xpValText = document.getElementById('hud-xp-text');
            this.levelUpModal = document.getElementById('modal-level-up');
            this.btnLevelUpClose = document.getElementById('btn-close-level-up');

            if (this.btnLevelUpClose && this.levelUpModal) {
                this.btnLevelUpClose.addEventListener('click', () => {
                    this.levelUpModal.classList.add('hidden');
                });
            }
        });
    }

    updateProgression(data) {
        if (!data) return;
        if (data.level) this.currentLevel = data.level;
        if (data.title) this.currentTitle = data.title;
        if (data.totalXp !== undefined) this.totalXp = data.totalXp;
        if (data.currentLevelXp !== undefined) this.currentLevelXp = data.currentLevelXp;
        if (data.nextLevelReq) this.nextLevelReq = data.nextLevelReq;

        if (this.lvlBadge) this.lvlBadge.textContent = `Lv.${this.currentLevel}`;
        if (this.titleBadge) this.titleBadge.textContent = this.currentTitle;

        if (this.xpValText) {
            this.xpValText.textContent = `${this.currentLevelXp} / ${this.nextLevelReq} XP`;
        }

        if (this.xpBarFill) {
            const pct = Math.min(100, Math.max(0, (this.currentLevelXp / Math.max(1, this.nextLevelReq)) * 100));
            this.xpBarFill.style.width = `${pct}%`;
        }
    }

    showXpToast(awarded, eventName = 'Developer Action') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'xp-burst-toast';
        toast.innerHTML = `
            <span class="xp-spark-icon"><span class="tt-icon tt-icon-14 tt-icon-accent" data-icon="sparkles"></span></span>
            <span class="xp-amount">+${awarded} EXP</span>
            <span class="xp-label">${escapeHtml(eventName)}</span>
        `;
        if (window.TeleTermIcons) {
            window.TeleTermIcons.hydrate(toast);
        }
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fading');
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    }

    showLevelUpCelebration(newLevel, newTitle) {
        if (!this.levelUpModal) return;

        const lvlNum = document.getElementById('levelup-modal-level-num');
        const titleText = document.getElementById('levelup-modal-title');

        if (lvlNum) lvlNum.textContent = `LEVEL ${newLevel}`;
        if (titleText) titleText.textContent = `New Title: ${newTitle}`;

        this.levelUpModal.classList.remove('hidden');

        // Play gentle audio chime if AudioContext is unlocked
        if (window.lofiEngine && window.lofiEngine.ctx) {
            try {
                const ctx = window.lofiEngine.ctx;
                const now = ctx.currentTime;
                [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.value = freq;
                    g.gain.setValueAtTime(0.08, now + i * 0.1);
                    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.8);
                    osc.connect(g);
                    g.connect(ctx.destination);
                    osc.start(now + i * 0.1);
                    osc.stop(now + i * 0.1 + 0.9);
                });
            } catch (e) {}
        }
    }
}

window.xpHud = new XpHudManager();
