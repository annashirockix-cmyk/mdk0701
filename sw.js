/* Service Worker МДК 07.01 */
const CACHE = "mdk0701-v10-final"; // <--- ОБНОВЛЕНО
const ASSETS = [
  "./", "./index.html", "./style.css",
  "./data.js", "./info.js", "./script.js", "./extra.js", "./data-extra.js",
  "./final.js", "./links.js", "./rating.js", "./schedule.js", "./journal.js", "./assistant.js",
  "./manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (url.hostname.includes("script.google.com") || url.hostname.includes("api.qrserver.com") || url.hostname.includes("quickchart.io")) return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put("./index.html", copy));
        return res;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && req.method === "GET" && url.origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => hit))
  );
});