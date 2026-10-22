/**
 * TeleTerm ADE Quick Open / Fuzzy File Search & Symbol Outline Modal
 * Mandated by Phase 1 & Phase 2 Upgrade Suite:
 * - Floating Command Palette style modal (Ctrl+P / Cmd+P for Files)
 * - Monaco Symbol Outline Engine (Ctrl+Shift+O / Cmd+Shift+O or '@' prefix for Symbols)
 * - Substring and fuzzy matching with match scoring
 * - Keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
 * - Live Monaco line preview on arrow navigation & line jump on Enter
 * - Line jump support (e.g., "filename.js:42", ":42")
 * - Direct Monaco Editor opening and buffer focus
 */
class AdeQuickOpenController {
    constructor() {
        this.isOpen = false;
        this.mode = 'file'; // 'file' | 'symbol'
        this.modalEl = null;
        this.inputEl = null;
        this.resultsEl = null;
        this.counterEl = null;
        this.selectedIndex = 0;
        this.filteredResults = [];
        this.allFiles = [];
        this.activeSymbols = [];
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        this.modalEl = document.getElementById('quick-open-modal');
        this.inputEl = document.getElementById('quick-open-input');
        this.resultsEl = document.getElementById('quick-open-results');
        this.counterEl = document.getElementById('quick-open-count');

        if (!this.modalEl || !this.inputEl || !this.resultsEl) {
            console.warn('[QuickOpen] DOM elements not found during init');
            return;
        }

        // Close on background click
        this.modalEl.addEventListener('click', (e) => {
            if (e.target === this.modalEl) {
                this.close();
            }
        });

        // Search input event
        this.inputEl.addEventListener('input', () => {
            this.handleSearch();
        });

        // Keyboard navigation
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigate(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigate(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.selectActive();
            }
        });

        // Global hotkeys: Ctrl+P (Files) & Ctrl+Shift+O (Symbols)
        window.addEventListener('keydown', (e) => {
            const isCtrlOrCmd = e.ctrlKey || e.metaKey;
            if (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'o') {
                e.preventDefault();
                this.open('@');
            } else if (isCtrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                this.toggle('');
            } else if (e.key === 'Escape' && this.isOpen) {
                e.preventDefault();
                this.close();
            }
        });

        this.isInitialized = true;
    }

    async refreshWorkspaceFiles() {
        let tree = window.AdeState?.files?.tree;
        if (!tree || tree.length === 0) {
            try {
                tree = await window.AdeClient.getFilesTree();
            } catch (e) {
                tree = [];
            }
        }
        // Extract only files (exclude directories)
        this.allFiles = (tree || [])
            .filter(item => item.type === 'file')
            .map(item => ({
                name: item.name,
                relPath: item.relPath,
                size: item.size || 0
            }));
    }

    openOutline() {
        return this.open('@');
    }

    async open(initialQuery = '') {
        if (!this.isInitialized) this.init();

        const isSymbolMode = typeof initialQuery === 'string' && initialQuery.startsWith('@');
        this.mode = isSymbolMode ? 'symbol' : 'file';

        if (!isSymbolMode) {
            await this.refreshWorkspaceFiles();
        }

        this.isOpen = true;
        this.modalEl.style.display = 'flex';
        this.inputEl.value = initialQuery || '';
        this.selectedIndex = 0;

        if (this.mode === 'symbol') {
            this.inputEl.placeholder = 'Type a symbol name to search in active file...';
        } else {
            this.inputEl.placeholder = 'Type a file name to search... (:line to jump, @ for symbols)';
        }

        this.handleSearch();

        setTimeout(() => {
            this.inputEl.focus();
            if (initialQuery) {
                this.inputEl.setSelectionRange(initialQuery.length, initialQuery.length);
            } else {
                this.inputEl.select();
            }
        }, 30);
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        if (this.modalEl) this.modalEl.style.display = 'none';

        // If closing in preview state, cancel preview
        if (window.AdeMonaco && typeof window.AdeMonaco.cancelPreview === 'function') {
            window.AdeMonaco.cancelPreview();
        }

        if (window.AdeMonaco && window.AdeMonaco.editor) {
            window.AdeMonaco.editor.focus();
        }
    }

    toggle(initialQuery = '') {
        if (this.isOpen) {
            this.close();
        } else {
            this.open(initialQuery);
        }
    }

    /**
     * Parse query string for file pattern and target line number
     * Examples: ":42", "app.js:42", "main.js#10", "index.js 50", "@myFunc"
     */
    parseQuery(rawQuery) {
        let query = rawQuery.trim();
        let targetLine = null;
        let directActiveFile = null;

        // Check for direct symbol search mode '@...'
        if (query.startsWith('@')) {
            return {
                mode: 'symbol',
                pattern: query.slice(1).trim(),
                targetLine: null,
                directActiveFile: null
            };
        }

        // Check for direct line jump like ":42" or ":line 42"
        const directLineMatch = query.match(/^:(?:line\s*)?(\d+)$/i);
        if (directLineMatch) {
            const activePath = window.AdeState?.files?.activePath || '';
            return {
                mode: 'file',
                pattern: activePath ? activePath.split(/[\/\\]/).pop() : '',
                targetLine: parseInt(directLineMatch[1], 10),
                directActiveFile: activePath
            };
        }

        const match = query.match(/^(.+?)(?::|#|\s+)(\d+)$/);
        if (match) {
            query = match[1].trim();
            targetLine = parseInt(match[2], 10);
        }

        return { mode: 'file', pattern: query, targetLine, directActiveFile: null };
    }

    /**
     * Fuzzy score calculation
     */
    fuzzyScore(target, query) {
        const tLower = target.toLowerCase();
        const qLower = query.toLowerCase();

        // Exact match
        if (tLower === qLower) return 1000;
        // Starts with query
        if (tLower.startsWith(qLower)) return 800 - (target.length - query.length);
        // Substring match
        const subIdx = tLower.indexOf(qLower);
        if (subIdx !== -1) {
            return 500 - subIdx - (target.length - query.length);
        }

        // Fuzzy subsequence match
        let score = 0;
        let qIdx = 0;
        let prevMatchIdx = -1;

        for (let i = 0; i < target.length && qIdx < query.length; i++) {
            if (tLower[i] === qLower[qIdx]) {
                score += 10;
                // Consecutive match bonus
                if (prevMatchIdx === i - 1) score += 20;
                // Word boundary bonus (after slash, dash, underscore, dot)
                if (i === 0 || /[\/\\_\-\.]/.test(target[i - 1])) score += 30;
                // CamelCase bonus
                if (target[i] !== tLower[i] && i > 0 && target[i - 1] === tLower[i - 1]) score += 15;

                prevMatchIdx = i;
                qIdx++;
            }
        }

        return qIdx === query.length ? score : -1;
    }

    handleSearch() {
        const raw = this.inputEl.value;
        const parsed = this.parseQuery(raw);

        if (parsed.mode === 'symbol') {
            this.mode = 'symbol';
            this.handleSymbolSearch(parsed.pattern);
        } else {
            this.mode = 'file';
            this.handleFileSearch(parsed);
        }
    }

    handleSymbolSearch(pattern) {
        let content = '';
        let filePath = window.AdeState?.files?.activePath || '';
        if (window.AdeMonaco && window.AdeMonaco.editor) {
            content = window.AdeMonaco.editor.getValue() || '';
        }

        if (!content && filePath) {
            const tab = window.AdeState?.files?.openTabs.find(t => t.path === filePath);
            if (tab) content = tab.content || '';
        }

        const fileName = filePath ? filePath.split(/[\/\\]/).pop() : 'Active Document';

        if (window.AdeSymbolIndexer) {
            this.activeSymbols = window.AdeSymbolIndexer.indexDocument(content, filePath || 'active.js');
            this.filteredResults = window.AdeSymbolIndexer.filterSymbols(this.activeSymbols, pattern);
        } else {
            this.activeSymbols = [];
            this.filteredResults = [];
        }

        this.selectedIndex = 0;
        this.renderSymbolResults(pattern, fileName);
    }

    handleFileSearch(parsed) {
        const { pattern, targetLine, directActiveFile } = parsed;

        if (directActiveFile) {
            const activeFileObj = this.allFiles.find(f => f.relPath === directActiveFile) || {
                name: directActiveFile.split(/[\/\\]/).pop(),
                relPath: directActiveFile,
                size: 0
            };
            this.filteredResults = [{
                file: activeFileObj,
                score: 2000,
                targetLine
            }];
        } else if (!pattern) {
            // Show recent / top workspace files when empty
            this.filteredResults = this.allFiles.slice(0, 30).map(file => ({
                file,
                score: 0,
                targetLine
            }));
        } else {
            const matches = [];
            for (const file of this.allFiles) {
                // Score against filename first (heavier weight) then full relPath
                const nameScore = this.fuzzyScore(file.name, pattern);
                const pathScore = this.fuzzyScore(file.relPath, pattern);
                const bestScore = Math.max(nameScore * 1.5, pathScore);

                if (bestScore > 0) {
                    matches.push({
                        file,
                        score: bestScore,
                        targetLine
                    });
                }
            }

            matches.sort((a, b) => b.score - a.score);
            this.filteredResults = matches.slice(0, 40);
        }

        this.selectedIndex = 0;
        this.renderFileResults(pattern, targetLine);
    }

    renderSymbolResults(queryPattern, fileName) {
        if (!this.resultsEl) return;
        this.resultsEl.innerHTML = '';

        if (this.counterEl) {
            this.counterEl.textContent = `${this.filteredResults.length} / ${this.activeSymbols.length} symbols in ${fileName}`;
        }

        if (this.filteredResults.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.className = 'quick-open-empty';
            emptyLi.textContent = this.activeSymbols.length === 0
                ? `No code symbols found in ${fileName}`
                : `No matching symbols found for "@${queryPattern}"`;
            this.resultsEl.appendChild(emptyLi);
            return;
        }

        this.filteredResults.forEach((sym, idx) => {
            const li = document.createElement('li');
            li.className = `quick-open-item ${idx === this.selectedIndex ? 'selected' : ''}`;
            li.setAttribute('data-index', idx);

            const scopeTag = sym.containerName ? `<span class="quick-open-scope-tag">${escapeHtml(sym.containerName)}</span>` : '';
            const lineBadge = `<span class="quick-open-line-badge">:line ${sym.line}</span>`;

            li.innerHTML = `
                <span class="quick-open-item-icon">${sym.icon || 'ƒ'}</span>
                <div class="quick-open-item-details">
                    <div class="quick-open-item-name">
                        <span class="symbol-name">${this.highlightMatch(sym.name, queryPattern)}</span>
                        ${scopeTag}
                        ${lineBadge}
                    </div>
                    <div class="quick-open-item-path symbol-detail">${escapeHtml(sym.detail || '')}</div>
                </div>
            `;

            li.onclick = () => {
                this.selectedIndex = idx;
                this.selectActive();
            };

            this.resultsEl.appendChild(li);
        });
    }

    renderFileResults(queryPattern, targetLine) {
        if (!this.resultsEl) return;
        this.resultsEl.innerHTML = '';

        if (this.counterEl) {
            this.counterEl.textContent = `${this.filteredResults.length} / ${this.allFiles.length} files`;
        }

        if (this.filteredResults.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.className = 'quick-open-empty';
            emptyLi.textContent = 'No matching files found';
            this.resultsEl.appendChild(emptyLi);
            return;
        }

        this.filteredResults.forEach((item, idx) => {
            const li = document.createElement('li');
            li.className = `quick-open-item ${idx === this.selectedIndex ? 'selected' : ''}`;
            li.setAttribute('data-index', idx);

            const fileExt = item.file.name.split('.').pop().toLowerCase();
            const icon = this.getFileIcon(fileExt);
            const lineBadge = targetLine ? `<span class="quick-open-line-badge">:line ${targetLine}</span>` : '';

            li.innerHTML = `
                <span class="quick-open-item-icon">${icon}</span>
                <div class="quick-open-item-details">
                    <div class="quick-open-item-name">
                        ${this.highlightMatch(item.file.name, queryPattern)}
                        ${lineBadge}
                    </div>
                    <div class="quick-open-item-path">${this.highlightMatch(item.file.relPath, queryPattern)}</div>
                </div>
            `;

            li.onclick = () => {
                this.selectedIndex = idx;
                this.selectActive();
            };

            this.resultsEl.appendChild(li);
        });
    }

    navigate(direction) {
        if (this.filteredResults.length === 0) return;
        this.selectedIndex = (this.selectedIndex + direction + this.filteredResults.length) % this.filteredResults.length;

        // Update selected class
        const items = this.resultsEl.querySelectorAll('.quick-open-item');
        items.forEach((item, idx) => {
            if (idx === this.selectedIndex) {
                item.classList.add('selected');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });

        // In symbol mode: Preview line dynamically in Monaco
        if (this.mode === 'symbol') {
            const selected = this.filteredResults[this.selectedIndex];
            if (selected && selected.line && window.AdeMonaco && typeof window.AdeMonaco.previewLine === 'function') {
                window.AdeMonaco.previewLine(selected.line);
            }
        }
    }

    selectActive() {
        if (this.filteredResults.length === 0) return;
        const selected = this.filteredResults[this.selectedIndex];
        if (!selected) return;

        if (this.mode === 'symbol') {
            const line = selected.line;
            if (window.AdeMonaco) {
                if (typeof window.AdeMonaco.commitPreview === 'function') {
                    window.AdeMonaco.commitPreview();
                }
                if (typeof window.AdeMonaco.jumpToLine === 'function') {
                    window.AdeMonaco.jumpToLine(line);
                }
            }
            this.close();
            return;
        }

        // File mode
        const filePath = selected.file.relPath;
        const line = selected.targetLine;

        this.close();

        if (window.AdeMonaco) {
            window.AdeMonaco.openFile(filePath, line);
        }
    }

    highlightMatch(text, query) {
        if (!query || !text) return escapeHtml(text || '');
        const qLower = query.toLowerCase();
        const tLower = text.toLowerCase();
        const idx = tLower.indexOf(qLower);

        if (idx !== -1) {
            const before = escapeHtml(text.slice(0, idx));
            const match = escapeHtml(text.slice(idx, idx + query.length));
            const after = escapeHtml(text.slice(idx + query.length));
            return `${before}<mark class="quick-open-highlight">${match}</mark>${after}`;
        }

        // Subsequence fuzzy character highlight
        let result = '';
        let qIdx = 0;
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            if (qIdx < query.length && tLower[i] === qLower[qIdx]) {
                result += `<mark class="quick-open-highlight">${escapeHtml(ch)}</mark>`;
                qIdx++;
            } else {
                result += escapeHtml(ch);
            }
        }
        return qIdx === query.length ? result : escapeHtml(text);
    }

    getFileIcon(ext) {
        if (!window.TeleTermIcons) return '<span class="tt-icon-svg" style="width:14px;height:14px;"></span>';
        const iconNameMap = {
            js: 'code',
            jsx: 'code',
            ts: 'code',
            tsx: 'code',
            json: 'package',
            html: 'globe',
            css: 'palette',
            md: 'file-text',
            py: 'code',
            sh: 'terminal',
            ps1: 'terminal',
            png: 'image',
            jpg: 'image',
            svg: 'image'
        };
        const iconName = iconNameMap[ext] || 'file-text';
        return window.TeleTermIcons.render(iconName, { size: 14, className: 'file-type-icon' });
    }
}

function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

window.AdeQuickOpen = new AdeQuickOpenController();
