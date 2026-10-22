/**
 * TeleTerm Lofi Vibe Capsule Audio Engine
 * Pure Web Audio API Synthesizer & Procedural Ambient Sound Generator
 * TeleTerm Master Architecture v2 - Section 21
 */

class LofiVibeEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.masterVolume = 0.65;
        this.ambientVolumes = {
            rain: 0.0,
            fire: 0.0,
            vinyl: 0.0
        };

        this.rainNode = null;
        this.fireNode = null;
        this.vinylNode = null;
        this.musicTimer = null;
        this.currentTrackName = 'Sakura Afternoon (Rhodes Chill)';

        this.initUI();
    }

    ensureAudioContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // ==================== PROCEDURAL AMBIENT GENERATORS ====================

    createPinkNoiseBuffer(duration = 5) {
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
        }
        return buffer;
    }

    startRain() {
        if (this.rainNode) return;
        const buffer = this.createPinkNoiseBuffer(4);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1100;

        const gain = this.ctx.createGain();
        gain.gain.value = this.ambientVolumes.rain * this.masterVolume;

        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noiseSource.start();

        this.rainNode = { source: noiseSource, gain };
    }

    stopRain() {
        if (this.rainNode) {
            try { this.rainNode.source.stop(); } catch (e) {}
            this.rainNode = null;
        }
    }

    startFireplace() {
        if (this.fireNode) return;
        const gain = this.ctx.createGain();
        gain.gain.value = this.ambientVolumes.fire * this.masterVolume * 0.8;
        gain.connect(this.ctx.destination);

        // Crackle generator loop
        let isCrackleRunning = true;
        const triggerCrackle = () => {
            if (!isCrackleRunning || !this.ctx) return;
            const clickOsc = this.ctx.createOscillator();
            const clickGain = this.ctx.createGain();
            clickOsc.type = 'triangle';
            clickOsc.frequency.value = 80 + Math.random() * 220;

            const t = this.ctx.currentTime;
            clickGain.gain.setValueAtTime(0.01 + Math.random() * 0.08, t);
            clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015 + Math.random() * 0.03);

            clickOsc.connect(clickGain);
            clickGain.connect(gain);
            clickOsc.start(t);
            clickOsc.stop(t + 0.05);

            const nextDelay = 80 + Math.random() * 350;
            setTimeout(triggerCrackle, nextDelay);
        };
        triggerCrackle();

        this.fireNode = { gain, stop: () => { isCrackleRunning = false; } };
    }

    stopFireplace() {
        if (this.fireNode) {
            this.fireNode.stop();
            this.fireNode = null;
        }
    }

    startVinyl() {
        if (this.vinylNode) return;
        const buffer = this.createPinkNoiseBuffer(3);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 4500;

        const gain = this.ctx.createGain();
        gain.gain.value = this.ambientVolumes.vinyl * this.masterVolume * 0.18;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        source.start();

        this.vinylNode = { source, gain };
    }

    stopVinyl() {
        if (this.vinylNode) {
            try { this.vinylNode.source.stop(); } catch (e) {}
            this.vinylNode = null;
        }
    }

    // ==================== PROCEDURAL LOFI CHORD HARMONIZER ====================

    playWarmRhodesChord(midiNotes, duration = 3.6) {
        if (!this.ctx || !this.isPlaying) return;

        const now = this.ctx.currentTime;
        midiNotes.forEach((midi, idx) => {
            const freq = 440 * Math.pow(2, (midi - 69) / 12);
            
            // Oscillator 1: Sine (Warm body)
            const osc1 = this.ctx.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.value = freq;

            // Oscillator 2: Triangle (Rhodes tines)
            const osc2 = this.ctx.createOscillator();
            osc2.type = 'triangle';
            osc2.frequency.value = freq;

            // Lowpass warmth filter
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, now);
            filter.frequency.exponentialRampToValueAtTime(600, now + duration);

            // Envelope
            const noteGain = this.ctx.createGain();
            const vel = 0.065 / (idx + 1);
            noteGain.gain.setValueAtTime(0.001, now);
            noteGain.gain.linearRampToValueAtTime(vel * this.masterVolume, now + 0.08);
            noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(noteGain);
            noteGain.connect(this.ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + duration + 0.1);
            osc2.stop(now + duration + 0.1);
        });
    }

    startLofiMusicLoop() {
        if (this.musicTimer) clearInterval(this.musicTimer);

        // Aesthetic Lofi Chord Progressions (Cmaj9 -> Am9 -> Dm9 -> G13)
        const chordBook = [
            [60, 64, 67, 71, 74], // Cmaj9
            [57, 60, 64, 67, 71], // Am9
            [62, 65, 69, 72, 76], // Dm9
            [55, 59, 62, 65, 71], // G13
            [65, 69, 72, 76],     // Fmaj7
            [64, 67, 71, 74]      // Em7
        ];

        let chordIndex = 0;
        const tickChord = () => {
            if (!this.isPlaying) return;
            const chord = chordBook[chordIndex % chordBook.length];
            this.playWarmRhodesChord(chord, 3.8);
            chordIndex++;
        };

        tickChord();
        this.musicTimer = setInterval(tickChord, 4200);
    }

    stopLofiMusicLoop() {
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
    }

    // ==================== MASTER CONTROLS ====================

    togglePlay() {
        this.ensureAudioContext();
        this.isPlaying = !this.isPlaying;

        const playBtn = document.getElementById('btn-lofi-play');
        const statusIndicator = document.getElementById('lofi-status-dot');

        if (this.isPlaying) {
            this.startLofiMusicLoop();
            if (this.ambientVolumes.rain > 0) this.startRain();
            if (this.ambientVolumes.fire > 0) this.startFireplace();
            if (this.ambientVolumes.vinyl > 0) this.startVinyl();

            if (playBtn) {
                const pauseSvg = window.TeleTermIcons ? window.TeleTermIcons.render('square', { size: 12 }) : '';
                playBtn.innerHTML = `${pauseSvg} <span>Pause</span>`;
            }
            if (statusIndicator) statusIndicator.classList.add('playing');
        } else {
            this.stopLofiMusicLoop();
            this.stopRain();
            this.stopFireplace();
            this.stopVinyl();

            if (playBtn) {
                const playSvg = window.TeleTermIcons ? window.TeleTermIcons.render('play', { size: 12 }) : '';
                playBtn.innerHTML = `${playSvg} <span>Play Music</span>`;
            }
            if (statusIndicator) statusIndicator.classList.remove('playing');
        }

        return this.isPlaying;
    }

    setMasterVolume(val) {
        this.masterVolume = Math.max(0, Math.min(1, parseFloat(val)));
        if (this.rainNode) this.rainNode.gain.gain.value = this.ambientVolumes.rain * this.masterVolume;
        if (this.vinylNode) this.vinylNode.gain.gain.value = this.ambientVolumes.vinyl * this.masterVolume * 0.18;
    }

    toggleAmbient(type) {
        this.ensureAudioContext();
        if (type === 'rain') {
            this.ambientVolumes.rain = this.ambientVolumes.rain > 0 ? 0 : 0.45;
            if (this.isPlaying) {
                this.ambientVolumes.rain > 0 ? this.startRain() : this.stopRain();
            }
            return this.ambientVolumes.rain > 0;
        } else if (type === 'fire') {
            this.ambientVolumes.fire = this.ambientVolumes.fire > 0 ? 0 : 0.5;
            if (this.isPlaying) {
                this.ambientVolumes.fire > 0 ? this.startFireplace() : this.stopFireplace();
            }
            return this.ambientVolumes.fire > 0;
        } else if (type === 'vinyl') {
            this.ambientVolumes.vinyl = this.ambientVolumes.vinyl > 0 ? 0 : 0.4;
            if (this.isPlaying) {
                this.ambientVolumes.vinyl > 0 ? this.startVinyl() : this.stopVinyl();
            }
            return this.ambientVolumes.vinyl > 0;
        }
    }

    initUI() {
        // Event delegation or bindings will be handled when DOM loads
        window.addEventListener('DOMContentLoaded', () => {
            const toggleTrigger = document.getElementById('btn-lofi-toggle-panel');
            const panel = document.getElementById('lofi-vibe-panel');
            const playBtn = document.getElementById('btn-lofi-play');
            const volSlider = document.getElementById('lofi-volume-slider');
            const rainBtn = document.getElementById('btn-ambient-rain');
            const fireBtn = document.getElementById('btn-ambient-fire');
            const vinylBtn = document.getElementById('btn-ambient-vinyl');

            if (toggleTrigger && panel) {
                toggleTrigger.addEventListener('click', () => {
                    panel.classList.toggle('hidden');
                });
            }

            if (playBtn) {
                playBtn.addEventListener('click', () => {
                    this.togglePlay();
                });
            }

            if (volSlider) {
                volSlider.addEventListener('input', (e) => {
                    this.setMasterVolume(e.target.value);
                });
            }

            if (rainBtn) {
                rainBtn.addEventListener('click', () => {
                    const active = this.toggleAmbient('rain');
                    rainBtn.classList.toggle('active', active);
                });
            }

            if (fireBtn) {
                fireBtn.addEventListener('click', () => {
                    const active = this.toggleAmbient('fire');
                    fireBtn.classList.toggle('active', active);
                });
            }

            if (vinylBtn) {
                vinylBtn.addEventListener('click', () => {
                    const active = this.toggleAmbient('vinyl');
                    vinylBtn.classList.toggle('active', active);
                });
            }
        });
    }

    unlockTrack(track) {
        if (!track) return;
        if (!this.unlockedTracks) this.unlockedTracks = [];
        if (!this.unlockedTracks.some(t => t.id === track.id)) {
            this.unlockedTracks.push(track);
            this.currentTrackName = track.title;
            const trackEl = document.getElementById('lofi-current-track');
            if (trackEl) {
                const musicIcon = window.TeleTermIcons ? window.TeleTermIcons.render('music', { size: 12 }) : '';
                trackEl.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">${musicIcon} <span>${track.title}</span></span>`;
            }
            console.log('[LofiEngine] Unlocked new Lo-Fi track:', track.title);
        }
    }
}

window.lofiEngine = new LofiVibeEngine();
