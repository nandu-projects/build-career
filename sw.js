// Build Career - Service Worker (Safe cache update strategy)
const CACHE_NAME = 'build-career-v2';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Network first, falling back to cache if offline
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and save copy to cache for offline use
        if (response && response.status === 200 && response.type === 'basic') {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
