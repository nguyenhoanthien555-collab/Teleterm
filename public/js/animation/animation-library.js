/**
 * ANIMATION LIBRARY — REUSABLE SEMANTIC PROCEDURAL ANIMATIONS & POSES
 * Implements Section 27, 28, 30, and 31 of TeleTerm Living Open World Master Spec v3.
 * Pure procedural biomechanical solvers targeting semantic bones.
 */

export class AnimationLibrary {
    /**
     * IDLE: Natural asymmetrical respiration and organic weight shifting micro-cycles
     */
    static solveIdle(time, targets, restHipsY = 0.75) {
        // 1. Asymmetrical Organic Respiration (38% inhale with anterior chest expansion, 62% relaxed exhale)
        const breathCycle = (time * 0.28) % 1.0;
        let breathExpansion = 0;
        if (breathCycle < 0.38) {
            const p = breathCycle / 0.38;
            breathExpansion = Math.sin(p * Math.PI * 0.5);
            breathExpansion *= breathExpansion; // Smooth quadratic ease-in-out
        } else {
            const p = (breathCycle - 0.38) / 0.62;
            breathExpansion = Math.cos(p * Math.PI * 0.5);
            breathExpansion *= breathExpansion; // Passive relaxation settling
        }
        const breathChest = breathExpansion * 0.024;
        const breathShoulder = breathExpansion * 0.016;

        // 2. Weight-Shift Micro-Cycles (gradual weight transfer between left/right feet every ~12s)
        const shiftCycle = Math.sin(time * 0.22);
        const weightShift = Math.tanh(shiftCycle * 2.2) * 0.018; // Soft plateau
        const hipRoll = -weightShift * 1.8;
        const spineCounterRoll = weightShift * 1.2;

        targets.Hips = {
            x: 0.01,
            y: weightShift * 0.4,
            z: hipRoll,
            posY: restHipsY + breathExpansion * 0.004,
            posX: weightShift
        };

        targets.Spine = { x: breathChest * 0.25, y: -weightShift * 0.3, z: spineCounterRoll };
        targets.Chest = { x: breathChest * 0.65, y: 0, z: spineCounterRoll * 0.5 };
        targets.UpperChest = { x: breathChest, y: 0, z: 0 };
        targets.Head = { x: -0.03 - breathChest * 0.15, y: weightShift * 0.2, z: -spineCounterRoll * 0.4 };
        targets.Neck = { x: 0, y: 0, z: 0 };

        // Shoulders rise subtly on inhale, relax on exhale
        targets.LeftShoulder = { x: 0, y: 0, z: -breathShoulder };
        targets.RightShoulder = { x: 0, y: 0, z: breathShoulder };

        // Subtle stance leg vs free leg relaxation during weight shift
        const kneeFlexL = Math.max(0, -weightShift * 1.8);
        const kneeFlexR = Math.max(0, weightShift * 1.8);
        targets.LeftUpperLeg = { x: -kneeFlexL * 0.5, y: 0, z: -hipRoll * 0.4 };
        targets.RightUpperLeg = { x: -kneeFlexR * 0.5, y: 0, z: -hipRoll * 0.4 };
        targets.LeftLowerLeg = { x: kneeFlexL, y: 0, z: 0 };
        targets.RightLowerLeg = { x: kneeFlexR, y: 0, z: 0 };
        targets.LeftFoot = { x: -kneeFlexL * 0.3, y: 0, z: 0 };
        targets.RightFoot = { x: -kneeFlexR * 0.3, y: 0, z: 0 };

        // Naturally hanging arms with relaxed natural posture along torso (no rigid A-pose flaring)
        targets.LeftUpperArm = { x: -0.08, y: 0.04, z: -1.26 - breathShoulder * 0.5 };
        targets.RightUpperArm = { x: -0.08, y: -0.04, z: 1.26 + breathShoulder * 0.5 };
        targets.LeftLowerArm = { x: -0.06, y: -0.18 - breathChest * 0.4, z: 0.12 };
        targets.RightLowerArm = { x: -0.06, y: 0.18 + breathChest * 0.4, z: -0.12 };
        targets.LeftHand = { x: -0.02, y: 0, z: -0.02 };
        targets.RightHand = { x: -0.02, y: 0, z: 0.02 };
    }

    /**
     * JUMP AIRBORNE: Continuous Hyperbolic Tangent Aerial Pose Solver
     * Implements continuous C1/C2 smooth aerial blending across vertical velocity spectrum vy in [-16, 6.5]
     * (Argon Biomechanics Spec #3 - eliminates discrete popping).
     */
    static solveJumpAirborne(verticalVelocity, targets, restHipsY = 0.75, airTime = 0) {
        const vy = verticalVelocity || 0;
        // Continuous mapping into [-1, 1] without derivative discontinuities
        const u = Math.tanh(vy / 3.5);
        const wRise = u > 0 ? (u * u) : 0;
        const wApex = 1.0 - (u * u);
        const wFall = u < 0 ? (u * u) : 0;

        // Subtle aerodynamic wind flutter on limbs at apex and descent
        const airFlutter = Math.sin((airTime || 0) * 14.0) * 0.025 * (wApex + wFall);

        // Continuous Torso Pitch: arched back slightly on upward thrust, neutral at apex, inclined forward on descent
        const torsoPitch = (-0.08 * wRise) + (0.04 * wApex) + (0.14 * wFall);
        targets.Hips = { x: torsoPitch * 0.5, y: 0, z: 0, posY: restHipsY };
        targets.Spine = { x: torsoPitch * 0.5, y: 0, z: 0 };
        targets.Chest = { x: torsoPitch * 0.3, y: 0, z: 0 };
        targets.UpperChest = { x: torsoPitch * 0.2, y: 0, z: 0 };
        // Head looks towards trajectory / landing target
        targets.Head = { x: (-0.06 * wRise) + (0.02 * wApex) + (0.16 * wFall), y: 0, z: 0 };
        targets.Neck = { x: 0.02, y: 0, z: 0 };

        // Continuous Organic Leg Motion:
        // Rise: Legs trail back with energetic toe thrust
        // Apex: Expressive anime tucked knees
        // Fall: Legs extend forward-downward preparing for impact cushion
        const leftUpperLegX  = (0.22 * wRise) + (-0.45 * wApex) + (-0.15 * wFall);
        const rightUpperLegX = (0.28 * wRise) + (-0.55 * wApex) + (-0.10 * wFall);
        const leftLowerLegX  = (0.65 * wRise) + (1.05 * wApex)  + (0.35 * wFall);
        const rightLowerLegX = (0.75 * wRise) + (1.25 * wApex)  + (0.30 * wFall);
        const leftFootX      = (-0.35 * wRise) + (-0.20 * wApex) + (0.15 * wFall);
        const rightFootX     = (-0.40 * wRise) + (-0.25 * wApex) + (0.18 * wFall);

        targets.LeftUpperLeg = { x: leftUpperLegX, y: 0.02, z: -0.08 };
        targets.RightUpperLeg = { x: rightUpperLegX, y: -0.02, z: 0.08 };
        targets.LeftLowerLeg = { x: leftLowerLegX, y: 0, z: 0 };
        targets.RightLowerLeg = { x: rightLowerLegX, y: 0, z: 0 };
        targets.LeftFoot = { x: leftFootX, y: 0, z: 0 };
        targets.RightFoot = { x: rightFootX, y: 0, z: 0 };

        // Continuous Arm Sweeping:
        // Rise: Swept upward & outward for momentum
        // Apex: Balanced wide mid-air wingspan
        // Fall: Lowering towards sides with gentle wrist drag
        const armPitch = (-0.75 * wRise) + (-0.55 * wApex) + (-0.28 * wFall);
        const armSpread = (1.65 * wRise) + (1.75 * wApex) + (1.45 * wFall) + airFlutter;
        targets.LeftUpperArm = { x: armPitch, y: 0.15, z: -armSpread };
        targets.RightUpperArm = { x: armPitch, y: -0.15, z: armSpread };
        targets.LeftLowerArm = { x: -0.22, y: -0.45, z: 0.15 };
        targets.RightLowerArm = { x: -0.22, y: 0.45, z: -0.15 };
        targets.LeftHand = { x: 0.05 * wFall, y: 0, z: -0.05 * wRise };
        targets.RightHand = { x: 0.05 * wFall, y: 0, z: 0.05 * wRise };
    }

    /**
     * LANDING SQUASH: Biomechanical impact absorption solver
     * Pelvis compresses downward, knees flex, torso absorbs shock, then springs back.
     */
    static solveLandingSquash(squashFactor = 0.08, targets, restHipsY = 0.75) {
        const s = Math.max(0, Math.min(0.20, squashFactor));
        // Pelvis compression
        targets.Hips = { x: s * 1.5, y: 0, z: 0, posY: restHipsY - s * 1.2 };
        targets.Spine = { x: s * 2.2, y: 0, z: 0 }; // Torso pitches forward to absorb momentum
        targets.Chest = { x: s * 1.6, y: 0, z: 0 };
        targets.UpperChest = { x: s * 0.8, y: 0, z: 0 };
        targets.Head = { x: s * 1.0, y: 0, z: 0 };
        targets.Neck = { x: s * 0.4, y: 0, z: 0 };

        // Knees cushion shock with forward and slight outward flexion
        const kneeBend = s * 7.5;
        targets.LeftUpperLeg = { x: -kneeBend * 0.55, y: 0.02, z: -0.06 };
        targets.RightUpperLeg = { x: -kneeBend * 0.55, y: -0.02, z: 0.06 };
        targets.LeftLowerLeg = { x: kneeBend, y: 0, z: 0 };
        targets.RightLowerLeg = { x: kneeBend, y: 0, z: 0 };
        targets.LeftFoot = { x: -s * 1.5, y: 0, z: 0 }; // Feet flat on ground
        targets.RightFoot = { x: -s * 1.5, y: 0, z: 0 };

        // Arms drop forward-down to cushion impact
        targets.LeftUpperArm = { x: -0.25 - s * 1.5, y: 0.10, z: -1.30 };
        targets.RightUpperArm = { x: -0.25 - s * 1.5, y: -0.10, z: 1.30 };
        targets.LeftLowerArm = { x: -0.12 - s * 1.2, y: -0.30, z: 0.12 };
        targets.RightLowerArm = { x: -0.12 - s * 1.2, y: 0.30, z: -0.12 };
        targets.LeftHand = { x: 0.06, y: 0, z: 0 };
        targets.RightHand = { x: 0.06, y: 0, z: 0 };
    }

    /**
     * THINKING: Standing reflection pose with hand to chin
     */
    static solveThinking(time, targets, restHipsY = 0.75) {
        const breath = Math.sin(time * 1.8) * 0.015;
        targets.Hips = { x: 0, y: 0, z: 0, posY: restHipsY };
        targets.Spine = { x: 0, y: 0, z: 0 };
        targets.Chest = { x: 0, y: 0, z: 0 };
        targets.UpperChest = { x: breath, y: 0, z: 0 };
        targets.Head = { x: 0.0, y: -0.16, z: 0.10 };
        targets.Neck = { x: 0, y: 0, z: 0 };

        targets.LeftUpperLeg = { x: 0, y: 0, z: 0 };
        targets.RightUpperLeg = { x: 0, y: 0, z: 0 };
        targets.LeftLowerLeg = { x: 0, y: 0, z: 0 };
        targets.RightLowerLeg = { x: 0, y: 0, z: 0 };
        targets.LeftFoot = { x: 0, y: 0, z: 0 };
        targets.RightFoot = { x: 0, y: 0, z: 0 };

        // Right hand to chin
        targets.RightUpperArm = { x: -1.15, y: 0.10, z: 1.45 };
        targets.RightLowerArm = { x: -0.20, y: -0.30, z: 1.85 };
        // Left arm resting at side with skirt clearance
        targets.LeftUpperArm = { x: -0.16, y: 0.08, z: -1.06 };
        targets.LeftLowerArm = { x: -0.12, y: -0.24, z: 0.06 };
        targets.LeftHand = { x: -0.05, y: 0, z: -0.04 };
        targets.RightHand = { x: 0, y: 0, z: 0 };
    }

    /**
     * TYPING: Ergonomic standing typing at interactive holographic terminal console
     */
    static solveTyping(time, targets, restHipsY = 0.75) {
        const tapL = Math.sin(time * 11.0) * 0.035;
        const tapR = Math.cos(time * 13.0) * 0.035;

        // Grounded standing legs (slight relaxed natural stance)
        targets.Hips = { x: 0.03, y: 0, z: 0, posY: restHipsY };
        targets.LeftUpperLeg = { x: 0, y: 0, z: -0.04 };
        targets.RightUpperLeg = { x: 0, y: 0, z: 0.04 };
        targets.LeftLowerLeg = { x: 0, y: 0, z: 0 };
        targets.RightLowerLeg = { x: 0, y: 0, z: 0 };
        targets.LeftFoot = { x: 0, y: 0, z: 0 };
        targets.RightFoot = { x: 0, y: 0, z: 0 };

        // Torso inclined slightly forward toward holographic console screen
        targets.Spine = { x: 0.06, y: 0, z: 0 };
        targets.Chest = { x: 0.04, y: 0, z: 0 };
        targets.UpperChest = { x: 0.02, y: 0, z: 0 };
        targets.Head = { x: 0.18, y: 0, z: 0 }; // Looking down at console / holographic keys
        targets.Neck = { x: 0.03, y: 0, z: 0 };

        // Upper arms held close to ribcage, reaching slightly forward towards kiosk console (no flared T-pose)
        targets.LeftUpperArm = { x: -0.46, y: 0.12, z: -1.20 };
        targets.RightUpperArm = { x: -0.46, y: -0.12, z: 1.20 };
        // Forearms horizontal forward over console surface, reaching inward towards holographic keys
        targets.LeftLowerArm = { x: -0.18 + tapL, y: -0.76, z: 0.16 };
        targets.RightLowerArm = { x: -0.18 + tapR, y: 0.76, z: -0.16 };
        // Hands hovering over holographic keyboard with animated typing tap cycles
        targets.LeftHand = { x: 0.16, y: 0, z: -0.02 };
        targets.RightHand = { x: 0.16, y: 0, z: 0.02 };
    }

    /**
     * VIBING: Relaxed musical head and torso groove
     */
    static solveVibing(time, targets, restHipsY = 0.75) {
        const nod = Math.sin(time * 4.2) * 0.12;
        const sway = Math.sin(time * 2.1) * 0.05;

        targets.Hips = { x: 0, y: sway * 0.5, z: 0, posY: restHipsY + Math.abs(nod) * 0.01 };
        targets.Spine = { x: 0.02, y: sway, z: 0 };
        targets.Chest = { x: 0, y: sway, z: 0 };
        targets.UpperChest = { x: nod * 0.3, y: 0, z: 0 };
        targets.Head = { x: nod, y: sway * 0.8, z: 0 };

        targets.LeftUpperArm = { x: -0.16, y: 0.08, z: -1.08 + sway * 0.08 };
        targets.RightUpperArm = { x: -0.16, y: -0.08, z: 1.08 - sway * 0.08 };
        targets.LeftLowerArm = { x: -0.10, y: -0.28, z: 0.05 };
        targets.RightLowerArm = { x: -0.10, y: 0.28, z: -0.05 };
    }

    /**
     * COFFEE: Holding coffee mug and taking occasional sips
     */
    static solveCoffee(time, targets, restHipsY = 0.75) {
        const sipCycle = (time * 0.4) % (Math.PI * 2);
        const isSipping = Math.sin(sipCycle) > 0.65;
        const sipBlend = Math.max(0, (Math.sin(sipCycle) - 0.65) / 0.35);

        targets.Hips = { x: 0, y: 0, z: 0, posY: restHipsY };
        targets.Head = { x: isSipping ? -0.15 * sipBlend : -0.02, y: 0, z: 0 };

        // Right arm holding mug up to mouth when sipping
        const armX = THREE_LERP(-0.55, -1.05, sipBlend);
        const armZ = THREE_LERP(0.65, 0.95, sipBlend);
        targets.RightUpperArm = { x: armX, y: -0.25, z: armZ };
        targets.RightLowerArm = { x: -0.15, y: 0.85 + sipBlend * 0.35, z: -0.25 };

        // Left arm relaxed with skirt clearance
        targets.LeftUpperArm = { x: -0.16, y: 0.08, z: -1.06 };
        targets.LeftLowerArm = { x: -0.12, y: -0.24, z: 0.06 };
        targets.LeftHand = { x: -0.05, y: 0, z: -0.04 };
    }

    /**
     * DRINKING POSE SOLVER: Explicit mouth alignment with anatomically accurate arm raise,
     * elbow flexion, wrist tilt toward lips, and head tilt back.
     * Implements Sections 13, 14, 15 of Master Interaction & Inventory Spec.
     */
    static solveDrinkingPose(raiseFactor, tiltFactor, targets, restHipsY = 0.75) {
        const s = raiseFactor * raiseFactor * (3 - 2 * raiseFactor);
        const t = tiltFactor * tiltFactor * (3 - 2 * tiltFactor);

        if (targets.Hips && targets.Hips.posY === undefined) {
            targets.Hips = { x: 0, y: 0, z: 0, posY: restHipsY };
        }
        // Head tilts gently back to drink as can reaches mouth
        targets.Head = { x: -0.22 * t, y: 0, z: 0 };

        // Right arm raises smoothly from idle to mouth
        const armX = THREE_LERP(-0.16, -1.20, s);
        const armY = THREE_LERP(-0.08, 1.10, s);
        const armZ = THREE_LERP(1.06, 0.94, s);

        // Forearm flexes upward and inward directly toward the lips
        const foreX = THREE_LERP(-0.12, -0.16, s);
        const foreY = THREE_LERP(0.24, 2.20, s);
        const foreZ = THREE_LERP(-0.06, 0.10, s);

        // Wrist tilts can rim to mouth contact
        const handX = THREE_LERP(-0.05, -0.48, s);
        const handY = THREE_LERP(0.0, -0.56, s);
        const handZ = THREE_LERP(0.04, -0.48, s);

        targets.RightUpperArm = { x: armX, y: armY, z: armZ };
        targets.RightLowerArm = { x: foreX, y: foreY, z: foreZ };
        targets.RightHand = { x: handX, y: handY, z: handZ };

        if (!targets.LeftUpperArm) {
            targets.LeftUpperArm = { x: -0.16, y: 0.08, z: -1.06 };
            targets.LeftLowerArm = { x: -0.12, y: -0.24, z: 0.06 };
            targets.LeftHand = { x: -0.05, y: 0, z: -0.04 };
        }
    }

    /**
     * DRINK CAN: One-shot progress evaluation
     */
    static solveDrinkCan(progress, targets, restHipsY = 0.75) {
        const p = Math.max(0, Math.min(1, progress));
        let raiseFactor = 0;
        let tiltFactor = 0;

        if (p < 0.35) {
            raiseFactor = p / 0.35;
            tiltFactor = raiseFactor * 0.5;
        } else if (p < 0.70) {
            raiseFactor = 1.0;
            const sipProgress = (p - 0.35) / 0.35;
            tiltFactor = 0.5 + Math.sin(sipProgress * Math.PI) * 0.5;
        } else {
            raiseFactor = 1.0 - (p - 0.70) / 0.30;
            tiltFactor = raiseFactor * 0.5;
        }

        this.solveDrinkingPose(raiseFactor, tiltFactor, targets, restHipsY);
    }

    /**
     * CELEBRATE: Both arms raised triumphantly
     */
    static solveCelebrate(time, targets, restHipsY = 0.75) {
        const bounce = Math.sin(time * 6.0) * 0.03;
        targets.Hips = { x: 0, y: 0, z: 0, posY: restHipsY + bounce };
        targets.Head = { x: -0.25, y: 0, z: 0 }; // Looking up proudly

        targets.LeftUpperArm = { x: -1.55, y: 0, z: -2.45 };
        targets.LeftLowerArm = { x: 0, y: -0.45, z: 0 };
        targets.RightUpperArm = { x: -1.55, y: 0, z: 2.45 };
        targets.RightLowerArm = { x: 0, y: 0.45, z: 0 };
    }

    /**
     * WAVE: Friendly lively greeting with organic shoulder drop and head tilt
     */
    static solveWave(time, targets, restHipsY = 0.75) {
        const sway = Math.sin(time * 3.5) * 0.015;
        const wave = Math.sin(time * 6.5) * 0.38 + Math.cos(time * 13.0) * 0.05;
        
        targets.Hips = { x: 0, y: sway * 0.5, z: sway, posY: restHipsY + Math.abs(sway) * 0.005 };
        targets.Spine = { x: 0.02, y: sway * 0.8, z: 0 };
        targets.Chest = { x: 0.02, y: 0, z: 0 };
        targets.Head = { x: -0.04, y: -0.10, z: 0.08 + Math.sin(time * 3.5) * 0.04 };
        targets.Neck = { x: 0, y: 0, z: 0.02 };

        // Right arm raised smoothly to shoulder level, forearm wagging naturally
        targets.RightUpperArm = { x: -1.35, y: 0.18, z: 1.75 };
        targets.RightLowerArm = { x: -0.10, y: 0.25 + wave, z: 0.15 };
        targets.RightHand = { x: 0.08, y: wave * 0.4, z: 0.10 };

        // Left arm rests comfortably at side with natural elbow curve
        targets.LeftUpperArm = { x: -0.14, y: 0.06, z: -1.15 };
        targets.LeftLowerArm = { x: -0.08, y: -0.22, z: 0.08 };
        targets.LeftHand = { x: -0.04, y: 0, z: -0.02 };
    }

    /**
     * BOW: Respectful Japanese anime bow with graceful spinal lumbar curvature
     */
    static solveBow(time, targets, restHipsY = 0.75) {
        // Smooth cyclical bow curve: descend, hold, rise
        const cycle = (time * 1.5) % (Math.PI * 2);
        const bowCurve = Math.max(0, Math.sin(cycle));
        const s = bowCurve * bowCurve * (3 - 2 * bowCurve); // S-curve ease

        targets.Hips = { x: -0.08 * s, y: 0, z: 0, posY: restHipsY - 0.03 * s };
        targets.Spine = { x: 0.34 * s, y: 0, z: 0 };
        targets.Chest = { x: 0.22 * s, y: 0, z: 0 };
        targets.UpperChest = { x: 0.12 * s, y: 0, z: 0 };
        targets.Head = { x: 0.24 * s, y: 0, z: 0 }; // Natural gaze lowered
        targets.Neck = { x: 0.08 * s, y: 0, z: 0 };

        // Grounded stance with slight knee flex
        targets.LeftUpperLeg = { x: 0.06 * s, y: 0, z: -0.02 };
        targets.RightUpperLeg = { x: 0.06 * s, y: 0, z: 0.02 };
        targets.LeftLowerLeg = { x: -0.04 * s, y: 0, z: 0 };
        targets.RightLowerLeg = { x: -0.04 * s, y: 0, z: 0 };

        // Hands slide gracefully along front of thighs (classic Japanese etiquette)
        targets.LeftUpperArm = { x: -0.26 * s - 0.10, y: 0.15 * s, z: -1.10 + 0.25 * s };
        targets.RightUpperArm = { x: -0.26 * s - 0.10, y: -0.15 * s, z: 1.10 - 0.25 * s };
        targets.LeftLowerArm = { x: -0.15 * s, y: -0.45 * s, z: 0.12 * s };
        targets.RightLowerArm = { x: -0.15 * s, y: 0.45 * s, z: -0.12 * s };
        targets.LeftHand = { x: 0.10 * s, y: 0, z: 0 };
        targets.RightHand = { x: 0.10 * s, y: 0, z: 0 };
    }

    /**
     * MEDITATE / ZEN: Serene seated lotus/kneeling posture with deep calm breathing
     */
    static solveMeditate(time, targets, restHipsY = 0.75) {
        const deepBreath = Math.sin(time * 1.2) * 0.025;
        
        // Hips grounded in lotus / tatami seiza
        targets.Hips = { x: 0.02, y: 0, z: 0, posY: 0.30 + deepBreath * 0.005 };
        targets.Spine = { x: -0.02, y: 0, z: 0 }; // Perfectly straight anime posture
        targets.Chest = { x: deepBreath * 0.8, y: 0, z: 0 };
        targets.UpperChest = { x: deepBreath, y: 0, z: 0 };
        targets.Head = { x: 0.08, y: 0, z: 0 }; // Eyes gently closed / lowered
        targets.Neck = { x: 0.02, y: 0, z: 0 };

        // Traditional Japanese folded knees / crossed legs
        targets.LeftUpperLeg = { x: -0.92, y: 0.04, z: -0.10 };
        targets.RightUpperLeg = { x: -0.92, y: -0.04, z: 0.10 };
        targets.LeftLowerLeg = { x: 2.25, y: 0, z: -0.02 };
        targets.RightLowerLeg = { x: 2.25, y: 0, z: 0.02 };
        targets.LeftFoot = { x: -1.35, y: 0, z: 0 };
        targets.RightFoot = { x: -1.35, y: 0, z: 0 };

        // Hands resting peacefully on thighs in serene dhyana mudra
        targets.LeftUpperArm = { x: -0.22, y: 0.08, z: -1.22 };
        targets.RightUpperArm = { x: -0.22, y: -0.08, z: 1.22 };
        targets.LeftLowerArm = { x: -0.18, y: -0.72, z: 0.18 };
        targets.RightLowerArm = { x: -0.18, y: 0.72, z: -0.18 };
        targets.LeftHand = { x: 0.12, y: 0.08, z: -0.05 };
        targets.RightHand = { x: 0.12, y: -0.08, z: 0.05 };
    }

    /**
     * VIBE DANCE: Expressive rhythmic anime dance with dynamic hip sway and arm grooves
     */
    static solveVibeDance(time, targets, restHipsY = 0.75) {
        const beat = time * 3.8;
        const hipSway = Math.sin(beat) * 0.14;
        const hipRoll = Math.cos(beat * 0.5) * 0.08;
        const bounce = Math.abs(Math.sin(beat)) * 0.035;

        targets.Hips = { x: 0.03, y: hipRoll, z: hipSway, posY: restHipsY + bounce };
        targets.Spine = { x: 0.02, y: -hipRoll * 0.7, z: -hipSway * 0.6 };
        targets.Chest = { x: 0.04, y: 0, z: -hipSway * 0.3 };
        targets.UpperChest = { x: bounce * 0.5, y: 0, z: 0 };
        targets.Head = { x: -0.06 + bounce * 0.8, y: hipRoll * 0.5, z: -hipSway * 0.4 };

        // Dynamic rhythmic legs bouncing to the beat
        targets.LeftUpperLeg = { x: -0.05 + bounce * 0.8, y: 0, z: -0.04 - hipSway * 0.3 };
        targets.RightUpperLeg = { x: -0.05 + bounce * 0.8, y: 0, z: 0.04 - hipSway * 0.3 };
        targets.LeftLowerLeg = { x: 0.10 - bounce * 0.8, y: 0, z: 0 };
        targets.RightLowerLeg = { x: 0.10 - bounce * 0.8, y: 0, z: 0 };

        // Alternating fluid anime arm waves
        const armL = Math.sin(beat + 0.5) * 0.28;
        const armR = Math.cos(beat + 0.5) * 0.28;
        targets.LeftUpperArm = { x: -0.45 + armL * 0.3, y: 0.20, z: -1.45 + armL * 0.4 };
        targets.RightUpperArm = { x: -0.45 + armR * 0.3, y: -0.20, z: 1.45 - armR * 0.4 };
        targets.LeftLowerArm = { x: -0.20, y: -0.65 + armL * 0.5, z: 0.30 };
        targets.RightLowerArm = { x: -0.20, y: 0.65 - armR * 0.5, z: -0.30 };
        targets.LeftHand = { x: 0.12, y: 0, z: armL * 0.2 };
        targets.RightHand = { x: 0.12, y: 0, z: -armR * 0.2 };
    }

    /**
     * PHOTO POSE: Cute anime double-peace / V-sign with playful head tilt and hip pop
     */
    static solvePhotoPose(time, targets, restHipsY = 0.75) {
        const breath = Math.sin(time * 2.0) * 0.01;

        // Hip popped gracefully to the right side
        targets.Hips = { x: 0.02, y: -0.05, z: 0.12, posY: restHipsY - 0.015 };
        targets.Spine = { x: 0.02, y: 0.04, z: -0.08 };
        targets.Chest = { x: breath, y: 0, z: -0.04 };
        targets.UpperChest = { x: breath * 0.5, y: 0, z: 0 };
        
        // Playful head tilt (15 degrees) looking brightly at the camera
        targets.Head = { x: -0.05, y: -0.10, z: 0.22 };
        targets.Neck = { x: 0, y: 0, z: 0.05 };

        // Relaxed stylish leg posture
        targets.LeftUpperLeg = { x: -0.06, y: 0.02, z: -0.08 };
        targets.RightUpperLeg = { x: 0.08, y: -0.04, z: 0.16 };
        targets.LeftLowerLeg = { x: 0.04, y: 0, z: 0 };
        targets.RightLowerLeg = { x: 0.08, y: 0, z: 0 };

        // Right hand flashes cute V-sign near cheek
        targets.RightUpperArm = { x: -1.25, y: 0.25, z: 1.45 };
        targets.RightLowerArm = { x: -0.35, y: 1.35, z: -0.22 };
        targets.RightHand = { x: 0.15, y: -0.10, z: 0.25 };

        // Left hand rests daintily against waist / hip
        targets.LeftUpperArm = { x: -0.35, y: 0.18, z: -1.25 };
        targets.LeftLowerArm = { x: -0.25, y: -0.95, z: 0.40 };
        targets.LeftHand = { x: 0.10, y: 0, z: -0.10 };
    }

    /* =========================================================================
       SEATED POSES (Chairs, Benches, Campfires, Coding Desks)
       ========================================================================= */

    /**
     * Base seated body geometry: Hips dropped, thighs horizontal forward, knees 90°
     */
    static applySeatedLegBase(targets, sitHipsY = 0.48, isHighStool = false) {
        targets.Hips = { x: 0.02, y: 0, z: 0, posY: sitHipsY };
        const isFloorMat = sitHipsY <= 0.32;
        const isElevatedStool = isHighStool || (sitHipsY >= 0.60);
        if (isFloorMat) {
            // Traditional Japanese Seiza (kneeling gracefully on tatami mat / meditation cushion)
            // Thighs angled forward and down towards the mat surface, knees held modestly together (adducted inward)
            targets.LeftUpperLeg = { x: -0.90, y: 0.02, z: -0.06 };
            targets.RightUpperLeg = { x: -0.90, y: -0.02, z: 0.06 };
            // Calves folded neatly back along the tatami surface underneath thighs
            targets.LeftLowerLeg = { x: 2.25, y: 0.0, z: -0.02 };
            targets.RightLowerLeg = { x: 2.25, y: -0.0, z: 0.02 };
            // Feet pointed back flat along tatami mat surface
            targets.LeftFoot = { x: -1.35, y: 0.0, z: -0.01 };
            targets.RightFoot = { x: -1.35, y: 0.0, z: 0.01 };
        } else if (isElevatedStool) {
            // Elevated stool posture: thighs slope gracefully down towards the footrest
            // Modest anime feminine posture: thighs close together (z inward), knees touching
            targets.LeftUpperLeg = { x: -1.05, y: 0.0, z: -0.03 };
            targets.RightUpperLeg = { x: -1.05, y: -0.0, z: 0.03 };
            // Lower legs bent back towards chrome footrest ring
            targets.LeftLowerLeg = { x: 1.20, y: 0.0, z: 0.02 };
            targets.RightLowerLeg = { x: 1.20, y: 0.0, z: -0.02 };
            // Feet resting on footrest ring
            targets.LeftFoot = { x: 0.12, y: 0.0, z: -0.01 };
            targets.RightFoot = { x: 0.12, y: 0.0, z: 0.01 };
        } else {
            // Modest anime feminine posture: thighs close together (z inward), knees touching
            targets.LeftUpperLeg = { x: -1.48, y: 0.0, z: -0.04 };
            targets.RightUpperLeg = { x: -1.48, y: 0.0, z: 0.04 };
            // Calves and knees held neatly parallel down towards floor
            targets.LeftLowerLeg = { x: 1.48, y: 0.0, z: 0.02 };
            targets.RightLowerLeg = { x: 1.48, y: -0.0, z: -0.02 };
            // Feet resting flat on ground
            targets.LeftFoot = { x: 0.02, y: 0.0, z: -0.01 };
            targets.RightFoot = { x: 0.02, y: 0.0, z: 0.01 };
        }
    }

    /**
     * SIT IDLE / RELAXED: Natural seated posture on bench or chair
     */
    static solveSitIdle(time, targets, sitHipsY = 0.45, isHighStool = false) {
        this.applySeatedLegBase(targets, sitHipsY, isHighStool);
        const breath = Math.sin(time * 1.8) * 0.012;

        targets.Spine = { x: -0.05, y: 0, z: 0 }; // Gentle lean back against backrest
        targets.Chest = { x: -0.04, y: 0, z: 0 };
        targets.UpperChest = { x: breath, y: 0, z: 0 };
        targets.Head = { x: -0.02, y: 0, z: 0 };

        const isFloorMat = sitHipsY <= 0.32;
        if (isFloorMat) {
            // Traditional Japanese Seiza hand posture: hands folded gently flat on front thighs/lap
            targets.LeftUpperArm = { x: -0.25, y: 0.10, z: -1.25 };
            targets.LeftLowerArm = { x: -0.15, y: -0.55, z: 0.15 };
            targets.LeftHand = { x: 0.06, y: 0, z: 0 };
            targets.RightUpperArm = { x: -0.25, y: -0.10, z: 1.25 };
            targets.RightLowerArm = { x: -0.15, y: 0.55, z: -0.15 };
            targets.RightHand = { x: 0.06, y: 0, z: 0 };
        } else {
            // Hands resting gracefully on lap / thighs (arms down near sides, not flared out)
            targets.LeftUpperArm = { x: -0.22, y: 0.10, z: -1.25 };
            targets.LeftLowerArm = { x: -0.15, y: -0.55, z: 0.15 };
            targets.LeftHand = { x: 0.04, y: 0, z: 0 };
            targets.RightUpperArm = { x: -0.22, y: -0.10, z: 1.25 };
            targets.RightLowerArm = { x: -0.15, y: 0.55, z: -0.15 };
            targets.RightHand = { x: 0.04, y: 0, z: 0 };
        }
    }

    /**
     * READING: Standing reading documentation or handheld cyberdeck
     */
    static solveReading(time, targets, restHipsY = 0.75) {
        const breath = Math.sin(time * 1.8) * 0.015;
        targets.Hips = { x: 0, y: 0, z: 0, posY: restHipsY };
        targets.Spine = { x: 0.06, y: 0, z: 0 };
        targets.Chest = { x: 0.04, y: 0, z: 0 };
        targets.UpperChest = { x: breath, y: 0, z: 0 };
        targets.Head = { x: 0.28, y: Math.sin(time * 1.2) * 0.06, z: 0 }; // Eyes reading documentation

        targets.LeftUpperLeg = { x: 0, y: 0, z: 0 };
        targets.RightUpperLeg = { x: 0, y: 0, z: 0 };
        targets.LeftLowerLeg = { x: 0, y: 0, z: 0 };
        targets.RightLowerLeg = { x: 0, y: 0, z: 0 };
        targets.LeftFoot = { x: 0, y: 0, z: 0 };
        targets.RightFoot = { x: 0, y: 0, z: 0 };

        // Both hands up holding handheld device / book in front of chest
        targets.LeftUpperArm = { x: -0.62, y: 0.25, z: -0.75 };
        targets.RightUpperArm = { x: -0.62, y: -0.25, z: 0.75 };
        targets.LeftLowerArm = { x: -0.35, y: -0.92, z: 0.55 };
        targets.RightLowerArm = { x: -0.35, y: 0.92, z: -0.55 };
        targets.LeftHand = { x: 0.15, y: 0, z: 0 };
        targets.RightHand = { x: 0.15, y: 0, z: 0 };
    }

    /**
     * STRETCH: Standing full body stretch
     */
    static solveStretch(time, targets, restHipsY = 0.75) {
        const cycle = Math.sin(time * 1.5);
        targets.Hips = { x: -0.05, y: 0, z: 0, posY: restHipsY + 0.02 * Math.max(0, cycle) };
        targets.Spine = { x: -0.12, y: 0, z: 0 };
        targets.Chest = { x: -0.10, y: 0, z: 0 };
        targets.UpperChest = { x: 0.06, y: 0, z: 0 };
        targets.Head = { x: -0.22, y: 0, z: 0 }; // Looking up

        targets.LeftUpperLeg = { x: 0, y: 0, z: 0 };
        targets.RightUpperLeg = { x: 0, y: 0, z: 0 };
        targets.LeftLowerLeg = { x: 0, y: 0, z: 0 };
        targets.RightLowerLeg = { x: 0, y: 0, z: 0 };
        targets.LeftFoot = { x: 0, y: 0, z: 0 };
        targets.RightFoot = { x: 0, y: 0, z: 0 };

        targets.LeftUpperArm = { x: -1.85, y: 0.1, z: -2.35 };
        targets.RightUpperArm = { x: -1.85, y: -0.1, z: 2.35 };
        targets.LeftLowerArm = { x: -0.15, y: -0.3, z: 0 };
        targets.RightLowerArm = { x: -0.15, y: 0.3, z: 0 };
    }

    /**
     * CHATTING: Standing conversational speaking with gestures
     */
    static solveChatting(time, targets, restHipsY = 0.75) {
        const gesture = Math.sin(time * 3.0) * 0.15;
        const headNod = Math.sin(time * 2.5) * 0.08;

        targets.Hips = { x: 0, y: gesture * 0.2, z: 0, posY: restHipsY };
        targets.Spine = { x: 0.02, y: gesture * 0.3, z: 0 };
        targets.Chest = { x: 0.02, y: gesture * 0.3, z: 0 };
        targets.Head = { x: headNod - 0.04, y: gesture * 0.5, z: 0 };

        targets.LeftUpperLeg = { x: 0, y: 0, z: 0 };
        targets.RightUpperLeg = { x: 0, y: 0, z: 0 };
        targets.LeftLowerLeg = { x: 0, y: 0, z: 0 };
        targets.RightLowerLeg = { x: 0, y: 0, z: 0 };
        targets.LeftFoot = { x: 0, y: 0, z: 0 };
        targets.RightFoot = { x: 0, y: 0, z: 0 };

        targets.RightUpperArm = { x: -0.65, y: 0.10, z: 1.15 };
        targets.RightLowerArm = { x: -0.20, y: 0.65 + gesture, z: -0.25 };
        targets.LeftUpperArm = { x: -0.16, y: 0.08, z: -1.06 };
        targets.LeftLowerArm = { x: -0.12, y: -0.24, z: 0.06 };
        targets.LeftHand = { x: -0.05, y: 0, z: -0.04 };
    }

    /**
     * SIT TYPING: Seated at desk with hands on laptop keyboard
     */
    static solveSitTyping(time, targets, sitHipsY = 0.45, isHighStool = false) {
        this.applySeatedLegBase(targets, sitHipsY, isHighStool);
        const tapL = Math.sin(time * 12.0) * 0.05;
        const tapR = Math.cos(time * 13.0) * 0.05;

        targets.Spine = { x: 0.12, y: 0, z: 0 }; // Slight forward focus towards laptop
        targets.Chest = { x: 0.08, y: 0, z: 0 };
        targets.UpperChest = { x: 0.04, y: 0, z: 0 };
        targets.Head = { x: 0.22, y: 0, z: 0 }; // Eyes down towards code screen

        // Natural ergonomic typing posture:
        // Upper arms relaxed down near sides of ribcage, reaching slightly forward
        targets.LeftUpperArm = { x: -0.42, y: 0.12, z: -1.24 };
        targets.RightUpperArm = { x: -0.42, y: -0.12, z: 1.24 };
        // Forearms horizontal forward over table surface, reaching inward towards keyboard center
        targets.LeftLowerArm = { x: -0.15 + tapL, y: -0.72, z: 0.18 };
        targets.RightLowerArm = { x: -0.15 + tapR, y: 0.72, z: -0.18 };
        targets.LeftHand = { x: 0.08, y: 0, z: 0 };
        targets.RightHand = { x: 0.08, y: 0, z: 0 };
    }

    /**
     * SIT READING: Seated reading design tokens or documentation in lap
     */
    static solveSitReading(time, targets, sitHipsY = 0.45, isHighStool = false) {
        this.applySeatedLegBase(targets, sitHipsY, isHighStool);
        const pageTurn = Math.sin(time * 0.8) * 0.03;
        const breath = Math.sin(time * 1.8) * 0.012;

        targets.Spine = { x: 0.10, y: 0, z: 0 };
        targets.Chest = { x: 0.06, y: 0, z: 0 };
        targets.UpperChest = { x: breath, y: 0, z: 0 };
        targets.Head = { x: 0.26, y: Math.sin(time * 1.2) * 0.05, z: 0 }; // Eyes reading documentation

        // Hands resting in lap holding documentation / design token book
        targets.LeftUpperArm = { x: -0.38, y: 0.15, z: -1.22 };
        targets.RightUpperArm = { x: -0.38, y: -0.15, z: 1.22 };
        targets.LeftLowerArm = { x: -0.22, y: -0.75, z: 0.25 };
        targets.RightLowerArm = { x: -0.22 + pageTurn, y: 0.75, z: -0.25 };
        targets.LeftHand = { x: 0.10, y: 0, z: 0 };
        targets.RightHand = { x: 0.10, y: 0, z: 0 };
    }

    /**
     * SIT VIBING: Seated relaxed music groove on bench
     */
    static solveSitVibing(time, targets, sitHipsY = 0.45, isHighStool = false) {
        this.applySeatedLegBase(targets, sitHipsY, isHighStool);
        const nod = Math.sin(time * 4.2) * 0.10;
        const sway = Math.sin(time * 2.1) * 0.04;

        targets.Spine = { x: -0.04, y: sway, z: 0 };
        targets.Chest = { x: -0.02, y: sway * 0.8, z: 0 };
        targets.UpperChest = { x: nod * 0.3, y: 0, z: 0 };
        targets.Head = { x: nod, y: sway * 0.6, z: 0 };

        // Relaxed hands resting on lap with gentle groove
        targets.LeftUpperArm = { x: -0.22, y: 0.08, z: -1.25 + sway * 0.03 };
        targets.RightUpperArm = { x: -0.22, y: -0.08, z: 1.25 - sway * 0.03 };
        targets.LeftLowerArm = { x: -0.15, y: -0.50, z: 0.12 };
        targets.RightLowerArm = { x: -0.15, y: 0.50, z: -0.12 };
        targets.LeftHand = { x: 0.04, y: 0, z: 0 };
        targets.RightHand = { x: 0.04, y: 0, z: 0 };
    }

    /**
     * SIT THINKING: Seated with elbow on table and chin in hand
     */
    static solveSitThinking(time, targets, sitHipsY = 0.45, isHighStool = false) {
        this.applySeatedLegBase(targets, sitHipsY, isHighStool);

        targets.Spine = { x: 0.08, y: 0.05, z: 0 };
        targets.Head = { x: -0.05, y: -0.15, z: 0.12 }; // Head tilted thoughtfully

        // Right elbow up, hand to chin
        targets.RightUpperArm = { x: -0.95, y: 0.12, z: 1.25 };
        targets.RightLowerArm = { x: -0.25, y: -0.40, z: 1.55 };

        // Left hand resting on desk
        targets.LeftUpperArm = { x: -0.42, y: 0.12, z: -1.15 };
        targets.LeftLowerArm = { x: 0, y: -0.70, z: 0.30 };
    }

    /**
     * SIT COFFEE: Seated enjoying a warm drink
     */
    static solveSitCoffee(time, targets, sitHipsY = 0.45, isHighStool = false) {
        this.applySeatedLegBase(targets, sitHipsY, isHighStool);
        const sipCycle = (time * 0.4) % (Math.PI * 2);
        const isSipping = Math.sin(sipCycle) > 0.65;
        const sipBlend = Math.max(0, (Math.sin(sipCycle) - 0.65) / 0.35);

        targets.Spine = { x: -0.04, y: 0, z: 0 };
        targets.Chest = { x: -0.02, y: 0, z: 0 };
        targets.Head = { x: isSipping ? -0.14 * sipBlend : -0.02, y: 0, z: 0 };

        // Left arm resting comfortably on counter / lap
        targets.LeftUpperArm = { x: -0.35, y: 0.12, z: -1.25 };
        targets.LeftLowerArm = { x: -0.15, y: -0.65, z: 0.15 };
        targets.LeftHand = { x: 0.05, y: 0, z: 0 };

        // Right arm holding mug: resting in front or sipping
        const armX = THREE_LERP(-0.35, -0.92, sipBlend);
        const armZ = THREE_LERP(1.22, 1.05, sipBlend);
        targets.RightUpperArm = { x: armX, y: -0.15, z: armZ };
        targets.RightLowerArm = { x: -0.15, y: 0.65 + sipBlend * 0.35, z: -0.15 };
        targets.RightHand = { x: 0.08, y: 0, z: 0.02 };
    }

    /**
     * SIT LOOKING AT VIEW: Relaxed vista watching on panoramic bench
     */
    static solveSitLookingAtView(time, targets, sitHipsY = 0.45, isHighStool = false) {
        this.applySeatedLegBase(targets, sitHipsY, isHighStool);
        const gazePan = Math.sin(time * 0.5) * 0.18;

        targets.Spine = { x: -0.08, y: 0, z: 0 }; // Leaning back comfortably
        targets.Chest = { x: -0.06, y: 0, z: 0 };
        targets.Head = { x: -0.12, y: gazePan, z: 0 }; // Looking out across scenic mountains

        // Graceful lap hands enjoying panorama
        targets.LeftUpperArm = { x: -0.22, y: 0.08, z: -1.25 };
        targets.LeftLowerArm = { x: -0.15, y: -0.52, z: 0.12 };
        targets.LeftHand = { x: 0.04, y: 0, z: 0 };
        targets.RightUpperArm = { x: -0.22, y: -0.08, z: 1.25 };
        targets.RightLowerArm = { x: -0.15, y: 0.52, z: -0.12 };
        targets.RightHand = { x: 0.04, y: 0, z: 0 };
    }
}

function THREE_LERP(a, b, t) {
    return a + (b - a) * Math.max(0, Math.min(1, t));
}
