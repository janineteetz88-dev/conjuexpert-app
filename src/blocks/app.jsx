/* Kunju Expert — main app (v2: 5 languages, audio, translation, filters, favorites, mixed quiz, highlight) */
const { useState, useEffect, useRef, useMemo } = React;

const LANG_ORDER = ["de", "es", "en", "nl", "fr"];
const LANG_META = {
  de: { code: "DE", color: "#ff3b5c" },
  es: { code: "ES", color: "#ff9f0a" },
  en: { code: "EN", color: "#0a84ff" },
  nl: { code: "NL", color: "#30c95a" },
  fr: { code: "FR", color: "#a557ff" }
};
const RAINBOW = ["#ff3b5c", "#ff7a18", "#ffc400", "#34c759", "#00bcd4", "#0a84ff", "#a557ff", "#ff5ea8"];

/* Per-(learning-)language hero claim — in the TARGET language, not the UI language. */
const HERO_CLAIM = {
  de: { pre: "Sprich ",  lng: "Deutsch",    accent: "souverän.",       c2: "#ff7a18" },
  es: { pre: "¡Habla ",  lng: "español",    accent: "con confianza!",  c2: "#ff5ea8" },
  en: { pre: "Speak ",   lng: "English",    accent: "with confidence", c2: "#00bcd4" },
  nl: { pre: "Spreek ",  lng: "Nederlands", accent: "met vertrouwen",  c2: "#00bcd4" },
  fr: { pre: "Parle ",   lng: "français",   accent: "avec assurance",  c2: "#ff5ea8" } };

const HERO_CONFETTI = [
  { top: 12,  left: 22,    w: 7,  h: 7, rot: 18,  o: 1 },
  { top: 26,  left: "82%", w: 18, h: 6, rot: -22, o: 1 },
  { top: 58,  left: 16,    w: 16, h: 5, rot: 35,  o: 0.9 },
  { top: 16,  left: "58%", w: 6,  h: 6, rot: 0,   o: 0.9 },
  { top: 104, left: "90%", w: 8,  h: 8, rot: 25,  o: 0.85 },
  { top: 132, left: 26,    w: 13, h: 5, rot: -14, o: 0.8 } ];

/* Short formation hints for regular verbs, per language + tense id (memory aid). */
const TENSE_HINTS = {
  es: { present: "-o · -as/-es", imperfect: "-aba / -ía", past: "-é·-aste·-ó", perfect: "he + -ado/-ido", pluperfect: "había + -ado/-ido", future: "Inf. + -é", subjunctive: "-e / -a", subjunctiveImp: "-ara / -iera", conditional: "Inf. + -ía", imperative: "¡-a! / ¡-e!", continuous: "estoy + -ando/-iendo", continuousPerfect: "he estado + -ndo", gerund: "-ando / -iendo", participle: "-ado / -ido" },
  en: { present: "base (+ -s)", presentCont: "am/is/are + -ing", past: "-ed", pastCont: "was/were + -ing", perfect: "have + -ed", perfectCont: "have been + -ing", pluperfect: "had + -ed", future: "will + base", subjunctive: "base form", conditional: "would + base", imperative: "base!", gerund: "-ing" },
  de: { present: "-e · -st · -t", past: "-te", perfect: "haben/sein + ge-…-t", pluperfect: "hatte/war + ge-…-t", future: "werden + Inf.", subjunctive: "würde + Inf.", subjunctive1: "-e · -est · -e", conditional: "würde + Inf.", imperative: "Stamm!", gerund: "-end" },
  fr: { present: "-e·-es·-e / -is", past: "-ais", perfect: "avoir/être + -é", pluperfect: "avais + -é", future: "Inf. + -ai", subjunctive: "-e", conditional: "Inf. + -ais", conditionalPast: "aurais + -é", imperative: "-e !", gerund: "-ant" },
  nl: { present: "- / -t", past: "-te / -de", perfect: "hebben/zijn + ge-…", pluperfect: "had + ge-…", future: "zullen + Inf.", subjunctive: "-e", conditional: "zou + Inf.", imperative: "stam!", gerund: "-end" }
};
function tenseHint(lang, id) {return (TENSE_HINTS[lang] || {})[id] || "";}
const FR_ETRE_TENSES = new Set(["perfect", "pluperfect", "conditionalPast"]);
const DE_NL_AUX_TENSES = new Set(["perfect", "pluperfect"]);
function auxHint(lang, tenseId, answer) {
  if (!answer) return "";
  const first = answer.split(" ")[0];
  if (lang === "fr" && FR_ETRE_TENSES.has(tenseId) && (first === "suis" || answer.includes(" suis "))) return "Fém. +e · Plur. +s";
  if (lang === "de" && DE_NL_AUX_TENSES.has(tenseId) && (first === "bin" || answer.includes(" bin "))) return "Hilfsverb: sein";
  if (lang === "nl" && DE_NL_AUX_TENSES.has(tenseId) && (first === "ben" || answer.includes(" ben "))) return "Hulpww.: zijn";
  return "";
}

const ES_VERB_NOTES = {
  ser:   { de:"Dauerhaft & Identität · ≠ estar (Zustand/Ort)", en:"Permanent & identity · ≠ estar (state/place)", es:"Permanente & identidad · ≠ estar (estado/lugar)", nl:"Permanent & identiteit · ≠ estar (staat/locatie)", fr:"Permanent & identité · ≠ estar (état/lieu)" },
  estar: { de:"Zustand, Befindlichkeit & Ort · ≠ ser (Identität)", en:"State, feeling & location · ≠ ser (identity)", es:"Estado, sentimiento & ubicación · ≠ ser (identidad)", nl:"Toestand & locatie · ≠ ser (identiteit)", fr:"État & lieu · ≠ ser (identité)" },
  gustar:{ de:"Konstr.: me gusta/gustan · Subjekt = das Gemochte", en:"Constr.: me gusta/gustan · subject = what is liked", es:"Constr.: me gusta/gustan · sujeto = lo que gusta", nl:"Constr.: me gusta/gustan · onderwerp = het gewaardeerde", fr:"Constr.: me gusta/gustan · sujet = ce qui plaît" },
};
const ES_GUSTAR_VERBS = new Set(["gustar","encantar","molestar","faltar","doler","interesar","parecer","importar","quedar","sorprender","aburrir","preocupar","apetecer","convenir"]);
/* Group each tense into a mood/family for headers + ordering. */
const TENSE_GROUP = { present: "ind", imperfect: "ind", past: "ind", presentCont: "ind", pastCont: "ind", perfect: "ind", perfectCont: "ind", pluperfect: "ind", future: "ind", subjunctive: "subj", subjunctive1: "subj", subjunctiveImp: "subj", conditional: "cond", conditionalPast: "cond", imperative: "imp", continuous: "cont", continuousPerfect: "cont", gerund: "forms", participle: "forms" };
const GROUP_ORDER = ["ind", "subj", "cond", "imp", "cont", "forms"];
function tenseGroup(id) {return TENSE_GROUP[id] || "ind";}
function QModeIcon({ id }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" };
  if (id === "cards") return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="3" y="6" width="13" height="15" rx="2.5" {...p}></rect><path d="M8 3.5h9.5A2.5 2.5 0 0 1 20 6v12" {...p}></path></svg>;
  if (id === "choice") return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="6" rx="3" {...p}></rect><rect x="3.5" y="13.5" width="17" height="6" rx="3" {...p}></rect><circle cx="16.5" cy="16.5" r="1.4" fill="currentColor" stroke="none"></circle></svg>;
  if (id === "type") return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="2.5" {...p}></rect><path d="M7 10h.01M11 10h.01M15 10h.01M8 14h8" {...p}></path></svg>;
  if (id === "speak") return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" {...p}></rect><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" {...p}></path></svg>;
  if (id === "texte") return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 6.5C10.5 5 8 4.5 4.5 4.8V18c3.5-.3 6 .2 7.5 1.7" {...p}></path><path d="M12 6.5C13.5 5 16 4.5 19.5 4.8V18c-3.5-.3-6 .2-7.5 1.7" {...p}></path></svg>;
  return null;
}
function TenseDropdown({ lang, tenses, isOn, onToggle, onAll, onNone, single, onClose, hideLbl }) {
  const [open, setOpen] = useState(false);
  const onCount = tenses.filter((t) => isOn(t.id)).length;
  const cur = single ? (tenses.find((t) => isOn(t.id)) || {}).label : null;
  const summary = single ? cur || "—" : onCount === tenses.length || onCount === 0 ? tr("all_tenses") : onCount + " / " + tenses.length;
  return (
    <div className="tdwrap" style={{ "--lc": LANG_META[lang].color }}>
      <button className={"tdbtn" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)}>
        {!hideLbl && <span className="tdbtn-lbl">{tr("tense_word")}</span>}
        <span className="tdbtn-sum">{summary}</span>
        <span className="tdbtn-caret">{open ? "▴" : "▾"}</span>
      </button>
      {open &&
      <React.Fragment>
          <div className="tdbackdrop" onClick={() => setOpen(false)}></div>
          <div className="tdmenu">
            {!single &&
          <div className="tdactions">
              <button className="tdaction" onClick={onAll}>✓ {tr("all_btn")}</button>
              <button className="tdaction" onClick={onNone}>✕ {tr("none_btn")}</button>
            </div>
          }
            <div className="tdlist">
              {tenses.map((t, i) =>
            <button key={t.id} className={"tditem" + (isOn(t.id) ? " on" : "")} style={{ "--cc": RAINBOW[i % RAINBOW.length] }} onClick={() => {onToggle(t.id);if (single) setOpen(false);}}>
                  <span className="tdcheck">{isOn(t.id) ? "✓" : ""}</span>
                  <span className="tdlabel">{t.label}{tenseHint(lang, t.id) && <span className="tdhint">{tenseHint(lang, t.id)}</span>}</span>
                </button>
            )}
            </div>
          </div>
        </React.Fragment>
      }
    </div>);

}

function OneDropdown({ lang, options, valueId, onPick }) {
  const [open, setOpen] = useState(false);
  const cur = (options.find((o) => o.id === valueId) || options[0] || {}).label;
  return (
    <div className="tdwrap" style={{ "--lc": LANG_META[lang].color }}>
      <button className={"tdbtn" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)}>
        <span className="tdbtn-sum">{cur}</span>
        <span className="tdbtn-caret">{open ? "▴" : "▾"}</span>
      </button>
      {open &&
      <React.Fragment>
        <div className="tdbackdrop" onClick={() => setOpen(false)}></div>
        <div className="tdmenu">
          <div className="tdlist">
            {options.map((o) =>
              <button key={o.id} className={"tditem" + (valueId === o.id ? " on" : "")} style={{ "--cc": "var(--lc)" }} onClick={() => {onPick(o.id);setOpen(false);}}>
                <span className="tdcheck">{valueId === o.id ? "✓" : ""}</span>
                <span className="tdlabel">{o.label}{o.hint && <span className="tdhint">{o.hint}</span>}</span>
              </button>
            )}
          </div>
        </div>
      </React.Fragment>}
    </div>);
}

function MultiDropdown({ lang, options, isOn, onToggle, onAll, onNone }) {
  const [open, setOpen] = useState(false);
  const onCount = options.filter((o) => isOn(o.id)).length;
  const summary = onCount === options.length || onCount === 0 ? tr("all_themes") : onCount + " / " + options.length;
  return (
    <div className="tdwrap" style={{ "--lc": LANG_META[lang].color }}>
      <button className={"tdbtn" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)}>
        <span className="tdbtn-sum">{summary}</span>
        <span className="tdbtn-caret">{open ? "▴" : "▾"}</span>
      </button>
      {open &&
      <React.Fragment>
        <div className="tdbackdrop" onClick={() => setOpen(false)}></div>
        <div className="tdmenu">
          <div className="tdactions">
            <button className="tdaction" onClick={onAll}>✓ {tr("all_btn")}</button>
            <button className="tdaction" onClick={onNone}>✕ {tr("none_btn")}</button>
          </div>
          <div className="tdlist">
            {options.map((o) =>
              <button key={o.id} className={"tditem" + (isOn(o.id) ? " on" : "")} style={{ "--cc": "var(--lc)" }} onClick={() => onToggle(o.id)}>
                <span className="tdcheck">{isOn(o.id) ? "✓" : ""}</span>
                <span className="tdlabel">{o.label}</span>
              </button>
            )}
          </div>
        </div>
      </React.Fragment>}
    </div>);
}

/* 5 most important irregular verbs per language (for the Learn overview). */
const IRR_TOP = { es: ["ser", "estar", "tener", "hacer", "ir", "haber", "poder", "decir"], en: ["be", "have", "do", "go", "say", "get", "make", "know"], de: ["sein", "haben", "werden", "gehen", "kommen", "geben", "nehmen", "wissen"], fr: ["être", "avoir", "aller", "faire", "pouvoir", "vouloir", "venir", "prendre"], nl: ["zijn", "hebben", "gaan", "doen", "komen", "zien", "geven", "nemen"] };
/* A reliably-regular sample verb per language, for showing the regular pattern. */
const REG_SAMPLE = { es: "hablar", en: "work", de: "machen", fr: "parler", nl: "werken" };

function persist(k, v) {try {localStorage.setItem(k, JSON.stringify(v));} catch (e) {}}
function recall(k, d) {try {const v = localStorage.getItem(k);return v == null ? d : JSON.parse(v);} catch (e) {return d;}}
/* Reset quiz scores once per browser session (so each session starts fresh). */
try {if (!sessionStorage.getItem("kunju-sess")) {Object.keys(localStorage).filter((k) => k.indexOf("kunju-score-") === 0).forEach((k) => localStorage.removeItem(k));sessionStorage.setItem("kunju-sess", "1");}} catch (e) {}

/* UI localization: driven by mother tongue (only the 5 app langs; else English). */
const NATIVE_TO_UI = { German: "de", English: "en", Spanish: "es", Dutch: "nl", French: "fr" };
function uiFromNative(n) {return NATIVE_TO_UI[n] || "en";}
/* Guess the learner's mother tongue from the browser so the very first screen
   isn't in a language they can't read. Falls back to English. */
function detectNative() {
  const map = { de: "German", en: "English", es: "Spanish", nl: "Dutch", fr: "French", it: "Italian", pt: "Portuguese", pl: "Polish", tr: "Turkish", ru: "Russian", ar: "Arabic", zh: "Chinese" };
  try {
    const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"]);
    for (const l of langs) {const code = String(l).slice(0, 2).toLowerCase();if (map[code]) return map[code];}
  } catch (e) {}
  return "English";
}
let UILANG = "en";
function tr(k, vars) {
  const dict = window.UI && window.UI[UILANG] || window.UI && window.UI.en || {};
  let s = dict[k] != null ? dict[k] : (window.UI && window.UI.en[k]) != null ? window.UI.en[k] : k;
  if (vars) Object.keys(vars).forEach((p) => {s = s.split("{" + p + "}").join(vars[p]);});
  return s;
}

function savedVoiceURI(base) { try { return localStorage.getItem("kunju-voice-" + base) || ""; } catch (e) { return ""; } }
function setSavedVoice(base, uri) { try { uri ? localStorage.setItem("kunju-voice-" + base, uri) : localStorage.removeItem("kunju-voice-" + base); } catch (e) {} }
function savedGender(base) { try { return localStorage.getItem("kunju-voicegender-" + base) || ""; } catch (e) { return ""; } }
function setSavedGender(base, g) { try { g ? localStorage.setItem("kunju-voicegender-" + base, g) : localStorage.removeItem("kunju-voicegender-" + base); } catch (e) {} }
// names that signal a higher-quality / more natural voice vs. robotic "compact" ones
const NICE_VOICE = /(neural|natural|enhanced|premium|wavenet|siri|google|amélior|verbessert|mejorad)/i;
const BAD_VOICE = /(compact|eloquence|fred|albert|zarvox|whisper|bad news|good news|bells|trinoids|cellos)/i;
// best-effort gender guess from the voice name (device voices rarely expose gender directly)
const VOICE_F = /(\bfemale\b|weiblich|\bfrau\b|femenin|\bmujer\b|\bvrouw\b|\bfemme\b|m[oó]nica|paulina|marisol|angelina|esperanza|pen[eé]lope|luc[ií]a|\banna\b|petra|helena|marlene|katja|vicki|samantha|karen|moira|tessa|serena|fiona|victoria|allison|\bava\b|susan|\bzoe\b|\bkate\b|catherine|\bnora\b|am[eé]lie|audrey|aur[eé]lie|\bmarie\b|virginie|chantal|\bjulie\b|ellen|claire|femke|laura|sof[ií]a|\bsara\b|in[eé]s|hedda|gisela|seraphina|amala|elvira|abril|dalia|paloma|triana|jenny|aria|michelle|sonia|libby|maisie|emma|denise|eloise|jacqueline|coralie|josephine|colette|fenna|maartje)/i;
const VOICE_M = /(\bmale\b|m[aä]nnlich|\bmann\b|masculin|\bhombre\b|\bman\b|jorge|diego|\bjuan\b|carlos|pablo|enrique|miguel|yannick|markus|\bmartin\b|stefan|boris|conrad|\bhans\b|\bdaniel\b|\balex\b|\bfred\b|\btom\b|aaron|arthur|gordon|oliver|\blee\b|rishi|\balbert\b|thomas|nicolas|mathieu|\bpaul\b|xander|\bbram\b|ruben|maarten|\bluca\b|killian|bernd|christoph|ralf|[aá]lvaro|dario|elias|saul|ryan|guy|\beric\b|brian|liam|henri|jerome|maurten|kasper)/i;
function voiceGender(name) { const n = (name || "").toLowerCase(); if (VOICE_F.test(n)) return "f"; if (VOICE_M.test(n)) return "m"; return ""; }
function pickVoice(lang) {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;
  const lc = (lang || "").toLowerCase(), base = lc.split("-")[0];
  // honour a specific chosen voice first
  const pref = savedVoiceURI(base);
  if (pref) { const pv = voices.find((v) => v.voiceURI === pref); if (pv) return pv; }
  const exact = voices.filter((v) => (v.lang || "").toLowerCase() === lc);
  const baseM = voices.filter((v) => (v.lang || "").toLowerCase().split("-")[0] === base);
  let pool = exact.length ? exact : baseM;
  if (!pool.length) return null;
  // narrow to the requested gender; if none is detected by name, at least avoid the opposite gender
  const gender = savedGender(base);
  if (gender) {
    const gm = pool.filter((v) => voiceGender(v.name) === gender);
    if (gm.length) { pool = gm; }
    else { const other = gender === "f" ? "m" : "f"; const notOther = pool.filter((v) => voiceGender(v.name) !== other); if (notOther.length) pool = notOther; }
  }
  // prefer natural-sounding voices, penalise robotic/novelty ones; local & default break ties
  const rank = (v) => (NICE_VOICE.test(v.name) ? 4 : 0) + (BAD_VOICE.test(v.name) ? -4 : 0) + (v.localService ? 1 : 0) + (v.default ? 1 : 0);
  return pool.slice().sort((a, b) => rank(b) - rank(a))[0];
}
let TTS_RATE = 1.0;
try { const _r = parseFloat(localStorage.getItem("kunju-ttsrate")); if (_r) TTS_RATE = _r; } catch (e) {}
function applyTtsRate(r) { TTS_RATE = r; try { localStorage.setItem("kunju-ttsrate", String(r)); } catch (e) {} }
function speak(text, lang) {
  if (!window.speechSynthesis || !text || text === "—") return;
  try {
    const clean = String(text).replace(/…/g, " ").replace(/\s+/g, " ").trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = lang;u.rate = TTS_RATE;
    const v = pickVoice(lang);
    if (v) {u.voice = v;u.lang = v.lang;}
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) {}
}
// read a whole story aloud, queued sentence by sentence (reliable for long texts)
function speakStory(sents, lang) {
  if (!window.speechSynthesis) return;
  try { window.speechSynthesis.cancel(); } catch (e) {}
  const v = pickVoice(lang);
  (sents || []).forEach((txt) => {
    const clean = String(txt || "").replace(/…/g, " ").replace(/\s+/g, " ").trim();
    if (!clean) return;
    try {
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = (v && v.lang) || lang; u.rate = TTS_RATE; if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  });
}
// small stable hash for caching a story's translation by content + native language
function strHash(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return (h >>> 0).toString(36); }
// warm up the voice list (some browsers load it asynchronously)
if (window.speechSynthesis) {
  try {window.speechSynthesis.getVoices();window.speechSynthesis.onvoiceschanged = () => {window.speechSynthesis.getVoices();};} catch (e) {}
}

const esc = (s) => (s || "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]);
function diffHTML(actual, baseline) {
  if (!baseline || actual === baseline || actual === "—") return esc(actual);
  const a = actual,b = baseline;
  let p = 0;while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let s = 0;while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  const mid = a.slice(p, a.length - s);
  if (!mid) return esc(actual);
  return esc(a.slice(0, p)) + '<mark class="irrmark">' + esc(mid) + "</mark>" + esc(a.slice(a.length - s));
}

function suggestionsFor(lang) {
  const eng = window.CONJ[lang];
  const set = new Set(eng.samples);
  const tr = window.TRANS[lang];
  if (tr) Object.keys(tr).forEach((k) => set.add(k));
  return Array.from(set).sort();
}

/* ---------- Reverse lookup / deconjugation ----------
   Type an inflected form ("siendo", "hago", "ging", "fui") and find which
   infinitive + person + tense it belongs to, by enumerating a pool of known
   verbs and matching every conjugated form. Catches the irregular forms that
   are impossible to reverse-engineer by eye. */
function deburr(s) {return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");}
function infBase(langCode, inf) {return (inf || "").replace(/^to /, "").trim().toLowerCase();}

/* Large vetted lists of additional REGULAR verbs to widen the quiz/lookup pool.
   Only regular verbs (which the rule engine conjugates correctly) — strong/
   irregular verbs are already covered by each engine's IRR table. */
const EXTRA_VERBS = {
  es: ["trabajar", "estudiar", "comprar", "mirar", "escuchar", "caminar", "cocinar", "limpiar", "lavar", "llevar", "llamar", "tomar", "usar", "ayudar", "necesitar", "esperar", "pasar", "quedar", "dejar", "entrar", "mandar", "preguntar", "contestar", "cantar", "bailar", "nadar", "viajar", "visitar", "descansar", "terminar", "preparar", "enseñar", "ganar", "gastar", "prestar", "regalar", "alquilar", "arreglar", "cambiar", "llorar", "gritar", "saltar", "tardar", "tratar", "desear", "disfrutar", "dibujar", "firmar", "guardar", "invitar", "marcar", "parar", "pintar", "robar", "mejorar", "bajar", "llegar", "pagar", "sacar", "tocar", "buscar", "practicar", "explicar", "organizar", "utilizar", "aceptar", "ocupar", "llenar", "beber", "correr", "aprender", "vender", "deber", "temer", "meter", "prometer", "comprender", "depender", "recibir", "decidir", "subir", "partir", "permitir", "existir", "insistir", "asistir", "discutir", "sufrir", "unir", "añadir", "admitir"],
  de: ["arbeiten", "spielen", "lernen", "kaufen", "wohnen", "sagen", "fragen", "suchen", "brauchen", "hören", "öffnen", "reden", "lieben", "leben", "lachen", "weinen", "kochen", "putzen", "baden", "aufstehen", "ankommen", "einkaufen", "anrufen", "mitnehmen", "aufmachen", "zumachen", "anfangen", "aufhören", "einschlafen", "aussehen", "vorbereiten", "abholen", "anziehen", "ausziehen", "fernsehen", "aufräumen", "einladen", "vorstellen", "teilnehmen", "stattfinden", "zurückkommen", "ausbreiten", "duschen", "tanzen", "zeigen", "holen", "legen", "stellen", "setzen", "kosten", "danken", "glauben", "hoffen", "planen", "schicken", "schmecken", "stören", "träumen", "üben", "verkaufen", "versuchen", "warten", "wecken", "wiederholen", "wünschen", "zahlen", "zeichnen", "mieten", "packen", "parken", "rauchen", "reisen", "retten", "schenken", "sparen", "antworten", "erklären", "bezahlen", "bestellen", "besuchen", "benutzen", "erzählen", "gehören", "verdienen", "studieren", "telefonieren", "fotografieren", "diskutieren", "funktionieren", "informieren", "organisieren", "probieren", "reparieren", "reservieren", "gratulieren", "korrigieren", "markieren", "notieren", "passieren"],
  en: ["work", "play", "learn", "want", "like", "love", "need", "help", "call", "look", "watch", "listen", "talk", "ask", "answer", "open", "close", "start", "stop", "walk", "jump", "clean", "cook", "wash", "use", "move", "live", "stay", "study", "try", "carry", "worry", "hurry", "marry", "enjoy", "travel", "visit", "finish", "wait", "change", "turn", "return", "follow", "happen", "seem", "believe", "remember", "decide", "explain", "describe", "continue", "create", "offer", "order", "plan", "save", "share", "smile", "count", "join", "pull", "push", "repeat", "report", "rest", "suggest", "thank", "touch", "wish", "end", "fill", "fix", "hope", "laugh", "pass", "pick", "reach", "relax", "remain", "rent", "wonder", "cross", "dance", "earn", "cause", "accept", "add", "allow", "appear", "arrive", "check", "claim", "climb", "collect", "compare", "complete", "cover", "deliver"],
  nl: ["maken", "spelen", "leren", "wonen", "luisteren", "praten", "koken", "dansen", "tonen", "halen", "opstaan", "aankomen", "meenemen", "opbellen", "uitgaan", "meedoen", "afspreken", "opruimen", "aankleden", "uitleggen", "voorstellen", "terugkomen", "zetten", "kosten", "danken", "geloven", "hopen", "sturen", "proberen", "wachten", "wensen", "betalen", "tekenen", "huren", "pakken", "parkeren", "roken", "reizen", "redden", "sparen", "studeren", "telefoneren", "bedanken", "beantwoorden", "bestellen", "openen", "gebruiken", "herhalen", "kloppen", "leven", "melden", "missen", "noemen", "passen", "rekenen", "stoppen", "tellen", "volgen", "werken", "antwoorden", "bewaren", "branden", "delen", "dromen", "fietsen", "groeten", "haasten", "regenen", "schudden", "stappen", "verven", "wandelen", "zwaaien", "bouwen", "gebeuren", "herinneren", "roepen"],
  fr: ["travailler", "regarder", "écouter", "marcher", "chercher", "aimer", "habiter", "arriver", "entrer", "rester", "passer", "montrer", "demander", "gagner", "danser", "chanter", "cuisiner", "laver", "porter", "fermer", "garder", "inviter", "oublier", "continuer", "étudier", "expliquer", "raconter", "rencontrer", "téléphoner", "tomber", "tourner", "utiliser", "visiter", "préparer", "présenter", "quitter", "réserver", "terminer", "traverser", "aider", "accepter", "adorer", "apporter", "casser", "compter", "coûter", "déjeuner", "dîner", "durer", "embrasser", "jouer", "penser", "donner", "trouver", "voyager", "manger", "arranger", "changer", "partager", "ranger", "nager", "laisser", "monter", "choisir", "finir", "grandir", "grossir", "maigrir", "obéir", "réfléchir", "réussir", "remplir", "réagir", "punir", "nourrir", "applaudir", "bâtir"]
};

/* Second batch — further vetted regular verbs to widen the pool. */
const EXTRA_VERBS2 = {
  es: ["abandonar","acabar","acompañar","alcanzar","animar","apoyar","aprovechar","avisar","borrar","calcular","celebrar","cenar","cobrar","comentar","comunicar","considerar","controlar","crear","cruzar","cuidar","dedicar","dudar","echar","eliminar","empujar","entregar","entrenar","evitar","expresar","formar","golpear","imaginar","importar","indicar","informar","intentar","inventar","juntar","levantar","lograr","luchar","manejar","mencionar","molestar","montar","observar","ordenar","pelear","perdonar","preparar","presentar","quemar","quitar","realizar","regresar","reparar","reservar","respetar","respirar","saludar","salvar","secar","separar","sumar","superar","tirar","tratar","votar"],
  de: ["abholen","aufräumen","bauen","bedeuten","begrüßen","beobachten","bezahlen","bilden","buchen","decken","drehen","drücken","erlauben","erreichen","fehlen","feiern","fühlen","füllen","gründen","heiraten","kämpfen","liefern","loben","melden","mischen","nutzen","ordnen","prüfen","sorgen","tauschen","teilen","töten","trennen","verletzen","vermieten","verpassen","verstecken","vertrauen","vorbereiten","wundern","zählen","zerstören","beenden","bemerken","betonen","bewerten","bedienen"],
  en: ["agree","attack","bake","behave","blame","borrow","breathe","brush","burn","celebrate","charge","cheer","connect","consider","contain","cough","crash","cry","decorate","discover","discuss","divide","dress","expect","explore","fail","gather","greet","guess","hate","heat","hire","hunt","imagine","improve","increase","introduce","invite","kick","knock","lift","manage","mark","measure","mention","mix","name","notice","paint","park","plant","prepare","present","pretend","prevent","print","promise","protect","prove","provide","raise","receive","recognize","record","reduce","refuse","remove","repair","reply","rescue","respect","shout","sign","solve","sort","spell","support","surprise","survive","taste","train","treat","trust","type","vote","waste","whisper","wrap","yell"],
  nl: ["bedoelen","begroeten","behandelen","bellen","bereiden","beschermen","betekenen","boeken","drukken","duwen","filmen","fluisteren","huilen","kammen","letten","oefenen","planten","poetsen","regelen","schilderen","slepen","trainen","vegen","verbeteren","vertalen","wisselen","zorgen","afmaken","bewaren","controleren","koppelen","markeren","ontmoeten","registreren","verzamelen"],
  fr: ["accompagner","ajouter","allumer","amuser","apprécier","arrêter","attraper","augmenter","baisser","bavarder","briller","brosser","brûler","cacher","calculer","cesser","classer","coller","commander","comparer","conserver","consulter","copier","coucher","couper","crier","décider","déclarer","décorer","dépenser","dessiner","deviner","discuter","échouer","emprunter","enseigner","exprimer","fonctionner","former","frapper","goûter","habiller","imaginer","indiquer","louer","mériter","noter","pardonner","pleurer","poser","pousser","prêter","profiter","proposer","ramasser","refuser","réparer","respecter","retrouver","sauter","sembler","sonner","souhaiter","toucher","tricher","vérifier","verser","voler","agir","définir","établir","fournir","guérir","ralentir","réunir","rougir","salir","unir"]
};

/* Third batch — large C1-level set of vetted REGULAR verbs. */
const EXTRA_VERBS3 = {
  es: ["acelerar","aclarar","acomodar","acumular","adaptar","adelantar","adoptar","afectar","afirmar","agrupar","ajustar","alargar","aliviar","alojar","alterar","amenazar","anotar","anticipar","anular","apuntar","arrancar","arrastrar","arriesgar","asegurar","asignar","asociar","bloquear","bromear","calmar","cancelar","capturar","cargar","castigar","causar","citar","clasificar","combinar","compensar","conectar","conquistar","conservar","contemplar","contratar","conversar","cooperar","coordinar","copiar","cultivar","declarar","decorar","denunciar","depositar","derribar","desarrollar","designar","destacar","destinar","detallar","determinar","dialogar","disculpar","diseñar","disparar","divorciar","doblar","documentar","dominar","donar","ejecutar","elaborar","elevar","embarcar","emocionar","emplear","enamorar","encajar","encargar","enfadar","enfocar","enfrentar","engañar","ensayar","enumerar","equipar","escalar","estacionar","estimar","estimular","estirar","estrenar","estropear","examinar","experimentar","explorar","exportar","expulsar","fabricar","facilitar","fallar","fascinar","felicitar","fijar","fomentar","formular","fracasar","frenar","fundar","generar","grabar","heredar","identificar","ignorar","iluminar","ilustrar","implicar","impulsar","incorporar","ingresar","inspirar","instalar","integrar","intercambiar","interpretar","investigar","juzgar","lamentar","lanzar","liberar","limitar","localizar","madurar","manipular","memorizar","mezclar","modificar","motivar","multiplicar","negociar","nombrar","obligar","ocasionar","odiar","orientar","originar","otorgar","participar","pasear","penetrar","pescar","planear","plantar","plantear","precisar","premiar","presionar","procesar","proclamar","procurar","programar","progresar","promocionar","proporcionar","protagonizar","protestar","provocar","rascar","rebajar","rechazar","reclamar","recopilar","recuperar","redactar","reflejar","reformar","registrar","relacionar","relajar","rellenar","rematar","restaurar","resultar","retirar","retrasar","revelar","revisar","rodear","saborear","sancionar","seleccionar","señalar","simular","solicitar","solucionar","soportar","sospechar","subrayar","sujetar","suplicar","telefonear","titular","tolerar","trasladar","triunfar","valorar","ventilar","vibrar","vigilar","vincular","visualizar","sacudir","interrumpir","sobrevivir","percibir","resumir","transmitir","suprimir"],
  de: ["ändern","ärgern","atmen","beantragen","bedrohen","beeinflussen","befragen","begleiten","behaupten","beleidigen","belohnen","berichten","beruhigen","beschädigen","bestrafen","beteiligen","betrachten","bewundern","blühen","dichten","drohen","ehren","einkaufen","entwickeln","erfüllen","ergänzen","erhöhen","erkundigen","ermöglichen","ernähren","erschöpfen","erwähnen","erwarten","fördern","freuen","fürchten","gehorchen","genehmigen","gewöhnen","glänzen","hindern","husten","klagen","korrigieren","kritisieren","kürzen","lagern","leisten","lenken","lösen","malen","merken","montieren","nähen","nicken","pflanzen","pflegen","plaudern","präsentieren","produzieren","quälen","rasieren","rechnen","reagieren","reduzieren","reinigen","riskieren","schaden","schalten","schminken","schonen","servieren","siegen","spazieren","speichern","spenden","sperren","spülen","stärken","strafen","stürzen","summen","tanken","trauern","tropfen","überlegen","überqueren","überraschen","übersetzen","umarmen","unterrichten","unterstützen","verändern","verbessern","verbrauchen","verlangen","vermuten","verpacken","versichern","versorgen","verteilen","verwenden","verzichten","warnen","wechseln","widmen","wirken","würzen","zaubern","zelten","zweifeln"],
  en: ["accomplish","acquire","adapt","address","adjust","admire","advise","alarm","amaze","analyze","announce","appreciate","approach","approve","argue","arrange","assist","assume","attach","attempt","attend","attract","avoid","balance","behave","belong","bother","brake","brighten","calculate","cancel","capture","care","cause","challenge","chase","cheat","chew","claim","clap","classify","combine","comment","communicate","compare","compete","complain","concentrate","conclude","confirm","confuse","congratulate","conquer","consist","contact","contribute","control","convince","cooperate","copy","correct","cure","damage","dare","declare","decrease","defeat","defend","define","delay","deliver","demand","deny","depend","deserve","design","desire","destroy","develop","disagree","disappear","disappoint","distribute","disturb","double","doubt","drag","earn","educate","embarrass","employ","encourage","ensure","entertain","escape","examine","exchange","exist","expand","experience","express","extend","fasten","film","fold","force","frighten","gather","generate","glance","govern","grab","greet","handle","harm","heal","hesitate","identify","ignore","illustrate","imagine","imitate","impress","include","increase","indicate","influence","inform","injure","inspire","install","instruct","intend","interrupt","introduce","invent","investigate","involve","join","judge","kiss","knock","label","launch","link","list","locate","lock","manage","manufacture","march","measure","melt","mend","mention","mind","murder","obey","observe","obtain","occupy","offend","operate","organize","owe","pack","paint","participate","perform","persuade","pick","plant","please","point","polish","possess","pour","practice","praise","prefer","prepare","present","preserve","pretend","prevent","produce","promise","pronounce","protect","provide","publish","punish","realize","recognize","recommend","record","reduce","refuse","regret","reject","relate","relax","release","remember","remind","remove","repair","repeat","replace","reply","report","represent","require","rescue","respect","respond","retire","reveal","review","reward","rob","rub","ruin","satisfy","scratch","seal","search","separate","settle","shape","share","shave","shout","sign","slip","smell","solve","sort","spell","spoil","spray","squeeze","stare","start","state","stay","steer","stir","strengthen","stretch","study","succeed","suffer","suggest","supply","support","suppose","surround","survive","suspect","switch","talk","taste","tease","threaten","tidy","tip","trace","train","translate","travel","treat","trust","type","unite","use","vary","visit","vote","warn","waste","weigh","whisper","wipe","wonder","worry","wrap","yawn","yell"],
  nl: ["aankleden","aanraken","afmaken","antwoorden","bewaren","bestuderen","controleren","dromen","fietsen","filmen","fluisteren","groeten","haasten","herstellen","herinneren","kammen","kloppen","koppelen","letten","markeren","melden","missen","mompelen","noemen","oefenen","ontmoeten","ontspannen","openen","pakken","parkeren","planten","poetsen","redden","regelen","registreren","rekenen","schilderen","slepen","sparen","spelen","stoppen","strepen","tekenen","tellen","trainen","vegen","verbeteren","verbranden","verdienen","vergroten","verhuizen","verkleinen","vermenigvuldigen","verminderen","veroorzaken","versieren","vertalen","verwarmen","verzamelen","voorbereiden","wandelen","wensen","wisselen","zorgen"],
  fr: ["accélérer","accepter","accompagner","accrocher","accuser","acheter","admirer","adorer","affirmer","ajouter","allumer","améliorer","amuser","analyser","annoncer","apercevoir","apprécier","approcher","arrêter","arroser","assurer","attacher","attaquer","attraper","augmenter","avaler","avancer","bâiller","baisser","balayer","bavarder","blesser","boucher","bouger","briller","brosser","brûler","cacher","calculer","calmer","camper","casser","causer","cesser","changer","chanter","charger","chasser","chauffer","chercher","classer","coller","commander","comparer","compléter","compliquer","compter","conserver","consulter","continuer","copier","corriger","coucher","couper","crier","critiquer","cultiver","danser","déchirer","décider","déclarer","décorer","découper","décrire","défendre","dégoûter","déjeuner","demander","démolir","dépenser","déranger","dessiner","détester","deviner","dîner","diriger","discuter","distribuer","diviser","donner","doubler","durer","échanger","échouer","éclairer","économiser","écouter","effacer","embrasser","emmener","emprunter","encourager","enfermer","enlever","enseigner","entourer","entrer","envoyer","épargner","espérer","essayer","essuyer","étaler","éteindre","étonner","étudier","éviter","examiner","exiger","expliquer","exprimer","fabriquer","fâcher","faciliter","fatiguer","fermer","fêter","filmer","fixer","former","fournir","frapper","frotter","gagner","garder","gâter","goûter","grandir","gratter","griller","habiller","habiter","hésiter","identifier","ignorer","imaginer","imiter","indiquer","insister","installer","interroger","inventer","inviter","jeter","jouer","juger","laisser","laver","lever","libérer","limiter","livrer","louer","manquer","marcher","marquer","mélanger","menacer","mériter","mesurer","modifier","monter","montrer","mordre","nager","négliger","nettoyer","noter","obliger","observer","occuper","offrir","organiser","oser","oublier","pardonner","parler","partager","participer","passer","patiner","pêcher","peindre","penser","percer","perdre","photographier","piquer","placer","plaisanter","pleurer","plier","plonger","porter","poser","posséder","pousser","préférer","préparer","présenter","prêter","prier","produire","profiter","programmer","prononcer","proposer","protéger","prouver","punir","quitter","raconter","ralentir","ramasser","ranger","rappeler","rapporter","rassurer","réagir","réaliser","recevoir","réchauffer","recommander","réfléchir","refuser","regarder","régler","regretter","remarquer","remercier","remplacer","remplir","rencontrer","renforcer","renverser","réparer","répéter","répondre","reposer","représenter","réserver","résoudre","respecter","ressembler","rester","retenir","retirer","réunir","réussir","réveiller","réviser","rouler","sauter","sauver","sécher","sembler","séparer","serrer","servir","signer","situer","soigner","souffler","souhaiter","soulever","soupçonner","sourire","subir","supporter","supposer","surveiller","taper","téléphoner","terminer","tirer","tomber","toucher","tourner","tousser","tracer","traduire","trahir","traîner","traiter","transformer","transporter","travailler","traverser","tremper","tricher","tromper","trouver","utiliser","vendre","vérifier","verser","viser","visiter","voler","voter","voyager"]
};

function verbPool(langCode) {
  const eng = window.CONJ[langCode];
  const set = new Set(eng.samples || []);
  (eng.irregulars || []).forEach((v) => set.add(v));
  (EXTRA_VERBS[langCode] || []).forEach((v) => set.add(v));
  (EXTRA_VERBS2[langCode] || []).forEach((v) => set.add(v));
  if (langCode === "es" || langCode === "en") (EXTRA_VERBS3[langCode] || []).forEach((v) => set.add(v));
  const trd = window.TRANS[langCode];
  if (trd) Object.keys(trd).forEach((k) => set.add(k));
  const idx = _LIDX[langCode];
  if (idx != null) CONCEPTS.forEach((row) => {if (row[idx]) set.add(row[idx]);});
  return Array.from(set);
}

/* Quiz pool graded by learner level:
   beginner = common verbs + most-frequent irregulars;
   intermediate = + all irregulars + extra common batch;
   advanced = everything available. */
function quizPool(langCode, skill) {
  const eng = window.CONJ[langCode];
  const irr = eng.irregulars || [];
  const set = new Set();
  (eng.samples || []).forEach((v) => set.add(v));
  (EXTRA_VERBS[langCode] || []).forEach((v) => set.add(v));
  if (skill === "beginner") {
    irr.slice(0, 24).forEach((v) => set.add(v));
  } else {
    irr.forEach((v) => set.add(v));
    (EXTRA_VERBS2[langCode] || []).forEach((v) => set.add(v));
  }
  if (skill === "advanced") {
    if (langCode === "es" || langCode === "en") (EXTRA_VERBS3[langCode] || []).forEach((v) => set.add(v));
    const trd = window.TRANS[langCode];
    if (trd) Object.keys(trd).forEach((k) => set.add(k));
  }
  return Array.from(set);
}

/* Is the raw input a known dictionary (infinitive) verb? We check pool
   membership rather than "does it conjugate", because German/Dutch accept any
   -en word as an infinitive — which would hide participles like "gegessen". */
function isKnownInfinitive(langCode, raw) {
  const v = (raw || "").trim().toLowerCase().replace(/^to /, "");
  if (!v) return false;
  return verbPool(langCode).indexOf(v) >= 0;
}

/* Infinitive endings per language, ordered by how common/productive the class
   is (first = highest priority when an ending is ambiguous). */
const INF_SUF = { es: ["ar", "er", "ir"], fr: ["er", "re", "ir"], de: ["en", "n"], nl: ["en", "n"], en: [] };

/* Generate plausible infinitives for an inflected form, to be *verified* by
   re-conjugation. For es/fr/de/nl: the infinitive is either a prefix of the
   form (future/conditional are built on the infinitive) or stem+ending. */
function ruleCandidates(langCode, input) {
  if (langCode === "en") return enCandidates(input);
  const suf = INF_SUF[langCode] || [];
  const set = new Set();
  const L = input.length;
  for (let k = Math.max(2, L - 7); k <= L; k++) {
    const pre = input.slice(0, k);
    set.add(pre);
    suf.forEach((s) => set.add(pre + s));
  }
  return Array.from(set).filter((c) => c.length >= 2 && suf.some((s) => c.endsWith(s)));
}
function enCandidates(w) {
  const c = new Set();
  const undbl = (s) => s.length > 1 && s[s.length - 1] === s[s.length - 2] ? s.slice(0, -1) : null;
  if (w.endsWith("ing")) {const s = w.slice(0, -3);c.add(s);c.add(s + "e");const d = undbl(s);if (d) c.add(d);}
  if (w.endsWith("ied")) {c.add(w.slice(0, -3) + "y");}
  if (w.endsWith("ed")) {const s = w.slice(0, -2);c.add(s);c.add(s + "e");const d = undbl(s);if (d) c.add(d);c.add(w.slice(0, -1));}
  if (w.endsWith("ies")) {c.add(w.slice(0, -3) + "y");}
  if (w.endsWith("es")) {c.add(w.slice(0, -2));c.add(w.slice(0, -1));}
  if (w.endsWith("s") && !w.endsWith("ss")) {c.add(w.slice(0, -1));}
  return Array.from(c).filter((x) => x.length >= 2);
}
/* When several made-up infinitives verify (ambiguous ending), keep only the
   best one: the shortest base (bogus reconstructions embed inflectional letters
   into the stem, so they are longer), then the most productive verb-class. */
function pruneGuess(langCode, groups) {
  let min = Infinity;
  groups.forEach((g) => {min = Math.min(min, g.base.length);});
  Array.from(groups.entries()).forEach(([k, g]) => {if (g.base.length > min) groups.delete(k);});
  const order = INF_SUF[langCode] || [];
  if (order.length) {
    const pri = (b) => {for (let k = 0; k < order.length; k++) if (b.endsWith(order[k])) return order.length - k;return 0;};
    let best = 0;groups.forEach((g) => {best = Math.max(best, pri(g.base));});
    Array.from(groups.entries()).forEach(([k, g]) => {if (pri(g.base) < best) groups.delete(k);});
  }
}

function deconjugate(langCode, raw) {
  const input = norm(raw);
  if (!input) return null;
  const eng = window.CONJ[langCode];
  const pool = verbPool(langCode);
  const groups = new Map(); // inf|tenseId -> analysis
  const dinput = deburr(input);

  function record(r, t, i, allSame) {
    const ib = infBase(langCode, r.infinitive);
    const key = ib + "|" + t.id;
    let g = groups.get(key);
    if (!g) {g = { infinitive: r.infinitive, base: ib, isIrregular: r.isIrregular, tenseId: t.id, tenseLabel: t.label, indices: [], pronouns: [], noPerson: allSame };groups.set(key, g);}
    if (g.indices.indexOf(i) < 0) {g.indices.push(i);g.pronouns.push(r.pronouns[i]);}
  }
  function scan(matchFn) {
    pool.forEach((cand) => {
      const r = eng.conjugate(cand);
      if (!r || r.error) return;
      r.tenses.forEach((t) => {
        if (!t.forms) return;
        const allSame = t.forms.every((f) => f === t.forms[0]);
        t.forms.forEach((f, i) => {if (f && f !== "—" && matchFn(norm(f))) record(r, t, i, allSame);});
      });
    });
  }

  scan((f) => f === input); // 1) exact full-form match

  if (groups.size === 0) {// 2) bare participle / gerund inside compound tenses
    const isGerund = /(ndo|ant|ing)$/.test(input); // -ndo (es), -ant (fr), -ing (en)
    pool.forEach((cand) => {
      const r = eng.conjugate(cand);
      if (!r || r.error) return;
      r.tenses.forEach((t) => {
        if (!t.forms) return;
        t.forms.forEach((f) => {
          if (!f || f === "—" || f.indexOf(" ") < 0) return;
          if (norm(f.split(" ").pop()) === input) {
            const ib = infBase(langCode, r.infinitive);
            const key = ib + (isGerund ? "|__ger" : "|__pp");
            if (!groups.has(key)) groups.set(key, { infinitive: r.infinitive, base: ib, isIrregular: r.isIrregular, tenseId: isGerund ? "gerund" : "participle", tenseLabel: isGerund ? tr("dq_gerund") : tr("dq_participle"), indices: [], pronouns: [], noPerson: true });
          }
        });
      });
    });
  }

  let fuzzy = false;
  if (groups.size === 0 && dinput !== input) {// 3) accent-insensitive fallback
    fuzzy = true;
    scan((f) => deburr(f) === dinput);
  }

  let guessed = false;
  if (groups.size === 0) {// 4) rule-based reconstruction (verified by re-conjugation)
    const isGer = /(ndo|ant|ing)$/.test(input);
    ruleCandidates(langCode, input).forEach((cand) => {
      const r = eng.conjugate(cand);
      if (!r || r.error) return;
      if (infBase(langCode, r.infinitive) !== cand) return; // candidate must be its own clean infinitive
      r.tenses.forEach((t) => {
        if (!t.forms) return;
        const allSame = t.forms.every((f) => f === t.forms[0]);
        t.forms.forEach((f, i) => {
          if (!f || f === "—") return;
          if (norm(f) === input) record(r, t, i, allSame);else
          if (f.indexOf(" ") >= 0 && norm(f.split(" ").pop()) === input) {
            const ib = infBase(langCode, r.infinitive);
            const key = ib + (isGer ? "|__ger" : "|__pp");
            if (!groups.has(key)) groups.set(key, { infinitive: r.infinitive, base: ib, isIrregular: r.isIrregular, tenseId: isGer ? "gerund" : "participle", tenseLabel: isGer ? tr("dq_gerund") : tr("dq_participle"), indices: [], pronouns: [], noPerson: true });
          }
        });
      });
    });
    if (groups.size > 0) {guessed = true;pruneGuess(langCode, groups);}
  }

  if (groups.size === 0) return null;
  const analyses = Array.from(groups.values());
  const infinitives = [];
  analyses.forEach((a) => {if (!infinitives.some((x) => x.base === a.base)) infinitives.push({ infinitive: a.infinitive, base: a.base, isIrregular: a.isIrregular });});
  return { input: (raw || "").trim(), analyses, infinitives, fuzzy, guessed };
}

/* ---------- Sponsor slot (single contextual recommendation) ---------- */
/* Swap these objects to change the paying partner per language. */
const SPONSORS = {
  de: { name: "DeutschDaily", letter: "D", color: "#ff3b5c", tag: "Spaced-repetition trainer for German verbs", link: "https://example.com/de" },
  es: { name: "Verbaes", letter: "V", color: "#ff9f0a", tag: "Master Spanish tenses with 5-min drills", link: "https://example.com/es" },
  en: { name: "FluentList", letter: "F", color: "#0a84ff", tag: "Build English fluency in 5 minutes a day", link: "https://example.com/en" },
  nl: { name: "NederLearn", letter: "N", color: "#30c95a", tag: "Practice Dutch verbs the smart way", link: "https://example.com/nl" },
  fr: { name: "ParlezPlus", letter: "P", color: "#a557ff", tag: "Your interactive French grammar coach", link: "https://example.com/fr" }
};

function AdCard({ sponsor, hook, onClick, onDismiss }) {
  return (
    <div className="adcard">
      <div className="adcard-top">
        <span className="adlabel"><span className="addot"></span>{tr("recommended")}</span>
        <button className="adclose" title="Dismiss" onClick={onDismiss}>×</button>
      </div>
      <div className="adcard-body">
        <div className="adicon" style={{ background: sponsor.color }}>{sponsor.letter}</div>
        <div className="adtext">
          <div className="adtitle">{hook}</div>
          <div className="addesc">{sponsor.name} · {sponsor.tag}</div>
        </div>
      </div>
      <a className="adcta" href={sponsor.link} target="_blank" rel="noopener noreferrer" onClick={onClick}>{tr("ad_cta")}</a>
    </div>);

}

/* Cross-language verb equivalents (all chosen to conjugate correctly). Order: de, es, en, nl, fr */
const CONCEPTS = [
["sein", "ser", "be", "zijn", "être"],
["haben", "tener", "have", "hebben", "avoir"],
["gehen", "ir", "go", "gaan", "aller"],
["kommen", "venir", "come", "komen", "venir"],
["machen", "hacer", "make", "maken", "faire"],
["sehen", "ver", "see", "zien", "voir"],
["essen", "comer", "eat", "eten", "manger"],
["trinken", "beber", "drink", "drinken", "boire"],
["sprechen", "hablar", "speak", "spreken", "parler"],
["wollen", "querer", "want", "willen", "vouloir"],
["können", "poder", "can", "kunnen", "pouvoir"],
["wissen", "saber", "know", "weten", "savoir"],
["geben", "dar", "give", "geven", "donner"],
["nehmen", "tomar", "take", "nemen", "prendre"],
["finden", "encontrar", "find", "vinden", "trouver"],
["schreiben", "escribir", "write", "schrijven", "écrire"],
["lesen", "leer", "read", "lezen", "lire"],
["schlafen", "dormir", "sleep", "slapen", "dormir"],
["arbeiten", "trabajar", "work", "werken", "travailler"],
["kaufen", "comprar", "buy", "kopen", "acheter"],
["wohnen", "vivir", "live", "wonen", "vivre"],
["sagen", "decir", "say", "zeggen", "dire"],
["fahren", "conducir", "drive", "rijden", "conduire"],
["spielen", "jugar", "play", "spelen", "jouer"],
["helfen", "ayudar", "help", "helpen", "aider"],
["bringen", "traer", "bring", "brengen", "apporter"],
["denken", "pensar", "think", "denken", "penser"]];

const _LIDX = { de: 0, es: 1, en: 2, nl: 3, fr: 4 };
function conceptTranslate(verb, from, to) {
  const v = (verb || "").trim().toLowerCase();
  const fi = _LIDX[from],ti = _LIDX[to];
  for (const row of CONCEPTS) {if (row[fi] === v) return row[ti];}
  return null;
}

/* Verb meaning in the learner's mother tongue, when we can know it instantly
   (same language, a built-in cross-language equivalent, or the English gloss). */
function nativeMeaningInstant(langCode, base, nativeName) {
  const nCode = NATIVE_TO_UI[nativeName];
  if (nCode === langCode) return base;
  if (nCode) {const ct = conceptTranslate(base, langCode, nCode);if (ct) return ct;}
  if (nativeName === "English") {const m = window.lookupMeaning(langCode, base);if (m) return m;}
  return null;
}

/* Formal vs informal address hint per language */
const FORMALITY = {
  de: "du = informal · Sie = formal (polite)",
  es: "tú = informal · usted (uses 3rd person) = formal",
  en: "English uses one “you” for everyone",
  nl: "jij/je = informal · u = formal",
  fr: "tu = informal · vous = formal or plural"
};

/* Reflexive verb support (wrapper around the base engines) */
const REFLEX = {
  es: { detect: (v) => /(ar|er|ir)se$/.test(v), strip: (v) => v.slice(0, -2), pron: ["me", "te", "se", "nos", "os", "se"], place: "before" },
  fr: { detect: (v) => /^se /.test(v) || /^s'/.test(v), strip: (v) => v.replace(/^se /, "").replace(/^s'/, ""), pron: ["me", "te", "se", "nous", "vous", "se"], place: "before", elide: true },
  de: { detect: (v) => /^sich /.test(v), strip: (v) => v.replace(/^sich /, ""), pron: ["mich", "dich", "sich", "uns", "euch", "sich"], place: "after" },
  nl: { detect: (v) => /^zich /.test(v), strip: (v) => v.replace(/^zich /, ""), pron: ["me", "je", "zich", "ons", "je", "zich"], place: "after" }
};
function conjugateMaybeReflexive(langCode, input) {
  const eng = window.CONJ[langCode];
  const v = (input || "").trim().toLowerCase();
  const R = REFLEX[langCode];
  if (R && R.detect(v)) {
    const r = eng.conjugate(R.strip(v));
    if (!r || r.error) return r;
    // French reflexive compound tenses take être, not avoir
    const FR_ETRE = { ai: "suis", as: "es", a: "est", avons: "sommes", avez: "êtes", ont: "sont", avais: "étais", avait: "était", avions: "étions", aviez: "étiez", avaient: "étaient" };
    const out = Object.assign({}, r, { infinitive: v, reflexive: true });
    out.tenses = r.tenses.map((t) => ({
      id: t.id, label: t.label, reg: null,
      forms: t.forms.map((f, i) => {
        if (!f || f === "—") return f;
        const p = R.pron[i];
        let form = f;
        if (langCode === "fr" && /perfect/.test(t.id)) {
          form = form.replace(/^(\S+)/, (w) => FR_ETRE[w] || w); // avoir → être
        }
        if (R.place === "after") {
          // pronoun goes right after the finite (first) word: "habe mich gefreut"
          const parts = form.split(" ");
          if (parts.length === 1) return parts[0] + " " + p;
          return parts[0] + " " + p + " " + parts.slice(1).join(" ");
        }
        // before (es/fr): clitic precedes the whole verb cluster
        if (R.elide && /^[aeiouhâàéèêïî]/i.test(form) && (p === "me" || p === "te" || p === "se")) return p[0] + "'" + form;
        return p + " " + form;
      })
    }));
    return out;
  }
  return eng.conjugate(input);
}

/* Accent helper keys per language */
const ACCENTS = {
  de: ["ä", "ö", "ü", "ß"],
  es: ["á", "é", "í", "ó", "ú", "ñ", "ü", "¿", "¡"],
  fr: ["à", "â", "ç", "é", "è", "ê", "ë", "î", "ï", "ô", "û", "ù", "œ"],
  nl: ["ë", "ï", "é"],
  en: []
};
function AccentBar({ lang, onInsert }) {
  return null; // removed per request — users type accents on their own keyboard
}

/* Mistakes pool (wrong answers, per language) */
function mKey(m) {return m.verb + "|" + m.tenseLabel + "|" + m.pronoun;}
function getMistakes(lang) {return recall("kunju-mistakes-" + lang, []);}
function addMistake(lang, q) {
  const list = getMistakes(lang);
  if (list.some((m) => mKey(m) === mKey(q))) return;
  list.unshift({ verb: q.verb, tenseLabel: q.tenseLabel, pronoun: q.pronoun, answer: q.answer, options: q.options, isIrregular: q.isIrregular, ttsLang: q.ttsLang, lang });
  persist("kunju-mistakes-" + lang, list.slice(0, 40));
}
function removeMistake(lang, q) {
  persist("kunju-mistakes-" + lang, getMistakes(lang).filter((m) => mKey(m) !== mKey(q)));
}
/* Sentence-mistakes pool (wrong/unknown sentences), per target language. */
function getSentMist(tc) {return recall("kunju-sentmist-" + tc, []);}
function addSentMist(tc, s) {if (!s || !s.t) return;const list = getSentMist(tc);if (list.some((x) => x.t === s.t)) return;list.unshift({ n: s.n, t: s.t });persist("kunju-sentmist-" + tc, list.slice(0, 40));}
function removeSentMist(tc, s) {if (!s) return;persist("kunju-sentmist-" + tc, getSentMist(tc).filter((x) => x.t !== s.t));}

/* Daily goal + streak */
const DAILY_GOAL = 12;
function getPersonalGoal() {
  const g = recall("kunju-goal-data", null);
  return (g && g.perDay) ? g.perDay : DAILY_GOAL;
}
function readDaily() {
  const today = new Date().toDateString();
  const y = new Date(Date.now() - 86400000).toDateString();
  const d = recall("kunju-daily", { date: "", count: 0 });
  const st = recall("kunju-streak", { last: "", streak: 0, best: 0 });
  const count = d.date === today ? d.count : 0;
  let streak = st.streak || 0;
  if (st.last !== today && st.last !== y) streak = 0;
  return { count, goal: getPersonalGoal(), streak, best: st.best || 0 };
}
function bumpDaily() {
  const today = new Date().toDateString();
  const y = new Date(Date.now() - 86400000).toDateString();
  let d = recall("kunju-daily", { date: "", count: 0 });
  if (d.date !== today) d = { date: today, count: 0 };
  d.count += 1; persist("kunju-daily", d);
  let st = recall("kunju-streak", { last: "", streak: 0, best: 0 });
  if (d.count >= getPersonalGoal() && st.last !== today) {
    st.streak = st.last === y ? (st.streak || 0) + 1 : 1;
    st.last = today; st.best = Math.max(st.best || 0, st.streak);
    persist("kunju-streak", st);
  }
  return readDaily();
}

/* Export / share a conjugation */
const PROMO = [
["DE", "Verben konjugieren, üben & lernen"],
["EN", "conjugate, quiz & learn verbs"],
["ES", "conjuga, practica y aprende verbos"],
["NL", "werkwoorden vervoegen, oefenen & leren"],
["FR", "conjuguer, réviser & apprendre"]];

const PROMO_H = 234;
function makeConjCanvas(result, langCode, meaning) {
  const eng = window.CONJ[langCode];
  const RB = ["#ff3b5c", "#ff7a18", "#ffc400", "#34c759", "#00bcd4", "#0a84ff", "#a557ff", "#ff5ea8"];
  const W = 880,pad = 46,lineH = 32,headH = 150,tenseGap = 20;
  const H = headH + result.tenses.reduce((a, t) => a + 40 + t.forms.length * lineH + tenseGap, 0) + PROMO_H;
  const c = document.createElement("canvas");
  const SC = 2;c.width = W * SC;c.height = H * SC;
  const x = c.getContext("2d");x.scale(SC, SC);
  x.fillStyle = "#f6f7fb";x.fillRect(0, 0, W, H);
  x.fillStyle = "#ffffff";x.fillRect(0, 0, W, headH - 16);
  const grad = x.createLinearGradient(0, 0, W, 0);
  ["#ff3b5c", "#ff7a18", "#ffc400", "#34c759", "#00bcd4", "#0a84ff", "#a557ff"].forEach((col, i, arr) => grad.addColorStop(i / (arr.length - 1), col));
  x.fillStyle = grad;x.fillRect(0, 0, W, 10);
  x.fillStyle = "#14151a";x.font = "700 46px sans-serif";x.fillText(result.infinitive, pad, 78);
  x.fillStyle = "#707888";x.font = "500 19px sans-serif";
  x.fillText(eng.name + (meaning ? "  ·  " + meaning : ""), pad, 108);
  // regular/irregular pill
  const pillTxt = result.isIrregular ? "irregular" : "regular";
  x.font = "600 14px sans-serif";const pw = x.measureText(pillTxt).width + 22;
  x.fillStyle = result.isIrregular ? "#ffe3cc" : "#d6f5e0";roundRect(x, pad, 120, pw, 24, 12);x.fill();
  x.fillStyle = result.isIrregular ? "#d4660a" : "#1a9b46";x.fillText(pillTxt, pad + 11, 137);
  x.fillStyle = "#a557ff";x.font = "700 16px sans-serif";x.textAlign = "right";x.fillText("ConjuExpert", W - pad, 78);x.textAlign = "left";
  let y = headH + 18;
  result.tenses.forEach((t, ti) => {
    x.fillStyle = RB[ti % RB.length];roundRect(x, pad, y - 15, 12, 12, 3);x.fill();
    x.fillStyle = "#14151a";x.font = "600 22px sans-serif";x.fillText(t.label, pad + 24, y + 2);
    y += 36;
    t.forms.forEach((f, i) => {
      if (i % 2 === 0) {x.fillStyle = "#ffffff";x.fillRect(pad, y - 21, W - pad * 2, lineH);}
      x.fillStyle = "#9098a8";x.font = "15px sans-serif";x.fillText(result.pronouns[i], pad + 14, y);
      x.fillStyle = "#14151a";x.font = "600 18px monospace";x.fillText(f, pad + 210, y);
      y += lineH;
    });
    y += tenseGap;
  });
  // promo / ad block
  const py = H - PROMO_H + 8;
  x.fillStyle = "#101018";x.fillRect(0, py, W, PROMO_H - 8);
  x.fillStyle = grad;x.fillRect(0, py, W, 5);
  x.fillStyle = "#ffffff";x.font = "700 24px sans-serif";x.fillText("Conju", pad, py + 44);
  const cw = x.measureText("Conju").width;x.fillStyle = "#a557ff";x.fillText("Expert", pad + cw, py + 44);
  x.fillStyle = "#8a93b0";x.font = "500 14px sans-serif";x.textAlign = "right";x.fillText("free verb conjugator", W - pad, py + 44);x.textAlign = "left";
  PROMO.forEach((p, i) => {
    const ly = py + 78 + i * 23;
    x.fillStyle = "#6b7390";x.font = "700 12px sans-serif";x.fillText(p[0], pad, ly);
    x.fillStyle = "#dfe2ee";x.font = "15px sans-serif";x.fillText(p[1], pad + 36, ly);
  });
  x.fillStyle = "#ffd24a";x.font = "600 16px sans-serif";
  x.fillText("📱  Download free — iOS App Store · Google Play", pad, py + 78 + 5 * 23 + 12);
  return c;
}
function roundRect(x, rx, ry, w, h, r) {x.beginPath();x.moveTo(rx + r, ry);x.arcTo(rx + w, ry, rx + w, ry + h, r);x.arcTo(rx + w, ry + h, rx, ry + h, r);x.arcTo(rx, ry + h, rx, ry, r);x.arcTo(rx, ry, rx + w, ry, r);x.closePath();}
function canvasToBlob(c) {return new Promise((res) => c.toBlob(res, "image/png"));}
function fileName(result, langCode) {return result.infinitive.replace(/[^\p{L}]/gu, "_") + "_" + langCode;}

function exportImage(result, langCode, meaning) {
  makeConjCanvas(result, langCode, meaning).toBlob((b) => {
    if (!b) return;
    const u = URL.createObjectURL(b);const a = document.createElement("a");
    a.href = u;a.download = fileName(result, langCode) + ".png";a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1500);
  }, "image/png");
}

function exportPDF(result, langCode, meaning) {
  const eng = window.CONJ[langCode];
  const native = recall("kunju-native", "German");
  const skill = recall("kunju-skill", "beginner");
  const sec = result.tenses.map((t) => {
    const rows = t.forms.map((f, i) => `<tr><td class="p">${esc(result.pronouns[i])}</td><td class="f">${esc(f)}</td></tr>`).join("");
    const ex = recall(`kunju-tex2-${langCode}-${result.infinitive}-${t.id}-${native}-${skill}`, null);
    const exHtml = ex && ex.s ? `<div class="ex"><span class="exs">${fmtVerbMark(ex.s)}</span>${ex.n ? `<span class="exn">${esc(ex.n)}</span>` : ""}</div>` : "";
    return `<div class="tense"><h3>${esc(t.label)}</h3><table>${rows}</table>${exHtml}</div>`;
  }).join("");
  const LC = {DE:"#ff3b5c",EN:"#0a84ff",ES:"#ff9f0a",NL:"#30c95a",FR:"#a557ff"};
  const MARK = '<div class="mark"><i style="background:#ff3b5c"></i><i style="background:#ff7a18"></i><i style="background:#ffc400"></i><i style="background:#34c759"></i><i style="background:#0a84ff"></i></div>';
  const RB = '<div class="rb"></div>';
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(result.infinitive)} — ConjuExpert</title>
<style>
@page{margin:1.4cm 1.6cm}
*{box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#14151a;margin:0;padding:0;background:#fff}
.wrap{padding:0 0 32px}
.rb{height:5px;background:linear-gradient(90deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff)}
.hdr{display:flex;align-items:center;gap:11px;padding:18px 0 16px;border-bottom:1px solid #f0f1f4}
.mark{display:grid;grid-template-columns:repeat(5,1fr);gap:3px;width:30px;height:30px;padding:4px;background:#f7f8fb;border-radius:8px;border:1px solid #e8eaef;flex:none}
.mark i{display:block;border-radius:2px}
.bname{font-size:18px;font-weight:600;letter-spacing:-.02em;color:#14151a;line-height:1.1}
.bname b{font-weight:700;background:linear-gradient(90deg,#0a84ff,#a557ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.btag{font-size:10.5px;color:#9098a8;letter-spacing:.04em;display:block;margin-top:1px}
.verb{padding:20px 0 2px;display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
h1{font-size:38px;font-weight:800;margin:0;letter-spacing:-.03em}
.vtag{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:4px 9px;border-radius:7px;background:#f0f1f4;color:#6b7390;align-self:center}
.sub{color:#9098a8;font-size:13.5px;margin:2px 0 18px;font-weight:500}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 28px}
.tense{break-inside:avoid;margin-bottom:10px}
h3{font-size:11.5px;font-weight:700;margin:0 0 4px;letter-spacing:.08em;text-transform:uppercase;color:#b0b7c8;border-bottom:1px solid #f0f1f4;padding-bottom:3px}
table{width:100%;border-collapse:collapse}
td{padding:2.5px 0;font-size:13.5px}
.p{color:#c0c7d4;width:40%}
.f{font-family:ui-monospace,SFMono-Regular,monospace;font-weight:700;color:#14151a}
.foot{margin-top:28px;padding-top:20px;border-top:1px solid #f0f1f4}
.fhdr{display:flex;align-items:center;gap:11px;margin-bottom:14px}
.fmark{display:grid;grid-template-columns:repeat(5,1fr);gap:2px;width:24px;height:24px;padding:3px;background:#f7f8fb;border-radius:6px;border:1px solid #e8eaef;flex:none}
.fmark i{display:block;border-radius:1px}
.fname{font-size:15px;font-weight:600;letter-spacing:-.02em;color:#14151a}
.fname b{font-weight:700;background:linear-gradient(90deg,#0a84ff,#a557ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.ftag{font-size:10px;color:#9098a8;display:block;margin-top:1px}
.langs{display:grid;grid-template-columns:1fr 1fr;gap:5px 20px;margin-bottom:14px}
.lang{font-size:12.5px;color:#555;display:flex;gap:9px;align-items:center}
.lc{font-size:9.5px;font-weight:700;letter-spacing:.1em;min-width:22px;font-family:ui-monospace,monospace}
.url{font-weight:700;font-size:13px;background:linear-gradient(90deg,#0a84ff,#a557ff);-webkit-background-clip:text;background-clip:text;color:transparent;margin-top:10px;display:block}
.ex{margin-top:5px;padding:5px 0 0;border-top:1px dashed #edf0f5}
.exs{display:block;font-size:12px;color:#3a3f52;font-style:italic;line-height:1.45}
.exs b{color:#0a84ff;font-style:normal;font-weight:700}
.exn{display:block;font-size:11px;color:#b0b7c8;margin-top:1px}
.rb-b{margin-top:20px}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head>
<body>
${RB}
<div class="wrap">
  <div class="hdr">
    ${MARK}
    <div>
      <span class="bname">Conju<b>Expert</b></span>
      <span class="btag">KI-Konjugationstrainer · 5 Sprachen</span>
    </div>
  </div>
  <div class="verb"><h1>${esc(result.infinitive)}</h1><span class="vtag">${esc(eng.name)}</span></div>
  <p class="sub">${result.isIrregular ? "unregelmäßig" : "regelmäßig"}${meaning ? " · " + esc(meaning) : ""}</p>
  <div class="grid">${sec}</div>
  <div class="foot">
    <div class="fhdr">
      <div class="fmark"><i style="background:#ff3b5c"></i><i style="background:#ff7a18"></i><i style="background:#ffc400"></i><i style="background:#34c759"></i><i style="background:#0a84ff"></i></div>
      <div><span class="fname">Conju<b>Expert</b></span><span class="ftag">Verben konjugieren, üben &amp; lernen — kostenlos</span></div>
    </div>
    <div class="langs">
      ${PROMO.map((p) => `<div class="lang"><span class="lc" style="color:${LC[p[0]]||"#9098a8"}">${p[0]}</span>${esc(p[1])}</div>`).join("")}
    </div>
    <span class="url">conjuexpert.app</span>
  </div>
</div>
${RB}
<script>onload=function(){setTimeout(function(){window.print()},400)}<\/script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();w.document.write(html);w.document.close();
}

function rateApp() {
  window.open("https://conjuexpert.app/bewertungen/", "_blank");
}

async function shareApp() {
  const lang = (navigator.language || navigator.userLanguage || "en").toLowerCase().slice(0, 2);
  const slogans = {
    de: { title: "ConjuExpert — KI-Support für 5 Sprachen 🌍", text: "🌍✨ 5 Sprachen. KI-Support. Ein Klick.\n\nMit ConjuExpert konjugierst du Verben auf Deutsch, Spanisch, Englisch, Niederländisch & Französisch – mit KI-Support. Sofort. Kostenlos. Kein Download nötig.", copied: "Link kopiert – einfach in WhatsApp, Instagram oder eine E-Mail einfügen! 🎉" },
    es: { title: "ConjuExpert — Soporte IA para 5 idiomas 🌍", text: "🌍✨ 5 idiomas. Soporte IA. Un clic.\n\nCon ConjuExpert conjugas verbos en alemán, español, inglés, neerlandés y francés – con soporte de IA. Al instante. Gratis. Sin descargas.", copied: "¡Enlace copiado – pégalo en WhatsApp, Instagram o un correo! 🎉" },
    nl: { title: "ConjuExpert — AI-ondersteuning voor 5 talen 🌍", text: "🌍✨ 5 talen. AI-ondersteuning. Één klik.\n\nMet ConjuExpert vervoeg je werkwoorden in het Duits, Spaans, Engels, Nederlands & Frans – met AI-ondersteuning. Direct. Gratis. Geen download nodig.", copied: "Link gekopieerd – plak het in WhatsApp, Instagram of een e-mail! 🎉" },
    fr: { title: "ConjuExpert — Support IA pour 5 langues 🌍", text: "🌍✨ 5 langues. Support IA. Un clic.\n\nAvec ConjuExpert, conjuguez des verbes en allemand, espagnol, anglais, néerlandais et français – avec le support de l'IA. Instantané. Gratuit. Sans téléchargement.", copied: "Lien copié – colle-le dans WhatsApp, Instagram ou un e-mail ! 🎉" },
    en: { title: "ConjuExpert — AI support for 5 languages 🌍", text: "🌍✨ 5 languages. AI support. One click.\n\nWith ConjuExpert you conjugate verbs in German, Spanish, English, Dutch & French – with AI support. Instant. Free. No download needed.", copied: "Link copied – paste it into WhatsApp, Instagram or an email! 🎉" },
  };
  const s = slogans[lang] || slogans.en;
  const shareData = { title: s.title, text: s.text, url: "https://conjuexpert.app" };
  try {
    if (navigator.share) { await navigator.share(shareData); return; }
    await navigator.clipboard.writeText(s.text + "\n\n👉 conjuexpert.app");
    if (window.__toast) window.__toast(s.copied);
  } catch (e) {
    if (e && e.name !== "AbortError") {
      try { await navigator.clipboard.writeText("https://conjuexpert.app"); } catch {}
    }
  }
}

async function shareConjugation(result, langCode, meaning) {
  try {
    const blob = await canvasToBlob(makeConjCanvas(result, langCode, meaning));
    const file = new File([blob], fileName(result, langCode) + ".png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: result.infinitive, text: result.infinitive + " — ConjuExpert" });
      return;
    }
  } catch (e) {if (e && e.name === "AbortError") return;}
  const lines = [result.infinitive + (meaning ? " (" + meaning + ")" : "")];
  result.tenses.forEach((t) => {lines.push("\n" + t.label);result.pronouns.forEach((p, i) => lines.push(p + ": " + t.forms[i]));});
  const text = lines.join("\n") + "\n\n— ConjuExpert";
  try {
    if (navigator.share) {await navigator.share({ title: result.infinitive, text });return;}
    await navigator.clipboard.writeText(text);
    if (window.__toast) window.__toast("Copied to clipboard — paste it into WhatsApp etc.");
  } catch (e) {}
}

/* ---------- Language selector ---------- */
function LanguageBar({ lang, setLang }) {
  return (
    <div className="langbar">
      {LANG_ORDER.map((code) => {
        const meta = LANG_META[code];
        const engine = window.CONJ[code];
        const active = lang === code;
        return (
          <button key={code} className={"langbtn" + (active ? " active" : "")}
          style={active ? { "--lc": meta.color } : {}} onClick={() => setLang(code)}>
            <span className="langstripe" style={{ background: meta.color }}></span>
            <span className="langflag">{meta.code}</span>
            <span className="langname">{engine.name}</span>
          </button>);

      })}
    </div>);

}

/* ---------- Tabs ---------- */
function Tabs({ tab, setTab }) {
  const items = [
  { id: "conjugate", label: tr("tab_conjugate"), icon: "▦" },
  { id: "quiz", label: tr("tab_quiz"), icon: "◆" },
  { id: "grammar", label: tr("tab_learn"), icon: "✦" },
  { id: "saved", label: tr("tab_saved"), icon: "★" }];

  return (
    <div className="tabs">
      <div className="tabs-track">
        {items.map((it) =>
        <button key={it.id} className={"tab" + (tab === it.id ? " active" : "")} onClick={() => setTab(it.id)}>
            <span className="tab-icon">{it.icon}</span><span className="tab-label">{it.label}</span>
          </button>
        )}
      </div>
    </div>);

}

/* ---------- Tense card ---------- */
function TenseCard({ tense, pronouns, color, openDefault, ttsLang, highlight, sound, verb, langCode, engineName, hl, hint }) {
  const [open, setOpen] = useState(openDefault);
  const [tenseEx, setTenseEx] = useState(null);
  const native = recall("kunju-native", "German");

  function fetchTenseEx(fresh, attempt) {
    attempt = attempt || 0;
    const idx = tense.forms.findIndex((f) => f && f !== "—");
    if (idx < 0) return;
    const form = tense.forms[idx];
    const pron = pronouns[idx];
    const skill = recall("kunju-skill", "beginner");
    const key = `kunju-tex2-${langCode}-${verb}-${tense.id}-${native}-${skill}`;
    const cached = recall(key, null);
    if (cached && !fresh) {setTenseEx({ open: true, s: cached.s, n: cached.n });return;}
    if (!window.__hasAI()) {setTenseEx({ open: true, error: 1 });return;}
    const sameLang = native === engineName;
    const splitLang = langCode === "de" || langCode === "nl";
    const isCompound = form.indexOf(" ") >= 0;
    const freshTxt = fresh ? ` Give a DIFFERENT example than usual (variety #${Math.floor(Math.random() * 1000)}).` : "";
    const formInstr = isCompound && splitLang ?
    `that correctly expresses the ${tense.label} of "${verb}" for "${pron}" — its parts are ${form.split(" ").map((p) => `"${p}"`).join(" + ")}. Use natural ${engineName} word order: the finite/auxiliary verb stays in SECOND position and the participle or infinitive moves to the very END of the clause (e.g. "du **hast** mir das Buch gestern **gegeben**"). Wrap EACH of those verb parts in **double asterisks** where they actually stand.` :
    `that uses exactly the verb form "${form}" — the ${tense.label} form (${pron}) of "${verb}". Wrap that exact verb form in **double asterisks**.`;
    const sepNote = splitLang ? ` IMPORTANT: if "${verb}" is a separable-prefix verb (trennbares Verb / scheidbaar werkwoord), split the prefix to the END of the main clause in simple tenses (e.g. "ausbreiten" → "Das Feuer breitete sich schnell aus", NEVER "ausbreitete"; "aufstehen" → "Ich stehe früh auf").` : "";
    const checkNote = ` Before replying, silently PROOFREAD the sentence and guarantee it is 100% correct standard ${engineName}: correct verb position, separable-prefix placement, case government, article/adjective/subject agreement and natural word order. If anything is off, fix it; output ONLY the corrected, fully grammatical sentence.`;
    const lvlNote = skill === "advanced" ? " Use richer C1-level vocabulary and, where natural, a subordinating clause." : skill === "intermediate" ? " Use everyday B1-level vocabulary." : " Use very simple A1–A2 vocabulary (max 7 words total).";
    const prompt = `Write ONE short, natural everyday sentence in ${engineName}${lvlNote} ${formInstr}${freshTxt}${sepNote} The sentence MUST be fully grammatical and idiomatic: use the verb with its correct case government, prepositions and subject (e.g. dative verbs like "gefallen"/"helfen" take a dative object; in German say "auf der Party", not "in der Party"). The sentence MUST end with proper punctuation (. ! or ?).${checkNote} ${sameLang ? `For "n", repeat the same sentence WITHOUT the asterisks.` : `For "n", give a natural ${native} translation of the whole sentence.`} Do NOT use any double-quote (") character inside either sentence. Reply with ONLY minified JSON and nothing else, exactly: {"s":"...","n":"..."}`;
    if (fresh) setTenseEx({ open: true, loading: true });
    window.aiComplete(prompt).then((txt) => {
      let j = null;
      try {j = looseParse(txt);} catch (_) {j = null;}
      if (!j || !j.s) {
        if (attempt < 1) {fetchTenseEx(fresh, attempt + 1);return;}
        setTenseEx({ open: true, error: 1 });return;
      }
      const out = { s: j.s, n: j.n || "" };
      persist(key, out);
      setTenseEx({ open: true, s: out.s, n: out.n });
    }).catch(() => {
      if (attempt < 1) {fetchTenseEx(fresh, attempt + 1);return;}
      setTenseEx({ open: true, error: 1 });
    });
  }
  function toggleTenseEx() {
    if (tenseEx && (tenseEx.s || tenseEx.loading || tenseEx.error)) {
      setTenseEx((prev) => ({ ...prev, open: !prev.open }));
    } else {
      setTenseEx({ open: true, loading: true });
      fetchTenseEx(false);
    }
  }

  const hasAnyForm = tense.forms.some((f) => f && f !== "—");

  return (
    <div className={"tcard" + (open ? " open" : "")} style={{ "--tc": LANG_META[langCode].color, "--dot": color }}>
      <button className="tcard-head" onClick={() => setOpen((o) => !o)}>
        <span className="tcard-dot"></span>
        <span className="tcard-title">{tense.label}{hint && <span className="tcard-hint">{hint}</span>}</span>
        <span className="tcard-caret">{open ? "−" : "+"}</span>
      </button>
      <div className="tcard-body">
        <div className="tcard-rows">
          {tense.forms.map((f, i) => (
            <React.Fragment key={i}>
              <div className={"conjrow" + (hl && hl.indexOf(i) >= 0 ? " matched" : "")}>
                <span className="pron">{pronouns[i]}</span>
                <span className="form" dangerouslySetInnerHTML={{ __html: highlight && tense.reg ? diffHTML(f, tense.reg[i]) : esc(f) }}></span>
                {sound && f && f !== "—" &&
                <button className="speakbtn" title="Listen" onClick={(ev) => {ev.stopPropagation();speak(f, ttsLang);}}>🔊</button>
                }
              </div>
            </React.Fragment>
          ))}
        </div>
        {hasAnyForm &&
        <div className="tcard-exbtn-row">
            <button className="tcard-exbtn" onClick={toggleTenseEx}>
              {tenseEx && tenseEx.open ? "▾ Beispiel" : "＋ Beispiel"}
            </button>
          </div>
        }
        {tenseEx && tenseEx.open &&
        <div className="exrow2">
            {tenseEx.loading && <span className="exloading">…</span>}
            {tenseEx.error && <span className="exloading">No example available.</span>}
            {tenseEx.s && <React.Fragment>
              <div className="exrow2-top">
                <WordSentence text={stripMark(tenseEx.s)} fromName={engineName} toName={native} cachePrefix={`kunju-wtr-${langCode}-nat`} accent={true} saveLang={langCode} saveDir="fromTarget" />
                <div className="exrow2-btns">
                  {sound && <button className="speakbtn" title="Listen" onClick={(ev) => {ev.stopPropagation();speak(stripMark(tenseEx.s), ttsLang);}}>🔊</button>}
                  <button className="speakbtn exrefresh" title="New example" onClick={(ev) => {ev.stopPropagation();fetchTenseEx(true);}}>↻</button>
                </div>
              </div>
              <span className="exnative2">{tenseEx.n}</span>
            </React.Fragment>}
          </div>
        }
      </div>
    </div>);

}

/* ---------- Deconjugation banner ---------- */
function DeconjBanner({ deconj, lang, activeInf, onView }) {
  const multi = deconj.infinitives.length > 1;
  const color = LANG_META[lang].color;
  return (
    <div className="deconj" style={{ "--lc": color }}>
      <div className="deconj-eyebrow"><span className="deconj-turn">↩</span>{tr("dq_form")}</div>
      <div className="deconj-form">“{deconj.input}”</div>
      <div className="deconj-lines">
        {deconj.analyses.map((a, i) =>
        <button key={i} className={"deconj-line" + (a.base === activeInf ? " on" : "")}
        onClick={() => multi && onView(a.base)} disabled={!multi} style={{ cursor: multi ? "pointer" : "default" }}>
            {!a.noPerson && <span className="deconj-pron">{a.pronouns.join(" / ")}</span>}
            <span className="deconj-tense">{a.tenseLabel}</span>
            {multi && <><span className="deconj-arrow">→</span><span className="deconj-inf-mini">{a.infinitive}</span></>}
          </button>
        )}
      </div>
      <div className="deconj-foot">
        {multi ?
        <div className="deconj-chips">
            <span className="deconj-inf-label">{tr("dq_belongs")}</span>
            {deconj.infinitives.map((it) =>
          <button key={it.base} className={"deconj-chip" + (it.base === activeInf ? " on" : "")} onClick={() => onView(it.base)}>{it.infinitive}</button>
          )}
          </div> :

        <div className="deconj-inf-row">
            <span className="deconj-inf-label">{tr("dq_infinitive")}</span>
            <span className="deconj-inf">{deconj.infinitives[0].infinitive}</span>
            <span className={"badge " + (deconj.infinitives[0].isIrregular ? "irr" : "reg")}>{deconj.infinitives[0].isIrregular ? tr("irregular") : tr("regular")}</span>
          </div>
        }
        {deconj.guessed ?
        <span className="deconj-fuzzy">≈ {tr("dq_guess")}</span> :
        deconj.fuzzy && <span className="deconj-fuzzy">≈ {tr("dq_fuzzy")}</span>}
      </div>
    </div>);

}

/* ---------- Conjugate view ---------- */
function ConjugateView({ engine, lang, verb, setVerb, result, onConjugate, t, favs, toggleFav, history, clearHistory, pickVerb, adVisible, onAdClick, onAdDismiss, name, translating, deconj, activeInf, onViewInf, onTab }) {
  const inputRef = useRef(null);
  const diceRef = useRef([]);
  const [hidden, setHidden] = useState({});
  const sugg = useMemo(() => suggestionsFor(lang), [lang]);
  const engMeaning = result && !result.error ? window.lookupMeaning(lang, result.infinitive.replace(/^to /, "")) : null;
  const [meaning, setMeaning] = useState(null);
  useEffect(() => {
    if (!result || result.error) {setMeaning(null);return;}
    const base = result.infinitive.replace(/^to /, "");
    const nativeName = recall("kunju-native", "German");
    const inst = nativeMeaningInstant(lang, base, nativeName);
    if (inst) {setMeaning(inst);return;}
    const key = `kunju-vtr-${lang}-${base}-${nativeName}`;
    const cached = recall(key, null);
    if (cached != null) {setMeaning(cached);return;}
    const fallback = nativeName === "English" ? (engMeaning || null) : null;
    if (!window.__hasAI()) {setMeaning(fallback);return;}
    setMeaning(null);
    let cancelled = false;
    window.aiComplete(`Translate the ${window.CONJ[lang].name} verb "${base}" into ${nativeName}. Reply with ONLY the ${nativeName} translation in its base/infinitive form, nothing else.`).
    then((txt) => {if (cancelled) return;const t = String(txt || "").trim().replace(/^["'«»]+|["'«».]+$/g, "").split("\n")[0].trim();if (t) {persist(key, t);setMeaning(t);} else setMeaning(fallback);}).
    catch(() => {if (!cancelled) setMeaning(fallback);});
    return () => {cancelled = true;};
  }, [result, lang]);
  const isFav = result && !result.error && favs.some((x) => x.lang === lang && x.verb === result.infinitive);
  const hlCells = useMemo(() => {
    if (!deconj || !activeInf) return null;
    const m = {};
    deconj.analyses.forEach((a) => {if (a.base === activeInf && a.indices.length) m[a.tenseId] = (m[a.tenseId] || []).concat(a.indices);});
    return m;
  }, [deconj, activeInf]);

  const langHist = history.filter((x) => x.lang === lang && !favs.some((f) => f.lang === lang && f.verb === x.verb)).slice(0, 10);

  function rnd() {
    const pool = verbPool(lang);
    let v = null;
    for (let i = 0; i < 25; i++) {v = pool[Math.floor(Math.random() * pool.length)];if (diceRef.current.indexOf(v) < 0) break;}
    diceRef.current = [v, ...diceRef.current].slice(0, Math.min(40, Math.floor(pool.length / 2)));
    setVerb(v);onConjugate(v);
  }

  const [nativeVerb, setNativeVerb] = useState("");
  const [nativeBusy, setNativeBusy] = useState(false);
  const natName = recall("kunju-native", "German");
  const natCode = NATIVE_TO_UI[natName];
  const natBadge = natCode ? natCode.toUpperCase() : nativeLabel(natName).slice(0, 2).toUpperCase();
  function submitNative() {
    const w = (nativeVerb || "").trim().toLowerCase();
    if (!w || nativeBusy) return;
    if (natCode === lang) { setVerb(w); onConjugate(w); setNativeVerb(""); return; }
    if (natCode) { const ct = conceptTranslate(w, natCode, lang); if (ct) { setVerb(ct); onConjugate(ct); setNativeVerb(""); return; } }
    const key = `kunju-n2t-${natName}-${lang}-${w}`;
    const cached = recall(key, null);
    if (cached) { setVerb(cached); onConjugate(cached); setNativeVerb(""); return; }
    if (!window.__hasAI()) return;
    setNativeBusy(true);
    window.aiComplete(`Translate the ${natName} verb "${w}" to its ${engine.name} infinitive. Reply with ONLY the single infinitive word in ${engine.name}, lowercase, no article, no extra text.`).
    then((txt) => {const out = String(txt || "").trim().toLowerCase().split(/\s+/)[0].replace(/[^a-zà-ÿ'’\-]/gi, "");setNativeBusy(false);if (out) {persist(key, out);setVerb(out);onConjugate(out);setNativeVerb("");}}).
    catch(() => setNativeBusy(false));
  }

  return (
    <div className="view">
      <div className="inputrow">
        <div className="inputfield">
          <span className="inputlead" style={{ "--lc": LANG_META[lang].color }}>{LANG_META[lang].code}</span>
          <input ref={inputRef} value={verb} placeholder={translating ? "↔ translating…" : "…"}
          disabled={translating}
          onChange={(e) => setVerb(e.target.value)}
          onKeyDown={(e) => {if (e.key === "Enter") onConjugate(verb);}}
          autoComplete="off" autoCapitalize="off" spellCheck="false" />
          {verb && <button className="clearbtn" onClick={() => {setVerb("");inputRef.current && inputRef.current.focus();}}>×</button>}
        </div>
        <button className="dicebtn" title="Random verb" onClick={rnd} aria-label="Random verb" style={{ color: LANG_META[lang].color }}>
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <rect x="2.5" y="2.5" width="19" height="19" rx="6.5" fill="currentColor"></rect>
            <circle cx="8" cy="8" r="1.85" fill="#fff"></circle>
            <circle cx="16" cy="8" r="1.85" fill="#fff"></circle>
            <circle cx="12" cy="12" r="1.85" fill="#fff"></circle>
            <circle cx="8" cy="16" r="1.85" fill="#fff"></circle>
            <circle cx="16" cy="16" r="1.85" fill="#fff"></circle>
          </svg>
        </button>
      </div>
      <AccentBar lang={lang} onInsert={(c) => {setVerb(verb + c);inputRef.current && inputRef.current.focus();}} />

      <button className="cta" onClick={() => onConjugate(verb)}>
        <span className="cta-rainbow"></span>
        <span className="cta-label">{tr("conjugate")}</span>
      </button>

      {favs.filter((f) => f.lang === lang).length > 0 &&
      <div className="recent">
          <div className="recent-head"><span className="recent-title">★ {tr("saved")} · {favs.filter((f) => f.lang === lang).length}</span></div>
          <div className="recent-chips">
            {favs.filter((f) => f.lang === lang).slice(0, 4).map((it, i) =>
          <button key={i} className="recentchip" onClick={() => pickVerb(it.lang, it.verb)}>
                <span className="rc-flag">{LANG_META[it.lang].code}</span>{it.verb}
              </button>
          )}
          </div>
        </div>
      }

      {result && result.error && <div className="errorbox">{result.error}</div>}

      {result && !result.error &&
      <div className="resultwrap">
          {deconj && <DeconjBanner deconj={deconj} lang={lang} activeInf={activeInf} onView={onViewInf} />}
          <div className="resulthead" style={{ "--lc": LANG_META[lang].color }}>
            <div className="rh-top">
              <span className="rh-lang">{LANG_META[lang].code}</span>
              <span className={"badge " + (result.isIrregular ? "irr" : "reg")}>{result.isIrregular ? tr("irregular") : tr("regular")}</span>
              <button className={"starbtn" + (isFav ? " on" : "")} title="Save verb" onClick={() => toggleFav(lang, result.infinitive)}>{isFav ? "★" : "☆"}</button>
            </div>
            <h2 className="rh-verb">{result.infinitive}</h2>
            {meaning && meaning.toLowerCase() !== result.infinitive.replace(/^to /, "").toLowerCase() && <div className="rh-meaning"><b>{result.infinitive.replace(/^to /, "")}</b><em>{meaning}</em></div>}
            <div className="rh-actions">
              <button className="exportbtn" title="Share (WhatsApp …)" onClick={() => shareConjugation(result, lang, meaning)}>↗</button>
              <button className="exportbtn pdf" title="Save as image (PNG)" onClick={() => exportImage(result, lang, meaning)}>PNG</button>
              <button className="exportbtn pdf" title="Save as PDF" onClick={() => exportPDF(result, lang, meaning)}>PDF</button>
            </div>
          </div>

          <div className="formalnote">ⓘ {FORMALITY[lang]}</div>
          <div className="qfilter-block" style={{ marginTop: 4 }}>
            <div className="recent-title qfilter-lbl">{tr("which_tense")}</div>
            <TenseDropdown lang={lang} tenses={result.tenses} isOn={(id) => !hidden[id]} onToggle={(id) => setHidden((h) => { const next = { ...h, [id]: !h[id] }; persist(`kunju-tenses-${lang}`, result.tenses.map((t2) => t2.id).filter((x) => !next[x])); return next; })} onAll={() => { setHidden({}); persist(`kunju-tenses-${lang}`, result.tenses.map((t2) => t2.id)); }} onNone={() => { const h = {}; result.tenses.forEach((t2) => { h[t2.id] = true; }); setHidden(h); persist(`kunju-tenses-${lang}`, []); }} />
          </div>

          {(() => {
            const perf = result.tenses.find((t2) => t2.id === "perfect");
            const pf0 = perf && perf.forms && perf.forms[0];
            const isEtreVerb = lang === "fr" && pf0 && (pf0.startsWith("suis ") || pf0.includes(" suis "));
            const isSeinVerb = lang === "de" && pf0 && pf0.startsWith("bin ");
            const isZijnVerb = lang === "nl" && pf0 && pf0.startsWith("ben ");
            const esNote = lang === "es" && result.infinitive && (() => {
              const n = ES_VERB_NOTES[result.infinitive] || (ES_GUSTAR_VERBS.has(result.infinitive) ? ES_VERB_NOTES.gustar : null);
              return n ? n[UILANG] || n.en : null;
            })();
            return (
              <React.Fragment>
                {esNote && <div className="verb-note">💡 {esNote}</div>}
                {GROUP_ORDER.map((g) => {
                  const inGroup = result.tenses.map((t2, i) => ({ t2, i })).filter((x) => tenseGroup(x.t2.id) === g && !hidden[x.t2.id]);
                  if (!inGroup.length) return null;
                  return (
                    <React.Fragment key={g}>
                      {g !== "ind" && <div className="tgrouphead">{tr("gr_" + g)}</div>}
                      {inGroup.map(({ t2, i }) => {
                        const hint =
                          (isEtreVerb && FR_ETRE_TENSES.has(t2.id)) ? "Fém. +e · Plur. +s" :
                          (isSeinVerb && DE_NL_AUX_TENSES.has(t2.id)) ? "Hilfsverb: sein" :
                          (isZijnVerb && DE_NL_AUX_TENSES.has(t2.id)) ? "Hulpww.: zijn" : null;
                        return <TenseCard key={t2.id} tense={t2} pronouns={result.pronouns} color={RAINBOW[i % RAINBOW.length]}
                          openDefault={true} ttsLang={engine.ttsLang} highlight={t.highlight && result.isIrregular} sound={t.sound}
                          verb={result.infinitive} langCode={lang} engineName={engine.name} hl={hlCells && hlCells[t2.id]}
                          hint={hint} />;
                      })}
                    </React.Fragment>);
                })}
              </React.Fragment>);
          })()}

          {t.sponsor && adVisible && SPONSORS[lang] &&
        <AdCard
          sponsor={SPONSORS[lang]}
          hook={result.isIrregular ? `Drill irregular ${engine.name} verbs` : `Practice ${engine.name} verbs daily`}
          onClick={onAdClick}
          onDismiss={onAdDismiss} />

        }
        </div>
      }

      {!result &&
      <div className="emptystate emptyguide">
        <div className="eg-hero" style={{ "--lc": LANG_META[lang].color, "--lc2": HERO_CLAIM[lang].c2 }}>
          {HERO_CONFETTI.map((c, i) => {
            const cc = [LANG_META[lang].color, HERO_CLAIM[lang].c2, "#ffc400", "#34c759"];
            return <span key={i} className="eg-confetti" style={{ top: c.top, left: c.left, width: c.w, height: c.h,
              opacity: c.o, transform: `rotate(${c.rot}deg)`, background: cc[i % cc.length],
              borderRadius: c.w === c.h ? "50%" : "2px" }}></span>;
          })}
          {name && <p className="eg-kicker">{tr("hero_kicker", { name })}</p>}
          <h2 className="eg-l1">{HERO_CLAIM[lang].pre}<span className="eg-lng">{HERO_CLAIM[lang].lng}</span></h2>
          <div className="eg-accent">{HERO_CLAIM[lang].accent}
            <svg viewBox="0 0 200 13" preserveAspectRatio="none" aria-hidden="true">
              <path d="M3 8 C 45 2, 90 2, 130 6 S 185 11, 197 5" fill="none" stroke="currentColor"
                strokeWidth="3.5" strokeLinecap="round" opacity="0.5"></path>
            </svg>
          </div>
          <p className="eg-plan">{name ? tr("hero_plan", { name }) : tr("hero_plan_anon")}</p>
        </div>
        <div className="eg-cards">
          <button className="eg-card" onClick={rnd}>
            <span className="eg-ic" style={{ color: LANG_META[lang].color }}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <rect x="2.5" y="2.5" width="19" height="19" rx="6.5" fill="currentColor"></rect>
                <circle cx="8" cy="8" r="1.85" fill="#fff"></circle><circle cx="16" cy="8" r="1.85" fill="#fff"></circle>
                <circle cx="12" cy="12" r="1.85" fill="#fff"></circle>
                <circle cx="8" cy="16" r="1.85" fill="#fff"></circle><circle cx="16" cy="16" r="1.85" fill="#fff"></circle>
              </svg>
            </span>
            <span className="eg-tx"><b className="eg-n">1</b>{tr("eg_step1")}</span>
            <span className="eg-go">→</span>
          </button>
          <button className="eg-card" onClick={() => onTab && onTab("quiz")}>
            <span className="eg-ic eg-ic-glyph" style={{ color: LANG_META[lang].color }}>◆</span>
            <span className="eg-tx"><b className="eg-n">2</b>{tr("eg_step2")}</span>
            <span className="eg-go">→</span>
          </button>
          <button className="eg-card" onClick={() => onTab && onTab("saved")}>
            <span className="eg-ic eg-ic-glyph" style={{ color: LANG_META[lang].color }}>★</span>
            <span className="eg-tx"><b className="eg-n">3</b>{tr("eg_step3")}</span>
            <span className="eg-go">→</span>
          </button>
        </div>
      </div>
      }
    </div>);

}

/* ---------- Quiz ---------- */
function pick(arr) {return arr[Math.floor(Math.random() * arr.length)];}
function shuffle(arr) {const a = arr.slice();for (let i = a.length - 1; i > 0; i--) {const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]];}return a;}
function norm(s) {return (s || "").trim().toLowerCase().replace(/\s+/g, " ");}

function buildQuestion(lang, tenseId, pool) {
  const eng = window.CONJ[lang];
  for (let tries = 0; tries < 22; tries++) {
    const v = pick(pool);
    const r = eng.conjugate(v);
    if (!r || r.error) continue;
    let t;
    if (tenseId === "all") t = pick(r.tenses);else
    if (Array.isArray(tenseId)) {const avail = r.tenses.filter((x) => tenseId.indexOf(x.id) >= 0);if (!avail.length) continue;t = pick(avail);} else
    {t = r.tenses.find((x) => x.id === tenseId);if (!t) continue;}
    const idxs = [];t.forms.forEach((f, i) => {if (f && f !== "—") idxs.push(i);});
    if (!idxs.length) continue;
    const pi = pick(idxs);
    const answer = t.forms[pi];
    // distractors: prefer forms from the same selected tense(s); only widen if too few
    const allowed = tenseId === "all" ? null : Array.isArray(tenseId) ? tenseId : [tenseId];
    const cand = new Set();
    r.tenses.forEach((tt) => {if (allowed && allowed.indexOf(tt.id) < 0) return;tt.forms.forEach((f) => {if (f && f !== "—" && norm(f) !== norm(answer)) cand.add(f);});});
    if (cand.size < 3) r.tenses.forEach((tt) => tt.forms.forEach((f) => {if (f && f !== "—" && norm(f) !== norm(answer)) cand.add(f);}));
    const distract = shuffle([...cand]).slice(0, 3);
    const options = shuffle([answer, ...distract]);
    return { lang, verb: r.infinitive, tenseId: t.id, tenseLabel: t.label, pronoun: r.pronouns[pi], answer, options, isIrregular: r.isIrregular, ttsLang: eng.ttsLang };
  }
  return null;
}

/* Sentence-speaking helpers: varied topics + warm feedback lines */
const SPK_THEMES = [
  { id: "random", topic: "" },
  { id: "shopping", topic: "shopping and stores" },
  { id: "office", topic: "an official or government appointment (bureaucracy)" },
  { id: "doctor", topic: "a doctor, pharmacy or health situation" },
  { id: "family", topic: "family, kids and home life" },
  { id: "travel", topic: "travelling, trains and asking directions" },
  { id: "restaurant", topic: "a restaurant, café or ordering food" },
  { id: "work", topic: "work, office and appointments" },
  { id: "freetime", topic: "free time, hobbies and sport" },
  { id: "sport", topic: "sport, exercise and the gym" },
  { id: "pregnancy", topic: "pregnancy, baby and expecting a child" },
  { id: "finance", topic: "finance, money, banking and the economy" },
  { id: "proverb", topic: "a well-known traditional proverb or saying from a country where the language is spoken" }
];
const THEME_LABELS = {
  de: { random: "Zufällig", shopping: "Einkaufen", office: "Behörde", doctor: "Arztbesuch", family: "Familie", travel: "Reisen", restaurant: "Restaurant", work: "Arbeit", freetime: "Freizeit", sport: "Sport", pregnancy: "Schwangerschaft", finance: "Finanzen & Wirtschaft", proverb: "Sprichworte" },
  en: { random: "Random", shopping: "Shopping", office: "Authorities", doctor: "Doctor", family: "Family", travel: "Travel", restaurant: "Restaurant", work: "Work", freetime: "Free time", sport: "Sport", pregnancy: "Pregnancy", finance: "Finance & economy", proverb: "Proverbs" },
  es: { random: "Aleatorio", shopping: "Compras", office: "Trámites", doctor: "Médico", family: "Familia", travel: "Viajes", restaurant: "Restaurante", work: "Trabajo", freetime: "Ocio", sport: "Deporte", pregnancy: "Embarazo", finance: "Finanzas y economía", proverb: "Refranes" },
  nl: { random: "Willekeurig", shopping: "Winkelen", office: "Overheid", doctor: "Dokter", family: "Familie", travel: "Reizen", restaurant: "Restaurant", work: "Werk", freetime: "Vrije tijd", sport: "Sport", pregnancy: "Zwangerschap", finance: "Financiën & economie", proverb: "Spreekwoorden" },
  fr: { random: "Aléatoire", shopping: "Achats", office: "Démarches", doctor: "Médecin", family: "Famille", travel: "Voyages", restaurant: "Restaurant", work: "Travail", freetime: "Loisirs", sport: "Sport", pregnancy: "Grossesse", finance: "Finance & économie", proverb: "Proverbes" }
};
function themeLabel(id) {
  if (id && id.startsWith("cat:")) return id.slice(4);
  const m = THEME_LABELS[UILANG] || THEME_LABELS.en; return m[id] || id;
}

/* Verb-group filters for the quiz (per language). */
const VERB_GROUPS = {
  es: [{ id: "all" }, { id: "saved" }, { id: "irregular" }, { id: "ar", suf: "ar" }, { id: "er", suf: "er" }, { id: "ir", suf: "ir" }],
  fr: [{ id: "all" }, { id: "saved" }, { id: "irregular" }, { id: "er", suf: "er" }, { id: "ir", suf: "ir" }, { id: "re", suf: "re" }],
  de: [{ id: "all" }, { id: "saved" }, { id: "irregular" }, { id: "regular" }],
  nl: [{ id: "all" }, { id: "saved" }, { id: "irregular" }, { id: "regular" }],
  en: [{ id: "all" }, { id: "saved" }, { id: "irregular" }, { id: "regular" }]
};
const GROUP_LABELS = {
  de: { all: "Alle", saved: "Gespeicherte Verben", irregular: "Unregelmäßig", regular: "Regelmäßig" },
  en: { all: "All", saved: "Saved verbs", irregular: "Irregular", regular: "Regular" },
  es: { all: "Todos", saved: "Verbos guardados", irregular: "Irregulares", regular: "Regulares" },
  nl: { all: "Alle", saved: "Bewaarde werkwoorden", irregular: "Onregelmatig", regular: "Regelmatig" },
  fr: { all: "Tous", saved: "Verbes mémorisés", irregular: "Irréguliers", regular: "Réguliers" }
};
function groupLabel(g) {
  if (g.suf) return "-" + g.suf;
  const m = GROUP_LABELS[UILANG] || GROUP_LABELS.en;
  return m[g.id] || g.id;
}
const SENT_TOPICS = ["food and drink", "travel", "family and friends", "work or study", "the weather", "hobbies", "shopping", "animals and pets", "sports", "music or films", "a daily routine", "weekend plans", "health", "technology", "the city", "nature", "holidays", "cooking", "the morning", "a phone call"];
// friendly rotating lines shown while a story is being generated
const TEXTE_TIPS = {
  de: ["✍️ Wir denken uns eine Geschichte für dich aus…", "📖 Figuren und Schauplatz entstehen gerade…", "🪄 Wörter werden zu Sätzen verwoben…", "✨ Wir feilen an den letzten Sätzen…", "☕ Gleich kannst du loslesen…"],
  en: ["✍️ Inventing a story just for you…", "📖 Characters and setting are taking shape…", "🪄 Weaving words into sentences…", "✨ Polishing the final lines…", "☕ Almost ready to read…"],
  es: ["✍️ Inventando una historia para ti…", "📖 Los personajes y el escenario cobran forma…", "🪄 Tejiendo palabras en frases…", "✨ Puliendo las últimas líneas…", "☕ Casi listo para leer…"],
  nl: ["✍️ We verzinnen een verhaal voor je…", "📖 Personages en decor krijgen vorm…", "🪄 Woorden worden tot zinnen geweven…", "✨ De laatste zinnen worden bijgeschaafd…", "☕ Bijna klaar om te lezen…"],
  fr: ["✍️ On invente une histoire pour toi…", "📖 Les personnages et le décor prennent forme…", "🪄 On tisse les mots en phrases…", "✨ On peaufine les dernières phrases…", "☕ Bientôt prêt à lire…"]
};
const PRAISE = {
  de: ["Stark! 💪", "Perfekt!", "Klasse gemacht!", "Weiter so!", "Top! 🎯", "Genau richtig!", "Sitzt!", "Bravo! 🎉", "Sauber!", "Du rockst das!", "Wie aus dem Lehrbuch!", "Da war kein Zögern!", "Muttersprachler-Niveau! ✨", "Das gibt Selbstvertrauen!", "Glasklar!", "Mehr davon!"],
  en: ["Nice! 💪", "Perfect!", "Well done!", "Keep it up!", "Spot on! 🎯", "Exactly right!", "Nailed it!", "Bravo! 🎉", "Clean!", "You're on fire!", "Textbook!", "No hesitation there!", "Native-level! ✨", "That builds confidence!", "Crystal clear!", "More of that!"],
  es: ["¡Genial! 💪", "¡Perfecto!", "¡Muy bien!", "¡Sigue así!", "¡Justo! 🎯", "¡Exacto!", "¡Bravo! 🎉", "¡Estupendo!", "¡Impecable!", "¡Lo clavaste!", "¡De libro!", "¡Sin titubear!", "¡Nivel nativo! ✨", "¡Eso da confianza!", "¡Clarísimo!", "¡Así se hace!"],
  nl: ["Top! 💪", "Perfect!", "Goed gedaan!", "Ga zo door!", "Precies! 🎯", "Helemaal goed!", "Bravo! 🎉", "Knap!", "Netjes!", "Je bent on fire!", "Uit het boekje!", "Geen twijfel!", "Moedertaalniveau! ✨", "Dat geeft vertrouwen!", "Glashelder!", "Meer hiervan!"],
  fr: ["Bravo ! 💪", "Parfait !", "Bien joué !", "Continue !", "Pile poil ! 🎯", "Exact !", "Super ! 🎉", "Génial !", "Impeccable !", "Tu assures !", "Comme dans le manuel !", "Aucune hésitation !", "Niveau natif ! ✨", "Ça donne confiance !", "Limpide !", "Encore comme ça !"]
};
const CHEER = {
  de: ["Fast! Nochmal 🙌", "Kein Problem, weiter geht's!", "Übung macht den Meister!", "Gleich hast du's!", "Dranbleiben! 💛", "Nicht schlimm — nächste Runde!", "Schon nah dran!", "Aus Fehlern lernt man!", "Beim nächsten klappt's!", "Kopf hoch, weiter!", "Genau dafür übst du!"],
  en: ["Almost! Try again 🙌", "No worries, keep going!", "Practice makes perfect!", "You'll get it!", "Stay with it! 💛", "All good — next one!", "So close!", "Mistakes are how we learn!", "Next one's yours!", "Chin up, keep going!", "That's what practice is for!"],
  es: ["¡Casi! Otra vez 🙌", "¡Sin problema, sigue!", "¡La práctica hace al maestro!", "¡Ya casi!", "¡Ánimo! 💛", "Tranqui — ¡a la siguiente!", "¡Por poco!", "¡De los errores se aprende!", "¡La próxima es tuya!", "¡Arriba, sigue!", "¡Para eso se practica!"],
  nl: ["Bijna! Nog eens 🙌", "Geen zorgen, ga door!", "Oefening baart kunst!", "Je krijgt het bijna!", "Volhouden! 💛", "Geeft niet — volgende!", "Zó dichtbij!", "Van fouten leer je!", "De volgende is van jou!", "Kop op, ga door!", "Daarvoor oefen je!"],
  fr: ["Presque ! Réessaie 🙌", "Pas grave, continue !", "C'est en forgeant... !", "Tu y es presque !", "Accroche-toi ! 💛", "Pas de souci — au suivant !", "Tout près !", "On apprend de ses erreurs !", "La prochaine est pour toi !", "Garde le moral !", "C'est fait pour ça !"]
};
function _withName(line) {
  const nm = recall("kunju-name", "");
  if (nm && Math.random() < 0.25) {
    const sep = /[!?.]$/.test(line) ? line.slice(0, -1) + ", " + nm + line.slice(-1) : line + ", " + nm;
    return sep;
  }
  return line;
}
function praiseLine() {const a = PRAISE[UILANG] || PRAISE.en;return _withName(a[Math.floor(Math.random() * a.length)]);}
function cheerLine() {const a = CHEER[UILANG] || CHEER.en;return _withName(a[Math.floor(Math.random() * a.length)]);}

/* Tappable sentence: tap a word to see its translation (shown as a stable chip
   below — robust on mobile, never clipped). Direction set via from/to. */
function WordSentence({ text, fromName, toName, cachePrefix, big, accent, saveLang, saveDir, showHint, wordChip, inline, savedSet, onSaved }) {
  const [openW, setOpenW] = useState(null);
  const [trans, setTrans] = useState({});
  const [saved, setSaved] = useState({});
  const [hintVisible, setHintVisible] = useState(() => showHint && !recall("kunju-word-hint-seen", false));
  useEffect(() => {
    if (!hintVisible) return;
    persist("kunju-word-hint-seen", true);
    const t = setTimeout(() => setHintVisible(false), 3700);
    return () => clearTimeout(t);
  }, [hintVisible]);
  const parts = (text || "").split(/(\s+)/);
  function clean(w) {return w.replace(/[^\p{L}\p{N}'’\-]/gu, "").toLowerCase();}
  function savedW(w) { const c = clean(w); return !!(c && savedSet && savedSet.has(deburr(norm(c)))); }
  const underlineStyle = { textDecoration: "underline", textDecorationColor: "var(--lc, #0a84ff)", textDecorationThickness: "2px", textUnderlineOffset: "3px" };
  function tap(w, i) {
    const c = clean(w);
    if (!c) return;
    if (openW && openW.i === i) {setOpenW(null);return;}
    setOpenW({ w: c, i });
    if (trans[c] != null) return;
    const key = `${cachePrefix}-${c}`;
    const cached = recall(key, null);
    if (cached != null) {setTrans((t) => ({ ...t, [c]: cached }));return;}
    if (!window.__hasAI()) {setTrans((t) => ({ ...t, [c]: "—" }));return;}
    setTrans((t) => ({ ...t, [c]: "…" }));
    window.aiComplete(`In the ${fromName} sentence "${text}", what does the word "${c}" mean in ${toName}? Reply with ONLY the ${toName} translation, 1–3 words, no punctuation, no extra text.`).
    then((r) => {const out = String(r || "").trim().replace(/^["'.]+|["'.]+$/g, "").split("\n")[0].trim() || "—";persist(key, out);setTrans((t) => ({ ...t, [c]: out }));}).
    catch(() => setTrans((t) => ({ ...t, [c]: "—" })));
  }
  function saveWord() {
    if (!saveLang || !openW) return;
    const c = openW.w;
    function afterTrans(tvRaw) {
      const tv = (!tvRaw || tvRaw === "…" || tvRaw === "—") ? "" : tvRaw;
      const term = saveDir === "fromTarget" ? c : (tv || c);
      const native = saveDir === "fromTarget" ? tv : c;
      const cats = templateCats();
      function commit(catName) {
        const entry = { id: Date.now() + "", lang: saveLang, term, trans: native, cat: catName, kind: "word", created: Date.now(), nat: recall("kunju-native", "German") };
        const list = getVocab();
        if (!list.some((x) => x.lang === entry.lang && norm(x.term) === norm(entry.term))) saveVocab([entry, ...list]);
        setSaved((s) => ({ ...s, [c]: true }));
      }
      const ck = `kunju-vcat-${saveLang}-${norm(term)}`;
      const cached = recall(ck, null);
      if (cached) {commit(cached);return;}
      if (!window.__hasAI()) {commit(generalCat());return;}
      window.aiComplete(`Which ONE category best fits the word "${term}"${native ? ` (meaning "${native}")` : ""}? Choose exactly one from this list: ${cats.join(", ")}, ${generalCat()}. If none clearly fits, answer "${generalCat()}". Reply with ONLY the category name, nothing else.`).
      then((r) => {const p = String(r || "").trim().replace(/[".]/g, "");const match = [...cats, generalCat()].find((x) => x.toLowerCase() === p.toLowerCase()) || generalCat();persist(ck, match);commit(match);}).
      catch(() => commit(generalCat()));
    }
    setSaved((s) => ({ ...s, [c]: "saving" }));
    const have = trans[c];
    if (have && have !== "…" && have !== "—") {afterTrans(have);return;}
    // translation not loaded yet — fetch it, then save
    const tkey = `${cachePrefix}-${c}`;
    const tc = recall(tkey, null);
    if (tc != null) {setTrans((t) => ({ ...t, [c]: tc }));afterTrans(tc);return;}
    if (!window.__hasAI()) {afterTrans("");return;}
    window.aiComplete(`In the ${fromName} sentence "${text}", what does the word "${c}" mean in ${toName}? Reply with ONLY the ${toName} translation, 1–3 words, no punctuation, no extra text.`).
    then((r) => {const out = String(r || "").trim().replace(/^["'«».]+|["'«».]+$/g, "").split("\n")[0].trim();if (out) {persist(tkey, out);setTrans((t) => ({ ...t, [c]: out }));}afterTrans(out);}).
    catch(() => afterTrans(""));
  }
  function chipInner() {
    const c = openW.w;
    const isSaved = !!(savedSet && savedSet.has(deburr(norm(c))));
    return (<React.Fragment><b>{c}</b> → <span>{trans[c] || "…"}</span>
      {saveLang && (
      isSaved ?
      <button className="wsave saved" onClick={() => onSaved && onSaved()}>✓ {tr("tab_saved")} →</button> :
      saved[c] === "saving" ?
      <span className="wsave saved">…</span> :
      saved[c] ?
      <span className="wsave saved">✓ {tr("vocab_saved")}</span> :
      <button className="wsave" onClick={saveWord}>+ {tr("vocab_save")}</button>)}
    </React.Fragment>);
  }
  if (inline) return (
    <span className={"wsent" + (big ? " big" : "") + (accent ? " accent" : "")} style={{ lineHeight: "inherit" }}>
      {parts.map((w, i) => {
      if (/^\s+$/.test(w) || !clean(w)) return <span key={i}>{w}</span>;
      const isOpen = openW && openW.i === i;
      return (<React.Fragment key={i}>
        <span className={"wword" + (isOpen ? " open" : "")} style={savedW(w) ? underlineStyle : undefined} onClick={() => tap(w, i)}>{w}</span>
        {isOpen && <span className="wtrans-inline" style={{ display: "inline-flex", alignItems: "center", gap: "5px", verticalAlign: "middle", margin: "1px 5px", padding: "3px 10px", borderRadius: "999px", background: "color-mix(in srgb, var(--lc, #0a84ff) 13%, var(--surface))", border: "1px solid color-mix(in srgb, var(--lc, #0a84ff) 32%, var(--border))", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>{chipInner()}</span>}
      </React.Fragment>);
    })}
    </span>);
  return (
    <div className="wsentwrap">
      {hintVisible && <div className="word-tap-hint">👆 Wörter antippen → Bedeutung & merken</div>}
      <div className={"wsent" + (big ? " big" : "") + (accent ? " accent" : "")}>
        {parts.map((w, i) => {
        if (/^\s+$/.test(w) || !clean(w)) return <span key={i}>{w}</span>;
        const isOpen = openW && openW.i === i;
        return (<React.Fragment key={i}>
          <span className={"wword" + (isOpen ? " open" : "")} style={savedW(w) ? underlineStyle : undefined} onClick={() => tap(w, i)}>{w}</span>
          {wordChip && isOpen && <span className="wtrans-inline" style={{ display: "inline-flex", alignItems: "center", gap: "5px", verticalAlign: "middle", margin: "1px 5px", padding: "3px 10px", borderRadius: "999px", background: "color-mix(in srgb, var(--lc, #0a84ff) 13%, var(--surface))", border: "1px solid color-mix(in srgb, var(--lc, #0a84ff) 32%, var(--border))", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>{chipInner()}</span>}
        </React.Fragment>);
      })}
      </div>
      {!wordChip && openW && <div className="wtrans">{chipInner()}</div>}
    </div>);

}

function QuizView({ lang, favs, toggleFav, sound, skill, onStudy, onActivity, isActive, onTab }) {
  const eng = window.CONJ[lang];
  const tenseOpts = useMemo(() => {const r = eng.conjugate(eng.samples[0]);return r && r.tenses ? r.tenses.map((t) => ({ id: t.id, label: t.label })) : [];}, [lang]);
  const pool = useMemo(() => {
    const base = quizPool(lang, skill || "beginner");
    const favVerbs = favs.filter((f) => f.lang === lang).map((f) => f.verb);
    favVerbs.forEach((v) => { if (base.indexOf(v) < 0) base.push(v); });
    // add 4 extra copies of each favorite → ~5× higher pick probability
    for (let i = 0; i < 4; i++) favVerbs.forEach((v) => base.push(v));
    return base;
  }, [lang, favs, skill]);

  const [mode, setMode] = useState("cards");
  const allTenseIds = useMemo(() => tenseOpts.map((t) => t.id), [tenseOpts]);
  const [tenseSel, setTenseSel] = useState([]);
  const [mistMode, setMistMode] = useState(false);
  const allTensesOn = tenseSel.length > 0 && tenseSel.length === allTenseIds.length;
  const [selGroup, setSelGroup] = useState("all");
  const groups = VERB_GROUPS[lang] || [{ id: "all" }];
  const filteredPool = useMemo(() => {
    if (selGroup === "all") return pool;
    if (selGroup === "saved") {const f = (favs || []).filter((x) => x.lang === lang).map((x) => x.verb).filter((v) => pool.includes(v));return f.length ? f : pool;}
    const irr = new Set(window.CONJ[lang].irregulars || []);
    if (selGroup === "irregular") {const f = pool.filter((v) => irr.has(v));return f.length ? f : pool;}
    if (selGroup === "regular") {const f = pool.filter((v) => !irr.has(v));return f.length ? f : pool;}
    const g = groups.find((x) => x.id === selGroup);
    if (g && g.suf) {const f = pool.filter((v) => v.endsWith(g.suf));return f.length ? f : pool;}
    return pool;
  }, [pool, selGroup, lang, favs]);
  const [q, setQ] = useState(null);
  const [val, setVal] = useState("");
  const [state, setState] = useState("idle");
  const [picked, setPicked] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [transl, setTransl] = useState(null);
  const [prevCards, setPrevCards] = useState([]);
  const [speedLog, setSpeedLog] = useState([]);
  const [mver, setMver] = useState(0);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [msg, setMsg] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(() => recall("kunju-autospeak", false));
  function toggleAutoSpeak() {setAutoSpeak((v) => {const n = !v;persist("kunju-autospeak", n);return n;});}
  const [spkMode, setSpkMode] = useState("form");
  const [typeMode, setTypeMode] = useState("form");
  const [revealed, setRevealed] = useState(false);
  const [sentMistMode, setSentMistMode] = useState(false);
  const [smver, setSmver] = useState(0);
  const [cloze, setCloze] = useState(null);
  const [topicsSel, setTopicsSel] = useState(["random"]);
  const [sent, setSent] = useState(null);
  const [spkTarget, setSpkTarget] = useState(lang);
  const [score, setScore] = useState({ right: 0, total: 0, streak: 0 });
  const inRef = useRef(null);
  const recentRef = useRef([]);
  const recentSentRef = useRef({});
  const recRef = useRef(null);
  const transcriptRef = useRef("");
  // ---- TEXTE (story) mode ----
  const [texteMode, setTexteMode] = useState("question"); // Texte = Lesen + Verständnisfragen
  const [story, setStory] = useState(null);       // null | {loading} | {error} | {sentences:[{t,n}], topic}
  const [storyIdx, setStoryIdx] = useState(0);
  const [clozeItem, setClozeItem] = useState(null); // null | {loading} | {full,gap,answer,inf,tenseLabel,tenseId,nogap}
  const [questions, setQuestions] = useState(null); // null | {loading} | {error} | [{q,options,answer}]
  const [qIdx, setQIdx] = useState(0);
  const [explain, setExplain] = useState("");       // short rule hint shown on a wrong cloze answer
  const [genProg, setGenProg] = useState("");        // progress while a new story is being generated
  const [genSecs, setGenSecs] = useState(0);         // elapsed seconds while generating (for the countdown)
  const [transOpen, setTransOpen] = useState(false); // native translation collapsed/expanded in Texte mode
  const [storyTrans, setStoryTrans] = useState(null); // lazily generated translation of the whole story (in the user's native language)
  const [reading, setReadingState] = useState("idle"); // read-aloud: idle | playing | paused
  const [readIdx, setReadIdx] = useState(0);            // index of the sentence currently being read
  const [useMyWords, setUseMyWords] = useState(() => recall("kunju-texte-mywords", false)); // weave the learner's saved words into the story
  const useMyWordsRef = useRef(recall("kunju-texte-mywords", false));
  const [ttsRate, setTtsRateState] = useState(() => recall("kunju-ttsrate", 1.0)); // read-aloud speed
  const [voices, setVoices] = useState(() => (window.speechSynthesis ? window.speechSynthesis.getVoices() : []) || []);
  const ttsBase = ((window.CONJ[lang] && window.CONJ[lang].ttsLang) || lang).toLowerCase().split("-")[0];
  const [voiceSel, setVoiceSel] = useState("");
  const [voiceGenderSel, setVoiceGenderSel] = useState("");
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const upd = () => setVoices(window.speechSynthesis.getVoices() || []);
    upd();
    try { window.speechSynthesis.addEventListener("voiceschanged", upd); } catch (e) {}
    return () => { try { window.speechSynthesis.removeEventListener("voiceschanged", upd); } catch (e) {} };
  }, []);
  useEffect(() => { setVoiceSel(savedVoiceURI(ttsBase)); setVoiceGenderSel(savedGender(ttsBase)); }, [ttsBase, lang]);
  const langVoices = voices.filter((v) => (v.lang || "").toLowerCase().split("-")[0] === ttsBase);
  const storyTokenRef = useRef(0);
  const qTokRef = useRef(0);
  const clozeTokRef = useRef(0);
  const lastStoryRef = useRef(null);
  const genRef = useRef(0);
  const texteModeRef = useRef("question");
  const storyIdxRef = useRef(0);
  const readingRef = useRef("idle");
  const readIdxRef = useRef(0);
  const sentRefs = useRef([]);

  // speed mode
  const [speedState, setSpeedState] = useState("idle"); // idle | running | done
  const [timeLeft, setTimeLeft] = useState(60);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedTotal, setSpeedTotal] = useState(0);
  const speedBestKey = `kunju-speedbest-${lang}`;
  const [speedBest, setSpeedBest] = useState(() => recall(speedBestKey, 0));
  const [cardDir, setCardDir] = useState(() => recall("kunju-carddir", "target"));
  const [thisDir, setThisDir] = useState("target");
  const nativeName = recall("kunju-native", "German");
  const nativeCode = NATIVE_TO_UI[nativeName] || "en";
  const nativeLangCode = (LANG_META[nativeCode] || {code:"?"}).code;
  const customCatNames = recall("kunju-vocab-catnames", []);
  const allThemes = customCatNames.length
    ? [...SPK_THEMES, ...customCatNames.map(n => ({ id: "cat:"+n, topic: n }))]
    : SPK_THEMES;

  function reloadTenses() {
    const saved = recall(`kunju-tenses-${lang}`, null);
    const ids = eng.conjugate(eng.samples[0]);
    const all = ids && ids.tenses ? ids.tenses.map((t) => t.id) : [];
    const valid = Array.isArray(saved) ? saved.filter((id) => all.indexOf(id) >= 0) : [];
    setTenseSel(valid.length ? valid : all);
  }
  useEffect(() => {
    reloadTenses();
    setMistMode(false);setSelGroup("all");setSpkTarget(lang);recentRef.current = [];setSpeedBest(recall(`kunju-speedbest-${lang}`, 0));
  }, [lang]);
  useEffect(() => { if (isActive) reloadTenses(); }, [isActive]);
  function toggleTense(id) {
    setTenseSel((prev) => {
      const next = prev.indexOf(id) >= 0 ? prev.filter((x) => x !== id) : allTenseIds.filter((x) => prev.indexOf(x) >= 0 || x === id);
      persist(`kunju-tenses-${lang}`, next);
      return next;
    });
  }
  function setAllTenses(on) {const next = on ? allTenseIds.slice() : [];setTenseSel(next);persist(`kunju-tenses-${lang}`, next);}
  const scoreKey = `kunju-score-${lang}-${mode}`;
  useEffect(() => {setScore(recall(scoreKey, { right: 0, total: 0, streak: 0 }));}, [scoreKey]);
  useEffect(() => {if ((mode === "choice" || mode === "type" || mode === "speed" || mode === "speak") && q) fetchTransl(q.verb);if (mode === "cards" && q && thisDir === "native") fetchTransl(q.verb);if ((mode === "choice" || mode === "cards" || (mode === "type" && typeMode === "form") || (mode === "speak" && spkMode === "form")) && q) fetchCloze(q);else setCloze(null); /* eslint-disable-next-line */}, [q, mode, spkMode, typeMode, thisDir]);
  useEffect(() => {if (mode === "type" && typeMode === "sentence" && !sent) genSentence(lang); /* eslint-disable-next-line */}, [mode, typeMode]);

  function newQ() {
    if (mistMode) {const list = getMistakes(lang);return list.length ? pick(list) : null;}
    const fp = filteredPool;
    const avoid = Math.min(recentRef.current.length ? 24 : 0, Math.floor(fp.length / 2));
    const spec = !tenseSel.length || tenseSel.length === allTenseIds.length ? "all" : tenseSel;
    let qn = null;
    for (let i = 0; i < 12; i++) {
      qn = buildQuestion(lang, spec, fp);
      if (!qn) break;
      if (recentRef.current.slice(0, avoid).indexOf(qn.verb) < 0) break; // skip recently-seen verbs
    }
    if (qn) recentRef.current = [qn.verb, ...recentRef.current].slice(0, 30);
    return qn;
  }
  function next() {
    if (recRef.current) {try {recRef.current.onend = null;recRef.current.stop();} catch (e) {}recRef.current = null;}
    setQ(newQ());setVal("");setState("idle");setPicked(null);setFlipped(false);setTransl(null);setHeard("");setListening(false);setMsg("");setRevealed(false);
    if (mode === "cards") setThisDir(cardDir === "mix" ? (Math.random() < 0.5 ? "target" : "native") : cardDir);
    if (mode === "type") setTimeout(() => inRef.current && inRef.current.focus({ preventScroll: true }), 50);
    if (mode === "speak" && spkMode === "sentence") genSentence();else setSent(null);
  }
  function fetchTransl(rawVerb) {
    const base = (rawVerb || "").replace(/^to /, "");
    const nativeName = recall("kunju-native", "German");
    const key = `kunju-vtr-${lang}-${base}-${nativeName}`;
    const cached = recall(key, null);
    if (cached != null) {setTransl(cached);return;}
    const nCode = NATIVE_TO_UI[nativeName];
    if (nCode === lang) {setTransl(base);return;}
    if (nCode) {const ct = conceptTranslate(base, lang, nCode);if (ct) {persist(key, ct);setTransl(ct);return;}}
    if (nativeName === "English") {const m = window.lookupMeaning(lang, base);if (m) {persist(key, m);setTransl(m);return;}}
    if (!window.__hasAI()) {setTransl("");return;}
    setTransl("…");
    window.aiComplete(`Translate the ${eng.name} verb "${base}" into ${nativeName}. Reply with ONLY the ${nativeName} translation in its base/infinitive form, nothing else.`).
    then((txt) => {const t = String(txt || "").trim().replace(/^["'«»]+|["'«».]+$/g, "").split("\n")[0].trim();persist(key, t);setTransl(t);}).
    catch(() => setTransl(""));
  }
  function flipCard() {if (!flipped) {setFlipped(true);if (q) fetchTransl(q.verb);}}
  function toggleTopic(id) {
    setTopicsSel((prev) => {
      if (id === "random") return ["random"]; // random is the exclusive "any topic" option
      const without = prev.filter((x) => x !== "random"); // picking a real theme drops "random"
      const next = without.includes(id) ? without.filter((x) => x !== id) : [...without, id];
      return next.length ? next : ["random"]; // nothing specific left → back to random
    });
  }
  function pickClozeTopic(id) {
    setTopicsSel([id]);
    if (typeMode === "sentence") {
      setVal(""); setState("idle"); setRevealed(false); setMsg("");
      genSentence(lang, 0, id);
    } else if (q) {
      fetchCloze(q, 0, id);
    }
  }
  const clozeTokenRef = useRef(0);
  function fetchCloze(qq, attempt, topicOverride) {
    attempt = attempt || 0;
    const curTopic = topicOverride || (topicsSel.length ? topicsSel[Math.floor(Math.random() * topicsSel.length)] : "random");
    if (!qq || !qq.answer || qq.answer === "—") {setCloze(null);return;}
    const myTok = attempt === 0 ? ++clozeTokenRef.current : clozeTokenRef.current;
    const targetName = window.CONJ[lang].name;
    const nativeName = recall("kunju-native", "German");
    const lvl = skill === "advanced" ? "C1-level" : skill === "intermediate" ? "B1-level" : "very simple A1–A2";
    const advConn = skill === "advanced" ? ` Make it a more complex sentence that naturally uses a subordinating connector (e.g. German: obwohl/trotzdem/damit/während/sodass; Spanish: aunque/a pesar de que/para que; French: bien que/quoique/afin que/pourtant; Dutch: hoewel/zodat/terwijl), like "Trotz der Umstände hielten sie durch."` : "";
    const theme = allThemes.find((t) => t.id === curTopic);
    const topicTxt = theme && theme.topic ? ` The sentence should relate to: ${theme.topic}.` : "";
    const key = `kunju-cloze6-${lang}-${qq.verb}-${qq.tenseLabel}-${qq.pronoun}-${skill}-${nativeName}-${curTopic}`;
    const cached = recall(key, null);
    if (cached != null) {setCloze(cached);return;}
    if (!window.__hasAI()) {setCloze(null);return;}
    setCloze({ loading: true });
    const splitLang = (lang === "de" || lang === "nl");
    const isCompound = qq.answer.indexOf(" ") >= 0;
    const isProverb = curTopic === "proverb";
    const provN = isProverb ? Math.floor(Math.random() * 40) : 0;
    const clozeStyles = [" Make it a normal statement.", " Phrase it as a QUESTION ending with '?'.", " Phrase it as an EXCLAMATION ending with '!'.", " Make it a short line of spoken dialogue."];
    const clozeStyle = isProverb ? "" : clozeStyles[Math.floor(Math.random() * clozeStyles.length)];
    const prompt = isProverb
      ? `Give ONE of the MOST FAMOUS, standard ${targetName} proverbs ("Sprichwort") — the kind every native speaker knows and that appears in proverb collections (e.g. for German: "Übung macht den Meister", "Morgenstund hat Gold im Mund", "Wer A sagt, muss auch B sagen"). It must be a real, complete proverb in standard ${targetName}, NOT regional slang, NOT an everyday idiom, NOT invented. Pick a varied one (variety #${provN}). Wrap its main conjugated verb in **double asterisks**. Then give its meaning in ${nativeName}. Do NOT use double-quote characters. Reply with ONLY minified JSON: {"t":"<the proverb with **verb**>","n":"<${nativeName} meaning>"}`
      : `Write ONE short, natural ${lvl} sentence in ${targetName} (max 9 words) ${(splitLang && isCompound) ? `that correctly expresses the ${qq.tenseLabel} of "${qq.verb}" for "${qq.pronoun}" — its parts are ${qq.answer.split(" ").map((p) => `"${p}"`).join(" + ")}. Use natural ${targetName} word order: the finite/auxiliary verb stays in SECOND position and the participle or infinitive moves to the END of the clause (e.g. "Ich habe das Buch gestern gelesen").` : `that CONTAINS exactly the verb form "${qq.answer}" (the ${qq.tenseLabel} of "${qq.verb}", ${qq.pronoun}).`}${clozeStyle}${advConn}${splitLang ? ` IMPORTANT: if "${qq.verb}" is a separable-prefix verb (trennbares Verb / scheidbaar werkwoord), split the prefix to the END of the main clause in simple tenses (e.g. "ausbreiten" → "Das Feuer breitete sich schnell aus", NEVER "ausbreitete").` : ""}${topicTxt} End with proper punctuation (. ! or ?). Before replying, silently PROOFREAD and guarantee the sentence is 100% correct standard ${targetName} (verb position, separable-prefix split, case government, agreement, word order); if anything is off, fix it and output only the corrected sentence. Then give a natural ${nativeName} translation of the WHOLE sentence. Do NOT use double-quote characters. Reply with ONLY minified JSON and nothing else: {"t":"<${targetName} sentence>","n":"<${nativeName} translation>"}`;
    window.aiComplete(prompt).
    then((txt) => {
      if (clozeTokenRef.current !== myTok) return; // stale response — a newer question is active
      let j = null;
      try {j = looseParse(txt);} catch (_) {j = null;}
      if (isProverb) {
        let raw = j && j.t ? String(j.t).trim() : "";
        if (!raw) {if (attempt < 1) {fetchCloze(qq, attempt + 1, curTopic);return;}setCloze(null);return;}
        const full = raw.replace(/\*\*/g, "");
        // proverbs are independent of the quiz verb → show the full saying (no gap to avoid a verb mismatch)
        const out = { full, gap: full, native: j && j.n ? String(j.n).trim() : "", proverb: true };
        persist(key, out);setCloze(out);
        return;
      }
      const s = j && j.t ? String(j.t).trim() : "";
      const stripMark = (t) => t.replace(/\*\*/g, "");
      // build a gap: prefer **markers** from AI, fall back to regex word match
      const full = stripMark(s);
      let gap = full, hit = false;
      const markedGap = s.replace(/\*\*(.+?)\*\*/, "…");
      if (markedGap !== s) { gap = stripMark(markedGap); hit = true; }
      if (!hit) {
        const mkRe = (w) => {const e = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");try {return new RegExp("(?<![\\p{L}])" + e + "(?![\\p{L}])", "iu");} catch (x) {return new RegExp("\\b" + e + "\\b", "i");}};
        const wordList = (splitLang && isCompound) ? qq.answer.split(/\s+/) : [qq.answer];
        wordList.forEach((w) => {const r = mkRe(w);if (r.test(gap)) {gap = gap.replace(r, "…");hit = true;}});
      }
      if (!s || !hit) {
        if (attempt < 1) {fetchCloze(qq, attempt + 1, curTopic);return;}
        if (!s) {setCloze(null);return;}
      }
      const out = { full, gap: hit ? gap : full, native: j && j.n ? String(j.n).trim() : "" };
      persist(key, out);setCloze(out);
    }).
    catch(() => {if (clozeTokenRef.current !== myTok) return;if (attempt < 1) fetchCloze(qq, attempt + 1, curTopic);else setCloze(null);});
  }
  useEffect(() => {
    setPrevCards([]);
    if (mode === "speed") {setSpeedState("idle");setQ(newQ());} else
    next();
    /* eslint-disable-next-line */
  }, [lang, tenseSel.join(","), mistMode, selGroup, mode]);

  function setModeP(m) {setMode(m);persist("kunju-mode", m);}
  function bumpMist() {setMver((v) => v + 1);}

  function record(ok) {
    const ns = { right: score.right + (ok ? 1 : 0), total: score.total + 1, streak: ok ? score.streak + 1 : 0 };
    setScore(ns);persist(scoreKey, ns);
    if (!ok) {addMistake(lang, q);bumpMist();} else
    if (mistMode) {removeMistake(lang, q);bumpMist();}
    onActivity && onActivity();
  }
  function check() {
    if (!q || state !== "idle") return;
    if (typeMode === "sentence") {
      if (!sent || !sent.t) return;
      const clean = (s) => norm(s).replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
      const ct = clean(sent.t), cv = clean(val);
      // typed → require an exact match (accents matter); allow only minor accent slips when otherwise identical
      const ok = cv === ct || (deburr(cv) === deburr(ct) && cv.split(" ").length === ct.split(" ").length);
      const accentSlip = ok && cv !== ct;
      record(ok);setState(ok ? "correct" : "wrong");setMsg(ok ? (accentSlip ? tr("accent_hint") : praiseLine()) : cheerLine());
      return;
    }
    const exact = norm(val) === norm(q.answer);
    const accentOnly = !exact && deburr(norm(val)) === deburr(norm(q.answer)) && norm(val).length > 0;
    const ok = exact || accentOnly;
    record(ok);
    setState(ok ? "correct" : "wrong");
    setMsg(accentOnly ? tr("accent_hint", { answer: q.answer }) : ok ? praiseLine() : cheerLine());
    if (ok && autoSpeak) speak(q.answer, q.ttsLang);
  }
  function choose(opt) {
    if (!q || state !== "idle") return;
    setPicked(opt);
    const ok = norm(opt) === norm(q.answer);
    record(ok);setState(ok ? "correct" : "wrong");setMsg(ok ? praiseLine() : cheerLine());
    if (ok && autoSpeak) speak(q.answer, q.ttsLang);
  }

  // speed timer
  useEffect(() => {
    if (mode !== "speed" || speedState !== "running") return;
    if (timeLeft <= 0) {
      setSpeedState("done");
      setSpeedBest((b) => {const nb = Math.max(b, speedScore);persist(speedBestKey, nb);return nb;});
      return;
    }
    const id = setTimeout(() => setTimeLeft((x) => x - 1), 1000);
    return () => clearTimeout(id);
    /* eslint-disable-next-line */
  }, [mode, speedState, timeLeft]);

  function startSpeed() {setSpeedScore(0);setSpeedTotal(0);setSpeedLog([]);setTimeLeft(60);setQ(newQ());setSpeedState("running");}
  function speedAnswer(opt) {
    if (speedState !== "running") return;
    const ok = norm(opt) === norm(q.answer);
    if (ok) setSpeedScore((s) => s + 1);else
    {addMistake(lang, q);bumpMist();}
    setSpeedLog((l) => [...l, { verb: q.verb, pronoun: q.pronoun, tenseLabel: q.tenseLabel, answer: q.answer, picked: opt, ok: ok, ttsLang: q.ttsLang }]);
    setSpeedTotal((s) => s + 1);
    onActivity && onActivity();
    setQ(newQ());
  }
  function nextCard(known) {
    if (known) {if (mistMode) {removeMistake(lang, q);bumpMist();}} else
    {addMistake(lang, q);bumpMist();}
    onActivity && onActivity();
    setPrevCards((s) => [...s, q].slice(-40));
    next();
  }
  function goBackCard() {
    setPrevCards((stack) => {
      if (!stack.length) return stack;
      const copy = stack.slice();
      const prev = copy.pop();
      setQ(prev);setFlipped(false);setTransl(null);setState("idle");setMsg("");
      return copy;
    });
  }
  function evaluateSpoken(said, target, recLang) {
    const a = norm(said), tg = norm(target);
    const da = deburr(a), dtg = deburr(tg);
    let ok;
    if (spkMode === "sentence") {ok = sentSim(a, tg) >= 0.38 || sentSim(da, dtg) >= 0.5;} else
    {
      const last = tg.split(" ").pop(), dlast = dtg.split(" ").pop();
      const aw = a.split(" "), daw = da.split(" ");
      ok = a === tg || da === dtg || a.includes(tg) || da.includes(dtg) ||
      aw.indexOf(last) >= 0 || daw.indexOf(dlast) >= 0 ||
      daw.some((w) => w.length > 2 && (w === dlast || dlast.indexOf(w) === 0 || w.indexOf(dlast) === 0));
    }
    record(ok);setState(ok ? "correct" : "wrong");setMsg(ok ? praiseLine() : cheerLine());
    if (spkMode === "sentence" && sent) {
      if (ok) {if (sentMistMode) {removeSentMist(spkTarget, sent);setSmver((v) => v + 1);}} else
      {addSentMist(spkTarget, sent);setSmver((v) => v + 1);}
    }
    if (ok && autoSpeak) speak(target, recLang);
  }
  function listen() {
    if (state !== "idle") return;
    // tap again while recording → stop & evaluate (like sending a voice message)
    if (recRef.current) {try {recRef.current.stop();} catch (e) {}return;}
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {setHeard("__nomic__");return;}
    const target = spkMode === "sentence" && sent && sent.t ? sent.t : q.answer;
    const recLang = spkMode === "sentence" ? window.CONJ[spkTarget].ttsLang : q.ttsLang;
    const rec = new SR();
    rec.lang = recLang;rec.continuous = true;rec.interimResults = true;rec.maxAlternatives = 1;
    transcriptRef.current = "";setHeard("");setListening(true);
    let finalT = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalT += r[0].transcript + " ";else
        interim += r[0].transcript;
      }
      transcriptRef.current = (finalT + interim).trim();
      setHeard(transcriptRef.current);
    };
    rec.onerror = (e) => {const er = e && e.error;if (er === "not-allowed" || er === "service-not-allowed") {recRef.current = null;setListening(false);setHeard("__denied__");} else if (er === "no-speech" && !transcriptRef.current) {/* keep listening */}};
    rec.onend = () => {
      recRef.current = null;setListening(false);
      const said = transcriptRef.current;
      if (said) evaluateSpoken(said, target, recLang);
    };
    recRef.current = rec;
    try {rec.start();} catch (e) {recRef.current = null;setListening(false);setHeard("__nomic__");}
  }
  function sentSim(a, b) {
    const words = (s) => deburr(norm(s)).replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((w) => w.length > 1);
    const aw = new Set(words(a));const bw = words(b);
    if (!bw.length) return 0;
    let m = 0;bw.forEach((w) => {if (aw.has(w)) m++;});
    return m / bw.length; // recall over the target words — lenient toward extra/missing words
  }
  const genTokenRef = useRef(0);
  function genSentence(targetCode, attempt, topicOverride, forceNormal) {
    const tc = targetCode || spkTarget;
    const myTok = ++genTokenRef.current;
    if (sentMistMode && !forceNormal) {const list = getSentMist(tc);setRevealed(false);setHeard("");setMsg("");setState("idle");setSent(list.length ? pick(list) : null);return;}
    attempt = attempt || 0;
    setRevealed(false);
    setSent({ loading: true });
    if (!window.__hasAI()) {setSent({ error: 1 });return;}
    const nativeName = recall("kunju-native", "German");
    const targetName = window.CONJ[tc].name;
    const tid = topicOverride || (topicsSel.length ? topicsSel[Math.floor(Math.random() * topicsSel.length)] : "random");
    const theme = allThemes.find((t) => t.id === tid);
    const topic = theme && theme.topic ? theme.topic : SENT_TOPICS[Math.floor(Math.random() * SENT_TOPICS.length)];
    const pool = tenseSel.length ? tenseSel : tenseOpts.map((t) => t.id);
    const chosenId = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    const chosen = chosenId ? (tenseOpts.find((t) => t.id === chosenId) || {}) : {};
    const oneTense = chosen.label || null;
    const tenseTxt = oneTense ? ` Write it so its ${targetName} translation naturally uses the ${oneTense} tense.` : "";
    const rkey = `${tc}|${tid}|${tenseSel.join(",")}`;
    const recent = recentSentRef.current[rkey] || [];
    const avoidTxt = attempt === 0 && recent.length ? ` Make it clearly DIFFERENT from these recent ones (no paraphrases): ${recent.slice(0, 10).map((s) => `"${s}"`).join("; ")}.` : "";
    const seed = Math.floor(Math.random() * 100000);
    const lvlTxt = skill === "advanced" ? " Use richer C1-level vocabulary and a more complex structure that naturally uses a subordinating connector (in the target language e.g. Spanish: aunque, a pesar de que, para que, sin que, mientras; German: obwohl, trotzdem, damit, während, sodass; French: bien que, quoique, afin que, pourtant; Dutch: hoewel, ofschoon, zodat, terwijl)." : skill === "intermediate" ? " Use everyday B1-level vocabulary." : " Use very simple A1\u2013A2 vocabulary and a short, easy structure (max 7 words).";
    const STYLES = [" Make it a normal statement.", " Make it a QUESTION ending with '?'.", " Make it an EXCLAMATION ending with '!'.", " Make it a short line of spoken dialogue (question or exclamation), as in a real conversation."];
    const styleTxt = STYLES[Math.floor(Math.random() * STYLES.length)];
    window.aiComplete(`Write ONE short, natural everyday sentence (max 10 words) in ${nativeName} about ${topic}.${tenseTxt}${lvlTxt}${styleTxt} Make it specific and fresh, NOT a clichéd textbook line (variety seed ${seed}).${avoidTxt} Both sentences MUST end with proper punctuation (. ! or ?). Then give its natural ${targetName} translation. Do NOT use any double-quote (") character inside either sentence. Reply with ONLY minified JSON and nothing else: {"n":"...","t":"..."}`).
    then((txt) => {
      if (genTokenRef.current !== myTok) return;
      let j = null;
      try {j = looseParse(txt);} catch (_) {j = null;}
      if (!j || !j.n || !j.t) {
        if (attempt < 2) {genSentence(tc, attempt + 1, tid);return;}
        setSent({ error: 1 });return;
      }
      recentSentRef.current[rkey] = [j.n, ...recent].slice(0, 30);
      setSent({ n: j.n, t: j.t, tenseLabel: oneTense, tenseId: chosenId });
    }).
    catch(() => {if (genTokenRef.current !== myTok) return;if (attempt < 2) {genSentence(tc, attempt + 1, tid);return;}setSent({ error: 1 });});
  }

  // ---- TEXTE: individualized AI stories ----
  // tolerant parser for JSON arrays (looseParse only handles single objects)
  const parseArr = (txt) => {
    let s = String(txt || "").replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const a = s.indexOf("[");
    if (a >= 0) s = s.slice(a);
    const b = s.lastIndexOf("]");
    try { const j = JSON.parse(b > 0 ? s.slice(0, b + 1) : s); if (Array.isArray(j) && j.length) return j; } catch (_) {}
    // salvage: extract each {…} object individually — survives truncation, stray text or inner quotes
    const out = [];
    const objRe = /\{[^{}]*\}/g; let m;
    while ((m = objRe.exec(s))) {
      let o = null;
      try { o = JSON.parse(m[0]); } catch (_) { try { o = looseParse(m[0]); } catch (e) { o = null; } }
      if (o && (o.t || o.n || o.q || o.v || o.inf || o.i != null)) out.push(o);
    }
    return out.length ? out : null;
  };
  // shared story library (Supabase) — each topic×level×language combo is generated once, then reused for everyone
  async function libFetch(lg, topic, level, tenses) {
    if (!window.__supa) return [];
    try {
      const { data } = await window.__supa.from("texte_stories").select("sentences,questions").eq("lang", lg).eq("topic", topic).eq("level", level).eq("tenses", tenses).limit(40);
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }
  function libInsert(lg, topic, level, tenses, sentences, questions) {
    if (!window.__supa) return;
    try { window.__supa.from("texte_stories").insert({ lang: lg, topic, level, tenses, sentences, questions: questions || null }).then(() => {}, () => {}); } catch (e) {}
  }
  function useStoryRow(row, tid) {
    const sents = (row.sentences || []).filter((s) => s && s.t);
    if (!sents.length) { setStory({ error: 1 }); return; }
    lastStoryRef.current = sents[0].t;
    setStory({ sentences: sents, questions: Array.isArray(row.questions) ? row.questions : null, topic: themeLabel(tid), gen: ++genRef.current });
  }
  async function buildQuestions(sentences, nativeName) {
    try {
      const full = sentences.map((s) => s.t).join(" ");
      const prompt = `Read this story:\n"${full}"\nWrite 3 simple reading-comprehension questions about it in ${nativeName}, each with exactly 3 short answer options where only ONE is correct. Do NOT use double-quote characters inside any text. Reply with ONLY a minified JSON array and nothing else: [{"q":"<question in ${nativeName}>","options":["<a>","<b>","<c>"],"answer":"<exact text of the correct option>"}]`;
      const txt = await window.aiComplete(prompt);
      let arr = parseArr(txt);
      arr = (Array.isArray(arr) ? arr : []).filter((x) => x && x.q && Array.isArray(x.options) && x.options.length && x.answer);
      return arr.length ? arr : null;
    } catch (e) { return null; }
  }
  // pull the already-complete {"t":"..."} sentences out of a partial (streaming) JSON array
  const parsePartial = (acc) => {
    const out = []; const re = /\{\s*"t"\s*:\s*"([^"]*)"\s*\}/g; let m;
    while ((m = re.exec(acc))) { const t = m[1].trim(); if (t) out.push({ t }); }
    return out;
  };
  // build only the story prose (fast first paint); verbs + questions are added afterwards.
  // onProgress(partialSentences) is called as sentences stream in.
  async function buildProse(myTok, tid, onProgress, myWords) {
    const nativeName = recall("kunju-native", "German");
    const targetName = window.CONJ[lang].name;
    const N = skill === "advanced" ? 35 : skill === "intermediate" ? 28 : 25;
    const theme = allThemes.find((t) => t.id === tid);
    const topic = theme && theme.topic ? theme.topic : SENT_TOPICS[Math.floor(Math.random() * SENT_TOPICS.length)];
    const isSubset = tenseSel.length > 0 && tenseSel.length < tenseOpts.length;
    const selLabels = (tenseSel.length ? tenseSel : tenseOpts.map((t) => t.id)).map((id) => (tenseOpts.find((t) => t.id === id) || {}).label).filter(Boolean);
    const tenseTxt = isSubset
      ? ` IMPORTANT: write the narration so that the verbs are PREDOMINANTLY in the ${targetName} ${selLabels.join(" / ")} tense${selLabels.length > 1 ? "s" : ""} — keep that tense focus throughout wherever it reads naturally.`
      : ` Use a natural mix of ${targetName} tenses.`;
    const grpHint = selGroup === "irregular" ? " Prefer common irregular verbs where it stays natural." : selGroup === "regular" ? " Prefer regular verbs where it stays natural." : "";
    const myWordsTxt = (myWords && myWords.length) ? ` IMPORTANT: the learner is practising these ${targetName} words/verbs — weave AS MANY of them as you naturally can into the story, used correctly and in context (integrate them, never just list them): ${myWords.join(", ")}.` : "";
    const ADV_CONN = { es: "aunque, a pesar de que, mientras, puesto que, sin embargo, de modo que, no obstante", de: "obwohl, während, da, sodass, dennoch, wohingegen, indessen", fr: "bien que, quoique, tandis que, puisque, néanmoins, de sorte que", nl: "hoewel, terwijl, aangezien, zodat, niettemin, ofschoon", en: "although, while, since, so that, nevertheless, whereas" };
    const styleTxt = skill === "advanced"
      ? ` Write LITERARY, flowing C1-level ${targetName} prose: long, complex sentences with subordinate, relative and concessive clauses, the subjunctive where natural, varied connectors (${ADV_CONN[lang] || ADV_CONN.en}), rich and idiomatic vocabulary, vivid sensory description and some dialogue. NEVER write short, choppy or list-like sentences — weave the ideas into elegant, varied prose.`
      : skill === "intermediate"
      ? ` Write natural, everyday B1-level ${targetName} with varied sentence length, connectors and some subordinate clauses, and a real narrative flow (not isolated short sentences).`
      : ` Write very simple A1–A2 ${targetName} with short, clear sentences and basic connectors, while still telling one coherent little story.`;
    const seed = Math.floor(Math.random() * 100000);
    // advance by the sentences actually received — one big call when the worker's max_tokens is high,
    // automatically several smaller ones when it is low. Robust either way.
    let sentences = [];
    let guard = 0;
    while (sentences.length < N && guard < 12) {
      guard++;
      if (storyTokenRef.current !== myTok) return null;
      const ask = Math.min(N - sentences.length, 40);
      const isFirst = sentences.length === 0;
      const isLast = sentences.length + ask >= N;
      const intro = isFirst
        ? ` This is the OPENING: establish a vivid setting, one or two named characters, and a small conflict or goal about ${topic} that drives the plot.`
        : ` CONTINUE the same story with the SAME characters and setting; advance the plot and do NOT repeat earlier events. The story so far ends: "${sentences.slice(-3).map((s) => s.t).join(" ")}".`;
      const endTxt = isLast ? " In these final sentences, resolve the conflict and give the story a satisfying, rounded ending." : "";
      const prompt = `You are writing a real short story (a "Kurzgeschichte") in ${targetName}; write ${ask} more sentences now.${styleTxt}${intro}${tenseTxt}${grpHint}${myWordsTxt}${endTxt} Keep the SAME narrative voice and tense register throughout. CRUCIAL — vary the sentence openings strongly: NEVER begin two sentences in a row with the same word or with the subject's name; open different sentences with time or place adverbials, subordinate or participial clauses, prepositional phrases, direct speech, or an object — and refer to the protagonist mostly with pronouns or epithets instead of repeating the name. Vary sentence length, rhythm and structure, and do NOT mirror the structure of the previous sentences. Variety seed ${seed}+${sentences.length}. Do NOT use any double-quote (") character inside any sentence. Reply with ONLY a minified JSON array and nothing else: [{"t":"<${targetName} sentence>"}]`;
      let arr = null;
      for (let att = 0; att < 3 && !(Array.isArray(arr) && arr.length); att++) {
        if (att) await new Promise((r) => setTimeout(r, 900 * att));
        if (storyTokenRef.current !== myTok) return null;
        let lastShown = sentences.length;
        try {
          const txt = window.aiStream ? await window.aiStream(prompt, (acc) => {
            if (storyTokenRef.current !== myTok) return;
            const partial = sentences.concat(parsePartial(acc));
            if (partial.length > lastShown) { lastShown = partial.length; if (onProgress) onProgress(partial.slice(0, N)); setGenProg(Math.min(partial.length, N) + " / " + N); }
          }) : await window.aiComplete(prompt);
          arr = parseArr(txt);
        } catch (_) { arr = null; }
      }
      if (storyTokenRef.current !== myTok) return null;
      const before = sentences.length;
      if (Array.isArray(arr) && arr.length) sentences = sentences.concat(arr.filter((s) => s && s.t).map((s) => ({ t: String(s.t).trim() })));
      if (storyTokenRef.current === myTok) { setGenProg(Math.min(sentences.length, N) + " / " + N); if (onProgress && sentences.length) onProgress(sentences.slice(0, N)); }
      if (sentences.length === before) { if (sentences.length) break; return null; }
    }
    return sentences.length ? sentences : null;
  }
  // after the prose is on screen, fill in cloze verb tags + comprehension questions in parallel, then cache
  async function enrichStory(myTok, tid, level, tsig, sentences, cache) {
    const nativeName = recall("kunju-native", "German");
    let questions = null;
    try { questions = await buildQuestions(sentences, nativeName); } catch (e) {}
    if (storyTokenRef.current !== myTok) return;
    setStory((prev) => (prev && prev.gen === genRef.current ? { ...prev, questions: questions || prev.questions || null, enriching: false } : prev));
    if (cache) libInsert(lang, tid, level, tsig, sentences, questions);
    const shuffle = (x) => ({ q: x.q, answer: x.answer, options: (x.options || []).slice().sort(() => Math.random() - 0.5) });
    setQuestions(questions && questions.length ? questions.map(shuffle) : { error: 1 });
  }
  // collect the learner's saved words (vocabulary) + saved verbs for the current language
  function gatherMyWords() {
    let words = [];
    try { words = (getVocab() || []).filter((v) => v.lang === lang && v.term).map((v) => String(v.term).trim()); } catch (e) {}
    const verbs = (favs || []).filter((f) => f.lang === lang && f.verb).map((f) => String(f.verb).replace(/^to /, "").trim());
    const all = []; const seen = {};
    verbs.concat(words).forEach((w) => { const k = (w || "").toLowerCase(); if (w && !seen[k]) { seen[k] = 1; all.push(w); } });
    for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const tmp = all[i]; all[i] = all[j]; all[j] = tmp; }
    return all.slice(0, 25);
  }
  async function genStory(forceNew) {
    const myTok = ++storyTokenRef.current;
    setStory({ loading: true }); setQuestions(null); setClozeItem(null);
    setStoryIdx(0); setQIdx(0); setVal(""); setState("idle"); setMsg(""); setPicked(null); setExplain(""); setGenProg(""); setTransOpen(false); setStoryTrans(null); setReading("idle"); readIdxRef.current = 0; setReadIdx(0);
    if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch (e) {}
    const tid = topicsSel.length ? topicsSel[Math.floor(Math.random() * topicsSel.length)] : "random";
    const level = skill || "beginner";
    const tsig = (!tenseSel.length || tenseSel.length === allTenseIds.length) ? "mix" : tenseSel.slice().sort().join(",");
    const TARGET = 8; // keep growing the library until this many variants exist per combo
    const myWords = useMyWordsRef.current ? gatherMyWords() : [];
    const personalized = myWords.length > 0;
    // 1) shared library first — instant and free (skipped for personalised "my words" stories)
    if (!personalized) {
      const lib = await libFetch(lang, tid, level, tsig);
      if (storyTokenRef.current !== myTok) return;
      if (lib.length && (!forceNew || lib.length >= TARGET)) {
        let row = lib[Math.floor(Math.random() * lib.length)];
        for (let i = 0; i < 5 && lib.length > 1 && row.sentences && row.sentences[0] && row.sentences[0].t === lastStoryRef.current; i++) {
          row = lib[Math.floor(Math.random() * lib.length)];
        }
        useStoryRow(row, tid);
        return;
      }
    }
    // 2) generate (stream live), then enrich; cache only generic (non-personalised) stories
    if (!window.__hasAI()) { setStory({ error: 1 }); return; }
    const myGen = ++genRef.current;
    const sentences = await buildProse(myTok, tid, (partial) => {
      if (storyTokenRef.current !== myTok || !partial || !partial.length) return;
      lastStoryRef.current = partial[0].t;
      setStory({ sentences: partial, questions: null, topic: themeLabel(tid), enriching: true, streaming: true, gen: myGen });
    }, myWords);
    if (storyTokenRef.current !== myTok) return;
    if (!sentences || !sentences.length) { setStory({ error: 1 }); return; }
    lastStoryRef.current = sentences[0].t;
    setStory({ sentences, questions: null, topic: themeLabel(tid), enriching: true, gen: myGen });
    enrichStory(myTok, tid, level, tsig, sentences, !personalized);
  }
  function genQuestions() {
    if (!story || !story.sentences) return;
    const myTok = ++qTokRef.current;
    setQIdx(0); setVal(""); setState("idle"); setPicked(null);
    const shuffle = (x) => ({ q: x.q, answer: x.answer, options: (x.options || []).slice().sort(() => Math.random() - 0.5) });
    if (Array.isArray(story.questions) && story.questions.length) { setQuestions(story.questions.map(shuffle)); return; }
    setQuestions({ loading: true });
    if (story.enriching) return; // background enrichment will deliver the questions
    buildQuestions(story.sentences, recall("kunju-native", "German")).then((arr) => {
      if (qTokRef.current !== myTok) return;
      setQuestions(arr && arr.length ? arr.map(shuffle) : { error: 1 });
    });
  }
  // cloze gaps now come from the stored verb tags — no per-sentence AI call
  function prepCloze(idx) {
    const s = story && story.sentences && story.sentences[idx];
    if (!s) { setClozeItem(null); return; }
    const form = s.v ? String(s.v).trim() : "";
    if (!form) { setClozeItem({ full: s.t, gap: s.t, answer: "", nogap: true }); return; }
    const e = form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let re; try { re = new RegExp("(?<![\\p{L}])" + e + "(?![\\p{L}])", "u"); } catch (x) { re = new RegExp("\\b" + e + "\\b"); }
    let gap = s.t, hit = false;
    if (re.test(s.t)) { gap = s.t.replace(re, "…"); hit = true; }
    const tlabel = s.tns || "";
    const topt = tenseOpts.find((t) => t.label && tlabel && t.label.toLowerCase() === tlabel.toLowerCase());
    setClozeItem({ full: s.t, gap: hit ? gap : s.t, answer: hit ? form : "", inf: s.inf || "", tenseLabel: tlabel, tenseId: topt ? topt.id : null, nogap: !hit });
  }
  function checkTexte() {
    if (state !== "idle") return;
    if (texteMode === "translate") {
      const s = story && story.sentences && story.sentences[storyIdx];
      if (!s) return;
      const ok = sentSim(val, s.t) >= 0.6 || deburr(norm(val)) === deburr(norm(s.t));
      setState(ok ? "correct" : "wrong"); setMsg(ok ? praiseLine() : cheerLine());
    } else if (texteMode === "cloze") {
      const it = clozeItem;
      if (!it || !it.answer) return;
      const exact = norm(val) === norm(it.answer);
      const accentOnly = !exact && deburr(norm(val)) === deburr(norm(it.answer)) && norm(val).length > 0;
      const ok = exact || accentOnly;
      setState(ok ? "correct" : "wrong");
      setMsg(accentOnly ? tr("accent_hint", { answer: it.answer }) : ok ? praiseLine() : cheerLine());
      if (!ok) { const hint = tenseHint(lang, it.tenseId) || ""; setExplain((it.tenseLabel || "") + (hint ? (it.tenseLabel ? " · " : "") + hint : "")); }
    }
    onActivity && onActivity();
  }
  function chooseTexte(opt) {
    if (state !== "idle") return;
    const qq = questions && questions[qIdx];
    if (!qq) return;
    setPicked(opt);
    const ok = norm(opt) === norm(qq.answer);
    setState(ok ? "correct" : "wrong"); setMsg(ok ? praiseLine() : cheerLine());
    onActivity && onActivity();
  }
  function nextTexte() {
    setVal(""); setState("idle"); setMsg(""); setPicked(null); setExplain("");
    if (texteMode === "question") {
      setQIdx((i) => (questions && i + 1 <= questions.length ? i + 1 : i));
    } else {
      const total = story && story.sentences ? story.sentences.length : 0;
      const ni = storyIdx + 1;
      setStoryIdx(ni);
      if (texteMode === "cloze" && ni < total) prepCloze(ni);
    }
  }
  function pickTexteMode(m) { setTexteMode(m); persist("kunju-textemode", m); }
  // collapsible native-language translation (open by default for beginners)
  // translate the whole story into the user's native language on demand (cached locally), then show it
  // read the story aloud sentence by sentence so it can be paused and resumed at the same spot
  function setReading(v) { readingRef.current = v; setReadingState(v); }
  function speakFrom(idx) {
    const sents = (story && story.sentences) || [];
    if (idx >= sents.length) { setReading("idle"); readIdxRef.current = 0; setReadIdx(0); return; }
    readIdxRef.current = idx; setReadIdx(idx);
    const txt = String(sents[idx].t || "").replace(/…/g, " ").replace(/\s+/g, " ").trim();
    try { window.speechSynthesis.cancel(); } catch (e) {}
    if (!txt) { speakFrom(idx + 1); return; }
    let u; try { u = new SpeechSynthesisUtterance(txt); } catch (e) { setReading("idle"); return; }
    const lng = window.CONJ[lang].ttsLang; const v = pickVoice(lng);
    u.lang = (v && v.lang) || lng; u.rate = TTS_RATE; if (v) u.voice = v;
    u.onend = () => { if (readingRef.current === "playing") speakFrom(idx + 1); };
    try { window.speechSynthesis.speak(u); } catch (e) {}
  }
  function playStory() {
    if (!story || !story.sentences || !story.sentences.length || !window.speechSynthesis) return;
    if (readingRef.current === "paused") {
      setReading("playing");
      try { window.speechSynthesis.resume(); } catch (e) {}
      // iOS fallback: if the paused utterance got dropped, restart from the current sentence
      setTimeout(() => { try { if (readingRef.current === "playing" && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) speakFrom(readIdxRef.current); } catch (e) {} }, 260);
      return;
    }
    setReading("playing"); speakFrom(0);
  }
  function pauseStory() { setReading("paused"); try { window.speechSynthesis.pause(); } catch (e) {} }
  function rewindStory() {
    if (!story || !story.sentences || !story.sentences.length) return;
    const ni = Math.max(0, readIdxRef.current - 2); // ~ a couple of sentences ≈ 5–10 s
    setReading("playing"); speakFrom(ni);
  }
  function stopStory() { setReading("idle"); readIdxRef.current = 0; setReadIdx(0); try { window.speechSynthesis.cancel(); } catch (e) {} }
  function ensureStoryTrans() {
    if (storyTrans != null) return;
    const sents = (story && story.sentences) || [];
    if (!sents.length) return;
    const native = recall("kunju-native", "German");
    const full = sents.map((s) => s.t).join(" ");
    const key = `kunju-stortr-${native}-${strHash(full)}`;
    const cached = recall(key, null);
    if (cached) { setStoryTrans(cached); return; }
    if (!window.__hasAI()) { setStoryTrans("—"); return; }
    setStoryTrans("…");
    const targetName = window.CONJ[lang].name;
    window.aiComplete(`Translate this ${targetName} short story into natural, fluent ${native}. Stay faithful to the original and keep the same flow. Reply with ONLY the ${native} translation, no quotes and no extra text:\n\n${full}`).
    then((txt) => { const out = String(txt || "").trim().replace(/^["'«»]+|["'«»]+$/g, ""); if (out) { persist(key, out); setStoryTrans(out); } else setStoryTrans("—"); }).
    catch(() => setStoryTrans("—"));
  }
  function nativeTrans() {
    if (!story || !story.sentences) return null;
    return (
      <div className="texte-trans">
        <button onClick={() => setTransOpen((o) => { const nv = !o; if (nv) ensureStoryTrans(); return nv; })} style={{ background: "none", border: "none", color: LANG_META[lang].color, cursor: "pointer", fontWeight: 600, fontSize: ".82rem", padding: "4px 0", marginTop: "4px" }}>
          {(transOpen ? "▾ " : "▸ ") + tr("texte_translation")}
        </button>
        {transOpen && <div className="clozenative" style={{ marginTop: "2px", textAlign: "left", lineHeight: 1.6 }}>{storyTrans || "…"}</div>}
      </div>);
  }
  // (re)generate the story when entering Texte mode or when the selection / level changes
  useEffect(() => { if (mode === "texte") genStory(); /* eslint-disable-next-line */ }, [mode, lang, skill, topicsSel.join(","), tenseSel.join(",")]);
  // when the story is ready or the sub-mode changes, prepare that sub-mode's task
  useEffect(() => {
    if (mode !== "texte" || !story || !story.sentences) return;
    setStoryIdx(0); setQIdx(0); setVal(""); setState("idle"); setMsg(""); setPicked(null); setExplain(""); setTransOpen(false); setStoryTrans(null);
    if (texteMode === "question") genQuestions();
    else if (texteMode === "cloze") prepCloze(0);
    /* eslint-disable-next-line */
  }, [texteMode, story && story.gen]);
  useEffect(() => { texteModeRef.current = texteMode; }, [texteMode]);
  useEffect(() => { storyIdxRef.current = storyIdx; }, [storyIdx]);
  useEffect(() => { if (mode !== "texte") { setReading("idle"); readIdxRef.current = 0; try { window.speechSynthesis.cancel(); } catch (e) {} } /* eslint-disable-next-line */ }, [mode]);
  useEffect(() => { if (reading !== "idle" && sentRefs.current[readIdx]) { try { sentRefs.current[readIdx].scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {} } /* eslint-disable-next-line */ }, [readIdx, reading]);
  const texteLoading = mode === "texte" && !!(story && story.loading);
  useEffect(() => {
    if (!texteLoading) return;
    setGenSecs(0);
    const id = setInterval(() => setGenSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [texteLoading]);

  const pct = score.total ? Math.round(score.right / score.total * 100) : 0;
  const mistakes = (mver, getMistakes(lang));
  const MODES = [{ id: "cards", label: tr("m_cards"), icon: "🃏" }, { id: "choice", label: tr("m_choice"), icon: "◉" }, { id: "type", label: tr("m_type"), icon: "⌨" }, { id: "speak", label: tr("m_speak"), icon: "🎤" }, { id: "texte", label: tr("m_texte"), icon: "📖" }];
  // normalized set of the learner's saved words/verbs (to underline them in stories)
  const savedSet = useMemo(() => {
    const s = new Set();
    try { (getVocab() || []).forEach((v) => { if (v.lang === lang && v.term) s.add(deburr(norm(v.term))); }); } catch (e) {}
    (favs || []).forEach((f) => { if (f.lang === lang && f.verb) s.add(deburr(norm(String(f.verb).replace(/^to /, "")))); });
    return s;
  }, [lang, favs, story, mver]);

  function TenseBar() {
    if (mistMode) return null;
    const isRev = cardDir === "target";
    const fromC = isRev ? LANG_META[lang].code : nativeLangCode;
    const toC   = isRev ? nativeLangCode : LANG_META[lang].code;
    const dcap  = isRev ? tr("dir_recognize") : tr("dir_produce");
    return (
      <div className="quiztenses">
        <div className="qfilter-block">
          <div className="recent-title qfilter-lbl">{tr("which_tense")}</div>
          <TenseDropdown lang={lang} tenses={[...tenseOpts].sort((a, b) => (a.label || "").localeCompare(b.label || ""))} isOn={(id) => tenseSel.indexOf(id) >= 0} onToggle={toggleTense} onAll={() => setAllTenses(true)} onNone={() => setAllTenses(false)} hideLbl />
          {!tenseSel.length && <div className="qfilter-hint">{tr("none_all")}</div>}
        </div>
        {groups.length > 1 &&
        <div className="qfilter-block">
          <div className="recent-title qfilter-lbl">{tr("which_verbs")}</div>
          <OneDropdown lang={lang} options={groups.map((g) => ({ id: g.id, label: groupLabel(g) }))} valueId={selGroup} onPick={setSelGroup} />
        </div>}
        {mode !== "choice" && mode !== "texte" &&
        <div className="qfilter-block">
          <div className="recent-title qfilter-lbl">{tr("which_dir")}</div>
          <div className="tdwrap" style={{ "--lc": LANG_META[lang].color }}>
            <button className="tdbtn swap" onClick={() => { const d = isRev ? "native" : "target"; setCardDir(d); persist("kunju-carddir", d); setThisDir(d); if (d === "native" && q) fetchTransl(q.verb); }} title={tr("which_dir")}>
              <span className="tdbtn-sum">
                <span className="swapcode">{fromC}</span>
                <i className="swaparrow">→</i>
                <span className="swapcode">{toC}</span>
                <span className="swapcap">{dcap}</span>
              </span>
              <span className="tdbtn-caret swapcaret">⇄</span>
            </button>
          </div>
        </div>}
        <div className="qfilter-block">
          <div className="recent-title qfilter-lbl">{tr("which_theme")}</div>
          <MultiDropdown lang={lang} options={allThemes.map((th) => ({ id: th.id, label: themeLabel(th.id) })).sort((a, b) => a.label.localeCompare(b.label))} isOn={(id) => topicsSel.includes(id)} onToggle={toggleTopic} onAll={() => setTopicsSel(["random"])} onNone={() => setTopicsSel(["random"])} />
        </div>
      </div>);
  }

  function MistakeBar() {
    const inMist = mistMode;
    if (!inMist && mistakes.length === 0) return null;
    return (
      <button className={"mistbtn" + (inMist ? " on" : "")} onClick={() => {setMistMode(!inMist);if (!inMist) {setSelGroup("all");setTypeMode("form");setSpkMode("form");}}}>
        <span className="mistbtn-ic">{inMist ? "←" : "⚠"}</span>
        <span className="mistbtn-tx">{inMist ? tr("mist_exit") : tr("mist_practice")}</span>
        <span className="mistbtn-n">{mistakes.length}</span>
      </button>);

  }

  function ClozeThemes() {
    return (
      <div className="tfilter spkthemes scrollthemes clozethemes">
        {allThemes.map((th, i) =>
        <button key={th.id} className={"tfilterchip" + (topicsSel.includes(th.id) ? " on" : "")} style={{ "--cc": RAINBOW[i % RAINBOW.length] }} onClick={() => pickClozeTopic(th.id)}>
            <span className="dotmini"></span>{themeLabel(th.id)}
          </button>
        )}
      </div>);

  }

  function ScoreLine() {
    return null;
  }

  function Prompt() {
    return (
      <div className="quizprompt" style={{ "--lc": LANG_META[lang].color }}>
        <button className="quizverb quizverb-link" title={tr("view_conj")} onClick={() => onStudy && onStudy(lang, q.verb)}>{q.verb} <span className="qm-study-ic">↗</span></button>
        <span className="quizarrow">→</span>
        <span className="quizpron">{q.pronoun}</span>
      </div>);

  }

  return (
    <div className="view" style={{ "--lc": LANG_META[lang].color }}>
      <React.Fragment>
          <div className="quizmodes">
            {MODES.map((m, i) =>
          <button key={m.id} className={"qmode" + (mode === m.id ? " on" : "")} style={{ "--mc": LANG_META[lang].color }} onClick={() => setModeP(m.id)}>
                <span className="qmode-ic"><QModeIcon id={m.id} /></span>
                <span className="qmode-lb">{m.label.replace(/^[^\s]+\s/, "")}</span>
              </button>
          )}
          </div>
          <p className="quizintro-line">💡 {tr("mdesc_" + mode)}</p>

          {TenseBar()}

      {mistMode && mistakes.length === 0 &&
      <div className="mistdone">
          <div className="mistdone-ic">🎉</div>
          <h3>{tr("mist_clear_title")}</h3>
          <p>{tr("mist_clear_sub")}</p>
          <button className="quizbtn check" onClick={() => setMistMode(false)}>{tr("mist_exit")}</button>
        </div>
      }

      {/* ---- TYPE ---- */}
      {mode === "type" && q &&
      <React.Fragment>
          <ScoreLine />
          <div className="modepick speakpick">
            <span className="modepick-label">⌨ {tr("spk_what")}</span>
            <div className="modegrid speakmodes">
              <button className={"modebtn" + (typeMode === "form" ? " on" : "")} onClick={() => {setTypeMode("form");}}>{tr("type_word")}</button>
              <button className={"modebtn" + (typeMode === "sentence" ? " on" : "")} onClick={() => {setTypeMode("sentence");setVal("");setState("idle");setRevealed(false);genSentence(lang);}}>{tr("type_sentence")}</button>
            </div>
          </div>
          {typeMode === "form" ?
        <React.Fragment>
          <div className={"quizcard quizmodern " + state} style={{ "--lc": LANG_META[lang].color }}>
            <div className="cards-cue cards-cue-top">💬 {tr("cards_hint_type")}</div>
            <div className="qm-top" data-typequiz="true">
              <span className="flashtense">{q.tenseLabel}{skill !== "advanced" && (tenseHint(lang, q.tenseId) || auxHint(lang, q.tenseId, q.answer)) ? <span className="flashhint-inline">{tenseHint(lang, q.tenseId) || auxHint(lang, q.tenseId, q.answer)}</span> : null}</span>
              {q.isIrregular && <span className="flashtag">{tr("irregular")}</span>}
              <button className={"starbtn qm-star" + (favs.some((x) => x.lang === lang && x.verb === q.verb) ? " on" : "")} title="Save verb" onClick={() => toggleFav(lang, q.verb)}>{favs.some((x) => x.lang === lang && x.verb === q.verb) ? "★" : "☆"}</button>
            </div>
            <div className="qm-prompt">
              <button className="flashverb flashverb-link" title={tr("view_conj")} onClick={() => onStudy && onStudy(lang, q.verb)}>{q.verb.replace(/^to /, "")} <span className="qm-study-ic">↗</span></button>
              <span className="flashpron">{q.pronoun}</span>
            </div>
            <div className="qm-mean">{transl ? <React.Fragment><b>{q.verb.replace(/^to /, "")}</b><em>{transl === "…" ? "…" : transl}</em></React.Fragment> : <span className="qm-mean-ph">·</span>}</div>
            {cloze && (cloze.loading ? <div className="spkreveal"><span className="exloading">…</span></div> :
          <div className="spkreveal">
                <div className="spkreveal-row">
                  <WordSentence text={state === "idle" ? cloze.gap : cloze.full} fromName={window.CONJ[lang].name} toName={recall("kunju-native", "German")} cachePrefix={`kunju-wtr-${lang}-nat`} big={true} accent={true} saveLang={lang} saveDir="fromTarget" showHint={true} />
                  {state !== "idle" && <button className="flashspeak" onClick={() => speak(cloze.full, q.ttsLang)}>🔊</button>}
                </div>
                {cloze.native && (skill === "beginner" || state !== "idle") && <div className="clozenative">{cloze.native}</div>}
              </div>)}
            <div className="quizinput">
              <input ref={inRef} value={val} placeholder="…" disabled={state !== "idle"}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {if (e.key === "Enter") {state === "idle" ? check() : next();}}}
            autoComplete="off" autoCapitalize="off" spellCheck="false" style={{ height: "40px" }} />
            </div>
            {state === "correct" && <div className="feedback ok">✓ {msg || tr("correct_excl")}</div>}
            {state === "wrong" && <div className="feedback no">{msg ? msg + " · " : "✗ "}{tr("answer")} <b>{q.answer}</b></div>}
            {state === "idle" ?
          <button className="quizbtn check qm-check" onClick={check}>{tr("check")}</button> :
          <button className="quizbtn next" onClick={next}>{tr("next")}</button>}
          </div>
          <p className="quizhint">{tr("hint_type")}</p>
        </React.Fragment> :

        <div className={"quizcard quizmodern " + state} style={{ "--lc": LANG_META[lang].color }}>
            <div className="qm-top"><span className="flashtense">{sent && sent.tenseLabel ? sent.tenseLabel : tr("type_sentence")}{sent && sent.tenseId && skill !== "advanced" && tenseHint(lang, sent.tenseId) ? <span className="flashhint-inline">{tenseHint(lang, sent.tenseId)}</span> : null}</span></div>
            {!sent || sent.loading ? <div className="qm-prompt"><span className="exloading">…</span></div> :
          sent.error ? <div className="qm-prompt"><span className="exloading">—</span></div> :
          <React.Fragment>
                <div className="spkreveal">
                  <div className="spkreveal-label">{tr("spk_translate")}</div>
                  <div className="spkreveal-row">
                    <WordSentence text={sent.n} fromName={recall("kunju-native", "German")} toName={window.CONJ[lang].name} cachePrefix={`kunju-wtr-nat-${lang}`} big={true} saveLang={lang} saveDir="fromNative" />
                  </div>
                </div>
                <div className="quizinput">
                  <input ref={inRef} value={val} placeholder="…" disabled={state !== "idle"}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {if (e.key === "Enter") {state === "idle" ? check() : next();}}}
              autoComplete="off" autoCapitalize="off" spellCheck="false" />
                </div>
                {state === "correct" && <div className="feedback ok">✓ {msg || tr("correct_excl")}</div>}
                {state === "wrong" && <div className="feedback no">{msg || "✗"}</div>}
                {state !== "idle" &&
            <div className="spkreveal">
                    <div className="spkreveal-label">{tr("spk_correct_is")} <span className="spkreveal-tap">· {tr("tap_save")}</span></div>
                    <div className="spkreveal-row">
                      <WordSentence text={sent.t} fromName={window.CONJ[lang].name} toName={recall("kunju-native", "German")} cachePrefix={`kunju-wtr-${lang}-nat`} big={true} accent={true} saveLang={lang} saveDir="fromTarget" />
                      <button className="flashspeak" onClick={() => speak(sent.t, window.CONJ[lang].ttsLang)}>🔊</button>
                    </div>
                  </div>
            }
                {state === "idle" ?
            <button className="quizbtn check qm-check" onClick={check}>{tr("check")}</button> :
            <button className="quizbtn next" onClick={() => {setVal("");setState("idle");setRevealed(false);setMsg("");genSentence(lang);}}>{tr("spk_next_sentence")}</button>}
              </React.Fragment>}
          </div>}
        </React.Fragment>
      }

      {/* ---- TEXTE (individualized AI stories) ---- */}
      {mode === "texte" &&
      <React.Fragment>
          {reading !== "idle" && story && story.sentences && typeof ReactDOM !== "undefined" && ReactDOM.createPortal(
          <div style={{ position: "absolute", right: "12px", bottom: "calc(12px + env(safe-area-inset-bottom))", zIndex: 4000, display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "999px", boxShadow: "0 10px 30px rgba(0,0,0,.24)", padding: "7px 12px 7px 14px" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, color: LANG_META[lang].color, whiteSpace: "nowrap" }}>{readIdx + 1}/{story.sentences.length}</span>
            <button onClick={rewindStory} title="−10 s" style={{ border: "1px solid var(--border)", borderRadius: "999px", width: "40px", height: "36px", background: "var(--surface-2)", color: "var(--text)", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>↺10</button>
            <button onClick={() => reading === "playing" ? pauseStory() : playStory()} style={{ border: "none", borderRadius: "999px", width: "40px", height: "36px", background: LANG_META[lang].color, color: "#fff", fontSize: "15px", cursor: "pointer" }}>{reading === "playing" ? "⏸" : "▶"}</button>
            <button onClick={stopStory} style={{ border: "1px solid var(--border)", borderRadius: "999px", width: "40px", height: "36px", background: "var(--surface-2)", color: "var(--text)", fontSize: "13px", cursor: "pointer" }}>⏹</button>
          </div>, ((typeof document !== "undefined" && document.querySelector(".phone")) || document.body))}
          <div className="quiztenses">
            {(getVocab().some((v) => v.lang === lang) || favs.some((f) => f.lang === lang)) &&
            <div className="qfilter-block">
              <div className="recent-title qfilter-lbl">{tr("texte_mywords_lbl")}</div>
              <button className={"modebtn" + (useMyWords ? " on" : "")} style={{ width: "100%" }} onClick={() => { const nv = !useMyWords; setUseMyWords(nv); useMyWordsRef.current = nv; persist("kunju-texte-mywords", nv); genStory(true); }}>★ {tr("texte_mywords")}{useMyWords ? " ✓" : ""}</button>
            </div>}
            <div className="qfilter-block">
              <div className="recent-title qfilter-lbl">{tr("texte_speed")}</div>
              <div className="modegrid">
                {[[0.5, "0,5×"], [0.75, "0,75×"], [1, "1×"], [1.25, "1,25×"]].map((o) => {
                const on = [0.5, 0.75, 1, 1.25].reduce((a, b) => Math.abs(b - ttsRate) < Math.abs(a - ttsRate) ? b : a, 1) === o[0];
                return <button key={o[0]} className={"modebtn" + (on ? " on" : "")} style={{ flex: "1 1 0", minWidth: 0 }} onClick={() => { setTtsRateState(o[0]); applyTtsRate(o[0]); setReading("idle"); readIdxRef.current = 0; if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch (e) {} }}>{o[1]}</button>;
              })}
              </div>
            </div>
            {langVoices.length > 1 &&
            <div className="qfilter-block">
              <div className="recent-title qfilter-lbl">{tr("texte_voice")}</div>
              <div className="modegrid">
                {[["", "Auto"], ["f", "♀ " + tr("texte_voice_f")], ["m", "♂ " + tr("texte_voice_m")]].map((o) =>
              <button key={o[0]} className={"modebtn" + (voiceGenderSel === o[0] ? " on" : "")} style={{ flex: "1 1 0", minWidth: 0 }} onClick={() => { setVoiceGenderSel(o[0]); setSavedGender(ttsBase, o[0]); setSavedVoice(ttsBase, ""); setVoiceSel(""); setReading("idle"); readIdxRef.current = 0; if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch (x) {} if (story && story.sentences && story.sentences[0]) speak(story.sentences[0].t, window.CONJ[lang].ttsLang); }}>{o[1]}</button>
              )}
              </div>
            </div>}
          </div>
          <button className="quizbtn again" onClick={() => genStory(true)} style={{ width: "100%", marginBottom: "10px", minHeight: "42px", padding: "9px 14px", fontSize: "14px" }}>🔄 {tr("texte_new")}</button>
          <div className={"quizcard quizmodern " + state} style={{ "--lc": LANG_META[lang].color }}>
            {!story || story.loading ?
          <div className="qm-prompt"><span className="exloading">…</span>
            <div className="clozenative" style={{ marginTop: "8px" }}>{tr("texte_writing")}{genProg ? " · " + genProg : ""}</div>
            <div className="clozenative" style={{ marginTop: "4px", fontWeight: 700 }}>⏱ {(skill === "advanced" ? 40 : skill === "intermediate" ? 30 : 22) - genSecs > 0 ? "~" + ((skill === "advanced" ? 40 : skill === "intermediate" ? 30 : 22) - genSecs) + " s" : tr("texte_almost")}</div>
            <div className="clozenative" style={{ marginTop: "6px", opacity: .85 }}>{(TEXTE_TIPS[UILANG] || TEXTE_TIPS.en)[Math.floor(genSecs / 4) % (TEXTE_TIPS[UILANG] || TEXTE_TIPS.en).length]}</div>
          </div> :
          story.error ?
          <div className="qm-prompt"><span className="exloading">—</span><div className="clozenative" style={{ marginTop: "8px" }}>{tr("texte_error")}</div></div> :
          <React.Fragment>
                {/* COMPREHENSION: read the whole story, then answer questions */}
                {texteMode === "question" &&
            <React.Fragment>
                    <div className="spkreveal">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "14.5px", color: LANG_META[lang].color }}>📖 {story.topic}</span>
                        <button onClick={() => reading === "playing" ? pauseStory() : playStory()} style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "color-mix(in srgb, " + LANG_META[lang].color + " 14%, var(--surface))", border: "1px solid color-mix(in srgb, " + LANG_META[lang].color + " 35%, transparent)", borderRadius: "999px", padding: "5px 12px", color: LANG_META[lang].color, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: ".8rem", cursor: "pointer", flexShrink: 0 }}>{reading === "playing" ? "⏸ " + tr("texte_pause") : reading === "paused" ? "▶ " + tr("texte_resume") : "🔊 " + tr("texte_read")}</button>
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "3px", marginBottom: "9px" }}>👆 {tr("tap_save")}</div>
                      <div className="spkreveal-row" style={{ lineHeight: "2", display: "block", textAlign: "left", textWrap: "pretty", hyphens: "auto" }}>
                        {story.sentences.map((s, i) =>
                      <span key={i} ref={(el) => { sentRefs.current[i] = el; }} style={{ background: (reading !== "idle" && i === readIdx) ? "color-mix(in srgb, " + LANG_META[lang].color + " 22%, transparent)" : "transparent", borderRadius: "5px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", transition: "background .25s" }}>
                          <WordSentence text={s.t} fromName={window.CONJ[lang].name} toName={recall("kunju-native", "German")} cachePrefix={`kunju-wtr-${lang}-nat`} big={true} accent={true} saveLang={lang} saveDir="fromTarget" wordChip={true} inline={true} savedSet={savedSet} onSaved={() => onTab && onTab("saved")} />{" "}
                        </span>
                      )}
                      </div>
                      {nativeTrans()}
                    </div>
                    {!questions || questions.loading ? <div className="qm-prompt"><span className="exloading">…</span></div> :
              questions.error ? <div className="clozenative" style={{ marginTop: "10px" }}>{tr("texte_error")}</div> :
              qIdx >= questions.length ?
              <div className="mistdone"><div className="mistdone-ic">🎉</div><h3>{tr("texte_done")}</h3></div> :
              <React.Fragment>
                        <div className="choose-label" style={{ marginTop: "12px" }}>{tr("texte_comprehension")} · {qIdx + 1}/{questions.length}</div>
                        <div className="qm-prompt" style={{ fontSize: "1.02rem" }}>{questions[qIdx].q}</div>
                        <div className="qopts">
                          {questions[qIdx].options.map((opt, i) => {
                    let cls = "qopt";
                    if (state !== "idle") {if (norm(opt) === norm(questions[qIdx].answer)) cls += " correct";else if (picked === opt) cls += " wrong";}
                    return <button key={i} className={cls} disabled={state !== "idle"} onClick={() => chooseTexte(opt)}>{opt}</button>;
                  })}
                        </div>
                        {state === "correct" && <div className="feedback ok">✓ {msg || tr("correct_excl")}</div>}
                        {state === "wrong" && <div className="feedback no">{msg || "✗"}</div>}
                        {state !== "idle" && <button className="quizbtn next" onClick={nextTexte}>{tr("next")}</button>}
                      </React.Fragment>}
                  </React.Fragment>}

              </React.Fragment>}
          </div>
        </React.Fragment>
      }

      {/* ---- CHOICE ---- */}
      {mode === "choice" && q &&
      <React.Fragment>
          <ScoreLine />
          <div className={"quizcard quizmodern " + state} style={{ "--lc": LANG_META[lang].color }}>
            <div className="cards-cue cards-cue-top">💬 {tr("cards_hint")}</div>
            <div className="qm-top">
              <span className="flashtense">{q.tenseLabel}{skill !== "advanced" && (tenseHint(lang, q.tenseId) || auxHint(lang, q.tenseId, q.answer)) ? <span className="flashhint-inline">{tenseHint(lang, q.tenseId) || auxHint(lang, q.tenseId, q.answer)}</span> : null}</span>
              {q.isIrregular && <span className="flashtag">{tr("irregular")}</span>}
              <button className={"starbtn qm-star" + (favs.some((x) => x.lang === lang && x.verb === q.verb) ? " on" : "")} title="Save verb" onClick={() => toggleFav(lang, q.verb)}>{favs.some((x) => x.lang === lang && x.verb === q.verb) ? "★" : "☆"}</button>
            </div>
            <div className="qm-prompt">
              <button className="flashverb flashverb-link" title={tr("view_conj")} onClick={() => onStudy && onStudy(lang, q.verb)}>{q.verb.replace(/^to /, "")} <span className="qm-study-ic">↗</span></button>
              <span className="flashpron">{q.pronoun}</span>
            </div>
            <div className="qm-mean">{transl ? <React.Fragment><b>{q.verb.replace(/^to /, "")}</b><em>{transl === "…" ? "…" : transl}</em></React.Fragment> : <span className="qm-mean-ph">·</span>}</div>
            {cloze && (cloze.loading ? <div className="spkreveal"><span className="exloading">…</span></div> :
          <div className="spkreveal">
                <div className="spkreveal-row">
                  <WordSentence text={state === "idle" ? cloze.gap : cloze.full} fromName={window.CONJ[lang].name} toName={recall("kunju-native", "German")} cachePrefix={`kunju-wtr-${lang}-nat`} big={true} accent={true} saveLang={lang} saveDir="fromTarget" />
                  {state !== "idle" && <button className="flashspeak" onClick={() => speak(cloze.full, q.ttsLang)}>🔊</button>}
                </div>
                {cloze.native && (skill === "beginner" || state !== "idle") && <div className="clozenative">{cloze.native}</div>}
              </div>)}
            <div className="choose-label">{tr("choose_label")}</div>
            <div className="qopts">
              {q.options.map((opt, i) => {
              let cls = "qopt";
              if (state !== "idle") {
                if (norm(opt) === norm(q.answer)) cls += " correct";else
                if (opt === picked) cls += " wrong";else
                cls += " dim";
              }
              return <button key={i} className={cls} disabled={state !== "idle"} onClick={() => choose(opt)}>{opt}</button>;
            })}
            </div>
            {state !== "idle" && <button className="quizbtn next" onClick={next}>{tr("next")}</button>}
          </div>
          <p className="quizhint">{tr("hint_choice")}</p>
        </React.Fragment>
      }

      {/* ---- SPEED ---- */}
      {mode === "speed" &&
      <React.Fragment>
          {speedState === "idle" &&
        <React.Fragment>
                  <div className="speedstart">
              <div className="speedbig">⚡</div>
              <h3>{tr("challenge")}</h3>
              <p>{tr("challenge_sub")}</p>
              <div className="speedbest">{tr("best")} <b>{speedBest}</b></div>
              <button className="quizbtn check" onClick={startSpeed}>{tr("start")}</button>
            </div>
            </React.Fragment>
        }

          {speedState === "running" && q &&
        <React.Fragment>
              <div className="speedhud">
                <div className="speedtime"><b>{timeLeft}</b><span>{tr("sec")}</span></div>
                <div className="speedbar"><span className="speedfill" style={{ width: timeLeft / 60 * 100 + "%" }}></span></div>
                <div className="speedpts"><b>{speedScore}</b><span>{tr("pts")}</span></div>
              </div>
              <div className="quizcard">
                <div className="quizmeta"><span className="quizpill">{q.tenseLabel}</span>{q.isIrregular && <span className="quizpill irr">irregular</span>}</div>
                <Prompt />
                <div className="qm-mean" style={{ "--lc": LANG_META[lang].color }}>{transl ? <React.Fragment><b>{q.verb.replace(/^to /, "")}</b><em>{transl === "…" ? "…" : transl}</em></React.Fragment> : <span className="qm-mean-ph">·</span>}</div>
                <div className="qopts">
                  {q.options.map((opt, i) => <button key={i} className="qopt" onClick={() => speedAnswer(opt)}>{opt}</button>)}
                </div>
              </div>
              <p className="quizhint">{tr("go")}</p>
            </React.Fragment>
        }

          {speedState === "done" &&
        <React.Fragment>
          <div className="speedstart">
              <div className="speedbig">🏁</div>
              <h3>{tr("times_up")}</h3>
              <div className="speedresult"><b>{speedScore}</b><span>{tr("in60")}</span></div>
              <div className="speedbest">{speedScore >= speedBest && speedScore > 0 ? tr("new_best") : <>{tr("best")} <b>{speedBest}</b></>}</div>
              <button className="quizbtn check" onClick={startSpeed}>{tr("play_again")}</button>
              <button className="nameskip" onClick={() => setSpeedState("idle")}>{tr("back")}</button>
            </div>
          {speedLog.length > 0 &&
          <div className="speedreview">
              <div className="srev-head">{tr("review")} · <span className="srev-ok">✓ {speedLog.filter((x) => x.ok).length}</span> · <span className="srev-no">✗ {speedLog.filter((x) => !x.ok).length}</span></div>
              <div className="srev-list">
                {speedLog.slice().sort((a, b) => a.ok === b.ok ? 0 : a.ok ? 1 : -1).map((x, i) =>
              <div className={"srev-row " + (x.ok ? "ok" : "no")} key={i}>
                    <span className="srev-mark">{x.ok ? "✓" : "✗"}</span>
                    <span className="srev-ctx">{x.verb.replace(/^to /, "")} · {x.pronoun} <em>{x.tenseLabel}</em></span>
                    <span className="srev-ans">{x.ok ? x.answer : <React.Fragment><s>{x.picked}</s> {x.answer}</React.Fragment>}</span>
                  </div>
              )}
              </div>
            </div>
          }
        </React.Fragment>
        }
        </React.Fragment>
      }

      {/* ---- CARDS ---- */}
      {mode === "cards" && q &&
      <React.Fragment>
          <div className="flashcard" onClick={() => {if (flipped) setFlipped(false);else flipCard();}}>
            {prevCards.length > 0 && <button className="flashback-btn" title={tr("back")} onClick={(e) => {e.stopPropagation();goBackCard();}}>‹</button>}
            <div className={"flashface " + (flipped ? "fback" : "ffront")} key={flipped ? "b" : "f"} style={{ "--lc": LANG_META[lang].color }}>
              {!flipped ?
            <React.Fragment>
                <div className="cards-cue cards-cue-top">💬 {tr("cards_hint")}</div>
                    <div className="flashtop">
                  <span className="flashtense">{q.tenseLabel}{skill !== "advanced" && (tenseHint(lang, q.tenseId) || auxHint(lang, q.tenseId, q.answer)) ? <span className="flashhint-inline">{tenseHint(lang, q.tenseId) || auxHint(lang, q.tenseId, q.answer)}</span> : null}</span>
                  {q.isIrregular && <span className="flashtag">{tr("irregular")}</span>}
                  <button className={"starbtn qm-star" + (favs.some((x) => x.lang === lang && x.verb === q.verb) ? " on" : "")} title="Save verb" onClick={(e) => {e.stopPropagation();toggleFav(lang, q.verb);}}>{favs.some((x) => x.lang === lang && x.verb === q.verb) ? "★" : "☆"}</button>
                </div>
                <div className="flashbody">
                  {thisDir === "native" ?
                    (transl && transl !== "…" ?
                      <span className="flashnative">{transl}</span> :
                      <span className="flashnative" style={{opacity:0.3}}>…</span>
                    ) :
                    <button className="flashverb flashverb-link" title={tr("view_conj")} onClick={(e) => {e.stopPropagation();onStudy && onStudy(lang, q.verb);}}>{q.verb.replace(/^to /, "")} <span className="qm-study-ic">↗</span></button>
                  }
                  <span className="flashpron">{q.pronoun}</span>
                  {cloze && !cloze.loading &&
                <div className="flashcloze" onClick={(e) => e.stopPropagation()}>
                      <WordSentence text={cloze.gap} fromName={window.CONJ[lang].name} toName={nativeName} cachePrefix={`kunju-wtr-${lang}-nat`} big={true} accent={true} />
                    </div>
                }
                </div>
                <div className="flashfoot"><span className="flashflip">↻ {tr("flip")}</span></div>
              </React.Fragment> :
            <React.Fragment>
                <div className="flashtop">
                  <span className="flashctx">{thisDir === "native" && transl && transl !== "…" ? transl + " · " : ""}{q.verb.replace(/^to /, "")} · {q.pronoun}</span>
                  {sound && q.answer !== "—" && <button className="flashspeak" onClick={(e) => {e.stopPropagation();speak(q.answer, q.ttsLang);}}>🔊</button>}
                </div>
                <div className="flashbody">
                  <span className="flashanswer">{q.answer}</span>
                  {cloze && !cloze.loading &&
                <div className="flashcloze" onClick={(e) => e.stopPropagation()}>
                      <WordSentence text={cloze.full} fromName={window.CONJ[lang].name} toName={nativeName} cachePrefix={`kunju-wtr-${lang}-nat`} big={true} accent={true} saveLang={lang} saveDir="fromTarget" />
                      {cloze.native && <div className="clozenative">{cloze.native}</div>}
                    </div>
                }
                </div>
                <div className="flashfoot">
                  {transl ?
                <span className="flashmean"><b>{q.verb.replace(/^to /, "")}</b>{transl === "…" ? <i>…</i> : <em>{transl}</em>}</span> :
                <span className="flashmean dim">·</span>}
                </div>
              </React.Fragment>}
            </div>
          </div>
          {flipped ?
        <div className="cardbtns">
                <button className="quizbtn again" onClick={() => nextCard(false)}>↻ {tr("again")}</button>
                <button className="quizbtn gotit" onClick={() => nextCard(true)}>✓ {tr("got_it")}</button>
              </div> :
        <button className="quizbtn next" onClick={() => flipCard()}>{tr("flip")}</button>}
        </React.Fragment>
      }

      {/* ---- SPEAK ---- */}
      {mode === "speak" && q &&
      <React.Fragment>
          <ScoreLine />
          <div className="modepick speakpick">
            <span className="modepick-label">🎙 {tr("spk_what")}</span>
            <div className="modegrid speakmodes">
              <button className={"modebtn" + (spkMode === "form" ? " on" : "")} onClick={() => {setSpkMode("form");setSent(null);}}>{tr("spk_form")}</button>
              <button className={"modebtn" + (spkMode === "sentence" ? " on" : "")} onClick={() => {setSpkMode("sentence");genSentence();}}>{tr("spk_sentence")}</button>
            </div>
          </div>
          {spkMode === "sentence" &&
        <div className="tfilter spkthemes scrollthemes">
              {allThemes.map((th, i) =>
            <button key={th.id} className={"tfilterchip" + (topicsSel.includes(th.id) ? " on" : "")} style={{ "--cc": RAINBOW[i % RAINBOW.length] }} onClick={() => {toggleTopic(th.id);genSentence(undefined, 0, th.id);}}>
                  <span className="dotmini"></span>{themeLabel(th.id)}
                </button>
            )}
            </div>
        }
          {spkMode === "sentence" && !sentMistMode && getSentMist(spkTarget).length > 0 &&
        <button className="mistbtn" style={{ "--lc": LANG_META[lang].color }} onClick={() => {const list = getSentMist(spkTarget);genTokenRef.current++;setSentMistMode(true);setRevealed(false);setHeard("");setMsg("");setState("idle");setSent(list.length ? pick(list) : null);}}>
              <span className="mistbtn-ic">⚠</span>
              <span className="mistbtn-tx">{tr("sent_mist_practice")}</span>
              <span className="mistbtn-n">{getSentMist(spkTarget).length}</span>
            </button>
        }
          {spkMode === "sentence" && sentMistMode &&
        <button className="mistbtn on" style={{ "--lc": LANG_META[lang].color }} onClick={() => {setSentMistMode(false);genSentence(undefined, 0, undefined, true);}}>
              <span className="mistbtn-ic">←</span>
              <span className="mistbtn-tx">{tr("mist_exit")}</span>
              {getSentMist(spkTarget).length > 0 && <span className="mistbtn-n">{getSentMist(spkTarget).length}</span>}
            </button>
        }
          {spkMode === "sentence" && sentMistMode && !sent &&
        <div className="mistdone">
              <div className="mistdone-ic">🎉</div>
              <h3>{tr("mist_clear_title")}</h3>
              <button className="quizbtn check" onClick={() => {setSentMistMode(false);genSentence(undefined, 0, undefined, true);}}>{tr("mist_exit")}</button>
            </div>
        }
          {!(spkMode === "sentence" && sentMistMode && !sent) &&
          <React.Fragment>
          <div className={"quizcard " + state} style={{ "--lc": LANG_META[lang].color }}>
            {spkMode === "form" ?
          <React.Fragment>
                <div className="cards-cue cards-cue-top">💬 {tr("cards_hint_speak")}</div>
                <div className="qm-top">
                  <span className="flashtense">{q.tenseLabel}{skill !== "advanced" && (tenseHint(lang, q.tenseId) || auxHint(lang, q.tenseId, q.answer)) ? <span className="flashhint-inline">{tenseHint(lang, q.tenseId) || auxHint(lang, q.tenseId, q.answer)}</span> : null}</span>
                  {q.isIrregular && <span className="flashtag">{tr("irregular")}</span>}
                  <button className={"starbtn qm-star" + (favs.some((x) => x.lang === lang && x.verb === q.verb) ? " on" : "")} title="Save verb" onClick={() => toggleFav(lang, q.verb)}>{favs.some((x) => x.lang === lang && x.verb === q.verb) ? "★" : "☆"}</button>
                </div>
                <Prompt />
                <div className="qm-mean" style={{ "--lc": LANG_META[lang].color }}>{transl ? <React.Fragment><b>{q.verb.replace(/^to /, "")}</b><em>{transl === "…" ? "…" : transl}</em></React.Fragment> : <span className="qm-mean-ph">·</span>}</div>
                {cloze && (cloze.loading ? <div className="spkreveal"><span className="exloading">…</span></div> :
              <div className="spkreveal">
                    <div className="spkreveal-row">
                      <WordSentence text={state === "idle" ? cloze.gap : cloze.full} fromName={window.CONJ[lang].name} toName={recall("kunju-native", "German")} cachePrefix={`kunju-wtr-${lang}-nat`} big={true} accent={true} saveLang={lang} saveDir="fromTarget" />
                      {state !== "idle" && <button className="flashspeak" onClick={() => speak(cloze.full, q.ttsLang)}>🔊</button>}
                    </div>
                    {cloze.native && (skill === "beginner" || state !== "idle") && <div className="clozenative">{cloze.native}</div>}
                  </div>)}
              </React.Fragment> :

          <div className="spksent">
                {(!sent || sent.loading) && <span className="exloading">…</span>}
                {sent && sent.error && <span className="exloading">—</span>}
                {sent && sent.n && <React.Fragment>
                  <WordSentence text={sent.n} fromName={recall("kunju-native", "German")} toName={window.CONJ[spkTarget].name} cachePrefix={`kunju-wtr-nat-${spkTarget}`} big={true} saveLang={spkTarget} saveDir="fromNative" />
                  <div className="spkhintarrow">↓ {tr("spk_say", { lang: window.CONJ[spkTarget].name })}</div>
                </React.Fragment>}
              </div>
          }
            {(() => {
            const showAns = spkMode === "sentence" && sent && sent.t && (revealed || state !== "idle");
            return <React.Fragment>
                {!showAns &&
              <div className="micwrap">
                    <button className={"micbtn" + (listening ? " rec" : "")} disabled={state !== "idle" || spkMode === "sentence" && (!sent || !sent.t)} onClick={listen}>{listening ? <span className="micstop"></span> : "🎤"}</button>
                    <div className="michint">{listening ? tr("mic_stop") : tr("mic_start")}</div>
                  </div>
              }
                {spkMode === "sentence" && sent && sent.t && state === "idle" && !revealed &&
              <button className="relearnbtn" onClick={() => {setRevealed(true);if (sent) {addSentMist(spkTarget, sent);setSmver((v) => v + 1);}}}>↻ {tr("spk_relearn")}</button>
              }
                {spkMode === "form" && state === "idle" &&
              <button className="relearnbtn" onClick={() => {setState("wrong");setMsg(cheerLine());addMistake(lang, q);bumpMist();}}>↻ {tr("spk_relearn")}</button>
              }
                {heard === "__nomic__" && <div className="feedback no">{tr("speak_nomic")}</div>}
                {heard === "__denied__" && <div className="feedback no">{tr("speak_denied")}</div>}
                {heard === "__nospeech__" && <div className="feedback no">{tr("speak_nospeech")}</div>}
                {heard && heard.indexOf("__") !== 0 && <div className="heardline">{tr("speak_heard")} “{heard}”</div>}
                {state === "correct" && <div className="feedback ok">✓ {msg || tr("correct_excl")}</div>}
                {state === "wrong" && spkMode === "form" && <div className="feedback no">{msg ? msg + " · " : "✗ "}{tr("answer")} <b>{q.answer}</b></div>}
                {state === "wrong" && spkMode === "sentence" && <div className="feedback no">{msg || "✗"}</div>}
                {showAns &&
              <div className="spkreveal">
                    <div className="spkreveal-label">{tr("spk_correct_is")} <span className="spkreveal-tap">· {tr("tap_save")}</span></div>
                    <div className="spkreveal-row">
                      <WordSentence text={sent.t} fromName={window.CONJ[spkTarget].name} toName={recall("kunju-native", "German")} cachePrefix={`kunju-wtr-${spkTarget}-nat`} big={true} accent={true} saveLang={spkTarget} saveDir="fromTarget" />
                      <button className="flashspeak" onClick={() => speak(sent.t, window.CONJ[spkTarget].ttsLang)}>🔊</button>
                    </div>
                  </div>
              }
                {showAns ?
              <div className="cardbtns">
                    <button className="quizbtn again" onClick={() => {setRevealed(false);setHeard("");setMsg("");setState("idle");}}>↻ {tr("practice_again")}</button>
                    <button className="quizbtn next" onClick={next}>{tr("spk_next_sentence")}</button>
                  </div> :
              state === "idle" ?
              spkMode === "form" && <p className="quizhint" style={{ margin: 0 }}>{tr("speak_tap")}</p> :
              <button className="quizbtn next" onClick={next}>{tr("next")}</button>}
              </React.Fragment>;
          })()}
          </div>
          </React.Fragment>
        }
        </React.Fragment>
      }
        </React.Fragment>
      {MistakeBar()}
    </div>);

}
const NATIVE_LANGS = [
{ label: "Deutsch", name: "German" },
{ label: "English", name: "English" },
{ label: "Español", name: "Spanish" },
{ label: "Français", name: "French" },
{ label: "Nederlands", name: "Dutch" },
{ label: "Italiano", name: "Italian" },
{ label: "Português", name: "Portuguese" },
{ label: "Polski", name: "Polish" },
{ label: "Türkçe", name: "Turkish" },
{ label: "Русский", name: "Russian" },
{ label: "العربية", name: "Arabic" },
{ label: "中文", name: "Chinese" }];

function nativeLabel(name) {const f = NATIVE_LANGS.find((l) => l.name === name);return f ? f.label : name;}
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const arr = (x) => Array.isArray(x) ? x : [];
const stripMark = (s) => String(s || "").replace(/\*\*/g, "");
function fmtVerbMark(s) {return esc(s).replace(/\*\*(.+?)\*\*/g, '<b class="exverb">$1</b>');}
/* Highlight the changed ending of a regular form vs the bare infinitive stem. */
function hl3(inf, form) {
  const f = esc(form);
  const stem = (inf || "").replace(/^to /, "").replace(/(ar|er|ir|en|re|n)$/, "");
  if (stem && stem.length >= 2 && form.toLowerCase().indexOf(stem.toLowerCase()) === 0) {
    return esc(form.slice(0, stem.length)) + '<b class="formend">' + esc(form.slice(stem.length)) + "</b>";
  }
  return f;
}

function buildGrammarPrompt(langName, tenseLabel, level, nativeName) {
  return `You are a concise bilingual language tutor. Target language: ${langName}. Native language: ${nativeName}. Learner CEFR level: ${level}.
Explain the verb tense "${tenseLabel}" of ${langName} for a ${level} learner (use simpler language for A1/A2, richer for C1/C2).
Return ONLY valid minified JSON (no markdown fences, no commentary) with EXACTLY this shape:
{"name":"","explain_t":"","explain_n":"","mnemonic":"","signals":[{"w":"","t":""}],"examples":[{"s":"","n":""}],"use":[""],"avoid":[""],"compare":{"with":"","rows":[["",""]],"note":""}}
Rules:
- Be linguistically ACCURATE above all: follow standard reference grammar; never invent or oversimplify rules. If this is a mood (subjunctive/conditional/imperative), explain its REAL triggers, not a vague feeling.
- name = the tense name in ${langName}.
- explain_t: 1-2 short sentences in ${langName}. explain_n: its ${nativeName} translation.
- mnemonic: one short, vivid memory hook in ${nativeName} that is correct and does NOT distort the real usage (skip it rather than give a misleading one).
- signals: exactly 5 typical signal words/connectors that genuinely trigger this tense/mood; w in ${langName}, t = ${nativeName} meaning. (e.g. Spanish subjunctive: "espero que", "dudo que", "ojalá", "para que", "es importante que".)
- examples: exactly 3 everyday sentences; s in ${langName} with the conjugated verb of THIS tense wrapped in **double asterisks**; n = ${nativeName} translation.
- use: 2-3 short ${nativeName} bullets naming the ACTUAL grammatical triggers — for the subjunctive these are e.g. doubt/uncertainty, wish/desire, emotion, requests & recommendations, impersonal expressions, and certain conjunctions. avoid: 1-2 short ${nativeName} bullets (when NOT to use it).
- compare.with = the most easily confused other ${langName} tense (its name); rows = up to 3 pairs ["<this tense> trait","<other tense> trait"] written in ${nativeName}; note = one ${nativeName} sentence on the key difference. If no useful comparison exists, use "with":"" and "rows":[].
Keep every field short.`;
}

/* Assemble a ready-to-render grammar lesson from the pre-written static set
   (window.GRAMMAR_STATIC). Target-language parts are stored once; the parts
   that depend on the learner's mother tongue come from `n[<ui code>]`.
   Returns the same shape the AI explainer produces, or null if not covered. */
function staticGrammar(lang, tid, native) {
  const G = window.GRAMMAR_STATIC && window.GRAMMAR_STATIC[lang] && window.GRAMMAR_STATIC[lang][tid];
  if (!G) return null;
  const code = uiFromNative(native);
  const n = G.n && (G.n[code] || G.n.en);
  if (!n) return null;
  const signals = (G.signals || []).map((s, i) => ({ w: s.w, t: (n.signals || [])[i] || "" }));
  const examples = (G.examples || []).map((e, i) => ({ s: e.s, n: (n.examples || [])[i] || "" }));
  const compare = G.compare && G.compare.with ?
  { with: G.compare.with, rows: n.compare_rows || [], note: n.compare_note || "" } :
  { with: "", rows: [] };
  return {
    name: G.name, explain_t: G.explain_t, explain_n: n.explain_n || "",
    mnemonic: n.mnemonic || "", signals, examples,
    use: n.use || [], avoid: n.avoid || [], compare };
}

function parseLLMJSON(text) {
  let s = String(text || "").trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const a = s.indexOf("{"),b = s.lastIndexOf("}");
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  return JSON.parse(s);
}

/* Tolerant parser for the simple {"s":…,"n":…} / {"n":…,"t":…} sentence payloads.
   LLM replies (esp. longer German sentences) often contain an unescaped quote,
   a stray newline, or trailing prose that breaks strict JSON.parse — so we first
   try JSON, then fall back to extracting each string field by hand, ending a value
   only at a quote that is followed by a comma or the closing brace. */
function looseParse(text) {
  let s = String(text || "").trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const a = s.indexOf("{"),b = s.lastIndexOf("}");
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  try {return JSON.parse(s);} catch (e) {/* fall through */}
  const out = {};
  const keyRe = /"(\w+)"\s*:\s*"/g;
  let m;
  while (m = keyRe.exec(s)) {
    const key = m[1];
    let i = keyRe.lastIndex,val = "";
    for (; i < s.length; i++) {
      const c = s[i];
      if (c === "\\") {const n = s[i + 1];val += n === "n" || n === "t" || n === "r" ? " " : n || "";i++;continue;}
      if (c === '"') {
        const rest = s.slice(i + 1).replace(/^\s+/, "");
        if (rest === "" || rest[0] === "," || rest[0] === "}") break;
        val += '"';continue;
      }
      val += c;
    }
    out[key] = val.trim();
    keyRe.lastIndex = i + 1;
  }
  if (Object.keys(out).length) return out;
  throw new Error("unparseable");
}

function LearnSkeleton() {
  return (
    <div className="learn-list">
      {[0, 1, 2].map((i) =>
      <div className="lcard skel" key={i}>
          <div className="sk-line w40"></div>
          <div className="sk-line w90"></div>
          <div className="sk-line w70"></div>
        </div>
      )}
    </div>);

}

const PERFECT_FAMILY = ["perfect", "pluperfect", "continuousPerfect"];
const AUX_NAME = { es: "haber", de: "haben / sein", en: "have", nl: "hebben / zijn", fr: "avoir / être" };
function AuxiliaryCard({ lang, engine, selTense }) {
  const data = useMemo(() => {
    if (PERFECT_FAMILY.indexOf(selTense) < 0) return null;
    const sample = REG_SAMPLE[lang] || (engine.samples && engine.samples[0]);
    const r = engine.conjugate(sample);
    if (!r || r.error) return null;
    const rows = [];
    PERFECT_FAMILY.forEach((id) => {
      const t = r.tenses.find((x) => x.id === id);
      if (!t || !t.forms) return;
      // auxiliary = each form minus its last word (the participle/gerund), which is shared
      const parts = t.forms.map((f) => (f && f !== "—" ? f.trim().split(/\s+/) : null));
      if (parts.some((p) => !p || p.length < 2)) return;
      const participle = parts[0][parts[0].length - 1];
      const aux = parts.map((p) => p.slice(0, p.length - 1).join(" "));
      rows.push({ id, label: t.label, aux, participle, pronouns: r.pronouns });
    });
    return rows.length ? { rows, inf: r.infinitive, auxName: AUX_NAME[lang] || "" } : null;
  }, [lang, selTense]);
  if (!data) return null;
  return (
    <div className="lcard auxcard">
      <div className="lcard-tag">{tr("aux_title")}</div>
      <p className="auxnote" dangerouslySetInnerHTML={{ __html: tr("aux_logic", { aux: "<b>" + data.auxName + "</b>", part: "<b>" + data.rows[0].participle + "</b>" }) }}></p>
      {data.rows.map((row) =>
      <div className="auxblock" key={row.id}>
          <div className="auxblock-head">{row.label}</div>
          <table className="auxtable">
            <tbody>
              {row.pronouns.map((p, i) => row.aux[i] &&
            <tr key={i}>
                  <td className="auxt-pron">{p}</td>
                  <td className="auxt-aux"><b>{row.aux[i]}</b></td>
                  <td className="auxt-part">{row.participle}</td>
                </tr>
            )}
            </tbody>
          </table>
          <AuxExample lang={lang} tenseId={row.id} tenseLabel={row.label} sample={data.inf} sampleForms={row.aux.map((a, i) => a + " " + row.participle)} pronouns={data.rows[0].pronouns} />
        </div>
      )}
      <div className="auxpart">{tr("aux_participle")}: <b>{data.rows[0].participle}</b></div>
    </div>);

}

function AuxExample({ lang, tenseId, tenseLabel, sample, sampleForms, pronouns }) {
  const nativeName = recall("kunju-native", "German");
  const targetName = window.CONJ[lang].name;
  const skill = recall("kunju-skill", "beginner");
  const pick = Math.min(2, (sampleForms || []).length - 1); // use a 3rd-person form
  const form = sampleForms && sampleForms[pick] ? sampleForms[pick] : null;
  const pron = pronouns && pronouns[pick] ? pronouns[pick] : "";
  const key = `kunju-auxex3-${lang}-${tenseId}-${sample}-${nativeName}-${skill}`;
  const [ex, setEx] = useState(() => recall(key, null));
  const [busy, setBusy] = useState(false);
  function load(fresh) {
    if (!form || !window.__hasAI()) return;
    if (!fresh) {const c = recall(key, null);if (c != null) {setEx(c);return;}}
    const variety = fresh ? ` Give a DIFFERENT example than before (variety #${Math.floor(Math.random() * 1000)}).` : "";
    const lvlNote = skill === "advanced" ? " Use C1-level vocabulary and a complex structure." : skill === "intermediate" ? " Use B1-level everyday vocabulary." : " Use very simple A1–A2 vocabulary (max 7 words).";
    setBusy(true);
    window.aiComplete(`Write ONE short, natural ${targetName} sentence that uses EXACTLY the verb form "${form}" (the ${tenseLabel} of "${sample}", ${pron}).${lvlNote} Keep that exact form in the sentence.${variety} Then give its natural ${nativeName} translation. Do NOT use double-quote characters. Reply with ONLY minified JSON and nothing else: {"t":"<${targetName} sentence>","n":"<${nativeName} translation>"}`).
    then((txt) => {let j = null;try {j = looseParse(txt);} catch (e) {}setBusy(false);if (j && j.t && j.n) {persist(key, j);setEx(j);}}).
    catch(() => setBusy(false));
  }
  useEffect(() => {setEx(recall(key, null));if (recall(key, null) == null) load(false); /* eslint-disable-next-line */}, [lang, tenseId, sample, nativeName]);
  if (!ex) return null;
  return (
    <div className="auxex">
      <div className="auxex-row">
        <div className="auxex-t">{busy ? "…" : ex.t}</div>
        <button className="speakbtn exrefresh" title="New example" onClick={() => load(true)}>↻</button>
      </div>
      <div className="auxex-n">{ex.n}</div>
    </div>);

}

function LearnContent({ data, loading, engine, sound, lang, selTense, selLabel, onStudy }) {
  const d = data || {};
  const hint = tenseHint(lang, selTense);
  const sample = REG_SAMPLE[lang];
  const sampleForms = useMemo(() => {
    if (!sample) return null;
    const r = engine.conjugate(sample);
    if (!r || r.error) return null;
    const t = r.tenses.find((x) => x.id === selTense);
    return t ? { pronouns: r.pronouns, forms: t.forms, inf: r.infinitive } : null;
  }, [lang, selTense]);
  return (
    <div className="learn-list" style={{ "--lc": LANG_META[lang].color }}>
      <div className="lcard formcard">
        <div className="lcard-tag">{tr("how_formed")}</div>
        {hint && <div className="formhint"><span className="formhint-lbl">{tr("regular")}</span><span className="formhint-val">{hint}</span></div>}
        {sampleForms &&
        <div className="formtable">
            <div className="formtable-cap">{tr("example")}: <b>{sampleForms.inf.replace(/^to /, "")}</b></div>
            <div className="formwrap">
              {sampleForms.pronouns.map((p, i) => sampleForms.forms[i] && sampleForms.forms[i] !== "—" &&
            <span className="formitem" key={i}><span className="formval" dangerouslySetInnerHTML={{ __html: hl3(sample, sampleForms.forms[i]) }}></span></span>
            )}
            </div>
          </div>
        }
      </div>

      <div className="lcard irrcard">
        <div className="lcard-tag">{tr("key_irregulars")}</div>
        <div className="irrchips">
          {(IRR_TOP[lang] || []).map((v) =>
          <button className="irrchip" key={v} onClick={() => onStudy && onStudy(lang, v)}>{v} <span className="irrchip-go">↗</span></button>
          )}
        </div>
        <p className="irrnote">{tr("irr_note")}</p>
      </div>

      {/* Only the AI-generated explanation block shows a loading state. */}
      {loading && !data && <LearnSkeleton />}

      {(d.explain_t || d.explain_n) &&
      <div className="lcard explain">
        <div className="lcard-tag">{tr("explanation")}</div>
        {d.name && <div className="lc-name">{d.name}</div>}
        <p className="lc-target">{d.explain_t}</p>
        <p className="lc-native">{d.explain_n}</p>
      </div>
      }
      {d.mnemonic &&
      <div className="lcard mnemo">
          <div className="lcard-tag">{tr("mnemonic")}</div>
          <p className="lc-native big">{d.mnemonic}</p>
        </div>
      }

      {arr(d.signals).length > 0 &&
      <div className="lcard">
          <div className="lcard-tag">{tr("signal_words")}</div>
          <div className="sigwords">
            {d.signals.map((s, i) => <span className="sigchip" key={i}><b>{s.w}</b><i>{s.t}</i></span>)}
          </div>
        </div>
      }

      {arr(d.examples).length > 0 &&
      <div className="lcard">
          <div className="lcard-tag">{tr("examples")}</div>
          <div className="exlist">
            {d.examples.map((ex, i) =>
          <div className="exrow" key={i}>
                <div className="exmain">
                  <span className="exline" dangerouslySetInnerHTML={{ __html: fmtVerbMark(ex.s) }}></span>
                  {sound && <button className="speakbtn" title="Listen" onClick={() => speak(stripMark(ex.s), engine.ttsLang)}>🔊</button>}
                </div>
                <div className="exnative">{ex.n}</div>
              </div>
          )}
          </div>
        </div>
      }

      {(arr(d.use).length > 0 || arr(d.avoid).length > 0) &&
      <div className="lcard">
          <div className="lcard-tag">{tr("when_use")}</div>
          <div className="usegrid">
            {arr(d.use).length > 0 &&
          <div className="usecol">
                {d.use.map((u, i) => <div className="useli" key={i}><span className="usei ok">✓</span>{u}</div>)}
              </div>
          }
            {arr(d.avoid).length > 0 &&
          <div className="usecol">
                {d.avoid.map((u, i) => <div className="useli" key={i}><span className="usei no">✕</span>{u}</div>)}
              </div>
          }
          </div>
        </div>
      }

      {d.compare && d.compare.with && arr(d.compare.rows).length > 0 &&
      <div className="lcard">
          <div className="lcard-tag">{tr("compare")}</div>
          <div className="cmp">
            <div className="cmp-row head"><span>{d.name || "—"}</span><span>{d.compare.with}</span></div>
            {d.compare.rows.map((r, i) => <div className="cmp-row" key={i}><span>{r[0]}</span><span>{r[1]}</span></div>)}
          </div>
          {d.compare.note && <p className="lc-native cmp-note">{d.compare.note}</p>}
        </div>
      }

      <AuxiliaryCard lang={lang} engine={engine} selTense={selTense} />
    </div>);

}

function LearnView({ lang, engine, sound, native, setNative, onStudy }) {
  const tenseOpts = useMemo(() => {const r = engine.conjugate(engine.samples[0]);return r && r.tenses ? r.tenses.map((t) => ({ id: t.id, label: t.label })) : [];}, [lang]);
  const [selTense, setSelTense] = useState(tenseOpts[0] ? tenseOpts[0].id : null);
  const [level, setLevel] = useState(() => recall("kunju-level", "A2"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {if (tenseOpts.length) setSelTense(tenseOpts[0].id);}, [lang]);
  const curLabel = (tenseOpts.find((t) => t.id === selTense) || {}).label;

  useEffect(() => {
    if (!selTense || !curLabel) return;
    const key = `kunju-gram-v2-${lang}-${selTense}-${level}-${native}`;
    const cached = recall(key, null);
    if (cached) {setData(cached);setError(null);setLoading(false);return;}
    // Pre-written lesson for the common tenses → shows instantly, no AI wait,
    // works offline. Rarer tenses still fall through to the AI explainer.
    const stat = staticGrammar(lang, selTense, native);
    if (stat) {setData(stat);setError(null);setLoading(false);return;}
    if (!window.__hasAI()) {setData(null);setError("offline");setLoading(false);return;}
    let cancelled = false;
    setLoading(true);setError(null);setData(null);
    window.aiComplete(buildGrammarPrompt(engine.name, curLabel, level, native)).
    then((txt) => {if (cancelled) return;try {const j = parseLLMJSON(txt);persist(key, j);setData(j);} catch (e) {setError("parse");}setLoading(false);}).
    catch(() => {if (!cancelled) {setError("net");setLoading(false);}});
    return () => {cancelled = true;};
  }, [lang, selTense, level, native, curLabel]);

  function setLvl(l) {setLevel(l);persist("kunju-level", l);}
  const tips = window.GRAMMAR && window.GRAMMAR[lang] || [];

  return (
    <div className="view">
      <div className="grammar-intro">
        <div><h3>{tr("tenses", { lang: engine.name })}</h3><p>{tr("bilingual", { a: engine.name, b: nativeLabel(native) })}</p></div>
      </div>

      <div className="learnselrow">
        <TenseDropdown lang={lang} tenses={tenseOpts} single={true} isOn={(id) => id === selTense} onToggle={(id) => setSelTense(id)} />
      </div>

      {/* Locally-computed parts (formation table, irregulars, auxiliary) render
         instantly; only the AI-written explanation streams in afterwards. */}
      <LearnContent data={data} loading={loading} engine={engine} sound={sound} lang={lang} selTense={selTense} selLabel={curLabel} onStudy={onStudy} />

      {error && !loading &&
      <div className="learn-fallback">
          <div className="errorbox">{error === "offline" ? tr("fb_offline") : tr("fb_net")}</div>
          <div className="grammar-list">
            {tips.map((tp, i) =>
          <div className="gcard" key={i} style={{ "--gc": RAINBOW[i % RAINBOW.length] }}>
                <div className="gcard-bar"></div><h4>{tp.title}</h4>
                <p dangerouslySetInnerHTML={{ __html: tp.body }}></p>
              </div>
          )}
          </div>
        </div>
      }

      <a href="/blog/" className="learn-blog-btn" target="_blank" rel="noopener">
        <span className="gg"></span>
        <span>{{de:"Weiter im Blog stöbern",en:"Explore the Blog",es:"Explorar el Blog",nl:"Verder op de Blog",fr:"Explorer le Blog"}[UILANG] || "Weiter im Blog stöbern"} →</span>
      </a>
    </div>);

}

/* ---------- Personal vocabulary ("Mein Wortschatz") ---------- */
function vocabKey() {return "kunju-vocab";}
function getVocab() {return recall(vocabKey(), []);}
function saveVocab(list) {persist(vocabKey(), list);}
const VOCAB_TEMPLATES = {
  de: ["Einkaufen", "Arztbesuch", "Behörde", "Arbeit", "Reisen", "Restaurant", "Familie", "Freizeit"],
  en: ["Shopping", "Doctor", "Authorities", "Work", "Travel", "Restaurant", "Family", "Free time"],
  es: ["Compras", "Médico", "Trámites", "Trabajo", "Viajes", "Restaurante", "Familia", "Ocio"],
  nl: ["Winkelen", "Dokter", "Overheid", "Werk", "Reizen", "Restaurant", "Familie", "Vrije tijd"],
  fr: ["Achats", "Médecin", "Démarches", "Travail", "Voyages", "Restaurant", "Famille", "Loisirs"]
};
function templateCats() {return VOCAB_TEMPLATES[UILANG] || VOCAB_TEMPLATES.en;}
const VOCAB_TOPICS = ["shopping and groceries", "seeing a doctor, pharmacy and health", "government offices and bureaucracy", "work and the office", "travel and transport", "restaurants and ordering food", "family and home life", "free time, hobbies and sport"];
function generalCat() {return { de: "Allgemein", en: "General", es: "General", nl: "Algemeen", fr: "Général" }[UILANG] || "General";}
const GENERAL_LABELS = ["allgemein", "general", "général", "algemeen", "generale", "généralités"];
function isGeneralCat(c) {return GENERAL_LABELS.indexOf((c || "").trim().toLowerCase()) >= 0;}
const SR_DAYS = [1, 3, 7, 21, 60, 60];

function VocabView({ lang }) {
  const [items, setItems] = useState(() => getVocab());
  const [cat, setCat] = useState(() => recall("kunju-vocab-cat", "all"));
  const [dir, setDir] = useState("native"); // native = type mother tongue → translate to target
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [practice, setPractice] = useState(null); // {pool, idx, val, state, portion}
  const [seeding, setSeeding] = useState("");
  const skill = recall("kunju-skill", "beginner");
  const nativeName = recall("kunju-native", "German");
  const [customCatNames, setCustomCatNames] = useState(() => recall("kunju-vocab-catnames", []));
  const [addingCat, setAddingCat] = useState(false);
  const [newCatVal, setNewCatVal] = useState("");
  const customCats = useMemo(() => {
    const fromItems = new Set();
    items.forEach((it) => {if (it.cat && !isGeneralCat(it.cat) && templateCats().indexOf(it.cat) < 0) fromItems.add(it.cat);});
    const merged = new Set([...customCatNames, ...fromItems]);
    return [...merged];
  }, [items, customCatNames]);
  const allCats = [generalCat(), ...templateCats(), ...customCats];
  function persistItems(next) {setItems(next);saveVocab(next);}
  function targetName() {return window.CONJ[lang].name;}

  function seedCategory(catName) {
    if (!catName || catName === "all") return;
    const idx = templateCats().indexOf(catName);
    if (idx < 0) return; // only auto-fill template categories
    const seedKey = `kunju-vseed-${lang}-${catName}-${skill}-${nativeName}`;
    if (recall(seedKey, false)) return;
    if (!window.__hasAI()) return;
    const already = getVocab().filter((it) => it.lang === lang && it.cat === catName).length;
    if (already >= 5) {persist(seedKey, true);return;}
    const topic = VOCAB_TOPICS[idx] || catName;
    const lvl = skill === "advanced" ? "advanced C1-level" : skill === "intermediate" ? "intermediate B1-level" : "basic A1–A2";
    setSeeding(catName);
    window.aiComplete(`List 5 useful ${lvl} ${targetName()} words or short phrases about "${topic}". For each, give the ${targetName()} term and its ${nativeName} translation. Avoid duplicates. Reply with ONLY a minified JSON array, nothing else: [{"t":"<${targetName()} term>","n":"<${nativeName} translation>"}]`).
    then((txt) => {
      let arr = null;
      try {let s = String(txt || "").replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();const a = s.indexOf("["), b = s.lastIndexOf("]");if (a >= 0 && b > a) s = s.slice(a, b + 1);arr = JSON.parse(s);} catch (_) {arr = null;}
      setSeeding("");
      if (!Array.isArray(arr) || !arr.length) return; // failed — allow retry on next open
      const list = getVocab();
      const additions = [];
      arr.slice(0, 5).forEach((e, i) => {
        const term = (e && (e.t || e.term) || "").trim(), nat = (e && (e.n || e.trans) || "").trim();
        if (!term || !nat) return;
        if (list.some((x) => x.lang === lang && norm(x.term) === norm(term)) || additions.some((x) => norm(x.term) === norm(term))) return;
        additions.push({ id: Date.now() + "-" + i, lang, term, trans: nat, cat: catName, kind: term.indexOf(" ") >= 0 ? "phrase" : "word", created: Date.now() + i, seed: true, nat: nativeName });
      });
      if (additions.length) {persist(seedKey, true);persistItems([...additions, ...getVocab()]);}
    }).
    catch(() => {setSeeding("");});
  }
  function seedCustomCategory(catName) {
    if (!catName || !window.__hasAI()) return;
    const seedKey = `kunju-vseed-${lang}-custom-${catName}`;
    if (recall(seedKey, false)) return;
    const already = getVocab().filter((it) => it.lang === lang && it.cat === catName).length;
    if (already >= 3) {persist(seedKey, true); return;}
    const lvl = skill === "advanced" ? "advanced C1-level" : skill === "intermediate" ? "intermediate B1-level" : "basic A1–A2";
    setSeeding(catName);
    window.aiComplete(`List 5 useful ${lvl} ${targetName()} words or short phrases about "${catName}". For each, give the ${targetName()} term and its ${nativeName} translation. Avoid duplicates. Reply with ONLY a minified JSON array: [{"t":"<${targetName()} term>","n":"<${nativeName} translation>"}]`).
    then((txt) => {
      let arr = null;
      try {let s = String(txt || "").replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();const a = s.indexOf("["), b = s.lastIndexOf("]");if (a >= 0 && b > a) s = s.slice(a, b + 1);arr = JSON.parse(s);} catch (_) {}
      setSeeding("");
      if (!Array.isArray(arr) || !arr.length) return;
      const list = getVocab();
      const additions = [];
      arr.slice(0, 5).forEach((e, i) => {
        const term = (e && (e.t || e.term) || "").trim(), nat = (e && (e.n || e.trans) || "").trim();
        if (!term || !nat) return;
        if (list.some((x) => x.lang === lang && norm(x.term) === norm(term)) || additions.some((x) => norm(x.term) === norm(term))) return;
        additions.push({id: Date.now() + "-" + i, lang, term, trans: nat, cat: catName, kind: term.indexOf(" ") >= 0 ? "phrase" : "word", created: Date.now() + i, seed: true, nat: nativeName});
      });
      if (additions.length) {persist(seedKey, true); persistItems([...additions, ...getVocab()]);}
    }).catch(() => setSeeding(""));
  }

  // starter words auto-load when a template category is opened (per category + level, once)
  useEffect(() => {if (cat && templateCats().indexOf(cat) >= 0) seedCategory(cat); /* eslint-disable-next-line */}, [cat, lang]);

  function suggestMore() {
    if (seeding) return;
    const isTpl = templateCats().indexOf(cat) >= 0;
    const catName = cat === "all" || cat === generalCat() ? null : cat;
    const idx = catName ? templateCats().indexOf(catName) : -1;
    const topic = idx >= 0 ? VOCAB_TOPICS[idx] : catName || "useful everyday vocabulary";
    if (!window.__hasAI()) return;
    const lvl = skill === "advanced" ? "advanced C1-level" : skill === "intermediate" ? "intermediate B1-level" : "basic A1–A2";
    const existing = getVocab().filter((it) => it.lang === lang).map((it) => it.term).slice(0, 40);
    const avoid = existing.length ? ` Do NOT repeat any of these: ${existing.join(", ")}.` : "";
    setSeeding(cat || "all");
    window.aiComplete(`Suggest 10 useful ${lvl} ${targetName()} words or short phrases about "${topic}".${avoid} For each give the ${targetName()} term and its ${nativeName} translation. Reply with ONLY a minified JSON array, nothing else: [{"t":"...","n":"..."}]`).
    then((txt) => {
      let arr = null;
      try {let s = String(txt || "").replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();const a = s.indexOf("["), b = s.lastIndexOf("]");if (a >= 0 && b > a) s = s.slice(a, b + 1);arr = JSON.parse(s);} catch (_) {arr = null;}
      setSeeding("");
      if (!Array.isArray(arr)) return;
      const list = getVocab();const additions = [];
      const useCat = catName || generalCat();
      arr.slice(0, 10).forEach((e, i) => {
        const term = (e && (e.t || e.term) || "").trim(), nat = (e && (e.n || e.trans) || "").trim();
        if (!term || !nat) return;
        if (list.some((x) => x.lang === lang && norm(x.term) === norm(term)) || additions.some((x) => norm(x.term) === norm(term))) return;
        additions.push({ id: Date.now() + "-s" + i, lang, term, trans: nat, cat: useCat, kind: term.indexOf(" ") >= 0 ? "phrase" : "word", created: Date.now() + i, seed: true, nat: nativeName });
      });
      if (additions.length) persistItems([...additions, ...getVocab()]);
    }).
    catch(() => setSeeding(""));
  }

  function addEntry() {
    const raw = text.trim();
    if (!raw || busy) return;
    const useCat = cat === "all" ? generalCat() : cat;
    if (!window.__hasAI()) {
      const entry = { id: Date.now() + "", lang, term: dir === "target" ? raw : "", trans: dir === "native" ? raw : "", cat: useCat, kind: raw.indexOf(" ") >= 0 ? "phrase" : "word", created: Date.now(), nat: nativeName };
      persistItems([entry, ...items]);setText("");return;
    }
    setBusy(true);
    const from = dir === "native" ? nativeName : targetName();
    const to = dir === "native" ? targetName() : nativeName;
    window.aiComplete(`Translate this ${from} ${raw.indexOf(" ") >= 0 ? "phrase" : "word"} into ${to}: "${raw}". Reply with ONLY the ${to} translation, no quotes, no extra text.`).
    then((r) => {
      const out = String(r || "").trim().replace(/^["'«»]+|["'«»]+$/g, "").split("\n")[0].trim();
      const entry = dir === "native" ?
      { id: Date.now() + "", lang, term: out, trans: raw, cat: useCat, kind: raw.indexOf(" ") >= 0 ? "phrase" : "word", created: Date.now(), nat: nativeName } :
      { id: Date.now() + "", lang, term: raw, trans: out, cat: useCat, kind: raw.indexOf(" ") >= 0 ? "phrase" : "word", created: Date.now(), nat: nativeName };
      persistItems([entry, ...items]);setText("");setBusy(false);
    }).
    catch(() => setBusy(false));
  }
  function remove(id) {persistItems(items.filter((x) => x.id !== id));}
  function addCustomCat() {setAddingCat(true);setNewCatVal("");}
  function commitNewCat() {
    const name = newCatVal.trim();
    setAddingCat(false);
    setNewCatVal("");
    if (!name) return;
    if (!customCatNames.includes(name)) {
      const updated = [...customCatNames, name];
      setCustomCatNames(updated);
      persist("kunju-vocab-catnames", updated);
    }
    setCat(name);
    persist("kunju-vocab-cat", name);
    setTimeout(() => seedCustomCategory(name), 80);
  }

  const langItems = items.filter((it) => it.lang === lang && (!it.nat || it.nat === nativeName));
  const shown = cat === "all" ? langItems : isGeneralCat(cat) ? langItems.filter((it) => isGeneralCat(it.cat)) : langItems.filter((it) => it.cat === cat);

  // ----- practice (self-typing, portions of 30) -----
  function vmistKey() {return `kunju-vmist-${lang}`;}
  function getVMist() {return recall(vmistKey(), []);}
  function addVMist(it) {const l = getVMist();if (!l.some((x) => norm(x.term) === norm(it.term))) persist(vmistKey(), [{ term: it.term, trans: it.trans, cat: it.cat, kind: it.kind }, ...l].slice(0, 100));}
  function removeVMist(it) {persist(vmistKey(), getVMist().filter((x) => norm(x.term) !== norm(it.term)));}
  // ----- spaced repetition -----
  function srKey() {return `kunju-sr-${lang}`;}
  function getSR() {return recall(srKey(), {});}
  function srInfo(term) {return getSR()[norm(term)] || { lvl: 0, due: 0 };}
  function srAnswer(term, ok) {const m = getSR();const cur = m[norm(term)] || { lvl: 0, due: 0 };const now = Date.now();let lvl, due;if (ok) {lvl = Math.min(cur.lvl + 1, 6);due = now + SR_DAYS[Math.min(lvl - 1, 5)] * 864e5;} else {lvl = 0;due = now;}m[norm(term)] = { lvl, due };persist(srKey(), m);}
  function isDue(term) {return (srInfo(term).due || 0) <= Date.now();}
  const dueItems = langItems.filter((it) => it.term && it.trans && isDue(it.term));
  function startDuePractice() {
    const pool = shuffle(dueItems).slice(0, 30);
    if (!pool.length) return;
    setPractice({ pool, idx: 0, val: "", state: "idle", due: true, right: 0 });
  }
  function startPractice(portion) {
    const pool = shuffle(shown.filter((it) => it.term && it.trans)).slice(portion * 30, portion * 30 + 30);
    if (!pool.length) return;
    setPractice({ pool, idx: 0, val: "", state: "idle", portion, right: 0 });
  }
  function startMistPractice() {
    const pool = shuffle(getVMist());
    if (!pool.length) return;
    setPractice({ pool, idx: 0, val: "", state: "idle", mist: true, right: 0 });
  }
  function checkPractice() {
    if (!practice || practice.state !== "idle") return;
    const cur = practice.pool[practice.idx];
    const ok = deburr(norm(practice.val)) === deburr(norm(cur.term));
    if (ok) {if (practice.mist) removeVMist(cur);} else addVMist(cur);
    srAnswer(cur.term, ok);
    setPractice((p) => p ? { ...p, state: ok ? "correct" : "wrong", right: p.right + (ok ? 1 : 0) } : p);
  }
  function nextPractice() {
    setPractice((p) => {
      if (!p) return p;
      if (p.idx + 1 >= p.pool.length) return { ...p, done: true };
      return { ...p, idx: p.idx + 1, val: "", state: "idle" };
    });
  }

  if (practice && !practice.done) {
    const cur = practice.pool[practice.idx];
    return (
      <div className="view" style={{ "--lc": LANG_META[lang].color }}>
        <div className="vocpr-head">
          <button className="nameskip" onClick={() => setPractice(null)}>← {tr("back")}</button>
          <span className="vocpr-count">{practice.idx + 1} / {practice.pool.length}</span>
        </div>
        <div className="quizcard quizmodern" style={{ "--lc": LANG_META[lang].color }}>
          <div className="qm-top"><span className="flashtense">{cur.cat}</span><span className="flashtense vockind">{cur.kind === "phrase" ? tr("vocab_phrase") : tr("vocab_word")}</span></div>
          <div className="qm-prompt"><span className="flashverb">{cur.trans}</span></div>
          <div className="quizinput">
            <input value={practice.val} placeholder="…" disabled={practice.state !== "idle"}
            onChange={(e) => setPractice((p) => ({ ...p, val: e.target.value }))}
            onKeyDown={(e) => {if (e.key === "Enter") {practice.state === "idle" ? checkPractice() : nextPractice();}}}
            autoComplete="off" autoCapitalize="off" spellCheck="false" />
          </div>
          {practice.state === "correct" && <div className="feedback ok">✓ {praiseLine()}</div>}
          {practice.state === "wrong" && <div className="feedback no">✗ {tr("answer")} <b>{cur.term}</b></div>}
          {practice.state === "idle" ?
          <button className="quizbtn check qm-check" onClick={checkPractice}>{tr("check")}</button> :
          <button className="quizbtn next" onClick={nextPractice}>{tr("next")}</button>}
        </div>
      </div>);

  }
  if (practice && practice.done) {
    return (
      <div className="view" style={{ "--lc": LANG_META[lang].color }}>
        <div className="mistdone">
          <div className="mistdone-ic">🎉</div>
          <h3>{practice.right} / {practice.pool.length}</h3>
          <p>{tr("vocab_done")}</p>
          <button className="quizbtn check" onClick={() => setPractice(null)}>{tr("back")}</button>
        </div>
      </div>);

  }

  const portions = Math.ceil(shown.filter((it) => it.term && it.trans).length / 30);
  return (
    <div className="view" style={{ "--lc": LANG_META[lang].color }}>
      <div className="vocadd" style={{ "--lc": LANG_META[lang].color }}>
        <div className="vocdir">
          <button className={"vocdirbtn" + (dir === "native" ? " on" : "")} onClick={() => setDir("native")}>{nativeLabel(nativeName)} → {targetName()}</button>
          <button className={"vocdirbtn" + (dir === "target" ? " on" : "")} onClick={() => setDir("target")}>{targetName()} → {nativeLabel(nativeName)}</button>
        </div>
        <div className="vocaddrow">
          <input className="vocinput" value={text} placeholder={busy ? "↔ …" : tr("vocab_add_ph")} disabled={busy}
          onChange={(e) => setText(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter") addEntry();}}
          autoComplete="off" spellCheck="false" />
          <button className="vocaddbtn" onClick={addEntry} disabled={busy || !text.trim()}>+</button>
        </div>
        <div className="voccats">
          <button className={"voccat" + (cat === "all" ? " on" : "")} onClick={() => {setCat("all");persist("kunju-vocab-cat", "all");}}>{tr("vocab_all")}</button>
          {allCats.map((c) =>
          <button key={c} className={"voccat" + (cat === c ? " on" : "")} onClick={() => {setCat(c);persist("kunju-vocab-cat", c);}}>{c}</button>
          )}
          <button className="voccat addcat" onClick={addCustomCat}>+ {tr("vocab_new_cat")}</button>
        </div>
      </div>

      {(shown.filter((it) => it.term && it.trans).length > 0 || getVMist().length > 0) &&
      <div className="vocpractice-bar">
          {dueItems.length > 0 &&
        <button className="quizbtn vocstart vocdue" onClick={startDuePractice}>🔥 {tr("vocab_due")} · {dueItems.length}</button>
        }
          {Array.from({ length: portions }).map((_, p) =>
        <button key={p} className={"quizbtn vocstart" + (dueItems.length > 0 ? " ghost" : "")} onClick={() => startPractice(p)}>▶ {tr("vocab_practice")} {portions > 1 ? `· ${p * 30 + 1}–${Math.min((p + 1) * 30, shown.length)}` : ""}</button>
        )}
          {getVMist().length > 0 &&
        <button className="mistbtn vocmist" style={{ "--lc": LANG_META[lang].color }} onClick={startMistPractice}>
              <span className="mistbtn-ic">⚠</span>
              <span className="mistbtn-tx">{tr("mist_practice")}</span>
              <span className="mistbtn-n">{getVMist().length}</span>
            </button>
        }
        </div>
      }

      <button className="vocsuggest" onClick={suggestMore} disabled={!!seeding}>{seeding ? "✨ …" : "✨ " + tr("vocab_suggest")}</button>

      {addingCat && (
        <div onClick={() => setAddingCat(false)} style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",animation:"fade .18s ease"}}>
          <div onClick={e => e.stopPropagation()} style={{background:"var(--surface)",borderRadius:"24px",width:"min(320px,100%)",boxShadow:"0 24px 60px rgba(0,0,0,.35)",overflow:"hidden",animation:"fade .2s ease"}}>
            <div style={{background:"linear-gradient(135deg,#a557ff22,#0a84ff18)",padding:"22px 20px 16px",textAlign:"center",borderBottom:"1px solid var(--border)"}}>
              <div style={{fontSize:"36px",lineHeight:1,marginBottom:"8px"}}>📁</div>
              <div style={{fontWeight:700,fontSize:"17px",color:"var(--text)",marginBottom:"4px"}}>Neue Kategorie</div>
              <div style={{fontSize:"12.5px",color:"var(--muted)",lineHeight:1.4}}>Die KI schlägt danach automatisch<br/>5 passende Startwörter vor ✨</div>
            </div>
            <div style={{padding:"16px 18px 18px",display:"flex",flexDirection:"column",gap:"10px"}}>
              <input autoFocus className="nameinput" value={newCatVal}
                onChange={e => setNewCatVal(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && newCatVal.trim()) commitNewCat(); if (e.key === "Escape") setAddingCat(false); }}
                placeholder="z. B. Reisen, Kochen, Sport…"
                style={{fontSize:"15px",margin:0}} />
              <button className="namebtn" onClick={commitNewCat} disabled={!newCatVal.trim()} style={{margin:0,opacity:newCatVal.trim()?1:0.4,transition:"opacity .15s"}}>
                <span className="cta-rainbow"></span>
                <span className="cta-label">Erstellen ✓</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {shown.length === 0 ?
      <div className="emptystate">
          <p className="emptystate-title">{seeding ? "✨" : "📒"}</p>
          <p className="emptystate-sub">{seeding ? tr("vocab_seeding") : tr("vocab_empty")}</p>
        </div> :

      <div className="voclist">
          {shown.map((it) =>
        <div className="vocitem" key={it.id} style={{ "--lc": LANG_META[lang].color }}>
              <div className="vocitem-main">
                <span className="vocterm">{it.term || "…"}{it.term && <button className="vocspk" onClick={() => speak(it.term, window.CONJ[lang].ttsLang)}>🔊</button>}</span>
                <span className="voctrans">{it.trans}</span>
                {it.term && <span className={"vocsr lvl" + Math.min(srInfo(it.term).lvl, 6)} title={tr("vocab_strength")}><i></i><i></i><i></i><i></i><i></i></span>}
              </div>
              <span className="voccatchip">{it.cat}</span>
              <button className="vocx" onClick={() => remove(it.id)}>✕</button>
            </div>
        )}
        </div>
      }
    </div>);

}

/* ---------- Saved verbs (heart tab) ---------- */
function SavedTab({ lang, favs, toggleFav, pickVerb, onActivity }) {
  const [sub, setSub] = useState(() => recall("kunju-saved-sub", "verbs"));
  function pick(s) {setSub(s);persist("kunju-saved-sub", s);}
  return (
    <div className="view" style={{ gap: 0 }}>
      <div className="savedsub">
        <button className={"savedsubbtn" + (sub === "verbs" ? " on" : "")} onClick={() => pick("verbs")}>{tr("saved_verbs")}</button>
        <button className={"savedsubbtn" + (sub === "vocab" ? " on" : "")} onClick={() => pick("vocab")}>{tr("saved_vocab")}</button>
      </div>
      {sub === "verbs" ? <SavedView lang={lang} favs={favs} toggleFav={toggleFav} pickVerb={pickVerb} onActivity={onActivity} /> : <VocabView lang={lang} />}
    </div>);

}

function SavedCell({ base, from, to }) {
  const xkey = `kunju-xlt-${from}-${to}-${base}`;
  const seed = () => {
    if (to === from) return base;
    const ct = conceptTranslate(base, from, to);
    if (ct) return ct;
    const c = recall(xkey, null);
    return c != null ? c : null;
  };
  const [val, setVal] = useState(seed);
  const [loading, setLoading] = useState(false);
  const triedRef = useRef(0);
  function fetchT() {
    if (val != null || loading) return;
    if (!window.__hasAI()) return;
    triedRef.current += 1;
    setLoading(true);
    window.aiComplete(`Translate the ${window.CONJ[from].name} verb "${base}" to its ${window.CONJ[to].name} infinitive. Reply with ONLY the single infinitive word or short phrase in ${window.CONJ[to].name}, lowercase, no article, no quotes, no extra text.`).
    then((txt) => {
      let out = String(txt || "").trim().toLowerCase().split("\n")[0].replace(/^["'«»]+|["'«».]+$/g, "").replace(/[^\p{L}\s'’\-]/gu, "").trim();
      setLoading(false);
      if (out) {persist(xkey, out);setVal(out);} else if (triedRef.current < 2) {setTimeout(fetchT, 400);}
    }).
    catch(() => {setLoading(false);if (triedRef.current < 2) setTimeout(fetchT, 600);});
  }
  useEffect(() => {setVal(seed());triedRef.current = 0; /* eslint-disable-next-line */}, [base, from, to]);
  useEffect(() => {if (val == null) {const t = setTimeout(fetchT, 80);return () => clearTimeout(t);} /* eslint-disable-next-line */}, [val, base, from, to]);
  if (val) return (
    <button className="vtcell vtword" onClick={() => speak(val, window.CONJ[to].ttsLang)}><span>{val}</span><span className="vtspk">🔊</span></button>);
  return <button className="vtcell vtword empty" onClick={fetchT} title={tr("tap_retry") || ""}>{loading ? "…" : "↻"}</button>;
}

function SavedView({ lang, favs, toggleFav, pickVerb, onActivity }) {
  const langFavs = favs.filter((f) => f.lang === lang);
  const [pr, setPr] = useState(null); // {pool, idx, val, state, mist}
  const vpool = useMemo(() => langFavs.map((f) => f.verb), [langFavs.length, lang]);
  const vmistKey = `kunju-vbmist-${lang}`;
  const vsrKey = `kunju-vbsr-${lang}`;
  function getVbMist() {const m = recall(vmistKey, []);return m.filter((v) => vpool.indexOf(v) >= 0);}
  function vbDue() {const sr = recall(vsrKey, {});const now = Date.now();return vpool.filter((v) => !sr[v] || sr[v] <= now);}
  function schedule(v, ok) {
    const sr = recall(vsrKey, {});const SR = [1, 3, 7, 21, 60];
    const lvlk = `${vsrKey}-lvl`;const lv = recall(lvlk, {});
    let n = ok ? Math.min((lv[v] || 0) + 1, SR.length) : 0;
    lv[v] = n;persist(lvlk, lv);
    sr[v] = Date.now() + (ok ? SR[Math.max(0, n - 1)] : 0.0007) * 86400000;
    persist(vsrKey, sr);
  }
  function addVbMist(v) {const m = recall(vmistKey, []);if (m.indexOf(v) < 0) {m.push(v);persist(vmistKey, m);}}
  function rmVbMist(v) {persist(vmistKey, recall(vmistKey, []).filter((x) => x !== v));}
  const natName = recall("kunju-native", "German");
  const natCode = NATIVE_TO_UI[natName];
  const [transLang, setTransLang] = useState(() => recall("kunju-savedtrans", natCode || "en"));
  function setTL(v) {setTransLang(v);persist("kunju-savedtrans", v);}
  function LangSelect({ value, onChange }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="vtdrop">
        <button className="vtdrop-btn" onClick={() => setOpen((o) => !o)}>{window.CONJ[value].name}<span className="vtdrop-car">▾</span></button>
        {open &&
        <React.Fragment>
            <div className="vtdrop-back" onClick={() => setOpen(false)}></div>
            <div className="vtdrop-menu">
              {LANG_ORDER.map((c) =>
            <button key={c} className={"vtdrop-opt" + (c === value ? " on" : "")} onClick={() => {onChange(c);setOpen(false);}}>{window.CONJ[c].name}</button>
            )}
            </div>
          </React.Fragment>
        }
      </div>);
  }
  function vbMeaning(base) {
    if (natCode === lang) return base;
    if (natCode) {const ct = conceptTranslate(base, lang, natCode);if (ct) return ct;}
    if (natName === "English") {const m = window.lookupMeaning(lang, base);if (m) return m;}
    return recall(`kunju-vtr-${lang}-${base}-${natName}`, null);
  }
  function buildVbQ(verbList) {
    const v = verbList[Math.floor(Math.random() * verbList.length)];
    const base = (v || "").replace(/^to /, "");
    return { verb: v, base, prompt: vbMeaning(base), answer: base };
  }
  function ensureMeaning(base) {
    if (vbMeaning(base) != null) return;
    if (!window.__hasAI()) return;
    window.aiComplete(`Translate the ${window.CONJ[lang].name} verb "${base}" into ${natName}. Reply with ONLY the ${natName} translation in its base/infinitive form, nothing else.`).
    then((txt) => {const t = String(txt || "").trim().replace(/^["'«».]+|["'«».]+$/g, "").split("\n")[0].trim();if (t) {persist(`kunju-vtr-${lang}-${base}-${natName}`, t);setPr((p) => p && p.q && p.q.base === base ? { ...p, q: { ...p.q, prompt: t } } : p);}}).
    catch(() => {});
  }
  function startVbPractice(mode) {
    const src = mode === "mist" ? getVbMist() : mode === "due" ? vbDue() : vpool;
    if (!src.length) return;
    const q = buildVbQ(src);
    if (!q) return;
    ensureMeaning(q.base);
    setPr({ mode, q, val: "", state: "idle", right: 0, total: 0 });
  }
  function vbCheck() {
    setPr((p) => {
      if (!p || p.state !== "idle") return p;
      const ok = norm(p.val) === norm(p.q.answer) || deburr(norm(p.val)) === deburr(norm(p.q.answer));
      if (ok) {schedule(p.q.verb, true);if (p.mode === "mist") rmVbMist(p.q.verb);} else {schedule(p.q.verb, false);addVbMist(p.q.verb);}
      onActivity && onActivity();
      return { ...p, state: ok ? "correct" : "wrong", right: p.right + (ok ? 1 : 0), total: p.total + 1, msg: ok ? praiseLine() : cheerLine() };
    });
  }
  function vbNext() {
    setPr((p) => {
      if (!p) return p;
      const src = p.mode === "mist" ? getVbMist() : p.mode === "due" ? vbDue() : vpool;
      if (!src.length) return null;
      const q = buildVbQ(src);
      if (q) ensureMeaning(q.base);
      return q ? { ...p, q, val: "", state: "idle" } : null;
    });
  }

  if (!langFavs.length) {
    return (
      <div className="view">
        <div className="emptystate">
          <div className="emptystate-rings">{RAINBOW.slice(0, 6).map((c, i) => <span key={i} style={{ background: c, animationDelay: i * 0.12 + "s" }}></span>)}</div>
          <p className="emptystate-title">★</p>
          <p className="emptystate-sub">{tr("saved_empty")}</p>
        </div>
      </div>);

  }
  return (
    <div className="view" style={{ "--lc": LANG_META[lang].color }}>
      <div className="grammar-intro"><div><h3>{tr("saved")} · {langFavs.length}</h3></div></div>
      {pr ?
      <div className="quizcard quizmodern" style={{ "--lc": LANG_META[lang].color }}>
          <div className="qm-top"><span className="flashtense">{tr("vocab_translate") || "→"}</span><span className="flashtag">{LANG_META[lang].code}</span></div>
          <div className="qm-prompt"><span className="flashverb">{pr.q.prompt || "…"}</span></div>
          <div className="quizinput"><input value={pr.val} disabled={pr.state !== "idle"} placeholder="…" autoFocus
        onChange={(e) => setPr((p) => ({ ...p, val: e.target.value }))}
        onKeyDown={(e) => {if (e.key === "Enter") {pr.state === "idle" ? vbCheck() : vbNext();}}} /></div>
          {pr.state === "correct" && <div className="feedback ok">✓ {pr.msg}</div>}
          {pr.state === "wrong" && <div className="feedback no">{pr.msg} · {tr("answer")} <b>{pr.q.answer}</b></div>}
          {pr.state === "idle" ?
        <button className="quizbtn check qm-check" onClick={vbCheck}>{tr("check")}</button> :
        <button className="quizbtn next" onClick={vbNext}>{tr("next")}</button>}
          <button className="nameskip" onClick={() => setPr(null)}>{tr("back")}</button>
        </div> :
      <React.Fragment>
          <div className="vocpractice-bar">
            {vbDue().length > 0 && <button className="quizbtn vocstart vocdue" onClick={() => startVbPractice("due")}>🔥 {tr("vocab_due")} · {vbDue().length}</button>}
            <button className={"quizbtn vocstart" + (vbDue().length > 0 ? " ghost" : "")} onClick={() => startVbPractice("all")}>▶ {tr("vocab_practice")}</button>
            {getVbMist().length > 0 &&
          <button className="mistbtn vocmist" style={{ "--lc": LANG_META[lang].color }} onClick={() => startVbPractice("mist")}>
                <span className="mistbtn-ic">⚠</span><span className="mistbtn-tx">{tr("mist_practice")}</span><span className="mistbtn-n">{getVbMist().length}</span>
              </button>
          }
          </div>
          <div className="vtable">
        <div className="vtrow vthead">
          <div className="vth vtfirst">★</div>
          <div className="vth"><LangSelect value={transLang} onChange={setTL} /></div>
        </div>
        {langFavs.map((it) => {
          const base = it.verb.replace(/^to /, "");
          const rk = it.lang + "|" + it.verb;
          return (
            <div className="vtrow" key={rk}>
              <div className="vtcell vtfirst" style={{ "--lc": LANG_META[it.lang].color }}>
                <button className="vtx" title={tr("learned")} onClick={() => toggleFav(it.lang, it.verb)}>✕</button>
                <button className="vtverb" onClick={() => pickVerb(it.lang, it.verb)}>{base}</button>
                <span className="vtbadge">{LANG_META[it.lang].code}</span>
              </div>
              <SavedCell base={base} from={it.lang} to={transLang} />
            </div>);

        })}
      </div>
      <p className="quizhint" style={{ marginTop: 4 }}>Tap a cell to hear it · ✕ removes the verb</p>
        </React.Fragment>
      }
    </div>);

}

/* ---------- Tweaks ---------- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "vivid",
  "font": "space",
  "radius": 22,
  "density": "regular",
  "highlight": true,
  "sound": true,
  "sponsor": true
} /*EDITMODE-END*/;

function AppTweaks({ t, setTweak, name, commitName }) {
  return (
    <TweaksPanel>
      <TweakSection label="Profile" />
      <TweakText label="Your name" value={name} placeholder="Your name…" onChange={(v) => commitName(v)} />
      <TweakText label="Gemini API key (for AI offline)" value={recall("kunju-gemini-key", "")} placeholder="AIza… — your own key" onChange={(v) => persist("kunju-gemini-key", v.trim())} />
      <TweakSection label="Look & feel" />
      <TweakSelect label="Theme" value={t.theme} options={[{ value: "auto", label: "Auto (system)" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }, { value: "playful", label: "Playful" }]} onChange={(v) => setTweak("theme", v)} />
      <TweakRadio label="Rainbow" value={t.accent} options={["vivid", "soft", "mono"]} onChange={(v) => setTweak("accent", v)} />
      <TweakSection label="Learning aids" />
      <TweakToggle label="Highlight irregular parts" value={t.highlight} onChange={(v) => setTweak("highlight", v)} />
      <TweakToggle label="Pronunciation buttons" value={t.sound} onChange={(v) => setTweak("sound", v)} />
      <TweakSection label="Monetization (demo)" />
      <TweakToggle label="Sponsor recommendation slot" value={t.sponsor} onChange={(v) => setTweak("sponsor", v)} />
      <TweakSection label="Typography & shape" />
      <TweakSelect label="Font" value={t.font} options={[{ value: "space", label: "Space Grotesk" }, { value: "sora", label: "Sora" }, { value: "jakarta", label: "Plus Jakarta" }]} onChange={(v) => setTweak("font", v)} />
      <TweakSlider label="Corner radius" value={t.radius} min={8} max={34} step={1} unit="px" onChange={(v) => setTweak("radius", v)} />
      <TweakRadio label="Density" value={t.density} options={["compact", "regular", "comfy"]} onChange={(v) => setTweak("density", v)} />
    </TweaksPanel>);

}

/* ---------- Onboarding: name ---------- */
function NameGate({ initial, onSubmit, onClose, editing, native, setNative, skill, setSkill }) {
  const [val, setVal] = useState(initial || "");
  const ref = useRef(null);
  useEffect(() => {setTimeout(() => ref.current && ref.current.focus(), 220);}, []);
  return (
    <div className="namegate">
      <div className="namecard">
        {editing && <button className="namex" onClick={onClose}>×</button>}
        <h2 className="namehead">{tr("welcome")}</h2>
        <p className="namebrand">Conju<b>Expert</b></p>
        <span className="brand-mark big">{RAINBOW.slice(0, 5).map((c, i) => <i key={i} style={{ background: c }}></i>)}</span>
        <p className="namesub">{tr("welcome_sub")}</p>
        <input ref={ref} className="nameinput" value={val} placeholder={tr("your_name")} maxLength={24}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {if (e.key === "Enter" && val.trim()) onSubmit(val.trim());}}
        autoComplete="off" autoCapitalize="words" spellCheck="false" />
        <div className="namefield">
          <label className="namelabel">{tr("mother_tongue")}</label>
          <div className="nativewrap">
            <select className="nativesel" value={native} onChange={(e) => setNative(e.target.value)}>
              {NATIVE_LANGS.map((l) => <option key={l.name} value={l.name}>{l.label}</option>)}
            </select>
            <span className="nativecaret">▾</span>
          </div>
        </div>
        <div className="namefield">
          <label className="namelabel">{tr("skill_q")}</label>
          <div className="skillseg">
            {["beginner", "intermediate", "advanced"].map((s) =>
            <button key={s} className={"skillbtn" + (skill === s ? " on" : "")} onClick={() => setSkill(s)}>
                <b>{tr("skill_" + s)}</b><small>{tr("skill_" + s + "_sub")}</small>
              </button>
            )}
          </div>
        </div>
        <button className="namebtn" disabled={!val.trim()} onClick={() => onSubmit(val.trim())}>
          <span className="cta-rainbow"></span>
          <span className="cta-label">{tr("lets_go")}</span>
        </button>
        <button className="nameskip" onClick={() => onSubmit("")}>{editing ? tr("remove_name") : tr("skip")}</button>
      </div>
    </div>);

}

/* ---------- Onboarding: feature tour ---------- */
function TourMock({ kind }) {
  if (kind === "trial") {
    return (
      <div className="tmock" key="trial" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"14px",paddingTop:"4px"}}>
        <div style={{fontSize:"48px",lineHeight:1}}>🎁</div>
        <div style={{fontSize:"42px",fontWeight:900,letterSpacing:"-0.04em",color:"var(--col)",lineHeight:1}}>24h</div>
        {[tr("tour_feat1"), tr("tour_feat2"), tr("tour_feat3")].map((t, i) =>
          <div key={i} className="tm-row" style={{animationDelay: 0.2 + i * 0.13 + "s", gap:"8px"}}>
            <span style={{color:"var(--col)",fontWeight:800}}>✓</span><span>{t}</span>
          </div>
        )}
      </div>);
  }
  if (kind === "conjugate") {
    return (
      <div className="tmock" key="c">
        <div className="tm-input"><span className="tm-cursor"></span>hablar</div>
        <div className="tm-rows">
          {["yo · hablo", "tú · hablas", "él · habla", "nosotros · hablamos"].map((r, i) =>
          <div className="tm-row" style={{ animationDelay: 0.25 + i * 0.13 + "s" }} key={i}>
              <span>{r.split(" · ")[0]}</span><b>{r.split(" · ")[1]}</b>
            </div>
          )}
        </div>
      </div>);

  }
  if (kind === "quiz") {
    return (
      <div className="tmock" key="q">
        <div className="tm-q">comer → <b>nosotros</b></div>
        <div className="tm-opts">
          {["comemos", "coméis", "comen", "comían"].map((o, i) =>
          <div className={"tm-opt" + (i === 0 ? " ok" : "")} style={{ animationDelay: 0.2 + i * 0.1 + "s" }} key={i}>{o}{i === 0 && <span className="tm-check">✓</span>}</div>
          )}
        </div>
      </div>);

  }
  if (kind === "learn") {
    return (
      <div className="tmock" key="l">
        {[["Presente", 0], ["Pretérito", 1], ["Futuro", 2], ["Subjuntivo", 3]].map((c, i) =>
        <div className="tm-lcard" style={{ animationDelay: 0.15 + i * 0.12 + "s", "--lc": RAINBOW[i] }} key={i}>
            <span className="tm-ldot"></span><b>{c[0]}</b>
          </div>
        )}
      </div>);

  }
  if (kind === "goals") {
    return (
      <div className="tmock" key="g">
        {[
          {icon:"✨",label:tr("goal_ai"),badge:tr("goal_ai_badge"),badgeCol:"#9a4bf0"},
          {icon:"⏱",label:tr("goal_time"),note:tr("goal_time_note"),noteCol:"var(--muted)"},
          {icon:"⚙️",label:tr("goal_custom"),note:tr("goal_custom_note"),noteCol:"var(--muted)"}
        ].map((opt, i) =>
          <div className="tm-row" key={i} style={{animationDelay: 0.15 + i * 0.13 + "s", gap:"10px"}}>
            <span style={{fontSize:"14px"}}>{opt.icon}</span>
            <span style={{flex:1,fontFamily:"var(--font-display)",fontWeight:700,fontSize:"12.5px",color:"var(--text)"}}>{opt.label}</span>
            {opt.badge && <span style={{fontSize:"9.5px",fontWeight:800,color:opt.badgeCol,background:"color-mix(in srgb,#a557ff 11%,var(--surface))",borderRadius:"5px",padding:"2px 6px",letterSpacing:"0.03em"}}>{opt.badge}</span>}
            {opt.note && <span style={{fontSize:"11px",color:opt.noteCol,fontWeight:600}}>{opt.note}</span>}
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:"10px",borderRadius:"12px",padding:"10px 13px",background:"color-mix(in srgb,#7a5cff 9%,var(--surface))",border:"1px solid color-mix(in srgb,#7a5cff 20%,var(--border))",animation:"tmpop 0.45s cubic-bezier(.34,1.4,.5,1) 0.54s both"}}>
          <span style={{fontSize:"26px",fontWeight:800,color:"#6a3fd0",lineHeight:1,fontFamily:"var(--font-display)"}}>12</span>
          <span style={{fontSize:"12px",lineHeight:1.4}}><b style={{color:"#6a3fd0",fontFamily:"var(--font-display)"}}>12 {tr("goal_daily")}</b><br/><small style={{color:"var(--muted)"}}>{tr("goal_time_approx")}</small></span>
        </div>
      </div>);
  }
  return (
    <div className="tmock" key="s">
      {[["DE", "gehen"], ["ES", "tener"], ["FR", "être"]].map((c, i) =>
      <div className="tm-srow" style={{ animationDelay: 0.2 + i * 0.14 + "s" }} key={i}>
          <span className="tm-star">★</span><span className="tm-sl">{c[0]}</span><b>{c[1]}</b><span className="tm-spk">🔊</span>
        </div>
      )}
    </div>);

}

function TourGate({ onDone }) {
  const [i, setI] = useState(0);
  const slides = [
  { kind: "trial", icon: "🎁", title: tr("offer_trial_b"), text: tr("tour_trial_sub"), col: "#0a84ff" },
  { kind: "conjugate", icon: "▦", title: tr("tab_conjugate"), text: tr("tour_conj"), col: "#ff3b5c" },
  { kind: "quiz", icon: "◆", title: tr("tab_quiz"), text: tr("tour_quiz"), col: "#34c759" },
  { kind: "learn", icon: "✦", title: tr("tab_learn"), text: tr("tour_learn"), col: "#0a84ff" },
  { kind: "saved", icon: "★", title: tr("tab_saved"), text: tr("tour_saved"), col: "#ffb300" },
  { kind: "goals", icon: "🎯", title: tr("tour_goals_h"), text: tr("tour_goal"), col: "#7a5cff" }];

  const last = i === slides.length - 1;
  const s = slides[i];
  return (
    <div className="namegate">
      <div className="namecard tourcard">
        <button className="namex" onClick={onDone} title={tr("tour_skip")}>×</button>
        <div className="tourstage" style={{ "--col": s.col }}>
          <TourMock kind={s.kind} />
        </div>
        <div className="tourhead-row">
          <span className="tourbadge" style={{ background: s.col }}>{s.icon}</span>
          <h2 className="namehead" style={{ margin: 0 }}>{s.title}</h2>
        </div>
        <p className="namesub">{s.text}</p>
        <div className="tourdots">{slides.map((_, k) => <span key={k} className={"tourdot" + (k === i ? " on" : "")}></span>)}</div>
        <button className="namebtn" onClick={() => last ? onDone() : setI(i + 1)}>
          <span className="cta-rainbow"></span>
          <span className="cta-label">{last ? tr("tour_start") : tr("tour_next")}</span>
        </button>
      </div>
    </div>);

}

/* ---------- Contextual first-open feature hints (per section) ----------
   Shown a few seconds after a user opens a section (Quiz / Learn / Saved) for
   the very first time, because most people click the welcome tour away too
   fast. One key per kind in window.UI (all 5 UI languages). */
const FEATURE_HINTS = {
  quiz:  { icon: "◆", col: "#34c759" },
  learn: { icon: "✦", col: "#0a84ff" },
  saved: { icon: "★", col: "#ffb300" } };
function FeatureHint({ kind, onClose }) {
  const meta = FEATURE_HINTS[kind] || FEATURE_HINTS.quiz;
  return (
    <div className="namegate" onClick={onClose}>
      <div className="namecard hintcard" onClick={(e) => e.stopPropagation()}>
        <button className="namex" onClick={onClose} title={tr("tour_skip")}>×</button>
        <div className="tourhead-row">
          <span className="tourbadge" style={{ background: meta.col }}>{meta.icon}</span>
          <h2 className="namehead" style={{ margin: 0 }}>{tr("hint_" + kind + "_h")}</h2>
        </div>
        <ul className="hintlist" style={{ "--col": meta.col }}>
          {[1, 2, 3].map((n, i) => {
            const txt = tr("hint_" + kind + "_" + n);
            if (!txt || txt === "hint_" + kind + "_" + n) return null;
            return <li key={n} style={{ animationDelay: 0.06 + i * 0.09 + "s" }} dangerouslySetInnerHTML={{ __html: txt }}></li>;
          })}
        </ul>
        <button className="namebtn" onClick={onClose}>
          <span className="cta-rainbow"></span>
          <span className="cta-label">{tr("got_it")}</span>
        </button>
      </div>
    </div>);
}

const UI_LOCALE = { de:"de-DE", en:"en-GB", es:"es-ES", nl:"nl-NL", fr:"fr-FR" };
function fmtDate(iso) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString(UI_LOCALE[UILANG] || "en-GB", { day:"numeric", month:"long", year:"numeric" });
}

/* ---------- App ---------- */
/* ===== User Menu ===== */
function AccountDeletedModal({ onClose, wasPremium }) {
  const until = wasPremium?.until ? new Date(wasPremium.until) : null;
  const untilStr = until ? fmtDate(until) : null;
  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{background:"var(--surface)",borderRadius:"24px",padding:"32px 24px",maxWidth:"340px",width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:"16px",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.2)"}}>
        <div style={{fontSize:"48px",lineHeight:1}}>👋</div>
        <div>
          <div style={{fontSize:"20px",fontWeight:800,color:"var(--text)",letterSpacing:"-.02em",marginBottom:"10px"}}>
            {tr("goodbye_heading")}
          </div>
          <div style={{fontSize:"14px",color:"var(--muted)",lineHeight:1.6}}>
            {tr("goodbye_love")}<br/>
            {tr("goodbye_data")}
          </div>
          {wasPremium && (
            <div style={{marginTop:"12px",background:"var(--surface-2)",borderRadius:"12px",padding:"12px 14px",fontSize:"13px",color:"var(--text)",lineHeight:1.5,border:"1px solid var(--border)"}}>
              {tr("sub_runs_until", {date: untilStr || tr("sub_end_period")})}
            </div>
          )}
        </div>
        <button onClick={onClose} style={{width:"100%",padding:"15px",borderRadius:"16px",border:"none",background:"linear-gradient(135deg,#e7156b,#a557ff)",color:"#fff",fontSize:"15px",fontWeight:800,cursor:"pointer",marginTop:"4px"}}>
          {tr("goodbye_btn")}
        </button>
      </div>
    </div>
  );
}

const DD_ITEM = {width:"100%",padding:"9px 10px",background:"none",border:"none",borderRadius:"10px",cursor:"pointer",textAlign:"left",fontSize:"13px",color:"var(--text)",display:"flex",alignItems:"center",gap:"8px"};

function UserChip({ avatar, label, onClick }) {
  return (
    <button onClick={onClick} style={{background:"none",border:"1.5px solid rgba(165,87,255,.35)",borderRadius:"20px",padding:"3px 9px 3px 4px",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px",fontFamily:"inherit"}}>
      {avatar}
      <span className="brand-greet" style={{pointerEvents:"none",fontSize:"13.5px",fontWeight:800}}>{label}</span>
      <span style={{fontSize:"9px",color:"var(--muted)",pointerEvents:"none"}}>▾</span>
    </button>
  );
}

function UserMenu({ user, greet, name, isPremium, premiumUntil, onDeleted, onEditName }) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(null); // null | "cancel" | "delete"
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelErr, setCancelErr] = useState("");
  const [cancelledUntil, setCancelledUntil] = useState(null);
  const ref = useRef(null);
  const initial = (name || user.email || "?")[0].toUpperCase();

  useEffect(() => {
    function onClickOut(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onClickOut);
    return () => document.removeEventListener("mousedown", onClickOut);
  }, []);

  function openPanel(p) { setPanel(p); setDeleteErr(""); setCancelErr(""); }

  async function cancelSubscription() {
    setCancelling(true); setCancelErr("");
    try {
      const { data, error } = await window.__supa.functions.invoke("cancel-subscription");
      if (error) throw new Error(error.message || "Fehler");
      setCancelledUntil(data?.premiumUntil || premiumUntil || null);
      setPanel(null);
    } catch(e) { setCancelErr(e.message || tr("err_cancel_fail")); }
    setCancelling(false);
  }

  async function deleteAccount() {
    setDeleting(true); setDeleteErr("");
    try {
      const { data, error } = await window.__supa.functions.invoke("delete-account");
      if (error) throw new Error(error.message || "Fehler");
      await window.__supa.auth.signOut();
      if (onDeleted) onDeleted(data);
    } catch(e) {
      setDeleteErr(e.message || tr("err_delete_fail"));
      setDeleting(false);
    }
  }

  const avatar = <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"linear-gradient(135deg,#e7156b,#a557ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:800,color:"#fff",flexShrink:0}}>{initial}</div>;

  // Days remaining on active subscription
  const activeUntil = cancelledUntil || premiumUntil;
  const daysLeft = activeUntil ? Math.max(0, Math.ceil((new Date(activeUntil) - Date.now()) / 86400000)) : 0;
  const untilStr = activeUntil
    ? fmtDate(new Date(activeUntil))
    : null;
  const hasActiveSub = isPremium && !cancelledUntil; // paid and not yet cancelled

  return (
    <div ref={ref} style={{position:"relative"}}>
      <UserChip avatar={avatar} label={greet} onClick={() => setOpen(o => !o)} />
      {open && (
        <div style={{position:"absolute",left:0,top:"calc(100% + 6px)",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"16px",boxShadow:"0 8px 28px rgba(0,0,0,.13)",padding:"8px",minWidth:"220px",zIndex:999}}>

          {/* ── Header ── */}
          <div style={{padding:"6px 10px 8px",borderBottom:"1px solid var(--border)",marginBottom:"4px"}}>
            <div style={{fontSize:"11px",color:"var(--muted)"}}>{tr("menu_logged_in")}</div>
            <div style={{fontSize:"12px",fontWeight:"600",wordBreak:"break-all"}}>{user.email}</div>
          </div>

          {/* ── Aktions-Items ── */}
          {panel === null && <>
            <button onClick={() => { onEditName && onEditName(); setOpen(false); }} style={DD_ITEM}><span>✏️</span> {tr("menu_edit_profile")}</button>
            <button onClick={() => { shareApp(); setOpen(false); }} style={DD_ITEM}><span>📤</span> {tr("menu_share")}</button>
            <button onClick={() => { rateApp(); setOpen(false); }} style={DD_ITEM}><span>⭐</span> {tr("menu_rate")}</button>
            <div style={{height:"1px",background:"var(--border)",margin:"3px 0"}}/>
            <button onClick={() => { window.__supa.auth.signOut(); setOpen(false); }} style={DD_ITEM}><span>↪</span> {tr("menu_logout")}</button>
            <div style={{height:"1px",background:"var(--border)",margin:"3px 0"}}/>

            {hasActiveSub && (
              <button onClick={() => openPanel("cancel")} style={{...DD_ITEM, color:"#ff9f0a"}}>
                <span>🔔</span> {tr("menu_cancel_sub")}
              </button>
            )}

            {isPremium && cancelledUntil && (
              <div style={{padding:"7px 10px",fontSize:"12px",color:"var(--muted)",lineHeight:1.5}}>
                {tr("menu_sub_active_until", {date: untilStr})}
              </div>
            )}

            <button onClick={() => openPanel("delete")} style={{...DD_ITEM, color:"#ff453a"}}>
              <span>🗑</span> {tr("menu_delete_acc")}
            </button>
          </>}

          {panel === "cancel" && (
            <div style={{padding:"4px 2px"}}>
              <div style={{fontSize:"13px",fontWeight:"700",color:"var(--text)",marginBottom:"6px",padding:"0 8px"}}>{tr("cancel_title")}</div>
              <div style={{fontSize:"12px",color:"var(--muted)",lineHeight:1.55,marginBottom:"10px",padding:"0 8px"}}>
                {tr("cancel_body", {date: untilStr})}
              </div>
              {cancelErr && <div style={{fontSize:"11px",color:"#ff453a",marginBottom:"8px",padding:"0 8px"}}>{cancelErr}</div>}
              <div style={{display:"flex",gap:"6px",padding:"0 2px"}}>
                <button onClick={() => openPanel(null)} style={{flex:1,padding:"8px",background:"var(--surface-2)",border:"1px solid var(--border)",borderRadius:"10px",cursor:"pointer",fontSize:"12px",fontWeight:"600"}}>{tr("cancel_no")}</button>
                <button onClick={cancelSubscription} disabled={cancelling} style={{flex:1,padding:"8px",background:"#ff9f0a",border:"none",borderRadius:"10px",cursor:"pointer",fontSize:"12px",color:"#fff",fontWeight:"700"}}>{cancelling ? "…" : tr("cancel_yes")}</button>
              </div>
            </div>
          )}

          {panel === "delete" && (
            <div style={{padding:"4px 2px"}}>
              <div style={{fontSize:"13px",fontWeight:"700",color:"#ff453a",marginBottom:"6px",padding:"0 8px"}}>{tr("delete_title")}</div>
              {hasActiveSub ? (
                <>
                  <div style={{background:"rgba(255,159,10,0.1)",border:"1px solid rgba(255,159,10,0.3)",borderRadius:"10px",padding:"10px",marginBottom:"10px",fontSize:"12px",lineHeight:1.55}}>
                    <div style={{fontWeight:"700",color:"#ff9f0a",marginBottom:"4px"}}>{tr("delete_warn_days", {n: daysLeft})}</div>
                    <div style={{color:"var(--muted)"}}>{tr("delete_warn_body", {date: untilStr})}</div>
                  </div>
                  {deleteErr && <div style={{fontSize:"11px",color:"#ff453a",marginBottom:"8px",padding:"0 8px"}}>{deleteErr}</div>}
                  <div style={{display:"flex",gap:"6px",padding:"0 2px"}}>
                    <button onClick={() => openPanel("cancel")} style={{flex:"1.4",padding:"8px",background:"linear-gradient(135deg,#ff9f0a,#ff6b00)",border:"none",borderRadius:"10px",cursor:"pointer",fontSize:"11px",color:"#fff",fontWeight:"700",lineHeight:1.3}}>{tr("delete_cancel_first")}</button>
                    <button onClick={deleteAccount} disabled={deleting} style={{flex:"1",padding:"8px",background:"rgba(255,69,58,0.12)",border:"1.5px solid #ff453a",borderRadius:"10px",cursor:"pointer",fontSize:"11px",color:"#ff453a",fontWeight:"700"}}>{deleting ? "…" : tr("delete_anyway")}</button>
                  </div>
                  <button onClick={() => openPanel(null)} style={{width:"100%",marginTop:"6px",padding:"6px",background:"none",border:"none",cursor:"pointer",fontSize:"11px",color:"var(--muted)"}}>{tr("cancel_no")}</button>
                </>
              ) : (
                <>
                  <div style={{fontSize:"12px",color:"var(--muted)",lineHeight:1.5,marginBottom:"10px",padding:"0 8px"}}>{tr("delete_data")}</div>
                  {deleteErr && <div style={{fontSize:"11px",color:"#ff453a",marginBottom:"8px",padding:"0 8px"}}>{deleteErr}</div>}
                  <div style={{display:"flex",gap:"6px",padding:"0 2px"}}>
                    <button onClick={() => openPanel(null)} style={{flex:1,padding:"8px",background:"var(--surface-2)",border:"1px solid var(--border)",borderRadius:"10px",cursor:"pointer",fontSize:"12px",fontWeight:"600"}}>{tr("cancel_no")}</button>
                    <button onClick={deleteAccount} disabled={deleting} style={{flex:1,padding:"8px",background:"#ff453a",border:"none",borderRadius:"10px",cursor:"pointer",fontSize:"12px",color:"#fff",fontWeight:"700"}}>{deleting ? "…" : tr("delete_yes")}</button>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

function GuestMenu({ name, greet, onLogin, onEditName }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOut(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onClickOut);
    return () => document.removeEventListener("mousedown", onClickOut);
  }, []);

  const avatar = <div style={{width:"22px",height:"22px",borderRadius:"50%",background:"var(--surface-2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  </div>;

  return (
    <div ref={ref} style={{position:"relative"}}>
      <UserChip avatar={avatar} label={greet} onClick={() => setOpen(o => !o)} />
      {open && (
        <div style={{position:"absolute",left:0,top:"calc(100% + 6px)",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"16px",boxShadow:"0 8px 28px rgba(0,0,0,.13)",padding:"8px",minWidth:"215px",zIndex:999}}>
          <div style={{padding:"6px 10px 10px",borderBottom:"1px solid var(--border)",marginBottom:"4px"}}>
            <div style={{fontSize:"12px",color:"var(--muted)",marginBottom:"10px",lineHeight:1.5}}>{tr("guest_login_sub")}</div>
            <button onClick={() => { onLogin(); setOpen(false); }} style={{width:"100%",padding:"11px",borderRadius:"12px",border:"none",background:"linear-gradient(135deg,#e7156b,#a557ff)",color:"#fff",fontWeight:700,fontSize:"14px",cursor:"pointer"}}>{tr("guest_login_cta")}</button>
          </div>
          <button onClick={() => { onEditName(); setOpen(false); }} style={DD_ITEM}><span>✏️</span> {tr("menu_edit_profile")}</button>
          <button onClick={() => { shareApp(); setOpen(false); }} style={DD_ITEM}><span>📤</span> {tr("menu_share")}</button>
          <button onClick={() => { rateApp(); setOpen(false); }} style={DD_ITEM}><span>⭐</span> {tr("menu_rate")}</button>
        </div>
      )}
    </div>
  );
}

/* ===== Login Modal ===== */
function LoginModal({ onClose, fromPayment }) {
  const [mode, setMode] = useState(fromPayment ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const emailRef = useRef(null);
  useEffect(() => { setTimeout(() => emailRef.current && emailRef.current.focus(), 200); }, []);

  async function submit(e) {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      const supa = window.__supa;
      if (mode === "reset") {
        const { error } = await supa.auth.resetPasswordForEmail(email, { redirectTo: "https://conjuexpert.app" });
        if (error) throw error;
        setDone(true);
      } else if (mode === "login") {
        const { error } = await supa.auth.signInWithPassword({ email, password: pw });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supa.auth.signUp({ email, password: pw });
        if (error) throw error;
        setDone(true);
      }
    } catch(e) { setErr(e.message); }
    setLoading(false);
  }

  const headings = {
    login: tr("login_welcome_back"),
    signup: fromPayment ? tr("login_almost_done") : tr("login_create_acct"),
    reset: tr("login_reset_pw")
  };
  const subs = {
    login: fromPayment ? tr("login_sub_login_pay") : tr("login_sub_login"),
    signup: fromPayment ? tr("login_sub_signup_pay") : tr("login_sub_signup"),
    reset: tr("login_sub_reset")
  };
  const doneText = { signup: { icon: "📧", msg: tr("login_done_signup") }, reset: { icon: "🔑", msg: tr("login_done_reset") } };

  return (
    <div className="namegate" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="namecard">
        <button className="namex" onClick={onClose}>×</button>
        <span className="brand-mark big">{RAINBOW.slice(0, 5).map((c, i) => <i key={i} style={{ background: c }}></i>)}</span>
        <h2 className="namehead">{headings[mode]}</h2>
        <p className="namesub">{subs[mode]}</p>
        {done ? (
          <div style={{ textAlign: "center", padding: "12px 0 8px" }}>
            <div style={{ fontSize: "42px", marginBottom: "10px" }}>{(doneText[mode] || doneText.signup).icon}</div>
            <p style={{ margin: "0 0 16px", color: "var(--muted)", fontSize: "14px", whiteSpace: "pre-line" }}>{(doneText[mode] || doneText.signup).msg}</p>
            <button className="namebtn" onClick={onClose}><span className="cta-rainbow"></span><span className="cta-label">OK</span></button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ width: "100%" }}>
            <input ref={emailRef} type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} required
              className="nameinput" style={{ marginBottom: "10px", fontWeight: 400, fontSize: "16px" }} autoComplete="email" />
            {mode !== "reset" && (
              <input type="password" placeholder={tr("login_pw_ph")} value={pw} onChange={e => setPw(e.target.value)} required minLength="6"
                className="nameinput" style={{ marginBottom: mode === "login" ? "6px" : "14px", fontWeight: 400, fontSize: "16px" }} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            )}
            {mode === "login" && (
              <p style={{ fontSize: "12px", textAlign: "right", margin: "0 0 12px", color: "var(--muted)" }}>
                <span onClick={() => { setMode("reset"); setErr(""); setPw(""); }}
                  style={{ cursor: "pointer", textDecoration: "underline" }}>{tr("login_forgot_pw")}</span>
              </p>
            )}
            {mode === "reset" && <div style={{ marginBottom: "14px" }} />}
            {err && <p style={{ color: "#ff453a", fontSize: "13px", margin: "0 0 10px", textAlign: "left" }}>{err}</p>}
            <button type="submit" className="namebtn" disabled={loading}>
              <span className="cta-rainbow"></span>
              <span className="cta-label">{loading ? "…" : (mode === "login" ? tr("sign_in") : mode === "signup" ? tr("login_btn_signup") : tr("login_btn_reset"))}</span>
            </button>
          </form>
        )}
        {!done && mode !== "reset" && <>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%", margin: "4px 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
            <span style={{ fontSize: "12px", color: "var(--muted)" }}>{tr("login_or")}</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
          </div>
          <button onClick={async () => { await window.__supa.auth.signInWithOAuth({ provider: "google", options: { redirectTo: "https://conjuexpert.app" } }); }}
            style={{ width: "100%", padding: "12px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/></svg>
            {tr("login_google")}
          </button>
          <button onClick={async () => { await window.__supa.auth.signInWithOAuth({ provider: "apple", options: { redirectTo: "https://conjuexpert.app" } }); }}
            style={{ width: "100%", padding: "12px", background: "#000", border: "1px solid #000", borderRadius: "12px", fontSize: "14px", fontWeight: "600", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "8px" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.453 2.208 3.09 3.792 3.029 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>
            {tr("login_apple")}
          </button>
          <p style={{ fontSize: "13px", marginTop: "12px", color: "var(--muted)" }}>
            {mode === "login" ? tr("login_no_account") + " " : tr("login_has_account") + " "}
            <span onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}
              style={{ color: "var(--tc,#0a84ff)", cursor: "pointer", textDecoration: "underline" }}>
              {mode === "login" ? tr("login_do_register") : tr("sign_in")}
            </span>
          </p>
        </>}
        {!done && mode === "reset" && (
          <p style={{ fontSize: "13px", marginTop: "12px", color: "var(--muted)" }}>
            <span onClick={() => { setMode("login"); setErr(""); }}
              style={{ color: "var(--tc,#0a84ff)", cursor: "pointer", textDecoration: "underline" }}>{tr("login_back")}</span>
          </p>
        )}
        <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "8px", opacity: 0.7 }}>{tr("login_data")}</p>
      </div>
    </div>
  );
}

/* ---------- Monetization ---------- */
const M_PRICE        = 2.99;
const A_PRICE_BONUS  = 24.99;
const A_PRICE_FULL   = 29.99;
const A_EQ           = +(M_PRICE * 12).toFixed(2);
const BONUS_MS       = 7 * 24 * 60 * 60 * 1000;
(function(){ if (!recall("kunju-first-open", null)) persist("kunju-first-open", Date.now()); })();
function isBonusActive() {
  const first = recall("kunju-first-open", null);
  if (!first) return false;
  return Date.now() - first < BONUS_MS;
}
function getAPrice() { return isBonusActive() ? A_PRICE_BONUS : A_PRICE_FULL; }
function getASave()  { return +(A_EQ - getAPrice()).toFixed(2); }
function getADisc()  { return Math.round(getASave() / A_EQ * 100); }
function fEur(n) { return String(n.toFixed(2)).replace(".", ","); }

const RCTA = React.forwardRef(function RCTA({ label, onClick }, ref) {
  return (
    <button className="rcta" onClick={onClick} ref={ref}>
      <span>{label}</span>
    </button>
  );
});

function FeatureBox({ rows }) {
  return (
    <div className="feature-box">
      {rows.map(([label, meta], i) =>
        <div key={i} className="feature-row">
          <div className="fcheck">✓</div>
          <span>{label}</span>
          {meta && <span className="fmeta">{meta}</span>}
        </div>
      )}
    </div>
  );
}

function useCountdown(expiry) {
  const [ms, setMs] = useState(() => expiry ? Math.max(0, expiry - Date.now()) : 0);
  useEffect(() => {
    if (!expiry) return;
    const t = setInterval(() => setMs(Math.max(0, expiry - Date.now())), 1000);
    return () => clearInterval(t);
  }, [expiry]);
  return ms;
}
function useBonusCountdown() {
  const [ms, setMs] = useState(() => { const f = recall("kunju-first-open", null); return f ? Math.max(0, f + BONUS_MS - Date.now()) : 0; });
  useEffect(() => {
    const t = setInterval(() => { const f = recall("kunju-first-open", null); setMs(f ? Math.max(0, f + BONUS_MS - Date.now()) : 0); }, 1000);
    return () => clearInterval(t);
  }, []);
  return ms;
}
function formatCountdown(ms) {
  if (ms <= 0) return "";
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h >= 24) { const d = Math.floor(h / 24); return `${d}T ${h % 24}h`; }
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}
function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div className="install-bar" role="banner">
      <span className="install-bar-icon">📱</span>
      <span className="install-bar-text">
        ConjuExpert auf deinen Homescreen!
        <small>Kein App Store nötig.</small>
      </span>
      <button className="install-bar-btn" onClick={onInstall}>Installieren</button>
      <button className="install-bar-x" onClick={onDismiss} aria-label="Schließen">✕</button>
    </div>
  );
}

function IOSInstallBanner({ onDismiss }) {
  return (
    <div className="install-bar" role="banner" style={{flexWrap:"wrap",gap:"8px 10px"}}>
      <span className="install-bar-icon">📱</span>
      <span className="install-bar-text" style={{minWidth:"180px"}}>
        {tr("ios_homescreen")}
        <small>{tr("ios_share")}</small>
      </span>
      <button className="install-bar-x" onClick={onDismiss} aria-label={tr("ios_close")}>✕</button>
    </div>
  );
}

function BonusBar({ onOpen, trialExpiry, bonusActive, name }) {
  const trialMs = useCountdown(trialExpiry);
  const onTrial = trialExpiry && trialMs > 0;
  const cd = formatCountdown(trialMs);
  const label = onTrial
    ? "🔥 " + (name ? name + ", " : "") + tr("bonus_trial")
    : bonusActive
      ? "🎁 " + tr("bonus_welcome")
      : "🎯 " + tr("bonus_quiz");

  return (
    <button onClick={onOpen} style={{width:"100%",background:"linear-gradient(135deg,#e7156b,#a557ff)",border:"none",padding:"6px 12px",fontSize:"12px",fontWeight:700,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",letterSpacing:"0.01em",textShadow:"0 1px 3px rgba(0,0,0,.2)",whiteSpace:"nowrap"}}>
      <span>{label}</span>
      {onTrial && cd && <span style={{display:"flex",alignItems:"center",gap:"4px",background:"rgba(0,0,0,.25)",borderRadius:"8px",padding:"2px 8px",fontVariantNumeric:"tabular-nums",letterSpacing:"0.05em",fontSize:"11px"}}>⏱ {cd}</span>}
    </button>
  );
}

function ReviewPrompt({ name, onRate, onFeedback, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const hi = name ? name + ", " : "";
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(10,8,20,0.6)", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fade 0.2s ease both" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "100%", maxWidth: "362px", background: "var(--surface)", borderRadius: "26px", boxShadow: "0 34px 80px -22px rgba(0,0,0,0.6)", overflow: "hidden", animation: "skup 0.34s cubic-bezier(.22,1,.36,1) both" }}>
        <div style={{ background: "linear-gradient(135deg,#e7156b,#ff7a18,#a557ff)", padding: "22px 22px 18px", textAlign: "center", color: "#fff" }}>
          <div style={{ display: "inline-block", fontSize: "10px", fontWeight: 800, letterSpacing: "0.09em", textTransform: "uppercase", background: "rgba(255,255,255,0.24)", borderRadius: "999px", padding: "4px 11px", marginBottom: "11px" }}>⭐ {tr("rev_kicker")}</div>
          <div style={{ fontSize: "36px", lineHeight: 1, marginBottom: "7px" }}>🚀</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "19px", lineHeight: 1.2 }}>{hi}{tr("rev_heading")}</div>
        </div>
        <div style={{ padding: "18px 22px 20px", textAlign: "center" }}>
          <p style={{ margin: "0 0 11px", fontSize: "15px", lineHeight: 1.5, color: "var(--text)" }} dangerouslySetInnerHTML={{__html: tr("rev_body1", {mins: "30"})}} />
          <p style={{ margin: "0 0 18px", fontSize: "13.8px", lineHeight: 1.55, color: "var(--muted)" }} dangerouslySetInnerHTML={{__html: tr("rev_body2")}} />
          <button onClick={onRate} style={{ width: "100%", border: "none", borderRadius: "15px", padding: "15px", background: "linear-gradient(135deg,#e7156b,#a557ff)", color: "#fff", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "16px", cursor: "pointer", boxShadow: "0 14px 32px -12px rgba(165,87,255,0.6)" }}>⭐ {tr("rev_rate")}</button>
          <button onClick={onFeedback} style={{ width: "100%", marginTop: "10px", border: "none", background: "none", color: "var(--lang-color,#0a84ff)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "13.5px", cursor: "pointer" }}>💡 {tr("rev_feedback")}</button>
          <button onClick={onClose} style={{ width: "100%", marginTop: "3px", border: "none", background: "none", color: "var(--muted)", fontSize: "12.5px", cursor: "pointer", padding: "6px" }}>{tr("rev_snooze")}</button>
        </div>
      </div>
    </div>
  );
}

function PaymentSuccess({ name, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape" || e.key === "Enter") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="paysuc-bg" role="dialog" aria-modal="true" aria-labelledby="paysuc-title">
      <div className="paysuc-modal">
        <div className="paysuc-glow" aria-hidden="true"/>
        <div className="paysuc-logo">
          <span className="brand-mark big" style={{display:"grid",width:"72px",height:"72px",borderRadius:"22px",padding:"11px",margin:"0 auto",boxShadow:"0 12px 40px -8px rgba(165,87,255,.45)"}}>
            {RAINBOW.slice(0,5).map((c,i) => <i key={i} style={{background:c}}/>)}
          </span>
          <span className="paysuc-check" aria-hidden="true">✓</span>
        </div>
        <h2 className="paysuc-h1" id="paysuc-title">
          {name ? `Super${name ? ", " + name : ""}!` : "Super!"}
        </h2>
        <p className="paysuc-sub">
          {tr("paysuc_sub")}
        </p>
        <div className="paysuc-perks">
          {[["🎯", tr("paysuc_feat1")],["⭐", tr("paysuc_feat2")],["♾️", tr("paysuc_feat3")]].map(([icon,text]) => (
            <div key={icon} className="paysuc-perk">
              <span className="paysuc-perk-icon">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <button className="paysuc-cta" onClick={onClose} autoFocus>
          <span>{tr("lets_go")}</span>
        </button>
      </div>
    </div>
  );
}

function WelcomeOffer({ onSecure, onTrial }) {
  const A_PRICE = A_PRICE_BONUS;
  const A_SAVE  = +(A_EQ - A_PRICE_BONUS).toFixed(2);
  const A_DISC  = Math.round(A_SAVE / A_EQ * 100);
  const ctaRef = useRef(null);
  const ms = useBonusCountdown();
  const cd = formatCountdown(ms);
  useEffect(() => {
    ctaRef.current && ctaRef.current.focus();
    const onKey = e => { if (e.key === "Escape") onTrial(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="offer-bg" role="dialog" aria-modal="true" aria-labelledby="offer-title">
      <div className="offer-modal">
        <button className="offer-close" onClick={onTrial} aria-label={tr("offer_close")}/>
        <span className="deal-badge" aria-hidden="true">{tr("offer_badge", {disc: A_DISC})}</span>
        {cd && <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",background:"linear-gradient(135deg,rgba(231,21,107,.12),rgba(165,87,255,.12))",border:"1px solid rgba(165,87,255,.3)",borderRadius:"12px",padding:"8px 14px",marginBottom:"4px"}}>
          <span style={{fontSize:"16px"}}>⏱</span>
          <span style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"13px",color:"var(--text)"}}>{tr("offer_expires", {t: ""})} <span style={{color:"#e7156b",fontVariantNumeric:"tabular-nums"}}>{cd}</span></span>
        </div>}
        <h2 className="offer-h1" id="offer-title">{tr("paywall_h1")}</h2>
        <p className="offer-sub">{tr("paywall_sub")}</p>
        <div className="offer-price" aria-label={tr("offer_price_label", {price: fEur(A_PRICE), eq: fEur(A_EQ)})}>
          <span className="offer-price-line"><b>{tr("offer_instead")}</b> {tr("offer_mo")} {fEur(M_PRICE)} € × 12 = {fEur(A_EQ)} € {tr("offer_yr")}</span>
          <span className="offer-price-zahlst" aria-hidden="true">{tr("offer_you_pay")}</span>
          <span className="offer-price-num" aria-hidden="true">{fEur(A_PRICE)} €<span className="offer-price-per"> {tr("offer_yr")}</span></span>
          <span className="offer-savings">{tr("offer_save", {save: fEur(A_SAVE), disc: A_DISC})}</span>
        </div>
        <div style={{width:"100%"}}><RCTA label={tr("offer_secure")} onClick={onSecure} ref={ctaRef} /></div>
        <button className="mghost" onClick={onTrial}>{tr("offer_trial")}</button>
      </div>
    </div>
  );
}

function PaywallSheet({ onUpgrade, onClose }) {
  const ctaRef = useRef(null);
  useEffect(() => {
    ctaRef.current && ctaRef.current.focus();
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="paywall-bg" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="paywall-title">
      <div className="paywall-sheet" onClick={e => e.stopPropagation()}>
        <div className="paywall-grab" aria-hidden="true"/>
        <div className="lock-tag" aria-hidden="true">{tr("paywall_lock")}</div>
        <h2 className="paywall-h1" id="paywall-title">{tr("paywall_h1")}</h2>
        <p className="paywall-sub">{tr("paywall_sub")}</p>
        <FeatureBox rows={[
          [tr("pw_feat1"), tr("pw_feat1v")],
          [tr("pw_feat2"), tr("pw_feat2v")],
          [tr("pw_feat3"), tr("pw_feat3v")],
        ]}/>
        <RCTA label={tr("paywall_unlock")} onClick={onUpgrade} ref={ctaRef}/>
        <button className="mghost" onClick={onClose}>{tr("paywall_later")}</button>
      </div>
    </div>
  );
}

function PlanSelect({ plan, setPlan, onNext, onClose, onLogin, onCouponLogin, supaUser, onPremium, openCoupon }) {
  const backRef = useRef(null);
  const plans = ["monthly", "annual"];
  const A_PRICE = getAPrice();
  const A_SAVE  = getASave();
  const A_DISC  = getADisc();
  const bonusActive = isBonusActive();
  const [showCode, setShowCode] = useState(openCoupon || false);
  const [code, setCode] = useState("");
  const [codeState, setCodeState] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [redeemed, setRedeemed] = useState(false);

  async function redeemCode() {
    if (!supaUser?.id) { setCodeState("err"); setErrMsg("Bitte zuerst anmelden"); return; }
    setCodeState("loading");
    try {
      const { data, error } = await window.__supa.functions.invoke("redeem-code", {
        body: { code: code.trim(), userId: supaUser.id },
      });
      if (error) {
        const body = await error.context?.json?.().catch(() => null);
        setCodeState("err"); setErrMsg(body?.error || error.message || "Fehler"); return;
      }
      if (data?.error) { setCodeState("err"); setErrMsg(data.error); return; }
      onPremium();
      setRedeemed(true);
    } catch(e) { setCodeState("err"); setErrMsg(e?.message || "Verbindungsfehler"); }
  }

  useEffect(() => {
    backRef.current && backRef.current.focus();
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  function onCardKey(e, id) {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); setPlan(id); }
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); setPlan(plans[(plans.indexOf(id)+1) % plans.length]); }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); setPlan(plans[(plans.indexOf(id)-1+plans.length) % plans.length]); }
  }
  if (redeemed) return (
    <div className="plansel-bg" role="dialog" aria-modal="true">
    <div className="plansel-sheet" style={{justifyContent:"center",alignItems:"center",padding:"32px 24px",textAlign:"center"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"20px",maxWidth:"320px",width:"100%"}}>
        <div style={{position:"relative",marginBottom:"4px"}}>
          <span className="brand-mark big" style={{display:"grid",margin:"0 auto",width:"72px",height:"72px",borderRadius:"22px",padding:"11px",boxShadow:"0 12px 40px -8px rgba(165,87,255,.45)"}}>
            {RAINBOW.slice(0,5).map((c,i)=><i key={i} style={{background:c}}/>)}
          </span>
          <span style={{position:"absolute",bottom:"-6px",right:"-6px",fontSize:"22px",lineHeight:1}}>✅</span>
        </div>
        <div>
          <div style={{fontSize:"26px",fontWeight:800,letterSpacing:"-.03em",color:"var(--text)",marginBottom:"8px"}}>Premium aktiviert!</div>
          <div style={{fontSize:"14px",color:"var(--muted)",lineHeight:1.5,textWrap:"balance"}}>Die App steht dir jetzt vollumfänglich zur Verfügung — ohne Einschränkungen.</div>
        </div>
        <div style={{width:"100%",background:"var(--surface-2)",borderRadius:"16px",padding:"16px",display:"flex",flexDirection:"column",gap:"10px"}}>
          {[["🎯","Konjugations-Quiz — alle Sprachen"],["⭐","Favoriten & Vokabellisten"],["🌍","Spanisch, Französisch, Italienisch, Portugiesisch, Deutsch"],["♾️","Unlimitiert, ohne Werbung"]].map(([icon,text])=>(
            <div key={text} style={{display:"flex",alignItems:"center",gap:"10px",fontSize:"13.5px",color:"var(--text)"}}>
              <span style={{width:"28px",height:"28px",borderRadius:"8px",background:"var(--surface)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",flexShrink:0,boxShadow:"var(--shadow-sm)"}}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <button className="paysuc-cta" onClick={onClose}>
          <span>Jetzt loslegen →</span>
        </button>
      </div>
    </div>
    </div>
  );

  return (
    <div className="plansel-bg" role="dialog" aria-modal="true" aria-labelledby="plansel-title">
    <div className="plansel-sheet">
      <div className="plansel-bar">
        <button className="plansel-back" ref={backRef} onClick={onClose} aria-label="Zurück">‹</button>
        <span id="plansel-title" style={{fontSize:"15px",fontWeight:700,color:"var(--text)"}}>Premium freischalten</span>
        <div style={{width:44}}/>
      </div>

      <div className="plansel-hero">
        <span className="brand-mark big" style={{margin:"0 auto 14px",display:"grid"}}>
          {RAINBOW.slice(0,5).map((c,i) => <i key={i} style={{background:c}}/>)}
        </span>
        <h2 className="plansel-hero-h1">Lerne ohne Limits</h2>
        <p className="plansel-hero-sub">{tr("plan_hero_sub")}</p>
      </div>

      <div className="plansel-content">
        <div className="plan-cards" role="radiogroup" aria-label="Abonnement wählen">
          <div className={"plan-card annual"+(plan==="annual"?" sel":"")}
            onClick={()=>setPlan("annual")} onKeyDown={e=>onCardKey(e,"annual")}
            role="radio" aria-checked={plan==="annual"}
            aria-label={tr("plan_annual")+": "+fEur(A_PRICE)+" € "+tr("plan_per_yr")} tabIndex={0}>
            <span className="plan-best-badge" aria-hidden="true">{bonusActive ? tr("plan_bonus") : tr("plan_best")}</span>
            <div className={"plan-radio"+(plan==="annual"?" on":"")} aria-hidden="true"/>
            <div className="plan-info">
              <div className="plan-name">{tr("plan_annual")}</div>
              <div className="plan-meta">{tr("plan_mo_label", {price: fEur(+(A_PRICE/12).toFixed(2)), eq: fEur(A_EQ)})}</div>
              <div className="savings-tag">{tr("plan_save", {save: fEur(A_SAVE), disc: A_DISC})}</div>
            </div>
            <div className="plan-price" aria-hidden="true"><b>{fEur(A_PRICE)} €</b><small> {tr("plan_per_yr")}</small></div>
          </div>
          <div className={"plan-card"+(plan==="monthly"?" sel":"")}
            onClick={()=>setPlan("monthly")} onKeyDown={e=>onCardKey(e,"monthly")}
            role="radio" aria-checked={plan==="monthly"}
            aria-label={tr("plan_monthly")+": "+fEur(M_PRICE)+" € "+tr("plan_per_mo")} tabIndex={0}>
            <div className={"plan-radio"+(plan==="monthly"?" on":"")} aria-hidden="true"/>
            <div className="plan-info">
              <div className="plan-name">{tr("plan_monthly")}</div>
              <div className="plan-meta">{tr("plan_flex", {eq: fEur(A_EQ)})}</div>
            </div>
            <div className="plan-price" aria-hidden="true"><b>{fEur(M_PRICE)} €</b><small> {tr("plan_per_mo")}</small></div>
          </div>
        </div>

        <div className="plansel-features">
          {[tr("plan_feat1"), tr("plan_feat2"), tr("plan_feat3"), tr("plan_feat4")].map((text)=>(
            <div key={text} className="plansel-feature-row">
              <span className="plansel-fcheck">✓</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <button className="plansel-cta" onClick={onNext}>{tr("plan_cta")}</button>

        <div className="plansel-footer">
          <div className="trust-badges">
            <span className="trust-badge"><span className="trust-icon">🔒</span>Stripe</span>
            <span className="trust-sep"/>
            <span className="trust-badge"><span className="trust-icon">✓</span>SSL</span>
            <span className="trust-sep"/>
            <span className="trust-badge"><span className="trust-icon">↩</span>{tr("plan_cancelable")}</span>
          </div>
          <div className="plansel-footer-links">
            <button className="plansel-footer-btn" onClick={onLogin}>{tr("plan_have_account")} <b>{tr("sign_in")}</b></button>
            {!showCode && <button className="plansel-footer-btn plansel-coupon-btn" onClick={()=>setShowCode(true)}>{tr("plan_coupon")}</button>}
          </div>
        </div>

        {showCode && (
          <div className="coupon-box">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"2px"}}>
              <span style={{fontSize:"13px",fontWeight:700,color:"var(--text)"}}>{tr("coupon_title")}</span>
              <button onClick={()=>{setShowCode(false);setCodeState(null);setCode("");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:"18px",color:"var(--muted)",lineHeight:1,padding:"0 2px"}}>×</button>
            </div>
            {!supaUser ? (
              <div style={{textAlign:"center",padding:"4px 0"}}>
                <div style={{fontSize:"13px",color:"var(--muted)",marginBottom:"10px"}}>{tr("coupon_need_login")}</div>
                <button onClick={()=>{setShowCode(false);(onCouponLogin||onLogin)();}} style={{padding:"11px 24px",borderRadius:"12px",border:"none",background:"linear-gradient(135deg,#e7156b,#a557ff)",color:"#fff",fontWeight:700,fontSize:"14px",cursor:"pointer"}}>
                  {tr("coupon_sign_in")}
                </button>
              </div>
            ) : (
              <>
                <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())}
                  placeholder={tr("coupon_ph")}
                  autoFocus
                  style={{width:"100%",padding:"12px 14px",borderRadius:"12px",border:"1.5px solid var(--border)",fontSize:"16px",fontFamily:"monospace",fontWeight:700,background:"var(--surface)",color:"var(--text)",outline:"none",letterSpacing:"0.08em",textAlign:"center"}}
                  onKeyDown={e=>e.key==="Enter" && redeemCode()}
                />
                <button onClick={redeemCode} disabled={!code.trim()||codeState==="loading"}
                  style={{width:"100%",padding:"13px",borderRadius:"12px",border:"none",background:(!code.trim()||codeState==="loading")?"var(--border)":"linear-gradient(135deg,#e7156b,#a557ff)",color:(!code.trim()||codeState==="loading")?"var(--muted)":"#fff",fontWeight:700,fontSize:"15px",cursor:(!code.trim()||codeState==="loading")?"default":"pointer",transition:"background .2s, color .2s"}}>
                  {codeState==="loading" ? tr("coupon_redeeming") : tr("coupon_redeem")}
                </button>
                {codeState==="err" && <div style={{fontSize:"13px",color:"#ff453a",textAlign:"center",marginTop:"-4px"}}>{errMsg}</div>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

/* ---------- GoalSuccess ---------- */
function GoalSuccess({ name, goal, onClose, onQuiz }) {
  const perDay = goal?.perDay || 12;
  const weeks = goal?.weeks || 2;
  const verbs = goal?.verbs || null;
  const words = goal?.words || null;
  return (
    <div className="streakmodal-bg" onClick={onClose}>
      <div className="zt-board" style={{alignItems:"stretch",gap:"16px",padding:"28px 24px 24px"}} onClick={e => e.stopPropagation()}>
        <button className="zt-x" onClick={onClose}>×</button>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",textAlign:"center"}}>
          <div style={{width:"56px",height:"56px",borderRadius:"18px",background:"linear-gradient(135deg,#0a84ff,#a557ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px",boxShadow:"0 10px 28px -10px #7a5cff"}}>✓</div>
          <div>
            <h2 style={{fontSize:"22px",fontWeight:900,letterSpacing:"-0.03em",margin:"0 0 6px",lineHeight:1.15}}>
              <span style={{background:"linear-gradient(95deg,#0a84ff,#a557ff)",WebkitBackgroundClip:"text",backgroundClip:"text",color:"transparent"}}>Deine Ziele sind erfasst{name ? `, ${name}` : ""}.</span>
            </h2>
            <p style={{fontSize:"13.5px",color:"var(--muted)",margin:0,lineHeight:1.6,maxWidth:"280px"}}>
              Viel Spaß beim Quizzen — stell dir vor, wie du bald flüssig in deiner Lieblingssprache sprichst. 🌟
            </p>
          </div>
        </div>
        <div style={{display:"flex",gap:"10px",background:"var(--surface-2)",borderRadius:"16px",padding:"14px 16px"}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:"20px",fontWeight:800,color:"#6a3fd0"}}>{perDay}</div>
            <div style={{fontSize:"11px",color:"var(--muted)",fontWeight:600,marginTop:"2px"}}>Übungen/Tag</div>
          </div>
          <div style={{width:"1px",background:"var(--border)"}}/>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:"20px",fontWeight:800,color:"#0a84ff"}}>{weeks}</div>
            <div style={{fontSize:"11px",color:"var(--muted)",fontWeight:600,marginTop:"2px"}}>{weeks === 1 ? "Woche" : "Wochen"}</div>
          </div>
          {verbs && <><div style={{width:"1px",background:"var(--border)"}}/>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:"20px",fontWeight:800,color:"#34c759"}}>{verbs}</div>
            <div style={{fontSize:"11px",color:"var(--muted)",fontWeight:600,marginTop:"2px"}}>Verben</div>
          </div></>}
          {words && <><div style={{width:"1px",background:"var(--border)"}}/>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:"20px",fontWeight:800,color:"#ff7a18"}}>{words}</div>
            <div style={{fontSize:"11px",color:"var(--muted)",fontWeight:600,marginTop:"2px"}}>Wörter</div>
          </div></>}
        </div>
        <button className="gcta" onClick={onQuiz}><span className="gg"></span><span>Los geht's — zum Quiz →</span></button>
        <button className="zt-act" onClick={onClose} style={{textAlign:"center"}}>Später starten</button>
      </div>
    </div>
  );
}

/* ---------- GoalCelebration ---------- */
function GoalCelebration({ name, daily, goal, onClose, onNewGoal }) {
  const planDay = goal?.startDate
    ? Math.min((goal.weeks||2)*7, Math.floor((Date.now() - new Date(goal.startDate)) / 86400000) + 1)
    : null;
  const goalDays = goal ? (goal.weeks||2)*7 : null;
  const planDone = planDay !== null && planDay >= goalDays;

  const EMOJIS = ["🎉","⭐","🔥","🏆","💪","🌟"];
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

  return (
    <div className="streakmodal-bg" onClick={onClose}>
      <div className="zt-board" style={{textAlign:"center",alignItems:"center",gap:"14px",padding:"32px 24px 24px"}} onClick={e => e.stopPropagation()}>
        <div style={{fontSize:"56px",lineHeight:1,animation:"flamepulse 1.4s ease-in-out infinite"}}>{emoji}</div>
        <div>
          <h2 style={{fontSize:"26px",fontWeight:900,letterSpacing:"-0.03em",margin:"0 0 6px"}}>
            {planDone ? "Lernziel erreicht!" : "Tagesziel geschafft!"}
          </h2>
          <p style={{fontSize:"14px",color:"var(--muted)",margin:0,lineHeight:1.5}}>
            {planDone
              ? `Du hast deinen ${goalDays}-Tage-Plan abgeschlossen${name ? `, ${name}` : ""}! Zeit für ein neues Ziel.`
              : `${name ? name + ", du" : "Du"} hast heute ${daily.goal} Übungen gemacht — stark!`}
          </p>
        </div>
        <div style={{display:"flex",gap:"12px",width:"100%",background:"var(--surface-2)",borderRadius:"16px",padding:"14px 16px"}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:"22px",fontWeight:800,color:"#6a3fd0"}}>{daily.count}</div>
            <div style={{fontSize:"11px",color:"var(--muted)",fontWeight:600,marginTop:"2px"}}>Übungen heute</div>
          </div>
          <div style={{width:"1px",background:"var(--border)"}}/>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:"22px",fontWeight:800,color:"#e8730a"}}>🔥 {daily.streak}</div>
            <div style={{fontSize:"11px",color:"var(--muted)",fontWeight:600,marginTop:"2px"}}>Tage in Folge</div>
          </div>
          {planDay && <><div style={{width:"1px",background:"var(--border)"}}/>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontSize:"22px",fontWeight:800,color:"#34c759"}}>{planDay}/{goalDays}</div>
            <div style={{fontSize:"11px",color:"var(--muted)",fontWeight:600,marginTop:"2px"}}>Plantage</div>
          </div></>}
        </div>
        {planDone ? (
          <button className="gcta" style={{width:"100%"}} onClick={onNewGoal}>
            <span className="gg"></span>
            <span>Neues Ziel setzen →</span>
          </button>
        ) : (
          <div style={{display:"flex",gap:"8px",width:"100%"}}>
            <button className="zt-act primary" style={{flex:2}} onClick={onClose}>Weiter üben</button>
            <button className="zt-act" style={{flex:1}} onClick={() => { onClose(); setTimeout(onNewGoal, 50); }}>Ziel anpassen</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Zieltafel ---------- */
function Zieltafel({ name, lang, daily, goal, onClose, onAdjustGoal, onQuiz }) {
  const LNAME = { de:"Deutsch", es:"Spanisch", en:"Englisch", nl:"Niederländisch", fr:"Französisch" }[lang] || "der Sprache";
  const HL = ["Richtig stark heute,","Das läuft bei dir,","Du wirst besser,","Schön, dich zu sehen,","Dranbleiben lohnt sich,","Da tut sich was,","Ich freu mich mit dir,","Weiter so,"];
  const hl = React.useRef(HL[Math.floor(Math.random() * HL.length)]).current;
  const who = name || "du";
  const shown = Math.min(daily.count, daily.goal);
  const left = Math.max(0, daily.goal - daily.count);

  const initMsg = `Wobei hakt's gerade${name ? `, ${name}` : ""}? Lass uns das im Dialog auf ${LNAME} üben.`;
  const [messages, setMessages] = React.useState([{ role:"ai", text: initMsg }]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function send(text) {
    const msg = (text !== undefined ? text : input).trim();
    if (!msg || loading) return;
    setInput("");
    const history = [...messages, { role:"user", text: msg }];
    setMessages(history);
    setLoading(true);
    try {
      const sys = `Du bist eine freundliche Sprachlehrerin in ConjuExpert. Die Nutzerin/der Nutzer heißt ${name || "jemand"} und lernt ${LNAME}. Sei kurz (2–3 Sätze), warm und konkret. Antworte auf Deutsch, außer bei Übungen auf ${LNAME}.`;
      const conv = history.map(m => (m.role === "ai" ? `Lehrerin: ${m.text}` : `Lernende/r: ${m.text}`)).join("\n");
      const reply = await window.claude.complete(`${sys}\n\nGespräch:\n${conv}\nLehrerin:`);
      setMessages(m => [...m, { role:"ai", text: reply.trim() }]);
    } catch(e) {
      setMessages(m => [...m, { role:"ai", text: "Ups, da ist etwas schiefgelaufen. Versuch es nochmal!" }]);
    }
    setLoading(false);
  }

  const goalDays = goal ? (goal.weeks || 2) * 7 : 14;
  const goalVerbs = goal ? goal.verbs : null;
  const goalWords = goal ? goal.words : null;
  const minsLeft = Math.max(1, Math.round(left * 0.5));
  const planDay = goal?.startDate
    ? Math.min(goalDays, Math.floor((Date.now() - new Date(goal.startDate)) / 86400000) + 1)
    : daily.streak;

  return (
    <div className="streakmodal-bg" onClick={onClose}>
      <div className="zt-board" onClick={e => e.stopPropagation()}>
        <button className="zt-x" onClick={onClose}>×</button>
        <div className="zt-eye">
          <span className="zt-k">Deine Zieltafel{goal ? <> · <b style={{color:"var(--text)"}}>Tag {planDay} / {goalDays}</b></> : ""}</span>
          <button className="zt-e" onClick={onAdjustGoal}>✎ Ziel anpa.</button>
        </div>
        <div><h2 className="zt-greet">{hl}<br /><span className="zt-nm">{who}.</span></h2><p className="zt-sub">Heute schon <b>{shown} von {daily.goal}</b> Übungen{left > 0 ? ` — noch ${left} bis zu deinem Tagesziel.` : " — Tagesziel geschafft! 🎉"}</p></div>
        <div className="zt-prog">
          <div className="zt-pr">
            <span className="zt-a">Heute <small>{shown} / {daily.goal}</small></span>
            {left > 0 && <span style={{fontSize:"12px",color:"var(--muted)",fontWeight:600}}>≈ {minsLeft} Min übrig</span>}
          </div>
          <div className="zt-pbar"><i style={{ width: Math.min(daily.count / daily.goal, 1) * 100 + "%" }}></i></div>
          <div style={{display:"flex",gap:"16px",marginTop:"2px",fontSize:"12.5px",fontWeight:700}}>
            {goalVerbs && <span style={{color:"var(--text)"}}>Verben <span style={{color:"#6a3fd0"}}>{goalVerbs}</span></span>}
            {goalWords && <span style={{color:"var(--text)"}}>Wörter <span style={{color:"#6a3fd0"}}>{goalWords}</span></span>}
            {daily.streak > 0 && <span style={{color:"#e8730a"}}>🔥 {daily.streak} Tage in Folge</span>}
          </div>
        </div>
        <div className="zt-ai" ref={scrollRef} style={{flexDirection:"column",gap:"12px",maxHeight:"220px",overflowY:"auto"}}>
          {messages.map((m, i) => m.role === "ai" ? (
            <div key={i} style={{display:"flex",gap:"13px",alignItems:"flex-start"}}>
              <span className="zt-av">{(name || "J").slice(0,1).toUpperCase()}</span>
              <div className="zt-body">
                <p>{m.text}</p>
                {i === 0 && <div className="zt-chips">
                  <span className="zt-chip" onClick={() => send("Ja, im Dialog üben")}>Ja, im Dialog üben</span>
                  <span className="zt-chip" onClick={onQuiz}>Lieber Quiz</span>
                  <span className="zt-chip" onClick={() => send("Ich erkläre dir, wobei ich Probleme habe.")}>Wo's hakt sagen</span>
                </div>}
              </div>
            </div>
          ) : (
            <div key={i} style={{display:"flex",justifyContent:"flex-end"}}>
              <span style={{background:"linear-gradient(95deg,#0a84ff,#a557ff)",color:"#fff",borderRadius:"14px 14px 0 14px",padding:"9px 13px",fontSize:"13.5px",maxWidth:"80%",lineHeight:1.5}}>{m.text}</span>
            </div>
          ))}
          {loading && <div style={{display:"flex",gap:"13px"}}><span className="zt-av">{(name||"J").slice(0,1).toUpperCase()}</span><div className="zt-body"><p style={{color:"var(--muted)",fontStyle:"italic"}}>…</p></div></div>}
        </div>
        <div className="zt-chatin"><input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && send()} placeholder="Antworte hier …" disabled={loading} /><button className="zt-send" onClick={() => send()} disabled={loading || !input.trim()}>↑</button></div>
        <div className="zt-acts"><button className="zt-act primary" onClick={onClose}>Weiter üben</button><button className="zt-act" onClick={onQuiz}>Zum Quiz →</button></div>
      </div>
    </div>
  );
}

/* ---------- GoalFlow ---------- */
function GoalFlow({ step, setStep, name, lang, onClose, onCreate }) {
  const eng = window.CONJ[lang] || window.CONJ["de"];
  const tenseOpts = React.useMemo(() => { const r = eng.conjugate(eng.samples[0]); return r && r.tenses ? r.tenses.map((t) => ({ id: t.id, label: t.label })) : []; }, [lang]);
  const allTenseIds = React.useMemo(() => tenseOpts.map((t) => t.id), [tenseOpts]);
  const [tenseSel, setTenseSel] = useState(() => allTenseIds.slice());
  React.useEffect(() => { setTenseSel(allTenseIds.slice()); }, [allTenseIds]);
  const tenseCount = tenseSel.length || 1;
  function toggleTense(id) { setTenseSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }

  const [verbs, setVerbs] = useState(8);
  const [words, setWords] = useState(20);
  const [weeks, setWeeks] = useState(2);
  const [timeMins, setTimeMins] = useState(10);
  const WEEK_OPTS = [1, 2, 3, 4];
  const days = weeks * 7;
  const reps = verbs * tenseCount * 8 + words * 6;
  const perDay = Math.max(6, Math.round(reps / days));
  const minsEst = Math.max(3, Math.round(perDay * 0.5));
  const tenseText = (!tenseSel.length || tenseSel.length === allTenseIds.length) ? "allen Zeitformen" : tenseSel.map(id => (tenseOpts.find(t => t.id === id) || {}).label).filter(Boolean).join(", ");

  // Zeit-Pfad: from minutes → perDay → back-calc plan totals (same unit as Form: distinct items)
  const timPerDay = Math.max(6, Math.round(timeMins * 2));
  const timDays = 14; // fixed 2-week plan for time path
  const timVerbs = Math.max(4, Math.round((timPerDay * timDays * 0.35) / (3 * 8)));
  const timWords = Math.max(8, Math.round((timPerDay * timDays * 0.65) / 6));

  function cycleWeeks() { setWeeks(w => WEEK_OPTS[(WEEK_OPTS.indexOf(w) + 1) % WEEK_OPTS.length]); }

  const Wordmark = () => <span><span className="cw-c">Conju</span><span className="cw-e">Expert</span></span>;
  const Stepper = ({ value, set, min = 1 }) =>
    <span className="gstep"><button onClick={() => set(Math.max(min, value - 1))}>–</button><span className="gnum">{value}</span><button onClick={() => set(value + 1)}>+</button></span>;

  const renderForm = (prefilled) =>
    <React.Fragment>
      {prefilled &&
        <div className="gkibanner"><span className="gkic">✨</span><span className="gkit"><b>Dein KI-Vorschlag — Level Mittel.</b> Schon ausgefüllt — pass alles frei an.</span></div>
      }
      <div className="qfilter-block"><div className="qfilter-lbl">Zeitraum</div><button className="tdbtn" onClick={cycleWeeks}><span className="tdbtn-sum">{weeks} {weeks === 1 ? "Woche" : "Wochen"}</span><span className="tdbtn-caret">▾</span></button></div>
      <div className="qfilter-block"><div className="qfilter-lbl">Zeitform</div><TenseDropdown lang={lang} tenses={tenseOpts} isOn={(id) => tenseSel.includes(id)} onToggle={toggleTense} onAll={() => setTenseSel(allTenseIds.slice())} onNone={() => setTenseSel([])} hideLbl /></div>
      <div className="qfilter-block"><div className="qfilter-lbl">Verben konjugieren</div><div className="gstepwrap"><span className="gsl">Anzahl Verben<small>je Zeitform</small></span><Stepper value={verbs} set={setVerbs} /></div></div>
      <div className="qfilter-block"><div className="qfilter-lbl">Neue Wörter</div><div className="gstepwrap"><span className="gsl">Wortschatz<small>neu lernen</small></span><Stepper value={words} set={setWords} /></div></div>
      <div className="gderive"><span className="gbig">{perDay}</span><span className="gdt"><b>Übungen pro Tag · ≈ {minsEst} Min.</b><br /><small>Dein Tagesziel — passt sich automatisch an.</small></span></div>
      <div className="gsumlbl">Lernziel Zusammenfassung</div>
      <div className="gsummary">In <span className="ghl">{weeks} {weeks === 1 ? "Woche" : "Wochen"}</span>: <span className="ghl">{verbs} Verben</span> je Form <span className="ghl">{tenseText}</span>, dazu <span className="ghl">{words} neue Wörter</span>.</div>
      <button className="gcta" onClick={() => onCreate({ weeks, verbs, words, tenseCount, perDay })}><span className="gg"></span><span>Erstelle einen Lernplan · {perDay} Übungen/Tag</span></button>
    </React.Fragment>;

  return (
    <div className="goal-bg" onClick={onClose}>
      <div className="goal-sheet" style={{ "--lc": "#7a5cff", "--lang-color": "#7a5cff", "--cc": "#a557ff" }} onClick={(e) => e.stopPropagation()}>
        <button className="goal-x" onClick={onClose}>×</button>
        {step === "choose" &&
        <React.Fragment>
          <h2 className="goal-h1">Lege dein Lernziel fest, um <Wordmark /> zu werden:</h2>
          <div className="qfilter-lbl">Wie möchtest du starten?</div>
          <div className="gchoice sug" onClick={() => setStep("suggest")}>
            <span className="gci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3.2l1.7 4.1 4.1 1.7-4.1 1.7L12 14.8l-1.7-4.1L6.2 9l4.1-1.7z"></path><path d="M18.5 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"></path></svg></span>
            <span className="gct"><span className="gh">Schlag mir was vor <span className="glvl">LEVEL: MITTEL</span></span><span className="gs">Wir bauen dir in Sekunden einen passenden Plan — abgestimmt auf dein Niveau.</span></span>
            <span className="ggo">→</span>
          </div>
          <div className="gchoice ind" onClick={() => setStep("individual")}>
            <span className="gci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="7.5" x2="20" y2="7.5"></line><line x1="4" y1="16.5" x2="20" y2="16.5"></line><circle cx="9" cy="7.5" r="2.6" fill="var(--surface)"></circle><circle cx="15" cy="16.5" r="2.6" fill="var(--surface)"></circle></svg></span>
            <span className="gct"><span className="gh">Individueller Lernplan</span><span className="gs">Zeitraum, Zeitformen, Verben &amp; Wörter selbst festlegen.</span></span>
            <span className="ggo">→</span>
          </div>
          <div className="gorsep">oder nach Zeit</div>
          <div className="gchoice tim" onClick={() => setStep("time")}>
            <span className="gci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12.5" r="8"></circle><path d="M12 8v4.5l3 1.8"></path></svg></span>
            <span className="gct"><span className="gh">Ich gebe meine Zeit vor</span><span className="gs">„Ich möchte … Minuten am Tag üben" — wir rechnen das Ziel aus.</span></span>
            <span className="ggo">→</span>
          </div>
        </React.Fragment>
        }
        {step === "suggest" &&
        <React.Fragment>
          <div className="gback"><button className="gbackbtn" onClick={() => setStep("choose")}>‹</button><span className="gbt">Schlag mir was vor · zurück</span></div>
          {renderForm(true)}
        </React.Fragment>
        }
        {step === "individual" &&
        <React.Fragment>
          <div className="gback"><button className="gbackbtn" onClick={() => setStep("choose")}>‹</button><span className="gbt">Individueller Lernplan · zurück</span></div>
          {renderForm(false)}
        </React.Fragment>
        }
        {step === "time" &&
        <React.Fragment>
          <div className="gback"><button className="gbackbtn" onClick={() => setStep("choose")}>‹</button><span className="gbt">Nach Zeit · zurück</span></div>
          <div className="gkibanner"><span className="gkic">⏱</span><span className="gkit"><b>Wie viele Minuten möchtest du täglich üben?</b> Wir berechnen dein optimales Tagesziel automatisch.</span></div>
          <div className="gmins-row">
            <span className="gml">Minuten pro Tag<small>mindestens 3 Min. empfohlen</small></span>
            <div className="gmins-btns">
              <button onClick={() => setTimeMins(m => Math.max(3, m - 1))}>–</button>
              <span className="gmval">{timeMins}</span>
              <button onClick={() => setTimeMins(m => m + 1)}>+</button>
            </div>
          </div>
          <div className="gderive">
            <span className="gbig">{timPerDay}</span>
            <span className="gdt"><b>Übungen pro Tag · ≈ {timeMins} Min.</b><br /><small>~{timVerbs} Verben &amp; {timWords} Wörter täglich.</small></span>
          </div>
          <div className="gsumlbl">Lernziel Zusammenfassung</div>
          <div className="gsummary">Täglich <span className="ghl">{timeMins} Minuten</span> = <span className="ghl">{timPerDay} Übungen/Tag</span>. In <span className="ghl">2 Wochen</span> lernst du ca. <span className="ghl">{timVerbs} Verben</span> und <span className="ghl">{timWords} neue Wörter</span>.</div>
          <button className="gcta" onClick={() => onCreate({ weeks: 2, verbs: timVerbs, words: timWords, tenseCount: 3, perDay: timPerDay })}><span className="gg"></span><span>Lernplan erstellen · {timPerDay} Übungen/Tag</span></button>
        </React.Fragment>
        }
      </div>
    </div>);
}

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position:"fixed", bottom:"88px", left:"50%", transform:"translateX(-50%)",
      background:"rgba(20,21,26,0.93)", color:"#fff", borderRadius:"14px",
      padding:"11px 20px", fontSize:"14px", fontWeight:500, lineHeight:1.4,
      zIndex:9999, maxWidth:"calc(100vw - 40px)", textAlign:"center",
      boxShadow:"0 8px 28px rgba(0,0,0,0.35)", whiteSpace:"pre-wrap",
      animation:"fade 0.18s ease", pointerEvents:"none",
    }}>{msg}</div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [toastMsg, setToastMsg] = useState(null);
  const [lang, setLang] = useState(() => recall("kunju-lang", "de"));
  const [verb, setVerb] = useState("");
  const [result, setResult] = useState(null);
  const [deconj, setDeconj] = useState(null);
  const [activeInf, setActiveInf] = useState(null);
  const [tab, setTab] = useState("conjugate");
  const [lastVerb, setLastVerb] = useState("");
  const [favs, setFavs] = useState(() => recall("kunju-favs", []));
  const [supaUser, setSupaUser] = useState(() => window.__supaUser || null);
  const [showLogin, setShowLogin] = useState(false);
  const [showDeletedMsg, setShowDeletedMsg] = useState(false);
  const [deletedWasPremium, setDeletedWasPremium] = useState(null); // { until: ISO string | null }
  const [history, setHistory] = useState(() => recall("kunju-history", []));
  const [name, setName] = useState(() => recall("kunju-name", ""));
  const [showOnboard, setShowOnboard] = useState(() => recall("kunju-name", null) === null);
  const [showTour, setShowTour] = useState(() => recall("kunju-name", null) !== null && recall("kunju-tour", null) === null);
  const [native, setNative] = useState(() => recall("kunju-native", detectNative()));
  const [skill, setSkill] = useState(() => recall("kunju-skill", "beginner"));
  function setNat(n) {setNative(n);persist("kunju-native", n);}
  function setSkl(s) {setSkill(s);persist("kunju-skill", s);}
  function commitName(n) {setName(n);persist("kunju-name", n);setShowOnboard(false);if (recall("kunju-tour", null) === null) setShowTour(true);}
  function finishTour() {persist("kunju-tour", true);setShowTour(false);startTrial();}
  // Contextual first-open hint per section (Quiz / Learn / Saved).
  const [featureHint, setFeatureHint] = useState(null);
  function closeFeatureHint() { if (featureHint) persist("kunju-hint-" + featureHint, true); setFeatureHint(null); }
  UILANG = uiFromNative(native);
  useEffect(() => { window.__toast = (msg) => setToastMsg(msg); return () => { window.__toast = null; }; }, []);

  // --- Monetization ---
  const [isPremium, setIsPremium] = useState(() => recall("kunju-premium", false));
  const [premiumUntil, setPremiumUntil] = useState(() => recall("kunju-premium-until", null));
  const [showPaySuccess, setShowPaySuccess] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  // After ~30 min of total active use, ask once for a rating (gentle snooze on "later")
  useEffect(() => {
    if (recall("kunju-review-done", false)) return;
    const TARGET = 1800; // 30 minutes
    let secs = recall("kunju-active-secs", 0);
    const id = setInterval(() => {
      if (document.visibilityState && document.visibilityState !== "visible") return;
      secs += 15; persist("kunju-active-secs", secs);
      if (secs >= TARGET && recall("kunju-name", "")) { setShowReviewPrompt(true); clearInterval(id); }
    }, 15000);
    return () => clearInterval(id);
  }, []);

  // Check premium from Supabase on load + handle Stripe return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      // Optimistic unlock: Stripe only sends users here after successful payment.
      // The webhook may still be in flight, so we trust the success URL immediately.
      persist("kunju-premium", true);
      setIsPremium(true);
      setShowPaySuccess(true);
      window.history.replaceState({}, "", "/");
      // Background verify: sync DB status once webhook has likely landed
      if (window.__supa) {
        setTimeout(() => {
          window.__supa.auth.getUser().then(({ data }) => {
            if (!data?.user) return;
            window.__supa.from("profiles").select("is_premium")
              .eq("id", data.user.id).single()
              .then(({ data: profile }) => {
                if (profile?.is_premium) persist("kunju-premium", true);
              });
          });
        }, 4000);
      }
    }
    if (params.get("payment") === "cancel") {
      setShowPlanSelect(true);
      window.history.replaceState({}, "", "/");
    }
  }, []);
  const [trialExpiry, setTrialExpiry] = useState(() => { const d = recall("kunju-trial", null); return d ? d.exp : null; });
  function hasPaidAccess() {
    if (trialExpiry && Date.now() < trialExpiry) return true;
    if (authResolved && !supaUser) return false;
    const premExpired = isPremium && premiumUntil && new Date(premiumUntil) < new Date();
    return !premExpired && isPremium;
  }
  const [authResolved, setAuthResolved] = useState(false);
  const paywallOnExpiryShown = useRef(false);
  const [showOffer, setShowOffer] = useState(false);
  const [bonusActive] = useState(() => isBonusActive());

  const deferredInstall = useRef(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIOSInstall, setShowIOSInstall] = useState(false);
  useEffect(() => {
    if (recall("kunju-install-dismissed", false)) return;
    // Android/Chrome: event may have already fired before React mounted
    if (window.__deferredInstallPrompt) {
      deferredInstall.current = window.__deferredInstallPrompt;
      window.__deferredInstallPrompt = null;
      setShowInstall(true);
    }
    // Also listen for future fires (e.g. deferred by browser heuristics)
    const handler = (e) => { e.preventDefault(); deferredInstall.current = e; setShowInstall(true); };
    window.addEventListener("beforeinstallprompt", handler);
    const installed = () => { setShowInstall(false); persist("kunju-install-dismissed", true); };
    window.addEventListener("appinstalled", installed);
    // iOS Safari: no beforeinstallprompt — show manual hint
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone === true;
    if (isIOS && isSafari && !isStandalone) setShowIOSInstall(true);
    return () => { window.removeEventListener("beforeinstallprompt", handler); window.removeEventListener("appinstalled", installed); };
  }, []);
  async function handleInstall() {
    if (!deferredInstall.current) return;
    deferredInstall.current.prompt();
    const { outcome } = await deferredInstall.current.userChoice;
    deferredInstall.current = null;
    setShowInstall(false);
    if (outcome === "accepted") persist("kunju-install-dismissed", true);
  }
  function dismissInstall() { persist("kunju-install-dismissed", true); setShowInstall(false); }
  function dismissIOSInstall() { persist("kunju-install-dismissed", true); setShowIOSInstall(false); }
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPlanSelect, setShowPlanSelect] = useState(false);
  const [pendingCoupon, setPendingCoupon] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(false);
  const [selPlan, setSelPlan] = useState("annual");

  function openPlanSelect() {
    if (!supaUser) { setPendingPayment(true); setShowLogin(true); return; }
    setShowPlanSelect(true);
  }

  async function goToStripe() {
    if (!supaUser) { setPendingPayment(true); setShowPlanSelect(false); setShowLogin(true); return; }
    try {
      const { data, error } = await window.__supa.functions.invoke("create-checkout-session", {
        body: { plan: selPlan === "annual" && isBonusActive() ? "annual_bonus" : selPlan, userId: supaUser.id, email: supaUser.email },
      });
      const url = data?.url;
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (e) {
      setToastMsg(tr("pay_error"));
    }
  }

  function startTrial() {
    const exp = Date.now() + 24 * 60 * 60 * 1000;
    persist("kunju-trial", { exp });
    persist("kunju-offer-seen", Date.now());
    setTrialExpiry(exp);
    setShowOffer(false);
  }
  function handleTabSwitch(id) {
    if ((id === "quiz" || id === "saved") && !hasPaidAccess()) { setShowPaywall(true); return; }
    setTab(id);
  }

  // After auth resolves: enforce tab access — kick users who got in before auth was ready
  useEffect(() => {
    if (!authResolved) return;
    if (tab !== "quiz" && tab !== "saved") return;
    const onTrial = trialExpiry && Date.now() < trialExpiry;
    const premExpired = isPremium && premiumUntil && new Date(premiumUntil) < new Date();
    const hasAccess = onTrial || (supaUser && !premExpired && isPremium);
    if (!hasAccess) { setTab("conjugate"); setShowPaywall(true); }
  }, [authResolved, supaUser, isPremium, premiumUntil, trialExpiry]);

  // First time a user opens a section, pop a short explainer a few seconds in
  // (most people skip the welcome tour too fast). Once per section, persisted.
  useEffect(() => {
    const TAB_HINT = { quiz: "quiz", grammar: "learn", saved: "saved" };
    const kind = TAB_HINT[tab];
    if (!kind) return;
    if (recall("kunju-hint-" + kind, false)) return;
    // Don't compete with the name gate, the welcome tour or the paywall.
    if (showOnboard || showTour || showPaywall) return;
    const id = setTimeout(() => setFeatureHint(kind), 2600);
    return () => clearTimeout(id);
  }, [tab, showOnboard, showTour, showPaywall]);

  // Auto-detect expired premium and show paywall once per session
  useEffect(() => {
    if (paywallOnExpiryShown.current) return;
    const expired = isPremium && premiumUntil && new Date(premiumUntil) < new Date();
    if (!expired) return;
    paywallOnExpiryShown.current = true;
    persist("kunju-premium", false);
    setIsPremium(false);
    setShowPaywall(true);
  }, [isPremium, premiumUntil]);

  // Auth: listen for Supabase login/logout
  useEffect(() => {
    function onAuth(e) {
      setAuthResolved(true);
      const user = e.detail;
      setSupaUser(user);
      if (!user) {
        // Logged out or no session — premium requires an account, reset stale state
        if (recall("kunju-premium", false)) {
          persist("kunju-premium", false);
          persist("kunju-premium-until", null);
          setIsPremium(false);
          setPremiumUntil(null);
        }
        return;
      }
      if (user && window.__supa) {
        // Load cloud favorites + premium status on login
        window.__supa.from("favorites").select("lang,verb").eq("user_id", user.id).then(({ data }) => {
          if (data && data.length) {
            setFavs(prev => {
              const merged = [...prev];
              data.forEach(f => { if (!merged.some(x => x.lang===f.lang && x.verb===f.verb)) merged.push(f); });
              persist("kunju-favs", merged);
              return merged;
            });
          }
        });
        window.__supa.from("profiles").select("is_premium,premium_until").eq("id", user.id).single().then(({ data: p }) => {
          if (p?.is_premium) {
            persist("kunju-premium", true); setIsPremium(true);
          } else if (recall("kunju-premium", false)) {
            // DB says not premium but localStorage says yes → expired/cancelled
            persist("kunju-premium", false); setIsPremium(false);
            if (!paywallOnExpiryShown.current) {
              paywallOnExpiryShown.current = true;
              setShowPaywall(true);
            }
          }
          if (p?.premium_until) { persist("kunju-premium-until", p.premium_until); setPremiumUntil(p.premium_until); }
        });
        // Return to coupon box or stripe after login if user came from there
        if (pendingCoupon) {
          setShowLogin(false);
          setShowPlanSelect(true);
        } else if (pendingPayment) {
          setShowLogin(false);
          setPendingPayment(false);
          const plan = (selPlan === "annual" && isBonusActive()) ? "annual_bonus" : selPlan;
          window.__supa.functions.invoke("create-checkout-session", {
            body: { plan, userId: user.id, email: user.email },
          }).then(({ data, error }) => {
            if (error || !data?.url) { setToastMsg(tr("pay_error")); return; }
            window.location.href = data.url;
          }).catch(() => setToastMsg(tr("pay_error")));
        }
      }
    }
    document.addEventListener("supa-auth", onAuth);
    return () => document.removeEventListener("supa-auth", onAuth);
  }, [pendingCoupon, pendingPayment]);

  // Clear pendingCoupon / pendingPayment after PlanSelect has mounted
  useEffect(() => {
    if (showPlanSelect && pendingCoupon) setPendingCoupon(false);
    if (showPlanSelect && pendingPayment) setPendingPayment(false);
  }, [showPlanSelect, pendingCoupon, pendingPayment]);

  // Sponsor slot: 1×/session, re-show only after >=4 more conjugations, daily cap.
  const adSession = useRef({ shown: 0, dismissed: false, conjSince: 999 });
  const [adVisible, setAdVisible] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [sysDark, setSysDark] = useState(() => !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches));
  const [daily, setDaily] = useState(() => readDaily());
  const [showGoalCelebration, setShowGoalCelebration] = useState(false);
  const [showGoalSuccess, setShowGoalSuccess] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [goalStep, setGoalStep] = useState("choose");
  const [goalSet, setGoalSet] = useState(() => recall("kunju-goal", false));
  const [goal, setGoal] = useState(() => recall("kunju-goal-data", null));
  const [skHint, setSkHint] = useState(() => !recall("kunju-skhint", false));
  function closeSkHint() { setSkHint(false); persist("kunju-skhint", true); }
  const [offline, setOffline] = useState(() => !navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false), off = () => setOffline(true);
    window.addEventListener("online", on);window.addEventListener("offline", off);
    return () => {window.removeEventListener("online", on);window.removeEventListener("offline", off);};
  }, []);
  function onActivity() {
    const prev = daily.count;
    const next = bumpDaily();
    setDaily(next);
    if (prev < next.goal && next.count >= next.goal) {
      setShowGoalCelebration(true);
    }
  }
  const adTimer = useRef(null);

  function maybeShowAd() {
    const s = adSession.current;
    if (s.dismissed) return;
    if (s.shown >= 1 && s.conjSince < 4) return;
    const today = new Date().toDateString();
    const day = recall("kunju-adday", { d: "", n: 0 });
    const todayN = day.d === today ? day.n : 0;
    if (todayN >= 8) return;
    s.shown += 1;s.conjSince = 0;
    persist("kunju-adday", { d: today, n: todayN + 1 });
    if (adTimer.current) clearTimeout(adTimer.current);
    adTimer.current = setTimeout(() => setAdVisible(true), 400);
  }
  function onAdClick() {
    const n = recall("kunju-adclicks", 0) + 1;persist("kunju-adclicks", n);
  }
  function onAdDismiss() {adSession.current.dismissed = true;setAdVisible(false);}

  const engine = window.CONJ[lang];
  const pendingRef = useRef(null);

  function addHistory(lg, vb) {setHistory((h) => {const nx = [{ lang: lg, verb: vb }, ...h.filter((x) => !(x.lang === lg && x.verb === vb))].slice(0, 24);persist("kunju-history", nx);return nx;});}

  function switchLang(newLang) {
    if (newLang === lang) return;
    const cur = result && !result.error ? result.infinitive.replace(/^to /, "") : verb.trim().toLowerCase();
    const target = cur ? conceptTranslate(cur, lang, newLang) : null;
    if (target) {pendingRef.current = target;setLang(newLang);return;}
    if (cur && window.__hasAI()) {
      pendingRef.current = null;
      setTranslating(true);
      const fromName = window.CONJ[lang].name,toName = window.CONJ[newLang].name;
      setLang(newLang);
      window.aiComplete(`Translate the verb "${cur}" from ${fromName} to its ${toName} infinitive. Reply with ONLY the single infinitive word in ${toName}, lowercase, no article, no extra text.`).
      then((txt) => {
        const w = String(txt || "").trim().toLowerCase().split(/\s+/)[0].replace(/[^a-zà-ÿ'’-]/gi, "");
        if (w) {setVerb(w);const r = window.CONJ[newLang].conjugate(w);setResult(r);if (r && !r.error) addHistory(newLang, r.infinitive);}
        setTranslating(false);
      }).
      catch(() => setTranslating(false));
      return;
    }
    setLang(newLang);
  }

  useEffect(() => {
    persist("kunju-lang", lang);
    setAdVisible(false);
    setDeconj(null);setActiveInf(null);
    if (pendingRef.current) {
      const vb = pendingRef.current;pendingRef.current = null;
      setVerb(vb);
      const r = conjugateMaybeReflexive(lang, vb);
      setResult(r);
      if (r && !r.error) {setLastVerb(vb);addHistory(lang, r.infinitive);adSession.current.conjSince += 1;maybeShowAd();}
    } else {setResult(null);setVerb("");}
  }, [lang]);

  function finishConjugate(lg, v, r) {
    setResult(r);
    if (r && !r.error) {
      setLastVerb(v);addHistory(lg, r.infinitive);
      adSession.current.conjSince += 1;
      setAdVisible(false);
      maybeShowAd();
      onActivity();
    }
  }

  function onConjugate(v) {
    const raw = (v || "").trim();
    if (!raw) {setResult(null);setDeconj(null);setActiveInf(null);return;}

    // 0) Reflexive infinitive (lavarse / se laver / sich freuen / zich …) → conjugate directly.
    const Rfx = REFLEX[lang];
    if (Rfx && Rfx.detect(raw.toLowerCase())) {
      setDeconj(null);setActiveInf(null);
      finishConjugate(lang, raw, conjugateMaybeReflexive(lang, raw));
      return;
    }

    // 1) Already a known infinitive → conjugate it directly.
    if (isKnownInfinitive(lang, raw)) {
      setDeconj(null);setActiveInf(null);
      finishConjugate(lang, raw, conjugateMaybeReflexive(lang, raw));
      return;
    }
    // 2) Looks inflected → reverse-lookup the infinitive, person & tense.
    const dq = deconjugate(lang, raw);
    if (dq) {
      const target = dq.infinitives[0];
      setDeconj(dq);setActiveInf(target.base);
      setVerb(target.base); // auto-switch the field to the infinitive
      finishConjugate(lang, target.base, conjugateMaybeReflexive(lang, target.base));
      return;
    }
    // 3) Nothing recognised → fall back (shows the engine's guidance/error).
    setDeconj(null);setActiveInf(null);
    finishConjugate(lang, raw, conjugateMaybeReflexive(lang, raw));
  }

  function viewInfinitive(base) {
    setActiveInf(base);
    setVerb(base);
    const r = conjugateMaybeReflexive(lang, base);
    setResult(r);
    if (r && !r.error) addHistory(lang, r.infinitive);
  }
  function pickVerb(lg, vb) {
    setTab("conjugate");
    if (lg !== lang) {pendingRef.current = vb;setLang(lg);} else
    {setVerb(vb);onConjugate(vb);}
  }
  function toggleFav(lg, vb) {
    const exists = favs.some((x) => x.lang === lg && x.verb === vb);
    const nx = exists ? favs.filter((x) => !(x.lang === lg && x.verb === vb)) : [{ lang: lg, verb: vb }, ...favs];
    persist("kunju-favs", nx);
    setFavs(nx);
    if (supaUser && window.__supa) {
      if (exists) window.__supa.from("favorites").delete().match({ user_id: supaUser.id, lang: lg, verb: vb });
      else window.__supa.from("favorites").insert({ user_id: supaUser.id, lang: lg, verb: vb });
    }
  }
  function clearHistory() {setHistory((h) => {const nx = h.filter((x) => x.lang !== lang);persist("kunju-history", nx);return nx;});}

  useEffect(() => {
    const root = document.getElementById("approot");
    let th = t.theme;
    if (th === "auto") th = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.dataset.theme = th;root.dataset.accent = t.accent;root.dataset.font = t.font;root.dataset.density = t.density;
    root.style.setProperty("--radius", t.radius + "px");
    root.style.setProperty("--lang-color", LANG_META[lang].color);
  }, [t, sysDark, lang]);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = (e) => setSysDark(e.matches);
    mq.addEventListener ? mq.addEventListener("change", h) : mq.addListener(h);
    return () => {mq.removeEventListener ? mq.removeEventListener("change", h) : mq.removeListener(h);};
  }, []);

  return (
    <div className="device">
    <div className="phone">
      <header className="appbar">
        <div className="brand" style={{minWidth:0,flex:1}}>
          <span className="brand-mark">{RAINBOW.slice(0, 5).map((c, i) => <i key={i} style={{ background: c }}></i>)}</span>
          <div className="brand-text">
            <span className="brand-name" style={{ color: "rgb(231, 21, 131)" }}>Conju<b>Expert</b></span>
            {supaUser ? (
              <UserMenu user={supaUser} name={name} isPremium={isPremium} premiumUntil={premiumUntil} greet={tr("hi", { name: name || supaUser.email.split("@")[0] })} onDeleted={(info) => { setDeletedWasPremium(isPremium ? { until: info?.premiumUntil || null } : null); persist("kunju-premium", false); persist("kunju-premium-until", null); setIsPremium(false); setPremiumUntil(null); setShowDeletedMsg(true); }} onEditName={() => setShowOnboard(true)} />
            ) : name ? (
              <GuestMenu name={name} greet={tr("hi", { name })} onLogin={() => setShowLogin(true)} onEditName={() => setShowOnboard(true)} />
            ) : (
              <span className="brand-tag">{tr("tagline")}</span>
            )}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"3px",flexShrink:0}}>
          <span style={{fontSize:"9px",fontWeight:800,letterSpacing:"0.07em",textTransform:"uppercase",color:LANG_META[lang].color,lineHeight:1}}>🎯 {({de:"Ziele",en:"Goals",es:"Metas",nl:"Doelen",fr:"Objectifs"})[UILANG] || "Goals"}</span>
          <button className="streakpill" onClick={() => {closeSkHint();if (goalSet) {setShowStreak(true);} else {setGoalStep("choose");setShowGoal(true);}}} title={tr("sk_title")}>
            <span className="sbars" data-done={daily.count >= daily.goal ? "1" : "0"}>
              {[0, 1, 2, 3, 4].map((i) => {
                const filled = Math.round(Math.min(daily.count / daily.goal, 1) * 5);
                const on = i < filled;
                const cols = ["#ff3b5c", "#ff8a18", "#ffc400", "#1fbf6b", "#0a84ff"];
                return <i key={i} className={on ? "on" : ""} style={on ? { background: cols[i], color: cols[i] } : undefined}></i>;
              })}
            </span>
            <span className="streakflame">🔥</span>
            <b className={"streaknum" + (daily.streak > 0 ? "" : " zero")}>{daily.streak}</b>
          </button>
        </div>
      </header>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} fromPayment={pendingPayment} />}
      {showDeletedMsg && <AccountDeletedModal onClose={() => setShowDeletedMsg(false)} wasPremium={deletedWasPremium} />}

      {showInstall && <InstallBanner onInstall={handleInstall} onDismiss={dismissInstall} />}
      {showIOSInstall && !showInstall && <IOSInstallBanner onDismiss={dismissIOSInstall} />}
      {(!isPremium || !supaUser) && <BonusBar onOpen={() => openPlanSelect()} trialExpiry={trialExpiry} bonusActive={bonusActive} name={name} />}

      <LanguageBar lang={lang} setLang={switchLang} />
      <Tabs tab={tab} setTab={handleTabSwitch} />
      {offline && <div className="offlinebar">{tr("offline_note")}</div>}

      <main className="content">
        {tab === "conjugate" &&
        <ConjugateView engine={engine} lang={lang} verb={verb} setVerb={setVerb} result={result} onConjugate={onConjugate}
        t={t} favs={favs} toggleFav={toggleFav} history={history} clearHistory={clearHistory} pickVerb={pickVerb}
        adVisible={adVisible} onAdClick={onAdClick} onAdDismiss={onAdDismiss} name={name} translating={translating}
        deconj={deconj} activeInf={activeInf} onViewInf={viewInfinitive} onTab={handleTabSwitch} />
        }
        <div style={{display: tab === "quiz" ? "contents" : "none"}}>
          <QuizView lang={lang} favs={favs} toggleFav={toggleFav} sound={t.sound} skill={skill} onStudy={pickVerb} onActivity={onActivity} isActive={tab === "quiz"} onTab={handleTabSwitch} />
        </div>
        {tab === "grammar" && <LearnView lang={lang} engine={engine} sound={t.sound} native={native} setNative={setNat} onStudy={pickVerb} />}
        {tab === "saved" && <SavedTab lang={lang} favs={favs} toggleFav={toggleFav} pickVerb={pickVerb} onActivity={onActivity} />}
      </main>

      <AppTweaks t={t} setTweak={setTweak} name={name} commitName={commitName} />

      {showPaySuccess && <PaymentSuccess name={name} onClose={() => setShowPaySuccess(false)} />}
      {showReviewPrompt && <ReviewPrompt name={name}
        onRate={() => { persist("kunju-review-done", true); setShowReviewPrompt(false); rateApp(); }}
        onFeedback={() => { persist("kunju-review-done", true); setShowReviewPrompt(false); try { window.location.href = "mailto:hello@conjuexpert.app?subject=" + encodeURIComponent("Wunsch / Feedback zu ConjuExpert"); } catch (e) {} }}
        onClose={() => { setShowReviewPrompt(false); persist("kunju-active-secs", 600); }} />}
      {showOnboard &&
      <NameGate initial={name} editing={!!name} native={native} setNative={setNat} skill={skill} setSkill={setSkl}
      onSubmit={commitName} onClose={() => setShowOnboard(false)} />
      }
      {!showOnboard && showTour && <TourGate onDone={finishTour} />}

      {featureHint && !showOnboard && !showTour && !showPaywall &&
        <FeatureHint kind={featureHint} onClose={closeFeatureHint} />}

      {showOffer && !showOnboard &&
        <WelcomeOffer
          onSecure={() => { persist("kunju-offer-seen", Date.now()); setShowOffer(false); setShowPlanSelect(true); }}
          onTrial={startTrial}
        />
      }
      {showPaywall &&
        <PaywallSheet
          onUpgrade={() => { setShowPaywall(false); openPlanSelect(); }}
          onClose={() => setShowPaywall(false)}
        />
      }
      {showPlanSelect &&
        <PlanSelect
          plan={selPlan} setPlan={setSelPlan}
          onNext={() => { goToStripe(); }}
          onClose={() => setShowPlanSelect(false)}
          onLogin={() => { setShowPlanSelect(false); setShowLogin(true); }}
          onCouponLogin={() => { setPendingCoupon(true); setShowPlanSelect(false); setShowLogin(true); }}
          supaUser={supaUser}
          onPremium={() => { persist("kunju-premium", true); setIsPremium(true); }}
          openCoupon={pendingCoupon}
        />
      }

      {showGoalSuccess &&
        <GoalSuccess
          name={name} goal={goal}
          onClose={() => setShowGoalSuccess(false)}
          onQuiz={() => { setShowGoalSuccess(false); handleTabSwitch("quiz"); }}
        />
      }

      {showGoalCelebration &&
        <GoalCelebration
          name={name} daily={daily} goal={goal}
          onClose={() => setShowGoalCelebration(false)}
          onNewGoal={() => { setShowGoalCelebration(false); setGoalStep("choose"); setShowGoal(true); }}
        />
      }

      {showStreak &&
        <Zieltafel name={name} lang={lang} daily={daily} goal={goal} onClose={() => setShowStreak(false)} onAdjustGoal={() => {setShowStreak(false);setGoalStep("choose");setShowGoal(true);}} onQuiz={() => {setShowStreak(false);handleTabSwitch("quiz");}} />
      }
      {showGoal &&
        <GoalFlow
          step={goalStep} setStep={setGoalStep} name={name} lang={lang}
          onClose={() => setShowGoal(false)}
          onCreate={(data) => {
            persist("kunju-goal", true);
            const saved = data ? { ...data, startDate: new Date().toDateString() } : null;
            if (saved) persist("kunju-goal-data", saved);
            setGoalSet(true);
            setGoal(saved);
            setDaily(readDaily());
            setShowGoal(false);
            setShowGoalSuccess(true);
          }}
        />
      }
    </div>
    {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)} />}
    </div>);

}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        minHeight:"100dvh", padding:"32px 22px", textAlign:"center",
        fontFamily:"system-ui,sans-serif", color:"#14151a", background:"#f3f4f8"
      }}>
        <div style={{fontSize:"40px", marginBottom:"16px"}}>⚠️</div>
        <h2 style={{margin:"0 0 10px", fontSize:"20px"}}>Oops — die App ist abgestürzt</h2>
        <p style={{margin:"0 0 24px", color:"#707888", fontSize:"15px", maxWidth:"340px"}}>
          Ein unerwarteter Fehler ist aufgetreten. Deine gespeicherten Daten bleiben erhalten.
        </p>
        <button
          onClick={() => { this.setState({ error: null }); }}
          style={{
            background:"#0a84ff", color:"#fff", border:"none", borderRadius:"14px",
            padding:"12px 28px", fontSize:"15px", fontWeight:600, cursor:"pointer"
          }}
        >
          App neu starten
        </button>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary><App /></ErrorBoundary>
);

