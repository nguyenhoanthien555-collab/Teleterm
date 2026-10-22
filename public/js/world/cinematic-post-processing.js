import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { GammaCorrectionShader } from 'three/addons/shaders/GammaCorrectionShader.js';

export const QUALITY_PRESETS = {
    ULTRA: 'ultra',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
};

/**
 * CinematicPostProcessing - Master Post-Processing Pipeline for TeleTerm 3D
 * Architected by Lead Architect Gemini 4 Argon.
 * Features:
 * - Selective, soft anime bloom (UnrealBloomPass, threshold 0.88, strength 0.35, radius 0.45)
 * - ACES Filmic Tone Mapping with sRGB gamma correction
 * - Subpixel Morphological Anti-Aliasing (SMAA) on Ultra, FXAA on High/Medium
 * - Seamless mobile / low-spec bypass to guarantee 60 FPS
 */
export class CinematicPostProcessing {
    /**
     * @param {THREE.WebGLRenderer} renderer 
     * @param {THREE.Scene} scene 
     * @param {THREE.Camera} camera 
     */
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        this.enabled = true;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.currentPreset = QUALITY_PRESETS.HIGH;

        // Configure Tone Mapping on renderer
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.composer = null;
        this.renderPass = null;
        this.bloomPass = null;
        this.aaPass = null;
        this.gammaCorrectionPass = null;

        this._initPipeline();
    }

    _initPipeline() {
        try {
            const pixelRatio = this.renderer.getPixelRatio() || 1;

            // Target buffer with HalfFloatType for high dynamic range precision if supported
            const isHalfFloatSupported = this.renderer.capabilities.isWebGL2 || !!this.renderer.extensions.get('OES_texture_half_float');
            const renderTargetParams = {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBAFormat,
                type: isHalfFloatSupported ? THREE.HalfFloatType : THREE.UnsignedByteType
            };

            const renderTarget = new THREE.WebGLRenderTarget(
                Math.max(1, Math.floor(this.width * pixelRatio)),
                Math.max(1, Math.floor(this.height * pixelRatio)),
                renderTargetParams
            );

            this.composer = new EffectComposer(this.renderer, renderTarget);
            this.composer.setSize(this.width, this.height);

            // 1. Base Scene Render Pass
            this.renderPass = new RenderPass(this.scene, this.camera);
            this.composer.addPass(this.renderPass);

            // 2. Cinematic Anime Bloom Pass (Kawase pyramid, half-resolution 0.5x for 75% GPU blur fill-rate saving)
            this.bloomPass = new UnrealBloomPass(
                new THREE.Vector2(Math.max(1, Math.floor(this.width * 0.5)), Math.max(1, Math.floor(this.height * 0.5))),
                0.20,  // strength: gentle cinematic glow without blinding whiteout
                0.35,  // radius
                0.94   // threshold: only radiant highlights bloom, keeping skies & water crisp
            );
            this.composer.addPass(this.bloomPass);

            // 3. Gamma Correction (convert to sRGB before presenting to screen)
            this.gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
            this.composer.addPass(this.gammaCorrectionPass);

            // Apply default quality profile
            this.setQualityPreset(this.currentPreset);
        } catch (err) {
            console.warn('[CinematicPostProcessing] Failed to initialize post-processing pipeline, falling back to direct rendering:', err);
            this.enabled = false;
        }
    }

    /**
     * Set dynamic quality preset (Ultra, High, Medium, Low)
     * @param {string} presetLevel
     */
    setQualityPreset(presetLevel) {
        if (!this.composer) return;
        const normalized = (presetLevel || '').toLowerCase();
        this.currentPreset = normalized;
        // 120 FPS Native DPR: Clamp to 1.0 to avoid supersampling performance degradation
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.0);

        // Remove active Anti-Aliasing pass if any
        if (this.aaPass) {
            this.composer.removePass(this.aaPass);
            if (this.aaPass.dispose) this.aaPass.dispose();
            this.aaPass = null;
        }

        switch (normalized) {
            case QUALITY_PRESETS.ULTRA:
            case 'max':
                this.enabled = true;
                this.composer.setPixelRatio(pixelRatio);
                if (this.bloomPass) {
                    this.bloomPass.enabled = true;
                    this.bloomPass.strength = 0.24;
                    this.bloomPass.radius = 0.38;
                    this.bloomPass.threshold = 0.93;
                }

                // Subpixel Morphological Anti-Aliasing for crisp anime outlines
                try {
                    this.aaPass = new SMAAPass(
                        Math.max(1, Math.floor(this.width * pixelRatio)),
                        Math.max(1, Math.floor(this.height * pixelRatio))
                    );
                    this.composer.addPass(this.aaPass);
                } catch (e) {
                    this._fallbackToFXAA(pixelRatio);
                }
                break;

            case QUALITY_PRESETS.HIGH:
                this.enabled = true;
                this.composer.setPixelRatio(pixelRatio);
                if (this.bloomPass) {
                    this.bloomPass.enabled = true;
                    this.bloomPass.strength = 0.20;
                    this.bloomPass.radius = 0.35;
                    this.bloomPass.threshold = 0.94;
                }
                this._fallbackToFXAA(pixelRatio);
                break;

            case QUALITY_PRESETS.MEDIUM:
                this.enabled = true;
                this.composer.setPixelRatio(Math.max(0.75, pixelRatio * 0.75));
                if (this.bloomPass) {
                    this.bloomPass.enabled = true;
                    this.bloomPass.strength = 0.15;
                    this.bloomPass.radius = 0.30;
                    this.bloomPass.threshold = 0.95;
                }
                this._fallbackToFXAA(pixelRatio * 0.75);
                break;

            case QUALITY_PRESETS.LOW:
            case 'mobile':
            default:
                // Low / Mobile Profile: bypass heavy composer passes to guarantee 60 FPS
                this.enabled = false;
                if (this.bloomPass) this.bloomPass.enabled = false;
                break;
        }

        this.composer.setSize(this.width, this.height);
    }

    _fallbackToFXAA(dpr) {
        try {
            this.aaPass = new ShaderPass(FXAAShader);
            this._updateFXAAUniforms(this.width * dpr, this.height * dpr);
            this.composer.addPass(this.aaPass);
        } catch (e) {
            console.warn('[CinematicPostProcessing] FXAA fallback unavailable:', e);
        }
    }

    _updateFXAAUniforms(width, height) {
        if (this.aaPass && this.aaPass.material && this.aaPass.material.uniforms['resolution']) {
            this.aaPass.material.uniforms['resolution'].value.x = 1 / Math.max(1, width);
            this.aaPass.material.uniforms['resolution'].value.y = 1 / Math.max(1, height);
        }
    }

    onResize(width, height) {
        this.width = width;
        this.height = height;

        if (!this.composer) return;
        this.composer.setSize(width, height);

        if (this.bloomPass) {
            this.bloomPass.setSize(Math.max(1, Math.floor(width * 0.5)), Math.max(1, Math.floor(height * 0.5)));
        }

        const effectivePixelRatio = this.composer.pixelRatio || 1;
        const w = Math.max(1, Math.floor(width * effectivePixelRatio));
        const h = Math.max(1, Math.floor(height * effectivePixelRatio));

        if (this.aaPass) {
            if (this.aaPass instanceof SMAAPass) {
                this.aaPass.setSize(w, h);
            } else if (this.aaPass.material && this.aaPass.material.uniforms['resolution']) {
                this._updateFXAAUniforms(w, h);
            }
        }
    }

    setEnabled(enabled) {
        this.enabled = !!enabled;
    }

    /**
     * Primary Render Execution
     * @param {number} delta 
     */
    render(delta) {
        if (this.enabled && this.composer) {
            this.composer.render(delta);
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
