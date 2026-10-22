const crypto = require('crypto');

/**
 * Line Diff & Hunk Generation Utility
 * Optimized with common prefix/suffix trimming, empty string normalization,
 * and edit-operation tracking for accurate partial hunk reconstruction.
 */
function computeLineDiff(originalText, proposedText) {
    const origLines = (originalText === '' || originalText === null || originalText === undefined) ? [] : originalText.split('\n');
    const propLines = (proposedText === '' || proposedText === null || proposedText === undefined) ? [] : proposedText.split('\n');

    let prefix = 0;
    while (prefix < origLines.length && prefix < propLines.length && origLines[prefix] === propLines[prefix]) {
        prefix++;
    }

    let suffix = 0;
    while (suffix < (origLines.length - prefix) && suffix < (propLines.length - prefix) &&
           origLines[origLines.length - 1 - suffix] === propLines[propLines.length - 1 - suffix]) {
        suffix++;
    }

    const midOrig = origLines.slice(prefix, origLines.length - suffix);
    const midProp = propLines.slice(prefix, propLines.length - suffix);

    const n = midOrig.length;
    const m = midProp.length;
    const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (midOrig[i] === midProp[j]) {
                dp[i + 1][j + 1] = dp[i][j] + 1;
            } else {
                dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    let i = n, j = m;
    const midEdits = [];
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && midOrig[i - 1] === midProp[j - 1]) {
            midEdits.push({ type: 'context', line: midOrig[i - 1], origIdx: prefix + i - 1, propIdx: prefix + j - 1 });
            i--; j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            midEdits.push({ type: 'add', line: midProp[j - 1], propIdx: prefix + j - 1 });
            j--;
        } else if (i > 0) {
            midEdits.push({ type: 'del', line: midOrig[i - 1], origIdx: prefix + i - 1 });
            i--;
        }
    }
    midEdits.reverse();

    const prefixEdits = origLines.slice(0, prefix).map((line, idx) => ({
        type: 'context', line, origIdx: idx, propIdx: idx
    }));

    const suffixEdits = origLines.slice(origLines.length - suffix).map((line, idx) => ({
        type: 'context', line, origIdx: origLines.length - suffix + idx, propIdx: propLines.length - suffix + idx
    }));

    const edits = [...prefixEdits, ...midEdits, ...suffixEdits];

    // Find all diff indices (add or del)
    const diffIndices = [];
    for (let k = 0; k < edits.length; k++) {
        if (edits[k].type === 'add' || edits[k].type === 'del') {
            diffIndices.push(k);
        }
    }

    if (diffIndices.length === 0) {
        const emptyHunks = [];
        emptyHunks._edits = edits;
        return emptyHunks;
    }

    // Group diff indices into clusters where gap <= 3
    const clusters = [];
    let curCluster = [diffIndices[0]];
    for (let c = 1; c < diffIndices.length; c++) {
        const prev = diffIndices[c - 1];
        const curr = diffIndices[c];
        if (curr - prev - 1 <= 3) {
            curCluster.push(curr);
        } else {
            clusters.push(curCluster);
            curCluster = [curr];
        }
    }
    clusters.push(curCluster);

    const hunks = [];
    let prevHunkEnd = -1;

    for (let cIdx = 0; cIdx < clusters.length; cIdx++) {
        const cluster = clusters[cIdx];
        const firstDiff = cluster[0];
        const lastDiff = cluster[cluster.length - 1];

        // Leading context: up to 3 lines before first diff, strictly after prevHunkEnd
        const leadStart = Math.max(prevHunkEnd + 1, firstDiff - 3);

        // Trailing context: up to 3 lines after last diff, leaving room for next hunk's leading context
        let trailEnd = Math.min(edits.length - 1, lastDiff + 3);
        if (cIdx + 1 < clusters.length) {
            const nextFirstDiff = clusters[cIdx + 1][0];
            const nextLeadCount = Math.min(3, nextFirstDiff - 1 - lastDiff);
            trailEnd = Math.min(trailEnd, nextFirstDiff - 1 - nextLeadCount);
        }

        const hunkLines = [];
        for (let k = leadStart; k <= trailEnd; k++) {
            hunkLines.push({ type: edits[k].type, content: edits[k].line });
        }

        let oldStart = 1;
        let newStart = 1;
        for (let k = leadStart; k <= trailEnd; k++) {
            if (edits[k].origIdx !== undefined) {
                oldStart = Math.max(1, edits[k].origIdx + 1 - (k - leadStart));
                break;
            }
        }
        for (let k = leadStart; k <= trailEnd; k++) {
            if (edits[k].propIdx !== undefined) {
                newStart = Math.max(1, edits[k].propIdx + 1 - (k - leadStart));
                break;
            }
        }

        hunks.push({
            id: `hunk-${cIdx}`,
            oldStart,
            newStart,
            lines: hunkLines,
            status: 'PENDING',
            editStart: leadStart,
            editEnd: trailEnd
        });

        prevHunkEnd = trailEnd;
    }

    hunks._edits = edits;
    return hunks;
}

/**
 * Reconstruct content by applying accepted hunks and keeping rejected hunks as original.
 */
function reconstructContentFromHunks(originalContent, hunks, edits) {
    if (!edits || edits.length === 0) {
        const h = computeLineDiff(originalContent, '');
        edits = h._edits;
    }

    const editHunkMap = new Map();
    for (const hunk of hunks) {
        for (let idx = hunk.editStart; idx <= hunk.editEnd; idx++) {
            editHunkMap.set(idx, hunk);
        }
    }

    const resultLines = [];
    for (let k = 0; k < edits.length; k++) {
        const edit = edits[k];
        const hunk = editHunkMap.get(k);

        if (!hunk) {
            if (edit.type === 'context') {
                resultLines.push(edit.line);
            }
        } else {
            const isAccepted = hunk.status === 'ACCEPTED';
            if (isAccepted) {
                if (edit.type === 'context' || edit.type === 'add') {
                    resultLines.push(edit.line);
                }
            } else {
                if (edit.type === 'context' || edit.type === 'del') {
                    resultLines.push(edit.line);
                }
            }
        }
    }

    return resultLines.join('\n');
}

/**
 * TeleTerm Diff Authority Manager
 * Manages atomic diff sessions, individual hunk accept/reject,
 * and deterministic atomic application.
 */
class DiffManager {
    constructor({ revisionManager, eventBus, fileService, workspaceRuntime = null }) {
        this.revisionManager = revisionManager;
        this.eventBus = eventBus;
        this.fileService = fileService;
        this.workspaceRuntime = workspaceRuntime;
        this.sessions = new Map(); // Map<diffSessionId, DiffSession>
    }

    setWorkspaceRuntime(workspaceRuntime) {
        this.workspaceRuntime = workspaceRuntime;
    }

    /**
     * Create a new diff proposal session
     */
    async createDiffSession({ filePath, proposedContent, baseRevision, baseHash, agentSessionId = null }) {
        const relPath = this.fileService.normalizeRelPath(filePath);

        // Check Multi-Agent Advisory File Locking (Slice 6)
        let advisoryConflict = null;
        if (this.workspaceRuntime && this.workspaceRuntime.agentManager && agentSessionId) {
            advisoryConflict = this.workspaceRuntime.agentManager.checkFileAdvisory(relPath, agentSessionId);
            if (advisoryConflict.hasAdvisoryConflict && this.eventBus) {
                this.eventBus.emitEvent('agent_advisory_conflict', {
                    filePath: relPath,
                    proposingSessionId: agentSessionId,
                    ownerSessionId: advisoryConflict.ownerSessionId,
                    message: advisoryConflict.message
                }, { sessionId: agentSessionId, source: 'diff_authority' });
            }
        }

        // Read current disk content
        let originalContent = '';
        try {
            const readRes = await this.fileService.readFile(relPath);
            originalContent = readRes.content || '';
            if (baseHash === undefined || baseHash === null) baseHash = readRes.contentHash;
            if (baseRevision === undefined || baseRevision === null) baseRevision = readRes.revision;
        } catch (e) {
            // File might be newly created by agent
            originalContent = '';
        }

        const hunks = computeLineDiff(originalContent, proposedContent);
        const edits = hunks._edits || [];
        const id = `diff-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const session = {
            id,
            filePath: relPath,
            baseRevision,
            baseHash,
            originalContent,
            proposedContent,
            hunks,
            edits,
            status: 'PENDING', // PENDING, ACCEPTED, REJECTED, PARTIAL, CONFLICTED
            agentSessionId,
            advisoryWarning: advisoryConflict && advisoryConflict.hasAdvisoryConflict ? advisoryConflict.message : null,
            createdAt: Date.now()
        };

        this.sessions.set(id, session);

        if (this.eventBus) {
            this.eventBus.emitEvent('diff_created', {
                diffId: id,
                filePath: relPath,
                hunkCount: hunks.length,
                agentSessionId,
                advisoryWarning: session.advisoryWarning
            }, { sessionId: agentSessionId, source: 'diff_authority' });
        }

        return session;
    }

    getDiffSession(id) {
        return this.sessions.get(id) || null;
    }

    listDiffSessions() {
        return Array.from(this.sessions.values());
    }

    /**
     * Accept a single hunk
     */
    acceptHunk(diffId, hunkId) {
        const session = this.sessions.get(diffId);
        if (!session) throw new Error(`Diff session not found: ${diffId}`);
        const hunk = session.hunks.find(h => h.id === hunkId);
        if (!hunk) throw new Error(`Hunk not found: ${hunkId}`);

        hunk.status = 'ACCEPTED';
        this._updateSessionStatus(session);

        if (this.eventBus) {
            this.eventBus.emitEvent('diff_updated', {
                diffId,
                hunkId,
                status: 'ACCEPTED',
                sessionStatus: session.status
            }, { sessionId: session.agentSessionId, source: 'diff_authority' });
        }

        return session;
    }

    /**
     * Reject a single hunk
     */
    rejectHunk(diffId, hunkId) {
        const session = this.sessions.get(diffId);
        if (!session) throw new Error(`Diff session not found: ${diffId}`);
        const hunk = session.hunks.find(h => h.id === hunkId);
        if (!hunk) throw new Error(`Hunk not found: ${hunkId}`);

        hunk.status = 'REJECTED';
        this._updateSessionStatus(session);

        if (this.eventBus) {
            this.eventBus.emitEvent('diff_updated', {
                diffId,
                hunkId,
                status: 'REJECTED',
                sessionStatus: session.status
            }, { sessionId: session.agentSessionId, source: 'diff_authority' });
        }

        return session;
    }

    _updateSessionStatus(session) {
        const allAccepted = session.hunks.every(h => h.status === 'ACCEPTED');
        const allRejected = session.hunks.every(h => h.status === 'REJECTED');
        if (allAccepted) session.status = 'ACCEPTED';
        else if (allRejected) session.status = 'REJECTED';
        else session.status = 'PARTIAL';
    }

    /**
     * Apply the diff session (accounting for accepted vs rejected hunks)
     */
    async applyDiffSession(diffId) {
        const session = this.sessions.get(diffId);
        if (!session) throw new Error(`Diff session not found: ${diffId}`);

        if (session.isApplied) {
            return session;
        }

        if (session._applyingPromise) {
            return await session._applyingPromise;
        }

        session._applyingPromise = (async () => {
            try {
                // Check for concurrency conflict before writing
                const conflictCheck = this.revisionManager.checkConflict(session.filePath, session.baseRevision, session.baseHash);
                if (conflictCheck.conflict) {
                    session.status = 'CONFLICTED';
                    if (this.eventBus) {
                        this.eventBus.emitEvent('diff_conflict', {
                            diffId,
                            filePath: session.filePath,
                            conflict: conflictCheck
                        }, { sessionId: session.agentSessionId, source: 'diff_authority' });
                    }
                    throw new Error(`Revision conflict for ${session.filePath}: File changed on disk since diff was created.`);
                }

                // Reconstruct content based on individual hunk statuses
                const finalContent = reconstructContentFromHunks(session.originalContent, session.hunks, session.edits);

                // Apply atomic write to disk
                await this.fileService.writeFile(session.filePath, finalContent, {
                    baseRevision: session.baseRevision,
                    baseHash: session.baseHash,
                    atomic: true,
                    source: 'agent_proposal'
                });

                session.isApplied = true;
                this._updateSessionStatus(session);

                if (this.eventBus) {
                    this.eventBus.emitEvent('diff_accepted', {
                        diffId,
                        filePath: session.filePath,
                        status: session.status
                    }, { sessionId: session.agentSessionId, source: 'diff_authority' });
                }

                return session;
            } finally {
                // Always release file advisory ownership
                if (this.workspaceRuntime && this.workspaceRuntime.agentManager) {
                    this.workspaceRuntime.agentManager.releaseFileAdvisory(session.filePath);
                }
                session._applyingPromise = null;
            }
        })();

        return await session._applyingPromise;
    }

    /**
     * Accept the entire file: marks all hunks ACCEPTED and applies atomically
     */
    async acceptFile(diffId) {
        const session = this.sessions.get(diffId);
        if (!session) throw new Error(`Diff session not found: ${diffId}`);

        session.hunks.forEach(h => h.status = 'ACCEPTED');
        session.status = 'ACCEPTED';

        return await this.applyDiffSession(diffId);
    }

    /**
     * Reject the entire proposal
     */
    rejectFile(diffId) {
        const session = this.sessions.get(diffId);
        if (!session) throw new Error(`Diff session not found: ${diffId}`);

        session.hunks.forEach(h => h.status = 'REJECTED');
        session.status = 'REJECTED';

        // Release advisory ownership
        if (this.workspaceRuntime && this.workspaceRuntime.agentManager) {
            this.workspaceRuntime.agentManager.releaseFileAdvisory(session.filePath);
        }

        if (this.eventBus) {
            this.eventBus.emitEvent('diff_rejected', {
                diffId,
                filePath: session.filePath
            }, { sessionId: session.agentSessionId, source: 'diff_authority' });
        }

        return session;
    }
}

module.exports = {
    DiffManager,
    computeLineDiff,
    reconstructContentFromHunks
};
