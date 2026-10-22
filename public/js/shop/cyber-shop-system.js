/**
 * TELETERM 3D — NPC CYBER-SHOP & TRADING BAZAAR
 * Milestone 1: Cozy Economy & Merchant Trading
 *
 * Implements:
 * - Buy Tab: Tools (Golden Master Rod), Consumables (Herbal Tea, Night Bait), Audio (Lo-Fi Boombox)
 * - Sell Tab: Fresh Fish species & Campfire Roasted delicacies with live market valuation
 * - Optimistic UI + Server-Authoritative TeleCoins validation
 * - Web Audio financial transaction chimes
 * - Hotkey [B] to toggle shop or via NPC dialogue
 */

export const SHOP_CATALOG = [
    {
        id: 'item_golden_rod',
        name: 'Golden Master Fishing Rod',
        vi: 'Cần Câu Vàng Hoàng Gia',
        price: 250,
        type: 'tool',
        icon: 'fish',
        desc: 'Royal golden rod forged with sunstone alloys. Increases fish bite frequency & attracts rare tiers.',
        descVi: 'Cần câu hoàng gia nạm hợp kim đá mặt trời. Tăng tốc độ cắn câu và thu hút cá hiếm.'
    },
    {
        id: 'item_luminous_bait',
        name: 'Luminous Night Bait',
        vi: 'Mồi Câu Phát Quang',
        price: 40,
        type: 'consumable',
        icon: 'sparkles',
        desc: 'Deep-lake luminescent bait that glows in the dark, attracting legendary nocturnal fish.',
        descVi: 'Mồi câu phát quang sinh học ban đêm, kích thích các loài cá huyền thoại cắn câu.'
    },
    {
        id: 'item_onsen_herbal_tea',
        name: 'Onsen Herbal Tea',
        vi: 'Trà Thảo Mộc Suối Nước Nóng',
        price: 35,
        type: 'consumable',
        icon: 'coffee',
        desc: 'Steaming hot herbal infusion brewed with high alpine spring water. Restores 30 Energy.',
        descVi: 'Trà thảo mộc thơm dịu ủ từ suối khoáng nóng trên đỉnh núi. Hồi phục 30 năng lượng.'
    },
    {
        id: 'item_lofi_boombox',
        name: 'Spatial Lo-Fi Boombox',
        vi: 'Đài Cassette Lo-Fi Cổ Điển',
        price: 280,
        type: 'holdable',
        icon: 'music',
        desc: 'Vintage stereo cassette deck that plays synchronized chillhop beats wherever you explore.',
        descVi: 'Máy phát băng cassette cổ điển chơi nhạc lofi thư giãn đồng bộ bất cứ nơi nào bạn đến.'
    }
];

export const FISH_PRICE_TABLE = {
    nullpointer_koi: 30,
    async_salmon: 45,
    memory_leak_eel: 65,
    deadlock_crab: 60,
    stackoverflow_bass: 75,
    docker_whale_fry: 160,
    regex_pufferfish: 140,
    git_kraken_mini: 180,
    kernel_catfish: 350,
    zero_day_sturgeon: 500,
    quantum_qubit_trout: 600,
    argon_dragonfish: 1500,
    fish_koi: 50,
    fish_salmon: 45,
    fish_bass: 40,
    fish_ayu: 30,
    item_grilled_fish: 85,
    item_burnt_fish: 5
};

export class CyberShopSystem {
    constructor() {
        this.isOpen = false;
        this.activeTab = 'buy'; // 'buy' or 'sell'
        this.teleCoins = 120;
        this.audioCtx = null;

        this.modalEl = null;
        this.coinsPillEl = null;
        this.tabBuyBtn = null;
        this.tabSellBtn = null;
        this.buyContainer = null;
        this.sellContainer = null;
        this.sellGridEl = null;
        this.emptySellMsgEl = null;
        this.btnClose = null;

        this.initDOM();
        this.bindEvents();

        if (typeof window !== 'undefined') {
            window.cyberShopSystem = this;
        }
    }

    initDOM() {
        if (typeof document === 'undefined') return;
        if (document.getElementById('modal-cyber-shop')) {
            this.modalEl = document.getElementById('modal-cyber-shop');
            this.bindElements();
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'modal-cyber-shop';
        modal.className = 'cyber-shop-overlay hidden';
        modal.innerHTML = `
            <div class="cyber-shop-card">
                <!-- Shop Header -->
                <div class="shop-header">
                    <div class="shop-title-group">
                        <span class="shop-title-icon">🛒</span>
                        <div>
                            <h3 class="shop-title" id="shop-title-text">Cyber-Shop & Bazaar</h3>
                            <p class="shop-subtitle" id="shop-subtitle-text">Developer tools, fishing tackle & artisanal goods</p>
                        </div>
                    </div>
                    <div class="shop-header-right">
                        <div class="shop-telecoins-pill">
                            <span class="coin-icon">🪙</span>
                            <span class="coin-val" id="shop-coins-display">120</span>
                            <span class="coin-label">Coins</span>
                        </div>
                        <button class="shop-close-btn" id="btn-close-shop" title="Close [Esc]">✕</button>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="shop-tab-bar">
                    <button class="shop-tab active" id="tab-shop-buy">
                        <span>🛒 Buy Gear</span>
                    </button>
                    <button class="shop-tab" id="tab-shop-sell">
                        <span>💰 Sell Catch & Delicacies</span>
                    </button>
                </div>

                <!-- Buy Screen -->
                <div class="shop-tab-content" id="shop-buy-view">
                    <div class="shop-items-grid" id="shop-catalog-grid"></div>
                </div>

                <!-- Sell Screen -->
                <div class="shop-tab-content hidden" id="shop-sell-view">
                    <div class="sell-action-bar">
                        <span class="sell-hint" id="sell-hint-text">Select fish or grilled skewers to sell:</span>
                        <button class="btn-sell-all" id="btn-sell-all-fish">⚡ Sell All Fish</button>
                    </div>
                    <div class="shop-sell-grid" id="shop-sell-grid"></div>
                    <div class="empty-sell-msg hidden" id="empty-sell-msg">
                        <p>No fish or sellable delicacies in your inventory!</p>
                        <span class="empty-sub">Go fishing in the river, onsen or lake to gather stock.</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalEl = modal;
        this.bindElements();
    }

    bindElements() {
        if (!this.modalEl) return;
        this.coinsPillEl = this.modalEl.querySelector('#shop-coins-display');
        this.tabBuyBtn = this.modalEl.querySelector('#tab-shop-buy');
        this.tabSellBtn = this.modalEl.querySelector('#tab-shop-sell');
        this.buyContainer = this.modalEl.querySelector('#shop-buy-view');
        this.sellContainer = this.modalEl.querySelector('#shop-sell-view');
        this.buyGridEl = this.modalEl.querySelector('#shop-catalog-grid');
        this.sellGridEl = this.modalEl.querySelector('#shop-sell-grid');
        this.emptySellMsgEl = this.modalEl.querySelector('#empty-sell-msg');
        this.btnClose = this.modalEl.querySelector('#btn-close-shop');
        this.btnSellAll = this.modalEl.querySelector('#btn-sell-all-fish');

        this.btnClose?.addEventListener('click', () => this.close());
        this.tabBuyBtn?.addEventListener('click', () => this.switchTab('buy'));
        this.tabSellBtn?.addEventListener('click', () => this.switchTab('sell'));
        this.btnSellAll?.addEventListener('click', () => this.sellAllFish());
    }

    bindEvents() {
        window.addEventListener('keydown', (e) => {
            // Ignore when typing
            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.closest('.xterm') || active.closest('#mmo-chat-container'))) {
                return;
            }

            if (e.key === 'b' || e.key === 'B') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape' && this.isOpen) {
                e.preventDefault();
                this.close();
            }
        });
    }

    initAudio() {
        if (this.audioCtx) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.audioCtx = new AudioCtx();
        } catch (e) {}
    }

    playCoinChime() {
        this.initAudio();
        if (!this.audioCtx) return;
        try {
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(987.77, now); // B5
            osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {}
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        this.isOpen = true;
        this.modalEl?.classList.remove('hidden');
        this.syncCoins();
        this.renderBuyCatalog();
        if (this.activeTab === 'sell') {
            this.renderSellInventory();
        }
    }

    close() {
        this.isOpen = false;
        this.modalEl?.classList.add('hidden');
    }

    switchTab(tab) {
        this.activeTab = tab;
        if (tab === 'buy') {
            this.tabBuyBtn?.classList.add('active');
            this.tabSellBtn?.classList.remove('active');
            this.buyContainer?.classList.remove('hidden');
            this.sellContainer?.classList.add('hidden');
            this.renderBuyCatalog();
        } else {
            this.tabSellBtn?.classList.add('active');
            this.tabBuyBtn?.classList.remove('active');
            this.sellContainer?.classList.remove('hidden');
            this.buyContainer?.classList.add('hidden');
            this.renderSellInventory();
        }
    }

    syncCoins() {
        if (window.playerInventory && typeof window.playerInventory.getTeleCoins === 'function') {
            this.teleCoins = window.playerInventory.getTeleCoins();
        }
        if (this.coinsPillEl) {
            this.coinsPillEl.textContent = this.teleCoins;
        }
    }

    renderBuyCatalog() {
        if (!this.buyGridEl) return;
        this.buyGridEl.innerHTML = '';
        this.syncCoins();

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';

        SHOP_CATALOG.forEach(item => {
            const card = document.createElement('div');
            card.className = 'shop-item-card';

            const name = isVi ? (item.vi || item.name) : item.name;
            const desc = isVi ? (item.descVi || item.desc) : item.desc;
            const canAfford = this.teleCoins >= item.price;

            let iconEmoji = '📦';
            if (item.type === 'tool') iconEmoji = '🎣';
            else if (item.type === 'consumable') iconEmoji = '🍵';
            else if (item.id === 'item_luminous_bait') iconEmoji = '✨';
            else if (item.id === 'item_lofi_boombox') iconEmoji = '📻';

            card.innerHTML = `
                <div class="item-card-top">
                    <span class="item-card-icon">${iconEmoji}</span>
                    <span class="item-card-price">${item.price} 🪙</span>
                </div>
                <div class="item-card-info">
                    <h4 class="item-card-name">${name}</h4>
                    <p class="item-card-desc">${desc}</p>
                </div>
                <button class="btn-buy-item ${canAfford ? '' : 'disabled'}" data-item-id="${item.id}">
                    ${canAfford ? (isVi ? 'Mua Vật Phẩm' : 'Buy Item') : (isVi ? 'Chưa Đủ Coins' : 'Need Coins')}
                </button>
            `;

            const btn = card.querySelector('.btn-buy-item');
            btn?.addEventListener('click', () => {
                if (!canAfford) return;
                this.buyItem(item.id);
            });

            this.buyGridEl.appendChild(card);
        });
    }

    renderSellInventory() {
        if (!this.sellGridEl) return;
        this.sellGridEl.innerHTML = '';
        this.syncCoins();

        const slots = window.playerInventory?.slots || [];
        const sellableEntries = [];

        slots.forEach((item, idx) => {
            if (item && (item.type === 'raw_fish' || item.id.startsWith('fish_') || item.id.includes('koi') || item.id.includes('salmon') || item.id.includes('bass') || item.id.includes('eel') || item.id.includes('crab') || item.id.includes('fry') || item.id === 'item_grilled_fish' || item.id === 'item_burnt_fish')) {
                const price = FISH_PRICE_TABLE[item.id] || item.value || 25;
                sellableEntries.push({ item, slotIndex: idx, price });
            }
        });

        if (sellableEntries.length === 0) {
            this.emptySellMsgEl?.classList.remove('hidden');
            if (this.btnSellAll) this.btnSellAll.style.display = 'none';
            return;
        }

        this.emptySellMsgEl?.classList.add('hidden');
        if (this.btnSellAll) this.btnSellAll.style.display = 'inline-flex';

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';

        sellableEntries.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'shop-sell-card';

            const name = isVi ? (entry.item.vi || entry.item.name) : entry.item.name;
            const isGrilled = entry.item.id === 'item_grilled_fish';
            const iconEmoji = isGrilled ? '🍢' : (entry.item.id === 'item_burnt_fish' ? '🔥' : '🐟');

            card.innerHTML = `
                <div class="sell-card-left">
                    <span class="sell-card-icon">${iconEmoji}</span>
                    <div>
                        <div class="sell-card-name">${name}</div>
                        <div class="sell-card-slot">Slot ${entry.slotIndex + 1}</div>
                    </div>
                </div>
                <div class="sell-card-right">
                    <span class="sell-card-payout">+${entry.price} 🪙</span>
                    <button class="btn-sell-single" data-slot="${entry.slotIndex}">
                        ${isVi ? 'Bán' : 'Sell'}
                    </button>
                </div>
            `;

            const btn = card.querySelector('.btn-sell-single');
            btn?.addEventListener('click', () => {
                this.sellItem(entry.slotIndex);
            });

            this.sellGridEl.appendChild(card);
        });
    }

    buyItem(itemId) {
        if (window.multiplayerClient && typeof window.multiplayerClient.sendTradeBuy === 'function') {
            window.multiplayerClient.sendTradeBuy(itemId);
        } else {
            // Local HTTP fallback
            fetch('/api/dev/shop/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) this.handleBuyAck(data);
            })
            .catch(() => {});
        }
    }

    sellItem(slotIndex) {
        if (window.multiplayerClient && typeof window.multiplayerClient.sendTradeSell === 'function') {
            window.multiplayerClient.sendTradeSell(slotIndex);
        } else {
            // Local HTTP fallback
            fetch('/api/dev/shop/sell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slotIndex })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) this.handleSellAck(data);
            })
            .catch(() => {});
        }
    }

    sellAllFish() {
        const slots = window.playerInventory?.slots || [];
        slots.forEach((item, idx) => {
            if (item && (item.type === 'raw_fish' || item.id.startsWith('fish_') || item.id.includes('koi') || item.id.includes('salmon') || item.id.includes('bass') || item.id.includes('eel') || item.id.includes('crab') || item.id.includes('fry') || item.id === 'item_grilled_fish' || item.id === 'item_burnt_fish')) {
                this.sellItem(idx);
            }
        });
    }

    handleBuyAck(packet) {
        if (packet.success) {
            this.playCoinChime();
            this.syncCoins();
            this.renderBuyCatalog();
            const i18n = window.TeleTermI18n;
            const isVi = i18n && i18n.getLanguage() === 'vi';
            const itemName = packet.item?.name || 'Item';
            const msg = isVi ? `Đã mua thành công: ${itemName}!` : `Purchased ${itemName}!`;
            if (window.openWorld3D?.onToast) window.openWorld3D.onToast(msg, 'success');
        } else {
            const err = packet.error === 'insufficient_coins' ? 'Not enough TeleCoins!' : 'Cannot buy item.';
            if (window.openWorld3D?.onToast) window.openWorld3D.onToast(err, 'warning');
        }
    }

    handleSellAck(packet) {
        if (packet.success) {
            this.playCoinChime();
            this.syncCoins();
            this.renderSellInventory();
            const i18n = window.TeleTermI18n;
            const isVi = i18n && i18n.getLanguage() === 'vi';
            const itemName = packet.soldItem?.name || 'Item';
            const msg = isVi
                ? `Đã bán ${itemName}: +${packet.earnedCoins} TeleCoins!`
                : `Sold ${itemName}: +${packet.earnedCoins} TeleCoins!`;
            if (window.openWorld3D?.onToast) window.openWorld3D.onToast(msg, 'success');
        }
    }
}

export const cyberShopSystem = new CyberShopSystem();
