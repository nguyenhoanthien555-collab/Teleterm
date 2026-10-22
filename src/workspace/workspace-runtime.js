const path = require('path');
const { EventBus, defaultEventBus } = require('../events/event-bus');
const { RevisionManager } = require('../diffs/revision-manager');
const { WorkspaceFilesystem } = require('../filesystem/workspace-filesystem');
const { WorkspaceFileWatcher } = require('../filesystem/workspace-file-watcher');
const { WorkspaceGit } = require('../git/workspace-git');
const { WorkspaceTerminal } = require('../terminal/workspace-terminal');
const { PermissionEngine } = require('../permissions/permission-engine');
const { DiffManager } = require('../diffs/diff-manager');
const { ContextEngine } = require('../context/context-engine');
const { VerificationRunner } = require('../verification/verification-runner');
const { AgentSessionManager } = require('../agents/agent-session-manager');

/**
 * TeleTerm ADE WorkspaceRuntime
 * Mandated by Master Plan Section 6 & 7:
 * The single source of truth and unified coordinator for all ADE subsystems.
 */
class WorkspaceRuntime {
    constructor({ workspaceId = 'ws-default', rootPath = process.cwd(), eventBus = null } = {}) {
        this.workspaceId = workspaceId;
        this.rootPath = path.resolve(rootPath);
        this.eventBus = eventBus || defaultEventBus;
        this.status = 'INITIALIZING';

        // 1. Core Revisions & Authority
        this.revisionManager = new RevisionManager();

        // 2. Filesystem & Watcher
        this.fileService = new WorkspaceFilesystem({
            rootPath: this.rootPath,
            revisionManager: this.revisionManager,
            eventBus: this.eventBus
        });

        this.fileWatcher = new WorkspaceFileWatcher({
            rootPath: this.rootPath,
            fileService: this.fileService,
            eventBus: this.eventBus
        });

        // 3. Git Authority
        this.gitService = new WorkspaceGit({
            rootPath: this.rootPath,
            eventBus: this.eventBus
        });

        // 4. Terminal Runtime
        this.terminalService = new WorkspaceTerminal({
            rootPath: this.rootPath,
            eventBus: this.eventBus
        });

        // 5. Diff Authority
        this.diffManager = new DiffManager({
            revisionManager: this.revisionManager,
            eventBus: this.eventBus,
            fileService: this.fileService,
            workspaceRuntime: this
        });

        // 6. Permission Engine
        this.permissionEngine = new PermissionEngine({
            eventBus: this.eventBus,
            workspaceManager: this
        });

        // 7. Context Engine
        this.contextEngine = new ContextEngine({
            fileService: this.fileService,
            terminalService: this.terminalService,
            gitService: this.gitService
        });

        // 8. Verification Engine
        this.verificationRunner = new VerificationRunner({
            rootPath: this.rootPath,
            eventBus: this.eventBus,
            terminalService: this.terminalService
        });

        // 9. Agent Session Manager
        this.agentManager = new AgentSessionManager({
            workspaceRuntime: this
        });
    }

    async initialize() {
        this.status = 'READY';

        // Start file watcher
        this.fileWatcher.start();

        // Check git status initially
        const gitStatus = await this.gitService.getStatus().catch(() => ({ branch: 'none', isClean: true, files: [] }));

        // Emit workspace_opened event
        this.eventBus.emitEvent('workspace_opened', {
            workspaceId: this.workspaceId,
            rootPath: this.rootPath,
            status: this.status,
            git: gitStatus
        }, { workspaceId: this.workspaceId, source: 'workspace' });

        return this.getInfo();
    }

    async getInfo() {
        const gitStatus = await this.gitService.getStatus().catch(() => ({ branch: 'none', isClean: true, files: [] }));
        return {
            workspaceId: this.workspaceId,
            rootPath: this.rootPath,
            name: path.basename(this.rootPath),
            status: this.status,
            git: gitStatus,
            permissionPolicy: this.permissionEngine.getPolicy(),
            activeSessionId: this.agentManager.activeSessionId,
            sessionsCount: this.agentManager.sessions.size,
            diffsCount: this.diffManager.sessions.size,
            terminalsCount: this.terminalService.activeSessions.size
        };
    }

    shutdown() {
        this.status = 'SHUTDOWN';
        this.fileWatcher.stop();
        this.verificationRunner.cancel();
        if (this.permissionEngine) {
            this.permissionEngine.cancelAllRequests('Workspace shutdown');
        }
        if (this.terminalService) {
            for (const termId of Array.from(this.terminalService.activeSessions.keys())) {
                try { this.terminalService.kill(termId); } catch (_) {}
            }
        }
        this.eventBus.emitEvent('workspace_closed', {
            workspaceId: this.workspaceId
        }, { workspaceId: this.workspaceId, source: 'workspace' });
    }
}

module.exports = { WorkspaceRuntime };
