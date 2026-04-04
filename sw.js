// Service Worker - Party Rental Tracker
// Change CACHE_VERSION every time you push an update to bust the cache
const CACHE_VERSION = 'v3.0';
const CACHE_NAME = 'rental-app-' + CACHE_VERSION;

// Install: cache the app files
self.addEventListener('install', event => {
  self.skipWaiting(); // activate immediately, don't wait
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json'
      ]);
    })
  );
});

// Activate: delete all old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim(); // take control of all pages immediately
    })
  );
});

// Fetch: network-first strategy so app always gets latest version
// Falls back to cache only when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(response => {
      // Got network response - cache it and return
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, clone);
      });
      return response;
    }).catch(() => {
      // Offline - try cache
      return caches.match(event.request);
    })
  );
});
