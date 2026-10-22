/**
 * Multiplayer Room Manager & Spatial Index
 * TeleTerm Master Architecture v2 - Section 5, 6
 */

const VISIBILITY_RADIUS = 65; // 65 meters visibility threshold

class RoomManager {
    constructor() {
        this.players = new Map(); // Map<userId, PlayerState>
        this.seatLocks = new Map(); // Map<seatAnchorId, userId> atomic occupancy lock
    }

    addPlayer(userId, ws, profile, initialPosition = null) {
        const state = {
            id: userId,
            ws,
            username: profile.username || 'Dev_' + userId.slice(0, 5),
            displayName: profile.displayName || profile.username,
            level: profile.level || 1,
            title: profile.title || 'Script Novice',
            presetId: profile.presetId || 'sakura_alice',
            customColors: profile.customColors || { hair: '#ffffff', outfit: '#38bdf8', aura: '#00f0ff' },
            customModelUrl: profile.customModelUrl || null,
            position: initialPosition ? {
                x: Number(initialPosition.x) || 0,
                y: Number(initialPosition.y) || 0.05,
                z: Number(initialPosition.z) || 0
            } : { x: 0, y: 0.05, z: 0 },
            yaw: 0,
            anim: 'idle',
            activeTool: 'NONE',
            snippetLines: [],
            presenceState: 'coding', // coding, typing, building, testing, coffee, away
            speedNorm: 0,
            equippedItem: 'none',
            isDrinking: false,
            seatAnchorId: null,
            seatSlot: 0,
            isFishing: false,
            fishingState: 'idle',
            bobberPos: null,
            isUmbrellaOpen: false,
            isDancing: false,
            voiceMuted: true,
            voiceSpeaking: false,
            petState: null,
            lastActive: Date.now()
        };
        this.players.set(userId, state);
        return state;
    }

    removePlayer(userId) {
        this.releasePlayerSeat(userId);
        const p = this.players.get(userId);
        this.players.delete(userId);
        return p;
    }

    getWs(userId) {
        return this.players.get(userId)?.ws || null;
    }

    claimSeatAnchor(seatAnchorId, userId) {
        if (!seatAnchorId) {
            this.releasePlayerSeat(userId);
            return { success: true };
        }
        const existing = this.seatLocks.get(seatAnchorId);
        if (existing && existing !== userId) {
            return { success: false, reason: 'SEAT_OCCUPIED', occupantId: existing };
        }
        this.releasePlayerSeat(userId);
        this.seatLocks.set(seatAnchorId, userId);
        const p = this.players.get(userId);
        if (p) p.seatAnchorId = seatAnchorId;
        return { success: true };
    }

    releasePlayerSeat(userId) {
        for (const [seatId, occupantId] of this.seatLocks.entries()) {
            if (occupantId === userId) {
                this.seatLocks.delete(seatId);
                const p = this.players.get(userId);
                if (p) p.seatAnchorId = null;
                return seatId;
            }
        }
        return null;
    }

    releaseSeatAnchor(seatAnchorId, userId) {
        if (this.seatLocks.get(seatAnchorId) === userId) {
            this.seatLocks.delete(seatAnchorId);
            const p = this.players.get(userId);
            if (p) p.seatAnchorId = null;
            return true;
        }
        return false;
    }

    getPlayer(userId) {
        return this.players.get(userId);
    }

    findPlayer(targetIdOrName) {
        if (!targetIdOrName) return null;
        if (this.players.has(targetIdOrName)) {
            return this.players.get(targetIdOrName);
        }
        const lower = String(targetIdOrName).trim().toLowerCase();
        for (const player of this.players.values()) {
            if (player.id.toLowerCase() === lower ||
                player.username.toLowerCase() === lower ||
                player.displayName.toLowerCase() === lower) {
                return player;
            }
        }
        return null;
    }

    updatePlayerMovement(userId, pos, yaw, anim, holoTool = null, extra = {}) {
        const p = this.players.get(userId);
        if (!p) return;

        // Expanded server bounds: Alpine peaks (-85) to South Beach pier (+95)
        p.position.x = Math.max(-65, Math.min(65, pos.x || p.position.x));
        p.position.y = Math.max(-5, Math.min(35, pos.y || p.position.y));
        p.position.z = Math.max(-85, Math.min(95, pos.z || p.position.z));
        if (typeof yaw === 'number') p.yaw = yaw;
        if (anim) p.anim = anim;
        if (holoTool) p.activeTool = holoTool;
        if (typeof extra.speedNorm === 'number') p.speedNorm = Math.max(0, Math.min(1.0, extra.speedNorm));
        if (extra.equippedItem !== undefined) p.equippedItem = String(extra.equippedItem).slice(0, 48);
        if (extra.isDrinking !== undefined) p.isDrinking = Boolean(extra.isDrinking);
        if (extra.seatAnchorId !== undefined) {
            const requestedSeat = extra.seatAnchorId ? String(extra.seatAnchorId).slice(0, 64) : null;
            if (requestedSeat) {
                const claim = this.claimSeatAnchor(requestedSeat, userId);
                p.seatAnchorId = claim.success ? requestedSeat : null;
            } else {
                this.releasePlayerSeat(userId);
                p.seatAnchorId = null;
            }
        }
        if (typeof extra.seatSlot === 'number') p.seatSlot = extra.seatSlot;
        if (extra.isFishing !== undefined) p.isFishing = Boolean(extra.isFishing);
        if (extra.fishingState !== undefined) p.fishingState = String(extra.fishingState).slice(0, 24);
        if (extra.bobberPos !== undefined) p.bobberPos = extra.bobberPos;
        p.lastActive = Date.now();
    }

    updateHoloState(userId, tool, lines = null) {
        const p = this.players.get(userId);
        if (!p) return;
        p.activeTool = tool || 'NONE';
        if (lines && Array.isArray(lines)) {
            p.snippetLines = lines;
        }
        p.lastActive = Date.now();
    }

    updatePresence(userId, presenceState) {
        const p = this.players.get(userId);
        if (p && presenceState) {
            p.presenceState = presenceState;
            p.lastActive = Date.now();
        }
    }

    updateProfileInfo(userId, updatedFields) {
        const p = this.players.get(userId);
        if (p) {
            if (updatedFields.level) p.level = updatedFields.level;
            if (updatedFields.title) p.title = updatedFields.title;
            if (updatedFields.presetId) p.presetId = updatedFields.presetId;
            if (updatedFields.customColors) p.customColors = updatedFields.customColors;
            if (updatedFields.customModelUrl !== undefined) p.customModelUrl = updatedFields.customModelUrl;
        }
    }

    updatePlayerCustom(userId, fields = {}) {
        const p = this.players.get(userId);
        if (p) {
            Object.assign(p, fields);
            p.lastActive = Date.now();
        }
    }

    /**
     * Get nearby players for a specific player (65m visibility radius)
     */
    getNearbyPlayers(userId) {
        const center = this.players.get(userId);
        if (!center) return [];

        const nearby = [];
        for (const [id, target] of this.players.entries()) {
            if (id === userId) continue;

            const dx = center.position.x - target.position.x;
            const dz = center.position.z - target.position.z;
            const dist = Math.hypot(dx, dz);

            if (dist <= VISIBILITY_RADIUS) {
                nearby.push({
                    id: target.id,
                    username: target.displayName || target.username,
                    level: target.level,
                    title: target.title,
                    presetId: target.presetId,
                    customColors: target.customColors,
                    customModelUrl: target.customModelUrl,
                    position: target.position,
                    yaw: target.yaw,
                    anim: target.anim,
                    speedNorm: target.speedNorm || 0,
                    equippedItem: target.equippedItem || 'none',
                    isDrinking: Boolean(target.isDrinking),
                    seatAnchorId: target.seatAnchorId || null,
                    seatSlot: target.seatSlot || 0,
                    isFishing: Boolean(target.isFishing),
                    fishingState: target.fishingState || 'idle',
                    bobberPos: target.bobberPos || null,
                    activeTool: target.activeTool || 'NONE',
                    snippetLines: target.snippetLines || [],
                    presenceState: target.presenceState,
                    isUmbrellaOpen: Boolean(target.isUmbrellaOpen),
                    isDancing: Boolean(target.isDancing),
                    voiceMuted: Boolean(target.voiceMuted !== false),
                    voiceSpeaking: Boolean(target.voiceSpeaking)
                });
            }
        }
        return nearby;
    }

    updatePlayerPet(userId, petData) {
        const p = this.players.get(userId);
        if (!p) return null;
        p.petState = {
            petId: petData.petId || 'pet_' + userId.slice(0, 8),
            species: petData.species || 'shiba',
            state: petData.state || 'IDLE',
            position: petData.position ? {
                x: Number(petData.position.x) || 0,
                y: Number(petData.position.y) || 0,
                z: Number(petData.position.z) || 0
            } : { x: 0, y: 0, z: 0 },
            velocity: petData.velocity ? {
                x: Number(petData.velocity.x) || 0,
                y: Number(petData.velocity.y) || 0,
                z: Number(petData.velocity.z) || 0
            } : { x: 0, y: 0, z: 0 },
            yaw: typeof petData.yaw === 'number' ? petData.yaw : 0,
            happiness: typeof petData.happiness === 'number' ? petData.happiness : 80,
            stamina: typeof petData.stamina === 'number' ? petData.stamina : 100,
            lastUpdate: Date.now()
        };
        return p.petState;
    }

    getAllPetSnapshots() {
        const list = [];
        for (const [userId, target] of this.players.entries()) {
            if (target.petState) {
                list.push({
                    ownerId: userId,
                    ownerName: target.displayName || target.username,
                    ...target.petState
                });
            }
        }
        return list;
    }

    getAllPlayerSnapshots() {
        const list = [];
        for (const target of this.players.values()) {
            list.push({
                id: target.id,
                username: target.displayName || target.username,
                level: target.level,
                title: target.title,
                presetId: target.presetId,
                customColors: target.customColors,
                customModelUrl: target.customModelUrl,
                position: target.position,
                yaw: target.yaw,
                anim: target.anim,
                speedNorm: target.speedNorm || 0,
                equippedItem: target.equippedItem || 'none',
                isDrinking: Boolean(target.isDrinking),
                seatAnchorId: target.seatAnchorId || null,
                seatSlot: target.seatSlot || 0,
                isFishing: Boolean(target.isFishing),
                fishingState: target.fishingState || 'idle',
                bobberPos: target.bobberPos || null,
                activeTool: target.activeTool || 'NONE',
                snippetLines: target.snippetLines || [],
                presenceState: target.presenceState,
                isUmbrellaOpen: Boolean(target.isUmbrellaOpen),
                isDancing: Boolean(target.isDancing),
                voiceMuted: Boolean(target.voiceMuted !== false),
                voiceSpeaking: Boolean(target.voiceSpeaking)
            });
        }
        return list;
    }
}

module.exports = new RoomManager();
