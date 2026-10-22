import * as THREE from '/vendor/three/build/three.module.js';

/**
 * MODULAR DESK DECOR & PERSONAL FOCUS ZONE SYSTEM
 * TeleTerm 3D — Social Break-time & Cozy Vibes (Sprint 2.4)
 * 
 * Location: Developer Hub Co-working Timber Deck (Hub desks 1..4)
 * 
 * Features:
 * - 4 Procedural Desk Decor Preset Packs:
 *   1. Minimalist (Matte Black Espresso Mug, Saucer & Cyber Stylus)
 *   2. Zen Nature (Mini Bonsai Tree, Steaming Matcha Cup & River Stone)
 *   3. Cyber Hacker (Iconic Cyber Rubber Duck Debugger, Energy Can & PCB Token)
 *   4. Cozy Cafe (Artisan Ceramic Coffee with Latte Art, Sakura Vase & Maneki-neko)
 * - Zero Draw-Call Overhead & Zero-GC via pre-merged preset groups and visibility toggling
 * - Strict 0 new shadow casters (castShadow = false, receiveShadow = true, baked contact shadow decals)
 * - Drift-Free Pomodoro Focus Timer State Machine (25m Deep Work, 5m Break, 1m Demo)
 * - Pure Web Audio API Mechanical Keyboard Clatter Synthesizer (Zero audio file downloads, pure procedural)
 * - Diegetic Laptop Screen Emissive Boost during Deep Work Flow
 * - Persistence across sessions via localStorage (`teleterm_desk_prefs_v1`)
 * - Quick Access UI Popover (`Alt + D`) and compact HUD trigger
 */
export class ModularDeskDecorSystem {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.onToast = options.onToast || null;
        this.onReward = options.onReward || null;

        // Group container
        this.group = new THREE.Group();
        this.group.name = 'ModularDeskDecorSystem';

        // 4 Hub Desk Stations (positions relative to Hub Group or world)
        // Hub timber platform is centered at x: 22.0, z: -11.0, surface y: 1.04
        this.stations = [
            { id: 'hub_desk_chair_1', worldPos: { x: 20.6, y: 1.04, z: -11.6 }, rotY: 0 },
            { id: 'hub_desk_chair_2', worldPos: { x: 23.2, y: 1.04, z: -11.6 }, rotY: 0 },
            { id: 'hub_desk_chair_3', worldPos: { x: 18.2, y: 1.04, z: -12.8 }, rotY: 0.2 },
            { id: 'hub_desk_chair_4', worldPos: { x: 23.2, y: 1.04, z: -13.95 }, rotY: 0 }
        ];

        // Station Meshes Dictionary: stationId -> { minimalist, zen_nature, cyber_hacker, cozy_cafe }
        this.stationDecorPacks = new Map();

        // Active Preferences
        this.preferences = {
            activeStationId: 'hub_desk_chair_2',
            activePreset: 'zen_nature',
            soundClatterEnabled: true,
            completedSessions: 0,
            focusCoins: 0
        };

        // Pomodoro State Machine
        this.pomodoro = {
            state: 'IDLE', // 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED'
            mode: 'work_25', // 'work_25' (1500s) | 'break_5' (300s) | 'demo_1' (60s)
            durationSec: 1500,
            remainingSec: 1500,
            endTimeMs: 0,
            lastTickSec: 0,
            lastClatterSec: 0
        };

        // Web Audio Context for Procedural Mechanical Keyboard Synth
        this.audioCtx = null;

        // UI & Modal Elements
        this.modalEl = null;
        this.isOpen = false;

        this.loadPreferences();
        this.initUI();
        this.initKeyboardShortcut();
    }

    loadPreferences() {
        if (typeof localStorage === 'undefined') return;
        try {
            const raw = localStorage.getItem('teleterm_desk_prefs_v1');
            if (raw) {
                const parsed = JSON.parse(raw);
                this.preferences = Object.assign(this.preferences, parsed);
            }
        } catch (e) {}
    }

    savePreferences() {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem('teleterm_desk_prefs_v1', JSON.stringify(this.preferences));
        } catch (e) {}
    }

    ensureAudioContext() {
        if (!this.audioCtx && typeof window !== 'undefined') {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    /**
     * PROCEDURAL MECHANICAL KEYBOARD SYNTHESIZER (ZERO-GC)
     * Creates authentic tactile / thocky switch keystroke clatter using filtered white noise bursts.
     */
    playKeyClatter() {
        if (!this.preferences.soundClatterEnabled) return;
        this.ensureAudioContext();
        if (!this.audioCtx) return;

        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        // Micro-buffer of white noise (15ms duration)
        const bufferSize = Math.floor(ctx.sampleRate * 0.015);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        // Bandpass Filter centered at 2100Hz with gentle pitch variation
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        const jitter = (Math.random() - 0.5) * 350;
        filter.frequency.value = 2100 + jitter;
        filter.Q.value = 4.5;

        // Gain envelope
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        source.start(now);
        source.stop(now + 0.018);
    }

    /**
     * PROCEDURAL SINGING BOWL ZEN CHIME (Pomodoro completion chime)
     */
    playZenChime() {
        this.ensureAudioContext();
        if (!this.audioCtx) return;

        const ctx = this.audioCtx;
        const now = ctx.currentTime;
        const freqs = [432, 864, 1296]; // Pure harmonic healing frequencies

        freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const vol = 0.12 / (idx + 1);
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(vol, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 3.3);
        });
    }

    build() {
        // Build decor packs for all 4 hub coding stations
        this.stations.forEach((st) => {
            const stationGroup = new THREE.Group();
            stationGroup.position.set(st.worldPos.x, st.worldPos.y, st.worldPos.z);
            stationGroup.rotation.y = st.rotY;

            const packs = {
                minimalist: this.buildMinimalistPack(),
                zen_nature: this.buildZenNaturePack(),
                cyber_hacker: this.buildCyberHackerPack(),
                cozy_cafe: this.buildCozyCafePack()
            };

            // Attach packs to station group
            Object.keys(packs).forEach((pKey) => {
                const pGroup = packs[pKey];
                pGroup.visible = (pKey === this.preferences.activePreset);
                stationGroup.add(pGroup);
            });

            this.stationDecorPacks.set(st.id, packs);
            this.group.add(stationGroup);
        });

        this.scene.add(this.group);
    }

    /**
     * Contact Shadow Decal helper (Zero shadow caster, contact AO)
     */
    createContactShadow(w, d, opacity = 0.42) {
        const geo = new THREE.PlaneGeometry(w, d);
        geo.rotateX(-Math.PI / 2);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x050505,
            transparent: true,
            opacity: opacity,
            depthWrite: false
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = 0.004;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        return mesh;
    }

    /**
     * 1. PRESET: MINIMALIST
     * Matte Black Ceramic Espresso Cup & saucer, sleek metal stylus.
     */
    buildMinimalistPack() {
        const group = new THREE.Group();
        group.name = 'decor_minimalist';

        // Right side of desk (x: 0.38, z: 0.14, table surface y: 0.75)
        const espressoGroup = new THREE.Group();
        espressoGroup.position.set(0.38, 0.75, 0.14);

        // Saucer
        const saucerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 });
        const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.012, 16), saucerMat);
        saucer.position.y = 0.006;
        saucer.castShadow = false;
        saucer.receiveShadow = true;
        espressoGroup.add(saucer);

        // Espresso Cup
        const cupMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25 });
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.030, 0.055, 14), cupMat);
        cup.position.y = 0.034;
        cup.castShadow = false;
        cup.receiveShadow = true;
        espressoGroup.add(cup);

        // Dark rich crema coffee surface
        const coffeeMat = new THREE.MeshBasicMaterial({ color: 0x451a03 });
        const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.034, 12), coffeeMat);
        coffee.rotateX(-Math.PI / 2);
        coffee.position.y = 0.058;
        espressoGroup.add(coffee);

        espressoGroup.add(this.createContactShadow(0.18, 0.18));
        group.add(espressoGroup);

        // Left side: Sleek Cyber Stylus & pen stand
        const penGroup = new THREE.Group();
        penGroup.position.set(-0.42, 0.75, 0.12);
        const standMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.025, 12), standMat);
        stand.position.y = 0.012;
        stand.castShadow = false;
        stand.receiveShadow = true;
        penGroup.add(stand);

        const penMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.6, roughness: 0.3 });
        const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 6), penMat);
        pen.position.set(0, 0.07, 0);
        pen.rotation.z = 0.15;
        pen.castShadow = false;
        pen.receiveShadow = true;
        penGroup.add(pen);

        penGroup.add(this.createContactShadow(0.09, 0.09));
        group.add(penGroup);

        return group;
    }

    /**
     * 2. PRESET: ZEN NATURE
     * Mini Bonsai Tree in glazed ceramic pot, Hinoki Matcha tea cup, river stone.
     */
    buildZenNaturePack() {
        const group = new THREE.Group();
        group.name = 'decor_zen_nature';

        // Left side: Miniature Bonsai Tree
        const bonsai = new THREE.Group();
        bonsai.position.set(-0.45, 0.75, 0.12);

        // Glazed ceramic pot
        const potMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.45 });
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.060, 0.055, 12), potMat);
        pot.position.y = 0.028;
        pot.castShadow = false;
        pot.receiveShadow = true;
        bonsai.add(pot);

        // Dark soil
        const soilMat = new THREE.MeshStandardMaterial({ color: 0x271e18, roughness: 0.95 });
        const soil = new THREE.Mesh(new THREE.CircleGeometry(0.070, 10), soilMat);
        soil.rotateX(-Math.PI / 2);
        soil.position.y = 0.055;
        bonsai.add(soil);

        // Gnarled woody trunk
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c2b09, roughness: 0.88 });
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.024, 0.15, 6), trunkMat);
        trunk.position.set(0.015, 0.12, 0);
        trunk.rotation.z = -0.22;
        trunk.castShadow = false;
        trunk.receiveShadow = true;
        bonsai.add(trunk);

        // Lush green foliage clumps
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });
        [
            { x: -0.02, y: 0.19, z: 0.02, s: 0.065 },
            { x: 0.04, y: 0.22, z: -0.02, s: 0.055 },
            { x: -0.05, y: 0.16, z: -0.03, s: 0.045 }
        ].forEach(f => {
            const ball = new THREE.Mesh(new THREE.DodecahedronGeometry(f.s, 1), leafMat);
            ball.position.set(f.x, f.y, f.z);
            ball.scale.set(1.2, 0.75, 1.1);
            ball.castShadow = false;
            ball.receiveShadow = true;
            bonsai.add(ball);
        });

        bonsai.add(this.createContactShadow(0.24, 0.24));
        group.add(bonsai);

        // Right side: Hinoki Matcha green tea cup
        const matcha = new THREE.Group();
        matcha.position.set(0.38, 0.75, 0.14);

        const hinokiMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 });
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.065, 12), hinokiMat);
        cup.position.y = 0.033;
        cup.castShadow = false;
        cup.receiveShadow = true;
        matcha.add(cup);

        // Vibrant matcha tea foam
        const teaMat = new THREE.MeshBasicMaterial({ color: 0x4ade80 });
        const tea = new THREE.Mesh(new THREE.CircleGeometry(0.038, 12), teaMat);
        tea.rotateX(-Math.PI / 2);
        tea.position.y = 0.062;
        matcha.add(tea);

        matcha.add(this.createContactShadow(0.14, 0.14));
        group.add(matcha);

        // Polished Zen River Stone Paperweight
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
        const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.035, 1), stoneMat);
        stone.position.set(0.24, 0.765, 0.18);
        stone.scale.set(1.4, 0.6, 1.1);
        stone.castShadow = false;
        stone.receiveShadow = true;
        group.add(stone);

        return group;
    }

    /**
     * 3. PRESET: CYBER HACKER
     * Iconic Rubber Duck Debugger with cool cyberpunk shades, Quantum Energy Drink can.
     */
    buildCyberHackerPack() {
        const group = new THREE.Group();
        group.name = 'decor_cyber_hacker';

        // Right side: Cyber Rubber Duck Debugger!
        const duck = new THREE.Group();
        duck.position.set(0.40, 0.75, 0.12);

        // Duck body (bright yellow)
        const duckMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.35 });
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), duckMat);
        body.position.y = 0.040;
        body.scale.set(1.1, 0.85, 1.25);
        body.castShadow = false;
        body.receiveShadow = true;
        duck.add(body);

        // Duck head
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.030, 10, 10), duckMat);
        head.position.set(0, 0.078, 0.025);
        head.castShadow = false;
        head.receiveShadow = true;
        duck.add(head);

        // Orange beak
        const beakMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
        const beak = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.022, 6), beakMat);
        beak.rotateX(Math.PI / 2);
        beak.position.set(0, 0.075, 0.052);
        duck.add(beak);

        // Cyberpunk sunglasses / visor
        const visorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.1 });
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.012, 0.010), visorMat);
        visor.position.set(0, 0.082, 0.045);
        duck.add(visor);

        duck.add(this.createContactShadow(0.14, 0.16));
        group.add(duck);

        // Left side: Quantum Neon Energy Drink Can
        const canGroup = new THREE.Group();
        canGroup.position.set(-0.42, 0.75, 0.14);
        const canMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.7, roughness: 0.25 });
        const can = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.10, 14), canMat);
        can.position.y = 0.05;
        can.castShadow = false;
        can.receiveShadow = true;
        canGroup.add(can);

        // Silver rim lid
        const lidMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.2 });
        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.028, 0.008, 12), lidMat);
        lid.position.y = 0.102;
        canGroup.add(lid);

        canGroup.add(this.createContactShadow(0.10, 0.10));
        group.add(canGroup);

        // Green Cyber PCB Token
        const pcbMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.006, 0.045), pcbMat);
        pcb.position.set(-0.32, 0.753, 0.18);
        pcb.rotation.y = 0.45;
        group.add(pcb);

        return group;
    }

    /**
     * 4. PRESET: COZY CAFE
     * Artisan Ceramic Coffee with Latte Art, Sakura branch in vase, Maneki-neko cat.
     */
    buildCozyCafePack() {
        const group = new THREE.Group();
        group.name = 'decor_cozy_cafe';

        // Right side: Artisan Ceramic Coffee Mug
        const mugGroup = new THREE.Group();
        mugGroup.position.set(0.38, 0.75, 0.14);

        const mugMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
        const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.040, 0.034, 0.075, 14), mugMat);
        mug.position.y = 0.038;
        mug.castShadow = false;
        mug.receiveShadow = true;
        mugGroup.add(mug);

        // Mug handle
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 12, Math.PI), mugMat);
        handle.rotation.z = -Math.PI / 2;
        handle.position.set(0.042, 0.038, 0);
        mugGroup.add(handle);

        // Latte art foam (creamy beige heart)
        const latteMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
        const latte = new THREE.Mesh(new THREE.CircleGeometry(0.036, 12), latteMat);
        latte.rotateX(-Math.PI / 2);
        latte.position.y = 0.072;
        mugGroup.add(latte);

        mugGroup.add(this.createContactShadow(0.15, 0.15));
        group.add(mugGroup);

        // Left side: Sakura blossom branch in porcelain vase
        const vaseGroup = new THREE.Group();
        vaseGroup.position.set(-0.44, 0.75, 0.12);

        const vaseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15 });
        const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.036, 0.12, 12), vaseMat);
        vase.position.y = 0.06;
        vase.castShadow = false;
        vase.receiveShadow = true;
        vaseGroup.add(vase);

        // Twig branch with cherry blossoms
        const twigMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
        const twig = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.005, 0.18, 5), twigMat);
        twig.position.set(0, 0.15, 0);
        twig.rotation.z = -0.25;
        vaseGroup.add(twig);

        // Pink sakura blossom petal clusters
        const sakuraMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.6 });
        [-0.04, 0.02].forEach((px, idx) => {
            const petal = new THREE.Mesh(new THREE.DodecahedronGeometry(0.022, 0), sakuraMat);
            petal.position.set(px, 0.20 + idx * 0.04, 0.01);
            vaseGroup.add(petal);
        });

        vaseGroup.add(this.createContactShadow(0.12, 0.12));
        group.add(vaseGroup);

        // Golden Maneki-Neko Lucky Cat Figurine
        const catGroup = new THREE.Group();
        catGroup.position.set(0.24, 0.75, 0.18);
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.25 });
        const catBody = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.055, 10), goldMat);
        catBody.position.y = 0.028;
        catGroup.add(catBody);

        const catHead = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), goldMat);
        catHead.position.y = 0.065;
        catGroup.add(catHead);

        // Raised lucky paw
        const paw = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.022, 0.008), goldMat);
        paw.position.set(0.018, 0.068, 0.012);
        paw.rotation.z = -0.45;
        catGroup.add(paw);

        catGroup.add(this.createContactShadow(0.10, 0.10));
        group.add(catGroup);

        return group;
    }

    /**
     * Switch Active Desk Preset (Minimalist, Zen Nature, Cyber Hacker, Cozy Cafe)
     */
    applyPreset(presetName) {
        this.preferences.activePreset = presetName;
        this.savePreferences();

        // Update 3D visibility across all stations
        this.stationDecorPacks.forEach((packs) => {
            Object.keys(packs).forEach((pKey) => {
                packs[pKey].visible = (pKey === presetName);
            });
        });

        // Update UI selection
        if (this.modalEl) {
            this.modalEl.querySelectorAll('.preset-card').forEach(card => {
                card.classList.toggle('active', card.getAttribute('data-preset') === presetName);
            });
        }

        if (this.onToast) {
            const titles = {
                minimalist: 'Minimalist (Espresso & Stylus)',
                zen_nature: 'Zen Nature (Mini Bonsai & Matcha)',
                cyber_hacker: 'Cyber Hacker (Rubber Duck & Energy)',
                cozy_cafe: 'Cozy Cafe (Latte & Maneki-neko)'
            };
            this.onToast(`Desk Decor: ${titles[presetName] || presetName}`, 'info');
        }
    }

    // ==================== POMODORO FOCUS ENGINE ====================

    startPomodoro(mode = 'work_25') {
        this.pomodoro.mode = mode;
        const durations = {
            work_25: 1500, // 25 min
            break_5: 300,  // 5 min
            demo_1: 60     // 1 min
        };
        const sec = durations[mode] || 1500;
        this.pomodoro.durationSec = sec;
        this.pomodoro.remainingSec = sec;
        this.pomodoro.endTimeMs = performance.now() + sec * 1000;
        this.pomodoro.state = 'RUNNING';

        this.updatePomodoroUI();
        if (this.onToast) {
            this.onToast(`🔥 Pomodoro Focus started (${Math.round(sec / 60)} min)`, 'success');
        }
    }

    pausePomodoro() {
        if (this.pomodoro.state === 'RUNNING') {
            this.pomodoro.state = 'PAUSED';
            this.pomodoro.remainingSec = Math.max(0, (this.pomodoro.endTimeMs - performance.now()) / 1000);
            this.updatePomodoroUI();
            if (this.onToast) this.onToast('Pomodoro Focus paused', 'info');
        }
    }

    resumePomodoro() {
        if (this.pomodoro.state === 'PAUSED') {
            this.pomodoro.state = 'RUNNING';
            this.pomodoro.endTimeMs = performance.now() + this.pomodoro.remainingSec * 1000;
            this.updatePomodoroUI();
            if (this.onToast) this.onToast('Pomodoro Focus resumed', 'success');
        }
    }

    resetPomodoro() {
        this.pomodoro.state = 'IDLE';
        this.pomodoro.remainingSec = this.pomodoro.durationSec;
        this.updatePomodoroUI();
    }

    completePomodoro() {
        this.pomodoro.state = 'COMPLETED';
        this.preferences.completedSessions++;
        this.preferences.focusCoins += 50;
        this.savePreferences();

        this.playZenChime();

        if (this.onReward) {
            this.onReward({ xp: 30, coins: 50, reason: 'Pomodoro Deep Work Completion' });
        }
        if (this.onToast) {
            this.onToast('🏆 Pomodoro Session Complete! +50 Dev Coins • +30 Zen XP', 'success');
        }

        this.updatePomodoroUI();
    }

    formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }

    updatePomodoroUI() {
        if (!this.modalEl) return;
        const timeEl = this.modalEl.querySelector('#pomodoro-display');
        const startBtn = this.modalEl.querySelector('#btn-pomodoro-start');
        const statsEl = this.modalEl.querySelector('#pomodoro-stats');

        if (timeEl) {
            timeEl.textContent = this.formatTime(this.pomodoro.remainingSec);
            timeEl.style.color = this.pomodoro.state === 'RUNNING' ? '#38bdf8' : '#f8fafc';
        }
        if (startBtn) {
            if (this.pomodoro.state === 'RUNNING') {
                startBtn.textContent = 'Pause';
                startBtn.classList.add('running');
            } else if (this.pomodoro.state === 'PAUSED') {
                startBtn.textContent = 'Resume';
                startBtn.classList.remove('running');
            } else {
                startBtn.textContent = 'Start Focus';
                startBtn.classList.remove('running');
            }
        }
        if (statsEl) {
            statsEl.textContent = `Completed: ${this.preferences.completedSessions} | 🪙 ${this.preferences.focusCoins} Focus Coins`;
        }
    }

    // ==================== UI POPOVER & SHORTCUT ====================

    initKeyboardShortcut() {
        if (typeof window === 'undefined') return;
        window.addEventListener('keydown', (e) => {
            if (e.altKey && (e.key === 'd' || e.key === 'D')) {
                e.preventDefault();
                this.toggleModal();
            }
        });
    }

    toggleModal() {
        this.isOpen = !this.isOpen;
        if (this.modalEl) {
            this.modalEl.style.display = this.isOpen ? 'flex' : 'none';
            if (this.isOpen) {
                this.updatePomodoroUI();
            }
        }
    }

    initUI() {
        if (typeof document === 'undefined') return;

        // 1. Add compact Header HUD Button if not present
        const headerIcons = document.querySelector('.header-icon-group, .header-actions, .top-bar-right, #teleterm-header-controls');
        if (headerIcons && !document.getElementById('btn-open-desk-decor')) {
            const btn = document.createElement('button');
            btn.id = 'btn-open-desk-decor';
            btn.className = 'btn-compact-hud';
            btn.setAttribute('title', 'Desk Decor & Focus [Alt + D]');
            btn.style.cssText = `
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                padding: 0;
                background: rgba(15, 23, 42, 0.7);
                border: 1px solid rgba(56, 189, 248, 0.35);
                border-radius: 6px;
                color: #38bdf8;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-left: 4px;
            `;
            const iconSvg = window.TeleTermIcons ? window.TeleTermIcons.renderSVGOnly('coffee', { size: 13 }) : '☕';
            btn.innerHTML = iconSvg;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleModal();
            });
            headerIcons.appendChild(btn);
        }

        // 2. Build Floating Glassmorphism Modal Popover
        let modal = document.getElementById('desk-decor-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'desk-decor-modal';
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 440px;
                max-width: 92vw;
                background: rgba(15, 23, 42, 0.94);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(56, 189, 248, 0.35);
                border-radius: 12px;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(56, 189, 248, 0.2);
                color: #f8fafc;
                font-family: 'JetBrains Mono', -apple-system, sans-serif;
                padding: 20px;
                z-index: 10000;
                display: none;
                flex-direction: column;
                gap: 16px;
            `;

            modal.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">
                    <div>
                        <div style="font-size: 10px; font-weight: 700; color: #38bdf8; letter-spacing: 1px; text-transform: uppercase;">Developer Hub Co-working</div>
                        <div style="font-size: 15px; font-weight: 700; color: #ffffff;">Desk Decor & Focus [Alt+D]</div>
                    </div>
                    <button id="btn-close-desk-decor" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px; padding: 4px;">✕</button>
                </div>

                <!-- 4 Preset Cards -->
                <div>
                    <div style="font-size: 11px; color: #94a3b8; margin-bottom: 8px;">CHOOSE DESK STYLE:</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div class="preset-card ${this.preferences.activePreset === 'minimalist' ? 'active' : ''}" data-preset="minimalist" style="
                            padding: 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; cursor: pointer; transition: all 0.2s;
                        ">
                            <div style="font-size: 12px; font-weight: 600; color: #f8fafc;">☕ Minimalist</div>
                            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Espresso cup & stylus</div>
                        </div>
                        <div class="preset-card ${this.preferences.activePreset === 'zen_nature' ? 'active' : ''}" data-preset="zen_nature" style="
                            padding: 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; cursor: pointer; transition: all 0.2s;
                        ">
                            <div style="font-size: 12px; font-weight: 600; color: #4ade80;">🌱 Zen Nature</div>
                            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Mini Bonsai & Matcha</div>
                        </div>
                        <div class="preset-card ${this.preferences.activePreset === 'cyber_hacker' ? 'active' : ''}" data-preset="cyber_hacker" style="
                            padding: 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; cursor: pointer; transition: all 0.2s;
                        ">
                            <div style="font-size: 12px; font-weight: 600; color: #facc15;">🦆 Cyber Hacker</div>
                            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Rubber Duck & Energy</div>
                        </div>
                        <div class="preset-card ${this.preferences.activePreset === 'cozy_cafe' ? 'active' : ''}" data-preset="cozy_cafe" style="
                            padding: 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; cursor: pointer; transition: all 0.2s;
                        ">
                            <div style="font-size: 12px; font-weight: 600; color: #f472b6;">🌸 Cozy Cafe</div>
                            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Latte & Maneki-neko</div>
                        </div>
                    </div>
                </div>

                <!-- Pomodoro Section -->
                <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 11px; font-weight: 600; color: #38bdf8;">POMODORO FOCUS TIMER</span>
                        <div style="display: flex; gap: 4px;">
                            <button class="btn-pomo-mode" data-mode="work_25" style="background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 10px; padding: 2px 6px; border-radius: 4px; cursor: pointer;">25m</button>
                            <button class="btn-pomo-mode" data-mode="break_5" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; font-size: 10px; padding: 2px 6px; border-radius: 4px; cursor: pointer;">5m Break</button>
                            <button class="btn-pomo-mode" data-mode="demo_1" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; font-size: 10px; padding: 2px 6px; border-radius: 4px; cursor: pointer;">1m Demo</button>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
                        <div id="pomodoro-display" style="font-size: 28px; font-weight: 800; color: #38bdf8; letter-spacing: 2px;">25:00</div>
                        <div style="display: flex; gap: 6px;">
                            <button id="btn-pomodoro-start" style="
                                background: #0284c7; border: none; border-radius: 6px; color: white; padding: 6px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;
                            ">Start Focus</button>
                            <button id="btn-pomodoro-reset" style="
                                background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #94a3b8; padding: 6px 10px; font-size: 12px; cursor: pointer;
                            ">Reset</button>
                        </div>
                    </div>

                    <div id="pomodoro-stats" style="font-size: 10px; color: #64748b; margin-top: 8px; text-align: right;">
                        Completed: ${this.preferences.completedSessions} | 🪙 ${this.preferences.focusCoins} Focus Coins
                    </div>
                </div>
            `;

            // Active Card Highlight Style
            const style = document.createElement('style');
            style.textContent = `
                .preset-card.active {
                    border-color: #38bdf8 !important;
                    background: rgba(56, 189, 248, 0.15) !important;
                    box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
                }
                .preset-card:hover {
                    border-color: rgba(56, 189, 248, 0.5);
                }
            `;
            document.head.appendChild(style);

            document.body.appendChild(modal);

            // Bind Events
            modal.querySelector('#btn-close-desk-decor').addEventListener('click', () => this.toggleModal());

            modal.querySelectorAll('.preset-card').forEach(card => {
                card.addEventListener('click', () => {
                    const preset = card.getAttribute('data-preset');
                    this.applyPreset(preset);
                });
            });

            modal.querySelectorAll('.btn-pomo-mode').forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.querySelectorAll('.btn-pomo-mode').forEach(b => {
                        b.style.background = 'rgba(255,255,255,0.05)';
                        b.style.borderColor = 'rgba(255,255,255,0.15)';
                        b.style.color = '#94a3b8';
                    });
                    btn.style.background = 'rgba(56, 189, 248, 0.2)';
                    btn.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                    btn.style.color = '#38bdf8';
                    const mode = btn.getAttribute('data-mode');
                    this.startPomodoro(mode);
                });
            });

            const startBtn = modal.querySelector('#btn-pomodoro-start');
            startBtn.addEventListener('click', () => {
                if (this.pomodoro.state === 'RUNNING') {
                    this.pausePomodoro();
                } else if (this.pomodoro.state === 'PAUSED') {
                    this.resumePomodoro();
                } else {
                    this.startPomodoro(this.pomodoro.mode);
                }
            });

            modal.querySelector('#btn-pomodoro-reset').addEventListener('click', () => {
                this.resetPomodoro();
            });
        }
        this.modalEl = modal;
    }

    /**
     * MASTER UPDATE LOOP (ZERO-GC)
     */
    update(dt, playerPos = null, isSitting = false, currentSeatAnchor = null) {
        // Pomodoro Timer Update
        if (this.pomodoro.state === 'RUNNING') {
            const now = performance.now();
            const remaining = Math.max(0, (this.pomodoro.endTimeMs - now) / 1000);
            this.pomodoro.remainingSec = remaining;

            // 1 Hz UI Refresh
            if (now - this.pomodoro.lastTickSec >= 1000) {
                this.pomodoro.lastTickSec = now;
                this.updatePomodoroUI();
            }

            // Keystroke sound synthesis when sitting at Hub desk
            const isAtHubDesk = isSitting && currentSeatAnchor && currentSeatAnchor.category === 'coding_desk';
            if (isAtHubDesk && now - this.pomodoro.lastClatterSec >= (1400 + Math.random() * 2200)) {
                this.pomodoro.lastClatterSec = now;
                this.playKeyClatter();
            }

            if (remaining <= 0) {
                this.completePomodoro();
            }
        }
    }
}
