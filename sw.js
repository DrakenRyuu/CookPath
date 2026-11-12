const CACHE = 'cookpath-shell-v22';
const FILES = ['./', './index.html', './greek.js', './language.js', './lessons.js', './questions.js', './quotes.js', './recipes.js', './additions.css', './tours.js', './cuisines.js', './manifest.json', './manifest-el.json', './icon.svg', './refinements.css', './portraits.js', './knife-data.js', './knife-photos.js', './knives.js', './assets/olive-sprigs.svg', './assets/knife-crossed-illustration.jpg'];
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
  // Check the network for current app code, retaining the saved shell for offline use.
  // Images keep the cache-first path below so repeat visits do not redownload them.
  if (event.request.mode === 'navigate' || /\.(?:html|js|css|json)$/.test(url.pathname)) {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
      }
      return response;
    }).catch(async error => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      const shell = new URL('index.html', self.registration.scope);
      const root = new URL(self.registration.scope);
      if (event.request.mode === 'navigate' && [shell.pathname, root.pathname].includes(url.pathname)) return caches.match(shell.href);
      throw error;
    }));
    return;
  }
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
