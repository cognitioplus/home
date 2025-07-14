const CACHE_NAME = "cognitio-booking-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/booking.html",
  "/booking-script.js",
  "/booking-style.css",
  "/booking-manifest.json",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
