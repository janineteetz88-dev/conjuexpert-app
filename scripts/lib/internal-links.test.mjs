import { test } from "node:test";
import assert from "node:assert/strict";

import { unlinkMissingBlogLinks } from "./internal-links.mjs";

const KNOWN = new Set(["deutsch-verben-konjugieren", "will-vs-going-to"]);

test("toter interner Link wird entlinkt, Text bleibt stehen", () => {
  const html =
    '<p>Mehr dazu in <a class="inline" href="https://conjuexpert.app/blog/conditionals-englisch">den Conditionals</a>.</p>';
  const { html: out, removed } = unlinkMissingBlogLinks(html, { knownSlugs: KNOWN });
  assert.equal(out, "<p>Mehr dazu in den Conditionals.</p>");
  assert.deepEqual(removed, ["conditionals-englisch"]);
});

test("Link auf existierenden Artikel bleibt unverändert (absolut und relativ)", () => {
  const html =
    '<a href="/blog/deutsch-verben-konjugieren/">A</a> und <a class="inline" href="https://conjuexpert.app/blog/will-vs-going-to">B</a>';
  const { html: out, removed } = unlinkMissingBlogLinks(html, { knownSlugs: KNOWN });
  assert.equal(out, html);
  assert.deepEqual(removed, []);
});

test("Blog-Start, Sektions-Anker und externe Links werden nicht angefasst", () => {
  const html =
    '<a href="/blog/">Blog</a> <a href="/blog/#grammatik">Grammatik</a> <a href="https://example.com/blog/foo">extern</a>';
  const { html: out, removed } = unlinkMissingBlogLinks(html, { knownSlugs: new Set() });
  assert.equal(out, html);
  assert.deepEqual(removed, []);
});

test("Link mit Anker/Query auf toten Artikel wird ebenfalls entlinkt", () => {
  const html = '<a href="/blog/phrasal-verbs-englisch#liste">Phrasal Verbs</a>';
  const { html: out, removed } = unlinkMissingBlogLinks(html, { knownSlugs: KNOWN });
  assert.equal(out, "Phrasal Verbs");
  assert.deepEqual(removed, ["phrasal-verbs-englisch"]);
});
