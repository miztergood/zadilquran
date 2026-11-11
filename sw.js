/**
 * SERVICE WORKER ZADIL QURAN (v2 - Multi-Page Modular Architecture)
 * Mendukung instalasi PWA lintas platform (Android, iOS/iPadOS, Windows, Mac) & akses offline
 */

const CACHE_NAME = 'zadil-quran-pwa-v6';

// Aset inti lokal yang wajib tersedia saat offline
const CORE_ASSETS = [
  './',
  './index.html',
  './landingpage.html',
  './pendaftaran.html',
  './login.html',
  './admin.html',
  './ustadz.html',
  './wali.html',
  './config.js',
  './css/style.css',
  './js/tailwind-config.js',
  './js/core.js',
  './js/landing.js',
  './js/login.js',
  './js/admin.js',
  './js/ustadz.js',
  './js/wali.js',
  './manifest.json',
  './logo.jpg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/apple-touch-icon.png'
];

// Aset CDN eksternal (dicache terpisah secara best-effort)
const CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/css/tom-select.css',
  'https://cdn.jsdelivr.net/npm/tom-select@2.2.2/dist/js/tom-select.complete.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Install: Cache aset inti lokal dan aset CDN secara tahan-gagal (fault-tolerant)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Cache setiap aset lokal satu per satu
      await Promise.allSettled(
        CORE_ASSETS.map(async (url) => {
          try {
            const req = new Request(url, { cache: 'reload' });
            const res = await fetch(req);
            if (res && res.ok) {
              await cache.put(url, res);
            }
          } catch (err) {
            console.warn('[SW] Gagal pre-cache aset lokal:', url, err);
          }
        })
      );

      // Cache aset CDN secara best-effort
      await Promise.allSettled(
        CDN_ASSETS.map(async (url) => {
          try {
            const res = await fetch(url, { mode: 'cors' });
            if (res && res.ok) {
              await cache.put(url, res);
            }
          } catch (err) {
            console.warn('[SW] Lewati pre-cache CDN:', url);
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate: Bersihkan cache versi lama & langsung klaim kontrol atas seluruh klien
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Dukung pesan skipWaiting dari aplikasi utama
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: Strategi hibrida
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  // Abaikan skema non-HTTP/HTTPS (seperti chrome-extension://)
  if (!requestUrl.protocol.startsWith('http')) {
    return;
  }

  // 1. Request API (/api maupun Google Apps Script): Network-First agar selalu real-time
  const isApiRequest =
    requestUrl.pathname === '/api' ||
    requestUrl.pathname.startsWith('/api/') ||
    requestUrl.searchParams.has('action') ||
    requestUrl.hostname.includes('script.google.com') ||
    requestUrl.hostname.includes('script.googleusercontent.com');

  if (isApiRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. Navigasi Halaman Utama (HTML Multi-Page): Network-First dengan fallback ke cache halaman terkait
  const isNavigation =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, cloned);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedPage =
            (await caches.match(event.request, { ignoreSearch: true })) ||
            (await caches.match('./index.html')) ||
            (await caches.match('./'));
          return cachedPage;
        })
    );
    return;
  }

  // 3. Aset Statis Lokal & CDN: Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
