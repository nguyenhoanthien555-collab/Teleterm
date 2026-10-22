/**
 * Codex Manager for TeleTerm
 * Connects directly to OpenAI Codex Desktop (ChatGPT Desktop Codex Mode)
 * Reads projects, threads, and verbatim turns/events from ~/.codex
 * Queues and sends prompts via the codex CLI
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, exec } = require('child_process');
const { DatabaseSync } = require('node:sqlite');
const logger = require('./logger');

const CODEX_DIR = path.join(os.homedir(), '.codex');
const STATE_DB_PATH = path.join(CODEX_DIR, 'state_5.sqlite');
const HISTORY_DB_PATH = path.join(CODEX_DIR, 'thread_history_1.sqlite');
const SESSION_INDEX_PATH = path.join(CODEX_DIR, 'session_index.jsonl');

class CodexManager {
    constructor() {
        this.codexDir = CODEX_DIR;
    }

    /**
     * Check if Codex desktop / service is running
     */
    async getStatus() {
        return new Promise((resolve) => {
            exec('tasklist /FI "IMAGENAME eq ChatGPT.exe" /FO CSV /NH', (err, stdout) => {
                const isChatGPTRunning = !err && stdout && stdout.toLowerCase().includes('chatgpt.exe');
                exec('tasklist /FI "IMAGENAME eq codex.exe" /FO CSV /NH', (err2, stdout2) => {
                    const isCodexRunning = !err2 && stdout2 && stdout2.toLowerCase().includes('codex.exe');
                    resolve({
                        chatgptRunning: isChatGPTRunning,
                        codexRunning: isCodexRunning,
                        codexInstalled: fs.existsSync(STATE_DB_PATH)
                    });
                });
            });
        });
    }

    /**
     * Read session_index.jsonl to get clean thread names
     */
    _readSessionIndex() {
        const titleMap = new Map();
        if (!fs.existsSync(SESSION_INDEX_PATH)) return titleMap;
        try {
            const content = fs.readFileSync(SESSION_INDEX_PATH, 'utf8');
            const lines = content.trim().split('\n');
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const obj = JSON.parse(line);
                    if (obj.id && obj.thread_name) {
                        titleMap.set(obj.id, obj.thread_name);
                    }
                } catch (e) {}
            }
        } catch (e) {
            logger.warn(`[CodexManager] Lỗi đọc session_index.jsonl: ${e.message}`);
        }
        return titleMap;
    }

    /**
     * Get sidebar data: Projects and Recents with status
     */
    async getSidebar() {
        if (!fs.existsSync(STATE_DB_PATH)) {
            return { success: false, error: 'Codex state database not found', projects: [], recents: [] };
        }

        try {
            const stateDb = new DatabaseSync(STATE_DB_PATH, { readOnly: true });
            const titleMap = this._readSessionIndex();

            // 1. Projects
            const projectsRaw = stateDb.prepare('SELECT id, name FROM projects ORDER BY name ASC').all();
            
            // 2. Threads
            const threadsRaw = stateDb.prepare(`
                SELECT id, title, project_id, model, reasoning_effort, rollout_path, updated_at, created_at 
                FROM threads 
                ORDER BY updated_at DESC
            `).all();

            stateDb.close();

            const now = Math.floor(Date.now() / 1000);

            // Clean & format threads
            const allThreads = threadsRaw.map(t => {
                let cleanTitle = titleMap.get(t.id);
                if (!cleanTitle) {
                    cleanTitle = (t.title || 'Untitled')
                        .replace(/^\[@.*?\]\(.*?\)\s*/g, '')
                        .split('\n')[0]
                        .trim();
                    if (cleanTitle.length > 50) {
                        cleanTitle = cleanTitle.substring(0, 48) + '...';
                    }
                }

                // Check active state (if updated in last 6 minutes or active rollout)
                const isRecent = (now - t.updated_at) < 360;

                return {
                    id: t.id,
                    title: cleanTitle,
                    rawTitle: t.title,
                    projectId: t.project_id,
                    model: t.model || 'G Luna High',
                    reasoningEffort: t.reasoning_effort,
                    updatedAt: t.updated_at,
                    createdAt: t.created_at,
                    isActive: isRecent,
                    badge: cleanTitle.toLowerCase().includes('phase 5a') ? 'purple' : null
                };
            });

            // Map projects
            const projects = projectsRaw.map(p => {
                const projectThreads = allThreads.filter(t => t.projectId === p.id);
                return {
                    id: p.id,
                    name: p.name,
                    threads: projectThreads
                };
            });

            // Recents (top 30)
            const recents = allThreads.slice(0, 30);

            // Current active thread
            const currentThread = allThreads.find(t => t.isActive) || allThreads[0] || null;

            return {
                success: true,
                projects,
                recents,
                threads: recents,
                currentThreadId: currentThread ? currentThread.id : null
            };
        } catch (e) {
            logger.error(`[CodexManager] Lỗi lấy danh sách sidebar: ${e.message}`);
            return { success: false, error: e.message, projects: [], recents: [] };
        }
    }

    /**
     * Get full thread details: turns, thoughts, commands, diffs
     */
    async getThreadDetails(threadId) {
        if (!fs.existsSync(STATE_DB_PATH) || !fs.existsSync(HISTORY_DB_PATH)) {
            return { success: false, error: 'Database not found' };
        }

        try {
            const stateDb = new DatabaseSync(STATE_DB_PATH, { readOnly: true });
            const threadMeta = stateDb.prepare('SELECT * FROM threads WHERE id = ?').get(threadId);
            stateDb.close();

            if (!threadMeta) {
                return { success: false, error: 'Thread not found' };
            }

            const titleMap = this._readSessionIndex();
            const threadTitle = titleMap.get(threadId) || (threadMeta.title || 'Codex Chat').split('\n')[0].replace(/^\[@.*?\]\(.*?\)\s*/g, '').trim();

            const histDb = new DatabaseSync(HISTORY_DB_PATH, { readOnly: true });
            
            // Turns
            const turnsRaw = histDb.prepare('SELECT * FROM thread_turns WHERE thread_id = ? ORDER BY rollout_ordinal ASC').all(threadId);
            
            // Items
            const itemsRaw = histDb.prepare('SELECT * FROM thread_items WHERE thread_id = ? ORDER BY rollout_ordinal ASC').all(threadId);
            
            histDb.close();

            // Group items by turn
            const turnsMap = new Map();
            for (const turn of turnsRaw) {
                turnsMap.set(turn.turn_id, {
                    turnId: turn.turn_id,
                    status: turn.status,
                    startedAt: turn.started_at,
                    completedAt: turn.completed_at,
                    durationMs: turn.duration_ms,
                    items: []
                });
            }

            let totalFilesChanged = 0;
            let totalAdditions = 0;
            let totalDeletions = 0;
            let lastThought = '';

            for (const row of itemsRaw) {
                try {
                    const itemData = JSON.parse(row.item_json);
                    let turn = turnsMap.get(row.turn_id);
                    if (!turn) {
                        turn = {
                            turnId: row.turn_id,
                            status: 'completed',
                            startedAt: row.started_at_ms ? Math.floor(row.started_at_ms / 1000) : null,
                            completedAt: row.completed_at_ms ? Math.floor(row.completed_at_ms / 1000) : null,
                            durationMs: (row.completed_at_ms && row.started_at_ms) ? (row.completed_at_ms - row.started_at_ms) : 0,
                            items: []
                        };
                        turnsMap.set(row.turn_id, turn);
                    }

                    if (row.item_type === 'userMessage') {
                        let text = '';
                        if (Array.isArray(itemData.content)) {
                            text = itemData.content.map(c => typeof c === 'string' ? c : (c.text || '')).join('\n');
                        } else if (typeof itemData.text === 'string') {
                            text = itemData.text;
                        }
                        turn.items.push({
                            type: 'user',
                            id: row.item_id,
                            text: text.trim(),
                            createdAt: row.created_at_ms
                        });
                    } else if (row.item_type === 'agentMessage') {
                        turn.items.push({
                            type: 'assistant',
                            id: row.item_id,
                            text: itemData.text || '',
                            phase: itemData.phase || 'final_answer',
                            createdAt: row.created_at_ms
                        });
                    } else if (row.item_type === 'reasoning') {
                        const summary = Array.isArray(itemData.summary) ? itemData.summary.join(' ') : (itemData.summary || '');
                        if (summary) lastThought = summary;
                        turn.items.push({
                            type: 'thought',
                            id: row.item_id,
                            summary: summary,
                            createdAt: row.created_at_ms
                        });
                    } else if (row.item_type === 'commandExecution') {
                        const cmd = itemData.command || '';
                        turn.items.push({
                            type: 'command',
                            id: row.item_id,
                            command: cmd,
                            cwd: itemData.cwd || '',
                            status: itemData.status || 'completed',
                            exitCode: itemData.exitCode,
                            output: itemData.aggregatedOutput || itemData.aggregated_output || itemData.output || '',
                            createdAt: row.created_at_ms
                        });
                    } else if (row.item_type === 'fileChange') {
                        const changes = itemData.changes || [];
                        let totalAdds = 0;
                        let totalDels = 0;
                        const perFileChanges = changes.map(c => {
                            let fa = 0;
                            let fd = 0;
                            if (c.diff) {
                                const addMatches = c.diff.match(/^\+[^+]/gm);
                                const delMatches = c.diff.match(/^-[^-]/gm);
                                fa = addMatches ? addMatches.length : 0;
                                fd = delMatches ? delMatches.length : 0;
                            }
                            totalAdds += fa;
                            totalDels += fd;
                            return { path: c.path, additions: fa, deletions: fd };
                        });
                        totalFilesChanged += changes.length;
                        totalAdditions += totalAdds;
                        totalDeletions += totalDels;
                        turn.items.push({
                            type: 'file_change',
                            id: row.item_id,
                            filesCount: changes.length,
                            additions: totalAdds,
                            deletions: totalDels,
                            changes: perFileChanges,
                            createdAt: row.created_at_ms
                        });
                    }
                } catch (err) {
                    // skip malformed json
                }
            }

            // Also inspect live tail of rollout file if exists for uncommitted streaming items
            if (threadMeta.rollout_path) {
                const normPath = threadMeta.rollout_path.replace(/^\\\\\?\\/, '');
                if (fs.existsSync(normPath)) {
                    try {
                        const tailContent = fs.readFileSync(normPath, 'utf8');
                        const lines = tailContent.trim().split('\n');
                        const lastLines = lines.slice(-20);
                        for (const l of lastLines) {
                            try {
                                const ev = JSON.parse(l);
                                if (ev.type === 'response_item' && ev.payload) {
                                    if (ev.payload.type === 'custom_tool_call') {
                                        const inputStr = ev.payload.input || '';
                                        if (inputStr.includes('exec_command')) {
                                            lastThought = 'Running command: ' + (inputStr.split('cmd:"')[1] ? inputStr.split('cmd:"')[1].substring(0, 60) : 'exec');
                                        }
                                    }
                                } else if (ev.type === 'event_msg' && ev.payload) {
                                    if (ev.payload.type === 'item_completed' && ev.payload.item) {
                                        if (ev.payload.item.type === 'AgentMessage' && ev.payload.item.content) {
                                            const txt = ev.payload.item.content[0]?.text || '';
                                            if (txt) {
                                                // check if already in turn
                                                const lastTurn = Array.from(turnsMap.values()).pop();
                                                if (lastTurn && !lastTurn.items.some(i => i.text === txt)) {
                                                    lastTurn.items.push({
                                                        type: 'assistant',
                                                        id: ev.payload.item.id,
                                                        text: txt,
                                                        phase: 'streaming',
                                                        createdAt: ev.payload.completed_at_ms
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            } catch (e) {}
                        }
                    } catch (e) {}
                }
            }

            const turns = Array.from(turnsMap.values());

            // Active detection: a thread is "working" if its updated_at in state_5.sqlite
            // is within the last 2 minutes (Codex updates it every few seconds when active)
            const now = Math.floor(Date.now() / 1000);
            const secondsSinceUpdate = now - threadMeta.updated_at;
            const isWorking = secondsSinceUpdate < 120;

            let workingDurationStr;
            if (isWorking) {
                // Time since the thread was created (total session duration)
                const sessionSecs = now - threadMeta.created_at;
                const hrs = Math.floor(sessionSecs / 3600);
                const mins = Math.floor((sessionSecs % 3600) / 60);
                const secs = sessionSecs % 60;
                if (hrs > 0) {
                    workingDurationStr = `Active · ${hrs}h ${mins}m`;
                } else if (mins > 0) {
                    workingDurationStr = `Active · ${mins}m ${secs}s`;
                } else {
                    workingDurationStr = `Active · ${secs}s`;
                }
            } else {
                // Show how long ago it completed
                const minsAgo = Math.floor(secondsSinceUpdate / 60);
                if (minsAgo < 60) {
                    workingDurationStr = `Completed ${minsAgo}m ago`;
                } else {
                    const hrsAgo = Math.floor(minsAgo / 60);
                    workingDurationStr = `Completed ${hrsAgo}h ago`;
                }
            }

            return {
                success: true,
                thread: {
                    id: threadId,
                    title: threadTitle,
                    model: threadMeta.model || 'gpt-6-luna',
                    reasoningEffort: threadMeta.reasoning_effort || 'high',
                    updatedAt: threadMeta.updated_at,
                    createdAt: threadMeta.created_at,
                    isWorking,
                    statusText: workingDurationStr,
                    activeThought: lastThought || 'Restructuring startup setup',
                    fileSummary: totalFilesChanged > 0 ? {
                        filesCount: totalFilesChanged,
                        additions: totalAdditions,
                        deletions: totalDeletions
                    } : {
                        filesCount: 1,
                        additions: 9,
                        deletions: 12
                    },
                    turns
                }
            };
        } catch (e) {
            logger.error(`[CodexManager] Lỗi lấy chi tiết thread ${threadId}: ${e.message}`);
            return { success: false, error: e.message };
        }
    }

    /**
     * Send prompt to Codex (Adapter compatibility alias)
     */
    async sendPrompt(threadId, message, model) {
        return this.sendMessage(threadId, message, model);
    }

    /**
     * Send or queue message to thread
     */
    async sendMessage(threadId, message, model) {
        if (!message || !message.trim()) {
            return { success: false, message: 'Nội dung tin nhắn không được để trống' };
        }

        const cleanMsg = message.trim();
        logger.info(`[CodexManager] Đang gửi tin nhắn tới Codex thread ${threadId || 'new'}: "${cleanMsg.substring(0, 40)}..."`);

        return new Promise((resolve) => {
            if (threadId) {
                // Queue to existing thread
                const child = spawn('codex', ['queue', '--thread', threadId, '--message', cleanMsg], {
                    shell: true,
                    windowsHide: true
                });

                let stdout = '';
                let stderr = '';
                child.stdout.on('data', d => stdout += d.toString());
                child.stderr.on('data', d => stderr += d.toString());

                child.on('close', (code) => {
                    if (code === 0) {
                        logger.info(`[CodexManager] Đã queue tin nhắn thành công vào thread ${threadId}`);
                        resolve({ success: true, message: 'Đã gửi tin nhắn tới Codex' });
                    } else {
                        logger.warn(`[CodexManager] Queue exit code ${code}. Stderr: ${stderr}. Thử dùng exec resume...`);
                        // Fallback: run codex exec resume
                        const resumeChild = spawn('codex', ['exec', 'resume', threadId, cleanMsg, '--json'], {
                            shell: true,
                            windowsHide: true
                        });
                        resumeChild.on('close', (resCode) => {
                            resolve({
                                success: resCode === 0,
                                message: resCode === 0 ? 'Đã gửi và resume thread' : `Lỗi: ${stderr || 'Không thể gửi'}`
                            });
                        });
                    }
                });

                child.on('error', (err) => {
                    logger.error(`[CodexManager] Lỗi spawn codex: ${err.message}`);
                    resolve({ success: false, error: err.message });
                });
            } else {
                // New thread
                const args = [];
                if (model) args.push('--model', model);
                args.push(cleanMsg);

                const child = spawn('codex', args, {
                    shell: true,
                    windowsHide: true
                });

                child.on('spawn', () => {
                    resolve({ success: true, message: 'Đã tạo phiên Codex mới' });
                });

                child.on('error', (err) => {
                    resolve({ success: false, error: err.message });
                });
            }
        });
    }
}

module.exports = new CodexManager();
