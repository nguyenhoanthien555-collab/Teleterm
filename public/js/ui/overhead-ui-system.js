import * as THREE from '/vendor/three/build/three.module.js';

/**
 * TELETERM OVERHEAD UI & IDENTITY BADGE SYSTEM
 * Implements Master Specification v4:
 * - Section 83: 13 official ranks (Novice -> Legendary Developer)
 * - Section 85 & 88: Exact identity hierarchy:
 *     Line 1: [RANK] (Vector SVG Motif + Localized Rank Title)
 *     Line 2: [NAME] (Character Name)
 *     Line 3: [LEVEL] (Localized Level)
 *     Line 4: [ACTIVITY] (Localized Activity Status)
 * - Section 86: TeleTerm-native custom vector SVG rank motifs (No browser emoji or platform icons)
 * - Section 88: Distance-based level-of-detail (LOD) compression
 * - Section 89: 100% strict localization (zero mixed language residue)
 */

export const CLIENT_RANK_TIERS = [
    { minLevel: 100, id: 'legendary_developer', key: 'rank_legendary_developer', name: 'Legendary Developer', motif: 'radiant_crown', badgeColor: '#fbbf24' },
    { minLevel: 75,  id: 'distinguished_architect', key: 'rank_distinguished_architect', name: 'Distinguished Architect', motif: 'layered_prism', badgeColor: '#f43f5e' },
    { minLevel: 60,  id: 'master_builder', key: 'rank_master_builder', name: 'Master Builder', motif: 'celestial_cube', badgeColor: '#e11d48' },
    { minLevel: 50,  id: 'systems_architect', key: 'rank_systems_architect', name: 'Systems Architect', motif: 'multi_node', badgeColor: '#c084fc' },
    { minLevel: 40,  id: 'principal_engineer', key: 'rank_principal_engineer', name: 'Principal Engineer', motif: 'network_matrix', badgeColor: '#a855f7' },
    { minLevel: 35,  id: 'senior_architect', key: 'rank_senior_architect', name: 'Senior Architect', motif: 'layered_geometry', badgeColor: '#818cf8' },
    { minLevel: 30,  id: 'architect', key: 'rank_architect', name: 'Architect', motif: 'structural_pyramid', badgeColor: '#6366f1' },
    { minLevel: 25,  id: 'specialist', key: 'rank_specialist', name: 'Specialist', motif: 'focused_crystal', badgeColor: '#38bdf8' },
    { minLevel: 20,  id: 'engineer', key: 'rank_engineer', name: 'Engineer', motif: 'circuit_glyph', badgeColor: '#00f0ff' },
    { minLevel: 15,  id: 'developer', key: 'rank_developer', name: 'Developer', motif: 'structured_node', badgeColor: '#34d399' },
    { minLevel: 10,  id: 'coder', key: 'rank_coder', name: 'Coder', motif: 'terminal_prompt', badgeColor: '#10b981' },
    { minLevel: 5,   id: 'apprentice', key: 'rank_apprentice', name: 'Apprentice', motif: 'dual_chevron', badgeColor: '#a3e635' },
    { minLevel: 1,   id: 'novice', key: 'rank_novice', name: 'Novice', motif: 'seed_dot', badgeColor: '#94a3b8' }
];

export function getRankTierForLevel(level) {
    const lvl = Number(level) || 1;
    for (const tier of CLIENT_RANK_TIERS) {
        if (lvl >= tier.minLevel) return tier;
    }
    return CLIENT_RANK_TIERS[CLIENT_RANK_TIERS.length - 1];
}

/**
 * Returns clean, lightweight, vector SVG motif markup for a rank
 * Conforms to Master Spec v4 Section 86: Zero emojis, zero OS icons.
 */
export function getRankMotifSvg(motif, color = '#38bdf8', size = 13) {
    switch (motif) {
        case 'seed_dot':
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="3.5" fill="${color}" fill-opacity="0.95"/><circle cx="8" cy="8" r="6" stroke="${color}" stroke-width="1.2" stroke-opacity="0.6"/></svg>`;
        case 'dual_chevron':
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><path d="M4 11.5L8 7.5L12 11.5" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 7.5L8 3.5L12 7.5" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        case 'terminal_prompt':
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><path d="M4 4L8 8L4 12" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12H13" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/></svg>`;
        case 'structured_node':
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="4.5" cy="8" r="2.2" fill="${color}"/><circle cx="11.5" cy="4.5" r="2" fill="${color}"/><circle cx="11.5" cy="11.5" r="2" fill="${color}"/><path d="M4.5 8H8.5L11.5 4.5M8.5 8L11.5 11.5" stroke="${color}" stroke-width="1.3"/></svg>`;
        case 'circuit_glyph':
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><rect x="5" y="5" width="6" height="6" transform="rotate(45 8 8)" stroke="${color}" stroke-width="1.3" fill="${color}" fill-opacity="0.25"/><circle cx="8" cy="8" r="1.5" fill="${color}"/><path d="M8 2V4M8 12V14M2 8H4M12 8H14" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/></svg>`;
        case 'focused_crystal':
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><polygon points="8,1.5 13.5,8 8,14.5 2.5,8" stroke="${color}" stroke-width="1.3" fill="${color}" fill-opacity="0.25"/><line x1="8" y1="1.5" x2="8" y2="14.5" stroke="${color}" stroke-width="1.1"/><line x1="2.5" y1="8" x2="13.5" y2="8" stroke="${color}" stroke-width="1.1"/></svg>`;
        case 'structural_pyramid':
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><polygon points="8,2 14.5,13.5 1.5,13.5" stroke="${color}" stroke-width="1.3" fill="${color}" fill-opacity="0.2"/><line x1="4.8" y1="8" x2="11.2" y2="8" stroke="${color}" stroke-width="1.2"/><circle cx="8" cy="5.5" r="1.4" fill="${color}"/></svg>`;
        case 'layered_geometry':
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><rect x="3.5" y="3.5" width="9" height="9" stroke="${color}" stroke-width="1.2" fill="none"/><rect x="3.5" y="3.5" width="9" height="9" transform="rotate(45 8 8)" stroke="${color}" stroke-width="1.2" fill="${color}" fill-opacity="0.25"/></svg>`;
        case 'network_matrix':
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="3" r="1.8" fill="${color}"/><circle cx="3" cy="11.5" r="1.8" fill="${color}"/><circle cx="13" cy="11.5" r="1.8" fill="${color}"/><circle cx="8" cy="9" r="1.8" fill="${color}"/><path d="M8 3L8 9M3 11.5L8 9M13 11.5L8 9" stroke="${color}" stroke-width="1.3"/></svg>`;
        case 'multi_node':
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><rect x="2" y="2" width="4.5" height="4.5" rx="1" stroke="${color}" stroke-width="1.2" fill="${color}" fill-opacity="0.3"/><rect x="9.5" y="2" width="4.5" height="4.5" rx="1" stroke="${color}" stroke-width="1.2" fill="${color}" fill-opacity="0.3"/><rect x="2" y="9.5" width="4.5" height="4.5" rx="1" stroke="${color}" stroke-width="1.2" fill="${color}" fill-opacity="0.3"/><rect x="9.5" y="9.5" width="4.5" height="4.5" rx="1" stroke="${color}" stroke-width="1.2" fill="${color}" fill-opacity="0.8"/><path d="M6.5 4.25H9.5M4.25 6.5V9.5M9.5 11.75H6.5M11.75 6.5V9.5" stroke="${color}" stroke-width="1"/></svg>`;
        case 'celestial_cube':
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><path d="M8 2L13.5 5.2V10.8L8 14L2.5 10.8V5.2L8 2Z" stroke="${color}" stroke-width="1.3" fill="${color}" fill-opacity="0.18"/><path d="M8 2V14M8 8L13.5 5.2M8 8L2.5 5.2" stroke="${color}" stroke-width="1.2"/></svg>`;
        case 'layered_prism':
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><polygon points="8,1.5 14,6 8,14.5 2,6" stroke="${color}" stroke-width="1.3" fill="${color}" fill-opacity="0.25"/><polygon points="8,1.5 11,6 8,11 5,6" stroke="${color}" stroke-width="1" fill="${color}" fill-opacity="0.5"/><line x1="2" y1="6" x2="14" y2="6" stroke="${color}" stroke-width="1.2"/></svg>`;
        case 'radiant_crown':
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><path d="M2.5 12.5H13.5L14 5.5L10.5 8L8 3L5.5 8L2 5.5L2.5 12.5Z" stroke="${color}" stroke-width="1.3" fill="${color}" fill-opacity="0.3"/><circle cx="8" cy="9.5" r="1.5" fill="${color}"/><circle cx="8" cy="3" r="1.2" fill="${color}"/></svg>`;
        default:
            return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="4" fill="${color}"/></svg>`;
    }
}

export class OverheadUiSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.entries = new Map(); // id -> entry

        this.container = null;
        this.tempVec = new THREE.Vector3();
        this.camDir = new THREE.Vector3();
        this.toTarget = new THREE.Vector3();
        this.toDir = new THREE.Vector3();
        this.projected = new THREE.Vector3();

        // Smart Nametag Mode: 'focus', 'always', 'off'
        this.nametagMode = 'focus';
        try {
            const saved = localStorage.getItem('teleterm_graphics_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.nametags) this.nametagMode = parsed.nametags;
            }
        } catch (e) {}

        this.initContainer();

        // Reactive re-localization when language changes
        if (typeof window !== 'undefined') {
            window.addEventListener('teleterm-language-changed', () => {
                for (const [, entry] of this.entries.entries()) {
                    this.renderBadgeContent(entry);
                }
            });
        }
    }

    setNametagMode(mode) {
        this.nametagMode = mode || 'focus';
        if (this.nametagMode === 'off') {
            for (const [, entry] of this.entries.entries()) {
                if (entry.badgeEl) entry.badgeEl.style.display = 'none';
            }
        }
    }

    initContainer() {
        let el = document.getElementById('world-overhead-badges-container');
        if (!el) {
            el = document.createElement('div');
            el.id = 'world-overhead-badges-container';
            el.className = 'world-overhead-container';
            el.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
                z-index: 45;
                overflow: hidden;
            `;
            document.body.appendChild(el);
        }
        this.container = el;
    }

    registerBadge(id, config = {}) {
        if (this.entries.has(id)) {
            this.unregisterBadge(id);
        }

        const level = Number(config.level) || 1;
        const tier = config.rankTier || getRankTierForLevel(level);

        const badgeEl = document.createElement('div');
        badgeEl.id = `overhead-badge-${id}`;
        badgeEl.className = 'anime-overhead-badge';
        badgeEl.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            transform: translate(-50%, -100%);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 3px 8px;
            border-radius: 8px;
            max-width: 175px;
            background: rgba(15, 23, 42, 0.88);
            border: 1.2px solid ${tier.badgeColor};
            box-shadow: 0 3px 12px rgba(0, 0, 0, 0.45), 0 0 8px ${tier.badgeColor}35;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            color: #ffffff;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            text-align: center;
            white-space: nowrap;
            user-select: none;
            pointer-events: none;
            transition: opacity 0.2s ease, transform 0.05s ease-out;
            will-change: transform, left, top;
            gap: 1px;
        `;

        // Line 1: RANK (SVG Motif + Localized Rank Title)
        const rankEl = document.createElement('div');
        rankEl.className = 'badge-rank-row';
        rankEl.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 3px;
            font-size: 8.5px;
            font-weight: 800;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: ${tier.badgeColor};
            line-height: 1.1;
            max-width: 165px;
            overflow: hidden;
            text-overflow: ellipsis;
        `;

        // Line 2: NAME
        const nameEl = document.createElement('div');
        nameEl.className = 'badge-name-row';
        nameEl.style.cssText = `
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.02em;
            color: #ffffff;
            line-height: 1.15;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        `;

        // Line 3: LEVEL
        const levelEl = document.createElement('div');
        levelEl.className = 'badge-level-row';
        levelEl.style.cssText = `
            font-size: 9px;
            font-weight: 600;
            font-family: 'JetBrains Mono', monospace;
            color: #94a3b8;
            line-height: 1.05;
        `;

        // Line 4: ACTIVITY
        const activityEl = document.createElement('div');
        activityEl.className = 'badge-activity-row';
        activityEl.style.cssText = `
            font-size: 9px;
            font-family: 'JetBrains Mono', monospace;
            font-style: italic;
            color: ${config.statusColor || '#38bdf8'};
            line-height: 1.05;
            max-width: 165px;
            overflow: hidden;
            text-overflow: ellipsis;
        `;

        // Overhead Quest Marker: '!' (available) or '?' (claimable)
        const questMarkerEl = document.createElement('div');
        questMarkerEl.className = 'overhead-quest-marker';
        questMarkerEl.style.cssText = `
            display: none;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 16px;
            margin-bottom: 3px;
            border-radius: 4px;
            transform: rotate(45deg);
            box-shadow: 0 0 10px rgba(251, 191, 36, 0.7);
            font-weight: 900;
            font-size: 10px;
            transition: all 0.25s ease;
        `;
        const questMarkerSymbol = document.createElement('span');
        questMarkerSymbol.style.cssText = `
            transform: rotate(-45deg);
            display: inline-block;
            font-family: 'Plus Jakarta Sans', sans-serif;
            line-height: 1;
        `;
        questMarkerEl.appendChild(questMarkerSymbol);

        badgeEl.appendChild(questMarkerEl);
        badgeEl.appendChild(rankEl);
        badgeEl.appendChild(nameEl);
        badgeEl.appendChild(levelEl);
        badgeEl.appendChild(activityEl);
        this.container.appendChild(badgeEl);

        const entry = {
            id,
            name: config.name || id,
            level: level,
            tier: tier,
            roleTitle: config.roleTitle || null,
            roleTitleVi: config.roleTitleVi || null,
            statusText: config.statusText || '*vibing*',
            statusColor: config.statusColor || '#38bdf8',
            borderColor: config.borderColor || tier.badgeColor,
            glowColor: config.glowColor || 'rgba(56, 189, 248, 0.3)',
            rootObj: config.rootObj || null,
            headBone: config.headBone || null,
            heightOffset: config.heightOffset !== undefined ? config.heightOffset : 1.95,
            badgeEl,
            questMarkerEl,
            questMarkerSymbol,
            rankEl,
            nameEl,
            levelEl,
            activityEl,
            titleEl: nameEl,    // Backwards compatibility for external callers
            statusEl: activityEl, // Backwards compatibility for external callers
            minDist: config.minDist || 1.5,
            maxDist: config.maxDist || 45.0,
            isVisible: true
        };

        this.entries.set(id, entry);
        this.renderBadgeContent(entry);
    }

    renderBadgeContent(entry) {
        if (!entry) return;
        const lang = (window.TeleTermI18n && window.TeleTermI18n.currentLang) || 'en';
        const tier = getRankTierForLevel(entry.level);
        entry.tier = tier;

        // Line 1: RANK (Motif SVG + Localized Rank Title or Custom Role Title)
        const rankTitle = (window.TeleTermI18n ? window.TeleTermI18n.t(tier.key) : null) || tier.name;
        let roleDisplay = (lang === 'vi' && entry.roleTitleVi)
            ? entry.roleTitleVi
            : (entry.roleTitle || rankTitle);
        // Role string compression: enforce <= 18 chars presentation budget per Argon spec
        if (roleDisplay && roleDisplay.length > 18) {
            roleDisplay = roleDisplay.slice(0, 17) + '…';
        }
        const iconSvg = getRankMotifSvg(tier.motif, tier.badgeColor, 10);
        entry.rankEl.innerHTML = `${iconSvg}<span>${roleDisplay}</span>`;
        entry.rankEl.style.color = tier.badgeColor;

        // Line 2: NAME
        const isSpeaking = Boolean(entry.isSpeaking);
        const waveSvg = `<span class="overhead-voice-indicator" style="display:${isSpeaking ? 'inline-flex' : 'none'}; vertical-align: middle; margin-right: 4px;"><svg class="voice-wave-svg" width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M3 6V10M8 3V13M13 6V10" stroke="#10b981" stroke-width="2.2" stroke-linecap="round"/></svg></span>`;
        entry.nameEl.innerHTML = `${waveSvg}<span>${entry.name}</span>`;

        // Line 3: LEVEL
        const levelPrefix = lang === 'vi' ? 'Cấp ' : 'Lv. ';
        entry.levelEl.textContent = `${levelPrefix}${entry.level}`;

        // Line 4: ACTIVITY (Localize common activities or display custom string)
        let act = entry.statusText || '*vibing*';
        if (window.TeleTermI18n) {
            if (act.startsWith('act_')) {
                act = window.TeleTermI18n.t(act);
            } else if (act === '*vibing*') {
                act = window.TeleTermI18n.t('act_vibing');
            } else if (act === '*coding*') {
                act = window.TeleTermI18n.t('act_coding');
            } else if (act === '*thinking*') {
                act = window.TeleTermI18n.t('act_thinking');
            } else if (act.startsWith('*') && act.endsWith('*')) {
                // If Vietnamese mode, translate standard activities
                if (lang === 'vi') {
                    if (act.includes('coding')) act = '*đang lập trình...*';
                    else if (act.includes('thinking')) act = '*đang suy ngẫm...*';
                    else if (act.includes('walking')) act = '*đang đi dạo...*';
                    else if (act.includes('reading')) act = '*đang đọc tài liệu...*';
                    else if (act.includes('debugging')) act = '*đang gỡ lỗi...*';
                    else if (act.includes('vibing')) act = '*thư giãn...*';
                }
            }
        }
        entry.activityEl.textContent = act;

        // Update styling
        entry.badgeEl.style.borderColor = tier.badgeColor;
        entry.badgeEl.style.boxShadow = `0 4px 16px rgba(0, 0, 0, 0.45), 0 0 12px ${tier.badgeColor}40`;
    }

    updateBadgeContent(id, text, options = {}) {
        const entry = this.entries.get(id);
        if (!entry) return;

        if (text !== undefined) {
            entry.statusText = text;
        }
        if (options.name) {
            entry.name = options.name;
        }
        if (options.level !== undefined) {
            entry.level = Number(options.level) || 1;
        }
        if (options.statusColor) {
            entry.statusColor = options.statusColor;
            entry.activityEl.style.color = options.statusColor;
        }
        if (options.borderColor) {
            entry.borderColor = options.borderColor;
        }

        this.renderBadgeContent(entry);
    }

    updateBadgeLevel(id, level) {
        const entry = this.entries.get(id);
        if (!entry) return;
        entry.level = Number(level) || 1;
        this.renderBadgeContent(entry);
    }

    /**
     * Set overhead Quest Marker: 'available' (!), 'claimable' (?), or null (none)
     */
    setQuestMarker(id, markerType = null) {
        const entry = this.entries.get(id);
        if (!entry || !entry.questMarkerEl || !entry.questMarkerSymbol) return;

        if (markerType === 'available') {
            entry.questMarkerEl.style.display = 'flex';
            entry.questMarkerEl.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            entry.questMarkerEl.style.border = '2px solid #fef08a';
            entry.questMarkerEl.style.boxShadow = '0 0 14px rgba(245, 158, 11, 0.9)';
            entry.questMarkerSymbol.textContent = '!';
            entry.questMarkerSymbol.style.color = '#ffffff';
        } else if (markerType === 'claimable') {
            entry.questMarkerEl.style.display = 'flex';
            entry.questMarkerEl.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            entry.questMarkerEl.style.border = '2px solid #a7f3d0';
            entry.questMarkerEl.style.boxShadow = '0 0 14px rgba(16, 185, 129, 0.9)';
            entry.questMarkerSymbol.textContent = '?';
            entry.questMarkerSymbol.style.color = '#ffffff';
        } else {
            entry.questMarkerEl.style.display = 'none';
        }
    }

    /**
     * Set overhead Voice Wave Speaking Indicator (green animated audio wave)
     */
    setSpeaking(id, isSpeaking) {
        const entry = this.entries.get(id);
        if (!entry) return;
        const speaking = Boolean(isSpeaking);
        if (entry.isSpeaking !== speaking) {
            entry.isSpeaking = speaking;
            const ind = entry.nameEl?.querySelector('.overhead-voice-indicator');
            if (ind) {
                ind.style.display = speaking ? 'inline-flex' : 'none';
            }
        }
    }

    setHeadBone(id, headBone) {
        const entry = this.entries.get(id);
        if (entry) {
            entry.headBone = headBone;
        }
    }

    getEntry(id) {
        return this.entries.get(id) || null;
    }

    getAnchorWorldPosition(id, outVec = new THREE.Vector3()) {
        const entry = this.entries.get(id);
        if (!entry) return null;
        if (entry.headBone) {
            entry.headBone.getWorldPosition(outVec);
            outVec.y += 0.38;
            return outVec;
        } else if (entry.rootObj) {
            entry.rootObj.getWorldPosition(outVec);
            outVec.y += (entry.heightOffset !== undefined ? entry.heightOffset : 1.95);
            return outVec;
        }
        return null;
    }

    unregisterBadge(id) {
        const entry = this.entries.get(id);
        if (entry) {
            if (entry.badgeEl && entry.badgeEl.parentNode) {
                entry.badgeEl.parentNode.removeChild(entry.badgeEl);
            }
            this.entries.delete(id);
        }
    }

    setRoleTitle(id, roleTitle, roleTitleVi = null) {
        const entry = this.entries.get(id);
        if (entry) {
            entry.roleTitle = roleTitle;
            entry.roleTitleVi = roleTitleVi;
            this.renderBadgeContent(entry);
        }
    }

    update() {
        if (!this.camera) return;

        this.camera.getWorldDirection(this.camDir);
        const w = window.innerWidth;
        const h = window.innerHeight;

        const minX = 75;
        const maxX = w - 75;
        const minY = 56;
        const maxY = h - 65;

        const isModalActive = document.body.classList.contains('mode-focus') ||
            !document.body.classList.contains('mode-explore') ||
            (document.getElementById('deck-terminal-screen') && getComputedStyle(document.getElementById('deck-terminal-screen')).visibility === 'visible' && getComputedStyle(document.getElementById('deck-terminal-screen')).opacity !== '0' && !document.body.classList.contains('terminal-hidden')) ||
            document.querySelector('.anime-dialogue-overlay:not(.hidden)') ||
            document.querySelector('#modal-customizer:not(.hidden)');

        if (isModalActive) {
            this.container.style.display = 'none';
            return;
        } else {
            this.container.style.display = 'block';
        }

        if (this.nametagMode === 'off') {
            for (const [, entry] of this.entries.entries()) {
                if (entry.badgeEl) entry.badgeEl.style.display = 'none';
            }
            return;
        }

        const mmoChatEl = document.getElementById('mmo-chat-container');
        const isMmoChatOpen = mmoChatEl && !mmoChatEl.classList.contains('chat-closed') && getComputedStyle(mmoChatEl).display !== 'none';
        const chatRect = isMmoChatOpen ? mmoChatEl.getBoundingClientRect() : null;

        const candidates = [];

        for (const [id, entry] of this.entries.entries()) {
            if (!entry.rootObj || !entry.badgeEl) continue;

            const hasSpeechBubble = window.mmoChat && window.mmoChat.speechBubbles && (
                window.mmoChat.speechBubbles.has(id) ||
                (id === 'player' && (window.mmoChat.speechBubbles.has('player') || (window.multiplayerClient && window.mmoChat.speechBubbles.has(window.multiplayerClient.myUserId))))
            );

            if (hasSpeechBubble) {
                entry.badgeEl.style.display = 'none';
                continue;
            }

            if (entry.headBone) {
                entry.headBone.getWorldPosition(this.tempVec);
                this.tempVec.y += 0.35;
            } else {
                entry.rootObj.getWorldPosition(this.tempVec);
                this.tempVec.y += entry.heightOffset;
            }

            const dist = this.camera.position.distanceTo(this.tempVec);

            if (dist > entry.maxDist) {
                entry.badgeEl.style.display = 'none';
                continue;
            }

            this.toTarget.copy(this.tempVec).sub(this.camera.position);
            this.toDir.copy(this.toTarget).normalize();
            const dot = this.camDir.dot(this.toDir);

            if (dot <= 0.05) {
                entry.badgeEl.style.display = 'none';
                continue;
            }

            this.projected.copy(this.tempVec).project(this.camera);

            if (this.projected.z > 1.0 || this.projected.z < -1.0 || Math.abs(this.projected.x) > 1.05 || Math.abs(this.projected.y) > 1.1) {
                entry.badgeEl.style.display = 'none';
                continue;
            }

            let focusAlpha = 1.0;
            if (this.nametagMode === 'focus') {
                const isPlayerSelf = (id === 'player');
                const isCloseProximity = dist < 6.0;
                const isFacingTarget = dot > 0.65;

                if (!isFacingTarget && !isCloseProximity && !isPlayerSelf) {
                    entry.badgeEl.style.display = 'none';
                    continue;
                }

                const coneFactor = isFacingTarget ? THREE.MathUtils.clamp((dot - 0.65) / 0.18, 0.0, 1.0) : 0.0;
                const proxFactor = isCloseProximity ? THREE.MathUtils.clamp((6.0 - dist) / 2.5, 0.0, 1.0) : 0.0;
                focusAlpha = Math.max(coneFactor, proxFactor);
                if (isPlayerSelf) focusAlpha = Math.max(focusAlpha, 0.85);

                if (dist > 22.0) {
                    focusAlpha *= THREE.MathUtils.clamp(1.0 - (dist - 22.0) / 8.0, 0.0, 1.0);
                }

                if (focusAlpha <= 0.03) {
                    entry.badgeEl.style.display = 'none';
                    continue;
                }
            }

            const rawScreenX = (this.projected.x * 0.5 + 0.5) * w;
            const rawScreenY = (-(this.projected.y * 0.5) + 0.5) * h;

            const screenX = Math.max(minX, Math.min(maxX, rawScreenX));
            let screenY = Math.max(minY, Math.min(maxY, rawScreenY));

            if (chatRect && screenX >= chatRect.left - 10 && screenX <= chatRect.right + 25 && screenY >= chatRect.top - 10 && screenY <= chatRect.bottom + 25) {
                entry.badgeEl.style.display = 'none';
                continue;
            }

            // Argon 3-Tier Semantic Distance LOD State Machine:
            // Tier 1 (Proximity < 8.0m): Full compact badge [RANK], [NAME], [LEVEL], [ACTIVITY]
            // Tier 2 (Mid-distance 8.0m - 18.0m): Compact badge [NAME] + [LEVEL] only (hide role & activity)
            // Tier 3 (Far distance >= 18.0m): Fade out completely / hide
            if (dist > 18.0) {
                entry.badgeEl.style.display = 'none';
                continue;
            } else if (dist > 8.0) {
                entry.activityEl.style.display = 'none';
                entry.rankEl.style.display = 'none';
                entry.levelEl.style.display = 'block';
                entry.nameEl.style.display = 'block';
            } else {
                entry.activityEl.style.display = 'block';
                entry.rankEl.style.display = 'flex';
                entry.levelEl.style.display = 'block';
                entry.nameEl.style.display = 'block';
            }

            // Inverse-distance scale formulation per Argon: s(d) = clamp(d_ref / d, 0.48, 0.72)
            const scale = THREE.MathUtils.clamp(6.5 / Math.max(3.2, dist), 0.48, 0.72);

            let opacity = focusAlpha;
            if (dist > 14.0) {
                opacity *= THREE.MathUtils.clamp(1.0 - (dist - 14.0) / 4.0, 0.0, 1.0);
            }
            if (opacity <= 0.02) {
                entry.badgeEl.style.display = 'none';
                continue;
            }

            candidates.push({ entry, screenX, screenY, scale, opacity, dist });
        }

        candidates.sort((a, b) => a.dist - b.dist);

        for (let pass = 0; pass < 3; pass++) {
            let changed = false;
            for (let i = 0; i < candidates.length; i++) {
                for (let j = 0; j < i; j++) {
                    const ci = candidates[i];
                    const cj = candidates[j];
                    const minSepX = (ci.dist > 8.0 ? 100 : 160) * Math.min(ci.scale, cj.scale);
                    const dx = Math.abs(ci.screenX - cj.screenX);
                    const dy = Math.abs(ci.screenY - cj.screenY);
                    if (dx < minSepX && dy < 38) {
                        ci.screenY = cj.screenY - 42;
                        changed = true;
                    }
                }
            }
            if (!changed) break;
        }

        // Detect if camera is in close-up portrait proximity to the player avatar (< 3.2m)
        const playerEntry = this.entries.get('player');
        const playerCandidate = playerEntry ? candidates.find(c => c.entry === playerEntry) : null;

        let distToPlayer = Infinity;
        if (playerEntry && playerEntry.rootObj) {
            distToPlayer = this.camera.position.distanceTo(playerEntry.rootObj.position);
        } else if (window.openWorld3D && window.openWorld3D.player) {
            distToPlayer = this.camera.position.distanceTo(window.openWorld3D.player.position);
        } else if (playerCandidate) {
            distToPlayer = playerCandidate.dist;
        }

        const isCloseUpPlayer = distToPlayer < 3.2;

        for (const c of candidates) {
            // Close-up occlusion: if camera is in portrait shot of player,
            // occlude distant background NPC badges whose 2D ray falls over the player
            if (isCloseUpPlayer && c.entry !== playerEntry) {
                if (c.dist > 4.5) {
                    const refX = playerCandidate ? playerCandidate.screenX : (w * 0.5);
                    const dx = Math.abs(c.screenX - refX);
                    if (dx < 320) {
                        c.entry.badgeEl.style.display = 'none';
                        continue;
                    }
                }
            }

            c.entry.badgeEl.style.display = 'flex';
            c.entry.badgeEl.style.left = `${c.screenX}px`;
            c.entry.badgeEl.style.top = `${c.screenY}px`;
            c.entry.badgeEl.style.transform = `translate(-50%, -100%) scale(${c.scale.toFixed(3)})`;
            c.entry.badgeEl.style.opacity = c.opacity.toFixed(2);
            // Dynamic depth sorting: closer entities strictly render in front
            c.entry.badgeEl.style.zIndex = Math.max(1, Math.round(1000 - c.dist * 10));
        }
    }

    destroy() {
        for (const [id] of this.entries.entries()) {
            this.unregisterBadge(id);
        }
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
