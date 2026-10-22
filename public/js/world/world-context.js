/**
 * WORLD CONTEXT — UNIFIED SPATIAL GROUND TRUTH & ECOLOGY SOURCE OF TRUTH
 * Master Architecture for TeleTerm 3D Living Open World.
 * Ensures Physics, Geography, Terrain, Water, Vegetation, Navigation, Audio,
 * and NPC AI all consume the EXACT SAME spatial definitions.
 */

export const BIOMES = {
    DEVELOPER_HUB: {
        id: 'developer_hub',
        name: 'Developer Hub & Co-working Deck',
        nameVi: 'Khu Trung Tâm Lập Trình & Cafe Ngoài Trời',
        elevation: 0.25,
        defaultSurface: 'wood_deck',
        colorHex: '#38bdf8',
        windFactor: 0.6,
        ambientKey: 'cafe_hub'
    },
    VILLAGE_PLAZA: {
        id: 'village_plaza',
        name: 'Countryside Village Plaza',
        nameVi: 'Quảng Trường Làng Quê',
        elevation: 0.25,
        defaultSurface: 'stone_pavement',
        colorHex: '#e2e8f0',
        windFactor: 0.7,
        ambientKey: 'village'
    },
    RICE_COUNTRY: {
        id: 'rice_country',
        name: 'Terraced Rice Country',
        nameVi: 'Ruộng Bậc Thang Thôn Dã',
        elevation: 0.15,
        defaultSurface: 'dirt_path',
        colorHex: '#84cc16',
        windFactor: 1.0,
        ambientKey: 'rice_paddies'
    },
    BAMBOO_FOREST: {
        id: 'bamboo_forest',
        name: 'Bamboo Meditation Forest',
        nameVi: 'Rừng Trúc Thiền Định',
        elevation: 0.85,
        defaultSurface: 'moss_loam',
        colorHex: '#22c55e',
        windFactor: 0.85,
        ambientKey: 'bamboo_forest'
    },
    MAPLE_VALLEY: {
        id: 'maple_valley',
        name: 'Autumn Maple Valley',
        nameVi: 'Thung Lũng Phong Đỏ Mùa Thu',
        elevation: 1.45,
        defaultSurface: 'leaf_litter',
        colorHex: '#f97316',
        windFactor: 0.95,
        ambientKey: 'maple_valley'
    },
    ALPINE_PINES: {
        id: 'alpine_pines',
        name: 'Alpine Pine Woods & Mountain Trail',
        nameVi: 'Rừng Thông Tuyết Sườn Núi & Đường Mòn',
        elevation: 5.20,
        defaultSurface: 'rocky_soil',
        colorHex: '#0ea5e9',
        windFactor: 1.35,
        ambientKey: 'mountain_overlook'
    },
    CHERRY_GROVE: {
        id: 'cherry_grove',
        name: 'Blooming Sakura Hillside',
        nameVi: 'Đồi Hoa Anh Đào',
        elevation: 1.20,
        defaultSurface: 'grass_meadow',
        colorHex: '#f472b6',
        windFactor: 0.9,
        ambientKey: 'sakura_grove'
    },
    RIVER_VALLEY: {
        id: 'river_valley',
        name: 'Meandering River Valley',
        nameVi: 'Thung Lũng Dòng Sông Uốn Lượn',
        elevation: -0.35,
        defaultSurface: 'gravel_bank',
        colorHex: '#06b6d4',
        windFactor: 0.75,
        ambientKey: 'river'
    },
    COASTAL_BEACH: {
        id: 'coastal_beach',
        name: 'Azure Coast & Sand Dunes',
        nameVi: 'Bờ Biển Cát Trắng & Cầu Tàu Gỗ',
        elevation: -0.15,
        defaultSurface: 'sand_dry',
        colorHex: '#fde047',
        windFactor: 1.2,
        ambientKey: 'coastal_beach'
    }
};

export class WorldContext {
    constructor() {
        this.world = null;
        this.terrain = null;
        this.collision = null;
        this.surfaceDetector = null;
        this.pathSystem = null;
        this.landmarks = [];
        this.windState = {
            direction: { x: 0.707, z: 0.707 },
            speed: 1.2,
            gustFactor: 1.0,
            lastGustTime: 0
        };
    }

    bind(worldComposition) {
        this.world = worldComposition;
        if (worldComposition) {
            this.terrain = worldComposition.terrain || worldComposition.terrainSystem;
            this.collision = worldComposition.collision || worldComposition.worldCollisionSystem;
            this.surfaceDetector = worldComposition.surfaceDetector;
            this.pathSystem = worldComposition.path || worldComposition.pathSystem;
        }
    }

    /**
     * Unified Terrain Height computation
     */
    getTerrainHeight(x, z) {
        if (this.terrain && typeof this.terrain.getTerrainHeight === 'function') {
            return this.terrain.getTerrainHeight(x, z);
        }
        // Fallback formula matching TerrainSystem
        let h = Math.sin(x * 0.025) * 0.20 + Math.cos(z * 0.022) * 0.22;
        if (x > 14.0) {
            h += (x - 14.0) * 0.065;
            if (z < -15.0) h += Math.min(3.6, (-15.0 - z) * 0.055);
        }
        if (z < -32.0) {
            h += Math.min(7.5, (-32.0 - z) * 0.075);
        }
        return h;
    }

    /**
     * True Walkable Height (including bridge decks, boardwalks, elevated platforms)
     */
    getWalkableHeight(x, z) {
        if (this.collision && typeof this.collision.getWalkableHeight === 'function') {
            return this.collision.getWalkableHeight(x, z);
        }
        return this.getTerrainHeight(x, z);
    }

    /**
     * Resolves Biome at (x, z)
     */
    getBiomeAt(x, z) {
        // 1. Far North Alpine Mountain Ridge (z < -45)
        if (z < -45.0) {
            return BIOMES.ALPINE_PINES;
        }

        // 2. Northwest Bamboo Forest (x in [-38, -14], z in [-45, -15])
        if (x >= -38.0 && x <= -14.0 && z >= -45.0 && z <= -15.0) {
            return BIOMES.BAMBOO_FOREST;
        }

        // 3. Northeast Autumn Maple Valley (x in [18, 52], z in [-45, -15])
        if (x >= 18.0 && x <= 52.0 && z >= -45.0 && z <= -15.0) {
            return BIOMES.MAPLE_VALLEY;
        }

        // 4. Central River Valley (z in [12, 42])
        const riverMeanderZ = 27.0 + Math.sin(x * 0.05) * 3.2;
        if (Math.abs(z - riverMeanderZ) < 8.5) {
            return BIOMES.RIVER_VALLEY;
        }

        // 5. South Coastal Beach (z > 45)
        if (z > 45.0) {
            return BIOMES.COASTAL_BEACH;
        }

        // 6. Southwest Terraced Rice Country (x in [-38, -11], z in [-9, 19])
        if (x >= -38.0 && x <= -11.0 && z >= -9.0 && z <= 19.0) {
            return BIOMES.RICE_COUNTRY;
        }

        // 7. Eastern Sakura Hillside Developer Hub (x in [16, 28], z in [-16, -6])
        if (x >= 16.0 && x <= 28.0 && z >= -16.0 && z <= -6.0) {
            return BIOMES.DEVELOPER_HUB;
        }

        // 8. Village Plaza (x in [-8, 8], z in [-30, -12])
        if (x >= -8.0 && x <= 8.0 && z >= -30.0 && z <= -12.0) {
            return BIOMES.VILLAGE_PLAZA;
        }

        // 9. East Blooming Cherry Grove (x > 14, z in [-35, 10])
        if (x > 14.0 && z >= -35.0 && z <= 10.0) {
            return BIOMES.CHERRY_GROVE;
        }

        return BIOMES.VILLAGE_PLAZA;
    }

    /**
     * Resolves water state at (x, z)
     */
    getWaterStateAt(x, z) {
        // Main River
        const riverMeanderZ = 27.0 + Math.sin(x * 0.05) * 3.2;
        const distToRiver = Math.abs(z - riverMeanderZ);
        const riverWaterY = -0.28;
        const isRiver = (distToRiver < 4.8);

        // Maple Valley Stony Stream (x in [24, 42], z in [-38, -20])
        const streamPathX = 32.0 + Math.sin(z * 0.18) * 3.5;
        const distToStream = Math.abs(x - streamPathX);
        const isStream = (z >= -42.0 && z <= -18.0 && distToStream < 1.4);
        const streamWaterY = this.getTerrainHeight(streamPathX, z) - 0.05;

        // Ocean / Coastal water (z > 85)
        const isOcean = (z > 84.0);
        const oceanWaterY = -0.32;

        // Rice Field Inner Basins in Southwest agricultural plain
        let isRicePaddyWater = false;
        if (x < -12.2 && x > -36.8 && z > -7.8 && z < 17.8) {
            const inDikeX = (Math.abs(x - -19.85) < 0.45 || Math.abs(x - -28.1) < 0.45);
            const inDikeZ = (Math.abs(z - 0.75) < 0.45 || Math.abs(z - 9.25) < 0.45);
            if (!inDikeX && !inDikeZ) {
                isRicePaddyWater = true;
            }
        }

        const isWater = isRiver || isStream || isOcean || isRicePaddyWater;
        let surfaceY = 0;
        if (isRiver) surfaceY = riverWaterY;
        else if (isStream) surfaceY = streamWaterY;
        else if (isOcean) surfaceY = oceanWaterY;
        else if (isRicePaddyWater) surfaceY = this.getTerrainHeight(x, z) + 0.04;

        return {
            isWater,
            isRiver,
            isStream,
            isOcean,
            isRicePaddyWater,
            surfaceY,
            depth: isWater ? Math.max(0, surfaceY - this.getTerrainHeight(x, z)) : 0
        };
    }

    /**
     * Fast check: is this position considered water hazard for NPC navigation?
     */
    isWater(x, z) {
        const ws = this.getWaterStateAt(x, z);
        return ws.isWater && !ws.isRicePaddyWater; // Paddies have shallow stepping zones, deep river/ocean/stream are water
    }

    /**
     * Resolves surface type at (x, z)
     */
    getSurfaceTypeAt(x, z) {
        if (this.surfaceDetector && typeof this.surfaceDetector.detect === 'function') {
            return this.surfaceDetector.detect(x, z);
        }
        const biome = this.getBiomeAt(x, z);
        return biome.defaultSurface;
    }

    /**
     * Resolves wind strength and gusts across the world
     */
    getWindStateAt(x, z, timeSec = performance.now() / 1000) {
        const biome = this.getBiomeAt(x, z);
        const baseSpeed = 1.2 * (biome.windFactor || 1.0);
        // Gentle low-frequency organic breeze
        const breeze = Math.sin(timeSec * 0.8 + x * 0.04 + z * 0.03) * 0.25;
        // Natural occasional gust
        const gust = Math.max(0, Math.sin(timeSec * 0.22) * 0.5);
        return {
            direction: this.windState.direction,
            speed: baseSpeed + breeze + gust,
            gustFactor: 1.0 + gust
        };
    }

    /**
     * Navigation validation context
     */
    getNavigationContext(x, z) {
        const water = this.getWaterStateAt(x, z);
        const walkableH = this.getWalkableHeight(x, z);
        const terrainH = this.getTerrainHeight(x, z);

        // Check if on a bridge or pier
        const onBridge = (walkableH > terrainH + 0.15);

        if (water.isRiver && !onBridge) {
            return { isWalkable: false, reason: 'river_water', height: walkableH };
        }
        if (water.isOcean && !onBridge) {
            return { isWalkable: false, reason: 'ocean_water', height: walkableH };
        }

        return {
            isWalkable: true,
            height: walkableH,
            onBridge,
            biome: this.getBiomeAt(x, z).id
        };
    }
}

export const worldContext = new WorldContext();
