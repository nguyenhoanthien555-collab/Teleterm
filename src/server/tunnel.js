const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const dns = require('dns');
const EventEmitter = require('events');
const logger = require('./logger');
const config = require('./config');
const notifier = require('./notifier');

// Sử dụng DNS Cloudflare (1.1.1.1) và Google (8.8.8.8) để tránh router gia đình chặn hoặc cache lỗi
try {
    dns.setServers(['1.1.1.1', '8.8.8.8', '1.0.0.1']);
} catch (e) {}

class TunnelManager extends EventEmitter {
    constructor() {
        super();
        this.process = null;
        this.publicUrl = null;
        this.localPort = 4000;
        this.shouldRun = false;
        this.reconnectAttempts = 0;
        this.watchdogTimer = null;
        this.keepAliveTimer = null;
        this.consecutivePingFailures = 0;
        this.binPath = null;
        this.sessionFilePath = process.env.TELETERM_USER_DATA_PATH ? path.join(process.env.TELETERM_USER_DATA_PATH, '.tunnel_session.json') : path.join(__dirname, '../../.tunnel_session.json');
        this.existingPid = null;
    }

    /**
     * Tìm đường dẫn tới binary cloudflared
     */
    findCloudflaredBinary() {
        if (this.binPath && fs.existsSync(this.binPath)) {
            return this.binPath;
        }

        let defaultBin = path.join(__dirname, '../../bin/cloudflared.exe');
        if (defaultBin.includes('app.asar')) {
            const unpacked = defaultBin.replace('app.asar', 'app.asar.unpacked');
            if (fs.existsSync(unpacked)) {
                defaultBin = unpacked;
            }
        }

        const potentialPaths = [
            defaultBin,
            'cloudflared', // Trong PATH hệ thống
            'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
            'C:\\Program Files\\cloudflared\\cloudflared.exe',
            path.join(os.homedir(), 'AppData\\Local\\Microsoft\\WinGet\\Links\\cloudflared.exe'),
            path.join(os.homedir(), 'AppData\\Local\\Microsoft\\WinGet\\Packages\\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\\cloudflared.exe')
        ];

        for (const bin of potentialPaths) {
            try {
                if (bin === 'cloudflared') {
                    execSync('where cloudflared', { stdio: 'ignore' });
                    this.binPath = 'cloudflared';
                    return this.binPath;
                } else if (fs.existsSync(bin)) {
                    this.binPath = bin;
                    return this.binPath;
                }
            } catch (e) {}
        }
        return null;
    }

    /**
     * Xác thực DNS của Cloudflare đã phân giải thành công trên internet
     */
    async verifyDnsHealth(url, maxAttempts = 12) {
        if (!url) return false;
        try {
            const hostname = new URL(url).hostname;
            logger.info(`[Tunnel] Đang kiểm tra xác thực DNS Cloudflare cho ${hostname}...`);

            for (let i = 1; i <= maxAttempts; i++) {
                const isResolved = await new Promise((resolve) => {
                    dns.resolve4(hostname, (err, addrs) => {
                        if (!err && addrs && addrs.length > 0) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
                });

                if (isResolved) {
                    logger.info(`[Tunnel] DNS Cloudflare ${hostname} đã phân giải thành công trên internet (lần ${i})`);
                    return true;
                }

                await new Promise((r) => setTimeout(r, 1000));
            }
        } catch (e) {}

        logger.warn(`[Tunnel] DNS chưa phân giải ngay, nhưng URL đã được khởi tạo.`);
        return true;
    }

    /**
     * Khởi động Cloudflare Tunnel với Watchdog 24/7 và Tunnel Persistence
     */
    async startTunnel(localPort) {
        this.localPort = localPort || this.localPort;
        this.shouldRun = true;

        // Kiểm tra xem có phiên tunnel đang chạy từ trước không để tái sử dụng ngay (tránh đổi URL, không cần quét lại QR)
        if (fs.existsSync(this.sessionFilePath)) {
            try {
                const session = JSON.parse(fs.readFileSync(this.sessionFilePath, 'utf8'));
                if (session && session.pid && session.url && session.port === this.localPort) {
                    let isRunning = false;
                    try {
                        process.kill(session.pid, 0);
                        isRunning = true;
                    } catch (e) {
                        isRunning = false;
                    }

                    if (isRunning) {
                        logger.info(`[Tunnel] Tái sử dụng phiên Cloudflare Tunnel hiện tại: ${session.url} (PID: ${session.pid})`);
                        this.publicUrl = session.url;
                        this.existingPid = session.pid;
                        this.reconnectAttempts = 0;
                        this.consecutivePingFailures = 0;
                        this._startKeepAlive();
                        this.emit('ready', { url: this.publicUrl, isPermanent: !!config.CLOUDFLARE_TUNNEL_TOKEN });
                        return this.publicUrl;
                    }
                }
            } catch (err) {
                logger.warn(`[Tunnel] Lỗi đọc phiên tunnel cũ: ${err.message}`);
            }
        }

        const bin = this.findCloudflaredBinary();
        if (!bin) {
            logger.warn('[Tunnel] Không tìm thấy binary cloudflared. Chạy ở chế độ Local/LAN.');
            return null;
        }

        return this._launchTunnelProcess(bin);
    }

    /**
     * Quy trình spawn và khởi động process cloudflared
     */
    _launchTunnelProcess(bin) {
        return new Promise((resolve) => {
            let resolved = false;
            const isNamedTunnel = !!config.CLOUDFLARE_TUNNEL_TOKEN;

            let args = [];
            if (isNamedTunnel) {
                logger.info('[Tunnel] Đang chạy Cloudflare Named Tunnel (Domain cố định)');
                args = ['tunnel', 'run', '--token', config.CLOUDFLARE_TUNNEL_TOKEN];
            } else {
                args = ['tunnel', '--url', `http://127.0.0.1:${this.localPort}`, '--no-autoupdate'];
            }

            try {
                this.process = spawn(bin, args, {
                    detached: true,
                    stdio: ['ignore', 'pipe', 'pipe'],
                    windowsHide: true
                });
                this.process.unref();
            } catch (err) {
                logger.error(`[Tunnel] Không thể spawn cloudflared: ${err.message}`);
                return resolve(null);
            }

            const timeout = setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    logger.warn('[Tunnel] Quá thời gian 20s khởi tạo tunnel.');
                    resolve(this.publicUrl);
                }
            }, 20000);

            const checkOutput = async (data) => {
                const text = data.toString();

                // Bắt URL *.trycloudflare.com
                const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
                if (match && !resolved) {
                    const candidateUrl = match[0];
                    clearTimeout(timeout);

                    // Xác thực DNS trước khi thông báo sẵn sàng
                    await this.verifyDnsHealth(candidateUrl);

                    this.publicUrl = candidateUrl;
                    this.reconnectAttempts = 0;
                    this.consecutivePingFailures = 0;
                    resolved = true;

                    // Lưu session để tái sử dụng qua các lần server restart (không phải quét lại QR)
                    try {
                        const sessionData = {
                            pid: this.process ? this.process.pid : null,
                            url: this.publicUrl,
                            port: this.localPort,
                            createdAt: Date.now()
                        };
                        fs.writeFileSync(this.sessionFilePath, JSON.stringify(sessionData, null, 2), 'utf8');
                    } catch (e) {}

                    logger.info(`[Tunnel] Internet URL sẵn sàng 24/7: ${this.publicUrl}`);
                    
                    // Gửi push notification tự động về điện thoại
                    notifier.notifyNewSession(this.publicUrl, config.AUTH_PASSWORD);
                    
                    this.emit('ready', { url: this.publicUrl, isPermanent: isNamedTunnel });
                    this._startKeepAlive();
                    resolve(this.publicUrl);
                }
            };

            this.process.stdout.on('data', checkOutput);
            this.process.stderr.on('data', checkOutput);

            this.process.on('error', (err) => {
                logger.warn(`[Tunnel Process Error] ${err.message}`);
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(null);
                }
            });

            this.process.on('exit', (code) => {
                this.publicUrl = null;
                this._stopKeepAlive();

                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(null);
                }

                // Nếu app vẫn cần chạy (shouldRun == true), Watchdog sẽ tự hồi sinh!
                if (this.shouldRun) {
                    this._scheduleReconnect();
                }
            });

            // Chỉ tắt hẳn tunnel khi người dùng bấm Ctrl+C
            process.on('SIGINT', () => { 
                this.stopTunnel(true); 
                process.exit(); 
            });
            process.on('SIGTERM', () => { 
                this.stopTunnel(true); 
                process.exit(); 
            });
        });
    }

    /**
     * Vòng lặp Watchdog tự động lên lịch hồi sinh kết nối khi bị đứt mạng
     */
    _scheduleReconnect() {
        if (!this.shouldRun) return;
        if (this.watchdogTimer) clearTimeout(this.watchdogTimer);

        this.reconnectAttempts++;
        const delay = Math.min(30000, Math.max(2000, this.reconnectAttempts * 2000));

        logger.warn(`[Tunnel Watchdog] Tunnel đã ngắt. Đang tự động kết nối lại lần ${this.reconnectAttempts} sau ${Math.round(delay / 1000)}s...`);
        this.emit('reconnecting', { attempt: this.reconnectAttempts });

        this.watchdogTimer = setTimeout(async () => {
            if (!this.shouldRun) return;
            const bin = this.findCloudflaredBinary();
            if (bin) {
                await this._launchTunnelProcess(bin);
            }
        }, delay);
    }

    /**
     * Gửi Ping định kỳ 25s để giữ Cloudflare Edge không bao giờ ngắt kết nối (Keep-Alive)
     */
    _startKeepAlive() {
        this._stopKeepAlive();
        if (!this.publicUrl) return;

        this.keepAliveTimer = setInterval(async () => {
            if (!this.publicUrl || !this.shouldRun) {
                this._stopKeepAlive();
                return;
            }

            try {
                const isAlive = await new Promise((resolve) => {
                    const req = https.get(`${this.publicUrl}/api/status`, { timeout: 8000 }, (res) => {
                        res.resume();
                        resolve(res.statusCode === 200 || res.statusCode === 401);
                    });
                    req.on('error', () => resolve(false));
                    req.on('timeout', () => { req.destroy(); resolve(false); });
                });

                if (isAlive) {
                    this.consecutivePingFailures = 0;
                } else {
                    this.consecutivePingFailures++;
                    logger.warn(`[Tunnel Keep-Alive] Ping không phản hồi (${this.consecutivePingFailures}/3)`);
                    
                    if (this.consecutivePingFailures >= 3) {
                        logger.error('[Tunnel Watchdog] Phát hiện tunnel bị treo/mất kết nối. Đang ép khởi động lại...');
                        this.consecutivePingFailures = 0;
                        this._restartProcess();
                    }
                }
            } catch (e) {}
        }, 25000);
    }

    _stopKeepAlive() {
        if (this.keepAliveTimer) {
            clearInterval(this.keepAliveTimer);
            this.keepAliveTimer = null;
        }
    }

    _restartProcess() {
        if (this.process) {
            try { this.process.kill(); } catch (e) {}
            this.process = null;
        }
        if (this.existingPid) {
            try { process.kill(this.existingPid); } catch (e) {}
            this.existingPid = null;
        }
        try {
            if (fs.existsSync(this.sessionFilePath)) {
                fs.unlinkSync(this.sessionFilePath);
            }
        } catch (e) {}
    }

    stopTunnel(force = false) {
        this.shouldRun = false;
        this._stopKeepAlive();
        if (this.watchdogTimer) {
            clearTimeout(this.watchdogTimer);
            this.watchdogTimer = null;
        }
        if (force) {
            this._restartProcess();
            this.publicUrl = null;
        }
    }
}

module.exports = new TunnelManager();
