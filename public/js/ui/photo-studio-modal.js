import * as THREE from '/vendor/three/build/three.module.js';
import { persistenceManager } from '../core/persistence-manager.js';

/**
 * TELETERM 3D — PHOTO STUDIO & CINEMATIC SMART CAMERA MODAL
 * Engineered according to Argon Architecture Spec:
 * 1. Synchronous Render & Offscreen Canvas 2D: Zero black-frame glitches, crisp buffer capture.
 * 2. 4 Anime LUT/Filter Gradings + Canvas Watermark Stamp.
 * 3. Composition Rule-of-Thirds Grid Toggle.
 * 4. In-Studio Real-time Time-of-Day Slider (05:00 Dawn, 12:00 Midday, 18:30 Sunset, 22:00 Night).
 * 5. Pose Quick-Selector (PhotoPose, VibeDance, Wave, Bow, Meditate).
 * 6. Dual Persistence: Direct IndexedDB Blob storage in `photo_gallery` + instant PNG download.
 */

export const STUDIO_FILTERS = [
    { id: 'original', name: 'Original', filterStr: 'none' },
    { id: 'shinkai', name: 'Shinkai Vibrant', filterStr: 'saturate(1.4) contrast(1.1) brightness(1.05)' },
    { id: 'cyberpunk', name: 'Cyber Neon', filterStr: 'saturate(1.5) hue-rotate(12deg) contrast(1.25)' },
    { id: 'zen_film', name: 'Zen Vintage', filterStr: 'sepia(0.25) contrast(1.1) brightness(0.98)' },
    { id: 'anime_bloom', name: 'Soft Bloom', filterStr: 'brightness(1.08) contrast(1.08) saturate(1.2)' }
];

export class PhotoStudioModal {
    constructor(openWorld3D, options = {}) {
        this.world = openWorld3D;
        this.renderer = openWorld3D?.renderer;
        this.scene = openWorld3D?.scene;
        this.camera = openWorld3D?.camera;
        this.canvas = openWorld3D?.canvas;

        this.isOpen = false;
        this.activeFilter = 'original';
        this.showRuleOfThirds = false;
        this.showWatermark = true;

        this.audioCtx = null;
        this._initDOM();
    }

    _initDOM() {
        if (document.getElementById('photo-studio-modal')) return;

        const modalHtml = `
            <div id="photo-studio-modal" class="photo-studio-modal hidden">
                <!-- Rule of Thirds Grid Overlay -->
                <div id="studio-grid-overlay" class="studio-grid-overlay hidden">
                    <div class="grid-line h-1"></div>
                    <div class="grid-line h-2"></div>
                    <div class="grid-line v-1"></div>
                    <div class="grid-line v-2"></div>
                </div>

                <!-- Top Header & Controls -->
                <div class="studio-top-bar">
                    <div class="studio-title">
                        <span class="studio-icon tt-icon" data-icon="camera" data-size="16" style="margin-right:6px;color:#00f0ff;"></span>
                        <span>PHOTO STUDIO • TELETERM 3D</span>
                    </div>
                    <div class="studio-top-actions">
                        <button id="btn-studio-grid" class="studio-btn-toggle" title="Toggle Rule of Thirds Grid"><span class="tt-icon" data-icon="ruler" data-size="12" style="margin-right:4px;"></span>GRID</button>
                        <button id="btn-studio-watermark" class="studio-btn-toggle active" title="Toggle Watermark"><span class="tt-icon" data-icon="tag" data-size="12" style="margin-right:4px;"></span>WATERMARK</button>
                        <button id="btn-studio-gallery" class="studio-btn-toggle" title="View Saved Photos"><span class="tt-icon" data-icon="image" data-size="12" style="margin-right:4px;"></span>GALLERY</button>
                        <button id="btn-studio-close" class="studio-btn-close" title="Close Photo Studio" aria-label="Close"><span class="tt-icon" data-icon="x" data-size="15"></span></button>
                    </div>
                </div>

                <!-- Bottom Floating Control Deck -->
                <div class="studio-dock">
                    <!-- Filters -->
                    <div class="studio-dock-section">
                        <div class="dock-label">FILTERS</div>
                        <div class="dock-pill-group" id="studio-filter-pills">
                            ${STUDIO_FILTERS.map(f => `
                                <button class="dock-pill ${f.id === 'original' ? 'active' : ''}" data-filter="${f.id}">${f.name}</button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Poses -->
                    <div class="studio-dock-section">
                        <div class="dock-label">AVATAR POSE</div>
                        <div class="dock-pill-group" id="studio-pose-pills">
                            <button class="dock-pill active" data-pose="PhotoPose">Peace</button>
                            <button class="dock-pill" data-pose="VibeDance">Dance</button>
                            <button class="dock-pill" data-pose="Wave">Wave</button>
                            <button class="dock-pill" data-pose="Bow">Bow</button>
                            <button class="dock-pill" data-pose="Meditate">Zen</button>
                        </div>
                    </div>

                    <!-- Time of Day Slider -->
                    <div class="studio-dock-section">
                        <div class="dock-label">TIME OF DAY: <b id="studio-time-label">12:00</b></div>
                        <input type="range" id="studio-time-slider" min="0" max="24" step="0.25" value="12" class="cyber-range" style="width: 140px;">
                    </div>

                    <!-- Shutter Action Button -->
                    <div class="studio-dock-action">
                        <button id="btn-studio-shutter" class="studio-shutter-btn">
                            <span class="shutter-icon tt-icon" data-icon="camera" data-size="20"></span>
                            <span>CHỤP ẢNH</span>
                        </button>
                    </div>
                </div>

                <!-- Photo Gallery Drawer -->
                <div id="studio-gallery-drawer" class="studio-gallery-drawer hidden">
                    <div class="gallery-header">
                        <span>BỘ SƯU TẬP ẢNH ĐÃ CHỤP</span>
                        <button id="btn-close-gallery" class="gallery-close-btn" aria-label="Close"><span class="tt-icon" data-icon="x" data-size="15"></span></button>
                    </div>
                    <div id="gallery-grid" class="gallery-grid">
                        <div class="gallery-empty">Chưa có ảnh nào được lưu trong bộ nhớ. Hãy bấm "CHỤP ẢNH" để lưu giữ khoảnh khắc!</div>
                    </div>
                </div>

                <!-- Flash animation effect -->
                <div id="studio-flash" class="studio-flash"></div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this._injectStyles();
        this._bindEvents();
    }

    _injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .photo-studio-modal {
                position: fixed; inset: 0; z-index: 9995;
                pointer-events: none;
                display: flex; flex-direction: column; justify-content: space-between;
                user-select: none;
            }
            .photo-studio-modal.hidden { display: none !important; }

            /* Rule of Thirds */
            .studio-grid-overlay {
                position: absolute; inset: 0; pointer-events: none;
            }
            .studio-grid-overlay.hidden { display: none; }
            .grid-line {
                position: absolute; background: rgba(255, 255, 255, 0.22);
            }
            .grid-line.h-1 { top: 33.33%; left: 0; right: 0; height: 1px; }
            .grid-line.h-2 { top: 66.66%; left: 0; right: 0; height: 1px; }
            .grid-line.v-1 { left: 33.33%; top: 0; bottom: 0; width: 1px; }
            .grid-line.v-2 { left: 66.66%; top: 0; bottom: 0; width: 1px; }

            /* Top Bar */
            .studio-top-bar {
                pointer-events: auto;
                display: flex; justify-content: space-between; align-items: center;
                padding: 16px 24px;
                background: linear-gradient(180deg, rgba(20, 19, 18, 0.88) 0%, rgba(20, 19, 18, 0) 100%);
            }
            .studio-title {
                display: flex; align-items: center; gap: 8px;
                font-family: system-ui, sans-serif; font-weight: 800; font-size: 15px;
                color: #00f0ff; letter-spacing: 1px; text-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
            }
            .studio-top-actions {
                display: flex; align-items: center; gap: 10px;
            }
            .studio-btn-toggle {
                background: rgba(33, 32, 29, 0.7); border: 1px solid rgba(255, 255, 255, 0.15);
                color: #a39e93; font-size: 12px; font-weight: 600; padding: 6px 12px;
                border-radius: 6px; cursor: pointer; transition: all 0.2s;
            }
            .studio-btn-toggle.active {
                background: rgba(0, 240, 255, 0.18); border-color: #00f0ff; color: #00f0ff;
                box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
            }
            .studio-btn-close {
                background: rgba(214, 96, 96, 0.2); border: 1px solid rgba(214, 96, 96, 0.4);
                color: #d66060; width: 32px; height: 32px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; font-size: 14px; font-weight: bold; transition: all 0.2s;
            }
            .studio-btn-close:hover {
                background: #d66060; color: #fff;
            }

            /* Bottom Dock */
            .studio-dock {
                pointer-events: auto;
                margin: 0 auto 28px;
                background: rgba(24, 24, 26, 0.94);
                border: 1px solid rgba(0, 240, 255, 0.35);
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 240, 255, 0.18);
                border-radius: 16px;
                padding: 12px 24px;
                display: flex; align-items: center; gap: 24px;
                backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
            }
            .studio-dock-section {
                display: flex; flex-direction: column; gap: 6px;
            }
            .dock-label {
                font-family: monospace; font-size: 11px; font-weight: bold; color: #00f0ff;
                letter-spacing: 0.5px;
            }
            .dock-pill-group {
                display: flex; gap: 6px;
            }
            .dock-pill {
                background: rgba(33, 32, 29, 0.65); border: 1px solid rgba(255, 255, 255, 0.12);
                color: #edeae3; font-size: 12px; font-weight: 600; padding: 4px 10px;
                border-radius: 8px; cursor: pointer; transition: all 0.15s;
            }
            .dock-pill:hover { border-color: #00f0ff; color: #fff; }
            .dock-pill.active {
                background: rgba(0, 240, 255, 0.22); border-color: #00f0ff; color: #00f0ff;
                box-shadow: 0 0 10px rgba(0, 240, 255, 0.35);
            }
            .studio-shutter-btn {
                background: linear-gradient(135deg, #00f0ff 0%, #0284c7 100%);
                border: none; color: #ffffff; font-weight: 800; font-size: 13px;
                padding: 10px 22px; border-radius: 12px; cursor: pointer;
                display: flex; align-items: center; gap: 8px;
                box-shadow: 0 4px 18px rgba(0, 240, 255, 0.45);
                transition: transform 0.15s, box-shadow 0.15s;
            }
            .studio-shutter-btn:hover {
                transform: scale(1.05); box-shadow: 0 0 25px rgba(0, 240, 255, 0.65);
            }

            /* Flash animation */
            .studio-flash {
                position: absolute; inset: 0; background: #fff; opacity: 0;
                pointer-events: none; transition: opacity 0.35s ease-out;
            }
            .studio-flash.active { opacity: 0.75; transition: none; }

            /* Gallery Drawer */
            .studio-gallery-drawer {
                position: absolute; right: 24px; top: 72px; bottom: 100px; width: 340px;
                background: rgba(24, 24, 26, 0.95); border: 1px solid rgba(0, 240, 255, 0.35);
                border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 12px;
                pointer-events: auto; backdrop-filter: blur(16px);
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8);
            }
            .studio-gallery-drawer.hidden { display: none; }
            .gallery-header {
                display: flex; justify-content: space-between; align-items: center;
                font-size: 13px; font-weight: bold; color: #00f0ff; border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 8px;
            }
            .gallery-close-btn {
                background: none; border: none; color: #94a3b8; font-size: 16px; cursor: pointer;
            }
            .gallery-grid {
                flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
            }
            .gallery-item {
                position: relative; border-radius: 8px; overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.15);
            }
            .gallery-item img { width: 100%; display: block; border-radius: 6px; }
            .gallery-empty {
                font-size: 12px; color: #64748b; text-align: center; margin-top: 40px; line-height: 1.5;
            }
        `;
        document.head.appendChild(style);
    }

    _bindEvents() {
        // Close
        document.getElementById('btn-studio-close')?.addEventListener('click', () => this.close());

        // Grid toggle
        const gridBtn = document.getElementById('btn-studio-grid');
        const gridOverlay = document.getElementById('studio-grid-overlay');
        gridBtn?.addEventListener('click', () => {
            this.showRuleOfThirds = !this.showRuleOfThirds;
            gridBtn.classList.toggle('active', this.showRuleOfThirds);
            gridOverlay?.classList.toggle('hidden', !this.showRuleOfThirds);
        });

        // Watermark toggle
        const wmBtn = document.getElementById('btn-studio-watermark');
        wmBtn?.addEventListener('click', () => {
            this.showWatermark = !this.showWatermark;
            wmBtn.classList.toggle('active', this.showWatermark);
        });

        // Gallery Drawer toggle
        const galBtn = document.getElementById('btn-studio-gallery');
        const galDrawer = document.getElementById('studio-gallery-drawer');
        const closeGalBtn = document.getElementById('btn-close-gallery');
        galBtn?.addEventListener('click', () => {
            const isHidden = galDrawer?.classList.toggle('hidden');
            if (!isHidden) this._loadGalleryPhotos();
        });
        closeGalBtn?.addEventListener('click', () => galDrawer?.classList.add('hidden'));

        // Filter selection
        document.getElementById('studio-filter-pills')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.dock-pill');
            if (!btn) return;
            document.querySelectorAll('#studio-filter-pills .dock-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.activeFilter = btn.dataset.filter;
            this._applyCanvasFilter(this.activeFilter);
        });

        // Pose selection
        document.getElementById('studio-pose-pills')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.dock-pill');
            if (!btn) return;
            document.querySelectorAll('#studio-pose-pills .dock-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const poseName = btn.dataset.pose;
            const ret = this.world?.retargeter || this.world?.playerRetargeter;
            if (ret?.setAnimation) {
                ret.setAnimation(poseName);
            }
        });

        // Time of Day Slider
        const timeSlider = document.getElementById('studio-time-slider');
        const timeLabel = document.getElementById('studio-time-label');
        timeSlider?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            const hrs = Math.floor(val);
            const mins = Math.floor((val - hrs) * 60);
            if (timeLabel) timeLabel.textContent = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
            if (window.dayNightCycleSystem) {
                window.dayNightCycleSystem.lockTime(val);
            }
        });

        // Shutter Button
        document.getElementById('btn-studio-shutter')?.addEventListener('click', () => this.takeSnapshot());
    }

    _applyCanvasFilter(filterId) {
        const found = STUDIO_FILTERS.find(f => f.id === filterId);
        if (this.canvas) {
            this.canvas.style.filter = found ? found.filterStr : 'none';
        }
    }

    open() {
        this.isOpen = true;
        document.getElementById('photo-studio-modal')?.classList.remove('hidden');
        const ret = this.world?.retargeter || this.world?.playerRetargeter;
        if (ret?.setAnimation) {
            ret.setAnimation('PhotoPose');
        }
    }

    close() {
        this.isOpen = false;
        document.getElementById('photo-studio-modal')?.classList.add('hidden');
        document.getElementById('studio-gallery-drawer')?.classList.add('hidden');
        if (this.canvas) {
            this.canvas.style.filter = 'none';
        }
        if (window.dayNightCycleSystem) {
            window.dayNightCycleSystem.unlock();
        }
    }

    takeSnapshot() {
        if (!this.renderer || !this.scene || !this.camera) {
            if (window.openWorld3D) {
                this.renderer = window.openWorld3D.renderer;
                this.scene = window.openWorld3D.scene;
                this.camera = window.openWorld3D.camera;
                this.canvas = window.openWorld3D.canvas;
            }
        }
        if (!this.renderer || !this.scene || !this.camera) return Promise.resolve(null);

        // 1. Trigger camera flash and sound
        this._playShutterSound();
        const flash = document.getElementById('studio-flash');
        if (flash) {
            flash.classList.add('active');
            requestAnimationFrame(() => {
                setTimeout(() => flash.classList.remove('active'), 80);
            });
        }

        // 2. Synchronous Render call
        this.renderer.render(this.scene, this.camera);

        // 3. Offscreen 2D Canvas compositing
        const w = this.renderer.domElement.width;
        const h = this.renderer.domElement.height;
        const offCanvas = document.createElement('canvas');
        offCanvas.width = w;
        offCanvas.height = h;
        const ctx = offCanvas.getContext('2d');

        // Apply active filter to 2D context
        const filterDef = STUDIO_FILTERS.find(f => f.id === this.activeFilter);
        ctx.filter = filterDef ? filterDef.filterStr : 'none';
        ctx.drawImage(this.renderer.domElement, 0, 0, w, h);
        ctx.filter = 'none'; // reset filter for watermark

        // Draw Watermark if enabled
        if (this.showWatermark) {
            const pad = Math.round(w * 0.02);
            const fontSize = Math.round(Math.max(14, w * 0.016));
            ctx.font = `800 ${fontSize}px system-ui, sans-serif`;
            ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 6;
            ctx.fillText('TELETERM 3D • LIVING METAVERSE', pad, h - pad);
        }

        // 4. Save to IndexedDB & download
        return new Promise((resolve) => {
            offCanvas.toBlob(async (blob) => {
                if (!blob) {
                    resolve(null);
                    return;
                }

                // Save to IndexedDB
                const photoId = await persistenceManager.savePhoto(blob, {
                    filter: this.activeFilter,
                    timeOfDay: window.dayNightCycleSystem ? window.dayNightCycleSystem.time : 12.0
                });

                // Broadcast compressed thumbnail for in-world billboard & multiplayer (<60KB)
                try {
                    const thumbCanvas = document.createElement('canvas');
                    thumbCanvas.width = 512;
                    thumbCanvas.height = 288;
                    const tCtx = thumbCanvas.getContext('2d');
                    tCtx.drawImage(offCanvas, 0, 0, 512, 288);
                    const thumbDataUrl = thumbCanvas.toDataURL('image/webp', 0.65);
                    window.dispatchEvent(new CustomEvent('teleterm:photo_shared', {
                        detail: { photoDataUrl: thumbDataUrl, caption: 'Snapshot từ Photo Studio' }
                    }));
                    if (window.multiplayerClient && typeof window.multiplayerClient.sendPacket === 'function') {
                        window.multiplayerClient.sendPacket({
                            type: 'photo_share',
                            photoDataUrl: thumbDataUrl,
                            caption: 'Snapshot từ Photo Studio'
                        });
                    }
                } catch (e) {}

                // Browser download
                try {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `teleterm-snapshot-${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                } catch (_) {}

                // Toast feedback
                if (this.world?.onToast) {
                    this.world.onToast('Đã lưu ảnh vào Bộ sưu tập & Thư mục Tải về!', 'success');
                }

                resolve(photoId);
            }, 'image/png');
        });
    }

    async _loadGalleryPhotos() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        const photos = await persistenceManager.getPhotos(12);
        if (photos.length === 0) {
            grid.innerHTML = '<div class="gallery-empty">Chưa có ảnh nào được lưu. Hãy bấm "CHỤP ẢNH" để bắt đầu!</div>';
            return;
        }

        grid.innerHTML = '';
        photos.forEach(p => {
            const url = URL.createObjectURL(p.blob);
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `<img src="${url}" alt="TeleTerm Photo" loading="lazy">`;
            grid.appendChild(item);
        });
    }

    _playShutterSound() {
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.08);
        } catch (_) {}
    }
}

export const photoStudioModal = new PhotoStudioModal();
if (typeof window !== 'undefined') {
    window.photoStudioModal = photoStudioModal;
}
