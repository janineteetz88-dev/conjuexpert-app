/**
 * Tests für den Meta-Block-Parser + den v2-Zitatblock-Adapter.
 *
 *   node --test scripts/lib/meta-block.test.mjs
 *
 * Schwerpunkt: Rückwärtskompatibilität des ALTEN `>`-Zitatblock-Formats —
 *   (a) mehrzeilige Zitatblöcke (Slug/Typ/Cluster je eigene Zeile) und
 *   (b) Kombi-Labels für den Hoch-Link ("Pillar (Hub)", "Pillar/Hub",
 *       "Pillar (hoch)", "Hub (Pillar)").
 * Beide Muster haben zuvor zum stillen Überspringen von Entwürfen geführt.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { parseMetaBlock, validateMeta } from "./meta-block.mjs";
import { blocksToMetaText, firstHeadIntro } from "./notion-adapt.mjs";

/* ─── Notion-Block-Fixtures ──────────────────────────────────────────────── */

const rt = (text, ann = {}) => [{ plain_text: text, annotations: ann }];
const para = (text, ann) => ({ type: "paragraph", paragraph: { rich_text: rt(text, ann) } });
const quote = (text, ann) => ({ type: "quote", quote: { rich_text: rt(text, ann) } });
const bullet = (text, ann) => ({ type: "bulleted_list_item", bulleted_list_item: { rich_text: rt(text, ann) } });
const h1 = (text) => ({ type: "heading_1", heading_1: { rich_text: rt(text) } });

// Bequemer Roundtrip: Blöcke → Meta-Text → geparste Meta.
const metaFromBlocks = (blocks) => parseMetaBlock(blocksToMetaText(blocks));

/* ─── (a) Mehrzeiliger ALT-Zitatblock ────────────────────────────────────── */

test("v2: mehrzeiliger Zitatblock — alle Felder bleiben erhalten", () => {
  const blocks = [
    quote(
      [
        "**Meta-Block**",
        "Slug: /blog/verneinung-franzoesisch",
        "Typ: Spoke",
        "Cluster: fr-grammatik",
        "Säule: Schmerzpunkt",
        "Pillar (Hub): /blog/franzoesisch-verben-konjugieren",
        "Geschwister: /blog/passe-compose-imparfait · /blog/franzoesische-verbgruppen",
        "Meta-Description: Die französische Verneinung umklammert das konjugierte Verb.",
      ].join("\n"),
    ),
    h1("Die Verneinung im Französischen"),
  ];

  const meta = metaFromBlocks(blocks);
  assert.equal(meta.slug, "/blog/verneinung-franzoesisch");
  assert.equal(meta.cluster, "fr-grammatik");
  assert.equal(meta.typ, "spoke");
  // Kombi-Label "Pillar (Hub)" muss als Hoch-Link aufgelöst werden.
  assert.equal(meta.pillarUp, "/blog/franzoesisch-verben-konjugieren");
  assert.deepEqual(meta.downOrSiblings, [
    "/blog/passe-compose-imparfait",
    "/blog/franzoesische-verbgruppen",
  ]);
  assert.ok(meta.metaDescription && meta.metaDescription.length > 0);

  assert.equal(validateMeta(meta).ok, true);
});

/* ─── (b) Einzeiliger ALT-Zitatblock mit Kombi-Label ─────────────────────── */

test("v2: einzeiliger Zitatblock mit 'Pillar/Hub' + separater Meta-Description", () => {
  const blocks = [
    quote(
      "**Meta-Block** · Slug: /blog/interleaving-sprachenlernen · Typ: Spoke · " +
        "Cluster: methodik · Säule: Anwendung · Pillar/Hub: /blog/sprachen-lernen · " +
        "Geschwister: /blog/active-recall-sprachenlernen",
    ),
    para("Meta-Description: Interleaving heißt, Verben und Zeiten gemischt zu üben."),
    h1("Interleaving"),
  ];

  const meta = metaFromBlocks(blocks);
  assert.equal(meta.slug, "/blog/interleaving-sprachenlernen");
  assert.equal(meta.cluster, "methodik");
  assert.equal(meta.pillarUp, "/blog/sprachen-lernen"); // 'Pillar/Hub' aufgelöst
  assert.ok(meta.metaDescription.includes("Interleaving"));
  assert.equal(validateMeta(meta).ok, true);
});

test("v2: Kombi-Label 'Pillar (hoch)' wird als Hoch-Link erkannt", () => {
  const meta = metaFromBlocks([
    quote(
      "Slug: /blog/futur-simple-futur-proche · Typ: Spoke · Cluster: fr-grammatik · " +
        "Säule: Schmerzpunkt · Pillar (hoch): /blog/franzoesisch-verben-konjugieren · " +
        "Meta-Description: Futur simple oder futur proche — welche Zukunft wann.",
    ),
  ]);
  assert.equal(meta.pillarUp, "/blog/franzoesisch-verben-konjugieren");
  assert.equal(validateMeta(meta).ok, true);
});

test("v2: Kombi-Label 'Hub (Pillar)' wird als Hoch-Link erkannt", () => {
  const meta = parseMetaBlock(
    [
      "**Meta (für Blog-Engine & Freigabe)**",
      "- Slug: /blog/x · Cluster: es-grammatik · Hub (Pillar): /blog/spanisch-verben-konjugieren",
      "- Meta-Description: Beschreibung.",
    ].join("\n"),
  );
  assert.equal(meta.pillarUp, "/blog/spanisch-verben-konjugieren");
  assert.equal(validateMeta(meta).ok, true);
});

/* ─── Regression: bestehende Formate bleiben gültig ──────────────────────── */

test("kanonisches Bullet-Format (Hoch-Label) bleibt gültig", () => {
  const blocks = [
    para("**Meta (für Blog-Engine & Freigabe)**"),
    bullet("**Slug:** /blog/feynman-methode-grammatik"),
    bullet("**Typ:** Spoke · **Cluster:** methodik / sprachen-lernen · **Säule:** Anwendung"),
    bullet("**Hoch (Pillar/Hub):** /blog/sprachen-lernen"),
    bullet("**Seitwärts (Geschwister):** /blog/active-recall-sprachenlernen · /blog/verben-lernen-tipps"),
    bullet("**Meta-Description:** Die Feynman-Methode in vier Schritten."),
    h1("Feynman"),
  ];
  const meta = metaFromBlocks(blocks);
  assert.equal(meta.slug, "/blog/feynman-methode-grammatik");
  assert.equal(meta.pillarUp, "/blog/sprachen-lernen");
  assert.equal(meta.cluster, "methodik / sprachen-lernen");
  assert.equal(validateMeta(meta).ok, true);
});

test("Hub mit bare 'Pillar:' (Global-Pillar) bleibt gültig", () => {
  const meta = parseMetaBlock(
    [
      "**Meta (für Blog-Engine & Freigabe)**",
      "- Slug: /blog/sprachen-lernen · Typ: Hub/Pillar · Cluster: methodik · Pillar: /blog/verben-konjugieren-lernen",
      "- Meta-Description: Der große Überblick.",
    ].join("\n"),
  );
  assert.equal(meta.typ, "hub");
  assert.equal(meta.pillarUp, "/blog/verben-konjugieren-lernen");
  assert.equal(validateMeta(meta).ok, true);
});

/* ─── Validator: fehlender Hoch-Link wird weiterhin abgewiesen ───────────── */

test("validateMeta: fehlender Hoch-Link → ungültig (Slug/Cluster/Desc vorhanden)", () => {
  const meta = parseMetaBlock(
    [
      "**Meta (für Blog-Engine & Freigabe)**",
      "- Slug: /blog/x · Cluster: es-grammatik",
      "- Meta-Description: Beschreibung.",
    ].join("\n"),
  );
  const res = validateMeta(meta);
  assert.equal(res.ok, false);
  assert.ok(res.errors.some((e) => /Hoch/.test(e)));
});

test("leere/kein Meta-Block → alle Pflichtfelder fehlen", () => {
  const res = validateMeta(parseMetaBlock(""));
  assert.equal(res.ok, false);
  assert.ok(res.errors.length >= 3);
});

/* ─── firstHeadIntro — Meta-Description-Fallback ─────────────────────────── */

const italicPara = (text) => ({
  type: "paragraph",
  paragraph: { rich_text: [{ plain_text: text, annotations: { italic: true } }] },
});
const plainPara = (text) => ({
  type: "paragraph",
  paragraph: { rich_text: [{ plain_text: text, annotations: {} }] },
});
const h1Block = (text) => ({
  type: "heading_1",
  heading_1: { rich_text: [{ plain_text: text, annotations: {} }] },
});

test("firstHeadIntro: kursiven Intro-Satz vor H1 extrahieren", () => {
  const blocks = [
    italicPara("Spanische Verben konjugieren — so funktioniert das Muster."),
    h1Block("Spanisch konjugieren"),
    plainPara("Fließtext des Artikels."),
  ];
  assert.equal(
    firstHeadIntro(blocks, { italicOnly: true }),
    "Spanische Verben konjugieren — so funktioniert das Muster."
  );
});

test("firstHeadIntro: ohne italicOnly auch gewöhnlichen Absatz nehmen", () => {
  const blocks = [
    plainPara("Ein normaler Einleitungssatz."),
    h1Block("Titel"),
  ];
  assert.equal(firstHeadIntro(blocks), "Ein normaler Einleitungssatz.");
  assert.equal(firstHeadIntro(blocks, { italicOnly: true }), "");
});

test("firstHeadIntro: Meta-Description-Zeile wird übersprungen", () => {
  const blocks = [
    plainPara("Meta-Description: Bereits vorhanden."),
    italicPara("Echter Intro-Satz."),
    h1Block("Titel"),
  ];
  assert.equal(
    firstHeadIntro(blocks, { italicOnly: true }),
    "Echter Intro-Satz."
  );
});

test("firstHeadIntro: leere Blöcke → leerer String", () => {
  assert.equal(firstHeadIntro([]), "");
  assert.equal(firstHeadIntro(null), "");
});
