/**
 * TeleTerm ADE Symbol Indexer Engine
 * Mandated by Phase 2 Upgrade Suite:
 * - Multi-language symbol extraction (JavaScript, TypeScript, Markdown, JSON)
 * - Detects Classes, Functions, Async Methods, Constructors, Exports, Headings, and Properties
 * - Computes accurate 1-indexed line numbers, symbol kind, container scope, and display icons
 * - Fuzzy search filtering and rank scoring
 */

class AdeSymbolIndexer {
    constructor() {
        this.cache = new Map(); // Map<filePath, { hash: string, symbols: Array }>
    }

    /**
     * Map symbol kind to an intuitive visual icon
     */
    getKindIcon(kind) {
        if (window.TeleTermIcons) {
            const iconNameMap = {
                class: 'package',
                interface: 'layers',
                function: 'zap',
                async_function: 'zap',
                method: 'code',
                async_method: 'code',
                constructor: 'settings',
                export: 'upload',
                heading: 'tag',
                property: 'circle-dot',
                variable: 'sliders'
            };
            const iconName = iconNameMap[kind] || 'circle';
            return window.TeleTermIcons.render(iconName, { size: 13, className: 'symbol-kind-icon' });
        }
        return '•';
    }

    /**
     * Extract file extension or language
     */
    detectLanguage(filenameOrPath) {
        if (!filenameOrPath) return 'javascript';
        const clean = filenameOrPath.split('?')[0].split('#')[0];
        const ext = clean.split('.').pop().toLowerCase();
        if (['js', 'jsx', 'mjs', 'cjs'].includes(ext)) return 'javascript';
        if (['ts', 'tsx'].includes(ext)) return 'typescript';
        if (['md', 'markdown'].includes(ext)) return 'markdown';
        if (['json'].includes(ext)) return 'json';
        return ext;
    }

    /**
     * Parse document text into symbols
     */
    indexDocument(content, filenameOrPath = 'file.js') {
        if (!content || typeof content !== 'string') return [];

        const lang = this.detectLanguage(filenameOrPath);
        if (lang === 'markdown') {
            return this.indexMarkdown(content);
        } else if (lang === 'json') {
            return this.indexJson(content);
        } else {
            return this.indexJavaScript(content);
        }
    }

    /**
     * Index JavaScript & TypeScript symbols
     */
    indexJavaScript(content) {
        const symbols = [];
        const lines = content.split('\n');

        let currentClass = null;
        let classIndentLevel = 0;
        let currentIndentLevel = 0;
        let inMultiLineComment = false;

        for (let i = 0; i < lines.length; i++) {
            const lineNum = i + 1;
            const line = lines[i];
            const trimmed = line.trim();

            // Multi-line comment tracking
            if (inMultiLineComment) {
                if (trimmed.includes('*/')) {
                    inMultiLineComment = false;
                }
                continue;
            }
            if (trimmed.startsWith('/*')) {
                if (!trimmed.includes('*/')) {
                    inMultiLineComment = true;
                }
                continue;
            }
            if (trimmed.startsWith('//') || trimmed.length === 0) {
                continue;
            }

            // Track block indentation for scope tracking
            const openBraces = (line.match(/\{/g) || []).length;
            const closeBraces = (line.match(/\}/g) || []).length;

            // 1. Class declarations: [export] [default] class ClassName [extends Parent]
            const classMatch = trimmed.match(/^(?:export\s+)?(?:default\s+)?class\s+([A-Za-z0-9_$]+)(?:\s+extends\s+([A-Za-z0-9_$]+))?/);
            if (classMatch) {
                const className = classMatch[1];
                currentClass = className;
                classIndentLevel = currentIndentLevel;
                symbols.push({
                    name: className,
                    kind: 'class',
                    icon: this.getKindIcon('class'),
                    line: lineNum,
                    containerName: classMatch[2] ? `extends ${classMatch[2]}` : null,
                    detail: trimmed
                });
                currentIndentLevel += (openBraces - closeBraces);
                continue;
            }

            // Check if we exited the active class scope
            if (currentClass && (currentIndentLevel + openBraces - closeBraces) <= classIndentLevel) {
                // If closing braces bring us below or at class level
                if (closeBraces > openBraces && currentIndentLevel <= classIndentLevel) {
                    currentClass = null;
                }
            }

            // 2. Constructor
            const ctorMatch = trimmed.match(/^constructor\s*\(([^)]*)\)\s*\{?/);
            if (ctorMatch) {
                symbols.push({
                    name: 'constructor',
                    kind: 'constructor',
                    icon: this.getKindIcon('constructor'),
                    line: lineNum,
                    containerName: currentClass || null,
                    detail: `constructor(${ctorMatch[1].trim()})`
                });
                currentIndentLevel += (openBraces - closeBraces);
                continue;
            }

            // 3. Named function declarations: [export] [default] [async] function [name](...)
            const funcMatch = trimmed.match(/^(?:export\s+)?(?:default\s+)?(async\s+)?function(?:\s*\*|\s+)\s*([A-Za-z0-9_$]+)\s*\(([^)]*)\)/);
            if (funcMatch) {
                const isAsync = !!funcMatch[1];
                const funcName = funcMatch[2];
                const params = funcMatch[3].trim();
                const kind = isAsync ? 'async_function' : 'function';
                symbols.push({
                    name: funcName,
                    kind,
                    icon: this.getKindIcon(kind),
                    line: lineNum,
                    containerName: currentClass || null,
                    detail: `${isAsync ? 'async ' : ''}function ${funcName}(${params})`
                });
                currentIndentLevel += (openBraces - closeBraces);
                continue;
            }

            // 4. Arrow function or function assigned to const/let/var: const funcName = [async] (...) =>
            const arrowMatch = trimmed.match(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(async\s*)?(?:\(([^)]*)\)|([A-Za-z0-9_$]+))\s*=>/);
            if (arrowMatch) {
                const funcName = arrowMatch[1];
                const isAsync = !!arrowMatch[2];
                const params = (arrowMatch[3] !== undefined ? arrowMatch[3] : arrowMatch[4] || '').trim();
                const kind = isAsync ? 'async_function' : 'function';
                symbols.push({
                    name: funcName,
                    kind,
                    icon: this.getKindIcon(kind),
                    line: lineNum,
                    containerName: currentClass || null,
                    detail: `const ${funcName} = ${isAsync ? 'async ' : ''}(${params}) =>`
                });
                currentIndentLevel += (openBraces - closeBraces);
                continue;
            }

            // 5. Function expression assigned to variable: const funcName = [async] function(...)
            const exprMatch = trimmed.match(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(async\s+)?function\s*\(([^)]*)\)/);
            if (exprMatch) {
                const funcName = exprMatch[1];
                const isAsync = !!exprMatch[2];
                const params = exprMatch[3].trim();
                const kind = isAsync ? 'async_function' : 'function';
                symbols.push({
                    name: funcName,
                    kind,
                    icon: this.getKindIcon(kind),
                    line: lineNum,
                    containerName: currentClass || null,
                    detail: `const ${funcName} = ${isAsync ? 'async ' : ''}function(${params})`
                });
                currentIndentLevel += (openBraces - closeBraces);
                continue;
            }

            // 6. Class / Object methods: [static] [async] [get|set] methodName(...) {
            const methodMatch = trimmed.match(/^(?:(?:public|private|protected|static)\s+)*(async\s+)?(?:(get|set)\s+)?([A-Za-z0-9_$]+)\s*\(([^)]*)\)\s*(?::\s*[^;{]+)?\s*\{?/);
            if (methodMatch) {
                const isAsync = !!methodMatch[1];
                const getterSetter = methodMatch[2];
                const methodName = methodMatch[3];
                const params = methodMatch[4].trim();

                // Exclude common control flow words
                const keywords = ['if', 'while', 'for', 'switch', 'catch', 'with'];
                if (!keywords.includes(methodName)) {
                    const kind = isAsync ? 'async_method' : 'method';
                    const prefix = getterSetter ? `${getterSetter} ` : (isAsync ? 'async ' : '');
                    symbols.push({
                        name: methodName,
                        kind,
                        icon: this.getKindIcon(kind),
                        line: lineNum,
                        containerName: currentClass || null,
                        detail: `${prefix}${methodName}(${params})`
                    });
                    currentIndentLevel += (openBraces - closeBraces);
                    continue;
                }
            }

            // 7. Exported top-level constants / objects: export const FOO = ... or module.exports = { ... }
            const exportConstMatch = trimmed.match(/^export\s+(?:const|let|var)\s+([A-Za-z0-9_$]+)/);
            if (exportConstMatch) {
                const name = exportConstMatch[1];
                symbols.push({
                    name,
                    kind: 'export',
                    icon: this.getKindIcon('export'),
                    line: lineNum,
                    containerName: null,
                    detail: trimmed
                });
                currentIndentLevel += (openBraces - closeBraces);
                continue;
            }

            currentIndentLevel += (openBraces - closeBraces);
            if (currentClass && currentIndentLevel <= classIndentLevel) {
                currentClass = null;
            }
        }

        return symbols;
    }

    /**
     * Index Markdown Headings (# H1, ## H2, etc.)
     */
    indexMarkdown(content) {
        const symbols = [];
        const lines = content.split('\n');
        const headingStack = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/^(#{1,6})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const title = match[2].trim();

                // Find parent heading in stack
                while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= level) {
                    headingStack.pop();
                }
                const parent = headingStack.length > 0 ? headingStack[headingStack.length - 1].title : null;
                headingStack.push({ level, title });

                symbols.push({
                    name: title,
                    kind: 'heading',
                    icon: this.getKindIcon('heading'),
                    line: i + 1,
                    containerName: parent ? `H${level} in ${parent}` : `H${level}`,
                    detail: line.trim()
                });
            }
        }

        return symbols;
    }

    /**
     * Index JSON top-level keys
     */
    indexJson(content) {
        const symbols = [];
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/^\s{1,4}"([^"\\]+)":\s*(.*)$/);
            if (match) {
                const key = match[1];
                const preview = match[2].slice(0, 30);
                symbols.push({
                    name: key,
                    kind: 'property',
                    icon: this.getKindIcon('property'),
                    line: i + 1,
                    containerName: 'JSON',
                    detail: `"${key}": ${preview}`
                });
            }
        }

        return symbols;
    }

    /**
     * Fuzzy score and filter symbols matching a query string
     */
    filterSymbols(symbols, query) {
        if (!symbols || symbols.length === 0) return [];
        const cleanQuery = (query || '').trim().toLowerCase();

        if (!cleanQuery) {
            return symbols;
        }

        const scored = [];
        for (const sym of symbols) {
            const nameLower = sym.name.toLowerCase();
            const containerLower = (sym.containerName || '').toLowerCase();
            let score = -1;

            if (nameLower === cleanQuery) {
                score = 1000;
            } else if (nameLower.startsWith(cleanQuery)) {
                score = 800 - (sym.name.length - cleanQuery.length);
            } else {
                const subIdx = nameLower.indexOf(cleanQuery);
                if (subIdx !== -1) {
                    score = 500 - subIdx - (sym.name.length - cleanQuery.length);
                } else {
                    // Check container
                    const cIdx = containerLower.indexOf(cleanQuery);
                    if (cIdx !== -1) {
                        score = 300 - cIdx;
                    } else {
                        // Subsequence match on symbol name
                        let qIdx = 0;
                        let sBonus = 0;
                        for (let i = 0; i < nameLower.length && qIdx < cleanQuery.length; i++) {
                            if (nameLower[i] === cleanQuery[qIdx]) {
                                sBonus += 10;
                                qIdx++;
                            }
                        }
                        if (qIdx === cleanQuery.length) {
                            score = 100 + sBonus;
                        }
                    }
                }
            }

            if (score > 0) {
                scored.push({ ...sym, score });
            }
        }

        scored.sort((a, b) => b.score - a.score);
        return scored;
    }
}

if (typeof window !== 'undefined') {
    window.AdeSymbolIndexer = new AdeSymbolIndexer();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdeSymbolIndexer };
}
