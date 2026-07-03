/**
 * Tests für geo-blocks.mjs — Schwerpunkt convertStrayAsterisks().
 *
 *   node --test scripts/lib/geo-blocks.test.mjs
 *
 * Hintergrund (Wächter-Fund 30.06.2026): Notion-Rich-Text liefert vereinzelt
 * literale "*"-Zeichen als plain_text statt als bold/italic-Annotation, z. B.
 * "estoy levantándo*me" bzw. "No me levanto.*" in blog/reflexive-verben-spanisch.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { convertStrayAsterisks, addHeadingIdsAndToc, slugifyHeading } from "./geo-blocks.mjs";

test("convertStrayAsterisks: Text ohne Sternchen bleibt unverändert", () => {
  assert.equal(convertStrayAsterisks("estoy levantándome"), "estoy levantándome");
});

test("convertStrayAsterisks: gepaarte *Wörter* werden zu <em>", () => {
  assert.equal(convertStrayAsterisks("Could you help me?"), "Could you help me?");
  assert.equal(convertStrayAsterisks("*Could you help me?*"), "<em>Could you help me?</em>");
});

test("convertStrayAsterisks: unpaares Sternchen mitten im Wort wird entfernt", () => {
  assert.equal(convertStrayAsterisks("estoy levantándo*me"), "estoy levantándome");
});

test("convertStrayAsterisks: unpaares Sternchen am Satzende wird entfernt", () => {
  assert.equal(convertStrayAsterisks("No me levanto.*"), "No me levanto.");
});

test("convertStrayAsterisks: leerer/undefined Input", () => {
  assert.equal(convertStrayAsterisks(""), "");
  assert.equal(convertStrayAsterisks(undefined), "");
});

test("addHeadingIdsAndToc: bleibt unverändert nutzbar (Regressionsschutz)", () => {
  const html =
    "<h2>Eins</h2><p>a</p><h2>Zwei</h2><p>b</p><h2>Drei</h2>";
  const { tocHtml } = addHeadingIdsAndToc(html, { minToc: 3 });
  assert.match(tocHtml, /<nav class="toc"/);
  assert.equal(slugifyHeading("Wo steht das Pronomen?"), "wo-steht-das-pronomen");
});
