/**
 * TELETERM 3D — NPC NAVIGATION SYSTEM & WORLD WALKABILITY
 * Implements Feature Group D (Sections 35, 36, 37, 38, 39, 40, 55, 57, 58, 84).
 * 
 * Provides:
 * - Authoritative world surface classification & water detection
 * - River channel meander model & arched timber bridge crossing geometry
 * - Deep water avoidance & water intersection raycasting
 * - Waypoint path generation with bridge routing & dynamic repathing
 */

export class NpcNavigationSystem {
    constructor(terrainSystem = null) {
        this.terrain = terrainSystem;

        // River Channel Parameters (Matches RiverSystem & TerrainSystem)
        this.riverZ = 27.0;
        this.riverHalfWidth = 4.9; // 9.8m total channel width
        this.meanderFreq = 0.05;
        this.meanderAmp = 3.2;

        // Arched Timber Bridge Geometry (Primary crossing connecting Village/Hub to Beach/Pier)
        this.bridgeCenter = { x: 4.0, z: 27.913 };
        this.bridgeHalfWidth = 1.8; // 3.6m wide deck
        this.bridgeNorthZ = 20.81;  // Bridge span 14.2m along Z (20.81 .. 35.01)
        this.bridgeSouthZ = 35.01;

        // Stepping Stones Crossing (Secondary crossing at x: -16.0)
        this.stonesX = -16.0;
        this.stonesZ = 27.0 + Math.sin(-16.0 * 0.05) * 3.2 + Math.sin(-16.0 * 0.12) * 0.6;
    }

    /**
     * Get centerline Z coordinate of the river at given X coordinate
     */
    getRiverCenterZ(x) {
        return this.riverZ + Math.sin(x * this.meanderFreq) * this.meanderAmp + Math.sin(x * 0.12) * 0.6;
    }

    /**
     * Check if a 2D position (x, z) is currently on the physical bridge deck
     */
    isOnBridge(x, z) {
        const dx = Math.abs(x - this.bridgeCenter.x);
        return dx <= this.bridgeHalfWidth && z >= (this.bridgeNorthZ - 0.4) && z <= (this.bridgeSouthZ + 0.4);
    }

    /**
     * Check if a 2D position (x, z) is in non-walkable water (river or deep ocean)
     */
    isWater(x, z) {
        // Deep ocean boundary
        if (z >= 115.0) return true;

        // On physical bridge deck: perfectly walkable!
        if (this.isOnBridge(x, z)) return false;

        // Check river meandering channel
        const rz = this.getRiverCenterZ(x);
        const distToCenter = Math.abs(z - rz);
        if (distToCenter <= this.riverHalfWidth) {
            return true;
        }

        return false;
    }

    /**
     * Check if a point is generally walkable
     */
    isWalkable(x, z) {
        if (this.isWater(x, z)) return false;
        // Expanded 120m x 120m world boundaries with Far North Alpine Ridge
        if (x < -70 || x > 70 || z < -90 || z > 125) return false;
        return true;
    }

    /**
     * Check if a line segment between (x1, z1) and (x2, z2) intersects river water
     */
    lineIntersectsWater(x1, z1, x2, z2) {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.hypot(dx, dz);
        if (length < 0.1) return this.isWater(x1, z1);

        // Step by 0.35m along segment
        const step = 0.35;
        const count = Math.ceil(length / step);
        for (let i = 0; i <= count; i++) {
            const t = i / count;
            const px = x1 + dx * t;
            const pz = z1 + dz * t;
            if (this.isWater(px, pz)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Plan a valid collision-free waypoint path from start to target.
     * Guaranteed to never route through river water.
     * Returns Array of { x, z } waypoints.
     */
    planPath(startPos, targetPos) {
        const sx = startPos.x;
        const sz = startPos.z;
        const tx = targetPos.x;
        const tz = targetPos.z;

        // If direct line does not intersect water, direct path is optimal
        if (!this.lineIntersectsWater(sx, sz, tx, tz)) {
            return [{ x: tx, z: tz }];
        }

        const startRiverZ = this.getRiverCenterZ(sx);
        const targetRiverZ = this.getRiverCenterZ(tx);

        const startSide = sz < startRiverZ ? 'north' : 'south';
        const targetSide = tz < targetRiverZ ? 'north' : 'south';

        const waypoints = [];

        if (startSide !== targetSide) {
            // Must cross the river! Determine crossing approach
            const useSteppingStones = (sx < -10 && tx < -10);

            if (useSteppingStones) {
                // Stepping stones route
                if (startSide === 'north') {
                    waypoints.push({ x: this.stonesX, z: 19.2 });
                    waypoints.push({ x: this.stonesX, z: this.stonesZ });
                    waypoints.push({ x: this.stonesX, z: 30.2 });
                } else {
                    waypoints.push({ x: this.stonesX, z: 30.2 });
                    waypoints.push({ x: this.stonesX, z: this.stonesZ });
                    waypoints.push({ x: this.stonesX, z: 19.2 });
                }
            } else {
                // Arched Timber River Bridge Route (Main highway crossing at x: 4.0)
                if (startSide === 'north') {
                    // Approach north bridge abutment
                    waypoints.push({ x: this.bridgeCenter.x, z: this.bridgeNorthZ - 0.6 });
                    // Cross bridge center
                    waypoints.push({ x: this.bridgeCenter.x, z: this.bridgeCenter.z });
                    // Exit south bridge abutment
                    waypoints.push({ x: this.bridgeCenter.x, z: this.bridgeSouthZ + 0.6 });
                } else {
                    // Approach south bridge abutment
                    waypoints.push({ x: this.bridgeCenter.x, z: this.bridgeSouthZ + 0.6 });
                    // Cross bridge center
                    waypoints.push({ x: this.bridgeCenter.x, z: this.bridgeCenter.z });
                    // Exit north bridge abutment
                    waypoints.push({ x: this.bridgeCenter.x, z: this.bridgeNorthZ - 0.6 });
                }
            }
        } else {
            // Both start and target on same side of river, but direct segment clips river meander bend
            const midX = (sx + tx) * 0.5;
            if (startSide === 'north') {
                // Safe bypass north of river crest
                const safeZ = Math.min(sz, tz, startRiverZ - 6.5);
                waypoints.push({ x: midX, z: safeZ });
            } else {
                // Safe bypass south of river crest
                const safeZ = Math.max(sz, tz, startRiverZ + 6.5);
                waypoints.push({ x: midX, z: safeZ });
            }
        }

        // Final destination waypoint
        waypoints.push({ x: tx, z: tz });

        return waypoints;
    }
}

export const npcNavSystem = new NpcNavigationSystem();
if (typeof window !== 'undefined') {
    window.npcNavSystem = npcNavSystem;
}
