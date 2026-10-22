import * as THREE from 'three';
import { npcNavSystem } from './npc-navigation-system.js';

/**
 * NPC LIFE SYSTEM & SCHEDULE CONTROLLER
 * Implements Section 17, 18, 19, 20, 21, and 43 of TeleTerm Living Open World Master Spec v3.
 * Manages autonomous NPC life routines, personality archetypes, waypoint traversal,
 * interactive seating, activity animations, and overhead activity badges.
 */

export const NPC_SCHEDULES = {
    lumina: {
        id: 'lumina',
        name: 'Lumina',
        level: 32,
        role: 'AI Architect & Researcher',
        icon: 'zap',
        badgeColor: '#6366f1',
        personality: 'AI Enthusiast & Deep Thinker',
        homeAnchor: 'hub_desk_chair_1',
        routine: [
            {
                activity: 'coding',
                anim: 'SitTyping',
                statusText: '*prompting LLM agents...*',
                anchorId: 'hub_desk_chair_1',
                targetPos: { x: 6.2, z: 0.05 },
                duration: 25.0
            },
            {
                activity: 'thinking',
                anim: 'SitThinking',
                statusText: '*analyzing neural latent space*',
                anchorId: 'hub_desk_chair_1',
                targetPos: { x: 20.7, z: -10.45 },
                duration: 18.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*walking to coffee lounge*',
                targetPos: { x: 24.05, z: -9.4 },
                duration: 10.0
            },
            {
                activity: 'coffee',
                anim: 'SitCoffee',
                statusText: '*sipping espresso latte*',
                anchorId: 'hub_cafe_lounge_chair',
                targetPos: { x: 24.05, z: -9.4 },
                duration: 22.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*walking to river vista*',
                targetPos: { x: 8.5, z: 19.2 },
                duration: 14.0
            },
            {
                activity: 'looking_at_view',
                anim: 'SitLookingAtView',
                statusText: '*gazing across river valley*',
                anchorId: 'river_valley_bench',
                targetPos: { x: 8.5, z: 19.2 },
                duration: 25.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*returning to dev hub*',
                targetPos: { x: 20.7, z: -10.45 },
                duration: 16.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*walking to bamboo tea pavilion*',
                targetPos: { x: -22.0, z: -25.0 },
                duration: 22.0
            },
            {
                activity: 'thinking',
                anim: 'SitThinking',
                statusText: '*meditating in bamboo tea pavilion*',
                anchorId: 'bamboo_tea_mat_1',
                targetPos: { x: -22.85, z: -25.0 },
                duration: 28.0
            }
        ]
    },
    sakura: {
        id: 'sakura',
        name: 'Sakura',
        level: 18,
        role: 'Spring Priestess & UI Designer',
        icon: 'coffee',
        badgeColor: '#34d399',
        personality: 'Social Coder & Chill Designer',
        homeAnchor: 'wayside_sakura_bench',
        routine: [
            {
                activity: 'reading',
                anim: 'SitReading',
                statusText: '*reading design tokens spec*',
                anchorId: 'wayside_sakura_bench',
                targetPos: { x: 5.5, z: -6.0 },
                duration: 22.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*walking to hill cherry grove*',
                targetPos: { x: 25.0, z: -15.5 },
                duration: 16.0
            },
            {
                activity: 'sitting',
                anim: 'SitRelaxed',
                statusText: '*vibing under cherry blossoms*',
                anchorId: 'cherry_grove_bench',
                targetPos: { x: 25.0, z: -15.5 },
                duration: 25.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*walking to autumn maple valley*',
                targetPos: { x: 37.0, z: -23.5 },
                duration: 18.0
            },
            {
                activity: 'looking_at_view',
                anim: 'SitLookingAtView',
                statusText: '*sketching autumn maples & stream*',
                anchorId: 'maple_stream_bench_1',
                targetPos: { x: 37.0, z: -23.5 },
                duration: 28.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*walking to panoramic overlook*',
                targetPos: { x: 34.0, z: -48.0 },
                duration: 20.0
            },
            {
                activity: 'looking_at_view',
                anim: 'SitLookingAtView',
                statusText: '*admiring alpine snow peaks*',
                anchorId: 'hilltop_panorama_bench',
                targetPos: { x: 34.0, z: -48.0 },
                duration: 30.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*returning to roadside bench*',
                targetPos: { x: 5.5, z: -6.0 },
                duration: 26.0
            }
        ]
    },
    ren: {
        id: 'ren',
        name: 'Ren',
        level: 42,
        role: 'Tech Scholar & Systems Hacker',
        icon: 'lock',
        badgeColor: '#a855f7',
        personality: 'Bug Hunter & Compiler Crafter',
        homeAnchor: 'hub_desk_chair_2',
        routine: [
            {
                activity: 'debugging',
                anim: 'SitTyping',
                statusText: '*debugging memory leak in Rust*',
                anchorId: 'hub_desk_chair_2',
                targetPos: { x: 23.3, z: -10.45 },
                duration: 24.0
            },
            {
                activity: 'thinking',
                anim: 'SitThinking',
                statusText: '*profiling WebAssembly GC*',
                anchorId: 'hub_desk_chair_2',
                targetPos: { x: 23.3, z: -10.45 },
                duration: 18.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*hiking mountain trail to alpine overlook*',
                targetPos: { x: 34.0, z: -48.0 },
                duration: 24.0
            },
            {
                activity: 'looking_at_view',
                anim: 'SitLookingAtView',
                statusText: '*observing snowy peaks from overlook*',
                anchorId: 'hilltop_panorama_bench',
                targetPos: { x: 34.0, z: -48.0 },
                duration: 30.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*walking to coastal pier*',
                targetPos: { x: 10.5, z: 98.0 },
                duration: 28.0
            },
            {
                activity: 'looking_at_view',
                anim: 'SitLookingAtView',
                statusText: '*vibing to ocean breeze*',
                anchorId: 'beach_pier_bench',
                targetPos: { x: 10.5, z: 98.0 },
                duration: 28.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*returning to dev hub*',
                targetPos: { x: 8.8, z: 0.05 },
                duration: 35.0
            }
        ]
    },
    kaede: {
        id: 'kaede',
        name: 'Kaede',
        level: 22,
        role: 'Mechanical & Graphics Engineer',
        icon: 'gauge',
        badgeColor: '#00f0ff',
        personality: 'Builder & Systems Craftsman',
        homeAnchor: 'village_vending_machine',
        routine: [
            {
                activity: 'vibing',
                anim: 'Vibing',
                statusText: '*enjoying cold brew matcha*',
                targetPos: { x: 2.8, z: -21.5 },
                duration: 20.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*walking to hub terminal*',
                targetPos: { x: 17.8, z: -9.0 },
                duration: 16.0
            },
            {
                activity: 'typing',
                anim: 'Typing',
                statusText: '*benchmarking WebGL shaders*',
                anchorId: 'hub_kiosk_terminal',
                targetPos: { x: 17.8, z: -9.0 },
                duration: 25.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*walking to maple stream rest stop*',
                targetPos: { x: 42.0, z: -30.75 },
                duration: 18.0
            },
            {
                activity: 'coffee',
                anim: 'SitRelaxed',
                statusText: '*tea break at maple rest stop*',
                anchorId: 'maple_picnic_stool_1',
                targetPos: { x: 42.0, z: -30.75 },
                duration: 25.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*returning to wayside bench*',
                targetPos: { x: 5.5, z: -6.0 },
                duration: 16.0
            },
            {
                activity: 'resting',
                anim: 'SitRelaxed',
                statusText: '*resting by roadside*',
                anchorId: 'wayside_sakura_bench',
                targetPos: { x: 5.5, z: -6.0 },
                duration: 22.0
            },
            {
                activity: 'walking',
                anim: 'Walk',
                statusText: '*walking to village vending machine*',
                targetPos: { x: 2.8, z: -21.5 },
                duration: 16.0
            }
        ]
    },
    kaito: {
        id: 'kaito',
        name: 'Kaito',
        level: 38,
        role: 'Artisan Barista & Coffee Master',
        roleTitle: 'Artisan Barista',
        roleTitleVi: 'Nghệ Nhân Barista',
        icon: 'coffee',
        badgeColor: '#f59e0b',
        personality: 'Passionate Brewer & Hub Barista',
        homeAnchor: 'hub_barista_spot',
        routine: [
            {
                activity: 'brewing',
                anim: 'Coffee',
                statusText: '*brewing pour-over specialty coffee*',
                anchorId: 'hub_barista_spot',
                targetPos: { x: 26.6, z: -9.6 },
                duration: 25.0
            },
            {
                activity: 'frothing',
                anim: 'Coffee',
                statusText: '*steaming silky oat milk foam*',
                anchorId: 'hub_barista_spot',
                targetPos: { x: 26.6, z: -9.6 },
                duration: 20.0
            },
            {
                activity: 'grinding',
                anim: 'Coffee',
                statusText: '*dialing in espresso grind size*',
                anchorId: 'hub_barista_spot',
                targetPos: { x: 26.6, z: -9.6 },
                duration: 18.0
            },
            {
                activity: 'welcoming',
                anim: 'Wave',
                statusText: '*welcoming developers & visitors*',
                anchorId: 'hub_barista_spot',
                targetPos: { x: 26.6, z: -9.6 },
                duration: 15.0
            },
            {
                activity: 'tasting',
                anim: 'Idle',
                statusText: '*tasting fresh roast blend*',
                anchorId: 'hub_barista_spot',
                targetPos: { x: 26.6, z: -9.6 },
                duration: 22.0
            }
        ]
    }
};

export class NpcLifeAgent {
    constructor(npcGroup, retargeter, scheduleDef, terrainSystem, interactionManager, overheadUi = null) {
        this.group = npcGroup;
        this.retargeter = retargeter;
        this.def = scheduleDef;
        this.terrain = terrainSystem;
        this.interactionManager = interactionManager;
        this.overheadUi = overheadUi;

        this.routineIndex = 0;
        this.stepTimer = 0;
        this.state = 'working'; // 'walking', 'working', 'sitting'
        this.currentStatusText = this.def.routine[0]?.statusText || '*vibing*';

        this.moveSpeed = 1.6; // Natural relaxed walking pace
        this.targetPos = new THREE.Vector3();
        this.pathWaypoints = [];
        this.currentWaypointIdx = 0;

        this.claimedAnchorId = null;
        if (this.overheadUi) {
            this.overheadUi.registerBadge(this.def.id, {
                name: this.def.name,
                level: this.def.level || 1,
                roleTitle: this.def.roleTitle || this.def.role,
                roleTitleVi: this.def.roleTitleVi || null,
                borderColor: this.def.badgeColor || '#38bdf8',
                statusColor: this.def.badgeColor || '#38bdf8',
                glowColor: this.def.badgeColor || 'rgba(56, 189, 248, 0.4)',
                rootObj: this.group,
                headBone: this.retargeter?.mappedBones?.Head,
                statusText: this.currentStatusText
            });
        }
        this.animAccumulator = 0;
        this.currentLod = 0;
        this.applyCurrentRoutineStep();
    }

    updateBadge(statusText) {
        this.currentStatusText = statusText;
        if (this.overheadUi) {
            this.overheadUi.updateBadgeContent(this.def.id, statusText);
        }
    }

    applyCurrentRoutineStep() {
        const step = this.def.routine[this.routineIndex];
        this.stepTimer = 0;

        // Release any previously held anchor if switching to a different anchor
        if (this.claimedAnchorId && this.claimedAnchorId !== step.anchorId && this.interactionManager) {
            this.interactionManager.releaseAnchor(this.claimedAnchorId, this.def.id);
            this.claimedAnchorId = null;
            if (this.retargeter?.setSeatConfig) {
                this.retargeter.setSeatConfig(null);
            }
        }

        const curX = this.group.position.x;
        const curZ = this.group.position.z;
        const targetX = step.targetPos.x;
        const targetZ = step.targetPos.z;
        const dist = Math.hypot(targetX - curX, targetZ - curZ);

        if (dist > 0.4) {
            this.state = 'walking';
            if (this.retargeter) {
                this.retargeter.isSeated = false;
                if (this.retargeter.setSeatConfig) this.retargeter.setSeatConfig(null);
                this.retargeter.setAnimation('Walk');
                this.retargeter.speedNorm = 0.45; // Start locomotion immediately so NPC doesn't drift in sitting pose
            }
            const nav = window.npcNavSystem || npcNavSystem;
            if (nav) {
                this.pathWaypoints = nav.planPath(
                    { x: curX, z: curZ },
                    { x: targetX, z: targetZ }
                );
            } else {
                this.pathWaypoints = [{ x: targetX, z: targetZ }];
            }
            this.currentWaypointIdx = 0;
            const firstWp = this.pathWaypoints[0];
            this.targetPos.set(firstWp.x, 0, firstWp.z);
            this.updateBadge(step.statusText || `*walking to ${step.activity}*`);
        } else {
            // Already at destination: begin activity
            this.state = 'working';
            let animToPlay = step.anim || 'Idle';

            // SEAT ANCHOR RESOLUTION & ZERO AIR-SITTING ENFORCEMENT
            let hasValidSeat = false;
            if (step.anchorId && this.interactionManager) {
                const anchor = this.interactionManager.getAnchor(step.anchorId);
                const alreadyOwnedByMe = this.interactionManager.entitySlotMap?.get(this.def.id)?.anchorId === step.anchorId;
                const successfullyClaimed = alreadyOwnedByMe || this.interactionManager.claimAnchor(step.anchorId, this.def.id, this.group.position);

                if (anchor && successfullyClaimed) {
                    this.claimedAnchorId = step.anchorId;
                    const seatPos = this.interactionManager.getSeatSlotPosition(step.anchorId, this.def.id) || anchor.position;
                    this.group.position.x = seatPos.x;
                    this.group.position.z = seatPos.z;
                    const groundY = seatPos.y !== undefined ? seatPos.y : this.terrain.getTerrainHeight(seatPos.x, seatPos.z);
                    this.group.position.y = groundY;
                    this.group.rotation.y = anchor.rotationY || 0;
                    if (anchor.type === 'seat') {
                        hasValidSeat = true;
                        if (this.retargeter.setSeatConfig) {
                            this.retargeter.setSeatConfig(anchor);
                        }
                    }
                } else {
                    // Seat is occupied by someone else or anchor unavailable
                    if (animToPlay.startsWith('Sit')) {
                        animToPlay = 'Thinking';
                    }
                    if (this.retargeter.setSeatConfig) {
                        this.retargeter.setSeatConfig(null);
                    }
                    this.updateBadge('*waiting for seat...*');
                }
            } else if (this.retargeter.setSeatConfig) {
                this.retargeter.setSeatConfig(null);
            }

            // ABSOLUTE RULE: If no valid physical seat is claimed, NPC CANNOT play any Sit animation!
            if (animToPlay.startsWith('Sit') && !hasValidSeat) {
                animToPlay = 'Idle';
                if (this.retargeter.setSeatConfig) {
                    this.retargeter.setSeatConfig(null);
                }
            }

            this.retargeter.setAnimation(animToPlay);
            if (!this.currentStatusText.includes('waiting')) {
                this.updateBadge(step.statusText);
            }
        }
    }

    update(delta, playerPos = null) {
        this.stepTimer += delta;
        const step = this.def.routine[this.routineIndex];

        // 1. Calculate Distance to Player for Animation Distance LOD with Hysteresis & Smooth Blending
        const pPos = playerPos || window.openWorld3D?.player?.position;
        let dist = 0;
        if (pPos) {
            dist = Math.hypot(this.group.position.x - pPos.x, this.group.position.z - pPos.z);
        }

        if (this.currentLod === undefined) this.currentLod = 0;

        // Dual-threshold Hysteresis state machine to prevent boundary chatter/thrashing
        if (this.currentLod === 0) {
            if (dist > 22.0) this.currentLod = 1;
        } else if (this.currentLod === 1) {
            if (dist < 18.0) {
                this.currentLod = 0;
            } else if (dist > 52.0) {
                this.currentLod = 2;
            }
        } else if (this.currentLod === 2) {
            if (dist < 48.0) this.currentLod = 1;
        }

        // Target update interval according to state
        let targetInterval = 0;
        if (this.currentLod === 2) {
            targetInterval = 0.066; // 15 FPS update interval for far avatars (>50m)
        } else if (this.currentLod === 1) {
            targetInterval = 0.033; // 30 FPS update interval for mid avatars (20m - 50m)
        } else {
            targetInterval = 0;     // 60-120 FPS full fidelity for near avatars (<20m)
        }

        // Continuous S-Curve smooth blend for secondary motion physics (18m - 22m window)
        let physicsWeight = 1.0;
        if (dist <= 18.0) {
            physicsWeight = 1.0;
        } else if (dist >= 22.0) {
            physicsWeight = 0.0;
        } else {
            // Hermite cubic smoothstep: 18m -> 1.0 down to 22m -> 0.0
            const t = (dist - 18.0) / 4.0;
            physicsWeight = 1.0 - t * t * (3.0 - 2.0 * t);
        }

        let lodOptions = {
            physicsWeight: physicsWeight,
            skipHairSprings: physicsWeight <= 0.001,
            skipSecondaryMotion: physicsWeight <= 0.001,
            skipFaceRig: this.currentLod === 2,
            skipFingerCurl: this.currentLod === 2
        };

        this.animAccumulator += delta;
        const shouldUpdateAnim = (targetInterval === 0) || (this.animAccumulator >= targetInterval);
        const animStepDelta = shouldUpdateAnim ? this.animAccumulator : delta;

        if (this.state === 'walking') {
            const curX = this.group.position.x;
            const curZ = this.group.position.z;
            const dx = this.targetPos.x - curX;
            const dz = this.targetPos.z - curZ;
            const dist = Math.hypot(dx, dz);

            if (dist > 0.4) {
                // Move towards current waypoint
                const stepDist = Math.min(dist, this.moveSpeed * delta);
                const dirX = dx / dist;
                const dirZ = dz / dist;

                let nextX = curX + dirX * stepDist;
                let nextZ = curZ + dirZ * stepDist;

                // Resolve world collisions (handrails, bridge decks, furniture)
                if (this.terrain && typeof this.terrain.resolveCollision === 'function') {
                    const resolved = this.terrain.resolveCollision(curX, curZ, nextX, nextZ);
                    nextX = resolved.x;
                    nextZ = resolved.z;
                }

                // Never step into water
                const nav = window.npcNavSystem || npcNavSystem;
                if (nav && nav.isWater(nextX, nextZ)) {
                    if (curZ >= nav.bridgeNorthZ - 1.0 && curZ <= nav.bridgeSouthZ + 1.0) {
                        nextX = nav.bridgeCenter.x;
                    } else {
                        nextX = curX;
                        nextZ = curZ;
                    }
                }

                this.group.position.x = nextX;
                this.group.position.z = nextZ;

                // Turn character smoothly towards walking direction with shortest-arc slerp
                const targetRotY = Math.atan2(dirX, dirZ);
                let diffRotY = targetRotY - this.group.rotation.y;
                while (diffRotY > Math.PI) diffRotY -= Math.PI * 2;
                while (diffRotY < -Math.PI) diffRotY += Math.PI * 2;
                this.group.rotation.y += diffRotY * Math.min(1.0, delta * 8.0);

                // Update height on terrain or bridge
                let ny;
                if (nav && nav.isOnBridge(this.group.position.x, this.group.position.z)) {
                    const spanLen = nav.bridgeSouthZ - nav.bridgeNorthZ;
                    const t = Math.max(0, Math.min(1, (this.group.position.z - nav.bridgeNorthZ) / spanLen));
                    ny = Math.sin(t * Math.PI) * 0.68 + 0.24;
                } else if (this.terrain) {
                    ny = this.terrain.getTerrainHeight(this.group.position.x, this.group.position.z);
                } else {
                    ny = 0;
                }
                this.group.position.y = ny;

                // Update retargeter with walk locomotion according to LOD rate
                if (shouldUpdateAnim) {
                    this.retargeter.update(animStepDelta, true, false, lodOptions);
                    this.animAccumulator = 0;
                }
            } else {
                // Check if more waypoints exist in path
                this.currentWaypointIdx++;
                if (this.pathWaypoints && this.currentWaypointIdx < this.pathWaypoints.length) {
                    const nextWp = this.pathWaypoints[this.currentWaypointIdx];
                    this.targetPos.set(nextWp.x, 0, nextWp.z);
                    if (shouldUpdateAnim) {
                        this.retargeter.update(animStepDelta, true, false, lodOptions);
                        this.animAccumulator = 0;
                    }
                    return;
                }

                // Arrived at final destination!
                this.state = 'working';
                this.stepTimer = 0;
                let animToPlay = step.anim || 'Idle';

                // SEAT ANCHOR RESOLUTION & ZERO AIR-SITTING ENFORCEMENT
                let hasValidSeat = false;
                if (step.anchorId && this.interactionManager) {
                    const anchor = this.interactionManager.getAnchor(step.anchorId);
                    const alreadyOwnedByMe = this.interactionManager.entitySlotMap?.get(this.def.id)?.anchorId === step.anchorId;
                    const successfullyClaimed = alreadyOwnedByMe || this.interactionManager.claimAnchor(step.anchorId, this.def.id, this.group.position);

                    if (anchor && successfullyClaimed) {
                        this.claimedAnchorId = step.anchorId;
                        const seatPos = this.interactionManager.getSeatSlotPosition(step.anchorId, this.def.id) || anchor.position;
                        this.group.position.x = seatPos.x;
                        this.group.position.z = seatPos.z;
                        const groundY = seatPos.y !== undefined ? seatPos.y : this.terrain.getTerrainHeight(seatPos.x, seatPos.z);
                        this.group.position.y = groundY;
                        this.group.rotation.y = anchor.rotationY || 0;
                        if (anchor.type === 'seat') {
                            hasValidSeat = true;
                            if (this.retargeter.setSeatConfig) {
                                this.retargeter.setSeatConfig(anchor);
                            }
                        }
                    } else {
                        // Seat is occupied by someone else or anchor unavailable
                        if (animToPlay.startsWith('Sit')) {
                            animToPlay = 'Thinking';
                        }
                        if (this.retargeter.setSeatConfig) {
                            this.retargeter.setSeatConfig(null);
                        }
                        this.updateBadge('*waiting for seat...*');
                    }
                } else if (this.retargeter.setSeatConfig) {
                    this.retargeter.setSeatConfig(null);
                }

                // ABSOLUTE RULE: If no valid physical seat is claimed, NPC CANNOT play any Sit animation!
                if (animToPlay.startsWith('Sit') && !hasValidSeat) {
                    animToPlay = 'Idle';
                    if (this.retargeter.setSeatConfig) {
                        this.retargeter.setSeatConfig(null);
                    }
                }

                this.retargeter.setAnimation(animToPlay);
                if (!this.currentStatusText.includes('waiting')) {
                    this.updateBadge(step.statusText);
                }
                this.retargeter.update(animStepDelta, false, false, lodOptions);
                this.animAccumulator = 0;
            }
        } else {
            // Working / relaxing at activity zone
            if (shouldUpdateAnim) {
                this.retargeter.update(animStepDelta, false, false, lodOptions);
                this.animAccumulator = 0;
            }

            if (this.stepTimer >= (step.duration || 20.0)) {
                // Release anchor before transitioning to next step
                if (this.claimedAnchorId && this.interactionManager) {
                    this.interactionManager.releaseAnchor(this.claimedAnchorId, this.def.id);
                    this.claimedAnchorId = null;
                }
                if (this.retargeter?.setSeatConfig) {
                    this.retargeter.setSeatConfig(null);
                }
                this.routineIndex = (this.routineIndex + 1) % this.def.routine.length;
                this.applyCurrentRoutineStep();
            }
        }

        // Conversational Look-At Head Tracking towards player with reversible offsets & Schmitt-trigger hysteresis
        if (this.retargeter?.mappedBones?.Head) {
            const headBone = this.retargeter.mappedBones.Head;
            const neckBone = this.retargeter.mappedBones.Neck;

            // Revert previously applied look-at rotation offset to preserve base pose
            if (this.lastAppliedHeadYaw) {
                headBone.rotation.y -= this.lastAppliedHeadYaw;
                this.lastAppliedHeadYaw = 0;
            }
            if (this.lastAppliedHeadPitch) {
                headBone.rotation.x -= this.lastAppliedHeadPitch;
                this.lastAppliedHeadPitch = 0;
            }
            if (neckBone && this.lastAppliedNeckYaw) {
                neckBone.rotation.y -= this.lastAppliedNeckYaw;
                this.lastAppliedNeckYaw = 0;
            }

            // Schmitt-trigger hysteresis tracking band per Argon spec
            let shouldTrack = false;
            let targetHeadYaw = 0;
            let targetHeadPitch = 0;

            if (pPos && this.group) {
                const dx = pPos.x - this.group.position.x;
                const dz = pPos.z - this.group.position.z;
                const dy = (pPos.y + 1.45) - (this.group.position.y + 1.35);
                const d = Math.hypot(dx, dz);
                const angleToPlayer = Math.atan2(dx, dz);
                let localAngle = angleToPlayer - this.group.rotation.y;
                while (localAngle > Math.PI) localAngle -= Math.PI * 2;
                while (localAngle < -Math.PI) localAngle += Math.PI * 2;
                const absAngle = Math.abs(localAngle);

                // Hysteresis: Engage at < 1.45 rad & < 4.2m; Disengage at > 1.65 rad or > 4.8m
                if (this.isHeadTrackingEngaged) {
                    if (absAngle < 1.65 && d < 4.8) {
                        shouldTrack = true;
                    } else {
                        this.isHeadTrackingEngaged = false;
                    }
                } else {
                    if (absAngle < 1.45 && d < 4.2) {
                        shouldTrack = true;
                        this.isHeadTrackingEngaged = true;
                    }
                }

                if (shouldTrack) {
                    targetHeadYaw = THREE.MathUtils.clamp(localAngle * 0.65, -0.75, 0.75);
                    targetHeadPitch = THREE.MathUtils.clamp(-dy * 0.22, -0.32, 0.32);
                }
            } else {
                this.isHeadTrackingEngaged = false;
            }

            // Frame-rate invariant exponential decay damping per Argon: alpha = 1 - exp(-lambda * delta)
            const decayAlpha = 1.0 - Math.exp(-9.0 * delta);
            this.headTrackYaw = (this.headTrackYaw || 0) + (targetHeadYaw - (this.headTrackYaw || 0)) * decayAlpha;
            this.headTrackPitch = (this.headTrackPitch || 0) + (targetHeadPitch - (this.headTrackPitch || 0)) * decayAlpha;

            // Apply distributed offset (70% Head, 30% Neck) if non-zero
            if (Math.abs(this.headTrackYaw) > 0.001 || Math.abs(this.headTrackPitch) > 0.001) {
                const appliedHeadYaw = this.headTrackYaw * 0.70;
                const appliedHeadPitch = this.headTrackPitch;
                const appliedNeckYaw = this.headTrackYaw * 0.30;

                headBone.rotation.y += appliedHeadYaw;
                headBone.rotation.x += appliedHeadPitch;
                this.lastAppliedHeadYaw = appliedHeadYaw;
                this.lastAppliedHeadPitch = appliedHeadPitch;

                if (neckBone) {
                    neckBone.rotation.y += appliedNeckYaw;
                    this.lastAppliedNeckYaw = appliedNeckYaw;
                }
            } else {
                this.headTrackYaw = 0;
                this.headTrackPitch = 0;
            }
        }
    }

    jumpToRoutine(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.def.routine.length) return;
        if (this.claimedAnchorId && this.interactionManager) {
            this.interactionManager.releaseAnchor(this.claimedAnchorId, this.def.id);
            this.claimedAnchorId = null;
        }
        if (this.retargeter?.setSeatConfig) {
            this.retargeter.setSeatConfig(null);
        }
        this.routineIndex = stepIndex;
        const step = this.def.routine[stepIndex];
        this.pathWaypoints = [];
        this.currentWaypointIdx = 0;
        this.group.position.x = step.targetPos.x;
        this.group.position.z = step.targetPos.z;
        this.group.position.y = this.terrain ? this.terrain.getTerrainHeight(step.targetPos.x, step.targetPos.z) : 0;
        this.applyCurrentRoutineStep();
    }
}

export class NpcLifeSystem {
    constructor(terrainSystem, interactionManager, overheadUi = null) {
        this.terrain = terrainSystem;
        this.interactionManager = interactionManager;
        this.overheadUi = overheadUi;
        this.agents = [];
        this.schedules = NPC_SCHEDULES;
    }

    getAgent(npcId) {
        return this.agents.find(a => a.def.id === npcId) || null;
    }

    getNpc(npcId) {
        return this.getAgent(npcId);
    }

    setOverheadUi(overheadUi) {
        this.overheadUi = overheadUi;
        for (const agent of this.agents) {
            agent.overheadUi = overheadUi;
            if (overheadUi) {
                overheadUi.registerBadge(agent.def.id, {
                    name: agent.def.name,
                    level: agent.def.level || 1,
                    roleTitle: agent.def.roleTitle || agent.def.role,
                    roleTitleVi: agent.def.roleTitleVi || null,
                    borderColor: agent.def.badgeColor || '#38bdf8',
                    statusColor: agent.def.badgeColor || '#38bdf8',
                    glowColor: agent.def.badgeColor || 'rgba(56, 189, 248, 0.4)',
                    rootObj: agent.group,
                    headBone: agent.retargeter?.mappedBones?.Head,
                    statusText: agent.currentStatusText || '*vibing*'
                });
            }
        }
    }

    registerNpc(npcGroup, retargeter, npcId) {
        const schedule = NPC_SCHEDULES[npcId];
        if (!schedule) return;

        const agent = new NpcLifeAgent(
            npcGroup,
            retargeter,
            schedule,
            this.terrain,
            this.interactionManager,
            this.overheadUi
        );
        this.agents.push(agent);
    }

    update(delta, playerPos = null) {
        for (let i = 0; i < this.agents.length; i++) {
            this.agents[i].update(delta, playerPos);
        }
    }
}
