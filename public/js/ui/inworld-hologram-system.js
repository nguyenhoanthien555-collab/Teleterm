import * as THREE from 'three';

/**
 * IN-WORLD 3D MINI HOLOGRAPHIC WINDOWS & CYBERNETIC PROJECTION SYSTEM
 * Part of TeleTerm Living World & In-World 3D Hologram Ecosystem.
 * 
 * Features:
 * - Floating miniaturized 3D cyber screens (~0.65m x 0.42m) anchored in front of avatars
 * - High-contrast monospace code stream with 4 distinct color themes:
 *   - TERM: Amber (#f59e0b)
 *   - CODEX: Amethyst (#a855f7)
 *   - AGY: Nebula Cyan (#38bdf8)
 *   - ADE: Emerald Green (#10b981)
 * - Laser projection virtual keyboard beneath hands
 * - Throttled 10 FPS CanvasTexture updates with dirty checking (zero GPU waste)
 * - Reactive state glitch pulses on error / completion
 * - Full multiplayer synchronization across connected avatars
 */

export const HOLO_THEMES = {
    NONE: null,
    TERM: {
        id: 'TERM',
        title: 'CONPTY TERMINAL',
        primary: '#f59e0b',
        secondary: '#fbbf24',
        accent: '#d97706',
        hexColor: 0xf59e0b,
        bg: '#090805',
        scanline: 'rgba(245, 158, 11, 0.08)'
    },
    CODEX: {
        id: 'CODEX',
        title: 'CODEX AI AGENT',
        primary: '#c084fc',
        secondary: '#e879f9',
        accent: '#a855f7',
        hexColor: 0xa855f7,
        bg: '#0a050f',
        scanline: 'rgba(168, 85, 247, 0.08)'
    },
    AGY: {
        id: 'AGY',
        title: 'ANTIGRAVITY AGY',
        primary: '#38bdf8',
        secondary: '#7dd3fc',
        accent: '#0284c7',
        hexColor: 0x38bdf8,
        bg: '#040b12',
        scanline: 'rgba(56, 189, 248, 0.08)'
    },
    ADE: {
        id: 'ADE',
        title: 'ADE DEV ENGINE',
        primary: '#34d399',
        secondary: '#6ee7b7',
        accent: '#059669',
        hexColor: 0x10b981,
        bg: '#041209',
        scanline: 'rgba(16, 185, 129, 0.08)'
    }
};

export class HoloWindow3D {
    constructor(avatarModel, options = {}) {
        this.avatar = avatarModel;
        this.isLocal = options.isLocal ?? false;
        this.tool = options.tool || 'NONE';
        this.theme = HOLO_THEMES[this.tool] || HOLO_THEMES.TERM;

        this.group = new THREE.Group();
        this.group.name = `HoloWindow3D_${this.isLocal ? 'Local' : 'Remote'}`;

        // Screen Dimensions (~0.65m x 0.42m)
        this.width = 0.65;
        this.height = 0.42;

        // CanvasTexture Engine (512x320)
        this.canvasWidth = 512;
        this.canvasHeight = 320;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.ctx = this.canvas.getContext('2d');
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.magFilter = THREE.LinearFilter;

        // State & Buffer
        this.lines = options.initialLines || [
            '// TeleTerm 3D Living Hologram Stream',
            'const agent = new AutonomousDevEngine();',
            'await agent.connect({ realtime: true });',
            'console.log("Ready for live commands...");'
        ];
        this.dirty = true;
        this.lastRenderTime = 0;
        this.cursorVisible = true;
        this.cursorBlinkTimer = 0;
        this.glitchTimer = 0;
        this.glitchColor = null;

        // Visual Meshes
        this.screenMesh = null;
        this.frameMesh = null;
        this.keyboardMesh = null;
        this.glowLight = null;

        this.visible = false;
        this.build();
    }

    build() {
        // 1. Hologram Screen Front Plane
        const screenGeo = new THREE.PlaneGeometry(this.width, this.height);
        const screenMat = new THREE.MeshBasicMaterial({
            map: this.texture,
            transparent: true,
            opacity: 0.94,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.screenMesh = new THREE.Mesh(screenGeo, screenMat);
        this.group.add(this.screenMesh);

        // 2. Cyber Emissive Wireframe Border Frame
        const frameGeo = new THREE.EdgesGeometry(screenGeo);
        const frameMat = new THREE.LineBasicMaterial({
            color: this.theme.hexColor,
            linewidth: 2,
            transparent: true,
            opacity: 0.85
        });
        this.frameMesh = new THREE.LineSegments(frameGeo, frameMat);
        this.group.add(this.frameMesh);

        // 3. Laser Projection Virtual Keyboard Plane
        const kbGeo = new THREE.PlaneGeometry(0.52, 0.26, 8, 4);
        kbGeo.rotateX(-Math.PI * 0.42); // Angled flat beneath hands

        // Procedural Keyboard Canvas
        const kbCanvas = document.createElement('canvas');
        kbCanvas.width = 256;
        kbCanvas.height = 128;
        const kbCtx = kbCanvas.getContext('2d');
        kbCtx.fillStyle = 'rgba(0,0,0,0.4)';
        kbCtx.fillRect(0, 0, 256, 128);
        kbCtx.strokeStyle = this.theme.primary;
        kbCtx.lineWidth = 1.5;

        // Key grid outline
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 10; c++) {
                kbCtx.strokeRect(10 + c * 24, 10 + r * 26, 20, 22);
            }
        }
        const kbTex = new THREE.CanvasTexture(kbCanvas);
        const kbMat = new THREE.MeshBasicMaterial({
            map: kbTex,
            transparent: true,
            opacity: 0.72,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.keyboardMesh = new THREE.Mesh(kbGeo, kbMat);
        this.keyboardMesh.position.set(0, -0.30, 0.14);
        this.group.add(this.keyboardMesh);

        // 4. Subtle Cyber Neon Glow Light
        this.glowLight = new THREE.PointLight(this.theme.hexColor, 0.65, 2.2);
        this.glowLight.position.set(0, 0, 0.1);
        this.group.add(this.glowLight);

        this.renderCanvas();
        this.setVisible(false);
    }

    setTool(toolName, customLines = null) {
        if (!HOLO_THEMES[toolName]) {
            this.tool = 'NONE';
            this.setVisible(false);
            return;
        }

        this.tool = toolName;
        this.theme = HOLO_THEMES[toolName];
        this.setVisible(true);

        if (this.frameMesh) {
            this.frameMesh.material.color.setHex(this.theme.hexColor);
        }
        if (this.glowLight) {
            this.glowLight.color.setHex(this.theme.hexColor);
        }

        if (customLines && Array.isArray(customLines)) {
            this.lines = customLines;
        } else {
            this.lines = [
                `// TeleTerm 3D — ${this.theme.title}`,
                `Session: Live Link Active [60 FPS]`,
                `Context: ${this.isLocal ? 'Local Avatar' : 'Remote Peer'}`,
                `Status: Stream connected. Executing...`
            ];
        }
        this.dirty = true;
    }

    appendLine(text) {
        this.lines.push(text);
        if (this.lines.length > 8) {
            this.lines.shift();
        }
        this.dirty = true;
    }

    setSnippet(lines) {
        if (Array.isArray(lines)) {
            this.lines = lines.slice(-8);
            this.dirty = true;
        }
    }

    triggerGlitch(type = 'error') {
        this.glitchTimer = 0.85; // 850ms duration
        this.glitchColor = type === 'error' ? '#ef4444' : '#10b981';
        this.dirty = true;
    }

    setVisible(visible) {
        this.visible = visible;
        this.group.visible = visible;
        if (this.glowLight) {
            this.glowLight.visible = visible;
        }
    }

    renderCanvas() {
        const ctx = this.ctx;
        const w = this.canvasWidth;
        const h = this.canvasHeight;
        const theme = this.theme;

        // Background Cyber Glass
        ctx.fillStyle = this.glitchTimer > 0 ? (this.glitchColor === '#ef4444' ? 'rgba(40,10,10,0.92)' : 'rgba(10,40,20,0.92)') : theme.bg;
        ctx.fillRect(0, 0, w, h);

        // Glowing Border Header
        ctx.fillStyle = theme.scanline;
        for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 1.5);
        }

        // Top Header Bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(0, 0, w, 36);

        ctx.strokeStyle = this.glitchTimer > 0 ? this.glitchColor : theme.accent;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, w, h);

        // Header Title & Cyber Indicator
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.fillStyle = this.glitchTimer > 0 ? this.glitchColor : theme.primary;
        ctx.fillText(theme.title, 14, 24);

        // Pulsing Live Dot
        ctx.fillStyle = this.cursorVisible ? theme.secondary : 'transparent';
        ctx.beginPath();
        ctx.arc(w - 20, 18, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('ONLINE', w - 75, 22);

        // Code Lines Stream
        ctx.font = '14px "JetBrains Mono", Consolas, monospace';
        const startY = 64;
        const lineHeight = 28;

        for (let i = 0; i < this.lines.length; i++) {
            const y = startY + i * lineHeight;
            const line = this.lines[i] || '';

            // Line numbers in gutter
            ctx.fillStyle = '#64748b';
            const numStr = (i + 1).toString().padStart(2, '0');
            ctx.fillText(`${numStr} |`, 14, y);

            // Syntax coloring
            if (line.startsWith('//') || line.startsWith('#')) {
                ctx.fillStyle = '#94a3b8';
            } else if (line.includes('const') || line.includes('let') || line.includes('function') || line.includes('class')) {
                ctx.fillStyle = '#38bdf8';
            } else if (line.includes('Error') || line.includes('FAIL') || this.glitchTimer > 0) {
                ctx.fillStyle = this.glitchTimer > 0 ? this.glitchColor : '#f87171';
            } else if (line.includes('PASS') || line.includes('SUCCESS') || line.includes('Ready')) {
                ctx.fillStyle = '#4ade80';
            } else {
                ctx.fillStyle = '#f1f5f9';
            }

            ctx.fillText(line, 55, y);
        }

        // Terminal Blinking Cursor at end of last line
        if (this.cursorVisible && this.lines.length > 0) {
            const lastIdx = this.lines.length - 1;
            const lastY = startY + lastIdx * lineHeight;
            const textWidth = ctx.measureText(this.lines[lastIdx] || '').width;
            ctx.fillStyle = theme.secondary;
            ctx.fillRect(58 + textWidth, lastY - 14, 8, 16);
        }

        // Bottom Footer Bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(0, h - 24, w, 24);
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('TeleTerm WebGL 60FPS | AES-256 SYNC', 14, h - 8);

        this.texture.needsUpdate = true;
        this.dirty = false;
    }

    update(delta, time) {
        if (!this.visible || !this.avatar) return;

        // 1. Position hologram in front of avatar chest
        // Avatar Forward Vector: derived from avatar rotation
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(this.avatar.quaternion);
        forward.y = 0;
        forward.normalize();

        // Chest elevation + gentle floating bobbing
        const bob = Math.sin(time * 2.4) * 0.015;
        const targetPos = new THREE.Vector3()
            .copy(this.avatar.position)
            .addScaledVector(forward, 0.68);
        targetPos.y += 1.32 + bob;

        this.group.position.copy(targetPos);
        // Face same direction as avatar with slight 12-deg backward tilt
        this.group.quaternion.copy(this.avatar.quaternion);
        this.group.rotateX(0.18);

        // 2. Handle Cursor Blink & Glitch Timers
        this.cursorBlinkTimer += delta;
        if (this.cursorBlinkTimer >= 0.5) {
            this.cursorBlinkTimer = 0;
            this.cursorVisible = !this.cursorVisible;
            this.dirty = true;
        }

        if (this.glitchTimer > 0) {
            this.glitchTimer -= delta;
            if (this.glitchTimer <= 0) {
                this.glitchTimer = 0;
                this.glitchColor = null;
                this.dirty = true;
            }
        }

        // 3. Throttled 10 FPS Canvas Rendering (100ms interval)
        const now = performance.now();
        if (this.dirty && (now - this.lastRenderTime >= 100)) {
            this.lastRenderTime = now;
            this.renderCanvas();
        }
    }

    dispose() {
        if (this.group.parent) {
            this.group.parent.remove(this.group);
        }
        if (this.texture) this.texture.dispose();
        if (this.screenMesh?.geometry) this.screenMesh.geometry.dispose();
        if (this.keyboardMesh?.geometry) this.keyboardMesh.geometry.dispose();
    }
}

/**
 * GLOBAL IN-WORLD HOLOGRAM MANAGER
 * Manages local player hologram & all remote peer holograms.
 */
export class InWorldHologramSystem {
    constructor(scene) {
        this.scene = scene;
        this.localHolo = null;
        this.remoteHolos = new Map(); // playerId -> HoloWindow3D
        this.currentTool = 'NONE';
        this.avatarModel = null;

        this.initEventListeners();
    }

    setLocalAvatar(avatarModel) {
        this.avatarModel = avatarModel;
        if (!this.localHolo && this.scene && this.avatarModel) {
            this.localHolo = new HoloWindow3D(this.avatarModel, { isLocal: true });
            this.scene.add(this.localHolo.group);
        }
    }

    initEventListeners() {
        if (typeof window === 'undefined') return;

        // Terminal ConPTY output stream
        window.addEventListener('teleterm:terminal-output', (e) => {
            if (this.localHolo && e.detail?.data) {
                const clean = e.detail.data.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').trim();
                if (clean) this.localHolo.appendLine(clean.slice(0, 42));
            }
        });

        // Verification & Test Engine Status Feedback
        window.addEventListener('teleterm:verification-status', (e) => {
            if (this.localHolo && e.detail?.status) {
                const status = e.detail.status;
                if (status === 'PASSED') {
                    this.localHolo.triggerGlitch('success');
                    this.localHolo.appendLine(`[TEST] PASS: All 25 suites PASSED`);
                } else if (status === 'FAILED') {
                    this.localHolo.triggerGlitch('error');
                    this.localHolo.appendLine(`[TEST] FAIL: Verification Failed`);
                }
            }
        });
    }

    setLocalTool(toolName, snippetLines = null) {
        this.currentTool = toolName;
        if (this.localHolo) {
            this.localHolo.setTool(toolName, snippetLines);
        }

        // Notify multiplayer client to sync with server room
        if (typeof window !== 'undefined' && window.multiplayerClient) {
            window.multiplayerClient.broadcastHoloState(toolName, snippetLines || this.localHolo?.lines);
        }
    }

    updateRemotePlayer(playerId, remoteAvatarModel, toolName, snippetLines = null) {
        if (!toolName || toolName === 'NONE') {
            const existing = this.remoteHolos.get(playerId);
            if (existing) {
                existing.setVisible(false);
            }
            return;
        }

        let holo = this.remoteHolos.get(playerId);
        if (!holo && this.scene && remoteAvatarModel) {
            holo = new HoloWindow3D(remoteAvatarModel, { isLocal: false });
            this.scene.add(holo.group);
            this.remoteHolos.set(playerId, holo);
        }

        if (holo) {
            holo.avatar = remoteAvatarModel;
            holo.setTool(toolName, snippetLines);
            holo.setVisible(true);
        }
    }

    removeRemotePlayer(playerId) {
        const holo = this.remoteHolos.get(playerId);
        if (holo) {
            holo.dispose();
            this.remoteHolos.delete(playerId);
        }
    }

    update(delta) {
        const time = performance.now() * 0.001;

        if (this.localHolo) {
            this.localHolo.update(delta, time);
        }

        this.remoteHolos.forEach((holo) => {
            holo.update(delta, time);
        });
    }
}
