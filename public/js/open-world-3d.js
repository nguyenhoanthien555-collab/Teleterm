/**
 * TELETERM 3D — LIVING OPEN WORLD METAVERSE ENGINE (MASTER SPEC V3)
 * Full 8-Region Open World:
 * - Developer Hub & Co-working Deck
 * - Countryside Village Plaza
 * - Terraced Flooded Rice Country & Modern Concrete Flumes
 * - Meandering River Valley & Arched Timber Road Bridge
 * - Blooming Cherry Blossom Avenue & Hillside Grove
 * - Alpine Foothills & Panoramic Snowy Mountain Massif
 * - Coastal Sand Dunes, Wet Sand Shoreline & Wooden Pier Dock
 * 
 * Subsystems:
 * - Humanoid Avatar Contract & Retargeting Engine
 * - Living NPC System with Autonomous Schedules & Dynamic Status Badges
 * - Seating & Semantic Interactive Anchors
 * - Developer Presence System (Sanitized local terminal & AI activity)
 * - Surface-aware Procedural Web Audio Footstep Engine
 * - Dynamic Weather, 24-hr Lighting Cycle & Procedural Ambient Nature Audio
 */

import * as THREE from '/vendor/three/build/three.module.js';
import { GLTFLoader } from '/vendor/three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from '/vendor/three/examples/jsm/utils/SkeletonUtils.js';
import { WorldComposition } from './world/world-composition.js?v=36';
import { WorldCollisionSystem } from './world/world-collision-system.js?v=36';
import { OverheadUiSystem } from './ui/overhead-ui-system.js?v=36';
import { FootstepAudioSystem } from './world/footstep-audio-system.js?v=36';
import { SurfaceDetector } from './world/surface-detector.js?v=36';
import { HumanoidContract } from './animation/humanoid-contract.js?v=36';
import { AvatarRetargeter } from './animation/avatar-retargeter.js?v=39';
import { InteractionManager } from './interaction/interaction-manager.js?v=36';
import { NpcLifeSystem } from './npc/npc-life-system.js?v=39';
import { DeveloperPresenceSystem } from './presence/developer-presence.js?v=36';
import { GRIP_PROFILES } from './inventory/player-inventory.js';
import { InWorldHologramSystem } from './ui/inworld-hologram-system.js?v=37';
import { worldContext } from './world/world-context.js?v=36';
import { QuestManager } from './quest/quest-manager.js';
import { QuestTrackerHud } from './ui/quest-tracker-hud.js';
import { NoticeBoardModal } from './ui/notice-board-modal.js';
import { EmoteWheel } from './ui/emote-wheel.js';
import { MinimapRadarSystem } from './ui/minimap-radar-system.js?v=38';
import { PhotoModeSystem } from './camera/photo-mode-system.js?v=38';
import { themeManager } from './ui/theme-manager.js';
import { spatialAudioZoneManager } from './world/spatial-audio-zone-manager.js';
import { DynamicWeatherSpatialSystem } from './world/dynamic-weather-spatial-system.js';
import { visualNovelDialogueModal } from './ui/visual-novel-dialogue-modal.js';
import { persistenceManager } from './core/persistence-manager.js';
import { dynamicQualityScaler } from './core/dynamic-quality-scaler.js';
import { DayNightCycleSystem } from './world/day-night-cycle.js';
import { GroupEmoteSyncManager } from './animation/group-emote-sync.js';
import { LivingNpcScheduleManager } from './npc/living-npc-schedule.js';
import { photoStudioModal } from './ui/photo-studio-modal.js';
import { DiegeticTerminalKiosk } from './world/diegetic-terminal-kiosk.js';
import { TimeOfDayQuestManager } from './quest/time-of-day-quest-manager.js';
import { XpShopModal } from './ui/xp-shop-modal.js';
import { InworldPhotoBillboard } from './world/inworld-photo-billboard.js';
import { ZenFishingSystem } from './minigames/zen-fishing-system.js?v=40';
import { FishDexModal } from './minigames/fish-dex-modal.js?v=40';
import { ThermalGovernor } from './core/thermal-governor.js?v=47';

// Zero-Allocation Module Scratchpad (Argon Task #3)
const _interactionCandidates = [];
const _interactionCandidatePool = [];
function getCandidateSlot(idx) {
    if (!_interactionCandidatePool[idx]) {
        _interactionCandidatePool[idx] = {
            type: '',
            data: null,
            dist: 0,
            posX: 0,
            posY: 0,
            posZ: 0,
            icon: '',
            actionText: '',
            action: null
        };
    }
    return _interactionCandidatePool[idx];
}
const _tempCheckPos = new THREE.Vector3();
const _tempPromptPos = new THREE.Vector3();
const _tempToTarget = new THREE.Vector3();
const _tempCamDir = new THREE.Vector3();
const _tempProj = new THREE.Vector3();
import { PerformanceManager } from './world/performance-manager.js';

export class OpenWorld3D {
    constructor(options = {}) {
        this.canvas = document.getElementById('open-world-canvas');
        window.THREE = THREE;
        this.THREE = THREE;
        this.onToast = options.onToast || console.log;
        window.createHandheldItemMesh = (itemDef) => this.createHandheldItemMesh(itemDef);
        this.onNpcInteract = options.onNpcInteract || null;
        this.onToggleUi = options.onToggleUi || null;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.lastFrameTime = performance.now();
        this.worldStartTime = performance.now();

        // Game & Exploration State
        this.isExploreMode = true;
        this.nearbyNpc = null;
        this.nearbyAnchor = null;
        this.isSitting = false;
        this.currentSeatAnchor = null;

        // Player & Kinematics
        this.player = null;
        this.playerMesh = null;
        this.playerBones = {};
        this.retargeter = null;
        this.kinematics = null; // compatibility alias
        this.footstepAudio = null;
        this.surfaceDetector = null;
        this.playerContactShadow = null;
        this.playerPresenceBadge = null;

        // Subsystem Managers
        this.worldComposition = null;
        this.collisionSystem = null;
        this.overheadUi = null;
        this.interactionManager = null;
        this.npcLifeSystem = null;
        this.developerPresence = null;

        // Camera: Spacious third-person anime perspective (expanded FOV to eliminate cramped/claustrophobic feel)
        this.cameraRotation = { yaw: -0.18, pitch: 0.06 };
        this.targetCameraRotation = { yaw: -0.18, pitch: 0.06 };
        this.cameraDistance = 5.4;
        this.targetCameraDistance = 5.4;
        this.mouseSensitivity = 0.005;
        this.invertY = false;
        this.cameraFov = 72;
        this.isPointerDown = false;
        this.previousPointer = { x: 0, y: 0 };
        this.cameraTouchId = null;
        this.pinchTouchId = null;
        this.joystickTouchId = null;
        this.lastTouchPos = { x: 0, y: 0 };
        this.pinchDistStart = null;

        // Controls State
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            sprint: false,
            jump: false
        };
        this.joystickVector = { x: 0, y: 0 };

        // Biomechanical Aerial & Jump Kinematics State (Argon Master Continuous Kinematics)
        this.verticalVelocity = 0;
        this.isGrounded = true;
        this.jumpState = 'GROUNDED'; // 'GROUNDED', 'ANTICIPATION', 'AIRBORNE', 'LANDING'
        this.jumpTimer = 0;
        this.jumpBufferTimer = 0;
        this.coyoteTimer = 0;
        this.jumpConsumed = false;
        this.landingSpringTime = 999;
        this.landingImpactIntensity = 0;
        this.landingSquashFactor = 0;
        this.playerAngularVel = 0;

        // Entities
        this.npcs = [];
        this.interactPromptEl = document.getElementById('world-interact-prompt');
        this.activeInteractTarget = null;

        this.init();
    }

    init() {
        if (!this.canvas) return;

        // 1. Scene, Camera, Renderer
        this.scene = new THREE.Scene();

        const isForceLandscape = document.body.classList.contains('force-landscape') && window.innerWidth < window.innerHeight;
        const width = isForceLandscape ? window.innerHeight : window.innerWidth;
        const height = isForceLandscape ? window.innerWidth : window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(this.cameraFov, width / height, 0.1, 850);

        const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 768;
        this.isMobileDevice = isMobileDevice;

        // Load Initial Graphics Quality Settings from LocalStorage or Defaults
        let initialGfx = {
            platform: isMobileDevice ? 'mobile' : 'pc',
            preset: isMobileDevice ? 'medium' : 'high',
            dpr: isMobileDevice ? 1.0 : 1.25,
            antiAliasing: true,
            shadowQuality: isMobileDevice ? '512' : '1024',
            modelSmoothing: isMobileDevice ? 'standard' : 'high',
            shaderMode: isMobileDevice ? 'vanilla' : 'enhanced',
            fpsCap: 60,
            nametags: 'focus'
        };
        try {
            const raw = localStorage.getItem('teleterm_graphics_settings');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed) initialGfx = { ...initialGfx, ...parsed };
            }
        } catch (e) {}

        // Desktop PC graphics quality protection: prevent stale mobile settings from downgrading PC graphics
        if (!isMobileDevice && initialGfx.platform === 'mobile' && !initialGfx.userExplicitMobile) {
            initialGfx.platform = 'pc';
            initialGfx.preset = (initialGfx.preset === 'custom') ? 'custom' : 'high';
            initialGfx.dpr = Math.max(initialGfx.dpr || 1.25, 1.25);
            initialGfx.shadowQuality = (initialGfx.shadowQuality === 'off') ? 'off' : '1024';
            initialGfx.shaderMode = 'enhanced';
            initialGfx.modelSmoothing = 'high';
        }

        this.graphicsSettings = initialGfx;
        this.fpsCap = initialGfx.fpsCap !== undefined ? initialGfx.fpsCap : 60;
        this.lastRenderTime = 0;
        this.sunFlareMesh = null;
        this.postProcessing = null;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: !!initialGfx.antiAliasing,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height, false);
        this.renderer.setPixelRatio(initialGfx.dpr || (isMobileDevice ? 1.0 : 1.25));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = initialGfx.shaderMode === 'enhanced' ? 1.28 : 1.22;

        if (initialGfx.shadowQuality === 'off') {
            this.renderer.shadowMap.enabled = false;
        } else {
            this.renderer.shadowMap.enabled = true;
            const sSize = parseInt(initialGfx.shadowQuality, 10) || 512;
            if (sSize >= 1024) {
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            } else {
                this.renderer.shadowMap.type = THREE.PCFShadowMap;
            }
        }

        // Soft camera-facing anime fill light to illuminate character & face gently without glare
        this.avatarFrontLight = new THREE.DirectionalLight(0xfff8f0, 0.20);
        this.avatarFrontLight.position.set(0, 1.5, 3.0);
        this.avatarFrontLight.castShadow = false; // Never casts shadows, purely soft anime fill light
        this.camera.add(this.avatarFrontLight);
        this.scene.add(this.camera);

        this.worldComposition = new WorldComposition(this.scene);
        this.worldComposition.buildAll();
        this.wildlife = this.worldComposition.wildlife;
        this.toriiWarp = this.worldComposition.toriiWarp;

        // 2b. Initialize Minecraft-inspired Sun Shader FX & Apply Initial Graphics Specs
        this.initSunShaderFx();
        this.applyGraphicsSettings(this.graphicsSettings);
        this.optimizeSceneTexturesForGpu();
        this.initPostProcessing();

        // 2c. World Collision & Walkable Elevation System
        this.collisionSystem = new WorldCollisionSystem(this.worldComposition.terrain);

        // 2d. Overhead Screen-Space UI System (Clamped, Distance Scaled, View-Cone Culled)
        this.overheadUi = new OverheadUiSystem(this.scene, this.camera);
        if (this.overheadUi && initialGfx.nametags) {
            this.overheadUi.setNametagMode(initialGfx.nametags);
        }

        // 3. Audio & Ground Surface Detection Engine
        this.footstepAudio = new FootstepAudioSystem();
        this.surfaceDetector = new SurfaceDetector(this.worldComposition);
        this.worldComposition.surfaceDetector = this.surfaceDetector;
        this.worldComposition.collision = this.collisionSystem;
        worldContext.bind(this.worldComposition);
        window.worldContext = worldContext;
        window.worldComposition = this.worldComposition;
        window.modularDeskDecor = this.worldComposition.deskDecor;

        // 3a. Thermal & Battery Performance Governor (Argon v2)
        this.thermalGovernor = new ThermalGovernor(this);
        window.thermalGovernor = this.thermalGovernor;

        // 3b. In-World 3D Holographic Windows & Cyber Projection System
        this.inworldHologram = new InWorldHologramSystem(this.scene);
        window.inworldHologramSystem = this.inworldHologram;

        // 3c. Tactical Mini-Map HUD Radar System (Removed per user directive)
        this.minimapRadar = null;
        this.minimapRadarSystem = null;
        window.minimapRadarSystem = null;

        // 3d. Anime Photo Mode & Kinetic Drone Camera System
        this.photoMode = new PhotoModeSystem(this, {
            onToast: (msg, type) => this.onToast?.(msg, type)
        });
        this.photoModeSystem = this.photoMode;
        window.photoModeSystem = this.photoMode;

        // 3e. Spatial Audio 3D & Zone BGM Crossfader
        this.spatialAudioZoneManager = spatialAudioZoneManager;
        window.spatialAudioZoneManager = spatialAudioZoneManager;

        // 3f. Dynamic Biome Weather & Spatial Atmosphere System
        this.dynamicWeather = new DynamicWeatherSpatialSystem(this.scene);
        this.dynamicWeatherSystem = this.dynamicWeather;
        window.dynamicWeatherSpatialSystem = this.dynamicWeather;

        // 3g. Visual Novel Dialogue & Quest Engine
        this.visualNovelDialogue = visualNovelDialogueModal;
        window.visualNovelDialogueModal = visualNovelDialogueModal;

        // 3h. Day/Night Celestial Cycle & Atmospheric Shader Sync
        this.dayNightCycle = new DayNightCycleSystem(this.scene, {
            directionalLight: this.worldComposition?.timeOfDay?.sunLight
        });
        window.dayNightCycleSystem = this.dayNightCycle;

        // 3i. Group Emote Synchronization (Vibe Harmony Engine)
        this.groupEmoteSync = new GroupEmoteSyncManager(this.scene);
        window.groupEmoteSyncManager = this.groupEmoteSync;

        // 3j. Dynamic Quality Scaler (Performance Governor)
        this.qualityScaler = dynamicQualityScaler;
        this.qualityScaler.setRenderer(this.renderer);
        this.qualityScaler.setWeatherSystem(this.dynamicWeather);
        this.qualityScaler.setAudioManager(this.spatialAudioZoneManager);
        window.dynamicQualityScaler = this.qualityScaler;

        // 3k. Photo Studio Modal
        this.photoStudio = photoStudioModal;
        this.photoStudio.world = this;
        this.photoStudio.renderer = this.renderer;
        this.photoStudio.scene = this.scene;
        this.photoStudio.camera = this.camera;
        this.photoStudio.canvas = this.canvas;
        window.photoStudioModal = this.photoStudio;

        // 4. Interaction & NPC Life Subsystems
        this.interactionManager = new InteractionManager();
        this.interactionManager.setTerrainSystem(this.collisionSystem || this.terrain);
        if (this.worldComposition?.landmarks?.syncAnchorPositions) {
            this.worldComposition.landmarks.syncAnchorPositions(this.interactionManager);
        }
        if (this.worldComposition?.campfireSocial) {
            this.worldComposition.campfireSocial.registerSeatAnchors(this.interactionManager);
        }
        this.npcLifeSystem = new NpcLifeSystem(this.collisionSystem, this.interactionManager, this.overheadUi);

        // 3l. Living NPC Dynamic Schedule Manager
        this.livingNpcSchedule = new LivingNpcScheduleManager(this.scene, this.npcLifeSystem, this.groupEmoteSync, this);
        window.livingNpcScheduleManager = this.livingNpcSchedule;

        // 3m. Diegetic Terminal Kiosk (Interactive 3D screen at Hub with 3D keystroke audio)
        this.diegeticKiosk = new DiegeticTerminalKiosk(this.scene, this.camera);
        window.diegeticTerminalKiosk = this.diegeticKiosk;

        // 3n. Time-of-Day Quest Controller
        this.timeOfDayQuestManager = new TimeOfDayQuestManager(this.dayNightCycle, persistenceManager);
        window.timeOfDayQuestManager = this.timeOfDayQuestManager;

        // 3o. Cyberpunk XP Reward Shop Modal (Hotkey [K])
        this.xpShopModal = new XpShopModal(persistenceManager);
        window.xpShopModal = this.xpShopModal;

        // 3p. In-World Photo Billboard & Multiplayer Showcase
        this.photoBillboard = new InworldPhotoBillboard(this.scene, this.terrain);
        window.inworldPhotoBillboard = this.photoBillboard;

        // 3q. Zen Fishing Minigame & Fish Dex Modal (Sprint 2.2)
        this.zenFishing = new ZenFishingSystem(this.scene, this.terrain, {
            onToast: (msg, type) => this.onToast?.(msg, type),
            onCatch: (fish, weight) => {}
        });
        window.zenFishing = this.zenFishing;

        this.fishDexModal = new FishDexModal(this.zenFishing, {
            onToast: (msg, type) => this.onToast?.(msg, type)
        });
        window.fishDexModal = this.fishDexModal;

        const btnFishDex = document.getElementById('btn-open-fish-dex');
        if (btnFishDex) {
            btnFishDex.addEventListener('click', () => {
                this.fishDexModal?.toggle();
            });
        }

        this.developerPresence = new DeveloperPresenceSystem({
            onPresenceChange: (state, text) => this.onPlayerPresenceChange(state, text)
        });

        // 5. Load Characters & Avatars
        this.loadAnimeCharacterAndNpcs();

        // 6. Bind Input Controls
        this.bindInputEvents();
        this.initVirtualJoystick();

        // 7. Listen to Global Developer Events for Sanitized Presence Broadcast
        window.addEventListener('teleterm:command-executed', (e) => {
            if (this.developerPresence && e.detail?.command) {
                this.developerPresence.handleCommandExecuted(e.detail.command);
            }
        });
        window.addEventListener('teleterm:ai-state', (e) => {
            if (this.developerPresence && e.detail?.isThinking !== undefined) {
                this.developerPresence.handleAiActive(e.detail.isThinking);
            }
        });

        // 7b. Genshin Impact-Style Quest Engine, Notice Board & Radial Emote Wheel
        this.questManager = new QuestManager({
            onToast: (msg, type) => this.onToast(msg, type)
        });
        window.questManager = this.questManager;

        this.noticeBoardModal = new NoticeBoardModal(this.questManager, {
            onToast: (msg, type) => this.onToast(msg, type)
        });
        window.noticeBoardModal = this.noticeBoardModal;

        this.questTrackerHud = new QuestTrackerHud(this.questManager, {
            onOpenNoticeBoard: () => this.noticeBoardModal.open()
        });
        window.questTrackerHud = this.questTrackerHud;

        this.emoteWheel = new EmoteWheel(this.questManager, {
            onToast: (msg, type) => this.onToast(msg, type)
        });
        window.emoteWheel = this.emoteWheel;

        // Register Developer Hub Notice Board Anchor & Prop
        this.initNoticeBoardProp();

        // Milestone 4: Shared Pomodoro Zen Garden Focus Sanctuary
        if (window.ZenGardenPomodoroSystem) {
            this.zenGardenPomodoro = new window.ZenGardenPomodoroSystem(this.scene);
        } else if (window.zenGardenPomodoro) {
            this.zenGardenPomodoro = window.zenGardenPomodoro;
        }
        if (this.interactionManager) {
            this.interactionManager.registerAnchor({
                id: 'zen_pomodoro_sanctuary',
                type: 'custom',
                category: 'pomodoro_sanctuary',
                labelKey: 'anchor_pomodoro_sanctuary',
                label: 'Zen Pomodoro Focus 🧘',
                position: { x: 36.0, y: 0.9, z: -24.5 },
                interactionRadius: 3.5,
                action: () => {
                    if (window.zenGardenPomodoro) window.zenGardenPomodoro.open();
                }
            });
        }

        // Milestone 5: Living Wildlife Ecosystem & Interactive Pet Companions
        if (window.PetCompanionSystem) {
            this.petCompanionSystem = new window.PetCompanionSystem(this.scene, this.terrainSystem);
            window.petCompanionSystem = this.petCompanionSystem;
        } else if (window.petCompanionSystem) {
            this.petCompanionSystem = window.petCompanionSystem;
        }
        if (this.interactionManager) {
            this.interactionManager.registerAnchor({
                id: 'pet_companion_anchor',
                type: 'custom',
                category: 'pet_companion',
                labelKey: 'anchor_pet_companion',
                label: 'Pet Companion 🐾 [E]',
                position: { x: 0, y: 0.5, z: 0 },
                interactionRadius: 2.8,
                action: () => {
                    const petSys = this.petCompanionSystem || window.petCompanionSystem;
                    if (petSys) petSys.open();
                }
            });
        }

        // Listen for quest state updates to refresh overhead markers
        window.addEventListener('teleterm:quest-updated', (e) => {
            this.syncNpcQuestMarkers(e.detail);
        });

        // 7c. Performance Monitoring & Dynamic Resolution Scaling (DRS) Engine
        this.performanceManager = new PerformanceManager(this);
        window.teleterm3DBenchmark = {
            start: (options) => this.performanceManager.startBenchmark(typeof options === 'string' ? { label: options } : (options || {})),
            mark: (segment) => this.performanceManager.markBenchmarkSegment(segment),
            stop: () => this.performanceManager.stopBenchmark(true)
        };
        this.performanceManager.onTelemetryUpdate = (data) => {
            const fpsEl = document.getElementById('top-fps-chip');
            const ftEl = document.getElementById('top-frametime-chip');
            const badgeEl = document.getElementById('top-gfx-profile-badge');
            if (fpsEl) fpsEl.textContent = data.fps;
            if (ftEl) ftEl.textContent = data.frameTimeMs;
            if (badgeEl) badgeEl.textContent = data.profile.toUpperCase();
        };
        window.performanceManager = this.performanceManager;

        window.addEventListener('resize', () => this.onWindowResize());

        // 8. Render Loop
        this.animate();
    }

    getTerrainHeight(x, z) {
        if (this.collisionSystem) {
            return this.collisionSystem.getWalkableHeight(x, z);
        }
        if (this.worldComposition) {
            return this.worldComposition.getTerrainHeight(x, z);
        }
        return 0;
    }

    /* =========================================================================
       CHARACTER & AVATAR LOADING
       ========================================================================= */
    loadAnimeCharacterAndNpcs() {
        this.player = new THREE.Group();
        const startX = 2.8;
        const startZ = 4.2;
        const startY = this.getTerrainHeight(startX, startZ);
        this.player.position.set(startX, startY, startZ);
        this.player.rotation.y = 0.04;
        this.scene.add(this.player);
        if (this.inworldHologram) {
            this.inworldHologram.setLocalAvatar(this.player);
        }

        // Soft Radial Contact Shadow Under Character
        const sCanvas = document.createElement('canvas');
        sCanvas.width = 128;
        sCanvas.height = 128;
        const sctx = sCanvas.getContext('2d');
        const sRad = sctx.createRadialGradient(64, 64, 4, 64, 64, 58);
        sRad.addColorStop(0.0, 'rgba(15, 23, 42, 0.58)');
        sRad.addColorStop(0.5, 'rgba(15, 23, 42, 0.28)');
        sRad.addColorStop(1.0, 'rgba(15, 23, 42, 0.0)');
        sctx.fillStyle = sRad;
        sctx.fillRect(0, 0, 128, 128);
        const sTex = new THREE.CanvasTexture(sCanvas);

        const shadowGeo = new THREE.PlaneGeometry(0.9, 0.9);
        shadowGeo.rotateX(-Math.PI / 2);
        const shadowMat = new THREE.MeshBasicMaterial({
            map: sTex,
            transparent: true,
            depthWrite: false
        });
        this.playerContactShadow = new THREE.Mesh(shadowGeo, shadowMat);
        this.playerContactShadow.position.set(startX, startY + 0.02, startZ);
        this.scene.add(this.playerContactShadow);

        // Fallback placeholder while GLB model loads
        const fallbackMat = new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.5 });
        const fallbackBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 1.45, 12), fallbackMat);
        fallbackBody.position.y = 0.85;
        this.player.add(fallbackBody);

        const loader = new GLTFLoader();
        loader.load(
            '/models/anime-character.glb',
            (gltf) => {
                this.player.remove(fallbackBody);
                const baseModel = gltf.scene;

                const box = new THREE.Box3().setFromObject(baseModel);
                const size = box.getSize(new THREE.Vector3());
                const targetHeight = 1.68;
                const scale = targetHeight / (size.y || 1);
                baseModel.scale.set(scale, scale, scale);

                this.upgradeAnimeMaterials(baseModel);

                // Attach Avatar Retargeter to Player (preserve seated animation if already sitting)
                const defaultAnim = this.isSitting ? (this.currentSeatAnchor?.defaultAnim || 'SitIdle') : 'Idle';
                this.retargeter = new AvatarRetargeter(baseModel, { defaultAnim });
                this.kinematics = this.retargeter;
                this.setupFootstepAudio();
                if (this.overheadUi && this.retargeter.mappedBones?.Head) {
                    this.overheadUi.setHeadBone('player', this.retargeter.mappedBones.Head);
                }

                baseModel.position.y = 0;
                this.playerMesh = baseModel;
                this.playerMesh.userData ||= {};
                this.playerMesh.userData.isAvatar = true;
                this.characterMeshMaster = baseModel;
                this.player.add(baseModel);

                // Build 4 Autonomous 3D Anime NPCs
                this.buildClonedAnimeNpcs(baseModel);

                if (window.multiplayerClient && typeof window.multiplayerClient.onMasterMeshLoaded === 'function') {
                    window.multiplayerClient.onMasterMeshLoaded(baseModel);
                }

                // Initialize Developer Presence Overhead Badge
                this.initPlayerBadge();

                let savedPreset = 'sakura_alice';
                try {
                    const sp = localStorage.getItem('teleterm_avatar_preset');
                    if (sp) savedPreset = sp;
                } catch (e) {}
                this.setPreset(savedPreset);
                this.applyGraphicsSettings(this.graphicsSettings);

                // Sync handheld item with player inventory
                if (window.playerInventory && typeof window.playerInventory.getEquippedItem === 'function') {
                    const item = window.playerInventory.getEquippedItem();
                    if (item) {
                        this.equipHandheldItem(item);
                    }
                }
            },
            undefined,
            (err) => console.warn('[OpenWorld3D] GLTF load error:', err)
        );
    }

    initPlayerBadge() {
        if (!this.overheadUi) return;
        const initialStatus = this.developerPresence ? this.developerPresence.getStatusText() : '*vibing*';
        const level = this.playerLevel || 1;
        const name = this.playerName || 'Developer';
        this.overheadUi.registerBadge('player', {
            name: name,
            level: level,
            borderColor: '#00f0ff',
            statusColor: '#38bdf8',
            glowColor: 'rgba(0, 240, 255, 0.4)',
            rootObj: this.player,
            headBone: this.retargeter?.mappedBones?.Head || null,
            heightOffset: 1.95,
            statusText: initialStatus
        });

        // Listen for level progression updates
        window.addEventListener('teleterm:level-up', (e) => {
            if (e.detail?.level) {
                this.playerLevel = e.detail.level;
                if (this.overheadUi) {
                    this.overheadUi.updateBadgeLevel('player', this.playerLevel);
                }
            }
        });
        window.addEventListener('teleterm:xp-awarded', (e) => {
            if (e.detail?.level) {
                this.playerLevel = e.detail.level;
                if (this.overheadUi) {
                    this.overheadUi.updateBadgeLevel('player', this.playerLevel);
                }
            }
        });
    }

    updatePlayerBadge(statusText) {
        if (this.overheadUi) {
            this.overheadUi.updateBadgeContent('player', statusText || '*vibing*');
        }
    }

    onPlayerPresenceChange(state, text) {
        this.updatePlayerBadge(text);
        if (state === 'celebrating' && this.retargeter && !this.isSitting) {
            this.retargeter.setAnimation('Celebrate');
            setTimeout(() => {
                if (this.retargeter && !this.isSitting) this.retargeter.setAnimation('Idle');
            }, 3500);
        }
    }

    setupFootstepAudio() {
        if (!this.retargeter) return;
        if (!this.footstepAudio) this.footstepAudio = new FootstepAudioSystem();
        if (!this.surfaceDetector) this.surfaceDetector = new SurfaceDetector(this.worldComposition);

        this.retargeter.onFootPlant = (foot, isRunning) => {
            if (!this.player || !this.surfaceDetector || !this.footstepAudio || this.isSitting) return;
            const surface = this.surfaceDetector.detect(this.player.position.x, this.player.position.z);
            this.footstepAudio.playFootstep(surface, isRunning);
        };
    }

    upgradeAnimeMaterials(model) {
        model.traverse(child => {
            if (child.isMesh) {
                const cName = child.name || '';
                const mName = (child.material && !Array.isArray(child.material) ? child.material.name : (child.material?.[0]?.name || '')) || '';
                const isFacePart = cName.includes('Face') || cName.includes('Eye') || cName.includes('Brow') || cName.includes('Mouth') ||
                                   mName.includes('Face') || mName.includes('Eye') || mName.includes('Brow') || mName.includes('Mouth');
                const isAccessory = cName.startsWith('accessory_') || cName.startsWith('handheld_item_');

                // 120 FPS Shadow Optimization: Anime faces & accessories do not cast shadows
                child.castShadow = !isFacePart && !isAccessory;
                child.receiveShadow = !isFacePart;
                if (child.material) {
                    const upgradeMat = (mat) => {
                        const name = mat.name || '';
                        const isCloth = name.includes('CLOTH') || name.includes('Onepiece') || name.includes('Tops') || name.includes('Shoes');
                        const isSkin = name.includes('SKIN');
                        const isHair = name.includes('HAIR');
                        const isEyeline = name.includes('FaceEyeline');
                        const isBrow = name.includes('FaceBrow');
                        const isMouth = name.includes('FaceMouth');
                        const isIris = name.includes('EyeIris');
                        const isHighlight = name.includes('EyeHighlight');
                        const isEyeWhite = name.includes('EyeWhite');
                        const isFaceSkin = name.includes('Face_00_SKIN');

                        // Set explicit layering renderOrder on the mesh so transparent decals render in correct anatomical depth
                        if (isFaceSkin || isMouth) child.renderOrder = 0;
                        else if (isEyeWhite) child.renderOrder = 1;
                        else if (isIris) child.renderOrder = 2;
                        else if (isHighlight) child.renderOrder = 3;
                        else if (isBrow) child.renderOrder = 4;
                        else if (isEyeline) child.renderOrder = 5;

                        if (mat.map) {
                            mat.map.generateMipmaps = true;
                            mat.map.minFilter = THREE.LinearMipmapLinearFilter;
                            mat.map.magFilter = THREE.LinearFilter;
                            mat.map.anisotropy = 16;
                        }

                        // 1. Crisp Facial Feature Decals: Eyelines & Brows (Zero emissive blowout, anti-aliased contour retention)
                        if (isEyeline || isBrow) {
                            let decalColor = new THREE.Color(0xffffff);
                            if (isEyeline) decalColor.setHex(0x181820);
                            else if (isBrow) decalColor.setHex(0x2a1818);

                            return new THREE.MeshStandardMaterial({
                                name: mat.name,
                                map: mat.map || null,
                                color: decalColor,
                                emissive: new THREE.Color(0x000000),
                                emissiveIntensity: 0.0,
                                roughness: 0.75,
                                metalness: 0.0,
                                transparent: true,
                                opacity: 1.0,
                                alphaTest: 0.02,
                                depthWrite: false,
                                polygonOffset: true,
                                polygonOffsetFactor: isEyeline ? -2.0 : -1.0,
                                polygonOffsetUnits: isEyeline ? -4.0 : -2.0,
                                side: THREE.DoubleSide
                            });
                        }

                        // 1b. Internal 3D Mouth Cavity (Teeth, Tongue, Cavity Atlas):
                        // Do NOT use polygonOffset (prevents pushing cavity forward through lips/chin)
                        // Use alphaTest: 0.5 with transparent: false to discard compression noise (eliminates dark specks around chin)
                        // Disable shadow casting/receiving to prevent dark internal self-shadowing
                        if (isMouth) {
                            child.castShadow = false;
                            child.receiveShadow = false;
                            child.renderOrder = 0;
                            return new THREE.MeshStandardMaterial({
                                name: mat.name,
                                map: mat.map || null,
                                color: new THREE.Color(0xffffff),
                                emissive: new THREE.Color(0x000000),
                                emissiveIntensity: 0.0,
                                roughness: 0.75,
                                metalness: 0.0,
                                transparent: false,
                                alphaTest: 0.5,
                                depthWrite: true,
                                polygonOffset: false,
                                side: THREE.DoubleSide
                            });
                        }

                        // 2. Anime Eyes: Luminous Iris, Specular Highlight, Crisp Sclera
                        if (isIris || isHighlight || isEyeWhite) {
                            return new THREE.MeshStandardMaterial({
                                name: mat.name,
                                map: mat.map || null,
                                color: mat.color ? mat.color.clone() : new THREE.Color(0xffffff),
                                emissive: isHighlight ? new THREE.Color(0xffffff) : (isIris ? new THREE.Color(0x112233) : new THREE.Color(0x000000)),
                                emissiveIntensity: isHighlight ? 0.35 : 0.05,
                                roughness: isHighlight ? 0.1 : 0.35,
                                metalness: 0.0,
                                transparent: true,
                                alphaTest: (isIris || isHighlight) ? 0.01 : 0.0,
                                depthWrite: false,
                                side: THREE.DoubleSide
                            });
                        }

                        // 3. Delicate Anime Skin: Soft healthy peach complexion, zero emissive blowout, clear contours & natural depth
                        if (isSkin || isFaceSkin) {
                            return new THREE.MeshPhysicalMaterial({
                                name: mat.name,
                                map: mat.map || null,
                                color: mat.map ? new THREE.Color(0xffffff) : new THREE.Color(0xffede4),
                                emissive: new THREE.Color(0x000000),
                                emissiveIntensity: 0.0,
                                roughness: 0.55,
                                metalness: 0.0,
                                transmission: 0.25,
                                thickness: 1.2,
                                ior: 1.4,
                                sheen: 0.8,
                                sheenRoughness: 0.4,
                                sheenColor: new THREE.Color(0xffe4e1),
                                clearcoat: 0.15,
                                clearcoatRoughness: 0.3,
                                transparent: false,
                                depthWrite: true,
                                side: THREE.DoubleSide
                            });
                        }

                        // 4. Refined Dress & Clothing Materials ("chỉn chu hơn" - tailored fabric sheen & crisp pleats)
                        if (isCloth) {
                            return new THREE.MeshPhysicalMaterial({
                                name: mat.name,
                                map: mat.map || null,
                                color: mat.color ? mat.color.clone() : new THREE.Color(0xffffff),
                                emissive: new THREE.Color(0x000000),
                                emissiveIntensity: 0.0,
                                roughness: 0.82,
                                metalness: 0.0,
                                sheen: 0.5,
                                sheenRoughness: 0.5,
                                sheenColor: new THREE.Color(0xffffff),
                                transparent: mat.transparent || false,
                                alphaTest: mat.alphaTest > 0 ? mat.alphaTest : 0.35,
                                depthWrite: true,
                                side: THREE.DoubleSide
                            });
                        }

                        // 5. Stylized Soft Anime Hair (Gentle diffuse with subtle non-glossy sheen)
                        if (isHair) {
                            return new THREE.MeshPhysicalMaterial({
                                name: mat.name,
                                map: mat.map || null,
                                color: mat.color ? mat.color.clone() : new THREE.Color(0xffffff),
                                emissive: new THREE.Color(0x000000),
                                emissiveIntensity: 0.0,
                                roughness: 0.82,
                                metalness: 0.0,
                                sheen: 0.22,
                                sheenRoughness: 0.65,
                                sheenColor: new THREE.Color(0xfff7ed),
                                clearcoat: 0.0,
                                clearcoatRoughness: 0.90,
                                transmission: 0.0,
                                thickness: 0.0,
                                ior: 1.0,
                                transparent: mat.transparent || false,
                                alphaTest: mat.alphaTest > 0 ? mat.alphaTest : 0.45,
                                depthWrite: true,
                                side: THREE.DoubleSide
                            });
                        }

                        return mat.clone();
                    };

                    if (Array.isArray(child.material)) {
                        child.material = child.material.map(m => upgradeMat(m));
                    } else {
                        child.material = upgradeMat(child.material);
                    }
                }
            }
        });
    }

    cloneAnimeModelSafely(sourceModel) {
        const clone = SkeletonUtils.clone(sourceModel);
        const localBones = {};
        clone.traverse(child => {
            if (child.isBone) localBones[child.name] = child;
        });

        clone.traverse(child => {
            if (child.isSkinnedMesh) {
                child.frustumCulled = false;
                if (child.skeleton && child.skeleton.bones) {
                    const cleanBones = child.skeleton.bones.map(b => localBones[b.name] || localBones['J_Bip_C_Hips'] || clone);
                    child.bind(new THREE.Skeleton(cleanBones, child.skeleton.boneInverses), child.bindMatrix);
                }
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material = child.material.map(m => m.clone());
                    } else {
                        child.material = child.material.clone();
                    }
                    const mName = (Array.isArray(child.material) ? child.material[0]?.name : child.material?.name) || '';
                    const cName = child.name || '';
                    const isFacePart = cName.includes('Face') || cName.includes('Eye') || cName.includes('Brow') || cName.includes('Mouth') ||
                                       mName.includes('Face') || mName.includes('Eye') || mName.includes('Brow') || mName.includes('Mouth');
                    const isAccessory = cName.startsWith('accessory_') || cName.startsWith('handheld_item_');

                    // 120 FPS Shadow Optimization: Anime faces & accessories do not cast shadows
                    child.castShadow = !isFacePart && !isAccessory;
                    child.receiveShadow = !isFacePart;

                    if (mName.includes('FaceMouth')) {
                        child.renderOrder = 0;
                        child.castShadow = false;
                        child.receiveShadow = false;
                    }
                    else if (mName.includes('Face_00_SKIN')) child.renderOrder = 0;
                    else if (mName.includes('EyeWhite')) child.renderOrder = 1;
                    else if (mName.includes('EyeIris')) child.renderOrder = 2;
                    else if (mName.includes('EyeHighlight')) child.renderOrder = 3;
                    else if (mName.includes('FaceBrow')) child.renderOrder = 4;
                    else if (mName.includes('FaceEyeline')) child.renderOrder = 5;
                }
            }
        });
        return clone;
    }

    buildClonedAnimeNpcs(sourceModel) {
        const npcDefs = [
            { id: 'lumina', name: 'Lumina', role: 'AI Architect & Researcher', icon: 'zap', x: 6.2, z: -0.5, rotY: Math.PI * 0.95 },
            { id: 'sakura', name: 'Sakura', role: 'Spring Priestess & UI Designer', icon: 'coffee', x: 5.5, z: -6.0, rotY: -0.3 },
            { id: 'ren', name: 'Ren', role: 'Tech Scholar & Systems Hacker', icon: 'lock', x: 8.8, z: -0.5, rotY: Math.PI * 0.95 },
            { id: 'kaede', name: 'Kaede', role: 'Mechanical & Graphics Engineer', icon: 'gauge', x: -1.7, z: -20.2, rotY: Math.PI * 0.25 },
            { id: 'kaito', name: 'Kaito', role: 'Artisan Barista & Coffee Master', icon: 'coffee', x: 26.6, y: 1.04, z: -9.6, rotY: -Math.PI * 0.5 }
        ];

        npcDefs.forEach(def => {
            const npcGroup = new THREE.Group();
            npcGroup.userData.isNpc = true;
            const ny = def.y !== undefined ? def.y : this.getTerrainHeight(def.x, def.z);
            npcGroup.position.set(def.x, ny, def.z);
            npcGroup.rotation.y = def.rotY;

            let npcMesh = null;
            let npcRetargeter = null;
            try {
                npcMesh = this.cloneAnimeModelSafely(sourceModel);
                npcRetargeter = new AvatarRetargeter(npcMesh, { defaultAnim: 'Idle' });
                this.applyNpcCustomStyling(npcMesh, npcRetargeter, def.id);
                npcGroup.add(npcMesh);
            } catch (e) {
                console.warn('[OpenWorld3D] NPC clone fallback:', e);
            }

            // Register with Autonomous NPC Life System
            if (npcRetargeter && this.npcLifeSystem) {
                this.npcLifeSystem.registerNpc(npcGroup, npcRetargeter, def.id);
            }
            if (npcRetargeter && this.groupEmoteSync) {
                this.groupEmoteSync.registerDancer(def.id, npcRetargeter, () => npcGroup.position, true);
            }

            // Subtle Soft Ground Aura
            const auraColor = (
                def.id === 'lumina' ? 0x00f0ff :
                def.id === 'sakura' ? 0xf472b6 :
                def.id === 'ren' ? 0xa855f7 :
                def.id === 'kaede' ? 0x10b981 :
                0xf59e0b
            );
            const ringGeo = new THREE.RingGeometry(0.42, 0.52, 24);
            ringGeo.rotateX(-Math.PI / 2);
            const ring = new THREE.Mesh(
                ringGeo,
                new THREE.MeshBasicMaterial({ color: auraColor, side: THREE.DoubleSide, transparent: true, opacity: 0.32 })
            );
            ring.position.y = 0.03;
            npcGroup.add(ring);

            npcGroup.userData = { id: def.id, name: def.name, ring: ring, retargeter: npcRetargeter };
            this.npcs.push(npcGroup);
            this.scene.add(npcGroup);
        });
    }

    applyNpcCustomStyling(npcMesh, npcRetargeter, npcId) {
        if (!npcMesh) return;

        const PALETTES = {
            lumina: {
                hair: new THREE.Color('#dbeafe'),
                brow: new THREE.Color('#93c5fd'),
                eyes: new THREE.Color('#00f0ff'),
                dress: new THREE.Color('#1e293b'),
                ruffles: new THREE.Color('#cbd5e1'),
                ribbon: new THREE.Color('#00f0ff'),
                shoes: new THREE.Color('#0f172a'),
                shoesTrim: new THREE.Color('#38bdf8')
            },
            sakura: {
                hair: new THREE.Color('#f472b6'),
                brow: new THREE.Color('#fb7185'),
                eyes: new THREE.Color('#fb7185'),
                dress: new THREE.Color('#fce7f3'),
                ruffles: new THREE.Color('#fff1f2'),
                ribbon: new THREE.Color('#f43f5e'),
                shoes: new THREE.Color('#e11d48'),
                shoesTrim: new THREE.Color('#fda4af')
            },
            ren: {
                hair: new THREE.Color('#8b5cf6'),
                brow: new THREE.Color('#7c3aed'),
                eyes: new THREE.Color('#c084fc'),
                dress: new THREE.Color('#1e1b4b'),
                ruffles: new THREE.Color('#312e81'),
                ribbon: new THREE.Color('#a855f7'),
                shoes: new THREE.Color('#18181b'),
                shoesTrim: new THREE.Color('#6366f1')
            },
            kaede: {
                hair: new THREE.Color('#d97706'),
                brow: new THREE.Color('#b45309'),
                eyes: new THREE.Color('#f59e0b'),
                dress: new THREE.Color('#064e3b'),
                ruffles: new THREE.Color('#78350f'),
                ribbon: new THREE.Color('#b45309'),
                shoes: new THREE.Color('#451a03'),
                shoesTrim: new THREE.Color('#92400e')
            },
            kaito: {
                hair: new THREE.Color('#3e2723'),
                brow: new THREE.Color('#271b16'),
                eyes: new THREE.Color('#d97706'),
                dress: new THREE.Color('#1c1917'),
                ruffles: new THREE.Color('#f5f5f4'),
                ribbon: new THREE.Color('#b45309'),
                shoes: new THREE.Color('#292524'),
                shoesTrim: new THREE.Color('#78350f')
            }
        };

        const palette = PALETTES[npcId];
        if (palette) {
            npcMesh.traverse(child => {
                if (child.isMesh && child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(mat => {
                        const name = mat.name || '';
                        if (name.includes('HAIR')) {
                            mat.color.copy(palette.hair);
                        } else if (name.includes('FaceBrow')) {
                            mat.color.copy(palette.brow);
                        } else if (name.includes('EyeIris')) {
                            mat.color.copy(palette.eyes);
                        } else if (name.includes('Onepiece_00_CLOTH_01') || name.includes('Tops_01_CLOTH_01')) {
                            mat.color.copy(palette.dress);
                        } else if (name.includes('CLOTH_02') || name.includes('CLOTH_03')) {
                            mat.color.copy(palette.ruffles);
                        } else if (name.includes('CLOTH_04')) {
                            mat.color.copy(palette.ribbon);
                        } else if (name.includes('Shoes_01_CLOTH_01')) {
                            mat.color.copy(palette.shoes);
                        } else if (name.includes('Shoes_01_CLOTH_02')) {
                            mat.color.copy(palette.shoesTrim);
                        }
                    });
                }
            });
        }

        // Attach distinct 3D anime accessory to Head bone
        const headBone = npcRetargeter?.mappedBones?.Head;
        const targetParent = headBone || npcMesh;
        let accessory = null;

        if (npcId === 'lumina') {
            accessory = this.createLuminaAccessory();
        } else if (npcId === 'sakura') {
            accessory = this.createSakuraAccessory();
        } else if (npcId === 'ren') {
            accessory = this.createRenAccessory();
        } else if (npcId === 'kaede') {
            accessory = this.createKaedeAccessory();
        } else if (npcId === 'kaito') {
            accessory = this.createKaitoAccessory();
        }

        if (accessory && targetParent) {
            targetParent.add(accessory);
        }
    }

    createLuminaAccessory() {
        const group = new THREE.Group();
        group.name = 'accessory_lumina_visor';

        // Ear clip mount on right temple
        const clipGeo = new THREE.BoxGeometry(0.02, 0.04, 0.03);
        const clipMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });
        const clip = new THREE.Mesh(clipGeo, clipMat);
        clip.position.set(0.088, 0.05, 0.04);
        group.add(clip);

        // Curved holographic neon glass visor across forehead/eyes
        const visorGeo = new THREE.CylinderGeometry(0.098, 0.098, 0.028, 24, 1, true, -Math.PI * 0.15, Math.PI * 0.45);
        const visorMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x00f0ff,
            emissiveIntensity: 0.75,
            transparent: true,
            opacity: 0.72,
            roughness: 0.1,
            metalness: 0.3,
            side: THREE.DoubleSide
        });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0.0, 0.048, 0.015);
        group.add(visor);

        // Glowing holographic data diamond on temple
        const diamondGeo = new THREE.OctahedronGeometry(0.016, 0);
        const diamondMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const diamond = new THREE.Mesh(diamondGeo, diamondMat);
        diamond.position.set(0.095, 0.065, 0.045);
        group.add(diamond);

        return group;
    }

    createSakuraAccessory() {
        const group = new THREE.Group();
        group.name = 'accessory_sakura_kanzashi';

        // 5 petals forming delicate sakura blossom kanzashi on left hair
        const flowerGroup = new THREE.Group();
        flowerGroup.position.set(-0.085, 0.085, 0.045);
        flowerGroup.rotation.set(0.2, -0.6, 0.4);

        const petalMat = new THREE.MeshStandardMaterial({
            color: 0xf472b6,
            emissive: 0xfb7185,
            emissiveIntensity: 0.25,
            roughness: 0.5
        });

        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const petal = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.032, 6), petalMat);
            petal.rotation.z = angle + Math.PI / 2;
            petal.position.set(Math.cos(angle) * 0.016, Math.sin(angle) * 0.016, 0);
            flowerGroup.add(petal);
        }

        // Golden central flower core
        const coreMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.4 });
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), coreMat);
        flowerGroup.add(core);

        // Dangling red-gold tassel cord
        const cordMat = new THREE.MeshBasicMaterial({ color: 0xe11d48 });
        const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.05, 4), cordMat);
        cord.position.set(0, -0.032, 0.005);
        flowerGroup.add(cord);
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), coreMat);
        bead.position.set(0, -0.058, 0.005);
        flowerGroup.add(bead);

        group.add(flowerGroup);
        return group;
    }

    createRenAccessory() {
        const group = new THREE.Group();
        group.name = 'accessory_ren_hairclip';

        const clipGroup = new THREE.Group();
        clipGroup.position.set(0.088, 0.08, 0.035);
        clipGroup.rotation.set(-0.2, 0.6, -0.3);

        // Dark obsidian metal barrette
        const barretteMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.9, roughness: 0.2 });
        const barrette = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.045, 0.012), barretteMat);
        clipGroup.add(barrette);

        // Glowing faceted octagonal amethyst violet crystal
        const gemMat = new THREE.MeshStandardMaterial({
            color: 0x8b5cf6,
            emissive: 0xa855f7,
            emissiveIntensity: 0.65,
            roughness: 0.2,
            metalness: 0.1
        });
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.016, 0), gemMat);
        gem.position.set(0.008, 0.0, 0.002);
        clipGroup.add(gem);

        // Silver filigree cross-pin
        const pinMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.055, 6), pinMat);
        pin.rotation.z = Math.PI / 4;
        clipGroup.add(pin);

        group.add(clipGroup);
        return group;
    }

    createKaedeAccessory() {
        const group = new THREE.Group();
        group.name = 'accessory_kaede_goggles';

        const goggleGroup = new THREE.Group();
        goggleGroup.position.set(0.0, 0.088, 0.082);
        goggleGroup.rotation.set(-0.35, 0, 0);

        // Dark brown leather strap around hair
        const strapMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.85 });
        const strap = new THREE.Mesh(new THREE.TorusGeometry(0.098, 0.007, 6, 24, Math.PI), strapMat);
        strap.rotation.x = Math.PI / 2;
        strap.position.set(0, 0, -0.02);
        goggleGroup.add(strap);

        // Steampunk brass eye-pieces with amber lenses
        const brassMat = new THREE.MeshStandardMaterial({
            color: 0xb45309,
            metalness: 0.85,
            roughness: 0.35
        });
        const lensMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.35,
            transparent: true,
            opacity: 0.65,
            roughness: 0.1
        });

        [-0.038, 0.038].forEach(gx => {
            const rim = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.006, 8, 16), brassMat);
            rim.position.set(gx, 0, 0.01);
            goggleGroup.add(rim);

            const lens = new THREE.Mesh(new THREE.CircleGeometry(0.022, 16), lensMat);
            lens.position.set(gx, 0, 0.012);
            goggleGroup.add(lens);
        });

        // Connecting brass bridge
        const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.005, 0.005), brassMat);
        bridge.position.set(0, 0, 0.014);
        goggleGroup.add(bridge);

        group.add(goggleGroup);
        return group;
    }

    createKaitoAccessory() {
        const group = new THREE.Group();
        group.name = 'accessory_kaito_beret';

        const beretGroup = new THREE.Group();
        beretGroup.position.set(0.015, 0.125, -0.01);
        beretGroup.rotation.set(-0.15, 0.12, -0.15); // Slanted stylish barista beret

        // Beret crown
        const beretMat = new THREE.MeshStandardMaterial({
            color: 0x1c1917, // Charcoal barista fabric
            roughness: 0.9,
            metalness: 0.05
        });
        const crownGeo = new THREE.CylinderGeometry(0.108, 0.088, 0.045, 16);
        const crown = new THREE.Mesh(crownGeo, beretMat);
        beretGroup.add(crown);

        // Beret top button
        const button = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), beretMat);
        button.position.set(0, 0.024, 0);
        beretGroup.add(button);

        // Golden Coffee Bean Emblem Pin
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            metalness: 0.85,
            roughness: 0.25,
            emissive: 0xd97706,
            emissiveIntensity: 0.2
        });
        const beanL = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), goldMat);
        beanL.scale.set(0.7, 1.2, 0.7);
        beanL.position.set(0.088, 0.0, 0.035);
        beanL.rotation.set(0.2, 0.4, 0.3);
        beretGroup.add(beanL);

        group.add(beretGroup);
        return group;
    }

    createKatanaAccessory() {
        const group = new THREE.Group();
        group.name = 'accessory_ronin_katana';

        // 1. Obi Sash Mount (Frog & Cinch Loop)
        // Physically fastens to the left waist/hip of the avatar, eliminating any floating air gap
        const mountMat = new THREE.MeshPhysicalMaterial({
            color: 0x1e1b4b, // Dark indigo samurai silk sash / leather frog
            roughness: 0.65,
            metalness: 0.05,
            sheen: 0.4,
            sheenColor: new THREE.Color(0x38bdf8)
        });
        const goldMat = new THREE.MeshPhysicalMaterial({
            color: 0xd97706, // Polished brass fitting
            roughness: 0.18,
            metalness: 0.95,
            clearcoat: 0.5,
            clearcoatRoughness: 0.15
        });
        const cordMat = new THREE.MeshPhysicalMaterial({
            color: 0xe11d48, // Crimson silk sageo cord
            roughness: 0.72,
            metalness: 0.0,
            sheen: 0.8,
            sheenColor: new THREE.Color(0xffa0b0)
        });

        // Obi waist cinch loop bridging from pelvis/waist (-0.07m) out to the scabbard (-0.125m)
        const frogGeo = new THREE.BoxGeometry(0.065, 0.038, 0.045);
        const frog = new THREE.Mesh(frogGeo, mountMat);
        frog.position.set(-0.095, -0.012, 0.005);
        frog.rotation.set(0.12, 0.04, 0.18);
        group.add(frog);

        // Ornate brass Kurigata cord fitting mounted on the exterior waist band
        const kurigataGeo = new THREE.TorusGeometry(0.012, 0.004, 6, 12);
        const kurigata = new THREE.Mesh(kurigataGeo, goldMat);
        kurigata.position.set(-0.122, -0.01, 0.012);
        kurigata.rotation.y = Math.PI / 2;
        group.add(kurigata);

        // Hanging silk Sageo tassel cord dangling gracefully along the hip
        const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.004, 0.14, 6), cordMat);
        tassel.position.set(-0.118, -0.085, 0.008);
        tassel.rotation.z = -0.15;
        group.add(tassel);

        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 6), goldMat);
        bead.position.set(-0.115, -0.16, 0.006);
        group.add(bead);

        // 2. Katana Assembly (Hilt, Guard, Scabbard)
        // Positioned snug against the left hip surface, canted naturally (hilt up-forward, scabbard down-backward)
        const katanaGroup = new THREE.Group();
        katanaGroup.name = 'katana_scabbard_anchor';
        katanaGroup.position.set(-0.125, -0.015, 0.010);
        katanaGroup.rotation.set(0.35, 0.06, 0.18);

        // Lacquered black scabbard (saya) with authentic Japanese urushi clearcoat
        const sayaMat = new THREE.MeshPhysicalMaterial({
            color: 0x18181b,
            roughness: 0.12,
            metalness: 0.10,
            clearcoat: 0.92,
            clearcoatRoughness: 0.08
        });
        const saya = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.011, 0.70, 8), sayaMat);
        saya.position.y = -0.22;
        katanaGroup.add(saya);

        // Golden Kojiri (scabbard end-cap)
        const kojiri = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.008, 0.025, 8), goldMat);
        kojiri.position.y = -0.56;
        katanaGroup.add(kojiri);

        // Golden brass guard (tsuba) resting at waist level
        const tsuba = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.008, 12), goldMat);
        tsuba.position.y = 0.14;
        katanaGroup.add(tsuba);

        // Golden Habaki (blade collar)
        const habaki = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.018, 8), goldMat);
        habaki.position.y = 0.13;
        katanaGroup.add(habaki);

        // Braided cord hilt (tsuka)
        const tsukaMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.8 });
        const tsuka = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.013, 0.22, 8), tsukaMat);
        tsuka.position.y = 0.25;
        katanaGroup.add(tsuka);

        // Pommel (kashira)
        const kashira = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), goldMat);
        kashira.position.y = 0.36;
        katanaGroup.add(kashira);

        // Crimson Sageo cord ring around saya near mouth (koiguchi)
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.017, 0.004, 6, 12), cordMat);
        ring.position.y = 0.08;
        ring.rotation.x = Math.PI / 2;
        katanaGroup.add(ring);

        group.add(katanaGroup);
        return group;
    }

    createKemonoEarsAccessory() {
        const group = new THREE.Group();
        group.name = 'accessory_kemono_ears';

        // Attached to Head bone
        const outerMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75 });
        const innerMat = new THREE.MeshStandardMaterial({ color: 0xfce7f3, roughness: 0.6 });

        [-0.065, 0.065].forEach((ex, idx) => {
            const earGroup = new THREE.Group();
            earGroup.position.set(ex, 0.16, 0.02);
            earGroup.rotation.set(-0.15, 0, idx === 0 ? 0.25 : -0.25);

            const outer = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.085, 4), outerMat);
            outer.rotation.y = Math.PI / 4;
            earGroup.add(outer);

            const inner = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.065, 4), innerMat);
            inner.position.set(0, -0.005, 0.012);
            inner.rotation.y = Math.PI / 4;
            earGroup.add(inner);

            group.add(earGroup);
        });

        return group;
    }

    setPreset(presetId) {
        this.savedPreset = presetId || 'sakura_alice';
        try {
            localStorage.setItem('teleterm_avatar_preset', this.savedPreset);
        } catch (e) {}

        if (!this.playerMesh) return;

        // Ensure player mesh has unique material instances so tinting never affects shared assets
        if (!this.playerMaterialsCloned) {
            this.playerMesh.traverse(child => {
                if (child.isMesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material = child.material.map(m => m.clone());
                    } else {
                        child.material = child.material.clone();
                    }
                }
            });
            this.playerMaterialsCloned = true;
        }

        const PALETTES = {
            sakura_alice: {
                hair: new THREE.Color('#f472b6'),
                brow: new THREE.Color('#fb7185'),
                eyes: new THREE.Color('#fb7185'),
                dress: new THREE.Color('#fce7f3'),
                ruffles: new THREE.Color('#fff1f2'),
                ribbon: new THREE.Color('#f43f5e'),
                shoes: new THREE.Color('#e11d48'),
                shoesTrim: new THREE.Color('#fda4af')
            },
            hacker_hoodie: {
                hair: new THREE.Color('#1e293b'),
                brow: new THREE.Color('#0f172a'),
                eyes: new THREE.Color('#00f0ff'),
                dress: new THREE.Color('#0f172a'),
                ruffles: new THREE.Color('#1e1b4b'),
                ribbon: new THREE.Color('#00f0ff'),
                shoes: new THREE.Color('#0f172a'),
                shoesTrim: new THREE.Color('#38bdf8')
            },
            kimono_ronin: {
                hair: new THREE.Color('#18181b'),
                brow: new THREE.Color('#18181b'),
                eyes: new THREE.Color('#d97706'),
                dress: new THREE.Color('#1e1b4b'),
                ruffles: new THREE.Color('#312e81'),
                ribbon: new THREE.Color('#f8fafc'),
                shoes: new THREE.Color('#3f3f46'),
                shoesTrim: new THREE.Color('#71717a')
            },
            kemono_coder: {
                hair: new THREE.Color('#d97706'),
                brow: new THREE.Color('#b45309'),
                eyes: new THREE.Color('#10b981'),
                dress: new THREE.Color('#fef3c7'),
                ruffles: new THREE.Color('#b45309'),
                ribbon: new THREE.Color('#f59e0b'),
                shoes: new THREE.Color('#78350f'),
                shoesTrim: new THREE.Color('#92400e')
            }
        };

        const palette = PALETTES[this.savedPreset] || PALETTES.sakura_alice;

        // 1. Instant material colors update across playerMesh (0ms latency)
        this.playerMesh.traverse(child => {
            if (child.isMesh && child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(mat => {
                    const name = mat.name || '';
                    if (name.includes('HAIR')) {
                        mat.color.copy(palette.hair);
                    } else if (name.includes('FaceBrow')) {
                        mat.color.copy(palette.brow);
                    } else if (name.includes('EyeIris')) {
                        mat.color.copy(palette.eyes);
                    } else if (name.includes('Onepiece_00_CLOTH_01') || name.includes('Tops_01_CLOTH_01')) {
                        mat.color.copy(palette.dress);
                    } else if (name.includes('CLOTH_02') || name.includes('CLOTH_03')) {
                        mat.color.copy(palette.ruffles);
                    } else if (name.includes('CLOTH_04')) {
                        mat.color.copy(palette.ribbon);
                    } else if (name.includes('Shoes_01_CLOTH_01')) {
                        mat.color.copy(palette.shoes);
                    } else if (name.includes('Shoes_01_CLOTH_02')) {
                        mat.color.copy(palette.shoesTrim);
                    }
                });
            }
        });

        // 2. Remove any previous player accessory
        if (this.playerAccessory) {
            if (this.playerAccessory.parent) {
                this.playerAccessory.parent.remove(this.playerAccessory);
            }
            this.playerAccessory = null;
        }

        // 3. Attach distinct 3D accessory
        const headBone = this.retargeter?.mappedBones?.Head;
        const hipsBone = this.retargeter?.mappedBones?.Hips;

        if (this.savedPreset === 'sakura_alice') {
            this.playerAccessory = this.createSakuraAccessory();
            if (headBone) headBone.add(this.playerAccessory);
            else this.playerMesh.add(this.playerAccessory);
        } else if (this.savedPreset === 'hacker_hoodie') {
            this.playerAccessory = this.createLuminaAccessory();
            if (headBone) headBone.add(this.playerAccessory);
            else this.playerMesh.add(this.playerAccessory);
        } else if (this.savedPreset === 'kimono_ronin') {
            this.playerAccessory = this.createKatanaAccessory();
            if (hipsBone) hipsBone.add(this.playerAccessory);
            else this.playerMesh.add(this.playerAccessory);
        } else if (this.savedPreset === 'kemono_coder') {
            this.playerAccessory = this.createKemonoEarsAccessory();
            if (headBone) headBone.add(this.playerAccessory);
            else this.playerMesh.add(this.playerAccessory);
        }
    }

    createHandheldItemMesh(itemDef) {
        if (!itemDef) return null;
    const group = new THREE.Group();
    group.name = `handheld_item_${itemDef.id}`;

    if (itemDef.id === 'drink_green_tea') {
        const topMat = new THREE.MeshStandardMaterial({
            color: 0xe2e8f0,
            roughness: 0.32,
            metalness: 0.40
        });

        // Authentic Japanese Ocha Can Texture (Emerald green metallic gradient, gold borders, tea kanji)
        const canCanvas = document.createElement('canvas');
        canCanvas.width = 256;
        canCanvas.height = 256;
        const cctx = canCanvas.getContext('2d');

        const cgrad = cctx.createLinearGradient(0, 0, 256, 0);
        cgrad.addColorStop(0.0, '#064e3b');
        cgrad.addColorStop(0.2, '#059669');
        cgrad.addColorStop(0.5, '#10b981');
        cgrad.addColorStop(0.8, '#059669');
        cgrad.addColorStop(1.0, '#064e3b');
        cctx.fillStyle = cgrad;
        cctx.fillRect(0, 0, 256, 256);

        // Gold metallic trim lines
        cctx.fillStyle = '#fbbf24';
        cctx.fillRect(0, 16, 256, 6);
        cctx.fillRect(0, 234, 256, 6);

        // Gold tea seal badge
        cctx.strokeStyle = '#fef3c7';
        cctx.lineWidth = 3;
        cctx.strokeRect(88, 70, 80, 116);
        cctx.fillStyle = '#fef3c7';
        cctx.font = 'bold 38px "Noto Serif JP", serif, sans-serif';
        cctx.textAlign = 'center';
        cctx.textBaseline = 'middle';
        cctx.fillText('お茶', 128, 120);

        cctx.font = 'bold 12px sans-serif';
        cctx.fillText('GREEN TEA', 128, 165);

        const canTex = new THREE.CanvasTexture(canCanvas);
        const canMat = new THREE.MeshStandardMaterial({
            map: canTex,
            roughness: 0.32,
            metalness: 0.45
        });

        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.098, 20), canMat);
        body.position.set(0, 0, 0);
        group.add(body);

        // Silver beveled rim & lid (top of can)
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.0244, 0.024, 0.006, 20), topMat);
        rim.position.set(0, 0.048, 0);
        group.add(rim);

        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.0238, 0.004, 20), topMat);
        lid.position.set(0, 0.051, 0);
        group.add(lid);

        const tab = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.002, 0.013), topMat);
        tab.position.set(0, 0.053, 0.005);
        group.add(tab);

        // Silver bottom rim
        const bottomRim = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.0244, 0.005, 20), topMat);
        bottomRim.position.set(0, -0.048, 0);
        group.add(bottomRim);
    } else if (itemDef.id === 'reward_coffee_mug') {
        const mugMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
        const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.1 });
        const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.022, 0.065, 16), mugMat);
        group.add(mug);
        const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.023, 0.01, 16), coffeeMat);
        coffee.position.y = 0.028;
        group.add(coffee);
    } else if (itemDef.id === 'drink_water_bottle') {
        const bottleMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            roughness: 0.15,
            metalness: 0.1,
            transparent: true,
            opacity: 0.82
        });
        const capMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 16), bottleMat);
        group.add(body);
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.018, 16), capMat);
        cap.position.y = 0.068;
        group.add(cap);
    } else if (itemDef.id === 'item_cyber_phone') {
        const phoneMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2, metalness: 0.8 });
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const phone = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.09, 0.006), phoneMat);
        group.add(phone);
        const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.040, 0.082), screenMat);
        screen.position.z = 0.0032;
        group.add(screen);
    } else if (itemDef.id === 'item_dev_book') {
        const coverMat = new THREE.MeshStandardMaterial({ color: 0x831843, roughness: 0.6 });
        const pageMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.8 });
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.11, 0.02), coverMat);
        group.add(book);
        const pages = new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.106, 0.016), pageMat);
        pages.position.x = 0.003;
        group.add(pages);
    } else if (itemDef.id === 'item_bamboo_rod') {
        const rodMat = new THREE.MeshStandardMaterial({
            color: 0xd97706, // Golden aged bamboo
            roughness: 0.42,
            metalness: 0.10
        });
        const handleMat = new THREE.MeshStandardMaterial({
            color: 0x78350f, // Dark cork handle
            roughness: 0.85,
            metalness: 0.05
        });
        const brassMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b, // Brass reel & guide rings
            roughness: 0.25,
            metalness: 0.85
        });

        // Handle
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.016, 0.32, 10), handleMat);
        handle.position.set(0, 0, 0);
        group.add(handle);

        // Reel Mount
        const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.024, 12), brassMat);
        reel.rotation.z = Math.PI / 2;
        reel.position.set(-0.028, 0.06, 0);
        group.add(reel);

        // Tapered Bamboo Rod Shaft
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.014, 1.95, 10), rodMat);
        shaft.position.set(0, 1.10, 0.05);
        shaft.rotation.x = -0.06;
        group.add(shaft);

        // Rod Tip marker for line attachment
        const tip = new THREE.Object3D();
        tip.name = 'rod_tip_marker';
        tip.position.set(0, 2.05, 0.12);
        group.add(tip);
    } else if (itemDef.id === 'item_golden_rod') {
        const goldMat = new THREE.MeshStandardMaterial({
            color: 0xfbbf24, // Gleaming polished gold
            roughness: 0.18,
            metalness: 0.92
        });
        const handleMat = new THREE.MeshStandardMaterial({
            color: 0x1e1b4b, // Imperial indigo wrapped grip
            roughness: 0.75,
            metalness: 0.10
        });
        const gemMat = new THREE.MeshStandardMaterial({
            color: 0x38bdf8, // Royal sapphire accents
            roughness: 0.10,
            metalness: 0.90
        });

        // Grip handle
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.016, 0.34, 10), handleMat);
        handle.position.set(0, 0, 0);
        group.add(handle);

        // Gold Reel
        const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.026, 12), goldMat);
        reel.rotation.z = Math.PI / 2;
        reel.position.set(-0.028, 0.065, 0);
        group.add(reel);

        const gem = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), gemMat);
        gem.position.set(-0.046, 0.065, 0);
        group.add(gem);

        // Gold Shaft
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.014, 2.05, 10), goldMat);
        shaft.position.set(0, 1.15, 0.05);
        shaft.rotation.x = -0.06;
        group.add(shaft);

        const tip = new THREE.Object3D();
        tip.name = 'rod_tip_marker';
        tip.position.set(0, 2.15, 0.12);
        group.add(tip);
    } else if (itemDef.id === 'item_grilled_fish' || itemDef.id === 'item_burnt_fish' || (itemDef.type === 'raw_fish') || itemDef.id.startsWith('fish_')) {
        const isBurnt = itemDef.id === 'item_burnt_fish';
        const isRaw = itemDef.type === 'raw_fish' || itemDef.id.startsWith('fish_') || itemDef.id.includes('koi') || itemDef.id.includes('salmon');
        
        // Bamboo Skewer
        const skewerMat = new THREE.MeshStandardMaterial({
            color: 0xd97706,
            roughness: 0.85,
            metalness: 0.05
        });
        const skewer = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.004, 0.34, 8), skewerMat);
        skewer.position.set(0, 0.06, 0);
        group.add(skewer);

        // Fish Body
        const fishMat = new THREE.MeshStandardMaterial({
            color: isBurnt ? 0x1c1917 : (isRaw ? 0x0284c7 : 0xb45309), // Crispy golden roast vs raw blue vs burnt charcoal
            roughness: isBurnt ? 0.95 : (isRaw ? 0.35 : 0.60),
            metalness: isRaw ? 0.25 : 0.10
        });

        const fishBody = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.024, 0.15, 8), fishMat);
        fishBody.position.set(0, 0.10, 0);
        fishBody.scale.set(1.4, 1.0, 0.7); // Flattened fish shape
        group.add(fishBody);

        // Tail fin
        const tailGeo = new THREE.ConeGeometry(0.022, 0.045, 4);
        tailGeo.rotateX(Math.PI);
        const tail = new THREE.Mesh(tailGeo, fishMat);
        tail.position.set(0, 0.01, 0);
        tail.scale.set(1.5, 1.0, 0.4);
        group.add(tail);

        // Head cone
        const headGeo = new THREE.ConeGeometry(0.018, 0.042, 6);
        const head = new THREE.Mesh(headGeo, fishMat);
        head.position.set(0, 0.19, 0);
        head.scale.set(1.3, 1.0, 0.7);
        group.add(head);
    } else if (itemDef.id === 'item_onsen_herbal_tea') {
        const bowlMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.3, metalness: 0.2 });
        const teaMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.2 });
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.018, 0.045, 16), bowlMat);
        group.add(bowl);
        const tea = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.005, 16), teaMat);
        tea.position.y = 0.016;
        group.add(tea);
    } else if (itemDef.id === 'item_lofi_boombox') {
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.6 });
        const speakerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.055, 0.028), boxMat);
        group.add(box);
        [-0.025, 0.025].forEach(ox => {
            const spk = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.004, 12), speakerMat);
            spk.rotation.x = Math.PI / 2;
            spk.position.set(ox, 0, 0.015);
            group.add(spk);
        });
    }

        return group;
    }

    equipHandheldItem(itemDef) {
        this.unequipHandheldItem();
        if (!itemDef || !this.retargeter?.mappedBones?.RightHand) return;

        const handBone = this.retargeter.mappedBones.RightHand;
        const group = this.createHandheldItemMesh(itemDef);
        if (!group) return;

        this.equippedItemDef = itemDef;
        this.currentlyEquippedItemDef = itemDef;

        const tip = group.getObjectByName('rod_tip_marker');
        if (tip) {
            this.rodTipObject = tip;
        }

        // Apply item-specific anatomical palm cradle grip socket transform
        const profile = GRIP_PROFILES[itemDef.gripProfile || itemDef.handPose || 'small_can'] || GRIP_PROFILES.small_can;
        if (profile.localPosition) {
            group.position.set(...profile.localPosition);
        }
        if (profile.localRotation) {
            group.rotation.set(...profile.localRotation);
        }
        if (profile.localScale) {
            group.scale.set(...profile.localScale);
        }

        handBone.add(group);
        this.handheldItemMesh = group;

        if (this.retargeter.setHandPose) {
            this.retargeter.setHandPose(itemDef.handPose || itemDef.gripProfile || 'small_can');
        }
    }

    unequipHandheldItem() {
        this.equippedItemDef = null;
        this.currentlyEquippedItemDef = null;
        this.rodTipObject = null;
        if (this.zenFishing) this.zenFishing.cancelFishing();
        if (this.handheldItemMesh) {
            if (this.handheldItemMesh.parent) {
                this.handheldItemMesh.parent.remove(this.handheldItemMesh);
            }
            this.handheldItemMesh = null;
        }
        if (this.retargeter?.setHandPose) {
            this.retargeter.setHandPose('empty_hand');
        }
    }

    triggerDrinkAnimation(onSip, onFinish) {
        if (!this.retargeter) {
            if (onFinish) onFinish();
            return;
        }

        this.retargeter.playDrinkAnimation(
            2.4,
            () => {
                this.playDrinkSound();
                if (onSip) onSip();
            },
            () => {
                if (onFinish) onFinish();
            }
        );
    }

    startDrinkingHold(onSip, onFinish) {
        if (!this.retargeter?.startDrinkingHold) return;
        this.isDrinkingHolding = true;
        this.isPointerDown = false;
        this.retargeter.startDrinkingHold(
            () => {
                this.playDrinkSound();
                if (onSip) onSip();
            },
            () => {
                this.isDrinkingHolding = false;
                if (onFinish) onFinish();
            }
        );
    }

    stopDrinkingHold() {
        this.isDrinkingHolding = false;
        if (this.retargeter?.stopDrinkingHold) {
            this.retargeter.stopDrinkingHold();
        }
    }

    playDrinkSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            if (!this.audioCtx) this.audioCtx = new AudioContext();
            const ctx = this.audioCtx;
            if (ctx.state === 'suspended') ctx.resume();

            const volScale = (window.soundSettings ? window.soundSettings.getEffectivePlayerSoundsVolume() : 1.0);
            const t = ctx.currentTime;
            // 1. Pop / tab seal break
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, t);
            osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);
            oscGain.gain.setValueAtTime(0.12 * volScale, t);
            oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.connect(oscGain);
            oscGain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.09);

            // 2. Soft drink sip / swallow
            const bufferSize = ctx.sampleRate * 0.35;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(800, t + 0.1);
            filter.frequency.exponentialRampToValueAtTime(450, t + 0.4);
            filter.Q.value = 3.0;

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.08 * volScale, t + 0.1);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(t + 0.1);
        } catch (e) {}
    }

    playVendingSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            if (!this.audioCtx) this.audioCtx = new AudioContext();
            const ctx = this.audioCtx;
            if (ctx.state === 'suspended') ctx.resume();

            const volScale = (window.soundSettings ? window.soundSettings.getEffectivePlayerSoundsVolume() : 1.0);
            const t = ctx.currentTime;
            // Mechanical motor buzz
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, t);
            osc.frequency.setValueAtTime(90, t + 0.4);
            oscGain.gain.setValueAtTime(0.10 * volScale, t);
            oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            osc.connect(oscGain);
            oscGain.connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.52);

            // Can drop clatter into metal tray at t + 0.38
            const clatter = ctx.createOscillator();
            const clatterGain = ctx.createGain();
            clatter.type = 'triangle';
            clatter.frequency.setValueAtTime(480, t + 0.38);
            clatter.frequency.exponentialRampToValueAtTime(180, t + 0.6);
            clatterGain.gain.setValueAtTime(0.20 * volScale, t + 0.38);
            clatterGain.gain.exponentialRampToValueAtTime(0.001, t + 0.62);
            clatter.connect(clatterGain);
            clatterGain.connect(ctx.destination);
            clatter.start(t + 0.38);
            clatter.stop(t + 0.63);
        } catch (e) {}
    }

    playBicycleBellSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            if (!this.audioCtx) this.audioCtx = new AudioContext();
            const ctx = this.audioCtx;
            if (ctx.state === 'suspended') ctx.resume();

            const t = ctx.currentTime;
            // High crisp dual-tone vintage bell strike: 2450Hz and 2750Hz with bright harmonics
            [
                { offset: 0.00, freq: 2450, gain: 0.22 },
                { offset: 0.12, freq: 2750, gain: 0.25 }
            ].forEach(strike => {
                const strikeTime = t + strike.offset;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(strike.freq, strikeTime);

                const harmonic = ctx.createOscillator();
                const harmGain = ctx.createGain();
                harmonic.type = 'triangle';
                harmonic.frequency.setValueAtTime(strike.freq * 1.5, strikeTime);

                gain.gain.setValueAtTime(strike.gain, strikeTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.42);

                harmGain.gain.setValueAtTime(strike.gain * 0.35, strikeTime);
                harmGain.gain.exponentialRampToValueAtTime(0.0001, strikeTime + 0.28);

                osc.connect(gain);
                gain.connect(ctx.destination);
                harmonic.connect(harmGain);
                harmGain.connect(ctx.destination);

                osc.start(strikeTime);
                harmonic.start(strikeTime);
                osc.stop(strikeTime + 0.45);
                harmonic.stop(strikeTime + 0.30);
            });
        } catch (e) {}
    }

    toggleThinkingPose() {
        if (this.retargeter) {
            const cur = this.retargeter.getAnimation();
            const next = cur === 'Thinking' ? 'Idle' : 'Thinking';
            this.retargeter.setAnimation(next);
            if (this.onToast) {
                const t = window.TeleTermI18n ? window.TeleTermI18n.t.bind(window.TeleTermI18n) : null;
                const msg = next === 'Thinking' 
                    ? (t ? t('toast_pose_thinking') : 'Status: Contemplating / Deep in Thought')
                    : (t ? t('toast_pose_standing') : 'Status: Natural Standing');
                this.onToast(msg, 'info');
            }
        }
    }

    initNoticeBoardProp() {
        if (!this.interactionManager) return;
        const nbPos = { x: -2.5, y: 0.1, z: 6.5 };
        this.interactionManager.registerAnchor({
            id: 'notice-board-hub',
            type: 'notice_board',
            name: 'Notice Board',
            position: nbPos,
            interactionRadius: 2.8
        });

        // Create stylized anime wooden bulletin board with glowing holographic parchment
        const boardGroup = new THREE.Group();
        const groundY = this.getTerrainHeight(nbPos.x, nbPos.z);
        boardGroup.position.set(nbPos.x, groundY, nbPos.z);
        boardGroup.rotation.y = 0.25;

        // Wooden posts
        const postMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
        const postGeo = new THREE.CylinderGeometry(0.06, 0.07, 1.8, 8);
        const postLeft = new THREE.Mesh(postGeo, postMat);
        postLeft.position.set(-0.65, 0.9, 0);
        const postRight = new THREE.Mesh(postGeo, postMat);
        postRight.position.set(0.65, 0.9, 0);
        boardGroup.add(postLeft, postRight);

        // Wooden board backing
        const boardBackMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });
        const boardBackGeo = new THREE.BoxGeometry(1.5, 0.95, 0.08);
        const boardBack = new THREE.Mesh(boardBackGeo, boardBackMat);
        boardBack.position.set(0, 1.25, 0);
        boardGroup.add(boardBack);

        // Glowing Holo notice canvas
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 256, 160);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4;
        ctx.strokeRect(4, 4, 248, 152);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('// BOUNTIES & QUESTS', 128, 42);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '14px monospace';
        ctx.fillText('[Press E to Inspect]', 128, 76);
        ctx.fillStyle = '#34d399';
        ctx.font = '13px monospace';
        ctx.fillText('Active: 100% Online', 128, 114);

        const noticeTex = new THREE.CanvasTexture(canvas);
        const noticeMat = new THREE.MeshBasicMaterial({ map: noticeTex });
        const noticeMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.82), noticeMat);
        noticeMesh.position.set(0, 1.25, 0.045);
        boardGroup.add(noticeMesh);

        this.scene.add(boardGroup);
    }

    syncNpcQuestMarkers(detail) {
        if (!this.overheadUi) return;
        const { activeQuest, quests } = detail || {};
        if (!quests) return;

        const npcMarkers = { lumina: null, sakura: null, ren: null, kaede: null };
        quests.forEach(q => {
            const giver = (q.giverNpc || '').toLowerCase();
            if (npcMarkers[giver] !== undefined) {
                if (q.status === 'READY_TO_CLAIM') {
                    npcMarkers[giver] = 'claimable';
                } else if (q.status === 'AVAILABLE' && npcMarkers[giver] !== 'claimable') {
                    npcMarkers[giver] = 'available';
                }
            }
        });

        // If current active quest objective involves talking to an NPC:
        if (activeQuest && activeQuest.currentStep?.type === 'talk_npc') {
            const target = (activeQuest.currentStep.target || '').toLowerCase();
            if (npcMarkers[target] !== undefined) {
                npcMarkers[target] = activeQuest.isReadyToClaim ? 'claimable' : 'available';
            }
        }

        Object.entries(npcMarkers).forEach(([npcId, marker]) => {
            this.overheadUi.setQuestMarker(npcId, marker);
        });
    }

    /* =========================================================================
       GRAPHICS QUALITY & MINECRAFT-INSPIRED SHADERS SYSTEM
       ========================================================================= */
    initSunShaderFx() {
        if (this.sunFlareMesh) return;
        // Procedural Volumetric Radiant Sun Flare Billboard in sky (Ghibli God Rays & Corona)
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const rad = ctx.createRadialGradient(256, 256, 12, 256, 256, 248);
        rad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
        rad.addColorStop(0.12, 'rgba(255, 248, 220, 0.98)'); // Radiant anime sun core
        rad.addColorStop(0.28, 'rgba(254, 240, 138, 0.85)'); // Golden Ghibli corona
        rad.addColorStop(0.55, 'rgba(251, 146, 60, 0.35)');  // Warm peach atmospheric dispersion
        rad.addColorStop(0.80, 'rgba(244, 63, 94, 0.10)');   // Subtle sunset hue
        rad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, 512, 512);

        // Add 12 golden cinematic volumetric god-rays
        ctx.lineWidth = 4;
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 6;
            ctx.strokeStyle = (i % 2 === 0) ? 'rgba(254, 240, 138, 0.45)' : 'rgba(255, 255, 255, 0.30)';
            ctx.beginPath();
            ctx.moveTo(256 + Math.cos(angle) * 240, 256 + Math.sin(angle) * 240);
            ctx.lineTo(256 - Math.cos(angle) * 240, 256 - Math.sin(angle) * 240);
            ctx.stroke();
        }

        const tex = new THREE.CanvasTexture(canvas);
        const geo = new THREE.PlaneGeometry(85, 85);
        const mat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        this.sunFlareMesh = new THREE.Mesh(geo, mat);
        this.sunFlareMesh.position.set(45, 30, -55).normalize().multiplyScalar(280);
        this.sunFlareMesh.visible = (this.graphicsSettings?.shaderMode === 'enhanced');
        this.scene.add(this.sunFlareMesh);

        this._sunCamDir = new THREE.Vector3();
        this._sunToDir = new THREE.Vector3();
    }

    updateSunShaderFx() {
        if (!this.sunFlareMesh || !this.camera) return;
        this.sunFlareMesh.quaternion.copy(this.camera.quaternion);

        // Sun direction from camera (zero allocations)
        this._sunToDir.copy(this.sunFlareMesh.position).sub(this.camera.position).normalize();
        this.camera.getWorldDirection(this._sunCamDir);
        const dot = this._sunCamDir.dot(this._sunToDir);

        if (dot > 0.25) {
            const time = performance.now() / 1000;
            const shimmer = Math.sin(time * 2.2) * 0.08;
            const focus = THREE.MathUtils.clamp((dot - 0.25) / 0.65, 0.0, 1.0);
            this.sunFlareMesh.material.opacity = THREE.MathUtils.clamp(0.65 + shimmer + focus * 0.32, 0.0, 1.0);
            this.sunFlareMesh.scale.setScalar(1.0 + focus * 0.35);
        } else {
            this.sunFlareMesh.material.opacity = 0.5;
            this.sunFlareMesh.scale.setScalar(1.0);
        }
    }

    initPostProcessing() {
        if (this.isMobileDevice && this.graphicsSettings?.platform === 'mobile') {
            console.log('[CinematicPostProcessing] Native mobile profile active, bypassing composer passes.');
            return;
        }

        import('./world/cinematic-post-processing.js')
            .then(({ CinematicPostProcessing }) => {
                this.postProcessing = new CinematicPostProcessing(this.renderer, this.scene, this.camera);
                const preset = (this.graphicsSettings?.platform === 'mobile') ? 'low' : (this.graphicsSettings?.preset || 'high');
                this.postProcessing.setQualityPreset(preset);
                console.log('[CinematicPostProcessing] Pipeline initialized with preset:', preset);
            })
            .catch(err => {
                console.warn('[CinematicPostProcessing] Failed to load module, continuing with standard renderer:', err);
            });
    }

    applyGraphicsSettings(settings) {
        if (!settings) return;
        this.graphicsSettings = { ...this.graphicsSettings, ...settings };
        this.updatePcMaxEnvironmentMaterials();

        if (this.postProcessing && (settings.preset || settings.platform)) {
            const effectivePreset = (settings.platform === 'mobile') ? 'low' : (settings.preset || 'high');
            this.postProcessing.setQualityPreset(effectivePreset);
        }

        // Synchronize hardware platform profile with PerformanceManager and RiceFieldSystem
        if (settings.platform) {
            if (this.performanceManager) {
                this.performanceManager.applyProfile(settings.platform, false);
            }
            if (this.worldComposition?.riceFieldSystem?.setFoliageProfile) {
                this.worldComposition.riceFieldSystem.setFoliageProfile(settings.platform);
            }
        }

        // 1. Resolution Scale (DPR)
        if (this.renderer && settings.dpr !== undefined) {
            this.renderer.setPixelRatio(settings.dpr);
            const isForceLandscape = document.body.classList.contains('force-landscape') && window.innerWidth < window.innerHeight;
            const width = isForceLandscape ? window.innerHeight : window.innerWidth;
            const height = isForceLandscape ? window.innerWidth : window.innerHeight;
            this.renderer.setSize(width, height, false);
        }

        // 2. Anti-Aliasing (Khử răng cưa & canvas rendering quality)
        if (this.canvas) {
            this.canvas.style.imageRendering = 'auto';
        }

        // 3. Shadow Quality (Off, 512 Basic, 1024 PCF, 2048 PCF Soft)
        if (this.renderer) {
            const weatherSys = this.worldComposition?.weatherSystem || this.worldComposition?.weather;
            if (settings.shadowQuality === 'off') {
                this.renderer.shadowMap.enabled = false;
                if (weatherSys?.sunLight) {
                    weatherSys.sunLight.castShadow = false;
                }
            } else {
                this.renderer.shadowMap.enabled = true;
                const size = parseInt(settings.shadowQuality, 10) || 512;
                if (size >= 1024) {
                    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                } else {
                    this.renderer.shadowMap.type = THREE.PCFShadowMap;
                }

                if (weatherSys?.sunLight) {
                    const sl = weatherSys.sunLight;
                    sl.castShadow = true;
                    sl.shadow.mapSize.width = size;
                    sl.shadow.mapSize.height = size;
                    const d = 34;
                    sl.shadow.camera.near = 1.0;
                    sl.shadow.camera.far = 95;
                    sl.shadow.camera.left = -d;
                    sl.shadow.camera.right = d;
                    sl.shadow.camera.top = d;
                    sl.shadow.camera.bottom = -d;
                    sl.shadow.bias = -0.00012;
                    sl.shadow.normalBias = 0.030;
                    if (sl.shadow.map) {
                        sl.shadow.map.dispose();
                        sl.shadow.map = null;
                    }
                }
            }
            this.renderer.shadowMap.needsUpdate = true;
        }

        // 4. Model Smoothing & Anisotropy
        const anisotropy = (settings.modelSmoothing === 'high')
            ? Math.min(16, this.renderer ? this.renderer.capabilities.getMaxAnisotropy() : 8)
            : Math.min(4, this.renderer ? this.renderer.capabilities.getMaxAnisotropy() : 2);

        const updateModelTextures = (model) => {
            if (!model) return;
            model.traverse(child => {
                if (child.isMesh && child.material) {
                    const mats = Array.isArray(child.material) ? child.material : [child.material];
                    mats.forEach(mat => {
                        if (mat.map) {
                            mat.map.generateMipmaps = true;
                            mat.map.minFilter = THREE.LinearMipmapLinearFilter;
                            mat.map.magFilter = THREE.LinearFilter;
                            mat.map.anisotropy = anisotropy;
                            mat.map.needsUpdate = true;
                        }
                        if (settings.modelSmoothing === 'high') {
                            if (mat.roughness !== undefined) {
                                mat.roughness = Math.min(mat.roughness, 0.74);
                            }
                        }
                    });
                }
            });
        };
        if (this.playerMesh) updateModelTextures(this.playerMesh);
        if (this.npcs) this.npcs.forEach(npc => updateModelTextures(npc));

        // 5. Shader Mode (Vanilla Stylized vs Enhanced Anime Shader)
        this.setShaderMode(settings.shaderMode || 'vanilla');

        // 6. Frame Rate Cap / Tiết kiệm pin
        this.fpsCap = settings.fpsCap !== undefined ? settings.fpsCap : 60;

        // 7. Smart Nametag culling mode
        if (this.overheadUi && settings.nametags) {
            this.overheadUi.setNametagMode(settings.nametags);
        }

        // 8. Environmental Time of Day Mode (auto cycle vs locked hour)
        if (settings.timeOfDayMode !== undefined) {
            const todSystem = this.worldComposition?.timeOfDay || window.timeOfDaySystem;
            if (todSystem) {
                if (!settings.timeOfDayMode || settings.timeOfDayMode === 'auto') {
                    todSystem.lockTime(null);
                } else {
                    const parts = String(settings.timeOfDayMode).split(':');
                    const h = parseFloat(parts[0]) || 0;
                    const m = parseFloat(parts[1]) || 0;
                    todSystem.lockTime(h + m / 60);
                }
            }
        }
    }

    updatePcMaxEnvironmentMaterials() {
        const enabled = this.graphicsSettings?.platform === 'pc' && (this.graphicsSettings?.preset === 'max' || this.graphicsSettings?.preset === 'high');
        if (!enabled) {
            this.pcMaxMaterialEnhancer?.setEnabled(false);
            return;
        }

        if (this.pcMaxMaterialEnhancer) {
            this.pcMaxMaterialEnhancer.setEnabled(true);
            return;
        }

        this.pcMaxMaterialEnhancerLoad ||= import('./world/pc-max-materials.js?v=37')
            .then(({ PcMaxMaterialEnhancer }) => {
                this.pcMaxMaterialEnhancer ||= new PcMaxMaterialEnhancer(this.scene);
                const stillEnabled = this.graphicsSettings?.platform === 'pc' && (this.graphicsSettings?.preset === 'max' || this.graphicsSettings?.preset === 'high');
                this.pcMaxMaterialEnhancer.setEnabled(stillEnabled);
            })
            .catch((error) => console.warn('[PC Max] Could not load environment material upgrade:', error));
    }

    setShaderMode(mode) {
        const isEnhanced = (mode === 'enhanced');

        // Sun corona, god rays & bloom
        if (this.sunFlareMesh) {
            this.sunFlareMesh.visible = isEnhanced;
        }

        // Tone Mapping Exposure & Warmth - Perfectly balanced anime daylight, crisp and gentle on the eyes
        if (this.renderer) {
            this.renderer.toneMappingExposure = isEnhanced ? 1.08 : 1.00;
        }

        // Camera-mounted soft avatar fill light
        if (this.avatarFrontLight) {
            this.avatarFrontLight.intensity = isEnhanced ? 0.28 : 0.18;
        }

        // Water System: Specular glint & caustics shimmer
        const ws = this.worldComposition?.waterSystem || this.worldComposition?.water;
        if (ws) {
            if (ws.waterMat) {
                ws.waterMat.roughness = isEnhanced ? 0.015 : 0.04;
                ws.waterMat.metalness = isEnhanced ? 0.42 : 0.18;
                ws.waterMat.bumpScale = isEnhanced ? 0.026 : 0.012;
            }
            if (ws.streamMat) {
                ws.streamMat.roughness = isEnhanced ? 0.015 : 0.05;
                ws.streamMat.metalness = isEnhanced ? 0.45 : 0.22;
                ws.streamMat.bumpScale = isEnhanced ? 0.028 : 0.014;
            }
            if (ws.paddyWaterMat) {
                ws.paddyWaterMat.roughness = isEnhanced ? 0.025 : 0.06;
                ws.paddyWaterMat.metalness = isEnhanced ? 0.35 : 0.15;
            }
        }

        // Atmosphere System: Warm anime rim lighting on characters and trees
        const as = this.worldComposition?.atmosphereSystem || this.worldComposition?.atmosphere;
        if (as) {
            if (as.rimLight) {
                as.rimLight.intensity = isEnhanced ? 1.15 : 0.65;
                as.rimLight.color.setHex(0xfff1e6); // Radiant warm golden anime rim
            }
            if (as.sunLight) {
                as.sunLight.intensity = isEnhanced ? 0.65 : 0.45;
            }
        }

        // Ghibli Atmospheric Depth Fog (Soft horizon haze)
        if (this.scene) {
            if (isEnhanced) {
                this.scene.fog = new THREE.FogExp2(0xb8d5f4, 0.0022);
            } else {
                this.scene.fog = null;
            }
        }
    }

    optimizeSceneTexturesForGpu() {
        if (!this.renderer || !this.scene) return;
        const profile = this.performanceManager?.activeProfile || 'pc';
        const maxAnisotropy = this.renderer.capabilities?.getMaxAnisotropy?.() || 1;
        const targetAnisotropy = (profile === 'pc')
            ? Math.min(maxAnisotropy, 16)
            : (profile === 'web' ? Math.min(maxAnisotropy, 4) : Math.min(maxAnisotropy, 2));
        let count = 0;

        const isPowerOfTwo = (image) => {
            if (!image || !image.width || !image.height) return true;
            return (image.width & (image.width - 1)) === 0 && (image.height & (image.height - 1)) === 0;
        };

        this.scene.traverse((obj) => {
            if (obj.material) {
                const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                mats.forEach(mat => {
                    ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'alphaMap', 'bumpMap'].forEach(slot => {
                        if (mat[slot] && mat[slot].isTexture && mat[slot].anisotropy !== targetAnisotropy) {
                            mat[slot].anisotropy = targetAnisotropy;
                            if (mat[slot].image && isPowerOfTwo(mat[slot].image)) {
                                mat[slot].generateMipmaps = true;
                            }
                            mat[slot].needsUpdate = true;
                            count++;
                        }
                    });
                });
            }
        });
        console.log(`[GPU Optimization] Applied ${targetAnisotropy}x hardware anisotropic filtering to ${count} scene textures (${profile.toUpperCase()} profile).`);
    }

    setTheme(theme) {
        if (!this.scene) return;
        const isLight = (theme === 'light');

        // Calibrate tone mapping exposure & atmospheric lighting
        if (this.renderer) {
            this.renderer.toneMappingExposure = isLight ? 1.05 : 1.00;
        }

        const atmos = this.worldComposition?.atmosphereSystem || this.worldComposition?.atmosphere;
        if (atmos) {
            if (isLight) {
                // Claude Paper Cream: Pristine, warm, bright anime daytime
                if (atmos.sunLight) {
                    atmos.sunLight.color.setHex(0xfff8ee);
                    atmos.sunLight.intensity = 1.30;
                }
                if (atmos.hemiLight) {
                    atmos.hemiLight.color.setHex(0xe8f0fe);
                    atmos.hemiLight.groundColor.setHex(0x86efac);
                    atmos.hemiLight.intensity = 0.68;
                }
                if (this.scene.fog) {
                    this.scene.fog.color.setHex(0xdbeafe);
                }
            } else {
                // Claude Obsidian: Calming warm twilight / evening ambience
                if (atmos.sunLight) {
                    atmos.sunLight.color.setHex(0xffd7a8);
                    atmos.sunLight.intensity = 1.15;
                }
                if (atmos.hemiLight) {
                    atmos.hemiLight.color.setHex(0xa5b4fc);
                    atmos.hemiLight.groundColor.setHex(0x1e293b);
                    atmos.hemiLight.intensity = 0.55;
                }
                if (this.scene.fog) {
                    this.scene.fog.color.setHex(0x1e1b4b);
                }
            }
        }
        console.log(`[OpenWorld3D] Theme calibrated to: ${theme}`);
    }

    /* =========================================================================
       SEATING & INTERACTIVE ANCHORS
       ========================================================================= */
    sitDown(anchor) {
        if (this.isSitting) return;
        if (!anchor) return;
        if (!this.interactionManager.claimAnchor(anchor.id, 'player', this.player.position)) {
            if (this.onToast) {
                const t = window.TeleTermI18n ? window.TeleTermI18n.t.bind(window.TeleTermI18n) : null;
                this.onToast(t ? t('toast_seat_occupied') : 'This seat is currently occupied!', 'warning');
            }
            return;
        }
        this.isSitting = true;
        this.currentSeatAnchor = anchor;

        // Align player smoothly onto assigned seat slot (supports 2-seater side-by-side seating)
        const seatPos = this.interactionManager.getSeatSlotPosition(anchor.id, 'player', this.player.position) || anchor.position;
        this.player.position.x = seatPos.x;
        this.player.position.z = seatPos.z;
        const ty = seatPos.y !== undefined ? seatPos.y : this.getTerrainHeight(seatPos.x, seatPos.z);
        this.player.position.y = ty;
        this.player.rotation.y = anchor.rotationY || 0;

        if (this.playerContactShadow) {
            this.playerContactShadow.position.set(seatPos.x, ty + 0.02, seatPos.z);
        }

        if (this.retargeter) {
            if (this.retargeter.setSeatConfig) {
                this.retargeter.setSeatConfig(anchor);
            }
            this.retargeter.setAnimation(anchor.defaultAnim || 'SitIdle');
        }

        // Dynamic katana pose adjustment when seated (rests gently along chair side)
        if (this.playerAccessory && this.playerAccessory.name === 'accessory_ronin_katana') {
            const anchorK = this.playerAccessory.getObjectByName('katana_scabbard_anchor');
            if (anchorK) {
                anchorK.rotation.x = 0.58;
                anchorK.position.z = -0.015;
            }
        }

        if (this.onToast) {
            const t = window.TeleTermI18n ? window.TeleTermI18n.t.bind(window.TeleTermI18n) : null;
            const anchorLabel = (t && anchor.labelKey) ? t(anchor.labelKey) : anchor.label;
            this.onToast(t ? t('toast_seated', { label: anchorLabel }) : `Seated: ${anchorLabel}`, 'info');
        }

        window.dispatchEvent(new CustomEvent('teleterm:sit-down', {
            detail: { category: anchor.category, anchorId: anchor.id }
        }));
    }

    loadCustomModel(modelUrl) {
        if (!modelUrl) return;
        const loader = new GLTFLoader();
        loader.load(
            modelUrl,
            (gltf) => {
                const newModel = gltf.scene;
                const inspection = HumanoidContract.mapSkeleton(newModel);
                console.log('[OpenWorld3D] Custom model inspection:', inspection);

                if (!inspection.isCompatible) {
                    if (this.onToast) {
                        const t = window.TeleTermI18n ? window.TeleTermI18n.t.bind(window.TeleTermI18n) : null;
                        this.onToast(t ? t('toast_model_incompatible') : 'Model incompatible with Humanoid bone structure!', 'warning');
                    }
                    return;
                }

                if (this.playerMesh) {
                    this.player.remove(this.playerMesh);
                }

                const box = new THREE.Box3().setFromObject(newModel);
                const size = box.getSize(new THREE.Vector3());
                const targetHeight = 1.68;
                const scale = targetHeight / (size.y || 1);
                newModel.scale.set(scale, scale, scale);

                this.upgradeAnimeMaterials(newModel);

                newModel.position.y = 0;
                this.playerMesh = newModel;
                this.playerMesh.userData ||= {};
                this.playerMesh.userData.isAvatar = true;
                this.characterMeshMaster = newModel;
                this.player.add(newModel);

                if (window.multiplayerClient && typeof window.multiplayerClient.onMasterMeshLoaded === 'function') {
                    window.multiplayerClient.onMasterMeshLoaded(newModel);
                }

                const curAnim = this.isSitting ? (this.currentSeatAnchor?.defaultAnim || 'SitIdle') : (this.retargeter ? this.retargeter.getAnimation() : 'Idle');
                this.retargeter = new AvatarRetargeter(newModel, { defaultAnim: curAnim });
                this.kinematics = this.retargeter;
                this.setupFootstepAudio();
                if (this.overheadUi && this.retargeter.mappedBones?.Head) {
                    this.overheadUi.setHeadBone('player', this.retargeter.mappedBones.Head);
                }
                this.applyGraphicsSettings(this.graphicsSettings);

                if (this.onToast) {
                    const t = window.TeleTermI18n ? window.TeleTermI18n.t.bind(window.TeleTermI18n) : null;
                    this.onToast(t ? t('toast_avatar_loaded', { status: inspection.status }) : `Custom avatar loaded (${inspection.status})!`, 'info');
                }
            },
            undefined,
            (err) => {
                console.error('[OpenWorld3D] GLTF custom model load error:', err);
                if (this.onToast) {
                    const t = window.TeleTermI18n ? window.TeleTermI18n.t.bind(window.TeleTermI18n) : null;
                    this.onToast(t ? t('toast_model_error') : 'Error loading 3D model.', 'error');
                }
            }
        );
    }

    standUp() {
        if (!this.isSitting) return;
        if (this.currentSeatAnchor) {
            if (this.currentSeatAnchor.category === 'bench') {
                const rotY = this.currentSeatAnchor.rotationY || 0;
                this.player.position.x += Math.sin(rotY) * 0.65;
                this.player.position.z += Math.cos(rotY) * 0.65;
                this.player.position.y = this.getTerrainHeight(this.player.position.x, this.player.position.z);
            } else if (this.currentSeatAnchor.exitOffset) {
                this.player.position.x += this.currentSeatAnchor.exitOffset.x || 0;
                this.player.position.z += this.currentSeatAnchor.exitOffset.z || 0;
                this.player.position.y = this.getTerrainHeight(this.player.position.x, this.player.position.z);
            }
            this.interactionManager.releaseAnchor(this.currentSeatAnchor.id, 'player');
        }
        this.isSitting = false;
        this.currentSeatAnchor = null;
        this.isCinematicCamera = false;
        this.jumpState = 'GROUNDED';
        this.verticalVelocity = 0;
        this.isGrounded = true;
        this.keys.jump = false;
        this.jumpConsumed = false;
        this.jumpBufferTimer = 0;
        if (this.retargeter) {
            if (this.retargeter.setSeatConfig) {
                this.retargeter.setSeatConfig(null);
            }
            if (this.retargeter.setJumpState) {
                this.retargeter.setJumpState('GROUNDED', 0, 0);
            }
            this.retargeter.setAnimation('Idle');
        }

        // Restore upright standing katana pose
        if (this.playerAccessory && this.playerAccessory.name === 'accessory_ronin_katana') {
            const anchorK = this.playerAccessory.getObjectByName('katana_scabbard_anchor');
            if (anchorK) {
                anchorK.rotation.x = 0.35;
                anchorK.position.z = 0.010;
            }
        }
    }

    handleInteractAction() {
        if (this.isSitting) {
            this.standUp();
            return;
        }
        if (this.activeInteractTarget && typeof this.activeInteractTarget.action === 'function') {
            this.activeInteractTarget.action();
            return;
        }
        if (this.worldComposition?.toriiWarp?.nearbyShrine) {
            this.worldComposition.toriiWarp.openWarpModal();
            return;
        }
        if (this.nearbyAnchor) {
            if (this.nearbyAnchor.type === 'seat') {
                this.sitDown(this.nearbyAnchor);
            } else if (this.nearbyAnchor.type === 'terminal_kiosk') {
                if (this.onToggleUi) this.onToggleUi();
                const t = window.TeleTermI18n ? window.TeleTermI18n.t.bind(window.TeleTermI18n) : null;
                this.onToast(t ? t('toast_terminal_opened') : 'Opened public Hologram Terminal!', 'info');
            } else if (this.nearbyAnchor.type === 'vending_machine') {
                this.playVendingSound();
                if (window.playerInventory) {
                    const added = window.playerInventory.addItem({
                        id: 'drink_green_tea',
                        name: 'Iced Green Tea Can',
                        vi: 'Lon Trà Xanh Lạnh',
                        icon: 'coffee',
                        type: 'consumable',
                        holdable: true,
                        handPose: 'small_can',
                        useAnimation: 'DrinkCan',
                        useSound: 'drink_soft',
                        model: 'can_green_tea'
                    });
                    if (added) {
                        const t = window.TeleTermI18n ? window.TeleTermI18n.t.bind(window.TeleTermI18n) : null;
                        this.onToast(t ? t('toast_vending_purchased') : 'Retrieved an iced green tea from the vending machine!', 'success');
                    }
                } else {
                    const t = window.TeleTermI18n ? window.TeleTermI18n.t.bind(window.TeleTermI18n) : null;
                    this.onToast(t ? t('toast_vending_drink') : 'Retrieved an iced green tea from the vending machine!', 'info');
                }
            }
            return;
        }
        if (this.nearbyNpc && this.onNpcInteract) {
            this.onNpcInteract(this.nearbyNpc.userData.id);
        }
    }

    /* =========================================================================
       INPUT & CONTROLS
       ========================================================================= */
    bindInputEvents() {
        // Ensure 3D viewport canvas can capture DOM focus cleanly
        this.canvas.setAttribute('tabindex', '0');

        const focusWorldCanvas = () => {
            if (document.activeElement && document.activeElement !== this.canvas && document.activeElement !== document.body) {
                try { document.activeElement.blur(); } catch (e) {}
            }
            try { this.canvas.focus(); } catch (e) {}
        };

        // Prevent browser context menu on 3D canvas
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        this.isDrinkingHolding = false;

        // Desktop Mouse Drag Orbit Controls & Hold-to-Drink RMB Routing (Sections 11 & 12)
        this.canvas.addEventListener('mousedown', (e) => {
            focusWorldCanvas();

            const isExplore = document.body.classList.contains('mode-explore');
            const equippedItem = window.playerInventory?.getEquippedItem() || this.equippedItemDef;
            const isUsableItem = equippedItem && (equippedItem.type === 'consumable' || equippedItem.useAnimation === 'DrinkCan' || equippedItem.useAnimation === 'Coffee');

            if (e.button === 2 && isExplore && isUsableItem) {
                // RMB on usable item: capture button exclusively for item use! (Section 12)
                e.preventDefault();
                e.stopPropagation();
                this.isDrinkingHolding = true;
                this.isPointerDown = false; // SUPPRESS camera orbiting during item drinking

                if (this.retargeter?.startDrinkingHold) {
                    this.retargeter.startDrinkingHold(
                        () => {
                            // On mouth alignment / sip moment
                            this.playDrinkSound();
                            window.dispatchEvent(new CustomEvent('teleterm:drink-item', {
                                detail: { itemId: equippedItem.id }
                            }));
                        },
                        () => {
                            // On drinking held completed (>= 2.6s): item consumed!
                            this.isDrinkingHolding = false;
                            window.dispatchEvent(new CustomEvent('teleterm:drink-item', {
                                detail: { itemId: equippedItem.id }
                            }));
                            const slot = window.playerInventory?.equippedSlot;
                            if (slot !== null && slot !== undefined) {
                                const i18n = window.TeleTermI18n;
                                const isVi = i18n && i18n.getLanguage() === 'vi';
                                const itemName = isVi ? (equippedItem.vi || equippedItem.name) : equippedItem.name;
                                const toastMsg = isVi ? `Đã uống xong ${itemName}! Thật sảng khoái!` : `Refreshed! You finished drinking ${itemName}.`;
                                window.playerInventory.removeItem(slot);
                                if (this.onToast) this.onToast(toastMsg, 'success');
                            }
                        }
                    );
                }
                return;
            }

            if (isExplore && equippedItem?.id === 'item_bamboo_rod') {
                if (e.button === 0) {
                    // Left click with bamboo rod: Cast or Strike/Reel
                    e.preventDefault();
                    if (this.zenFishing) {
                        if (this.zenFishing.state === 'BITE') {
                            this.zenFishing.reelFish(true);
                        } else if (this.zenFishing.state === 'IDLE') {
                            this.zenFishing.castLine(this.player.position, this.player.rotation.y);
                        } else {
                            this.zenFishing.cancelFishing();
                        }
                    }
                    return;
                } else if (e.button === 2) {
                    // Right click with bamboo rod: Open Fish Dex encyclopedia
                    e.preventDefault();
                    e.stopPropagation();
                    this.fishDexModal?.toggle();
                    return;
                }
            }

            // Normal left-click / orbit behavior
            this.isPointerDown = true;
            this.previousPointer.x = e.clientX;
            this.previousPointer.y = e.clientY;
        });

        this.canvas.addEventListener('pointerdown', () => {
            focusWorldCanvas();
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isPointerDown || this.isDrinkingHolding) return;
            const deltaX = e.clientX - this.previousPointer.x;
            const deltaY = e.clientY - this.previousPointer.y;

            const sensX = this.mouseSensitivity || 0.005;
            const sensY = (this.mouseSensitivity ? this.mouseSensitivity * 0.8 : 0.004) * (this.invertY ? -1 : 1);

            this.targetCameraRotation.yaw -= deltaX * sensX;
            this.targetCameraRotation.pitch = Math.max(-0.22, Math.min(0.52, this.targetCameraRotation.pitch + deltaY * sensY));

            this.previousPointer.x = e.clientX;
            this.previousPointer.y = e.clientY;
        });

        // Live Reactive Universal Settings Listener
        window.addEventListener('teleterm:setting-changed', (e) => {
            const { category, key, value } = e.detail || {};
            if (category === 'controls') {
                if (key === 'mouseSensitivity') this.mouseSensitivity = parseFloat(value);
                if (key === 'invertY') this.invertY = Boolean(value);
                if (key === 'cameraFov' && this.camera) {
                    const fov = parseInt(value, 10);
                    if (fov >= 50 && fov <= 110) {
                        this.camera.fov = fov;
                        this.camera.updateProjectionMatrix();
                    }
                }
                if (key === 'cameraDistance') {
                    this.targetCameraDistance = parseFloat(value);
                }
            }
            if (category === 'gameui') {
                if (key === 'inworldHolograms' && this.inworldHologramSystem) {
                    this.inworldHologramSystem.setEnabled(Boolean(value));
                }
                if (key === 'showMinimap' && this.minimapRadarSystem) {
                    this.minimapRadarSystem.setVisible(Boolean(value));
                }
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 2 && this.isDrinkingHolding) {
                this.isDrinkingHolding = false;
                if (this.retargeter?.stopDrinkingHold) {
                    this.retargeter.stopDrinkingHold();
                }
            }
            this.isPointerDown = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.targetCameraDistance = Math.max(2.6, Math.min(10.0, this.targetCameraDistance + e.deltaY * 0.005));
        }, { passive: false });

        // Prevent iOS Safari multi-touch browser gesture zoom
        ['gesturestart', 'gesturechange', 'gestureend'].forEach(evt => {
            window.addEventListener(evt, (e) => e.preventDefault(), { passive: false });
            document.addEventListener(evt, (e) => e.preventDefault(), { passive: false });
        });

        // Touch Orbit & Pinch Zoom (Strict separation of joystick thumb vs camera orbit vs pinch zoom)
        window.addEventListener('touchstart', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const target = touch.target;

                if (target && (
                    target.tagName === 'BUTTON' ||
                    target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.tagName === 'SELECT' ||
                    target.tagName === 'A' ||
                    target.closest('button') ||
                    target.closest('a') ||
                    target.closest('input') ||
                    target.closest('textarea') ||
                    target.closest('select') ||
                    target.closest('#virtual-joystick-zone') || 
                    target.closest('.mobile-rpg-actions') || 
                    target.closest('.cyber-top-nav') || 
                    target.closest('#deck-terminal-screen') || 
                    target.closest('.cyber-thumb-deck') ||
                    target.closest('.thumb-scroll-track') ||
                    target.closest('.t-btn') ||
                    target.closest('#mmo-chat-container') ||
                    target.closest('.mmo-chat-container') ||
                    target.closest('.floating-chat-pill') ||
                    target.closest('#btn-floating-chat-open') ||
                    target.closest('#lofi-vibe-panel') ||
                    target.closest('.lofi-vibe-panel') ||
                    target.closest('.btn-toggle-terminal') ||
                    target.closest('.world-interact-prompt') ||
                    target.closest('.anime-dialogue-card') ||
                    target.closest('.anime-dialogue-overlay') ||
                    target.closest('.vn-overlay') ||
                    target.closest('.vn-card-wrap') ||
                    target.closest('.radial-emote-overlay') ||
                    target.closest('#hud-sessions-deck') ||
                    target.closest('#top-xp-hud-capsule') ||
                    target.closest('.tools-drawer') ||
                    target.closest('#tools-drawer-overlay') ||
                    target.closest('.cyber-modal-overlay') ||
                    target.closest('.cyber-modal-card') ||
                    target.closest('.modal') ||
                    target.closest('.dialog') ||
                    target.closest('.modal-backdrop') ||
                    target.closest('.mobile-tools-drawer-overlay') ||
                    target.closest('.mobile-tools-drawer-sheet') ||
                    target.closest('#modal-mobile-full-tools') ||
                    target.closest('.mob-tool-tile') ||
                    target.closest('[data-mob-action]') ||
                    target.closest('.nav-tab-btn') ||
                    target.closest('.mobile-tools-trigger-btn') ||
                    target.closest('#btn-mobile-tools-drawer')
                )) {
                    continue;
                }

                if (this.cameraTouchId === null && touch.identifier !== this.joystickTouchId) {
                    this.cameraTouchId = touch.identifier;
                    this.lastTouchPos.x = touch.clientX;
                    this.lastTouchPos.y = touch.clientY;
                    if (e.cancelable) e.preventDefault();
                } else if (this.pinchTouchId === null && touch.identifier !== this.cameraTouchId && touch.identifier !== this.joystickTouchId) {
                    this.pinchTouchId = touch.identifier;
                    let tCam = null;
                    for (let j = 0; j < e.touches.length; j++) {
                        if (e.touches[j].identifier === this.cameraTouchId) {
                            tCam = e.touches[j];
                            break;
                        }
                    }
                    if (tCam) {
                        const dx = tCam.clientX - touch.clientX;
                        const dy = tCam.clientY - touch.clientY;
                        this.pinchDistStart = Math.hypot(dx, dy);
                    }
                    if (e.cancelable) e.preventDefault();
                }
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            // 1. Two-finger Pinch Zoom (ONLY between camera touches, joystick thumb never triggers pinch zoom)
            if (this.cameraTouchId !== null && this.pinchTouchId !== null) {
                let tCam = null;
                let tPinch = null;
                for (let i = 0; i < e.touches.length; i++) {
                    if (e.touches[i].identifier === this.cameraTouchId) tCam = e.touches[i];
                    else if (e.touches[i].identifier === this.pinchTouchId) tPinch = e.touches[i];
                }

                if (tCam && tPinch) {
                    if (e.cancelable) e.preventDefault();
                    const dx = tCam.clientX - tPinch.clientX;
                    const dy = tCam.clientY - tPinch.clientY;
                    const dist = Math.hypot(dx, dy);
                    if (this.pinchDistStart && this.pinchDistStart > 0) {
                        const factor = this.pinchDistStart / Math.max(1, dist);
                        this.targetCameraDistance = Math.max(2.2, Math.min(7.5, this.targetCameraDistance * factor));
                    }
                    this.pinchDistStart = dist;
                    this.lastTouchPos.x = tCam.clientX;
                    this.lastTouchPos.y = tCam.clientY;
                    return;
                } else {
                    this.pinchTouchId = null;
                    this.pinchDistStart = null;
                }
            }

            // 2. Single-finger Camera Orbit (Rotates smoothly while joystick thumb is held)
            if (this.cameraTouchId === null) return;

            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.cameraTouchId) {
                    if (e.cancelable) e.preventDefault();
                    let deltaX = touch.clientX - this.lastTouchPos.x;
                    let deltaY = touch.clientY - this.lastTouchPos.y;

                    const isForceLandscape = document.body.classList.contains('force-landscape') && window.innerWidth < window.innerHeight;
                    if (isForceLandscape) {
                        const rawDx = deltaX;
                        const rawDy = deltaY;
                        deltaX = rawDy;
                        deltaY = -rawDx;
                    }

                    this.targetCameraRotation.yaw -= deltaX * 0.0075;
                    this.targetCameraRotation.pitch = Math.max(-0.25, Math.min(0.52, this.targetCameraRotation.pitch + deltaY * 0.006));

                    this.lastTouchPos.x = touch.clientX;
                    this.lastTouchPos.y = touch.clientY;
                    break;
                }
            }
        }, { passive: false });

        const endTouch = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const id = e.changedTouches[i].identifier;
                if (id === this.joystickTouchId) {
                    this.joystickTouchId = null;
                }
                if (id === this.pinchTouchId) {
                    this.pinchTouchId = null;
                    this.pinchDistStart = null;
                }
                if (id === this.cameraTouchId) {
                    this.cameraTouchId = null;
                    if (this.pinchTouchId !== null) {
                        for (let j = 0; j < e.touches.length; j++) {
                            if (e.touches[j].identifier === this.pinchTouchId) {
                                this.cameraTouchId = this.pinchTouchId;
                                this.lastTouchPos.x = e.touches[j].clientX;
                                this.lastTouchPos.y = e.touches[j].clientY;
                                break;
                            }
                        }
                        this.pinchTouchId = null;
                        this.pinchDistStart = null;
                    }
                }
            }
        };

        window.addEventListener('touchend', endTouch, { passive: true });
        window.addEventListener('touchcancel', endTouch, { passive: true });

        // Keyboard Controls
        const GAME_CONTROL_CODES = new Set([
            'KeyW', 'KeyA', 'KeyS', 'KeyD',
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'ShiftLeft', 'ShiftRight',
            'Space', 'KeyE', 'KeyZ', 'KeyH', 'KeyG', 'KeyJ', 'Escape'
        ]);

        const isGameKey = (e) => {
            if (GAME_CONTROL_CODES.has(e.code)) return true;
            const k = (e.key || '').toLowerCase();
            return ['w', 'a', 's', 'd', 'e', 'z', 'h', 'g', 'j', ' ', 'escape'].includes(k);
        };

        window.addEventListener('keydown', (e) => {
            const isExplore = this.isExploreMode || document.body.classList.contains('terminal-hidden') || !document.body.classList.contains('mode-focus');
            
            // In Focus Mode, do NOT process 3D game controls at all! Terminal, Codex, AGY have exclusive keyboard control.
            if (!isExplore) {
                return;
            }

            // If the Launcher screen is active, do NOT process 3D world navigation keys!
            if (window.desktopLauncher && window.desktopLauncher.isLauncherVisible) {
                return;
            }

            // In Explore Mode, detect if user is intentionally typing inside an input/textarea/editor/terminal
            const target = e.target;
            const isXterm = !!(target && target.classList && (target.classList.contains('xterm-helper-textarea') || (target.closest && target.closest('.xterm'))));
            const tagName = target ? (target.tagName || '').toUpperCase() : '';
            const isIntentionalTextInput = (tagName === 'INPUT' || tagName === 'TEXTAREA' || !!target?.isContentEditable || isXterm || this.isTypingInDiegeticKiosk);

            if (isIntentionalTextInput) {
                return;
            }

            if (isGameKey(e)) {
                e.preventDefault();
                e.stopPropagation();

                // If activeElement is an unblurred element (xterm textarea, button, etc.), blur it and focus canvas
                if (document.activeElement && document.activeElement !== this.canvas && document.activeElement !== document.body) {
                    try { document.activeElement.blur(); } catch (_) {}
                }
                focusWorldCanvas();
            }

            const code = e.code;
            const keyLower = (e.key || '').toLowerCase();

            if (code === 'KeyW' || code === 'ArrowUp' || keyLower === 'w') {
                this.keys.forward = true;
                if (this.isSitting) this.standUp();
            } else if (code === 'KeyS' || code === 'ArrowDown' || keyLower === 's') {
                this.keys.backward = true;
                if (this.isSitting) this.standUp();
            } else if (code === 'KeyA' || code === 'ArrowLeft' || keyLower === 'a') {
                this.keys.left = true;
                if (this.isSitting) this.standUp();
            } else if (code === 'KeyD' || code === 'ArrowRight' || keyLower === 'd') {
                this.keys.right = true;
                if (this.isSitting) this.standUp();
            } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
                this.keys.sprint = true;
            } else if (code === 'Space' || keyLower === ' ') {
                if (!e.repeat) {
                    this.keys.jump = true;
                    this.jumpBufferTimer = 0.12; // 120ms Jump Buffer (Argon Spec #1)
                }
                if (this.isSitting) this.standUp();
            } else if (code === 'KeyE' || keyLower === 'e') {
                this.handleInteractAction();
            } else if (code === 'KeyZ' || keyLower === 'z') {
                this.toggleThinkingPose();
            } else if (code === 'KeyG' || keyLower === 'g') {
                if (this.emoteWheel) this.emoteWheel.toggle();
            } else if (code === 'KeyO' || keyLower === 'o') {
                if (this.photoStudio) {
                    if (this.photoStudio.isOpen) this.photoStudio.close();
                    else this.photoStudio.open();
                }
            } else if (code === 'KeyJ' || keyLower === 'j') {
                if (this.noticeBoardModal) this.noticeBoardModal.open();
            } else if (code === 'KeyH' || keyLower === 'h') {
                if (this.onToggleUi) this.onToggleUi();
            } else if (code === 'Escape' || keyLower === 'escape') {
                if (this.photoStudio && this.photoStudio.isOpen) {
                    this.photoStudio.close();
                } else if (this.emoteWheel && this.emoteWheel.isOpen) {
                    this.emoteWheel.close();
                } else if (this.noticeBoardModal && this.noticeBoardModal.isOpen) {
                    this.noticeBoardModal.close();
                } else if (this.isSitting) {
                    this.standUp();
                } else if (!this.isExploreMode && this.onToggleUi) {
                    this.onToggleUi();
                }
            }
        }, { capture: true });

        window.addEventListener('keyup', (e) => {
            const isExplore = this.isExploreMode || document.body.classList.contains('terminal-hidden') || !document.body.classList.contains('mode-focus');
            if (!isExplore) {
                return;
            }

            const target = e.target;
            const isXterm = !!(target && target.classList && (target.classList.contains('xterm-helper-textarea') || (target.closest && target.closest('.xterm'))));
            const tagName = target ? (target.tagName || '').toUpperCase() : '';
            const isIntentionalTextInput = (tagName === 'INPUT' || tagName === 'TEXTAREA' || !!target?.isContentEditable || isXterm);

            if (isIntentionalTextInput) {
                return;
            }

            if (isGameKey(e)) {
                e.preventDefault();
                e.stopPropagation();
            }

            const code = e.code;
            const keyLower = (e.key || '').toLowerCase();

            if (code === 'KeyW' || code === 'ArrowUp' || keyLower === 'w') {
                this.keys.forward = false;
            } else if (code === 'KeyS' || code === 'ArrowDown' || keyLower === 's') {
                this.keys.backward = false;
            } else if (code === 'KeyA' || code === 'ArrowLeft' || keyLower === 'a') {
                this.keys.left = false;
            } else if (code === 'KeyD' || code === 'ArrowRight' || keyLower === 'd') {
                this.keys.right = false;
            } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
                this.keys.sprint = false;
            } else if (code === 'Space' || keyLower === ' ') {
                this.keys.jump = false;
                this.jumpConsumed = false; // Reset lock so next tap can jump cleanly (Argon Spec #1)
            }
        }, { capture: true });

        // Window blur: reset all keys to prevent character from walking or jumping indefinitely if window loses focus
        window.addEventListener('blur', () => {
            this.keys.forward = false;
            this.keys.backward = false;
            this.keys.left = false;
            this.keys.right = false;
            this.keys.sprint = false;
            this.keys.jump = false;
            this.jumpConsumed = false;
            this.jumpBufferTimer = 0;
        });

        // Click or Tap on Prompt Element
        if (this.interactPromptEl) {
            this.interactPromptEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleInteractAction();
            });
            this.interactPromptEl.addEventListener('touchend', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.handleInteractAction();
            }, { passive: false });
        }
    }

    initVirtualJoystick() {
        const joystickZone = document.getElementById('virtual-joystick-zone');
        const stick = document.getElementById('virtual-joystick-stick');
        if (!joystickZone || !stick) return;

        let startX = 0, startY = 0;
        const maxDist = 42;

        joystickZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.isSitting) this.standUp();
            const touch = e.changedTouches[0];
            this.joystickTouchId = touch.identifier;
            const rect = joystickZone.getBoundingClientRect();
            startX = rect.left + rect.width / 2;
            startY = rect.top + rect.height / 2;
        }, { passive: false });

        joystickZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.joystickTouchId) {
                    let dx = touch.clientX - startX;
                    let dy = touch.clientY - startY;

                    const isForceLandscape = document.body.classList.contains('force-landscape') && window.innerWidth < window.innerHeight;
                    if (isForceLandscape) {
                        const rawDx = dx;
                        const rawDy = dy;
                        dx = rawDy;
                        dy = -rawDx;
                    }

                    const dist = Math.hypot(dx, dy);
                    if (dist > maxDist) {
                        dx = (dx / dist) * maxDist;
                        dy = (dy / dist) * maxDist;
                    }

                    stick.style.transform = `translate(${dx}px, ${dy}px)`;
                    this.joystickVector.x = dx / maxDist;
                    this.joystickVector.y = -dy / maxDist;
                    break;
                }
            }
        }, { passive: false });

        const resetStick = (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this.joystickTouchId) {
                    this.joystickTouchId = null;
                    stick.style.transform = 'translate(0px, 0px)';
                    this.joystickVector.x = 0;
                    this.joystickVector.y = 0;
                    break;
                }
            }
        };

        joystickZone.addEventListener('touchend', resetStick, { passive: true });
        joystickZone.addEventListener('touchcancel', resetStick, { passive: true });
    }

    /* =========================================================================
       ANIMATE & SIMULATION LOOP
       ========================================================================= */
    animate() {
        requestAnimationFrame(() => this.animate());

        const now = performance.now();

        // 0. Thermal Governor & Hardware Heat Protection (Lead Architect Argon v2)
        if (this.thermalGovernor) {
            if (!this.thermalGovernor.shouldRenderFrame(now, this.lastRenderTime)) {
                return;
            }
            this.thermalGovernor.governShadows(this.player ? this.player.position : null);
        } else {
            if (document.hidden) {
                this.lastFrameTime = performance.now();
                return;
            }
            if (this.fpsCap > 0) {
                const targetInterval = 1000 / this.fpsCap;
                if (now - this.lastRenderTime < (targetInterval - 1.5)) {
                    return;
                }
            }
        }
        this.lastRenderTime = now;

        const delta = Math.min((now - this.lastFrameTime) / 1000, 0.1);
        this.lastFrameTime = now;
        let phaseStart = performance.now();

        if (!window.isPhotoModeActive) {
            this.updatePlayerMovement(delta);
            this.updateCamera(delta);
            this.checkInteractions();
        }

        // 1. Update Autonomous NPC Life Simulation (with Animation Distance LOD)
        if (this.npcLifeSystem) {
            this.npcLifeSystem.update(delta, this.player ? this.player.position : null);
        }
        const gameplayUpdateMs = performance.now() - phaseStart;

        // 2. Update Environmental Composition (Weather, Water, Shoreline Foam, Streaming, Audio)
        phaseStart = performance.now();
        if (this.worldComposition) {
            this.worldComposition.update(delta, this.player ? this.player.position : null);
        }

        // 2b. Update Zen Fishing Minigame (Zero-GC line rendering & FSM)
        if (this.zenFishing) {
            this.zenFishing.update(delta, this.player ? this.player.position : null, this.rodTipObject);
        }

        // 3. Update Realtime Multiplayer Remote Entities
        if (window.multiplayerClient) {
            window.multiplayerClient.update(delta, this.camera);
        }

        // 3b. Update In-World 3D Holograms (Local & Remote Peer Screens)
        if (this.inworldHologram) {
            this.inworldHologram.update(delta);
        }



        // 3d. Update Anime Photo Mode & Kinetic Drone
        if (this.photoMode && this.photoMode.isActive) {
            this.photoMode.update(delta);
        }

        // 3e. Update Spatial Audio 3D & Zone BGM Crossfader
        if (this.spatialAudioZoneManager && this.player) {
            this.spatialAudioZoneManager.update(delta, this.player.position, this.camera);
        }

        // 3f. Update Dynamic Biome Weather System (GPU Instanced Particles)
        if (this.dynamicWeather && this.player) {
            this.dynamicWeather.update(delta, this.player.position, this.dayNightCycle?.time || this.worldComposition?.timeOfDay?.timeOfDay || 12.0);
        }

        // 3h. Update Day/Night Celestial Cycle & Atmospheric Shader Sync
        if (this.dayNightCycle) {
            const curWeather = this.dynamicWeather ? this.dynamicWeather.getCurrentWeather() : 'none';
            this.dayNightCycle.update(delta, curWeather);
        }

        // 3i. Update Group Emote Synchronization (Vibe Harmony)
        if (this.groupEmoteSync && this.player) {
            this.groupEmoteSync.update(delta, this.player.position, this.retargeter);
        }

        // 3j. Update Living NPC Dynamic Schedule Manager
        if (this.livingNpcSchedule) {
            const timeHour = this.dayNightCycle ? this.dayNightCycle.time : 12.0;
            const curWeather = this.dynamicWeather ? this.dynamicWeather.getCurrentWeather() : 'none';
            this.livingNpcSchedule.update(delta, timeHour, curWeather);
        }

        // 3k. Update Dynamic Quality Scaler (Performance Governor)
        if (this.qualityScaler) {
            this.qualityScaler.update(delta);
        }

        // 3l. Update Diegetic Terminal Kiosk (Interactive 3D screen at Hub)
        if (this.diegeticKiosk && this.player) {
            this.diegeticKiosk.update(delta, this.player.position);
        }

        // 3m. Update Time-of-Day Quest Manager
        if (this.timeOfDayQuestManager && this.dayNightCycle) {
            this.timeOfDayQuestManager.update(this.dayNightCycle.time);
        }

        // 3n. Update Spatial Party Boombox Audio Position
        if (window.spatialBoomboxManager) {
            window.spatialBoomboxManager.update(delta);
        }

        // 3o. Update Zen Garden Pomodoro Focus System & Auras
        const pomodoroSys = this.zenGardenPomodoro || window.zenGardenPomodoro;
        if (pomodoroSys) {
            pomodoroSys.update(delta, this.player ? this.player.position : null);
        }

        // 3p. Update Pet Companion System & Procedural Quadruped Kinematics
        const petSys = this.petCompanionSystem || window.petCompanionSystem;
        if (petSys) {
            petSys.update(delta, this.player ? this.player.position : null, this.player ? this.player.mesh : null);
            if (this.interactionManager && petSys.localPet) {
                const anchor = this.interactionManager.getAnchor ? this.interactionManager.getAnchor('pet_companion_anchor') : (this.interactionManager.anchors instanceof Map ? this.interactionManager.anchors.get('pet_companion_anchor') : null);
                if (anchor && anchor.position) {
                    anchor.position.x = petSys.localPet.position.x;
                    anchor.position.y = petSys.localPet.position.y + 0.4;
                    anchor.position.z = petSys.localPet.position.z;
                }
            }
        }

        // 4. Update 3D Comic Speech Bubbles
        if (window.mmoChat) {
            window.mmoChat.updateSpeechBubblesPositions(this.camera, this);
        }

        // 5. Update Screen-Space Overhead Badges (Safety-clamped, Distance-scaled)
        if (this.overheadUi) {
            this.overheadUi.update();
        }

        // 6. Update Minecraft BSL/Complementary Sun Shader FX (Warmth, Corona & Specular Shimmer)
        if (this.sunFlareMesh && this.graphicsSettings?.shaderMode === 'enhanced') {
            this.updateSunShaderFx();
        }
        const sceneUpdateMs = performance.now() - phaseStart;

        phaseStart = performance.now();
        if (this.postProcessing && this.postProcessing.enabled) {
            this.postProcessing.render(delta);
        } else {
            this.renderer.render(this.scene, this.camera);
        }
        const renderSubmitMs = performance.now() - phaseStart;

        // 7. Dynamic Resolution Scaling (DRS) & Telemetry Recording
        if (this.performanceManager) {
            this.performanceManager.recordFrame(delta * 1000, { gameplayUpdateMs, sceneUpdateMs, renderSubmitMs });
        }
    }

    updatePlayerMovement(delta) {
        if (!this.player) return;

        // If sitting, do not move along terrain; let retargeter play seated pose
        if (this.isSitting) {
            if (this.retargeter) {
                this.retargeter.update(delta, false, false);
            }
            return;
        }

        let moveX = 0;
        let moveZ = 0;

        if (this.keys.forward)  moveZ -= 1;
        if (this.keys.backward) moveZ += 1;
        if (this.keys.left)     moveX -= 1;
        if (this.keys.right)    moveX += 1;

        if (Math.abs(this.joystickVector.x) > 0.15 || Math.abs(this.joystickVector.y) > 0.15) {
            moveX = this.joystickVector.x;
            moveZ = -this.joystickVector.y;
        }

        const len = Math.hypot(moveX, moveZ);
        const isMoving = len > 0.08;
        const isSprinting = this.keys.sprint || Math.hypot(this.joystickVector.x, this.joystickVector.y) > 0.85;

        if (!this.isSitting) {
            if (isMoving) {
                const normX = moveX / Math.max(1, len);
                const normZ = moveZ / Math.max(1, len);

                const speed = (isSprinting ? 5.5 : 3.2) * delta;

                const sinYaw = Math.sin(this.cameraRotation.yaw);
                const cosYaw = Math.cos(this.cameraRotation.yaw);

                const worldX = (normX * cosYaw + normZ * sinYaw) * speed;
                const worldZ = (-normX * sinYaw + normZ * cosYaw) * speed;

                const oldX = this.player.position.x;
                const oldZ = this.player.position.z;
                const targetX = oldX + worldX;
                const targetZ = oldZ + worldZ;

                if (this.collisionSystem) {
                    const resolved = this.collisionSystem.resolveCollision(oldX, oldZ, targetX, targetZ);
                    this.player.position.x = resolved.x;
                    this.player.position.z = resolved.z;
                } else {
                    this.player.position.x = targetX;
                    this.player.position.z = targetZ;
                }

                const targetRot = Math.atan2(worldX, worldZ);
                let diffRot = targetRot - this.player.rotation.y;
                while (diffRot > Math.PI) diffRot -= Math.PI * 2;
                while (diffRot < -Math.PI) diffRot += Math.PI * 2;
                const turnSpeed = isSprinting ? 14.0 : 11.0;
                const turnAmount = diffRot * (1 - Math.exp(-delta * turnSpeed));
                this.player.rotation.y += turnAmount;
                this.playerAngularVel = diffRot / Math.max(0.001, delta);
            }

            // Update Jump Buffer & Coyote Time timers (Argon Spec #1)
            this.jumpBufferTimer = Math.max(0, (this.jumpBufferTimer || 0) - delta);
            this.coyoteTimer = this.isGrounded ? 0.10 : Math.max(0, (this.coyoteTimer || 0) - delta);

            // Trigger jump: requires non-consumed jump input, grounded or coyote time, and not seated
            const canJump = (this.isGrounded || this.coyoteTimer > 0) && this.jumpState === 'GROUNDED' && !this.isSitting;
            const wantsJump = (this.keys.jump || this.jumpBufferTimer > 0) && !this.jumpConsumed;

            if (canJump && wantsJump) {
                this.jumpConsumed = true; // Instantly consume to eliminate auto-jumping!
                this.jumpBufferTimer = 0;
                this.coyoteTimer = 0;
                this.jumpState = 'ANTICIPATION';
                this.jumpTimer = 0.08; // 80ms crouch compression
                this.landingSquashFactor = 0.04;
                if (this.retargeter) {
                    this.retargeter.setJumpState('ANTICIPATION', 0, 0.04);
                }
            }

            // Expanded Explorable Boundaries: encompasses all 8 regions (Village, Hub, River, Beach, Hill Overlook)
            this.player.position.x = Math.max(-50, Math.min(60, this.player.position.x));
            this.player.position.z = Math.max(-75, Math.min(100, this.player.position.z));

            const terrainY = this.getTerrainHeight(this.player.position.x, this.player.position.z);

            if (this.jumpState === 'ANTICIPATION') {
                this.jumpTimer -= delta;
                this.player.position.y = terrainY;
                if (this.jumpTimer <= 0) {
                    this.jumpState = 'AIRBORNE';
                    this.isGrounded = false;
                    this.verticalVelocity = isSprinting ? 6.2 : 5.6; // initial takeoff impulse
                    this.landingSquashFactor = 0;
                    if (this.retargeter) {
                        this.retargeter.setJumpState('AIRBORNE', this.verticalVelocity);
                    }
                }
            } else if (this.jumpState === 'AIRBORNE') {
                const gravity = -18.5; // m/s^2
                this.verticalVelocity += gravity * delta;
                if (this.verticalVelocity < -16.0) this.verticalVelocity = -16.0;

                this.player.position.y += this.verticalVelocity * delta;
                if (this.retargeter) {
                    this.retargeter.setJumpState('AIRBORNE', this.verticalVelocity);
                }

                if (this.player.position.y <= terrainY) {
                    // Touchdown / Impact!
                    this.player.position.y = terrainY;
                    const impactSpeed = Math.abs(this.verticalVelocity);
                    this.verticalVelocity = 0;
                    this.isGrounded = true;
                    this.jumpState = 'LANDING';
                    this.landingSpringTime = 0; // Trigger Gamma Decay spring
                    const currentHorizSpeed = isMoving ? (isSprinting ? 1.0 : 0.45) : 0;
                    const runMitigation = 1.0 - 0.35 * currentHorizSpeed;
                    this.landingImpactIntensity = Math.min(1.0, impactSpeed / 11.0) * runMitigation;

                    if (this.retargeter) {
                        if (this.retargeter.triggerLanding) {
                            this.retargeter.triggerLanding(impactSpeed, currentHorizSpeed);
                        } else {
                            this.retargeter.setJumpState('LANDING', 0, 0.08);
                        }
                    }
                    if (this.audioManager && typeof this.audioManager.playFootstepSound === 'function') {
                        this.audioManager.playFootstepSound('stone', true);
                    }
                }
            } else if (this.jumpState === 'LANDING') {
                this.landingSpringTime += delta;
                this.player.position.y = terrainY;
                const t = this.landingSpringTime;
                const tau = 0.065; // Peak compression at 65ms (Argon Spec #6)
                // Gamma-Exponential envelope: (t / tau) * e^(1 - t / tau) with subtle overshoot rebound
                const envelope = (t / tau) * Math.exp(1.0 - t / tau);
                const rebound = Math.cos(t * 9.5);
                const currentSquash = THREE.MathUtils.clamp(this.landingImpactIntensity * envelope * rebound * 0.12, -0.02, 0.14);
                this.landingSquashFactor = Math.max(0, currentSquash);

                if (this.retargeter) {
                    this.retargeter.setJumpState('LANDING', 0, this.landingSquashFactor);
                }

                if (t >= 0.45) {
                    this.jumpState = 'GROUNDED';
                    this.landingSquashFactor = 0;
                    if (this.retargeter) {
                        this.retargeter.setJumpState('GROUNDED', 0, 0);
                    }
                }
            } else {
                // Normal grounded walking / running / idle
                this.player.position.y = terrainY;
                this.isGrounded = true;
                this.verticalVelocity = 0;
                if (this.retargeter && this.retargeter.jumpState !== 'GROUNDED') {
                    this.retargeter.setJumpState('GROUNDED', 0, 0);
                }
            }
        } else {
            // When seated, maintain anchored seat position and altitude (e.g. on raised decks/tatami)
            if (this.currentSeatAnchor && this.interactionManager) {
                const seatPos = this.interactionManager.getSeatSlotPosition(this.currentSeatAnchor.id, 'player') || this.currentSeatAnchor.position;
                this.player.position.x = seatPos.x;
                this.player.position.z = seatPos.z;
                if (seatPos.y !== undefined) {
                    this.player.position.y = seatPos.y;
                }
                this.player.rotation.y = this.currentSeatAnchor.rotationY || 0;
            }
        }

        if (this.playerContactShadow) {
            this.playerContactShadow.position.set(
                this.player.position.x,
                this.player.position.y + 0.02,
                this.player.position.z
            );
        }

        // Drive Avatar Retargeter Locomotion
        if (this.retargeter) {
            this.retargeter.update(delta, isMoving, isSprinting);
        }
    }

    updateCamera(delta) {
        if (!this.player || !this.camera) return;
        if (this.isCinematicCamera) return;

        const smooth = Math.min(1, delta * 15);
        this.cameraRotation.yaw += (this.targetCameraRotation.yaw - this.cameraRotation.yaw) * smooth;
        this.cameraRotation.pitch += (this.targetCameraRotation.pitch - this.cameraRotation.pitch) * smooth;
        this.cameraDistance += (this.targetCameraDistance - this.cameraDistance) * Math.min(1, delta * 14);

        const camX = this.player.position.x + Math.sin(this.cameraRotation.yaw) * Math.cos(this.cameraRotation.pitch) * this.cameraDistance;
        const camY = this.player.position.y + Math.sin(this.cameraRotation.pitch) * this.cameraDistance + 1.65;
        const camZ = this.player.position.z + Math.cos(this.cameraRotation.yaw) * Math.cos(this.cameraRotation.pitch) * this.cameraDistance;

        this.camera.position.set(camX, camY, camZ);
        this.camera.lookAt(this.player.position.x, this.player.position.y + 1.22, this.player.position.z);
    }

    checkInteractions() {
        if (!this.player || !this.isExploreMode || document.body.classList.contains('mode-focus')) {
            this.activeInteractTarget = null;
            this.nearbyAnchor = null;
            this.nearbyNpc = null;
            if (this.interactPromptEl) {
                this.interactPromptEl.classList.add('hidden');
                this.interactPromptEl.style.display = 'none';
            }
            return;
        }

        for (let i = 0; i < _interactionCandidates.length; i++) {
            _interactionCandidates[i].data = null;
            _interactionCandidates[i].action = null;
        }
        _interactionCandidates.length = 0;

        const t = window.TeleTermI18n ? window.TeleTermI18n.t.bind(window.TeleTermI18n) : null;

        // 1. If currently seated, prompt to stand up (anchored above player)
        if (this.isSitting) {
            const slot = getCandidateSlot(_interactionCandidates.length);
            slot.type = 'seat_exit';
            slot.data = null;
            slot.dist = 0;
            slot.posX = this.player.position.x;
            slot.posY = this.player.position.y + 1.25;
            slot.posZ = this.player.position.z;
            slot.icon = 'chair';
            slot.actionText = t ? t('prompt_stand') : 'Stand Up';
            slot.action = () => this.standUp();
            _interactionCandidates.push(slot);
        } else {
            // 2. Check nearby interaction anchors (Benches, Chairs, Desks, Kiosks, Vending Machines)
            if (this.interactionManager) {
                for (const anchor of this.interactionManager.anchors.values()) {
                    const ay = anchor.position.y !== undefined ? anchor.position.y : this.getTerrainHeight(anchor.position.x, anchor.position.z);
                    const isSeat = anchor.type === 'seat';
                    const cap = anchor.capacity || (anchor.category === 'bench' ? 2 : 1);
                    const isFull = isSeat && this.interactionManager.isOccupied(anchor.id);

                    // Skip fully occupied seats so player doesn't try to sit on an occupied single seat
                    if (isSeat && isFull) continue;

                    let checkX, checkY, checkZ;
                    if (isSeat && cap > 1) {
                        const freePos = this.interactionManager.getSeatSlotPosition(anchor.id, 'player', this.player.position);
                        if (freePos) {
                            checkX = freePos.x;
                            checkY = freePos.y !== undefined ? freePos.y : ay;
                            checkZ = freePos.z;
                        } else {
                            checkX = anchor.position.x;
                            checkY = ay;
                            checkZ = anchor.position.z;
                        }
                    } else {
                        checkX = anchor.position.x;
                        checkY = ay;
                        checkZ = anchor.position.z;
                    }

                    const dx = this.player.position.x - checkX;
                    const dy = this.player.position.y - checkY;
                    const dz = this.player.position.z - checkZ;
                    const distSq = dx * dx + dy * dy + dz * dz;
                    const radius = anchor.interactionRadius || 2.2;

                    if (distSq <= radius * radius) {
                        const d = Math.sqrt(distSq);
                        let icon = 'chair';
                        let actionText = t ? t('prompt_sit') : 'Sit';
                        let hoverY = checkY + 0.95;

                        if (anchor.type === 'vending_machine') {
                            icon = 'coffee';
                            actionText = t ? t('prompt_buy_drink') : 'Buy Drink';
                            hoverY = ay + 1.2;
                        } else if (anchor.type === 'terminal_kiosk') {
                            icon = 'terminal';
                            actionText = t ? t('prompt_terminal') : 'Terminal';
                            hoverY = ay + 1.35;
                        } else if (anchor.category === 'cafe_stool') {
                            icon = 'coffee';
                            actionText = t ? t('prompt_bar_stool') : 'Sit at Bar';
                            hoverY = ay + 1.0;
                        } else if (anchor.category === 'coding_desk') {
                            icon = 'terminal';
                            actionText = t ? t('prompt_coding_desk') : 'Coding Desk';
                            hoverY = ay + 1.0;
                        } else if (anchor.type === 'bicycle') {
                            icon = 'bell';
                            actionText = t ? t('prompt_ring_bell') : 'Ring Bell';
                            hoverY = ay + 0.95;
                        } else if (anchor.type === 'notice_board') {
                            icon = 'file-text';
                            actionText = t ? (window.TeleTermI18n?.currentLang === 'vi' ? 'Bảng Treo Thưởng' : 'Notice Board') : 'Notice Board';
                            hoverY = ay + 1.25;
                        } else if (anchor.category === 'party_boombox' || anchor.type === 'party_boombox') {
                            icon = 'music';
                            actionText = (window.TeleTermI18n?.currentLang === 'vi') ? 'Điều Khiển Boombox 📻' : 'Party Boombox 📻';
                            hoverY = ay + 0.85;
                        } else if (anchor.category === 'cooking_hearth') {
                            icon = 'fire';
                            actionText = (window.TeleTermI18n?.currentLang === 'vi') ? 'Nướng Cá Lửa Trại 🐟' : 'Roast Fish over Hearth 🐟';
                            hoverY = ay + 0.85;
                        } else if (anchor.category === 'pomodoro_sanctuary' || anchor.type === 'pomodoro_sanctuary') {
                            icon = 'clock';
                            actionText = (window.TeleTermI18n?.currentLang === 'vi') ? 'Tập Trung Pomodoro 🧘' : 'Zen Pomodoro Focus 🧘';
                            hoverY = ay + 0.95;
                        } else if (isSeat && cap > 1) {
                            const occupants = this.interactionManager.getOccupants(anchor.id);
                            if (occupants && occupants.length > 0) {
                                const otherId = occupants[0];
                                let otherName = '';
                                if (otherId === 'sakura') otherName = 'Sakura';
                                else if (otherId === 'kaede') otherName = 'Kaede';
                                else if (otherId === 'lumina') otherName = 'Lumina';
                                else if (otherId === 'ren') otherName = 'Ren';
                                else if (otherId === 'kaito') otherName = 'Kaito';
                                else if (window.multiplayerClient?.remotePlayers?.has(otherId)) {
                                    otherName = window.multiplayerClient.remotePlayers.get(otherId).username;
                                }

                                if (otherName) {
                                    actionText = (window.TeleTermI18n?.currentLang === 'vi')
                                        ? `Ngồi chung ghế (cạnh ${otherName})`
                                        : `Sit Together (next to ${otherName})`;
                                } else {
                                    actionText = (window.TeleTermI18n?.currentLang === 'vi')
                                        ? 'Ngồi chung ghế'
                                        : 'Share Bench';
                                }
                            }
                        }

                        const slot = getCandidateSlot(_interactionCandidates.length);
                        slot.type = 'anchor';
                        slot.data = anchor;
                        slot.dist = d;
                        slot.posX = checkX;
                        slot.posY = hoverY;
                        slot.posZ = checkZ;
                        slot.icon = icon;
                        slot.actionText = actionText;
                        slot.action = () => {
                            if (anchor.type === 'seat') this.sitDown(anchor);
                            else if (anchor.type === 'terminal_kiosk') {
                                if (this.onToggleUi) this.onToggleUi();
                                this.onToast(t ? t('toast_terminal_opened') : 'Opened public Hologram Terminal!', 'info');
                            } else if (anchor.type === 'notice_board') {
                                if (this.noticeBoardModal) this.noticeBoardModal.open();
                            } else if (anchor.type === 'bicycle') {
                                this.playBicycleBellSound();
                                window.dispatchEvent(new CustomEvent('teleterm:interact-object', { detail: { target: 'vintage-bicycle' } }));
                                this.onToast(t ? t('toast_bicycle_bell') : '*Ding-ding!* The vintage bicycle bell chimes warmly.', 'info');
                            } else if (anchor.type === 'vending_machine') {
                                this.playVendingSound();
                                if (window.playerInventory) {
                                    const added = window.playerInventory.addItem({
                                        id: 'drink_green_tea',
                                        name: 'Iced Green Tea Can',
                                        vi: 'Lon Trà Xanh Lạnh',
                                        icon: 'coffee',
                                        type: 'consumable',
                                        holdable: true,
                                        handPose: 'small_can',
                                        useAnimation: 'DrinkCan',
                                        useSound: 'drink_soft',
                                        model: 'can_green_tea'
                                    });
                                    if (added) {
                                        const t = window.TeleTermI18n ? window.TeleTermI18n.t.bind(window.TeleTermI18n) : null;
                                        this.onToast(t ? t('toast_vending_purchased') : 'Retrieved an iced green tea from the vending machine!', 'success');
                                    }
                                } else {
                                    this.onToast(t ? t('toast_vending_drink') : 'Retrieved an iced green tea from the vending machine!', 'info');
                                }
                            } else if (typeof anchor.action === 'function') {
                                anchor.action();
                            } else if (anchor.category === 'party_boombox' || anchor.type === 'party_boombox') {
                                if (window.spatialBoomboxManager) {
                                    window.spatialBoomboxManager.openControlPanel();
                                }
                            } else if (anchor.category === 'cooking_hearth') {
                                if (window.campfireCookingSystem) {
                                    window.campfireCookingSystem.open();
                                }
                            } else if (anchor.category === 'pomodoro_sanctuary' || anchor.type === 'pomodoro_sanctuary') {
                                if (window.zenGardenPomodoro) {
                                    window.zenGardenPomodoro.open();
                                }
                            }
                        };
                        _interactionCandidates.push(slot);
                    }
                }
            }

            // 3. Check nearby NPCs
            this.npcs.forEach(npc => {
                const dx = this.player.position.x - npc.position.x;
                const dy = this.player.position.y - npc.position.y;
                const dz = this.player.position.z - npc.position.z;
                const distSq = dx * dx + dy * dy + dz * dz;
                const time = (performance.now() - this.worldStartTime) / 1000;
                if (npc.userData && npc.userData.ring) {
                    npc.userData.ring.material.opacity = (distSq < 12.96) ? (0.7 + Math.sin(time * 4) * 0.25) : 0.45;
                }

                if (distSq <= 12.25) {
                    const d = Math.sqrt(distSq);
                    const name = npc.userData?.name || 'NPC';
                    const slot = getCandidateSlot(_interactionCandidates.length);
                    slot.type = 'npc';
                    slot.data = npc;
                    slot.dist = d;
                    slot.posX = npc.position.x;
                    slot.posY = npc.position.y + 1.35;
                    slot.posZ = npc.position.z;
                    slot.icon = 'message-circle';
                    slot.actionText = t ? t('prompt_talk', { name }) : `Talk (${name})`;
                    slot.action = () => {
                        const npcId = (npc.userData?.id || 'lumina').toLowerCase();
                        window.dispatchEvent(new CustomEvent('teleterm:npc-talk', {
                            detail: { npcName: npc.userData.name, npcId }
                        }));
                        if (this.timeOfDayQuestManager) {
                            this.timeOfDayQuestManager.onNpcInteracted(npcId);
                        }
                        if (this.visualNovelDialogue) {
                            const dialogue = this.getNpcVnDialogueData(npcId);
                            this.visualNovelDialogue.open(npcId, dialogue.lines, dialogue.choices);
                        } else if (this.onNpcInteract) {
                            this.onNpcInteract(npc.userData.id);
                        }
                    };
                    _interactionCandidates.push(slot);
                }
            });

            // 4. Check nearby Torii Fast-Travel Waystone Shrine
            const toriiPrompt = this.worldComposition?.toriiWarp?.getNearbyPrompt();
            if (toriiPrompt && this.worldComposition?.toriiWarp?.nearbyShrine) {
                const shrine = this.worldComposition.toriiWarp.nearbyShrine;
                const slot = getCandidateSlot(_interactionCandidates.length);
                slot.type = 'torii_warp';
                slot.data = shrine;
                slot.dist = 1.0;
                slot.posX = shrine.destination.pos.x;
                slot.posY = shrine.groundY + 1.8;
                slot.posZ = shrine.destination.pos.z;
                slot.icon = 'compass';
                slot.actionText = toriiPrompt.text.replace(/^\[E\]\s*/, '');
                slot.action = () => toriiPrompt.action();
                _interactionCandidates.push(slot);
            }

            // 5. Check nearby Arashiyama Onsen Soaking Spot
            const onsenPrompt = this.worldComposition?.bambooOnsen?.getNearbyPrompt(this.player.position);
            if (onsenPrompt) {
                const onsen = this.worldComposition.bambooOnsen;
                const slot = getCandidateSlot(_interactionCandidates.length);
                slot.type = 'onsen_soak';
                slot.data = onsen;
                slot.dist = 1.1;
                slot.posX = onsen.center.x;
                slot.posY = onsen.waterY + 1.2;
                slot.posZ = onsen.center.z;
                slot.icon = 'bath';
                slot.actionText = onsenPrompt.text.replace(/^\[E\]\s*/, '');
                slot.action = () => onsenPrompt.action();
                _interactionCandidates.push(slot);
            }
        }

        // Prioritize strictly closest interactive object to the player!
        _interactionCandidates.sort((a, b) => {
            const isKaitoA = a.type === 'npc' && a.data?.userData?.id === 'kaito';
            const isKaitoB = b.type === 'npc' && b.data?.userData?.id === 'kaito';
            const isBarSeatA = a.type === 'anchor' && (a.data?.category === 'cafe_stool' || a.data?.id?.includes('cafe') || a.data?.id?.includes('bar'));
            const isBarSeatB = b.type === 'anchor' && (b.data?.category === 'cafe_stool' || b.data?.id?.includes('cafe') || b.data?.id?.includes('bar'));

            if (isKaitoA && isBarSeatB && a.dist <= 3.5) return -1;
            if (isKaitoB && isBarSeatA && b.dist <= 3.5) return 1;

            return a.dist - b.dist;
        });
        const closest = _interactionCandidates[0] || null;
        this.activeInteractTarget = closest;
        if (closest) {
            _tempPromptPos.set(closest.posX, closest.posY, closest.posZ);
            closest.pos = _tempPromptPos;
        }

        if (closest && closest.type === 'anchor') {
            this.nearbyAnchor = closest.data;
            this.nearbyNpc = null;
        } else if (closest && closest.type === 'npc') {
            this.nearbyNpc = closest.data;
            this.nearbyAnchor = null;
        } else {
            this.nearbyAnchor = null;
            this.nearbyNpc = null;
        }

        // Project position in 3D screen space
        this.updatePromptScreenPosition();
    }

    updatePromptScreenPosition() {
        if (!this.interactPromptEl) return;
        if (!this.activeInteractTarget || !this.isExploreMode || document.body.classList.contains('mode-focus')) {
            this.interactPromptEl.classList.add('hidden');
            this.interactPromptEl.classList.remove('docked-bottom');
            this.interactPromptEl.style.display = 'none';
            return;
        }

        // When seated, dock cleanly to bottom center above hotbar/thumb-deck
        // Completely eliminates any collision with head, hair, and overhead rank/identity badges!
        if (this.isSitting && this.activeInteractTarget?.type === 'seat_exit') {
            this.interactPromptEl.classList.remove('hidden');
            this.interactPromptEl.classList.add('docked-bottom');
            this.interactPromptEl.style.display = 'flex';
            this.interactPromptEl.style.left = '50%';
            this.interactPromptEl.style.top = 'auto';
            this.interactPromptEl.style.bottom = '96px';
            this.interactPromptEl.style.transform = 'translateX(-50%)';

            const iconEl = document.getElementById('interact-prompt-icon');
            const textEl = document.getElementById('interact-prompt-text');
            const t = window.TeleTermI18n ? window.TeleTermI18n.t.bind(window.TeleTermI18n) : null;
            const action = this.activeInteractTarget.actionText || (t ? t('prompt_stand') : 'Stand Up');
            const pressWord = t ? t('prompt_press') : 'Press';
            const toWord = t ? t('prompt_to') : 'to';
            if (iconEl && textEl) {
                const iconName = this.activeInteractTarget.icon || 'chair';
                iconEl.innerHTML = window.TeleTermIcons ? window.TeleTermIcons.render(iconName, { size: 14 }) : '';
                textEl.textContent = action;
                const prefixEl = this.interactPromptEl.querySelector('.interact-prompt-prefix');
                const toEl = this.interactPromptEl.querySelector('.interact-prompt-to');
                if (prefixEl) prefixEl.textContent = pressWord;
                if (toEl) toEl.textContent = toWord;
            }
            return;
        } else {
            this.interactPromptEl.classList.remove('docked-bottom');
            this.interactPromptEl.style.bottom = '';
        }

        const targetPos = this.activeInteractTarget.pos;
        if (!targetPos || !this.camera) {
            this.interactPromptEl.classList.add('hidden');
            this.interactPromptEl.style.display = 'none';
            return;
        }

        // 1. Behind camera culling: check angle between camera forward and target vector (Zero-Allocation)
        _tempToTarget.copy(targetPos).sub(this.camera.position);
        this.camera.getWorldDirection(_tempCamDir);
        if (_tempCamDir.dot(_tempToTarget.normalize()) <= 0.05) {
            this.interactPromptEl.classList.add('hidden');
            this.interactPromptEl.style.display = 'none';
            return;
        }

        // 2. Frustum projection to NDC [-1, 1] (Zero-Allocation)
        _tempProj.copy(targetPos).project(this.camera);
        if (_tempProj.z > 1.0 || _tempProj.z < -1.0 || Math.abs(_tempProj.x) > 0.95 || Math.abs(_tempProj.y) > 0.92) {
            this.interactPromptEl.classList.add('hidden');
            this.interactPromptEl.style.display = 'none';
            return;
        }

        // 3. Convert NDC to screen pixels
        const isForceLandscape = document.body.classList.contains('force-landscape') && window.innerWidth < window.innerHeight;
        const w = isForceLandscape ? window.innerHeight : window.innerWidth;
        const h = isForceLandscape ? window.innerWidth : window.innerHeight;

        const rawX = (_tempProj.x * 0.5 + 0.5) * w;
        const rawY = (-(_tempProj.y * 0.5) + 0.5) * h;

        // Viewport safe boundary clamping
        const safeX = Math.max(50, Math.min(w - 50, rawX));
        const safeY = Math.max(60, Math.min(h - 75, rawY));

        // 4. Update prompt content (explicit Press E to action format)
        const iconEl = document.getElementById('interact-prompt-icon');
        const textEl = document.getElementById('interact-prompt-text');
        const t = window.TeleTermI18n ? window.TeleTermI18n.t.bind(window.TeleTermI18n) : null;
        const action = this.activeInteractTarget.actionText || (t ? t('prompt_interact') : 'Interact');
        const pressWord = t ? t('prompt_press') : 'Press';
        const toWord = t ? t('prompt_to') : 'to';
        const activeIcon = this.activeInteractTarget.icon || 'circle';
        const iconSvg = window.TeleTermIcons ? window.TeleTermIcons.render(activeIcon, { size: 14 }) : '';

        if (iconEl && textEl) {
            iconEl.innerHTML = iconSvg;
            textEl.textContent = action;
            const prefixEl = this.interactPromptEl.querySelector('.interact-prompt-prefix');
            const toEl = this.interactPromptEl.querySelector('.interact-prompt-to');
            if (prefixEl) prefixEl.textContent = pressWord;
            if (toEl) toEl.textContent = toWord;
        } else {
            this.interactPromptEl.innerHTML = `
                <span class="interact-prompt-prefix">${pressWord}</span>
                <span class="interact-key-pill">E</span>
                <span class="interact-prompt-to">${toWord}</span>
                <span id="interact-prompt-icon" class="interact-icon">${iconSvg}</span>
                <span id="interact-prompt-text" class="interact-text">${action}</span>
            `;
        }
        this.interactPromptEl.setAttribute('title', `Click or Tap to ${action} (Press E)`);

        this.interactPromptEl.style.left = `${safeX}px`;
        this.interactPromptEl.style.top = `${safeY}px`;
        this.interactPromptEl.style.display = 'flex';
        this.interactPromptEl.classList.remove('hidden');
    }

    setExploreMode(isExplore) {
        this.isExploreMode = isExplore;
        if (!isExplore) {
            this.keys.forward = false;
            this.keys.backward = false;
            this.keys.left = false;
            this.keys.right = false;
            this.keys.sprint = false;
            this.keys.jump = false;
            this.joystickVector.x = 0;
            this.joystickVector.y = 0;
            if (this.interactPromptEl) {
                this.interactPromptEl.classList.add('hidden');
            }
        }
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        const isForceLandscape = document.body.classList.contains('force-landscape') && window.innerWidth < window.innerHeight;
        const width = isForceLandscape ? window.innerHeight : window.innerWidth;
        const height = isForceLandscape ? window.innerWidth : window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height, false);
        if (this.postProcessing) {
            this.postProcessing.onResize(width, height);
        }
        const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 768;
        this.isMobileDevice = isMobileDevice;
        const targetDpr = (this.graphicsSettings && this.graphicsSettings.dpr !== undefined)
            ? this.graphicsSettings.dpr
            : (isMobileDevice ? 1.0 : 1.25);
        this.renderer.setPixelRatio(targetDpr);
    }

    getNpcVnDialogueData(npcId) {
        const id = (npcId || 'lumina').toLowerCase();
        const ret = this.retargeter;
        const toast = this.onToast ? this.onToast.bind(this) : console.log;

        if (id.includes('sakura')) {
            return {
                lines: [
                    {
                        en: "Greetings, developer. The fragrant lotus tea and gentle breeze by our tranquil pond bring peace to the soul.",
                        vi: "Chào bạn. Hương sen ban mai bên hồ tĩnh tâm thật êm dịu, giúp tâm trí người lập trình lắng đọng lại...",
                        emotion: "Serene"
                    },
                    {
                        en: "Look at the cherry petals and maple leaves floating in the wind. Would you care to join me in meditation or share a warm cup?",
                        vi: "Những cánh hoa anh đào và lá phong đang lững lờ trôi theo gió. Bạn có muốn cùng ngồi thiền định một chút không?",
                        emotion: "Kind"
                    }
                ],
                choices: [
                    {
                        icon: 'sparkles',
                        text: { en: "Meditate in Zen posture", vi: "Ngồi thiền định thanh lọc tâm trí" },
                        action: () => {
                            if (ret) ret.setAnimation('Meditate');
                            toast("Bạn cùng Sakura tĩnh tâm thiền định. Tinh thần đạt trạng thái Zen! (+50 XP)", "success");
                        }
                    },
                    {
                        icon: 'users',
                        text: { en: "Bow respectfully to Sakura", vi: "Cúi chào trang trọng phong cách Nhật" },
                        action: () => {
                            if (ret) ret.setAnimation('Bow');
                            toast("Sakura khẽ cúi đầu mỉm cười đáp lễ bạn rất nhã nhặn.", "info");
                        }
                    },
                    {
                        icon: 'coffee',
                        text: { en: "Sip refreshing green tea", vi: "Thưởng thức một ngụm trà xanh" },
                        action: () => {
                            if (ret) ret.setAnimation('DrinkCan');
                            toast("Hương trà thơm ngát giúp bạn hồi phục năng lượng!", "info");
                        }
                    }
                ]
            };
        } else if (id.includes('ren')) {
            return {
                lines: [
                    {
                        en: "System scan complete: Core telemetry healthy, 60 FPS steady, zero memory leaks across all biomes.",
                        vi: "Kiểm tra hệ thống: Nhân kernel ổn định, 60 FPS mượt mà, không phát hiện rò rỉ bộ nhớ ở bất kỳ vùng nào.",
                        emotion: "Stoic"
                    },
                    {
                        en: "The Torii Gate Network has successfully established warp links across the Hub, Zen Pond, Summit, and Coast. Stay vigilant, architect.",
                        vi: "Hệ thống Cổng Torii đã liên kết trọn vẹn 4 vùng địa hình. Hãy để ý bản đồ radar chiến thuật [M] khi di chuyển.",
                        emotion: "Focus"
                    }
                ],
                choices: [
                    {
                        icon: 'shield',
                        text: { en: "Confirm all system metrics nominal", vi: "Báo cáo toàn bộ chỉ số hệ thống đạt chuẩn" },
                        action: () => {
                            toast("Ren gật đầu tán thành: 'Bản build hoàn hảo, tiến hành giữ nhịp 24/7!' (+60 XP)", "success");
                        }
                    },
                    {
                        icon: 'users',
                        text: { en: "Salute the System Auditor", vi: "Cúi chào chuyên viên kiểm định Ren" },
                        action: () => {
                            if (ret) ret.setAnimation('Bow');
                            toast("Ren nghiêm cẩn gật đầu chào lại bạn.", "info");
                        }
                    }
                ]
            };
        } else if (id.includes('kaede')) {
            return {
                lines: [
                    {
                        en: "Yahoo! You're here! I just ran our full automated verification suite, and all 4 living world systems passed with flying colors!",
                        vi: "A! Bạn tới rồi! Mình vừa chạy xong toàn bộ bộ kiểm thử tự động, cả 4 hệ thống thế giới mở đều vượt qua xuất sắc!",
                        emotion: "Cheer"
                    },
                    {
                        en: "Open Photo Mode [P] right now! The alpine snowy ridge and coastal sunset look absolutely breathtaking in anime style!",
                        vi: "Bật chế độ Chụp ảnh [P] lên ngay đi! Dãy núi tuyết và hoàng hôn trên bãi biển lúc này lên hình anime đẹp xỉu luôn đó!",
                        emotion: "Excited"
                    }
                ],
                choices: [
                    {
                        icon: 'camera',
                        text: { en: "Strike a cute Photo Pose (V-Sign)", vi: "Tạo dáng V-sign chụp ảnh cùng Kaede" },
                        action: () => {
                            if (ret) ret.setAnimation('PhotoPose');
                            toast("Bức ảnh kỉ niệm tuyệt đẹp cùng Kaede đã được lưu! (+50 XP)", "success");
                        }
                    },
                    {
                        icon: 'sparkles',
                        text: { en: "Toast to a clean release (Kanpai!)", vi: "Cùng nâng ly chúc mừng bản phát hành (Kanpai!)" },
                        action: () => {
                            if (ret) ret.setAnimation('DrinkCan');
                            toast("Kanpai! Chúc mừng hệ thống vận hành trơn tru không tì vết!", "success");
                        }
                    }
                ]
            };
        } else {
            // Lumina (Default)
            return {
                lines: [
                    {
                        en: "Welcome to TeleTerm 3D! I'm optimizing the WebGL2 shaders and real-time multiplayer presence engine.",
                        vi: "Chào mừng bạn đến với TeleTerm 3D! Mình đang tinh chỉnh cụm shader WebGL2 và hệ thống hiện diện mạng MMO thời gian thực.",
                        emotion: "Joy"
                    },
                    {
                        en: "Notice how fluid the new anime gestures and secondary spring bone physics feel? Zero stiffness, completely organic!",
                        vi: "Bạn có thấy các cử chỉ anime và chuyển động lò xo thứ cấp mượt mà không? Không hề bị giật cục hay gượng gạo chút nào luôn!",
                        emotion: "Proud"
                    }
                ],
                choices: [
                    {
                        icon: 'sparkles',
                        text: { en: "Dance with Lumina (Vibe Dance)", vi: "Nhảy điệu Vibe Dance cùng Lumina" },
                        action: () => {
                            if (ret) ret.setAnimation('VibeDance');
                            toast("Bạn và Lumina cùng nhún nhảy theo nhịp điệu anime thật vui tươi! (+50 XP)", "success");
                        }
                    },
                    {
                        icon: 'users',
                        text: { en: "Wave back cheerfully", vi: "Vẫy tay chào lại Lumina thân thiện" },
                        action: () => {
                            if (ret) ret.setAnimation('Wave');
                            toast("Lumina mỉm cười rạng rỡ vẫy tay chào bạn!", "info");
                        }
                    },
                    {
                        icon: 'cpu',
                        text: { en: "Inquire about 60 FPS GPU optimization", vi: "Hỏi về bí quyết tối ưu GPU đạt 60 FPS" },
                        action: () => {
                            toast("Lumina chia sẻ: 'GPU Instancing cho hạt thời tiết và exponential decay cho chuyển động là chìa khóa!' (+40 XP)", "info");
                        }
                    }
                ]
            };
        }
    }
}
