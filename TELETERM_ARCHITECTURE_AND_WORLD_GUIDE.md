# ⚡ TeleTerm 3D — Complete Architecture, Systems & World Lore Guide

> **System State:** Version 5.2 (Bilingual English/Vietnamese, Full Mobile Parity, 2-Seater Bench Seating, High-Fidelity Vintage Mamachari Bicycle Relocation, NPC Diversity & Coastal Pier Elevation)  
> **Platform Support:** Windows 10/11 (Host Machine), Cross-Platform Mobile (iOS Safari / Android Chrome) & Desktop Web (Client)  
> **Rendering Engine:** Three.js r128 (WebGL 2.0, Stylized Anime Aesthetics, ACESFilmic Tone Mapping, Minecraft BSL Atmospheric Sun FX)  
> **Terminal Subsystem:** Microsoft Windows ConPTY via `node-pty`, Xterm.js v5 with Ring Buffer Session Persistence  

---

## 1. System Overview & Architecture

**TeleTerm 3D** seamlessly unifies an enterprise-grade remote terminal controller for Windows developers with a high-performance, 3D open-world anime metaverse. It empowers software engineers, DevOps specialists, and AI researchers to monitor, interact with, and orchestrate autonomous AI agents (Claude Code, Google Antigravity, OpenAI Codex, OpenClaw, Aider) and system CLI processes directly from smartphones or secondary screens across local LAN or Cloudflare Tunnels worldwide.

### High-Level Architecture Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                            CLIENT SIDE                                             |
|                                                                                                    |
|  [ Mobile / Desktop Browser (Touch & Keyboard) ]                                                   |
|        |                                                                                           |
|        +---> Three.js 3D Viewport (Canvas / WebGL 2.0 / ACESFilmic / Minecraft BSL Sun Shaders)     |
|        |       - Procedural 8-Region World Composition (Meadow, Hub, Village, Rice, River, Beach)   |
|        |       - VRoid Humanoid Retargeter & Inverse-Kinematic Cloth Quaternion Compensation       |
|        |       - Autonomous NPC Life System (4 Diverse NPCs with Unique Outfits & 3D Accessories)  |
|        |       - 2-Seater Multi-Slot Long Benches (Left/Right Slot Lateral Offsets: ±0.45m)        |
|        |       - Coastal Wooden Pier Walkway & T-Platform Walkable Elevation System (y ≈ 0.22-0.24m)|
|        |       - Surface-Aware Procedural Web Audio Footstep Engine (Wood, Sand, Water, Stone)     |
|        |                                                                                           |
|        +---> Input Subsystem & Capture-Phase Routing                                               |
|        |       - Window Capture-Phase Event Routing ({ capture: true })                            |
|        |       - Focus Mode Isolation: Terminal has 100% exclusive keyboard custody                |
|        |       - Explore Mode: Automatic Xterm blur & WASD movement key routing                    |
|        |       - Mobile Touch Isolation: Virtual Joystick Touch ID separated from Camera Orbit ID   |
|        |                                                                                           |
|        +---> Realtime MMO Chat & 3D Comic Speech Bubbles                                           |
|        |       - Overhead Screen-Space Comic Speech Bubbles anchored to Head Bone (+0.38m)         |
|        |       - Smart Nametag View-Cone & Distance Culling ('focus' / 'always' / 'off')           |
|        |                                                                                           |
|        +---> Holographic Terminal & Mobile Tools Drawer (22 Productivity Tools)                    |
|        |       - Xterm.js Canvas Engine & ConPTY Stream Buffer with Zero Disconnect Loss           |
|        |       - Mobile Touch Bar (ESC, TAB, Ctrl+C, Arrow Keys, Quick Confirm 'y')                |
|        |       - Multi-Agent Orchestrator (Terminal, Codex, AGY, Claude, Universal Switcher)       |
|        |       - TeleTermI18n: Runtime Zero-Reload English / Vietnamese Bilingual Engine           |
+----------------------------------------------------------------------------------------------------+
                                                  |
                                   WebSocket & HTTPS Gateway Protocol
                                                  |
+----------------------------------------------------------------------------------------------------+
|                                            SERVER SIDE                                             |
|                                                                                                    |
|  [ Cloudflare Tunnel Ingress / Local LAN Gateway (Port 4000) ]                                     |
|        |                                                                                           |
|  [ Node.js Master Gateway (Express + ws) ]                                                         |
|        |                                                                                           |
|        +---> Security Layer: Token Authentication, Rate Limiting, CORS Controls                    |
|        +---> ConPTY Terminal Session Manager: Persistent PTY Registry (tmux-style daemon)          |
|        +---> Windows ConPTY Engine: Spawns PowerShell 7, CMD, WSL, Node, Python, Agent CLIs        |
|        +---> Realtime Metaverse Gateway (/ws/world): 12 Hz World Snapshot Replication & Chat Relay  |
|        +---> Profile & XP Progression Repository: Persistent Developer Levels & Custom Avatars     |
|        +---> Quota & Token Manager: Multi-Account API Key Switcher & Usage Telemetry               |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Comprehensive Feature Audit

### 2.1. ConPTY Session Persistence & Terminal Engine
- **Zero Disconnect Terminations:** When mobile clients disconnect, drop cell service, switch between 4G and Wi-Fi, or lock their smartphone screen, processes spawned on the host Windows machine continue executing uninterrupted in Microsoft ConPTY.
- **Ring Buffer Replay:** Upon client reconnection, the server replays recent terminal ring buffers, ensuring zero lost output or broken ANSI formatting.
- **Multi-Terminal Switching:** Instant switching between concurrent sessions (PowerShell 7, CMD, WSL, Python runtimes).

### 2.2. Multi-Agent AI Integrations
- **Claude Code:** Instant one-tap response buttons (`y` for confirmation, `n` for cancel, `Ctrl+C` for interrupt).
- **Google Antigravity (AGY):** Dedicated telemetry tabs, agent supervision dashboards, and real-time thought stream monitoring.
- **OpenAI Codex & OpenClaw:** Agent switching and multi-session workflows.
- **Multi-Account & Quota Manager:** Dynamic switching between API keys and subscription tiers directly from the UI.

### 2.3. Dual Focus vs Explore Modes
- **Focus Mode (`mode-focus`):** Maximizes terminal productivity. The terminal workspace is centered with quick toolbars, CPU/RAM telemetry chips, and session controls. OpenWorld3D suspends movement processing so keyboard inputs (`W`, `A`, `S`, `D`, `Enter`, arrows) belong 100% exclusively to the shell.
- **Explore Mode (`mode-explore`):** Fades the terminal into holographic suspension (`terminal-hidden`), unlocking full 3D avatar control across the virtual world. If Xterm's hidden helper textarea had focus, exploration keys immediately steal focus to `#open-world-canvas`.

### 2.4. Full Mobile Tools Drawer (22 Productivity Tools)
The Mobile Tools Drawer offers complete feature parity on handheld devices without requiring a physical keyboard:
1. Quick Command Palette
2. Git Status & Commit Helper
3. Docker Container Manager
4. Active Process Tracker / Task Killer
5. Remote File Explorer
6. SSH Connection Manager
7. AI Agent Switcher (Claude / AGY / Codex)
8. API Key & Quota Dashboard
9. System Health & Resource Monitor (CPU, RAM, Uptime)
10. Environment Variable Inspector
11. Port Forwarding & Cloudflare Tunnel Status
12. Network Ping & Latency Telemetry
13. Screen Capture & Output Export
14. Snippets & Script Library
15. Macro Quick-Action Keys
16. Virtual Keyboard Extender (ESC, TAB, CTRL, ALT)
17. Audio Lo-Fi BGM Engine
18. Avatar Customizer
19. MMO Chat & Social Messenger
20. Graphics Quality Settings Suite
21. Language Switcher (EN / VI)
22. Hub Kiosk Remote Terminal Link

### 2.5. Graphics Quality Engine
- **Platform Presets:** Mobile (Medium / Low) vs PC (High / Ultra) presets with automatic hardware detection.
- **Minecraft BSL / Complementary Shaders:** Procedural sun flare corona billboard in sky, lens shimmer, ACESFilmic tone mapping with dynamic exposure (1.15 in Enhanced mode).
- **Anti-Aliasing & DPR Scaling:** FXAA/MSAA toggles with dynamic pixel ratio scaling ($\text{DPR } 1.0 - 1.5$).
- **Dynamic Shadow Maps:** Off, 512 BasicShadowMap, 1024 PCFShadowMap, and 2048 PCFSoftShadowMap.
- **FPS Caps:** 30 FPS Battery Saver, 60 FPS Standard, Uncapped 120 FPS.
- **Smart Nametag Culling:** 'focus' (view cone dot product $> 0.65$ or distance $< 6\text{m}$), 'always', and 'off'.

### 2.6. Bilingual i18n Engine (`TeleTermI18n`)
- Fully synchronized English (`en`) and Vietnamese (`vi`) language packs covering every UI badge, modal, interaction prompt, tooltip, and toast notification.
- Zero-reload instant DOM translation via `data-i18n` attributes and reactive event bus `teleterm:language-changed`.
- Persistent language choice saved in `localStorage ('teleterm_locale')`.

---

## 3. 3D Open World Systems & Lore

### 3.1. World Lore: The Cyber Valley of Developers
The metaverse is set in an idyllic coastal valley where traditional Japanese pastoral landscapes harmonize with cyberpunk hardware. Developers from around the world take the form of anime avatars who congregate at the **Developer Hub & Cafe Deck**, hack on decentralized terminals overlooking the sea, or take tranquil walks through sakura groves and rice paddies to contemplate software architecture.

### 3.2. World Geography & 8 Distinct Regions
1. **Developer Hub & Co-working Deck (`z: -5 to +18, x: -16 to +18`):** Central gathering pavilion with wooden deck planks, coding desks with glowing laptops, coffee bar counter with high chrome stools, and central hologram kiosk.
2. **Countryside Village Plaza (`z: -28 to -17, x: -6 to +6`):** Cobblestone square with a rustic vending machine dispensing cold drinks and a bulletin notice board.
3. **Terraced Flooded Rice Country (`z: -38 to +18, x: -45 to -15`):** Tiered earthen berms with water basins reflecting the sky, crossed by timber flume footbridges.
4. **Meandering River Valley (`z: 18 to 35, x: -10 to +30`):** Gently babbling freshwater river crossed by an 11-meter arched wooden bridge.
5. **Blooming Cherry Blossom Avenue (`z: 18 to 45`):** Gravel paths framed by weeping sakura trees, drifting petal emitters, and roadside rest benches.
6. **Hillside Grove & Panorama Overlook (`z: -20 to -10, x: 15 to 30`):** Grassy hillside rising eastward with cherry groves and vista resting spots.
7. **Alpine Foothills & Snowy Mountain Massif (`z < -32`):** Rugged northern elevation leading toward snow-capped peaks with mountain overlook benches.
8. **Coastal Sand Dunes & Fishing Pier (`z: 48 to 100, x: -45 to +65`):** Golden sand dunes, wet shoreline band, beach umbrellas, and a 24-meter wooden pier walkway extending out over the ocean waves.

---

## 4. NPC Visual Diversity & Procedural 3D Accessories

Rather than sharing identical clone appearances, each NPC is endowed with a unique visual identity reflecting their role, lore, and personality:

| NPC | Role | Hair Style & Color | Outfit Theme | Procedural 3D Head Accessory |
| :--- | :--- | :--- | :--- | :--- |
| **Lumina (`✨`)** | AI Architect & Researcher | Platinum Starlight (`#dbeafe`) | Midnight Tech Navy & Silver Ruffles (`#1e293b`) | Holographic Cyber-Visor & Glowing Data-Diamond Clip |
| **Sakura (`🌸`)** | Spring Priestess & UI Designer | Pastel Cherry Blossom (`#f472b6`) | Traditional Floral White & Sakura Pink (`#fce7f3`) | Handcrafted 5-Petal Sakura Kanzashi Hairpin with Red Tassel |
| **Ren (`🔮`)** | Tech Scholar & Systems Hacker | Twilight Amethyst (`#8b5cf6`) | Dark Obsidian & Violet Scholar Coat (`#1e1b4b`) | Mystic Scholar Hairclip with Glowing Amethyst Rune Gem |
| **Kaede (`⚙️`)** | Mechanical & Graphics Engineer | Warm Chestnut Autumn (`#d97706`) | Industrial Forest Emerald & Leather (`#064e3b`) | Steampunk Brass Engineer Goggles perched on Forehead |

### Procedural Rigged Accessory Architecture
- All 3D anime accessories are constructed procedurally from lightweight Three.js primitives (toruses, cones, cylinders, octahedrons) with zero extra network asset downloads.
- Accessories are parented directly to the humanoid `Head` bone (`J_Bip_C_Head`), ensuring they naturally inherit head rotation, breathing, walking bobs, and seated postures across all animation states.

---

## 5. Seating & Spatial Interaction Systems

### 5.1. 2-Seater Multi-Slot Long Bench Architecture
All park and vista benches support simultaneous dual occupancy (allowing 1 player + 1 NPC, 2 NPCs, or 2 players to sit together side-by-side):
- **Benches Supported:**
  * `wayside_sakura_bench`
  * `river_valley_bench`
  * `cherry_grove_bench`
  * `hilltop_panorama_bench`
  * `beach_pier_bench`
  * `beach_shore_bench`
- **Slot Geometry & Lateral Offsets:**
  * Facing rotation angle: $\theta_{\text{rotY}}$
  * Lateral unit vector: $\vec{u}_{\text{lateral}} = (\cos\theta_{\text{rotY}}, 0, -\sin\theta_{\text{rotY}})$
  * Left Seat Slot ($i=0$): $\vec{P}_{\text{left}} = \vec{P}_{\text{bench}} - 0.45\text{m} \cdot \vec{u}_{\text{lateral}}$
  * Right Seat Slot ($i=1$): $\vec{P}_{\text{right}} = \vec{P}_{\text{bench}} + 0.45\text{m} \cdot \vec{u}_{\text{lateral}}$
- **Occupancy Management (`InteractionManager`):**
  * `capacity: 2` defined on bench anchors.
  * When an avatar sits down, the system assigns the nearest or first free slot.
  * If one slot is occupied, the second avatar sits in the other slot without overlapping or clipping.
  * The bench is marked full only when both slots are occupied (`slots.size >= 2`).

### 5.2. Seated Posture Calibration & Skirt Compensation
- **Inverse-Kinematic Cloth Quaternion Compensation (`avatar-retargeter.js`):**
  When seated, thighs pitch forward ($\approx -85^\circ$). VRoid rigs parent `SkirtBack` bones under `UpperLeg`, causing the back skirt to stick straight out horizontally through chair backrests. The retargeter inverts the femur rotation:
  $$q_{\text{comp}} = q_{\text{UpperLeg}}^{-1} \times q_{\text{rest}}$$
  $$q_{\text{SkirtBack0}}.copy(q_{\text{comp}})$$
  This causes the skirt to drape naturally flat against seat cushions without flaring or clipping.
- **High Stools vs Standard Chairs:**
  * High Stools (Bar stools): Thighs slope down ($-1.05\text{ rad}$), calves angle back ($+1.20\text{ rad}$), feet rest neatly on the chrome ring.
  * Standard Chairs / Benches: Thighs horizontal ($-1.48\text{ rad}$), knees bent $90^\circ$ ($+1.48\text{ rad}$), preventing panty exposure.

### 5.3. Hilltop Alpine Panorama Viewpoint Architecture
- **Bench & Viewpoint Positioning (`landmarks-system.js`):**
  * Panoramic bench is situated in an elevated scenic clearing at $(x = 34.0, z = -48.0)$, facing $\theta_{\text{rotY}} = -0.85\pi$ directly toward the colossal distant snow-capped alpine massif.
  * Observation telescope stand is positioned on the left side at $(x = 32.4, z = -47.8)$, grounded at local terrain height, tilted upward toward mountain peaks.
- **Tree Trunk Clearance (`tree-system.js`):**
  * The nearest sakura blossom tree was repositioned to $(x = 38.5, z = -45.5)$ behind the viewpoint clearing, guaranteeing $5.15\text{m}$ clearance from the bench ($> 2.5\text{m}$ requirement) to eliminate any mesh clipping.
- **Round Level Gravel Viewing Pad (`path-system.js`):**
  * The ascending hilltop gravel path terminates smoothly at $(32.6, 0, -43.8)$ onto a circular gravel viewing pad ($R = 2.6\text{m}$, center $(33.2, -46.5)$).
  * Vertices conform directly to terrain at $+0.035\text{m}$, eliminating sharp road geometry ramps and preventing any path triangles from intersecting the bench planks or seated characters.
- **Dynamic Terrain Elevation Synchronization (`interaction-manager.js`):**
  * `InteractionManager.setTerrainSystem(terrainSystem)` dynamically synchronizes anchor and slot elevations with `terrainSystem.getTerrainHeight(anchor.position.x, anchor.position.z)`.
  * Eliminates static height drift ($y = 3.45\text{m}$ vs true terrain $y = 4.58\text{m}$), preventing sunken avatars and mid-air floating seats.
  * Dual seating slots ($i=0$ left $-0.45\text{m}$, $i=1$ right $+0.45\text{m}$) ground avatar roots precisely onto wooden planks ($y = 0.44\text{m}$) with thighs on the seat and feet on the ground.

### 5.4. Vintage Japanese Countryside Bicycle (Mamachari) Relocation & High-Fidelity Geometry Architecture
- **Root Cause & Previous Bugs:**
  * **Wayside Bench Overlap:** The primitive bicycle was previously spawned at $(x = 6.3, z = -5.6)$, just $0.89\text{m}$ from the Wayside Sakura Bench $(5.5, -6.0)$, causing its rear wheel to impale the right seat planks and backrest.
  * **Sunken Tires & Flawed Pitch Angle:** The bicycle model rotated around $Z$ (`rotation.z = -0.12`), which mistakenly pitched the nose forward into the dirt, burying half of both wheels below ground level.
  * **Low-Fidelity Floating Primitives:** Wheels had no spokes (bare floating hollow rings), no front fork, no seatstays/chainstays, and no handlebars stem or kickstand.
- **The Solution:**
  * **Complete Relocation to Village Square (`landmarks-system.js`):** Moved over $16.5\text{m}$ away to the Countryside Village Plaza at $(x = -4.2, z = -19.5, \theta_{\text{rotY}} = 0.35)$, parked picturesquely beside the Retro Vending Machine and Community Notice Board. This restores a 100% clean, unencumbered view for the Wayside Sakura Bench.
  * **High-Fidelity Mamachari 3D Construction:**
    * Wheels: 12 chrome radial wire spokes per wheel ($0.0022\text{m}$ diameter), polished chrome rims, black rubber tires ($R = 0.325\text{m}$), axle hubs with chrome nuts, amber spoke reflectors, and curved front/rear fenders with chrome stays.
    * Frame: Deep Japanese retro navy blue enamel (`#1E3A8A`), authentic step-through twin-curved top tubes, head tube, seat tube, down tube, chainstays, and seatstays.
    * Front Fork & Steering: Twin chrome fork blades, quill stem, swept-back North Road cruiser handlebars, stitched brown leather grips, chrome brake levers, bullet headlight, and retro chrome thumb bell.
    * Saddle & Drivetrain: Sprung touring leather saddle with dual chrome suspension coil springs, chrome chainring, mamachari chain guard case, crank arms, pedals, and rear luggage carrier rack.
    * Grounding & Kickstand: Deployed chrome side kickstand and rustic timber wheel chock stand. Roll angle calibrated at $\theta_{\text{rotX}} = 0.13\text{ rad}$ ($7.5^\circ$), ensuring tires and kickstand foot rest precisely on the terrain surface ($\Delta y < 7\text{mm}$).
  * **Interactive Anchor & Web Audio Bell Synthesis:**
    * Registered anchor `village_vintage_bicycle` (`interactionRadius: 1.8m`).
    * Proximity prompt: `Press [E] to 🔔 Ring Bell` (bilingual `Rung chuông` in Vietnamese).
    * Synthesizes a crisp dual-tone vintage bell strike ($2450\text{Hz}$ and $2750\text{Hz}$ with bright harmonics) via Web Audio API oscillators.
    * Sliding obstacle box registered in `WorldCollisionSystem` ($x \in [-4.80, -3.60], z \in [-19.80, -19.20]$).

---

## 6. Collision & Walkable Terrain Systems

### 6.1. Coastal Wooden Pier Elevation Architecture
- **Problem Resolved:** Previously, the 24-meter wooden pier extending into the sea at $z \in [76.0, 100.0]$ had no elevated walkable surface registered in collision detection. Characters walked at seabed elevation ($y \approx -0.4\text{ to } -0.8\text{m}$), causing their knees and lower legs to sink below the pier planks into the water.
- **The Solution:**
  * Main walkway ($x \in [8.6, 12.4], z \in [75.5, 100.5]$): Elevated to $y = 0.22\text{m}$ (top of planks).
  * Terminal T-platform ($x \in [7.4, 13.6], z \in [95.5, 100.5]$): Elevated to $y = 0.24\text{m}$ (top of wide platform).
  * `WorldCollisionSystem.getWalkableHeight(x, z)` enforces $\max(\text{rawY}, \text{pierPlankY})$.
  * Sliding collision boundary prevents accidental falls off the pier walkway into deep water.
  * `SurfaceDetector.detect(x, z)` classifies the entire pier zone as `'wood_deck'`, driving crisp wooden plank footstep audio.

---

## 7. Real-Time MMO Chat & 3D Comic Speech Bubbles

### 7.1. Speech Bubble Screen-Space Projection
- When players or NPCs chat, a comic speech bubble (`.anime-comic-speech-bubble`) is generated with a pointing tail pointing down directly at the speaker.
- **Anchor World Tracking:**
  * Priority 1: Query `OverheadUiSystem.getAnchorWorldPosition('player')` or `Head` bone world position $+ 0.38\text{m}$.
  * Priority 2: Fallback to root object world position $+ 1.90\text{m}$ (or $+ 1.35\text{m}$ when seated).
- **Projection & Frustum Clamping:**
  * 3D world anchor is projected through `PerspectiveCamera.project(camera)` to screen space.
  * Clamped within safe viewport boundaries ($x \in [107\text{px}, \text{width} - 107\text{px}]$, $y \in [50\text{px}, \text{height} - 60\text{px}]$), ensuring speech bubbles never clip outside the viewport or jump to distant background objects.
  * Automatically hides the character's overhead badge while a speech bubble is active, giving 100% clean visual focus to conversation text.

---

## 8. Operational Quickstart

### Starting the Server
```bash
# Production Start
npm start

# Development Start with Live Reload
npm run dev
```

### Key Bindings & Controls

| Action | Desktop Key | Mobile Gesture |
| :--- | :--- | :--- |
| Move Forward / Backward | `W` / `S` or `↑` / `↓` | Virtual Joystick (Y-axis) |
| Strafe Left / Right | `A` / `D` or `←` / `→` | Virtual Joystick (X-axis) |
| Sprint | `Shift` | Push Joystick to Edge (>85%) |
| Jump | `Space` | Auto on elevation / Touch Jump Button |
| Interact (Talk, Sit, Kiosk, Vend) | `E` | Tap `💬 Talk` or Tap 3D Prompt Pill |
| Toggle Thinking Pose | `Z` | Tap `🤔 Think` Button |
| Hotbar Inventory Slots 1–9 | `1` – `9` | Tap Hotbar Slot in HUD |
| Use / Consume Equipped Item | `F` | Tap Equipped Item Action |
| Toggle Focus / Explore Mode | `H` or `Escape` | Tap Floating `⚡ Terminal` Button |
| Open / Focus MMO Chat | `T` | Tap Floating Chat Icon |
| Camera Orbit | Left-Click Drag | Single Finger Drag on Viewport |
| Camera Zoom | Mouse Wheel | Two Fingers Pinch on Viewport |

---

## 9. Master Specification v4 Architecture Compliance

TeleTerm 3D is fully compliant with Master Specification v4:

### 9.1. Official 13-Tier Rank & Identity Progression (Sections 83–89)
1. **Server-Authoritative Ladder:**
   - Lv 1–4: Novice (`rank_novice`, `seed_dot`, `#94a3b8`)
   - Lv 5–9: Apprentice (`rank_apprentice`, `dual_chevron`, `#a3e635`)
   - Lv 10–14: Coder (`rank_coder`, `terminal_prompt`, `#10b981`)
   - Lv 15–19: Developer (`rank_developer`, `structured_node`, `#34d399`)
   - Lv 20–24: Engineer (`rank_engineer`, `circuit_glyph`, `#00f0ff`)
   - Lv 25–29: Specialist (`rank_specialist`, `focused_crystal`, `#38bdf8`)
   - Lv 30–34: Architect (`rank_architect`, `structural_pyramid`, `#6366f1`)
   - Lv 35–39: Senior Architect (`rank_senior_architect`, `layered_geometry`, `#818cf8`)
   - Lv 40–49: Principal Engineer (`rank_principal_engineer`, `network_matrix`, `#a855f7`)
   - Lv 50–59: Systems Architect (`rank_systems_architect`, `multi_node`, `#c084fc`)
   - Lv 60–74: Master Builder (`rank_master_builder`, `celestial_cube`, `#e11d48`)
   - Lv 75–99: Distinguished Architect (`rank_distinguished_architect`, `layered_prism`, `#f43f5e`)
   - Lv 100+: Legendary Developer (`rank_legendary_developer`, `radiant_crown`, `#fbbf24`)
2. **Identity Hierarchy:**
   - Line 1: `[RANK]` — Vector SVG badge motif + localized rank title
   - Line 2: `[NAME]` — Developer / Character name
   - Line 3: `[LEVEL]` — Localized level string (`Lv. X` in en, `Cấp X` in vi)
   - Line 4: `[ACTIVITY]` — Localized activity status (`*vibing*` / `*thư giãn*`)
3. **Pure Vector Visuals:** Zero OS icons, zero browser emojis. Built with lightweight inline SVGs.
4. **Distance LOD:** Close (<9.5m): 4 lines; Mid (9.5–18m): 3 lines; Far (>18m): compressed to 2 lines.

### 9.2. 9-Slot Hotbar & Handheld Items (Sections 72–76)
- **Inventory Hotbar UI:** 9 hotbar slots pinned to bottom of screen with keyboard navigation `1`..`9` and click activation.
- **Handheld Sockets:** Attached to `RightHand` bone with procedural finger curling around cans, mugs, and tools.
- **Consumption Pipeline:** Key `F` triggers procedural 3-phase `solveDrinkCan` animation (raise arm, tilt head back, sip, lower arm) synchronized with Web Audio SFX and slot decrement.

### 9.3. Vending Machine Interaction Loop (Sections 77–82)
- End-to-end flow: Approach vending machine landmark -> prompt `[E] Mua Trà Xanh` -> POST `/api/dev/vending/vend` -> mechanical dispenser sound -> can added to slot 1 -> player equips can -> finger curling around can -> procedural drink animation -> drink SFX -> consumable consumed.

### 9.4. 0ms Instant Outfit Customization (Sections 58–59)
- Instantaneous client-side material tinting and 3D accessory swapping across 4 presets without page or world reloads:
  - `sakura_alice`: Pastel dress, pink hair, floral motif.
  - `hacker_hoodie`: Dark stealth hoodie, cyan glowing accents, visor.
  - `kimono_ronin`: Traditional hakama/kimono, sheathed katana on hip.
  - `kemono_coder`: Fox/cat kemono ears on head, warm amber accents.

### 9.5. Truthful Telemetry (Section 56)
- Device telemetry queries real CPU/RAM metrics calculated from host `os.cpus()` and `os.totalmem()` differences. No simulated random jitter, fake browser estimations, or static placeholders.

