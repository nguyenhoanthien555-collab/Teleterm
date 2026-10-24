/**
 * TORII FAST-TRAVEL & SPATIAL WARP NETWORK
 * TeleTerm 3D World Exploration System
 * 
 * Spawns 4 Cyberpunk Vermillion & Neon Torii Shrines at key world destinations:
 * 1. Developer Cyber Hub (x: -4.5, z: 2.0)
 * 2. Zen Koi Pond & Maple Valley (x: 23.0, z: -16.0)
 * 3. Alpine Snow Summit Overlook (x: 18.0, z: -60.0)
 * 4. South Beach & Ocean Pier (x: 8.5, z: 72.0)
 * 
 * Features:
 * - Procedural Cyberpunk Torii Mesh with glowing neon core
 * - Ethereal floating beacon sparks particle system
 * - Proximity detection (< 3.5m) with "[E] Fast-Travel Warp" prompt
 * - Interactive 3D Warp Selector Modal
 * - Smooth FOV punch & chromatic flash transition during teleportation
 */

import * as THREE from 'three';

export const TORII_DESTINATIONS = [
    {
        id: 'hub',
        title: 'Developer Cyber Hub Waystone',
        vi: 'Cổng Dịch Chuyển Trụ Sở Hub',
        desc: 'West entrance approach to the central Developer Co-working Deck',
        descVi: 'Lối vào phía Tây dẫn lên sàn làm việc trung tâm Hub',
        icon: 'laptop',
        pos: { x: 14.5, y: 0.85, z: -11.0 },
        rotY: Math.PI * 0.5,
        spawnOffset: { x: 2.5, z: 0.0 }
    },
    {
        id: 'village',
        title: 'Village Plaza Waystone',
        vi: 'Cổng Dịch Chuyển Làng Quê',
        desc: 'Peaceful Japanese countryside square with stone lanterns & paths',
        descVi: 'Quảng trường làng quê thanh bình với đèn đá và đường mòn lát đá',
        icon: 'compass',
        pos: { x: -3.5, y: 0.25, z: -18.0 },
        rotY: 0.0,
        spawnOffset: { x: 0, z: 2.8 }
    },
    {
        id: 'zen_pond',
        title: 'Zen Koi Pond & Maple Valley',
        vi: 'Hồ Cá Koi & Thung Lũng Phong',
        desc: 'Scenic open path entrance overlooking cascading waterfall & koi pond',
        descVi: 'Lối vào thung lũng phong đỏ, ngắm thác nước róc rách và đàn cá koi',
        icon: 'wind',
        pos: { x: 28.0, y: 1.2, z: -25.0 },
        rotY: -0.3,
        spawnOffset: { x: 0, z: 2.8 }
    },
    {
        id: 'alpine_summit',
        title: 'Alpine Snow Summit',
        vi: 'Đỉnh Núi Tuyết Alpine',
        desc: 'Panoramic standalone alpine overlook with open mountain vistas',
        descVi: 'Đỉnh đồi tuyết đứng độc lập nhìn toàn cảnh thế giới và núi tuyết',
        icon: 'compass',
        pos: { x: 26.0, y: 3.8, z: -55.0 },
        rotY: 0.2,
        spawnOffset: { x: 0, z: 3.0 }
    },
    {
        id: 'south_pier',
        title: 'South Beach Dune Waystone',
        vi: 'Cổng Biển Bãi Cát Phía Nam',
        desc: 'Open golden sand dunes facing the ocean surf, clear of the pier deck',
        descVi: 'Bãi cát vàng thoáng đãng trước cầu tàu, gió biển và sóng vỗ rì rào',
        icon: 'globe',
        pos: { x: 10.5, y: -0.15, z: 68.0 },
        rotY: 0.0,
        spawnOffset: { x: 0, z: -3.0 }
    },
    {
        id: 'arashiyama_onsen',
        title: 'Arashiyama Onsen Retreat',
        vi: 'Suối Nước Nóng Rừng Trúc',
        desc: 'Secluded bamboo hot spring sanctuary with steaming mineral pools & zen vibe',
        descVi: 'Khu suối khoáng nóng ẩn mình giữa rừng trúc, khói sương bồng bềnh và thanh tịnh',
        icon: 'bath',
        pos: { x: -31.5, y: 0.65, z: -33.5 },
        rotY: 0.45,
        spawnOffset: { x: -2.0, z: -2.0 }
    }
];

export class ToriiWarpSystem {
    constructor(scene, terrainSystem, options = {}) {
        this.scene = scene;
        this.terrain = terrainSystem;
        this.onToast = options.onToast || console.log;
        this.onWarp = options.onWarp || null;

        this.shrines = [];
        this.nearbyShrine = null;
        this.isWarping = false;
        this.flashOverlay = null;

        this.initVisuals();
        this.initDOM();
    }

    initVisuals() {
        const toriiGroup = new THREE.Group();
        toriiGroup.name = 'ToriiWarpNetwork';

        // Materials
        const pillarMat = new THREE.MeshStandardMaterial({
            color: 0xcc2200, // Japanese Vermillion Red
            roughness: 0.35,
            metalness: 0.15
        });

        const blackLacqueredMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.2,
            metalness: 0.4
        });

        const neonGlowMat = new THREE.MeshBasicMaterial({
            color: 0xda7756, // Claude Signature Terracotta
            wireframe: false
        });

        TORII_DESTINATIONS.forEach((dest) => {
            const shrineRoot = new THREE.Group();
            shrineRoot.userData = { destination: dest };

            // Sample terrain height with 3-point plinth grounding per Argon spec
            const getH = (x, z) => {
                if (!this.terrain) return 0;
                if (typeof this.terrain.getTerrainHeight === 'function') return this.terrain.getTerrainHeight(x, z);
                if (typeof this.terrain.getHeightAt === 'function') return this.terrain.getHeightAt(x, z);
                return 0;
            };

            const rotY = dest.rotY || 0;
            shrineRoot.rotation.y = rotY;
            const r = 1.8;
            const yC = getH(dest.pos.x, dest.pos.z);
            const yL = getH(dest.pos.x - r * Math.cos(rotY), dest.pos.z + r * Math.sin(rotY));
            const yR = getH(dest.pos.x + r * Math.cos(rotY), dest.pos.z - r * Math.sin(rotY));
            const groundY = (yC + yL + yR) / 3;

            shrineRoot.position.set(dest.pos.x, groundY, dest.pos.z);

            // 1. Two Main Pillars
            const pillarGeo = new THREE.CylinderGeometry(0.22, 0.26, 4.2, 12);
            const pillarLeft = new THREE.Mesh(pillarGeo, pillarMat);
            pillarLeft.position.set(-1.8, 2.1, 0);
            pillarLeft.castShadow = true;
            shrineRoot.add(pillarLeft);

            const pillarRight = new THREE.Mesh(pillarGeo, pillarMat);
            pillarRight.position.set(1.8, 2.1, 0);
            pillarRight.castShadow = true;
            shrineRoot.add(pillarRight);

            // Pillar Bases (Extended Black stone plinths to prevent air gaps on slopes)
            const baseHeight = 0.8;
            const baseGeo = new THREE.CylinderGeometry(0.35, 0.40, baseHeight, 12);
            baseGeo.translate(0, baseHeight / 2 - 0.35, 0);
            const baseLeft = new THREE.Mesh(baseGeo, blackLacqueredMat);
            baseLeft.position.set(-1.8, 0.2, 0);
            shrineRoot.add(baseLeft);

            const baseRight = new THREE.Mesh(baseGeo, blackLacqueredMat);
            baseRight.position.set(1.8, 0.2, 0);
            shrineRoot.add(baseRight);

            // 2. Horizontal Beams (Kasagi & Shimaki)
            const topBeamGeo = new THREE.BoxGeometry(4.8, 0.32, 0.45);
            const topBeam = new THREE.Mesh(topBeamGeo, pillarMat);
            topBeam.position.set(0, 4.1, 0);
            topBeam.castShadow = true;
            shrineRoot.add(topBeam);

            // Curved Cap Roof Lintel (Black lacquered top)
            const capGeo = new THREE.BoxGeometry(5.1, 0.14, 0.52);
            const capMesh = new THREE.Mesh(capGeo, blackLacqueredMat);
            capMesh.position.set(0, 4.3, 0);
            shrineRoot.add(capMesh);

            // Tie-Beam (Nuki) - Underneath top beam; keep castShadow false for shadow budget compliance
            const tieBeamGeo = new THREE.BoxGeometry(4.2, 0.22, 0.28);
            const tieBeam = new THREE.Mesh(tieBeamGeo, pillarMat);
            tieBeam.position.set(0, 3.3, 0);
            tieBeam.castShadow = false;
            shrineRoot.add(tieBeam);

            // 3. Central Glowing Cyber Tablet / Crest
            const tabletGeo = new THREE.BoxGeometry(0.6, 0.8, 0.08);
            const tabletMesh = new THREE.Mesh(tabletGeo, blackLacqueredMat);
            tabletMesh.position.set(0, 3.7, 0);
            shrineRoot.add(tabletMesh);

            const ringGeo = new THREE.TorusGeometry(0.18, 0.03, 8, 16);
            const ringMesh = new THREE.Mesh(ringGeo, neonGlowMat);
            ringMesh.position.set(0, 3.7, 0.05);
            shrineRoot.add(ringMesh);

            // 4. Ground Teleportation Ring (Pedestal)
            const groundRingGeo = new THREE.RingGeometry(1.6, 1.9, 24);
            groundRingGeo.rotateX(-Math.PI / 2);
            const groundRingMat = new THREE.MeshBasicMaterial({
                color: 0xda7756,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.6
            });
            const groundRing = new THREE.Mesh(groundRingGeo, groundRingMat);
            groundRing.position.set(0, 0.05, 0);
            shrineRoot.add(groundRing);

            // 5. Light Source
            const shrineLight = new THREE.PointLight(0xd49746, 1.5, 12, 1.8);
            shrineLight.position.set(0, 2.5, 0);
            shrineRoot.add(shrineLight);

            // 6. Ethereal Particles Beacon
            const particleCount = 28;
            const particleGeo = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3 + 0] = (Math.random() - 0.5) * 2.8;
                positions[i * 3 + 1] = Math.random() * 4.5;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
            }
            particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            const particleMat = new THREE.PointsMaterial({
                color: 0xda7756,
                size: 0.12,
                transparent: true,
                opacity: 0.75,
                blending: THREE.AdditiveBlending
            });
            const particles = new THREE.Points(particleGeo, particleMat);
            particles.userData = { speeds: new Float32Array(particleCount).map(() => 0.4 + Math.random() * 0.6) };
            shrineRoot.add(particles);

            toriiGroup.add(shrineRoot);
            this.shrines.push({
                root: shrineRoot,
                destination: dest,
                particles,
                groundRing,
                light: shrineLight,
                groundY
            });
        });

        this.scene.add(toriiGroup);
        this.group = toriiGroup;

        // 120 FPS Static Matrix Freezing: Disable matrix updates for static Torii gate geometry
        toriiGroup.traverse(child => {
            if (child.isMesh) {
                child.matrixAutoUpdate = false;
                child.updateMatrix();
            }
        });
    }

    initDOM() {
        // Flash overlay for warp visual feedback
        if (!document.getElementById('torii-warp-flash')) {
            const flash = document.createElement('div');
            flash.id = 'torii-warp-flash';
            flash.style.cssText = `
                position: fixed; inset: 0; z-index: 99998;
                background: radial-gradient(circle, rgba(0, 240, 255, 0.8) 0%, rgba(255, 255, 255, 0.95) 40%, rgba(24, 24, 26, 0.8) 100%);
                opacity: 0; pointer-events: none;
                transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            `;
            document.body.appendChild(flash);
            this.flashOverlay = flash;
        }

        // Warp Modal
        if (!document.getElementById('modal-torii-warp')) {
            const modalHTML = `
                <div id="modal-torii-warp" class="cyber-modal-overlay hidden">
                    <div class="cyber-modal-card torii-warp-card">
                        <div class="modal-header">
                            <span class="modal-title"><span class="tt-icon tt-icon-20" data-icon="orbit"></span> Fast-Travel Spatial Warp Network</span>
                            <button id="btn-close-torii-modal" class="modal-close-btn" title="Close"><span class="tt-icon tt-icon-16" data-icon="x"></span></button>
                        </div>
                        <div class="torii-warp-body">
                            <div class="torii-warp-subtitle">
                                Select a Torii Waystone destination to warp instantaneously across the archipelago.
                            </div>
                            <div class="torii-dest-grid" id="torii-destinations-list">
                                <!-- Dynamic Destinations -->
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button id="btn-cancel-torii-modal" class="cyber-btn-outline">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Add styles for the warp card
            const style = document.createElement('style');
            style.textContent = `
                .torii-warp-card {
                    max-width: 680px; width: 92vw;
                    background: rgba(24, 24, 26, 0.96) !important;
                    border: 1.5px solid rgba(0, 240, 255, 0.4) !important;
                    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8), 0 0 24px rgba(0, 240, 255, 0.2) !important;
                    border-radius: 14px;
                }
                .torii-warp-body {
                    padding: 18px 22px;
                    display: flex; flex-direction: column; gap: 14px;
                }
                .torii-warp-subtitle {
                    font-size: 0.84rem; color: #a39e93;
                }
                .torii-dest-grid {
                    display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 12px; margin-top: 6px;
                }
                .torii-dest-card {
                    display: flex; align-items: center; gap: 14px;
                    background: rgba(33, 32, 29, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px; padding: 12px 14px;
                    cursor: pointer; text-align: left;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .torii-dest-card:hover {
                    background: rgba(0, 240, 255, 0.14);
                    border-color: #00f0ff;
                    box-shadow: 0 0 16px rgba(0, 240, 255, 0.25);
                    transform: translateY(-2px);
                }
                .torii-dest-card.current {
                    opacity: 0.55; cursor: not-allowed;
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .torii-dest-icon {
                    width: 36px; height: 36px; min-width: 36px; min-height: 36px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .torii-dest-icon .tt-icon,
                .torii-dest-icon svg {
                    width: 24px !important; height: 24px !important; max-width: 24px !important; max-height: 24px !important;
                }
                .torii-dest-info {
                    display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1;
                }
                .torii-dest-title {
                    font-size: 0.92rem; font-weight: 700; color: #edeae3;
                }
                .torii-dest-desc {
                    font-size: 0.72rem; color: #a39e93; line-height: 1.25;
                }
                .torii-dest-badge {
                    display: inline-flex; align-items: center; gap: 5px;
                    font-size: 0.65rem; color: #00f0ff; font-weight: 600; text-transform: uppercase;
                    margin-top: 2px;
                }
                .torii-dest-badge .tt-icon,
                .torii-dest-badge svg {
                    width: 12px !important; height: 12px !important; max-width: 12px !important; max-height: 12px !important;
                    flex-shrink: 0;
                }
            `;
            document.head.appendChild(style);

            // Bind modal buttons
            document.getElementById('btn-close-torii-modal')?.addEventListener('click', () => this.closeWarpModal());
            document.getElementById('btn-cancel-torii-modal')?.addEventListener('click', () => this.closeWarpModal());
        }
    }

    update(delta, playerPos) {
        if (!playerPos) return;

        // Animate particles & pulsing rings
        const time = performance.now() * 0.001;
        this.shrines.forEach((shrine) => {
            if (shrine.groundRing) {
                shrine.groundRing.rotation.z += delta * 0.4;
                shrine.groundRing.material.opacity = 0.4 + Math.sin(time * 2.5) * 0.2;
            }

            if (shrine.particles) {
                const positions = shrine.particles.geometry.attributes.position.array;
                const speeds = shrine.particles.userData.speeds;
                for (let i = 0; i < speeds.length; i++) {
                    positions[i * 3 + 1] += speeds[i] * delta;
                    if (positions[i * 3 + 1] > 4.5) {
                        positions[i * 3 + 1] = 0.1;
                    }
                }
                shrine.particles.geometry.attributes.position.needsUpdate = true;
            }
        });

        // Proximity detection for interaction
        let closest = null;
        let closestDist = 999;
        this.shrines.forEach((shrine) => {
            const dx = playerPos.x - shrine.destination.pos.x;
            const dz = playerPos.z - shrine.destination.pos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < 3.5 && dist < closestDist) {
                closest = shrine;
                closestDist = dist;
            }
        });

        this.nearbyShrine = closest;
    }

    getNearbyPrompt() {
        if (!this.nearbyShrine) return null;
        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';
        const name = isVi ? this.nearbyShrine.destination.vi : this.nearbyShrine.destination.title;
        return {
            text: isVi ? `[E] Cổng Dịch Chuyển — ${name}` : `[E] Fast-Travel Warp — ${name}`,
            action: () => this.openWarpModal()
        };
    }

    openWarpModal() {
        const modal = document.getElementById('modal-torii-warp');
        const list = document.getElementById('torii-destinations-list');
        if (!modal || !list) return;

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';

        list.innerHTML = '';
        TORII_DESTINATIONS.forEach((dest) => {
            const isCurrent = this.nearbyShrine && this.nearbyShrine.destination.id === dest.id;
            const title = isVi ? dest.vi : dest.title;
            const desc = isVi ? dest.descVi : dest.desc;

            const iconHtml = window.TeleTermIcons
                ? window.TeleTermIcons.render(dest.icon, { size: 24, className: 'tt-icon-accent' })
                : `<span class="tt-icon tt-icon-24 tt-icon-accent" data-icon="${dest.icon}"></span>`;

            const badgeIcon = isCurrent
                ? (window.TeleTermIcons ? window.TeleTermIcons.render('map', { size: 12 }) : '')
                : (window.TeleTermIcons ? window.TeleTermIcons.render('zap', { size: 12, className: 'tt-icon-accent' }) : '');
            const badgeText = isCurrent
                ? (isVi ? 'Vị trí hiện tại (Current Location)' : 'Current Location')
                : (isVi ? 'Nhấp để dịch chuyển' : 'Click to warp');

            const card = document.createElement('div');
            card.className = `torii-dest-card ${isCurrent ? 'current' : ''}`;
            card.innerHTML = `
                <div class="torii-dest-icon">${iconHtml}</div>
                <div class="torii-dest-info">
                    <div class="torii-dest-title">${title}</div>
                    <div class="torii-dest-desc">${desc}</div>
                    <span class="torii-dest-badge">${badgeIcon} <span>${badgeText}</span></span>
                </div>
            `;

            if (!isCurrent) {
                card.addEventListener('click', () => {
                    this.executeWarp(dest);
                    this.closeWarpModal();
                });
            }

            list.appendChild(card);
        });

        if (window.TeleTermIcons) {
            window.TeleTermIcons.hydrate(modal);
        }

        modal.classList.remove('hidden');
    }

    closeWarpModal() {
        const modal = document.getElementById('modal-torii-warp');
        if (modal) modal.classList.add('hidden');
    }

    executeWarp(destination) {
        if (this.isWarping || !destination) return;
        this.isWarping = true;

        // Play warp chord audio
        this.playWarpSound();

        // 1. Flash effect
        if (this.flashOverlay) {
            this.flashOverlay.style.opacity = '1';
        }

        // 2. Camera FOV Punch
        const origFov = window.openWorld3D?.camera?.fov || 75;
        if (window.openWorld3D?.camera) {
            window.openWorld3D.camera.fov = Math.min(100, origFov + 18);
            window.openWorld3D.camera.updateProjectionMatrix();
        }

        setTimeout(() => {
            // Calculate target position with forward offset
            const targetX = destination.pos.x + (destination.spawnOffset?.x || 0);
            const targetZ = destination.pos.z + (destination.spawnOffset?.z || 2.5);
            const targetY = this.terrain && typeof this.terrain.getHeightAt === 'function'
                ? this.terrain.getHeightAt(targetX, targetZ)
                : 0;

            // Teleport Player
            if (this.onWarp) {
                this.onWarp({ x: targetX, y: targetY, z: targetZ });
            } else if (window.openWorld3D?.player) {
                window.openWorld3D.player.position.set(targetX, targetY, targetZ);
            }

            // Sync with multiplayer room manager
            if (window.teletermNetwork?.sendPlayerMove) {
                window.teletermNetwork.sendPlayerMove({ x: targetX, y: targetY, z: targetZ });
            }

            // Toast feedback
            const i18n = window.TeleTermI18n;
            const isVi = i18n && i18n.getLanguage() === 'vi';
            const toastMsg = isVi ? `Đã dịch chuyển thành công đến ${name}!` : `Warped successfully to ${name}!`;
            this.onToast(toastMsg, 'success');

            // Fade out flash overlay
            if (this.flashOverlay) {
                this.flashOverlay.style.opacity = '0';
            }

            // Restore Camera FOV smoothly
            let elapsed = 0;
            const restoreInterval = setInterval(() => {
                elapsed += 0.05;
                if (window.openWorld3D?.camera) {
                    const current = window.openWorld3D.camera.fov;
                    window.openWorld3D.camera.fov = THREE.MathUtils.lerp(current, origFov, 0.25);
                    window.openWorld3D.camera.updateProjectionMatrix();
                }
                if (elapsed >= 0.5) {
                    clearInterval(restoreInterval);
                    if (window.openWorld3D?.camera) {
                        window.openWorld3D.camera.fov = origFov;
                        window.openWorld3D.camera.updateProjectionMatrix();
                    }
                    this.isWarping = false;
                }
            }, 30);
        }, 320);
    }

    playWarpSound() {
        try {
            const ctx = window.AudioContext || window.webkitAudioContext;
            if (!ctx) return;
            const audioCtx = window._teletermAudioCtx || new ctx();
            window._teletermAudioCtx = audioCtx;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.35);

            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.46);
        } catch (e) {
            // Audio context not ready
        }
    }
}
