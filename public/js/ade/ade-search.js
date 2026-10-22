/**
 * TeleTerm ADE Workspace Full-Text Search Controller
 * Mandated by Phase 1 Upgrade Suite:
 * - Full-Text & Regex Workspace Search Tab (Ctrl+Shift+F)
 * - File and path pattern filtering
 * - Grouped results by file with clickable line numbers
 * - Direct Monaco Editor line jump and buffer focus
 */
class AdeSearchController {
    constructor() {
        this.queryInput = null;
        this.includeInput = null;
        this.btnCase = null;
        this.btnWord = null;
        this.btnRegex = null;
        this.btnExecute = null;
        this.btnClear = null;
        this.metaEl = null;
        this.resultsEl = null;

        this.isCaseSensitive = false;
        this.isWordMatch = false;
        this.isRegex = false;
        this.isSearching = false;
        this.lastResults = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        this.queryInput = document.getElementById('workspace-search-input');
        this.includeInput = document.getElementById('workspace-search-include');
        this.btnCase = document.getElementById('btn-search-case');
        this.btnWord = document.getElementById('btn-search-word');
        this.btnRegex = document.getElementById('btn-search-regex');
        this.btnExecute = document.getElementById('btn-execute-search');
        this.btnClear = document.getElementById('btn-clear-search');
        this.metaEl = document.getElementById('workspace-search-meta');
        this.resultsEl = document.getElementById('workspace-search-results');

        if (!this.queryInput || !this.resultsEl) {
            console.warn('[AdeSearch] DOM elements not found during init');
            return;
        }

        // Toggle buttons
        if (this.btnCase) {
            this.btnCase.onclick = () => {
                this.isCaseSensitive = !this.isCaseSensitive;
                this.btnCase.classList.toggle('active', this.isCaseSensitive);
                if (this.queryInput.value.trim()) this.executeSearch();
            };
        }

        if (this.btnWord) {
            this.btnWord.onclick = () => {
                this.isWordMatch = !this.isWordMatch;
                this.btnWord.classList.toggle('active', this.isWordMatch);
                if (this.queryInput.value.trim()) this.executeSearch();
            };
        }

        if (this.btnRegex) {
            this.btnRegex.onclick = () => {
                this.isRegex = !this.isRegex;
                this.btnRegex.classList.toggle('active', this.isRegex);
                if (this.queryInput.value.trim()) this.executeSearch();
            };
        }

        if (this.btnExecute) {
            this.btnExecute.onclick = () => this.executeSearch();
        }

        if (this.btnClear) {
            this.btnClear.onclick = () => this.clearSearch();
        }

        this.queryInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.executeSearch();
            }
        });

        if (this.includeInput) {
            this.includeInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.executeSearch();
                }
            });
        }

        // Global shortcut: Ctrl+Shift+F / Cmd+Shift+F
        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                this.activateSearchTab();
            } else if (e.altKey && !e.ctrlKey && !e.metaKey) {
                const k = e.key.toLowerCase();
                if (k === 'c') {
                    e.preventDefault();
                    if (this.btnCase) this.btnCase.click();
                } else if (k === 'w') {
                    e.preventDefault();
                    if (this.btnWord) this.btnWord.click();
                } else if (k === 'r') {
                    e.preventDefault();
                    if (this.btnRegex) this.btnRegex.click();
                }
            }
        });

        this.isInitialized = true;
    }

    activateSearchTab() {
        const searchTabBtn = document.querySelector('.sidebar-tab-btn[data-tab="search"]');
        if (searchTabBtn) {
            searchTabBtn.click();
        }
        setTimeout(() => {
            if (this.queryInput) {
                this.queryInput.focus();
                this.queryInput.select();
            }
        }, 50);
    }

    clearSearch() {
        if (this.queryInput) this.queryInput.value = '';
        if (this.metaEl) this.metaEl.textContent = '';
        if (this.resultsEl) this.resultsEl.innerHTML = '';
        this.lastResults = null;
        if (this.queryInput) this.queryInput.focus();
    }

    async executeSearch() {
        if (!this.queryInput) return;
        const query = this.queryInput.value.trim();
        if (!query) {
            this.clearSearch();
            return;
        }

        const includePattern = this.includeInput ? this.includeInput.value.trim() : '';

        this.isSearching = true;
        if (this.metaEl) {
            this.metaEl.innerHTML = '<span class="search-spinner">⏳</span> Searching workspace...';
        }
        if (this.resultsEl) {
            this.resultsEl.innerHTML = '';
        }

        try {
            const res = await window.AdeClient.searchWorkspace({
                query,
                isRegex: this.isRegex,
                isCaseSensitive: this.isCaseSensitive,
                isWordMatch: this.isWordMatch,
                includePattern,
                maxResults: 300
            });

            this.isSearching = false;
            this.lastResults = res;

            if (!res.success) {
                if (this.metaEl) {
                    this.metaEl.textContent = `Search error: ${res.error || 'Failed'}`;
                    this.metaEl.style.color = 'var(--accent-red)';
                }
                return;
            }

            if (this.metaEl) {
                this.metaEl.style.color = 'var(--text-secondary)';
                if (res.totalMatches === 0) {
                    this.metaEl.textContent = 'No results found.';
                } else {
                    const matchWord = res.totalMatches === 1 ? 'match' : 'matches';
                    const fileWord = res.totalFiles === 1 ? 'file' : 'files';
                    this.metaEl.textContent = `${res.totalMatches} ${matchWord} across ${res.totalFiles} ${fileWord}`;
                }
            }

            this.renderResults(res.results || [], query);
        } catch (err) {
            this.isSearching = false;
            if (this.metaEl) {
                this.metaEl.textContent = `Search error: ${err.message}`;
                this.metaEl.style.color = 'var(--accent-red)';
            }
        }
    }

    renderResults(files, query) {
        if (!this.resultsEl) return;
        this.resultsEl.innerHTML = '';

        if (files.length === 0) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'search-empty-state';
            emptyEl.textContent = 'No matching text found.';
            this.resultsEl.appendChild(emptyEl);
            return;
        }

        files.forEach(fileObj => {
            const fileGroup = document.createElement('div');
            fileGroup.className = 'search-file-group';

            // Header
            const header = document.createElement('div');
            header.className = 'search-file-header';
            const fileIcon = window.TeleTermIcons ? window.TeleTermIcons.render('file-text', { size: 13 }) : '';
            header.innerHTML = `
                <span class="search-toggle-icon">▼</span>
                <span class="search-file-icon">${fileIcon}</span>
                <span class="search-file-path" title="${escapeHtml(fileObj.path)}">${escapeHtml(fileObj.path)}</span>
                <span class="search-match-count">${fileObj.matches.length}</span>
            `;

            // Matches container
            const matchesContainer = document.createElement('div');
            matchesContainer.className = 'search-matches-list';

            fileObj.matches.forEach(m => {
                const matchItem = document.createElement('div');
                matchItem.className = 'search-match-item';
                matchItem.setAttribute('data-path', fileObj.path);
                matchItem.setAttribute('data-line', m.lineNumber);

                const snippetHtml = this.highlightSnippet(m.lineContent, query, m.matchIndex, m.matchLength);

                matchItem.innerHTML = `
                    <span class="search-line-num">${m.lineNumber}</span>
                    <span class="search-line-content">${snippetHtml}</span>
                `;

                matchItem.onclick = () => {
                    // Open in Monaco and jump to that line!
                    window.AdeMonaco.openFile(fileObj.path, m.lineNumber);
                };

                matchesContainer.appendChild(matchItem);
            });

            // Collapse / Expand toggle
            header.onclick = (e) => {
                if (e.target.closest('.search-match-item')) return;
                const isCollapsed = matchesContainer.style.display === 'none';
                matchesContainer.style.display = isCollapsed ? 'block' : 'none';
                const icon = header.querySelector('.search-toggle-icon');
                if (icon) icon.textContent = isCollapsed ? '▼' : '▶';
            };

            fileGroup.appendChild(header);
            fileGroup.appendChild(matchesContainer);
            this.resultsEl.appendChild(fileGroup);
        });
    }

    highlightSnippet(line, query, matchIdx, matchLen) {
        if (!line) return '';
        if (typeof matchIdx === 'number' && typeof matchLen === 'number' && matchIdx >= 0) {
            const before = escapeHtml(line.slice(0, matchIdx));
            const match = escapeHtml(line.slice(matchIdx, matchIdx + matchLen));
            const after = escapeHtml(line.slice(matchIdx + matchLen));
            return `${before}<mark class="search-highlight">${match}</mark>${after}`;
        }

        // Fallback simple highlight
        const qLower = query.toLowerCase();
        const lLower = line.toLowerCase();
        const idx = lLower.indexOf(qLower);
        if (idx !== -1) {
            const before = escapeHtml(line.slice(0, idx));
            const match = escapeHtml(line.slice(idx, idx + query.length));
            const after = escapeHtml(line.slice(idx + query.length));
            return `${before}<mark class="search-highlight">${match}</mark>${after}`;
        }

        return escapeHtml(line);
    }
}

function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

window.AdeSearch = new AdeSearchController();
