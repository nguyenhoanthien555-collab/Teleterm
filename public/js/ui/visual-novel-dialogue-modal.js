/**
 * TELETERM 3D — VISUAL NOVEL DIALOGUE & QUEST ENGINE
 * High-immersion anime Visual Novel dialogue overlay:
 * - Expressive character avatar portraits (Lumina, Sakura, Ren, Kaede) with emotion states
 * - Fluid 24ms typewriter text pacing with instant line completion on click
 * - Branching interactive choice trees with keyboard (1-9) & click selection
 * - Web Audio harmonic chimes and quest-line integration
 */
export class VisualNovelDialogueModal {
    constructor(options = {}) {
        this.onToast = options.onToast || console.log;
        this.isOpen = false;
        this.isTyping = false;
        this.typewriterTimer = null;
        this.fullText = '';
        this.audioCtx = null;

        this.currentNpc = null;
        this.dialogueQueue = [];
        this.currentStepIdx = 0;
        this.currentChoices = [];

        this.characters = {
            lumina: {
                id: 'lumina',
                name: 'Lumina',
                role: { en: 'Lead AI Architect', vi: 'Kiến Trúc Sư AI Trưởng' },
                color: '#00f0ff',
                themeClass: 'theme-lumina',
                avatarBg: 'linear-gradient(135deg, #0284c7, #00f0ff)',
                icon: 'zap'
            },
            sakura: {
                id: 'sakura',
                name: 'Sakura',
                role: { en: 'Tea Master & Lorekeeper', vi: 'Trà Sư & Người Giữ Ký Ức' },
                color: '#f43f5e',
                themeClass: 'theme-sakura',
                avatarBg: 'linear-gradient(135deg, #e11d48, #fb7185)',
                icon: 'coffee'
            },
            ren: {
                id: 'ren',
                name: 'Ren',
                role: { en: 'Kernel & Systems Auditor', vi: 'Chuyên Viên Kiểm Định Nhân HĐH' },
                color: '#10b981',
                themeClass: 'theme-ren',
                avatarBg: 'linear-gradient(135deg, #059669, #34d399)',
                icon: 'lock'
            },
            kaede: {
                id: 'kaede',
                name: 'Kaede',
                role: { en: 'QA & Performance Specialist', vi: 'Kỹ Sư QA & Tối Ưu Hiệu Năng' },
                color: '#f59e0b',
                themeClass: 'theme-kaede',
                avatarBg: 'linear-gradient(135deg, #d97706, #fbbf24)',
                icon: 'gauge'
            }
        };

        this.initDOM();
        this.initAudio();
        this.bindEvents();

        if (typeof window !== 'undefined') {
            window.visualNovelDialogueModal = this;
        }
    }

    initDOM() {
        if (document.getElementById('vn-dialogue-overlay')) {
            this.container = document.getElementById('vn-dialogue-overlay');
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'vn-dialogue-overlay';
        overlay.className = 'vn-overlay hidden';
        overlay.innerHTML = `
            <div class="vn-card-wrap">
                <div class="vn-portrait-panel" id="vn-portrait-panel">
                    <div class="vn-portrait-glow" id="vn-portrait-glow"></div>
                    <div class="vn-portrait-badge" id="vn-portrait-badge">
                        <span class="vn-portrait-icon" id="vn-portrait-icon"><span class="tt-icon tt-icon-24" data-icon="sparkles"></span></span>
                        <div class="vn-emotion-tag" id="vn-emotion-tag">Joy</div>
                    </div>
                </div>
                <div class="vn-content-panel" id="vn-content-panel">
                    <div class="vn-header">
                        <div class="vn-name-group">
                            <span class="vn-name" id="vn-char-name">Lumina</span>
                            <span class="vn-role-pill" id="vn-char-role">Lead Architect</span>
                        </div>
                        <div class="vn-step-counter" id="vn-step-counter">1 / 1</div>
                        <button class="vn-btn-close" id="vn-btn-close" title="Close [Esc]"><span class="tt-icon tt-icon-16" data-icon="x"></span></button>
                    </div>
                    <div class="vn-body" id="vn-body">
                        <p class="vn-text" id="vn-text"></p>
                    </div>
                    <div class="vn-choices-container hidden" id="vn-choices"></div>
                    <div class="vn-footer">
                        <span class="vn-hint-text" id="vn-hint-text">Nhấp chuột hoặc [Space] để tiếp tục</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        this.container = overlay;
        this.nameEl = overlay.querySelector('#vn-char-name');
        this.roleEl = overlay.querySelector('#vn-char-role');
        this.textEl = overlay.querySelector('#vn-text');
        this.bodyEl = overlay.querySelector('#vn-body');
        this.choicesEl = overlay.querySelector('#vn-choices');
        this.counterEl = overlay.querySelector('#vn-step-counter');
        this.portraitBadge = overlay.querySelector('#vn-portrait-badge');
        this.portraitIcon = overlay.querySelector('#vn-portrait-icon');
        this.emotionTag = overlay.querySelector('#vn-emotion-tag');
        this.btnClose = overlay.querySelector('#vn-btn-close');
    }

    initAudio() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.audioCtx = new AudioCtx();
        } catch (e) {}
    }

    playChime(type = 'step') {
        if (!this.audioCtx) return;
        try {
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            if (type === 'step') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, now); // D5
                osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.08); // A5
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'choice') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
                osc.start(now);
                osc.stop(now + 0.16);
            }
        } catch (e) {}
    }

    bindEvents() {
        if (!this.container) return;

        // Click on content panel skips current typing line or advances
        this.bodyEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleAdvance();
        });

        this.btnClose.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
        });

        // Keyboard navigation
        window.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            if (e.key === 'Escape') {
                this.close();
            } else if (e.key === ' ' || e.key === 'Enter') {
                // If not choosing a numbered option
                if (this.currentChoices.length === 0 || this.isTyping) {
                    e.preventDefault();
                    this.handleAdvance();
                }
            } else if (['1', '2', '3', '4'].includes(e.key) && this.currentChoices.length > 0 && !this.isTyping) {
                const choiceIdx = parseInt(e.key, 10) - 1;
                if (this.currentChoices[choiceIdx]) {
                    this.selectChoice(this.currentChoices[choiceIdx]);
                }
            }
        });
    }

    /**
     * Opens dialogue with specified character and script lines
     */
    open(npcId, lines = [], choices = []) {
        const char = this.characters[npcId.toLowerCase()] || this.characters.lumina;
        this.currentNpc = char;
        this.dialogueQueue = Array.isArray(lines) ? lines : [lines];
        this.currentChoices = Array.isArray(choices) ? [...choices] : [];

        // Always provide a quick link to Cyber-Shop & Trading Bazaar
        if (!this.currentChoices.some(c => c && (c.actionName === 'open_shop' || c.icon === 'shopping-bag'))) {
            this.currentChoices.push({
                actionName: 'open_shop',
                text: { en: '🛒 Open Cyber-Shop', vi: '🛒 Mở Cyber-Shop' },
                icon: 'shopping-bag',
                action: () => {
                    if (window.cyberShopSystem) window.cyberShopSystem.open();
                }
            });
        }

        this.currentStepIdx = 0;
        this.isOpen = true;

        const lang = (window.TeleTermI18n && window.TeleTermI18n.currentLang) || 'en';
        this.nameEl.textContent = char.name;
        if (window.TeleTermIcons) {
            this.portraitIcon.innerHTML = window.TeleTermIcons.render(char.icon, { size: 28 });
            window.TeleTermIcons.hydrate(this.container);
        } else {
            this.portraitIcon.textContent = char.icon;
        }
        this.portraitBadge.style.background = char.avatarBg;

        this.container.classList.remove('hidden');
        this.playChime('step');

        this.showStep(0);

        window.dispatchEvent(new CustomEvent('teleterm:vn-dialogue-opened', {
            detail: { npcId: char.id }
        }));
    }

    showStep(idx) {
        if (idx >= this.dialogueQueue.length) {
            if (this.currentChoices.length > 0) {
                this.showChoices();
            } else {
                this.close();
            }
            return;
        }

        this.currentStepIdx = idx;
        const total = this.dialogueQueue.length;
        this.counterEl.textContent = `${idx + 1} / ${total}`;

        const lang = (window.TeleTermI18n && window.TeleTermI18n.currentLang) || 'en';
        let stepData = this.dialogueQueue[idx];
        let text = '';
        let emotion = 'Friendly';

        if (typeof stepData === 'string') {
            text = stepData;
        } else if (stepData) {
            text = stepData[lang] || stepData.en || stepData.text || '';
            emotion = stepData.emotion || 'Friendly';
        }

        this.emotionTag.textContent = emotion;
        this.choicesEl.classList.add('hidden');
        this.startTypewriter(text);
    }

    startTypewriter(text) {
        if (this.typewriterTimer) clearInterval(this.typewriterTimer);
        this.isTyping = true;
        this.fullText = text;
        this.textEl.textContent = '';

        let i = 0;
        this.typewriterTimer = setInterval(() => {
            if (i < text.length) {
                this.textEl.textContent += text[i];
                i++;
            } else {
                this.finishTypewriter();
            }
        }, 22);
    }

    finishTypewriter() {
        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
            this.typewriterTimer = null;
        }
        this.textEl.textContent = this.fullText;
        this.isTyping = false;

        // If this is the last line and choices exist, show them immediately
        if (this.currentStepIdx === this.dialogueQueue.length - 1 && this.currentChoices.length > 0) {
            this.showChoices();
        }
    }

    handleAdvance() {
        if (this.isTyping) {
            // Click = immediately complete the current line without skipping
            this.finishTypewriter();
        } else {
            // If already complete, advance to the next line
            if (this.currentStepIdx < this.dialogueQueue.length - 1) {
                this.showStep(this.currentStepIdx + 1);
            } else if (this.currentChoices.length > 0) {
                this.showChoices();
            } else {
                this.close();
            }
        }
    }

    showChoices() {
        this.choicesEl.innerHTML = '';
        this.choicesEl.classList.remove('hidden');

        const lang = (window.TeleTermI18n && window.TeleTermI18n.currentLang) || 'en';

        this.currentChoices.forEach((c, idx) => {
            const btn = document.createElement('button');
            btn.className = 'vn-choice-btn';
            const label = c.text ? (c.text[lang] || c.text.en || c.text) : (c[lang] || c.en || c);
            const iconSvg = (c.icon && window.TeleTermIcons) 
                ? `<span class="vn-choice-icon">${window.TeleTermIcons.render(c.icon, { size: 14 })}</span>` 
                : '';
            btn.innerHTML = `<span class="vn-choice-key">${idx + 1}</span> ${iconSvg}<span class="vn-choice-label">${label}</span>`;
            
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectChoice(c);
            });

            this.choicesEl.appendChild(btn);
        });
    }

    selectChoice(choice) {
        this.playChime('choice');
        this.choicesEl.classList.add('hidden');

        if (typeof choice.action === 'function') {
            choice.action();
        }

        window.dispatchEvent(new CustomEvent('teleterm:vn-choice-selected', {
            detail: { npcId: this.currentNpc.id, choice }
        }));

        if (choice.nextLines) {
            this.dialogueQueue = choice.nextLines;
            this.currentChoices = choice.nextChoices || [];
            this.showStep(0);
        } else {
            this.close();
        }
    }

    close() {
        if (this.typewriterTimer) clearInterval(this.typewriterTimer);
        this.isOpen = false;
        this.container.classList.add('hidden');

        window.dispatchEvent(new CustomEvent('teleterm:vn-dialogue-closed', {
            detail: { npcId: this.currentNpc ? this.currentNpc.id : null }
        }));
    }
}

export const visualNovelDialogueModal = new VisualNovelDialogueModal();
