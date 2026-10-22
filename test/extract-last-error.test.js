const assert = require('assert');
const { WorkspaceTerminal } = require('../src/terminal/workspace-terminal');

console.log('=== Running P2.1 extractLastError & Throttle Tests ===\n');

const wsTerm = new WorkspaceTerminal({ rootPath: process.cwd(), eventBus: null });
const session = wsTerm.createSession({ name: 'Error Test Term' });

// Mock buffer with OSC sequence, TrueColor, and git diff line
const ptySession = require('../src/server/pty-manager').getSession(session.id);
assert.ok(ptySession);

// 1. Git diff lines should be ignored
ptySession.buffer.append('git diff output:\r\n');
ptySession.buffer.append('+ const hasError = Error: not a real error\r\n');
ptySession.buffer.append('- fix: TypeError in login\r\n');
ptySession.buffer.append('Normal log line\r\n');

let res = wsTerm.extractLastError(session.id);
assert.strictEqual(res.hasErrorPattern, false, 'Git diff lines should not trigger false positives');
console.log('✅ Test 1 Passed: Git diff false-positive filtering works');

// 2. Real error with OSC and TrueColor ANSI
ptySession.buffer.append('\x1b]0;Terminal Window Title\x07');
ptySession.buffer.append('\x1b[38;2;255;0;0mTypeError: Cannot read property "x" of undefined\x1b[0m\r\n');
ptySession.buffer.append('    at processTicksAndRejections (node:internal/process/task_queues:104:5)\r\n');

// Force invalidate cache to re-evaluate with the new error
const s = wsTerm.activeSessions.get(session.id);
s._lastErrorCache = null;

res = wsTerm.extractLastError(session.id);
assert.strictEqual(res.hasErrorPattern, true, 'Real TypeError should be detected');
assert.ok(res.errorLine.includes('TypeError: Cannot read property "x" of undefined'));
assert.ok(!res.errorLine.includes('\x1b'), 'ANSI codes must be cleanly stripped');
console.log('✅ Test 2 Passed: Real error detected with OSC and TrueColor cleaned');

// 3. Throttle Cache verification
const cachedRes = wsTerm.extractLastError(session.id);
assert.strictEqual(cachedRes, res, 'Should return exact cached object within 300ms throttle window');
console.log('✅ Test 3 Passed: 300ms throttle cache eliminates redundant parsing');

// Cleanup
wsTerm.kill(session.id);
console.log('\n🎉 ALL P2.1 ERROR EXTRACTION TESTS PASSED PERFECTLY!\n');
process.exit(0);
