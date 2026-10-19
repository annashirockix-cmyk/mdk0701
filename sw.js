/* ============================================================
   Service Worker МДК 07.01 — v171.0
   ============================================================ */
const CACHE = "mdk0701-v171";
const ASSETS = [
  "./", "./index.html", "./style.css",
  "./api.js", "./logic.js", "./ui.js", "./extra.js", 
  "./journal.js", "./rating.js", "./minigames.js", "./data.js",
  "./manifest.json"
];

// Установка и кэширование
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// Очистка старого кэша
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// Обработка запросов
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Пропускаем внешние API и CDN
  if (
    url.hostname.includes("script.google.com") ||
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("cdnjs.cloudflare.com") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com")
  ) {
    return;
  }

  // Навигация: Network First (всегда свежий HTML), Fallback на кэш
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Остальное: Cache First, потом сеть
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res.ok && req.method === "GET" && url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
    })
  );
});

// --- PUSH-УВЕДОМЛЕНИЯ ---

// Прием пуш-уведомления от сервера
self.addEventListener("push", (e) => {
  let data = { title: "МДК 07.01", body: "У вас новое уведомление!" };
  
  if (e.data) {
      try { data = e.data.json(); } catch(err) { data.body = e.data.text(); }
  }

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "img/bg-matrix-code.jpg", // Иконка уведомления
      badge: "img/bg-matrix-code.jpg", // Маленькая иконка для мобильных
      vibrate: [200, 100, 200],
      data: { url: "./index.html#/notifications" }
    })
  );
});

// Клик по уведомлению (открывает вкладку)
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window" }).then(windowClients => {
      // Если вкладка уже открыта, фокусируемся на ней
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