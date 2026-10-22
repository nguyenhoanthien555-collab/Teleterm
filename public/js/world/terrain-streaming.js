/**
 * TERRAIN STREAMING & LOD MANAGER
 * Implements Section 3 & 45 of TeleTerm Living Open World Master Spec v3.
 * Manages distance tiers (Near, Mid, Far) to throttle simulation, culling, and level-of-detail.
 */

export class TerrainStreamManager {
    constructor(options = {}) {
        this.nearRadius = options.nearRadius || 35.0; // Full simulation tier (~35m)
        this.midRadius = options.midRadius || 90.0;   // Throttled / simplified tier (~90m)
        this.farRadius = options.farRadius || 250.0;  // Distant horizon tier (~250m)

        this.entities = new Map(); // id -> { object, onLodChange, currentTier }
    }

    registerEntity(id, object, callbacks = {}) {
        this.entities.set(id, {
            object,
            onTierChange: callbacks.onTierChange || null,
            currentTier: 'near',
            lastPos: { x: 0, z: 0 }
        });
    }

    unregisterEntity(id) {
        this.entities.delete(id);
    }

    /**
     * Updates simulation tiers of registered world entities based on player camera position
     */
    update(playerX, playerZ) {
        for (const [id, entry] of this.entities.entries()) {
            const pos = entry.object.position || entry.object;
            const dx = pos.x - playerX;
            const dz = pos.z - playerZ;
            const dist = Math.hypot(dx, dz);

            let newTier = 'far';
            if (dist <= this.nearRadius) {
                newTier = 'near';
            } else if (dist <= this.midRadius) {
                newTier = 'mid';
            }

            if (newTier !== entry.currentTier) {
                const prevTier = entry.currentTier;
                entry.currentTier = newTier;
                if (entry.onTierChange) {
                    entry.onTierChange(newTier, prevTier, dist);
                }
            }
        }
    }

    getTier(x, z, playerX, playerZ) {
        const dist = Math.hypot(x - playerX, z - playerZ);
        if (dist <= this.nearRadius) return 'near';
        if (dist <= this.midRadius) return 'mid';
        return 'far';
    }
}
