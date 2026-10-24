import * as THREE from '/vendor/three/build/three.module.js';

/**
 * TELETERM 3D — GROUP EMOTE SYNCHRONIZATION (VIBE HARMONY ENGINE)
 * Mandated by Argon Architecture Spec:
 * 1. Global Master Sync Clock: `masterSyncTime = (performance.now() / 1000) % clipDuration`.
 *    Ensures multiple avatars dancing VibeDance lock into the exact same phase down to the millisecond.
 * 2. Spatial Sync Ring Effect: Generates an anime neon floor ring under synchronizing dancers.
 * 3. Combo Reward Toast: Grants "Vibe Harmony +50 XP" when player joins a group dance session.
 */

export class GroupEmoteSyncManager {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.activeDancers = new Set(); // { id, retargeter, position, isNpc }
        this.syncRadius = options.syncRadius || 7.5;
        this.clipDuration = 2.0; // 2-second looped VibeDance cadence

        // Floor particle ring mesh
        this.ringMesh = null;
        this._initSyncRingMesh();

        // Combo reward state
        this.hasAwardedComboThisSession = false;
        this.activeGroupCount = 0;

        if (typeof window !== 'undefined') {
            window.groupEmoteSyncManager = this;
        }
    }

    _initSyncRingMesh() {
        if (!this.scene) return;

        const geom = new THREE.RingGeometry(1.8, 2.0, 32);
        geom.rotateX(-Math.PI / 2);

        const mat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.0,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.ringMesh = new THREE.Mesh(geom, mat);
        this.ringMesh.position.set(0, -999, 0);
        this.scene.add(this.ringMesh);
    }

    registerDancer(id, retargeter, getPosFn, isNpc = false) {
        this.activeDancers.add({ id, retargeter, getPosFn, isNpc });
    }

    unregisterDancer(id) {
        for (const dancer of this.activeDancers) {
            if (dancer.id === id) {
                this.activeDancers.delete(dancer);
                break;
            }
        }
    }

    update(delta, playerPos, playerRetargeter) {
        const nowSec = performance.now() * 0.001;
        const masterSyncPhase = (nowSec % this.clipDuration) / this.clipDuration; // 0.0 -> 1.0

        // Find all avatars currently dancing VibeDance
        const dancingAvatars = [];

        // Check player
        const isPlayerDancing = playerRetargeter && playerRetargeter.currentAnimName === 'VibeDance';
        if (isPlayerDancing && playerPos) {
            dancingAvatars.push({
                id: 'player',
                pos: playerPos,
                retargeter: playerRetargeter,
                isNpc: false
            });
        }

        // Check registered NPCs
        for (const d of this.activeDancers) {
            if (d.retargeter && d.retargeter.currentAnimName === 'VibeDance') {
                const pos = typeof d.getPosFn === 'function' ? d.getPosFn() : null;
                if (pos) {
                    dancingAvatars.push({
                        id: d.id,
                        pos,
                        retargeter: d.retargeter,
                        isNpc: true
                    });
                }
            }
        }

        this.activeGroupCount = dancingAvatars.length;

        // Group Dance Detection (2 or more avatars dancing in proximity)
        let groupCenter = null;
        let syncedCount = 0;

        if (dancingAvatars.length >= 2) {
            // Find centroid
            let cx = 0, cy = 0, cz = 0;
            for (const a of dancingAvatars) {
                cx += a.pos.x;
                cy += a.pos.y;
                cz += a.pos.z;
            }
            cx /= dancingAvatars.length;
            cy /= dancingAvatars.length;
            cz /= dancingAvatars.length;

            groupCenter = new THREE.Vector3(cx, cy, cz);

            // Phase-lock all avatars to the master sync phase
            for (const a of dancingAvatars) {
                if (a.pos.distanceTo(groupCenter) <= this.syncRadius) {
                    syncedCount++;
                    if (a.retargeter) {
                        a.retargeter.phaseLockEmoteTime = masterSyncPhase * this.clipDuration;
                    }
                }
            }

            // Award Vibe Harmony XP once per session if player is in the group
            if (isPlayerDancing && syncedCount >= 2 && !this.hasAwardedComboThisSession) {
                this.hasAwardedComboThisSession = true;
                this._awardHarmonyBonus(syncedCount);
            }
        } else if (dancingAvatars.length === 0) {
            this.hasAwardedComboThisSession = false;
        }

        // Update Floor Sync Ring
        if (this.ringMesh) {
            if (syncedCount >= 2 && groupCenter) {
                this.ringMesh.position.set(groupCenter.x, groupCenter.y + 0.05, groupCenter.z);
                this.ringMesh.rotation.y += delta * 1.5;
                if (this.isRainbowAura) {
                    this.ringMesh.material.color.setHSL((nowSec * 0.4) % 1.0, 0.9, 0.55);
                }
                const pulseScale = 1.0 + Math.sin(nowSec * 5.0) * 0.15;
                this.ringMesh.scale.set(pulseScale * (syncedCount * 0.9), pulseScale * (syncedCount * 0.9), 1.0);
                this.ringMesh.material.opacity = Math.min(0.85, this.ringMesh.material.opacity + delta * 3.0);
            } else {
                this.ringMesh.material.opacity = Math.max(0.0, this.ringMesh.material.opacity - delta * 4.0);
                if (this.ringMesh.material.opacity <= 0.01) {
                    this.ringMesh.position.set(0, -999, 0);
                }
            }
        }
    }

    _awardHarmonyBonus(count) {
        if (typeof window !== 'undefined') {
            // Toast notification
            const toast = document.createElement('div');
            toast.className = 'vibe-harmony-toast';
            const sparkleSvg = window.TeleTermIcons ? window.TeleTermIcons.render('sparkles', { size: 20 }) : '';
            toast.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="display:flex; align-items:center; color:#00f0ff;">${sparkleSvg}</span>
                    <div>
                        <div style="font-weight:bold; color:#00f0ff; letter-spacing:0.5px;">VIBE HARMONY COMBO!</div>
                        <div style="font-size:11px; color:#edeae3; opacity:0.85;">Đồng điệu vũ đạo nhóm (${count} người) • +50 XP</div>
                    </div>
                </div>
            `;
            Object.assign(toast.style, {
                position: 'fixed',
                top: '72px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(24, 24, 26, 0.92)',
                border: '1px solid rgba(0, 240, 255, 0.45)',
                borderRadius: '8px',
                padding: '10px 18px',
                color: '#edeae3',
                fontFamily: 'system-ui, sans-serif',
                boxShadow: '0 4px 20px rgba(0, 240, 255, 0.45)',
                zIndex: '9999',
                pointerEvents: 'none',
                transition: 'opacity 0.5s ease, transform 0.5s ease',
                opacity: '0'
            });

            document.body.appendChild(toast);
            requestAnimationFrame(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(-50%) translateY(4px)';
            });

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-50%) translateY(-10px)';
                setTimeout(() => toast.remove(), 600);
            }, 3500);

            // Add player XP if player state system available
            if (window.playerState && typeof window.playerState.addXp === 'function') {
                window.playerState.addXp(50);
            }
        }
    }

    setAuraColor(color) {
        this.auraColor = color;
        if (!this.ringMesh || !this.ringMesh.material) return;
        if (color === 'rainbow') {
            this.isRainbowAura = true;
        } else {
            this.isRainbowAura = false;
            this.ringMesh.material.color.set(color || 0x00f0ff);
        }
    }
}
