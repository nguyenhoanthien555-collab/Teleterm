import * as THREE from 'three';

/**
 * TELETERM 3D — IN-WORLD CYBER PHOTO BILLBOARD & CO-OP GALLERY SCREEN
 * Displays shared snapshots from connected players in the Developer Hub plaza (17.5, 0, -16.0).
 * Features:
 * - 3D Cyber Billboard with illuminated bezel and hologram banner
 * - Listens to WebSocket 'photo_billboard_update' packets
 * - Strict VRAM leak protection: disposes previous textures before rebinding
 * - Default stylish cyber aesthetic preview when no photo has been shared
 */

export class InworldPhotoBillboard {
    constructor(scene, terrainSystem = null) {
        this.scene = scene;
        this.terrain = terrainSystem;
        const bx = 18.5;
        const bz = -17.2;
        const by = (this.terrain && typeof this.terrain.getTerrainHeight === 'function')
            ? this.terrain.getTerrainHeight(bx, bz)
            : 0.85;
        this.position = new THREE.Vector3(bx, by, bz);
        this.currentTexture = null;

        this.group = new THREE.Group();
        this.group.position.copy(this.position);

        this.buildPhysicalBillboard();
        this.setDefaultScreen();

        this.scene.add(this.group);

        if (typeof window !== 'undefined') {
            window.inworldPhotoBillboard = this;
            window.addEventListener('teleterm:photo_shared', (e) => {
                if (e.detail && e.detail.photoDataUrl) {
                    this.updatePhoto(e.detail.photoDataUrl, e.detail.caption || 'Shared Photo');
                }
            });
        }
    }

    buildPhysicalBillboard() {
        // 1. Concrete Heavy Base
        const baseGeo = new THREE.BoxGeometry(3.4, 0.25, 0.8);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x21201d, roughness: 0.8, metalness: 0.2 });
        const baseMesh = new THREE.Mesh(baseGeo, baseMat);
        baseMesh.position.y = 0.125;
        this.group.add(baseMesh);

        // 2. Dual Support Pillars
        const pillarGeo = new THREE.BoxGeometry(0.2, 2.0, 0.3);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x282724, roughness: 0.4, metalness: 0.7 });
        const p1 = new THREE.Mesh(pillarGeo, pillarMat);
        p1.position.set(-1.2, 1.125, 0);
        const p2 = new THREE.Mesh(pillarGeo, pillarMat);
        p2.position.set(1.2, 1.125, 0);
        this.group.add(p1);
        this.group.add(p2);

        // 3. Display Screen Frame
        const frameGeo = new THREE.BoxGeometry(3.0, 1.8, 0.15);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.3, metalness: 0.8 });
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        frameMesh.position.set(0, 2.6, 0);
        this.group.add(frameMesh);

        // Warm Terracotta Trim Ring
        const trimGeo = new THREE.BoxGeometry(3.08, 1.88, 0.08);
        const trimMat = new THREE.MeshBasicMaterial({ color: 0xda7756 });
        const trimMesh = new THREE.Mesh(trimGeo, trimMat);
        trimMesh.position.set(0, 2.6, -0.01);
        this.group.add(trimMesh);

        // 4. Main Photo Canvas Screen
        const screenGeo = new THREE.PlaneGeometry(2.8, 1.6);
        this.screenMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: false
        });
        this.screenMesh = new THREE.Mesh(screenGeo, this.screenMat);
        this.screenMesh.position.set(0, 2.6, 0.08);
        this.group.add(this.screenMesh);

        // 5. Header Hologram Banner
        const bannerCanvas = document.createElement('canvas');
        bannerCanvas.width = 512;
        bannerCanvas.height = 96;
        const bCtx = bannerCanvas.getContext('2d');
        bCtx.fillStyle = '#da7756';
        bCtx.font = 'bold 30px "Plus Jakarta Sans", "Segoe UI", sans-serif';
        bCtx.textAlign = 'center';
        bCtx.fillText('TELETERM PHOTO SHOWCASE', 256, 56);

        const bannerTex = new THREE.CanvasTexture(bannerCanvas);
        const bannerMat = new THREE.SpriteMaterial({ map: bannerTex, transparent: true });
        const bannerSprite = new THREE.Sprite(bannerMat);
        bannerSprite.position.set(0, 3.8, 0);
        bannerSprite.scale.set(2.4, 0.45, 1);
        this.group.add(bannerSprite);
    }

    setDefaultScreen() {
        const c = document.createElement('canvas');
        c.width = 720;
        c.height = 405;
        const ctx = c.getContext('2d');

        // Claude Warm Obsidian background
        const grad = ctx.createLinearGradient(0, 0, 720, 405);
        grad.addColorStop(0, '#21201d');
        grad.addColorStop(1, '#18181a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 720, 405);

        // Subtle warm grid
        ctx.strokeStyle = 'rgba(218, 119, 86, 0.12)';
        ctx.lineWidth = 1.5;
        for (let x = 0; x < 720; x += 45) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 405); ctx.stroke();
        }
        for (let y = 0; y < 405; y += 45) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(720, y); ctx.stroke();
        }

        ctx.fillStyle = '#da7756';
        ctx.font = 'bold 34px "Plus Jakarta Sans", "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('TELETERM 3D GALLERY', 360, 180);

        ctx.fillStyle = '#a39e93';
        ctx.font = '18px "Plus Jakarta Sans", "Segoe UI", sans-serif';
        ctx.fillText('Chụp ảnh trong Studio [O] & Chia sẻ lên đây!', 360, 230);

        const tex = new THREE.CanvasTexture(c);
        this.applyTexture(tex);
    }

    updatePhoto(dataUrl, caption = '') {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 360;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 640, 360);

            // Watermark footer
            ctx.fillStyle = 'rgba(24, 24, 26, 0.90)';
            ctx.fillRect(0, 310, 640, 50);
            ctx.fillStyle = '#da7756';
            ctx.font = 'bold 18px "Plus Jakarta Sans", "Segoe UI", sans-serif';
            ctx.fillText(caption || 'Shared by Player', 20, 342);

            const newTex = new THREE.CanvasTexture(canvas);
            newTex.minFilter = THREE.LinearFilter;
            newTex.magFilter = THREE.LinearFilter;
            this.applyTexture(newTex);
        };
        img.src = dataUrl;
    }

    applyTexture(newTexture) {
        // CRITICAL VRAM LEAK PREVENTION: Dispose previous texture before replacing
        if (this.currentTexture) {
            this.currentTexture.dispose();
        }
        this.currentTexture = newTexture;
        this.screenMat.map = newTexture;
        this.screenMat.needsUpdate = true;
    }

    dispose() {
        if (this.currentTexture) {
            this.currentTexture.dispose();
        }
        if (this.group) {
            this.scene.remove(this.group);
        }
    }
}
