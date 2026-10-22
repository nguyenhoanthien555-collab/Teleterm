import * as THREE from 'three';
import { SurfaceRegistry, SURFACE_DEFINITIONS } from './surface-registry.js?v=30';

/**
 * SURFACE DETECTOR — UNIFIED SPATIAL GROUND QUERY ENGINE
 * Implements Section 15, 33, 34, and 36 of TeleTerm Living Open World Master Spec v3.
 * Queries world coordinates (x, z) against geographic geometry and returns
 * full semantic surface definitions from the central SurfaceRegistry.
 */
export class SurfaceDetector {
    constructor(worldComposition) {
        this.world = worldComposition;

        // Rice paddies definitions in Southwest agricultural plain (3x3 stepped terraces)
        this.paddies = [
            // Tier 1 (Lower Terrace)
            { x: -16.0, z: -3.5,  w: 7.0, d: 7.8 },
            { x: -16.0, z:  5.0,  w: 7.0, d: 7.8 },
            { x: -16.0, z: 13.5,  w: 7.0, d: 7.8 },
            // Tier 2 (Middle Terrace)
            { x: -24.0, z: -3.5,  w: 7.5, d: 7.8 },
            { x: -24.0, z:  5.0,  w: 7.5, d: 7.8 },
            { x: -24.0, z: 13.5,  w: 7.5, d: 7.8 },
            // Tier 3 (Upper Terrace)
            { x: -32.5, z: -3.5,  w: 8.0, d: 7.8 },
            { x: -32.5, z:  5.0,  w: 8.0, d: 7.8 },
            { x: -32.5, z: 13.5,  w: 8.0, d: 7.8 }
        ];

        this.pathSamples = [];
        this.cachedCurve = null;
    }

    ensurePathCache() {
        if (this.pathSamples.length > 0) return;
        if (!this.world || !this.world.path || !this.world.path.pathCurve) return;

        const curve = this.world.path.pathCurve;
        this.cachedCurve = curve;
        const count = 75;
        for (let i = 0; i <= count; i++) {
            const pt = curve.getPoint(i / count);
            this.pathSamples.push({ x: pt.x, z: pt.z });
        }
    }

    /**
     * Resolves the full semantic surface metadata object at world position (x, z)
     * @returns {Object} Surface metadata from SurfaceRegistry
     */
    detectSurface(x, z) {
        const id = this.detect(x, z);
        return SurfaceRegistry.get(id);
    }

    /**
     * Resolves the surface material string id at world position (x, z)
     * @param {number} x
     * @param {number} z
     * @returns {'wood' | 'water' | 'dirt' | 'sand' | 'wet_sand' | 'gravel' | 'stone' | 'concrete' | 'grass'}
     */
    detect(x, z) {
        if (!this.world) return 'grass_meadow';

        // 1. DEVELOPER HUB WOODEN CO-WORKING DECK & SOLID ACCESS STAIRS (Eastern Sakura Hillside)
        // Expanded raised wooden pavilion at x: 15.75 to 28.25, z: -16.0 to -6.0
        if (x >= 15.75 && x <= 28.25 && z >= -16.0 && z <= -6.0) {
            return 'wood_deck';
        }
        // Developer Hub West Access Solid Timber Stairs (x: 13.65 to 15.75, z: -13.2 to -10.8)
        if (x >= 13.65 && x < 15.75 && z >= -13.2 && z <= -10.8) {
            return 'wood_deck';
        }

        // 2. TIMBER FOOTBRIDGES & BENCHES
        // Bridge across concrete flume to Southwest rice field
        if (z >= 4.3 && z <= 5.7 && x >= -12.8 && x <= -10.8) {
            return 'wood_bridge';
        }
        // Bridge across River Valley (full 14.2m arched span)
        if (z >= 20.81 && z <= 35.01 && x >= 2.2 && x <= 5.8) {
            return 'wood_bridge';
        }
        // Arashiyama Onsen Taiko-bashi Drum Bridge (Northwest Bamboo Glade: center at -31.5, -38.0)
        if (x >= -33.6 && x <= -29.4 && z >= -38.9 && z <= -37.1) {
            return 'wood_bridge';
        }
        // Arashiyama Onsen Thermal Spring Water Pool (Center at -36.0, -38.0)
        if (Math.hypot((x - -36.0) / 4.6, (z - -38.0) / 3.4) <= 1.0) {
            return 'water_shallow';
        }
        // Coastal Wooden Pier Dock
        if (z >= 75.5 && z <= 100.5 && x >= 7.4 && x <= 13.6) {
            return 'wood_pier';
        }
        // Countryside benches
        if (x >= 4.7 && x <= 6.3 && z >= -6.8 && z <= -5.2) {
            return 'wood_bridge';
        }
        if (x >= 24.0 && x <= 26.5 && z >= -16.5 && z <= -14.0) {
            return 'wood_bridge';
        }
        // Hilltop Panorama Bench
        if (x >= 32.8 && x <= 35.2 && z >= -49.0 && z <= -47.0) {
            return 'wood_bridge';
        }
        // Hilltop Viewpoint Gravel Viewing Pad
        if (Math.hypot(x - 33.2, z - -46.5) <= 2.8) {
            return 'gravel_path';
        }

        // 3. VILLAGE PLAZA STONE PAVEMENT
        if (x >= -6.0 && x <= 6.0 && z >= -28.0 && z <= -17.0) {
            return 'stone_pavement';
        }

        // 4. CONCRETE IRRIGATION CANAL FLUME
        if (z >= -36 && z <= 15) {
            const progress = (15 - z) / 51;
            const canalX = 0.95 - progress * 1.4;
            const distToCanal = Math.abs(x - canalX);
            if (distToCanal < 0.52) {
                return 'water_shallow';
            } else if (distToCanal < 0.76) {
                return 'concrete_drain';
            }
        }

        // 5. RICE PADDIES (Water basins vs dirt berms)
        for (let i = 0; i < this.paddies.length; i++) {
            const p = this.paddies[i];
            const halfW = p.w / 2;
            const halfD = p.d / 2;
            const dx = Math.abs(x - p.x);
            const dz = Math.abs(z - p.z);

            if (dx <= halfW + 0.35 && dz <= halfD + 0.35) {
                // If on perimeter dike (within 0.55m of outer edge): dry dirt berm
                if (dx >= halfW - 0.55 || dz >= halfD - 0.55) {
                    return 'dirt_path';
                }
                // Otherwise wading through water basin
                return 'water_shallow';
            }
        }

        // 6. CLEAR RIVER VALLEY
        // River runs horizontally across valley between z: 22 and z: 32
        if (z >= 22.0 && z <= 32.0 && (x < 1.5 || x > 6.5)) {
            return 'water_deep';
        }
        // River Gravel Banks
        if ((z >= 19.5 && z < 22.0) || (z > 32.0 && z <= 34.5)) {
            return 'gravel_shoulder';
        }

        // 7. COASTAL BEACH & SHORELINE
        // Ocean open sea water
        if (z >= 86.0 && (x < 8.0 || x > 13.5)) {
            return 'water_deep';
        }
        // Wet sand shoreline band (tide line)
        if (z >= 74.0 && z < 86.0) {
            return 'sand_wet';
        }
        // Dry beach sand dunes
        if (z >= 48.0 && z < 74.0) {
            return 'sand_dry';
        }

        // 8. COUNTRY ROAD & PATHS (Dirt path with soft shoulders)
        this.ensurePathCache();
        if (this.pathSamples.length > 0) {
            let minDistSq = Infinity;
            for (let i = 0; i < this.pathSamples.length; i++) {
                const s = this.pathSamples[i];
                const dSq = (x - s.x) * (x - s.x) + (z - s.z) * (z - s.z);
                if (dSq < minDistSq) {
                    minDistSq = dSq;
                }
            }

            if (minDistSq <= 1.45 * 1.45) {
                return 'dirt_path';
            }
            if (minDistSq <= 2.2 * 2.2) {
                return 'gravel_shoulder';
            }
        }

        // 8b. ZEN TEA PAVILION TATAMI DECK & NEW LANDMARKS
        if (x >= -24.5 && x <= -19.5 && z >= -27.5 && z <= -22.5) {
            return 'tatami_mat';
        }
        if (x >= 33.6 && x <= 36.8 && z >= -28.8 && z <= -27.2) {
            return 'wood_bridge'; // Maple stream footbridge
        }
        if (x >= 31.5 && x <= 36.5 && z >= -50.5 && z <= -45.5) {
            return 'wood_deck'; // Alpine Overlook platform
        }

        // 8c. REGIONAL BIOME ECOLOGICAL SURFACES
        if (x >= -38.0 && x <= -14.0 && z >= -45.0 && z <= -15.0) {
            return 'moss_loam'; // Bamboo Forest ground
        }
        if (x >= 18.0 && x <= 52.0 && z >= -45.0 && z <= -15.0) {
            return 'leaf_litter'; // Autumn Maple Valley ground
        }
        if (z < -45.0) {
            return 'rocky_soil'; // Alpine Mountain Trail ground
        }

        // 8d. LAKESIDE CAMPFIRE CLEARING (Hard-packed earth & gravel hearth)
        const cdx = x - 14.0;
        const cdz = z - 18.5;
        if (cdx * cdx + cdz * cdz <= 3.2 * 3.2) {
            return 'gravel_shoulder';
        }

        // 9. DEFAULT COUNTRYSIDE MEADOW & PASTURE
        return 'grass_meadow';
    }
}
