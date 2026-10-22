/**
 * PLAYER INVENTORY SYSTEM — FULL 36-SLOT INVENTORY & MINECRAFT-STYLE HOTBAR
 * Implements Feature Group A & Sections 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17
 * 
 * Architecture:
 * - 36 Real Slots Data Model: 9 Hotbar (0..8) + 27 Storage (9..35)
 * - Item-Specific Grip Profiles with Palm Contact & Finger Curl
 * - Minecraft-style Keyboard selection (1..9) with Selected Item Title Feedback
 * - Full Drag & Drop / Click Swap Inventory UI Modal [E / I]
 * - Hold RMB to Use / Drink with Mouth Target Alignment & State Machine
 * - Authoritative Server Persistence via /api/dev/inventory & LocalStorage fallback
 */

export const GRIP_PROFILES = {
    small_can: {
        id: 'small_can',
        gripSocket: 'RightHand',
        localPosition: [-0.072, -0.032, 0.000],
        localRotation: [1.22, -0.10, -0.15],
        localScale: [1, 1, 1],
        palmOffset: [-0.072, -0.032, 0.000],
        fingerCurl: {
            thumb: [
                { x: -0.25, y: 0.30, z: 0.35 },
                { x: 0.00, y: 0.20, z: 0.25 },
                { x: 0.00, y: 0.15, z: 0.20 }
            ],
            index: [
                { x: 0.00, y: -0.05, z: 0.55 },
                { x: 0.00, y: 0.00, z: 0.78 },
                { x: 0.00, y: 0.00, z: 0.42 }
            ],
            middle: [
                { x: 0.00, y: 0.00, z: 0.62 },
                { x: 0.00, y: 0.00, z: 0.85 },
                { x: 0.00, y: 0.00, z: 0.48 }
            ],
            ring: [
                { x: 0.00, y: 0.05, z: 0.68 },
                { x: 0.00, y: 0.00, z: 0.88 },
                { x: 0.00, y: 0.00, z: 0.52 }
            ],
            little: [
                { x: 0.00, y: 0.08, z: 0.72 },
                { x: 0.00, y: 0.00, z: 0.85 },
                { x: 0.00, y: 0.00, z: 0.50 }
            ]
        },
        useTransform: {
            position: [0.01, 0.04, -0.02],
            rotation: [Math.PI * 0.72, 0.35, -0.3]
        },
        useAnimation: 'DrinkCan',
        useSound: 'drink_soft'
    },
    mug: {
        id: 'mug',
        gripSocket: 'RightHand',
        localPosition: [-0.065, -0.028, 0.000],
        localRotation: [1.22, -0.10, -0.15],
        localScale: [1, 1, 1],
        palmOffset: [-0.065, -0.028, 0.000],
        fingerCurl: {
            thumb: [
                { x: -0.20, y: 0.25, z: 0.30 },
                { x: 0.00, y: 0.15, z: 0.20 },
                { x: 0.00, y: 0.10, z: 0.15 }
            ],
            index: [
                { x: 0.00, y: -0.05, z: 0.50 },
                { x: 0.00, y: 0.00, z: 0.70 },
                { x: 0.00, y: 0.00, z: 0.35 }
            ],
            middle: [
                { x: 0.00, y: 0.00, z: 0.55 },
                { x: 0.00, y: 0.00, z: 0.75 },
                { x: 0.00, y: 0.00, z: 0.40 }
            ],
            ring: [
                { x: 0.00, y: 0.05, z: 0.60 },
                { x: 0.00, y: 0.00, z: 0.75 },
                { x: 0.00, y: 0.00, z: 0.40 }
            ],
            little: [
                { x: 0.00, y: 0.08, z: 0.65 },
                { x: 0.00, y: 0.00, z: 0.70 },
                { x: 0.00, y: 0.00, z: 0.35 }
            ]
        },
        useTransform: {
            position: [0.01, 0.04, -0.02],
            rotation: [Math.PI * 0.72, 0.35, -0.3]
        },
        useAnimation: 'Coffee',
        useSound: 'drink_soft'
    },
    bottle: {
        id: 'bottle',
        gripSocket: 'RightHand',
        localPosition: [-0.070, -0.030, 0.000],
        localRotation: [1.22, -0.10, -0.15],
        localScale: [1, 1, 1],
        palmOffset: [-0.070, -0.030, 0.000],
        fingerCurl: {
            thumb: [
                { x: -0.25, y: 0.30, z: 0.35 },
                { x: 0.00, y: 0.20, z: 0.25 },
                { x: 0.00, y: 0.15, z: 0.20 }
            ],
            index: [
                { x: 0.00, y: -0.05, z: 0.55 },
                { x: 0.00, y: 0.00, z: 0.78 },
                { x: 0.00, y: 0.00, z: 0.42 }
            ],
            middle: [
                { x: 0.00, y: 0.00, z: 0.62 },
                { x: 0.00, y: 0.00, z: 0.85 },
                { x: 0.00, y: 0.00, z: 0.48 }
            ],
            ring: [
                { x: 0.00, y: 0.05, z: 0.68 },
                { x: 0.00, y: 0.00, z: 0.88 },
                { x: 0.00, y: 0.00, z: 0.52 }
            ],
            little: [
                { x: 0.00, y: 0.08, z: 0.72 },
                { x: 0.00, y: 0.00, z: 0.85 },
                { x: 0.00, y: 0.00, z: 0.50 }
            ]
        },
        useTransform: {
            position: [0.01, 0.045, -0.02],
            rotation: [Math.PI * 0.75, 0.35, -0.3]
        },
        useAnimation: 'DrinkCan',
        useSound: 'drink_soft'
    },
    phone: {
        id: 'phone',
        gripSocket: 'RightHand',
        localPosition: [-0.055, -0.020, 0.005],
        localRotation: [1.10, -0.05, -0.10],
        localScale: [1, 1, 1],
        palmOffset: [-0.055, -0.020, 0.005],
        fingerCurl: {
            thumb: [
                { x: -0.10, y: 0.15, z: 0.18 },
                { x: 0.00, y: 0.10, z: 0.12 },
                { x: 0.00, y: 0.05, z: 0.08 }
            ],
            index: [
                { x: 0.00, y: -0.04, z: 0.25 },
                { x: 0.00, y: 0.00, z: 0.35 },
                { x: 0.00, y: 0.00, z: 0.20 }
            ],
            middle: [
                { x: 0.00, y: 0.00, z: 0.30 },
                { x: 0.00, y: 0.00, z: 0.40 },
                { x: 0.00, y: 0.00, z: 0.22 }
            ],
            ring: [
                { x: 0.00, y: 0.04, z: 0.32 },
                { x: 0.00, y: 0.00, z: 0.42 },
                { x: 0.00, y: 0.00, z: 0.24 }
            ],
            little: [
                { x: 0.00, y: 0.06, z: 0.35 },
                { x: 0.00, y: 0.00, z: 0.45 },
                { x: 0.00, y: 0.00, z: 0.25 }
            ]
        }
    },
    book: {
        id: 'book',
        gripSocket: 'RightHand',
        localPosition: [-0.055, -0.022, 0.005],
        localRotation: [1.10, -0.05, -0.10],
        localScale: [1, 1, 1],
        palmOffset: [-0.055, -0.022, 0.005],
        fingerCurl: {
            thumb: [
                { x: -0.12, y: 0.18, z: 0.20 },
                { x: 0.00, y: 0.12, z: 0.15 },
                { x: 0.00, y: 0.08, z: 0.10 }
            ],
            index: [
                { x: 0.00, y: -0.04, z: 0.28 },
                { x: 0.00, y: 0.00, z: 0.38 },
                { x: 0.00, y: 0.00, z: 0.22 }
            ],
            middle: [
                { x: 0.00, y: 0.00, z: 0.32 },
                { x: 0.00, y: 0.00, z: 0.42 },
                { x: 0.00, y: 0.00, z: 0.24 }
            ],
            ring: [
                { x: 0.00, y: 0.04, z: 0.35 },
                { x: 0.00, y: 0.00, z: 0.45 },
                { x: 0.00, y: 0.00, z: 0.26 }
            ],
            little: [
                { x: 0.00, y: 0.06, z: 0.38 },
                { x: 0.00, y: 0.00, z: 0.48 },
                { x: 0.00, y: 0.00, z: 0.28 }
            ]
        }
    },
    tool: {
        id: 'tool',
        gripSocket: 'RightHand',
        localPosition: [-0.038, -0.014, 0.002],
        localRotation: [0.12, 0.15, -Math.PI / 2 + 0.1],
        localScale: [1, 1, 1],
        palmOffset: [-0.038, -0.014, 0.002],
        fingerCurl: {
            thumb: [
                { x: 0.30, y: 0.35, z: 0.25 },
                { x: 0.15, y: 0.45, z: 0.40 },
                { x: 0.15, y: 0.35, z: 0.35 }
            ],
            index: [
                { x: 0, y: 0.08, z: 0.65 },
                { x: 0, y: 0.02, z: 0.85 },
                { x: 0, y: 0, z: 0.75 }
            ],
            middle: [
                { x: 0, y: 0.0, z: 0.70 },
                { x: 0, y: 0.0, z: 0.90 },
                { x: 0, y: 0, z: 0.80 }
            ],
            ring: [
                { x: 0, y: -0.05, z: 0.70 },
                { x: 0, y: -0.02, z: 0.90 },
                { x: 0, y: 0, z: 0.80 }
            ],
            little: [
                { x: 0, y: -0.12, z: 0.65 },
                { x: 0, y: -0.04, z: 0.85 },
                { x: 0, y: 0, z: 0.75 }
            ]
        }
    },
    fishing_rod: {
        id: 'fishing_rod',
        gripSocket: 'RightHand',
        localPosition: [-0.028, -0.015, 0.048],
        localRotation: [0.38, 0.22, -Math.PI / 4],
        localScale: [1, 1, 1],
        palmOffset: [-0.028, -0.015, 0.048],
        fingerCurl: {
            thumb: [
                { x: 0.25, y: 0.30, z: 0.25 },
                { x: 0.15, y: 0.35, z: 0.30 },
                { x: 0.10, y: 0.25, z: 0.25 }
            ],
            index: [
                { x: 0, y: 0.06, z: 0.65 },
                { x: 0, y: 0.02, z: 0.80 },
                { x: 0, y: 0, z: 0.70 }
            ],
            middle: [
                { x: 0, y: 0.0, z: 0.70 },
                { x: 0, y: 0, z: 0.85 },
                { x: 0, y: 0, z: 0.75 }
            ],
            ring: [
                { x: 0, y: -0.04, z: 0.70 },
                { x: 0, y: 0, z: 0.85 },
                { x: 0, y: 0, z: 0.75 }
            ],
            little: [
                { x: 0, y: -0.08, z: 0.65 },
                { x: 0, y: 0, z: 0.80 },
                { x: 0, y: 0, z: 0.70 }
            ]
        }
    },
    empty_hand: {
        id: 'empty_hand',
        gripSocket: 'RightHand',
        fingerCurl: {
            thumb: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }],
            index: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }],
            middle: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }],
            ring: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }],
            little: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }]
        }
    }
};

export const ITEM_REGISTRY = {
    drink_green_tea: {
        id: 'drink_green_tea',
        name: 'Iced Green Tea Can',
        vi: 'Lon Trà Xanh Lạnh',
        icon: 'coffee',
        type: 'consumable',
        holdable: true,
        handPose: 'small_can',
        gripProfile: 'small_can',
        useAnimation: 'DrinkCan',
        useSound: 'drink_soft',
        model: 'can_green_tea'
    },
    reward_coffee_mug: {
        id: 'reward_coffee_mug',
        name: 'Developer Coffee Mug',
        vi: 'Ly Cà Phê Developer',
        icon: 'coffee',
        type: 'consumable',
        holdable: true,
        handPose: 'mug',
        gripProfile: 'mug',
        useAnimation: 'Coffee',
        useSound: 'drink_soft',
        model: 'coffee_mug'
    },
    drink_water_bottle: {
        id: 'drink_water_bottle',
        name: 'Mineral Water Bottle',
        vi: 'Chai Nước Khoáng',
        icon: 'coffee',
        type: 'consumable',
        holdable: true,
        handPose: 'bottle',
        gripProfile: 'bottle',
        useAnimation: 'DrinkCan',
        useSound: 'drink_soft',
        model: 'water_bottle'
    },
    item_cyber_phone: {
        id: 'item_cyber_phone',
        name: 'Cyber Communicator',
        vi: 'Thiết Bị Liên Lạc Cyber',
        icon: 'smartphone',
        type: 'holdable',
        holdable: true,
        handPose: 'phone',
        gripProfile: 'phone',
        model: 'cyber_phone'
    },
    item_dev_book: {
        id: 'item_dev_book',
        name: 'Systems Architecture Handbook',
        vi: 'Sổ Tay Kiến Trúc Hệ Thống',
        icon: 'book-open',
        type: 'holdable',
        holdable: true,
        handPose: 'book',
        gripProfile: 'book',
        model: 'dev_book'
    },
    hat_straw: {
        id: 'hat_straw',
        name: 'Country Straw Hat',
        vi: 'Nón Lá Đồng Quê',
        icon: 'shirt',
        type: 'wearable',
        holdable: false,
        model: 'straw_hat'
    },
    item_bamboo_rod: {
        id: 'item_bamboo_rod',
        name: 'Zen Bamboo Fishing Rod',
        vi: 'Cần Câu Trúc Zen',
        icon: 'fish',
        type: 'tool',
        holdable: true,
        handPose: 'fishing_rod',
        gripProfile: 'fishing_rod',
        model: 'bamboo_rod'
    },
    item_golden_rod: {
        id: 'item_golden_rod',
        name: 'Golden Master Fishing Rod',
        vi: 'Cần Câu Vàng Hoàng Gia',
        icon: 'fish',
        type: 'tool',
        holdable: true,
        handPose: 'fishing_rod',
        gripProfile: 'fishing_rod',
        model: 'golden_rod'
    },
    item_luminous_bait: {
        id: 'item_luminous_bait',
        name: 'Luminous Night Bait',
        vi: 'Mồi Câu Phát Quang',
        icon: 'sparkles',
        type: 'consumable',
        holdable: false,
        model: 'luminous_bait'
    },
    item_onsen_herbal_tea: {
        id: 'item_onsen_herbal_tea',
        name: 'Onsen Herbal Tea',
        vi: 'Trà Thảo Mộc Suối Nước Nóng',
        icon: 'coffee',
        type: 'consumable',
        holdable: true,
        handPose: 'mug',
        gripProfile: 'mug',
        useAnimation: 'Coffee',
        useSound: 'drink_soft',
        model: 'onsen_tea'
    },
    item_lofi_boombox: {
        id: 'item_lofi_boombox',
        name: 'Spatial Lo-Fi Boombox',
        vi: 'Đài Cassette Lo-Fi Cổ Điển',
        icon: 'music',
        type: 'holdable',
        holdable: true,
        handPose: 'phone',
        gripProfile: 'phone',
        model: 'lofi_boombox'
    },
    item_grilled_fish: {
        id: 'item_grilled_fish',
        name: 'Campfire Skewered Fish',
        vi: 'Cá Nướng Xiên Lửa Trại',
        icon: 'flame',
        type: 'consumable',
        holdable: true,
        handPose: 'small_can',
        gripProfile: 'small_can',
        useAnimation: 'DrinkCan',
        useSound: 'drink_soft',
        model: 'grilled_fish'
    },
    item_burnt_fish: {
        id: 'item_burnt_fish',
        name: 'Burnt Fish',
        vi: 'Cá Cháy Khét',
        icon: 'flame',
        type: 'consumable',
        holdable: true,
        handPose: 'small_can',
        gripProfile: 'small_can',
        useAnimation: 'DrinkCan',
        useSound: 'drink_soft',
        model: 'burnt_fish'
    },
    nullpointer_koi: {
        id: 'nullpointer_koi',
        name: 'NullPointer Koi',
        vi: 'Cá Koi NullPointer',
        icon: 'fish',
        type: 'raw_fish',
        holdable: true,
        handPose: 'small_can',
        gripProfile: 'small_can',
        value: 30
    },
    async_salmon: {
        id: 'async_salmon',
        name: 'Async Salmon',
        vi: 'Cá Hồi Bất Đồng Bộ',
        icon: 'fish',
        type: 'raw_fish',
        holdable: true,
        handPose: 'small_can',
        gripProfile: 'small_can',
        value: 45
    },
    memory_leak_eel: {
        id: 'memory_leak_eel',
        name: 'Memory Leak Eel',
        vi: 'Lươn Rò Rỉ Bộ Nhớ',
        icon: 'fish',
        type: 'raw_fish',
        holdable: true,
        handPose: 'small_can',
        gripProfile: 'small_can',
        value: 65
    },
    deadlock_crab: {
        id: 'deadlock_crab',
        name: 'Deadlock Crab',
        vi: 'Cua Khóa Chết',
        icon: 'fish',
        type: 'raw_fish',
        holdable: true,
        handPose: 'small_can',
        gripProfile: 'small_can',
        value: 60
    },
    stackoverflow_bass: {
        id: 'stackoverflow_bass',
        name: 'Stack Overflow Bass',
        vi: 'Cá Vược Tràn Ngăn Xếp',
        icon: 'fish',
        type: 'raw_fish',
        holdable: true,
        handPose: 'small_can',
        gripProfile: 'small_can',
        value: 75
    },
    docker_whale_fry: {
        id: 'docker_whale_fry',
        name: 'Docker Whale Fry',
        vi: 'Cá Voi Con Docker',
        icon: 'fish',
        type: 'raw_fish',
        holdable: true,
        handPose: 'small_can',
        gripProfile: 'small_can',
        value: 160
    },
    fish_koi: {
        id: 'fish_koi',
        name: 'Koi Carp',
        vi: 'Cá Chép Koi',
        icon: 'fish',
        type: 'raw_fish',
        holdable: true,
        handPose: 'small_can',
        gripProfile: 'small_can',
        value: 50
    },
    fish_salmon: {
        id: 'fish_salmon',
        name: 'River Salmon',
        vi: 'Cá Hồi Suối',
        icon: 'fish',
        type: 'raw_fish',
        holdable: true,
        handPose: 'small_can',
        gripProfile: 'small_can',
        value: 45
    },
    fish_bass: {
        id: 'fish_bass',
        name: 'Black Bass',
        vi: 'Cá Vược Đen',
        icon: 'fish',
        type: 'raw_fish',
        holdable: true,
        handPose: 'small_can',
        gripProfile: 'small_can',
        value: 40
    },
    fish_ayu: {
        id: 'fish_ayu',
        name: 'Sweetfish Ayu',
        vi: 'Cá Ayu Sông',
        icon: 'fish',
        type: 'raw_fish',
        holdable: true,
        handPose: 'small_can',
        gripProfile: 'small_can',
        value: 30
    }
};

export class PlayerInventory {
    constructor() {
        // 36 Slots Total: 0..8 Hotbar, 9..35 Storage
        this.slots = Array(36).fill(null);
        this.selectedSlot = null; // 0..8 (Hotbar index)
        this.equippedSlot = null; // 0..8 (Equipped slot index)
        this.isBusyUsing = false;
        this.isInventoryOpen = false;

        this.hotbarContainer = null;
        this.titleBannerEl = null;
        this.modalEl = null;
        this.storageContainer = null;
        this.modalHotbarContainer = null;

        this.draggedSlotIndex = null;
        this.selectedSwapSlot = null; // Click-to-swap source slot index
        this.teleCoins = 120;

        this.titleBannerTimer = null;
        this.init();
    }

    setTeleCoins(val) {
        this.teleCoins = typeof val === 'number' ? val : 120;
        const elements = document.querySelectorAll('.telecoins-amount, #shop-telecoins-display, #hud-telecoins-val');
        elements.forEach(el => {
            el.textContent = this.teleCoins;
        });
    }

    getTeleCoins() {
        return this.teleCoins;
    }

    async init() {
        if (typeof document === 'undefined') return;

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupDOM());
        } else {
            this.setupDOM();
        }

        window.addEventListener('teleterm-language-changed', () => {
            this.renderHotbar();
            if (this.isInventoryOpen) this.renderInventoryModal();
        });

        this.bindKeyboardShortcuts();
        await this.loadInventory();
    }

    setupDOM() {
        this.hotbarContainer = document.getElementById('hotbar-slots-container');
        this.titleBannerEl = document.getElementById('hotbar-item-title-banner');
        this.modalEl = document.getElementById('modal-player-inventory');
        this.storageContainer = document.getElementById('inventory-storage-grid');
        this.modalHotbarContainer = document.getElementById('inventory-hotbar-grid');

        const btnClose = document.getElementById('btn-close-inventory');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.closeInventory());
        }

        if (this.modalEl) {
            this.modalEl.addEventListener('click', (e) => {
                if (e.target === this.modalEl) this.closeInventory();
            });
        }

        this.renderHotbar();
    }

    bindKeyboardShortcuts() {
        window.addEventListener('keydown', (e) => {
            // Ignore when typing in an input, textarea, terminal or chat
            const active = document.activeElement;
            if (active && (
                active.tagName === 'INPUT' ||
                active.tagName === 'TEXTAREA' ||
                active.isContentEditable ||
                active.closest('.xterm') ||
                active.closest('#mmo-chat-container')
            )) {
                return;
            }

            // Keys '1' through '9' select hotbar slots directly (Section 6)
            const num = parseInt(e.key, 10);
            if (!isNaN(num) && num >= 1 && num <= 9) {
                e.preventDefault();
                this.selectSlot(num - 1);
                return;
            }

            // Key 'E' or 'I' toggles Full Player Inventory modal (Section 8)
            if (e.key === 'e' || e.key === 'E' || e.key === 'i' || e.key === 'I') {
                e.preventDefault();
                this.toggleInventory();
                return;
            }

            // Escape closes inventory
            if (e.key === 'Escape' && this.isInventoryOpen) {
                e.preventDefault();
                this.closeInventory();
            }
        });
    }

    async loadInventory() {
        try {
            const res = await fetch('/api/dev/inventory');
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.inventory)) {
                    this.slots = data.inventory.slice(0, 36);
                    while (this.slots.length < 36) this.slots.push(null);
                    
                    if (data.equippedItem) {
                        const idx = this.slots.slice(0, 9).findIndex(s => s && s.id === data.equippedItem.id);
                        if (idx !== -1) {
                            this.equippedSlot = idx;
                            this.selectedSlot = idx;
                            if (window.openWorld3D) {
                                window.openWorld3D.equipHandheldItem(this.slots[idx]);
                            }
                        }
                    }
                    this.renderHotbar();
                    return;
                }
            }
        } catch (e) {
            // Network fallback
        }

        try {
            const saved = localStorage.getItem('teleterm_player_inventory');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    this.slots = parsed.slice(0, 36);
                    while (this.slots.length < 36) this.slots.push(null);
                }
            }
        } catch (e) {}

        if (!this.slots.some(s => s && s.id === 'item_bamboo_rod')) {
            const emptyIdx = this.slots.findIndex((s, idx) => idx < 9 && !s);
            if (emptyIdx !== -1) {
                this.slots[emptyIdx] = { ...ITEM_REGISTRY.item_bamboo_rod };
            } else if (!this.slots[4]) {
                this.slots[4] = { ...ITEM_REGISTRY.item_bamboo_rod };
            }
        }

        this.renderHotbar();
    }

    async saveInventory() {
        try {
            localStorage.setItem('teleterm_player_inventory', JSON.stringify(this.slots));
        } catch (e) {}

        try {
            const equippedItem = this.equippedSlot !== null ? this.slots[this.equippedSlot] : null;
            await fetch('/api/dev/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inventory: this.slots,
                    equippedItem
                })
            });
        } catch (e) {}
    }

    selectSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 9) return;
        this.selectedSlot = slotIndex;
        const item = this.slots[slotIndex];

        if (item) {
            this.equip(slotIndex);
        } else {
            // Empty slot: unequip current held item cleanly without equipping null
            this.unequip();
        }

        this.showItemTitleBanner(item);
        this.renderHotbar();
        if (this.isInventoryOpen) this.renderInventoryModal();
    }

    showItemTitleBanner(item) {
        if (!this.titleBannerEl) {
            this.titleBannerEl = document.getElementById('hotbar-item-title-banner');
            if (!this.titleBannerEl) return;
        }

        if (this.titleBannerTimer) {
            clearTimeout(this.titleBannerTimer);
            this.titleBannerTimer = null;
        }

        if (!item) {
            this.titleBannerEl.classList.add('hidden');
            return;
        }

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';
        const itemName = isVi ? (item.vi || item.name) : item.name;

        this.titleBannerEl.textContent = itemName;
        this.titleBannerEl.classList.remove('hidden');
        this.titleBannerEl.classList.remove('fading');

        // Short fade-in, brief visibility (1.5s), fade-out (Section 7)
        this.titleBannerTimer = setTimeout(() => {
            this.titleBannerEl.classList.add('fading');
            setTimeout(() => {
                this.titleBannerEl.classList.add('hidden');
                this.titleBannerEl.classList.remove('fading');
            }, 400);
        }, 1500);
    }

    equip(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 9) return;
        const item = this.slots[slotIndex];
        if (!item) return;

        this.equippedSlot = slotIndex;
        this.selectedSlot = slotIndex;
        this.renderHotbar();

        if (window.openWorld3D) {
            window.openWorld3D.equipHandheldItem(item);
        }

        this.saveInventory();
    }

    unequip() {
        if (this.equippedSlot === null) return;
        this.equippedSlot = null;
        this.renderHotbar();

        if (window.openWorld3D) {
            window.openWorld3D.unequipHandheldItem();
        }

        this.saveInventory();
    }

    toggleSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 9) return;
        if (this.equippedSlot === slotIndex) {
            this.unequip();
        } else {
            this.selectSlot(slotIndex);
        }
    }

    equipSlot(slotIndex) {
        return this.equip(slotIndex);
    }

    useEquippedItem() {
        if (this.equippedSlot === null) return;
        const item = this.slots[this.equippedSlot];
        if (!item) return;
        if (window.openWorld3D) {
            if (typeof window.openWorld3D.startDrinkingHold === 'function') {
                window.openWorld3D.startDrinkingHold();
                setTimeout(() => {
                    if (typeof window.openWorld3D.stopDrinkingHold === 'function') {
                        window.openWorld3D.stopDrinkingHold();
                    }
                }, 1400);
            }
        }
    }

    addItem(itemDef) {
        const fullDef = ITEM_REGISTRY[itemDef.id] || itemDef;
        // Check hotbar first (0..8), then storage (9..35)
        let emptyIdx = this.slots.slice(0, 9).findIndex(s => s === null);
        if (emptyIdx === -1) {
            emptyIdx = this.slots.findIndex(s => s === null);
        }

        const i18n = window.TeleTermI18n;
        if (emptyIdx === -1) {
            const fullMsg = i18n ? i18n.t('toast_vending_full') : 'Inventory full (36/36 slots)!';
            if (window.openWorld3D?.onToast) window.openWorld3D.onToast(fullMsg, 'warning');
            return false;
        }

        this.slots[emptyIdx] = { ...fullDef, slotIndex: emptyIdx };
        this.renderHotbar();
        if (this.isInventoryOpen) this.renderInventoryModal();
        this.saveInventory();
        return true;
    }

    removeItem(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 36) return;
        if (this.equippedSlot === slotIndex) {
            this.unequip();
        }
        this.slots[slotIndex] = null;
        this.renderHotbar();
        if (this.isInventoryOpen) this.renderInventoryModal();
        this.saveInventory();
    }

    swapSlots(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= 36 || toIndex < 0 || toIndex >= 36) return;
        if (fromIndex === toIndex) return;

        const temp = this.slots[fromIndex];
        this.slots[fromIndex] = this.slots[toIndex];
        this.slots[toIndex] = temp;

        // Synchronize equipped slot if affected
        if (this.equippedSlot === fromIndex) {
            this.equippedSlot = toIndex < 9 ? toIndex : null;
            if (this.equippedSlot === null && window.openWorld3D) {
                window.openWorld3D.unequipHandheldItem();
            }
        } else if (this.equippedSlot === toIndex) {
            this.equippedSlot = fromIndex < 9 ? fromIndex : null;
            if (this.equippedSlot === null && window.openWorld3D) {
                window.openWorld3D.unequipHandheldItem();
            }
        }

        if (this.selectedSlot === fromIndex) {
            this.selectedSlot = toIndex < 9 ? toIndex : null;
        } else if (this.selectedSlot === toIndex) {
            this.selectedSlot = fromIndex < 9 ? fromIndex : null;
        }

        this.renderHotbar();
        if (this.isInventoryOpen) this.renderInventoryModal();
        this.saveInventory();
    }

    toggleInventory() {
        if (this.isInventoryOpen) this.closeInventory();
        else this.openInventory();
    }

    openInventory() {
        if (!this.modalEl) {
            this.modalEl = document.getElementById('modal-player-inventory');
        }
        if (!this.modalEl) return;

        this.isInventoryOpen = true;
        this.selectedSwapSlot = null;
        this.modalEl.classList.remove('hidden');
        this.modalEl.style.display = 'flex';
        this.renderInventoryModal();
    }

    closeInventory() {
        if (this.modalEl) {
            this.modalEl.classList.add('hidden');
            this.modalEl.style.display = 'none';
        }
        this.isInventoryOpen = false;
        this.selectedSwapSlot = null;
    }

    renderHotbar() {
        if (!this.hotbarContainer) {
            this.hotbarContainer = document.getElementById('hotbar-slots-container');
            if (!this.hotbarContainer) return;
        }

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';
        this.hotbarContainer.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            const slotEl = document.createElement('div');
            const isSelected = (this.selectedSlot === i);
            const isEquipped = (this.equippedSlot === i);

            slotEl.className = 'inventory-slot' + (isSelected ? ' selected' : '') + (isEquipped ? ' active' : '');
            slotEl.setAttribute('data-slot-index', i);

            const keyEl = document.createElement('span');
            keyEl.className = 'slot-key';
            keyEl.textContent = `${i + 1}`;
            slotEl.appendChild(keyEl);

            const item = this.slots[i];
            if (item) {
                const iconEl = document.createElement('span');
                iconEl.className = 'slot-icon';
                if (window.TeleTermIcons) {
                    iconEl.innerHTML = window.TeleTermIcons.render(item.icon || 'package', { size: 20 });
                } else {
                    iconEl.textContent = item.icon || '';
                }
                slotEl.appendChild(iconEl);

                const itemName = isVi ? (item.vi || item.name) : item.name;
                const slotTitle = `${itemName} [${i + 1}] — ${isVi ? 'Bấm chuột phải để Dùng' : 'Hold RMB to Drink/Use'}`;
                slotEl.setAttribute('title', slotTitle);

                if (isEquipped) {
                    const badge = document.createElement('span');
                    badge.className = 'slot-equipped-badge';
                    badge.textContent = isVi ? 'CẦM' : 'HELD';
                    slotEl.appendChild(badge);
                }
            } else {
                slotEl.setAttribute('title', isVi ? `Ô trống [${i + 1}]` : `Empty slot [${i + 1}]`);
            }

            slotEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectSlot(i);
            });

            this.hotbarContainer.appendChild(slotEl);
        }
    }

    renderInventoryModal() {
        if (!this.storageContainer) this.storageContainer = document.getElementById('inventory-storage-grid');
        if (!this.modalHotbarContainer) this.modalHotbarContainer = document.getElementById('inventory-hotbar-grid');
        if (!this.storageContainer || !this.modalHotbarContainer) return;

        const i18n = window.TeleTermI18n;
        const isVi = i18n && i18n.getLanguage() === 'vi';

        // Render 27 Storage Slots (9..35)
        this.storageContainer.innerHTML = '';
        for (let i = 9; i < 36; i++) {
            const slotEl = this.createModalSlotElement(i, isVi);
            this.storageContainer.appendChild(slotEl);
        }

        // Render 9 Hotbar Slots (0..8)
        this.modalHotbarContainer.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const slotEl = this.createModalSlotElement(i, isVi);
            this.modalHotbarContainer.appendChild(slotEl);
        }
    }

    createModalSlotElement(index, isVi) {
        const item = this.slots[index];
        const isHotbar = index < 9;
        const isEquipped = (this.equippedSlot === index);
        const isSwapSource = (this.selectedSwapSlot === index);

        const slotEl = document.createElement('div');
        slotEl.className = 'modal-inv-slot' +
            (isHotbar ? ' is-hotbar-slot' : '') +
            (isEquipped ? ' is-equipped' : '') +
            (isSwapSource ? ' is-swap-selected' : '');
        slotEl.setAttribute('data-slot-index', index);
        slotEl.draggable = item !== null;

        if (isHotbar) {
            const keyTag = document.createElement('span');
            keyTag.className = 'modal-slot-key-tag';
            keyTag.textContent = `${index + 1}`;
            slotEl.appendChild(keyTag);
        }

        if (item) {
            const iconEl = document.createElement('span');
            iconEl.className = 'modal-slot-icon';
            if (window.TeleTermIcons) {
                iconEl.innerHTML = window.TeleTermIcons.render(item.icon || 'package', { size: 22 });
            } else {
                iconEl.textContent = item.icon || '';
            }
            slotEl.appendChild(iconEl);

            const itemName = isVi ? (item.vi || item.name) : item.name;
            slotEl.setAttribute('title', itemName);

            if (isEquipped) {
                const badge = document.createElement('span');
                badge.className = 'modal-slot-badge';
                badge.textContent = isVi ? 'CẦM' : 'HELD';
                slotEl.appendChild(badge);
            }
        } else {
            slotEl.setAttribute('title', isVi ? 'Ô trống' : 'Empty');
        }

        // HTML5 Drag and Drop Handlers
        slotEl.addEventListener('dragstart', (e) => {
            if (!this.slots[index]) {
                e.preventDefault();
                return;
            }
            this.draggedSlotIndex = index;
            slotEl.classList.add('is-dragging');
            e.dataTransfer.setData('text/plain', String(index));
            e.dataTransfer.effectAllowed = 'move';
        });

        slotEl.addEventListener('dragend', () => {
            slotEl.classList.remove('is-dragging');
            this.draggedSlotIndex = null;
        });

        slotEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            slotEl.classList.add('drag-over');
        });

        slotEl.addEventListener('dragleave', () => {
            slotEl.classList.remove('drag-over');
        });

        slotEl.addEventListener('drop', (e) => {
            e.preventDefault();
            slotEl.classList.remove('drag-over');
            const from = this.draggedSlotIndex !== null ? this.draggedSlotIndex : parseInt(e.dataTransfer.getData('text/plain'), 10);
            if (!isNaN(from) && from !== index) {
                this.swapSlots(from, index);
            }
        });

        // Click-to-swap fallback (mobile touch and accessibility)
        slotEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.selectedSwapSlot === null) {
                if (this.slots[index]) {
                    this.selectedSwapSlot = index;
                    this.renderInventoryModal();
                }
            } else {
                const from = this.selectedSwapSlot;
                this.selectedSwapSlot = null;
                this.swapSlots(from, index);
            }
        });

        return slotEl;
    }

    getEquippedItem() {
        if (this.equippedSlot === null) return null;
        return this.slots[this.equippedSlot] || null;
    }
}

// Global singleton instance
export const playerInventory = new PlayerInventory();
if (typeof window !== 'undefined') {
    window.playerInventory = playerInventory;
    window.GRIP_PROFILES = GRIP_PROFILES;
    window.ITEM_REGISTRY = ITEM_REGISTRY;
}
