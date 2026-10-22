const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * TeleTerm ADE Verification Runner
 * Mandated by Master Plan Section 35 & 36:
 * First-class test runner and verification engine linked to agent changes and diff sessions.
 */
class VerificationRunner {
    constructor({ rootPath, eventBus, terminalService }) {
        this.rootPath = path.resolve(rootPath);
        this.eventBus = eventBus;
        this.terminalService = terminalService;
        this.activeRun = null;
        this.lastResult = null;
        this.cancelledRunIds = new Set();
    }

    /**
     * Auto-detect default verification command for this workspace
     */
    detectDefaultCommand() {
        const pkgPath = path.join(this.rootPath, 'package.json');
        if (fs.existsSync(pkgPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                if (pkg.scripts && pkg.scripts.test) {
                    return 'npm test';
                }
            } catch (e) {}
        }
        return 'npm test';
    }

    /**
     * Run verification / test suite
     */
    async runVerification({ command = null, sessionId = null, diffId = null } = {}) {
        if (this.activeRun) {
            throw new Error('A verification run is already in progress.');
        }

        const cmdToRun = command || this.detectDefaultCommand();
        const startTime = Date.now();
        const runId = `verify-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        if (this.eventBus) {
            this.eventBus.emitEvent('verification_started', {
                runId,
                command: cmdToRun,
                sessionId,
                diffId
            }, { sessionId, source: 'verification' });
        }

        return new Promise((resolve) => {
            let outputBuffer = '';
            // Run via powershell / cmd
            const isWin = process.platform === 'win32';
            const shellExe = isWin ? 'powershell.exe' : 'sh';
            const shellArgs = isWin ? ['-NoProfile', '-Command', cmdToRun] : ['-c', cmdToRun];

            const proc = spawn(shellExe, shellArgs, {
                cwd: this.rootPath,
                env: { ...process.env, CI: 'true', FORCE_COLOR: '1' }
            });

            this.activeRun = { runId, proc, startTime };

            proc.stdout.on('data', (chunk) => {
                const text = chunk.toString();
                outputBuffer += text;
                if (this.eventBus) {
                    this.eventBus.emitEvent('verification_output', {
                        runId,
                        data: text
                    }, { sessionId, source: 'verification' });
                }
            });

            proc.stderr.on('data', (chunk) => {
                const text = chunk.toString();
                outputBuffer += text;
                if (this.eventBus) {
                    this.eventBus.emitEvent('verification_output', {
                        runId,
                        data: text
                    }, { sessionId, source: 'verification' });
                }
            });

            proc.on('close', (code) => {
                const durationMs = Date.now() - startTime;
                const wasCancelled = this.cancelledRunIds.has(runId);
                this.cancelledRunIds.delete(runId);

                if (this.activeRun && this.activeRun.runId === runId) {
                    this.activeRun = null;
                }

                const passed = code === 0 && !wasCancelled;
                // Parse assertion stats if available
                let passCount = 0;
                let failCount = 0;
                const passMatch = outputBuffer.match(/(\d+)\s+(?:passing|passed)/i);
                const failMatch = outputBuffer.match(/(\d+)\s+(?:failing|failed)/i);
                if (passMatch) passCount = parseInt(passMatch[1], 10);
                if (failMatch) failCount = parseInt(failMatch[1], 10);

                let status = 'FAILED';
                let summary = `Verification FAILED with exit code ${code}`;
                if (wasCancelled) {
                    status = 'CANCELLED';
                    summary = `Verification was cancelled by user`;
                } else if (passed) {
                    status = 'PASSED';
                    summary = `Verification PASSED in ${durationMs}ms`;
                }

                const result = {
                    runId,
                    command: cmdToRun,
                    status,
                    exitCode: code,
                    durationMs,
                    passCount,
                    failCount,
                    summary,
                    output: outputBuffer,
                    sessionId,
                    diffId,
                    completedAt: Date.now()
                };

                // Only update lastResult if this was the active run or there is no newer active run
                if (!this.activeRun || this.activeRun.runId === runId) {
                    this.lastResult = result;
                }

                if (this.eventBus) {
                    this.eventBus.emitEvent('verification_completed', result, {
                        sessionId,
                        source: 'verification'
                    });
                }

                resolve(result);
            });

            proc.on('error', (err) => {
                const durationMs = Date.now() - startTime;
                const wasCancelled = this.cancelledRunIds.has(runId);
                this.cancelledRunIds.delete(runId);

                if (this.activeRun && this.activeRun.runId === runId) {
                    this.activeRun = null;
                }

                const result = {
                    runId,
                    command: cmdToRun,
                    status: wasCancelled ? 'CANCELLED' : 'FAILED',
                    exitCode: -1,
                    durationMs,
                    summary: wasCancelled ? 'Verification was cancelled by user' : `Verification process failed to start: ${err.message}`,
                    output: err.message,
                    sessionId,
                    diffId,
                    completedAt: Date.now()
                };

                if (!this.activeRun || this.activeRun.runId === runId) {
                    this.lastResult = result;
                }

                if (this.eventBus) {
                    this.eventBus.emitEvent('verification_completed', result, {
                        sessionId,
                        source: 'verification'
                    });
                }

                resolve(result);
            });
        });
    }

    cancel() {
        if (this.activeRun) {
            const run = this.activeRun;
            this.cancelledRunIds.add(run.runId);
            this.activeRun = null;
            if (run.proc) {
                try {
                    if (process.platform === 'win32' && run.proc.pid) {
                        const { exec } = require('child_process');
                        exec(`taskkill /F /T /PID ${run.proc.pid}`, () => {});
                    } else {
                        run.proc.kill('SIGTERM');
                    }
                } catch (e) {}
            }
        }
    }

    getLastResult() {
        return this.lastResult;
    }
}

module.exports = { VerificationRunner };
