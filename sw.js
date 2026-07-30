const CACHE = 'gefaz-conta-v13';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(ASSETS.map(a => fetch(a, { cache: 'reload' }).then(res => c.put(a, res)).catch(() => null)))
  ).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

/* corre a rede e o cache ao mesmo tempo: quem responder primeiro atende */
const comPrazo = (p, ms) => new Promise((ok, falha) => {
  const t = setTimeout(() => falha(new Error('sem rede')), ms);
  p.then(v => { clearTimeout(t); ok(v); }, err => { clearTimeout(t); falha(err); });
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  /* A PÁGINA vem da rede primeiro. Com cache-first o aparelho ficava preso numa versão antiga
     do app — a correção era publicada e o celular continuava rodando o código velho.
     Sem sinal no cafezal, cai no cache em 2,5s e o app abre normalmente. */
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      comPrazo(fetch(e.request), 2500).then(res => {
        if (res && res.status === 200) {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copia));
        }
        return res;
      }).catch(() => caches.match('./index.html').then(r => r || caches.match('./')))
    );
    return;
  }

  /* ícones, manifest e afins continuam vindo do cache primeiro */
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      if (res && res.status === 200 && e.request.url.startsWith(self.location.origin)) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => Response.error()))
  );
});
