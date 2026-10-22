/**
 * TELETERM 3D — RADIAL EMOTE WHEEL ENGINE
 * 6-Slice Anime Radial Wheel triggered by 'G' key with quest unlock gates and retargeter triggers.
 */

export class EmoteWheel {
    constructor(questManager, options = {}) {
        this.questManager = questManager;
        this.onToast = options.onToast || console.log;

        this.isOpen = false;
        this.container = null;
        this.activeSlice = null;

        this.emotes = [
            {
                id: 'wave',
                iconName: 'sparkles',
                name: { en: 'Wave', vi: 'Vẫy chào' },
                desc: { en: 'A cheerful friendly greeting with organic shoulder sway', vi: 'Cử chỉ vẫy tay chào hỏi tự nhiên thân thiện' },
                anim: 'Wave',
                defaultUnlocked: true
            },
            {
                id: 'bow',
                iconName: 'users',
                name: { en: 'Bow', vi: 'Cúi chào' },
                desc: { en: 'Respectful anime bow with graceful spinal curvature', vi: 'Cúi người chào trang trọng và kính cẩn phong cách Nhật Bản' },
                anim: 'Bow',
                defaultUnlocked: true
            },
            {
                id: 'dance',
                iconName: 'music',
                name: { en: 'Vibe Dance', vi: 'Điệu nhảy Anime' },
                desc: { en: 'Groove rhythmically with joyful anime arm and hip motions', vi: 'Lắc hông và nhún nhảy theo nhịp điệu phong cách anime' },
                anim: 'VibeDance',
                defaultUnlocked: true
            },
            {
                id: 'meditate',
                iconName: 'orbit',
                name: { en: 'Meditate', vi: 'Ngồi thiền' },
                desc: { en: 'Enter deep zen contemplation and serene breathing', vi: 'Ngồi tĩnh tâm thiền định với hơi thở an yên' },
                anim: 'Meditate',
                defaultUnlocked: true
            },
            {
                id: 'photo',
                iconName: 'camera',
                name: { en: 'Photo Pose', vi: 'Tạo dáng Chụp ảnh' },
                desc: { en: 'Flash an adorable double-peace V-sign with tilted head', vi: 'Tạo dáng V-sign đáng yêu và nghiêng đầu chụp ảnh' },
                anim: 'PhotoPose',
                defaultUnlocked: true
            },
            {
                id: 'kanpai',
                iconName: 'coffee',
                name: { en: 'Kanpai', vi: 'Cụng ly' },
                desc: { en: 'Raise your can for a toast to reliable code', vi: 'Nâng ly chúc mừng mã nguồn mượt mà' },
                anim: 'DrinkCan',
                defaultUnlocked: true
            }
        ];

        this.init();
    }

    init() {
        this.createElements();
        this.bindEvents();
    }

    createElements() {
        if (document.getElementById('radial-emote-wheel')) {
            this.container = document.getElementById('radial-emote-wheel');
            return;
        }

        const el = document.createElement('div');
        el.id = 'radial-emote-wheel';
        el.className = 'radial-emote-overlay hidden';
        el.innerHTML = `
            <div class="radial-wheel-container">
                <div class="radial-wheel-center" id="wheel-center">
                    <span class="wheel-center-icon" id="wheel-center-icon"><span class="tt-icon tt-icon-32 tt-icon-accent" data-icon="sparkles"></span></span>
                    <span class="wheel-center-title" id="wheel-center-title">Emote Wheel</span>
                    <span class="wheel-center-desc" id="wheel-center-desc">Nhấn [G] hoặc nhấp chuột để chọn</span>
                </div>
                <div class="radial-wheel-slices" id="wheel-slices">
                    <!-- Slices rendered dynamically -->
                </div>
            </div>
            <div class="radial-wheel-hint">
                <span>[G] hoặc [Esc] để đóng</span>
            </div>
        `;

        document.body.appendChild(el);
        this.container = el;
        this.slicesContainer = el.querySelector('#wheel-slices');
        this.centerIcon = el.querySelector('#wheel-center-icon');
        this.centerTitle = el.querySelector('#wheel-center-title');
        this.centerDesc = el.querySelector('#wheel-center-desc');
    }

    bindEvents() {
        // Backdrop click to close
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.close();
            }
        });

        // Global G key toggle listener is coordinated in open-world-3d.js
        window.addEventListener('teleterm:toggle-emote-wheel', () => {
            this.toggle();
        });
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        this.isOpen = true;
        this.container.classList.remove('hidden');
        this.renderSlices();
    }

    close() {
        this.isOpen = false;
        this.container.classList.add('hidden');
    }

    renderSlices() {
        if (!this.slicesContainer) return;
        this.slicesContainer.innerHTML = '';

        const unlockedList = this.questManager?.unlockedEmotes || ['wave'];
        const lang = (window.TeleTermI18n && window.TeleTermI18n.currentLang) || 'en';
        const isVi = lang === 'vi';

        const total = this.emotes.length;
        const radius = 130; // px distance from center

        this.emotes.forEach((emote, idx) => {
            const isUnlocked = emote.defaultUnlocked || unlockedList.includes(emote.id);
            const angle = (idx * (360 / total) - 90) * (Math.PI / 180);
            const x = Math.round(Math.cos(angle) * radius);
            const y = Math.round(Math.sin(angle) * radius);

            const slice = document.createElement('div');
            slice.className = `radial-slice ${isUnlocked ? 'unlocked' : 'locked'}`;
            slice.style.setProperty('--dx', `${x}px`);
            slice.style.setProperty('--dy', `${y}px`);
            slice.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;

            const name = emote.name[lang] || emote.name.en;
            const desc = emote.desc[lang] || emote.desc.en;
            const hint = emote.unlockHint ? (emote.unlockHint[lang] || emote.unlockHint.en) : '';

            const iconHtml = window.TeleTermIcons
                ? window.TeleTermIcons.render(emote.iconName, { size: 22 })
                : `<span class="tt-icon tt-icon-20" data-icon="${emote.iconName}"></span>`;

            slice.innerHTML = `
                <div class="slice-icon-wrap">
                    <span class="slice-icon">${iconHtml}</span>
                    ${!isUnlocked ? '<span class="slice-lock-badge"><span class="tt-icon tt-icon-12" data-icon="lock"></span></span>' : ''}
                </div>
                <span class="slice-label">${name}</span>
            `;

            // Hover preview in center
            slice.addEventListener('mouseenter', () => {
                if (window.TeleTermIcons) {
                    this.centerIcon.innerHTML = window.TeleTermIcons.render(emote.iconName, { size: 32, class: 'tt-icon-accent' });
                }
                this.centerTitle.textContent = name;
                if (isUnlocked) {
                    this.centerDesc.textContent = desc;
                    this.centerDesc.className = 'wheel-center-desc';
                } else {
                    this.centerDesc.textContent = hint || (isVi ? 'Chưa mở khóa' : 'Locked');
                    this.centerDesc.className = 'wheel-center-desc text-locked';
                }
            });

            // Click action
            slice.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isUnlocked) {
                    this.triggerEmote(emote);
                } else {
                    if (this.onToast) {
                        this.onToast(hint || (isVi ? 'Cử chỉ này đang khóa' : 'This emote is locked'), 'warning');
                    }
                }
            });

            this.slicesContainer.appendChild(slice);
        });

        // Set default center text
        if (window.TeleTermIcons) {
            this.centerIcon.innerHTML = window.TeleTermIcons.render('sparkles', { size: 32, class: 'tt-icon-accent' });
            window.TeleTermIcons.hydrate(this.container);
        }
        this.centerTitle.textContent = isVi ? 'Bánh Xe Cử Chỉ' : 'Emote Wheel';
        this.centerDesc.textContent = isVi ? 'Rê chuột vào để xem, bấm để thực hiện' : 'Hover to inspect, click to perform';
    }

    triggerEmote(emote) {
        const lang = (window.TeleTermI18n && window.TeleTermI18n.currentLang) || 'en';
        const isVi = lang === 'vi';
        const name = emote.name[lang] || emote.name.en;

        // Drive avatar animation
        if (window.openWorld3D?.retargeter) {
            const ret = window.openWorld3D.retargeter;
            if (typeof ret.setAnimation === 'function') {
                ret.setAnimation(emote.anim);
                // Return to idle after a few seconds unless it's meditation
                if (emote.anim !== 'Thinking' && emote.anim !== 'Meditate') {
                    setTimeout(() => {
                        if (ret.getAnimation() === emote.anim) {
                            ret.setAnimation('Idle');
                        }
                    }, 4200);
                }
            }
        }

        // Show player action feedback
        if (this.onToast) {
            const toastMsg = isVi ? `${emote.icon} Bạn thực hiện: ${name}` : `${emote.icon} You performed: ${name}`;
            this.onToast(toastMsg, 'info');
        }

        // Emit emote event for MMO presence
        window.dispatchEvent(new CustomEvent('teleterm:emote-performed', {
            detail: { emoteId: emote.id, anim: emote.anim }
        }));

        this.close();
    }
}
