const C = 'karnama-v51';
const FILES = ['./', './index.html', './core.js?v=51', './memory.js?v=51', './behavior.js?v=51', './study.js?v=51', './decision.js?v=51', './clarify.js?v=51', './views.js?v=51', './style.css?v=51', './manifest.json?v=51', './icon-192.png?v=51', './icon-512.png?v=51', './icon-maskable.png?v=51', './logo-karnama.png?v=51'];
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
