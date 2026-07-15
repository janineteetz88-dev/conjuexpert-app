/* ConjuExpert service worker — app shell, cache-first (stale-while-revalidate) */
const CACHE = "conjuexpert-v124";
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

  // Seitenaufrufe: App-Shell (index.html) sofort aus dem Cache, im Hintergrund frisch holen.
  if (req.mode === "navigate") {
    e.respondWith(
      caches.match("./index.html").then((cached) => {
        const net = fetch(req).then((res) => {
          if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./index.html", copy)); }
          return res;
        }).catch(() => null);
        return cached || net.then((r) => r || caches.match("./index.html"));
      })
    );
    return;
  }

  // Übrige eigene GETs (app.js, engine/*, Icons …): stale-while-revalidate.
  // ignoreSearch, damit app.js?v=xyz auf das gecachte ./app.js trifft.
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
