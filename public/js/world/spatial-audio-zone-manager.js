import * as THREE from 'three';
import { soundSettings } from './sound-settings-manager.js';

/**
 * TELETERM 3D — SPATIAL AUDIO 3D & ZONE BGM CROSSFADE ENGINE
 * Zero-dependency Web Audio procedural music & environmental synthesizer:
 * - 4 Thematic Zones: Hub Lo-Fi, Zen Water Chimes, Alpine Crystal Bells, Coastal Surf Breeze
 * - 1.8s Seamless Linear Ramp Gain Crossfading (eliminates audio clicks/pops)
 * - 3D PannerNode with Exponential Distance Rolloff
 * - Full integration with soundSettings (Master, Ambiance, Players)
 */
export class SpatialAudioZoneManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.isInitialized = false;

        this.currentZoneId = 'hub';
        this.targetZoneId = 'hub';
        this.crossfadeDuration = 1.8;

        // Zone nodes: zoneId -> { gainNode, oscillators: [], noiseNodes: [], targetGain, baseVolume }
        this.zones = new Map();

        // Biome bounding centers for automatic proximity detection
        this.zoneAnchors = {
            hub: { x: 21, z: -11, radius: 35, baseVol: 0.12 },
            zen_pond: { x: -18, z: -25, radius: 40, baseVol: 0.14 },
            alpine_summit: { x: 75, z: -85, radius: 55, baseVol: 0.15 },
            coastal_beach: { x: 15, z: 60, radius: 50, baseVol: 0.13 }
        };

        soundSettings.addListener(() => {
            this.syncVolumes();
        });

        this.initOnUserGesture();
    }

    initOnUserGesture() {
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
        const initialVol = soundSettings.getEffectiveAmbianceVolume();
        this.masterGain.gain.setValueAtTime(initialVol, ctx.currentTime);
        this.masterGain.connect(ctx.destination);

        // 1. Hub Cyber Lo-Fi: Warm vinyl pad chords (Fmaj7 -> Cmaj7)
        this.createHubZone();

        // 2. Zen Pond: Traditional koto pentatonic harmonics & water bell resonance
        this.createZenPondZone();

        // 3. Alpine Summit: Crystalline high-altitude ice chimes & wind drone
        this.createAlpineSummitZone();

        // 4. Coastal Beach: Warm surf breeze & rhythmic tidal swell
        this.createCoastalBeachZone();

        // Set initial zone
        this.setZone('hub', true);
    }

    createNoiseBuffer(seconds = 3.0) {
        const ctx = this.ctx;
        const bufferSize = ctx.sampleRate * seconds;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.4;
        }
        return buffer;
    }

    createHubZone() {
        const ctx = this.ctx;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.connect(this.masterGain);

        // Continuous low-frequency drone oscillators eliminated per user instruction.
        this.zones.set('hub', {
            gainNode: gain,
            baseVol: 0.0
        });
    }

    createZenPondZone() {
        const ctx = this.ctx;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.connect(this.masterGain);

        // Continuous pentatonic oscillators silenced to prevent background humming.
        this.zones.set('zen_pond', {
            gainNode: gain,
            baseVol: 0.0
        });
    }

    createAlpineSummitZone() {
        const ctx = this.ctx;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.connect(this.masterGain);

        // Continuous ice bell oscillators silenced.
        this.zones.set('alpine_summit', {
            gainNode: gain,
            baseVol: 0.0
        });
    }

    createCoastalBeachZone() {
        const ctx = this.ctx;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.connect(this.masterGain);

        // Continuous 320Hz lowpass surf noise drone eliminated.
        this.zones.set('coastal_beach', {
            gainNode: gain,
            baseVol: 0.0
        });
    }

    /**
     * Crossfades smoothly to target zone using Web Audio linearRampToValueAtTime
     */
    setZone(zoneId, instant = false) {
        if (!this.zones.has(zoneId)) return;
        this.currentZoneId = zoneId;

        if (!this.ctx || !this.isInitialized) return;
        const now = this.ctx.currentTime;
        const duration = instant ? 0.05 : this.crossfadeDuration;
        const ambVol = soundSettings.getEffectiveAmbianceVolume();

        for (const [id, zone] of this.zones) {
            const target = (id === zoneId) ? (zone.baseVol * ambVol) : 0.0001;
            zone.gainNode.gain.cancelScheduledValues(now);
            zone.gainNode.gain.setValueAtTime(zone.gainNode.gain.value, now);
            zone.gainNode.gain.linearRampToValueAtTime(target, now + duration);
        }
    }

    syncVolumes() {
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const ambVol = soundSettings.getEffectiveAmbianceVolume();
        this.masterGain.gain.setValueAtTime(soundSettings.getEffectiveMasterVolume(), now);

        for (const [id, zone] of this.zones) {
            const isCurrent = (id === this.currentZoneId);
            const target = isCurrent ? (zone.baseVol * ambVol) : 0.0001;
            zone.gainNode.gain.setTargetAtTime(target, now, 0.08);
        }
    }

    /**
     * Updates listener position & orientation from camera and determines biome zone by proximity
     */
    update(delta, playerPos, camera) {
        if (!this.ctx || !this.isInitialized || !playerPos) return;

        // 1. Update 3D Audio Listener coordinates with smooth target to prevent zipper clicks
        const now = this.ctx.currentTime;
        const listener = this.ctx.listener;
        const headX = playerPos.x;
        const headY = playerPos.y + 1.6;
        const headZ = playerPos.z;

        if (listener.positionX) {
            listener.positionX.setTargetAtTime(headX, now, 0.04);
            listener.positionY.setTargetAtTime(headY, now, 0.04);
            listener.positionZ.setTargetAtTime(headZ, now, 0.04);
        } else if (listener.setPosition) {
            listener.setPosition(headX, headY, headZ);
        }

        // Update listener orientation from camera if available
        if (camera && camera.getWorldDirection) {
            if (!this._forwardVec) {
                this._forwardVec = new (THREE.Vector3 || function() { this.x = 0; this.y = 0; this.z = -1; })();
            }
            camera.getWorldDirection(this._forwardVec);
            if (listener.forwardX) {
                listener.forwardX.setTargetAtTime(this._forwardVec.x, now, 0.04);
                listener.forwardY.setTargetAtTime(this._forwardVec.y, now, 0.04);
                listener.forwardZ.setTargetAtTime(this._forwardVec.z, now, 0.04);
                listener.upX.setTargetAtTime(0, now, 0.04);
                listener.upY.setTargetAtTime(1, now, 0.04);
                listener.upZ.setTargetAtTime(0, now, 0.04);
            } else if (listener.setOrientation) {
                listener.setOrientation(this._forwardVec.x, this._forwardVec.y, this._forwardVec.z, 0, 1, 0);
            }
        }

        // 2. Identify nearest biome anchor
        let nearestZone = 'hub';
        let minDistSq = Infinity;

        for (const [zoneId, anchor] of Object.entries(this.zoneAnchors)) {
            const dx = playerPos.x - anchor.x;
            const dz = playerPos.z - anchor.z;
            const distSq = dx * dx + dz * dz;
            if (distSq < minDistSq) {
                minDistSq = distSq;
                nearestZone = zoneId;
            }
        }

        if (nearestZone !== this.currentZoneId) {
            this.setZone(nearestZone);
        }
    }

    /**
     * Plays a high-fidelity mechanical keyboard click originating from 3D coordinates (e.g. Diegetic Kiosk)
     * Features subtle randomized detuning (-100 to +100 cents) to prevent repetitive audio fatigue.
     */
    playPositionalKeystroke(pos = { x: 21, y: 1.25, z: -11 }, baseVol = 0.5) {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
        }
        const ctx = this.ctx;
        const now = ctx.currentTime;
        const playerVol = soundSettings.getEffectivePlayersVolume();
        if (playerVol < 0.01) return;

        // 1. Create Spatial PannerNode with inverse distance attenuation
        const panner = ctx.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1.2;
        panner.maxDistance = 25.0;
        panner.rolloffFactor = 1.3;

        if (panner.positionX) {
            panner.positionX.setValueAtTime(pos.x, now);
            panner.positionY.setValueAtTime(pos.y, now);
            panner.positionZ.setValueAtTime(pos.z, now);
        } else if (panner.setPosition) {
            panner.setPosition(pos.x, pos.y, pos.z);
        }

        const outGain = ctx.createGain();
        outGain.gain.setValueAtTime(baseVol * playerVol * 0.8, now);
        panner.connect(outGain);
        outGain.connect(this.masterGain || ctx.destination);

        // 2. High-frequency transient click (tactile switch snap)
        const snapLen = 0.007; // 7ms snap
        const snapBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * snapLen), ctx.sampleRate);
        const snapData = snapBuf.getChannelData(0);
        for (let i = 0; i < snapData.length; i++) {
            snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapData.length * 0.3));
        }
        const snapSrc = ctx.createBufferSource();
        snapSrc.buffer = snapBuf;

        const snapFilter = ctx.createBiquadFilter();
        snapFilter.type = 'bandpass';
        // Randomize center frequency slightly
        const randomFreq = 3200 + (Math.random() * 600 - 300);
        snapFilter.frequency.setValueAtTime(randomFreq, now);
        snapFilter.Q.setValueAtTime(3.0, now);

        snapSrc.connect(snapFilter);
        snapFilter.connect(panner);
        snapSrc.start(now);

        // 3. Low-frequency keycap bottom-out thud (resonance with +/- 80 cents detune)
        const thudOsc = ctx.createOscillator();
        const thudGain = ctx.createGain();
        const detuneCents = (Math.random() * 160) - 80;
        thudOsc.type = 'triangle';
        thudOsc.frequency.setValueAtTime(220, now);
        thudOsc.detune.setValueAtTime(detuneCents, now);

        thudGain.gain.setValueAtTime(0.7, now);
        thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        thudOsc.connect(thudGain);
        thudGain.connect(panner);
        thudOsc.start(now);
        thudOsc.stop(now + 0.05);

        // Auto cleanup after sound finishes
        setTimeout(() => {
            try {
                panner.disconnect();
                outGain.disconnect();
            } catch (e) {}
        }, 150);
    }

    setMaxCullDistance(dist = 85) {
        this.maxCullDistance = dist;
    }

    getActiveZone() {
        return this.currentZoneId;
    }
}

export const spatialAudioZoneManager = new SpatialAudioZoneManager();
