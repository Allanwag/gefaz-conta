const CACHE = 'gefaz-conta-v20';
const PREFIX = 'gefaz-conta-';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  // A failed download must not activate an incomplete offline version.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(a => new Request(a, {cache:'reload'}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
const comPrazo = (p, ms) => new Promise((ok, falha) => {
  const t = setTimeout(() => falha(new Error('sem rede')), ms);
  p.then(v => { clearTimeout(t); ok(v); }, err => { clearTimeout(t); falha(err); });
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin ||
      !url.href.startsWith(self.registration.scope)) return;
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    const resposta = comPrazo(fetch(e.request), 2500).then(async res => {
      if (!res.ok) throw new Error('Falha HTTP');
      const cache = await caches.open(CACHE);
      await cache.put('./index.html', res.clone()).catch(() => {});
      return res;
    }).catch(async () => {
      const cache = await caches.open(CACHE);
      return await cache.match('./index.html') || await cache.match('./') || Response.error();
    });
    e.respondWith(resposta);
    e.waitUntil(resposta.then(() => {}));
    return;
  }
  const resposta = caches.open(CACHE).then(async cache => {
    const cached = await cache.match(e.request);
    if (cached) return cached;
    const res = await fetch(e.request);
    if (res.ok) await cache.put(e.request, res.clone()).catch(() => {});
    return res;
  }).catch(() => Response.error());
  e.respondWith(resposta);
  e.waitUntil(resposta.then(() => {}));
});
