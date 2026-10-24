/**
 * TeleTerm ADE Master Application Orchestrator
 * Coordinates Sidebar, Editor, Git, Terminal, and Agent Command Center.
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('[ADE] Initializing TeleTerm Agentic Development Environment...');

    // 1. Initialize State Subscribers
    setupStateBindings();

    // 2. Setup Sidebar Tabs
    setupSidebarTabs();

    // 3. Setup Terminal Dock Controls
    setupTerminalControls();

    // 4. Setup Topbar Actions & Selectors
    setupTopbarControls();

    // 5. Connect Realtime WebSocket Gateway & Load Initial State
    window.AdeClient.connect();

    // 6. Initialize Monaco Editor & Terminal Dock
    await window.AdeMonaco.init();
    await window.AdeTerminal.init();
    window.AdeAgentDeck.init();
    if (window.AdeQuickOpen) window.AdeQuickOpen.init();
    if (window.AdeSearch) window.AdeSearch.init();
    if (window.AdeTestDashboard) await window.AdeTestDashboard.init();

    // 7. Initial Fetch
    await loadInitialWorkspaceData();

    console.log('[ADE] Ready.');
});

function setupStateBindings() {
    window.AdeState.subscribe((domain, payload, state) => {
        if (domain === 'files_tree') {
            renderFileTree(state.files.tree);
        } else if (domain === 'git') {
            renderGitStatus(state.git);
        } else if (domain === 'sessions') {
            renderSessions(state.agents.sessions, state.agents.activeSessionId);
        } else if (domain === 'permission_policy') {
            const policySelect = document.getElementById('select-permission-policy');
            if (policySelect && state.permissionPolicy) {
                policySelect.value = state.permissionPolicy;
            }
        } else if (domain === 'editor_tabs') {
            renderEditorTabs(state.files.openTabs, state.files.activePath);
        } else if (domain === 'workspace') {
            renderWorkspaceHeader(state.workspace);
        } else if (domain === 'connection') {
            const connEl = document.getElementById('topbar-conn-status');
            if (connEl) {
                connEl.textContent = payload.connected ? `● Live [Seq: ${payload.sequence || state.sequence}]` : '○ Reconnecting...';
                connEl.style.color = payload.connected ? 'var(--accent-green)' : 'var(--accent-amber)';
            }
        }
    });

    // Reconcile Banner Buttons
    const btnReload = document.getElementById('btn-reconcile-reload');
    const btnKeep = document.getElementById('btn-reconcile-keep');
    if (btnReload) {
        btnReload.onclick = () => window.AdeMonaco.reloadFromDisk();
    }
    if (btnKeep) {
        btnKeep.onclick = () => window.AdeMonaco.hideReconcileBanner();
    }
}

function setupSidebarTabs() {
    const tabBtns = document.querySelectorAll('.sidebar-tab-btn');
    tabBtns.forEach(btn => {
        btn.onclick = () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const targetPane = btn.getAttribute('data-tab');
            document.querySelectorAll('.sidebar-pane').forEach(p => p.classList.remove('active'));
            const paneEl = document.getElementById(`pane-${targetPane}`);
            if (paneEl) paneEl.classList.add('active');

            if (targetPane === 'git') {
                window.AdeClient.getGitStatus();
            } else if (targetPane === 'sessions') {
                window.AdeClient.getSessions();
            } else if (targetPane === 'search') {
                const searchInp = document.getElementById('workspace-search-input');
                if (searchInp) {
                    setTimeout(() => {
                        searchInp.focus();
                        searchInp.select();
                    }, 50);
                }
            }
        };
    });
}

function setupTerminalControls() {
    const collapseBtn = document.getElementById('btn-term-collapse');
    const maxBtn = document.getElementById('btn-term-maximize');
    const appEl = document.getElementById('ade-app');

    if (collapseBtn && appEl) {
        collapseBtn.onclick = () => {
            appEl.classList.toggle('terminal-collapsed');
            if (window.AdeTerminal.fitAddon) window.AdeTerminal.fitAddon.fit();
        };
    }

    if (maxBtn && appEl) {
        maxBtn.onclick = () => {
            appEl.classList.toggle('terminal-maximized');
            if (window.AdeTerminal.fitAddon) window.AdeTerminal.fitAddon.fit();
        };
    }
}

function setupTopbarControls() {
    const quickOpenTrigger = document.getElementById('btn-quick-open-trigger');
    if (quickOpenTrigger) {
        quickOpenTrigger.onclick = () => {
            if (window.AdeQuickOpen) window.AdeQuickOpen.toggle('');
        };
    }

    const symbolOutlineTrigger = document.getElementById('btn-symbol-outline-trigger');
    if (symbolOutlineTrigger) {
        symbolOutlineTrigger.onclick = () => {
            if (window.AdeQuickOpen) window.AdeQuickOpen.open('@');
        };
    }

    const policySelect = document.getElementById('select-permission-policy');
    if (policySelect) {
        policySelect.onchange = () => {
            window.AdeClient.setPermissionPolicy(policySelect.value);
        };
    }

    const providerSelect = document.getElementById('select-agent-provider');
    if (providerSelect) {
        providerSelect.onchange = () => {
            const providerId = providerSelect.value;
            window.AdeClient.send('create_session', { providerId, name: `${providerId.toUpperCase()} Agent` });
        };
    }

    const refreshFilesBtn = document.getElementById('btn-refresh-files');
    if (refreshFilesBtn) {
        refreshFilesBtn.onclick = () => window.AdeClient.getFilesTree();
    }

    const newSessionBtn = document.getElementById('btn-new-agent-session');
    if (newSessionBtn) {
        newSessionBtn.onclick = () => {
            window.AdeClient.send('create_session', { providerId: 'universal', name: 'Agent Co-worker' });
        };
    }

    const paneNewSessionBtn = document.getElementById('btn-pane-new-session');
    if (paneNewSessionBtn) {
        paneNewSessionBtn.onclick = () => {
            window.AdeClient.send('create_session', { providerId: 'universal', name: 'Agent Co-worker' });
        };
    }

    // Return to 3D World (Zero-Reload Embedded Viewport Hook)
    const return3dBtn = document.getElementById('btn-return-3d-world');
    if (return3dBtn) {
        if (window.parent && window.parent !== window) {
            const icon = window.TeleTermIcons ? window.TeleTermIcons.render('orbit', { size: 13, color: '#00f0ff' }) : '';
            return3dBtn.innerHTML = `${icon} Return to 3D (Instant)`;
            return3dBtn.title = 'Instantly return to 3D World (Zero reload, map stays loaded)';
        }
        return3dBtn.onclick = (e) => {
            if (window.parent && window.parent !== window) {
                e.preventDefault();
                window.parent.postMessage({ type: 'teleterm:close-ade' }, '*');
            }
        };
    }

    // Escape listener inside ADE iframe to return to 3D world
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.parent && window.parent !== window) {
            const quickOpen = document.getElementById('quick-open-modal');
            if (quickOpen && quickOpen.style.display !== 'none') {
                quickOpen.style.display = 'none';
                return;
            }
            window.parent.postMessage({ type: 'teleterm:close-ade' }, '*');
        }
    }, true);
}

async function loadInitialWorkspaceData() {
    try {
        await window.AdeClient.getFilesTree();
        await window.AdeClient.getGitStatus();
        await window.AdeClient.getSessions();

        // If files exist, open README or package.json by default
        const tree = window.AdeState.files.tree;
        const defaultFile = tree.find(f => f.name.toLowerCase() === 'readme.md') ||
                            tree.find(f => f.name.toLowerCase() === 'package.json') ||
                            tree.find(f => f.type === 'file');

        if (defaultFile) {
            window.AdeMonaco.openFile(defaultFile.relPath);
        }
    } catch (e) {
        console.error('Failed to load initial workspace data:', e);
    }
}

function renderWorkspaceHeader(ws) {
    const nameEl = document.getElementById('workspace-name');
    if (nameEl) nameEl.textContent = ws.name || 'Workspace';
}

function renderSessions(sessions, activeSessionId) {
    const listEl = document.getElementById('agent-sessions-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (!sessions || sessions.length === 0) {
        listEl.innerHTML = '<li style="padding:10px; color:var(--text-muted); font-size:12px;">No active sessions.</li>';
        return;
    }

    sessions.forEach(s => {
        const li = document.createElement('li');
        const isActive = s.sessionId === activeSessionId;
        li.className = `session-item ${isActive ? 'active' : ''}`;
        li.innerHTML = `
            <div class="session-header-row">
                <span class="session-name">${escapeHtml(s.name)}</span>
                <span class="session-status-tag ${s.state.toLowerCase()}">${s.state}</span>
            </div>
            <div class="session-meta-row">
                <span>Provider: ${s.provider}</span>
                <span>${isActive ? (window.TeleTermIcons ? `${window.TeleTermIcons.render('check', { size: 11 })} Active` : 'Active') : 'Click to switch'}</span>
            </div>
        `;
        li.onclick = () => {
            window.AdeClient.switchSession(s.sessionId);
        };
        listEl.appendChild(li);
    });
}

function renderGitStatus(git) {
    const badge = document.getElementById('topbar-git-badge');
    const branchName = document.getElementById('git-branch-name');
    if (badge && branchName) {
        branchName.textContent = git.branch || 'detached';
        if (git.isClean) {
            badge.className = 'git-badge';
        } else {
            badge.className = 'git-badge dirty';
        }
    }

    // Render Git Pane list with virtual cap to prevent DOM freezing
    const gitListEl = document.getElementById('git-changed-files-list');
    if (gitListEl) {
        gitListEl.innerHTML = '';
        if (git.files.length === 0) {
            gitListEl.innerHTML = '<li style="padding:10px; color:var(--text-muted);">Working tree clean.</li>';
            return;
        }

        const maxDisplay = 100;
        const slice = git.files.slice(0, maxDisplay);
        slice.forEach(f => {
            const li = document.createElement('li');
            li.className = 'git-file-item';
            li.innerHTML = `
                <span class="git-status-tag ${f.status}">${f.status.toUpperCase()[0]}</span>
                <span style="flex:1; margin-left:6px; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(f.path)}</span>
            `;
            li.onclick = async () => {
                const diff = await window.AdeClient.getGitDiff(f.path);
                window.AdeDiffViewer.showGitDiff(f.path, diff);
            };
            gitListEl.appendChild(li);
        });

        if (git.files.length > maxDisplay) {
            const moreLi = document.createElement('li');
            moreLi.style.cssText = 'padding:8px 12px; color:var(--text-muted); font-size:11px; font-style:italic;';
            moreLi.textContent = `... and ${git.files.length - maxDisplay} more modified files`;
            gitListEl.appendChild(moreLi);
        }
    }
}

function escapeHtml(text) {
    return (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderEditorTabs(tabs, activePath) {
    const tabbar = document.getElementById('editor-tabbar');
    if (!tabbar) return;
    tabbar.innerHTML = '';

    tabs.forEach(tab => {
        const tabEl = document.createElement('div');
        tabEl.className = `editor-tab ${tab.path === activePath ? 'active' : ''}`;
        tabEl.innerHTML = `
            <span>${tab.name}</span>
            ${tab.dirty ? '<span class="tab-dirty"></span>' : ''}
            <span class="tab-close" data-path="${tab.path}">×</span>
        `;

        tabEl.onclick = (e) => {
            if (e.target.classList.contains('tab-close')) {
                e.stopPropagation();
                window.AdeState.closeFile(tab.path);
                const nextActive = window.AdeState.getActiveTab();
                if (nextActive) {
                    window.AdeMonaco.openFile(nextActive.path);
                }
                return;
            }
            window.AdeMonaco.openFile(tab.path);
        };

        tabbar.appendChild(tabEl);
    });
}

function renderFileTree(tree) {
    const treeHost = document.getElementById('file-tree-host');
    if (!treeHost) return;
    treeHost.innerHTML = '';

    // Group items into nested tree structure
    tree.forEach(item => {
        const li = document.createElement('li');
        li.className = 'tree-item';
        const depth = item.relPath.split('/').length - 1;
        li.style.paddingLeft = `${12 + depth * 12}px`;

        const icon = item.type === 'directory' 
            ? (window.TeleTermIcons ? window.TeleTermIcons.render('folder', { size: 14 }) : '') 
            : (window.TeleTermIcons ? window.TeleTermIcons.render('file-text', { size: 14 }) : '');
        li.innerHTML = `
            <span class="tree-icon">${icon}</span>
            <span class="tree-name">${item.name}</span>
        `;

        if (item.type === 'file') {
            li.onclick = () => window.AdeMonaco.openFile(item.relPath);
        }

        treeHost.appendChild(li);
    });
}
