/*
 * Geteiltes Verhalten für Header/Footer aller Blog-Seiten:
 *  - Brand-Mark-Punkte rendern (idempotent: nur falls noch leer)
 *  - Sprachumschalter (DE/EN) inkl. Persistenz in localStorage
 *
 * Bewusst idempotent gehalten, damit es gefahrlos zusätzlich zu evtl. noch
 * vorhandenem Inline-JS einzelner Seiten laufen kann (keine doppelten Punkte,
 * mehrfaches Binden/Setzen ist wirkungsgleich).
 */
(function () {
  document.documentElement.classList.add("js");

  // Brand-Mark-Punkte – nur befüllen, wenn noch keine vorhanden sind
  var BR = ["#ff3b5c", "#ff7a18", "#ffc400", "#34c759", "#0a84ff"];
  document.querySelectorAll("[data-mark]").forEach(function (m) {
    if (m.children.length) return;
    for (var i = 0; i < 5; i++) {
      var s = document.createElement("i");
      s.style.background = BR[i];
      m.appendChild(s);
    }
  });

  // Sprachumschalter (UI-Sprache, persistiert)
  function setLang(l) {
    document.documentElement.setAttribute("data-lang", l);
    document.documentElement.setAttribute("lang", l);
    document.querySelectorAll(".langsw button").forEach(function (b) {
      var on = b.dataset.set === l;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try { localStorage.setItem("ce-blog-lang", l); } catch (e) {}
  }

  document.querySelectorAll(".langsw button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.dataset.set); });
  });

  try {
    var sv = localStorage.getItem("ce-blog-lang");
    if (sv) setLang(sv);
  } catch (e) {}

  // Läuft die Seite im Fenster der installierten App (PWA „standalone")?
  // Dann gehört der Blog in den richtigen Browser: Klicks auf Blog-Links
  // öffnen dort, und ein sichtbarer Knopf holt auch die aktuelle Seite raus.
  var standalone = false;
  try {
    standalone =
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true;
  } catch (e) {}
  if (standalone) {
    document.addEventListener(
      "click",
      function (ev) {
        var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
        if (!a) return;
        var url;
        try { url = new URL(a.href, location.href); } catch (e) { return; }
        if (url.origin !== location.origin) return; // externe Links: Standardverhalten
        if (url.pathname.indexOf("/blog") !== 0) return; // App-Links bleiben im App-Fenster
        if (url.pathname === location.pathname && url.hash) return; // TOC-Anker bleiben
        ev.preventDefault();
        window.open(url.href, "_blank", "noopener");
      },
      true
    );

    var escBtn = document.createElement("button");
    escBtn.type = "button";
    var escLang = document.documentElement.getAttribute("data-lang") || document.documentElement.lang || "de";
    escBtn.textContent = escLang === "en" ? "Open in browser ↗" : "Im Browser öffnen ↗";
    escBtn.setAttribute("style",
      "position:fixed;right:18px;bottom:18px;z-index:9999;" +
      "font:700 12px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.04em;" +
      "color:#23262f;background:#fff;border:1px solid #d9dbe3;border-radius:999px;" +
      "padding:10px 16px;box-shadow:0 8px 24px -12px rgba(20,22,30,.45);cursor:pointer");
    escBtn.addEventListener("click", function () {
      window.open(location.href, "_blank", "noopener");
    });
    if (document.body) document.body.appendChild(escBtn);
  }
})();
