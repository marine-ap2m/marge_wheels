/* Ma Marge — service worker.
   Le HTML passe par le réseau d'abord (une nouvelle mise en ligne arrive tout de
   suite), le reste par le cache d'abord (démarrage instantané, marche hors-ligne). */
const CACHE = 'mamarge-v6';
const ASSETS = ['./','./index.html','./manifest.webmanifest',
  './icon-192.png','./icon-512.png','./icon-maskable-192.png','./icon-maskable-512.png','./favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {                       // réseau d'abord
    e.respondWith(
      fetch(req)
        .then(resp => { const cp = resp.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return resp; })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(                                       // cache d'abord
    caches.match(req).then(r => r || fetch(req).then(resp => {
      if (resp && resp.ok && resp.type === 'basic') {
        const cp = resp.clone(); caches.open(CACHE).then(c => c.put(req, cp));
      }
      return resp;
    }))
  );
});
