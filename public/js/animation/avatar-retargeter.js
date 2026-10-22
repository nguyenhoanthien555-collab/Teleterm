import * as THREE from 'three';
import { HumanoidContract } from './humanoid-contract.js?v=36';
import { AnimationLibrary } from './animation-library.js?v=39';
import { GRIP_PROFILES } from '../inventory/player-inventory.js';
import { AvatarFaceRig } from './avatar-face-rig.js?v=40';
import { SecondaryMotionSolver } from './secondary-motion.js';

// Zero-Allocation Module Scratchpad (Argon Task #3)
const _invLLeg = new THREE.Quaternion();
const _invRLeg = new THREE.Quaternion();
const _compQuat = new THREE.Quaternion();

// Fixed-Timestep Physics Configuration (Argon Task #2)
export const FIXED_PHYSICS_DT = 1 / 60; // 16.666ms per sub-step
export const MAX_PHYSICS_DELTA = 0.05;   // Clamps lag spikes/tab-switching to max 3 sub-steps (50ms) to prevent spring explosion

/**
 * AVATAR RETARGETER & KINEMATICS ENGINE
 * Implements Section 24, 25, 28, and 30 of TeleTerm Living Open World Master Spec v3.
 * Normalizes bone rotations, scale, and applies procedural semantic animations
 * to any compatible humanoid skeleton.
 */
export class AvatarRetargeter {
    constructor(model, options = {}) {
        this.model = model;
        const inspection = HumanoidContract.mapSkeleton(model);
        this.mappedBones = inspection.mapped;
        this.status = inspection.status;

        if (this.mappedBones.Head && !this.mouthTarget) {
            this.mouthTarget = new THREE.Object3D();
            this.mouthTarget.name = 'mouthTarget';
            this.mouthTarget.position.set(0, -0.05, 0.12);
            this.mappedBones.Head.add(this.mouthTarget);
        }

        // Initialize 57-Morph Face Rig (Blinking, Expressions, Visemes)
        this.faceRig = new AvatarFaceRig(model);
        this.turnVelocity = 0;
        this.prevRotY = undefined;

        this.currentAnim = options.defaultAnim || 'Idle';
        this.time = 0;
        this.gaitPhase = 0;
        this.speedNorm = 0;
        this.targetSpeedNorm = 0;
        this.onFootPlant = null;
        this.drinkHoldState = null;

        // Biomechanical Aerial & Jump State (Continuous Blend Tree - Argon Spec #2 & #3)
        this.jumpState = 'GROUNDED'; // 'GROUNDED', 'ANTICIPATION', 'AIRBORNE', 'LANDING'
        this.jumpVerticalVelocity = 0;
        this.landingSquashFactor = 0;
        this.airBlendWeight = 0;
        this.airTime = 0;
        this.landingSpringTime = 999;
        this.landingImpactIntensity = 0;
        this.landingRunSpeedNorm = 0;

        // Base resting height
        const hips = this.mappedBones.Hips;
        this.restHipsY = hips ? hips.position.y : 0.75;
        this.restHipsX = hips ? hips.position.x : 0;
        this.restHipsZ = hips ? hips.position.z : 0;

        // Current smoothed bone rotations
        this.currentRots = {};
        for (const name in this.mappedBones) {
            const b = this.mappedBones[name];
            this.currentRots[name] = { x: b.rotation.x, y: b.rotation.y, z: b.rotation.z };
        }

        // Secondary Motion & Spring-Damper Dynamics Engine
        this.secondaryMotion = new SecondaryMotionSolver(model);

        // Animation Crossfader 0.35s S-Curve Blending State
        this.crossfadeElapsed = 0;
        this.crossfadeDuration = 0.35;
        this.isCrossfading = false;
        this.prevTargets = {};
        this.lastRawTargets = {};

        // Secondary VRM Skirt Bones & Procedural Cloth Draping Engine
        this.skirtBones = { front: [], back: [], side: [] };
        // Secondary VRM Hair & Ribbon Bones for Spring/Verlet Dynamics
        this.hairBones = [];

        // Fixed-Timestep Physics Accumulator State (Argon Task #2)
        this.physicsAccumulator = 0;
        this.physicsTime = 0;
        this.skirtInertiaAngle = 0;
        this.skirtInertiaVel = 0;
        this.physicsGaitPhase = 0;
        // Hand & Finger Bones for Grip Socket & Poses (Master Spec v4 Section 75-76)
        this.fingerBones = {
            rightThumb: [],
            rightIndex: [],
            rightMiddle: [],
            rightRing: [],
            rightLittle: []
        };
        this.currentHandPose = 'empty_hand';
        this.handPoseCurl = 0;
        this.drinkAnimState = null;

        model.traverse(child => {
            if (child.isBone && child.name.includes('Skirt')) {
                child.userData.restRotation = { x: child.rotation.x, y: child.rotation.y, z: child.rotation.z };
                child.userData.restQuaternion = child.quaternion.clone();
                if (child.name.includes('SkirtFront')) {
                    this.skirtBones.front.push(child);
                } else if (child.name.includes('SkirtBack')) {
                    this.skirtBones.back.push(child);
                } else if (child.name.includes('SkirtSide')) {
                    this.skirtBones.side.push(child);
                }
            } else if (child.isBone && (child.name.includes('Hair') || child.name.includes('Ribbon'))) {
                child.userData.restRotation = { x: child.rotation.x, y: child.rotation.y, z: child.rotation.z };
                child.userData.restQuaternion = child.quaternion.clone();
                child.userData.springAngle = 0;
                child.userData.springVel = 0;
                this.hairBones.push(child);
            } else if (child.isBone) {
                const name = child.name;
                if (name.includes('R_Thumb') || name.includes('RightHandThumb')) this.fingerBones.rightThumb.push(child);
                else if (name.includes('R_Index') || name.includes('RightHandIndex')) this.fingerBones.rightIndex.push(child);
                else if (name.includes('R_Middle') || name.includes('RightHandMiddle')) this.fingerBones.rightMiddle.push(child);
                else if (name.includes('R_Ring') || name.includes('RightHandRing')) this.fingerBones.rightRing.push(child);
                else if (name.includes('R_Little') || name.includes('RightHandPinky')) this.fingerBones.rightLittle.push(child);
            }
        });

        // Ensure finger joints are strictly sorted in proximal -> intermediate -> distal order
        for (const k in this.fingerBones) {
            this.fingerBones[k].sort((a, b) => a.name.localeCompare(b.name));
        }
    }

    setHandPose(poseName) {
        this.currentHandPose = poseName || 'empty_hand';
    }

    setJumpState(state, verticalVel = 0, squashFactor = 0) {
        this.jumpState = state || 'GROUNDED';
        this.jumpVerticalVelocity = verticalVel;
        this.landingSquashFactor = squashFactor;
    }

    triggerLanding(impactVy = 0, currentHorizSpeedNorm = 0) {
        this.landingSpringTime = 0;
        const runMitigation = 1.0 - 0.35 * currentHorizSpeedNorm;
        this.landingImpactIntensity = Math.min(1.0, Math.abs(impactVy) / 11.0) * runMitigation;
        this.landingRunSpeedNorm = currentHorizSpeedNorm;
    }

    startDrinkingHold(onSip = null, onFinish = null) {
        this.drinkHoldState = {
            state: 'RAISING', // 'RAISING', 'DRINKING', 'LOWERING'
            elapsed: 0,
            raiseDuration: 0.55,
            lowerDuration: 0.45,
            holdDuration: 0,
            sipped: false,
            finished: false,
            onSip,
            onFinish
        };
    }

    stopDrinkingHold() {
        if (this.drinkHoldState && this.drinkHoldState.state !== 'LOWERING') {
            this.drinkHoldState.state = 'LOWERING';
            this.drinkHoldState.elapsed = 0;
        }
    }

    playDrinkAnimation(duration = 2.4, onMidpoint = null, onComplete = null) {
        this.drinkAnimState = {
            elapsed: 0,
            duration: duration,
            midpointTriggered: false,
            onMidpoint,
            onComplete
        };
    }

    applyFingerCurl(delta) {
        const profile = GRIP_PROFILES[this.currentHandPose] || GRIP_PROFILES.empty_hand;
        const targetCurl = (this.currentHandPose !== 'empty_hand') ? 1.0 : 0.0;
        this.handPoseCurl += (targetCurl - this.handPoseCurl) * Math.min(1.0, delta * 12.0);

        const c = this.handPoseCurl;
        const curls = profile.fingerCurl || GRIP_PROFILES.empty_hand.fingerCurl;

        const applyBones = (bones, curlList) => {
            if (!bones || !curlList) return;
            for (let i = 0; i < bones.length; i++) {
                const b = bones[i];
                const curl = Array.isArray(curlList) ? (curlList[i] || curlList[curlList.length - 1]) : curlList;
                if (!curl) continue;
                b.rotation.x = (curl.x || 0) * c;
                b.rotation.y = (curl.y || 0) * c;
                b.rotation.z = (curl.z || 0) * c;
            }
        };

        applyBones(this.fingerBones.rightThumb, curls.thumb);
        applyBones(this.fingerBones.rightIndex, curls.index);
        applyBones(this.fingerBones.rightMiddle, curls.middle);
        applyBones(this.fingerBones.rightRing, curls.ring);
        applyBones(this.fingerBones.rightLittle, curls.little);
    }

    setAnimation(animName) {
        if (this.currentAnim !== animName) {
            // Snapshot previous raw bone pose for seamless 0.35s S-curve transition
            if (this.lastRawTargets && Object.keys(this.lastRawTargets).length > 0) {
                this.prevTargets = JSON.parse(JSON.stringify(this.lastRawTargets));
                this.crossfadeElapsed = 0;
                this.isCrossfading = true;
            }

            const wasSitting = this.currentAnim && this.currentAnim.startsWith('Sit');
            this.currentAnim = animName;
            if (animName && !animName.startsWith('Sit')) {
                this.seatConfig = null;
                this.isSeated = false;
                if (wasSitting) {
                    delete this.currentRots.LeftUpperLeg;
                    delete this.currentRots.RightUpperLeg;
                    delete this.currentRots.LeftLowerLeg;
                    delete this.currentRots.RightLowerLeg;
                    delete this.currentRots.Hips;
                }
            }
        }
    }

    setSeatConfig(anchor) {
        this.seatConfig = anchor || null;
        if (!anchor) {
            this.isSeated = false;
            if (this.currentAnim && this.currentAnim.startsWith('Sit')) {
                this.currentAnim = 'Idle';
                delete this.currentRots.LeftUpperLeg;
                delete this.currentRots.RightUpperLeg;
                delete this.currentRots.LeftLowerLeg;
                delete this.currentRots.RightLowerLeg;
                delete this.currentRots.Hips;
            }
        }
    }

    getAnimation() {
        return this.currentAnim;
    }

    playEmote(animName) {
        return this.setAnimation(animName);
    }

    update(delta, isMoving = false, isSprinting = false, lodOptions = {}) {
        this.time += delta;

        // Locomotion target speed blending
        if (isMoving) {
            this.targetSpeedNorm = isSprinting ? 1.0 : 0.45;
        } else {
            this.targetSpeedNorm = 0.0;
        }

        // Natural deceleration with momentum easing (Analytical Frame-Rate Independent Exponential Decay)
        if (this.speedNorm < this.targetSpeedNorm) {
            this.speedNorm += (this.targetSpeedNorm - this.speedNorm) * (1 - Math.exp(-delta * 6.5));
        } else {
            this.speedNorm += (this.targetSpeedNorm - this.speedNorm) * (1 - Math.exp(-delta * 8.5));
            if (!isMoving && this.speedNorm < 0.03) this.speedNorm = 0.0;
        }

        // Calculate angular turning velocity for dynamic turn banking
        const rootObj = this.model?.parent || this.model;
        if (rootObj && rootObj.rotation) {
            const currentRotY = rootObj.rotation.y || 0;
            if (this.prevRotY !== undefined) {
                let diff = currentRotY - this.prevRotY;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                const rawTurnRate = diff / Math.max(0.001, delta);
                this.turnVelocity = THREE.MathUtils.lerp(this.turnVelocity, rawTurnRate, Math.min(1.0, delta * 8.0));
            }
            this.prevRotY = currentRotY;
        }

        // Update Face Rig (blinking, moods, visemes) — throttle if skipFaceRig is active
        if (this.faceRig && !lodOptions.skipFaceRig) {
            if (this.isSeated || this.currentAnim === 'Celebrate') {
                this.faceRig.setMood('Joy', 0.85);
            } else if (this.currentAnim === 'Typing') {
                this.faceRig.setMood('Focus', 0.75);
            } else if (this.currentAnim === 'Thinking') {
                this.faceRig.setMood('Thinking', 0.85);
            } else {
                this.faceRig.setMood('Neutral', 0.4);
            }
            this.faceRig.update(delta);
        }

        const targets = {};

        // Solve Drinking State Machine (Hold RMB or One-Shot)
        let drinkTargets = null;
        if (this.drinkHoldState) {
            const dh = this.drinkHoldState;
            dh.elapsed += delta;
            let raise = 0;
            let tilt = 0;

            if (dh.state === 'RAISING') {
                const p = Math.min(1.0, dh.elapsed / dh.raiseDuration);
                raise = p;
                tilt = p * 0.7;
                if (p >= 1.0) {
                    dh.state = 'DRINKING';
                    dh.elapsed = 0;
                    if (!dh.sipped) {
                        dh.sipped = true;
                        if (dh.onSip) dh.onSip();
                    }
                }
            } else if (dh.state === 'DRINKING') {
                raise = 1.0;
                dh.holdDuration += delta;
                tilt = 0.85 + Math.sin(dh.holdDuration * 3.5) * 0.15;
                if (dh.holdDuration >= 2.6 && !dh.finished) {
                    dh.finished = true;
                    if (dh.onFinish) dh.onFinish();
                    dh.state = 'LOWERING';
                    dh.elapsed = 0;
                }
            } else if (dh.state === 'LOWERING') {
                const p = Math.min(1.0, dh.elapsed / dh.lowerDuration);
                raise = 1.0 - p;
                tilt = (1.0 - p) * 0.7;
                if (p >= 1.0) {
                    this.drinkHoldState = null;
                }
            }

            drinkTargets = {};
            AnimationLibrary.solveDrinkingPose(raise, tilt, drinkTargets, this.restHipsY);
        } else if (this.drinkAnimState) {
            this.drinkAnimState.elapsed += delta;
            const progress = Math.min(1.0, this.drinkAnimState.elapsed / this.drinkAnimState.duration);
            if (progress >= 0.45 && !this.drinkAnimState.midpointTriggered) {
                this.drinkAnimState.midpointTriggered = true;
                if (this.drinkAnimState.onMidpoint) this.drinkAnimState.onMidpoint();
            }
            drinkTargets = {};
            AnimationLibrary.solveDrinkCan(progress, drinkTargets, this.restHipsY);
            if (progress >= 1.0) {
                const cb = this.drinkAnimState.onComplete;
                this.drinkAnimState = null;
                if (cb) cb();
            }
        }

        this.drinkTargets = drinkTargets;
        if (isMoving) {
            this.seatConfig = null;
            if (this.currentAnim && this.currentAnim.startsWith('Sit')) {
                this.currentAnim = isSprinting ? 'Run' : 'Walk';
            }
        }
        const isSeated = !isMoving && (!!this.seatConfig || (this.currentAnim && this.currentAnim.startsWith('Sit')));
        this.isSeated = isSeated;

        if (isSeated) {
            this.speedNorm = 0.0;
            this.targetSpeedNorm = 0.0;
        }

        // Continuous Biomechanical Blend Tree Pipeline (Argon Spec #2, #3, #6)
        if (isSeated) {
            // Precise biomechanical seating height derived from physical seat geometry (sitHeightOffset)
            const isFloorMat = this.seatConfig?.category === 'tatami' || this.seatConfig?.isFloorMat || (this.seatConfig?.sitHeightOffset !== undefined && this.seatConfig?.sitHeightOffset <= 0.1);
            const seatSurfaceOffset = (this.seatConfig?.sitHeightOffset !== undefined) ? this.seatConfig.sitHeightOffset : 0.44;
            const isHighStool = !!this.seatConfig?.isBarStool;
            let sitHipsY;
            if (isHighStool) {
                sitHipsY = 0.64;
            } else if (isFloorMat) {
                sitHipsY = 0.28;
            } else {
                sitHipsY = seatSurfaceOffset + 0.11;
            }

            const sitAnim = (this.currentAnim && this.currentAnim.startsWith('Sit'))
                ? this.currentAnim
                : (this.seatConfig?.defaultAnim || 'SitIdle');

            switch (sitAnim) {
                case 'SitIdle':
                case 'SitRelaxed':
                    AnimationLibrary.solveSitIdle(this.time, targets, sitHipsY, isHighStool);
                    break;
                case 'SitTyping':
                    AnimationLibrary.solveSitTyping(this.time, targets, sitHipsY, isHighStool);
                    break;
                case 'SitReading':
                    AnimationLibrary.solveSitReading(this.time, targets, sitHipsY, isHighStool);
                    break;
                case 'SitThinking':
                    AnimationLibrary.solveSitThinking(this.time, targets, sitHipsY, isHighStool);
                    break;
                case 'SitCoffee':
                    AnimationLibrary.solveSitCoffee(this.time, targets, sitHipsY, isHighStool);
                    break;
                case 'SitVibing':
                    AnimationLibrary.solveSitVibing(this.time, targets, sitHipsY, isHighStool);
                    break;
                case 'SitLookingAtView':
                    AnimationLibrary.solveSitLookingAtView(this.time, targets, sitHipsY, isHighStool);
                    break;
                default:
                    AnimationLibrary.solveSitIdle(this.time, targets, sitHipsY, isHighStool);
                    break;
            }
        } else {
            // 1. Solve Idle Ground Base
            const targetsIdle = {};
            AnimationLibrary.solveIdle(this.time, targetsIdle, this.restHipsY);

            // Standing Emotes overlay when idle
            if (!drinkTargets) {
                const activeAnim = (window.inworldHologramSystem?.currentTool && window.inworldHologramSystem.currentTool !== 'NONE' && (!this.currentAnim || this.currentAnim === 'Idle'))
                    ? 'Typing'
                    : this.currentAnim;

                switch (activeAnim) {
                    case 'Thinking':
                        AnimationLibrary.solveThinking(this.time, targetsIdle, this.restHipsY);
                        break;
                    case 'Reading':
                        AnimationLibrary.solveReading(this.time, targetsIdle, this.restHipsY);
                        break;
                    case 'Typing':
                        AnimationLibrary.solveTyping(this.time, targetsIdle, this.restHipsY);
                        break;
                    case 'Coffee':
                        AnimationLibrary.solveCoffee(this.time, targetsIdle, this.restHipsY);
                        break;
                    case 'Vibing':
                        AnimationLibrary.solveVibing(this.time, targetsIdle, this.restHipsY);
                        break;
                    case 'Celebrate':
                        AnimationLibrary.solveCelebrate(this.time, targetsIdle, this.restHipsY);
                        break;
                    case 'Wave':
                        AnimationLibrary.solveWave(this.time, targetsIdle, this.restHipsY);
                        break;
                    case 'Bow':
                        AnimationLibrary.solveBow(this.time, targetsIdle, this.restHipsY);
                        break;
                    case 'Meditate':
                    case 'Zen':
                        AnimationLibrary.solveMeditate(this.time, targetsIdle, this.restHipsY);
                        break;
                    case 'VibeDance':
                    case 'Dance':
                        const danceTime = (this.phaseLockEmoteTime !== undefined && this.phaseLockEmoteTime !== null) ? this.phaseLockEmoteTime : this.time;
                        AnimationLibrary.solveVibeDance(danceTime, targetsIdle, this.restHipsY);
                        break;
                    case 'PhotoPose':
                        AnimationLibrary.solvePhotoPose(this.time, targetsIdle, this.restHipsY);
                        break;
                    case 'Stretch':
                        AnimationLibrary.solveStretch(this.time, targetsIdle, this.restHipsY);
                        break;
                    case 'Chatting':
                        AnimationLibrary.solveChatting(this.time, targetsIdle, this.restHipsY);
                        break;
                    case 'Idle':
                    default:
                        break;
                }
            }

            // 2. Continuous Locomotion Blend Tree (Argon Spec #2 - Hermite smoothstep between Idle and Locomotion)
            const tLoco = THREE.MathUtils.clamp((this.speedNorm - 0.01) / 0.17, 0, 1);
            const wLoco = tLoco * tLoco * (3.0 - 2.0 * tLoco);

            const groundTargets = {};
            if (wLoco > 0.001) {
                const targetsLoco = {};
                this.solveLocomotion(delta, targetsLoco, wLoco);

                for (const bone in targetsIdle) {
                    groundTargets[bone] = { ...targetsIdle[bone] };
                }
                for (const bone in targetsLoco) {
                    const idl = targetsIdle[bone];
                    const loc = targetsLoco[bone];
                    if (!idl) {
                        groundTargets[bone] = { ...loc };
                    } else {
                        groundTargets[bone] = {
                            x: THREE.MathUtils.lerp(idl.x || 0, loc.x || 0, wLoco),
                            y: THREE.MathUtils.lerp(idl.y || 0, loc.y || 0, wLoco),
                            z: THREE.MathUtils.lerp(idl.z || 0, loc.z || 0, wLoco)
                        };
                        if (idl.posY !== undefined || loc.posY !== undefined) {
                            groundTargets[bone].posY = THREE.MathUtils.lerp(idl.posY ?? this.restHipsY, loc.posY ?? this.restHipsY, wLoco);
                        }
                        if (idl.posX !== undefined || loc.posX !== undefined) {
                            groundTargets[bone].posX = THREE.MathUtils.lerp(idl.posX ?? 0, loc.posX ?? 0, wLoco);
                        }
                    }
                }
            } else {
                for (const bone in targetsIdle) {
                    groundTargets[bone] = { ...targetsIdle[bone] };
                }
            }

            // 3. Continuous Airborne Blend (Argon Spec #3 - zero-hitch smooth air entry/exit)
            const targetAir = (this.jumpState === 'AIRBORNE') ? 1.0 : 0.0;
            this.airBlendWeight += (targetAir - this.airBlendWeight) * (1 - Math.exp(-delta * 14.0));
            if (this.jumpState === 'AIRBORNE') {
                this.airTime += delta;
            } else if (this.airBlendWeight < 0.01) {
                this.airTime = 0;
            }

            if (this.airBlendWeight > 0.001) {
                const targetsAir = {};
                AnimationLibrary.solveJumpAirborne(this.jumpVerticalVelocity, targetsAir, this.restHipsY, this.airTime);
                const wAir = this.airBlendWeight;

                for (const bone in groundTargets) {
                    targets[bone] = { ...groundTargets[bone] };
                }
                for (const bone in targetsAir) {
                    const gnd = groundTargets[bone];
                    const air = targetsAir[bone];
                    if (!gnd) {
                        targets[bone] = { ...air };
                    } else {
                        targets[bone] = {
                            x: THREE.MathUtils.lerp(gnd.x || 0, air.x || 0, wAir),
                            y: THREE.MathUtils.lerp(gnd.y || 0, air.y || 0, wAir),
                            z: THREE.MathUtils.lerp(gnd.z || 0, air.z || 0, wAir)
                        };
                        if (gnd.posY !== undefined || air.posY !== undefined) {
                            targets[bone].posY = THREE.MathUtils.lerp(gnd.posY ?? this.restHipsY, air.posY ?? this.restHipsY, wAir);
                        }
                        if (gnd.posX !== undefined || air.posX !== undefined) {
                            targets[bone].posX = THREE.MathUtils.lerp(gnd.posX ?? 0, air.posX ?? 0, wAir);
                        }
                    }
                }
            } else {
                for (const bone in groundTargets) {
                    targets[bone] = { ...groundTargets[bone] };
                }
            }

            // 4. Additive Landing Spring (Argon Spec #6 - Damped Harmonic Gamma Impulse)
            if (this.landingSpringTime < 0.65) {
                this.landingSpringTime += delta;
                const t = this.landingSpringTime;
                const tau = 0.065; // Peak compression at 65ms
                const envelope = (t / tau) * Math.exp(1.0 - t / tau);
                const rebound = Math.cos(t * 9.5);
                const squashFactor = this.landingImpactIntensity * envelope * rebound;

                if (targets.Hips) {
                    targets.Hips.posY = (targets.Hips.posY !== undefined ? targets.Hips.posY : this.restHipsY) - 0.16 * squashFactor;
                    targets.Hips.x = (targets.Hips.x || 0) + 0.18 * squashFactor;
                }
                if (targets.Spine) {
                    targets.Spine.x = (targets.Spine.x || 0) + 0.24 * squashFactor;
                }
                if (targets.LeftLowerLeg) {
                    targets.LeftLowerLeg.x = (targets.LeftLowerLeg.x || 0) + 0.40 * Math.max(0, squashFactor);
                }
                if (targets.RightLowerLeg) {
                    targets.RightLowerLeg.x = (targets.RightLowerLeg.x || 0) + 0.40 * Math.max(0, squashFactor);
                }
                if (targets.LeftUpperLeg) {
                    targets.LeftUpperLeg.x = (targets.LeftUpperLeg.x || 0) - 0.20 * Math.max(0, squashFactor);
                }
                if (targets.RightUpperLeg) {
                    targets.RightUpperLeg.x = (targets.RightUpperLeg.x || 0) - 0.20 * Math.max(0, squashFactor);
                }
            }
        }

        // Controlled Upper Body Layer: Overlay drinking or item carrying pose cleanly over any lower body posture
        if (drinkTargets) {
            if (drinkTargets.RightUpperArm) targets.RightUpperArm = drinkTargets.RightUpperArm;
            if (drinkTargets.RightLowerArm) targets.RightLowerArm = drinkTargets.RightLowerArm;
            if (drinkTargets.RightHand) targets.RightHand = drinkTargets.RightHand;
            if (drinkTargets.Head) targets.Head = drinkTargets.Head;
        } else if (window.inworldHologramSystem?.currentTool !== 'NONE') {
            // Upper body maintains typing posture on floating hologram while walking
            const tapL = Math.sin(this.time * 11.0) * 0.035;
            const tapR = Math.cos(this.time * 13.0) * 0.035;
            targets.LeftUpperArm = { x: -0.42, y: 0.15, z: -1.25 };
            targets.RightUpperArm = { x: -0.42, y: -0.15, z: 1.25 };
            targets.LeftLowerArm = { x: -0.18, y: -1.22 + tapL, z: 0.35 };
            targets.RightLowerArm = { x: -0.18, y: 1.22 + tapR, z: -0.35 };
            targets.LeftHand = { x: 0.16, y: 0, z: -0.02 };
            targets.RightHand = { x: 0.16, y: 0, z: 0.02 };
        } else if (this.currentHandPose && this.currentHandPose !== 'empty_hand') {
            // Natural relaxed carry posture:
            // Upper arm rests comfortably down beside ribcage with gentle gait damping / breath
            const breathSway = Math.sin(this.time * 1.8) * 0.008;
            const carrySway = Math.sin(this.gaitPhase) * (0.018 * this.speedNorm);
            targets.RightUpperArm = { x: -0.14 + carrySway, y: 0.24, z: 1.34 + breathSway };
            // Forearm flexed comfortably forward and slightly inward at waist height (~65° bend)
            targets.RightLowerArm = { x: -0.18, y: 1.08 - carrySway * 0.25, z: -0.22 - breathSway };
            targets.RightHand = { x: 0.12, y: -0.18, z: 0.35 };
            // Left arm relaxes naturally beside torso (eliminates the rigid A-pose)
            if (this.currentAnim === 'Idle' || !targets.LeftUpperArm) {
                targets.LeftUpperArm = { x: -0.08, y: 0.02, z: -1.28 - breathSway };
                targets.LeftLowerArm = { x: -0.04, y: -0.15, z: 0.15 };
            }
        }

        // Update Secondary Motion Physics & Spring-Damper Dynamics (Smooth continuous LOD blend)
        const physicsWeight = lodOptions.physicsWeight !== undefined ? lodOptions.physicsWeight : (lodOptions.skipSecondaryMotion ? 0.0 : 1.0);
        if (this.secondaryMotion && physicsWeight > 0.001) {
            const rootPos = rootObj?.position;
            this.secondaryMotion.update(delta, rootPos, rootObj?.rotation?.y || 0, 0.6 * physicsWeight);
            const spineFollow = this.secondaryMotion.getSpineFollowThrough();
            if (spineFollow) {
                if (targets.Spine) {
                    targets.Spine.x = (targets.Spine.x || 0) + spineFollow.pitch * 0.7 * physicsWeight;
                    targets.Spine.z = (targets.Spine.z || 0) + spineFollow.roll * 0.7 * physicsWeight;
                    targets.Spine.y = (targets.Spine.y || 0) - spineFollow.turnLag * 0.4 * physicsWeight;
                }
                if (targets.Head) {
                    targets.Head.z = (targets.Head.z || 0) + spineFollow.roll * 0.3 * physicsWeight;
                    targets.Head.y = (targets.Head.y || 0) - spineFollow.turnLag * 0.6 * physicsWeight;
                }
            }
        }

        // Cache raw targets for crossfade transitions
        this.lastRawTargets = JSON.parse(JSON.stringify(targets));

        // 0.35s S-Curve Animation Crossfader (Eliminates abrupt snapping between animations/emotes)
        if (this.isCrossfading && this.prevTargets) {
            this.crossfadeElapsed += delta;
            const progress = Math.min(1.0, this.crossfadeElapsed / this.crossfadeDuration);
            // Cubic Hermite smoothstep S-curve ease (3p^2 - 2p^3)
            const sCurve = progress * progress * (3.0 - 2.0 * progress);
            
            for (const boneName in this.prevTargets) {
                const prev = this.prevTargets[boneName];
                const next = targets[boneName];
                if (prev && next) {
                    if (typeof prev.x === 'number' && typeof next.x === 'number') {
                        next.x = prev.x + (next.x - prev.x) * sCurve;
                        next.y = prev.y + (next.y - prev.y) * sCurve;
                        next.z = prev.z + (next.z - prev.z) * sCurve;
                    }
                    if (prev.posY !== undefined && next.posY !== undefined) {
                        next.posY = prev.posY + (next.posY - prev.posY) * sCurve;
                    }
                }
            }
            if (progress >= 1.0) {
                this.isCrossfading = false;
            }
        }

        // Apply smoothed targets to semantic bones
        const blendFactor = Math.min(1.0, delta * 16.0);
        const hips = this.mappedBones.Hips;

        if (targets.Hips && hips) {
            if (targets.Hips.posY !== undefined) {
                hips.position.y += (targets.Hips.posY - hips.position.y) * blendFactor;
            }
            if (targets.Hips.posX !== undefined) {
                hips.position.x += (targets.Hips.posX - hips.position.x) * blendFactor;
            }
        }

        for (const boneName in targets) {
            const bone = this.mappedBones[boneName];
            if (!bone) continue;

            const t = targets[boneName];
            const cur = this.currentRots[boneName] || { x: bone.rotation.x, y: bone.rotation.y, z: bone.rotation.z };

            cur.x += (t.x - cur.x) * blendFactor;
            cur.y += (t.y - cur.y) * blendFactor;
            cur.z += (t.z - cur.z) * blendFactor;

            bone.rotation.set(cur.x, cur.y, cur.z);
            this.currentRots[boneName] = cur;
        }

        // Procedural Skirt Draping & Inverse-Kinematic Cloth Compensation
        // In VRoid models, SkirtFront and SkirtBack are children of UpperLeg.
        // When legs pitch/rotate (sitting or walking), we must counteract the parent leg's
        // rotation on SkirtBack to prevent the back of the skirt from sticking horizontally
        // through chair backrests or flying up like Marilyn Monroe.
        const isSitting = this.currentAnim.startsWith('Sit');
        const lLeg = this.mappedBones.LeftUpperLeg;
        const rLeg = this.mappedBones.RightUpperLeg;

        if (lLeg && rLeg) {
            _invLLeg.copy(lLeg.quaternion).invert();
            _invRLeg.copy(rLeg.quaternion).invert();

            const isHighStool = this.seatConfig?.isBarStool || false;
            const isFloorMat = this.seatConfig?.category === 'tatami' || this.seatConfig?.isFloorMat || (this.seatConfig?.sitHeightOffset !== undefined && this.seatConfig?.sitHeightOffset <= 0.1);

            this.solveDynamicSkirtPhysics(isSitting, isHighStool, isFloorMat);
        }

        // Apply procedural hand pose finger curls (small_can grip / empty_hand)
        if (!lodOptions.skipFingerCurl) {
            this.applyFingerCurl(delta);
        }

        // Apply secondary hair and skirt dynamics
        this.solveSecondaryMotion(delta, lodOptions);

        // Apply dynamic katana & scabbard clearance for Kimono Robin
        this.solveDynamicKatanaClearance();
    }

    /**
     * DYNAMIC KATANA & SCABBARD CLEARANCE SOLVER (Kimono Robin / Ronin)
     * Automatically cants the scabbard exterior to the thigh during sitting, walking, running, and jumping,
     * preventing any clipping through the skirt cloth, thigh mesh, or chair seat.
     */
    solveDynamicKatanaClearance() {
        const root = this.model?.parent || this.model;
        if (!root) return;
        const katanaAnchor = root.getObjectByName('katana_scabbard_anchor');
        if (!katanaAnchor) return;

        const leftLeg = this.mappedBones.LeftUpperLeg;
        const legPitch = leftLeg ? leftLeg.rotation.x : 0;
        // In Three.js humanoid rig, thigh swing forward/up corresponds to negative rotation.x:
        const legForward = Math.max(0, -legPitch);
        const isSitting = this.isSeated || (this.currentAnim && this.currentAnim.startsWith('Sit'));

        if (isSitting) {
            katanaAnchor.rotation.x = 0.58 + legForward * 0.05;
            katanaAnchor.rotation.z = 0.22;
            katanaAnchor.position.z = -0.015;
            katanaAnchor.position.x = -0.135; // slightly wider clearance along hip
        } else {
            // Standing, walking, sprinting, jumping: dynamic outward yaw/roll following thigh swing
            katanaAnchor.rotation.x = 0.35 + legForward * 0.18;
            katanaAnchor.rotation.z = 0.18 + legForward * 0.10;
            katanaAnchor.position.z = 0.010 - legForward * 0.018;
            katanaAnchor.position.x = -0.125 - legForward * 0.012;
        }
    }

    /**
     * Solves procedural thigh compensation and draped resting poses across skirt segments.
     * Evaluated every frame on the current pose to ensure tight collision adherence at 30-144Hz.
     */
    solveDynamicSkirtPhysics(isSitting, isHighStool, isFloorMat) {
        // 1. SkirtBack: Cancel leg pitch when sitting on chair/bench.
        // On tatami/floor mats in Seiza, drape radially along calves and mat surface.
        // When walking/standing, compensate leg swing so skirt back hangs naturally straight down under gravity.
        if (this.skirtBones.back.length > 0) {
            for (let i = 0; i < this.skirtBones.back.length; i++) {
                const b = this.skirtBones.back[i];
                const isLeft = b.name.includes('_L_');
                const invLeg = isLeft ? _invLLeg : _invRLeg;
                if (b.name.includes('SkirtBack0')) {
                    if (isSitting) {
                        if (isFloorMat) {
                            // Radial segment draping for Seiza on floor mat:
                            b.quaternion.copy(b.userData.restQuaternion);
                            if (b.name.includes('_01')) {
                                b.rotateX(0.05);
                                b.rotateZ(isLeft ? 0.10 : -0.10);
                            } else if (b.name.includes('_02')) {
                                b.rotateX(0.10);
                                b.rotateZ(isLeft ? 0.05 : -0.05);
                            } else if (b.name.includes('_03')) {
                                b.rotateX(0.15);
                                b.rotateZ(isLeft ? -0.12 : 0.12);
                            } else if (b.name.includes('_04')) {
                                b.rotateX(0.20);
                                b.rotateZ(isLeft ? -0.22 : 0.22);
                            }
                        } else {
                            // On standard chair/bench: Cancel leg pitch so skirt rests against chair backrest
                            b.quaternion.copy(invLeg).multiply(b.userData.restQuaternion);
                        }
                    } else {
                        // In standing/locomotion: compensate parent leg rotation so the skirt hangs straight down
                        _compQuat.copy(invLeg).multiply(b.userData.restQuaternion);
                        b.quaternion.copy(_compQuat);
                    }
                } else {
                    // Child segments of SkirtBack chain (SkirtBack1, SkirtBack2)
                    b.quaternion.copy(b.userData.restQuaternion);
                    if (isFloorMat && isSitting) {
                        b.rotateX(0.05);
                    }
                }
            }
        }

        // 2. SkirtFront: Follow thigh forward and drape naturally downward along gravity over lap and knees
        if (this.skirtBones.front.length > 0) {
            if (isSitting) {
                if (isFloorMat) {
                    for (let i = 0; i < this.skirtBones.front.length; i++) {
                        const b = this.skirtBones.front[i];
                        const isLeft = b.name.includes('_L_');
                        b.quaternion.copy(b.userData.restQuaternion);
                        if (b.name.includes('SkirtFront0')) {
                            b.rotateX(0.20);
                            b.rotateZ(isLeft ? -0.12 : 0.12);
                        } else if (b.name.includes('SkirtFront1')) {
                            b.rotateX(0.22);
                            b.rotateZ(isLeft ? -0.08 : 0.08);
                        } else if (b.name.includes('SkirtFront2') && !b.name.includes('end')) {
                            b.rotateX(0.18);
                            b.rotateZ(isLeft ? -0.05 : 0.05);
                        }
                    }
                } else {
                    const f0 = isHighStool ? 0.12 : 0.18;
                    const f1 = isHighStool ? 0.42 : 0.52;
                    const f2 = isHighStool ? 0.48 : 0.62;
                    const z0 = isHighStool ? 0.12 : 0.18;
                    const z1 = isHighStool ? 0.22 : 0.32;
                    const z2 = isHighStool ? 0.18 : 0.26;

                    for (let i = 0; i < this.skirtBones.front.length; i++) {
                        const b = this.skirtBones.front[i];
                        const isLeft = b.name.includes('_L_');
                        b.quaternion.copy(b.userData.restQuaternion);
                        if (b.name.includes('SkirtFront0')) {
                            b.rotateX(f0);
                            b.rotateZ(isLeft ? z0 : -z0);
                        } else if (b.name.includes('SkirtFront1')) {
                            b.rotateX(f1);
                            b.rotateZ(isLeft ? z1 : -z1);
                        } else if (b.name.includes('SkirtFront2') && !b.name.includes('end')) {
                            b.rotateX(f2);
                            b.rotateZ(isLeft ? z2 : -z2);
                        }
                    }
                }
            } else {
                for (let i = 0; i < this.skirtBones.front.length; i++) {
                    const b = this.skirtBones.front[i];
                    const isLeft = b.name.includes('_L_');
                    b.quaternion.copy(b.userData.restQuaternion);
                    // Gentle neat inward drape along front
                    if (b.name.includes('SkirtFront0')) {
                        b.rotateZ(isLeft ? -0.04 : 0.04);
                    } else if (b.name.includes('SkirtFront1')) {
                        b.rotateZ(isLeft ? -0.03 : 0.03);
                    }
                }
            }
        }

        // 3. SkirtSide: Pull forward along thighs and hug inward to drape naturally along seat
        if (this.skirtBones.side.length > 0) {
            if (isSitting) {
                const sZ1 = isFloorMat ? -0.06 : (isHighStool ? 0.22 : 0.30);
                const sX1 = isFloorMat ? -0.25 : (isHighStool ? 0.10 : 0.15);
                const sZ2 = isFloorMat ? -0.04 : (isHighStool ? 0.18 : 0.24);
                const sX2 = isFloorMat ? -0.20 : (isHighStool ? 0.08 : 0.10);

                for (let i = 0; i < this.skirtBones.side.length; i++) {
                    const b = this.skirtBones.side[i];
                    const isLeft = b.name.includes('_L_');
                    b.quaternion.copy(b.userData.restQuaternion);
                    if (b.name.includes('SkirtSide1')) {
                        b.rotateZ(isFloorMat ? (isLeft ? sZ1 : -sZ1) : (isLeft ? -sZ1 : sZ1));
                        b.rotateX(sX1);
                    } else if (b.name.includes('SkirtSide2') && !b.name.includes('end')) {
                        b.rotateZ(isFloorMat ? (isLeft ? sZ2 : -sZ2) : (isLeft ? -sZ2 : sZ2));
                        b.rotateX(sX2);
                    }
                }
            } else {
                for (let i = 0; i < this.skirtBones.side.length; i++) {
                    const b = this.skirtBones.side[i];
                    const isLeft = b.name.includes('_L_');
                    b.quaternion.copy(b.userData.restQuaternion);
                    // Gentle inward adduction: reduces outward bell-tent puff for an elegant tailored silhouette
                    if (b.name.includes('SkirtSide1')) {
                        b.rotateZ(isLeft ? 0.08 : -0.08);
                    } else if (b.name.includes('SkirtSide2') && !b.name.includes('end')) {
                        b.rotateZ(isLeft ? 0.06 : -0.06);
                    }
                }
            }
        }
    }

    /**
     * Fixed-Timestep Spring Physics Sub-step (Semi-Implicit Symplectic Euler)
     * Argon Task #2: Guaranteed multi-Hz determinism (30 / 60 / 120 FPS) and anti-death-spiral stability.
     */
    stepSpringPhysicsFixed(dt, lodOptions = {}) {
        this.physicsTime += dt;
        const speed = this.speedNorm;
        const cadence = THREE.MathUtils.lerp(8.2, 13.6, THREE.MathUtils.clamp((speed - 0.35) / 0.65, 0, 1));
        this.physicsGaitPhase = ((this.physicsGaitPhase || 0) + dt * cadence) % (Math.PI * 2);

        // 1. Procedural Hair & Ribbon Secondary Motion with Spring Dynamics & Global Wind
        if (!lodOptions.skipHairSprings && this.hairBones && this.hairBones.length > 0) {
            const windPhase = this.physicsTime * 2.2;
            const windPitch = Math.sin(windPhase) * 0.05 + Math.cos(windPhase * 1.7) * 0.025;
            const motionInertia = -(speed * 0.28);
            const bounce = Math.sin(this.physicsGaitPhase * 2) * (0.025 * speed);

            const targetPitch = motionInertia + windPitch + bounce;

            for (let i = 0; i < this.hairBones.length; i++) {
                const b = this.hairBones[i];
                const cur = b.userData.springAngle || 0;
                const vel = b.userData.springVel || 0;
                const force = (targetPitch - cur) * 42.0;
                const damping = vel * 8.5;
                // Semi-Implicit (Symplectic) Euler:
                const newVel = vel + (force - damping) * dt;
                const newAngle = cur + newVel * dt;
                b.userData.springAngle = newAngle;
                b.userData.springVel = newVel;
            }
        }

        // 2. Skirt Standing / Running Inertia Spring Dynamics (Semi-Implicit Euler)
        const isSitting = this.currentAnim?.startsWith('Sit');
        if (!isSitting) {
            const skirtWind = Math.sin(this.physicsTime * 1.9) * 0.020;
            const skirtTarget = -(speed * 0.08) + skirtWind;
            const skirtForce = (skirtTarget - this.skirtInertiaAngle) * 36.0;
            const skirtDamping = this.skirtInertiaVel * 9.0;
            this.skirtInertiaVel += (skirtForce - skirtDamping) * dt;
            this.skirtInertiaAngle += this.skirtInertiaVel * dt;
        } else {
            this.skirtInertiaAngle = 0;
            this.skirtInertiaVel = 0;
        }
    }

    solveSecondaryMotion(delta, lodOptions = {}) {
        const pWeight = lodOptions.physicsWeight !== undefined ? lodOptions.physicsWeight : (lodOptions.skipHairSprings ? 0.0 : 1.0);

        // System-level Early-Exit CPU Culling: When distant (physicsWeight <= 0.001), skip all math
        if (pWeight <= 0.001) {
            if (!this.isSecondaryResetToRest) {
                if (this.hairBones) {
                    for (let i = 0; i < this.hairBones.length; i++) {
                        this.hairBones[i].quaternion.copy(this.hairBones[i].userData.restQuaternion);
                    }
                }
                this.isSecondaryResetToRest = true;
            }
            return;
        }
        this.isSecondaryResetToRest = false;

        // Accumulator Loop with anti-death-spiral clamping (Argon Task #2)
        const clampedDelta = delta > MAX_PHYSICS_DELTA ? MAX_PHYSICS_DELTA : delta;
        this.physicsAccumulator = (this.physicsAccumulator || 0) + clampedDelta;
        while (this.physicsAccumulator >= FIXED_PHYSICS_DT) {
            this.stepSpringPhysicsFixed(FIXED_PHYSICS_DT, lodOptions);
            this.physicsAccumulator -= FIXED_PHYSICS_DT;
        }

        // Render pass: Apply fixed-step simulated angles to hair bones with continuous S-curve blend
        if (this.hairBones && this.hairBones.length > 0) {
            if (pWeight > 0.001) {
                const windPhase = this.time * 2.2;
                const windYaw = Math.sin(windPhase * 1.3) * 0.04 * pWeight;
                for (let i = 0; i < this.hairBones.length; i++) {
                    const b = this.hairBones[i];
                    b.quaternion.copy(b.userData.restQuaternion);
                    b.rotateX((b.userData.springAngle || 0) * pWeight);
                    b.rotateZ(windYaw);
                }
            } else {
                for (let i = 0; i < this.hairBones.length; i++) {
                    const b = this.hairBones[i];
                    b.quaternion.copy(b.userData.restQuaternion);
                }
            }
        }

        // Render pass: Apply skirt inertia and gait sway with continuous S-curve blend
        const isSitting = this.currentAnim?.startsWith('Sit');
        if (!isSitting && this.skirtBones) {
            const skirtInertia = (this.skirtInertiaAngle || 0) * pWeight;
            const sideFlare = (this.speedNorm * 0.04) * pWeight;
            const walkSway = Math.sin(this.gaitPhase) * (0.026 * this.speedNorm) * pWeight;

            if (this.skirtBones.front) {
                for (let i = 0; i < this.skirtBones.front.length; i++) {
                    const b = this.skirtBones.front[i];
                    b.rotateX(skirtInertia);
                    b.rotateZ(walkSway * 0.35);
                }
            }
            if (this.skirtBones.back) {
                for (let i = 0; i < this.skirtBones.back.length; i++) {
                    const b = this.skirtBones.back[i];
                    b.rotateX(-skirtInertia);
                    b.rotateZ(-walkSway * 0.35);
                }
            }
            if (this.skirtBones.side) {
                for (let i = 0; i < this.skirtBones.side.length; i++) {
                    const b = this.skirtBones.side[i];
                    const isLeft = b.name.includes('_L_');
                    b.rotateZ(isLeft ? (-sideFlare + walkSway) : (sideFlare + walkSway));
                    b.rotateX(skirtInertia * 0.25);
                }
            }
        }
    }

    solveLocomotion(delta, targets, wLoco = 1.0) {
        const speed = this.speedNorm;
        // Natural human walking cadence: 8.2 rad/s (~1.3Hz) at stroll up to 13.6 rad/s (~2.2Hz) at full sprint
        const cadence = THREE.MathUtils.lerp(8.2, 13.6, THREE.MathUtils.clamp((speed - 0.35) / 0.65, 0, 1));
        const prevPhase = this.gaitPhase;

        // Anti-Skating Stride Phase Settle:
        // When coming to a stop, advance gait phase towards the closest stable bilateral stance (0 or PI)
        if (this.targetSpeedNorm === 0) {
            const targetPhase = (this.gaitPhase > Math.PI * 0.5 && this.gaitPhase < Math.PI * 1.5) ? Math.PI : (this.gaitPhase >= Math.PI * 1.5 ? Math.PI * 2 : 0);
            const diffPhase = targetPhase - this.gaitPhase;
            this.gaitPhase += diffPhase * Math.min(1.0, delta * 12.0);
            if (this.gaitPhase >= Math.PI * 2) this.gaitPhase = 0;
        } else {
            this.gaitPhase = (this.gaitPhase + delta * cadence) % (Math.PI * 2);
        }
        const p = this.gaitPhase;

        // Foot plant contact events (auditory footstep & ripple triggers)
        if (this.onFootPlant) {
            if (prevPhase < Math.PI && p >= Math.PI) {
                this.onFootPlant('left', speed > 0.65);
            } else if (p < prevPhase && prevPhase > Math.PI) {
                this.onFootPlant('right', speed > 0.65);
            }
        }

        // Amplitude scaling proportional to sqrt(wLoco) for natural takeoff / stopping ramp (Argon Spec #2)
        const strideScale = Math.sqrt(Math.max(0, wLoco));

        // 1. Torso Forward Lean & Dynamic Banking into Turns
        const totalLean = THREE.MathUtils.lerp(0.04, 0.22, THREE.MathUtils.clamp((speed - 0.35) / 0.65, 0, 1)) * strideScale;
        const spinePitch = totalLean * 0.55;
        const chestPitch = totalLean * 0.28;
        const upperChestPitch = totalLean * 0.17;

        // Pelvic Yaw & Counter-Twist
        const pelvicYaw = Math.sin(p) * (0.024 + 0.032 * speed) * strideScale;
        const chestTwist = -pelvicYaw * 0.70;
        const spineTwist = -pelvicYaw * 0.30;

        // Directional Turn Banking: Lean torso and chest naturally into turns
        const bankAngle = THREE.MathUtils.clamp((this.turnVelocity || 0) * -0.05, -0.12, 0.12) * THREE.MathUtils.clamp(speed * 1.5, 0.2, 1.0) * strideScale;

        // Pelvic Roll (Trendelenburg tilt): As stance leg accepts weight, hips roll ~3.5°
        const pelvicRoll = Math.cos(p) * (0.028 + 0.032 * speed) * strideScale;

        targets.Spine = { x: spinePitch, y: spineTwist, z: -pelvicRoll * 0.5 + bankAngle * 0.65 };
        targets.Chest = { x: chestPitch, y: chestTwist, z: -pelvicRoll * 0.25 + bankAngle * 0.35 };
        targets.UpperChest = { x: upperChestPitch, y: 0, z: bankAngle * 0.15 };

        // Head Gaze Compensation: Keep eyes level despite torso pitch and banking
        const headCompensation = -totalLean * 0.88;
        targets.Head = { x: headCompensation - 0.03, y: -chestTwist * 0.35, z: -bankAngle * 0.4 };
        targets.Neck = { x: -0.02 * speed * strideScale, y: 0, z: 0 };

        // Pelvis Dynamics: Vertical bobbing & lateral weight transfer
        const bobAmp = (0.016 + 0.024 * speed) * strideScale;
        const verticalBob = Math.sin(p * 2 - Math.PI / 2) * bobAmp + bobAmp * 0.5;
        const lateralAmp = (0.008 + 0.014 * speed) * strideScale;
        targets.Hips = {
            x: 0.02 + 0.04 * speed * strideScale,
            y: pelvicYaw,
            z: pelvicRoll + bankAngle * 0.4,
            posY: this.restHipsY + verticalBob,
            posX: (this.restHipsX || 0) + Math.sin(p) * lateralAmp
        };

        // 2. Legs: Stride and Organic Biphasic Knee Flexion (Argon Spec #4 - Double-Bump Curve)
        const strideAmp = THREE.MathUtils.lerp(0.44, 0.72, THREE.MathUtils.clamp((speed - 0.35) / 0.65, 0, 1)) * strideScale;
        const legSwingL = Math.sin(p) * strideAmp;
        const legSwingR = -Math.sin(p) * strideAmp;

        targets.LeftUpperLeg = { x: legSwingL, y: 0.02 * speed, z: -pelvicRoll * 0.4 };
        targets.RightUpperLeg = { x: legSwingR, y: -0.02 * speed, z: -pelvicRoll * 0.4 };

        // Biphasic knee angle solver:
        // Swing Phase: High knee lift during leg forward swing
        // Stance Phase: Impact cushion flexion when foot takes weight (shock absorption)
        const computeNaturalKneeAngle = (phase, spd) => {
            const swingWave = Math.max(0, Math.sin(phase - 0.5));
            const swingFlex = Math.pow(swingWave, 1.4) * (0.65 + 0.45 * spd);

            const stanceWindow = Math.max(0, -Math.sin(phase - 0.5));
            const stancePulse = Math.pow(Math.sin(stanceWindow * Math.PI), 2.0);
            const stanceFlex = stancePulse * (0.18 + 0.14 * spd);

            const microBend = 0.05;
            return (microBend + swingFlex + stanceFlex) * strideScale;
        };

        const kneeL = computeNaturalKneeAngle(p, speed);
        const kneeR = computeNaturalKneeAngle((p + Math.PI) % (Math.PI * 2), speed);
        targets.LeftLowerLeg = { x: kneeL, y: 0, z: 0 };
        targets.RightLowerLeg = { x: kneeR, y: 0, z: 0 };

        // 3. Biomechanical Foot Strike Rolling (Heel Strike -> Midstance -> Toe Push-off -> Swing)
        const computeFootPitch = (phase) => {
            if (phase < Math.PI * 0.45) {
                const t = phase / (Math.PI * 0.45);
                return THREE.MathUtils.lerp(0.24, -0.02, t);
            } else if (phase < Math.PI) {
                const t = (phase - Math.PI * 0.45) / (Math.PI * 0.55);
                return THREE.MathUtils.lerp(-0.02, -0.42, t);
            } else {
                const t = (phase - Math.PI) / Math.PI;
                return THREE.MathUtils.lerp(-0.42, 0.24, Math.sin(t * Math.PI * 0.5));
            }
        };

        const footPitchL = computeFootPitch(p) * THREE.MathUtils.lerp(0.85, 1.25, speed) * strideScale;
        const footPitchR = computeFootPitch((p + Math.PI) % (Math.PI * 2)) * THREE.MathUtils.lerp(0.85, 1.25, speed) * strideScale;

        targets.LeftFoot = { x: footPitchL, y: 0, z: 0 };
        targets.RightFoot = { x: footPitchR, y: 0, z: 0 };

        // 4. Upper Body Kinematic Chain: Clavicle -> UpperArm -> Forearm -> Wrist (Argon Spec #5)
        // Arms swing counter to legs: armPhase = p + Math.PI
        const armPhaseL = p + Math.PI;
        const armPhaseR = p;

        // Clavicle / Shoulder: Leads arm by +0.15 rad
        const clavicleBob = Math.cos(p * 2.0) * 0.025 * speed * strideScale;
        const clavicleY_L = Math.sin(armPhaseL + 0.15) * 0.08 * speed * strideScale;
        const clavicleY_R = Math.sin(armPhaseR + 0.15) * 0.08 * speed * strideScale;
        targets.LeftShoulder = { x: 0, y: clavicleY_L, z: -clavicleBob };
        targets.RightShoulder = { x: 0, y: clavicleY_R, z: clavicleBob };

        // Upper Arm
        const swingAmp = THREE.MathUtils.lerp(0.38, 0.54, THREE.MathUtils.clamp((speed - 0.35) / 0.65, 0, 1)) * strideScale;
        const swingL = Math.sin(armPhaseL) * swingAmp;
        const swingR = Math.sin(armPhaseR) * swingAmp;

        const inwardAmp = THREE.MathUtils.lerp(0.12, 0.20, THREE.MathUtils.clamp((speed - 0.35) / 0.65, 0, 1));
        const inwardL = Math.max(0, swingL) * inwardAmp;
        const inwardR = Math.max(0, swingR) * inwardAmp;

        targets.LeftUpperArm = { x: -swingL, y: inwardL * 0.38, z: -1.24 + inwardL * 0.30 };
        targets.RightUpperArm = { x: -swingR, y: -inwardR * 0.38, z: 1.24 - inwardR * 0.30 };

        // Forearm / Elbow: Lags UpperArm by -0.45 rad (Successive breaking of joints)
        const elbowBase = (0.16 + 0.50 * THREE.MathUtils.smoothstep(speed, 0.3, 1.0)) * strideScale;
        const elbowDynL = Math.sin(armPhaseL - 0.45) * 0.28 * speed * strideScale;
        const elbowDynR = Math.sin(armPhaseR - 0.45) * 0.28 * speed * strideScale;
        const pumpAmp = THREE.MathUtils.lerp(0.55, 0.85, THREE.MathUtils.clamp((speed - 0.35) / 0.65, 0, 1));

        targets.LeftLowerArm = { x: -0.06, y: -(elbowBase + Math.max(0, swingL) * pumpAmp + Math.max(0, elbowDynL)), z: 0 };
        targets.RightLowerArm = { x: -0.06, y: (elbowBase + Math.max(0, swingR) * pumpAmp + Math.max(0, elbowDynR)), z: 0 };

        // Wrist / Hand: Lags by -0.85 rad with drag follow-through
        const wristPitchL = Math.sin(armPhaseL - 0.85) * 0.14 * speed * strideScale;
        const wristPitchR = Math.sin(armPhaseR - 0.85) * 0.14 * speed * strideScale;
        const wristRollL  = (Math.cos(armPhaseL - 0.70) * 0.08 * speed - 0.04) * strideScale;
        const wristRollR  = (Math.cos(armPhaseR - 0.70) * 0.08 * speed + 0.04) * strideScale;

        targets.LeftHand = { x: wristPitchL, y: 0, z: wristRollL };
        targets.RightHand = { x: wristPitchR, y: 0, z: wristRollR };
    }
}

if (typeof window !== 'undefined') {
    window.AvatarRetargeter = AvatarRetargeter;
    window.AvatarFaceRig = AvatarFaceRig;
}
