import * as THREE from '/vendor/three/build/three.module.js';

/**
 * ZEN FISHING SYSTEM (MINIGAME CÂU CÁ THƯ GIÃN)
 * TeleTerm 3D — Social Break-time & Cozy Vibes (Sprint 2.2)
 * 
 * Features:
 * - Fishing across all 4 water biomes: Onsen Retreat, Zen Koi Pond, River Valley, and South Ocean Pier
 * - Zero-GC Catenary Fishing Line rendering using THREE.Line with dynamic Float32Array buffer
 * - Dual Mode: Active Mode (Click during 1.8s bite window for +30% high rarity) vs AFK Mode (Auto-reels for coders gõ lệnh / nghe lofi)
 * - 12 Dev-themed fish species across Common, Rare, Epic, Legendary, and Mythical tiers
 * - Water ripples & splash particles on bite and reel
 * - Fish Dex integration with catch log, record weight, and Dev Coin payouts
 */

export const FISH_SPECIES = [
    {
        id: 'nullpointer_koi',
        name: 'NullPointer Koi',
        vi: 'Cá Koi NullPointer',
        tier: 'common',
        tierVi: 'Thường',
        minWeight: 0.8,
        maxWeight: 2.6,
        value: 15,
        icon: 'fish',
        color: '#94a3b8',
        preferredBiome: 'zen_pond',
        desc: 'Appears unexpectedly the exact moment you forget to check for null.',
        descVi: 'Xuất hiện bất thình lình vào đúng khoảnh khắc bạn quên kiểm tra giá trị null.'
    },
    {
        id: 'async_salmon',
        name: 'Async Salmon',
        vi: 'Cá Hồi Bất Đồng Bộ',
        tier: 'common',
        tierVi: 'Thường',
        minWeight: 1.2,
        maxWeight: 3.8,
        value: 20,
        icon: 'fish',
        color: '#38bdf8',
        preferredBiome: 'onsen',
        desc: 'Always swims upstream against the current and resolves with a Promise.',
        descVi: 'Luôn bơi ngược dòng chảy và đảm bảo trả về một Promise thành công.'
    },
    {
        id: 'memory_leak_eel',
        name: 'Memory Leak Eel',
        vi: 'Lươn Rò Rỉ Bộ Nhớ',
        tier: 'rare',
        tierVi: 'Hiếm',
        minWeight: 1.5,
        maxWeight: 4.8,
        value: 45,
        icon: 'fish',
        color: '#a855f7',
        preferredBiome: 'onsen',
        desc: 'Extremely slippery. The longer you hold it, the more your RAM usage rises.',
        descVi: 'Cực kỳ trơn tuột. Bạn càng giữ nó trên tay lâu thì lượng RAM tiêu thụ càng tăng cao.'
    },
    {
        id: 'deadlock_crab',
        name: 'Deadlock Crab',
        vi: 'Cua Khóa Chết',
        tier: 'rare',
        tierVi: 'Hiếm',
        minWeight: 0.6,
        maxWeight: 1.9,
        value: 40,
        icon: 'fish',
        color: '#f97316',
        preferredBiome: 'river',
        desc: 'Clutches two mutex resources in its claws and stubbornly refuses to release either.',
        descVi: 'Hai càng kẹp chặt hai tài nguyên mutex và kiên quyết không chịu nhả tài nguyên nào ra.'
    },
    {
        id: 'stackoverflow_bass',
        name: 'Stack Overflow Bass',
        vi: 'Cá Vược Tràn Ngăn Xếp',
        tier: 'rare',
        tierVi: 'Hiếm',
        minWeight: 2.0,
        maxWeight: 5.6,
        value: 50,
        icon: 'fish',
        color: '#eab308',
        preferredBiome: 'zen_pond',
        desc: 'Voracious eater with infinite recursive appetite that exceeds maximum call stack size.',
        descVi: 'Tham ăn vô độ với các đợt đệ quy vô tận vượt quá kích thước call stack tối đa.'
    },
    {
        id: 'docker_whale_fry',
        name: 'Docker Whale Fry',
        vi: 'Cá Voi Con Docker',
        tier: 'epic',
        tierVi: 'Sử Thi',
        minWeight: 4.2,
        maxWeight: 12.5,
        value: 120,
        icon: 'fish',
        color: '#06b6d4',
        preferredBiome: 'south_pier',
        desc: 'A gentle juvenile whale calmly carrying isolated container cargo on its dorsal fin.',
        descVi: 'Một chú cá voi con hiền hòa mang theo các container ứng dụng biệt lập trên vây lưng.'
    },
    {
        id: 'regex_pufferfish',
        name: 'Regex Pufferfish',
        vi: 'Cá Nóc Biểu Thức Chính Quy',
        tier: 'epic',
        tierVi: 'Sử Thi',
        minWeight: 1.0,
        maxWeight: 3.4,
        value: 110,
        icon: 'fish',
        color: '#ec4899',
        preferredBiome: 'river',
        desc: 'Puffs into razor-sharp spines whenever someone attempts to parse HTML using Regex.',
        descVi: 'Phồng to đầy gai nhọn hoắt mỗi khi có ai đó cả gan dùng Regex để parse HTML.'
    },
    {
        id: 'git_kraken_mini',
        name: 'Git Kraken Mini',
        vi: 'Bạch Tuộc Nhánh Git',
        tier: 'epic',
        tierVi: 'Sử Thi',
        minWeight: 3.5,
        maxWeight: 9.8,
        value: 140,
        icon: 'fish',
        color: '#8b5cf6',
        preferredBiome: 'south_pier',
        desc: '8 tentacles tangled in perpetual merge conflicts and detached HEAD states.',
        descVi: '8 xúc tua rối rắm đại diện cho 8 nhánh git merge conflict và trạng thái detached HEAD.'
    },
    {
        id: 'kernel_catfish',
        name: 'Kernel Catfish',
        vi: 'Cá Trê Nhân Hệ Điều Hành',
        tier: 'legendary',
        tierVi: 'Huyền Thoại',
        minWeight: 8.5,
        maxWeight: 25.0,
        value: 300,
        icon: 'fish',
        color: '#ef4444',
        preferredBiome: 'river',
        desc: 'Lurks exclusively at Ring-0 privilege level in the deep midnight abyss.',
        descVi: 'Chỉ bơi lặn ở tầng đặc quyền Ring-0 sâu thẳm lúc nửa đêm tĩnh mịch.'
    },
    {
        id: 'zero_day_sturgeon',
        name: 'Zero-Day Sturgeon',
        vi: 'Cá Tầm Lỗ Hổng Zero-Day',
        tier: 'legendary',
        tierVi: 'Huyền Thoại',
        minWeight: 12.0,
        maxWeight: 36.0,
        value: 450,
        icon: 'fish',
        color: '#10b981',
        preferredBiome: 'south_pier',
        desc: 'Ancient unpatched specimen that slips undetected through all security firewalls.',
        descVi: 'Loài cá cổ xưa chưa có bản vá, bơi lọt qua mọi tường lửa an ninh bảo mật.'
    },
    {
        id: 'quantum_qubit_trout',
        name: 'Quantum Qubit Trout',
        vi: 'Cá Hồi Lượng Tử Qubit',
        tier: 'legendary',
        tierVi: 'Huyền Thoại',
        minWeight: 2.2,
        maxWeight: 7.5,
        value: 500,
        icon: 'fish',
        color: '#6366f1',
        preferredBiome: 'zen_pond',
        desc: 'Exists in a superposition of both biting and not biting until observed by the angler.',
        descVi: 'Tồn tại ở trạng thái chồng chập vừa cắn câu vừa không cắn câu cho đến khi có người quan sát.'
    },
    {
        id: 'argon_dragonfish',
        name: 'Argon Dragonfish',
        vi: 'Thần Long Ngư Argon',
        tier: 'mythical',
        tierVi: 'Thần Thoại',
        minWeight: 28.0,
        maxWeight: 72.0,
        value: 1200,
        icon: 'sparkles',
        color: '#00f0ff',
        preferredBiome: 'south_pier',
        desc: 'Radiant mythical dragon of glowing terracotta flame representing Gemini 4 Argon reasoning.',
        descVi: 'Thần long rực rỡ với ánh lửa terracotta đại diện cho trí tuệ suy luận siêu việt của Gemini 4 Argon.'
    }
];

export class ZenFishingSystem {
    constructor(scene, terrainSystem, options = {}) {
        this.scene = scene;
        this.terrain = terrainSystem;
        this.onToast = options.onToast || console.log;
        this.onCatch = options.onCatch || null;

        // FSM State: 'IDLE' | 'CASTING' | 'FLOATING' | 'NIBBLE' | 'BITE' | 'REELING'
        this.state = 'IDLE';
        this.stateTimer = 0;
        this.biteWindowTimer = 0;
        this.isAfkMode = false;

        // Spatial positions
        this.rodTipWorldPos = new THREE.Vector3();
        this.bobberPos = new THREE.Vector3();
        this.targetWaterY = 0;
        this.currentWaterBiome = 'river';

        // 3D Visual Objects
        this.group = new THREE.Group();
        this.group.name = 'ZenFishingMinigameGroup';

        // Zero-GC Line Rendering (10 points fixed Float32Array)
        this.linePointsCount = 10;
        this.linePositions = new Float32Array(this.linePointsCount * 3);
        this.lineGeometry = new THREE.BufferGeometry();
        this.lineGeometry.setAttribute('position', new THREE.BufferAttribute(this.linePositions, 3));
        this.lineGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

        this.lineMesh = new THREE.Line(
            this.lineGeometry,
            new THREE.LineBasicMaterial({
                color: 0xe2e8f0,
                transparent: true,
                opacity: 0.65,
                linewidth: 1
            })
        );
        this.lineMesh.visible = false;
        this.group.add(this.lineMesh);

        // Bobber Mesh (Red and white lacquered float)
        this.bobberMesh = this.buildBobberMesh();
        this.bobberMesh.visible = false;
        this.group.add(this.bobberMesh);

        // Ripple Mesh (concentric rings on water surface)
        this.rippleMesh = this.buildRippleMesh();
        this.rippleMesh.visible = false;
        this.group.add(this.rippleMesh);

        // Splash Particles (Zero-GC Pre-allocated pool)
        this.splashParticles = this.buildSplashParticles();
        this.group.add(this.splashParticles);

        this.scene.add(this.group);

        // Catch Log & Storage
        this.catchLog = this.loadCatchLog();

        // Audio synthesizer
        this.audioCtx = null;
    }

    buildBobberMesh() {
        const bGroup = new THREE.Group();
        bGroup.name = 'FishingBobber';

        const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
        const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });

        // Bottom white half-sphere
        const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), whiteMat);
        bGroup.add(bottom);

        // Top red half-sphere
        const top = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), redMat);
        bGroup.add(top);

        // Antenna stem
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8), redMat);
        antenna.position.y = 0.07;
        bGroup.add(antenna);

        return bGroup;
    }

    buildRippleMesh() {
        const geo = new THREE.RingGeometry(0.08, 0.32, 24);
        geo.rotateX(-Math.PI / 2);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xbae6fd,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.name = 'BobberRipples';
        return mesh;
    }

    buildSplashParticles() {
        const pCount = 18;
        const positions = new Float32Array(pCount * 3);
        const velocities = [];

        for (let i = 0; i < pCount; i++) {
            velocities.push({ x: 0, y: 0, z: 0, life: 0 });
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.attributes.position.setUsage(THREE.DynamicDrawUsage);

        const mat = new THREE.PointsMaterial({
            color: 0xe0f2fe,
            size: 0.16,
            transparent: true,
            opacity: 0.85,
            depthWrite: false
        });

        const p = new THREE.Points(geo, mat);
        p.userData = { velocities, pCount };
        p.visible = false;
        return p;
    }

    triggerSplash(x, y, z) {
        if (!this.splashParticles) return;
        const p = this.splashParticles;
        p.visible = true;
        const pos = p.geometry.attributes.position;
        const vel = p.userData.velocities;

        for (let i = 0; i < p.userData.pCount; i++) {
            pos.setXYZ(i, x, y, z);
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.8 + Math.random() * 1.6;
            vel[i].x = Math.cos(angle) * speed * 0.5;
            vel[i].y = 1.2 + Math.random() * 1.5;
            vel[i].z = Math.sin(angle) * speed * 0.5;
            vel[i].life = 0.65;
        }
        pos.needsUpdate = true;
    }

    /**
     * Detects water surface elevation and biome type at coordinates
     */
    detectWaterTarget(targetX, targetZ) {
        // 1. Arashiyama Onsen (Northwest Glade)
        const onsenDist = Math.hypot(targetX - -28.0, targetZ - -30.0);
        if (onsenDist <= 5.2) {
            return { waterY: 0.45, biome: 'onsen', valid: true };
        }

        // 2. Zen Koi Pond (Maple Valley)
        const zenPondDist = Math.hypot(targetX - 38.0, targetZ - -26.0);
        if (zenPondDist <= 6.0) {
            return { waterY: 0.52, biome: 'zen_pond', valid: true };
        }

        // 3. South Beach & Ocean Pier
        if (targetZ >= 50.0) {
            return { waterY: 0.08, biome: 'south_pier', valid: true };
        }

        // 4. Meandering River
        if (targetX >= -6.0 && targetX <= 18.0 && targetZ >= -35.0 && targetZ <= 45.0) {
            return { waterY: 0.15, biome: 'river', valid: true };
        }

        // Default open surface (if player casts near any brook)
        return { waterY: 0.2, biome: 'river', valid: true };
    }

    /**
     * Start Cast Action (Initiated by Left Click or Spacebar while holding bamboo_rod)
     */
    castLine(playerPos, playerHeading) {
        if (this.state !== 'IDLE') {
            // If already in BITE window, click = ACTIVE REEL!
            if (this.state === 'BITE') {
                this.reelFish(true); // Active mode catch!
                return;
            }
            // If in waiting or nibble state, reel in without catch
            this.cancelFishing();
            return;
        }

        // Cast forward 4.5m - 7.5m in front of player
        const castDist = 5.2;
        const targetX = playerPos.x + Math.sin(playerHeading) * castDist;
        const targetZ = playerPos.z + Math.cos(playerHeading) * castDist;

        const waterInfo = this.detectWaterTarget(targetX, targetZ);
        this.targetWaterY = waterInfo.waterY;
        this.currentWaterBiome = waterInfo.biome;

        this.bobberPos.set(targetX, this.targetWaterY, targetZ);
        this.bobberMesh.position.copy(this.bobberPos);
        this.bobberMesh.visible = true;

        this.rippleMesh.position.set(targetX, this.targetWaterY + 0.01, targetZ);
        this.rippleMesh.visible = true;
        this.lineMesh.visible = true;

        this.state = 'CASTING';
        this.stateTimer = 0.55; // 0.55s cast arc

        this.playWhooshSound();

        if (window.multiplayerClient && typeof window.multiplayerClient.sendFishCast === 'function') {
            window.multiplayerClient.sendFishCast(this.bobberPos);
        }

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';
        if (this.onToast) {
            this.onToast(isVi ? 'Đang quăng cần câu... 🎣' : 'Casting fishing line... 🎣', 'info');
        }
    }

    cancelFishing() {
        this.state = 'IDLE';
        this.lineMesh.visible = false;
        this.bobberMesh.visible = false;
        this.rippleMesh.visible = false;

        if (window.multiplayerClient && typeof window.multiplayerClient.sendFishCancel === 'function') {
            window.multiplayerClient.sendFishCancel();
        }
    }

    /**
     * Active or AFK Reel In
     */
    reelFish(isActiveClick = false) {
        if (this.state !== 'BITE') return;

        this.state = 'REELING';
        this.stateTimer = 0.8;

        this.triggerSplash(this.bobberPos.x, this.bobberPos.y, this.bobberPos.z);
        this.playSplashSound();

        // Calculate Loot Table
        const caughtFish = this.rollFishCatch(this.currentWaterBiome, isActiveClick);
        const weight = (caughtFish.minWeight + Math.random() * (caughtFish.maxWeight - caughtFish.minWeight)).toFixed(1);

        this.recordCatch(caughtFish, parseFloat(weight));

        if (window.multiplayerClient && typeof window.multiplayerClient.sendFishCatch === 'function') {
            window.multiplayerClient.sendFishCatch(caughtFish, weight);
        }

        setTimeout(() => {
            this.celebrateCatch(caughtFish, weight, isActiveClick);
            this.cancelFishing();
        }, 600);
    }

    /**
     * Loot Table Calculation (Following Argon's Regional Probabilities)
     */
    rollFishCatch(biome, isActive) {
        // Filter species by preferred biome
        const biomePool = FISH_SPECIES.filter(f => f.preferredBiome === biome);
        const generalPool = FISH_SPECIES;

        const roll = Math.random();
        let targetTier = 'common';

        // Probabilities based on Active vs AFK (Argon formula)
        if (isActive) {
            // Active click: +30% boost to rare, epic, and legendary
            if (roll < 0.02) targetTier = 'mythical';
            else if (roll < 0.12) targetTier = 'legendary';
            else if (roll < 0.32) targetTier = 'epic';
            else if (roll < 0.65) targetTier = 'rare';
            else targetTier = 'common';
        } else {
            // AFK auto-reel: standard common/rare
            if (roll < 0.03) targetTier = 'epic';
            else if (roll < 0.35) targetTier = 'rare';
            else targetTier = 'common';
        }

        // Pick matching fish
        let candidates = biomePool.filter(f => f.tier === targetTier);
        if (candidates.length === 0) {
            candidates = generalPool.filter(f => f.tier === targetTier);
        }
        if (candidates.length === 0) {
            candidates = generalPool.filter(f => f.tier === 'common');
        }

        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    recordCatch(fish, weight) {
        if (!this.catchLog[fish.id]) {
            this.catchLog[fish.id] = { count: 0, maxWeight: 0 };
        }
        this.catchLog[fish.id].count += 1;
        if (weight > this.catchLog[fish.id].maxWeight) {
            this.catchLog[fish.id].maxWeight = weight;
        }
        this.saveCatchLog();

        // Award Dev Coins & XP
        if (window.openWorld3D?.addXp) {
            window.openWorld3D.addXp(Math.round(fish.value * 0.8), `Caught ${fish.name}`);
        }

        // Add caught fish to player's bag
        if (window.playerInventory && typeof window.playerInventory.addItem === 'function') {
            window.playerInventory.addItem({
                id: fish.id,
                name: fish.name,
                vi: fish.vi,
                icon: 'fish',
                type: 'raw_fish',
                holdable: true,
                handPose: 'small_can',
                gripProfile: 'small_can',
                value: fish.value || 30,
                weight: parseFloat(weight)
            });
        }

        if (this.onCatch) {
            this.onCatch(fish, weight);
        }
    }

    celebrateCatch(fish, weight, isActive) {
        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';

        const name = isVi ? fish.vi : fish.name;
        const tier = isVi ? fish.tierVi : fish.tier.toUpperCase();
        const modeText = isActive ? (isVi ? '⚡ Giật cần chủ động (+30% Thưởng)' : '⚡ Active Strike (+30% Bonus)') : '💤 AFK Catch';

        const bannerHtml = `
            <div style="font-weight: 700; font-size: 15px; color: ${fish.color}; margin-bottom: 2px;">
                🎉 ${isVi ? 'ĐÃ CÂU ĐƯỢC' : 'CAUGHT'}: ${name}!
            </div>
            <div style="font-size: 12px; color: #cbd5e1;">
                [${tier}] • ${weight} kg • +${fish.value} Dev Coins
            </div>
            <div style="font-size: 11px; color: #94a3b8; font-style: italic; margin-top: 4px;">
                "${isVi ? fish.descVi : fish.desc}"
            </div>
        `;

        if (this.onToast) {
            this.onToast(bannerHtml, 'success');
        }
    }

    loadCatchLog() {
        try {
            const data = localStorage.getItem('teleterm_fish_dex_log');
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    saveCatchLog() {
        try {
            localStorage.setItem('teleterm_fish_dex_log', JSON.stringify(this.catchLog));
        } catch (e) {}
    }

    /**
     * Web Audio SFX synthesis
     */
    playWhooshSound() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(320, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        } catch (e) {}
    }

    playSplashSound() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(540, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.35);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.35);
        } catch (e) {}
    }

    getAudioContext() {
        if (!this.audioCtx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.audioCtx = new AudioCtx();
        }
        return this.audioCtx;
    }

    /**
     * Zero-GC Tick Loop Update
     */
    update(delta, playerPos = null, rodTipObject = null) {
        if (rodTipObject && rodTipObject.getWorldPosition) {
            rodTipObject.getWorldPosition(this.rodTipWorldPos);
        } else if (playerPos) {
            this.rodTipWorldPos.set(playerPos.x + 0.3, playerPos.y + 1.2, playerPos.z + 0.4);
        }

        // FSM Updates
        if (this.state === 'CASTING') {
            this.stateTimer -= delta;
            if (this.stateTimer <= 0) {
                this.state = 'FLOATING';
                this.stateTimer = 4.0 + Math.random() * 4.0; // 4s - 8s wait
                this.triggerSplash(this.bobberPos.x, this.bobberPos.y, this.bobberPos.z);
                this.playSplashSound();
            }
        } else if (this.state === 'FLOATING') {
            this.stateTimer -= delta;
            if (this.stateTimer <= 0) {
                this.state = 'NIBBLE';
                this.stateTimer = 1.0;
            }
        } else if (this.state === 'NIBBLE') {
            this.stateTimer -= delta;
            // Bobber twitches down
            this.bobberMesh.position.y = this.targetWaterY - 0.04;
            if (this.stateTimer <= 0) {
                this.state = 'BITE';
                this.stateTimer = 2.4; // 2.4s bite window
                this.biteWindowTimer = 1.8;
                this.triggerSplash(this.bobberPos.x, this.bobberPos.y, this.bobberPos.z);
                this.playSplashSound();

                if (window.multiplayerClient && typeof window.multiplayerClient.sendFishBite === 'function') {
                    window.multiplayerClient.sendFishBite(this.bobberPos);
                }

                const i18n = window.TeleTermI18n;
                const isVi = i18n && i18n.getLanguage() === 'vi';
                if (this.onToast) {
                    this.onToast(isVi ? '⚠️ CÁ CẮN CÂU! Nhấp chuột để giật cần! 🎣' : '⚠️ BITE! Click now to strike! 🎣', 'warning');
                }
            }
        } else if (this.state === 'BITE') {
            this.stateTimer -= delta;
            this.biteWindowTimer -= delta;

            // Plunge down and shake
            this.bobberMesh.position.y = this.targetWaterY - 0.08 + Math.sin(this.stateTimer * 20.0) * 0.03;

            // AFK auto-reel fallback if bite window expires
            if (this.stateTimer <= 0) {
                this.reelFish(false); // AFK catch!
            }
        } else if (this.state === 'REELING') {
            this.stateTimer -= delta;
            // Arc bobber back toward player
            if (playerPos) {
                this.bobberMesh.position.lerp(playerPos, 0.12);
            }
        }

        // Bobber floating oscillation
        if (this.state === 'FLOATING') {
            const time = performance.now() / 1000;
            this.bobberMesh.position.y = this.targetWaterY + Math.sin(time * 3.0) * 0.02;
            if (this.rippleMesh) {
                const rScale = 1.0 + (time % 1.5) * 0.8;
                this.rippleMesh.scale.set(rScale, rScale, rScale);
                this.rippleMesh.material.opacity = Math.max(0.0, 0.65 - (time % 1.5) * 0.4);
            }
        }

        // Zero-GC Line Rendering Update (Scalar math catenary bezier from tip to bobber)
        if (this.lineMesh.visible) {
            const p = this.linePositions;
            const startX = this.rodTipWorldPos.x;
            const startY = this.rodTipWorldPos.y;
            const startZ = this.rodTipWorldPos.z;

            const endX = this.bobberMesh.position.x;
            const endY = this.bobberMesh.position.y + 0.08;
            const endZ = this.bobberMesh.position.z;

            const n = this.linePointsCount;
            for (let i = 0; i < n; i++) {
                const t = i / (n - 1);
                const x = startX + (endX - startX) * t;
                const z = startZ + (endZ - startZ) * t;

                // Natural catenary sagging curve
                const sag = Math.sin(t * Math.PI) * (this.state === 'BITE' ? 0.05 : 0.35);
                const y = startY + (endY - startY) * t - sag;

                const idx = i * 3;
                p[idx] = x;
                p[idx + 1] = y;
                p[idx + 2] = z;
            }
            this.lineGeometry.attributes.position.needsUpdate = true;
        }

        // Update Splash Particles
        if (this.splashParticles && this.splashParticles.visible) {
            const p = this.splashParticles;
            const pos = p.geometry.attributes.position;
            const vel = p.userData.velocities;
            let anyAlive = false;

            for (let i = 0; i < p.userData.pCount; i++) {
                if (vel[i].life > 0) {
                    anyAlive = true;
                    vel[i].life -= delta;
                    vel[i].y -= 9.8 * delta; // Gravity
                    pos.setXYZ(
                        i,
                        pos.getX(i) + vel[i].x * delta,
                        pos.getY(i) + vel[i].y * delta,
                        pos.getZ(i) + vel[i].z * delta
                    );
                }
            }
            pos.needsUpdate = true;
            if (!anyAlive) p.visible = false;
        }
    }
}
