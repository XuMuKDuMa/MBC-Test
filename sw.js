// Service Worker для МВС отчёты — офлайн-кэш приложения
// Карта (Leaflet, геокодирование) требует интернет и намеренно НЕ кэшируется.

const CACHE_NAME = 'mvs-reports-v1';
const APP_SHELL = [
  './',
  './index.html'
];

// ── Установка: кладём в кэш сам HTML-файл приложения ──
self.addEventListener('install', (event) =>// Service Worker для МВС отчёты — офлайн-кэш приложения
// Карта (Leaflet, геокодирование) требует интернет и намеренно НЕ кэшируется.

const CACHE_NAME = 'mvs-reports-v1';
const APP_SHELL = [
  './',
  './index.html'
];

// ── Установка: кладём в кэш сам HTML-файл приложения ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch(() => {
        // Если './' недоступен (например, APK отдаёт файл под другим путём) —
        // не валим установку, попробуем закэшировать хотя бы текущую страницу при первом fetch.
      });
    })
  );
  self.skipWaiting();
});

// ── Активация: подчищаем старые версии кэша ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Список доменов, которые НЕ кэшируем принципиально (карта, геокодер, IP-сервисы) ──
const NEVER_CACHE_HOSTS = [
  'nominatim.openstreetmap.org',
  'photon.komoot.io',
  'tile.openstreetmap.org',
  'unpkg.com',
  'cdn.jsdelivr.net',
  'ipapi.co',
  'ipwho.is',
  'ipinfo.io',
  'country.is',
  'geojs.io',
  'api.ip.sb',
  'router.project-osrm.org'
];

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Карта и внешние API — всегда напрямую в сеть, без кэша.
  if (NEVER_CACHE_HOSTS.some((h) => url.hostname.includes(h))) {
    return; // не вмешиваемся, браузер сам сходит в сеть (или упадёт, если сети нет — это ок для карты)
  }

  // Сам HTML и прочие локальные ресурсы — "сеть сначала, кэш как запасной вариант".
  event.respondWith(
    fetch(req)
      .then((res) => {
        // Обновляем кэш свежей копией при успешном сетевом ответе.
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      })
      .catch(() => {
        // Сети нет — отдаём то, что есть в кэше.
        return caches.match(req).then((cached) => {
          if (cached) return cached;
          // Если это запрос самой страницы — отдаём главный HTML из кэша как fallback.
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', { status: 504, statusText: 'Offline' });
        });
      })
  );
});

// Тап по уведомлению открывает приложение
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      return self.clients.openWindow('./');
    })
  );
});
 {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL).catch(() => {
        // Если './' недоступен (например, APK отдаёт файл под другим путём) —
        // не валим установку, попробуем закэшировать хотя бы текущую страницу при первом fetch.
      });
    })
  );
  self.skipWaiting();
});

// ── Активация: подчищаем старые версии кэша ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Список доменов, которые НЕ кэшируем принципиально (карта, геокодер, IP-сервисы) ──
const NEVER_CACHE_HOSTS = [
  'nominatim.openstreetmap.org',
  'photon.komoot.io',
  'tile.openstreetmap.org',
  'unpkg.com',
  'cdn.jsdelivr.net',
  'ipapi.co',
  'ipwho.is',
  'ipinfo.io',
  'country.is',
  'router.project-osrm.org'
];

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Карта и внешние API — всегда напрямую в сеть, без кэша.
  if (NEVER_CACHE_HOSTS.some((h) => url.hostname.includes(h))) {
    return; // не вмешиваемся, браузер сам сходит в сеть (или упадёт, если сети нет — это ок для карты)
  }

  // Сам HTML и прочие локальные ресурсы — "сеть сначала, кэш как запасной вариант".
  event.respondWith(
    fetch(req)
      .then((res) => {
        // Обновляем кэш свежей копией при успешном сетевом ответе.
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      })
      .catch(() => {
        // Сети нет — отдаём то, что есть в кэше.
        return caches.match(req).then((cached) => {
          if (cached) return cached;
          // Если это запрос самой страницы — отдаём главный HTML из кэша как fallback.
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', { status: 504, statusText: 'Offline' });
        });
      })
  );
});
