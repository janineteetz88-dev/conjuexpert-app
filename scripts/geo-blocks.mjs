/**
 * geo-blocks.mjs — GEO/AI-Citation-Bausteine für die SEO-Verb-Seiten.
 *
 * Alles hier ist DETERMINISTISCH (keine KI, kein Netzwerk): Die Blöcke werden
 * ausschließlich aus den Engine-Formen + Metadaten abgeleitet. Dadurch teilen
 * sich Generator (neue Seiten) und Refresh (bestehende Seiten) exakt denselben
 * Code — identische Ausgabe, keine Divergenz.
 *
 * Bausteine:
 *   • TL;DR   — zitierfähige Kurzantwort ganz oben (für LLM-Antworten/Snippets)
 *   • FAQ     — sichtbare Fragen + FAQPage-Schema (Rich Results / GEO)
 *   • Related — interne Links zu verwandten Verben derselben Sprache
 *   • speakable-Selektor + geoCss (in beiden Stylesheets nutzbar)
 */

import fs from 'fs';
import path from 'path';
import { runInNewContext } from 'vm';

// ── Engine-Loader (identisch zur Generator-Logik) ────────────────────────────
export function loadEngine(ROOT, lang) {
  const src = fs.readFileSync(path.join(ROOT, `engine/conj-${lang}.js`), 'utf8');
  const ctx = { window: { CONJ: {} } };
  runInNewContext(src, ctx);
  return ctx.window.CONJ[lang];
}

// Reflexive ES-Verben: Basisverb konjugieren, Proklitik-Pronomen voranstellen.
const REFL_PRON = ['me', 'te', 'se', 'nos', 'os', 'se'];
function isReflexiveEs(lang, verb) { return lang === 'es' && /(a|e|i)rse$/.test(verb); }
export function conjugateVerb(eng, lang, verb) {
  if (!isReflexiveEs(lang, verb)) return eng.conjugate(verb);
  const c = eng.conjugate(verb.slice(0, -2));
  if (!c || c.error) return c;
  const pre = (arr) => (arr ? arr.map((f, i) => (f ? `${REFL_PRON[i]} ${f}` : f)) : arr);
  const tenses = (c.tenses || [])
    .filter((t) => t.id !== 'imperative')
    .map((t) => ({ ...t, forms: pre(t.forms), reg: pre(t.reg) }));
  return { ...c, tenses };
}

// ── Formen aus der Konjugation ziehen (3. Person Singular = Index 2) ──────────
export function extractForms(conjugated, pronouns) {
  const tenses = conjugated.tenses || [];
  const byId = {};
  tenses.forEach((t) => { byId[t.id] = t; });
  const pron3 = (pronouns && pronouns[2]) || 'er/sie/es';
  const f3 = (id) => {
    const f = byId[id]?.forms?.[2];
    return f && f !== '—' ? f : null;
  };
  return {
    pron3,
    present3: f3('present'),
    past3: f3('past'),
    perfect3: f3('perfect'),
    pastLabel: byId['past']?.label || 'Vergangenheit',
    perfectLabel: byId['perfect']?.label || 'Perfekt',
  };
}

// Hilfsverb nur für DE/NL zuverlässig aus der Perfekt-Form ableiten.
// (ES=haber, FR=avoir/être, EN=have — dort stellen wir keine Hilfsverb-Frage.)
export function auxWordFor(lang, perfect3) {
  if (!perfect3) return null;
  const first = perfect3.split(' ')[0];
  if (lang === 'de') return first === 'ist' ? 'sein' : first === 'hat' ? 'haben' : null;
  if (lang === 'nl') return first === 'is' ? 'zijn' : first === 'heeft' ? 'hebben' : null;
  return null;
}

export function verbTypeDe(isIrr) { return isIrr ? 'unregelmäßiges' : 'regelmäßiges'; }

// ── FAQ (Fragen + Antworten, rein aus verlässlichen Formen) ──────────────────
export function buildFaq({ lang, verb, meaning, verbType, langAdj, meaningIsEnglish = false, forms, auxWord }) {
  const { pron3, present3, past3, perfect3, pastLabel, perfectLabel } = forms;
  const faq = [];
  faq.push({
    q: `Ist „${verb}" ein regelmäßiges oder unregelmäßiges Verb?`,
    a: `„${verb}" ist ein ${verbType} ${langAdj} Verb${meaning ? ` und bedeutet${meaningIsEnglish ? ' auf Englisch' : ''} „${meaning}"` : ''}.`,
  });
  if (present3) faq.push({
    q: `Wie wird „${verb}" in der 3. Person Singular konjugiert?`,
    a: `Im Präsens: ${pron3} ${present3}.`,
  });
  if (past3 || perfect3) faq.push({
    q: `Wie lautet die Vergangenheitsform von „${verb}"?`,
    a: [
      past3 ? `${pastLabel}: ${pron3} ${past3}.` : '',
      perfect3 ? `${perfectLabel}: ${pron3} ${perfect3}.` : '',
    ].filter(Boolean).join(' '),
  });
  if (auxWord && perfect3) faq.push({
    q: lang === 'nl'
      ? `Wird „${verb}" mit „hebben" oder „zijn" gebildet?`
      : `Wird „${verb}" mit „haben" oder „sein" gebildet?`,
    a: `Das Perfekt von „${verb}" wird mit „${auxWord}" gebildet: ${pron3} ${perfect3}.`,
  });
  faq.push({
    q: `Wo kann ich „${verb}" üben?`,
    a: `Du kannst „${verb}" kostenlos im ConjuExpert-Quiz üben — mit allen Zeitformen, in fünf Sprachen, ohne Anmeldung.`,
  });
  return faq;
}

// ── HTML-Bausteine ───────────────────────────────────────────────────────────
// Der Kurzfassungs-Block MUSS immer auf conjuexpert.app verweisen: Wird der Block
// zitiert (Snippet / LLM-Antwort), wird die Quelle mitzitiert. Der Hinweis steht
// unbedingt drin — auch wenn einzelne Formen fehlen.
const SITE_URL = 'https://conjuexpert.app';
export function tldrHtml({ lang, verb, verbType, langAdj, meaning, meaningIsEnglish = false, forms, site = SITE_URL }) {
  const { pron3, present3, past3, perfect3, pastLabel, perfectLabel } = forms;
  const link = `${site}/?lang=${lang}&verb=${encodeURIComponent(verb)}&utm_source=seo&utm_medium=summary`;
  const parts = [
    `„${verb}" ist ein ${verbType} ${langAdj} Verb${meaning ? ` (Bedeutung${meaningIsEnglish ? ' auf Englisch' : ''}: „${meaning}")` : ''}.`,
    present3 ? `Präsens: <strong>${pron3} ${present3}</strong>.` : '',
    past3 ? `${pastLabel}: <strong>${pron3} ${past3}</strong>.` : '',
    perfect3 ? `${perfectLabel}: <strong>${pron3} ${perfect3}</strong>.` : '',
    `Alle Formen von „${verb}" online konjugieren und üben auf <a href="${link}">conjuexpert.app</a>.`,
  ].filter(Boolean);
  return `<p class="verb-summary" id="kurzfassung">${parts.join(' ')}</p>`;
}

export function faqSectionHtml(verb, faq) {
  return `
  <section class="faq-section">
    <h2>Häufige Fragen zu „${verb}"</h2>
    ${faq.map((f) => `<details class="faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`).join('\n    ')}
  </section>`;
}

export function faqLd(faq) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  });
}

export function relatedSectionHtml({ lang, verb, langName, related, site }) {
  if (!related || !related.length) return '';
  const chips = related
    .map((v) => `<a class="related-chip" href="${site}/konjugation/${lang}/${v}/"><span class="rc-verb">${v}</span><span class="rc-hint">konjugieren</span></a>`)
    .join('\n      ');
  return `
  <section class="related-section">
    <h2>Verwandte Verben auf ${langName}</h2>
    <div class="related-grid">
      ${chips}
    </div>
  </section>`;
}

// Verwandte Verben derselben Sprache aus bereits generierten Seiten wählen.
// Deterministisch: alphabetisch sortiert, ein stabiles Fenster (Wrap-around),
// abgeleitet aus dem Verb — variiert statt immer dieselben zu zeigen.
export function pickRelated(ROOT, lang, verb, count = 8) {
  const dir = path.join(ROOT, 'konjugation', lang);
  let verbs = [];
  try {
    verbs = fs.readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && fs.existsSync(path.join(dir, d.name, 'index.html')))
      .map((d) => d.name)
      .filter((v) => v !== verb);
  } catch { return []; }
  if (verbs.length <= count) return verbs.sort();
  verbs.sort();
  const seed = [...verb].reduce((s, c) => s + c.charCodeAt(0), 0);
  const start = seed % verbs.length;
  const out = [];
  for (let i = 0; i < count; i++) out.push(verbs[(start + i) % verbs.length]);
  return out;
}

// speakable-Selektor fürs Article-Schema (Voice/AI-Assistenten).
export const SPEAKABLE = { '@type': 'SpeakableSpecification', cssSelector: ['h1', '.verb-summary'] };

// CSS für die GEO-Blöcke. Nutzt nur Variablen, die in BEIDEN Stylesheets
// existieren (--surface/--border/--muted/--text/--radius/--display); als Akzent
// var(--lc) (neues CI) → var(--accent) (Generator) → Blau-Fallback.
export function geoCss() {
  return `  /* ── GEO/Zitat-Blöcke: TL;DR · FAQ · verwandte Verben ── */
  .verb-summary { background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--lc,var(--accent,#0a84ff)); border-radius: 14px; padding: 16px 20px; margin: 0 0 24px; font-size: 15.5px; line-height: 1.7; color: var(--text); box-shadow: 0 8px 20px -14px rgba(70,55,25,.34); }
  .verb-summary strong { color: var(--lc,var(--accent,#0a84ff)); font-weight: 700; }
  .verb-summary a { color: var(--lc,var(--accent,#0a84ff)); font-weight: 700; }
  .faq-section h2::before { content: "💬 "; }
  .faq-item { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; margin-bottom: 10px; box-shadow: 0 6px 18px -13px rgba(70,55,25,.3); overflow: hidden; }
  .faq-item summary { cursor: pointer; padding: 14px 44px 14px 18px; font-family: var(--display,inherit); font-weight: 700; font-size: 15px; list-style: none; position: relative; }
  .faq-item summary::-webkit-details-marker { display: none; }
  .faq-item summary::after { content: "+"; position: absolute; right: 18px; top: 11px; font-size: 20px; color: var(--muted); font-weight: 400; }
  .faq-item[open] summary::after { content: "−"; }
  .faq-item p { padding: 0 18px 16px; font-size: 14.5px; color: var(--muted); line-height: 1.7; }
  .related-section h2::before { content: "🔗 "; }
  .related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
  .related-chip { display: flex; flex-direction: column; gap: 2px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 12px 14px; box-shadow: 0 6px 18px -13px rgba(70,55,25,.3); transition: transform .12s, border-color .12s; }
  .related-chip:hover { text-decoration: none; transform: translateY(-2px); border-color: var(--lc,var(--accent,#0a84ff)); }
  .rc-verb { font-weight: 700; font-size: 15px; color: var(--text); font-family: var(--display,inherit); }
  .rc-hint { font-size: 12px; color: var(--muted); }`;
}
