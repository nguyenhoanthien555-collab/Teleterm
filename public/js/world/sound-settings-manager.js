/**
 * TELETERM 3D — SOUND SETTINGS MANAGER
 * Implements Feature Group C (Sections 27, 28, 29, 30, 31, 34, 64)
 * Provides centralized volume scaling:
 * finalVolume = masterVolume × categoryVolume × soundVolume
 * Persistent via localStorage, applies immediately to all audio categories.
 */

export class SoundSettingsManager {
    constructor() {
        this.masterVolume = 1.0;
        this.ambianceVolume = 0.7;
        this.playerSoundsVolume = 0.8;

        this.listeners = new Set();
        this.loadSettings();
    }

    loadSettings() {
        try {
            const raw = localStorage.getItem('teleterm_sound_settings');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed.masterVolume === 'number') this.masterVolume = Math.max(0, Math.min(1, parsed.masterVolume));
                if (typeof parsed.ambianceVolume === 'number') this.ambianceVolume = Math.max(0, Math.min(1, parsed.ambianceVolume));
                if (typeof parsed.playerSoundsVolume === 'number') this.playerSoundsVolume = Math.max(0, Math.min(1, parsed.playerSoundsVolume));
            }
        } catch (e) {}
    }

    saveSettings() {
        try {
            localStorage.setItem('teleterm_sound_settings', JSON.stringify({
                masterVolume: this.masterVolume,
                ambianceVolume: this.ambianceVolume,
                playerSoundsVolume: this.playerSoundsVolume
            }));
        } catch (e) {}
        this.notifyListeners();
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, Number(val)));
        this.saveSettings();
    }

    setAmbianceVolume(val) {
        this.ambianceVolume = Math.max(0, Math.min(1, Number(val)));
        this.saveSettings();
    }

    setPlayerSoundsVolume(val) {
        this.playerSoundsVolume = Math.max(0, Math.min(1, Number(val)));
        this.saveSettings();
    }

    getMasterVolume() {
        return this.masterVolume;
    }

    getAmbianceVolume() {
        return this.ambianceVolume;
    }

    getPlayerSoundsVolume() {
        return this.playerSoundsVolume;
    }

    /**
     * Compute effective scale for environmental ambience
     */
    getEffectiveAmbianceVolume() {
        return this.masterVolume * this.ambianceVolume;
    }

    /**
     * Compute effective scale for player-generated action sounds
     */
    getEffectivePlayerSoundsVolume() {
        return this.masterVolume * this.playerSoundsVolume;
    }

    /**
     * Compute effective scale by category name ('ambiance', 'player', 'master')
     */
    getEffectiveVolume(category = 'master') {
        const cat = String(category).toLowerCase();
        if (cat === 'ambiance') {
            return this.getEffectiveAmbianceVolume();
        }
        if (cat === 'player' || cat === 'players' || cat === 'player_sounds') {
            return this.getEffectivePlayerSoundsVolume();
        }
        return this.masterVolume;
    }

    /**
     * Reset volume values back to default profile
     */
    restoreDefaults() {
        this.masterVolume = 1.0;
        this.ambianceVolume = 0.7;
        this.playerSoundsVolume = 0.8;
        this.saveSettings();
    }

    addListener(fn) {
        if (typeof fn === 'function') this.listeners.add(fn);
    }

    removeListener(fn) {
        this.listeners.delete(fn);
    }

    notifyListeners() {
        for (const fn of this.listeners) {
            try { fn(this); } catch (e) {}
        }
    }
}

export const soundSettings = new SoundSettingsManager();
if (typeof window !== 'undefined') {
    window.soundSettings = soundSettings;
}
