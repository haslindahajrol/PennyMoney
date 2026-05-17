self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => self.clients.claim());
// Network-first: always fetch fresh data, no caching needed for this tool
self.addEventListener("fetch", (e) => e.respondWith(fetch(e.request)));
