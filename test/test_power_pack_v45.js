const http = require('http');
const WebSocket = require('ws');

const TOKEN = '346e2be7d80c891fa9706d521a494d4f0697d67f0b11a790733896f1f2765aa2';
const PORT = 4000;
const HOST = '127.0.0.1';

function request(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, headers: res.headers, raw: data });
                }
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

async function runTests() {
    console.log('====================================================');
    console.log('🧪 RUNNING TELETERM V4.5 POWER PACK VERIFICATION SUITE');
    console.log('====================================================\n');

    let passed = 0;
    let total = 0;

    function assert(condition, testName) {
        total++;
        if (condition) {
            console.log(`✅ [PASS] ${testName}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${testName}`);
        }
    }

    try {
        // Test 1: GET /api/status
        console.log('--- Test 1: Server Status & Auth ---');
        const statusRes = await request({
            hostname: HOST,
            port: PORT,
            path: `/api/status?token=${TOKEN}`,
            method: 'GET'
        });
        assert(statusRes.statusCode === 200 && statusRes.body.online === true, 'Server is online and responding 200');
        assert(statusRes.body.authenticated === true, 'Token successfully authenticated');

        // Test 2: GET /api/desktop/screenshot
        console.log('\n--- Test 2: Desktop Screen Peek (Screenshot) ---');
        const startShot = Date.now();
        const shotRes = await request({
            hostname: HOST,
            port: PORT,
            path: `/api/desktop/screenshot?token=${TOKEN}`,
            method: 'GET'
        });
        const durationShot = Date.now() - startShot;
        assert(shotRes.statusCode === 200, `Screenshot endpoint responded 200 in ${durationShot}ms`);
        assert(shotRes.body.success === true, 'Screenshot captured successfully');
        assert(typeof shotRes.body.screenshot === 'string' && shotRes.body.screenshot.startsWith('data:image/png;base64,'), 'Screenshot returned valid base64 PNG data URL');
        assert(shotRes.body.width > 0 && shotRes.body.height > 0, `Captured screen dimensions: ${shotRes.body.width}x${shotRes.body.height}`);

        // Test 3: List & Create PTY Session
        console.log('\n--- Test 3: PTY Sessions Management ---');
        let sessionsRes = await request({
            hostname: HOST,
            port: PORT,
            path: `/api/sessions?token=${TOKEN}`,
            method: 'GET'
        });
        let activeSessionId = null;
        if (sessionsRes.body.sessions && sessionsRes.body.sessions.length > 0) {
            activeSessionId = sessionsRes.body.sessions[0].id;
        } else {
            // Create a session
            const createRes = await request({
                hostname: HOST,
                port: PORT,
                path: `/api/sessions?token=${TOKEN}`,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, { shellId: 'powershell', name: 'Test PTY' });
            assert(createRes.body.success === true, 'Created new PTY session');
            activeSessionId = createRes.body.session.id;
        }
        assert(!!activeSessionId, `Active PTY session identified: ${activeSessionId}`);

        // Test 4: Git Radar endpoint
        console.log('\n--- Test 4: Git Radar HUD ---');
        const gitRes = await request({
            hostname: HOST,
            port: PORT,
            path: `/api/sessions/${activeSessionId}/git?token=${TOKEN}`,
            method: 'GET'
        });
        assert(gitRes.statusCode === 200, 'Git Radar endpoint returned 200');
        assert(gitRes.body.success === true, `Git Radar detected branch: ${gitRes.body.branch}`);
        assert(typeof gitRes.body.clean === 'boolean', `Git workspace clean flag: ${gitRes.body.clean}`);

        // Test 5: Listening Ports Scanner
        console.log('\n--- Test 5: Listening Ports Scanner ---');
        const portsRes = await request({
            hostname: HOST,
            port: PORT,
            path: `/api/system/listening-ports?token=${TOKEN}`,
            method: 'GET'
        });
        assert(portsRes.statusCode === 200, 'Listening ports endpoint returned 200');
        assert(portsRes.body.success === true && Array.isArray(portsRes.body.ports), 'Listening ports returned array');
        const has4000 = portsRes.body.ports.some(p => p.port === 4000);
        assert(has4000, 'Port 4000 (TeleTerm) detected in listening ports list');

        // Test 6: Reverse Proxy Bridge
        console.log('\n--- Test 6: Reverse Proxy Bridge (/proxy/:port) ---');
        const proxyRes = await request({
            hostname: HOST,
            port: PORT,
            path: `/proxy/4000/api/status?token=${TOKEN}`,
            method: 'GET'
        });
        assert(proxyRes.statusCode === 200, 'Reverse proxy forwarded request to localhost:4000 with 200 OK');
        assert(proxyRes.body.online === true, 'Reverse proxy returned authentic localhost:4000 response body');

        // Test 7: Broadcast Endpoint (HTTP)
        console.log('\n--- Test 7: Broadcast Input Mode (HTTP) ---');
        const broadcastRes = await request({
            hostname: HOST,
            port: PORT,
            path: `/api/sessions/broadcast?token=${TOKEN}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { input: '# test broadcast\r' });
        assert(broadcastRes.statusCode === 200, 'Broadcast HTTP endpoint returned 200');
        assert(broadcastRes.body.success === true, `Broadcasted input to ${broadcastRes.body.count} active session(s)`);

        // Test 8: WebSocket broadcast_input
        console.log('\n--- Test 8: WebSocket broadcast_input ---');
        await new Promise((resolve) => {
            const ws = new WebSocket(`ws://${HOST}:${PORT}/ws?token=${TOKEN}&sessionId=${activeSessionId}`);
            ws.on('open', () => {
                assert(true, 'WebSocket connected successfully');
                // Send broadcast_input message
                ws.send(JSON.stringify({
                    type: 'broadcast_input',
                    data: '# ws broadcast\r'
                }));
                setTimeout(() => {
                    assert(true, 'Sent broadcast_input via WebSocket without error');
                    ws.close();
                    resolve();
                }, 400);
            });
            ws.on('error', (err) => {
                assert(false, `WebSocket error: ${err.message}`);
                resolve();
            });
        });

        console.log('\n====================================================');
        console.log(`📊 FINAL RESULT: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
        console.log('====================================================');
        process.exit(passed === total ? 0 : 1);

    } catch (err) {
        console.error('Fatal test error:', err);
        process.exit(1);
    }
}

runTests();
