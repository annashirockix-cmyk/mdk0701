/* ============================================================
   Service Worker МДК 07.01 — v22
   ============================================================ */
const CACHE = "mdk0701-v22-stable";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./data.js",
  "./data-extra.js",
  "./info.js",
  "./script.js",
  "./extra.js",
  "./final.js",
  "./links.js",
  "./rating.js",
  "./journal.js",
  "./minigames.js",
  "./assistant.js",
  "./easter-eggs.js",
  "./manifest.json"
];

/* ---------------- INSTALL ---------------- */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

/* ---------------- ACTIVATE ---------------- */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ---------------- FETCH ---------------- */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  /* Не трогаем внешние API и аналитику */
  if (
    url.hostname.includes("script.google.com") ||
    url.hostname.includes("api.qrserver.com") ||
    url.hostname.includes("quickchart.io") ||
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    return;
  }

  /* Навигация — network-first, fallback на кэш */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  /* Остальное — cache-first, потом сеть */
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          if (res.ok && req.method === "GET" && url.origin === location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
    })
  );
});