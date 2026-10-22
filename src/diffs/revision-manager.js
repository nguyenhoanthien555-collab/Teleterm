const crypto = require('crypto');

/**
 * File Revision Manager
 * Mandated by Master Plan Section 22:
 * Tracks file revisions, content hashes, and detects concurrency conflicts
 * between user edits and agent proposed diffs.
 */
class RevisionManager {
    constructor() {
        // Map<normalizedRelPath, { revision: number, contentHash: string, modifiedAt: number, source: string }>
        this.records = new Map();
    }

    normalizePath(filePath) {
        if (!filePath) return '';
        return filePath.replace(/\\/g, '/').replace(/^\/+/, '');
    }

    computeHash(content) {
        if (typeof content !== 'string' && !Buffer.isBuffer(content)) {
            content = String(content || '');
        }
        return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
    }

    /**
     * Record a file read event. Initializes revision 1 if untracked.
     */
    recordRead(filePath, content) {
        const key = this.normalizePath(filePath);
        const hash = this.computeHash(content);
        let record = this.records.get(key);

        if (!record) {
            record = {
                revision: 1,
                contentHash: hash,
                modifiedAt: Date.now(),
                source: 'disk'
            };
            this.records.set(key, record);
        } else if (record.contentHash !== hash) {
            // External file change detected on read
            record.revision++;
            record.contentHash = hash;
            record.modifiedAt = Date.now();
            record.source = 'external';
        }

        return { ...record };
    }

    /**
     * Check if a proposed modification conflicts with current revision/hash
     */
    checkConflict(filePath, baseRevision, baseHash) {
        const key = this.normalizePath(filePath);
        const record = this.records.get(key);

        if (!record) {
            // Not tracked yet, no known conflict
            return { conflict: false };
        }

        if (baseHash !== undefined && baseHash !== null && record.contentHash !== baseHash) {
            return {
                conflict: true,
                reason: 'CONTENT_HASH_MISMATCH',
                currentRevision: record.revision,
                currentHash: record.contentHash,
                expectedRevision: baseRevision,
                expectedHash: baseHash
            };
        }

        if (baseRevision !== undefined && baseRevision !== null && record.revision !== baseRevision) {
            return {
                conflict: true,
                reason: 'REVISION_MISMATCH',
                currentRevision: record.revision,
                currentHash: record.contentHash,
                expectedRevision: baseRevision,
                expectedHash: baseHash
            };
        }

        return { conflict: false };
    }

    /**
     * Record an applied write. Increments revision and updates content hash.
     */
    recordWrite(filePath, content, source = 'user') {
        const key = this.normalizePath(filePath);
        const hash = this.computeHash(content);
        const existing = this.records.get(key);

        const newRevision = existing ? existing.revision + 1 : 1;
        const newRecord = {
            revision: newRevision,
            contentHash: hash,
            modifiedAt: Date.now(),
            source
        };

        this.records.set(key, newRecord);
        return { ...newRecord };
    }

    getRecord(filePath) {
        const key = this.normalizePath(filePath);
        const record = this.records.get(key);
        return record ? { ...record } : null;
    }

    recordDeletion(filePath) {
        const key = this.normalizePath(filePath);
        this.records.delete(key);
    }
}

module.exports = { RevisionManager };
