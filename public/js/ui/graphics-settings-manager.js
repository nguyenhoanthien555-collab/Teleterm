/**
 * TELETERM GRAPHICS & PERFORMANCE QUALITY SETTINGS MANAGER
 * Provides comprehensive platform profiles (Mobile vs PC Desktop), 4-tier presets (Low, Medium, High, Max),
 * and granular real-time graphics controls (DPR, Anti-Aliasing, Shadows, Model Smoothing, Minecraft-inspired Shaders,
 * Frame Rate Cap, Smart Nametag Culling).
 */

export const GRAPHICS_PRESETS = {
    // 1. Mobile Optimized Profiles (Battery-conscious, cool thermals, crisp mipmapped textures)
    mobile: {
        low: {
            id: 'low',
            platform: 'mobile',
            name: 'Mobile Low',
            badge: 'Ultra Cool & Max Battery Saver',
            dpr: 0.8,
            antiAliasing: false,
            shadowQuality: 'off',
            modelSmoothing: 'standard',
            shaderMode: 'vanilla',
            fpsCap: 30,
            nametags: 'focus'
        },
        medium: {
            id: 'medium',
            platform: 'mobile',
            name: 'Mobile Medium (Recommended)',
            badge: 'Perfect balance of visual clarity and thermals',
            dpr: 1.0,
            antiAliasing: true,
            shadowQuality: '512',
            modelSmoothing: 'standard',
            shaderMode: 'vanilla',
            fpsCap: 60,
            nametags: 'focus'
        },
        high: {
            id: 'high',
            platform: 'mobile',
            name: 'Mobile High',
            badge: 'Crisp visuals for flagship devices / high-end chips',
            dpr: 1.25,
            antiAliasing: true,
            shadowQuality: '1024',
            modelSmoothing: 'high',
            shaderMode: 'enhanced',
            fpsCap: 60,
            nametags: 'focus'
        },
        max: {
            id: 'max',
            platform: 'mobile',
            name: 'Mobile Max',
            badge: 'Maximum mobile graphics (requires good cooling)',
            dpr: 1.5,
            antiAliasing: true,
            shadowQuality: '1024',
            modelSmoothing: 'high',
            shaderMode: 'enhanced',
            fpsCap: 60,
            nametags: 'focus'
        }
    },

    // 2. Web / Laptop Balanced Profiles
    web: {
        low: {
            id: 'low',
            platform: 'web',
            name: 'Web Low',
            badge: 'Low power laptop saver',
            dpr: 0.85,
            antiAliasing: false,
            shadowQuality: 'off',
            modelSmoothing: 'standard',
            shaderMode: 'vanilla',
            fpsCap: 45,
            nametags: 'focus'
        },
        medium: {
            id: 'medium',
            platform: 'web',
            name: 'Web Medium (Recommended)',
            badge: 'Smooth 60 FPS, merged batches & 512px shadows',
            dpr: 1.0,
            antiAliasing: true,
            shadowQuality: '512',
            modelSmoothing: 'standard',
            shaderMode: 'vanilla',
            fpsCap: 60,
            nametags: 'focus'
        },
        high: {
            id: 'high',
            platform: 'web',
            name: 'Web High',
            badge: 'Enhanced browser graphics',
            dpr: 1.15,
            antiAliasing: true,
            shadowQuality: '512',
            modelSmoothing: 'standard',
            shaderMode: 'enhanced',
            fpsCap: 60,
            nametags: 'focus'
        },
        max: {
            id: 'max',
            platform: 'web',
            name: 'Web Max',
            badge: 'Max browser fidelity',
            dpr: 1.25,
            antiAliasing: true,
            shadowQuality: '1024',
            modelSmoothing: 'high',
            shaderMode: 'enhanced',
            fpsCap: 60,
            nametags: 'focus'
        }
    },

    // 3. PC Desktop Profiles (Full fidelity, rich anime shader atmosphere, soft PCF shadows)
    pc: {
        low: {
            id: 'low',
            platform: 'pc',
            name: 'PC Low',
            badge: 'For low-battery laptops or integrated GPUs',
            dpr: 1.0,
            antiAliasing: false,
            shadowQuality: '512',
            modelSmoothing: 'standard',
            shaderMode: 'vanilla',
            fpsCap: 60,
            nametags: 'focus'
        },
        medium: {
            id: 'medium',
            platform: 'pc',
            name: 'PC Medium',
            badge: 'Smooth 60 FPS for mainstream laptops',
            dpr: 1.0,
            antiAliasing: true,
            shadowQuality: '1024',
            modelSmoothing: 'standard',
            shaderMode: 'vanilla',
            fpsCap: 60,
            nametags: 'focus'
        },
        high: {
            id: 'high',
            platform: 'pc',
            name: 'PC High (Recommended)',
            badge: 'Stunning clarity, soft PCF shadows & warm anime shader',
            dpr: 1.25,
            antiAliasing: true,
            shadowQuality: '1024',
            modelSmoothing: 'high',
            shaderMode: 'enhanced',
            fpsCap: 60,
            nametags: 'focus'
        },
        max: {
            id: 'max',
            platform: 'pc',
            name: 'PC Max / Ultra',
            badge: 'Ultimate fidelity: Crisp anti-aliasing, 2048 soft shadows, 16x Anisotropy',
            dpr: 1.5,
            antiAliasing: true,
            shadowQuality: '2048',
            modelSmoothing: 'high',
            shaderMode: 'enhanced',
            fpsCap: 0, // Uncapped
            nametags: 'focus'
        }
    }
};

const STORAGE_KEY = 'teleterm_graphics_settings';

export class GraphicsSettingsManager {
    constructor(options = {}) {
        this.onToast = options.onToast || console.log;
        this.onApply = options.onApply || null;

        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || 
            (typeof window !== 'undefined' && ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)) && window.innerWidth <= 768);
        this.isMobileDevice = !!isMobile;

        // Current Active Settings
        this.settings = this.loadSettings();

        // UI references
        this.modalEl = null;
        this.isInitialized = false;

        this.init();
    }

    getDefaultSettings() {
        if (this.isMobileDevice) {
            return {
                platform: 'mobile',
                preset: 'medium',
                displayMode: 'window',
                timeOfDayMode: 'auto',
                ...GRAPHICS_PRESETS.mobile.medium
            };
        } else {
            return {
                platform: 'pc',
                preset: 'high',
                displayMode: 'borderless',
                timeOfDayMode: 'auto',
                ...GRAPHICS_PRESETS.pc.high
            };
        }
    }

    loadSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    const defs = this.getDefaultSettings();
                    const merged = { ...defs, ...parsed };
                    // If on PC desktop, do not force stale mobile settings
                    if (!this.isMobileDevice && parsed.platform === 'mobile' && !parsed.userExplicitMobile) {
                        merged.platform = 'pc';
                        merged.preset = (merged.preset === 'custom') ? 'custom' : 'high';
                        const pcDef = GRAPHICS_PRESETS.pc[merged.preset] || GRAPHICS_PRESETS.pc.high;
                        merged.dpr = Math.max(merged.dpr || 1.25, pcDef.dpr);
                        merged.shadowQuality = (merged.shadowQuality === 'off') ? 'off' : pcDef.shadowQuality;
                        merged.shaderMode = pcDef.shaderMode;
                    }
                    return merged;
                }
            }
        } catch (e) {
            console.warn('[GraphicsSettingsManager] Failed to read localStorage:', e);
        }
        return this.getDefaultSettings();
    }

    saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        } catch (e) {
            console.warn('[GraphicsSettingsManager] Failed to write localStorage:', e);
        }
    }

    init() {
        this.modalEl = document.getElementById('modal-graphics-settings');
        if (this.modalEl) {
            this.bindModalEvents();
            this.renderUIState();
        }

        // Synchronize display mode with desktop platform / browser
        if (typeof window !== 'undefined' && window.TeleTermPlatform && window.TeleTermPlatform.window) {
            if (typeof window.TeleTermPlatform.window.getDisplayMode === 'function') {
                window.TeleTermPlatform.window.getDisplayMode().then(mode => {
                    if (mode && ['fullscreen', 'borderless', 'window'].includes(mode)) {
                        this.settings.displayMode = mode;
                        this.renderUIState();
                    }
                }).catch(() => {});
            }
            if (typeof window.TeleTermPlatform.window.onDisplayModeChange === 'function') {
                window.TeleTermPlatform.window.onDisplayModeChange(({ mode }) => {
                    if (mode && ['fullscreen', 'borderless', 'window'].includes(mode)) {
                        this.settings.displayMode = mode;
                        this.saveSettings();
                        this.renderUIState();
                    }
                });
            }
        }

        // Apply persisted time of day mode
        this.applyTimeOfDayMode(this.settings.timeOfDayMode || 'auto');
        if (typeof window !== 'undefined') {
            window.addEventListener('load', () => {
                this.applyTimeOfDayMode(this.settings.timeOfDayMode || 'auto');
            });
        }

        this.isInitialized = true;
    }

    async setDisplayMode(mode) {
        if (!['fullscreen', 'borderless', 'window'].includes(mode)) return;
        this.settings.displayMode = mode;
        this.saveSettings();

        if (typeof window !== 'undefined' && window.TeleTermPlatform && window.TeleTermPlatform.window && typeof window.TeleTermPlatform.window.setDisplayMode === 'function') {
            await window.TeleTermPlatform.window.setDisplayMode(mode);
        }

        this.renderUIState();

        const i18n = window.TeleTermI18n;
        const modeName = i18n ? i18n.t(`gfx_mode_${mode}`) : mode;
        const msg = i18n
            ? i18n.t('toast_display_mode_applied', { mode: modeName })
            : `Display mode set to ${modeName}`;
        this.onToast(msg, 'info');
    }

    getSettings() {
        return { ...this.settings };
    }

    applyPreset(presetId) {
        const i18n = window.TeleTermI18n;
        if (presetId === 'custom') {
            this.settings.preset = 'custom';
            this.saveSettings();
            this.dispatchSettingsChange();
            this.renderUIState();
            const msg = i18n ? i18n.t('toast_preset_custom') : 'Custom settings mode enabled';
            this.onToast(msg, 'info');
            return;
        }

        const platform = this.settings.platform || (this.isMobileDevice ? 'mobile' : 'pc');
        const pDef = GRAPHICS_PRESETS[platform]?.[presetId];
        if (!pDef) return;

        this.settings = {
            ...this.settings,
            preset: presetId,
            dpr: pDef.dpr,
            antiAliasing: pDef.antiAliasing,
            shadowQuality: pDef.shadowQuality,
            modelSmoothing: pDef.modelSmoothing,
            shaderMode: pDef.shaderMode,
            fpsCap: pDef.fpsCap,
            nametags: pDef.nametags
        };

        this.saveSettings();
        this.dispatchSettingsChange();
        this.renderUIState();
        const pName = i18n ? i18n.t(`preset_${platform}_${presetId}`) : pDef.name;
        const msg = i18n ? i18n.t('toast_preset_applied', { name: pName }) : `Applied graphics preset: ${pDef.name}`;
        this.onToast(msg, 'info');
    }

    setPlatform(platform) {
        if (!['mobile', 'web', 'pc'].includes(platform)) return;
        this.settings.platform = platform;
        if (platform === 'mobile') {
            this.settings.userExplicitMobile = true;
        } else {
            delete this.settings.userExplicitMobile;
        }
        const curPreset = (this.settings.preset && this.settings.preset !== 'custom' && GRAPHICS_PRESETS[platform]?.[this.settings.preset])
            ? this.settings.preset
            : ((platform === 'mobile') ? 'medium' : (platform === 'web' ? 'medium' : 'high'));
        this.applyPreset(curPreset);
    }

    setCustomSetting(key, value) {
        this.settings[key] = value;
        this.settings.preset = 'custom';
        this.saveSettings();
        this.dispatchSettingsChange();
        this.renderUIState();
    }

    setTimeOfDayMode(mode) {
        this.settings.timeOfDayMode = mode;
        this.saveSettings();
        this.applyTimeOfDayMode(mode);
        this.renderUIState();
    }

    applyTimeOfDayMode(mode = this.settings.timeOfDayMode) {
        const todSystem = window.timeOfDaySystem || window.openWorld3D?.worldComposition?.timeOfDay;
        if (!todSystem) return;
        if (!mode || mode === 'auto') {
            todSystem.lockTime(null);
        } else {
            const parts = String(mode).split(':');
            const h = parseFloat(parts[0]) || 0;
            const m = parseFloat(parts[1]) || 0;
            todSystem.lockTime(h + m / 60);
        }
    }

    dispatchSettingsChange() {
        if (this.onApply) {
            this.onApply(this.settings);
        }
        if (window.openWorld3D && typeof window.openWorld3D.applyGraphicsSettings === 'function') {
            window.openWorld3D.applyGraphicsSettings(this.settings);
        }
        this.applyTimeOfDayMode(this.settings.timeOfDayMode);
        window.dispatchEvent(new CustomEvent('teleterm:graphics-changed', { detail: this.settings }));
    }

    resetToDefaults() {
        this.settings = this.getDefaultSettings();
        this.saveSettings();
        if (window.soundSettings) {
            window.soundSettings.setMasterVolume(1.0);
            window.soundSettings.setAmbianceVolume(0.7);
            window.soundSettings.setPlayerSoundsVolume(0.8);
        }
        this.dispatchSettingsChange();
        this.renderUIState();
        const msg = window.TeleTermI18n ? window.TeleTermI18n.t('toast_defaults_restored') : 'Restored default graphics settings!';
        this.onToast(msg, 'info');
    }

    open() {
        if (!this.modalEl) this.modalEl = document.getElementById('modal-graphics-settings');
        if (this.modalEl) {
            this.modalEl.classList.remove('hidden');
            this.renderUIState();
        }
    }

    close() {
        if (this.modalEl) {
            this.modalEl.classList.add('hidden');
        }
    }

    toggle() {
        if (!this.modalEl) this.modalEl = document.getElementById('modal-graphics-settings');
        if (this.modalEl) {
            if (this.modalEl.classList.contains('hidden')) {
                this.open();
            } else {
                this.close();
            }
        }
    }

    bindModalEvents() {
        if (!this.modalEl) return;

        // Close button
        const btnClose = document.getElementById('btn-close-graphics-modal');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.close());
        }

        // Click backdrop to close
        this.modalEl.addEventListener('click', (e) => {
            if (e.target === this.modalEl) this.close();
        });

        // Display Mode Switcher (Fullscreen, Borderless, Window)
        ['fullscreen', 'borderless', 'window'].forEach(mode => {
            const btn = document.getElementById(`gfx-mode-${mode}`);
            if (btn) {
                btn.addEventListener('click', () => this.setDisplayMode(mode));
            }
        });

        // Platform Switcher
        const btnPlatformMobile = document.getElementById('gfx-platform-mobile');
        const btnPlatformWeb = document.getElementById('gfx-platform-web');
        const btnPlatformPc = document.getElementById('gfx-platform-pc');
        if (btnPlatformMobile) {
            btnPlatformMobile.addEventListener('click', () => this.setPlatform('mobile'));
        }
        if (btnPlatformWeb) {
            btnPlatformWeb.addEventListener('click', () => this.setPlatform('web'));
        }
        if (btnPlatformPc) {
            btnPlatformPc.addEventListener('click', () => this.setPlatform('pc'));
        }

        // Top Navigation Telemetry Chip: 1-click open to Graphics modal
        const topGfxChip = document.getElementById('top-gfx-telemetry-chip');
        if (topGfxChip) {
            topGfxChip.addEventListener('click', () => this.openModal());
        }

        // Presets: Low, Medium, High, Max, Custom
        ['low', 'medium', 'high', 'max'].forEach(presetId => {
            const btn = document.getElementById(`gfx-preset-${presetId}`);
            if (btn) {
                btn.addEventListener('click', () => this.applyPreset(presetId));
            }
        });
        const btnCustom = document.getElementById('gfx-preset-custom');
        if (btnCustom) {
            btnCustom.addEventListener('click', () => this.applyPreset('custom'));
        }

        // Custom Toggles & Selects
        const selDpr = document.getElementById('gfx-select-dpr');
        if (selDpr) {
            selDpr.addEventListener('change', (e) => {
                this.setCustomSetting('dpr', parseFloat(e.target.value));
            });
        }

        const chkAa = document.getElementById('gfx-chk-aa');
        if (chkAa) {
            chkAa.addEventListener('change', (e) => {
                this.setCustomSetting('antiAliasing', !!e.target.checked);
            });
        }

        const selSmoothing = document.getElementById('gfx-select-smoothing');
        if (selSmoothing) {
            selSmoothing.addEventListener('change', (e) => {
                this.setCustomSetting('modelSmoothing', e.target.value);
            });
        }

        const selShadow = document.getElementById('gfx-select-shadow');
        if (selShadow) {
            selShadow.addEventListener('change', (e) => {
                this.setCustomSetting('shadowQuality', e.target.value);
            });
        }

        const selShader = document.getElementById('gfx-select-shader');
        if (selShader) {
            selShader.addEventListener('change', (e) => {
                this.setCustomSetting('shaderMode', e.target.value);
            });
        }

        const selFps = document.getElementById('gfx-select-fps');
        if (selFps) {
            selFps.addEventListener('change', (e) => {
                this.setCustomSetting('fpsCap', parseInt(e.target.value, 10));
            });
        }

        const selNametags = document.getElementById('gfx-select-nametags');
        if (selNametags) {
            selNametags.addEventListener('change', (e) => {
                this.setCustomSetting('nametags', e.target.value);
            });
        }

        const selTod = document.getElementById('gfx-select-time-of-day');
        if (selTod) {
            selTod.addEventListener('change', (e) => {
                this.setTimeOfDayMode(e.target.value);
            });
        }

        // Language Select
        const selLang = document.getElementById('gfx-language-select');
        if (selLang) {
            if (window.TeleTermI18n) {
                selLang.value = window.TeleTermI18n.getLanguage();
            }
            selLang.addEventListener('change', (e) => {
                if (window.TeleTermI18n) {
                    window.TeleTermI18n.setLanguage(e.target.value);
                    const toastMsg = e.target.value === 'vi' ? 'Đã đổi ngôn ngữ sang Tiếng Việt' : 'Language set to English';
                    this.onToast(toastMsg, 'info');
                }
            });
        }

        // Live react to language change events
        window.addEventListener('teleterm-language-changed', () => {
            this.renderUIState();
        });

        // Reset button
        const btnReset = document.getElementById('btn-reset-graphics-settings');
        if (btnReset) {
            btnReset.addEventListener('click', () => this.resetToDefaults());
        }

        // Done button
        const btnDone = document.getElementById('btn-done-graphics-settings');
        if (btnDone) {
            btnDone.addEventListener('click', () => {
                this.close();
                const msg = window.TeleTermI18n ? window.TeleTermI18n.t('toast_settings_applied') : 'Graphics settings applied!';
                this.onToast(msg, 'success');
            });
        }

        // Sound Sliders (Feature Group C)
        const sliderMaster = document.getElementById('slider-sound-master');
        const sliderAmbiance = document.getElementById('slider-sound-ambiance');
        const sliderPlayers = document.getElementById('slider-sound-players');

        const valMaster = document.getElementById('val-sound-master');
        const valAmbiance = document.getElementById('val-sound-ambiance');
        const valPlayers = document.getElementById('val-sound-players');

        if (sliderMaster) {
            sliderMaster.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (valMaster) valMaster.textContent = `${Math.round(val * 100)}%`;
                if (window.soundSettings) window.soundSettings.setMasterVolume(val);
            });
        }
        if (sliderAmbiance) {
            sliderAmbiance.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (valAmbiance) valAmbiance.textContent = `${Math.round(val * 100)}%`;
                if (window.soundSettings) window.soundSettings.setAmbianceVolume(val);
            });
        }
        if (sliderPlayers) {
            sliderPlayers.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (valPlayers) valPlayers.textContent = `${Math.round(val * 100)}%`;
                if (window.soundSettings) window.soundSettings.setPlayerSoundsVolume(val);
            });
        }

        // Live react to soundSettings external updates
        if (window.soundSettings) {
            window.soundSettings.addListener(() => {
                this.renderUIState();
            });
        }
    }

    renderUIState() {
        const s = this.settings;
        const i18n = window.TeleTermI18n;

        // Display Mode buttons (fullscreen, borderless, window)
        ['fullscreen', 'borderless', 'window'].forEach(mode => {
            const btn = document.getElementById(`gfx-mode-${mode}`);
            if (btn) {
                btn.classList.toggle('active', (s.displayMode || 'borderless') === mode);
            }
        });

        // Platform buttons
        const btnMobile = document.getElementById('gfx-platform-mobile');
        const btnWeb = document.getElementById('gfx-platform-web');
        const btnPc = document.getElementById('gfx-platform-pc');
        if (btnMobile) btnMobile.classList.toggle('active', s.platform === 'mobile');
        if (btnWeb) btnWeb.classList.toggle('active', s.platform === 'web');
        if (btnPc) btnPc.classList.toggle('active', s.platform === 'pc');

        // Presets buttons
        ['low', 'medium', 'high', 'max'].forEach(presetId => {
            const btn = document.getElementById(`gfx-preset-${presetId}`);
            if (btn) {
                btn.classList.toggle('active', s.preset === presetId);
            }
        });
        const btnCustom = document.getElementById('gfx-preset-custom');
        if (btnCustom) {
            btnCustom.classList.toggle('active', s.preset === 'custom');
        }

        // Thermal / Status Banner
        const statusBanner = document.getElementById('gfx-status-banner');
        if (statusBanner) {
            const platformIcon = s.platform === 'mobile'
                ? (window.TeleTermIcons ? window.TeleTermIcons.render('smartphone', { size: 14 }) : '')
                : (window.TeleTermIcons ? window.TeleTermIcons.render('monitor', { size: 14 }) : '');
            const platformLabel = s.platform === 'mobile'
                ? (i18n ? i18n.t('gfx_profile_mobile') : 'Mobile Graphics')
                : (i18n ? i18n.t('gfx_profile_pc') : 'PC Desktop Graphics');
            const badgeKey = `preset_${s.platform}_${s.preset}_badge`;
            let badgeText = (i18n && s.preset !== 'custom') ? i18n.t(badgeKey) : (GRAPHICS_PRESETS[s.platform]?.[s.preset]?.badge || 'Custom Specs');
            if (s.preset === 'custom') {
                badgeText = i18n ? i18n.t('preset_custom') : 'Custom Specs';
            }
            
            let thermalClass = 'status-cool';
            if (s.shaderMode === 'enhanced' && s.dpr >= 1.25) {
                thermalClass = 'status-warm';
            }
            if (s.dpr >= 1.5 && s.shadowQuality === '2048') {
                thermalClass = 'status-hot';
            }

            statusBanner.className = `gfx-status-strip ${thermalClass}`;
            statusBanner.innerHTML = `
                <div class="gfx-status-head">
                    <span class="gfx-platform-pill">${platformIcon} <span>${platformLabel}</span></span>
                    <span class="gfx-preset-pill">${s.preset.toUpperCase()}</span>
                </div>
                <div class="gfx-status-desc">${badgeText}</div>
            `;
            if (window.TeleTermIcons) {
                window.TeleTermIcons.hydrate(statusBanner);
            }
        }

        // Language Select sync
        const selLang = document.getElementById('gfx-language-select');
        if (selLang && i18n) {
            selLang.value = i18n.getLanguage();
        }

        // Form controls
        const selDpr = document.getElementById('gfx-select-dpr');
        if (selDpr) selDpr.value = String(s.dpr);

        const chkAa = document.getElementById('gfx-chk-aa');
        if (chkAa) chkAa.checked = !!s.antiAliasing;

        const selSmoothing = document.getElementById('gfx-select-smoothing');
        if (selSmoothing) selSmoothing.value = s.modelSmoothing || 'standard';

        const selShadow = document.getElementById('gfx-select-shadow');
        if (selShadow) selShadow.value = s.shadowQuality || '512';

        const selShader = document.getElementById('gfx-select-shader');
        if (selShader) selShader.value = s.shaderMode || 'vanilla';

        const selFps = document.getElementById('gfx-select-fps');
        if (selFps) selFps.value = String(s.fpsCap !== undefined ? s.fpsCap : 60);

        const selNametags = document.getElementById('gfx-select-nametags');
        if (selNametags) selNametags.value = s.nametags || 'focus';

        const selTod = document.getElementById('gfx-select-time-of-day');
        if (selTod) selTod.value = s.timeOfDayMode || 'auto';

        const badgeTod = document.getElementById('gfx-tod-current-time');
        const todSystem = window.timeOfDaySystem || window.openWorld3D?.worldComposition?.timeOfDay;
        if (badgeTod && todSystem) {
            const formattedTime = typeof todSystem.getFormattedTime === 'function' ? todSystem.getFormattedTime() : (typeof todSystem.getTime === 'function' ? `${Math.floor(todSystem.getTime())}:00` : '17:30');
            badgeTod.textContent = (s.timeOfDayMode === 'auto' || !s.timeOfDayMode)
                ? `Cycle: ${formattedTime}`
                : `Locked: ${s.timeOfDayMode}`;
        }

        // Update Sound Sliders (Feature Group C)
        if (window.soundSettings) {
            const mv = window.soundSettings.getMasterVolume();
            const av = window.soundSettings.getAmbianceVolume();
            const pv = window.soundSettings.getPlayerSoundsVolume();

            const sliderMaster = document.getElementById('slider-sound-master');
            const sliderAmbiance = document.getElementById('slider-sound-ambiance');
            const sliderPlayers = document.getElementById('slider-sound-players');
            const valMaster = document.getElementById('val-sound-master');
            const valAmbiance = document.getElementById('val-sound-ambiance');
            const valPlayers = document.getElementById('val-sound-players');

            if (sliderMaster) sliderMaster.value = mv;
            if (sliderAmbiance) sliderAmbiance.value = av;
            if (sliderPlayers) sliderPlayers.value = pv;

            if (valMaster) valMaster.textContent = `${Math.round(mv * 100)}%`;
            if (valAmbiance) valAmbiance.textContent = `${Math.round(av * 100)}%`;
            if (valPlayers) valPlayers.textContent = `${Math.round(pv * 100)}%`;
        }
    }
}
