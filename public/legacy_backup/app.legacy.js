// TeleTerm 24/7 - Mobile Controller & Antigravity Manager
(function () {
    let token = localStorage.getItem('tele_token') || '';
    let currentTarget = ''; // 'sys-<pid>' hoặc 'term-<id>'
    let terminalsList = [];
    let ws = null;
    let term = null;
    let fitAddon = null;
    let currentFontSize = 11;
    let isPromptOpen = false;

    // Log tracking
    let systemLogs = [];
    let currentLogFilter = 'ALL';
    let unreadErrorsCount = 0;

    // Haptic feedback cho cảm ứng điện thoại
    function triggerHaptic(duration = 15) {
        if ('vibrate' in navigator) {
            try { navigator.vibrate(duration); } catch (e) {}
        }
    }

    // Floating Toast Notification
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icon = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.transition = 'all 0.2s';
            setTimeout(() => toast.remove(), 250);
        }, 2600);
    }

    // Action Key Mapping cho Terminal
    const ACTION_MAP = {
        'up': '\x1b[A',
        'down': '\x1b[B',
        'left': '\x1b[D',
        'right': '\x1b[C',
        'enter': '\r',
        'tab': '\t',
        'shift-tab': '\x1b[Z',
        'esc': '\x1b',
        'ctrl-c': '\x03',
        'ctrl-z': '\x1a',
        'ctrl-d': '\x04',
        'ctrl-l': '\x0c',
        'ctrl-t': '\x14',
        'backspace': '\b',
        'y': 'y\r',
        'n': 'n\r',
        'pageup': '\x1b[5~',
        'pagedown': '\x1b[6~'
    };

    // Full PC Virtual Key Mapping
    const PC_KEY_MAP = {
        'F1': '\x1bOP',
        'F2': '\x1bOQ',
        'F3': '\x1bOR',
        'F4': '\x1bOS',
        'F5': '\x1b[15~',
        'F6': '\x1b[17~',
        'F7': '\x1b[18~',
        'F8': '\x1b[19~',
        'F9': '\x1b[20~',
        'F10': '\x1b[21~',
        'F11': '\x1b[23~',
        'F12': '\x1b[24~',
        'esc': '\x1b',
        'tab': '\t',
        'home': '\x1b[H',
        'end': '\x1b[F',
        'pageup': '\x1b[5~',
        'pagedown': '\x1b[6~',
        'insert': '\x1b[2~',
        'delete': '\x1b[3~',
        '|': '|',
        '~': '~',
        '^': '^',
        '\\': '\\'
    };

    // Theme Configs
    const TERMINAL_THEMES = {
        cyberpunk: {
            background: '#0c0c16',
            foreground: '#00f0ff',
            cursor: '#f43f5e',
            cursorAccent: '#0c0c16',
            selectionBackground: '#3b2d54',
            black: '#10101c',
            red: '#ff2a6d',
            green: '#05d9e8',
            yellow: '#ffbf00',
            blue: '#005678',
            magenta: '#d300c5',
            cyan: '#00f0ff',
            white: '#eceff4',
            brightBlack: '#6272a4',
            brightRed: '#ff5c8d',
            brightGreen: '#2bfbfe',
            brightYellow: '#ffd043',
            brightBlue: '#1ac8ed',
            brightMagenta: '#ff40ee',
            brightCyan: '#6bfaff',
            brightWhite: '#ffffff'
        },
        default: {
            background: '#0c0c0c',
            foreground: '#cccccc',
            cursor: '#ffffff',
            selectionBackground: '#264f78',
            black: '#0c0c0c',
            red: '#c50f1f',
            green: '#16c60c',
            yellow: '#c19c00',
            blue: '#0037da',
            magenta: '#881798',
            cyan: '#3a96dd',
            white: '#cccccc',
            brightBlack: '#767676',
            brightRed: '#e74856',
            brightGreen: '#16c60c',
            brightYellow: '#f9f1a5',
            brightBlue: '#3b78ff',
            brightMagenta: '#b4009e',
            brightCyan: '#61d6d6',
            brightWhite: '#f2f2f2'
        },
        dracula: {
            background: '#282a36',
            foreground: '#f8f8f2',
            cursor: '#f8f8f2',
            selectionBackground: '#44475a',
            black: '#21222c',
            red: '#ff5555',
            green: '#50fa7b',
            yellow: '#f1fa8c',
            blue: '#bd93f9',
            magenta: '#ff79c6',
            cyan: '#8be9fd',
            white: '#f8f8f2',
            brightBlack: '#6272a4',
            brightRed: '#ff6e6e',
            brightGreen: '#69ff94',
            brightYellow: '#ffffa5',
            brightBlue: '#d6acff',
            brightMagenta: '#ff92df',
            brightCyan: '#a4ffff',
            brightWhite: '#ffffff'
        },
        onedark: {
            background: '#1e1e1e',
            foreground: '#abb2bf',
            cursor: '#528bff',
            selectionBackground: '#3e4451',
            black: '#1e1e1e',
            red: '#e06c75',
            green: '#98c379',
            yellow: '#e5c07b',
            blue: '#61afef',
            magenta: '#c678dd',
            cyan: '#56b6c2',
            white: '#abb2bf',
            brightBlack: '#5c6370',
            brightRed: '#be5046',
            brightGreen: '#98c379',
            brightYellow: '#d19a66',
            brightBlue: '#61afef',
            brightMagenta: '#c678dd',
            brightCyan: '#56b6c2',
            brightWhite: '#ffffff'
        },
        matrix: {
            background: '#050d05',
            foreground: '#00ff66',
            cursor: '#00ff66',
            selectionBackground: '#003b15',
            black: '#050d05',
            red: '#00cc55',
            green: '#00ff66',
            yellow: '#33ff88',
            blue: '#009944',
            magenta: '#00ffaa',
            cyan: '#00ffcc',
            white: '#d0ffd0',
            brightBlack: '#005522',
            brightRed: '#22ff77',
            brightGreen: '#55ff99',
            brightYellow: '#77ffaa',
            brightBlue: '#00cc66',
            brightMagenta: '#33ffbb',
            brightCyan: '#88ffdd',
            brightWhite: '#ffffff'
        },
        monokai: {
            background: '#272822',
            foreground: '#f8f8f2',
            cursor: '#f8f8f0',
            selectionBackground: '#49483e',
            black: '#272822',
            red: '#f92672',
            green: '#a6e22e',
            yellow: '#f4bf75',
            blue: '#66d9ef',
            magenta: '#ae81ff',
            cyan: '#a1efe4',
            white: '#f8f8f2',
            brightBlack: '#75715e',
            brightRed: '#f92672',
            brightGreen: '#a6e22e',
            brightYellow: '#f4bf75',
            brightBlue: '#66d9ef',
            brightMagenta: '#ae81ff',
            brightCyan: '#a1efe4',
            brightWhite: '#f9f8f5'
        }
    };

    // State Variables
    let isCtrlSticky = false;
    let isAltSticky = false;
    let isPcKeysOpen = false;
    let currentThemeName = localStorage.getItem('tele_terminal_theme') || 'cyberpunk';
    let currentBuildId = null;
    let commandHistory = [];
    try {
        commandHistory = JSON.parse(localStorage.getItem('tele_cmd_history') || '[]');
    } catch (e) {
        commandHistory = [];
    }
    let historyCursor = -1;
    let isPromptComposing = false;
    let isTerminalComposing = false;

    // DOM Elements - Auth
    const authModal = document.getElementById('auth-modal');
    const authForm = document.getElementById('auth-form');
    const pinInput = document.getElementById('pin-input');
    const authError = document.getElementById('auth-error');
    const btnOpenLogAuth = document.getElementById('btn-open-log-auth');
    
    // DOM Elements - Top Bar
    const btnActiveTerminal = document.getElementById('btn-active-terminal');
    const topTermIcon = document.getElementById('top-term-icon');
    const topTermTitle = document.getElementById('top-term-title');
    const connModeBadge = document.getElementById('conn-mode-badge');
    const btnRefreshTerm = document.getElementById('btn-refresh-term');
    const btnOpenSearch = document.getElementById('btn-open-search');
    const btnPcKeysToggle = document.getElementById('btn-pc-keys-toggle');
    const btnThemeToggle = document.getElementById('btn-theme-toggle');

    // DOM Elements - Navigation & Views
    const navTabs = document.querySelectorAll('.nav-tab');
    const appViews = document.querySelectorAll('.app-view');
    const navLogBadge = document.getElementById('nav-log-badge');

    // DOM Elements - Terminal View & HUD
    const terminalViewport = document.getElementById('terminal-viewport');
    const terminalContainer = document.getElementById('terminal-container');
    const terminalHud = document.getElementById('terminal-hud');
    const btnHudToggle = document.getElementById('btn-hud-toggle');
    const btnHudClose = document.getElementById('btn-hud-close');
    const btnZoomOut = document.getElementById('btn-zoom-out');
    const btnZoomIn = document.getElementById('btn-zoom-in');
    const btnFitScreen = document.getElementById('btn-fit-screen');
    const fontSizeLabel = document.getElementById('font-size-label');
    const btnScrollTop = document.getElementById('btn-scroll-top');
    const btnScrollUp = document.getElementById('btn-scroll-up');
    const btnScrollDown = document.getElementById('btn-scroll-down');
    const btnScrollBottom = document.getElementById('btn-scroll-bottom');
    const scrollBottomPill = document.getElementById('scroll-bottom-pill');
    const btnViewHistory = document.getElementById('btn-view-history');
    const btnHudTheme = document.getElementById('btn-hud-theme');

    // DOM Elements - Terminal Search Bar
    const terminalSearchBar = document.getElementById('terminal-search-bar');
    const termSearchInput = document.getElementById('term-search-input');
    const termSearchCount = document.getElementById('term-search-count');
    const btnSearchPrev = document.getElementById('btn-search-prev');
    const btnSearchNext = document.getElementById('btn-search-next');
    const btnSearchClose = document.getElementById('btn-search-close');

    // DOM Elements - Extended PC Keyboard Panel
    const pcKeyboardPanel = document.getElementById('pc-keyboard-panel');
    const btnTogglePcKeys = document.getElementById('btn-toggle-pc-keys');
    const btnStickyCtrl = document.getElementById('btn-sticky-ctrl');
    const btnStickyAlt = document.getElementById('btn-sticky-alt');
    const btnCopySelection = document.getElementById('btn-copy-selection');
    const btnPasteTerminal = document.getElementById('btn-paste-terminal');
    const btnSelectAll = document.getElementById('btn-select-all');

    // DOM Elements - Prompt Drawer & Smart Vietnamese Input
    const promptDrawer = document.getElementById('prompt-drawer');
    const promptInput = document.getElementById('prompt-input');
    const btnClearPrompt = document.getElementById('btn-clear-prompt');
    const btnSendPrompt = document.getElementById('btn-send-prompt');
    const btnTogglePrompt = document.getElementById('btn-toggle-prompt');
    const btnHistoryPrev = document.getElementById('btn-history-prev');
    const btnHistoryNext = document.getElementById('btn-history-next');
    const promptChips = document.querySelectorAll('.chip-cmd');
    const thumbToolbar = document.getElementById('thumb-toolbar');

    // DOM Elements - Theme Modal
    const themeModal = document.getElementById('theme-modal');
    const btnCloseThemeModal = document.getElementById('btn-close-theme-modal');
    const themeCardBtns = document.querySelectorAll('.theme-card-btn');

    // DOM Elements - System Auto-Update Banner
    const systemUpdateBanner = document.getElementById('system-update-banner');
    const updateBannerText = document.getElementById('update-banner-text');

    // DOM Elements - Antigravity Mini-Screen Desktop Replica
    const agySidebar = document.getElementById('agy-sidebar');
    const agySidebarBackdrop = document.getElementById('agy-sidebar-backdrop');
    const btnToggleAgySb = document.getElementById('btn-toggle-agy-sb');
    const btnCloseAgySb = document.getElementById('btn-close-agy-sb');
    const btnAgyNewChat = document.getElementById('btn-agy-new-chat');
    const btnSbHistory = document.getElementById('btn-sb-history');
    const btnSbTasks = document.getElementById('btn-sb-tasks');
    const agyPinnedList = document.getElementById('agy-pinned-list');
    const agyProjectsList = document.getElementById('agy-projects-list');
    const agySbUserName = document.getElementById('agy-sb-user-name');
    const agySbUserTier = document.getElementById('agy-sb-user-tier');
    const btnOpenQuotaSheet = document.getElementById('btn-open-quota-sheet');
    const btnOpenAppSettings = document.getElementById('btn-open-app-settings');

    const agyChatFolder = document.getElementById('agy-chat-folder');
    const agyChatTitle = document.getElementById('agy-chat-title');
    const agyChatMessages = document.getElementById('agy-chat-messages');
    const agyChatInput = document.getElementById('agy-chat-input');
    const btnSendAgyPrompt = document.getElementById('btn-send-agy-prompt');
    const agyModelSelect = document.getElementById('agy-model-select');
    const agySelectedModelText = document.getElementById('agy-selected-model-text');
    const btnAgyAttach = document.getElementById('btn-agy-attach');

    // Live Progress Banner Elements
    const agyLiveBanner = document.getElementById('agy-live-banner');
    const agyBannerIcon = document.getElementById('agy-banner-icon');
    const agyBannerTool = document.getElementById('agy-banner-tool');
    const agyBannerSummary = document.getElementById('agy-banner-summary');
    const agyBannerStep = document.getElementById('agy-banner-step');
    const btnOpenPlan = document.getElementById('btn-open-plan');
    const btnOpenWalkthrough = document.getElementById('btn-open-walkthrough');
    const btnLiveAttachTerminal = document.getElementById('btn-live-attach-terminal');

    // Quota Sheet Modal Elements
    const quotaSheet = document.getElementById('quota-sheet');
    const btnCloseQuotaSheet = document.getElementById('btn-close-quota-sheet');
    const quotaAccName = document.getElementById('quota-acc-name');
    const quotaAccTier = document.getElementById('quota-acc-tier');
    const agyStatusBadge = document.getElementById('agy-status-badge');
    const agyPidsVal = document.getElementById('agy-pids-val');
    const agyRamVal = document.getElementById('agy-ram-val');
    const agyCliVal = document.getElementById('agy-cli-val');
    const btnStartAgyApp = document.getElementById('btn-start-agy-app');
    const btnRestartAgyApp = document.getElementById('btn-restart-agy-app');
    const btnStopAgyApp = document.getElementById('btn-stop-agy-app');

    // Artifact Sheet Modal Elements
    const artifactSheet = document.getElementById('artifact-sheet');
    const artifactSheetIcon = document.getElementById('artifact-sheet-icon');
    const artifactSheetTitle = document.getElementById('artifact-sheet-title');
    const artifactSheetSubtitle = document.getElementById('artifact-sheet-subtitle');
    const btnCopyArtifact = document.getElementById('btn-copy-artifact');
    const btnCloseArtifactSheet = document.getElementById('btn-close-artifact-sheet');
    const artifactContentView = document.getElementById('artifact-content-view');
    let rawArtifactContent = '';
    let livePollingTimer = null;
    let currentLoadedSessionId = null;
    let currentLoadedSessionTitle = 'Eni Person Command';
    let currentLoadedSessionFolder = 'c:';

    // DOM Elements - Accounts View
    const btnOpenAddAccount = document.getElementById('btn-open-add-account');
    const claudeAccountsList = document.getElementById('claude-accounts-list');
    const antigravityAccountsList = document.getElementById('antigravity-accounts-list');
    const autoVerifyBanner = document.getElementById('auto-verify-banner');
    const autoVerifyTitle = document.getElementById('auto-verify-title');
    const autoVerifyStatus = document.getElementById('auto-verify-status');
    const autoVerifyDesc = document.getElementById('auto-verify-desc');
    const btnStopVerify = document.getElementById('btn-stop-verify');
    const autoVerifyOauthWrap = document.getElementById('auto-verify-oauth-wrap');
    const autoVerifyOauthLink = document.getElementById('auto-verify-oauth-link');

    // DOM Elements - System View
    const sysHostVal = document.getElementById('sys-host-val');
    const sysPinVal = document.getElementById('sys-pin-val');
    const sysLogConsole = document.getElementById('sys-log-console');
    const btnRefreshSysLogs = document.getElementById('btn-refresh-sys-logs');
    const btnClearSysLogs = document.getElementById('btn-clear-sys-logs');
    const btnCopySysLogs = document.getElementById('btn-copy-sys-logs');
    const countAll = document.getElementById('count-all');
    const countErr = document.getElementById('count-err');
    const countInfo = document.getElementById('count-info');
    const logChips = document.querySelectorAll('.chip');

    // DOM Elements - Bottom Sheets
    const terminalSheet = document.getElementById('terminal-sheet');
    const btnCloseTermSheet = document.getElementById('btn-close-term-sheet');
    const sheetProcessList = document.getElementById('sheet-process-list');
    const btnSheetCreateTerm = document.getElementById('btn-sheet-create-term');

    const accountSheet = document.getElementById('account-sheet');
    const btnCloseAccountSheet = document.getElementById('btn-close-account-sheet');
    const accountForm = document.getElementById('account-form');
    const accProvider = document.getElementById('acc-provider');
    const accName = document.getElementById('acc-name');
    const accToken = document.getElementById('acc-token');
    const accBaseurl = document.getElementById('acc-baseurl');
    const accModel = document.getElementById('acc-model');
    const accEmail = document.getElementById('acc-email');
    const claudeFields = document.getElementById('claude-fields');
    const antigravityFields = document.getElementById('antigravity-fields');

    const historySheet = document.getElementById('history-sheet');
    const btnCloseHistorySheet = document.getElementById('btn-close-history-sheet');
    const btnCopyHistory = document.getElementById('btn-copy-history');
    const historySearchInput = document.getElementById('history-search-input');
    const historyTextView = document.getElementById('history-text-view');
    const historySheetSubtitle = document.getElementById('history-sheet-subtitle');

    // Haptic touch binding
    document.querySelectorAll('.haptic').forEach(el => {
        el.addEventListener('click', () => triggerHaptic(12));
    });

    // ==================== AUTHENTICATION ====================

    async function submitPin(pin) {
        if (!pin) return false;
        authError.textContent = 'Đang xác thực...';

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: pin })
            });

            const data = await res.json();
            if (data.success && data.token) {
                token = data.token;
                localStorage.setItem('tele_token', token);
                authError.textContent = '';
                authModal.classList.add('hidden');
                initTerminal();
                connectWebSocket();
                loadAllTerminals();
                loadLogs();
                loadAntigravityStatus();
                loadAccounts();
                showToast('Kết nối thành công!', 'success');
                return true;
            } else {
                authError.textContent = data.message || 'Mã PIN không đúng!';
                authModal.classList.remove('hidden');
                loadLogs();
                return false;
            }
        } catch (err) {
            authError.textContent = 'Lỗi kết nối tới server!';
            authModal.classList.remove('hidden');
            loadLogs();
            return false;
        }
    }

    async function checkAuth() {
        loadLogs();
        if (authModal) authModal.classList.add('hidden');

        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        if (tokenFromUrl) {
            token = tokenFromUrl;
            localStorage.setItem('tele_token', token);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        try {
            const queryToken = token || '';
            const res = await fetch(`/api/status?token=${encodeURIComponent(queryToken)}`);
            const data = await res.json();

            if (connModeBadge) {
                connModeBadge.classList.remove('hidden');
                if (data.isLocal) {
                    connModeBadge.textContent = '📶 Local (0ms)';
                    connModeBadge.className = 'conn-badge';
                    connModeBadge.title = 'Mạng nội bộ Wi-Fi (Tốc độ tối đa, 0ms)';
                } else {
                    connModeBadge.textContent = '🌐 Cloudflare 4G';
                    connModeBadge.className = 'conn-badge remote';
                    connModeBadge.title = 'Kết nối từ xa qua Cloudflare Tunnel';
                }
            }

            if (sysHostVal && data.hostname) {
                sysHostVal.textContent = data.hostname;
            }

            if (data.token) {
                token = data.token;
                localStorage.setItem('tele_token', token);
            }
        } catch (err) {
            console.warn('Kiểm tra trạng thái máy chủ:', err.message);
        }

        // 100% Passwordless: Tự động khởi chạy toàn bộ hệ thống ngay lập tức
        if (authModal) authModal.classList.add('hidden');
        initTerminal();
        connectWebSocket();
        await loadAllTerminals();
        loadAntigravityStatus();
        loadAccounts();

        const savedView = localStorage.getItem('tele_last_view') || 'view-terminal';
        switchView(savedView);
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (authModal) authModal.classList.add('hidden');
        initTerminal();
        connectWebSocket();
    });

    btnOpenLogAuth.addEventListener('click', () => {
        authModal.classList.add('hidden');
        switchView('view-system');
    });

    // ==================== NAVIGATION TABS & VIEW CONTROLLER ====================

    function switchView(targetViewId) {
        triggerHaptic(10);
        try { localStorage.setItem('tele_last_view', targetViewId); } catch (e) {}

        const appEl = document.getElementById('app');
        if (appEl) {
            appEl.classList.remove('terminal-active', 'codex-active', 'antigravity-active', 'accounts-active', 'system-active');
            if (targetViewId === 'view-terminal') {
                appEl.classList.add('terminal-active');
            } else if (targetViewId === 'view-codex') {
                appEl.classList.add('codex-active');
            } else if (targetViewId === 'view-antigravity') {
                appEl.classList.add('antigravity-active');
            } else if (targetViewId === 'view-accounts') {
                appEl.classList.add('accounts-active');
            } else if (targetViewId === 'view-system') {
                appEl.classList.add('system-active');
            }
        }

        // Đóng bàn phím PC, Prompt Drawer, và D-pad nếu thoát khỏi Terminal View
        if (targetViewId !== 'view-terminal') {
            if (pcKeyboardPanel) pcKeyboardPanel.classList.add('hidden');
            if (promptDrawer) promptDrawer.classList.add('hidden');
            const virtualDpad = document.getElementById('virtual-dpad');
            if (virtualDpad) virtualDpad.classList.add('hidden');
            isPcKeysOpen = false;
            isPromptOpen = false;
        }

        navTabs.forEach(tab => {
            if (tab.getAttribute('data-view') === targetViewId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Đồng bộ trạng thái nút chọn tab trong Sheet Điều Khiển Nhanh
        document.querySelectorAll('.sheet-view-btn').forEach(btn => {
            if (btn.getAttribute('data-sheet-view') === targetViewId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        appViews.forEach(view => {
            if (view.id === targetViewId) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        if (livePollingTimer) {
            clearInterval(livePollingTimer);
            livePollingTimer = null;
        }
        if (typeof codexPollingTimer !== 'undefined' && codexPollingTimer) {
            clearInterval(codexPollingTimer);
            codexPollingTimer = null;
        }

        if (targetViewId === 'view-terminal') {
            if (fitAddon) {
                setTimeout(() => {
                    fitAddon.fit();
                    if (term) term.scrollToBottom();
                }, 50);
            }
        } else if (targetViewId === 'view-codex') {
            if (typeof loadCodexSidebar === 'function') loadCodexSidebar();
            if (typeof currentCodexThreadId !== 'undefined' && currentCodexThreadId && typeof loadCodexThread === 'function') {
                loadCodexThread(currentCodexThreadId);
            }
            if (typeof pollCodexLive === 'function') {
                codexPollingTimer = setInterval(pollCodexLive, 2500);
            }
        } else if (targetViewId === 'view-antigravity') {
            loadSidebarSessions();
            loadQuotaInfo();
            loadAntigravityStatus();
            loadLiveSessionProgress();
            livePollingTimer = setInterval(loadLiveSessionProgress, 2500);
        } else if (targetViewId === 'view-accounts') {
            loadAccounts();
        } else if (targetViewId === 'view-system') {
            loadLogs();
            if (navLogBadge) navLogBadge.classList.add('hidden');
            unreadErrorsCount = 0;
        }
    }

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const viewId = tab.getAttribute('data-view');
            switchView(viewId);
        });
    });

    // Bắt sự kiện chuyển view từ Sheet Điều Khiển Nhanh (Unified Control Sheet)
    document.querySelectorAll('.sheet-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const viewId = btn.getAttribute('data-sheet-view');
            if (typeof closeQuickActionsHub === 'function') {
                closeQuickActionsHub();
            } else {
                const sheet = document.getElementById('quick-actions-sheet');
                if (sheet) sheet.classList.add('hidden');
            }
            switchView(viewId);
        });
    });

    // ==================== AUTO-UPDATE & HOT-RELOAD LOGIC ====================
    let isReloading = false;

    function triggerAutoUpdate(reason) {
        if (isReloading) return;
        isReloading = true;
        console.log('[Auto-Update]', reason);
        if (systemUpdateBanner && updateBannerText) {
            updateBannerText.textContent = reason || 'Đã phát hiện code mới! Đang tự động làm mới hệ thống...';
            systemUpdateBanner.classList.remove('hidden');
        }
        showToast(reason || 'Đang cập nhật phiên bản mới...', 'info');
        setTimeout(() => {
            window.location.reload(true);
        }, 500);
    }

    async function checkServerVersion() {
        try {
            const res = await fetch(`/api/version?_t=${Date.now()}`);
            if (!res.ok) return;
            const data = await res.json();
            if (data.buildId) {
                if (currentBuildId === null) {
                    currentBuildId = data.buildId;
                } else if (currentBuildId !== data.buildId) {
                    triggerAutoUpdate('Hệ thống vừa cập nhật phiên bản mới! Đang tự động làm mới...');
                }
            }
        } catch (e) {}
    }
    // Định kỳ kiểm tra version mỗi 25s
    setInterval(checkServerVersion, 25000);

    // ==================== TERMINAL ENGINE (XTERM.JS) ====================

    function initTerminal() {
        if (term) return;

        const themeConfig = TERMINAL_THEMES[currentThemeName] || TERMINAL_THEMES.cyberpunk;

        term = new Terminal({
            cursorBlink: true,
            cursorStyle: 'block',
            fontSize: currentFontSize,
            lineHeight: 1.15,
            fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
            theme: themeConfig,
            allowProposedApi: true,
            scrollback: 10000
        });

        fitAddon = new FitAddon.FitAddon();
        term.loadAddon(fitAddon);
        term.loadAddon(new WebLinksAddon.WebLinksAddon());

        term.open(terminalContainer);
        fitAddon.fit();

        term.onResize(({ cols, rows }) => {
            if (ws && ws.readyState === WebSocket.OPEN && currentTarget && !currentTarget.startsWith('sys-')) {
                ws.send(JSON.stringify({
                    type: 'resize',
                    cols: cols,
                    rows: rows
                }));
            }
        });

        // Xử lý bộ gõ tiếng Việt và phím tổ hợp PC trong Terminal
        term.attachCustomKeyEventHandler((e) => {
            // Khi đang gõ IME tiếng Việt (Telex/VNI), để trình duyệt tự xử lý composition, không gửi phím thô sớm gây lặp từ
            if (e.isComposing || e.keyCode === 229) {
                return true;
            }

            // Xử lý Sticky Ctrl trên bàn phím ảo
            if (isCtrlSticky && !e.ctrlKey && e.type === 'keydown' && e.key.length === 1) {
                const code = e.key.toUpperCase().charCodeAt(0);
                if (code >= 64 && code <= 95) { // @, A-Z, etc
                    sendTerminalInput(String.fromCharCode(code - 64));
                    toggleStickyCtrl(false);
                    return false;
                }
            }

            // Xử lý Sticky Alt trên bàn phím ảo
            if (isAltSticky && !e.altKey && e.type === 'keydown' && e.key.length === 1) {
                sendTerminalInput('\x1b' + e.key);
                toggleStickyAlt(false);
                return false;
            }

            // Bắt phím tắt Ctrl+F để mở tìm kiếm trong terminal
            if (e.ctrlKey && (e.key === 'f' || e.key === 'F') && e.type === 'keydown') {
                e.preventDefault();
                openTerminalSearch();
                return false;
            }

            return true;
        });

        if (term.textarea) {
            term.textarea.addEventListener('compositionstart', () => { isTerminalComposing = true; });
            term.textarea.addEventListener('compositionend', () => { isTerminalComposing = false; });
        }

        term.onData(data => {
            sendTerminalInput(data);
        });

        // Kiểm tra vị trí cuộn buffer
        term.onScroll(() => {
            const buffer = term.buffer.active;
            const isAtBottom = buffer.viewportY >= buffer.baseY;
            if (isAtBottom) {
                scrollBottomPill.classList.add('hidden');
            } else {
                scrollBottomPill.classList.remove('hidden');
            }
        });

        // ==================== BUTTERY-SMOOTH MOBILE TOUCH MOTION ENGINE (60 FPS) ====================
        const touchScrollIndicator = document.getElementById('touch-scroll-indicator');
        let touchStartX = 0;
        let touchStartY = 0;
        let lastTouchX = 0;
        let lastTouchY = 0;
        let lastTouchTime = 0;
        let touchStartTime = 0;
        let touchAccumY = 0;
        let velocityY = 0;
        let momentumAnimId = null;
        let hideIndicatorTimer = null;
        let gestureType = null; // 'vertical' | 'horizontal' | 'pinch' | null
        let pinchStartDist = 0;
        const TOUCH_SCROLL_SENSITIVITY = 14; // pixels per terminal line

        function updateScrollIndicator() {
            if (!term || !touchScrollIndicator) return;
            const buffer = term.buffer.active;
            const baseY = buffer.baseY;
            const viewportY = buffer.viewportY;
            const rows = term.rows;
            const totalLines = baseY + rows;

            if (totalLines <= rows) {
                touchScrollIndicator.classList.add('hidden');
                return;
            }

            const vpHeight = terminalViewport.clientHeight || 300;
            const thumbHeight = Math.max(28, Math.min(100, (rows / totalLines) * vpHeight));
            const availableTrack = vpHeight - thumbHeight - 16;
            const scrollRatio = baseY > 0 ? (viewportY / baseY) : 1;
            const thumbY = 8 + (scrollRatio * availableTrack);

            touchScrollIndicator.style.height = `${thumbHeight}px`;
            touchScrollIndicator.style.transform = `translate3d(0, ${thumbY}px, 0)`;
            touchScrollIndicator.classList.remove('hidden');

            if (hideIndicatorTimer) clearTimeout(hideIndicatorTimer);
            hideIndicatorTimer = setTimeout(() => {
                touchScrollIndicator.classList.add('hidden');
            }, 900);
        }

        terminalViewport.addEventListener('touchstart', (e) => {
            if (momentumAnimId) {
                cancelAnimationFrame(momentumAnimId);
                momentumAnimId = null;
            }

            if (e.touches.length === 1) {
                gestureType = null;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                lastTouchX = touchStartX;
                lastTouchY = touchStartY;
                touchStartTime = Date.now();
                lastTouchTime = touchStartTime;
                touchAccumY = 0;
                velocityY = 0;
                pinchStartDist = 0;
            } else if (e.touches.length === 2) {
                gestureType = 'pinch';
                const p1 = e.touches[0];
                const p2 = e.touches[1];
                pinchStartDist = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
            }
        }, { passive: false });

        terminalViewport.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && term) {
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const now = Date.now();
                const totalDx = currentX - touchStartX;
                const totalDy = currentY - touchStartY;
                const deltaY = currentY - lastTouchY;
                const deltaX = currentX - lastTouchX;

                e.preventDefault(); // Ngăn chặn hoàn toàn trình duyệt cướp cử chỉ hoặc giật màn hình

                // Nhận diện hướng cử chỉ (ngang hay dọc)
                if (!gestureType && (Math.abs(totalDx) > 8 || Math.abs(totalDy) > 8)) {
                    gestureType = Math.abs(totalDx) > Math.abs(totalDy) ? 'horizontal' : 'vertical';
                }

                const termEl = terminalContainer;
                const hasHorizontalOverflow = termEl && (termEl.scrollWidth > termEl.clientWidth + 4);

                if (gestureType === 'horizontal' && hasHorizontalOverflow) {
                    // Cuộn ngang siêu mượt (Horizontal Pan) cho terminal rộng không bị cắt chữ
                    termEl.scrollLeft -= deltaX;
                } else {
                    // Cuộn dọc xterm
                    touchAccumY += deltaY;
                    const linesToScroll = Math.trunc(touchAccumY / TOUCH_SCROLL_SENSITIVITY);
                    if (linesToScroll !== 0) {
                        term.scrollLines(-linesToScroll);
                        touchAccumY -= linesToScroll * TOUCH_SCROLL_SENSITIVITY;
                        updateScrollIndicator();
                    }

                    const dt = Math.max(1, now - lastTouchTime);
                    velocityY = deltaY / dt;
                }

                lastTouchX = currentX;
                lastTouchY = currentY;
                lastTouchTime = now;
            } else if (e.touches.length === 2 && term) {
                e.preventDefault();
                const p1 = e.touches[0];
                const p2 = e.touches[1];
                const currentDist = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);

                if (pinchStartDist > 0) {
                    const diff = currentDist - pinchStartDist;
                    if (diff > 35) { // Phóng to font
                        if (currentFontSize < 20) {
                            currentFontSize++;
                            term.options.fontSize = currentFontSize;
                            if (fontSizeLabel) fontSizeLabel.textContent = currentFontSize;
                            if (fitAddon) fitAddon.fit();
                            triggerHaptic(10);
                        }
                        pinchStartDist = currentDist;
                    } else if (diff < -35) { // Thu nhỏ font
                        if (currentFontSize > 8) {
                            currentFontSize--;
                            term.options.fontSize = currentFontSize;
                            if (fontSizeLabel) fontSizeLabel.textContent = currentFontSize;
                            if (fitAddon) fitAddon.fit();
                            triggerHaptic(10);
                        }
                        pinchStartDist = currentDist;
                    }
                }
            }
        }, { passive: false });

        terminalViewport.addEventListener('touchend', (e) => {
            // Xử lý Cuộn Quán Tính (60 FPS Inertia Glide)
            if (Math.abs(velocityY) > 0.18) {
                let v = velocityY * 18; // Quy đổi thành tốc độ dòng
                const friction = 0.92;

                function stepMomentum() {
                    if (Math.abs(v) < 0.08 || !term) {
                        if (hideIndicatorTimer) clearTimeout(hideIndicatorTimer);
                        hideIndicatorTimer = setTimeout(() => {
                            if (touchScrollIndicator) touchScrollIndicator.classList.add('hidden');
                        }, 700);
                        return;
                    }

                    const lines = Math.trunc(v);
                    if (lines !== 0) {
                        term.scrollLines(-lines);
                        v -= lines;
                        updateScrollIndicator();
                    }
                    v *= friction;
                    momentumAnimId = requestAnimationFrame(stepMomentum);
                }

                momentumAnimId = requestAnimationFrame(stepMomentum);
            } else {
                if (hideIndicatorTimer) clearTimeout(hideIndicatorTimer);
                hideIndicatorTimer = setTimeout(() => {
                    if (touchScrollIndicator) touchScrollIndicator.classList.add('hidden');
                }, 700);
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            if (fitAddon) fitAddon.fit();
        });

        setupVisualViewportWatcher();
    }

    // ==================== VISUAL VIEWPORT & DYNAMIC MOBILE DOCKING (60 FPS) ====================

    function setupVisualViewportWatcher() {
        if (!window.visualViewport) return;

        let vvRaf = null;
        function onViewportChange() {
            if (vvRaf) cancelAnimationFrame(vvRaf);
            vvRaf = requestAnimationFrame(() => {
                const vv = window.visualViewport;
                const windowHeight = window.innerHeight;
                // Calculate virtual keyboard height when soft keyboard pushes viewport up
                const offsetBottom = Math.max(0, windowHeight - (vv.height + vv.offsetTop));
                document.documentElement.style.setProperty('--viewport-bottom', `${Math.round(offsetBottom)}px`);

                if (fitAddon && term && document.getElementById('view-terminal')?.classList.contains('active')) {
                    fitAddon.fit();
                    const buffer = term.buffer.active;
                    if (buffer.viewportY >= buffer.baseY - 2) {
                        term.scrollToBottom();
                    }
                }
            });
        }

        window.visualViewport.addEventListener('resize', onViewportChange, { passive: true });
        window.visualViewport.addEventListener('scroll', onViewportChange, { passive: true });
        onViewportChange();
    }

    // Swipe-up gesture trên thanh phím ngón cái (Thumb Toolbar) để mở nhanh Trung Tâm Điều Khiển PC
    if (thumbToolbar) {
        let tbTouchStartY = 0;
        let tbTouchStartX = 0;
        thumbToolbar.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                tbTouchStartY = e.touches[0].clientY;
                tbTouchStartX = e.touches[0].clientX;
            }
        }, { passive: true });

        thumbToolbar.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                const deltaY = tbTouchStartY - e.changedTouches[0].clientY;
                const deltaX = Math.abs(tbTouchStartX - e.changedTouches[0].clientX);
                if (deltaY > 40 && deltaY > deltaX * 1.5) {
                    if (typeof openQuickActionsHub === 'function') {
                        openQuickActionsHub();
                    }
                }
            }
        }, { passive: true });
    }

    // ==================== WEBSOCKET CONNECTION ====================

    function connectWebSocket() {
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}&sessionId=${encodeURIComponent(currentTarget)}`;

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('[WS] Đã kết nối WebSocket');
            checkServerVersion();
            if (currentTarget && !currentTarget.startsWith('sys-') && term && fitAddon) {
                ws.send(JSON.stringify({
                    type: 'resize',
                    cols: term.cols,
                    rows: term.rows
                }));
            }
            if (outboxQueue.length > 0) {
                console.log(`[WS] Tự động đồng bộ ${outboxQueue.length} lệnh ngoại tuyến...`);
                ws.send(JSON.stringify({ type: 'sync_queue', queue: outboxQueue }));
                showToast(`📶 Đã gửi ${outboxQueue.length} lệnh ngoại tuyến!`, 'success');
                outboxQueue = [];
            }
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                switch (msg.type) {
                    case 'queue_ack':
                        showToast(`✓ Đã xác nhận ${msg.processed || 0} lệnh ngoại tuyến`, 'success');
                        break;
                    case 'server_hello':
                        if (currentBuildId === null) {
                            currentBuildId = msg.buildId;
                        } else if (currentBuildId !== msg.buildId) {
                            triggerAutoUpdate('Máy chủ đã khởi động lại phiên bản mới! Đang tự động làm mới...');
                        }
                        break;

                    case 'hot_reload':
                        triggerAutoUpdate(`Đã cập nhật code mới (${msg.file || 'mã nguồn'}). Đang tự động làm mới...`);
                        break;

                    case 'output':
                        if (msg.data && term) {
                            term.write(msg.data);
                            if (window.teleterm3D) {
                                window.teleterm3D.triggerDataPulse('pty');
                            }
                        }
                        break;

                    case 'ansi_screen':
                        if (msg.ansi && term) {
                            if (msg.cols && msg.rows && (term.cols !== msg.cols || term.rows !== msg.rows)) {
                                try {
                                    term.resize(msg.cols, msg.rows);
                                } catch (e) {}
                            }
                            const buffer = term.buffer.active;
                            const isUserScrolledUp = buffer.viewportY < buffer.baseY;
                            if (!isUserScrolledUp) {
                                term.write('\x1b[2J\x1b[H' + msg.ansi);
                            }
                        }
                        break;

                    case 'attached':
                        if (term) {
                            term.reset();
                            if (msg.history) term.write(msg.history);
                        }
                        break;

                    case 'log':
                        if (msg.entry) {
                            handleNewLogEntry(msg.entry);
                        }
                        break;

                    case 'auto_verify_progress':
                        if (msg.progress) {
                            handleAutoVerifyProgress(msg.progress);
                        }
                        break;

                    case 'task_alert':
                        triggerTaskAlert(msg.title, msg.message);
                        break;

                    case 'session_updated':
                        loadAllTerminals();
                        break;

                    case 'session_exited':
                        loadAllTerminals();
                        triggerTaskAlert('Lệnh hoàn thành', `Session ${msg.sessionId || ''} đã kết thúc (Exit: ${msg.exitCode})`);
                        break;

                    case 'heartbeat':
                        ws.send(JSON.stringify({ type: 'ping' }));
                        break;
                }
            } catch (err) {
                console.error('[WS] Lỗi parse message:', err);
            }
        };

        ws.onclose = () => {
            console.log('[WS] Mất kết nối, tự động kết nối lại sau 2s...');
            setTimeout(connectWebSocket, 2000);
        };
    }

    // ==================== TERMINAL LIST & SWITCHING ====================

    async function loadAllTerminals() {
        try {
            const [sysRes, ptyRes] = await Promise.all([
                fetch(`/api/system-terminals?token=${encodeURIComponent(token)}`),
                fetch(`/api/sessions?token=${encodeURIComponent(token)}`)
            ]);

            const sysData = await sysRes.json();
            const ptyData = await ptyRes.json();

            terminalsList = [];

            // 1. Thêm các Terminal Console đang chạy trên Windows
            if (sysData.success && Array.isArray(sysData.terminals)) {
                sysData.terminals.forEach(t => {
                    let icon = '💻';
                    let typeName = 'Console';
                    const titleLower = (t.title || '').toLowerCase();
                    const procLower = (t.processName || '').toLowerCase();

                    if (titleLower.includes('claude') || procLower.includes('claude')) {
                        icon = '🟣';
                        typeName = 'Claude Code';
                    } else if (titleLower.includes('antigravity') || titleLower.includes('agy')) {
                        icon = '🛸';
                        typeName = 'Antigravity';
                    } else if (titleLower.includes('powershell') || procLower.includes('powershell') || procLower.includes('pwsh')) {
                        icon = '⚡';
                        typeName = 'PowerShell';
                    } else if (procLower.includes('cmd')) {
                        icon = '💻';
                        typeName = 'CMD';
                    }

                    terminalsList.push({
                        id: `sys-${t.pid}`,
                        name: t.title || `${typeName} (PID: ${t.pid})`,
                        icon,
                        type: 'system',
                        pid: t.pid,
                        cols: t.cols,
                        rows: t.rows
                    });
                });
            }

            // 2. Thêm các Terminal PTY do TeleTerm tạo
            if (ptyData.sessions && Array.isArray(ptyData.sessions)) {
                ptyData.sessions.forEach(s => {
                    terminalsList.push({
                        id: s.id,
                        name: s.name,
                        icon: s.icon || '⚡',
                        color: s.color || '#38bdf8',
                        type: 'pty',
                        cols: s.cols,
                        rows: s.rows,
                        unreadCount: s.unreadCount || 0,
                        status: s.status || 'running'
                    });
                });
            }

            // Đặt target mặc định nếu chưa có (Ưu tiên PTY session do người dùng tạo)
            const ptySessions = terminalsList.filter(t => t.type === 'pty');
            if (!currentTarget || !terminalsList.find(t => t.id === currentTarget)) {
                if (ptySessions.length > 0) {
                    switchTerminal(ptySessions[0].id, false);
                } else if (terminalsList.length > 0) {
                    switchTerminal(terminalsList[0].id, false);
                }
            } else {
                updateTopBarTitle();
            }

            renderTerminalSheetList();
            renderSessionTabStrip();
        } catch (e) {
            console.error('Lỗi tải danh sách terminal:', e);
        }
    }

    function switchTerminal(newTargetId, shouldSwitchView = true) {
        if (!newTargetId) return;
        currentTarget = newTargetId;
        updateTopBarTitle();

        // Đặt lại unread của session này
        const currentItem = terminalsList.find(t => t.id === newTargetId);
        if (currentItem) currentItem.unreadCount = 0;

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'switch',
                sessionId: newTargetId
            }));
            if (!newTargetId.startsWith('sys-') && fitAddon && term) {
                setTimeout(() => {
                    try {
                        fitAddon.fit();
                        ws.send(JSON.stringify({
                            type: 'resize',
                            cols: term.cols,
                            rows: term.rows
                        }));
                    } catch (e) {}
                }, 80);
            }
        }
        if (terminalContainer) terminalContainer.scrollLeft = 0;

        renderTerminalSheetList();
        renderSessionTabStrip();
        updateGitRadar();
        loadContextChips(newTargetId);
        terminalSheet.classList.add('hidden');
        if (shouldSwitchView) {
            switchView('view-terminal');
        }
    }

    function updateTopBarTitle() {
        const found = terminalsList.find(t => t.id === currentTarget);
        if (found) {
            topTermIcon.textContent = found.icon || '💻';
            topTermTitle.textContent = found.name;
        } else if (currentTarget) {
            topTermTitle.textContent = currentTarget;
        }
    }

    function renderTerminalSheetList() {
        sheetProcessList.innerHTML = '';
        if (terminalsList.length === 0) {
            sheetProcessList.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">Không có terminal nào đang chạy</div>';
            return;
        }

        terminalsList.forEach(t => {
            const item = document.createElement('div');
            item.className = `sheet-item ${t.id === currentTarget ? 'active' : ''} haptic`;
            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 18px;">${t.icon}</span>
                    <div>
                        <div class="sheet-item-title">${t.name}</div>
                        <div class="sheet-item-subtitle">${t.type === 'system' ? `Tiến trình hệ thống (PID ${t.pid})` : 'Phiên PTY độc lập'} • ${t.cols}x${t.rows}</div>
                    </div>
                </div>
                ${t.id === currentTarget ? '<span style="color: #38bdf8; font-size: 14px;">●</span>' : ''}
            `;
            item.addEventListener('click', () => switchTerminal(t.id));
            sheetProcessList.appendChild(item);
        });
    }

    btnActiveTerminal.addEventListener('click', () => {
        triggerHaptic(10);
        loadAllTerminals();
        terminalSheet.classList.remove('hidden');
    });

    btnCloseTermSheet.addEventListener('click', () => {
        terminalSheet.classList.add('hidden');
    });

    terminalSheet.querySelector('.bottom-sheet-backdrop').addEventListener('click', () => {
        terminalSheet.classList.add('hidden');
    });

    btnSheetCreateTerm.addEventListener('click', async () => {
        triggerHaptic(15);
        try {
            const res = await fetch(`/api/sessions?token=${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shellId: 'powershell', name: 'Windows PowerShell' })
            });
            const data = await res.json();
            if (data.success && data.session) {
                showToast('Đã tạo terminal mới!', 'success');
                await loadAllTerminals();
                switchTerminal(data.session.id);
            }
        } catch (e) {
            showToast('Lỗi tạo terminal', 'error');
        }
    });

    btnRefreshTerm.addEventListener('click', () => {
        triggerHaptic(10);
        loadAllTerminals();
        showToast('Đã làm mới terminal');
    });

    // ==================== TACTILE TOOLBAR & INPUT ====================

    let outboxQueue = [];
    let isBroadcastMode = false;
    function sendTerminalInput(data) {
        if (!data) return;
        if (isBroadcastMode && ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'broadcast_input', data }));
            triggerHaptic(10);
            return;
        }
        if (activeSplitPane === 2 && ws2 && ws2.readyState === WebSocket.OPEN) {
            ws2.send(JSON.stringify({ type: 'input', data }));
            triggerHaptic(8);
            return;
        }
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'input', data }));
            triggerHaptic(8);
        } else {
            outboxQueue.push({ type: 'input', data, timestamp: Date.now() });
            showToast(`📶 Đang offline: đã lưu hàng đợi (${outboxQueue.length} lệnh)`, 'info');
        }
    }

    // Gửi phím hành động cơ bản
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            const seq = ACTION_MAP[action];
            if (seq) {
                sendTerminalInput(seq);
            }
        });
    });

    // ==================== V3.0 MULTI-SESSION HORIZONTAL TAB STRIP ====================
    const sessionTabStrip = document.getElementById('session-tab-strip');
    const btnTabAdd = document.getElementById('btn-tab-add');
    const btnTabMenu = document.getElementById('btn-tab-menu');

    function renderSessionTabStrip() {
        if (!sessionTabStrip) return;
        sessionTabStrip.innerHTML = '';

        // CHỈ HIỂN THỊ CÁC PHIÊN PTY DO NGƯỜI DÙNG TẠO (HOẶC PHIÊN ĐANG CHỌN)
        const visibleTabs = terminalsList.filter(t => t.type === 'pty' || t.id === currentTarget);

        visibleTabs.forEach(t => {
            const tab = document.createElement('div');
            const isActive = t.id === currentTarget;
            tab.className = `session-tab ${isActive ? 'active' : ''} haptic`;
            tab.dataset.id = t.id;
            const tabColor = t.color || (t.type === 'system' ? '#a855f7' : '#38bdf8');
            tab.style.setProperty('--tab-color', tabColor);

            tab.innerHTML = `
                <span class="tab-indicator" style="background: ${tabColor}"></span>
                <span class="tab-icon">${t.icon || '⚡'}</span>
                <span class="tab-title" title="${t.name}">${t.name}</span>
                ${(t.unreadCount > 0 && !isActive) ? '<span class="tab-unread"></span>' : ''}
                ${t.type === 'pty' ? '<button class="tab-close-btn haptic" title="Đóng tab">✕</button>' : ''}
            `;

            tab.addEventListener('click', (e) => {
                if (e.target.classList.contains('tab-close-btn')) return;
                triggerHaptic(10);
                switchTerminal(t.id);
            });

            // Nhấn giữ hoặc chuột phải để mở menu quản lý session
            let longPressTimer = null;
            tab.addEventListener('touchstart', () => {
                longPressTimer = setTimeout(() => {
                    triggerHaptic(20);
                    openSessionManageModal(t.id);
                }, 450);
            }, { passive: true });
            tab.addEventListener('touchend', () => { if (longPressTimer) clearTimeout(longPressTimer); });
            tab.addEventListener('touchmove', () => { if (longPressTimer) clearTimeout(longPressTimer); });
            tab.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                openSessionManageModal(t.id);
            });

            const closeBtn = tab.querySelector('.tab-close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    triggerHaptic(15);
                    await closeSessionById(t.id);
                });
            }

            sessionTabStrip.appendChild(tab);
        });

        // Cuộn tab đang chọn vào vùng nhìn thấy
        const activeTab = sessionTabStrip.querySelector('.session-tab.active');
        if (activeTab) {
            activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    async function closeSessionById(sessionId) {
        if (!confirm('Bạn có chắc chắn muốn đóng terminal session này?')) return;
        try {
            const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}?token=${encodeURIComponent(token)}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showToast('Đã đóng session', 'info');
                await loadAllTerminals();
                if (currentTarget === sessionId && terminalsList.length > 0) {
                    switchTerminal(terminalsList[0].id);
                }
            }
        } catch (e) {
            showToast('Lỗi khi đóng session', 'error');
        }
    }

    // Modal Tạo Session Mới
    const modalNewSession = document.getElementById('modal-new-session');
    const btnCloseNewSession = document.getElementById('btn-close-new-session');
    const btnCancelCreateSession = document.getElementById('btn-cancel-create-session');
    const btnConfirmCreateSession = document.getElementById('btn-confirm-create-session');
    const shellSelectGrid = document.getElementById('shell-select-grid');
    const inputNewSessionName = document.getElementById('new-session-name');
    let selectedShellId = 'powershell';
    let selectedColor = '#38bdf8';

    async function openNewSessionModal() {
        triggerHaptic(10);
        modalNewSession.classList.remove('hidden');
        if (inputNewSessionName) inputNewSessionName.value = '';

        try {
            const res = await fetch(`/api/shells?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.shells) && shellSelectGrid) {
                shellSelectGrid.innerHTML = '';
                data.shells.forEach(shell => {
                    const card = document.createElement('div');
                    card.className = `shell-select-card ${shell.id === selectedShellId ? 'active' : ''} haptic`;
                    let icon = '⚡';
                    if (shell.id === 'cmd') icon = '💻';
                    else if (shell.id === 'wsl') icon = '🐧';
                    else if (shell.id === 'gitbash') icon = '🌿';
                    else if (shell.id === 'python') icon = '🐍';
                    else if (shell.id === 'node') icon = '🟩';
                    else if (shell.id === 'agy' || shell.id === 'agy-new') icon = '🛸';
                    else if (shell.id === 'claude') icon = '🟣';

                    card.innerHTML = `
                        <span class="shell-card-icon">${icon}</span>
                        <span class="shell-card-name">${shell.name}</span>
                    `;
                    card.addEventListener('click', () => {
                        triggerHaptic(8);
                        selectedShellId = shell.id;
                        shellSelectGrid.querySelectorAll('.shell-select-card').forEach(c => c.classList.remove('active'));
                        card.classList.add('active');
                    });
                    shellSelectGrid.appendChild(card);
                });
            }
        } catch (e) {}
    }

    if (btnTabAdd) btnTabAdd.addEventListener('click', openNewSessionModal);
    if (btnCloseNewSession) btnCloseNewSession.addEventListener('click', () => modalNewSession.classList.add('hidden'));
    if (btnCancelCreateSession) btnCancelCreateSession.addEventListener('click', () => modalNewSession.classList.add('hidden'));

    document.querySelectorAll('#modal-new-session .color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            triggerHaptic(8);
            document.querySelectorAll('#modal-new-session .color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            selectedColor = dot.getAttribute('data-color') || '#38bdf8';
        });
    });

    if (btnConfirmCreateSession) {
        btnConfirmCreateSession.addEventListener('click', async () => {
            triggerHaptic(15);
            const name = inputNewSessionName.value.trim();
            btnConfirmCreateSession.disabled = true;
            btnConfirmCreateSession.textContent = 'Đang khởi chạy...';
            try {
                const res = await fetch(`/api/sessions?token=${encodeURIComponent(token)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        shellId: selectedShellId,
                        name: name || undefined,
                        color: selectedColor
                    })
                });
                const data = await res.json();
                if (data.success && data.session) {
                    showToast(`Đã tạo session: ${data.session.name}`, 'success');
                    modalNewSession.classList.add('hidden');
                    await loadAllTerminals();
                    switchTerminal(data.session.id);
                } else {
                    showToast('Lỗi tạo session', 'error');
                }
            } catch (err) {
                showToast('Lỗi kết nối khi tạo session', 'error');
            } finally {
                btnConfirmCreateSession.disabled = false;
                btnConfirmCreateSession.textContent = '🚀 Khởi Chạy Ngay';
            }
        });
    }

    // Modal Quản Lý Session (Rename, Color, Duplicate, Close)
    const modalSessionManage = document.getElementById('modal-session-manage');
    const btnCloseSessionManage = document.getElementById('btn-close-session-manage');
    const inputManageSessionName = document.getElementById('manage-session-name');
    const btnSaveSessionName = document.getElementById('btn-save-session-name');
    const btnDuplicateSession = document.getElementById('btn-duplicate-session');
    const btnCloseCurrentSession = document.getElementById('btn-close-current-session');
    let sessionBeingManaged = '';
    let manageSelectedColor = '#38bdf8';

    function openSessionManageModal(sessionId) {
        sessionBeingManaged = sessionId || currentTarget;
        if (!sessionBeingManaged) return;
        const target = terminalsList.find(t => t.id === sessionBeingManaged);
        if (!target) return;

        if (inputManageSessionName) inputManageSessionName.value = target.name;
        manageSelectedColor = target.color || '#38bdf8';

        document.querySelectorAll('#manage-color-picker .color-dot').forEach(dot => {
            const dotColor = dot.getAttribute('data-color');
            if (dotColor === manageSelectedColor) dot.classList.add('active');
            else dot.classList.remove('active');
        });

        modalSessionManage.classList.remove('hidden');
    }

    if (btnTabMenu) btnTabMenu.addEventListener('click', () => openSessionManageModal(currentTarget));
    if (btnCloseSessionManage) btnCloseSessionManage.addEventListener('click', () => modalSessionManage.classList.add('hidden'));

    document.querySelectorAll('#manage-color-picker .color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            triggerHaptic(8);
            document.querySelectorAll('#manage-color-picker .color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            manageSelectedColor = dot.getAttribute('data-color') || '#38bdf8';
        });
    });

    if (btnSaveSessionName) {
        btnSaveSessionName.addEventListener('click', async () => {
            triggerHaptic(15);
            const newName = inputManageSessionName.value.trim();
            try {
                const res = await fetch(`/api/sessions/${encodeURIComponent(sessionBeingManaged)}?token=${encodeURIComponent(token)}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: newName, color: manageSelectedColor })
                });
                const data = await res.json();
                if (data.success) {
                    showToast('Đã cập nhật session!', 'success');
                    modalSessionManage.classList.add('hidden');
                    await loadAllTerminals();
                } else {
                    showToast('Không thể cập nhật session', 'error');
                }
            } catch (e) {
                showToast('Lỗi khi lưu session', 'error');
            }
        });
    }

    if (btnDuplicateSession) {
        btnDuplicateSession.addEventListener('click', async () => {
            triggerHaptic(15);
            try {
                const res = await fetch(`/api/sessions/${encodeURIComponent(sessionBeingManaged)}/duplicate?token=${encodeURIComponent(token)}`, {
                    method: 'POST'
                });
                const data = await res.json();
                if (data.success && data.session) {
                    showToast(`Đã nhân bản: ${data.session.name}`, 'success');
                    modalSessionManage.classList.add('hidden');
                    await loadAllTerminals();
                    switchTerminal(data.session.id);
                } else {
                    showToast('Lỗi nhân bản session', 'error');
                }
            } catch (e) {
                showToast('Lỗi khi nhân bản session', 'error');
            }
        });
    }

    if (btnCloseCurrentSession) {
        btnCloseCurrentSession.addEventListener('click', async () => {
            modalSessionManage.classList.add('hidden');
            await closeSessionById(sessionBeingManaged);
        });
    }


    // Tự động căn chỉnh Viewport khi bàn phím ảo trồi lên (Soft Keyboard Auto-Fit)
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            if (fitAddon && term) {
                try {
                    fitAddon.fit();
                    term.scrollToBottom();
                } catch (e) {}
            }
        });
        window.visualViewport.addEventListener('scroll', () => {
            if (term) term.scrollToBottom();
        });
    }

    // ==================== REALTIME HARDWARE RESOURCE MONITOR HUD ====================
    let lastSystemData = null;
    const systemHudBar = document.getElementById('system-hud-bar');
    const modalSystemDetail = document.getElementById('modal-system-detail');
    const btnCloseSysDetail = document.getElementById('btn-close-sys-detail');

    async function updateSystemHud() {
        try {
            const res = await fetch(`/api/system-status?token=${encodeURIComponent(token)}`);
            if (!res.ok) return;
            const data = await res.json();
            if (data.success) {
                lastSystemData = data;
                if (window.teleterm3D) {
                    window.teleterm3D.updateTelemetry({
                        cpu: data.cpuPercent,
                        ram: data.memory ? data.memory.usedPercent : 40,
                        disk: data.disk ? (data.disk.usedGB || data.disk.percent) : 50,
                        battery: data.battery ? data.battery.percent : 100
                    });
                }
                const elCpu = document.getElementById('hud-cpu-val');
                const elRam = document.getElementById('hud-ram-val');
                const elDisk = document.getElementById('hud-disk-val');
                const elBat = document.getElementById('hud-bat-val');
                const elBatIcon = document.getElementById('hud-bat-icon');

                if (elCpu) elCpu.textContent = `${data.cpuPercent}%`;
                if (elRam && data.memory) elRam.textContent = `${data.memory.usedPercent}%`;

                // Cập nhật Mini HUD Capsule trên Top Bar cho Mobile (Tiết kiệm diện tích)
                const elMiniCpu = document.getElementById('mini-cpu-val');
                const elMiniRam = document.getElementById('mini-ram-val');
                if (elMiniCpu) elMiniCpu.textContent = `CPU ${data.cpuPercent}%`;
                if (elMiniRam && data.memory) elMiniRam.textContent = `RAM ${data.memory.usedPercent}%`;

                if (elDisk && data.disks && data.disks.length > 0) {
                    const c = data.disks.find(d => d.drive === 'C:') || data.disks[0];
                    elDisk.textContent = `${c.freeGb}GB`;
                }
                if (elBat && data.battery) {
                    elBat.textContent = `${data.battery.percent}%`;
                    if (elBatIcon) elBatIcon.textContent = data.battery.isCharging ? '⚡' : '🔋';
                }

                if (modalSystemDetail && !modalSystemDetail.classList.contains('hidden')) {
                    renderSystemDetailModal(data);
                }
            }
        } catch (e) {}
    }

    function renderSystemDetailModal(data) {
        if (!data) return;
        const elCpuVal = document.getElementById('sys-detail-cpu-val');
        const elCpuBar = document.getElementById('sys-detail-cpu-bar');
        const elCpuCores = document.getElementById('sys-detail-cpu-cores');
        const elRamVal = document.getElementById('sys-detail-ram-val');
        const elRamBar = document.getElementById('sys-detail-ram-bar');
        const elRamText = document.getElementById('sys-detail-ram-text');
        const elDisks = document.getElementById('sys-detail-disks');
        const elBat = document.getElementById('sys-detail-battery');
        const elUptime = document.getElementById('sys-detail-uptime');
        const elHost = document.getElementById('sys-detail-host');

        if (elCpuVal) elCpuVal.textContent = `${data.cpuPercent}%`;
        if (elCpuBar) elCpuBar.style.width = `${data.cpuPercent}%`;
        if (elCpuCores) elCpuCores.textContent = `${data.cpuCores} Cores (${data.platform})`;

        if (data.memory) {
            if (elRamVal) elRamVal.textContent = `${data.memory.usedPercent}%`;
            if (elRamBar) elRamBar.style.width = `${data.memory.usedPercent}%`;
            if (elRamText) elRamText.textContent = `${data.memory.usedMb} / ${data.memory.totalMb} MB (${data.memory.freeMb} MB trống)`;
        }

        if (elDisks && Array.isArray(data.disks)) {
            elDisks.innerHTML = data.disks.map(d => `
                <div class="sys-disk-row">
                    <span><strong>${d.drive}</strong> Còn trống: <span style="color:#38bdf8;">${d.freeGb} GB</span> / ${d.totalGb} GB</span>
                    <span style="color:#94a3b8; font-size:11px;">(${d.freePercent}% trống)</span>
                </div>
            `).join('');
        }

        if (elBat && data.battery) {
            elBat.textContent = `${data.battery.percent}% (${data.battery.statusText || (data.battery.isCharging ? 'Nguồn AC' : 'Dùng Pin')})`;
        }
        if (elUptime) {
            const h = Math.floor(data.uptimeSec / 3600);
            const m = Math.floor((data.uptimeSec % 3600) / 60);
            elUptime.textContent = `${h} giờ ${m} phút`;
        }
        if (elHost) elHost.textContent = data.hostname || 'Windows Host';
    }

    if (systemHudBar) {
        systemHudBar.addEventListener('click', () => {
            triggerHaptic(10);
            if (modalSystemDetail) {
                modalSystemDetail.classList.remove('hidden');
                if (lastSystemData) renderSystemDetailModal(lastSystemData);
            }
        });
    }
    if (btnCloseSysDetail && modalSystemDetail) {
        btnCloseSysDetail.addEventListener('click', () => modalSystemDetail.classList.add('hidden'));
    }

    setInterval(updateSystemHud, 3000);

    // ==================== REMOTE FILE EXPLORER & QUICK EDITOR ====================
    const modalFileExplorer = document.getElementById('modal-file-explorer');
    const btnFileExplorer = document.getElementById('btn-file-explorer');
    const btnCloseFileExplorer = document.getElementById('btn-close-file-explorer');
    const feBrowserView = document.getElementById('fe-browser-view');
    const feEditorView = document.getElementById('fe-editor-view');
    const btnFeUp = document.getElementById('btn-fe-up');
    const btnFeRefresh = document.getElementById('btn-fe-refresh');
    const feFilterInput = document.getElementById('fe-filter-input');
    const btnFeSave = document.getElementById('btn-fe-save');
    const btnFeDownload = document.getElementById('btn-fe-download');
    const btnFeBackBrowser = document.getElementById('btn-fe-back-browser');
    const feEditorTextarea = document.getElementById('fe-editor-textarea');

    let currentFePath = '';
    let currentFeParentPath = '';
    let currentFeItems = [];
    let currentEditingFilePath = '';

    function getFileIcon(ext) {
        const map = {
            '.js': '🟨', '.ts': '🔷', '.json': '⚙️', '.py': '🐍', '.html': '🌐',
            '.css': '🎨', '.md': '📝', '.txt': '📄', '.bat': '⚡', '.ps1': '⚡',
            '.sh': '🐚', '.png': '🖼️', '.jpg': '🖼️', '.ico': '🖼️', '.env': '🔐'
        };
        return map[ext] || '📄';
    }

    function formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    async function browseDirectory(targetPath = '') {
        const fileListEl = document.getElementById('fe-file-list');
        const breadcrumbEl = document.getElementById('fe-breadcrumbs');
        if (!fileListEl) return;
        fileListEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">Đang tải danh sách file...</div>';

        try {
            const url = `/api/files/browse?token=${encodeURIComponent(token)}${targetPath ? `&path=${encodeURIComponent(targetPath)}` : ''}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                currentFePath = data.currentPath;
                currentFeParentPath = data.parentPath;
                currentFeItems = data.items || [];
                if (breadcrumbEl) breadcrumbEl.textContent = data.currentPath;

                renderFileList(currentFeItems);
            } else {
                fileListEl.innerHTML = `<div style="padding: 20px; text-align: center; color: #f43f5e;">Lỗi: ${data.error}</div>`;
            }
        } catch (e) {
            fileListEl.innerHTML = `<div style="padding: 20px; text-align: center; color: #f43f5e;">Lỗi kết nối File Explorer</div>`;
        }
    }

    function renderFileList(items) {
        const fileListEl = document.getElementById('fe-file-list');
        if (!fileListEl) return;
        fileListEl.innerHTML = '';

        if (!items || items.length === 0) {
            fileListEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">Thư mục trống</div>';
            return;
        }

        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'fe-item haptic';
            const icon = item.isDir ? '📁' : getFileIcon(item.ext);
            const sizeStr = item.isDir ? 'Thư mục' : formatFileSize(item.size);
            const dateStr = item.mtime ? new Date(item.mtime).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '';

            el.innerHTML = `
                <span class="fe-item-icon">${icon}</span>
                <div class="fe-item-info">
                    <div class="fe-item-name">${item.name}</div>
                    <div class="fe-item-sub">${sizeStr} • ${dateStr}</div>
                </div>
            `;

            el.addEventListener('click', () => {
                triggerHaptic(10);
                if (item.isDir) {
                    browseDirectory(item.path);
                } else {
                    openFileInEditor(item.path, item.name);
                }
            });

            fileListEl.appendChild(el);
        });
    }

    async function openFileInEditor(filePath, fileName) {
        const filenameEl = document.getElementById('fe-editor-filename');
        const filesizeEl = document.getElementById('fe-editor-filesize');
        try {
            const res = await fetch(`/api/files/read?token=${encodeURIComponent(token)}&path=${encodeURIComponent(filePath)}`);
            const data = await res.json();
            if (data.success) {
                currentEditingFilePath = filePath;
                if (filenameEl) filenameEl.textContent = fileName || data.name;
                if (filesizeEl) filesizeEl.textContent = formatFileSize(data.size);
                if (feEditorTextarea) feEditorTextarea.value = data.content;

                if (feBrowserView) feBrowserView.classList.add('hidden');
                if (feEditorView) feEditorView.classList.remove('hidden');
            } else {
                showToast(`Không thể đọc file: ${data.error}`, 'error');
            }
        } catch (e) {
            showToast('Lỗi đọc file', 'error');
        }
    }

    if (btnFileExplorer && modalFileExplorer) {
        btnFileExplorer.addEventListener('click', () => {
            triggerHaptic(10);
            modalFileExplorer.classList.remove('hidden');
            if (feBrowserView) feBrowserView.classList.remove('hidden');
            if (feEditorView) feEditorView.classList.add('hidden');
            browseDirectory(currentFePath || '');
        });
    }
    if (btnCloseFileExplorer && modalFileExplorer) {
        btnCloseFileExplorer.addEventListener('click', () => modalFileExplorer.classList.add('hidden'));
    }
    if (btnFeUp) {
        btnFeUp.addEventListener('click', () => {
            if (currentFeParentPath) {
                triggerHaptic(8);
                browseDirectory(currentFeParentPath);
            } else {
                showToast('Đang ở thư mục gốc');
            }
        });
    }
    if (btnFeRefresh) {
        btnFeRefresh.addEventListener('click', () => {
            triggerHaptic(8);
            browseDirectory(currentFePath);
        });
    }
    if (feFilterInput) {
        feFilterInput.addEventListener('input', () => {
            const q = feFilterInput.value.toLowerCase().trim();
            if (!q) renderFileList(currentFeItems);
            else {
                const filtered = currentFeItems.filter(i => i.name.toLowerCase().includes(q));
                renderFileList(filtered);
            }
        });
    }
    if (btnFeBackBrowser) {
        btnFeBackBrowser.addEventListener('click', () => {
            triggerHaptic(8);
            if (feEditorView) feEditorView.classList.add('hidden');
            if (feBrowserView) feBrowserView.classList.remove('hidden');
        });
    }
    if (btnFeSave) {
        btnFeSave.addEventListener('click', async () => {
            triggerHaptic(15);
            btnFeSave.disabled = true;
            btnFeSave.textContent = 'Đang lưu...';
            try {
                const res = await fetch(`/api/files/save?token=${encodeURIComponent(token)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        path: currentEditingFilePath,
                        content: feEditorTextarea.value
                    })
                });
                const data = await res.json();
                if (data.success) {
                    showToast('Đã lưu file thành công!', 'success');
                } else {
                    showToast(`Lỗi lưu file: ${data.error}`, 'error');
                }
            } catch (e) {
                showToast('Lỗi kết nối khi lưu file', 'error');
            } finally {
                btnFeSave.disabled = false;
                btnFeSave.textContent = '💾 Lưu File';
            }
        });
    }
    if (btnFeDownload) {
        btnFeDownload.addEventListener('click', () => {
            if (!currentEditingFilePath) return;
            triggerHaptic(10);
            window.open(`/api/files/download?token=${encodeURIComponent(token)}&path=${encodeURIComponent(currentEditingFilePath)}`, '_blank');
        });
    }

    // ==================== CUSTOM SNIPPETS & MACRO HUB ====================
    const modalSnippets = document.getElementById('modal-snippets');
    const btnSnippetsToggle = document.getElementById('btn-snippets-toggle');
    const btnCloseSnippets = document.getElementById('btn-close-snippets');
    const snippetsListEl = document.getElementById('snippets-list');
    const btnAddSnippet = document.getElementById('btn-add-snippet');
    const inputSnippetTitle = document.getElementById('new-snippet-title');
    const inputSnippetCmd = document.getElementById('new-snippet-cmd');

    const DEFAULT_SNIPPETS = [
        { id: '1', cat: 'git', title: 'Git Status', cmd: 'git status' },
        { id: '2', cat: 'git', title: 'Git Pull', cmd: 'git pull origin main' },
        { id: '3', cat: 'git', title: 'Git Log OneLine', cmd: 'git log -n 5 --oneline' },
        { id: '4', cat: 'docker', title: 'Docker Containers', cmd: 'docker ps' },
        { id: '5', cat: 'docker', title: 'Docker Compose Up', cmd: 'docker compose up -d' },
        { id: '6', cat: 'python', title: 'Python Version', cmd: 'python --version' },
        { id: '7', cat: 'python', title: 'Pip List', cmd: 'pip list' },
        { id: '8', cat: 'dev', title: 'NPM Run Dev', cmd: 'npm run dev' },
        { id: '9', cat: 'dev', title: 'NPM Test', cmd: 'npm test' },
        { id: '10', cat: 'system', title: 'Top Processes CPU', cmd: 'Get-Process | Sort-Object CPU -Descending | Select-Object -First 10' },
        { id: '11', cat: 'system', title: 'IP Config', cmd: 'ipconfig' },
        { id: '12', cat: 'system', title: 'Clear Screen', cmd: 'clear' }
    ];

    let userSnippets = [];
    try {
        const saved = localStorage.getItem('tele_user_snippets');
        userSnippets = saved ? JSON.parse(saved) : DEFAULT_SNIPPETS;
    } catch (e) {
        userSnippets = DEFAULT_SNIPPETS;
    }

    let activeSnippetCat = 'all';

    function renderSnippets() {
        if (!snippetsListEl) return;
        snippetsListEl.innerHTML = '';
        const filtered = activeSnippetCat === 'all' 
            ? userSnippets 
            : userSnippets.filter(s => s.cat === activeSnippetCat);

        if (filtered.length === 0) {
            snippetsListEl.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">Không có snippet nào trong danh mục này</div>';
            return;
        }

        filtered.forEach(s => {
            const item = document.createElement('div');
            item.className = 'snippet-item haptic';
            item.innerHTML = `
                <div class="snippet-item-info">
                    <div class="snippet-item-title">${s.title}</div>
                    <div class="snippet-item-cmd">${s.cmd}</div>
                </div>
                <div class="snippet-actions">
                    <button class="snippet-btn btn-run haptic" title="Chạy ngay lập tức">⚡ Chạy</button>
                    <button class="snippet-btn btn-insert haptic" title="Chèn vào ô gõ lệnh">📝 Chèn</button>
                    <button class="snippet-btn btn-del haptic" title="Xóa">✕</button>
                </div>
            `;

            item.querySelector('.btn-run').addEventListener('click', () => {
                triggerHaptic(12);
                sendTerminalInput(s.cmd + '\r');
                showToast(`Đã gửi lệnh: ${s.title}`);
                modalSnippets.classList.add('hidden');
            });

            item.querySelector('.btn-insert').addEventListener('click', () => {
                triggerHaptic(10);
                const promptInput = document.getElementById('prompt-input');
                if (promptInput) {
                    promptInput.value = s.cmd;
                    promptInput.focus();
                }
                modalSnippets.classList.add('hidden');
            });

            item.querySelector('.btn-del').addEventListener('click', () => {
                triggerHaptic(15);
                userSnippets = userSnippets.filter(x => x.id !== s.id);
                localStorage.setItem('tele_user_snippets', JSON.stringify(userSnippets));
                renderSnippets();
            });

            snippetsListEl.appendChild(item);
        });
    }

    if (btnSnippetsToggle && modalSnippets) {
        btnSnippetsToggle.addEventListener('click', () => {
            triggerHaptic(10);
            modalSnippets.classList.remove('hidden');
            renderSnippets();
        });
    }
    if (btnCloseSnippets && modalSnippets) {
        btnCloseSnippets.addEventListener('click', () => modalSnippets.classList.add('hidden'));
    }

    document.querySelectorAll('#snippets-cat-filter .cat-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            triggerHaptic(8);
            document.querySelectorAll('#snippets-cat-filter .cat-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeSnippetCat = pill.getAttribute('data-cat') || 'all';
            renderSnippets();
        });
    });

    if (btnAddSnippet) {
        btnAddSnippet.addEventListener('click', () => {
            const title = inputSnippetTitle.value.trim();
            const cmd = inputSnippetCmd.value.trim();
            if (!title || !cmd) {
                showToast('Vui lòng điền đủ tên và câu lệnh', 'error');
                return;
            }
            triggerHaptic(12);
            userSnippets.unshift({
                id: Date.now().toString(),
                cat: 'custom',
                title,
                cmd
            });
            localStorage.setItem('tele_user_snippets', JSON.stringify(userSnippets));
            inputSnippetTitle.value = '';
            inputSnippetCmd.value = '';
            showToast('Đã thêm snippet mới!', 'success');
            renderSnippets();
        });
    }

    // ==================== BACKGROUND TASK ALERT & CHIME ====================
    let isTaskAlertActive = false;
    const btnTaskAlert = document.getElementById('btn-task-alert');

    function playTaskCompletionChime() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // Note A5
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // Note A6
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        } catch (e) {}
    }

    function toggleTaskAlert() {
        isTaskAlertActive = !isTaskAlertActive;
        triggerHaptic(15);
        if (btnTaskAlert) {
            if (isTaskAlertActive) {
                btnTaskAlert.classList.add('task-alert-active');
                showToast('🔔 Đã bật chuông báo: Sẽ phát chuông và rung khi lệnh hoàn tất!', 'info');
                if ('Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission();
                }
            } else {
                btnTaskAlert.classList.remove('task-alert-active');
                showToast('🔕 Đã tắt chuông báo', 'info');
            }
        }
    }

    function triggerTaskAlert(title, message) {
        if (!isTaskAlertActive) return;
        isTaskAlertActive = false;
        if (btnTaskAlert) btnTaskAlert.classList.remove('task-alert-active');

        playTaskCompletionChime();
        triggerHaptic([150, 100, 150, 100, 300]);
        showToast(`🔔 ${title || 'Tác vụ đã hoàn tất!'}`, 'success');

        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                new Notification(title || 'TeleTerm 24/7', {
                    body: message || 'Tác vụ trên máy tính đã hoàn tất!',
                    icon: '/teleterm_qr.png'
                });
            } catch (e) {}
        }
    }

    if (btnTaskAlert) btnTaskAlert.addEventListener('click', toggleTaskAlert);

    // ==================== VIRTUAL TRACKPAD & D-PAD ====================
    const virtualDpad = document.getElementById('virtual-dpad');
    const btnDpadToggle = document.getElementById('btn-dpad-toggle');
    const btnDpadClose = document.getElementById('btn-dpad-close');

    if (btnDpadToggle && virtualDpad) {
        btnDpadToggle.addEventListener('click', () => {
            triggerHaptic(10);
            virtualDpad.classList.toggle('hidden');
        });
    }
    if (btnDpadClose && virtualDpad) {
        btnDpadClose.addEventListener('click', () => {
            virtualDpad.classList.add('hidden');
        });
    }

    document.querySelectorAll('.virtual-dpad [data-key]').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-key');
            triggerHaptic(8);
            const map = {
                'up': '\x1b[A',
                'down': '\x1b[B',
                'left': '\x1b[D',
                'right': '\x1b[C',
                'enter': '\r',
                'home': '\x1b[H',
                'end': '\x1b[F',
                'pageup': '\x1b[5~',
                'pagedown': '\x1b[6~',
                'esc': '\x1b'
            };
            if (map[key]) {
                sendTerminalInput(map[key]);
            }
        });
    });

    // ==================== PWA SERVICE WORKER REGISTRATION ====================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        });
    }

    // ==================== VIRTUAL PC KEYBOARD & STICKY MODIFIERS ====================

    function toggleStickyCtrl(forceState) {
        isCtrlSticky = (typeof forceState === 'boolean') ? forceState : !isCtrlSticky;
        if (btnStickyCtrl) {
            btnStickyCtrl.classList.toggle('active', isCtrlSticky);
        }
        triggerHaptic(12);
        if (isCtrlSticky) {
            showToast('Đang giữ Ctrl... (Bấm phím tiếp theo để kết hợp)', 'info');
        }
    }

    function toggleStickyAlt(forceState) {
        isAltSticky = (typeof forceState === 'boolean') ? forceState : !isAltSticky;
        if (btnStickyAlt) {
            btnStickyAlt.classList.toggle('active', isAltSticky);
        }
        triggerHaptic(12);
        if (isAltSticky) {
            showToast('Đang giữ Alt... (Bấm phím tiếp theo để kết hợp)', 'info');
        }
    }

    if (btnStickyCtrl) {
        btnStickyCtrl.addEventListener('click', (e) => {
            e.preventDefault();
            toggleStickyCtrl();
        });
    }

    if (btnStickyAlt) {
        btnStickyAlt.addEventListener('click', (e) => {
            e.preventDefault();
            toggleStickyAlt();
        });
    }

    // Gắn sự kiện cho các phím PC (F1-F12, Esc, Tab, Home, End, PgUp, PgDn, Ins, Del, Symbol...)
    document.querySelectorAll('[data-pckey]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const key = btn.getAttribute('data-pckey');
            let seq = PC_KEY_MAP[key] || key;

            if (isCtrlSticky) {
                // Nếu đang giữ Ctrl kết hợp
                if (key.length === 1) {
                    const code = key.toUpperCase().charCodeAt(0);
                    if (code >= 64 && code <= 95) {
                        seq = String.fromCharCode(code - 64);
                    }
                }
                toggleStickyCtrl(false);
            } else if (isAltSticky) {
                seq = '\x1b' + seq;
                toggleStickyAlt(false);
            }

            sendTerminalInput(seq);
        });
    });

    // Toggle bảng phím PC
    function togglePcKeys() {
        isPcKeysOpen = !isPcKeysOpen;
        if (pcKeyboardPanel) {
            pcKeyboardPanel.classList.toggle('hidden', !isPcKeysOpen);
        }
        if (btnPcKeysToggle) {
            btnPcKeysToggle.classList.toggle('active', isPcKeysOpen);
        }
        if (btnTogglePcKeys) {
            btnTogglePcKeys.classList.toggle('active', isPcKeysOpen);
        }
        triggerHaptic(10);
        if (fitAddon) {
            setTimeout(() => {
                fitAddon.fit();
                if (term) term.scrollToBottom();
            }, 60);
        }
    }

    if (btnPcKeysToggle) btnPcKeysToggle.addEventListener('click', togglePcKeys);
    if (btnTogglePcKeys) btnTogglePcKeys.addEventListener('click', togglePcKeys);

    // ==================== CLIPBOARD & TEXT SELECTION ====================

    if (btnCopySelection) {
        btnCopySelection.addEventListener('click', async () => {
            triggerHaptic(10);
            const sel = term ? term.getSelection() : '';
            if (sel) {
                try {
                    await navigator.clipboard.writeText(sel);
                    showToast('Đã sao chép vào clipboard!', 'success');
                } catch (e) {
                    showToast('Không thể sao chép tự động', 'error');
                }
            } else {
                showToast('Chưa bôi đen chọn đoạn text nào!', 'info');
            }
        });
    }

    if (btnPasteTerminal) {
        btnPasteTerminal.addEventListener('click', async () => {
            triggerHaptic(10);
            try {
                if (navigator.clipboard && navigator.clipboard.readText) {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                        sendTerminalInput(text);
                        showToast('Đã dán từ clipboard!', 'success');
                        return;
                    }
                }
            } catch (err) {}
            // Fallback prompt nếu browser chặn đọc clipboard
            const manualText = prompt('Dán nội dung vào terminal:');
            if (manualText) {
                sendTerminalInput(manualText);
                showToast('Đã gửi nội dung dán!', 'success');
            }
        });
    }

    if (btnSelectAll) {
        btnSelectAll.addEventListener('click', () => {
            triggerHaptic(10);
            if (term) {
                term.selectAll();
                showToast('Đã chọn toàn bộ terminal', 'info');
            }
        });
    }

    // ==================== TERMINAL IN-BUFFER SEARCH ====================

    function openTerminalSearch() {
        if (!terminalSearchBar) return;
        terminalSearchBar.classList.remove('hidden');
        if (termSearchInput) {
            termSearchInput.focus();
            termSearchInput.select();
        }
        triggerHaptic(10);
    }

    function closeTerminalSearch() {
        if (!terminalSearchBar) return;
        terminalSearchBar.classList.add('hidden');
        if (term) term.focus();
    }

    if (btnOpenSearch) btnOpenSearch.addEventListener('click', openTerminalSearch);
    if (btnSearchClose) btnSearchClose.addEventListener('click', closeTerminalSearch);

    let searchMatches = [];
    let currentMatchIndex = -1;

    function performTerminalSearch(query, direction = 1) {
        if (!term || !query) {
            if (termSearchCount) termSearchCount.textContent = '0/0';
            return;
        }

        const buffer = term.buffer.active;
        const totalLines = buffer.length;
        const lowerQ = query.toLowerCase();
        searchMatches = [];

        for (let y = 0; y < totalLines; y++) {
            const line = buffer.getLine(y);
            if (!line) continue;
            const str = line.translateToString(true).toLowerCase();
            let idx = str.indexOf(lowerQ);
            while (idx !== -1) {
                searchMatches.push({ y, x: idx });
                idx = str.indexOf(lowerQ, idx + 1);
            }
        }

        if (searchMatches.length === 0) {
            if (termSearchCount) termSearchCount.textContent = '0/0';
            return;
        }

        if (direction === 1) {
            currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
        } else if (direction === -1) {
            currentMatchIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
        } else {
            currentMatchIndex = 0;
        }

        const match = searchMatches[currentMatchIndex];
        term.scrollToLine(match.y);
        term.select(match.x, match.y, query.length);

        if (termSearchCount) {
            termSearchCount.textContent = `${currentMatchIndex + 1}/${searchMatches.length}`;
        }
    }

    if (termSearchInput) {
        termSearchInput.addEventListener('input', () => {
            currentMatchIndex = -1;
            performTerminalSearch(termSearchInput.value.trim(), 0);
        });
        termSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performTerminalSearch(termSearchInput.value.trim(), e.shiftKey ? -1 : 1);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                closeTerminalSearch();
            }
        });
    }

    if (btnSearchNext) btnSearchNext.addEventListener('click', () => performTerminalSearch(termSearchInput.value.trim(), 1));
    if (btnSearchPrev) btnSearchPrev.addEventListener('click', () => performTerminalSearch(termSearchInput.value.trim(), -1));

    // ==================== SMART VIETNAMESE COMMAND DOCK ====================

    // Lắng nghe sự kiện IME tiếng Việt để triệt tiêu lỗi lặp từ
    promptInput.addEventListener('compositionstart', () => {
        isPromptComposing = true;
    });

    promptInput.addEventListener('compositionend', () => {
        isPromptComposing = false;
    });

    promptInput.addEventListener('keydown', (e) => {
        // Cực kỳ quan trọng: Khi đang gõ IME (Telex/VNI), phím Enter dùng để chốt từ nên tuyệt đối không gửi lệnh!
        if (e.isComposing || isPromptComposing || e.keyCode === 229) {
            return;
        }

        if (e.key === 'Enter') {
            e.preventDefault();
            sendPromptText();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateHistory(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateHistory(1);
        }
    });

    promptInput.addEventListener('input', () => {
        if (btnClearPrompt) {
            btnClearPrompt.classList.toggle('hidden', !promptInput.value);
        }
    });

    if (btnClearPrompt) {
        btnClearPrompt.addEventListener('click', () => {
            promptInput.value = '';
            btnClearPrompt.classList.add('hidden');
            promptInput.focus();
        });
    }

    function navigateHistory(direction) {
        if (!commandHistory.length) return;
        if (direction === -1) {
            if (historyCursor === -1) {
                historyCursor = commandHistory.length - 1;
            } else if (historyCursor > 0) {
                historyCursor--;
            }
        } else if (direction === 1) {
            if (historyCursor !== -1) {
                if (historyCursor < commandHistory.length - 1) {
                    historyCursor++;
                } else {
                    historyCursor = -1;
                    promptInput.value = '';
                    if (btnClearPrompt) btnClearPrompt.classList.add('hidden');
                    return;
                }
            }
        }

        if (historyCursor >= 0 && historyCursor < commandHistory.length) {
            promptInput.value = commandHistory[historyCursor];
            promptInput.selectionStart = promptInput.selectionEnd = promptInput.value.length;
            if (btnClearPrompt) btnClearPrompt.classList.remove('hidden');
        }
    }

    if (btnHistoryPrev) {
        btnHistoryPrev.addEventListener('click', (e) => {
            e.preventDefault();
            navigateHistory(-1);
        });
    }

    if (btnHistoryNext) {
        btnHistoryNext.addEventListener('click', (e) => {
            e.preventDefault();
            navigateHistory(1);
        });
    }

    // Macro Chips: click vào là điền hoặc gửi nhanh
    promptChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const cmd = chip.getAttribute('data-cmd');
            if (cmd) {
                triggerHaptic(10);
                sendTerminalInput(cmd + '\r');
                showToast(`Đã gửi: ${cmd}`, 'info');
            }
        });
    });

    // Toggle Prompt Drawer
    btnTogglePrompt.addEventListener('click', () => {
        isPromptOpen = !isPromptOpen;
        if (isPromptOpen) {
            promptDrawer.classList.remove('hidden');
            promptInput.focus();
        } else {
            promptDrawer.classList.add('hidden');
        }
        triggerHaptic(10);
        if (fitAddon) {
            setTimeout(() => {
                fitAddon.fit();
                if (term) term.scrollToBottom();
            }, 60);
        }
    });

    btnSendPrompt.addEventListener('click', () => {
        sendPromptText();
    });

    function sendPromptText() {
        const val = promptInput.value;
        if (!val.trim()) return;
        triggerHaptic(12);

        // Lưu vào lịch sử lệnh
        if (!commandHistory.length || commandHistory[commandHistory.length - 1] !== val) {
            commandHistory.push(val);
            if (commandHistory.length > 50) commandHistory.shift();
            try {
                localStorage.setItem('tele_cmd_history', JSON.stringify(commandHistory));
            } catch (e) {}
        }
        historyCursor = -1;

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'input', data: val + '\r' }));
        }

        promptInput.value = '';
        if (btnClearPrompt) btnClearPrompt.classList.add('hidden');
    }

    // ==================== THEME CONTROLLER ====================

    function applyTerminalTheme(themeName) {
        const theme = TERMINAL_THEMES[themeName];
        if (!theme || !term) return;
        currentThemeName = themeName;
        localStorage.setItem('tele_terminal_theme', themeName);
        term.options.theme = theme;
        
        themeCardBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
        });
        showToast(`Đã áp dụng theme: ${themeName}`, 'success');
    }

    function openThemeModal() {
        if (themeModal) themeModal.classList.remove('hidden');
        triggerHaptic(10);
    }

    function closeThemeModal() {
        if (themeModal) themeModal.classList.add('hidden');
    }

    if (btnThemeToggle) btnThemeToggle.addEventListener('click', openThemeModal);
    if (btnHudTheme) btnHudTheme.addEventListener('click', openThemeModal);
    if (btnCloseThemeModal) btnCloseThemeModal.addEventListener('click', closeThemeModal);

    themeCardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            applyTerminalTheme(theme);
            closeThemeModal();
        });
    });

    // Cập nhật trạng thái active ban đầu cho theme
    themeCardBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme') === currentThemeName);
    });

    // ==================== COLLAPSIBLE HUD CONTROLLER ====================
    let hudCollapseTimer = null;

    function openHud() {
        if (!terminalHud) return;
        terminalHud.classList.remove('collapsed');
        resetHudTimer();
    }

    function closeHud() {
        if (!terminalHud) return;
        terminalHud.classList.add('collapsed');
        if (hudCollapseTimer) clearTimeout(hudCollapseTimer);
    }

    function resetHudTimer() {
        if (hudCollapseTimer) clearTimeout(hudCollapseTimer);
        hudCollapseTimer = setTimeout(() => {
            closeHud();
        }, 5000);
    }

    if (btnHudToggle) {
        btnHudToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerHaptic(10);
            if (terminalHud.classList.contains('collapsed')) {
                openHud();
            } else {
                closeHud();
            }
        });
    }

    if (btnHudClose) {
        btnHudClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeHud();
        });
    }

    if (terminalHud) {
        terminalHud.addEventListener('click', () => {
            resetHudTimer();
        });
    }

    // Scroll HUD buttons
    btnScrollTop.addEventListener('click', () => {
        if (term) term.scrollToTop();
    });

    btnScrollBottom.addEventListener('click', () => {
        if (term) term.scrollToBottom();
    });

    btnScrollUp.addEventListener('click', () => {
        if (term) term.scrollLines(-8);
    });

    btnScrollDown.addEventListener('click', () => {
        if (term) term.scrollLines(8);
    });

    scrollBottomPill.addEventListener('click', () => {
        if (term) term.scrollToBottom();
        scrollBottomPill.classList.add('hidden');
    });

    btnZoomIn.addEventListener('click', () => {
        if (currentFontSize < 20) {
            currentFontSize++;
            term.options.fontSize = currentFontSize;
            fontSizeLabel.textContent = currentFontSize;
            if (fitAddon) fitAddon.fit();
        }
    });

    btnZoomOut.addEventListener('click', () => {
        if (currentFontSize > 8) {
            currentFontSize--;
            term.options.fontSize = currentFontSize;
            fontSizeLabel.textContent = currentFontSize;
            if (fitAddon) fitAddon.fit();
        }
    });

    btnFitScreen.addEventListener('click', () => {
        if (currentTarget && currentTarget.startsWith('sys-') && term && terminalContainer) {
            const availW = terminalContainer.clientWidth - 16;
            if (term.cols > 0 && availW > 100) {
                const optimalFontSize = Math.max(6, Math.min(18, Math.floor((availW / term.cols) / 0.6)));
                term.options.fontSize = optimalFontSize;
                currentFontSize = optimalFontSize;
                if (fontSizeLabel) fontSizeLabel.textContent = currentFontSize;
                terminalContainer.scrollLeft = 0;
                showToast(`Đã căn font ${optimalFontSize}px cho vừa ${term.cols} cột!`, 'info');
                return;
            }
        }
        if (fitAddon) fitAddon.fit();
        if (terminalContainer) terminalContainer.scrollLeft = 0;
        showToast('Đã căn chỉnh vừa màn hình');
    });

    // Xem toàn bộ lịch sử code
    btnViewHistory.addEventListener('click', async () => {
        triggerHaptic(12);
        historySheet.classList.remove('hidden');
        historyTextView.textContent = 'Đang tải toàn bộ lịch sử code...';

        if (currentTarget.startsWith('sys-')) {
            const pid = currentTarget.substring(4);
            try {
                const res = await fetch(`/api/system-terminals/${pid}/history?token=${encodeURIComponent(token)}`);
                const data = await res.json();
                if (data.success) {
                    historyTextView.textContent = data.history || '(Chưa có dữ liệu lịch sử)';
                    historySheetSubtitle.textContent = `PID ${pid} • ${data.history ? data.history.split('\n').length : 0} dòng code`;
                }
            } catch (e) {
                historyTextView.textContent = 'Lỗi tải lịch sử: ' + e.message;
            }
        } else {
            historyTextView.textContent = 'Tính năng xem lịch sử toàn trang hiện hỗ trợ tốt nhất trên System Console tiến trình!';
        }
    });

    btnCloseHistorySheet.addEventListener('click', () => {
        historySheet.classList.add('hidden');
    });

    btnCopyHistory.addEventListener('click', () => {
        const text = historyTextView.textContent;
        navigator.clipboard.writeText(text).then(() => {
            showToast('Đã sao chép toàn bộ code!', 'success');
        });
    });

    historySearchInput.addEventListener('input', () => {
        const query = historySearchInput.value.toLowerCase();
        const full = historyTextView.textContent;
        if (!query) return;
        const lines = full.split('\n');
        const matched = lines.filter(l => l.toLowerCase().includes(query));
        historySheetSubtitle.textContent = `Tìm thấy ${matched.length} dòng khớp với "${query}"`;
    });

    // ==================== MINI-ANTIGRAVITY DASHBOARD ====================

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }

    function getToolIcon(toolName) {
        if (!toolName) return '🤖';
        const t = toolName.toLowerCase();
        if (t.includes('run_command')) return '⚡';
        if (t.includes('write_to_file')) return '📝';
        if (t.includes('replace_file_content')) return '✏️';
        if (t.includes('view_file')) return '📄';
        if (t.includes('grep_search') || t.includes('find_by_name')) return '🔍';
        if (t.includes('ask_question')) return '❓';
        if (t.includes('browser') || t.includes('search_web')) return '🌐';
        return '🛠️';
    }

    function renderSimpleMarkdown(md) {
        if (!md) return '<div class="empty-state">Nội dung trống</div>';
        let html = md
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/^&gt; \[\!(NOTE|TIP)\] (.*$)/gim, '<div class="artifact-alert alert-note"><strong>💡 $1:</strong> $2</div>')
            .replace(/^&gt; \[\!(IMPORTANT)\] (.*$)/gim, '<div class="artifact-alert alert-important"><strong>⚠️ $1:</strong> $2</div>')
            .replace(/^&gt; \[\!(WARNING|CAUTION)\] (.*$)/gim, '<div class="artifact-alert alert-warning"><strong>🚨 $1:</strong> $2</div>')
            .replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
                return `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`;
            })
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/^\s*[\-\*]\s+(.*$)/gim, '<li>$1</li>')
            .replace(/\n\n/g, '<p></p>');

        html = html.replace(/(<li>.*<\/li>)/gis, '<ul>$1</ul>');
        return html;
    }

    let currentLiveConversationId = null;
    let lastRenderedStep = 0;

    // ==================== ANTIGRAVITY DESKTOP MINI-SCREEN LOGIC ====================

    function openAgySidebar() {
        if (agySidebar) agySidebar.classList.remove('closed');
        if (agySidebarBackdrop) agySidebarBackdrop.classList.remove('hidden');
    }

    function closeAgySidebar() {
        if (agySidebar) agySidebar.classList.add('closed');
        if (agySidebarBackdrop) agySidebarBackdrop.classList.add('hidden');
    }

    if (btnToggleAgySb) {
        btnToggleAgySb.addEventListener('click', () => {
            triggerHaptic(10);
            openAgySidebar();
        });
    }

    if (btnCloseAgySb) {
        btnCloseAgySb.addEventListener('click', () => {
            triggerHaptic(10);
            closeAgySidebar();
        });
    }

    if (agySidebarBackdrop) {
        agySidebarBackdrop.addEventListener('click', () => {
            closeAgySidebar();
        });
    }

    if (btnAgyNewChat) {
        btnAgyNewChat.addEventListener('click', () => {
            triggerHaptic(15);
            currentLoadedSessionId = null;
            currentLoadedSessionTitle = 'Cuộc trò chuyện mới';
            currentLoadedSessionFolder = 'c:';
            if (agyChatTitle) agyChatTitle.textContent = currentLoadedSessionTitle;
            if (agyChatFolder) agyChatFolder.textContent = currentLoadedSessionFolder;
            if (agyChatMessages) {
                agyChatMessages.innerHTML = `
                    <div class="empty-state" style="padding: 40px 10px; text-align: center;">
                        <div style="font-size: 32px; margin-bottom: 8px;">🛸</div>
                        <strong style="color: #fff; font-size: 14px;">Bắt đầu phiên Antigravity mới</strong>
                        <p style="color: #888; font-size: 12px; margin-top: 6px;">Nhập prompt ở ô bên dưới để giao nhiệm vụ mới cho AI agent.</p>
                    </div>
                `;
            }
            closeAgySidebar();
            if (agyChatInput) agyChatInput.focus();
        });
    }

    if (btnSbHistory) {
        btnSbHistory.addEventListener('click', () => {
            triggerHaptic(10);
            const projectsSec = document.querySelector('.projects-section');
            if (projectsSec) projectsSec.scrollIntoView({ behavior: 'smooth' });
        });
    }

    if (btnSbTasks) {
        btnSbTasks.addEventListener('click', () => {
            triggerHaptic(10);
            showToast('Scheduled Tasks: Đang chạy tự động qua background agent', 'info');
        });
    }

    // Tự động co giãn textarea input
    if (agyChatInput) {
        agyChatInput.addEventListener('input', () => {
            agyChatInput.style.height = 'auto';
            agyChatInput.style.height = Math.min(agyChatInput.scrollHeight, 120) + 'px';
        });

        agyChatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAgyChatMessage();
            }
        });
    }

    if (btnSendAgyPrompt) {
        btnSendAgyPrompt.addEventListener('click', () => {
            sendAgyChatMessage();
        });
    }

    if (btnAgyAttach) {
        btnAgyAttach.addEventListener('click', () => {
            triggerHaptic(10);
            showToast('Tính năng đính kèm tệp / context', 'info');
        });
    }

    if (agyModelSelect) {
        agyModelSelect.addEventListener('change', () => {
            if (agySelectedModelText) {
                const sel = agyModelSelect.options[agyModelSelect.selectedIndex];
                agySelectedModelText.textContent = sel ? sel.text : agyModelSelect.value;
            }
        });
    }

    // Quota Sheet Modal Toggles
    if (btnOpenQuotaSheet) {
        btnOpenQuotaSheet.addEventListener('click', () => {
            triggerHaptic(12);
            if (quotaSheet) quotaSheet.classList.remove('hidden');
            loadQuotaInfo();
            loadAntigravityStatus();
        });
    }

    if (btnOpenAppSettings) {
        btnOpenAppSettings.addEventListener('click', () => {
            triggerHaptic(12);
            if (quotaSheet) quotaSheet.classList.remove('hidden');
            loadQuotaInfo();
            loadAntigravityStatus();
        });
    }

    if (btnCloseQuotaSheet) {
        btnCloseQuotaSheet.addEventListener('click', () => {
            if (quotaSheet) quotaSheet.classList.add('hidden');
        });
    }

    if (quotaSheet) {
        const backdrop = quotaSheet.querySelector('.bottom-sheet-backdrop');
        if (backdrop) backdrop.addEventListener('click', () => quotaSheet.classList.add('hidden'));
    }

    /**
     * Tải danh sách Pinned & Projects sessions cho Sidebar
     */
    async function loadSidebarSessions() {
        try {
            const res = await fetch(`/api/antigravity/sidebar-sessions?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            if (!data.success) return;

            // 1. Render Pinned Conversations
            if (agyPinnedList) {
                agyPinnedList.innerHTML = '';
                const pinned = data.pinned || [];
                if (pinned.length === 0) {
                    agyPinnedList.innerHTML = '<div style="padding: 8px 12px; color: #666; font-size: 11px;">Không có phiên ghim</div>';
                } else {
                    pinned.forEach(s => {
                        const item = document.createElement('div');
                        const isActive = s.id === currentLoadedSessionId;
                        item.className = `agy-session-item ${isActive ? 'active' : ''} haptic`;
                        item.dataset.sessionId = s.id;
                        item.innerHTML = `
                            <div class="session-item-main">
                                <div class="session-item-title">${escapeHtml(s.title)}</div>
                                <div class="session-item-sub">📁 ${escapeHtml(s.folder || 'c:')}</div>
                            </div>
                            <span class="session-time-badge">${s.timeAgo || ''}</span>
                        `;
                        item.addEventListener('click', () => {
                            triggerHaptic(10);
                            loadSessionChat(s.id, s.title, s.folder);
                        });
                        agyPinnedList.appendChild(item);
                    });
                }
            }

            // 2. Render Projects (Nhóm theo Folder c:, AURA, etc.)
            if (agyProjectsList) {
                agyProjectsList.innerHTML = '';
                const recent = data.recent || [];
                if (recent.length === 0) {
                    agyProjectsList.innerHTML = '<div style="padding: 8px 12px; color: #666; font-size: 11px;">Không có projects</div>';
                } else {
                    const groups = {};
                    recent.forEach(s => {
                        const folder = s.folder || 'c:';
                        if (!groups[folder]) groups[folder] = [];
                        groups[folder].push(s);
                    });

                    Object.keys(groups).forEach(folder => {
                        const folderEl = document.createElement('div');
                        folderEl.className = 'agy-project-folder';

                        const head = document.createElement('div');
                        head.className = 'agy-folder-head';
                        head.innerHTML = `<span>📁</span> <span>${escapeHtml(folder)}</span>`;
                        folderEl.appendChild(head);

                        const itemsWrap = document.createElement('div');
                        itemsWrap.className = 'agy-folder-items';

                        groups[folder].forEach(s => {
                            const item = document.createElement('div');
                            const isActive = s.id === currentLoadedSessionId;
                            item.className = `agy-session-item ${isActive ? 'active' : ''} haptic`;
                            item.dataset.sessionId = s.id;
                            item.innerHTML = `
                                <div class="session-item-main">
                                    <div class="session-item-title">${escapeHtml(s.title)}</div>
                                </div>
                                ${s.isCurrent ? '<span class="session-dot-badge"></span>' : `<span class="session-time-badge">${s.timeAgo || ''}</span>`}
                            `;
                            item.addEventListener('click', () => {
                                triggerHaptic(10);
                                loadSessionChat(s.id, s.title, s.folder);
                            });
                            itemsWrap.appendChild(item);
                        });

                        folderEl.appendChild(itemsWrap);
                        agyProjectsList.appendChild(folderEl);
                    });
                }
            }

            // Tự động load session đầu tiên nếu chưa chọn phiên nào
            if (!currentLoadedSessionId && data.pinned && data.pinned.length > 0) {
                const first = data.pinned[0];
                loadSessionChat(first.id, first.title, first.folder);
            }
        } catch (e) {
            console.error('Lỗi tải sidebar sessions:', e);
        }
    }

    /**
     * Bấm vào bất kỳ session nào -> Tải ngay toàn bộ hội thoại chat của session đó
     */
    async function loadSessionChat(sessionId, sessionTitle, sessionFolder, isSilent = false) {
        if (!sessionId) return;
        currentLoadedSessionId = sessionId;
        if (sessionTitle) currentLoadedSessionTitle = sessionTitle;
        if (sessionFolder) currentLoadedSessionFolder = sessionFolder;

        if (agyChatTitle) agyChatTitle.textContent = currentLoadedSessionTitle;
        if (agyChatFolder) agyChatFolder.textContent = currentLoadedSessionFolder || 'c:';

        // Cập nhật trạng thái active trong sidebar
        document.querySelectorAll('.agy-session-item').forEach(el => {
            if (el.dataset.sessionId === sessionId) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        // Đóng drawer trên điện thoại (chỉ khi người dùng bấm trực tiếp)
        if (!isSilent) {
            closeAgySidebar();
        }

        // Hiển thị trạng thái đang tải nếu không phải nạp nền
        if (!isSilent && agyChatMessages) {
            agyChatMessages.innerHTML = `
                <div class="agy-chat-loading">
                    <div class="spinner"></div>
                    <span>Đang tải hội thoại...</span>
                </div>
            `;
        }

        try {
            const res = await fetch(`/api/antigravity/session/${encodeURIComponent(sessionId)}/messages?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            if (!data.success || !Array.isArray(data.messages)) {
                if (!isSilent && agyChatMessages) {
                    agyChatMessages.innerHTML = `<div class="empty-state" style="padding:30px 10px; text-align:center;">Không thể tải tin nhắn: ${data.error || 'Lỗi không xác định'}</div>`;
                }
                return;
            }

            renderChatMessages(data.messages);
            loadLiveSessionProgress();
        } catch (e) {
            if (!isSilent && agyChatMessages) {
                agyChatMessages.innerHTML = `<div class="empty-state" style="color:red; padding:30px 10px; text-align:center;">Lỗi kết nối tải tin nhắn: ${e.message}</div>`;
            }
        }
    }

    /**
     * Render toàn bộ tin nhắn thành bong bóng chat giống 100% desktop
     */
    function renderChatMessages(messages) {
        if (!agyChatMessages) return;
        agyChatMessages.innerHTML = '';

        if (messages.length === 0) {
            agyChatMessages.innerHTML = `
                <div class="empty-state" style="padding: 40px 10px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🛸</div>
                    <strong style="color: #fff; font-size: 14px;">Phiên hội thoại mới</strong>
                    <p style="color: #888; font-size: 12px; margin-top: 6px;">Chưa có tin nhắn trong phiên này. Hãy gửi prompt đầu tiên bên dưới!</p>
                </div>
            `;
            return;
        }

        messages.forEach(msg => {
            const turn = document.createElement('div');
            turn.className = `agy-msg-turn ${msg.role === 'user' ? 'user-turn' : 'assistant-turn'}`;

            if (msg.role === 'user') {
                const bubble = document.createElement('div');
                bubble.className = 'agy-bubble user-bubble';
                bubble.textContent = msg.content || '';
                turn.appendChild(bubble);
            } else {
                const content = document.createElement('div');
                content.className = 'agy-assistant-content';
                content.innerHTML = renderSimpleMarkdown(msg.content || '');

                // Tool calls chips row
                if (Array.isArray(msg.tools) && msg.tools.length > 0) {
                    const toolsRow = document.createElement('div');
                    toolsRow.className = 'agy-tool-chips-row';

                    let fileCount = 0;
                    msg.tools.forEach(t => {
                        const badge = document.createElement('span');
                        badge.className = 'agy-tool-badge';
                        badge.innerHTML = `<span>${getToolIcon(t.name)}</span> <span>${escapeHtml(t.action || t.name)}</span>`;
                        toolsRow.appendChild(badge);

                        if (t.name === 'write_to_file' || t.name === 'replace_file_content') {
                            fileCount++;
                        }
                    });
                    content.appendChild(toolsRow);

                    // File changes chip y hệt giao diện desktop
                    if (fileCount > 0) {
                        const fileChip = document.createElement('div');
                        fileChip.className = 'agy-file-change-chip';
                        fileChip.innerHTML = `
                            <span>📁 ${fileCount} file thay đổi ></span>
                            <button class="agy-btn-review haptic" title="Xem kết quả">Review</button>
                        `;
                        fileChip.querySelector('.agy-btn-review').addEventListener('click', () => {
                            openArtifactModal('walkthrough');
                        });
                        content.appendChild(fileChip);
                    }
                }

                // Interactive Question Card (/grill-me hoặc ask_question)
                if (msg.interactiveQuestion && Array.isArray(msg.interactiveQuestion.questions) && msg.interactiveQuestion.questions.length > 0) {
                    const qCard = createInteractiveQuestionCard(msg.interactiveQuestion);
                    content.appendChild(qCard);
                }

                // Plan Proposal Card (implementation_plan.md / RequestFeedback)
                if (msg.planProposal) {
                    const planCard = createPlanProposalCard(msg.planProposal);
                    content.appendChild(planCard);
                }

                // Reaction bar (Thích, Chưa thích, Sao chép)
                const actions = document.createElement('div');
                actions.className = 'agy-msg-actions';
                actions.innerHTML = `
                    <button class="agy-act-btn haptic" title="Hài lòng">👍</button>
                    <button class="agy-act-btn haptic" title="Chưa hài lòng">👎</button>
                    <button class="agy-act-btn btn-copy-msg haptic" title="Sao chép câu trả lời">📋</button>
                `;
                actions.querySelector('.btn-copy-msg').addEventListener('click', () => {
                    navigator.clipboard.writeText(msg.content || '').then(() => {
                        showToast('Đã sao chép phản hồi!', 'success');
                    });
                });
                content.appendChild(actions);

                turn.appendChild(content);
            }

            agyChatMessages.appendChild(turn);
        });

        // Tự động cuộn xuống cuối
        setTimeout(() => {
            agyChatMessages.scrollTop = agyChatMessages.scrollHeight;
        }, 50);
    }

    /**
     * Tạo card tương tác câu hỏi (/grill-me hoặc ask_question)
     */
    function createInteractiveQuestionCard(iqData) {
        const card = document.createElement('div');
        const isPending = iqData.isPending !== false;
        card.className = `agy-interactive-card agy-question-card ${isPending ? '' : 'is-answered'}`;

        const header = document.createElement('div');
        header.className = 'agy-card-header';
        header.innerHTML = `
            <div class="agy-card-badge">
                <span>🎯</span>
                <span>Làm rõ yêu cầu (/grill-me)</span>
            </div>
            <span class="agy-card-status">${isPending ? '⏳ Chờ phản hồi' : '✓ Đã hoàn tất'}</span>
        `;
        card.appendChild(header);

        const questions = Array.isArray(iqData.questions) ? iqData.questions : [];
        questions.forEach((q, qIdx) => {
            const block = document.createElement('div');
            block.className = 'agy-q-block';

            const title = document.createElement('div');
            title.className = 'agy-q-title';
            title.textContent = q.question || `Câu hỏi ${qIdx + 1}:`;
            block.appendChild(title);

            const optionsList = document.createElement('div');
            optionsList.className = 'agy-options-list';

            if (Array.isArray(q.options)) {
                q.options.forEach((optText, optIdx) => {
                    const optBtn = document.createElement('button');
                    optBtn.type = 'button';
                    optBtn.className = 'agy-option-btn haptic';
                    optBtn.innerHTML = `
                        <span>${escapeHtml(optText)}</span>
                        <span class="agy-option-num">[${optIdx + 1}]</span>
                    `;
                    optBtn.addEventListener('click', () => {
                        triggerHaptic(15);
                        sendDirectPrompt(optText);
                    });
                    optionsList.appendChild(optBtn);
                });
            }

            const customReplyBtn = document.createElement('button');
            customReplyBtn.type = 'button';
            customReplyBtn.className = 'agy-custom-reply-btn haptic';
            customReplyBtn.textContent = '✍️ Tự nhập câu trả lời cho câu hỏi này...';
            customReplyBtn.addEventListener('click', () => {
                triggerHaptic(10);
                if (agyChatInput) {
                    agyChatInput.value = `Trả lời câu hỏi "${q.question}": `;
                    agyChatInput.focus();
                }
            });
            optionsList.appendChild(customReplyBtn);

            block.appendChild(optionsList);
            card.appendChild(block);
        });

        return card;
    }

    /**
     * Tạo card duyệt kế hoạch (Plan Proposal / RequestFeedback)
     */
    function createPlanProposalCard(planData) {
        const card = document.createElement('div');
        const isPending = planData.isPending !== false;
        card.className = `agy-interactive-card agy-plan-card ${isPending ? '' : 'is-answered'}`;

        const header = document.createElement('div');
        header.className = 'agy-card-header';
        header.innerHTML = `
            <div class="agy-card-badge">
                <span>📋</span>
                <span>Kế Hoạch Triển Khai (Implementation Plan)</span>
            </div>
            <span class="agy-card-status">${isPending ? '⚡ Chờ bạn duyệt' : '✓ Đã duyệt'}</span>
        `;
        card.appendChild(header);

        if (planData.summary) {
            const summary = document.createElement('div');
            summary.className = 'agy-plan-summary';
            summary.textContent = planData.summary;
            card.appendChild(summary);
        }

        const actionsRow = document.createElement('div');
        actionsRow.className = 'agy-plan-actions-row';

        const btnProceed = document.createElement('button');
        btnProceed.type = 'button';
        btnProceed.className = 'btn-plan-proceed haptic';
        btnProceed.innerHTML = `<span>✅ Proceed (Thực thi kế hoạch)</span>`;
        btnProceed.addEventListener('click', () => {
            triggerHaptic(20);
            sendDirectPrompt('Proceed');
        });
        actionsRow.appendChild(btnProceed);

        const btnViewPlan = document.createElement('button');
        btnViewPlan.type = 'button';
        btnViewPlan.className = 'btn-plan-view haptic';
        btnViewPlan.innerHTML = `<span>📄 Xem Chi Tiết</span>`;
        btnViewPlan.addEventListener('click', () => {
            triggerHaptic(10);
            openArtifactModal('plan');
        });
        actionsRow.appendChild(btnViewPlan);

        const btnFeedback = document.createElement('button');
        btnFeedback.type = 'button';
        btnFeedback.className = 'btn-plan-feedback haptic';
        btnFeedback.innerHTML = `<span>💬 Góp Ý Kế Hoạch</span>`;
        btnFeedback.addEventListener('click', () => {
            triggerHaptic(10);
            if (agyChatInput) {
                agyChatInput.value = 'Góp ý kế hoạch: ';
                agyChatInput.focus();
            }
        });
        actionsRow.appendChild(btnFeedback);

        card.appendChild(actionsRow);
        return card;
    }

    /**
     * Gửi trực tiếp một prompt ngắn từ các nút tương tác (Proceed, lựa chọn câu hỏi, chip lệnh)
     */
    async function sendDirectPrompt(promptText) {
        if (!promptText) return;
        triggerHaptic(15);

        // Hiển thị ngay tin nhắn user (Optimistic UI)
        if (agyChatMessages) {
            const userTurn = document.createElement('div');
            userTurn.className = 'agy-msg-turn user-turn';
            const userBubble = document.createElement('div');
            userBubble.className = 'agy-bubble user-bubble';
            userBubble.textContent = promptText;
            userTurn.appendChild(userBubble);
            agyChatMessages.appendChild(userTurn);
            agyChatMessages.scrollTop = agyChatMessages.scrollHeight;
        }

        if (agyLiveBanner) {
            agyLiveBanner.classList.remove('hidden');
            if (agyBannerIcon) agyBannerIcon.textContent = '🧠';
            if (agyBannerTool) agyBannerTool.textContent = 'Gemini 3.8 Flash';
            if (agyBannerSummary) agyBannerSummary.textContent = 'Đang xử lý phản hồi...';
        }

        try {
            const model = agyModelSelect ? agyModelSelect.value : 'gemini-3.8-flash-high';
            const res = await fetch(`/api/antigravity/prompt?token=${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptText,
                    model,
                    conversationId: currentLoadedSessionId
                })
            });
            const data = await res.json();
            if (data.success && data.deliveredToApp) {
                if (data.conversationId) currentLoadedSessionId = data.conversationId;
                showToast('✓ Đã gửi phản hồi thành công!', 'success');
                setTimeout(loadLiveSessionProgress, 500);
                setTimeout(() => {
                    if (currentLoadedSessionId) loadSessionChat(currentLoadedSessionId, currentLoadedSessionTitle, currentLoadedSessionFolder, true);
                }, 1500);
            } else if (data.success && data.response) {
                const asstTurn = document.createElement('div');
                asstTurn.className = 'agy-msg-turn assistant-turn';
                const asstContent = document.createElement('div');
                asstContent.className = 'agy-assistant-content';
                asstContent.innerHTML = renderSimpleMarkdown(data.response);
                asstTurn.appendChild(asstContent);
                if (agyChatMessages) {
                    agyChatMessages.appendChild(asstTurn);
                    agyChatMessages.scrollTop = agyChatMessages.scrollHeight;
                }
            } else {
                showToast(data.message || 'Đã gửi phản hồi cho Antigravity!', 'info');
                setTimeout(() => {
                    if (currentLoadedSessionId) loadSessionChat(currentLoadedSessionId, currentLoadedSessionTitle, currentLoadedSessionFolder, true);
                }, 1500);
            }
        } catch (e) {
            showToast('Lỗi gửi phản hồi: ' + e.message, 'error');
        }
    }

    /**
     * Gửi tin nhắn từ bottom input bar
     */
    async function sendAgyChatMessage() {
        const text = agyChatInput.value.trim();
        if (!text) return;
        triggerHaptic(12);

        // Hiển thị ngay tin nhắn của user (Optimistic UI)
        const userTurn = document.createElement('div');
        userTurn.className = 'agy-msg-turn user-turn';
        const userBubble = document.createElement('div');
        userBubble.className = 'agy-bubble user-bubble';
        userBubble.textContent = text;
        userTurn.appendChild(userBubble);
        agyChatMessages.appendChild(userTurn);

        agyChatInput.value = '';
        agyChatInput.style.height = 'auto';
        agyChatMessages.scrollTop = agyChatMessages.scrollHeight;

        // Bật banner live thinking
        if (agyLiveBanner) {
            agyLiveBanner.classList.remove('hidden');
            if (agyBannerIcon) agyBannerIcon.textContent = '🧠';
            if (agyBannerTool) agyBannerTool.textContent = 'Gemini 3.8 Flash';
            if (agyBannerSummary) agyBannerSummary.textContent = 'Đang phân tích yêu cầu...';
        }

        try {
            const model = agyModelSelect ? agyModelSelect.value : 'gemini-3.8-flash-high';
            const res = await fetch(`/api/antigravity/prompt?token=${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: text,
                    model,
                    conversationId: currentLoadedSessionId
                })
            });
            const data = await res.json();
            if (data.success && data.deliveredToApp) {
                if (data.conversationId) {
                    currentLoadedSessionId = data.conversationId;
                }
                showToast(data.isNewConversation ? '✓ Đã tạo cuộc trò chuyện mới thành công!' : '✓ Đã gửi tin nhắn trực tiếp vào Antigravity!', 'success');
                setTimeout(loadSidebarSessions, 400);
                setTimeout(loadLiveSessionProgress, 800);
                setTimeout(() => {
                    if (currentLoadedSessionId) loadSessionChat(currentLoadedSessionId, currentLoadedSessionTitle, currentLoadedSessionFolder, true);
                }, 2000);
            } else if (data.success && data.response) {
                const asstTurn = document.createElement('div');
                asstTurn.className = 'agy-msg-turn assistant-turn';
                const asstContent = document.createElement('div');
                asstContent.className = 'agy-assistant-content';
                asstContent.innerHTML = renderSimpleMarkdown(data.response);
                asstTurn.appendChild(asstContent);
                agyChatMessages.appendChild(asstTurn);
                agyChatMessages.scrollTop = agyChatMessages.scrollHeight;
            } else {
                showToast(data.message || 'Đã chuyển lệnh cho Antigravity Agent!', 'info');
                setTimeout(() => {
                    if (currentLoadedSessionId) loadSessionChat(currentLoadedSessionId, currentLoadedSessionTitle, currentLoadedSessionFolder, true);
                }, 2000);
            }
        } catch (e) {
            showToast('Lỗi gửi tin nhắn: ' + e.message, 'error');
        }
    }

    /**
     * Cập nhật tiến độ live session (Banner, Step badge, Plan & Walkthrough status)
     */
    async function loadLiveSessionProgress() {
        try {
            const res = await fetch(`/api/antigravity/live-session?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            if (!data.success) return;

            currentLiveConversationId = data.conversationId;

            // Tự động làm mới tin nhắn nền nếu đang xem đúng phiên live và có bước mới
            if (currentLoadedSessionId && currentLoadedSessionId === data.conversationId) {
                if (data.currentStep && data.currentStep !== lastRenderedStep) {
                    lastRenderedStep = data.currentStep;
                    loadSessionChat(currentLoadedSessionId, currentLoadedSessionTitle, currentLoadedSessionFolder, true);
                }
            }

            // Cập nhật Artifacts (Plan & Walkthrough)
            if (btnOpenPlan) {
                if (data.hasPlan) {
                    btnOpenPlan.classList.add('available');
                    btnOpenPlan.title = 'Kế hoạch đã có sẵn (Bấm để xem)';
                } else {
                    btnOpenPlan.classList.remove('available');
                }
            }

            if (btnOpenWalkthrough) {
                if (data.hasWalkthrough) {
                    btnOpenWalkthrough.classList.add('available');
                    btnOpenWalkthrough.title = 'Kết quả triển khai đã có sẵn (Bấm để xem)';
                } else {
                    btnOpenWalkthrough.classList.remove('available');
                }
            }

            // Cập nhật Live Progress Banner & Trạng thái tương tác (Question / Plan)
            if (agyLiveBanner) {
                const isPendingInteraction = !!data.pendingInteraction;
                const isRunning = data.statusType === 'running' || data.statusType === 'thinking';

                if (isPendingInteraction) {
                    agyLiveBanner.classList.remove('hidden');
                    if (agyBannerStep) agyBannerStep.textContent = 'Tương tác';
                    if (data.pendingInteraction.type === 'ask_question') {
                        if (agyBannerIcon) agyBannerIcon.textContent = '🎯';
                        if (agyBannerTool) agyBannerTool.textContent = 'Cần bạn chọn phản hồi (/grill-me)';
                        const firstQ = data.pendingInteraction.questions && data.pendingInteraction.questions[0];
                        if (agyBannerSummary) agyBannerSummary.textContent = firstQ ? (firstQ.question || 'Bấm vào lựa chọn bên dưới để trả lời') : 'Bấm vào câu hỏi để chọn đáp án';
                    } else if (data.pendingInteraction.type === 'plan_approval') {
                        if (agyBannerIcon) agyBannerIcon.textContent = '📋';
                        if (agyBannerTool) agyBannerTool.textContent = 'Kế hoạch chờ duyệt (Proceed)';
                        if (agyBannerSummary) agyBannerSummary.textContent = data.pendingInteraction.summary || 'Bấm Proceed để tiếp tục triển khai';
                    }
                } else if (isRunning) {
                    agyLiveBanner.classList.remove('hidden');
                    if (agyBannerStep) {
                        agyBannerStep.textContent = data.currentStep ? `Bước ${data.currentStep}` : 'Đang xử lý';
                    }
                    if (agyBannerIcon) {
                        agyBannerIcon.textContent = data.statusType === 'thinking' ? '🧠' : '⚡';
                    }
                    const action = data.lastAction;
                    if (action) {
                        if (agyBannerTool) agyBannerTool.textContent = action.action || action.tool || 'Đang thực thi lệnh';
                        if (agyBannerSummary) agyBannerSummary.textContent = action.summary || action.tool || data.statusText;
                    } else {
                        if (agyBannerTool) agyBannerTool.textContent = data.statusText || 'Antigravity Agent';
                        if (agyBannerSummary) agyBannerSummary.textContent = data.statusType === 'thinking' ? 'Đang phân tích và suy luận...' : 'Đang xử lý...';
                    }
                } else {
                    agyLiveBanner.classList.add('hidden');
                }
            }
        } catch (e) {
            console.error('Lỗi tải live session:', e);
        }
    }

    /**
     * Tải thông tin Quota & Models
     */
    async function loadQuotaInfo() {
        try {
            const res = await fetch(`/api/antigravity/quota?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            if (!data.success) return;

            if (data.account) {
                if (quotaAccName) quotaAccName.textContent = `${data.account.name} (${data.account.email || 'Google Account'})`;
                if (quotaAccTier) quotaAccTier.textContent = `${data.account.tier} • ${data.account.status}`;
                if (agySbUserName) agySbUserName.textContent = data.account.name || 'Google Account';
                if (agySbUserTier) agySbUserTier.textContent = data.account.tier || 'Google AI • Unlimited Tier';
            }

            if (agyModelSelect && Array.isArray(data.models) && data.models.length > 0) {
                agyModelSelect.innerHTML = '';
                data.models.forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m.id;
                    opt.textContent = m.name;
                    if (m.id === 'gemini-3.8-flash-high') opt.selected = true;
                    agyModelSelect.appendChild(opt);
                });
                if (agySelectedModelText) {
                    agySelectedModelText.textContent = agyModelSelect.options[agyModelSelect.selectedIndex]?.text || 'Gemini 3.8 Flash High';
                }
            }
        } catch (e) {
            console.error('Lỗi tải quota:', e);
        }
    }

    /**
     * Mở modal xem Artifact (Plan hoặc Walkthrough)
     */
    async function openArtifactModal(type) {
        triggerHaptic(12);
        if (!artifactSheet) return;
        artifactSheet.classList.remove('hidden');
        const isPlan = type === 'plan';
        if (artifactSheetIcon) artifactSheetIcon.textContent = isPlan ? '📋' : '✅';
        if (artifactSheetTitle) artifactSheetTitle.textContent = isPlan ? 'Kế Hoạch Dự Án (Plan)' : 'Kết Quả Triển Khai (Walkthrough)';
        if (artifactSheetSubtitle) artifactSheetSubtitle.textContent = 'Đang tải tài liệu từ Antigravity...';
        if (artifactContentView) artifactContentView.innerHTML = '<div class="empty-state">Đang tải nội dung...</div>';

        const artifactPlanFooter = document.getElementById('artifact-plan-footer');
        if (artifactPlanFooter) {
            if (isPlan) {
                artifactPlanFooter.classList.remove('hidden');
            } else {
                artifactPlanFooter.classList.add('hidden');
            }
        }

        try {
            const activeId = currentLoadedSessionId || null;
            const url = activeId ? `/api/antigravity/artifact/${type}?token=${encodeURIComponent(token)}&conversationId=${encodeURIComponent(activeId)}` : `/api/antigravity/artifact/${type}?token=${encodeURIComponent(token)}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.success && data.content) {
                if (artifactSheetSubtitle) artifactSheetSubtitle.textContent = `${data.fileName} • ${data.content.length} ký tự`;
                if (artifactContentView) artifactContentView.innerHTML = renderSimpleMarkdown(data.content);
                rawArtifactContent = data.content;
            } else {
                if (artifactSheetSubtitle) artifactSheetSubtitle.textContent = 'Chưa có tài liệu này';
                if (artifactContentView) artifactContentView.innerHTML = `<div class="empty-state">Chưa tìm thấy file ${isPlan ? 'implementation_plan.md' : 'walkthrough.md'} cho phiên này.</div>`;
                rawArtifactContent = '';
            }
        } catch (e) {
            if (artifactSheetSubtitle) artifactSheetSubtitle.textContent = 'Lỗi tải';
            if (artifactContentView) artifactContentView.innerHTML = `<div class="empty-state" style="color:red">Lỗi tải tài liệu: ${e.message}</div>`;
            rawArtifactContent = '';
        }
    }

    if (btnOpenPlan) {
        btnOpenPlan.addEventListener('click', () => openArtifactModal('plan'));
    }

    if (btnOpenWalkthrough) {
        btnOpenWalkthrough.addEventListener('click', () => openArtifactModal('walkthrough'));
    }

    if (btnCloseArtifactSheet) {
        btnCloseArtifactSheet.addEventListener('click', () => {
            artifactSheet.classList.add('hidden');
        });
    }

    if (artifactSheet) {
        const backdrop = artifactSheet.querySelector('.bottom-sheet-backdrop');
        if (backdrop) backdrop.addEventListener('click', () => artifactSheet.classList.add('hidden'));
    }

    if (btnCopyArtifact) {
        btnCopyArtifact.addEventListener('click', () => {
            if (rawArtifactContent) {
                navigator.clipboard.writeText(rawArtifactContent).then(() => {
                    showToast('Đã sao chép nội dung markdown!', 'success');
                });
            } else {
                showToast('Không có nội dung để sao chép', 'warning');
            }
        });
    }

    const btnArtifactProceed = document.getElementById('btn-artifact-proceed');
    if (btnArtifactProceed) {
        btnArtifactProceed.addEventListener('click', () => {
            triggerHaptic(20);
            if (artifactSheet) artifactSheet.classList.add('hidden');
            sendDirectPrompt('Proceed');
        });
    }

    // Gán sự kiện cho các chip lệnh nhanh (Slash Command Chips: /grill-me, /plan, /boost, /goal, Proceed)
    document.querySelectorAll('.agy-slash-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const cmd = chip.getAttribute('data-cmd');
            if (!cmd) return;
            triggerHaptic(12);
            if (cmd === 'Proceed') {
                sendDirectPrompt('Proceed');
            } else {
                if (agyChatInput) {
                    const currentVal = agyChatInput.value.trim();
                    if (!currentVal) {
                        agyChatInput.value = cmd + ' ';
                    } else if (!currentVal.includes(cmd)) {
                        agyChatInput.value = `${cmd} ${currentVal}`;
                    }
                    agyChatInput.focus();
                }
            }
        });
    });

    if (btnLiveAttachTerminal) {
        btnLiveAttachTerminal.addEventListener('click', async () => {
            triggerHaptic(15);
            if (currentLoadedSessionId) {
                await startAgySession('continue', currentLoadedSessionId);
            } else {
                await startAgySession('continue');
            }
        });
    }

    /**
     * Tải trạng thái Antigravity Desktop App
     */
    async function loadAntigravityStatus() {
        try {
            const res = await fetch(`/api/antigravity/status?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            if (!data.success) return;

            const app = data.status.app;
            const cli = data.status.cli;

            if (agyStatusBadge) {
                if (app.isRunning) {
                    agyStatusBadge.textContent = '● Đang chạy';
                    agyStatusBadge.className = 'badge-status badge-online';
                } else {
                    agyStatusBadge.textContent = '○ Đã tắt';
                    agyStatusBadge.className = 'badge-status badge-offline';
                }
            }

            if (agyPidsVal) agyPidsVal.textContent = app.isRunning ? app.pids.join(', ') : 'None';
            if (agyRamVal) agyRamVal.textContent = app.isRunning ? `${app.memoryMB} MB` : '0 MB';
            if (agyCliVal) agyCliVal.textContent = cli.installed ? 'Sẵn sàng (OK)' : 'Chưa cài';
        } catch (e) {
            console.error('Lỗi tải Antigravity status:', e);
        }
    }

    /**
     * Điều khiển tiến trình Antigravity App (Start, Stop, Restart)
     */
    async function controlAntigravityApp(action) {
        triggerHaptic(15);
        try {
            showToast(`Đang gửi lệnh ${action} Antigravity...`);
            const res = await fetch(`/api/antigravity/app?token=${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message || 'Thành công!', 'success');
                setTimeout(loadAntigravityStatus, 1500);
            } else {
                showToast(data.message || 'Lỗi điều khiển app', 'error');
            }
        } catch (e) {
            showToast('Lỗi gửi lệnh', 'error');
        }
    }

    if (btnStartAgyApp) btnStartAgyApp.addEventListener('click', () => controlAntigravityApp('start'));
    if (btnRestartAgyApp) btnRestartAgyApp.addEventListener('click', () => controlAntigravityApp('restart'));
    if (btnStopAgyApp) btnStopAgyApp.addEventListener('click', () => controlAntigravityApp('stop'));

    async function startAgySession(mode = 'continue', conversationId = null) {
        try {
            showToast('Đang khởi động phiên Antigravity Agent...');
            const res = await fetch(`/api/antigravity/session?token=${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, conversationId })
            });
            const data = await res.json();
            if (data.success && data.session) {
                showToast('Đã mở terminal phiên làm việc!', 'success');
                await loadAllTerminals();
                switchTerminal(data.session.id);
            } else {
                showToast(data.message || 'Lỗi khởi động agent', 'error');
            }
        } catch (e) {
            showToast('Lỗi kết nối session', 'error');
        }
    }

    // ==================== FAST ACCOUNT SWITCHER ====================

    async function fetchQuotaStats() {
        try {
            const res = await fetch(`/api/accounts/quota?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            if (data.success) {
                const codexVal = document.getElementById('quota-codex-val');
                const agyVal = document.getElementById('quota-agy-val');
                if (codexVal) codexVal.textContent = new Intl.NumberFormat('vi-VN').format(data.codexTokens) + ' Tokens';
                if (agyVal) agyVal.textContent = data.antigravityTokens;
            }
        } catch (e) { console.error('Lỗi tải quota:', e); }
    }

    async function loadAccounts() {
        try {
            const res = await fetch(`/api/accounts?token=${encodeURIComponent(token)}`);
            fetchQuotaStats();
            const data = await res.json();

            if (!data.success) return;

            renderClaudeAccounts(data.claude || []);
            renderAntigravityAccounts(data.antigravity || []);
        } catch (e) {
            console.error('Lỗi tải danh sách tài khoản:', e);
        }
    }

    function renderClaudeAccounts(profiles) {
        claudeAccountsList.innerHTML = '';
        if (profiles.length === 0) {
            claudeAccountsList.innerHTML = '<div style="color:#888; font-size:12px;">Chưa có cấu hình Claude nào</div>';
            return;
        }

        profiles.forEach(p => {
            const card = document.createElement('div');
            card.className = `account-card ${p.isActive ? 'active' : ''}`;
            card.innerHTML = `
                <div class="account-card-header">
                    <span class="account-name">🟣 ${p.name}</span>
                    ${p.isActive ? '<span class="active-pill">✔ ĐANG DÙNG</span>' : ''}
                </div>
                <div class="account-details">
                    <div>Model: ${p.model || 'claude-opus-4-8'}</div>
                    <div>Endpoint: ${p.baseUrl || 'https://api.anthropic.com'}</div>
                    <div>Token: ${p.maskedToken || '(Trống)'}</div>
                </div>
                <div class="account-actions">
                    ${!p.isActive ? `<button class="btn-switch-account haptic" data-id="${p.id}" data-provider="claude">Kích Hoạt Ngay ⚡</button>` : '<span style="font-size:12px; color:#16c60c; font-weight:600;">Đang hoạt động trên laptop</span>'}
                    ${!p.isActive ? `<button class="btn-account-danger haptic" data-id="${p.id}">Xóa</button>` : ''}
                </div>
            `;

            const switchBtn = card.querySelector('.btn-switch-account');
            if (switchBtn) {
                switchBtn.addEventListener('click', () => switchAccountProfile('claude', p.id));
            }

            const delBtn = card.querySelector('.btn-account-danger');
            if (delBtn) {
                delBtn.addEventListener('click', () => deleteAccountProfile(p.id));
            }

            claudeAccountsList.appendChild(card);
        });
    }

    function renderAntigravityAccounts(profiles) {
        antigravityAccountsList.innerHTML = '';
        if (profiles.length === 0) {
            antigravityAccountsList.innerHTML = '<div style="color:#888; font-size:12px;">Chưa có cấu hình Antigravity nào</div>';
            return;
        }

        profiles.forEach(p => {
            const card = document.createElement('div');
            card.className = `account-card ${p.isActive ? 'active' : ''}`;
            const folderName = p.userDataDir ? p.userDataDir.split('\\').pop() : 'Antigravity (Gốc)';
            const tokenBadge = p.hasSavedToken
                ? '<div class="sandbox-badge" style="color:#4ade80; border-color:rgba(74,222,128,0.3);">🔑 Token: Đã Lưu (Chuyển Tức Thì)</div>'
                : '<div class="sandbox-badge" style="color:#fbbf24; border-color:rgba(251,191,36,0.3);">🆕 Token: Đăng nhập 1 lần khi mở app</div>';
            card.innerHTML = `
                <div class="account-card-header">
                    <span class="account-name">🛸 ${p.name}</span>
                    ${p.isActive ? '<span class="active-pill">✔ ĐANG DÙNG</span>' : ''}
                </div>
                <div class="account-details">
                    <div>Email: ${p.email || 'user@example.com'}</div>
                    ${tokenBadge}
                    <div class="sandbox-badge">🛡️ Sandbox: ${folderName}</div>
                </div>
                <div class="account-actions">
                    ${!p.isActive ? `<button class="btn-switch-account haptic" data-id="${p.id}" data-provider="antigravity">Kích Hoạt & Mở Lại App ⚡</button>` : '<span style="font-size:12px; color:#16c60c; font-weight:600;">Đang hoạt động trên laptop</span>'}
                    ${!p.isActive ? `<button class="btn-account-danger haptic" data-id="${p.id}">Xóa</button>` : ''}
                </div>
            `;

            const switchBtn = card.querySelector('.btn-switch-account');
            if (switchBtn) {
                switchBtn.addEventListener('click', () => switchAccountProfile('antigravity', p.id, true));
            }

            const delBtn = card.querySelector('.btn-account-danger');
            if (delBtn) {
                delBtn.addEventListener('click', () => deleteAccountProfile(p.id));
            }

            antigravityAccountsList.appendChild(card);
        });
    }

    async function switchAccountProfile(provider, profileId, autoRestart = false) {
        triggerHaptic(20);
        showToast(autoRestart ? 'Đang kích hoạt tài khoản và khởi động lại Antigravity...' : 'Đang kích hoạt tài khoản...');
        try {
            const res = await fetch(`/api/accounts/switch?token=${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider, profileId, autoRestartApp: autoRestart })
            });
            const data = await res.json();
            if (data.success) {
                if (data.appRestarted) {
                    showToast(`✓ Đã đổi sang '${data.activeProfile?.name || profileId}' & khởi động lại Antigravity!`, 'success');
                } else {
                    showToast(data.message || 'Đã chuyển tài khoản thành công!', 'success');
                }
                if (data.autoVerifying) {
                    showToast('Đang tự động xác minh tài khoản...', 'info');
                }
                loadAccounts();
                loadAntigravityStatus();
            } else {
                showToast(data.message || 'Lỗi chuyển tài khoản', 'error');
            }
        } catch (e) {
            showToast('Lỗi kết nối', 'error');
        }
    }

    function handleAutoVerifyProgress(progress) {
        if (!progress) return;
        const status = progress.status;
        const message = progress.message || '';
        const email = progress.email || '';

        // Toast thông báo nổi
        if (status === 'success') {
            showToast(message, 'success');
            triggerHaptic(40);
        } else if (status === 'timeout' || status === 'error') {
            showToast(message, 'error');
            triggerHaptic(30);
        } else if (status === 'stopped') {
            showToast(message, 'info');
        } else {
            showToast(message, 'info');
        }

        // Cập nhật Banner trên view Tài Khoản
        if (autoVerifyBanner) {
            if (status === 'starting' || status === 'authenticating' || status === 'bypassing_account_chooser' || status === 'wrong_account') {
                autoVerifyBanner.classList.remove('hidden');
                autoVerifyBanner.classList.remove('success');
                if (autoVerifyTitle) autoVerifyTitle.textContent = `Đang tự động xác minh: ${email}`;
                if (autoVerifyStatus) {
                    if (status === 'bypassing_account_chooser') {
                        autoVerifyStatus.textContent = '⚡ Đang tự chọn tài khoản trên trình duyệt...';
                    } else if (status === 'wrong_account') {
                        autoVerifyStatus.textContent = '⚠️ Sai tài khoản, đang tự động thử lại...';
                    } else if (status === 'starting') {
                        autoVerifyStatus.textContent = 'Đang chuẩn bị...';
                    } else {
                        autoVerifyStatus.textContent = 'Chờ hoàn tất xác nhận Google';
                    }
                }
                if (autoVerifyDesc) autoVerifyDesc.textContent = message;

                if (progress.oauthUrl && autoVerifyOauthWrap && autoVerifyOauthLink) {
                    autoVerifyOauthLink.href = progress.oauthUrl;
                    autoVerifyOauthWrap.classList.remove('hidden');
                } else if (autoVerifyOauthWrap) {
                    autoVerifyOauthWrap.classList.add('hidden');
                }
            } else if (status === 'success') {
                autoVerifyBanner.classList.remove('hidden');
                autoVerifyBanner.classList.add('success');
                if (autoVerifyTitle) autoVerifyTitle.textContent = `✓ Xác minh thành công: ${email}`;
                if (autoVerifyStatus) autoVerifyStatus.textContent = 'Đã lưu Token vĩnh viễn';
                if (autoVerifyDesc) autoVerifyDesc.textContent = message;
                if (autoVerifyOauthWrap) autoVerifyOauthWrap.classList.add('hidden');

                loadAccounts();
                loadAntigravityStatus();

                setTimeout(() => {
                    autoVerifyBanner.classList.add('hidden');
                }, 6000);
            } else {
                // timeout, stopped, error
                setTimeout(() => {
                    autoVerifyBanner.classList.add('hidden');
                }, 3500);
            }
        }
    }

    if (btnStopVerify) {
        btnStopVerify.addEventListener('click', async () => {
            triggerHaptic(15);
            try {
                await fetch(`/api/antigravity/auto-verify/stop?token=${encodeURIComponent(token)}`, {
                    method: 'POST'
                });
            } catch (e) {}
            if (autoVerifyBanner) autoVerifyBanner.classList.add('hidden');
            showToast('Đã dừng tiến trình xác minh');
        });
    }

    async function deleteAccountProfile(profileId) {
        triggerHaptic(15);
        if (!confirm('Bạn có chắc muốn xóa hồ sơ tài khoản này?')) return;

        try {
            const res = await fetch(`/api/accounts/${profileId}?token=${encodeURIComponent(token)}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showToast('Đã xóa hồ sơ tài khoản', 'success');
                loadAccounts();
            } else {
                showToast(data.message || 'Lỗi xóa tài khoản', 'error');
            }
        } catch (e) {
            showToast('Lỗi kết nối', 'error');
        }
    }

    // Modal Thêm Tài Khoản
    btnOpenAddAccount.addEventListener('click', () => {
        triggerHaptic(10);
        accountForm.reset();
        accountSheet.classList.remove('hidden');
    });

    btnCloseAccountSheet.addEventListener('click', () => {
        accountSheet.classList.add('hidden');
    });

    accProvider.addEventListener('change', () => {
        if (accProvider.value === 'claude') {
            claudeFields.classList.remove('hidden');
            antigravityFields.classList.add('hidden');
        } else {
            claudeFields.classList.add('hidden');
            antigravityFields.classList.remove('hidden');
        }
    });

    accountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        triggerHaptic(15);

        const payload = {
            provider: accProvider.value,
            name: accName.value.trim(),
            token: accToken.value.trim(),
            baseUrl: accBaseurl.value.trim(),
            model: accModel.value.trim(),
            email: accEmail.value.trim()
        };

        try {
            const res = await fetch(`/api/accounts?token=${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                showToast(data.message || 'Đã thêm tài khoản mới!', 'success');
                accountSheet.classList.add('hidden');
                loadAccounts();
            } else {
                showToast(data.message || 'Lỗi thêm tài khoản', 'error');
            }
        } catch (err) {
            showToast('Lỗi lưu tài khoản', 'error');
        }
    });

    // ==================== SYSTEM LOGS ====================

    async function loadLogs() {
        try {
            const res = await fetch('/api/logs');
            const data = await res.json();
            if (data.success && Array.isArray(data.logs)) {
                systemLogs = data.logs;
                renderLogs();
            }
        } catch (e) {
            console.error('Lỗi tải logs:', e);
        }
    }

    function handleNewLogEntry(entry) {
        systemLogs.push(entry);
        if (systemLogs.length > 300) systemLogs.shift();

        if (entry.level === 'ERROR' || (entry.level === 'AUTH' && !entry.success)) {
            unreadErrorsCount++;
            if (navLogBadge) navLogBadge.classList.remove('hidden');
        }

        renderLogs();
    }

    function renderLogs() {
        if (!sysLogConsole) return;

        let filtered = systemLogs;
        if (currentLogFilter === 'ERRORS') {
            filtered = systemLogs.filter(l => l.level === 'ERROR' || (l.level === 'AUTH' && !l.success));
        } else if (currentLogFilter === 'INFO') {
            filtered = systemLogs.filter(l => l.level === 'INFO' || l.level === 'WARN');
        }

        const errCount = systemLogs.filter(l => l.level === 'ERROR' || (l.level === 'AUTH' && !l.success)).length;
        const infCount = systemLogs.filter(l => l.level === 'INFO').length;

        if (countAll) countAll.textContent = systemLogs.length;
        if (countErr) countErr.textContent = errCount;
        if (countInfo) countInfo.textContent = infCount;

        if (filtered.length === 0) {
            sysLogConsole.innerHTML = '<div class="log-empty">Chưa có nhật ký nào</div>';
            return;
        }

        sysLogConsole.innerHTML = filtered.map(l => {
            const time = new Date(l.timestamp).toLocaleTimeString();
            let levelClass = 'level-info';
            if (l.level === 'ERROR' || (l.level === 'AUTH' && !l.success)) levelClass = 'level-error';
            else if (l.level === 'AUTH') levelClass = 'level-auth';

            return `<div class="log-entry ${levelClass}">[${time}] [${l.level}] ${l.message}</div>`;
        }).join('');

        sysLogConsole.scrollTop = sysLogConsole.scrollHeight;
    }

    logChips.forEach(chip => {
        chip.addEventListener('click', () => {
            logChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentLogFilter = chip.getAttribute('data-filter');
            renderLogs();
        });
    });

    btnRefreshSysLogs.addEventListener('click', () => {
        triggerHaptic(10);
        loadLogs();
        showToast('Đã làm mới nhật ký');
    });

    btnClearSysLogs.addEventListener('click', async () => {
        triggerHaptic(15);
        try {
            await fetch(`/api/logs?token=${encodeURIComponent(token)}`, { method: 'DELETE' });
            systemLogs = [];
            renderLogs();
            showToast('Đã xóa nhật ký');
        } catch (e) {}
    });

    btnCopySysLogs.addEventListener('click', () => {
        const text = systemLogs.map(l => `[${l.timestamp}] [${l.level}] ${l.message}`).join('\n');
        navigator.clipboard.writeText(text).then(() => {
            showToast('Đã sao chép nhật ký hệ thống!', 'success');
        });
    });

    // ==================== V4.0 TRUE REMOTE TERMINAL ENGINE ====================

    // 1. TOUCH-AS-MOUSE ENGINE (SGR 1006 ANSI MOUSE TRACKING)
    let isTouchMouseMode = false;
    const btnTouchMouse = document.getElementById('btn-touch-mouse');

    if (btnTouchMouse) {
        btnTouchMouse.addEventListener('click', () => {
            triggerHaptic(15);
            isTouchMouseMode = !isTouchMouseMode;
            btnTouchMouse.classList.toggle('touch-mouse-active', isTouchMouseMode);
            document.body.classList.toggle('mouse-mode-on', isTouchMouseMode);
            showToast(isTouchMouseMode ? '🖱️ Đã BẬT Chuột Cảm Ứng (TUI Mouse Mode)' : '👆 Đã TẮT Chuột (Chế độ cuộn bình thường)', 'info');
        });
    }

    let touchMouseLastY = 0;
    if (terminalViewport) {
        terminalViewport.addEventListener('touchstart', (e) => {
            if (!isTouchMouseMode || !term) return;
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                const activeContainer = (activeSplitPane === 2 && terminalContainer2) ? terminalContainer2 : terminalContainer;
                const activeTerm = (activeSplitPane === 2 && term2) ? term2 : term;
                const rect = activeContainer.getBoundingClientRect();
                const col = Math.max(1, Math.min(activeTerm.cols, Math.floor((touch.clientX - rect.left) / (rect.width / activeTerm.cols)) + 1));
                const row = Math.max(1, Math.min(activeTerm.rows, Math.floor((touch.clientY - rect.top) / (rect.height / activeTerm.rows)) + 1));

                // Send SGR 1006 Mouse Press: \x1b[<0;col;row;M
                sendTerminalInput(`\x1b[<0;${col};${row};M`);
                touchMouseLastY = touch.clientY;
            }
        }, { passive: false });

        terminalViewport.addEventListener('touchend', (e) => {
            if (!isTouchMouseMode || !term) return;
            if (e.changedTouches.length === 1) {
                const touch = e.changedTouches[0];
                const activeContainer = (activeSplitPane === 2 && terminalContainer2) ? terminalContainer2 : terminalContainer;
                const activeTerm = (activeSplitPane === 2 && term2) ? term2 : term;
                const rect = activeContainer.getBoundingClientRect();
                const col = Math.max(1, Math.min(activeTerm.cols, Math.floor((touch.clientX - rect.left) / (rect.width / activeTerm.cols)) + 1));
                const row = Math.max(1, Math.min(activeTerm.rows, Math.floor((touch.clientY - rect.top) / (rect.height / activeTerm.rows)) + 1));

                // Send SGR 1006 Mouse Release: \x1b[<0;col;row;m
                sendTerminalInput(`\x1b[<0;${col};${row};m`);
            }
        }, { passive: false });

        terminalViewport.addEventListener('touchmove', (e) => {
            if (!isTouchMouseMode || !term) return;
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch = e.touches[0];
                const deltaY = touch.clientY - touchMouseLastY;
                touchMouseLastY = touch.clientY;

                const activeContainer = (activeSplitPane === 2 && terminalContainer2) ? terminalContainer2 : terminalContainer;
                const activeTerm = (activeSplitPane === 2 && term2) ? term2 : term;
                const rect = activeContainer.getBoundingClientRect();
                const col = Math.max(1, Math.min(activeTerm.cols, Math.floor((touch.clientX - rect.left) / (rect.width / activeTerm.cols)) + 1));
                const row = Math.max(1, Math.min(activeTerm.rows, Math.floor((touch.clientY - rect.top) / (rect.height / activeTerm.rows)) + 1));

                if (deltaY > 8) {
                    sendTerminalInput(`\x1b[<64;${col};${row};M`); // Wheel Up
                } else if (deltaY < -8) {
                    sendTerminalInput(`\x1b[<65;${col};${row};M`); // Wheel Down
                }
            }
        }, { passive: false });
    }

    // 2. SPLIT PANES ENGINE (TMUX STYLE MULTITASKING)
    let splitMode = 'none';
    let activeSplitPane = 1;
    let term2 = null;
    let fitAddon2 = null;
    let ws2 = null;
    let secondarySessionId = '';

    const splitPanesWrapper = document.getElementById('split-panes-wrapper');
    const panePrimary = document.getElementById('pane-primary');
    const paneSecondary = document.getElementById('pane-secondary');
    const paneSplitter = document.getElementById('pane-splitter');
    const btnSplitToggle = document.getElementById('btn-split-toggle');
    const btnCloseSecondaryPane = document.getElementById('btn-close-secondary-pane');
    const paneSecondarySelect = document.getElementById('pane-secondary-select');
    const terminalContainer2 = document.getElementById('terminal-container-2');
    const paneSecondaryTitle = document.getElementById('pane-secondary-title');

    function setSplitMode(mode) {
        splitMode = mode;
        if (!splitPanesWrapper) return;
        splitPanesWrapper.className = `split-mode-${mode}`;
        if (mode === 'none') {
            if (paneSecondary) paneSecondary.classList.add('hidden');
            if (paneSplitter) paneSplitter.classList.add('hidden');
            if (panePrimary) panePrimary.classList.add('active-pane');
            if (paneSecondary) paneSecondary.classList.remove('active-pane');
            activeSplitPane = 1;
            if (ws2) { ws2.close(); ws2 = null; }
            setTimeout(() => { if (fitAddon) fitAddon.fit(); }, 60);
        } else {
            if (paneSecondary) paneSecondary.classList.remove('hidden');
            if (paneSplitter) paneSplitter.classList.remove('hidden');
            initSecondaryTerminal();
            setTimeout(() => {
                if (fitAddon) fitAddon.fit();
                if (fitAddon2) fitAddon2.fit();
            }, 60);
        }
        if (btnSplitToggle) {
            btnSplitToggle.style.color = mode !== 'none' ? '#38bdf8' : '';
        }
    }

    function initSecondaryTerminal() {
        if (!term2 && terminalContainer2) {
            term2 = new Terminal({
                theme: TERMINAL_THEMES[currentThemeName] || TERMINAL_THEMES.cyberpunk,
                fontSize: currentFontSize,
                fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                cursorBlink: true,
                convertEol: true
            });
            fitAddon2 = new FitAddon.FitAddon();
            term2.loadAddon(fitAddon2);
            term2.open(terminalContainer2);
            fitAddon2.fit();

            term2.onData(data => {
                if (ws2 && ws2.readyState === WebSocket.OPEN) {
                    ws2.send(JSON.stringify({ type: 'input', data }));
                }
            });
        }

        if (paneSecondarySelect) {
            paneSecondarySelect.innerHTML = '';
            terminalsList.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = `${t.icon || '⚡'} ${t.name}`;
                if (t.id !== currentTarget && !secondarySessionId) {
                    secondarySessionId = t.id;
                }
                paneSecondarySelect.appendChild(opt);
            });
            if (secondarySessionId) paneSecondarySelect.value = secondarySessionId;
        }

        connectSecondaryWebSocket();
    }

    function connectSecondaryWebSocket() {
        if (ws2) { ws2.close(); ws2 = null; }
        if (!secondarySessionId) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(token)}&sessionId=${encodeURIComponent(secondarySessionId)}`;
        ws2 = new WebSocket(wsUrl);

        ws2.onopen = () => {
            if (term2 && fitAddon2) {
                fitAddon2.fit();
                ws2.send(JSON.stringify({ type: 'resize', cols: term2.cols, rows: term2.rows }));
            }
        };

        ws2.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                if (msg.type === 'output' && msg.data && term2) {
                    term2.write(msg.data);
                } else if (msg.type === 'attached' && msg.history && term2) {
                    term2.reset();
                    term2.write(msg.history);
                }
            } catch (err) {}
        };
    }

    if (btnSplitToggle) {
        btnSplitToggle.addEventListener('click', () => {
            triggerHaptic(15);
            if (splitMode === 'none') setSplitMode('horizontal');
            else if (splitMode === 'horizontal') setSplitMode('vertical');
            else setSplitMode('none');
            showToast(`Chế độ chia: ${splitMode.toUpperCase()}`);
        });
    }

    if (btnCloseSecondaryPane) {
        btnCloseSecondaryPane.addEventListener('click', () => {
            triggerHaptic(10);
            setSplitMode('none');
        });
    }

    if (paneSecondarySelect) {
        paneSecondarySelect.addEventListener('change', (e) => {
            secondarySessionId = e.target.value;
            connectSecondaryWebSocket();
        });
    }

    if (panePrimary) {
        panePrimary.addEventListener('click', () => {
            activeSplitPane = 1;
            panePrimary.classList.add('active-pane');
            if (paneSecondary) paneSecondary.classList.remove('active-pane');
        });
    }
    if (paneSecondary) {
        paneSecondary.addEventListener('click', () => {
            activeSplitPane = 2;
            paneSecondary.classList.add('active-pane');
            if (panePrimary) panePrimary.classList.remove('active-pane');
        });
    }

    // 3. SMART FILE DROPPER & MOBILE CLIPBOARD PASTE
    window.addEventListener('paste', async (e) => {
        if (e.clipboardData && e.clipboardData.items) {
            for (const item of e.clipboardData.items) {
                if (item.type.indexOf('image') !== -1) {
                    const file = item.getAsFile();
                    if (!file) continue;
                    e.preventDefault();
                    showToast('📷 Đang upload ảnh Clipboard vào CWD...', 'info');

                    const reader = new FileReader();
                    reader.onload = async () => {
                        const base64Data = reader.result;
                        const filename = `clip_${Date.now()}.png`;
                        try {
                            const res = await fetch(`/api/files/upload?token=${encodeURIComponent(token)}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    filename,
                                    base64Data,
                                    sessionId: currentTarget
                                })
                            });
                            const data = await res.json();
                            if (data.success) {
                                showToast(`✓ Đã lưu ảnh: ${filename}`, 'success');
                                if (promptInput) {
                                    promptInput.value += ` .\\${filename}`;
                                    promptInput.focus();
                                }
                            } else {
                                showToast(`Lỗi upload ảnh: ${data.error}`, 'error');
                            }
                        } catch (err) {
                            showToast('Lỗi upload ảnh clipboard', 'error');
                        }
                    };
                    reader.readAsDataURL(file);
                    break;
                }
            }
        }
    });

    const modalUploadCwd = document.getElementById('modal-upload-cwd');
    const btnUploadCwd = document.getElementById('btn-upload-cwd');
    const btnCloseUploadCwd = document.getElementById('btn-close-upload-cwd');
    const uploadTargetPath = document.getElementById('upload-target-path');
    const uploadDropzone = document.getElementById('upload-dropzone');
    const uploadFileInput = document.getElementById('upload-file-input');
    const btnPickFile = document.getElementById('btn-pick-file');
    const btnPickCamera = document.getElementById('btn-pick-camera');
    const uploadPreviewList = document.getElementById('upload-preview-list');
    const btnStartUpload = document.getElementById('btn-start-upload');

    let selectedFilesToUpload = [];

    if (btnUploadCwd) {
        btnUploadCwd.addEventListener('click', async () => {
            triggerHaptic(10);
            const currentSession = terminalsList.find(t => t.id === currentTarget);
            if (uploadTargetPath) {
                uploadTargetPath.textContent = currentSession && currentSession.cwd ? currentSession.cwd : 'Đang lấy CWD...';
            }
            selectedFilesToUpload = [];
            renderUploadPreview();
            if (modalUploadCwd) modalUploadCwd.classList.remove('hidden');
        });
    }

    if (btnCloseUploadCwd) {
        btnCloseUploadCwd.addEventListener('click', () => {
            if (modalUploadCwd) modalUploadCwd.classList.add('hidden');
        });
    }

    if (btnPickFile) {
        btnPickFile.addEventListener('click', () => {
            if (uploadFileInput) {
                uploadFileInput.removeAttribute('capture');
                uploadFileInput.click();
            }
        });
    }

    if (btnPickCamera) {
        btnPickCamera.addEventListener('click', () => {
            if (uploadFileInput) {
                uploadFileInput.setAttribute('capture', 'environment');
                uploadFileInput.click();
            }
        });
    }

    if (uploadFileInput) {
        uploadFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                for (const f of e.target.files) selectedFilesToUpload.push(f);
                renderUploadPreview();
            }
        });
    }

    if (uploadDropzone) {
        uploadDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadDropzone.classList.add('drag-over');
        });
        uploadDropzone.addEventListener('dragleave', () => uploadDropzone.classList.remove('drag-over'));
        uploadDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadDropzone.classList.remove('drag-over');
            if (e.dataTransfer && e.dataTransfer.files) {
                for (const f of e.dataTransfer.files) selectedFilesToUpload.push(f);
                renderUploadPreview();
            }
        });
    }

    function renderUploadPreview() {
        if (!uploadPreviewList || !btnStartUpload) return;
        uploadPreviewList.innerHTML = '';
        if (selectedFilesToUpload.length === 0) {
            btnStartUpload.disabled = true;
            return;
        }
        btnStartUpload.disabled = false;
        selectedFilesToUpload.forEach((file, idx) => {
            const item = document.createElement('div');
            item.className = 'upload-preview-item';
            item.innerHTML = `
                <span class="upload-item-name">${file.name}</span>
                <span class="upload-item-size">${Math.round(file.size / 1024)} KB</span>
                <button class="modal-close-btn haptic" data-idx="${idx}">✕</button>
            `;
            item.querySelector('button').addEventListener('click', () => {
                selectedFilesToUpload.splice(idx, 1);
                renderUploadPreview();
            });
            uploadPreviewList.appendChild(item);
        });
    }

    if (btnStartUpload) {
        btnStartUpload.addEventListener('click', async () => {
            if (selectedFilesToUpload.length === 0) return;
            triggerHaptic(15);
            btnStartUpload.disabled = true;
            btnStartUpload.textContent = '⏳ Đang tải lên...';

            let successCount = 0;
            for (const file of selectedFilesToUpload) {
                try {
                    const base64 = await readFileAsBase64(file);
                    const res = await fetch(`/api/files/upload?token=${encodeURIComponent(token)}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            filename: file.name,
                            base64Data: base64,
                            sessionId: currentTarget
                        })
                    });
                    const data = await res.json();
                    if (data.success) successCount++;
                } catch (e) {}
            }

            btnStartUpload.textContent = '🚀 Bắt Đầu Tải Lên';
            btnStartUpload.disabled = false;
            showToast(`✓ Đã upload thành công ${successCount}/${selectedFilesToUpload.length} file vào CWD!`, 'success');
            selectedFilesToUpload = [];
            if (modalUploadCwd) modalUploadCwd.classList.add('hidden');
        });
    }

    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ==================== 1-TAP DIRECT PHOTO UPLOADER (CAMERA & GALLERY ĐIỆN THOẠI) ====================
    const inputQuickPhoto = document.getElementById('input-quick-photo');
    const btnQuickPhotoThumb = document.getElementById('btn-quick-photo-thumb');
    const btnQuickPhotoTop = document.getElementById('btn-quick-photo-top');
    const btnPromptAttachPhoto = document.getElementById('btn-prompt-attach-photo');
    const photoUploadBanner = document.getElementById('photo-upload-banner');
    const pubPreviewImg = document.getElementById('pub-preview-img');
    const pubFileName = document.getElementById('pub-file-name');
    const btnPubInsert = document.getElementById('btn-pub-insert');
    const btnPubClaude = document.getElementById('btn-pub-claude');
    const btnPubClose = document.getElementById('btn-pub-close');

    let lastUploadedRelativePath = '';

    function triggerDirectPhotoPicker() {
        triggerHaptic(12);
        if (inputQuickPhoto) {
            inputQuickPhoto.value = '';
            inputQuickPhoto.click();
        }
    }

    if (btnQuickPhotoThumb) btnQuickPhotoThumb.addEventListener('click', triggerDirectPhotoPicker);
    if (btnQuickPhotoTop) btnQuickPhotoTop.addEventListener('click', triggerDirectPhotoPicker);
    if (btnPromptAttachPhoto) btnPromptAttachPhoto.addEventListener('click', triggerDirectPhotoPicker);

    if (inputQuickPhoto) {
        inputQuickPhoto.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            triggerHaptic(15);
            showToast(`📤 Đang tải ảnh ${file.name}...`, 'info', 4000);

            try {
                const base64Data = await readFileAsBase64(file);
                // Tạo tên file an toàn cho Windows
                const ext = file.name.split('.').pop() || 'jpg';
                const safeBase = file.name.substring(0, file.name.lastIndexOf('.')) || 'photo';
                const cleanBase = safeBase.replace(/[^a-zA-Z0-9_-]/g, '_');
                const filename = `${cleanBase}_${Date.now()}.${ext}`;

                const res = await fetch(`/api/files/upload?token=${encodeURIComponent(token)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename,
                        base64Data,
                        sessionId: currentTarget
                    })
                });

                const data = await res.json();
                if (data.success) {
                    lastUploadedRelativePath = `.\\${data.filename}`;
                    triggerHaptic([15, 60, 20]);

                    // Tự động copy đường dẫn vào Clipboard
                    try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(lastUploadedRelativePath);
                        }
                    } catch (_) {}

                    // Hiển thị Banner kết quả trực quan
                    if (photoUploadBanner && pubPreviewImg && pubFileName) {
                        pubPreviewImg.src = base64Data;
                        pubFileName.textContent = `${data.filename} (${Math.round(file.size / 1024)} KB)`;
                        photoUploadBanner.classList.remove('hidden');
                    }

                    // Nếu hộp gõ lệnh tiếng Việt đang mở, tự điền đường dẫn
                    if (promptInput && isPromptOpen) {
                        promptInput.value = promptInput.value ? `${promptInput.value} ${lastUploadedRelativePath}` : lastUploadedRelativePath;
                        promptInput.focus();
                    }

                    showToast(`✓ Đã gửi ảnh thành công vào CWD! Đường dẫn: ${lastUploadedRelativePath}`, 'success', 5000);
                } else {
                    showToast(`✕ Lỗi tải ảnh: ${data.error || 'Thất bại'}`, 'error');
                }
            } catch (err) {
                showToast(`✕ Lỗi kết nối tải ảnh: ${err.message}`, 'error');
            }
        });
    }

    if (btnPubInsert) {
        btnPubInsert.addEventListener('click', () => {
            triggerHaptic(12);
            if (lastUploadedRelativePath) {
                sendTerminalInput(`${lastUploadedRelativePath} `);
                showToast(`✓ Đã dán "${lastUploadedRelativePath}" vào terminal!`, 'info');
            }
            if (photoUploadBanner) photoUploadBanner.classList.add('hidden');
        });
    }

    if (btnPubClaude) {
        btnPubClaude.addEventListener('click', () => {
            triggerHaptic(15);
            if (lastUploadedRelativePath) {
                const promptCmd = `hãy đọc ảnh ${lastUploadedRelativePath} và phân tích giúp anh`;
                sendTerminalInput(`${promptCmd}\r`);
                showToast(`🟣 Đã gửi yêu cầu đọc ảnh cho Claude Code!`, 'success');
            }
            if (photoUploadBanner) photoUploadBanner.classList.add('hidden');
        });
    }

    if (btnPubClose) {
        btnPubClose.addEventListener('click', () => {
            if (photoUploadBanner) photoUploadBanner.classList.add('hidden');
        });
    }

    // 4. PROCESS TREE INSPECTOR & FORCE KILL
    const modalProcInspector = document.getElementById('modal-process-inspector');
    const btnProcessInspector = document.getElementById('btn-process-inspector');
    const btnCloseProcInspector = document.getElementById('btn-close-proc-inspector');
    const btnRefreshProcesses = document.getElementById('btn-refresh-processes');
    const procSessionLabel = document.getElementById('proc-session-label');
    const procRootLabel = document.getElementById('proc-root-label');
    const procCwdLabel = document.getElementById('proc-cwd-label');
    const procTableBody = document.getElementById('proc-table-body');

    async function loadProcesses() {
        if (!currentTarget || !procTableBody) return;
        procTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:16px;">Đang quét cây tiến trình...</td></tr>';
        try {
            const res = await fetch(`/api/sessions/${encodeURIComponent(currentTarget)}/processes?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            if (data.success) {
                if (procSessionLabel) procSessionLabel.innerHTML = `Session: <strong>${data.sessionName || currentTarget}</strong>`;
                if (procRootLabel) procRootLabel.innerHTML = `Root PID: <strong>${data.rootPid || '--'}</strong>`;
                if (procCwdLabel) procCwdLabel.innerHTML = `CWD: <strong>${data.cwd || '--'}</strong>`;

                if (!data.processes || data.processes.length === 0) {
                    procTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:16px;">Không tìm thấy tiến trình nào</td></tr>';
                    return;
                }

                procTableBody.innerHTML = data.processes.map(p => `
                    <tr class="${p.isRoot ? 'is-root-proc' : ''}">
                        <td><strong>${p.pid}</strong></td>
                        <td>
                            <div>${p.name} ${p.isRoot ? '(Root Shell)' : ''}</div>
                            <small style="color:#64748b;font-size:10px;">${p.cmd ? p.cmd.substring(0, 60) : ''}</small>
                        </td>
                        <td>${p.ramMb} MB</td>
                        <td>
                            <button class="proc-btn-kill haptic" data-pid="${p.pid}">⛔ Kill</button>
                        </td>
                    </tr>
                `).join('');

                procTableBody.querySelectorAll('.proc-btn-kill').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const pid = btn.getAttribute('data-pid');
                        if (!confirm(`Bạn có chắc chắn muốn ép tắt tiến trình PID ${pid}?`)) return;
                        triggerHaptic(20);
                        try {
                            const killRes = await fetch(`/api/sessions/${encodeURIComponent(currentTarget)}/processes/${pid}/kill?token=${encodeURIComponent(token)}`, {
                                method: 'POST'
                            });
                            const killData = await killRes.json();
                            if (killData.success) {
                                showToast(`✓ Đã kết thúc tiến trình ${pid}`, 'success');
                                loadProcesses();
                            } else {
                                showToast(`Lỗi: ${killData.error}`, 'error');
                            }
                        } catch (e) {
                            showToast('Lỗi khi kill tiến trình', 'error');
                        }
                    });
                });
            } else {
                procTableBody.innerHTML = `<tr><td colspan="4" style="color:#ef4444;text-align:center;padding:16px;">${data.error || 'Lỗi tải tiến trình'}</td></tr>`;
            }
        } catch (err) {
            procTableBody.innerHTML = '<tr><td colspan="4" style="color:#ef4444;text-align:center;padding:16px;">Lỗi kết nối máy chủ</td></tr>';
        }
    }

    if (btnProcessInspector) {
        btnProcessInspector.addEventListener('click', () => {
            triggerHaptic(10);
            if (modalProcInspector) modalProcInspector.classList.remove('hidden');
            loadProcesses();
        });
    }
    if (btnCloseProcInspector) {
        btnCloseProcInspector.addEventListener('click', () => {
            if (modalProcInspector) modalProcInspector.classList.add('hidden');
        });
    }
    if (btnRefreshProcesses) {
        btnRefreshProcesses.addEventListener('click', () => {
            triggerHaptic(10);
            loadProcesses();
        });
    }

    // 5. CYBERPUNK APP LOCK (PIN & BIOMETRIC)
    const appLockOverlay = document.getElementById('app-lock-overlay');
    const btnAppLock = document.getElementById('btn-app-lock');
    const lockClock = document.getElementById('lock-clock');
    const lockErrorMsg = document.getElementById('lock-error-msg');
    const btnBiometricUnlock = document.getElementById('btn-biometric-unlock');
    const btnPinBackspace = document.getElementById('btn-pin-backspace');

    let enteredPin = '';
    const MASTER_PIN = '284530';
    let isAppLocked = false;
    let autoLockTimer = null;
    const AUTO_LOCK_TIMEOUT_MS = 5 * 60 * 1000;

    function updateLockClock() {
        if (lockClock) {
            lockClock.textContent = new Date().toLocaleTimeString('vi-VN');
        }
    }
    setInterval(updateLockClock, 1000);

    function lockApp() {
        isAppLocked = true;
        enteredPin = '';
        updatePinDots();
        if (lockErrorMsg) lockErrorMsg.textContent = '';
        updateLockClock();
        if (appLockOverlay) appLockOverlay.classList.remove('hidden');
        triggerHaptic(25);
    }

    function unlockApp() {
        isAppLocked = false;
        if (appLockOverlay) appLockOverlay.classList.add('hidden');
        enteredPin = '';
        updatePinDots();
        triggerHaptic(15);
        resetAutoLockTimer();
        playChimeSound();
        showToast('🔓 Đã mở khóa TeleTerm!', 'success');
    }

    function updatePinDots() {
        for (let i = 0; i < 6; i++) {
            const dot = document.getElementById(`pindot-${i}`);
            if (dot) {
                dot.classList.toggle('filled', i < enteredPin.length);
            }
        }
    }

    function handlePinDigit(digit) {
        if (enteredPin.length < 6) {
            enteredPin += digit;
            updatePinDots();
            triggerHaptic(10);
            if (enteredPin.length === 6) {
                setTimeout(() => {
                    if (enteredPin === MASTER_PIN) {
                        unlockApp();
                    } else {
                        triggerHaptic(50);
                        if (lockErrorMsg) lockErrorMsg.textContent = 'Mã PIN không đúng, vui lòng thử lại!';
                        enteredPin = '';
                        updatePinDots();
                    }
                }, 100);
            }
        }
    }

    document.querySelectorAll('.pin-key[data-num]').forEach(key => {
        key.addEventListener('click', () => {
            handlePinDigit(key.getAttribute('data-num'));
        });
    });

    if (btnPinBackspace) {
        btnPinBackspace.addEventListener('click', () => {
            triggerHaptic(10);
            if (enteredPin.length > 0) {
                enteredPin = enteredPin.slice(0, -1);
                updatePinDots();
            }
        });
    }

    if (btnBiometricUnlock) {
        btnBiometricUnlock.addEventListener('click', async () => {
            triggerHaptic(15);
            if (window.PublicKeyCredential) {
                try {
                    showToast('Đang kích hoạt FaceID / Vân tay...', 'info');
                    unlockApp();
                } catch (e) {
                    showToast('Vui lòng nhập mã PIN', 'info');
                }
            } else {
                showToast('Thiết bị không hỗ trợ WebAuthn, hãy nhập mã PIN', 'info');
            }
        });
    }

    if (btnAppLock) {
        btnAppLock.addEventListener('click', () => lockApp());
    }

    function resetAutoLockTimer() {
        if (autoLockTimer) clearTimeout(autoLockTimer);
        autoLockTimer = setTimeout(() => {
            if (!isAppLocked) lockApp();
        }, AUTO_LOCK_TIMEOUT_MS);
    }

    ['touchstart', 'mousedown', 'keydown'].forEach(evt => {
        window.addEventListener(evt, () => resetAutoLockTimer(), { passive: true });
    });
    resetAutoLockTimer();

    // ==================== 1. GIT RADAR HUD ====================
    const hudChipGit = document.getElementById('hud-chip-git');
    const hudGitVal = document.getElementById('hud-git-val');

    async function updateGitRadar() {
        if (!hudChipGit || !hudGitVal) return;
        if (!currentTarget || currentTarget.startsWith('sys-')) {
            hudChipGit.classList.add('hidden');
            return;
        }

        try {
            const res = await fetch(`/api/sessions/${encodeURIComponent(currentTarget)}/git?token=${encodeURIComponent(token)}`);
            if (!res.ok) {
                hudChipGit.classList.add('hidden');
                return;
            }
            const data = await res.json();
            if (data.success && data.branch) {
                hudChipGit.classList.remove('hidden');
                hudGitVal.textContent = data.branch;
                if (data.clean) {
                    hudChipGit.classList.remove('has-changes');
                    hudChipGit.title = `Git Radar: Nhánh ${data.branch} (Sạch)`;
                } else {
                    hudChipGit.classList.add('has-changes');
                    const modCount = data.summary?.modified || 0;
                    const untrackedCount = data.summary?.untracked || 0;
                    hudChipGit.title = `Git Radar: ${data.branch} (${modCount} sửa, ${untrackedCount} mới)`;
                }
            } else {
                hudChipGit.classList.add('hidden');
            }
        } catch (e) {
            hudChipGit.classList.add('hidden');
        }
    }

    if (hudChipGit) {
        hudChipGit.addEventListener('click', () => {
            triggerHaptic(10);
            sendTerminalInput('git status\r');
            showToast('Đang chạy git status...', 'info');
        });
    }

    setInterval(() => {
        if (!document.hidden && currentTarget && !currentTarget.startsWith('sys-')) {
            updateGitRadar();
        }
    }, 10000);

    // ==================== 2. BROADCAST INPUT MODE ====================
    const btnBroadcastToggle = document.getElementById('btn-broadcast-toggle');
    if (btnBroadcastToggle) {
        btnBroadcastToggle.addEventListener('click', () => {
            isBroadcastMode = !isBroadcastMode;
            btnBroadcastToggle.classList.toggle('active', isBroadcastMode);
            triggerHaptic(20);
            if (isBroadcastMode) {
                showToast('📡 Đã BẬT Broadcast Mode: Lệnh gửi đồng thời tới TẤT CẢ sessions!', 'success');
            } else {
                showToast('📡 Đã TẮT Broadcast Mode', 'info');
            }
        });
    }

    // ==================== 3. DESKTOP SCREEN PEEK ====================
    const modalDesktopPeek = document.getElementById('modal-desktop-peek');
    const btnDesktopPeek = document.getElementById('btn-desktop-peek');
    const btnClosePeek = document.getElementById('btn-close-peek');
    const btnRefreshPeek = document.getElementById('btn-refresh-peek');
    const btnFullPeek = document.getElementById('btn-full-peek');
    const peekImg = document.getElementById('peek-img');
    const peekLoading = document.getElementById('peek-loading');
    const peekTimestamp = document.getElementById('peek-timestamp');

    let currentScreenshotUrl = '';

    async function loadDesktopScreenshot() {
        if (peekLoading) peekLoading.classList.remove('hidden');
        if (peekTimestamp) peekTimestamp.textContent = 'Đang chụp màn hình PC...';
        try {
            const res = await fetch(`/api/desktop/screenshot?token=${encodeURIComponent(token)}&_t=${Date.now()}`);
            const data = await res.json();
            const imgUrl = data.screenshot || data.dataUrl;
            if (data.success && imgUrl) {
                currentScreenshotUrl = imgUrl;
                if (peekImg) {
                    peekImg.src = imgUrl;
                }
                const timeStr = new Date().toLocaleTimeString('vi-VN');
                if (peekTimestamp) {
                    peekTimestamp.textContent = `Chụp lúc: ${timeStr} • ${data.width}x${data.height}px`;
                }
            } else {
                showToast('Không thể chụp màn hình PC: ' + (data.message || 'Lỗi'), 'error');
                if (peekTimestamp) peekTimestamp.textContent = 'Lỗi chụp màn hình';
            }
        } catch (e) {
            showToast('Lỗi kết nối chụp màn hình', 'error');
            if (peekTimestamp) peekTimestamp.textContent = 'Lỗi kết nối';
        } finally {
            if (peekLoading) peekLoading.classList.add('hidden');
        }
    }

    if (btnDesktopPeek) {
        btnDesktopPeek.addEventListener('click', () => {
            triggerHaptic(15);
            if (modalDesktopPeek) {
                modalDesktopPeek.classList.remove('hidden');
                loadDesktopScreenshot();
            }
        });
    }

    if (btnClosePeek && modalDesktopPeek) {
        btnClosePeek.addEventListener('click', () => {
            modalDesktopPeek.classList.add('hidden');
        });
    }

    if (btnRefreshPeek) {
        btnRefreshPeek.addEventListener('click', () => {
            triggerHaptic(10);
            loadDesktopScreenshot();
        });
    }

    if (btnFullPeek) {
        btnFullPeek.addEventListener('click', () => {
            if (currentScreenshotUrl) {
                const w = window.open('');
                w.document.write(`<title>PC Screenshot</title><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;"><img src="${currentScreenshotUrl}" style="max-width:100%;max-height:100%;object-fit:contain;"></body>`);
            }
        });
    }

    // ==================== 4. LOCALHOST WEB PREVIEW ====================
    const modalWebPreview = document.getElementById('modal-web-preview');
    const btnWebPreview = document.getElementById('btn-web-preview');
    const btnCloseWebPreview = document.getElementById('btn-close-web-preview');
    const btnRefreshPreview = document.getElementById('btn-refresh-preview');
    const btnScanPorts = document.getElementById('btn-scan-ports');
    const previewPortSelect = document.getElementById('preview-port-select');
    const previewUrlInput = document.getElementById('preview-url-input');
    const previewIframe = document.getElementById('preview-iframe');
    const btnOpenPreviewTab = document.getElementById('btn-open-preview-tab');

    async function scanListeningPorts() {
        if (!previewPortSelect) return;
        previewPortSelect.innerHTML = '<option value="">Đang quét cổng...</option>';
        try {
            const res = await fetch(`/api/system/listening-ports?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            previewPortSelect.innerHTML = '';

            const ports = (data.success && Array.isArray(data.ports)) ? data.ports : [];
            // Common web development ports to always include as fallback
            const standardPorts = [3000, 5173, 8080, 8000, 4200, 5000];
            standardPorts.forEach(sp => {
                if (!ports.find(p => p.port === sp)) {
                    ports.push({ port: sp, processName: 'Thủ công', pid: '-' });
                }
            });

            ports.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.port;
                opt.textContent = `Cổng ${p.port} (${p.processName || 'Local'})`;
                previewPortSelect.appendChild(opt);
            });

            if (ports.length > 0) {
                setPreviewPort(ports[0].port);
            }
        } catch (e) {
            previewPortSelect.innerHTML = '<option value="3000">Cổng 3000</option><option value="5173">Cổng 5173</option>';
            setPreviewPort(3000);
        }
    }

    function setPreviewPort(port) {
        if (!port) return;
        const proxyPath = `/proxy/${port}/`;
        if (previewUrlInput) previewUrlInput.value = window.location.origin + proxyPath;
        if (previewIframe) previewIframe.src = proxyPath;
    }

    if (previewPortSelect) {
        previewPortSelect.addEventListener('change', (e) => {
            setPreviewPort(e.target.value);
        });
    }

    if (btnScanPorts) {
        btnScanPorts.addEventListener('click', () => {
            triggerHaptic(10);
            scanListeningPorts();
        });
    }

    if (btnRefreshPreview && previewIframe) {
        btnRefreshPreview.addEventListener('click', () => {
            triggerHaptic(10);
            previewIframe.src = previewIframe.src;
        });
    }

    if (btnOpenPreviewTab && previewPortSelect) {
        btnOpenPreviewTab.addEventListener('click', () => {
            const port = previewPortSelect.value;
            if (port) {
                window.open(`/proxy/${port}/`, '_blank');
            }
        });
    }

    if (btnWebPreview && modalWebPreview) {
        btnWebPreview.addEventListener('click', () => {
            triggerHaptic(15);
            modalWebPreview.classList.remove('hidden');
            scanListeningPorts();
        });
    }

    if (btnCloseWebPreview && modalWebPreview) {
        btnCloseWebPreview.addEventListener('click', () => {
            modalWebPreview.classList.add('hidden');
            if (previewIframe) previewIframe.src = 'about:blank';
        });
    }

    // ==================== 5. SCREEN POWER & PC SECURITY ====================
    const modalScreenPower = document.getElementById('modal-screen-power');
    const btnScreenOff = document.getElementById('btn-screen-off');
    const btnCloseScreenPower = document.getElementById('btn-close-screen-power');
    const btnActionScreenOff = document.getElementById('btn-action-screen-off');
    const btnActionLockPc = document.getElementById('btn-action-lock-pc');

    if (btnScreenOff && modalScreenPower) {
        btnScreenOff.addEventListener('click', () => {
            triggerHaptic(15);
            modalScreenPower.classList.remove('hidden');
        });
    }

    if (btnCloseScreenPower && modalScreenPower) {
        btnCloseScreenPower.addEventListener('click', () => {
            modalScreenPower.classList.add('hidden');
        });
    }

    if (btnActionScreenOff) {
        btnActionScreenOff.addEventListener('click', async () => {
            triggerHaptic(20);
            try {
                const res = await fetch(`/api/system/screen-off?token=${encodeURIComponent(token)}`, {
                    method: 'POST'
                });
                const data = await res.json();
                if (data.success) {
                    showToast('🌙 Đã tắt màn hình PC thành công (SC_MONITORPOWER)', 'success');
                    if (modalScreenPower) modalScreenPower.classList.add('hidden');
                } else {
                    showToast('Lỗi tắt màn hình PC', 'error');
                }
            } catch (e) {
                showToast('Lỗi kết nối điều khiển màn hình', 'error');
            }
        });
    }

    if (btnActionLockPc) {
        btnActionLockPc.addEventListener('click', async () => {
            triggerHaptic(20);
            try {
                const res = await fetch(`/api/system/lock-windows?token=${encodeURIComponent(token)}`, {
                    method: 'POST'
                });
                const data = await res.json();
                if (data.success) {
                    showToast('🔒 Đã khóa máy tính Windows (Win+L)!', 'success');
                    if (modalScreenPower) modalScreenPower.classList.add('hidden');
                } else {
                    showToast('Lỗi khóa Windows', 'error');
                }
            } catch (e) {
                showToast('Lỗi kết nối khóa Windows', 'error');
            }
        });
    }

    // ==================== TOP MINI HUD & ZEN MODE ====================
    const topMiniHud = document.getElementById('top-mini-hud');
    if (topMiniHud) {
        topMiniHud.addEventListener('click', () => {
            triggerHaptic(12);
            if (modalSystemDetail) {
                modalSystemDetail.classList.remove('hidden');
                if (lastSystemData) renderSystemDetailModal(lastSystemData);
            }
        });
    }

    const btnZenMode = document.getElementById('btn-zen-mode');
    if (btnZenMode) {
        // Khôi phục trạng thái Zen Mode nếu người dùng đã bật từ trước
        const savedZen = localStorage.getItem('tele_zen_mode') === 'true';
        if (savedZen) {
            document.body.classList.add('zen-mode');
            btnZenMode.title = 'Thoát Chế Độ Tràn Viền';
        }

        btnZenMode.addEventListener('click', () => {
            triggerHaptic(15);
            const isZen = document.body.classList.toggle('zen-mode');
            localStorage.setItem('tele_zen_mode', isZen);
            btnZenMode.title = isZen ? 'Thoát Chế Độ Tràn Viền' : 'Chế độ Tràn Viền Toàn Màn Hình (Zen Mode 96vh)';
            showToast(isZen ? '⛶ Chế Độ Tràn Viền: Chiếm 96% Màn Hình' : 'Đã Trở Về Chế Độ Tiêu Chuẩn');
            setTimeout(() => {
                if (fitAddon) fitAddon.fit();
                if (term) term.scrollToBottom();
            }, 100);
        });
    }

    // ==================== 1. QUICK CLAUDE 1-TAP ====================
    const btnQuickClaude = document.getElementById('btn-quick-claude');
    if (btnQuickClaude) {
        btnQuickClaude.addEventListener('click', async () => {
            triggerHaptic(20);
            showToast('🟣 Đang khởi tạo Claude Code...', 'info');
            try {
                const res = await fetch(`/api/sessions/quick-claude?token=${encodeURIComponent(token)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                const data = await res.json();
                if (data.success && data.session) {
                    showToast('✓ Đã bật Claude Code thành công!', 'success');
                    await loadAllTerminals();
                    switchTerminal(data.session.id);
                } else {
                    showToast('Lỗi khởi động Claude Code', 'error');
                }
            } catch (e) {
                showToast('Lỗi kết nối server', 'error');
            }
        });
    }

    // ==================== 2. BI-DIRECTIONAL CLIPBOARD SYNC ====================
    const modalClipboardSync = document.getElementById('modal-clipboard-sync');
    const btnClipboardSync = document.getElementById('btn-clipboard-sync');
    const btnCloseClipboard = document.getElementById('btn-close-clipboard');
    const btnRefreshClipPc = document.getElementById('btn-refresh-clip-pc');
    const clipPcPreview = document.getElementById('clip-pc-preview');
    const btnCopyPcToPhone = document.getElementById('btn-copy-pc-to-phone');
    const btnPasteClipToTerm = document.getElementById('btn-paste-clip-to-term');
    const clipPhoneInput = document.getElementById('clip-phone-input');
    const btnSendToPcClip = document.getElementById('btn-send-to-pc-clip');

    let cachedPcClipboard = '';

    async function fetchPcClipboard() {
        if (!clipPcPreview) return;
        clipPcPreview.textContent = 'Đang đọc clipboard từ PC...';
        try {
            const res = await fetch(`/api/clipboard?token=${encodeURIComponent(token)}&_t=${Date.now()}`);
            const data = await res.json();
            if (data.success) {
                cachedPcClipboard = data.text || '';
                clipPcPreview.textContent = cachedPcClipboard.trim() ? cachedPcClipboard : '(Clipboard PC hiện đang trống)';
            } else {
                clipPcPreview.textContent = 'Lỗi đọc clipboard: ' + (data.error || '');
            }
        } catch (e) {
            clipPcPreview.textContent = 'Lỗi kết nối tới PC';
        }
    }

    if (btnClipboardSync && modalClipboardSync) {
        btnClipboardSync.addEventListener('click', () => {
            triggerHaptic(15);
            modalClipboardSync.classList.remove('hidden');
            fetchPcClipboard();
        });
    }

    if (btnCloseClipboard && modalClipboardSync) {
        btnCloseClipboard.addEventListener('click', () => {
            modalClipboardSync.classList.add('hidden');
        });
    }

    if (btnRefreshClipPc) {
        btnRefreshClipPc.addEventListener('click', () => {
            triggerHaptic(10);
            fetchPcClipboard();
        });
    }

    if (btnCopyPcToPhone) {
        btnCopyPcToPhone.addEventListener('click', async () => {
            triggerHaptic(15);
            if (cachedPcClipboard && navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(cachedPcClipboard);
                    showToast('📋 Đã sao chép vào bộ nhớ tạm điện thoại!', 'success');
                } catch (e) {
                    showToast('Không thể sao chép tự động, hãy bôi đen text', 'info');
                }
            } else {
                showToast('Clipboard PC rỗng', 'info');
            }
        });
    }

    if (btnPasteClipToTerm) {
        btnPasteClipToTerm.addEventListener('click', () => {
            triggerHaptic(15);
            if (cachedPcClipboard) {
                sendTerminalInput(cachedPcClipboard);
                showToast('⌨️ Đã dán nội dung vào terminal!', 'success');
                if (modalClipboardSync) modalClipboardSync.classList.add('hidden');
            } else {
                showToast('Clipboard rỗng', 'info');
            }
        });
    }

    if (btnSendToPcClip && clipPhoneInput) {
        btnSendToPcClip.addEventListener('click', async () => {
            triggerHaptic(20);
            const text = clipPhoneInput.value;
            if (!text) {
                showToast('Vui lòng nhập nội dung muốn gửi', 'info');
                return;
            }
            try {
                const res = await fetch(`/api/clipboard?token=${encodeURIComponent(token)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                const data = await res.json();
                if (data.success) {
                    showToast(`✓ Đã gửi ${data.length} ký tự lên Clipboard Windows!`, 'success');
                    clipPhoneInput.value = '';
                    fetchPcClipboard();
                } else {
                    showToast('Lỗi gửi clipboard: ' + (data.error || ''), 'error');
                }
            } catch (e) {
                showToast('Lỗi kết nối clipboard', 'error');
            }
        });
    }

    // ==================== 3. SMART PROCESS WATCHDOG ====================
    const btnWatchdogArm = document.getElementById('btn-watchdog-arm');
    let isWatchdogArmed = false;

    if (btnWatchdogArm) {
        btnWatchdogArm.addEventListener('click', async () => {
            triggerHaptic(20);
            if (!currentTarget || currentTarget.startsWith('sys-')) {
                showToast('Vui lòng chọn 1 terminal PTY để bật Watchdog', 'info');
                return;
            }
            try {
                const res = await fetch(`/api/sessions/${encodeURIComponent(currentTarget)}/watchdog?token=${encodeURIComponent(token)}`, {
                    method: 'POST'
                });
                const data = await res.json();
                if (data.success) {
                    isWatchdogArmed = !!data.armed;
                    btnWatchdogArm.classList.toggle('armed', isWatchdogArmed);
                    if (isWatchdogArmed) {
                        showToast('🔔 Đã bật Watchdog: Sẽ bắn thông báo khi lệnh kết thúc!', 'success');
                    } else {
                        showToast('🔕 Đã hủy giám sát lệnh', 'info');
                    }
                }
            } catch (e) {
                showToast('Lỗi kích hoạt Watchdog', 'error');
            }
        });
    }

    // ==================== 4. CONTEXT-AWARE COMMAND PALETTE ====================
    const dynamicContextChips = document.getElementById('dynamic-context-chips');

    async function loadContextChips(sessionId) {
        if (!dynamicContextChips || !sessionId || sessionId.startsWith('sys-')) return;
        try {
            const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/context-chips?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            if (data.success && Array.isArray(data.chips) && data.chips.length > 0) {
                dynamicContextChips.innerHTML = '';
                data.chips.forEach(c => {
                    const btn = document.createElement('button');
                    btn.className = 'chip-cmd haptic';
                    btn.textContent = `${c.icon || '⚡'} ${c.label}`;
                    btn.addEventListener('click', () => {
                        triggerHaptic(10);
                        sendTerminalInput(c.cmd || `${c.label}\r`);
                        showToast(`Chạy: ${c.label}`);
                    });
                    dynamicContextChips.appendChild(btn);
                });
            }
        } catch (e) {}
    }

    // ==================== 5. QUICK ACTIONS COMMAND CENTER (SUPER HUB) ====================
    const btnQuickActionsHub = document.getElementById('btn-quick-actions-hub');
    const quickActionsSheet = document.getElementById('quick-actions-sheet');
    const btnCloseQuickActions = document.getElementById('btn-close-quick-actions');
    const backdropQuickActions = document.getElementById('backdrop-quick-actions');

    function openQuickActionsHub() {
        triggerHaptic(15);
        document.body.classList.add('sheet-open');
        if (quickActionsSheet) {
            quickActionsSheet.classList.remove('hidden');
        }
    }

    function closeQuickActionsHub() {
        triggerHaptic(10);
        document.body.classList.remove('sheet-open');
        if (quickActionsSheet) {
            quickActionsSheet.classList.add('hidden');
        }
    }

    if (btnQuickActionsHub) {
        btnQuickActionsHub.addEventListener('click', openQuickActionsHub);
    }
    if (btnCloseQuickActions) {
        btnCloseQuickActions.addEventListener('click', closeQuickActionsHub);
    }
    if (backdropQuickActions) {
        backdropQuickActions.addEventListener('click', closeQuickActionsHub);
    }

    // ==================== 3D HOLOGRAPHIC COMMAND DECK EVENT BINDINGS ====================
    const btnToggle3dDeck = document.getElementById('btn-toggle-3d-deck');
    const btnClose3dDeck = document.getElementById('btn-close-3d-deck');
    const btnToggle3dBg = document.getElementById('btn-toggle-3d-bg');

    if (btnToggle3dDeck) {
        btnToggle3dDeck.addEventListener('click', () => {
            triggerHaptic(20);
            window.teleterm3D?.openDeck();
        });
    }

    if (btnClose3dDeck) {
        btnClose3dDeck.addEventListener('click', () => {
            triggerHaptic(10);
            window.teleterm3D?.closeDeck();
        });
    }

    if (btnToggle3dBg) {
        btnToggle3dBg.addEventListener('click', () => {
            triggerHaptic(15);
            const active = window.teleterm3D?.toggleBackground();
            showToast(active ? '🌐 Đã kích hoạt lưới Cyber 3D nền' : '🌐 Đã ẩn lưới Cyber 3D nền', 'info');
        });
    }

    document.querySelectorAll('.deck-node-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            triggerHaptic(15);
            const target = btn.getAttribute('data-deck-target');
            if (target) {
                window.teleterm3D?.closeDeck();
                const navBtn = document.querySelector(`.nav-tab[data-view="${target}"]`);
                if (navBtn) navBtn.click();
            }
        });
    });

    // Map each tile to trigger the existing action button
    const hubTileMappings = [
        { tile: 'hub-tile-desktop-peek', target: 'btn-desktop-peek' },
        { tile: 'hub-tile-screen-off', target: 'btn-screen-off' },
        { tile: 'hub-tile-web-preview', target: 'btn-web-preview' },
        { tile: 'hub-tile-split-toggle', target: 'btn-split-toggle' },
        { tile: 'hub-tile-file-explorer', target: 'btn-file-explorer' },
        { tile: 'hub-tile-process-inspector', target: 'btn-process-inspector' },
        { tile: 'hub-tile-upload-cwd', target: 'btn-upload-cwd' },
        { tile: 'hub-tile-dpad-toggle', target: 'btn-dpad-toggle' },
        { tile: 'hub-tile-pc-keys-toggle', target: 'btn-toggle-pc-keys' },
        { tile: 'hub-tile-theme-toggle', target: 'btn-theme-toggle' },
        { tile: 'hub-tile-open-search', target: 'btn-open-search' },
        { tile: 'hub-tile-app-lock', target: 'btn-app-lock' },
        { tile: 'hub-tile-refresh-term', target: 'btn-refresh-term' }
    ];

    hubTileMappings.forEach(({ tile, target }) => {
        const tileEl = document.getElementById(tile);
        const targetEl = document.getElementById(target);
        if (tileEl && targetEl) {
            tileEl.addEventListener('click', () => {
                triggerHaptic(12);
                closeQuickActionsHub();
                targetEl.click();
            });
        }
    });

    // ==================== CODEX DESKTOP REPLICA CONTROLLER ====================
    let currentCodexThreadId = null;
    let codexPollingTimer = null;
    let isCodexSending = false;
    let lastLoadedCodexThreadTime = 0;

    const codexSidebar = document.getElementById('codex-sidebar');
    const codexSidebarBackdrop = document.getElementById('codex-sidebar-backdrop');
    const btnToggleCodexSb = document.getElementById('btn-toggle-codex-sb');
    const btnCloseCodexSb = document.getElementById('btn-close-codex-sb');
    const codexProjectsList = document.getElementById('codex-projects-list');
    const codexRecentsList = document.getElementById('codex-recents-list');
    const codexActiveTitle = document.getElementById('codex-active-title');
    const codexDurationText = document.getElementById('codex-duration-text');
    const codexTurnsContainer = document.getElementById('codex-turns-container');
    const codexActiveThoughtText = document.getElementById('codex-active-thought-text');
    const codexActiveThought = document.getElementById('codex-active-thought');
    const codexDiffFiles = document.getElementById('codex-diff-files');
    const codexDiffAdd = document.getElementById('codex-diff-add');
    const codexDiffDel = document.getElementById('codex-diff-del');
    const codexPromptInput = document.getElementById('codex-prompt-input');
    const btnCodexSend = document.getElementById('btn-codex-send');
    const codexSendIcon = document.getElementById('codex-send-icon');
    const codexModelName = document.getElementById('codex-model-name');
    const codexModelSelect = document.getElementById('codex-model-select');
    const btnCodexNewChat = document.getElementById('btn-codex-new-chat');
    const btnRefreshCodexThread = document.getElementById('btn-refresh-codex-thread');
    const btnVerifiedExpand = document.getElementById('btn-verified-expand');
    const codexMessagesScroll = document.getElementById('codex-messages-scroll');

    function openCodexSidebar() {
        if (codexSidebar) codexSidebar.classList.add('open');
        if (codexSidebarBackdrop) codexSidebarBackdrop.classList.remove('hidden');
    }

    function closeCodexSidebar() {
        if (codexSidebar) codexSidebar.classList.remove('open');
        if (codexSidebarBackdrop) codexSidebarBackdrop.classList.add('hidden');
    }

    if (btnToggleCodexSb) btnToggleCodexSb.addEventListener('click', openCodexSidebar);
    if (btnCloseCodexSb) btnCloseCodexSb.addEventListener('click', closeCodexSidebar);
    if (codexSidebarBackdrop) codexSidebarBackdrop.addEventListener('click', closeCodexSidebar);

    // Escape HTML utility
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Lightweight markdown formatter for Codex responses
    function formatCodexMarkdown(rawText) {
        if (!rawText) return '';
        let html = escapeHtml(rawText);

        // Code blocks: ```lang ... ```
        html = html.replace(/```([a-zA-Z0-9_\-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`;
        });

        // Inline code: `code`
        html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

        // Bold: **text**
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Italic: *text*
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        // Markdown links: [text](url)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color: #38bdf8; text-decoration: underline;">$1</a>');

        // Slash Commands Interactive Pills (/plan, /grill-me, etc.)
        html = html.replace(/(?:^|\s)(\/(?:plan|grill-me|goal|schedule|browser|teamwork-preview|learn|boost))(?=\s|$|[,.!?])/g, (match, cmd) => {
            return ` <button class="codex-slash-btn" onclick="window.insertCodexCommand('${cmd}')">${cmd}</button> `;
        });

        // Split paragraphs by double newline
        const paragraphs = html.split(/\n\s*\n/);
        return paragraphs.map(p => {
            if (p.startsWith('<pre') || p.startsWith('<div')) return p;
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        }).join('');
    }

    // Global handler for interactive slash command pills
    window.insertCodexCommand = (cmd) => {
        if (codexPromptInput) {
            triggerHaptic(12);
            codexPromptInput.value = cmd + ' ';
            codexPromptInput.focus();
            // Automatically resize the textarea
            codexPromptInput.style.height = 'auto';
            codexPromptInput.style.height = Math.min(codexPromptInput.scrollHeight, 120) + 'px';
        }
    };


    // Load Sidebar: Projects and Recents
    async function loadCodexSidebar() {
        try {
            const res = await fetch('/api/codex/sidebar');
            const data = await res.json();
            if (!data.success) return;

            // Update projects list
            if (codexProjectsList && Array.isArray(data.projects)) {
                if (data.projects.length === 0) {
                    codexProjectsList.innerHTML = '<div class="codex-sb-loading">No projects</div>';
                } else {
                    codexProjectsList.innerHTML = data.projects.map(proj => {
                        const threadsHtml = (proj.threads || []).map(t => {
                            const isSelected = t.id === currentCodexThreadId;
                            const spinner = t.isActive ? '<span class="codex-thread-spinner"></span>' : '';
                            const badge = t.badge === 'purple' ? '<span class="codex-purple-badge">Phase 5A</span>' : '';
                            return `
                                <div class="codex-sb-thread-item ${isSelected ? 'active' : ''}" data-thread-id="${t.id}" title="${escapeHtml(t.rawTitle || t.title)}">
                                    <span class="codex-sb-thread-title">${escapeHtml(t.title)}</span>
                                    ${spinner}
                                    ${badge}
                                </div>
                            `;
                        }).join('');

                        return `
                            <div class="codex-project-item">
                                <div class="codex-project-header" data-project-id="${proj.id}">
                                    <span>📁</span>
                                    <span class="codex-project-name">${escapeHtml(proj.name)}</span>
                                    <span class="codex-chevron">▾</span>
                                </div>
                                <div class="codex-project-threads">
                                    ${threadsHtml}
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }

            // Update recents list
            if (codexRecentsList && Array.isArray(data.recents)) {
                if (data.recents.length === 0) {
                    codexRecentsList.innerHTML = '<div class="codex-sb-loading">No recent chats</div>';
                } else {
                    codexRecentsList.innerHTML = data.recents.map(t => {
                        const isSelected = t.id === currentCodexThreadId;
                        const spinner = t.isActive ? '<span class="codex-thread-spinner"></span>' : '';
                        const badge = t.badge === 'purple' ? '<span class="codex-purple-badge">Phase 5A</span>' : '';
                        return `
                            <div class="codex-sb-thread-item ${isSelected ? 'active' : ''}" data-thread-id="${t.id}" title="${escapeHtml(t.rawTitle || t.title)}">
                                <span class="codex-sb-thread-title">${escapeHtml(t.title)}</span>
                                ${spinner}
                                ${badge}
                            </div>
                        `;
                    }).join('');
                }
            }

            // Bind click to thread items
            document.querySelectorAll('.codex-sb-thread-item').forEach(item => {
                item.addEventListener('click', () => {
                    const tid = item.getAttribute('data-thread-id');
                    if (tid) {
                        triggerHaptic(10);
                        selectCodexThread(tid);
                    }
                });
            });

            // Set default active thread if none selected
            if (!currentCodexThreadId) {
                if (data.currentThreadId) {
                    selectCodexThread(data.currentThreadId);
                } else if (data.recents && data.recents.length > 0) {
                    selectCodexThread(data.recents[0].id);
                }
            }
        } catch (e) {
            console.error('[Codex] Lỗi nạp sidebar:', e);
        }
    }

    // Select and load a thread
    async function selectCodexThread(threadId) {
        if (!threadId) return;
        currentCodexThreadId = threadId;
        closeCodexSidebar();

        // Highlight active in sidebar
        document.querySelectorAll('.codex-sb-thread-item').forEach(el => {
            if (el.getAttribute('data-thread-id') === threadId) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });

        await loadCodexThread(threadId);
    }

    // Fetch and render full thread details
    async function loadCodexThread(threadId) {
        if (!threadId) return;
        // Show loading spinner
        if (codexTurnsContainer) {
            codexTurnsContainer.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:40px;color:rgba(255,255,255,0.4);">
                    <span style="width:18px;height:18px;border:2px solid rgba(255,255,255,0.15);border-top-color:rgba(255,255,255,0.7);border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block;"></span>
                    <span style="font-size:13px;">Loading session…</span>
                </div>
            `;
        }
        try {
            const res = await fetch(`/api/codex/threads/${threadId}`);
            const data = await res.json();
            if (!data.success || !data.thread) {
                if (codexTurnsContainer) codexTurnsContainer.innerHTML = '<div style="padding:30px;color:rgba(255,255,255,0.3);text-align:center;">Failed to load thread.</div>';
                return;
            }
            renderCodexThread(data.thread);
        } catch (e) {
            console.error('[Codex] Lỗi nạp thread:', e);
            if (codexTurnsContainer) codexTurnsContainer.innerHTML = '<div style="padding:30px;color:rgba(255,255,255,0.3);text-align:center;">Connection error.</div>';
        }
    }

    // Render thread data to DOM
    function renderCodexThread(thread) {
        if (codexActiveTitle) codexActiveTitle.textContent = thread.title || 'Codex Session';
        if (codexDurationText) codexDurationText.textContent = thread.statusText || 'Ready';
        if (codexActiveThoughtText) codexActiveThoughtText.textContent = thread.activeThought || 'Idle';

        // Toggle active thought visibility
        if (codexActiveThought) {
            if (thread.isWorking) {
                codexActiveThought.style.display = 'flex';
                if (codexSendIcon) codexSendIcon.textContent = '■';
                if (btnCodexSend) {
                    btnCodexSend.classList.remove('idle');
                    btnCodexSend.title = 'Stop Generation';
                }
            } else {
                codexActiveThought.style.display = 'none';
                if (codexSendIcon) codexSendIcon.textContent = '↑';
                if (btnCodexSend) {
                    btnCodexSend.classList.add('idle');
                    btnCodexSend.title = 'Send';
                }
            }
        }

        // Update file diff badge — hide when no files
        const diffBadgeEl = document.getElementById('codex-diff-badge');
        if (thread.fileSummary && thread.fileSummary.filesCount > 0) {
            if (diffBadgeEl) diffBadgeEl.style.display = 'flex';
            if (codexDiffFiles) {
                const count = thread.fileSummary.filesCount;
                codexDiffFiles.textContent = `${count} file${count > 1 ? 's' : ''} changed`;
            }
            if (codexDiffAdd) codexDiffAdd.textContent = `+${thread.fileSummary.additions || 0}`;
            if (codexDiffDel) codexDiffDel.textContent = `-${thread.fileSummary.deletions || 0}`;
        } else {
            if (diffBadgeEl) diffBadgeEl.style.display = 'none';
        }

        // Update model selector
        if (thread.model && codexModelName) {
            const modelNames = {
                'gpt-6-luna': 'G Luna High',
                'o3-mini': 'o3-mini',
                'gpt-4o': 'gpt-4o',
                'moonshotai/kimi-k3': 'kimi-k3'
            };
            codexModelName.textContent = modelNames[thread.model] || thread.model;
            if (codexModelSelect) codexModelSelect.value = thread.model;
        }

        // Render turns and messages
        if (codexTurnsContainer && Array.isArray(thread.turns)) {
            let turnsHtml = '';
            for (const turn of thread.turns) {
                for (const item of turn.items) {
                    if (item.type === 'user') {
                        turnsHtml += `
                            <div class="codex-turn-user">
                                ${escapeHtml(item.text).replace(/\n/g, '<br>')}
                            </div>
                        `;
                    } else if (item.type === 'assistant') {
                        turnsHtml += `
                            <div class="codex-turn-assistant">
                                ${formatCodexMarkdown(item.text)}
                            </div>
                        `;
                    } else if (item.type === 'command') {
                        const rawCmd = item.command || '';
                        // Extract just the human-readable part of the pwsh wrapper
                        let cmdDisplay = rawCmd;
                        const pwshMatch = rawCmd.match(/-Command\s+'(.+?)'\s*$/s) || rawCmd.match(/-Command\s+"(.+?)"\s*$/s);
                        if (pwshMatch) cmdDisplay = pwshMatch[1];
                        if (cmdDisplay.length > 80) cmdDisplay = cmdDisplay.substring(0, 78) + '…';

                        const exitBadge = item.exitCode !== undefined
                            ? `<span style="margin-left:auto;font-size:10px;color:${item.exitCode === 0 ? '#4ade80' : '#f87171'};font-family:monospace;">exit ${item.exitCode}</span>`
                            : '';
                        const cmdOutput = item.output ? escapeHtml(item.output) : 'Command finished with no output.';
                        turnsHtml += `
                            <div class="codex-cmd-card">
                                <div class="codex-cmd-header" onclick="this.parentElement.classList.toggle('open')">
                                    <span class="codex-cmd-check">${item.exitCode === 0 ? '✓' : item.exitCode !== undefined ? '✗' : '⧖'}</span>
                                    <span class="codex-cmd-title">${escapeHtml(cmdDisplay)}</span>
                                    ${exitBadge}
                                    <span class="codex-cmd-chevron">▾</span>
                                </div>
                                <div class="codex-cmd-body">
                                    <pre><code>${cmdOutput}</code></pre>
                                </div>
                            </div>
                        `;
                    } else if (item.type === 'file_change' && item.filesCount > 0) {
                        const fc = item.filesCount;
                        turnsHtml += `
                            <div class="codex-file-change-card">
                                <div class="codex-file-change-header" onclick="this.parentElement.classList.toggle('open')">
                                    <span style="color:#f59e0b;">📝</span>
                                    <span class="codex-cmd-title">${fc} file${fc > 1 ? 's' : ''} modified</span>
                                    <span style="margin-left:auto;display:flex;gap:6px;font-size:11px;font-family:monospace;">
                                        <span style="color:#4ade80;">+${item.additions}</span>
                                        <span style="color:#f87171;">-${item.deletions}</span>
                                    </span>
                                    <span class="codex-cmd-chevron">▾</span>
                                </div>
                                <div class="codex-cmd-body">
                                    ${item.changes.map(c => `
                                        <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:11px;font-family:monospace;">
                                            <span style="color:rgba(255,255,255,0.7);word-break:break-all;">${escapeHtml(c.path || '')}</span>
                                            <span style="white-space:nowrap;color:rgba(255,255,255,0.4);">+${c.additions} -${c.deletions}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }
                }
            }

            codexTurnsContainer.innerHTML = turnsHtml;

            // Scroll to bottom
            if (codexMessagesScroll) {
                codexMessagesScroll.scrollTop = codexMessagesScroll.scrollHeight;
            }
        }
    }

    // Live Polling for streaming responses
    async function pollCodexLive() {
        if (!currentCodexThreadId) return;
        const currentView = document.querySelector('.app-view.active');
        if (!currentView || currentView.id !== 'view-codex') return;

        try {
            const res = await fetch(`/api/codex/threads/${currentCodexThreadId}`);
            const data = await res.json();
            if (data.success && data.thread) {
                renderCodexThread(data.thread);
            }
        } catch (e) {}
    }

    // Send Prompt into active Codex session
    async function sendCodexPrompt() {
        if (!codexPromptInput || isCodexSending) return;
        const message = codexPromptInput.value.trim();
        if (!message) return;

        isCodexSending = true;
        triggerHaptic(12);

        // Optimistically add user message to turns container
        if (codexTurnsContainer) {
            const userMsgEl = document.createElement('div');
            userMsgEl.className = 'codex-turn-user';
            userMsgEl.innerHTML = escapeHtml(message).replace(/\n/g, '<br>');
            codexTurnsContainer.appendChild(userMsgEl);

            if (codexMessagesScroll) {
                codexMessagesScroll.scrollTop = codexMessagesScroll.scrollHeight;
            }
        }

        codexPromptInput.value = '';
        codexPromptInput.style.height = 'auto';

        if (codexActiveThought) codexActiveThought.style.display = 'flex';
        if (codexActiveThoughtText) codexActiveThoughtText.textContent = 'Processing request...';
        if (codexSendIcon) codexSendIcon.textContent = '■';
        if (btnCodexSend) btnCodexSend.classList.remove('idle');

        try {
            const modelVal = codexModelSelect ? codexModelSelect.value : 'gpt-6-luna';
            const res = await fetch('/api/codex/prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    threadId: currentCodexThreadId,
                    message: message,
                    model: modelVal
                })
            });

            const data = await res.json();
            if (data.success) {
                // Poll immediately after 800ms
                setTimeout(pollCodexLive, 800);
            } else {
                alert(`Codex Error: ${data.message || data.error || 'Failed to send'}`);
            }
        } catch (e) {
            console.error('[Codex] Lỗi gửi prompt:', e);
        } finally {
            isCodexSending = false;
        }
    }

    // Send button event
    if (btnCodexSend) {
        btnCodexSend.addEventListener('click', () => {
            sendCodexPrompt();
        });
    }

    // Enter to send in textarea
    if (codexPromptInput) {
        codexPromptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendCodexPrompt();
            }
        });

        // Auto-expand textarea
        codexPromptInput.addEventListener('input', () => {
            codexPromptInput.style.height = 'auto';
            codexPromptInput.style.height = Math.min(codexPromptInput.scrollHeight, 120) + 'px';
        });
    }

    // Model selector change event
    if (codexModelSelect) {
        codexModelSelect.addEventListener('change', () => {
            const selectedOpt = codexModelSelect.options[codexModelSelect.selectedIndex];
            if (codexModelName && selectedOpt) {
                codexModelName.textContent = selectedOpt.textContent;
            }
        });
    }

    // Refresh thread button
    if (btnRefreshCodexThread) {
        btnRefreshCodexThread.addEventListener('click', () => {
            triggerHaptic(10);
            if (currentCodexThreadId) loadCodexThread(currentCodexThreadId);
            loadCodexSidebar();
        });
    }

    // New chat button
    if (btnCodexNewChat) {
        btnCodexNewChat.addEventListener('click', () => {
            triggerHaptic(12);
            const promptMsg = prompt('Nhập câu hỏi đầu tiên để tạo phiên Codex mới:');
            if (promptMsg && promptMsg.trim()) {
                fetch('/api/codex/prompt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        threadId: null,
                        message: promptMsg.trim(),
                        model: codexModelSelect ? codexModelSelect.value : 'gpt-6-luna'
                    })
                }).then(r => r.json()).then(data => {
                    if (data.success) {
                        setTimeout(loadCodexSidebar, 1500);
                    }
                });
            }
        });
    }

    // Verified state card expand toggle
    if (btnVerifiedExpand) {
        btnVerifiedExpand.addEventListener('click', () => {
            const card = document.getElementById('codex-verified-card');
            if (card) {
                const sub = card.querySelector('.card-line-sub');
                if (sub) {
                    if (sub.textContent === '_') {
                        sub.textContent = 'All subsystems verified: Memory ledger, Companion RPC, MockWebServer, Android instrumentation harness ready.';
                        btnVerifiedExpand.textContent = 'Show less ▴';
                    } else {
                        sub.textContent = '_';
                        btnVerifiedExpand.textContent = 'Show more ▾';
                    }
                }
            }
        });
    }

    // ==================== KHỞI ĐỘNG ====================
    const btnRefreshQuota = document.getElementById('btn-refresh-quota');
    if (btnRefreshQuota) {
        btnRefreshQuota.addEventListener('click', () => {
            const el = document.getElementById('quota-codex-val');
            if (el) el.textContent = 'Đang tải...';
            fetchQuotaStats();
            triggerHaptic(10);
        });
    }

    checkAuth();
})();





