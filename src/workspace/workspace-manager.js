const path = require('path');
const { WorkspaceRuntime } = require('./workspace-runtime');
const { defaultEventBus } = require('../events/event-bus');

/**
 * Workspace Manager
 * Tracks active workspace runtime instances
 */
class WorkspaceManager {
    constructor() {
        this.workspaces = new Map(); // Map<workspaceId, WorkspaceRuntime>
        this.defaultWorkspaceId = 'ws-default';
    }

    getOrCreateWorkspace(rootPath = process.cwd(), workspaceId = null) {
        const id = workspaceId || this.defaultWorkspaceId;
        if (this.workspaces.has(id)) {
            return this.workspaces.get(id);
        }

        const runtime = new WorkspaceRuntime({
            workspaceId: id,
            rootPath: path.resolve(rootPath),
            eventBus: defaultEventBus
        });

        this.workspaces.set(id, runtime);
        runtime.initialize().catch(err => {
            console.error('Failed to initialize workspace runtime:', err);
        });

        return runtime;
    }

    getDefaultWorkspace() {
        return this.getOrCreateWorkspace(process.cwd(), this.defaultWorkspaceId);
    }
}

if (!global.__adeWorkspaceManager) {
    global.__adeWorkspaceManager = new WorkspaceManager();
}
const defaultWorkspaceManager = global.__adeWorkspaceManager;

module.exports = {
    WorkspaceManager,
    defaultWorkspaceManager
};
