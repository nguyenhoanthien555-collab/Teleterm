'use strict';

const crypto = require('crypto');
const net = require('net');

function parseCookies(header = '') {
    const cookies = {};
    for (const entry of String(header).split(';')) {
        const separator = entry.indexOf('=');
        if (separator < 1) continue;
        const key = entry.slice(0, separator).trim();
        try { cookies[key] = decodeURIComponent(entry.slice(separator + 1).trim()); } catch (_) {}
    }
    return cookies;
}

function getSessionToken(request) {
    const authorization = request.headers?.authorization || '';
    const bearer = authorization.match(/^Bearer\s+(.+)$/i);
    if (bearer) return bearer[1].trim();
    return parseCookies(request.headers?.cookie).teleterm_session || null;
}

function isOwner(session, ownerIds = process.env.TELETERM_OWNER_IDS || '') {
    if (!session || !session.provider || !session.providerSubject) return false;
    if (session.provider === 'local') return true;
    const identity = `${session.provider}:${session.providerSubject}`;
    return ownerIds.split(',').map(value => value.trim()).filter(Boolean).includes(identity);
}

function originAllowed(request) {
    const origin = request.headers?.origin;
    if (!origin) return true;
    let parsed;
    try { parsed = new URL(origin); } catch (_) { return false; }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) return false;
    const allowlist = (process.env.TELETERM_ALLOWED_ORIGINS || process.env.TELETERM_PUBLIC_ORIGIN || '')
        .split(',').map(value => value.trim()).filter(Boolean);
    if (allowlist.some(value => value.replace(/\/$/, '') === origin.replace(/\/$/, ''))) return true;
    const host = request.headers?.host;
    const forwardedProto = String(request.headers?.['x-forwarded-proto'] || '').split(',')[0].trim();
    const protocol = forwardedProto === 'https' || request.socket?.encrypted ? 'https:' : 'http:';
    return Boolean(host && parsed.host.toLowerCase() === host.toLowerCase() && parsed.protocol === protocol);
}

function createRateLimiter({ windowMs = 60_000, max = 30 } = {}) {
    const buckets = new Map();
    return function rateLimit(request, response, next) {
        // Do not trust client-supplied X-Forwarded-For unless a trusted-proxy layer is configured.
        const forwardedClientIp = process.env.TELETERM_TRUSTED_PROXY === 'cloudflare'
            ? String(request.headers?.['cf-connecting-ip'] || '').trim()
            : '';
        const clientIp = net.isIP(forwardedClientIp) ? forwardedClientIp : request.socket?.remoteAddress || 'unknown';
        const key = request.authSession?.userId ? `user:${request.authSession.userId}` : `ip:${clientIp}`;
        const now = Date.now();
        let bucket = buckets.get(key);
        if (!bucket || bucket.resetAt <= now) bucket = { count: 0, resetAt: now + windowMs };
        bucket.count += 1;
        buckets.set(key, bucket);
        if (buckets.size > 5000) {
            for (const [entry, state] of buckets) if (state.resetAt <= now) buckets.delete(entry);
        }
        if (bucket.count > max) {
            response.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
            return response.status(429).json({ success: false, error: 'rate_limit_exceeded' });
        }
        return next();
    };
}

function publicProfile(profile) {
    if (!profile) return null;
    const fields = ['id', 'username', 'displayName', 'avatarUrl', 'presetId', 'customColors', 'customModelUrl', 'level', 'totalXp', 'currentLevelXp', 'title'];
    const result = Object.fromEntries(fields.filter(key => profile[key] !== undefined).map(key => [key, profile[key]]));
    if (result.customColors && typeof result.customColors === 'object' && !Array.isArray(result.customColors)) {
        result.customColors = Object.fromEntries(['hair', 'eyes', 'outfit', 'aura']
            .filter(key => typeof result.customColors[key] === 'string' && /^#[0-9a-f]{6}$/i.test(result.customColors[key]))
            .map(key => [key, result.customColors[key]]));
    } else if (result.customColors !== undefined) {
        delete result.customColors;
    }
    return result;
}

function isDirectLocalhost(request) {
    if (!request) return false;
    const remoteIp = request.socket?.remoteAddress || '';
    const isLoopback = remoteIp === '127.0.0.1' || remoteIp === '::1' || remoteIp === '::ffff:127.0.0.1';
    if (!isLoopback) return false;

    // Reject requests with reverse proxy/tunnel forwarding headers to prevent header spoofing
    if (request.headers?.['x-forwarded-for'] || request.headers?.['x-real-ip'] || request.headers?.['cf-connecting-ip']) {
        return false;
    }

    // Host header check to prevent DNS rebinding
    const host = String(request.headers?.host || '').toLowerCase();
    const isLocalHostHeader = /^localhost(:\d+)?$/.test(host) || /^127\.0\.0\.1(:\d+)?$/.test(host) || /^\[::1\](:\d+)?$/.test(host);
    return isLocalHostHeader;
}

function randomCode(bytes = 32) {
    return crypto.randomBytes(bytes).toString('base64url');
}

module.exports = { createRateLimiter, getSessionToken, isDirectLocalhost, isOwner, originAllowed, parseCookies, publicProfile, randomCode };
