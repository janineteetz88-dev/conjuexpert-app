/* German conjugation engine (v2 — compact strong-verb generator + regular baseline) */
(function () {
  window.CONJ = window.CONJ || {};
  const PRON = ["ich", "du", "er / sie / es", "wir", "ihr", "sie / Sie"];

  // Compact irregular entries. Fields:
  //   du, er         -> present 2nd/3rd sg (vowel change); presentFull overrides all 6
  //   praet          -> Präteritum 1st-sg; weak:true => weak (-te) pattern
  //   konj           -> Konjunktiv II stem (without final -e)
  //   partizip, aux  -> Partizip II + perfect auxiliary
  //   impDu, impFull -> imperative overrides
  const IRR = {
    sein:    { presentFull: ["bin","bist","ist","sind","seid","sind"], praet: "war", konj: "wär", partizip: "gewesen", aux: "sein", impFull: ["—","sei","—","seien wir","seid","seien Sie"] },
    haben:   { du: "hast", er: "hat", praet: "hatte", weak: true, konj: "hätt", partizip: "gehabt", aux: "haben", impDu: "hab" },
    werden:  { du: "wirst", er: "wird", praet: "wurde", weak: true, konj: "würd", partizip: "geworden", aux: "sein", impDu: "werde" },
    gehen:   { praet: "ging", konj: "ging", partizip: "gegangen", aux: "sein" },
    kommen:  { praet: "kam", konj: "käm", partizip: "gekommen", aux: "sein" },
    sehen:   { du: "siehst", er: "sieht", praet: "sah", konj: "säh", partizip: "gesehen", aux: "haben", impDu: "sieh" },
    essen:   { du: "isst", er: "isst", praet: "aß", konj: "äß", partizip: "gegessen", aux: "haben", impDu: "iss" },
    fahren:  { du: "fährst", er: "fährt", praet: "fuhr", konj: "führ", partizip: "gefahren", aux: "sein" },
    geben:   { du: "gibst", er: "gibt", praet: "gab", konj: "gäb", partizip: "gegeben", aux: "haben", impDu: "gib" },
    nehmen:  { du: "nimmst", er: "nimmt", praet: "nahm", konj: "nähm", partizip: "genommen", aux: "haben", impDu: "nimm" },
    finden:  { praet: "fand", konj: "fänd", partizip: "gefunden", aux: "haben" },
    sprechen:{ du: "sprichst", er: "spricht", praet: "sprach", konj: "spräch", partizip: "gesprochen", aux: "haben", impDu: "sprich" },
    lesen:   { du: "liest", er: "liest", praet: "las", konj: "läs", partizip: "gelesen", aux: "haben", impDu: "lies" },
    schlafen:{ du: "schläfst", er: "schläft", praet: "schlief", konj: "schlief", partizip: "geschlafen", aux: "haben" },
    trinken: { praet: "trank", konj: "tränk", partizip: "getrunken", aux: "haben" },
    fliegen: { praet: "flog", konj: "flög", partizip: "geflogen", aux: "sein" },
    laufen:  { du: "läufst", er: "läuft", praet: "lief", konj: "lief", partizip: "gelaufen", aux: "sein" },
    helfen:  { du: "hilfst", er: "hilft", praet: "half", konj: "hülf", partizip: "geholfen", aux: "haben", impDu: "hilf" },
    treffen: { du: "triffst", er: "trifft", praet: "traf", konj: "träf", partizip: "getroffen", aux: "haben", impDu: "triff" },
    denken:  { praet: "dachte", weak: true, konj: "dächt", partizip: "gedacht", aux: "haben" },
    bringen: { praet: "brachte", weak: true, konj: "brächt", partizip: "gebracht", aux: "haben" },
    wissen:  { presentFull: ["weiß","weißt","weiß","wissen","wisst","wissen"], praet: "wusste", weak: true, konj: "wüsst", partizip: "gewusst", aux: "haben", impDu: "wisse" },
    kennen:  { praet: "kannte", weak: true, konj: "kennt", partizip: "gekannt", aux: "haben" },
    stehen:  { praet: "stand", konj: "stünd", partizip: "gestanden", aux: "haben" },
    verstehen:{ praet: "verstand", konj: "verständ", partizip: "verstanden", aux: "haben" },
    beginnen:{ praet: "begann", konj: "begänn", partizip: "begonnen", aux: "haben" },
    bleiben: { praet: "blieb", konj: "blieb", partizip: "geblieben", aux: "sein" },
    schreiben:{ praet: "schrieb", konj: "schrieb", partizip: "geschrieben", aux: "haben" },
    fallen:  { du: "fällst", er: "fällt", praet: "fiel", konj: "fiel", partizip: "gefallen", aux: "sein" },
    halten:  { du: "hältst", er: "hält", praet: "hielt", konj: "hielt", partizip: "gehalten", aux: "haben" },
    lassen:  { du: "lässt", er: "lässt", praet: "ließ", konj: "ließ", partizip: "gelassen", aux: "haben" },
    rufen:   { praet: "rief", konj: "rief", partizip: "gerufen", aux: "haben" },
    schwimmen:{ praet: "schwamm", konj: "schwömm", partizip: "geschwommen", aux: "sein" },
    singen:  { praet: "sang", konj: "säng", partizip: "gesungen", aux: "haben" },
    sitzen:  { praet: "saß", konj: "säß", partizip: "gesessen", aux: "haben" },
    liegen:  { praet: "lag", konj: "läg", partizip: "gelegen", aux: "haben" },
    ziehen:  { praet: "zog", konj: "zög", partizip: "gezogen", aux: "haben" },
    tragen:  { du: "trägst", er: "trägt", praet: "trug", konj: "trüg", partizip: "getragen", aux: "haben" },
    waschen: { du: "wäschst", er: "wäscht", praet: "wusch", konj: "wüsch", partizip: "gewaschen", aux: "haben" },
    werfen:  { du: "wirfst", er: "wirft", praet: "warf", konj: "würf", partizip: "geworfen", aux: "haben", impDu: "wirf" },
    gewinnen:{ praet: "gewann", konj: "gewänn", partizip: "gewonnen", aux: "haben" },
    vergessen:{ du: "vergisst", er: "vergisst", praet: "vergaß", konj: "vergäß", partizip: "vergessen", aux: "haben", impDu: "vergiss" },
    verlieren:{ praet: "verlor", konj: "verlör", partizip: "verloren", aux: "haben" },
    bitten:  { praet: "bat", konj: "bät", partizip: "gebeten", aux: "haben" },
    gefallen:{ du: "gefällst", er: "gefällt", praet: "gefiel", konj: "gefiel", partizip: "gefallen", aux: "haben" },
    mögen:   { presentFull: ["mag","magst","mag","mögen","mögt","mögen"], praet: "mochte", weak: true, konj: "möcht", partizip: "gemocht", aux: "haben" },
    müssen:  { presentFull: ["muss","musst","muss","müssen","müsst","müssen"], praet: "musste", weak: true, konj: "müsst", partizip: "gemusst", aux: "haben" },
    können:  { presentFull: ["kann","kannst","kann","können","könnt","können"], praet: "konnte", weak: true, konj: "könnt", partizip: "gekonnt", aux: "haben" },
    wollen:  { presentFull: ["will","willst","will","wollen","wollt","wollen"], praet: "wollte", weak: true, konj: "wollt", partizip: "gewollt", aux: "haben" },
    sollen:  { presentFull: ["soll","sollst","soll","sollen","sollt","sollen"], praet: "sollte", weak: true, konj: "sollt", partizip: "gesollt", aux: "haben" },
    dürfen:  { presentFull: ["darf","darfst","darf","dürfen","dürft","dürfen"], praet: "durfte", weak: true, konj: "dürft", partizip: "gedurft", aux: "haben" },
    bekommen:{ praet: "bekam", konj: "bekäm", partizip: "bekommen", aux: "haben" },
    schlagen:{ du: "schlägst", er: "schlägt", praet: "schlug", konj: "schlüg", partizip: "geschlagen", aux: "haben" },
    wachsen: { du: "wächst", er: "wächst", praet: "wuchs", konj: "wüchs", partizip: "gewachsen", aux: "sein" },
    schließen:{ praet: "schloss", konj: "schlöss", partizip: "geschlossen", aux: "haben" },
    genießen:{ praet: "genoss", konj: "genöss", partizip: "genossen", aux: "haben" },
    steigen: { praet: "stieg", konj: "stieg", partizip: "gestiegen", aux: "sein" },
    scheinen:{ praet: "schien", konj: "schien", partizip: "geschienen", aux: "haben" },
    bieten:  { praet: "bot", konj: "böt", partizip: "geboten", aux: "haben" },
    fangen:  { du: "fängst", er: "fängt", praet: "fing", konj: "fing", partizip: "gefangen", aux: "haben" },
    empfehlen:{ du: "empfiehlst", er: "empfiehlt", praet: "empfahl", konj: "empföhl", partizip: "empfohlen", aux: "haben", impDu: "empfiehl" },
    sterben: { du: "stirbst", er: "stirbt", praet: "starb", konj: "stürb", partizip: "gestorben", aux: "sein", impDu: "stirb" },
    brechen: { du: "brichst", er: "bricht", praet: "brach", konj: "bräch", partizip: "gebrochen", aux: "haben", impDu: "brich" },
    schneiden:{ praet: "schnitt", konj: "schnitt", partizip: "geschnitten", aux: "haben" },
    greifen: { praet: "griff", konj: "griff", partizip: "gegriffen", aux: "haben" },
    riechen: { praet: "roch", konj: "röch", partizip: "gerochen", aux: "haben" },
    schmelzen: { du: "schmilzt", er: "schmilzt", praet: "schmolz", konj: "schmölz", partizip: "geschmolzen", aux: "sein" }
  };

  /* ---- C1 expansion ---- */
  // Inseparable-prefixed strong verbs derived from a base (no separable prefixes — the engine can't split those).
  function gp(base, prefix, over) {
    const b = IRR[base], o = {};
    if (b.du) o.du = prefix + b.du;
    if (b.er) o.er = prefix + b.er;
    o.praet = prefix + b.praet;
    o.konj = prefix + b.konj;
    o.partizip = prefix + b.partizip.replace(/^ge/, "");
    o.aux = b.aux;
    if (b.weak) o.weak = true;
    if (b.impDu) o.impDu = prefix + b.impDu;
    return Object.assign(o, over || {});
  }
  Object.assign(IRR, {
    // prefixed strong verbs (inseparable)
    bestehen: gp("stehen", "be"), entstehen: gp("stehen", "ent", { aux: "sein" }), gestehen: gp("stehen", "ge"), widerstehen: gp("stehen", "wider"),
    vergehen: gp("gehen", "ver", { aux: "sein" }), entgehen: gp("gehen", "ent", { aux: "sein" }), begehen: gp("gehen", "be", { aux: "haben" }),
    entkommen: gp("kommen", "ent"), entstammen: undefined,
    versprechen: gp("sprechen", "ver"), entsprechen: gp("sprechen", "ent"), besprechen: gp("sprechen", "be"), widersprechen: gp("sprechen", "wider"),
    unternehmen: gp("nehmen", "unter"), übernehmen: gp("nehmen", "über"), benehmen: gp("nehmen", "be"), entnehmen: gp("nehmen", "ent"), vernehmen: gp("nehmen", "ver"),
    empfinden: gp("finden", "emp"), erfinden: gp("finden", "er"),
    vergeben: gp("geben", "ver"), ergeben: gp("geben", "er"), übergeben: gp("geben", "über"),
    beziehen: gp("ziehen", "be"), erziehen: gp("ziehen", "er"), verziehen: gp("ziehen", "ver"), entziehen: gp("ziehen", "ent"),
    ertragen: gp("tragen", "er"), betragen: gp("tragen", "be"), vertragen: gp("tragen", "ver"), übertragen: gp("tragen", "über"),
    verfallen: gp("fallen", "ver", { aux: "sein" }), missfallen: gp("fallen", "miss"), befallen: gp("fallen", "be"),
    behalten: gp("halten", "be"), enthalten: gp("halten", "ent"), erhalten: gp("halten", "er"), unterhalten: gp("halten", "unter"), verhalten: gp("halten", "ver"),
    verlassen: gp("lassen", "ver"), entlassen: gp("lassen", "ent"), überlassen: gp("lassen", "über"), unterlassen: gp("lassen", "unter"),
    beschließen: gp("schließen", "be"), entschließen: gp("schließen", "ent"), verschließen: gp("schließen", "ver"),
    betreffen: gp("treffen", "be"), übertreffen: gp("treffen", "über"),
    unterbrechen: gp("brechen", "unter"), verbrechen: gp("brechen", "ver"),
    entwerfen: gp("werfen", "ent"), bewerfen: gp("werfen", "be"), verwerfen: gp("werfen", "ver"),
    erfahren: gp("fahren", "er", { aux: "haben" }), befahren: gp("fahren", "be", { aux: "haben" }), überfahren: gp("fahren", "über", { aux: "haben" }), verfahren: gp("fahren", "ver", { aux: "haben" }),
    verbieten: gp("bieten", "ver"), gebieten: gp("bieten", "ge"),
    verbringen: gp("bringen", "ver"), erbringen: gp("bringen", "er"),
    bedenken: gp("denken", "be"), gedenken: gp("denken", "ge"),
    beschreiben: gp("schreiben", "be"), unterschreiben: gp("schreiben", "unter"), verschreiben: gp("schreiben", "ver"),
    begreifen: gp("greifen", "be"), ergreifen: gp("greifen", "er"),
    // standalone strong verbs
    raten:    { du: "rätst", er: "rät", praet: "riet", konj: "riet", partizip: "geraten", aux: "haben" },
    laden:    { du: "lädst", er: "lädt", praet: "lud", konj: "lüd", partizip: "geladen", aux: "haben" },
    heißen:   { praet: "hieß", konj: "hieß", partizip: "geheißen", aux: "haben" },
    stoßen:   { du: "stößt", er: "stößt", praet: "stieß", konj: "stieß", partizip: "gestoßen", aux: "haben" },
    fließen:  { praet: "floss", konj: "flöss", partizip: "geflossen", aux: "sein" },
    gießen:   { praet: "goss", konj: "göss", partizip: "gegossen", aux: "haben" },
    schießen: { praet: "schoss", konj: "schöss", partizip: "geschossen", aux: "haben" },
    messen:   { du: "misst", er: "misst", praet: "maß", konj: "mäß", partizip: "gemessen", aux: "haben", impDu: "miss" },
    treten:   { du: "trittst", er: "tritt", praet: "trat", konj: "trät", partizip: "getreten", aux: "haben", impDu: "tritt" },
    gelten:   { du: "giltst", er: "gilt", praet: "galt", konj: "gält", partizip: "gegolten", aux: "haben" },
    stehlen:  { du: "stiehlst", er: "stiehlt", praet: "stahl", konj: "stähl", partizip: "gestohlen", aux: "haben", impDu: "stiehl" },
    befehlen: { du: "befiehlst", er: "befiehlt", praet: "befahl", konj: "befähl", partizip: "befohlen", aux: "haben", impDu: "befiehl" },
    werben:   { du: "wirbst", er: "wirbt", praet: "warb", konj: "würb", partizip: "geworben", aux: "haben", impDu: "wirb" },
    schieben: { praet: "schob", konj: "schöb", partizip: "geschoben", aux: "haben" },
    heben:    { praet: "hob", konj: "höb", partizip: "gehoben", aux: "haben" },
    lügen:    { praet: "log", konj: "lög", partizip: "gelogen", aux: "haben" },
    biegen:   { praet: "bog", konj: "bög", partizip: "gebogen", aux: "haben" },
    fliehen:  { praet: "floh", konj: "flöh", partizip: "geflohen", aux: "sein" },
    frieren:  { praet: "fror", konj: "frör", partizip: "gefroren", aux: "haben" },
    wiegen:   { praet: "wog", konj: "wög", partizip: "gewogen", aux: "haben" },
    reiten:   { praet: "ritt", konj: "ritt", partizip: "geritten", aux: "sein" },
    streiten: { praet: "stritt", konj: "stritt", partizip: "gestritten", aux: "haben" },
    leiden:   { praet: "litt", konj: "litt", partizip: "gelitten", aux: "haben" },
    schweigen:{ praet: "schwieg", konj: "schwieg", partizip: "geschwiegen", aux: "haben" },
    reißen:   { praet: "riss", konj: "riss", partizip: "gerissen", aux: "haben" },
    beißen:   { praet: "biss", konj: "biss", partizip: "gebissen", aux: "haben" },
    streichen:{ praet: "strich", konj: "strich", partizip: "gestrichen", aux: "haben" },
    gelingen: { praet: "gelang", konj: "geläng", partizip: "gelungen", aux: "sein" },
    klingen:  { praet: "klang", konj: "kläng", partizip: "geklungen", aux: "haben" },
    springen: { praet: "sprang", konj: "spräng", partizip: "gesprungen", aux: "sein" },
    zwingen:  { praet: "zwang", konj: "zwäng", partizip: "gezwungen", aux: "haben" },
    sinken:   { praet: "sank", konj: "sänk", partizip: "gesunken", aux: "sein" },
    binden:   { praet: "band", konj: "bänd", partizip: "gebunden", aux: "haben" },
    verschwinden: { praet: "verschwand", konj: "verschwänd", partizip: "verschwunden", aux: "sein" },
    beweisen: { praet: "bewies", konj: "bewies", partizip: "bewiesen", aux: "haben" }
  });
  delete IRR.entstammen;

  function clean(v) { return (v || "").trim().toLowerCase(); }

  // Separable prefixes (trennbare Verben): conjugate the base, then move the prefix.
  // WICHTIG: längster-zuerst sortiert, damit z. B. "zurück" vor "zu" und "herein"
  // vor "her" greift (sonst wird "zurückkommen" fälschlich als "zu"+"rückkommen" zerlegt).
  const SEP_PREFIXES = ["ab","an","auf","aus","bei","ein","mit","nach","vor","zu","zurück","zusammen","weg","los","her","hin","empor","fort","heim","hoch","weiter","wieder","durch","über","um","unter","entgegen","gegenüber","voran","voraus","vorbei","herein","heraus","hinaus","hinein","herunter","hinunter","herauf","hinauf","herüber","davon","dazu","fest","frei","statt","teil","fern","nieder","zurecht","entlang","hervor","hinweg","vorüber","empor","entzwei"].sort((a, b) => b.length - a.length);
  // Weak/regular inseparable verbs that collide with a separable prefix; see splitSeparable.
  const INSEPARABLE = new Set([
    "antworten", "hindern", "beinhalten", "einigen",
    "umarmen", "umringen", "umsorgen",
    "unterrichten", "unterstützen", "untersuchen", "unterdrücken",
    "überlegen", "überqueren", "überraschen", "übersetzen", "übernachten",
    "überzeugen", "überprüfen", "wiederholen"
  ]);
  function splitSeparable(verb) {
    // Untrennbare Verben, deren Anfang zufällig mit einer trennbaren Vorsilbe
    // zusammenfällt (z. B. „antworten" ≠ an|tworten, „überlegen" ≠ über|legen,
    // „hindern" ≠ hin|dern). Der reine Präfix-Splitter würde sie sonst falsch
    // zerlegen („twortet … an"). Nur SCHWACHE/regelmäßige Verben aufnehmen –
    // die konjugiert die Engine als Ganzes korrekt. Starke untrennbare Verben
    // (übernehmen, unterbrechen …) gehören hier NICHT rein: ohne IRR-Eintrag
    // käme sonst eine falsche schwache Form heraus.
    if (INSEPARABLE.has(verb)) return null;
    for (const p of SEP_PREFIXES) {
      if (verb.length > p.length + 2 && verb.startsWith(p)) {
        const base = verb.slice(p.length);
        if ((base.endsWith("en") || base.endsWith("n")) && (IRR[base] || stemOf(base))) {
          // avoid false positives like "unternehmen" (inseparable, already in IRR as whole)
          if (IRR[verb]) return null;
          return { prefix: p, base };
        }
      }
    }
    return null;
  }
  function conjugateBase(base) {
    const reg = regularData(base);
    const irr = IRR[base];
    let data = reg, isIrr = false;
    if (irr) {
      isIrr = true;
      data = {
        present: irr.presentFull || presentForms(base, irr.du, irr.er),
        praeteritum: praetForms(irr.praet, irr.weak),
        konjunktiv: konjForms(irr.konj),
        imperativ: imperativeForms(base, irr.impDu, irr.impFull),
        partizip: irr.partizip,
        aux: irr.aux || "haben"
      };
    }
    return { data, isIrr };
  }
  // Build tenses for a separable verb by appending the prefix in the right place.
  function separableTenses(verb, prefix, base) {
    const { data, isIrr } = conjugateBase(base);
    // movement/change separable verbs take "sein"; otherwise inherit base aux
    const SEIN_BASES = ["stehen","kommen","gehen","fahren","reisen","fallen","laufen","fliegen","steigen","ziehen","springen","wachsen","treten","schwimmen"];
    // Individual separable verbs whose aux differs from what the base-verb heuristic above would give
    // (e.g. "einschlafen" takes sein even though "schlafen" itself, and "ausschlafen", take haben).
    const SEP_AUX_OVERRIDE = { einschlafen: "sein", aufwachen: "sein", anziehen: "haben" };
    const auxOverride = SEP_AUX_OVERRIDE[verb] || ((SEIN_BASES.indexOf(base) >= 0 && ["auf","an","ab","ein","aus","mit","zurück","vor","um","weg","los","her","hin","empor","hoch","weiter","heim"].indexOf(prefix) >= 0) ? "sein" : data.aux);
    const suffix = (arr) => arr.map((f) => f === "—" ? "—" : `${f} … ${prefix}`); // finite verb + prefix at clause end
    const present = suffix(data.present);
    const praeteritum = suffix(data.praeteritum);
    const konjunktiv = suffix(data.konjunktiv);
    // Konjunktiv I getrennt bauen (sonst hängt buildTenses ihn ungetrennt ans
    // ganze Verb → "aufstehe" statt "stehe … auf"). Endungen sind immer regelmäßig.
    const k1s = base === "sein" ? null : (base.endsWith("en") ? base.slice(0, -2) : base.endsWith("n") ? base.slice(0, -1) : base);
    const konjunktiv1Base = base === "sein"
      ? ["sei", "seist", "sei", "seien", "seiet", "seien"]
      : [k1s + "e", k1s + "est", k1s + "e", base, k1s + "et", base];
    const konjunktiv1 = suffix(konjunktiv1Base);
    // imperative: "steh früh auf"
    // "X wir"/"X Sie": Pronomen bleibt beim Verb, Präfix ans Ende ("holen wir … ab")
    const imperativ = data.imperativ.map((f) => f === "—" ? "—" : `${f} … ${prefix}`);
    // participle: prefix + (ge)...  "aufgestanden", "ausgebreitet"
    const partizip = prefix + data.partizip;
    const aux = data.aux;
    const dataS = { present, praeteritum, konjunktiv, konjunktiv1, imperativ, partizip, aux: auxOverride };
    const tenses = buildTenses(verb, dataS);
    // future/conditional use the full infinitive (attached) → already correct via `verb`
    if (isIrr) {
      const regReg = regularData(base);
      if (regReg) {
        const regS = { present: regReg.present.map((f) => `${f} … ${prefix}`), praeteritum: regReg.praeteritum.map((f) => `${f} … ${prefix}`), konjunktiv: regReg.konjunktiv.map((f) => `${f} … ${prefix}`), konjunktiv1: konjunktiv1, imperativ: imperativ, partizip: prefix + regReg.partizip, aux: regReg.aux };
        const regT = buildTenses(verb, regS);
        tenses.forEach((t, i) => { t.reg = regT[i].forms; });
      }
    }
    return tenses;
  }
  function stemOf(verb) { if (verb.endsWith("en")) return verb.slice(0, -2); if (verb.endsWith("n")) return verb.slice(0, -1); return null; }
  function needsE(stem) { return /([dt]|[^aeioulrmnh][mn])$/.test(stem); }

  function presentForms(verb, du, er) {
    const stem = stemOf(verb), e = needsE(stem) ? "e" : "";
    return [stem + "e", du || (stem + duEnd(stem)), er || (stem + e + "t"), verb, stem + e + "t", verb];
  }
  function duEnd(stem) { if (needsE(stem)) return "est"; if (/([sßxz]|ss|tz)$/.test(stem)) return "t"; return "st"; }
  function praetForms(praet, weak) {
    if (weak) { const s = praet.replace(/e$/, ""); return [s + "e", s + "est", s + "e", s + "en", s + "et", s + "en"]; }
    // du: e-Einschub nach d/t/s-Lauten (du genossest); ihr: nur nach d/t —
    // modern heißt es "ihr genosst", "ihr last" (nicht "genosset"/"laset").
    const eDu = /([dtszxß]|ss)$/.test(praet) ? "e" : "";
    const eIhr = /[dt]$/.test(praet) ? "e" : "";
    return [praet, praet + eDu + "st", praet, praet + "en", praet + eIhr + "t", praet + "en"];
  }
  function konjForms(stem) { return [stem + "e", stem + "est", stem + "e", stem + "en", stem + "et", stem + "en"]; }
  function imperativeForms(verb, impDu, impFull) {
    if (impFull) return impFull;
    const stem = stemOf(verb), e = needsE(stem) ? "e" : "";
    return ["—", impDu || (stem + (needsE(stem) ? "e" : "")), "—", verb + " wir", stem + e + "t", verb + " Sie"];
  }

  function regularData(verb) {
    const stem = stemOf(verb);
    if (stem == null) return null;
    const e = needsE(stem) ? "e" : "";
    const wstem = stem + e + "t"; // weak preterite base: mach->macht, arbeit->arbeitet
    const noGe = /^(be|ge|er|ver|zer|ent|emp|miss)/.test(verb) || verb.endsWith("ieren");
    return {
      present: [stem + "e", stem + duEnd(stem), stem + e + "t", verb, stem + e + "t", verb],
      praeteritum: [wstem + "e", wstem + "est", wstem + "e", wstem + "en", wstem + "et", wstem + "en"],
      konjunktiv: [wstem + "e", wstem + "est", wstem + "e", wstem + "en", wstem + "et", wstem + "en"],
      imperativ: imperativeForms(verb, null, null),
      partizip: (noGe ? "" : "ge") + stem + e + "t",
      aux: "haben"
    };
  }

  function buildTenses(verb, data) {
    const auxPres = data.aux === "sein"
      ? ["bin","bist","ist","sind","seid","sind"]
      : ["habe","hast","hat","haben","habt","haben"];
    const perfekt = auxPres.map(a => `${a} ${data.partizip}`);
    const auxPraet = data.aux === "sein"
      ? ["war","warst","war","waren","wart","waren"]
      : ["hatte","hattest","hatte","hatten","hattet","hatten"];
    const plusquam = auxPraet.map(a => `${a} ${data.partizip}`);
    const werden = ["werde","wirst","wird","werden","werdet","werden"];
    const futur = werden.map(w => `${w} ${verb}`);
    const wuerde = ["würde","würdest","würde","würden","würdet","würden"];
    const konditional = wuerde.map(w => `${w} ${verb}`);
    // Partizip I = Infinitiv + "d" (gehen→gehend, wandern→wandernd). Ausnahmen:
    // „sein"→„seiend" und „…tun"→„…tuend" (kurzer Vokal+n, „e" wird eingeschoben).
    const partizip1 = verb === "sein" ? "seiend"
      : verb.endsWith("tun") ? verb.slice(0, -1) + "end"
      : (verb.endsWith("n") ? verb : verb + "n") + "d";
    const k1stem = verb.endsWith("en") ? verb.slice(0, -2) : verb.endsWith("n") ? verb.slice(0, -1) : verb;
    const konjunktiv1 = data.konjunktiv1 || (verb === "sein"
      ? ["sei","seist","sei","seien","seiet","seien"]
      : [k1stem + "e", k1stem + "est", k1stem + "e", verb, k1stem + "et", verb]);
    return [
      { id: "present", label: "Präsens", forms: data.present },
      { id: "past", label: "Präteritum", forms: data.praeteritum },
      { id: "perfect", label: "Perfekt", forms: perfekt },
      { id: "pluperfect", label: "Plusquamperfekt", forms: plusquam },
      { id: "future", label: "Futur I", forms: futur },
      { id: "subjunctive", label: "Konjunktiv II", forms: data.konjunktiv },
      { id: "subjunctive1", label: "Konjunktiv I (indirekte Rede)", forms: konjunktiv1 },
      { id: "conditional", label: "Konditional (würde)", forms: konditional },
      { id: "imperative", label: "Imperativ", forms: data.imperativ },
      { id: "gerund", label: "Partizip I", forms: PRON.map(() => partizip1) }
    ];
  }

  // Reflexive Verben (sich freuen): Basisverb konjugieren, mich/dich/sich/uns/
  // euch/sich hinter das finite Verb; Perfekt/Plusquamperfekt immer mit haben.
  const DE_REFL = ["mich", "dich", "sich", "uns", "euch", "sich"];
  const DE_R_SEIN_P = ["bin","bist","ist","sind","seid","sind"], DE_R_HAB_P = ["habe","hast","hat","haben","habt","haben"];
  const DE_R_SEIN_T = ["war","warst","war","waren","wart","waren"], DE_R_HAB_T = ["hatte","hattest","hatte","hatten","hattet","hatten"];
  function deReflexivize(tenses) {
    const map = (t) => (f, i) => {
      if (!f || f === "—") return f;
      if (t.nonFinite) return "sich " + f;
      if (t.id === "perfect" && f.startsWith(DE_R_SEIN_P[i] + " ")) f = DE_R_HAB_P[i] + f.slice(DE_R_SEIN_P[i].length);
      if (t.id === "pluperfect" && f.startsWith(DE_R_SEIN_T[i] + " ")) f = DE_R_HAB_T[i] + f.slice(DE_R_SEIN_T[i].length);
      if (t.id === "imperative") {
        const sp0 = f.indexOf(" … ");
        return sp0 < 0 ? f + " " + DE_REFL[i] : f.slice(0, sp0) + " " + DE_REFL[i] + f.slice(sp0);
      }
      const sp = f.indexOf(" ");
      return sp < 0 ? f + " " + DE_REFL[i] : f.slice(0, sp) + " " + DE_REFL[i] + f.slice(sp);
    };
    tenses.forEach(t => { t.forms = t.forms.map(map(t)); if (t.reg) t.reg = t.reg.map(map(t)); });
  }
  function conjugate(input) {
    let verb = clean(input);
    const refl = verb.startsWith("sich ");
    if (refl) verb = verb.slice(5).trim();
    if (!verb) return null;
    const reg = regularData(verb);
    if (!reg) return { error: "German verbs end in -en or -n. Try e.g. machen, gehen, arbeiten." };
    const sep = splitSeparable(verb);
    if (sep) {
      const tenses = separableTenses(verb, sep.prefix, sep.base);
      if (refl) deReflexivize(tenses);
      return { isIrregular: !!IRR[sep.base], infinitive: refl ? "sich " + verb : verb, pronouns: PRON, tenses, separable: true };
    }
    const irr = IRR[verb];
    let data = reg, isIrr = false;
    if (irr) {
      isIrr = true;
      data = {
        present: irr.presentFull || presentForms(verb, irr.du, irr.er),
        praeteritum: praetForms(irr.praet, irr.weak),
        konjunktiv: konjForms(irr.konj),
        imperativ: imperativeForms(verb, irr.impDu, irr.impFull),
        partizip: irr.partizip,
        aux: irr.aux || "haben"
      };
    }
    const tenses = buildTenses(verb, data);
    if (isIrr) { const regT = buildTenses(verb, reg); tenses.forEach((t, i) => { t.reg = regT[i].forms; }); }
    if (refl) deReflexivize(tenses);
    return { isIrregular: isIrr, infinitive: refl ? "sich " + verb : verb, pronouns: PRON, tenses };
  }

  window.CONJ.de = {
    name: "Deutsch", flag: "🇩🇪", ttsLang: "de-DE",
    placeholder: "z.B. machen, gehen, sprechen…",
    samples: ["machen", "gehen", "sein", "haben", "sprechen", "essen", "fahren", "nehmen", "geben", "finden", "denken", "bleiben"],
    irregulars: Object.keys(IRR),
    conjugate
  };
})();
