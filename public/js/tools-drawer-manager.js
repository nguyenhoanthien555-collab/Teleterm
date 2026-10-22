/**
 * TELETERM CYBER TOOLS DRAWER & DESKTOP PEEK CONTROLLER
 * Brings back 100% of legacy power tools:
 * - Interactive Desktop Peek (Live Screenshot with Refresh & Zoom)
 * - Localhost Web Preview (Reverse Proxy with Port Scanner)
 * - Remote File Explorer & Code Reader
 * - System Process Inspector & Killer
 * - Virtual PC Keyboard (F1-F12, Home, End, PgUp, PgDn) & Navigation D-Pad
 * - Bi-directional Clipboard Sync
 */

export class ToolsDrawerManager {
    constructor(terminalManager, options = {}) {
        this.terminalManager = terminalManager;
        this.onToast = options.onToast || console.log;
        this.onPulse = options.onPulse || null;

        // Modals
        this.drawerEl = document.getElementById('modal-tools-drawer');
        this.peekModalEl = document.getElementById('modal-desktop-peek');
        this.fileViewerModalEl = document.getElementById('modal-file-viewer');

        // Desktop Peek Elements
        this.peekImg = document.getElementById('peek-img');
        this.peekMeta = document.getElementById('peek-meta');
        this.btnRefreshPeek = document.getElementById('btn-refresh-peek');
        this.btnFullPeek = document.getElementById('btn-fullscreen-peek');
        this.btnClosePeek = document.getElementById('btn-close-peek');
        this.currentScreenshotUrl = '';

        // File Explorer & Folder Navigation State
        this.currentBrowsePath = '';
        this.fileListEl = document.getElementById('tools-file-list');
        this.filePathEl = document.getElementById('tools-current-path');
        this.pathInputEl = document.getElementById('tools-path-input');
        this.btnPathGo = document.getElementById('btn-path-go');
        this.drivesContainer = document.getElementById('drives-chips-list');
        this.btnSetTermCwd = document.getElementById('btn-set-term-cwd');
        this.btnNewTermHere = document.getElementById('btn-new-term-here');
        this.btnCopyDirPath = document.getElementById('btn-copy-dir-path');

        // Processes State
        this.processListEl = document.getElementById('tools-process-list');

        // Web Preview State
        this.portsContainer = document.getElementById('web-preview-ports');
        this.previewPortInput = document.getElementById('preview-port-input');
        this.btnOpenPreview = document.getElementById('btn-open-web-preview');
        this.btnScanPorts = document.getElementById('btn-scan-ports');
        this.previewIframe = document.getElementById('web-preview-iframe');

        // Sticky Key Modifiers
        this.stickyCtrl = false;
        this.stickyAlt = false;

        this.init();
    }

    vibrate(ms = 12) {
        if ('vibrate' in navigator) {
            try { navigator.vibrate(ms); } catch (e) {}
        }
    }

    init() {
        // Tab switching in tools drawer
        const tabBtns = document.querySelectorAll('.tools-nav-tab');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Close drawer buttons
        const btnCloseDrawer = document.getElementById('btn-close-tools-drawer');
        if (btnCloseDrawer) {
            btnCloseDrawer.addEventListener('click', () => this.close());
        }
        if (this.drawerEl) {
            this.drawerEl.addEventListener('click', (e) => {
                if (e.target === this.drawerEl) this.close();
            });
        }

        // Desktop Peek Controls
        if (this.btnClosePeek) {
            this.btnClosePeek.addEventListener('click', () => this.closeDesktopPeek());
        }
        if (this.peekModalEl) {
            this.peekModalEl.addEventListener('click', (e) => {
                if (e.target === this.peekModalEl) this.closeDesktopPeek();
            });
        }
        if (this.btnRefreshPeek) {
            this.btnRefreshPeek.addEventListener('click', () => {
                this.vibrate(15);
                this.loadDesktopScreenshot();
            });
        }
        if (this.btnFullPeek) {
            this.btnFullPeek.addEventListener('click', () => {
                if (this.currentScreenshotUrl) {
                    const w = window.open('');
                    w.document.write(`<title>PC Screenshot</title><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;"><img src="${this.currentScreenshotUrl}" style="max-width:100%;max-height:100%;object-fit:contain;"></body>`);
                }
            });
        }

        // File Viewer Close
        const btnCloseFileViewer = document.getElementById('btn-close-file-viewer');
        if (btnCloseFileViewer) {
            btnCloseFileViewer.addEventListener('click', () => {
                if (this.fileViewerModalEl) this.fileViewerModalEl.classList.add('hidden');
            });
        }

        // Bind Action Tiles in Control Tab
        this.bindControlTabActions();

        // Bind Web Preview
        this.bindWebPreviewActions();

        // Bind Folder Navigator Actions
        this.bindFolderNavigatorActions();

        // Bind PC Virtual Keys & D-Pad
        this.bindVirtualKeyboard();
    }

    bindControlTabActions() {
        const bind = (id, handler) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', handler);
        };

        // Graphics Quality Trigger
        bind('tool-graphics-settings', () => {
            this.close();
            if (window.graphicsManager) {
                window.graphicsManager.open();
            }
        });

        // Desktop Peek Trigger
        bind('tool-desktop-peek', () => {
            this.openDesktopPeek();
        });

        // Clipboard Read PC
        bind('tool-read-pc-clipboard', async () => {
            this.vibrate(15);
            this.onToast('Reading clipboard from PC...', 'info');
            try {
                const res = await fetch('/api/clipboard');
                const data = await res.json();
                if (data.success && data.text !== undefined) {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(data.text);
                        this.onToast(`Copied from PC to browser: "${data.text.substring(0, 30)}..."`, 'success');
                    } else {
                        prompt('PC Clipboard Content:', data.text);
                    }
                } else {
                    this.onToast('PC Clipboard is empty', 'info');
                }
            } catch (err) {
                this.onToast('Error reading clipboard: ' + err.message, 'error');
            }
        });

        // Clipboard Send to PC
        bind('tool-send-pc-clipboard', async () => {
            let text = '';
            if (navigator.clipboard && navigator.clipboard.readText) {
                try { text = await navigator.clipboard.readText(); } catch (e) {}
            }
            if (!text) {
                text = prompt('Enter text to send to PC clipboard:');
            }
            if (!text) return;

            this.vibrate(15);
            try {
                const res = await fetch('/api/clipboard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                const data = await res.json();
                if (data.success) {
                    this.onToast('Pasted content into PC clipboard!', 'success');
                }
            } catch (err) {
                this.onToast('Error sending to clipboard: ' + err.message, 'error');
            }
        });

        // Screen Off
        bind('tool-screen-off', async () => {
            if (!confirm('Are you sure you want to turn off the PC display?')) return;
            this.vibrate(20);
            try {
                const res = await fetch('/api/system/screen-off', { method: 'POST' });
                const data = await res.json();
                this.onToast(data.message || 'PC display turned off', 'success');
            } catch (err) {
                this.onToast('Error: ' + err.message, 'error');
            }
        });

        // Lock Windows
        bind('tool-lock-windows', async () => {
            if (!confirm('Lock Windows screen (Win + L)?')) return;
            this.vibrate(20);
            try {
                const res = await fetch('/api/system/lock-windows', { method: 'POST' });
                const data = await res.json();
                this.onToast(data.message || 'Computer locked', 'success');
            } catch (err) {
                this.onToast('Error: ' + err.message, 'error');
            }
        });

        // Watchdog
        bind('tool-smart-watchdog', async () => {
            this.vibrate(15);
            const activeSessionId = this.terminalManager.currentSessionId;
            if (!activeSessionId) {
                return this.onToast('No active PTY session to watch', 'error');
            }
            try {
                const res = await fetch(`/api/sessions/${activeSessionId}/watchdog`, { method: 'POST' });
                const data = await res.json();
                this.onToast(data.message || (data.armed ? 'Smart Watchdog armed!' : 'Watchdog disarmed'), 'success');
            } catch (err) {
                this.onToast('Watchdog error: ' + err.message, 'error');
            }
        });
    }

    bindWebPreviewActions() {
        if (this.btnScanPorts) {
            this.btnScanPorts.addEventListener('click', () => {
                this.vibrate(12);
                this.scanListeningPorts();
            });
        }

        if (this.btnOpenPreview) {
            this.btnOpenPreview.addEventListener('click', () => {
                const port = parseInt(this.previewPortInput.value.trim(), 10);
                if (!port || port < 1 || port > 65535) {
                    return this.onToast('Please enter a valid port (1-65535)', 'error');
                }
                this.openWebPreviewPort(port);
            });
        }
    }

    async scanListeningPorts() {
        this.onToast('Scanning active listening ports on PC...', 'info');
        if (this.portsContainer) {
            this.portsContainer.innerHTML = '<div style="color:var(--text-dim);font-size:11px;padding:8px;">Scanning ports...</div>';
        }

        try {
            const res = await fetch('/api/system/listening-ports');
            const data = await res.json();
            if (data.success && Array.isArray(data.ports)) {
                this.renderListeningPorts(data.ports);
                this.onToast(`Found ${data.ports.length} active ports`, 'success');
            }
        } catch (e) {
            this.onToast('Port scan error: ' + e.message, 'error');
        }
    }

    renderListeningPorts(ports) {
        if (!this.portsContainer) return;
        this.portsContainer.innerHTML = '';

        if (ports.length === 0) {
            this.portsContainer.innerHTML = '<div style="color:var(--text-dim);font-size:11px;padding:8px;">No active dev ports found</div>';
            return;
        }

        ports.forEach(p => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'cmd-chip';
            chip.style.fontSize = '12px';
            const globeSvg = window.TeleTermIcons ? window.TeleTermIcons.render('globe', { size: 12 }) : '';
            chip.innerHTML = `${globeSvg} <strong>:${p.port}</strong> <span style="opacity:0.6;font-size:10px;">${p.processName || ''}</span>`;
            chip.addEventListener('click', () => {
                this.vibrate(10);
                if (this.previewPortInput) this.previewPortInput.value = p.port;
                this.openWebPreviewPort(p.port);
            });
            this.portsContainer.appendChild(chip);
        });
    }

    openWebPreviewPort(port) {
        const url = `/proxy/${port}/`;
        if (this.previewIframe) {
            this.previewIframe.src = url;
            this.previewIframe.style.display = 'block';
        }
        this.onToast(`Loading localhost:${port} via Reverse Proxy...`, 'info');
    }

    // ==================== DESKTOP PEEK ====================
    async openDesktopPeek() {
        if (!this.peekModalEl) return;
        this.vibrate(15);
        this.peekModalEl.classList.remove('hidden');
        await this.loadDesktopScreenshot();
    }

    closeDesktopPeek() {
        if (this.peekModalEl) this.peekModalEl.classList.add('hidden');
    }

    async loadDesktopScreenshot() {
        if (this.peekMeta) this.peekMeta.textContent = 'Capturing desktop screenshot...';
        try {
            const res = await fetch(`/api/desktop/screenshot?_t=${Date.now()}`);
            const data = await res.json();
            const imgUrl = data.screenshot || data.dataUrl;

            if (data.success && imgUrl) {
                this.currentScreenshotUrl = imgUrl;
                if (this.peekImg) this.peekImg.src = imgUrl;

                const timeStr = new Date().toLocaleTimeString('en-US');
                if (this.peekMeta) {
                    this.peekMeta.textContent = `Captured at: ${timeStr} • ${data.width || 1920}x${data.height || 1080}px`;
                }
                this.onToast('Desktop screenshot updated!', 'success');
            } else {
                this.onToast('Screenshot error: ' + (data.message || 'No data'), 'error');
                if (this.peekMeta) this.peekMeta.textContent = 'Screenshot error';
            }
        } catch (e) {
            this.onToast('Connection error during screenshot: ' + e.message, 'error');
            if (this.peekMeta) this.peekMeta.textContent = 'Connection error';
        }
    }

    // ==================== FOLDER NAVIGATOR & FILE EXPLORER ====================
    bindFolderNavigatorActions() {
        // 1. Enter key in path input
        if (this.pathInputEl) {
            this.pathInputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const p = this.pathInputEl.value.trim();
                    if (p) this.loadFiles(p);
                }
            });
        }

        // 2. Go button click
        if (this.btnPathGo) {
            this.btnPathGo.addEventListener('click', () => {
                const p = this.pathInputEl?.value?.trim();
                if (p) this.loadFiles(p);
            });
        }

        // 3. Drive chips delegation
        if (this.drivesContainer) {
            this.drivesContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.btn-drive-chip');
                if (btn && btn.dataset.path) {
                    this.vibrate(10);
                    this.loadFiles(btn.dataset.path);
                }
            });
        }

        // 4. Set active terminal CWD (cd into directory)
        if (this.btnSetTermCwd) {
            this.btnSetTermCwd.addEventListener('click', () => {
                this.vibrate(12);
                if (!this.currentBrowsePath) return;
                const target = this.currentBrowsePath;
                if (window.teletermRunInTerminal) {
                    window.teletermRunInTerminal(`cd "${target}"`);
                } else if (this.terminalManager) {
                    this.terminalManager.executeCommand(`cd "${target}"`);
                }
                this.onToast(`Executed cd "${target}" in Terminal!`, 'success');
            });
        }

        // 5. New Terminal shell here
        if (this.btnNewTermHere) {
            this.btnNewTermHere.addEventListener('click', async () => {
                this.vibrate(15);
                if (!this.currentBrowsePath) return;
                const target = this.currentBrowsePath;
                try {
                    const parts = target.replace(/\\/g, '/').split('/').filter(Boolean);
                    const folderName = parts.pop() || 'Terminal';
                    const res = await fetch('/api/sessions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: folderName, cwd: target })
                    });
                    const data = await res.json();
                    if (data.success && data.session) {
                        if (this.terminalManager?.switchSession) {
                            this.terminalManager.switchSession(data.session.id);
                        }
                        this.close();
                        if (window.__teleTermApp) {
                            window.__teleTermApp.switchView('terminal');
                            window.__teleTermApp.setFocusMode(true);
                        }
                        this.onToast(`New terminal opened at: ${target}`, 'success');
                    } else {
                        this.onToast('Failed to create terminal: ' + (data.error || 'Unknown error'), 'error');
                    }
                } catch (err) {
                    this.onToast('Error: ' + err.message, 'error');
                }
            });
        }

        // 6. Copy Path to clipboard
        if (this.btnCopyDirPath) {
            this.btnCopyDirPath.addEventListener('click', async () => {
                this.vibrate(10);
                if (!this.currentBrowsePath) return;
                try {
                    if (navigator.clipboard?.writeText) {
                        await navigator.clipboard.writeText(this.currentBrowsePath);
                        this.onToast(`Copied path: ${this.currentBrowsePath}`, 'success');
                    } else {
                        prompt('Directory path:', this.currentBrowsePath);
                    }
                } catch (e) {
                    prompt('Directory path:', this.currentBrowsePath);
                }
            });
        }
    }

    renderDriveChips(drives, currentPath = '') {
        if (!this.drivesContainer) return;
        this.drivesContainer.innerHTML = '';
        if (Array.isArray(drives)) {
            drives.forEach(drv => {
                const btn = document.createElement('button');
                btn.type = 'button';
                const isCurrent = currentPath.toLowerCase().startsWith(drv.toLowerCase().replace(/\\$/, ''));
                btn.className = `btn-drive-chip ${isCurrent ? 'active' : ''}`;
                btn.dataset.path = drv;
                btn.textContent = drv;
                this.drivesContainer.appendChild(btn);
            });
        }
        // Home directory shortcut
        const homeBtn = document.createElement('button');
        homeBtn.type = 'button';
        homeBtn.className = `btn-drive-chip ${currentPath.includes('Users') ? 'active' : ''}`;
        homeBtn.dataset.path = '~';
        homeBtn.textContent = 'Home (~)';
        this.drivesContainer.appendChild(homeBtn);
    }

    async loadFiles(dirPath = '') {
        if (this.fileListEl) {
            this.fileListEl.innerHTML = '<div style="color:var(--text-dim);font-size:12px;padding:16px;">Loading file list...</div>';
        }

        try {
            const url = dirPath ? `/api/files/browse?path=${encodeURIComponent(dirPath)}` : '/api/files/browse';
            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                this.currentBrowsePath = data.currentPath;
                if (this.pathInputEl) this.pathInputEl.value = data.currentPath;
                if (this.filePathEl) this.filePathEl.textContent = data.currentPath;
                if (data.drives) {
                    this.renderDriveChips(data.drives, data.currentPath);
                }
                this.renderFileList(data.items, data.parentPath);
            } else {
                if (this.fileListEl) {
                    this.fileListEl.innerHTML = `<div style="color:var(--cyber-rose);font-size:12px;padding:16px;">Error: ${data.error || 'Cannot access path'}</div>`;
                }
            }
        } catch (e) {
            if (this.fileListEl) {
                this.fileListEl.innerHTML = `<div style="color:var(--cyber-rose);font-size:12px;padding:16px;">Error: ${e.message}</div>`;
            }
        }
    }

    renderFileList(items, parentPath) {
        if (!this.fileListEl) return;
        this.fileListEl.innerHTML = '';

        // Parent directory row
        if (parentPath) {
            const parentRow = document.createElement('div');
            parentRow.className = 'tools-file-row parent';
            const folderIcon = window.TeleTermIcons ? window.TeleTermIcons.render('folder', { size: 14 }) : '';
            parentRow.innerHTML = `<span>${folderIcon} .. (Parent Directory)</span>`;
            parentRow.addEventListener('click', () => {
                this.vibrate(10);
                this.loadFiles(parentPath);
            });
            this.fileListEl.appendChild(parentRow);
        }

        if (!items || items.length === 0) {
            this.fileListEl.innerHTML += '<div style="color:var(--text-dim);font-size:11px;padding:8px;">Directory is empty</div>';
            return;
        }

        items.forEach(item => {
            const row = document.createElement('div');
            row.className = `tools-file-row ${item.isDir ? 'is-dir' : 'is-file'}`;

            const icon = item.isDir
                ? (window.TeleTermIcons ? window.TeleTermIcons.render('folder', { size: 14, class: 'tt-icon-accent' }) : '')
                : this.getFileIcon(item.ext);
            const sizeStr = item.isDir ? '' : this.formatFileSize(item.size);

            row.innerHTML = `
                <div class="file-name-col">
                    <span>${icon}</span>
                    <span class="file-name-text">${item.name}</span>
                </div>
                <span class="file-size-col">${sizeStr}</span>
            `;

            row.addEventListener('click', () => {
                this.vibrate(10);
                if (item.isDir) {
                    this.loadFiles(item.path);
                } else {
                    this.openFileContent(item.path, item.name);
                }
            });

            this.fileListEl.appendChild(row);
        });

        if (window.TeleTermIcons) {
            window.TeleTermIcons.hydrate(this.fileListEl);
        }
    }

    async openFileContent(filePath, fileName) {
        this.onToast(`Reading file ${fileName}...`, 'info');
        try {
            const res = await fetch(`/api/files/read?path=${encodeURIComponent(filePath)}`);
            const data = await res.json();
            if (data.success && this.fileViewerModalEl) {
                const titleEl = document.getElementById('viewer-file-title');
                const contentEl = document.getElementById('viewer-file-content');
                if (titleEl) titleEl.textContent = fileName;
                if (contentEl) contentEl.textContent = data.content;
                this.fileViewerModalEl.classList.remove('hidden');
            } else {
                this.onToast(data.error || 'Cannot read this file', 'error');
            }
        } catch (e) {
            this.onToast('Error: ' + e.message, 'error');
        }
    }

    // ==================== PROCESS INSPECTOR ====================
    async loadProcesses() {
        if (!this.processListEl) return;
        this.processListEl.innerHTML = '<div style="color:var(--text-dim);font-size:12px;padding:16px;">Scanning process list...</div>';

        try {
            const res = await fetch('/api/system-terminals');
            const data = await res.json();
            if (data.success && Array.isArray(data.terminals)) {
                this.renderProcessList(data.terminals);
            }
        } catch (e) {
            if (this.processListEl) {
                this.processListEl.innerHTML = `<div style="color:var(--cyber-rose);font-size:12px;padding:16px;">Error: ${e.message}</div>`;
            }
        }
    }

    renderProcessList(rawList) {
        if (!this.processListEl) return;
        this.processListEl.innerHTML = '';

        const allowedShells = ['powershell', 'pwsh', 'cmd', 'windowsterminal', 'wt', 'bash'];
        const list = (rawList || []).filter(p => {
            const name = (p.name || '').toLowerCase();
            if (!allowedShells.some(sh => name.includes(sh))) return false;
            const preview = (p.preview || '').trim();
            if (!preview) return false;
            if (preview.includes('[TeleTerm]') || preview.includes('Server bi thoat') || preview.includes('Tu dong khoi dong lai')) {
                return false;
            }
            return true;
        });

        if (list.length === 0) {
            this.processListEl.innerHTML = '<div style="color:var(--text-dim);font-size:11px;padding:12px;">No active taskbar terminals found</div>';
            return;
        }

        list.forEach(p => {
            const row = document.createElement('div');
            row.className = 'tools-proc-card';
            const zapIcon = window.TeleTermIcons ? window.TeleTermIcons.render('zap', { size: 13, class: 'tt-icon-accent' }) : '';
            row.innerHTML = `
                <div class="proc-info-main">
                    <span class="proc-name">${zapIcon} ${p.name || 'PowerShell'}</span>
                    <span class="proc-pid">PID ${p.pid} • ${p.preview.split('\n')[0].substring(0, 45) || p.title || ''}</span>
                </div>
                <div class="proc-actions-col">
                    <button class="btn-attach-proc" title="Attach and view ANSI">Attach ⏎</button>
                </div>
            `;

            const btnAttach = row.querySelector('.btn-attach-proc');
            if (btnAttach) {
                btnAttach.addEventListener('click', () => {
                    this.vibrate(15);
                    this.terminalManager.switchSession(`sys-${p.pid}`);
                    this.close();
                    this.onToast(`Attached to process PID ${p.pid}`, 'success');
                });
            }

            this.processListEl.appendChild(row);
        });

        if (window.TeleTermIcons) {
            window.TeleTermIcons.hydrate(this.processListEl);
        }
    }

    // ==================== VIRTUAL PC KEYBOARD & D-PAD ====================
    bindVirtualKeyboard() {
        const send = (code) => {
            this.vibrate(10);
            let finalCode = code;
            if (this.stickyCtrl && !code.startsWith('\x1b')) {
                // Apply Ctrl
                const charCode = code.toUpperCase().charCodeAt(0);
                if (charCode >= 64 && charCode <= 95) {
                    finalCode = String.fromCharCode(charCode - 64);
                }
            }
            this.terminalManager.sendInput(finalCode);
            if (this.onPulse) this.onPulse();
        };

        const bindKey = (id, code) => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    send(code);
                });
            }
        };

        // D-Pad
        bindKey('dpad-up', '\x1b[A');
        bindKey('dpad-down', '\x1b[B');
        bindKey('dpad-left', '\x1b[D');
        bindKey('dpad-right', '\x1b[C');
        bindKey('dpad-center', '\r');

        // Special Keys
        bindKey('vkey-esc', '\x1b');
        bindKey('vkey-tab', '\t');
        bindKey('vkey-enter', '\r');
        bindKey('vkey-backspace', '\b');
        bindKey('vkey-home', '\x1b[H');
        bindKey('vkey-end', '\x1b[F');
        bindKey('vkey-pgup', '\x1b[5~');
        bindKey('vkey-pgdn', '\x1b[6~');
        bindKey('vkey-insert', '\x1b[2~');
        bindKey('vkey-delete', '\x1b[3~');

        // Function Keys F1 - F12
        for (let i = 1; i <= 12; i++) {
            const fCode = i < 5 ? `\x1bO${String.fromCharCode(80 + i - 1)}` : `\x1b[${10 + i}~`;
            bindKey(`vkey-f${i}`, fCode);
        }

        // Sticky Ctrl / Alt
        const btnCtrl = document.getElementById('vkey-ctrl');
        if (btnCtrl) {
            btnCtrl.addEventListener('click', () => {
                this.vibrate(15);
                this.stickyCtrl = !this.stickyCtrl;
                btnCtrl.classList.toggle('active', this.stickyCtrl);
            });
        }
        const btnAlt = document.getElementById('vkey-alt');
        if (btnAlt) {
            btnAlt.addEventListener('click', () => {
                this.vibrate(15);
                this.stickyAlt = !this.stickyAlt;
                btnAlt.classList.toggle('active', this.stickyAlt);
            });
        }
    }

    // ==================== DRAWER STATE ====================
    open(tabName = 'control') {
        if (!this.drawerEl) return;
        this.vibrate(15);
        this.drawerEl.classList.remove('hidden');
        this.switchTab(tabName);
    }

    close() {
        if (this.drawerEl) this.drawerEl.classList.add('hidden');
    }

    switchTab(tabName) {
        document.querySelectorAll('.tools-nav-tab').forEach(b => {
            b.classList.toggle('active', b.dataset.tab === tabName);
        });

        const tabs = ['control', 'files', 'processes', 'keys', 'graphics'];
        tabs.forEach(t => {
            const panel = document.getElementById(`tools-panel-${t}`);
            if (panel) panel.classList.toggle('hidden', t !== tabName);
        });

        if (tabName === 'files' && !this.currentBrowsePath) {
            this.loadFiles();
        } else if (tabName === 'processes') {
            this.loadProcesses();
        } else if (tabName === 'control') {
            this.scanListeningPorts();
        }
    }

    getFileIcon(ext) {
        if (window.TeleTermIcons) {
            const iconName = {
                '.js': 'file-text', '.ts': 'file-text', '.json': 'sliders', '.html': 'globe',
                '.css': 'palette', '.md': 'book-open', '.png': 'image', '.jpg': 'image',
                '.log': 'activity', '.ps1': 'terminal', '.sh': 'terminal', '.py': 'terminal'
            }[ext] || 'file-text';
            return window.TeleTermIcons.render(iconName, { size: 14 });
        }
        return `<span class="tt-icon tt-icon-14" data-icon="file-text"></span>`;
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}
