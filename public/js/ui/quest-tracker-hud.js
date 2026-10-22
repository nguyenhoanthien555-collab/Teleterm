/**
 * TELETERM 3D — GENSHIN IMPACT-STYLE QUEST TRACKER HUD
 * Left-docked sleek glassmorphism tracker with diamond objective markers,
 * live target distance meter, collapse toggles, and instant claim triggers.
 */

export class QuestTrackerHud {
    constructor(questManager, options = {}) {
        this.questManager = questManager;
        this.onOpenNoticeBoard = options.onOpenNoticeBoard || null;
        this.isCollapsed = false;

        this.container = null;
        this.titleEl = null;
        this.categoryEl = null;
        this.stepContainer = null;
        this.distanceEl = null;
        this.claimBtn = null;
        this.collapseBtn = null;

        this.init();
    }

    init() {
        this.createElements();
        this.bindEvents();
        this.render();
    }

    createElements() {
        if (document.getElementById('genshin-quest-tracker')) {
            this.container = document.getElementById('genshin-quest-tracker');
            return;
        }

        const el = document.createElement('div');
        el.id = 'genshin-quest-tracker';
        el.className = 'genshin-quest-tracker';
        el.innerHTML = `
            <div class="g-tracker-bookmark-tab" id="g-tracker-bookmark-tab" title="Mở danh sách nhiệm vụ / Click to expand">
                <span class="g-tracker-bm-icon"><span class="tt-icon tt-icon-16" data-icon="book-open"></span></span>
                <span class="g-tracker-bm-diamond">◆</span>
                <span class="g-tracker-bm-indicator" id="g-tracker-bm-indicator"></span>
            </div>
            <div class="g-tracker-header" id="g-tracker-header" title="Click to view all Quests & Bounties">
                <div class="g-tracker-header-left">
                    <span class="g-tracker-category" id="g-tracker-category">[Cốt Truyện]</span>
                    <span class="g-tracker-title" id="g-tracker-title">Chào mừng tới Metaverse</span>
                </div>
                <div class="g-tracker-header-actions">
                    <button class="g-tracker-btn-list" id="g-tracker-btn-list" title="Open Quest Log & Bounties"><span class="tt-icon tt-icon-14" data-icon="clipboard"></span></button>
                    <button class="g-tracker-btn-collapse" id="g-tracker-btn-collapse" title="Collapse / Expand"><span class="tt-icon tt-icon-14" data-icon="minus"></span></button>
                </div>
            </div>
            <div class="g-tracker-body" id="g-tracker-body">
                <div class="g-tracker-step-row">
                    <span class="g-tracker-diamond" id="g-tracker-diamond">◆</span>
                    <span class="g-tracker-step-text" id="g-tracker-step-text">Gặp Lumina tại Hub</span>
                </div>
                <div class="g-tracker-distance-row" id="g-tracker-distance-row">
                    <span class="g-tracker-radar-icon"><span class="tt-icon tt-icon-14 tt-icon-accent" data-icon="target"></span></span>
                    <span class="g-tracker-distance-val" id="g-tracker-distance-val">--m</span>
                </div>
                <div class="g-tracker-claim-row" id="g-tracker-claim-row" style="display: none;">
                    <button class="g-tracker-btn-claim" id="g-tracker-btn-claim">
                        <span class="sparkle"><span class="tt-icon tt-icon-14 tt-icon-accent" data-icon="sparkles"></span></span>
                        <span class="claim-text">Nhận Phần Thưởng</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(el);
        this.container = el;

        this.titleEl = el.querySelector('#g-tracker-title');
        this.categoryEl = el.querySelector('#g-tracker-category');
        this.stepContainer = el.querySelector('#g-tracker-body');
        this.diamondEl = el.querySelector('#g-tracker-diamond');
        this.stepTextEl = el.querySelector('#g-tracker-step-text');
        this.distanceRow = el.querySelector('#g-tracker-distance-row');
        this.distanceVal = el.querySelector('#g-tracker-distance-val');
        this.claimRow = el.querySelector('#g-tracker-claim-row');
        this.claimBtn = el.querySelector('#g-tracker-btn-claim');
        this.collapseBtn = el.querySelector('#g-tracker-btn-collapse');
        this.listBtn = el.querySelector('#g-tracker-btn-list');
        this.bookmarkTab = el.querySelector('#g-tracker-bookmark-tab');
        this.bookmarkIndicator = el.querySelector('#g-tracker-bm-indicator');
    }

    bindEvents() {
        // Click on collapsed container expands it smoothly
        this.container.addEventListener('click', (e) => {
            if (this.isCollapsed) {
                e.stopPropagation();
                this.toggleCollapse();
            }
        });

        // Collapse toggle
        if (this.collapseBtn) {
            this.collapseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleCollapse();
            });
        }

        // Open Quest Log
        if (this.listBtn) {
            this.listBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.onOpenNoticeBoard) this.onOpenNoticeBoard();
                else window.dispatchEvent(new CustomEvent('teleterm:open-notice-board'));
            });
        }

        const headerLeft = this.container.querySelector('.g-tracker-header-left');
        if (headerLeft) {
            headerLeft.addEventListener('click', () => {
                if (this.onOpenNoticeBoard) this.onOpenNoticeBoard();
                else window.dispatchEvent(new CustomEvent('teleterm:open-notice-board'));
            });
        }

        // Claim or Accept button
        if (this.claimBtn) {
            this.claimBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const q = this.questManager.activeQuest;
                if (q) {
                    if (q.status === 'AVAILABLE') {
                        this.questManager.acceptQuest(q.id);
                    } else if (q.isReadyToClaim) {
                        this.questManager.claimQuest(q.id);
                    }
                }
            });
        }

        // Listen for quest manager updates
        window.addEventListener('teleterm:quest-updated', () => {
            this.render();
        });

        // Update distance tick
        setInterval(() => {
            this.updateDistanceMeter();
        }, 300);
    }

    collapse() {
        if (!this.isCollapsed) this.toggleCollapse();
    }

    expand() {
        if (this.isCollapsed) this.toggleCollapse();
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        if (this.isCollapsed) {
            this.container.classList.add('collapsed');
            this.container.classList.add('docked-left');
            this.container.setAttribute('title', 'Nhiệm vụ đang thu gọn. Bấm để mở / Click to expand');
            if (this.collapseBtn) this.collapseBtn.innerHTML = '<span class="tt-icon tt-icon-14" data-icon="plus"></span>';
        } else {
            this.container.classList.remove('collapsed');
            this.container.classList.remove('docked-left');
            this.container.removeAttribute('title');
            if (this.collapseBtn) this.collapseBtn.innerHTML = '<span class="tt-icon tt-icon-14" data-icon="minus"></span>';
        }
        if (window.TeleTermIcons) {
            window.TeleTermIcons.hydrate(this.container);
        }
    }

    updateDistanceMeter() {
        if (this.isCollapsed || !this.questManager?.activeQuest) return;
        const q = this.questManager.activeQuest;
        
        // If ready to claim, distance can point to quest giver or be hidden
        if (q.isReadyToClaim) {
            this.distanceRow.style.display = 'none';
            return;
        }

        const step = q.currentStep;
        if (step && step.targetPos && window.openWorld3D?.player?.position) {
            const playerPos = window.openWorld3D.player.position;
            const dist = this.questManager.getDistanceToActiveTarget(playerPos);
            if (dist !== null) {
                this.distanceRow.style.display = 'flex';
                const distInt = Math.round(dist);
                const lang = this.questManager.getLang();
                this.distanceVal.textContent = lang === 'vi' ? `${distInt}m tới mục tiêu` : `${distInt}m to target`;
                return;
            }
        }

        this.distanceRow.style.display = 'none';
    }

    render() {
        if (!this.container) return;
        const q = this.questManager?.activeQuest;

        if (!q) {
            this.container.style.display = 'none';
            return;
        }

        this.container.style.display = 'flex';

        const lang = this.questManager.getLang();
        const isVi = lang === 'vi';

        // 1. Category Tag
        if (q.category === 'story') {
            this.categoryEl.textContent = isVi ? '[Cốt Truyện]' : '[Story]';
            this.categoryEl.className = 'g-tracker-category tag-story';
        } else {
            this.categoryEl.textContent = isVi ? '[Treo Thưởng]' : '[Bounty]';
            this.categoryEl.className = 'g-tracker-category tag-bounty';
        }

        // 2. Title
        const titleText = q.title[lang] || q.title.en || q.id;
        this.titleEl.textContent = titleText;

        // 3. Step & Diamond State
        if (q.status === 'AVAILABLE') {
            this.diamondEl.innerHTML = window.TeleTermIcons ? window.TeleTermIcons.render('circle', { size: 10 }) : '○';
            this.diamondEl.className = 'g-tracker-diamond diamond-available';
            this.stepTextEl.textContent = isVi ? 'Nhiệm vụ mới khả dụng! Bấm để nhận' : 'New quest available! Click to accept';
            this.stepTextEl.className = 'g-tracker-step-text';
            this.claimRow.style.display = 'block';
            const claimText = this.claimBtn.querySelector('.claim-text');
            if (claimText) claimText.textContent = isVi ? 'Nhận Nhiệm Vụ' : 'Accept Quest';
        } else if (q.isReadyToClaim) {
            this.diamondEl.innerHTML = window.TeleTermIcons ? window.TeleTermIcons.render('sparkles', { size: 11 }) : '';
            this.diamondEl.className = 'g-tracker-diamond diamond-ready';
            this.stepTextEl.textContent = isVi ? 'Mục tiêu hoàn tất! Nhận thưởng ngay' : 'Objective complete! Claim your reward';
            this.stepTextEl.className = 'g-tracker-step-text step-ready';
            
            // Show claim button
            this.claimRow.style.display = 'block';
            const claimText = this.claimBtn.querySelector('.claim-text');
            if (claimText) claimText.textContent = isVi ? 'Hoàn thành & Nhận thưởng' : 'Claim Rewards';
        } else if (q.currentStep) {
            this.diamondEl.innerHTML = window.TeleTermIcons ? window.TeleTermIcons.render('sparkle-point', { size: 10 }) : '';
            this.diamondEl.className = 'g-tracker-diamond diamond-active';
            const stepText = q.currentStep.text[lang] || q.currentStep.text.en;
            this.stepTextEl.textContent = stepText;
            this.stepTextEl.className = 'g-tracker-step-text';
            this.claimRow.style.display = 'none';
        } else {
            this.stepTextEl.textContent = isVi ? 'Đang hoàn tất...' : 'In progress...';
            this.claimRow.style.display = 'none';
        }

        if (this.bookmarkIndicator) {
            if (q.isReadyToClaim) {
                this.bookmarkIndicator.className = 'g-tracker-bm-indicator ready';
            } else {
                this.bookmarkIndicator.className = 'g-tracker-bm-indicator';
            }
        }

        this.updateDistanceMeter();
        if (window.TeleTermIcons) {
            window.TeleTermIcons.hydrate(this.container);
        }
    }
}
