// Feliglot service worker: makes the app installable and keeps lessons you've
// already opened working offline. Pages are network-first (always fresh when
// online); build files, fonts and icons are cache-first; course phrases are
// served from the cache and refreshed in the background.
const VERSION = "v1";
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const OFFLINE = "/offline";
const MAX_PAGES = 80;
// Each release adds newly named build files; the oldest saved files go first.
const MAX_ASSETS = 250;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.add(OFFLINE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== PAGES && k !== ASSETS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function savePage(url) {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/html")) return;
  const c = await caches.open(PAGES);
  await c.put(url, res);
  await trim(c, MAX_PAGES);
}

// Pages opened with in-app links arrive as data, not as a page load, so the
// app tells the worker which page it is on and the worker saves that page.
self.addEventListener("message", (event) => {
  const msg = event.data;
  if (!msg || msg.type !== "save-page" || typeof msg.path !== "string") return;
  const url = new URL(msg.path, self.location.origin);
  if (url.origin !== self.location.origin) return;
  event.waitUntil(savePage(url.href).catch(() => {}));
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname === "/sw.js") return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(req, copy).then(() => trim(c, MAX_PAGES)));
          }
          return res;
        })
        .catch(
          async () =>
            (await caches.match(req, { ignoreVary: true })) ||
            (await caches.match(url.pathname, { ignoreVary: true, ignoreSearch: true })) ||
            (await caches.match(OFFLINE)) ||
            Response.error(),
        ),
    );
    return;
  }

  // Course phrases can be corrected later: serve the saved copy instantly, and
  // refresh it in the background for next time.
  if (url.pathname.startsWith("/content/")) {
    event.respondWith(
      caches.open(ASSETS).then(async (c) => {
        const hit = await c.match(req);
        const refresh = fetch(req)
          .then((res) => {
            if (res.ok) c.put(req, res.clone()).then(() => trim(c, MAX_ASSETS));
            return res;
          })
          .catch(() => hit);
        if (hit) {
          event.waitUntil(refresh);
          return hit;
        }
        return refresh;
      }),
    );
    return;
  }

  // Build files have unique names, so a saved copy never goes stale.
  const immutable = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/") || /\.(woff2?)$/.test(url.pathname);
  if (!immutable) return;
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(ASSETS).then((c) => c.put(req, copy).then(() => trim(c, MAX_ASSETS)));
          }
          return res;
        }),
    ),
  );
});
