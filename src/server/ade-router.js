const express = require('express');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { defaultWorkspaceManager } = require('../workspace/workspace-manager');
const { defaultEventBus } = require('../events/event-bus');

const router = express.Router();
const workspaceRuntime = defaultWorkspaceManager.getDefaultWorkspace();

// 1. Workspace
router.get('/workspace', async (req, res) => {
    try {
        const info = await workspaceRuntime.getInfo();
        res.json({ success: true, workspace: info });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 2. Filesystem
router.get('/files/tree', async (req, res) => {
    try {
        const tree = await workspaceRuntime.fileService.listTree('', { maxDepth: 8 });
        res.json({ success: true, tree });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.get('/files/read', async (req, res) => {
    try {
        const filePath = req.query.path;
        if (!filePath) return res.status(400).json({ success: false, error: 'Path required' });
        const fileData = await workspaceRuntime.fileService.readFile(filePath);
        res.json({ success: true, file: fileData });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

router.post('/files/write', async (req, res) => {
    try {
        const { path: filePath, content, baseRevision, baseHash } = req.body;
        if (!filePath) return res.status(400).json({ success: false, error: 'Path required' });
        const result = await workspaceRuntime.fileService.writeFile(filePath, content, {
            baseRevision,
            baseHash,
            atomic: true,
            source: 'monaco_user'
        });
        res.json({ success: true, result });
    } catch (e) {
        if (e.code === 'ECONFLICT') {
            return res.status(409).json({ success: false, conflict: true, details: e.details, error: e.message });
        }
        res.status(400).json({ success: false, error: e.message });
    }
});

router.post('/files/create', async (req, res) => {
    try {
        const { path: filePath, content = '', isDirectory = false } = req.body;
        if (!filePath) return res.status(400).json({ success: false, error: 'Path required' });
        if (isDirectory) {
            await workspaceRuntime.fileService.createDirectory(filePath);
        } else {
            await workspaceRuntime.fileService.createFile(filePath, content);
        }
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

router.delete('/files/delete', async (req, res) => {
    try {
        const { path: filePath } = req.body;
        if (!filePath) return res.status(400).json({ success: false, error: 'Path required' });
        const result = await workspaceRuntime.fileService.deleteFile(filePath);
        res.json({ success: true, result });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

router.post('/files/rename', async (req, res) => {
    try {
        const { oldPath, newPath } = req.body;
        if (!oldPath || !newPath) return res.status(400).json({ success: false, error: 'Paths required' });
        const result = await workspaceRuntime.fileService.renameFile(oldPath, newPath);
        res.json({ success: true, result });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

router.post('/search', async (req, res) => {
    try {
        const { query, isRegex, isCaseSensitive, isWordMatch, includePattern, excludePattern, maxResults } = req.body;
        if (!query) {
            return res.json({ success: true, results: [], totalMatches: 0, totalFiles: 0 });
        }
        const searchResults = await workspaceRuntime.fileService.searchWorkspace({
            query,
            isRegex: isRegex === true,
            isCaseSensitive: isCaseSensitive === true,
            isWordMatch: isWordMatch === true,
            includePattern,
            excludePattern,
            maxResults: typeof maxResults === 'number' ? maxResults : 500
        });
        res.json({ success: true, ...searchResults });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// 3. Git Authority
router.get('/git/status', async (req, res) => {
    try {
        const status = await workspaceRuntime.gitService.getStatus();
        res.json({ success: true, status });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.get('/git/diff', async (req, res) => {
    try {
        const diff = await workspaceRuntime.gitService.getDiff(req.query.path || '', {
            cached: req.query.cached === 'true'
        });
        res.json({ success: true, diff });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.post('/git/stage', async (req, res) => {
    try {
        const { path: filePath } = req.body;
        await workspaceRuntime.gitService.stage(filePath);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.post('/git/unstage', async (req, res) => {
    try {
        const { path: filePath } = req.body;
        await workspaceRuntime.gitService.unstage(filePath);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.post('/git/commit', async (req, res) => {
    try {
        const { message } = req.body;
        await workspaceRuntime.gitService.commit(message);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// 4. Diff Authority
router.get('/diffs', (req, res) => {
    res.json({ success: true, sessions: workspaceRuntime.diffManager.listDiffSessions() });
});

router.get('/diffs/:id', (req, res) => {
    const diff = workspaceRuntime.diffManager.getDiffSession(req.params.id);
    if (!diff) return res.status(404).json({ success: false, error: 'Diff session not found' });
    res.json({ success: true, diff });
});

router.post('/diffs/:id/accept', async (req, res) => {
    try {
        const diff = await workspaceRuntime.diffManager.acceptFile(req.params.id);
        res.json({ success: true, diff });
    } catch (e) {
        res.status(409).json({ success: false, error: e.message });
    }
});

router.post('/diffs/:id/apply', async (req, res) => {
    try {
        const diff = await workspaceRuntime.diffManager.applyDiffSession(req.params.id);
        res.json({ success: true, diff });
    } catch (e) {
        res.status(409).json({ success: false, error: e.message });
    }
});

router.post('/diffs/:id/reject', (req, res) => {
    try {
        const diff = workspaceRuntime.diffManager.rejectFile(req.params.id);
        res.json({ success: true, diff });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

router.post('/diffs/:id/hunk/:hunkId/accept', (req, res) => {
    try {
        const diff = workspaceRuntime.diffManager.acceptHunk(req.params.id, req.params.hunkId);
        res.json({ success: true, diff });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

router.post('/diffs/:id/hunk/:hunkId/reject', (req, res) => {
    try {
        const diff = workspaceRuntime.diffManager.rejectHunk(req.params.id, req.params.hunkId);
        res.json({ success: true, diff });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// 5. Agent Sessions
router.get('/sessions', (req, res) => {
    res.json({
        success: true,
        sessions: workspaceRuntime.agentManager.listSessions(),
        activeSessionId: workspaceRuntime.agentManager.activeSessionId,
        adapters: workspaceRuntime.agentManager.getAdapters()
    });
});

router.post('/sessions', (req, res) => {
    try {
        const { providerId, name, model } = req.body;
        const newSession = workspaceRuntime.agentManager.createSession({ providerId, name, model });
        res.json({ success: true, session: { sessionId: newSession.sessionId, name: newSession.name } });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

router.post('/sessions/:id/switch', (req, res) => {
    try {
        workspaceRuntime.agentManager.setActiveSession(req.params.id);
        res.json({ success: true, activeSessionId: req.params.id });
    } catch (e) {
        res.status(404).json({ success: false, error: e.message });
    }
});

// 6. Permissions
router.get('/permissions/pending', (req, res) => {
    res.json({
        success: true,
        policy: workspaceRuntime.permissionEngine.getPolicy(),
        pending: workspaceRuntime.permissionEngine.getPendingRequests()
    });
});

router.post('/permissions/resolve', (req, res) => {
    const { requestId, decision, reason } = req.body;
    if (decision === 'APPROVED') {
        const ok = workspaceRuntime.permissionEngine.approve(requestId);
        res.json({ success: ok });
    } else {
        const ok = workspaceRuntime.permissionEngine.reject(requestId, reason);
        res.json({ success: ok });
    }
});

router.post('/permissions/policy', (req, res) => {
    try {
        workspaceRuntime.permissionEngine.setPolicy(req.body.policy);
        res.json({ success: true, policy: req.body.policy });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// 7. Verification
router.post('/verify', async (req, res) => {
    try {
        const { command, sessionId } = req.body;
        const result = await workspaceRuntime.verificationRunner.runVerification({ command, sessionId });
        res.json({ success: true, result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.get('/verify/last', (req, res) => {
    res.json({ success: true, result: workspaceRuntime.verificationRunner.getLastResult() });
});

// 7b. Test Discovery & Visual Test Runner
const CORE_SUITE_FILENAMES = new Set([
    'test-desktop-platform.js',
    'test-phase2-upgrades.js',
    'test-ade-runtime.js',
    'verify-terminal-close-and-nav.js',
    'verify-ade-instant-switch-and-model.js',
    'test-graphics-and-nametags.js',
    'test-mobile-ui-and-interactions.js'
]);

const suiteOutputsCache = new Map();

function classifyTestSuite(filename, content = '') {
    const fn = filename.toLowerCase();
    const txt = content.toLowerCase();

    // 1. ADE Core
    if (fn.includes('ade') || fn.includes('tab-separation') || fn.includes('monaco') || fn.includes('quick-open') || fn.includes('diff') || fn.includes('agent') || fn.includes('symbol')) {
        return 'ade_core';
    }
    // 2. Desktop Platform
    if (fn.includes('desktop') || fn.includes('power_pack') || fn.includes('terminal_v') || fn.includes('true_remote') || fn.includes('mobile-experience') || fn.includes('v46') || fn.includes('launcher')) {
        return 'desktop_platform';
    }
    // 3. Open World 3D
    if (fn.includes('world') || fn.includes('biome') || fn.includes('bicycle') || fn.includes('hilltop') || fn.includes('sitting') || fn.includes('landmark') || fn.includes('tatami') || fn.includes('graphics') || fn.includes('nametag') || fn.includes('photo') || fn.includes('physicality') || fn.includes('pier') || fn.includes('weather') || fn.includes('time-of-day')) {
        return 'open_world_3d';
    }
    // 4. Adversarial & Stress / Verification
    if (fn.includes('adversarial') || fn.includes('stress') || fn.includes('concurrency') || fn.includes('audit') || fn.includes('phase2') || fn.includes('upgrade') || fn.includes('proof')) {
        return 'adversarial_stress';
    }

    if (txt.includes('three') || txt.includes('terrain') || txt.includes('scene')) {
        return 'open_world_3d';
    }
    return 'adversarial_stress';
}

function extractSuiteMeta(filename, content) {
    let name = filename.replace(/\.(js|mjs)$/, '').replace(/[-_]/g, ' ');
    name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    let description = 'Automated verification test suite';
    const topComment = content.match(/^\s*(?:\/\*\*([\s\S]*?)\*\/|\/\/\s*(.*))/);
    if (topComment) {
        const raw = (topComment[1] || topComment[2] || '').trim();
        const firstLine = raw.split('\n')[0].replace(/^\s*\*?\s*/, '').trim();
        if (firstLine && firstLine.length > 5 && firstLine.length < 140) {
            description = firstLine;
        }
    }

    return { name, description };
}

function scanTestSuites() {
    const testDir = path.join(process.cwd(), 'test');
    if (!fs.existsSync(testDir)) return { categories: [], totalSuites: 0, coreSuitesCount: 0 };

    const files = fs.readdirSync(testDir).filter(f => {
        return (f.endsWith('.js') || f.endsWith('.mjs')) &&
               (f.startsWith('test') || f.startsWith('verify') || f.startsWith('e2e'));
    });

    const categoriesMap = {
        ade_core: { id: 'ade_core', name: 'ADE Core', icon: '💻', suites: [] },
        desktop_platform: { id: 'desktop_platform', name: 'Desktop Platform', icon: '🖥️', suites: [] },
        open_world_3d: { id: 'open_world_3d', name: 'Open World 3D', icon: '🌸', suites: [] },
        adversarial_stress: { id: 'adversarial_stress', name: 'Adversarial & Stress', icon: '⚡', suites: [] }
    };

    let coreCount = 0;
    files.forEach(filename => {
        const fullPath = path.join(testDir, filename);
        let content = '';
        try {
            content = fs.readFileSync(fullPath, 'utf8');
        } catch (_) {}

        const category = classifyTestSuite(filename, content);
        const { name, description } = extractSuiteMeta(filename, content);
        const isCore = CORE_SUITE_FILENAMES.has(filename);
        if (isCore) coreCount++;

        const suiteObj = {
            id: filename.replace(/\.(js|mjs)$/, ''),
            filename,
            name,
            category,
            description,
            isCore,
            estimatedDurationMs: 1200,
            status: 'idle',
            lastDurationMs: null
        };

        if (categoriesMap[category]) {
            categoriesMap[category].suites.push(suiteObj);
        } else {
            categoriesMap.adversarial_stress.suites.push(suiteObj);
        }
    });

    const categories = Object.values(categoriesMap);
    return { categories, totalSuites: files.length, coreSuitesCount: coreCount };
}

let activeTestRunState = null;

router.get('/tests/discovery', (req, res) => {
    try {
        const discovery = scanTestSuites();
        res.json({ success: true, ...discovery });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.get('/tests/output/:suiteId', (req, res) => {
    const { suiteId } = req.params;
    const output = suiteOutputsCache.get(suiteId) || '';
    res.json({ success: true, suiteId, output });
});

router.post('/tests/run', async (req, res) => {
    try {
        const { suiteId, filename, runAll = false, runCore = false, category: filterCat } = req.body || {};
        const discovery = scanTestSuites();
        let targetSuites = [];

        if (runCore) {
            discovery.categories.forEach(cat => {
                targetSuites.push(...cat.suites.filter(s => s.isCore));
            });
        } else if (runAll) {
            discovery.categories.forEach(cat => {
                targetSuites.push(...cat.suites);
            });
        } else if (filterCat) {
            const cat = discovery.categories.find(c => c.id === filterCat);
            if (cat) targetSuites.push(...cat.suites);
        } else if (filename) {
            const found = discovery.categories.flatMap(c => c.suites).find(s => s.filename === filename);
            if (found) targetSuites.push(found);
            else targetSuites.push({ id: filename, filename, name: filename, category: 'ade_core', isCore: false });
        } else if (suiteId) {
            const found = discovery.categories.flatMap(c => c.suites).find(s => s.id === suiteId);
            if (found) targetSuites.push(found);
        } else {
            // Default when no flags provided: run Core suites for speed and clarity
            discovery.categories.forEach(cat => {
                targetSuites.push(...cat.suites.filter(s => s.isCore));
            });
        }

        if (targetSuites.length === 0) {
            return res.status(400).json({ success: false, error: 'No matching test suites found to run' });
        }

        const runId = `testrun-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        activeTestRunState = {
            runId,
            total: targetSuites.length,
            completed: 0,
            passed: 0,
            failed: 0,
            startTime: Date.now(),
            suites: targetSuites
        };

        // Notify start of test run
        defaultEventBus.emitEvent('test_run_started', {
            runId,
            totalSuites: targetSuites.length,
            suites: targetSuites.map(s => ({ id: s.id, filename: s.filename, name: s.name, category: s.category }))
        }, { source: 'tests' });

        // Execute suites asynchronously
        (async () => {
            const suiteResults = [];
            const activeTerms = workspaceRuntime.terminalService.listSessions();
            const targetTermId = activeTerms.length > 0 ? activeTerms[0].id : null;

            for (const suite of targetSuites) {
                const startTime = Date.now();
                const testFilePath = path.join(process.cwd(), 'test', suite.filename);

                defaultEventBus.emitEvent('test_suite_started', {
                    runId,
                    suiteId: suite.id,
                    filename: suite.filename,
                    name: suite.name,
                    category: suite.category
                }, { source: 'tests' });

                const resResult = await new Promise((resolve) => {
                    const proc = spawn(process.execPath, [testFilePath], {
                        cwd: process.cwd(),
                        env: { ...process.env, CI: 'true', FORCE_COLOR: '1' }
                    });

                    let outputBuffer = '';
                    const handleData = (chunk) => {
                        const str = chunk.toString();
                        outputBuffer += str;
                        defaultEventBus.emitEvent('test_suite_output', {
                            runId,
                            suiteId: suite.id,
                            data: str
                        }, { source: 'tests' });

                        if (targetTermId && workspaceRuntime.terminalService) {
                            defaultEventBus.emitEvent('terminal_output', {
                                terminalId: targetTermId,
                                data: str
                            }, { source: 'terminal' });
                        }
                    };

                    proc.stdout.on('data', handleData);
                    proc.stderr.on('data', handleData);

                    proc.on('close', (code) => {
                        const durationMs = Date.now() - startTime;
                        const passed = code === 0;

                        let passCount = 0;
                        let failCount = 0;
                        const passMatch = outputBuffer.match(/(\d+)\s+(?:passing|passed|assertions\s+passed)/i);
                        const failMatch = outputBuffer.match(/(\d+)\s+(?:failing|failed|assertions\s+failed)/i);
                        if (passMatch) passCount = parseInt(passMatch[1], 10);
                        if (failMatch) failCount = parseInt(failMatch[1], 10);

                        // Cache in memory for quick retrieval
                        suiteOutputsCache.set(suite.id, outputBuffer);

                        // Extract readable error snippet if failed
                        let errorSnippet = '';
                        if (!passed) {
                            const lines = outputBuffer.split(/\r?\n/).filter(l => l.trim().length > 0);
                            const errLines = lines.filter(l => /error|fail|exception|assert|rejected|stack/i.test(l));
                            errorSnippet = (errLines.length > 0 ? errLines.slice(-6) : lines.slice(-6)).join('\n');
                        }

                        const r = {
                            runId,
                            suiteId: suite.id,
                            filename: suite.filename,
                            category: suite.category,
                            isCore: suite.isCore,
                            passed,
                            exitCode: code,
                            durationMs,
                            passCount: passed && passCount === 0 ? 1 : passCount,
                            failCount: !passed && failCount === 0 ? 1 : failCount,
                            summary: passed ? `PASSED (${durationMs}ms)` : `FAILED with code ${code} (${durationMs}ms)`,
                            output: outputBuffer,
                            errorSnippet
                        };
                        defaultEventBus.emitEvent('test_suite_completed', r, { source: 'tests' });
                        resolve(r);
                    });

                    proc.on('error', (err) => {
                        const durationMs = Date.now() - startTime;
                        const errMsg = `Failed to spawn: ${err.message}`;
                        suiteOutputsCache.set(suite.id, errMsg);
                        const r = {
                            runId,
                            suiteId: suite.id,
                            filename: suite.filename,
                            category: suite.category,
                            isCore: suite.isCore,
                            passed: false,
                            exitCode: -1,
                            durationMs,
                            passCount: 0,
                            failCount: 1,
                            summary: errMsg,
                            output: errMsg,
                            errorSnippet: errMsg
                        };
                        defaultEventBus.emitEvent('test_suite_completed', r, { source: 'tests' });
                        resolve(r);
                    });
                });

                suiteResults.push(resResult);
                if (resResult.passed) activeTestRunState.passed++;
                else activeTestRunState.failed++;
                activeTestRunState.completed++;
            }

            const totalDuration = Date.now() - activeTestRunState.startTime;
            const allPassed = suiteResults.every(r => r.passed);
            const runFinishedResult = {
                runId,
                passed: allPassed,
                totalCount: suiteResults.length,
                passedCount: suiteResults.filter(r => r.passed).length,
                failedCount: suiteResults.filter(r => !r.passed).length,
                durationMs: totalDuration,
                results: suiteResults
            };

            defaultEventBus.emitEvent('test_run_finished', runFinishedResult, { source: 'tests' });

            // Synchronize verification runner state & weather
            const vStatus = allPassed ? 'PASSED' : 'FAILED';
            workspaceRuntime.verificationRunner.lastResult = {
                runId,
                status: vStatus,
                exitCode: allPassed ? 0 : 1,
                passCount: suiteResults.reduce((sum, r) => sum + r.passCount, 0),
                failCount: suiteResults.reduce((sum, r) => sum + r.failCount, 0),
                durationMs: totalDuration,
                summary: `Test suites: ${suiteResults.filter(r => r.passed).length}/${suiteResults.length} passed (${totalDuration}ms)`,
                completedAt: Date.now()
            };
            defaultEventBus.emitEvent('verification_completed', workspaceRuntime.verificationRunner.lastResult, { source: 'verification' });
        })().catch(err => {
            console.error('[AdeRouter] Test run execution failed:', err);
        });

        res.json({
            success: true,
            runId,
            totalSuites: targetSuites.length,
            suites: targetSuites.map(s => ({ id: s.id, filename: s.filename, name: s.name }))
        });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

router.get('/tests/status', (req, res) => {
    res.json({
        success: true,
        activeRun: activeTestRunState,
        lastVerification: workspaceRuntime.verificationRunner.getLastResult()
    });
});

// 8. Terminal
router.get('/terminals', (req, res) => {
    res.json({ success: true, sessions: workspaceRuntime.terminalService.listSessions() });
});

router.get('/terminals/last-error', (req, res) => {
    const err = workspaceRuntime.terminalService.extractLastError(req.query.terminalId);
    res.json({ success: true, errorInfo: err });
});

module.exports = router;
