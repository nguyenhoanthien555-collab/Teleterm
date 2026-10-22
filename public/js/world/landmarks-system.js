import * as THREE from '/vendor/three/build/three.module.js';

/**
 * LANDMARKS & ENVIRONMENTAL STORYTELLING SYSTEM
 * Implements Section 40, 48, and 49 of TeleTerm Living Open World Master Spec v3.
 * Features:
 * - Developer Hub & Co-working Deck: Coding desks, glowing laptops, cafe counter, coffee cups
 * - Public Hologram Terminal Kiosk & Info Pillar
 * - Countryside Village: Notice board, retro vending machine, stone lanterns
 * - Hilltop Alpine Panorama Viewpoint & Observation Telescope
 * - Wayside Cherry Blossom Bench, Vintage Bicycle, Utility Poles & Wires
 */
/**
 * In-World Dynamic ConPTY Terminal Canvas Streamer
 * Streams real-time terminal output, test results and system status
 * onto Three.js 3D monitor and laptop screens via dynamic CanvasTexture.
 */
class TerminalCanvasStreamer {
    constructor() {
        this.width = 512;
        this.height = 256;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx = this.canvas.getContext('2d');
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;

        this.lines = [
            '// TELETERM 3D CONPTY LIVE STREAM',
            '=======================================',
            'SESSION: PowerShell [conpty-active]',
            'RUNTIME: Three.js WebGL + ConPTY 60FPS',
            'BIOME: Eastern Sakura Grove Hub',
            'STATUS: Ready for commands & tests...',
            '---------------------------------------',
            '$ Waiting for live execution stream...'
        ];
        this.maxLines = 11;
        this.dirty = true;
        this.cursorVisible = true;
        this.lastRenderTime = 0;
        this.systemStatus = { cpu: 18, testStatus: 'IDLE' };

        this.render(0);

        if (typeof window !== 'undefined') {
            window.addEventListener('teleterm:terminal-output', (e) => {
                if (e.detail?.data) this.appendData(e.detail.data);
            });
            window.addEventListener('teleterm:verification-status', (e) => {
                if (e.detail?.status) {
                    this.systemStatus.testStatus = e.detail.status;
                    this.appendData(`[TEST] Verification Status: ${e.detail.status}`);
                }
            });
        }
    }

    stripAnsi(text) {
        if (!text) return '';
        return text
            .replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\|[\n\r])/g, '') // OSC sequences (window titles, shell hooks)
            .replace(/\x1b\[[0-9;?<=>]*[a-zA-Z~]/g, '')             // CSI sequences (colors, cursor, dec modes)
            .replace(/\x1b[()][AB012]/g, '')                         // Character set selection
            .replace(/\x1b[@-Z\\-_]/g, '')                           // 2-character escape sequences
            .replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, '')       // C0 control codes
            .replace(/\r/g, '');
    }

    appendData(text) {
        if (!text) return;
        const clean = this.stripAnsi(text);
        const newLines = clean.split('\n').map(l => l.trimEnd()).filter(l => l.length > 0);

        for (const line of newLines) {
            this.lines.push(line.length > 46 ? line.slice(0, 46) + '…' : line);
        }

        while (this.lines.length > this.maxLines) {
            this.lines.shift();
        }
        this.dirty = true;
    }

    update(time) {
        const blink = Math.floor(time * 2.5) % 2 === 0;
        if (blink !== this.cursorVisible) {
            this.cursorVisible = blink;
            this.dirty = true;
        }

        const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
        // Throttle texture uploads to ~30 FPS (at least 33ms interval) to prevent GPU bandwidth thrashing
        if (this.dirty && (now - this.lastRenderTime >= 33)) {
            this.lastRenderTime = now;
            this.render(time);
            this.texture.needsUpdate = true;
            this.dirty = false;
        }
    }

    render(time) {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = '#050813';
        ctx.fillRect(0, 0, w, h);

        // Scanlines
        ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
        for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 1);
        }

        // Header
        ctx.fillStyle = '#0c1427';
        ctx.fillRect(0, 0, w, 28);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(0, 27, w, 1);

        const dotColor = this.systemStatus.testStatus === 'FAILED' ? '#f43f5e' :
                         this.systemStatus.testStatus === 'PASSED' ? '#10b981' : '#00f0ff';
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(14, 14, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 12px "JetBrains Mono", Consolas, monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('CONPTY TERMINAL STREAM', 26, 18);

        ctx.font = '11px "JetBrains Mono", Consolas, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`TESTS: ${this.systemStatus.testStatus}`, w - 140, 18);

        // Lines
        ctx.font = '13px "JetBrains Mono", Consolas, monospace';
        const startY = 48;
        const lineHeight = 18;

        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];
            const y = startY + i * lineHeight;

            if (line.includes('PASS') || line.includes('[OK]') || line.includes('PASSED')) {
                ctx.fillStyle = '#34d399';
            } else if (line.includes('FAIL') || line.includes('Error') || line.includes('FAILED')) {
                ctx.fillStyle = '#f43f5e';
            } else if (line.startsWith('$') || line.startsWith('>')) {
                ctx.fillStyle = '#38bdf8';
            } else if (line.startsWith('//') || line.includes('=')) {
                ctx.fillStyle = '#fbcfe8';
            } else {
                ctx.fillStyle = '#cbd5e1';
            }

            ctx.fillText(line, 14, y);

            if (i === this.lines.length - 1 && this.cursorVisible) {
                const textWidth = ctx.measureText(line).width;
                ctx.fillStyle = '#00f0ff';
                ctx.fillRect(16 + textWidth, y - 11, 8, 14);
            }
        }
    }
}

export class LandmarksSystem {
    constructor(scene, terrainSystem) {
        this.scene = scene;
        this.terrainSystem = terrainSystem;
        this.terminalCanvasStreamer = new TerminalCanvasStreamer();
        this.lanternLights = [];
        this.lanternMaterials = [];
        this.screenMaterials = [];

        if (typeof window !== 'undefined') {
            window.teletermStreamOutput = (text) => this.terminalCanvasStreamer.appendData(text);
        }
    }

    build() {
        const startIdx = this.scene ? this.scene.children.length : 0;

        // 1. DEVELOPER HUB & CO-WORKING DECK (Main Social & Coding Space)
        this.buildDeveloperHubDeck();

        // 2. WAYSIDE SAKURA BENCH (Under blooming cherry tree - clear unencumbered vista)
        this.buildWoodenBench(5.5, -6.0, -0.3);

        // 2b. RIVER VALLEY VISTA BENCH (Overlooking river meander & arched bridge on north bluff)
        this.buildWoodenBench(8.5, 19.2, -Math.PI * 0.65);

        // 2c. CHERRY GROVE HILLSIDE BENCH (Under sakura canopy on east hill)
        this.buildWoodenBench(25.0, -15.5, -Math.PI * 0.45);

        // 3. VILLAGE SQUARE LANDMARKS: Notice Board, Retro Vending Machine & Vintage Bicycle Parking
        // Placed along East side of village road in a dedicated rural rest stop (completely clear of rice fields)
        this.buildVillageNoticeBoard(1.2, -23.5, 0.0);
        this.buildRetroVendingMachine(3.6, -21.5, -Math.PI * 0.5);
        this.buildVintageBicycle(3.8, -19.5, -Math.PI * 0.45);

        // 4. HILLTOP ALPINE PANORAMA VIEWPOINT (Overlook snow peaks)
        this.buildHilltopPanoramaViewpoint(34.0, -48.0);

        // 5. JAPANESE COUNTRYSIDE UTILITY POLES & OVERHEAD WIRES
        this.buildUtilityPoles();

        // 6. WEATHERED STONE LANTERNS (Warm ambient lighting at night)
        this.buildStoneLantern(1.6, -11.8);
        this.buildStoneLantern(3.2, -23.8);
        this.buildStoneLantern(24.0, -14.0);

        // 7. RUSTIC WOODEN DIRECTION SIGNPOSTS
        this.buildSignpost(4.5, -2.5, 0.2, '-> SAKURA CO-WORKING HUB');
        this.buildSignpost(2.0, 18.5, -0.4, '-> RIVER / BEACH');

        // 8. RUSTIC RIVERSIDE CAMPFIRE — Upgraded to full CampfireSocialSystem with Lofi Radio & Seating
        // this.buildCampfire(12.5, 19.2);

        // 9. ZEN TEA PAVILION (Bamboo Meditation Forest at Northwest)
        this.buildZenTeaPavilion(-22.0, -25.0);

        // 10. MAPLE STREAM REST STOP (Autumn Maple Valley at Northeast)
        this.buildMapleStreamRestStop(42.0, -32.0);

        // 120 FPS Master Optimization: Freeze Static Matrices & Prune Micro Shadow Casters on all built landmarks
        if (this.scene && this.scene.children) {
            for (let i = startIdx; i < this.scene.children.length; i++) {
                const landmark = this.scene.children[i];
                if (!landmark) continue;
                landmark.traverse(child => {
                    if (child.isMesh) {
                        const name = child.name || '';
                        const isBigCaster = name.includes('Canopy') || name.includes('umbrella') || name.includes('PavilionRoof') || name.includes('NoticeBoard');
                        if (!isBigCaster) {
                            child.castShadow = false;
                        }
                    }
                    child.matrixAutoUpdate = false;
                    child.updateMatrix();
                });
            }
        }
    }

    /**
     * Injects exact geometry-derived world Y coordinates into InteractionManager
     * for all raised platforms (Hub timber deck, Zen Tea Pavilion tatami mats).
     */
    syncAnchorPositions(interactionManager) {
        if (!interactionManager) return;
        // 1. Developer Hub Deck platform surface (deck group Y + deck half-height)
        const hubDeckGroupY = this.terrainSystem.getTerrainHeight(22.0, -11.0) + 0.06;
        const hubSurfaceY = hubDeckGroupY + 0.07;
        [
            'hub_desk_chair_1', 'hub_desk_chair_2', 'hub_desk_chair_3', 'hub_desk_chair_4',
            'hub_cafe_lounge_chair', 'hub_cafe_lounge_chair_2', 'hub_cafe_lounge_chair_3', 'hub_cafe_lounge_chair_4',
            'hub_kiosk_terminal', 'hub_barista_spot'
        ].forEach(id => {
            interactionManager.setAnchorWorldY(id, hubSurfaceY);
        });

        // 2. Zen Tea Pavilion tatami mats top surface (pavilion group Y + matGroup Y + half mat height)
        const pavGroupY = this.terrainSystem.getTerrainHeight(-22.0, -25.0);
        const tatamiTopY = pavGroupY + 0.25 + 0.015;
        interactionManager.setAnchorWorldY('bamboo_tea_mat_1', tatamiTopY);
        interactionManager.setAnchorWorldY('bamboo_tea_mat_2', tatamiTopY);

        // Ground all outdoor anchors (benches, stools, vending machine, bike)
        interactionManager.syncAnchorHeights();
    }

    /**
     * DEVELOPER HUB CO-WORKING DECK & OPEN-AIR CAFE
     * Expanded Eastern Sakura Hillside Grove (22.0, -11.0)
     * Features: 12.5m x 10.0m raised timber platform, coding stations, laptops,
     * shaded dual umbrellas with real-time shadow casting, expanded artisan cafe bar,
     * dedicated barista station, and grounded public terminal kiosk.
     */
    buildDeveloperHubDeck() {
        const hubGroup = new THREE.Group();
        const deckX = 22.0;
        const deckZ = -11.0;
        const deckY = this.terrainSystem.getTerrainHeight(deckX, deckZ) + 0.06;
        hubGroup.position.set(deckX, deckY, deckZ);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x452c1e, roughness: 0.88 });
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.85 });
        const chairMat = new THREE.MeshStandardMaterial({ color: 0x6d4c33, roughness: 0.82 });
        const laptopBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
        const laptopScreenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // glowing cyan IDE code screen
        const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.6 }); // red/rose cafe umbrella
        const umbrellaMat2 = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.65 }); // crimson desk umbrella
        const poleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.2 });

        // 1. Expanded Raised Timber Platform Deck (12.5m x 10.0m x 0.14m)
        const deckGeo = new THREE.BoxGeometry(12.5, 0.14, 10.0);
        const deckMesh = new THREE.Mesh(deckGeo, woodMat);
        deckMesh.receiveShadow = true;
        hubGroup.add(deckMesh);

        // Solid Foundation Timber Stilts & Skirt Fascia (grounded firmly into hillside terrain)
        const postMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.95 });
        const postPositions = [
            [-5.8, -4.5], [-2.9, -4.5], [0, -4.5], [2.9, -4.5], [5.8, -4.5],
            [-5.8, 0.0],  [-2.9, 0.0],  [0, 0.0],  [2.9, 0.0],  [5.8, 0.0],
            [-5.8, 4.5],  [-2.9, 4.5],  [0, 4.5],  [2.9, 4.5],  [5.8, 4.5]
        ];
        postPositions.forEach(([lx, lz]) => {
            const wx = deckX + lx;
            const wz = deckZ + lz;
            const groundY = this.terrainSystem.getTerrainHeight(wx, wz);
            const drop = Math.max(0.35, (deckY - 0.07) - groundY + 0.35);
            const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, drop, 8), postMat);
            stilt.position.set(lx, -0.07 - drop * 0.5 + 0.17, lz);
            stilt.castShadow = true;
            hubGroup.add(stilt);
        });

        // Timber Skirt Fascia Boards along Deck Perimeter
        const skirtMat = new THREE.MeshStandardMaterial({ color: 0x362217, roughness: 0.9 });
        // North & South skirts (12.5m x 0.48m x 0.06m)
        [-4.97, 4.97].forEach(sz => {
            const skirt = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.48, 0.06), skirtMat);
            skirt.position.set(0, -0.24, sz);
            skirt.castShadow = true;
            hubGroup.add(skirt);
        });
        // East skirt (solid continuous 10.0m)
        const skirtEast = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 10.0), skirtMat);
        skirtEast.position.set(6.22, -0.24, 0);
        skirtEast.castShadow = true;
        hubGroup.add(skirtEast);

        // West skirt (split to provide open 2.4m flush entrance for stairs between z = -2.2 and 0.2)
        // North section: z in [-5.0, -2.2], length 2.8m, center z = -3.6
        const skirtWestN = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 2.8), skirtMat);
        skirtWestN.position.set(-6.22, -0.24, -3.6);
        skirtWestN.castShadow = true;
        hubGroup.add(skirtWestN);
        // South section: z in [0.2, 5.0], length 4.8m, center z = 2.6
        const skirtWestS = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 4.8), skirtMat);
        skirtWestS.position.set(-6.22, -0.24, 2.6);
        skirtWestS.castShadow = true;
        hubGroup.add(skirtWestS);

        // =========================================================================
        // RECONSTRUCTED SOLID TIMBER STAIRCASE (Flush Attached to Deck & Grounded)
        // Spans from deck edge (x = -6.25, y = +0.07) down to trail (x = -8.35)
        // Width: 2.4m along Z (centered at z = -1.0, spanning z in [-2.2, 0.2])
        // =========================================================================
        const stepTreadMat = new THREE.MeshStandardMaterial({ color: 0x4e3322, roughness: 0.82 });
        const stepRiserMat = new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.90 });
        const stringerMat = new THREE.MeshStandardMaterial({ color: 0x362217, roughness: 0.92 });
        const railMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.85 });

        const stepCount = 5;
        const stepRun = 0.42;
        const stairZ = -1.0;
        const stairWidth = 2.4;
        const stepDrop = 0.145; // comfortable 14.5cm rise per step
        const treadThickness = 0.05;

        for (let i = 0; i < stepCount; i++) {
            const stepCenterX = -6.25 - (i + 0.5) * stepRun;
            const stepTopY = 0.07 - (i * stepDrop); // Step 0 connects to deck top (+0.07)
            const worldStepX = deckX + stepCenterX;
            const worldStepZ = deckZ + stairZ;
            const groundY = this.terrainSystem.getTerrainHeight(worldStepX, worldStepZ);
            const localGroundY = groundY - deckY;

            // 1. Solid Foundation Mass under step
            // CRITICAL: Top of foundation sits strictly UNDER the tread plank (no coplanar top face = ZERO z-fighting)
            // Foundation is slightly inset in X and Z so it remains fully encapsulated under the tread
            const foundationTopY = stepTopY - treadThickness;
            const foundationDepth = Math.max(0.40, foundationTopY - localGroundY + 0.25);
            const solidFoundation = new THREE.Mesh(
                new THREE.BoxGeometry(stepRun - 0.02, foundationDepth, stairWidth - 0.04),
                stepRiserMat
            );
            solidFoundation.position.set(stepCenterX, foundationTopY - foundationDepth * 0.5, stairZ);
            solidFoundation.castShadow = true;
            solidFoundation.receiveShadow = true;
            hubGroup.add(solidFoundation);

            // 2. Heavy Timber Tread Plank with subtle nosing
            const treadMesh = new THREE.Mesh(
                new THREE.BoxGeometry(stepRun + 0.03, treadThickness, stairWidth),
                stepTreadMat
            );
            treadMesh.position.set(stepCenterX - 0.015, stepTopY - treadThickness * 0.5, stairZ);
            treadMesh.castShadow = true;
            treadMesh.receiveShadow = true;
            hubGroup.add(treadMesh);

            // 3. Solid Vertical Riser Board at step edge (recessed under nosing)
            const riserMesh = new THREE.Mesh(
                new THREE.BoxGeometry(0.03, stepDrop, stairWidth - 0.02),
                stepRiserMat
            );
            riserMesh.position.set(-6.25 - (i + 1) * stepRun + 0.015, stepTopY - stepDrop * 0.5, stairZ);
            riserMesh.castShadow = true;
            hubGroup.add(riserMesh);
        }

        // 4. Ground Foundation Footing Sleeper Beam (embedded at base of stairs)
        const footingBeam = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.35, stairWidth + 0.16),
            stringerMat
        );
        const footX = -6.25 - stepCount * stepRun - 0.06;
        const footWorldGround = this.terrainSystem.getTerrainHeight(deckX + footX, deckZ + stairZ);
        footingBeam.position.set(footX, (footWorldGround - deckY) + 0.08, stairZ);
        footingBeam.castShadow = true;
        footingBeam.receiveShadow = true;
        hubGroup.add(footingBeam);

        // 5. Heavy Solid Side Stringer Beams & Precision Handrails
        // Staircase gradient: from deck edge (-6.25, +0.07) to stair bottom (-8.32, -0.655)
        const stairRunX = 2.07; // -6.25 to -8.32
        const stairDropY = 0.725; // 0.07 down to -0.655
        const stairSlope = Math.atan2(stairDropY, stairRunX); // ~0.3364 rad (19.27 deg)
        const stringerLen = Math.hypot(stairRunX, stairDropY) + 0.18; // ~2.37m
        const handrailLen = Math.hypot(stairRunX, stairDropY); // ~2.194m

        [-stairWidth * 0.5, stairWidth * 0.5].forEach(offsetZ => {
            const sz = stairZ + offsetZ;

            // Diagonal side stringer board: correctly angled with slope of stairs
            const stringerMesh = new THREE.Mesh(
                new THREE.BoxGeometry(stringerLen, 0.42, 0.08),
                stringerMat
            );
            stringerMesh.position.set(-6.25 - stairRunX * 0.5, -0.34, sz);
            stringerMesh.rotation.z = stairSlope; // POSITIVE slope: rises as X increases towards deck
            stringerMesh.castShadow = true;
            hubGroup.add(stringerMesh);

            // Rustic Timber Handrails: 3 vertical posts grounded into terrain & deck + flush sloped top rail
            const railSideZ = sz + (offsetZ > 0 ? 0.04 : -0.04);
            const railingHeight = 0.90; // 90cm above walking surface

            // Post locations: Top at deck edge, Middle, Bottom at footing
            const postConfigs = [
                { x: -6.28, surfaceY: 0.07, groundBaseY: -0.35 },    // Top post: anchored into deck skirt
                { x: -7.30, surfaceY: -0.29, groundBaseY: -0.65 },   // Mid post: anchored into step stringer
                { x: -8.32, surfaceY: -0.655, groundBaseY: -0.92 }   // Bottom post: anchored deep into footing beam
            ];

            postConfigs.forEach(cfg => {
                const railTopY = cfg.surfaceY + railingHeight;
                const postH = railTopY - cfg.groundBaseY;
                const postY = cfg.groundBaseY + postH * 0.5;
                const post = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.04, 0.045, postH, 8),
                    railMat
                );
                post.position.set(cfg.x, postY, railSideZ);
                post.castShadow = true;
                hubGroup.add(post);
            });

            // Sloped top handrail bar: connects bottom post flush to top post at deck level
            const topPostRailY = 0.07 + railingHeight; // 0.97
            const botPostRailY = -0.655 + railingHeight; // 0.245
            const hrCenterX = (-6.28 + -8.32) * 0.5; // -7.30
            const hrCenterY = (topPostRailY + botPostRailY) * 0.5; // 0.6075

            const handrail = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, handrailLen, 8),
                railMat
            );
            handrail.position.set(hrCenterX, hrCenterY, railSideZ);
            // Cylinder Y-axis rotated to match slope vector (+dx, +dy): rotZ = -Math.PI * 0.5 + stairSlope
            handrail.rotation.z = -Math.PI * 0.5 + stairSlope;
            handrail.castShadow = true;
            hubGroup.add(handrail);

            // Clean flush horizontal cap/joiner onto the deck post
            const deckJoiner = new THREE.Mesh(
                new THREE.CylinderGeometry(0.042, 0.042, 0.16, 8),
                railMat
            );
            deckJoiner.rotation.z = Math.PI * 0.5;
            deckJoiner.position.set(-6.22, topPostRailY, railSideZ);
            deckJoiner.castShadow = true;
            hubGroup.add(deckJoiner);
        });

        // Helper to build a Coding Desk with Laptop & Chair
        const buildCodingStation = (offsetX, offsetZ, rotY) => {
            const station = new THREE.Group();
            station.position.set(offsetX, 0.07, offsetZ);
            station.rotation.y = rotY;

            // Desk Table
            const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.75), deskMat);
            tableTop.position.y = 0.72;
            tableTop.castShadow = true;
            tableTop.receiveShadow = true;
            station.add(tableTop);

            [-0.7, 0.7].forEach(tx => {
                [-0.3, 0.3].forEach(tz => {
                    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.72, 8), deskMat);
                    leg.position.set(tx, 0.36, tz);
                    leg.castShadow = true;
                    station.add(leg);
                });
            });

            // Glowing Cyber Laptop
            const laptop = new THREE.Group();
            laptop.position.set(0, 0.75, 0.05);

            const base = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.015, 0.22), laptopBaseMat);
            base.castShadow = true;
            laptop.add(base);

            const screen = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.20, 0.012), laptopScreenMat);
            screen.position.set(0, 0.10, -0.10);
            screen.rotation.x = -0.22;
            laptop.add(screen);

            // Front-facing dynamic live streaming terminal screen
            const laptopStreamMat = new THREE.MeshBasicMaterial({
                map: this.terminalCanvasStreamer.texture
            });
            const screenFace = new THREE.Mesh(new THREE.PlaneGeometry(0.30, 0.18), laptopStreamMat);
            screenFace.position.set(0, 0, 0.007);
            screen.add(screenFace);

            station.add(laptop);

            // Developer Coffee Mug — Replaced by ModularDeskDecorSystem
            // const mugMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
            // const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.08, 12), mugMat);
            // mug.position.set(0.32, 0.79, 0.12);
            // mug.castShadow = false;
            // station.add(mug);

            // Ergonomic Wooden Chair
            const chair = new THREE.Group();
            chair.position.set(0, 0, 0.55);

            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.48), chairMat);
            seat.position.y = 0.44;
            seat.castShadow = true;
            seat.receiveShadow = true;
            chair.add(seat);

            const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.40, 0.04), chairMat);
            backrest.position.set(0, 0.68, 0.22);
            backrest.castShadow = true;
            chair.add(backrest);

            [-0.2, 0.2].forEach(cx => {
                [-0.18, 0.18].forEach(cz => {
                    const cleg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.44, 8), chairMat);
                    cleg.position.set(cx, 0.22, cz);
                    cleg.castShadow = true;
                    chair.add(cleg);
                });
            });
            station.add(chair);

            hubGroup.add(station);
        };

        // Coding Station #1 (Lumina's desk)
        buildCodingStation(-1.4, -0.6, 0.0);
        // Coding Station #2 (Ren's desk)
        buildCodingStation(1.2, -0.6, 0.0);
        // Coding Station #3 (Developer Hot Desk)
        buildCodingStation(-3.8, -1.8, 0.2);
        // Coding Station #4 (Hot Desk #2 - East Quadrant)
        buildCodingStation(1.2, -2.95, 0.0);

        // 2. EXPANDED ARTISAN CAFE BAR COUNTER & BARISTA STATION
        // Positioned along East quadrant (X = 3.6, Z = 1.4), facing West
        const barCounterGroup = new THREE.Group();
        barCounterGroup.position.set(3.6, 0.07, 1.4);

        // Sturdy Walnut Bar Counter Base & Overhang Top (expanded to 4.2m long x 0.88m wide x 0.92m high)
        const barBaseMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.85 });
        const barTopMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.45 });
        const counterBase = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.88, 4.2), barBaseMat);
        counterBase.position.y = 0.44;
        counterBase.castShadow = true;
        counterBase.receiveShadow = true;
        barCounterGroup.add(counterBase);

        const counterTop = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.08, 4.35), barTopMat);
        counterTop.position.y = 0.92;
        counterTop.castShadow = true;
        counterTop.receiveShadow = true;
        barCounterGroup.add(counterTop);

        // Brass Footrest Rail for customer bar stools (front side X = -0.42)
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
        const footRail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 4.1, 12), brassMat);
        footRail.rotation.x = Math.PI / 2;
        footRail.position.set(-0.44, 0.18, 0);
        barCounterGroup.add(footRail);

        // Commercial Espresso Machine
        const espressoMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
        const espressoMachine = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.46, 0.45), espressoMat);
        espressoMachine.position.set(0.05, 1.19, -0.8);
        espressoMachine.castShadow = true;
        barCounterGroup.add(espressoMachine);

        // Coffee Grinder & Pour-Over Stand
        const grinder = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.10, 0.35, 12), espressoMat);
        grinder.position.set(0.05, 1.14, -1.35);
        grinder.castShadow = true;
        barCounterGroup.add(grinder);

        const pourOverStand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.38), deskMat);
        pourOverStand.position.set(0.05, 1.07, 0.2);
        pourOverStand.castShadow = true;
        barCounterGroup.add(pourOverStand);

        // Illuminated Glass Pastry Display Case
        const pastryGlassMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.45,
            roughness: 0.1,
            transmission: 0.9
        });
        const pastryCase = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.32, 0.90), pastryGlassMat);
        pastryCase.position.set(0.05, 1.12, 1.15);
        pastryCase.castShadow = true;
        barCounterGroup.add(pastryCase);

        const pastryLight = new THREE.PointLight(0xfef08a, 0.9, 2.5);
        pastryLight.position.set(0.05, 1.18, 1.15);
        barCounterGroup.add(pastryLight);

        // Back-Bar Wooden Shelving Display (behind barista at X = 5.6, Z = 1.4)
        const backBarGroup = new THREE.Group();
        backBarGroup.position.set(5.5, 0.07, 1.4);
        const shelfMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.6, 4.0), barBaseMat);
        shelfMesh.position.y = 0.80;
        shelfMesh.castShadow = true;
        backBarGroup.add(shelfMesh);

        // Warm cafe lighting from back shelf
        const barLight = new THREE.PointLight(0xfef08a, 1.6, 6.0);
        barLight.position.set(-0.3, 1.3, 0);
        backBarGroup.add(barLight);
        hubGroup.add(backBarGroup);

        hubGroup.add(barCounterGroup);

        // Cafe Bar Stools in front of the counter (at X = 2.4, now 4 stools along 4.2m counter)
        const cushionMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }); // Azure blue cushion
        const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.2 });

        const buildCafeStool = (sx, sz) => {
            const stool = new THREE.Group();
            stool.position.set(sx, 0.07, sz);

            // Chrome central post & base
            const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.22, 0.03, 16), chromeMat);
            baseMesh.position.y = 0.02;
            stool.add(baseMesh);

            const postMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.52, 10), chromeMat);
            postMesh.position.y = 0.28;
            stool.add(postMesh);

            // Footrest ring
            const footRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.015, 6, 16), chromeMat);
            footRing.rotation.x = Math.PI / 2;
            footRing.position.y = 0.20;
            stool.add(footRing);

            // Padded cushion seat
            const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 16), cushionMat);
            cushion.position.y = 0.56;
            cushion.castShadow = true;
            stool.add(cushion);

            hubGroup.add(stool);
        };

        buildCafeStool(2.4, 0.4); // Stool #1 (world: 24.4, -10.6)
        buildCafeStool(2.4, 1.4); // Stool #2 (world: 24.4, -9.6)
        buildCafeStool(2.4, 2.4); // Stool #3 (world: 24.4, -8.6)
        buildCafeStool(2.4, 3.4); // Stool #4 (world: 24.4, -7.6)

        // 3. SHADED SUN UMBRELLAS WITH REAL-TIME SHADOW CASTING & AMBIENT OCCLUSION DISCS
        // Umbrella #1: Main Workstation Canopy (expanded radius 3.4m directly over central coding aisle)
        const uDeskGroup = new THREE.Group();
        uDeskGroup.name = 'landmark_hub_umbrella_1';
        uDeskGroup.position.set(-0.1, 0.07, -1.8);

        const uDeskPole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.2, 8), poleMat);
        uDeskPole.position.y = 1.6;
        uDeskPole.castShadow = true;
        uDeskGroup.add(uDeskPole);

        const uDeskCanopy = new THREE.Mesh(new THREE.ConeGeometry(3.4, 0.90, 16), umbrellaMat2);
        uDeskCanopy.position.y = 3.05;
        uDeskCanopy.castShadow = true;
        uDeskCanopy.receiveShadow = true;
        uDeskGroup.add(uDeskCanopy);
        hubGroup.add(uDeskGroup);

        // Umbrella #2: West Hot Desk Umbrella (located safely behind Desk #3 at northwest margin, 2.8m clear of all chairs)
        const uWestGroup = new THREE.Group();
        uWestGroup.name = 'landmark_hub_umbrella_2';
        uWestGroup.position.set(-5.2, 0.07, -3.2);

        const uWestPole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.2, 8), poleMat);
        uWestPole.position.y = 1.6;
        uWestPole.castShadow = true;
        uWestGroup.add(uWestPole);

        const uWestCanopy = new THREE.Mesh(new THREE.ConeGeometry(2.6, 0.80, 14), umbrellaMat2);
        uWestCanopy.position.y = 3.05;
        uWestCanopy.castShadow = true;
        uWestCanopy.receiveShadow = true;
        uWestGroup.add(uWestCanopy);
        hubGroup.add(uWestGroup);

        // Umbrella #3: Large Cafe Umbrella in lounge area (shading bar stools with wide canopy)
        const uCafeGroup = new THREE.Group();
        uCafeGroup.position.set(0.6, 0.07, 2.4);

        const uCafePole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.4, 8), poleMat);
        uCafePole.position.y = 1.7;
        uCafePole.castShadow = true;
        uCafeGroup.add(uCafePole);

        const uCafeCanopy = new THREE.Mesh(new THREE.ConeGeometry(3.0, 0.85, 16), umbrellaMat);
        uCafeCanopy.position.y = 3.25;
        uCafeCanopy.castShadow = true;
        uCafeCanopy.receiveShadow = true;
        uCafeGroup.add(uCafeCanopy);
        hubGroup.add(uCafeGroup);

        // Soft ambient contact shadow discs on timber deck planking under each shaded zone
        const contactShadowMat = new THREE.MeshBasicMaterial({
            color: 0x1a0f08,
            transparent: true,
            opacity: 0.28,
            depthWrite: false
        });
        const addDeskContactShadow = (cx, cz, radius) => {
            const shadowDisc = new THREE.Mesh(new THREE.CircleGeometry(radius, 20), contactShadowMat);
            shadowDisc.rotation.x = -Math.PI / 2;
            shadowDisc.position.set(cx, 0.071, cz);
            hubGroup.add(shadowDisc);
        };
        addDeskContactShadow(-0.1, -1.8, 3.4);
        addDeskContactShadow(-5.2, -3.2, 2.6);
        addDeskContactShadow(0.6, 2.4, 3.0);

        // 4. PUBLIC TERMINAL STATION & HOLOGRAPHIC CONSOLE KIOSK
        // Solidly grounded on the timber platform deck at local X = -4.2, Z = 2.8 (world 17.8, -8.2)
        // Console angled facing towards local Z = 2.0 where the user stands comfortably in front
        const kiosk = new THREE.Group();
        kiosk.position.set(-4.2, 0.07, 2.8);

        const kPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.95, 12), deskMat);
        kPedestal.position.y = 0.48;
        kPedestal.castShadow = true;
        kPedestal.receiveShadow = true;
        kiosk.add(kPedestal);

        // Terminal Console Head / Keyboard stand angled towards user standing at -Z
        const consoleHead = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.06, 0.44), deskMat);
        consoleHead.position.set(0, 0.96, -0.06);
        consoleHead.rotation.x = -0.22; // angled up toward user at -Z
        consoleHead.castShadow = true;
        kiosk.add(consoleHead);

        // Holographic Terminal Screen Plane with Dynamic ConPTY Live Streaming
        const holoScreenMat = new THREE.MeshBasicMaterial({
            map: this.terminalCanvasStreamer.texture,
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide
        });

        const holoScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.38), holoScreenMat);
        holoScreen.name = 'hub_kiosk_holoscreen';
        holoScreen.position.set(0, 1.25, -0.02);
        holoScreen.rotation.y = Math.PI; // Face user standing at -Z
        holoScreen.rotation.x = -0.15; // Angled slightly upward towards user eyes
        holoScreen.scale.x = -1; // Unflip texture UV horizontal mapping so text reads left-to-right
        kiosk.add(holoScreen);

        const kHoloMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            emissive: 0x00d0e0,
            emissiveIntensity: 0.9,
            roughness: 0.1,
            metalness: 0.2,
            transparent: true,
            opacity: 0.85
        });
        this.screenMaterials.push(kHoloMat);

        const kSpire = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), kHoloMat);
        kSpire.position.y = 1.62;
        kiosk.add(kSpire);
        hubGroup.add(kiosk);

        // Deck Entrance Torches / Lanterns with dynamic warm PointLights
        [-2.2, 0.2].forEach(sz => {
            const torchGroup = new THREE.Group();
            torchGroup.position.set(-6.28, 1.05, sz);
            const torchLanternMat = new THREE.MeshStandardMaterial({
                color: 0xffedd5,
                emissive: 0xf59e0b,
                emissiveIntensity: 0.9,
                roughness: 0.3
            });
            this.lanternMaterials.push(torchLanternMat);

            const torchBulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), torchLanternMat);
            torchGroup.add(torchBulb);

            const torchLight = new THREE.PointLight(0xf59e0b, 1.6, 9.0, 1.8);
            torchGroup.add(torchLight);
            this.lanternLights.push(torchLight);

            hubGroup.add(torchGroup);
        });

        this.scene.add(hubGroup);
    }

    /**
     * VILLAGE COMMUNITY NOTICE BOARD
     */
    buildVillageNoticeBoard(x, z, rotY) {
        const boardGroup = new THREE.Group();
        const ty = this.terrainSystem.getTerrainHeight(x, z);
        boardGroup.position.set(x, ty, z);
        boardGroup.rotation.y = rotY;

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x6c4427, roughness: 0.92 });
        const paperMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // yellow sticky notes

        // Frame & Roof
        const postL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 0.12), woodMat);
        postL.position.set(-1.1, 1.1, 0);
        boardGroup.add(postL);

        const postR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.2, 0.12), woodMat);
        postR.position.set(1.1, 1.1, 0);
        boardGroup.add(postR);

        const backBoard = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.1, 0.05), woodMat);
        backBoard.position.set(0, 1.35, 0);
        boardGroup.add(backBoard);

        const roof = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.4), woodMat);
        roof.position.set(0, 2.05, 0);
        boardGroup.add(roof);

        // Pinned Developer Bounties & Notice Papers
        for (let i = 0; i < 4; i++) {
            const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.28), paperMat);
            paper.position.set(-0.75 + i * 0.5, 1.35, 0.035);
            boardGroup.add(paper);
        }

        this.scene.add(boardGroup);
    }

    /**
     * RETRO JAPANESE VENDING MACHINE (Red/White nostalgic drinks)
     */
    buildRetroVendingMachine(x, z, rotY) {
        const vm = new THREE.Group();
        const ty = this.terrainSystem.getTerrainHeight(x, z);
        vm.position.set(x, ty, z);
        vm.rotation.y = rotY;

        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.35 }); // Vibrant retro crimson
        const glassMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // illuminated drink display
        const trimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

        // Main Cabinet
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.7, 0.7), bodyMat);
        body.position.y = 0.85;
        body.castShadow = true;
        vm.add(body);

        // Illuminated Drink Display Window
        const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.75, 0.02), glassMat);
        windowMesh.position.set(0, 1.12, 0.36);
        vm.add(windowMesh);

        // Concrete foundation pad
        const padMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.88 });
        const pad = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.2), padMat);
        pad.position.set(0.18, 0.04, 0.05);
        pad.receiveShadow = true;
        vm.add(pad);

        // Can Recycling Receptacle (Blue bin beside vending machine)
        const binMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.45 });
        const bin = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.74, 0.38), binMat);
        bin.position.set(0.72, 0.41, 0.05);
        bin.castShadow = true;
        vm.add(bin);

        const binHole = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.02, 12), trimMat);
        binHole.position.set(0.72, 0.79, 0.05);
        vm.add(binHole);

        this.scene.add(vm);
    }

    /**
     * HILLTOP ALPINE PANORAMA VIEWPOINT & OBSERVATION TELESCOPE
     */
    buildHilltopPanoramaViewpoint(x, z) {
        const vp = new THREE.Group();
        const ty = this.terrainSystem.getTerrainHeight(x, z);
        vp.position.set(x, ty, z);

        // Panoramic Bench facing distant snowy alpine massif
        this.buildWoodenBench(x, z, -Math.PI * 0.85);

        // Articulated Scenic Park Observation Telescope (Mounted on left side of panoramic bench)
        const castIronMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.88, roughness: 0.35 });
        const enamelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.3 });
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.22 });
        const lensMat = new THREE.MeshPhysicalMaterial({
            color: 0x0284c7,
            metalness: 0.1,
            roughness: 0.05,
            transmission: 0.6,
            thickness: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05
        });
        const rubberMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });

        const tele = new THREE.Group();
        const teleX = x - 1.6;
        const teleZ = z + 0.2;
        const teleY = this.terrainSystem.getTerrainHeight(teleX, teleZ);
        tele.position.set(teleX, teleY, teleZ);
        tele.rotation.y = -Math.PI * 0.85;

        // 1. Stepped Octagonal Cast-Iron Base Plate with non-slip standing platform
        const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.40, 0.06, 8), castIronMat);
        basePlate.position.y = 0.03;
        basePlate.castShadow = true;
        basePlate.receiveShadow = true;
        tele.add(basePlate);

        const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.26, 0.06, 8), castIronMat);
        collar.position.y = 0.09;
        collar.castShadow = true;
        tele.add(collar);

        // Non-slip standing step platform for children / viewing comfort
        const stepPlatform = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.10, 0.28), castIronMat);
        stepPlatform.position.set(0, 0.05, 0.32);
        stepPlatform.castShadow = true;
        stepPlatform.receiveShadow = true;
        tele.add(stepPlatform);

        // 2. Fluted Pedestal Column
        const lowerCol = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.11, 0.52, 12), enamelMat);
        lowerCol.position.y = 0.36;
        lowerCol.castShadow = true;
        tele.add(lowerCol);

        const midRing = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.04, 12), brassMat);
        midRing.position.y = 0.63;
        tele.add(midRing);

        const upperCol = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.42, 12), enamelMat);
        upperCol.position.y = 0.85;
        upperCol.castShadow = true;
        tele.add(upperCol);

        // Coin/Token Mechanism Box with brass coin slot
        const coinBox = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.16, 0.10), castIronMat);
        coinBox.position.set(0, 0.88, 0.07);
        coinBox.castShadow = true;
        tele.add(coinBox);

        const coinSlot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.01), brassMat);
        coinSlot.position.set(0, 0.92, 0.125);
        tele.add(coinSlot);

        // 3. Swivel Yolk Mount
        const yolkHub = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.08, 12), castIronMat);
        yolkHub.position.y = 1.08;
        tele.add(yolkHub);

        [-0.105, 0.105].forEach(ax => {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.20, 0.07), castIronMat);
            arm.position.set(ax, 1.18, 0);
            arm.castShadow = true;
            tele.add(arm);

            const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.025, 12), brassMat);
            knob.rotation.z = Math.PI / 2;
            knob.position.set(ax * 1.25, 1.24, 0);
            tele.add(knob);
        });

        // 4. Optical Observation Head (Tilted 18° up towards alpine peaks)
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 1.24, 0);
        headGroup.rotation.x = -0.32; // Elevation angle towards mountain panorama

        // Central prism housing
        const prismBox = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.22), enamelMat);
        prismBox.castShadow = true;
        headGroup.add(prismBox);

        // Top focus adjustment dial
        const focusDial = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12), brassMat);
        focusDial.position.set(0, 0.06, -0.02);
        headGroup.add(focusDial);

        // Twin Optical Barrels (Binocular design)
        [-0.055, 0.055].forEach(bx => {
            // Main barrel
            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.046, 0.38, 12), enamelMat);
            barrel.rotation.x = Math.PI / 2;
            barrel.position.set(bx, 0, -0.16);
            barrel.castShadow = true;
            headGroup.add(barrel);

            // Objective lens sunshade hood
            const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.044, 0.08, 12), castIronMat);
            hood.rotation.x = Math.PI / 2;
            hood.position.set(bx, 0, -0.38);
            headGroup.add(hood);

            // Antireflective coated glass objective lens
            const lens = new THREE.Mesh(new THREE.CircleGeometry(0.042, 16), lensMat);
            lens.position.set(bx, 0, -0.36);
            lens.rotation.y = Math.PI;
            headGroup.add(lens);

            // Rubber eyepiece at viewer side
            const eyeCup = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.026, 0.06, 12), rubberMat);
            eyeCup.rotation.x = Math.PI / 2;
            eyeCup.position.set(bx, 0, 0.13);
            headGroup.add(eyeCup);
        });

        tele.add(headGroup);
        this.scene.add(tele);
    }

    buildWoodenBench(x, z, rotY) {
        const benchGroup = new THREE.Group();
        const ty = this.terrainSystem.getTerrainHeight(x, z);
        benchGroup.position.set(x, ty, z);
        benchGroup.rotation.y = rotY;

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.92 });
        const ironMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.7 });

        for (let i = 0; i < 3; i++) {
            const plank = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.12), woodMat);
            plank.position.set(0, 0.44, -0.12 + i * 0.14);
            plank.castShadow = true;
            benchGroup.add(plank);
        }

        for (let i = 0; i < 2; i++) {
            const bPlank = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.04), woodMat);
            bPlank.position.set(0, 0.65 + i * 0.16, -0.22);
            bPlank.castShadow = true;
            benchGroup.add(bPlank);
        }

        // Authentic Cast Iron Park Bench End Frames (Open bracket with front leg, back upright, and ground runner)
        [-0.55, 0.55].forEach(bx => {
            const frameGroup = new THREE.Group();
            frameGroup.position.set(bx, 0, 0);

            // Front leg
            const frontLeg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.04), ironMat);
            frontLeg.position.set(0, 0.21, 0.14);
            frontLeg.castShadow = true;
            frameGroup.add(frontLeg);

            // Back leg extending up into backrest stanchion
            const backStanchion = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.82, 0.04), ironMat);
            backStanchion.position.set(0, 0.41, -0.22);
            backStanchion.rotation.x = -0.12; // Gentle ergonomic backward recline
            backStanchion.castShadow = true;
            frameGroup.add(backStanchion);

            // Horizontal seat support bearer
            const seatBearer = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.38), ironMat);
            seatBearer.position.set(0, 0.40, -0.02);
            seatBearer.castShadow = true;
            frameGroup.add(seatBearer);

            // Diagonal bracing strut
            const brace = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.30, 0.03), ironMat);
            brace.position.set(0, 0.22, -0.04);
            brace.rotation.x = 0.65;
            brace.castShadow = true;
            frameGroup.add(brace);

            // Ground foot runner
            const foot = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.44), ironMat);
            foot.position.set(0, 0.015, -0.03);
            foot.castShadow = true;
            frameGroup.add(foot);

            benchGroup.add(frameGroup);
        });

        this.scene.add(benchGroup);
    }

    /**
     * VINTAGE JAPANESE COUNTRYSIDE BICYCLE (Mamachari / Retro Roadster)
     * Features: Spoked wheels with chrome rims, step-through twin-tube frame,
     * front fork, curved cruiser handlebars with leather grips, woven wire basket,
     * sprung leather saddle, chain guard, luggage rack, and deployed kickstand.
     */
    buildVintageBicycle(x, z, rotY = 0) {
        const bikeGroup = new THREE.Group();
        const ty = this.terrainSystem.getTerrainHeight(x, z);
        bikeGroup.position.set(x, ty, z);
        bikeGroup.rotation.y = rotY;

        // Subgroup to allow realistic lean angle (roll along local X axis) on kickstand
        const bikeBody = new THREE.Group();
        bikeBody.rotation.x = 0.13; // ~7.5 deg natural kickstand lean
        bikeGroup.add(bikeBody);

        // Materials
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x1e3a8a, // Japanese retro deep navy enamel
            roughness: 0.35,
            metalness: 0.4
        });
        const chromeMat = new THREE.MeshStandardMaterial({
            color: 0xe2e8f0,
            roughness: 0.15,
            metalness: 0.9
        });
        const tireMat = new THREE.MeshStandardMaterial({
            color: 0x18181b,
            roughness: 0.95,
            metalness: 0.05
        });
        const leatherMat = new THREE.MeshStandardMaterial({
            color: 0x5c2c16,
            roughness: 0.75,
            metalness: 0.05
        });
        const basketMat = new THREE.MeshStandardMaterial({
            color: 0x334155,
            roughness: 0.5,
            metalness: 0.7
        });
        const lensMat = new THREE.MeshBasicMaterial({
            color: 0xfef08a
        });
        const reflectorMat = new THREE.MeshStandardMaterial({
            color: 0xdc2626,
            roughness: 0.2,
            metalness: 0.3
        });
        const amberReflectorMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            roughness: 0.2,
            metalness: 0.3
        });

        // WHEEL BUILDER (With Chrome Rim, Black Rubber Tire, Axle Hub, and Real Wire Spokes!)
        const wheelRadius = 0.325;
        const makeSpokedWheel = (wx) => {
            const wGroup = new THREE.Group();
            wGroup.position.set(wx, wheelRadius, 0);

            // 1. Rubber Tire
            const tire = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.024, 10, 32), tireMat);
            tire.castShadow = true;
            wGroup.add(tire);

            // 2. Polished Chrome Rim
            const rim = new THREE.Mesh(new THREE.TorusGeometry(0.285, 0.012, 8, 32), chromeMat);
            wGroup.add(rim);

            // 3. Central Axle Hub
            const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.07, 12), chromeMat);
            hub.rotation.x = Math.PI / 2;
            wGroup.add(hub);

            // 4. Chrome Axle End Nuts
            [-0.038, 0.038].forEach(nz => {
                const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.015, 6), chromeMat);
                nut.rotation.x = Math.PI / 2;
                nut.position.z = nz;
                wGroup.add(nut);
            });

            // 5. Wire Spokes (6 double-ended spoke cylinders = 12 spokes radiating from hub to rim)
            const spokeGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.56, 4);
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 6;
                const spoke = new THREE.Mesh(spokeGeo, chromeMat);
                spoke.rotation.z = angle;
                wGroup.add(spoke);
            }

            // 6. Spoke Amber Reflector
            const reflector = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.015), amberReflectorMat);
            reflector.position.set(0, 0.16, 0);
            wGroup.add(reflector);

            return wGroup;
        };

        // Front & Rear Wheels
        bikeBody.add(makeSpokedWheel(-0.48)); // Rear wheel
        bikeBody.add(makeSpokedWheel(0.48));  // Front wheel

        // FENDERS (MUDGUARDS)
        // Rear Fender with chrome strut stay
        const rearFender = new THREE.Mesh(new THREE.TorusGeometry(0.315, 0.016, 6, 20, Math.PI * 0.75), frameMat);
        rearFender.position.set(-0.48, wheelRadius, 0);
        rearFender.rotation.z = Math.PI * 0.45;
        bikeBody.add(rearFender);

        const rearFenderStay = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.32, 4), chromeMat);
        rearFenderStay.position.set(-0.64, wheelRadius + 0.12, 0);
        rearFenderStay.rotation.z = -0.4;
        bikeBody.add(rearFenderStay);

        // Front Fender
        const frontFender = new THREE.Mesh(new THREE.TorusGeometry(0.315, 0.016, 6, 16, Math.PI * 0.5), frameMat);
        frontFender.position.set(0.48, wheelRadius, 0);
        frontFender.rotation.z = Math.PI * 0.35;
        bikeBody.add(frontFender);

        // FRAME TUBING HELPER (Cylinder between two 3D points)
        const addTube = (p1, p2, radius, mat = frameMat) => {
            const v1 = new THREE.Vector3(...p1);
            const v2 = new THREE.Vector3(...p2);
            const dir = new THREE.Vector3().subVectors(v2, v1);
            const len = dir.length();
            const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);

            const tube = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, 8), mat);
            tube.position.copy(mid);
            tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
            tube.castShadow = true;
            bikeBody.add(tube);
            return tube;
        };

        // 1. Bottom Bracket shell
        const bbShell = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.07, 10), frameMat);
        bbShell.rotation.x = Math.PI / 2;
        bbShell.position.set(-0.08, 0.28, 0);
        bikeBody.add(bbShell);

        // 2. Seat Tube
        addTube([-0.08, 0.28, 0], [-0.16, 0.64, 0], 0.015);

        // 3. Head Tube
        addTube([0.38, 0.44, 0], [0.42, 0.72, 0], 0.018);

        // 4. Down Tube (BB to Head Tube Lower)
        addTube([-0.08, 0.28, 0], [0.38, 0.46, 0], 0.016);

        // 5. Vintage Curved Twin Top Tubes (Classic Mamachari Step-Through Elegance)
        addTube([-0.16, 0.58, 0], [0.40, 0.66, 0], 0.014);
        addTube([-0.13, 0.46, 0], [0.39, 0.54, 0], 0.012);

        // 6. Chain Stays (BB to Rear Axle - Twin tubes)
        addTube([-0.08, 0.28, 0.028], [-0.48, wheelRadius, 0.035], 0.011);
        addTube([-0.08, 0.28, -0.028], [-0.48, wheelRadius, -0.035], 0.011);

        // 7. Seat Stays (Seat Cluster to Rear Axle - Twin tubes)
        addTube([-0.16, 0.64, 0.018], [-0.48, wheelRadius, 0.035], 0.011);
        addTube([-0.16, 0.64, -0.018], [-0.48, wheelRadius, -0.035], 0.011);

        // 8. Front Fork Blades (Crown to Front Axle - Twin chrome blades)
        addTube([0.38, 0.44, 0.025], [0.48, wheelRadius, 0.035], 0.012, chromeMat);
        addTube([0.38, 0.44, -0.025], [0.48, wheelRadius, -0.035], 0.012, chromeMat);

        // STEERING & HANDLEBARS
        // Quill Stem
        addTube([0.42, 0.72, 0], [0.43, 0.82, 0], 0.013, chromeMat);
        addTube([0.43, 0.82, 0], [0.46, 0.83, 0], 0.012, chromeMat);

        // Swept-Back Handlebars (North Road style cruiser bars)
        const hBarGroup = new THREE.Group();
        hBarGroup.position.set(0.46, 0.83, 0);

        // Center crossbar
        const barCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.38, 8), chromeMat);
        barCenter.rotation.x = Math.PI / 2;
        hBarGroup.add(barCenter);

        // Curved ends with leather grips
        [-0.19, 0.19].forEach(sideZ => {
            const gripCurve = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.14, 8), chromeMat);
            gripCurve.position.set(-0.06, -0.02, sideZ);
            gripCurve.rotation.y = sideZ > 0 ? -0.4 : 0.4;
            hBarGroup.add(gripCurve);

            // Vintage leather hand grip
            const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.10, 8), leatherMat);
            grip.position.set(-0.09, -0.02, sideZ);
            grip.rotation.y = sideZ > 0 ? -0.4 : 0.4;
            hBarGroup.add(grip);

            // Chrome brake lever
            const lever = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.008, 0.014), chromeMat);
            lever.position.set(-0.05, -0.03, sideZ * 0.9);
            lever.rotation.z = -0.3;
            hBarGroup.add(lever);
        });

        // Retro Chrome Bell on left handlebar
        const bell = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), chromeMat);
        bell.position.set(0.01, 0.025, 0.11);
        hBarGroup.add(bell);

        bikeBody.add(hBarGroup);

        // BULLET HEADLIGHT (Vintage Chrome with warm light lens)
        const lamp = new THREE.Group();
        lamp.position.set(0.46, 0.64, 0);
        const lampBody = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.07, 10), chromeMat);
        lampBody.rotation.z = Math.PI / 2;
        lamp.add(lampBody);
        const lampLens = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), lensMat);
        lampLens.rotation.z = -Math.PI / 2;
        lampLens.position.x = 0.035;
        lamp.add(lampLens);
        bikeBody.add(lamp);

        // FRONT WIRE BASKET (Iconic Japanese Mamachari Basket)
        const basket = new THREE.Group();
        basket.position.set(0.56, 0.72, 0);

        const bBottom = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.015, 0.32), basketMat);
        basket.add(bBottom);
        const bFront = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.18, 0.32), basketMat);
        bFront.position.set(0.12, 0.09, 0);
        basket.add(bFront);
        const bBack = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.18, 0.32), basketMat);
        bBack.position.set(-0.12, 0.09, 0);
        basket.add(bBack);
        const bLeft = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.01), basketMat);
        bLeft.position.set(0, 0.09, -0.16);
        basket.add(bLeft);
        const bRight = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.01), basketMat);
        bRight.position.set(0, 0.09, 0.16);
        basket.add(bRight);

        // Basket support strut down to front axle
        addTube([0.56, 0.64, 0], [0.48, wheelRadius, 0], 0.006, chromeMat);
        bikeBody.add(basket);

        // COMFORTABLE SPRUNG LEATHER SADDLE
        const saddleGroup = new THREE.Group();
        saddleGroup.position.set(-0.16, 0.64, 0);

        const seatPost = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), chromeMat);
        seatPost.position.y = 0.04;
        saddleGroup.add(seatPost);

        // Chrome dual suspension springs
        [-0.04, 0.04].forEach(sz => {
            const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.04, 6), chromeMat);
            spring.position.set(-0.06, 0.08, sz);
            saddleGroup.add(spring);
        });

        const seatTop = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.035, 0.18), leatherMat);
        seatTop.position.set(0, 0.11, 0);
        seatTop.castShadow = true;
        saddleGroup.add(seatTop);

        const seatNose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), leatherMat);
        seatNose.rotation.z = Math.PI / 2;
        seatNose.position.set(0.12, 0.105, 0);
        saddleGroup.add(seatNose);

        bikeBody.add(saddleGroup);

        // REAR LUGGAGE CARRIER RACK
        const rackGroup = new THREE.Group();
        rackGroup.position.set(-0.42, 0.62, 0);
        const rackPlatform = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.015, 0.15), chromeMat);
        rackGroup.add(rackPlatform);

        // Struts to rear axle
        addTube([-0.42, 0.62, 0.06], [-0.48, wheelRadius, 0.035], 0.006, chromeMat);
        addTube([-0.42, 0.62, -0.06], [-0.48, wheelRadius, -0.035], 0.006, chromeMat);

        // Red rear reflector
        const rearReflector = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.015, 8), reflectorMat);
        rearReflector.rotation.z = Math.PI / 2;
        rearReflector.position.set(-0.14, 0, 0);
        rackGroup.add(rearReflector);

        bikeBody.add(rackGroup);

        // DRIVETRAIN (Chainring, Crankset, Pedals, Chain Guard)
        const driveGroup = new THREE.Group();
        driveGroup.position.set(-0.08, 0.28, 0);

        // Chainring disc
        const chainring = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.008, 12), chromeMat);
        chainring.rotation.x = Math.PI / 2;
        chainring.position.z = 0.035;
        driveGroup.add(chainring);

        // Mamachari protective chain case / guard
        const chainGuard = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.075, 0.016), frameMat);
        chainGuard.position.set(-0.16, 0.01, 0.04);
        driveGroup.add(chainGuard);

        // Crank arms & Pedals
        const crankR = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.12, 0.01), chromeMat);
        crankR.position.set(0.04, 0.04, 0.05);
        crankR.rotation.z = -0.4;
        driveGroup.add(crankR);

        const pedalR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.02, 0.05), tireMat);
        pedalR.position.set(0.07, 0.09, 0.08);
        driveGroup.add(pedalR);

        const crankL = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.12, 0.01), chromeMat);
        crankL.position.set(-0.04, -0.04, -0.05);
        crankL.rotation.z = -0.4;
        driveGroup.add(crankL);

        const pedalL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.02, 0.05), tireMat);
        pedalL.position.set(-0.07, -0.09, -0.08);
        driveGroup.add(pedalL);

        bikeBody.add(driveGroup);

        // DEPLOYED SIDE KICKSTAND (Firmly grounded)
        addTube([-0.12, 0.28, -0.03], [-0.14, 0.01, -0.20], 0.009, chromeMat);
        const kickstandFoot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.03), chromeMat);
        kickstandFoot.position.set(-0.14, 0.005, -0.20);
        bikeBody.add(kickstandFoot);

        // RUSTIC TIMBER PARKING RACK STAND (Behind rear wheel)
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3f2b, roughness: 0.9 });
        const rackStand = new THREE.Group();
        rackStand.position.set(-0.70, 0, 0);

        const timberBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.30), woodMat);
        timberBase.position.y = 0.04;
        rackStand.add(timberBase);

        [-0.08, 0.08].forEach(sz => {
            const chock = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.05), woodMat);
            chock.position.set(0, 0.12, sz);
            rackStand.add(chock);
        });
        bikeGroup.add(rackStand);

        this.scene.add(bikeGroup);
        return bikeGroup;
    }

    buildUtilityPoles() {
        const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
        const wireMat = new THREE.LineBasicMaterial({ color: 0x27272a, linewidth: 1.5 });

        const poleCoords = [
            { x: 3.8, z: -8.5 },
            { x: 3.2, z: -25.0 }
        ];

        const poleTops = [];
        poleCoords.forEach(c => {
            const pole = new THREE.Group();
            const ty = this.terrainSystem.getTerrainHeight(c.x, c.z);
            pole.position.set(c.x, ty, c.z);

            const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 7.2, 8), poleMat);
            shaft.position.y = 3.6;
            shaft.castShadow = true;
            pole.add(shaft);

            const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.08), poleMat);
            arm.position.y = 6.4;
            pole.add(arm);

            this.scene.add(pole);
            poleTops.push(new THREE.Vector3(c.x, ty + 6.8, c.z));
        });

        if (poleTops.length >= 2) {
            const p1 = poleTops[0];
            const p2 = poleTops[1];
            const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            mid.y -= 0.65;

            const wireCurve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
            const wireGeo = new THREE.BufferGeometry().setFromPoints(wireCurve.getPoints(24));
            const wireLine = new THREE.Line(wireGeo, wireMat);
            this.scene.add(wireLine);
        }
    }

    buildStoneLantern(x, z) {
        const lantern = new THREE.Group();
        const ty = this.terrainSystem.getTerrainHeight(x, z);
        lantern.position.set(x, ty, z);

        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x71717a, roughness: 0.95 });
        const lightMat = new THREE.MeshStandardMaterial({
            color: 0xffedd5,
            emissive: 0xfbbf24,
            emissiveIntensity: 0.85,
            roughness: 0.35
        });
        this.lanternMaterials.push(lightMat);

        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.18, 6), stoneMat);
        base.position.y = 0.09;
        lantern.add(base);

        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.45, 6), stoneMat);
        shaft.position.y = 0.38;
        lantern.add(shaft);

        const chamber = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.28), stoneMat);
        chamber.position.y = 0.68;
        lantern.add(chamber);

        const lightCore = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), lightMat);
        lightCore.position.y = 0.68;
        lantern.add(lightCore);

        // Warm glowing point light for dusk/night
        const pointLight = new THREE.PointLight(0xf59e0b, 1.8, 11.0, 1.8);
        pointLight.position.set(0, 0.68, 0);
        lantern.add(pointLight);
        this.lanternLights.push(pointLight);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.18, 6), stoneMat);
        roof.position.y = 0.86;
        lantern.add(roof);

        lantern.castShadow = true;
        this.scene.add(lantern);
    }

    buildSignpost(x, z, rotY, text = '-> WAYPOINT') {
        const sign = new THREE.Group();
        const ty = this.terrainSystem.getTerrainHeight(x, z);
        sign.position.set(x, ty, z);
        sign.rotation.y = rotY;

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 });

        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.4, 6), woodMat);
        post.position.y = 0.7;
        sign.add(post);

        const board = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.24, 0.04), woodMat);
        board.position.set(0.15, 1.2, 0);
        sign.add(board);

        this.scene.add(sign);
    }

    /**
     * RUSTIC CAMPFIRE WITH REAL FLICKERING POINT LIGHT (Master Spec v4 Section 65)
     */
    buildCampfire(x, z) {
        const fireGroup = new THREE.Group();
        const ty = this.terrainSystem.getTerrainHeight(x, z);
        fireGroup.position.set(x, ty, z);

        // Ring of weathered river stones
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12, 0), stoneMat);
            stone.position.set(Math.cos(angle) * 0.55, 0.08, Math.sin(angle) * 0.55);
            stone.scale.set(1.2, 0.8, 1.0);
            stone.rotation.set(Math.random(), Math.random(), Math.random());
            fireGroup.add(stone);
        }

        // Charred firewood logs in tipi formation
        const logMat = new THREE.MeshStandardMaterial({ color: 0x271e18, roughness: 0.95 });
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const log = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.65, 6), logMat);
            log.position.set(Math.cos(angle) * 0.18, 0.22, Math.sin(angle) * 0.18);
            log.rotation.x = Math.cos(angle) * 0.45;
            log.rotation.z = Math.sin(angle) * 0.45;
            fireGroup.add(log);
        }

        // Glowing hot charcoal ember bed
        const emberMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
        const embers = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.06, 12), emberMat);
        embers.position.y = 0.04;
        fireGroup.add(embers);

        // Stylized flame core
        const flameMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.85 });
        const flameCore = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.48, 8), flameMat);
        flameCore.position.y = 0.32;
        fireGroup.add(flameCore);

        // Warm flickering point light
        const fireLight = new THREE.PointLight(0xf97316, 2.2, 9.0, 1.8);
        fireLight.position.set(0, 0.5, 0);
        fireLight.castShadow = true;
        fireGroup.add(fireLight);
        this.campfireLight = fireLight;

        this.scene.add(fireGroup);
    }

    /**
     * ZEN TEA PAVILION (CHÒI TRÀ ĐẠO THIỀN ĐỊNH - RỪNG TRÚC TÂY BẮC)
     * Elevated wooden pavilion with tatami floor mats, shishi-odoshi bamboo fountain & stone lantern.
     */
    buildZenTeaPavilion(x, z) {
        const pavilion = new THREE.Group();
        const ty = this.terrainSystem.getTerrainHeight(x, z);
        pavilion.position.set(x, ty, z);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x422d1d, roughness: 0.86 });
        const postMat = new THREE.MeshStandardMaterial({ color: 0x543824, roughness: 0.82 });
        const roofMat = new THREE.MeshStandardMaterial({
            color: 0x334155, // Elegant Japanese charcoal-slate kawara tile
            roughness: 0.62,
            metalness: 0.12,
            side: THREE.FrontSide
        });
        const hinokiMat = new THREE.MeshStandardMaterial({
            color: 0x855a36, // Warm Japanese Hinoki cypress timber
            roughness: 0.78,
            metalness: 0.02
        });
        const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 });
        const tatamiMat = new THREE.MeshStandardMaterial({ color: 0xa3b18a, roughness: 0.85 }); // Woven straw reed
        const borderMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }); // Black fabric edge
        const bambooMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.65 });
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.94 });
        const waterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.8 });

        // 1. Raised Timber Deck (4.8m x 4.8m x 0.16m, deck top at relative y = 0.24)
        const deckGeo = new THREE.BoxGeometry(4.8, 0.16, 4.8);
        const deckMesh = new THREE.Mesh(deckGeo, woodMat);
        deckMesh.position.y = 0.16;
        deckMesh.receiveShadow = true;
        deckMesh.castShadow = true;
        pavilion.add(deckMesh);

        // Timber Skirt Fascia / Apron boards (0.75m deep) to solidly seal all slope gaps into terrain
        const fasciaH = 0.75;
        const fasciaNS = new THREE.BoxGeometry(4.84, fasciaH, 0.08);
        [-2.38, 2.38].forEach(fz => {
            const fMesh = new THREE.Mesh(fasciaNS, postMat);
            fMesh.position.set(0, 0.16 - fasciaH / 2, fz);
            fMesh.castShadow = true;
            fMesh.receiveShadow = true;
            pavilion.add(fMesh);
        });
        const fasciaEW = new THREE.BoxGeometry(0.08, fasciaH, 4.84);
        [-2.38, 2.38].forEach(fx => {
            const fMesh = new THREE.Mesh(fasciaEW, postMat);
            fMesh.position.set(fx, 0.16 - fasciaH / 2, 0);
            fMesh.castShadow = true;
            fMesh.receiveShadow = true;
            pavilion.add(fMesh);
        });

        // Foundation Grounding: 9 Terrain-Sampled Drop Stilts & Carved Stone Plinths
        // Corners, mid-edges, and center pier
        const footingOffsets = [
            [-2.2, -2.2], [0, -2.2], [2.2, -2.2],
            [-2.2,  0.0], [0,  0.0], [2.2,  0.0],
            [-2.2,  2.2], [0,  2.2], [2.2,  2.2]
        ];

        footingOffsets.forEach(([fx, fz]) => {
            const cornerTerrainY = this.terrainSystem.getTerrainHeight(x + fx, z + fz);
            const relGround = cornerTerrainY - ty;
            const stiltTop = 0.08; // Bottom of timber deck
            const stiltBottom = relGround - 0.20; // Embed 20cm into soil
            const stiltLen = Math.max(0.35, stiltTop - stiltBottom);
            const stiltY = (stiltTop + stiltBottom) / 2;

            // Deep-anchored timber foundation post
            const stilt = new THREE.Mesh(new THREE.BoxGeometry(0.18, stiltLen, 0.18), postMat);
            stilt.position.set(fx, stiltY, fz);
            stilt.castShadow = true;
            stilt.receiveShadow = true;
            pavilion.add(stilt);

            // Carved stone foundation plinth resting firmly on ground
            const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.25, 0.36, 8), stoneMat);
            plinth.position.set(fx, relGround + 0.06, fz);
            plinth.castShadow = true;
            plinth.receiveShadow = true;
            pavilion.add(plinth);
        });

        // South Entrance Steps leading from path up onto the deck
        const step1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.14, 0.44), woodMat);
        step1.position.set(0, 0.04, 2.65);
        step1.castShadow = true;
        step1.receiveShadow = true;
        pavilion.add(step1);

        const step2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.14, 0.38), woodMat);
        step2.position.set(0, 0.14, 2.44);
        step2.castShadow = true;
        step2.receiveShadow = true;
        pavilion.add(step2);

        // Natural stone pavers approaching the entrance steps
        [
            { px: 0.10, pz: 3.12 },
            { px: -0.15, pz: 3.65 },
            { px: 0.12, pz: 4.18 }
        ].forEach(p => {
            const py = this.terrainSystem.getTerrainHeight(x + p.px, z + p.pz) - ty;
            const paver = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.12, 7), stoneMat);
            paver.position.set(p.px, py + 0.04, p.pz);
            paver.rotation.y = Math.random() * Math.PI;
            paver.castShadow = true;
            paver.receiveShadow = true;
            pavilion.add(paver);
        });

        // 2. Corner Pillars (4 timber posts)
        [-2.1, 2.1].forEach(px => {
            [-2.1, 2.1].forEach(pz => {
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.5, 8), postMat);
                post.position.set(px, 1.41, pz);
                post.castShadow = true;
                pavilion.add(post);

                // Eave bracket complex (Masu-gumi)
                const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.32), postMat);
                bracket.position.set(px, 2.68, pz);
                bracket.castShadow = true;
                pavilion.add(bracket);
            });
        });

        // 3. Eaves Beam Trusses
        const beamGeo = new THREE.BoxGeometry(4.6, 0.12, 0.14);
        [-2.1, 2.1].forEach(bz => {
            const beam = new THREE.Mesh(beamGeo, postMat);
            beam.position.set(0, 2.66, bz);
            beam.castShadow = true;
            pavilion.add(beam);
        });
        const beamGeoZ = new THREE.BoxGeometry(0.14, 0.12, 4.6);
        [-2.1, 2.1].forEach(bx => {
            const beam = new THREE.Mesh(beamGeoZ, postMat);
            beam.position.set(bx, 2.66, 0);
            beam.castShadow = true;
            pavilion.add(beam);
        });

        // 4. Traditional Two-Tier Japanese Hipped Roof (Irimoya / Shikoro-buki architecture)
        // Lower flared eave canopy tier (protects tatami deck from wind and rain)
        const lowerRoofGeo = new THREE.ConeGeometry(4.35, 0.75, 4, 1, true);
        lowerRoofGeo.rotateY(Math.PI / 4);
        const lowerRoof = new THREE.Mesh(lowerRoofGeo, roofMat);
        lowerRoof.position.y = 2.95;
        lowerRoof.castShadow = true;
        pavilion.add(lowerRoof);

        // Underside Eaves Cedar Soffit (Keshō Nodaita - authentic warm Hinoki lining receiving lantern glow)
        const lowerUndersideGeo = new THREE.ConeGeometry(4.33, 0.74, 4, 1, true);
        lowerUndersideGeo.rotateY(Math.PI / 4);
        const hinokiUndersideMat = new THREE.MeshStandardMaterial({
            color: 0xa8714a,
            roughness: 0.72,
            metalness: 0.02,
            emissive: 0x543824,
            emissiveIntensity: 0.45,
            side: THREE.BackSide
        });
        const lowerUnderside = new THREE.Mesh(lowerUndersideGeo, hinokiUndersideMat);
        lowerUnderside.position.y = 2.94;
        lowerUnderside.receiveShadow = true;
        pavilion.add(lowerUnderside);

        // Upper main roof tier
        const upperRoofGeo = new THREE.ConeGeometry(3.30, 1.10, 4, 1, true);
        upperRoofGeo.rotateY(Math.PI / 4);
        const upperRoof = new THREE.Mesh(upperRoofGeo, roofMat);
        upperRoof.position.y = 3.65;
        upperRoof.castShadow = true;
        pavilion.add(upperRoof);

        // Timber Ridge Capping (Mune) & Ridge finials
        const ridgeBeamX = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.14), ridgeMat);
        ridgeBeamX.position.set(0, 4.22, 0);
        ridgeBeamX.castShadow = true;
        pavilion.add(ridgeBeamX);

        const finial = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 6), ridgeMat);
        finial.position.set(0, 4.38, 0);
        finial.castShadow = true;
        pavilion.add(finial);

        // Interior Hinoki Cypress Ceiling Board (seals the hollow roof cone with warm cedar wood)
        const ceilingGeo = new THREE.BoxGeometry(4.55, 0.04, 4.55);
        const ceilingMesh = new THREE.Mesh(ceilingGeo, hinokiMat);
        ceilingMesh.position.y = 2.68;
        ceilingMesh.receiveShadow = true;
        pavilion.add(ceilingMesh);

        // Exposed Hinoki carpentry rafters under the ceiling
        for (let r = -2; r <= 2; r++) {
            const rBeam = new THREE.Mesh(new THREE.BoxGeometry(4.52, 0.06, 0.08), hinokiMat);
            rBeam.position.set(0, 2.64, r * 0.95);
            rBeam.castShadow = true;
            pavilion.add(rBeam);
        }

        [-1.1, 1.1].forEach(rx => {
            const rBeamZ = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 4.52), hinokiMat);
            rBeamZ.position.set(rx, 2.64, 0);
            rBeamZ.castShadow = true;
            pavilion.add(rBeamZ);
        });

        // Hanging Japanese Paper Lantern (Chochin) with warm interior illumination
        const lanternGroup = new THREE.Group();
        lanternGroup.position.set(0, 2.25, 0);

        const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.65, 6), borderMat);
        cord.position.y = 0.35;
        lanternGroup.add(cord);

        const lanternMat = new THREE.MeshStandardMaterial({
            color: 0xffedd5,
            emissive: 0xfde047,
            emissiveIntensity: 0.95,
            roughness: 0.4
        });
        this.lanternMaterials.push(lanternMat);
        const lanternBody = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.36, 12), lanternMat);
        lanternGroup.add(lanternBody);

        const capMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
        [-0.18, 0.18].forEach(cy => {
            const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.03, 12), capMat);
            cap.position.y = cy;
            lanternGroup.add(cap);
        });

        const pavilionLight = new THREE.PointLight(0xfef08a, 1.85, 8.5);
        pavilionLight.position.set(0, 0, 0);
        lanternGroup.add(pavilionLight);
        this.lanternLights.push(pavilionLight);

        pavilion.add(lanternGroup);

        // 5. Tatami Meditation Mats on deck
        const buildTatamiMat = (tx, tz) => {
            const matGroup = new THREE.Group();
            matGroup.position.set(tx, 0.25, tz);

            const matCore = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.8), tatamiMat);
            matGroup.add(matCore);

            // Black cloth border strips
            [-0.39, 0.39].forEach(bz => {
                const bStrip = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.035, 0.05), borderMat);
                bStrip.position.z = bz;
                matGroup.add(bStrip);
            });

            pavilion.add(matGroup);
        };

        buildTatamiMat(-0.85, 0.0); // Tatami Mat #1
        buildTatamiMat(0.85, 0.0);  // Tatami Mat #2

        // Low tea table in center
        const teaTable = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.5), woodMat);
        teaTable.position.set(0, 0.33, 0);
        pavilion.add(teaTable);

        // Ceramic matcha tea bowl & bamboo whisk
        const bowlMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
        const teaBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.045, 12), bowlMat);
        teaBowl.position.set(0.08, 0.44, 0.05);
        pavilion.add(teaBowl);

        // 6. Shishi-odoshi (Bamboo water fountain rocker)
        const fountainGroup = new THREE.Group();
        fountainGroup.position.set(-2.8, 0, 1.2);

        // Fulcrum bamboo stand
        [-0.15, 0.15].forEach(fz => {
            const fPost = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.65, 8), bambooMat);
            fPost.position.set(0, 0.32, fz);
            fountainGroup.add(fPost);
        });
        const pivotRod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 8), bambooMat);
        pivotRod.rotation.x = Math.PI / 2;
        pivotRod.position.y = 0.52;
        fountainGroup.add(pivotRod);

        // Rocking bamboo pipe
        const rockerPipe = new THREE.Group();
        rockerPipe.position.set(0, 0.52, 0);

        const pipeGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.72, 8);
        pipeGeo.rotateZ(Math.PI / 2);
        const pipeMesh = new THREE.Mesh(pipeGeo, bambooMat);
        pipeMesh.position.x = 0.15;
        rockerPipe.add(pipeMesh);
        fountainGroup.add(rockerPipe);
        this.shishiOdoshiPipe = rockerPipe;

        // Steady bamboo water supply spout
        const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45, 8), bambooMat);
        spout.rotation.z = -0.5;
        spout.position.set(-0.25, 0.75, 0);
        fountainGroup.add(spout);

        // Tsukubai carved stone water basin
        const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.30, 0.32, 12), stoneMat);
        basin.position.set(0.42, 0.16, 0);
        basin.castShadow = true;
        fountainGroup.add(basin);

        const basinWater = new THREE.Mesh(new THREE.CircleGeometry(0.28, 12), waterMat);
        basinWater.rotateX(-Math.PI / 2);
        basinWater.position.set(0.42, 0.30, 0);
        fountainGroup.add(basinWater);

        pavilion.add(fountainGroup);

        // 7. Stone Lantern framing Entrance Approach (shifted clear of entrance steps)
        this.buildStoneLantern(x + 1.6, z + 3.4);

        this.scene.add(pavilion);
        return pavilion;
    }

    /**
     * MAPLE STREAM REST STOP (KHU NGHỈ CHÂN VEN SUỐI PHONG ĐỎ - ĐÔNG BẮC)
     * Features: Round timber picnic table, stump stools & stream viewing bench.
     */
    buildMapleStreamRestStop(x, z) {
        const restGroup = new THREE.Group();
        const ty = this.terrainSystem.getTerrainHeight(x, z);
        restGroup.position.set(x, ty, z);

        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.88 });
        const postMat = new THREE.MeshStandardMaterial({ color: 0x452c1e, roughness: 0.92 });

        // 1. Round Timber Picnic Table
        const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 16), woodMat);
        tableTop.position.y = 0.72;
        tableTop.castShadow = true;
        restGroup.add(tableTop);

        const tablePost = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.68, 10), postMat);
        tablePost.position.y = 0.34;
        tablePost.castShadow = true;
        restGroup.add(tablePost);

        // 2. Log Stump Stools (4 seats around picnic table at radius 1.25m)
        // Solidly grounded into terrain, with height 0.44m so top surface sits at gy + 0.44m
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const sx = Math.cos(angle) * 1.25;
            const sz = Math.sin(angle) * 1.25;
            const wx = x + sx;
            const wz = z + sz;
            const gy = this.terrainSystem.getTerrainHeight(wx, wz);
            // Height of stool is 0.44m above local ground, extending 0.18m into ground for solid anchor
            const topY = gy + 0.44;
            const bottomY = gy - 0.18;
            const totalH = topY - bottomY;
            const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, totalH, 12), postMat);
            // In restGroup local space:
            stool.position.set(sx, (bottomY + topY) * 0.5 - ty, sz);
            stool.castShadow = true;
            stool.receiveShadow = true;
            restGroup.add(stool);
        }

        // Ceramic teapot & cup on tea table
        const teaSetMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 });
        const teapot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.085, 0.12, 12), teaSetMat);
        teapot.position.set(0.08, 0.82, -0.05);
        teapot.castShadow = true;
        restGroup.add(teapot);

        const teacup = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.05, 10), teaSetMat);
        teacup.position.set(-0.15, 0.78, 0.12);
        teacup.castShadow = true;
        restGroup.add(teacup);

        this.scene.add(restGroup);

        // 3. Wayside Bench overlooking stream and footbridge (Spacious 4.5m North of bridge exit)
        this.buildWoodenBench(37.0, -23.5, -Math.PI * 0.65);

        // 4. Wooden Direction Signpost (Positioned safely at path verge greeting arrivals)
        this.buildSignpost(37.2, -26.0, 0.35, 'MAPLE REST STOP ->');

        return restGroup;
    }

    update(time, timeOfDaySystem = null) {
        if (this.terminalCanvasStreamer) {
            this.terminalCanvasStreamer.update(time);
        }

        if (this.campfireLight) {
            const flicker = Math.sin(time * 11.5) * 0.35 + Math.cos(time * 16.3) * 0.25;
            this.campfireLight.intensity = Math.max(1.2, 2.2 + flicker);
        }

        // Animated Shishi-odoshi bamboo pipe rocker cycle (~6.5 sec period)
        if (this.shishiOdoshiPipe) {
            const cycle = (time % 6.5) / 6.5; // 0.0 to 1.0
            if (cycle < 0.75) {
                // Filling with water: tilts forward slowly from 0.0 to 0.48 rad
                const t = cycle / 0.75;
                this.shishiOdoshiPipe.rotation.z = t * 0.48;
            } else if (cycle < 0.85) {
                // Snaps back rapidly and thuds on the stone
                const snapT = (cycle - 0.75) / 0.10;
                this.shishiOdoshiPipe.rotation.z = (1.0 - snapT) * 0.48;
            } else {
                // Resting on stone
                this.shishiOdoshiPipe.rotation.z = 0.0;
            }
        }

        // Dynamic Day/Night lighting updates for lanterns and holographic screens
        if (timeOfDaySystem) {
            const lanternIntensity = timeOfDaySystem.lanternPointLightIntensity || 0;
            const screenBoost = timeOfDaySystem.screenEmissiveBoost || 1.0;

            if (this.lanternLights && this.lanternLights.length > 0) {
                for (let i = 0; i < this.lanternLights.length; i++) {
                    const l = this.lanternLights[i];
                    if (l) {
                        l.intensity = lanternIntensity;
                    }
                }
            }

            if (this.lanternMaterials && this.lanternMaterials.length > 0) {
                const emissiveFactor = Math.min(2.0, Math.max(0.05, lanternIntensity * 0.65));
                for (let i = 0; i < this.lanternMaterials.length; i++) {
                    const m = this.lanternMaterials[i];
                    if (m) {
                        m.emissiveIntensity = emissiveFactor;
                    }
                }
            }

            if (this.screenMaterials && this.screenMaterials.length > 0) {
                for (let i = 0; i < this.screenMaterials.length; i++) {
                    const sm = this.screenMaterials[i];
                    if (sm) {
                        sm.emissiveIntensity = screenBoost;
                    }
                }
            }
        }
    }

    updateTerminalStream(text) {
        if (this.terminalCanvasStreamer) {
            this.terminalCanvasStreamer.appendData(text);
        }
    }
}
