import { SurfaceRegistry } from './surface-registry.js?v=30';
import { soundSettings } from './sound-settings-manager.js';

/**
 * FOOTSTEP AUDIO SYSTEM — SURFACE-AWARE PROCEDURAL WEB AUDIO SYNTHESIZER
 * Implements Section 33, 34, 35, and 36 of TeleTerm Living Open World Master Spec v3.
 * Pure Web Audio API synthesis with 0 network latency, dynamic surface response,
 * cadence control, contact cooldowns, and biological pitch variations.
 */
export class FootstepAudioSystem {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.lastStepTime = 0;
        this.stepIndex = 0;
        this.enabled = true;

        // Subtle ambient volume budget (blends comfortably with LoFi and nature)
        this.volumeLevel = 0.24;

        soundSettings.addListener(() => {
            this.syncMasterVolume();
        });

        this.initAudioContext();
    }

    syncMasterVolume() {
        if (!this.ctx || !this.masterGain) return;
        const targetVol = this.volumeLevel * soundSettings.getEffectivePlayerSoundsVolume();
        this.masterGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
    }

    initAudioContext() {
        const unlock = () => {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                    this.masterGain = this.ctx.createGain();
                    const initialVol = this.volumeLevel * soundSettings.getEffectivePlayerSoundsVolume();
                    this.masterGain.gain.setValueAtTime(initialVol, this.ctx.currentTime);
                    this.masterGain.connect(this.ctx.destination);
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        };

        window.addEventListener('keydown', unlock, { once: true, passive: true });
        window.addEventListener('mousedown', unlock, { once: true, passive: true });
        window.addEventListener('touchstart', unlock, { once: true, passive: true });
        window.addEventListener('click', unlock, { once: true, passive: true });
    }

    ensureContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(this.volumeLevel, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    }

    /**
     * Trigger a step sound on foot plant
     * @param {string|Object} surface - Surface ID or SurfaceRegistry object
     * @param {boolean} isRunning - true for sprint, false for walk
     */
    playFootstep(surface = 'dirt', isRunning = false) {
        if (!this.enabled) return;
        const ctx = this.ensureContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const minInterval = isRunning ? 0.20 : 0.36;
        if (now - this.lastStepTime < minInterval) return;
        this.lastStepTime = now;
        this.stepIndex++;

        // Resolve profile from string or object
        let surfaceId = typeof surface === 'string' ? surface : (surface?.id || 'dirt');
        const reg = SurfaceRegistry.get(surfaceId);
        const profile = reg ? reg.footstepProfile : surfaceId;

        // Subtle biological jitter (±6% pitch)
        const pitchJitter = 0.94 + Math.random() * 0.12;
        const volumeScale = isRunning ? 1.25 : 0.85;

        switch (profile) {
            case 'water':
                this.synthesizeWaterStep(now, isRunning, pitchJitter, volumeScale);
                break;
            case 'wood':
                this.synthesizeWoodStep(now, isRunning, pitchJitter, volumeScale);
                break;
            case 'grass':
                this.synthesizeGrassStep(now, isRunning, pitchJitter, volumeScale);
                break;
            case 'sand':
                this.synthesizeSandStep(now, isRunning, pitchJitter, volumeScale);
                break;
            case 'wet_sand':
                this.synthesizeWetSandStep(now, isRunning, pitchJitter, volumeScale);
                break;
            case 'gravel':
                this.synthesizeGravelStep(now, isRunning, pitchJitter, volumeScale);
                break;
            case 'stone':
            case 'concrete':
                this.synthesizeStoneStep(now, isRunning, pitchJitter, volumeScale);
                break;
            case 'dirt':
            default:
                this.synthesizeDirtStep(now, isRunning, pitchJitter, volumeScale);
                break;
        }
    }

    /**
     * WATER: Soft splash, gentle water slosh & bubble pop
     */
    synthesizeWaterStep(time, isRunning, pitch, volScale) {
        const ctx = this.ctx;
        const dur = isRunning ? 0.16 : 0.12;

        const noiseNode = this.createNoiseNode(dur);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime((isRunning ? 780 : 560) * pitch, time);
        filter.Q.setValueAtTime(4.0, time);

        const gain = ctx.createGain();
        const peakGain = 0.32 * volScale;
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(peakGain, time + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noiseNode.start(time);
        noiseNode.stop(time + dur);

        // Water bubble sine pop
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        const startFreq = (isRunning ? 640 : 480) * pitch;
        const endFreq = (isRunning ? 320 : 240) * pitch;

        osc.frequency.setValueAtTime(startFreq, time);
        osc.frequency.exponentialRampToValueAtTime(endFreq, time + dur * 0.7);

        oscGain.gain.setValueAtTime(0.18 * volScale, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.7);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + dur * 0.7);
    }

    /**
     * WOOD: Hollow timber plank resonance
     */
    synthesizeWoodStep(time, isRunning, pitch, volScale) {
        const ctx = this.ctx;
        const dur = isRunning ? 0.10 : 0.08;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime((isRunning ? 210 : 175) * pitch, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + dur);

        oscGain.gain.setValueAtTime(0.35 * volScale, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + dur);

        // High timber tap transient
        const noiseNode = this.createNoiseNode(0.03);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400 * pitch, time);
        filter.Q.setValueAtTime(3.5, time);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.20 * volScale, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noiseNode.start(time);
        noiseNode.stop(time + 0.03);
    }

    /**
     * GRASS: Soft rustling foliage & blade swish
     */
    synthesizeGrassStep(time, isRunning, pitch, volScale) {
        const ctx = this.ctx;
        const dur = isRunning ? 0.11 : 0.09;

        const noiseNode = this.createNoiseNode(dur);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime((isRunning ? 2800 : 2200) * pitch, time);
        filter.Q.setValueAtTime(2.2, time);

        const gain = ctx.createGain();
        const peakGain = 0.22 * volScale;
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(peakGain, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noiseNode.start(time);
        noiseNode.stop(time + dur);
    }

    /**
     * DIRT: Loam ground contact thud & light grit
     */
    synthesizeDirtStep(time, isRunning, pitch, volScale) {
        const ctx = this.ctx;
        const dur = isRunning ? 0.10 : 0.07;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime((isRunning ? 140 : 110) * pitch, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + dur);

        oscGain.gain.setValueAtTime(0.28 * volScale, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + dur);

        const noiseNode = this.createNoiseNode(dur);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime((isRunning ? 2100 : 1700) * pitch, time);
        filter.Q.setValueAtTime(1.8, time);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.24 * volScale, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noiseNode.start(time);
        noiseNode.stop(time + dur);
    }

    /**
     * GRAVEL: Multi-grain crunch with sharp high frequencies
     */
    synthesizeGravelStep(time, isRunning, pitch, volScale) {
        const ctx = this.ctx;
        const dur = isRunning ? 0.12 : 0.09;

        const noiseNode = this.createNoiseNode(dur);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3200 * pitch, time);
        filter.Q.setValueAtTime(2.5, time);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.28 * volScale, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noiseNode.start(time);
        noiseNode.stop(time + dur);
    }

    /**
     * SAND: Soft granular sliding friction
     */
    synthesizeSandStep(time, isRunning, pitch, volScale) {
        const ctx = this.ctx;
        const dur = isRunning ? 0.12 : 0.09;

        const noiseNode = this.createNoiseNode(dur);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(950 * pitch, time);
        filter.Q.setValueAtTime(1.3, time);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.18 * volScale, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noiseNode.start(time);
        noiseNode.stop(time + dur);
    }

    /**
     * WET SAND: Damp suction compression with subtle squelch
     */
    synthesizeWetSandStep(time, isRunning, pitch, volScale) {
        const ctx = this.ctx;
        const dur = isRunning ? 0.14 : 0.10;

        const noiseNode = this.createNoiseNode(dur);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100 * pitch, time);
        filter.Q.setValueAtTime(2.0, time);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.22 * volScale, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noiseNode.start(time);
        noiseNode.stop(time + dur);
    }

    /**
     * STONE / CONCRETE: Hard strike with quick decay
     */
    synthesizeStoneStep(time, isRunning, pitch, volScale) {
        const ctx = this.ctx;
        const dur = 0.05;

        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime((isRunning ? 320 : 260) * pitch, time);
        osc.frequency.exponentialRampToValueAtTime(120, time + dur);

        oscGain.gain.setValueAtTime(0.30 * volScale, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + dur);

        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + dur);

        const noiseNode = this.createNoiseNode(0.03);
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1800 * pitch, time);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.20 * volScale, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

        noiseNode.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noiseNode.start(time);
        noiseNode.stop(time + 0.03);
    }

    createNoiseNode(duration) {
        const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const node = this.ctx.createBufferSource();
        node.buffer = buffer;
        return node;
    }
}
