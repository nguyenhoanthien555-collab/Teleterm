import * as THREE from 'three';

/**
 * WORLD COLLISION & WALKABLE SURFACE SYSTEM
 * Resolves walkable deck heights, arched bridges, stepping stones,
 * and solid obstacle collision boxes to ensure characters never walk
 * through bridge decks, handrails, or furniture.
 */
export class WorldCollisionSystem {
    constructor(terrainSystem) {
        this.terrain = terrainSystem;

        // Solid obstacle bounding boxes [minX, minZ, maxX, maxZ]
        this.obstacles = [
            // Expanded cafe coffee bar counter (Sakura Hillside Hub)
            { minX: 25.1, minZ: -11.4, maxX: 26.1, maxZ: -7.8 },
            // Desk #1 (Lumina's desk)
            { minX: 19.8, minZ: -12.0, maxX: 21.4, maxZ: -11.2 },
            // Desk #2 (Ren's desk)
            { minX: 22.4, minZ: -12.0, maxX: 24.0, maxZ: -11.2 },
            // Desk #3 (Hot Desk)
            { minX: 17.4, minZ: -13.2, maxX: 19.0, maxZ: -12.4 },
            // Public Hologram Terminal Kiosk Pedestal
            { minX: 17.4, minZ: -8.6, maxX: 18.2, maxZ: -7.8 },
            // Village Vending Machine (Roadside Rest Stop)
            { minX: 3.10, minZ: -22.0, maxX: 4.10, maxZ: -21.0 },
            // Village Notice Board
            { minX: 0.60, minZ: -23.80, maxX: 1.80, maxZ: -23.20 },
            // Parked Vintage Bicycle in Village Roadside Rest Stop
            { minX: 3.20, minZ: -20.10, maxX: 4.40, maxZ: -18.90 },
            // Maple Stream Rest Stop: Round Timber Picnic Tea Table (Solid obstacle)
            { minX: 41.15, minZ: -32.85, maxX: 42.85, maxZ: -31.15 }
        ];

        // 3D Physical Rocks & Alpine Crag Massifs (Cylinder / Circle Colliders for smooth sliding)
        this.rockColliders = [
            // Eastern Alpine Horn Massif (x: 20 to 38, z: -68 to -52)
            { x: 26.0, z: -62.0, radius: 4.8 },
            { x: 32.0, z: -58.0, radius: 4.4 },
            { x: 21.0, z: -55.0, radius: 3.8 },
            { x: 38.0, z: -64.0, radius: 5.5 },

            // Western Alpine Sentinel Massif (x: -38 to -18, z: -68 to -52)
            { x: -25.0, z: -62.0, radius: 4.6 },
            { x: -32.0, z: -58.0, radius: 4.2 },
            { x: -19.0, z: -54.0, radius: 3.5 },
            { x: -37.0, z: -65.0, radius: 5.4 },

            // Central Alpine Pass & Overlook Shoulders (x: -12 to 14, z: -74 to -60)
            { x: -8.0, z: -68.0, radius: 4.2 },
            { x: 9.0, z: -68.0, radius: 4.2 },
            { x: -2.0, z: -72.0, radius: 3.8 },
            { x: 5.0, z: -74.0, radius: 4.2 },

            // Foreground Rocky Bluffs overlooking the Valley (z: -46 to -40)
            { x: 16.0, z: -44.0, radius: 2.8 },
            { x: -14.0, z: -44.0, radius: 2.6 },
            { x: 42.0, z: -48.0, radius: 3.4 },
            { x: -42.0, z: -48.0, radius: 3.2 },

            // River Boulders (Natural bank & shallow boulders)
            { x: -8.0, z: 25.41, radius: 1.1 },
            { x: -5.0, z: 30.91, radius: 1.0 },
            { x: 12.0, z: 24.71, radius: 1.2 },
            { x: 16.0, z: 30.71, radius: 1.1 },
            { x: -16.0, z: 26.11, radius: 1.2 },
            { x: 22.0, z: 29.41, radius: 1.0 }
        ];
    }

    /**
     * Compute true grounded elevation including bridges, timber decks, and platforms
     */
    getWalkableHeight(x, z) {
        const rawY = this.terrain ? this.terrain.getTerrainHeight(x, z) : 0;

        // 1. ARCHED TIMBER RIVER BRIDGE (Connecting Hub/Village to Beach)
        // Bridge center is at x = 4.0, z = 27.91. Width = 3.6m (x: 2.2 to 5.8), Span = 14.2m (z: 20.81 to 35.01)
        if (x >= 2.2 && x <= 5.8 && z >= 20.81 && z <= 35.01) {
            const spanLen = 14.2;
            const t = (z - 20.81) / spanLen;
            const archY = Math.sin(t * Math.PI) * 0.68 + 0.24;
            return Math.max(rawY, archY);
        }

        // 2. RICE FIELD CANAL FOOTBRIDGE (Southwest Plain connecting farm path to central ridge at z = 5.0)
        // Bridge center is at x = -11.8, z = 5.0. Width = 1.4m (z: 4.3 to 5.7), Span = 2.0m (x: -12.8 to -10.8)
        if (z >= 4.3 && z <= 5.7 && x >= -12.8 && x <= -10.8) {
            const bankY = this.terrain ? this.terrain.getTerrainHeight(-10.8, 5.0) : 0.05;
            return Math.max(rawY, bankY + 0.04);
        }

        // 3. EXPANDED RAISED TIMBER DECK AT DEVELOPER HUB (Sakura Grove Hillside at 22.0, -11.0)
        // Deck bounds: x: [15.75, 28.25], z: [-16.0, -6.0] (12.5m x 10.0m)
        if (x >= 15.75 && x <= 28.25 && z >= -16.0 && z <= -6.0) {
            const deckBaseY = this.terrain ? this.terrain.getTerrainHeight(22.0, -11.0) : 0.85;
            const deckTopY = deckBaseY + 0.13;
            return Math.max(rawY, deckTopY);
        }

        // 3b. RECONSTRUCTED SOLID TIMBER STAIRS AT DEVELOPER HUB (Sakura Grove Hillside)
        // West access stairs spanning from trail (x = 13.65) flush up to deck platform (x = 15.75)
        // 5 solid steps of run = 0.42m each, riser drop = 0.145m per step.
        // Step 0 is flush with deck platform at deckTopY (x in [15.33, 15.75])
        // Step 4 is bottom step (x in [13.65, 14.07])
        // Width: z in [-13.2, -10.8] (2.4m wide flight centered at z = -12.0)
        if (x >= 13.65 && x < 15.75 && z >= -13.2 && z <= -10.8) {
            const deckBaseY = this.terrain ? this.terrain.getTerrainHeight(22.0, -11.0) : 0.85;
            const deckTopY = deckBaseY + 0.13;
            const stepIndex = Math.min(4, Math.max(0, Math.floor((15.75 - x) / 0.42)));
            const stepY = deckTopY - stepIndex * 0.145;
            return Math.max(rawY, stepY);
        }

        // 4. RUSTIC WOODEN FISHING PIER & DOCK PLATFORM (Beach extending into ocean)
        // Main walkway: x: [8.6, 12.4], z: [75.5, 100.5]
        // Terminal T-platform at sea end: x: [7.4, 13.6], z: [95.5, 100.5]
        const isPierWalkway = (x >= 8.6 && x <= 12.4 && z >= 75.5 && z <= 100.5);
        const isPierTerminal = (x >= 7.4 && x <= 13.6 && z >= 95.5 && z <= 100.5);
        if (isPierWalkway || isPierTerminal) {
            const pierPlankY = 0.20;
            return Math.max(rawY, pierPlankY);
        }

        // 5. ZEN TEA PAVILION TIMBER DECK (Bamboo Forest: x in [-24.4, -19.6], z in [-27.4, -22.6])
        if (x >= -24.4 && x <= -19.6 && z >= -27.4 && z <= -22.6) {
            const pavBaseY = this.terrain ? this.terrain.getTerrainHeight(-22.0, -25.0) : 0.85;
            const pavDeckY = pavBaseY + 0.24;
            return Math.max(rawY, pavDeckY);
        }

        // 6. MAPLE VALLEY STREAM FOOTBRIDGE (x in [33.6, 36.8], z in [-28.8, -27.2])
        if (x >= 33.6 && x <= 36.8 && z >= -28.8 && z <= -27.2) {
            const bridgeBaseY = this.terrain ? this.terrain.getTerrainHeight(35.2, -28.0) : 1.35;
            const bridgeDeckY = bridgeBaseY + 0.18;
            return Math.max(rawY, bridgeDeckY);
        }

        // 7. ALPINE MOUNTAIN OVERLOOK PLATFORM (x in [31.5, 36.5], z in [-50.5, -45.5])
        if (x >= 31.5 && x <= 36.5 && z >= -50.5 && z <= -45.5) {
            const lookBaseY = this.terrain ? this.terrain.getTerrainHeight(34.0, -48.0) : 4.58;
            return Math.max(rawY, lookBaseY + 0.06);
        }

        return rawY;
    }

    /**
     * Polymorphic compatibility for systems expecting terrain.getTerrainHeight(x, z)
     */
    getTerrainHeight(x, z) {
        return this.getWalkableHeight(x, z);
    }

    /**
     * Resolve 2D circle-vs-AABB box collisions with sliding response
     */
    resolveCollision(oldX, oldZ, newX, newZ, radius = 0.28) {
        let resX = newX;
        let resZ = newZ;

        // 1. Constrain to bridge deck when on the river bridge
        if (newZ >= 20.8 && newZ <= 34.4) {
            if (oldX >= 2.2 && oldX <= 5.8) {
                // Keep player within the bridge deck planks so they cannot walk through the handrails
                resX = Math.max(2.35 + radius, Math.min(5.65 - radius, resX));
            }
        }

        // 1b. Constrain player between Developer Hub stairs handrails & solid side stringers
        if (resX >= 13.65 && resX <= 15.75) {
            if (oldZ >= -13.2 && oldZ <= -10.8) {
                // Inside stairs flight: keep within wooden handrails
                resZ = Math.max(-13.2 + radius, Math.min(-10.8 - radius, resZ));
            } else if (oldZ < -13.2) {
                // Approaching from north outside: block clipping through stringer
                resZ = Math.min(-13.2 - radius, resZ);
            } else if (oldZ > -10.8) {
                // Approaching from south outside: block clipping through stringer
                resZ = Math.max(-10.8 + radius, resZ);
            }
        }

        // 2. Constrain to pier walkway when extending out into the ocean (z >= 76.5)
        if (newZ >= 76.5 && newZ <= 100.5) {
            const isAtTee = (newZ >= 95.5);
            const minPierX = isAtTee ? 7.55 : 8.8;
            const maxPierX = isAtTee ? 13.45 : 12.2;
            if (oldX >= minPierX - 0.4 && oldX <= maxPierX + 0.4) {
                resX = Math.max(minPierX + radius, Math.min(maxPierX - radius, resX));
            }
            resZ = Math.min(100.0 - radius, resZ);
        }

        // 2. Solid obstacle boxes
        for (const box of this.obstacles) {
            // Check if (resX, resZ) inside expanded box
            const minX = box.minX - radius;
            const maxX = box.maxX + radius;
            const minZ = box.minZ - radius;
            const maxZ = box.maxZ + radius;

            if (resX > minX && resX < maxX && resZ > minZ && resZ < maxZ) {
                // Determine minimal push-out axis
                const dLeft = resX - minX;
                const dRight = maxX - resX;
                const dTop = resZ - minZ;
                const dBottom = maxZ - resZ;

                const minDist = Math.min(dLeft, dRight, dTop, dBottom);
                if (minDist === dLeft) resX = minX;
                else if (minDist === dRight) resX = maxX;
                else if (minDist === dTop) resZ = minZ;
                else resZ = maxZ;
            }
        }

        // 3. Physical Rocks & Alpine Crag Massifs (Smooth circle-vs-circle sliding response)
        for (const rock of this.rockColliders) {
            let dx = resX - rock.x;
            let dz = resZ - rock.z;
            let distSq = dx * dx + dz * dz;
            const minDist = rock.radius + radius;
            if (distSq < minDist * minDist) {
                let dist = Math.sqrt(distSq);
                if (dist < 0.001) {
                    dx = (oldX !== rock.x) ? (oldX - rock.x) : 0.0;
                    dz = (oldZ !== rock.z) ? (oldZ - rock.z) : 1.0;
                    const dLen = Math.hypot(dx, dz) || 1.0;
                    dx /= dLen;
                    dz /= dLen;
                    dist = 0;
                } else {
                    dx /= dist;
                    dz /= dist;
                }
                resX = rock.x + dx * minDist;
                resZ = rock.z + dz * minDist;
            }
        }

        // 4. Northern Alpine Mountain Cliff Face Boundary (Clamped sliding at base of mountain wall)
        if (resZ < -68.0) {
            resZ = -68.0 + radius;
        }

        return { x: resX, z: resZ };
    }
}
