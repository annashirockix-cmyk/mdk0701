/* ============================================================
   Service Worker (обновленная версия)
   ============================================================ */
const CACHE = "mdk0701-v205"; // Обновили версию, чтобы старый кэш удалился

// Список ТОЛЬКО тех файлов, которые реально есть в вашем репозитории
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./data.js",
  "./app.js",
  "./programs.js",
  "./exam.js",
  "./extra.js",
  "./info.js",
  "./links.js",
  "./rating.js",
  "./journal.js",
  "./schedule.js",
  "./minigames.js",
  "./api.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((cache) => {
        return cache.addAll(ASSETS).catch((err) => {
          console.warn("[SW] Ошибка кэширования:", err);
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
      });
    })
  );
});