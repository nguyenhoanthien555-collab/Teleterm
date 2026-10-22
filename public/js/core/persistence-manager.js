/**
 * TELETERM 3D — CLIENT-SIDE STATE PERSISTENCE MANAGER
 * High-performance, debounced persistence layer utilizing IndexedDB (TeleTerm3D_DB)
 * with graceful localStorage fallback.
 * 
 * Stores:
 * - world_state: time-of-day preference, active weather, player coordinates, active quest
 * - user_profile: inventory slots, equipped item, unlocked emotes, XP, rank, audio/graphics settings
 * - photo_gallery: full image Blobs captured by Photo Studio, metadata, timestamps, filters
 * 
 * Complies with Argon Architecture Guidelines:
 * - 1200ms debounce buffer on rapid updates
 * - Immediate flush on `beforeunload` and `visibilitychange`
 * - Zero UI thread blocking
 */

const DB_NAME = 'TeleTerm3D_DB';
const DB_VERSION = 1;

class PersistenceManager {
    constructor() {
        this.db = null;
        this.isReady = false;
        this.readyPromise = null;
        this.writeQueue = new Map(); // storeName:key -> value
        this.flushTimer = null;
        this.debounceDelayMs = 1200;

        this.init();
    }

    init() {
        this.readyPromise = new Promise((resolve) => {
            if (typeof indexedDB === 'undefined') {
                console.warn('[PersistenceManager] IndexedDB unavailable, falling back to localStorage');
                this.isReady = true;
                resolve(false);
                return;
            }

            try {
                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains('world_state')) {
                        db.createObjectStore('world_state');
                    }
                    if (!db.objectStoreNames.contains('user_profile')) {
                        db.createObjectStore('user_profile');
                    }
                    if (!db.objectStoreNames.contains('photo_gallery')) {
                        const photoStore = db.createObjectStore('photo_gallery', { keyPath: 'id', autoIncrement: true });
                        photoStore.createIndex('timestamp', 'timestamp', { unique: false });
                    }
                };

                request.onsuccess = (e) => {
                    this.db = e.target.result;
                    this.isReady = true;
                    this._bindWindowUnload();
                    resolve(true);
                };

                request.onerror = (e) => {
                    console.warn('[PersistenceManager] IndexedDB open error:', e.target.error);
                    this.isReady = true;
                    resolve(false);
                };
            } catch (err) {
                console.warn('[PersistenceManager] IndexedDB exception:', err);
                this.isReady = true;
                resolve(false);
            }
        });
    }

    _bindWindowUnload() {
        if (typeof window === 'undefined') return;

        window.addEventListener('beforeunload', () => {
            this.flushSync();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.flushSync();
            }
        });
    }

    async get(storeName, key, defaultValue = null) {
        await this.readyPromise;

        // Check pending write queue first
        const queueKey = `${storeName}:${key}`;
        if (this.writeQueue.has(queueKey)) {
            return this.writeQueue.get(queueKey);
        }

        if (this.db) {
            return new Promise((resolve) => {
                try {
                    const tx = this.db.transaction(storeName, 'readonly');
                    const store = tx.objectStore(storeName);
                    const req = store.get(key);
                    req.onsuccess = () => {
                        resolve(req.result !== undefined ? req.result : defaultValue);
                    };
                    req.onerror = () => {
                        resolve(this._getLocalFallback(storeName, key, defaultValue));
                    };
                } catch (_) {
                    resolve(this._getLocalFallback(storeName, key, defaultValue));
                }
            });
        }

        return this._getLocalFallback(storeName, key, defaultValue);
    }

    set(storeName, key, value) {
        const queueKey = `${storeName}:${key}`;
        this.writeQueue.set(queueKey, value);

        // Schedule debounced batch flush
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
        }
        this.flushTimer = setTimeout(() => {
            this.flush();
        }, this.debounceDelayMs);
    }

    async flush() {
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }

        if (this.writeQueue.size === 0) return;
        await this.readyPromise;

        const entries = Array.from(this.writeQueue.entries());
        this.writeQueue.clear();

        for (const [queueKey, value] of entries) {
            const [storeName, key] = queueKey.split(':');

            if (this.db) {
                try {
                    const tx = this.db.transaction(storeName, 'readwrite');
                    const store = tx.objectStore(storeName);
                    store.put(value, key);
                } catch (e) {
                    this._setLocalFallback(storeName, key, value);
                }
            } else {
                this._setLocalFallback(storeName, key, value);
            }
        }
    }

    flushSync() {
        if (this.writeQueue.size === 0) return;

        // Synchronously save pending state to localStorage as a safety net
        const entries = Array.from(this.writeQueue.entries());
        this.writeQueue.clear();

        for (const [queueKey, value] of entries) {
            const [storeName, key] = queueKey.split(':');
            this._setLocalFallback(storeName, key, value);
        }
    }

    // Photo Gallery specific methods
    async savePhoto(photoBlob, metadata = {}) {
        await this.readyPromise;
        const entry = {
            blob: photoBlob,
            timestamp: Date.now(),
            filter: metadata.filter || 'normal',
            location: metadata.location || 'Developer Hub',
            timeOfDay: metadata.timeOfDay || 12.0,
            caption: metadata.caption || 'TeleTerm 3D Snapshot'
        };

        if (this.db) {
            return new Promise((resolve, reject) => {
                try {
                    const tx = this.db.transaction('photo_gallery', 'readwrite');
                    const store = tx.objectStore('photo_gallery');
                    const req = store.add(entry);
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => reject(req.error);
                } catch (err) {
                    reject(err);
                }
            });
        }
        return null;
    }

    async getPhotos(limit = 20) {
        await this.readyPromise;
        if (!this.db) return [];

        return new Promise((resolve) => {
            try {
                const tx = this.db.transaction('photo_gallery', 'readonly');
                const store = tx.objectStore('photo_gallery');
                const index = store.index('timestamp');
                const req = index.openCursor(null, 'prev');
                const results = [];

                req.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor && results.length < limit) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
                req.onerror = () => resolve([]);
            } catch (_) {
                resolve([]);
            }
        });
    }

    _getLocalFallback(storeName, key, defaultValue) {
        if (typeof localStorage === 'undefined') return defaultValue;
        try {
            const raw = localStorage.getItem(`teleterm_${storeName}_${key}`);
            return raw !== null ? JSON.parse(raw) : defaultValue;
        } catch (_) {
            return defaultValue;
        }
    }

    _setLocalFallback(storeName, key, value) {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem(`teleterm_${storeName}_${key}`, JSON.stringify(value));
        } catch (_) {}
    }

    async getUserProfile() {
        return await this.get('user_profile', 'main_profile', {
            xp: 650,
            unlockedShopItems: [],
            activeAura: null,
            activeLut: null,
            completedTodQuests: []
        });
    }

    async saveUserProfile(profile) {
        this.set('user_profile', 'main_profile', profile);
    }
}

export const persistenceManager = new PersistenceManager();
if (typeof window !== 'undefined') {
    window.persistenceManager = persistenceManager;
}
