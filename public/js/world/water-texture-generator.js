/**
 * WATER TEXTURE GENERATOR
 * Procedural Tangent-Space Wavelet Normal Maps, Cellular Seafoam & Underwater Caustics
 * Zero external asset dependencies — generates instantaneously on WebGL startup.
 * Adheres to Argon 4 Architectural Guidance: Singleton Cache, Toroidal Seamless Tiling,
 * Mipmapping with LinearMipmapLinearFilter for shimmer-free horizon rendering.
 */

export class WaterTextureGenerator {
    static _sharedTextures = null;

    /**
     * Singleton accessor: guarantees single VRAM allocation shared across
     * BeachSystem, RiverSystem, MapleForestSystem, and RiceFieldSystem.
     */
    static getSharedTextures(THREE) {
        if (!this._sharedTextures) {
            this._sharedTextures = {
                normalMap: this.createNormalMap(THREE, 512, 512),
                foamMap: this.createFoamTexture(THREE, 256, 256),
                causticMap: this.createCausticTexture(THREE, 256, 256)
            };
        }
        return this._sharedTextures;
    }

    /**
     * Generates a high-fidelity dual-frequency normal map with micro-ripples
     * Using toroidal periodic domain to ensure seamless wrap-around tiling.
     */
    static createNormalMap(THREE, width = 512, height = 512) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        for (let y = 0; y < height; y++) {
            const ny = (y / height) * Math.PI * 2.0;
            for (let x = 0; x < width; x++) {
                const nx = (x / width) * Math.PI * 2.0;
                const idx = (y * width + x) * 4;

                // Harmonics 1: Broad sea swell wavelets (periodic)
                const w1x = Math.sin(nx * 4.0) * Math.cos(ny * 3.0);
                const w1y = Math.cos(nx * 3.0) * Math.sin(ny * 4.0);

                // Harmonics 2: Medium chop wavelets (periodic)
                const w2x = Math.sin(nx * 8.0 + ny * 6.0) * 0.5;
                const w2y = Math.cos(nx * 6.0 - ny * 8.0) * 0.5;

                // Harmonics 3: Capillary micro ripples (periodic)
                const w3x = Math.sin(nx * 16.0 - ny * 12.0) * 0.25;
                const w3y = Math.cos(nx * 12.0 + ny * 16.0) * 0.25;

                const gradX = (w1x + w2x + w3x) * 0.45;
                const gradY = (w1y + w2y + w3y) * 0.45;

                // Tangent-space normal vector encoding: (R = X normal, G = Y normal, B = Z up)
                data[idx] = Math.floor(Math.max(0, Math.min(255, (gradX * 0.5 + 0.5) * 255)));
                data[idx + 1] = Math.floor(Math.max(0, Math.min(255, (gradY * 0.5 + 0.5) * 255)));
                data[idx + 2] = 240; // Dominant upward normal
                data[idx + 3] = 255;
            }
        }
        ctx.putImageData(imgData, 0, 0);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 4);
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 8;
        return tex;
    }

    /**
     * Generates a procedural cellular seafoam texture (Voronoi bubble lattice)
     * Using toroidal minimum-distance wrapping for seamless edges.
     */
    static createFoamTexture(THREE, width = 256, height = 256) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        // Cellular seeds
        const numSeeds = 36;
        const seeds = [];
        // Pseudo-random seeded for deterministic beauty
        let seedState = 42;
        function rnd() {
            seedState = (seedState * 9301 + 49297) % 233280;
            return seedState / 233280;
        }

        for (let i = 0; i < numSeeds; i++) {
            seeds.push({
                x: rnd() * width,
                y: rnd() * height
            });
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;

                // Find distances to closest seeds (torus wrapped for seamless tiling)
                let d1 = 9999;
                let d2 = 9999;
                for (let i = 0; i < numSeeds; i++) {
                    const s = seeds[i];
                    let dx = Math.abs(x - s.x);
                    if (dx > width / 2) dx = width - dx;
                    let dy = Math.abs(y - s.y);
                    if (dy > height / 2) dy = height - dy;
                    const d = Math.sqrt(dx * dx + dy * dy);

                    if (d < d1) {
                        d2 = d1;
                        d1 = d;
                    } else if (d < d2) {
                        d2 = d;
                    }
                }

                // Voronoi F2 - F1 edge detection: creates delicate cellular bubble cell borders
                const edge = (d2 - d1) / 10.0;
                let foam = Math.exp(-edge * edge * 2.5);

                // Add subtle inner bubble speckles (periodic)
                const nx = (x / width) * Math.PI * 2.0;
                const ny = (y / height) * Math.PI * 2.0;
                const speckle = Math.sin(nx * 16.0) * Math.sin(ny * 16.0) * 0.12;
                foam = Math.max(0.0, Math.min(1.0, foam + speckle));

                const val = Math.floor(foam * 255);
                data[idx] = 255;     // White foam
                data[idx + 1] = 255;
                data[idx + 2] = 255;
                data[idx + 3] = val; // Soft alpha
            }
        }
        ctx.putImageData(imgData, 0, 0);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(6, 6);
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        return tex;
    }

    /**
     * Generates an underwater sunlight caustics texture (interlocking refractive curves)
     * Purely periodic on [0, 2PI] to guarantee seamless tiling.
     */
    static createCausticTexture(THREE, width = 256, height = 256) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        for (let y = 0; y < height; y++) {
            const ny = (y / height) * Math.PI * 2.0;
            for (let x = 0; x < width; x++) {
                const nx = (x / width) * Math.PI * 2.0;
                const idx = (y * width + x) * 4;

                // Wave superposition caustic pattern (strictly periodic)
                const c1 = Math.sin(nx * 2.0 + Math.cos(ny * 3.0));
                const c2 = Math.cos(ny * 2.0 + Math.sin(nx * 3.0));
                const c3 = Math.sin((nx + ny) * 2.0 + Math.cos((nx - ny) * 2.0));

                let caustic = (c1 + c2 + c3) / 3.0;
                // Sharpen peaks to create bright refractive caustic ribbons
                caustic = Math.pow(Math.max(0.0, caustic * 0.5 + 0.5), 3.5);

                const val = Math.floor(caustic * 255);
                data[idx] = 255;
                data[idx + 1] = 255;
                data[idx + 2] = 255;
                data[idx + 3] = val;
            }
        }
        ctx.putImageData(imgData, 0, 0);

        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 4);
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        return tex;
    }
}
