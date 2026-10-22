/**
 * TELETERM UNIVERSAL AGENT WATCHER & LOG SNOOPER
 * Automatically detects and monitors running and historical AI Agent sessions
 * across the user's workstation — including OpenClaw, Claude Code, Cursor,
 * Aider, Cline, Roo Code, Windsurf, Ollama, and custom CLI/ADE agents.
 * 
 * Standardizes all transcripts into TeleTerm's unified schema with
 * Thinking drawers, tool executions, and GFM markdown.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile, exec } = require('child_process');

class UniversalAgentManager {
    constructor() {
        this.homeDir = os.homedir();
        this.knownSignatures = [
            {
                id: 'openclaw',
                name: 'OpenClaw Agent',
                processNames: ['openclaw', 'openclaw.exe', 'claw'],
                logDirs: [
                    path.join(this.homeDir, '.openclaw', 'sessions'),
                    path.join(this.homeDir, '.openclaw', 'logs'),
                    path.join(this.homeDir, '.openclaw')
                ],
                icon: '🦞'
            },
            {
                id: 'claude-code',
                name: 'Claude Code CLI',
                processNames: ['claude', 'claude.exe'],
                logDirs: [
                    path.join(this.homeDir, '.claude', 'transcripts'),
                    path.join(this.homeDir, '.claude', 'projects'),
                    path.join(this.homeDir, '.claude')
                ],
                icon: '⚡'
            },
            {
                id: 'aider',
                name: 'Aider AI Pair Programmer',
                processNames: ['aider', 'aider.exe'],
                logDirs: [
                    path.join(process.cwd(), '.aider.chat.history.md'),
                    path.join(this.homeDir, '.aider')
                ],
                icon: '🤖'
            },
            {
                id: 'cursor',
                name: 'Cursor AI IDE',
                processNames: ['cursor', 'cursor.exe'],
                logDirs: [
                    path.join(process.env.APPDATA || '', 'Cursor', 'User', 'workspaceStorage')
                ],
                icon: '🖱️'
            },
            {
                id: 'windsurf',
                name: 'Windsurf IDE (Codeium)',
                processNames: ['windsurf', 'windsurf.exe'],
                logDirs: [
                    path.join(process.env.APPDATA || '', 'Windsurf', 'User', 'workspaceStorage')
                ],
                icon: '🏄'
            },
            {
                id: 'ollama',
                name: 'Ollama Local Models',
                processNames: ['ollama', 'ollama app.exe', 'ollama.exe'],
                logDirs: [
                    path.join(this.homeDir, '.ollama')
                ],
                icon: '🦙'
            }
        ];
    }

    /**
     * Scan running processes on Windows to find active agents
     */
    async getRunningAgentProcesses() {
        return new Promise((resolve) => {
            const cmd = 'Get-Process | Where-Object { $_.ProcessName -match "claude|openclaw|aider|cursor|windsurf|ollama|code" } | Select-Object Id, ProcessName, WorkingSet64 | ConvertTo-Json';
            execFile('powershell.exe', ['-NoProfile', '-Command', cmd], { timeout: 4000 }, (err, stdout) => {
                if (err || !stdout || !stdout.trim()) {
                    return resolve([]);
                }
                try {
                    const parsed = JSON.parse(stdout.trim());
                    const list = Array.isArray(parsed) ? parsed : [parsed];
                    resolve(list.map(p => ({
                        pid: p.Id,
                        name: p.ProcessName,
                        memoryMB: Math.round((p.WorkingSet64 || 0) / (1024 * 1024))
                    })));
                } catch (e) {
                    resolve([]);
                }
            });
        });
    }

    /**
     * Scan local disks and directories for session logs of unsupported agents
     */
    async scanDiscoveredAgents() {
        const running = await this.getRunningAgentProcesses();
        const detected = [];

        for (const sig of this.knownSignatures) {
            const isProcessRunning = running.some(p => 
                sig.processNames.some(pn => p.name.toLowerCase().includes(pn.replace('.exe', '')))
            );

            // Check if log directories exist
            const foundPaths = [];
            for (const d of sig.logDirs) {
                if (fs.existsSync(d)) {
                    foundPaths.push(d);
                }
            }

            const sessions = this._findSessionsInDirs(sig.id, foundPaths);

            if (isProcessRunning || foundPaths.length > 0 || sessions.length > 0) {
                detected.push({
                    id: sig.id,
                    name: sig.name,
                    icon: sig.icon,
                    isRunning: isProcessRunning,
                    foundPaths,
                    sessionCount: sessions.length,
                    sessions: sessions.slice(0, 10)
                });
            }
        }

        return {
            success: true,
            totalRunningProcesses: running.length,
            runningProcesses: running,
            detectedAgents: detected,
            timestamp: new Date().toISOString()
        };
    }

    _findSessionsInDirs(agentId, dirs) {
        const sessions = [];
        const ignoredDirs = new Set(['backups', 'ide', 'cache', 'caches', 'installs', 'analytics', 'plugins', 'skills', 'rules', 'tasks', 'memory', 'file-history', 'shell-snapshots', 'commands', 'session-env']);

        for (const dir of dirs) {
            try {
                if (!fs.existsSync(dir)) continue;
                const stat = fs.statSync(dir);

                // If file directly (e.g. .aider.chat.history.md)
                if (stat.isFile()) {
                    sessions.push({
                        id: path.basename(dir),
                        title: `${agentId} Chat History`,
                        path: dir,
                        updatedAt: new Date(stat.mtimeMs).toISOString(),
                        sizeKB: Math.round(stat.size / 1024)
                    });
                    continue;
                }

                // If directory, read entries
                const entries = fs.readdirSync(dir);
                for (const entry of entries) {
                    if (ignoredDirs.has(entry.toLowerCase()) || entry.startsWith('.')) continue;

                    const full = path.join(dir, entry);
                    try {
                        const s = fs.statSync(full);
                        if (s.isFile() && (entry.endsWith('.jsonl') || entry.endsWith('.json') || entry.endsWith('.md'))) {
                            sessions.push({
                                id: entry,
                                title: entry.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
                                path: full,
                                updatedAt: new Date(s.mtimeMs).toISOString(),
                                sizeKB: Math.round(s.size / 1024)
                            });
                        } else if (s.isDirectory()) {
                            // Subproject folder (e.g. ~/.claude/projects/E--Terminal-control/)
                            try {
                                const subFiles = fs.readdirSync(full);
                                for (const sub of subFiles) {
                                    if (sub.endsWith('.jsonl') || sub.endsWith('.json') || sub.endsWith('.md')) {
                                        const subFull = path.join(full, sub);
                                        const subStat = fs.statSync(subFull);
                                        const cleanProjName = entry.replace(/^[A-Z]--/, '').replace(/--/g, ' / ').replace(/-/g, ' ');
                                        sessions.push({
                                            id: `${entry}/${sub}`,
                                            title: `[${cleanProjName}] ${sub.replace(/\.[^.]+$/, '').substring(0, 12)}...`,
                                            path: subFull,
                                            updatedAt: new Date(subStat.mtimeMs).toISOString(),
                                            sizeKB: Math.round(subStat.size / 1024)
                                        });
                                    }
                                }
                            } catch (subErr) {}
                        }
                    } catch (e) {}
                }
            } catch (e) {}
        }

        return sessions.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    /**
     * Standardize and fetch messages for any unsupported agent session
     */
    async getSessionMessages(agentType, sessionId) {
        const sig = this.knownSignatures.find(s => s.id === agentType);
        if (!sig) {
            return { success: false, error: `Unsupported agent type: ${agentType}` };
        }

        // Locate session file
        let targetFile = null;
        for (const d of sig.logDirs) {
            const candidate = path.join(d, sessionId);
            if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
                targetFile = candidate;
                break;
            }
            if (fs.existsSync(d) && path.basename(d) === sessionId && fs.statSync(d).isFile()) {
                targetFile = d;
                break;
            }
        }

        if (!targetFile) {
            return { success: false, error: `Session not found or is a directory for ${agentType}: ${sessionId}` };
        }

        try {
            const stat = fs.statSync(targetFile);
            const messages = [];

            if (targetFile.endsWith('.jsonl')) {
                const lines = fs.readFileSync(targetFile, 'utf8').split('\n').filter(Boolean);
                for (let i = 0; i < lines.length; i++) {
                    try {
                        const j = JSON.parse(lines[i]);
                        
                        // Claude Code JSONL schema handling
                        if (j.type === 'user' || j.type === 'assistant') {
                            const isUser = j.type === 'user';
                            let contentText = '';
                            let thinkingText = '';
                            const tools = [];

                            const msgContent = j.message?.content || j.content;
                            if (typeof msgContent === 'string') {
                                contentText = msgContent;
                            } else if (Array.isArray(msgContent)) {
                                msgContent.forEach(block => {
                                    if (block.type === 'thinking' && block.thinking) {
                                        thinkingText = (thinkingText ? thinkingText + '\n\n' : '') + block.thinking.trim();
                                    } else if (block.type === 'text' && block.text) {
                                        contentText = (contentText ? contentText + '\n\n' : '') + block.text.trim();
                                    } else if (block.type === 'tool_use') {
                                        tools.push({
                                            name: block.name || 'tool',
                                            action: `Execute ${block.name || 'tool'}`,
                                            summary: typeof block.input === 'object' ? JSON.stringify(block.input).substring(0, 80) : ''
                                        });
                                    }
                                });
                            }

                            if (contentText.trim() || thinkingText.trim() || tools.length > 0) {
                                messages.push({
                                    id: i + 1,
                                    role: isUser ? 'user' : 'assistant',
                                    content: contentText.trim(),
                                    thinking: thinkingText.trim(),
                                    thinkingDuration: thinkingText ? Math.max(3, Math.min(45, Math.round(thinkingText.length / 120))) : null,
                                    tools,
                                    timestamp: j.timestamp || new Date(stat.mtimeMs).toISOString()
                                });
                            }
                        } else if (j.role === 'user' || j.role === 'assistant' || j.type === 'USER_INPUT' || j.type === 'PLANNER_RESPONSE' || j.type === 'model' || (j.content && !j.type)) {
                            // Standard schema fallback
                            const role = j.role || (j.type === 'USER_INPUT' ? 'user' : 'assistant');
                            const content = j.content || j.text || '';
                            if (content.trim()) {
                                messages.push({
                                    id: i + 1,
                                    role,
                                    content: content.trim(),
                                    thinking: j.thinking || j.thought || '',
                                    thinkingDuration: j.thinking ? 8 : null,
                                    tools: j.tool_calls || j.tools || [],
                                    timestamp: j.timestamp || j.created_at || new Date().toISOString()
                                });
                            }
                        }
                    } catch (e) {}
                }
            } else if (targetFile.endsWith('.md')) {
                // Parse markdown transcript (like Aider)
                const text = fs.readFileSync(targetFile, 'utf8');
                const sections = text.split(/(?=^#{1,3}\s+)/m);
                sections.forEach((sec, idx) => {
                    if (!sec.trim()) return;
                    const isUser = sec.toLowerCase().includes('user') || sec.startsWith('> ');
                    messages.push({
                        id: idx + 1,
                        role: isUser ? 'user' : 'assistant',
                        content: sec.trim(),
                        thinking: '',
                        tools: [],
                        timestamp: new Date(stat.mtimeMs).toISOString()
                    });
                });
            } else {
                // Raw text / JSON fallback
                const raw = fs.readFileSync(targetFile, 'utf8');
                messages.push({
                    id: 1,
                    role: 'assistant',
                    content: raw.substring(0, 15000),
                    thinking: '',
                    tools: [],
                    timestamp: new Date(stat.mtimeMs).toISOString()
                });
            }

            return {
                success: true,
                agentType,
                sessionId,
                title: sessionId.replace(/[-_]/g, ' '),
                totalMessages: messages.length,
                messages
            };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }
}

module.exports = new UniversalAgentManager();
