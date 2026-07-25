/* Shared "back to the app" banner for ConjuExpert standalone pages
   (legal pages, blog, reviews, …). Shows a sticky top bar ONLY when the page
   was opened from within the app (?from=app). Tapping it closes this tab —
   returning to the still-open app/quiz tab — with a hard fallback to the app.
   Organic visitors (e.g. from Google) never see it. */
(function () {
  try {
    var qs = new URLSearchParams(location.search || "");
    if (qs.get("from") !== "app") return;
    var lang = String(qs.get("lang") || document.documentElement.lang || "de")
      .slice(0, 2).toLowerCase();
    var LABEL = {
      de: "Zurück zur App",
      en: "Back to the app",
      es: "Volver a la app",
      fr: "Retour à l'app",
      nl: "Terug naar de app"
    };
    function mount() {
      if (document.getElementById("cx-back-to-app")) return;
      var bar = document.createElement("div");
      bar.id = "cx-back-to-app";
      bar.setAttribute(
        "style",
        "position:sticky;top:0;z-index:2147483647;background:#14151a;padding:12px 16px;" +
        "text-align:center;box-shadow:0 2px 10px rgba(0,0,0,.18)"
      );
      var a = document.createElement("a");
      a.href = "#";
      a.setAttribute(
        "style",
        "color:#fff;text-decoration:none;font:600 14.5px/1.2 -apple-system,BlinkMacSystemFont," +
        "'Segoe UI',Helvetica,Arial,sans-serif;display:inline-flex;align-items:center;gap:7px"
      );
      a.textContent = "← " + (LABEL[lang] || LABEL.de);
      a.addEventListener("click", function (e) {
        e.preventDefault();
        window.close(); // schließt den (aus der App geöffneten) Tab → zurück zum Quiz
        setTimeout(function () { location.href = "https://conjuexpert.app/"; }, 150);
      });
      bar.appendChild(a);
      var body = document.body || document.documentElement;
      body.insertBefore(bar, body.firstChild);
    }
    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount);
  } catch (e) {}
})();
