const EventEmitter = require('events');
const { exec, spawn } = require('child_process');
const ptyManager = require('../server/pty-manager');

/**
 * TeleTerm ADE Workspace Terminal Coordinator
 * Integrates Windows ConPTY terminal sessions with the workspace runtime.
 * Provides error pattern extraction for the Context Engine (@terminal:error).
 */
class WorkspaceTerminal extends EventEmitter {
    constructor({ rootPath, eventBus }) {
        super();
        this.rootPath = rootPath;
        this.eventBus = eventBus;
        this.activeSessions = new Map(); // Map<sessionId, TerminalSession>

        // Forward ptyManager events to ADE eventBus
        const handleData = ({ id, data }) => {
            if (this.activeSessions.has(id)) {
                const session = this.activeSessions.get(id);
                session.lastActivity = Date.now();
                if (this.eventBus) {
                    this.eventBus.emitEvent('terminal_output', {
                        terminalId: id,
                        data
                    }, { source: 'terminal' });
                }
            }
        };

        const handleExit = ({ id, exitCode }) => {
            if (this.activeSessions.has(id)) {
                const session = this.activeSessions.get(id);
                session.status = 'exited';
                session.exitCode = exitCode;
                if (this.eventBus) {
                    this.eventBus.emitEvent('terminal_exit', {
                        terminalId: id,
                        exitCode
                    }, { source: 'terminal' });
                }
            }
        };

        ptyManager.on('data', handleData);
        ptyManager.on('session_data', handleData);
        ptyManager.on('sessionExited', handleExit);
        ptyManager.on('session_exit', handleExit);
    }

    /**
     * Create a new terminal session bound to workspace root
     */
    createSession({ name = 'ADE Terminal', shellId = 'powershell', cols = 120, rows = 30 } = {}) {
        const session = ptyManager.createSession({
            name,
            shellId,
            cols,
            rows,
            cwd: this.rootPath
        });

        this.activeSessions.set(session.id, {
            id: session.id,
            name: session.name,
            shellId: session.shellId,
            cwd: this.rootPath,
            cols,
            rows,
            status: 'running',
            createdAt: Date.now(),
            lastActivity: Date.now(),
            lastCommand: ''
        });

        if (this.eventBus) {
            this.eventBus.emitEvent('terminal_started', {
                terminalId: session.id,
                name: session.name,
                cwd: this.rootPath
            }, { source: 'terminal' });
        }

        return session;
    }

    /**
     * Write input characters/commands to terminal
     */
    writeInput(terminalId, data) {
        ptyManager.write(terminalId, data);
        const s = this.activeSessions.get(terminalId);
        if (s && data.includes('\r')) {
            s.lastCommand = data.trim();
        }
    }

    resize(terminalId, cols, rows) {
        ptyManager.resize(terminalId, cols, rows);
    }

    kill(terminalId) {
        if (typeof ptyManager.killSession === 'function') {
            ptyManager.killSession(terminalId);
        } else if (typeof ptyManager.closeSession === 'function') {
            ptyManager.closeSession(terminalId);
        }
        this.activeSessions.delete(terminalId);
    }

    getBuffer(terminalId) {
        const ptySession = ptyManager.getSession(terminalId);
        return ptySession ? ptySession.buffer : '';
    }

    listSessions() {
        return Array.from(this.activeSessions.values()).map(s => {
            const ptySession = ptyManager.getSession(s.id);
            return {
                ...s,
                status: ptySession ? ptySession.status : 'dead',
                cols: ptySession ? ptySession.cols : s.cols,
                rows: ptySession ? ptySession.rows : s.rows
            };
        });
    }

    /**
     * Extract relevant error details from the most recent terminal output
     * For use with Context Engine (@terminal:error)
     */
    extractLastError(terminalId = null) {
        let targetId = terminalId;
        if (!targetId) {
            // Find most recently active session
            const sessions = Array.from(this.activeSessions.values())
                .sort((a, b) => b.lastActivity - a.lastActivity);
            if (sessions.length > 0) targetId = sessions[0].id;
        }

        if (!targetId) return null;

        const buffer = this.getBuffer(targetId);
        if (!buffer) return null;

        // Clean ANSI escape sequences
        const cleanText = buffer.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        const lines = cleanText.split('\n');

        // Look for error patterns from bottom up
        const errorKeywords = [
            'Error:', 'error:', 'Exception:', 'FAIL:', 'FAILED', 'npm ERR!', 'SyntaxError:',
            'TypeError:', 'ReferenceError:', 'AssertionError:', 'UnhandledPromiseRejection',
            'panic:', 'Traceback (most recent call last):', 'fatal:'
        ];

        let errorLineIndex = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            if (errorKeywords.some(kw => line.includes(kw))) {
                errorLineIndex = i;
                break;
            }
        }

        const session = this.activeSessions.get(targetId);

        if (errorLineIndex === -1) {
            // Take the last 30 lines as context
            const snippet = lines.slice(-30).join('\n').trim();
            return {
                terminalId: targetId,
                cwd: session ? session.cwd : this.rootPath,
                command: session ? session.lastCommand : '',
                hasErrorPattern: false,
                snippet
            };
        }

        // Capture from 5 lines before error to 35 lines after error
        const start = Math.max(0, errorLineIndex - 5);
        const end = Math.min(lines.length, errorLineIndex + 35);
        const snippet = lines.slice(start, end).join('\n').trim();

        return {
            terminalId: targetId,
            cwd: session ? session.cwd : this.rootPath,
            command: session ? session.lastCommand : '',
            hasErrorPattern: true,
            errorLine: lines[errorLineIndex].trim(),
            snippet
        };
    }
}

module.exports = { WorkspaceTerminal };
