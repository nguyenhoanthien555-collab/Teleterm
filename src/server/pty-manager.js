const pty = require('node-pty');
const os = require('os');
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events');
const { exec, execFile } = require('child_process');
const config = require('./config');
const AnsiRingBuffer = require('./ansi-ring-buffer');

let bridgePath = path.join(__dirname, '../../bin/ConsoleBridge.exe');
if (bridgePath.includes('app.asar')) {
    const unpacked = bridgePath.replace('app.asar', 'app.asar.unpacked');
    if (fs.existsSync(unpacked)) {
        bridgePath = unpacked;
    }
}

// Argon Watermark Spec (P0.2): Flow Control thresholds
const HIGH_WATERMARK = 512 * 1024; // 512KB queue -> Pause PTY
const LOW_WATERMARK = 64 * 1024;   // 64KB queue -> Resume PTY

class PtySessionManager extends EventEmitter {
    constructor() {
        super();
        this.sessions = new Map();
        this.counter = 1;
    }

    /**
     * Tạo một terminal session mới
     */
    createSession({ name, shellId, cols, rows, cwd, customArgs, icon, color } = {}) {
        const id = `term-${this.counter++}`;
        const targetCols = cols || config.DEFAULT_COLS;
        const targetRows = rows || config.DEFAULT_ROWS;
        const targetCwd = cwd || process.cwd() || os.homedir();

        // Tìm thông tin shell
        let shellConfig = config.AVAILABLE_SHELLS.find(s => s.id === shellId);
        if (!shellConfig) {
            shellConfig = config.AVAILABLE_SHELLS[0] || {
                id: 'powershell',
                name: 'Windows PowerShell',
                path: 'powershell.exe',
                args: ['-NoLogo']
            };
        }

        const sessionName = name || `${shellConfig.name} (${id})`;
        const spawnArgs = customArgs !== undefined ? customArgs : (shellConfig.args || []);

        // Khởi chạy Windows ConPTY qua node-pty
        const ptyProcess = pty.spawn(shellConfig.path, spawnArgs, {
            name: 'xterm-256color',
            cols: targetCols,
            rows: targetRows,
            cwd: targetCwd,
            env: {
                ...process.env,
                LANG: 'en_US.UTF-8',
                LC_ALL: 'en_US.UTF-8',
                PYTHONIOENCODING: 'utf-8',
                TERM: 'xterm-256color',
                COLORTERM: 'truecolor'
            }
        });

        const shellIcons = {
            powershell: '⚡',
            pwsh: '⚡',
            cmd: '💻',
            wsl: '🐧',
            gitbash: '🌿',
            python: '🐍',
            node: '🟩',
            agy: '🛸',
            'agy-new': '🛸',
            claude: '🟣'
        };

        const sessionIcon = icon || shellIcons[shellConfig.id] || '⚡';
        const sessionColor = color || '#38bdf8';

        const session = {
            id,
            name: sessionName,
            shellId: shellConfig.id,
            shellName: shellConfig.name,
            icon: sessionIcon,
            color: sessionColor,
            pty: ptyProcess,
            cols: targetCols,
            rows: targetRows,
            cwd: targetCwd,
            createdAt: new Date(),
            status: 'running',
            buffer: new AnsiRingBuffer({ maxChars: 200000, maxLines: 5000 }),
            isPaused: false,
            masterClientId: null,
            _drainInterval: null,
            _resizeDebounceTimer: null,
            unreadCount: 0,
            subscribers: new Set()
        };

        this._bindPtySession(session, ptyProcess, id);
        this.sessions.set(id, session);
        return session;
    }

    /**
     * Tạo một session chạy trực tiếp Claude Code với quyền skip permissions
     */
    createClaudeSession({ cwd, cols, rows } = {}) {
        const id = `term-${this.counter++}`;
        const targetCols = cols || config.DEFAULT_COLS;
        const targetRows = rows || config.DEFAULT_ROWS;
        const targetCwd = cwd || process.cwd() || os.homedir();

        // Sử dụng powershell.exe với -NoExit để khi claude thoát vẫn giữ terminal mở
        const ptyProcess = pty.spawn('powershell.exe', ['-NoLogo', '-NoExit', '-Command', 'claude --dangerously-skip-permissions'], {
            name: 'xterm-256color',
            cols: targetCols,
            rows: targetRows,
            cwd: targetCwd,
            env: {
                ...process.env,
                LANG: 'en_US.UTF-8',
                LC_ALL: 'en_US.UTF-8',
                PYTHONIOENCODING: 'utf-8',
                TERM: 'xterm-256color',
                COLORTERM: 'truecolor'
            }
        });

        const session = {
            id,
            name: `Claude Code (${id})`,
            shellId: 'claude',
            shellName: 'Claude Code CLI',
            icon: '🟣',
            color: '#a855f7',
            pty: ptyProcess,
            cols: targetCols,
            rows: targetRows,
            cwd: targetCwd,
            createdAt: new Date(),
            status: 'running',
            buffer: new AnsiRingBuffer({ maxChars: 200000, maxLines: 5000 }),
            isPaused: false,
            masterClientId: null,
            _drainInterval: null,
            _resizeDebounceTimer: null,
            unreadCount: 0,
            subscribers: new Set()
        };

        this._bindPtySession(session, ptyProcess, id);
        this.sessions.set(id, session);
        return session;
    }

    /**
     * Gắn kết lắng nghe sự kiện từ PTY và kiểm soát Backpressure Flow Control
     * @private
     */
    _bindPtySession(session, ptyProcess, id) {
        ptyProcess.onData((data) => {
            session.buffer.append(data);

            if (session.subscribers.size === 0) {
                session.unreadCount = (session.unreadCount || 0) + 1;
            }

            this.emit('data', { id, data });

            // Broadcast dữ liệu cho tất cả client đang kết nối vào session này
            let maxBuffered = 0;
            for (const ws of session.subscribers) {
                if (ws.readyState === 1 /* OPEN */) {
                    ws.send(JSON.stringify({
                        type: 'output',
                        sessionId: id,
                        data
                    }));
                    if (ws.bufferedAmount && ws.bufferedAmount > maxBuffered) {
                        maxBuffered = ws.bufferedAmount;
                    }
                }
            }

            // P0.2 Flow Control: Tạm dừng PTY nếu bộ đệm WebSocket của client vượt ngưỡng HIGH_WATERMARK
            if (!session.isPaused && maxBuffered > HIGH_WATERMARK) {
                session.isPaused = true;
                try {
                    session.pty.pause();
                } catch (e) {}

                if (!session._drainInterval) {
                    session._drainInterval = setInterval(() => {
                        this._checkDrain(session);
                    }, 50);
                    session._drainInterval.unref?.();
                }
            }
        });

        ptyProcess.onExit(({ exitCode, signal }) => {
            session.status = 'exited';
            session.exitCode = exitCode;

            if (session._drainInterval) {
                clearInterval(session._drainInterval);
                session._drainInterval = null;
            }

            for (const ws of session.subscribers) {
                if (ws.readyState === 1) {
                    ws.send(JSON.stringify({
                        type: 'exit',
                        sessionId: id,
                        exitCode,
                        signal
                    }));
                }
            }

            this.emit('sessionExited', { id, exitCode });
        });
    }

    /**
     * Kiểm tra xả đệm để khôi phục luồng PTY (Resume)
     * @private
     */
    _checkDrain(session) {
        if (!session.isPaused) return;

        let maxBuffered = 0;
        for (const ws of session.subscribers) {
            if (ws.readyState === 1 && ws.bufferedAmount && ws.bufferedAmount > maxBuffered) {
                maxBuffered = ws.bufferedAmount;
            }
        }

        // Nếu tất cả client đều đã xả dưới ngưỡng LOW_WATERMARK hoặc không còn subscriber nào
        if (maxBuffered < LOW_WATERMARK || session.subscribers.size === 0) {
            if (session._drainInterval) {
                clearInterval(session._drainInterval);
                session._drainInterval = null;
            }
            session.isPaused = false;
            try {
                session.pty.resume();
            } catch (e) {}
        }
    }

    /**
     * Lấy danh sách session
     */
    listSessions() {
        const list = [];
        for (const [id, s] of this.sessions.entries()) {
            list.push({
                id: s.id,
                name: s.name,
                shellId: s.shellId,
                shellName: s.shellName,
                pid: s.pty ? s.pty.pid : null,
                icon: s.icon,
                color: s.color,
                cols: s.cols,
                rows: s.rows,
                cwd: s.cwd,
                createdAt: s.createdAt,
                status: s.status,
                unreadCount: s.unreadCount || 0,
                subscribersCount: s.subscribers.size
            });
        }
        return list.filter(s => s.status !== 'exited');
    }

    /**
     * Đổi tên session
     */
    renameSession(id, newName) {
        const s = this.sessions.get(id);
        if (!s || !newName || typeof newName !== 'string') return false;
        s.name = newName.trim();
        this.emit('sessionUpdated', { id, name: s.name, color: s.color });
        return true;
    }

    /**
     * Đổi màu tag của session
     */
    setColor(id, newColor) {
        const s = this.sessions.get(id);
        if (!s || !newColor) return false;
        s.color = newColor;
        this.emit('sessionUpdated', { id, name: s.name, color: s.color });
        return true;
    }

    /**
     * Đặt lại unreadCount về 0 khi người dùng chuyển vào tab
     */
    resetUnread(id) {
        const s = this.sessions.get(id);
        if (s) {
            s.unreadCount = 0;
            return true;
        }
        return false;
    }

    /**
     * Lấy thông tin session cụ thể
     */
    getSession(id) {
        return this.sessions.get(id);
    }

    /**
     * Gắn client WebSocket vào session và phát lại buffer lịch sử
     * Áp dụng Viewport Arbitration (P1.2): Gán quyền Master/Follower
     */
    attach(id, ws) {
        const session = this.sessions.get(id);
        if (!session) return false;

        if (!ws.id) {
            ws.id = 'client-' + Math.random().toString(36).slice(2, 9);
        }

        session.subscribers.add(ws);

        // Active Writer Wins / Master-Follower:
        // Nếu session chưa có Master hoặc Master cũ đã ngắt kết nối, promote client này lên làm Master
        let isMaster = false;
        if (!session.masterClientId || !this._isClientConnected(session, session.masterClientId)) {
            session.masterClientId = ws.id;
            isMaster = true;
        } else {
            isMaster = (session.masterClientId === ws.id);
        }

        // Lấy chuỗi lịch sử chuẩn hóa từ AnsiRingBuffer
        const history = typeof session.buffer?.getContents === 'function'
            ? session.buffer.getContents()
            : (session.buffer || '');

        // Gửi thông báo kết nối thành công kèm toàn bộ buffer lịch sử và vai trò Master/Follower
        ws.send(JSON.stringify({
            type: 'attached',
            sessionId: id,
            name: session.name,
            cols: session.cols,
            rows: session.rows,
            status: session.status,
            history,
            isMaster,
            masterId: session.masterClientId
        }));

        return true;
    }

    /**
     * Lấy Snapshot trạng thái toàn diện của Terminal để khôi phục phiên (Session Reconnect)
     */
    getSnapshot(id) {
        const session = this.sessions.get(id);
        if (!session) return null;

        const history = typeof session.buffer?.getContents === 'function'
            ? session.buffer.getContents()
            : (session.buffer || '');

        return {
            sessionId: id,
            name: session.name,
            cols: session.cols,
            rows: session.rows,
            status: session.status,
            history,
            masterClientId: session.masterClientId,
            subscribersCount: session.subscribers ? session.subscribers.size : 0,
            timestamp: Date.now()
        };
    }

    /**
     * Ngắt kết nối client khỏi session (không tắt session)
     */
    detach(id, ws) {
        const session = this.sessions.get(id);
        if (session) {
            session.subscribers.delete(ws);
            // Kiểm tra xả đệm để resume PTY nếu client bị nghẽn ngắt kết nối
            this._checkDrain(session);

            // Graceful Master Handover: nếu Master ngắt kết nối, chuyển quyền cho Follower kế tiếp
            if (ws && ws.id && session.masterClientId === ws.id) {
                session.masterClientId = null;
                for (const candidate of session.subscribers) {
                    if (candidate.readyState === 1) {
                        session.masterClientId = candidate.id;
                        candidate.send(JSON.stringify({
                            type: 'master_promoted',
                            sessionId: id,
                            cols: session.cols,
                            rows: session.rows
                        }));
                        break;
                    }
                }
            }
        }
    }

    /**
     * Kiểm tra xem một clientId có đang kết nối mở hay không
     * @private
     */
    _isClientConnected(session, clientId) {
        for (const ws of session.subscribers) {
            if (ws.id === clientId && ws.readyState === 1) {
                return true;
            }
        }
        return false;
    }

    /**
     * Ghi input từ điện thoại vào terminal PTY
     * Active Writer Wins (P1.2): Client gửi input tự động giành quyền Master
     */
    write(id, data, ws = null) {
        const session = this.sessions.get(id);
        if (session && session.status === 'running') {
            if (ws && ws.id && session.masterClientId !== ws.id) {
                session.masterClientId = ws.id;
                for (const sub of session.subscribers) {
                    if (sub.readyState === 1) {
                        sub.send(JSON.stringify({
                            type: 'master_changed',
                            sessionId: id,
                            masterId: ws.id,
                            isMaster: sub === ws
                        }));
                    }
                }
            }

            session.pty.write(data);
            return true;
        }
        return false;
    }

    /**
     * Thay đổi kích thước terminal (Resize)
     * P1.2 Viewport Arbitration: Chỉ chấp nhận resize từ Master + Debounce 120ms
     */
    resize(id, cols, rows, ws = null) {
        const session = this.sessions.get(id);
        if (!session || session.status !== 'running') return false;

        // Nếu client gọi resize không phải là Master -> Từ chối và gửi lại kích thước Master hiện tại
        if (ws && ws.id && session.masterClientId && session.masterClientId !== ws.id) {
            if (ws.readyState === 1) {
                ws.send(JSON.stringify({
                    type: 'pty_dimensions',
                    sessionId: id,
                    cols: session.cols,
                    rows: session.rows,
                    masterId: session.masterClientId,
                    rejected: true
                }));
            }
            return false;
        }

        // Debounce resize 120ms chống spam lệnh khi kéo thả cửa sổ
        if (session._resizeDebounceTimer) {
            clearTimeout(session._resizeDebounceTimer);
        }

        session._resizeDebounceTimer = setTimeout(() => {
            session._resizeDebounceTimer = null;
            if (session.status === 'running') {
                try {
                    session.cols = cols;
                    session.rows = rows;
                    session.pty.resize(cols, rows);

                    // Đồng bộ kích thước mới tới các client Follower
                    for (const sub of session.subscribers) {
                        if (sub !== ws && sub.readyState === 1) {
                            sub.send(JSON.stringify({
                                type: 'pty_dimensions',
                                sessionId: id,
                                cols,
                                rows,
                                masterId: session.masterClientId
                            }));
                        }
                    }
                } catch (err) {
                    console.error(`[PtyManager] Resize error for session ${id}:`, err.message);
                }
            }
        }, 120);

        return true;
    }

    /**
     * Tắt/Xoá session
     */
    closeSession(id) {
        const session = this.sessions.get(id);
        if (!session) return false;

        // Dọn dẹp bộ đệm và timer kiểm soát luồng
        if (session._drainInterval) {
            clearInterval(session._drainInterval);
            session._drainInterval = null;
        }

        if (session._resizeDebounceTimer) {
            clearTimeout(session._resizeDebounceTimer);
            session._resizeDebounceTimer = null;
        }

        if (session.buffer && typeof session.buffer.clear === 'function') {
            session.buffer.clear();
        }

        if (session.status === 'running') {
            try {
                session.pty.kill();
            } catch (e) {
                // ignore
            }
        }

        // Báo cho các client đang xem
        for (const ws of session.subscribers) {
            if (ws.readyState === 1) {
                ws.send(JSON.stringify({
                    type: 'closed',
                    sessionId: id
                }));
            }
        }

        this.sessions.delete(id);
        return true;
    }

    /**
     * Alias for closeSession
     */
    killSession(id) {
        return this.closeSession(id);
    }

    /**
     * Lấy cây tiến trình con của session (P0.3 High-Speed Process Tree via Toolhelp Snapshot)
     */
    async getChildProcesses(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.pty) return { success: false, error: 'Session not found' };

        const rootPid = session.pty.pid;
        const fallback = [{
            pid: rootPid,
            name: session.shellName,
            ppid: 0,
            ramMb: 0,
            isRoot: true,
            cmd: ''
        }];

        return new Promise((resolve) => {
            // Sử dụng C# ConsoleBridge tree (tốc độ < 10ms qua Toolhelp Snapshot, không tốn CPU)
            execFile(bridgePath, ['tree', String(rootPid)], { timeout: 1500, windowsHide: true }, (err, stdout) => {
                if (!err && stdout) {
                    try {
                        const processes = JSON.parse(stdout.trim());
                        if (Array.isArray(processes) && processes.length > 0) {
                            return resolve({
                                success: true,
                                rootPid,
                                sessionName: session.name,
                                shellId: session.shellId,
                                cwd: session.cwd,
                                processes
                            });
                        }
                    } catch (_) {}
                }

                // Fallback an toàn nếu bridge chưa sẵn sàng
                resolve({
                    success: true,
                    rootPid,
                    sessionName: session.name,
                    shellId: session.shellId,
                    cwd: session.cwd,
                    processes: fallback
                });
            });
        });
    }

    /**
     * Force kill một tiến trình theo PID
     */
    async killProcess(pid) {
        return new Promise((resolve) => {
            const targetPid = parseInt(pid, 10);
            if (!targetPid || targetPid <= 4) {
                return resolve({ success: false, error: 'PID không hợp lệ hoặc tiến trình hệ thống' });
            }
            exec(`taskkill /F /T /PID ${targetPid}`, (err, stdout, stderr) => {
                if (err) {
                    return resolve({ success: false, error: stderr || err.message });
                }
                resolve({ success: true, message: `Đã kết thúc tiến trình PID ${targetPid}` });
            });
        });
    }

    /**
     * Cập nhật CWD của session
     */
    setCwd(sessionId, newCwd) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.cwd = newCwd;
            return true;
        }
        return false;
    }
}

module.exports = new PtySessionManager();
