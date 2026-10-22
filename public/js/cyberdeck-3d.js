/**
 * TELETERM 3D HOLOGRAPHIC CYBERDECK ENGINE
 * Three.js WebGL (Background Cyber Universe & Quantum Core) + CSS3DRenderer (Crystal-Clear Interactive Terminal & HUDs)
 */

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

export class CyberDeck3D {
    constructor() {
        this.webglCanvas = document.getElementById('webgl-bg-canvas');
        this.cssViewport = document.getElementById('css3d-viewport');

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.isMobile = this.width <= 768;

        // Dual scenes & camera
        this.camera = null;
        this.webglScene = null;
        this.cssScene = null;
        this.webglRenderer = null;
        this.cssRenderer = null;

        // 3D Objects
        this.terminal3DObj = null;
        this.hudLeft3DObj = null;
        this.hudRight3DObj = null;
        this.quantumCore = null;
        this.coreRings = [];
        this.starfield = null;
        this.cyberGrid = null;

        // Camera States: 'focus' (flat 2D reading/typing) vs 'orbit' (cyber 3D perspective)
        this.mode = this.isMobile ? 'focus' : 'orbit';
        
        // Target Camera Coordinates for smooth LERP
        this.camCurrent = { x: 0, y: 0, z: 1000, rx: 0, ry: 0 };
        this.camTarget = { x: 0, y: 0, z: 1000, rx: 0, ry: 0 };
        
        // User Orbit Interaction (Touch / Mouse)
        this.orbit = {
            isPointerDown: false,
            startX: 0,
            startY: 0,
            rotX: 0,
            rotY: 0,
            targetRotX: 0,
            targetRotY: 0,
            zoom: 1
        };

        // Telemetry state for reactive visuals
        this.metrics = { cpu: 15, ram: 40 };

        this.clock = new THREE.Clock();
        this.animId = null;

        this.init();
    }

    init() {
        // 1. Camera
        const fov = 50;
        const aspect = this.width / this.height;
        this.camera = new THREE.PerspectiveCamera(fov, aspect, 1, 5000);
        this.updateCameraTargets();
        this.camCurrent = { ...this.camTarget };
        this.applyCameraPosition();

        // 2. WebGL Scene & Renderer
        this.webglScene = new THREE.Scene();
        this.webglScene.fog = new THREE.FogExp2(0x04060a, 0.0008);

        this.webglRenderer = new THREE.WebGLRenderer({
            canvas: this.webglCanvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.webglRenderer.setSize(this.width, this.height);
        this.webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 3. CSS3D Scene & Renderer
        this.cssScene = new THREE.Scene();
        this.cssRenderer = new CSS3DRenderer();
        this.cssRenderer.setSize(this.width, this.height);
        this.cssRenderer.domElement.style.position = 'absolute';
        this.cssRenderer.domElement.style.top = '0';
        this.cssRenderer.domElement.style.left = '0';
        this.cssRenderer.domElement.style.width = '100%';
        this.cssRenderer.domElement.style.height = '100%';
        this.cssViewport.appendChild(this.cssRenderer.domElement);

        // 4. Build 3D Environments
        this.buildCyberGrid();
        this.buildStarfield();
        this.buildQuantumCore();
        this.buildHoloTerminalStream();
        this.setupCSS3DObjects();

        // 5. Setup Event Listeners
        this.setupInteractionListeners();
        window.addEventListener('resize', () => this.handleResize());

        // 6. Start Loop
        this.animate();
    }

    updateCameraTargets() {
        // Exact trigonometric distance where 1 CSS pixel = 1 unit in 3D (100% native text sharpness)
        const halfFovRad = THREE.MathUtils.degToRad(this.camera.fov / 2);
        const distance1to1 = (this.height / 2) / Math.tan(halfFovRad);

        if (this.mode === 'focus') {
            // Flat, perpendicular, zero distortion for crystal-clear typing
            this.camTarget = { x: 0, y: 0, z: distance1to1, rx: 0, ry: 0 };
        } else {
            // 3D Cyber Orbital View (tilted perspective showing HUDs and Quantum Core)
            const baseZ = this.isMobile ? distance1to1 * 1.05 : distance1to1 * 1.12;
            this.camTarget = {
                x: 0,
                y: this.isMobile ? 15 : 30,
                z: baseZ * this.orbit.zoom,
                rx: this.orbit.targetRotX,
                ry: this.orbit.targetRotY
            };
        }
    }

    applyCameraPosition() {
        this.camera.position.set(this.camCurrent.x, this.camCurrent.y, this.camCurrent.z);
        this.camera.rotation.x = this.camCurrent.rx;
        this.camera.rotation.y = this.camCurrent.ry;
        this.camera.rotation.z = 0;
    }

    setupCSS3DObjects() {
        // Terminal screen DOM
        const termEl = document.getElementById('deck-terminal-screen');
        if (termEl) {
            this.terminal3DObj = new CSS3DObject(termEl);
            this.terminal3DObj.position.set(0, 0, 0);
            this.cssScene.add(this.terminal3DObj);
        }

        // Left HUD: Hardware Telemetry
        const hudLeftEl = document.getElementById('hud-hardware-deck');
        if (hudLeftEl && !this.isMobile) {
            this.hudLeft3DObj = new CSS3DObject(hudLeftEl);
            this.hudLeft3DObj.position.set(-660, 0, 80);
            this.hudLeft3DObj.rotation.y = THREE.MathUtils.degToRad(22);
            this.cssScene.add(this.hudLeft3DObj);
        }

        // Right HUD: Sessions & Tools
        const hudRightEl = document.getElementById('hud-sessions-deck');
        if (hudRightEl && !this.isMobile) {
            this.hudRight3DObj = new CSS3DObject(hudRightEl);
            this.hudRight3DObj.position.set(660, 0, 80);
            this.hudRight3DObj.rotation.y = THREE.MathUtils.degToRad(-22);
            this.cssScene.add(this.hudRight3DObj);
        }
    }

    buildCyberGrid() {
        // Perspective Floor Grid
        const gridHelper = new THREE.GridHelper(3000, 60, 0x00f0ff, 0x142036);
        gridHelper.position.y = -420;
        gridHelper.material.opacity = 0.28;
        gridHelper.material.transparent = true;
        this.webglScene.add(gridHelper);
        this.cyberGrid = gridHelper;

        // Ceiling grid for depth tunnel effect
        const ceilGrid = new THREE.GridHelper(3000, 60, 0x8b5cf6, 0x0d1527);
        ceilGrid.position.y = 480;
        ceilGrid.material.opacity = 0.16;
        ceilGrid.material.transparent = true;
        this.webglScene.add(ceilGrid);
    }

    buildStarfield() {
        const particleCount = 650;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const color1 = new THREE.Color(0x00f0ff);
        const color2 = new THREE.Color(0x8b5cf6);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2600;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1600;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2000 - 300;

            const mixedColor = color1.clone().lerp(color2, Math.random());
            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 3.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending
        });

        this.starfield = new THREE.Points(geometry, material);
        this.webglScene.add(this.starfield);
    }

    buildQuantumCore() {
        // Floating 3D Quantum Core behind the terminal screen
        const coreGroup = new THREE.Group();
        coreGroup.position.set(0, 0, -260);

        // Inner glowing polyhedron
        const coreGeo = new THREE.IcosahedronGeometry(70, 1);
        const coreMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            wireframe: true,
            transparent: true,
            opacity: 0.35
        });
        const innerMesh = new THREE.Mesh(coreGeo, coreMat);
        coreGroup.add(innerMesh);

        // Holographic Gimbal Rings
        const ringRadii = [110, 135, 160];
        const ringColors = [0x00f0ff, 0x8b5cf6, 0x10b981];

        this.coreRings = [];
        ringRadii.forEach((r, idx) => {
            const ringGeo = new THREE.TorusGeometry(r, 1.2, 8, 80);
            const ringMat = new THREE.MeshBasicMaterial({
                color: ringColors[idx],
                transparent: true,
                opacity: 0.45
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / (idx + 2);
            ring.rotation.y = Math.PI / (idx + 3);
            coreGroup.add(ring);
            this.coreRings.push(ring);
        });

        this.quantumCore = coreGroup;
        this.webglScene.add(coreGroup);
    }

    buildHoloTerminalStream() {
        const w = 512;
        const h = 256;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        this.holoCanvas = canvas;
        this.holoCtx = ctx;
        this.holoTexture = texture;
        this.streamLines = [
            '// TELETERM 3D CYBERDECK HUD',
            '=====================================',
            'CORE: Quantum Entanglement v4.5',
            'PTY STREAM: ConPTY Online [60 FPS]',
            'STATUS: Ready for active stream...',
            '-------------------------------------'
        ];
        this.streamDirty = true;

        const screenGeo = new THREE.PlaneGeometry(360, 180);
        const screenMat = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.92,
            side: THREE.DoubleSide
        });
        const screenMesh = new THREE.Mesh(screenGeo, screenMat);
        screenMesh.position.set(0, 310, -180);
        screenMesh.rotation.x = 0.15;
        this.webglScene.add(screenMesh);
        this.holoStreamMesh = screenMesh;

        if (typeof window !== 'undefined') {
            window.addEventListener('teleterm:terminal-output', (e) => {
                if (e.detail?.data) this.streamTerminalOutput(e.detail.data);
            });
            window.addEventListener('teleterm:verification-status', (e) => {
                if (e.detail?.status) {
                    this.streamTerminalOutput(`[TEST] Status: ${e.detail.status}`);
                }
            });
        }

        this.lastStreamRenderTime = 0;
        this.renderHoloScreen(0);
    }

    stripAnsi(text) {
        if (!text) return '';
        return text
            .replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\|[\n\r])/g, '') // OSC
            .replace(/\x1b\[[0-9;?<=>]*[a-zA-Z~]/g, '')             // CSI
            .replace(/\x1b[()][AB012]/g, '')                         // Character sets
            .replace(/\x1b[@-Z\\-_]/g, '')                           // 2-character escapes
            .replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]/g, '')       // C0 control codes
            .replace(/\r/g, '');
    }

    streamTerminalOutput(text) {
        if (!text) return;
        const clean = this.stripAnsi(text);
        const lines = clean.split('\n').map(l => l.trimEnd()).filter(l => l.length > 0);
        for (const line of lines) {
            this.streamLines.push(line.length > 42 ? line.slice(0, 42) + '…' : line);
        }
        while (this.streamLines.length > 10) {
            this.streamLines.shift();
        }
        this.streamDirty = true;
    }

    renderHoloScreen(time) {
        if (!this.holoCtx) return;
        const ctx = this.holoCtx;
        const w = 512;
        const h = 256;

        ctx.fillStyle = '#040714';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = 'rgba(0, 240, 255, 0.05)';
        for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 1);
        }

        ctx.fillStyle = '#091326';
        ctx.fillRect(0, 0, w, 26);
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(0, 25, w, 1);

        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(14, 13, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 12px "JetBrains Mono", Consolas, monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('CYBERDECK STREAM HUD', 24, 17);

        ctx.font = '11px "JetBrains Mono", Consolas, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`CPU: ${this.metrics.cpu}% | RAM: ${this.metrics.ram}%`, w - 170, 17);

        ctx.font = '13px "JetBrains Mono", Consolas, monospace';
        const startY = 48;
        const lineHeight = 19;

        for (let i = 0; i < this.streamLines.length; i++) {
            const line = this.streamLines[i];
            const y = startY + i * lineHeight;

            if (line.includes('PASS') || line.includes('[OK]')) {
                ctx.fillStyle = '#34d399';
            } else if (line.includes('FAIL') || line.includes('Error')) {
                ctx.fillStyle = '#f43f5e';
            } else if (line.startsWith('$') || line.startsWith('>')) {
                ctx.fillStyle = '#38bdf8';
            } else {
                ctx.fillStyle = '#cbd5e1';
            }

            ctx.fillText(line, 14, y);
        }
    }

    setupInteractionListeners() {
        // Drag / Swipe on viewport to smoothly orbit 3D space when in Orbit mode
        const el = this.cssViewport;

        const onPointerDown = (e) => {
            // Only orbit if clicking outside interactive terminal inputs/buttons
            if (e.target.closest('#terminal-mount') || e.target.closest('button') || e.target.closest('input')) {
                return;
            }
            this.orbit.isPointerDown = true;
            this.orbit.startX = e.clientX || (e.touches && e.touches[0].clientX);
            this.orbit.startY = e.clientY || (e.touches && e.touches[0].clientY);
        };

        const onPointerMove = (e) => {
            if (!this.orbit.isPointerDown || this.mode === 'focus') return;
            const currentX = e.clientX || (e.touches && e.touches[0].clientX);
            const currentY = e.clientY || (e.touches && e.touches[0].clientY);
            const dx = currentX - this.orbit.startX;
            const dy = currentY - this.orbit.startY;

            // Clamped orbital rotation (limit to ±25 deg)
            this.orbit.targetRotY = THREE.MathUtils.clamp(this.orbit.targetRotY + dx * 0.0015, -0.45, 0.45);
            this.orbit.targetRotX = THREE.MathUtils.clamp(this.orbit.targetRotX + dy * 0.0012, -0.3, 0.3);

            this.orbit.startX = currentX;
            this.orbit.startY = currentY;
            this.updateCameraTargets();
        };

        const onPointerUp = () => {
            this.orbit.isPointerDown = false;
        };

        el.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        el.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp);

        // Wheel Zoom in orbit mode
        el.addEventListener('wheel', (e) => {
            if (this.mode === 'focus') return;
            if (e.target.closest('#terminal-mount')) return; // Allow terminal scrollback
            e.preventDefault();
            this.orbit.zoom = THREE.MathUtils.clamp(this.orbit.zoom + e.deltaY * 0.0008, 0.7, 1.4);
            this.updateCameraTargets();
        }, { passive: false });
    }

    setMode(mode) {
        if (mode !== 'focus' && mode !== 'orbit') return;
        this.mode = mode;
        if (mode === 'focus') {
            this.orbit.targetRotX = 0;
            this.orbit.targetRotY = 0;
        }
        this.updateCameraTargets();
    }

    toggleMode() {
        this.setMode(this.mode === 'focus' ? 'orbit' : 'focus');
        return this.mode;
    }

    updateTelemetry(metrics) {
        if (!metrics) return;
        if (typeof metrics.cpu === 'number') this.metrics.cpu = metrics.cpu;
        if (typeof metrics.ram === 'number') this.metrics.ram = metrics.ram;
    }

    pulseData() {
        // Visual flare for active keystrokes or network bursts
        if (this.quantumCore) {
            this.quantumCore.scale.set(1.15, 1.15, 1.15);
            setTimeout(() => {
                if (this.quantumCore) this.quantumCore.scale.set(1, 1, 1);
            }, 120);
        }
    }

    handleResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.isMobile = this.width <= 768;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.webglRenderer.setSize(this.width, this.height);
        this.webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.cssRenderer.setSize(this.width, this.height);

        // Adjust HUD visibility for mobile
        if (this.hudLeft3DObj) {
            this.hudLeft3DObj.element.style.display = this.isMobile ? 'none' : 'flex';
        }
        if (this.hudRight3DObj) {
            this.hudRight3DObj.element.style.display = this.isMobile ? 'none' : 'flex';
        }

        this.updateCameraTargets();
    }

    animate() {
        this.animId = requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // 1. Reactive Quantum Core Animation (Speed scales with CPU)
        const cpuSpeedMultiplier = 1 + (this.metrics.cpu / 100) * 2.5;
        if (this.quantumCore) {
            this.quantumCore.rotation.y += delta * 0.4 * cpuSpeedMultiplier;
            this.quantumCore.rotation.x += delta * 0.25 * cpuSpeedMultiplier;
        }

        this.coreRings.forEach((ring, idx) => {
            const dir = idx % 2 === 0 ? 1 : -1;
            ring.rotation.z += delta * (0.6 + idx * 0.2) * dir * cpuSpeedMultiplier;
            ring.rotation.x += delta * 0.3 * dir;
        });

        // 2. Slow Ambient Grid and Starfield drift
        if (this.cyberGrid) {
            this.cyberGrid.position.z = (time * 40 * cpuSpeedMultiplier) % 50;
        }
        if (this.starfield) {
            this.starfield.rotation.y = time * 0.02;
        }

        // Live holographic terminal screen texture update (throttled to ~30 FPS)
        const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
        if (this.streamDirty && (now - this.lastStreamRenderTime >= 33)) {
            this.lastStreamRenderTime = now;
            this.renderHoloScreen(time);
            if (this.holoTexture) this.holoTexture.needsUpdate = true;
            this.streamDirty = false;
        }
        if (this.holoStreamMesh) {
            this.holoStreamMesh.position.y = 310 + Math.sin(time * 1.5) * 5;
        }

        // 3. Smooth Camera LERP Transition (Smooth damping between Focus and Orbit)
        const ease = 0.08;
        this.camCurrent.x += (this.camTarget.x - this.camCurrent.x) * ease;
        this.camCurrent.y += (this.camTarget.y - this.camCurrent.y) * ease;
        this.camCurrent.z += (this.camTarget.z - this.camCurrent.z) * ease;
        this.camCurrent.rx += (this.camTarget.rx - this.camCurrent.rx) * ease;
        this.camCurrent.ry += (this.camTarget.ry - this.camCurrent.ry) * ease;
        this.applyCameraPosition();

        // 4. Render dual scenes
        this.webglRenderer.render(this.webglScene, this.camera);
        this.cssRenderer.render(this.cssScene, this.camera);
    }

    destroy() {
        if (this.animId) cancelAnimationFrame(this.animId);
        window.removeEventListener('resize', this.handleResize);
        if (this.webglRenderer) this.webglRenderer.dispose();
    }
}
