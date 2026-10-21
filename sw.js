/* ============================================================
   Service Worker (Обновленная версия v206)
   ============================================================ */
const CACHE = "mdk0701-v206"; // ВАЖНО: Меняйте эту версию при каждом обновлении файлов!

// Список файлов для кэширования
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

// Установка Service Worker и кэширование файлов
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((cache) => {
        // Добавляем файлы в кэш. Если какого-то файла нет, процесс не прервется.
        return Promise.all(
          ASSETS.map((url) => {
            return cache.add(url).catch((err) => {
              console.warn(`[SW] Не удалось закэшировать файл: ${url}`, err);
            });
          })
        );
      })
      .then(() => self.skipWaiting()) // Активируем новый SW немедленно
  );
});

// Активация и удаление старого кэша
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE) {
            console.log("[SW] Удаление старого кэша:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Применяем изменения к открытым вкладкам
  );
});

// Перехват запросов
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Игнорируем POST-запросы и сторонние ресурсы (шрифты, Google Apps Script)
  if (req.method !== "GET") return;
  if (
    url.hostname.includes("script.google.com") ||
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("fonts.googleapis.com") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.hostname.includes("dicebear.com")
  ) {
    return;
  }

  // Стратегия для навигации (загрузка страниц): Сеть -> Кэш -> Ошибка
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Стратегия для остальных файлов: Кэш -> Сеть (с сохранением в кэш)
  e.respondWith(
    caches.match(req).then((hit) => {
      return hit || fetch(req).then((res) => {
        // Кэшируем только успешные ответы с нашего домена
        if (res.ok && url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
