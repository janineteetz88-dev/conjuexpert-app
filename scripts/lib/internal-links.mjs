/**
 * internal-links.mjs
 *
 * Leitplanke gegen tote interne Blog-Links („live:true vor Deploy"-Muster):
 * Autoren verlinken in Notion auf Artikel, die im Tracker schon als live
 * markiert, aber noch nie gerendert/deployt wurden — der Link geht dann für
 * echte Leser ins 404 (3× beobachtet, zuletzt 28.08.2026: conditionals-englisch,
 * phrasal-verbs-englisch).
 *
 * Wahrheitsquelle ist deshalb NICHT der Tracker, sondern was wirklich existiert:
 * die Verzeichnisse unter blog/ plus die Slugs, die im selben Lauf geschrieben
 * werden. Links auf alles andere werden entlinkt (der Text bleibt stehen) —
 * lieber ein Wort ohne Link als ein Klick ins Leere. Erscheint der Zielartikel
 * später, setzt ihn der nächste Re-Render des verweisenden Artikels wieder.
 */

const INTERNAL_BLOG_LINK_RE =
  /<a\b[^>]*href="(?:https?:\/\/conjuexpert\.app)?\/blog\/([a-z0-9-]+)\/?(?:[?#][^"]*)?"[^>]*>([\s\S]*?)<\/a>/g;

/**
 * @param {string} html gerenderter Artikel
 * @param {{ knownSlugs: Set<string> }} opts existierende + im selben Lauf
 *        geschriebene Blog-Slugs (Verzeichnisnamen unter blog/)
 * @returns {{ html: string, removed: string[] }} bereinigtes HTML + entlinkte Ziele
 */
export function unlinkMissingBlogLinks(html, { knownSlugs }) {
  const removed = [];
  const out = String(html || "").replace(
    INTERNAL_BLOG_LINK_RE,
    (full, slug, text) => {
      if (knownSlugs.has(slug)) return full;
      removed.push(slug);
      return text;
    },
  );
  return { html: out, removed };
}
