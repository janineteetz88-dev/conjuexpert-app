/**
 * ai-lektorat.mjs — KI-Lektorat als Veröffentlichungs-Schranke
 *
 * Hintergrund (Janine): „Es dürfen auf gar keinen Fall falsche Dinge im
 * Blogartikel stehen." Der Standard-Linter fängt Struktur-/Stilfehler
 * maschinell — aber keine inhaltlichen Fehler wie eine falsch erklärte
 * Ausspracheregel oder einen falschen französischen Beispielsatz. Dafür
 * liest hier ein LLM jeden NEUEN Artikel einmal komplett gegen, bevor er
 * live geht:
 *
 *   - fremdsprachige Beispielsätze & Verbformen (FR/ES/EN/NL): Konjugation,
 *     Accents, Angleichung, Wortstellung
 *   - fachliche Grammatik-Aussagen (stimmen die behaupteten Regeln?)
 *   - grobe Deutschfehler im Fließtext
 *
 * Meldet das Lektorat einen SICHEREN Fehler, wird der Artikel NICHT
 * veröffentlicht (er bleibt „Freigegeben" im Tracker und die Fehler stehen
 * im CI-Log → in Notion korrigieren, nächster Lauf nimmt ihn wieder mit).
 *
 * Transport: OPENAI_API_KEY (CI-Secret, wie generate-verb-pages) mit
 * Fallback auf den ConjuExpert-Worker. Schlägt der Aufruf selbst fehl,
 * wird der Artikel ebenfalls zurückgehalten (lieber einen Lauf später
 * veröffentlichen als ungeprüft) — abschaltbar mit AI_LEKTORAT=0.
 */

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const WORKER = "https://bitter-bird-3204.janine-teetz88.workers.dev";

async function aiDirect(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({
          model: "gpt-4.1",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1200,
          temperature: 0,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message || `HTTP ${res.status}`);
      return d.choices?.[0]?.message?.content || "";
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

async function aiWorker(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(WORKER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || `HTTP ${res.status}`);
      return d.text || "";
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
}

const ai = (prompt) => (OPENAI_KEY ? aiDirect(prompt) : aiWorker(prompt));

/* Artikel-HTML → Lektorats-Text. WICHTIG: Tabellen strukturiert erhalten
   (Zellen mit " | ", Zeilen mit Umbruch) — plattes Tag-Strippen machte aus
   Konjugationstabellen Textbrei ("je parlerais finirais vendrais tu …"),
   worauf das Lektorat „fehlende Pronomen" halluzinierte. */
export function htmlForLektorat(html) {
  let s = String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  s = (s.match(/<article[\s\S]*?<\/article>/i) || [s])[0];
  return s
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/(?:td|th)>\s*<(?:td|th)[^>]*>/gi, " | ")
    .replace(/<\/?(?:p|div|h[1-6]|li|details|summary|section|blockquote)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;|&rsquo;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n");
}

function parseJson(txt) {
  let s = String(txt || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return JSON.parse(s);
}

/**
 * Prüft den sichtbaren Artikeltext. Rückgabe:
 *   { ok: true }                          — keine sicheren Fehler
 *   { ok: false, errors: [{zitat, korrektur, grund}] }
 * Wirft bei API-/Parse-Fehlern (Aufrufer entscheidet, wie streng).
 */
export async function aiLektorat(text, { title = "" } = {}) {
  const body = String(text || "").slice(0, 16000);
  const prompt = `Du bist ein extrem genauer Lektor für eine Sprachlern-App (Deutsch als Artikelsprache; Beispiele in Französisch, Spanisch, Englisch oder Niederländisch). Prüfe den folgenden Blog-Artikel${title ? ` („${title}")` : ""} auf ECHTE Fehler:
1. Fremdsprachige Beispielsätze und Verbformen: Konjugation, Accents, Elision, Angleichung, Wortstellung.
2. Fachliche Grammatik-Aussagen: Ist jede behauptete Regel korrekt (keine falschen oder falsch herum erklärten Regeln, keine irreführenden Übergeneralisierungen)?
3. Deutscher Fließtext: klare Grammatik-/Rechtschreibfehler.
Melde AUSSCHLIESSLICH Fehler, bei denen du dir sicher bist — KEINE Stilfragen, KEINE Geschmacksurteile, KEINE Vorschläge. Wichtig: Wenn bei einer Zeitform-/Modus-Wahl MEHRERE Varianten vertretbar sind (z. B. imparfait vs. passé composé bei Zustandsverben wie avoir/être/vouloir/pouvoir, Perfekt vs. Präteritum im Deutschen), ist das KEIN Fehler — melde eine Form nur, wenn sie eindeutig falsch ist und jede Lehrkraft sie anstreichen würde. Prüfe vor jeder Meldung: „Könnte ein Muttersprachler das genau so sagen?" Wenn ja, NICHT melden. Der Text ist aus HTML extrahiert: Tabellen stehen zeilenweise mit " | " zwischen den Zellen (erste Zelle ist oft das Pronomen, die weiteren die Formen je Verb) — bewerte Tabellen anhand dieser Struktur und melde NIEMALS Layout-/Extraktionsartefakte (z. B. „fehlendes Pronomen", das in Wahrheit in einer eigenen Spalte steht). Wenn es keine sicheren Fehler gibt, melde eine leere Liste.
Antworte mit NUR minifiziertem JSON, nichts anderem: {"errors":[{"zitat":"<wörtliches Zitat aus dem Text>","korrektur":"<so wäre es richtig>","grund":"<1 Satz>"}]}

ARTIKELTEXT:
${body}`;
  const raw = await ai(prompt);
  const j = parseJson(raw);
  const errors = Array.isArray(j.errors)
    ? j.errors.filter((e) => e && e.zitat && e.korrektur).slice(0, 20)
    : [];
  return errors.length ? { ok: false, errors } : { ok: true };
}
