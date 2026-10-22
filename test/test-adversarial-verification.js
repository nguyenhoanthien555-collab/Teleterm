const assert = require('assert');
const path = require('path');
const fs = require('fs');

const { EventBus } = require('../src/events/event-bus');
const { RevisionManager } = require('../src/diffs/revision-manager');
const { computeLineDiff, DiffManager, reconstructContentFromHunks } = require('../src/diffs/diff-manager');
const { WorkspaceFilesystem } = require('../src/filesystem/workspace-filesystem');
const { PermissionEngine, PERMISSION_POLICIES } = require('../src/permissions/permission-engine');
const { WorkspaceRuntime } = require('../src/workspace/workspace-runtime');

async function runAdversarialSuite() {
    console.log('=== RUNNING TELETERM ADE ADVERSARIAL & HARDENING SUITE ===\n');

    // 1. ADVERSARIAL HUNK RECONSTRUCTION
    {
        console.log('[Adversarial 1] 3-Hunk Selective Application (Accept A, Reject B, Accept C)');
        const testDir = path.join(__dirname, '.test_adv_hunks');
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        fs.mkdirSync(testDir, { recursive: true });

        const original = [
            '// SECTION 1: Config',
            'const PORT = 3000;',
            'const HOST = "localhost";',
            '// Context line 1',
            '// Context line 2',
            '// Context line 3',
            '// Context line 4',
            '// Context line 5',
            '// Context line 6',
            '// Context line 7',
            '// SECTION 2: Middleware',
            'app.use(logger);',
            'app.use(auth);',
            '// Context line 8',
            '// Context line 9',
            '// Context line 10',
            '// Context line 11',
            '// Context line 12',
            '// Context line 13',
            '// Context line 14',
            '// SECTION 3: Routes',
            'app.get("/api", handler);',
            'app.post("/api", handler);'
        ].join('\n');

        const proposed = [
            '// SECTION 1: Config',
            'const PORT = 8080; // MODIFIED A',
            'const HOST = "0.0.0.0"; // MODIFIED A',
            '// Context line 1',
            '// Context line 2',
            '// Context line 3',
            '// Context line 4',
            '// Context line 5',
            '// Context line 6',
            '// Context line 7',
            '// SECTION 2: Middleware',
            'app.use(evilMiddleware); // MODIFIED B',
            'app.use(bypassAuth); // MODIFIED B',
            '// Context line 8',
            '// Context line 9',
            '// Context line 10',
            '// Context line 11',
            '// Context line 12',
            '// Context line 13',
            '// Context line 14',
            '// SECTION 3: Routes',
            'app.get("/api/v2", handlerV2); // MODIFIED C',
            'app.post("/api/v2", handlerV2); // MODIFIED C'
        ].join('\n');

        fs.writeFileSync(path.join(testDir, 'server.js'), original);

        const revMgr = new RevisionManager();
        const fsService = new WorkspaceFilesystem({ rootPath: testDir, revisionManager: revMgr });
        const diffMgr = new DiffManager({ revisionManager: revMgr, fileService: fsService });

        const session = await diffMgr.createDiffSession({
            filePath: 'server.js',
            proposedContent: proposed
        });

        assert.strictEqual(session.hunks.length, 3, 'Must identify 3 distinct hunks');

        // Accept A (hunk 0), Reject B (hunk 1), Accept C (hunk 2)
        diffMgr.acceptHunk(session.id, session.hunks[0].id);
        diffMgr.rejectHunk(session.id, session.hunks[1].id);
        diffMgr.acceptHunk(session.id, session.hunks[2].id);

        await diffMgr.applyDiffSession(session.id);

        const resultText = fs.readFileSync(path.join(testDir, 'server.js'), 'utf8');
        assert.ok(resultText.includes('const PORT = 8080;'), 'Hunk A change must be present');
        assert.ok(resultText.includes('app.use(logger);'), 'Hunk B original must be preserved');
        assert.ok(!resultText.includes('app.use(evilMiddleware);'), 'Hunk B change must NOT be present');
        assert.ok(resultText.includes('app.get("/api/v2", handlerV2);'), 'Hunk C change must be present');

        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('  ✓ 3-Hunk Selective Application passed: rejected modifications omitted, accepted modifications applied');
    }

    // 2. ADVERSARIAL PATH TRAVERSAL VARIATIONS
    {
        console.log('[Adversarial 2] Exhaustive Path Traversal Vector Defense');
        const testDir = path.join(__dirname, '.test_adv_paths');
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        fs.mkdirSync(testDir, { recursive: true });

        const fsService = new WorkspaceFilesystem({ rootPath: testDir });

        const attackVectors = [
            '../secret.txt',
            '..\\secret.txt',
            '../../../../etc/passwd',
            '..\\.test_adv_paths_backup\\credentials.json',
            'sub/../../outside.txt',
            'C:/Windows/System32/drivers/etc/hosts',
            '\\\\.\\CON'
        ];

        for (const vector of attackVectors) {
            let blocked = false;
            try {
                fsService.resolvePath(vector);
            } catch (e) {
                if (e.code === 'ERR_PATH_TRAVERSAL') blocked = true;
            }
            assert.strictEqual(blocked, true, `Attack vector '${vector}' must be blocked by boundary check`);
        }

        fs.rmSync(testDir, { recursive: true, force: true });
        console.log(`  ✓ All ${attackVectors.length} path traversal attack vectors rejected with ERR_PATH_TRAVERSAL`);
    }

    // 3. ATOMIC WRITE FAILURE CLEANUP
    {
        console.log('[Adversarial 3] Atomic Write Temp File Cleanup on Error');
        const testDir = path.join(__dirname, '.test_adv_atomic');
        if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'target.txt'), 'original content');

        const revMgr = new RevisionManager();
        const fsService = new WorkspaceFilesystem({ rootPath: testDir, revisionManager: revMgr });

        // Record revision 1
        await fsService.readFile('target.txt');

        // Intentionally create a conflict to verify write is aborted before disk mutation
        let threwConflict = false;
        try {
            await fsService.writeFile('target.txt', 'mutated content', {
                baseRevision: 999, // stale revision
                baseHash: '0000000000000000000000000000000000000000000000000000000000000000'
            });
        } catch (e) {
            if (e.code === 'ECONFLICT') threwConflict = true;
        }

        assert.strictEqual(threwConflict, true, 'Write must reject conflict');
        assert.strictEqual(fs.readFileSync(path.join(testDir, 'target.txt'), 'utf8'), 'original content', 'File content must remain unchanged');

        // Verify no leftover .tmp files
        const files = fs.readdirSync(testDir);
        const tempFiles = files.filter(f => f.startsWith('.tmp.'));
        assert.strictEqual(tempFiles.length, 0, 'No leftover temporary files should exist');

        fs.rmSync(testDir, { recursive: true, force: true });
        console.log('  ✓ Atomic write conflict protection and temp cleanup verified');
    }

    // 4. MULTI-CLIENT EVENT BUS REPLAY BUFFER INTEGRITY
    {
        console.log('[Adversarial 4] Ring Buffer Overflow and Sequential Gap Detection');
        const bus = new EventBus({ maxBufferSize: 20 });

        // Emit 50 events to wrap the ring buffer multiple times
        for (let i = 1; i <= 50; i++) {
            bus.emitEvent('ping', { count: i });
        }

        assert.strictEqual(bus.getCurrentSequence(), 50);

        // Client reconnects asking for events since sequence 35
        const replay = bus.getEventsSince(35);
        assert.strictEqual(replay.length, 15);
        assert.strictEqual(replay[0].sequence, 36);
        assert.strictEqual(replay[replay.length - 1].sequence, 50);

        // Verify strictly monotonic ordering
        for (let i = 1; i < replay.length; i++) {
            assert.strictEqual(replay[i].sequence, replay[i - 1].sequence + 1);
        }

        console.log('  ✓ Ring buffer wrap-around, replay, and monotonic sequence verified');
    }

    console.log('\n=== ALL ADVERSARIAL & HARDENING SUITE TESTS PASSED 100%! ===');
}

runAdversarialSuite().catch(err => {
    console.error('Adversarial Test Failed:', err);
    process.exit(1);
});
