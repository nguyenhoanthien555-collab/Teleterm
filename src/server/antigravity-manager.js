const { execFile, spawn } = require('child_process');
const https = require('https');
const path = require('path');
const fs = require('fs');
const os = require('os');

const KNOWN_MODEL_MAP = {
    'gemini-3.8-flash-high': 'MODEL_PLACEHOLDER_M318',
    'gemini-3.8-flash-medium': 'MODEL_PLACEHOLDER_M319',
    'gemini-3.8-flash-low': 'MODEL_PLACEHOLDER_M320',
    'gemini-3.7-flash-high': 'MODEL_PLACEHOLDER_M298',
    'gemini-3.7-flash-medium': 'MODEL_PLACEHOLDER_M299',
    'gemini-3.7-flash-low': 'MODEL_PLACEHOLDER_M300',
    'gemini-3.6-flash-high': 'MODEL_PLACEHOLDER_M71',
    'gemini-3.6-flash-medium': 'MODEL_PLACEHOLDER_M72',
    'gemini-3.6-flash-low': 'MODEL_PLACEHOLDER_M73',
    'gemini-3.5-flash-high': 'MODEL_PLACEHOLDER_M84',
    'gemini-3-flash-agent': 'MODEL_PLACEHOLDER_M84',
    'gemini-3-flash': 'MODEL_PLACEHOLDER_M18',
    'gemini-3.1-pro-high': 'MODEL_PLACEHOLDER_M37',
    'gemini-3.1-pro-low': 'MODEL_PLACEHOLDER_M36',
    'gemini-pro-agent': 'MODEL_PLACEHOLDER_M16',
    'gemini-2.5-pro': 'MODEL_GOOGLE_GEMINI_2_5_PRO',
    'gemini-2.5-flash': 'MODEL_GOOGLE_GEMINI_2_5_FLASH',
    'gemini-2.5-flash-lite': 'MODEL_GOOGLE_GEMINI_2_5_FLASH_LITE',
    'gemini-2.5-flash-thinking': 'MODEL_GOOGLE_GEMINI_2_5_FLASH_THINKING',
    'claude-sonnet-4-6': 'MODEL_PLACEHOLDER_M35',
    'claude-opus-4-6-thinking': 'MODEL_PLACEHOLDER_M26',
    'gpt-oss-120b-medium': 'MODEL_OPENAI_GPT_OSS_120B_MEDIUM'
};

const DEFAULT_MODELS_FALLBACK = [
    { id: 'gemini-3.8-flash-high', name: 'Gemini 3.8 Flash (High)' },
    { id: 'gemini-3.1-pro-high', name: 'Gemini 3.1 Pro (High)' },
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash' },
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (Thinking)' },
    { id: 'claude-opus-4-6-thinking', name: 'Claude Opus 4.6 (Thinking)' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash-lite', name: 'Gemini 3.5 Flash Lite' }
];

class AntigravityManager {
    constructor() {
        this.appExePath = path.join(
            process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'),
            'Programs', 'antigravity', 'Antigravity.exe'
        );
        this.cliExePath = path.join(os.homedir(), '.gemini', 'bin', 'agy.exe');
        this.conversationsDir = path.join(os.homedir(), '.gemini', 'antigravity', 'conversations');
        this.brainDir = path.join(os.homedir(), '.gemini', 'antigravity', 'brain');
        this._cachedLsInfo = null;
        this._lsInfoTime = 0;
    }

    _getAccountManager() {
        return require('./account-manager');
    }

    /**
     * Lấy trạng thái hoạt động của Antigravity (Tiến trình desktop, language_server, RAM tiêu thụ, CLI)
     */
    async getStatus() {
        return new Promise((resolve) => {
            const psCmd = `Get-Process -Name Antigravity, language_server -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, WorkingSet64, StartTime | ConvertTo-Json`;
            execFile('powershell.exe', ['-NoProfile', '-Command', psCmd], { timeout: 5000 }, (err, stdout) => {
                let isRunning = false;
                let pids = [];
                let totalMemoryBytes = 0;
                let startTime = null;

                if (!err && stdout && stdout.trim()) {
                    try {
                        const parsed = JSON.parse(stdout.trim());
                        const list = Array.isArray(parsed) ? parsed : [parsed];
                        if (list.length > 0) {
                            isRunning = true;
                            pids = list.map(p => p.Id);
                            totalMemoryBytes = list.reduce((sum, p) => sum + (p.WorkingSet64 || 0), 0);
                            startTime = list[0].StartTime || null;
                        }
                    } catch (e) {}
                }

                const totalMemoryMB = Math.round(totalMemoryBytes / (1024 * 1024));
                const hasAppExe = fs.existsSync(this.appExePath);
                const hasCliExe = fs.existsSync(this.cliExePath);
                const activeProfile = this._getAccountManager().getActiveAntigravityProfile();

                resolve({
                    success: true,
                    app: {
                        isRunning,
                        processCount: pids.length,
                        pids,
                        memoryMB: totalMemoryMB,
                        startTime,
                        exePath: this.appExePath,
                        installed: hasAppExe,
                        activeProfile: {
                            id: activeProfile.id,
                            name: activeProfile.name,
                            email: activeProfile.email,
                            userDataDir: activeProfile.userDataDir,
                            hasSavedToken: !!activeProfile.credential
                        }
                    },
                    cli: {
                        installed: hasCliExe,
                        exePath: this.cliExePath
                    },
                    timestamp: new Date().toISOString()
                });
            });
        });
    }

    /**
     * Khởi động ứng dụng Antigravity Desktop với Sandbox Profile riêng biệt
     */
    async startApp() {
        if (!fs.existsSync(this.appExePath)) {
            return { success: false, message: 'Không tìm thấy file Antigravity.exe tại ' + this.appExePath };
        }

        const status = await this.getStatus();
        if (status.app.isRunning) {
            return { success: true, message: 'Antigravity đang chạy rồi!', alreadyRunning: true };
        }

        const activeProfile = this._getAccountManager().getActiveAntigravityProfile();
        const args = [];

        // Đảm bảo đồng bộ app_storage.json chính trước khi khởi động
        try {
            const roamingStorage = path.join(
                process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
                'Antigravity', 'app_storage.json'
            );
            if (activeProfile && activeProfile.email && fs.existsSync(roamingStorage)) {
                const cur = JSON.parse(fs.readFileSync(roamingStorage, 'utf8'));
                cur['jetski.onboarding.lastLoginUsername'] = activeProfile.email;
                cur['jetski.onboarding.lastLoginIsGcpTos'] = false;
                fs.writeFileSync(roamingStorage, JSON.stringify(cur, null, 2), 'utf8');
            }
        } catch (e) {}

        // Chỉ truyền --user-data-dir nếu có thư mục riêng khác với thư mục mặc định
        const defaultRoamingDir = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Antigravity');
        if (activeProfile && activeProfile.userDataDir && activeProfile.userDataDir !== defaultRoamingDir) {
            if (!fs.existsSync(activeProfile.userDataDir)) {
                try { fs.mkdirSync(activeProfile.userDataDir, { recursive: true }); } catch (e) {}
            }
            args.push(`--user-data-dir=${activeProfile.userDataDir}`);
            console.log(`[AntigravityManager] Khởi động với profile '${activeProfile.name}' tại: ${activeProfile.userDataDir}`);
        }

        try {
            const child = spawn(this.appExePath, args, {
                detached: true,
                stdio: 'ignore'
            });
            child.unref();
            return {
                success: true,
                message: `Đã khởi động Antigravity với tài khoản '${activeProfile.name}'`,
                activeProfile
            };
        } catch (e) {
            return { success: false, message: 'Lỗi khi mở app: ' + e.message };
        }
    }

    /**
     * Tắt tất cả tiến trình Antigravity Desktop VÀ Language Server chạy ngầm
     */
    async stopApp() {
        return new Promise((resolve) => {
            const psCmd = `Stop-Process -Name Antigravity, language_server -Force -ErrorAction SilentlyContinue`;
            execFile('powershell.exe', ['-NoProfile', '-Command', psCmd], { timeout: 6000 }, (err) => {
                resolve({ success: true, message: 'Đã đóng Antigravity và Language Server thành công' });
            });
        });
    }

    /**
     * Khởi động lại Antigravity Desktop sạch sẽ (chờ giải phóng file lock)
     */
    async restartApp() {
        await this.stopApp();
        // Chờ 2.0s để toàn bộ socket, SQLite database và Chromium process giải phóng hoàn toàn
        await new Promise(r => setTimeout(r, 2000));
        return await this.startApp();
    }

    /**
     * Lấy danh sách các cuộc hội thoại gần đây của Antigravity
     */
    async listRecentConversations(limit = 15) {
        if (!fs.existsSync(this.conversationsDir)) {
            return [];
        }

        try {
            const files = fs.readdirSync(this.conversationsDir);
            const convos = [];

            for (const file of files) {
                if (file.endsWith('.db') && !file.includes('-shm') && !file.includes('-wal')) {
                    const id = file.replace('.db', '');
                    const fullPath = path.join(this.conversationsDir, file);
                    try {
                        const stat = fs.statSync(fullPath);
                        convos.push({
                            id,
                            fileName: file,
                            size: stat.size,
                            lastModified: stat.mtime
                        });
                    } catch (e) {}
                }
            }

            convos.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
            return convos.slice(0, limit);
        } catch (e) {
            console.error('[AntigravityManager] Lỗi đọc conversations:', e.message);
            return [];
        }
    }

    /**
     * Lấy danh sách models từ Language Server RPC
     */
    async getAvailableModelsRpc(port, csrfToken) {
        if (this._availableModelsCache && (Date.now() - (this._availableModelsCacheTime || 0) < 300000)) {
            return this._availableModelsCache;
        }
        return new Promise((resolve) => {
            const req = https.request({
                hostname: '127.0.0.1',
                port,
                path: '/exa.language_server_pb.LanguageServerService/GetAvailableModels',
                method: 'POST',
                rejectUnauthorized: false,
                headers: {
                    'Content-Type': 'application/json',
                    'x-codeium-csrf-token': csrfToken
                },
                timeout: 3000
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        const models = data?.response?.models || {};
                        this._availableModelsCache = models;
                        this._availableModelsCacheTime = Date.now();
                        resolve(models);
                    } catch (e) {
                        resolve({});
                    }
                });
            });
            req.on('error', () => resolve({}));
            req.on('timeout', () => resolve({}));
            req.write('{}');
            req.end();
        });
    }

    /**
     * Gọi RPC GetUserStatus để lấy hạn mức thật (Limit 5h, Weekly, Model Quotas, Credits)
     */
    async getUserStatusRpc(port, csrfToken) {
        return new Promise((resolve) => {
            const req = https.request({
                hostname: '127.0.0.1',
                port,
                path: '/exa.language_server_pb.LanguageServerService/GetUserStatus',
                method: 'POST',
                rejectUnauthorized: false,
                headers: {
                    'Content-Type': 'application/json',
                    'x-codeium-csrf-token': csrfToken
                },
                timeout: 3500
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        resolve(data?.userStatus || null);
                    } catch (e) {
                        resolve(null);
                    }
                });
            });
            req.on('error', () => resolve(null));
            req.on('timeout', () => resolve(null));
            req.write('{}');
            req.end();
        });
    }

    /**
     * Lấy danh sách models được hỗ trợ (ưu tiên Language Server RPC, fallback sang CLI hoặc list chuẩn)
     */
    async getAvailableModels() {
        try {
            const lsInfo = await this.getLanguageServerInfo();
            if (lsInfo && lsInfo.ports && lsInfo.csrfToken) {
                const port = await this.probeHttpsPort(lsInfo.ports, lsInfo.csrfToken);
                if (port) {
                    const rpcModels = await this.getAvailableModelsRpc(port, lsInfo.csrfToken);
                    const list = [];
                    for (const [id, m] of Object.entries(rpcModels)) {
                        if (m.displayName) {
                            list.push({ id, name: m.displayName });
                        }
                    }
                    if (list.length > 0) return list;
                }
            }
        } catch (e) {}

        if (fs.existsSync(this.cliExePath)) {
            const cliModels = await new Promise((resolve) => {
                execFile(this.cliExePath, ['models'], { timeout: 4000 }, (err, stdout) => {
                    if (err) return resolve([]);
                    const lines = stdout.trim().split('\n');
                    const models = [];
                    for (const line of lines) {
                        const parts = line.split('\t');
                        if (parts.length >= 2) {
                            models.push({ id: parts[0].trim(), name: parts[1].trim() });
                        } else if (line.trim()) {
                            models.push({ id: line.trim(), name: line.trim() });
                        }
                    }
                    resolve(models);
                });
            });
            if (cliModels.length > 0) return cliModels;
        }

        return DEFAULT_MODELS_FALLBACK;
    }

    /**
     * Phát hiện thông tin Language Server đang chạy ngầm của Antigravity Desktop
     */
    async getLanguageServerInfo() {
        if (this._cachedLsInfo && (Date.now() - this._lsInfoTime < 5000)) {
            return this._cachedLsInfo;
        }

        return new Promise((resolve) => {
            const psCmd = `Get-CimInstance Win32_Process -Filter "Name = 'language_server.exe'" | Select-Object ProcessId, CommandLine | ConvertTo-Json`;
            execFile('powershell.exe', ['-NoProfile', '-Command', psCmd], { timeout: 4000 }, (err, stdout) => {
                if (err || !stdout || !stdout.trim()) {
                    this._cachedLsInfo = null;
                    return resolve(null);
                }
                try {
                    const data = JSON.parse(stdout.trim());
                    const item = Array.isArray(data) ? data[0] : data;
                    if (!item || !item.CommandLine) {
                        this._cachedLsInfo = null;
                        return resolve(null);
                    }

                    const m = item.CommandLine.match(/--csrf_token\s+([a-f0-9\-]+)/);
                    const csrfToken = m ? m[1] : null;
                    const pid = item.ProcessId;

                    const portCmd = `Get-NetTCPConnection -State Listen | Where-Object { $_.OwningProcess -eq ${pid} } | Select-Object -ExpandProperty LocalPort`;
                    execFile('powershell.exe', ['-NoProfile', '-Command', portCmd], { timeout: 3000 }, (pErr, pStdout) => {
                        const ports = (pStdout || '').trim().split(/\s+/).map(p => parseInt(p, 10)).filter(Boolean);
                        this._cachedLsInfo = { pid, csrfToken, ports };
                        this._lsInfoTime = Date.now();
                        resolve(this._cachedLsInfo);
                    });
                } catch (e) {
                    this._cachedLsInfo = null;
                    resolve(null);
                }
            });
        });
    }

    /**
     * Dò tìm cổng HTTPS khả dụng của Language Server
     */
    async probeHttpsPort(ports, csrfToken) {
        if (!Array.isArray(ports) || ports.length === 0) return null;
        for (const port of ports) {
            try {
                const ok = await new Promise((resolve) => {
                    const req = https.request({
                        hostname: '127.0.0.1',
                        port,
                        path: '/',
                        method: 'GET',
                        rejectUnauthorized: false,
                        timeout: 800
                    }, (res) => {
                        resolve(res.statusCode === 200);
                    });
                    req.on('error', () => resolve(false));
                    req.on('timeout', () => resolve(false));
                    req.end();
                });
                if (ok) return port;
            } catch (e) {}
        }
        return null;
    }

    /**
     * Lấy ID phiên làm việc active nhất từ Language Server
     */
    async getActiveTrajectoryId(port, csrfToken) {
        return new Promise((resolve) => {
            const req = https.request({
                hostname: '127.0.0.1',
                port,
                path: '/exa.language_server_pb.LanguageServerService/GetAllCascadeTrajectories',
                method: 'POST',
                rejectUnauthorized: false,
                headers: {
                    'Content-Type': 'application/json',
                    'x-codeium-csrf-token': csrfToken
                },
                timeout: 2000
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        const summaries = data.trajectorySummaries;
                        if (!summaries || typeof summaries !== 'object') return resolve(null);
                        const keys = Object.keys(summaries);
                        if (keys.length === 0) return resolve(null);

                        // Ưu tiên session đang RUNNING
                        for (const k of keys) {
                            if (summaries[k].status === 'CASCADE_RUN_STATUS_RUNNING') {
                                return resolve(k);
                            }
                        }

                        // Sắp xếp theo lastModifiedTime mới nhất
                        keys.sort((a, b) => {
                            const timeA = new Date(summaries[a].lastModifiedTime || 0).getTime();
                            const timeB = new Date(summaries[b].lastModifiedTime || 0).getTime();
                            return timeB - timeA;
                        });
                        return resolve(keys[0]);
                    } catch (e) {
                        resolve(null);
                    }
                });
            });
            req.on('error', () => resolve(null));
            req.on('timeout', () => resolve(null));
            req.write('{}');
            req.end();
        });
    }

    /**
     * Xác định model enum hợp lệ cho Language Server (ví dụ MODEL_PLACEHOLDER_M318)
     */
    async resolveModelEnum(port, csrfToken, cascadeId, preferredModel = null) {
        // 1. Nếu người dùng chọn model từ UI (e.g. gemini-3.8-flash-high)
        if (preferredModel) {
            if (preferredModel.startsWith('MODEL_')) return preferredModel;
            const models = await this.getAvailableModelsRpc(port, csrfToken);
            if (models[preferredModel]?.model) {
                return models[preferredModel].model;
            }
            if (KNOWN_MODEL_MAP[preferredModel]) {
                return KNOWN_MODEL_MAP[preferredModel];
            }
        }

        // 2. Tra cứu model đã được sử dụng trong phiên cascade hiện tại
        if (cascadeId) {
            try {
                const traj = await new Promise((resolve) => {
                    const req = https.request({
                        hostname: '127.0.0.1',
                        port,
                        path: '/exa.language_server_pb.LanguageServerService/GetCascadeTrajectory',
                        method: 'POST',
                        rejectUnauthorized: false,
                        headers: {
                            'Content-Type': 'application/json',
                            'x-codeium-csrf-token': csrfToken
                        },
                        timeout: 3000
                    }, (res) => {
                        let body = '';
                        res.on('data', chunk => body += chunk);
                        res.on('end', () => {
                            try { resolve(JSON.parse(body)); } catch (e) { resolve(null); }
                        });
                    });
                    req.on('error', () => resolve(null));
                    req.on('timeout', () => resolve(null));
                    req.write(JSON.stringify({ cascadeId }));
                    req.end();
                });

                if (traj?.trajectory?.generatorMetadata?.length > 0) {
                    const last = traj.trajectory.generatorMetadata[traj.trajectory.generatorMetadata.length - 1];
                    const existingModel = last?.chatModel?.model || last?.customMetadata?.model_enum;
                    if (existingModel && existingModel.startsWith('MODEL_')) {
                        return existingModel;
                    }
                }
            } catch (e) {}
        }

        // 3. Fallback mặc định là Gemini 3.8 Flash High
        return 'MODEL_PLACEHOLDER_M318';
    }

    /**
     * Gửi tin nhắn thẳng vào phiên chạy của Antigravity Desktop qua Language Server RPC
     */
    async _sendViaLanguageServer(port, csrfToken, cascadeId, prompt, model = null) {
        const modelEnum = await this.resolveModelEnum(port, csrfToken, cascadeId, model);

        return new Promise((resolve) => {
            const postData = JSON.stringify({
                cascadeId,
                items: [{ text: prompt }],
                cascadeConfig: {
                    plannerConfig: {
                        requestedModel: {
                            model: modelEnum
                        },
                        planModel: modelEnum
                    }
                }
            });

            const req = https.request({
                hostname: '127.0.0.1',
                port,
                path: '/exa.language_server_pb.LanguageServerService/SendUserCascadeMessage',
                method: 'POST',
                rejectUnauthorized: false,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'x-codeium-csrf-token': csrfToken
                },
                timeout: 8000
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve({ success: true, body });
                    } else {
                        resolve({ success: false, statusCode: res.statusCode, body });
                    }
                });
            });

            req.on('error', (err) => resolve({ success: false, error: err.message }));
            req.on('timeout', () => resolve({ success: false, error: 'Request timeout' }));
            req.write(postData);
            req.end();
        });
    }

    /**
     * Khởi tạo phiên trò chuyện Cascade (trajectory) hoàn toàn mới trên Antigravity Language Server
     */
    async startNewCascadeTrajectory(port, csrfToken) {
        return new Promise((resolve) => {
            const postData = JSON.stringify({
                source: 'CORTEX_TRAJECTORY_SOURCE_CASCADE_CLIENT'
            });

            const req = https.request({
                hostname: '127.0.0.1',
                port,
                path: '/exa.language_server_pb.LanguageServerService/StartCascade',
                method: 'POST',
                rejectUnauthorized: false,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'x-codeium-csrf-token': csrfToken
                },
                timeout: 5000
            }, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        if (data && data.cascadeId) {
                            return resolve({ success: true, cascadeId: data.cascadeId });
                        }
                        resolve({ success: false, error: body });
                    } catch (err) {
                        resolve({ success: false, error: err.message });
                    }
                });
            });

            req.on('error', (err) => resolve({ success: false, error: err.message }));
            req.on('timeout', () => resolve({ success: false, error: 'Request timeout' }));
            req.write(postData);
            req.end();
        });
    }

    /**
     * Send live prompt to Antigravity (Adapter compatibility alias)
     */
    async sendLiveMessage(prompt, options = {}) {
        return this.sendUserPrompt(prompt, options.conversationId || null, options.model || null);
    }

    /**
     * Gửi câu lệnh prompt của người dùng - Ưu tiên trực tiếp vào Desktop App, fallback sang CLI
     */
    async sendUserPrompt(prompt, conversationId = null, model = null) {
        try {
            const lsInfo = await this.getLanguageServerInfo();
            if (lsInfo && lsInfo.ports && lsInfo.csrfToken) {
                const port = await this.probeHttpsPort(lsInfo.ports, lsInfo.csrfToken);
                if (port) {
                    let targetId = conversationId;
                    let isNewConversation = false;

                    // Nếu không có conversationId (người dùng bấm New Conversation), TẠO PHIÊN MỚI RIÊNG BIỆT!
                    if (!targetId) {
                        const startRes = await this.startNewCascadeTrajectory(port, lsInfo.csrfToken);
                        if (startRes.success && startRes.cascadeId) {
                            targetId = startRes.cascadeId;
                            isNewConversation = true;
                            console.log(`[AntigravityManager] Đã tạo phiên Cascade mới: ${targetId}`);
                        }
                    }

                    // Fallback nếu không tạo được mới: lấy phiên active
                    if (!targetId) {
                        targetId = await this.getActiveTrajectoryId(port, lsInfo.csrfToken);
                    }
                    if (!targetId) {
                        const latest = this._getLatestSessionDir();
                        if (latest) targetId = latest.id;
                    }

                    if (targetId) {
                        const result = await this._sendViaLanguageServer(port, lsInfo.csrfToken, targetId, prompt, model);
                        if (result.success) {
                            return {
                                success: true,
                                deliveredToApp: true,
                                isNewConversation,
                                conversationId: targetId,
                                message: isNewConversation ? 'Đã tạo cuộc trò chuyện mới thành công!' : 'Đã gửi trực tiếp vào phiên Antigravity Desktop!'
                            };
                        }
                        this._cachedLsInfo = null;
                    }
                }
            }
        } catch (e) {
            console.error('[AntigravityManager] Lỗi gửi qua Language Server:', e.message);
        }

        // Fallback sang agy.exe CLI
        return await this.executeQuickPrompt(prompt, model);
    }

    /**
     * Chạy prompt nhanh không tương tác bằng agy CLI
     */
    async executeQuickPrompt(prompt, model = null) {
        if (!fs.existsSync(this.cliExePath)) {
            return { success: false, message: 'Chưa cài đặt agy.exe trên máy' };
        }

        const args = ['-p', prompt];
        if (model) {
            args.push('--model', model);
        }

        return new Promise((resolve) => {
            execFile(this.cliExePath, args, { 
                timeout: 60000, 
                maxBuffer: 1024 * 1024 * 5,
                env: { ...process.env, ANTIGRAVITY_APP_DATA_DIR: 'antigravity' }
            }, (err, stdout, stderr) => {
                if (err) {
                    return resolve({
                        success: false,
                        error: err.message,
                        stderr: stderr ? stderr.trim() : ''
                    });
                }
                resolve({
                    success: true,
                    response: stdout.trim()
                });
            });
        });
    }

    /**
     * Lấy thư mục session Antigravity theo ID
     */
    _getSessionDirById(sessionId) {
        if (!sessionId || !fs.existsSync(this.brainDir)) return null;
        try {
            const directPath = path.join(this.brainDir, sessionId);
            const directTPath = path.join(directPath, '.system_generated', 'logs', 'transcript.jsonl');
            if (fs.existsSync(directTPath)) {
                const stat = fs.statSync(directTPath);
                return { id: sessionId, path: directPath, tPath: directTPath, mtime: stat.mtimeMs, size: stat.size };
            }

            const dirs = fs.readdirSync(this.brainDir);
            for (const d of dirs) {
                if (d === sessionId || d.startsWith(sessionId)) {
                    const p = path.join(this.brainDir, d);
                    const tPath = path.join(p, '.system_generated', 'logs', 'transcript.jsonl');
                    if (fs.existsSync(tPath)) {
                        const stat = fs.statSync(tPath);
                        return { id: d, path: p, tPath, mtime: stat.mtimeMs, size: stat.size };
                    }
                }
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Lấy thư mục session Antigravity gần nhất
     */
    _getLatestSessionDir() {
        if (!fs.existsSync(this.brainDir)) return null;
        try {
            const dirs = fs.readdirSync(this.brainDir)
                .map(d => {
                    const p = path.join(this.brainDir, d);
                    const tPath = path.join(p, '.system_generated', 'logs', 'transcript.jsonl');
                    try {
                        if (fs.existsSync(tPath)) {
                            const stat = fs.statSync(tPath);
                            return { id: d, path: p, tPath, mtime: stat.mtimeMs, size: stat.size };
                        }
                    } catch (e) {}
                    return null;
                })
                .filter(Boolean)
                .sort((a, b) => b.mtime - a.mtime);

            return dirs.length > 0 ? dirs[0] : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Lấy tiến trình live theo thời gian thực của session hiện tại ("Đang tới đâu")
     */
    async getCurrentSessionLiveProgress(targetSessionId = null) {
        let latest = null;
        if (targetSessionId) {
            latest = this._getSessionDirById(targetSessionId);
        }
        if (!latest) {
            latest = this._getLatestSessionDir();
        }
        if (!latest) {
            return {
                success: true,
                conversationId: null,
                currentStep: 0,
                statusText: '🟢 Antigravity Engine Ready',
                statusType: 'idle',
                lastAction: null,
                lastUserRequest: null,
                pendingInteraction: null,
                hasPlan: false,
                hasWalkthrough: false,
                updatedAt: new Date().toISOString()
            };
        }

        try {
            const transcriptPath = latest.tPath;
            const stat = { size: latest.size, mtimeMs: latest.mtime };

            // Đọc ngược tối đa 256KB cuối cùng
            const bufSize = Math.min(stat.size, 262144);
            const fd = fs.openSync(transcriptPath, 'r');
            const buf = Buffer.alloc(bufSize);
            fs.readSync(fd, buf, 0, bufSize, stat.size - bufSize);
            fs.closeSync(fd);

            const chunk = buf.toString('utf8');
            const lines = chunk.split('\n').filter(Boolean);

            let lastAction = null;
            let lastUserRequest = null;
            let currentStep = 0;
            let statusText = '🟢 Antigravity Engine Ready';
            let statusType = 'idle'; // 'idle', 'running', 'thinking', 'waiting_input', 'waiting_interactive_question', 'waiting_plan_approval'
            let pendingInteraction = null;
            let latestItem = null;

            // 1. Identify the latest valid event from the end of transcript
            for (let i = lines.length - 1; i >= 0; i--) {
                try {
                    const parsed = JSON.parse(lines[i]);
                    if (parsed && typeof parsed === 'object') {
                        latestItem = parsed;
                        break;
                    }
                } catch (e) {}
            }

            // 2. Evaluate current active state from the latest event
            if (latestItem) {
                if (latestItem.step_index !== undefined) {
                    currentStep = latestItem.step_index;
                }

                const now = Date.now();
                const mtimeMs = stat.mtimeMs || latest.mtime || 0;
                // If no event has been written for > 45 seconds, the session cannot be actively executing or thinking
                const isFresh = (now - mtimeMs) < 45000;

                if (latestItem.type === 'USER_INPUT' || latestItem.source === 'USER_EXPLICIT') {
                    if (isFresh) {
                        statusType = 'thinking';
                        statusText = 'Đang suy nghĩ & phân tích...';
                    } else {
                        statusType = 'idle';
                        statusText = '🟢 Antigravity Engine Ready';
                    }
                } else if (latestItem.type === 'PLANNER_RESPONSE') {
                    if (Array.isArray(latestItem.tool_calls) && latestItem.tool_calls.length > 0) {
                        const tc = latestItem.tool_calls[0];
                        const toolAction = tc.parameters?.toolAction || tc.args?.toolAction || tc.name;
                        const toolSummary = tc.parameters?.toolSummary || tc.args?.toolSummary || tc.name;

                        // Kiểm tra tương tác câu hỏi lựa chọn ask_question (/grill-me)
                        if (tc.name === 'ask_question') {
                            let rawQ = tc.args?.questions || tc.parameters?.questions;
                            if (typeof rawQ === 'string') {
                                try { rawQ = JSON.parse(rawQ); } catch (e) {}
                            }
                            if (Array.isArray(rawQ) && rawQ.length > 0) {
                                statusText = 'Đang chờ bạn trả lời câu hỏi lựa chọn (/grill-me)';
                                statusType = 'waiting_interactive_question';
                                pendingInteraction = {
                                    type: 'ask_question',
                                    stepIndex: latestItem.step_index,
                                    questions: rawQ
                                };
                            } else {
                                statusText = 'Đang chờ bạn trả lời câu hỏi';
                                statusType = 'waiting_interactive_question';
                            }
                        } else if (tc.name === 'write_to_file' && (tc.args?.TargetFile || tc.parameters?.TargetFile || '').toLowerCase().includes('implementation_plan.md')) {
                            let meta = tc.args?.ArtifactMetadata || tc.parameters?.ArtifactMetadata;
                            if (typeof meta === 'string') {
                                try { meta = JSON.parse(meta); } catch (e) {}
                            }
                            if (meta && meta.RequestFeedback) {
                                statusText = 'Đang chờ bạn duyệt kế hoạch (Proceed / Feedback)';
                                statusType = 'waiting_plan_approval';
                                pendingInteraction = {
                                    type: 'plan_approval',
                                    stepIndex: latestItem.step_index,
                                    summary: meta.Summary || 'Kế hoạch đã sẵn sàng để thực hiện.',
                                    requestFeedback: true
                                };
                            } else {
                                statusText = isFresh ? `Đang thực thi: ${toolAction || tc.name}` : '🟢 Antigravity Engine Ready';
                                statusType = isFresh ? 'running' : 'idle';
                            }
                        } else {
                            statusText = isFresh ? `Đang thực thi: ${toolAction || tc.name}` : '🟢 Antigravity Engine Ready';
                            statusType = isFresh ? 'running' : 'idle';
                        }
                    } else {
                        // The assistant delivered final text response without requesting any tools: turn completed!
                        statusType = 'idle';
                        statusText = '🟢 Antigravity Engine Ready';
                    }
                } else if (latestItem.type === 'GENERIC') {
                    // Tool output was returned. If fresh, agent is processing next reasoning/response
                    if (isFresh) {
                        statusType = 'thinking';
                        statusText = '🧠 Antigravity is thinking & analyzing...';
                    } else {
                        statusType = 'idle';
                        statusText = '🟢 Antigravity Engine Ready';
                    }
                } else {
                    statusType = 'idle';
                    statusText = '🟢 Antigravity Engine Ready';
                }
            }

            // 3. Scan backwards to extract lastAction and lastUserRequest for metadata
            for (let i = lines.length - 1; i >= 0; i--) {
                try {
                    const item = JSON.parse(lines[i]);
                    if (!currentStep && item.step_index !== undefined) {
                        currentStep = item.step_index;
                    }

                    if (!lastAction && Array.isArray(item.tool_calls) && item.tool_calls.length > 0) {
                        const tc = item.tool_calls[0];
                        lastAction = {
                            tool: tc.name,
                            action: tc.parameters?.toolAction || tc.args?.toolAction || tc.name,
                            summary: tc.parameters?.toolSummary || tc.args?.toolSummary || tc.name
                        };
                    }

                    if (!lastUserRequest && (item.type === 'USER_INPUT' || item.source === 'USER_EXPLICIT')) {
                        let txt = item.content || '';
                        const m = txt.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
                        if (m) txt = m[1];
                        txt = txt.replace(/<[^>]+>/g, '').trim();
                        if (txt) {
                            lastUserRequest = txt.substring(0, 280);
                        }
                    }

                    if (lastAction && lastUserRequest) break;
                } catch (e) {}
            }

            const planPath = path.join(latest.path, 'implementation_plan.md');
            const walkthroughPath = path.join(latest.path, 'walkthrough.md');

            return {
                success: true,
                conversationId: latest.id,
                currentStep,
                statusText,
                statusType,
                lastAction,
                lastUserRequest,
                pendingInteraction,
                hasPlan: fs.existsSync(planPath),
                hasWalkthrough: fs.existsSync(walkthroughPath),
                updatedAt: new Date(stat.mtimeMs).toISOString()
            };
        } catch (err) {
            return {
                success: false,
                error: err.message
            };
        }
    }

    /**
     * Lấy danh sách các session Antigravity gần đây kèm tiêu đề và số bước
     */
    async getDetailedSessions(limit = 12) {
        if (!fs.existsSync(this.brainDir)) return [];

        try {
            const dirs = fs.readdirSync(this.brainDir)
                .map(d => {
                    const p = path.join(this.brainDir, d);
                    const tPath = path.join(p, '.system_generated', 'logs', 'transcript.jsonl');
                    try {
                        if (fs.existsSync(tPath)) {
                            const stat = fs.statSync(tPath);
                            return { id: d, path: p, tPath, mtime: stat.mtimeMs, size: stat.size };
                        }
                    } catch (e) {}
                    return null;
                })
                .filter(Boolean)
                .sort((a, b) => b.mtime - a.mtime)
                .slice(0, limit);

            return dirs.map((d, index) => {
                let title = 'Phiên làm việc Antigravity';
                try {
                    // Đọc 4KB đầu để lấy title từ user input
                    const fd = fs.openSync(d.tPath, 'r');
                    const buf = Buffer.alloc(Math.min(d.size, 4096));
                    fs.readSync(fd, buf, 0, buf.length, 0);
                    fs.closeSync(fd);
                    const firstLines = buf.toString('utf8').split('\n');
                    for (const line of firstLines) {
                        if (!line.trim()) continue;
                        try {
                            const obj = JSON.parse(line);
                            if (obj.type === 'USER_INPUT' && obj.content) {
                                let t = obj.content;
                                const m = t.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
                                if (m) t = m[1];
                                t = t.replace(/<[^>]+>/g, '').trim();
                                if (t) {
                                    title = t.split('\n')[0].substring(0, 70);
                                    break;
                                }
                            }
                        } catch (e) {}
                    }
                } catch (e) {}

                return {
                    id: d.id,
                    title,
                    isCurrent: index === 0,
                    sizeMB: (d.size / (1024 * 1024)).toFixed(2),
                    updatedAt: new Date(d.mtime).toISOString()
                };
            });
        } catch (e) {
            console.error('[AntigravityManager] Lỗi đọc chi tiết sessions:', e.message);
            return [];
        }
    }

    /**
     * Lấy nội dung artifact (implementation_plan.md hoặc walkthrough.md)
     */
    async getArtifactContent(type = 'plan', conversationId = null) {
        let dirPath = null;
        if (conversationId) {
            dirPath = path.join(this.brainDir, conversationId);
        } else {
            const latest = this._getLatestSessionDir();
            if (latest) dirPath = latest.path;
        }

        if (!dirPath || !fs.existsSync(dirPath)) {
            return { success: false, message: 'Không tìm thấy session' };
        }

        const fileName = type === 'walkthrough' ? 'walkthrough.md' : 'implementation_plan.md';
        const targetPath = path.join(dirPath, fileName);

        if (!fs.existsSync(targetPath)) {
            return {
                success: false,
                exists: false,
                type,
                fileName,
                content: ''
            };
        }

        try {
            const content = fs.readFileSync(targetPath, 'utf8');
            return {
                success: true,
                exists: true,
                type,
                fileName,
                content
            };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    /**
     * Lấy thông tin Quota, Tier và Models thực tế (Limit 5h, Weekly, Model Quotas)
     */
    async getQuotaInfo() {
        const activeProfile = this._getAccountManager().getActiveAntigravityProfile();
        let models = await this.getAvailableModels();
        let userStatus = null;

        try {
            const lsInfo = await this.getLanguageServerInfo();
            if (lsInfo && lsInfo.ports && lsInfo.csrfToken) {
                const port = await this.probeHttpsPort(lsInfo.ports, lsInfo.csrfToken);
                if (port) {
                    userStatus = await this.getUserStatusRpc(port, lsInfo.csrfToken);
                }
            }
        } catch (e) {}

        const modelQuotas = [];
        let planTier = 'Tier Pro (Có giới hạn)';
        let planStatusText = 'Giới hạn 5h & tuần';
        let availablePromptCredits = 500;
        let availableFlowCredits = 100;

        if (userStatus) {
            if (userStatus.planStatus?.planName) {
                planTier = `Tier ${userStatus.planStatus.planName}`;
            }
            if (userStatus.planStatus?.availablePromptCredits !== undefined) {
                availablePromptCredits = userStatus.planStatus.availablePromptCredits;
            }
            if (userStatus.planStatus?.availableFlowCredits !== undefined) {
                availableFlowCredits = userStatus.planStatus.availableFlowCredits;
            }

            const configs = userStatus.cascadeModelConfigData?.clientModelConfigs || [];
            configs.forEach(m => {
                const fraction = m.quotaInfo?.remainingFraction ?? 1;
                const resetTime = m.quotaInfo?.resetTime || null;
                const resetMs = resetTime ? (new Date(resetTime) - Date.now()) : 0;
                const resetHours = resetMs > 0 ? (resetMs / 3600000).toFixed(1) : 0;
                let family = 'gemini';
                const lower = (m.label || '').toLowerCase();
                if (lower.includes('claude')) family = 'claude';
                else if (lower.includes('gpt') || lower.includes('o3') || lower.includes('luna')) family = 'gpt';

                modelQuotas.push({
                    label: m.label,
                    id: m.modelId,
                    family,
                    remainingFraction: fraction,
                    remainingPercent: Math.round(fraction * 100),
                    resetTime,
                    resetHours: Number(resetHours)
                });
            });
        }

        return {
            success: true,
            account: {
                id: activeProfile.id,
                name: activeProfile.name,
                email: (userStatus?.email) || activeProfile.email,
                hasSavedToken: !!activeProfile.credential,
                tier: planTier,
                status: planStatusText,
                promptCredits: availablePromptCredits,
                flowCredits: availableFlowCredits
            },
            limits: {
                rollingLimit: '5 giờ (Rolling 5h Window)',
                weeklyLimit: 'Hạn mức tuần (Weekly Quota Pool)'
            },
            modelQuotas,
            models,
            defaultModel: 'Gemini 3.8 Flash High',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Lấy toàn bộ tin nhắn chat hội thoại của một session cụ thể
     */
    async getSessionMessages(sessionId = null) {
        let dirPath = null;
        let convId = sessionId;

        if (sessionId) {
            dirPath = path.join(this.brainDir, sessionId);
        } else {
            const latest = this._getLatestSessionDir();
            if (latest) {
                dirPath = latest.path;
                convId = latest.id;
            }
        }

        if (!dirPath || !fs.existsSync(dirPath)) {
            return { success: false, message: 'Không tìm thấy session' };
        }

        const transcriptPath = path.join(dirPath, '.system_generated', 'logs', 'transcript.jsonl');
        if (!fs.existsSync(transcriptPath)) {
            return { success: false, message: 'Không có transcript cho session này' };
        }

        try {
            const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n').filter(Boolean);
            const messages = [];
            let currentAssistant = null;
            let title = 'Phiên làm việc';

            for (const line of lines) {
                try {
                    const j = JSON.parse(line);
                    if (j.type === 'USER_INPUT' && j.content) {
                        if (currentAssistant) {
                            messages.push(currentAssistant);
                            currentAssistant = null;
                        }
                        let txt = j.content;
                        const m = txt.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
                        if (m) txt = m[1];
                        txt = txt.replace(/<[^>]+>/g, '').trim();
                        if (txt) {
                            if (title === 'Phiên làm việc') {
                                title = this._cleanTitle(txt);
                            }
                            messages.push({
                                id: j.step_index,
                                role: 'user',
                                content: txt,
                                timestamp: j.created_at
                            });
                        }
                    } else if (j.type === 'PLANNER_RESPONSE') {
                        if (!currentAssistant) {
                            currentAssistant = {
                                id: j.step_index,
                                role: 'assistant',
                                content: '',
                                thinking: '',
                                thinkingDuration: null,
                                thinkingStartTime: j.created_at,
                                tools: [],
                                subagents: [],
                                interactiveQuestion: null,
                                planProposal: null,
                                timestamp: j.created_at
                            };
                        }
                        if (j.thinking && typeof j.thinking === 'string' && j.thinking.trim()) {
                            currentAssistant.thinking = (currentAssistant.thinking ? currentAssistant.thinking + '\n\n' : '') + j.thinking.trim();
                            // Calculate realistic thought duration based on content length or timestamp difference
                            if (currentAssistant.thinkingStartTime && j.created_at) {
                                const diffSec = Math.round((new Date(j.created_at) - new Date(currentAssistant.thinkingStartTime)) / 1000);
                                currentAssistant.thinkingDuration = Math.max(diffSec > 0 ? diffSec : 1, Math.min(60, Math.round(currentAssistant.thinking.length / 120)));
                            } else {
                                currentAssistant.thinkingDuration = Math.max(3, Math.min(30, Math.round(currentAssistant.thinking.length / 120)));
                            }
                        }
                        if (j.content && typeof j.content === 'string' && j.content.trim()) {
                            currentAssistant.content = (currentAssistant.content ? currentAssistant.content + '\n\n' : '') + j.content.trim();
                        }
                        if (j.tool_calls && j.tool_calls.length > 0) {
                            for (const tc of j.tool_calls) {
                                // 1. Bóc tách câu hỏi lựa chọn tương tác (ask_question / grill-me)
                                if (tc.name === 'ask_question') {
                                    let rawQ = tc.args?.questions || tc.parameters?.questions;
                                    if (typeof rawQ === 'string') {
                                        try { rawQ = JSON.parse(rawQ); } catch (e) {}
                                    }
                                    if (Array.isArray(rawQ) && rawQ.length > 0) {
                                        currentAssistant.interactiveQuestion = {
                                            stepIndex: j.step_index,
                                            questions: rawQ
                                        };
                                    }
                                }

                                // 2. Bóc tách kế hoạch triển khai (write_to_file implementation_plan.md / plan artifact)
                                if (tc.name === 'write_to_file') {
                                    const targetFile = tc.args?.TargetFile || tc.parameters?.TargetFile || '';
                                    if (targetFile.toLowerCase().includes('plan')) {
                                        let meta = tc.args?.ArtifactMetadata || tc.parameters?.ArtifactMetadata;
                                        if (typeof meta === 'string') {
                                            try { meta = JSON.parse(meta); } catch (e) {}
                                        }
                                        if (meta && meta.RequestFeedback) {
                                            currentAssistant.planProposal = {
                                                stepIndex: j.step_index,
                                                summary: meta.Summary || 'Kế hoạch triển khai chi tiết cho yêu cầu của bạn.',
                                                requestFeedback: true,
                                                targetFile
                                            };
                                        }
                                    }
                                }

                                // 3. Bóc tách subagents
                                if (tc.name === 'invoke_subagent') {
                                    let subList = tc.args?.Subagents || tc.parameters?.Subagents || [];
                                    if (Array.isArray(subList)) {
                                        subList.forEach(s => {
                                            currentAssistant.subagents.push({
                                                role: s.Role || s.role || 'Subagent',
                                                typeName: s.TypeName || s.typeName || 'subagent',
                                                prompt: (s.Prompt || s.prompt || '').substring(0, 160)
                                            });
                                        });
                                    }
                                }

                                currentAssistant.tools.push({
                                    name: tc.name,
                                    action: tc.parameters?.toolAction || tc.args?.toolAction || tc.name,
                                    summary: tc.parameters?.toolSummary || tc.args?.toolSummary || tc.name
                                });
                            }
                        }
                    }
                } catch (e) {}
            }

            if (currentAssistant) {
                messages.push(currentAssistant);
            }

            // Đánh dấu trạng thái còn chờ duyệt/chọn hay đã hoàn thành (isPending)
            for (let idx = 0; idx < messages.length; idx++) {
                const m = messages[idx];
                if (m.role === 'assistant') {
                    const hasSubsequentUserMsg = messages.slice(idx + 1).some(sub => sub.role === 'user');
                    if (m.interactiveQuestion) {
                        m.interactiveQuestion.isPending = !hasSubsequentUserMsg;
                    }
                    if (m.planProposal) {
                        m.planProposal.isPending = !hasSubsequentUserMsg;
                    }
                }
            }

            // Kiểm tra trạng thái đang chạy của session này
            const latest = this._getLatestSessionDir();
            const isLive = latest && latest.id === convId;

            return {
                success: true,
                sessionId: convId,
                title,
                workspace: 'c:',
                isLive,
                totalMessages: messages.length,
                messages
            };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    _cleanTitle(raw) {
        if (!raw) return 'Phiên làm việc';
        let t = raw.trim();
        const lower = t.toLowerCase();
        if (lower.includes('eni persona setup') || t.startsWith('/eni-persona')) return 'Eni Persona Setup';
        if (lower.includes('eni persona activation') || lower.includes('activating eni persona')) return 'Eni Persona Activation';
        if (lower.includes('eni person') || t.startsWith('/eni-person')) return 'Eni Person Command';
        if (t.startsWith('/goal')) return 'Goal: ' + t.replace('/goal', '').trim().substring(0, 30);
        t = t.replace(/^\/[a-zA-Z0-9_-]+\s*/, '');
        return t.split('\n')[0].substring(0, 45) || 'Phiên làm việc';
    }

    _formatTimeShort(date) {
        const sec = Math.floor((new Date() - date) / 1000);
        if (sec < 60) return 'vừa xong';
        if (sec < 3600) return Math.floor(sec / 60) + 'm';
        if (sec < 86400) return Math.floor(sec / 3600) + 'h';
        if (sec < 2592000) return Math.floor(sec / 86400) + 'd';
        return Math.floor(sec / 2592000) + 'mo';
    }

    /**
     * Lấy danh sách session chuẩn theo cấu trúc Sidebar Desktop (Pinned & Projects/Recent)
     */
    async getSidebarSessions() {
        if (!fs.existsSync(this.brainDir)) return { pinned: [], recent: [] };

        try {
            const dirs = fs.readdirSync(this.brainDir)
                .map(d => {
                    const p = path.join(this.brainDir, d);
                    const tPath = path.join(p, '.system_generated', 'logs', 'transcript.jsonl');
                    try {
                        if (fs.existsSync(tPath)) {
                            const stat = fs.statSync(tPath);
                            return { id: d, path: p, tPath, mtime: stat.mtimeMs, size: stat.size };
                        }
                    } catch (e) {}
                    return null;
                })
                .filter(Boolean)
                .sort((a, b) => b.mtime - a.mtime);

            const allSessions = dirs.map((d, index) => {
                let title = 'Phiên làm việc';
                let rawPrompt = '';
                let contentSnippet = '';
                try {
                    const fd = fs.openSync(d.tPath, 'r');
                    const readLen = Math.min(d.size, 16384);
                    const buf = Buffer.alloc(readLen);
                    fs.readSync(fd, buf, 0, buf.length, 0);
                    fs.closeSync(fd);
                    contentSnippet = buf.toString('utf8');
                    const firstLines = contentSnippet.split('\n');
                    for (const line of firstLines) {
                        if (!line.trim()) continue;
                        try {
                            const obj = JSON.parse(line);
                            if (obj.type === 'USER_INPUT' && obj.content) {
                                let t = obj.content;
                                const m = t.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
                                if (m) t = m[1];
                                t = t.replace(/<[^>]+>/g, '').trim();
                                if (t) {
                                    rawPrompt = t;
                                    title = this._cleanTitle(t);
                                    break;
                                }
                            }
                        } catch (e) {}
                    }
                } catch (e) {}

                let folder = 'c:';
                const lower = (contentSnippet + ' ' + rawPrompt + ' ' + title).toLowerCase();
                if (lower.includes('aura') || d.id === 'c0623a67-69e2-4df8-98f7-04b369f84829') folder = 'AURA';
                else if (lower.includes('forge') || lower.includes('minecraft')) folder = 'forge-1.20.1-47.4.2';
                else if (lower.includes('terminal control')) folder = 'Terminal control';

                return {
                    id: d.id,
                    title,
                    folder,
                    isCurrent: index === 0,
                    timeAgo: this._formatTimeShort(new Date(d.mtime)),
                    updatedAt: new Date(d.mtime).toISOString()
                };
            });

            const pinned = allSessions.slice(0, 3);
            const recent = allSessions.slice(3, 30);

            return {
                success: true,
                pinned,
                recent,
                total: allSessions.length
            };
        } catch (e) {
            console.error('[AntigravityManager] Lỗi getSidebarSessions:', e.message);
            return { success: false, pinned: [], recent: [] };
        }
    }
}

module.exports = new AntigravityManager();
