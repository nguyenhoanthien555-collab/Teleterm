'use strict';

const assert = require('node:assert/strict');
const security = require('../src/server/auth/security');

assert.equal(security.parseCookies('a=1; teleterm_session=abc%2B123').teleterm_session, 'abc+123');
assert.equal(security.getSessionToken({ headers: { cookie: 'teleterm_session=from-cookie' } }), 'from-cookie');
assert.equal(security.getSessionToken({ headers: { authorization: 'Bearer from-header', cookie: 'teleterm_session=from-cookie' } }), 'from-header');
assert.equal(security.getSessionToken({ headers: { 'x-session-token': 'legacy', cookie: '' } }), null);

assert.equal(security.isOwner({ provider: 'google', providerSubject: 'owner-sub' }, 'google:owner-sub'), true);
assert.equal(security.isOwner({ provider: 'google', providerSubject: 'other-sub' }, 'google:owner-sub'), false);
assert.equal(security.isOwner({ provider: 'guest', providerSubject: 'owner-sub' }, 'google:owner-sub'), false);

assert.equal(security.originAllowed({
    headers: { origin: 'https://game.example', host: 'game.example', 'x-forwarded-proto': 'https' },
    socket: {}
}), true);
assert.equal(security.originAllowed({
    headers: { origin: 'https://attacker.example', host: 'game.example', 'x-forwarded-proto': 'https' },
    socket: {}
}), false);
assert.equal(security.originAllowed({ headers: { origin: 'null', host: 'game.example' }, socket: {} }), false);

const profile = security.publicProfile({ id: 'player', displayName: 'Player', email: 'private@example.test', providerSubject: 'private-sub', stats: { commands: 2 } });
assert.deepEqual(profile, { id: 'player', displayName: 'Player' });

const rateLimit = security.createRateLimiter({ windowMs: 60_000, max: 1 });
const request = { socket: { remoteAddress: '198.51.100.12' }, headers: {} };
let statusCode = 200;
const response = {
    setHeader() {},
    status(value) { statusCode = value; return this; },
    json() { return this; }
};
let continued = false;
rateLimit(request, response, () => { continued = true; });
assert.equal(continued, true);
continued = false;
rateLimit(request, response, () => { continued = true; });
assert.equal(continued, false);
assert.equal(statusCode, 429);

console.log('security-hardening checks passed');
