#!/usr/bin/env node
/**
 * satz-tuev.mjs — wöchentliche Qualitäts-Stichprobe der KI-Beispielsätze.
 *
 * Erzeugt über den ConjuExpert-Worker eine Matrix von Beispielsätzen
 * (Sprachen × Zeitformen × Verben, echte Formen aus den Engines) mit einer
 * SYNC-Kopie der App-Kernregeln und lässt jeden Satz von einem strengen,
 * unabhängigen Richter bewerten (Grammatik, Natürlichkeit, Sinn, Übersetzung).
 *
 * Ausgabe: Pass-Rate je Sprache + alle Durchfaller mit Begründung — in die
 * Konsole und ins GitHub-Job-Summary. Exit 1 erst unter 85 % (echter Alarm).
 *
 * SYNC-Hinweis: Die Generier-Regeln sind eine kompakte Kopie der Kernregeln
 * aus app.js → fetchCloze. Bei größeren Prompt-Umbauten dort bitte hier
 * nachziehen (Zweck ist die Messung der Satzqualität, nicht Byte-Gleichheit).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { loadEngine } from "./geo-blocks.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const WORKER = "https://bitter-bird-3204.janine-teetz88.workers.dev";
const PASS_ALARM = 0.85;

const LANG_NAME = { de: "German", es: "Spanish", en: "English", nl: "Dutch", fr: "French" };
// Je Sprache: [ZeitformId, Verben] — Mischung aus Alltag und bekannten Stolperstellen.
const MATRIX = {
  de: { tenses: ["present", "past", "perfect", "subjunctive1", "imperative"], verbs: ["machen", "abholen", "genießen", "bleiben", "sich freuen", "einschlafen", "arbeiten", "nehmen"] },
  es: { tenses: ["present", "past", "imperfect", "subjunctive", "subjunctiveImp"], verbs: ["hablar", "tener", "ir", "levantarse", "dormir", "leer", "querer", "hacer"] },
  en: { tenses: ["present", "past", "perfect", "presentCont", "future"], verbs: ["go", "study", "be", "write", "stop", "have", "make", "teach"] },
  nl: { tenses: ["present", "past", "perfect", "future", "imperative"], verbs: ["werken", "reizen", "opstaan", "geloven", "zijn", "meenemen", "wonen", "kopen"] },
  fr: { tenses: ["present", "past", "perfect", "future", "subjunctive"], verbs: ["parler", "aller", "se lever", "finir", "espérer", "venir", "manger", "prendre"] },
};
const PRON_IDX = [0, 1, 2, 3, 4, 5];

function fail(msg) { console.error(`✗ ${msg}`); process.exit(1); }

async function ai(prompt, lang) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(WORKER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, lang }),
      });
      if (res.ok) {
        const j = await res.json().catch(() => null);
        const txt = j && (j.text || j.completion || j.result || (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content));
        if (typeof txt === "string" && txt.trim()) return txt.trim();
        if (typeof j === "string") return j;
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 1500 * (i + 1)));
  }
  return null;
}

function looseParse(t) {
  let s = String(t || "").replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  try { return JSON.parse(s); } catch { return null; }
}

// SYNC-Kopie der App-Kernregeln (kompakt).
function genPrompt(lang, verb, tenseLabel, pronoun, answer) {
  const tName = LANG_NAME[lang];
  const compound = answer.indexOf(" ") >= 0;
  return `Write ONE short, natural everyday sentence in ${tName} (max 9 words) ${compound
    ? `that correctly expresses the ${tenseLabel} of "${verb}" for "${pronoun}" — its parts are ${answer.split(" ").map(p => `"${p}"`).join(" + ")}. Use natural word order (finite verb second, prefix/participle at clause end where the language requires it).`
    : `that CONTAINS exactly the verb form "${answer}" (the ${tenseLabel} of "${verb}", ${pronoun}).`
  } The sentence must be 100% correct standard ${tName}, make real-world sense, use only natural everyday collocations, keep the content light (no accidents/illness/death), and sound like something a native speaker would actually say. Avoid vague filler nouns (zona/área/cosa and equivalents). Then give a natural German translation of the whole sentence. Do NOT use double-quote characters. Reply with ONLY minified JSON: {"t":"<${tName} sentence>","n":"<German translation>"}`;
}

function judgePrompt(lang, verb, tenseLabel, pronoun, answer, sentence, translation) {
  const tName = LANG_NAME[lang];
  return `You are an extremely strict ${tName} native-speaker examiner. Sentence: "${sentence}" (should contain the ${tenseLabel} form "${answer}" of "${verb}" for ${pronoun}). German translation given: "${translation}". FAIL it if ANY of these hold: a grammar error anywhere; the required form is missing or altered; the sentence is semantically absurd or contrived (a stitched-together textbook line no native would say); an object/complement the verb cannot naturally take; unnatural or word-for-word German in the translation; morbid content. Otherwise PASS. Reply with ONLY minified JSON: {"ok":true} or {"ok":false,"grund":"<one short German sentence>"}`;
}

async function checkOne(lang, verb, tenseId, engines) {
  const eng = engines[lang];
  let r;
  try { r = eng.conjugate(verb); } catch (e) { return { skip: true }; }
  if (!r || r.error) return { skip: true };
  const t = (r.tenses || []).find(x => x.id === tenseId);
  if (!t) return { skip: true };
  const idxPool = PRON_IDX.filter(i => t.forms[i] && t.forms[i] !== "—");
  if (!idxPool.length) return { skip: true };
  const idx = idxPool[Math.floor(Math.random() * idxPool.length)];
  const answer = t.forms[idx].replace(/\s*…\s*/g, " ").replace(/\s+/g, " ").trim();
  const pronoun = (r.pronouns || [])[idx] || "";
  const tenseLabel = t.label || tenseId;

  const genRaw = await ai(genPrompt(lang, verb, tenseLabel, pronoun, answer), lang);
  const gen = looseParse(genRaw);
  if (!gen || !gen.t) return { lang, verb, tenseLabel, pronoun, answer, ok: false, grund: "Generierung fehlgeschlagen/kein JSON" };

  const judgeRaw = await ai(judgePrompt(lang, verb, tenseLabel, pronoun, answer, gen.t, gen.n || ""), lang);
  const judge = looseParse(judgeRaw);
  if (!judge) return { lang, verb, tenseLabel, pronoun, answer, sentence: gen.t, ok: false, grund: "Richter-Antwort unlesbar" };
  return { lang, verb, tenseLabel, pronoun, answer, sentence: gen.t, translation: gen.n || "", ok: !!judge.ok, grund: judge.grund || "" };
}

async function main() {
  const engines = {};
  for (const lang of Object.keys(MATRIX)) engines[lang] = loadEngine(ROOT, lang);

  const jobs = [];
  for (const [lang, m] of Object.entries(MATRIX)) {
    for (const tenseId of m.tenses) {
      // 4 zufällige Verben je Zeitform
      const vs = [...m.verbs].sort(() => Math.random() - 0.5).slice(0, 4);
      for (const v of vs) jobs.push({ lang, verb: v, tenseId });
    }
  }

  const results = [];
  const BATCH = 8;
  for (let i = 0; i < jobs.length; i += BATCH) {
    const chunk = jobs.slice(i, i + BATCH);
    const rs = await Promise.all(chunk.map(j => checkOne(j.lang, j.verb, j.tenseId, engines)));
    results.push(...rs.filter(r => r && !r.skip));
    console.log(`  … ${Math.min(i + BATCH, jobs.length)}/${jobs.length} geprüft`);
  }

  const byLang = {};
  for (const r of results) {
    byLang[r.lang] = byLang[r.lang] || { total: 0, pass: 0, fails: [] };
    byLang[r.lang].total++;
    if (r.ok) byLang[r.lang].pass++; else byLang[r.lang].fails.push(r);
  }
  const total = results.length, pass = results.filter(r => r.ok).length;
  const rate = total ? pass / total : 0;

  const lines = [];
  lines.push(`# Satz-TÜV — ${total} Sätze geprüft, ${pass} bestanden (${Math.round(rate * 100)} %)`);
  lines.push("");
  lines.push("| Sprache | geprüft | bestanden | Quote |");
  lines.push("|---|---|---|---|");
  for (const [lang, d] of Object.entries(byLang)) {
    lines.push(`| ${LANG_NAME[lang]} | ${d.total} | ${d.pass} | ${Math.round((d.pass / d.total) * 100)} % |`);
  }
  const fails = results.filter(r => !r.ok);
  if (fails.length) {
    lines.push("");
    lines.push("## Durchfaller");
    for (const f of fails) {
      lines.push(`- **${f.lang}/${f.verb}** (${f.tenseLabel} · ${f.pronoun} · ${f.answer}): „${f.sentence || "—"}" — ${f.grund}`);
    }
  }
  const out = lines.join("\n");
  console.log("\n" + out);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, out + "\n");

  if (rate < PASS_ALARM) fail(`Pass-Rate ${Math.round(rate * 100)} % unter Alarmschwelle ${PASS_ALARM * 100} %`);
}

main().catch(e => fail(e && e.message || String(e)));
