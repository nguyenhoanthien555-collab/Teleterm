/**
 * MMO Chat & Social Service
 * TeleTerm Master Architecture v2 - Section 8
 */

const logger = require('../logger');

class ChatService {
    constructor() {
        this.history = []; // rolling buffer of 100 recent global messages
        this.maxHistory = 100;
        this.userRateLimits = new Map(); // Map<userId, { count: number, resetTime: number }>
    }

    /**
     * Sanitize and validate incoming message
     */
    postMessage(senderProfile, text, channel = 'global', recipientId = null, recipientName = null) {
        if (!senderProfile || !senderProfile.id) {
            return { error: 'unauthenticated' };
        }

        if (!text || typeof text !== 'string') {
            return { error: 'empty_message' };
        }

        // Rate limit: max 5 messages per 8 seconds
        const now = Date.now();
        let rate = this.userRateLimits.get(senderProfile.id);
        if (!rate || now > rate.resetTime) {
            rate = { count: 0, resetTime: now + 8000 };
            this.userRateLimits.set(senderProfile.id, rate);
        }
        rate.count++;
        if (rate.count > 6) {
            return { error: 'rate_limit_exceeded', retryAfterSec: Math.ceil((rate.resetTime - now) / 1000) };
        }

        // Sanitize string (strip control chars, normalize unicode, max 300 chars)
        let cleanText = text.normalize('NFC').replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, '').trim();
        if (cleanText.length > 300) {
            cleanText = cleanText.substring(0, 300);
        }

        if (!cleanText) {
            return { error: 'invalid_characters' };
        }

        const msgObj = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            channel, // 'global' or 'whisper'
            senderId: senderProfile.id,
            senderName: senderProfile.displayName || senderProfile.username,
            senderLevel: senderProfile.level || 1,
            senderTitle: senderProfile.title || 'Script Novice',
            recipientId: channel === 'whisper' ? recipientId : null,
            recipientName: channel === 'whisper' ? recipientName : null,
            text: cleanText,
            timestamp: now,
            bubbleDurationMs: 7000
        };

        if (channel === 'global') {
            this.history.push(msgObj);
            if (this.history.length > this.maxHistory) {
                this.history.shift();
            }
        }

        return { success: true, message: msgObj };
    }

    getHistory() {
        return this.history;
    }

    deleteUserHistory(userId) {
        this.history = this.history.filter(message => message.senderId !== userId);
        this.userRateLimits.delete(userId);
    }
}

module.exports = new ChatService();
