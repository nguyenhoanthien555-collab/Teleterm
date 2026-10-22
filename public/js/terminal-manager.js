/**
 * TELETERM TERMINAL MANAGER
 * Powered by @xterm/xterm (ESM) + FitAddon + WebLinksAddon + Resilient WebSocket
 */

import { Terminal } from '/vendor/xterm/xterm/lib/xterm.mjs';
import { FitAddon } from '/vendor/xterm/addon-fit/lib/addon-fit.mjs';
import { WebLinksAddon } from '/vendor/xterm/addon-web-links/lib/addon-web-links.mjs';

export class TerminalManager {
    constructor(mountElement, options = {}) {
        this.mountElement = mountElement;
        this.options = options;
        this.onPulse = options.onPulse || null;
        this.onStatusChange = options.onStatusChange || null;
        this.onSessionChange = options.onSessionChange || null;

        this.term = null;
        this.fitAddon = null;
        this.webLinksAddon = null;

        this.ws = null;
        this.isConnected = false;
        this.reconnectTimer = null;
        this.reconnectAttempts = 0;
        this.currentSessionId = null;
        this.sessionUnavailable = false;

        // Expose global bridge for '▶ Run in Terminal'
        window.teletermRunInTerminal = (cmd) => this.executeCommand(cmd);
        window.addEventListener('teleterm:run-in-terminal', (e) => {
            if (e.detail?.code) this.executeCommand(e.detail.code);
        });

        this.initTerminal();
        this.initSnippetBar();
        this.connectWebSocket();
    }

    initTerminal() {
        const isMobile = window.innerWidth <= 768;
        this.term = new Terminal({
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: isMobile ? 12 : 13.5,
            lineHeight: 1.25,
            letterSpacing: 0,
            cursorBlink: true,
            cursorStyle: 'block',
            allowProposedApi: true,
            scrollback: 5000,
            theme: {
                background: '#05070d',
                foreground: '#f8fafc',
                cursor: '#00f0ff',
                cursorAccent: '#04060a',
                selectionBackground: 'rgba(0, 240, 255, 0.28)',
                black: '#0a0f1d',
                red: '#f43f5e',
                green: '#10b981',
                yellow: '#f59e0b',
                blue: '#3b82f6',
                magenta: '#8b5cf6',
                cyan: '#00f0ff',
                white: '#f8fafc',
                brightBlack: '#475569',
                brightRed: '#fb7185',
                brightGreen: '#34d399',
                brightYellow: '#fbbf24',
                brightBlue: '#60a5fa',
                brightMagenta: '#a78bfa',
                brightCyan: '#38bdf8',
                brightWhite: '#ffffff'
            }
        });

        this.fitAddon = new FitAddon();
        this.term.loadAddon(this.fitAddon);

        this.webLinksAddon = new WebLinksAddon();
        this.term.loadAddon(this.webLinksAddon);

        this.term.open(this.mountElement);
        this.fitAddon.fit();

        this.currentCommandLine = '';

        // Handle user typing directly inside terminal
        this.term.onData((data) => {
            for (let i = 0; i < data.length; i++) {
                const char = data[i];
                if (char === '\r' || char === '\n') {
                    const cleanCmd = this.currentCommandLine.trim();
                    if (cleanCmd.length > 0) {
                        window.dispatchEvent(new CustomEvent('teleterm:command-executed', { detail: { command: cleanCmd } }));
                    } else {
                        window.dispatchEvent(new CustomEvent('teleterm:command-executed', { detail: { command: 'prompt' } }));
                    }
                    this.currentCommandLine = '';
                } else if (char === '\x7f' || char === '\b') {
                    this.currentCommandLine = this.currentCommandLine.slice(0, -1);
                } else if (char === '\x03') { // Ctrl+C
                    this.currentCommandLine = '';
                } else if (char.charCodeAt(0) >= 32) {
                    this.currentCommandLine += char;
                }
            }
            this.sendInput(data);
        });

        // Intercept Escape key to allow returning to 3D world smoothly
        this.term.attachCustomKeyEventHandler((e) => {
            if (e.key === 'Escape' && e.type === 'keydown') {
                if (typeof this.options.onEscape === 'function') {
                    this.options.onEscape();
                    return false;
                }
            }
            return true;
        });

        // Window resize observer with Virtual Keyboard guard
        window.addEventListener('resize', () => {
            this.fit();
        });

        // Orientation change is a physical geometry flip: force fit after transition
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.fit(true), 150);
        });

        // Recalculate fit after fonts finish loading to prevent misaligned cols/rows
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => this.fit());
        }
        setTimeout(() => this.fit(), 120);
        setTimeout(() => this.fit(), 450);

        // Focus terminal on touch / click
        this.mountElement.addEventListener('click', () => {
            this.term.focus();
        });
    }

    connectWebSocket() {
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const sessionQuery = this.currentSessionId
            ? `?sessionId=${encodeURIComponent(this.currentSessionId)}`
            : '';
        const wsUrl = `${protocol}//${window.location.host}/ws${sessionQuery}`;

        this.notifyStatus('connecting');

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.sessionUnavailable = false;
                this.notifyStatus('connected');
                this.term.write('\r\n\x1b[38;2;218;119;86m>> [TeleTerm 3D] Remote Session connected successfully.\x1b[0m\r\n');
                this.fit();
            };

            this.ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    this.handleServerMessage(msg);
                } catch (e) {
                    // Fallback to raw text if not JSON
                    this.term.write(event.data);
                }
            };

            this.ws.onclose = async () => {
                this.isConnected = false;
                if (!this.sessionUnavailable) {
                    this.notifyStatus('disconnected');
                    try {
                        const response = await fetch('/api/auth/desktop/session', { credentials: 'same-origin' });
                        if (response.status === 401) {
                            this.notifyStatus('unauthenticated');
                            this.term.write('\r\n\x1b[38;2;244;63;94m[Sign in with Google or GitHub to use terminal controls. Opening the sign-in page…]\x1b[0m\r\n');
                            window.location.assign('/launcher.html?login=1');
                            return;
                        }
                        if (response.ok) {
                            const data = await response.json();
                            if (data.role !== 'owner') {
                                this.notifyStatus('owner-required');
                                this.term.write('\r\n\x1b[38;2;244;63;94m[Terminal and host controls are available to the project owner only.]\x1b[0m\r\n');
                                return;
                            }
                        }
                    } catch (_) {}
                    this.scheduleReconnect();
                }
            };

            this.ws.onerror = (err) => {
                console.warn('[Terminal WS Error]', err);
                this.ws.close();
            };
        } catch (err) {
            console.error('[Terminal WS Exception]', err);
            this.scheduleReconnect();
        }
    }

    scheduleReconnect() {
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 8000);
        this.reconnectAttempts++;
        this.reconnectTimer = setTimeout(() => {
            this.connectWebSocket();
        }, delay);
    }

    handleServerMessage(msg) {
        if (!msg) return;

        if (this.options.onServerMessage) {
            this.options.onServerMessage(msg);
        }

        switch (msg.type) {
            case 'server_hello':
                console.log(`[TeleTerm] Connected to Server build ${msg.buildId || 'v4'}`);
                break;

            case 'attached':
                if (this.currentSessionId && msg.sessionId !== this.currentSessionId) {
                    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                        this.ws.send(JSON.stringify({ type: 'switch', sessionId: this.currentSessionId }));
                    }
                    break;
                }
                this.currentSessionId = msg.sessionId;
                this.sessionUnavailable = false;
                this.isMaster = !!msg.isMaster;
                if (this.onSessionChange) {
                    this.onSessionChange({ id: msg.sessionId, name: msg.name || 'Terminal' });
                }
                if (msg.cols && msg.rows) {
                    this.term.resize(msg.cols, msg.rows);
                }
                this.term.reset();
                const sessionContent = msg.history || msg.buffer || '';
                if (sessionContent) {
                    this.term.write(sessionContent);
                } else {
                    this.term.write('\r\n\x1b[38;2;218;119;86m>> Windows PowerShell (Session Online)\x1b[0m\r\n');
                    // Trigger prompt from shell
                    this.sendInput('\r');
                }
                // Only Master issues fit() to prevent Follower from sending unneeded resize to server
                if (this.isMaster) {
                    this.fit();
                }
                break;

            case 'sync_viewport':
                if (msg.cols && msg.rows) {
                    this.isMaster = false;
                    this.term.resize(msg.cols, msg.rows);
                }
                break;

            case 'master_promoted':
                this.isMaster = true;
                if (msg.cols && msg.rows) {
                    this.term.resize(msg.cols, msg.rows);
                }
                break;

            case 'resize_rejected':
                if (msg.cols && msg.rows) {
                    this.term.resize(msg.cols, msg.rows);
                }
                break;

            case 'snapshot':
                if (msg.cols && msg.rows) {
                    this.term.resize(msg.cols, msg.rows);
                }
                this.term.reset();
                if (msg.history) {
                    this.term.write(msg.history);
                }
                break;

            case 'session_unavailable':
                if (this.currentSessionId && msg.sessionId !== this.currentSessionId) {
                    this.sessionUnavailable = false;
                    return;
                }
                this.sessionUnavailable = true;
                this.isConnected = false;
                this.notifyStatus('session-unavailable');
                this.term.write(`\r\n\x1b[38;2;244;63;94m[Session ${this.escapeHtml(msg.sessionId || this.currentSessionId || '')} is no longer available. Choose another session to reconnect.]\x1b[0m\r\n`);
                if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.close(4404, 'session unavailable');
                break;

            case 'output':
                if (msg.data) {
                    this.term.write(msg.data);
                    if (this.onPulse) this.onPulse();
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('teleterm:terminal-output', { detail: { data: msg.data } }));
                    }
                }
                break;

            case 'ansi_screen':
                if (msg.ansi) {
                    this.term.write('\x1b[2J\x1b[H' + msg.ansi);
                    if (this.onPulse) this.onPulse();
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('teleterm:terminal-output', { detail: { data: msg.ansi } }));
                    }
                }
                break;

            case 'exit':
                this.term.write(`\r\n\x1b[38;2;244;63;94m[Process exited with code: ${msg.exitCode ?? 0}]\x1b[0m\r\n`);
                break;

            default:
                break;
        }
    }

    sendInput(data) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        this.ws.send(JSON.stringify({
            type: 'input',
            data: data
        }));
        if (this.onPulse) this.onPulse();
    }

    sendKey(actionKey) {
        const keyMap = {
            'up': '\x1b[A',
            'down': '\x1b[B',
            'left': '\x1b[D',
            'right': '\x1b[C',
            'enter': '\r',
            'tab': '\t',
            'esc': '\x1b',
            'ctrl-c': '\x03',
            'ctrl-d': '\x04',
            'ctrl-l': '\x0c',
            'backspace': '\b',
            'y': 'y\r',
            'n': 'n\r'
        };

        const code = keyMap[actionKey] || actionKey;
        this.sendInput(code);
    }

    switchSession(sessionId) {
        if (!sessionId) return;
        this.currentSessionId = sessionId;
        this.sessionUnavailable = false;
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            if (this.ws && this.ws.readyState === WebSocket.CLOSED) this.ws = null;
            this.connectWebSocket();
            return;
        }
        this.ws.send(JSON.stringify({
            type: 'switch',
            sessionId: sessionId
        }));
    }

    isVirtualKeyboardActive() {
        if (typeof window === 'undefined') return false;
        const isMobileOrCoarse = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
        if (!isMobileOrCoarse) return false;

        const activeEl = document.activeElement;
        const isTerminalFocused = activeEl && (
            activeEl.classList?.contains('xterm-helper-textarea') ||
            (this.mountElement && this.mountElement.contains(activeEl))
        );

        if (window.visualViewport) {
            const heightRatio = window.visualViewport.height / window.innerHeight;
            if (heightRatio < 0.82 && isTerminalFocused) {
                return true;
            }
        }
        return false;
    }

    fit(force = false) {
        if (!this.fitAddon || !this.mountElement || !this.term) return;
        if (!force && this.isVirtualKeyboardActive()) {
            return;
        }
        try {
            this.fitAddon.fit();
            if (this.ws && this.ws.readyState === WebSocket.OPEN && this.term.cols && this.term.rows) {
                this.ws.send(JSON.stringify({
                    type: 'resize',
                    cols: this.term.cols,
                    rows: this.term.rows,
                    sessionId: this.currentSessionId
                }));
            }
        } catch (e) {
            console.warn('[Terminal Fit]', e);
        }
    }

    clear() {
        if (this.term) {
            this.term.clear();
        }
    }

    focus() {
        if (this.term) {
            this.term.focus();
        }
    }

    executeCommand(cmd) {
        if (!cmd) return;
        const cleanCmd = cmd.trim();
        window.dispatchEvent(new CustomEvent('teleterm:command-executed', { detail: { command: cleanCmd } }));
        this.sendInput(cleanCmd + '\r');
        this.fit();
    }

    initSnippetBar() {
        if (document.getElementById('term-snippet-bar')) return;
        const bar = document.createElement('div');
        bar.id = 'term-snippet-bar';
        bar.className = 'term-snippet-bar';
        
        const snippets = [
            { icon: 'zap', label: 'git status', cmd: 'git status' },
            { icon: 'gauge', label: 'git diff', cmd: 'git diff' },
            { icon: 'compass', label: 'git add .', cmd: 'git add .' },
            { icon: 'lock', label: 'git commit', cmd: 'git commit -m "update"' },
            { icon: 'send', label: 'git push', cmd: 'git push' },
            { icon: 'package', label: 'npm dev', cmd: 'npm run dev' },
            { icon: 'cpu', label: 'npm test', cmd: 'npm test' },
            { icon: 'refresh', label: 'clear', cmd: 'clear' },
            { icon: 'folder', label: 'ls', cmd: 'ls' }
        ];

        bar.innerHTML = snippets.map(s => {
            const iconSvg = window.TeleTermIcons ? window.TeleTermIcons.render(s.icon, { size: 12 }) : '';
            return `
            <button type="button" class="term-snippet-chip" data-cmd="${this.escapeHtml(s.cmd)}" title="Run: ${this.escapeHtml(s.cmd)}">
                ${iconSvg} <span>${this.escapeHtml(s.label)}</span>
            </button>
            `;
        }).join('');

        bar.querySelectorAll('.term-snippet-chip').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const cmd = btn.dataset.cmd;
                if (cmd) this.executeCommand(cmd);
            };
        });

        // Insert snippet bar right above the terminal mount element
        if (this.mountElement && this.mountElement.parentElement) {
            this.mountElement.parentElement.insertBefore(bar, this.mountElement);
        }
    }

    escapeHtml(text = '') {
        return String(text).replace(/[&<>"']/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
    }

    notifyStatus(status) {
        if (this.onStatusChange) {
            this.onStatusChange(status);
        }
    }
}
