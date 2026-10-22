/**
 * TeleTerm ADE Context Engine
 * Mandated by Master Plan Section 25 to 31:
 * - Reference resolution: @file, @code, @terminal, @terminal:error, @git, images
 * - Token budget accounting and prioritization
 * - Context preview pills generation
 */
class ContextEngine {
    constructor({ fileService, terminalService, gitService, maxTokenBudget = 32000 }) {
        this.fileService = fileService;
        this.terminalService = terminalService;
        this.gitService = gitService;
        this.maxTokenBudget = maxTokenBudget;
    }

    estimateTokens(text) {
        if (!text) return 0;
        return Math.ceil(text.length / 3.8);
    }

    /**
     * Parse raw text prompt for @ mentions:
     * - @file:rel/path.js or @file:rel/path.js:10-50
     * - @terminal or @terminal:error
     * - @git
     * - @code
     */
    extractMentions(promptText) {
        const mentions = [];
        // Match @file:"path"(:L1-L2)? or @file:'path'(:L1-L2)? or @file:path
        const fileRegex = /@file:(?:"([^"]+)"(?::(\d+(?:-\d+)?))?|'([^']+)'(?::(\d+(?:-\d+)?))?|([^\s"']+))/g;
        let match;
        while ((match = fileRegex.exec(promptText)) !== null) {
            let target = match[1] || match[3] || match[5];
            const lineRange = match[2] || match[4] || null;
            if (!match[1] && !match[3] && target) {
                target = target.replace(/[.,;!?]+$/, '');
            }
            mentions.push({ type: 'file', raw: match[0], target, lineRange });
        }

        if (/@terminal:error\b/.test(promptText)) {
            mentions.push({ type: 'terminal_error', raw: '@terminal:error' });
        } else if (/@terminal\b/.test(promptText)) {
            mentions.push({ type: 'terminal', raw: '@terminal' });
        }

        if (/@git\b/.test(promptText)) {
            mentions.push({ type: 'git', raw: '@git' });
        }

        if (/@code\b/.test(promptText)) {
            mentions.push({ type: 'code', raw: '@code' });
        }

        return mentions;
    }

    /**
     * Resolve explicit and implicit context items into normalized attachments
     */
    async resolveContext({ prompt = '', explicitItems = [], codeSelection = null } = {}) {
        const items = [];
        const mentions = this.extractMentions(prompt);

        // 1. Process explicit code selection or @code
        if (codeSelection && codeSelection.code) {
            const tokens = this.estimateTokens(codeSelection.code);
            items.push({
                id: `ctx-code-${Date.now()}`,
                type: 'code',
                label: `@code:${codeSelection.filePath || 'active'} [${codeSelection.startLine || 1}-${codeSelection.endLine || 1}]`,
                priority: 10,
                tokens,
                payload: {
                    filePath: codeSelection.filePath,
                    startLine: codeSelection.startLine,
                    endLine: codeSelection.endLine,
                    code: codeSelection.code
                },
                renderedText: `[Selected Code from ${codeSelection.filePath || 'active buffer'} (Lines ${codeSelection.startLine}-${codeSelection.endLine})]:\n\`\`\`${codeSelection.language || ''}\n${codeSelection.code}\n\`\`\``
            });
        }

        // 2. Process @file mentions
        for (const mention of mentions.filter(m => m.type === 'file')) {
            let targetPath = (mention.target || '').trim();
            let lineRange = mention.lineRange || null;

            // Fallback for paths that had range inside quotes or trailing
            if (!lineRange) {
                const lineRangeMatch = targetPath.match(/:(\d+(?:-\d+)?)$/);
                if (lineRangeMatch) {
                    lineRange = lineRangeMatch[1];
                    targetPath = targetPath.slice(0, targetPath.length - lineRangeMatch[0].length);
                }
            }
            if ((targetPath.startsWith('"') && targetPath.endsWith('"')) || (targetPath.startsWith("'") && targetPath.endsWith("'"))) {
                targetPath = targetPath.slice(1, -1);
            }

            try {
                const fileData = await this.fileService.readFile(targetPath);
                let content = fileData.content || '';

                if (lineRange) {
                    const [s, e] = lineRange.split('-').map(Number);
                    if (!isNaN(s) && !isNaN(e)) {
                        const lines = content.split('\n');
                        content = lines.slice(Math.max(0, s - 1), Math.min(lines.length, e)).join('\n');
                    }
                }

                // If file is very large (> 200KB), truncate to 2000 lines
                const lines = content.split('\n');
                if (lines.length > 2000) {
                    content = lines.slice(0, 2000).join('\n') + `\n\n... [Truncated ${lines.length - 2000} lines] ...`;
                }

                const tokens = this.estimateTokens(content);
                items.push({
                    id: `ctx-file-${targetPath}`,
                    type: 'file',
                    label: `@file:${targetPath}${lineRange ? `:${lineRange}` : ''}`,
                    priority: 8,
                    tokens,
                    payload: { filePath: targetPath, revision: fileData.revision, contentHash: fileData.contentHash },
                    renderedText: `[File Content: ${targetPath} (Revision: ${fileData.revision})]:\n\`\`\`\n${content}\n\`\`\``
                });
            } catch (e) {
                items.push({
                    id: `ctx-file-${targetPath}`,
                    type: 'file',
                    label: `@file:${targetPath} (Error)`,
                    priority: 5,
                    tokens: 20,
                    payload: { filePath: targetPath, error: e.message },
                    renderedText: `[File: ${targetPath} - Could not read: ${e.message}]`
                });
            }
        }

        // 3. Process @terminal:error or @terminal
        const hasTerminalError = mentions.some(m => m.type === 'terminal_error');
        const hasTerminal = mentions.some(m => m.type === 'terminal');
        if (hasTerminalError || hasTerminal) {
            const errInfo = this.terminalService.extractLastError();
            if (errInfo && errInfo.snippet) {
                const snippet = errInfo.snippet;
                const tokens = this.estimateTokens(snippet);
                items.push({
                    id: `ctx-terminal-err`,
                    type: hasTerminalError ? 'terminal_error' : 'terminal',
                    label: hasTerminalError ? '@terminal:error' : '@terminal',
                    priority: 9,
                    tokens,
                    payload: errInfo,
                    renderedText: `[Terminal Execution Context]:\nCWD: ${errInfo.cwd}\nCommand: ${errInfo.command || 'N/A'}\nOutput Snippet:\n\`\`\`\n${snippet}\n\`\`\``
                });
            }
        }

        // 4. Process @git
        if (mentions.some(m => m.type === 'git')) {
            try {
                const gitStatus = await this.gitService.getStatus();
                const gitDiff = await this.gitService.getDiff();
                const diffSnippet = gitDiff.length > 50000 ? gitDiff.slice(0, 50000) + '\n... [Diff Truncated]' : gitDiff;
                const text = `Branch: ${gitStatus.branch}\nStatus: ${gitStatus.isClean ? 'Clean' : `${gitStatus.files.length} changed files`}\nDiff:\n\`\`\`diff\n${diffSnippet}\n\`\`\``;
                items.push({
                    id: `ctx-git`,
                    type: 'git',
                    label: `@git (${gitStatus.branch})`,
                    priority: 6,
                    tokens: this.estimateTokens(text),
                    payload: gitStatus,
                    renderedText: text
                });
            } catch (e) {}
        }

        // 5. Add any explicitly attached items (e.g. image pills, uploaded chips)
        for (const exp of explicitItems) {
            if (exp.type === 'image') {
                items.push({
                    id: exp.id || `ctx-img-${Date.now()}`,
                    type: 'image',
                    label: exp.label || 'Attached Image',
                    priority: 7,
                    tokens: 500, // Fixed baseline budget
                    payload: exp.dataUrl || exp.url,
                    renderedText: `[Attached Image: ${exp.label || 'image'}]`
                });
            }
        }

        // Budget Accounting & Prioritization
        let totalTokens = items.reduce((sum, it) => sum + it.tokens, 0);
        if (totalTokens > this.maxTokenBudget) {
            // Sort ascending by priority so lowest priority gets truncated first
            items.sort((a, b) => a.priority - b.priority);
            while (totalTokens > this.maxTokenBudget && items.length > 1) {
                const removed = items.shift();
                totalTokens -= removed.tokens;
            }
            // If the single remaining item still exceeds maxTokenBudget, truncate it strictly to fit
            if (items.length === 1 && items[0].tokens > this.maxTokenBudget) {
                const maxChars = Math.floor(this.maxTokenBudget * 3.6);
                items[0].renderedText = items[0].renderedText.slice(0, maxChars) + '\n\n... [Content Truncated to fit Context Budget] ...';
                items[0].tokens = this.estimateTokens(items[0].renderedText);
                totalTokens = items[0].tokens;
            } else {
                totalTokens = items.reduce((sum, it) => sum + it.tokens, 0);
            }
            // Re-sort descending by priority
            items.sort((a, b) => b.priority - a.priority);
        }

        // Generate assembled prompt for agent
        const assembledHeader = items.map(it => it.renderedText).join('\n\n');
        const finalPrompt = assembledHeader ? `${assembledHeader}\n\n---\nUser Prompt:\n${prompt}` : prompt;

        // Context Pills for UI rendering
        const pills = items.map(it => ({
            id: it.id,
            type: it.type,
            label: it.label,
            tokens: it.tokens
        }));

        return {
            items,
            pills,
            totalTokens,
            finalPrompt
        };
    }
}

module.exports = { ContextEngine };
