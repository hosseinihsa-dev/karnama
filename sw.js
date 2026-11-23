const C = 'karnama-v77';
const FILES = ['./', './index.html', './core.js?v=77', './memory.js?v=77', './behavior.js?v=77', './study.js?v=77', './graph.js?v=77', './decision.js?v=77', './clarify.js?v=77', './views.js?v=77', './style.css?v=77', './manifest.json?v=77', './icon-192.png?v=77', './icon-512.png?v=77', './icon-maskable.png?v=77', './logo-karnama.png?v=77'];
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
