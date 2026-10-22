# 🚀 TELETERM 3D — MASTER PROJECT HANDOVER & ARCHITECTURAL SPECIFICATION
> **Document Purpose:** Complete, authoritative architectural guide, annotated file tree, subsystem breakdown, progress audit, and handover manual for **Gemini 4 Argon** (and any future AI/engineering collaborators) on the web.  
> **Repository Root:** `E:\Terminal control`  
> **Runtime Environment:** Windows 11 x64 · Node.js 18+ · Three.js r128 (ESM) · WebGL 2 · Electron Desktop Client · Cloudflare Tunnel

---

## 📑 TABLE OF CONTENTS
1. [Executive Summary & Product Vision](#1-executive-summary--product-vision)
2. [Master Architecture & Tech Stack](#2-master-architecture--tech-stack)
3. [Complete Annotated File Tree](#3-complete-annotated-file-tree)
4. [Subsystem Deep Dives](#4-subsystem-deep-dives)
   - 4.1. [3D Open World & Environmental Reconstruction](#41-3d-open-world--environmental-reconstruction)
   - 4.2. [Cross-Platform Performance & Draw Call Optimization](#42-cross-platform-performance--draw-call-optimization)
   - 4.3. [Character, Animation, Secondary Physics & Handheld Items](#43-character-animation-secondary-physics--handheld-items)
   - 4.4. [Authoritative Quest & Developer Gamification Engine](#44-authoritative-quest--developer-gamification-engine)
   - 4.5. [Claude Minimalist UI & Responsive Telemetry Top Bar](#45-claude-minimalist-ui--responsive-telemetry-top-bar)
   - 4.6. [ADE Studio & Visual Dual-Pane Test Dashboard](#46-ade-studio--visual-dual-pane-test-dashboard)
   - 4.7. [AI Pair Programming Ecosystem (Codex + Antigravity)](#47-ai-pair-programming-ecosystem-codex--antigravity)
   - 4.8. [ConPTY Terminal & Cloudflare Zero-Config Networking](#48-conpty-terminal--cloudflare-zero-config-networking)
5. [Current Progress & Verification Matrix](#5-current-progress--verification-matrix)
6. [Quickstart & Testing Commands for Gemini 4 Argon](#6-quickstart--testing-commands-for-gemini-4-argon)
7. [Future Roadmap & Immediate Next Steps](#7-future-roadmap--immediate-next-steps)

---

## 1. EXECUTIVE SUMMARY & PRODUCT VISION

**TeleTerm** is a groundbreaking, hybrid software platform combining:
1. **A True Remote Terminal & Agent Controller:** Connects from any phone, laptop, or browser over secure Cloudflare Tunnel to execute and monitor Windows ConPTY terminal sessions (PowerShell, CMD, WSL, Claude Code, Aider, Python) with zero port-forwarding and session persistence.
2. **A 3D Developer Metaverse:** A serene, anime-stylized Japanese countryside open world powered by Three.js & WebGL 2. Developers code, run tests, consult AI copilots, listen to procedural Lo-Fi chillhop, and wander through cherry groves, rice fields, tatami tea pavilions, bamboo forests, rivers, and alpine mountains.
3. **Multi-Agent Workspace:** Seamless integration with OpenAI Codex Desktop, Google Antigravity (AGY) Agentic SDK, and Claude Code with live streaming, tool call execution, interactive `/grill-me` modal choices, and diff viewing.
4. **ADE Studio (Agentic Development Environment):** An in-browser IDE dock equipped with Monaco Editor, fuzzy symbol search, git diff inspector, and a dual-pane live Test Dashboard.
5. **Gamification & Social Systems:** Server-authoritative questing, EXP, leveling, unlocked emotes, custom player titles, notice board bounties, and proximity MMO chat.

### Core Engineering Laws (Governing All Development)
- **Anti-AI-Slop Constitution:** No primitive spam (no random untextured boxes/cylinders), no flat backdrop planes, no unmotivated carousels, and no generic purple gamer RGB. Everything is authored with wabi-sabi organic variation, Claude.ai-inspired glassmorphism, and intentional environmental composition.
- **Dependency Chain Discipline:** Features must be built bottom-up:
  $$\text{Geometry/World} \rightarrow \text{Data/State} \rightarrow \text{Physics/Animation} \rightarrow \text{Server Authority} \rightarrow \text{UI/HUD} \rightarrow \text{Runtime Verification}$$
- **Zero PC Degradation:** Performance optimizations (batching, LOD, culling) must never sacrifice high-end PC fidelity (1080p DPR 1.25+, PCF soft shadows, rich materials).

---

## 2. MASTER ARCHITECTURE & TECH STACK

```mermaid
flowchart TD
    subgraph Client ["Client Browser & Electron Desktop (Three.js / WebGL 2)"]
        World["3D Open World Engine<br/>(Terrain, Water, Trees, Shaders)"]
        Avatar["Avatar Retargeter & Face Rig<br/>(VRM / GLB, Cloth/Hair Springs)"]
        QuestHUD["Genshin Quest Tracker HUD<br/>(Docked Bookmark, Radar Meter)"]
        TopNav["Claude Glassmorphism Top Nav<br/>(CPU/RAM Chips, FPS/Frametime)"]
        Deck["Cyberdeck Viewports<br/>(Terminal, Codex, AGY, ADE)"]
    end

    subgraph Server ["Node.js Server Runtime (Port 4000)"]
        HTTP["Express API Server<br/>(Quests, Codex, AGY, ADE, Auth)"]
        WSGateway["WebSocket Gateway<br/>(Realtime Terminal & MMO Rooms)"]
        PTY["ConPTY Subsystem<br/>(node-pty Windows Shell)"]
        QuestSvc["Authoritative Quest Engine<br/>(Auto-claim, XP, Titles)"]
        ProcessTracker["Power & Sleep Inhibitor<br/>(24/7 Keep-Alive)"]
    end

    subgraph External ["External Agent & Cloud Services"]
        Codex["OpenAI Codex Desktop<br/>(~/.codex SQLite & CLI Queue)"]
        AGY["Antigravity CLI & Cloud<br/>(AGY Agentic SDK / API)"]
        Tunnel["Cloudflare Tunnel<br/>(cloudflared.exe 4G/5G remote access)"]
    end

    Client <-->|WebSocket /ws & /realtime| WSGateway
    Client <-->|REST API /api/*| HTTP
    WSGateway <--> PTY
    HTTP <--> QuestSvc
    HTTP <--> Codex
    HTTP <--> AGY
    Server <--> Tunnel
```

### Core Tech Stack
| Tier | Technology | Version / Specification |
| :--- | :--- | :--- |
| **3D Rendering** | Three.js (ESM), WebGL 2 | r128 (imported via browser import maps `/vendor/three/`) |
| **Desktop Wrapper**| Electron, Electron Builder | Electron v44.6, NSIS 64-bit installer |
| **Terminal Core** | node-pty, ConPTY, @xterm/xterm | Xterm v6.0.0, FitAddon, WebLinksAddon |
| **Editor Core** | Monaco Editor | v0.57.0 (AMD loader in iframe) |
| **Backend** | Node.js, Express, WebSocket (`ws`) | Express 5.2.1, ws 8.22.0 |
| **Persistence** | SQLite, JSON Profile Store | `.profiles.json`, `.dev_metaverse_profiles.json` |
| **Remote Access** | Cloudflare Named / Quick Tunnel | `cloudflared.exe` bundled daemon |
| **Testing** | Puppeteer Core, Node Test Runner | Puppeteer v25.12, headless Chrome ANGLE WebGL |

---

## 3. COMPLETE ANNOTATED FILE TREE

```text
e:\Terminal control
├── .desktop_sessions.json           # Active Electron desktop session metadata
├── .dev_metaverse_profiles.json     # Player rank, XP, and unlock cosmetic profiles
├── .env / .env.example              # Environment variables (GitHub OAuth, Ports, Keys)
├── .gitignore                       # Git ignore filters (node_modules, logs, dist)
├── .profiles.json                   # Saved user profiles & remote authentication tokens
├── .tokens.json                     # Encrypted token cache for external agent services
├── .tunnel_session.json             # Live Cloudflare Tunnel URL & PID state
├── package.json                     # Node.js project manifest & scripts (start, desktop, test)
├── package-lock.json                # Deterministic dependency lockfile
├── README.md                        # High-level project documentation
├── start.bat                        # 1-click Windows batch startup script
├── TeleTerm 3D Launcher.bat         # Standalone desktop game launcher batch file
├── TELETERM_MASTER_HANDOVER.md      # [THIS FILE] Authoritative project handover specification
│
├── bin/                             # Native binary toolchains
│   ├── cloudflared.exe              # Cloudflare Tunnel CLI daemon for remote 4G/5G routing
│   ├── ConsoleBridge.exe            # Windows native console input injection bridge
│   └── ScreenCapture.exe            # Ultra-fast GDI/DirectX desktop frame grabber
│
├── build/                           # Application build assets & installer icons
│   ├── icon.ico                     # Windows multi-resolution desktop executable icon
│   └── icon.png                     # 512x512 high-res application icon
│
├── scripts/                         # Build, maintenance & verification utility scripts
│   ├── audit-visual-baseline.js     # Baseline image capture for anti-slop regression audit
│   ├── build-npc-dialogues.js       # Dialogue compiler generating structured JSON trees
│   ├── capture-3d-group-photo.mjs   # Studio screenshot tool for avatar group portraits
│   ├── dialogue-kaede.js            # Dialogue asset script for Kaede (Tea Priestess)
│   ├── dialogue-lumina.js           # Dialogue asset script for Lumina (AI Architect)
│   ├── dialogue-ren.js              # Dialogue asset script for Ren (Tech Scholar)
│   ├── dialogue-sakura.js           # Dialogue asset script for Sakura (Spring Priestess)
│   ├── generate-icons.js            # SVG to ICO/PNG multi-size icon generator
│   └── verify-visual-upgrades.js    # Visual quality verification runner
│
├── src/                             # Backend Server, Desktop Shell & Agent Systems
│   ├── agents/                      # Multi-agent core abstraction
│   │   ├── agent-runtime.js         # Unified agent orchestrator & turn coordinator
│   │   ├── agent-session-manager.js # Multi-session thread tracker
│   │   └── provider-adapters/       # Adapter drivers for AI engines
│   │       ├── antigravity-adapter.js # Google Antigravity SDK & CLI adapter
│   │       ├── base-adapter.js      # Base class declaring streaming turn contract
│   │       ├── codex-adapter.js     # OpenAI Codex Desktop CLI & SQLite adapter
│   │       └── universal-adapter.js # Universal custom agent API adapter
│   ├── bridge/
│   │   └── ConsoleBridge.cs         # C# source for Windows low-level input redirection
│   ├── context/
│   │   └── context-engine.js        # Project context builder (AST & directory summarizer)
│   ├── desktop/                     # Electron Desktop Application Shell
│   │   ├── main.js                  # Electron main process (Window management, tray, shortcuts)
│   │   └── preload.js               # Context-isolated secure desktop bridge (`window.TeleTermPlatform`)
│   ├── diffs/                       # Git Diff & Code Revision Management
│   │   ├── diff-manager.js          # Unified diff calculator & patch generator
│   │   └── revision-manager.js      # Rollback & checkpoint transaction tracker
│   ├── events/
│   │   └── event-bus.js             # Internal server-wide EventEmitter bus
│   ├── filesystem/                  # Workspace File Operations
│   │   ├── workspace-file-watcher.js # Debounced Chokidar-like recursive watcher
│   │   └── workspace-filesystem.js  # Safe async file I/O & path sanitizer
│   ├── git/
│   │   └── workspace-git.js         # Native git status, diff, commit, and branch wrapper
│   ├── native/
│   │   └── ScreenCapture.cs         # C# native screenshot utility source
│   ├── permissions/
│   │   └── permission-engine.js     # Granular tool permission & safety guardrails
│   ├── server/                      # Node.js Core Backend Runtime
│   │   ├── index.js                 # Server entrypoint (Express + HTTP/WS servers on 4000)
│   │   ├── config.js                # Environment config loader & default options
│   │   ├── logger.js                # Leveled terminal logger with timestamping
│   │   ├── notifier.js              # Push notification dispatcher (ntfy.sh & system)
│   │   ├── power-manager.js         # Windows SetThreadExecutionState sleep inhibitor
│   │   ├── process-tracker.js       # Background subprocess monitor & zombie killer
│   │   ├── pty-manager.js           # ConPTY manager creating and pooling pseudo-terminals
│   │   ├── token-store.js           # Secure credential storage & encryption
│   │   ├── tunnel.js                # Cloudflare Tunnel supervisor (spawns cloudflared.exe)
│   │   ├── account-manager.js       # User profile & quota accounting
│   │   ├── ade-router.js            # REST router for ADE test discovery & executions
│   │   ├── antigravity-manager.js   # AGY local process supervisor & REST endpoints
│   │   ├── antigravity-verifier.js  # AGY tool execution verifier
│   │   ├── codex-manager.js         # Codex Desktop ~/.codex SQLite reader & queue
│   │   ├── credential-manager.js    # API keys & SSH credential manager
│   │   ├── universal-agent-manager.js # Custom LLM endpoints & proxy manager
│   │   ├── auth/                    # Authentication subroutines
│   │   │   ├── desktop-auth.js      # Local desktop machine hardware ID authenticator
│   │   │   ├── github-auth.js       # GitHub OAuth 2.0 flow & token exchanger
│   │   │   └── security.js          # Passwordless QR token generation & HMAC validation
│   │   ├── avatar/
│   │   │   └── asset-validator.js   # Uploaded VRM / GLB mesh and bone validator
│   │   ├── persistence/
│   │   │   └── profile-repository.js# SQLite / JSON backing store for gamification
│   │   ├── progression/             # Gamification & Progression Subsystem
│   │   │   ├── quest-definitions.js # Authoritative Quest definitions (Q101-Q106, B201-B203)
│   │   │   ├── quest-router.js      # REST API router (`/api/quests/*`)
│   │   │   ├── quest-service.js     # Server-authoritative quest engine & auto-claim logic
│   │   │   ├── title-service.js     # Custom unlocked title registry (e.g. "AI Companion")
│   │   │   └── xp-service.js        # EXP curve, leveling math & level-up dispatcher
│   │   ├── realtime/                # WebSocket Real-Time Gateways
│   │   │   ├── gateway.js           # Primary WS gateway (`/ws` terminal & `/realtime` MMO)
│   │   │   ├── ade-gateway.js       # Dedicated ADE test streaming gateway (`/ade-ws`)
│   │   │   └── room-manager.js      # Spatial MMO room & player coordinate broadcaster
│   │   ├── social/
│   │   │   └── chat-service.js      # Global & private whisper chat routing & history
│   │   └── terminal/
│   │       └── telemetry-service.js # Live CPU, RAM, and terminal activity metrics
│   ├── terminal/
│   │   └── workspace-terminal.js    # Server-side terminal process lifecycle controller
│   ├── verification/
│   │   └── verification-runner.js   # Automated test verification engine for ADE Studio
│   └── workspace/
│       ├── workspace-manager.js     # Multi-workspace directory switcher
│       └── workspace-runtime.js     # Project context runtime state
│
├── public/                          # Frontend Static Assets & Web Client (Served via Express)
│   ├── index.html                   # Master 3D Client SPA Entrypoint
│   ├── launcher.html                # Standalone Web & Mobile Game Launcher
│   ├── ade.html                     # Standalone ADE Studio Full-Screen Viewport
│   ├── group-photo-studio.html      # 3D Avatar Photo Studio tool
│   ├── manifest.json                # PWA Progressive Web App manifest
│   ├── sw.js                        # Service Worker for offline asset caching
│   ├── style.css                    # Master Stylesheet (Claude.ai glassmorphism aesthetic)
│   ├── app.js                       # Frontend Application Orchestrator & View Switcher
│   ├── teleterm-3d.js               # Legacy 3D bridge wrapper
│   ├── css/
│   │   ├── ade.css                  # ADE Studio IDE docking & dual-pane test styles
│   │   └── desktop-launcher.css     # Game launcher & boot pipeline styling
│   ├── models/                      # 3D Meshes & Avatars
│   │   ├── anime-character.glb      # Primary default anime heroine avatar
│   │   └── custom/                  # User-uploaded custom VRM/GLB avatars
│   ├── js/                          # Modular Frontend JavaScript (ESM)
│   │   ├── open-world-3d.js         # Master 3D Scene Controller (Three.js loop, camera, lighting)
│   │   ├── terminal-manager.js      # Xterm.js client manager with keyboard & snippet bars
│   │   ├── cyberdeck-3d.js          # In-world 3D floating holographic display panels
│   │   ├── codex-deck.js            # OpenAI Codex Desktop Chat UI with command cards
│   │   ├── antigravity-deck.js      # Antigravity live session UI & choice buttons
│   │   ├── antigravity-web-chat.js  # AGY full-screen streaming chat client
│   │   ├── universal-agent-deck.js  # Universal agent client UI
│   │   ├── multiplayer-client.js    # Client-side spatial MMO entity interpolator
│   │   ├── mmo-chat.js              # Chat UI (Global tab, Whisper tab, Chat bubbles)
│   │   ├── avatar-customizer.js     # 3D Avatar skin, outfit, hair, and accessory selector
│   │   ├── accounts-quota-manager.js# Account details & external AI quota monitor modal
│   │   ├── lofi-engine.js           # Procedural Web Audio Lo-Fi chillhop beat synthesizer
│   │   ├── markdown-renderer.js     # High-speed markdown parser with syntax highlighting
│   │   ├── vietnamese-input.js      # Native Telex/VNI IME engine for in-world terminal typing
│   │   ├── hud-widgets.js           # Floating screen widgets & crosshairs
│   │   ├── xp-hud.js                # Top bar level capsule & celebratory level-up animations
│   │   ├── tools-drawer-manager.js  # Mobile touch drawer controller
│   │   ├── auto-updater.js          # Live file-watcher client hot-reload receiver
│   │   ├── i18n.js                  # Bilingual localization dictionary (EN / VI)
│   │   │
│   │   ├── ade/                     # ADE (Agentic Development Environment) Studio
│   │   │   ├── ade-app.js           # ADE Master Layout & Docking Manager
│   │   │   ├── test-dashboard.js    # Dual-Pane Visual Test Explorer & Live Log Streamer
│   │   │   ├── quick-open.js        # Ctrl+P / Cmd+P Fuzzy File Finder
│   │   │   ├── symbol-indexer.js    # AST Code Symbol Indexer for instantaneous jumping
│   │   │   ├── ade-search.js        # Global workspace grep & search controller
│   │   │   ├── agents/ade-agent-deck.js # Agent chat embedded in ADE Studio
│   │   │   ├── diffs/ade-diff-viewer.js # Split-screen visual diff viewer
│   │   │   ├── editor/ade-monaco.js # Monaco Editor initialization & language wiring
│   │   │   ├── state/ade-state.js   # ADE reactive state container
│   │   │   ├── terminal/ade-terminal.js # Embedded ConPTY terminal dock
│   │   │   └── workspace/ade-client.js  # WebSocket client for `/ade-ws`
│   │   │
│   │   ├── animation/               # Character Animation & Rigging
│   │   │   ├── animation-library.js # Procedural & retargeted clips (Idle, Walk, Run, Sit, Drink)
│   │   │   ├── avatar-retargeter.js # Humanoid bone retargeter & Secondary Motion Solver
│   │   │   ├── avatar-face-rig.js   # Anime facial rig (Blinks, mouth visemes, pupil tracking)
│   │   │   └── humanoid-contract.js # Universal humanoid bone name dictionary
│   │   │
│   │   ├── interaction/             # In-World Physical Interactions
│   │   │   └── interaction-manager.js # Raycast interaction manager (E key triggers, prompts)
│   │   │
│   │   ├── inventory/               # Item & Hotbar Mechanics
│   │   │   └── player-inventory.js  # 9-Slot Minecraft-style hotbar, item persistence, dragging
│   │   │
│   │   ├── launcher/                # Desktop & Web Launcher Frontend
│   │   │   ├── desktop-launcher.js  # Impeccable Launcher UI (Cherry blossom canvas, server ping)
│   │   │   ├── launcher-state-machine.js # State machine (BOOTING, READY, IN_WORLD)
│   │   │   └── standalone-launcher.js # Standalone launcher loader
│   │   │
│   │   ├── npc/                     # NPC Autonomous Life & Dialogue
│   │   │   ├── npc-life-system.js   # NPC schedule, routines, seating & 3-tier distance LOD
│   │   │   ├── npc-navigation-system.js # Water/bridge-aware spatial navigation & obstacle avoiding
│   │   │   ├── npc-dialogue-data.js # Authored dialogue lines (>800 lines across 4 NPCs)
│   │   │   ├── npc-dialogue-system.js # Dialogue typewriter, contextual resolver, skip on click
│   │   │   └── player-context.js    # Gathers player posture, location, rank for NPC awareness
│   │   │
│   │   ├── platform/
│   │   │   └── teleterm-platform.js # Platform capability detector (Web vs Desktop Electron)
│   │   │
│   │   ├── presence/
│   │   │   └── developer-presence.js# Discord Rich Presence & MMO activity broadcaster
│   │   │
│   │   ├── quest/                   # Client Quest Manager
│   │   │   └── quest-manager.js     # Synchronizes with server quest engine, events, audio fanfare
│   │   │
│   │   ├── ui/                      # HUD & Modal Components
│   │   │   ├── quest-tracker-hud.js # Genshin-style quest tracker (Collapses to 36px left bookmark)
│   │   │   ├── graphics-settings-manager.js # Graphics modal with 3 hardware profiles (Mobile/Web/PC)
│   │   │   ├── notice-board-modal.js# Hub Notice Board quest log & bounty board UI
│   │   │   ├── emote-wheel.js       # 6-Slice radial emote wheel (G key hotkey)
│   │   │   ├── overhead-ui-system.js# Floating 3D nameplates, quest markers (!/?), chat bubbles
│   │   │   └── theme-manager.js     # Light/Dark Claude.ai color variable controller
│   │   │
│   │   └── world/                   # 3D Environment Systems (Three.js)
│   │       ├── performance-manager.js# Dynamic Resolution Scaling (DRS) & frametime telemetry
│   │       ├── tree-system.js       # Merged BufferGeometry batching for 40+ trees (Trunks & Canopies)
│   │       ├── rice-field-system.js # Multi-tiered rice paddies with translucent water & instanced crops
│   │       ├── river-system.js      # Natural curved riverbed, flow normals, shoreline foam
│   │       ├── water-system.js      # Dynamic planar water reflection & distortion shader
│   │       ├── terrain-system.js    # Multilevel elevation, hills, river excavation, biome blending
│   │       ├── terrain-streaming.js # Chunk-based terrain geometry streamer
│   │       ├── atmosphere-system.js # Realistic atmospheric Rayleigh/Mie haze, sun azimuth
│   │       ├── weather-system.js    # Procedural weather states (Clear, Overcast, Petals, Rain)
│   │       ├── time-of-day-system.js# Day/Night solar cycle & dynamic ambient lighting
│   │       ├── bamboo-forest-system.js # Clustered bamboo stalks with natural wind bending
│   │       ├── maple-forest-system.js # Autumn maple grove with reddish-orange leaf canopies
│   │       ├── pine-forest-system.js  # Alpine evergreen pine forest
│   │       ├── vegetation-system.js # Instanced grass tufts, wild flowers, reeds
│   │       ├── mountain-system.js   # Distant alpine snow peak silhouettes & layered ridge massing
│   │       ├── beach-system.js      # Coastal sandy shoreline, breaking surf & ocean horizon
│   │       ├── landmarks-system.js  # Pier boardwalk, tea pavilion, village square, benches, lamps
│   │       ├── path-system.js       # Cobblestone & dirt road network conforming to terrain
│   │       ├── world-composition.js # Master scene assembler binding all environmental systems
│   │       ├── world-collision-system.js # Raycast & capsule collision preventing walking through walls
│   │       ├── world-region-system.js # Spatial biome boundary tracker (Hub, Village, Rice, Mountain)
│   │       ├── surface-detector.js  # Raycast surface identifier under avatar feet
│   │       ├── surface-registry.js  # Surface material physical properties (Dirt, Wood, Stone, Water)
│   │       ├── footstep-audio-system.js # Surface-specific procedural footstep sound generator
│   │       ├── ambient-world-audio.js # 3D positional ambient soundscapes (Wind, water, birds)
│   │       ├── sound-settings-manager.js # Audio mixer controls (Master, Ambience, Players)
│   │       └── pc-max-materials.js  # High-fidelity PBR material definitions for PC Ultra tier
│
└── test/                            # Automated Verification Test Suite
    ├── test-quest-and-performance-verification.mjs # Master E2E Puppeteer test suite
    ├── test-open-world-master.mjs   # Full 3D open world automated navigation test
    ├── test-desktop-platform.js     # Desktop Electron bridge unit tests
    ├── test-ade-runtime.js          # ADE Studio compilation & execution tests
    └── test-gamification-curve.js   # EXP and Level curve mathematical balance tests
```

---

## 4. SUBSYSTEM DEEP DIVES

### 4.1. 3D Open World & Environmental Reconstruction
The world is constructed without primitive spam or flat colored boxes. Every asset follows a strict geographical and ecological dependency chain:

- **Multilevel Terrain Elevation (`terrain-system.js`):**
  - Continuous heightfield with gentle slopes, elevated plateaus, riverbed depressions, and hillside terraces.
  - Zero flat green planes. Smooth transitions: `Lowland -> Forest Slope -> Foothill -> Snow Ridge`.
- **Natural River & Water Shader (`river-system.js`, `water-system.js`):**
  - Rivers originate from high mountain valleys, flow through carved riverbeds, pass beneath wooden arch bridges, and empty into the coastal ocean.
  - Custom WebGL shader featuring Fresnel reflectance, dual-wave normal distortion, shoreline opacity blending, and soft water foam along riverbanks.
- **Rice Agriculture System (`rice-field-system.js`):**
  - Terraced agricultural basins lined with organic earthen dikes (`dikeBasins`).
  - Shallow standing water layer with subtle sky reflections and mud bed depth coloring.
  - Instanced rice crops planted in natural agrarian rows with organic spacing and stage variations (green vegetative to golden ripe).
- **Forest Layers & Flora (`tree-system.js`, `bamboo-forest-system.js`, `maple-forest-system.js`):**
  - Three distinct botanical biomes: Spring Sakura Grove (Developer Hub), Zen Bamboo Forest (West), Autumn Maple Forest (East), and Alpine Pine Forest (North).
  - Multi-tier canopy: Large old trees, young saplings, flowering bushes, and instanced wind-reactive grass tufts.
- **Distant Scenery & Landmarks (`mountain-system.js`, `landmarks-system.js`):**
  - Multi-layered snow mountain massing with jagged rock ridges and snowpack accumulation.
  - Coastal Boardwalk Pier extending into the surf with wooden lanterns.
  - Tatami Tea Pavilion with authentic seiza sitting cushions.
  - Village square featuring a climbable/ringable vintage bicycle and automated vending machines.

---

### 4.2. Cross-Platform Performance & Draw Call Optimization
To ensure the game runs smoothly on low-end laptops and mobile phones without sacrificing PC visual splendor:

1. **Batch Geometry Merging (`tree-system.js`):**
   - **Problem:** 40+ sakura and cedar trees generated 680 individual meshes, incurring over **1,360 draw calls** per frame (including shadow map passes).
   - **Solution:** Integrated `BufferGeometryUtils.mergeGeometries` to batch all static tree trunks into a single mesh (`MergedTreeTrunks`) and all sakura canopies into `MergedSakuraCanopies`.
   - **Impact:** Cut **~1,354 draw calls** per frame. Preserved 100% of organic wabi-sabi vertex noise, UV mapping, and soft PCF shadow casting on PC.
2. **Rice Field Hardware Density Tiers & Frustum Culling (`rice-field-system.js`):**
   - **PC Profile:** 100% density (step `0.42m`), full two-way shadow passes.
   - **Web Profile:** 70% density (step `0.50m`), shadow receiver only.
   - **Mobile Profile:** 40% density (step `0.64m`), minimal fill-rate overhead.
   - Bounding spheres assigned to each paddy's `InstancedMesh`, enabling Three.js to completely frustum-cull fields when facing away.
3. **Animation Distance LOD (`avatar-retargeter.js`, `npc-life-system.js`):**
   - **LOD 0 (< 20m):** Full 60Hz update: full bone hierarchy, facial blendshapes, skirt cloth solver, hair spring bones.
   - **LOD 1 (20m - 50m):** 30Hz throttled update: bone transforms and skirt simulation active; hair spring bones bypassed.
   - **LOD 2 (> 50m):** 15Hz throttled update: base locomotion transforms only; facial rig and cloth solvers suspended.
   - Spatial translation across terrain remains smooth every frame regardless of animation throttling.
4. **Dynamic Resolution Scaling (DRS) & Telemetry HUD (`performance-manager.js`):**
   - Measures rolling 60-frame frametime. If frametimes exceed target budgets (e.g. 24ms), renderer DPR dynamically scales down (minimum 0.75x) to maintain buttery 60 FPS.

---

### 4.3. Character, Animation, Secondary Physics & Handheld Items
- **Avatar Retargeting & Bone Mapping (`avatar-retargeter.js`, `humanoid-contract.js`):**
  - Universal mapping supporting Mixamo, VRM, and custom humanoid skeletons.
  - Automatic T-pose normalization and spine curvature preservation.
- **Anime Facial Rig (`avatar-face-rig.js`):**
  - Natural involuntary eye blinking every 3–6 seconds with realistic 150ms shutter timing.
  - Smooth 3D pupil gaze tracking looking toward the active camera or dialogue target.
  - Calibrated skin tone with subtle subsurface pinkish undertones and anime ambient occlusion shading (eliminating washed-out white faces).
- **Secondary Motion & Cloth Simulation (`avatar-retargeter.js`):**
  - **Skirt Physics:** Damped spring-chain model reacting to running acceleration, centrifugal turns, jumping gravity, and deceleration overshoots.
  - **Seiza Sitting Drapery:** When sitting at Tatami mats, the skirt automatically transitions into a modest, flattened lap drape preventing legs from clipping through fabric.
  - **Hair Springs:** Inertial lag responding to world wind vectors and avatar velocity.
- **Handheld Item Sockets & Grip Profiles (`avatar-retargeter.js`, `player-inventory.js`):**
  - Data-driven grip profiles (`small_can`, `bottle`, `cup`, `tool`).
  - Direct palm contact with finger curling wrapping the cylindrical can body and thumb stabilization.
  - Natural relaxed forearm angle (forearm angled ~18° inward, avoiding stiff robotic forward arms).
  - **Hold-to-Drink State Machine:** Holding Right Mouse Button raises the beverage to the mouth reference anchor, initiates drinking audio, and lowers naturally upon release.

---

### 4.4. Authoritative Quest & Developer Gamification Engine
Quests are completely server-authoritative (`src/server/progression/quest-service.js`), preventing client-side desync while providing instant gratification:

- **Auto-Claim & Auto-Completion:**
  - When the final step of any quest is fulfilled, the server **immediately auto-claims** the quest, transitions status to `'COMPLETED'`, awards EXP via `xp-service`, grants titles and cosmetic emotes, and automatically unlocks and activates the next quest.
  - Client displays an celebratory toast (`🎉 Hoàn thành: ...`) and plays a procedural radiant fanfare chime via Web Audio.
- **Auto-Tracking Bounties & Developer Quest Line:**
  - `Q101` (Welcome to Developer Metaverse): Speak to Lumina or open Terminal, then run a terminal command.
  - `Q105` (AI Copilot Collaboration): Open Codex AI or Antigravity Assistant tab, then send a prompt to AI.
  - `Q106` (Universal Workspace & IDE): Open Universal Code Editor tab, then run a CLI inspection command (`git status`, `ls`, etc.).
  - `Q102` (Quality Assurance Trial): Run a test verification in ADE Studio or execute `npm test` in terminal, then report to Sakura.
  - `Q103` (Zen of Tea Ceremony): Purchase Green Tea from vending machine, sit in Seiza at Tatami pavilion, and drink.
  - `Q104` (Alpine Summit Pilgrimage): Cross river bridge, hike past rice fields, and sit on hilltop overlook bench.
  - `B201` & `B203` (Bounties): Execute 5 and 10 terminal/CLI commands in the session.
- **Genshin-Style Quest Tracker HUD (`quest-tracker-hud.js`):**
  - Docked on the left side below chat.
  - **Slim Bookmark Tab:** Clicking the collapse button (`▲`) shrinks the tracker into a 36px slim bookmark tab pinned snugly against the left edge (`left: 0`, `border-radius: 0 8px 8px 0`), featuring an animated scroll icon (📜) and pulsing quest diamond (◆). Zero drawer clutter.
  - **Live Target Radar Meter:** Displays realtime distance in meters to the active objective target (e.g. `🎯 12m to target`).

---

### 4.5. Claude Minimalist UI & Responsive Telemetry Top Bar
- **Aesthetic Direction:** Inspired by Claude.ai: ultra-clean frosted glassmorphism (`backdrop-filter: blur(20px)`), warm terracotta accents (`#f08c6a`), subtle border outlines (`rgba(255,255,255,0.08)`), and elegant serif typography (`Lora`, `Instrument Serif`).
- **Top Navigation Bar (`public/style.css`):**
  - **TeleTerm Brand Badge:** Custom vector Prompt-Spark icon (`>_ *`) with glowing hover states.
  - **Hardware Telemetry Chip (`.tele-chip-sys`):** Displays real-time `SYS CPU XX% · RAM XX%` polled directly from host system.
  - **3D Engine Telemetry Chip (`#top-gfx-telemetry-chip`):** Displays active profile and performance: `[PC 60 FPS · 16.6ms]`. Clicking opens the Graphics settings modal.
  - **Responsive Layout Protection:**
    - On screens `<= 1350px`: Navigation button labels collapse to icons (🌸, 🎧, 👕, 🪐), saving ~180px.
    - On screens `<= 1200px`: Developer EXP bar hides, while hardware chips maintain `flex-shrink: 0 !important;` and `white-space: nowrap !important;`. RAM reading is **never truncated or cut off**.

---

### 4.6. ADE Studio & Visual Dual-Pane Test Dashboard
ADE (Agentic Development Environment) Studio (`public/ade.html`, `public/js/ade/`) provides an in-game integrated workstation:
- **Monaco Editor:** Full syntax highlighting, auto-completion, and multi-file tab docking.
- **Dual-Pane Visual Test Dashboard (`test-dashboard.js`):**
  - **Left Pane (Test Suites Explorer):** Filter by status pills (`All`, `❌ Failed`, `⚡ Running`, `✓ Passed`, `⭐ Core`) and real-time search filter.
  - **Right Pane (Live Log & Error Inspector):** Real-time streaming stdout/stderr from test runners. If a test fails, a high-visibility Root-Cause Banner displays the error snippet with a 1-click **"⚡ Send Error to Agent"** button that dispatches the failure trace directly to Codex or Antigravity!

---

### 4.7. AI Pair Programming Ecosystem (Codex + Antigravity)
- **OpenAI Codex Desktop Integration (`codex-manager.js`, `codex-deck.js`):**
  - Reads active project threads, turn history, and file diffs directly from `~/.codex/thread_history_1.sqlite`.
  - Dispatches user prompts via `codex queue --thread ...` with fallback to `codex exec resume`.
  - Visualizes background shell commands with expandable chevron cards and exit code badges.
- **Google Antigravity SDK & Web Chat (`antigravity-manager.js`, `antigravity-web-chat.js`):**
  - Direct bridge to Antigravity CLI and agentic session transcripts (`transcript.jsonl`).
  - Supports streaming thinking blocks, tool execution pills, markdown rendering, and interactive choice buttons (`ask_question` / `/grill-me`).
  - Auto-updates quota tracking in Accounts modal.

---

### 4.8. ConPTY Terminal & Cloudflare Zero-Config Networking
- **Persistent ConPTY Terminal (`pty-manager.js`, `terminal-manager.js`):**
  - Real Windows ConPTY terminal instance running PowerShell 7 or CMD.
  - Sessions persist even if the network disconnects: background scripts keep running 24/7.
  - Reconnects with terminal history replay upon client refresh.
- **Built-in Cloudflare Tunnel (`tunnel.js`):**
  - Automatically launches bundled `bin/cloudflared.exe`.
  - Generates a public HTTPS URL (e.g. `https://xxxx.trycloudflare.com`) printed to console and rendered as a QR code on `/qr`.
  - Allows instant passwordless remote control from mobile smartphones anywhere in the world on 4G/5G.

---

## 5. CURRENT PROGRESS & VERIFICATION MATRIX

| Subsystem / Feature | Verification Method | Status | Evidence Artifact |
| :--- | :--- | :---: | :--- |
| **Top Nav RAM Telemetry** | Puppeteer narrow viewport audit (1280x720) | ✅ VERIFIED | `proof_top_nav_ram_visible.png` |
| **Quest Tracker Left Docking** | 36px collapsed bookmark tab DOM check | ✅ VERIFIED | `proof_quest_tracker_collapsed_left.png` |
| **Quest Auto-Completion** | Simulated terminal commands & AI prompts | ✅ VERIFIED | `proof_quest_auto_completion.png` |
| **Tree Draw Call Batching** | BufferGeometryUtils merging (680->3 meshes) | ✅ VERIFIED | `proof_pc_fidelity_merged_trees_and_shadows.png` |
| **Rice Field Density Tiers** | InstancedMesh count and bounding sphere cull | ✅ VERIFIED | `proof_7_rice_fields_translucent_water.png` |
| **Animation Distance LOD** | 60Hz / 30Hz / 15Hz throttled update solver | ✅ VERIFIED | Verified in `test-open-world-master.mjs` |
| **Avatar Natural Can Grip** | Palm contact & wrapped finger orientation | ✅ VERIFIED | `proof_2_avatar_hand_can_socket.png` |
| **Avatar Facial Rig & Skin** | Eye blinking, pupil tracking, warm undertone | ✅ VERIFIED | `proof_1_avatar_face_features.png` |
| **Seiza Tatami Skirt Drape** | Modest lap folding without clipping | ✅ VERIFIED | `proof_3_tatami_seiza_skirt_modest.png` |
| **3-Tier Graphics Switcher** | Dynamic Resolution Scaling & Profile presets | ✅ VERIFIED | Verified in `test-quest-and-performance-verification.mjs` |

---

## 6. QUICKSTART & TESTING COMMANDS FOR GEMINI 4 ARGON

If you (Gemini 4 Argon) or any engineer need to start and verify TeleTerm:

### 1. Launch Server (Daemon or Terminal)
```bash
# Start backend server on port 4000
npm start
# Server boots on http://localhost:4000
# Cloudflare Tunnel prints public 4G/5G URL and QR code in terminal
```

### 2. Access in Browser
- **Normal Launcher Mode:** `http://localhost:4000` (Opens anime game launcher with start button).
- **Direct 3D World Mode:** `http://localhost:4000?direct=1` (Bypasses launcher straight into the 3D world).
- **Standalone ADE Studio:** `http://localhost:4000/ade.html` (Opens full-screen IDE workspace).
- **Mobile QR Code:** `http://localhost:4000/qr` (View connection QR code for smartphones).

### 3. Run Automated Puppeteer Verification Suite
```bash
node test/test-quest-and-performance-verification.mjs
```
*Executes full end-to-end headless browser test: checks top bar RAM reading, quest bookmark toggle, AI copilot quest auto-completion, 5-command bounty progress, and 3D graphics profile switching.*

### 4. Run Open World Integration Master Test
```bash
node test/test-open-world-master.mjs
```
*Walks player avatar through all biomes (Hub, Village, Rice fields, River bridge, Hilltop, Pier) verifying collision, surface footstep audio, and seating anchors.*

---

## 7. FUTURE ROADMAP & IMMEDIATE NEXT STEPS

When picking up the next phase of development, prioritize the following high-value areas:

1. **Multiplayer Avatar Synchronization (`multiplayer-client.js`, `room-manager.js`):**
   - Replicate equipped handheld items, sitting posture, and custom skin selections over the spatial WebSocket room.
   - Interpolate remote player positions using Hermite spline smoothing to eliminate network jitter.
2. **Refined Mobile Touch Locomotion (`tools-drawer-manager.js`):**
   - Add dual virtual thumbsticks (left: movement, right: camera orbit) with haptic feedback on Android/iOS browsers.
3. **Expanded Soundscape & Weather SFX (`ambient-world-audio.js`):**
   - Implement localized directional 3D audio for river rapids, cicada chirping in the cedar grove, and gentle rain pattering on the tatami roof.
4. **Additional Story Quests (Q107+):**
   - Author quests for nighttime exploration, finding ancient shrine relics, and collaborative multi-agent debugging challenges.

---
*Document authored with meticulous systems engineering and visual artistry standards.*  
*Maintained under the TeleTerm Open Source Engineering Collective.*
