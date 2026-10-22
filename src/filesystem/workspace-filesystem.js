const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * TeleTerm ADE Workspace Filesystem Service
 * Mandated by Master Plan Section 7, 8, 22, 24:
 * - Strict workspace path traversal validation
 * - Content hashing and revision synchronization
 * - Atomic write guarantees (write to temp + rename)
 * - Binary detection & file size boundaries
 */
class WorkspaceFilesystem {
    constructor({ rootPath, revisionManager, eventBus }) {
        this.rootPath = path.resolve(rootPath);
        this.revisionManager = revisionManager;
        this.eventBus = eventBus;
    }

    normalizeRelPath(targetPath) {
        if (!targetPath) return '';
        const resolved = path.resolve(this.rootPath, targetPath);
        const rel = path.relative(this.rootPath, resolved);
        if (!rel.startsWith('..') && !path.isAbsolute(rel)) {
            return rel.replace(/\\/g, '/');
        }
        return targetPath.replace(/\\/g, '/').replace(/^\/+/, '');
    }

    /**
     * Resolve absolute path and enforce workspace boundary
     */
    resolvePath(relPath) {
        const resolved = path.resolve(this.rootPath, relPath || '');
        const rel = path.relative(this.rootPath, resolved);

        if (rel.startsWith('..') || path.isAbsolute(rel)) {
            const err = new Error(`Security Violation: Path '${relPath}' escapes workspace root '${this.rootPath}'`);
            err.code = 'ERR_PATH_TRAVERSAL';
            throw err;
        }

        return resolved;
    }

    isBinaryBuffer(buffer) {
        const checkLen = Math.min(buffer.length, 8192);
        for (let i = 0; i < checkLen; i++) {
            if (buffer[i] === 0) return true;
        }
        return false;
    }

    computeHash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * List files and folders recursively with ignore filters
     */
    async listTree(dirRelPath = '', options = {}) {
        const maxDepth = options.maxDepth !== undefined ? options.maxDepth : 6;
        const ignore = new Set(options.ignore || ['.git', 'node_modules', 'dist', 'build', '.gemini', 'logs', '.tmp']);
        const results = [];

        const walk = (currentRelPath, depth) => {
            if (depth > maxDepth) return;
            const absDir = this.resolvePath(currentRelPath);
            if (!fs.existsSync(absDir)) return;

            let entries;
            try {
                entries = fs.readdirSync(absDir, { withFileTypes: true });
            } catch (e) {
                return;
            }

            for (const entry of entries) {
                if (ignore.has(entry.name)) continue;

                const itemRelPath = currentRelPath ? `${currentRelPath}/${entry.name}` : entry.name;
                const isDir = entry.isDirectory();

                if (isDir) {
                    results.push({
                        name: entry.name,
                        relPath: itemRelPath,
                        type: 'directory'
                    });
                    walk(itemRelPath, depth + 1);
                } else if (entry.isFile()) {
                    let size = 0;
                    let mtime = 0;
                    try {
                        const st = fs.statSync(path.join(absDir, entry.name));
                        size = st.size;
                        mtime = st.mtimeMs;
                    } catch (e) {}

                    results.push({
                        name: entry.name,
                        relPath: itemRelPath,
                        type: 'file',
                        size,
                        modifiedAt: mtime
                    });
                }
            }
        };

        walk(dirRelPath, 1);
        return results;
    }

    /**
     * Read file content with revision recording and binary detection
     */
    async readFile(relPath, options = {}) {
        const absPath = this.resolvePath(relPath);
        const maxBytes = options.maxBytes || 5 * 1024 * 1024; // 5MB default

        if (!fs.existsSync(absPath)) {
            const err = new Error(`File not found: ${relPath}`);
            err.code = 'ENOENT';
            throw err;
        }

        const stat = fs.statSync(absPath);
        if (stat.isDirectory()) {
            const err = new Error(`Target is a directory, not a file: ${relPath}`);
            err.code = 'EISDIR';
            throw err;
        }

        if (stat.size > maxBytes) {
            const err = new Error(`File size ${stat.size} exceeds maximum safe limit of ${maxBytes} bytes`);
            err.code = 'EFBIG';
            throw err;
        }

        const buffer = fs.readFileSync(absPath);
        const isBinary = this.isBinaryBuffer(buffer);
        const content = isBinary ? null : buffer.toString('utf8');
        const contentHash = this.computeHash(buffer);

        // Record read with revision tracking
        const normRel = this.normalizeRelPath(relPath);
        let revRecord = { revision: 1, contentHash };
        if (this.revisionManager) {
            revRecord = this.revisionManager.recordRead(normRel, content || contentHash);
        }

        return {
            relPath: normRel,
            content,
            contentHash,
            revision: revRecord.revision,
            size: stat.size,
            isBinary,
            modifiedAt: stat.mtimeMs
        };
    }

    /**
     * Atomically write file to workspace with conflict verification
     */
    async writeFile(relPath, content, options = {}) {
        const absPath = this.resolvePath(relPath);
        const normRel = this.normalizeRelPath(relPath);
        const exists = fs.existsSync(absPath);

        // Concurrency conflict check
        if (this.revisionManager && exists && (options.baseRevision !== undefined || options.baseHash !== undefined)) {
            const conflict = this.revisionManager.checkConflict(normRel, options.baseRevision, options.baseHash);
            if (conflict.conflict) {
                const err = new Error(`Conflict detected for file ${normRel}: base revision/hash mismatch.`);
                err.code = 'ECONFLICT';
                err.details = conflict;
                throw err;
            }
        }

        // Ensure parent directory exists
        const parentDir = path.dirname(absPath);
        if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
        }

        const atomic = options.atomic !== false;
        if (atomic) {
            // Write to temporary file in same folder then atomically rename
            const tempFile = path.join(parentDir, `.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`);
            try {
                if (Buffer.isBuffer(content)) {
                    fs.writeFileSync(tempFile, content);
                } else {
                    fs.writeFileSync(tempFile, content, 'utf8');
                }
                fs.renameSync(tempFile, absPath);
            } catch (err) {
                // On Windows, renameSync may fail with EPERM/EBUSY/EEXIST if destination is open or watched
                if (process.platform === 'win32' && (err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EEXIST')) {
                    try {
                        fs.copyFileSync(tempFile, absPath);
                        fs.unlinkSync(tempFile);
                    } catch (copyErr) {
                        try {
                            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                        } catch (_) {}
                        throw copyErr;
                    }
                } else {
                    try {
                        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                    } catch (_) {}
                    throw err;
                }
            }
        } else {
            if (Buffer.isBuffer(content)) {
                fs.writeFileSync(absPath, content);
            } else {
                fs.writeFileSync(absPath, content, 'utf8');
            }
        }

        // Record revision
        let revRecord = { revision: 1 };
        if (this.revisionManager) {
            revRecord = this.revisionManager.recordWrite(normRel, content, options.source || 'user');
        }

        // Emit normalized event
        if (this.eventBus) {
            this.eventBus.emitEvent(exists ? 'file_changed' : 'file_created', {
                relPath: normRel,
                revision: revRecord.revision,
                contentHash: revRecord.contentHash,
                source: options.source || 'user'
            }, { source: 'filesystem' });
        }

        return {
            relPath: normRel,
            revision: revRecord.revision,
            contentHash: revRecord.contentHash
        };
    }

    /**
     * Create a new empty file
     */
    async createFile(relPath, content = '') {
        const absPath = this.resolvePath(relPath);
        if (fs.existsSync(absPath)) {
            throw new Error(`File already exists: ${relPath}`);
        }
        return this.writeFile(relPath, content, { source: 'user' });
    }

    /**
     * Create directory
     */
    async createDirectory(relPath) {
        const absPath = this.resolvePath(relPath);
        if (fs.existsSync(absPath)) {
            return { relPath, created: false };
        }
        fs.mkdirSync(absPath, { recursive: true });
        if (this.eventBus) {
            this.eventBus.emitEvent('directory_created', { relPath: this.normalizeRelPath(relPath) }, { source: 'filesystem' });
        }
        return { relPath, created: true };
    }

    /**
     * Delete file or directory
     */
    async deleteFile(relPath) {
        const absPath = this.resolvePath(relPath);
        const normRel = this.normalizeRelPath(relPath);

        if (!fs.existsSync(absPath)) {
            return { relPath: normRel, deleted: false };
        }

        const stat = fs.statSync(absPath);
        if (stat.isDirectory()) {
            fs.rmSync(absPath, { recursive: true, force: true });
        } else {
            fs.unlinkSync(absPath);
            if (this.revisionManager) {
                this.revisionManager.recordDeletion(normRel);
            }
        }

        if (this.eventBus) {
            this.eventBus.emitEvent('file_deleted', {
                relPath: normRel,
                isDirectory: stat.isDirectory()
            }, { source: 'filesystem' });
        }

        return { relPath: normRel, deleted: true };
    }

    /**
     * Rename or move a file within the workspace
     */
    async renameFile(oldRelPath, newRelPath) {
        const oldAbs = this.resolvePath(oldRelPath);
        const newAbs = this.resolvePath(newRelPath);
        const normOld = this.normalizeRelPath(oldRelPath);
        const normNew = this.normalizeRelPath(newRelPath);

        if (!fs.existsSync(oldAbs)) {
            throw new Error(`Source file not found: ${oldRelPath}`);
        }

        const newParent = path.dirname(newAbs);
        if (!fs.existsSync(newParent)) {
            fs.mkdirSync(newParent, { recursive: true });
        }

        try {
            fs.renameSync(oldAbs, newAbs);
        } catch (err) {
            if (process.platform === 'win32' && (err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EEXIST')) {
                fs.copyFileSync(oldAbs, newAbs);
                fs.unlinkSync(oldAbs);
            } else {
                throw err;
            }
        }

        if (this.revisionManager) {
            const oldRec = this.revisionManager.getRecord(normOld);
            if (oldRec) {
                this.revisionManager.recordDeletion(normOld);
                this.revisionManager.records.set(normNew, oldRec);
            }
        }

        if (this.eventBus) {
            this.eventBus.emitEvent('file_renamed', {
                oldPath: normOld,
                newPath: normNew
            }, { source: 'filesystem' });
        }

        return { oldPath: normOld, newPath: normNew };
    }

    /**
     * Full-text search across workspace files
     */
    async searchWorkspace(options = {}) {
        const {
            query = '',
            isRegex = false,
            isCaseSensitive = false,
            isWordMatch = false,
            includePattern = '',
            excludePattern = '',
            maxResults = 500,
            maxFileSize = 2 * 1024 * 1024
        } = options;

        if (!query || typeof query !== 'string' || !query.trim()) {
            return { totalMatches: 0, totalFiles: 0, results: [] };
        }

        let searchRegex;
        try {
            let pattern = isRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (isWordMatch) {
                pattern = `\\b${pattern}\\b`;
            }
            const flags = isCaseSensitive ? 'g' : 'gi';
            searchRegex = new RegExp(pattern, flags);
        } catch (e) {
            throw new Error(`Invalid search pattern: ${e.message}`);
        }

        const parseFilterList = (patternStr) => {
            if (!patternStr || typeof patternStr !== 'string') return [];
            return patternStr.split(',')
                .map(s => s.trim().toLowerCase().replace(/\\/g, '/'))
                .filter(Boolean);
        };
        const rawIncludes = parseFilterList(includePattern);
        const rawExcludes = parseFilterList(excludePattern);

        const includes = [];
        const excludes = [...rawExcludes];

        for (const inc of rawIncludes) {
            if (inc.startsWith('!')) {
                excludes.push(inc.slice(1).trim());
            } else {
                includes.push(inc);
            }
        }

        const matchesPattern = (filePath, patterns) => {
            if (patterns.length === 0) return true;
            const norm = filePath.toLowerCase().replace(/\\/g, '/');
            return patterns.some(p => {
                if (p.startsWith('*.')) {
                    return norm.endsWith(p.slice(1));
                }
                if (p.includes('*')) {
                    const regex = new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
                    return regex.test(norm) || regex.test(path.basename(norm));
                }
                return norm.includes(p) || path.basename(norm) === p;
            });
        };

        const ignoreDirs = new Set(['.git', 'node_modules', 'dist', 'build', '.gemini', 'logs', '.tmp', '.flowseeker']);
        const fileList = [];

        const collectFiles = (currentRelPath, depth = 0) => {
            if (depth > 12) return;
            const absDir = this.resolvePath(currentRelPath);
            if (!fs.existsSync(absDir)) return;

            let entries;
            try {
                entries = fs.readdirSync(absDir, { withFileTypes: true });
            } catch (e) {
                return;
            }

            for (const entry of entries) {
                if (ignoreDirs.has(entry.name)) continue;
                const itemRelPath = currentRelPath ? `${currentRelPath}/${entry.name}` : entry.name;

                if (entry.isDirectory()) {
                    if (excludes.length > 0 && matchesPattern(itemRelPath, excludes)) {
                        continue;
                    }
                    collectFiles(itemRelPath, depth + 1);
                } else if (entry.isFile()) {
                    if (includes.length > 0 && !matchesPattern(itemRelPath, includes)) {
                        continue;
                    }
                    if (excludes.length > 0 && matchesPattern(itemRelPath, excludes)) {
                        continue;
                    }
                    fileList.push(itemRelPath);
                }
            }
        };

        collectFiles('');

        const results = [];
        let totalMatches = 0;

        for (const relPath of fileList) {
            if (totalMatches >= maxResults) break;

            const absPath = this.resolvePath(relPath);
            try {
                const stat = fs.statSync(absPath);
                if (stat.size > maxFileSize || stat.size === 0) continue;

                const buffer = fs.readFileSync(absPath);
                if (this.isBinaryBuffer(buffer)) continue;

                const text = buffer.toString('utf8');
                const lines = text.split(/\r?\n/);
                const fileMatches = [];

                for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                    const line = lines[lineIdx];
                    searchRegex.lastIndex = 0;
                    let match;

                    while ((match = searchRegex.exec(line)) !== null) {
                        fileMatches.push({
                            lineNumber: lineIdx + 1,
                            lineContent: line.length > 300 ? line.slice(0, 300) + '...' : line,
                            matchIndex: match.index,
                            matchLength: match[0].length
                        });
                        totalMatches++;

                        if (totalMatches >= maxResults || fileMatches.length >= 100) break;
                        if (!searchRegex.global) break;
                        if (match[0].length === 0) {
                            searchRegex.lastIndex++;
                        }
                    }

                    if (totalMatches >= maxResults || fileMatches.length >= 100) break;
                }

                if (fileMatches.length > 0) {
                    results.push({
                        path: relPath,
                        matches: fileMatches
                    });
                }
            } catch (e) {
                // Ignore unreadable or locked files
            }
        }

        return {
            totalMatches,
            totalFiles: results.length,
            results
        };
    }
}

module.exports = { WorkspaceFilesystem };
