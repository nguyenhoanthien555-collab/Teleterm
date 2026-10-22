// TeleTerm Service Worker - PWA Standalone Fullscreen 24/7
const CACHE_NAME = 'teleterm-pwa-v4';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Không can thiệp API, WebSocket và 3D models lớn để đảm bảo tốc độ và tránh abort stream
    if (
        event.request.url.includes('/ws') || 
        event.request.url.includes('/api/') ||
        event.request.url.endsWith('.glb') ||
        event.request.url.endsWith('.vrm')
    ) {
        return;
    }
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});
