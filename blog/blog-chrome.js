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
})();
