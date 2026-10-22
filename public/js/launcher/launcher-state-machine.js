/**
 * TeleTerm Launcher Startup State Machine
 * States:
 *   BOOTING -> CHECKING_SESSION -> AUTHENTICATING -> READY ->
 *   CONNECTING -> LOADING_GAME -> SYNCHRONIZING -> ENTERING_WORLD -> IN_WORLD -> ERROR
 */

export const LauncherState = {
    BOOTING: 'BOOTING',
    CHECKING_SESSION: 'CHECKING_SESSION',
    AUTHENTICATING: 'AUTHENTICATING',
    READY: 'READY',
    CONNECTING: 'CONNECTING',
    LOADING_GAME: 'LOADING_GAME',
    SYNCHRONIZING: 'SYNCHRONIZING',
    ENTERING_WORLD: 'ENTERING_WORLD',
    IN_WORLD: 'IN_WORLD',
    ERROR: 'ERROR'
};

export class LauncherStateMachine {
    constructor() {
        this.currentState = LauncherState.BOOTING;
        this.listeners = new Set();
        this.errorDetails = null;
        this.progress = 0; // 0 to 100
        this.statusMessage = 'Booting TeleTerm...';
    }

    getState() {
        return this.currentState;
    }

    getProgress() {
        return this.progress;
    }

    getStatusMessage() {
        return this.statusMessage;
    }

    subscribe(callback) {
        if (typeof callback === 'function') {
            this.listeners.add(callback);
            // Immediately notify current state
            callback(this.currentState, {
                progress: this.progress,
                message: this.statusMessage,
                error: this.errorDetails
            });
            return () => this.listeners.delete(callback);
        }
        return () => {};
    }

    notify() {
        const payload = {
            progress: this.progress,
            message: this.statusMessage,
            error: this.errorDetails
        };
        for (const listener of this.listeners) {
            try {
                listener(this.currentState, payload);
            } catch (e) {
                console.error('[StateMachine] Listener error:', e);
            }
        }
    }

    transition(newState, { progress = null, message = null, error = null } = {}) {
        const previousState = this.currentState;
        this.currentState = newState;
        if (progress !== null) this.progress = Math.min(100, Math.max(0, progress));
        if (message !== null) this.statusMessage = message;
        if (error !== null) this.errorDetails = error;

        console.log(`[StateMachine] ${previousState} -> ${newState} (${this.progress}%: ${this.statusMessage})`);
        this.notify();
    }

    setError(errorMsg, canRetry = true) {
        this.errorDetails = { message: errorMsg, canRetry };
        this.transition(LauncherState.ERROR, { message: `Error: ${errorMsg}` });
    }
}
