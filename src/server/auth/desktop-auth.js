'use strict';

const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const profileRepo = require('../persistence/profile-repository');
const chatService = require('../social/chat-service');
const logger = require('../logger');
const config = require('../config');
const security = require('./security');

const router = express.Router();
const dataDir = process.env.TELETERM_USER_DATA_PATH || path.join(__dirname, '../../../');
const SESSIONS_FILE = path.join(dataDir, '.desktop_sessions.json');
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const SHORT_CODE_TTL_MS = 60 * 1000;
const authRateLimit = security.createRateLimiter({ windowMs: 60_000, max: 12 });

class DesktopAuthManager {
    constructor() {
        this.sessions = new Map();
        this.pendingStates = new Map();
        this.exchangeCodes = new Map();
        this.pairingCodes = new Map();
        this.profileClaimRequests = new Map();
        this.sessionRevocationListeners = new Set();
        this.loadSessions();
        this.cleanupTimer = setInterval(() => this.cleanupExpired(), 60_000);
        this.cleanupTimer.unref?.();
    }

    loadSessions() {
        try {
            if (!fs.existsSync(SESSIONS_FILE)) return;
            const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
            if (!data || typeof data !== 'object') return;
            for (const [token, session] of Object.entries(data)) {
                // Older entries keyed by bearer tokens are ignored; new persisted keys are SHA-256 digests.
                if (/^[a-f0-9]{64}$/i.test(token) && session?.expiresAt && new Date(session.expiresAt).getTime() > Date.now()) {
                    this.sessions.set(token, session);
                }
            }
        } catch (error) {
            logger.error('[DesktopAuth] Failed to load sessions:', error.message);
        }
    }

    persistSessions() {
        try {
            fs.mkdirSync(dataDir, { recursive: true });
            const serialized = Object.fromEntries(this.sessions.entries());
            const temporaryPath = `${SESSIONS_FILE}.tmp`;
            fs.writeFileSync(temporaryPath, JSON.stringify(serialized), { encoding: 'utf8', mode: 0o600 });
            fs.renameSync(temporaryPath, SESSIONS_FILE);
        } catch (error) {
            logger.error('[DesktopAuth] Failed to persist sessions:', error.message);
        }
    }

    cleanupExpired() {
        const now = Date.now();
        let sessionsChanged = false;
        for (const [token, session] of this.sessions) {
            if (!session.expiresAt || new Date(session.expiresAt).getTime() <= now) {
                this.sessions.delete(token);
                sessionsChanged = true;
            }
        }
        for (const entries of [this.pendingStates, this.exchangeCodes, this.pairingCodes, this.profileClaimRequests]) {
            for (const [code, item] of entries) if (item.expiresAt <= now) entries.delete(code);
        }
        if (sessionsChanged) this.persistSessions();
    }

    createSession(userId, provider, providerSubject, details = {}) {
        let actualSubject = providerSubject;
        let actualDetails = details;
        if (typeof providerSubject === 'object' && providerSubject !== null) {
            actualDetails = providerSubject;
            actualSubject = actualDetails.providerSubject || actualDetails.email || userId;
        }
        const token = `tt_sess_${crypto.randomBytes(32).toString('hex')}`;
        const session = {
            userId,
            provider,
            providerSubject: String(actualSubject || ''),
            displayName: actualDetails.displayName || 'Traveler',
            avatarUrl: actualDetails.avatarUrl || null,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString()
        };
        this.sessions.set(this.hashToken(token), session);
        this.persistSessions();
        return { token, session, ...session };
    }

    refreshSession(token) {
        if (!token) return null;
        const key = this.hashToken(token);
        let session = this.sessions.get(key);
        if (!session) {
            this.loadSessions();
            session = this.sessions.get(key);
        }
        if (!session) return null;
        if (new Date(session.expiresAt).getTime() <= Date.now()) {
            this.sessions.delete(key);
            this.persistSessions();
            return null;
        }
        session.expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
        this.persistSessions();
        return session;
    }

    validateSession(token) {
        if (!token) return null;
        const key = this.hashToken(token);
        let session = this.sessions.get(key);
        if (!session) {
            this.loadSessions();
            session = this.sessions.get(key);
        }
        if (!session) return null;
        if (new Date(session.expiresAt).getTime() <= Date.now()) {
            this.sessions.delete(key);
            this.persistSessions();
            return null;
        }
        return session;
    }

    authenticateRequest(request) {
        const token = security.getSessionToken(request);
        const session = this.validateSession(token);
        return session ? { ...session, token, isOwner: security.isOwner(session) } : null;
    }

    revokeSession(token) {
        const session = this.sessions.get(this.hashToken(token));
        const removed = this.sessions.delete(this.hashToken(token));
        if (removed) this.persistSessions();
        if (removed && session) this.notifySessionRevoked({ userId: session.userId, token, all: false });
        return removed;
    }

    onSessionsRevoked(listener) {
        this.sessionRevocationListeners.add(listener);
        return () => this.sessionRevocationListeners.delete(listener);
    }

    notifySessionRevoked(event) {
        for (const listener of this.sessionRevocationListeners) {
            try { listener(event); } catch (_) {}
        }
    }

    revokeUserSessions(userId) {
        let changed = false;
        for (const [token, session] of this.sessions) {
            if (session.userId === userId) {
                this.sessions.delete(token);
                changed = true;
            }
        }
        for (const [requestId, request] of this.profileClaimRequests) {
            if (request.userId === userId) this.profileClaimRequests.delete(requestId);
        }
        if (changed) this.persistSessions();
        if (changed) this.notifySessionRevoked({ userId, all: true });
    }

    generateUserId(provider, providerSubject) {
        const subject = String(providerSubject || '').trim();
        const identitySecret = process.env.TELETERM_IDENTITY_SECRET || config.JWT_SECRET;
        const hash = crypto.createHmac('sha256', identitySecret).update(`${provider}:${subject}`).digest('hex').slice(0, 24);
        return `tt_usr_${provider}_${hash}`;
    }

    hashToken(token) {
        return crypto.createHash('sha256').update(String(token || '')).digest('hex');
    }

    createExchangeCode(token) {
        const code = security.randomCode(24);
        this.exchangeCodes.set(code, { token, expiresAt: Date.now() + SHORT_CODE_TTL_MS });
        return code;
    }

    exchangeCode(code) {
        const item = this.exchangeCodes.get(code);
        this.exchangeCodes.delete(code);
        if (!item || item.expiresAt <= Date.now() || !this.validateSession(item.token)) return null;
        return item.token;
    }

    createPairingCode(session) {
        const code = security.randomCode(24);
        this.pairingCodes.set(code, {
            userId: session.userId,
            provider: session.provider,
            providerSubject: session.providerSubject,
            displayName: session.displayName,
            avatarUrl: session.avatarUrl,
            expiresAt: Date.now() + SHORT_CODE_TTL_MS
        });
        return code;
    }

    redeemPairingCode(code) {
        const sessionData = this.pairingCodes.get(code);
        this.pairingCodes.delete(code);
        if (!sessionData || sessionData.expiresAt <= Date.now()) return null;
        const { expiresAt, ...details } = sessionData;
        return this.createSession(details.userId, details.provider, details.providerSubject, details);
    }

    requestProfileClaim(session, legacyProfileId) {
        if (!session?.userId || typeof legacyProfileId !== 'string' || legacyProfileId.length > 120 || legacyProfileId === session.userId) {
            return { success: false, error: 'invalid_profile_claim' };
        }
        const legacy = profileRepo.get(legacyProfileId);
        if (!legacy || legacy.verifiedAccount) return { success: false, error: 'profile_claim_not_available' };
        const existing = Array.from(this.profileClaimRequests.values()).find(item => item.userId === session.userId && item.legacyProfileId === legacyProfileId);
        if (existing) return { success: true, requestId: existing.id, pending: true };
        const id = security.randomCode(18);
        this.profileClaimRequests.set(id, {
            id,
            userId: session.userId,
            provider: session.provider,
            legacyProfileId,
            requestedAt: new Date().toISOString(),
            expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
        });
        return { success: true, requestId: id, pending: true };
    }

    listProfileClaimRequests() {
        return Array.from(this.profileClaimRequests.values(), request => ({
            id: request.id,
            userId: request.userId,
            provider: request.provider,
            legacyProfileId: request.legacyProfileId,
            requestedAt: request.requestedAt
        }));
    }

    approveProfileClaim(requestId) {
        const request = this.profileClaimRequests.get(requestId);
        if (!request) return { success: false, error: 'claim_request_not_found' };
        const result = profileRepo.claimLegacyProfile(request.legacyProfileId, request.userId, request.provider);
        if (result.success) this.profileClaimRequests.delete(requestId);
        return result;
    }

    rejectProfileClaim(requestId) {
        return this.profileClaimRequests.delete(requestId);
    }

    getOrCreateLocalOwnerSession(request, response) {
        if (!security.isDirectLocalhost(request)) return null;

        const existing = this.authenticateRequest(request);
        if (existing && existing.isOwner) {
            return existing;
        }

        const localOwnerUserId = 'tt_usr_local_owner';
        const { token, session } = this.createSession(
            localOwnerUserId,
            'local',
            'host_developer',
            { displayName: 'Host Owner' }
        );

        if (response && !response.headersSent && typeof response.setHeader === 'function') {
            setSessionCookie(request, response, token);
        }

        profileRepo.getOrCreate(localOwnerUserId, { displayName: 'Host Owner' });

        return {
            ...session,
            token,
            isOwner: true
        };
    }
}

const authManager = new DesktopAuthManager();

function sessionCookieOptions(request) {
    const forwardedProto = String(request.headers['x-forwarded-proto'] || '').split(',')[0].trim();
    const secure = forwardedProto === 'https' || request.socket?.encrypted || /^https:\/\//i.test(process.env.TELETERM_PUBLIC_ORIGIN || '');
    return { httpOnly: true, secure: Boolean(secure), sameSite: 'lax', path: '/', maxAge: SESSION_TTL_MS };
}

function setSessionCookie(request, response, token) {
    const options = sessionCookieOptions(request);
    response.setHeader('Set-Cookie', `teleterm_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${options.secure ? '; Secure' : ''}`);
}

function clearSessionCookie(request, response) {
    const options = sessionCookieOptions(request);
    response.setHeader('Set-Cookie', `teleterm_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${options.secure ? '; Secure' : ''}`);
}

function safeDisplayName(value, fallback) {
    const name = String(value || fallback || 'Traveler').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 30);
    return name || 'Traveler';
}

function getRedirectUri(request, client) {
    if (client === 'desktop') return `http://127.0.0.1:${config.PORT}/api/auth/desktop/callback`;
    const configuredOrigin = process.env.TELETERM_PUBLIC_ORIGIN;
    if (configuredOrigin) {
        const parsed = new URL(configuredOrigin);
        if (!['http:', 'https:'].includes(parsed.protocol) || parsed.pathname !== '/' || parsed.search || parsed.hash) throw new Error('invalid_public_origin');
        return `${parsed.origin}/api/auth/desktop/callback`;
    }
    const hostname = String(request.headers.host || '').split(':')[0].toLowerCase();
    if (!['localhost', '127.0.0.1', '[::1]'].includes(hostname)) throw new Error('public_origin_required');
    return `http://${request.headers.host}/api/auth/desktop/callback`;
}

function oauthCredentials(provider) {
    const clientId = process.env[provider === 'google' ? 'GOOGLE_CLIENT_ID' : 'GITHUB_CLIENT_ID'];
    const clientSecret = process.env[provider === 'google' ? 'GOOGLE_CLIENT_SECRET' : 'GITHUB_CLIENT_SECRET'];
    if (!clientId || !clientSecret || /teleterm.*(dev|oauth)/i.test(clientId)) return null;
    return { clientId, clientSecret };
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`oauth_provider_error_${response.status}`);
    return payload;
}

async function verifyProviderIdentity(provider, code, redirectUri) {
    const credentials = oauthCredentials(provider);
    if (!credentials) throw new Error('oauth_provider_unconfigured');

    if (provider === 'google') {
        const form = new URLSearchParams({
            code,
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        });
        const token = await fetchJson('https://oauth2.googleapis.com/token', {
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form
        });
        if (!token.access_token) throw new Error('oauth_identity_unverified');
        const identity = await fetchJson('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: { Authorization: `Bearer ${token.access_token}` }
        });
        if (!identity.sub || identity.email_verified !== true) throw new Error('oauth_identity_unverified');
        return { subject: String(identity.sub), email: identity.email || null, displayName: identity.name, avatarUrl: identity.picture || null };
    }

    const tokenData = await fetchJson('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: credentials.clientId, client_secret: credentials.clientSecret, code, redirect_uri: redirectUri })
    });
    if (!tokenData.access_token) throw new Error('oauth_identity_unverified');
    const headers = { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    const identity = await fetchJson('https://api.github.com/user', { headers });
    if (identity.id === undefined || identity.id === null) throw new Error('oauth_identity_unverified');
    let email = identity.email || null;
    if (!email) {
        const emails = await fetchJson('https://api.github.com/user/emails', { headers });
        const verified = Array.isArray(emails) && emails.find(item => item.primary && item.verified);
        if (verified) email = verified.email;
    }
    return { subject: String(identity.id), email, displayName: identity.name || identity.login, avatarUrl: identity.avatar_url || null };
}

router.use((request, response, next) => {
    response.setHeader('Cache-Control', 'no-store');
    next();
});

router.get('/session', (request, response) => {
    const providedToken = security.getSessionToken(request);
    let session = authManager.authenticateRequest(request);
    if (!session && !providedToken && security.isDirectLocalhost(request)) {
        session = authManager.getOrCreateLocalOwnerSession(request, response);
    }
    if (!session) return response.status(401).json({ success: false, authenticated: false, error: 'invalid_or_expired_session' });
    const profile = profileRepo.getOrCreate(session.userId, { displayName: session.displayName, avatarUrl: session.avatarUrl });
    return response.json({
        success: true,
        authenticated: true,
        role: session.isOwner ? 'owner' : 'player',
        account: { id: session.userId, provider: session.provider, displayName: session.displayName },
        profile: security.publicProfile(profile)
    });
});

router.post('/logout', (request, response) => {
    const token = security.getSessionToken(request) || request.body?.token;
    if (token) authManager.revokeSession(token);
    clearSessionCookie(request, response);
    return response.json({ success: true });
});

router.post('/guest', authRateLimit, (request, response) => {
    const username = (request.body?.username || 'Traveler').trim().slice(0, 32);
    const guestSeed = crypto.randomBytes(8).toString('hex');
    const userId = authManager.generateUserId('guest', guestSeed);
    const profile = profileRepo.getOrCreate(userId, { displayName: username, username, presetId: 'sakura_alice' });
    const { token, session } = authManager.createSession(userId, 'guest', guestSeed, { displayName: username });
    setSessionCookie(request, response, token);
    return response.json({
        success: true,
        token,
        session,
        profile: security.publicProfile(profile)
    });
});

router.post('/refresh', authRateLimit, (request, response) => {
    const token = security.getSessionToken(request) || request.body?.token;
    if (!token) return response.status(400).json({ success: false, error: 'token_required' });
    const session = authManager.refreshSession(token);
    if (!session) return response.status(401).json({ success: false, error: 'invalid_or_expired_session' });
    return response.json({ success: true, session });
});

router.delete('/account', authRateLimit, (request, response) => {
    const session = authManager.authenticateRequest(request);
    if (!session) return response.status(401).json({ success: false, error: 'authentication_required' });
    const profile = profileRepo.get(session.userId);
    if (profile && !profileRepo.delete(session.userId)) {
        return response.status(503).json({ success: false, error: 'profile_store_unavailable' });
    }
    if (profile?.customModelUrl) {
        const modelRoot = path.resolve(process.env.TELETERM_USER_DATA_PATH
            ? path.join(process.env.TELETERM_USER_DATA_PATH, 'models', 'custom')
            : path.join(__dirname, '../../../public/models/custom'));
        const modelPath = path.resolve(modelRoot, path.basename(profile.customModelUrl));
        if (modelPath.startsWith(`${modelRoot}${path.sep}`)) {
            try { fs.rmSync(modelPath, { force: true }); } catch (error) { logger.warn('[DesktopAuth] Could not remove account avatar:', error.message); }
        }
    }
    chatService.deleteUserHistory(session.userId);
    try { require('../progression/xp-service').deleteUserData(session.userId); } catch (_) {}
    try { require('../progression/quest-service').deleteUserState(session.userId); } catch (_) {}
    try {
        const realtimeGateway = require('../realtime/gateway');
        const player = realtimeGateway.removePlayer(session.userId);
        if (player?.ws?.readyState === 1) player.ws.close(4401, 'account deleted');
    } catch (_) {}
    authManager.revokeUserSessions(session.userId);
    clearSessionCookie(request, response);
    return response.json({ success: true });
});

router.post('/exchange', authRateLimit, (request, response) => {
    const { code } = request.body || {};
    if (typeof code !== 'string' || code.length > 200) return response.status(400).json({ success: false, error: 'invalid_exchange_code' });
    const token = authManager.exchangeCode(code);
    if (!token) return response.status(401).json({ success: false, error: 'exchange_code_expired' });
    setSessionCookie(request, response, token);
    return response.json({ success: true });
});

router.post('/pairing/redeem', authRateLimit, (request, response) => {
    const { code } = request.body || {};
    if (typeof code !== 'string' || code.length > 200) return response.status(400).json({ success: false, error: 'invalid_pairing_code' });
    const issued = authManager.redeemPairingCode(code);
    if (!issued) return response.status(401).json({ success: false, error: 'pairing_code_expired' });
    setSessionCookie(request, response, issued.token);
    return response.json({ success: true });
});

router.post('/pairing', authRateLimit, (request, response) => {
    const session = authManager.authenticateRequest(request);
    if (!session?.isOwner) return response.status(403).json({ success: false, error: 'owner_only' });
    const code = authManager.createPairingCode(session);
    return response.json({ success: true, code, expiresInSeconds: SHORT_CODE_TTL_MS / 1000 });
});

router.post('/profile-claim', authRateLimit, (request, response) => {
    const session = authManager.authenticateRequest(request);
    if (!session) return response.status(401).json({ success: false, error: 'authentication_required' });
    const result = authManager.requestProfileClaim(session, request.body?.legacyProfileId);
    return response.status(result.success ? 202 : 400).json(result);
});

router.get('/oauth/start', authRateLimit, (request, response) => {
    const provider = request.query.provider;
    const client = request.query.client === 'desktop' ? 'desktop' : 'web';
    if (!['google', 'github'].includes(provider)) return response.status(400).json({ success: false, error: 'invalid_provider' });
    const credentials = oauthCredentials(provider);
    if (!credentials) return response.status(503).json({ success: false, error: 'oauth_provider_unconfigured' });

    let redirectUri;
    try { redirectUri = getRedirectUri(request, client); }
    catch (error) { return response.status(503).json({ success: false, error: error.message }); }
    const state = security.randomCode(24);
    authManager.pendingStates.set(state, { provider, client, redirectUri, expiresAt: Date.now() + 10 * 60 * 1000 });
    const params = new URLSearchParams({ client_id: credentials.clientId, redirect_uri: redirectUri, state });
    const authUrl = provider === 'google'
        ? `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({ ...Object.fromEntries(params), response_type: 'code', scope: 'openid profile email' })}`
        : `https://github.com/login/oauth/authorize?${new URLSearchParams({ ...Object.fromEntries(params), scope: 'read:user user:email' })}`;
    if (client === 'web') {
        const secure = String(request.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https' || request.socket?.encrypted || /^https:\/\//i.test(process.env.TELETERM_PUBLIC_ORIGIN || '');
        response.setHeader('Set-Cookie', `teleterm_oauth_state=${encodeURIComponent(state)}; Path=/api/auth/desktop; HttpOnly; SameSite=Lax; Max-Age=600${secure ? '; Secure' : ''}`);
        return response.redirect(302, authUrl);
    }
    return response.json({ success: true, provider, state, authUrl, redirectUri });
});

router.get('/callback', authRateLimit, async (request, response) => {
    const { code, state, error } = request.query;
    const pending = typeof state === 'string' ? authManager.pendingStates.get(state) : null;
    if (typeof state === 'string') authManager.pendingStates.delete(state);
    const browserState = security.parseCookies(request.headers.cookie).teleterm_oauth_state;
    const clearStateCookie = 'teleterm_oauth_state=; Path=/api/auth/desktop; HttpOnly; SameSite=Lax; Max-Age=0';
    if (pending?.client === 'web' && browserState !== state) {
        response.setHeader('Set-Cookie', clearStateCookie);
        return response.status(401).send('Yêu cầu đăng nhập không hợp lệ. Vui lòng bắt đầu lại từ TeleTerm.');
    }
    if (error || !pending || pending.expiresAt <= Date.now() || !code) {
        if (pending?.client === 'web') response.setHeader('Set-Cookie', clearStateCookie);
        return response.status(401).send('Đăng nhập không thành công. Vui lòng quay lại TeleTerm và thử lại.');
    }

    try {
        const identity = await verifyProviderIdentity(pending.provider, String(code), pending.redirectUri);
        const userId = authManager.generateUserId(pending.provider, identity.subject);
        const displayName = safeDisplayName(identity.displayName, identity.email?.split('@')[0]);
        const profile = profileRepo.getOrCreate(userId, { username: displayName, displayName, avatarUrl: identity.avatarUrl, presetId: 'sakura_alice' });
        profile.verifiedAccount = true;
        profile.authProvider = pending.provider;
        profile.displayName = displayName;
        profile.username = displayName;
        if (identity.avatarUrl && !profile.avatarUrl) { profile.avatarUrl = identity.avatarUrl; profileRepo.save(profile); }
        else profileRepo.save(profile);
        const { token, session } = authManager.createSession(userId, pending.provider, identity.subject, { email: identity.email, displayName, avatarUrl: identity.avatarUrl });

        response.setHeader('Referrer-Policy', 'no-referrer');
        if (pending.client === 'desktop') {
            const exchangeCode = authManager.createExchangeCode(token);
            const deepLink = `teleterm://auth/callback?code=${encodeURIComponent(exchangeCode)}&state=${encodeURIComponent(state)}`;
            return response.type('html').send(`<!doctype html><meta charset="utf-8"><title>TeleTerm sign in</title><p>Đăng nhập thành công. Đang quay lại TeleTerm…</p><a href="${deepLink}">Mở TeleTerm</a><script>location.href=${JSON.stringify(deepLink)}</script>`);
        }

        response.setHeader('Set-Cookie', [clearStateCookie, `teleterm_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${sessionCookieOptions(request).secure ? '; Secure' : ''}`]);
        response.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'");
        return response.type('html').send(`<!doctype html><meta charset="utf-8"><title>TeleTerm sign in</title><p>Đăng nhập thành công. Bạn có thể đóng cửa sổ này.</p><script>if(window.opener){window.opener.postMessage({type:'teleterm_auth_success'},location.origin)}setTimeout(()=>window.close(),800)</script>`);
    } catch (cause) {
        logger.warn('[DesktopAuth] OAuth callback rejected:', cause.message);
        return response.status(401).send('Không thể xác minh tài khoản OAuth. Vui lòng thử lại.');
    }
});

module.exports = { router, authManager, security, setSessionCookie, clearSessionCookie };
