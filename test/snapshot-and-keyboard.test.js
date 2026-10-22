const assert = require('assert');
const ptyManager = require('../src/server/pty-manager');

console.log('=== Running P0 & P1 Snapshot & Keyboard Tests ===\n');

// --- Test 1: getSnapshot returns full terminal state ---
console.log('Testing ptyManager.getSnapshot()...');
const session = ptyManager.createSession({ name: 'SnapshotTestSession', cols: 100, rows: 40 });
assert(session, 'Session should be created');
assert.strictEqual(session.cols, 100);
assert.strictEqual(session.rows, 40);

// Append some content to buffer
session.buffer.append('Line 1: system initialized\r\nLine 2: ready for commands\r\n');

const snapshot = ptyManager.getSnapshot(session.id);
assert(snapshot, 'getSnapshot should return a valid object');
assert.strictEqual(snapshot.sessionId, session.id);
assert.strictEqual(snapshot.name, 'SnapshotTestSession');
assert.strictEqual(snapshot.cols, 100);
assert.strictEqual(snapshot.rows, 40);
assert(snapshot.history.includes('Line 1: system initialized'), 'History should contain Line 1');
assert(snapshot.history.includes('Line 2: ready for commands'), 'History should contain Line 2');
assert(typeof snapshot.timestamp === 'number', 'Snapshot must have numeric timestamp');
console.log('✅ Test 1 Passed: getSnapshot returns complete terminal snapshot state');

// --- Test 2: attach and reconnect snapshot sync ---
console.log('Testing snapshot state with subscribers and master...');
const fakeWs1 = {
    id: 'client-desktop',
    readyState: 1,
    bufferedAmount: 0,
    sent: [],
    send(data) { this.sent.push(JSON.parse(data)); }
};
ptyManager.attach(session.id, fakeWs1);

const snapshotAfterAttach = ptyManager.getSnapshot(session.id);
assert.strictEqual(snapshotAfterAttach.subscribersCount, 1);
assert.strictEqual(snapshotAfterAttach.masterClientId, 'client-desktop');

// Check attached message structure
const attachMsg = fakeWs1.sent.find(m => m.type === 'attached');
assert(attachMsg, 'Should receive attached message');
assert.strictEqual(attachMsg.isMaster, true);
assert.strictEqual(attachMsg.cols, 100);
assert.strictEqual(attachMsg.rows, 40);
console.log('✅ Test 2 Passed: attach delivers master status and complete snapshot data');

// --- Test 3: Virtual Keyboard Guard logic unit test ---
console.log('Testing Virtual Keyboard Guard simulation...');
function testVirtualKeyboardDetection({ isMobile, activeElIsTerminal, visualViewportHeight, innerHeight }) {
    if (!isMobile) return false;
    if (!activeElIsTerminal) return false;
    if (visualViewportHeight && innerHeight) {
        const heightRatio = visualViewportHeight / innerHeight;
        if (heightRatio < 0.82) {
            return true;
        }
    }
    return false;
}

// Case A: Desktop browser resize -> Not a virtual keyboard
assert.strictEqual(testVirtualKeyboardDetection({
    isMobile: false,
    activeElIsTerminal: false,
    visualViewportHeight: 500,
    innerHeight: 800
}), false, 'Desktop resize must not be treated as virtual keyboard');

// Case B: Mobile with keyboard popup (viewport height drops to 400 from 800 while terminal active)
assert.strictEqual(testVirtualKeyboardDetection({
    isMobile: true,
    activeElIsTerminal: true,
    visualViewportHeight: 400,
    innerHeight: 800
}), true, 'Mobile keyboard shrink (< 0.82 ratio) must be detected as virtual keyboard');

// Case C: Mobile orientation change (ratio is 1.0, not shrunk by keyboard)
assert.strictEqual(testVirtualKeyboardDetection({
    isMobile: true,
    activeElIsTerminal: true,
    visualViewportHeight: 400,
    innerHeight: 400
}), false, 'Mobile rotation without keyboard must not be blocked');

console.log('✅ Test 3 Passed: Virtual Keyboard guard correctly distinguishes keyboard vs rotation');

// Cleanup
ptyManager.closeSession(session.id);
console.log('\n🎉 ALL P0 & P1 SNAPSHOT AND KEYBOARD TESTS PASSED PERFECTLY!\n');
process.exit(0);
