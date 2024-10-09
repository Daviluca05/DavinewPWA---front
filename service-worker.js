const CACHE_NAME = 'plantation-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/tutorial.html',
    '/mapa.html',
    '/contato.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Install Event');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching all resources');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('[Service Worker] Erro ao adicionar arquivos ao cache:', error);
            })
    );
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate Event');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log(`[Service Worker] Deletando cache antigo: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    console.log('[Service Worker] Fetch Event:', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('[Service Worker] Retornando recurso do cache:', event.request.url);
                    return response;
                }
                console.log('[Service Worker] Fazendo requisição de rede:', event.request.url);
                return fetch(event.request);
            })
            .catch(error => {
                console.error('[Service Worker] Erro durante o fetch:', error);
            })
    );
});
