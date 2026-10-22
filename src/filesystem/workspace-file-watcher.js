const fs = require('fs');
const path = require('path');

/**
 * TeleTerm ADE Workspace File Watcher Pipeline
 * Mandated by Master Plan Section 9:
 * - Debounces and coalesces burst filesystem notifications
 * - Normalizes change events into file_created, file_changed, file_deleted
 * - Filters noisy directories (.git, node_modules, build, dist, logs)
 */
class WorkspaceFileWatcher {
    constructor({ rootPath, fileService, eventBus, debounceMs = 150 }) {
        this.rootPath = path.resolve(rootPath);
        this.fileService = fileService;
        this.eventBus = eventBus;
        this.debounceMs = debounceMs;
        this.watcher = null;
        this.pendingChanges = new Map(); // Map<relPath, { eventType, timerId }>
        this.ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'build', '.gemini', 'logs', '.tmp']);
    }

    start() {
        if (this.watcher) return;
        try {
            this.watcher = fs.watch(this.rootPath, { recursive: true }, (eventType, filename) => {
                if (!filename) return;
                this._handleRawFsEvent(eventType, filename);
            });
            this.watcher.on('error', (err) => {
                // Ignore transient watcher errors or log via eventBus
                if (this.eventBus) {
                    this.eventBus.emitEvent('watcher_error', { error: err.message }, { source: 'file_watcher' });
                }
            });
        } catch (e) {
            // Recursive watching might not be supported on some platforms
            console.error('File watcher start failure:', e.message);
        }
    }

    _handleRawFsEvent(eventType, rawFilename) {
        const normalized = rawFilename.replace(/\\/g, '/');
        const segments = normalized.split('/');
        if (segments.some(seg => this.ignoredDirs.has(seg)) || normalized.includes('/.tmp.') || segments.some(s => s.startsWith('.tmp.'))) {
            return;
        }

        // Debounce coalescing
        const existing = this.pendingChanges.get(normalized);
        if (existing) {
            clearTimeout(existing.timerId);
        }

        const timerId = setTimeout(() => {
            this.pendingChanges.delete(normalized);
            this._processCoalescedChange(normalized);
        }, this.debounceMs);

        this.pendingChanges.set(normalized, { eventType, timerId });
    }

    async _processCoalescedChange(relPath) {
        try {
            const absPath = path.join(this.rootPath, relPath);
            const exists = fs.existsSync(absPath);

            if (!exists) {
                if (this.eventBus) {
                    this.eventBus.emitEvent('file_deleted', {
                        relPath,
                        source: 'watcher'
                    }, { source: 'file_watcher' });
                }
                return;
            }

            const stat = fs.statSync(absPath);
            if (stat.isDirectory()) return;

            // Trigger fileService read to reconcile revision and hash
            const fileData = await this.fileService.readFile(relPath).catch(() => null);
            if (fileData && this.eventBus) {
                this.eventBus.emitEvent('file_changed', {
                    relPath,
                    revision: fileData.revision,
                    contentHash: fileData.contentHash,
                    source: 'external'
                }, { source: 'file_watcher' });
            }
        } catch (e) {
            // File might have been removed during debounce
        }
    }

    stop() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }
        for (const { timerId } of this.pendingChanges.values()) {
            clearTimeout(timerId);
        }
        this.pendingChanges.clear();
    }
}

module.exports = { WorkspaceFileWatcher };
