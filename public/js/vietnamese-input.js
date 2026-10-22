/**
 * TELETERM VIETNAMESE INPUT DOCK & COMMAND CHIPS
 * Eliminates mobile IME composition bugs by providing a dedicated input buffer
 */

export class VietnameseInputDock {
    constructor(terminalManager, options = {}) {
        this.terminalManager = terminalManager;
        this.options = options;
        
        this.dockEl = document.getElementById('viet-dock');
        this.inputEl = document.getElementById('viet-input');
        this.sendBtn = document.getElementById('btn-viet-send');
        this.chipsContainer = document.getElementById('viet-chips');

        this.chips = [
            { label: 'git status', cmd: 'git status\r' },
            { label: 'git pull', cmd: 'git pull\r' },
            { label: 'ls -la', cmd: 'ls -la\r' },
            { label: 'claude', cmd: 'claude --dangerously-skip-permissions\r' },
            { label: 'npm test', cmd: 'npm test\r' },
            { label: 'clear', cmd: 'clear\r' },
            { label: 'cd ..', cmd: 'cd ..\r' }
        ];

        this.isOpen = false;
        this.init();
    }

    init() {
        if (!this.dockEl || !this.inputEl) return;

        // Render command chips
        if (this.chipsContainer) {
            this.chipsContainer.innerHTML = '';
            this.chips.forEach(chip => {
                const btn = document.createElement('button');
                btn.className = 'cmd-chip';
                btn.type = 'button';
                btn.textContent = chip.label;
                btn.addEventListener('click', () => {
                    this.terminalManager.sendInput(chip.cmd);
                    this.terminalManager.focus();
                });
                this.chipsContainer.appendChild(btn);
            });
        }

        // Send button
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendCurrentInput());
        }

        // Enter key in input field
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendCurrentInput();
            } else if (e.key === 'Escape') {
                this.close();
            }
        });
    }

    sendCurrentInput() {
        const text = this.inputEl.value;
        if (!text) return;
        this.terminalManager.sendInput(text + '\r');
        this.inputEl.value = '';
        this.terminalManager.focus();
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
        return this.isOpen;
    }

    open() {
        if (!this.dockEl) return;
        this.dockEl.classList.remove('hidden');
        this.isOpen = true;
        setTimeout(() => {
            if (this.inputEl) this.inputEl.focus();
        }, 100);
    }

    close() {
        if (!this.dockEl) return;
        this.dockEl.classList.add('hidden');
        this.isOpen = false;
        this.terminalManager.focus();
    }
}
