const CACHE_NAME = 'vault-ledger-v2-5-pwa-fix';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './vault-ledger-icon-192.png',
  './vault-ledger-icon-512.png',
  './favicon.png',
  './splash-logo.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL).catch(() => null))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        if (url.origin === self.location.origin) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => null);
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
