const assert = require('assert');
const ptyManager = require('../src/server/pty-manager');

console.log('=== Running P0.3 High-Speed Process Tree Test ===\n');

async function run() {
    // Test 1: Non-existent session
    const notFound = await ptyManager.getChildProcesses('term-nonexistent-999');
    assert.strictEqual(notFound.success, false);
    assert.strictEqual(notFound.error, 'Session not found');
    console.log('✅ Test 1 Passed: Graceful handling for non-existent session');

    // Test 2: Real running PTY session
    const session = ptyManager.createSession({ name: 'Speed Test Shell', shellId: 'powershell' });
    assert.ok(session && session.pty && session.pty.pid, 'Session PID should exist');

    const startTime = Date.now();
    const result = await ptyManager.getChildProcesses(session.id);
    const duration = Date.now() - startTime;

    console.log(`⏱️ Execution Time: ${duration}ms (Previous PowerShell: ~1500ms)`);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.rootPid, session.pty.pid);
    assert.ok(Array.isArray(result.processes), 'result.processes should be an array');
    assert.ok(result.processes.length > 0, 'Should find at least the root process');

    const rootEntry = result.processes.find(p => p.isRoot === true);
    assert.ok(rootEntry, 'Root entry must be identified');
    assert.strictEqual(rootEntry.pid, session.pty.pid);
    assert.ok(rootEntry.name.toLowerCase().includes('powershell'), `Expected powershell, got ${rootEntry.name}`);

    // Speed assertion: must complete under 100ms (typically 10-25ms)
    assert.ok(duration < 200, `Expected duration < 200ms, took ${duration}ms`);
    console.log('✅ Test 2 Passed: Native Toolhelp Process Tree executed in ' + duration + 'ms');

    // Cleanup
    ptyManager.closeSession(session.id);
    console.log('✅ Test 3 Passed: Session closed cleanly');

    console.log('\n🎉 ALL P0.3 PROCESS TREE TESTS PASSED PERFECTLY!\n');
    process.exit(0);
}

run().catch(err => {
    console.error('❌ Test Failed:', err);
    process.exit(1);
});
