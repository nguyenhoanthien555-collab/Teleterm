/**
 * AMBIENT WORLD AUDIO SYNTHESIZER
 * Implements Section 38 of TeleTerm Living Open World Master Spec v3.
 * Pure Web Audio API procedural environmental sound generator:
 * - Wind rustle & gentle pastoral breeze
 * - Running freshwater stream & river babble
 * - Coastal ocean surf swells
 * - Daytime forest songbird warbles
 * - Evening cicadas & night cricket pulses
 * Zero external mp3 dependencies, 0ms loading lag, responsive to player's current region.
 */

import { soundSettings } from './sound-settings-manager.js';

export class AmbientWorldAudioSystem {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.windGain = null;
        this.waterGain = null;
        this.oceanGain = null;
        this.birdsGain = null;
        this.cricketsGain = null;

        this.volumeLevel = 0.16; // gentle subtle ambient bed
        this.isInitialized = false;
        this.currentRegionId = 'developer_hub';
        this.timeOfDay = 17.5;

        soundSettings.addListener(() => {
            this.syncMasterVolume();
        });

        this.initContextOnInteraction();
    }

    syncMasterVolume() {
        if (!this.ctx || !this.masterGain) return;
        const targetVol = this.volumeLevel * soundSettings.getEffectiveAmbianceVolume();
        this.masterGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
    }

    initContextOnInteraction() {
        const unlock = () => {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                    this.setupAudioGraph();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        };

        window.addEventListener('keydown', unlock, { once: true, passive: true });
        window.addEventListener('mousedown', unlock, { once: true, passive: true });
        window.addEventListener('touchstart', unlock, { once: true, passive: true });
    }

    setupAudioGraph() {
        if (this.isInitialized || !this.ctx) return;
        this.isInitialized = true;
        const ctx = this.ctx;

        this.masterGain = ctx.createGain();
        const initialVol = this.volumeLevel * soundSettings.getEffectiveAmbianceVolume();
        this.masterGain.gain.setValueAtTime(initialVol, ctx.currentTime);
        this.masterGain.connect(ctx.destination);

        // Continuous lowpass noise drone nodes (windNoise, waterNoise, oceanNoise) eliminated
        // per user directive to completely eradicate the annoying 'ù ù ù' low-frequency humming noise.
        this.windGain = ctx.createGain();
        this.windGain.gain.setValueAtTime(0.0, ctx.currentTime);
        this.waterGain = ctx.createGain();
        this.waterGain.gain.setValueAtTime(0.0, ctx.currentTime);
        this.oceanGain = ctx.createGain();
        this.oceanGain.gain.setValueAtTime(0.0, ctx.currentTime);

        // 4. Procedural Bird Chirps Scheduler (Triggered during daytime in groves/forests)
        this.birdsGain = ctx.createGain();
        this.birdsGain.gain.setValueAtTime(0.05, ctx.currentTime);
        this.birdsGain.connect(this.masterGain);
        this.schedulePeriodicBirdWarble();

        // 5. Evening Crickets / Cicadas Generator
        this.cricketsGain = ctx.createGain();
        this.cricketsGain.gain.setValueAtTime(0.08, ctx.currentTime);
        this.cricketsGain.connect(this.masterGain);
        this.startCricketPulses();

        // 6. Zen Shishi-odoshi Bamboo Rocker Clack Scheduler
        this.startShishiOdoshiScheduler();
    }

    startShishiOdoshiScheduler() {
        setInterval(() => {
            if (!this.ctx || this.ctx.state !== 'running') return;
            if (this.currentRegionId === 'bamboo_forest') {
                this.synthesizeBambooClack();
            }
        }, 6500);
    }

    synthesizeBambooClack() {
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;

        // Resonant hollow wood body
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.18);

        // Sharp stone strike transient click
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(950, now);
        clickOsc.frequency.exponentialRampToValueAtTime(320, now + 0.03);

        clickGain.gain.setValueAtTime(0.18, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        clickOsc.connect(clickGain);
        clickGain.connect(this.masterGain);
        clickOsc.start(now);
        clickOsc.stop(now + 0.04);
    }

    createNoiseNode(ctx, loopDuration = 3.0) {
        const bufferSize = Math.floor(ctx.sampleRate * loopDuration);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        // Pink-ish noise filter
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            lastOut = (lastOut * 0.95) + (white * 0.05);
            data[i] = lastOut * 3.5;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        return source;
    }

    schedulePeriodicWindGust() {
        const scheduleNext = () => {
            // Natural cooldown between gusts: 18s to 35s (Section 32)
            const delay = 18000 + Math.random() * 17000;
            setTimeout(() => {
                if (this.ctx && this.windGain && this.ctx.state === 'running') {
                    const now = this.ctx.currentTime;
                    const gustDuration = 5.0 + Math.random() * 4.0;
                    const peakGain = 0.022 + Math.random() * 0.016; // Soft intermittent gust

                    this.windGain.gain.cancelScheduledValues(now);
                    this.windGain.gain.setValueAtTime(0.008, now);
                    this.windGain.gain.linearRampToValueAtTime(peakGain, now + gustDuration * 0.4);
                    this.windGain.gain.linearRampToValueAtTime(0.008, now + gustDuration);
                }
                scheduleNext();
            }, delay);
        };
        scheduleNext();
    }

    schedulePeriodicBirdWarble() {
        const scheduleNext = () => {
            const delay = 3500 + Math.random() * 6000;
            setTimeout(() => {
                if (this.ctx && this.birdsGain && (this.timeOfDay > 5.5 && this.timeOfDay < 18.0)) {
                    this.synthesizeBirdWarble();
                }
                scheduleNext();
            }, delay);
        };
        scheduleNext();
    }

    synthesizeBirdWarble() {
        if (!this.ctx || this.ctx.state !== 'running') return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        // Sweet high frequency chirping trill
        const baseF = 2600 + Math.random() * 800;
        osc.frequency.setValueAtTime(baseF, now);
        osc.frequency.linearRampToValueAtTime(baseF + 600, now + 0.06);
        osc.frequency.linearRampToValueAtTime(baseF - 300, now + 0.12);
        osc.frequency.linearRampToValueAtTime(baseF + 400, now + 0.18);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.birdsGain);
        osc.start(now);
        osc.stop(now + 0.24);
    }

    startCricketPulses() {
        setInterval(() => {
            if (!this.ctx || this.ctx.state !== 'running') return;
            const isNight = this.timeOfDay > 18.0 || this.timeOfDay < 6.0;
            if (!isNight) return;

            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(4500, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.03, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc.connect(gain);
            gain.connect(this.cricketsGain);
            osc.start(now);
            osc.stop(now + 0.09);
        }, 180);
    }

    updateRegionAndEnvironment(regionId, timeOfDay) {
        this.currentRegionId = regionId;
        this.timeOfDay = timeOfDay;
        if (!this.ctx || !this.isInitialized) return;

        const now = this.ctx.currentTime;
        const t = timeOfDay;
        const isNight = t > 18.5 || t < 5.5;

        // Dynamic audio levels based on region
        let targetWater = 0.06;
        let targetOcean = 0.0;
        let targetBirds = isNight ? 0.0 : 0.12;
        let targetCrickets = isNight ? 0.09 : 0.0;

        if (regionId === 'river_valley') {
            targetWater = 0.28;
        } else if (regionId === 'rice_country') {
            targetWater = 0.14;
        } else if (regionId === 'coastal_beach') {
            targetOcean = 0.32;
            targetWater = 0.02;
        } else if (regionId === 'bamboo_forest') {
            targetWater = 0.09;
            targetBirds = isNight ? 0.0 : 0.18;
        } else if (regionId === 'maple_valley') {
            targetWater = 0.20; // babbling mountain stream
            targetBirds = isNight ? 0.0 : 0.24;
        } else if (regionId === 'alpine_pines' || regionId === 'hill_overlook') {
            targetWater = 0.0;
            targetBirds = isNight ? 0.0 : 0.08;
        } else if (regionId === 'cherry_grove' || regionId === 'deep_forest') {
            targetBirds = isNight ? 0.0 : 0.22;
        }

        this.waterGain?.gain.setTargetAtTime(targetWater, now, 1.5);
        this.oceanGain?.gain.setTargetAtTime(targetOcean, now, 1.5);
        this.birdsGain?.gain.setTargetAtTime(targetBirds, now, 1.5);
        this.cricketsGain?.gain.setTargetAtTime(targetCrickets, now, 1.5);
    }
}
