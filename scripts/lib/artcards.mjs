/**
 * artcards.mjs
 *
 * „Abgehobene" Abschnitts-Karten für Blog-Artikel + das sprachspezifische
 * Karten-Quiz-Flip-Widget (übernommen aus der Landingpage).
 *
 *   wrapContentCards(contentHtml, { langCode }) → string
 *     Verpackt jeden <h2>-Abschnitt des Fließtexts in eine eigene
 *     `<section class="artcard">` (hebt die Abschnitte optisch vom Hintergrund
 *     ab) und schiebt bei Sprach-Artikeln (es/fr/en/nl) nach der ersten Karte
 *     das interaktive Flip-Widget ein.
 *
 * Bewusst reine String-Operation, kein Import aus notion-to-html.mjs → testbar.
 *
 * WICHTIG: Dieses Modul ist die *einzige* Quelle des Karten-Designs. Wird der
 * Generator erneut gelaufen (Publish/Refresh), entstehen die Karten wieder von
 * hier — kein Nachbau per Einmal-Skript nötig.
 */

/* ─── Sprachspezifische Widget-Inhalte (Präsens/Vergangenheit, mittleres Niveau) ─ */

export const WIDGET_DATA = {
  es: {
    asked: "Gefragt: <b>Pr&auml;sens &middot; nosotros</b>",
    verb: "hablar",
    fs: 'Cuando viajamos, nosotros <span class="qc-gap">&hellip;</span> con la gente local.',
    tr: "Wenn wir reisen, sprechen wir mit den Einheimischen.",
    ans: "hablamos",
    bs: "Cuando viajamos, nosotros <u>hablamos</u> con la gente local.",
    small: "hablar &middot; nosotros",
    pair: 'hablar <span class="ar">&#8594;</span> <span class="tg">sprechen</span>',
  },
  fr: {
    asked: "Gefragt: <b>Pr&eacute;sent &middot; nous</b>",
    verb: "parler",
    fs: 'Quand nous voyageons, nous <span class="qc-gap">&hellip;</span> avec les habitants.',
    tr: "Wenn wir reisen, sprechen wir mit den Einheimischen.",
    ans: "parlons",
    bs: "Quand nous voyageons, nous <u>parlons</u> avec les habitants.",
    small: "parler &middot; nous",
    pair: 'parler <span class="ar">&#8594;</span> <span class="tg">sprechen</span>',
  },
  en: {
    asked: "Gefragt: <b>Simple Past &middot; we</b>",
    verb: "go",
    fs: 'Last summer we <span class="qc-gap">&hellip;</span> to Portugal.',
    tr: "Letzten Sommer sind wir nach Portugal gereist.",
    ans: "went",
    bs: "Last summer we <u>went</u> to Portugal.",
    small: "go &middot; we",
    pair: 'go <span class="ar">&#8594;</span> <span class="tg">gehen</span>',
  },
  nl: {
    asked: "Gefragt: <b>Pr&auml;sens &middot; wij</b>",
    verb: "praten",
    fs: 'Als we reizen, <span class="qc-gap">&hellip;</span> wij met de mensen daar.',
    tr: "Wenn wir reisen, reden wir mit den Leuten dort.",
    ans: "praten",
    bs: "Als we reizen, <u>praten</u> wij met de mensen daar.",
    small: "praten &middot; wij",
    pair: 'praten <span class="ar">&#8594;</span> <span class="tg">reden</span>',
  },
};

/* ─── Flip-Widget-HTML für einen Sprachcode ──────────────────────────────── */

export function flipWidgetHtml(langCode) {
  const d = WIDGET_DATA[langCode];
  if (!d) return "";
  const tog = "this.closest('.flipdemo').classList.toggle('flipped')";
  return `<section class="artcard blog-flip lc-${langCode}">
<div class="flip-cta-big">Jetzt ausprobieren!</div>
<p class="flip-cta-sub">Tippe die Karte an &mdash; kein Konto n&ouml;tig.</p>
<div class="flipdemo">
<div class="flipcard" role="button" tabindex="0" aria-label="Karte umdrehen" onclick="${tog}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();${tog}}">
<div class="fc-inner">
<div class="fc-face fc-front">
<div class="qc-asked">${d.asked}</div><div class="qc-div"></div><div class="qc-tip">&#128161; Tipp &#9662;</div>
<div class="qc-verb">${d.verb} <span class="qc-arr">&#8599;</span></div>
<div class="qc-cloze"><div class="qc-sent">${d.fs}</div><div class="qc-clozediv"></div><div class="qc-trans">${d.tr}</div></div>
<div class="qc-flip">&#8635; Zum Umdrehen tippen</div>
</div>
<div class="fc-face fc-back">
<div class="qc-backtop"><span class="qc-small">${d.small}</span><span class="qc-spk">&#128266;</span></div>
<div class="qc-verb">${d.ans}</div>
<div class="qc-cloze"><div class="qc-sent">${d.bs}</div><div class="qc-clozediv"></div><div class="qc-trans">${d.tr}</div></div>
<div class="qc-pair">${d.pair}</div>
</div>
</div>
</div>
<button class="qc-cta" type="button" onclick="this.closest('.flipdemo').classList.add('flipped')">Antippen &amp; umdrehen</button>
<div class="qc-actions"><button class="qc-again" type="button" onclick="this.closest('.flipdemo').classList.remove('flipped')">&#8635; Nochmal</button><button class="qc-got" type="button" onclick="this.closest('.flipdemo').classList.remove('flipped')">&#10003; Sitzt</button></div>
</div>
<p class="artcard-cap">So f&uuml;hlt sich das <strong>Karten-Quiz</strong> an: L&uuml;cke f&uuml;llen, antippen, umdrehen &mdash; L&ouml;sung im ganzen Satz. <a class="inline" href="https://conjuexpert.app/">Kostenlos &uuml;ben &#8594;</a></p>
</section>`;
}

/* ─── Fließtext in Abschnitts-Karten verpacken ───────────────────────────── */

/**
 * Jeder <h2>-Abschnitt wird zu einer eigenen `<section class="artcard">`.
 * Bei Sprach-Artikeln (langCode ∈ es/fr/en/nl) folgt nach der ersten Karte das
 * Flip-Widget. Deutsche Artikel (de) bekommen Karten, aber kein Widget.
 *
 * @param {string} contentHtml  Fließtext mit <h2 id="…">-Überschriften
 * @param {{langCode?: string}} opts
 * @returns {string}
 */
export function wrapContentCards(contentHtml, { langCode } = {}) {
  const html = String(contentHtml || "");

  // Start-Positionen aller <h2> im Fließtext einsammeln.
  const idxs = [];
  const re = /<h2(\s|>)/g;
  let m;
  while ((m = re.exec(html))) idxs.push(m.index);
  if (idxs.length === 0) return html; // kein Abschnitt → unverändert

  const preamble = html.slice(0, idxs[0]).trim();

  const parts = [];
  for (let i = 0; i < idxs.length; i++) {
    const from = idxs[i];
    const to = i + 1 < idxs.length ? idxs[i + 1] : html.length;
    const chunk = html.slice(from, to).trim();
    if (chunk) parts.push(chunk);
  }

  const cards = parts.map((p) => `<section class="artcard">\n${p}\n</section>`);

  const widget = flipWidgetHtml(langCode);
  let out = "";
  // Auch der Lede-Text vor dem ersten Abschnitt bekommt eine Karte —
  // sonst „schwebt" er als einziger Block ohne Hintergrund auf der Seite.
  if (preamble) out += `<section class="artcard artcard-lede">\n${preamble}\n</section>\n`;
  if (widget && cards.length) {
    out += [cards[0], widget, ...cards.slice(1)].join("\n");
  } else {
    out += cards.join("\n");
  }
  return out;
}
