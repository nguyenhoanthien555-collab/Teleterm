/**
 * TeleTerm 3D Cyber Engine
 * High-performance WebGL & Three.js 3D Visualizer & Holographic Command Deck
 * Crafted for TeleTerm with real-time system telemetry reactivity.
 */

(function (window) {
    'use strict';

    class TeleTerm3DEngine {
        constructor() {
            this.initialized = false;
            this.threeLoaded = false;
            this.bgEnabled = true;
            this.deckOpen = false;
            
            // Telemetry state
            this.metrics = { cpu: 12, ram: 45, disk: 60, battery: 100 };
            this.targetCpu = 12;
            this.targetRam = 45;
            
            // Mouse / Touch tracking
            this.pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
            this.isDragging = false;
            this.prevPointer = { x: 0, y: 0 };
            
            // Three.js instances for Background
            this.bgScene = null;
            this.bgCamera = null;
            this.bgRenderer = null;
            this.bgGrid = null;
            this.bgParticles = null;
            this.bgCanvas = null;

            // Three.js instances for 3D Deck
            this.deckScene = null;
            this.deckCamera = null;
            this.deckRenderer = null;
            this.deckCore = null;
            this.deckInnerSphere = null;
            this.deckRings = [];
            this.deckNodes = [];
            this.deckParticles = null;
            this.deckCanvas = null;
            this.raycaster = null;
            this.mouseVector = null;
            this.deckOrbitAngle = { x: 0.2, y: 0 };
            this.deckTargetOrbit = { x: 0.2, y: 0 };
            this.deckZoom = 1;
            
            // Animation frames
            this.bgAnimId = null;
            this.deckAnimId = null;
            this.clock = null;
        }

        /**
         * Initialize the 3D Engine
         */
        async init() {
            if (this.initialized) return;
            
            // Ensure Three.js is loaded
            await this.ensureThreeJs();
            if (!window.THREE) {
                console.warn('[TeleTerm 3D] Three.js not available, falling back to CSS 3D only.');
                this.initCardTilt();
                return;
            }

            this.clock = new THREE.Clock();
            this.raycaster = new THREE.Raycaster();
            this.mouseVector = new THREE.Vector2();

            // Setup Ambient 3D Background
            this.initBackgroundScene();

            // Setup 3D Holographic Command Deck
            this.initDeckScene();

            // Setup 3D Card Tilt interactions
            this.initCardTilt();

            // Listen to pointer events
            this.bindEvents();

            this.initialized = true;
            console.log('[TeleTerm 3D] Cyber 3D Engine initialized successfully!');
        }

        /**
         * Load Three.js if not already present
         */
        ensureThreeJs() {
            return new Promise((resolve) => {
                if (window.THREE) {
                    this.threeLoaded = true;
                    return resolve();
                }

                // Check if already in DOM
                const existing = document.querySelector('script[data-threejs]');
                if (existing) {
                    existing.addEventListener('load', () => {
                        this.threeLoaded = true;
                        resolve();
                    });
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
                script.async = true;
                script.setAttribute('data-threejs', 'true');
                script.onload = () => {
                    this.threeLoaded = true;
                    resolve();
                };
                script.onerror = () => {
                    console.warn('[TeleTerm 3D] Failed to load Three.js from CDN. Using lightweight procedural canvas fallback.');
                    resolve();
                };
                document.head.appendChild(script);
            });
        }

        /**
         * ==========================================
         * 1. AMBIENT 3D BACKGROUND (CYBER GRID & NEBULA)
         * ==========================================
         */
        initBackgroundScene() {
            this.bgCanvas = document.getElementById('teleterm-3d-bg');
            if (!this.bgCanvas) {
                this.bgCanvas = document.createElement('canvas');
                this.bgCanvas.id = 'teleterm-3d-bg';
                this.bgCanvas.className = 'teleterm-3d-background';
                document.body.prepend(this.bgCanvas);
            }

            const width = window.innerWidth;
            const height = window.innerHeight;

            this.bgScene = new THREE.Scene();
            this.bgScene.fog = new THREE.FogExp2(0x06070a, 0.0018);

            this.bgCamera = new THREE.PerspectiveCamera(65, width / height, 1, 2000);
            this.bgCamera.position.set(0, 140, 420);
            this.bgCamera.lookAt(0, 0, -200);

            this.bgRenderer = new THREE.WebGLRenderer({
                canvas: this.bgCanvas,
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance'
            });
            this.bgRenderer.setSize(width, height);
            this.bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Perspective Cyber Grid Plane
            const gridHelper = new THREE.GridHelper(2400, 60, 0x00f0ff, 0x1e293b);
            gridHelper.position.y = -60;
            gridHelper.material.opacity = 0.35;
            gridHelper.material.transparent = true;
            this.bgGrid = gridHelper;
            this.bgScene.add(gridHelper);

            // Floating Ambient Cyber Dust / Starfield
            const particleCount = 450;
            const geom = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);

            const colorOptions = [
                new THREE.Color(0x00f0ff), // Cyan
                new THREE.Color(0x8b5cf6), // Violet
                new THREE.Color(0x10b981), // Emerald
                new THREE.Color(0x38bdf8)  // Sky
            ];

            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] = (Math.random() - 0.5) * 1600;
                positions[i * 3 + 1] = Math.random() * 500 - 40;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 1600;

                const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
                colors[i * 3] = c.r;
                colors[i * 3 + 1] = c.g;
                colors[i * 3 + 2] = c.b;
            }

            geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const mat = new THREE.PointsMaterial({
                size: 3.5,
                vertexColors: true,
                transparent: true,
                opacity: 0.75,
                blending: THREE.AdditiveBlending
            });

            this.bgParticles = new THREE.Points(geom, mat);
            this.bgScene.add(this.bgParticles);

            // Start ambient render loop
            this.renderBackground();
        }

        renderBackground() {
            if (!this.bgRenderer || !this.bgScene) return;

            const animate = () => {
                this.bgAnimId = requestAnimationFrame(animate);

                if (!this.bgEnabled || document.hidden) return;

                const time = this.clock.getElapsedTime();

                // Smooth pointer parallax
                this.pointer.x += (this.pointer.targetX - this.pointer.x) * 0.05;
                this.pointer.y += (this.pointer.targetY - this.pointer.y) * 0.05;

                // Move grid toward camera to create endless forward motion
                if (this.bgGrid) {
                    this.bgGrid.position.z = (time * 40) % 40;
                    this.bgCamera.position.x = this.pointer.x * 60;
                    this.bgCamera.position.y = 140 - this.pointer.y * 30;
                    this.bgCamera.lookAt(0, 0, -200);
                }

                // Slow particle drift
                if (this.bgParticles) {
                    this.bgParticles.rotation.y = time * 0.03;
                }

                this.bgRenderer.render(this.bgScene, this.bgCamera);
            };

            animate();
        }

        /**
         * ==========================================
         * 2. HOLOGRAPHIC 3D COMMAND DECK MODAL
         * ==========================================
         */
        initDeckScene() {
            this.deckCanvas = document.getElementById('teleterm-3d-deck-canvas');
            if (!this.deckCanvas) return;

            const width = this.deckCanvas.clientWidth || 600;
            const height = this.deckCanvas.clientHeight || 500;

            this.deckScene = new THREE.Scene();
            this.deckCamera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
            this.deckCamera.position.set(0, 30, 240);
            this.deckCamera.lookAt(0, 0, 0);

            this.deckRenderer = new THREE.WebGLRenderer({
                canvas: this.deckCanvas,
                alpha: true,
                antialias: true
            });
            this.deckRenderer.setSize(width, height);
            this.deckRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            this.deckScene.add(ambientLight);

            const pointLight = new THREE.PointLight(0x00f0ff, 2.5, 300);
            pointLight.position.set(0, 0, 0);
            this.deckScene.add(pointLight);
            this.deckCoreLight = pointLight;

            // 1. Quantum Core: Outer Wireframe Polyhedron
            const coreGeometry = new THREE.IcosahedronGeometry(36, 1);
            const coreMaterial = new THREE.MeshBasicMaterial({
                color: 0x00f0ff,
                wireframe: true,
                transparent: true,
                opacity: 0.85
            });
            this.deckCore = new THREE.Mesh(coreGeometry, coreMaterial);
            this.deckScene.add(this.deckCore);

            // 2. Quantum Core: Inner Energy Sphere
            const innerGeom = new THREE.SphereGeometry(22, 32, 32);
            const innerMat = new THREE.MeshStandardMaterial({
                color: 0x00f0ff,
                emissive: 0x00f0ff,
                emissiveIntensity: 0.9,
                roughness: 0.2,
                metalness: 0.8,
                transparent: true,
                opacity: 0.9
            });
            this.deckInnerSphere = new THREE.Mesh(innerGeom, innerMat);
            this.deckScene.add(this.deckInnerSphere);

            // 3. Gyroscopic Gimbal Rings (X, Y, Z)
            const ringColors = [0x38bdf8, 0x8b5cf6, 0x10b981];
            const radii = [48, 56, 64];

            this.deckRings = [];
            for (let i = 0; i < 3; i++) {
                const ringGeom = new THREE.TorusGeometry(radii[i], 1.2, 16, 100);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: ringColors[i],
                    transparent: true,
                    opacity: 0.75
                });
                const ring = new THREE.Mesh(ringGeom, ringMat);
                ring.rotation.x = Math.PI / (i + 1.5);
                ring.rotation.y = Math.PI / (i + 2);
                this.deckScene.add(ring);
                this.deckRings.push(ring);
            }

            // 4. Interactive Orbital System Nodes
            this.createOrbitalNodes();

            // 5. Data Flow Particle Field
            this.createDeckDataStream();

            // Start Deck rendering
            this.renderDeck();
        }

        createOrbitalNodes() {
            const nodeSpecs = [
                { id: 'view-terminal', label: 'Terminal PTY', color: 0x38bdf8, icon: 'terminal', angle: 0, radius: 95 },
                { id: 'view-codex', label: 'Codex AI', color: 0xa855f7, icon: 'zap', angle: (Math.PI * 2) / 5, radius: 95 },
                { id: 'view-antigravity', label: 'Antigravity', color: 0x10b981, icon: 'orbit', angle: (Math.PI * 4) / 5, radius: 95 },
                { id: 'view-accounts', label: 'Accounts & IAM', color: 0xf59e0b, icon: 'users', angle: (Math.PI * 6) / 5, radius: 95 },
                { id: 'view-system', label: 'Hardware HUD', color: 0xef4444, icon: 'cpu', angle: (Math.PI * 8) / 5, radius: 95 }
            ];

            this.deckNodes = [];

            nodeSpecs.forEach((spec) => {
                const group = new THREE.Group();

                // Glowing Node Sphere
                const sphereGeom = new THREE.SphereGeometry(8, 24, 24);
                const sphereMat = new THREE.MeshStandardMaterial({
                    color: spec.color,
                    emissive: spec.color,
                    emissiveIntensity: 0.8,
                    roughness: 0.3,
                    metalness: 0.7
                });
                const sphere = new THREE.Mesh(sphereGeom, sphereMat);
                sphere.userData = { spec: spec };
                group.add(sphere);

                // Wireframe halo
                const haloGeom = new THREE.TorusGeometry(12, 0.6, 8, 32);
                const haloMat = new THREE.MeshBasicMaterial({ color: spec.color, transparent: true, opacity: 0.6 });
                const halo = new THREE.Mesh(haloGeom, haloMat);
                group.add(halo);

                // Position on orbital circle
                group.position.x = Math.cos(spec.angle) * spec.radius;
                group.position.z = Math.sin(spec.angle) * spec.radius;
                group.position.y = (Math.sin(spec.angle * 2) * 15);

                this.deckScene.add(group);
                this.deckNodes.push({ group, sphere, halo, spec, baseAngle: spec.angle, radius: spec.radius });
            });
        }

        createDeckDataStream() {
            const count = 300;
            const geom = new THREE.BufferGeometry();
            const pos = new Float32Array(count * 3);

            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = 25 + Math.random() * 85;
                pos[i * 3] = Math.cos(angle) * r;
                pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
                pos[i * 3 + 2] = Math.sin(angle) * r;
            }

            geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            const mat = new THREE.PointsMaterial({
                size: 2.2,
                color: 0x00f0ff,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

            this.deckParticles = new THREE.Points(geom, mat);
            this.deckScene.add(this.deckParticles);
        }

        renderDeck() {
            if (!this.deckRenderer || !this.deckScene) return;

            const animate = () => {
                this.deckAnimId = requestAnimationFrame(animate);

                if (!this.deckOpen || document.hidden) return;

                const time = this.clock.getElapsedTime();

                // Telemetry interpolation
                this.metrics.cpu += (this.targetCpu - this.metrics.cpu) * 0.05;
                this.metrics.ram += (this.targetRam - this.metrics.ram) * 0.05;

                // Rotation speed reacts dynamically to CPU load!
                const speedMult = 1 + (this.metrics.cpu / 35);

                // Orbit rotation with user drag damping
                this.deckOrbitAngle.x += (this.deckTargetOrbit.x - this.deckOrbitAngle.x) * 0.08;
                this.deckOrbitAngle.y += (this.deckTargetOrbit.y - this.deckOrbitAngle.y) * 0.08;

                this.deckScene.rotation.y = this.deckOrbitAngle.y + (time * 0.15 * speedMult);
                this.deckScene.rotation.x = this.deckOrbitAngle.x;

                // Quantum Core pulse
                if (this.deckCore) {
                    this.deckCore.rotation.x = time * 0.4 * speedMult;
                    this.deckCore.rotation.y = time * 0.6 * speedMult;
                    const scale = 1 + Math.sin(time * 3 * speedMult) * 0.06;
                    this.deckCore.scale.set(scale, scale, scale);
                }

                // Inner core breathing
                if (this.deckInnerSphere) {
                    const innerScale = 1 + Math.sin(time * 5 * speedMult) * 0.1;
                    this.deckInnerSphere.scale.set(innerScale, innerScale, innerScale);

                    // Dynamic color shift based on CPU temperature
                    let coreColor = 0x00f0ff;
                    if (this.metrics.cpu > 70) {
                        coreColor = 0xef4444; // Red/Hot
                    } else if (this.metrics.cpu > 40) {
                        coreColor = 0xf59e0b; // Amber/Warm
                    }
                    this.deckInnerSphere.material.color.setHex(coreColor);
                    this.deckInnerSphere.material.emissive.setHex(coreColor);
                    if (this.deckCoreLight) this.deckCoreLight.color.setHex(coreColor);
                }

                // Gyro rings counter-rotation
                this.deckRings.forEach((ring, i) => {
                    const dir = (i % 2 === 0) ? 1 : -1;
                    ring.rotation.z += 0.008 * dir * speedMult;
                    ring.rotation.x += 0.005 * dir * speedMult;
                });

                // Orbiting system nodes
                this.deckNodes.forEach((node, i) => {
                    const currentAngle = node.baseAngle + (time * 0.2);
                    node.group.position.x = Math.cos(currentAngle) * node.radius;
                    node.group.position.z = Math.sin(currentAngle) * node.radius;
                    node.group.position.y = Math.sin(time * 2 + i) * 12;

                    node.halo.rotation.x += 0.03;
                    node.halo.rotation.y += 0.02;
                });

                // Particle stream
                if (this.deckParticles) {
                    this.deckParticles.rotation.y = -time * 0.25 * speedMult;
                }

                this.deckRenderer.render(this.deckScene, this.deckCamera);
            };

            animate();
        }

        /**
         * ==========================================
         * 3. REALTIME TELEMETRY & DATA PULSE
         * ==========================================
         */
        updateTelemetry(data) {
            if (!data) return;
            if (data.cpu !== undefined) this.targetCpu = Number(data.cpu) || 10;
            if (data.ram !== undefined) this.targetRam = Number(data.ram) || 40;
            if (data.disk !== undefined) this.metrics.disk = data.disk;
            if (data.battery !== undefined) this.metrics.battery = data.battery;

            // Update 3D Deck HUD DOM text if open
            const cpuEl = document.getElementById('deck-3d-cpu-val');
            const ramEl = document.getElementById('deck-3d-ram-val');
            if (cpuEl) cpuEl.textContent = `${Math.round(this.targetCpu)}%`;
            if (ramEl) ramEl.textContent = `${Math.round(this.targetRam)}%`;
        }

        /**
         * Trigger visual burst when terminal packet / command arrives
         */
        triggerDataPulse(type = 'pty') {
            if (!this.deckScene) return;

            // Flash inner sphere light
            if (this.deckCoreLight) {
                this.deckCoreLight.intensity = 5.0;
                setTimeout(() => {
                    if (this.deckCoreLight) this.deckCoreLight.intensity = 2.5;
                }, 180);
            }

            // Also ripple ambient background grid
            if (this.bgGrid) {
                this.bgGrid.material.opacity = 0.7;
                setTimeout(() => {
                    if (this.bgGrid) this.bgGrid.material.opacity = 0.35;
                }, 220);
            }
        }

        /**
         * ==========================================
         * 4. 3D CARD PERSPECTIVE TILT (CSS 3D Engine)
         * ==========================================
         */
        initCardTilt() {
            const tiltSelector = '.glass-card-3d, .tilt-card, .modal-card, .sheet-grid-btn, .top-terminal-pill';
            
            document.addEventListener('mousemove', (e) => {
                const target = e.target.closest(tiltSelector);
                if (!target) return;

                const rect = target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;

                target.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`;
                target.style.transition = 'transform 0.08s ease-out';

                // Specular light sheen
                const sheenPercentX = ((x / rect.width) * 100).toFixed(1);
                const sheenPercentY = ((y / rect.height) * 100).toFixed(1);
                target.style.background = `radial-gradient(circle at ${sheenPercentX}% ${sheenPercentY}%, rgba(255, 255, 255, 0.12) 0%, rgba(14, 20, 33, 0.7) 70%)`;
            });

            document.addEventListener('mouseout', (e) => {
                const target = e.target.closest(tiltSelector);
                if (!target) return;

                target.style.transform = '';
                target.style.transition = 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), background 0.35s ease';
                target.style.background = '';
            });
        }

        /**
         * ==========================================
         * 5. EVENT BINDING & INTERACTIVITY
         * ==========================================
         */
        bindEvents() {
            // Window resize handling
            window.addEventListener('resize', () => {
                const w = window.innerWidth;
                const h = window.innerHeight;

                if (this.bgCamera && this.bgRenderer) {
                    this.bgCamera.aspect = w / h;
                    this.bgCamera.updateProjectionMatrix();
                    this.bgRenderer.setSize(w, h);
                }

                if (this.deckCamera && this.deckRenderer && this.deckCanvas) {
                    const dw = this.deckCanvas.clientWidth || 600;
                    const dh = this.deckCanvas.clientHeight || 500;
                    this.deckCamera.aspect = dw / dh;
                    this.deckCamera.updateProjectionMatrix();
                    this.deckRenderer.setSize(dw, dh);
                }
            });

            // Parallax mouse movement for ambient background
            window.addEventListener('mousemove', (e) => {
                this.pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
                this.pointer.targetY = (e.clientY / window.innerHeight) * 2 - 1;
            });

            // Gyroscope / Device orientation on mobile
            if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', (e) => {
                    if (e.gamma !== null && e.beta !== null) {
                        this.pointer.targetX = Math.max(-1, Math.min(1, e.gamma / 30));
                        this.pointer.targetY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
                    }
                }, { passive: true });
            }

            // 3D Deck Canvas Orbit Dragging
            if (this.deckCanvas) {
                const onStart = (clientX, clientY) => {
                    this.isDragging = true;
                    this.prevPointer = { x: clientX, y: clientY };
                };

                const onMove = (clientX, clientY) => {
                    if (!this.isDragging) return;
                    const dx = clientX - this.prevPointer.x;
                    const dy = clientY - this.prevPointer.y;
                    this.deckTargetOrbit.y += dx * 0.012;
                    this.deckTargetOrbit.x = Math.max(-0.8, Math.min(0.8, this.deckTargetOrbit.x + dy * 0.012));
                    this.prevPointer = { x: clientX, y: clientY };
                };

                const onEnd = () => {
                    this.isDragging = false;
                };

                this.deckCanvas.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
                window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
                window.addEventListener('mouseup', onEnd);

                this.deckCanvas.addEventListener('touchstart', (e) => {
                    if (e.touches.length === 1) onStart(e.touches[0].clientX, e.touches[0].clientY);
                }, { passive: true });
                window.addEventListener('touchmove', (e) => {
                    if (e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY);
                }, { passive: true });
                window.addEventListener('touchend', onEnd);

                // Raycasting on Node Click
                this.deckCanvas.addEventListener('click', (e) => {
                    const rect = this.deckCanvas.getBoundingClientRect();
                    this.mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                    this.mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

                    this.raycaster.setFromCamera(this.mouseVector, this.deckCamera);
                    const intersects = this.raycaster.intersectObjects(this.deckScene.children, true);

                    if (intersects.length > 0) {
                        let clickedMesh = intersects[0].object;
                        while (clickedMesh && !clickedMesh.userData?.spec && clickedMesh.parent) {
                            clickedMesh = clickedMesh.parent;
                        }

                        if (clickedMesh?.userData?.spec) {
                            const spec = clickedMesh.userData.spec;
                            this.onNodeActivated(spec);
                        }
                    }
                });
            }
        }

        onNodeActivated(spec) {
            console.log('[TeleTerm 3D] Node activated:', spec.id);
            this.triggerDataPulse();

            // Close 3D deck and switch view in app
            this.closeDeck();

            // Trigger app view switch if app function exists
            if (window.switchAppView) {
                window.switchAppView(spec.id);
            } else {
                const navBtn = document.querySelector(`.nav-tab[data-view="${spec.id}"]`);
                if (navBtn) navBtn.click();
            }
        }

        openDeck() {
            const modal = document.getElementById('modal-3d-deck');
            if (!modal) return;
            document.body.classList.add('modal-open');
            modal.classList.remove('hidden');
            this.deckOpen = true;

            // Resize deck canvas immediately
            setTimeout(() => {
                if (this.deckCanvas && this.deckCamera && this.deckRenderer) {
                    const dw = this.deckCanvas.clientWidth || 600;
                    const dh = this.deckCanvas.clientHeight || 500;
                    this.deckCamera.aspect = dw / dh;
                    this.deckCamera.updateProjectionMatrix();
                    this.deckRenderer.setSize(dw, dh);
                }
            }, 60);
        }

        closeDeck() {
            const modal = document.getElementById('modal-3d-deck');
            if (modal) modal.classList.add('hidden');
            document.body.classList.remove('modal-open');
            this.deckOpen = false;
        }

        toggleBackground(enable) {
            this.bgEnabled = (enable !== undefined) ? enable : !this.bgEnabled;
            if (this.bgCanvas) {
                this.bgCanvas.style.display = this.bgEnabled ? 'block' : 'none';
            }
            return this.bgEnabled;
        }
    }

    // Attach to global window
    window.teleterm3D = new TeleTerm3DEngine();

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.teleterm3D.init());
    } else {
        window.teleterm3D.init();
    }

})(window);
