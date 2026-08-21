/* Registra Giro — componente offline.
   Strategia: prima la rete (così vedi sempre la versione più recente), con
   ricaduta sulla copia locale se la rete manca o è troppo lenta.

   ver11 — una sola modifica: l'attesa passa da 2.500 a 7.000 ms.
   Il perché, per chi rilegge: il limite di 2,5 s è stato scritto quando
   index.html pesava 272 KB. Adesso pesa 521 KB, e per scaricarlo in 2,5 s
   serve una linea sopra 1,7 Mbit/s sostenuti. Sotto quella soglia la prima
   apertura dopo un aggiornamento mostrava la copia vecchia. Non restava
   vecchia per sempre — il `c.put` qui sotto aggiorna la copia anche quando
   il timer ha già risposto, quindi l'apertura successiva era già nuova — ma
   una versione di ritardo su ogni aggiornamento è un fastidio evitabile.

   Il nome della cache passa a `registra-giro-2`: l'handler `activate` cancella
   le cache con un nome diverso, quindi caricando questo file la copia vecchia
   viene buttata via una volta sola e la prima apertura riparte pulita.

   I dati dei giri NON stanno qui: vivono in localStorage e IndexedDB, che
   questo file non tocca. Cambiare sw.js non può far perdere un giro. */
const CACHE = 'registra-giro-2';
const RISORSE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-512.png'];
const ATTESA_MAX = 7000;   // ms: oltre questo si usa la copia salvata

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
        /* Questo aggiornamento della copia locale prosegue anche quando il
           timer ha già risposto dalla cache: è il motivo per cui un'apertura
           lenta costa una versione di ritardo e non un blocco permanente. */
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
