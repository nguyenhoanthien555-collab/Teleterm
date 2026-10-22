/**
 * Zero-Leak Terminal Telemetry Sanitizer
 * TeleTerm Master Architecture v2 - Section 11, 12 & Rule 1
 * 
 * Safely detects development milestone events from PTY output streams
 * and triggers server-authoritative XP without leaking code, arguments, or secrets.
 */

const xpService = require('../progression/xp-service');
const logger = require('../logger');

// Regex heuristics to detect legitimate developer milestones safely
const BUILD_PATTERNS = [
    /compiled\s+successfully/i,
    /build\s+succeeded/i,
    /built\s+in\s+\d+(\.\d+)?(s|ms)/i,
    /webpack\s+compiled/i,
    /vite\s+v\d+.*ready/i,
    /Finished\s+`?(dev|release)`?\s+profile/i // Cargo / Rust
];

const TEST_PATTERNS = [
    /Tests?:\s+.*\bpassed\b/i,
    /\bPASS\b\s+.*(test|spec)\.[jt]sx?/i,
    /test\s+result:\s+ok\./i, // Cargo test
    /\bpassed\b\s+in\s+\d+(\.\d+)?s/i // Pytest
];

const COMMIT_PATTERNS = [
    /\[[a-zA-Z0-9_\-\/]+\s+[a-f0-9]{7,40}\]/, // git commit output: [main a1b2c3d]
    /create mode \d+ [0-9a-f]+/
];

class TelemetryService {
    constructor() {
        this.buffers = new Map(); // Map<sessionId, string>
    }

    /**
     * Inspect incoming terminal output chunk safely
     * @param {string} userId
     * @param {string} sessionId
     * @param {string} chunk
     */
    inspectOutput(userId, sessionId, chunk) {
        if (!userId || !chunk || typeof chunk !== 'string') return null;

        // Keep rolling tail buffer of 2000 chars per session
        let buf = (this.buffers.get(sessionId) || '') + chunk;
        if (buf.length > 4000) {
            buf = buf.slice(-2000);
        }
        this.buffers.set(sessionId, buf);

        // 1. Check Tests
        for (const re of TEST_PATTERNS) {
            if (re.test(chunk)) {
                return xpService.awardXp(userId, 'test_passed', { sanitizedSource: 'terminal_analyzer' });
            }
        }

        // 2. Check Builds
        for (const re of BUILD_PATTERNS) {
            if (re.test(chunk)) {
                return xpService.awardXp(userId, 'build_success', { sanitizedSource: 'terminal_analyzer' });
            }
        }

        // 3. Check Git Commits
        for (const re of COMMIT_PATTERNS) {
            if (re.test(chunk)) {
                return xpService.awardXp(userId, 'git_commit', { sanitizedSource: 'terminal_analyzer' });
            }
        }

        return null;
    }

    /**
     * Handle AI solution milestone (Codex / Antigravity / Claude completion)
     */
    recordAiInteraction(userId) {
        if (!userId) return null;
        return xpService.awardXp(userId, 'ai_solution', { sanitizedSource: 'ai_copilot' });
    }

    /**
     * Periodic focus pulse for active developers
     */
    recordFocusPulse(userId) {
        if (!userId) return null;
        return xpService.awardXp(userId, 'focus_pulse', { sanitizedSource: 'focus_cadence' });
    }

    clearSession(sessionId) {
        this.buffers.delete(sessionId);
    }
}

module.exports = new TelemetryService();
