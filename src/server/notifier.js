const https = require('https');
const config = require('./config');
const logger = require('./logger');

class Notifier {
    /**
     * Gửi thông báo URL và PIN mới tới điện thoại qua ntfy.sh (hoàn toàn miễn phí, không cần tài khoản)
     */
    async notifyNewSession(url) {
        if (!config.NTFY_TOPIC) return;
        const topic = config.NTFY_TOPIC;
        const clickUrl = url;
        const payload = `TeleTerm is ready. Sign in with Google or GitHub to continue.\nURL: ${url}`;

        try {
            const req = https.request({
                hostname: 'ntfy.sh',
                port: 443,
                path: `/${encodeURIComponent(topic)}`,
                method: 'POST',
                headers: {
                    'Title': 'TeleTerm Ready',
                    'Priority': 'urgent',
                    'Tags': 'rocket,computer',
                    'Click': clickUrl,
                    'Content-Type': 'text/plain; charset=utf-8'
                }
            }, (res) => {
                res.resume();
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    logger.info(`[Notifier] Đã gửi push notification tới kênh ntfy.sh/${topic}`);
                }
            });

            req.on('error', (err) => {
                // Không chặn chương trình nếu mạng ngoài tạm thời lỗi
                logger.warn(`[Notifier] Không thể gửi push notification: ${err.message}`);
            });

            req.write(payload);
            req.end();
        } catch (e) {
            logger.warn(`[Notifier] Lỗi notifier: ${e.message}`);
        }
    }

    /**
     * Gửi thông báo tùy biến tới ntfy.sh
     */
    async sendNotification(title, message, tags = 'bell', clickUrl = null) {
        if (!config.NTFY_TOPIC) return;
        const topic = config.NTFY_TOPIC;
        try {
            const headers = {
                'Title': title || 'TeleTerm Alert',
                'Priority': 'high',
                'Tags': tags,
                'Content-Type': 'text/plain; charset=utf-8'
            };
            if (clickUrl) headers['Click'] = clickUrl;

            const req = https.request({
                hostname: 'ntfy.sh',
                port: 443,
                path: `/${encodeURIComponent(topic)}`,
                method: 'POST',
                headers
            }, (res) => {
                res.resume();
            });

            req.on('error', () => {});
            req.write(message || '');
            req.end();
        } catch (e) {}
    }
}

module.exports = new Notifier();
