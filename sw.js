const CACHE_NAME = 'siber-macera-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/assets/oyungirisekranı.svg',
  '/assets/Asset 4.svg',
  '/assets/Asset 5.svg',
  '/assets/Asset 9.svg',
  '/assets/Asset 10.svg',
  '/assets/Asset 11.svg',
  '/assets/Asset 12.svg',
  '/assets/Asset 13.svg',
  '/assets/Asset 14.svg',
  '/assets/Asset 15.svg',
  '/fonts/Gilmer Regular.otf',
  '/fonts/Gilmer Light.otf',
  '/fonts/Gilmer Bold.otf',
  '/fonts/conthrax-sb.otf'
];

// Service Worker kurulumu
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 Cache açıldı');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch olaylarını yakala
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache'de varsa cache'den döndür
        if (response) {
          return response;
        }
        
        // Cache'de yoksa network'ten al
        return fetch(event.request).then(
          function(response) {
            // Geçersiz response'ları cache'leme
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Response'u clone'la (stream olduğu için)
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Eski cache'leri temizle
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 