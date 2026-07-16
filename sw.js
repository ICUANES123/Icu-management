// ============================================================
// Service Worker for Push Notifications — ICU Management System
// This file MUST be uploaded to the repo ROOT (same folder as
// index.html), named exactly "sw.js" — do not rename it.
// ============================================================

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

// Fired when a push message arrives from the server, even if
// the app is closed (as long as the device is online).
self.addEventListener('push', function(event) {
  let data = { title: 'ICU System', body: 'You have a new notification' };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const title = data.title || 'ICU System';
  const options = {
    body: data.body || '',
    tag: data.tag || 'icu-notification',
    data: { url: data.url || './' },
    requireInteraction: false
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Fired when the user taps the notification — opens/focuses the app.
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
