self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Simple offline fallback for root (optional minimal cache)
const CACHE = 'joke-app-v1';
const PRECACHE_URLS = ['/', '/favicon.png', '/manifest.webmanifest', '/sound.mp3'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).catch(() => cached))
  );
});

// Allow pages to request a local notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_JOKE_NOTIFICATION') {
    self.registration.showNotification('JOKE!!!', {
      body: 'oj blyat, eta shutka',
      vibrate: [200, 100, 200, 100, 400],
      badge: '/favicon.png',
      icon: '/favicon.png',
      tag: 'joke-notification',
      renotify: true
    });
  }
});

