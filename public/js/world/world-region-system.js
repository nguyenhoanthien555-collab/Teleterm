/**
 * WORLD REGION SYSTEM — REGIONAL GEOGRAPHY & AMBIENCE ORCHESTRATION
 * Implements Section 2, 40, 41, and 48 of TeleTerm Living Open World Master Spec v3.
 * Manages spatial regions, environmental identities, visual palettes, and local rules.
 */

export const WORLD_REGIONS = {
    developer_hub: {
        id: 'developer_hub',
        name: 'Developer Hub & Open-Air Cafe',
        description: 'Eastern Sakura hillside co-working pavilion with coding decks, laptops, coffee stations, and high-speed terminals nestled under blooming cherry trees.',
        bounds: { minX: 15.5, maxX: 27.5, minZ: -16.0, maxZ: -6.0 },
        center: { x: 22.0, z: -11.0 },
        elevationBase: 0.85,
        ambientPreset: 'cafe_hub',
        defaultSurface: 'wood_deck',
        allowedNpcActivities: ['coding', 'coffee', 'typing', 'building', 'chatting', 'vibing'],
        landmarkTags: ['coding_deck', 'coffee_machine', 'terminal_kiosk', 'sun_umbrella'],
        audioProfile: { birds: 0.4, wind: 0.2, water: 0.1, keyboard: 0.3 }
    },
    village_plaza: {
        id: 'village_plaza',
        name: 'Countryside Village Plaza',
        description: 'Peaceful Japanese rural village square with stone lanterns, community notice board, and winding paved paths.',
        bounds: { minX: -8, maxX: 8, minZ: -30, maxZ: -12 },
        center: { x: 0.0, z: -21.0 },
        elevationBase: 0.25,
        ambientPreset: 'village',
        defaultSurface: 'stone_pavement',
        allowedNpcActivities: ['reading', 'chatting', 'vibing', 'walking', 'sitting'],
        landmarkTags: ['stone_lantern', 'notice_board', 'bicycle_rack', 'wooden_bench'],
        audioProfile: { birds: 0.6, wind: 0.3, water: 0.2, keyboard: 0.0 }
    },
    rice_country: {
        id: 'rice_country',
        name: 'Terraced Rice Country',
        description: 'Flooded mirror-like agricultural paddies in the Southwest plain bordered by trapezoidal earthen berms and modern drainage flumes.',
        bounds: { minX: -38, maxX: -11, minZ: -9, maxZ: 19 },
        center: { x: -24.0, z: 5.0 },
        elevationBase: 0.05,
        ambientPreset: 'rice_paddies',
        defaultSurface: 'dirt_path',
        allowedNpcActivities: ['looking_at_view', 'walking', 'thinking', 'resting'],
        landmarkTags: ['flooded_paddy', 'concrete_flume', 'timber_footbridge', 'water_sluice'],
        audioProfile: { birds: 0.5, wind: 0.4, water: 0.6, keyboard: 0.0 }
    },
    river_valley: {
        id: 'river_valley',
        name: 'Clear River Valley',
        description: 'Sparkling freshwater river with smooth gravel banks, stepping stones, and an arched timber bridge.',
        bounds: { minX: -30, maxX: 40, minZ: 12, maxZ: 42 },
        center: { x: 5.0, z: 27.0 },
        elevationBase: -0.35,
        ambientPreset: 'river',
        defaultSurface: 'gravel_shoulder',
        allowedNpcActivities: ['looking_at_view', 'sitting', 'thinking', 'vibing', 'coffee'],
        landmarkTags: ['river_meander', 'arched_bridge', 'stepping_stones', 'river_bench'],
        audioProfile: { birds: 0.7, wind: 0.3, water: 0.9, keyboard: 0.0 }
    },
    cherry_grove: {
        id: 'cherry_grove',
        name: 'Blooming Sakura Grove',
        description: 'A hillside avenue of ancient blooming cherry blossom trees with drifting pink petals and scenic resting benches.',
        bounds: { minX: 16, maxX: 45, minZ: -35, maxZ: 5 },
        center: { x: 28.0, z: -15.0 },
        elevationBase: 0.85,
        ambientPreset: 'sakura_grove',
        defaultSurface: 'grass_meadow',
        allowedNpcActivities: ['looking_at_view', 'sitting', 'reading', 'vibing', 'thinking'],
        landmarkTags: ['cherry_trees', 'viewpoint_bench', 'petal_drifts', 'shrine_approach'],
        audioProfile: { birds: 0.8, wind: 0.5, water: 0.1, keyboard: 0.0 }
    },
    hill_overlook: {
        id: 'hill_overlook',
        name: 'Alpine Panorama Hilltop',
        description: 'Elevated viewpoint commanding breathtaking vistas of distant snow-capped mountains, green valleys, and coastal sea.',
        bounds: { minX: 20, maxX: 55, minZ: -65, maxZ: -35 },
        center: { x: 35.0, z: -50.0 },
        elevationBase: 3.2,
        ambientPreset: 'mountain_overlook',
        defaultSurface: 'dirt_path',
        allowedNpcActivities: ['looking_at_view', 'sitting', 'stretching', 'thinking', 'celebrating'],
        landmarkTags: ['panoramic_bench', 'viewpoint_telescope', 'mountain_marker'],
        audioProfile: { birds: 0.3, wind: 0.9, water: 0.0, keyboard: 0.0 }
    },
    deep_forest: {
        id: 'deep_forest',
        name: 'Whispering Cedar Forest',
        description: 'Lush green woodland canopy with mossy boulders, fallen logs, and sunbeams filtering through leaves.',
        bounds: { minX: -45, maxX: -5, minZ: -75, maxZ: -38 },
        center: { x: -25.0, z: -55.0 },
        elevationBase: 1.5,
        ambientPreset: 'forest',
        defaultSurface: 'grass_meadow',
        allowedNpcActivities: ['walking', 'reading', 'thinking', 'resting'],
        landmarkTags: ['ancient_cedar', 'mossy_log', 'forest_stream', 'clear_path'],
        audioProfile: { birds: 0.9, wind: 0.6, water: 0.3, keyboard: 0.0 }
    },
    coastal_beach: {
        id: 'coastal_beach',
        name: 'Azure Coast & Sandy Beach',
        description: 'Sunlit shoreline with fine sand, tide ripples, gentle ocean waves, driftwood, and a wooden fishing dock pier.',
        bounds: { minX: -25, maxX: 50, minZ: 42, maxZ: 110 },
        center: { x: 12.0, z: 75.0 },
        elevationBase: -0.15,
        ambientPreset: 'coastal_beach',
        defaultSurface: 'sand_dry',
        allowedNpcActivities: ['walking', 'sitting', 'vibing', 'looking_at_view', 'resting'],
        landmarkTags: ['ocean_waves', 'wet_sand', 'driftwood', 'wooden_pier', 'beach_umbrella'],
        audioProfile: { birds: 0.4, wind: 0.7, water: 0.95, keyboard: 0.0 }
    },
    bamboo_forest: {
        id: 'bamboo_forest',
        name: 'Bamboo Meditation Forest',
        description: 'Serene bamboo groves with wind-whispering culms, Zen tea pavilion, tatami floor mats, and shishi-odoshi water fountain.',
        bounds: { minX: -38, maxX: -14, minZ: -45, maxZ: -15 },
        center: { x: -26.0, z: -30.0 },
        elevationBase: 0.85,
        ambientPreset: 'bamboo_forest',
        defaultSurface: 'moss_loam',
        allowedNpcActivities: ['thinking', 'resting', 'looking_at_view', 'walking', 'sitting'],
        landmarkTags: ['zen_tea_pavilion', 'shishi_odoshi', 'stone_lantern', 'tatami_mat'],
        audioProfile: { birds: 0.7, wind: 0.5, water: 0.4, keyboard: 0.0, bamboo_clack: 0.8 }
    },
    maple_valley: {
        id: 'maple_valley',
        name: 'Autumn Maple Valley',
        description: 'Vibrant autumn valley with cascading crimson maple canopies, stony babbling stream, wooden footbridge, and picnic rest stop.',
        bounds: { minX: 18, maxX: 52, minZ: -45, maxZ: -15 },
        center: { x: 35.0, z: -28.0 },
        elevationBase: 1.45,
        ambientPreset: 'maple_valley',
        defaultSurface: 'leaf_litter',
        allowedNpcActivities: ['sitting', 'vibing', 'reading', 'looking_at_view', 'coffee'],
        landmarkTags: ['maple_stream_rest_stop', 'stony_stream', 'footbridge', 'picnic_table'],
        audioProfile: { birds: 0.8, wind: 0.6, water: 0.6, keyboard: 0.0 }
    }
};

export class WorldRegionSystem {
    constructor() {
        this.regions = WORLD_REGIONS;
        this.currentRegionId = 'developer_hub';
        this.listeners = [];
    }

    onRegionChange(fn) {
        this.listeners.push(fn);
    }

    /**
     * Determines which region contains the given 3D coordinates (x, z)
     */
    getRegionAt(x, z) {
        for (const key in this.regions) {
            const reg = this.regions[key];
            const b = reg.bounds;
            if (x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ) {
                return reg;
            }
        }
        // Fallback distance calculation to closest region
        let closest = this.regions.developer_hub;
        let minDistSq = Infinity;
        for (const key in this.regions) {
            const reg = this.regions[key];
            const dx = x - reg.center.x;
            const dz = z - reg.center.z;
            const distSq = dx * dx + dz * dz;
            if (distSq < minDistSq) {
                minDistSq = distSq;
                closest = reg;
            }
        }
        return closest;
    }

    update(playerX, playerZ) {
        const region = this.getRegionAt(playerX, playerZ);
        if (region.id !== this.currentRegionId) {
            const prevId = this.currentRegionId;
            this.currentRegionId = region.id;
            this.listeners.forEach(fn => fn(region, prevId));
        }
        return region;
    }

    getAllRegions() {
        return Object.values(this.regions);
    }
}
