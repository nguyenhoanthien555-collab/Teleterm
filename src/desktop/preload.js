/**
 * TeleTerm Desktop Client Preload Script
 * Exposes safe, secure TeleTermNative bridge to the Renderer via contextBridge.
 * The universal platform adapter (teleterm-platform.js) attaches to window.TeleTermPlatform
 * to ensure 100% interoperability across desktop and web clients without read-only collisions.
 */

const { contextBridge, ipcRenderer } = require('electron');

const desktopBridge = {
    isDesktop: () => true,
    platform: process.platform,
    version: '5.0.0',

    window: {
        minimize: () => ipcRenderer.invoke('teleterm:window:minimize'),
        maximize: () => ipcRenderer.invoke('teleterm:window:maximize'),
        unmaximize: () => ipcRenderer.invoke('teleterm:window:unmaximize'),
        toggleMaximize: () => ipcRenderer.invoke('teleterm:window:toggleMaximize'),
        isMaximized: () => ipcRenderer.invoke('teleterm:window:isMaximized'),
        close: () => ipcRenderer.invoke('teleterm:window:close'),
        setFullscreen: (flag) => ipcRenderer.invoke('teleterm:window:setFullscreen', flag),
        isFullscreen: () => ipcRenderer.invoke('teleterm:window:isFullscreen'),
        setDisplayMode: (mode) => ipcRenderer.invoke('teleterm:window:setDisplayMode', mode),
        getDisplayMode: () => ipcRenderer.invoke('teleterm:window:getDisplayMode'),
        getBounds: () => ipcRenderer.invoke('teleterm:window:getBounds'),
        onWindowStateChange: (callback) => {
            if (typeof callback !== 'function') return;
            const handler = (event, state) => callback(state);
            ipcRenderer.on('teleterm:window:stateChanged', handler);
            return () => ipcRenderer.removeListener('teleterm:window:stateChanged', handler);
        },
        onDisplayModeChange: (callback) => {
            if (typeof callback !== 'function') return;
            const handler = (event, data) => callback(data);
            ipcRenderer.on('teleterm:window:displayModeChanged', handler);
            return () => ipcRenderer.removeListener('teleterm:window:displayModeChanged', handler);
        }
    },

    openExternalUrl: (url) => ipcRenderer.invoke('teleterm:shell:openExternal', url),

    secureStore: {
        get: (key) => ipcRenderer.invoke('teleterm:store:get', key),
        set: (key, value) => ipcRenderer.invoke('teleterm:store:set', key, value),
        delete: (key) => ipcRenderer.invoke('teleterm:store:delete', key)
    },

    notifications: {
        show: (title, options) => ipcRenderer.invoke('teleterm:notification:show', title, options)
    },

    clipboard: {
        readText: () => ipcRenderer.invoke('teleterm:clipboard:read'),
        writeText: (text) => ipcRenderer.invoke('teleterm:clipboard:write', text)
    },

    deepLink: {
        onAuthCallback: (callback) => {
            if (typeof callback !== 'function') return;
            const handler = (event, data) => callback(data);
            ipcRenderer.on('teleterm:auth:callback', handler);
            return () => ipcRenderer.removeListener('teleterm:auth:callback', handler);
        }
    },

    auth: {
        startOAuth: (provider) => ipcRenderer.invoke('teleterm:auth:startOAuth', provider),
        onDeepLink: (callback) => {
            if (typeof callback !== 'function') return;
            const handler = (event, url) => callback(url);
            ipcRenderer.on('teleterm:deepLink:received', handler);
            return () => ipcRenderer.removeListener('teleterm:deepLink:received', handler);
        }
    },

    backend: {
        getStatus: () => ipcRenderer.invoke('teleterm:backend:status'),
        restart: () => ipcRenderer.invoke('teleterm:backend:restart'),
        getEndpoint: () => 'http://127.0.0.1:4000',
        onStatusChange: (callback) => {
            if (typeof callback !== 'function') return;
            const handler = (event, status) => callback(status);
            ipcRenderer.on('teleterm:backend:statusChanged', handler);
            return () => ipcRenderer.removeListener('teleterm:backend:statusChanged', handler);
        }
    },

    system: {
        getInfo: () => ipcRenderer.invoke('teleterm:system:info')
    },

    game: {
        launch: () => ipcRenderer.invoke('teleterm:game:launch'),
        exitToLauncher: () => ipcRenderer.invoke('teleterm:game:exitToLauncher')
    }
};

contextBridge.exposeInMainWorld('TeleTermNative', desktopBridge);
contextBridge.exposeInMainWorld('__TeleTermDesktopBridge__', desktopBridge);
