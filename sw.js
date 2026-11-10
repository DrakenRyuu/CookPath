const CACHE = 'cookpath-shell-v12';
const FILES = ['./', './index.html', './greek.js', './language.js', './lessons.js', './questions.js', './quotes.js', './recipes.js', './additions.css', './tours.js', './cuisines.js', './manifest.json', './manifest-el.json', './icon.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('cookpath-shell-') && key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || event.request.headers.has('Range') || url.pathname.endsWith('.mp4')) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && response.status !== 206) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(error => {
    const shell = new URL('index.html', self.registration.scope);
    const root = new URL(self.registration.scope);
    if (event.request.mode === 'navigate' && [shell.pathname, root.pathname].includes(url.pathname)) {
      return caches.match(shell.href);
    }
    throw error;
  })));
});
