import * as THREE from 'three';
import { WaterTextureGenerator } from './water-texture-generator.js?v=37';
import { createStylizedRiverMaterial, createStylizedPaddyMaterial } from './ocean-shader.js?v=37';

/**
 * WATER SYSTEM
 * Stylized Anime Water with Sky Reflection, Soft Specular Highlights & Surface Shimmer
 * Follows Gemini 4 Argon Architecture: Shared Textures, Lightweight River & Paddy Shaders,
 * High-performance GPU rendering for solid 60+ FPS.
 */
export class WaterSystem {
    constructor(scene) {
        this.scene = scene;
        this.waterMeshes = [];
        this.time = 0;
        this.waterMat = null;
        this.streamMat = null;
        this.bumpTex = null;
        this.normalTex = null;
    }

    initMaterials() {
        const textures = WaterTextureGenerator.getSharedTextures(THREE);
        this.bumpTex = textures.normalMap;
        this.normalTex = textures.normalMap;

        // Rice Paddy Water: Lightweight Argon-approved paddy shader with sky reflection & mud bed translucency
        this.waterMat = createStylizedPaddyMaterial(textures.normalMap);

        // Flowing River & Canal Water: Lightweight Argon-approved river shader with dual-layer UV flow & glints
        this.streamMat = createStylizedRiverMaterial(textures.normalMap, textures.foamMap);
    }

    createPaddyWater(width, depth, x, y, z) {
        if (!this.waterMat) this.initMaterials();

        const geo = new THREE.PlaneGeometry(width, depth);
        geo.rotateX(-Math.PI / 2);

        const mesh = new THREE.Mesh(geo, this.waterMat);
        mesh.position.set(x, y, z);
        mesh.renderOrder = 2; // Renders cleanly after terrain & mud bed
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.waterMeshes.push(mesh);
        return mesh;
    }

    createStreamWater(width, length, x, y, z, rotationY = 0) {
        if (!this.streamMat) this.initMaterials();

        const geo = new THREE.PlaneGeometry(width, length);
        geo.rotateX(-Math.PI / 2);

        const mesh = new THREE.Mesh(geo, this.streamMat);
        mesh.position.set(x, y, z);
        mesh.rotation.y = rotationY;
        mesh.renderOrder = 2; // Renders cleanly after terrain & canal bed
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        this.waterMeshes.push(mesh);
        return mesh;
    }

    update(delta, wind = null) {
        this.time += delta;
        const safeTime = this.time % 3600.0;

        // Update GPU Shaders
        if (this.streamMat && this.streamMat.uniforms && this.streamMat.uniforms.uTime) {
            this.streamMat.uniforms.uTime.value = safeTime;
        }
        if (this.waterMat && this.waterMat.uniforms && this.waterMat.uniforms.uTime) {
            this.waterMat.uniforms.uTime.value = safeTime;
        }

        // Texture offset for fallback Standard materials
        if (this.bumpTex) {
            let speedX = 0.035;
            let speedY = 0.022;
            if (wind) {
                const windFactor = (wind.speed || 1.0) + (wind.gust || 0.0);
                if (wind.direction) {
                    speedX = wind.direction.x * 0.040 * windFactor;
                    speedY = wind.direction.y * 0.028 * windFactor;
                }
            }
            this.bumpTex.offset.x = (this.bumpTex.offset.x + delta * speedX) % 1.0;
            this.bumpTex.offset.y = (this.bumpTex.offset.y + delta * speedY) % 1.0;
        }
    }
}
