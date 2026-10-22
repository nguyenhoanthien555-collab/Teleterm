import * as THREE from '/vendor/three/build/three.module.js';

function makeSurfaceMaps() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const image = context.createImageData(size, size);
    let seed = 821;

    for (let i = 0; i < image.data.length; i += 4) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const grain = 112 + (seed % 32);
        image.data[i] = grain;
        image.data[i + 1] = grain;
        image.data[i + 2] = grain;
        image.data[i + 3] = 255;
    }
    context.putImageData(image, 0, 0);

    const bump = new THREE.CanvasTexture(canvas);
    bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
    bump.repeat.set(3, 3);
    bump.colorSpace = THREE.NoColorSpace;
    bump.needsUpdate = true;
    return bump;
}

function makeStudioEnvironment() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const sky = context.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#607d9a');
    sky.addColorStop(0.48, '#d5c9b3');
    sky.addColorStop(0.52, '#a4ad91');
    sky.addColorStop(1, '#34483f');
    context.fillStyle = sky;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const sun = context.createRadialGradient(368, 68, 4, 368, 68, 108);
    sun.addColorStop(0, 'rgba(255,244,214,0.95)');
    sun.addColorStop(0.12, 'rgba(255,231,187,0.42)');
    sun.addColorStop(1, 'rgba(255,231,187,0)');
    context.fillStyle = sun;
    context.fillRect(250, 0, 236, 190);

    const environment = new THREE.CanvasTexture(canvas);
    environment.mapping = THREE.EquirectangularReflectionMapping;
    environment.colorSpace = THREE.SRGBColorSpace;
    environment.needsUpdate = true;
    return environment;
}

/** PC Max only: add subtle procedural surface response to opaque world materials. */
export class PcMaxMaterialEnhancer {
    constructor(scene) {
        this.scene = scene;
        this.bumpMap = makeSurfaceMaps();
        this.environmentMap = makeStudioEnvironment();
        this.previousEnvironment = scene.environment;
        this.previousEnvironmentIntensity = scene.environmentIntensity;
        this.originalMaterials = new Map();
        this.enhancedMaterials = new Map();
        this.enabled = false;
    }

    setEnabled(enabled) {
        this.enabled = !!enabled;
        if (!this.enabled) {
            for (const [object, originalMaterial] of this.originalMaterials) {
                object.material = originalMaterial;
            }
            this.originalMaterials.clear();
            for (const material of this.enhancedMaterials.values()) material.dispose();
            this.enhancedMaterials.clear();
            if (this.scene.environment === this.environmentMap) {
                this.scene.environment = this.previousEnvironment;
                this.scene.environmentIntensity = this.previousEnvironmentIntensity ?? 1;
            }
            return;
        }

        this.scene.environment = this.environmentMap;
        this.scene.environmentIntensity = 0.42;

        this.scene.traverse((object) => {
            if (!object.isMesh || this.isCharacterOrUi(object)) return;
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            const enhanced = materials.map((material) => this.enhanceMaterial(material));
            if (enhanced.some((material, index) => material !== materials[index])) {
                if (!this.originalMaterials.has(object)) this.originalMaterials.set(object, object.material);
                object.material = Array.isArray(object.material) ? enhanced : enhanced[0];
            }
        });
    }

    isCharacterOrUi(object) {
        for (let parent = object; parent; parent = parent.parent) {
            if (parent.userData?.isAvatar || parent.userData?.isNpc || parent.userData?.isWorldUi) return true;
        }
        return false;
    }

    enhanceMaterial(material) {
        if (!material) return material;
        if (!material.isMeshStandardMaterial || material.isMeshPhysicalMaterial || material.transparent || material.alphaTest > 0 || (material.roughness ?? 1) < 0.12) return material;
        if (this.enhancedMaterials.has(material)) return this.enhancedMaterials.get(material);

        const physical = new THREE.MeshPhysicalMaterial().copy(material);
        physical.userData = { ...material.userData, pcMaxOriginal: material };
        physical.roughness = Math.max(0.32, Math.min(0.94, material.roughness ?? 0.72));
        physical.clearcoat = material.metalness > 0.35 ? 0.18 : 0.08;
        physical.clearcoatRoughness = 0.72;
        physical.envMapIntensity = 0.85;
        physical.bumpMap = material.bumpMap || this.bumpMap;
        physical.bumpScale = material.bumpScale || 0.012;
        physical.needsUpdate = true;
        this.enhancedMaterials.set(material, physical);
        return physical;
    }

    dispose() {
        this.setEnabled(false);
        this.bumpMap.dispose();
        this.environmentMap.dispose();
        this.originalMaterials.clear();
        this.enhancedMaterials.clear();
    }
}
