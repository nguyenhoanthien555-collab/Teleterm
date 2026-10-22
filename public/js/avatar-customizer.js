/**
 * Avatar Customizer & 12MB 3D Model Uploader
 * TeleTerm Master Architecture v2 - Section 9, 25
 * Preserves 100% original anime textures without flat color washes.
 */

const PRESET_CONFIGS = {
    'sakura_alice': {
        name: 'Sakura Alice',
        desc: 'Delicate sakura headband in Japanese maiden style'
    },
    'hacker_hoodie': {
        name: 'Hacker Hoodie',
        desc: 'High-tech cyberpunk hologram optics'
    },
    'kimono_ronin': {
        name: 'Kimono Ronin',
        desc: 'Weathered hip-mounted samurai katana'
    },
    'kemono_coder': {
        name: 'Kemono Coder',
        desc: 'Adorable kemono cat ears'
    }
};

class AvatarCustomizer {
    constructor() {
        this.currentPreset = 'sakura_alice';

        // Purge any corrupted color tinting from localStorage
        try {
            localStorage.removeItem('teleterm_avatar_colors');
            const savedP = localStorage.getItem('teleterm_avatar_preset');
            if (savedP && PRESET_CONFIGS[savedP]) {
                this.currentPreset = savedP;
            }
        } catch (e) {}

        this.initDOM();
    }

    initDOM() {
        window.addEventListener('DOMContentLoaded', () => {
            this.modal = document.getElementById('modal-avatar-customizer');
            this.btnOpen = document.getElementById('btn-open-customizer');
            this.btnClose = document.getElementById('btn-close-customizer');
            this.btnSave = document.getElementById('btn-save-avatar');
            this.uploadInput = document.getElementById('input-custom-avatar-file');
            this.uploadStatus = document.getElementById('avatar-upload-status');

            if (this.btnOpen && this.modal) {
                this.btnOpen.addEventListener('click', () => {
                    this.modal.classList.remove('hidden');
                    this.syncInputsWithState();
                });
            }

            if (this.btnClose && this.modal) {
                this.btnClose.addEventListener('click', () => {
                    this.modal.classList.add('hidden');
                });
            }

            // Preset choices
            document.querySelectorAll('.avatar-preset-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const preset = btn.getAttribute('data-preset');
                    this.selectPreset(preset);
                });
            });

            if (this.btnSave) {
                this.btnSave.addEventListener('click', () => {
                    this.saveChanges();
                });
            }

            // File Upload Listener with 12MB Budget Enforcement
            if (this.uploadInput) {
                this.uploadInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) this.handleFileUpload(file);
                });
            }

            this.syncInputsWithState();
        });
    }

    syncInputsWithState() {
        document.querySelectorAll('.avatar-preset-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-preset') === this.currentPreset);
        });
    }

    selectPreset(preset) {
        this.currentPreset = preset;
        this.syncInputsWithState();

        // Immediately preview preset & accessories in the 3D world with 100% original textures!
        if (window.openWorld3D) {
            window.openWorld3D.setPreset(this.currentPreset);
        }
    }

    saveChanges() {
        try {
            localStorage.setItem('teleterm_avatar_preset', this.currentPreset);
            localStorage.removeItem('teleterm_avatar_colors');
        } catch (e) {}

        // 1. Apply to local 3D world
        if (window.openWorld3D) {
            window.openWorld3D.setPreset(this.currentPreset);
        }

        // 2. Broadcast to multiplayer gateway peers
        if (window.multiplayerClient) {
            window.multiplayerClient.sendAvatarUpdate({
                presetId: this.currentPreset
            });
        }

        if (this.modal) this.modal.classList.add('hidden');
    }

    async handleFileUpload(file) {
        if (!this.uploadStatus) return;

        // 1. Client-Side 12MB Budget Enforcement
        const maxBytes = 12 * 1024 * 1024;
        const i18n = window.TeleTermI18n;
        if (file.size > maxBytes) {
            const msg = i18n ? i18n.t('avatar_upload_large') : `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB > 12MB limit). Please compress textures or reduce polygon count.`;
            this.uploadStatus.innerHTML = `<span style="color: #f43f5e">${msg}</span>`;
            return;
        }

        const ext = file.name.split('.').pop().toLowerCase();
        if (!['glb', 'vrm'].includes(ext)) {
            const msg = i18n ? i18n.t('avatar_upload_format') : 'Only standard 3D formats (.GLB or .VRM) are supported.';
            this.uploadStatus.innerHTML = `<span style="color: #f43f5e">${msg}</span>`;
            return;
        }

        const uploadingMsg = i18n ? i18n.t('avatar_uploading') : 'Uploading and validating 3D model...';
        this.uploadStatus.innerHTML = `<span style="color: #38bdf8">${uploadingMsg}</span>`;

        try {
            const arrayBuffer = await file.arrayBuffer();

            const res = await fetch('/api/dev/upload-avatar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'x-filename': file.name
                },
                body: arrayBuffer
            });

            const data = await res.json();
            if (data.success && data.modelUrl) {
                const successMsg = i18n ? i18n.t('avatar_upload_success') : 'Custom 3D avatar successfully imported into the world!';
                this.uploadStatus.innerHTML = `<span style="color: #10b981">${successMsg}</span>`;
                if (window.multiplayerClient) {
                    window.multiplayerClient.sendAvatarUpdate({
                        customModelUrl: data.modelUrl
                    });
                }
                if (window.openWorld3D) {
                    window.openWorld3D.loadCustomModel(data.modelUrl);
                }
            } else {
                this.uploadStatus.innerHTML = `<span style="color: #f43f5e">Error: ${data.error || 'Validation failed'}</span>`;
            }
        } catch (err) {
            this.uploadStatus.innerHTML = `<span style="color: #f43f5e">Network error: ${err.message}</span>`;
        }
    }
}

window.avatarCustomizer = new AvatarCustomizer();
