// ICU Management – Service Worker (Web Push)
const SW_VERSION = 'icu-sw-v3';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'ICU Management';
  const options = {
    body: data.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: data.tag || data.type || undefined,
    renotify: !!(data.tag || data.type),
    data: { url: data.url || './', patient_id: data.patient_id || null }
  };
  // iOS requires a visible notification for every push
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const n = event.notification;
  const isChat = n.tag === 'chat' || /^💬/.test(n.title || '');
  let target = (n.data && n.data.url) || './';
  if (isChat) target = './?chat=1';
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if ('focus' in c) {
        await c.focus();
        if (isChat) c.postMessage({ type: 'open-chat' });
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  })());
});
