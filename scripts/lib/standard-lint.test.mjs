/**
 * Tests für den Gold-Standard-Linter.
 *   node --test scripts/lib/standard-lint.test.mjs
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { lintArticleText, lintRenderedHtml, lintSignals, hardErrors } from "./standard-lint.mjs";

const codes = (findings) => findings.map((f) => f.code);

/* ─── Quelle/Markdown ──────────────────────────────────────────────────────── */

const goodMd = [
  "> Slug: /blog/x · Typ: Spoke · Cluster: es-grammatik · Säule: Anwendung · Pillar: /blog/verben-konjugieren-lernen · Hub: /blog/spanisch-verben-konjugieren · Geschwister: /blog/y · relatedVerbs: hablar",
  "# Titel mit Keyword",
  "**Meta-Description:** Kurzer Nutzen mit Keyword.",
  "Ein Einstieg, der anders ist.",
  "> **Das Wichtigste in Kürze:** Die Kernaussage in einem Satz.",
  "## Abschnitt",
  "Text mit [Hub-Link](/blog/spanisch-verben-konjugieren) und [hablar](/konjugation/es/hablar) und [comer](/konjugation/es/comer).",
  "+++ **Frage 1?**\nAntwort.\n+++",
  "+++ **Frage 2?**\nAntwort.\n+++",
].join("\n");

test("sauberer Artikel → keine harten Fehler", () => {
  const f = lintArticleText(goodMd, { meta: { metaDescription: "Kurzer Nutzen mit Keyword.", keyword: "Keyword", hub: "/blog/x", relatedVerbs: ["hablar"] } });
  assert.equal(hardErrors(f).length, 0, JSON.stringify(f));
});

test("TL;DR-Label → harter Fehler", () => {
  const f = lintArticleText(goodMd.replace("Das Wichtigste in Kürze:", "TL;DR:"));
  assert.ok(codes(f).includes("TLDR_LABEL"));
  assert.ok(hardErrors(f).some((e) => e.code === "TLDR_LABEL"));
});

test("Entwurfs-Marker + Redaktionshinweis → harte Fehler", () => {
  const f = lintArticleText(goodMd + "\n✍️ [Entwurf]\nStatus: Entwurf — wartet auf deine Freigabe.");
  assert.ok(codes(f).includes("DRAFT_MARKER"));
  assert.ok(codes(f).includes("EDITORIAL_NOTE"));
});

test("Emoji in der Kürze-Box → Warnung", () => {
  const f = lintArticleText(goodMd.replace("**Das Wichtigste in Kürze:**", "💡 **Das Wichtigste in Kürze:**"));
  assert.ok(codes(f).includes("KUERZE_BOX_EMOJI"));
});

test("FAQ mit 4 Einträgen → Warnung", () => {
  const md = goodMd + "\n+++ **Frage 3?**\nA.\n+++\n+++ **Frage 4?**\nA.\n+++";
  assert.ok(codes(lintArticleText(md)).includes("FAQ_COUNT"));
});

test("zu wenige interne Links → Warnung + fehlender Runter-Link", () => {
  const md = goodMd.replace("und [hablar](/konjugation/es/hablar) und [comer](/konjugation/es/comer)", "");
  const c = codes(lintArticleText(md));
  assert.ok(c.includes("LINKS_FEW"));
  assert.ok(c.includes("LINKS_NO_DOWN"));
});

test('Fließtext-„kurz gesagt" ist ok, aber Box-Label „Kurz gesagt" nicht', () => {
  const prose = goodMd + "\nKurz gesagt: das war der Punkt.";
  assert.equal(hardErrors(lintArticleText(prose)).filter((e) => e.code === "TLDR_LABEL").length, 0);
  const box = goodMd.replace("**Das Wichtigste in Kürze:**", "**Kurz gesagt:**");
  assert.ok(hardErrors(lintArticleText(box)).some((e) => e.code === "TLDR_LABEL"));
});

test('„Kennst du das?" → harter Fehler', () => {
  assert.ok(hardErrors(lintArticleText("Kennst du das? " + goodMd)).some((e) => e.code === "BANNED_INTRO"));
});

/* ─── gerendertes HTML ─────────────────────────────────────────────────────── */

test("lintRenderedHtml: Entwurfs-Marker im Live-HTML → harter Fehler", () => {
  const html = "<main><h1>Titel</h1><p>✍️ [Entwurf] Text</p></main>";
  assert.ok(hardErrors(lintRenderedHtml(html)).some((e) => e.code === "DRAFT_MARKER"));
});

test("lintRenderedHtml: zählt <a>-Links im Körper", () => {
  const html =
    '<main><h1>T</h1><p>x <a href="/blog/hub">Hub</a> <a href="/konjugation/es/hablar">hablar</a></p>' +
    "<details>Q</details><details>A</details></main>";
  const f = lintRenderedHtml(html);
  // 2 Links (1 up, 1 down) → LINKS_FEW (unter 3), aber kein NO_UP/NO_DOWN
  assert.ok(codes(f).includes("LINKS_FEW"));
  assert.ok(!codes(f).includes("LINKS_NO_UP"));
  assert.ok(!codes(f).includes("LINKS_NO_DOWN"));
});

test("lintSignals: reine Signal-Prüfung ist deterministisch", () => {
  const f = lintSignals({ text: "sauberer Text ohne Box", faqCount: 3, upLinks: 2, downLinks: 2 });
  assert.ok(codes(f).includes("KUERZE_BOX_MISSING"));
  assert.equal(hardErrors(f).length, 0);
});
