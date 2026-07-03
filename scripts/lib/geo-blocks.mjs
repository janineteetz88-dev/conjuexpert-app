/**
 * geo-blocks.mjs
 *
 * GEO-Bausteine für die Blog-Engine (Generative Engine Optimization):
 *
 *   1. extractKeyTakeaways(blocks, blocksToHtml) → { boxHtml, blocks }
 *      Hebt einen als Zusammenfassung markierten Callout aus dem Body und macht
 *      daraus die „Das Wichtigste in Kürze"-Box (ohne „TL;DR", ohne Emoji).
 *
 *   2. addHeadingIdsAndToc(html, { minToc }) → { html, tocHtml }
 *      Vergibt eindeutige IDs an alle <h2> des Fließtexts und baut daraus ein
 *      automatisches Inhaltsverzeichnis (ab `minToc` Überschriften).
 *
 *   3. convertStrayAsterisks(text) → text
 *      Notion-Rich-Text liefert manchmal einzelne "*"-Zeichen als literalen
 *      plain_text statt als bold/italic-Annotation (z. B. aus eingefügtem
 *      Markdown-Text). Wandelt gepaarte *Wörter* in <em>, entfernt unpaare
 *      Sternchen-Reste.
 *
 * Bewusst ohne Import aus notion-to-html.mjs (kein Zyklus): `blocksToHtml` wird
 * als Funktion übergeben. Reine String-/Block-Operationen, voll unit-testbar.
 */

/* ─── kleine, eigenständige HTML-Escape (nur für TOC-/Box-Text) ──────────── */

function escText(s) {
  return String(s || "").replace(/[<>&"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]
  );
}

/* ─── Sternchen-Reste aus Notion-Rich-Text bereinigen ────────────────────── */

// Läuft auf bereits HTML-escaptem Text (nach esc()), operiert also nur auf "*".
export function convertStrayAsterisks(text) {
  const s = String(text || "");
  if (!s.includes("*")) return s;
  return s.replace(/\*([^*]+)\*/g, "<em>$1</em>").replace(/\*/g, "");
}

/* ─── Überschrift → ID-Slug ──────────────────────────────────────────────── */

export function slugifyHeading(text) {
  const base = String(text || "")
    .replace(/<[^>]+>/g, "")          // Tags entfernen
    .replace(/&[a-z]+;/gi, " ")       // HTML-Entities entschärfen
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")  // Akzente abstreifen (é→e, ü→u …)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return base || "abschnitt";
}

/* ─── 1. „Das Wichtigste in Kürze"-Box ───────────────────────────────────── */

const TAKEAWAY_TRIGGERS = [
  /^das wichtigste in k(?:ü|ue)rze/i,
  /^kurz gesagt/i,
  /^auf einen blick/i,
  /^in k(?:ü|ue)rze/i,
  /^das wichtigste\b/i,
  /^tl;?\s*dr\b/i,
];

// Führende Emojis / Symbole / Doppelpunkte am Zeilenanfang abstreifen.
function stripLeading(s) {
  return String(s || "")
    .replace(/^[\s\p{Extended_Pictographic}←-⇿⌀-➿️‍]+/u, "")
    .trim();
}

function calloutPlain(b) {
  return (b?.callout?.rich_text || []).map((t) => t.plain_text).join("");
}

function matchedTrigger(text) {
  const t = stripLeading(text);
  for (const re of TAKEAWAY_TRIGGERS) if (re.test(t)) return re;
  return null;
}

/**
 * Sucht den ersten Callout, dessen Text mit einem Zusammenfassungs-Trigger
 * beginnt („Das Wichtigste in Kürze", „Kurz gesagt", „Auf einen Blick" …),
 * entfernt ihn aus dem Body und rendert ihn als CI-Box mit fester Überschrift
 * „Das Wichtigste in Kürze" — Emoji/Trigger-Label werden entfernt.
 *
 * @param {Array} blocks       Content-Blöcke (ohne Meta/FAQ)
 * @param {Function} blocksToHtml  Renderer für Kind-Blöcke (Dependency Injection)
 * @returns {{ boxHtml: string, blocks: Array }}
 */
export function extractKeyTakeaways(blocks, blocksToHtml) {
  const list = (blocks || []).slice();
  let idx = -1;
  let trigger = null;
  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    if (b.type !== "callout") continue;
    const re = matchedTrigger(calloutPlain(b));
    if (re) { idx = i; trigger = re; break; }
  }
  if (idx === -1) return { boxHtml: "", blocks: list };

  const b = list[idx];
  const remaining = list.slice(0, idx).concat(list.slice(idx + 1));

  // Body der Box: bevorzugt die eingerückten Kinder (oft Stichpunkte),
  // sonst der Resttext des Callouts nach dem Trigger-Label.
  let body = "";
  if (b._children && b._children.length && typeof blocksToHtml === "function") {
    body = blocksToHtml(b._children);
  } else {
    let rest = stripLeading(calloutPlain(b)).replace(trigger, "").trim();
    rest = rest.replace(/^[\s:–—-]+/, "").trim();
    if (rest) body = `<p>${escText(rest)}</p>`;
  }

  const boxHtml =
    `        <div class="keytakeaways">\n` +
    `          <h2 id="kurz">Das Wichtigste in Kürze</h2>\n` +
    (body ? `          ${body}\n` : "") +
    `        </div>`;

  return { boxHtml, blocks: remaining };
}

/* ─── 2. Heading-IDs + automatisches Inhaltsverzeichnis ──────────────────── */

/**
 * Vergibt jedem <h2> ohne ID einen eindeutigen Slug und baut daraus ein TOC.
 * Das TOC wird nur ab `minToc` Überschriften erzeugt (Default 3).
 *
 * @returns {{ html: string, tocHtml: string }}
 */
export function addHeadingIdsAndToc(html, { minToc = 3 } = {}) {
  const used = new Set();
  const items = [];

  const out = String(html || "").replace(
    /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/g,
    (_m, attrs, inner) => {
      attrs = attrs || "";
      // Tags entfernen + HTML-Entities dekodieren (sonst doppelt-escapt der TOC:
      // z. B. „sein&quot; → „sein&amp;quot;). escText/slugify kodieren danach sauber neu.
      const text = inner
        .replace(/<[^>]+>/g, "")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .trim();
      let id;
      const idm = attrs.match(/\bid="([^"]+)"/);
      if (idm) {
        id = idm[1];
      } else {
        const base = slugifyHeading(text);
        let cand = base;
        let n = 2;
        while (used.has(cand)) cand = `${base}-${n++}`;
        id = cand;
        attrs += ` id="${id}"`;
      }
      used.add(id);
      items.push({ id, text });
      return `<h2${attrs}>${inner}</h2>`;
    }
  );

  let tocHtml = "";
  if (items.length >= minToc) {
    const lis = items
      .map((it) => `            <li><a href="#${it.id}">${escText(it.text)}</a></li>`)
      .join("\n");
    tocHtml =
      `        <nav class="toc" aria-label="Inhaltsverzeichnis">\n` +
      `          <p class="toc-h">Inhalt</p>\n` +
      `          <ol>\n${lis}\n          </ol>\n` +
      `        </nav>`;
  }

  return { html: out, tocHtml };
}
