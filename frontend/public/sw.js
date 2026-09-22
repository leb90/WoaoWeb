// Service worker de World of AO.
// Objetivo: que el sitio sea instalable (PWA) y cachear SOLO assets estáticos
// (imágenes, íconos) para que carguen más rápido. Todo lo demás (HTML de las
// páginas, /api/*, /play, datos del juego) va siempre a la red — nunca
// queremos servir de caché una sesión vieja, oro/inventario viejo, etc.

const CACHE_VERSION = "woaoweb-static-v1";

const PRECACHE_URLS = [
    "/favicon.ico",
    "/static/imgs/woaoicon-192.png",
    "/static/imgs/woaoicon-512.png",
    "/offline.html",
];

const STATIC_PATH_PREFIXES = [
    "/static/",
    "/imgs/",
    "/graphics/",
    "/ui/",
    "/fonts/",
    "/_next/static/",
];

const STATIC_FILE_EXTENSIONS = /\.(png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf)$/i;

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_VERSION)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .catch(() => {
                // No pasa nada si algún asset todavía no existe; el resto igual se cachea de a poco.
            }),
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_VERSION)
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

function isStaticAsset(url) {
    if (url.origin !== self.location.origin) {
        return false;
    }

    if (STATIC_FILE_EXTENSIONS.test(url.pathname)) {
        return true;
    }

    return STATIC_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    // Nunca cachear API, sockets del juego, ni las páginas del juego en sí.
    if (
        url.pathname.startsWith("/api/") ||
        url.pathname.startsWith("/play") ||
        url.pathname.startsWith("/_next/data/")
    ) {
        return;
    }

    if (isStaticAsset(url)) {
        event.respondWith(
            caches.open(CACHE_VERSION).then(async (cache) => {
                const cached = await cache.match(request);
                if (cached) {
                    return cached;
                }

                try {
                    const response = await fetch(request);
                    if (response.ok) {
                        cache.put(request, response.clone());
                    }
                    return response;
                } catch (error) {
                    return cached || Response.error();
                }
            }),
        );
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => caches.match("/offline.html")),
        );
    }
});
