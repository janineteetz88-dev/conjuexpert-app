/**
 * conj-engine.test.mjs — Regressionstests für die Konjugations-Engines.
 *
 * Anlass: User-Meldung 29.08.2026 — die DE-Engine bildete "zeichnten" statt
 * "zeichneten" (e-Einschub fehlte bei ch-Stämmen wie zeichnen/rechnen, weil
 * die wohnen-Ausnahme das h der ch-Digraphe mitfing). Diese Tests nageln den
 * e-Einschub inklusive der Gegenbeispiele fest, damit die Regel bei künftigen
 * Engine-Umbauten nicht wieder kippt.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

globalThis.window = globalThis.window || {};
require(path.join(ROOT, "engine", "conj-de.js"));
const de = globalThis.window.CONJ.de;

function forms(verb, tenseId) {
  const t = de.conjugate(verb).tenses.find((x) => x.id === tenseId);
  return t ? t.forms : null;
}

test("DE e-Einschub: ch-Stämme (zeichnen, rechnen)", () => {
  assert.equal(forms("zeichnen", "past")[3], "zeichneten");
  assert.equal(forms("zeichnen", "past")[0], "zeichnete");
  assert.equal(forms("zeichnen", "present")[1], "zeichnest");
  assert.equal(forms("zeichnen", "present")[2], "zeichnet");
  assert.equal(forms("zeichnen", "perfect")[0], "habe gezeichnet");
  assert.equal(forms("rechnen", "past")[0], "rechnete");
  assert.equal(forms("berechnen", "perfect")[0], "habe berechnet");
});

test("DE e-Einschub: Konsonant+n/m (atmen, öffnen) weiter aktiv", () => {
  assert.equal(forms("atmen", "past")[0], "atmete");
  assert.equal(forms("öffnen", "past")[0], "öffnete");
  assert.equal(forms("trocknen", "past")[0], "trocknete");
});

test("DE KEIN e-Einschub: Vokal/h/l/r vor n und ch-Verben ohne n (wohnen, rauchen)", () => {
  assert.equal(forms("wohnen", "past")[0], "wohnte");
  assert.equal(forms("lehnen", "past")[0], "lehnte");
  assert.equal(forms("lernen", "past")[0], "lernte");
  assert.equal(forms("rauchen", "past")[0], "rauchte");
  assert.equal(forms("suchen", "perfect")[0], "habe gesucht");
});
