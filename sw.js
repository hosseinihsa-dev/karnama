const C = 'karnama-v84';
const FILES = ['./', './index.html', './core.js?v=84', './memory.js?v=84', './behavior.js?v=84', './study.js?v=84', './graph.js?v=84', './decision.js?v=84', './clarify.js?v=84', './views.js?v=84', './style.css?v=84', './manifest.json?v=84', './icon-192.png?v=84', './icon-512.png?v=84', './icon-maskable.png?v=84', './logo-karnama.png?v=84'];
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
  let due, stage;
  try { ({due, minutes:stage} = event.data?.json() || {}); } catch { return; }
  if (!Number.isSafeInteger(due) || due <= Date.now()) return;
  const minutes = stage === 5 || stage === 15 ? stage : Math.ceil((due - Date.now()) / 60_000);
  const label = new Intl.NumberFormat('fa-IR').format(minutes);
  const receipt = {due, minutes:stage, at:Date.now(), displayed:false};
  const cache = await caches.open(C);
  let titles;
  try {
    const cached = await cache.match(new URL('./__push-titles', self.registration.scope));
    titles = cached && (await cached.json())[due];
  } catch {}
  try {
    const names = titles?.length ? titles : ['کارنما'];
    await Promise.all(names.map((title, index) => self.registration.showNotification(title, {
      body: `${label} دقیقه تا زمان انجام کار`,
      icon: new URL('./icon-192.png', self.registration.scope).href,
      tag: `karnama-upcoming-${due}-${stage || 'legacy'}-${index}`,
      data: {page: new URL('./index.html', self.registration.scope).href},
    })));
    receipt.displayed = true;
  } catch (error) {
    receipt.error = error.name;
  }
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
