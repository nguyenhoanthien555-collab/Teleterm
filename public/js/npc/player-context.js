/**
 * TELETERM 3D — PLAYER ACTIVITY CONTEXT EXTRACTOR
 * Implements Feature Group E (Sections 42, 43, 54, 59).
 * Infers real-time player gameplay state for contextual NPC dialogue reactions:
 * - Location / biome / landmarks (Hub, Village, Rice Field, River, Bridge, Cherry Grove, Mountain, Beach, Pier)
 * - Biomechanical posture (sitting vs standing)
 * - Locomotion state (idle, walking, running)
 * - Equipped held item & grip type (can, mug, bottle, phone, book)
 * - Active player action (drinking, coding/terminal, chatting, idle)
 * - Progression rank & level
 */

export class PlayerContextManager {
    constructor() {
        this.recentInteractions = new Map(); // Map<npcId, { timestamp: number, lineId: string }>
    }

    /**
     * Extract current comprehensive player context
     * @param {Object} openWorld3D - Active 3D open world instance
     * @returns {Object} PlayerContext
     */
    extractContext(openWorld3D = null) {
        const ow = openWorld3D || (typeof window !== 'undefined' ? window.openWorld3D : null);
        const inv = typeof window !== 'undefined' ? window.playerInventory : null;
        const xpHud = typeof window !== 'undefined' ? window.xpHud : null;

        // Position & Coordinates
        let x = 0, y = 0, z = 0;
        if (ow && ow.player) {
            x = ow.player.position.x;
            y = ow.player.position.y;
            z = ow.player.position.z;
        }

        // Posture (Sitting on bench/chair vs standing)
        const isSitting = !!(ow && ow.isSitting);
        const posture = isSitting ? 'sitting' : 'standing';

        // Locomotion (Idle, Walking, Running)
        let movement = 'idle';
        if (ow && ow.isMoving) {
            movement = ow.isRunning ? 'running' : 'walking';
        }

        // Equipped Item
        const equippedItem = inv ? inv.getEquippedItem() : null;
        const equippedItemId = equippedItem ? equippedItem.id : null;
        const equippedItemType = equippedItem ? equippedItem.type : null;

        // Active Action (Drinking, Terminal, Chat, None)
        let currentAction = 'none';
        if (ow && (ow.isDrinkingHold || (ow.retargeter && ow.retargeter.isDrinkingHold))) {
            currentAction = 'drinking';
        } else if (typeof document !== 'undefined' && document.body.classList.contains('mode-focus')) {
            currentAction = 'terminal';
        } else if (typeof document !== 'undefined' && document.activeElement && document.activeElement.id === 'mmo-chat-input') {
            currentAction = 'chatting';
        }

        // Biome / Landmark Location Resolver
        const location = this.resolveLocation(x, z);

        // Player Progression
        let level = 1;
        let rank = 'Novice';
        if (xpHud && xpHud.currentProfile) {
            level = xpHud.currentProfile.level || 1;
            rank = xpHud.currentProfile.title || 'Novice';
        } else if (typeof localStorage !== 'undefined') {
            const raw = localStorage.getItem('teleterm_dev_level');
            if (raw) level = parseInt(raw, 10) || 1;
        }

        return {
            x,
            y,
            z,
            location,
            posture,
            movement,
            equippedItem,
            equippedItemId,
            equippedItemType,
            currentAction,
            level,
            rank,
            timestamp: Date.now()
        };
    }

    /**
     * Resolve semantic world zone based on 3D spatial coordinates
     */
    resolveLocation(x, z) {
        // 1. Arched River Bridge
        if (Math.abs(x - 4.0) <= 2.2 && z >= 20.2 && z <= 35.0) {
            return 'bridge';
        }

        // 2. Coastal Fishing Pier
        if (z >= 85.0 && Math.abs(x - 10.5) <= 6.5) {
            return 'pier';
        }

        // 3. Sandy Beach
        if (z >= 55.0 && z < 85.0) {
            return 'beach';
        }

        // 4. Meandering River Bank
        const riverZ = 27.0 + Math.sin(x * 0.05) * 3.2;
        if (Math.abs(z - riverZ) <= 7.0) {
            return 'river';
        }

        // 4b. Bamboo Forest & Zen Tea Pavilion
        if (x >= -38.0 && x <= -14.0 && z >= -45.0 && z <= -15.0) {
            return 'bamboo_forest';
        }

        // 4c. Autumn Maple Valley
        if (x >= 18.0 && x <= 52.0 && z >= -45.0 && z <= -15.0) {
            return 'maple_valley';
        }

        // 5. Alpine Mountain Vista
        if (z <= -45.0 || (x >= 18.0 && z <= -35.0)) {
            return 'mountain';
        }

        // 6. Cherry Blossom Grove / Hill
        if (x >= 15.0 && z >= -25.0 && z <= -5.0) {
            return 'cherry_grove';
        }

        // 7. Rice Terraces
        if (x <= -2.0 && z >= -38.0 && z <= 18.0) {
            return 'rice_field';
        }

        // 8. Village Square & Roadside Rest Stop
        if (x < 15.0 && z <= -10.0) {
            return 'village';
        }

        // 9. Developer Central Hub (Default center)
        return 'hub';
    }

    recordInteraction(npcId, lineId) {
        this.recentInteractions.set(npcId, {
            timestamp: Date.now(),
            lineId
        });
    }

    getLastInteraction(npcId) {
        return this.recentInteractions.get(npcId) || null;
    }
}

export const playerContextManager = new PlayerContextManager();
if (typeof window !== 'undefined') {
    window.playerContextManager = playerContextManager;
}
