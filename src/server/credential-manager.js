const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class CredentialManager {
    constructor() {
        let scriptPath = path.join(__dirname, 'cred-helper.ps1');
        if (scriptPath.includes('app.asar')) {
            const unpackedPath = scriptPath.replace('app.asar', 'app.asar.unpacked');
            if (fs.existsSync(unpackedPath)) {
                scriptPath = unpackedPath;
            }
        }
        this.helperScriptPath = scriptPath;
        this.targetName = 'gemini:antigravity';
        this.username = 'antigravity';
    }

    /**
     * Giải mã email từ JWT id_token (Google OAuth)
     */
    extractEmailFromJwt(idToken) {
        if (!idToken || typeof idToken !== 'string') return null;
        try {
            const parts = idToken.split('.');
            if (parts.length < 2) return null;
            const payloadBuf = Buffer.from(parts[1], 'base64');
            const payload = JSON.parse(payloadBuf.toString('utf8'));
            return payload.email || null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Đọc thông tin xác thực Google OAuth của Antigravity từ Windows Credential Manager
     */
    readAntigravityCredential() {
        try {
            const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -File "${this.helperScriptPath}" read "${this.targetName}"`;
            const stdout = execSync(cmd, { encoding: 'utf8', timeout: 5000 }).trim();
            if (!stdout) {
                return { success: false, rawJson: null, email: null };
            }

            const jsonStr = Buffer.from(stdout, 'base64').toString('utf8');
            const parsed = JSON.parse(jsonStr);
            const email = this.extractEmailFromJwt(parsed.id_token);

            return {
                success: true,
                rawJson: jsonStr,
                email,
                data: parsed
            };
        } catch (e) {
            return {
                success: false,
                rawJson: null,
                email: null,
                error: e.message
            };
        }
    }

    /**
     * Ghi thông tin xác thực vào Windows Credential Manager cho Antigravity
     */
    writeAntigravityCredential(credentialData) {
        try {
            const secretStr = typeof credentialData === 'string' ? credentialData : JSON.stringify(credentialData);
            const secretB64 = Buffer.from(secretStr, 'utf8').toString('base64');
            const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -File "${this.helperScriptPath}" write "${this.targetName}" "${this.username}" "${secretB64}"`;
            const stdout = execSync(cmd, { encoding: 'utf8', timeout: 5000 }).trim();
            return stdout.toLowerCase().includes('true');
        } catch (e) {
            console.error('[CredentialManager] Lỗi ghi credential:', e.message);
            return false;
        }
    }

    /**
     * Xóa thông tin xác thực trong Windows Credential Manager (để Antigravity mở trang đăng nhập cho tài khoản mới)
     */
    deleteAntigravityCredential() {
        try {
            const cmd = `powershell -NoProfile -ExecutionPolicy Bypass -File "${this.helperScriptPath}" delete "${this.targetName}"`;
            const stdout = execSync(cmd, { encoding: 'utf8', timeout: 5000 }).trim();
            return stdout.toLowerCase().includes('true');
        } catch (e) {
            console.error('[CredentialManager] Lỗi xóa credential:', e.message);
            return false;
        }
    }
}

module.exports = new CredentialManager();
