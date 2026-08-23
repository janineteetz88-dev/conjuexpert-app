import { test } from "node:test";
import assert from "node:assert/strict";

import { auditBlogIndexHtml, upsertBlogCards, shortenSummary } from "./blog-index.mjs";

const BASE_INDEX = `<!doctype html><html><body>
  <section id="grammatik">
    <div class="grid">
    </div>
  </section>
</body></html>`;

test("auditBlogIndexHtml: sauberer Index hat keine Funde", () => {
  const html = upsertBlogCards(BASE_INDEX, [
    {
      slug: "/blog/beispiel-artikel",
      titleDe: "Beispiel-Artikel",
      summaryDe: "Eine ganz normale, echte Beschreibung.",
      cat: "gram",
      thumb: "gram-es-1.png",
    },
  ]);
  assert.deepEqual(auditBlogIndexHtml(html), []);
});

test("auditBlogIndexHtml: erkennt den Notion-Editor-Platzhalter in einer Karte", () => {
  const html = upsertBlogCards(BASE_INDEX, [
    {
      slug: "/blog/kaputter-artikel",
      titleDe: "Kaputter Artikel",
      summaryDe: "Meta (für Blog-Engine & Freigabe)",
      cat: "gram",
      thumb: "gram-es-1.png",
    },
  ]);
  const violations = auditBlogIndexHtml(html);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /kaputter-artikel/);
});

test("shortenSummary: kürzt lange Beschreibungen an der Wortgrenze", () => {
  const long = "a".repeat(120) + " b " + "c".repeat(20);
  const short = shortenSummary(long);
  assert.ok(short.length <= 111);
  assert.ok(short.endsWith("…"));
});
