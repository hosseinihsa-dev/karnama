const C = 'karnama-v67';
const FILES = ['./', './index.html', './core.js?v=67', './memory.js?v=67', './behavior.js?v=67', './study.js?v=67', './graph.js?v=67', './decision.js?v=67', './clarify.js?v=67', './views.js?v=67', './style.css?v=67', './manifest.json?v=67', './icon-192.png?v=67', './icon-512.png?v=67', './icon-maskable.png?v=67', './logo-karnama.png?v=67'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === location.origin;
  const req = same ? new Request(e.request.url, {cache: 'reload', mode: 'same-origin'}) : e.request;
  e.respondWith(
    fetch(req).then(r => {
      if (r && r.ok && same) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
