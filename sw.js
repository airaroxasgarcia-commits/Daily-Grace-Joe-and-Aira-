const CACHE_NAME = 'daily-grace-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only manage caching for this app's own files.
  // Cross-origin requests (like Google Fonts) go straight to the network,
  // letting the browser's normal font cache handle them instead.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Network-first for everything in this app (page, manifest, icons).
  // This guarantees that whatever you last uploaded to GitHub is what
  // shows up, instead of a stale cached copy sticking around.
  // The cache is only used as a fallback when there's no connection.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
