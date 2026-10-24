/**
 * ANIME PHOTO MODE & KINETIC DRONE CAMERA SYSTEM
 * TeleTerm 3D Cinematic Photography
 * 
 * Features:
 * - Freezes player movement and world animations on activation (Hotkey 'P')
 * - Hides cluttered game HUDs for clean composition
 * - 6-DOF Smooth Free-Flight Drone Camera (WASD + Space/Shift + Mouse look)
 * - 4 Anime Color Grading Filters (Shinkai, Cyber Neon, Nostalgic Film, Monochrome Noir)
 * - Real-time FOV Telephoto/Wide slider (30° to 90°)
 * - Instant High-Res Canvas Screenshot capture and auto-download
 */

import * as THREE from 'three';

export const PHOTO_FILTERS = [
    { id: 'none', name: 'Original', css: 'none' },
    { id: 'shinkai', name: 'Vibrant Shinkai', css: 'saturate(1.35) contrast(1.1) brightness(1.04)' },
    { id: 'cyber', name: 'Cyber Neon', css: 'saturate(1.4) hue-rotate(15deg) contrast(1.2)' },
    { id: 'film', name: 'Nostalgic Film', css: 'sepia(0.25) saturate(1.1) contrast(1.05) brightness(0.98)' },
    { id: 'noir', name: 'Manga Noir', css: 'grayscale(1) contrast(1.35) brightness(0.95)' }
];

export class PhotoModeSystem {
    constructor(openWorld3D, options = {}) {
        this.world = openWorld3D;
        this.camera = openWorld3D.camera;
        this.renderer = openWorld3D.renderer;
        this.canvas = openWorld3D.canvas;
        this.onToast = options.onToast || console.log;

        this.isActive = false;
        this.activeFilter = 'none';

        // Drone Camera 6-DOF transform state
        this.dronePos = new THREE.Vector3();
        this.droneYaw = 0;
        this.dronePitch = 0;
        this.droneSpeed = 8.0; // m/s
        this.savedPlayerFov = 75;

        // Keys held for drone movement
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false
        };

        this.initDOM();
        this.bindEvents();
    }

    initDOM() {
        if (document.getElementById('photo-mode-overlay')) return;

        const overlayHTML = `
            <div id="photo-mode-overlay" class="photo-mode-overlay hidden">
                <div class="photo-mode-crosshair">+</div>
                
                <div class="photo-mode-controls-bar">
                    <div class="photo-control-group">
                        <span class="photo-control-label">FILTER</span>
                        <div class="photo-filter-buttons" id="photo-filter-buttons">
                            <!-- Populated dynamically -->
                        </div>
                    </div>

                    <div class="photo-control-group">
                        <span class="photo-control-label">FOV: <b id="val-photo-fov">75°</b></span>
                        <input type="range" id="slider-photo-fov" class="cyber-range" min="30" max="95" step="1" value="75" style="width: 110px;">
                    </div>

                    <div class="photo-actions-group">
                        <button id="btn-photo-capture" class="photo-btn-primary" style="display:inline-flex;align-items:center;gap:6px;">
                            ${window.TeleTermIcons ? window.TeleTermIcons.render('camera', { size: 14 }) : ''} SNAPSHOT
                        </button>
                        <button id="btn-photo-open-studio" class="photo-btn-primary" style="background: linear-gradient(135deg, #00f0ff, #b85a3a); color:#fff; display:inline-flex;align-items:center;gap:6px;">
                            ${window.TeleTermIcons ? window.TeleTermIcons.render('sparkles', { size: 14 }) : ''} STUDIO
                        </button>
                        <button id="btn-photo-exit" class="photo-btn-outline" style="display:inline-flex;align-items:center;gap:6px;">
                            ${window.TeleTermIcons ? window.TeleTermIcons.render('x', { size: 13 }) : ''} EXIT [P]
                        </button>
                    </div>
                </div>

                <div class="photo-mode-drone-hint">
                    WASD: Fly | SPACE/SHIFT: Up/Down | Drag: Pan Camera
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', overlayHTML);

        // Styling
        const style = document.createElement('style');
        style.textContent = `
            .photo-mode-overlay {
                position: fixed; inset: 0; z-index: 9990;
                pointer-events: none;
                display: flex; flex-direction: column;
                justify-content: space-between; align-items: center;
                padding: 24px;
                user-select: none;
            }
            .photo-mode-overlay.hidden {
                display: none !important;
            }
            .photo-mode-crosshair {
                margin-top: auto; margin-bottom: auto;
                font-size: 1.4rem; color: rgba(255, 255, 255, 0.4);
                font-family: monospace;
            }
            .photo-mode-controls-bar {
                pointer-events: auto;
                background: rgba(10, 16, 28, 0.88);
                border: 1px solid rgba(0, 243, 255, 0.35);
                box-shadow: 0 0 25px rgba(0, 243, 255, 0.2);
                border-radius: 12px;
                padding: 10px 18px;
                display: flex; align-items: center; gap: 20px;
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
            }
            .photo-control-group {
                display: flex; align-items: center; gap: 8px;
            }
            .photo-control-label {
                font-size: 0.72rem; font-weight: 800; color: #00f3ff;
                font-family: monospace; letter-spacing: 0.5px;
            }
            .photo-filter-buttons {
                display: flex; gap: 6px;
            }
            .photo-filter-btn {
                background: rgba(15, 23, 42, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #94a3b8; font-size: 0.72rem; font-weight: 600;
                padding: 4px 10px; border-radius: 6px; cursor: pointer;
                transition: all 0.15s;
            }
            .photo-filter-btn:hover {
                border-color: #00f3ff; color: #e2e8f0;
            }
            .photo-filter-btn.active {
                background: rgba(0, 243, 255, 0.2);
                border-color: #00f3ff; color: #00f3ff;
                box-shadow: 0 0 8px rgba(0, 243, 255, 0.3);
            }
            .photo-actions-group {
                display: flex; gap: 10px; margin-left: 10px;
            }
            .photo-btn-primary {
                background: #00f3ff; border: none; color: #050b14;
                font-weight: 800; font-size: 0.78rem; padding: 6px 16px;
                border-radius: 6px; cursor: pointer;
                box-shadow: 0 0 14px rgba(0, 243, 255, 0.4);
                transition: transform 0.15s, box-shadow 0.15s;
            }
            .photo-btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 0 20px rgba(0, 243, 255, 0.6);
            }
            .photo-btn-outline {
                background: transparent; border: 1px solid rgba(255, 255, 255, 0.25);
                color: #e2e8f0; font-size: 0.74rem; font-weight: 700;
                padding: 6px 12px; border-radius: 6px; cursor: pointer;
                transition: all 0.15s;
            }
            .photo-btn-outline:hover {
                border-color: #ff0055; color: #ff0055;
            }
            .photo-mode-drone-hint {
                font-family: monospace; font-size: 0.68rem;
                color: rgba(255, 255, 255, 0.65);
                margin-top: 6px;
                text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
            }
        `;
        document.head.appendChild(style);

        this.overlayEl = document.getElementById('photo-mode-overlay');

        // Populate filters
        const filterBtnsContainer = document.getElementById('photo-filter-buttons');
        PHOTO_FILTERS.forEach((f) => {
            const btn = document.createElement('button');
            btn.className = `photo-filter-btn ${f.id === 'none' ? 'active' : ''}`;
            btn.textContent = f.name;
            btn.addEventListener('click', () => this.applyFilter(f.id));
            filterBtnsContainer.appendChild(btn);
        });

        // FOV Slider
        const sliderFov = document.getElementById('slider-photo-fov');
        const valFov = document.getElementById('val-photo-fov');
        sliderFov?.addEventListener('input', (e) => {
            const fov = parseInt(e.target.value, 10);
            if (valFov) valFov.textContent = `${fov}°`;
            if (this.camera) {
                this.camera.fov = fov;
                this.camera.updateProjectionMatrix();
            }
        });

        // Snapshot button
        document.getElementById('btn-photo-capture')?.addEventListener('click', () => this.captureSnapshot());
        // Studio button
        document.getElementById('btn-photo-open-studio')?.addEventListener('click', () => {
            window.photoStudioModal?.open();
        });
        // Exit button
        document.getElementById('btn-photo-exit')?.addEventListener('click', () => this.exit());
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyP' && !e.repeat) {
                const tag = document.activeElement?.tagName;
                if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.classList?.contains('xterm-helper-textarea')) {
                    return;
                }
                e.preventDefault();
                this.toggle();
                return;
            }

            if (this.isActive) {
                if (e.code === 'Escape') {
                    e.preventDefault();
                    this.exit();
                    return;
                }
                if (e.code === 'KeyW') this.keys.forward = true;
                if (e.code === 'KeyS') this.keys.backward = true;
                if (e.code === 'KeyA') this.keys.left = true;
                if (e.code === 'KeyD') this.keys.right = true;
                if (e.code === 'Space') { e.preventDefault(); this.keys.up = true; }
                if (e.code === 'ShiftLeft' || e.code === 'KeyC') this.keys.down = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.isActive) {
                if (e.code === 'KeyW') this.keys.forward = false;
                if (e.code === 'KeyS') this.keys.backward = false;
                if (e.code === 'KeyA') this.keys.left = false;
                if (e.code === 'KeyD') this.keys.right = false;
                if (e.code === 'Space') this.keys.up = false;
                if (e.code === 'ShiftLeft' || e.code === 'KeyC') this.keys.down = false;
            }
        });

        // Mouse look during photo mode
        window.addEventListener('mousemove', (e) => {
            if (!this.isActive || !this.world?.isPointerDown) return;
            const deltaX = e.clientX - this.world.previousPointer.x;
            const deltaY = e.clientY - this.world.previousPointer.y;

            this.droneYaw -= deltaX * 0.004;
            this.dronePitch = Math.max(-1.4, Math.min(1.4, this.dronePitch - deltaY * 0.0035));
        });
    }

    applyFilter(filterId) {
        const found = PHOTO_FILTERS.find((f) => f.id === filterId);
        if (!found) return;
        this.activeFilter = filterId;

        // Apply CSS filter to 3D canvas
        if (this.canvas) {
            this.canvas.style.filter = found.css;
        }

        // Update button states
        this.overlayEl.querySelectorAll('.photo-filter-btn').forEach((btn) => {
            btn.classList.toggle('active', btn.textContent.includes(found.name) || btn.textContent === found.name);
        });
    }

    toggle() {
        if (this.isActive) this.exit();
        else this.enter();
    }

    enter() {
        if (this.isActive) return;
        this.isActive = true;
        window.isPhotoModeActive = true;

        // Save current camera transform & FOV
        if (this.camera) {
            this.savedPlayerFov = this.camera.fov;
            this.dronePos.copy(this.camera.position);
            this.droneYaw = this.world?.cameraRotation?.yaw || 0;
            this.dronePitch = this.world?.cameraRotation?.pitch || 0;
        }

        // Hide regular UI elements
        this.setGameUIHidden(true);
        this.overlayEl?.classList.remove('hidden');

        const i18n = window.TeleTermI18n;
        const msg = i18n ? i18n.t('toast_photo_mode_entered') : 'Photo Mode activated. Press [P] to exit.';
        this.onToast(msg, 'info');
    }

    exit() {
        if (!this.isActive) return;
        this.isActive = false;
        window.isPhotoModeActive = false;

        // Reset filter
        if (this.canvas) {
            this.canvas.style.filter = 'none';
        }

        // Restore FOV
        if (this.camera) {
            this.camera.fov = this.savedPlayerFov;
            this.camera.updateProjectionMatrix();
        }

        // Restore regular UI elements
        this.setGameUIHidden(false);
        this.overlayEl?.classList.add('hidden');

        const i18n = window.TeleTermI18n;
        const msg = i18n ? i18n.t('toast_photo_mode_exited') : 'Exited Photo Mode.';
        this.onToast(msg, 'info');
    }

    setGameUIHidden(hide) {
        const idsToToggle = [
            'top-navigation',
            'tactical-minimap-container',
            'chat-container',
            'tools-drawer-desktop',
            'hud-viet-input-dock'
        ];
        idsToToggle.forEach((id) => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = hide ? 'none' : '';
            }
        });
    }

    update(delta) {
        if (!this.isActive || !this.camera) return;

        // Compute drone forward, right, and up directions from yaw and pitch
        const forward = new THREE.Vector3(
            -Math.sin(this.droneYaw) * Math.cos(this.dronePitch),
            Math.sin(this.dronePitch),
            -Math.cos(this.droneYaw) * Math.cos(this.dronePitch)
        ).normalize();

        const right = new THREE.Vector3(
            Math.cos(this.droneYaw),
            0,
            -Math.sin(this.droneYaw)
        ).normalize();

        const up = new THREE.Vector3(0, 1, 0);

        const moveDist = this.droneSpeed * delta;
        if (this.keys.forward) this.dronePos.addScaledVector(forward, moveDist);
        if (this.keys.backward) this.dronePos.addScaledVector(forward, -moveDist);
        if (this.keys.right) this.dronePos.addScaledVector(right, moveDist);
        if (this.keys.left) this.dronePos.addScaledVector(right, -moveDist);
        if (this.keys.up) this.dronePos.addScaledVector(up, moveDist);
        if (this.keys.down) this.dronePos.addScaledVector(up, -moveDist);

        // Apply to camera
        this.camera.position.copy(this.dronePos);
        const lookTarget = this.dronePos.clone().add(forward);
        this.camera.lookAt(lookTarget);
    }

    captureSnapshot() {
        if (!this.renderer || !this.canvas) return;

        // Briefly hide photo overlay crosshair for clean image
        this.overlayEl.style.visibility = 'hidden';

        setTimeout(() => {
            try {
                // Ensure frame is rendered
                if (this.world?.render) {
                    this.world.render();
                }

                const dataURL = this.canvas.toDataURL('image/png');
                const link = document.createElement('a');
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                link.download = `teleterm-anime-photo-${timestamp}.png`;
                link.href = dataURL;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Save to IndexedDB Gallery
                this.canvas.toBlob((blob) => {
                    if (blob && window.persistenceManager) {
                        window.persistenceManager.savePhoto(blob, {
                            filter: this.activeFilter,
                            location: 'TeleTerm Open World',
                            timeOfDay: window.dayNightCycleSystem ? window.dayNightCycleSystem.time : 12.0
                        });
                    }
                }, 'image/png');

                const i18n = window.TeleTermI18n;
                const msg = i18n ? i18n.t('toast_snapshot_saved') : 'High-res snapshot saved to your downloads!';
                this.onToast(msg, 'success');
            } catch (err) {
                console.error('[PhotoMode] Failed to capture snapshot:', err);
            } finally {
                this.overlayEl.style.visibility = 'visible';
            }
        }, 50);
    }
}
