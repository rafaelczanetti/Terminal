// Service Worker para Terminal Portfolio
const CACHE_NAME = 'terminal-portfolio-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
];

// Instalação do Service Worker e cache de recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de cache: network first, fallback para cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clonar a resposta para armazenar no cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            // Armazenar apenas respostas válidas
            if (event.request.url.startsWith('http') && response.status === 200) {
              cache.put(event.request, responseClone);
            }
          });
        return response;
      })
      .catch(() => {
        // Se a rede falhar, tente do cache
        return caches.match(event.request)
          .then(response => {
            return response || new Response('Conteúdo não disponível offline', {
              status: 404,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
}); 