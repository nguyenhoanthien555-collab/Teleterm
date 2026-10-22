const { execFile } = require('child_process');
const path = require('path');

/**
 * TeleTerm ADE Workspace Git Authority
 * Mandated by Master Plan Section 21 & 51:
 * Real Git integration for branch, status, unified diffs, staging, and commit history.
 */
class WorkspaceGit {
    constructor({ rootPath, eventBus }) {
        this.rootPath = path.resolve(rootPath);
        this.eventBus = eventBus;
    }

    _execGit(args) {
        return new Promise((resolve, reject) => {
            execFile('git', args, { cwd: this.rootPath, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
                if (err) {
                    return resolve({ success: false, error: stderr || err.message, stdout: '' });
                }
                resolve({ success: true, stdout: stdout || '', error: null });
            });
        });
    }

    /**
     * Get branch and working tree status
     */
    async getStatus() {
        // 1. Get current branch
        const branchRes = await this._execGit(['branch', '--show-current']);
        const branch = branchRes.stdout.trim() || 'detached HEAD';

        // 2. Get porcelain status
        const statusRes = await this._execGit(['status', '--porcelain=v1', '-u']);
        if (!statusRes.success) {
            return {
                isGitRepo: false,
                branch: null,
                files: [],
                isClean: true
            };
        }

        const lines = statusRes.stdout.split('\n').filter(l => l.trim().length > 0);
        const files = [];

        for (const line of lines) {
            const indexStatus = line.substring(0, 1);
            const workingStatus = line.substring(1, 2);
            let rawPath = line.substring(3).trim();
            let type = 'modified';
            if (indexStatus === '?' || workingStatus === '?') type = 'untracked';
            else if (indexStatus === 'D' || workingStatus === 'D') type = 'deleted';
            else if (indexStatus === 'A' || workingStatus === 'A') type = 'added';
            else if (indexStatus === 'R' || workingStatus === 'R') {
                type = 'renamed';
                if (rawPath.includes(' -> ')) {
                    const parts = rawPath.split(' -> ');
                    rawPath = parts[1].trim();
                }
            }

            if (rawPath.startsWith('"') && rawPath.endsWith('"')) {
                rawPath = rawPath.slice(1, -1);
            }

            files.push({
                path: rawPath.replace(/\\/g, '/'),
                status: type,
                staged: indexStatus !== ' ' && indexStatus !== '?',
                unstaged: workingStatus !== ' '
            });
        }

        const result = {
            isGitRepo: true,
            branch,
            isClean: files.length === 0,
            files
        };

        if (this.eventBus) {
            this.eventBus.emitEvent('git_status_changed', result, { source: 'git' });
        }

        return result;
    }

    /**
     * Get unified diff for a file or entire working tree
     */
    async getDiff(relPath = '', options = {}) {
        const args = ['diff'];
        if (options.cached) args.push('--cached');
        if (relPath) {
            args.push('--', relPath.replace(/\\/g, '/'));
        }

        const res = await this._execGit(args);
        return res.stdout;
    }

    /**
     * Get recent commit log
     */
    async getLog(maxCount = 20) {
        const args = ['log', `-n`, String(maxCount), `--pretty=format:%H|%h|%an|%ad|%s`, `--date=short`];
        const res = await this._execGit(args);
        if (!res.success) return [];

        const lines = res.stdout.split('\n').filter(l => l.trim().length > 0);
        return lines.map(line => {
            const [hash, shortHash, author, date, ...subjectParts] = line.split('|');
            return {
                hash,
                shortHash,
                author,
                date,
                message: subjectParts.join('|')
            };
        });
    }

    /**
     * Stage file
     */
    async stage(relPath) {
        const res = await this._execGit(['add', '--', relPath.replace(/\\/g, '/')]);
        await this.getStatus();
        return res.success;
    }

    /**
     * Unstage file
     */
    async unstage(relPath) {
        const res = await this._execGit(['restore', '--staged', '--', relPath.replace(/\\/g, '/')]);
        await this.getStatus();
        return res.success;
    }

    /**
     * Commit staged changes
     */
    async commit(message) {
        if (!message || !message.trim()) {
            throw new Error('Commit message cannot be empty');
        }
        const res = await this._execGit(['commit', '-m', message]);
        await this.getStatus();
        return res;
    }
}

module.exports = { WorkspaceGit };
