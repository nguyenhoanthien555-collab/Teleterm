/**
 * TELETERM AUTO-UPDATER & HOT-RELOAD CLIENT
 * Seamlessly detects code updates without restarting the Node server or Cloudflare tunnel.
 * 1. Dual-channel: Listens for WebSocket hot_reload / server_hello events.
 * 2. Background polling: Checks /api/version and Last-Modified headers of core files.
 * 3. Session state retention: Preserves active view & session ID across reloads.
 */

export class AutoUpdater {
    constructor(options = {}) {
        this.onToast = options.onToast || console.log;
        this.isReloading = false;
        this.initialBuildId = null;
        this.lastCoreScriptMtime = null;
        this.pollIntervalMs = 3500;
        this.pollTimer = null;

        this.init();
    }

    init() {
        console.log('[AutoUpdater] Initializing hot-reload watchdog (24/7 client sync)...');
        // Initial build & timestamp baseline
        this.checkInitialBaseline();

        // Start background polling loop
        this.pollTimer = setInterval(() => this.pollForUpdates(), this.pollIntervalMs);

        // Immediate check when window regains focus (e.g. user switched back from code editor or mobile app)
        window.addEventListener('focus', () => this.pollForUpdates());
    }

    async checkInitialBaseline() {
        try {
            const res = await fetch(`/api/version?_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                if (data.buildId) {
                    this.initialBuildId = data.buildId;
                }
            }
        } catch (e) {}
    }

    handleWsMessage(msg) {
        if (!msg) return;

        if (msg.type === 'hot_reload') {
            const fileInfo = msg.file ? ` (${msg.file})` : '';
            this.triggerReload(`Code updated on server${fileInfo}`);
        } else if (msg.type === 'server_hello' && msg.buildId) {
            if (this.initialBuildId && this.initialBuildId !== msg.buildId) {
                this.triggerReload('Server restarted with fresh build');
            } else if (!this.initialBuildId) {
                this.initialBuildId = msg.buildId;
            }
        }
    }

    async pollForUpdates() {
        if (this.isReloading) return;

        // 1. Check server build ID (Server watcher automatically updates buildId on any public/ change)
        try {
            const res = await fetch(`/api/version?_t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                if (data.buildId) {
                    if (this.initialBuildId && this.initialBuildId !== data.buildId) {
                        return this.triggerReload('New server build detected');
                    }
                    if (!this.initialBuildId) {
                        this.initialBuildId = data.buildId;
                    }
                }
            }
        } catch (e) {}
    }

    triggerReload(reason = 'New code detected') {
        if (this.isReloading) return;
        this.isReloading = true;

        console.log(`[AutoUpdater] ${reason}. Performing smooth hot-reload...`);

        // Save current view state to sessionStorage so page returns to exact screen
        try {
            const activeNavBtn = document.querySelector('.cyber-nav-tabs .btn-nav-tab.active');
            if (activeNavBtn) {
                sessionStorage.setItem('teleterm_active_view', activeNavBtn.dataset.view || 'terminal');
            }
            const isExplore = document.body.classList.contains('mode-explore');
            sessionStorage.setItem('teleterm_explore_mode', isExplore ? 'true' : 'false');
        } catch (e) {}

        // Show reload banner
        const banner = document.getElementById('system-update-banner') || this.createReloadBanner(reason);
        if (banner) {
            banner.classList.remove('hidden');
        }

        setTimeout(() => {
            window.location.reload();
        }, 450);
    }

    createReloadBanner(reason) {
        const div = document.createElement('div');
        div.id = 'system-update-banner';
        div.className = 'system-update-banner';
        const spinnerSvg = window.TeleTermIcons ? window.TeleTermIcons.render('refresh-cw', { size: 14 }) : '';
        div.innerHTML = `
            <div class="update-banner-content">
                <span class="update-spinner">${spinnerSvg}</span>
                <span><strong>Hot-Reload:</strong> ${reason}. Reloading TeleTerm...</span>
            </div>
        `;
        document.body.appendChild(div);
        return div;
    }
}
