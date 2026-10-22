/**
 * Developer Titles & Milestone Achievements
 * TeleTerm Master Architecture v2
 */

const RANK_TIERS = [
    { minLevel: 100, id: 'legendary_developer', name: 'Legendary Developer', vi: 'Huyền Thoại Phát Triển', motif: 'radiant_crown', badgeColor: '#fbbf24' },
    { minLevel: 75,  id: 'distinguished_architect', name: 'Distinguished Architect', vi: 'Kiến Trúc Sư Xuất Chúng', motif: 'layered_prism', badgeColor: '#f43f5e' },
    { minLevel: 60,  id: 'master_builder', name: 'Master Builder', vi: 'Bậc Thầy Kiến Thiết', motif: 'celestial_cube', badgeColor: '#e11d48' },
    { minLevel: 50,  id: 'systems_architect', name: 'Systems Architect', vi: 'Kiến Trúc Sư Hệ Thống', motif: 'multi_node', badgeColor: '#c084fc' },
    { minLevel: 40,  id: 'principal_engineer', name: 'Principal Engineer', vi: 'Kỹ Sư Trưởng', motif: 'network_matrix', badgeColor: '#a855f7' },
    { minLevel: 35,  id: 'senior_architect', name: 'Senior Architect', vi: 'Kiến Trúc Sư Cao Cấp', motif: 'layered_geometry', badgeColor: '#818cf8' },
    { minLevel: 30,  id: 'architect', name: 'Architect', vi: 'Kiến Trúc Sư', motif: 'structural_pyramid', badgeColor: '#6366f1' },
    { minLevel: 25,  id: 'specialist', name: 'Specialist', vi: 'Chuyên Gia', motif: 'focused_crystal', badgeColor: '#38bdf8' },
    { minLevel: 20,  id: 'engineer', name: 'Engineer', vi: 'Kỹ Sư', motif: 'circuit_glyph', badgeColor: '#00f0ff' },
    { minLevel: 15,  id: 'developer', name: 'Developer', vi: 'Kỹ Sư Phát Triển', motif: 'structured_node', badgeColor: '#34d399' },
    { minLevel: 10,  id: 'coder', name: 'Coder', vi: 'Lập Trình Viên', motif: 'terminal_prompt', badgeColor: '#10b981' },
    { minLevel: 5,   id: 'apprentice', name: 'Apprentice', vi: 'Học Việc', motif: 'dual_chevron', badgeColor: '#a3e635' },
    { minLevel: 1,   id: 'novice', name: 'Novice', vi: 'Tập Sự', motif: 'seed_dot', badgeColor: '#94a3b8' }
];

const ACHIEVEMENTS = {
    'first_steps': { id: 'first_steps', name: 'First Steps', vi: 'Hành Trình Khởi Đầu', desc: 'Join TeleTerm open world' },
    'first_build': { id: 'first_build', name: 'First Build', vi: 'Build Đầu Tiên', desc: 'Complete first build successfully' },
    'first_test': { id: 'first_test', name: 'Green Tests', vi: 'Xanh Lá Kiểm Thử', desc: 'Pass tests in terminal' },
    'first_commit': { id: 'first_commit', name: 'Git Commit', vi: 'Lưu Lại Dấu Ấn', desc: 'Create a git commit' },
    'ai_companion': { id: 'ai_companion', name: 'AI Pair Programmer', vi: 'Cộng Sự Trí Tuệ Nhân Tạo', desc: 'Solve problem with Codex or Antigravity' },
    'focus_master': { id: 'focus_master', name: 'Deep Focus', vi: 'Trạng Thái Dòng Chảy', desc: 'Focus 30 minutes in world' },
    'night_coder': { id: 'night_coder', name: 'Midnight Coder', vi: 'Lập Trình Viên Bóng Đêm', desc: 'Code late at night' }
};

function getTitleForLevel(level) {
    for (const tier of RANK_TIERS) {
        if (level >= tier.minLevel) {
            return tier.name;
        }
    }
    return 'Novice';
}

function getTitleDetails(level, lang = 'en') {
    for (const tier of RANK_TIERS) {
        if (level >= tier.minLevel) {
            return {
                ...tier,
                displayName: lang === 'vi' ? tier.vi : tier.name
            };
        }
    }
    const lowest = RANK_TIERS[RANK_TIERS.length - 1];
    return {
        ...lowest,
        displayName: lang === 'vi' ? lowest.vi : lowest.name
    };
}

module.exports = {
    RANK_TIERS,
    TITLE_TIERS: RANK_TIERS,
    ACHIEVEMENTS,
    getTitleForLevel,
    getTitleDetails
};
