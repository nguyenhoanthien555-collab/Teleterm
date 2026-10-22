import * as THREE from 'three';

/**
 * DISTANT MOUNTAIN BACKDROP & 3D ALPINE FOOTHILLS CRAGS SYSTEM (V5 MASTERWORK)
 * Authentic Japanese Anime Countryside Panoramic Vista (Shinkai / KyoAni Style)
 * Colossal Alpine Peaks, Mount Fuji Silhouette, Misty Blue Ridges,
 * and Physical 3D Midground Rock Massifs anchoring the mountain ridgeline.
 */
export class MountainSystem {
    constructor(scene, terrainSystem = null) {
        this.scene = scene;
        this.terrain = terrainSystem;
        this.mountainMesh = null;
        this.cragsGroup = null;
    }

    build() {
        const width = 2048;
        const height = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, width, height);

        // Crisp Angular Mountain Drawer (Preserves majestic anime peak silhouettes & cliffs!)
        const drawMountainMassif = (points, fillStyle, strokeStyle = null, strokeW = 1.5) => {
            // Fill polygon down to bottom
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fillStyle = fillStyle;
            ctx.fill();

            // Stroke ONLY the upper ridgeline (Never stroke texture borders!)
            if (strokeStyle) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.strokeStyle = strokeStyle;
                ctx.lineWidth = strokeW;
                ctx.stroke();
            }
        };

        // --- Gemini 4 Argon Directive: Southern Ocean Opening Mask ---
        // x in [0, 2048] where x = 0 and x = 2048 represent True South (+Z), x = 1024 is True North (-Z)
        const getSouthernOceanOpeningMask = (x) => {
            const distFromSouth = Math.min(x, width - x);
            const openRadius = 340;
            const transitionEnd = 520;
            if (distFromSouth <= openRadius) return 0.0;
            if (distFromSouth >= transitionEnd) return 1.0;
            const t = (distFromSouth - openRadius) / (transitionEnd - openRadius);
            return t * t * (3.0 - 2.0 * t);
        };

        const applyOceanOpening = (pts) => {
            return pts.map(p => {
                const mask = getSouthernOceanOpeningMask(p.x);
                return {
                    x: p.x,
                    y: height - (height - p.y) * mask
                };
            });
        };

        // --- LAYER 1: Colossal Snow-Capped Alpine Massif (Dãy Núi Tuyết Hùng Vĩ) ---
        // Facing -Z at x: 1024 directly in the player's view
        const rawFarPoints = [
            { x: 0,    y: 540 },
            { x: 120,  y: 490 },
            { x: 260,  y: 420 },
            { x: 340,  y: 380 },
            { x: 420,  y: 300 },
            { x: 480,  y: 240 },  // Western High Horn Peak
            { x: 560,  y: 330 },
            { x: 680,  y: 390 },
            { x: 790,  y: 280 },  // Western Sentinel Peak
            { x: 880,  y: 340 },
            { x: 940,  y: 220 },  // West Ridge Shoulder
            { x: 980,  y: 160 },
            { x: 1024, y: 95 },   // GRAND CENTRAL SUMMIT (Mount Fuji / Northern Alps Massif)
            { x: 1068, y: 160 },
            { x: 1110, y: 220 },  // East Ridge Shoulder
            { x: 1180, y: 330 },
            { x: 1260, y: 270 },  // Eastern Sentinel Peak
            { x: 1380, y: 380 },
            { x: 1480, y: 310 },
            { x: 1568, y: 250 },  // Eastern High Horn Peak
            { x: 1628, y: 300 },
            { x: 1708, y: 380 },
            { x: 1780, y: 440 },
            { x: 1880, y: 490 },
            { x: 2048, y: 540 }
        ];
        const farPoints = applyOceanOpening(rawFarPoints);

        const farGrad = ctx.createLinearGradient(0, 95, 0, 800);
        farGrad.addColorStop(0.0, '#1c3659'); // Deep majestic anime navy
        farGrad.addColorStop(0.35, '#284c78'); // Rich alpine indigo
        farGrad.addColorStop(0.70, '#537ea8'); // Atmospheric blue
        farGrad.addColorStop(1.0, '#9cc3e6');
        drawMountainMassif(farPoints, farGrad, 'rgba(255, 255, 255, 0.65)', 2.0);

        // Sunlit Snow Caps & Cel-Shaded Glacial Facets
        ctx.save();
        // Grand Central Summit Snowcap (Brilliant Stark White with Soft Sky-Blue Shadow Facets)
        ctx.beginPath();
        ctx.moveTo(880, 310);
        ctx.lineTo(950, 220);
        ctx.lineTo(980, 160);
        ctx.lineTo(1024, 95);  // High Crest
        ctx.lineTo(1068, 160);
        ctx.lineTo(1100, 220);
        ctx.lineTo(1160, 310);
        ctx.lineTo(1120, 280);
        ctx.lineTo(1080, 330);
        ctx.lineTo(1050, 290);
        ctx.lineTo(1024, 340);
        ctx.lineTo(990, 280);
        ctx.lineTo(960, 320);
        ctx.lineTo(920, 275);
        ctx.closePath();
        const snowGradC = ctx.createLinearGradient(1024, 95, 1024, 340);
        snowGradC.addColorStop(0.0, '#ffffff');
        snowGradC.addColorStop(0.60, '#f0f7ff');
        snowGradC.addColorStop(1.0, 'rgba(215, 235, 255, 0.35)');
        ctx.fillStyle = snowGradC;
        ctx.fill();

        // Shaded Left Snow Facet (Cel-shaded glacial couloir)
        ctx.beginPath();
        ctx.moveTo(980, 160);
        ctx.lineTo(1024, 95);
        ctx.lineTo(1024, 340);
        ctx.lineTo(990, 280);
        ctx.lineTo(960, 320);
        ctx.lineTo(950, 220);
        ctx.closePath();
        ctx.fillStyle = 'rgba(180, 210, 245, 0.42)';
        ctx.fill();

        // Western High Horn Snowcap
        ctx.beginPath();
        ctx.moveTo(410, 330);
        ctx.lineTo(480, 240);
        ctx.lineTo(540, 330);
        ctx.lineTo(500, 305);
        ctx.lineTo(480, 325);
        ctx.lineTo(450, 295);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Eastern High Horn Snowcap
        ctx.beginPath();
        ctx.moveTo(1510, 330);
        ctx.lineTo(1580, 250);
        ctx.lineTo(1650, 330);
        ctx.lineTo(1620, 305);
        ctx.lineTo(1580, 325);
        ctx.lineTo(1540, 295);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.restore();

        // --- LAYER 2: Rolling Indigo/Blue Mountain Ridges (Dãy Sườn Núi Lam Chiều) ---
        const rawMidPoints = [
            { x: 0,    y: 630 },
            { x: 160,  y: 560 },
            { x: 340,  y: 470 },
            { x: 440,  y: 420 },
            { x: 490,  y: 390 },
            { x: 640,  y: 470 },
            { x: 780,  y: 370 },
            { x: 920,  y: 430 },
            { x: 1024, y: 380 },  // Saddle below Grand Summit
            { x: 1140, y: 350 },
            { x: 1280, y: 420 },
            { x: 1440, y: 360 },
            { x: 1558, y: 420 },
            { x: 1658, y: 470 },
            { x: 1780, y: 530 },
            { x: 1920, y: 580 },
            { x: 2048, y: 630 }
        ];
        const midPoints = applyOceanOpening(rawMidPoints);
        const midGrad = ctx.createLinearGradient(0, 350, 0, 850);
        midGrad.addColorStop(0.0, '#1c4266');
        midGrad.addColorStop(0.5, '#2e5f8f');
        midGrad.addColorStop(1.0, '#6495c2');
        drawMountainMassif(midPoints, midGrad, 'rgba(255, 255, 255, 0.35)', 1.5);

        // --- LAYER 3: Verdant Forested Foothills (Đồi Thông & Rừng Bách Xanh) ---
        const rawNearPoints = [
            { x: 0,    y: 720 },
            { x: 160,  y: 660 },
            { x: 340,  y: 580 },
            { x: 440,  y: 550 },
            { x: 520,  y: 530 },
            { x: 710,  y: 570 },
            { x: 880,  y: 500 },
            { x: 1024, y: 530 },
            { x: 1160, y: 490 },
            { x: 1340, y: 540 },
            { x: 1520, y: 510 },
            { x: 1608, y: 550 },
            { x: 1708, y: 600 },
            { x: 1890, y: 670 },
            { x: 2048, y: 720 }
        ];
        const nearPoints = applyOceanOpening(rawNearPoints);
        const nearGrad = ctx.createLinearGradient(0, 490, 0, 920);
        nearGrad.addColorStop(0.0, '#163e2c'); // Deep cypress evergreen
        nearGrad.addColorStop(0.5, '#23573e');
        nearGrad.addColorStop(1.0, '#3f8260');
        drawMountainMassif(nearPoints, nearGrad, 'rgba(187, 247, 208, 0.3)', 1.2);

        // Crisp Micro Pine Tree Silhouettes along foothill ridgeline (culled in southern ocean opening)
        ctx.fillStyle = '#102e21';
        for (let i = 0; i < nearPoints.length - 1; i++) {
            const p0 = nearPoints[i];
            const p1 = nearPoints[i + 1];
            const steps = 10;
            for (let s = 0; s < steps; s++) {
                const px = p0.x + (p1.x - p0.x) * (s / steps);
                const py = p0.y + (p1.y - p0.y) * (s / steps);
                if (getSouthernOceanOpeningMask(px) < 0.05) continue;
                const treeH = 7 + Math.sin(s * 3.7 + i) * 3.5;
                ctx.beginPath();
                ctx.moveTo(px - 3.5, py + 2);
                ctx.lineTo(px, py - treeH);
                ctx.lineTo(px + 3.5, py + 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        // --- LAYER 4: Soft Horizon Valley Mist (Lớp Sương Mai Chân Núi) ---
        const mist = ctx.createLinearGradient(0, 720, 0, height);
        mist.addColorStop(0.0, 'rgba(208, 230, 248, 0)');
        mist.addColorStop(0.45, 'rgba(208, 230, 248, 0.55)');
        mist.addColorStop(1.0, 'rgba(208, 230, 248, 0.95)');
        ctx.fillStyle = mist;
        ctx.fillRect(0, 720, width, height - 720);

        // Clear Southern Ocean quadrant in Layer 4 so open ocean has 0% mist obstruction per Argon spec
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        for (let x = 0; x < width; x++) {
            const mask = getSouthernOceanOpeningMask(x);
            if (mask < 1.0) {
                const clearFactor = 1.0 - mask;
                ctx.fillStyle = `rgba(0, 0, 0, ${clearFactor})`;
                ctx.fillRect(x, 0, 1, height);
            }
        }
        ctx.restore();

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;

        // Panoramic Cylinder: Radius 210m, Height 88m, Position y: 26m, 128 segments for silky smooth curvature
        // At rotation.y = 0, u = 0.50 directly towers in True North (-Z), and u = 0.0/1.0 is True South (+Z ocean opening)
        const cylGeo = new THREE.CylinderGeometry(210, 210, 88, 128, 1, true);

        const cylMat = new THREE.MeshBasicMaterial({
            map: tex,
            side: THREE.DoubleSide,
            transparent: true,
            alphaTest: 0.01,
            depthWrite: false,
            fog: false // Never washed out by distance fog!
        });

        this.mountainMesh = new THREE.Mesh(cylGeo, cylMat);
        this.mountainMesh.position.set(0, 26, 0);
        this.mountainMesh.rotation.y = 0.0;
        this.scene.add(this.mountainMesh);

        // 2. Physical 3D Midground Alpine Crags & Rock Massifs (Argon Phase 3 Spec)
        if (this.terrain) {
            this.buildMidgroundAlpineCrags();
        }
    }

    buildMidgroundAlpineCrags() {
        const cragGroup = new THREE.Group();
        cragGroup.name = 'AlpineMidgroundCrags';

        // Alpine Granite Cliff Material with PBR roughness and subtle moss/strata
        const graniteMat = new THREE.MeshStandardMaterial({
            color: 0x5a544c,
            roughness: 0.88,
            metalness: 0.05
        });

        const snowCapMat = new THREE.MeshStandardMaterial({
            color: 0xe2e8f0,
            roughness: 0.45,
            metalness: 0.08
        });

        // 16 Major Alpine Massifs along the northern ridgeline z in [-78, -44]
        const cragSpines = [
            // Eastern Alpine Horn Massif (x: 20 to 38, z: -68 to -52)
            { x: 26.0, z: -62.0, scale: new THREE.Vector3(7.5, 9.2, 6.5), rotY: 0.35 },
            { x: 32.0, z: -58.0, scale: new THREE.Vector3(6.8, 8.4, 5.8), rotY: -0.22 },
            { x: 21.0, z: -55.0, scale: new THREE.Vector3(5.5, 6.8, 5.2), rotY: 0.78 },
            { x: 38.0, z: -64.0, scale: new THREE.Vector3(8.2, 11.0, 7.0), rotY: 0.15 },

            // Western Alpine Sentinel Massif (x: -38 to -18, z: -68 to -52)
            { x: -25.0, z: -62.0, scale: new THREE.Vector3(7.2, 8.8, 6.4), rotY: -0.42 },
            { x: -32.0, z: -58.0, scale: new THREE.Vector3(6.5, 8.2, 5.6), rotY: 0.31 },
            { x: -19.0, z: -54.0, scale: new THREE.Vector3(5.4, 6.5, 4.8), rotY: -0.65 },
            { x: -37.0, z: -65.0, scale: new THREE.Vector3(8.0, 10.5, 7.2), rotY: -0.18 },

            // Central Alpine Pass & Overlook Shoulders (x: -12 to 14, z: -74 to -60)
            { x: -8.0, z: -68.0, scale: new THREE.Vector3(6.2, 7.5, 5.5), rotY: 0.52 },
            { x: 9.0, z: -68.0, scale: new THREE.Vector3(6.2, 7.5, 5.5), rotY: -0.45 },
            { x: -2.0, z: -72.0, scale: new THREE.Vector3(5.8, 7.0, 5.0), rotY: 0.12 },
            { x: 5.0, z: -74.0, scale: new THREE.Vector3(6.5, 8.0, 5.2), rotY: 0.88 },

            // Foreground Rocky Bluffs overlooking the Valley (z: -46 to -40)
            { x: 16.0, z: -44.0, scale: new THREE.Vector3(4.2, 4.8, 3.8), rotY: 0.28 },
            { x: -14.0, z: -44.0, scale: new THREE.Vector3(4.0, 4.6, 3.6), rotY: -0.35 },
            { x: 42.0, z: -48.0, scale: new THREE.Vector3(5.2, 6.2, 4.5), rotY: 0.65 },
            { x: -42.0, z: -48.0, scale: new THREE.Vector3(5.0, 6.0, 4.2), rotY: -0.55 }
        ];

        cragSpines.forEach(c => {
            const gy = this.terrain ? this.terrain.getTerrainHeight(c.x, c.z) : 6.0;
            const cragMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 1), graniteMat);
            cragMesh.position.set(c.x, gy + c.scale.y * 0.42, c.z);
            cragMesh.scale.copy(c.scale);
            cragMesh.rotation.set(0.12, c.rotY, -0.08);
            cragMesh.castShadow = false; // Distant alpine mountain crags (z: -120 to -180m) do not cast dynamic shadow
            cragMesh.receiveShadow = true;
            cragMesh.matrixAutoUpdate = false;
            cragMesh.updateMatrix();
            cragGroup.add(cragMesh);

            // Snow-dusted cap for crags above 9.0m elevation
            if (gy + c.scale.y * 0.85 > 9.0) {
                const cap = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.45, 6), snowCapMat);
                cap.position.set(c.x, gy + c.scale.y * 0.88, c.z);
                cap.scale.set(c.scale.x * 0.85, c.scale.y * 0.35, c.scale.z * 0.85);
                cap.rotation.y = c.rotY;
                cap.castShadow = false;
                cap.matrixAutoUpdate = false;
                cap.updateMatrix();
                cragGroup.add(cap);
            }
        });

        cragGroup.matrixAutoUpdate = false;
        cragGroup.updateMatrix();
        this.scene.add(cragGroup);
        this.cragsGroup = cragGroup;
    }
}

