const C = 'karnama-v82';
const FILES = ['./', './index.html', './core.js?v=82', './memory.js?v=82', './behavior.js?v=82', './study.js?v=82', './graph.js?v=82', './decision.js?v=82', './clarify.js?v=82', './views.js?v=82', './style.css?v=82', './manifest.json?v=82', './icon-192.png?v=82', './icon-512.png?v=82', './icon-maskable.png?v=82', './logo-karnama.png?v=82'];
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
self.addEventListener('push', event => event.waitUntil(showReminder(event)));

async function showReminder(event) {
  let due;
  try { due = event.data?.json().due; } catch { return; }
  if (!Number.isSafeInteger(due) || due <= Date.now()) return;
  const minutes = Math.ceil((due - Date.now()) / 60_000);
  const label = new Intl.NumberFormat('fa-IR').format(minutes);
  const receipt = {due, at:Date.now(), displayed:false};
  try {
    await self.registration.showNotification('کارنما', {
      body: `تا کار بعدی ${label} دقیقه مانده است.`,
      icon: new URL('./icon-192.png', self.registration.scope).href,
      tag: 'karnama-upcoming-' + due,
      data: {page: new URL('./index.html', self.registration.scope).href},
    });
    receipt.displayed = true;
  } catch (error) {
    receipt.error = error.name;
  }
  const cache = await caches.open(C);
  await cache.put(new URL('./__push-receipt', self.registration.scope), Response.json(receipt));
}
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
