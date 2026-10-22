const { execFile, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

let bridgePath = path.join(__dirname, '../../bin/ConsoleBridge.exe');
if (bridgePath.includes('app.asar')) {
    const unpacked = bridgePath.replace('app.asar', 'app.asar.unpacked');
    if (fs.existsSync(unpacked)) {
        bridgePath = unpacked;
    }
}

const PIPE_PATH = '\\\\.\\pipe\\TeleTermConsoleBridge';

/**
 * P1.1 Persistent Daemon IPC Client for ConsoleBridge
 * Connects to the single-instance Named Pipe daemon on Windows.
 * Eliminates 600ms process spawning overhead and prevents AttachConsole race conditions.
 */
class BridgeIpcClient {
    constructor(exePath) {
        this.exePath = exePath;
        this.client = null;
        this.queue = [];
        this.currentRequest = null;
        this.buffer = '';
        this.isSpawning = false;
    }

    /**
     * Send command via Named Pipe IPC with automatic daemon spawn & fallback
     */
    async execute(cmdLine) {
        return new Promise((resolve) => {
            this.queue.push({ cmdLine, resolve });
            this._processQueue();
        });
    }

    async _processQueue() {
        if (this.currentRequest || this.queue.length === 0) return;

        this.currentRequest = this.queue.shift();
        const { cmdLine, resolve } = this.currentRequest;

        const sendOverPipe = () => {
            let timeoutId = setTimeout(() => {
                cleanup();
                this._fallbackExec(cmdLine, resolve);
            }, 3000);

            const onData = (data) => {
                this.buffer += data.toString('utf8');
                const newlineIdx = this.buffer.indexOf('\n');
                if (newlineIdx !== -1) {
                    const line = this.buffer.slice(0, newlineIdx).trim();
                    this.buffer = this.buffer.slice(newlineIdx + 1);
                    cleanup();
                    this.currentRequest = null;
                    resolve(line);
                    this._processQueue();
                }
            };

            const onError = () => {
                cleanup();
                this.client = null;
                this._fallbackExec(cmdLine, resolve);
            };

            const cleanup = () => {
                clearTimeout(timeoutId);
                if (this.client) {
                    this.client.removeListener('data', onData);
                    this.client.removeListener('error', onError);
                }
            };

            this.client.on('data', onData);
            this.client.once('error', onError);

            try {
                this.client.write(cmdLine + '\n');
            } catch (err) {
                onError();
            }
        };

        if (this.client && !this.client.destroyed) {
            sendOverPipe();
        } else {
            this._connectOrSpawn((connected) => {
                if (connected) {
                    sendOverPipe();
                } else {
                    this._fallbackExec(cmdLine, resolve);
                }
            });
        }
    }

    _connectOrSpawn(callback) {
        const client = net.connect(PIPE_PATH);

        client.once('connect', () => {
            this.client = client;
            client.on('close', () => { this.client = null; });
            callback(true);
        });

        client.once('error', () => {
            client.destroy();
            // Daemon not running yet, auto-spawn detached daemon
            this._spawnDaemon(() => {
                const retryClient = net.connect(PIPE_PATH);
                retryClient.once('connect', () => {
                    this.client = retryClient;
                    retryClient.on('close', () => { this.client = null; });
                    callback(true);
                });
                retryClient.once('error', () => {
                    retryClient.destroy();
                    callback(false);
                });
            });
        });
    }

    _spawnDaemon(callback) {
        if (this.isSpawning) {
            setTimeout(callback, 200);
            return;
        }
        this.isSpawning = true;
        try {
            const child = spawn(this.exePath, ['daemon'], {
                detached: true,
                stdio: 'ignore',
                windowsHide: true
            });
            child.unref();
        } catch (_) {}

        setTimeout(() => {
            this.isSpawning = false;
            callback();
        }, 300);
    }

    _fallbackExec(cmdLine, resolve) {
        this.currentRequest = null;
        const parts = cmdLine.split(' ');
        execFile(this.exePath, parts, { maxBuffer: 10 * 1024 * 1024, timeout: 3000 }, (err, stdout) => {
            if (err) {
                resolve(JSON.stringify({ success: false, error: err.message }));
            } else {
                resolve(stdout ? stdout.trim() : '{}');
            }
            this._processQueue();
        });
    }
}

class ProcessTracker {
    constructor() {
        this.historyPerPid = new Map(); // pid -> string[]
        this.lastLinesPerPid = new Map(); // pid -> string[]
        this.ipc = new BridgeIpcClient(bridgePath);
    }

    /**
     * Quét tất cả các terminal và tiến trình AI/CLI đang chạy trên laptop
     */
    async listSystemTerminals() {
        try {
            const text = await this.ipc.execute('list');
            const list = JSON.parse(text);
            if (!Array.isArray(list)) return [];

            const allowedShells = ['powershell', 'pwsh', 'cmd', 'windowsterminal', 'wt', 'bash'];
            const filtered = list.filter(p => {
                const name = (p.name || '').toLowerCase();
                // 1. Chỉ nhận terminal / shell
                if (!allowedShells.some(sh => name.includes(sh))) return false;

                // 2. Phải có console preview không rỗng (tiến trình có màn hình console thật)
                const preview = (p.preview || '').trim();
                if (!preview) return false;

                // 3. Loại trừ các tiến trình nền của TeleTerm
                if (preview.includes('[TeleTerm]') || preview.includes('Server bi thoat') || preview.includes('Tu dong khoi dong lai')) {
                    return false;
                }

                return true;
            });

            return filtered;
        } catch (err) {
            console.error('[ProcessTracker] Error listing processes:', err.message);
            return [];
        }
    }

    /**
     * Lấy toàn bộ màn hình ANSI nguyên bản qua Persistent IPC Daemon
     */
    async getAnsiScreen(pid) {
        try {
            const textOutput = await this.ipc.execute(`ansi ${pid}`);
            const data = JSON.parse(textOutput);
            if (data.success && data.ansiBase64) {
                const ansi = Buffer.from(data.ansiBase64, 'base64').toString('utf8');
                let text = '';
                if (data.textBase64) {
                    text = Buffer.from(data.textBase64, 'base64').toString('utf8');
                }

                // Cập nhật lịch sử dòng
                this._updateHistory(pid, text);

                return {
                    success: true,
                    pid: data.pid,
                    cols: data.cols,
                    rows: data.rows,
                    cursorX: data.cursorX,
                    cursorY: data.cursorY,
                    ansi,
                    text
                };
            }
            return data;
        } catch (e) {
            return { success: false, error: 'Parse error: ' + e.message };
        }
    }

    _updateHistory(pid, rawText) {
        if (!rawText) return;
        const currentLines = rawText.split('\n').map(l => l.trimEnd());
        
        if (!this.historyPerPid.has(pid)) {
            this.historyPerPid.set(pid, []);
        }
        const history = this.historyPerPid.get(pid);
        const prevLines = this.lastLinesPerPid.get(pid);

        if (prevLines && prevLines.length > 0) {
            let shift = -1;
            for (let k = 1; k < prevLines.length; k++) {
                let match = true;
                const checkLen = Math.min(prevLines.length - k, 6);
                if (checkLen <= 0) break;
                for (let j = 0; j < checkLen; j++) {
                    if (prevLines[k + j] !== currentLines[j]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    shift = k;
                    break;
                }
            }

            if (shift > 0) {
                for (let i = 0; i < shift; i++) {
                    if (prevLines[i] && prevLines[i].trim().length > 0) {
                        history.push(prevLines[i]);
                    }
                }
                if (history.length > 5000) {
                    history.splice(0, history.length - 5000);
                }
            }
        }

        this.lastLinesPerPid.set(pid, currentLines);
    }

    /**
     * Lấy toàn bộ lịch sử code / terminal đã ghi nhận cho một PID
     */
    getHistory(pid) {
        const hist = this.historyPerPid.get(pid) || [];
        const current = this.lastLinesPerPid.get(pid) || [];
        return hist.concat(current).join('\n');
    }

    /**
     * Gửi input / phím nóng vào tiến trình qua Persistent IPC Daemon
     */
    async sendInput(pid, text) {
        let processed = text;
        if (typeof processed === 'string') {
            processed = processed
                .replace(/\\x1b/g, '\x1b')
                .replace(/\\r/g, '\r')
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t')
                .replace(/\\x03/g, '\x03')
                .replace(/\\x14/g, '\x14');
        }
        const base64 = Buffer.from(processed, 'utf8').toString('base64');
        try {
            const raw = await this.ipc.execute(`write ${pid} ${base64}`);
            return JSON.parse(raw);
        } catch (e) {
            return { success: false, error: 'IPC write error: ' + e.message };
        }
    }
}

module.exports = new ProcessTracker();
