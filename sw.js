// Service worker sederhana: cache-first untuk file inti supaya bisa main offline
// setelah kunjungan pertama. Font Google & Phaser CDN di-cache juga saat berhasil diambil.
const CACHE_NAME = 'nusantara12-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/InputManager.js',
  './js/palette.js',
  './js/main.js',
  './js/scenes/Boot.js',
  './js/scenes/Congklak.js',
  './js/scenes/LompatTali.js',
  './js/scenes/Engklek.js',
  './js/scenes/Egrang.js',
  './js/scenes/Kelereng.js',
  './js/scenes/GobakSodor.js',
  './js/scenes/Layangan.js',
  './js/scenes/SuitMonopoli.js',
  './js/scenes/Bentengan.js',
  './js/scenes/PetakUmpet.js',
  './js/scenes/BalapKarung.js',
  './js/scenes/Bakiak.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
