const assert = require('assert');
const path = require('path');
const fs = require('fs');

const { EventBus } = require('../src/events/event-bus');
const { RevisionManager } = require('../src/diffs/revision-manager');
const { computeLineDiff, DiffManager, reconstructContentFromHunks } = require('../src/diffs/diff-manager');
const { WorkspaceFilesystem } = require('../src/filesystem/workspace-filesystem');
const { PermissionEngine, PERMISSION_POLICIES } = require('../src/permissions/permission-engine');
const { ContextEngine } = require('../src/context/context-engine');
const { WorkspaceRuntime } = require('../src/workspace/workspace-runtime');
const { AgentRuntime, AGENT_STATES } = require('../src/agents/agent-runtime');
const { UniversalAdapter } = require('../src/agents/provider-adapters/universal-adapter');
const ptyManager = require('../src/server/pty-manager');

async function runTests() {
    console.log('=== RUNNING TELETERM ADE SYSTEM TESTS ===\n');

    // TEST 1: EventBus Monotonicity & Reconnect Replay
    {
        console.log('[Test 1] EventBus Monotonic Sequence & Reconnect Replay');
        const bus = new EventBus({ maxBufferSize: 10 });
        const ev1 = bus.emitEvent('test_event_1', { a: 1 });
        const ev2 = bus.emitEvent('test_event_2', { b: 2 });
        const ev3 = bus.emitEvent('test_event_3', { c: 3 });

        assert.strictEqual(ev1.sequence, 1);
        assert.strictEqual(ev2.sequence, 2);
        assert.strictEqual(ev3.sequence, 3);
        assert.strictEqual(ev1.type, 'test_event_1');
        assert.strictEqual(typeof ev1.eventId, 'string');
        assert.ok(ev1.timestamp > 0);

        // Replay since sequence 1
        const replayed = bus.getEventsSince(1);
        assert.strictEqual(replayed.length, 2);
        assert.strictEqual(replayed[0].sequence, 2);
        assert.strictEqual(replayed[1].sequence, 3);
        console.log('  ✓ Monotonic sequence numbers and replay buffer verified');
    }

    // TEST 2: Revision Manager & Concurrency Conflict Detection
    {
        console.log('[Test 2] RevisionManager Hash and Concurrency Conflict Detection');
        const revMgr = new RevisionManager();
        const read1 = revMgr.recordRead('test.js', 'console.log("v1");');
        assert.strictEqual(read1.revision, 1);
        assert.ok(read1.contentHash);

        // Simulated concurrent edit
        const write1 = revMgr.recordWrite('test.js', 'console.log("v2");', 'user');
        assert.strictEqual(write1.revision, 2);

        // Agent with base revision 1 tries to write
        const conflict = revMgr.checkConflict('test.js', 1, read1.contentHash);
        assert.strictEqual(conflict.conflict, true);
        assert.strictEqual(conflict.reason, 'CONTENT_HASH_MISMATCH');
        console.log('  ✓ Silent overwrite blocked by concurrency conflict check');
    }

    // TEST 3: Diff Manager & Hunk Generation & Selective Hunk Application
    {
        console.log('[Test 3] DiffManager Hunk Generation, Empty String Handling & Selective Hunk Application');
        
        // 3a. Empty file diff (no phantom deletion)
        const emptyOrigHunks = computeLineDiff('', 'hello\nworld');
        assert.strictEqual(emptyOrigHunks.length, 1);
        assert.strictEqual(emptyOrigHunks[0].lines.every(l => l.type === 'add'), true, 'New file must only contain addition lines');
        assert.strictEqual(emptyOrigHunks[0].lines.some(l => l.type === 'del'), false, 'New file must have no deletions');

        // 3b. Multi-hunk selective apply
        const orig = 'line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\nline 10';
        const prop = 'line 1\nline 2 (modified)\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9 (modified)\nline 10';
        const hunks = computeLineDiff(orig, prop);
        assert.strictEqual(hunks.length, 2, 'Expected 2 distinct hunks');

        // Setup test workspace with DiffManager
        const testDir = path.join(__dirname, '.test_diff_hunks');
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'multi.txt'), orig);

        const revMgr = new RevisionManager();
        const fsService = new WorkspaceFilesystem({ rootPath: testDir, revisionManager: revMgr });
        const diffMgr = new DiffManager({ revisionManager: revMgr, fileService: fsService });

        const session = await diffMgr.createDiffSession({
            filePath: 'multi.txt',
            proposedContent: prop
        });
        assert.strictEqual(session.hunks.length, 2);

        // User ACCEPTS hunk 0, and REJECTS hunk 1
        diffMgr.acceptHunk(session.id, session.hunks[0].id);
        diffMgr.rejectHunk(session.id, session.hunks[1].id);
        assert.strictEqual(session.status, 'PARTIAL');

        // Apply partial decisions
        await diffMgr.applyDiffSession(session.id);

        const diskContent = fs.readFileSync(path.join(testDir, 'multi.txt'), 'utf8');
        assert.ok(diskContent.includes('line 2 (modified)'), 'Hunk 0 changes must be applied');
        assert.ok(diskContent.includes('line 9\n'), 'Hunk 1 original content must be preserved');
        assert.ok(!diskContent.includes('line 9 (modified)'), 'Hunk 1 proposed content must NOT be applied');

        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('  ✓ Selective hunk acceptance/rejection applied accurately to disk');
    }

    // TEST 4: Workspace Filesystem & Boundary Traversal Protection (including sibling directories)
    {
        console.log('[Test 4] WorkspaceFilesystem Boundary Security & Sibling Directory Traversal Protection');
        const testDir = path.join(__dirname, '.test_ws_runtime');
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        fs.mkdirSync(testDir, { recursive: true });

        const revMgr = new RevisionManager();
        const fsService = new WorkspaceFilesystem({ rootPath: testDir, revisionManager: revMgr });

        // Path traversal attack 1: deep parent
        let traversalBlocked1 = false;
        try {
            fsService.resolvePath('../../../../../Windows/System32/calc.exe');
        } catch (e) {
            if (e.code === 'ERR_PATH_TRAVERSAL') traversalBlocked1 = true;
        }
        assert.strictEqual(traversalBlocked1, true, 'Deep path traversal must be rejected');

        // Path traversal attack 2: sibling directory with matching prefix
        let traversalBlocked2 = false;
        try {
            fsService.resolvePath('../.test_ws_runtime_extra/passwords.txt');
        } catch (e) {
            if (e.code === 'ERR_PATH_TRAVERSAL') traversalBlocked2 = true;
        }
        assert.strictEqual(traversalBlocked2, true, 'Sibling directory prefix traversal must be rejected');

        // Safe atomic write & read
        await fsService.writeFile('app.txt', 'Hello TeleTerm ADE', { atomic: true });
        const readData = await fsService.readFile('app.txt');
        assert.strictEqual(readData.content, 'Hello TeleTerm ADE');
        assert.strictEqual(readData.revision, 1);
        assert.strictEqual(readData.isBinary, false);

        // Binary detection
        const binBuf = Buffer.from([0x48, 0x00, 0x54]);
        fs.writeFileSync(path.join(testDir, 'bin.dat'), binBuf);
        const binData = await fsService.readFile('bin.dat');
        assert.strictEqual(binData.isBinary, true);
        assert.strictEqual(binData.content, null);

        // Tree listing
        const tree = await fsService.listTree('');
        assert.ok(tree.some(item => item.relPath === 'app.txt'));

        // Cleanup test ws
        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('  ✓ Path traversal rejected, atomic writes & binary detection passed');
    }

    // TEST 5: Permission Engine Real Execution Pause & Resume
    {
        console.log('[Test 5] PermissionEngine Execution Pause & Resume');
        const permEngine = new PermissionEngine();
        permEngine.setPolicy(PERMISSION_POLICIES.ASK_ALWAYS);

        let executionCompleted = false;

        // Async task pauses waiting for approval
        const taskPromise = (async () => {
            const perm = await permEngine.requestPermission({
                sessionId: 'session-1',
                type: 'command_exec',
                target: 'git push'
            });
            if (perm.approved) {
                executionCompleted = true;
            }
            return perm;
        })();

        // Check that pending request was registered
        const pending = permEngine.getPendingRequests();
        assert.strictEqual(pending.length, 1);
        assert.strictEqual(pending[0].target, 'git push');
        assert.strictEqual(executionCompleted, false, 'Execution must pause before user approves');

        // User approves
        permEngine.approve(pending[0].requestId);
        const res = await taskPromise;
        assert.strictEqual(res.approved, true);
        assert.strictEqual(executionCompleted, true, 'Execution must resume after approval');
        console.log('  ✓ Execution pause and resume on user approval verified');
    }

    // TEST 6: Context Engine Resolution, Line Ranges & Windows Paths
    {
        console.log('[Test 6] Context Engine Resolution, Windows Drive Paths & Budgeting');
        const testDir = path.join(__dirname, '.test_ctx_runtime');
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'server.js'), 'const port = 3000;\nconsole.log(port);\nconst app = null;\n');

        const fsService = new WorkspaceFilesystem({ rootPath: testDir });
        const termService = {
            extractLastError: () => ({
                cwd: testDir,
                command: 'node server.js',
                hasErrorPattern: true,
                errorLine: 'Error: Address already in use',
                snippet: 'Error: Address already in use\n    at listen(server.js:2)'
            })
        };
        const gitService = {
            getStatus: async () => ({ branch: 'main', isClean: false, files: [] }),
            getDiff: async () => '+ const port = 3000;'
        };

        const ctxEngine = new ContextEngine({
            fileService: fsService,
            terminalService: termService,
            gitService,
            maxTokenBudget: 5000
        });

        // Test @file:server.js:1-2 line range
        const ctxResult = await ctxEngine.resolveContext({
            prompt: 'Fix the bug in @file:server.js:1-2 based on @terminal:error and check @git',
            codeSelection: {
                filePath: 'server.js',
                startLine: 1,
                endLine: 2,
                code: 'console.log(port);'
            }
        });

        assert.ok(ctxResult.items.length >= 3);
        const fileItem = ctxResult.items.find(it => it.type === 'file');
        assert.ok(fileItem, 'File item must be resolved');
        assert.ok(fileItem.renderedText.includes('const port = 3000;\nconsole.log(port);'));
        assert.ok(!fileItem.renderedText.includes('const app = null;'), 'Line range 1-2 must not contain line 3');

        // Test Windows drive letter mention extraction
        const mentions = ctxEngine.extractMentions('Check @file:C:/Users/Project/app.js:10-25 and @file:E:/Work/code.js');
        assert.strictEqual(mentions.length, 2);
        assert.strictEqual(mentions[0].target, 'C:/Users/Project/app.js:10-25');
        assert.strictEqual(mentions[1].target, 'E:/Work/code.js');

        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('  ✓ Context @file, line ranges, Windows paths, and @terminal:error parsed accurately');
    }

    // TEST 7: Universal Agent Turn & Full Workspace Integration
    {
        console.log('[Test 7] Universal Agent Autonomous Turn with Diff Authority');
        const testWsDir = path.join(__dirname, '.test_agent_ws');
        if (fs.existsSync(testWsDir)) fs.rmSync(testWsDir, { recursive: true, force: true });
        fs.mkdirSync(testWsDir, { recursive: true });
        fs.writeFileSync(path.join(testWsDir, 'hello.txt'), 'Hello world');

        const bus = new EventBus();
        const runtime = new WorkspaceRuntime({
            workspaceId: 'ws-test',
            rootPath: testWsDir,
            eventBus: bus
        });
        await runtime.initialize();

        // Auto approve safe writes for this test
        runtime.permissionEngine.setPolicy(PERMISSION_POLICIES.AUTO_APPROVE);

        const session = runtime.agentManager.createSession({ providerId: 'universal' });
        assert.strictEqual(session.getState(), AGENT_STATES.IDLE);

        // Submit prompt to modify hello.txt
        const turnPromise = session.submitPrompt('edit file: hello.txt with content:\nHello TeleTerm ADE Runtime!');
        const turnRes = await turnPromise;

        assert.strictEqual(turnRes.success, true);
        const updated = await runtime.fileService.readFile('hello.txt');
        assert.strictEqual(updated.content, 'Hello TeleTerm ADE Runtime!');
        assert.strictEqual(updated.revision, 2);

        runtime.shutdown();
        fs.rmSync(testWsDir, { recursive: true, force: true });
        console.log('  ✓ Agent autonomously edited file with diff authority and revision increment');
    }

    // TEST 8: Multi-Agent Coexistence & Advisory File Locking (Slice 6)
    {
        console.log('[Test 8] Multi-Agent Coexistence & Advisory File Locking');
        const testWsDir = path.join(__dirname, '.test_multiagent_ws');
        if (fs.existsSync(testWsDir)) fs.rmSync(testWsDir, { recursive: true, force: true });
        fs.mkdirSync(testWsDir, { recursive: true });
        fs.writeFileSync(path.join(testWsDir, 'shared.js'), 'const a = 1;');

        const bus = new EventBus();
        const runtime = new WorkspaceRuntime({
            workspaceId: 'ws-multi',
            rootPath: testWsDir,
            eventBus: bus
        });
        await runtime.initialize();

        const sessionA = runtime.agentManager.createSession({ providerId: 'universal', name: 'Agent Alpha' });
        const sessionB = runtime.agentManager.createSession({ providerId: 'universal', name: 'Agent Beta' });

        assert.strictEqual(runtime.agentManager.listSessions().length >= 2, true);

        // Session A creates a diff session on shared.js
        const diffA = await runtime.diffManager.createDiffSession({
            filePath: 'shared.js',
            proposedContent: 'const a = 10;',
            agentSessionId: sessionA.sessionId
        });
        assert.strictEqual(diffA.advisoryWarning, null, 'First agent should acquire advisory ownership without warning');

        // Session B attempts to create diff session on same file
        const diffB = await runtime.diffManager.createDiffSession({
            filePath: 'shared.js',
            proposedContent: 'const a = 20;',
            agentSessionId: sessionB.sessionId
        });
        assert.ok(diffB.advisoryWarning !== null, 'Second agent must receive advisory conflict warning');
        assert.ok(diffB.advisoryWarning.includes(sessionA.sessionId), 'Advisory warning must reference first agent session');

        // Session A applies diff -> releases advisory
        await runtime.diffManager.acceptFile(diffA.id);

        runtime.shutdown();
        fs.rmSync(testWsDir, { recursive: true, force: true });
        console.log('  ✓ Multi-agent advisory file locking and coexistence verified');
    }

    // TEST 9: ConPTY Output Forwarding
    {
        console.log('[Test 9] Terminal Output Forwarding via EventBus');
        const bus = new EventBus();
        let receivedOutput = null;
        bus.on('terminal_output', (evt) => {
            receivedOutput = evt.payload;
        });

        const term = new (require('../src/terminal/workspace-terminal').WorkspaceTerminal)({
            rootPath: process.cwd(),
            eventBus: bus
        });

        // Register fake session
        term.activeSessions.set('test-term-1', {
            id: 'test-term-1',
            status: 'running',
            lastActivity: 0
        });

        // Emit 'data' event on ptyManager
        ptyManager.emit('data', { id: 'test-term-1', data: 'PS C:\\> dir\r\n' });

        assert.ok(receivedOutput !== null, 'terminal_output event must be emitted on eventBus');
        assert.strictEqual(receivedOutput.terminalId, 'test-term-1');
        assert.strictEqual(receivedOutput.data, 'PS C:\\> dir\r\n');
        console.log('  ✓ Terminal ConPTY output forwarding to eventBus verified');
    }

    console.log('\n=== ALL TELETERM ADE RUNTIME UNIT & INTEGRATION TESTS PASSED! ===');
}

runTests().catch(err => {
    console.error('\nTEST RUN FAILED:', err);
    process.exit(1);
});
