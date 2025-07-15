const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = [
  "/",
  "/assets/css/custom.css",
  "/assets/js/custom.js",
  "/logo.png",
  "/hero-bg.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
