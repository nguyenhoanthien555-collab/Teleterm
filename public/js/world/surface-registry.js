/**
 * SURFACE REGISTRY — CENTRAL SEMANTIC SURFACE DICTIONARY
 * Implements Section 15 & 34 of TeleTerm Living Open World Master Spec v3.
 * Unified semantic contract consumed across:
 * - Movement & Friction physics
 * - NPC & Player Navigation pathfinding costs
 * - Footstep Audio synthesis profiles
 * - Visual particle & contact effects
 * - Environmental interaction rules
 */

export const SURFACE_DEFINITIONS = {
    grass_meadow: {
        id: 'grass_meadow',
        name: 'Grass Meadow',
        category: 'grass',
        walkable: true,
        footstepProfile: 'grass',
        frictionProfile: 'soft_ground',
        navigationCost: 1.0,
        fxProfile: 'soft_dust',
        speedModifier: 1.0,
        audioParams: { baseFreq: 340, resonance: 1.8, crunchiness: 0.25 }
    },
    dirt_path: {
        id: 'dirt_path',
        name: 'Country Dirt Path',
        category: 'dirt',
        walkable: true,
        footstepProfile: 'dirt',
        frictionProfile: 'firm_ground',
        navigationCost: 0.8, // Preferred route for NPCs
        fxProfile: 'dry_dust',
        speedModifier: 1.05,
        audioParams: { baseFreq: 220, resonance: 2.2, crunchiness: 0.45 }
    },
    gravel_shoulder: {
        id: 'gravel_shoulder',
        name: 'River Gravel Shoulder',
        category: 'gravel',
        walkable: true,
        footstepProfile: 'gravel',
        frictionProfile: 'loose_aggregate',
        navigationCost: 1.1,
        fxProfile: 'gravel_chips',
        speedModifier: 0.95,
        audioParams: { baseFreq: 480, resonance: 3.5, crunchiness: 0.8 }
    },
    wood_bridge: {
        id: 'wood_bridge',
        name: 'Timber Footbridge',
        category: 'wood',
        walkable: true,
        footstepProfile: 'wood',
        frictionProfile: 'wood_planks',
        navigationCost: 0.85,
        fxProfile: 'wood_creak',
        speedModifier: 1.0,
        audioParams: { baseFreq: 160, resonance: 5.5, crunchiness: 0.1 }
    },
    wood_deck: {
        id: 'wood_deck',
        name: 'Developer Hub Wood Deck',
        category: 'wood',
        walkable: true,
        footstepProfile: 'wood',
        frictionProfile: 'smooth_wood',
        navigationCost: 0.8,
        fxProfile: 'none',
        speedModifier: 1.05,
        audioParams: { baseFreq: 180, resonance: 4.8, crunchiness: 0.05 }
    },
    wood_pier: {
        id: 'wood_pier',
        name: 'Rustic Fishing Pier Walkway',
        category: 'wood',
        walkable: true,
        footstepProfile: 'wood',
        frictionProfile: 'wood_planks',
        navigationCost: 0.85,
        fxProfile: 'wood_creak',
        speedModifier: 1.0,
        audioParams: { baseFreq: 170, resonance: 5.2, crunchiness: 0.12 }
    },
    sand_dry: {
        id: 'sand_dry',
        name: 'Dry Dune Sand',
        category: 'sand',
        walkable: true,
        footstepProfile: 'sand',
        frictionProfile: 'loose_sand',
        navigationCost: 1.35,
        fxProfile: 'sand_spray',
        speedModifier: 0.88,
        audioParams: { baseFreq: 520, resonance: 1.2, crunchiness: 0.6 }
    },
    sand_wet: {
        id: 'sand_wet',
        name: 'Wet Shoreline Sand',
        category: 'sand',
        walkable: true,
        footstepProfile: 'wet_sand',
        frictionProfile: 'damp_sand',
        navigationCost: 1.1,
        fxProfile: 'wet_sparkle',
        speedModifier: 0.98,
        audioParams: { baseFreq: 380, resonance: 2.0, crunchiness: 0.4 }
    },
    water_shallow: {
        id: 'water_shallow',
        name: 'Shallow Paddy / Brook Water',
        category: 'water',
        walkable: true,
        footstepProfile: 'water',
        frictionProfile: 'water_drag',
        navigationCost: 1.7,
        fxProfile: 'water_splash',
        speedModifier: 0.72,
        audioParams: { baseFreq: 620, resonance: 4.0, crunchiness: 0.15 }
    },
    water_deep: {
        id: 'water_deep',
        name: 'Deep River / Ocean Sea',
        category: 'water',
        walkable: false,
        footstepProfile: 'water',
        frictionProfile: 'deep_water',
        navigationCost: Infinity,
        fxProfile: 'deep_ripples',
        speedModifier: 0.25,
        audioParams: { baseFreq: 400, resonance: 6.0, crunchiness: 0.1 }
    },
    concrete_drain: {
        id: 'concrete_drain',
        name: 'Precast Concrete Drainage Flume',
        category: 'concrete',
        walkable: true,
        footstepProfile: 'stone',
        frictionProfile: 'smooth_stone',
        navigationCost: 0.9,
        fxProfile: 'stone_tap',
        speedModifier: 1.0,
        audioParams: { baseFreq: 280, resonance: 3.0, crunchiness: 0.2 }
    },
    stone_pavement: {
        id: 'stone_pavement',
        name: 'Village Stone Pavement',
        category: 'stone',
        walkable: true,
        footstepProfile: 'stone',
        frictionProfile: 'hard_stone',
        navigationCost: 0.8,
        fxProfile: 'stone_dust',
        speedModifier: 1.05,
        audioParams: { baseFreq: 310, resonance: 3.2, crunchiness: 0.2 }
    },
    tatami_mat: {
        id: 'tatami_mat',
        name: 'Zen Tatami Meditation Mat',
        category: 'wood',
        walkable: true,
        footstepProfile: 'wood',
        frictionProfile: 'smooth_woven',
        navigationCost: 0.75,
        fxProfile: 'soft_reed',
        speedModifier: 1.0,
        audioParams: { baseFreq: 190, resonance: 4.2, crunchiness: 0.05 }
    },
    moss_loam: {
        id: 'moss_loam',
        name: 'Bamboo Forest Mossy Loam',
        category: 'grass',
        walkable: true,
        footstepProfile: 'grass',
        frictionProfile: 'soft_moss',
        navigationCost: 0.9,
        fxProfile: 'moss_cushion',
        speedModifier: 1.0,
        audioParams: { baseFreq: 290, resonance: 2.1, crunchiness: 0.15 }
    },
    leaf_litter: {
        id: 'leaf_litter',
        name: 'Autumn Maple Leaf Carpet',
        category: 'grass',
        walkable: true,
        footstepProfile: 'grass',
        frictionProfile: 'crisp_leaves',
        navigationCost: 0.95,
        fxProfile: 'leaf_crunch',
        speedModifier: 1.0,
        audioParams: { baseFreq: 420, resonance: 2.6, crunchiness: 0.65 }
    },
    rocky_soil: {
        id: 'rocky_soil',
        name: 'Alpine Rocky Mountain Soil',
        category: 'gravel',
        walkable: true,
        footstepProfile: 'gravel',
        frictionProfile: 'firm_gravel',
        navigationCost: 1.05,
        fxProfile: 'stone_chips',
        speedModifier: 0.95,
        audioParams: { baseFreq: 460, resonance: 3.2, crunchiness: 0.7 }
    }
};

export class SurfaceRegistry {
    static get(surfaceId) {
        if (!surfaceId) return SURFACE_DEFINITIONS.grass_meadow;
        if (typeof surfaceId === 'object' && surfaceId.id) return surfaceId;
        if (SURFACE_DEFINITIONS[surfaceId]) return SURFACE_DEFINITIONS[surfaceId];

        // Normalization alias mapping for generic / category surface ids
        const aliases = {
            wood: 'wood_deck',
            water: 'water_shallow',
            dirt: 'dirt_path',
            gravel: 'gravel_shoulder',
            sand: 'sand_dry',
            wet_sand: 'sand_wet',
            stone: 'stone_pavement',
            concrete: 'concrete_drain',
            grass: 'grass_meadow',
            tatami: 'tatami_mat',
            bamboo: 'moss_loam',
            maple: 'leaf_litter',
            alpine: 'rocky_soil'
        };

        const resolvedId = aliases[surfaceId] || surfaceId;
        return SURFACE_DEFINITIONS[resolvedId] || SURFACE_DEFINITIONS.grass_meadow;
    }

    static getAll() {
        return Object.values(SURFACE_DEFINITIONS);
    }

    static getWalkableSurfaces() {
        return Object.values(SURFACE_DEFINITIONS).filter(s => s.walkable);
    }
}
