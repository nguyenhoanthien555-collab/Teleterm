/**
 * TeleTerm Platform Adapter
 * Unified interface separating platform dependencies (desktop Electron vs standard web client).
 * Guarantees 100% parity and safety across Windows 10/11 Desktop Client and Web/Mobile browsers.
 */

class UniversalPlatformAdapter {
    constructor() {
        const win = typeof window !== 'undefined' ? window : null;
        this.nativeAdapter = win ? (win.TeleTermNative || win.__TeleTermDesktopBridge__ || win.TeleTermPlatformNative || null) : null;
        this.isDesktopEnv = Boolean(this.nativeAdapter && typeof this.nativeAdapter.isDesktop === 'function' && this.nativeAdapter.isDesktop());
        this.init();
    }

    init() {
        console.log(`[PlatformAdapter] Initialized in ${this.isDesktopEnv ? 'DESKTOP (Electron)' : 'WEB (Browser)'} environment.`);

        try { window.localStorage.removeItem('teleterm_session_token'); } catch (_) {}

        if (!this.isDesktopEnv && typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
            this.setupWebDeepLinkListener();
        }
    }

    isDesktop() {
        return this.isDesktopEnv;
    }

    get platform() {
        return this.isDesktopEnv ? this.nativeAdapter.platform : 'web';
    }

    get version() {
        return this.isDesktopEnv ? this.nativeAdapter.version : '5.0.0-web';
    }

    // --- Window Controls ---
    get window() {
        if (this.isDesktopEnv && this.nativeAdapter.window) {
            return {
                ...this.nativeAdapter.window,
                setDisplayMode: async (mode) => {
                    if (typeof this.nativeAdapter.window.setDisplayMode === 'function') {
                        return await this.nativeAdapter.window.setDisplayMode(mode);
                    }
                    if (mode === 'fullscreen') return await this.nativeAdapter.window.setFullscreen(true);
                    return mode;
                },
                getDisplayMode: async () => {
                    if (typeof this.nativeAdapter.window.getDisplayMode === 'function') {
                        return await this.nativeAdapter.window.getDisplayMode();
                    }
                    const isFs = await this.nativeAdapter.window.isFullscreen();
                    if (isFs) return 'fullscreen';
                    const isMax = await this.nativeAdapter.window.isMaximized();
                    return isMax ? 'borderless' : 'window';
                },
                onDisplayModeChange: (callback) => {
                    if (typeof this.nativeAdapter.window.onDisplayModeChange === 'function') {
                        return this.nativeAdapter.window.onDisplayModeChange(callback);
                    }
                    return () => {};
                }
            };
        }

        return {
            minimize: async () => false,
            maximize: async () => false,
            unmaximize: async () => false,
            toggleMaximize: async () => false,
            isMaximized: async () => false,
            close: async () => false,
            setFullscreen: async (flag) => {
                try {
                    if (flag) {
                        if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
                    } else {
                        if (document.fullscreenElement) await document.exitFullscreen();
                    }
                    return Boolean(document.fullscreenElement);
                } catch (e) {
                    return false;
                }
            },
            isFullscreen: async () => Boolean(document.fullscreenElement),
            setDisplayMode: async (mode) => {
                const target = ['fullscreen', 'borderless', 'window'].includes(mode) ? mode : 'window';
                try {
                    if (target === 'fullscreen' || target === 'borderless') {
                        if (typeof document !== 'undefined' && document.documentElement && !document.fullscreenElement) {
                            await document.documentElement.requestFullscreen();
                        }
                    } else if (target === 'window') {
                        if (typeof document !== 'undefined' && document.fullscreenElement) {
                            await document.exitFullscreen();
                        }
                    }
                    if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('teleterm_display_mode', target);
                    }
                    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
                        window.dispatchEvent(new CustomEvent('teleterm:window:displayModeChanged', { detail: { mode: target } }));
                    }
                    return target;
                } catch (e) {
                    return 'window';
                }
            },
            getDisplayMode: async () => {
                if (typeof document !== 'undefined' && document.fullscreenElement) return 'fullscreen';
                if (typeof localStorage !== 'undefined') return localStorage.getItem('teleterm_display_mode') || 'window';
                return 'window';
            },
            getBounds: async () => ({
                width: typeof window !== 'undefined' ? window.innerWidth : 1280,
                height: typeof window !== 'undefined' ? window.innerHeight : 720,
                x: 0,
                y: 0
            }),
            onWindowStateChange: (callback) => {
                const handler = () => {
                    callback({
                        isMaximized: false,
                        isFullscreen: typeof document !== 'undefined' && Boolean(document.fullscreenElement)
                    });
                };
                if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
                    document.addEventListener('fullscreenchange', handler);
                }
                return () => {
                    if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
                        document.removeEventListener('fullscreenchange', handler);
                    }
                };
            },
            onDisplayModeChange: (callback) => {
                const handler = (e) => {
                    if (e && e.detail && e.detail.mode) {
                        callback({ mode: e.detail.mode });
                    } else {
                        callback({ mode: (typeof document !== 'undefined' && document.fullscreenElement) ? 'fullscreen' : 'window' });
                    }
                };
                if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
                    window.addEventListener('teleterm:window:displayModeChanged', handler);
                }
                if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
                    document.addEventListener('fullscreenchange', handler);
                }
                return () => {
                    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
                        window.removeEventListener('teleterm:window:displayModeChanged', handler);
                    }
                    if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
                        document.removeEventListener('fullscreenchange', handler);
                    }
                };
            }
        };
    }

    // --- External URLs ---
    async openExternalUrl(url) {
        if (this.isDesktopEnv && this.nativeAdapter.openExternalUrl) {
            return await this.nativeAdapter.openExternalUrl(url);
        }
        window.open(url, '_blank', 'noopener,noreferrer');
        return true;
    }

    // --- Secure / Persistent Storage ---
    get secureStore() {
        if (this.isDesktopEnv && this.nativeAdapter.secureStore) {
            return this.nativeAdapter.secureStore;
        }

        const PREFIX = 'teleterm_store_';
        return {
            get: async (key) => {
                try {
                    const raw = localStorage.getItem(PREFIX + key);
                    if (!raw) return null;
                    try { return JSON.parse(raw); } catch (e) { return raw; }
                } catch (e) {
                    return null;
                }
            },
            set: async (key, value) => {
                try {
                    const strVal = typeof value === 'string' ? value : JSON.stringify(value);
                    localStorage.setItem(PREFIX + key, strVal);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            delete: async (key) => {
                try {
                    localStorage.removeItem(PREFIX + key);
                    return true;
                } catch (e) {
                    return false;
                }
            }
        };
    }

    // --- Desktop / Web Notifications ---
    get notifications() {
        if (this.isDesktopEnv && this.nativeAdapter.notifications) {
            return this.nativeAdapter.notifications;
        }

        return {
            show: async (title, options = {}) => {
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification(title, options);
                    return true;
                } else if ('Notification' in window && Notification.permission !== 'denied') {
                    try {
                        const perm = await Notification.requestPermission();
                        if (perm === 'granted') {
                            new Notification(title, options);
                            return true;
                        }
                    } catch (e) {}
                }
                // Fallback: Custom in-game toast
                window.dispatchEvent(new CustomEvent('teleterm:toast', {
                    detail: { message: `${title}: ${options.body || ''}`, type: 'info' }
                }));
                return true;
            }
        };
    }

    // --- Clipboard ---
    get clipboard() {
        if (this.isDesktopEnv && this.nativeAdapter.clipboard) {
            return this.nativeAdapter.clipboard;
        }

        return {
            readText: async () => {
                if (navigator.clipboard?.readText) {
                    try { return await navigator.clipboard.readText(); } catch (e) {}
                }
                return '';
            },
            writeText: async (text) => {
                if (navigator.clipboard?.writeText) {
                    try {
                        await navigator.clipboard.writeText(String(text || ''));
                        return true;
                    } catch (e) {}
                }
                return false;
            }
        };
    }

    // --- Game Launch & Client Navigation ---
    get game() {
        if (this.isDesktopEnv && this.nativeAdapter?.game) {
            return this.nativeAdapter.game;
        }

        return {
            launch: async () => {
                if (typeof window !== 'undefined') {
                    window.location.href = '/?direct=1';
                }
                return true;
            },
            exitToLauncher: async () => {
                if (typeof window !== 'undefined') {
                    window.location.href = '/launcher.html';
                }
                return true;
            }
        };
    }

    // --- Deep Link & Auth Callbacks ---
    setupWebDeepLinkListener() {
        this.webAuthCallbacks = [];

        // Redeem a one-time owner pairing code from the URL fragment. Fragments
        // are not sent to the server or included in referrer/request logs.
        try {
            const fragment = new URLSearchParams(window.location.hash.slice(1));
            const pairingCode = fragment.get('pair');
            if (pairingCode) {
                window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
                fetch('/api/auth/desktop/pairing/redeem', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: pairingCode })
                }).then(response => {
                    if (!response.ok) throw new Error('Pairing code is invalid or expired');
                    window.location.assign('/launcher.html?paired=1');
                }).catch(() => {
                    this.dispatchAuthCallback({ type: 'teleterm_auth_error', error: 'Mã ghép thiết bị đã hết hạn hoặc không hợp lệ.' });
                });
            }
        } catch (e) {}

        // Listen for postMessage from popup OAuth window
        window.addEventListener('message', (event) => {
            if (event.origin === window.location.origin && event.data && event.data.type === 'teleterm_auth_success') {
                this.dispatchAuthCallback(event.data);
            }
        });
    }

    dispatchAuthCallback(data) {
        this.pendingWebAuthEvent = data;
        if (Array.isArray(this.webAuthCallbacks)) {
            this.webAuthCallbacks.forEach((cb) => {
                try { cb(data); } catch (e) {}
            });
            if (this.webAuthCallbacks.length) this.pendingWebAuthEvent = null;
        }
    }

    get deepLink() {
        if (this.isDesktopEnv && this.nativeAdapter.deepLink) {
            return this.nativeAdapter.deepLink;
        }

        return {
            onAuthCallback: (callback) => {
                if (typeof callback !== 'function') return () => {};
                if (!this.webAuthCallbacks) this.webAuthCallbacks = [];
                this.webAuthCallbacks.push(callback);
                if (this.pendingWebAuthEvent) {
                    const pending = this.pendingWebAuthEvent;
                    this.pendingWebAuthEvent = null;
                    queueMicrotask(() => callback(pending));
                }
                return () => {
                    this.webAuthCallbacks = this.webAuthCallbacks.filter((c) => c !== callback);
                };
            }
        };
    }

    get auth() {
        if (this.isDesktopEnv && this.nativeAdapter.auth) {
            return this.nativeAdapter.auth;
        }

        return {
            startOAuth: async (provider) => {
                const targetUrl = `/api/auth/desktop/oauth/start?provider=${encodeURIComponent(provider)}&client=web`;
                const popup = window.open(targetUrl, 'teleterm_auth_popup', 'width=500,height=600,menubar=no,toolbar=no');
                return { success: true, popup: Boolean(popup) };
            },
            onDeepLink: (callback) => {
                return this.deepLink.onAuthCallback(callback);
            }
        };
    }

    // --- Backend Status & Endpoints ---
    get backend() {
        if (this.isDesktopEnv && this.nativeAdapter.backend) {
            return this.nativeAdapter.backend;
        }

        return {
            getStatus: async () => {
                try {
                    const res = await fetch('/api/version', { cache: 'no-store' });
                    if (res.ok) {
                        return { status: 'RUNNING', port: location.port || 80, endpoint: location.origin };
                    }
                } catch (e) {}
                return { status: 'OFFLINE', port: location.port || 80, endpoint: location.origin };
            },
            restart: async () => ({ status: 'UNSUPPORTED_ON_WEB' }),
            getEndpoint: () => location.origin,
            onStatusChange: (callback) => {
                // Poll every 10s for web
                const interval = setInterval(async () => {
                    try {
                        const res = await fetch('/api/version', { cache: 'no-store' });
                        callback({ status: res.ok ? 'RUNNING' : 'OFFLINE', endpoint: location.origin });
                    } catch (e) {
                        callback({ status: 'OFFLINE', endpoint: location.origin });
                    }
                }, 10000);
                return () => clearInterval(interval);
            }
        };
    }

    get system() {
        if (this.isDesktopEnv && this.nativeAdapter.system) {
            return this.nativeAdapter.system;
        }

        return {
            getInfo: async () => ({
                platform: 'web',
                arch: 'unknown',
                userAgent: navigator.userAgent,
                screen: { width: window.screen.width, height: window.screen.height, dpr: window.devicePixelRatio }
            })
        };
    }
}

// Attach universally
const platformAdapter = new UniversalPlatformAdapter();
if (typeof window !== 'undefined') {
    try {
        if (!window.TeleTermPlatform) {
            window.TeleTermPlatform = platformAdapter;
        }
    } catch (e) {
        console.warn('[PlatformAdapter] Could not attach to window.TeleTermPlatform:', e.message);
    }
    window.teletermPlatform = platformAdapter;
}
export { platformAdapter, UniversalPlatformAdapter };
