/**
 * TeleTerm ADE Visual Test Dashboard Controller
 * Dual-Pane Test Explorer & Live Log/Error Inspector
 * - Real-time Test Suites status dashboard in bottom dock alongside ConPTY
 * - Dual-pane layout: Filterable Suites Explorer on left, Live Log Console & Error Inspector on right
 * - Filter pills: All, Failed (N), Running, Passed, Core
 * - Real-time Search Filter by test name or filename
 * - Live stdout/stderr streaming from server with auto-scroll
 * - High-visibility Failure Root-Cause Banner with 1-click "Send Error to Agent"
 * - Curated "Verify Core" default runner to avoid UI flooding
 */

class AdeTestDashboardController {
    constructor() {
        this.categories = [];
        this.suitesById = new Map();
        this.suiteOutputs = new Map(); // suiteId -> string
        this.selectedSuiteId = null;
        this.activeFilter = 'all'; // 'all' | 'failed' | 'running' | 'passed' | 'core'
        this.searchQuery = '';
        this.activeRunId = null;
        this.isRunning = false;
        this.stats = {
            total: 0,
            passed: 0,
            failed: 0,
            durationMs: 0
        };
        this.activeDockTab = 'terminal'; // 'terminal' | 'tests'
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        this.bindDockTabs();
        this.bindToolbar();
        this.bindInspector();
        this.bindEvents();
        await this.fetchDiscovery();

        this.isInitialized = true;
    }

    async refresh() {
        return this.fetchDiscovery();
    }

    bindDockTabs() {
        const testsTabBtn = document.getElementById('dock-tab-btn-tests');
        if (testsTabBtn) {
            testsTabBtn.onclick = () => {
                this.switchDockTab('tests');
            };
        }

        // Delegate click for terminal tabs host to switch back to ConPTY terminal
        const termTabsHost = document.getElementById('terminal-tabs-host');
        if (termTabsHost) {
            termTabsHost.addEventListener('click', () => {
                this.switchDockTab('terminal');
            });
        }

        // Topbar "Verify" button triggers fast Core verification and switches to Test tab
        const topbarVerifyBtn = document.getElementById('btn-run-tests');
        if (topbarVerifyBtn) {
            topbarVerifyBtn.onclick = () => {
                this.switchDockTab('tests');
                this.runCore();
            };
        }
    }

    bindToolbar() {
        // Run Core button
        const btnRunCore = document.getElementById('btn-tests-run-core');
        if (btnRunCore) {
            btnRunCore.onclick = () => this.runCore();
        }

        // Run All button
        const btnRunAll = document.getElementById('btn-tests-run-all');
        if (btnRunAll) {
            btnRunAll.onclick = () => this.runAll();
        }

        // Refresh button
        const btnRefresh = document.getElementById('btn-tests-refresh');
        if (btnRefresh) {
            btnRefresh.onclick = () => this.fetchDiscovery();
        }

        // Filter Pills
        const filterPills = document.querySelectorAll('.tests-filter-bar .filter-pill');
        filterPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                const targetFilter = e.currentTarget.getAttribute('data-filter') || 'all';
                this.setFilter(targetFilter);
            });
        });

        // Search Input
        const searchInput = document.getElementById('tests-search-input');
        const clearSearchBtn = document.getElementById('btn-tests-clear-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = (e.target.value || '').trim().toLowerCase();
                if (clearSearchBtn) {
                    clearSearchBtn.style.display = this.searchQuery ? 'block' : 'none';
                }
                this.render();
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.onclick = () => {
                if (searchInput) {
                    searchInput.value = '';
                    this.searchQuery = '';
                    clearSearchBtn.style.display = 'none';
                    this.render();
                }
            };
        }
    }

    bindInspector() {
        // Copy Log Button
        const btnCopy = document.getElementById('btn-test-copy-log');
        if (btnCopy) {
            btnCopy.onclick = () => {
                const content = document.getElementById('tests-log-content');
                if (content && content.textContent) {
                    navigator.clipboard.writeText(content.textContent).then(() => {
                        const origText = btnCopy.textContent;
                        btnCopy.textContent = 'Copied!';
                        setTimeout(() => { btnCopy.textContent = origText; }, 1500);
                    }).catch(err => {
                        console.error('Failed to copy test output:', err);
                    });
                }
            };
        }

        // Clear Log Button
        const btnClear = document.getElementById('btn-test-clear-log');
        if (btnClear) {
            btnClear.onclick = () => {
                if (this.selectedSuiteId) {
                    this.suiteOutputs.set(this.selectedSuiteId, '');
                }
                const content = document.getElementById('tests-log-content');
                if (content) content.textContent = '(Log cleared)';
            };
        }

        // Open in Monaco Editor Button
        const btnOpenFile = document.getElementById('btn-test-open-file');
        if (btnOpenFile) {
            btnOpenFile.onclick = () => {
                if (this.selectedSuiteId) {
                    const suite = this.suitesById.get(this.selectedSuiteId);
                    if (suite) this.openSuiteFile(suite.filename);
                }
            };
        }

        // Send Error to Agent Button
        const btnSendAgent = document.getElementById('btn-test-send-agent');
        if (btnSendAgent) {
            btnSendAgent.onclick = () => {
                if (this.selectedSuiteId) {
                    this.sendErrorToAgent(this.selectedSuiteId);
                }
            };
        }
    }

    setFilter(filterName) {
        this.activeFilter = filterName;
        const filterPills = document.querySelectorAll('.tests-filter-bar .filter-pill');
        filterPills.forEach(pill => {
            if (pill.getAttribute('data-filter') === filterName) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
        this.render();
    }

    switchDockTab(tab) {
        this.activeDockTab = tab;
        const testsTabBtn = document.getElementById('dock-tab-btn-tests');
        const termPanel = document.getElementById('xterm-container');
        const testsPanel = document.getElementById('dock-tests-panel');
        const termTabs = document.querySelectorAll('#terminal-tabs-host .term-tab');

        if (tab === 'tests') {
            if (termPanel) termPanel.style.display = 'none';
            if (testsPanel) testsPanel.style.display = 'flex';
            if (testsTabBtn) testsTabBtn.classList.add('active');
            termTabs.forEach(t => t.classList.remove('active'));
        } else {
            if (testsPanel) testsPanel.style.display = 'none';
            if (termPanel) termPanel.style.display = 'block';
            if (testsTabBtn) testsTabBtn.classList.remove('active');
            if (termTabs.length > 0) termTabs[0].classList.add('active');
            if (window.AdeTerminal && window.AdeTerminal.fitAddon) {
                setTimeout(() => window.AdeTerminal.fitAddon.fit(), 50);
            }
        }
    }

    bindEvents() {
        if (!window.AdeClient) return;

        window.AdeClient.on('test_run_started', (payload) => {
            this.handleRunStarted(payload);
        });

        window.AdeClient.on('test_suite_started', (payload) => {
            this.handleSuiteStarted(payload);
        });

        window.AdeClient.on('test_suite_output', (payload) => {
            this.handleSuiteOutput(payload);
        });

        window.AdeClient.on('test_suite_completed', (payload) => {
            this.handleSuiteCompleted(payload);
        });

        window.AdeClient.on('test_run_finished', (payload) => {
            this.handleRunFinished(payload);
        });
    }

    async fetchDiscovery() {
        try {
            const res = await window.AdeClient.api('/tests/discovery');
            if (res.categories) {
                this.categories = res.categories;
                this.suitesById.clear();
                let total = 0;
                let coreCount = 0;
                this.categories.forEach(cat => {
                    cat.suites.forEach(s => {
                        this.suitesById.set(s.id, s);
                        total++;
                        if (s.isCore) coreCount++;
                    });
                });
                this.stats.total = total;

                // Update Core button label if available
                const btnCore = document.getElementById('btn-tests-run-core');
                if (btnCore && coreCount > 0) {
                    btnCore.textContent = `▶ Verify Core (${coreCount})`;
                }
                const btnCoreFilter = document.getElementById('btn-filter-core');
                if (btnCoreFilter && coreCount > 0) {
                    btnCoreFilter.textContent = `⭐ Core (${coreCount})`;
                }

                // If no suite selected, select the first core suite or first suite
                if (!this.selectedSuiteId) {
                    const firstCore = Array.from(this.suitesById.values()).find(s => s.isCore);
                    if (firstCore) this.selectSuite(firstCore.id, false);
                }

                this.render();
            }
        } catch (e) {
            console.error('[TestDashboard] Failed to discover test suites:', e);
        }
    }

    async runCore() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.stats.passed = 0;
        this.stats.failed = 0;
        this.stats.durationMs = 0;
        this.updateHeaderUI();

        // Mark core suites queued
        this.suitesById.forEach(s => {
            if (s.isCore) {
                s.status = 'queued';
                this.updateSuiteCardUI(s.id);
            }
        });

        try {
            await window.AdeClient.api('/tests/run', {
                method: 'POST',
                body: JSON.stringify({ runCore: true })
            });
        } catch (e) {
            console.error('[TestDashboard] Failed to trigger run core:', e);
            this.isRunning = false;
            this.updateHeaderUI();
        }
    }

    async runAll() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.stats.passed = 0;
        this.stats.failed = 0;
        this.stats.durationMs = 0;
        this.updateHeaderUI();

        // Mark all suites queued
        this.suitesById.forEach(s => {
            s.status = 'queued';
            this.updateSuiteCardUI(s.id);
        });

        try {
            await window.AdeClient.api('/tests/run', {
                method: 'POST',
                body: JSON.stringify({ runAll: true })
            });
        } catch (e) {
            console.error('[TestDashboard] Failed to trigger run all:', e);
            this.isRunning = false;
            this.updateHeaderUI();
        }
    }

    async runSuite(suiteId) {
        const suite = this.suitesById.get(suiteId);
        if (!suite) return;

        suite.status = 'queued';
        this.suiteOutputs.set(suiteId, '');
        this.updateSuiteCardUI(suiteId);
        this.selectSuite(suiteId, true);

        try {
            await window.AdeClient.api('/tests/run', {
                method: 'POST',
                body: JSON.stringify({ suiteId, filename: suite.filename })
            });
        } catch (e) {
            console.error(`[TestDashboard] Failed to run suite ${suiteId}:`, e);
            suite.status = 'failed';
            this.updateSuiteCardUI(suiteId);
        }
    }

    selectSuite(suiteId, scrollToConsole = false) {
        this.selectedSuiteId = suiteId;
        const suite = this.suitesById.get(suiteId);
        if (!suite) return;

        // 1. Update selection highlight in sidebar
        document.querySelectorAll('.test-suite-card').forEach(card => {
            card.classList.remove('selected');
        });
        const activeCard = document.getElementById(`test-card-${suiteId}`);
        if (activeCard) activeCard.classList.add('selected');

        // 2. Update Inspector Header
        const titleEl = document.getElementById('tests-inspector-title');
        const badgeEl = document.getElementById('tests-inspector-badge');
        if (titleEl) {
            titleEl.textContent = `${suite.name} (${suite.filename})`;
            titleEl.title = suite.description || suite.filename;
        }
        if (badgeEl) {
            badgeEl.outerHTML = this.renderStatusPill(suite.status, 'tests-inspector-badge');
        }

        // 3. Error Banner & Agent Button
        const errorBanner = document.getElementById('test-error-banner');
        const errorSnippetEl = document.getElementById('test-error-snippet');
        const btnSendAgent = document.getElementById('btn-test-send-agent');

        if (suite.status === 'failed') {
            if (errorBanner) errorBanner.style.display = 'flex';
            if (errorSnippetEl) {
                errorSnippetEl.textContent = suite.errorSnippet || suite.lastSummary || 'Suite execution returned exit code 1';
            }
            if (btnSendAgent) btnSendAgent.style.display = 'inline-flex';
        } else {
            if (errorBanner) errorBanner.style.display = 'none';
            if (btnSendAgent) btnSendAgent.style.display = 'none';
        }

        // 4. Update Log Content
        const logContent = document.getElementById('tests-log-content');
        const consoleEl = document.getElementById('tests-live-console');
        if (logContent) {
            const cachedOutput = this.suiteOutputs.get(suiteId);
            if (cachedOutput !== undefined && cachedOutput !== '') {
                logContent.textContent = cachedOutput;
            } else if (suite.output) {
                this.suiteOutputs.set(suiteId, suite.output);
                logContent.textContent = suite.output;
            } else if (suite.status === 'running' || suite.status === 'queued') {
                logContent.textContent = `Running suite [${suite.filename}]...\nWaiting for process stdout/stderr...`;
            } else {
                logContent.textContent = `Suite [${suite.filename}] is idle.\nClick "Run" to execute and inspect live output.`;
                // Fetch server-side output cache in background
                window.AdeClient.api(`/tests/output/${suiteId}`).then(res => {
                    if (res && res.output && this.selectedSuiteId === suiteId) {
                        this.suiteOutputs.set(suiteId, res.output);
                        logContent.textContent = res.output;
                        if (consoleEl) consoleEl.scrollTop = consoleEl.scrollHeight;
                    }
                }).catch(() => {});
            }

            if (consoleEl && scrollToConsole) {
                consoleEl.scrollTop = consoleEl.scrollHeight;
            }
        }
    }

    handleSuiteOutput(payload) {
        const { suiteId, data } = payload;
        if (!suiteId || !data) return;

        const prev = this.suiteOutputs.get(suiteId) || '';
        const updated = prev + data;
        this.suiteOutputs.set(suiteId, updated);

        // If currently viewing this suite, stream directly to console
        if (this.selectedSuiteId === suiteId) {
            const logContent = document.getElementById('tests-log-content');
            const consoleEl = document.getElementById('tests-live-console');
            if (logContent) {
                // If previous content was placeholder, replace it
                if (logContent.textContent.startsWith('Click "▶ Verify') || logContent.textContent.startsWith('○ Suite')) {
                    logContent.textContent = data;
                } else {
                    logContent.textContent = updated;
                }
                if (consoleEl) {
                    consoleEl.scrollTop = consoleEl.scrollHeight;
                }
            }
        }
    }

    handleRunStarted(payload) {
        this.activeRunId = payload.runId;
        this.isRunning = true;
        this.stats.passed = 0;
        this.stats.failed = 0;
        this.stats.durationMs = 0;

        const badge = document.getElementById('tests-summary-badge');
        if (badge) {
            badge.className = 'test-badge-running';
            badge.textContent = 'Running...';
        }

        const runAllBtn = document.getElementById('btn-tests-run-all');
        if (runAllBtn) {
            runAllBtn.disabled = true;
            runAllBtn.textContent = '⏳ All...';
        }

        const runCoreBtn = document.getElementById('btn-tests-run-core');
        if (runCoreBtn) {
            runCoreBtn.disabled = true;
            runCoreBtn.textContent = '⏳ Core...';
        }

        // Clear output buffer for suites in this run
        if (payload.suites && Array.isArray(payload.suites)) {
            payload.suites.forEach(s => {
                this.suiteOutputs.set(s.id, '');
            });
            // Auto select first suite of run
            if (payload.suites.length > 0) {
                this.selectSuite(payload.suites[0].id, false);
            }
        }

        this.updateHeaderUI();
    }

    handleSuiteStarted(payload) {
        const suite = this.suitesById.get(payload.suiteId);
        if (suite) {
            suite.status = 'running';
            this.updateSuiteCardUI(payload.suiteId);
        }

        // Auto select this running suite if nothing selected or previous was idle
        if (!this.selectedSuiteId || (this.suitesById.get(this.selectedSuiteId) && this.suitesById.get(this.selectedSuiteId).status === 'idle')) {
            this.selectSuite(payload.suiteId, false);
        } else if (this.selectedSuiteId === payload.suiteId) {
            this.selectSuite(payload.suiteId, false);
        }
    }

    handleSuiteCompleted(payload) {
        const suite = this.suitesById.get(payload.suiteId);
        if (suite) {
            suite.status = payload.passed ? 'passed' : 'failed';
            suite.lastDurationMs = payload.durationMs;
            suite.lastSummary = payload.summary;
            suite.exitCode = payload.exitCode;
            suite.errorSnippet = payload.errorSnippet;
            if (payload.output) {
                this.suiteOutputs.set(payload.suiteId, payload.output);
            }
            this.updateSuiteCardUI(payload.suiteId);
        }

        if (payload.passed) this.stats.passed++;
        else this.stats.failed++;
        this.stats.durationMs += (payload.durationMs || 0);

        // If this suite failed, auto-select it immediately so the user can see error details!
        if (!payload.passed) {
            this.selectSuite(payload.suiteId, true);
        } else if (this.selectedSuiteId === payload.suiteId) {
            this.selectSuite(payload.suiteId, false);
        }

        this.updateHeaderUI();
    }

    handleRunFinished(payload) {
        this.isRunning = false;
        this.activeRunId = null;

        // Dispatch system-wide verification status event for quests and landmarks
        window.dispatchEvent(new CustomEvent('teleterm:verification-status', {
            detail: {
                status: payload.passed ? 'passed' : 'failed',
                passedCount: payload.passedCount || 0,
                failedCount: payload.failedCount || 0,
                totalCount: payload.totalCount || 0
            }
        }));

        const badge = document.getElementById('tests-summary-badge');
        if (badge) {
            if (payload.passed) {
                badge.className = 'test-badge-pass';
                badge.textContent = `Passed (${payload.passedCount}/${payload.totalCount})`;
            } else {
                badge.className = 'test-badge-fail';
                badge.textContent = `Failed (${payload.failedCount}/${payload.totalCount})`;
            }
        }

        const runAllBtn = document.getElementById('btn-tests-run-all');
        if (runAllBtn) {
            runAllBtn.disabled = false;
            runAllBtn.textContent = 'Run All';
        }

        const runCoreBtn = document.getElementById('btn-tests-run-core');
        if (runCoreBtn) {
            runCoreBtn.disabled = false;
            runCoreBtn.textContent = 'Verify Core';
        }

        this.updateHeaderUI();
    }

    updateHeaderUI() {
        const countTotal = document.getElementById('tests-count-total');
        const countPassed = document.getElementById('tests-count-passed');
        const countFailed = document.getElementById('tests-count-failed');
        const pillStatFailed = document.getElementById('pill-stat-failed');
        const durationTotal = document.getElementById('tests-duration-total');
        const progressBar = document.getElementById('tests-progress-bar');
        const btnFilterFailed = document.getElementById('btn-filter-failed');

        if (countTotal) countTotal.textContent = this.stats.total;
        if (countPassed) countPassed.textContent = this.stats.passed;
        if (countFailed) countFailed.textContent = this.stats.failed;
        if (durationTotal) durationTotal.textContent = `${this.stats.durationMs}ms`;

        // Update Failed Filter Pill
        if (btnFilterFailed) {
            btnFilterFailed.textContent = `Failed (${this.stats.failed})`;
            if (this.stats.failed > 0) {
                btnFilterFailed.classList.add('has-failures');
            } else {
                btnFilterFailed.classList.remove('has-failures');
            }
        }

        if (pillStatFailed) {
            if (this.stats.failed > 0) {
                pillStatFailed.style.borderColor = 'rgba(248, 81, 73, 0.8)';
            } else {
                pillStatFailed.style.borderColor = '';
            }
        }

        if (progressBar && this.stats.total > 0) {
            const completed = this.stats.passed + this.stats.failed;
            const pct = Math.round((completed / this.stats.total) * 100);
            progressBar.style.width = `${pct}%`;
            if (this.stats.failed > 0) {
                progressBar.style.background = 'var(--accent-red)';
            } else {
                progressBar.style.background = 'var(--accent-green)';
            }
        }
    }

    sendErrorToAgent(suiteId) {
        const suite = this.suitesById.get(suiteId);
        if (!suite) return;

        const output = this.suiteOutputs.get(suiteId) || suite.output || suite.lastSummary || '';
        const snippet = suite.errorSnippet || suite.lastSummary || 'Exit code 1';

        const promptText = `Test suite "${suite.filename}" (${suite.name}) failed!\n\nError Summary:\n${snippet}\n\nLast Output Log:\n\`\`\`\n${output.slice(-1500)}\n\`\`\`\n\nPlease analyze the root cause of this failure in test/${suite.filename}, verify the affected components, and provide a fix.`;

        const promptInput = document.getElementById('agent-prompt-input');
        if (promptInput) {
            promptInput.value = promptText;
            promptInput.focus();

            // Add @file chip for this test file if context pills tray exists
            if (window.AdeAgentDeck && typeof window.AdeAgentDeck.addContextPill === 'function') {
                window.AdeAgentDeck.addContextPill({ type: 'file', label: `test/${suite.filename}` });
            }

            // Visual confirmation
            const btnSendAgent = document.getElementById('btn-test-send-agent');
            if (btnSendAgent) {
                const orig = btnSendAgent.textContent;
                btnSendAgent.textContent = 'Sent to Agent Prompt!';
                setTimeout(() => { btnSendAgent.textContent = orig; }, 2000);
            }
        }
    }

    render() {
        const treeEl = document.getElementById('dock-tests-tree');
        if (!treeEl) return;
        treeEl.innerHTML = '';

        this.updateHeaderUI();

        let visibleSuitesCount = 0;

        this.categories.forEach(cat => {
            // Apply filtering logic
            const filteredSuites = cat.suites.filter(suite => {
                // 1. Search Query
                if (this.searchQuery) {
                    const matchName = (suite.name || '').toLowerCase().includes(this.searchQuery);
                    const matchFn = (suite.filename || '').toLowerCase().includes(this.searchQuery);
                    const matchDesc = (suite.description || '').toLowerCase().includes(this.searchQuery);
                    if (!matchName && !matchFn && !matchDesc) return false;
                }

                // 2. Filter Pill
                switch (this.activeFilter) {
                    case 'failed':
                        return suite.status === 'failed';
                    case 'running':
                        return suite.status === 'running' || suite.status === 'queued';
                    case 'passed':
                        return suite.status === 'passed';
                    case 'core':
                        return suite.isCore === true;
                    case 'all':
                    default:
                        return true;
                }
            });

            if (filteredSuites.length === 0) return;
            visibleSuitesCount += filteredSuites.length;

            const groupEl = document.createElement('div');
            groupEl.className = 'test-category-group';

            const headerEl = document.createElement('div');
            headerEl.className = 'test-category-header';
                const folderIcon = window.TeleTermIcons ? window.TeleTermIcons.render('folder', { size: 12 }) : '';
                headerEl.innerHTML = `
                    <div class="category-header-title">
                        <span class="category-icon" style="display:inline-flex;align-items:center;">${folderIcon}</span>
                        <span class="category-name">${escapeHtml(cat.name)}</span>
                    </div>
                    <span class="category-count">${filteredSuites.length} suites</span>
                `;

                const cardsContainer = document.createElement('div');
                cardsContainer.className = 'test-category-cards';

                filteredSuites.forEach(suite => {
                    const card = document.createElement('div');
                    const isSelected = this.selectedSuiteId === suite.id;
                    card.className = `test-suite-card status-${suite.status || 'idle'}${isSelected ? ' selected' : ''}`;
                    card.id = `test-card-${suite.id}`;

                    const durationText = suite.lastDurationMs ? `${suite.lastDurationMs}ms` : (suite.isCore ? '~1s' : '');
                    const statusBadge = this.renderStatusPill(suite.status);
                    const starIcon = window.TeleTermIcons ? window.TeleTermIcons.render('sparkles', { size: 11 }) : '*';
                    const starBadge = suite.isCore ? `<span class="suite-core-star" title="Core Verification Suite" style="display:inline-flex;align-items:center;">${starIcon}</span>` : '';
                    const playIcon = window.TeleTermIcons ? window.TeleTermIcons.render('play', { size: 10 }) : '>';

                    card.innerHTML = `
                        <div class="suite-info-col">
                            <div class="suite-title-row">
                                ${starBadge}
                                <span class="suite-name" title="${escapeHtml(suite.name)}">${escapeHtml(suite.name)}</span>
                                <span class="suite-filename">${escapeHtml(suite.filename)}</span>
                            </div>
                            <div class="suite-desc">${escapeHtml(suite.description)}</div>
                        </div>
                        <div class="suite-actions-col">
                            <span class="suite-duration-badge">${durationText}</span>
                            <div class="suite-status-wrapper" id="suite-status-${suite.id}">
                                ${statusBadge}
                            </div>
                            <button class="ade-btn ade-btn-sm btn-run-single" data-suite-id="${suite.id}" title="Run only this test suite" style="display:inline-flex;align-items:center;justify-content:center;">${playIcon}</button>
                        </div>
                    `;

                // Clicking anywhere on card selects and shows logs in Inspector
                card.onclick = () => {
                    this.selectSuite(suite.id, false);
                };

                // Run button
                const runBtn = card.querySelector('.btn-run-single');
                if (runBtn) {
                    runBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.runSuite(suite.id);
                    };
                }

                cardsContainer.appendChild(card);
            });

            groupEl.appendChild(headerEl);
            groupEl.appendChild(cardsContainer);
            treeEl.appendChild(groupEl);
        });

        // If no suites matched filter
        if (visibleSuitesCount === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.style.cssText = 'padding: 24px; text-align: center; color: var(--text-muted); font-size: 11.5px;';
                const searchSvg = window.TeleTermIcons ? window.TeleTermIcons.render('compass', { size: 24 }) : '';
                emptyEl.innerHTML = `
                    <div style="display:flex;justify-content:center;margin-bottom:6px;">${searchSvg}</div>
                    <div>No test suites match filter: <strong>${escapeHtml(this.activeFilter)}</strong></div>
                    ${this.searchQuery ? `<div>Search: "${escapeHtml(this.searchQuery)}"</div>` : ''}
                    <button class="ade-btn ade-btn-sm" style="margin-top: 10px;" onclick="window.AdeTestDashboard.setFilter('all')">Show All Suites</button>
                `;
                treeEl.appendChild(emptyEl);
            }
        }

        renderStatusPill(status, customId = '') {
            const idAttr = customId ? ` id="${customId}"` : '';
            const checkIcon = window.TeleTermIcons ? window.TeleTermIcons.render('check', { size: 11 }) : '';
            const xIcon = window.TeleTermIcons ? window.TeleTermIcons.render('x', { size: 11 }) : '';
            const zapIcon = window.TeleTermIcons ? window.TeleTermIcons.render('zap', { size: 11 }) : '';
            const clockIcon = window.TeleTermIcons ? window.TeleTermIcons.render('clock', { size: 11 }) : '';
            const circleIcon = window.TeleTermIcons ? window.TeleTermIcons.render('circle', { size: 10 }) : '';

            switch (status) {
                case 'passed':
                    return `<span${idAttr} class="suite-pill pill-pass" style="display:inline-flex;align-items:center;gap:4px;">${checkIcon} <span>Passed</span></span>`;
                case 'failed':
                    return `<span${idAttr} class="suite-pill pill-fail" style="display:inline-flex;align-items:center;gap:4px;">${xIcon} <span>Failed</span></span>`;
                case 'running':
                    return `<span${idAttr} class="suite-pill pill-running" style="display:inline-flex;align-items:center;gap:4px;">${zapIcon} <span>Running</span></span>`;
                case 'queued':
                    return `<span${idAttr} class="suite-pill pill-queued" style="display:inline-flex;align-items:center;gap:4px;">${clockIcon} <span>Queued</span></span>`;
                default:
                    return `<span${idAttr} class="suite-pill pill-idle" style="display:inline-flex;align-items:center;gap:4px;">${circleIcon} <span>Idle</span></span>`;
            }
        }

    updateSuiteCardUI(suiteId) {
        const suite = this.suitesById.get(suiteId);
        if (!suite) return;

        const card = document.getElementById(`test-card-${suiteId}`);
        const statusWrapper = document.getElementById(`suite-status-${suiteId}`);

        if (card) {
            const isSelected = this.selectedSuiteId === suiteId;
            card.className = `test-suite-card status-${suite.status || 'idle'}${isSelected ? ' selected' : ''}`;
            const durBadge = card.querySelector('.suite-duration-badge');
            if (durBadge && suite.lastDurationMs) {
                durBadge.textContent = `${suite.lastDurationMs}ms`;
            }
        }

        if (statusWrapper) {
            statusWrapper.innerHTML = this.renderStatusPill(suite.status);
        }

        // If currently inspected, update inspector badge & banner
        if (this.selectedSuiteId === suiteId) {
            const badgeEl = document.getElementById('tests-inspector-badge');
            if (badgeEl) {
                badgeEl.outerHTML = this.renderStatusPill(suite.status, 'tests-inspector-badge');
            }
            const errorBanner = document.getElementById('test-error-banner');
            const errorSnippetEl = document.getElementById('test-error-snippet');
            const btnSendAgent = document.getElementById('btn-test-send-agent');
            if (suite.status === 'failed') {
                if (errorBanner) errorBanner.style.display = 'flex';
                if (errorSnippetEl) {
                    errorSnippetEl.textContent = suite.errorSnippet || suite.lastSummary || 'Suite execution returned exit code 1';
                }
                if (btnSendAgent) btnSendAgent.style.display = 'inline-flex';
            } else if (suite.status === 'passed') {
                if (errorBanner) errorBanner.style.display = 'none';
                if (btnSendAgent) btnSendAgent.style.display = 'none';
            }
        }
    }

    openSuiteFile(filename) {
        if (window.AdeMonaco) {
            const relPath = `test/${filename}`;
            window.AdeMonaco.openFile(relPath);
        }
    }
}

function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.AdeTestDashboard = new AdeTestDashboardController();
