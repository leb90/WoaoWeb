// Service worker de World of AO.
// Objetivo: que el sitio sea instalable (PWA) y cachear SOLO assets estáticos
// (imágenes, íconos) para que carguen más rápido. Todo lo demás (HTML de las
// páginas, /api/*, /play, datos del juego) va siempre a la red — nunca
// queremos servir de caché una sesión vieja, oro/inventario viejo, etc.

// Subir la versión borra todo lo guardado en los navegadores (activate). La v1 guardaba para siempre los mapas y las
// hojas de gráficos que cambian sin cambiar de nombre: se seguían viendo las mazmorras viejas después de cada deploy.
const CACHE_VERSION = "woaoweb-static-v2";

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

// Lo que lleva versión en la URL (?v=) o hash en el nombre (/_next/static/) no cambia nunca: va directo de la caché.
function isImmutable(url) {
    return url.pathname.startsWith("/_next/static/") || url.searchParams.has("v");
}

// Solo respuestas enteras: las parciales (206, el video pedido por partes) no se pueden guardar.
function canStore(response) {
    return response.status === 200 && response.type === "basic";
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(request);
    if (cached) {
        return cached;
    }
    const response = await fetch(request);
    if (canStore(response)) {
        cache.put(request, response.clone());
    }
    return response;
}

// Los mapas tienen que coincidir con los del server: primero la red y, sin conexión, lo guardado.
async function networkFirst(request) {
    const cache = await caches.open(CACHE_VERSION);
    try {
        const response = await fetch(request);
        if (canStore(response)) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        return (await cache.match(request)) || Response.error();
    }
}

// Las demás imágenes sin versión: lo guardado para que cargue rápido y, por detrás, la de la red para la próxima vez.
async function staleWhileRevalidate(event) {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(event.request);
    const update = fetch(event.request)
        .then((response) => {
            if (canStore(response)) {
                cache.put(event.request, response.clone());
            }
            return response;
        })
        .catch(() => cached || Response.error());
    if (cached) {
        event.waitUntil(update.then(() => undefined));
        return cached;
    }
    return update;
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

    // Nunca cachear API, sockets del juego, ni las páginas del juego en sí. Tampoco los videos: el navegador los pide
    // por partes.
    if (
        url.pathname.startsWith("/api/") ||
        url.pathname.startsWith("/play") ||
        url.pathname.startsWith("/_next/data/") ||
        url.pathname.startsWith("/static/video/")
    ) {
        return;
    }

    if (isStaticAsset(url)) {
        if (url.pathname.startsWith("/static/maps_local/")) {
            event.respondWith(networkFirst(request));
        } else if (isImmutable(url)) {
            event.respondWith(cacheFirst(request));
        } else {
            event.respondWith(staleWhileRevalidate(event));
        }
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => caches.match("/offline.html")),
        );
    }
});
