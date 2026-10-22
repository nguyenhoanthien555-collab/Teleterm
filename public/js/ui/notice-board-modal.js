/**
 * TELETERM 3D — HUB NOTICE BOARD & QUEST LOG MODAL
 * Implements interactive Notice Board at Developer Hub and comprehensive Quest Log.
 */

export class NoticeBoardModal {
    constructor(questManager, options = {}) {
        this.questManager = questManager;
        this.onToast = options.onToast || console.log;
        
        this.isOpen = false;
        this.activeFilter = 'all'; // 'all', 'story', 'bounty', 'completed'

        this.modalEl = null;
        this.cardsGrid = null;
        this.filterBtns = [];

        this.init();
    }

    init() {
        this.createElements();
        this.bindEvents();
    }

    createElements() {
        if (document.getElementById('modal-notice-board')) {
            this.modalEl = document.getElementById('modal-notice-board');
            return;
        }

        const el = document.createElement('div');
        el.id = 'modal-notice-board';
        el.className = 'cyber-modal-overlay hidden';
        el.innerHTML = `
            <div class="cyber-modal-card notice-board-card">
                <div class="modal-header nb-header">
                    <div class="nb-title-group">
                        <span class="nb-icon"><span class="tt-icon tt-icon-24" data-icon="book-open"></span></span>
                        <div class="nb-title-texts">
                            <h2 class="modal-title nb-title" id="nb-modal-title">Bảng Treo Thưởng & Nhiệm Vụ Developer</h2>
                            <p class="nb-subtitle" id="nb-modal-subtitle">Hoàn thành nhiệm vụ nhận EXP, Danh hiệu, Nhạc Lo-Fi và Cử chỉ độc quyền</p>
                        </div>
                    </div>
                    <button class="modal-close-btn" id="btn-close-notice-board" title="Close (Esc)"><span class="tt-icon tt-icon-18" data-icon="x"></span></button>
                </div>

                <div class="nb-filter-bar">
                    <button class="nb-filter-btn active" data-filter="all">Tất cả</button>
                    <button class="nb-filter-btn" data-filter="story">Cốt truyện</button>
                    <button class="nb-filter-btn" data-filter="bounty">Treo thưởng</button>
                    <button class="nb-filter-btn" data-filter="completed">Đã hoàn thành</button>
                </div>

                <div class="notice-board-body">
                    <div class="nb-quests-grid" id="nb-quests-grid">
                        <!-- Quest Cards dynamically rendered -->
                    </div>
                </div>

                <div class="modal-footer nb-footer">
                    <span class="nb-footer-hint"><span class="tt-icon tt-icon-14 tt-icon-accent" data-icon="lightbulb"></span> Nhấn [E] tại Bảng Treo Thưởng hoặc bấm Quest Tracker để mở</span>
                    <button class="cyber-btn-primary" id="btn-done-notice-board">Đóng</button>
                </div>
            </div>
        `;

        document.body.appendChild(el);
        this.modalEl = el;
        this.cardsGrid = el.querySelector('#nb-quests-grid');
        this.filterBtns = Array.from(el.querySelectorAll('.nb-filter-btn'));
    }

    bindEvents() {
        // Close triggers
        const closeBtn = this.modalEl.querySelector('#btn-close-notice-board');
        const doneBtn = this.modalEl.querySelector('#btn-done-notice-board');
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());
        if (doneBtn) doneBtn.addEventListener('click', () => this.close());

        this.modalEl.addEventListener('click', (e) => {
            if (e.target === this.modalEl) this.close();
        });

        // Filter tab triggers
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilter = btn.dataset.filter || 'all';
                this.renderCards();
            });
        });

        // Global open event
        window.addEventListener('teleterm:open-notice-board', () => {
            this.open();
        });

        // Quest updates
        window.addEventListener('teleterm:quest-updated', () => {
            if (this.isOpen) this.renderCards();
        });

        window.addEventListener('teleterm-language-changed', () => {
            if (this.isOpen) this.renderCards();
        });
    }

    open() {
        this.isOpen = true;
        this.modalEl.classList.remove('hidden');
        this.renderCards();
    }

    close() {
        this.isOpen = false;
        this.modalEl.classList.add('hidden');
    }

    renderCards() {
        if (!this.cardsGrid || !this.questManager) return;
        const quests = this.questManager.quests || [];
        const lang = this.questManager.getLang();
        const isVi = lang === 'vi';

        // Update headers for i18n
        const titleEl = this.modalEl.querySelector('#nb-modal-title');
        const subtitleEl = this.modalEl.querySelector('#nb-modal-subtitle');
        if (titleEl) titleEl.textContent = isVi ? 'Bảng Treo Thưởng & Nhiệm Vụ Developer' : 'Developer Quest & Bounty Notice Board';
        if (subtitleEl) subtitleEl.textContent = isVi ? 'Hoàn thành nhiệm vụ nhận EXP, Danh hiệu, Nhạc Lo-Fi và Cử chỉ độc quyền' : 'Complete developer missions to earn EXP, Titles, Lo-Fi tracks and Emotes';

        // Filter quests
        const filtered = quests.filter(q => {
            if (this.activeFilter === 'story') return q.category === 'story' && q.status !== 'COMPLETED';
            if (this.activeFilter === 'bounty') return q.category === 'bounty' && q.status !== 'COMPLETED';
            if (this.activeFilter === 'completed') return q.status === 'COMPLETED';
            return true;
        });

        if (filtered.length === 0) {
            this.cardsGrid.innerHTML = `
                <div class="nb-empty-state">
                    <span class="nb-empty-state-icon"><span class="tt-icon tt-icon-24" data-icon="clipboard"></span></span>
                    <p>${isVi ? 'Không có nhiệm vụ nào trong mục này.' : 'No quests found in this category.'}</p>
                </div>
            `;
            if (window.TeleTermIcons) window.TeleTermIcons.hydrate(this.cardsGrid);
            return;
        }

        this.cardsGrid.innerHTML = '';

        filtered.forEach(q => {
            const card = document.createElement('div');
            card.className = `nb-quest-card status-${(q.status || 'locked').toLowerCase()} ${q.isActive ? 'card-active' : ''}`;

            // Status label
            let statusText = isVi ? 'Đang khóa' : 'Locked';
            let statusClass = 'badge-locked';
            if (q.status === 'COMPLETED') {
                statusText = isVi ? 'Đã hoàn thành' : 'Completed';
                statusClass = 'badge-completed';
            } else if (q.status === 'READY_TO_CLAIM') {
                statusText = isVi ? 'Chờ nhận thưởng' : 'Ready to Claim';
                statusClass = 'badge-ready';
            } else if (q.status === 'ACTIVE') {
                statusText = isVi ? 'Đang theo dõi' : 'Active Tracking';
                statusClass = 'badge-active';
            } else if (q.status === 'AVAILABLE') {
                statusText = isVi ? 'Có thể nhận' : 'Available';
                statusClass = 'badge-available';
            }

            const title = q.title[lang] || q.title.en;
            const desc = q.description[lang] || q.description.en;
            const giver = q.giverNpc || 'System';

            // Rewards markup
            const rew = q.rewards || {};
            let rewardItems = `<span class="nb-reward-pill">+${rew.xp || 0} EXP</span>`;
            if (rew.title) {
                const tName = isVi ? (rew.titleVi || rew.title) : rew.title;
                rewardItems += `<span class="nb-reward-pill"><span class="tt-icon tt-icon-14" data-icon="award"></span> ${tName}</span>`;
            }
            if (rew.unlockEmoteName) {
                rewardItems += `<span class="nb-reward-pill"><span class="tt-icon tt-icon-14" data-icon="sparkles"></span> ${rew.unlockEmoteName}</span>`;
            }
            if (rew.unlockLofiTrack) {
                rewardItems += `<span class="nb-reward-pill"><span class="tt-icon tt-icon-14" data-icon="music"></span> ${rew.unlockLofiTrack.title}</span>`;
            }

            // Steps markup
            let stepsHtml = '';
            if (q.steps && q.steps.length > 0) {
                stepsHtml = '<div class="nb-card-steps">';
                q.steps.forEach((st, idx) => {
                    const isDone = q.status === 'COMPLETED' || q.status === 'READY_TO_CLAIM' || (q.currentStepIndex > idx);
                    const isCurrent = q.status === 'ACTIVE' && q.currentStepIndex === idx;
                    const stepText = st.text[lang] || st.text.en;
                    const icon = isDone
                        ? '<span class="tt-icon tt-icon-14 tt-icon-accent" data-icon="check"></span>'
                        : (isCurrent ? '<span class="tt-icon tt-icon-14" data-icon="target"></span>' : '<span class="nb-step-bullet">○</span>');
                    stepsHtml += `
                        <div class="nb-step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}">
                            <span class="nb-step-icon">${icon}</span>
                            <span class="nb-step-text">${stepText}</span>
                        </div>
                    `;
                });
                stepsHtml += '</div>';
            }

            // Action button
            let actionBtnHtml = '';
            if (q.status === 'AVAILABLE') {
                actionBtnHtml = `<button class="nb-btn-action btn-accept" data-quest-id="${q.id}">${isVi ? 'Nhận Nhiệm Vụ' : 'Accept Quest'}</button>`;
            } else if (q.status === 'READY_TO_CLAIM') {
                actionBtnHtml = `<button class="nb-btn-action btn-claim" data-quest-id="${q.id}"><span class="tt-icon tt-icon-14" data-icon="sparkles"></span> ${isVi ? 'Nhận Thưởng' : 'Claim Rewards'}</button>`;
            } else if (q.status === 'ACTIVE') {
                actionBtnHtml = `<span class="nb-active-tag">${isVi ? 'Đang thực hiện' : 'Tracking'}</span>`;
            } else if (q.status === 'COMPLETED') {
                actionBtnHtml = `<span class="nb-completed-tag"><span class="tt-icon tt-icon-14" data-icon="check"></span> ${isVi ? 'Hoàn tất' : 'Done'}</span>`;
            }

            card.innerHTML = `
                <div class="nb-card-header">
                    <div class="nb-card-type-row">
                        <span class="nb-card-category ${q.category}">${q.category === 'story' ? (isVi ? 'Cốt Truyện' : 'Story') : (isVi ? 'Treo Thưởng' : 'Bounty')}</span>
                        <span class="nb-card-giver"><span class="tt-icon tt-icon-14" data-icon="users"></span> ${giver}</span>
                        <span class="nb-card-status ${statusClass}">${statusText}</span>
                    </div>
                    <h3 class="nb-card-title">${title}</h3>
                </div>
                <p class="nb-card-desc">${desc}</p>
                ${stepsHtml}
                <div class="nb-card-footer">
                    <div class="nb-rewards-row">
                        <span class="nb-rewards-label">${isVi ? 'Phần thưởng:' : 'Rewards:'}</span>
                        ${rewardItems}
                    </div>
                    <div class="nb-card-action">
                        ${actionBtnHtml}
                    </div>
                </div>
            `;

            // Bind button click
            const btn = card.querySelector('.nb-btn-action');
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const questId = btn.dataset.questId;
                    if (btn.classList.contains('btn-accept')) {
                        this.questManager.acceptQuest(questId);
                    } else if (btn.classList.contains('btn-claim')) {
                        this.questManager.claimQuest(questId);
                    }
                });
            }

            this.cardsGrid.appendChild(card);
        });

        if (window.TeleTermIcons) {
            window.TeleTermIcons.hydrate(this.cardsGrid);
        }
    }
}
