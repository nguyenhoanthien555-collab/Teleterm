/**
 * TELETERM INTERNATIONALIZATION (i18n) ENGINE
 * Provides comprehensive multi-language support (English 'en' by default, and Vietnamese 'vi').
 * Manages locale dictionary, dynamic DOM attribute binding, event notifications,
 * and localStorage persistence ('teleterm_language').
 */

export const TRANSLATIONS = {
    en: {
        // Navigation Bar & Switcher
        nav_terminal: 'Terminal',
        nav_term_short: 'Term',
        nav_codex: 'Codex',
        nav_codex_short: 'Codex',
        nav_antigravity: 'Antigravity',
        nav_agy_short: 'AGY',
        nav_universal: 'All Agents',
        nav_universal_short: 'Agents',
        nav_quota: 'Acc & Quota',
        nav_quota_short: 'Quota',
        nav_back_to_3d: 'Return to 3D World',
        nav_3d_world: '3D World',
        nav_3d_world_short: '3D World',
        nav_graphics: 'Graphics',
        nav_graphics_title: 'Graphics & Performance Settings',
        nav_lofi: 'LoFi',
        nav_skin: 'Skin',
        nav_orientation_landscape: 'Landscape',
        nav_orientation_portrait: 'Portrait',
        nav_mode_explore: 'Explore',
        nav_mode_work: 'Work',
        nav_hub: 'Hub',
        nav_tools: 'Tools',

        // Graphics & Settings Modal
        gfx_title: 'Graphics & Performance Settings',
        gfx_close: 'Close',
        gfx_lang_label: 'Interface Language / Ngôn Ngữ',
        gfx_lang_desc: 'Select preferred language (saved in preferences)',
        gfx_display_mode_section: '1. Display Mode / Chế Độ Hiển Thị',
        gfx_display_mode_desc: 'Choose between Fullscreen, Borderless Windowed, and standard Windowed modes',
        gfx_mode_fullscreen: 'Fullscreen',
        gfx_mode_fullscreen_sub: 'Exclusive Fullscreen • Max Immersion',
        gfx_mode_borderless: 'Borderless',
        gfx_mode_borderless_sub: 'Borderless Window • Instant Alt+Tab',
        gfx_mode_window: 'Window',
        gfx_mode_window_sub: 'Floating Window • Flexible Resizing',
        toast_display_mode_applied: 'Display mode set to {mode}',
        gfx_profile_section: '2. Platform Profile',
        gfx_profile_mobile: 'Mobile Profile',
        gfx_profile_mobile_desc: 'Cool thermals, battery saver, prevents overheating',
        gfx_profile_pc: 'PC Profile',
        gfx_profile_pc_desc: 'High resolution, full shaders & dynamic shadows',
        gfx_profile_mobile_hint: 'Mobile users can select PC Graphics if their device has a powerful processor!',
        gfx_presets_section: '3. Quick Quality Presets',
        gfx_custom_section: '4. Advanced Custom Settings',
        gfx_res_label: 'Resolution Scale (DPR)',
        gfx_res_tag: 'Clarity',
        gfx_res_desc: 'Maintains render sharpness and prevents texture blur',
        gfx_res_low: 'Low (0.8x) — GPU Saver',
        gfx_res_med: 'Medium (1.0x) — Standard Sharp',
        gfx_res_high: 'High (1.25x) — Super Smooth',
        gfx_res_max: 'Max (1.5x / Native) — Ultra Crisp',
        gfx_aa_label: 'Anti-Aliasing (MSAA)',
        gfx_aa_tag: 'Smooth Edges',
        gfx_aa_desc: 'Eliminates jagged polygon edges for smooth silhouettes',
        gfx_aa_enable: 'Enable Smooth Edge Anti-Aliasing',
        gfx_model_label: 'Model & Texture Smoothing',
        gfx_model_tag: 'MToon',
        gfx_model_desc: 'Smooths character mesh surfaces with anisotropic texture filtering',
        gfx_model_std: 'Standard — Lightweight & Fast',
        gfx_model_high: 'High / Anisotropic — Maximum Detail',
        gfx_shadow_label: 'Shadow Quality',
        gfx_shadow_tag: 'Lighting',
        gfx_shadow_desc: 'Resolution of directional sunlight shadows on terrain and avatars',
        gfx_shadow_off: 'Off (Low — Max FPS & Ultra Cool)',
        gfx_shadow_512: '512 Basic (Medium — Lightweight)',
        gfx_shadow_1024: '1024 PCF (High — Filtered Soft Shadow)',
        gfx_shadow_2048: '2048 PCF Soft (Max / Ultra — Soft Shadow)',
        gfx_shader_label: 'Shader Atmosphere (BSL Inspired)',
        gfx_shader_tag: 'Atmosphere',
        gfx_shader_desc: 'Enhances world atmosphere with warm god rays and water reflections',
        gfx_shader_vanilla: 'Vanilla Stylized (Cool, Pure Anime Aesthetic)',
        gfx_shader_enhanced: 'Enhanced Anime Shader (BSL Style: Warm God Rays & Water Glints)',
        gfx_fps_label: 'Frame Rate Limit (FPS Cap / Battery Saver)',
        gfx_fps_tag: 'Thermals',
        gfx_fps_desc: 'Locks FPS to keep devices cool during extended play',
        gfx_fps_30: '30 FPS — Max Battery Saver & Coolest Thermals',
        gfx_fps_60: '60 FPS — Tournament Smooth',
        gfx_fps_uncapped: 'Uncapped — Native (90Hz / 120Hz / 144Hz)',
        gfx_nametag_label: 'NPC Overhead Nametags (Smart View Cone)',
        gfx_nametag_tag: 'UI HUD',
        gfx_nametag_desc: 'Show nametags only when camera focuses on NPC or nearby (<6m)',
        gfx_nametag_focus: 'Focus Only (In View Cone or <6m — Recommended)',
        gfx_nametag_always: 'Always (Show all NPCs in sight)',
        gfx_nametag_off: 'Off (Hide all nametags — Cinematic Photo Mode)',
        gfx_btn_reset: 'Restore Defaults',
        gfx_btn_done: 'Apply & Close',
        settings_title: 'System Configuration / Cài Đặt Hệ Thống',
        tab_graphics: 'Graphics',
        tab_audio: 'Audio',
        tab_controls: 'Controls & Camera',
        tab_gameui: 'Game & World',
        tab_system: 'Network & System',
        toast_cache_cleared: 'Local cache cleared successfully!',
        toast_photo_mode_entered: 'Photo Mode activated. Press [P] to exit.',
        toast_photo_mode_exited: 'Exited Photo Mode.',
        toast_snapshot_saved: 'High-res snapshot saved to your downloads!',

        // Preset Names & Badges
        preset_mobile_low: 'Mobile Low',
        preset_mobile_low_badge: 'Ultra Cool & Max Battery Saver',
        preset_mobile_medium: 'Mobile Medium (Recommended)',
        preset_mobile_medium_badge: 'Perfect balance of visual clarity and thermals',
        preset_mobile_high: 'Mobile High',
        preset_mobile_high_badge: 'Crisp visuals for flagship devices / high-end chips',
        preset_mobile_max: 'Mobile Max',
        preset_mobile_max_badge: 'Maximum mobile graphics (requires good cooling)',
        preset_pc_low: 'PC Low',
        preset_pc_low_badge: 'For low-battery laptops or integrated GPUs',
        preset_pc_medium: 'PC Medium',
        preset_pc_medium_badge: 'Smooth 60 FPS for mainstream laptops',
        preset_pc_high: 'PC High (Recommended)',
        preset_pc_high_badge: 'Stunning clarity, soft PCF shadows & warm anime shader',
        preset_pc_max: 'PC Max / Ultra',
        preset_pc_max_badge: 'Ultimate fidelity: Crisp anti-aliasing, 2048 soft shadows, 16x Anisotropy',
        preset_custom: 'Custom Specs',

        // Mobile Full Tools Drawer
        mob_drawer_title: 'CYBER TOOLS',
        mob_sec_workspaces: 'WORKSPACES & AI ENGINES',
        mob_sec_metaverse: 'METAVERSE & CUSTOMIZATION',
        mob_sec_utilities: 'PC UTILITIES & HARDWARE',
        tile_term_name: 'Terminal',
        tile_term_sub: 'PowerShell ConPTY Shell',
        tile_codex_name: 'Codex AI',
        tile_codex_sub: 'Coding Threads & Prompts',
        tile_agy_name: 'Antigravity',
        tile_agy_sub: 'Gemini Live Interactive AI',
        tile_agents_name: 'All Agents',
        tile_agents_sub: 'Claude, Cursor, OpenClaw',
        tile_quota_name: 'Acc & Quota',
        tile_quota_sub: '1-Tap Profiles & Limits',
        tile_mode_name: 'Toggle View',
        tile_mode_sub: '3D World ⇄ Focus Screen',
        tile_gfx_name: 'Graphics Settings',
        tile_gfx_sub: 'Shaders, FPS & Anti-aliasing',
        tile_lofi_name: 'LoFi Vibe Player',
        tile_lofi_sub: 'Chillhop & Rain/Fire Ambience',
        tile_skin_name: 'Avatar & Skins',
        tile_skin_sub: 'Costumes & 3D GLB/VRM Upload',
        tile_chat_name: 'World MMO Chat',
        tile_chat_sub: 'Global & Whisper Channels',
        tile_orient_name: 'Screen Orientation',
        tile_orient_sub: 'Portrait ⇄ Landscape',
        tile_viet_name: 'Vietnamese Input',
        tile_viet_sub: 'Quick Input & Hotkeys',
        tile_lang_name: 'Language / Ngôn Ngữ',
        tile_lang_sub: 'English ⇄ Tiếng Việt',
        tile_peek_name: 'Desktop Peek',
        tile_peek_sub: 'Live Screen Screenshot',
        tile_files_name: 'File Explorer',
        tile_files_sub: 'Browse C:\\, D:\\, E:\\, Home',
        tile_tasks_name: 'Task Manager',
        tile_tasks_sub: 'View & Manage PC Processes',
        tile_keys_name: 'Virtual Keyboard',
        tile_keys_sub: 'F1-F12, Arrows, Hotkeys',
        tile_preview_name: 'Web Preview',
        tile_preview_sub: 'Preview Port :3000, :5173',
        tile_getclip_name: 'Get PC Clipboard',
        tile_getclip_sub: 'Copy text from computer',
        tile_sendclip_name: 'Send PC Clipboard',
        tile_sendclip_sub: 'Paste text to computer',
        tile_screenoff_name: 'Turn Off PC Screen',
        tile_screenoff_sub: 'Put PC display to sleep',
        tile_lockpc_name: 'Lock Computer',
        tile_lockpc_sub: 'Lock Windows (Win + L)',

        // 3D Floating Interaction Prompts
        prompt_press: 'Press',
        prompt_to: 'to',
        prompt_interact: 'Interact',
        prompt_sit: 'Sit',
        prompt_stand: 'Stand Up',
        prompt_buy_drink: 'Buy Drink',
        prompt_bar_stool: 'Sit at Bar',
        prompt_coding_desk: 'Coding Desk',
        prompt_talk: 'Talk ({name})',
        prompt_terminal: 'Terminal',
        prompt_ring_bell: 'Ring Bell',

        // Quick Preset Buttons
        preset_btn_low: 'Low',
        preset_btn_medium: 'Medium',
        preset_btn_high: 'High',
        preset_btn_max: 'Max / Ultra',
        preset_btn_custom: 'Custom',

        // 3D World Anchor Labels
        anchor_hub_desk_1: 'Code at Hub Coding Desk #1',
        anchor_hub_desk_2: 'Code at Hub Coding Desk #2',
        anchor_hub_desk_3: 'Code at Hub Developer Desk #3',
        anchor_hub_cafe_bar_1: 'Relax with coffee at the cafe bar',
        anchor_hub_cafe_bar_2: 'Enjoy espresso at bar stool #2',
        anchor_hub_cafe_bar_3: 'Enjoy specialty drink at bar stool #3',
        anchor_hub_barista: 'Artisan Cafe Barista Station',
        anchor_hub_kiosk: 'Interact with Hologram Terminal Console',
        anchor_wayside_bench: 'Watch cherry blossoms by the roadside',
        anchor_river_bench: 'Watch the gentle river flow',
        anchor_cherry_bench: 'Rest on cherry grove hillside',
        anchor_hilltop_bench: 'Panoramic view of snowy mountains',
        anchor_pier_bench: 'Enjoy ocean breeze at pierhead',
        anchor_beach_bench: 'Enjoy ocean breeze under beach umbrella',
        anchor_public_terminal: 'Access public Hologram Terminal',
        anchor_vending_machine: 'Get green tea / canned coffee from vending machine',
        anchor_vintage_bicycle: 'Ring vintage bicycle bell',
        anchor_bamboo_mat_1: 'Meditate at Zen Tea Pavilion Mat #1',
        anchor_bamboo_mat_2: 'Rest at Zen Tea Pavilion Mat #2',
        anchor_maple_picnic: 'Picnic under golden-red maples',
        anchor_maple_bench: 'Watch the bubbling stream in Maple Valley',
        anchor_alpine_telescope: 'Look through telescope at snowy alpine mountains',
        anchor_campfire_bench_1: 'Sit by Campfire (West Log)',
        anchor_campfire_bench_2: 'Sit by Campfire (North Log)',
        anchor_campfire_bench_3: 'Sit by Campfire (East Log)',

        // NPC Roles
        role_lumina: 'AI Architect & Researcher',
        role_sakura: 'Spring Priestess & UI Designer',
        role_ren: 'Tech Scholar & Systems Hacker',
        role_kaede: 'Mechanical & Graphics Engineer',
        role_kaito: 'Artisan Barista & Coffee Master',

        // Avatar Customizer
        avatar_modal_title: 'Customize Avatar & 3D Model',
        avatar_section_preset: '1. Anime Outfit & Accessories Preset',
        avatar_preset_sakura: 'Sakura Alice',
        avatar_preset_hacker: 'Hacker Hoodie',
        avatar_preset_ronin: 'Kimono Ronin',
        avatar_preset_kemono: 'Kemono Coder',
        avatar_texture_notice: '<em>Original high-res MToon textures are 100% preserved with anti-color bleed protection.</em>',
        avatar_section_upload: '2. Upload Custom 3D Model (Max 12MB .GLB / .VRM)',
        avatar_btn_select_file: 'Select .GLB / .VRM File (≤ 12MB)',
        avatar_upload_status_compat: 'Compatible with standard glTF 2.0 & VRoid Studio',
        avatar_btn_save: 'Save & Apply',
        avatar_sakura_desc: 'Delicate sakura headband in Japanese maiden style',
        avatar_hacker_desc: 'High-tech cyberpunk hologram optics',
        avatar_ronin_desc: 'Weathered hip-mounted samurai katana',
        avatar_kemono_desc: 'Adorable kemono cat ears',
        avatar_upload_large: 'File too large (max 12MB). Please optimize textures or reduce polygon count.',
        avatar_upload_format: 'Only standard 3D formats (.GLB or .VRM) are supported.',
        avatar_uploading: 'Uploading and validating 3D model...',
        avatar_upload_success: 'Custom 3D avatar successfully imported into the world!',

        // NPC Dialogue
        dialogue_btn_end: 'End conversation',

        // Antigravity Deck
        agy_status_running: 'RUNNING',
        agy_status_stopped: 'STOPPED',
        agy_no_conversations: 'No conversations yet',
        agy_loading_messages: 'Loading message history...',
        agy_no_messages: 'No messages in this session',
        agy_user_label: 'YOU',

        // Toasts
        toast_preset_applied: 'Applied graphics preset: {name}',
        toast_preset_custom: 'Custom settings mode enabled',
        toast_defaults_restored: 'Restored default graphics settings!',
        toast_settings_applied: 'Graphics settings applied!',
        toast_seat_occupied: 'This seat is currently occupied!',
        toast_seated: 'Seated: {label}',
        toast_model_incompatible: 'Model incompatible with Humanoid bone structure!',
        toast_avatar_loaded: 'Custom avatar loaded ({status})!',
        toast_model_error: 'Error loading 3D model.',
        toast_terminal_opened: 'Opened public Hologram Terminal!',
        toast_vending_drink: 'Retrieved an iced green tea from the vending machine!',
        toast_pose_thinking: 'Status: Contemplating / Deep in Thought',
        toast_pose_standing: 'Status: Natural Standing',
        toast_lang_changed: 'Language set to English',

        // MMO Chat
        chat_global: 'Global',
        chat_whisper: 'Whisper',
        chat_welcome: 'Welcome to the open developer metaverse! Press <strong>[T]</strong> to chat.',
        chat_placeholder: 'Type a message... (Press T to focus)',
        chat_open_pill: 'Chat [T]',

        // Master Spec v4 Ranks (Sections 83 & 89)
        rank_novice: 'Novice',
        rank_apprentice: 'Apprentice',
        rank_coder: 'Coder',
        rank_developer: 'Developer',
        rank_engineer: 'Engineer',
        rank_specialist: 'Specialist',
        rank_architect: 'Architect',
        rank_senior_architect: 'Senior Architect',
        rank_principal_engineer: 'Principal Engineer',
        rank_systems_architect: 'Systems Architect',
        rank_master_builder: 'Master Builder',
        rank_distinguished_architect: 'Distinguished Architect',
        rank_legendary_developer: 'Legendary Developer',

        // Level & Activities
        level_prefix: 'Lv. ',
        level_short: 'Lv.',
        act_vibing: '*vibing*',
        act_coding: '*coding...*',
        act_thinking: '*thinking...*',
        act_reading: '*reading docs...*',
        act_debugging: '*debugging bug...*',
        act_walking: '*walking...*',
        act_drinking: '*drinking green tea...*',
        act_enjoying_view: '*enjoying scenic vista*',

        // Player Inventory & Handheld Items (Sections 72-76)
        inv_title: 'Inventory',
        inv_empty: 'Empty Slot',
        inv_slot_hint: 'Press [{key}] to Equip',
        inv_use_hint: 'Press [F] to Use',
        inv_equipped: 'Equipped',
        item_green_tea: 'Iced Green Tea Can',
        item_green_tea_desc: 'A cold, refreshing canned green tea from the vending machine.',
        item_coffee_mug: 'Developer Coffee Mug',
        item_coffee_mug_desc: 'A steaming hot mug of premium dark roast coffee.',
        item_straw_hat: 'Country Straw Hat',
        item_straw_hat_desc: 'Traditional straw hat for sunny days in the countryside.',
        toast_item_equipped: 'Equipped: {name}',
        toast_item_unequipped: 'Unequipped {name}',
        toast_item_consumed: 'Refreshed! You drank the {name}.',

        // LoFi Audio & Ambient (Sections 60-66)
        lofi_track_sakura: 'Sakura Afternoon (Rhodes Chill)',
        lofi_play: 'Play Music',
        lofi_pause: 'Pause Music',
        lofi_rain: 'Rain',
        lofi_campfire: 'Campfire',
        lofi_static: 'Static',

        // Vending Machine (Sections 77-82)
        prompt_vending_buy: 'Buy Green Tea',
        toast_vending_purchased: 'Retrieved an iced green tea from the vending machine!',
        toast_vending_full: 'Inventory full (9/9 slots)!',

        // Vintage Bicycle
        toast_bicycle_bell: '*Ding-ding!* The vintage bicycle bell chimes warmly across the square.',

        // Sound Settings (Feature Group C)
        sound_settings_section: '5. Sound Settings (Audio)',
        sound_master_label: 'Master Volume',
        sound_master_desc: 'Scales all game audio, ambience, footstep and action sounds',
        sound_ambiance_label: 'Ambiance Sounds',
        sound_ambiance_desc: 'Environmental wind, water stream, ocean surf, birds & crickets',
        sound_players_label: 'Players\' Sounds',
        sound_players_desc: 'Footsteps, drinking, item use, vending machine & player interactions',

        // Inventory (Feature Group A & Inventory)
        inventory_title: 'Player Inventory',
        inventory_storage: 'Storage (3×9)',
        inventory_hotbar: 'Hotbar (1..9)',
        inventory_drag_hint: 'Click or drag items to swap / rearrange slots [E/I to toggle]',
        hotbar_title_empty: 'Empty Slot',

        // Whisper & Chat (Feature Group B)
        whisper_banner: 'Whispering to: {name}',
        whisper_from: 'From',
        whisper_to: 'To',
        whisper_reply_btn: 'Reply',
        whisper_err_no_target: 'Please select a player or use /m <player> <msg>',
        whisper_err_no_reply: 'No previous whisper to reply to.',
        whisper_err_offline: 'Player "{name}" is not online.'
    },

    vi: {
        // Navigation Bar & Switcher
        nav_terminal: 'Terminal',
        nav_term_short: 'Term',
        nav_codex: 'Codex',
        nav_codex_short: 'Codex',
        nav_antigravity: 'Antigravity',
        nav_agy_short: 'AGY',
        nav_universal: 'Tất cả Agent',
        nav_universal_short: 'Agents',
        nav_quota: 'Tài khoản & Quota',
        nav_quota_short: 'Quota',
        nav_back_to_3d: 'Quay về thế giới 3D',
        nav_3d_world: 'Thế giới 3D',
        nav_3d_world_short: 'Thế giới 3D',
        nav_graphics: 'Đồ Họa',
        nav_graphics_title: 'Cài Đặt Đồ Họa & Hiệu Suất (Graphics Quality)',
        nav_lofi: 'LoFi',
        nav_skin: 'Trang phục',
        nav_orientation_landscape: 'Ngang',
        nav_orientation_portrait: 'Dọc',
        nav_mode_explore: 'Khám phá',
        nav_mode_work: 'Làm việc',
        nav_hub: 'Hub',
        nav_tools: 'Công cụ',

        // Graphics & Settings Modal
        gfx_title: 'Cài Đặt Đồ Họa & Hiệu Suất (Graphics)',
        gfx_close: 'Đóng',
        gfx_lang_label: 'Ngôn Ngữ Giao Diện / Language',
        gfx_lang_desc: 'Chọn ngôn ngữ giao diện ưa thích (lưu tự động)',
        gfx_display_mode_section: '1. Chế Độ Hiển Thị Màn Hình',
        gfx_display_mode_desc: 'Lựa chọn giữa Toàn màn hình, Không viền và Cửa sổ truyền thống',
        gfx_mode_fullscreen: 'Toàn Màn Hình',
        gfx_mode_fullscreen_sub: 'Toàn màn hình độc quyền • Trải nghiệm đắm chìm',
        gfx_mode_borderless: 'Không Viền (Borderless)',
        gfx_mode_borderless_sub: 'Không viền toàn màn hình • Chuyển tab Alt+Tab tức thì',
        gfx_mode_window: 'Cửa Sổ (Window)',
        gfx_mode_window_sub: 'Cửa sổ tùy biến • Linh hoạt đa nhiệm trên máy tính',
        toast_display_mode_applied: 'Đã chuyển sang chế độ hiển thị: {mode}',
        gfx_profile_section: '2. Nhóm Thiết Bị & Cấu Hình (Platform Profile)',
        gfx_profile_mobile: 'Mobile Profile',
        gfx_profile_mobile_desc: 'Mát máy, tiết kiệm pin, chống quá nhiệt',
        gfx_profile_pc: 'PC Profile',
        gfx_profile_pc_desc: 'Độ nét cao, shader & bóng đổ toàn diện',
        gfx_profile_mobile_hint: 'Người dùng mobile hoàn toàn có thể chọn PC Graphics nếu máy bạn có chip xử lý đủ mạnh!',
        gfx_presets_section: '3. Mức Thiết Lập Nhanh (Quality Presets)',
        gfx_custom_section: '4. Tùy Chỉnh Nâng Cao Chi Tiết (Custom Settings)',
        gfx_res_label: 'Độ phân giải (Resolution Scale / DPR)',
        gfx_res_tag: 'Sắc nét',
        gfx_res_desc: 'Giữ ảnh nét, không bị vỡ hoặc nhòe mờ texture',
        gfx_res_low: 'Low (0.8x) — Tiết kiệm GPU',
        gfx_res_med: 'Medium (1.0x) — Chuẩn sắc nét',
        gfx_res_high: 'High (1.25x) — Siêu mịn',
        gfx_res_max: 'Max (1.5x / Native) — Tinh xảo',
        gfx_aa_label: 'Khử răng cưa (Anti-Aliasing)',
        gfx_aa_tag: 'Mịn viền',
        gfx_aa_desc: 'Loại bỏ gai cạnh mô hình, khử răng cưa sắc nét',
        gfx_aa_enable: 'Bật khử răng cưa viền mượt',
        gfx_model_label: 'Làm mịn Model & Textures (3D Model)',
        gfx_model_tag: 'Vân MToon',
        gfx_model_desc: 'Làm mịn bề mặt mô hình nhân vật, lọc vân dị hướng Anisotropy',
        gfx_model_std: 'Standard — Mượt nhẹ, nhẹ bộ nhớ',
        gfx_model_high: 'High / Anisotropic — Vân mịn tối đa',
        gfx_shadow_label: 'Đổ bóng (Shadow Quality)',
        gfx_shadow_tag: 'Ánh sáng',
        gfx_shadow_desc: 'Độ phân giải bóng nắng đổ trên mặt đất và nhân vật',
        gfx_shadow_off: 'Tắt bóng (Low — Tăng vọt FPS & Siêu mát máy)',
        gfx_shadow_512: '512 Basic (Medium — Nhẹ nhàng, mát máy)',
        gfx_shadow_1024: '1024 PCF (High — Bóng lọc viền mượt)',
        gfx_shadow_2048: '2048 PCF Soft (Max / Ultra — Bóng mềm cao cấp)',
        gfx_shader_label: 'Chế độ Shader (Lấy cảm hứng Minecraft Shaders)',
        gfx_shader_tag: 'Không gian',
        gfx_shader_desc: 'Nâng cấp chất lượng hình ảnh tổng thể với ánh nắng ấm và tia sáng',
        gfx_shader_vanilla: 'Vanilla Stylized (Mặc định nhẹ mát, Anime thuần khiết)',
        gfx_shader_enhanced: 'Enhanced Anime Shader (BSL/Complementary: Vệt nắng ấm God Rays, Ánh phản chiếu mặt nước)',
        gfx_fps_label: 'Giới hạn khung hình (FPS Cap / Tiết Kiệm Pin)',
        gfx_fps_tag: 'Nhiệt độ',
        gfx_fps_desc: 'Khóa FPS giúp điện thoại không bị quá nhiệt khi chơi lâu',
        gfx_fps_30: '30 FPS — Tiết kiệm pin tối đa, máy mát lạnh',
        gfx_fps_60: '60 FPS — Chuẩn mượt mà thi đấu',
        gfx_fps_uncapped: 'Không giới hạn (Uncapped — 90Hz/120Hz/144Hz)',
        gfx_nametag_label: 'Hiển thị Nametag NPC (Thông minh / Camera Cone)',
        gfx_nametag_tag: 'Giao diện',
        gfx_nametag_desc: 'Chỉ hiện bảng tên khi camera nhìn vào NPC hoặc đứng gần, tránh rối màn hình',
        gfx_nametag_focus: 'Focus Only (Chỉ hiện khi nhìn vào hoặc ở gần < 6m — Khuyên dùng)',
        gfx_nametag_always: 'Always (Luôn hiện mọi NPC trong tầm mắt)',
        gfx_nametag_off: 'Off (Tắt toàn bộ bảng tên — Chế độ chụp ảnh Cinematic)',
        gfx_btn_reset: 'Khôi phục mặc định',
        gfx_btn_done: 'Hoàn tất & Đóng',
        settings_title: 'Cấu Hình Hệ Thống (Universal Settings)',
        tab_graphics: 'Đồ Họa',
        tab_audio: 'Âm Thanh',
        tab_controls: 'Điều Khiển & Camera',
        tab_gameui: 'Giao Diện & Thế Giới',
        tab_system: 'Mạng & Hệ Thống',
        toast_cache_cleared: 'Đã xóa bộ nhớ tạm thành công!',
        toast_photo_mode_entered: 'Đã bật Chế độ Chụp Ảnh Photo Mode. Nhấn [P] để thoát.',
        toast_photo_mode_exited: 'Đã thoát Chế độ Chụp Ảnh.',
        toast_snapshot_saved: 'Đã lưu ảnh chụp màn hình độ phân giải cao vào thư mục Downloads!',

        // Preset Names & Badges
        preset_mobile_low: 'Mobile Low',
        preset_mobile_low_badge: 'Cực mát & Tiết kiệm pin tối đa',
        preset_mobile_medium: 'Mobile Medium (Khuyên dùng)',
        preset_mobile_medium_badge: 'Cân bằng tuyệt hảo giữa hình ảnh và nhiệt độ',
        preset_mobile_high: 'Mobile High',
        preset_mobile_high_badge: 'Đồ họa sắc nét cho máy flagship / chip mạnh',
        preset_mobile_max: 'Mobile Max',
        preset_mobile_max_badge: 'Đồ họa tối đa trên điện thoại (cần tản nhiệt tốt)',
        preset_pc_low: 'PC Low',
        preset_pc_low_badge: 'Dành cho laptop pin yếu hoặc GPU tích hợp',
        preset_pc_medium: 'PC Medium',
        preset_pc_medium_badge: '60 FPS mượt mà cho laptop phổ thông',
        preset_pc_high: 'PC High (Khuyên dùng)',
        preset_pc_high_badge: 'Sắc nét tuyệt đẹp, bóng PCF & Shader Anime ấm',
        preset_pc_max: 'PC Max / Ultra',
        preset_pc_max_badge: 'Đồ họa đỉnh cao: Khử răng cưa cực nét, bóng mềm 2048, 16x Anisotropy',
        preset_custom: 'Tùy chỉnh riêng (Custom Specs)',

        // Mobile Full Tools Drawer
        mob_drawer_title: 'CÔNG CỤ CYBER',
        mob_sec_workspaces: 'KHÔNG GIAN LÀM VIỆC & AI',
        mob_sec_metaverse: 'METAVERSE & TÙY BIẾN',
        mob_sec_utilities: 'TIỆN ÍCH MÁY TÍNH & PHẦN CỨNG',
        tile_term_name: 'Terminal',
        tile_term_sub: 'PowerShell ConPTY Shell',
        tile_codex_name: 'Codex AI',
        tile_codex_sub: 'Coding Threads & Prompts',
        tile_agy_name: 'Antigravity',
        tile_agy_sub: 'Gemini Live Interactive AI',
        tile_agents_name: 'Tất Cả Agent',
        tile_agents_sub: 'Claude, Cursor, OpenClaw',
        tile_quota_name: 'Tài Khoản & Quota',
        tile_quota_sub: '1-Tap Profiles & Limits',
        tile_mode_name: 'Chuyển Chế Độ',
        tile_mode_sub: '3D World ⇄ Focus Screen',
        tile_gfx_name: 'Cài Đặt Đồ Họa',
        tile_gfx_sub: 'Shaders, FPS & Khử răng cưa',
        tile_lofi_name: 'Trình Phát LoFi Vibe',
        tile_lofi_sub: 'Chillhop & Âm thanh mưa/lửa',
        tile_skin_name: 'Avatar & Trang Phục',
        tile_skin_sub: 'Trang phục & Tải 3D GLB/VRM',
        tile_chat_name: 'Kênh Chat MMO',
        tile_chat_sub: 'Kênh Global & Whisper',
        tile_orient_name: 'Xoay Màn Hình',
        tile_orient_sub: 'Chuyển Dọc ⇄ Ngang',
        tile_viet_name: 'Gõ Tiếng Việt',
        tile_viet_sub: 'Quick Input & Phím tắt',
        tile_lang_name: 'Ngôn Ngữ / Language',
        tile_lang_sub: 'Tiếng Việt ⇄ English',
        tile_peek_name: 'Xem Màn Hình PC',
        tile_peek_sub: 'Chụp màn hình máy tính PC',
        tile_files_name: 'Quản Lý Tệp',
        tile_files_sub: 'Duyệt ổ C:\\, D:\\, E:\\, Home',
        tile_tasks_name: 'Tiến Trình (Task)',
        tile_tasks_sub: 'Xem & quản lý Process PC',
        tile_keys_name: 'Bàn Phím Ảo',
        tile_keys_sub: 'Phím tắt di động & F1-F12',
        tile_preview_name: 'Xem Trước Web',
        tile_preview_sub: 'Xem trước port :3000, :5173',
        tile_getclip_name: 'Nhận Clipboard PC',
        tile_getclip_sub: 'Copy văn bản từ máy tính',
        tile_sendclip_name: 'Gửi Clipboard PC',
        tile_sendclip_sub: 'Dán văn bản vào máy tính',
        tile_screenoff_name: 'Tắt Màn Hình PC',
        tile_screenoff_sub: 'Đưa màn hình PC vào sleep',
        tile_lockpc_name: 'Khóa Máy Tính',
        tile_lockpc_sub: 'Khóa Windows (Win + L)',

        // 3D Floating Interaction Prompts
        prompt_press: 'Bấm',
        prompt_to: 'để',
        prompt_interact: 'Tương tác',
        prompt_sit: 'Ngồi',
        prompt_stand: 'Đứng dậy',
        prompt_buy_drink: 'Mua nước',
        prompt_bar_stool: 'Ngồi quầy bar',
        prompt_coding_desk: 'Bàn làm việc',
        prompt_talk: 'Trò chuyện ({name})',
        prompt_terminal: 'Terminal',
        prompt_ring_bell: 'Rung chuông',

        // Quick Preset Buttons
        preset_btn_low: 'Thấp',
        preset_btn_medium: 'Vừa',
        preset_btn_high: 'Cao',
        preset_btn_max: 'Cực đại',
        preset_btn_custom: 'Tùy chỉnh',

        // 3D World Anchor Labels
        anchor_hub_desk_1: 'Ngồi lập trình tại Hub Coding Desk #1',
        anchor_hub_desk_2: 'Ngồi lập trình tại Hub Coding Desk #2',
        anchor_hub_desk_3: 'Ngồi lập trình tại Hub Hot Desk #3 (Bàn Developer)',
        anchor_hub_cafe_bar_1: 'Thư giãn uống cafe tại quầy bar cafe',
        anchor_hub_cafe_bar_2: 'Ngồi ghế bar cafe #2 thưởng thức espresso',
        anchor_hub_cafe_bar_3: 'Ngồi ghế bar cafe #3 thưởng thức đồ uống đặc biệt',
        anchor_hub_barista: 'Quầy pha chế Barista thủ công chuyên nghiệp',
        anchor_hub_kiosk: 'Tương tác Hologram Terminal Console',
        anchor_wayside_bench: 'Ngồi ngắm hoa anh đào bên vệ đường',
        anchor_river_bench: 'Ngồi ngắm dòng sông êm đềm',
        anchor_cherry_bench: 'Ngồi nghỉ chân trên sườn đồi hoa anh đào',
        anchor_hilltop_bench: 'Ngồi ngắm toàn cảnh dãy núi tuyết hùng vĩ',
        anchor_pier_bench: 'Ngồi hóng gió biển đầu cầu tàu',
        anchor_beach_bench: 'Ngồi hóng gió biển dưới tán dù bãi cát',
        anchor_public_terminal: 'Tra cứu & mở Hologram Terminal công cộng',
        anchor_vending_machine: 'Mua lon trà xanh / cà phê lon từ máy bán hàng tự động',
        anchor_vintage_bicycle: 'Rung chuông xe đạp cổ',
        anchor_bamboo_mat_1: 'Ngồi thiền tại Chiếu Trà Đạo #1',
        anchor_bamboo_mat_2: 'Nghỉ ngơi tại Chiếu Trà Đạo #2',
        anchor_maple_picnic: 'Picnic dưới rặng phong đỏ rực rỡ',
        anchor_maple_bench: 'Ngắm dòng suối róc rách ở Thung lũng Phong',
        anchor_alpine_telescope: 'Ngắm dãy núi tuyết qua kính viễn vọng',
        anchor_campfire_bench_1: 'Ngồi bên đống lửa trại (Khúc gỗ Tây)',
        anchor_campfire_bench_2: 'Ngồi bên đống lửa trại (Khúc gỗ Bắc)',
        anchor_campfire_bench_3: 'Ngồi bên đống lửa trại (Khúc gỗ Đông)',

        // NPC Roles
        role_lumina: 'Kiến Trúc Sư AI & Nghiên Cứu',
        role_sakura: 'Vu Nữ Mùa Xuân & Thiết Kế UI',
        role_ren: 'Học Giả Công Nghệ & Kỹ Sư Hệ Thống',
        role_kaede: 'Kỹ Sư Cơ Khí & Đồ Họa',
        role_kaito: 'Nghệ Nhân Barista & Pha Chế Cà Phê',

        // Avatar Customizer
        avatar_modal_title: 'Tùy Chỉnh Avatar & Model 3D',
        avatar_section_preset: '1. Trang Phục Anime & Phụ Kiện Sẵn Có',
        avatar_preset_sakura: 'Sakura Alice',
        avatar_preset_hacker: 'Hacker Hoodie',
        avatar_preset_ronin: 'Kimono Ronin',
        avatar_preset_kemono: 'Kemono Coder',
        avatar_texture_notice: 'Bảo toàn 100% vân bề mặt gốc MToon độ phân giải cao, chống lem màu.',
        avatar_section_upload: '2. Tải Lên Model 3D Tùy Chỉnh (Tối Đa 12MB .GLB / .VRM)',
        avatar_btn_select_file: 'Chọn File .GLB / .VRM (≤ 12MB)',
        avatar_upload_status_compat: 'Tương thích với định dạng chuẩn glTF 2.0 & VRoid Studio',
        avatar_btn_save: 'Lưu & Áp Dụng',
        avatar_sakura_desc: 'Băng đô hoa anh đào tinh tế, phong cách thiếu nữ Nhật Bản',
        avatar_hacker_desc: 'Kính hiển vi Hologram Cyberpunk công nghệ cao',
        avatar_ronin_desc: 'Thanh Katana Samurai đeo hông phong trần',
        avatar_kemono_desc: 'Đôi tai mèo Kemono đáng yêu',
        avatar_upload_large: 'File quá lớn (giới hạn 12MB). Vui lòng nén texture hoặc giảm polygon.',
        avatar_upload_format: 'Chỉ hỗ trợ định dạng 3D chuẩn .GLB hoặc .VRM.',
        avatar_uploading: 'Đang tải lên và kiểm tra model...',
        avatar_upload_success: 'Model 3D tùy chỉnh đã được tải vào thế giới thành công!',

        // NPC Dialogue
        dialogue_btn_end: 'Kết thúc đối thoại',

        // Antigravity Deck
        agy_status_running: 'ĐANG CHẠY',
        agy_status_stopped: 'ĐÃ DỪNG',
        agy_no_conversations: 'Chưa có hội thoại nào',
        agy_loading_messages: 'Đang tải lịch sử tin nhắn...',
        agy_no_messages: 'Chưa có tin nhắn trong phiên này',
        agy_user_label: 'BẠN',

        // Toasts
        toast_preset_applied: 'Đã áp dụng cấu hình đồ họa: {name}',
        toast_preset_custom: 'Đã chọn chế độ tùy chỉnh tự do (Custom)',
        toast_defaults_restored: 'Đã khôi phục cài đặt đồ họa mặc định!',
        toast_settings_applied: 'Đã áp dụng cài đặt đồ họa!',
        toast_seat_occupied: 'Chỗ ngồi này hiện đã có người!',
        toast_seated: 'Đã ngồi: {label}',
        toast_model_incompatible: 'Model không tương thích cấu trúc xương Humanoid!',
        toast_avatar_loaded: 'Đã nạp avatar tùy chỉnh ({status})!',
        toast_model_error: 'Lỗi khi tải file model 3D.',
        toast_terminal_opened: 'Đã mở Hologram Terminal công cộng!',
        toast_vending_drink: 'Đã lấy lon trà xanh mát lạnh từ máy bán tự động!',
        toast_pose_thinking: 'Trạng thái: Trầm tư suy nghĩ',
        toast_pose_standing: 'Trạng thái: Đứng tự nhiên',
        toast_lang_changed: 'Đã chuyển sang Tiếng Việt',

        // MMO Chat
        chat_global: 'Global',
        chat_whisper: 'Whisper',
        chat_welcome: 'Chào mừng bạn đến với thế giới lập trình Metaverse! Bấm <strong>[T]</strong> để chat.',
        chat_placeholder: 'Nhập tin nhắn... (Bấm T để nhập)',
        chat_open_pill: 'Chat [T]',

        // Master Spec v4 Ranks (Sections 83 & 89)
        rank_novice: 'Tập Sự',
        rank_apprentice: 'Học Việc',
        rank_coder: 'Lập Trình Viên',
        rank_developer: 'Kỹ Sư Phát Triển',
        rank_engineer: 'Kỹ Sư',
        rank_specialist: 'Chuyên Gia',
        rank_architect: 'Kiến Trúc Sư',
        rank_senior_architect: 'Kiến Trúc Sư Cao Cấp',
        rank_principal_engineer: 'Kỹ Sư Trưởng',
        rank_systems_architect: 'Kiến Trúc Sư Hệ Thống',
        rank_master_builder: 'Bậc Thầy Kiến Thiết',
        rank_distinguished_architect: 'Kiến Trúc Sư Xuất Chúng',
        rank_legendary_developer: 'Huyền Thoại Phát Triển',

        // Level & Activities
        level_prefix: 'Cấp ',
        level_short: 'Cấp',
        act_vibing: '*thư giãn*',
        act_coding: '*đang code...*',
        act_thinking: '*suy nghĩ...*',
        act_reading: '*đọc tài liệu...*',
        act_debugging: '*sửa lỗi bug...*',
        act_walking: '*đi dạo...*',
        act_drinking: '*uống trà xanh...*',
        act_enjoying_view: '*ngắm cảnh thiên nhiên*',

        // Player Inventory & Handheld Items (Sections 72-76)
        inv_title: 'Túi Đồ',
        inv_empty: 'Ô Trống',
        inv_slot_hint: 'Bấm [{key}] để Cầm',
        inv_use_hint: 'Bấm [F] để Dùng',
        inv_equipped: 'Đang Cầm',
        item_green_tea: 'Lon Trà Xanh Lạnh',
        item_green_tea_desc: 'Lon trà xanh mát lạnh giải khát từ máy bán tự động.',
        item_coffee_mug: 'Ly Cà Phê Developer',
        item_coffee_mug_desc: 'Ly cà phê đen đậm đà giúp tỉnh táo lập trình.',
        item_straw_hat: 'Nón Lá Đồng Quê',
        item_straw_hat_desc: 'Nón rơm che nắng phong cách đồng quê thanh bình.',
        toast_item_equipped: 'Đã cầm trên tay: {name}',
        toast_item_unequipped: 'Đã cất {name}',
        toast_item_consumed: 'Đã uống hết {name}, tinh thần thật sảng khoái!',

        // LoFi Audio & Ambient (Sections 60-66)
        lofi_track_sakura: 'Chiều Hoa Anh Đào (Rhodes Chill)',
        lofi_play: 'Bật Nhạc',
        lofi_pause: 'Tạm Dừng',
        lofi_rain: 'Mưa',
        lofi_campfire: 'Lửa Trại',
        lofi_static: 'Nhiễu Đài',

        // Vending Machine (Sections 77-82)
        prompt_vending_buy: 'Mua Lon Trà Xanh',
        toast_vending_purchased: 'Đã lấy lon trà xanh mát lạnh từ máy bán tự động!',
        toast_vending_full: 'Túi đồ đã đầy (9/9 ô)!',

        // Vintage Bicycle
        toast_bicycle_bell: '*Kính coong!* Chuông xe đạp cổ reo vang vui tai khắp quảng trường.',

        // Sound Settings (Feature Group C)
        sound_settings_section: '5. Cài đặt Âm thanh (Sounds)',
        sound_master_label: 'Âm lượng Tổng (Master)',
        sound_master_desc: 'Điều chỉnh toàn bộ âm thanh trò chơi, môi trường và tương tác',
        sound_ambiance_label: 'Âm thanh Môi trường (Ambiance)',
        sound_ambiance_desc: 'Tiếng gió, suối chảy, sóng biển, chim hót và dế đêm',
        sound_players_label: 'Âm thanh Người chơi (Players)',
        sound_players_desc: 'Bước chân, uống nước, dùng vật phẩm và tương tác người chơi',

        // Inventory (Feature Group A & Inventory)
        inventory_title: 'Túi Đồ & Trang Bị',
        inventory_storage: 'Kho Đồ (3×9)',
        inventory_hotbar: 'Thanh Thao Tác (1..9)',
        inventory_drag_hint: 'Bấm hoặc kéo thả vật phẩm để sắp xếp ô [Bấm E/I để mở/đóng]',
        hotbar_title_empty: 'Ô trống',

        // Whisper & Chat (Feature Group B)
        whisper_banner: 'Đang thì thầm với: {name}',
        whisper_from: 'Từ',
        whisper_to: 'Tới',
        whisper_reply_btn: 'Trả lời',
        whisper_err_no_target: 'Vui lòng chọn người chơi hoặc dùng /m <tên> <nội dung>',
        whisper_err_no_reply: 'Chưa có tin nhắn thì thầm nào trước đó để trả lời.',
        whisper_err_offline: 'Người chơi "{name}" hiện không trực tuyến.'
    }
};

const STORAGE_LANG_KEY = 'teleterm_language';

class I18nEngine {
    constructor() {
        // Default to English as per requirement
        this.currentLang = 'en';
        try {
            const saved = localStorage.getItem(STORAGE_LANG_KEY);
            if (saved && (saved === 'en' || saved === 'vi')) {
                this.currentLang = saved;
            } else {
                this.currentLang = 'en';
                localStorage.setItem(STORAGE_LANG_KEY, 'en');
            }
        } catch (e) {
            this.currentLang = 'en';
        }

        this.translations = TRANSLATIONS;
        this.init();
    }

    init() {
        if (typeof document !== 'undefined') {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.applyToDOM());
            } else {
                this.applyToDOM();
            }
        }
    }

    getLanguage() {
        return this.currentLang;
    }

    setLanguage(lang) {
        if (lang !== 'en' && lang !== 'vi') lang = 'en';
        this.currentLang = lang;
        try {
            localStorage.setItem(STORAGE_LANG_KEY, lang);
        } catch (e) {}

        this.applyToDOM();

        // Dispatch global event for live reactive components
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('teleterm-language-changed', {
                detail: { lang: this.currentLang }
            }));
        }
    }

    toggleLanguage() {
        const next = this.currentLang === 'en' ? 'vi' : 'en';
        this.setLanguage(next);
        return next;
    }

    t(key, params = {}) {
        const dict = this.translations[this.currentLang] || this.translations.en;
        let str = dict[key] || this.translations.en[key] || key;

        if (params && typeof params === 'object') {
            Object.keys(params).forEach(k => {
                str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
            });
        }
        return str;
    }

    applyToDOM() {
        if (typeof document === 'undefined') return;

        // 1. Text elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key) {
                const translated = this.t(key);
                const icon = el.querySelector('.tt-icon');
                if (icon) {
                    // Element contains an SVG icon. Preserve the icon element!
                    const labelSpan = el.querySelector('.tt-btn-label, .tt-nav-label, .tt-label');
                    if (labelSpan) {
                        labelSpan.textContent = translated;
                    } else {
                        // Find direct text node or reconstruct
                        const iconClone = icon.cloneNode(true);
                        el.innerHTML = '';
                        el.appendChild(iconClone);
                        el.appendChild(document.createTextNode(' ' + translated));
                    }
                } else {
                    el.textContent = translated;
                }
            }
        });

        // 2. HTML elements with data-i18n-html
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            if (key) {
                el.innerHTML = this.t(key);
            }
        });

        // 3. Title attributes with data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (key) {
                el.setAttribute('title', this.t(key));
            }
        });

        // 4. Placeholders with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) {
                el.setAttribute('placeholder', this.t(key));
            }
        });

        // 5. Synchronize select boxes
        const langSelect = document.getElementById('gfx-language-select');
        if (langSelect && langSelect.value !== this.currentLang) {
            langSelect.value = this.currentLang;
        }

        // 6. Re-hydrate any newly injected or updated SVG icons
        if (typeof window !== 'undefined' && window.TeleTermIcons && typeof window.TeleTermIcons.hydrate === 'function') {
            window.TeleTermIcons.hydrate(document);
        }
    }
}

export const i18n = new I18nEngine();
if (typeof window !== 'undefined') {
    window.TeleTermI18n = i18n;
}
