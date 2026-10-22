const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const os = require('os');
const fs = require('fs');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { exec, execFile, spawn } = require('child_process');

const config = require('./config');
const ptyManager = require('./pty-manager');
const tunnelManager = require('./tunnel');
const processTracker = require('./process-tracker');
const logger = require('./logger');
const powerManager = require('./power-manager');
const notifier = require('./notifier');
const antigravityManager = new Proxy({}, {
    get(target, prop) {
        const mod = require('./antigravity-manager');
        const val = mod[prop];
        return typeof val === 'function' ? val.bind(mod) : val;
    }
});
const accountManager = require('./account-manager');
const antigravityVerifier = require('./antigravity-verifier');
const codexManager = new Proxy({}, {
    get(target, prop) {
        const mod = require('./codex-manager');
        const val = mod[prop];
        return typeof val === 'function' ? val.bind(mod) : val;
    }
});
const realtimeGateway = require('./realtime/gateway');
const devAuthRouter = require('./auth/github-auth');
const desktopAuth = require('./auth/desktop-auth');
const telemetryService = require('./terminal/telemetry-service');
const adeRouter = require('./ade-router');
const adeGateway = require('./realtime/ade-gateway');
const questRouter = require('./progression/quest-router');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true, maxPayload: 64 * 1024 });
const activeAuthenticatedSockets = new Map();
const upgradeRateBuckets = new Map();
desktopAuth.authManager.onSessionsRevoked(({ userId, token, all }) => {
    for (const [socket, sessionInfo] of activeAuthenticatedSockets) {
        if (sessionInfo.userId === userId && (all || sessionInfo.token === token)) socket.destroy();
    }
});

let SERVER_BUILD_ID = 'build-' + Date.now();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Tính toán % CPU sử dụng liên tục (Native Node.js os.cpus diff)
function getCpuSample() {
    const cpus = os.cpus();
    let idleMs = 0, totalMs = 0;
    for (const cpu of cpus) {
        for (const type in cpu.times) {
            totalMs += cpu.times[type];
        }
        idleMs += cpu.times.idle;
    }
    return { idle: idleMs / (cpus.length || 1), total: totalMs / (cpus.length || 1) };
}

let prevCpuSample = getCpuSample();
let currentCpuPercent = 0;

setInterval(() => {
    const nextSample = getCpuSample();
    const idleDiff = nextSample.idle - prevCpuSample.idle;
    const totalDiff = nextSample.total - prevCpuSample.total;
    if (totalDiff > 0) {
        currentCpuPercent = Math.max(0, Math.min(100, Math.round(100 - (100 * idleDiff / totalDiff))));
    }
    prevCpuSample = nextSample;
}, 1500);

// Cache thông tin Pin / Nguồn sạc Laptop
let cachedBattery = { percent: 100, isCharging: true, statusText: 'Nguồn AC (Cắm sạc)' };
function updateBatteryStatus() {
    try {
        const { exec } = require('child_process');
        exec('powershell -Command "Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue | Select-Object EstimatedChargeRemaining, BatteryStatus"', { timeout: 3000 }, (err, stdout) => {
            if (!err && stdout) {
                const lines = stdout.trim().split('\n').filter(l => l.trim() && !l.includes('---') && !l.includes('EstimatedChargeRemaining'));
                if (lines.length > 0) {
                    const parts = lines[0].trim().split(/\s+/);
                    const percent = parseInt(parts[0], 10);
                    const status = parseInt(parts[1], 10);
                    if (!isNaN(percent)) {
                        cachedBattery = {
                            percent,
                            isCharging: status === 2 || status === 6 || status === 7 || status === 8,
                            statusText: (status === 2 || status === 6) ? 'Đang sạc' : (status === 1 ? 'Đang dùng pin' : 'Đầy pin (AC)')
                        };
                    }
                }
            }
        });
    } catch (e) {}
}
updateBatteryStatus();
setInterval(updateBatteryStatus, 60000);

// Cấu hình Header chống cache tuyệt đối cho tài nguyên tĩnh để trình duyệt luôn nhận code mới nhất
const noCacheStaticOptions = {
    etag: false,
    maxAge: 0,
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
};

// 1. Phục vụ thư viện @xterm, three, và Monaco Editor trực tiếp từ node_modules
app.use('/vendor/xterm', express.static(path.join(__dirname, '../../node_modules/@xterm'), noCacheStaticOptions));
app.use('/vendor/three', express.static(path.join(__dirname, '../../node_modules/three'), noCacheStaticOptions));
app.use('/vendor/monaco', express.static(path.join(__dirname, '../../node_modules/monaco-editor/min'), noCacheStaticOptions));

// 1b. Auth entry points and role-protected game / owner APIs.
app.use('/api/auth/desktop', (req, res, next) => {
    if (!desktopAuth.security.originAllowed(req)) return res.status(403).json({ success: false, error: 'origin_not_allowed' });
    const hasCookie = Boolean(desktopAuth.security.parseCookies(req.headers.cookie).teleterm_session);
    const hasBearer = /^Bearer\s+\S+/i.test(req.headers.authorization || '');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && hasCookie && !hasBearer && !req.headers.origin) {
        return res.status(403).json({ success: false, error: 'origin_required' });
    }
    next();
}, desktopAuth.router);
app.use('/api/ade', authMiddleware, adeRouter);
app.use('/api/quests', playerAuthMiddleware, questRouter);
app.get(['/ade', '/ade/'], (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/ade.html'));
});

// User-uploaded assets can contain personal content; only authenticated players may fetch them.
app.use('/models/custom', playerAuthMiddleware);
app.use('/uploads', playerAuthMiddleware);

// 2. Phục vụ giao diện người dùng tĩnh từ thư mục public với cơ chế chống cache 100%
app.use(express.static(path.join(__dirname, '../../public'), noCacheStaticOptions));

// 3. Phục vụ Metaverse Developer APIs & Custom 3D Models
app.use('/api/dev', playerAuthMiddleware, devAuthRouter);
app.use('/models/custom', express.static(path.join(__dirname, '../../public/models/custom'), noCacheStaticOptions));
if (process.env.TELETERM_USER_DATA_PATH) {
    app.use('/models/custom', express.static(path.join(process.env.TELETERM_USER_DATA_PATH, 'models', 'custom'), noCacheStaticOptions));
}

// Endpoint kiểm tra phiên bản và trạng thái build của hệ thống
app.get('/api/version', (req, res) => {
    res.json({
        success: true,
        version: '4.0.0',
        buildId: SERVER_BUILD_ID,
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

// Live File Watcher: Tự động phát hiện thay đổi code trong public/ và phát sóng Hot-Reload cho mọi client
const publicDir = path.join(__dirname, '../../public');
let reloadDebounceTimer = null;

function broadcastHotReload(filePath) {
    if (reloadDebounceTimer) clearTimeout(reloadDebounceTimer);
    reloadDebounceTimer = setTimeout(() => {
        SERVER_BUILD_ID = 'build-' + Date.now();
        const baseName = filePath ? path.basename(filePath) : 'all';
        logger.info(`[Auto-Update] Phát hiện cập nhật code public/${baseName}. Phát sóng Hot-Reload tới tất cả client...`);
        
        const payload = JSON.stringify({
            type: 'hot_reload',
            buildId: SERVER_BUILD_ID,
            file: baseName,
            message: 'Hệ thống vừa cập nhật mã nguồn mới! Đang tự động làm mới...'
        });

        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(payload);
                } catch (e) {}
            }
        }
    }, 300);
}

if (!publicDir.includes('app.asar')) {
    try {
        // 1. Recursive watcher for public/ directory (including public/js, public/css)
        fs.watch(publicDir, { recursive: true }, (eventType, filename) => {
            if (filename && (filename.endsWith('.js') || filename.endsWith('.css') || filename.endsWith('.html') || filename.endsWith('.json'))) {
                broadcastHotReload(filename);
            }
        });
        logger.info('[Auto-Update] Đã kích hoạt Live File Watcher đệ quy trên thư mục public/ (Tự động cập nhật 24/7)');

        // 2. Server module hot-reloader for src/server/
        fs.watch(__dirname, { recursive: true }, (eventType, filename) => {
            if (filename && filename.endsWith('.js') && !filename.includes('index.js')) {
                const modPath = path.resolve(__dirname, filename);
                if (require.cache[modPath]) {
                    delete require.cache[modPath];
                    logger.info(`[Auto-Update] Module máy chủ đã tự động nạp lại: ${filename}`);
                }
            }
        });
        logger.info('[Auto-Update] Đã kích hoạt Server Module Hot-Reloading cho src/server/');
    } catch (err) {
        logger.warn(`[Auto-Update] Không thể bật fs.watch: ${err.message}`);
    }
}

// Endpoint thủ công để cưỡng bức reload toàn bộ module và giao diện
app.post('/api/dev/hot-reload', authMiddleware, (req, res) => {
    Object.keys(require.cache).forEach(p => {
        if (p.includes(path.join(__dirname)) && !p.includes('index.js') && !p.includes('tunnel.js')) {
            delete require.cache[p];
        }
    });
    broadcastHotReload('manual');
    res.json({ success: true, message: 'Đã làm mới toàn bộ modules và phát sóng Hot-Reload!' });
});

// Browser cookies require a same-origin request on every state-changing call.
function validateRequestOrigin(req, res) {
    if (!desktopAuth.security.originAllowed(req)) {
        res.status(403).json({ success: false, error: 'origin_not_allowed' });
        return false;
    }
    const cookieSession = Boolean(desktopAuth.security.parseCookies(req.headers.cookie).teleterm_session);
    const bearerSession = /^Bearer\s+\S+/i.test(req.headers.authorization || '');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && cookieSession && !bearerSession && !req.headers.origin) {
        res.status(403).json({ success: false, error: 'origin_required' });
        return false;
    }
    return true;
}

const playerApiRateLimit = desktopAuth.security.createRateLimiter({ windowMs: 60_000, max: 300 });
const ownerApiRateLimit = desktopAuth.security.createRateLimiter({ windowMs: 60_000, max: 180 });

function playerAuthMiddleware(req, res, next) {
    if (!validateRequestOrigin(req, res)) return;
    req.authSession = desktopAuth.authManager.authenticateRequest(req);
    if (!req.authSession && desktopAuth.security.isDirectLocalhost(req)) {
        req.authSession = desktopAuth.authManager.getOrCreateLocalOwnerSession(req, res);
    }
    if (!req.authSession) return res.status(401).json({ success: false, error: 'authentication_required' });
    return playerApiRateLimit(req, res, next);
}

function authMiddleware(req, res, next) {
    if (!validateRequestOrigin(req, res)) return;
    req.authSession = desktopAuth.authManager.authenticateRequest(req);
    if (!req.authSession && desktopAuth.security.isDirectLocalhost(req)) {
        req.authSession = desktopAuth.authManager.getOrCreateLocalOwnerSession(req, res);
    }
    if (!req.authSession) return res.status(401).json({ success: false, error: 'authentication_required' });
    if (!req.authSession.isOwner) return res.status(403).json({ success: false, error: 'owner_only' });
    return ownerApiRateLimit(req, res, next);
}

// ==================== REST API ====================

// Lấy thông tin phiên bản & build ID để client tự động kiểm tra và làm mới phiên bản mới
app.get('/api/version', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({
        success: true,
        version: '2.5.0',
        buildId: SERVER_BUILD_ID,
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

// System logs can reveal paths, account identifiers, and terminal details.
app.get('/api/logs', authMiddleware, (req, res) => {
    res.json({ success: true, logs: logger.getRecentLogs(200) });
});

// Xóa logs
app.delete('/api/logs', authMiddleware, (req, res) => {
    logger.clearLogs();
    logger.info('Đã xóa lịch sử nhật ký hệ thống');
    res.json({ success: true });
});

// Retire the old passwordless master-token endpoint.
app.post('/api/auth', (req, res) => res.status(410).json({ success: false, error: 'oauth_required' }));

// Kiểm tra trạng thái server (100% Passwordless - Luôn authenticated: true)
app.get('/api/status', (req, res) => {
    const session = desktopAuth.authManager.authenticateRequest(req);
    res.json({
        online: true,
        authenticated: Boolean(session),
        role: session ? (session.isOwner ? 'owner' : 'player') : null
    });
});

// TeleTerm Realtime Multiplayer Telemetry Endpoint (Argon Release Hardening Spec #4)
app.get('/api/multiplayer/telemetry', (req, res) => {
    res.json(realtimeGateway.getTelemetry());
});

// Lấy danh sách session PTY do TeleTerm quản lý
app.get('/api/sessions', authMiddleware, (req, res) => {
    res.json({ sessions: ptyManager.listSessions() });
});

// Lấy danh sách TOÀN BỘ các terminal / CLI / AI đang chạy trên máy tính
app.get('/api/system-terminals', authMiddleware, async (req, res) => {
    try {
        delete require.cache[require.resolve('./process-tracker')];
        const tracker = require('./process-tracker');
        const list = await tracker.listSystemTerminals();
        res.json({ success: true, terminals: list });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Lấy toàn bộ màn hình ANSI màu sắc của một tiến trình hệ thống
app.get('/api/system-terminals/:pid/ansi', authMiddleware, async (req, res) => {
    const pid = parseInt(req.params.pid, 10);
    const result = await processTracker.getAnsiScreen(pid);
    res.json(result);
});

// Gửi input / phím vào tiến trình hệ thống
app.post('/api/system-terminals/:pid/input', authMiddleware, async (req, res) => {
    const pid = parseInt(req.params.pid, 10);
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const result = await processTracker.sendInput(pid, text);
    res.json(result);
});

// Lấy danh sách shell có sẵn trên máy
app.get('/api/shells', authMiddleware, (req, res) => {
    res.json({ success: true, shells: config.AVAILABLE_SHELLS });
});

// Tạo session PTY mới
app.post('/api/sessions', authMiddleware, (req, res) => {
    const { name, shellId, cols, rows, cwd, color, icon } = req.body;
    const session = ptyManager.createSession({ name, shellId, cols, rows, cwd, color, icon });
    res.json({
        success: true,
        session: {
            id: session.id,
            name: session.name,
            shellId: session.shellId,
            shellName: session.shellName,
            icon: session.icon,
            color: session.color,
            cols: session.cols,
            rows: session.rows,
            status: session.status
        }
    });
});

// Cập nhật tên hoặc màu session
app.patch('/api/sessions/:id', authMiddleware, (req, res) => {
    const { name, color } = req.body;
    let updated = false;
    if (name) {
        updated = ptyManager.renameSession(req.params.id, name) || updated;
    }
    if (color) {
        updated = ptyManager.setColor(req.params.id, color) || updated;
    }
    const session = ptyManager.getSession(req.params.id);
    res.json({
        success: updated,
        session: session ? {
            id: session.id,
            name: session.name,
            color: session.color,
            icon: session.icon
        } : null
    });
});

// Nhân bản session (Duplicate)
app.post('/api/sessions/:id/duplicate', authMiddleware, (req, res) => {
    const source = ptyManager.getSession(req.params.id);
    if (!source) return res.status(404).json({ success: false, error: 'Session not found' });
    const session = ptyManager.createSession({
        name: `${source.name} (Copy)`,
        shellId: source.shellId,
        cols: source.cols,
        rows: source.rows,
        cwd: source.cwd,
        color: source.color
    });
    res.json({
        success: true,
        session: {
            id: session.id,
            name: session.name,
            shellId: session.shellId,
            shellName: session.shellName,
            icon: session.icon,
            color: session.color,
            cols: session.cols,
            rows: session.rows,
            status: session.status
        }
    });
});

// Tắt session PTY
app.delete('/api/sessions/:id', authMiddleware, (req, res) => {
    const success = ptyManager.closeSession(req.params.id);
    res.json({ success });
});

// Lấy cây tiến trình con của session (Task Manager Inspector)
app.get('/api/sessions/:id/processes', authMiddleware, async (req, res) => {
    const result = await ptyManager.getChildProcesses(req.params.id);
    res.json(result);
});

// Ép tắt tiến trình con theo PID (Force Kill)
app.post('/api/sessions/:id/processes/:pid/kill', authMiddleware, async (req, res) => {
    const result = await ptyManager.killProcess(req.params.pid);
    res.json(result);
});

// Cập nhật CWD của session
app.post('/api/sessions/:id/cwd', authMiddleware, (req, res) => {
    const { cwd } = req.body;
    if (!cwd) return res.status(400).json({ success: false, error: 'Thiếu tham số cwd' });
    const success = ptyManager.setCwd(req.params.id, cwd);
    res.json({ success, cwd });
});

// ==================== TELETERM POWER PACK V4.5 API ====================

// 1. Chụp ảnh màn hình Desktop thời gian thực (Native Desktop Peek, ~350ms)
app.get('/api/desktop/screenshot', authMiddleware, (req, res) => {
    const screenshotScript = path.join(__dirname, 'scripts', 'screenshot.ps1');
    const format = req.query.format === 'png' ? 'png' : 'jpg';
    const quality = req.query.quality ? String(req.query.quality) : '82';
    const maxWidth = req.query.maxWidth ? String(req.query.maxWidth) : '1920';

    execFile('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy', 'Bypass',
        '-File', screenshotScript,
        '-Format', format,
        '-Quality', quality,
        '-MaxWidth', maxWidth
    ], { maxBuffer: 25 * 1024 * 1024, timeout: 8000 }, (err, stdout, stderr) => {
        if (err) {
            logger.error(`[DesktopPeek] Lỗi chụp màn hình: ${err.message} ${stderr || ''}`);
            return res.status(500).json({ success: false, message: 'Lỗi chụp màn hình: ' + err.message });
        }

        const lines = stdout.split(/\r?\n/);
        let width = 0, height = 0, data = '';
        for (const line of lines) {
            if (line.startsWith('WIDTH:')) width = parseInt(line.substring(6), 10);
            else if (line.startsWith('HEIGHT:')) height = parseInt(line.substring(7), 10);
            else if (line.startsWith('DATA:')) data = line.substring(5);
        }

        if (data) {
            const mime = format === 'png' ? 'image/png' : 'image/jpeg';
            const dataUri = `data:${mime};base64,${data}`;
            res.json({
                success: true,
                width: width || 1920,
                height: height || 1080,
                screenshot: dataUri,
                dataUrl: dataUri,
                timestamp: Date.now()
            });
        } else {
            logger.error(`[DesktopPeek] Không tìm thấy dữ liệu ảnh. Stdout: ${stdout.substring(0, 200)}`);
            res.status(500).json({ success: false, message: 'Không thể xử lý ảnh màn hình' });
        }
    });
});

// 2. Tắt màn hình PC vật lý (SC_MONITORPOWER 2)
app.post('/api/system/screen-off', authMiddleware, (req, res) => {
    const psScript = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class WinUtil {
    [DllImport("user32.dll")]
    public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);
}
"@
[WinUtil]::SendMessage(-1, 0x0112, 0xF170, 2)
`;
    const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
    exec(`powershell.exe -NoProfile -NonInteractive -EncodedCommand ${encoded}`, (err) => {
        if (err) {
            logger.error(`[ScreenOff] Lỗi tắt màn hình: ${err.message}`);
            return res.status(500).json({ success: false, error: err.message });
        }
        logger.info('[ScreenOff] Đã tắt màn hình vật lý (SC_MONITORPOWER 2)');
        res.json({ success: true, message: 'Đã tắt màn hình PC' });
    });
});

// 3. Khóa máy tính Windows (Win+L)
app.post('/api/system/lock-windows', authMiddleware, (req, res) => {
    exec('rundll32.exe user32.dll,LockWorkStation', (err) => {
        if (err) {
            logger.error(`[LockWindows] Lỗi khóa máy: ${err.message}`);
            return res.status(500).json({ success: false, error: err.message });
        }
        logger.info('[LockWindows] Đã khóa màn hình Windows (Win+L)');
        res.json({ success: true, message: 'Đã khóa máy tính' });
    });
});

// 4. Truy vấn trạng thái Git của thư mục làm việc session
app.get('/api/sessions/:id/git', authMiddleware, (req, res) => {
    const session = ptyManager.getSession(req.params.id);
    let targetDir = (session && session.cwd) ? session.cwd : process.cwd();
    if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
        targetDir = process.cwd();
    }

    exec('git branch --show-current && git status --porcelain', { cwd: targetDir }, (err, stdout) => {
        if (err) {
            return res.json({ success: false, isRepo: false, error: 'Not a git repository' });
        }
        const lines = stdout.trim().split(/\r?\n/);
        const branch = (lines[0] && lines[0].trim()) ? lines[0].trim() : 'master';
        const changes = lines.slice(1).filter(l => l.trim().length > 0);

        let modified = 0;
        let untracked = 0;
        changes.forEach(c => {
            const trimmed = c.trim();
            if (trimmed.startsWith('??')) untracked++;
            else modified++;
        });

        res.json({
            success: true,
            isRepo: true,
            branch,
            clean: changes.length === 0,
            summary: {
                totalChanges: changes.length,
                modified,
                untracked
            }
        });
    });
});

// 5. Gửi lệnh đồng loạt tới tất cả các session PTY đang mở
app.post('/api/sessions/broadcast', authMiddleware, (req, res) => {
    const { input } = req.body;
    if (typeof input !== 'string') {
        return res.status(400).json({ success: false, error: 'Thiếu chuỗi input' });
    }
    const sessions = ptyManager.listSessions();
    for (const s of sessions) {
        ptyManager.write(s.id, input);
    }
    logger.info(`[Broadcast] Đã phát sóng lệnh tới ${sessions.length} session(s)`);
    res.json({ success: true, count: sessions.length });
});

// 6. Quét các cổng TCP đang LISTENING trên máy tính
app.get('/api/system/listening-ports', authMiddleware, (req, res) => {
    exec('netstat -ano -p tcp', (err, stdout) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        const lines = stdout.split('\n');
        const portMap = new Map();

        for (const line of lines) {
            if (line.includes('LISTENING')) {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 4) {
                    const localAddr = parts[1];
                    const pid = parseInt(parts[parts.length - 1], 10);
                    const portStr = localAddr.split(':').pop();
                    const port = parseInt(portStr, 10);
                    if (port && port > 0 && port < 65536) {
                        portMap.set(port, pid);
                    }
                }
            }
        }

        const ports = [];
        for (const [port, pid] of portMap.entries()) {
            ports.push({ port, pid, processName: `PID ${pid}` });
        }
        ports.sort((a, b) => a.port - b.port);
        res.json({ success: true, ports });
    });
});

// 7. Reverse Proxy Bridge cho Localhost Web Preview (3000, 5173, etc.)
app.use('/proxy/:port', authMiddleware, (req, res) => {
    const port = parseInt(req.params.port, 10);
    if (!port || port < 1 || port > 65535) {
        return res.status(400).send('Cổng không hợp lệ');
    }

    const targetUrl = req.url === '/' ? '/' : req.url;
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    const proxyReq = http.request({
        hostname: '127.0.0.1',
        port: port,
        path: targetUrl,
        method: req.method,
        headers: {
            ...req.headers,
            host: `127.0.0.1:${port}`,
            'x-forwarded-for': clientIp,
            'x-forwarded-proto': req.protocol
        }
    }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        res.status(502).send(`<html><body style="font-family:sans-serif;background:#0c0d14;color:#ef4444;padding:20px;"><h3>502 Bad Gateway</h3><p>Không thể kết nối tới dịch vụ trên localhost:${port} (${err.message}). Đảm bảo ứng dụng web đang chạy.</p></body></html>`);
    });

    req.pipe(proxyReq);
});

// ==================== 1. QUICK CLAUDE LAUNCHER ====================
app.post('/api/sessions/quick-claude', authMiddleware, (req, res) => {
    const { cwd } = req.body || {};
    const session = ptyManager.createClaudeSession({ cwd });
    logger.info(`[QuickClaude] Đã tạo phiên Claude Code (${session.id})`);
    res.json({
        success: true,
        session: {
            id: session.id,
            name: session.name,
            shellId: session.shellId,
            shellName: session.shellName,
            icon: session.icon,
            color: session.color,
            cols: session.cols,
            rows: session.rows,
            status: session.status
        }
    });
});

// ==================== 2. BI-DIRECTIONAL CLIPBOARD SYNC ====================
// Đọc nội dung Clipboard Windows
app.get('/api/clipboard', authMiddleware, (req, res) => {
    const psScript = `[Console]::Out.Write((Get-Clipboard -Raw))`;
    const b64 = Buffer.from(psScript, 'utf16le').toString('base64');
    exec(`powershell.exe -NoProfile -NonInteractive -EncodedCommand ${b64}`, (err, stdout) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, text: stdout || '' });
    });
});

// Ghi nội dung vào Clipboard Windows
app.post('/api/clipboard', authMiddleware, (req, res) => {
    const { text } = req.body || {};
    if (typeof text !== 'string') {
        return res.status(400).json({ success: false, error: 'Thiếu tham số text' });
    }
    const textB64 = Buffer.from(text, 'utf8').toString('base64');
    const psScript = `
$bytes = [Convert]::FromBase64String('${textB64}')
$str = [System.Text.Encoding]::UTF8.GetString($bytes)
Set-Clipboard -Value $str
`;
    const b64 = Buffer.from(psScript, 'utf16le').toString('base64');
    exec(`powershell.exe -NoProfile -NonInteractive -EncodedCommand ${b64}`, (err) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        logger.info(`[Clipboard] Đã đồng bộ clipboard PC (${text.length} ký tự)`);
        res.json({ success: true, length: text.length });
    });
});

// ==================== 3. SMART PROCESS WATCHDOG ====================
const activeWatchdogs = new Map();
app.post('/api/sessions/:id/watchdog', authMiddleware, async (req, res) => {
    const sessionId = req.params.id;
    const session = ptyManager.getSession(sessionId);
    if (!session) {
        return res.status(404).json({ success: false, error: 'Session không tồn tại' });
    }

    if (activeWatchdogs.has(sessionId)) {
        const item = activeWatchdogs.get(sessionId);
        clearInterval(item.checkInterval);
        clearTimeout(item.timer);
        activeWatchdogs.delete(sessionId);
        logger.info(`[Watchdog] Đã hủy giám sát cho session ${sessionId}`);
        return res.json({ success: true, armed: false, message: 'Đã hủy chế độ giám sát lệnh' });
    }

    const startTime = Date.now();
    logger.info(`[Watchdog] Đã kích hoạt giám sát tiến trình cho session ${sessionId}`);

    let hadChildProcesses = false;
    let idleCounter = 0;

    const checkInterval = setInterval(async () => {
        const curProcs = await ptyManager.getChildProcesses(sessionId);
        const curList = (curProcs && Array.isArray(curProcs.processes)) ? curProcs.processes : [];
        const nonShellProcs = curList.filter(p => !['powershell.exe', 'cmd.exe', 'conhost.exe'].includes((p.name || '').toLowerCase()));

        if (nonShellProcs.length > 0) {
            hadChildProcesses = true;
            idleCounter = 0;
        } else if (hadChildProcesses) {
            idleCounter++;
        }

        // Lệnh kết thúc khi: có tiến trình con rồi biến mất, hoặc session kết thúc
        if (session.status === 'exited' || (hadChildProcesses && idleCounter >= 2)) {
            clearInterval(checkInterval);
            clearTimeout(maxTimer);
            activeWatchdogs.delete(sessionId);

            const durationSec = Math.round((Date.now() - startTime) / 1000);
            const title = '🎉 Lệnh Hoàn Thành!';
            const message = `Phiên ${session.name} đã chạy xong tác vụ (${durationSec}s). Chạm để kiểm tra kết quả!`;

            notifier.sendNotification(title, message, 'white_check_mark,tada');

            wss.clients.forEach(c => {
                if (c.readyState === WebSocket.OPEN) {
                    c.send(JSON.stringify({
                        type: 'task_alert',
                        title,
                        message,
                        sessionId,
                        durationSec
                    }));
                }
            });
            logger.info(`[Watchdog] Thông báo hoàn thành lệnh sau ${durationSec}s cho session ${sessionId}`);
        }
    }, 1500);

    const maxTimer = setTimeout(() => {
        clearInterval(checkInterval);
        activeWatchdogs.delete(sessionId);
    }, 3 * 60 * 60 * 1000);

    activeWatchdogs.set(sessionId, { checkInterval, timer: maxTimer, startTime });
    res.json({ success: true, armed: true, message: 'Đã bật giám sát thông minh cho session này' });
});

// ==================== 4. CONTEXT-AWARE COMMAND PALETTE ====================
app.get('/api/sessions/:id/context-chips', authMiddleware, (req, res) => {
    const session = ptyManager.getSession(req.params.id);
    let targetDir = (session && session.cwd) ? session.cwd : process.cwd();
    if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
        targetDir = process.cwd();
    }

    const chips = [];
    try {
        const files = fs.readdirSync(targetDir);

        // 1. Node.js / NPM
        if (files.includes('package.json')) {
            try {
                const pkg = JSON.parse(fs.readFileSync(path.join(targetDir, 'package.json'), 'utf8'));
                if (pkg.scripts) {
                    if (pkg.scripts.dev) chips.push({ label: 'npm run dev', cmd: 'npm run dev\r', icon: '⚡' });
                    if (pkg.scripts.start) chips.push({ label: 'npm start', cmd: 'npm start\r', icon: '🚀' });
                    if (pkg.scripts.test) chips.push({ label: 'npm test', cmd: 'npm test\r', icon: '🧪' });
                    if (pkg.scripts.build) chips.push({ label: 'npm build', cmd: 'npm run build\r', icon: '📦' });
                }
            } catch (e) {}
            if (!chips.some(c => c.label.startsWith('npm'))) {
                chips.push({ label: 'npm install', cmd: 'npm install\r', icon: '📦' });
            }
        }

        // 2. Python
        if (files.some(f => f.endsWith('.py') || f === 'requirements.txt' || f === 'pyproject.toml')) {
            if (files.includes('main.py')) chips.push({ label: 'python main.py', cmd: 'python main.py\r', icon: '🐍' });
            if (files.includes('app.py')) chips.push({ label: 'python app.py', cmd: 'python app.py\r', icon: '🐍' });
            if (files.includes('requirements.txt')) chips.push({ label: 'pip install', cmd: 'pip install -r requirements.txt\r', icon: '📥' });
            chips.push({ label: 'pytest', cmd: 'pytest\r', icon: '🧪' });
        }

        // 3. Git
        if (files.includes('.git') || fs.existsSync(path.join(targetDir, '.git'))) {
            chips.push({ label: 'git status', cmd: 'git status\r', icon: '🌿' });
            chips.push({ label: 'git pull', cmd: 'git pull\r', icon: '⬇️' });
            chips.push({ label: 'git log', cmd: 'git log -n 5 --oneline\r', icon: '📜' });
        }

        // 4. Docker
        if (files.some(f => f.includes('docker-compose') || f === 'Dockerfile')) {
            chips.push({ label: 'docker compose up', cmd: 'docker compose up -d\r', icon: '🐳' });
            chips.push({ label: 'docker ps', cmd: 'docker ps\r', icon: '🐳' });
        }
    } catch (err) {}

    // Default fallbacks
    chips.push({ label: 'ls -la', cmd: 'ls -la\r', icon: '📁' });
    chips.push({ label: 'clear', cmd: 'clear\r', icon: '🧹' });

    res.json({ success: true, cwd: targetDir, chips: chips.slice(0, 8) });
});

// ==================== SYSTEM RESOURCE HUD API ====================

// Lấy thông tin tài nguyên hệ thống theo thời gian thực (CPU, RAM, Disks, Pin)
app.get('/api/system-status', authMiddleware, (req, res) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = Math.round((usedMem / totalMem) * 100);

    const disks = [];
    ['C:\\', 'D:\\', 'E:\\'].forEach(drive => {
        try {
            if (fs.statfsSync) {
                const s = fs.statfsSync(drive);
                disks.push({
                    drive: drive.substring(0, 2),
                    freeGb: Math.round(s.bavail * s.bsize / 1024 / 1024 / 1024),
                    totalGb: Math.round(s.blocks * s.bsize / 1024 / 1024 / 1024),
                    freePercent: Math.round((s.bavail / s.blocks) * 100)
                });
            }
        } catch (e) {}
    });

    res.json({
        success: true,
        cpu: currentCpuPercent,
        ram: memPercent,
        disk: (disks[0] ? (100 - disks[0].freePercent) : 50),
        cpuPercent: currentCpuPercent,
        cpuCores: os.cpus().length,
        memory: {
            totalMb: Math.round(totalMem / 1024 / 1024),
            usedMb: Math.round(usedMem / 1024 / 1024),
            freeMb: Math.round(freeMem / 1024 / 1024),
            usedPercent: memPercent
        },
        disks,
        battery: cachedBattery,
        uptimeSec: Math.round(os.uptime()),
        hostname: os.hostname(),
        platform: os.platform()
    });
});

// ==================== REMOTE FILE EXPLORER & EDITOR API ====================

// Duyệt danh sách thư mục & file từ xa
app.get('/api/files/browse', authMiddleware, (req, res) => {
    try {
        let reqPath = req.query.path || process.cwd();
        if (reqPath === '~' || reqPath.startsWith('~/') || reqPath.startsWith('~\\')) {
            reqPath = path.join(os.homedir(), reqPath.slice(1));
        }
        let targetDir = path.resolve(reqPath);
        if (!fs.existsSync(targetDir)) {
            targetDir = process.cwd();
        }
        const stat = fs.statSync(targetDir);
        if (!stat.isDirectory()) {
            targetDir = path.dirname(targetDir);
        }

        const entries = fs.readdirSync(targetDir, { withFileTypes: true });
        const items = [];

        for (const entry of entries) {
            if (entry.name === '$RECYCLE.BIN' || entry.name === 'System Volume Information') continue;
            try {
                const fullPath = path.join(targetDir, entry.name);
                const isDir = entry.isDirectory();
                let size = 0;
                let mtime = null;
                try {
                    const st = fs.statSync(fullPath);
                    size = isDir ? 0 : st.size;
                    mtime = st.mtime;
                } catch (e) {}

                items.push({
                    name: entry.name,
                    path: fullPath,
                    isDir,
                    size,
                    mtime,
                    ext: isDir ? '' : path.extname(entry.name).toLowerCase()
                });
            } catch (e) {}
        }

        items.sort((a, b) => {
            if (a.isDir && !b.isDir) return -1;
            if (!a.isDir && b.isDir) return 1;
            return a.name.localeCompare(b.name);
        });

        const parentDir = path.dirname(targetDir) !== targetDir ? path.dirname(targetDir) : null;
        
        // Phát hiện các ổ đĩa có sẵn trên Windows (C:, D:, E:, ...)
        const drives = ['C:\\', 'D:\\', 'E:\\', 'F:\\'].filter(d => {
            try { return fs.existsSync(d); } catch (e) { return false; }
        });

        res.json({
            success: true,
            currentPath: targetDir,
            parentPath: parentDir,
            drives,
            items
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Đọc nội dung file text từ xa để xem hoặc chỉnh sửa
app.get('/api/files/read', authMiddleware, (req, res) => {
    try {
        const filePath = req.query.path;
        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }
        const st = fs.statSync(filePath);
        if (st.isDirectory()) {
            return res.status(400).json({ success: false, error: 'Path is a directory' });
        }
        if (st.size > 1024 * 1024) {
            return res.status(400).json({ success: false, error: 'File quá lớn (> 1MB), vui lòng mở bằng terminal.' });
        }
        const content = fs.readFileSync(filePath, 'utf8');
        res.json({
            success: true,
            name: path.basename(filePath),
            path: filePath,
            size: st.size,
            mtime: st.mtime,
            content
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Lưu nội dung file text từ xa
app.post('/api/files/save', authMiddleware, (req, res) => {
    try {
        const { path: filePath, content } = req.body;
        if (!filePath) {
            return res.status(400).json({ success: false, error: 'Missing path' });
        }
        if (typeof content !== 'string') {
            return res.status(400).json({ success: false, error: 'Content must be string' });
        }
        fs.writeFileSync(filePath, content, 'utf8');
        logger.info(`Đã lưu file từ xa: ${filePath}`);
        res.json({
            success: true,
            path: filePath,
            size: Buffer.byteLength(content, 'utf8')
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Tải file từ máy tính về điện thoại
app.get('/api/files/download', authMiddleware, (req, res) => {
    try {
        const filePath = req.query.path;
        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).send('File not found');
        }
        res.download(filePath);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Upload file/ảnh từ điện thoại vào thư mục máy tính (hỗ trợ CWD của session hoặc targetDir)
app.post('/api/files/upload', authMiddleware, (req, res) => {
    try {
        const { filename, base64Data, targetDir, sessionId } = req.body;
        if (!filename) {
            return res.status(400).json({ success: false, error: 'Thiếu tên file (filename)' });
        }
        if (!base64Data) {
            return res.status(400).json({ success: false, error: 'Thiếu dữ liệu file (base64Data)' });
        }

        let destDir = targetDir;
        if (!destDir && sessionId) {
            const session = ptyManager.getSession(sessionId);
            if (session && session.cwd) {
                destDir = session.cwd;
            }
        }
        if (!destDir) {
            destDir = process.cwd();
        }

        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        const safeFilename = path.basename(filename);
        const finalPath = path.join(destDir, safeFilename);

        // Xử lý chuỗi base64 (loại bỏ data:...;base64, prefix nếu có)
        const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        const buffer = Buffer.from(cleanBase64, 'base64');
        fs.writeFileSync(finalPath, buffer);

        logger.info(`Đã upload file thành công: ${finalPath} (${buffer.length} bytes)`);
        res.json({
            success: true,
            path: finalPath,
            filename: safeFilename,
            size: buffer.length,
            targetDir: destDir
        });
    } catch (err) {
        logger.error(`Lỗi upload file: ${err.message}`);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==================== V4.5 POWERHOUSE ENDPOINTS ====================

// 2. Tắt màn hình vật lý máy tính (Screen Blackout - SC_MONITORPOWER 2)
app.post('/api/system/screen-off', authMiddleware, (req, res) => {
    exec(`powershell -NoProfile -Command "(Add-Type '[DllImport(\\"user32.dll\\")]public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);' -Name a -PassThru)::SendMessage(-1, 0x0112, 0xF170, 2)"`, (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        logger.info('Đã gửi tín hiệu tắt màn hình vật lý (Screen Off)');
        res.json({ success: true, message: 'Đã tắt màn hình vật lý' });
    });
});

// 3. Khóa màn hình máy tính Windows (Win+L / LockWorkStation)
app.post('/api/system/lock-windows', authMiddleware, (req, res) => {
    exec('rundll32.exe user32.dll,LockWorkStation', (err) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        logger.info('Đã khóa màn hình Windows (LockWorkStation)');
        res.json({ success: true, message: 'Đã khóa màn hình Windows' });
    });
});

// 4. Lấy trạng thái Git của thư mục làm việc hiện tại (Git Radar HUD)
app.get('/api/sessions/:id/git', authMiddleware, (req, res) => {
    const session = ptyManager.getSession(req.params.id);
    if (!session || !session.cwd) return res.json({ success: true, isGit: false });
    const cwd = session.cwd;
    exec('git branch --show-current && git status --porcelain', { cwd, timeout: 3000 }, (err, stdout) => {
        if (err) return res.json({ success: true, isGit: false });
        const lines = stdout.trim().split(/\r?\n/).filter(l => l.trim());
        const branch = lines.length > 0 ? lines[0].trim() : 'HEAD';
        const changes = lines.slice(1);
        res.json({
            success: true,
            isGit: true,
            cwd,
            branch,
            modified: changes.length,
            hasChanges: changes.length > 0
        });
    });
});

// 5. Broadcast lệnh tới toàn bộ các Session PTY đang mở
app.post('/api/sessions/broadcast', authMiddleware, (req, res) => {
    const { data } = req.body;
    if (!data) return res.status(400).json({ success: false, error: 'Thiếu dữ liệu lệnh' });
    const sessions = ptyManager.listSessions();
    for (const s of sessions) {
        ptyManager.write(s.id, data);
    }
    logger.info(`Đã broadcast lệnh tới ${sessions.length} sessions`);
    res.json({ success: true, count: sessions.length });
});

// 6. Quét các cổng TCP đang lắng nghe trên máy (Localhost Web Preview)
app.get('/api/system/listening-ports', authMiddleware, (req, res) => {
    exec('powershell -NoProfile -Command "Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty LocalPort -Unique | Sort-Object"', { timeout: 3000 }, (err, stdout) => {
        if (err) return res.json({ success: true, ports: [3000, 5173, 8000, 8080] });
        const allPorts = stdout.trim().split(/\r?\n/).map(p => parseInt(p.trim(), 10)).filter(p => !isNaN(p));
        // Lọc bỏ cổng hệ thống và cổng chính của TeleTerm (4000)
        const devPorts = allPorts.filter(p => p !== 4000 && p !== 135 && p !== 445 && p < 49152);
        res.json({ success: true, ports: devPorts });
    });
});

// 7. Reverse Proxy Bridge xem web đang code dở từ điện thoại
app.use('/proxy/:port', authMiddleware, (req, res) => {
    const targetPort = parseInt(req.params.port, 10);
    if (!targetPort || targetPort < 1 || targetPort > 65535) {
        return res.status(400).send('Cổng không hợp lệ');
    }

    const subPath = req.url === '/' ? '' : req.url;
    const options = {
        hostname: '127.0.0.1',
        port: targetPort,
        path: subPath,
        method: req.method,
        headers: {
            ...req.headers,
            host: `127.0.0.1:${targetPort}`
        }
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        res.status(502).send(`<html><body style="background:#0c0c16;color:#f8fafc;font-family:sans-serif;padding:30px;text-align:center;"><h2>⚠️ Không thể kết nối tới localhost:${targetPort}</h2><p style="color:#94a3b8;">Vui lòng kiểm tra web app / server của anh đã chạy trên cổng ${targetPort} chưa nhé!</p></body></html>`);
    });

    req.pipe(proxyReq);
});

// ==================== TASK COMPLETION ALERT API ====================

// Bắn chuông cảnh báo hoàn thành tác vụ
app.post('/api/notify/alert', authMiddleware, async (req, res) => {
    const { title, message, sound } = req.body;
    await notifier.sendNotification(title || 'TeleTerm Task Alert', message || 'Tác vụ đã hoàn tất!', 'bell');

    const payload = JSON.stringify({
        type: 'task_alert',
        title: title || 'TeleTerm Task Alert',
        message: message || 'Tác vụ đã hoàn tất!',
        sound: sound || 'chime',
        timestamp: Date.now()
    });

    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
            try { client.send(payload); } catch (e) {}
        }
    }
    res.json({ success: true });
});

// Lấy toàn bộ lịch sử code / terminal đã ghi nhận cho một System PID
app.get('/api/system-terminals/:pid/history', authMiddleware, (req, res) => {
    const pid = parseInt(req.params.pid, 10);
    const history = processTracker.getHistory(pid);
    res.json({ success: true, pid, history });
});

// ==================== ANTIGRAVITY CONTROLLER API ====================

// Lấy trạng thái toàn diện của Antigravity (Tiến trình desktop, RAM, CLI models, hội thoại)
app.get('/api/antigravity/status', authMiddleware, async (req, res) => {
    try {
        const [status, detailedSessions, models] = await Promise.all([
            antigravityManager.getStatus(),
            antigravityManager.getDetailedSessions(12),
            antigravityManager.getAvailableModels()
        ]);
        const conversations = (detailedSessions && detailedSessions.length > 0)
            ? detailedSessions
            : await antigravityManager.listRecentConversations(12);
        res.json({
            success: true,
            status,
            conversations,
            models
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Điều khiển ứng dụng Antigravity Desktop (start, stop, restart)
app.post('/api/antigravity/app', authMiddleware, async (req, res) => {
    const { action } = req.body;
    let result;
    if (action === 'start') {
        result = await antigravityManager.startApp();
        logger.info('Lệnh mở ứng dụng Antigravity từ xa');
    } else if (action === 'stop') {
        result = await antigravityManager.stopApp();
        logger.info('Lệnh tắt ứng dụng Antigravity từ xa');
    } else if (action === 'restart') {
        result = await antigravityManager.restartApp();
        logger.info('Lệnh khởi động lại ứng dụng Antigravity từ xa');
    } else {
        return res.status(400).json({ success: false, message: 'Hành động không hợp lệ' });
    }
    res.json(result);
});

// Khởi chạy phiên PTY Agent Antigravity (agy.exe)
app.post('/api/antigravity/session', authMiddleware, (req, res) => {
    const { mode, conversationId, model, name } = req.body;
    const agyPath = antigravityManager.cliExePath;

    if (!fs.existsSync(agyPath)) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy agy.exe' });
    }

    const args = [];
    if (conversationId) {
        args.push('--conversation', conversationId);
    } else if (mode === 'continue') {
        args.push('-c');
    }
    if (model) {
        args.push('--model', model);
    }

    // Tự động bỏ qua xác nhận tool nếu chạy từ xa
    args.push('--dangerously-skip-permissions');

    const sessionName = name || (mode === 'continue' ? '🛸 Antigravity (Tiếp tục)' : '🛸 Antigravity Agent');

    // Tạo PTY session chuyên biệt cho agy
    const session = ptyManager.createSession({
        name: sessionName,
        shellId: 'agy',
        customArgs: args,
        cols: 100,
        rows: 30
    });

    // Nếu cần ghi đè args khởi động cho agy
    logger.info(`Đã mở phiên terminal Antigravity Agent (${session.id})`);
    res.json({
        success: true,
        session: {
            id: session.id,
            name: session.name,
            shellId: session.shellId,
            status: session.status
        }
    });
});

// Gửi prompt tới Antigravity (ưu tiên kết nối trực tiếp vào Desktop App, fallback sang CLI)
app.post('/api/antigravity/prompt', authMiddleware, async (req, res) => {
    const { prompt, model, conversationId } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Thiếu prompt' });

    logger.info(`Gửi prompt tới Antigravity (session: ${conversationId || 'active'}): "${prompt.substring(0, 30)}..."`);
    const result = await antigravityManager.sendUserPrompt(prompt, conversationId, model);
    res.json(result);
});

// Lấy tiến trình live theo thời gian thực của session đang chạy ("Đang tới đâu")
app.get('/api/antigravity/live-session', authMiddleware, async (req, res) => {
    try {
        const targetSessionId = req.query.sessionId || req.query.id || null;
        const live = await antigravityManager.getCurrentSessionLiveProgress(targetSessionId);
        res.json(live);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Lấy danh sách các session Antigravity gần đây kèm tiêu đề
app.get('/api/antigravity/sessions', authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 12;
        const sessions = await antigravityManager.getDetailedSessions(limit);
        res.json({ success: true, sessions });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Lấy toàn bộ tin nhắn chat của một session cụ thể
app.get('/api/antigravity/session/:id/messages', authMiddleware, async (req, res) => {
    try {
        const sessionId = req.params.id;
        const result = await antigravityManager.getSessionMessages(sessionId);
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Lấy danh sách session chuẩn cấu trúc sidebar (Pinned & Projects)
app.get('/api/antigravity/sidebar-sessions', authMiddleware, async (req, res) => {
    try {
        const sidebar = await antigravityManager.getSidebarSessions();
        res.json(sidebar);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Lấy nội dung artifact (kế hoạch implementation_plan.md hoặc kết quả walkthrough.md)
app.get('/api/antigravity/artifact/:type', authMiddleware, async (req, res) => {
    try {
        const type = req.params.type;
        const conversationId = req.query.conversationId || null;
        const result = await antigravityManager.getArtifactContent(type, conversationId);
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Lấy thông tin hạn mức Quota, Tier và Models
app.get('/api/antigravity/quota', authMiddleware, async (req, res) => {
    try {
        const quota = await antigravityManager.getQuotaInfo();
        res.json(quota);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ==================== FAST ACCOUNT SWITCHER API ====================

// Lấy danh sách tài khoản
app.get('/api/accounts', authMiddleware, (req, res) => {
    const accs = accountManager.getAccounts();
    res.json({ success: true, ...accs });
});

app.get('/api/accounts/quota', authMiddleware, (req, res) => {
    let codexTokens = 0;
    try {
        const { DatabaseSync } = require('node:sqlite');
        const dbPath = require('path').join(require('os').homedir(), '.codex', 'thread_history_1.sqlite');
        if (require('fs').existsSync(dbPath)) {
            const db = new DatabaseSync(dbPath, { readOnly: true });
            const items = db.prepare("SELECT item_json FROM thread_items WHERE item_type IN ('userMessage', 'agentMessage', 'commandExecution')").all();
            let totalChars = 0;
            items.forEach(r => { if(r.item_json) totalChars += r.item_json.length; });
            codexTokens = Math.floor(totalChars / 4);
            db.close();
        }
    } catch (e) {
        logger.error('[Quota] Lỗi tính token Codex: ' + e.message);
    }
    res.json({ success: true, antigravityTokens: 'Đang phát triển (chưa có API log)', codexTokens: codexTokens });
});

// Đổi tài khoản 1-chạm
app.post('/api/accounts/switch', authMiddleware, async (req, res) => {
    const { provider, profileId, autoRestartApp } = req.body;
    if (!provider || !profileId) {
        return res.status(400).json({ success: false, message: 'Thiếu provider hoặc profileId' });
    }
    const result = await accountManager.switchProfile(provider, profileId);
    if (result.success) {
        logger.info(`Đã đổi tài khoản [${provider}]: ${result.activeProfile?.name || profileId}`);
        // Tự động khởi động lại Antigravity Desktop với hồ sơ riêng biệt nếu yêu cầu hoặc nếu app đang chạy
        if (provider === 'antigravity' && autoRestartApp) {
            try {
                const agyStatus = await antigravityManager.getStatus();
                if (agyStatus.app.isRunning) {
                    await antigravityManager.restartApp();
                    result.appRestarted = true;
                    logger.info(`Đã tự động khởi động lại Antigravity Desktop: ${result.activeProfile?.name}`);
                } else {
                    await antigravityManager.startApp();
                    result.appRestarted = true;
                    logger.info(`Đã khởi động Antigravity Desktop: ${result.activeProfile?.name}`);
                }

                // Nếu tài khoản này chưa có token đã lưu (cần đăng nhập/xác minh):
                // Tự động kích hoạt cơ chế Auto-Verify (CDP click Continue with Google và lắng nghe token)
                if (result.activeProfile && !result.activeProfile.hasSavedToken && result.activeProfile.email) {
                    const targetEmail = result.activeProfile.email;
                    logger.info(`[AutoVerify] Bắt đầu tự động xác thực và bắt token cho ${targetEmail}...`);
                    antigravityVerifier.startAutoVerification(targetEmail, (progress) => {
                        logger.info(`[AutoVerify] ${progress.message}`);
                        wss.clients.forEach(client => {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({
                                    type: 'auto_verify_progress',
                                    progress
                                }));
                            }
                        });
                    });
                    result.autoVerifying = true;
                }
            } catch (err) {
                console.error('[Switch] Lỗi tự động restart Antigravity:', err.message);
            }
        }
    }
    res.json(result);
});

// Kích hoạt tự động xác minh tài khoản theo yêu cầu
app.post('/api/antigravity/auto-verify', authMiddleware, async (req, res) => {
    const { email } = req.body;
    const targetEmail = email || accountManager.getActiveAntigravityProfile().email;
    if (!targetEmail) return res.status(400).json({ success: false, message: 'Thiếu email để xác minh' });

    antigravityVerifier.startAutoVerification(targetEmail, (progress) => {
        logger.info(`[AutoVerify] ${progress.message}`);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'auto_verify_progress',
                    progress
                }));
            }
        });
    });

    res.json({ success: true, message: `Đang tự động xác minh tài khoản ${targetEmail}...` });
});

// Dừng tiến trình tự động xác minh
app.post('/api/antigravity/auto-verify/stop', authMiddleware, (req, res) => {
    antigravityVerifier.stop();
    logger.info('[AutoVerify] Đã dừng tiến trình xác minh');
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'auto_verify_progress',
                progress: { status: 'stopped', message: 'Đã dừng tiến trình xác minh tự động' }
            }));
        }
    });
    res.json({ success: true, message: 'Đã dừng tiến trình xác minh' });
});

// Thêm profile tài khoản mới
app.post('/api/accounts', authMiddleware, (req, res) => {
    const result = accountManager.addProfile(req.body);
    if (result.success) {
        logger.info(`Thêm profile tài khoản mới: ${req.body.name}`);
    }
    res.json(result);
});

// Cập nhật profile tài khoản
app.put('/api/accounts/:id', authMiddleware, (req, res) => {
    const result = accountManager.updateProfile(req.params.id, req.body);
    res.json(result);
});

// Xóa profile tài khoản
app.delete('/api/accounts/:id', authMiddleware, (req, res) => {
    const result = accountManager.deleteProfile(req.params.id);
    if (result.success) {
        logger.info(`Đã xóa profile tài khoản: ${req.params.id}`);
    }
    res.json(result);
});

// ==================== CODEX API ====================

// Trạng thái Codex desktop / runtime
app.get('/api/codex/status', authMiddleware, async (req, res) => {
    try {
        const status = await codexManager.getStatus();
        res.json({ success: true, status });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Sidebar: Danh sách Projects và Recents
app.get('/api/codex/sidebar', authMiddleware, async (req, res) => {
    try {
        const data = await codexManager.getSidebar();
        res.json(data);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Chi tiết toàn bộ lượt chat, thought, lệnh và file diff của một thread
app.get('/api/codex/threads/:id', authMiddleware, async (req, res) => {
    try {
        const data = await codexManager.getThreadDetails(req.params.id);
        res.json(data);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Gửi prompt vào session Codex (hoặc tạo session mới)
app.post('/api/codex/prompt', authMiddleware, async (req, res) => {
    try {
        const { threadId, message, model } = req.body;
        const result = await codexManager.sendMessage(threadId, message, model);
        res.json(result);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ==================== UNIVERSAL AGENT WATCHER API ====================
const universalAgentManager = new Proxy({}, {
    get(target, prop) {
        const mod = require('./universal-agent-manager');
        const val = mod[prop];
        return typeof val === 'function' ? val.bind(mod) : val;
    }
});

// Quét và phát hiện toàn bộ các agent (OpenClaw, Claude Code, Cursor, Aider, Windsurf...)
app.get('/api/agents/detected', authMiddleware, async (req, res) => {
    try {
        const data = await universalAgentManager.scanDiscoveredAgents();
        res.json(data);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Lấy lịch sử chat và turns của bất kỳ agent nào phát hiện được
app.get('/api/agents/:agentType/:sessionId/messages', authMiddleware, async (req, res) => {
    try {
        const data = await universalAgentManager.getSessionMessages(req.params.agentType, req.params.sessionId);
        res.json(data);
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/profile-claims', authMiddleware, (req, res) => {
    res.json({ success: true, requests: desktopAuth.authManager.listProfileClaimRequests() });
});

app.post('/api/profile-claims/:requestId/approve', authMiddleware, (req, res) => {
    const result = desktopAuth.authManager.approveProfileClaim(req.params.requestId);
    if (!result.success) return res.status(409).json(result);
    return res.json({ success: true, profile: desktopAuth.security.publicProfile(result.profile) });
});

app.delete('/api/profile-claims/:requestId', authMiddleware, (req, res) => {
    const removed = desktopAuth.authManager.rejectProfileClaim(req.params.requestId);
    return res.status(removed ? 200 : 404).json({ success: removed, error: removed ? undefined : 'claim_request_not_found' });
});

// ==================== WEBSOCKET ====================

// Fail closed for any API route that was not explicitly classified above.
app.use('/api', (req, res) => res.status(404).json({ success: false, error: 'api_not_found' }));

server.on('upgrade', (request, socket, head) => {
    let url;
    try { url = new URL(request.url, `http://${request.headers.host}`); }
    catch (_) { socket.destroy(); return; }
    const bearerAuth = /^Bearer\s+\S+/i.test(request.headers.authorization || '');
    const isDirect = desktopAuth.security.isDirectLocalhost(request);
    if (!isDirect && ((!request.headers.origin && !bearerAuth) || !desktopAuth.security.originAllowed(request))) {
        socket.destroy();
        return;
    }
    let session = desktopAuth.authManager.authenticateRequest(request);
    if (!session && isDirect) {
        session = desktopAuth.authManager.getOrCreateLocalOwnerSession(request, null);
    }
    const address = request.socket.remoteAddress || 'unknown';
    const bucketKey = session ? `${address}:${session.userId}` : `unauthenticated:${address}`;
    const now = Date.now();
    let bucket = upgradeRateBuckets.get(bucketKey);
    if (!bucket || bucket.resetAt <= now) bucket = { count: 0, resetAt: now + 60_000 };
    bucket.count += 1;
    upgradeRateBuckets.set(bucketKey, bucket);
    if (bucket.count > 120) { socket.destroy(); return; }
    if (upgradeRateBuckets.size > 5000) {
        for (const [key, entry] of upgradeRateBuckets) if (entry.resetAt <= now) upgradeRateBuckets.delete(key);
    }
    const ownerOnlyPath = url.pathname === '/ws' || url.pathname === '/ws/ade-stream';
    if (!session || (ownerOnlyPath && !session.isOwner)) {
        socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
    }
    request.authSession = session;
    activeAuthenticatedSockets.set(socket, { userId: session.userId, token: session.token });
    socket.once('close', () => activeAuthenticatedSockets.delete(socket));
    
    // Route 1: Metaverse Multiplayer World WebSocket Gateway (12 Hz)
    if (url.pathname === '/ws/world') {
        realtimeGateway.handleUpgrade(request, socket, head);
        return;
    }

    // Route 1b: TeleTerm ADE Realtime Streaming Gateway
    if (url.pathname === '/ws/ade-stream') {
        adeGateway.handleUpgrade(request, socket, head);
        return;
    }

    // Route 2: Private PTY Terminal Session
    if (url.pathname !== '/ws') {
        socket.destroy();
        return;
    }

    // Terminal/control WebSocket is owner-only and uses the same verified session.
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    let currentTarget = url.searchParams.get('sessionId') || '';
    let systemPollInterval = null;
    let lastAnsiScreen = '';

    logger.info(`WebSocket kết nối từ ${clientIp || 'localhost'}`, clientIp);

    // Gửi thông tin build và phiên bản để client tự động đồng bộ & reload khi có code mới
    ws.send(JSON.stringify({
        type: 'server_hello',
        version: '4.0.0',
        buildId: SERVER_BUILD_ID,
        timestamp: Date.now()
    }));

    // A reconnect that names a session must never fall through to another PTY.
    if (currentTarget && !currentTarget.startsWith('sys-') && !ptyManager.getSession(currentTarget)) {
        ws.send(JSON.stringify({ type: 'session_unavailable', sessionId: currentTarget }));
        ws.close(4404, 'session unavailable');
        return;
    }

    // Hàm đính kèm vào System PID
    async function attachSystemPid(pid) {
        if (systemPollInterval) clearInterval(systemPollInterval);
        currentTarget = `sys-${pid}`;
        lastAnsiScreen = '';
        logger.info(`Đính kèm System Terminal PID ${pid}`, clientIp);

        const renderOnce = async () => {
            const res = await processTracker.getAnsiScreen(pid);
            if (res.success && res.ansi) {
                if (res.ansi !== lastAnsiScreen) {
                    lastAnsiScreen = res.ansi;
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'ansi_screen',
                            sessionId: currentTarget,
                            pid: pid,
                            cols: res.cols,
                            rows: res.rows,
                            cursorX: res.cursorX,
                            cursorY: res.cursorY,
                            ansi: res.ansi
                        }));
                    }
                }
            }
        };

        // Gửi màn hình đầu tiên
        await renderOnce();

        // Polling mượt mà mỗi 600ms
        systemPollInterval = setInterval(async () => {
            if (ws.readyState !== WebSocket.OPEN) {
                clearInterval(systemPollInterval);
                return;
            }
            await renderOnce();
        }, 600);
    }

    // Hàm đính kèm vào PTY Session
    function attachPtySession(sessionId) {
        if (systemPollInterval) {
            clearInterval(systemPollInterval);
            systemPollInterval = null;
        }
        currentTarget = sessionId;
        ptyManager.attach(sessionId, ws);
    }

    // Khởi tạo phiên
    if (currentTarget.startsWith('sys-')) {
        const pid = parseInt(currentTarget.substring(4), 10);
        attachSystemPid(pid);
    } else {
        if (ptyManager.listSessions().length === 0) {
            const defaultSession = ptyManager.createSession();
            currentTarget = defaultSession.id;
        } else if (!currentTarget || !ptyManager.getSession(currentTarget)) {
            currentTarget = ptyManager.listSessions()[0].id;
        }
        attachPtySession(currentTarget);
    }

    ws.on('message', async (msg) => {
        try {
            const payload = JSON.parse(msg.toString());

            switch (payload.type) {
                case 'input':
                    if (currentTarget.startsWith('sys-')) {
                        const pid = parseInt(currentTarget.substring(4), 10);
                        await processTracker.sendInput(pid, payload.data);
                        // Cập nhật lại màn hình ngay lập tức sau 80ms
                        setTimeout(async () => {
                            const res = await processTracker.getAnsiScreen(pid);
                            if (res.success && res.ansi && ws.readyState === WebSocket.OPEN) {
                                lastAnsiScreen = res.ansi;
                                ws.send(JSON.stringify({
                                    type: 'ansi_screen',
                                    sessionId: currentTarget,
                                    pid: pid,
                                    cols: res.cols,
                                    rows: res.rows,
                                    cursorX: res.cursorX,
                                    cursorY: res.cursorY,
                                    ansi: res.ansi
                                }));
                            }
                        }, 80);
                    } else if (currentTarget && typeof payload.data === 'string') {
                        ptyManager.write(currentTarget, payload.data, ws);
                    }
                    break;

                case 'resize':
                    if (!currentTarget.startsWith('sys-') && currentTarget && payload.cols && payload.rows) {
                        ptyManager.resize(currentTarget, payload.cols, payload.rows, ws);
                    }
                    break;

                case 'switch':
                    if (payload.sessionId && payload.sessionId !== currentTarget) {
                        if (!payload.sessionId.startsWith('sys-') && !ptyManager.getSession(payload.sessionId)) {
                            ws.send(JSON.stringify({ type: 'session_unavailable', sessionId: payload.sessionId }));
                            break;
                        }
                        if (!currentTarget.startsWith('sys-')) {
                            ptyManager.detach(currentTarget, ws);
                        }
                        if (payload.sessionId.startsWith('sys-')) {
                            const pid = parseInt(payload.sessionId.substring(4), 10);
                            attachSystemPid(pid);
                        } else {
                            attachPtySession(payload.sessionId);
                        }
                    }
                    break;

                case 'sync_queue':
                    if (Array.isArray(payload.queue) && currentTarget && !currentTarget.startsWith('sys-')) {
                        let count = 0;
                        for (const item of payload.queue) {
                            if (item && typeof item.data === 'string') {
                                ptyManager.write(currentTarget, item.data);
                                count++;
                            }
                        }
                        ws.send(JSON.stringify({
                            type: 'queue_ack',
                            processed: count,
                            timestamp: Date.now()
                        }));
                    }
                    break;

                case 'broadcast_input':
                    if (typeof payload.data === 'string') {
                        const sessions = ptyManager.listSessions();
                        for (const s of sessions) {
                            ptyManager.write(s.id, payload.data);
                        }
                    }
                    break;

                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;
            }
        } catch (err) {
            console.error('[WS] Lỗi xử lý message:', err.message);
        }
    });

    ws.on('close', () => {
        if (systemPollInterval) clearInterval(systemPollInterval);
        if (currentTarget && !currentTarget.startsWith('sys-')) {
            ptyManager.detach(currentTarget, ws);
        }
    });
});

// Định kỳ gửi heartbeat mỗi 15s để chống Cloudflare idle timeout
setInterval(() => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            try {
                client.send(JSON.stringify({ type: 'heartbeat', time: Date.now() }));
            } catch (e) {}
        }
    });
}, 15000);

// Bắn log thời gian thực tới tất cả các client đang mở
logger.on('log', (entry) => {
    const data = JSON.stringify({ type: 'log', entry });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
});

// Bắn sự kiện thay đổi session tới tất cả các client đang mở
ptyManager.on('sessionUpdated', (session) => {
    const data = JSON.stringify({ type: 'session_updated', session });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            try { client.send(data); } catch (e) {}
        }
    });
});

ptyManager.on('sessionExited', (e) => {
    const data = JSON.stringify({ type: 'session_exited', ...e });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            try { client.send(data); } catch (e) {}
        }
    });
});

// Zero-Leak Telemetry Analyzer: Phát hiện an toàn các mốc kiểm thử, build và git commit để thưởng EXP
ptyManager.on('data', ({ id, data }) => {
    try {
        const result = telemetryService.inspectOutput('host_dev', id, data);
        if (result && result.awarded > 0) {
            const xpPayload = JSON.stringify({
                type: 'xp_toast',
                awarded: result.awarded,
                level: result.level,
                title: result.title,
                totalXp: result.totalXp,
                leveledUp: result.leveledUp
            });
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    try { client.send(xpPayload); } catch (e) {}
                }
            });
        }
    } catch (e) {}
});

// Owner-only, single-use device pairing QR with direct desktop entry.
app.get('/qr', authMiddleware, async (req, res) => {
    const code = desktopAuth.authManager.createPairingCode(req.authSession);
    const baseUrl = process.env.TELETERM_PUBLIC_ORIGIN || tunnelManager.publicUrl || `http://${getLocalIp()}:${config.PORT}`;
    const pairingUrl = `${baseUrl.replace(/\/$/, '')}/#pair=${encodeURIComponent(code)}`;
    try {
        const qr = await QRCode.toString(pairingUrl, { type: 'svg', margin: 1, width: 260 });
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'self'");
        res.type('html').send(`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TeleTerm 3D — Trạm Điều Khiển</title><style>
* { box-sizing: border-box; }
body {
    margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: radial-gradient(circle at 50% 20%, #1e293b 0%, #0c1220 100%);
    color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    padding: 20px;
}
.card {
    max-width: 440px; width: 100%; padding: 32px 28px; text-align: center;
    background: rgba(23, 32, 51, 0.95); border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.15);
}
.badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 14px; border-radius: 9999px;
    background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3);
    color: #4ade80; font-size: 13px; font-weight: 600; margin-bottom: 16px;
}
h1 { margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #ffffff; }
.desc { margin: 0 0 20px; font-size: 14px; color: #94a3b8; line-height: 1.5; }
.btn-launch {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 14px 20px; margin-bottom: 24px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white; text-decoration: none; font-weight: 700; font-size: 15px;
    border-radius: 12px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn-launch:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.6); }
.divider {
    display: flex; align-items: center; gap: 12px; margin: 20px 0;
    color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;
}
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(255, 255, 255, 0.1); }
.qr { background: white; padding: 14px; border-radius: 14px; margin: 0 auto 16px; max-width: 260px; box-shadow: 0 8px 16px rgba(0,0,0,0.3); }
.qr svg { width: 100%; height: auto; display: block; }
.note { font-size: 12px; color: #64748b; margin: 0; line-height: 1.4; }
</style></head><body><main class="card"><div class="badge">● Quyền Quản Trị Chủ Máy (Owner)</div><h1>TeleTerm 3D Metaverse</h1><p class="desc">Máy chủ đã sẵn sàng. Bạn có thể vào trực tiếp trên trình duyệt hoặc quét mã QR để điều khiển từ điện thoại.</p><a href="/?direct=1" class="btn-launch">🎮 Vào Thẳng Thế Giới 3D Trên Máy Tính</a><div class="divider">Hoặc Quét Để Kết Nối Điện Thoại</div><div class="qr">${qr}</div><p class="note">Mã QR ghép cặp chỉ dùng 1 lần, hết hạn sau 60s.<br>Chỉ quét trên thiết bị cá nhân của bạn.</p></main></body></html>`);
    } catch (error) {
        res.status(500).send('Không thể tạo mã ghép thiết bị.');
    }
});

app.get('/qr.svg', authMiddleware, async (req, res) => {
    const code = desktopAuth.authManager.createPairingCode(req.authSession);
    const baseUrl = process.env.TELETERM_PUBLIC_ORIGIN || tunnelManager.publicUrl || `http://${getLocalIp()}:${config.PORT}`;
    const pairingUrl = `${baseUrl.replace(/\/$/, '')}/#pair=${encodeURIComponent(code)}`;
    try {
        const svg = await QRCode.toString(pairingUrl, { type: 'svg', margin: 1, width: 300 });
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg);
    } catch (_) {
        res.status(500).send('Error generating QR');
    }
});

// ==================== KHỞI ĐỘNG ====================

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    const candidates = [];
    const virtualPatterns = /vethernet|wsl|virtual|vmware|hyper-v|loopback|docker|tailscale|zerotier/i;

    for (const name of Object.keys(interfaces)) {
        const isVirtual = virtualPatterns.test(name);
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                const addr = iface.address;
                if (addr.startsWith('169.254.') || addr.startsWith('192.168.56.')) continue;
                if (addr.startsWith('172.') && isVirtual) continue;

                candidates.push({
                    name,
                    address: addr,
                    isVirtual,
                    isPreferred: /wi-fi|wlan|wireless|ethernet|eth|en/i.test(name) && (addr.startsWith('192.168.') || addr.startsWith('10.'))
                });
            }
        }
    }

    const preferred = candidates.find(c => !c.isVirtual && c.isPreferred);
    if (preferred) return preferred.address;

    const nonVirtual = candidates.find(c => !c.isVirtual);
    if (nonVirtual) return nonVirtual.address;

    if (candidates.length > 0) return candidates[0].address;
    return '127.0.0.1';
}

function startServer() {
    return new Promise((resolve) => {
        // 1. Kích hoạt chế độ chống Windows Sleep 24/7
        powerManager.preventSleep();

        server.listen(config.PORT, config.HOST, async () => {
        const localIp = getLocalIp();
        const localUrl = `http://localhost:${config.PORT}`;
        const lanUrl = `http://${localIp}:${config.PORT}`;

        logger.info(`Máy chủ TeleTerm đã khởi động trên cổng ${config.PORT}`);

        console.clear();
        console.log('================================================================');
        console.log('       🚀  TELE-TERM : REMOTE TERMINAL CONTROLLER (24/7)  🚀');
        console.log('================================================================');
        console.log(`[Host] Máy chủ Windows: ${os.hostname()} (${os.platform()})`);
        console.log(`[Chế độ] 🛡️  Windows Sleep Inhibitor: ĐANG BẬT (Không bị tắt khi đi xa)`);
        console.log(`[Local PC]    : ${localUrl}`);
        console.log(`[Wi-Fi LAN]   : ${lanUrl}`);
        console.log('----------------------------------------------------------------');
        console.log(`✨ BẢO MẬT: \x1b[32m\x1b[1mĐÃ BỎ 100%\x1b[0m (Passwordless - Quét mã là vào ngay, không cần PIN)`);
        console.log('----------------------------------------------------------------');

        console.log('Đang kết nối Cloudflare Tunnel (Cho 4G/5G khi khác mạng)...');
        const publicUrl = await tunnelManager.startTunnel(config.PORT);
        const primaryQrUrl = publicUrl || lanUrl;

        console.clear();
        console.log('================================================================');
        console.log('       🚀  TELE-TERM : REMOTE TERMINAL CONTROLLER (24/7)  🚀');
        console.log('================================================================');
        console.log(`[Host] Máy chủ Windows: ${os.hostname()} (${os.platform()})`);
        console.log(`[Chế độ] 🛡️  Windows Sleep Inhibitor: ĐANG BẬT (Không bị tắt khi đi xa)`);
        console.log(`[Local PC]    : ${localUrl}`);
        console.log(`[Wi-Fi LAN]   : ${lanUrl}`);
        console.log('----------------------------------------------------------------');
        console.log(`✨ BẢO MẬT: \x1b[32m\x1b[1mĐÃ BỎ 100%\x1b[0m (Passwordless - Quét mã là vào ngay, không cần PIN)`);
        console.log('----------------------------------------------------------------');

        if (publicUrl) {
            console.log(`🌐 [INTERNET URL - CHO ĐIỆN THOẠI 4G/5G HOẶC KHI ĐI XA (KHÁC MẠNG)]:`);
            console.log(`\x1b[36m\x1b[1m${publicUrl}\x1b[0m`);
            console.log('----------------------------------------------------------------');
        }

        console.log(`📶 [MẠNG LOCAL WI-FI - DÙNG KHI CÙNG BẮT CHUNG 1 WI-FI (0ms)]:`);
        console.log(`\x1b[32m${lanUrl}\x1b[0m`);
        console.log('----------------------------------------------------------------');

        if (config.NTFY_TOPIC) {
            console.log(`📲 Kênh nhận thông báo tự động (ntfy.sh): https://ntfy.sh/${config.NTFY_TOPIC}`);
            console.log('----------------------------------------------------------------');
        }
        console.log(`📄 Trang xem cả 2 mã QR trên web: http://localhost:${config.PORT}/qr`);
        console.log('----------------------------------------------------------------');
        
        if (publicUrl) {
            console.log('📱 MÃ QR DƯỚI ĐÂY DÙNG ĐƯỢC CHO CẢ 4G/5G VÀ KHÁC MẠNG (Quét là vào ngay):');
        } else {
            console.log('📱 MÃ QR DƯỚI ĐÂY LÀ MẠNG LOCAL (Điện thoại cần bắt cùng Wi-Fi với laptop):');
        }
        console.log('----------------------------------------------------------------\n');
        
        qrcodeTerminal.generate(primaryQrUrl, { small: true });

        // Tự động xuất file ảnh QR Code PNG để hiển thị trực tiếp trong giao diện chat
        try {
            const pubQrPath = path.join(__dirname, '../../public/teleterm_qr.png');
            await QRCode.toFile(pubQrPath, primaryQrUrl, { width: 400, margin: 2 });
            const artifactDir = path.join(os.homedir(), '.gemini', 'antigravity', 'brain', '1a0e0f57-6c69-4129-9528-a9020d15abdb');
            if (fs.existsSync(artifactDir)) {
                const artQrPath = path.join(artifactDir, 'teleterm_qr.png');
                await QRCode.toFile(artQrPath, primaryQrUrl, { width: 400, margin: 2 });
            }
        } catch (e) {
            console.error('[QR] Lỗi xuất ảnh QR code PNG:', e.message);
        }

        console.log('\n================================================================\n');
        resolve({ server, localUrl, lanUrl, publicUrl });
    });
    });
}

if (require.main === module) {
    startServer();
}

module.exports = {
    app,
    server,
    startServer,
    config
};
