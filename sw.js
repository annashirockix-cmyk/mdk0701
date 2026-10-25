const CACHE = "mdk0701-v208"; 

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./animations.css",
  "./lecture-methodical.css",
  "./manifest.json",
  "./data-0701.js",
  "./data-0401.js",
  "./data-0201.js",
  "./data-0202.js",
  "./data-extra.js",
  "./data-global.js",
  "./tests-extra.js",
  "./questions-setup.js",
  "./questions-mdk.js",
  "./questions-anime.js",
  "./questions-games.js",
  "./questions-logic.js",
  "./app.js",
  "./api.js",
  "./assistant.js",
  "./shop.js",
  "./games.js",
  "./extra.js",
  "./exam-engine.js",
  "./exam_0701.js",
  "./exam_0401.js",
  "./exam_0201.js",
  "./exam_0202.js",
  "./final.js",
  "./journal.js",
  "./reports.js",
  "./schedule.js",
  "./rating.js",
  "./links.js",
  "./info.js",
  "./admin.js",
  "./easter-eggs.js",
  "./cursor-snake.html",
  "./carve-pumpkin.html"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((cache) => {
        return cache.addAll(ASSETS).catch((err) => {
          console.warn("[SW] Ошибка кэширования (пропускаем):", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => {
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;

  if (
    url.hostname.includes("script.google.com") ||
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    return;
  }

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      return hit || fetch(req).then((res) => {
        if (res.ok && url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => {
        return new Response("Network error", { status: 408, headers: { "Content-Type": "text/plain" } });
      });
    })
  );
});