/**
 * TELETERM HUD WIDGETS & SYSTEM CONTROLS
 * Hardware telemetry monitoring, session list management, and system actions hub
 */

export class HudWidgets {
    constructor(terminalManager, cyberdeck3D) {
        this.terminalManager = terminalManager;
        this.cyberdeck3D = cyberdeck3D;

        this.pollTimer = null;
        this.sessions = [];
        this.activeSessionId = null;

        this.init();
    }

    init() {
        this.bindModalEvents();
        this.startTelemetryPolling();
        this.refreshSessions();

        // Terminal Top Action Buttons
        const btnClear = document.getElementById('btn-term-clear');
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                this.terminalManager.clear();
                this.showToast('Cleared terminal screen', 'info');
            });
        }

        const btnAddSession = document.getElementById('btn-add-session');
        if (btnAddSession) {
            btnAddSession.addEventListener('click', () => this.createNewSession());
        }

        const btnNavFocus = document.getElementById('btn-nav-focus');
        if (btnNavFocus) {
            btnNavFocus.addEventListener('click', () => {
                if (!this.cyberdeck3D) return; // Guard: cyberdeck3D may be null in Open World mode
                const current = this.cyberdeck3D.toggleMode();
                const isFocus = current === 'focus';
                btnNavFocus.classList.toggle('active', isFocus);
                const thumbOrbit = document.getElementById('thumb-orbit');
                if (thumbOrbit) {
                    const iconSvg = window.TeleTermIcons 
                        ? (isFocus ? window.TeleTermIcons.render('maximize', { size: 14 }) : window.TeleTermIcons.render('orbit', { size: 14 }))
                        : '';
                    thumbOrbit.innerHTML = `${iconSvg} <span>${isFocus ? 'Focus' : '3D'}</span>`;
                    thumbOrbit.classList.toggle('btn-highlight', !isFocus);
                }
            });
        }
    }

    bindModalEvents() {
        const modal = document.getElementById('cyber-hub-modal');
        const closeBtn = document.getElementById('btn-close-hub');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeHubModal());
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeHubModal();
            });
        }

        // Action Tiles
        const bindTile = (id, handler) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', handler);
        };

        // Quick Claude
        bindTile('tile-claude', async () => {
            this.closeHubModal();
            this.showToast('Launching Claude Code...', 'info');
            try {
                const res = await fetch('/api/sessions/quick-claude', { method: 'POST' });
                const data = await res.json();
                if (data.success && data.session) {
                    this.showToast('Launched Claude Code session!', 'success');
                    this.refreshSessions();
                    this.terminalManager.switchSession(data.session.id);
                }
            } catch (err) {
                this.showToast('Cannot launch Claude: ' + err.message, 'error');
            }
        });

        // Screenshot (Desktop Peek)
        bindTile('tile-screenshot', () => {
            this.closeHubModal();
            if (window.__teleTermApp && window.__teleTermApp.toolsDrawer) {
                window.__teleTermApp.toolsDrawer.openDesktopPeek();
            }
        });

        // Turn screen off
        bindTile('tile-screen-off', async () => {
            if (!confirm('Are you sure you want to turn off the PC display?')) return;
            try {
                const res = await fetch('/api/system/screen-off', { method: 'POST' });
                const data = await res.json();
                this.showToast(data.message || 'PC display turned off', 'success');
            } catch (err) {
                this.showToast('Error turning off display: ' + err.message, 'error');
            }
        });

        // Lock Windows
        bindTile('tile-lock-pc', async () => {
            if (!confirm('Lock computer screen (Win+L)?')) return;
            try {
                const res = await fetch('/api/system/lock-windows', { method: 'POST' });
                const data = await res.json();
                this.showToast(data.message || 'Computer locked', 'success');
            } catch (err) {
                this.showToast('Error locking computer: ' + err.message, 'error');
            }
        });

        // Reload App
        bindTile('tile-reload', () => {
            window.location.reload();
        });
    }

    openHubModal() {
        const modal = document.getElementById('cyber-hub-modal');
        if (modal) modal.classList.remove('hidden');
    }

    closeHubModal() {
        const modal = document.getElementById('cyber-hub-modal');
        if (modal) modal.classList.add('hidden');
    }

    startTelemetryPolling() {
        const fetchStatus = async () => {
            try {
                const res = await fetch('/api/system-status');
                if (!res.ok) return;
                const data = await res.json();
                if (data) this.updateTelemetryUI(data);
            } catch (e) {
                // If API failed, keep stable previous or show neutral state rather than fabricating data
                try {
                    const fallback = await fetch('/api/version');
                    const d = await fallback.json();
                    if (!d.online) {
                        // Keep previous value to avoid visual jitter
                    }
                } catch (err) {}
            }
        };

        fetchStatus();
        this.pollTimer = setInterval(fetchStatus, 3000);
    }

    updateTelemetryUI(stats) {
        if (!stats) return;
        const cpu = (stats.cpu !== undefined) ? Math.round(stats.cpu) : (stats.cpuPercent !== undefined ? Math.round(stats.cpuPercent) : null);
        const ram = (stats.ram !== undefined) ? Math.round(stats.ram) : (stats.memory?.usedPercent !== undefined ? Math.round(stats.memory.usedPercent) : null);
        const disk = (stats.disk !== undefined) ? Math.round(stats.disk) : (stats.disks && stats.disks[0] ? Math.round(100 - stats.disks[0].freePercent) : null);

        // Update 3D Cyber engine
        if (this.cyberdeck3D && cpu !== null && ram !== null) {
            this.cyberdeck3D.updateTelemetry({ cpu, ram });
        }

        // Top nav chips with truthful, non-jittery reading
        const topCpu = document.getElementById('top-cpu-chip');
        if (topCpu && cpu !== null) topCpu.textContent = `${cpu}%`;
        const topRam = document.getElementById('top-ram-chip');
        if (topRam && ram !== null) topRam.textContent = `${ram}%`;

        // Left HUD meters
        const mCpu = document.getElementById('meter-cpu');
        const vCpu = document.getElementById('val-cpu');
        if (mCpu && cpu !== null) mCpu.style.width = `${cpu}%`;
        if (vCpu && cpu !== null) vCpu.textContent = `${cpu}%`;

        const mRam = document.getElementById('meter-ram');
        const vRam = document.getElementById('val-ram');
        if (mRam && ram !== null) mRam.style.width = `${ram}%`;
        if (vRam && ram !== null) vRam.textContent = `${ram}%`;

        const mDisk = document.getElementById('meter-disk');
        const vDisk = document.getElementById('val-disk');
        if (mDisk && disk !== null) mDisk.style.width = `${disk}%`;
        if (vDisk && disk !== null) vDisk.textContent = `${disk}%`;
    }

    async refreshSessions() {
        try {
            const res = await fetch('/api/sessions');
            if (!res.ok) return;
            const data = await res.json();
            if (data.sessions) {
                this.sessions = data.sessions;
                this.renderSessionsList();
            }
        } catch (e) {
            console.warn('[Sessions Refresh]', e);
        }
    }

    renderSessionsList() {
        const container = document.getElementById('session-list-container');
        if (!container) return;
        container.innerHTML = '';

        if (this.sessions.length === 0) {
            container.innerHTML = '<div style="color:var(--text-dim);font-size:11px;padding:8px;">No sessions yet</div>';
            return;
        }

        this.sessions.forEach(s => {
            const card = document.createElement('div');
            card.className = `session-item-card ${s.id === this.activeSessionId ? 'active' : ''}`;
            const sessionIcon = window.TeleTermIcons ? window.TeleTermIcons.render('terminal', { size: 13 }) : '';
            card.innerHTML = `
                <span class="session-name" style="display:inline-flex;align-items:center;gap:6px;">${sessionIcon} ${s.name || s.shellName || 'Terminal'}</span>
                <span class="session-badge">${s.shellId || 'pty'}</span>
            `;
            card.addEventListener('click', () => {
                this.activeSessionId = s.id;
                this.terminalManager.switchSession(s.id);
                this.renderSessionsList();
            });
            container.appendChild(card);
        });
    }

    async createNewSession() {
        try {
            const res = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'PowerShell' })
            });
            const data = await res.json();
            if (data.session) {
                this.showToast(`Created session ${data.session.name}`, 'success');
                await this.refreshSessions();
                this.terminalManager.switchSession(data.session.id);
            }
        } catch (err) {
            this.showToast('Error creating session: ' + err.message, 'error');
        }
    }

    showToast(message, type = 'info') {
        // User directive: Only display toasts if it is an error; suppress routine info spam
        if (type !== 'error') return;

        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast-item';
        toast.style.borderColor = 'var(--cyber-rose)';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.transition = 'all 0.2s';
            setTimeout(() => toast.remove(), 250);
        }, 2800);
    }
}
