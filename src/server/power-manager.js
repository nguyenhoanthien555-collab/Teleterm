const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

let bridgePath = path.join(__dirname, '../../bin/ConsoleBridge.exe');
if (bridgePath.includes('app.asar')) {
    const unpacked = bridgePath.replace('app.asar', 'app.asar.unpacked');
    if (fs.existsSync(unpacked)) {
        bridgePath = unpacked;
    }
}

class PowerManager {
    constructor() {
        this.process = null;
        this.isActive = false;
    }

    /**
     * Ngăn chặn Windows tự động Sleep / Standby và ngắt mạng Wi-Fi khi đi xa
     */
    preventSleep() {
        if (process.platform !== 'win32') return false;
        if (this.isActive && this.process) return;

        if (!fs.existsSync(bridgePath)) {
            logger.warn(`[PowerManager] ConsoleBridge.exe không tồn tại tại: ${bridgePath}`);
            return false;
        }

        try {
            this.process = spawn(bridgePath, ['keepalive'], {
                stdio: ['ignore', 'pipe', 'pipe'],
                windowsHide: true
            });

            this.process.on('error', (err) => {
                logger.warn(`[PowerManager Error] Không thể chạy ConsoleBridge.exe: ${err.message}`);
                this.isActive = false;
                this.process = null;
            });

            this.isActive = true;

            this.process.stdout.on('data', (d) => {
                const text = d.toString().trim();
                logger.info(`[PowerManager] ${text}`);
            });

            this.process.stderr.on('data', (d) => {
                logger.warn(`[PowerManager Error] ${d.toString().trim()}`);
            });

            this.process.on('exit', (code) => {
                this.isActive = false;
                this.process = null;
                // Nếu server vẫn đang chạy mà keepalive bị tắt, khởi động lại sau 5s
                if (process.exitCode === undefined || process.exitCode === null) {
                    setTimeout(() => {
                        this.preventSleep();
                    }, 5000);
                }
            });

            // Đảm bảo dọn dẹp khi app Node thoát
            process.on('exit', () => this.restoreSleep());
            process.on('SIGINT', () => {
                this.restoreSleep();
                process.exit();
            });
            process.on('SIGTERM', () => {
                this.restoreSleep();
                process.exit();
            });

            logger.info('Đã kích hoạt chế độ Chống Sleep 24/7 (Windows Power Keep-Alive)');
            return true;
        } catch (err) {
            logger.warn(`Không thể kích hoạt Chống Sleep: ${err.message}`);
            return false;
        }
    }

    /**
     * Khôi phục cài đặt nguồn mặc định của Windows
     */
    restoreSleep() {
        if (this.process) {
            try {
                this.process.kill();
            } catch (e) {}
            this.process = null;
        }
        this.isActive = false;
    }

    allowSleep() {
        this.restoreSleep();
    }
}

module.exports = new PowerManager();
