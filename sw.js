/* Registra Giro — componente offline.
   Questo file NON va mai aggiornato: gli aggiornamenti dell'app riguardano solo index.html.
   Strategia: prima la rete (così vedi sempre la versione più recente), con ricaduta
   immediata sulla copia locale se la rete manca o è lenta. */
const CACHE = 'registra-giro';
const RISORSE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];
const ATTESA_MAX = 2500;   // ms: oltre questo si usa la copia salvata

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(RISORSE.map(u => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(new Promise(resolve => {
    let risolto = false;
    const daCache = () => caches.match(req)
      .then(r => r || caches.match('./index.html'))
      .then(r => r || new Response('Offline', {status:503, headers:{'Content-Type':'text/plain'}}));

    const timer = setTimeout(() => {
      if (risolto) return;
      daCache().then(r => { if (!risolto) { risolto = true; resolve(r); } });
    }, ATTESA_MAX);

    fetch(req).then(r => {
      if (r && r.ok) {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
      }
      if (!risolto) { risolto = true; clearTimeout(timer); resolve(r); }
    }).catch(() => {
      if (risolto) return;
      clearTimeout(timer);
      daCache().then(r => { if (!risolto) { risolto = true; resolve(r); } });
    });
  }));
});
