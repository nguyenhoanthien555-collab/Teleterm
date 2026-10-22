/**
 * TELETERM ANIME NPC & DIALOGUE SYSTEM
 * 4 Rich Anime Characters (2 Male, 2 Female) with 30+ interactive dialogues,
 * choice trees, Web Audio synthesized chimes, and anime Visual Novel UI.
 */

import { playerContextManager } from './npc/player-context.js';
import { resolveContextualDialogue, getNpcDialogueLines, NPC_DIALOGUE_DATABASE, DIALOGUE_CATEGORIES } from './npc/npc-dialogue-data.js';

export class NpcDialogueSystem {
    constructor(options = {}) {
        this.onToast = options.onToast || console.log;
        this.onSummonRequest = options.onSummonRequest || null;

        this.modalEl = document.getElementById('anime-dialogue-modal');
        this.avatarEl = document.getElementById('dialogue-avatar');
        this.nameEl = document.getElementById('dialogue-char-name');
        this.roleTagEl = document.getElementById('dialogue-char-role');
        this.textEl = document.getElementById('dialogue-text-body');
        this.choicesContainer = document.getElementById('dialogue-choices-container');
        this.btnNext = document.getElementById('dialogue-btn-next');
        this.btnClose = document.getElementById('dialogue-btn-close');

        this.currentNpc = null;
        this.currentStep = 0;
        this.isTyping = false;
        this.typewriterTimer = null;
        this.fullCurrentText = '';
        this.audioCtx = null;
        this.currentChoices = [];

        if (this.modalEl) {
            this.modalEl.classList.add('hidden');
            this.modalEl.style.display = 'none';
        }

        if (typeof window !== 'undefined') {
            window.npcDialogueSystem = this;
        }

        this.initAudio();
        this.initNpcData();
        this.bindEvents();
    }

    initAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        } catch (e) {}
    }

    playChime(type = 'talk') {
        if (!this.audioCtx) return;
        try {
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            const now = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            if (type === 'talk') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
                gain.gain.setValueAtTime(0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'select') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
                osc.start(now);
                osc.stop(now + 0.18);
            } else if (type === 'open') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(329.63, now); // E4
                osc.frequency.setValueAtTime(440.00, now + 0.06); // A4
                osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
            }
        } catch (e) {}
    }

    initNpcData() {
        this.npcs = {
            lumina: {
                id: 'lumina',
                name: 'Lumina',
                gender: 'female',
                role: 'Spirit of Light • Soul Companion',
                icon: 'zap',
                avatarEmoji: '',
                themeColor: '#38bdf8',
                accentColor: 'rgba(56, 189, 248, 0.2)',
                quotes: [
                    {
                        text: 'Hello there! The sunset breeze over the lake feels wonderful, doesn\'t it? Have you been coding hard today? Let me watch the twilight with you for a while~',
                        choices: [
                            { label: 'Thanks, I\'d like to check Antigravity', next: 'agy_help' },
                            { label: 'The sunset looks lovely next to you, Lumina', next: 'romantic' },
                            { label: 'Can you summon the Terminal for me?', action: 'summon_term' }
                        ]
                    }
                ],
                branches: {
                    agy_help: {
                        text: 'Of course! Antigravity can now be interacted with directly on the Web! Summon the Antigravity deck to chat, review plans, and dispatch prompts seamlessly without opening a terminal.',
                        choices: [
                            { label: 'Summon Antigravity now!', action: 'summon_agy' },
                            { label: 'Awesome, you\'re really smart', next: 'flattered' }
                        ]
                    },
                    romantic: {
                        text: 'Hehe, you flatter me! But standing beside you among these cherry blossom petals, every dry line of code turns into sweet melody.',
                        choices: [
                            { label: 'Let\'s continue our journey together!', next: 'end_happy' },
                            { label: 'Let me try summoning Codex', action: 'summon_codex' }
                        ]
                    },
                    flattered: {
                        text: 'Hehe, your compliments make me so happy! I\'ll always be here guarding your servers and quota energy!',
                        choices: [{ label: 'Alright, see you soon', next: 'end_happy' }]
                    },
                    end_happy: {
                        text: 'Have an evening full of creative inspiration! Whenever you need me, just visit me by this lakeside~',
                        choices: []
                    }
                },
                randomChits: [
                    'Remember to drink some warm tea! Long coding sessions can strain your eyes~',
                    'I just counted 150 sakura petals drifting across the water, so romantic!',
                    'Your server has 24/7 anti-sleep watch enabled, code away with peace of mind!',
                    'When an algorithm feels stuck, take a deep breath of this fresh evening breeze!'
                ]
            },

            sakura: {
                id: 'sakura',
                name: 'Sakura',
                gender: 'female',
                role: 'Cherry Blossom Blade • Systems Guardian',
                icon: 'coffee',
                avatarEmoji: '',
                themeColor: '#f43f5e',
                accentColor: 'rgba(244, 63, 94, 0.2)',
                quotes: [
                    {
                        text: 'Hmph, you again? Don\'t think admiring the scenery under this cherry tree means I didn\'t notice you stepped away from your terminal! Do you need my blade to slash some bugs for you?',
                        choices: [
                            { label: 'You\'re always so serious, Sakura', next: 'tsundere' },
                            { label: 'I want to inspect system processes', action: 'open_tools' },
                            { label: 'Summon the terminal, swordswoman!', action: 'summon_term' }
                        ]
                    }
                ],
                branches: {
                    tsundere: {
                        text: 'W-Who\'s being serious with you anyway! I just don\'t want to see your server crash, that\'s all! Honestly... if your code breaks, who\'s going to brew my afternoon tea, huh?!',
                        choices: [
                            { label: 'I promise not to make you worry', next: 'caring' },
                            { label: 'Summon Antigravity to help me patch code', action: 'summon_agy' }
                        ]
                    },
                    caring: {
                        text: 'G-Good, as long as you know! My blade only slashes bugs and protects your peace. If you\'re tired, lean against this sakura trunk and rest for a bit...',
                        choices: [{ label: 'Thank you, Sakura', next: 'end_sakura' }]
                    },
                    end_sakura: {
                        text: 'Keep up the momentum! I\'ll stay on guard here—anyone who tries to tamper with your server will answer to my blade!',
                        choices: []
                    }
                },
                randomChits: [
                    'Swordsmanship and Clean Code share the same virtue: strike sharp with zero wasted lines!',
                    'The sunset wind caught a blossom petal in my hair... aren\'t you going to brush it off?',
                    'Don\'t forget to commit your code often—if you lose changes, you\'ll face my penalty!',
                    'Terminal response latency is razor sharp right now, just like a perfect sword slice!'
                ]
            },

            ren: {
                id: 'ren',
                name: 'Ren',
                gender: 'male',
                role: 'Techno Magus • Architectural Advisor',
                icon: 'lock',
                avatarEmoji: '',
                themeColor: '#a855f7',
                accentColor: 'rgba(168, 85, 247, 0.2)',
                quotes: [
                    {
                        text: 'Greetings, my friend! Look at the evening waves rippling over the lake, reflecting like data packets flowing in harmony. Are you pondering distributed architectures or a romantic verse?',
                        choices: [
                            { label: 'I\'m optimizing the AI developer experience', next: 'architecture' },
                            { label: 'Does this open world bring you calm?', next: 'nature_chat' },
                            { label: 'Summon Codex AI to discuss code with me', action: 'summon_codex' }
                        ]
                    }
                ],
                branches: {
                    architecture: {
                        text: 'Fascinating! Unifying Antigravity and Codex inside this 3D metaverse is a true breakthrough. Technology isn\'t merely problem-solving; it is an art form that touches the human spirit.',
                        choices: [
                            { label: 'You speak true wisdom, Ren', next: 'end_ren' },
                            { label: 'Summon Antigravity to experiment', action: 'summon_agy' }
                        ]
                    },
                    nature_chat: {
                        text: 'Deeply tranquil indeed. Sometimes between millions of code lines, pausing to watch bioluminescent fireflies in the twilight is the best elixir to replenish creative energy.',
                        choices: [{ label: 'Indeed it is, thank you Ren', next: 'end_ren' }]
                    },
                    end_ren: {
                        text: 'Feel free to explore this sanctuary. Whenever you wish to debate code sorcery or distributed consensus, I shall be here beside this ancient rune stone.',
                        choices: []
                    }
                },
                randomChits: [
                    'The pinnacle of coding magic is transforming abstract thought into living interactive worlds.',
                    'The sunset is gradually yielding to crystal starlight—a glorious night to forge code!',
                    'Each AI model embodies an elemental school: Gemini brings swift light, Claude brings deep reasoning, GPT brings endurance.',
                    'Wherever you roam across this land, summon at will and your holographic matrix appears instantly.'
                ]
            },

            kaede: {
                id: 'kaede',
                name: 'Kaede',
                gender: 'male',
                role: 'Arcane Machinist • Infrastructure Engineer',
                icon: 'gauge',
                avatarEmoji: '',
                themeColor: '#10b981',
                accentColor: 'rgba(16, 185, 129, 0.2)',
                quotes: [
                    {
                        text: 'Hey commander! The Cloudflare Tunnel is holding ultra-stable ping. Your cellular 5G or remote Wi-Fi connects straight to this 24/7 rig. Everything runs smoothly like clockwork gears.',
                        choices: [
                            { label: 'Great work Kaede, report PC status', action: 'open_tools' },
                            { label: 'What are you inspecting by the boardwalk?', next: 'survey' },
                            { label: 'Summon the Terminal to run commands', action: 'summon_term' }
                        ]
                    }
                ],
                branches: {
                    survey: {
                        text: 'I just calibrated the host anti-sleep watchdog. You can pocket your phone, take a walk, or sip coffee—your session will never disconnect midway.',
                        choices: [
                            { label: 'Thank you, you\'re a very dependable engineer', next: 'end_kaede' },
                            { label: 'Open the cyber control tools', action: 'open_tools' }
                        ]
                    },
                    end_kaede: {
                        text: 'Just doing my duty! Wander and create freely—I\'ll safeguard the infrastructure under the hood!',
                        choices: []
                    }
                },
                randomChits: [
                    'CPU voltage and cooler fans are humming silently, fully primed for the heaviest AI workloads.',
                    'Did you know? This timber bridge across the water reaches toward endless new horizons.',
                    'The Cyber Drawer tools on your deck are always standing by whenever you need remote desktop capture!',
                    'The speed of light has its limits, but the bond between you and this rig is instantaneous.'
                ]
            },
            kaito: {
                id: 'kaito',
                name: 'Kaito',
                gender: 'male',
                role: 'Artisan Barista & Coffee Master',
                icon: 'coffee',
                avatarEmoji: '',
                themeColor: '#f59e0b',
                accentColor: 'rgba(245, 158, 11, 0.2)',
                quotes: [
                    {
                        text: 'Welcome to the Developer Hub Artisan Coffee Bar! What can I brew for your coding session today? A pour-over or a silky flat white?',
                        choices: [
                            { label: 'Summon Terminal', action: 'summon_term' },
                            { label: 'Summon Antigravity AI', action: 'summon_agy' }
                        ]
                    }
                ],
                branches: {},
                randomChits: [
                    'Fresh Ethiopian Yirgacheffe roasted this morning with jasmine floral notes!',
                    'Staying hydrated and well-caffeinated fuels the cleanest architecture commits.',
                    'The morning shade under these umbrellas is our favorite deep work sanctuary.'
                ]
            }
        };
    }

    bindEvents() {
        if (this.btnClose) {
            this.btnClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.close();
            });
        }
        if (this.btnNext) {
            this.btnNext.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleNextOrSkip();
            });
        }
        if (this.modalEl) {
            this.modalEl.addEventListener('click', (e) => {
                if (e.target === this.modalEl) {
                    this.close();
                }
            });
        }

        // Fast typewriter skip on card click (Master Spec Section 52–53)
        const cardEl = this.modalEl ? this.modalEl.querySelector('.anime-dialogue-card') : null;
        if (cardEl) {
            cardEl.addEventListener('click', (e) => {
                if (e.target.closest('button') || e.target.closest('.anime-choice-btn') || e.target.closest('.dialogue-close-btn')) {
                    return;
                }
                if (this.isTyping) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleNextOrSkip();
                    return;
                }
                if (!this.currentChoices || this.currentChoices.length === 0) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleNextOrSkip();
                }
            });
        }
    }

    open(npcId) {
        const npc = this.npcs[npcId];
        if (!npc) return;

        this.currentNpc = npc;
        this.currentStep = 0;
        this.playChime('open');

        if (this.modalEl) {
            this.modalEl.classList.remove('hidden');
            this.modalEl.style.display = 'flex';
        }
        if (this.avatarEl) {
            if (window.TeleTermIcons && npc.icon) {
                this.avatarEl.innerHTML = window.TeleTermIcons.render(npc.icon, { size: 28 });
            } else {
                this.avatarEl.textContent = npc.avatarEmoji || '';
            }
        }
        if (this.nameEl) {
            this.nameEl.textContent = npc.name;
            this.nameEl.style.color = npc.themeColor;
        }
        if (this.roleTagEl) {
            const i18n = window.TeleTermI18n;
            this.roleTagEl.textContent = (i18n ? i18n.t('role_' + npc.id) : '') || npc.role;
            if (npc.themeColor) this.roleTagEl.style.color = npc.themeColor;
            if (npc.accentColor) this.roleTagEl.style.background = npc.accentColor;
        }

        // Contextual dialogue resolution with priority and history cooldown
        const mgr = (typeof window !== 'undefined' && window.playerContextManager) ? window.playerContextManager : playerContextManager;
        const ctx = mgr ? mgr.extractContext(typeof window !== 'undefined' ? window.openWorld3D : null) : null;
        const lastInt = mgr ? mgr.getLastInteraction(npcId) : null;
        const resolved = resolveContextualDialogue(npcId, ctx, lastInt);

        const currentLang = (typeof window !== 'undefined' && window.TeleTermI18n && window.TeleTermI18n.currentLang) || 'en';
        let text = '';
        let choices = [];

        if (resolved && resolved.line) {
            const line = resolved.line;
            if (mgr) mgr.recordInteraction(npcId, line.id);
            text = (currentLang === 'vi' ? line.vi : line.en) || line.en || line.text;
            if (line.choices && Array.isArray(line.choices)) {
                choices = line.choices.map(c => ({
                    ...c,
                    label: (currentLang === 'vi' ? (c.labelVi || c.labelEn) : (c.labelEn || c.labelVi)) || c.label
                }));
            }
        } else if (npc.quotes && npc.quotes[0]) {
            const initial = npc.quotes[0];
            text = initial.text;
            choices = initial.choices || [];
        }

        this.renderDialogue(text, choices);
    }

    resolveDialogue(npcId, ctx = null) {
        const mgr = (typeof window !== 'undefined' && window.playerContextManager) ? window.playerContextManager : playerContextManager;
        const playerCtx = ctx || (mgr ? mgr.extractContext(typeof window !== 'undefined' ? window.openWorld3D : null) : null);
        const lastInt = mgr ? mgr.getLastInteraction(npcId) : null;
        return resolveContextualDialogue(npcId, playerCtx, lastInt);
    }

    renderDialogue(fullText, choices = []) {
        this.fullCurrentText = fullText;
        this.currentChoices = choices || [];
        if (this.textEl) this.textEl.innerHTML = '';
        if (this.choicesContainer) this.choicesContainer.innerHTML = '';
        if (this.btnNext) this.btnNext.style.display = 'none';

        if (this.typewriterTimer) clearInterval(this.typewriterTimer);
        this.isTyping = true;

        let charIndex = 0;
        this.typewriterTimer = setInterval(() => {
            if (charIndex < fullText.length) {
                if (this.textEl) this.textEl.textContent += fullText[charIndex];
                if (charIndex % 3 === 0) this.playChime('talk');
                charIndex++;
            } else {
                clearInterval(this.typewriterTimer);
                this.isTyping = false;
                this.renderChoices(this.currentChoices);
            }
        }, 22);
    }

    renderChoices(choices) {
        if (!this.choicesContainer) return;
        this.choicesContainer.innerHTML = '';

        if (!choices || choices.length === 0) {
            if (this.btnNext) {
                this.btnNext.style.display = 'inline-flex';
                const i18n = window.TeleTermI18n;
                const endText = i18n ? i18n.t('dialogue_btn_end') : 'End conversation';
                this.btnNext.textContent = `${endText} ⏎`;
            }
            return;
        }

        choices.forEach(ch => {
            const btn = document.createElement('button');
            btn.className = 'anime-choice-btn';
            btn.innerHTML = `<span class="choice-diamond">◆</span> <span>${ch.label}</span>`;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.playChime('select');
                this.handleChoice(ch);
            });
            this.choicesContainer.appendChild(btn);
        });
    }

    handleChoice(choice) {
        if (choice.action) {
            this.close();
            if (this.onSummonRequest) {
                this.onSummonRequest(choice.action);
            }
            return;
        }

        if (choice.next && this.currentNpc.branches && this.currentNpc.branches[choice.next]) {
            const branch = this.currentNpc.branches[choice.next];
            this.renderDialogue(branch.text, branch.choices);
        } else {
            this.close();
        }
    }

    handleNextOrSkip() {
        if (this.isTyping) {
            // Instant skip typewriter
            clearInterval(this.typewriterTimer);
            if (this.textEl) this.textEl.textContent = this.fullCurrentText;
            this.isTyping = false;
            this.renderChoices(this.currentChoices);
            return;
        }
        this.close();
    }

    close() {
        if (this.typewriterTimer) clearInterval(this.typewriterTimer);
        this.isTyping = false;
        if (this.modalEl) {
            this.modalEl.classList.add('hidden');
            this.modalEl.style.display = 'none';
        }
    }

    getRandomChit(npcId) {
        const npc = this.npcs[npcId];
        if (!npc || !npc.randomChits) return '';
        const idx = Math.floor(Math.random() * npc.randomChits.length);
        return npc.randomChits[idx];
    }
}
