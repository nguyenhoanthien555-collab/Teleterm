/**
 * TeleTerm ADE Diff Viewer Controller
 * Mandated by Master Plan Section 48 & 49:
 * Renders hunks, additions/deletions, hunk decisions, and atomic apply.
 */
class AdeDiffViewer {
    constructor() {
        this.currentDiffSession = null;
    }

    async showDiffSession(diffId) {
        try {
            const session = await window.AdeClient.getDiffSession(diffId);
            this.currentDiffSession = session;
            this.render(session);
        } catch (e) {
            alert(`Failed to load diff: ${e.message}`);
        }
    }

    render(session) {
        const container = document.getElementById('ade-diff-container');
        const editorHost = document.getElementById('monaco-editor-host');
        if (!container || !editorHost) return;

        editorHost.style.display = 'none';
        container.classList.add('visible');

        const titleEl = document.getElementById('diff-file-title');
        if (titleEl) {
            titleEl.textContent = `${session.filePath} (Base Rev: ${session.baseRevision || 1})`;
        }

        const hunkListEl = document.getElementById('diff-hunks-container');
        if (!hunkListEl) return;
        hunkListEl.innerHTML = '';

        if (!session.hunks || session.hunks.length === 0) {
            hunkListEl.innerHTML = '<div style="padding:20px; color:var(--text-muted); text-align:center;">No differences detected.</div>';
            return;
        }

        session.hunks.forEach((hunk, idx) => {
            const card = document.createElement('div');
            card.className = 'diff-hunk-card';

            const statusClass = hunk.status.toLowerCase();
            card.innerHTML = `
                <div class="hunk-header">
                    <span>Hunk #${idx + 1} (Lines: -${hunk.oldStart} +${hunk.newStart}) [${hunk.status}]</span>
                    <div style="display:flex; gap:6px;">
                        <button class="ade-btn ade-btn-sm ade-btn-success" data-action="accept-hunk" data-hunk="${hunk.id}">Accept Hunk</button>
                        <button class="ade-btn ade-btn-sm ade-btn-danger" data-action="reject-hunk" data-hunk="${hunk.id}">Reject Hunk</button>
                    </div>
                </div>
                <div class="hunk-lines">
                    ${hunk.lines.map(line => {
                        const esc = this.escapeHtml(line.content);
                        const prefix = line.type === 'add' ? '+ ' : (line.type === 'del' ? '- ' : '  ');
                        return `<div class="hunk-line ${line.type}">${prefix}${esc}</div>`;
                    }).join('')}
                </div>
            `;

            // Bind hunk buttons
            card.querySelector('[data-action="accept-hunk"]').onclick = async () => {
                await window.AdeClient.api(`/diffs/${session.id}/hunk/${hunk.id}/accept`, { method: 'POST' });
                this.showDiffSession(session.id);
            };

            card.querySelector('[data-action="reject-hunk"]').onclick = async () => {
                await window.AdeClient.api(`/diffs/${session.id}/hunk/${hunk.id}/reject`, { method: 'POST' });
                this.showDiffSession(session.id);
            };

            hunkListEl.appendChild(card);
        });

        // Bind File-level Accept / Reject / Apply buttons
        const actionsGroup = document.getElementById('diff-actions-group');
        if (actionsGroup) actionsGroup.style.display = 'flex';

        const applyBtn = document.getElementById('btn-diff-apply');
        const acceptAllBtn = document.getElementById('btn-diff-accept-all');
        const rejectAllBtn = document.getElementById('btn-diff-reject-all');

        if (applyBtn) {
            applyBtn.onclick = async () => {
                try {
                    await window.AdeClient.applyDiff(session.id);
                    alert(`Decisions successfully applied to ${session.filePath}!`);
                    window.AdeMonaco.openFile(session.filePath);
                } catch (e) {
                    alert(`Failed to apply changes: ${e.message}`);
                }
            };
        }

        if (acceptAllBtn) {
            acceptAllBtn.onclick = async () => {
                try {
                    await window.AdeClient.acceptDiff(session.id);
                    alert(`Changes successfully applied to ${session.filePath}!`);
                    // Open updated file in Monaco
                    window.AdeMonaco.openFile(session.filePath);
                } catch (e) {
                    alert(`Failed to apply changes: ${e.message}`);
                }
            };
        }

        if (rejectAllBtn) {
            rejectAllBtn.onclick = async () => {
                await window.AdeClient.rejectDiff(session.id);
                alert(`Diff proposal rejected.`);
                window.AdeMonaco.openFile(session.filePath);
            };
        }
    }

    showGitDiff(filePath, rawDiff) {
        this.currentDiffSession = null;
        const container = document.getElementById('ade-diff-container');
        const editorHost = document.getElementById('monaco-editor-host');
        if (!container || !editorHost) return;

        editorHost.style.display = 'none';
        container.classList.add('visible');

        const actionsGroup = document.getElementById('diff-actions-group');
        if (actionsGroup) actionsGroup.style.display = 'none';

        const titleEl = document.getElementById('diff-file-title');
        if (titleEl) titleEl.textContent = `Git Diff: ${filePath || 'Working Tree'}`;

        const hunkListEl = document.getElementById('diff-hunks-container');
        if (!hunkListEl) return;

        hunkListEl.innerHTML = `
            <div class="diff-hunk-card">
                <div class="hunk-header"><span>Git Working Tree vs HEAD</span></div>
                <div class="hunk-lines" style="max-height: 70vh; overflow-y:auto;">
                    ${rawDiff.split('\n').map(line => {
                        let type = 'context';
                        if (line.startsWith('+') && !line.startsWith('+++')) type = 'add';
                        else if (line.startsWith('-') && !line.startsWith('---')) type = 'del';
                        return `<div class="hunk-line ${type}">${this.escapeHtml(line)}</div>`;
                    }).join('')}
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        return (text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}

window.AdeDiffViewer = new AdeDiffViewer();
