// ============================================
// OmnarPRO - Service Worker (Offline Support)
// ============================================

const CACHE_NAME = 'omnarpro-offline-v2';

// Semua file yang harus di-cache
const LOCAL_ASSETS = [
    './',
    './index.html',
    './css/fontawesome.min.css',
    './css/plus-jakarta.css',
    './js/tailwind.min.js',
    './js/jspdf.umd.min.js',
    './js/jspdf-autotable.min.js',
    './webfonts/fa-solid-900.woff2',
    './webfonts/fa-solid-900.ttf',
    './webfonts/fa-regular-400.woff2',
    './webfonts/fa-regular-400.ttf',
    './webfonts/fa-brands-400.woff2',
    './webfonts/fa-brands-400.ttf',
    './fonts/PlusJakartaSans-Light.woff2',
    './fonts/PlusJakartaSans-Regular.woff2',
    './fonts/PlusJakartaSans-Medium.woff2',
    './fonts/PlusJakartaSans-SemiBold.woff2',
    './fonts/PlusJakartaSans-Bold.woff2',
    './fonts/PlusJakartaSans-ExtraBold.woff2',
    './fonts/PlusJakartaSans-Black.woff2'
];

// CDN fallback URLs — di-cache saat pertama kali diakses
const CDN_PATTERNS = [
    'cdn.tailwindcss.com',
    'cdnjs.cloudflare.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net'
];

// ============================================
// INSTALL — Cache semua aset lokal
// ============================================
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching local assets...');
                // Cache file lokal satu per satu agar satu gagal tidak menggagalkan semua
                return Promise.allSettled(
                    LOCAL_ASSETS.map(url =>
                        cache.add(url).catch(err => {
                            console.warn('[SW] Gagal cache:', url, err.message);
                        })
                    )
                );
            })
            .then(() => {
                console.log('[SW] Install selesai, skip waiting');
                return self.skipWaiting();
            })
    );
});

// ============================================
// ACTIVATE — Hapus cache lama
// ============================================
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => {
                        console.log('[SW] Hapus cache lama:', key);
                        return caches.delete(key);
                    })
            );
        }).then(() => {
            console.log('[SW] Aktif, mengambil kontrol');
            return self.clients.claim();
        })
    );
});

// ============================================
// FETCH — Strategi cache
// ============================================
self.addEventListener('fetch', event => {
    // Hanya proses GET request
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Jangan cache chrome-extension, data:, blob:, dll
    if (!url.protocol.startsWith('http')) return;

    // Cek apakah request ke CDN
    const isCDN = CDN_PATTERNS.some(pattern => url.hostname.includes(pattern));

    // Cek apakah request ke server yang sama (aset lokal)
    const isLocal = url.origin === self.location.origin;

    if (isCDN) {
        // CDN: Stale-While-Revalidate
        // Tampilkan dari cache dulu, update di background
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cached => {
                    const fetchPromise = fetch(event.request)
                        .then(response => {
                            if (response && response.status === 200) {
                                cache.put(event.request, response.clone());
                            }
                            return response;
                        })
                        .catch(() => cached);

                    return cached || fetchPromise;
                });
            })
        );
    } else if (isLocal) {
        // Aset lokal: Cache-First (prioritaskan cache)
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) {
                    // Ada di cache, pakai cache
                    // Update cache di background untuk versi baru
                    fetch(event.request).then(response => {
                        if (response && response.status === 200) {
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
                        }
                    }).catch(() => {}); // Abaikan error background update
                    return cached;
                }

                // Tidak di cache, fetch dari network
                return fetch(event.request)
                    .then(response => {
                        if (response && response.status === 200) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                        }
                        return response;
                    })
                    .catch(() => {
                        // Network gagal & tidak di cache
                        // Jika navigasi, tampilkan index.html dari cache
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        // Return response kosong untuk request lain
                        return new Response('', {
                            status: 408,
                            statusText: 'Offline - Resource not cached'
                        });
                    });
            })
        );
    }
    // Request ke domain lain yang bukan CDN: biarkan normal (tidak di-cache)
});

// ============================================
// MESSAGE — Handle pesan dari main app
// ============================================
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('[SW] Cache dibersihkan');
        });
    }
});