// Service worker for "Royaume de la Mariée" — caches the app page itself so
// it can still open with no internet connection. Firestore data is handled
// separately by Firestore's own offline persistence (see index.html).
const CACHE_NAME = 'royaume-mariee-shell-v1';
const APP_SHELL_URL = './index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(APP_SHELL_URL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only intercept the page load itself (navigation). Everything else
  // (Firebase calls, fonts, etc.) goes straight to the network as normal.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(APP_SHELL_URL, copy));
          return response;
        })
        .catch(() => caches.match(APP_SHELL_URL))
    );
  }
});
