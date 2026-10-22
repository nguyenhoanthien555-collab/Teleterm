import * as THREE from 'three';
import { AtmosphereSystem } from './atmosphere-system.js?v=36';
import { TimeOfDaySystem } from './time-of-day-system.js?v=36';
import { MountainSystem } from './mountain-system.js?v=36';
import { TerrainSystem } from './terrain-system.js?v=36';
import { WaterSystem } from './water-system.js?v=36';
import { RiceFieldSystem } from './rice-field-system.js?v=36';
import { RiverSystem } from './river-system.js?v=36';
import { BeachSystem } from './beach-system.js?v=36';
import { PathSystem } from './path-system.js?v=36';
import { TreeSystem } from './tree-system.js?v=36';
import { BambooForestSystem } from './bamboo-forest-system.js?v=36';
import { MapleForestSystem } from './maple-forest-system.js?v=36';
import { PineForestSystem } from './pine-forest-system.js?v=36';
import { VegetationSystem } from './vegetation-system.js?v=36';
import { LandmarksSystem } from './landmarks-system.js?v=36';
import { WeatherSystem } from './weather-system.js?v=36';
import { WorldRegionSystem } from './world-region-system.js?v=36';
import { TerrainStreamManager } from './terrain-streaming.js?v=36';
import { AmbientWorldAudioSystem } from './ambient-world-audio.js?v=36';
import { ZenPondSystem } from './zen-pond-system.js?v=37';
import { WildlifeSystem } from './wildlife-system.js?v=37';
import { ToriiWarpSystem } from './torii-warp-system.js?v=38';
import { BambooOnsenSystem } from './bamboo-onsen-system.js?v=40';
import { CampfireSocialSystem } from './campfire-social-system.js?v=41';
import { ModularDeskDecorSystem } from './modular-desk-decor-system.js?v=42';
import { worldContext } from './world-context.js?v=36';

/**
 * WORLD COMPOSITION ORCHESTRATOR (MASTER SPEC V3 ENGINE)
 * Coordinates all environmental systems into an explorable, living anime metaverse.
 */
export class WorldComposition {
    constructor(scene) {
        this.scene = scene;

        // Subsystems
        this.timeOfDay = new TimeOfDaySystem(scene);
        this.timeOfDaySystem = this.timeOfDay;
        this.atmosphere = new AtmosphereSystem(scene);
        this.atmosphereSystem = this.atmosphere;
        this.terrain = new TerrainSystem(scene);
        this.terrainSystem = this.terrain;
        this.mountains = new MountainSystem(scene, this.terrain);
        this.mountainSystem = this.mountains;
        this.water = new WaterSystem(scene);
        this.waterSystem = this.water;
        this.riceFields = new RiceFieldSystem(scene, this.water, this.terrain);
        this.riceFieldSystem = this.riceFields;
        this.river = new RiverSystem(scene, this.terrain, this.water);
        this.riverSystem = this.river;
        this.beach = new BeachSystem(scene, this.terrain, this.water);
        this.beachSystem = this.beach;
        this.path = new PathSystem(scene, this.terrain);
        this.pathSystem = this.path;
        this.trees = new TreeSystem(scene, this.terrain);
        this.treeSystem = this.trees;
        this.bambooForest = new BambooForestSystem(scene, this.terrain);
        this.mapleForest = new MapleForestSystem(scene, this.terrain, this.water);
        this.pineForest = new PineForestSystem(scene, this.terrain);
        this.landmarks = new LandmarksSystem(scene, this.terrain);
        this.landmarksSystem = this.landmarks;
        this.weather = new WeatherSystem(scene);
        this.weatherSystem = this.weather;
        this.regions = new WorldRegionSystem();
        this.streaming = new TerrainStreamManager();
        this.ambientAudio = new AmbientWorldAudioSystem();
        this.zenPond = new ZenPondSystem(scene, this.terrain, this.water);
        this.wildlife = new WildlifeSystem(scene, this.terrain, this.ambientAudio);
        this.toriiWarp = new ToriiWarpSystem(scene, this.terrain, {
            onToast: (msg, type) => window.openWorld3D?.onToast?.(msg, type),
            onWarp: (targetPos) => {
                if (window.openWorld3D?.player) {
                    window.openWorld3D.player.position.set(targetPos.x, targetPos.y, targetPos.z);
                }
            }
        });
        this.toriiWarpSystem = this.toriiWarp;
        this.bambooOnsen = new BambooOnsenSystem(scene, this.terrain, {
            onToast: (msg, type) => window.openWorld3D?.onToast?.(msg, type),
            onReward: (reward) => {
                if (window.openWorld3D?.addXp && reward.xp) {
                    window.openWorld3D.addXp(reward.xp, reward.reason);
                }
            }
        });
        this.bambooOnsenSystem = this.bambooOnsen;
        this.campfireSocial = new CampfireSocialSystem(scene, this.terrain, this.landmarks?.interactionManager, {
            onToast: (msg, type) => window.openWorld3D?.onToast?.(msg, type),
            onReward: (reward) => {
                if (window.openWorld3D?.addXp && reward.xp) {
                    window.openWorld3D.addXp(reward.xp, reward.reason);
                }
            }
        });
        this.campfireSocialSystem = this.campfireSocial;
        this.deskDecor = new ModularDeskDecorSystem(scene, {
            onToast: (msg, type) => window.openWorld3D?.onToast?.(msg, type),
            onReward: (reward) => {
                if (window.openWorld3D?.addXp && reward.xp) {
                    window.openWorld3D.addXp(reward.xp, reward.reason);
                }
            }
        });
        this.deskDecorSystem = this.deskDecor;
        this.vegetation = null;

        worldContext.bind(this);

        if (typeof window !== 'undefined') {
            window.timeOfDaySystem = this.timeOfDay;
        }

        // Ambient Drifting Sakura Petals
        this.petals = null;
        this.startTime = performance.now();
    }

    buildAll() {
        // Pass 01: Atmosphere, Lighting & Depth Fog
        this.atmosphere.build();

        // Pass 02: Alpine Mountain Backdrop
        this.mountains.build();

        // Pass 03: Continuous Organic Topography
        this.terrain.build();

        // Pass 04: Terraced Rice Paddies & Concrete Drainage Flumes
        this.riceFields.build();

        // Pass 05: Meandering River Valley, Arched Bridge & Stepping Stones
        this.river.build();

        // Pass 05b: Zen Koi Pond, Cascading Waterfall & Water Lilies
        if (this.zenPond) this.zenPond.build();

        // Pass 06: Coastal Beach Dunes, Wet Sand & Wooden Fishing Pier
        this.beach.build();

        // Pass 07: Interconnected Country Road & Hilltop Trail Network
        this.path.build();

        // Pass 08: Blooming Cherry Blossom Avenue & Hillside Canopies
        this.trees.build();

        // Pass 08b: Bamboo Meditation Forest (Northwest: 120+ Instanced bamboo & falling leaves)
        this.bambooForest.build();

        // Pass 08bb: Arashiyama Onsen Retreat (Northwest: Hot spring basin, Taiko-bashi, steam particles, tray)
        if (this.bambooOnsen) this.bambooOnsen.build();

        // Pass 08bbb: Lakeside Campfire Social & Synchronized Lofi Radio (North river terrace)
        if (this.campfireSocial) {
            if (!this.campfireSocial.interactionManager && window.openWorld3D?.interactionManager) {
                this.campfireSocial.interactionManager = window.openWorld3D.interactionManager;
            }
            this.campfireSocial.build();
        }

        // Pass 08c: Autumn Maple Valley (Northeast: 80+ Instanced maples, stream & falling leaves)
        this.mapleForest.build();

        // Pass 08d: Alpine Pine Woods & Mountain Trail (Far North: 70+ Instanced conical pines & rocks)
        this.pineForest.build();

        // Pass 09: Delicate Wildflowers & Organic Grass Tufts
        this.vegetation = new VegetationSystem(this.scene, this.terrain, this.path.pathCurve);
        this.vegetation.build();

        // Pass 10: Environmental Landmarks: Hub Co-working Deck, Notice Board, Vending Machine, Telescope
        this.landmarks.build();

        // Pass 10b: Modular Desk Decor & Personal Focus Zones (Hub coding desks)
        if (this.deskDecor) {
            this.deskDecor.build();
        }

        // Pass 11: Drifting Sakura Petals Simulation
        this.buildFloatingPetals();

        // Pass 11b: Living Wildlife Ecosystem (Flocking Birds, Perching Birds & Diurnal Insects)
        if (this.wildlife) this.wildlife.build();

        // Pass 12: Hook World Weather to Verification Engine state
        if (typeof window !== 'undefined') {
            window.addEventListener('teleterm:verification-status', (e) => {
                if (e.detail?.status) this.setVerificationStatus(e.detail.status);
            });
            window.teletermSetVerificationStatus = (status) => this.setVerificationStatus(status);

            // Synchronize with initial verification state on world load
            fetch('/api/ade/verify/last')
                .then(r => r.json())
                .then(data => {
                    if (data.success && data.result?.status) {
                        this.setVerificationStatus(data.result.status);
                    }
                })
                .catch(() => {});
        }

        // Pass 13: GPU Offload & Static Matrix Freeze (Zero CPU matrix recomputation bottleneck)
        this.optimizeStaticMeshesForGpu();
    }

    optimizeStaticMeshesForGpu() {
        let frozenMeshes = 0;
        let frozenGroups = 0;
        let instancedOptimized = 0;
        let prunedShadowCasters = 0;

        this.scene.traverse((obj) => {
            const isDynamic = obj.userData?.isDynamic || obj.userData?.isAvatar || obj.userData?.isNpc;
            if (isDynamic || obj.isCamera || obj.isLight) return;

            // 1. Static Matrix Freeze across all static meshes, groups and Object3D
            if (obj.matrixAutoUpdate) {
                obj.matrixAutoUpdate = false;
                obj.updateMatrix();
                obj.updateMatrixWorld(true);
                if (obj.isMesh) frozenMeshes++;
                else frozenGroups++;
            }

            // 2. Hardware VRAM Caching for InstancedMeshes
            if (obj.isInstancedMesh) {
                obj.instanceMatrix.setUsage(THREE.StaticDrawUsage);
                obj.instanceMatrix.needsUpdate = true;
                obj.computeBoundingSphere();
                obj.frustumCulled = true;
                instancedOptimized++;

                // Instanced foliage/grass/flowers receive shadows but do not cast
                if (obj.name !== 'MergedTreeTrunks' && obj.name !== 'MergedSakuraCanopies' && obj.name !== 'MergedCedarCanopies') {
                    if (obj.castShadow && !obj.userData?.mustCastShadow) {
                        obj.castShadow = false;
                        obj.receiveShadow = true;
                        prunedShadowCasters++;
                    }
                }
            }

            // 3. Selective Shadow Pruning for tiny static sub-props
            if (obj.isMesh && obj.castShadow && !obj.isInstancedMesh) {
                if (obj.geometry) {
                    if (!obj.geometry.boundingSphere) {
                        obj.geometry.computeBoundingSphere();
                    }
                    const bs = obj.geometry.boundingSphere;
                    // Prune small props < 0.28m radius (pavers, tableware, brackets, dials, spokes, coins)
                    if (bs && bs.radius < 0.28 && !obj.userData?.mustCastShadow) {
                        obj.castShadow = false;
                        prunedShadowCasters++;
                    }
                }
            }
        });

        console.log(`[GPU Optimization] Matrix frozen: ${frozenMeshes} meshes, ${frozenGroups} groups. Instanced cached: ${instancedOptimized}. Pruned shadow casters: ${prunedShadowCasters}.`);
    }

    setVerificationStatus(status) {
        this.verificationStatus = status;
        if (this.weather && this.weather.setVerificationStatus) {
            this.weather.setVerificationStatus(status);
        }
        if (this.atmosphere && this.atmosphere.setVerificationStatus) {
            this.atmosphere.setVerificationStatus(status);
        }
        if (this.petals && this.petals.material) {
            this.petals.material.opacity = (status === 'FAILED') ? 0.15 : 0.88;
        }
    }

    getTerrainHeight(x, z) {
        return this.terrain.getTerrainHeight(x, z);
    }

    buildFloatingPetals() {
        const isMobile = typeof window !== 'undefined' && (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 768);
        const pCount = isMobile ? 60 : 200;
        const petalGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(pCount * 3);
        const velocities = [];

        for (let i = 0; i < pCount; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 65;
            positions[i * 3 + 1] = 1.0 + Math.random() * 12;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 65;

            velocities.push({
                x: 0.32 + Math.random() * 0.42,
                y: -0.16 - Math.random() * 0.25,
                z: 0.26 + Math.random() * 0.35
            });
        }

        petalGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const pCanvas = document.createElement('canvas');
        pCanvas.width = 64;
        pCanvas.height = 64;
        const pctx = pCanvas.getContext('2d');
        pctx.fillStyle = '#fbcfe8';
        pctx.beginPath();
        pctx.ellipse(32, 32, 22, 14, Math.PI / 4, 0, Math.PI * 2);
        pctx.fill();

        const pTex = new THREE.CanvasTexture(pCanvas);
        const petalMat = new THREE.PointsMaterial({
            map: pTex,
            size: 0.32,
            transparent: true,
            opacity: 0.88,
            depthWrite: false
        });

        this.petals = new THREE.Points(petalGeo, petalMat);
        this.petals.userData = { vel: velocities };
        this.scene.add(this.petals);
    }

    update(delta, playerPos = null) {
        // Dynamic 24-minute Day/Night environmental cycle
        if (this.timeOfDay) {
            this.timeOfDay.update(delta, this.weather ? this.weather.verificationStatus : null);
        }

        // Atmosphere sky, depth fog & world wind sync with time of day
        if (this.atmosphere && this.atmosphere.update) {
            this.atmosphere.update(this.timeOfDay, delta);
        }

        // Water ripples & specular flow driven by world wind
        if (this.water) {
            this.water.update(delta, this.atmosphere?.wind);
        }

        // Coastal beach foam oscillation
        if (this.beach) {
            this.beach.update(delta);
        }

        // Weather, lighting cycle & rain/fireflies
        if (this.weather) {
            this.weather.update(delta, this.timeOfDay ? this.timeOfDay.time : null, playerPos);
        }

        // Landmarks & campfire/lantern lighting
        if (this.landmarks && this.landmarks.update) {
            this.landmarks.update((performance.now() - this.startTime) / 1000, this.timeOfDay);
        }

        // Bamboo and maple forest leaf simulations
        if (this.bambooForest && this.bambooForest.update) {
            this.bambooForest.update(delta);
        }
        if (this.mapleForest && this.mapleForest.update) {
            this.mapleForest.update(delta);
        }

        // Zen Koi Pond & Waterfall simulation
        if (this.zenPond && this.zenPond.update) {
            this.zenPond.update(delta, this.timeOfDay ? this.timeOfDay.time : null, playerPos);
        }

        // Living wildlife simulation (Flocking Boids, Perched birds FSM & Insects)
        if (this.wildlife && this.wildlife.update) {
            this.wildlife.update(delta, this.timeOfDay ? this.timeOfDay.time : null, playerPos);
        }

        // Torii Waystone Fast-Travel Shrines simulation & proximity check
        if (this.toriiWarp && this.toriiWarp.update) {
            this.toriiWarp.update(delta, playerPos);
        }

        // Arashiyama Onsen Retreat simulation & steam update
        if (this.bambooOnsen && this.bambooOnsen.update) {
            this.bambooOnsen.update(delta, this.timeOfDay ? this.timeOfDay.time : null, playerPos);
        }

        // Lakeside Campfire Social & Synchronized Lofi Radio simulation & orbit camera
        if (this.campfireSocial && this.campfireSocial.update) {
            this.campfireSocial.update(
                delta,
                playerPos,
                window.openWorld3D?.camera,
                window.openWorld3D?.isSitting,
                window.openWorld3D?.currentSeatAnchor
            );
        }

        // Modular Desk Decor & Pomodoro Focus Timer update
        if (this.deskDecor && this.deskDecor.update) {
            this.deskDecor.update(
                delta,
                playerPos,
                window.openWorld3D?.isSitting,
                window.openWorld3D?.currentSeatAnchor
            );
        }

        // Region and streaming updates
        if (playerPos) {
            const currentReg = this.regions.update(playerPos.x, playerPos.z);
            this.streaming.update(playerPos.x, playerPos.z);
            if (this.ambientAudio) {
                this.ambientAudio.updateRegionAndEnvironment(currentReg.id, this.weather.timeOfDay);
            }
        }

        // Drifting sakura petals simulation
        if (this.petals && this.petals.userData && this.petals.userData.vel) {
            const time = (performance.now() - this.startTime) / 1000;
            const pos = this.petals.geometry.attributes.position;
            const vel = this.petals.userData.vel;
            for (let i = 0; i < pos.count; i++) {
                if (!vel[i]) continue;
                let px = pos.getX(i) + vel[i].x * delta * 4;
                let py = pos.getY(i) + vel[i].y * delta * 3.5;
                let pz = pos.getZ(i) + vel[i].z * delta * 4;

                px += Math.sin(time * 1.4 + i) * 0.012;

                if (py < 0.1) {
                    py = 10 + Math.random() * 3.5;
                    px = (Math.random() - 0.5) * 65;
                    pz = (Math.random() - 0.5) * 65;
                }

                pos.setXYZ(i, px, py, pz);
            }
            pos.needsUpdate = true;
        }
    }
}
