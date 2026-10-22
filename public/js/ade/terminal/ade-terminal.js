/**
 * TeleTerm ADE Terminal Dock Controller
 * Mandated by Master Plan Section 19 & 20:
 * Real ConPTY interactive session, Fit addon, and "Send Error to Agent" pipeline.
 */
class AdeTerminalController {
    constructor() {
        this.term = null;
        this.fitAddon = null;
        this.currentTerminalId = null;
        this.isInitialized = false;
    }

    async init() {
        const container = document.getElementById('xterm-container');
        if (!container || typeof Terminal === 'undefined') return;

        this.term = new Terminal({
            theme: {
                background: '#0d1117',
                foreground: '#c9d1d9',
                cursor: '#58a6ff',
                selectionBackground: '#264f78',
                black: '#484f58',
                red: '#ff7b72',
                green: '#3fb950',
                yellow: '#d29922',
                blue: '#58a6ff',
                magenta: '#bc8cff',
                cyan: '#39c5cf',
                white: '#b1bac4'
            },
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            fontSize: 12,
            lineHeight: 1.4,
            cursorBlink: true,
            scrollback: 10000
        });

        if (typeof FitAddon !== 'undefined' && FitAddon.FitAddon) {
            this.fitAddon = new FitAddon.FitAddon();
            this.term.loadAddon(this.fitAddon);
        }

        this.term.open(container);
        if (this.fitAddon) {
            setTimeout(() => this.fitAddon.fit(), 100);
        }

        // Forward keystrokes to workspace PTY via WebSocket
        this.term.onData((data) => {
            if (this.currentTerminalId) {
                window.AdeClient.send('terminal_input', {
                    terminalId: this.currentTerminalId,
                    data
                });
            }
        });

        // Listen for terminal output from WebSocket
        window.AdeClient.on('terminal_output', (payload) => {
            if (payload.terminalId === this.currentTerminalId) {
                this.term.write(payload.data);
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('teleterm:terminal-output', { detail: { data: payload.data } }));
                }
            }
        });

        // Listen for window resize
        window.addEventListener('resize', () => {
            if (this.fitAddon) this.fitAddon.fit();
            if (this.currentTerminalId && this.term) {
                window.AdeClient.send('terminal_resize', {
                    terminalId: this.currentTerminalId,
                    cols: this.term.cols,
                    rows: this.term.rows
                });
            }
        });

        // Connect or spawn initial terminal session
        await this.ensureSession();
        this.isInitialized = true;
    }

    async ensureSession() {
        try {
            const res = await window.AdeClient.api('/terminals');
            if (res.sessions && res.sessions.length > 0) {
                this.currentTerminalId = res.sessions[0].id;
                this.renderTabs(res.sessions);
            } else {
                // Request server to spawn a terminal
                window.AdeClient.send('terminal_spawn', { name: 'PowerShell', shellId: 'powershell' });
            }
        } catch (e) {
            console.error('Failed to get terminals:', e);
        }
    }

    renderTabs(sessions) {
        const tabsContainer = document.getElementById('terminal-tabs-host');
        if (!tabsContainer) return;
        tabsContainer.innerHTML = '';

        sessions.forEach(s => {
            const btn = document.createElement('button');
            btn.className = `term-tab ${s.id === this.currentTerminalId ? 'active' : ''}`;
            btn.textContent = s.name;
            btn.onclick = () => {
                this.currentTerminalId = s.id;
                this.renderTabs(sessions);
            };
            tabsContainer.appendChild(btn);
        });
    }

    /**
     * Send Error to Agent Workflow (Section 54)
     */
    async sendErrorToAgent() {
        try {
            const res = await window.AdeClient.api(`/terminals/last-error?terminalId=${this.currentTerminalId || ''}`);
            const err = res.errorInfo;
            if (!err || !err.snippet) {
                alert('No recent error found in active terminal output buffer.');
                return;
            }

            // Inject context chip into Agent Deck
            window.AdeState.addContextChip({
                id: 'ctx-term-err',
                type: 'terminal_error',
                label: '@terminal:error',
                tokens: Math.ceil(err.snippet.length / 3.8),
                detail: err.snippet
            });

            // Focus prompt input and pre-fill helpful prompt
            const promptInput = document.getElementById('agent-prompt-input');
            if (promptInput) {
                promptInput.value = `I encountered an error running in the terminal. Please analyze @terminal:error and fix the problem.`;
                promptInput.focus();
            }
        } catch (e) {
            alert(`Error extracting terminal details: ${e.message}`);
        }
    }
}

window.AdeTerminal = new AdeTerminalController();
