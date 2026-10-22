const http = require('http');
const WebSocket = require('ws');
const assert = require('assert');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, raw: data });
                }
            });
        }).on('error', reject);
    });
}

function fetchStatus(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            res.resume();
            resolve(res.statusCode);
        }).on('error', reject);
    });
}

async function runLiveVerification() {
    console.log('=== RUNNING LIVE TELETERM ADE RUNTIME E2E VERIFICATION ===\n');

    // 1. Verify /ade page is served
    console.log('[E2E 1] GET /ade and /ade.html');
    const adeStatus = await fetchStatus('http://localhost:4000/ade');
    assert.strictEqual(adeStatus, 200, 'Expected /ade to return HTTP 200');
    console.log('  ✓ /ade returns HTTP 200 OK');

    // 2. Verify Monaco AMD loader static asset is served
    console.log('[E2E 2] Monaco Vendor Assets');
    const monacoStatus = await fetchStatus('http://localhost:4000/vendor/monaco/vs/loader.js');
    assert.strictEqual(monacoStatus, 200, 'Expected Monaco loader to return HTTP 200');
    console.log('  ✓ /vendor/monaco/vs/loader.js returns HTTP 200 OK');

    // 3. Verify /api/ade/workspace
    console.log('[E2E 3] GET /api/ade/workspace');
    const wsRes = await fetchJson('http://localhost:4000/api/ade/workspace');
    assert.strictEqual(wsRes.status, 200);
    assert.strictEqual(wsRes.data.success, true);
    assert.strictEqual(wsRes.data.workspace.workspaceId, 'ws-default');
    console.log(`  ✓ Workspace confirmed: ${wsRes.data.workspace.rootPath} (Status: ${wsRes.data.workspace.status})`);

    // 4. Verify /api/ade/files/tree
    console.log('[E2E 4] GET /api/ade/files/tree');
    const filesRes = await fetchJson('http://localhost:4000/api/ade/files/tree');
    assert.strictEqual(filesRes.status, 200);
    assert.strictEqual(filesRes.data.success, true);
    assert.ok(filesRes.data.tree.length > 0);
    console.log(`  ✓ Filesystem tree returned ${filesRes.data.tree.length} workspace entries`);

    // 5. Verify /api/ade/git/status
    console.log('[E2E 5] GET /api/ade/git/status');
    const gitRes = await fetchJson('http://localhost:4000/api/ade/git/status');
    assert.strictEqual(gitRes.status, 200);
    assert.strictEqual(gitRes.data.success, true);
    assert.ok(gitRes.data.status.branch);
    console.log(`  ✓ Git status confirmed on branch '${gitRes.data.status.branch}' (Files: ${gitRes.data.status.files.length})`);

    // 6. Verify WebSocket /ws/ade-stream live sequence connection
    console.log('[E2E 6] WebSocket Gateway: ws://localhost:4000/ws/ade-stream');
    const ws = new WebSocket('ws://localhost:4000/ws/ade-stream');

    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('WebSocket timeout')), 5000);

        ws.on('open', () => {
            console.log('  ✓ Connected to /ws/ade-stream');
        });

        ws.on('message', (raw) => {
            try {
                const msg = JSON.parse(raw.toString());
                if (msg.type === 'hello') {
                    assert.strictEqual(msg.workspace.workspaceId, 'ws-default');
                    assert.ok(msg.currentSequence >= 0);
                    console.log(`  ✓ Received server_hello with sequence #${msg.currentSequence}`);

                    // Send test replay
                    ws.send(JSON.stringify({ type: 'replay', payload: { fromSequence: 0 } }));
                } else if (msg.type === 'replay_batch') {
                    console.log(`  ✓ Received replay_batch with ${msg.events.length} events from ring buffer`);
                    clearTimeout(timeout);
                    ws.close();
                    resolve();
                }
            } catch (e) {
                clearTimeout(timeout);
                reject(e);
            }
        });

        ws.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });

    console.log('\n=== ALL LIVE TELETERM ADE RUNTIME E2E TESTS PASSED SUCCESSFULLY! ===\n');
}

runLiveVerification().catch(err => {
    console.error('E2E TEST FAILURE:', err);
    process.exit(1);
});
