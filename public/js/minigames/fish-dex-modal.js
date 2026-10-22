import { FISH_SPECIES } from './zen-fishing-system.js';

/**
 * FISH DEX MODAL (SỔ TAY CÁ BÁCH KHOA DEVELOPER)
 * TeleTerm 3D — Social Break-time & Cozy Vibes (Sprint 2.2)
 * 
 * Features:
 * - 12 Dev-Themed Fish Encyclopedia
 * - Lore, Rarity Tiers, Caught Counts & Record Weights
 * - Dev Coin Trade-in: Sell caught fish for Dev Coins to buy customizations
 * - Compact HUD Trigger Button (<= 24px) & Alt + F shortcut
 */
export class FishDexModal {
    constructor(fishingSystem, options = {}) {
        this.fishingSystem = fishingSystem;
        this.onToast = options.onToast || console.log;
        this.isOpen = false;
        this.activeFilter = 'all';

        this.initDOM();
        this.initShortcut();
    }

    initDOM() {
        this.modal = document.createElement('div');
        this.modal.id = 'modal-fish-dex';
        this.modal.className = 'fish-dex-container hidden';
        this.modal.innerHTML = `
            <div class="fish-dex-backdrop"></div>
            <div class="fish-dex-card">
                <div class="fish-dex-header">
                    <div class="fish-dex-title-group">
                        <span class="fish-dex-badge">ZEN FISHING EXPEDITION</span>
                        <h2>
                            <span class="tt-icon tt-icon-accent" data-icon="fish" style="margin-right:8px;"></span>
                            <span data-i18n="fish_dex_title">SỔ TAY CÁ BÁCH KHOA (FISH DEX)</span>
                        </h2>
                    </div>
                    <div class="fish-dex-summary" id="fish-dex-summary">
                        <!-- Populated dynamically -->
                    </div>
                    <button class="fish-dex-close-btn" id="fish-dex-close-btn" aria-label="Close">
                        <span class="tt-icon" data-icon="x" style="font-size:16px;"></span>
                    </button>
                </div>

                <div class="fish-dex-tabs">
                    <button class="fish-dex-tab active" data-filter="all">Tất cả (All)</button>
                    <button class="fish-dex-tab" data-filter="common">Thường (Common)</button>
                    <button class="fish-dex-tab" data-filter="rare">Hiếm (Rare)</button>
                    <button class="fish-dex-tab" data-filter="epic">Sử Thi (Epic)</button>
                    <button class="fish-dex-tab" data-filter="legendary">Huyền Thoại (Legendary)</button>
                </div>

                <div class="fish-dex-grid" id="fish-dex-grid">
                    <!-- Fish Cards dynamically rendered -->
                </div>

                <div class="fish-dex-footer">
                    <span>
                        <span class="tt-icon" data-icon="lightbulb" style="margin-right:6px;color:#da7756;"></span>
                        <span data-i18n="fish_dex_tip">Mẹo: Nhấp chuột nhanh khi phao giật [!] để tăng 30% tỷ lệ bắt cá Sử Thi và Thần Thoại! Treo máy AFK vẫn tự động câu cá Thường.</span>
                    </span>
                </div>
            </div>
        `;

        this.injectStyles();
        document.body.appendChild(this.modal);

        // Bind events
        this.modal.querySelector('#fish-dex-close-btn').addEventListener('click', () => this.close());
        this.modal.querySelector('.fish-dex-backdrop').addEventListener('click', () => this.close());

        const tabs = this.modal.querySelectorAll('.fish-dex-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.activeFilter = tab.dataset.filter;
                this.renderGrid();
            });
        });
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .fish-dex-container {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 1;
                transition: opacity 0.2s ease;
            }
            .fish-dex-container.hidden {
                display: none;
                opacity: 0;
                pointer-events: none;
            }
            .fish-dex-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(10, 15, 29, 0.78);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
            }
            .fish-dex-card {
                position: relative;
                width: 900px;
                max-width: 94vw;
                max-height: 86vh;
                background: rgba(15, 23, 42, 0.94);
                border: 1px solid rgba(218, 119, 86, 0.35);
                border-radius: 14px;
                box-shadow: 0 20px 45px rgba(0, 0, 0, 0.65), 0 0 30px rgba(218, 119, 86, 0.15);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                color: #f1f5f9;
                font-family: inherit;
            }
            .fish-dex-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 18px 24px 14px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .fish-dex-title-group h2 {
                margin: 0;
                font-size: 19px;
                font-weight: 700;
                letter-spacing: 0.5px;
                display: flex;
                align-items: center;
            }
            .fish-dex-badge {
                display: inline-block;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: 1.2px;
                color: #da7756;
                text-transform: uppercase;
                margin-bottom: 4px;
            }
            .fish-dex-summary {
                font-size: 13px;
                color: #94a3b8;
                display: flex;
                gap: 16px;
            }
            .fish-dex-summary b {
                color: #38bdf8;
            }
            .fish-dex-close-btn {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #cbd5e1;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            .fish-dex-close-btn:hover {
                background: rgba(239, 68, 68, 0.25);
                border-color: rgba(239, 68, 68, 0.5);
                color: #fff;
            }
            .fish-dex-tabs {
                display: flex;
                gap: 8px;
                padding: 12px 24px;
                background: rgba(0, 0, 0, 0.25);
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            }
            .fish-dex-tab {
                background: transparent;
                border: 1px solid transparent;
                border-radius: 6px;
                padding: 6px 14px;
                font-size: 12px;
                font-weight: 600;
                color: #94a3b8;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            .fish-dex-tab:hover {
                color: #f1f5f9;
                background: rgba(255, 255, 255, 0.05);
            }
            .fish-dex-tab.active {
                background: rgba(218, 119, 86, 0.15);
                border-color: rgba(218, 119, 86, 0.4);
                color: #da7756;
            }
            .fish-dex-grid {
                flex: 1;
                overflow-y: auto;
                padding: 18px 24px;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                gap: 16px;
            }
            .fish-card {
                background: rgba(30, 41, 59, 0.65);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 10px;
                padding: 14px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                transition: transform 0.15s ease, border-color 0.15s ease;
            }
            .fish-card:hover {
                transform: translateY(-2px);
                border-color: rgba(218, 119, 86, 0.4);
            }
            .fish-card.locked {
                opacity: 0.55;
                filter: grayscale(0.85);
            }
            .fish-card-top {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .fish-card-name {
                font-size: 14px;
                font-weight: 700;
                color: #f8fafc;
            }
            .fish-card-tier {
                font-size: 10px;
                font-weight: 700;
                padding: 2px 7px;
                border-radius: 4px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .fish-card-lore {
                font-size: 11px;
                color: #94a3b8;
                line-height: 1.4;
                font-style: italic;
                flex: 1;
            }
            .fish-card-stats {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #cbd5e1;
                background: rgba(0, 0, 0, 0.25);
                padding: 6px 10px;
                border-radius: 6px;
                margin-top: 4px;
            }
            .fish-card-stats b {
                color: #38bdf8;
            }
            .fish-card-actions {
                display: flex;
                gap: 8px;
                margin-top: 4px;
            }
            .fish-sell-btn {
                flex: 1;
                background: rgba(218, 119, 86, 0.15);
                border: 1px solid rgba(218, 119, 86, 0.35);
                border-radius: 6px;
                padding: 6px 10px;
                font-size: 11px;
                font-weight: 700;
                color: #da7756;
                cursor: pointer;
                transition: all 0.15s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            }
            .fish-sell-btn:hover:not(:disabled) {
                background: #da7756;
                color: #0f172a;
            }
            .fish-sell-btn:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }
            .fish-dex-footer {
                padding: 12px 24px;
                background: rgba(0, 0, 0, 0.35);
                border-top: 1px solid rgba(255, 255, 255, 0.06);
                font-size: 12px;
                color: #94a3b8;
                display: flex;
                align-items: center;
            }
        `;
        document.head.appendChild(style);
    }

    initShortcut() {
        window.addEventListener('keydown', (e) => {
            if (e.altKey && (e.key === 'f' || e.key === 'F')) {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    open() {
        this.isOpen = true;
        this.modal.classList.remove('hidden');
        this.renderGrid();
    }

    close() {
        this.isOpen = false;
        this.modal.classList.add('hidden');
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    renderGrid() {
        const grid = this.modal.querySelector('#fish-dex-grid');
        const summary = this.modal.querySelector('#fish-dex-summary');
        if (!grid) return;

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';
        const catchLog = this.fishingSystem ? this.fishingSystem.catchLog : {};

        let totalCaught = 0;
        let uniqueDiscovered = 0;
        FISH_SPECIES.forEach(f => {
            if (catchLog[f.id] && catchLog[f.id].count > 0) {
                totalCaught += catchLog[f.id].count;
                uniqueDiscovered += 1;
            }
        });

        if (summary) {
            summary.innerHTML = isVi
                ? `<span>Khám phá: <b>${uniqueDiscovered}/12</b></span> <span>Tổng đã câu: <b>${totalCaught}</b></span>`
                : `<span>Discovered: <b>${uniqueDiscovered}/12</b></span> <span>Total Caught: <b>${totalCaught}</b></span>`;
        }

        // Filter species
        const filtered = FISH_SPECIES.filter(f => {
            if (this.activeFilter === 'all') return true;
            if (this.activeFilter === 'legendary') return f.tier === 'legendary' || f.tier === 'mythical';
            return f.tier === this.activeFilter;
        });

        grid.innerHTML = '';
        filtered.forEach(fish => {
            const entry = catchLog[fish.id];
            const isCaught = entry && entry.count > 0;

            const name = isVi ? fish.vi : fish.name;
            const tierName = isVi ? fish.tierVi : fish.tier.toUpperCase();
            const desc = isVi ? fish.descVi : fish.desc;

            const card = document.createElement('div');
            card.className = `fish-card ${isCaught ? '' : 'locked'}`;

            if (isCaught) {
                card.innerHTML = `
                    <div class="fish-card-top">
                        <span class="fish-card-name" style="color:${fish.color};">
                            <span class="tt-icon" data-icon="${fish.icon}" style="margin-right:6px;"></span>${name}
                        </span>
                        <span class="fish-card-tier" style="background:${fish.color}25; color:${fish.color}; border:1px solid ${fish.color}60;">${tierName}</span>
                    </div>
                    <div class="fish-card-lore">"${desc}"</div>
                    <div class="fish-card-stats">
                        <span>${isVi ? 'Đã câu' : 'Caught'}: <b>${entry.count}</b></span>
                        <span>${isVi ? 'Kỷ lục' : 'Record'}: <b>${entry.maxWeight} kg</b></span>
                        <span>${isVi ? 'Giá' : 'Value'}: <b>+${fish.value}</b></span>
                    </div>
                    <div class="fish-card-actions">
                        <button class="fish-sell-btn" data-fish-id="${fish.id}">
                            <span class="tt-icon" data-icon="zap" style="font-size:12px;"></span>
                            ${isVi ? `Bán 1 con (+${fish.value} Coins)` : `Sell 1 (+${fish.value} Coins)`}
                        </button>
                    </div>
                `;

                // Bind sell button
                const sellBtn = card.querySelector('.fish-sell-btn');
                sellBtn.addEventListener('click', () => {
                    if (entry.count > 0) {
                        entry.count -= 1;
                        this.fishingSystem.saveCatchLog();
                        if (window.openWorld3D?.addXp) {
                            window.openWorld3D.addXp(fish.value, `Sold ${fish.name}`);
                        }
                        if (this.onToast) {
                            this.onToast(isVi ? `Đã bán 1 ${name} nhận +${fish.value} Dev Coins! 💰` : `Sold 1 ${name} for +${fish.value} Dev Coins! 💰`, 'success');
                        }
                        this.renderGrid();
                    }
                });
            } else {
                // Silhouetted Locked Card
                card.innerHTML = `
                    <div class="fish-card-top">
                        <span class="fish-card-name" style="color:#64748b;">
                            <span class="tt-icon" data-icon="help-circle" style="margin-right:6px;"></span>? ? ?
                        </span>
                        <span class="fish-card-tier" style="background:#334155; color:#94a3b8;">${tierName}</span>
                    </div>
                    <div class="fish-card-lore">
                        ${isVi ? `Loài cá bí ẩn... Thử quăng cần câu tại vùng nước ${fish.preferredBiome} để phát hiện!` : `Mysterious species... Try casting your rod near ${fish.preferredBiome} waters!`}
                    </div>
                    <div class="fish-card-stats">
                        <span>${isVi ? 'Chưa câu được' : 'Undiscovered'}</span>
                        <span>${fish.minWeight} - ${fish.maxWeight} kg</span>
                    </div>
                `;
            }

            grid.appendChild(card);
        });

        if (window.TeleTermIcons) {
            window.TeleTermIcons.hydrate(grid);
        }
    }
}
