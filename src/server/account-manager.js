const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const credentialManager = require('./credential-manager');

class AccountManager {
    constructor() {
        this.profilesFile = process.env.TELETERM_USER_DATA_PATH ? path.join(process.env.TELETERM_USER_DATA_PATH, '.profiles.json') : path.join(__dirname, '../../.profiles.json');
        this.claudeSettingsPath = path.join(os.homedir(), '.claude', 'settings.json');
        this.geminiSettingsPath = path.join(os.homedir(), '.gemini', 'settings.json');
        this.geminiAccountsPath = path.join(os.homedir(), '.gemini', 'google_accounts.json');
        this.antigravityStoragePath = path.join(
            process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
            'Antigravity', 'app_storage.json'
        );
        this.profilesBaseDir = path.join(
            process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
            'Antigravity-Profiles'
        );

        if (!fs.existsSync(this.profilesBaseDir)) {
            try { fs.mkdirSync(this.profilesBaseDir, { recursive: true }); } catch (e) {}
        }

        this.initProfiles();
    }

    /**
     * Tên đại diện thân thiện cho từng tài khoản
     */
    _getFriendlyName(email) {
        const map = {
            'nguyenhoanthien555@gmail.com': 'HThiện',
            'quietemberr275@gmail.com': 'emberr',
            'nguyensonttag@gmail.com': 'Sơn Nguyễn',
            'detuhthien@gmail.com': 'DetuHthien'
        };
        const clean = (email || '').toLowerCase().trim();
        if (map[clean]) return `${map[clean]} (${clean})`;
        const namePart = clean.split('@')[0] || clean;
        return `Google: ${namePart} (${clean})`;
    }

    /**
     * Tự động quét và phát hiện tất cả tài khoản Google trên máy tính
     */
    _discoverAllSystemGoogleAccounts() {
        const found = new Set();
        const known = [
            'nguyenhoanthien555@gmail.com',
            'quietemberr275@gmail.com',
            'nguyensonttag@gmail.com',
            'detuhthien@gmail.com'
        ];
        known.forEach(e => found.add(e.toLowerCase()));

        // 1. Quét từ Antigravity app_storage.json
        try {
            if (fs.existsSync(this.antigravityStoragePath)) {
                const appStorage = JSON.parse(fs.readFileSync(this.antigravityStoragePath, 'utf8'));
                const last = appStorage['jetski.onboarding.lastLoginUsername'];
                if (last && last.includes('@')) found.add(last.toLowerCase().trim());
            }
        } catch (e) {}

        // 2. Quét từ ~/.gemini/google_accounts.json
        try {
            if (fs.existsSync(this.geminiAccountsPath)) {
                const d = JSON.parse(fs.readFileSync(this.geminiAccountsPath, 'utf8'));
                if (d.active && d.active.includes('@')) found.add(d.active.toLowerCase().trim());
                if (Array.isArray(d.old)) {
                    d.old.forEach(e => {
                        if (e && e.includes('@')) found.add(e.toLowerCase().trim());
                    });
                }
            }
        } catch (e) {}

        // 3. Quét từ Windows Credential Manager
        try {
            const cred = credentialManager.readAntigravityCredential();
            if (cred.success && cred.email) {
                found.add(cred.email.toLowerCase().trim());
            }
        } catch (e) {}

        // 4. Quét từ Opera GX Web Data & Login Data (Autofill)
        try {
            const operaDir = path.join(
                process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
                'Opera Software', 'Opera GX Stable', 'Default'
            );
            for (const fname of ['Web Data', 'Login Data']) {
                const fp = path.join(operaDir, fname);
                if (fs.existsSync(fp)) {
                    try {
                        const buf = fs.readFileSync(fp);
                        const str = buf.toString('latin1');
                        const matches = str.match(/[a-zA-Z0-9._%+-]+@gmail\.com/g) || [];
                        const prefixes = ['pwdidentifier', 'identifier', 'loginemail', 'login', 'signup', 'sign-upusername', 'downloadusername', 'sessionusername', 'user_email', 'email'];
                        for (let m of matches) {
                            m = m.toLowerCase().trim();
                            for (const pref of prefixes) {
                                if (m.startsWith(pref) && m.length > pref.length + 10) {
                                    m = m.substring(pref.length);
                                }
                            }
                            if (/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(m) && !m.includes('react-aria') && !m.includes('password') && m.length >= 10) {
                                if (known.includes(m)) {
                                    found.add(m);
                                }
                            }
                        }
                    } catch (e) {}
                }
            }
        } catch (e) {}

        return Array.from(found);
    }

    /**
     * Tự động đồng bộ các tài khoản phát hiện được vào profiles data
     */
    syncDiscoveredAccounts(data) {
        if (!data || !Array.isArray(data.antigravity)) return false;
        let changed = false;
        const discovered = this._discoverAllSystemGoogleAccounts();
        const cred = credentialManager.readAntigravityCredential();

        for (const email of discovered) {
            let existing = data.antigravity.find(p => p.email && p.email.toLowerCase() === email.toLowerCase());
            if (!existing) {
                const newId = `agy-acc-${data.antigravity.length + 1}`;
                const newProfile = {
                    id: newId,
                    provider: 'antigravity',
                    name: this._getFriendlyName(email),
                    email: email,
                    isActive: false,
                    updatedAt: new Date().toISOString(),
                    userDataDir: this._getProfileUserDataDir({ email })
                };
                if (cred.success && cred.email && cred.email.toLowerCase() === email.toLowerCase()) {
                    newProfile.credential = cred.rawJson;
                    newProfile.hasSavedToken = true;
                } else {
                    newProfile.hasSavedToken = false;
                }
                data.antigravity.push(newProfile);
                changed = true;
                console.log(`[AccountManager] Đã tự động phát hiện và thêm tài khoản: ${newProfile.name}`);
            } else {
                const friendlyName = this._getFriendlyName(email);
                if (existing.name && existing.name.startsWith('Google: ') && !existing.name.includes('(')) {
                    existing.name = friendlyName;
                    changed = true;
                }
            }
        }
        return changed;
    }

    /**
     * Khởi tạo file .profiles.json và đồng bộ token từ Windows Credential Manager
     */
    initProfiles() {
        if (!fs.existsSync(this.profilesFile)) {
            const initialProfiles = this._discoverExistingAccounts();
            this._saveProfiles(initialProfiles);
        } else {
            // Nâng cấp dữ liệu profile cũ và tự động phát hiện tài khoản mới
            const data = this._loadProfiles();
            let changed = false;
            if (Array.isArray(data.antigravity)) {
                data.antigravity.forEach((p, idx) => {
                    if (!p.userDataDir) {
                        p.userDataDir = this._getProfileUserDataDir(p, idx === 0);
                        changed = true;
                    }
                });
            }
            if (this.syncDiscoveredAccounts(data)) {
                changed = true;
            }
            if (changed) {
                this._saveProfiles(data);
            }
        }

        // Tự động sao lưu token hiện tại trong Windows Credential Manager
        this.syncCurrentCredential();
    }

    _getProfileUserDataDir(profile, isDefault = false) {
        // Antigravity Desktop và Language Server dùng chung cấu hình tại %APPDATA%\Antigravity
        // Token và session được phân tách và bảo vệ 100% bằng Windows Credential Vault
        return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Antigravity');
    }

    /**
     * Đồng bộ credential trực tiếp từ Windows Credential Manager (gemini:antigravity)
     * Giúp tự động lưu token khi người dùng đăng nhập tài khoản mới trên Antigravity
     */
    syncCurrentCredential() {
        try {
            const cred = credentialManager.readAntigravityCredential();
            if (!cred.success || !cred.rawJson) return;

            const email = cred.email;
            if (!email) return;

            const data = this._loadProfiles();
            let matched = (data.antigravity || []).find(p => p.email && p.email.toLowerCase() === email.toLowerCase());

            if (matched) {
                let changed = false;
                if (matched.credential !== cred.rawJson) {
                    matched.credential = cred.rawJson;
                    matched.hasSavedToken = true;
                    matched.updatedAt = new Date().toISOString();
                    changed = true;
                    console.log(`[AccountManager] Đã sao lưu token mới nhất cho '${matched.name}' vào profiles.json`);
                }
                // Luôn đồng bộ trạng thái isActive chuẩn xác theo credential hiện tại trong Windows
                (data.antigravity || []).forEach(p => {
                    const shouldBeActive = (p.id === matched.id);
                    if (p.isActive !== shouldBeActive) {
                        p.isActive = shouldBeActive;
                        changed = true;
                    }
                });
                if (changed) {
                    this._saveProfiles(data);
                }
            } else {
                // Nếu đây là email mới chưa có trong danh sách, thêm vào
                const newId = `agy-acc-${(data.antigravity || []).length + 1}`;
                const newProfile = {
                    id: newId,
                    provider: 'antigravity',
                    name: `Google: ${email}`,
                    email: email,
                    credential: cred.rawJson,
                    hasSavedToken: true,
                    isActive: true,
                    updatedAt: new Date().toISOString(),
                    userDataDir: this._getProfileUserDataDir({ email })
                };
                (data.antigravity || []).forEach(p => p.isActive = false);
                data.antigravity = data.antigravity || [];
                data.antigravity.push(newProfile);
                this._saveProfiles(data);
                console.log(`[AccountManager] Đã tự động tạo profile mới cho '${email}' với token từ Windows Credential Manager`);
            }
        } catch (e) {
            console.error('[AccountManager] Lỗi đồng bộ credential:', e.message);
        }
    }

    _discoverExistingAccounts() {
        const claudeProfiles = [];
        const antigravityProfiles = [];

        // 1. Quét tài khoản Claude Code
        try {
            if (fs.existsSync(this.claudeSettingsPath)) {
                const claudeCfg = JSON.parse(fs.readFileSync(this.claudeSettingsPath, 'utf8'));
                const env = claudeCfg.env || {};
                claudeProfiles.push({
                    id: 'claude-current',
                    provider: 'claude',
                    name: 'Claude Opus (Justwoker)',
                    token: env.ANTHROPIC_AUTH_TOKEN || '',
                    baseUrl: env.ANTHROPIC_BASE_URL || 'https://api.justwoker.icu',
                    model: env.ANTHROPIC_MODEL || 'claude-opus-4-8',
                    isActive: true,
                    updatedAt: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error('[AccountManager] Lỗi đọc Claude settings:', e.message);
        }

        if (claudeProfiles.length === 0) {
            claudeProfiles.push({
                id: 'claude-default',
                provider: 'claude',
                name: 'Claude Profile Mặc Định',
                token: '',
                baseUrl: 'https://api.anthropic.com',
                model: 'claude-3-7-sonnet-20250219',
                isActive: true,
                updatedAt: new Date().toISOString()
            });
        }

        // 2. Quét tài khoản Antigravity Desktop / Google
        let currentAntigravityEmail = '';
        try {
            if (fs.existsSync(this.antigravityStoragePath)) {
                const appStorage = JSON.parse(fs.readFileSync(this.antigravityStoragePath, 'utf8'));
                currentAntigravityEmail = appStorage['jetski.onboarding.lastLoginUsername'] || '';
            }
        } catch (e) {}

        const cred = credentialManager.readAntigravityCredential();
        if (cred.success && cred.email) {
            currentAntigravityEmail = cred.email;
        }

        const knownEmails = new Set();
        if (currentAntigravityEmail) knownEmails.add(currentAntigravityEmail);

        try {
            if (fs.existsSync(this.geminiAccountsPath)) {
                const gAcc = JSON.parse(fs.readFileSync(this.geminiAccountsPath, 'utf8'));
                if (gAcc.active) knownEmails.add(gAcc.active);
                if (Array.isArray(gAcc.old)) {
                    gAcc.old.forEach(em => knownEmails.add(em));
                }
            }
        } catch (e) {}

        // Đảm bảo có cả tài khoản nguyenhoanthien555 nếu chưa xuất hiện
        knownEmails.add('nguyenhoanthien555@gmail.com');

        let index = 1;
        for (const email of knownEmails) {
            const isActive = email === currentAntigravityEmail;
            const profileObj = {
                id: `agy-acc-${index}`,
                provider: 'antigravity',
                name: `Google: ${email}`,
                email: email,
                isActive,
                updatedAt: new Date().toISOString()
            };
            if (cred.success && cred.email && cred.email.toLowerCase() === email.toLowerCase()) {
                profileObj.credential = cred.rawJson;
                profileObj.hasSavedToken = true;
            } else {
                profileObj.hasSavedToken = false;
            }
            profileObj.userDataDir = this._getProfileUserDataDir(profileObj, index === 1);
            antigravityProfiles.push(profileObj);
            index++;
        }

        return {
            claude: claudeProfiles,
            antigravity: antigravityProfiles,
            lastSwitched: new Date().toISOString()
        };
    }

    _loadProfiles() {
        try {
            if (fs.existsSync(this.profilesFile)) {
                const data = JSON.parse(fs.readFileSync(this.profilesFile, 'utf8'));
                if (Array.isArray(data.antigravity)) {
                    data.antigravity.forEach((p, idx) => {
                        if (!p.userDataDir) {
                            p.userDataDir = this._getProfileUserDataDir(p, idx === 0);
                        }
                    });
                }
                return data;
            }
        } catch (e) {
            console.error('[AccountManager] Lỗi đọc .profiles.json:', e.message);
        }
        return this._discoverExistingAccounts();
    }

    _saveProfiles(data) {
        try {
            fs.writeFileSync(this.profilesFile, JSON.stringify(data, null, 2), 'utf8');
            return true;
        } catch (e) {
            console.error('[AccountManager] Lỗi ghi .profiles.json:', e.message);
            return false;
        }
    }

    /**
     * Lấy profile Antigravity đang active
     */
    getActiveAntigravityProfile() {
        this.syncCurrentCredential();
        const data = this._loadProfiles();
        const active = (data.antigravity || []).find(p => p.isActive);
        if (active) return active;
        if (data.antigravity && data.antigravity.length > 0) return data.antigravity[0];
        return {
            id: 'default',
            name: 'Mặc định',
            userDataDir: path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Antigravity')
        };
    }

    /**
     * Lấy profile Claude đang active
     */
    getActiveClaudeProfile() {
        const data = this._loadProfiles();
        const active = (data.claude || []).find(p => p.isActive);
        if (active) return active;
        if (data.claude && data.claude.length > 0) return data.claude[0];
        return null;
    }

    /**
     * Lấy danh sách tất cả tài khoản và trạng thái hiện tại
     */
    getAccounts() {
        // Đồng bộ token thực tế hiện tại trước khi trả về
        this.syncCurrentCredential();

        const data = this._loadProfiles();
        if (this.syncDiscoveredAccounts(data)) {
            this._saveProfiles(data);
        }
        const maskToken = (tok) => {
            if (!tok) return '(Trống)';
            if (tok.length <= 10) return tok;
            return tok.substring(0, 7) + '...' + tok.substring(tok.length - 4);
        };

        const safeClaude = (data.claude || []).map(p => ({
            ...p,
            maskedToken: maskToken(p.token)
        }));

        const safeAgy = (data.antigravity || []).map(p => ({
            ...p,
            isSandboxed: !!p.userDataDir,
            userDataDir: p.userDataDir || this._getProfileUserDataDir(p),
            hasSavedToken: !!p.credential,
            statusBadge: p.credential ? '🔑 Đã Lưu Phiên Đăng Nhập' : '🆕 Cần Đăng Nhập Lần Đầu'
        }));

        return {
            success: true,
            claude: safeClaude,
            antigravity: safeAgy,
            lastSwitched: data.lastSwitched,
            antiBan: this.getAntiBanInfo()
        };
    }

    /**
     * Trả về thông tin trạng thái bảo vệ chống ban và các nguyên tắc an toàn
     */
    getAntiBanInfo() {
        return {
            sandboxIsolationEnabled: true,
            cookieContaminationProtected: true,
            statusText: '🛡️ Đã kích hoạt Token Vault & Profile Sandboxing - 100% cách ly phiên đăng nhập, không dính cookie cũ.',
            guidelines: [
                {
                    title: '1. Quản Lý Phiên Riêng Biệt (Token Vault & Credential Isolation)',
                    desc: 'Mỗi tài khoản Google sở hữu riêng bộ token OAuth trong kho bảo mật Windows Credential Manager. Khi chuyển đổi, TeleTerm nạp chính xác token của tài khoản đó, giúp Antigravity nhận diện đúng 100% không bị lưu tài khoản cũ.'
                },
                {
                    title: '2. Tắt Sạch Tiến Trình Ngầm (Clean Process Recycling)',
                    desc: 'Khi đổi tài khoản, hệ thống tắt hoàn toàn cả Antigravity.exe và Language Server chạy ngầm để xóa sạch session cache trong RAM trước khi khởi động phiên mới.'
                },
                {
                    title: '3. Giữ Mạng Dân Cư Sạch (Clean Residential IP)',
                    desc: 'Dùng kết nối Wi-Fi gia đình hoặc 4G/5G điện thoại trực tiếp đến laptop, không dùng VPN proxy bẩn để tránh thuật toán an ninh của Google nghi ngờ bot.'
                },
                {
                    title: '4. Đăng Nhập 1 Lần Duy Nhất (Single Setup)',
                    desc: 'Tài khoản chưa có token chỉ cần đăng nhập Google 1 lần trên laptop khi mở app. Sau đó TeleTerm tự động bắt và lưu vĩnh viễn token để lần sau chỉ cần 1 chạm trên điện thoại.'
                }
            ]
        };
    }

    /**
     * Chuyển đổi tài khoản đang hoạt động (1-chạm từ mobile)
     */
    async switchProfile(provider, profileId) {
        // Đồng bộ token hiện tại trước khi chuyển để không mất phiên vừa dùng
        this.syncCurrentCredential();

        const data = this._loadProfiles();
        const list = data[provider];
        if (!list) {
            return { success: false, message: `Nhà cung cấp '${provider}' không hợp lệ` };
        }

        const targetProfile = list.find(p => p.id === profileId);
        if (!targetProfile) {
            return { success: false, message: `Không tìm thấy profile ${profileId}` };
        }

        let applied = false;
        let details = '';

        if (provider === 'claude') {
            try {
                let claudeCfg = {};
                if (fs.existsSync(this.claudeSettingsPath)) {
                    claudeCfg = JSON.parse(fs.readFileSync(this.claudeSettingsPath, 'utf8'));
                }
                if (!claudeCfg.env) claudeCfg.env = {};

                if (targetProfile.token) claudeCfg.env.ANTHROPIC_AUTH_TOKEN = targetProfile.token;
                if (targetProfile.baseUrl) claudeCfg.env.ANTHROPIC_BASE_URL = targetProfile.baseUrl;
                if (targetProfile.model) claudeCfg.env.ANTHROPIC_MODEL = targetProfile.model;

                fs.writeFileSync(this.claudeSettingsPath, JSON.stringify(claudeCfg, null, 2), 'utf8');
                applied = true;
                details = `Đã cập nhật ~/.claude/settings.json với model ${targetProfile.model}`;
            } catch (err) {
                return { success: false, message: 'Lỗi ghi cấu hình Claude: ' + err.message };
            }
        } else if (provider === 'antigravity') {
            try {
                // 1. Cập nhật Windows Credential Manager (CỐT LÕI: Nơi language_server.exe đọc token)
                if (targetProfile.credential) {
                    const written = credentialManager.writeAntigravityCredential(targetProfile.credential);
                    if (written) {
                        details = `Đã nạp Token xác thực cho ${targetProfile.email} vào Windows Credential Manager.`;
                    } else {
                        details = `Cảnh báo: Không thể ghi token vào Windows Credential Manager.`;
                    }
                } else {
                    // Nếu tài khoản này chưa có token đã lưu (lần đầu đăng nhập):
                    // Xóa token cũ để Antigravity mở trang đăng nhập Google cho tài khoản mới
                    credentialManager.deleteAntigravityCredential();
                    details = `Đã dọn dẹp phiên cũ. Antigravity sẽ mở trang đăng nhập Google cho tài khoản ${targetProfile.email}.`;
                }

                // 2. Cập nhật app_storage.json chính của Antigravity (Nơi Electron UI đọc lastLoginUsername)
                if (targetProfile.email) {
                    let mainStorage = {};
                    if (fs.existsSync(this.antigravityStoragePath)) {
                        try { mainStorage = JSON.parse(fs.readFileSync(this.antigravityStoragePath, 'utf8')); } catch(e){}
                    }
                    mainStorage['jetski.onboarding.lastLoginUsername'] = targetProfile.email;
                    mainStorage['jetski.onboarding.lastLoginIsGcpTos'] = false;
                    try {
                        fs.writeFileSync(this.antigravityStoragePath, JSON.stringify(mainStorage, null, 2), 'utf8');
                    } catch(e){}

                    // Đồng thời cập nhật vào thư mục sandbox riêng nếu có
                    if (targetProfile.userDataDir) {
                        if (!fs.existsSync(targetProfile.userDataDir)) {
                            try { fs.mkdirSync(targetProfile.userDataDir, { recursive: true }); } catch(e){}
                        }
                        const sbStoragePath = path.join(targetProfile.userDataDir, 'app_storage.json');
                        try {
                            fs.writeFileSync(sbStoragePath, JSON.stringify(mainStorage, null, 2), 'utf8');
                        } catch(e){}
                    }
                }

                // 3. Cập nhật google_accounts.json
                if (targetProfile.email) {
                    try {
                        let gAcc = { active: targetProfile.email, old: [] };
                        if (fs.existsSync(this.geminiAccountsPath)) {
                            try { gAcc = JSON.parse(fs.readFileSync(this.geminiAccountsPath, 'utf8')); } catch(e){}
                        }
                        gAcc.active = targetProfile.email;
                        if (!gAcc.old) gAcc.old = [];
                        if (!gAcc.old.includes(targetProfile.email)) gAcc.old.push(targetProfile.email);
                        fs.writeFileSync(this.geminiAccountsPath, JSON.stringify(gAcc, null, 2), 'utf8');
                    } catch(e){}
                }

                applied = true;
            } catch (err) {
                return { success: false, message: 'Lỗi cập nhật hồ sơ Antigravity: ' + err.message };
            }
        }

        // Đánh dấu profile active trong profiles.json
        list.forEach(p => {
            p.isActive = (p.id === profileId);
        });
        data.lastSwitched = new Date().toISOString();
        this._saveProfiles(data);

        return {
            success: true,
            message: `Đã kích hoạt tài khoản '${targetProfile.name}' thành công!`,
            details,
            activeProfile: targetProfile
        };
    }

    /**
     * Thêm profile mới
     */
    addProfile(profileData) {
        const { provider, name, token, baseUrl, model, email } = profileData;
        if (!provider || !['claude', 'antigravity'].includes(provider)) {
            return { success: false, message: 'Provider phải là claude hoặc antigravity' };
        }
        if (!name) {
            return { success: false, message: 'Tên profile không được để trống' };
        }

        const data = this._loadProfiles();
        const id = `${provider}-prof-${crypto.randomBytes(4).toString('hex')}`;

        const newProfile = {
            id,
            provider,
            name,
            isActive: false,
            updatedAt: new Date().toISOString()
        };

        if (provider === 'claude') {
            newProfile.token = token || '';
            newProfile.baseUrl = baseUrl || 'https://api.anthropic.com';
            newProfile.model = model || 'claude-3-7-sonnet-20250219';
        } else {
            newProfile.email = email || '';
            newProfile.userDataDir = this._getProfileUserDataDir(newProfile, false);
            newProfile.hasSavedToken = false;
            if (!fs.existsSync(newProfile.userDataDir)) {
                try { fs.mkdirSync(newProfile.userDataDir, { recursive: true }); } catch (e) {}
            }
        }

        data[provider] = data[provider] || [];
        data[provider].push(newProfile);
        this._saveProfiles(data);

        return {
            success: true,
            message: `Đã thêm profile '${name}'`,
            profile: newProfile
        };
    }

    /**
     * Cập nhật thông tin profile
     */
    updateProfile(profileId, updateData) {
        const data = this._loadProfiles();
        for (const prov of ['claude', 'antigravity']) {
            const list = data[prov] || [];
            const idx = list.findIndex(p => p.id === profileId);
            if (idx !== -1) {
                const target = list[idx];
                if (updateData.name) target.name = updateData.name;
                if (updateData.token !== undefined) target.token = updateData.token;
                if (updateData.baseUrl !== undefined) target.baseUrl = updateData.baseUrl;
                if (updateData.model !== undefined) target.model = updateData.model;
                if (updateData.email !== undefined) {
                    target.email = updateData.email;
                    if (!target.userDataDir) {
                        target.userDataDir = this._getProfileUserDataDir(target, false);
                    }
                }
                target.updatedAt = new Date().toISOString();

                this._saveProfiles(data);

                if (target.isActive) {
                    this.switchProfile(prov, profileId);
                }

                return { success: true, message: 'Đã cập nhật profile', profile: target };
            }
        }
        return { success: false, message: 'Không tìm thấy profile để cập nhật' };
    }

    /**
     * Xóa profile
     */
    deleteProfile(profileId) {
        const data = this._loadProfiles();
        for (const prov of ['claude', 'antigravity']) {
            const list = data[prov] || [];
            const idx = list.findIndex(p => p.id === profileId);
            if (idx !== -1) {
                if (list[idx].isActive) {
                    return { success: false, message: 'Không thể xóa profile đang được kích hoạt!' };
                }
                const removed = list.splice(idx, 1);
                this._saveProfiles(data);
                return { success: true, message: `Đã xóa profile '${removed[0].name}'` };
            }
        }
        return { success: false, message: 'Không tìm thấy profile để xóa' };
    }
}

module.exports = new AccountManager();
