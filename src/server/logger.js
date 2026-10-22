const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class Logger extends EventEmitter {
    constructor() {
        super();
        this.logDir = process.env.TELETERM_USER_DATA_PATH ? path.join(process.env.TELETERM_USER_DATA_PATH, 'logs') : path.join(__dirname, '../../logs');
        this.logFile = path.join(this.logDir, 'teleterm.log');
        this.maxBuffer = 300;
        this.buffer = [];
        this.idCounter = 1;

        if (!fs.existsSync(this.logDir)) {
            try {
                fs.mkdirSync(this.logDir, { recursive: true });
            } catch (e) {
                console.error('[Logger] Không thể tạo thư mục logs:', e.message);
            }
        }
    }

    formatTime(date = new Date()) {
        const pad = (n) => String(n).padStart(2, '0');
        const h = pad(date.getHours());
        const m = pad(date.getMinutes());
        const s = pad(date.getSeconds());
        return `${h}:${m}:${s}`;
    }

    addLog(level, message, ip = '', meta = null) {
        const now = new Date();
        const entry = {
            id: this.idCounter++,
            time: this.formatTime(now),
            timestamp: now.toISOString(),
            level: level.toUpperCase(),
            message: String(message),
            ip: ip ? String(ip).replace('::ffff:', '') : '',
            meta: meta || null
        };

        this.buffer.push(entry);
        if (this.buffer.length > this.maxBuffer) {
            this.buffer.shift();
        }

        // Ghi ra file
        const line = `[${entry.timestamp}] [${entry.level}] ${entry.ip ? `[IP: ${entry.ip}] ` : ''}${entry.message}${entry.meta ? ' ' + JSON.stringify(entry.meta) : ''}\n`;
        fs.appendFile(this.logFile, line, (err) => {
            if (err) console.error('[Logger] Lỗi ghi file log:', err.message);
        });

        // Console output
        console.log(`[${entry.time}] [${entry.level}] ${entry.message}`);

        // Bắn event realtime
        this.emit('log', entry);
        return entry;
    }

    info(message, ip = '', meta = null) {
        return this.addLog('INFO', message, ip, meta);
    }

    warn(message, ip = '', meta = null) {
        return this.addLog('WARN', message, ip, meta);
    }

    error(message, ip = '', meta = null) {
        return this.addLog('ERROR', message, ip, meta);
    }

    auth(message, ip = '', success = true, meta = null) {
        const level = success ? 'AUTH_OK' : 'AUTH_FAIL';
        return this.addLog(level, message, ip, meta);
    }

    getRecentLogs(limit = 100) {
        return this.buffer.slice(-limit);
    }

    clearLogs() {
        this.buffer = [];
        try {
            fs.writeFileSync(this.logFile, '');
        } catch (e) {}
    }
}

module.exports = new Logger();
