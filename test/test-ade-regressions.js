const assert = require('assert');
const path = require('path');
const fs = require('fs');

const { WorkspaceTerminal } = require('../src/terminal/workspace-terminal');
const { VerificationRunner } = require('../src/verification/verification-runner');
const { computeLineDiff, DiffManager } = require('../src/diffs/diff-manager');
const { RevisionManager } = require('../src/diffs/revision-manager');
const { WorkspaceFilesystem } = require('../src/filesystem/workspace-filesystem');
const { WorkspaceFileWatcher } = require('../src/filesystem/workspace-file-watcher');
const { ContextEngine } = require('../src/context/context-engine');
const { PermissionEngine } = require('../src/permissions/permission-engine');
const { WorkspaceGit } = require('../src/git/workspace-git');
const { EventBus } = require('../src/events/event-bus');
const ptyManager = require('../src/server/pty-manager');

async function runRegressionSuite() {
    console.log('=== RUNNING TELETERM ADE TARGETED REGRESSION & FORENSIC SUITE ===\n');

    // 1. Regression: WorkspaceTerminal.kill must not throw ptyManager.killSession is not a function
    {
        console.log('[Regression 1] WorkspaceTerminal.kill & ConPTY Session Teardown');
        const eventBus = new EventBus();
        const termService = new WorkspaceTerminal({ rootPath: process.cwd(), eventBus });
        const session = termService.createSession({ name: 'RegressionTerm' });
        assert.ok(session && session.id, 'Session must be created');
        assert.doesNotThrow(() => {
            termService.kill(session.id);
        }, 'termService.kill must succeed without throwing');
        assert.strictEqual(termService.activeSessions.has(session.id), false, 'Session must be deleted from active list');
        console.log('  ✓ WorkspaceTerminal.kill safely torn down ConPTY process');
    }

    // 2. Regression: computeLineDiff complete 3 leading & 3 trailing context lines without overlap
    {
        console.log('[Regression 2] computeLineDiff 3 Leading and 3 Trailing Context Verification');
        const orig = [
            'line 1',
            'line 2', // will modify
            'line 3',
            'line 4',
            'line 5',
            'line 6',
            'line 7',
            'line 8',
            'line 9', // will modify
            'line 10'
        ].join('\n');

        const prop = [
            'line 1',
            'line 2 (MODIFIED)',
            'line 3',
            'line 4',
            'line 5',
            'line 6',
            'line 7',
            'line 8',
            'line 9 (MODIFIED)',
            'line 10'
        ].join('\n');

        const hunks = computeLineDiff(orig, prop);
        assert.strictEqual(hunks.length, 2, 'Must produce 2 distinct hunks');
        
        // Hunk 0 should have leading context 'line 1', diff 'line 2', and trailing context 'line 3', 'line 4', 'line 5'
        assert.strictEqual(hunks[0].editEnd < hunks[1].editStart, true, 'Hunk 0 and Hunk 1 must NOT overlap');
        assert.strictEqual(hunks[0].lines.some(l => l.content === 'line 3'), true, 'Hunk 0 must contain trailing context line 3');
        assert.strictEqual(hunks[0].lines.some(l => l.content === 'line 4'), true, 'Hunk 0 must contain trailing context line 4');
        assert.strictEqual(hunks[0].lines.some(l => l.content === 'line 5'), true, 'Hunk 0 must contain trailing context line 5');
        
        // Hunk 1 should have leading context 'line 6', 'line 7', 'line 8', diff 'line 9', and trailing context 'line 10'
        assert.strictEqual(hunks[1].lines.some(l => l.content === 'line 6'), true, 'Hunk 1 must contain leading context line 6');
        assert.strictEqual(hunks[1].lines.some(l => l.content === 'line 7'), true, 'Hunk 1 must contain leading context line 7');
        assert.strictEqual(hunks[1].lines.some(l => l.content === 'line 8'), true, 'Hunk 1 must contain leading context line 8');
        console.log('  ✓ Hunk 0 and Hunk 1 have exact 3 trailing & 3 leading context lines with zero index overlap');
    }

    // 3. Regression: ContextEngine single oversized item strict budget ceiling & quoted path support
    {
        console.log('[Regression 3] ContextEngine Strict Token Budget Ceiling & Quoted Paths');
        const testDir = path.join(__dirname, '.test_ctx_budget');
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        fs.mkdirSync(testDir, { recursive: true });

        // Create a massive file with 40,000 characters (~10,000 tokens)
        const hugeContent = 'a'.repeat(40000);
        fs.writeFileSync(path.join(testDir, 'huge.txt'), hugeContent);

        // Create a file with spaces in filename
        fs.writeFileSync(path.join(testDir, 'spaced file.txt'), 'line 1\nline 2\nline 3\nline 4\nline 5');

        const revMgr = new RevisionManager();
        const fileService = new WorkspaceFilesystem({ rootPath: testDir, revisionManager: revMgr });
        
        // Budget limited strictly to 2000 tokens (~7600 chars)
        const contextEngine = new ContextEngine({
            fileService,
            terminalService: { extractLastError: () => null },
            gitService: { getStatus: async () => ({ isClean: true }), getDiff: async () => '' },
            maxTokenBudget: 2000
        });

        // 3a. Single item budget ceiling
        const resHuge = await contextEngine.resolveContext({
            prompt: 'Analyze @file:huge.txt'
        });
        assert.ok(resHuge.totalTokens <= 2000, `Total tokens (${resHuge.totalTokens}) must NOT exceed budget (2000)`);
        assert.ok(resHuge.finalPrompt.includes('[Content Truncated to fit Context Budget]'), 'Prompt must contain budget truncation marker');

        // 3b. Quoted path with spaces and line ranges
        const resSpaced = await contextEngine.resolveContext({
            prompt: 'Check @file:"spaced file.txt":2-4'
        });
        assert.strictEqual(resSpaced.items[0].label, '@file:spaced file.txt:2-4');
        assert.ok(resSpaced.items[0].renderedText.includes('line 2\nline 3\nline 4'), 'Line range 2-4 must be extracted from quoted path');
        assert.ok(!resSpaced.items[0].renderedText.includes('line 1'), 'Line 1 must not be included when line range is 2-4');
        assert.ok(!resSpaced.items[0].renderedText.includes('line 5'), 'Line 5 must not be included when line range is 2-4');

        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('  ✓ Strict budget ceiling enforced for single oversized item and quoted paths resolved');
    }

    // 4. Regression: PermissionEngine session cancellation on interrupt
    {
        console.log('[Regression 4] PermissionEngine cancelSessionRequests');
        const eventBus = new EventBus();
        const permEngine = new PermissionEngine({ eventBus });

        let resolvedResult = null;
        const reqPromise = permEngine.requestPermission({
            sessionId: 'sess-interrupt-test',
            type: 'file_write',
            target: 'critical.js',
            isDestructive: true
        }).then(res => { resolvedResult = res; });

        assert.strictEqual(permEngine.pendingRequests.size, 1);

        // Cancel session requests immediately
        const cancelledCount = permEngine.cancelSessionRequests('sess-interrupt-test', 'Turn interrupted by user');
        assert.strictEqual(cancelledCount, 1);
        assert.strictEqual(permEngine.pendingRequests.size, 0);

        await reqPromise;
        assert.strictEqual(resolvedResult.approved, false);
        assert.strictEqual(resolvedResult.reason, 'Turn interrupted by user');
        console.log('  ✓ Pending permission request aborted cleanly on session interruption');
    }

    // 5. Regression: WorkspaceFileWatcher nested ignored directories filter
    {
        console.log('[Regression 5] WorkspaceFileWatcher Nested Directory Filtering');
        const fileWatcher = new WorkspaceFileWatcher({ rootPath: process.cwd() });
        let triggered = false;
        fileWatcher._processCoalescedChange = () => { triggered = true; };

        // Top level ignored
        fileWatcher._handleRawFsEvent('change', 'node_modules/pkg/index.js');
        assert.strictEqual(fileWatcher.pendingChanges.size, 0, 'Top level node_modules must be ignored');

        // Nested ignored
        fileWatcher._handleRawFsEvent('change', 'packages/client/node_modules/pkg/index.js');
        assert.strictEqual(fileWatcher.pendingChanges.size, 0, 'Nested node_modules must be ignored');

        fileWatcher._handleRawFsEvent('change', 'packages/client/dist/bundle.js');
        assert.strictEqual(fileWatcher.pendingChanges.size, 0, 'Nested dist must be ignored');

        fileWatcher._handleRawFsEvent('change', 'packages/client/.git/index');
        assert.strictEqual(fileWatcher.pendingChanges.size, 0, 'Nested .git must be ignored');

        fileWatcher._handleRawFsEvent('change', 'src/valid-file.js');
        assert.strictEqual(fileWatcher.pendingChanges.size, 1, 'Valid file must be tracked');

        fileWatcher.stop();
        console.log('  ✓ Nested .git, node_modules, and dist paths filtered accurately');
    }

    // 6. Regression: WorkspaceGit renamed paths and quotes
    {
        console.log('[Regression 6] WorkspaceGit getStatus Renamed Paths');
        const git = new WorkspaceGit({ rootPath: process.cwd() });
        // Test parsing directly via mock _execGit
        git._execGit = async (args) => {
            if (args[0] === 'branch') return { success: true, stdout: 'master\n' };
            if (args[0] === 'status') {
                return {
                    success: true,
                    stdout: [
                        'R  old/path.js -> new/path.js',
                        'R  "old with spaces.js" -> "new with spaces.js"',
                        'M  "path with spaces/file.js"',
                        '?? untracked.js'
                    ].join('\n')
                };
            }
            return { success: true, stdout: '' };
        };

        const status = await git.getStatus();
        assert.strictEqual(status.files.length, 4);
        assert.strictEqual(status.files[0].path, 'new/path.js', 'Renamed file must be indexed under its new destination path');
        assert.strictEqual(status.files[0].status, 'renamed');
        assert.strictEqual(status.files[1].path, 'new with spaces.js', 'Double-quoted renamed file must have quotes stripped cleanly');
        assert.strictEqual(status.files[1].status, 'renamed');
        assert.strictEqual(status.files[2].path, 'path with spaces/file.js', 'Quoted path must have quotes stripped');
        console.log('  ✓ Git renamed destination path extracted and surrounding quotes stripped');
    }

    // 7. Regression: VerificationRunner rapid abort/restart race condition defense
    {
        console.log('[Regression 7] VerificationRunner Rapid Abort/Restart Race Defense');
        const bus = new EventBus();
        const runner = new VerificationRunner({
            rootPath: process.cwd(),
            eventBus: bus
        });

        // Run 1: long running
        const run1Promise = runner.runVerification({ command: 'Start-Sleep -Seconds 3' });
        const run1Id = runner.activeRun.runId;

        // Cancel Run 1 immediately
        runner.cancel();

        // Run 2: shorter run started immediately
        const run2Promise = runner.runVerification({ command: 'Start-Sleep -Milliseconds 800; Write-Output "Run 2 Done"' });
        const run2Id = runner.activeRun.runId;

        // At 300ms, Run 1 terminates from taskkill in background while Run 2 is still running
        await new Promise(r => setTimeout(r, 400));
        assert.ok(runner.activeRun !== null, 'runner.activeRun must NOT be cleared by Run 1 background exit while Run 2 is running');
        assert.strictEqual(runner.activeRun.runId, run2Id, 'runner.activeRun must remain Run 2');

        const [res1, res2] = await Promise.all([run1Promise, run2Promise]);
        assert.strictEqual(res1.status, 'CANCELLED', 'Run 1 must be marked CANCELLED');
        assert.strictEqual(res2.status, 'PASSED', 'Run 2 must pass successfully');
        assert.strictEqual(runner.getLastResult().runId, run2Id, 'runner.lastResult must be Run 2');
        console.log('  ✓ VerificationRunner rapid abort/restart safely guarded against activeRun clobbering');
    }

    // 8. Regression: DiffManager.applyDiffSession concurrency mutex and idempotency
    {
        console.log('[Regression 8] DiffManager applyDiffSession Concurrency Mutex & Idempotency');
        const testDir = path.join(__dirname, '.test_concurrent_diff');
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'concurrent.txt'), 'const x = 1;\n');

        const revMgr = new RevisionManager();
        const fsService = new WorkspaceFilesystem({ rootPath: testDir, revisionManager: revMgr });
        const diffMgr = new DiffManager({ revisionManager: revMgr, fileService: fsService });

        const session = await diffMgr.createDiffSession({
            filePath: 'concurrent.txt',
            proposedContent: 'const x = 99;\n'
        });
        diffMgr.acceptHunk(session.id, session.hunks[0].id);

        // Concurrent apply calls (simulate simultaneous WebSocket messages or rapid double clicks)
        const [r1, r2] = await Promise.all([
            diffMgr.applyDiffSession(session.id),
            diffMgr.applyDiffSession(session.id)
        ]);

        assert.strictEqual(r1.id, session.id);
        assert.strictEqual(r2.id, session.id);
        assert.strictEqual(session.isApplied, true);

        // Third call after already applied should be idempotent and return session without throwing
        const r3 = await diffMgr.applyDiffSession(session.id);
        assert.strictEqual(r3.isApplied, true);

        const diskContent = fs.readFileSync(path.join(testDir, 'concurrent.txt'), 'utf8');
        assert.strictEqual(diskContent, 'const x = 99;\n');

        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('  ✓ Concurrent applyDiffSession calls synchronized and idempotent');
    }

    // 9. Regression: AntigravityManager and CodexManager compatibility aliases
    {
        console.log('[Regression 9] Subsystem Compatibility Aliases Contract');
        const antigravityManager = require('../src/server/antigravity-manager');
        const codexManager = require('../src/server/codex-manager');

        assert.strictEqual(typeof antigravityManager.sendLiveMessage, 'function', 'antigravityManager.sendLiveMessage must be a function');
        assert.strictEqual(typeof antigravityManager.sendUserPrompt, 'function', 'antigravityManager.sendUserPrompt must be a function');

        assert.strictEqual(typeof codexManager.sendPrompt, 'function', 'codexManager.sendPrompt must be a function');
        assert.strictEqual(typeof codexManager.sendMessage, 'function', 'codexManager.sendMessage must be a function');
        console.log('  ✓ Integration adapter aliases verified on underlying server managers');
    }

    // 10. Regression: AgentSessionManager releaseSessionAdvisories & stale advisory reclamation
    {
        console.log('[Regression 10] AgentSessionManager Advisory Release & Stale Reclamation');
        const { WorkspaceRuntime } = require('../src/workspace/workspace-runtime');
        const testDir = path.join(__dirname, '.test_advisory_mgmt');
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        fs.mkdirSync(testDir, { recursive: true });

        const runtime = new WorkspaceRuntime({
            workspaceId: 'ws-adv-test',
            rootPath: testDir,
            eventBus: new EventBus()
        });
        await runtime.initialize();

        const sess1 = runtime.agentManager.createSession({ name: 'Agent 1' });
        const sess2 = runtime.agentManager.createSession({ name: 'Agent 2' });

        // Acquire advisory for sess1
        const adv1 = runtime.agentManager.checkFileAdvisory('locked.js', sess1.sessionId);
        assert.strictEqual(adv1.hasAdvisoryConflict, false);

        // Sess2 gets warning
        sess1.setState('WORKING');
        const adv2 = runtime.agentManager.checkFileAdvisory('locked.js', sess2.sessionId);
        assert.strictEqual(adv2.hasAdvisoryConflict, true);

        // Releasing advisories for sess1
        const released = runtime.agentManager.releaseSessionAdvisories(sess1.sessionId);
        assert.strictEqual(released, 1);

        // Now sess2 can acquire without conflict
        const adv3 = runtime.agentManager.checkFileAdvisory('locked.js', sess2.sessionId);
        assert.strictEqual(adv3.hasAdvisoryConflict, false);

        // If sess2 becomes IDLE, sess1 should automatically reclaim stale lock without conflict
        sess2.setState('IDLE');
        const adv4 = runtime.agentManager.checkFileAdvisory('locked.js', sess1.sessionId);
        assert.strictEqual(adv4.hasAdvisoryConflict, false);

        runtime.shutdown();
        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('  ✓ Agent advisory session release and stale lock reclamation verified');
    }

    // 11. Regression: WorkspaceRuntime shutdown cleans up terminal sessions and permissions
    {
        console.log('[Regression 11] WorkspaceRuntime Shutdown Resource Cleanup');
        const { WorkspaceRuntime } = require('../src/workspace/workspace-runtime');
        const testDir = path.join(__dirname, '.test_shutdown_cleanup');
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        fs.mkdirSync(testDir, { recursive: true });

        const runtime = new WorkspaceRuntime({
            workspaceId: 'ws-shutdown-test',
            rootPath: testDir,
            eventBus: new EventBus()
        });
        await runtime.initialize();

        // Spawn a terminal session
        const termSess = runtime.terminalService.createSession({ name: 'ShutdownTerm' });
        assert.ok(runtime.terminalService.activeSessions.has(termSess.id));

        // Create a pending permission request
        let permResult = null;
        runtime.permissionEngine.requestPermission({
            sessionId: 'test-sess',
            type: 'command_exec',
            target: 'npm test'
        }).then(res => { permResult = res; });
        assert.strictEqual(runtime.permissionEngine.pendingRequests.size, 1);

        // Call shutdown
        runtime.shutdown();

        assert.strictEqual(runtime.status, 'SHUTDOWN');
        assert.strictEqual(runtime.terminalService.activeSessions.has(termSess.id), false, 'Terminal session must be killed on shutdown');
        assert.strictEqual(runtime.permissionEngine.pendingRequests.size, 0, 'Pending permissions must be cancelled on shutdown');

        await new Promise(r => setTimeout(r, 20));
        assert.ok(permResult !== null && permResult.approved === false, 'Pending permission request must resolve to rejected on shutdown');

        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('  ✓ WorkspaceRuntime shutdown cleaned up terminal sessions and pending permissions');
    }

    // 12. Regression: open-world-3d.js keyup isIntentionalTextInput logic
    {
        console.log('[Regression 12] Open World 3D keyup Focus Trapping Logic');
        const openWorldCode = fs.readFileSync(path.join(__dirname, '../public/js/open-world-3d.js'), 'utf8');
        // Ensure no "!isXterm" inversion exists in keyup listener
        assert.strictEqual(openWorldCode.includes('!isXterm && (tagName === \'INPUT\''), false, 'Inverted !isXterm check must be removed from keyup listener');
        assert.ok(openWorldCode.includes('const isIntentionalTextInput = (tagName === \'INPUT\' || tagName === \'TEXTAREA\' || !!target?.isContentEditable || isXterm);'), 'isIntentionalTextInput in keyup must include isXterm');
        console.log('  ✓ Open World 3D keyup focus trapping condition verified');
    }

    console.log('\n=== ALL TARGETED REGRESSION & FORENSIC SUITE TESTS PASSED 100%! ===');
    process.exit(0);
}

runRegressionSuite().catch(err => {
    console.error('\nREGRESSION SUITE FAILED:', err);
    process.exit(1);
});
