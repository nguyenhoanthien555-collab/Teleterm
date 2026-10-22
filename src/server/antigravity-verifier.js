const fs = require('fs');
const path = require('path');
const os = require('os');
const WebSocket = require('ws');
const credentialManager = require('./credential-manager');

class AntigravityVerifier {
    constructor() {
        this.activePortFile = path.join(
            process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
            'Antigravity', 'DevToolsActivePort'
        );
        this.isVerifying = false;
        this.activeWatcher = null;
        this.activeClicker = null;
        this.activeSniffer = null;
        this.activeUrlPoller = null;
        this.wrongAccountRetries = 0;
        this.maxWrongAccountRetries = 3;
    }

    /**
     * Lấy port CDP từ DevToolsActivePort ở %APPDATA%\Antigravity
     */
    getCdpPort() {
        const paths = [
            this.activePortFile,
            path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Programs', 'antigravity', 'DevToolsActivePort')
        ];

        for (const p of paths) {
            try {
                if (fs.existsSync(p)) {
                    const content = fs.readFileSync(p, 'utf8').trim();
                    const lines = content.split('\n');
                    const port = parseInt(lines[0].trim(), 10);
                    if (!isNaN(port) && port > 0) return port;
                }
            } catch (e) {}
        }
        return null;
    }

    /**
     * Tìm target WebSocket URL của cửa sổ Antigravity
     */
    async getPageDebuggerUrl(port) {
        try {
            const res = await fetch(`http://127.0.0.1:${port}/json`);
            const targets = await res.json();
            const page = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
            return page ? page.webSocketDebuggerUrl : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Tự động phát hiện màn hình đăng nhập, hook OAuth URL và bấm "Continue with Google"
     */
    async autoClickContinueWithGoogle(targetEmail) {
        const port = this.getCdpPort();
        if (!port) return { clicked: false, notFound: true, message: 'Chưa thấy DevToolsActivePort' };

        const wsUrl = await this.getPageDebuggerUrl(port);
        if (!wsUrl) return { clicked: false, notFound: true, message: 'Chưa thấy page target' };

        return new Promise((resolve) => {
            let resolved = false;
            let ws = null;
            const timer = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    try { if (ws) ws.close(); } catch(e){}
                    resolve({ clicked: false, timeout: true });
                }
            }, 3000);

            try {
                ws = new WebSocket(wsUrl);

                ws.on('open', () => {
                    const evalCode = `
                        (() => {
                            const email = ${JSON.stringify(targetEmail)};
                            
                            // 1. Hook electronNative.openExternal — bắt MỌI URL accounts.google.com
                            try {
                                if (window.electronNative && !window.__native_open_hooked) {
                                    window.__native_open_hooked = true;
                                    const origNativeOpen = window.electronNative.openExternal;
                                    window.electronNative.openExternal = function(url, ...args) {
                                        if (url && typeof url === 'string') {
                                            window.__teleterm_oauth_url = url;
                                            window.__teleterm_oauth_url_time = Date.now();
                                            // Bắt MỌI URL Google (accounts, oauth, signin, ...)
                                            if (url.includes('accounts.google.com')) {
                                                if (!url.includes('login_hint=') && email) {
                                                    const sep = url.includes('?') ? '&' : '?';
                                                    url += sep + 'login_hint=' + encodeURIComponent(email);
                                                }
                                            }
                                        }
                                        return origNativeOpen.call(this, url, ...args);
                                    };
                                }
                            } catch(e) {}

                            // 2. Hook window.open tương tự
                            try {
                                if (!window.__oauth_hint_hooked) {
                                    window.__oauth_hint_hooked = true;
                                    const origOpen = window.open;
                                    window.open = function(url, ...args) {
                                        if (url && typeof url === 'string') {
                                            window.__teleterm_oauth_url = url;
                                            window.__teleterm_oauth_url_time = Date.now();
                                            if (url.includes('accounts.google.com')) {
                                                if (!url.includes('login_hint=') && email) {
                                                    const sep = url.includes('?') ? '&' : '?';
                                                    url += sep + 'login_hint=' + encodeURIComponent(email);
                                                }
                                            }
                                        }
                                        return origOpen.call(this, url, ...args);
                                    };
                                }
                            } catch(e) {}

                            // 3. Tìm nút Continue with Google
                            const elements = Array.from(document.querySelectorAll('button, div[role="button"], a[role="button"]'));
                            const btn = elements.find(b => {
                                const txt = (b.innerText || '').toLowerCase();
                                const title = (b.title || '').toLowerCase();
                                const aria = (b.getAttribute('aria-label') || '').toLowerCase();
                                return txt.includes('continue with google') || title.includes('continue with google') || aria.includes('continue with google');
                            });

                            if (btn) {
                                const title = (btn.title || '').toLowerCase();
                                const txt = (btn.innerText || '').toLowerCase();
                                
                                if (title.includes('awaiting') || txt.includes('awaiting')) {
                                    return { clicked: false, state: 'awaiting', oauthUrl: window.__teleterm_oauth_url || null };
                                }
                                if (title.includes('success') || txt.includes('success')) {
                                    return { clicked: false, state: 'success', oauthUrl: null };
                                }

                                if (!btn.disabled) {
                                    btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
                                    btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
                                    btn.click();
                                    return { clicked: true, state: 'clicked', title: btn.title || btn.innerText, oauthUrl: window.__teleterm_oauth_url || null };
                                }
                                return { clicked: false, state: 'disabled', oauthUrl: window.__teleterm_oauth_url || null };
                            }

                            // Kiểm tra xem đã vào không gian làm việc workspace chưa
                            const hasWorkspace = !!(
                                document.querySelector('.monaco-workbench') ||
                                document.querySelector('#workbench\\\\.main\\\\.container') ||
                                document.querySelector('.conversation-container')
                            );

                            return {
                                clicked: false,
                                notFound: true,
                                isWorkspace: hasWorkspace,
                                oauthUrl: window.__teleterm_oauth_url || null
                            };
                        })()
                    `;

                    ws.send(JSON.stringify({
                        id: 201,
                        method: 'Runtime.evaluate',
                        params: { expression: evalCode, returnByValue: true }
                    }));
                });

                ws.on('message', (data) => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timer);
                        try {
                            const parsed = JSON.parse(data.toString());
                            const val = parsed.result?.result?.value || { clicked: false };
                            ws.close();
                            resolve(val);
                        } catch (e) {
                            try { ws.close(); } catch(err){}
                            resolve({ clicked: false, error: e.message });
                        }
                    }
                });

                ws.on('error', (err) => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timer);
                        resolve({ clicked: false, error: err.message });
                    }
                });
            } catch (err) {
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timer);
                    resolve({ clicked: false, error: err.message });
                }
            }
        });
    }

    /**
     * Đọc lại OAuth URL đã capture từ CDP hook (sau khi đã click)
     */
    async readCapturedOAuthUrl() {
        const port = this.getCdpPort();
        if (!port) return null;
        const wsUrl = await this.getPageDebuggerUrl(port);
        if (!wsUrl) return null;

        return new Promise((resolve) => {
            let resolved = false;
            let ws = null;
            const timer = setTimeout(() => {
                if (!resolved) { resolved = true; try { ws?.close(); } catch(e){} resolve(null); }
            }, 2000);

            try {
                ws = new WebSocket(wsUrl);
                ws.on('open', () => {
                    ws.send(JSON.stringify({
                        id: 301,
                        method: 'Runtime.evaluate',
                        params: {
                            expression: `JSON.stringify({ url: window.__teleterm_oauth_url || null, time: window.__teleterm_oauth_url_time || 0 })`,
                            returnByValue: true
                        }
                    }));
                });
                ws.on('message', (data) => {
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timer);
                        try {
                            const parsed = JSON.parse(data.toString());
                            const val = parsed.result?.result?.value;
                            ws.close();
                            if (val) {
                                const obj = JSON.parse(val);
                                resolve(obj.url);
                            } else {
                                resolve(null);
                            }
                        } catch(e) {
                            try { ws.close(); } catch(err){}
                            resolve(null);
                        }
                    }
                });
                ws.on('error', () => { if (!resolved) { resolved = true; clearTimeout(timer); resolve(null); } });
            } catch(e) {
                if (!resolved) { resolved = true; clearTimeout(timer); resolve(null); }
            }
        });
    }

    /**
     * Bổ sung login_hint và authuser vào Google OAuth URL để tự động vượt qua màn hình Account Chooser
     */
    injectAccountHint(rawUrl, targetEmail) {
        const GOOGLE_AUTHUSER_MAP = {
            'nguyenhoanthien555@gmail.com': 0,
            'quietemberr275@gmail.com': 1,
            'nguyensonttag@gmail.com': 2,
            'detuhthien@gmail.com': 3
        };

        try {
            const u = new URL(rawUrl);
            const emailLower = (targetEmail || '').toLowerCase().trim();
            const authUserIndex = GOOGLE_AUTHUSER_MAP[emailLower];

            u.searchParams.set('login_hint', emailLower);
            u.searchParams.set('Email', emailLower);

            if (typeof authUserIndex === 'number') {
                u.searchParams.set('authuser', String(authUserIndex));
            } else {
                u.searchParams.delete('authuser');
            }

            // Nếu URL chứa prompt=select_account thì đổi thành consent để Google không ép hiện Account Chooser
            if (u.searchParams.get('prompt') === 'select_account') {
                u.searchParams.set('prompt', 'consent');
            }

            let cont = u.searchParams.get('continue');
            if (cont) {
                if (typeof authUserIndex === 'number') {
                    cont = cont.replace(/authuser=unknown/g, 'authuser=' + authUserIndex);
                    cont = cont.replace(/authuser=[0-9]+/g, 'authuser=' + authUserIndex);
                }
                u.searchParams.set('continue', cont);
            }
            return u.toString();
        } catch (e) {
            const sep = rawUrl.includes('?') ? '&' : '?';
            return `${rawUrl}${sep}login_hint=${encodeURIComponent(targetEmail)}&Email=${encodeURIComponent(targetEmail)}`;
        }
    }

    /**
     * Mở URL đã inject login_hint vào trình duyệt
     */
    _openUrlInBrowser(url) {
        const { exec } = require('child_process');
        exec(`start "" "${url}"`, (err) => {
            if (err) console.error('[AutoVerifier] Lỗi mở URL:', err.message);
            else console.log('[AutoVerifier] ✓ Đã mở URL với login_hint trong trình duyệt!');
        });
    }

    /**
     * Quét và trích xuất OAuth URL Antigravity từ file trình duyệt (Opera GX, Edge, Chrome)
     * Ưu tiên 1: Đọc SQLite History qua get-oauth-url.py (chính xác 100%, không bị lock EBUSY)
     * Ưu tiên 2: Quét thư mục Sessions (fallback)
     */
    getLatestOAuthUrlFromBrowsers(maxAgeSeconds = 180) {
        // 1. Đọc từ browser History qua python sqlite helper (100% tin cậy, không bị EBUSY)
        try {
            const pyScript = path.join(__dirname, 'get-oauth-url.py');
            if (fs.existsSync(pyScript)) {
                const { execSync } = require('child_process');
                const out = execSync(`python "${pyScript}" ${maxAgeSeconds}`, {
                    encoding: 'utf8',
                    timeout: 2500,
                    windowsHide: true,
                    stdio: ['pipe', 'pipe', 'ignore']
                }).trim();
                if (out && out.includes('accounts.google.com')) {
                    return out;
                }
            }
        } catch (e) {}

        // 2. Fallback quét file sessions
        const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
        const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');

        const browserProfiles = [
            path.join(appData, 'Opera Software', 'Opera GX Stable', 'Default'),
            path.join(localAppData, 'Microsoft', 'Edge', 'User Data', 'Default'),
            path.join(localAppData, 'Google', 'Chrome', 'User Data', 'Default')
        ];

        const patterns = [
            /https:\/\/accounts\.google\.com\/[^\s"'<>\x00-\x1f]+1071006060591[^\s"'<>\x00-\x1f]*/g,
            /https:\/\/accounts\.google\.com\/v3\/signin\/accountchooser[^\s"'<>\x00-\x1f]*/g,
            /https:\/\/accounts\.google\.com\/o\/oauth2\/[^\s"'<>\x00-\x1f]*/g,
        ];

        for (const profileDir of browserProfiles) {
            if (!fs.existsSync(profileDir)) continue;

            // Các nguồn file cần quét (ưu tiên theo thứ tự)
            const scanTargets = [];

            // 1. Thư mục Sessions/ (nhiều file)
            const sessionsDir = path.join(profileDir, 'Sessions');
            if (fs.existsSync(sessionsDir)) {
                try {
                    const sessionFiles = fs.readdirSync(sessionsDir)
                        .map(f => {
                            const full = path.join(sessionsDir, f);
                            try { return { full, mtime: fs.statSync(full).mtimeMs }; }
                            catch(e) { return null; }
                        })
                        .filter(Boolean)
                        .sort((a, b) => b.mtime - a.mtime);
                    scanTargets.push(...sessionFiles);
                } catch(e) {}
            }

            // 2. Các file đơn lẻ (Current Session, Current Tabs, Last Session, Last Tabs)
            for (const singleFile of ['Current Session', 'Current Tabs', 'Last Session', 'Last Tabs']) {
                const full = path.join(profileDir, singleFile);
                try {
                    if (fs.existsSync(full)) {
                        scanTargets.push({ full, mtime: fs.statSync(full).mtimeMs });
                    }
                } catch(e) {}
            }

            // Sắp xếp lại theo thời gian mới nhất
            scanTargets.sort((a, b) => b.mtime - a.mtime);

            for (const file of scanTargets) {
                // Bỏ qua file quá cũ (> 5 phút)
                if (Date.now() - file.mtime > 300000) continue;

                try {
                    const buf = fs.readFileSync(file.full);
                    const str = buf.toString('latin1');

                    // Thử từng regex pattern theo thứ tự ưu tiên
                    for (const re of patterns) {
                        re.lastIndex = 0; // Reset regex state
                        const matches = str.match(re);
                        if (matches && matches.length > 0) {
                            return matches[matches.length - 1]; // Lấy URL cuối cùng (mới nhất)
                        }
                    }
                } catch(e) {}
            }
        }
        return null;
    }

    /**
     * Tự động bắt OAuth URL và re-launch với login_hint để Google tự chọn tài khoản
     * Chạy mỗi 500ms (nhanh gấp đôi bản cũ) trong 60 giây
     */
    startOAuthSessionSniffer(targetEmail, onProgress) {
        if (this.activeSniffer) {
            clearInterval(this.activeSniffer);
            this.activeSniffer = null;
        }

        const handledUrls = new Set();
        let snifferAttempts = 0;
        const maxSnifferAttempts = 120; // 120 x 500ms = 60 giây

        this.activeSniffer = setInterval(() => {
            if (!this.isVerifying) {
                if (this.activeSniffer) clearInterval(this.activeSniffer);
                return;
            }

            snifferAttempts++;
            if (snifferAttempts > maxSnifferAttempts) {
                if (this.activeSniffer) clearInterval(this.activeSniffer);
                console.log('[AutoVerifier] Session sniffer hết thời gian (60s)');
                return;
            }

            try {
                const rawUrl = this.getLatestOAuthUrlFromBrowsers();
                if (rawUrl && !handledUrls.has(rawUrl)) {
                    // Kiểm tra URL chưa có login_hint cho đúng email
                    const hasCorrectHint =
                        rawUrl.includes('login_hint=' + encodeURIComponent(targetEmail)) ||
                        rawUrl.includes('login_hint=' + targetEmail);

                    if (!hasCorrectHint) {
                        handledUrls.add(rawUrl);
                        const rewrittenUrl = this.injectAccountHint(rawUrl, targetEmail);
                        console.log(`[AutoVerifier] 🎯 Bắt được OAuth URL từ browser sessions! Re-launching với login_hint=${targetEmail}`);
                        if (onProgress) {
                            onProgress({
                                status: 'bypassing_account_chooser',
                                message: `Đang tự động chọn tài khoản ${targetEmail} trên trình duyệt...`,
                                email: targetEmail,
                                oauthUrl: rewrittenUrl
                            });
                        }
                        this._openUrlInBrowser(rewrittenUrl);
                    }
                }
            } catch (e) {
                console.error('[AutoVerifier] Lỗi OAuth Sniffer:', e.message);
            }
        }, 500);
    }

    /**
     * Sau khi CDP click "Continue with Google", đợi 2s rồi đọc lại OAuth URL
     * đã bị hook capture, inject login_hint rồi mở lại
     */
    startOAuthUrlPoller(targetEmail, onProgress) {
        if (this.activeUrlPoller) {
            clearTimeout(this.activeUrlPoller);
            this.activeUrlPoller = null;
        }

        // Đợi 2s cho hook kịp capture URL từ openExternal
        this.activeUrlPoller = setTimeout(async () => {
            if (!this.isVerifying) return;

            try {
                const capturedUrl = await this.readCapturedOAuthUrl();
                if (capturedUrl && capturedUrl.includes('accounts.google.com')) {
                    const hasCorrectHint =
                        capturedUrl.includes('login_hint=' + encodeURIComponent(targetEmail)) ||
                        capturedUrl.includes('login_hint=' + targetEmail);

                    if (!hasCorrectHint) {
                        const fixedUrl = this.injectAccountHint(capturedUrl, targetEmail);
                        console.log(`[AutoVerifier] 🔄 Đọc được OAuth URL từ CDP hook! Re-opening với login_hint=${targetEmail}`);
                        if (onProgress) {
                            onProgress({
                                status: 'bypassing_account_chooser',
                                message: `Đang bypass Account Chooser cho ${targetEmail}...`,
                                email: targetEmail
                            });
                        }
                        this._openUrlInBrowser(fixedUrl);
                    } else {
                        console.log('[AutoVerifier] ✓ CDP hook đã inject login_hint thành công, không cần re-open.');
                    }
                } else {
                    console.log('[AutoVerifier] CDP hook chưa capture OAuth URL, đang dùng Session Sniffer backup...');
                }
            } catch(e) {
                console.error('[AutoVerifier] Lỗi đọc captured URL:', e.message);
            }
        }, 2500);
    }

    /**
     * Bắt đầu tiến trình tự động xác minh và chờ hoàn tất token
     * @param {string} targetEmail Email cần xác thực
     * @param {Function} onProgress Callback cập nhật tiến độ
     */
    async startAutoVerification(targetEmail, onProgress = null) {
        if (this.isVerifying) {
            console.log('[AutoVerifier] Tiến trình xác thực đang chạy rồi...');
            return;
        }

        this.isVerifying = true;
        this.wrongAccountRetries = 0;
        console.log(`[AutoVerifier] 🚀 Bắt đầu tự động xác minh cho tài khoản: ${targetEmail}`);
        if (onProgress) {
            onProgress({
                status: 'starting',
                message: `Đang kết nối Antigravity để tự động xác minh ${targetEmail}...`,
                email: targetEmail
            });
        }

        // ═══════════════════════════════════════════════
        // BƯỚC 1: Kích hoạt Session Sniffer TRƯỚC (backup)
        // ═══════════════════════════════════════════════
        this.startOAuthSessionSniffer(targetEmail, onProgress);

        // ═══════════════════════════════════════════════
        // BƯỚC 2: Auto-click "Continue with Google" + CDP URL poller
        // ═══════════════════════════════════════════════
        let hasClicked = false;
        let clickAttempts = 0;
        const maxClickAttempts = 30; // 30 x 1s = 30 giây

        this.activeClicker = setInterval(async () => {
            if (!this.isVerifying || hasClicked) {
                if (this.activeClicker) clearInterval(this.activeClicker);
                return;
            }

            clickAttempts++;
            if (clickAttempts > maxClickAttempts) {
                if (this.activeClicker) clearInterval(this.activeClicker);
                console.log('[AutoVerifier] Hết thời gian chờ nút Continue with Google (30s)');
                return;
            }

            try {
                const res = await this.autoClickContinueWithGoogle(targetEmail);
                if (res.clicked) {
                    hasClicked = true;
                    if (this.activeClicker) clearInterval(this.activeClicker);
                    console.log(`[AutoVerifier] ✓ Đã click 'Continue with Google' cho ${targetEmail}!`);

                    if (onProgress) {
                        onProgress({
                            status: 'authenticating',
                            message: `Đã bấm "Continue with Google". Đang mở trình duyệt xác thực...`,
                            email: targetEmail,
                            oauthUrl: res.oauthUrl
                        });
                    }

                    // ════ QUAN TRỌNG ════
                    // Nếu CDP hook đã capture OAuth URL → inject login_hint và re-open
                    // Nếu chưa (hook chưa kịp) → Session Sniffer sẽ bắt từ browser files
                    if (res.oauthUrl && res.oauthUrl.includes('accounts.google.com')) {
                        const hasHint = res.oauthUrl.includes('login_hint=' + encodeURIComponent(targetEmail))
                            || res.oauthUrl.includes('login_hint=' + targetEmail);
                        if (!hasHint) {
                            // Hook chưa có login_hint → bypass bằng cách mở lại URL có hint
                            const fixedUrl = this.injectAccountHint(res.oauthUrl, targetEmail);
                            console.log(`[AutoVerifier] 🔄 Re-opening OAuth URL với login_hint...`);
                            this._openUrlInBrowser(fixedUrl);
                        }
                    } else {
                        // Hook chưa capture URL ngay → đợi 2.5s rồi đọc lại
                        this.startOAuthUrlPoller(targetEmail, onProgress);
                    }

                } else if (res.state === 'awaiting') {
                    if (onProgress) {
                        onProgress({
                            status: 'authenticating',
                            message: `Đang chờ hoàn tất xác nhận Google...`,
                            email: targetEmail,
                            oauthUrl: res.oauthUrl
                        });
                    }
                } else if (res.isWorkspace) {
                    // Đã vào workspace → xác thực thành công rồi
                    hasClicked = true;
                    if (this.activeClicker) clearInterval(this.activeClicker);
                    console.log('[AutoVerifier] ✓ Antigravity đã vào workspace!');
                }
            } catch (e) {
                console.error('[AutoVerifier] Lỗi autoClick:', e.message);
            }
        }, 1000);

        // ═══════════════════════════════════════════════
        // BƯỚC 3: Theo dõi Windows Credential Manager — chờ token đúng email
        // ═══════════════════════════════════════════════
        const startTime = Date.now();
        const timeoutMs = 300000; // 5 phút

        const checkInterval = setInterval(() => {
            if (!this.isVerifying) {
                clearInterval(checkInterval);
                return;
            }

            if (Date.now() - startTime > timeoutMs) {
                console.log('[AutoVerifier] Hết thời gian chờ xác thực (5 phút)');
                if (onProgress) {
                    onProgress({
                        status: 'timeout',
                        message: 'Hết thời gian chờ xác thực tài khoản (5 phút). Vui lòng thử lại.',
                        email: targetEmail
                    });
                }
                this.stop();
                clearInterval(checkInterval);
                return;
            }

            try {
                const cred = credentialManager.readAntigravityCredential();
                if (cred.success && cred.email) {
                    const accountManager = require('./account-manager');
                    accountManager.syncCurrentCredential(); // Luôn lưu token mới vào profiles

                    if (cred.email.toLowerCase() === targetEmail.toLowerCase()) {
                        // ═══ THÀNH CÔNG ═══
                        console.log(`[AutoVerifier] 🎉 XÁC MINH THÀNH CÔNG CHO ${targetEmail}!`);
                        if (onProgress) {
                            onProgress({
                                status: 'success',
                                message: `✓ Đã tự động xác minh và lưu Token cho ${targetEmail}!`,
                                email: cred.email
                            });
                        }
                        this.stop();
                        clearInterval(checkInterval);

                    } else if (this.wrongAccountRetries < this.maxWrongAccountRetries) {
                        // ═══ SAI TÀI KHOẢN — tự động retry ═══
                        this.wrongAccountRetries++;
                        console.log(`[AutoVerifier] ⚠️ Credential hiện tại là '${cred.email}' nhưng cần '${targetEmail}'. Retry ${this.wrongAccountRetries}/${this.maxWrongAccountRetries}...`);

                        if (onProgress) {
                            onProgress({
                                status: 'wrong_account',
                                message: `Phát hiện sai tài khoản (${cred.email}). Đang tự động thử lại cho ${targetEmail}... (lần ${this.wrongAccountRetries})`,
                                email: targetEmail,
                                wrongEmail: cred.email
                            });
                        }

                        // Lưu token sai acc vào profiles (để không mất), rồi xóa credential
                        try {
                            credentialManager.deleteAntigravityCredential();
                            console.log(`[AutoVerifier] Đã xóa credential sai. Đang restart Antigravity...`);
                        } catch(e) {}

                        // Restart Antigravity để thử lại
                        try {
                            const antigravityManager = require('./antigravity-manager');
                            antigravityManager.restartApp().then(() => {
                                console.log('[AutoVerifier] Antigravity đã restart. Sniffer + Clicker đang chạy lại...');
                                // Reset clicker
                                hasClicked = false;
                                clickAttempts = 0;
                                if (this.activeClicker) clearInterval(this.activeClicker);
                                this.activeClicker = setInterval(async () => {
                                    if (!this.isVerifying || hasClicked) {
                                        if (this.activeClicker) clearInterval(this.activeClicker);
                                        return;
                                    }
                                    clickAttempts++;
                                    if (clickAttempts > maxClickAttempts) {
                                        if (this.activeClicker) clearInterval(this.activeClicker);
                                        return;
                                    }
                                    try {
                                        const res2 = await this.autoClickContinueWithGoogle(targetEmail);
                                        if (res2.clicked) {
                                            hasClicked = true;
                                            if (this.activeClicker) clearInterval(this.activeClicker);
                                            console.log(`[AutoVerifier] ✓ Retry click 'Continue with Google' thành công!`);
                                            if (res2.oauthUrl && res2.oauthUrl.includes('accounts.google.com') &&
                                                !res2.oauthUrl.includes('login_hint=' + encodeURIComponent(targetEmail))) {
                                                this._openUrlInBrowser(this.injectAccountHint(res2.oauthUrl, targetEmail));
                                            } else {
                                                this.startOAuthUrlPoller(targetEmail, onProgress);
                                            }
                                        } else if (res2.isWorkspace) {
                                            hasClicked = true;
                                            if (this.activeClicker) clearInterval(this.activeClicker);
                                        }
                                    } catch(e) {}
                                }, 1000);

                                // Restart sniffer
                                this.startOAuthSessionSniffer(targetEmail, onProgress);
                            }).catch(e => {
                                console.error('[AutoVerifier] Lỗi restart Antigravity:', e.message);
                            });
                        } catch(e) {
                            console.error('[AutoVerifier] Lỗi require antigravity-manager:', e.message);
                        }
                    }
                    // Nếu cred.email !== targetEmail VÀ đã hết retry → credential watcher sẽ tiếp tục chờ
                }
            } catch (e) {
                console.error('[AutoVerifier] Lỗi kiểm tra credential:', e.message);
            }
        }, 1200);

        this.activeWatcher = checkInterval;
    }

    stop() {
        this.isVerifying = false;
        if (this.activeWatcher) {
            clearInterval(this.activeWatcher);
            this.activeWatcher = null;
        }
        if (this.activeClicker) {
            clearInterval(this.activeClicker);
            this.activeClicker = null;
        }
        if (this.activeSniffer) {
            clearInterval(this.activeSniffer);
            this.activeSniffer = null;
        }
        if (this.activeUrlPoller) {
            clearTimeout(this.activeUrlPoller);
            this.activeUrlPoller = null;
        }
    }
}

module.exports = new AntigravityVerifier();
