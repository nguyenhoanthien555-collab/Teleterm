/**
 * TELETERM 3D — CYBERPUNK XP REWARD SHOP MODAL
 * Spend hard-earned XP from Quests & Vibe Harmony dances to unlock:
 * - Hidden Anime LUT Filters (Emerald Matrix, Sunset Synthwave)
 * - Custom Floor Aura Rings (Magenta Pulse, Solar Gold, Prism Rainbow)
 * - Exclusive Character Emotes (Electro Spin, Cyber Bow)
 *
 * Integrated with IndexedDB persistenceManager & Optimistic UI caching.
 * Keybind: [K]
 */

export class XpShopModal {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
        this.isOpen = false;
        this.userXp = 0;
        this.unlockedItems = new Set();
        this.activeAura = null;
        this.activeLut = null;

        this.catalog = [
            {
                id: 'lut_emerald',
                type: 'lut',
                name: 'Emerald Matrix',
                nameVi: 'Xanh Ma Trận (Matrix Green)',
                cost: 400,
                desc: 'Bộ lọc Anime LUT tông xanh ngọc ma trận cyberpunk hoài niệm.',
                iconName: 'sparkles',
                iconColor: '#10b981'
            },
            {
                id: 'lut_synthwave',
                type: 'lut',
                name: 'Sunset Synthwave',
                nameVi: 'Hồng Tím Synthwave (80s Neon)',
                cost: 600,
                desc: 'Phối màu rực rỡ tím hồng phong cách Retrowave hoàng hôn.',
                iconName: 'sparkles',
                iconColor: '#d946ef'
            },
            {
                id: 'aura_magenta',
                type: 'aura',
                name: 'Magenta Pulse Aura',
                nameVi: 'Vòng Neon Hồng Tím (Magenta Pulse)',
                cost: 500,
                desc: 'Vòng hào quang neon phát sáng dưới chân khi đứng yên hoặc nhảy múa.',
                colorHex: '#d946ef',
                iconName: 'sun-moon',
                iconColor: '#d946ef'
            },
            {
                id: 'aura_gold',
                type: 'aura',
                name: 'Solar Gold Aura',
                nameVi: 'Hào Quang Vàng Kim (Solar Gold)',
                cost: 750,
                desc: 'Hào quang hoàng kim phát quang uy quyền của Developer kỳ cựu.',
                colorHex: '#eab308',
                iconName: 'sun',
                iconColor: '#eab308'
            },
            {
                id: 'aura_rainbow',
                type: 'aura',
                name: 'Prism Rainbow Aura',
                nameVi: 'Lục Sắc Biến Ảo (Prism Rainbow)',
                cost: 1200,
                desc: 'Vòng hào quang đa sắc xoay vòng liên tục theo chu kỳ thời gian.',
                colorHex: 'rainbow',
                iconName: 'flame',
                iconColor: '#38bdf8'
            },
            {
                id: 'emote_electro_spin',
                type: 'emote',
                name: 'Electro Spin',
                nameVi: 'Vũ Điệu Xoay Điện Tử (Electro Spin)',
                cost: 800,
                desc: 'Động tác nhảy xoay vòng 360 độ kết hợp nhịp điệu bass điện tử.',
                iconName: 'music',
                iconColor: '#00f0ff'
            },
            {
                id: 'emote_cyber_bow',
                type: 'emote',
                name: 'Cyber Bow',
                nameVi: 'Cúi Chào Công Nghệ (Cyber Bow)',
                cost: 450,
                desc: 'Động tác cúi chào trang trọng của cư dân Cyberpunk.',
                iconName: 'award',
                iconColor: '#a855f7'
            }
        ];

        this.initDOM();
        this.initKeybinds();
        this.loadProfile();
    }

    async loadProfile() {
        if (!this.persistenceManager) return;
        const profile = await this.persistenceManager.getUserProfile() || {};
        this.userXp = profile.xp || 650; // default initial test allowance if empty
        if (profile.unlockedShopItems) {
            this.unlockedItems = new Set(profile.unlockedShopItems);
        }
        this.activeAura = profile.activeAura || null;
        this.activeLut = profile.activeLut || null;
    }

    async saveProfile() {
        if (!this.persistenceManager) return;
        const profile = await this.persistenceManager.getUserProfile() || {};
        profile.xp = this.userXp;
        profile.unlockedShopItems = Array.from(this.unlockedItems);
        profile.activeAura = this.activeAura;
        profile.activeLut = this.activeLut;
        await this.persistenceManager.saveUserProfile(profile);
    }

    initDOM() {
        this.modal = document.createElement('div');
        this.modal.id = 'xp-shop-modal';
        this.modal.className = 'xp-shop-container hidden';
        this.modal.innerHTML = `
            <div class="xp-shop-backdrop"></div>
            <div class="xp-shop-card">
                <div class="xp-shop-header">
                    <div class="xp-shop-title-group">
                        <span class="xp-shop-badge">CYBERPUNK PROGRESSION</span>
                        <h2><span class="tt-icon" data-icon="shopping-bag" data-size="20" style="margin-right:8px;color:#00f0ff;"></span>CỬA HÀNG ĐỔI THƯỞNG XP</h2>
                    </div>
                    <div class="xp-shop-balance">
                        <span>SỐ DƯ XP:</span>
                        <b id="xp-shop-balance-val">0 XP</b>
                    </div>
                    <button class="xp-shop-close-btn" id="xp-shop-close-btn" aria-label="Close"><span class="tt-icon" data-icon="x" data-size="16"></span></button>
                </div>

                <div class="xp-shop-tabs">
                    <button class="xp-tab-btn active" data-tab="all">TẤT CẢ VẬT PHẨM</button>
                    <button class="xp-tab-btn" data-tab="lut">BỘ LỌC LUT</button>
                    <button class="xp-tab-btn" data-tab="aura">HÀO QUANG SÀN</button>
                    <button class="xp-tab-btn" data-tab="emote">VŨ ĐIỆU EMOTE</button>
                </div>

                <div class="xp-shop-grid" id="xp-shop-grid">
                    <!-- Items rendered dynamically -->
                </div>

                <div class="xp-shop-footer">
                    <span><span class="tt-icon" data-icon="lightbulb" data-size="14" style="margin-right:6px;color:#00f0ff;"></span>Nhận thêm XP bằng cách làm <b>Nhiệm vụ theo giờ</b> hoặc nhảy múa cùng NPC để đạt <b>Vibe Harmony (+50 XP)</b>!</span>
                </div>
            </div>
        `;

        this.injectStyles();
        document.body.appendChild(this.modal);

        // Bind events
        this.modal.querySelector('#xp-shop-close-btn').addEventListener('click', () => this.close());
        this.modal.querySelector('.xp-shop-backdrop').addEventListener('click', () => this.close());

        const tabBtns = this.modal.querySelectorAll('.xp-tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderGrid(btn.dataset.tab);
            });
        });
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .xp-shop-container {
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                display: flex; align-items: center; justify-content: center;
                z-index: 99999;
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }
            .xp-shop-container.hidden { display: none !important; }
            .xp-shop-backdrop {
                position: absolute;
                width: 100%; height: 100%;
                background: rgba(18, 17, 16, 0.82);
                backdrop-filter: blur(12px);
            }
            .xp-shop-card {
                position: relative;
                width: 900px; max-width: 92vw;
                max-height: 85vh;
                background: #18181a;
                border: 1px solid rgba(0, 240, 255, 0.35);
                border-radius: 16px;
                box-shadow: 0 24px 64px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.06);
                display: flex; flex-direction: column;
                overflow: hidden;
            }
            .xp-shop-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 20px 28px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                background: linear-gradient(90deg, rgba(0, 240, 255, 0.12), transparent);
            }
            .xp-shop-badge {
                font-size: 11px; letter-spacing: 0.15em; color: #00f0ff; font-weight: 700; text-transform: uppercase;
            }
            .xp-shop-header h2 {
                margin: 4px 0 0 0; font-size: 22px; color: #edeae3; font-weight: 600;
                letter-spacing: -0.01em;
            }
            .xp-shop-balance {
                display: flex; align-items: center; gap: 8px;
                background: rgba(0, 240, 255, 0.12);
                border: 1px solid rgba(0, 240, 255, 0.4);
                padding: 6px 14px; border-radius: 20px;
                color: #a39e93; font-size: 13px; font-weight: 500;
            }
            .xp-shop-balance b { color: #00f0ff; font-size: 16px; }
            .xp-shop-close-btn {
                background: transparent; border: none; color: #a39e93; font-size: 22px; cursor: pointer;
                transition: color 0.15s;
            }
            .xp-shop-close-btn:hover { color: #edeae3; }
            .xp-shop-tabs {
                display: flex; gap: 10px; padding: 14px 28px;
                background: rgba(20, 19, 18, 0.5);
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            }
            .xp-tab-btn {
                background: transparent; border: 1px solid rgba(255, 255, 255, 0.08);
                color: #a39e93; padding: 6px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .xp-tab-btn.active, .xp-tab-btn:hover {
                background: rgba(0, 240, 255, 0.16); border-color: #00f0ff; color: #38bdf8;
            }
            .xp-shop-grid {
                flex: 1; overflow-y: auto;
                display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                gap: 16px; padding: 24px 28px;
            }
            .xp-shop-item-card {
                background: #21201d;
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 12px; padding: 16px;
                display: flex; flex-direction: column; justify-content: space-between;
                transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
            }
            .xp-shop-item-card:hover {
                transform: translateY(-2px);
                border-color: rgba(0, 240, 255, 0.45);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
            }
            .xp-item-top { display: flex; gap: 12px; margin-bottom: 8px; }
            .xp-item-icon { font-size: 28px; }
            .xp-item-name { font-size: 15px; font-weight: 600; color: #edeae3; }
            .xp-item-desc { font-size: 12px; color: #a39e93; line-height: 1.45; margin-bottom: 12px; }
            .xp-item-action { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
            .xp-item-price { font-size: 14px; font-weight: 700; color: #d49746; }
            .xp-buy-btn {
                background: #00f0ff; border: none; color: #ffffff;
                padding: 7px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;
                transition: background 0.15s, transform 0.1s;
            }
            .xp-buy-btn:hover { background: #38bdf8; }
            .xp-buy-btn:active { background: #0284c7; transform: scale(0.98); }
            .xp-equip-btn {
                background: rgba(82, 163, 115, 0.16); border: 1px solid rgba(82, 163, 115, 0.5); color: #52a373;
                padding: 6px 14px; border-radius: 8px; font-weight: 600; cursor: pointer;
                transition: background 0.15s;
            }
            .xp-equip-btn:hover { background: rgba(82, 163, 115, 0.28); }
            .xp-equipped-badge {
                background: #52a373; color: #141312;
                padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 11px;
                letter-spacing: 0.05em;
            }
            .xp-shop-footer {
                padding: 12px 28px; background: rgba(20, 19, 18, 0.6);
                font-size: 12px; color: #78716c; border-top: 1px solid rgba(255, 255, 255, 0.06);
            }
        `;
        document.head.appendChild(style);
    }

    initKeybinds() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'k' || e.key === 'K') {
                if (window.openWorld3D && window.openWorld3D.isTypingInDiegeticKiosk) return;
                // Don't open if chat or input focused
                const active = document.activeElement;
                if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

                this.toggle();
            } else if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    async open() {
        await this.loadProfile();
        this.isOpen = true;
        this.modal.classList.remove('hidden');
        document.getElementById('xp-shop-balance-val').innerText = `${this.userXp} XP`;
        this.renderGrid('all');
    }

    close() {
        this.isOpen = false;
        this.modal.classList.add('hidden');
    }

    renderGrid(filter = 'all') {
        const grid = document.getElementById('xp-shop-grid');
        grid.innerHTML = '';

        const items = (filter === 'all') 
            ? this.catalog 
            : this.catalog.filter(i => i.type === filter);

        items.forEach(item => {
            const isUnlocked = this.unlockedItems.has(item.id);
            const isEquipped = (item.type === 'aura' && this.activeAura === item.id) ||
                               (item.type === 'lut' && this.activeLut === item.id);

            const iconSvg = window.TeleTermIcons
                ? window.TeleTermIcons.render(item.iconName || 'sparkles', { size: 22, color: item.iconColor || '#00f0ff' })
                : '<span class="tt-icon" data-icon="sparkles" data-size="22"></span>';

            const card = document.createElement('div');
            card.className = 'xp-shop-item-card';
            card.innerHTML = `
                <div>
                    <div class="xp-item-top">
                        <span class="xp-item-icon" style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);">${iconSvg}</span>
                        <div>
                            <div class="xp-item-name">${item.nameVi}</div>
                            <span style="font-size: 11px; color: #a39e93; text-transform: uppercase; letter-spacing: 0.05em;">${item.type}</span>
                        </div>
                    </div>
                    <div class="xp-item-desc">${item.desc}</div>
                </div>
                <div class="xp-item-action">
                    <span class="xp-item-price">${isUnlocked ? 'ĐÃ SỞ HỮU' : `${item.cost} XP`}</span>
                    <div class="xp-item-btn-container"></div>
                </div>
            `;

            const btnContainer = card.querySelector('.xp-item-btn-container');

            if (!isUnlocked) {
                const buyBtn = document.createElement('button');
                buyBtn.className = 'xp-buy-btn';
                buyBtn.innerText = 'Mở Khóa';
                buyBtn.onclick = () => this.buyItem(item);
                btnContainer.appendChild(buyBtn);
            } else if (isEquipped) {
                const eqBadge = document.createElement('span');
                eqBadge.className = 'xp-equipped-badge';
                eqBadge.innerText = 'ĐANG DÙNG';
                btnContainer.appendChild(eqBadge);
            } else {
                const equipBtn = document.createElement('button');
                equipBtn.className = 'xp-equip-btn';
                equipBtn.innerText = 'Sử Dụng';
                equipBtn.onclick = () => this.equipItem(item);
                btnContainer.appendChild(equipBtn);
            }

            grid.appendChild(card);
        });
    }

    async buyItem(item) {
        if (this.userXp < item.cost) {
            console.warn(`[XpShopModal] Insufficient XP: need ${item.cost}, have ${this.userXp}`);
            const toast = document.createElement('div');
            toast.textContent = `Bạn không đủ XP! Cần ${item.cost} XP (Hiện có: ${this.userXp} XP).`;
            Object.assign(toast.style, {
                position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(239, 68, 68, 0.95)', color: '#fff', padding: '10px 22px',
                borderRadius: '8px', zIndex: '999999', fontWeight: 'bold', boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
            });
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
            return;
        }

        this.userXp -= item.cost;
        this.unlockedItems.add(item.id);
        document.getElementById('xp-shop-balance-val').innerText = `${this.userXp} XP`;

        await this.saveProfile();
        this.renderGrid(document.querySelector('.xp-tab-btn.active')?.dataset.tab || 'all');
        this.equipItem(item);
    }

    async equipItem(item) {
        if (item.type === 'aura') {
            this.activeAura = item.id;
            if (window.openWorld3D && window.openWorld3D.groupEmoteSync) {
                window.openWorld3D.groupEmoteSync.setAuraColor(item.colorHex);
            }
        } else if (item.type === 'lut') {
            this.activeLut = item.id;
            if (window.photoStudioModal) {
                window.photoStudioModal._applyCanvasFilter(item.id.replace('lut_', ''));
            }
        } else if (item.type === 'emote') {
            if (window.openWorld3D && window.openWorld3D.retargeter) {
                window.openWorld3D.retargeter.setAnimation('VibeDance');
            }
        }

        await this.saveProfile();
        this.renderGrid(document.querySelector('.xp-tab-btn.active')?.dataset.tab || 'all');
    }
}
