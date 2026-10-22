/**
 * TELETERM 3D — MASTER QUEST & BOUNTY DEFINITIONS
 * Authoritative quest registry for developer onboarding and world exploration.
 */

const QUEST_DEFINITIONS = [
    {
        id: 'Q101',
        category: 'story',
        title: {
            en: 'Welcome to Developer Metaverse',
            vi: 'Chào mừng tới Developer Metaverse'
        },
        description: {
            en: 'Speak with Lumina at the Developer Hub and inspect your terminal version.',
            vi: 'Gặp gỡ Lumina tại Developer Hub và kiểm tra phiên bản terminal của bạn.'
        },
        giverNpc: 'Lumina',
        steps: [
            {
                id: 'step_talk_lumina',
                text: {
                    en: 'Talk to Lumina at the Developer Hub',
                    vi: 'Nói chuyện với Lumina tại Developer Hub'
                },
                type: 'talk_npc',
                target: 'Lumina',
                targetPos: { x: 0, y: 0, z: 0 }
            },
            {
                id: 'step_run_version',
                text: {
                    en: 'Run a command in Terminal (or Focus Mode)',
                    vi: 'Thực thi một lệnh trong Terminal (hoặc Focus Mode)'
                },
                type: 'terminal_command',
                pattern: '.*'
            }
        ],
        rewards: {
            xp: 60,
            title: 'Code Pilgrim',
            titleVi: 'Lữ Khách Mã Nguồn',
            unlockEmote: 'wave',
            unlockEmoteName: 'Vẫy chào (Wave)'
        },
        autoAccept: true
    },
    {
        id: 'Q105',
        category: 'story',
        title: {
            en: 'AI Copilot Collaboration',
            vi: 'Kỷ Nguyên Đồng Hành Cùng AI'
        },
        description: {
            en: 'Open Codex AI or Antigravity Assistant, and send a prompt to collaborate with AI.',
            vi: 'Mở bảng điều khiển Codex AI hoặc Antigravity và gửi một prompt trao đổi cùng AI.'
        },
        giverNpc: 'Lumina',
        requires: ['Q101'],
        steps: [
            {
                id: 'step_open_ai',
                text: {
                    en: 'Open Codex AI or Antigravity Assistant tab',
                    vi: 'Mở tab Codex AI hoặc Antigravity Assistant'
                },
                type: 'tool_active',
                tool: ['codex', 'antigravity', 'agy']
            },
            {
                id: 'step_send_ai_prompt',
                text: {
                    en: 'Send a prompt or message to AI Copilot',
                    vi: 'Gửi một câu hỏi hoặc prompt tới AI Copilot'
                },
                type: 'ai_prompt'
            }
        ],
        rewards: {
            xp: 120,
            title: 'AI Companion',
            titleVi: 'Cộng Sự Trí Tuệ Nhân Tạo',
            unlockEmote: 'code',
            unlockEmoteName: 'Gõ Laptop (Code)'
        },
        autoAccept: true
    },
    {
        id: 'Q106',
        category: 'story',
        title: {
            en: 'Universal Workspace & IDE',
            vi: 'Không Gian Phát Triển Toàn Năng'
        },
        description: {
            en: 'Open the Universal IDE Code Editor tab and inspect project files or run a CLI status command.',
            vi: 'Mở tab Trình Soạn Thảo IDE và kiểm tra trạng thái dự án bằng lệnh CLI.'
        },
        giverNpc: 'NoticeBoard',
        requires: ['Q101'],
        steps: [
            {
                id: 'step_open_ide',
                text: {
                    en: 'Open Universal IDE Code Editor tab',
                    vi: 'Mở tab Trình soạn thảo Universal IDE'
                },
                type: 'tool_active',
                tool: ['universal', 'ide', 'editor']
            },
            {
                id: 'step_run_cli_check',
                text: {
                    en: 'Run a CLI status or inspection command (e.g. git status, ls, dir)',
                    vi: 'Thực thi lệnh kiểm tra CLI (ví dụ git status, ls, dir)'
                },
                type: 'terminal_command',
                pattern: '.*'
            }
        ],
        rewards: {
            xp: 100,
            title: 'IDE Architect',
            titleVi: 'Kiến Trúc Sư IDE'
        },
        autoAccept: true
    },
    {
        id: 'Q102',
        category: 'story',
        title: {
            en: 'The Quality Assurance Trial',
            vi: 'Kiểm định Mã nguồn'
        },
        description: {
            en: 'Run system tests in ADE Studio or verify engine, then report back to Sakura.',
            vi: 'Chạy kiểm thử hệ thống trong ADE Studio hoặc Verify Engine, sau đó báo cáo với Sakura.'
        },
        giverNpc: 'Sakura',
        requires: ['Q101'],
        steps: [
            {
                id: 'step_run_test',
                text: {
                    en: 'Trigger a Test Verification in ADE Studio (or run npm test)',
                    vi: 'Kích hoạt một lượt Verify Test trong ADE Studio (hoặc chạy npm test)'
                },
                type: 'verification_run'
            },
            {
                id: 'step_report_sakura',
                text: {
                    en: 'Report verification findings to Sakura',
                    vi: 'Báo cáo kết quả kiểm định cho Sakura'
                },
                type: 'talk_npc',
                target: 'Sakura',
                targetPos: { x: 5, y: 0, z: 12 }
            }
        ],
        rewards: {
            xp: 100,
            title: 'Test Knight',
            titleVi: 'Hiệp Sĩ Kiểm Thử',
            unlockEmote: 'bow',
            unlockEmoteName: 'Cúi chào (Bow)',
            unlockLofiTrack: {
                id: 'track_sakura_blossom',
                title: 'Sakura Blossom Lo-Fi',
                artist: 'TeleTerm Soundscapes'
            }
        },
        autoAccept: true
    },
    {
        id: 'Q103',
        category: 'story',
        title: {
            en: 'The Zen of Tea Ceremony',
            vi: 'Trà Đạo Tĩnh Tâm'
        },
        description: {
            en: 'Buy a green tea can from the vending machine, sit in Seiza at the Tatami pavilion, and enjoy it.',
            vi: 'Mua một lon trà xanh từ máy bán hàng, ngồi quỳ Seiza tại đình Tatami và thưởng trà.'
        },
        giverNpc: 'Kaede',
        requires: ['Q101'],
        steps: [
            {
                id: 'step_vending_tea',
                text: {
                    en: 'Buy or hold a Green Tea can from the Vending Machine',
                    vi: 'Mua hoặc cầm trên tay lon Trà Xanh từ Máy bán hàng'
                },
                type: 'hold_item',
                itemId: 'drink_green_tea'
            },
            {
                id: 'step_sit_tatami',
                text: {
                    en: 'Sit in Seiza meditation at the Tatami Pavilion',
                    vi: 'Ngồi quỳ Seiza tĩnh tâm tại Đình Trà Tatami'
                },
                type: 'sit_anchor',
                category: 'tatami',
                targetPos: { x: -35, y: 0.5, z: 18 }
            },
            {
                id: 'step_drink_tea',
                text: {
                    en: 'Drink your green tea (Hold Right Mouse Button)',
                    vi: 'Thưởng thức trà xanh (Giữ chuột phải để uống)'
                },
                type: 'drink_item',
                itemId: 'drink_green_tea'
            }
        ],
        rewards: {
            xp: 120,
            title: 'Zen Developer',
            titleVi: 'Thiền Sư Lập Trình',
            unlockEmote: 'meditate',
            unlockEmoteName: 'Ngồi thiền (Meditate)',
            unlockLofiTrack: {
                id: 'track_tatami_rain',
                title: 'Tatami Garden Rain Lo-Fi',
                artist: 'Zen Cyber Space'
            }
        }
    },
    {
        id: 'Q104',
        category: 'story',
        title: {
            en: 'Alpine Summit Pilgrimage',
            vi: 'Hành Hương Núi Tuyết'
        },
        description: {
            en: 'Cross the river bridge, hike past the rice fields to the Mountain Overlook bench.',
            vi: 'Băng qua cầu gỗ, vượt qua cánh đồng lúa và bước lên băng ghế vọng cảnh ngắm Núi Tuyết.'
        },
        giverNpc: 'Ren',
        requires: ['Q102'],
        steps: [
            {
                id: 'step_cross_bridge',
                text: {
                    en: 'Cross the Wooden River Bridge',
                    vi: 'Băng qua Cây Cầu Gỗ bắc qua sông'
                },
                type: 'reach_region',
                targetPos: { x: 0, y: 0, z: -40 },
                radius: 12
            },
            {
                id: 'step_hilltop_bench',
                text: {
                    en: 'Sit at the Hilltop Overlook bench facing the snow peaks',
                    vi: 'Ngồi tại Băng ghế ngắm đỉnh Núi Tuyết trên đồi cao'
                },
                type: 'sit_anchor',
                anchorId: 'bench-hilltop',
                targetPos: { x: 22, y: 4.5, z: -85 }
            }
        ],
        rewards: {
            xp: 150,
            title: 'Alpine Pathfinder',
            titleVi: 'Nhà Thám Hiểm Sơn Cước',
            unlockEmote: 'kanpai',
            unlockEmoteName: 'Cụng ly (Kanpai)',
            unlockLofiTrack: {
                id: 'track_alpine_chill',
                title: 'Alpine Peak Chillhop',
                artist: 'High Altitude Beats'
            }
        }
    },
    // Hub Notice Board Developer Bounties
    {
        id: 'B201',
        category: 'bounty',
        title: {
            en: 'Bounty: Zero Defect Deploy',
            vi: 'Treo Thưởng: Bản Phát Hành Hoàn Hảo'
        },
        description: {
            en: 'Execute 5 terminal commands without breaking runtime focus.',
            vi: 'Thực thi 5 lệnh terminal liên tiếp trong phiên làm việc.'
        },
        giverNpc: 'NoticeBoard',
        steps: [
            {
                id: 'step_five_commands',
                text: {
                    en: 'Execute 5 terminal commands (0/5)',
                    vi: 'Thực thi 5 lệnh terminal (0/5)'
                },
                type: 'command_counter',
                targetCount: 5
            }
        ],
        rewards: {
            xp: 80,
            title: 'Terminal Commando',
            titleVi: 'Chiến Binh Dòng Lệnh',
            unlockEmote: 'code',
            unlockEmoteName: 'Gõ Laptop (Code)'
        },
        autoAccept: true
    },
    {
        id: 'B203',
        category: 'bounty',
        title: {
            en: 'Bounty: CLI Power User',
            vi: 'Treo Thưởng: Cao Thủ Dòng Lệnh'
        },
        description: {
            en: 'Execute 10 CLI or developer commands across Terminal and tools.',
            vi: 'Thực thi 10 lệnh CLI hoặc công cụ lập trình trong phiên làm việc.'
        },
        giverNpc: 'NoticeBoard',
        steps: [
            {
                id: 'step_ten_commands',
                text: {
                    en: 'Execute 10 terminal/CLI commands (0/10)',
                    vi: 'Thực thi 10 lệnh dòng lệnh/CLI (0/10)'
                },
                type: 'command_counter',
                targetCount: 10
            }
        ],
        rewards: {
            xp: 150,
            title: 'CLI Master',
            titleVi: 'Bậc Thầy Dòng Lệnh'
        },
        autoAccept: true
    },
    {
        id: 'B202',
        category: 'bounty',
        title: {
            en: 'Bounty: Coastal Pier Sunset Trek',
            vi: 'Treo Thưởng: Tuần Tra Bến Tàu Hoàng Hôn'
        },
        description: {
            en: 'Walk to the end of the Coastal Boardwalk Pier and ring the village bicycle bell on the way.',
            vi: 'Đi dạo ra tận cùng Bến Tàu Bờ Biển và rung chuông xe đạp cổ trên đường đi.'
        },
        giverNpc: 'NoticeBoard',
        steps: [
            {
                id: 'step_ring_bike',
                text: {
                    en: 'Ring the Vintage Bicycle bell in the Village Square',
                    vi: 'Rung chuông Xe Đạp Cổ tại Quảng trường Làng'
                },
                type: 'interact_object',
                target: 'vintage-bicycle',
                targetPos: { x: -8, y: 0, z: 24 }
            },
            {
                id: 'step_reach_pier',
                text: {
                    en: 'Reach the end of the Coastal Pier walkway',
                    vi: 'Đi đến cuối Sàn Gỗ Bến Tàu Bờ Biển'
                },
                type: 'reach_region',
                targetPos: { x: 65, y: 0.8, z: -110 },
                radius: 14
            }
        ],
        rewards: {
            xp: 120,
            title: 'Ocean Vagabond',
            titleVi: 'Kẻ Lãng Du Bờ Biển',
            unlockEmote: 'cheer',
            unlockEmoteName: 'Cổ vũ (Cheer)',
            unlockLofiTrack: {
                id: 'track_pier_sunset',
                title: 'Coastal Sunset Lo-Fi',
                artist: 'Harbor Breeze Studio'
            }
        },
        autoAccept: true
    },
    // --- 4 TIME-OF-DAY CYBERNETIC QUESTS (DAWN, MIDDAY, TWILIGHT, NIGHT) ---
    {
        id: 'Q_TOD_DAWN',
        category: 'time_of_day',
        phase: 'dawn',
        title: {
            en: 'Morning Bug Hunt with Lumina',
            vi: 'Săn Bug Bình Minh Cùng Lumina'
        },
        description: {
            en: 'Catch Lumina at dawn in the Developer Hub and run diagnostic tests.',
            vi: 'Gặp gỡ Lumina lúc bình minh tại Developer Hub và thực hiện kiểm thử chẩn đoán.'
        },
        giverNpc: 'Lumina',
        steps: [
            {
                id: 'step_dawn_talk_lumina',
                text: { en: 'Speak with Lumina at dawn', vi: 'Nói chuyện với Lumina lúc bình minh' },
                type: 'talk_npc',
                target: 'Lumina',
                targetPos: { x: 0, y: 0, z: 0 }
            }
        ],
        rewards: {
            xp: 150,
            title: 'Dawn Auditor',
            titleVi: 'Kiểm Thử Viên Bình Minh',
            unlockEmote: 'VibeDance'
        },
        autoAccept: false
    },
    {
        id: 'Q_TOD_NOON',
        category: 'time_of_day',
        phase: 'midday',
        title: {
            en: 'High Noon Architecture Sync with Sakura',
            vi: 'Đồng Bộ Kiến Trúc Buổi Trưa Cùng Sakura'
        },
        description: {
            en: 'Sync architecture modules with Sakura near the Zen Pond under the midday sun.',
            vi: 'Đồng bộ kiến trúc mô-đun với Sakura cạnh Hồ Zen dưới ánh nắng ban trưa.'
        },
        giverNpc: 'Sakura',
        steps: [
            {
                id: 'step_noon_talk_sakura',
                text: { en: 'Sync modules with Sakura at Zen Pond', vi: 'Gặp gỡ Sakura tại Hồ Zen lúc giữa trưa' },
                type: 'talk_npc',
                target: 'Sakura',
                targetPos: { x: -18, y: 0, z: -25 }
            }
        ],
        rewards: {
            xp: 200,
            title: 'Zen Architect',
            titleVi: 'Kiến Trúc Sư Tĩnh Lặng'
        },
        autoAccept: false
    },
    {
        id: 'Q_TOD_TWILIGHT',
        category: 'time_of_day',
        phase: 'twilight',
        title: {
            en: 'Twilight Tea & Code Reflection with Ren',
            vi: 'Trà Chiều Hoàng Hôn Cùng Ren'
        },
        description: {
            en: 'Meet Ren by the Hilltop Overlook at sunset to savor green tea and review code.',
            vi: 'Gặp Ren tại Đỉnh Đồi lúc hoàng hôn để thưởng thức trà xanh và chiêm nghiệm mã nguồn.'
        },
        giverNpc: 'Ren',
        steps: [
            {
                id: 'step_twilight_talk_ren',
                text: { en: 'Share a cup of tea with Ren at Twilight', vi: 'Uống trà cùng Ren trên đồi lúc hoàng hôn' },
                type: 'talk_npc',
                target: 'Ren',
                targetPos: { x: -28, y: 1.5, z: 12 }
            }
        ],
        rewards: {
            xp: 250,
            title: 'Twilight Scribe',
            titleVi: 'Học Giả Hoàng Hôn'
        },
        autoAccept: false
    },
    {
        id: 'Q_TOD_NIGHT',
        category: 'time_of_day',
        phase: 'night',
        title: {
            en: 'Midnight Cyber Jam with Kaede',
            vi: 'Giao Hưởng Đêm Cyberpunk Cùng Kaede'
        },
        description: {
            en: 'Jam and vibe dance with Kaede on the neon-lit bridge during midnight cyberpunk hours.',
            vi: 'Nhảy VibeDance cùng Kaede trên Cầu Neon trong khung giờ đêm Cyberpunk kỳ ảo.'
        },
        giverNpc: 'Kaede',
        steps: [
            {
                id: 'step_night_dance_kaede',
                text: { en: 'Perform VibeDance with Kaede on the Neon Bridge', vi: 'Thực hiện vũ điệu VibeDance cùng Kaede tại Cầu Neon' },
                type: 'talk_npc',
                target: 'Kaede',
                targetPos: { x: 5, y: 0.5, z: -2 }
            }
        ],
        rewards: {
            xp: 300,
            title: 'Night Crawler',
            titleVi: 'Bóng Ma Cyberpunk'
        },
        autoAccept: false
    }
];

module.exports = {
    QUEST_DEFINITIONS
};
