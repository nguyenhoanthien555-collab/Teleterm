import * as THREE from '/vendor/three/build/three.module.js';

/**
 * TELETERM 3D — LIVING NPC DYNAMIC SCHEDULE & WEATHER REACTIVITY
 * Engineered according to Argon Architecture Spec:
 * 1. Time-of-Day Macro Schedules:
 *    - Dawn (05:00 - 08:00): Morning stroll & stretching near Zen Pond / Cherry Avenue
 *    - Midday (08:00 - 17:00): Productive work, coding, visiting cafe, tea tasting
 *    - Twilight (17:00 - 20:00): Sunset contemplation at scenic overlook
 *    - Cyberpunk Night (20:00 - 05:00): Gathering at Hub neon terrace, group VibeDance flashmob
 * 2. Staggered Delays (0.5s - 3.0s):
 *    Randomized phase offsets prevent all NPCs from repathing/updating in the same frame.
 * 3. Weather-Reactive Behavior:
 *    - In Neon Rain: Dynamically instantiates a sleek translucent cyber-umbrella prop.
 *    - In Zen Falling Leaves: Triggers peaceful reflection / meditation.
 */

export class LivingNpcScheduleManager {
    constructor(scene, npcLifeSystem, groupSyncManager, openWorld3D = null) {
        this.scene = scene;
        this.npcLifeSystem = npcLifeSystem;
        this.groupSyncManager = groupSyncManager;
        this.openWorld3D = openWorld3D;

        // Active umbrella meshes per NPC: npcId -> THREE.Group
        this.umbrellas = new Map();

        // Stagger delays to eliminate CPU frame spikes
        this.npcStaggers = new Map(); // npcId -> remainingDelaySec

        // Current weather cache
        this.currentWeather = 'none';
        this.currentTimePhase = 'midday';

        if (typeof window !== 'undefined') {
            window.livingNpcScheduleManager = this;
        }
    }

    update(delta, timeOfDayHour, weatherType = 'none') {
        this.currentWeather = weatherType;
        const newPhase = this._getPhaseFromHour(timeOfDayHour);

        // Gather NPCs from either openWorld3D.npcs or npcLifeSystem.agents
        const npcTargets = [];
        if (this.openWorld3D?.npcs?.length > 0) {
            for (const n of this.openWorld3D.npcs) {
                npcTargets.push({
                    id: n.userData?.id,
                    group: n,
                    retargeter: n.userData?.retargeter
                });
            }
        } else if (this.npcLifeSystem?.agents?.length > 0) {
            for (const ag of this.npcLifeSystem.agents) {
                npcTargets.push({
                    id: ag.schedule?.id,
                    group: ag.group,
                    retargeter: ag.retargeter
                });
            }
        }

        // Process each active NPC with staggered delays
        for (const npc of npcTargets) {
            const id = npc.id;
            if (!id || !npc.group) continue;

            let stagger = this.npcStaggers.get(id) || 0;
            if (stagger > 0) {
                this.npcStaggers.set(id, stagger - delta);
                continue;
            }

            // Weather reaction (Cyber Umbrella in rain)
            this._updateWeatherReactivity(id, npc.group, weatherType);

            // Phase transition
            if (newPhase !== this.currentTimePhase) {
                this.npcStaggers.set(id, Math.random() * 2.5 + 0.5);
                this._applyTimePhaseRoutine(id, npc, newPhase);
            }
        }

        this.currentTimePhase = newPhase;
    }

    _getPhaseFromHour(h) {
        if (h >= 5.0 && h < 8.0) return 'dawn';
        if (h >= 8.0 && h < 17.0) return 'midday';
        if (h >= 17.0 && h < 20.0) return 'twilight';
        return 'night';
    }

    _updateWeatherReactivity(id, group, weatherType) {
        const isRaining = weatherType === 'neon_rain';
        const hasUmbrella = this.umbrellas.has(id);

        if (isRaining && !hasUmbrella && group) {
            // Create holographic umbrella
            const umbrellaGroup = this._createCyberUmbrella();
            group.add(umbrellaGroup);
            umbrellaGroup.position.set(0.2, 1.6, 0.1);
            this.umbrellas.set(id, umbrellaGroup);
        } else if (!isRaining && hasUmbrella) {
            const umbrellaGroup = this.umbrellas.get(id);
            if (umbrellaGroup && umbrellaGroup.parent) {
                umbrellaGroup.parent.remove(umbrellaGroup);
            }
            this.umbrellas.delete(id);
        }
    }

    _createCyberUmbrella() {
        const group = new THREE.Group();

        // Canopy (Translucent terracotta hexagonal cone)
        const canopyGeom = new THREE.ConeGeometry(0.65, 0.22, 6, 1, true);
        const canopyMat = new THREE.MeshStandardMaterial({
            color: 0xda7756,
            emissive: 0xc56545,
            emissiveIntensity: 0.25,
            roughness: 0.2,
            metalness: 0.1,
            transparent: true,
            opacity: 0.72,
            side: THREE.DoubleSide
        });
        const canopy = new THREE.Mesh(canopyGeom, canopyMat);
        canopy.rotation.x = Math.PI;
        canopy.position.y = 0.45;
        group.add(canopy);

        // Shaft & Handle
        const shaftGeom = new THREE.CylinderGeometry(0.012, 0.012, 0.6, 8);
        const shaftMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 });
        const shaft = new THREE.Mesh(shaftGeom, shaftMat);
        shaft.position.y = 0.2;
        group.add(shaft);

        return group;
    }

    _applyTimePhaseRoutine(id, npc, phase) {
        if (!npc || !npc.retargeter) return;

        // Night Flashmob behavior: Lumina & Sakura gather at Hub neon deck for VibeDance
        if (phase === 'night') {
            if (id === 'lumina' || id === 'sakura') {
                if (typeof npc.retargeter.setAnimation === 'function') {
                    npc.retargeter.setAnimation('VibeDance');
                } else if (typeof npc.playEmote === 'function') {
                    npc.playEmote('VibeDance');
                }
                if (npc.setStatusText) {
                    npc.setStatusText('late-night vibe dance');
                }
            }
        } else if (phase === 'dawn') {
            // Morning peaceful stretch / meditate
            if (id === 'ren' || id === 'kaede') {
                if (typeof npc.retargeter.setAnimation === 'function') {
                    npc.retargeter.setAnimation('Meditate');
                } else if (typeof npc.playEmote === 'function') {
                    npc.playEmote('Meditate');
                }
                if (npc.setStatusText) {
                    npc.setStatusText('dawn mindfulness meditation');
                }
            }
        }
    }
}
