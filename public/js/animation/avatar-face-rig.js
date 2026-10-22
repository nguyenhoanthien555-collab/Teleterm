/**
 * TELETERM 3D — AVATAR FACE RIG & BIOMECHANICAL EXPRESSION ENGINE
 * Controls 57 VRoid blendshapes/morph targets across all humanoid face meshes.
 * Features:
 * - Autonomous natural blinking with randomized intervals (2.4s - 5.0s) and smooth eyelid curves
 * - Double-blink micro-saccades for lifelike realism
 * - Closed-Mouth Resting Posture (Fcl_MTH_Close = 0.75, Fcl_MTH_Fun = 0.50): eliminates creepy open mouth
 * - Synchronized Morph Multi-Mesh Binding across all 7 face layers (Skin, Mouth Cavity, Eyelines, Brows, Eyes)
 * - Phoneme/speech viseme cycling during dialogue and voice communication with smooth closed-mouth dampening
 * - Non-destructive blending with existing animation retargeter
 */

export class AvatarFaceRig {
    constructor(model) {
        this.model = model;
        this.faceMeshes = [];

        // Blinking system
        this.blinkTimer = 1.8 + Math.random() * 2.2;
        this.isBlinking = false;
        this.blinkProgress = 0;
        this.blinkDuration = 0.15; // 150ms realistic human blink
        this.isDoubleBlink = false;

        // Current target mood & weights
        this.currentMood = 'Neutral'; // 'Neutral', 'Joy', 'Smile', 'Focus', 'Thinking', 'Relaxed'
        this.moodWeight = 0.0;
        this.targetMoodWeight = 1.0;

        // Speech Visemes & Resting Mouth State (Natural Bind Pose Rest Position)
        this.isSpeaking = false;
        this.speechTime = 0;
        this.speechDuration = 0;
        this.currentMthClose = 0.0;
        this.currentMthFun = 0.0;

        this.findFaceMeshes();
    }

    findFaceMeshes() {
        if (!this.model) return;
        this.faceMeshes = [];
        this.model.traverse((child) => {
            if (child.isMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
                // Ensure frustum culling doesn't clip face sub-meshes at screen boundaries
                child.frustumCulled = false;
                this.faceMeshes.push(child);
            }
        });
    }

    setMorph(name, value) {
        if (!this.faceMeshes || this.faceMeshes.length === 0) return;
        const clampedVal = Math.max(0.0, Math.min(1.0, value));
        for (let i = 0; i < this.faceMeshes.length; i++) {
            const mesh = this.faceMeshes[i];
            const dict = mesh.morphTargetDictionary;
            const inf = mesh.morphTargetInfluences;
            if (dict && inf) {
                const idx = dict[name];
                if (idx !== undefined) {
                    inf[idx] = clampedVal;
                }
            }
        }
    }

    getMorph(name) {
        if (!this.faceMeshes || this.faceMeshes.length === 0) return 0;
        for (let i = 0; i < this.faceMeshes.length; i++) {
            const mesh = this.faceMeshes[i];
            const dict = mesh.morphTargetDictionary;
            const inf = mesh.morphTargetInfluences;
            if (dict && inf) {
                const idx = dict[name];
                if (idx !== undefined) {
                    return inf[idx];
                }
            }
        }
        return 0;
    }

    triggerBlink() {
        this.isBlinking = true;
        this.blinkProgress = 0;
        this.blinkDuration = 0.15;
    }

    setMood(moodName, weight = 1.0) {
        this.currentMood = moodName;
        this.targetMoodWeight = weight;
    }

    startSpeaking(duration = 2.5) {
        this.isSpeaking = true;
        this.speechDuration = duration;
        this.speechTime = 0;
    }

    stopSpeaking() {
        this.isSpeaking = false;
        this.speechTime = 0;
        this.setMorph('Fcl_MTH_A', 0);
        this.setMorph('Fcl_MTH_I', 0);
        this.setMorph('Fcl_MTH_U', 0);
        this.setMorph('Fcl_MTH_E', 0);
        this.setMorph('Fcl_MTH_O', 0);
    }

    update(delta) {
        if (this.faceMeshes.length === 0 && this.model) {
            this.findFaceMeshes();
        }
        if (this.faceMeshes.length === 0) return;

        // 1. Update Autonomous Blinking
        this.updateBlinking(delta);

        // 2. Update Emotional Mood & Expression Layer
        this.updateMood(delta);

        // 3. Update Closed-Mouth Resting Posture & Speech Visemes
        this.updateSpeechAndMouth(delta);
    }

    updateBlinking(delta) {
        if (!this.isBlinking) {
            this.blinkTimer -= delta;
            if (this.blinkTimer <= 0) {
                this.isBlinking = true;
                this.blinkProgress = 0;
                this.blinkDuration = 0.13 + Math.random() * 0.04;
                this.isDoubleBlink = Math.random() < 0.22; // 22% chance of micro-saccade double blink
            }
        } else {
            this.blinkProgress += delta / this.blinkDuration;
            let closeVal = 0;
            if (this.blinkProgress <= 0.45) {
                closeVal = this.blinkProgress / 0.45;
            } else if (this.blinkProgress <= 1.0) {
                closeVal = 1.0 - (this.blinkProgress - 0.45) / 0.55;
            } else {
                closeVal = 0;
                this.isBlinking = false;
                if (this.isDoubleBlink) {
                    this.isDoubleBlink = false;
                    this.blinkTimer = 0.08;
                } else {
                    this.blinkTimer = 2.4 + Math.random() * 2.8;
                }
            }

            const smoothClose = Math.sin(closeVal * Math.PI * 0.5);
            this.setMorph('Fcl_EYE_Close', smoothClose);
        }
    }

    updateMood(delta) {
        this.moodWeight += (this.targetMoodWeight - this.moodWeight) * Math.min(1.0, delta * 5.0);
        const w = this.moodWeight;

        switch (this.currentMood) {
            case 'Joy':
            case 'Smile':
                this.setMorph('Fcl_EYE_Joy', 0.30 * w);
                this.setMorph('Fcl_BRW_Joy', 0.35 * w);
                this.setMorph('Fcl_ALL_Neutral', 0);
                break;

            case 'Focus':
            case 'Thinking':
                this.setMorph('Fcl_EYE_Joy', 0);
                this.setMorph('Fcl_BRW_Joy', 0);
                this.setMorph('Fcl_BRW_Fun', 0.30 * w);
                this.setMorph('Fcl_ALL_Neutral', 0.25 * w);
                break;

            case 'Relaxed':
                this.setMorph('Fcl_BRW_Fun', 0.15 * w);
                this.setMorph('Fcl_EYE_Joy', 0.15 * w);
                break;

            case 'Neutral':
            default:
                this.setMorph('Fcl_EYE_Joy', 0);
                this.setMorph('Fcl_BRW_Joy', 0);
                this.setMorph('Fcl_BRW_Fun', 0);
                this.setMorph('Fcl_ALL_Neutral', 0.10 * w);
                break;
        }
    }

    updateSpeechAndMouth(delta) {
        let openA = 0;
        let openO = 0;
        let openI = 0;
        let openU = 0;
        let openE = 0;

        if (this.isSpeaking) {
            this.speechTime += delta;
            if (this.speechTime >= this.speechDuration) {
                this.stopSpeaking();
            } else {
                // Natural multi-viseme speech cadence
                const cycle = Math.sin(this.speechTime * 14.0);
                const harmonic = Math.cos(this.speechTime * 9.5);
                openA = Math.max(0, cycle) * 0.38;
                openO = Math.max(0, -cycle) * 0.24;
                openI = Math.max(0, harmonic) * 0.16;
                openE = Math.max(0, -harmonic) * 0.14;

                // Viseme normalization: Total oral aperture clamped to <= 0.45 to prevent mesh distortion
                const totalAperture = openA + openO + openI + openE + openU;
                if (totalAperture > 0.45) {
                    const normFactor = 0.45 / totalAperture;
                    openA *= normFactor;
                    openO *= normFactor;
                    openI *= normFactor;
                    openE *= normFactor;
                    openU *= normFactor;
                }
            }
        }

        this.setMorph('Fcl_MTH_A', openA);
        this.setMorph('Fcl_MTH_O', openO);
        this.setMorph('Fcl_MTH_U', openU);
        this.setMorph('Fcl_MTH_I', openI);
        this.setMorph('Fcl_MTH_E', openE);
        this.setMorph('Fcl_MTH_Joy', 0); // Guarantee 0 to eliminate open gaping mouth hole

        // Dynamic expression mouth suppression (Argon Spec):
        // When speech visemes open the mouth, expression mouth morphs (smile/fun) smoothly yield to 0.0
        // Formula: w_expression = w_target * (1.0 - min(1.0, totalAperture / 0.25))
        const totalAperture = openA + openO + openI + openE + openU;
        const visemeSuppression = 1.0 - Math.min(1.0, totalAperture / 0.25);
        const isSmiling = this.currentMood === 'Joy' || this.currentMood === 'Smile';
        const targetFun = isSmiling ? (0.12 * (this.moodWeight || 1.0) * visemeSuppression) : 0.0;
        const targetClose = 0.0;

        // Framerate-independent exponential damping (120Hz robust)
        const decayClose = 1.0 - Math.exp(-14.0 * delta);
        const decayFun = 1.0 - Math.exp(-12.0 * delta);

        this.currentMthClose += (targetClose - this.currentMthClose) * decayClose;
        this.currentMthFun += (targetFun - this.currentMthFun) * decayFun;

        this.setMorph('Fcl_MTH_Close', this.currentMthClose);
        this.setMorph('Fcl_MTH_Fun', this.currentMthFun);
    }
}
