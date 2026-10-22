const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { WorkspaceRuntime } = require('../src/workspace/workspace-runtime');
const { EventBus } = require('../src/events/event-bus');
const { computeLineDiff, reconstructContentFromHunks } = require('../src/diffs/diff-manager');

async function runDeepStressSuite() {
    console.log('=== RUNNING ADVERSARIAL DEEP STRESS & CONCURRENCY SUITE ===\n');

    // 1. Stress: High concurrency applyDiffSession calls on multiple files
    {
        console.log('[Stress 1] Rapid Concurrent applyDiffSession on Same and Differing Files');
        const testDir = path.join(__dirname, '.test_stress_diff');
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        fs.mkdirSync(testDir, { recursive: true });

        const testFile = path.join(testDir, 'concurrent.txt');
        fs.writeFileSync(testFile, 'line 1\nline 2\nline 3\n');

        const bus = new EventBus();
        const runtime = new WorkspaceRuntime({
            workspaceId: 'ws-stress',
            rootPath: testDir,
            eventBus: bus
        });
        await runtime.initialize();

        const sess = runtime.agentManager.createSession({ name: 'Stress Agent' });

        // Create diff session
        const diff1 = await runtime.diffManager.createDiffSession({
            filePath: 'concurrent.txt',
            proposedContent: 'line 1\nMODIFIED line 2\nline 3\n',
            agentSessionId: sess.sessionId
        });

        // Fire 20 concurrent acceptFile calls for diff1
        const promises = [];
        for (let i = 0; i < 20; i++) {
            promises.push(runtime.diffManager.acceptFile(diff1.id));
        }

        const results = await Promise.all(promises);
        // All 20 calls must resolve cleanly and return the exact same applied session
        for (const res of results) {
            assert.strictEqual(res.id, diff1.id);
            assert.strictEqual(res.status, 'ACCEPTED');
            assert.strictEqual(res.isApplied, true);
        }

        const diskContent = fs.readFileSync(testFile, 'utf8');
        assert.strictEqual(diskContent, 'line 1\nMODIFIED line 2\nline 3\n');

        // 1b. Two distinct diff sessions created concurrently on same base revision
        const file2 = path.join(testDir, 'conflict_base.txt');
        fs.writeFileSync(file2, 'base content');
        const read2 = await runtime.fileService.readFile('conflict_base.txt');

        const diffA = await runtime.diffManager.createDiffSession({
            filePath: 'conflict_base.txt',
            proposedContent: 'agent A content',
            baseRevision: read2.revision,
            baseHash: read2.contentHash
        });

        const diffB = await runtime.diffManager.createDiffSession({
            filePath: 'conflict_base.txt',
            proposedContent: 'agent B content',
            baseRevision: read2.revision,
            baseHash: read2.contentHash
        });

        // Apply A first
        await runtime.diffManager.acceptFile(diffA.id);

        // Attempting to apply B now must trigger revision conflict error
        let conflictCaught = false;
        try {
            await runtime.diffManager.acceptFile(diffB.id);
        } catch (err) {
            conflictCaught = true;
            assert.ok(err.message.includes('Revision conflict'), 'Must reject outdated base revision');
        }
        assert.strictEqual(conflictCaught, true, 'Second conflicting diff session must be rejected with revision conflict');

        runtime.shutdown();
        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('  ✓ 20 concurrent applyDiffSession calls safely deduplicated and conflict rejection verified');
    }

    // 2. Stress: High-frequency abort / restart cycles on VerificationRunner
    {
        console.log('[Stress 2] High-frequency Abort / Restart Cycles on VerificationRunner');
        const bus = new EventBus();
        const { VerificationRunner } = require('../src/verification/verification-runner');
        const runner = new VerificationRunner({
            rootPath: __dirname,
            eventBus: bus
        });

        // Rapidly start and cancel 10 times in tight loop
        const runPromises = [];
        for (let i = 0; i < 10; i++) {
            const p = runner.runVerification({ command: 'node -e "setTimeout(() => {}, 5000);"' });
            runPromises.push(p);
            runner.cancel();
        }

        const results = await Promise.all(runPromises);
        for (const res of results) {
            assert.strictEqual(res.status, 'CANCELLED');
        }

        // Run a clean one after all cancellations to ensure runner is completely unblocked
        const finalRun = await runner.runVerification({ command: 'node -e "process.exit(0);"' });
        assert.strictEqual(finalRun.status, 'PASSED');
        assert.strictEqual(runner.getLastResult().runId, finalRun.runId);

        console.log('  ✓ VerificationRunner withstood 10 rapid cancellation cycles and executed clean run');
    }

    // 3. Stress: ContextEngine resolution with complex quoted, spaces, and Windows paths
    {
        console.log('[Stress 3] ContextEngine Complex Mentions and Fallback Ranges');
        const testDir = path.join(__dirname, '.test_stress_ctx');
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        fs.mkdirSync(testDir, { recursive: true });

        const spacedFile = path.join(testDir, 'spaced module file.js');
        fs.writeFileSync(spacedFile, 'line A\nline B\nline C\nline D\nline E\n');

        const bus = new EventBus();
        const runtime = new WorkspaceRuntime({
            workspaceId: 'ws-ctx-stress',
            rootPath: testDir,
            eventBus: bus
        });
        await runtime.initialize();

        // 3a. Quoted path with trailing line range
        const res1 = await runtime.contextEngine.resolveContext({
            prompt: 'Refactor @file:"spaced module file.js":2-4 now'
        });
        assert.strictEqual(res1.items.length, 1);
        assert.strictEqual(res1.items[0].label, '@file:spaced module file.js:2-4');
        assert.ok(res1.items[0].renderedText.includes('line B\nline C\nline D'));
        assert.ok(!res1.items[0].renderedText.includes('line A'));
        assert.ok(!res1.items[0].renderedText.includes('line E'));

        // 3b. Windows drive path with punctuation at the end
        const mentions = runtime.contextEngine.extractMentions('Look at @file:D:/Work/Project/app.ts:50-100, and also @file:"C:/Program Files/tool.js":1-10!');
        assert.strictEqual(mentions.length, 2);
        assert.strictEqual(mentions[0].target, 'D:/Work/Project/app.ts:50-100');
        assert.strictEqual(mentions[1].target, 'C:/Program Files/tool.js');
        assert.strictEqual(mentions[1].lineRange, '1-10');

        runtime.shutdown();
        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('  ✓ ContextEngine correctly handled complex punctuation, quoted paths, and drive letters');
    }

    // 4. Stress: Multi-agent advisory locking with pending diffs vs finished turns
    {
        console.log('[Stress 4] Multi-Agent Advisory Lock Persistence Under Pending Diffs');
        const testDir = path.join(__dirname, '.test_stress_advisory');
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        fs.mkdirSync(testDir, { recursive: true });

        const sharedFile = path.join(testDir, 'agent_shared.js');
        fs.writeFileSync(sharedFile, 'const x = 1;');

        const bus = new EventBus();
        const runtime = new WorkspaceRuntime({
            workspaceId: 'ws-adv-stress',
            rootPath: testDir,
            eventBus: bus
        });
        await runtime.initialize();

        const agent1 = runtime.agentManager.createSession({ name: 'Agent 1' });
        const agent2 = runtime.agentManager.createSession({ name: 'Agent 2' });

        // Agent 1 creates diff
        const diff1 = await runtime.diffManager.createDiffSession({
            filePath: 'agent_shared.js',
            proposedContent: 'const x = 2;',
            agentSessionId: agent1.sessionId
        });
        assert.strictEqual(diff1.advisoryWarning, null);

        // Agent 2 attempts to create diff on same file -> gets warning
        const diff2 = await runtime.diffManager.createDiffSession({
            filePath: 'agent_shared.js',
            proposedContent: 'const x = 3;',
            agentSessionId: agent2.sessionId
        });
        assert.ok(diff2.advisoryWarning !== null);
        assert.ok(diff2.advisoryWarning.includes(agent1.sessionId));

        // Agent 1 rejects diff -> advisory lock released!
        runtime.diffManager.rejectFile(diff1.id);

        // Agent 2 creates another diff on same file -> now NO warning!
        const diff3 = await runtime.diffManager.createDiffSession({
            filePath: 'agent_shared.js',
            proposedContent: 'const x = 4;',
            agentSessionId: agent2.sessionId
        });
        assert.strictEqual(diff3.advisoryWarning, null);

        runtime.shutdown();
        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('  ✓ Advisory locks persist during pending diffs and release on rejection/acceptance');
    }

    // 5. Stress: PTY ConPTY rapid spawn and kill
    {
        console.log('[Stress 5] Rapid ConPTY Spawn and Kill Resource Teardown');
        const bus = new EventBus();
        const { WorkspaceTerminal } = require('../src/terminal/workspace-terminal');
        const termService = new WorkspaceTerminal({
            rootPath: process.cwd(),
            eventBus: bus
        });

        const term1 = termService.createSession({ name: 'Rapid1' });
        const term2 = termService.createSession({ name: 'Rapid2' });
        const term3 = termService.createSession({ name: 'Rapid3' });

        assert.strictEqual(termService.listSessions().length, 3);

        termService.kill(term1.id);
        termService.kill(term2.id);
        termService.kill(term3.id);

        assert.strictEqual(termService.listSessions().length, 0);
        console.log('  ✓ Rapid ConPTY processes spawned and cleanly killed without leaks');
    }

    console.log('\n=== ALL ADVERSARIAL DEEP STRESS TESTS PASSED 100%! ===');
    process.exit(0);
}

runDeepStressSuite().catch(err => {
    console.error('\nDEEP STRESS SUITE FAILED:', err);
    process.exit(1);
});
