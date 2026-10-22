/**
 * Realtime WebSocket Gateway & 12 Hz World Dispatcher
 * TeleTerm Master Architecture v2 - Section 5, 6
 */

const WebSocket = require('ws');
const roomManager = require('./room-manager');
const chatService = require('../social/chat-service');
const xpService = require('../progression/xp-service');
const profileRepo = require('../persistence/profile-repository');
const logger = require('../logger');

const TICK_RATE_HZ = 12; // 12 updates per second (approx 83.3ms)
const HEARTBEAT_INTERVAL_MS = 25_000;

const SHOP_CATALOG = {
    item_golden_rod: {
        id: 'item_golden_rod',
        name: 'Golden Master Fishing Rod',
        vi: 'Cần Câu Vàng Hoàng Gia',
        price: 250,
        type: 'tool',
        holdable: true,
        handPose: 'fishing_rod',
        gripProfile: 'fishing_rod',
        model: 'golden_rod',
        desc: 'Royal golden rod forged from sunstone alloys. Increases bite frequency and catches rare species.'
    },
    item_luminous_bait: {
        id: 'item_luminous_bait',
        name: 'Luminous Night Bait',
        vi: 'Mồi Câu Phát Quang',
        price: 40,
        type: 'consumable',
        holdable: false,
        desc: 'Bioluminescent deep-lake bait that attracts legendary nocturnal fish.'
    },
    item_onsen_herbal_tea: {
        id: 'item_onsen_herbal_tea',
        name: 'Onsen Herbal Tea',
        vi: 'Trà Thảo Mộc Suối Nước Nóng',
        price: 35,
        type: 'consumable',
        holdable: true,
        handPose: 'mug',
        gripProfile: 'mug',
        useAnimation: 'Coffee',
        useSound: 'drink_soft',
        model: 'onsen_tea',
        desc: 'Steaming hot herbal infusion brewed with alpine spring water. Restores 30 Energy.'
    },
    item_lofi_boombox: {
        id: 'item_lofi_boombox',
        name: 'Spatial Lo-Fi Boombox',
        vi: 'Đài Cassette Lo-Fi Cổ Điển',
        price: 280,
        type: 'holdable',
        holdable: true,
        handPose: 'phone',
        gripProfile: 'phone',
        model: 'lofi_boombox',
        desc: 'Vintage cyberpunk stereo deck that plays synchronized chillhop beats.'
    }
};

const FISH_SELL_PRICES = {
    nullpointer_koi: 30,
    async_salmon: 45,
    memory_leak_eel: 65,
    deadlock_crab: 60,
    stackoverflow_bass: 75,
    docker_whale_fry: 160,
    regex_pufferfish: 140,
    git_kraken_mini: 180,
    kernel_catfish: 350,
    zero_day_sturgeon: 500,
    quantum_qubit_trout: 600,
    argon_dragonfish: 1500,
    fish_koi: 50,
    fish_salmon: 45,
    fish_bass: 40,
    fish_ayu: 30,
    item_grilled_fish: 85,
    item_burnt_fish: 5
};

class RealtimeGateway {
    constructor() {
        this.wss = new WebSocket.Server({ noServer: true, maxPayload: 16 * 1024 });
        this.tickTimer = null;
        this.heartbeatTimer = null;
        this.activeCookings = new Map(); // userId -> { startTime, fishId, slotIndex }
        this.activeTradeLocks = new Set(); // userId transaction mutex
        this.boomboxState = {
            id: 'party_boombox_north_terrace',
            position: { x: 15.1, y: 0.8, z: 16.2 },
            isPlaying: true,
            currentTrackId: 'midnight_sakura',
            currentTrackTitle: 'Midnight Sakura Lo-Fi',
            trackStartTimestamp: Date.now(),
            pauseOffsetMs: 0
        };
        this.playerEmoteCooldowns = new Map(); // userId -> lastEmoteTimestamp

        // Milestone 4: Shared Pomodoro Zen Garden Session (Argon Spec: 25m Focus / 5m Break / Buff Persistence)
        this.pomodoroSession = {
            state: 'IDLE', // 'IDLE' | 'FOCUS_ACTIVE' | 'BREAK_ACTIVE'
            durationSec: 1500, // 25m
            breakDurationSec: 300, // 5m
            startedAt: 0,
            endsAt: 0,
            participants: new Set(),
            center: { x: 36.0, y: 0.8, z: -24.5 },
            radius: 15.0
        };

        this.telemetry = {
            packetsIn: 0,
            packetsOut: 0,
            bytesIn: 0,
            bytesOut: 0,
            seatCollisions: 0,
            startedAt: Date.now()
        };

        this.init();
    }

    init() {
        this.wss.on('connection', (ws, request) => {
            let currentUserId = null;
            let packetWindowStarted = Date.now();
            let packetCount = 0;
            ws.isAlive = true;

            // Browser WebSocket implementations automatically answer protocol-level pings.
            ws.on('pong', () => {
                ws.isAlive = true;
            });

            ws.on('message', (data) => {
                try {
                    this.telemetry.packetsIn += 1;
                    this.telemetry.bytesIn += data.length || 0;
                    if (Date.now() - packetWindowStarted >= 1000) {
                        packetWindowStarted = Date.now();
                        packetCount = 0;
                    }
                    packetCount += 1;
                    if (packetCount > 60) return ws.close(4408, 'rate limit exceeded');
                    const raw = data.toString();
                    const packet = JSON.parse(raw);
                    if (!packet || typeof packet.type !== 'string' || packet.type.length > 32) return;

                    currentUserId = this.handlePacket(ws, currentUserId, packet, request.authSession);
                } catch (err) {
                    logger.error('[RealtimeGateway] Packet parse error:', err.message);
                }
            });

            ws.on('close', () => {
                if (currentUserId) {
                    this.removePlayer(currentUserId);
                }
            });

            ws.on('error', (err) => {
                logger.error('[RealtimeGateway] WebSocket error:', err.message);
            });
        });

        // 12 Hz Replication Tick Loop
        this.tickTimer = setInterval(() => {
            this.broadcastWorldSnapshots();
        }, 1000 / TICK_RATE_HZ);

        // Keep idle/background game sockets alive through proxies and detect dead peers.
        this.heartbeatTimer = setInterval(() => {
            for (const ws of this.wss.clients) {
                if (ws.readyState !== WebSocket.OPEN) continue;
                if (ws.isAlive === false) {
                    ws.terminate();
                    continue;
                }

                ws.isAlive = false;
                ws.ping();
            }
        }, HEARTBEAT_INTERVAL_MS);
        this.heartbeatTimer.unref?.();

        // Milestone 3: Authoritative Game Time Chrono-Sync (Argon Spec: 24m = 24h, 10s broadcast)
        this.serverGameTime = {
            gameTime: 12.0, // High noon default
            cycleMinutes: 24, // 24 minutes per full day/night cycle
            lastTick: Date.now()
        };

        this.timeSyncTimer = setInterval(() => {
            const now = Date.now();
            const deltaSec = (now - this.serverGameTime.lastTick) / 1000;
            this.serverGameTime.lastTick = now;
            const hoursPerRealSec = 24.0 / (this.serverGameTime.cycleMinutes * 60);
            this.serverGameTime.gameTime = (this.serverGameTime.gameTime + deltaSec * hoursPerRealSec) % 24.0;

            this.broadcastToAll({
                type: 'time_sync',
                gameTime: Number(this.serverGameTime.gameTime.toFixed(4)),
                cycleMinutes: this.serverGameTime.cycleMinutes,
                serverTime: now
            });
        }, 10000);
        this.timeSyncTimer.unref?.();

        // Milestone 4: Pomodoro State Machine 1Hz Tick Loop
        this.pomodoroTimer = setInterval(() => {
            this.updatePomodoroSession();
        }, 1000);
        this.pomodoroTimer.unref?.();

        // Listen for Server-Authoritative Level Ups and broadcast celebration
        xpService.onLevelUp((evt) => {
            roomManager.updateProfileInfo(evt.userId, { level: evt.newLevel, title: evt.title });
            this.broadcastToAll({
                type: 'level_up_event',
                userId: evt.userId,
                username: evt.username,
                newLevel: evt.newLevel,
                title: evt.title
            });
        });
    }

    handlePacket(ws, currentUserId, packet, authenticatedSession) {
        switch (packet.type) {
            case 'join': {
                if (currentUserId) return currentUserId;
                const customName = typeof packet.username === 'string' && packet.username.trim() 
                    ? packet.username.trim() 
                    : (typeof packet.customUser === 'string' && packet.customUser.trim() ? packet.customUser.trim() : null);
                const userId = (customName ? 'dev_' + customName.toLowerCase().replace(/[^a-z0-9_]/g, '') : null) 
                    || authenticatedSession?.userId 
                    || ('guest_' + Math.random().toString(36).slice(2, 8));
                const displayName = customName || authenticatedSession?.displayName || authenticatedSession?.username || ('Developer ' + userId.slice(-4));
                const profile = profileRepo.getOrCreate(userId, {
                    username: displayName,
                    displayName: displayName,
                    avatarUrl: authenticatedSession?.avatarUrl,
                    presetId: customName?.toLowerCase().includes('kaede') ? 'kemono_coder' : 'sakura_alice'
                });

                const initialPos = packet.position || null;
                const state = roomManager.addPlayer(userId, ws, profile, initialPos);

                // Send welcome sync packet to the joined player
                this.sendToClient(ws, {
                    type: 'welcome',
                    profile: {
                        id: profile.id,
                        username: profile.username,
                        displayName: profile.displayName,
                        level: profile.level,
                        totalXp: profile.totalXp,
                        currentLevelXp: profile.currentLevelXp,
                        nextLevelReq: xpService.getXpRequiredForNextLevel(profile.level),
                        title: profile.title,
                        teleCoins: typeof profile.teleCoins === 'number' ? profile.teleCoins : 120,
                        presetId: profile.presetId,
                        customColors: profile.customColors,
                        customModelUrl: profile.customModelUrl
                    },
                    chatHistory: chatService.getHistory(),
                    players: roomManager.getAllPlayerSnapshots(),
                    boomboxState: {
                        ...this.boomboxState,
                        serverTime: Date.now()
                    },
                    timeSync: {
                        gameTime: Number(this.serverGameTime.gameTime.toFixed(4)),
                        cycleMinutes: this.serverGameTime.cycleMinutes,
                        serverTime: Date.now()
                    },
                    pomodoroSession: {
                        state: this.pomodoroSession.state,
                        endsAt: this.pomodoroSession.endsAt,
                        remainingSec: this.pomodoroSession.state === 'IDLE' ? 0 : Math.max(0, Math.ceil((this.pomodoroSession.endsAt - Date.now()) / 1000)),
                        participants: Array.from(this.pomodoroSession.participants),
                        serverTime: Date.now()
                    },
                    pets: roomManager.getAllPetSnapshots()
                });

                // Notify all other players
                this.broadcastToAll({
                    type: 'player_join',
                    player: {
                        id: state.id,
                        username: state.username,
                        level: state.level,
                        title: state.title,
                        presetId: state.presetId,
                        customColors: state.customColors,
                        customModelUrl: state.customModelUrl,
                        position: state.position,
                        yaw: state.yaw,
                        anim: state.anim,
                        presenceState: state.presenceState
                    }
                }, userId);

                return userId;
            }

            case 'time_sync': {
                const clientSendTime = Number(packet.clientSendTime) || Date.now();
                this.sendToClient(ws, {
                    type: 'time_sync_ack',
                    clientSendTime,
                    serverReceiveTime: Date.now()
                });
                return currentUserId;
            }

            case 'move': {
                if (!currentUserId) return currentUserId;
                const { position, yaw, anim, holoTool, speedNorm, equippedItem, isDrinking, seatAnchorId, seatSlot, isFishing, fishingState, bobberPos } = packet;
                const finite = value => typeof value === 'number' && Number.isFinite(value);
                const safePosition = position && typeof position === 'object' ? {
                    x: finite(position.x) ? position.x : undefined,
                    y: finite(position.y) ? position.y : undefined,
                    z: finite(position.z) ? position.z : undefined
                } : {};
                const safeYaw = finite(yaw) ? Math.max(-Math.PI * 2, Math.min(Math.PI * 2, yaw)) : undefined;
                const allowedAnims = [
                    'idle', 'walk', 'run', 'sprint', 'jump', 'sit', 
                    'SitIdle', 'SitTyping', 'SitThinking', 'SitCoffee', 'SitLookingAtView', 'SitRelaxed', 'SitVibing',
                    'dance', 'vibe_dance', 'VibeDance', 'Dance', 'typing', 'fishing_cast', 'fishing_wait', 'fishing_catch', 
                    'wave', 'Wave', 'bow', 'Bow', 'cheer', 'Celebrate', 'Cheer', 'drink_use',
                    'meditate', 'Meditate', 'zen', 'Zen', 'stretch', 'Stretch', 'coffee', 'Coffee', 'vibing', 'Vibing', 'photo', 'PhotoPose'
                ];
                const safeAnim = typeof anim === 'string' && allowedAnims.includes(anim) ? anim : 'idle';
                const safeHoloTool = typeof holoTool === 'string' && ['NONE', 'TERM', 'CODEX', 'AGY', 'ADE'].includes(holoTool) ? holoTool : null;
                
                const extra = {
                    speedNorm: finite(speedNorm) ? speedNorm : 0,
                    equippedItem: typeof equippedItem === 'string' ? equippedItem : 'none',
                    isDrinking: Boolean(isDrinking),
                    seatAnchorId: typeof seatAnchorId === 'string' ? seatAnchorId : null,
                    seatSlot: typeof seatSlot === 'number' ? seatSlot : 0,
                    isFishing: Boolean(isFishing),
                    fishingState: typeof fishingState === 'string' ? fishingState : 'idle',
                    bobberPos: bobberPos && finite(bobberPos.x) && finite(bobberPos.y) && finite(bobberPos.z) ? {
                        x: Number(bobberPos.x.toFixed(3)),
                        y: Number(bobberPos.y.toFixed(3)),
                        z: Number(bobberPos.z.toFixed(3))
                    } : null
                };

                roomManager.updatePlayerMovement(currentUserId, safePosition, safeYaw, safeAnim, safeHoloTool, extra);
                return currentUserId;
            }

            case 'holo_state': {
                if (!currentUserId) return currentUserId;
                const { tool, lines } = packet;
                const safeTool = typeof tool === 'string' && ['NONE', 'TERM', 'CODEX', 'AGY', 'ADE'].includes(tool) ? tool : 'NONE';
                const safeLines = Array.isArray(lines) ? lines.slice(-8).map(l => String(l).slice(0, 80)) : [];
                roomManager.updateHoloState(currentUserId, safeTool, safeLines);
                this.broadcastToAll({
                    type: 'holo_update',
                    playerId: currentUserId,
                    tool: safeTool,
                    lines: safeLines
                }, currentUserId);
                return currentUserId;
            }

            case 'presence': {
                if (!currentUserId) return currentUserId;
                if (typeof packet.state === 'string' && ['coding', 'typing', 'building', 'testing', 'coffee', 'away'].includes(packet.state)) {
                    roomManager.updatePresence(currentUserId, packet.state);
                }
                return currentUserId;
            }

            case 'chat': {
                if (!currentUserId) return currentUserId;
                const profile = profileRepo.get(currentUserId);
                if (!profile) return currentUserId;

                const result = chatService.postMessage(profile, packet.text, 'global');
                if (result.success) {
                    this.broadcastToAll({
                        type: 'chat_message',
                        message: result.message
                    });
                } else {
                    this.sendToClient(ws, {
                        type: 'chat_error',
                        error: result.error,
                        retryAfterSec: result.retryAfterSec
                    });
                }
                return currentUserId;
            }

            case 'whisper': {
                if (!currentUserId) return currentUserId;
                const profile = profileRepo.get(currentUserId);
                if (!profile) return currentUserId;

                const targetPlayer = roomManager.findPlayer(packet.recipientId || packet.recipientName);
                if (!targetPlayer) {
                    this.sendToClient(ws, {
                        type: 'chat_error',
                        error: 'recipient_not_found',
                        target: packet.recipientName || packet.recipientId,
                        message: `Player "${packet.recipientName || packet.recipientId}" is not online.`
                    });
                    return currentUserId;
                }

                const recipientName = targetPlayer.displayName || targetPlayer.username;
                const result = chatService.postMessage(profile, packet.text, 'whisper', targetPlayer.id, recipientName);
                if (result.success) {
                    // Send to recipient if not sending to self
                    if (targetPlayer.ws && targetPlayer.ws.readyState === WebSocket.OPEN && targetPlayer.id !== currentUserId) {
                        this.sendToClient(targetPlayer.ws, {
                            type: 'chat_whisper',
                            message: result.message
                        });
                    }
                    // Echo back to sender
                    this.sendToClient(ws, {
                        type: 'chat_whisper',
                        message: result.message
                    });
                } else {
                    this.sendToClient(ws, {
                        type: 'chat_error',
                        error: result.error,
                        retryAfterSec: result.retryAfterSec
                    });
                }
                return currentUserId;
            }

            case 'avatar_update': {
                if (!currentUserId) return currentUserId;
                const profile = profileRepo.get(currentUserId);
                if (profile) {
                    if (typeof packet.presetId === 'string' && /^[a-z0-9_-]{1,64}$/i.test(packet.presetId)) profile.presetId = packet.presetId;
                    if (packet.customColors && typeof packet.customColors === 'object' && !Array.isArray(packet.customColors)) {
                        const colorKeys = ['hair', 'eyes', 'outfit', 'aura'];
                        const colors = Object.fromEntries(colorKeys
                            .filter(key => typeof packet.customColors[key] === 'string' && /^#[0-9a-f]{6}$/i.test(packet.customColors[key]))
                            .map(key => [key, packet.customColors[key]]));
                        if (Object.keys(colors).length) profile.customColors = { ...profile.customColors, ...colors };
                    }
                    // Model URLs are set only by the authenticated, validated upload endpoint.
                    if (packet.customModelUrl !== undefined && packet.customModelUrl === profile.customModelUrl) {
                        profile.customModelUrl = packet.customModelUrl;
                    }
                    profileRepo.save(profile);

                    roomManager.updateProfileInfo(currentUserId, {
                        presetId: profile.presetId,
                        customColors: profile.customColors,
                        customModelUrl: profile.customModelUrl
                    });

                    this.broadcastToAll({
                        type: 'avatar_changed',
                        userId: currentUserId,
                        presetId: profile.presetId,
                        customColors: profile.customColors,
                        customModelUrl: profile.customModelUrl
                    });
                }
                return currentUserId;
            }

            case 'umbrella_sync': {
                if (!currentUserId) return currentUserId;
                const isOpen = Boolean(packet.isOpen);
                roomManager.updatePlayerCustom(currentUserId, { isUmbrellaOpen: isOpen });
                this.broadcastToAll({
                    type: 'umbrella_update',
                    playerId: currentUserId,
                    isOpen: isOpen
                }, currentUserId);
                return currentUserId;
            }

            case 'fish_cast': {
                if (!currentUserId) return currentUserId;
                const bobberPos = packet.bobberPos;
                roomManager.updatePlayerCustom(currentUserId, {
                    isFishing: true,
                    fishingState: 'waiting',
                    bobberPos: bobberPos || null
                });
                this.broadcastToAll({
                    type: 'fish_cast_update',
                    playerId: currentUserId,
                    bobberPos: bobberPos
                }, currentUserId);
                return currentUserId;
            }

            case 'fish_bite': {
                if (!currentUserId) return currentUserId;
                this.broadcastToAll({
                    type: 'fish_bite_update',
                    playerId: currentUserId,
                    bobberPos: packet.bobberPos
                }, currentUserId);
                return currentUserId;
            }

            case 'fish_catch': {
                if (!currentUserId) return currentUserId;
                const { fishId, fishName, weight, rarity } = packet;
                roomManager.updatePlayerCustom(currentUserId, {
                    isFishing: false,
                    fishingState: 'idle',
                    bobberPos: null
                });
                // Broadcast 3D celebration visual effect to nearby players
                this.broadcastToAll({
                    type: 'fish_catch_update',
                    playerId: currentUserId,
                    fishId: String(fishId).slice(0, 48),
                    fishName: String(fishName).slice(0, 48),
                    weight: Number(weight) || 1.0,
                    rarity: String(rarity).slice(0, 24)
                });

                // Post announcement to world MMO chat if rare or above
                const profile = profileRepo.get(currentUserId);
                if (profile && ['rare', 'epic', 'legendary', 'mythical'].includes(String(rarity).toLowerCase())) {
                    const rarityBadge = String(rarity).toUpperCase();
                    const announcement = `🎣 [${profile.displayName || profile.username}] caught a ${rarityBadge} ${fishName} (${Number(weight).toFixed(1)}kg)!`;
                    const res = chatService.postMessage({ id: 'system', username: 'System', displayName: 'Zen Fishing', level: 99, title: 'Master Angler' }, announcement, 'global');
                    if (res.success) {
                        this.broadcastToAll({
                            type: 'chat_message',
                            message: res.message
                        });
                    }
                }
                return currentUserId;
            }

            case 'clink_drinks_req': {
                if (!currentUserId) return currentUserId;
                const targetPlayerId = packet.targetUserId;
                const sender = roomManager.players.get(currentUserId);
                const target = roomManager.players.get(targetPlayerId);

                if (sender && target && target.ws && target.ws.readyState === WebSocket.OPEN) {
                    const executionTimestamp = Date.now() + 150; // Sync 150ms in future
                    const payload = {
                        type: 'clink_drinks_event',
                        player1Id: currentUserId,
                        player2Id: targetPlayerId,
                        executionTimestamp
                    };
                    this.sendToClient(sender.ws, payload);
                    this.sendToClient(target.ws, payload);
                }
                return currentUserId;
            }

            case 'vibe_dance_sync': {
                if (!currentUserId) return currentUserId;
                const isDancing = Boolean(packet.isDancing);
                roomManager.updatePlayerCustom(currentUserId, { isDancing: isDancing });
                const serverStartTime = Date.now();
                this.broadcastToAll({
                    type: 'vibe_dance_update',
                    playerId: currentUserId,
                    isDancing: isDancing,
                    serverStartTime: serverStartTime
                }, currentUserId);
                return currentUserId;
            }

            case 'photo_share': {
                if (!currentUserId) return currentUserId;
                // Security limit: max 120KB payload
                const photoDataUrl = typeof packet.photoDataUrl === 'string' && packet.photoDataUrl.length < 120 * 1024 ? packet.photoDataUrl : null;
                const caption = typeof packet.caption === 'string' ? packet.caption.slice(0, 100) : 'TeleTerm 3D Snapshot';
                if (photoDataUrl) {
                    this.broadcastToAll({
                        type: 'photo_billboard_update',
                        senderId: currentUserId,
                        photoDataUrl: photoDataUrl,
                        caption: caption,
                        timestamp: Date.now()
                    });
                }
                return currentUserId;
            }

            case 'voice_signal': {
                if (!currentUserId) return currentUserId;
                const { targetId, signal } = packet;
                if (!targetId || !signal) return currentUserId;
                const targetPlayer = roomManager.players.get(targetId);
                if (targetPlayer && targetPlayer.ws && targetPlayer.ws.readyState === WebSocket.OPEN) {
                    this.sendToClient(targetPlayer.ws, {
                        type: 'voice_signal',
                        senderId: currentUserId,
                        signal: signal
                    });
                }
                return currentUserId;
            }

            case 'voice_state': {
                if (!currentUserId) return currentUserId;
                const muted = Boolean(packet.muted);
                const speaking = Boolean(packet.speaking);
                roomManager.updatePlayerCustom(currentUserId, { voiceMuted: muted, voiceSpeaking: speaking });
                this.broadcastToAll({
                    type: 'voice_state_update',
                    playerId: currentUserId,
                    muted: muted,
                    speaking: speaking
                }, currentUserId);
                return currentUserId;
            }

            case 'cook_start': {
                if (!currentUserId) return currentUserId;
                const profile = profileRepo.get(currentUserId);
                if (!profile) return currentUserId;
                const slotIndex = Number(packet.slotIndex);
                const inv = profile.inventory || [];
                const item = inv[slotIndex];
                if (!item || (!item.id.includes('fish') && !item.id.includes('koi') && !item.id.includes('salmon') && !item.id.includes('bass') && !item.id.includes('eel') && !item.id.includes('crab') && !item.id.includes('fry') && !item.id.includes('ayu') && !item.id.includes('trout'))) {
                    this.sendToClient(ws, {
                        type: 'cook_start_err',
                        error: 'no_raw_fish',
                        message: 'You must select a raw fish to roast over the fire!'
                    });
                    return currentUserId;
                }

                const startTime = Date.now();
                this.activeCookings.set(currentUserId, {
                    startTime,
                    fishId: item.id,
                    fishName: item.name || item.id,
                    slotIndex
                });

                this.sendToClient(ws, {
                    type: 'cook_start_ack',
                    startTime,
                    fishId: item.id,
                    slotIndex,
                    targetMinSec: 4.0,
                    targetMaxSec: 12.0
                });

                // Broadcast campfire sizzle VFX
                this.broadcastToAll({
                    type: 'campfire_sizzle_update',
                    playerId: currentUserId,
                    isCooking: true
                }, currentUserId);

                return currentUserId;
            }

            case 'cook_finish': {
                if (!currentUserId) return currentUserId;
                const session = this.activeCookings.get(currentUserId);
                if (!session) {
                    this.sendToClient(ws, {
                        type: 'cook_finish_err',
                        error: 'no_active_cooking',
                        message: 'No active roasting session found.'
                    });
                    return currentUserId;
                }

                this.activeCookings.delete(currentUserId);
                const now = Date.now();
                const elapsedSec = Math.max(0, (now - session.startTime) / 1000);
                const profile = profileRepo.get(currentUserId);
                if (!profile) return currentUserId;

                if (!Array.isArray(profile.inventory)) {
                    profile.inventory = Array(36).fill(null);
                }

                let outcome = 'RAW';
                let awardedXp = 0;
                let resultItem = null;

                if (elapsedSec < 4.0) {
                    outcome = 'RAW';
                    resultItem = profile.inventory[session.slotIndex] || null;
                } else if (elapsedSec <= 12.0) {
                    outcome = 'PERFECT_ROAST';
                    resultItem = {
                        id: 'item_grilled_fish',
                        name: 'Campfire Skewered Fish',
                        vi: 'Cá Nướng Xiên Lửa Trại',
                        icon: 'flame',
                        type: 'consumable',
                        holdable: true,
                        handPose: 'small_can',
                        gripProfile: 'small_can',
                        useAnimation: 'DrinkCan',
                        useSound: 'drink_soft',
                        model: 'grilled_fish',
                        desc: 'Crispy roasted fish over the embers on a bamboo skewer. Restores 35 Energy.'
                    };
                    profile.inventory[session.slotIndex] = resultItem;
                    awardedXp = 35;
                    xpService.awardXp(profile, 35, 'Campfire Roasting');
                } else {
                    outcome = 'BURNT';
                    resultItem = {
                        id: 'item_burnt_fish',
                        name: 'Burnt Fish',
                        vi: 'Cá Cháy Khét',
                        icon: 'flame',
                        type: 'consumable',
                        holdable: true,
                        handPose: 'small_can',
                        gripProfile: 'small_can',
                        useAnimation: 'DrinkCan',
                        useSound: 'drink_soft',
                        model: 'burnt_fish',
                        desc: 'Completely charred over the fire. Slightly bitter.'
                    };
                    profile.inventory[session.slotIndex] = resultItem;
                    awardedXp = 5;
                    xpService.awardXp(profile, 5, 'Overcooked Fish');
                }

                profileRepo.save(profile);

                this.sendToClient(ws, {
                    type: 'cook_finish_ack',
                    outcome,
                    elapsedSec: Number(elapsedSec.toFixed(2)),
                    item: resultItem,
                    slotIndex: session.slotIndex,
                    awardedXp,
                    teleCoins: typeof profile.teleCoins === 'number' ? profile.teleCoins : 120,
                    inventory: profile.inventory
                });

                this.broadcastToAll({
                    type: 'campfire_sizzle_update',
                    playerId: currentUserId,
                    isCooking: false,
                    outcome
                }, currentUserId);

                return currentUserId;
            }

            case 'trade_buy': {
                if (!currentUserId) return currentUserId;
                if (this.activeTradeLocks.has(currentUserId)) return currentUserId;
                this.activeTradeLocks.add(currentUserId);

                try {
                    const profile = profileRepo.get(currentUserId);
                    if (!profile) return currentUserId;

                    const catalogItem = SHOP_CATALOG[packet.itemId];
                    if (!catalogItem) {
                        this.sendToClient(ws, { type: 'trade_buy_ack', success: false, error: 'item_not_found' });
                        return currentUserId;
                    }

                    if (typeof profile.teleCoins !== 'number') profile.teleCoins = 120;
                    if (profile.teleCoins < catalogItem.price) {
                        this.sendToClient(ws, { type: 'trade_buy_ack', success: false, error: 'insufficient_coins', teleCoins: profile.teleCoins });
                        return currentUserId;
                    }

                    if (!Array.isArray(profile.inventory)) profile.inventory = Array(36).fill(null);
                    while (profile.inventory.length < 36) profile.inventory.push(null);

                    const emptyIdx = profile.inventory.findIndex(s => s === null);
                    if (emptyIdx === -1) {
                        this.sendToClient(ws, { type: 'trade_buy_ack', success: false, error: 'inventory_full' });
                        return currentUserId;
                    }

                    profile.teleCoins -= catalogItem.price;
                    const newItem = { ...catalogItem, slotIndex: emptyIdx };
                    profile.inventory[emptyIdx] = newItem;
                    profileRepo.save(profile);

                    this.sendToClient(ws, {
                        type: 'trade_buy_ack',
                        success: true,
                        item: newItem,
                        slotIndex: emptyIdx,
                        teleCoins: profile.teleCoins,
                        inventory: profile.inventory
                    });
                } finally {
                    this.activeTradeLocks.delete(currentUserId);
                }
                return currentUserId;
            }

            case 'trade_sell': {
                if (!currentUserId) return currentUserId;
                if (this.activeTradeLocks.has(currentUserId)) return currentUserId;
                this.activeTradeLocks.add(currentUserId);

                try {
                    const profile = profileRepo.get(currentUserId);
                    if (!profile) return currentUserId;

                    const slotIndex = Number(packet.slotIndex);
                    if (!Array.isArray(profile.inventory) || slotIndex < 0 || slotIndex >= profile.inventory.length) {
                        this.sendToClient(ws, { type: 'trade_sell_ack', success: false, error: 'invalid_slot' });
                        return currentUserId;
                    }

                    const targetItem = profile.inventory[slotIndex];
                    if (!targetItem) {
                        this.sendToClient(ws, { type: 'trade_sell_ack', success: false, error: 'slot_empty' });
                        return currentUserId;
                    }

                    const sellPrice = FISH_SELL_PRICES[targetItem.id] || targetItem.value || 25;
                    if (typeof profile.teleCoins !== 'number') profile.teleCoins = 120;
                    profile.teleCoins += sellPrice;
                    profile.inventory[slotIndex] = null;

                    if (profile.equippedItem && profile.equippedItem.id === targetItem.id) {
                        profile.equippedItem = null;
                    }

                    profileRepo.save(profile);

                    this.sendToClient(ws, {
                        type: 'trade_sell_ack',
                        success: true,
                        soldItem: targetItem,
                        slotIndex,
                        earnedCoins: sellPrice,
                        teleCoins: profile.teleCoins,
                        inventory: profile.inventory
                    });
                } finally {
                    this.activeTradeLocks.delete(currentUserId);
                }
                return currentUserId;
            }

            case 'emote_trigger': {
                if (!currentUserId) return currentUserId;
                const now = Date.now();
                const lastEmote = this.playerEmoteCooldowns.get(currentUserId) || 0;
                if (now - lastEmote < 1500) {
                    this.sendToClient(ws, {
                        type: 'emote_rejected',
                        reason: 'cooldown_active',
                        retryAfterMs: 1500 - (now - lastEmote)
                    });
                    return currentUserId;
                }

                this.playerEmoteCooldowns.set(currentUserId, now);
                const emoteId = String(packet.emoteId || 'wave').slice(0, 32);

                this.broadcastToAll({
                    type: 'emote_broadcast',
                    playerId: currentUserId,
                    emoteId: emoteId,
                    timestamp: now
                });
                return currentUserId;
            }

            case 'boombox_sync_req': {
                if (!currentUserId) return currentUserId;
                this.sendToClient(ws, {
                    type: 'boombox_state',
                    ...this.boomboxState,
                    serverTime: Date.now()
                });
                return currentUserId;
            }

            case 'boombox_interact': {
                if (!currentUserId) return currentUserId;
                const { action, position } = packet;

                if (action === 'play') {
                    this.boomboxState.isPlaying = true;
                    this.boomboxState.trackStartTimestamp = Date.now();
                    this.boomboxState.pauseOffsetMs = 0;
                } else if (action === 'pause') {
                    this.boomboxState.isPlaying = false;
                    this.boomboxState.pauseOffsetMs = Date.now() - this.boomboxState.trackStartTimestamp;
                } else if (action === 'next_track') {
                    const tracks = [
                        { id: 'midnight_sakura', title: 'Midnight Sakura Lo-Fi' },
                        { id: 'autumn_river', title: 'Autumn River Chillhop' },
                        { id: 'cyber_glade', title: 'Cyber Glade Synth Vibe' }
                    ];
                    const curIdx = tracks.findIndex(t => t.id === this.boomboxState.currentTrackId);
                    const nextTrack = tracks[(curIdx + 1) % tracks.length];
                    this.boomboxState.currentTrackId = nextTrack.id;
                    this.boomboxState.currentTrackTitle = nextTrack.title;
                    this.boomboxState.trackStartTimestamp = Date.now();
                    this.boomboxState.pauseOffsetMs = 0;
                    this.boomboxState.isPlaying = true;
                } else if (action === 'deploy' && position) {
                    this.boomboxState.position = {
                        x: Number(position.x) || 15.1,
                        y: Number(position.y) || 0.8,
                        z: Number(position.z) || 16.2
                    };
                }

                this.broadcastToAll({
                    type: 'boombox_state_update',
                    ...this.boomboxState,
                    serverTime: Date.now(),
                    triggeredBy: currentUserId
                });
                return currentUserId;
            }

            case 'time_sync_req': {
                if (!currentUserId) return currentUserId;
                this.sendToClient(ws, {
                    type: 'time_sync',
                    gameTime: Number(this.serverGameTime.gameTime.toFixed(4)),
                    cycleMinutes: this.serverGameTime.cycleMinutes,
                    serverTime: Date.now()
                });
                return currentUserId;
            }

            case 'time_set_req': {
                if (!currentUserId) return currentUserId;
                if (typeof packet.gameTime === 'number') {
                    this.serverGameTime.gameTime = Math.max(0, Math.min(24, packet.gameTime));
                    this.serverGameTime.lastTick = Date.now();
                    this.broadcastToAll({
                        type: 'time_sync',
                        gameTime: Number(this.serverGameTime.gameTime.toFixed(4)),
                        cycleMinutes: this.serverGameTime.cycleMinutes,
                        serverTime: Date.now()
                    });
                }
                return currentUserId;
            }

            case 'pomodoro_sync_req': {
                if (!currentUserId) return currentUserId;
                const remainingSec = Math.max(0, Math.ceil((this.pomodoroSession.endsAt - Date.now()) / 1000));
                this.sendToClient(ws, {
                    type: 'pomodoro_sync',
                    state: this.pomodoroSession.state,
                    endsAt: this.pomodoroSession.endsAt,
                    startedAt: this.pomodoroSession.startedAt,
                    durationSec: this.pomodoroSession.durationSec,
                    remainingSec: this.pomodoroSession.state === 'IDLE' ? 0 : remainingSec,
                    participants: Array.from(this.pomodoroSession.participants),
                    center: this.pomodoroSession.center,
                    radius: this.pomodoroSession.radius,
                    serverTime: Date.now()
                });
                return currentUserId;
            }

            case 'pomodoro_start': {
                if (!currentUserId) return currentUserId;
                const player = roomManager.getPlayer(currentUserId);
                if (packet.position && player) {
                    player.position = {
                        x: Number(packet.position.x) || player.position.x,
                        y: Number(packet.position.y) || player.position.y,
                        z: Number(packet.position.z) || player.position.z
                    };
                }
                const duration = typeof packet.durationSec === 'number' && packet.durationSec > 0 ? packet.durationSec : 1500;
                this.pomodoroSession.state = 'FOCUS_ACTIVE';
                this.pomodoroSession.durationSec = duration;
                this.pomodoroSession.startedAt = Date.now();
                this.pomodoroSession.endsAt = Date.now() + duration * 1000;
                this.pomodoroSession.participants.add(currentUserId);
                this.broadcastPomodoroSync();
                return currentUserId;
            }

            case 'pomodoro_join': {
                if (!currentUserId) return currentUserId;
                const player = roomManager.getPlayer(currentUserId);
                if (packet.position && player) {
                    player.position = {
                        x: Number(packet.position.x) || player.position.x,
                        y: Number(packet.position.y) || player.position.y,
                        z: Number(packet.position.z) || player.position.z
                    };
                }
                this.pomodoroSession.participants.add(currentUserId);
                this.broadcastPomodoroSync();
                return currentUserId;
            }

            case 'pomodoro_leave': {
                if (!currentUserId) return currentUserId;
                this.pomodoroSession.participants.delete(currentUserId);
                this.broadcastPomodoroSync();
                return currentUserId;
            }

            case 'pet_sync': {
                if (!currentUserId) return currentUserId;
                const petState = roomManager.updatePlayerPet(currentUserId, packet);
                if (petState) {
                    this.broadcastToAll({
                        type: 'pet_sync_broadcast',
                        ownerId: currentUserId,
                        ...petState
                    }, currentUserId);
                }
                return currentUserId;
            }

            case 'pet_interact': {
                if (!currentUserId) return currentUserId;
                const { action, petId, position } = packet;
                const profile = profileRepo.get(currentUserId);
                let feedOutcome = null;

                if (action === 'feed' && profile) {
                    if (Array.isArray(profile.inventory)) {
                        const foodIdx = profile.inventory.findIndex(item => item && (item.id === 'item_grilled_fish' || item.type === 'consumable'));
                        if (foodIdx !== -1) {
                            const consumedItem = profile.inventory[foodIdx];
                            profile.inventory[foodIdx] = null;
                            if (profile.equippedItem && profile.equippedItem.id === consumedItem.id) {
                                profile.equippedItem = null;
                            }
                            profileRepo.save(profile);
                            xpService.awardXp(profile, 20, 'Fed Pet Companion');
                            feedOutcome = {
                                success: true,
                                consumedItemName: consumedItem.name || 'Grilled Fish',
                                awardedXp: 20
                            };
                            this.sendToClient(ws, {
                                type: 'pet_feed_ack',
                                success: true,
                                slotIndex: foodIdx,
                                inventory: profile.inventory,
                                message: `Fed your pet ${consumedItem.name || 'Grilled Fish'}! (+20 XP, +20 Happiness, +30 Stamina)`
                            });
                        } else {
                            this.sendToClient(ws, {
                                type: 'pet_feed_ack',
                                success: false,
                                error: 'no_food',
                                message: 'No fish or food in inventory to feed pet!'
                            });
                        }
                    }
                }

                // Broadcast pet interaction to all players so hearts float for everyone
                this.broadcastToAll({
                    type: 'pet_interact_broadcast',
                    ownerId: currentUserId,
                    petId: petId || 'pet_' + currentUserId.slice(0, 8),
                    action: action || 'pet',
                    position: position || (roomManager.getPlayer(currentUserId)?.position || { x: 0, y: 0, z: 0 }),
                    feedOutcome,
                    serverTime: Date.now()
                });
                return currentUserId;
            }

            default:
                return currentUserId;
        }
    }

    broadcastWorldSnapshots() {
        for (const [userId, player] of roomManager.players.entries()) {
            if (player.ws.readyState !== WebSocket.OPEN) continue;

            const nearby = roomManager.getNearbyPlayers(userId);
            this.sendToClient(player.ws, {
                type: 'world_snapshot',
                timestamp: Date.now(),
                players: nearby
            });
        }
    }

    broadcastToAll(data, excludeUserId = null) {
        const payload = JSON.stringify(data);
        for (const [userId, player] of roomManager.players.entries()) {
            if (excludeUserId && userId === excludeUserId) continue;
            if (player.ws.readyState === WebSocket.OPEN) {
                try {
                    this.telemetry.packetsOut += 1;
                    this.telemetry.bytesOut += payload.length;
                    player.ws.send(payload);
                } catch (e) {}
            }
        }
    }

    updatePomodoroSession() {
        if (!this.pomodoroSession || this.pomodoroSession.state === 'IDLE') return;

        const now = Date.now();
        if (this.pomodoroSession.state === 'FOCUS_ACTIVE') {
            // Check early departure: if a participant leaves the cylinder (r > 15m), remove them
            for (const userId of Array.from(this.pomodoroSession.participants)) {
                const player = roomManager.getPlayer(userId);
                if (player && player.position) {
                    const dx = player.position.x - this.pomodoroSession.center.x;
                    const dz = player.position.z - this.pomodoroSession.center.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist > this.pomodoroSession.radius + 3.0) { // Buffer tolerance
                        this.pomodoroSession.participants.delete(userId);
                        this.broadcastPomodoroSync();
                    }
                }
            }

            if (now >= this.pomodoroSession.endsAt) {
                // FOCUS_ACTIVE COMPLETED! Transition to BREAK_ACTIVE
                this.pomodoroSession.state = 'BREAK_ACTIVE';
                this.pomodoroSession.startedAt = now;
                this.pomodoroSession.endsAt = now + this.pomodoroSession.breakDurationSec * 1000;

                // Grant +25% XP multiplier buff to all qualifying participants
                const buffExpiry = now + (30 * 60 * 1000); // 30 mins
                for (const userId of this.pomodoroSession.participants) {
                    const buff = {
                        buffId: 'zen_focus_25',
                        multiplier: 1.25,
                        name: 'Zen Mind Focus (+25% XP)',
                        expiresAt: buffExpiry
                    };
                    xpService.addBuff(userId, buff);

                    const clientWs = roomManager.getWs(userId) || roomManager.getPlayer(userId)?.ws;
                    if (clientWs && clientWs.readyState === WebSocket.OPEN) {
                        this.sendToClient(clientWs, {
                            type: 'pomodoro_buff_awarded',
                            buff,
                            message: '🧘 Completed 25m Pomodoro Focus! Gained Zen Mind Buff (+25% XP for 30 mins)'
                        });
                    }
                }

                this.broadcastPomodoroSync();
            }
        } else if (this.pomodoroSession.state === 'BREAK_ACTIVE') {
            if (now >= this.pomodoroSession.endsAt) {
                // Break ended -> IDLE
                this.pomodoroSession.state = 'IDLE';
                this.pomodoroSession.participants.clear();
                this.broadcastPomodoroSync();
            }
        }
    }

    broadcastPomodoroSync() {
        const remainingSec = Math.max(0, Math.ceil((this.pomodoroSession.endsAt - Date.now()) / 1000));
        this.broadcastToAll({
            type: 'pomodoro_sync',
            state: this.pomodoroSession.state,
            endsAt: this.pomodoroSession.endsAt,
            startedAt: this.pomodoroSession.startedAt,
            durationSec: this.pomodoroSession.durationSec,
            remainingSec: this.pomodoroSession.state === 'IDLE' ? 0 : remainingSec,
            participants: Array.from(this.pomodoroSession.participants),
            center: this.pomodoroSession.center,
            radius: this.pomodoroSession.radius,
            serverTime: Date.now()
        });
    }

    removePlayer(userId) {
        const player = roomManager.removePlayer(userId);
        if (player) {
            this.broadcastToAll({ type: 'player_leave', id: userId, username: player.username });
            this.broadcastToAll({ type: 'pet_despawn', ownerId: userId });
        }
        return player;
    }

    sendToClient(ws, data) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            try {
                const str = JSON.stringify(data);
                this.telemetry.packetsOut += 1;
                this.telemetry.bytesOut += str.length;
                ws.send(str);
            } catch (e) {}
        }
    }

    getTelemetry() {
        const uptimeSec = Math.max(1, (Date.now() - this.telemetry.startedAt) / 1000);
        return {
            ...this.telemetry,
            activePlayers: roomManager.players.size,
            claimedSeats: roomManager.seatLocks.size,
            uptimeSec: Number(uptimeSec.toFixed(1)),
            avgPktInPerSec: Number((this.telemetry.packetsIn / uptimeSec).toFixed(2)),
            avgPktOutPerSec: Number((this.telemetry.packetsOut / uptimeSec).toFixed(2)),
            avgKBSentPerSec: Number((this.telemetry.bytesOut / 1024 / uptimeSec).toFixed(2))
        };
    }

    handleUpgrade(request, socket, head) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss.emit('connection', ws, request);
        });
    }
}

const gateway = new RealtimeGateway();
gateway.SHOP_CATALOG = SHOP_CATALOG;
gateway.FISH_SELL_PRICES = FISH_SELL_PRICES;
module.exports = gateway;
