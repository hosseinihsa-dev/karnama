const C = 'karnama-v54';
const FILES = ['./', './index.html', './core.js?v=54', './memory.js?v=54', './behavior.js?v=54', './study.js?v=54', './decision.js?v=54', './clarify.js?v=54', './views.js?v=54', './style.css?v=54', './manifest.json?v=54', './icon-192.png?v=54', './icon-512.png?v=54', './icon-maskable.png?v=54', './logo-karnama.png?v=54'];
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
