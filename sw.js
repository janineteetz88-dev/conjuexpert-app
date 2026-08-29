/* ConjuExpert service worker — app shell, cache-first (stale-while-revalidate) */
const CACHE = "conjuexpert-v261";
const ASSETS = [
  "./index.html", "./app.js", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./icon-maskable.png",
  "./engine/conj-en.js", "./engine/conj-es.js", "./engine/conj-de.js",
  "./engine/conj-nl.js", "./engine/conj-fr.js", "./engine/translations.js",
  "./engine/ui.js", "./engine/grammar.js"
];
self.addEventListener("install", (e) => {
  // Assets einzeln cachen: schlägt eine Datei fehl, bleibt der Rest erhalten
  // (sonst würde ein einziger 404 den ganzen Precache verwerfen → Blank Screen).
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(ASSETS.map((a) => c.add(a).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
/* Cache-first mit Hintergrund-Aktualisierung (stale-while-revalidate):
   Der Homescreen-Start wird SOFORT aus dem Cache bedient — kein Warten aufs
   Netz mehr (das war die schwarze Lücke beim Kaltstart). Im Hintergrund wird
   die Datei neu geladen und für den nächsten Start aktualisiert. */
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Fremde Hosts (Supabase, KI, Fonts …) normal ans Netz — nicht abfangen.
  if (!req.url.startsWith(self.location.origin)) return;

  // Seitenaufrufe. WICHTIG: Nur die App selbst (Root) wird aus dem App-Shell-Cache
  // bedient (sofortiger Start, kein Schwarzbild). Eigenständige Seiten — /blog,
  // /landing, /konjugation/… (SEO-Verbseiten!), *.html — kommen FRISCH aus dem Netz;
  // sonst würde die App-Shell sie überdecken (Blog/Landing/Verbseiten zeigten die App).
  if (req.mode === "navigate") {
    const path = new URL(req.url).pathname;
    const isAppRoot = path === "/" || path === "/index.html";
    if (isAppRoot) {
      // NETWORK-FIRST für die App-Shell: Neue Deploys kommen sofort beim nächsten
      // Laden an. Nur wenn das Netz nicht antwortet, wird die gecachte index.html
      // gezeigt (Offline-Fallback) — index.html ist winzig, also kein Schwarzbild.
      e.respondWith(
        fetch(req).then((res) => {
          if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./index.html", copy)); }
          return res;
        }).catch(() => caches.match("./index.html"))
      );
    } else {
      // Netzwerk zuerst; nur offline auf Cache (bzw. App-Shell) zurückfallen.
      e.respondWith(
        fetch(req).then((res) => {
          if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
          return res;
        }).catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
      );
    }
    return;
  }

  // app.js ist versioniert (app.js?v=NNN). EXAKT nach ?v cachen (kein ignoreSearch):
  // Eine neue Version ist damit ein Cache-Miss → wird frisch geladen und danach
  // schnell aus dem Cache bedient. So kommt jeder Deploy beim nächsten Laden an,
  // ohne den Start zu verlangsamen. Offline: irgendeine gecachte app.js als Fallback.
  if (new URL(req.url).pathname === "/app.js") {
    e.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match("/app.js", { ignoreSearch: true })))
    );
    return;
  }

  // Übrige eigene GETs (engine/*, Icons …): stale-while-revalidate.
  // ignoreSearch, damit z. B. engine/*.js unabhängig von Query-Strings trifft.
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const net = fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => null);
      return cached || net.then((r) => r || Response.error());
    })
  );
});
