/* ============================================================
   МДК 07.01 — Service Worker (v181.0 — STABLE)
   ============================================================ */
const CACHE = "mdk0701-v181";

// Список всех локальных файлов, которые нужны для работы сайта офлайн
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./data.js",
  "./data-extra.js",
  "./info.js",
  "./api.js",
  "./logic.js",
  "./ui.js",
  "./extra.js",
  "./journal.js",
  "./rating.js",
  "./minigames.js",
  "./final.js",
  "./links.js",
  "./assistant.js",
  "./easter-eggs.js"
];

/* ---------------- INSTALL (Установка) ---------------- */
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((cache) => {
        console.log("[SW] Кэширование ресурсов...");
        return cache.addAll(ASSETS).catch((err) => {
          console.warn("[SW] Ошибка кэширования некоторых файлов:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

/* ---------------- ACTIVATE (Активация и очистка) ---------------- */
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => {
          console.log("[SW] Удаление старого кэша:", key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

/* ---------------- FETCH (Обработка запросов) ---------------- */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // 1. Пропускаем все запросы, которые не являются GET (например, POST к Google Scripts)
  if (req.method !== "GET") return;

  // 2. Пропускаем внешние API и CDN (Google Scripts, Chart.js, Three.js, Шрифты и т.д.)
  // Они должны всегда загружаться из сети, минуя кэш SW.
  if (
    url.hostname.includes("script.google.com") ||
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("cdnjs.cloudflare.com") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.hostname.includes("api.qrserver.com")
  ) {
    return;
  }

  // 3. Навигация (загрузка самого HTML-документа) — Network First
  // Пытаемся скачать свежий index.html. Если интернета нет — берем из кэша.
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

  // 4. Остальные локальные файлы (JS, CSS, картинки) — Cache First
  // Сначала ищем в кэше. Если нет — качаем из сети и сохраняем.
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      
      return fetch(req).then((res) => {
        // Кэшируем только успешные ответы на GET-запросы с нашего же домена
        if (res.ok && url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => {
        // Если сети нет и файла нет в кэше — возвращаем заглушку (опционально)
        return hit;
      });
    })
  );
});

/* ---------------- PUSH-УВЕДОМЛЕНИЯ ---------------- */
self.addEventListener("push", (e) => {
  let data = { title: "МДК 07.01", body: "У вас новое уведомление!" };
  
  if (e.data) {
      try { data = e.data.json(); } catch(err) { data.body = e.data.text(); }
  }

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "img/bg-matrix-code.jpg",
      badge: "img/bg-matrix-code.jpg",
      vibrate: [200, 100, 200],
      data: { url: "./index.html#/notifications" }
    })
  );
});

/* ---------------- КЛИК ПО УВЕДОМЛЕНИЮ ---------------- */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      // Если вкладка с сайтом уже открыта — переключаемся на неё
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url.includes(location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Иначе открываем новую
      if (clients.openWindow) {
        return clients.openWindow(e.notification.data.url || "./index.html");
      }
    })
  );
});