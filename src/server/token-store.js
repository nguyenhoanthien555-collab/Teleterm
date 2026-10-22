const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('./config');

const tokenFilePath = process.env.TELETERM_USER_DATA_PATH ? path.join(process.env.TELETERM_USER_DATA_PATH, '.tokens.json') : path.join(__dirname, '../../.tokens.json');

class TokenStore {
    constructor() {
        this.tokens = new Set();
        // Master token cố định sinh từ JWT_SECRET để link kết nối vĩnh viễn không bao giờ hết hạn
        this.masterToken = crypto.createHmac('sha256', config.JWT_SECRET).update('TELETERM_PERMANENT_MASTER_KEY').digest('hex');
        this.tokens.add(this.masterToken);
        this._loadTokens();
    }

    _loadTokens() {
        try {
            if (fs.existsSync(tokenFilePath)) {
                const data = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
                if (Array.isArray(data)) {
                    data.forEach(t => this.tokens.add(t));
                }
            }
        } catch (e) {}
    }

    _saveTokens() {
        try {
            const arr = Array.from(this.tokens);
            fs.writeFileSync(tokenFilePath, JSON.stringify(arr, null, 2), 'utf8');
        } catch (e) {}
    }

    createToken() {
        const token = crypto.randomBytes(24).toString('hex');
        this.tokens.add(token);
        this._saveTokens();
        return token;
    }

    isValidToken(token) {
        if (!token) return false;
        return this.tokens.has(token);
    }

    getMasterToken() {
        return this.masterToken;
    }

    /**
     * Kiểm tra xem IP có phải là IP nội bộ / Localhost không
     */
    isLocalIp(ip) {
        if (!ip) return false;
        // Bỏ tiền tố IPv6 ::ffff: nếu có
        const cleanIp = ip.replace(/^.*:/, '');

        if (cleanIp === '127.0.0.1' || cleanIp === 'localhost' || ip === '::1') {
            return true;
        }

        if (cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.')) {
            return true;
        }

        // Dải private 172.16.x.x - 172.31.x.x
        if (cleanIp.startsWith('172.')) {
            const parts = cleanIp.split('.');
            if (parts.length >= 2) {
                const second = parseInt(parts[1], 10);
                if (second >= 16 && second <= 31) return true;
            }
        }

        return false;
    }
}

module.exports = new TokenStore();
