// Service Worker básico para a PWA
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Por agora, apenas deixa a rede funcionar normalmente
});
