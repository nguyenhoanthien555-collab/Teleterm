/**
 * TeleTerm ADE Monaco Editor Controller
 * Mandated by Master Plan Section 46 & 47:
 * - Real syntax highlighting, dirty buffer tracking
 * - External file change reconciliation (Clean: auto refresh; Dirty: prompt user)
 * - Selection extraction for @code context
 */
class AdeMonacoController {
    constructor() {
        this.editor = null;
        this.models = new Map(); // Map<filePath, monaco.editor.ITextModel>
        this.currentPath = null;
        this.isInitialized = false;
    }

    init() {
        return new Promise((resolve) => {
            if (typeof require === 'undefined') {
                console.error('Monaco AMD loader not available');
                return resolve(false);
            }

            require.config({ paths: { vs: '/vendor/monaco/vs' } });
            require(['vs/editor/editor.main'], () => {
                const container = document.getElementById('monaco-editor-host');
                if (!container) return resolve(false);

                // Define custom clean dark theme
                monaco.editor.defineTheme('teleterm-dark', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
                        { token: 'keyword', foreground: 'ff7b72' },
                        { token: 'string', foreground: 'a5d6ff' },
                        { token: 'number', foreground: '79c0ff' },
                        { token: 'type', foreground: 'ffa657' }
                    ],
                    colors: {
                        'editor.background': '#0d1117',
                        'editor.foreground': '#c9d1d9',
                        'editor.lineHighlightBackground': '#161b22',
                        'editorLineNumber.foreground': '#6e7681',
                        'editorLineNumber.activeForeground': '#c9d1d9',
                        'editorIndentGuide.background': '#21262d',
                        'editorIndentGuide.activeBackground': '#30363d',
                        'editor.selectionBackground': '#264f78'
                    }
                });

                this.editor = monaco.editor.create(container, {
                    theme: 'teleterm-dark',
                    fontFamily: 'JetBrains Mono, Consolas, monospace',
                    fontSize: 13,
                    lineHeight: 20,
                    automaticLayout: true,
                    minimap: { enabled: true, maxColumn: 80 },
                    scrollBeyondLastLine: false,
                    tabSize: 4,
                    wordWrap: 'on'
                });

                // Listen for editor changes to update dirty state
                this.editor.onDidChangeModelContent(() => {
                    if (!this.currentPath) return;
                    const tab = window.AdeState.getActiveTab();
                    if (!tab) return;
                    const currentVal = this.editor.getValue();
                    const isDirty = currentVal !== tab.originalContent;
                    window.AdeState.setFileDirty(this.currentPath, isDirty);
                    tab.content = currentVal;
                });

                // Ctrl+S to save
                this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                    this.saveCurrentFile();
                });

                // Ctrl+P / Cmd+P to open file search
                this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
                    if (window.AdeQuickOpen) window.AdeQuickOpen.open('');
                });

                // Ctrl+Shift+O / Cmd+Shift+O to open Symbol Outline
                this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyO, () => {
                    if (window.AdeQuickOpen) window.AdeQuickOpen.open('@');
                });

                this.isInitialized = true;

                // Subscribe to external file changes for reconciliation
                window.AdeClient.on('file_changed', (payload) => {
                    this.handleExternalFileChange(payload);
                });

                resolve(true);
            });
        });
    }

    getLanguageForPath(filePath) {
        const ext = filePath.split('.').pop().toLowerCase();
        const map = {
            js: 'javascript',
            jsx: 'javascript',
            ts: 'typescript',
            tsx: 'typescript',
            json: 'json',
            html: 'html',
            css: 'css',
            md: 'markdown',
            py: 'python',
            sh: 'shell',
            ps1: 'powershell',
            sql: 'sql',
            yaml: 'yaml',
            yml: 'yaml'
        };
        return map[ext] || 'plaintext';
    }

    async openFile(filePath, lineNumber = null) {
        if (!this.isInitialized) return;

        // Check if tab already exists in state
        let tab = window.AdeState.files.openTabs.find(t => t.path === filePath);
        if (!tab) {
            try {
                const fileData = await window.AdeClient.readFile(filePath);
                if (fileData.isBinary) {
                    alert(`Cannot edit binary file: ${filePath}`);
                    return;
                }
                window.AdeState.openFile(filePath, fileData.content, fileData.revision, fileData.contentHash);
                tab = window.AdeState.getActiveTab();
            } catch (e) {
                alert(`Failed to open file: ${e.message}`);
                return;
            }
        } else {
            window.AdeState.files.activePath = filePath;
            window.AdeState.notify('editor_tabs');
        }

        this.currentPath = filePath;

        // Get or create Monaco TextModel
        let model = this.models.get(filePath);
        if (!model) {
            const lang = this.getLanguageForPath(filePath);
            model = monaco.editor.createModel(tab.content, lang, monaco.Uri.file(filePath));
            this.models.set(filePath, model);
        }

        this.editor.setModel(model);
        this.hideReconcileBanner();

        if (lineNumber && typeof lineNumber === 'number' && lineNumber > 0) {
            this.editor.revealLineInCenter(lineNumber);
            this.editor.setPosition({ lineNumber, column: 1 });
        }
        this.editor.focus();

        // Switch view to editor container if diff viewer is active
        document.getElementById('monaco-editor-host').style.display = 'block';
        document.getElementById('ade-diff-container').classList.remove('visible');
    }

    async saveCurrentFile() {
        if (!this.currentPath) return;
        const tab = window.AdeState.getActiveTab();
        if (!tab || !tab.dirty) return;

        try {
            const currentContent = this.editor.getValue();
            const res = await window.AdeClient.writeFile(this.currentPath, currentContent, tab.revision, tab.contentHash);
            tab.originalContent = currentContent;
            tab.revision = res.revision;
            tab.contentHash = res.contentHash;
            window.AdeState.setFileDirty(this.currentPath, false);
            this.hideReconcileBanner();
        } catch (e) {
            alert(`Save failed: ${e.message}`);
        }
    }

    /**
     * External File Change Reconciliation (Section 47)
     */
    async handleExternalFileChange({ relPath, revision, contentHash }) {
        if (relPath !== this.currentPath) return;
        const tab = window.AdeState.getActiveTab();
        if (!tab) return;

        if (!tab.dirty) {
            // Buffer is CLEAN: Auto-refresh seamlessly
            const fileData = await window.AdeClient.readFile(relPath);
            tab.content = fileData.content;
            tab.originalContent = fileData.content;
            tab.revision = fileData.revision;
            tab.contentHash = fileData.contentHash;
            if (this.editor) {
                this.editor.setValue(fileData.content);
            }
        } else {
            // Buffer is DIRTY: Do NOT overwrite user work! Show reconciliation prompt
            this.showReconcileBanner(relPath);
        }
    }

    showReconcileBanner(filePath) {
        const banner = document.getElementById('reconcile-banner');
        if (banner) {
            banner.classList.add('visible');
            const pathLabel = document.getElementById('reconcile-file-name');
            if (pathLabel) pathLabel.textContent = filePath;
        }
    }

    hideReconcileBanner() {
        const banner = document.getElementById('reconcile-banner');
        if (banner) banner.classList.remove('visible');
    }

    async reloadFromDisk() {
        if (!this.currentPath) return;
        const fileData = await window.AdeClient.readFile(this.currentPath);
        const tab = window.AdeState.getActiveTab();
        if (tab) {
            tab.content = fileData.content;
            tab.originalContent = fileData.content;
            tab.revision = fileData.revision;
            tab.contentHash = fileData.contentHash;
            window.AdeState.setFileDirty(this.currentPath, false);
            this.editor.setValue(fileData.content);
        }
        this.hideReconcileBanner();
    }

    /**
     * Jump directly to line and set cursor
     */
    jumpToLine(lineNumber, column = 1) {
        if (!this.editor || typeof lineNumber !== 'number' || lineNumber < 1) return;
        this.editor.revealLineInCenter(lineNumber);
        this.editor.setPosition({ lineNumber, column });
        this.editor.focus();
    }

    /**
     * Preview line during Quick Open / Symbol navigation without committing cursor permanently
     */
    previewLine(lineNumber, column = 1) {
        if (!this.editor || typeof lineNumber !== 'number' || lineNumber < 1) return;
        if (!this._originalPosBeforePreview) {
            this._originalPosBeforePreview = this.editor.getPosition();
            this._originalScrollTopBeforePreview = this.editor.getScrollTop();
        }
        this.editor.revealLineInCenter(lineNumber);
        this.editor.setPosition({ lineNumber, column });
    }

    /**
     * Cancel line preview and restore previous cursor / scroll position
     */
    cancelPreview() {
        if (!this.editor || !this._originalPosBeforePreview) return;
        this.editor.setPosition(this._originalPosBeforePreview);
        this.editor.setScrollTop(this._originalScrollTopBeforePreview);
        this._originalPosBeforePreview = null;
        this._originalScrollTopBeforePreview = null;
    }

    /**
     * Commit current preview as the final position
     */
    commitPreview() {
        this._originalPosBeforePreview = null;
        this._originalScrollTopBeforePreview = null;
    }

    /**
     * Extract active selection for Context Engine (@code)
     */
    getSelectedCode() {
        if (!this.editor || !this.currentPath) return null;
        const selection = this.editor.getSelection();
        if (!selection || selection.isEmpty()) return null;

        const code = this.editor.getModel().getValueInRange(selection);
        return {
            filePath: this.currentPath,
            startLine: selection.startLineNumber,
            endLine: selection.endLineNumber,
            language: this.getLanguageForPath(this.currentPath),
            code
        };
    }
}

window.AdeMonaco = new AdeMonacoController();
