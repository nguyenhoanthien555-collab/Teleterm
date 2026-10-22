const assert = require('assert');
const ptyManager = require('../src/server/pty-manager');
const AnsiRingBuffer = require('../src/server/ansi-ring-buffer');

console.log('=== Running PTY Flow Control & Buffer Integration Tests ===\n');

// Test 1: createSession initializes AnsiRingBuffer and session properties
{
    const session = ptyManager.createSession({ name: 'Test Term', shellId: 'powershell' });
    assert.ok(session, 'Session should be created');
    assert.ok(session.buffer instanceof AnsiRingBuffer, 'session.buffer should be AnsiRingBuffer');
    assert.strictEqual(session.isPaused, false, 'isPaused should initially be false');
    assert.strictEqual(session.status, 'running', 'session status should be running');
    console.log('✅ Test 1 Passed: createSession initializes AnsiRingBuffer and flow control state');

    // Test 2: attach() sends formatted history from AnsiRingBuffer
    session.buffer.append('Hello from test\r\n');
    let attachedPacket = null;
    const mockWs = {
        readyState: 1,
        bufferedAmount: 0,
        send: (payload) => {
            attachedPacket = JSON.parse(payload);
        }
    };

    ptyManager.attach(session.id, mockWs);
    assert.ok(attachedPacket, 'attach should send an attached message');
    assert.strictEqual(attachedPacket.type, 'attached');
    assert.ok(attachedPacket.history.includes('Hello from test'), 'History should contain appended content');
    console.log('✅ Test 2 Passed: attach() delivers clean history from AnsiRingBuffer');

    // Test 3: Flow Control High Watermark Pause
    let pauseCalled = false;
    let resumeCalled = false;
    session.pty.pause = () => { pauseCalled = true; };
    session.pty.resume = () => { resumeCalled = true; };

    // Simulate socket congestion: bufferedAmount = 600KB (> 512KB HIGH_WATERMARK)
    mockWs.bufferedAmount = 600 * 1024;
    session.pty.emit('data', 'High volume chunk data\r\n');

    assert.strictEqual(session.isPaused, true, 'session.isPaused should be true when bufferedAmount > 512KB');
    assert.strictEqual(pauseCalled, true, 'session.pty.pause() should have been called');
    console.log('✅ Test 3 Passed: PTY paused when client WebSocket buffer exceeds 512KB');

    // Test 4: Flow Control Low Watermark Resume
    // Simulate socket buffer draining to 30KB (< 64KB LOW_WATERMARK)
    mockWs.bufferedAmount = 30 * 1024;
    ptyManager._checkDrain(session);

    assert.strictEqual(session.isPaused, false, 'session.isPaused should be false after drain');
    assert.strictEqual(resumeCalled, true, 'session.pty.resume() should have been called');
    console.log('✅ Test 4 Passed: PTY resumed when client WebSocket buffer drains below 64KB');

    // Test 5: Detach lagging client clears pause state
    session.isPaused = true;
    mockWs.bufferedAmount = 600 * 1024;
    ptyManager.detach(session.id, mockWs);
    assert.strictEqual(session.isPaused, false, 'session.isPaused should reset to false when lagging subscriber detaches');
    console.log('✅ Test 5 Passed: Detach unpauses PTY when no slow clients remain');

    // Test 6: closeSession cleanup
    ptyManager.closeSession(session.id);
    assert.strictEqual(session.buffer.length, 0, 'session.buffer should be cleared upon closeSession');
    console.log('✅ Test 6 Passed: closeSession cleanly releases AnsiRingBuffer and timers');
}

console.log('\n🎉 ALL PTY INTEGRATION TESTS PASSED PERFECTLY!\n');
process.exit(0);
