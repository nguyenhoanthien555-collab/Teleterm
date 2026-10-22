/**
 * DEVELOPER PRESENCE & SANITIZED ACTIVITY TRANSLATOR
 * Implements Section 22 & 23 of TeleTerm Living Open World Master Spec v3.
 * Translates local developer actions (Terminal commands, AI generation, Testing)
 * into high-level sanitized semantic public states without EVER exposing private code or commands.
 */

export class DeveloperPresenceSystem {
    constructor(options = {}) {
        this.onPresenceChange = options.onPresenceChange || null;
        this.currentState = 'vibing'; // 'coding', 'thinking', 'building', 'testing', 'celebrating', 'coffee', 'vibing', 'away'
        this.statusText = '*vibing*';
        this.lastActiveTime = Date.now();
        this.temporaryTimer = null;

        this.initActivityWatchers();
    }

    initActivityWatchers() {
        // Watch user typing / interaction
        const markActive = () => {
            this.lastActiveTime = Date.now();
            if (this.currentState === 'away') {
                this.setPresence('vibing', '*vibing*');
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('keydown', markActive, { passive: true });
            window.addEventListener('mousedown', markActive, { passive: true });

            // Idle timer check (if inactive > 4 minutes -> away)
            setInterval(() => {
                if (Date.now() - this.lastActiveTime > 240000 && this.currentState !== 'away') {
                    this.setPresence('away', '*away*');
                }
            }, 15000);
        }
    }

    /**
     * Sanitizes command strings into semantic event tags without leaking arguments or flags
     * @param {string} rawCommand - Raw CLI input, e.g. "npm run build --prod" or "pytest tests/"
     */
    handleCommandExecuted(rawCommand) {
        if (!rawCommand || typeof rawCommand !== 'string') return;
        const cmd = rawCommand.trim().toLowerCase();

        this.lastActiveTime = Date.now();

        if (cmd.includes('build') || cmd.includes('cargo build') || cmd.includes('make') || cmd.includes('gradle') || cmd.includes('tsc')) {
            this.setPresence('building', '*building...*');
        } else if (cmd.includes('test') || cmd.includes('jest') || cmd.includes('pytest') || cmd.includes('vitest')) {
            this.setPresence('testing', '*testing...*');
        } else if (cmd.includes('commit') || cmd.includes('push') || cmd.includes('deploy')) {
            this.setPresence('deploying', '*deploying...*');
        } else if (cmd.includes('git') || cmd.includes('status') || cmd.includes('diff')) {
            this.setPresence('reviewing', '*reviewing code*');
        } else {
            this.setPresence('coding', '*coding...*');
        }
    }

    handleBuildOrTestResult(isSuccess) {
        if (isSuccess) {
            this.setTemporaryPresence('celebrating', '*build passed!*', 4500);
        } else {
            this.setPresence('debugging', '*debugging*');
        }
    }

    handleAiActive(isThinking) {
        if (isThinking) {
            this.setPresence('thinking', '*thinking with AI*');
        } else {
            this.setPresence('coding', '*coding...*');
        }
    }

    setPresence(state, text) {
        if (this.temporaryTimer) {
            clearTimeout(this.temporaryTimer);
            this.temporaryTimer = null;
        }
        this.currentState = state;
        this.statusText = text;
        if (this.onPresenceChange) {
            this.onPresenceChange(this.currentState, this.statusText);
        }
        this.broadcastToMultiplayer();
    }

    setTemporaryPresence(state, text, durationMs = 4000) {
        const prevState = this.currentState;
        const prevText = this.statusText;

        this.currentState = state;
        this.statusText = text;
        if (this.onPresenceChange) {
            this.onPresenceChange(this.currentState, this.statusText);
        }
        this.broadcastToMultiplayer();

        if (this.temporaryTimer) clearTimeout(this.temporaryTimer);
        this.temporaryTimer = setTimeout(() => {
            this.currentState = prevState;
            this.statusText = prevText;
            if (this.onPresenceChange) {
                this.onPresenceChange(this.currentState, this.statusText);
            }
            this.broadcastToMultiplayer();
        }, durationMs);
    }

    broadcastToMultiplayer() {
        if (typeof window !== 'undefined' && window.multiplayerClient && window.multiplayerClient.sendPresenceUpdate) {
            window.multiplayerClient.sendPresenceUpdate(this.currentState, this.statusText);
        }
    }

    getStatusText() {
        return this.statusText;
    }
}
