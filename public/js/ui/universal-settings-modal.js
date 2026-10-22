/**
 * TELETERM UNIVERSAL SETTINGS DASHBOARD & EVENT BUS
 * Schema-driven, reactive zero-reload architecture with 5 distinct categories:
 * 1. Graphics (Đồ họa)
 * 2. Audio (Âm thanh)
 * 3. Controls & Camera (Điều khiển & Camera)
 * 4. Game & World (Giao diện & Thế giới)
 * 5. System & Network (Mạng & Hệ thống)
 */

export const DEFAULT_UNIVERSAL_SETTINGS = {
    graphics: {
        platform: 'pc',
        preset: 'high',
        displayMode: 'borderless',
        dpr: 1.25,
        antiAliasing: true,
        shadowQuality: '1024',
        modelSmoothing: 'high',
        shaderMode: 'vanilla',
        fpsCap: 60,
        renderDistance: 180
    },
    audio: {
        masterVolume: 1.0,
        bgmVolume: 0.6,
        ambienceVolume: 0.7,
        playerSoundsVolume: 0.8,
        spatialAudio: true
    },
    controls: {
        mouseSensitivity: 0.005,
        invertY: false,
        cameraFov: 75,
        cameraDistance: 4.2,
        keybinds: {
            forward: 'KeyW',
            backward: 'KeyS',
            left: 'KeyA',
            right: 'KeyD',
            jump: 'Space',
            interact: 'KeyE',
            minimap: 'KeyM',
            photoMode: 'KeyP',
            terminal: 'Backquote'
        }
    },
    gameui: {
        language: 'en',
        theme: 'dark',
        timeOfDay: 'auto',
        showMinimap: true,
        nametags: 'focus',
        inworldHolograms: true
    },
    system: {
        showTelemetry: true,
        autoSaveInterval: 5,
        telemetryLogging: false
    }
};

const STORAGE_KEY = 'teleterm_universal_settings';

export class UniversalSettingsStore {
    constructor() {
        this.state = this.loadSettings();
    }

    loadSettings() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return structuredClone(DEFAULT_UNIVERSAL_SETTINGS);
            const parsed = JSON.parse(raw);
            return {
                graphics: { ...DEFAULT_UNIVERSAL_SETTINGS.graphics, ...(parsed.graphics || {}) },
                audio: { ...DEFAULT_UNIVERSAL_SETTINGS.audio, ...(parsed.audio || {}) },
                controls: {
                    ...DEFAULT_UNIVERSAL_SETTINGS.controls,
                    ...(parsed.controls || {}),
                    keybinds: { ...DEFAULT_UNIVERSAL_SETTINGS.controls.keybinds, ...(parsed.controls?.keybinds || {}) }
                },
                gameui: { ...DEFAULT_UNIVERSAL_SETTINGS.gameui, ...(parsed.gameui || {}) },
                system: { ...DEFAULT_UNIVERSAL_SETTINGS.system, ...(parsed.system || {}) }
            };
        } catch (err) {
            console.warn('[UniversalSettingsStore] Failed to load localStorage settings, fallback to defaults:', err);
            return structuredClone(DEFAULT_UNIVERSAL_SETTINGS);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        } catch (err) {
            console.error('[UniversalSettingsStore] Failed to save settings to localStorage:', err);
        }
    }

    get(category, key) {
        return this.state[category]?.[key];
    }

    set(category, key, value) {
        if (!this.state[category]) this.state[category] = {};
        this.state[category][key] = value;
        this.saveSettings();
        this.dispatch(category, key, value);
    }

    setBatch(category, patch) {
        if (!this.state[category]) this.state[category] = {};
        Object.assign(this.state[category], patch);
        this.saveSettings();
        for (const [key, value] of Object.entries(patch)) {
            this.dispatch(category, key, value);
        }
    }

    resetDefaults() {
        this.state = structuredClone(DEFAULT_UNIVERSAL_SETTINGS);
        this.saveSettings();
        window.dispatchEvent(new CustomEvent('teleterm:settings-reset', { detail: this.state }));
    }

    dispatch(category, key, value) {
        window.dispatchEvent(new CustomEvent('teleterm:setting-changed', {
            detail: { category, key, value, fullState: this.state }
        }));
    }
}

export const settingsStore = new UniversalSettingsStore();

/**
 * Universal Settings Modal UI Controller
 */
export class UniversalSettingsModal {
    constructor() {
        this.store = settingsStore;
        this.modalEl = null;
        this.activeTab = 'graphics';
        this.previousPointerLock = null;
        this.isInitialized = false;
        this.listeningKeybindAction = null;
    }

    init() {
        if (this.isInitialized) return;
        this.modalEl = document.getElementById('modal-graphics-settings');
        if (!this.modalEl) return;

        this.bindTabNavigation();
        this.bindControlsEvents();
        this.bindGameUIEvents();
        this.bindSystemEvents();
        this.bindCloseAndReset();
        this.syncUIFromStore();
        this.listenExternalEvents();

        this.isInitialized = true;
    }

    bindTabNavigation() {
        const tabs = this.modalEl.querySelectorAll('.settings-tab-btn');
        tabs.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    switchTab(tabId) {
        if (!tabId || !this.modalEl) return;
        this.activeTab = tabId;

        // Toggle Tab Buttons
        const tabBtns = this.modalEl.querySelectorAll('.settings-tab-btn');
        tabBtns.forEach((b) => {
            const isActive = b.dataset.tab === tabId;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Toggle Panels
        const panels = this.modalEl.querySelectorAll('.settings-panel');
        panels.forEach((p) => {
            const isActive = p.dataset.panel === tabId;
            p.classList.toggle('active', isActive);
            if (isActive) {
                p.removeAttribute('hidden');
            } else {
                p.setAttribute('hidden', '');
            }
        });
    }

    bindControlsEvents() {
        // 1. Mouse Sensitivity
        const sliderSens = document.getElementById('slider-mouse-sensitivity');
        const valSens = document.getElementById('val-mouse-sensitivity');
        if (sliderSens) {
            sliderSens.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (valSens) valSens.textContent = val.toFixed(4);
                this.store.set('controls', 'mouseSensitivity', val);
            });
        }

        // 2. Invert Y
        const chkInvertY = document.getElementById('chk-invert-y');
        if (chkInvertY) {
            chkInvertY.addEventListener('change', (e) => {
                this.store.set('controls', 'invertY', e.target.checked);
            });
        }

        // 3. Camera FOV
        const sliderFov = document.getElementById('slider-camera-fov');
        const valFov = document.getElementById('val-camera-fov');
        if (sliderFov) {
            sliderFov.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10);
                if (valFov) valFov.textContent = `${val}°`;
                this.store.set('controls', 'cameraFov', val);
            });
        }

        // 4. Camera Distance
        const sliderDist = document.getElementById('slider-camera-distance');
        const valDist = document.getElementById('val-camera-distance');
        if (sliderDist) {
            sliderDist.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (valDist) valDist.textContent = `${val.toFixed(1)}m`;
                this.store.set('controls', 'cameraDistance', val);
            });
        }

        // 5. Keybind buttons
        const keybindBtns = this.modalEl.querySelectorAll('.keybind-action-btn');
        keybindBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.startKeybindCapture(btn);
            });
        });

        window.addEventListener('keydown', (e) => {
            if (this.listeningKeybindAction) {
                e.preventDefault();
                e.stopPropagation();
                const action = this.listeningKeybindAction;
                const code = e.code;
                this.listeningKeybindAction = null;

                const keybinds = { ...this.store.get('controls', 'keybinds'), [action]: code };
                this.store.set('controls', 'keybinds', keybinds);
                this.syncUIFromStore();
                return;
            }

            // Esc to close settings if open
            if (e.key === 'Escape' && this.isOpen()) {
                e.preventDefault();
                this.close();
            }
        }, true);
    }

    startKeybindCapture(btn) {
        const action = btn.dataset.action;
        this.listeningKeybindAction = action;
        btn.classList.add('capturing');
        btn.textContent = 'PRESS KEY...';
    }

    bindGameUIEvents() {
        // Minimap Radar Toggle
        const chkMinimap = document.getElementById('chk-game-minimap');
        if (chkMinimap) {
            chkMinimap.addEventListener('change', (e) => {
                this.store.set('gameui', 'showMinimap', e.target.checked);
            });
        }

        // In-World 3D Holograms Toggle
        const chkHolo = document.getElementById('chk-game-inworld-holograms');
        if (chkHolo) {
            chkHolo.addEventListener('change', (e) => {
                this.store.set('gameui', 'inworldHolograms', e.target.checked);
            });
        }

        // Spatial Audio Toggle
        const chkSpatial = document.getElementById('chk-sound-spatial');
        if (chkSpatial) {
            chkSpatial.addEventListener('change', (e) => {
                this.store.set('audio', 'spatialAudio', e.target.checked);
            });
        }

        // LoFi / BGM Volume Slider
        const sliderBgm = document.getElementById('slider-sound-bgm');
        const valBgm = document.getElementById('val-sound-bgm');
        if (sliderBgm) {
            sliderBgm.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                if (valBgm) valBgm.textContent = `${Math.round(val * 100)}%`;
                this.store.set('audio', 'bgmVolume', val);
            });
        }
    }

    bindSystemEvents() {
        // Telemetry Overlay Toggle
        const chkTelemetry = document.getElementById('chk-sys-telemetry');
        if (chkTelemetry) {
            chkTelemetry.addEventListener('change', (e) => {
                this.store.set('system', 'showTelemetry', e.target.checked);
            });
        }

        // Clear Cache Button
        const btnClearCache = document.getElementById('btn-sys-clearcache');
        if (btnClearCache) {
            btnClearCache.addEventListener('click', () => {
                if (confirm('Clear local cache and temporary game session data? (Settings will be preserved)')) {
                    sessionStorage.clear();
                    const i18n = window.TeleTermI18n;
                    const msg = i18n ? i18n.t('toast_cache_cleared') : 'Local cache cleared successfully!';
                    if (window.graphicsManager?.onToast) {
                        window.graphicsManager.onToast(msg, 'success');
                    }
                }
            });
        }

        // Periodic Ping update
        setInterval(() => this.updatePingTelemetry(), 4000);
    }

    updatePingTelemetry() {
        const pingEl = document.getElementById('sys-ping-latency');
        if (!pingEl) return;
        if (window.teletermNetwork?.ping !== undefined) {
            pingEl.textContent = `${Math.round(window.teletermNetwork.ping)} ms`;
        } else {
            // Local simulation ping
            pingEl.textContent = `${Math.floor(8 + Math.random() * 6)} ms`;
        }
    }

    bindCloseAndReset() {
        // Reset button
        const btnReset = document.getElementById('btn-reset-graphics-settings');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                this.store.resetDefaults();
                this.syncUIFromStore();
            });
        }

        // Close / Done button
        const btnDone = document.getElementById('btn-done-graphics-settings');
        if (btnDone) {
            btnDone.addEventListener('click', () => this.close());
        }

        const btnClose = document.getElementById('btn-close-graphics-modal');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.close());
        }

        // Isolate keyboard and pointer events inside modal so game doesn't receive them
        if (this.modalEl) {
            ['mousedown', 'mouseup', 'click', 'wheel', 'contextmenu'].forEach((evt) => {
                this.modalEl.addEventListener(evt, (e) => {
                    e.stopPropagation();
                });
            });
        }
    }

    syncUIFromStore() {
        const state = this.store.state;

        // Controls
        const sliderSens = document.getElementById('slider-mouse-sensitivity');
        const valSens = document.getElementById('val-mouse-sensitivity');
        if (sliderSens) {
            sliderSens.value = state.controls.mouseSensitivity;
            if (valSens) valSens.textContent = state.controls.mouseSensitivity.toFixed(4);
        }

        const chkInvertY = document.getElementById('chk-invert-y');
        if (chkInvertY) chkInvertY.checked = Boolean(state.controls.invertY);

        const sliderFov = document.getElementById('slider-camera-fov');
        const valFov = document.getElementById('val-camera-fov');
        if (sliderFov) {
            sliderFov.value = state.controls.cameraFov;
            if (valFov) valFov.textContent = `${state.controls.cameraFov}°`;
        }

        const sliderDist = document.getElementById('slider-camera-distance');
        const valDist = document.getElementById('val-camera-distance');
        if (sliderDist) {
            sliderDist.value = state.controls.cameraDistance;
            if (valDist) valDist.textContent = `${state.controls.cameraDistance.toFixed(1)}m`;
        }

        // Keybind buttons
        if (this.modalEl) {
            const keybindBtns = this.modalEl.querySelectorAll('.keybind-action-btn');
            keybindBtns.forEach((btn) => {
                const action = btn.dataset.action;
                const code = state.controls.keybinds?.[action] || '';
                btn.classList.remove('capturing');
                btn.textContent = code.replace('Key', '').replace('Digit', '') || 'NONE';
            });
        }

        // Audio
        const sliderBgm = document.getElementById('slider-sound-bgm');
        const valBgm = document.getElementById('val-sound-bgm');
        if (sliderBgm) {
            sliderBgm.value = state.audio.bgmVolume;
            if (valBgm) valBgm.textContent = `${Math.round(state.audio.bgmVolume * 100)}%`;
        }

        const chkSpatial = document.getElementById('chk-sound-spatial');
        if (chkSpatial) chkSpatial.checked = Boolean(state.audio.spatialAudio);

        // Game UI
        const chkMinimap = document.getElementById('chk-game-minimap');
        if (chkMinimap) chkMinimap.checked = Boolean(state.gameui.showMinimap);

        const chkHolo = document.getElementById('chk-game-inworld-holograms');
        if (chkHolo) chkHolo.checked = Boolean(state.gameui.inworldHolograms);

        // System
        const chkTelemetry = document.getElementById('chk-sys-telemetry');
        if (chkTelemetry) chkTelemetry.checked = Boolean(state.system.showTelemetry);
    }

    listenExternalEvents() {
        // Listen to settings reset
        window.addEventListener('teleterm:settings-reset', () => {
            this.syncUIFromStore();
        });
    }

    isOpen() {
        return this.modalEl && !this.modalEl.classList.contains('hidden');
    }

    open(initialTab = null) {
        if (!this.modalEl) this.modalEl = document.getElementById('modal-graphics-settings');
        if (!this.modalEl) return;

        // Release pointerlock safely
        if (document.pointerLockElement) {
            this.previousPointerLock = document.pointerLockElement;
            document.exitPointerLock();
        }

        if (initialTab) {
            this.switchTab(initialTab);
        }

        this.syncUIFromStore();
        if (typeof window !== 'undefined' && window.TeleTermIcons) {
            window.TeleTermIcons.hydrate(this.modalEl);
        }
        this.modalEl.classList.remove('hidden');
    }

    close() {
        if (!this.modalEl) return;
        this.modalEl.classList.add('hidden');

        // Restore pointerlock if needed
        if (this.previousPointerLock && this.previousPointerLock.requestPointerLock) {
            this.previousPointerLock.requestPointerLock();
            this.previousPointerLock = null;
        }
    }

    toggle() {
        if (this.isOpen()) {
            this.close();
        } else {
            this.open();
        }
    }
}

export const universalSettingsModal = new UniversalSettingsModal();

// Auto-wire to window for global access
if (typeof window !== 'undefined') {
    window.universalSettingsModal = universalSettingsModal;
    window.universalSettingsStore = settingsStore;
}
