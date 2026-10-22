const pty = require('node-pty');
const os = require('os');
const EventEmitter = require('events');
const { exec } = require('child_process');
const config = require('./config');

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
            buffer: '', // Lưu buffer dạng chuỗi cuộn
            unreadCount: 0,
            subscribers: new Set()
        };

        // Lắng nghe output từ PTY
        ptyProcess.onData((data) => {
            // Cập nhật scrollback buffer (tối đa ~200KB dữ liệu gần nhất)
            session.buffer += data;
            const maxChars = 200000;
            if (session.buffer.length > maxChars) {
                session.buffer = session.buffer.slice(session.buffer.length - maxChars);
            }

            // Tăng unreadCount nếu không có subscriber trực tiếp đang xem
            if (session.subscribers.size === 0) {
                session.unreadCount = (session.unreadCount || 0) + 1;
            }

            this.emit('data', { id, data });

            // Broadcast dữ liệu cho tất cả client đang kết nối vào session này
            for (const ws of session.subscribers) {
                if (ws.readyState === 1 /* OPEN */) {
                    ws.send(JSON.stringify({
                        type: 'output',
                        sessionId: id,
                        data
                    }));
                }
            }
        });

        // Xử lý khi tiến trình kết thúc (ví dụ người dùng gõ exit)
        ptyProcess.onExit(({ exitCode, signal }) => {
            session.status = 'exited';
            session.exitCode = exitCode;

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
            buffer: '',
            unreadCount: 0,
            subscribers: new Set()
        };

        ptyProcess.onData((data) => {
            session.buffer += data;
            const maxChars = 200000;
            if (session.buffer.length > maxChars) {
                session.buffer = session.buffer.slice(session.buffer.length - maxChars);
            }
            if (session.subscribers.size === 0) {
                session.unreadCount = (session.unreadCount || 0) + 1;
            }
            this.emit('data', { id, data });
            for (const ws of session.subscribers) {
                if (ws.readyState === 1) {
                    ws.send(JSON.stringify({
                        type: 'output',
                        sessionId: id,
                        data
                    }));
                }
            }
        });

        ptyProcess.onExit(({ exitCode, signal }) => {
            session.status = 'exited';
            session.exitCode = exitCode;
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

        this.sessions.set(id, session);
        return session;
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
     */
    attach(id, ws) {
        const session = this.sessions.get(id);
        if (!session) return false;

        session.subscribers.add(ws);

        // Gửi thông báo kết nối thành công kèm toàn bộ buffer lịch sử
        ws.send(JSON.stringify({
            type: 'attached',
            sessionId: id,
            name: session.name,
            cols: session.cols,
            rows: session.rows,
            status: session.status,
            history: session.buffer
        }));

        return true;
    }

    /**
     * Ngắt kết nối client khỏi session (không tắt session)
     */
    detach(id, ws) {
        const session = this.sessions.get(id);
        if (session) {
            session.subscribers.delete(ws);
        }
    }

    /**
     * Ghi input từ điện thoại vào terminal PTY
     */
    write(id, data) {
        const session = this.sessions.get(id);
        if (session && session.status === 'running') {
            session.pty.write(data);
            return true;
        }
        return false;
    }

    /**
     * Thay đổi kích thước terminal (Resize)
     */
    resize(id, cols, rows) {
        const session = this.sessions.get(id);
        if (session && session.status === 'running') {
            try {
                session.cols = cols;
                session.rows = rows;
                session.pty.resize(cols, rows);
                return true;
            } catch (err) {
                console.error(`[PtyManager] Resize error for session ${id}:`, err.message);
            }
        }
        return false;
    }

    /**
     * Tắt/Xoá session
     */
    closeSession(id) {
        const session = this.sessions.get(id);
        if (!session) return false;

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
     * Lấy cây tiến trình con của session (Task Manager Inspector)
     */
    async getChildProcesses(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session || !session.pty) return { success: false, error: 'Session not found' };

        const rootPid = session.pty.pid;
        return new Promise((resolve) => {
            const cmd = `powershell -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId, Name, @{Name='WorkingSetMb';Expression={[math]::Round($_.WorkingSetSize / 1MB, 1)}}, CommandLine | ConvertTo-Json -Compress"`;
            exec(cmd, { maxBuffer: 10 * 1024 * 1024, timeout: 6000 }, (err, stdout) => {
                if (err) {
                    return resolve({
                        success: true,
                        rootPid,
                        sessionName: session.name,
                        shellId: session.shellId,
                        cwd: session.cwd,
                        processes: [{ pid: rootPid, name: session.shellName, ppid: 0, ramMb: 0, isRoot: true, cmd: '' }]
                    });
                }
                try {
                    let allProcesses = JSON.parse(stdout.trim());
                    if (!Array.isArray(allProcesses)) {
                        allProcesses = [allProcesses];
                    }

                    // Tìm root process và các tiến trình con cháu (descendants)
                    const pids = new Set([rootPid]);
                    let added = true;
                    while (added) {
                        added = false;
                        for (const p of allProcesses) {
                            if (p && p.ParentProcessId && pids.has(p.ParentProcessId) && !pids.has(p.ProcessId)) {
                                pids.add(p.ProcessId);
                                added = true;
                            }
                        }
                    }

                    const result = [];
                    for (const p of allProcesses) {
                        if (p && pids.has(p.ProcessId)) {
                            result.push({
                                pid: p.ProcessId,
                                ppid: p.ParentProcessId,
                                name: p.Name,
                                ramMb: p.WorkingSetMb || 0,
                                cmd: p.CommandLine || '',
                                isRoot: p.ProcessId === rootPid
                            });
                        }
                    }

                    resolve({
                        success: true,
                        rootPid,
                        sessionName: session.name,
                        shellId: session.shellId,
                        cwd: session.cwd,
                        processes: result
                    });
                } catch (parseErr) {
                    resolve({
                        success: true,
                        rootPid,
                        sessionName: session.name,
                        shellId: session.shellId,
                        cwd: session.cwd,
                        processes: [{ pid: rootPid, name: session.shellName, ppid: 0, ramMb: 0, isRoot: true, cmd: '' }]
                    });
                }
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
