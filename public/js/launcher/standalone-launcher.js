/**
 * TeleTerm Standalone Desktop Launcher Logic
 * Controls public/launcher.html: Sakura animation, START VIBING transition,
 * session management, titlebar window controls, server status health checks.
 */

export function initStandaloneLauncher() {
    console.log('[StandaloneLauncher] Initializing dedicated launcher client...');

    const platform = window.TeleTermPlatform;
    if (new URLSearchParams(window.location.search).get('login') === '1') {
        document.getElementById('modal-launcher-login')?.classList.remove('hidden');
    }

    // DOM Elements
    const dom = {
        sakuraCanvas: document.getElementById('launcher-petals-canvas'),
        btnStartVibing: document.getElementById('btn-start-vibing'),
        btnSettings: document.getElementById('btn-launcher-settings'),
        settingsModal: document.getElementById('modal-graphics-settings'),
        btnCloseSettings: document.getElementById('btn-close-graphics-modal'),
        btnDoneSettings: document.getElementById('btn-done-graphics-settings'),
        accountCapsule: document.getElementById('launcher-account-capsule'),
        accountName: document.getElementById('launcher-account-name'),
        accountRank: document.getElementById('launcher-account-rank'),
        loginModal: document.getElementById('modal-launcher-login'),
        btnCloseLogin: document.getElementById('btn-close-login-modal'),
        btnLoginGoogle: document.getElementById('btn-login-google'),
        btnLoginGithub: document.getElementById('btn-login-github'),
        btnLogoutAccount: document.getElementById('btn-logout-account'),
        btnDeleteAccount: document.getElementById('btn-delete-account'),
        serverStatus: document.getElementById('launcher-server-status'),
        serverText: document.getElementById('launcher-server-text'),
        launchLoader: document.getElementById('launcher-launch-loader'),
        loaderTitle: document.getElementById('launch-loader-title'),
        loaderSub: document.getElementById('launch-loader-sub'),
        progressBar: document.getElementById('launch-progress-bar'),
        btnTbMin: document.getElementById('btn-tb-minimize'),
        btnTbClose: document.getElementById('btn-tb-close')
    };

    // 1. Sakura Canvas Ambient Effect (60fps)
    startSakuraAnimation(dom.sakuraCanvas);

    // 2. Load Stored Account Profile
    loadAccountProfile();

    // 3. Server Health Ping Loop
    checkServerHealth();
    setInterval(checkServerHealth, 6000);

    // 4. Titlebar Window Controls
    if (dom.btnTbMin) {
        dom.btnTbMin.addEventListener('click', () => {
            if (platform?.window?.minimize) platform.window.minimize();
        });
    }
    if (dom.btnTbClose) {
        dom.btnTbClose.addEventListener('click', () => {
            if (platform?.window?.close) platform.window.close();
        });
    }

    // 5. Settings Modal Controls
    if (dom.btnSettings) {
        dom.btnSettings.addEventListener('click', () => {
            if (dom.settingsModal) dom.settingsModal.classList.remove('hidden');
        });
    }
    if (dom.btnCloseSettings) {
        dom.btnCloseSettings.addEventListener('click', () => {
            if (dom.settingsModal) dom.settingsModal.classList.add('hidden');
        });
    }
    if (dom.btnDoneSettings) {
        dom.btnDoneSettings.addEventListener('click', () => {
            if (dom.settingsModal) dom.settingsModal.classList.add('hidden');
        });
    }

    // 6. Account & Login Modal Controls
    if (dom.accountCapsule) {
        dom.accountCapsule.addEventListener('click', () => {
            if (dom.loginModal) dom.loginModal.classList.remove('hidden');
        });
    }
    if (dom.btnCloseLogin) {
        dom.btnCloseLogin.addEventListener('click', () => {
            if (dom.loginModal) dom.loginModal.classList.add('hidden');
        });
    }

    // Login actions
    if (dom.btnLoginGoogle) {
        dom.btnLoginGoogle.addEventListener('click', () => handleOAuthLogin('google'));
    }
    if (dom.btnLoginGithub) {
        dom.btnLoginGithub.addEventListener('click', () => handleOAuthLogin('github'));
    }
    dom.btnDeleteAccount?.addEventListener('click', async () => {
        if (!window.confirm('Xóa tài khoản cùng toàn bộ hồ sơ, tiến trình và tin nhắn của bạn?')) return;
        const response = await fetch('/api/auth/desktop/account', { method: 'DELETE', credentials: 'same-origin' });
        if (!response.ok) return;
        localStorage.removeItem('teleterm_dev_name');
        localStorage.removeItem('teleterm_dev_id');
        dom.btnDeleteAccount.hidden = true;
        if (dom.btnLogoutAccount) dom.btnLogoutAccount.hidden = true;
        updateProfile({ displayName: 'Đăng nhập để chơi', level: 1, title: 'Tài khoản cần xác minh' });
        if (dom.loginModal) dom.loginModal.classList.remove('hidden');
    });
    dom.btnLogoutAccount?.addEventListener('click', async () => {
        await fetch('/api/auth/desktop/logout', { method: 'POST', credentials: 'same-origin' });
        localStorage.removeItem('teleterm_dev_name');
        localStorage.removeItem('teleterm_dev_id');
        window.location.reload();
    });
    if (platform?.deepLink?.onAuthCallback) {
        platform.deepLink.onAuthCallback(async (authEvent) => {
            if (authEvent?.type === 'teleterm_auth_error') return;
            await loadAccountProfile();
            if (dom.loginModal) dom.loginModal.classList.add('hidden');
        });
    }

    // 7. Hero CTA: START VIBING
    let isLaunching = false;
    async function startVibing() {
        if (isLaunching) return;
        isLaunching = true;

        dom.launchLoader.classList.remove('hidden');
        dom.loaderTitle.textContent = 'WAKING THE VALLEY';
        dom.loaderSub.textContent = 'Connecting to ConPTY Gateway...';
        dom.progressBar.style.width = '25%';

        await delay(350);
        dom.loaderSub.textContent = 'Syncing developer profile...';
        dom.progressBar.style.width = '60%';

        await delay(350);
        dom.loaderSub.textContent = 'Starting Game Client...';
        dom.progressBar.style.width = '95%';

        await delay(300);

        // Invoke Native Launch or Navigate
        try {
            if (window.TeleTermNative?.game?.launch) {
                await window.TeleTermNative.game.launch();
            } else if (platform?.game?.launch) {
                await platform.game.launch();
            } else {
                window.location.href = '/?direct=1';
            }
        } catch (e) {
            console.error('Launch failed:', e);
            window.location.href = '/?direct=1';
        }

        setTimeout(() => {
            dom.launchLoader.classList.add('hidden');
            isLaunching = false;
        }, 1200);
    }

    if (dom.btnStartVibing) {
        dom.btnStartVibing.addEventListener('click', startVibing);
    }

    // 8. Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (dom.loginModal && !dom.loginModal.classList.contains('hidden')) return;
            if (dom.settingsModal && !dom.settingsModal.classList.contains('hidden')) return;
            e.preventDefault();
            startVibing();
        } else if (e.key === 'Escape') {
            if (dom.loginModal) dom.loginModal.classList.add('hidden');
            if (dom.settingsModal) dom.settingsModal.classList.add('hidden');
        }
    });

    // Helper Functions
    async function checkServerHealth() {
        try {
            const res = await fetch('/api/version', { timeout: 3000 });
            if (res.ok) {
                dom.serverStatus.className = 'launcher-server-status';
                dom.serverText.textContent = 'Online';
            } else {
                dom.serverStatus.className = 'launcher-server-status status-connecting';
                dom.serverText.textContent = 'Connecting';
            }
        } catch (e) {
            dom.serverStatus.className = 'launcher-server-status status-connecting';
            dom.serverText.textContent = 'Connecting';
        }
    }

    async function loadAccountProfile() {
        try {
            const res = await fetch('/api/auth/desktop/session', { credentials: 'same-origin' });
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.profile) {
                    if (dom.btnDeleteAccount) dom.btnDeleteAccount.hidden = false;
                    if (dom.btnLogoutAccount) dom.btnLogoutAccount.hidden = false;
                    updateProfile(data.profile);
                    return;
                }
            }
        }
        catch (e) {}
        updateProfile({ displayName: 'Đăng nhập để chơi', level: 1, title: 'Tài khoản cần xác minh' });
    }

    function handleOAuthLogin(provider) {
        if (platform?.auth?.startOAuth) {
            return platform.auth.startOAuth(provider).then(result => {
                if (result?.success === false && dom.serverText) dom.serverText.textContent = 'OAuth chưa được cấu hình';
            });
        }
    }

    function updateProfile(p) {
        const name = p.displayName || p.username || 'Traveler';
        const lv = p.level || 1;
        const title = p.title || 'Novice';
        if (dom.accountName) dom.accountName.textContent = name;
        if (dom.accountRank) dom.accountRank.textContent = `Lv. ${lv} ${title}`;
        localStorage.setItem('teleterm_dev_name', name);
    }
}

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// 60fps Sakura Petal Canvas Animation
function startSakuraAnimation(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const PETAL_COUNT = 36;
    const petals = [];

    for (let i = 0; i < PETAL_COUNT; i++) {
        petals.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 8 + 6,
            speedX: Math.random() * 0.8 + 0.3,
            speedY: Math.random() * 1.0 + 0.6,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02,
            opacity: Math.random() * 0.45 + 0.3
        });
    }

    function render() {
        ctx.clearRect(0, 0, width, height);

        for (const p of petals) {
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotSpeed;

            if (p.x > width + 20) p.x = -20;
            if (p.y > height + 20) p.y = -20;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.opacity;

            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#fda4af';
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 6;
            ctx.fill();

            ctx.restore();
        }

        requestAnimationFrame(render);
    }

    render();
}
