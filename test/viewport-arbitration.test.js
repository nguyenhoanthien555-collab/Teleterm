const assert = require('assert');
const ptyManager = require('../src/server/pty-manager');

console.log('=== Running P1.2 Viewport Arbitration Unit Tests ===\n');

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    const session = ptyManager.createSession({ name: 'Arbitration Shell', shellId: 'powershell', cols: 120, rows: 30 });
    assert.ok(session);

    let client1Messages = [];
    const client1Ws = {
        id: 'client-desktop-1',
        readyState: 1,
        send: (msg) => client1Messages.push(JSON.parse(msg))
    };

    let client2Messages = [];
    const client2Ws = {
        id: 'client-mobile-2',
        readyState: 1,
        send: (msg) => client2Messages.push(JSON.parse(msg))
    };

    // 1. Client 1 attaches -> Should become Master
    ptyManager.attach(session.id, client1Ws);
    const attach1 = client1Messages[client1Messages.length - 1];
    assert.strictEqual(attach1.isMaster, true, 'First client should be Master');
    assert.strictEqual(session.masterClientId, 'client-desktop-1');
    console.log('✅ Test 1 Passed: First client (Desktop) is designated as Master');

    // 2. Client 2 attaches -> Should become Follower
    ptyManager.attach(session.id, client2Ws);
    const attach2 = client2Messages[client2Messages.length - 1];
    assert.strictEqual(attach2.isMaster, false, 'Second client should be Follower');
    assert.strictEqual(session.masterClientId, 'client-desktop-1', 'Master remains Desktop');
    console.log('✅ Test 2 Passed: Second client (Mobile) is designated as Follower');

    // 3. Follower attempts to resize -> Should be REJECTED
    client2Messages = [];
    const rejectResult = ptyManager.resize(session.id, 45, 20, client2Ws);
    assert.strictEqual(rejectResult, false, 'Follower resize should be rejected');
    assert.strictEqual(session.cols, 120, 'PTY columns must remain unchanged');
    assert.strictEqual(session.rows, 30, 'PTY rows must remain unchanged');

    const rejectMsg = client2Messages.find(m => m.type === 'pty_dimensions' && m.rejected === true);
    assert.ok(rejectMsg, 'Follower should receive rejection with authoritative dimensions');
    console.log('✅ Test 3 Passed: Follower resize rejected, preventing resize war');

    // 4. Master resizes -> Should be ACCEPTED & debounced
    client2Messages = [];
    const acceptResult = ptyManager.resize(session.id, 140, 35, client1Ws);
    assert.strictEqual(acceptResult, true, 'Master resize should be accepted');

    // Wait for 150ms debounce
    await sleep(150);
    assert.strictEqual(session.cols, 140, 'PTY cols updated to 140');
    assert.strictEqual(session.rows, 35, 'PTY rows updated to 35');

    const followerSync = client2Messages.find(m => m.type === 'pty_dimensions' && m.cols === 140);
    assert.ok(followerSync, 'Follower should receive dimension sync update from Master');
    console.log('✅ Test 4 Passed: Master resize debounced and broadcasted to Follower');

    // 5. Active Writer Wins: Mobile client types a command -> Promoted to Master
    client1Messages = [];
    client2Messages = [];
    ptyManager.write(session.id, 'ls\r', client2Ws);

    assert.strictEqual(session.masterClientId, 'client-mobile-2', 'Mobile client promoted to Master upon typing');
    const masterChanged = client1Messages.find(m => m.type === 'master_changed');
    assert.ok(masterChanged, 'Desktop should be notified that Master changed');
    assert.strictEqual(masterChanged.isMaster, false);
    console.log('✅ Test 5 Passed: Active Writer Wins — Mobile promoted to Master upon typing');

    // 6. Graceful Handover: Current Master (Mobile) disconnects -> Desktop promoted back
    client1Messages = [];
    ptyManager.detach(session.id, client2Ws);

    assert.strictEqual(session.masterClientId, 'client-desktop-1', 'Desktop restored to Master upon Mobile detach');
    const promotedMsg = client1Messages.find(m => m.type === 'master_promoted');
    assert.ok(promotedMsg, 'Desktop client should receive master_promoted event');
    console.log('✅ Test 6 Passed: Graceful Master Handover upon disconnect');

    // Cleanup
    ptyManager.closeSession(session.id);
    console.log('\n🎉 ALL P1.2 VIEWPORT ARBITRATION TESTS PASSED PERFECTLY!\n');
    process.exit(0);
}

run().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
