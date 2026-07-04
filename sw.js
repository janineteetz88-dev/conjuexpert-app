/* ConjuExpert service worker — basic offline app shell */
const CACHE = "conjuexpert-v88";
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
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const sameOrigin = req.url.startsWith(self.location.origin);
  // Network-first; für eigene Dateien den HTTP-Cache umgehen, damit Edits sofort greifen.
  e.respondWith(
    fetch(sameOrigin ? new Request(req, { cache: "reload" }) : req).then((res) => {
      if (res && res.ok && sameOrigin) {
        const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() =>
      // Netzwerk fehlgeschlagen: aus dem Cache bedienen. ignoreSearch, damit
      // z. B. app.js?v=xyz auf das gecachte ./app.js trifft (verhindert, dass
      // ein Skript-Request fälschlich index.html bekommt → HTML als JS = Blank).
      caches.match(req, { ignoreSearch: true }).then((hit) => {
        if (hit) return hit;
        // Nur echte Seitenaufrufe fallen auf die App-Shell zurück, keine Skripte.
        if (req.mode === "navigate") return caches.match("./index.html");
        return Response.error();
      })
    )
  );
});
