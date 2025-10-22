/* Darts Counter SW — cache app shell + runtime assets */

const CACHE_NAME = 'darts-counter-v1';
const APP_SHELL = [
  '/',                    // redirigé vers index.html côté serveur
  '/index.html',
  '/manifest.webmanifest',
  '/icons/app-192.png',
  '/icons/app-512.png',
  '/icons/app-maskable-512.png'
];

// Pendant l'installation : on pré-cache le “shell”
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)));
    await self.clients.claim();
  })());
});

// Stratégies de fetch
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) Pages (navigations) — Network first, fallback cache
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put('/index.html', fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  // 2) Assets (scripts, styles, images, fonts) — Cache first
  if (['script','style','image','font'].includes(req.destination)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        // Ne cache que les réponses valides
        if (fresh && fresh.status === 200 && fresh.type === 'basic') {
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch {
        return cached || Response.error();
      }
    })());
  }
});