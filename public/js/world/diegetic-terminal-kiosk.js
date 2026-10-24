import * as THREE from 'three';
import { spatialAudioZoneManager } from './spatial-audio-zone-manager.js';

/**
 * TELETERM 3D — DIEGETIC TERMINAL KIOSK SYSTEM
 * Physical in-world interactive cybernetic terminal screen located at Developer Hub (21, 1.25, -11).
 * Features:
 * - 3D physical console kiosk with glowing neon trims
 * - Dynamic CanvasTexture rendering 1024x640 terminal screen
 * - Raycast hover & Proximity [E] interaction
 * - Full keyboard input trapping with cursor blinking
 * - Positional 3D mechanical keystroke audio via PannerNode
 * - Integrated terminal shell (help, status, time, clear, neofetch, matrix, echo)
 */
export class DiegeticTerminalKiosk {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        // Positioned at dedicated Hub Kiosk pedestal (17.8, 1.04, -8.2)
        this.kioskPos = new THREE.Vector3(17.8, 1.04, -8.2);
        this.screenPos = new THREE.Vector3(17.8, 1.04 + 1.25, -8.2);

        this.isFocused = false;
        this.isNear = false;
        this.cursorBlink = 0;
        this.isCursorVisible = true;
        this.isDirty = true;

        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentInput = '';
        this.lines = [
            '====================================================',
            '   TELETERM // DIEGETIC WORKSTATION KIOSK v2.5      ',
            '====================================================',
            ' [SYSTEM] All sub-systems operational: WebGL2, Audio3D',
            ' [SYSTEM] Spatial PannerNode linked to Kiosk (17.8, -8.2)',
            ' Gõ "help" để xem danh sách lệnh, phím [Esc] để thoát.',
            '----------------------------------------------------'
        ];

        this.group = new THREE.Group();
        this.group.position.copy(this.kioskPos);
        this.group.rotation.y = Math.PI; // Face user standing at Z = -9.0

        this.initCanvasTexture();
        this.buildPhysicalKiosk();
        this.initInteractionHandlers();

        this.scene.add(this.group);
    }

    initCanvasTexture() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;
        this.canvas.height = 640;
        this.ctx = this.canvas.getContext('2d');

        this.screenTexture = new THREE.CanvasTexture(this.canvas);
        this.screenTexture.minFilter = THREE.LinearFilter;
        this.screenTexture.magFilter = THREE.LinearFilter;
        this.screenTexture.generateMipmaps = false;

        this.renderCanvas();
    }

    buildPhysicalKiosk() {
        // 1. Pedestal Base - Warm Charcoal / Bronze Metal
        const baseGeo = new THREE.CylinderGeometry(0.55, 0.7, 0.15, 8);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x21201d,
            roughness: 0.6,
            metalness: 0.5
        });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = 0.075;
        this.group.add(baseMesh);

        // 2. Central Stand - Warm Obsidian
        const standGeo = new THREE.BoxGeometry(0.35, 1.05, 0.25);
        const standMat = new THREE.MeshStandardMaterial({
            color: 0x18181a,
            roughness: 0.5,
            metalness: 0.4
        });
        const standMesh = new THREE.Mesh(standGeo, standMat);
        standMesh.position.y = 0.65;
        this.group.add(standMesh);

        // Stand glowing warm terracotta ribs (Claude.ai accent)
        const ribGeo = new THREE.BoxGeometry(0.37, 0.04, 0.27);
        const ribMat = new THREE.MeshStandardMaterial({
            color: 0xda7756,
            emissive: 0xda7756,
            emissiveIntensity: 0.5,
            roughness: 0.3
        });
        for (let i = 0; i < 3; i++) {
            const rib = new THREE.Mesh(ribGeo, ribMat);
            rib.position.y = 0.35 + i * 0.3;
            this.group.add(rib);
        }

        // 3. Console Screen Backing Frame
        const frameGeo = new THREE.BoxGeometry(1.48, 0.98, 0.06);
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x141312,
            roughness: 0.4,
            metalness: 0.6
        });
        this.frameMesh = new THREE.Mesh(frameGeo, frameMat);
        this.frameMesh.position.set(0, 1.25, 0.05);
        this.frameMesh.rotation.x = -0.22; // subtle backward tilt
        this.group.add(this.frameMesh);

        // 4. Interactive Display Screen (Front Plane)
        const screenGeo = new THREE.PlaneGeometry(1.4, 0.9);
        this.screenMat = new THREE.MeshBasicMaterial({
            map: this.screenTexture,
            transparent: true,
            opacity: 0.98
        });
        this.screenMesh = new THREE.Mesh(screenGeo, this.screenMat);
        this.screenMesh.position.set(0, 1.25, 0.082);
        this.screenMesh.rotation.x = -0.22;
        this.screenMesh.userData = { isDiegeticTerminal: true };
        this.group.add(this.screenMesh);

        // 5. Laser Projection Keyboard Plate - Warm Terracotta Amber
        const kbGeo = new THREE.PlaneGeometry(0.75, 0.35);
        const kbMat = new THREE.MeshBasicMaterial({
            color: 0xda7756,
            transparent: true,
            opacity: 0.28,
            side: THREE.DoubleSide
        });
        const kbMesh = new THREE.Mesh(kbGeo, kbMat);
        kbMesh.position.set(0, 0.88, 0.42);
        kbMesh.rotation.x = Math.PI * 0.45;
        this.group.add(kbMesh);

        // 6. Proximity Prompt Floating Banner - Claude Warm Card
        const bannerCanvas = document.createElement('canvas');
        bannerCanvas.width = 512;
        bannerCanvas.height = 128;
        const bCtx = bannerCanvas.getContext('2d');
        bCtx.fillStyle = 'rgba(24, 24, 26, 0.94)';
        bCtx.roundRect(16, 16, 480, 96, 16);
        bCtx.fill();
        bCtx.lineWidth = 3;
        bCtx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
        bCtx.stroke();

        bCtx.fillStyle = '#00f0ff';
        bCtx.font = 'bold 36px "Segoe UI", system-ui, sans-serif';
        bCtx.textAlign = 'center';
        bCtx.fillText('⌨️ [E] MỞ TERMINAL KIOSK', 256, 75);

        const bannerTex = new THREE.CanvasTexture(bannerCanvas);
        const bannerMat = new THREE.SpriteMaterial({ map: bannerTex, transparent: true, opacity: 0 });
        this.promptSprite = new THREE.Sprite(bannerMat);
        this.promptSprite.position.set(0, 2.0, 0);
        this.promptSprite.scale.set(1.5, 0.4, 1.0);
        this.group.add(this.promptSprite);
    }

    renderCanvas() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Background: Warm Obsidian
        ctx.fillStyle = '#18181a';
        ctx.fillRect(0, 0, w, h);

        // Scanlines: Subtle warm amber/terracotta
        ctx.fillStyle = 'rgba(0, 240, 255, 0.025)';
        for (let y = 0; y < h; y += 4) {
            ctx.fillRect(0, y, w, 2);
        }

        // Header bar: Warm charcoal surface
        ctx.fillStyle = '#21201d';
        ctx.fillRect(0, 0, w, 52);
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 22px "Consolas", monospace';
        ctx.fillText('TELETERM // DIEGETIC KIOSK', 24, 34);

        ctx.fillStyle = this.isFocused ? '#52a373' : '#d49746';
        ctx.beginPath();
        ctx.arc(w - 180, 26, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#a39e93';
        ctx.font = '16px "Consolas", monospace';
        ctx.fillText(this.isFocused ? 'CONNECTED [ESC=EXIT]' : 'IDLE [PRESS E]', w - 160, 32);

        // Lines Output
        ctx.font = '20px "Consolas", monospace';
        const lineHeight = 32;
        const startY = 90;
        const maxVisible = 14;

        const visibleLines = this.lines.slice(-maxVisible);
        for (let i = 0; i < visibleLines.length; i++) {
            const line = visibleLines[i];
            if (line.startsWith('================') || line.startsWith('----------------')) {
                ctx.fillStyle = '#44403c';
            } else if (line.startsWith(' [SYSTEM]')) {
                ctx.fillStyle = '#00f0ff';
            } else if (line.startsWith(' [ERROR]')) {
                ctx.fillStyle = '#d66060';
            } else if (line.startsWith(' >')) {
                ctx.fillStyle = '#d49746';
            } else {
                ctx.fillStyle = '#edeae3';
            }
            ctx.fillText(line, 24, startY + i * lineHeight);
        }

        // Active prompt line
        const inputY = startY + visibleLines.length * lineHeight + 8;
        if (inputY < h - 20) {
            ctx.fillStyle = '#00f0ff';
            ctx.fillText('> ' + this.currentInput + (this.isCursorVisible && this.isFocused ? '█' : ''), 24, inputY);
        }

        this.screenTexture.needsUpdate = true;
        this.isDirty = false;
    }

    initInteractionHandlers() {
        this.boundKeydown = (e) => this.handleKeydown(e);
        window.addEventListener('keydown', this.boundKeydown);
    }

    handleKeydown(e) {
        // [E] Toggle interaction when standing near
        if (e.key === 'e' || e.key === 'E') {
            if (this.isNear && !this.isFocused) {
                e.preventDefault();
                this.setFocus(true);
                return;
            }
        }

        if (!this.isFocused) return;

        // Prevent movement / hotkeys from firing while typing in Kiosk
        e.stopPropagation();

        if (e.key === 'Escape') {
            this.setFocus(false);
            return;
        }

        // Trigger 3D Spatial Keystroke Audio
        spatialAudioZoneManager.playPositionalKeystroke(this.screenPos);

        if (e.key === 'Enter') {
            const cmd = this.currentInput.trim();
            this.lines.push(`> ${this.currentInput}`);
            if (cmd) {
                this.commandHistory.push(cmd);
                this.historyIndex = this.commandHistory.length;
                this.executeCommand(cmd);
            }
            this.currentInput = '';
            this.isDirty = true;
            return;
        }

        if (e.key === 'Backspace') {
            this.currentInput = this.currentInput.slice(0, -1);
            this.isDirty = true;
            return;
        }

        if (e.key === 'ArrowUp') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.currentInput = this.commandHistory[this.historyIndex] || '';
                this.isDirty = true;
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.currentInput = this.commandHistory[this.historyIndex] || '';
            } else {
                this.historyIndex = this.commandHistory.length;
                this.currentInput = '';
            }
            this.isDirty = true;
            return;
        }

        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            this.currentInput += e.key;
            this.isDirty = true;
        }
    }

    executeCommand(cmd) {
        const parts = cmd.split(' ');
        const main = parts[0].toLowerCase();
        const args = parts.slice(1).join(' ');

        switch (main) {
            case 'help':
                this.lines.push(' Lệnh hỗ trợ:');
                this.lines.push('   help       - Hiển thị bảng trợ giúp này');
                this.lines.push('   status     - Kiểm tra trạng thái hệ thống và 3D Audio');
                this.lines.push('   time       - Hiển thị thời gian và chu kỳ ngày đêm');
                this.lines.push('   clear      - Xóa sạch màn hình');
                this.lines.push('   neofetch   - Hiển thị thông số cấu hình TeleTerm 3D');
                this.lines.push('   matrix     - Kích hoạt hiệu ứng ma trận ký tự xanh');
                this.lines.push('   echo <msg> - In ra thông điệp');
                this.lines.push('   exit       - Thoát chế độ Kiosk');
                break;

            case 'status':
                this.lines.push(' [OK] WebGL2 Pipeline: 60 FPS Stable');
                this.lines.push(' [OK] Spatial Audio 3D: PannerNode Active at (21, 1.25, -11)');
                this.lines.push(` [OK] Zone Biome: ${spatialAudioZoneManager.getActiveZone()}`);
                this.lines.push(' [OK] IndexedDB Persistence: TeleTerm3D_DB Connected');
                break;

            case 'time':
                if (window.dayNightCycle) {
                    const h = Math.floor(window.dayNightCycle.timeOfDay);
                    const m = Math.floor((window.dayNightCycle.timeOfDay % 1) * 60);
                    const phase = window.dayNightCycle.getCurrentPhase();
                    this.lines.push(` [TIME] ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} - Pha: ${phase.name}`);
                } else {
                    this.lines.push(` [TIME] ${new Date().toLocaleTimeString()}`);
                }
                break;

            case 'clear':
                this.lines = [];
                break;

            case 'neofetch':
                this.lines.push('  ____  ____  _____     OS: TeleTerm Cyber-OS x86_64');
                this.lines.push(' / ___||___ \\|___ /     Host: WebGL 2.0 (Three.js r128)');
                this.lines.push(' \\___ \\  __) | |_ \\     Kernel: ConPTY Node Realtime');
                this.lines.push('  ___) |/ __/ ___) |    Uptime: 24/7 Active');
                this.lines.push(' |____/|_____|____/     Memory: 60 FPS Steady Buffer');
                break;

            case 'matrix':
                this.lines.push(' 01010100 01100101 01101100 01100101 01010100');
                this.lines.push(' WAKE UP, CYBER OPERATOR... THE METAVERSE HAS YOU.');
                break;

            case 'echo':
                this.lines.push(' ' + (args || ''));
                break;

            case 'exit':
                this.setFocus(false);
                break;

            default:
                this.lines.push(` [ERROR] Lệnh không nhận diện: "${cmd}". Gõ "help" để xem hướng dẫn.`);
                break;
        }
    }

    setFocus(focused) {
        this.isFocused = focused;
        this.isDirty = true;
        this.renderCanvas();

        if (window.openWorld3D) {
            window.openWorld3D.isTypingInDiegeticKiosk = focused;
        }
    }

    update(delta, playerPos) {
        if (!playerPos) return;

        // Proximity check (3.0m radius)
        const dx = playerPos.x - this.screenPos.x;
        const dz = playerPos.z - this.screenPos.z;
        const dist = Math.hypot(dx, dz);

        this.isNear = (dist < 3.2);

        // Smoothly fade prompt sprite
        const targetOpacity = (this.isNear && !this.isFocused) ? 0.95 : 0.0;
        this.promptSprite.material.opacity += (targetOpacity - this.promptSprite.material.opacity) * (1 - Math.exp(-delta * 8));

        // Blink cursor when focused
        if (this.isFocused) {
            this.cursorBlink += delta;
            if (this.cursorBlink >= 0.5) {
                this.cursorBlink = 0;
                this.isCursorVisible = !this.isCursorVisible;
                this.isDirty = true;
            }
        }

        if (this.isDirty) {
            this.renderCanvas();
        }
    }

    dispose() {
        if (this.boundKeydown) {
            window.removeEventListener('keydown', this.boundKeydown);
        }
        if (this.screenTexture) this.screenTexture.dispose();
        if (this.group) this.scene.remove(this.group);
    }
}
