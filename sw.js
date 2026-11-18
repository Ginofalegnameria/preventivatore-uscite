// Fa aprire l'app anche senza rete: tiene una copia delle pagine sul telefono.
// Con la rete prende sempre la versione nuova; senza rete usa la copia salvata.
const CACHE = 'pialletto-v1';
const FILE = ['./', './index.html', './laboratorio.html', './stile.css', './logo.png', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(r => {
        if (r && r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
        return r;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then(r => r || caches.match('./index.html')))
  );
});
