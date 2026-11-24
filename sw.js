const C = 'karnama-v81';
const FILES = ['./', './index.html', './core.js?v=81', './memory.js?v=81', './behavior.js?v=81', './study.js?v=81', './graph.js?v=81', './decision.js?v=81', './clarify.js?v=81', './views.js?v=81', './style.css?v=81', './manifest.json?v=81', './icon-192.png?v=81', './icon-512.png?v=81', './icon-maskable.png?v=81', './logo-karnama.png?v=81'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === location.origin;
  if (!same) return;
  const req = same ? new Request(e.request.url, {cache: 'reload', mode: 'same-origin'}) : e.request;
  e.respondWith(
    fetch(req).then(r => {
      if (r && r.ok && same) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
self.addEventListener('push', event => {
  let due;
  try { due = event.data?.json().due; } catch { return; }
  if (!Number.isSafeInteger(due) || due <= Date.now()) return;
  const minutes = Math.ceil((due - Date.now()) / 60_000);
  const label = new Intl.NumberFormat('fa-IR').format(minutes);
  event.waitUntil(self.registration.showNotification('کارنما', {
    body: `تا کار بعدی ${label} دقیقه مانده است.`,
    icon: new URL('./icon-192.png', self.registration.scope).href,
    tag: 'karnama-upcoming-' + due,
    data: {page: new URL('./index.html', self.registration.scope).href},
  }));
});
self.addEventListener('notificationclick', event => {
  const page = event.notification.data?.page;
  if (!page) return;
  event.notification.close();
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    const existing = windows.find(client => client.url.startsWith(self.registration.scope));
    if (existing) await existing.focus();
    else await self.clients.openWindow(page);
  })());
});
