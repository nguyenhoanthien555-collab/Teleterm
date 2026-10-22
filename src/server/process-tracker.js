const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

let bridgePath = path.join(__dirname, '../../bin/ConsoleBridge.exe');
if (bridgePath.includes('app.asar')) {
    const unpacked = bridgePath.replace('app.asar', 'app.asar.unpacked');
    if (fs.existsSync(unpacked)) {
        bridgePath = unpacked;
    }
}

class ProcessTracker {
    constructor() {
        this.historyPerPid = new Map(); // pid -> string[]
        this.lastLinesPerPid = new Map(); // pid -> string[]
    }

    /**
     * Quét tất cả các terminal và tiến trình AI/CLI đang chạy trên laptop
     */
    async listSystemTerminals() {
        return new Promise((resolve) => {
            execFile(bridgePath, ['list'], { maxBuffer: 1024 * 1024 * 5 }, (err, stdout) => {
                if (err) {
                    console.error('[ProcessTracker] Error listing processes:', err.message);
                    return resolve([]);
                }
                try {
                    const text = stdout.trim();
                    const list = JSON.parse(text);
                    if (!Array.isArray(list)) return resolve([]);

                    const allowedShells = ['powershell', 'pwsh', 'cmd', 'windowsterminal', 'wt', 'bash'];
                    const filtered = list.filter(p => {
                        const name = (p.name || '').toLowerCase();
                        // 1. Chỉ nhận terminal / shell
                        if (!allowedShells.some(sh => name.includes(sh))) return false;

                        // 2. Phải có console preview không rỗng (tiến trình có màn hình console thật)
                        const preview = (p.preview || '').trim();
                        if (!preview) return false;

                        // 3. Loại trừ các tiến trình nền của TeleTerm (vòng lặp restart, daemon runner)
                        if (preview.includes('[TeleTerm]') || preview.includes('Server bi thoat') || preview.includes('Tu dong khoi dong lai')) {
                            return false;
                        }

                        return true;
                    });

                    resolve(filtered);
                } catch (parseErr) {
                    console.error('[ProcessTracker] JSON parse error:', parseErr.message);
                    resolve([]);
                }
            });
        });
    }

    /**
     * Lấy toàn bộ màn hình ANSI nguyên bản (gồm màu sắc, task, diff, prompt)
     * và tự động tích lũy lịch sử cuộn
     */
    async getAnsiScreen(pid) {
        return new Promise((resolve) => {
            execFile(bridgePath, ['ansi', pid.toString()], { maxBuffer: 1024 * 1024 * 10 }, (err, stdout) => {
                if (err) {
                    return resolve({ success: false, error: err.message });
                }
                try {
                    const data = JSON.parse(stdout.trim());
                    if (data.success && data.ansiBase64) {
                        const ansi = Buffer.from(data.ansiBase64, 'base64').toString('utf8');
                        let text = '';
                        if (data.textBase64) {
                            text = Buffer.from(data.textBase64, 'base64').toString('utf8');
                        }

                        // Cập nhật lịch sử dòng
                        this._updateHistory(pid, text);

                        resolve({
                            success: true,
                            pid: data.pid,
                            cols: data.cols,
                            rows: data.rows,
                            cursorX: data.cursorX,
                            cursorY: data.cursorY,
                            ansi,
                            text
                        });
                    } else {
                        resolve(data);
                    }
                } catch (e) {
                    resolve({ success: false, error: 'Parse error: ' + e.message });
                }
            });
        });
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
            // Tìm số dòng cuộn lên
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
        // Lọc bớt các dòng trống thừa ở cuối
        return hist.concat(current).join('\n');
    }

    /**
     * Gửi input / phím nóng vào tiến trình đang chạy
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
        return new Promise((resolve) => {
            execFile(bridgePath, ['write', pid.toString(), base64], (err, stdout) => {
                if (err) {
                    return resolve({ success: false, error: err.message });
                }
                try {
                    const result = JSON.parse(stdout.trim());
                    resolve(result);
                } catch (e) {
                    resolve({ success: false, error: 'Parse error' });
                }
            });
        });
    }
}

module.exports = new ProcessTracker();
