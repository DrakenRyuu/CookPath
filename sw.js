// While maintenance is live, retire cached app shells so new visits see the maintenance page.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('cookpath-shell-')).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
