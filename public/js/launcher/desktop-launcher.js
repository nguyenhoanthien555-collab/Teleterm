/**
 * TeleTerm Desktop Game Launcher & Home Screen
 * Impeccable Design: Pure anime countryside atmosphere, single visual anchor, zero AI slop.
 * Primary Action: "START VIBING"
 */

import { LauncherStateMachine, LauncherState } from './launcher-state-machine.js';
import { TeleTermIcons } from '../ui/teleterm-icons.js';

export class DesktopLauncher {
    constructor(options = {}) {
        this.options = options;
        this.stateMachine = new LauncherStateMachine();
        this.platform = window.TeleTermPlatform;

        this.currentUser = null;
        this.sessionToken = null;
        this.serverStatus = 'CONNECTING'; // ONLINE, CONNECTING, OFFLINE

        this.dom = {};
        this.isLauncherVisible = true;

        this.init();
    }

    async init() {
        console.log('[DesktopLauncher] Initializing Impeccable Game Client Launcher...');
        this.injectLauncherHTML();
        this.bindDOM();
        this.bindPlatformEvents();
        this.bindKeyboardShortcuts();
        this.startServerPingLoop();
        this.startPetalsParticleCanvas();

        // Subscribe to state machine
        this.stateMachine.subscribe((state, data) => this.handleStateChange(state, data));

        // Check for direct mode (?direct=1)
        const isDirect = new URLSearchParams(window.location.search).get('direct') === '1';
        const loginRequested = new URLSearchParams(window.location.search).get('login') === '1';
        if (isDirect) {
            console.log('[DesktopLauncher] Direct mode requested (?direct=1). Entering 3D game client directly.');
            this.hideLauncher();
            this.stateMachine.transition(LauncherState.IN_WORLD, { progress: 100, message: 'Ready' });
            return;
        }

        if (loginRequested && this.dom.loginModal) this.dom.loginModal.classList.remove('hidden');

        // Start Boot Pipeline
        await this.runBootPipeline();
    }

    // --- HTML Injection ---
    injectLauncherHTML() {
        if (document.getElementById('teleterm-launcher-overlay')) return;

        // Native Titlebar (Desktop Only)
        if (this.platform && typeof this.platform.isDesktop === 'function' && this.platform.isDesktop()) {
            document.body.classList.add('desktop-app');
            if (!document.getElementById('desktop-titlebar')) {
                const titlebar = document.createElement('div');
                titlebar.id = 'desktop-titlebar';
                titlebar.className = 'desktop-titlebar';
                titlebar.innerHTML = `
                    <div class="titlebar-drag-region">
                        <span class="titlebar-brand">TELETERM 3D</span>
                    </div>
                    <div class="titlebar-actions">
                        <button id="btn-tb-fullscreen" class="tb-btn" title="Toggle Fullscreen (F11)">${TeleTermIcons.render('maximize', { size: 13 })}</button>
                        <button id="btn-tb-minimize" class="tb-btn" title="Minimize Window">${TeleTermIcons.render('minus', { size: 13 })}</button>
                        <button id="btn-tb-maximize" class="tb-btn" title="Maximize Window">${TeleTermIcons.render('square', { size: 13 })}</button>
                        <button id="btn-tb-close" class="tb-btn tb-btn-close" title="Exit Game">${TeleTermIcons.render('x', { size: 13 })}</button>
                    </div>
                `;
                document.body.prepend(titlebar);
            }
        }

        const isDirect = new URLSearchParams(window.location.search).get('direct') === '1';
        const overlay = document.createElement('div');
        overlay.id = 'teleterm-launcher-overlay';
        overlay.className = isDirect ? 'teleterm-launcher-overlay' : 'teleterm-launcher-overlay active';
        if (isDirect) {
            overlay.style.display = 'none';
        } else {
            document.body.classList.add('launcher-active');
        }
        overlay.innerHTML = `
            <!-- Sakura Ambient Canvas -->
            <canvas id="launcher-petals-canvas" class="launcher-petals-canvas"></canvas>

            <!-- Top Minimal Bar -->
            <header class="launcher-top-bar">
                <div class="launcher-brand-mark">
                    <span class="brand-dot"></span>
                    <span>TELETERM</span>
                </div>
                <div class="launcher-top-controls">
                    <div id="launcher-server-status" class="launcher-server-status status-connecting">
                        <span class="status-dot"></span>
                        <span id="launcher-server-text">Connecting</span>
                    </div>
                    <button id="btn-launcher-settings" class="launcher-btn-icon" title="Settings">${TeleTermIcons.render('settings', { size: 16 })}</button>
                </div>
            </header>

            <!-- Center Hero: Single Visual Anchor -->
            <main class="launcher-hero-center">
                <h1 class="launcher-hero-title">TELETERM</h1>
                <p class="launcher-hero-subtitle">Enter the Cyber Valley</p>

                <button id="btn-start-vibing" class="btn-start-vibing" autofocus>
                    <span>START VIBING</span>
                </button>
                <div class="vibing-subtext">Press [ Enter ] to launch</div>
            </main>

            <!-- Bottom Bar: Account & Status -->
            <footer class="launcher-bottom-bar">
                <div id="launcher-account-capsule" class="launcher-account-capsule" title="Click to Switch Account">
                    <div id="launcher-avatar-circle" class="launcher-avatar-circle" style="display:flex;align-items:center;justify-content:center;">${TeleTermIcons.render('sparkles', { size: 16 })}</div>
                    <div class="launcher-account-details">
                        <span id="launcher-account-name" class="launcher-account-name">Traveler</span>
                        <span id="launcher-account-rank" class="launcher-account-rank">Lv. 1 Novice</span>
                    </div>
                </div>

                <div class="launcher-meta-text">v5.0 • Desktop Client</div>
            </footer>

            <!-- Launch Loader Overlay -->
            <div id="launcher-loader" class="launcher-launch-loader hidden">
                <div id="launch-loader-title" class="launch-loader-text">Entering the Valley</div>
                <div id="launch-loader-sub" class="launch-loader-sub">Synchronizing with world...</div>
                <div class="launch-progress-track">
                    <div id="launch-progress-bar" class="launch-progress-bar"></div>
                </div>
            </div>

            <!-- Login Modal -->
            <div id="launcher-login-modal" class="launcher-modal-backdrop hidden">
                <div class="launcher-modal-card">
                    <button id="btn-close-login" class="modal-close-btn" title="Close">${TeleTermIcons.render('x', { size: 16 })}</button>
                    <h2 class="modal-title">TeleTerm</h2>
                    <p class="modal-subtitle">Welcome back.<br>Your developer world is waiting.</p>

                    <div class="auth-btn-stack">
                        <button id="btn-login-google" class="btn-auth-provider">
                            <svg viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.3 8.9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.2C.6 9.2 0 11.5 0 12s.6 2.8 1.6 4.8l3.7-2.1z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.3L1.6 15.9C3.5 19.7 7.4 23 12 23z"/></svg>
                            <span>Continue with Google</span>
                        </button>

                        <button id="btn-login-github" class="btn-auth-provider">
                            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                            <span>Continue with GitHub</span>
                        </button>
                    </div>
                    <button id="btn-logout-account" type="button" hidden style="margin-top:18px;color:#cbd5e1;background:transparent;border:1px solid #334155;padding:9px 12px;border-radius:8px">Sign out</button>
                    <button id="btn-delete-account" type="button" hidden style="margin-top:18px;color:#fda4af;background:transparent;border:1px solid #7f1d1d;padding:9px 12px;border-radius:8px">Delete account and game data</button>

                </div>
            </div>
        `;

        document.body.classList.add('launcher-active');
        document.body.appendChild(overlay);
    }

    // --- DOM Binding ---
    bindDOM() {
        this.dom.overlay = document.getElementById('teleterm-launcher-overlay');
        this.dom.btnStartVibing = document.getElementById('btn-start-vibing');
        this.dom.serverStatus = document.getElementById('launcher-server-status');
        this.dom.serverText = document.getElementById('launcher-server-text');
        this.dom.btnSettings = document.getElementById('btn-launcher-settings');

        // Account elements
        this.dom.accountCapsule = document.getElementById('launcher-account-capsule');
        this.dom.avatarCircle = document.getElementById('launcher-avatar-circle');
        this.dom.accountName = document.getElementById('launcher-account-name');
        this.dom.accountRank = document.getElementById('launcher-account-rank');

        // Loader
        this.dom.loader = document.getElementById('launcher-loader');
        this.dom.loaderTitle = document.getElementById('launch-loader-title');
        this.dom.loaderSub = document.getElementById('launch-loader-sub');
        this.dom.progressBar = document.getElementById('launch-progress-bar');

        // Login Modal
        this.dom.loginModal = document.getElementById('launcher-login-modal');
        this.dom.btnLoginGoogle = document.getElementById('btn-login-google');
        this.dom.btnLoginGithub = document.getElementById('btn-login-github');
        this.dom.btnDeleteAccount = document.getElementById('btn-delete-account');
        this.dom.btnLogoutAccount = document.getElementById('btn-logout-account');
        this.dom.btnCloseLogin = document.getElementById('btn-close-login');

        // Titlebar (if desktop)
        this.dom.btnTbMin = document.getElementById('btn-tb-minimize');
        this.dom.btnTbMax = document.getElementById('btn-tb-maximize');
        this.dom.btnTbClose = document.getElementById('btn-tb-close');
        this.dom.btnTbFs = document.getElementById('btn-tb-fullscreen');

        // --- Event Listeners ---
        this.dom.btnStartVibing.addEventListener('click', () => this.handleStartVibing());

        // Account / Login triggers
        const openLogin = () => this.dom.loginModal.classList.remove('hidden');
        this.dom.accountCapsule.addEventListener('click', openLogin);
        this.dom.btnCloseLogin.addEventListener('click', () => this.dom.loginModal.classList.add('hidden'));

        this.dom.btnLoginGoogle.addEventListener('click', () => this.handleOAuthLogin('google'));
        this.dom.btnLoginGithub.addEventListener('click', () => this.handleOAuthLogin('github'));
        this.dom.btnDeleteAccount?.addEventListener('click', () => this.deleteAccount());
        this.dom.btnLogoutAccount?.addEventListener('click', () => this.logoutAccount());

        // Settings trigger (opens existing Graphics/Audio settings modal in app)
        this.dom.btnSettings.addEventListener('click', () => {
            const gfxModal = document.getElementById('modal-graphics-settings');
            if (gfxModal) gfxModal.classList.remove('hidden');
        });

        // Exit to Launcher handlers (both in titlebar and in top nav)
        const exitLauncherHandler = () => {
            if (this.platform?.game?.exitToLauncher) {
                this.platform.game.exitToLauncher();
            } else if (window.TeleTermNative?.game?.exitToLauncher) {
                window.TeleTermNative.game.exitToLauncher();
            } else {
                this.showLauncher();
            }
        };

        const btnTbLauncher = document.getElementById('btn-tb-launcher');
        if (btnTbLauncher) {
            btnTbLauncher.addEventListener('click', exitLauncherHandler);
        }

        const btnNavLauncher = document.getElementById('btn-open-launcher');
        if (btnNavLauncher) {
            btnNavLauncher.addEventListener('click', exitLauncherHandler);
        }

        // Titlebar events
        if (this.platform && typeof this.platform.isDesktop === 'function' && this.platform.isDesktop()) {
            if (this.dom.btnTbMin) this.dom.btnTbMin.addEventListener('click', () => this.platform.window.minimize());
            if (this.dom.btnTbMax) this.dom.btnTbMax.addEventListener('click', () => this.platform.window.toggleMaximize());
            if (this.dom.btnTbClose) this.dom.btnTbClose.addEventListener('click', () => this.platform.window.close());
            if (this.dom.btnTbFs) {
                this.dom.btnTbFs.addEventListener('click', async () => {
                    const isFs = await this.platform.window.isFullscreen();
                    await this.platform.window.setFullscreen(!isFs);
                });
            }
        }
    }

    bindPlatformEvents() {
        if (!this.platform) return;

        // Deep link auth listener
        if (this.platform.deepLink && typeof this.platform.deepLink.onAuthCallback === 'function') {
            this.platform.deepLink.onAuthCallback(async (authData) => {
                if (authData?.code) {
                    const response = await fetch('/api/auth/desktop/exchange', {
                        method: 'POST', credentials: 'same-origin',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: authData.code })
                    });
                    if (!response.ok) return;
                } else if (authData?.type === 'teleterm_auth_error') {
                    if (this.dom.loaderSub) this.dom.loaderSub.textContent = authData.error;
                    return;
                }
                const valid = await this.verifyAndLoadSession();
                if (valid) this.dom.loginModal.classList.add('hidden');
            });
        }

        // Backend health listener
        if (this.platform.backend && typeof this.platform.backend.onStatusChange === 'function') {
            this.platform.backend.onStatusChange((statusInfo) => {
                this.updateServerStatus(statusInfo.status === 'RUNNING' ? 'ONLINE' : 'OFFLINE');
            });
        }
    }

    bindKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            if (!this.isLauncherVisible) return;

            if (e.key === 'Enter') {
                if (!this.dom.loginModal.classList.contains('hidden')) return;

                e.preventDefault();
                this.handleStartVibing();
            }

            // F11 fullscreen
            if (e.key === 'F11' && this.platform?.window) {
                e.preventDefault();
                this.platform.window.isFullscreen().then((isFs) => {
                    this.platform.window.setFullscreen(!isFs);
                });
            }
        });
    }

    // --- State Machine Reactions ---
    handleStateChange(state, data) {
        if (this.dom.progressBar) {
            this.dom.progressBar.style.width = `${data.progress || 0}%`;
        }
        if (this.dom.loaderSub) {
            this.dom.loaderSub.textContent = data.message || '';
        }

        switch (state) {
            case LauncherState.BOOTING:
            case LauncherState.CHECKING_SESSION:
            case LauncherState.READY:
                this.dom.loader.classList.add('hidden');
                break;
            case LauncherState.AUTHENTICATING:
                this.dom.loginModal.classList.remove('hidden');
                break;
            case LauncherState.CONNECTING:
            case LauncherState.LOADING_GAME:
            case LauncherState.SYNCHRONIZING:
            case LauncherState.ENTERING_WORLD:
                this.dom.loader.classList.remove('hidden');
                break;
            case LauncherState.IN_WORLD:
                this.dom.loader.classList.add('hidden');
                this.hideLauncher();
                break;
            case LauncherState.ERROR:
                this.dom.loader.classList.remove('hidden');
                this.dom.loaderTitle.textContent = 'Launch Error';
                this.dom.loaderSub.textContent = data.error?.message || 'Could not connect.';
                setTimeout(() => {
                    this.dom.loader.classList.add('hidden');
                    this.stateMachine.transition(LauncherState.READY, { message: 'Ready' });
                }, 2500);
                break;
        }
    }

    // --- Boot Pipeline ---
    async runBootPipeline() {
        this.stateMachine.transition(LauncherState.BOOTING, { progress: 20, message: 'Booting...' });

        // Step 1: Check existing authenticated session
        this.stateMachine.transition(LauncherState.CHECKING_SESSION, { progress: 40, message: 'Checking session...' });
        const sessionValid = await this.verifyAndLoadSession();

        // If no valid session, load stored guest profile or show ready state
        if (!sessionValid) {
            await this.initDefaultAccount();
        }

        // Step 2: Check backend health
        await this.checkBackendStatus();

        // Step 3: Transition to READY
        this.stateMachine.transition(LauncherState.READY, { progress: 100, message: 'Ready' });
        if (this.dom.btnStartVibing) {
            this.dom.btnStartVibing.focus();
        }
    }

    async initDefaultAccount() {
        const profile = {
            displayName: 'Đăng nhập để chơi',
            level: 1,
            title: 'Novice'
        };
        this.currentUser = profile;
        this.updateProfileUI(profile);
    }

    async verifyAndLoadSession() {
        try {
            const res = await fetch('/api/auth/desktop/session', { credentials: 'same-origin' });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.authenticated) {
                    this.currentUser = data.profile;
                    this.dom.btnDeleteAccount.hidden = false;
                    this.dom.btnLogoutAccount.hidden = false;
                    this.updateProfileUI(data.profile);
                    return true;
                }
            }
        } catch (e) {}
        return false;
    }

    async handleOAuthLogin(provider) {
        if (this.platform?.auth) {
            const result = await this.platform.auth.startOAuth(provider);
            if (result?.success === false && this.dom.loaderSub) this.dom.loaderSub.textContent = 'Đăng nhập OAuth hiện chưa được cấu hình.';
        }
    }

    async deleteAccount() {
        if (!window.confirm('Xóa tài khoản cùng toàn bộ hồ sơ, tiến trình và tin nhắn của bạn?')) return;
        const response = await fetch('/api/auth/desktop/account', { method: 'DELETE', credentials: 'same-origin' });
        if (!response.ok) return;
        localStorage.removeItem('teleterm_dev_name');
        localStorage.removeItem('teleterm_dev_id');
        this.currentUser = null;
        this.dom.btnDeleteAccount.hidden = true;
        this.dom.btnLogoutAccount.hidden = true;
        this.updateProfileUI({ displayName: 'Đăng nhập để chơi', level: 1, title: 'Tài khoản cần xác minh' });
        this.dom.loginModal.classList.remove('hidden');
    }

    async logoutAccount() {
        await fetch('/api/auth/desktop/logout', { method: 'POST', credentials: 'same-origin' });
        localStorage.removeItem('teleterm_dev_name');
        localStorage.removeItem('teleterm_dev_id');
        window.location.reload();
    }

    updateProfileUI(profile) {
        if (!profile) return;
        const name = profile.displayName || profile.username || 'Traveler';
        const level = profile.level || 1;
        const title = profile.title || 'Novice';

        if (this.dom.accountName) this.dom.accountName.textContent = name;
        if (this.dom.accountRank) this.dom.accountRank.textContent = `Lv. ${level} ${title}`;

        localStorage.setItem('teleterm_dev_name', name);
    }

    // --- Server Status ---
    async checkBackendStatus() {
        try {
            const statusObj = await this.platform.backend.getStatus();
            this.updateServerStatus(statusObj.status === 'RUNNING' ? 'ONLINE' : 'OFFLINE');
        } catch (e) {
            this.updateServerStatus('ONLINE');
        }
    }

    updateServerStatus(status) {
        this.serverStatus = status;
        if (!this.dom.serverStatus || !this.dom.serverText) return;

        this.dom.serverStatus.className = `launcher-server-status status-${status.toLowerCase()}`;
        this.dom.serverText.textContent = status === 'ONLINE' ? 'Online' : status === 'CONNECTING' ? 'Connecting' : 'Offline';
    }

    startServerPingLoop() {
        setInterval(() => this.checkBackendStatus(), 10000);
    }

    // --- Real Launch Pipeline ---
    async handleStartVibing() {
        if (this.stateMachine.getState() === LauncherState.ENTERING_WORLD) return;

        try {
            // 1. Connecting
            this.stateMachine.transition(LauncherState.CONNECTING, { progress: 25, message: 'Connecting to ConPTY...' });
            await this.checkBackendStatus();

            // 2. Loading
            this.stateMachine.transition(LauncherState.LOADING_GAME, { progress: 55, message: 'Waking the Valley...' });
            await this.waitForGameReady();

            // 3. Synchronizing
            this.stateMachine.transition(LauncherState.SYNCHRONIZING, { progress: 80, message: 'Syncing character...' });
            if (window.multiplayerClient && typeof window.multiplayerClient.connect === 'function') {
                if (!window.multiplayerClient.isConnected) window.multiplayerClient.connect();
            }
            if (window.playerInventory && typeof window.playerInventory.loadInventory === 'function') {
                await window.playerInventory.loadInventory();
            }

            // 4. Entering World
            this.stateMachine.transition(LauncherState.ENTERING_WORLD, { progress: 95, message: 'Entering world...' });
            await new Promise((r) => setTimeout(r, 400));

            // 5. In World
            this.stateMachine.transition(LauncherState.IN_WORLD, { progress: 100, message: 'Ready' });

        } catch (err) {
            this.stateMachine.setError(err.message || 'Could not launch world.');
        }
    }

    async waitForGameReady() {
        let attempts = 0;
        while (attempts < 20) {
            if (window.openWorld3D && window.openWorld3D.scene) return true;
            await new Promise((r) => setTimeout(r, 150));
            attempts++;
        }
        return true;
    }

    hideLauncher() {
        this.isLauncherVisible = false;
        document.body.classList.remove('launcher-active');
        if (this.dom.overlay) {
            this.dom.overlay.classList.add('fade-out');
            setTimeout(() => {
                this.dom.overlay.style.display = 'none';
            }, 500);
        }

        const canvas = document.getElementById('open-world-canvas');
        if (canvas) canvas.focus();
    }

    showLauncher() {
        this.isLauncherVisible = true;
        document.body.classList.add('launcher-active');
        if (this.dom.overlay) {
            this.dom.overlay.style.display = 'flex';
            this.dom.overlay.classList.remove('fade-out');
        }
        this.stateMachine.transition(LauncherState.READY, { message: 'Ready' });
        if (this.dom.btnStartVibing) this.dom.btnStartVibing.focus();
    }

    // Ambient Sakura Falling Canvas
    startPetalsParticleCanvas() {
        const canvas = document.getElementById('launcher-petals-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const petalCount = 28; // Subtle and restrained, not distracting
        const petals = [];

        for (let i = 0; i < petalCount; i++) {
            petals.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 5 + 4,
                speedX: Math.random() * 1.2 + 0.4,
                speedY: Math.random() * 0.8 + 0.6,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.02,
                opacity: Math.random() * 0.35 + 0.25
            });
        }

        const render = () => {
            if (!this.isLauncherVisible) {
                requestAnimationFrame(render);
                return;
            }

            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < petals.length; i++) {
                const p = petals[i];
                p.x += p.speedX;
                p.y += p.speedY;
                p.rotation += p.rotSpeed;

                if (p.y > height + 20) { p.y = -20; p.x = Math.random() * width; }
                if (p.x > width + 20) { p.x = -20; }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);
                ctx.fillStyle = `rgba(244, 163, 190, ${p.opacity})`;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            requestAnimationFrame(render);
        };

        requestAnimationFrame(render);
    }
}
