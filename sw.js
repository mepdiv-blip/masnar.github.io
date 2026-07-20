// =============================================
// ProyekKu Service Worker v3 - PWABuilder Ready
// =============================================

const CACHE_NAME = 'proyekku-v3';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 hari

// File utama yang WAJIB di-cache (app shell)
const APP_SHELL = [
    './',
    './index.html',
    './manifest.json'
];

// File tambahan (di-cache tapi gagal 1 tidak menghentikan install)
const ASSETS_SECONDARY = [
    './css/fontawesome.min.css',
    './css/plus-jakarta.css',
    './js/tailwind.min.js',
    './js/jspdf.umd.min.js',
    './js/jspdf-autotable.min.js',
    './webfonts/fa-solid-900.woff2',
    './webfonts/fa-regular-400.woff2',
    './webfonts/fa-brands-400.woff2',
    './fonts/PlusJakartaSans-Regular.woff2',
    './fonts/PlusJakartaSans-Bold.woff2',
    './fonts/PlusJakartaSans-ExtraBold.woff2',
    './fonts/PlusJakartaSans-Black.woff2',
    './fonts/PlusJakartaSans-Medium.woff2',
    './fonts/PlusJakartaSans-SemiBold.woff2',
    './fonts/PlusJakartaSans-Light.woff2'
];

// Icon yang di-cache saat pertama kali diakses
const ICON_PATHS = [
    './icons/icon-72.png',
    './icons/icon-96.png',
    './icons/icon-128.png',
    './icons/icon-144.png',
    './icons/icon-152.png',
    './icons/icon-192.png',
    './icons/icon-384.png',
    './icons/icon-512.png'
];

// =============================================
// INSTALL — Cache app shell, lalu secondary secara individual
// =============================================
self.addEventListener('install', event => {
    console.log('[SW] Installing v3...');

    event.waitUntil(
        // Step 1: Cache APP_SHELL (wajib berhasil)
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app shell...');
                return cache.addAll(APP_SHELL);
            })
            .then(() => {
                // Step 2: Cache secondary (gagal 1 tidak masalah)
                return caches.open(CACHE_NAME).then(cache => {
                    return Promise.allSettled(
                        ASSETS_SECONDARY.map(url =>
                            cache.match(url).then(cached => {
                                if (!cached) {
                                    return fetch(url).then(response => {
                                        if (response && response.status === 200) {
                                            return cache.put(url, response);
                                        }
                                    }).catch(() => {
                                        console.warn('[SW] Gagal cache:', url);
                                    });
                                }
                            })
                        )
                    );
                });
            })
            .then(() => {
                // Step 3: Cache ikon
                return caches.open(CACHE_NAME).then(cache => {
                    return Promise.allSettled(
                        ICON_PATHS.map(url =>
                            cache.match(url).then(cached => {
                                if (!cached) {
                                    return fetch(url).then(response => {
                                        if (response && response.status === 200) {
                                            return cache.put(url, response);
                                        }
                                    }).catch(() => {
                                        console.warn('[SW] Gagal cache icon:', url);
                                    });
                                }
                            })
                        )
                    );
                });
            })
            .then(() => {
                console.log('[SW] Install selesai');
                return self.skipWaiting();
            })
            .catch(err => {
                console.error('[SW] Install error:', err);
                // Tetap skip waiting meskipun ada error
                self.skipWaiting();
            })
    );
});

// =============================================
// ACTIVATE — Hapus cache lama
// =============================================
self.addEventListener('activate', event => {
    console.log('[SW] Activating v3...');
    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => {
                            console.log('[SW] Menghapus cache lama:', key);
                            return caches.delete(key);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Aktif');
                return self.clients.claim();
            })
    );
});

// =============================================
// FETCH — Strategy: Cache First, Network Fallback
// + Periodic background update
// =============================================
self.addEventListener('fetch', event => {
    // Skip non-GET
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Skip chrome-extension, blob, dll
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) {
                    // Return cache, tapi update di background (stale-while-revalidate)
                    const fetchPromise = fetch(event.request)
                        .then(response => {
                            if (response && response.status === 200) {
                                const clone = response.clone();
                                caches.open(CACHE_NAME).then(cache => {
                                    cache.put(event.request, clone);
                                });
                            }
                            return response;
                        })
                        .catch(() => {
                            // Network gagal, cache sudah di-return
                        });

                    // Return cache dulu, fetch update di background
                    return cached;
                }

                // Tidak ada di cache — fetch dari network
                return fetch(event.request)
                    .then(response => {
                        // Cache response yang berhasil
                        if (response && response.status === 200) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, clone);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Network juga gagal — fallback ke index.html untuk navigasi
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        // Return offline response untuk resource lain
                        return new Response('Offline', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// =============================================
// MESSAGE — Handle update dari app
// =============================================
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