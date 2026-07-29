/**
 * text-polish.mjs — deterministische Typografie-Reparatur fürs gerenderte HTML
 *
 * Häufigstes Muster im Bestand: deutsch geöffnetes „ wird mit einem geraden
 * ASCII-Zeichen (" bzw. &quot;) geschlossen statt mit “. Das kam aus den
 * Notion-Entwürfen und stand in fast jedem Live-Artikel. Der Publish-Pfad
 * normalisiert das jetzt IMMER nach dem Rendern; der Standard-Linter
 * (MIXED_QUOTES) bleibt als Schranke dahinter.
 *
 * Arbeitet nur AUSSERHALB von <script>/<style> (JSON-LD nie anfassen) und
 * behandelt Tags als transparent, damit auch Paare wie „<em>mot</em>"
 * gefunden werden. Attribut-Anführungszeichen sind sicher: Tags werden als
 * ganze Einheit übersprungen, das schließende Zeichen muss im Text stehen.
 */

export function normalizeGermanQuotesHtml(html) {
  return String(html || "")
    .split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/g)
    .map((chunk) => {
      if (/^<(script|style)/i.test(chunk)) return chunk;
      return chunk
        .replace(/„((?:[^„“"<]|<[^>]+>){1,400}?)"/g, "„$1“")
        .replace(/„((?:[^„“<]|<[^>]+>){1,400}?)&quot;/g, "„$1“");
    })
    .join("");
}
