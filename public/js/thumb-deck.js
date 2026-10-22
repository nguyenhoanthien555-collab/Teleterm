/**
 * TELETERM TACTILE BOTTOM THUMB DECK
 * Mobile-first tactile quick actions with haptic vibration feedback
 */

export class ThumbDeck {
    constructor(terminalManager, cyberdeck3D, vietInputDock, onOpenHub) {
        this.terminalManager = terminalManager;
        this.cyberdeck3D = cyberdeck3D;
        this.vietInputDock = vietInputDock;
        this.onOpenHub = onOpenHub;

        this.init();
    }

    vibrate(ms = 12) {
        if ('vibrate' in navigator) {
            try { navigator.vibrate(ms); } catch (e) {}
        }
    }

    init() {
        const deckEl = document.querySelector('.cyber-thumb-deck');
        if (deckEl) {
            deckEl.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
            deckEl.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true });
        }

        const bindBtn = (id, callback) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.vibrate(12);
                callback();
            });
        };

        // Approve (y)
        bindBtn('thumb-approve', () => {
            this.terminalManager.sendKey('y');
        });

        // Cancel (n)
        bindBtn('thumb-cancel', () => {
            this.terminalManager.sendKey('n');
        });

        // Enter
        bindBtn('thumb-enter', () => {
            this.terminalManager.sendKey('enter');
        });

        // Ctrl + C
        bindBtn('thumb-ctrl-c', () => {
            this.terminalManager.sendKey('ctrl-c');
        });

        // Tab
        bindBtn('thumb-tab', () => {
            this.terminalManager.sendKey('tab');
        });

        // Esc
        bindBtn('thumb-esc', () => {
            this.terminalManager.sendKey('esc');
        });

        // Vietnamese Dock Toggle
        bindBtn('thumb-viet', () => {
            if (this.vietInputDock) {
                this.vietInputDock.toggle();
            }
        });

        // 3D Orbit vs 2D Focus Snap Mode Toggle
        bindBtn('thumb-orbit', () => {
            if (this.cyberdeck3D) {
                const current = this.cyberdeck3D.toggleMode();
                const btn = document.getElementById('thumb-orbit');
                const navBtn = document.getElementById('btn-nav-focus');
                const isFocus = current === 'focus';

                if (btn) {
                    btn.classList.toggle('btn-highlight', !isFocus);
                    const iconSvg = window.TeleTermIcons 
                        ? (isFocus ? window.TeleTermIcons.render('maximize', { size: 14 }) : window.TeleTermIcons.render('orbit', { size: 14 }))
                        : '';
                    btn.innerHTML = `${iconSvg} <span>${isFocus ? 'Focus' : '3D'}</span>`;
                }
                if (navBtn) {
                    navBtn.classList.toggle('active', isFocus);
                }
            }
        });

        // Hub Actions Modal
        bindBtn('thumb-hub', () => {
            if (this.onOpenHub) {
                this.onOpenHub();
            }
        });
    }
}
