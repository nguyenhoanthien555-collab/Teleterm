/**
 * TELETERM 3D HOLOGRAPHIC CYBERDECK & OPEN WORLD RPG — MAIN APPLICATION ENTRY
 * Built with pure ES Modules, Three.js Open World (Anime Sunset & 4 NPCs),
 * Xterm.js ConPTY, Codex AI, Interactive Antigravity Web Chat, and Accounts/Quota Switcher.
 */

import { OpenWorld3D } from './js/open-world-3d.js?v=48';
import { NpcDialogueSystem } from './js/npc-dialogue-system.js';
import { AntigravityWebChat } from './js/antigravity-web-chat.js';
import { TerminalManager } from './js/terminal-manager.js';
import { VietnameseInputDock } from './js/vietnamese-input.js';
import { ThumbDeck } from './js/thumb-deck.js?v=34';
import { HudWidgets } from './js/hud-widgets.js';
import { AccountsQuotaManager } from './js/accounts-quota-manager.js';
import { CodexDeck } from './js/codex-deck.js';
import { ToolsDrawerManager } from './js/tools-drawer-manager.js';
import { AutoUpdater } from './js/auto-updater.js';
import { UniversalAgentDeck } from './js/universal-agent-deck.js';
import { GraphicsSettingsManager } from './js/ui/graphics-settings-manager.js';
import { universalSettingsModal } from './js/ui/universal-settings-modal.js';
import { i18n } from './js/i18n.js';
import { platformAdapter } from './js/platform/teleterm-platform.js';
import { DesktopLauncher } from './js/launcher/desktop-launcher.js';
import { themeManager } from './js/ui/theme-manager.js';

class TeleTermApp {
    constructor() {
        this.openWorld3D = null;
        this.npcDialogue = null;
        this.antigravityWebChat = null;
        this.terminalManager = null;
        this.vietInputDock = null;
        this.thumbDeck = null;
        this.hudWidgets = null;
        this.accountsManager = null;
        this.codexDeck = null;
        this.toolsDrawer = null;
        this.autoUpdater = null;
        this.universalAgentDeck = null;
        this.graphicsManager = null;
        this.desktopLauncher = null;
        this.themeManager = themeManager;
        this.platform = platformAdapter;

        this.currentView = 'terminal';
        this.isExploreMode = true; // default start in Open World Explore mode so user is immersed immediately
    }

    init() {
        console.log('[TeleTerm 3D RPG] Initializing Open World 3D & Hologram Controller...');
        window.__teleTermApp = this;
        window.themeManager = this.themeManager;

        // Initialize i18n multi-language engine
        if (i18n && typeof i18n.init === 'function') {
            i18n.init();
        }

        // 1. Initialize Open World 3D Engine (Three.js Ghibli Sunset & NPCs)
        this.openWorld3D = new OpenWorld3D({
            onToast: (msg, type) => this.hudWidgets?.showToast(msg, type),
            onNpcInteract: (npcId) => {
                if (window.visualNovelDialogueModal && this.openWorld3D?.getNpcVnDialogueData) {
                    const dialogue = this.openWorld3D.getNpcVnDialogueData(npcId);
                    window.visualNovelDialogueModal.open(npcId, dialogue.lines, dialogue.choices);
                } else if (this.npcDialogue) {
                    this.npcDialogue.open(npcId);
                }
            },
            onToggleUi: () => this.toggleExploreFocusMode()
        });
        window.openWorld3D = this.openWorld3D;

        // Calibrate initial 3D lighting to stored Claude theme
        if (this.openWorld3D && typeof this.openWorld3D.setTheme === 'function') {
            this.openWorld3D.setTheme(this.themeManager.currentTheme);
        }

        // 2. Initialize NPC Dialogue System (4 Anime NPCs)
        this.npcDialogue = new NpcDialogueSystem({
            onToast: (msg, type) => this.hudWidgets?.showToast(msg, type),
            onSummonRequest: (action) => this.handleNpcSummonRequest(action)
        });

        // 3. Initialize Terminal Manager
        const terminalMount = document.getElementById('terminal-mount');
        this.terminalManager = new TerminalManager(terminalMount, {
            onPulse: () => {
                // Pulse callback
            },
            onStatusChange: (status) => {
                this.handleStatusChange(status);
            },
            onServerMessage: (msg) => {
                if (this.autoUpdater) this.autoUpdater.handleWsMessage(msg);
            },
            onSessionChange: (session) => {
                if (this.currentView === 'terminal') {
                    const titleEl = document.getElementById('screen-title-text');
                    if (titleEl) {
                        const termIcon = window.TeleTermIcons ? window.TeleTermIcons.render('terminal', { size: 14 }) : '';
                        titleEl.innerHTML = `${termIcon} ${session.name || 'Terminal'}`;
                    }
                }
            },
            onEscape: () => {
                if (!this.isExploreMode) {
                    this.setFocusMode(false);
                }
            }
        });

        // 4. Initialize Vietnamese Input Dock
        this.vietInputDock = new VietnameseInputDock(this.terminalManager);

        // 5. Initialize HUD Widgets & Telemetry Poller
        this.hudWidgets = new HudWidgets(this.terminalManager, null);

        // 6. Initialize Accounts & Quota Manager
        this.accountsManager = new AccountsQuotaManager({
            onToast: (msg, type) => this.hudWidgets.showToast(msg, type),
            onAccountSwitched: () => {
                if (this.antigravityWebChat) this.antigravityWebChat.loadInitialData();
            }
        });

        // 7. Initialize Codex Deck
        this.codexDeck = new CodexDeck({
            onToast: (msg, type) => this.hudWidgets.showToast(msg, type),
            onPulse: () => {}
        });

        // 8. Initialize Antigravity Web Chat (100% Web Interactive)
        this.antigravityWebChat = new AntigravityWebChat({
            onToast: (msg, type) => this.hudWidgets.showToast(msg, type),
            onPulse: () => {}
        });

        // 8b. Initialize Universal Agent Deck (OpenClaw, Claude Code, Cursor, Aider)
        this.universalAgentDeck = new UniversalAgentDeck({
            onToast: (msg, type) => this.hudWidgets?.showToast(msg, type)
        });

        // 9. Initialize Cyber Tools Drawer (Desktop Peek, Files, Processes, Keys)
        this.toolsDrawer = new ToolsDrawerManager(this.terminalManager, {
            onToast: (msg, type) => this.hudWidgets.showToast(msg, type),
            onPulse: () => {}
        });

        // 9b. Initialize Graphics & Performance Settings Manager
        try {
            this.graphicsManager = new GraphicsSettingsManager({
                onToast: (msg, type) => this.hudWidgets?.showToast(msg, type),
                onApply: (settings) => {
                    if (this.openWorld3D) {
                        this.openWorld3D.applyGraphicsSettings(settings);
                    }
                }
            });
            window.graphicsManager = this.graphicsManager;
            universalSettingsModal.init();
        } catch (err) {
            console.error('[TeleTerm Init] GraphicsSettingsManager warning:', err);
        }

        // 10. Initialize Tactile Thumb Deck
        this.thumbDeck = new ThumbDeck(
            this.terminalManager,
            null,
            this.vietInputDock,
            () => this.toolsDrawer.open('control')
        );

        // Connect Mode & Summon controls
        this.setupModeAndSummonControls();

        // Connect thumb & nav buttons to Accounts & Quota modal
        this.setupAccountButtons();

        // 11. Wire up View Tabs (Terminal | Codex | Antigravity)
        this.setupViewTabs();

        // 12. Wire up Mobile Full Cyber Tools Drawer
        this.setupMobileFullToolsDrawer();

        // 13. Initialize Auto-Updater & Hot-Reload Engine (24/7 code watcher)
        this.autoUpdater = new AutoUpdater({
            onToast: (msg, type) => this.hudWidgets?.showToast(msg, type)
        });

        // Restore saved view & explore mode if reloaded via hot-update
        const savedView = sessionStorage.getItem('teleterm_active_view');
        const savedExplore = sessionStorage.getItem('teleterm_explore_mode');
        if (savedView && savedView !== 'terminal') {
            this.switchView(savedView);
        }
        if (savedExplore === 'false') {
            this.setFocusMode(true);
        } else {
            this.setFocusMode(false);
        }

        console.log('[TeleTerm 3D RPG] System online with Open World 3D, 4 Anime NPCs, Antigravity Web Chat & Hologram Summoner!');

        // 14. Initialize Official Desktop First Game Client Launcher
        this.desktopLauncher = new DesktopLauncher();
        window.desktopLauncher = this.desktopLauncher;

        const btnOpenLauncher = document.getElementById('btn-open-launcher');
        if (btnOpenLauncher) {
            btnOpenLauncher.addEventListener('click', () => {
                if (this.desktopLauncher) this.desktopLauncher.showLauncher();
            });
        }
    }

    setupModeAndSummonControls() {
        const btnNavMode = document.getElementById('btn-nav-mode');
        const btnMobileMode = document.getElementById('btn-mobile-mode');
        const btnMobileThink = document.getElementById('btn-mobile-think');
        const btnMobileInteract = document.getElementById('btn-mobile-interact');
        const interactPrompt = document.getElementById('world-interact-prompt');

        const toggleMode = () => this.toggleExploreFocusMode();

        if (btnNavMode) btnNavMode.addEventListener('click', toggleMode);
        if (btnMobileMode) btnMobileMode.addEventListener('click', toggleMode);

        // Terminal Toggle Floating Button
        const btnToggleTerm = document.getElementById('btn-toggle-terminal');
        if (btnToggleTerm) {
            btnToggleTerm.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMode();
            });
        }

        // Close / Minimize buttons on Terminal Deck Header
        const btnDeckClose = document.getElementById('btn-deck-close');
        const dotRed = document.querySelector('.header-dots .dot-red');
        const dotYellow = document.querySelector('.header-dots .dot-yellow');
        
        const minimizeToWorld = (e) => {
            if (e) e.stopPropagation();
            this.setFocusMode(false); // smoothly return to 3D world
        };

        if (btnDeckClose) btnDeckClose.addEventListener('click', minimizeToWorld);
        if (dotRed) dotRed.addEventListener('click', minimizeToWorld);
        if (dotYellow) dotYellow.addEventListener('click', minimizeToWorld);

        // Mobile Thinking Pose Toggle
        if (btnMobileThink) {
            btnMobileThink.addEventListener('click', () => {
                if (this.openWorld3D) this.openWorld3D.toggleThinkingPose();
            });
        }

        // Mobile interact fallback button (if present)
        if (btnMobileInteract) {
            btnMobileInteract.addEventListener('click', () => {
                if (this.openWorld3D) this.openWorld3D.handleInteractAction();
            });
        }

        // Tap mobile view pill in header to switch between 3D explore and focus workspace
        const mobPill = document.getElementById('mobile-current-view-pill');
        if (mobPill) {
            mobPill.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMode();
            });
        }

        // Screen Orientation Toggle (Landscape / Portrait)
        const updateOrientationButtonLabel = () => {
            const isLandscape = window.innerWidth > window.innerHeight || document.body.classList.contains('force-landscape');
            const icons = document.querySelectorAll('.orientation-toggle-icon');
            const texts = document.querySelectorAll('.orientation-toggle-text');
            icons.forEach(el => el.innerHTML = window.TeleTermIcons ? window.TeleTermIcons.render(isLandscape ? 'smartphone' : 'rotate-ccw', { size: 14 }) : '');
            const langText = i18n ? i18n.t(isLandscape ? 'nav_orientation_portrait' : 'nav_orientation_landscape') : (isLandscape ? 'Portrait' : 'Landscape');
            texts.forEach(el => el.textContent = langText);
        };
        this.updateOrientationButtonLabel = updateOrientationButtonLabel;

        const toggleOrientation = async () => {
            const isPhysicallyLandscape = window.innerWidth > window.innerHeight;
            if (isPhysicallyLandscape) {
                // If already in physical landscape, toggle fullscreen or clean up
                if (document.fullscreenElement) {
                    await document.exitFullscreen().catch(() => {});
                }
                document.body.classList.remove('force-landscape');
                updateOrientationButtonLabel();
                if (this.openWorld3D) this.openWorld3D.onWindowResize();
                return;
            }

            const currentlyForce = document.body.classList.contains('force-landscape');
            const targetLandscape = !currentlyForce;

            if (targetLandscape) {
                if (window.innerWidth <= window.innerHeight) {
                    document.body.classList.add('force-landscape');
                } else {
                    document.body.classList.remove('force-landscape');
                }
                // Request native fullscreen lock in background (if supported on Android)
                try {
                    const req = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen;
                    if (req) {
                        Promise.resolve(req.call(document.documentElement)).catch(() => {});
                    }
                    if (screen.orientation && screen.orientation.lock) {
                        Promise.resolve(screen.orientation.lock('landscape')).catch(() => {});
                    }
                } catch (e) {
                    console.log('[Native orientation lock fallback to CSS]');
                }
            } else {
                document.body.classList.remove('force-landscape');
                try {
                    if (screen.orientation && screen.orientation.unlock) {
                        screen.orientation.unlock();
                    }
                    if (document.fullscreenElement) {
                        document.exitFullscreen().catch(() => {});
                    }
                } catch (e) {}
            }

            updateOrientationButtonLabel();

            if (this.openWorld3D) {
                this.openWorld3D.onWindowResize();
                setTimeout(() => this.openWorld3D.onWindowResize(), 60);
                setTimeout(() => this.openWorld3D.onWindowResize(), 250);
            }
        };

        const btnToggleOrient = document.getElementById('btn-toggle-orientation');
        const btnMobileOrient = document.getElementById('btn-mobile-orientation');
        if (btnToggleOrient) btnToggleOrient.addEventListener('click', toggleOrientation);
        if (btnMobileOrient) btnMobileOrient.addEventListener('click', toggleOrientation);

        const handleScreenGeometryChange = () => {
            if (window.innerWidth > window.innerHeight) {
                // Device is physically in landscape; clear CSS force-landscape to avoid double transformation
                document.body.classList.remove('force-landscape');
            }
            updateOrientationButtonLabel();
            if (this.openWorld3D) {
                this.openWorld3D.onWindowResize();
                setTimeout(() => this.openWorld3D.onWindowResize(), 100);
            }
        };

        window.addEventListener('resize', handleScreenGeometryChange);
        window.addEventListener('orientationchange', handleScreenGeometryChange);
        updateOrientationButtonLabel();

        // Update mobile interact button visibility based on proximity
        setInterval(() => {
            if (btnMobileInteract && this.openWorld3D) {
                btnMobileInteract.classList.toggle('hidden', !this.openWorld3D.nearbyNpc);
            }
        }, 300);

        // Global Key Routing: Focus Mode vs Explore Mode (ConPTY vs 3D World)
        window.addEventListener('keydown', (e) => {
            if (this.desktopLauncher && this.desktopLauncher.isLauncherVisible) return;

            const target = e.target;
            const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
            const isChat = target && target.closest('#mmo-chat-container');

            if (e.key === 'Escape') {
                if (this.isAdeOpen) {
                    e.preventDefault();
                    this.closeADEStudio(true);
                } else if (!this.isExploreMode) {
                    e.preventDefault();
                    this.setFocusMode(false); // Return to 3D world
                }
            } else if (e.key === '`' || e.key === '~') {
                if (!isInput && !isChat) {
                    e.preventDefault();
                    this.toggleExploreFocusMode();
                }
            }
        }, true);
    }

    toggleExploreFocusMode() {
        // Invert current explore state: if exploring, open focus; if in focus, return to explore
        this.setFocusMode(this.isExploreMode);
    }

    setFocusMode(isFocus) {
        this.isExploreMode = !isFocus;
        this.universalAgentDeck?.setPanelActive(!!isFocus && this.currentView === 'universal');
        if (!isFocus && this.isAdeOpen) {
            this.closeADEStudio(false);
        }
        document.body.classList.toggle('mode-explore', this.isExploreMode);
        document.body.classList.toggle('mode-focus', isFocus);
        document.body.classList.toggle('terminal-hidden', this.isExploreMode);

        const btnToggleTerm = document.getElementById('btn-toggle-terminal');
        if (btnToggleTerm) {
            btnToggleTerm.classList.toggle('active', isFocus);
            const iconSpan = document.getElementById('toggle-term-icon');
            if (iconSpan) {
                iconSpan.innerHTML = window.TeleTermIcons ? window.TeleTermIcons.render(isFocus ? 'x' : 'terminal', { size: 14 }) : '';
            }
        }

        if (this.openWorld3D) {
            this.openWorld3D.setExploreMode(this.isExploreMode);
        }

        if (isFocus) {
            if (this.terminalManager) {
                setTimeout(() => {
                    this.terminalManager.fit();
                    this.terminalManager.term?.focus();
                }, 350);
            }
        } else {
            // Explore Mode: cleanly blur terminal & background inputs so WASD drives 3D avatar
            if (this.terminalManager?.term) {
                try { this.terminalManager.term.blur(); } catch (e) {}
            }
            if (document.activeElement && typeof document.activeElement.blur === 'function' && document.activeElement !== document.body) {
                document.activeElement.blur();
            }
            if (this.openWorld3D?.canvas) {
                try { this.openWorld3D.canvas.focus(); } catch (e) {}
            }
        }

        const navModeText = document.getElementById('nav-mode-text');
        const navModeIcon = document.getElementById('nav-mode-icon');
        const btnMobileMode = document.getElementById('btn-mobile-mode');

        if (this.isExploreMode) {
            if (navModeText) navModeText.textContent = i18n ? i18n.t('nav_mode_explore') : 'Explore';
            if (navModeIcon) navModeIcon.innerHTML = window.TeleTermIcons ? window.TeleTermIcons.render('orbit', { size: 14 }) : '';
            if (btnMobileMode) {
                const icon = window.TeleTermIcons ? window.TeleTermIcons.render('target', { size: 13, className: 'btn-icon' }) : '';
                btnMobileMode.innerHTML = `${icon} ${i18n ? i18n.t('nav_mode_work') : 'Focus'}`;
            }
        } else {
            if (navModeText) navModeText.textContent = i18n ? i18n.t('nav_mode_work') : 'Work';
            if (navModeIcon) navModeIcon.innerHTML = window.TeleTermIcons ? window.TeleTermIcons.render('target', { size: 14 }) : '';
            if (btnMobileMode) {
                const icon = window.TeleTermIcons ? window.TeleTermIcons.render('orbit', { size: 13, className: 'btn-icon' }) : '';
                btnMobileMode.innerHTML = `${icon} ${i18n ? i18n.t('nav_mode_explore') : 'Explore'}`;
            }
        }

        const mobPill = document.getElementById('mobile-current-view-pill');
        if (mobPill) {
            const renderPill = (iconName, label) => {
                const ic = window.TeleTermIcons ? window.TeleTermIcons.render(iconName, { size: 12, className: 'pill-icon' }) : '';
                return `${ic} <span>${label}</span>`;
            };
            if (this.isExploreMode) {
                mobPill.innerHTML = renderPill('orbit', i18n ? i18n.t('nav_3d_world_short') : '3D');
            } else {
                const labels = {
                    terminal: renderPill('terminal', i18n ? i18n.t('nav_term_short') : 'Term'),
                    codex: renderPill('message-square', i18n ? i18n.t('nav_codex_short') : 'Codex'),
                    antigravity: renderPill('orbit', i18n ? i18n.t('nav_agy_short') : 'AGY'),
                    universal: renderPill('users', i18n ? i18n.t('nav_universal_short') : 'Agents')
                };
                mobPill.innerHTML = labels[this.currentView] || renderPill('terminal', 'Term');
            }
        }
    }

    handleNpcSummonRequest(action) {
        if (action === 'summon_term') {
            this.switchView('terminal');
            this.setFocusMode(true);
        } else if (action === 'summon_codex') {
            this.switchView('codex');
            this.setFocusMode(true);
        } else if (action === 'summon_agy') {
            this.switchView('antigravity');
            this.setFocusMode(true);
        } else if (action === 'open_tools') {
            this.toolsDrawer.open('control');
        }
    }

    setupAccountButtons() {
        const btnThumbAccounts = document.getElementById('thumb-accounts');
        if (btnThumbAccounts) {
            btnThumbAccounts.addEventListener('click', () => {
                this.accountsManager.open();
            });
        }

        const btnNavAccounts = document.getElementById('btn-open-accounts-nav');
        if (btnNavAccounts) {
            btnNavAccounts.addEventListener('click', () => {
                this.accountsManager.open();
            });
        }

        const btnNavHub = document.getElementById('btn-nav-hub');
        if (btnNavHub) {
            btnNavHub.addEventListener('click', (e) => {
                e.stopPropagation();
                const legacyModal = document.getElementById('cyber-hub-modal');
                if (legacyModal) legacyModal.classList.add('hidden');
                this.toolsDrawer.open('control');
            });
        }

        const btnThumbPeek = document.getElementById('thumb-peek');
        if (btnThumbPeek) {
            btnThumbPeek.addEventListener('click', (e) => {
                e.preventDefault();
                this.toolsDrawer.openDesktopPeek();
            });
        }

        const btnOpenGfx = document.getElementById('btn-open-graphics-settings');
        if (btnOpenGfx) {
            btnOpenGfx.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.graphicsManager) this.graphicsManager.open();
            });
        }

        const btnDrawerGfx = document.getElementById('btn-drawer-open-full-gfx');
        if (btnDrawerGfx) {
            btnDrawerGfx.addEventListener('click', () => {
                if (this.toolsDrawer) this.toolsDrawer.close();
                if (this.graphicsManager) this.graphicsManager.open();
            });
        }

        const tileGfxHub = document.getElementById('tile-graphics-hub');
        if (tileGfxHub) {
            tileGfxHub.addEventListener('click', () => {
                const hub = document.getElementById('cyber-hub-modal');
                if (hub) hub.classList.add('hidden');
                if (this.graphicsManager) this.graphicsManager.open();
            });
        }
    }

    setupViewTabs() {
        const tabs = [
            { id: 'tab-view-term', view: 'terminal' },
            { id: 'tab-view-codex', view: 'codex' },
            { id: 'tab-view-agy', view: 'antigravity' },
            { id: 'tab-view-universal', view: 'universal' },
            { id: 'tab-view-ade', view: 'ade' }
        ];

        tabs.forEach(t => {
            const btn = document.getElementById(t.id);
            if (!btn) return;
            btn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('teleterm:tool-active', { detail: { tool: t.view } }));

                if (t.view === 'ade') {
                    if (this.currentView === 'ade' && this.isAdeOpen) {
                        this.closeADEStudio(true); // Return directly to 3D world
                    } else {
                        this.openADEStudio();
                    }
                    return;
                }

                // If ADE viewport was active, hide it smoothly
                if (this.isAdeOpen) {
                    this.closeADEStudio(false);
                }

                if (this.currentView === t.view && !this.isExploreMode) {
                    // Clicking active tab returns smoothly to 3D world
                    this.setFocusMode(false);
                } else {
                    this.switchView(t.view);
                    this.setFocusMode(true); // Bring panel forward when tab clicked
                }
            });
        });

        const btnBackWorld = document.getElementById('btn-nav-back-to-world');
        if (btnBackWorld) {
            btnBackWorld.addEventListener('click', () => {
                if (this.isAdeOpen) this.closeADEStudio(true);
                else this.setFocusMode(false);
            });
        }

        // Close ADE Studio trigger button on viewport header
        const btnCloseAde = document.getElementById('btn-close-ade-studio');
        if (btnCloseAde) {
            btnCloseAde.addEventListener('click', () => {
                this.closeADEStudio(true);
            });
        }

        // Zero-reload seamless return message from embedded ADE iframe
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'teleterm:close-ade') {
                this.closeADEStudio(true);
            }
        });

        // Live update mode labels, pills, and orientation when language changes
        window.addEventListener('teleterm-language-changed', () => {
            const navModeText = document.getElementById('nav-mode-text');
            if (navModeText) {
                navModeText.textContent = i18n ? i18n.t(this.isExploreMode ? 'nav_mode_explore' : 'nav_mode_work') : (this.isExploreMode ? 'Explore' : 'Work');
            }
            const btnMobileMode = document.getElementById('btn-mobile-mode');
            if (btnMobileMode) {
                const icon = window.TeleTermIcons ? window.TeleTermIcons.render(this.isExploreMode ? 'target' : 'orbit', { size: 13, className: 'btn-icon' }) : '';
                btnMobileMode.innerHTML = `${icon} ${this.isExploreMode ? (i18n ? i18n.t('nav_mode_work') : 'Focus') : (i18n ? i18n.t('nav_mode_explore') : 'Explore')}`;
            }
            if (this.updateOrientationButtonLabel) {
                this.updateOrientationButtonLabel();
            }
            const mobPill = document.getElementById('mobile-current-view-pill');
            if (mobPill) {
                const renderPill = (iconName, label) => {
                    const ic = window.TeleTermIcons ? window.TeleTermIcons.render(iconName, { size: 12, className: 'pill-icon' }) : '';
                    return `${ic} <span>${label}</span>`;
                };
                if (this.isExploreMode) {
                    mobPill.innerHTML = renderPill('orbit', i18n ? i18n.t('nav_3d_world_short') : '3D');
                } else {
                    const labels = {
                        terminal: renderPill('terminal', i18n ? i18n.t('nav_term_short') : 'Term'),
                        codex: renderPill('message-square', i18n ? i18n.t('nav_codex_short') : 'Codex'),
                        antigravity: renderPill('orbit', i18n ? i18n.t('nav_agy_short') : 'AGY'),
                        universal: renderPill('users', i18n ? i18n.t('nav_universal_short') : 'Agents'),
                        ade: renderPill('code', 'ADE')
                    };
                    mobPill.innerHTML = labels[this.currentView] || renderPill('terminal', 'Term');
                }
            }
            const modeEl = document.getElementById('mob-mode-val');
            if (modeEl) {
                modeEl.textContent = this.isExploreMode 
                    ? (i18n ? i18n.t('nav_3d_world') : '3D World') 
                    : (i18n ? i18n.t('nav_mode_work') : 'Focus Deck');
            }
        });
    }

    openADEStudio() {
        const vp = document.getElementById('ade-studio-viewport');
        const frame = document.getElementById('ade-studio-frame');
        if (!vp || !frame) return;

        if (!frame.src || frame.src === 'about:blank' || !frame.src.includes('/ade')) {
            frame.src = '/ade?embed=1';
        }

        vp.classList.remove('hidden');
        vp.style.display = 'flex';
        document.body.classList.add('ade-studio-active');
        this.isAdeOpen = true;
        this.universalAgentDeck?.setPanelActive(false);
        this.currentView = 'ade';

        // Update nav tabs active state
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === 'ade');
        });

        // Hide floating focus screens so there is no layout overlap
        const panelTerm = document.getElementById('panel-terminal');
        const panelCodex = document.getElementById('panel-codex');
        const panelAgy = document.getElementById('panel-antigravity');
        const panelUniversal = document.getElementById('panel-universal');
        if (panelTerm) panelTerm.classList.add('hidden');
        if (panelCodex) panelCodex.classList.add('hidden');
        if (panelAgy) panelAgy.classList.add('hidden');
        if (panelUniversal) panelUniversal.classList.add('hidden');

        const mobPill = document.getElementById('mobile-current-view-pill');
        if (mobPill) {
            const ic = window.TeleTermIcons ? window.TeleTermIcons.render('code', { size: 12, className: 'pill-icon' }) : '';
            mobPill.innerHTML = `${ic} <span>ADE</span>`;
        }
    }

    closeADEStudio(switchToExplore = true) {
        const vp = document.getElementById('ade-studio-viewport');
        if (vp) {
            vp.classList.add('hidden');
            vp.style.display = 'none';
        }
        document.body.classList.remove('ade-studio-active');
        this.isAdeOpen = false;

        const tabAde = document.getElementById('tab-view-ade');
        if (tabAde) tabAde.classList.remove('active');

        if (switchToExplore) {
            this.setFocusMode(false);
            if (this.openWorld3D) {
                this.openWorld3D.onWindowResize();
            }
        }
    }

    switchView(viewName) {
        if (this.isAdeOpen && viewName !== 'ade') {
            this.closeADEStudio(false);
        }
        if (this.currentView === viewName) return;
        this.universalAgentDeck?.setPanelActive(viewName === 'universal' && !this.isExploreMode);
        this.currentView = viewName;

        // Update nav tabs active state
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            if (btn.dataset.view) {
                btn.classList.toggle('active', btn.dataset.view === viewName);
            }
        });

        const panelTerm = document.getElementById('panel-terminal');
        const panelCodex = document.getElementById('panel-codex');
        const panelAgy = document.getElementById('panel-antigravity');
        const panelUniversal = document.getElementById('panel-universal');
        const titleEl = document.getElementById('screen-title-text');

        if (panelTerm) panelTerm.classList.toggle('hidden', viewName !== 'terminal');
        if (panelCodex) panelCodex.classList.toggle('hidden', viewName !== 'codex');
        if (panelAgy) panelAgy.classList.toggle('hidden', viewName !== 'antigravity');
        if (panelUniversal) panelUniversal.classList.toggle('hidden', viewName !== 'universal');

        const diffBadge = document.getElementById('codex-diff-summary');
        if (diffBadge) {
            diffBadge.style.display = viewName === 'codex' ? 'inline-block' : 'none';
        }

        if (viewName === 'terminal') {
            if (titleEl) titleEl.innerHTML = `${window.TeleTermIcons ? window.TeleTermIcons.render('terminal', { size: 14 }) : ''} Terminal`;
            setTimeout(() => this.terminalManager?.fit(), 50);
        } else if (viewName === 'codex') {
            if (titleEl) titleEl.innerHTML = `${window.TeleTermIcons ? window.TeleTermIcons.render('message-square', { size: 14 }) : ''} Codex`;
            if (this.codexDeck) {
                this.codexDeck.loadSidebar(false);
                setTimeout(() => this.codexDeck.scrollToBottom(), 80);
            }
        } else if (viewName === 'antigravity') {
            if (titleEl) titleEl.innerHTML = `${window.TeleTermIcons ? window.TeleTermIcons.render('orbit', { size: 14 }) : ''} Antigravity Web Chat`;
            if (this.antigravityWebChat) {
                this.antigravityWebChat.loadInitialData();
                setTimeout(() => this.antigravityWebChat.scrollToBottom(), 80);
            }
        } else if (viewName === 'universal') {
            if (titleEl) titleEl.innerHTML = `${window.TeleTermIcons ? window.TeleTermIcons.render('users', { size: 14 }) : ''} All AI Agents`;
            if (this.universalAgentDeck) {
                this.universalAgentDeck.loadAgents(false);
                setTimeout(() => this.universalAgentDeck.scrollToBottom(), 80);
            }
        }

        const mobPill = document.getElementById('mobile-current-view-pill');
        if (mobPill && !this.isExploreMode) {
            const renderPill = (iconName, label) => {
                const ic = window.TeleTermIcons ? window.TeleTermIcons.render(iconName, { size: 12, className: 'pill-icon' }) : '';
                return `${ic} <span>${label}</span>`;
            };
            const labels = {
                terminal: renderPill('terminal', i18n ? i18n.t('nav_term_short') : 'Term'),
                codex: renderPill('message-square', i18n ? i18n.t('nav_codex_short') : 'Codex'),
                antigravity: renderPill('orbit', i18n ? i18n.t('nav_agy_short') : 'AGY'),
                universal: renderPill('users', i18n ? i18n.t('nav_universal_short') : 'Agents')
            };
            mobPill.innerHTML = labels[viewName] || renderPill('terminal', 'Term');
        }

        // Synchronize in-world 3D floating hologram on player avatar
        const holoMap = {
            terminal: 'TERM',
            codex: 'CODEX',
            antigravity: 'AGY',
            universal: 'ADE',
            ade: 'ADE'
        };
        const holoTool = holoMap[viewName] || 'TERM';
        if (window.inworldHologramSystem) {
            window.inworldHologramSystem.setLocalTool(holoTool);
        }
    }

    setupMobileFullToolsDrawer() {
        const modal = document.getElementById('modal-mobile-full-tools');
        const btnTrigger = document.getElementById('btn-mobile-tools-drawer');
        const btnClose = document.getElementById('btn-close-mobile-tools');
        const btnThumbHub = document.getElementById('thumb-hub');

        if (!modal) return;

        const openDrawer = () => {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';

            // Sync live telemetry in mobile drawer
            const cpuEl = document.getElementById('mob-cpu-val');
            const ramEl = document.getElementById('mob-ram-val');
            const lvlEl = document.getElementById('mob-level-val');
            const modeEl = document.getElementById('mob-mode-val');
            const topCpu = document.getElementById('top-cpu-chip');
            const topRam = document.getElementById('top-ram-chip');
            const topLvl = document.getElementById('hud-player-level');

            if (cpuEl && topCpu) cpuEl.textContent = topCpu.textContent;
            if (ramEl && topRam) ramEl.textContent = topRam.textContent;
            if (lvlEl && topLvl) lvlEl.textContent = topLvl.textContent;
            if (modeEl) {
                modeEl.textContent = this.isExploreMode 
                    ? (i18n ? i18n.t('nav_3d_world') : '3D World') 
                    : (i18n ? i18n.t('nav_mode_work') : 'Focus Deck');
            }
        };

        const closeDrawer = () => {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        };

        if (btnTrigger) {
            btnTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                openDrawer();
            });
        }

        if (btnClose) {
            btnClose.addEventListener('click', (e) => {
                e.stopPropagation();
                closeDrawer();
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeDrawer();
            }
        });

        // Keyboard Esc to dismiss
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeDrawer();
            }
        });

        // Prevent touch events on drawer sheet from propagating to 3D world or being canceled
        const drawerSheet = modal.querySelector('.mobile-tools-drawer-sheet');
        if (drawerSheet) {
            drawerSheet.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            }, { passive: true });
            drawerSheet.addEventListener('touchmove', (e) => {
                e.stopPropagation();
            }, { passive: true });
        }

        // Swipe down on drag bar to close
        const dragBar = modal.querySelector('.mobile-drawer-drag-bar');
        if (dragBar) {
            let startY = 0;
            dragBar.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
            }, { passive: true });
            dragBar.addEventListener('touchend', (e) => {
                const endY = e.changedTouches[0].clientY;
                if (endY - startY > 40) {
                    closeDrawer();
                }
            }, { passive: true });
        }

        // If on small device, clicking thumb-hub opens this mobile drawer
        if (btnThumbHub) {
            btnThumbHub.addEventListener('click', (e) => {
                const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
                if (isMobile) {
                    e.stopPropagation();
                    openDrawer();
                }
            });
        }

        const handleTileAction = (action) => {
            closeDrawer();

            switch (action) {
                case 'view-terminal':
                    this.switchView('terminal');
                    this.setFocusMode(true);
                    break;
                case 'view-codex':
                    this.switchView('codex');
                    this.setFocusMode(true);
                    break;
                case 'view-antigravity':
                    this.switchView('antigravity');
                    this.setFocusMode(true);
                    break;
                case 'view-universal':
                    this.switchView('universal');
                    this.setFocusMode(true);
                    break;
                case 'open-accounts':
                    if (this.accountsManager) this.accountsManager.open();
                    break;
                case 'toggle-mode':
                    this.toggleExploreFocusMode();
                    break;
                case 'open-graphics':
                    if (this.graphicsManager) this.graphicsManager.open();
                    break;
                case 'toggle-language': {
                    const newLang = i18n ? i18n.toggleLanguage() : 'en';
                    const msg = newLang === 'vi' ? 'Đã đổi ngôn ngữ sang Tiếng Việt' : 'Language set to English';
                    this.hudWidgets?.showToast(msg, 'info');
                    break;
                }
                case 'toggle-lofi': {
                    const lofiPanel = document.getElementById('lofi-vibe-panel');
                    if (lofiPanel) lofiPanel.classList.toggle('hidden');
                    break;
                }
                case 'open-customizer': {
                    const custModal = document.getElementById('modal-avatar-customizer');
                    if (custModal) custModal.classList.remove('hidden');
                    break;
                }
                case 'toggle-mmo-chat': {
                    const chat = document.getElementById('mmo-chat-container');
                    if (chat) chat.classList.toggle('chat-closed');
                    break;
                }
                case 'toggle-orientation': {
                    const orientBtn = document.getElementById('btn-toggle-orientation') || document.getElementById('btn-mobile-orientation');
                    if (orientBtn) orientBtn.click();
                    break;
                }
                case 'toggle-viet-dock':
                    if (this.vietInputDock) this.vietInputDock.toggle();
                    break;
                case 'desktop-peek':
                    if (this.toolsDrawer) this.toolsDrawer.openDesktopPeek();
                    break;
                case 'open-files':
                    if (this.toolsDrawer) this.toolsDrawer.open('files');
                    break;
                case 'open-processes':
                    if (this.toolsDrawer) this.toolsDrawer.open('processes');
                    break;
                case 'open-keys':
                    if (this.toolsDrawer) this.toolsDrawer.open('keys');
                    break;
                case 'open-preview':
                    if (this.toolsDrawer) this.toolsDrawer.open('control');
                    break;
                case 'get-clipboard':
                    document.getElementById('tool-read-pc-clipboard')?.click();
                    break;
                case 'send-clipboard':
                    document.getElementById('tool-send-pc-clipboard')?.click();
                    break;
                case 'screen-off':
                    document.getElementById('tool-screen-off')?.click();
                    break;
                case 'lock-pc':
                    document.getElementById('tool-lock-windows')?.click();
                    break;
            }
        };

        // Action Tiles — Fast tactile touch with click fallback and scroll tolerance
        modal.querySelectorAll('[data-mob-action]').forEach(tile => {
            let touchStartX = 0;
            let touchStartY = 0;
            let isTouchMoved = false;
            let lastTouchTrigger = 0;

            tile.addEventListener('touchstart', (e) => {
                isTouchMoved = false;
                if (e.touches && e.touches[0]) {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                }
                tile.classList.add('active-touch');
            }, { passive: true });

            tile.addEventListener('touchmove', (e) => {
                if (e.touches && e.touches[0]) {
                    const dx = Math.abs(e.touches[0].clientX - touchStartX);
                    const dy = Math.abs(e.touches[0].clientY - touchStartY);
                    if (dx > 10 || dy > 10) {
                        isTouchMoved = true;
                        tile.classList.remove('active-touch');
                    }
                }
            }, { passive: true });

            tile.addEventListener('touchend', (e) => {
                tile.classList.remove('active-touch');
                if (!isTouchMoved) {
                    lastTouchTrigger = Date.now();
                    const action = tile.dataset.mobAction;
                    if (action) handleTileAction(action);
                }
            });

            tile.addEventListener('click', (e) => {
                e.stopPropagation();
                // Prevent duplicate trigger if touchend already handled this interaction
                if (Date.now() - lastTouchTrigger < 400) return;
                const action = tile.dataset.mobAction;
                if (action) handleTileAction(action);
            });
        });
    }

    handleStatusChange(status) {
        const connChip = document.getElementById('top-conn-chip');
        const brandOrb = document.getElementById('brand-orb');

        if (status === 'connected') {
            if (connChip) {
                connChip.textContent = 'ONLINE';
                connChip.className = 'chip-val val-emerald';
            }
            if (brandOrb) {
                brandOrb.style.background = 'var(--cyber-cyan)';
                brandOrb.style.boxShadow = '0 0 12px var(--cyber-cyan)';
            }
        } else if (status === 'connecting') {
            if (connChip) {
                connChip.textContent = 'CONNECTING';
                connChip.className = 'chip-val val-violet';
            }
            if (brandOrb) {
                brandOrb.style.background = 'var(--cyber-violet)';
                brandOrb.style.boxShadow = '0 0 12px var(--cyber-violet)';
            }
        } else if (status === 'session-unavailable') {
            if (connChip) {
                connChip.textContent = 'SESSION ENDED';
                connChip.className = 'chip-val val-rose';
            }
            if (brandOrb) {
                brandOrb.style.background = 'var(--cyber-rose)';
                brandOrb.style.boxShadow = '0 0 12px var(--cyber-rose)';
            }
        } else if (status === 'unauthenticated') {
            if (connChip) {
                connChip.textContent = 'SIGN IN REQUIRED';
                connChip.className = 'chip-val val-rose';
            }
            if (brandOrb) {
                brandOrb.style.background = 'var(--cyber-rose)';
                brandOrb.style.boxShadow = '0 0 12px var(--cyber-rose)';
            }
        } else if (status === 'owner-required') {
            if (connChip) {
                connChip.textContent = 'OWNER ONLY';
                connChip.className = 'chip-val val-rose';
            }
            if (brandOrb) {
                brandOrb.style.background = 'var(--cyber-rose)';
                brandOrb.style.boxShadow = '0 0 12px var(--cyber-rose)';
            }
        } else {
            if (connChip) {
                connChip.textContent = 'OFFLINE';
                connChip.className = 'chip-val val-rose';
            }
            if (brandOrb) {
                brandOrb.style.background = 'var(--cyber-rose)';
                brandOrb.style.boxShadow = '0 0 12px var(--cyber-rose)';
            }
        }
    }

    handleNpcSummonRequest(action) {
        if (!action) return;
        if (action === 'summon_term') {
            this.switchView('terminal');
            this.setFocusMode(true);
        } else if (action === 'summon_agy') {
            this.switchView('antigravity');
            this.setFocusMode(true);
        } else if (action === 'summon_codex') {
            this.switchView('codex');
            this.setFocusMode(true);
        } else if (action === 'summon_universal') {
            this.switchView('universal');
            this.setFocusMode(true);
        } else if (action === 'open_tools') {
            if (this.toolsDrawer) {
                this.toolsDrawer.open();
            }
        }
    }
}

// Instantiate and expose globally
window.TeleTermApp = new TeleTermApp();
window.app = window.TeleTermApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.TeleTermApp.init();
    });
} else {
    // DOM already loaded (common with ES modules)
    window.TeleTermApp.init();
}
