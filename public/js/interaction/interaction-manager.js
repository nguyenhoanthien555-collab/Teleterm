/**
 * INTERACTION FRAMEWORK & ANCHOR REGISTRY
 * Implements Section 31, 32, and 37 of TeleTerm Living Open World Master Spec v3.
 * Manages semantic interactive anchors (Benches, Chairs, Desks, Terminals, Shrines, Vending Machines)
 * with entry alignments, animation targets, duration, and occupancy tracking.
 */

export class InteractionManager {
    constructor() {
        this.anchors = new Map(); // id -> anchor def
        this.occupants = new Map(); // anchorId -> primary entity (backward compat)
        this.slotOccupants = new Map(); // anchorId -> Map<slotIndex, entityId>
        this.entitySlotMap = new Map(); // entityId -> { anchorId, slotIndex }
        this.initDefaultWorldAnchors();
    }

    initDefaultWorldAnchors() {
        // 1. DEVELOPER HUB & CAFE SEATING & CODING DESKS
        // Hub timber platform deck surface is calibrated at y = 0.387
        this.registerAnchor({
            id: 'hub_desk_chair_1',
            type: 'seat',
            category: 'coding_desk',
            labelKey: 'anchor_hub_desk_1',
            label: 'Code at Hub Coding Desk #1',
            position: { x: 20.6, y: 1.04, z: -11.05 },
            rotationY: Math.PI,
            interactionRadius: 1.8,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitTyping',
            allowedAnims: ['SitTyping', 'SitThinking', 'SitCoffee', 'SitIdle'],
            exitOffset: { x: 0, z: 0.65 }
        });

        this.registerAnchor({
            id: 'hub_desk_chair_2',
            type: 'seat',
            category: 'coding_desk',
            labelKey: 'anchor_hub_desk_2',
            label: 'Code at Hub Coding Desk #2',
            position: { x: 23.2, y: 1.04, z: -11.05 },
            rotationY: Math.PI,
            interactionRadius: 1.8,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitTyping',
            allowedAnims: ['SitTyping', 'SitThinking', 'SitCoffee', 'SitIdle'],
            exitOffset: { x: 0, z: 0.65 }
        });

        this.registerAnchor({
            id: 'hub_desk_chair_3',
            type: 'seat',
            category: 'coding_desk',
            labelKey: 'anchor_hub_desk_3',
            label: 'Code at Hub Developer Desk #3',
            position: { x: 18.2, y: 1.04, z: -12.25 },
            rotationY: Math.PI + 0.2,
            interactionRadius: 1.8,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitTyping',
            allowedAnims: ['SitTyping', 'SitThinking', 'SitCoffee', 'SitIdle'],
            exitOffset: { x: 0.2, z: 0.65 }
        });

        this.registerAnchor({
            id: 'hub_desk_chair_4',
            type: 'seat',
            category: 'coding_desk',
            labelKey: 'anchor_hub_desk_4',
            label: 'Code at Hub Coding Desk #4',
            position: { x: 23.2, y: 1.04, z: -13.4 },
            rotationY: Math.PI,
            interactionRadius: 1.8,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitTyping',
            allowedAnims: ['SitTyping', 'SitThinking', 'SitCoffee', 'SitIdle'],
            exitOffset: { x: 0, z: 0.65 }
        });

        // Elevated Bar Stools in front of the Cafe Counter
        this.registerAnchor({
            id: 'hub_cafe_lounge_chair',
            type: 'seat',
            category: 'cafe_stool',
            labelKey: 'anchor_hub_cafe_bar_1',
            label: 'Relax with coffee at the cafe bar #1',
            position: { x: 24.4, y: 1.04, z: -10.6 },
            rotationY: Math.PI * 0.5,
            interactionRadius: 1.1,
            sitHeightOffset: 0.62,
            isBarStool: true,
            defaultAnim: 'SitCoffee',
            allowedAnims: ['SitCoffee', 'SitRelaxed', 'SitIdle', 'SitReading'],
            exitOffset: { x: -0.65, z: 0 }
        });

        this.registerAnchor({
            id: 'hub_cafe_lounge_chair_2',
            type: 'seat',
            category: 'cafe_stool',
            labelKey: 'anchor_hub_cafe_bar_2',
            label: 'Enjoy espresso at bar stool #2',
            position: { x: 24.4, y: 1.04, z: -9.6 },
            rotationY: Math.PI * 0.5,
            interactionRadius: 1.1,
            sitHeightOffset: 0.62,
            isBarStool: true,
            defaultAnim: 'SitCoffee',
            allowedAnims: ['SitCoffee', 'SitRelaxed', 'SitIdle', 'SitReading'],
            exitOffset: { x: -0.65, z: 0 }
        });

        this.registerAnchor({
            id: 'hub_cafe_lounge_chair_3',
            type: 'seat',
            category: 'cafe_stool',
            labelKey: 'anchor_hub_cafe_bar_3',
            label: 'Enjoy specialty drink at bar stool #3',
            position: { x: 24.4, y: 1.04, z: -8.6 },
            rotationY: Math.PI * 0.5,
            interactionRadius: 1.1,
            sitHeightOffset: 0.62,
            isBarStool: true,
            defaultAnim: 'SitCoffee',
            allowedAnims: ['SitCoffee', 'SitRelaxed', 'SitIdle', 'SitReading'],
            exitOffset: { x: -0.65, z: 0 }
        });

        this.registerAnchor({
            id: 'hub_cafe_lounge_chair_4',
            type: 'seat',
            category: 'cafe_stool',
            labelKey: 'anchor_hub_cafe_bar_4',
            label: 'Enjoy specialty drink at bar stool #4',
            position: { x: 24.4, y: 1.04, z: -7.6 },
            rotationY: Math.PI * 0.5,
            interactionRadius: 1.1,
            sitHeightOffset: 0.62,
            isBarStool: true,
            defaultAnim: 'SitCoffee',
            allowedAnims: ['SitCoffee', 'SitRelaxed', 'SitIdle', 'SitReading'],
            exitOffset: { x: -0.65, z: 0 }
        });

        // Dedicated Barista Workstation behind the Cafe Counter
        this.registerAnchor({
            id: 'hub_barista_spot',
            type: 'barista_station',
            category: 'standing',
            labelKey: 'anchor_hub_barista',
            label: 'Artisan Cafe Barista Station',
            position: { x: 26.6, y: 1.04, z: -9.6 },
            rotationY: -Math.PI * 0.5, // Faces West towards customers and counter
            interactionRadius: 1.8,
            defaultAnim: 'Coffee',
            allowedAnims: ['Coffee', 'Thinking', 'Idle', 'Wave'],
            exitOffset: { x: 0, z: 0.5 }
        });

        // Terminal Console Anchor: Positioned ergonomically IN FRONT OF the console pedestal
        // at world (17.8, 1.04, -9.0), facing +Z towards the console at (17.8, -8.2).
        // User stands firmly on the timber platform deck, hands reaching the angled console head.
        this.registerAnchor({
            id: 'hub_kiosk_terminal',
            type: 'terminal_kiosk',
            category: 'terminal',
            labelKey: 'anchor_hub_kiosk',
            label: 'Interact with Hologram Terminal Console',
            position: { x: 17.8, y: 1.04, z: -9.0 },
            rotationY: 0,
            interactionRadius: 1.8,
            defaultAnim: 'Typing',
            allowedAnims: ['Typing', 'Thinking', 'Idle'],
            exitOffset: { x: 0, z: -0.6 }
        });

        // 2. COUNTRYSIDE SAKURA BENCH (Under blooming cherry tree by country road)
        this.registerAnchor({
            id: 'wayside_sakura_bench',
            type: 'seat',
            category: 'bench',
            capacity: 2,
            labelKey: 'anchor_wayside_bench',
            label: 'Watch cherry blossoms by the roadside',
            position: { x: 5.5, y: 0.245, z: -6.0 },
            rotationY: -0.3,
            interactionRadius: 2.0,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitRelaxed',
            allowedAnims: ['SitRelaxed', 'SitReading', 'SitThinking', 'SitIdle'],
            exitOffset: { x: -0.8, z: 0.3 }
        });

        // 3. RIVER VALLEY VISTA BENCH (Overlooking river meander & arched bridge)
        this.registerAnchor({
            id: 'river_valley_bench',
            type: 'seat',
            category: 'bench',
            capacity: 2,
            labelKey: 'anchor_river_bench',
            label: 'Watch the gentle river flow',
            position: { x: 8.5, y: 0.240, z: 19.2 },
            rotationY: -Math.PI * 0.65,
            interactionRadius: 2.0,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitLookingAtView',
            allowedAnims: ['SitLookingAtView', 'SitThinking', 'SitRelaxed'],
            exitOffset: { x: -0.6, z: -0.6 }
        });

        // 4. CHERRY GROVE HILLSIDE BENCH
        this.registerAnchor({
            id: 'cherry_grove_bench',
            type: 'seat',
            category: 'bench',
            capacity: 2,
            labelKey: 'anchor_cherry_bench',
            label: 'Rest on cherry grove hillside',
            position: { x: 25.0, y: 1.15, z: -15.5 },
            rotationY: -Math.PI * 0.45,
            interactionRadius: 2.2,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitReading',
            allowedAnims: ['SitReading', 'SitRelaxed', 'SitCoffee'],
            exitOffset: { x: -0.8, z: 0.2 }
        });

        // 5. HILLTOP ALPINE PANORAMA BENCH (Looking out toward distant snow mountains)
        this.registerAnchor({
            id: 'hilltop_panorama_bench',
            type: 'seat',
            category: 'bench',
            capacity: 2,
            labelKey: 'anchor_hilltop_bench',
            label: 'Panoramic view of snowy mountains',
            position: { x: 34.0, y: 4.58, z: -48.0 },
            rotationY: -Math.PI * 0.85,
            interactionRadius: 2.2,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitLookingAtView',
            allowedAnims: ['SitLookingAtView', 'SitThinking', 'SitRelaxed'],
            exitOffset: { x: 0, z: 0.8 }
        });

        // 6. COASTAL WOODEN PIER SEASIDE DOCK BENCH
        this.registerAnchor({
            id: 'beach_pier_bench',
            type: 'seat',
            category: 'bench',
            capacity: 2,
            labelKey: 'anchor_pier_bench',
            label: 'Enjoy ocean breeze at pierhead',
            position: { x: 10.5, y: 0.19, z: 98.0 },
            rotationY: 0.0,
            interactionRadius: 2.0,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitLookingAtView',
            allowedAnims: ['SitLookingAtView', 'SitVibing', 'SitRelaxed'],
            exitOffset: { x: 0, z: -0.8 }
        });

        // 6b. COASTAL SHORE DUNE BENCH (Physically grounded under beach umbrella)
        this.registerAnchor({
            id: 'beach_shore_bench',
            type: 'seat',
            category: 'bench',
            capacity: 2,
            labelKey: 'anchor_beach_bench',
            label: 'Enjoy ocean breeze under beach umbrella',
            position: { x: 22.0, y: 0.0, z: 56.0 },
            rotationY: 0.0,
            interactionRadius: 2.2,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitLookingAtView',
            allowedAnims: ['SitLookingAtView', 'SitVibing', 'SitRelaxed'],
            exitOffset: { x: 0, z: -0.8 }
        });

        // 8. RUSTIC VENDING MACHINE (Village roadside rest stop)
        this.registerAnchor({
            id: 'village_vending_machine',
            type: 'vending_machine',
            category: 'vending',
            labelKey: 'anchor_vending_machine',
            label: 'Get green tea / canned coffee from vending machine',
            position: { x: 3.6, y: 0.12, z: -21.5 },
            rotationY: -Math.PI * 0.5,
            interactionRadius: 1.8,
            defaultAnim: 'Coffee',
            exitOffset: { x: -0.6, z: 0.0 }
        });

        // 9. ZEN TEA PAVILION TATAMI MEDITATION MATS (Bamboo Forest)
        // Sitters face each other across the low tea table (at x: -22.0, z: -25.0)
        this.registerAnchor({
            id: 'bamboo_tea_mat_1',
            type: 'seat',
            category: 'tatami',
            capacity: 1,
            labelKey: 'anchor_bamboo_mat_1',
            label: 'Meditate at Zen Tea Pavilion Mat #1',
            position: { x: -22.85, y: 1.058, z: -25.0 },
            rotationY: Math.PI * 0.5, // Faces +X directly toward tea table in pavilion center
            interactionRadius: 2.0,
            sitHeightOffset: 0.04,
            defaultAnim: 'SitIdle',
            allowedAnims: ['SitIdle', 'SitRelaxed', 'SitCoffee', 'SitThinking'],
            exitOffset: { x: -0.6, z: 0.6 }
        });

        this.registerAnchor({
            id: 'bamboo_tea_mat_2',
            type: 'seat',
            category: 'tatami',
            capacity: 1,
            labelKey: 'anchor_bamboo_mat_2',
            label: 'Rest at Zen Tea Pavilion Mat #2',
            position: { x: -21.15, y: 1.058, z: -25.0 },
            rotationY: -Math.PI * 0.5, // Faces -X directly toward tea table in pavilion center
            interactionRadius: 2.0,
            sitHeightOffset: 0.04,
            defaultAnim: 'SitIdle',
            allowedAnims: ['SitIdle', 'SitRelaxed', 'SitCoffee', 'SitThinking'],
            exitOffset: { x: 0.6, z: 0.6 }
        });

        // 10. MAPLE STREAM REST STOP: 4 LOG STOOLS AROUND TEA TABLE (Facing table center at 42.0, -32.0)
        this.registerAnchor({
            id: 'maple_picnic_stool_1',
            type: 'seat',
            category: 'stool',
            capacity: 1,
            labelKey: 'anchor_maple_picnic',
            label: 'Picnic under golden-red maples (North Seat)',
            position: { x: 42.0, y: 1.45, z: -30.75 },
            rotationY: Math.PI, // Faces South directly toward tea table center
            interactionRadius: 1.8,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitRelaxed',
            allowedAnims: ['SitRelaxed', 'SitCoffee', 'SitThinking'],
            exitOffset: { x: 0, z: 0.6 }
        });

        this.registerAnchor({
            id: 'maple_picnic_stool_2',
            type: 'seat',
            category: 'stool',
            capacity: 1,
            labelKey: 'anchor_maple_picnic',
            label: 'Picnic under golden-red maples (West Seat)',
            position: { x: 40.75, y: 1.45, z: -32.0 },
            rotationY: Math.PI * 0.5, // Faces East directly toward tea table center
            interactionRadius: 1.8,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitRelaxed',
            allowedAnims: ['SitRelaxed', 'SitCoffee', 'SitThinking'],
            exitOffset: { x: -0.6, z: 0 }
        });

        this.registerAnchor({
            id: 'maple_picnic_stool_3',
            type: 'seat',
            category: 'stool',
            capacity: 1,
            labelKey: 'anchor_maple_picnic',
            label: 'Picnic under golden-red maples (South Seat)',
            position: { x: 42.0, y: 1.45, z: -33.25 },
            rotationY: 0.0, // Faces North directly toward tea table center
            interactionRadius: 1.8,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitRelaxed',
            allowedAnims: ['SitRelaxed', 'SitCoffee', 'SitThinking'],
            exitOffset: { x: 0, z: -0.6 }
        });

        this.registerAnchor({
            id: 'maple_picnic_stool_4',
            type: 'seat',
            category: 'stool',
            capacity: 1,
            labelKey: 'anchor_maple_picnic',
            label: 'Picnic under golden-red maples (East Seat)',
            position: { x: 43.25, y: 1.45, z: -32.0 },
            rotationY: -Math.PI * 0.5, // Faces West directly toward tea table center
            interactionRadius: 1.8,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitRelaxed',
            allowedAnims: ['SitRelaxed', 'SitCoffee', 'SitThinking'],
            exitOffset: { x: 0.6, z: 0 }
        });

        // 10b. MAPLE VALLEY STREAM BENCH (Long 2-seater overlooking stream & footbridge from north bank)
        this.registerAnchor({
            id: 'maple_stream_bench_1',
            type: 'seat',
            category: 'bench',
            capacity: 2,
            labelKey: 'anchor_maple_bench',
            label: 'Watch the bubbling stream in Maple Valley',
            position: { x: 37.0, y: 1.35, z: -23.5 },
            rotationY: -Math.PI * 0.65,
            interactionRadius: 2.2,
            sitHeightOffset: 0.44,
            defaultAnim: 'SitLookingAtView',
            allowedAnims: ['SitLookingAtView', 'SitReading', 'SitRelaxed'],
            exitOffset: { x: -0.6, z: 0.6 }
        });

        // 11. ALPINE MOUNTAIN OVERLOOK OBSERVATION TELESCOPE
        this.registerAnchor({
            id: 'alpine_overlook_telescope',
            type: 'telescope',
            category: 'telescope',
            labelKey: 'anchor_alpine_telescope',
            label: 'Look through telescope at snowy alpine mountains',
            position: { x: 32.4, y: 4.58, z: -47.8 },
            rotationY: -Math.PI * 0.85,
            interactionRadius: 2.0,
            defaultAnim: 'LookingAtView',
            allowedAnims: ['LookingAtView', 'Thinking', 'Idle'],
            exitOffset: { x: 0.6, z: 0.6 }
        });

        // 9. VINTAGE COUNTRYSIDE BICYCLE (Village roadside rest stop)
        this.registerAnchor({
            id: 'village_vintage_bicycle',
            type: 'bicycle',
            category: 'vehicle',
            labelKey: 'anchor_vintage_bicycle',
            label: 'Ring vintage bicycle bell',
            position: { x: 3.8, y: 0.10, z: -19.5 },
            rotationY: -Math.PI * 0.45,
            interactionRadius: 1.8,
            defaultAnim: 'Thinking',
            exitOffset: { x: -0.5, z: 0.0 }
        });
    }

    registerAnchor(def) {
        this.anchors.set(def.id, def);
    }

    getAnchor(id) {
        if (id === 'maple_picnic_bench_1') id = 'maple_picnic_stool_1';
        return this.anchors.get(id);
    }

    getAllAnchors() {
        return Array.from(this.anchors.values());
    }

    isOccupied(anchorId) {
        if (anchorId === 'maple_picnic_bench_1') anchorId = 'maple_picnic_stool_1';
        const anchor = this.anchors.get(anchorId);
        if (!anchor) return false;
        const cap = anchor.capacity || (anchor.category === 'bench' ? 2 : 1);
        const slots = this.slotOccupants.get(anchorId);
        if (!slots) return this.occupants.has(anchorId);
        return slots.size >= cap;
    }

    setTerrainSystem(terrainSystem) {
        this.terrainSystem = terrainSystem;
        this.syncAnchorHeights();
    }

    /**
     * Called by LandmarksSystem after building a raised-platform structure
     * (pavilion, hub deck, etc.) to inject the precise world Y derived from
     * actual Three.js geometry, which overrides any terrain-approximated value.
     */
    setAnchorWorldY(anchorId, worldY) {
        if (anchorId === 'maple_picnic_bench_1') anchorId = 'maple_picnic_stool_1';
        const anchor = this.anchors.get(anchorId);
        if (anchor) anchor.position.y = worldY;
    }

    syncAnchorHeights() {
        if (!this.terrainSystem) return;
        for (const anchor of this.anchors.values()) {
            // RAISED PLATFORM anchors (tatami mats on pavilion deck, coding desks on hub deck,
            // cafe stools at hub counter, terminal kiosk, barista station) must NOT be overwritten here — their Y is injected
            // by LandmarksSystem.syncAnchorPositions() after the geometry is built,
            // using exact Three.js world coordinates.
            const isRaisedCategory = anchor.category === 'tatami'
                || anchor.category === 'coding_desk'
                || anchor.category === 'cafe_stool'
                || anchor.category === 'terminal'
                || anchor.type === 'barista_station';
            if (isRaisedCategory) continue;

            if (anchor.category === 'bench' || anchor.category === 'stool' || (anchor.type === 'seat' && !anchor.category?.includes('desk') && anchor.category !== 'cafe_stool')) {
                const groundY = this.terrainSystem.getTerrainHeight(anchor.position.x, anchor.position.z);
                if (anchor.id === 'beach_pier_bench') {
                    anchor.position.y = Math.max(0.19, groundY);
                } else {
                    anchor.position.y = groundY;
                }
            } else if (anchor.type === 'bicycle' || anchor.type === 'vending_machine') {
                anchor.position.y = this.terrainSystem.getTerrainHeight(anchor.position.x, anchor.position.z);
            }
        }
    }

    computeSlotPosition(anchor, slotIndex) {
        const cap = anchor.capacity || (anchor.category === 'bench' ? 2 : 1);
        const rotY = anchor.rotationY || 0;
        const isRaisedPlatform = anchor.category?.includes('desk')
            || anchor.category === 'cafe_stool'
            || anchor.category === 'tatami'
            || anchor.id === 'beach_pier_bench'
            || anchor.category === 'terminal'
            || anchor.type === 'barista_station';
        const baseY = isRaisedPlatform
            ? (anchor.position.y !== undefined ? anchor.position.y : 0.387)
            : (this.terrainSystem
                ? this.terrainSystem.getTerrainHeight(anchor.position.x, anchor.position.z)
                : (anchor.position.y !== undefined ? anchor.position.y : 0));

        if (cap <= 1) {
            return {
                x: anchor.position.x,
                y: baseY,
                z: anchor.position.z,
                rotationY: rotY
            };
        }

        // Two distinct slots on long benches (1.4m span):
        // Left slot: -0.35m lateral offset
        // Right slot: +0.35m lateral offset
        const lateralOffset = (slotIndex === 0) ? -0.35 : 0.35;
        // Benches have backrest at local z = -0.22, with seat planks spanning z = -0.12 to +0.16.
        // Forward depth offset of +0.06m seats the sitter squarely on the planks with natural backrest clearance.
        const depthOffset = (anchor.category === 'bench') ? 0.06 : 0.0;
        const cosR = Math.cos(rotY);
        const sinR = Math.sin(rotY);

        const slotX = anchor.position.x + lateralOffset * cosR + depthOffset * sinR;
        const slotZ = anchor.position.z - lateralOffset * sinR + depthOffset * cosR;

        return {
            x: slotX,
            y: baseY,
            z: slotZ,
            rotationY: rotY
        };
    }

    getSeatSlotPosition(anchorId, entity, currentPos = null) {
        if (anchorId === 'maple_picnic_bench_1') anchorId = 'maple_picnic_stool_1';
        const anchor = this.anchors.get(anchorId);
        if (!anchor) return null;
        if (entity) {
            const rec = this.entitySlotMap.get(entity);
            if (rec && rec.anchorId === anchorId) {
                return this.computeSlotPosition(anchor, rec.slotIndex);
            }
        }
        // If not claimed or previewing: return the optimal free slot
        const slots = this.slotOccupants.get(anchorId);
        const cap = anchor.capacity || (anchor.category === 'bench' ? 2 : 1);
        if (cap > 1) {
            const freeSlots = [];
            for (let i = 0; i < cap; i++) {
                if (!slots || !slots.has(i)) freeSlots.push(i);
            }
            if (freeSlots.length > 0) {
                if (currentPos && freeSlots.length > 1) {
                    let bestSlot = freeSlots[0];
                    let bestDist = Infinity;
                    for (const sIdx of freeSlots) {
                        const pos = this.computeSlotPosition(anchor, sIdx);
                        const d = Math.hypot(pos.x - currentPos.x, pos.z - currentPos.z);
                        if (d < bestDist) {
                            bestDist = d;
                            bestSlot = sIdx;
                        }
                    }
                    return this.computeSlotPosition(anchor, bestSlot);
                }
                return this.computeSlotPosition(anchor, freeSlots[0]);
            }
        }
        return this.computeSlotPosition(anchor, 0);
    }

    getOccupants(anchorId) {
        if (anchorId === 'maple_picnic_bench_1') anchorId = 'maple_picnic_stool_1';
        const slots = this.slotOccupants.get(anchorId);
        if (!slots) return [];
        return Array.from(slots.values());
    }

    getFreeSlots(anchorId) {
        if (anchorId === 'maple_picnic_bench_1') anchorId = 'maple_picnic_stool_1';
        const anchor = this.anchors.get(anchorId);
        if (!anchor) return [];
        const cap = anchor.capacity || (anchor.category === 'bench' ? 2 : 1);
        const slots = this.slotOccupants.get(anchorId);
        const free = [];
        for (let i = 0; i < cap; i++) {
            if (!slots || !slots.has(i)) free.push(i);
        }
        return free;
    }

    claimAnchor(anchorId, entity, currentPos = null) {
        if (anchorId === 'maple_picnic_bench_1') anchorId = 'maple_picnic_stool_1';
        const anchor = this.anchors.get(anchorId);
        if (!anchor) return false;

        const cap = anchor.capacity || (anchor.category === 'bench' ? 2 : 1);
        let slots = this.slotOccupants.get(anchorId);
        if (!slots) {
            slots = new Map();
            this.slotOccupants.set(anchorId, slots);
        }

        // Already claiming this anchor
        for (const [slotIdx, occupant] of slots.entries()) {
            if (occupant === entity) {
                return true;
            }
        }

        // Check if fully occupied
        if (slots.size >= cap) {
            return false;
        }

        // Select free slot
        let chosenSlot = 0;
        if (cap > 1) {
            const freeSlots = [];
            for (let i = 0; i < cap; i++) {
                if (!slots.has(i)) freeSlots.push(i);
            }
            if (freeSlots.length === 0) return false;

            if (currentPos && freeSlots.length > 1) {
                let bestDist = Infinity;
                chosenSlot = freeSlots[0];
                for (const sIdx of freeSlots) {
                    const pos = this.computeSlotPosition(anchor, sIdx);
                    const d = Math.hypot(pos.x - currentPos.x, pos.z - currentPos.z);
                    if (d < bestDist) {
                        bestDist = d;
                        chosenSlot = sIdx;
                    }
                }
            } else {
                chosenSlot = freeSlots[0];
            }
        }

        slots.set(chosenSlot, entity);
        this.entitySlotMap.set(entity, { anchorId, slotIndex: chosenSlot });
        this.occupants.set(anchorId, entity);

        return true;
    }

    releaseAnchor(anchorId, entity) {
        if (anchorId === 'maple_picnic_bench_1') anchorId = 'maple_picnic_stool_1';
        if (!entity) {
            this.occupants.delete(anchorId);
            this.slotOccupants.delete(anchorId);
            return true;
        }

        const slots = this.slotOccupants.get(anchorId);
        if (slots) {
            for (const [slotIdx, occupant] of slots.entries()) {
                if (occupant === entity) {
                    slots.delete(slotIdx);
                    break;
                }
            }
            if (slots.size === 0) {
                this.slotOccupants.delete(anchorId);
                this.occupants.delete(anchorId);
            } else {
                const remaining = Array.from(slots.values())[0];
                this.occupants.set(anchorId, remaining);
            }
        } else {
            if (this.occupants.get(anchorId) === entity) {
                this.occupants.delete(anchorId);
            }
        }

        this.entitySlotMap.delete(entity);
        return true;
    }

    /**
     * Find nearest unoccupied interaction anchor within range
     */
    findNearest(x, y, z, maxDist = 2.4, filterType = null) {
        let bestAnchor = null;
        let minDist = maxDist;

        for (const [id, anchor] of this.anchors.entries()) {
            if (filterType && anchor.type !== filterType) continue;
            // Ignore if completely full
            if (this.isOccupied(id)) continue;

            const cap = anchor.capacity || (anchor.category === 'bench' ? 2 : 1);
            let checkPos = anchor.position;
            if (cap > 1) {
                const freeSlotPos = this.getSeatSlotPosition(id, null);
                if (freeSlotPos) checkPos = freeSlotPos;
            }

            const dx = checkPos.x - x;
            const dy = (checkPos.y || y) - y;
            const dz = checkPos.z - z;
            const dist = Math.hypot(dx, dy * 0.5, dz);

            const effectiveRadius = anchor.interactionRadius || maxDist;
            if (dist <= effectiveRadius && dist < minDist) {
                minDist = dist;
                bestAnchor = anchor;
            }
        }
        return bestAnchor;
    }
}
