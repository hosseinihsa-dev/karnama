const C = 'karnama-v76';
const FILES = ['./', './index.html', './core.js?v=76', './memory.js?v=76', './behavior.js?v=76', './study.js?v=76', './graph.js?v=76', './decision.js?v=76', './clarify.js?v=76', './views.js?v=76', './style.css?v=76', './manifest.json?v=76', './icon-192.png?v=76', './icon-512.png?v=76', './icon-maskable.png?v=76', './logo-karnama.png?v=76'];
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
