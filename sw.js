/* ConjuExpert service worker — basic offline app shell */
const CACHE = "conjuexpert-v11";
const ASSETS = [
  "./index.html", "./app.js", "./manifest.webmanifest",
  "./icon-192.png", "./icon-512.png", "./icon-maskable.png",
  "./engine/conj-en.js", "./engine/conj-es.js", "./engine/conj-de.js",
  "./engine/conj-nl.js", "./engine/conj-fr.js", "./engine/translations.js",
  "./engine/ui.js", "./engine/grammar.js"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const sameOrigin = req.url.startsWith(self.location.origin);
  // Network-first; for our own files bypass the HTTP cache so edits show immediately.
  e.respondWith(
    fetch(sameOrigin ? new Request(req, { cache: "reload" }) : req).then((res) => {
      if (res && res.ok && sameOrigin) {
        const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
  );
});
