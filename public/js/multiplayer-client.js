/**
 * REALTIME MULTIPLAYER CLIENT & REPLICATION ENGINE
 * TeleTerm Living Open World Master Architecture — Sprint 3 (Overnight Release)
 * 
 * Features:
 * - 12 Hz Bidirectional Outbound/Inbound Sync Loop
 * - NTP-Lite Server Clock Synchronization (Smooth Offset & Zero-Drift Server Time)
 * - Hermite Spline Snapshot Interpolation with Derived Velocity & Deadzone (<0.05 m/s)
 * - Complete Remote Avatar Biomechanics via AvatarRetargeter & AvatarFaceRig
 * - Hand Socket Dynamic Replication (Grip Profiles, Palm Alignment, Drinking State)
 * - Synchronized Zen Fishing Replication (Catenary line, floating bobber, bite splash, 3D celebration)
 * - Social Co-Presence: Synchronized Campfire/Onsen Seating, Lockstep Group Dance, Clink Drinks [G]
 * - Multi-tier Distance LOD Culling for physics & DOM nameplates
 */

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Module scratchpads for zero-allocation per-frame kinematics & projection
let _remoteHeadPos = null;
let _remoteScreenCoords = null;
let _scratchVecA = null;
let _scratchVecB = null;

function getScratchpads() {
    if (!_remoteHeadPos && window.THREE) {
        _remoteHeadPos = new window.THREE.Vector3();
        _remoteScreenCoords = new window.THREE.Vector3();
        _scratchVecA = new window.THREE.Vector3();
        _scratchVecB = new window.THREE.Vector3();
    }
    return {
        headPos: _remoteHeadPos,
        screenCoords: _remoteScreenCoords,
        vecA: _scratchVecA,
        vecB: _scratchVecB
    };
}

class MultiplayerClient {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.myUserId = null;
        this.myProfile = null;

        // Map<userId, RemotePlayerState>
        this.remotePlayers = new Map();

        // Clock synchronization (NTP-lite)
        this.serverTimeOffset = 0;
        this.lastTimeSync = 0;
        this.timeSyncInterval = null;

        // Network loops
        this.sendTickTimer = null;
        this.reconnectTimer = null;
        this.reconnectAttempts = 0;

        // Clink Drinks State
        this.clinkPromptEl = null;
        this.nearbyClinkPeerId = null;

        this.init();
    }

    init() {
        this.setupClinkKeybind();
        this.setupVisibilityListener();
        this.connect();
    }

    setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.resetInterpolationBuffers('tab_visible_again');
            }
        });
    }

    resetInterpolationBuffers(reason = '') {
        // Refresh server time offset immediately on tab reactivation
        this.syncServerClock();

        for (const rp of this.remotePlayers.values()) {
            if (rp.snapshotBuffer && rp.snapshotBuffer.length > 0) {
                // Retain only latest authoritative snapshot, drop backlogged queue
                const latest = rp.snapshotBuffer[rp.snapshotBuffer.length - 1];
                rp.snapshotBuffer = [latest];

                // Direct snap to target position & yaw without hyper-speed blend
                if (!rp.seatAnchorId && rp.group) {
                    rp.group.position.copy(latest.position);
                    rp.group.rotation.y = latest.yaw;
                    rp.currentYaw = latest.yaw;
                }
            }
            rp.derivedSpeedNorm = 0.0;
            if (rp.retargeter) {
                rp.retargeter.setAnimation(rp.anim || 'Idle');
            }
        }
    }

    setupClinkKeybind() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'g' || e.key === 'G') {
                const active = document.activeElement;
                if (active && (
                    active.tagName === 'INPUT' ||
                    active.tagName === 'TEXTAREA' ||
                    active.isContentEditable ||
                    active.closest?.('.xterm') ||
                    active.closest?.('#mmo-chat-container')
                )) {
                    return;
                }

                // Check if user has a drink equipped and there is an adjacent player
                this.handleClinkKeyPress();
            }
        });
    }

    handleClinkKeyPress() {
        if (!this.isConnected || !window.openWorld3D) return;

        const localItem = window.openWorld3D.currentlyEquippedItemDef || window.openWorld3D.equippedItemDef;
        if (!localItem || !localItem.id || !localItem.id.startsWith('drink_')) {
            const i18n = window.TeleTermI18n;
            const isVi = i18n && i18n.getLanguage() === 'vi';
            if (window.openWorld3D.onToast) {
                window.openWorld3D.onToast(
                    isVi ? 'Hãy cầm đồ uống trên tay trước khi cụng ly (Phím 1-9)! 🍵' : 'Hold a drink in hand first to clink (Keys 1-9)! 🍵',
                    'info'
                );
            }
            return;
        }

        // Find nearest remote player within 3.2m
        const myPos = window.openWorld3D.player?.position;
        if (!myPos) return;

        let bestPeer = null;
        let bestDist = 3.2;

        for (const [id, rp] of this.remotePlayers.entries()) {
            const dist = myPos.distanceTo(rp.group.position);
            if (dist < bestDist) {
                bestDist = dist;
                bestPeer = rp;
            }
        }

        if (bestPeer) {
            this.sendClinkDrinks(bestPeer.id);
        } else {
            const i18n = window.TeleTermI18n;
            const isVi = i18n && i18n.getLanguage() === 'vi';
            if (window.openWorld3D.onToast) {
                window.openWorld3D.onToast(
                    isVi ? 'Không có người chơi nào gần bạn để cụng ly! 🍻' : 'No player nearby to clink drinks with! 🍻',
                    'warning'
                );
            }
        }
    }

    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${protocol}//${location.host}/ws/world`;

        try {
            this.ws = new WebSocket(url);
        } catch (e) {
            this.scheduleReconnect();
            return;
        }

        this.ws.onopen = () => {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            console.log('[Multiplayer] Connected to TeleTerm World Gateway /ws/world!');

            const urlParams = new URLSearchParams(window.location.search);
            const customUser = urlParams.get('user');
            this.send({ type: 'join', customUser });

            // Clock synchronization
            this.syncServerClock();
            if (this.timeSyncInterval) clearInterval(this.timeSyncInterval);
            this.timeSyncInterval = setInterval(() => this.syncServerClock(), 30000);

            // 12 Hz Outbound sync tick loop
            if (this.sendTickTimer) clearInterval(this.sendTickTimer);
            this.sendTickTimer = setInterval(() => {
                this.sendMovementTick();
            }, 1000 / 12);
        };

        this.ws.onmessage = (event) => {
            try {
                const packet = JSON.parse(event.data);
                this.handlePacket(packet);
            } catch (e) {}
        };

        this.ws.onclose = async () => {
            this.isConnected = false;
            if (this.sendTickTimer) clearInterval(this.sendTickTimer);
            if (this.timeSyncInterval) clearInterval(this.timeSyncInterval);

            try {
                const session = await fetch('/api/auth/desktop/session', { credentials: 'same-origin' });
                if (session.status === 401) {
                    const pairingPending = new URLSearchParams(window.location.hash.slice(1)).has('pair');
                    if (!pairingPending) {
                        window.location.assign('/launcher.html?login=1');
                        return;
                    }
                }
            } catch (e) {}
            this.scheduleReconnect();
        };

        this.ws.onerror = () => {
            this.isConnected = false;
        };
    }

    scheduleReconnect() {
        if (this.reconnectTimer) return;
        const baseDelay = Math.min(1000 * (2 ** this.reconnectAttempts), 30000);
        const jitter = Math.round(baseDelay * (Math.random() * 0.2));
        const delay = baseDelay - Math.round(baseDelay * 0.1) + jitter;
        this.reconnectAttempts += 1;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connect();
        }, delay);
    }

    send(packet) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(packet));
        }
    }

    syncServerClock() {
        this.send({
            type: 'time_sync',
            clientSendTime: Date.now()
        });
    }

    getSyncedServerTime() {
        return Date.now() + this.serverTimeOffset;
    }

    sendMovementTick() {
        if (!this.isConnected || !window.openWorld3D || !window.openWorld3D.player) return;

        const ow = window.openWorld3D;
        const player = ow.player;
        const keys = ow.keys || {};
        const isMoving = keys.forward || keys.backward || keys.left || keys.right || 
                         Math.abs(ow.joystickVector?.x || 0) > 0.1 ||
                         Math.abs(ow.joystickVector?.y || 0) > 0.1;

        const isSprinting = Boolean(keys.sprint);
        const speedNorm = isMoving ? (isSprinting ? 1.0 : (ow.retargeter?.speedNorm || 0.5)) : 0.0;

        const activeHolo = window.inworldHologramSystem?.currentTool || 'NONE';

        // Equipped item ID
        const equippedItemDef = ow.currentlyEquippedItemDef || ow.equippedItemDef;
        const equippedItem = equippedItemDef ? equippedItemDef.id : 'none';

        // Is drinking
        const isDrinking = Boolean(ow.isDrinkingHoldActive || (ow.retargeter && ow.retargeter.drinkHoldState));

        // Seating state
        const seatAnchorId = ow.isSitting && ow.currentSeatAnchor ? ow.currentSeatAnchor.id : null;
        const seatSlot = 0;

        // Fishing state
        const isFishing = Boolean(ow.zenFishing && ow.zenFishing.state !== 'IDLE');
        const fishingState = ow.zenFishing?.state || 'idle';
        const bobberPos = ow.zenFishing?.bobberPos ? {
            x: Number(ow.zenFishing.bobberPos.x.toFixed(3)),
            y: Number(ow.zenFishing.bobberPos.y.toFixed(3)),
            z: Number(ow.zenFishing.bobberPos.z.toFixed(3))
        } : null;

        // Animation name resolution
        let anim = 'idle';
        if (ow.isSitting && ow.currentSeatAnchor) {
            anim = ow.currentSeatAnchor.defaultAnim || 'SitIdle';
        } else if (ow.jumpState && ow.jumpState !== 'GROUNDED') {
            anim = 'jump';
        } else if (isMoving) {
            anim = isSprinting ? 'run' : 'walk';
        } else if (activeHolo !== 'NONE') {
            anim = 'typing';
        } else {
            anim = ow.retargeter?.currentAnim || 'idle';
        }

        this.send({
            type: 'move',
            position: {
                x: Number(player.position.x.toFixed(3)),
                y: Number(player.position.y.toFixed(3)),
                z: Number(player.position.z.toFixed(3))
            },
            yaw: Number(player.rotation.y.toFixed(3)),
            anim,
            holoTool: activeHolo,
            speedNorm: Number(speedNorm.toFixed(3)),
            equippedItem,
            isDrinking,
            seatAnchorId,
            seatSlot,
            isFishing,
            fishingState,
            bobberPos
        });

        if (window.voiceChatManager && typeof window.voiceChatManager.updateSpatialPositions === 'function') {
            window.voiceChatManager.updateSpatialPositions(player.position, player.rotation.y, this.remotePlayers);
        }
    }

    sendFishCast(bobberPos) {
        this.send({
            type: 'fish_cast',
            bobberPos: {
                x: Number(bobberPos.x.toFixed(3)),
                y: Number(bobberPos.y.toFixed(3)),
                z: Number(bobberPos.z.toFixed(3))
            }
        });
    }

    sendFishBite(bobberPos) {
        this.send({
            type: 'fish_bite',
            bobberPos: {
                x: Number(bobberPos.x.toFixed(3)),
                y: Number(bobberPos.y.toFixed(3)),
                z: Number(bobberPos.z.toFixed(3))
            }
        });
    }

    sendFishCatch(fish, weight) {
        this.send({
            type: 'fish_catch',
            fish: {
                id: fish.id,
                name: fish.name,
                vi: fish.vi,
                tier: fish.tier,
                color: fish.color,
                value: fish.value
            },
            weight: Number(weight)
        });
    }

    sendFishCancel() {
        this.send({ type: 'fish_cancel' });
    }

    sendCookStart(slotIndex) {
        this.send({
            type: 'cook_start',
            slotIndex: Number(slotIndex)
        });
    }

    sendCookFinish() {
        this.send({
            type: 'cook_finish'
        });
    }

    sendTradeBuy(itemId) {
        this.send({
            type: 'trade_buy',
            itemId: String(itemId)
        });
    }

    sendTradeSell(slotIndex) {
        this.send({
            type: 'trade_sell',
            slotIndex: Number(slotIndex)
        });
    }

    sendEmote(emoteId) {
        this.send({
            type: 'emote_trigger',
            emoteId: String(emoteId),
            timestamp: Date.now()
        });
    }

    sendBoomboxInteract(action, extra = {}) {
        this.send({
            type: 'boombox_interact',
            action,
            ...extra
        });
    }

    sendBoomboxSyncReq() {
        this.send({ type: 'boombox_sync_req' });
    }

    sendClinkDrinks(targetUserId) {
        this.send({
            type: 'clink_drinks_req',
            targetUserId
        });
    }

    sendUmbrella(isOpen) {
        this.send({
            type: 'umbrella_sync',
            isOpen: Boolean(isOpen)
        });
    }

    sendChat(text) {
        this.send({ type: 'chat', text });
    }

    sendWhisper(recipientId, text, recipientName = null) {
        this.send({ type: 'whisper', recipientId, recipientName, text });
    }

    sendPresence(state) {
        this.send({ type: 'presence', state });
    }

    sendAvatarUpdate(avatarData) {
        this.send({ type: 'avatar_update', ...avatarData });
    }

    broadcastHoloState(tool, lines) {
        this.send({ type: 'holo_state', tool, lines });
    }

    sendTimeSyncReq() {
        this.send({ type: 'time_sync_req' });
    }

    sendTimeSetReq(gameTime) {
        this.send({ type: 'time_set_req', gameTime });
    }

    sendPomodoroStart(durationSec = 1500) {
        this.send({ type: 'pomodoro_start', durationSec });
    }

    sendPomodoroJoin() {
        this.send({ type: 'pomodoro_join' });
    }

    sendPomodoroLeave() {
        this.send({ type: 'pomodoro_leave' });
    }

    sendPomodoroSyncReq() {
        this.send({ type: 'pomodoro_sync_req' });
    }

    sendPetSync(petData) {
        this.send({
            type: 'pet_sync',
            ...petData
        });
    }

    sendPetInteract(action, petId, pos) {
        this.send({
            type: 'pet_interact',
            action,
            petId,
            position: pos
        });
    }

    handlePacket(packet) {
        switch (packet.type) {
            case 'time_sync_ack': {
                const now = Date.now();
                const rtt = now - packet.clientSendTime;
                const serverEstimatedTime = packet.serverReceiveTime + (rtt / 2);
                const measuredOffset = serverEstimatedTime - now;
                // Exponential moving average filter
                this.serverTimeOffset = Math.round(this.serverTimeOffset * 0.7 + measuredOffset * 0.3);
                break;
            }

            case 'welcome': {
                this.myProfile = packet.profile;
                this.myUserId = packet.profile?.id || null;
                if (window.xpHud) window.xpHud.updateProgression(this.myProfile);
                if (window.playerInventory && typeof packet.profile?.teleCoins === 'number') {
                    window.playerInventory.setTeleCoins(packet.profile.teleCoins);
                }
                if (packet.boomboxState && window.spatialBoomboxManager) {
                    window.spatialBoomboxManager.syncState(packet.boomboxState);
                }

                if (packet.timeSync && window.dayNightCycleSystem) {
                    window.dayNightCycleSystem.syncServerTime(packet.timeSync);
                }

                if (packet.pomodoroSession && window.zenGardenPomodoro) {
                    window.zenGardenPomodoro.syncState(packet.pomodoroSession);
                }

                if (packet.pets && window.petCompanionSystem) {
                    window.petCompanionSystem.syncRemotePets(packet.pets);
                }

                if (packet.chatHistory && window.mmoChat) {
                    packet.chatHistory.forEach(msg => window.mmoChat.onIncomingMessage(msg));
                }

                if (packet.players) {
                    packet.players.forEach(p => {
                        if (p.id !== this.myUserId) this.spawnRemotePlayer(p);
                    });
                }
                break;
            }

            case 'player_join': {
                if (packet.player && packet.player.id !== this.myUserId) {
                    this.spawnRemotePlayer(packet.player);
                    if (window.mmoChat) {
                        window.mmoChat.addSystemMessage(`Developer [${packet.player.username}] joined the world!`);
                    }
                }
                break;
            }

            case 'player_leave': {
                this.removeRemotePlayer(packet.id);
                if (window.mmoChat && packet.username) {
                    window.mmoChat.addSystemMessage(`Developer [${packet.username}] left the world.`);
                }
                break;
            }

            case 'world_snapshot': {
                if (Array.isArray(packet.players)) {
                    packet.players.forEach(p => {
                        if (p.id !== this.myUserId) {
                            this.updateRemotePlayer(p);
                        }
                    });
                }
                break;
            }

            case 'fish_cast_update': {
                const rp = this.remotePlayers.get(packet.playerId);
                if (rp) {
                    rp.isFishing = true;
                    rp.fishingState = 'waiting';
                    if (packet.bobberPos) {
                        rp.bobberPos.set(packet.bobberPos.x, packet.bobberPos.y, packet.bobberPos.z);
                    }
                    if (rp.fishingBobber) rp.fishingBobber.visible = true;
                    if (rp.fishingLine) rp.fishingLine.visible = true;
                    if (rp.fishingRipple) rp.fishingRipple.visible = true;
                }
                break;
            }

            case 'fish_bite_update': {
                const rp = this.remotePlayers.get(packet.playerId);
                if (rp) {
                    rp.fishingState = 'bite';
                    if (packet.bobberPos) {
                        rp.bobberPos.set(packet.bobberPos.x, packet.bobberPos.y, packet.bobberPos.z);
                    }
                    this.triggerRemoteWaterSplash(rp.bobberPos.x, rp.bobberPos.y, rp.bobberPos.z);
                }
                break;
            }

            case 'fish_catch_update': {
                const rp = this.remotePlayers.get(packet.playerId);
                if (rp) {
                    rp.isFishing = false;
                    rp.fishingState = 'idle';
                    if (rp.fishingBobber) rp.fishingBobber.visible = false;
                    if (rp.fishingLine) rp.fishingLine.visible = false;
                    if (rp.fishingRipple) rp.fishingRipple.visible = false;
                    this.celebrateRemoteCatch(rp, packet.fish, packet.weight);
                }
                break;
            }

            case 'fish_cancel_update': {
                const rp = this.remotePlayers.get(packet.playerId);
                if (rp) {
                    rp.isFishing = false;
                    rp.fishingState = 'idle';
                    if (rp.fishingBobber) rp.fishingBobber.visible = false;
                    if (rp.fishingLine) rp.fishingLine.visible = false;
                    if (rp.fishingRipple) rp.fishingRipple.visible = false;
                }
                break;
            }

            case 'clink_drinks_exec': {
                this.executeClinkAnimation(packet.player1Id, packet.player2Id, packet.syncTimestamp);
                break;
            }

            case 'clink_drinks_err': {
                if (window.openWorld3D?.onToast) {
                    const i18n = window.TeleTermI18n;
                    const isVi = i18n && i18n.getLanguage() === 'vi';
                    window.openWorld3D.onToast(
                        isVi ? 'Không thể cụng ly (quá xa hoặc chưa cầm đồ uống)!' : 'Cannot clink drinks (too far or not holding drinks)!',
                        'warning'
                    );
                }
                break;
            }

            case 'umbrella_update': {
                const rp = this.remotePlayers.get(packet.playerId);
                if (rp) {
                    rp.isUmbrellaOpen = packet.isOpen;
                }
                break;
            }

            case 'holo_update': {
                const rp = this.remotePlayers.get(packet.playerId);
                if (rp && window.inworldHologramSystem) {
                    window.inworldHologramSystem.updateRemotePlayer(packet.playerId, rp.group, packet.tool, packet.lines);
                }
                break;
            }

            case 'chat_message':
            case 'chat_whisper': {
                if (packet.message && window.mmoChat) {
                    window.mmoChat.onIncomingMessage(packet.message);
                }
                break;
            }

            case 'chat_error': {
                if (window.mmoChat) {
                    const msg = packet.message || (packet.error === 'recipient_not_found' ? `Player "${packet.target || 'unknown'}" is not online.` : `Chat error: ${packet.error}`);
                    window.mmoChat.addSystemMessage(msg);
                }
                break;
            }

            case 'level_up_event': {
                if (packet.userId === this.myUserId) {
                    if (window.xpHud) window.xpHud.showLevelUpCelebration(packet.newLevel, packet.title);
                } else {
                    if (window.mmoChat) {
                        window.mmoChat.addSystemMessage(`🎉 Congratulations to ${packet.username} for reaching Lv.${packet.newLevel} — [${packet.title}]!`);
                    }
                }
                break;
            }

            case 'avatar_changed': {
                const rp = this.remotePlayers.get(packet.userId);
                if (rp) {
                    rp.customColors = packet.customColors;
                    rp.presetId = packet.presetId;
                }
                break;
            }

            case 'voice_signal': {
                if (window.voiceChatManager && packet.senderId && packet.signal) {
                    window.voiceChatManager.handleIncomingSignal(packet.senderId, packet.signal);
                }
                break;
            }

            case 'voice_state_update': {
                if (window.voiceChatManager) {
                    window.voiceChatManager.handleVoiceStateUpdate(packet.playerId, packet.muted, packet.speaking);
                }
                break;
            }

            case 'cook_start_ack': {
                if (window.campfireCookingSystem) {
                    window.campfireCookingSystem.handleServerCookStart(packet);
                }
                break;
            }

            case 'cook_start_err': {
                if (window.campfireCookingSystem) {
                    window.campfireCookingSystem.handleServerCookError(packet);
                }
                break;
            }

            case 'cook_finish_ack': {
                if (window.campfireCookingSystem) {
                    window.campfireCookingSystem.handleServerCookFinish(packet);
                }
                if (packet.inventory && window.playerInventory) {
                    window.playerInventory.slots = packet.inventory;
                    window.playerInventory.renderHotbar();
                }
                if (typeof packet.teleCoins === 'number' && window.playerInventory) {
                    window.playerInventory.setTeleCoins(packet.teleCoins);
                }
                break;
            }

            case 'cook_finish_err': {
                if (window.campfireCookingSystem) {
                    window.campfireCookingSystem.handleServerCookError(packet);
                }
                break;
            }

            case 'trade_buy_ack': {
                if (window.cyberShopSystem) {
                    window.cyberShopSystem.handleBuyAck(packet);
                }
                if (packet.success && packet.inventory && window.playerInventory) {
                    window.playerInventory.slots = packet.inventory;
                    window.playerInventory.renderHotbar();
                    window.playerInventory.setTeleCoins(packet.teleCoins);
                }
                break;
            }

            case 'trade_sell_ack': {
                if (window.cyberShopSystem) {
                    window.cyberShopSystem.handleSellAck(packet);
                }
                if (packet.success && packet.inventory && window.playerInventory) {
                    window.playerInventory.slots = packet.inventory;
                    window.playerInventory.renderHotbar();
                    window.playerInventory.setTeleCoins(packet.teleCoins);
                }
                break;
            }

            case 'campfire_sizzle_update': {
                if (window.openWorld3D && window.openWorld3D.campfireSocialSystem) {
                    window.openWorld3D.campfireSocialSystem.handleRemoteCooking(packet);
                }
                break;
            }

            case 'emote_broadcast': {
                const { playerId, emoteId } = packet;
                if (playerId === this.myUserId) {
                    if (window.openWorld3D?.retargeter) {
                        window.openWorld3D.retargeter.setAnimation(emoteId);
                    }
                } else {
                    const rp = this.remotePlayers.get(playerId);
                    if (rp && rp.retargeter) {
                        rp.retargeter.setAnimation(emoteId);
                    }
                }
                break;
            }

            case 'emote_rejected': {
                if (window.openWorld3D?.onToast) {
                    window.openWorld3D.onToast('Emote is on cooldown! (1.5s)', 'warning');
                }
                break;
            }

            case 'boombox_state':
            case 'boombox_state_update': {
                if (window.spatialBoomboxManager) {
                    window.spatialBoomboxManager.syncState(packet);
                }
                break;
            }

            case 'time_sync': {
                if (window.dayNightCycleSystem) {
                    window.dayNightCycleSystem.syncServerTime(packet);
                }
                break;
            }

            case 'pomodoro_sync': {
                if (window.zenGardenPomodoro) {
                    window.zenGardenPomodoro.syncState(packet);
                }
                break;
            }

            case 'pomodoro_buff_awarded': {
                if (window.zenGardenPomodoro) {
                    window.zenGardenPomodoro.onBuffAwarded(packet);
                }
                break;
            }

            case 'pet_sync_broadcast': {
                if (window.petCompanionSystem) {
                    window.petCompanionSystem.onRemotePetSync(packet);
                }
                break;
            }

            case 'pet_interact_broadcast': {
                if (window.petCompanionSystem) {
                    window.petCompanionSystem.onRemotePetInteract(packet);
                }
                break;
            }

            case 'pet_feed_ack': {
                if (window.petCompanionSystem) {
                    window.petCompanionSystem.onPetFeedAck(packet);
                }
                break;
            }

            case 'pet_despawn': {
                if (window.petCompanionSystem) {
                    window.petCompanionSystem.removeRemotePet(packet.ownerId);
                }
                break;
            }
        }
    }

    spawnRemotePlayer(playerData) {
        if (this.remotePlayers.has(playerData.id)) return;
        if (!window.openWorld3D || !window.openWorld3D.scene) return;

        const THREE = window.THREE;
        const group = new THREE.Group();
        group.name = `remote_player_${playerData.id}`;

        // 1. Avatar Model & Rig
        let avatarMesh;
        let isClonedMaster = false;
        const master = window.openWorld3D?.characterMeshMaster || (window.openWorld3D?.playerMesh?.userData?.isAvatar ? window.openWorld3D.playerMesh : null);
        if (master) {
            avatarMesh = master.clone(true);
            isClonedMaster = true;
        } else {
            const bodyGeo = new THREE.CylinderGeometry(0.24, 0.28, 1.45, 16);
            const headGeo = new THREE.SphereGeometry(0.22, 16, 16);
            const mat = new THREE.MeshStandardMaterial({
                color: playerData.customColors?.outfit || 0x38bdf8,
                roughness: 0.4
            });
            avatarMesh = new THREE.Mesh(bodyGeo, mat);
            avatarMesh.position.y = 0.72;
            const head = new THREE.Mesh(headGeo, mat);
            head.position.y = 0.95;
            avatarMesh.add(head);
        }

        group.add(avatarMesh);

        // 2. AvatarRetargeter & FaceRig (Full Procedural Gait & Expressions)
        let retargeter = null;
        let faceRig = null;
        if (window.AvatarRetargeter && avatarMesh && isClonedMaster) {
            try {
                retargeter = new window.AvatarRetargeter(avatarMesh, { defaultAnim: 'Idle' });
                faceRig = retargeter.faceRig;
            } catch (err) {
                console.warn('[Multiplayer] Remote avatar retargeter setup error:', err);
            }
        }

        // 3. Presence Ring below avatar
        const ringGeo = new THREE.RingGeometry(0.45, 0.65, 32);
        ringGeo.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.y = 0.04;
        group.add(ring);

        // 4. Remote Fishing Kit (Catenary line, Float bobber, Water ripple)
        const fishingBobber = this.buildRemoteBobberMesh();
        fishingBobber.visible = false;
        window.openWorld3D.scene.add(fishingBobber);

        const fishingRipple = this.buildRemoteRippleMesh();
        fishingRipple.visible = false;
        window.openWorld3D.scene.add(fishingRipple);

        const linePointsCount = 14;
        const linePositions = new Float32Array(linePointsCount * 3);
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        lineGeo.attributes.position.setUsage(THREE.DynamicDrawUsage);
        const lineMat = new THREE.LineBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.72
        });
        const fishingLine = new THREE.Line(lineGeo, lineMat);
        fishingLine.frustumCulled = false;
        fishingLine.visible = false;
        window.openWorld3D.scene.add(fishingLine);

        // 5. Initial Transforms
        const startX = playerData.position?.x || 0;
        const startY = playerData.position?.y || 0.05;
        const startZ = playerData.position?.z || 0;
        group.position.set(startX, startY, startZ);
        group.rotation.y = playerData.yaw || 0;

        window.openWorld3D.scene.add(group);

        // 6. Nameplate DOM element
        const nameplate = document.createElement('div');
        nameplate.className = 'remote-player-nameplate';
        nameplate.innerHTML = `
            <div class="nameplate-title">${escapeHtml(playerData.title || 'Script Novice')}</div>
            <div class="nameplate-main">
                <span class="nameplate-lvl">Lv.${playerData.level || 1}</span>
                <span class="nameplate-name">${escapeHtml(playerData.username)}</span>
            </div>
        `;
        document.body.appendChild(nameplate);

        // Initial snapshot entry
        const initialSnap = {
            time: this.getSyncedServerTime(),
            position: group.position.clone(),
            yaw: group.rotation.y,
            speedNorm: playerData.speedNorm || 0,
            anim: playerData.anim || 'idle',
            equippedItem: playerData.equippedItem || 'none',
            isDrinking: Boolean(playerData.isDrinking),
            seatAnchorId: playerData.seatAnchorId || null,
            isFishing: Boolean(playerData.isFishing),
            fishingState: playerData.fishingState || 'idle',
            bobberPos: playerData.bobberPos ? new THREE.Vector3(playerData.bobberPos.x, playerData.bobberPos.y, playerData.bobberPos.z) : null
        };

        const rp = {
            id: playerData.id,
            group,
            avatarMesh,
            retargeter,
            faceRig,
            nameplate,
            username: playerData.username,
            level: playerData.level || 1,
            title: playerData.title || 'Script Novice',
            customColors: playerData.customColors,
            presetId: playerData.presetId,

            // Interpolation Buffer
            snapshotBuffer: [initialSnap],
            targetPos: group.position.clone(),
            targetYaw: group.rotation.y,
            currentYaw: group.rotation.y,
            derivedSpeedNorm: 0,
            anim: playerData.anim || 'idle',

            // Handheld item state
            equippedItem: playerData.equippedItem || 'none',
            handheldItemMesh: null,
            isDrinking: Boolean(playerData.isDrinking),
            drinkAngle: 0,

            // Seating state
            seatAnchorId: playerData.seatAnchorId || null,

            // Fishing state
            isFishing: Boolean(playerData.isFishing),
            fishingState: playerData.fishingState || 'idle',
            bobberPos: playerData.bobberPos ? new THREE.Vector3(playerData.bobberPos.x, playerData.bobberPos.y, playerData.bobberPos.z) : new THREE.Vector3(startX, 0.45, startZ),
            fishingBobber,
            fishingRipple,
            fishingLine,
            linePositions,
            lineGeometry: lineGeo,
            linePointsCount,

            // Clinking state
            isClinking: false,
            clinkTimer: 0
        };

        this.remotePlayers.set(playerData.id, rp);

        // Late-Joiner Hydration: Fishing Visuals
        if (rp.isFishing) {
            if (rp.fishingBobber) rp.fishingBobber.visible = true;
            if (rp.fishingRipple) rp.fishingRipple.visible = true;
            if (rp.fishingLine) rp.fishingLine.visible = true;
        }

        // Late-Joiner Hydration: Seated Pose Snapping
        if (rp.seatAnchorId && window.openWorld3D?.interactionManager?.anchors) {
            const anchor = window.openWorld3D.interactionManager.anchors.get(rp.seatAnchorId);
            if (anchor) {
                rp.group.position.x = anchor.position.x;
                rp.group.position.y = anchor.position.y !== undefined ? anchor.position.y : 0.45;
                rp.group.position.z = anchor.position.z;
                rp.currentYaw = anchor.rotationY || 0;
                rp.group.rotation.y = rp.currentYaw;
            }
        }

        // Synchronize initial equipped item
        if (rp.equippedItem && rp.equippedItem !== 'none') {
            this.updateRemotePlayerItem(rp, rp.equippedItem);
        }
    }

    onMasterMeshLoaded(masterMesh) {
        if (!masterMesh || !window.THREE) return;
        for (const rp of this.remotePlayers.values()) {
            if (!rp.retargeter && rp.group) {
                if (rp.avatarMesh) {
                    rp.group.remove(rp.avatarMesh);
                }
                const newAvatarMesh = masterMesh.clone(true);
                rp.group.add(newAvatarMesh);
                rp.avatarMesh = newAvatarMesh;

                if (window.AvatarRetargeter) {
                    try {
                        rp.retargeter = new window.AvatarRetargeter(newAvatarMesh, { defaultAnim: rp.anim || 'Idle' });
                        rp.faceRig = rp.retargeter.faceRig;
                    } catch (e) {
                        console.warn('[Multiplayer] Failed to attach AvatarRetargeter on loaded master mesh:', e);
                    }
                }

                if (rp.equippedItem && rp.equippedItem !== 'none') {
                    this.updateRemotePlayerItem(rp, rp.equippedItem);
                }
            }
        }
    }

    buildRemoteBobberMesh() {
        const THREE = window.THREE;
        const bGroup = new THREE.Group();
        bGroup.name = 'RemoteFishingBobber';

        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
        const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });

        const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), whiteMat);
        bGroup.add(bottom);

        const top = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), redMat);
        bGroup.add(top);

        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8), redMat);
        antenna.position.y = 0.07;
        bGroup.add(antenna);

        return bGroup;
    }

    buildRemoteRippleMesh() {
        const THREE = window.THREE;
        const geo = new THREE.RingGeometry(0.08, 0.32, 24);
        geo.rotateX(-Math.PI / 2);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xbae6fd,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        return new THREE.Mesh(geo, mat);
    }

    updateRemotePlayer(playerData) {
        let rp = this.remotePlayers.get(playerData.id);
        if (!rp) {
            this.spawnRemotePlayer(playerData);
            rp = this.remotePlayers.get(playerData.id);
            if (!rp) return;
        }

        const THREE = window.THREE;
        const now = this.getSyncedServerTime();

        const newPos = playerData.position
            ? new THREE.Vector3(playerData.position.x, playerData.position.y, playerData.position.z)
            : rp.targetPos.clone();

        const newSnap = {
            time: now,
            position: newPos,
            yaw: typeof playerData.yaw === 'number' ? playerData.yaw : rp.targetYaw,
            speedNorm: typeof playerData.speedNorm === 'number' ? playerData.speedNorm : 0,
            anim: playerData.anim || 'idle',
            equippedItem: playerData.equippedItem || 'none',
            isDrinking: Boolean(playerData.isDrinking),
            seatAnchorId: playerData.seatAnchorId || null,
            isFishing: Boolean(playerData.isFishing),
            fishingState: playerData.fishingState || 'idle',
            bobberPos: playerData.bobberPos ? new THREE.Vector3(playerData.bobberPos.x, playerData.bobberPos.y, playerData.bobberPos.z) : null
        };

        rp.snapshotBuffer.push(newSnap);
        // Keep at most 12 snapshots (~1 second buffer)
        if (rp.snapshotBuffer.length > 12) {
            rp.snapshotBuffer.shift();
        }

        rp.targetPos.copy(newSnap.position);
        rp.targetYaw = newSnap.yaw;
        rp.anim = newSnap.anim;
        rp.seatAnchorId = newSnap.seatAnchorId;

        // Update item equipment if changed
        if (newSnap.equippedItem !== rp.equippedItem) {
            rp.equippedItem = newSnap.equippedItem;
            this.updateRemotePlayerItem(rp, rp.equippedItem);
        }

        rp.isDrinking = newSnap.isDrinking;

        // Update fishing state
        if (newSnap.isFishing !== rp.isFishing) {
            rp.isFishing = newSnap.isFishing;
            rp.fishingState = newSnap.fishingState;
            if (rp.fishingBobber) rp.fishingBobber.visible = rp.isFishing;
            if (rp.fishingLine) rp.fishingLine.visible = rp.isFishing;
            if (rp.fishingRipple) rp.fishingRipple.visible = rp.isFishing;
        }

        if (newSnap.bobberPos) {
            rp.bobberPos.copy(newSnap.bobberPos);
        }

        // Hologram update
        if (window.inworldHologramSystem && playerData.activeTool !== undefined) {
            window.inworldHologramSystem.updateRemotePlayer(
                playerData.id,
                rp.group,
                playerData.activeTool,
                playerData.snippetLines
            );
        }
    }

    updateRemotePlayerItem(rp, itemId) {
        if (!rp.retargeter || !rp.retargeter.mappedBones?.RightHand) return;
        const handBone = rp.retargeter.mappedBones.RightHand;

        // Remove existing item mesh
        if (rp.handheldItemMesh) {
            handBone.remove(rp.handheldItemMesh);
            rp.handheldItemMesh = null;
        }

        if (!itemId || itemId === 'none') {
            if (rp.retargeter.setHandPose) rp.retargeter.setHandPose('relaxed');
            return;
        }

        // Lookup definition
        const itemDef = window.ITEM_REGISTRY?.[itemId] || { id: itemId, gripProfile: 'small_can' };
        if (typeof window.createHandheldItemMesh === 'function') {
            const mesh = window.createHandheldItemMesh(itemDef);
            if (mesh) {
                const profiles = window.GRIP_PROFILES || {};
                const profile = profiles[itemDef.gripProfile || itemDef.handPose || 'small_can'] || profiles.small_can;
                if (profile) {
                    if (profile.localPosition) mesh.position.set(...profile.localPosition);
                    if (profile.localRotation) mesh.rotation.set(...profile.localRotation);
                    if (profile.localScale) mesh.scale.set(...profile.localScale);
                }
                handBone.add(mesh);
                rp.handheldItemMesh = mesh;

                if (rp.retargeter.setHandPose) {
                    rp.retargeter.setHandPose(itemDef.handPose || itemDef.gripProfile || 'small_can');
                }
            }
        }
    }

    removeRemotePlayer(userId) {
        const rp = this.remotePlayers.get(userId);
        if (rp) {
            if (window.openWorld3D && window.openWorld3D.scene) {
                window.openWorld3D.scene.remove(rp.group);
                if (rp.fishingBobber) {
                    window.openWorld3D.scene.remove(rp.fishingBobber);
                    rp.fishingBobber.traverse(c => {
                        if (c.geometry) c.geometry.dispose();
                        if (c.material) c.material.dispose();
                    });
                }
                if (rp.fishingRipple) {
                    window.openWorld3D.scene.remove(rp.fishingRipple);
                    if (rp.fishingRipple.geometry) rp.fishingRipple.geometry.dispose();
                    if (rp.fishingRipple.material) rp.fishingRipple.material.dispose();
                }
                if (rp.fishingLine) {
                    window.openWorld3D.scene.remove(rp.fishingLine);
                    if (rp.lineGeometry) rp.lineGeometry.dispose();
                    if (rp.fishingLine.material) rp.fishingLine.material.dispose();
                }
            }
            if (rp.nameplate) rp.nameplate.remove();
            if (window.inworldHologramSystem) {
                window.inworldHologramSystem.removeRemotePlayer(userId);
            }
            if (window.voiceChatManager) {
                window.voiceChatManager.disconnectPeer(userId);
            }
            this.remotePlayers.delete(userId);
        }
    }

    executeClinkAnimation(player1Id, player2Id, syncTimestamp) {
        const now = this.getSyncedServerTime();
        const delay = Math.max(0, syncTimestamp - now);

        setTimeout(() => {
            this.playClinkSound();

            const p1 = this.remotePlayers.get(player1Id);
            const p2 = this.remotePlayers.get(player2Id);

            if (p1) {
                p1.isClinking = true;
                p1.clinkTimer = 0.75;
            }
            if (p2) {
                p2.isClinking = true;
                p2.clinkTimer = 0.75;
            }

            // Local player celebration
            const isMeP1 = player1Id === this.myUserId;
            const isMeP2 = player2Id === this.myUserId;
            if (isMeP1 || isMeP2) {
                const partnerName = isMeP1 ? (p2?.username || 'Friend') : (p1?.username || 'Friend');
                const i18n = window.TeleTermI18n;
                const isVi = i18n && i18n.getLanguage() === 'vi';
                if (window.openWorld3D?.onToast) {
                    window.openWorld3D.onToast(
                        isVi ? `🍻 Cụng ly thành công cùng ${partnerName}! (+10 Zen XP)` : `🍻 Cheers with ${partnerName}! (+10 Zen XP)`,
                        'success'
                    );
                }
            }

            // Spawn golden celebration sparks between the two players
            const pos1 = isMeP1 ? window.openWorld3D?.player?.position : p1?.group?.position;
            const pos2 = isMeP2 ? window.openWorld3D?.player?.position : p2?.group?.position;
            if (pos1 && pos2) {
                const midX = (pos1.x + pos2.x) * 0.5;
                const midY = ((pos1.y || 0) + (pos2.y || 0)) * 0.5 + 1.15;
                const midZ = (pos1.z + pos2.z) * 0.5;
                this.spawnClinkSparks(midX, midY, midZ);
            }
        }, delay);
    }

    playClinkSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = window.openWorld3D?.audioContext || new AudioCtx();
            if (!ctx) return;
            const now = ctx.currentTime;
            [2400, 3600, 4800].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                gain.gain.setValueAtTime(0.12 / (idx + 1), now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.65);
            });
        } catch (e) {}
    }

    spawnClinkSparks(x, y, z) {
        if (!window.openWorld3D || !window.openWorld3D.scene || !window.THREE) return;
        const THREE = window.THREE;
        const pCount = 18;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(pCount * 3);
        const velocities = [];

        for (let i = 0; i < pCount; i++) {
            positions[i * 3 + 0] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.6 + Math.random() * 1.4;
            velocities.push({
                x: Math.cos(angle) * speed,
                y: 0.8 + Math.random() * 1.2,
                z: Math.sin(angle) * speed,
                life: 0.65
            });
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: 0xfef08a,
            size: 0.14,
            transparent: true,
            opacity: 0.9,
            depthWrite: false
        });

        const p = new THREE.Points(geo, mat);
        window.openWorld3D.scene.add(p);

        let elapsed = 0;
        const interval = setInterval(() => {
            elapsed += 0.033;
            const posAttr = p.geometry.attributes.position;
            let alive = false;
            for (let i = 0; i < pCount; i++) {
                if (velocities[i].life > 0) {
                    alive = true;
                    velocities[i].life -= 0.033;
                    velocities[i].y -= 4.5 * 0.033;
                    posAttr.setXYZ(
                        i,
                        posAttr.getX(i) + velocities[i].x * 0.033,
                        posAttr.getY(i) + velocities[i].y * 0.033,
                        posAttr.getZ(i) + velocities[i].z * 0.033
                    );
                }
            }
            posAttr.needsUpdate = true;
            if (!alive || elapsed > 0.65) {
                clearInterval(interval);
                window.openWorld3D.scene.remove(p);
                geo.dispose();
                mat.dispose();
            }
        }, 33);
    }

    triggerRemoteWaterSplash(x, y, z) {
        if (window.openWorld3D?.zenFishing && typeof window.openWorld3D.zenFishing.triggerSplash === 'function') {
            window.openWorld3D.zenFishing.triggerSplash(x, y, z);
        }
    }

    celebrateRemoteCatch(rp, fish, weight) {
        if (!window.openWorld3D?.scene || !fish) return;
        this.triggerRemoteWaterSplash(rp.bobberPos.x, rp.bobberPos.y, rp.bobberPos.z);

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';
        const fishName = isVi ? (fish.vi || fish.name) : fish.name;

        if (window.mmoChat) {
            window.mmoChat.addSystemMessage(
                `🎣 ${rp.username} just reeled in a [${fish.tier?.toUpperCase()}] ${fishName} (${weight} kg)!`
            );
        }
    }

    /**
     * Main Render Loop Update (Zero-Allocation & Strict Kinematic Order)
     */
    update(delta, camera) {
        // Tab throttle / frame spike guard: reset buffer if delta > 0.8s
        if (delta > 0.8) {
            this.resetInterpolationBuffers('frame_spike_recovery_' + delta.toFixed(2));
            return;
        }

        const { headPos, screenCoords } = getScratchpads();
        const renderTime = this.getSyncedServerTime() - 100; // 100ms interpolation buffer delay
        const camPos = camera ? camera.position : null;

        for (const [id, rp] of this.remotePlayers.entries()) {
            const distToCam = camPos ? rp.group.position.distanceTo(camPos) : 0;

            // Distance LOD determinations
            // LOD 0 (<22m): full retargeter & physics
            // LOD 1 (22m-45m): retargeter active, physics weight 0.3
            // LOD 2 (>45m): minimal simulation, physics weight 0
            const physicsWeight = distToCam < 22 ? 1.0 : (distToCam < 45 ? 0.3 : 0.0);

            // 1. POSITION & YAW INTERPOLATION
            let speedNorm = 0;
            if (rp.seatAnchorId && window.openWorld3D?.interactionManager?.anchors) {
                // Seated Avatar: lock directly to seat anchor transform
                const anchor = window.openWorld3D.interactionManager.anchors.get(rp.seatAnchorId);
                if (anchor) {
                    rp.group.position.x = anchor.position.x;
                    rp.group.position.y = anchor.position.y !== undefined ? anchor.position.y : 0.45;
                    rp.group.position.z = anchor.position.z;
                    rp.currentYaw = anchor.rotationY || 0;
                    rp.group.rotation.y = rp.currentYaw;
                }
            } else {
                // Standing/Moving Avatar: Hermite / Spline buffer interpolation
                const buf = rp.snapshotBuffer;
                if (buf.length >= 2) {
                    let s0 = buf[0];
                    let s1 = buf[buf.length - 1];

                    // Find surrounding snapshots around renderTime
                    for (let i = 0; i < buf.length - 1; i++) {
                        if (buf[i].time <= renderTime && buf[i + 1].time >= renderTime) {
                            s0 = buf[i];
                            s1 = buf[i + 1];
                            break;
                        }
                    }

                    const span = Math.max(1, s1.time - s0.time);
                    const rawT = Math.min(1, Math.max(0, (renderTime - s0.time) / span));
                    // Smoothstep cubic
                    const t = rawT * rawT * (3 - 2 * rawT);

                    const prevPos = rp.group.position.clone();
                    rp.group.position.lerpVectors(s0.position, s1.position, t);

                    // Shortest-arc yaw interpolation
                    let diff = s1.yaw - s0.yaw;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    rp.currentYaw = s0.yaw + diff * t;
                    rp.group.rotation.y = rp.currentYaw;

                    // Derived speed norm & Deadzone (<0.05 m/s)
                    const traveledDist = prevPos.distanceTo(rp.group.position);
                    const derivedSpeed = delta > 0 ? (traveledDist / delta) : 0;
                    if (derivedSpeed < 0.05) {
                        speedNorm = 0.0;
                    } else {
                        speedNorm = s1.speedNorm !== undefined ? s1.speedNorm : Math.min(1, derivedSpeed / 4.5);
                    }
                } else {
                    // Smooth lerp fallback
                    const smooth = Math.min(1, delta * 14);
                    rp.group.position.lerp(rp.targetPos, smooth);
                    let diff = rp.targetYaw - rp.currentYaw;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    rp.currentYaw += diff * smooth;
                    rp.group.rotation.y = rp.currentYaw;
                    speedNorm = rp.targetPos.distanceTo(rp.group.position) > 0.05 ? 0.5 : 0.0;
                }
            }
            rp.derivedSpeedNorm = speedNorm;

            // 2. PROCEDURAL GAIT & RETARGETER KINEMATICS
            if (rp.retargeter) {
                const isMoving = speedNorm > 0.05;
                const isSprinting = speedNorm > 0.7;

                if (rp.seatAnchorId) {
                    rp.retargeter.setAnimation(rp.anim || 'SitIdle');
                    rp.retargeter.update(delta, false, false, { physicsWeight });
                } else if (rp.anim === 'dance' || rp.anim === 'vibe_dance') {
                    // Lockstep group emote synchronization
                    const dancePeriod = 2.4;
                    const syncedPhase = ((this.getSyncedServerTime() / 1000) % dancePeriod) / dancePeriod;
                    rp.retargeter.setAnimation('vibe_dance');
                    rp.retargeter.gaitPhase = syncedPhase * Math.PI * 2;
                    rp.retargeter.update(delta, false, false, { physicsWeight });
                } else if (isMoving) {
                    rp.retargeter.setAnimation(isSprinting ? 'run' : 'walk');
                    rp.retargeter.update(delta, true, isSprinting, { physicsWeight });
                } else {
                    rp.retargeter.setAnimation(rp.anim || 'Idle');
                    rp.retargeter.update(delta, false, false, { physicsWeight });
                }

                // 3. FACE RIG UPDATE (Close camera LOD < 20m)
                if (rp.faceRig && distToCam <= 20) {
                    rp.faceRig.update(delta);
                }

                // 4. HANDHELD ITEM & DRINKING ADJUSTMENT
                if (rp.isDrinking && rp.handheldItemMesh) {
                    // Raise can smoothly towards mouth
                    rp.drinkAngle = Math.min(1.0, rp.drinkAngle + delta * 3.5);
                    rp.handheldItemMesh.position.y += Math.sin(rp.drinkAngle * Math.PI * 0.5) * 0.02;
                    rp.handheldItemMesh.rotation.x += Math.sin(rp.drinkAngle * Math.PI * 0.5) * 0.35;
                } else if (rp.drinkAngle > 0) {
                    rp.drinkAngle = Math.max(0.0, rp.drinkAngle - delta * 3.5);
                }

                // Clink drinks animation
                if (rp.isClinking) {
                    rp.clinkTimer -= delta;
                    if (rp.clinkTimer <= 0) {
                        rp.isClinking = false;
                    } else if (rp.handheldItemMesh) {
                        rp.handheldItemMesh.position.z += Math.sin(rp.clinkTimer * 8.0) * 0.015;
                    }
                }
            }

            // 5. FISHING REPLICATION UPDATE (Distance LOD < 60m)
            if (rp.isFishing && rp.fishingLine && rp.fishingBobber && distToCam <= 60) {
                // Bobber float oscillation
                const time = performance.now() / 1000;
                rp.fishingBobber.position.set(
                    rp.bobberPos.x,
                    rp.bobberPos.y + Math.sin(time * 3.0) * 0.02,
                    rp.bobberPos.z
                );

                if (rp.fishingRipple) {
                    rp.fishingRipple.position.set(rp.bobberPos.x, rp.bobberPos.y + 0.01, rp.bobberPos.z);
                    const rScale = 1.0 + (time % 1.5) * 0.8;
                    rp.fishingRipple.scale.set(rScale, rScale, rScale);
                    rp.fishingRipple.material.opacity = Math.max(0.0, 0.65 - (time % 1.5) * 0.4);
                }

                // Catenary line from remote player right hand / rod tip to bobber
                const rodTipWorldPos = _scratchVecA || new THREE.Vector3();
                if (rp.retargeter?.mappedBones?.RightHand) {
                    rp.retargeter.mappedBones.RightHand.getWorldPosition(rodTipWorldPos);
                    rodTipWorldPos.y += 1.4; // Tip height
                } else {
                    rodTipWorldPos.copy(rp.group.position);
                    rodTipWorldPos.y += 1.4;
                }

                const n = rp.linePointsCount;
                const p = rp.linePositions;
                const startX = rodTipWorldPos.x;
                const startY = rodTipWorldPos.y;
                const startZ = rodTipWorldPos.z;
                const endX = rp.fishingBobber.position.x;
                const endY = rp.fishingBobber.position.y + 0.08;
                const endZ = rp.fishingBobber.position.z;

                for (let i = 0; i < n; i++) {
                    const t = i / (n - 1);
                    const x = startX + (endX - startX) * t;
                    const z = startZ + (endZ - startZ) * t;
                    const sag = Math.sin(t * Math.PI) * (rp.fishingState === 'bite' ? 0.05 : 0.35);
                    const y = startY + (endY - startY) * t - sag;

                    const idx = i * 3;
                    p[idx] = x;
                    p[idx + 1] = y;
                    p[idx + 2] = z;
                }
                rp.lineGeometry.attributes.position.needsUpdate = true;
            }

            // 6. NAMEPLATE SCREEN PROJECTION & LOD
            if (rp.nameplate && camera && headPos && screenCoords) {
                if (distToCam > 45) {
                    rp.nameplate.style.display = 'none';
                } else {
                    headPos.copy(rp.group.position);
                    headPos.y += rp.seatAnchorId ? 1.45 : 2.05;

                    screenCoords.copy(headPos).project(camera);
                    if (screenCoords.z > 1) {
                        rp.nameplate.style.display = 'none';
                    } else {
                        const x = (screenCoords.x * 0.5 + 0.5) * window.innerWidth;
                        const y = (-(screenCoords.y * 0.5) + 0.5) * window.innerHeight;
                        rp.nameplate.style.display = 'flex';
                        rp.nameplate.style.left = `${x}px`;
                        rp.nameplate.style.top = `${y}px`;

                        // Compact styling when medium distance
                        if (distToCam > 22) {
                            rp.nameplate.classList.add('compact');
                        } else {
                            rp.nameplate.classList.remove('compact');
                        }
                    }
                }
            }
        }

        // 7. Clink Drinks Proximity HUD Prompt
        const localItem = window.openWorld3D?.currentlyEquippedItemDef || window.openWorld3D?.equippedItemDef;
        const localHasDrink = Boolean(localItem?.id?.startsWith('drink_'));
        let nearestDrinkPeer = null;
        let nearestDist = 2.8;

        if (localHasDrink && window.openWorld3D?.player) {
            const myPos = window.openWorld3D.player.position;
            for (const rp of this.remotePlayers.values()) {
                if (rp.equippedItem && rp.equippedItem.startsWith('drink_')) {
                    const dist = myPos.distanceTo(rp.group.position);
                    if (dist < nearestDist) {
                        nearestDist = dist;
                        nearestDrinkPeer = rp;
                    }
                }
            }
        }

        if (nearestDrinkPeer) {
            if (!this.clinkPromptEl) {
                this.clinkPromptEl = document.createElement('div');
                this.clinkPromptEl.className = 'hud-clink-prompt-badge';
                this.clinkPromptEl.innerHTML = `<span class="clink-key">[G]</span> <span class="clink-text"></span>`;
                document.body.appendChild(this.clinkPromptEl);
            }
            const i18n = window.TeleTermI18n;
            const isVi = i18n && i18n.getLanguage() === 'vi';
            this.clinkPromptEl.querySelector('.clink-text').textContent = isVi 
                ? `Cụng ly cùng ${nearestDrinkPeer.username} 🍻` 
                : `Clink drinks with ${nearestDrinkPeer.username} 🍻`;
            this.clinkPromptEl.classList.remove('hidden');
        } else if (this.clinkPromptEl) {
            this.clinkPromptEl.classList.add('hidden');
        }
    }
}

window.multiplayerClient = new MultiplayerClient();
