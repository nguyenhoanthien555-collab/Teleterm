/**
 * TELETERM GFM MARKDOWN RENDERER
 * High-performance, robust GitHub Flavored Markdown parser for TeleTerm Cyber-Studio.
 * Supports: Tables, Headers, Fenced Code Blocks with Run-In-Terminal & Copy,
 * Task Lists, Blockquotes, Links, Bold/Italic/Strikethrough, and Inline Code.
 */

export class MarkdownRenderer {
    static escapeHtml(text = '') {
        if (!text) return '';
        return String(text).replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m]));
    }

    static render(markdown = '', options = {}) {
        if (!markdown || typeof markdown !== 'string') return '';

        let text = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // Store code blocks to protect them from downstream regex transforms
        const codeBlocks = [];
        text = text.replace(/```([a-zA-Z0-9_\-\.]*)\n([\s\S]*?)```/g, (match, lang, code) => {
            const index = codeBlocks.length;
            const cleanLang = (lang || 'code').trim().toLowerCase();
            const trimmedCode = code.trim();
            const encodedCode = encodeURIComponent(trimmedCode);
            const escapedCode = MarkdownRenderer.escapeHtml(trimmedCode);

            // Check if this is an executable terminal script/command (bash, sh, powershell, ps1, cmd, zsh, terminal)
            const isTerminalCommand = ['bash', 'sh', 'powershell', 'ps1', 'cmd', 'zsh', 'terminal', 'shell', 'batch'].includes(cleanLang) ||
                cleanLang === '' && (trimmedCode.startsWith('git ') || trimmedCode.startsWith('npm ') || trimmedCode.startsWith('pnpm ') || trimmedCode.startsWith('node '));

            const playIcon = window.TeleTermIcons ? window.TeleTermIcons.render('play', { size: 11 }) : '';
            const copyIcon = window.TeleTermIcons ? window.TeleTermIcons.render('clipboard', { size: 11 }) : '';

            const runBtn = isTerminalCommand
                ? `<button class="btn-run-term-code" data-code="${encodedCode}" title="Execute in active Terminal tab" style="display:inline-flex;align-items:center;gap:4px;">${playIcon} <span>Run in Terminal</span></button>`
                : '';

            const blockHtml = `
                <div class="code-block-box">
                    <div class="code-block-head">
                        <span class="code-lang-badge">${cleanLang || 'plaintext'}</span>
                        <div class="code-block-actions">
                            <button class="btn-copy-code" data-code="${encodedCode}" title="Copy code to clipboard" style="display:inline-flex;align-items:center;gap:4px;">${copyIcon} <span>Copy</span></button>
                            ${runBtn}
                        </div>
                    </div>
                    <pre><code class="language-${cleanLang}">${escapedCode}</code></pre>
                </div>
            `;
            codeBlocks.push(blockHtml);
            return `⟦CODE_${index}⟧`;
        });

        // Store inline codes to protect them
        const inlineCodes = [];
        text = text.replace(/`([^`\n]+)`/g, (match, code) => {
            const index = inlineCodes.length;
            inlineCodes.push(`<code class="code-inline">${MarkdownRenderer.escapeHtml(code)}</code>`);
            return `⟦INLINE_${index}⟧`;
        });

        // Store links and images to protect URLs with underscores/special chars
        const links = [];
        text = text.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
            const index = links.length;
            let finalSrc = src;
            if (src.startsWith('file:///')) {
                const cleanPath = decodeURIComponent(src.replace(/^file:\/\/\//, ''));
                finalSrc = `/api/files/download?path=${encodeURIComponent(cleanPath)}`;
            }
            links.push(`<img src="${finalSrc}" alt="${MarkdownRenderer.escapeHtml(alt)}" class="markdown-img" loading="lazy" onerror="this.onerror=null; this.style.display='none';" />`);
            return `⟦LINK_${index}⟧`;
        });
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, (match, label, href) => {
            const index = links.length;
            links.push(`<a href="${href}" target="_blank" rel="noopener noreferrer" class="markdown-link">${MarkdownRenderer.escapeHtml(label)} ↗</a>`);
            return `⟦LINK_${index}⟧`;
        });

        // 1. Parse Markdown Tables
        text = MarkdownRenderer.parseTables(text);

        // 2. Parse Headers
        text = text.replace(/^######\s+(.+)$/gm, '<h6 class="md-h md-h6">$1</h6>');
        text = text.replace(/^#####\s+(.+)$/gm, '<h5 class="md-h md-h5">$1</h5>');
        text = text.replace(/^####\s+(.+)$/gm, '<h4 class="md-h md-h4">$1</h4>');
        text = text.replace(/^###\s+(.+)$/gm, '<h3 class="md-h md-h3">$1</h3>');
        text = text.replace(/^##\s+(.+)$/gm, '<h2 class="md-h md-h2">$1</h2>');
        text = text.replace(/^#\s+(.+)$/gm, '<h1 class="md-h md-h1">$1</h1>');

        // 3. Blockquotes
        text = text.replace(/^(?:>\s*(.+)(?:\n|$))+/gm, (match) => {
            const inner = match.split('\n')
                .map(line => line.replace(/^>\s?/, ''))
                .join('<br>');
            return `<blockquote class="markdown-blockquote">${inner}</blockquote>`;
        });

        // 4. Horizontal Rules: Parse markdown separators
        text = text.replace(/^(?:---|[\*]{3}|_{3})\s*$/gm, '<hr class="markdown-hr">');

        // Collapse consecutive horizontal rules (and whitespace/newlines between them)
        text = text.replace(/(?:<hr class="markdown-hr">[\s\n\r]*){2,}/gi, '<hr class="markdown-hr">');

        // 5. Task lists & Unordered/Ordered Lists
        text = MarkdownRenderer.parseLists(text);

        // 6. Bold, Italic, Strikethrough (GFM compliant)
        text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*([^*\s][^*]*[^*\s]|[^*\s])\*/g, '<em>$1</em>');
        text = text.replace(/(?:^|[\s(])_([^\s_][^_]*[^\s_]|[^_\s])_(?=[\s).,!?]|$)/g, ' <em>$1</em>');
        text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');

        // 7. Paragraphs & Line Breaks
        // Avoid inserting breaks inside table or blockquote tags
        text = text.replace(/\n{2,}/g, '</p><p class="md-p">');
        text = text.replace(/\n/g, '<br>');

        // Wrap loose text in paragraphs
        text = `<p class="md-p">${text}</p>`;

        // Cleanup empty paragraphs or paragraphs wrapping block elements
        text = text.replace(/<p class="md-p">\s*<\/p>/g, '');
        text = text.replace(/<p class="md-p">(<(?:div|table|blockquote|h[1-6]|ul|ol|hr)[^>]*>)/g, '$1');
        text = text.replace(/(<\/(?:div|table|blockquote|h[1-6]|ul|ol|hr)>)<\/p>/g, '$1');

        // Post-processing: deduplicate consecutive <hr> elements even if separated by breaks or paragraphs
        text = text.replace(/(?:<hr\b[^>]*>(?:[\s\n\r]|<br\s*\/?>|<\/?p[^>]*>)*){2,}/gi, '<hr class="markdown-hr">');
        // Remove orphan leading or trailing dividers in bubbles
        text = text.replace(/^(?:[\s\n\r]|<br\s*\/?>|<p[^>]*>)*<hr\b[^>]*>/i, '');
        text = text.replace(/<hr\b[^>]*>(?:[\s\n\r]|<br\s*\/?>|<\/p>)*$/i, '');

        // Restore links and images
        text = text.replace(/⟦LINK_(\d+)⟧/g, (match, idx) => links[Number(idx)] || '');

        // Restore inline codes
        text = text.replace(/⟦INLINE_(\d+)⟧/g, (match, idx) => inlineCodes[Number(idx)] || '');

        // Restore code blocks
        text = text.replace(/⟦CODE_(\d+)⟧/g, (match, idx) => codeBlocks[Number(idx)] || '');

        return text;
    }

    static parseTables(text) {
        // Match table blocks containing headers, separator row, and body rows
        const tableRegex = /((?:^[ \t]*\|[^\n]+\|[ \t]*\n)+)/gm;

        return text.replace(tableRegex, (tableBlock) => {
            const rawLines = tableBlock.trim().split('\n').map(l => l.trim()).filter(Boolean);
            if (rawLines.length < 2) return tableBlock;

            // Check if second line is separator like |---|---|
            const separatorLine = rawLines[1];
            if (!/^[|:\-\s]+$/.test(separatorLine) || !separatorLine.includes('-')) {
                return tableBlock;
            }

            // Extract alignments from separator
            const sepCells = separatorLine.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
            const alignments = sepCells.map(c => {
                if (c.startsWith(':') && c.endsWith(':')) return 'center';
                if (c.endsWith(':')) return 'right';
                if (c.startsWith(':')) return 'left';
                return 'left';
            });

            // Extract headers
            const headerCells = rawLines[0].replace(/^\||\|$/g, '').split('|').map(c => c.trim());
            const thHtml = headerCells.map((h, i) => {
                const align = alignments[i] ? ` style="text-align:${alignments[i]}"` : '';
                return `<th${align}>${h}</th>`;
            }).join('');

            // Extract body rows
            const bodyRowsHtml = rawLines.slice(2).map(rowLine => {
                const cells = rowLine.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
                const tds = cells.map((cell, i) => {
                    const align = alignments[i] ? ` style="text-align:${alignments[i]}"` : '';
                    return `<td${align}>${cell}</td>`;
                }).join('');
                return `<tr>${tds}</tr>`;
            }).join('');

            return `
                <div class="markdown-table-wrapper">
                    <table class="markdown-table">
                        <thead><tr>${thHtml}</tr></thead>
                        <tbody>${bodyRowsHtml}</tbody>
                    </table>
                </div>
            `;
        });
    }

    static parseLists(text) {
        const lines = text.split('\n');
        let inUl = false;
        let inOl = false;
        const result = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Task list item: - [x] or - [ ]
            const taskMatch = line.match(/^(\s*)[-*+]\s+\[([ xX])\]\s+(.+)$/);
            // Normal bullet: - item or * item
            const bulletMatch = !taskMatch && line.match(/^(\s*)[-*+]\s+(.+)$/);
            // Ordered item: 1. item
            const orderMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);

            if (taskMatch) {
                if (!inUl) { result.push('<ul class="markdown-list task-list">'); inUl = true; }
                const checked = taskMatch[2].toLowerCase() === 'x' ? 'checked disabled' : 'disabled';
                result.push(`<li class="task-list-item"><input type="checkbox" ${checked} /> <span>${taskMatch[3]}</span></li>`);
            } else if (bulletMatch) {
                if (!inUl) { result.push('<ul class="markdown-list">'); inUl = true; }
                result.push(`<li>${bulletMatch[2]}</li>`);
            } else if (orderMatch) {
                if (!inOl) { result.push('<ol class="markdown-list ordered">'); inOl = true; }
                result.push(`<li>${orderMatch[2]}</li>`);
            } else {
                if (inUl) { result.push('</ul>'); inUl = false; }
                if (inOl) { result.push('</ol>'); inOl = false; }
                result.push(line);
            }
        }

        if (inUl) result.push('</ul>');
        if (inOl) result.push('</ol>');

        return result.join('\n');
    }

    /**
     * Attaches global click listeners for Copy and Run-In-Terminal actions
     */
    static bindInteractiveButtons(containerEl, onRunInTerminal = null) {
        if (!containerEl) return;

        // Copy button
        containerEl.querySelectorAll('.btn-copy-code').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const code = decodeURIComponent(btn.dataset.code || '');
                navigator.clipboard.writeText(code).then(() => {
                    const originalHtml = btn.innerHTML;
                    const checkSvg = window.TeleTermIcons ? window.TeleTermIcons.render('check', { size: 11 }) : '';
                    btn.innerHTML = `${checkSvg} <span>Copied!</span>`;
                    btn.classList.add('copied');
                    setTimeout(() => {
                        btn.innerHTML = originalHtml;
                        btn.classList.remove('copied');
                    }, 1800);
                });
            };
        });

        // Run in terminal button
        containerEl.querySelectorAll('.btn-run-term-code').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const code = decodeURIComponent(btn.dataset.code || '');
                if (typeof onRunInTerminal === 'function') {
                    onRunInTerminal(code);
                } else {
                    window.dispatchEvent(new CustomEvent('teleterm:run-in-terminal', { detail: { code } }));
                }
                const originalHtml = btn.innerHTML;
                const zapSvg = window.TeleTermIcons ? window.TeleTermIcons.render('zap', { size: 11 }) : '';
                btn.innerHTML = `${zapSvg} <span>Dispatched!</span>`;
                btn.classList.add('dispatched');
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.classList.remove('dispatched');
                }, 1800);
            };
        });
    }
}
