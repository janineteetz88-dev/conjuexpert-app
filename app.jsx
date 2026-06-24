/* ============================================================================
   NICHT LIVE — diese Datei wird NICHT ausgeliefert.
   Die veröffentlichte App (conjuexpert.app) ist das gebündelte /index.html im
   Repo-Wurzelverzeichnis, das seinen Code selbst enthält und KEIN app.jsx lädt.
   Diese Datei ist ein älterer/separater Stand und enthält z. B. nicht die
   männlich/weiblich-Stimmenauswahl. Änderungen hier wirken sich NICHT auf die
   Webseite aus.
   ============================================================================ */
/* Kunju Expert — main app (v2: 5 languages, audio, translation, filters, favorites, mixed quiz, highlight) */
const { useState, useEffect, useRef, useMemo } = React;

const LANG_ORDER = ["de", "es", "en", "nl", "fr"];
const LANG_META = {
  de: { code: "DE", color: "#ff3b5c" },
  es: { code: "ES", color: "#ff9f0a" },
  en: { code: "EN", color: "#0a84ff" },
  nl: { code: "NL", color: "#30c95a" },
  fr: { code: "FR", color: "#1b1813" }
};
const RAINBOW = ["#ff3b5c", "#ff7a18", "#ffc400", "#34c759", "#00bcd4", "#0a84ff", "#a557ff", "#ff5ea8"];

/* Short formation hints for regular verbs, per language + tense id (memory aid). */
const TENSE_HINTS = {
  es: { present: "-o · -as/-es", imperfect: "-aba / -ía", past: "-é·-aste·-ó", perfect: "he + -ado/-ido", pluperfect: "había + -ado/-ido", future: "Inf. + -é", subjunctive: "-e / -a", subjunctiveImp: "-ara / -iera", conditional: "Inf. + -ía", imperative: "¡-a! / ¡-e!", continuous: "estoy + -ando/-iendo", continuousPerfect: "he estado + -ndo", gerund: "-ando / -iendo", participle: "-ado / -ido" },
  en: { present: "base (+ -s)", presentCont: "am/is/are + -ing", past: "-ed", pastCont: "was/were + -ing", perfect: "have + -ed", perfectCont: "have been + -ing", pluperfect: "had + -ed", future: "will + base", subjunctive: "base form", conditional: "would + base", imperative: "base!", gerund: "-ing" },
  de: { present: "-e · -st · -t", past: "-te", perfect: "haben/sein + ge-…-t", pluperfect: "hatte/war + ge-…-t", future: "werden + Inf.", subjunctive: "würde + Inf.", subjunctive1: "-e · -est · -e", conditional: "würde + Inf.", imperative: "Stamm!", gerund: "-end" },
  fr: { present: "-e·-es·-e / -is", past: "-ais", perfect: "avoir/être + -é", pluperfect: "avais + -é", future: "Inf. + -ai", subjunctive: "-e", conditional: "Inf. + -ais", conditionalPast: "aurais + -é", imperative: "-e !", gerund: "-ant" },
  nl: { present: "- / -t", past: "-te / -de", perfect: "hebben/zijn + ge-…", pluperfect: "had + ge-…", future: "zullen + Inf.", subjunctive: "-e", conditional: "zou + Inf.", imperative: "stam!", gerund: "-end" }
};
function tenseHint(lang, id) {return (TENSE_HINTS[lang] || {})[id] || "";}
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
  return null;
}
function TenseDropdown({ lang, tenses, isOn, onToggle, onAll, onNone, single, onClose }) {
  const [open, setOpen] = useState(false);
  const onCount = tenses.filter((t) => isOn(t.id)).length;
  const cur = single ? (tenses.find((t) => isOn(t.id)) || {}).label : null;
  const summary = single ? cur || "—" : onCount === tenses.length || onCount === 0 ? tr("all_tenses") : onCount + " / " + tenses.length;
  return (
    <div className="tdwrap" style={{ "--lc": LANG_META[lang].color }}>
      <button className={"tdbtn" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)}>
        <span className="tdbtn-lbl">{tr("tense_word")}</span>
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

function pickVoice(lang) {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;
  const lc = (lang || "").toLowerCase(), base = lc.split("-")[0];
  // 1) exact lang match, prefer local/default; 2) base-language match; 3) none
  const exact = voices.filter((v) => (v.lang || "").toLowerCase() === lc);
  const baseM = voices.filter((v) => (v.lang || "").toLowerCase().split("-")[0] === base);
  const rank = (v) => (v.localService ? 2 : 0) + (v.default ? 1 : 0);
  const pool = exact.length ? exact : baseM;
  if (!pool.length) return null;
  return pool.sort((a, b) => rank(b) - rank(a))[0];
}
function speak(text, lang) {
  if (!window.speechSynthesis || !text || text === "—") return;
  try {
    const clean = String(text).replace(/…/g, " ").replace(/\s+/g, " ").trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = lang;u.rate = 0.92;
    const v = pickVoice(lang);
    if (v) {u.voice = v;u.lang = v.lang;}
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) {}
}
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
  fr: { name: "ParlezPlus", letter: "P", color: "#1b1813", tag: "Your interactive French grammar coach", link: "https://example.com/fr" }
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
function readDaily() {
  const today = new Date().toDateString();
  const y = new Date(Date.now() - 86400000).toDateString();
  const d = recall("kunju-daily", { date: "", count: 0 });
  const st = recall("kunju-streak", { last: "", streak: 0, best: 0 });
  const count = d.date === today ? d.count : 0;
  let streak = st.streak || 0;
  if (st.last !== today && st.last !== y) streak = 0;
  return { count, goal: DAILY_GOAL, streak, best: st.best || 0 };
}
function bumpDaily() {
  const today = new Date().toDateString();
  const y = new Date(Date.now() - 86400000).toDateString();
  let d = recall("kunju-daily", { date: "", count: 0 });
  if (d.date !== today) d = { date: today, count: 0 };
  d.count += 1;persist("kunju-daily", d);
  let st = recall("kunju-streak", { last: "", streak: 0, best: 0 });
  if (d.count >= DAILY_GOAL && st.last !== today) {
    st.streak = st.last === y ? (st.streak || 0) + 1 : 1;
    st.last = today;st.best = Math.max(st.best || 0, st.streak);
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
  const sec = result.tenses.map((t) => {
    const rows = t.forms.map((f, i) => `<tr><td class="p">${esc(result.pronouns[i])}</td><td class="f">${esc(f)}</td></tr>`).join("");
    return `<div class="tense"><h3>${esc(t.label)}</h3><table>${rows}</table></div>`;
  }).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(result.infinitive)} — ConjuExpert</title>
<style>*{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#14151a;margin:0;padding:40px}
.bar{height:8px;background:linear-gradient(90deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff);border-radius:4px;margin-bottom:22px}
h1{font-size:34px;margin:0 0 4px}.sub{color:#707888;margin:0 0 22px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 26px}
.tense{break-inside:avoid;margin-bottom:8px}h3{font-size:15px;margin:0 0 4px;border-bottom:2px solid #eee;padding-bottom:3px}
table{width:100%;border-collapse:collapse}td{padding:3px 0;font-size:14px}.p{color:#9098a8;width:42%}.f{font-family:ui-monospace,monospace;font-weight:600}
.foot{margin-top:26px;background:#101018;border-radius:12px;padding:18px 20px;color:#dfe2ee}
.foot .ttl{font-weight:700;font-size:20px;margin:0 0 10px}.foot .ttl b{color:#a557ff}
.foot .row{font-size:13.5px;margin:3px 0}.foot .row span{display:inline-block;width:30px;color:#6b7390;font-weight:700;font-size:11px}
.foot .dl{margin-top:12px;color:#ffd24a;font-weight:600;font-size:14px}</style></head>
<body><div class="bar"></div><h1>${esc(result.infinitive)}</h1>
<p class="sub">${esc(eng.name)} · ${result.isIrregular ? "irregular" : "regular"}${meaning ? " · " + esc(meaning) : ""}</p>
<div class="grid">${sec}</div>
<div class="foot"><p class="ttl">Conju<b>Expert</b> — free verb conjugator</p>
${PROMO.map((p) => `<p class="row"><span>${p[0]}</span>${esc(p[1])}</p>`).join("")}
<p class="dl">📱 Download free — iOS App Store · Google Play</p></div>
<script>onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();w.document.write(html);w.document.close();
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
    alert("Copied to clipboard — paste it into WhatsApp etc.");
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
    const key = `kunju-tex-${langCode}-${verb}-${tense.id}-${native}`;
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
    const prompt = `Write ONE short, natural everyday sentence in ${engineName} (max 9 words) ${formInstr}${freshTxt}${sepNote} The sentence MUST be fully grammatical and idiomatic: use the verb with its correct case government, prepositions and subject (e.g. dative verbs like "gefallen"/"helfen" take a dative object; in German say "auf der Party", not "in der Party"). The sentence MUST end with proper punctuation (. ! or ?).${checkNote} ${sameLang ? `For "n", repeat the same sentence WITHOUT the asterisks.` : `For "n", give a natural ${native} translation of the whole sentence.`} Do NOT use any double-quote (") character inside either sentence. Reply with ONLY minified JSON and nothing else, exactly: {"s":"...","n":"..."}`;
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
function ConjugateView({ engine, lang, verb, setVerb, result, onConjugate, t, favs, toggleFav, history, clearHistory, pickVerb, adVisible, onAdClick, onAdDismiss, name, translating, deconj, activeInf, onViewInf }) {
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
            <TenseDropdown lang={lang} tenses={result.tenses} isOn={(id) => !hidden[id]} onToggle={(id) => setHidden((h) => ({ ...h, [id]: !h[id] }))} onAll={() => setHidden({})} onNone={() => {const h = {};result.tenses.forEach((t2) => {h[t2.id] = true;});setHidden(h);}} />
          </div>

          {GROUP_ORDER.map((g) => {
          const inGroup = result.tenses.map((t2, i) => ({ t2, i })).filter((x) => tenseGroup(x.t2.id) === g && !hidden[x.t2.id]);
          if (!inGroup.length) return null;
          return (
            <React.Fragment key={g}>
                {g !== "ind" && <div className="tgrouphead">{tr("gr_" + g)}</div>}
                {inGroup.map(({ t2, i }) =>
              <TenseCard key={t2.id} tense={t2} pronouns={result.pronouns} color={RAINBOW[i % RAINBOW.length]}
              openDefault={true} ttsLang={engine.ttsLang} highlight={t.highlight && result.isIrregular} sound={t.sound}
              verb={result.infinitive} langCode={lang} engineName={engine.name} hl={hlCells && hlCells[t2.id]} />
              )}
              </React.Fragment>);

        })}

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
      <div className="emptystate">
          <div className="emptystate-rings">
            {RAINBOW.slice(0, 6).map((c, i) => <span key={i} style={{ background: c, animationDelay: i * 0.12 + "s" }}></span>)}
          </div>
          <p className="emptystate-title">{name ? tr("ready", { name }) : tr("empty_title")}</p>
          <p className="emptystate-sub">{tr("empty_sub", { n: LANG_ORDER.length })}</p>
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
function themeLabel(id) { const m = THEME_LABELS[UILANG] || THEME_LABELS.en; return m[id] || id; }

/* Verb-group filters for the quiz (per language). */
const VERB_GROUPS = {
  es: [{ id: "all" }, { id: "irregular" }, { id: "ar", suf: "ar" }, { id: "er", suf: "er" }, { id: "ir", suf: "ir" }],
  fr: [{ id: "all" }, { id: "irregular" }, { id: "er", suf: "er" }, { id: "ir", suf: "ir" }, { id: "re", suf: "re" }],
  de: [{ id: "all" }, { id: "irregular" }, { id: "regular" }],
  nl: [{ id: "all" }, { id: "irregular" }, { id: "regular" }],
  en: [{ id: "all" }, { id: "irregular" }, { id: "regular" }]
};
const GROUP_LABELS = {
  de: { all: "Alle", irregular: "Unregelmäßig", regular: "Regelmäßig" },
  en: { all: "All", irregular: "Irregular", regular: "Regular" },
  es: { all: "Todos", irregular: "Irregulares", regular: "Regulares" },
  nl: { all: "Alle", irregular: "Onregelmatig", regular: "Regelmatig" },
  fr: { all: "Tous", irregular: "Irréguliers", regular: "Réguliers" }
};
function groupLabel(g) {
  if (g.suf) return "-" + g.suf;
  const m = GROUP_LABELS[UILANG] || GROUP_LABELS.en;
  return m[g.id] || g.id;
}
const SENT_TOPICS = ["food and drink", "travel", "family and friends", "work or study", "the weather", "hobbies", "shopping", "animals and pets", "sports", "music or films", "a daily routine", "weekend plans", "health", "technology", "the city", "nature", "holidays", "cooking", "the morning", "a phone call"];
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
function WordSentence({ text, fromName, toName, cachePrefix, big, accent, saveLang, saveDir }) {
  const [openW, setOpenW] = useState(null);
  const [trans, setTrans] = useState({});
  const [saved, setSaved] = useState({});
  const parts = (text || "").split(/(\s+)/);
  function clean(w) {return w.replace(/[^\p{L}\p{N}'’\-]/gu, "").toLowerCase();}
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
  return (
    <div className="wsentwrap">
      <div className={"wsent" + (big ? " big" : "") + (accent ? " accent" : "")}>
        {parts.map((w, i) => /^\s+$/.test(w) || !clean(w) ? <span key={i}>{w}</span> :
        <span key={i} className={"wword" + (openW && openW.i === i ? " open" : "")} onClick={() => tap(w, i)}>{w}</span>
        )}
      </div>
      {openW && <div className="wtrans"><b>{openW.w}</b> → <span>{trans[openW.w] || "…"}</span>
        {saveLang && (
        saved[openW.w] === "saving" ?
        <span className="wsave saved">…</span> :
        saved[openW.w] ?
        <span className="wsave saved">✓ {tr("vocab_saved")}</span> :
        <button className="wsave" onClick={saveWord}>+ {tr("vocab_save")}</button>)}
      </div>}
    </div>);

}

function QuizView({ lang, favs, toggleFav, sound, skill, onStudy, onActivity }) {
  const eng = window.CONJ[lang];
  const tenseOpts = useMemo(() => {const r = eng.conjugate(eng.samples[0]);return r && r.tenses ? r.tenses.map((t) => ({ id: t.id, label: t.label })) : [];}, [lang]);
  const pool = useMemo(() => {const base = quizPool(lang, skill || "beginner");favs.forEach((f) => {if (f.lang === lang && base.indexOf(f.verb) < 0) base.push(f.verb);});return base;}, [lang, favs, skill]);

  const [mode, setMode] = useState(() => {const m = recall("kunju-mode", "cards");return m === "speed" ? "cards" : m;});
  const allTenseIds = useMemo(() => tenseOpts.map((t) => t.id), [tenseOpts]);
  const [tenseSel, setTenseSel] = useState([]);
  const [mistMode, setMistMode] = useState(false);
  const allTensesOn = tenseSel.length > 0 && tenseSel.length === allTenseIds.length;
  const [selGroup, setSelGroup] = useState("all");
  const groups = VERB_GROUPS[lang] || [{ id: "all" }];
  const filteredPool = useMemo(() => {
    if (selGroup === "all") return pool;
    const irr = new Set(window.CONJ[lang].irregulars || []);
    if (selGroup === "irregular") {const f = pool.filter((v) => irr.has(v));return f.length ? f : pool;}
    if (selGroup === "regular") {const f = pool.filter((v) => !irr.has(v));return f.length ? f : pool;}
    const g = groups.find((x) => x.id === selGroup);
    if (g && g.suf) {const f = pool.filter((v) => v.endsWith(g.suf));return f.length ? f : pool;}
    return pool;
  }, [pool, selGroup, lang]);
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
  const [spkTopic, setSpkTopic] = useState("random");
  const [sent, setSent] = useState(null);
  const [spkTarget, setSpkTarget] = useState(lang);
  const [score, setScore] = useState({ right: 0, total: 0, streak: 0 });
  const inRef = useRef(null);
  const recentRef = useRef([]);
  const recentSentRef = useRef({});
  const recRef = useRef(null);
  const transcriptRef = useRef("");

  // speed mode
  const [speedState, setSpeedState] = useState("idle"); // idle | running | done
  const [timeLeft, setTimeLeft] = useState(60);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedTotal, setSpeedTotal] = useState(0);
  const speedBestKey = `kunju-speedbest-${lang}`;
  const [speedBest, setSpeedBest] = useState(() => recall(speedBestKey, 0));

  useEffect(() => {
    const saved = recall(`kunju-tenses-${lang}`, null);
    const ids = eng.conjugate(eng.samples[0]);
    const all = ids && ids.tenses ? ids.tenses.map((t) => t.id) : [];
    const valid = Array.isArray(saved) ? saved.filter((id) => all.indexOf(id) >= 0) : [];
    setTenseSel(valid.length ? valid : all);
    setMistMode(false);setSelGroup("all");setSpkTarget(lang);recentRef.current = [];setSpeedBest(recall(`kunju-speedbest-${lang}`, 0));
  }, [lang]);
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
  useEffect(() => {if ((mode === "choice" || mode === "type" || mode === "speed" || mode === "speak") && q) fetchTransl(q.verb);if ((mode === "choice" || mode === "cards" || (mode === "type" && typeMode === "form") || (mode === "speak" && spkMode === "form")) && q) fetchCloze(q);else setCloze(null); /* eslint-disable-next-line */}, [q, mode, spkMode, typeMode]);
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
  function pickClozeTopic(id) {setSpkTopic(id);if (q) fetchCloze(q, 0, id);}
  const clozeTokenRef = useRef(0);
  function fetchCloze(qq, attempt, topicOverride) {
    attempt = attempt || 0;
    const curTopic = topicOverride || spkTopic;
    if (!qq || !qq.answer || qq.answer === "—") {setCloze(null);return;}
    const myTok = attempt === 0 ? ++clozeTokenRef.current : clozeTokenRef.current;
    const targetName = window.CONJ[lang].name;
    const nativeName = recall("kunju-native", "German");
    const lvl = skill === "advanced" ? "C1-level" : skill === "intermediate" ? "B1-level" : "very simple A1–A2";
    const advConn = skill === "advanced" ? ` Make it a more complex sentence that naturally uses a subordinating connector (e.g. German: obwohl/trotzdem/damit/während/sodass; Spanish: aunque/a pesar de que/para que; French: bien que/quoique/afin que/pourtant; Dutch: hoewel/zodat/terwijl), like "Trotz der Umstände hielten sie durch."` : "";
    const theme = SPK_THEMES.find((t) => t.id === curTopic);
    const topicTxt = theme && theme.topic ? ` The sentence should relate to: ${theme.topic}.` : "";
    const key = `kunju-cloze5-${lang}-${qq.verb}-${qq.tenseLabel}-${qq.pronoun}-${skill}-${nativeName}-${curTopic}`;
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
      // build a gap: for split compound verbs, blank each part; otherwise blank the whole form
      const mkRe = (w) => {const e = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");try {return new RegExp("(?<![\\p{L}])" + e + "(?![\\p{L}])", "iu");} catch (x) {return new RegExp("\\b" + e + "\\b", "i");}};
      const wordList = (splitLang && isCompound) ? qq.answer.split(/\s+/) : [qq.answer];
      let gap = s, hit = false;
      wordList.forEach((w) => {const r = mkRe(w);if (r.test(gap)) {gap = gap.replace(r, "…");hit = true;}});
      if (!s || !hit) {
        if (attempt < 1) {fetchCloze(qq, attempt + 1, curTopic);return;}
        if (!s) {setCloze(null);return;}
      }
      const out = { full: s, gap: hit ? gap : s, native: j && j.n ? String(j.n).trim() : "" };
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
    const tid = topicOverride || spkTopic;
    const theme = SPK_THEMES.find((t) => t.id === tid);
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

  const pct = score.total ? Math.round(score.right / score.total * 100) : 0;
  const mistakes = (mver, getMistakes(lang));
  const MODES = [{ id: "cards", label: tr("m_cards"), icon: "🃏" }, { id: "choice", label: tr("m_choice"), icon: "◉" }, { id: "type", label: tr("m_type"), icon: "⌨" }, { id: "speak", label: tr("m_speak"), icon: "🎤" }];

  function TenseBar() {
    if (mistMode) return null;
    return (
      <div className="quiztenses">
        {true &&
        <React.Fragment>
            <div className="qfilter-block">
              <div className="recent-title qfilter-lbl">{tr("which_tense")}</div>
              <TenseDropdown lang={lang} tenses={tenseOpts} isOn={(id) => tenseSel.indexOf(id) >= 0} onToggle={toggleTense} onAll={() => setAllTenses(true)} onNone={() => setAllTenses(false)} />
              {!tenseSel.length && <div className="qfilter-hint">{tr("none_all")}</div>}
            </div>
            {groups.length > 1 &&
          <div className="qfilter-block">
                <div className="recent-title qfilter-lbl">{tr("which_verbs")}</div>
                <div className="tfilter">
                  {groups.map((g, i) =>
              <button key={g.id} className={"tfilterchip" + (selGroup === g.id ? " on" : "")} style={{ "--cc": RAINBOW[(i + 2) % RAINBOW.length] }} onClick={() => setSelGroup(g.id)}>
                      <span className="dotmini"></span>{groupLabel(g)}
                    </button>
              )}
                </div>
              </div>
          }
            <div className="qfilter-block">
              <div className="recent-title qfilter-lbl">{tr("which_theme")}</div>
              <ClozeThemes />
              </div>
          </React.Fragment>
        }
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
        {SPK_THEMES.map((th, i) =>
        <button key={th.id} className={"tfilterchip" + (spkTopic === th.id ? " on" : "")} style={{ "--cc": RAINBOW[i % RAINBOW.length] }} onClick={() => pickClozeTopic(th.id)}>
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

          <TenseBar />

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
            <div className="qm-top">
              <span className="flashtense">{q.tenseLabel}{skill !== "advanced" && tenseHint(lang, q.tenseId) ? <span className="flashhint-inline">{tenseHint(lang, q.tenseId)}</span> : null}</span>
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
            <div className="tfilter spkthemes scrollthemes">
              {SPK_THEMES.map((th, i) =>
            <button key={th.id} className={"tfilterchip" + (spkTopic === th.id ? " on" : "")} style={{ "--cc": RAINBOW[i % RAINBOW.length] }} onClick={() => {setSpkTopic(th.id);setVal("");setState("idle");setRevealed(false);genSentence(lang, 0, th.id);}}>
                  <span className="dotmini"></span>{themeLabel(th.id)}
                </button>
            )}
            </div>
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

      {/* ---- CHOICE ---- */}
      {mode === "choice" && q &&
      <React.Fragment>
          <ScoreLine />
          <div className={"quizcard quizmodern " + state} style={{ "--lc": LANG_META[lang].color }}>
            <div className="cards-cue cards-cue-top">💬 {tr("cards_hint")}</div>
            <div className="qm-top">
              <span className="flashtense">{q.tenseLabel}{skill !== "advanced" && tenseHint(lang, q.tenseId) ? <span className="flashhint-inline">{tenseHint(lang, q.tenseId)}</span> : null}</span>
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
                  <span className="flashtense">{q.tenseLabel}{skill !== "advanced" && tenseHint(lang, q.tenseId) ? <span className="flashhint-inline">{tenseHint(lang, q.tenseId)}</span> : null}</span>
                  {q.isIrregular && <span className="flashtag">{tr("irregular")}</span>}
                  <button className={"starbtn qm-star" + (favs.some((x) => x.lang === lang && x.verb === q.verb) ? " on" : "")} title="Save verb" onClick={(e) => {e.stopPropagation();toggleFav(lang, q.verb);}}>{favs.some((x) => x.lang === lang && x.verb === q.verb) ? "★" : "☆"}</button>
                </div>
                <div className="flashbody">
                  <button className="flashverb flashverb-link" title={tr("view_conj")} onClick={(e) => {e.stopPropagation();onStudy && onStudy(lang, q.verb);}}>{q.verb.replace(/^to /, "")} <span className="qm-study-ic">↗</span></button>
                  <span className="flashpron">{q.pronoun}</span>
                  {cloze && !cloze.loading &&
                <div className="flashcloze" onClick={(e) => e.stopPropagation()}>
                      <WordSentence text={cloze.gap} fromName={window.CONJ[lang].name} toName={recall("kunju-native", "German")} cachePrefix={`kunju-wtr-${lang}-nat`} big={true} accent={true} />
                    </div>
                }
                </div>
                <div className="flashfoot"><span className="flashflip">↻ {tr("flip")}</span></div>
              </React.Fragment> :
            <React.Fragment>
                <div className="flashtop">
                  <span className="flashctx">{q.verb.replace(/^to /, "")} · {q.pronoun}</span>
                  {sound && q.answer !== "—" && <button className="flashspeak" onClick={(e) => {e.stopPropagation();speak(q.answer, q.ttsLang);}}>🔊</button>}
                </div>
                <div className="flashbody">
                  <span className="flashanswer">{q.answer}</span>
                  {cloze && !cloze.loading &&
                <div className="flashcloze" onClick={(e) => e.stopPropagation()}>
                      <WordSentence text={cloze.full} fromName={window.CONJ[lang].name} toName={recall("kunju-native", "German")} cachePrefix={`kunju-wtr-${lang}-nat`} big={true} accent={true} saveLang={lang} saveDir="fromTarget" />
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
              {SPK_THEMES.map((th, i) =>
            <button key={th.id} className={"tfilterchip" + (spkTopic === th.id ? " on" : "")} style={{ "--cc": RAINBOW[i % RAINBOW.length] }} onClick={() => {setSpkTopic(th.id);genSentence(undefined, 0, th.id);}}>
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
                  <span className="flashtense">{q.tenseLabel}{skill !== "advanced" && tenseHint(lang, q.tenseId) ? <span className="flashhint-inline">{tenseHint(lang, q.tenseId)}</span> : null}</span>
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
      <MistakeBar />
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
  const pick = Math.min(2, (sampleForms || []).length - 1); // use a 3rd-person form
  const form = sampleForms && sampleForms[pick] ? sampleForms[pick] : null;
  const pron = pronouns && pronouns[pick] ? pronouns[pick] : "";
  const key = `kunju-auxex2-${lang}-${tenseId}-${sample}-${nativeName}`;
  const [ex, setEx] = useState(() => recall(key, null));
  const [busy, setBusy] = useState(false);
  function load(fresh) {
    if (!form || !window.__hasAI()) return;
    if (!fresh) {const c = recall(key, null);if (c != null) {setEx(c);return;}}
    const variety = fresh ? ` Give a DIFFERENT example than before (variety #${Math.floor(Math.random() * 1000)}).` : "";
    setBusy(true);
    window.aiComplete(`Write ONE short, natural ${targetName} sentence (max 10 words) that uses EXACTLY the verb form "${form}" (the ${tenseLabel} of "${sample}", ${pron}). Keep that exact form in the sentence.${variety} Then give its natural ${nativeName} translation. Do NOT use double-quote characters. Reply with ONLY minified JSON and nothing else: {"t":"<${targetName} sentence>","n":"<${nativeName} translation>"}`).
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

function LearnContent({ data, engine, sound, lang, selTense, selLabel, onStudy }) {
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

      {loading && <LearnSkeleton />}

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

      {!loading && <LearnContent data={data} engine={engine} sound={sound} lang={lang} selTense={selTense} selLabel={curLabel} onStudy={onStudy} />}
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
  const customCats = useMemo(() => {const s = new Set();items.forEach((it) => {if (it.cat && !isGeneralCat(it.cat) && templateCats().indexOf(it.cat) < 0) s.add(it.cat);});return [...s];}, [items]);
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
  function addCustomCat() {
    const name = (prompt(tr("vocab_new_cat_q")) || "").trim();
    if (name) {setCat(name);persist("kunju-vocab-cat", name);}
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
  const [lang2, setLang2] = useState(() => recall("kunju-col2", "en"));
  const [lang3, setLang3] = useState(() => recall("kunju-col3", "es"));
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
  function setL2(v) {setLang2(v);persist("kunju-col2", v);}
  function setL3(v) {setLang3(v);persist("kunju-col3", v);}
  function equiv(it, toLang) {
    const base = it.verb.replace(/^to /, "");
    if (toLang === it.lang) return base;
    return conceptTranslate(base, it.lang, toLang);
  }
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
          <div className="vth"><LangSelect value={lang2} onChange={setL2} /></div>
          <div className="vth"><LangSelect value={lang3} onChange={setL3} /></div>
        </div>
        {langFavs.map((it) => {
          const base = it.verb.replace(/^to /, "");
          const c2 = equiv(it, lang2),c3 = equiv(it, lang3);
          const rk = it.lang + "|" + it.verb;
          return (
            <div className="vtrow" key={rk}>
              <div className="vtcell vtfirst" style={{ "--lc": LANG_META[it.lang].color }}>
                <button className="vtx" title={tr("learned")} onClick={() => toggleFav(it.lang, it.verb)}>✕</button>
                <button className="vtverb" onClick={() => pickVerb(it.lang, it.verb)}>{base}</button>
                <span className="vtbadge">{LANG_META[it.lang].code}</span>
              </div>
              {[lang2, lang3].map((toL, ci) => <SavedCell key={ci} base={base} from={it.lang} to={toL} />)}
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
        <span className="brand-mark big">{RAINBOW.slice(0, 5).map((c, i) => <i key={i} style={{ background: c }}></i>)}</span>
        <p className="namebrand">Conju<b>Expert</b></p>
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
  { kind: "conjugate", icon: "▦", title: tr("tab_conjugate"), text: tr("tour_conj"), col: "#ff3b5c" },
  { kind: "quiz", icon: "◆", title: tr("tab_quiz"), text: tr("tour_quiz"), col: "#34c759" },
  { kind: "learn", icon: "✦", title: tr("tab_learn"), text: tr("tour_learn"), col: "#0a84ff" },
  { kind: "saved", icon: "★", title: tr("tab_saved"), text: tr("tour_saved"), col: "#ffb300" }];

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

/* ---------- Monetization ---------- */

// Prices computed (never hardcoded) — EU-Preisangabenverordnung compliant
const M_PRICE = 2.99;
const A_PRICE = 24.99;
const A_EQ    = +(M_PRICE * 12).toFixed(2);              // 35.88
const A_SAVE  = +(A_EQ - A_PRICE).toFixed(2);             // 10.89
const A_DISC  = Math.round(A_SAVE / A_EQ * 100);          // 30
function fEur(n) { return String(n.toFixed(2)).replace(".", ","); }

// Shared rainbow CTA
function RCTA({ label, onClick }) {
  return (
    <button className="rcta" onClick={onClick} aria-label={label}>
      <span>{label}</span>
    </button>
  );
}

// Shared app bar (used in full-screen screens 3 + 4)
function MonoBar({ onBack, backLabel }) {
  return (
    <div className="plansel-bar">
      <button className="plansel-back" onClick={onBack} aria-label={backLabel || "Zurück"}>‹</button>
      <div className="mono-appbar-brand">
        <div className="mono-appbar-brandmark">
          {[["#ff3b5c",20],["#ff7a18",16],["#ffc400",22],["#34c759",18],["#0a84ff",14]].map(([c,h],i) =>
            <i key={i} style={{background:c,height:h+"px"}}></i>)}
        </div>
        <span style={{fontSize:"16px",fontWeight:700,color:"#e71583"}}>Conju<b style={{background:"linear-gradient(90deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#0a84ff,#a557ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Expert</b></span>
      </div>
      <div style={{width:40}}/>
    </div>
  );
}

// Shared feature list
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

/* Screen 1 – Welcome offer modal */
function WelcomeOffer({ onSecure, onTrial }) {
  return (
    <div className="offer-bg" role="dialog" aria-modal="true" aria-label="Willkommensangebot">
      <div className="offer-modal">
        <button className="offer-close" onClick={onTrial} aria-label="Angebot schließen">×</button>
        <span className="deal-badge">🚀 WILLKOMMENSANGEBOT · −{A_DISC} %</span>
        <h2 className="offer-h1">Konjugieren, ohne<br/>nachzudenken</h2>
        <p className="offer-sub">Mit dem Quiz trainierst du aktiv, bis die Formen sitzen — und durch die „Merken"-Funktion übst du genau den Wortschatz, der dir wichtig ist.</p>
        <div className="offer-price">
          <span className="offer-price-line"><b>anstatt</b> mtl. {fEur(M_PRICE)} € × 12 = {fEur(A_EQ)} € / Jahr</span>
          <span className="offer-price-zahlst">zahlst du:</span>
          <span className="offer-price-num">{fEur(A_PRICE)} €<span className="offer-price-per"> / Jahr</span></span>
          <span className="offer-savings">du sparst {fEur(A_SAVE)} € (−{A_DISC} %)</span>
        </div>
        <div className="offer-rcta"><RCTA label="Angebot sichern" onClick={onSecure} /></div>
        <button className="mghost" onClick={onTrial}>Erst <b>24 h kostenlos</b> testen</button>
      </div>
    </div>
  );
}

/* Screen 2 – Paywall bottom sheet */
function PaywallSheet({ onUpgrade, onClose }) {
  return (
    <div className="paywall-bg" onClick={onClose} role="dialog" aria-modal="true" aria-label="Premium freischalten">
      <div className="paywall-sheet" onClick={e => e.stopPropagation()}>
        <div className="paywall-grab"/>
        <div className="lock-tag">🔒 Quiz &amp; Merken sind Premium</div>
        <h2 className="paywall-h1">Konjugieren, ohne nachzudenken</h2>
        <p className="paywall-sub">Mit dem Quiz trainierst du aktiv, bis die Formen sitzen — und mit „Merken" übst du genau den Wortschatz, der dir wichtig ist.</p>
        <FeatureBox rows={[
          ["Interaktives Quiz","4 Modi"],
          ["Merken & Vokabellisten","unbegrenzt"],
          ["Konjugation & Lernen","bleibt frei"],
        ]}/>
        <RCTA label="Premium freischalten" onClick={onUpgrade}/>
        <button className="mghost" onClick={onClose}>Vielleicht später</button>
      </div>
    </div>
  );
}

/* Screen 3 – Plan select */
function PlanSelect({ plan, setPlan, onNext, onClose, onLogin }) {
  return (
    <div className="plansel-bg" role="dialog" aria-modal="true" aria-label="Plan wählen">
      <MonoBar onBack={onClose} backLabel="Schließen"/>
      <div className="plansel-content">
        <h1 className="plansel-h1">Premium freischalten</h1>
        <p className="plansel-sub">Quiz &amp; Merken in allen 5 Sprachen.</p>
        <div className="plan-cards">
          {/* Monatsabo */}
          <div className={"plan-card" + (plan==="monthly"?" sel":"")} onClick={() => setPlan("monthly")} role="radio" aria-checked={plan==="monthly"} tabIndex={0}>
            <div className={"plan-radio" + (plan==="monthly"?" on":"")}/>
            <div className="plan-info">
              <div className="plan-name">Monatsabo</div>
              <div className="plan-meta">flexibel · entspricht {fEur(A_EQ)} € / Jahr</div>
            </div>
            <div className="plan-price">
              <b>{fEur(M_PRICE)} €</b>
              <small>/ Monat</small>
            </div>
          </div>
          {/* Jahresabo */}
          <div className={"plan-card" + (plan==="annual"?" sel":"")} onClick={() => setPlan("annual")} role="radio" aria-checked={plan==="annual"} tabIndex={0} style={{marginTop:14}}>
            <span className="plan-best-badge">★ Beliebteste Wahl</span>
            <div className={"plan-radio" + (plan==="annual"?" on":"")}/>
            <div className="plan-info">
              <div className="plan-name">Jahresabo</div>
              <div className="plan-meta">~{fEur(+(A_PRICE/12).toFixed(2))} € / Monat · statt {fEur(A_EQ)} €</div>
              <div className="savings-tag">du sparst {fEur(A_SAVE)} € (−{A_DISC} %)</div>
            </div>
            <div className="plan-price">
              <b>{fEur(A_PRICE)} €</b>
              <small>/ Jahr</small>
            </div>
          </div>
        </div>
        <FeatureBox rows={[
          ["Interaktives Konjugations-Quiz",null],
          ["Merken — Favoriten & Vokabellisten",null],
        ]}/>
        <RCTA label="Weiter zum Bezahlen" onClick={onNext}/>
        <p className="trust-line">🔒 Sichere Zahlung über Stripe · jederzeit kündbar</p>
        <button className="mghost" onClick={onLogin}>Bereits Konto? <b>Anmelden</b></button>
      </div>
    </div>
  );
}

/* Screen 4 – Login / Registrierung */
function LoginView({ onClose, onGoogleLogin, onAppleLogin }) {
  const [email, setEmail] = useState("");
  const brandColors = [["#ff3b5c",20],["#ff7a18",16],["#ffc400",22],["#34c759",18]];
  return (
    <div className="login-bg" role="dialog" aria-modal="true" aria-label="Anmelden">
      <MonoBar onBack={onClose} backLabel="Zurück"/>
      <div className="login-content">
        <div className="app-icon-mark">
          {brandColors.map(([c],i) => <i key={i} style={{background:c}}/>)}
        </div>
        <h1 className="login-h1">Anmelden, um fortzufahren</h1>
        <p className="login-sub">Speichert deinen Fortschritt &amp; dein Abo geräteübergreifend.</p>
        {/* Google */}
        <button className="oauth-btn" onClick={onGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615Z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/></svg>
          Weiter mit Google
        </button>
        {/* Apple */}
        <button className="oauth-btn" onClick={onAppleLogin}>
          <svg width="18" height="18" viewBox="0 0 814 1000" aria-hidden="true" fill="currentColor"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-150.3-93.9c-52.1-65.1-95.1-175.3-95.1-279.6 0-205.6 129.2-315.1 256.4-315.1 63 0 117.9 41.5 158.4 41.5 39.2 0 101-43.5 167.5-43.5zm-159.6-183.5c27.5-35.3 47.4-84.7 47.4-134.1 0-6.9-.5-13.8-1.6-19.4-44.9 1.7-98.2 30.2-131 68.7-24.6 28.3-47.8 77.1-47.8 127.1 0 7.5 1 15 1.6 17.3 3 .5 7.9 1.1 12.8 1.1 40 0 89.1-26.2 118.6-60.7z"/></svg>
          Weiter mit Apple
        </button>
        <div className="login-divider"><span>oder mit E-Mail</span></div>
        <input
          className="login-email-input"
          type="email"
          placeholder="name@beispiel.de"
          value={email}
          onChange={e => setEmail(e.target.value)}
          aria-label="E-Mail-Adresse"
        />
        <div className="login-cta-wrap">
          <RCTA label="Weiter" onClick={() => {/* TODO: email auth */}}/>
        </div>
        <button className="mghost">Neu hier? <b>Konto erstellen</b></button>
      </div>
    </div>
  );
}

/* ---------- GoalFlow ---------- */
function GoalFlow({ step, setStep, name, onClose, onCreate }) {
  const [verbs, setVerbs] = React.useState(8);
  const [words, setWords] = React.useState(20);
  const tenseCount = 3;
  const weeks = 2;
  const days = weeks * 7;
  const reps = verbs * tenseCount * 8 + words * 6;
  const perDay = Math.max(6, Math.round(reps / days));
  const mins = Math.max(3, Math.round(perDay * 0.5));

  function renderForm() {
    return (
      <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
        <div className="qfilter-block">
          <p className="qfilter-lbl">Zeitraum &amp; Umfang</p>
          <div style={{display:"flex",gap:"8px"}}>
            <button className="tdbtn" style={{flex:1}}>
              <span className="tdbtn-lbl">Dauer</span>
              <span className="tdbtn-sum">2 Wochen</span>
              <span className="tdbtn-caret">▾</span>
            </button>
            <button className="tdbtn" style={{flex:1}}>
              <span className="tdbtn-lbl">Zeitformen</span>
              <span className="tdbtn-sum">{tenseCount} Zeitformen</span>
              <span className="tdbtn-caret">▾</span>
            </button>
          </div>
        </div>
        <div className="qfilter-block">
          <p className="qfilter-lbl">Verben pro Zeitform</p>
          <div className="gstepwrap">
            <button className="gstep" onClick={() => setVerbs(v => Math.max(1, v - 1))}>−</button>
            <span style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"18px",minWidth:"32px",textAlign:"center"}}>{verbs}</span>
            <button className="gstep" onClick={() => setVerbs(v => Math.min(30, v + 1))}>+</button>
          </div>
        </div>
        <div className="qfilter-block">
          <p className="qfilter-lbl">Neue Wörter</p>
          <div className="gstepwrap">
            <button className="gstep" onClick={() => setWords(w => Math.max(0, w - 5))}>−</button>
            <span style={{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"18px",minWidth:"32px",textAlign:"center"}}>{words}</span>
            <button className="gstep" onClick={() => setWords(w => Math.min(100, w + 5))}>+</button>
          </div>
        </div>
        <div className="gderive">{perDay} Übungen pro Tag · ≈ {mins} Min.</div>
        <div className="qfilter-block">
          <p className="gsumlbl">Lernziel Zusammenfassung</p>
          <p className="gsummary">In 2 Wochen: <b>{verbs} Verben</b> je Form in den gewählten Zeitformen, dazu <b>{words} neue Wörter</b>.</p>
        </div>
        <button className="gcta" onClick={onCreate}>
          <span className="cta-rainbow"></span>
          <span className="cta-label">Erstelle einen Lernplan · Level Mittel</span>
        </button>
      </div>
    );
  }

  return (
    <div className="goal-bg" onClick={onClose}>
      <div className="goal-sheet" style={{"--lc":"#7a5cff","--lang-color":"#7a5cff","--cc":"#a557ff"}} onClick={e => e.stopPropagation()}>
        <button className="goal-x" onClick={onClose}>×</button>
        {step === "choose" && <>
          <h2 className="goal-h1">Lege dein Lernziel fest, um <span className="cw-c">Conju</span><span className="cw-e">Expert</span> zu werden:</h2>
          <p style={{fontSize:"13px",color:"var(--muted)",marginBottom:"16px"}}>Wie möchtest du starten?</p>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            <button className="gchoice sug" onClick={() => setStep("suggest")}>
              <span className="gci">✨</span>
              <div className="gct"><b>Schlag mir was vor</b><small>LEVEL: MITTEL</small></div>
              <span className="ggo">→</span>
            </button>
            <button className="gchoice ind" onClick={() => setStep("individual")}>
              <span className="gci">⚙</span>
              <div className="gct"><b>Individueller Lernplan</b><small>Alles selbst wählen</small></div>
              <span className="ggo">→</span>
            </button>
            <div className="gorsep">oder nach Zeit</div>
            <button className="gchoice tim" onClick={() => setStep("individual")}>
              <span className="gci">⏱</span>
              <div className="gct"><b>Ich gebe meine Zeit vor</b><small>z. B. 10 Min. täglich</small></div>
              <span className="ggo">→</span>
            </button>
          </div>
        </>}
        {step === "suggest" && <>
          <div className="gback"><button className="gbackbtn" onClick={() => setStep("choose")}>← Zurück</button></div>
          <div className="gkibanner">✨ Dein KI-Vorschlag</div>
          {renderForm()}
        </>}
        {step === "individual" && <>
          <div className="gback"><button className="gbackbtn" onClick={() => setStep("choose")}>← Zurück</button></div>
          {renderForm()}
        </>}
      </div>
    </div>
  );
}

/* ---------- App ---------- */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [lang, setLang] = useState(() => recall("kunju-lang", "de"));
  const [verb, setVerb] = useState("");
  const [result, setResult] = useState(null);
  const [deconj, setDeconj] = useState(null);
  const [activeInf, setActiveInf] = useState(null);
  const [tab, setTab] = useState("conjugate");
  const [lastVerb, setLastVerb] = useState("");
  const [favs, setFavs] = useState(() => recall("kunju-favs", []));
  const [history, setHistory] = useState(() => recall("kunju-history", []));
  const [name, setName] = useState(() => recall("kunju-name", ""));
  const [showOnboard, setShowOnboard] = useState(() => recall("kunju-name", null) === null);
  const [showTour, setShowTour] = useState(() => recall("kunju-name", null) !== null && recall("kunju-tour", null) === null);
  const [native, setNative] = useState(() => recall("kunju-native", detectNative()));
  const [skill, setSkill] = useState(() => recall("kunju-skill", "beginner"));
  function setNat(n) {setNative(n);persist("kunju-native", n);}
  function setSkl(s) {setSkill(s);persist("kunju-skill", s);}
  function commitName(n) {setName(n);persist("kunju-name", n);setShowOnboard(false);if (recall("kunju-tour", null) === null) setShowTour(true);}
  function finishTour() {persist("kunju-tour", true);setShowTour(false);}
  UILANG = uiFromNative(native);

  // --- Monetization ---
  const [isPremium] = useState(() => recall("kunju-premium", false));
  const [trialExpiry, setTrialExpiry] = useState(() => { const d = recall("kunju-trial", null); return d ? d.exp : null; });
  function hasPaidAccess() { return isPremium || (trialExpiry && Date.now() < trialExpiry); }
  // Show offer on very first visit (no trial started, not premium)
  const [showOffer, setShowOffer] = useState(() => !recall("kunju-premium", false) && !recall("kunju-trial", null));
  const [showPaywall, setShowPaywall] = useState(false);
  const [showPlanSelect, setShowPlanSelect] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selPlan, setSelPlan] = useState("annual");

  function startTrial() {
    const exp = Date.now() + 24 * 60 * 60 * 1000;
    persist("kunju-trial", { exp });
    setTrialExpiry(exp);
    setShowOffer(false);
  }
  function handleTabSwitch(id) {
    if ((id === "quiz" || id === "saved") && !hasPaidAccess()) { setShowPaywall(true); return; }
    setTab(id);
  }

  // Sponsor slot: 1×/session, re-show only after >=4 more conjugations, daily cap.
  const adSession = useRef({ shown: 0, dismissed: false, conjSince: 999 });
  const [adVisible, setAdVisible] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [sysDark, setSysDark] = useState(() => !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches));
  const [daily, setDaily] = useState(() => readDaily());
  const [showStreak, setShowStreak] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [goalStep, setGoalStep] = useState("choose");
  const [goalSet, setGoalSet] = useState(() => recall("kunju-goal", false));
  const [offline, setOffline] = useState(() => !navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false), off = () => setOffline(true);
    window.addEventListener("online", on);window.addEventListener("offline", off);
    return () => {window.removeEventListener("online", on);window.removeEventListener("offline", off);};
  }, []);
  function onActivity() {setDaily(bumpDaily());}
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
    setFavs((f) => {
      const exists = f.some((x) => x.lang === lg && x.verb === vb);
      const nx = exists ? f.filter((x) => !(x.lang === lg && x.verb === vb)) : [{ lang: lg, verb: vb }, ...f];
      persist("kunju-favs", nx);return nx;
    });
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
    <div className="phone">
      <header className="appbar">
        <div className="brand">
          <span className="brand-mark">{RAINBOW.slice(0, 5).map((c, i) => <i key={i} style={{ background: c }}></i>)}</span>
          <div className="brand-text">
            <span className="brand-name" style={{ color: "rgb(231, 21, 131)" }}>Conju<b>Expert</b></span>
            {name ?
            <button className="brand-greet" onClick={() => setShowOnboard(true)} title="Edit">{tr("hi", { name })}</button> :
            <span className="brand-tag">{tr("tagline")}</span>}
          </div>
        </div>
        <button className="streakpill" onClick={() => { if (goalSet) { setShowStreak(true); } else { setGoalStep("choose"); setShowGoal(true); } }} title={tr("sk_title")}>
          <div className="streakring" style={{ "--p": Math.min(daily.count / daily.goal, 1) * 360 + "deg" }}>
            <span className="streakflame">{daily.count >= daily.goal ? "🔥" : "✦"}</span>
          </div>
          <div className="streakmeta"><b>{daily.streak}</b><small>{Math.min(daily.count, daily.goal)}/{daily.goal}</small></div>
        </button>
      </header>

      <LanguageBar lang={lang} setLang={switchLang} />
      <Tabs tab={tab} setTab={handleTabSwitch} />
      {offline && <div className="offlinebar">{tr("offline_note")}</div>}

      <main className="content">
        {tab === "conjugate" &&
        <ConjugateView engine={engine} lang={lang} verb={verb} setVerb={setVerb} result={result} onConjugate={onConjugate}
        t={t} favs={favs} toggleFav={toggleFav} history={history} clearHistory={clearHistory} pickVerb={pickVerb}
        adVisible={adVisible} onAdClick={onAdClick} onAdDismiss={onAdDismiss} name={name} translating={translating}
        deconj={deconj} activeInf={activeInf} onViewInf={viewInfinitive} />
        }
        {tab === "quiz" && <QuizView lang={lang} favs={favs} toggleFav={toggleFav} sound={t.sound} skill={skill} onStudy={pickVerb} onActivity={onActivity} />}
        {tab === "grammar" && <LearnView lang={lang} engine={engine} sound={t.sound} native={native} setNative={setNat} onStudy={pickVerb} />}
        {tab === "saved" && <SavedTab lang={lang} favs={favs} toggleFav={toggleFav} pickVerb={pickVerb} onActivity={onActivity} />}
      </main>

      <AppTweaks t={t} setTweak={setTweak} name={name} commitName={commitName} />

      {showOnboard &&
      <NameGate initial={name} editing={!!name} native={native} setNative={setNat} skill={skill} setSkill={setSkl}
      onSubmit={commitName} onClose={() => setShowOnboard(false)} />
      }
      {!showOnboard && showTour && <TourGate onDone={finishTour} />}
      {showStreak &&
      <div className="streakmodal-bg" onClick={() => setShowStreak(false)}>
        <div className="zt-board" onClick={e => e.stopPropagation()}>
          <button className="zt-x" onClick={() => setShowStreak(false)}>×</button>
          <div className="zt-eye">
            <span className="zt-k">Deine Zieltafel</span>
            <button className="zt-e" onClick={() => { setShowStreak(false); setGoalStep("choose"); setShowGoal(true); }}>✎ Ziel anpassen</button>
          </div>
          {(() => {
            const HL = ["Richtig stark heute,","Das läuft bei dir,","Du wirst besser,","Schön, dich zu sehen,",
                        "Dranbleiben lohnt sich,","Da tut sich was,","Ich freu mich mit dir,","Weiter so,"];
            const hl = HL[Math.floor(Math.random() * HL.length)];
            const who = name || "du";
            const shown = Math.min(daily.count, daily.goal);
            const left = Math.max(0, daily.goal - daily.count);
            return (<>
              <div>
                <h2 className="zt-greet">{hl}<br/><span className="zt-nm">{who}.</span></h2>
                <p className="zt-sub">Heute schon <b>{shown} von {daily.goal}</b> Übungen{left > 0 ? ` — noch ${left} bis zu deinem Tagesziel.` : " — Tagesziel geschafft! 🎉"}</p>
              </div>
              <div className="zt-prog">
                <div className="zt-pr">
                  <span className="zt-a">Heute <small>{shown} / {daily.goal}</small></span>
                  <span className="zt-b">🔥 {daily.streak} Tage in Folge</span>
                </div>
                <div className="zt-pbar"><i style={{ width: Math.min(daily.count / daily.goal, 1) * 100 + "%" }}></i></div>
              </div>
            </>);
          })()}
          {(() => {
            const LNAME = { de:"Deutsch", es:"Spanisch", en:"Englisch", nl:"Niederländisch", fr:"Französisch" }[lang] || "der Sprache";
            return (
              <div className="zt-ai">
                <span className="zt-av">{(name || "J").slice(0, 1).toUpperCase()}</span>
                <div className="zt-body">
                  <p>Wobei hakt's gerade{name ? `, ${name}` : ""}? Lass uns das im Dialog auf {LNAME} üben.</p>
                  <div className="zt-chips">
                    <span className="zt-chip">Ja, im Dialog üben</span>
                    <span className="zt-chip">Lieber Quiz</span>
                    <span className="zt-chip">Wo's hakt sagen</span>
                  </div>
                </div>
              </div>
            );
          })()}
          <div className="zt-chatin">
            <input placeholder="Antworte hier …" />
            <button className="zt-send">↑</button>
          </div>
          <div className="zt-acts">
            <button className="zt-act primary" onClick={() => setShowStreak(false)}>Weiter üben</button>
            <button className="zt-act" onClick={() => { setShowStreak(false); setTab("quiz"); }}>Zum Quiz →</button>
          </div>
        </div>
      </div>
      }
      {showGoal &&
        <GoalFlow
          step={goalStep} setStep={setGoalStep} name={name}
          onClose={() => setShowGoal(false)}
          onCreate={() => { persist("kunju-goal", true); setGoalSet(true); setShowGoal(false); setShowStreak(true); }}
        />
      }

      {/* Monetization screens */}
      {showOffer && !showOnboard &&
        <WelcomeOffer
          onSecure={() => { setShowOffer(false); setShowPlanSelect(true); }}
          onTrial={startTrial}
        />
      }
      {showPaywall &&
        <PaywallSheet
          onUpgrade={() => { setShowPaywall(false); setShowPlanSelect(true); }}
          onClose={() => setShowPaywall(false)}
        />
      }
      {showPlanSelect &&
        <PlanSelect
          plan={selPlan} setPlan={setSelPlan}
          onNext={() => { setShowPlanSelect(false); setShowLogin(true); }}
          onClose={() => setShowPlanSelect(false)}
          onLogin={() => { setShowPlanSelect(false); setShowLogin(true); }}
        />
      }
      {showLogin &&
        <LoginView
          onClose={() => setShowLogin(false)}
          onGoogleLogin={() => {/* TODO: Supabase Google OAuth */}}
          onAppleLogin={() => {/* TODO: Supabase Apple OAuth */}}
        />
      }
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);