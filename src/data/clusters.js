/**
 * Single Source of Truth für alle Cluster-Zuordnungen.
 *
 * Felder:
 *   id          — eindeutiger Bezeichner (kebab-case)
 *   lang        — ISO-639-1 Sprachcode
 *   label       — Anzeigename der Sprache
 *   color       — CI-Farbe der Sprache (CSS-Hex)
 *   globalPillar — einziger globaler Pillar (sprachübergreifend)
 *   hub         — Sprach-Hub-Seite dieses Clusters
 *   spokes      — Artikel-Spokes (live = existiert, planned = noch nicht live)
 *   verbPages   — URL-Präfix für konjugierte Verb-Seiten dieses Clusters
 *
 * Spokes mit { live: false } existieren noch nicht — werden trotzdem in der
 * Architektur geführt, damit Links vorbereitet werden können.
 */

export const GLOBAL_PILLAR = {
  slug: "/blog/verben-konjugieren-lernen",
  title: "Verben konjugieren: der Bauplan für 5 Sprachen",
};

export const clusters = [
  {
    id: "spanisch-verben",
    lang: "es",
    label: "Spanisch",
    color: "#ff9f0a",
    hub: {
      slug: "/blog/spanisch-verben-konjugieren",
      title: "Spanische Verben konjugieren",
      live: false,
    },
    spokes: [
      { slug: "/blog/subjuntivo-spanisch", title: "Subjuntivo Spanisch", live: true },
      { slug: "/blog/unregelmaessige-verben-spanisch", title: "Unregelmäßige Verben Spanisch", live: true },
      { slug: "/blog/preterito-spanisch", title: "Pretérito indefinido Spanisch", live: false },
      { slug: "/blog/imperfecto-spanisch", title: "Imperfecto Spanisch", live: false },
      { slug: "/blog/ser-estar-spanisch", title: "Ser vs. Estar", live: true },
      { slug: "/blog/reflexive-verben-spanisch", title: "Reflexive Verben Spanisch", live: false },
    ],
    verbPages: "/konjugation/es/",
  },
  {
    id: "deutsch-verben",
    lang: "de",
    label: "Deutsch",
    color: "#ff3b5c",
    hub: {
      slug: "/blog/deutsch-verben-konjugieren",
      title: "Deutsche Verben konjugieren",
      live: false,
    },
    spokes: [
      { slug: "/blog/trennbare-verben-deutsch", title: "Trennbare Verben Deutsch", live: true },
      { slug: "/blog/modalverben-deutsch", title: "Modalverben Deutsch", live: false },
      { slug: "/blog/konjunktiv-ii-deutsch", title: "Konjunktiv II Deutsch", live: false },
      { slug: "/blog/starke-verben-deutsch", title: "Starke Verben Deutsch", live: false },
    ],
    verbPages: "/konjugation/de/",
  },
  {
    id: "franzoesisch-verben",
    lang: "fr",
    label: "Französisch",
    color: "#a557ff",
    hub: {
      slug: "/blog/franzoesisch-verben-konjugieren",
      title: "Französische Verben konjugieren",
      live: false,
    },
    spokes: [
      { slug: "/blog/passe-compose-imparfait", title: "Passé composé vs. imparfait", live: true },
      { slug: "/blog/subjonctif-franzoesisch", title: "Subjonctif Französisch", live: false },
      { slug: "/blog/futur-simple-franzoesisch", title: "Futur simple Französisch", live: false },
    ],
    verbPages: "/konjugation/fr/",
  },
  {
    id: "englisch-verben",
    lang: "en",
    label: "Englisch",
    color: "#0a84ff",
    hub: {
      slug: "/blog/englisch-verben-konjugieren",
      title: "Englische Verben konjugieren",
      live: false,
    },
    spokes: [
      { slug: "/blog/irregular-verbs-english", title: "Irregular Verbs English", live: false },
      { slug: "/blog/present-perfect-english", title: "Present Perfect English", live: false },
    ],
    verbPages: "/konjugation/en/",
  },
  {
    id: "niederlaendisch-verben",
    lang: "nl",
    label: "Niederländisch",
    color: "#30c95a",
    hub: {
      slug: "/blog/niederlaendisch-verben-konjugieren",
      title: "Niederländische Verben konjugieren",
      live: false,
    },
    spokes: [
      { slug: "/blog/scheidbare-werkwoorden-nl", title: "Scheidbare Werkwoorden Niederländisch", live: false },
    ],
    verbPages: "/konjugation/nl/",
  },
  {
    id: "nl-grammatik",
    lang: "de",
    label: "Methodik",
    color: "#34c759",
    hub: {
      slug: "/blog/niederlaendisch-verben-konjugieren",
      title: "Niederländische Verben konjugieren — der große Überblick",
      live: true,
    },
    spokes: [
    ],
  },
  {
    id: "methodik-sprachen-lernen",
    lang: "de",
    label: "Methodik",
    color: "#34c759",
    hub: {
      slug: "/blog/sprachen-lernen",
      title: "Sprachen lernen — der große Überblick: die Methoden, die wirklich wirken",
      live: true,
    },
    spokes: [
      { slug: "/blog/haeufigste-probleme-sprachenlernen", title: "Die häufigsten Probleme beim Sprachenlernen — was die Community wirklich nervt (und was wirklich hilft)", live: true },
    ],
  },
  {
    id: "lernmethode",
    lang: "de",
    label: "Methodik",
    color: "#34c759",
    hub: null,
    spokes: [
      { slug: "/blog/active-recall-sprachenlernen", title: "Active Recall fürs Sprachenlernen — aktiv abrufen statt nur lesen", live: true },
      { slug: "/blog/dranbleiben-motivation-sprachenlernen", title: "Dranbleiben: Motivation halten, wenn die Anfangs-Euphorie weg ist", live: true },
      { slug: "/blog/lernmythen-sprachenlernen", title: "Lernmythen beim Sprachenlernen — Lerntypen, „10.000 Stunden\" & Co. entlarvt", live: true },
      { slug: "/blog/spaced-repetition-sprachenlernen", title: "Spaced Repetition richtig nutzen — der Wiederhol-Rhythmus, der sitzt", live: true },
      { slug: "/blog/aktiv-lernen-statt-tabellen-auswendig", title: "Konjugationstabellen auswendig lernen? Warum aktives Üben dreimal mehr bringt", live: true },
      { slug: "/blog/verben-lernen-tipps", title: "Verben lernen: 7 Lerntipps, mit denen die Formen endlich sitzen", live: true },
    ],
  },
  {
    id: "es-grammatik",
    lang: "de",
    label: "Methodik",
    color: "#34c759",
    hub: null,
    spokes: [
      { slug: "/blog/preterito-indefinido-spanisch", title: "Vergangenheit auf Spanisch erzählen: pretérito indefinido einfach erklärt", live: true },
    ],
  },
  {
    id: "fr-grammatik",
    lang: "de",
    label: "Methodik",
    color: "#34c759",
    hub: null,
    spokes: [
      { slug: "/blog/passe-compose-imparfait", title: "Passé composé vs. imparfait: So triffst du die richtige Wahl", live: true },
    ],
  },
  {
    id: "de-grammatik",
    lang: "de",
    label: "Methodik",
    color: "#34c759",
    hub: null,
    spokes: [
      { slug: "/blog/trennbare-verben-deutsch", title: "Trennbare Verben Deutsch: das Trenn-System", live: true },
    ],
  },
];

/** Hilfsfunktion: Findet Cluster und Spoke für einen gegebenen Slug. */
export function findPage(slug) {
  const normalized = slug.replace(/\/$/, "");
  if (normalized === GLOBAL_PILLAR.slug.replace(/\/$/, "")) {
    return { type: "globalPillar", cluster: null, spoke: null };
  }
  for (const cluster of clusters) {
    if (normalized === cluster.hub.slug.replace(/\/$/, "")) {
      return { type: "hub", cluster, spoke: null };
    }
    const spoke = cluster.spokes.find(
      (s) => s.slug.replace(/\/$/, "") === normalized
    );
    if (spoke) return { type: "spoke", cluster, spoke };
  }
  return { type: "unknown", cluster: null, spoke: null };
}
