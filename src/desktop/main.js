/**
 * TeleTerm Desktop Client — Main Process Entry Point
 * Manages native window lifecycle, ConPTY backend server process,
 * deep link registration (teleterm://auth/callback), secure storage,
 * and IPC communication with the Renderer.
 */

const { app, BrowserWindow, ipcMain, shell, Notification, clipboard, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { fork } = require('child_process');

// 1. Single Instance Lock
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
    app.quit();
    process.exit(0);
}

// 2. Protocol Registration: teleterm://
const PROTOCOL_NAME = 'teleterm';
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient(PROTOCOL_NAME, process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient(PROTOCOL_NAME);
}

// 2b. High-DPI & GPU acceleration support
app.commandLine.appendSwitch('high-dpi-support', '1');

function findDeepLinkArg(args) {
    if (!Array.isArray(args)) return null;
    for (const raw of args) {
        if (!raw || typeof raw !== 'string') continue;
        const clean = raw.replace(/^["']|["']$/g, '').trim();
        if (clean.toLowerCase().startsWith(`${PROTOCOL_NAME}://`)) {
            return clean;
        }
    }
    return null;
}

let launcherWindow = null;
let gameWindow = null;
let serverProcess = null;
let serverStatus = 'STOPPED'; // STOPPED, STARTING, RUNNING, ERROR
let isQuitting = false;
let pendingDeepLinkUrl = null;
const pendingDesktopOAuthStates = new Set();

// Paths for persistent desktop state
const USER_DATA_PATH = app.getPath('userData');
const WINDOW_STATE_FILE = path.join(USER_DATA_PATH, 'window-state.json');
const SECURE_STORE_FILE = path.join(USER_DATA_PATH, 'secure-store.json');

// --- Window State Persistence ---
let lastNormalBounds = { width: 1360, height: 860, x: undefined, y: undefined };
let currentDisplayMode = 'borderless'; // 'fullscreen' | 'borderless' | 'window'

function getActiveWindow(event) {
    if (event && event.sender) {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win && !win.isDestroyed()) return win;
    }
    return (gameWindow && !gameWindow.isDestroyed() && gameWindow.isVisible())
        ? gameWindow
        : (launcherWindow && !launcherWindow.isDestroyed() ? launcherWindow : null);
}

function loadWindowState() {
    try {
        if (fs.existsSync(WINDOW_STATE_FILE)) {
            const data = JSON.parse(fs.readFileSync(WINDOW_STATE_FILE, 'utf8'));
            if (data && typeof data === 'object') {
                if (data.width && data.height) {
                    lastNormalBounds = { width: data.width, height: data.height, x: data.x, y: data.y };
                }
                if (data.displayMode && ['fullscreen', 'borderless', 'window'].includes(data.displayMode)) {
                    currentDisplayMode = data.displayMode;
                } else if (data.isMaximized) {
                    currentDisplayMode = 'borderless';
                }
                return data;
            }
        }
    } catch (e) {}
    return { width: 1360, height: 860, isMaximized: true, displayMode: 'borderless' };
}

function saveWindowState() {
    const win = (gameWindow && !gameWindow.isDestroyed()) ? gameWindow : launcherWindow;
    if (!win || win.isDestroyed()) return;
    try {
        const isMaximized = win.isMaximized();
        if (!isMaximized && !win.isMinimized() && !win.isFullScreen()) {
            lastNormalBounds = win.getBounds();
        }
        const state = {
            ...lastNormalBounds,
            isMaximized,
            displayMode: currentDisplayMode
        };
        fs.writeFileSync(WINDOW_STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
    } catch (e) {}
}

function setWindowDisplayMode(mode, win = null) {
    const targetMode = ['fullscreen', 'borderless', 'window'].includes(mode) ? mode : 'borderless';
    currentDisplayMode = targetMode;
    const targetWin = win || gameWindow || launcherWindow;

    if (targetWin && !targetWin.isDestroyed()) {
        if (targetMode === 'fullscreen') {
            if (!targetWin.isFullScreen()) targetWin.setFullScreen(true);
        } else if (targetMode === 'borderless') {
            if (targetWin.isFullScreen()) targetWin.setFullScreen(false);
            if (!targetWin.isMaximized()) targetWin.maximize();
        } else if (targetMode === 'window') {
            if (targetWin.isFullScreen()) targetWin.setFullScreen(false);
            if (targetWin.isMaximized()) targetWin.unmaximize();
            const bounds = targetWin.getBounds();
            if (bounds.width < 960 || bounds.height < 600) {
                targetWin.setBounds({
                    width: lastNormalBounds.width || 1360,
                    height: lastNormalBounds.height || 860,
                    x: lastNormalBounds.x,
                    y: lastNormalBounds.y
                });
                targetWin.center();
            }
        }

        targetWin.webContents.send('teleterm:window:displayModeChanged', { mode: targetMode });
        targetWin.webContents.send('teleterm:window:stateChanged', {
            isMaximized: targetWin.isMaximized(),
            isFullscreen: targetWin.isFullScreen(),
            displayMode: targetMode
        });
    }

    saveWindowState();
    return targetMode;
}

// --- Secure Store Implementation (Electron safeStorage / DPAPI on Windows) ---
function getSecureStoreData() {
    try {
        if (fs.existsSync(SECURE_STORE_FILE)) {
            return JSON.parse(fs.readFileSync(SECURE_STORE_FILE, 'utf8'));
        }
    } catch (e) {}
    return {};
}

function saveSecureStoreData(data) {
    try {
        fs.writeFileSync(SECURE_STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {}
}

function secureStoreGet(key) {
    const data = getSecureStoreData();
    if (!data[key]) return null;
    try {
        if (safeStorage.isEncryptionAvailable() && data[key].encrypted) {
            const buf = Buffer.from(data[key].value, 'base64');
            return safeStorage.decryptString(buf);
        }
    } catch (e) {}
    return data[key].value || null;
}

function secureStoreSet(key, value) {
    const data = getSecureStoreData();
    if (value === null || value === undefined) {
        delete data[key];
    } else {
        const strVal = typeof value === 'string' ? value : JSON.stringify(value);
        if (safeStorage.isEncryptionAvailable()) {
            try {
                const encryptedBuf = safeStorage.encryptString(strVal);
                data[key] = { encrypted: true, value: encryptedBuf.toString('base64') };
            } catch (e) {
                data[key] = { encrypted: false, value: strVal };
            }
        } else {
            data[key] = { encrypted: false, value: strVal };
        }
    }
    saveSecureStoreData(data);
    return true;
}

function secureStoreDelete(key) {
    const data = getSecureStoreData();
    delete data[key];
    saveSecureStoreData(data);
    return true;
}

// --- Backend ConPTY Server Lifecycle ---
function checkServerHealthy(port = 4000) {
    return new Promise((resolve) => {
        const req = http.get(`http://127.0.0.1:${port}/api/version`, { timeout: 1500 }, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 400) {
                let body = '';
                res.on('data', c => { body += c; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(body);
                        if (parsed && (parsed.success || parsed.buildId || parsed.version)) {
                            return resolve(true);
                        }
                    } catch (e) {}
                    resolve(true);
                });
            } else {
                resolve(false);
            }
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function startBackendServer() {
    serverStatus = 'STARTING';
    broadcastServerStatus();

    // Check if server is already running on port 4000
    const alreadyRunning = await checkServerHealthy(4000);
    if (alreadyRunning) {
        console.log('[Desktop] TeleTerm backend server is already running on port 4000.');
        serverStatus = 'RUNNING';
        broadcastServerStatus();
        return;
    }

    console.log('[Desktop] Spawning TeleTerm ConPTY backend server process...');
    const serverScriptPath = path.join(__dirname, '../server/index.js');

    serverProcess = fork(serverScriptPath, [], {
        env: {
            ...process.env,
            PORT: '4000',
            HOST: '0.0.0.0',
            TELETERM_DESKTOP: 'true',
            TELETERM_USER_DATA_PATH: USER_DATA_PATH,
            ELECTRON_RUN_AS_NODE: '1'
        },
        stdio: ['ignore', 'pipe', 'pipe', 'ipc']
    });

    serverProcess.stdout?.on('data', (d) => {
        const line = d.toString();
        process.stdout.write(`[Server] ${line}`);
    });

    serverProcess.stderr?.on('data', (d) => {
        const line = d.toString();
        process.stderr.write(`[Server ERR] ${line}`);
    });

    serverProcess.on('exit', (code, signal) => {
        console.log(`[Desktop] Server process exited with code ${code}, signal ${signal}`);
        serverProcess = null;
        if (!isQuitting) {
            serverStatus = 'STOPPED';
            broadcastServerStatus();
        }
    });

    // Wait until server responds to health checks
    let attempts = 0;
    const maxAttempts = 30; // ~15 seconds
    while (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 500));
        const ok = await checkServerHealthy(4000);
        if (ok) {
            serverStatus = 'RUNNING';
            broadcastServerStatus();
            console.log('[Desktop] ConPTY backend server is READY and HEALTHY.');
            return;
        }
        attempts++;
    }

    serverStatus = 'ERROR';
    broadcastServerStatus();
    console.error('[Desktop] Backend server failed to start within timeout.');
}

function stopBackendServer() {
    if (serverProcess) {
        try {
            serverProcess.kill('SIGTERM');
        } catch (e) {}
        serverProcess = null;
    }
    serverStatus = 'STOPPED';
}

function broadcastServerStatus() {
    [launcherWindow, gameWindow].forEach(win => {
        if (win && !win.isDestroyed()) {
            win.webContents.send('teleterm:backend:statusChanged', {
                status: serverStatus,
                endpoint: 'http://127.0.0.1:4000'
            });
        }
    });
}

// --- Deep Link URL Parser & Handler ---
function handleDeepLinkUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return;
    console.log(`[Desktop] Processing deep link: ${urlStr}`);

    const targetWin = (gameWindow && !gameWindow.isDestroyed() && gameWindow.isVisible())
        ? gameWindow
        : (launcherWindow && !launcherWindow.isDestroyed() ? launcherWindow : null);

    if (targetWin) {
        if (targetWin.isMinimized()) targetWin.restore();
        targetWin.focus();

        try {
            const parsed = new URL(urlStr);
            if (parsed.protocol === 'teleterm:') {
                // Accept only codes returned for an OAuth state created by this desktop process.
                if (parsed.pathname === '//auth/callback' || parsed.pathname === '/auth/callback' || parsed.host === 'auth') {
                    const params = {};
                    parsed.searchParams.forEach((v, k) => { params[k] = v; });
                    if (!params.code || !params.state || !pendingDesktopOAuthStates.delete(params.state)) return;
                    targetWin.webContents.send('teleterm:auth:callback', params);
                }
                targetWin.webContents.send('teleterm:deepLink:received', urlStr);
            }
        } catch (e) {
            console.error('[Desktop] Failed to parse deep link URL:', e.message);
        }
    } else {
        pendingDeepLinkUrl = urlStr;
    }
}

// --- Standalone Launcher Window ---
function createLauncherWindow() {
    if (launcherWindow && !launcherWindow.isDestroyed()) {
        launcherWindow.show();
        launcherWindow.focus();
        return launcherWindow;
    }

    launcherWindow = new BrowserWindow({
        width: 1040,
        height: 680,
        minWidth: 960,
        minHeight: 600,
        center: true,
        resizable: true,
        frame: false, // Frameless window with custom sleek titlebar
        titleBarStyle: 'hidden',
        title: 'TeleTerm Launcher',
        backgroundColor: '#04060a',
        show: false, // Show once ready
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true,
            spellcheck: false
        }
    });

    launcherWindow.once('ready-to-show', () => {
        launcherWindow.show();
        if (pendingDeepLinkUrl) {
            handleDeepLinkUrl(pendingDeepLinkUrl);
            pendingDeepLinkUrl = null;
        }
    });

    launcherWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    launcherWindow.loadURL('http://127.0.0.1:4000/launcher.html');

    launcherWindow.on('closed', () => {
        launcherWindow = null;
        if (!gameWindow || gameWindow.isDestroyed()) {
            app.quit();
        }
    });

    return launcherWindow;
}

// --- 3D Game Client Window ---
function launchGameWindow() {
    if (gameWindow && !gameWindow.isDestroyed()) {
        gameWindow.show();
        gameWindow.focus();
        if (launcherWindow && !launcherWindow.isDestroyed()) {
            launcherWindow.hide();
        }
        return true;
    }

    const savedState = loadWindowState();

    gameWindow = new BrowserWindow({
        width: savedState.width || 1360,
        height: savedState.height || 860,
        x: savedState.x,
        y: savedState.y,
        minWidth: 960,
        minHeight: 600,
        frame: false,
        titleBarStyle: 'hidden',
        title: 'TeleTerm 3D',
        backgroundColor: '#04060a',
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            backgroundThrottling: false,
            webSecurity: true,
            spellcheck: false
        }
    });

    // Apply configured display mode
    const mode = currentDisplayMode || savedState.displayMode || 'borderless';
    if (mode === 'fullscreen') {
        gameWindow.setFullScreen(true);
    } else if (mode === 'borderless' || savedState.isMaximized) {
        gameWindow.maximize();
    }

    gameWindow.once('ready-to-show', () => {
        gameWindow.show();
        if (launcherWindow && !launcherWindow.isDestroyed()) {
            launcherWindow.hide();
        }
    });

    gameWindow.on('resize', saveWindowState);
    gameWindow.on('move', saveWindowState);
    gameWindow.on('maximize', () => {
        if (!gameWindow.isFullScreen()) currentDisplayMode = 'borderless';
        saveWindowState();
        gameWindow.webContents.send('teleterm:window:stateChanged', { isMaximized: true, isFullscreen: gameWindow.isFullScreen(), displayMode: currentDisplayMode });
        gameWindow.webContents.send('teleterm:window:displayModeChanged', { mode: currentDisplayMode });
    });
    gameWindow.on('unmaximize', () => {
        if (!gameWindow.isFullScreen()) currentDisplayMode = 'window';
        saveWindowState();
        gameWindow.webContents.send('teleterm:window:stateChanged', { isMaximized: false, isFullscreen: gameWindow.isFullScreen(), displayMode: currentDisplayMode });
        gameWindow.webContents.send('teleterm:window:displayModeChanged', { mode: currentDisplayMode });
    });
    gameWindow.on('enter-full-screen', () => {
        currentDisplayMode = 'fullscreen';
        saveWindowState();
        gameWindow.webContents.send('teleterm:window:stateChanged', { isMaximized: gameWindow.isMaximized(), isFullscreen: true, displayMode: 'fullscreen' });
        gameWindow.webContents.send('teleterm:window:displayModeChanged', { mode: 'fullscreen' });
    });
    gameWindow.on('leave-full-screen', () => {
        currentDisplayMode = gameWindow.isMaximized() ? 'borderless' : 'window';
        saveWindowState();
        gameWindow.webContents.send('teleterm:window:stateChanged', { isMaximized: gameWindow.isMaximized(), isFullscreen: false, displayMode: currentDisplayMode });
        gameWindow.webContents.send('teleterm:window:displayModeChanged', { mode: currentDisplayMode });
    });

    gameWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    gameWindow.loadURL('http://127.0.0.1:4000/?direct=1');

    gameWindow.on('closed', () => {
        gameWindow = null;
        if (launcherWindow && !launcherWindow.isDestroyed()) {
            launcherWindow.show();
            launcherWindow.focus();
        } else {
            app.quit();
        }
    });

    return true;
}

function exitToLauncher() {
    if (gameWindow && !gameWindow.isDestroyed()) {
        gameWindow.close();
    }
    if (launcherWindow && !launcherWindow.isDestroyed()) {
        launcherWindow.show();
        launcherWindow.focus();
    } else {
        createLauncherWindow();
    }
    return true;
}

// --- Second Instance Listener (Windows Deep Link / Multi-launch) ---
app.on('second-instance', (event, commandLine) => {
    const activeWin = getActiveWindow();
    if (activeWin) {
        if (activeWin.isMinimized()) activeWin.restore();
        activeWin.focus();
    }
    // Search for teleterm:// deep link in command line arguments
    const deepLinkArg = findDeepLinkArg(commandLine);
    if (deepLinkArg) {
        handleDeepLinkUrl(deepLinkArg);
    }
});

// Deep link event for macOS / custom URL handlers
app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLinkUrl(url);
});

// --- IPC Handlers ---
ipcMain.handle('teleterm:game:launch', async () => {
    return launchGameWindow();
});

ipcMain.handle('teleterm:game:exitToLauncher', async () => {
    return exitToLauncher();
});

ipcMain.handle('teleterm:window:minimize', (event) => {
    const win = getActiveWindow(event);
    if (win) win.minimize();
});

ipcMain.handle('teleterm:window:maximize', (event) => {
    const win = getActiveWindow(event);
    if (win) win.maximize();
});

ipcMain.handle('teleterm:window:unmaximize', (event) => {
    const win = getActiveWindow(event);
    if (win) win.unmaximize();
});

ipcMain.handle('teleterm:window:toggleMaximize', (event) => {
    const win = getActiveWindow(event);
    if (!win) return false;
    if (win.isMaximized()) {
        win.unmaximize();
        return false;
    } else {
        win.maximize();
        return true;
    }
});

ipcMain.handle('teleterm:window:isMaximized', (event) => {
    const win = getActiveWindow(event);
    return win ? win.isMaximized() : false;
});

ipcMain.handle('teleterm:window:close', (event) => {
    const win = getActiveWindow(event);
    if (win) win.close();
});

ipcMain.handle('teleterm:window:setFullscreen', (event, flag) => {
    const win = getActiveWindow(event);
    if (win) {
        return setWindowDisplayMode(flag ? 'fullscreen' : (win.isMaximized() ? 'borderless' : 'window'), win) === 'fullscreen';
    }
    return false;
});

ipcMain.handle('teleterm:window:setDisplayMode', (event, mode) => {
    const win = getActiveWindow(event);
    return setWindowDisplayMode(mode, win);
});

ipcMain.handle('teleterm:window:getDisplayMode', () => {
    return currentDisplayMode;
});

ipcMain.handle('teleterm:window:isFullscreen', (event) => {
    const win = getActiveWindow(event);
    return win ? win.isFullScreen() : false;
});

ipcMain.handle('teleterm:window:getBounds', (event) => {
    const win = getActiveWindow(event);
    return win ? win.getBounds() : null;
});

ipcMain.handle('teleterm:shell:openExternal', async (event, url) => {
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:'))) {
        await shell.openExternal(url);
        return true;
    }
    return false;
});

ipcMain.handle('teleterm:store:get', (event, key) => {
    return secureStoreGet(key);
});

ipcMain.handle('teleterm:store:set', (event, key, value) => {
    return secureStoreSet(key, value);
});

ipcMain.handle('teleterm:store:delete', (event, key) => {
    return secureStoreDelete(key);
});

ipcMain.handle('teleterm:notification:show', (event, title, options = {}) => {
    if (Notification.isSupported()) {
        const notif = new Notification({
            title: title || 'TeleTerm 3D',
            body: options.body || '',
            silent: options.silent || false
        });
        notif.show();
        return true;
    }
    return false;
});

ipcMain.handle('teleterm:clipboard:read', () => {
    return clipboard.readText();
});

ipcMain.handle('teleterm:clipboard:write', (event, text) => {
    clipboard.writeText(String(text || ''));
    return true;
});

ipcMain.handle('teleterm:backend:status', async () => {
    const isHealthy = await checkServerHealthy(4000);
    return {
        status: isHealthy ? 'RUNNING' : serverStatus,
        port: 4000,
        endpoint: 'http://127.0.0.1:4000'
    };
});

ipcMain.handle('teleterm:backend:restart', async () => {
    stopBackendServer();
    await startBackendServer();
    return {
        status: serverStatus,
        endpoint: 'http://127.0.0.1:4000'
    };
});

ipcMain.handle('teleterm:auth:startOAuth', async (event, provider) => {
    const authStartUrl = `http://127.0.0.1:4000/api/auth/desktop/oauth/start?client=desktop&provider=${encodeURIComponent(provider)}`;
    try {
        const response = await fetch(authStartUrl);
        const data = await response.json();
        if (data.success && data.authUrl) {
            pendingDesktopOAuthStates.add(data.state);
            await shell.openExternal(data.authUrl);
            return { success: true, state: data.state };
        }
    } catch (e) {
        console.error('[Desktop] Failed to start OAuth flow:', e.message);
    }
    return { success: false, error: 'oauth_provider_unavailable' };
});

ipcMain.handle('teleterm:system:info', () => {
    return {
        platform: process.platform,
        arch: process.arch,
        electronVersion: process.versions.electron,
        nodeVersion: process.versions.node,
        chromeVersion: process.versions.chrome,
        appVersion: app.getVersion()
    };
});

// --- App Lifecycle ---
app.whenReady().then(async () => {
    // 1. Start or connect to backend ConPTY server
    await startBackendServer();

    // 2. Open Launcher Window first (or Game Window directly if --game is specified)
    if (process.argv.includes('--game')) {
        launchGameWindow();
    } else {
        createLauncherWindow();
    }

    // 3. Check for deep link on cold start (Windows)
    const coldStartDeepLink = findDeepLinkArg(process.argv);
    if (coldStartDeepLink) {
        handleDeepLinkUrl(coldStartDeepLink);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createLauncherWindow();
        }
    });
});

app.on('before-quit', () => {
    isQuitting = true;
    saveWindowState();
    stopBackendServer();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
