/* ConjuExpert — ausgelagertes App-Bundle (generiert aus index.html). */
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
    riechen: { praet: "roch", konj: "röch", partizip: "gerochen", aux: "haben" }
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
  const SEP_PREFIXES = ["ab","an","auf","aus","bei","ein","mit","nach","vor","zu","zurück","zusammen","weg","los","her","hin","empor","fort","heim","hoch","weiter","wieder","durch","über","um","unter","entgegen","gegenüber","voran","voraus","vorbei","herein","heraus","hinaus","hinein","herunter","hinunter","herauf","hinauf","herüber","davon","dazu","fest","frei","statt","teil","fern","nieder"];
  function splitSeparable(verb) {
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
    const auxOverride = (SEIN_BASES.indexOf(base) >= 0 && ["auf","an","ab","ein","aus","mit","zurück","vor","um","weg","los","her","hin","empor","hoch","weiter","heim"].indexOf(prefix) >= 0) ? "sein" : data.aux;
    const suffix = (arr) => arr.map((f) => f === "—" ? "—" : `${f} … ${prefix}`); // finite verb + prefix at clause end
    const present = suffix(data.present);
    const praeteritum = suffix(data.praeteritum);
    const konjunktiv = suffix(data.konjunktiv);
    // imperative: "steh früh auf"
    const imperativ = data.imperativ.map((f) => f === "—" ? "—" : (f.indexOf(" ") >= 0 ? `${f.split(" ")[0]} … ${prefix} ${f.split(" ").slice(1).join(" ")}`.trim() : `${f} … ${prefix}`));
    // participle: prefix + (ge)...  "aufgestanden", "ausgebreitet"
    const partizip = prefix + data.partizip;
    const aux = data.aux;
    const dataS = { present, praeteritum, konjunktiv, imperativ, partizip, aux: auxOverride };
    const tenses = buildTenses(verb, dataS);
    // future/conditional use the full infinitive (attached) → already correct via `verb`
    if (isIrr) {
      const regReg = regularData(base);
      if (regReg) {
        const regS = { present: regReg.present.map((f) => `${f} … ${prefix}`), praeteritum: regReg.praeteritum.map((f) => `${f} … ${prefix}`), konjunktiv: regReg.konjunktiv.map((f) => `${f} … ${prefix}`), imperativ: imperativ, partizip: prefix + regReg.partizip, aux: regReg.aux };
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
    const e = /([dtszxß]|ss)$/.test(praet) ? "e" : "";
    return [praet, praet + e + "st", praet, praet + "en", praet + e + "t", praet + "en"];
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
    const partizip1 = (verb.endsWith("n") ? verb : verb + "n") + "d";
    const k1stem = verb.endsWith("en") ? verb.slice(0, -2) : verb.endsWith("n") ? verb.slice(0, -1) : verb;
    const konjunktiv1 = verb === "sein"
      ? ["sei","seist","sei","seien","seiet","seien"]
      : [k1stem + "e", k1stem + "est", k1stem + "e", verb, k1stem + "et", verb];
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
      { id: "gerund", label: "Partizip I", forms: PRON.map(() => partizip1), nonFinite: true }
    ];
  }

  function conjugate(input) {
    const verb = clean(input);
    if (!verb) return null;
    const reg = regularData(verb);
    if (!reg) return { error: "German verbs end in -en or -n. Try e.g. machen, gehen, arbeiten." };
    const sep = splitSeparable(verb);
    if (sep) {
      const tenses = separableTenses(verb, sep.prefix, sep.base);
      return { isIrregular: !!IRR[sep.base], infinitive: verb, pronouns: PRON, tenses, separable: true };
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
    return { isIrregular: isIrr, infinitive: verb, pronouns: PRON, tenses };
  }

  window.CONJ.de = {
    name: "Deutsch", flag: "🇩🇪", ttsLang: "de-DE",
    placeholder: "z.B. machen, gehen, sprechen…",
    samples: ["machen", "gehen", "sein", "haben", "sprechen", "essen", "fahren", "nehmen", "geben", "finden", "denken", "bleiben"],
    irregulars: Object.keys(IRR),
    conjugate
  };
})();
;
/* English conjugation engine (v2 — expanded + regular baseline for diff highlight) */
(function () {
  window.CONJ = window.CONJ || {};
  const PRON = ["I", "you", "he / she / it", "we", "you (pl)", "they"];

  // irregular: base -> { past, pp, pres3?, pres? }
  const IRR = {
    be: { past: ["was","were","was","were","were","were"], pp: "been", pres: ["am","are","is","are","are","are"] },
    have: { past: "had", pp: "had", pres3: "has" },
    do: { past: "did", pp: "done", pres3: "does" },
    go: { past: "went", pp: "gone" },
    say: { past: "said", pp: "said" },
    get: { past: "got", pp: "gotten" },
    make: { past: "made", pp: "made" },
    know: { past: "knew", pp: "known" },
    think: { past: "thought", pp: "thought" },
    take: { past: "took", pp: "taken" },
    see: { past: "saw", pp: "seen" },
    come: { past: "came", pp: "come" },
    give: { past: "gave", pp: "given" },
    find: { past: "found", pp: "found" },
    tell: { past: "told", pp: "told" },
    feel: { past: "felt", pp: "felt" },
    become: { past: "became", pp: "become" },
    leave: { past: "left", pp: "left" },
    bring: { past: "brought", pp: "brought" },
    begin: { past: "began", pp: "begun" },
    keep: { past: "kept", pp: "kept" },
    hold: { past: "held", pp: "held" },
    write: { past: "wrote", pp: "written" },
    stand: { past: "stood", pp: "stood" },
    hear: { past: "heard", pp: "heard" },
    let: { past: "let", pp: "let" },
    mean: { past: "meant", pp: "meant" },
    set: { past: "set", pp: "set" },
    meet: { past: "met", pp: "met" },
    run: { past: "ran", pp: "run" },
    pay: { past: "paid", pp: "paid" },
    sit: { past: "sat", pp: "sat" },
    speak: { past: "spoke", pp: "spoken" },
    lie: { past: "lay", pp: "lain" },
    lead: { past: "led", pp: "led" },
    read: { past: "read", pp: "read" },
    grow: { past: "grew", pp: "grown" },
    lose: { past: "lost", pp: "lost" },
    fall: { past: "fell", pp: "fallen" },
    send: { past: "sent", pp: "sent" },
    build: { past: "built", pp: "built" },
    understand: { past: "understood", pp: "understood" },
    draw: { past: "drew", pp: "drawn" },
    break: { past: "broke", pp: "broken" },
    spend: { past: "spent", pp: "spent" },
    cut: { past: "cut", pp: "cut" },
    rise: { past: "rose", pp: "risen" },
    drive: { past: "drove", pp: "driven" },
    buy: { past: "bought", pp: "bought" },
    wear: { past: "wore", pp: "worn" },
    choose: { past: "chose", pp: "chosen" },
    eat: { past: "ate", pp: "eaten" },
    drink: { past: "drank", pp: "drunk" },
    swim: { past: "swam", pp: "swum" },
    sing: { past: "sang", pp: "sung" },
    sleep: { past: "slept", pp: "slept" },
    teach: { past: "taught", pp: "taught" },
    catch: { past: "caught", pp: "caught" },
    fly: { past: "flew", pp: "flown" },
    forget: { past: "forgot", pp: "forgotten" },
    fight: { past: "fought", pp: "fought" },
    win: { past: "won", pp: "won" },
    hit: { past: "hit", pp: "hit" },
    put: { past: "put", pp: "put" },
    cost: { past: "cost", pp: "cost" },
    sell: { past: "sold", pp: "sold" },
    throw: { past: "threw", pp: "thrown" },
    ride: { past: "rode", pp: "ridden" },
    shake: { past: "shook", pp: "shaken" },
    steal: { past: "stole", pp: "stolen" },
    freeze: { past: "froze", pp: "frozen" },
    blow: { past: "blew", pp: "blown" },
    bite: { past: "bit", pp: "bitten" },
    hide: { past: "hid", pp: "hidden" },
    beat: { past: "beat", pp: "beaten" },
    bend: { past: "bent", pp: "bent" },
    lend: { past: "lent", pp: "lent" },
    shoot: { past: "shot", pp: "shot" },
    shut: { past: "shut", pp: "shut" },
    spread: { past: "spread", pp: "spread" },
    stick: { past: "stuck", pp: "stuck" },
    tear: { past: "tore", pp: "torn" },
    wake: { past: "woke", pp: "woken" },
    lay: { past: "laid", pp: "laid" },
    light: { past: "lit", pp: "lit" },
    sink: { past: "sank", pp: "sunk" },
    sweep: { past: "swept", pp: "swept" },
    feed: { past: "fed", pp: "fed" }
  };

  function clean(v) { v = (v || "").trim().toLowerCase(); if (v.startsWith("to ")) v = v.slice(3); return v; }
  function thirdPerson(b) { if (/(s|sh|ch|x|z|o)$/.test(b)) return b + "es"; if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + "ies"; return b + "s"; }
  function gerund(b) { if (b.endsWith("ie")) return b.slice(0, -2) + "ying"; if (b.endsWith("e") && b !== "be" && !b.endsWith("ee")) return b.slice(0, -1) + "ing"; if (/[^aeiou][aeiou][^aeiouwxy]$/.test(b) && b.length <= 4) return b + b.slice(-1) + "ing"; return b + "ing"; }
  function regPast(b) { if (b.endsWith("e")) return b + "d"; if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + "ied"; if (/[^aeiou][aeiou][^aeiouwxy]$/.test(b) && b.length <= 4) return b + b.slice(-1) + "ed"; return b + "ed"; }

  function buildTenses(base, irr) {
    let pres;
    if (base === "be" && irr && irr.pres) pres = irr.pres.slice();
    else { const third = irr && irr.pres3 ? irr.pres3 : thirdPerson(base); pres = [base, base, third, base, base, base]; }
    let past;
    if (irr) past = Array.isArray(irr.past) ? irr.past.slice() : [irr.past, irr.past, irr.past, irr.past, irr.past, irr.past];
    else { const p = regPast(base); past = [p, p, p, p, p, p]; }
    const pp = irr ? irr.pp : regPast(base);
    const has = ["have","have","has","have","have","have"];
    const perfect = has.map(h => `${h} ${pp}`);
    const pastperfect = PRON.map(() => `had ${pp}`);
    const future = PRON.map(() => `will ${base}`);
    const cond = PRON.map(() => `would ${base}`);
    const subj = PRON.map(() => base === "be" ? "be" : base);
    const ger = gerund(base);
    const imperative = ["—", base + "!", "—", "let's " + base, base + "!", "—"];
    const beNow = ["am", "are", "is", "are", "are", "are"];
    const benPast = ["was", "were", "was", "were", "were", "were"];
    const presentCont = beNow.map((b) => `${b} ${ger}`);
    const pastCont = benPast.map((b) => `${b} ${ger}`);
    const has2 = ["have", "have", "has", "have", "have", "have"];
    const perfectCont = has2.map((h) => `${h} been ${ger}`);
    return [
      { id: "present", label: "Present", forms: pres },
      { id: "presentCont", label: "Present Continuous", forms: presentCont },
      { id: "past", label: "Simple Past", forms: past },
      { id: "pastCont", label: "Past Continuous", forms: pastCont },
      { id: "perfect", label: "Present Perfect", forms: perfect },
      { id: "perfectCont", label: "Present Perfect Continuous", forms: perfectCont },
      { id: "pluperfect", label: "Past Perfect", forms: pastperfect },
      { id: "future", label: "Future", forms: future },
      { id: "subjunctive", label: "Subjunctive", forms: subj },
      { id: "conditional", label: "Conditional", forms: cond },
      { id: "imperative", label: "Imperative", forms: imperative },
      { id: "gerund", label: "Gerund / Present Participle", forms: PRON.map(() => ger), nonFinite: true }
    ];
  }

  function conjugate(input) {
    const base = clean(input);
    if (!base) return null;
    const irr = IRR[base];
    const isIrr = !!irr;
    const tenses = buildTenses(base, irr);
    if (isIrr) { const reg = buildTenses(base, null); tenses.forEach((t, i) => { t.reg = reg[i].forms; }); }
    return { isIrregular: isIrr, infinitive: "to " + base, pronouns: PRON, tenses };
  }

  window.CONJ.en = {
    name: "English", flag: "🇬🇧", ttsLang: "en-US",
    placeholder: "e.g. to go, speak, run…",
    samples: ["go", "speak", "have", "make", "think", "run", "eat", "write", "take", "give", "find", "see"],
    irregulars: Object.keys(IRR),
    conjugate
  };
})();
;
/* Spanish conjugation engine (v2 — partial overrides + regular baseline) */
(function () {
  window.CONJ = window.CONJ || {};
  const PRON = ["yo", "tú", "él / ella", "nosotros", "vosotros", "ellos / ellas"];

  // Each IRR entry overrides ONLY the irregular tenses; the rest come from rules.
  // keys: present, preterite, subjunctive, future, conditional, imperative, gerund, participle
  const IRR = {
    ser: {
      present: ["soy","eres","es","somos","sois","son"],
      preterite: ["fui","fuiste","fue","fuimos","fuisteis","fueron"],
      imperfect: ["era","eras","era","éramos","erais","eran"],
      subjunctive: ["sea","seas","sea","seamos","seáis","sean"],
      future: ["seré","serás","será","seremos","seréis","serán"],
      conditional: ["sería","serías","sería","seríamos","seríais","serían"],
      imperative: ["—","sé","sea","seamos","sed","sean"],
      participle: "sido", gerund: "siendo"
    },
    estar: {
      present: ["estoy","estás","está","estamos","estáis","están"],
      preterite: ["estuve","estuviste","estuvo","estuvimos","estuvisteis","estuvieron"],
      subjunctive: ["esté","estés","esté","estemos","estéis","estén"],
      imperative: ["—","está","esté","estemos","estad","estén"]
    },
    haber: {
      present: ["he","has","ha","hemos","habéis","han"],
      preterite: ["hube","hubiste","hubo","hubimos","hubisteis","hubieron"],
      subjunctive: ["haya","hayas","haya","hayamos","hayáis","hayan"],
      future: ["habré","habrás","habrá","habremos","habréis","habrán"],
      conditional: ["habría","habrías","habría","habríamos","habríais","habrían"],
      imperative: ["—","he","haya","hayamos","habed","hayan"]
    },
    tener: {
      present: ["tengo","tienes","tiene","tenemos","tenéis","tienen"],
      preterite: ["tuve","tuviste","tuvo","tuvimos","tuvisteis","tuvieron"],
      subjunctive: ["tenga","tengas","tenga","tengamos","tengáis","tengan"],
      future: ["tendré","tendrás","tendrá","tendremos","tendréis","tendrán"],
      conditional: ["tendría","tendrías","tendría","tendríamos","tendríais","tendrían"],
      imperative: ["—","ten","tenga","tengamos","tened","tengan"]
    },
    hacer: {
      present: ["hago","haces","hace","hacemos","hacéis","hacen"],
      preterite: ["hice","hiciste","hizo","hicimos","hicisteis","hicieron"],
      subjunctive: ["haga","hagas","haga","hagamos","hagáis","hagan"],
      future: ["haré","harás","hará","haremos","haréis","harán"],
      conditional: ["haría","harías","haría","haríamos","haríais","harían"],
      imperative: ["—","haz","haga","hagamos","haced","hagan"],
      participle: "hecho"
    },
    ir: {
      present: ["voy","vas","va","vamos","vais","van"],
      preterite: ["fui","fuiste","fue","fuimos","fuisteis","fueron"],
      imperfect: ["iba","ibas","iba","íbamos","ibais","iban"],
      subjunctive: ["vaya","vayas","vaya","vayamos","vayáis","vayan"],
      imperative: ["—","ve","vaya","vamos","id","vayan"],
      gerund: "yendo"
    },
    decir: {
      present: ["digo","dices","dice","decimos","decís","dicen"],
      preterite: ["dije","dijiste","dijo","dijimos","dijisteis","dijeron"],
      subjunctive: ["diga","digas","diga","digamos","digáis","digan"],
      future: ["diré","dirás","dirá","diremos","diréis","dirán"],
      conditional: ["diría","dirías","diría","diríamos","diríais","dirían"],
      imperative: ["—","di","diga","digamos","decid","digan"],
      participle: "dicho", gerund: "diciendo"
    },
    poder: {
      present: ["puedo","puedes","puede","podemos","podéis","pueden"],
      preterite: ["pude","pudiste","pudo","pudimos","pudisteis","pudieron"],
      subjunctive: ["pueda","puedas","pueda","podamos","podáis","puedan"],
      future: ["podré","podrás","podrá","podremos","podréis","podrán"],
      conditional: ["podría","podrías","podría","podríamos","podríais","podrían"],
      imperative: ["—","—","—","—","—","—"],
      gerund: "pudiendo"
    },
    querer: {
      present: ["quiero","quieres","quiere","queremos","queréis","quieren"],
      preterite: ["quise","quisiste","quiso","quisimos","quisisteis","quisieron"],
      subjunctive: ["quiera","quieras","quiera","queramos","queráis","quieran"],
      future: ["querré","querrás","querrá","querremos","querréis","querrán"],
      conditional: ["querría","querrías","querría","querríamos","querríais","querrían"],
      imperative: ["—","quiere","quiera","queramos","quered","quieran"]
    },
    ver: {
      present: ["veo","ves","ve","vemos","veis","ven"],
      preterite: ["vi","viste","vio","vimos","visteis","vieron"],
      imperfect: ["veía","veías","veía","veíamos","veíais","veían"],
      subjunctive: ["vea","veas","vea","veamos","veáis","vean"],
      imperative: ["—","ve","vea","veamos","ved","vean"],
      participle: "visto"
    },
    dar: {
      present: ["doy","das","da","damos","dais","dan"],
      preterite: ["di","diste","dio","dimos","disteis","dieron"],
      subjunctive: ["dé","des","dé","demos","deis","den"],
      imperative: ["—","da","dé","demos","dad","den"]
    },
    saber: {
      present: ["sé","sabes","sabe","sabemos","sabéis","saben"],
      preterite: ["supe","supiste","supo","supimos","supisteis","supieron"],
      subjunctive: ["sepa","sepas","sepa","sepamos","sepáis","sepan"],
      future: ["sabré","sabrás","sabrá","sabremos","sabréis","sabrán"],
      conditional: ["sabría","sabrías","sabría","sabríamos","sabríais","sabrían"],
      imperative: ["—","sabe","sepa","sepamos","sabed","sepan"]
    },
    poner: {
      present: ["pongo","pones","pone","ponemos","ponéis","ponen"],
      preterite: ["puse","pusiste","puso","pusimos","pusisteis","pusieron"],
      subjunctive: ["ponga","pongas","ponga","pongamos","pongáis","pongan"],
      future: ["pondré","pondrás","pondrá","pondremos","pondréis","pondrán"],
      conditional: ["pondría","pondrías","pondría","pondríamos","pondríais","pondrían"],
      imperative: ["—","pon","ponga","pongamos","poned","pongan"],
      participle: "puesto"
    },
    salir: {
      present: ["salgo","sales","sale","salimos","salís","salen"],
      subjunctive: ["salga","salgas","salga","salgamos","salgáis","salgan"],
      future: ["saldré","saldrás","saldrá","saldremos","saldréis","saldrán"],
      conditional: ["saldría","saldrías","saldría","saldríamos","saldríais","saldrían"],
      imperative: ["—","sal","salga","salgamos","salid","salgan"]
    },
    venir: {
      present: ["vengo","vienes","viene","venimos","venís","vienen"],
      preterite: ["vine","viniste","vino","vinimos","vinisteis","vinieron"],
      subjunctive: ["venga","vengas","venga","vengamos","vengáis","vengan"],
      future: ["vendré","vendrás","vendrá","vendremos","vendréis","vendrán"],
      conditional: ["vendría","vendrías","vendría","vendríamos","vendríais","vendrían"],
      imperative: ["—","ven","venga","vengamos","venid","vengan"],
      gerund: "viniendo"
    },
    traer: {
      present: ["traigo","traes","trae","traemos","traéis","traen"],
      preterite: ["traje","trajiste","trajo","trajimos","trajisteis","trajeron"],
      subjunctive: ["traiga","traigas","traiga","traigamos","traigáis","traigan"],
      imperative: ["—","trae","traiga","traigamos","traed","traigan"],
      participle: "traído", gerund: "trayendo"
    },
    conocer: {
      present: ["conozco","conoces","conoce","conocemos","conocéis","conocen"],
      subjunctive: ["conozca","conozcas","conozca","conozcamos","conozcáis","conozcan"],
      imperative: ["—","conoce","conozca","conozcamos","conoced","conozcan"]
    },
    conducir: {
      present: ["conduzco","conduces","conduce","conducimos","conducís","conducen"],
      preterite: ["conduje","condujiste","condujo","condujimos","condujisteis","condujeron"],
      subjunctive: ["conduzca","conduzcas","conduzca","conduzcamos","conduzcáis","conduzcan"],
      imperative: ["—","conduce","conduzca","conduzcamos","conducid","conduzcan"]
    },
    dormir: {
      present: ["duermo","duermes","duerme","dormimos","dormís","duermen"],
      preterite: ["dormí","dormiste","durmió","dormimos","dormisteis","durmieron"],
      subjunctive: ["duerma","duermas","duerma","durmamos","durmáis","duerman"],
      imperative: ["—","duerme","duerma","durmamos","dormid","duerman"],
      gerund: "durmiendo"
    },
    pedir: {
      present: ["pido","pides","pide","pedimos","pedís","piden"],
      preterite: ["pedí","pediste","pidió","pedimos","pedisteis","pidieron"],
      subjunctive: ["pida","pidas","pida","pidamos","pidáis","pidan"],
      imperative: ["—","pide","pida","pidamos","pedid","pidan"],
      gerund: "pidiendo"
    },
    sentir: {
      present: ["siento","sientes","siente","sentimos","sentís","sienten"],
      preterite: ["sentí","sentiste","sintió","sentimos","sentisteis","sintieron"],
      subjunctive: ["sienta","sientas","sienta","sintamos","sintáis","sientan"],
      imperative: ["—","siente","sienta","sintamos","sentid","sientan"],
      gerund: "sintiendo"
    },
    pensar: {
      present: ["pienso","piensas","piensa","pensamos","pensáis","piensan"],
      subjunctive: ["piense","pienses","piense","pensemos","penséis","piensen"],
      imperative: ["—","piensa","piense","pensemos","pensad","piensen"]
    },
    volver: {
      present: ["vuelvo","vuelves","vuelve","volvemos","volvéis","vuelven"],
      subjunctive: ["vuelva","vuelvas","vuelva","volvamos","volváis","vuelvan"],
      imperative: ["—","vuelve","vuelva","volvamos","volved","vuelvan"],
      participle: "vuelto"
    },
    contar: {
      present: ["cuento","cuentas","cuenta","contamos","contáis","cuentan"],
      subjunctive: ["cuente","cuentes","cuente","contemos","contéis","cuenten"],
      imperative: ["—","cuenta","cuente","contemos","contad","cuenten"]
    },
    jugar: {
      present: ["juego","juegas","juega","jugamos","jugáis","juegan"],
      preterite: ["jugué","jugaste","jugó","jugamos","jugasteis","jugaron"],
      subjunctive: ["juegue","juegues","juegue","juguemos","juguéis","jueguen"],
      imperative: ["—","juega","juegue","juguemos","jugad","jueguen"]
    },
    empezar: {
      present: ["empiezo","empiezas","empieza","empezamos","empezáis","empiezan"],
      preterite: ["empecé","empezaste","empezó","empezamos","empezasteis","empezaron"],
      subjunctive: ["empiece","empieces","empiece","empecemos","empecéis","empiecen"],
      imperative: ["—","empieza","empiece","empecemos","empezad","empiecen"]
    },
    perder: {
      present: ["pierdo","pierdes","pierde","perdemos","perdéis","pierden"],
      subjunctive: ["pierda","pierdas","pierda","perdamos","perdáis","pierdan"],
      imperative: ["—","pierde","pierda","perdamos","perded","pierdan"]
    },
    seguir: {
      present: ["sigo","sigues","sigue","seguimos","seguís","siguen"],
      preterite: ["seguí","seguiste","siguió","seguimos","seguisteis","siguieron"],
      subjunctive: ["siga","sigas","siga","sigamos","sigáis","sigan"],
      imperative: ["—","sigue","siga","sigamos","seguid","sigan"],
      gerund: "siguiendo"
    },
    servir: {
      present: ["sirvo","sirves","sirve","servimos","servís","sirven"],
      preterite: ["serví","serviste","sirvió","servimos","servisteis","sirvieron"],
      subjunctive: ["sirva","sirvas","sirva","sirvamos","sirváis","sirvan"],
      imperative: ["—","sirve","sirva","sirvamos","servid","sirvan"],
      gerund: "sirviendo"
    },
    leer: {
      preterite: ["leí","leíste","leyó","leímos","leísteis","leyeron"],
      participle: "leído", gerund: "leyendo"
    },
    oir: {
      present: ["oigo","oyes","oye","oímos","oís","oyen"],
      preterite: ["oí","oíste","oyó","oímos","oísteis","oyeron"],
      subjunctive: ["oiga","oigas","oiga","oigamos","oigáis","oigan"],
      future: ["oiré","oirás","oirá","oiremos","oiréis","oirán"],
      conditional: ["oiría","oirías","oiría","oiríamos","oiríais","oirían"],
      imperative: ["—","oye","oiga","oigamos","oíd","oigan"],
      participle: "oído", gerund: "oyendo"
    },
    caer: {
      present: ["caigo","caes","cae","caemos","caéis","caen"],
      preterite: ["caí","caíste","cayó","caímos","caísteis","cayeron"],
      subjunctive: ["caiga","caigas","caiga","caigamos","caigáis","caigan"],
      imperative: ["—","cae","caiga","caigamos","caed","caigan"],
      participle: "caído", gerund: "cayendo"
    },
    morir: {
      present: ["muero","mueres","muere","morimos","morís","mueren"],
      preterite: ["morí","moriste","murió","morimos","moristeis","murieron"],
      subjunctive: ["muera","mueras","muera","muramos","muráis","mueran"],
      imperative: ["—","muere","muera","muramos","morid","mueran"],
      participle: "muerto", gerund: "muriendo"
    },
    cerrar: {
      present: ["cierro","cierras","cierra","cerramos","cerráis","cierran"],
      subjunctive: ["cierre","cierres","cierre","cerremos","cerréis","cierren"],
      imperative: ["—","cierra","cierre","cerremos","cerrad","cierren"]
    },
    entender: {
      present: ["entiendo","entiendes","entiende","entendemos","entendéis","entienden"],
      subjunctive: ["entienda","entiendas","entienda","entendamos","entendáis","entiendan"],
      imperative: ["—","entiende","entienda","entendamos","entended","entiendan"]
    },
    encontrar: {
      present: ["encuentro","encuentras","encuentra","encontramos","encontráis","encuentran"],
      subjunctive: ["encuentre","encuentres","encuentre","encontremos","encontréis","encuentren"],
      imperative: ["—","encuentra","encuentre","encontremos","encontrad","encuentren"]
    },
    mostrar: {
      present: ["muestro","muestras","muestra","mostramos","mostráis","muestran"],
      subjunctive: ["muestre","muestres","muestre","mostremos","mostréis","muestren"],
      imperative: ["—","muestra","muestre","mostremos","mostrad","muestren"]
    },
    recordar: {
      present: ["recuerdo","recuerdas","recuerda","recordamos","recordáis","recuerdan"],
      subjunctive: ["recuerde","recuerdes","recuerde","recordemos","recordéis","recuerden"],
      imperative: ["—","recuerda","recuerde","recordemos","recordad","recuerden"]
    },
    costar: {
      present: ["cuesto","cuestas","cuesta","costamos","costáis","cuestan"],
      subjunctive: ["cueste","cuestes","cueste","costemos","costéis","cuesten"],
      imperative: ["—","cuesta","cueste","costemos","costad","cuesten"]
    },
    comenzar: {
      present: ["comienzo","comienzas","comienza","comenzamos","comenzáis","comienzan"],
      preterite: ["comencé","comenzaste","comenzó","comenzamos","comenzasteis","comenzaron"],
      subjunctive: ["comience","comiences","comience","comencemos","comencéis","comiencen"],
      imperative: ["—","comienza","comience","comencemos","comenzad","comiencen"]
    },
    preferir: {
      present: ["prefiero","prefieres","prefiere","preferimos","preferís","prefieren"],
      preterite: ["preferí","preferiste","prefirió","preferimos","preferisteis","prefirieron"],
      subjunctive: ["prefiera","prefieras","prefiera","prefiramos","prefiráis","prefieran"],
      imperative: ["—","prefiere","prefiera","prefiramos","preferid","prefieran"],
      gerund: "prefiriendo"
    },
    repetir: {
      present: ["repito","repites","repite","repetimos","repetís","repiten"],
      preterite: ["repetí","repetiste","repitió","repetimos","repetisteis","repitieron"],
      subjunctive: ["repita","repitas","repita","repitamos","repitáis","repitan"],
      imperative: ["—","repite","repita","repitamos","repetid","repitan"],
      gerund: "repitiendo"
    },
    escribir: { participle: "escrito" },
    abrir: { participle: "abierto" },
    romper: { participle: "roto" },
    parecer: { present: ["parezco","pareces","parece","parecemos","parecéis","parecen"], subjunctive: ["parezca","parezcas","parezca","parezcamos","parezcáis","parezcan"], imperative: ["—","parece","parezca","parezcamos","pareced","parezcan"] },
    ofrecer: { present: ["ofrezco","ofreces","ofrece","ofrecemos","ofrecéis","ofrecen"], subjunctive: ["ofrezca","ofrezcas","ofrezca","ofrezcamos","ofrezcáis","ofrezcan"], imperative: ["—","ofrece","ofrezca","ofrezcamos","ofreced","ofrezcan"] },
    producir: { present: ["produzco","produces","produce","producimos","producís","producen"], preterite: ["produje","produjiste","produjo","produjimos","produjisteis","produjeron"], subjunctive: ["produzca","produzcas","produzca","produzcamos","produzcáis","produzcan"], imperative: ["—","produce","produzca","produzcamos","producid","produzcan"] },
    construir: { present: ["construyo","construyes","construye","construimos","construís","construyen"], preterite: ["construí","construiste","construyó","construimos","construisteis","construyeron"], subjunctive: ["construya","construyas","construya","construyamos","construyáis","construyan"], imperative: ["—","construye","construya","construyamos","construid","construyan"], gerund: "construyendo" },
    incluir: { present: ["incluyo","incluyes","incluye","incluimos","incluís","incluyen"], preterite: ["incluí","incluiste","incluyó","incluimos","incluisteis","incluyeron"], subjunctive: ["incluya","incluyas","incluya","incluyamos","incluyáis","incluyan"], imperative: ["—","incluye","incluya","incluyamos","incluid","incluyan"], gerund: "incluyendo" },
    oler: { present: ["huelo","hueles","huele","olemos","oléis","huelen"], subjunctive: ["huela","huelas","huela","olamos","oláis","huelan"], imperative: ["—","huele","huela","olamos","oled","huelan"] },
    soñar: { present: ["sueño","sueñas","sueña","soñamos","soñáis","sueñan"], subjunctive: ["sueñe","sueñes","sueñe","soñemos","soñéis","sueñen"], imperative: ["—","sueña","sueñe","soñemos","soñad","sueñen"] },
    almorzar: { present: ["almuerzo","almuerzas","almuerza","almorzamos","almorzáis","almuerzan"], preterite: ["almorcé","almorzaste","almorzó","almorzamos","almorzasteis","almorzaron"], subjunctive: ["almuerce","almuerces","almuerce","almorcemos","almorcéis","almuercen"], imperative: ["—","almuerza","almuerce","almorcemos","almorzad","almuercen"] },
    probar: { present: ["pruebo","pruebas","prueba","probamos","probáis","prueban"], subjunctive: ["pruebe","pruebes","pruebe","probemos","probéis","prueben"], imperative: ["—","prueba","pruebe","probemos","probad","prueben"] },
    mover: { present: ["muevo","mueves","mueve","movemos","movéis","mueven"], subjunctive: ["mueva","muevas","mueva","movamos","mováis","muevan"], imperative: ["—","mueve","mueva","movamos","moved","muevan"] },
    elegir: { present: ["elijo","eliges","elige","elegimos","elegís","eligen"], preterite: ["elegí","elegiste","eligió","elegimos","elegisteis","eligieron"], subjunctive: ["elija","elijas","elija","elijamos","elijáis","elijan"], imperative: ["—","elige","elija","elijamos","elegid","elijan"], gerund: "eligiendo" },
    mentir: { present: ["miento","mientes","miente","mentimos","mentís","mienten"], preterite: ["mentí","mentiste","mintió","mentimos","mentisteis","mintieron"], subjunctive: ["mienta","mientas","mienta","mintamos","mintáis","mientan"], imperative: ["—","miente","mienta","mintamos","mentid","mientan"], gerund: "mintiendo" },
    andar: { preterite: ["anduve","anduviste","anduvo","anduvimos","anduvisteis","anduvieron"] },
    caber: { present: ["quepo","cabes","cabe","cabemos","cabéis","caben"], preterite: ["cupe","cupiste","cupo","cupimos","cupisteis","cupieron"], subjunctive: ["quepa","quepas","quepa","quepamos","quepáis","quepan"], future: ["cabré","cabrás","cabrá","cabremos","cabréis","cabrán"], conditional: ["cabría","cabrías","cabría","cabríamos","cabríais","cabrían"], imperative: ["—","cabe","quepa","quepamos","cabed","quepan"] },
    valer: { present: ["valgo","vales","vale","valemos","valéis","valen"], subjunctive: ["valga","valgas","valga","valgamos","valgáis","valgan"], future: ["valdré","valdrás","valdrá","valdremos","valdréis","valdrán"], conditional: ["valdría","valdrías","valdría","valdríamos","valdríais","valdrían"], imperative: ["—","vale","valga","valgamos","valed","valgan"] },
    reír: { present: ["río","ríes","ríe","reímos","reís","ríen"], preterite: ["reí","reíste","rió","reímos","reísteis","rieron"], subjunctive: ["ría","rías","ría","riamos","riáis","rían"], imperative: ["—","ríe","ría","riamos","reíd","rían"], participle: "reído", gerund: "riendo" }
  };
  // accent alias
  IRR["oír"] = IRR.oir;

  const ENDINGS = {
    ar: { present: ["o","as","a","amos","áis","an"], preterite: ["é","aste","ó","amos","asteis","aron"], imperfect: ["aba","abas","aba","ábamos","abais","aban"], subjunctive: ["e","es","e","emos","éis","en"], conditional: ["ía","ías","ía","íamos","íais","ían"], imperative: ["—","a","e","emos","ad","en"], gerund: "ando", participle: "ado" },
    er: { present: ["o","es","e","emos","éis","en"], preterite: ["í","iste","ió","imos","isteis","ieron"], imperfect: ["ía","ías","ía","íamos","íais","ían"], subjunctive: ["a","as","a","amos","áis","an"], conditional: ["ía","ías","ía","íamos","íais","ían"], imperative: ["—","e","a","amos","ed","an"], gerund: "iendo", participle: "ido" },
    ir: { present: ["o","es","e","imos","ís","en"], preterite: ["í","iste","ió","imos","isteis","ieron"], imperfect: ["ía","ías","ía","íamos","íais","ían"], subjunctive: ["a","as","a","amos","áis","an"], conditional: ["ía","ías","ía","íamos","íais","ían"], imperative: ["—","e","a","amos","id","an"], gerund: "iendo", participle: "ido" }
  };

  function clean(v) { return (v || "").trim().toLowerCase(); }

  // Orthographic adjustment so c/g/z keep their sound before certain endings
  // (e.g. buscar -> busqué/busque, llegar -> llegué, cruzar -> crucé).
  function adjStem(stem, ending, group) {
    const f = ending[0];
    if (group === "ar") {
      if (/[eé]/.test(f)) {
        if (stem.endsWith("z")) return stem.slice(0, -1) + "c";
        if (stem.endsWith("g")) return stem.slice(0, -1) + "gu";
        if (stem.endsWith("c")) return stem.slice(0, -1) + "qu";
      }
    } else {
      if (/[aoó]/.test(f)) {
        if (stem.endsWith("gu")) return stem.slice(0, -2) + "g";
        if (stem.endsWith("g")) return stem.slice(0, -1) + "j";
        if (stem.endsWith("c")) return stem.slice(0, -1) + "z";
      }
    }
    return stem;
  }

  function regularData(verb) {
    const end = verb.slice(-2), stem = verb.slice(0, -2);
    const e = ENDINGS[end] || ENDINGS[end.normalize("NFD").replace(/[\u0300-\u036f]/g, "")];
    if (!e) return null;
    const map = (arr) => arr.map(s => adjStem(stem, s, end) + s);
    return {
      present: map(e.present),
      preterite: map(e.preterite),
      subjunctive: map(e.subjunctive),
      future: ["é","ás","á","emos","éis","án"].map(s => verb + s),
      conditional: e.conditional.map(s => verb + s),
      imperative: e.imperative.map(s => s === "—" ? "—" : adjStem(stem, s, end) + s),
      gerund: stem + e.gerund,
      imperfect: e.imperfect.map(s => stem + s),
      participle: stem + e.participle
    };
  }

  function tensesFrom(d) {
    const haber = ["he","has","ha","hemos","habéis","han"];
    const perfect = haber.map(h => `${h} ${d.participle}`);
    const haberImp = ["había","habías","había","habíamos","habíais","habían"];
    const pluscuam = haberImp.map(h => `${h} ${d.participle}`);
    const estar = ["estoy","estás","está","estamos","estáis","están"];
    const presenteContinuo = estar.map(e => `${e} ${d.gerund}`);
    const perfectoContinuo = haber.map(h => `${h} estado ${d.gerund}`);
    // Imperfecto de subjuntivo: from 3rd-person-plural preterite minus -ron + -ra endings
    const accentLast = (s) => {const m = { a: "á", e: "é", i: "í", o: "ó", u: "ú" };return s.replace(/([aeiou])([^aeiou]*)$/, (mm, v, rest) => m[v] + rest);};
    let impSubj = null;
    const p3 = d.preterite && d.preterite[5];
    if (p3 && p3 !== "—" && /ron$/.test(p3)) {
      const stem = p3.replace(/ron$/, "");
      impSubj = [stem + "ra", stem + "ras", stem + "ra", accentLast(stem) + "ramos", stem + "rais", stem + "ran"];
    }
    const out = [
      { id: "present", label: "Presente", forms: d.present },
      { id: "imperfect", label: "Pretérito imperfecto", forms: d.imperfect },
      { id: "past", label: "Pretérito (indefinido)", forms: d.preterite },
      { id: "perfect", label: "Pretérito perfecto", forms: perfect },
      { id: "pluperfect", label: "Pretérito pluscuamperfecto", forms: pluscuam },
      { id: "future", label: "Futuro", forms: d.future },
      { id: "subjunctive", label: "Subjuntivo (presente)", forms: d.subjunctive },
      { id: "subjunctiveImp", label: "Subjuntivo imperfecto", forms: impSubj || d.subjunctive },
      { id: "conditional", label: "Condicional", forms: d.conditional },
      { id: "imperative", label: "Imperativo", forms: d.imperative },
      { id: "continuous", label: "Presente continuo (gerundio)", forms: presenteContinuo },
      { id: "continuousPerfect", label: "Perfecto continuo (gerundio)", forms: perfectoContinuo }
    ];
    return out;
  }

  const KEYS = ["present","preterite","imperfect","subjunctive","future","conditional","imperative","gerund","participle"];

  function conjugate(input) {
    const verb = clean(input);
    if (!verb) return null;
    const irr = IRR[verb];
    const reg = regularData(verb);
    if (!reg && !irr) return { error: "Spanish verbs end in -ar, -er or -ir. Try e.g. hablar, comer, vivir." };
    let d, isIrr = false;
    if (irr) { isIrr = true; d = Object.assign({}, reg || {}); KEYS.forEach(k => { if (irr[k]) d[k] = irr[k]; }); }
    else d = reg;
    const tenses = tensesFrom(d);
    if (isIrr && reg) { const regT = tensesFrom(reg); tenses.forEach((t, i) => { t.reg = regT[i].forms; }); }
    return { isIrregular: isIrr, infinitive: verb, pronouns: PRON, tenses };
  }

  window.CONJ.es = {
    name: "Español", flag: "🇪🇸", ttsLang: "es-ES",
    placeholder: "p.ej. hablar, comer, vivir…",
    samples: ["hablar", "comer", "vivir", "ser", "tener", "hacer", "ir", "querer", "poder", "venir", "pensar", "dormir"],
    irregulars: Object.keys(IRR),
    conjugate
  };
})();
;
/* Dutch conjugation engine (v2 — partial overrides + regular baseline) */
(function () {
  window.CONJ = window.CONJ || {};
  const PRON = ["ik", "jij", "hij / zij", "wij", "jullie", "zij"];

  // IRR fields: presentFull?, pastSg, pastPl, participle, aux, subj?, imp?
  const IRR = {
    zijn:    { presentFull: ["ben","bent","is","zijn","zijn","zijn"], pastSg: "was", pastPl: "waren", participle: "geweest", aux: "zijn", subj: ["zij","zij","zij","zijn","zijn","zijn"], imp: "wees" },
    hebben:  { presentFull: ["heb","hebt","heeft","hebben","hebben","hebben"], pastSg: "had", pastPl: "hadden", participle: "gehad", aux: "hebben", imp: "heb" },
    worden:  { pastSg: "werd", pastPl: "werden", participle: "geworden", aux: "zijn" },
    gaan:    { presentFull: ["ga","gaat","gaat","gaan","gaan","gaan"], pastSg: "ging", pastPl: "gingen", participle: "gegaan", aux: "zijn", subj: ["ga","ga","ga","gaan","gaan","gaan"], imp: "ga" },
    doen:    { presentFull: ["doe","doet","doet","doen","doen","doen"], pastSg: "deed", pastPl: "deden", participle: "gedaan", aux: "hebben", imp: "doe" },
    zien:    { presentFull: ["zie","ziet","ziet","zien","zien","zien"], pastSg: "zag", pastPl: "zagen", participle: "gezien", aux: "hebben", imp: "zie" },
    komen:   { presentFull: ["kom","komt","komt","komen","komen","komen"], pastSg: "kwam", pastPl: "kwamen", participle: "gekomen", aux: "zijn", imp: "kom" },
    staan:   { presentFull: ["sta","staat","staat","staan","staan","staan"], pastSg: "stond", pastPl: "stonden", participle: "gestaan", aux: "hebben", subj: ["sta","sta","sta","staan","staan","staan"], imp: "sta" },
    geven:   { pastSg: "gaf", pastPl: "gaven", participle: "gegeven", aux: "hebben" },
    nemen:   { pastSg: "nam", pastPl: "namen", participle: "genomen", aux: "hebben" },
    eten:    { pastSg: "at", pastPl: "aten", participle: "gegeten", aux: "hebben" },
    lopen:   { pastSg: "liep", pastPl: "liepen", participle: "gelopen", aux: "zijn" },
    lezen:   { pastSg: "las", pastPl: "lazen", participle: "gelezen", aux: "hebben" },
    vinden:  { pastSg: "vond", pastPl: "vonden", participle: "gevonden", aux: "hebben" },
    blijven: { pastSg: "bleef", pastPl: "bleven", participle: "gebleven", aux: "zijn" },
    schrijven:{ pastSg: "schreef", pastPl: "schreven", participle: "geschreven", aux: "hebben" },
    rijden:  { pastSg: "reed", pastPl: "reden", participle: "gereden", aux: "hebben" },
    drinken: { pastSg: "dronk", pastPl: "dronken", participle: "gedronken", aux: "hebben" },
    zingen:  { pastSg: "zong", pastPl: "zongen", participle: "gezongen", aux: "hebben" },
    zwemmen: { pastSg: "zwom", pastPl: "zwommen", participle: "gezwommen", aux: "hebben" },
    beginnen:{ pastSg: "begon", pastPl: "begonnen", participle: "begonnen", aux: "zijn" },
    brengen: { pastSg: "bracht", pastPl: "brachten", participle: "gebracht", aux: "hebben" },
    denken:  { pastSg: "dacht", pastPl: "dachten", participle: "gedacht", aux: "hebben" },
    kopen:   { pastSg: "kocht", pastPl: "kochten", participle: "gekocht", aux: "hebben" },
    vallen:  { pastSg: "viel", pastPl: "vielen", participle: "gevallen", aux: "zijn" },
    houden:  { pastSg: "hield", pastPl: "hielden", participle: "gehouden", aux: "hebben" },
    laten:   { pastSg: "liet", pastPl: "lieten", participle: "gelaten", aux: "hebben" },
    slapen:  { pastSg: "sliep", pastPl: "sliepen", participle: "geslapen", aux: "hebben" },
    spreken: { pastSg: "sprak", pastPl: "spraken", participle: "gesproken", aux: "hebben" },
    begrijpen:{ pastSg: "begreep", pastPl: "begrepen", participle: "begrepen", aux: "hebben" },
    helpen:  { pastSg: "hielp", pastPl: "hielpen", participle: "geholpen", aux: "hebben" },
    krijgen: { pastSg: "kreeg", pastPl: "kregen", participle: "gekregen", aux: "hebben" },
    roepen:  { pastSg: "riep", pastPl: "riepen", participle: "geroepen", aux: "hebben" },
    sluiten: { pastSg: "sloot", pastPl: "sloten", participle: "gesloten", aux: "hebben" },
    verliezen:{ pastSg: "verloor", pastPl: "verloren", participle: "verloren", aux: "hebben" },
    winnen:  { pastSg: "won", pastPl: "wonnen", participle: "gewonnen", aux: "hebben" },
    dragen:  { pastSg: "droeg", pastPl: "droegen", participle: "gedragen", aux: "hebben" },
    vragen:  { pastSg: "vroeg", pastPl: "vroegen", participle: "gevraagd", aux: "hebben" },
    zeggen:  { pastSg: "zei", pastPl: "zeiden", participle: "gezegd", aux: "hebben" },
    liggen:  { pastSg: "lag", pastPl: "lagen", participle: "gelegen", aux: "hebben" },
    zitten:  { pastSg: "zat", pastPl: "zaten", participle: "gezeten", aux: "hebben" },
    kijken:  { pastSg: "keek", pastPl: "keken", participle: "gekeken", aux: "hebben" },
    vergeten:{ pastSg: "vergat", pastPl: "vergaten", participle: "vergeten", aux: "zijn" },
    trekken: { pastSg: "trok", pastPl: "trokken", participle: "getrokken", aux: "hebben" },
    kunnen:  { presentFull: ["kan","kunt","kan","kunnen","kunnen","kunnen"], pastSg: "kon", pastPl: "konden", participle: "gekund", aux: "hebben", imp: "kun" },
    mogen:   { presentFull: ["mag","mag","mag","mogen","mogen","mogen"], pastSg: "mocht", pastPl: "mochten", participle: "gemogen", aux: "hebben", imp: "mag" },
    moeten:  { presentFull: ["moet","moet","moet","moeten","moeten","moeten"], pastSg: "moest", pastPl: "moesten", participle: "gemoeten", aux: "hebben", imp: "moet" },
    willen:  { presentFull: ["wil","wilt","wil","willen","willen","willen"], pastSg: "wilde", pastPl: "wilden", participle: "gewild", aux: "hebben", imp: "wil" },
    zullen:  { presentFull: ["zal","zult","zal","zullen","zullen","zullen"], pastSg: "zou", pastPl: "zouden", participle: "—", aux: "hebben", imp: "—" },
    weten:   { presentFull: ["weet","weet","weet","weten","weten","weten"], pastSg: "wist", pastPl: "wisten", participle: "geweten", aux: "hebben", imp: "weet" },
    vliegen: { pastSg: "vloog", pastPl: "vlogen", participle: "gevlogen", aux: "zijn" },
    kiezen:  { pastSg: "koos", pastPl: "kozen", participle: "gekozen", aux: "hebben" },
    bieden:  { pastSg: "bood", pastPl: "boden", participle: "geboden", aux: "hebben" },
    genieten:{ pastSg: "genoot", pastPl: "genoten", participle: "genoten", aux: "hebben" },
    schieten:{ pastSg: "schoot", pastPl: "schoten", participle: "geschoten", aux: "hebben" },
    breken:  { pastSg: "brak", pastPl: "braken", participle: "gebroken", aux: "hebben" },
    steken:  { pastSg: "stak", pastPl: "staken", participle: "gestoken", aux: "hebben" },
    stijgen: { pastSg: "steeg", pastPl: "stegen", participle: "gestegen", aux: "zijn" },
    schijnen:{ pastSg: "scheen", pastPl: "schenen", participle: "geschenen", aux: "hebben" },
    verdwijnen:{ pastSg: "verdween", pastPl: "verdwenen", participle: "verdwenen", aux: "zijn" },
    snijden: { pastSg: "sneed", pastPl: "sneden", participle: "gesneden", aux: "hebben" },
    springen:{ pastSg: "sprong", pastPl: "sprongen", participle: "gesprongen", aux: "zijn" },
    sterven: { pastSg: "stierf", pastPl: "stierven", participle: "gestorven", aux: "zijn" },
    zoeken:  { pastSg: "zocht", pastPl: "zochten", participle: "gezocht", aux: "hebben" },
    verkopen:{ pastSg: "verkocht", pastPl: "verkochten", participle: "verkocht", aux: "hebben" },
    lachen:  { pastSg: "lachte", pastPl: "lachten", participle: "gelachen", aux: "hebben" }
  };

  /* ---- C1 expansion ---- */
  Object.assign(IRR, {
    wijzen:   { pastSg: "wees", pastPl: "wezen", participle: "gewezen", aux: "hebben" },
    wegen:    { pastSg: "woog", pastPl: "wogen", participle: "gewogen", aux: "hebben" },
    binden:   { pastSg: "bond", pastPl: "bonden", participle: "gebonden", aux: "hebben" },
    werpen:   { pastSg: "wierp", pastPl: "wierpen", participle: "geworpen", aux: "hebben" },
    treffen:  { pastSg: "trof", pastPl: "troffen", participle: "getroffen", aux: "hebben" },
    vechten:  { pastSg: "vocht", pastPl: "vochten", participle: "gevochten", aux: "hebben" },
    schenken: { pastSg: "schonk", pastPl: "schonken", participle: "geschonken", aux: "hebben" },
    dwingen:  { pastSg: "dwong", pastPl: "dwongen", participle: "gedwongen", aux: "hebben" },
    dringen:  { pastSg: "drong", pastPl: "drongen", participle: "gedrongen", aux: "hebben" },
    klinken:  { pastSg: "klonk", pastPl: "klonken", participle: "geklonken", aux: "hebben" },
    zinken:   { pastSg: "zonk", pastPl: "zonken", participle: "gezonken", aux: "zijn" },
    buigen:   { pastSg: "boog", pastPl: "bogen", participle: "gebogen", aux: "hebben" },
    vriezen:  { pastSg: "vroor", pastPl: "vroren", participle: "gevroren", aux: "hebben" },
    gieten:   { pastSg: "goot", pastPl: "goten", participle: "gegoten", aux: "hebben" },
    fluiten:  { pastSg: "floot", pastPl: "floten", participle: "gefloten", aux: "hebben" },
    ruiken:   { pastSg: "rook", pastPl: "roken", participle: "geroken", aux: "hebben" },
    bijten:   { pastSg: "beet", pastPl: "beten", participle: "gebeten", aux: "hebben" },
    lijden:   { pastSg: "leed", pastPl: "leden", participle: "geleden", aux: "hebben" },
    glijden:  { pastSg: "gleed", pastPl: "gleden", participle: "gegleden", aux: "zijn" },
    prijzen:  { pastSg: "prees", pastPl: "prezen", participle: "geprezen", aux: "hebben" },
    wrijven:  { pastSg: "wreef", pastPl: "wreven", participle: "gewreven", aux: "hebben" },
    blazen:   { pastSg: "blies", pastPl: "bliezen", participle: "geblazen", aux: "hebben" },
    graven:   { pastSg: "groef", pastPl: "groeven", participle: "gegraven", aux: "hebben" },
    genezen:  { pastSg: "genas", pastPl: "genazen", participle: "genezen", aux: "zijn" },
    bedriegen:{ pastSg: "bedroog", pastPl: "bedrogen", participle: "bedrogen", aux: "hebben" },
    verbergen:{ pastSg: "verborg", pastPl: "verborgen", participle: "verborgen", aux: "hebben" },
    scheppen: { pastSg: "schiep", pastPl: "schiepen", participle: "geschapen", aux: "hebben" },
    slaan:    { presentFull: ["sla","slaat","slaat","slaan","slaan","slaan"], pastSg: "sloeg", pastPl: "sloegen", participle: "geslagen", aux: "hebben", imp: "sla" },
    duiken:   { pastSg: "dook", pastPl: "doken", participle: "gedoken", aux: "hebben" },
    spuiten:  { pastSg: "spoot", pastPl: "spoten", participle: "gespoten", aux: "hebben" }
  });
  // inseparable-prefixed strong verbs derived from a base
  function np(base, prefix, over) {
    const b = IRR[base], o = {};
    if (b.presentFull) o.presentFull = b.presentFull.map((x) => x === "—" ? "—" : prefix + x);
    o.pastSg = prefix + b.pastSg;
    o.pastPl = prefix + b.pastPl;
    o.participle = prefix + b.participle.replace(/^ge/, "");
    o.aux = b.aux;
    return Object.assign(o, over || {});
  }
  Object.assign(IRR, {
    verstaan: np("staan", "ver"), bestaan: np("staan", "be"), ontstaan: np("staan", "ont", { aux: "zijn" }),
    ontkomen: np("komen", "ont"),
    vergeven: np("geven", "ver"),
    beschrijven: np("schrijven", "be"),
    verbieden: np("bieden", "ver"),
    besluiten: np("sluiten", "be"),
    verlaten: np("laten", "ver"),
    bevallen: np("vallen", "be", { aux: "zijn" }),
    bewijzen: np("wijzen", "be"),
    bewegen: np("wegen", "be"),
    verbinden: np("binden", "ver"),
    verbreken: np("breken", "ver"), ontbreken: np("breken", "ont"), onderbreken: np("breken", "onder"),
    vertrekken: np("trekken", "ver", { aux: "zijn" }),
    bezitten: np("zitten", "be")
  });

  const KOFSCHIP = ["t", "k", "f", "s", "ch", "p"];
  function clean(v) { return (v || "").trim().toLowerCase(); }

  // Separable prefixes (scheidbare werkwoorden): conjugate the base, then move the prefix to the end.
  const NL_SEP = ["aan","af","bij","in","mee","na","om","onder","op","over","toe","uit","voor","weg","terug","door","samen","neer","tegen","vast","los","klaar","thuis","open","dicht","achteruit","vooruit","binnen","buiten","mis"];
  const NL_SEIN_BASE = ["staan","komen","gaan","lopen","vallen","stijgen","springen","rijden","vliegen","groeien"];
  function nlSplit(verb) {
    for (const p of NL_SEP) {
      if (verb.length > p.length + 2 && verb.startsWith(p)) {
        const base = verb.slice(p.length);
        if ((base.endsWith("en") || base.endsWith("n")) && (IRR[base] || base.length >= 3)) {
          if (IRR[verb]) return null; // inseparable verb already defined as a whole
          return { prefix: p, base };
        }
      }
    }
    return null;
  }
  function nlBaseData(base) {
    const reg = regularData(base);
    const irr = IRR[base];
    if (!irr) return { data: reg, isIrr: false };
    return { data: {
      present: irr.presentFull || reg.present,
      past: [irr.pastSg, irr.pastSg, irr.pastSg, irr.pastPl, irr.pastPl, irr.pastPl],
      subjunctive: irr.subj || reg.subjunctive,
      imperative: ["—", (irr.imp != null ? irr.imp : reg.imperative[1]), (irr.imp != null ? irr.imp : reg.imperative[1]), "laten we " + base, (irr.presentFull ? irr.presentFull[4] : reg.imperative[4]), (irr.imp != null ? irr.imp : reg.imperative[1]) + " u"],
      participle: irr.participle,
      aux: irr.aux || "hebben"
    }, isIrr: true };
  }
  function nlSeparableTenses(verb, prefix, base) {
    const { data, isIrr } = nlBaseData(base);
    const aux = (NL_SEIN_BASE.indexOf(base) >= 0) ? "zijn" : data.aux;
    const suf = (arr) => arr.map((f) => f === "—" ? "—" : `${f} … ${prefix}`);
    const imp = data.imperative.map((f) => f === "—" ? "—" : (f.indexOf(" ") >= 0 ? f.replace("laten we " + base, "laten we " + verb) : `${f} … ${prefix}`));
    const part = data.participle === "—" ? "—" : prefix + data.participle; // opgestaan, meegenomen
    const dataS = { present: suf(data.present), past: suf(data.past), subjunctive: suf(data.subjunctive), imperative: imp, participle: part, aux };
    const tenses = buildTenses(verb, dataS);
    if (isIrr) {
      const regBase = regularData(base);
      const regS = { present: suf(regBase.present), past: suf(regBase.past), subjunctive: suf(regBase.subjunctive), imperative: imp, participle: prefix + regBase.participle, aux };
      const regT = buildTenses(verb, regS);
      tenses.forEach((t, i) => { t.reg = regT[i].forms; });
    }
    return tenses;
  }

  function stemOf(verb) {
    let stem = verb.endsWith("en") ? verb.slice(0, -2) : verb.replace(/n$/, "");
    if (/([bcdfghklmnprst])\1$/.test(stem)) {
      stem = stem.slice(0, -1); // double consonant => short vowel, do NOT lengthen
    } else if (/[^aeiou][aeiou][^aeiou]$/.test(stem)) {
      const v = stem[stem.length - 2]; stem = stem.slice(0, -1) + v + stem.slice(-1);
    }
    stem = stem.replace(/v$/, "f").replace(/z$/, "s");
    return stem;
  }

  function regularData(verb) {
    const stem = stemOf(verb);
    const lastSound = /ch$/.test(stem) ? "ch" : stem.slice(-1);
    const voiceless = KOFSCHIP.includes(lastSound);
    const t = voiceless ? "t" : "d";
    const pastSing = stem + t + "e";
    const pastPlur = stem + t + "en";
    const stT = stem.endsWith("t") ? stem : stem + "t";
    return {
      present: [stem, stT, stT, verb, verb, verb],
      past: [pastSing, pastSing, pastSing, pastPlur, pastPlur, pastPlur],
      subjunctive: [stem + "e", stem + "e", stem + "e", verb, verb, verb],
      imperative: ["—", stem, stem, "laten we " + verb, stT, stT + " u"],
      participle: "ge" + stem + t,
      aux: "hebben"
    };
  }

  function buildTenses(verb, data) {
    const auxPres = data.aux === "zijn"
      ? ["ben","bent","is","zijn","zijn","zijn"]
      : ["heb","hebt","heeft","hebben","hebben","hebben"];
    const perfect = data.participle === "—" ? PRON.map(() => "—") : auxPres.map(a => `${a} ${data.participle}`);
    const auxPast = data.aux === "zijn"
      ? ["was","was","was","waren","waren","waren"]
      : ["had","had","had","hadden","hadden","hadden"];
    const pluperfect = data.participle === "—" ? PRON.map(() => "—") : auxPast.map(a => `${a} ${data.participle}`);
    const zullen = ["zal","zult","zal","zullen","zullen","zullen"];
    const future = zullen.map(z => `${z} ${verb}`);
    const zou = ["zou","zou","zou","zouden","zouden","zouden"];
    const conditional = zou.map(z => `${z} ${verb}`);
    const gerund = verb + "d";
    return [
      { id: "present", label: "Tegenwoordige tijd", forms: data.present },
      { id: "past", label: "Verleden tijd", forms: data.past },
      { id: "perfect", label: "Voltooid tegenwoordige tijd", forms: perfect },
      { id: "pluperfect", label: "Voltooid verleden tijd", forms: pluperfect },
      { id: "future", label: "Toekomende tijd", forms: future },
      { id: "subjunctive", label: "Aanvoegende wijs", forms: data.subjunctive },
      { id: "conditional", label: "Voorwaardelijke wijs", forms: conditional },
      { id: "imperative", label: "Gebiedende wijs", forms: data.imperative },
      { id: "gerund", label: "Onvoltooid deelwoord", forms: PRON.map(() => gerund), nonFinite: true }
    ];
  }

  function conjugate(input) {
    const verb = clean(input);
    if (!verb) return null;
    if (!verb.endsWith("en") && !verb.endsWith("n")) {
      return { error: "Dutch verbs end in -en. Try e.g. werken, maken, lopen." };
    }
    const reg = regularData(verb);
    const sep = nlSplit(verb);
    if (sep) {
      const tenses = nlSeparableTenses(verb, sep.prefix, sep.base);
      return { isIrregular: !!IRR[sep.base], infinitive: verb, pronouns: PRON, tenses, separable: true };
    }
    const irr = IRR[verb];
    let data = reg, isIrr = false;
    if (irr) {
      isIrr = true;
      const impForm = irr.imp != null ? irr.imp : reg.imperative[1];
      data = {
        present: irr.presentFull || reg.present,
        past: [irr.pastSg, irr.pastSg, irr.pastSg, irr.pastPl, irr.pastPl, irr.pastPl],
        subjunctive: irr.subj || reg.subjunctive,
        imperative: ["—", impForm, impForm, "laten we " + verb, (irr.presentFull ? irr.presentFull[4] : reg.imperative[4]), impForm + " u"],
        participle: irr.participle,
        aux: irr.aux || "hebben"
      };
    }
    const tenses = buildTenses(verb, data);
    if (isIrr) { const regT = buildTenses(verb, reg); tenses.forEach((t, i) => { t.reg = regT[i].forms; }); }
    return { isIrregular: isIrr, infinitive: verb, pronouns: PRON, tenses };
  }

  window.CONJ.nl = {
    name: "Nederlands", flag: "🇳🇱", ttsLang: "nl-NL",
    placeholder: "bijv. werken, maken, lopen…",
    samples: ["werken", "maken", "lopen", "zijn", "hebben", "gaan", "zien", "eten", "geven", "komen", "denken", "blijven"],
    irregulars: Object.keys(IRR),
    conjugate
  };
})();
;
/* French conjugation engine (generator from present + future stem) */
(function () {
  window.CONJ = window.CONJ || {};
  const PRON = ["je", "tu", "il / elle", "nous", "vous", "ils / elles"];

  const E_IMPARF = ["ais", "ais", "ait", "ions", "iez", "aient"];
  const E_FUT = ["ai", "as", "a", "ons", "ez", "ont"];
  const E_COND = ["ais", "ais", "ait", "ions", "iez", "aient"];
  function auxPresent(aux) { return aux === "être" ? ["suis","es","est","sommes","êtes","sont"] : ["ai","as","a","avons","avez","ont"]; }

  // IRR fields: present[6] (required), futStem, pp, aux, subj?, imp?, pprStem?, imparfait?, ppr?, erType?
  const IRR = {
    être:   { present: ["suis","es","est","sommes","êtes","sont"], futStem: "ser", pp: "été", aux: "avoir", subj: ["sois","sois","soit","soyons","soyez","soient"], imp: ["—","sois","—","soyons","soyez","—"], pprStem: "ét" },
    avoir:  { present: ["ai","as","a","avons","avez","ont"], futStem: "aur", pp: "eu", aux: "avoir", subj: ["aie","aies","ait","ayons","ayez","aient"], imp: ["—","aie","—","ayons","ayez","—"] },
    aller:  { present: ["vais","vas","va","allons","allez","vont"], futStem: "ir", pp: "allé", aux: "être", subj: ["aille","ailles","aille","allions","alliez","aillent"], imp: ["—","va","—","allons","allez","—"] },
    faire:  { present: ["fais","fais","fait","faisons","faites","font"], futStem: "fer", pp: "fait", aux: "avoir", subj: ["fasse","fasses","fasse","fassions","fassiez","fassent"], pprStem: "fais" },
    dire:   { present: ["dis","dis","dit","disons","dites","disent"], futStem: "dir", pp: "dit", aux: "avoir" },
    pouvoir:{ present: ["peux","peux","peut","pouvons","pouvez","peuvent"], futStem: "pourr", pp: "pu", aux: "avoir", subj: ["puisse","puisses","puisse","puissions","puissiez","puissent"], imp: ["—","—","—","—","—","—"] },
    vouloir:{ present: ["veux","veux","veut","voulons","voulez","veulent"], futStem: "voudr", pp: "voulu", aux: "avoir", subj: ["veuille","veuilles","veuille","voulions","vouliez","veuillent"], imp: ["—","veuille","—","voulons","veuillez","—"] },
    voir:   { present: ["vois","vois","voit","voyons","voyez","voient"], futStem: "verr", pp: "vu", aux: "avoir" },
    savoir: { present: ["sais","sais","sait","savons","savez","savent"], futStem: "saur", pp: "su", aux: "avoir", subj: ["sache","saches","sache","sachions","sachiez","sachent"], imp: ["—","sache","—","sachons","sachez","—"] },
    venir:  { present: ["viens","viens","vient","venons","venez","viennent"], futStem: "viendr", pp: "venu", aux: "être" },
    devenir:{ present: ["deviens","deviens","devient","devenons","devenez","deviennent"], futStem: "deviendr", pp: "devenu", aux: "être" },
    tenir:  { present: ["tiens","tiens","tient","tenons","tenez","tiennent"], futStem: "tiendr", pp: "tenu", aux: "avoir" },
    prendre:{ present: ["prends","prends","prend","prenons","prenez","prennent"], futStem: "prendr", pp: "pris", aux: "avoir", subj: ["prenne","prennes","prenne","prenions","preniez","prennent"] },
    devoir: { present: ["dois","dois","doit","devons","devez","doivent"], futStem: "devr", pp: "dû", aux: "avoir", subj: ["doive","doives","doive","devions","deviez","doivent"] },
    boire:  { present: ["bois","bois","boit","buvons","buvez","boivent"], futStem: "boir", pp: "bu", aux: "avoir", subj: ["boive","boives","boive","buvions","buviez","boivent"], pprStem: "buv" },
    mettre: { present: ["mets","mets","met","mettons","mettez","mettent"], futStem: "mettr", pp: "mis", aux: "avoir" },
    partir: { present: ["pars","pars","part","partons","partez","partent"], futStem: "partir", pp: "parti", aux: "être" },
    sortir: { present: ["sors","sors","sort","sortons","sortez","sortent"], futStem: "sortir", pp: "sorti", aux: "être" },
    dormir: { present: ["dors","dors","dort","dormons","dormez","dorment"], futStem: "dormir", pp: "dormi", aux: "avoir" },
    sentir: { present: ["sens","sens","sent","sentons","sentez","sentent"], futStem: "sentir", pp: "senti", aux: "avoir" },
    lire:   { present: ["lis","lis","lit","lisons","lisez","lisent"], futStem: "lir", pp: "lu", aux: "avoir" },
    écrire: { present: ["écris","écris","écrit","écrivons","écrivez","écrivent"], futStem: "écrir", pp: "écrit", aux: "avoir" },
    connaître:{ present: ["connais","connais","connaît","connaissons","connaissez","connaissent"], futStem: "connaîtr", pp: "connu", aux: "avoir" },
    conduire: { present: ["conduis","conduis","conduit","conduisons","conduisez","conduisent"], futStem: "conduir", pp: "conduit", aux: "avoir" },
    comprendre:{ present: ["comprends","comprends","comprend","comprenons","comprenez","comprennent"], futStem: "comprendr", pp: "compris", aux: "avoir", subj: ["comprenne","comprennes","comprenne","comprenions","compreniez","comprennent"] },
    apprendre:{ present: ["apprends","apprends","apprend","apprenons","apprenez","apprennent"], futStem: "apprendr", pp: "appris", aux: "avoir", subj: ["apprenne","apprennes","apprenne","apprenions","appreniez","apprennent"] },
    battre:  { present: ["bats","bats","bat","battons","battez","battent"], futStem: "battr", pp: "battu", aux: "avoir" },
    naître:  { present: ["nais","nais","naît","naissons","naissez","naissent"], futStem: "naîtr", pp: "né", aux: "être" },
    plaire:  { present: ["plais","plais","plaît","plaisons","plaisez","plaisent"], futStem: "plair", pp: "plu", aux: "avoir" },
    rire:    { present: ["ris","ris","rit","rions","riez","rient"], futStem: "rir", pp: "ri", aux: "avoir" },
    craindre:{ present: ["crains","crains","craint","craignons","craignez","craignent"], futStem: "craindr", pp: "craint", aux: "avoir", subj: ["craigne","craignes","craigne","craignions","craigniez","craignent"] },
    servir:  { present: ["sers","sers","sert","servons","servez","servent"], futStem: "servir", pp: "servi", aux: "avoir" },
    mentir:  { present: ["mens","mens","ment","mentons","mentez","mentent"], futStem: "mentir", pp: "menti", aux: "avoir" },
    souffrir:{ present: ["souffre","souffres","souffre","souffrons","souffrez","souffrent"], futStem: "souffrir", pp: "souffert", aux: "avoir", erType: true },
    découvrir:{ present: ["découvre","découvres","découvre","découvrons","découvrez","découvrent"], futStem: "découvrir", pp: "découvert", aux: "avoir", erType: true },
    revenir: { present: ["reviens","reviens","revient","revenons","revenez","reviennent"], futStem: "reviendr", pp: "revenu", aux: "être" },
    valoir:  { present: ["vaux","vaux","vaut","valons","valez","valent"], futStem: "vaudr", pp: "valu", aux: "avoir", subj: ["vaille","vailles","vaille","valions","valiez","vaillent"] },
    jeter:   { present: ["jette","jettes","jette","jetons","jetez","jettent"], imparfait: ["jetais","jetais","jetait","jetions","jetiez","jetaient"], futStem: "jetter", pp: "jeté", aux: "avoir", subj: ["jette","jettes","jette","jetions","jetiez","jettent"], ppr: "jetant", erType: true },
    préférer:{ present: ["préfère","préfères","préfère","préférons","préférez","préfèrent"], imparfait: ["préférais","préférais","préférait","préférions","préfériez","préféraient"], futStem: "préférer", pp: "préféré", aux: "avoir", subj: ["préfère","préfères","préfère","préférions","préfériez","préfèrent"], ppr: "préférant", erType: true },
    croire: { present: ["crois","crois","croit","croyons","croyez","croient"], futStem: "croir", pp: "cru", aux: "avoir" },
    recevoir:{ present: ["reçois","reçois","reçoit","recevons","recevez","reçoivent"], futStem: "recevr", pp: "reçu", aux: "avoir", subj: ["reçoive","reçoives","reçoive","recevions","receviez","reçoivent"] },
    vivre:  { present: ["vis","vis","vit","vivons","vivez","vivent"], futStem: "vivr", pp: "vécu", aux: "avoir" },
    suivre: { present: ["suis","suis","suit","suivons","suivez","suivent"], futStem: "suivr", pp: "suivi", aux: "avoir" },
    ouvrir: { present: ["ouvre","ouvres","ouvre","ouvrons","ouvrez","ouvrent"], futStem: "ouvrir", pp: "ouvert", aux: "avoir", erType: true },
    offrir: { present: ["offre","offres","offre","offrons","offrez","offrent"], futStem: "offrir", pp: "offert", aux: "avoir", erType: true },
    courir: { present: ["cours","cours","court","courons","courez","courent"], futStem: "courr", pp: "couru", aux: "avoir" },
    mourir: { present: ["meurs","meurs","meurt","mourons","mourez","meurent"], futStem: "mourr", pp: "mort", aux: "être" },
    manger: { present: ["mange","manges","mange","mangeons","mangez","mangent"], imparfait: ["mangeais","mangeais","mangeait","mangions","mangiez","mangeaient"], futStem: "manger", pp: "mangé", aux: "avoir", subj: ["mange","manges","mange","mangions","mangiez","mangent"], ppr: "mangeant", erType: true },
    commencer:{ present: ["commence","commences","commence","commençons","commencez","commencent"], imparfait: ["commençais","commençais","commençait","commencions","commenciez","commençaient"], futStem: "commencer", pp: "commencé", aux: "avoir", subj: ["commence","commences","commence","commencions","commenciez","commencent"], ppr: "commençant", erType: true },
    appeler:{ present: ["appelle","appelles","appelle","appelons","appelez","appellent"], imparfait: ["appelais","appelais","appelait","appelions","appeliez","appelaient"], futStem: "appeller", pp: "appelé", aux: "avoir", subj: ["appelle","appelles","appelle","appelions","appeliez","appellent"], ppr: "appelant", erType: true },
    acheter:{ present: ["achète","achètes","achète","achetons","achetez","achètent"], imparfait: ["achetais","achetais","achetait","achetions","achetiez","achetaient"], futStem: "achèter", pp: "acheté", aux: "avoir", subj: ["achète","achètes","achète","achetions","achetiez","achètent"], ppr: "achetant", erType: true },
    payer:  { present: ["paie","paies","paie","payons","payez","paient"], imparfait: ["payais","payais","payait","payions","payiez","payaient"], futStem: "paier", pp: "payé", aux: "avoir", subj: ["paie","paies","paie","payions","payiez","paient"], ppr: "payant", erType: true },
    envoyer:{ present: ["envoie","envoies","envoie","envoyons","envoyez","envoient"], imparfait: ["envoyais","envoyais","envoyait","envoyions","envoyiez","envoyaient"], futStem: "enverr", pp: "envoyé", aux: "avoir", subj: ["envoie","envoies","envoie","envoyions","envoyiez","envoient"], ppr: "envoyant", erType: true }
  };

  /* ---- C1 expansion: derive new irregulars from verified patterns (no hand-typing of full tables) ---- */
  function pfx(base, prefix, over) {
    const b = IRR[base], out = {};
    for (const k in b) {
      const v = b[k];
      if (Array.isArray(v)) out[k] = v.map((x) => x === "—" ? "—" : prefix + x);
      else if (k === "futStem" || k === "pp" || k === "pprStem" || k === "ppr") out[k] = prefix + v;
      else out[k] = v;
    }
    return Object.assign(out, over || {});
  }
  function uire(inf) { const s = inf.slice(0, -4); /* drop 'uire' */ const st = s + "ui"; return { present: [st + "s", st + "s", st + "t", st + "sons", st + "sez", st + "sent"], futStem: inf.slice(0, -1), pp: st + "t", aux: "avoir", pprStem: st + "s" }; }
  function cevoir(inf) { const s = inf.slice(0, -6); return { present: [s + "çois", s + "çois", s + "çoit", s + "cevons", s + "cevez", s + "çoivent"], futStem: s + "cevr", pp: s + "çu", aux: "avoir", subj: [s + "çoive", s + "çoives", s + "çoive", s + "cevions", s + "ceviez", s + "çoivent"], pprStem: s + "cev" }; }
  function ndre(inf) { const s = inf.slice(0, -5); /* drop 'indre' */ return { present: [s + "ins", s + "ins", s + "int", s + "ignons", s + "ignez", s + "ignent"], futStem: inf.slice(0, -1), pp: s + "int", aux: "avoir", subj: [s + "igne", s + "ignes", s + "igne", s + "ignions", s + "igniez", s + "ignent"], pprStem: s + "ign" }; }
  function crire(inf) { const s = inf.slice(0, -5); /* drop 'crire' */ return { present: [s + "cris", s + "cris", s + "crit", s + "crivons", s + "crivez", s + "crivent"], futStem: s + "crir", pp: s + "crit", aux: "avoir", pprStem: s + "criv" }; }

  Object.assign(IRR, {
    // mettre family (pp -mis)
    permettre: pfx("mettre", "per"), promettre: pfx("mettre", "pro"), remettre: pfx("mettre", "re"), admettre: pfx("mettre", "ad"), soumettre: pfx("mettre", "sou"), transmettre: pfx("mettre", "trans"), commettre: pfx("mettre", "com"), émettre: pfx("mettre", "é"),
    // prendre family (pp -pris)
    reprendre: pfx("prendre", "re"), surprendre: pfx("prendre", "sur"), entreprendre: pfx("prendre", "entre"),
    // tenir family (aux avoir)
    obtenir: pfx("tenir", "ob"), retenir: pfx("tenir", "re"), maintenir: pfx("tenir", "main"), contenir: pfx("tenir", "con"), appartenir: pfx("tenir", "appar"), soutenir: pfx("tenir", "sou"), entretenir: pfx("tenir", "entre"),
    // venir family (aux varies)
    parvenir: pfx("venir", "par"), intervenir: pfx("venir", "inter"), survenir: pfx("venir", "sur"), convenir: pfx("venir", "con", { aux: "avoir" }), prévenir: pfx("venir", "pré", { aux: "avoir" }),
    // others by prefix
    repartir: pfx("partir", "re"), ressentir: pfx("sentir", "res"), consentir: pfx("sentir", "con"), desservir: pfx("servir", "des"), parcourir: pfx("courir", "par"), secourir: pfx("courir", "se"), endormir: pfx("dormir", "en"),
    rouvrir: pfx("ouvrir", "r"), couvrir: pfx("ouvrir", "c"),
    décrire: crire("décrire"), inscrire: crire("inscrire"), prescrire: crire("prescrire"),
    reconnaître: pfx("connaître", "re"), relire: pfx("lire", "re"), élire: pfx("lire", "é"), sourire: pfx("rire", "sou"),
    survivre: pfx("vivre", "sur"), poursuivre: pfx("suivre", "pour"),
    combattre: pfx("battre", "com"), abattre: pfx("battre", "a"), débattre: pfx("battre", "dé"),
    déplaire: pfx("plaire", "dé"),
    // -uire family
    produire: uire("produire"), traduire: uire("traduire"), construire: uire("construire"), détruire: uire("détruire"), réduire: uire("réduire"), introduire: uire("introduire"), séduire: uire("séduire"), instruire: uire("instruire"), cuire: uire("cuire"),
    // -cevoir family
    apercevoir: cevoir("apercevoir"), concevoir: cevoir("concevoir"), décevoir: cevoir("décevoir"), percevoir: cevoir("percevoir"),
    // -aindre / -eindre / -oindre family
    peindre: ndre("peindre"), éteindre: ndre("éteindre"), atteindre: ndre("atteindre"), joindre: ndre("joindre"), rejoindre: ndre("rejoindre"), plaindre: ndre("plaindre"), contraindre: ndre("contraindre"),
    // standalone
    fuir: { present: ["fuis","fuis","fuit","fuyons","fuyez","fuient"], futStem: "fuir", pp: "fui", aux: "avoir", pprStem: "fuy" },
    conclure: { present: ["conclus","conclus","conclut","concluons","concluez","concluent"], futStem: "conclur", pp: "conclu", aux: "avoir" },
    accueillir: { present: ["accueille","accueilles","accueille","accueillons","accueillez","accueillent"], futStem: "accueiller", pp: "accueilli", aux: "avoir", pprStem: "accueill", erType: true },
    cueillir: { present: ["cueille","cueilles","cueille","cueillons","cueillez","cueillent"], futStem: "cueiller", pp: "cueilli", aux: "avoir", pprStem: "cueill", erType: true }
  });

  function clean(v) { v = (v || "").trim().toLowerCase(); if (v.startsWith("se ")) v = v.slice(3); if (v.startsWith("s'")) v = v.slice(2); return v; }

  function regularData(verb) {
    if (verb.endsWith("er")) {
      const stem = verb.slice(0, -2);
      const isG = /g$/.test(stem), isC = /c$/.test(stem);
      const sft = (e) => { if (/^[ao]/.test(e)) { if (isG) return stem + "e" + e; if (isC) return stem.slice(0, -1) + "ç" + e; } return stem + e; };
      return {
        present: [sft("e"), sft("es"), sft("e"), sft("ons"), sft("ez"), sft("ent")],
        imparfait: E_IMPARF.map(e => sft(e)),
        subj: [stem + "e", stem + "es", stem + "e", stem + "ions", stem + "iez", stem + "ent"],
        ppr: sft("ant"),
        futStem: verb, pp: stem + "é", aux: "avoir", erType: true
      };
    }
    if (verb.endsWith("ir")) {
      const stem = verb.slice(0, -2);
      return {
        present: [stem + "is", stem + "is", stem + "it", stem + "issons", stem + "issez", stem + "issent"],
        imparfait: E_IMPARF.map(e => stem + "iss" + e),
        subj: [stem + "isse", stem + "isses", stem + "isse", stem + "issions", stem + "issiez", stem + "issent"],
        ppr: stem + "issant",
        futStem: verb, pp: stem + "i", aux: "avoir"
      };
    }
    if (verb.endsWith("re")) {
      const stem = verb.slice(0, -2);
      return {
        present: [stem + "s", stem + "s", stem, stem + "ons", stem + "ez", stem + "ent"],
        imparfait: E_IMPARF.map(e => stem + e),
        subj: [stem + "e", stem + "es", stem + "e", stem + "ions", stem + "iez", stem + "ent"],
        ppr: stem + "ant",
        futStem: verb.slice(0, -1), pp: stem + "u", aux: "avoir"
      };
    }
    return null;
  }

  function build(verb, data) {
    const present = data.present;
    const impStem = data.pprStem != null ? data.pprStem : present[3].replace(/ons$/, "");
    const imparfait = data.imparfait || E_IMPARF.map(e => impStem + e);
    const futur = E_FUT.map(e => data.futStem + e);
    const conditionnel = E_COND.map(e => data.futStem + e);
    let subj = data.subj;
    if (!subj) { const ss = present[5].replace(/ent$/, ""); subj = [ss + "e", ss + "es", ss + "e", impStem + "ions", impStem + "iez", ss + "ent"]; }
    const pc = auxPresent(data.aux).map(a => data.pp === "—" ? "—" : `${a} ${data.pp}`);
    const auxImp = data.aux === "être"
      ? ["étais","étais","était","étions","étiez","étaient"]
      : ["avais","avais","avait","avions","aviez","avaient"];
    const pqp = auxImp.map(a => data.pp === "—" ? "—" : `${a} ${data.pp}`);
    const auxCond = data.aux === "être"
      ? ["serais","serais","serait","serions","seriez","seraient"]
      : ["aurais","aurais","aurait","aurions","auriez","auraient"];
    const condPasse = auxCond.map(a => data.pp === "—" ? "—" : `${a} ${data.pp}`);
    const ppr = data.ppr || (impStem + "ant");
    let imp = data.imp;
    if (!imp) { let tu = present[1]; if (data.erType) tu = tu.replace(/s$/, ""); imp = ["—", tu, "—", present[3], present[4], "—"]; }
    return [
      { id: "present", label: "Présent", forms: present },
      { id: "past", label: "Imparfait", forms: imparfait },
      { id: "perfect", label: "Passé composé", forms: pc },
      { id: "pluperfect", label: "Plus-que-parfait", forms: pqp },
      { id: "future", label: "Futur simple", forms: futur },
      { id: "subjunctive", label: "Subjonctif", forms: subj },
      { id: "conditional", label: "Conditionnel", forms: conditionnel },
      { id: "conditionalPast", label: "Conditionnel passé", forms: condPasse },
      { id: "imperative", label: "Impératif", forms: imp },
      { id: "gerund", label: "Participe présent", forms: PRON.map(() => ppr), nonFinite: true }
    ];
  }

  function conjugate(input) {
    const verb = clean(input);
    if (!verb) return null;
    const reg = regularData(verb);
    if (!reg) return { error: "French verbs end in -er, -ir or -re. Try e.g. parler, finir, vendre." };
    const irr = IRR[verb];
    let data = reg, isIrr = false;
    if (irr) { isIrr = true; data = Object.assign({}, irr); }
    const tenses = build(verb, data);
    if (isIrr) { const regT = build(verb, reg); tenses.forEach((t, i) => { t.reg = regT[i].forms; }); }
    return { isIrregular: isIrr, infinitive: verb, pronouns: PRON, tenses };
  }

  window.CONJ.fr = {
    name: "Français", flag: "🇫🇷", ttsLang: "fr-FR",
    placeholder: "p.ex. parler, finir, vendre…",
    samples: ["parler", "finir", "vendre", "être", "avoir", "aller", "faire", "venir", "prendre", "voir", "pouvoir", "manger"],
    irregulars: Object.keys(IRR),
    conjugate
  };
})();
;
/* Verb meanings (English glosses) */
(function () {
  window.TRANS = {
    de: {
      machen: "to do / make", gehen: "to go", sein: "to be", haben: "to have", werden: "to become",
      kommen: "to come", sehen: "to see", essen: "to eat", fahren: "to drive / go", geben: "to give",
      nehmen: "to take", finden: "to find", sprechen: "to speak", lesen: "to read", schlafen: "to sleep",
      trinken: "to drink", fliegen: "to fly", laufen: "to run / walk", helfen: "to help", treffen: "to meet",
      denken: "to think", bringen: "to bring", wissen: "to know", kennen: "to know (be acquainted)", stehen: "to stand",
      verstehen: "to understand", beginnen: "to begin", bleiben: "to stay", schreiben: "to write", fallen: "to fall",
      halten: "to hold", lassen: "to let", rufen: "to call", schwimmen: "to swim", singen: "to sing",
      sitzen: "to sit", liegen: "to lie", ziehen: "to pull", tragen: "to carry / wear", waschen: "to wash",
      werfen: "to throw", gewinnen: "to win", vergessen: "to forget", verlieren: "to lose", bitten: "to ask / request",
      gefallen: "to please", mögen: "to like", müssen: "to have to", können: "can / to be able", wollen: "to want",
      sollen: "should / ought", dürfen: "to be allowed", arbeiten: "to work", spielen: "to play", lieben: "to love",
      lernen: "to learn", kaufen: "to buy", wohnen: "to live / reside", sagen: "to say", fragen: "to ask",
      suchen: "to search", brauchen: "to need", hören: "to hear", öffnen: "to open", reden: "to talk",
      bekommen: "to get / receive", schlagen: "to hit / beat", wachsen: "to grow", schließen: "to close", genießen: "to enjoy",
      steigen: "to climb / rise", scheinen: "to shine / seem", bieten: "to offer", fangen: "to catch", empfehlen: "to recommend",
      sterben: "to die", brechen: "to break", schneiden: "to cut", greifen: "to grab", riechen: "to smell"
    },
    es: {
      hablar: "to speak", comer: "to eat", vivir: "to live", ser: "to be", estar: "to be (state)",
      haber: "to have (aux)", tener: "to have", hacer: "to do / make", ir: "to go", decir: "to say",
      poder: "to be able", querer: "to want / love", ver: "to see", dar: "to give", saber: "to know",
      poner: "to put", salir: "to go out", venir: "to come", traer: "to bring", conocer: "to know",
      dormir: "to sleep", pedir: "to ask for", sentir: "to feel", pensar: "to think", volver: "to return",
      contar: "to count / tell", jugar: "to play", empezar: "to begin", perder: "to lose", seguir: "to follow",
      servir: "to serve", leer: "to read", oír: "to hear", caer: "to fall", morir: "to die",
      trabajar: "to work", estudiar: "to study", amar: "to love", comprar: "to buy", llegar: "to arrive",
      llamar: "to call", mirar: "to look", escribir: "to write", beber: "to drink", correr: "to run",
      abrir: "to open", gustar: "to like", entender: "to understand", buscar: "to search", necesitar: "to need",
      encontrar: "to find", mostrar: "to show", recordar: "to remember", costar: "to cost", cerrar: "to close",
      comenzar: "to begin", preferir: "to prefer", repetir: "to repeat", llegar: "to arrive", pagar: "to pay",
      parecer: "to seem", ofrecer: "to offer", producir: "to produce", construir: "to build", incluir: "to include",
      oler: "to smell", soñar: "to dream", almorzar: "to have lunch", probar: "to try", mover: "to move",
      elegir: "to choose", mentir: "to lie", andar: "to walk", caber: "to fit", valer: "to be worth", reír: "to laugh"
    },
    nl: {
      werken: "to work", maken: "to make", lopen: "to walk / run", zijn: "to be", hebben: "to have",
      gaan: "to go", zien: "to see", eten: "to eat", geven: "to give", komen: "to come",
      denken: "to think", blijven: "to stay", worden: "to become", doen: "to do", staan: "to stand",
      nemen: "to take", lezen: "to read", vinden: "to find", schrijven: "to write", rijden: "to ride / drive",
      drinken: "to drink", zingen: "to sing", zwemmen: "to swim", beginnen: "to begin", brengen: "to bring",
      kopen: "to buy", vallen: "to fall", houden: "to hold / keep", laten: "to let", slapen: "to sleep",
      spreken: "to speak", begrijpen: "to understand", helpen: "to help", krijgen: "to get", roepen: "to call",
      sluiten: "to close", verliezen: "to lose", winnen: "to win", dragen: "to carry / wear", vragen: "to ask",
      zeggen: "to say", liggen: "to lie", zitten: "to sit", kijken: "to look", vergeten: "to forget",
      trekken: "to pull", kunnen: "can / to be able", mogen: "to be allowed", moeten: "to have to", willen: "to want",
      zullen: "will (aux)", weten: "to know", spelen: "to play", wonen: "to live", leren: "to learn", kennen: "to know",
      vliegen: "to fly", kiezen: "to choose", bieden: "to offer", genieten: "to enjoy", schieten: "to shoot",
      breken: "to break", steken: "to sting", stijgen: "to rise", schijnen: "to shine", verdwijnen: "to disappear",
      snijden: "to cut", springen: "to jump", sterven: "to die", zoeken: "to search", verkopen: "to sell", lachen: "to laugh"
    },
    fr: {
      parler: "to speak", finir: "to finish", vendre: "to sell", être: "to be", avoir: "to have",
      aller: "to go", faire: "to do / make", dire: "to say", pouvoir: "to be able", vouloir: "to want",
      voir: "to see", savoir: "to know", venir: "to come", devenir: "to become", tenir: "to hold",
      prendre: "to take", devoir: "to have to", boire: "to drink", mettre: "to put", partir: "to leave",
      sortir: "to go out", dormir: "to sleep", sentir: "to feel", lire: "to read", écrire: "to write",
      connaître: "to know", croire: "to believe", recevoir: "to receive", vivre: "to live", suivre: "to follow",
      ouvrir: "to open", offrir: "to offer", courir: "to run", mourir: "to die", manger: "to eat",
      commencer: "to begin", appeler: "to call", acheter: "to buy", payer: "to pay", envoyer: "to send",
      aimer: "to love / like", donner: "to give", trouver: "to find", demander: "to ask", regarder: "to watch",
      travailler: "to work", jouer: "to play", écouter: "to listen", chanter: "to sing", habiter: "to live",
      comprendre: "to understand", apprendre: "to learn", battre: "to beat", naître: "to be born", plaire: "to please",
      rire: "to laugh", craindre: "to fear", servir: "to serve", mentir: "to lie", souffrir: "to suffer",
      découvrir: "to discover", revenir: "to come back", valoir: "to be worth", jeter: "to throw", préférer: "to prefer"
    }
  };

  window.lookupMeaning = function (lang, verb) {
    const v = (verb || "").trim().toLowerCase();
    const d = window.TRANS[lang];
    return d && d[v] ? d[v] : null;
  };
})();
;
/* UI string localization — drives buttons & instructions by mother tongue.
   Only the 5 app languages are localized; any other mother tongue falls back to English. */
(function () {
  window.UI = {
    en: {
      tagline: "conjugate · quiz · learn", hi: "Hi, {name} 👋", ready: "Ready when you are, {name}",
      cj_acc: "Create account", cj_later: "Later", cj_reorder_head: "Arrange the tiles your way", cj_reorder_text: "Drag your favourite language to the front — it becomes your start language, so tapping the ConjuExpert icon on your home screen opens the app straight into it. The bottom menu reorders the same way.", cj_no_thx: "No thanks",
      lang_start_set: "{lang} now opens first", lang_reorder_hint: "Long-press & drag to reorder",
      theme_add: "Add", theme_add_ph: "Your own topic…",
      cj_p1_head: "Nice — 5 verbs already!", cj_p1_text: "Create a free account: your progress is kept and you practise <b>2 days longer</b> with Premium – Quiz + Saved.",
      cj_p2_head: "Always at hand", cj_p2_text: "Add ConjuExpert to your home screen like an app – one tap, and you conjugate &amp; quiz in seconds.", cj_p2_yes: "Add to home screen",
      cj_p3_head: "Wait – don't leave without your progress!", cj_p3_text: "A free account (10 seconds) keeps everything – and gives you <b>2 more days</b> of Premium (Quiz + Saved).", cj_p3_yes: "Save my progress", cj_p3_no: "Leave anyway",
      cj_tend_head: "Your 24 h Premium trial is over", cj_tend_text: "Conjugate &amp; Learn stay free. Want to keep quizzing? With a free account you practise the “Cards” quiz (20 rounds/day) – plus <b>2 days of Premium</b> for free.", cj_tend_yes: "Create account – Quiz + 2 days", cj_tend_no: "Just look up &amp; learn",
      cj_help_head: "Help us get better", cj_help_text: "Please help us improve — and give you and every other ConjuExpert the best possible experience. We're brand new, and we truly need your help if something ever feels off.", cj_p8_head: "Great to see you back!", cj_p8_text: "Your progress is still here. Secure it with a free account before it's gone.",
      cj_fb_head: "How's it going for you?", cj_fb_text: "Be honest: what do you like best – and what should we do better?", cj_fb_gift: "🎁 Give us your feedback and get a <b>€5 code</b> on the yearly plan.", cj_fb_rate_q: "How do you like ConjuExpert?", cj_fb_ph: "Your feedback…", cj_fb_send: "Give feedback &amp; get €5", cj_fb_sending: "Sending…", cj_fb_err: "Couldn't send – please try again.",
      cj_fbt_head: "Thanks for your feedback!", cj_fbt_text: "Here's your gift: with code <b>WILLKOMMEN</b> you get Premium for <b>€24.99/year</b> instead of €29.99 – valid until the end of your trial.", cj_fb_secure: "Secure code &amp; get Premium",
      hint_quiz_cards_h: "Cards: memorise verbs, relaxed", hint_quiz_cards_1: "Pick a tense &amp; favourite topic, plus the direction (mother tongue ↔ target language).", hint_quiz_cards_2: "See the verb + tense, work out the form in your head — tap the card to flip it.", hint_quiz_cards_3: "Tap unknown words in the example sentence → translate &amp; save them.", hint_quiz_cards_4: "No pressure, no typing: perfect for getting to know forms and quick review.", hint_quiz_speed_h: "Speed: 60 seconds, full focus", hint_quiz_speed_1: "Pick a tense &amp; topic, then start — you have 60 seconds.", hint_quiz_speed_2: "Tap the correct form as fast as you can — every right answer counts.", hint_quiz_speed_3: "Great for making forms quick to recall, with a little time pressure.",
      hint_quiz_choice_h: "Choice: spot the right form fast", hint_quiz_choice_1: "A perfect way into a new tense.", hint_quiz_choice_2: "Pick a tense &amp; favourite topic.", hint_quiz_choice_3: "Verb + required tense + four options — tap the right one for instant feedback.", hint_quiz_choice_4: "Tap unknown words in the example sentence → translate &amp; save them.",
      hint_quiz_type_h: "Type: write conjugations actively", hint_quiz_type_1: "Writing it yourself anchors the forms most — alongside <b>Speak</b>, the most intensive mode.", hint_quiz_type_2: "Pick tense, topic &amp; direction — and whether to drill single verbs or translate a whole sentence.", hint_quiz_type_3: "Tap unknown words in the example sentence → translate &amp; save them.",
      hint_quiz_speak_h: "Speak: say it out loud", hint_quiz_speak_1: "Saying it yourself anchors the forms most — alongside <b>Type</b>, the most intensive mode.", hint_quiz_speak_2: "Pick tense, topic &amp; direction — and whether to drill single verbs or a whole sentence.", hint_quiz_speak_3: "Tap the microphone to start and to stop the voice input.", hint_quiz_speak_4: "Tap unknown words → translate &amp; save them.",
      hint_quiz_texte_h: "Texts: quiz your reading & listening", hint_quiz_texte_1: "Choose a favourite topic, tense and which kind of verbs to practise.", hint_quiz_texte_2: "Comprehension questions are waiting for you at the end.", hint_quiz_texte_3: "Tap any word in the text → translate &amp; save it.", hint_quiz_texte_4: "Tip: turn on “Use my saved words” — your own words appear in the story.",
      hint_learn_h: "Welcome to Learn", hint_learn_1: "Every tense is explained bilingually, with auto-generated examples.", hint_learn_2: "Use the tense selector at the top like a <b>cheat sheet</b> to jump between forms.", hint_learn_3: "Tap any example word to save it to your vocabulary.",
      hint_saved_verbs_h: "Saved verbs", hint_saved_verbs_1: "Every verb you saved with ☆ while conjugating gathers here.", hint_saved_verbs_2: "Tap a verb to reopen its full conjugation.", hint_saved_verbs_3: "Pick them right in the <b>Quiz</b> and practise on purpose.", hint_saved_verbs_4: "That's how you build your own personal practice list.",
      hint_saved_vocab_h: "Your vocabulary", hint_saved_vocab_1: "Create your own topic (e.g. “Doctor's visit”) &amp; choose the practice direction.", hint_saved_vocab_2: "✨ MEGA FEATURE: generate new words — under “New” type e.g. “Adjectives” and tap “Suggest 10 new words”.", hint_saved_vocab_3: "Your saved words can also be woven into the quiz texts.",
      tab_conjugate: "Conjugate", tab_quiz: "Quiz", tab_learn: "Learn", conjugate: "Conjugate",
      saved: "Saved verbs", recent: "Recent", clear: "clear",
      empty_title: "Type a verb to conjugate", empty_sub: "All tenses across {n} languages — type a verb or hit 🎲 to start.",
      regular: "regular", irregular: "irregular", recommended: "Recommended", ad_cta: "Practice →",
      mode: "Mode", m_type: "⌨ Type", m_choice: "◉ Choice", m_speed: "⚡ Speed", m_texte: "📖 Texts", mdesc_texte: "Read an AI story — translate, fill in verbs or answer questions", texte_question: "Comprehension", texte_cloze: "Fill verbs", texte_translate: "Translate", texte_new: "New story", texte_writing: "Writing your story…", texte_error: "Couldn't write a story — please try again.", texte_comprehension: "Comprehension", texte_done: "Story complete!", texte_fill_hint: "Put the verb in the right tense", texte_learn: "Learn this verb", texte_translation: "Translation", texte_read: "Read aloud", texte_speed: "Which speed?", texte_voice: "Which voice?", texte_voice_auto: "Automatic (best)", texte_almost: "almost done …", texte_voice_f: "Female", texte_voice_m: "Male", texte_pause: "Pause", texte_resume: "Resume", texte_mywords_lbl: "My words", texte_mywords: "Use my saved words",
      which_tense: "Tense", tense_word: "Tense", all_tenses: "All tenses", all_themes: "All topics", which_verbs: "Verbs", which_dir: "Direction", dir_produce: "PRODUCE", dir_recognize: "RECOGNIZE", dir_random: "RANDOM", which_theme: "Topics", quiz_mode_hd: "Quiz mode", explain_hd: "Explanation", req_form: "Asked", tip_label: "Tip", tip_meaning: "Meaning", tip_sentence: "Sentence", none_all: "None selected — all tenses are practiced", all_btn: "All", none_btn: "None", mist_clear_title: "All mistakes cleared!", mist_clear_sub: "Nice work — you reviewed every verb you got wrong.", mist_practice: "Practice mistakes", view_conj: "See full conjugation", mist_exit: "Back to all verbs",
      correct: "correct", accuracy: "accuracy", streak: "streak",
      type_form: "type the form…", check: "Check", next: "Next →", correct_excl: "✓ Correct!", accent_hint: "Right! Just mind the accent: {answer}", answer: "Answer:",
      hint_type: "Type the correct form for the pronoun and tense.", hint_choice: "Pick the correct form — 4 options.",
      challenge: "60-second challenge", challenge_sub: "Answer as many as you can before the clock runs out. Tap the right form — fast!",
      best: "Best:", start: "Start →", sec: "sec", pts: "pts", go: "Go go go — every correct tap is a point.",
      times_up: "Time's up!", in60: "correct in 60s", new_best: "🎉 New best!", play_again: "Play again →", back: "Back",
      tenses: "{lang} tenses", bilingual: "Bilingual · {a} ⇄ {b}", level: "Level", native: "Native",
      explanation: "Explanation", mnemonic: "🧠 Mnemonic", signal_words: "Signal words", examples: "Examples", when_use: "When to use", compare: "Compare",
      fb_offline: "Live AI explanations run in the app preview. Here are the core rules in the meantime:",
      fb_net: "Couldn't reach the explainer just now. Here are the core rules:",
      welcome: "Hey! You'll:", welcome_sub: "Conjugate verbs in 5 languages, quiz yourself and easily learn your favourite language.",
      your_name: "Your name…", mother_tongue: "Your mother tongue", skill_q: "Your level", skill_beginner: "Beginner", skill_beginner_sub: "common verbs", skill_intermediate: "Inter.", skill_intermediate_sub: "+ irregular", skill_advanced: "Advanced", skill_advanced_sub: "all verbs", lets_go: "Let's go →", skip: "Skip for now", remove_name: "Remove name", profile: "Profile", listen: "Listen", m_cards: "🃏 Cards", flip: "Tap to flip", got_it: "Got it", again: "Practice again", mistakes: "Mistakes", no_mistakes: "No mistakes yet — they appear here to review.", tab_saved: "Saved", reveal: "Show translation", learned: "Learned ✓", saved_empty: "No saved verbs yet. Tap the ☆ on any conjugation to save it here.", tour_conj: "The core: conjugate any verb in 5 languages, across every tense — at a glance.", tour_quiz: "Quiz yourself — cards, choice, typing & speaking — with fresh AI example sentences each round.", tour_learn: "Understand each tense bilingually, with auto-generated examples you can tap to save.", tour_saved: "Save verbs & words, build your own vocabulary, and practice them with spaced repetition.", tour_more1: "The core: every verb in 5 languages across all tenses — plus bilingual learning with AI examples.", tour_more2: "Practice with the quiz (cards, choice, typing & speaking), save words and stay on track with challenges.", tour_goals_h: "Challenges", tour_goal: "Build your personal challenge — AI suggestion, time-based, or fully custom. Track your daily progress and stay motivated.", tour_trial_head: "Your gift: 24h Premium", tour_trial_sub: "Then unlock your welcome discount — the conjugation tables stay free forever.", tour_feat1: "Quiz & Saved — fully unlocked", tour_feat2: "All tenses & AI example sentences", tour_feat3: "5 languages, no ads", eg_step1: "Random verb – tap ★ to save", eg_step2: "Practice in Quiz & pick favourite topics", eg_step3: "Train saved words under 'Saved'", hero_kicker: "Hey {name} 👋", hero_plan: "Your challenge for today, {name}:", hero_plan_anon: "Your challenge for today:", tour_next: "Next", tour_start: "Start learning", tour_skip: "Skip", t2_hi: "Great to have you here, {name}! 👋", t2_hi_anon: "Great to have you here! 👋", t2_ask: "Want a quick tour of the app — or jump right in?", t2_start_tour: "Start the tour", t2_skip_tour: "Jump right in", t2_overview_t: "Here's what's waiting for you", t2_quiz_tap_t: "Quiz · Tap", t2_quiz_type_t: "Quiz · Type", t2_quiz_text_t: "Quiz · Text", t2_prices_t: "Plans & pricing", t2_quizmodes_x: "Practise actively until it sticks — pick your mode.", t2_tap_x: "Choose the right form from 4 options.", t2_type_x: "Write the form yourself — actively trains your spelling.", t2_text_x: "Pick a topic, tense & vocabulary — the AI reads your story aloud: test & train your listening.", t2_conj_x: "Type a verb or roll the dice, pick a tense — save it to your list with ★.", t2_merken_x: "Tap & save words in practice sentences — or add your own.", t2_prices_x: "Conjugating & learning stay free forever · 24 hours of Premium to try", t2_ov1_t: "Your learning challenge", t2_ov1_d: "Set a daily, weekly or monthly challenge — track progress & streak", t2_ov2_t: "Vocabulary list", t2_ov2_d: "Tap & save words in sentences — or add your own", t2_ov3_t: "Favourite topics", t2_ov3_d: "Create your own topics under Saved and practise them in the quizzes", t2_m_cards: "Cards", t2_m_tap: "Tap", t2_m_type: "Type", t2_m_speak: "Speak", t2_m_speed: "⚡ Speed", t2_m_text: "Text", t2_f_topic: "Topic", t2_f_tense: "Tense", t2_f_words: "Words", t2_v_travel: "Travel", t2_v_saved: "Saved list", t2_v_work: "work", t2_p1_t: "24 h Premium", t2_p1_d: "try everything — no account needed", t2_p2_t: "With account · free", t2_p2_d: "Conjugate, Learn & 20 quiz cards / day", t2_p3_t: "ConjuPremium", t2_p3_d: "all unlocked · yearly €29.99 · monthly €2.99", m_speak: "🎤 Speak", speak_tap: "Tap the mic and say the form", speak_heard: "Heard:", speak_nomic: "Voice input isn’t supported here.", spk_form: "Speak word", spk_sentence: "Speak sentence", spk_what: "What to practice", spk_say: "Say it in {lang}",
      dq_form: "Conjugated form", vocab_translate: "Translate", offline_note: "⚡ Offline — examples & translations need internet", aux_title: "Building compound tenses", aux_logic: "All compound tenses are built the same way: conjugate the helper verb {aux} for the person + tense, then add the unchanging past participle {part}. Only the helper changes — the participle stays the same.", aux_note: "Compound tenses = auxiliary verb + past participle.", aux_participle: "Past participle", cards_hint: "Conjugate the verb in the required tense in your head – tap for the answer", cards_hint_type: "Conjugate the verb in the required tense · type it in the box", cards_hint_speak: "Conjugate the verb in the required tense · tap the mic to speak", choose_label: "Choose:", tap_retry: "Tap to translate", dq_infinitive: "Infinitive", dq_belongs: "From", dq_participle: "Past participle", dq_gerund: "Gerund", spk_relearn: "Still learning — show answer", spk_correct_is: "The correct sentence:", spk_next_sentence: "Next sentence →", speak_denied: "Microphone blocked — allow mic access in your browser.", speak_nospeech: "Didn't catch that — try again.", mic_start: "Tap once to record", sent_mist_practice: "Practice wrong sentences", spk_context: "In a sentence", cloze_instr: "Put the verb in the right tense", choose_tile: "pick the right tile", mic_stop: "Tap when done", tap_word: "tap a word for its meaning", practice_again: "Practice again", sk_title: "Challenge & streak", sk_today: "Today", sk_streak: "Day streak", sk_best: "Best", sk_days: "days", sk_done: "Challenge done!", sk_left: "{n} more to finish today's challenge", sk_explain: "Every conjugation and quiz answer counts. Finish your daily challenge to keep your streak alive — miss a day and it resets.", sk_close: "Got it", dq_fuzzy: "matched ignoring accents", dq_switched: "switched to infinitive", dq_guess: "best guess from the ending", tfilter_hint: "Swipe sideways · tap to show / hide a tense", verb_ph: "Type a verb…", autoread: "Read answer aloud", autoread_sub: "when correct", review: "Review", native_ph: "…or a verb in your language", saved_verbs: "Verbs", saved_vocab: "Vocabulary", gm_hint_tag: "only the 1st time", gm_hint_tx: "Everything you save lives here — <b>words, verbs & your own lists</b>. Up top: what's due today.", gm_due_head: "Due today · across all lists", gm_words_verbs: "words & verbs", gm_review_now: "Review now", gm_your_lists: "Your lists", gm_verbs: "Saved verbs", gm_words: "Saved words", gm_words_n: "words", gm_due: "due", gm_new_list: "List", gm_back: "Saved", imp_open: "Paste list", imp_title: "Paste a whole list", imp_help: "One word per line. Translation optional: casa - house. Missing ones we translate for you.", imp_ph: "one word per line…", imp_into: "Into list:", imp_cta: "Add words", imp_checking: "Checking your list…", imp_review_title: "Review & add", imp_review_sub: "{n} suggestions — tap to accept or keep the original.", imp_add: "Add", imp_added_note: "translation added", imp_orig: "was:", gm_saved_toast: "“{w}” saved → Saved words", gm_ch_cta_h: "Start your challenge", gm_ch_cta_s: "Your learning plan with a goal — verbs & words.", gm_saved_verb_toast: "“{w}” saved → Saved verbs", mv_title: "Move to", cross_open: "From another language", cross_title: "Copy from another language", cross_help: "Pick a language and its lists — the words get translated for you.", cross_srch: "Source language", cross_lists: "Which lists?", cross_cta: "Copy & translate", cross_busy: "Translating your words…", cross_done: "{n} words copied", cross_offline: "Needs internet", lch_title: "New list", lch_name_ph: "Name — e.g. Travel, Podcast…", lch_how: "How to fill it?", lch_empty: "Start empty", lch_tpl: "With a template", saved_tap_hint: "Tap a cell to hear it · ✕ removes the verb", ch_tab: "Challenge", ch_empty_head: "No challenge in {lang} yet", ch_empty: "Create one and practise with focus — each language has its own.", ch_create: "Create challenge", cs_day: "Day", cs_left: "{n} left", cs_done: "done today ✓", cs_start: "Start challenge", cs_plan: "your plan", ch_moment: "“{v}” is locked in — mastered!", ch_words_hint: "Words are practised in your Vocabulary", ch_words_go: "To Vocabulary →", ch_new: "New challenge", ch_practice: "Practise now", ch_left: "{n} days left", ch_done_v: "{a} of {b} verbs mastered", ch_done_w: "{a} of {b} words mastered", ch_edit: "Edit", ch_editdone: "Done", ch_add_ph: "Verb or word…", ch_fill: "Suggest", ch_from_saved: "From Saved", ch_add_all: "Add all", ch_choose: "Choose from saved", ch_pick_verbs: "Your saved verbs", ch_pick_words: "Your saved words", ch_pick_empty_v: "No saved verbs yet — star verbs with ☆ while conjugating.", ch_pick_empty_w: "No saved words yet — add them under Vocabulary.", ch_timeup: "Time's up — {a} of {b} mastered.", ch_extend: "+1 week", ch_mastered: "Challenge mastered!", ch_mastered_sub: "Every item is solid — time for a new challenge.", vocab_all: "All", vocab_new_cat: "New", vocab_cats_all: "All topics", vocab_cats_less: "Less", vocab_new_cat_q: "Name of the new category:", vocab_add_ph: "Add a word or phrase…", vocab_empty: "No words yet — add your first above.", vocab_practice: "Practice", vocab_word: "word", vocab_phrase: "phrase", vocab_type_target: "Type it in {lang}…", vocab_done: "Round complete!", vocab_save: "Save", vocab_saved: "Saved", vocab_seeding: "Loading starter words…", vocab_suggest: "Suggest 10 new words", vocab_due: "Due today", vocab_strength: "Memory strength", vocab_starter: "Load 5 starter words", gr_ind: "Indicative", gr_subj: "Subjunctive", gr_cond: "Conditional", gr_imp: "Imperative", gr_cont: "Continuous", gr_forms: "Non-finite forms", how_formed: "How it's formed", key_irregulars: "Key irregular verbs", irr_note: "Tap a verb to see its full conjugation.", tap_save: "tap a word — meaning & save", report_link: "Report error", report_title: "What's wrong?", r_grammar: "Wrong grammar", r_unnatural: "Unnatural", r_translation: "Wrong translation", r_other: "Something else", report_note: "Add a note (optional)…", report_send: "Send", report_thanks: "Thanks — we'll look into it!", acct_created: "✓ Account created — welcome!", zt_greets: "Crushing it today,|You're on a roll,|You're getting better,|Good to see you,|Consistency pays off,|Keep it up,", zt_eyebrow: "Your challenge", ch_adjust: "Edit challenge", zt_today: "Already {a} of {b} exercises today", zt_left_suffix: " — {n} more to your daily challenge.", zt_done_suffix: " — daily challenge done! 🎉", zt_min_left: "min left", zt_verbs_prog: "Verbs {a}/{b} mastered", zt_words_prog: "Words {a}/{b}", zt_streak: "{n}-day streak", zt_to_list: "To your challenge list", zt_keep: "Keep practising", zt_to_quiz: "To the quiz →", zt_other_head: "Other languages", zt_lang_prog: "{a}/{b} mastered", gf_week: "week", gf_weeks: "weeks", gf_verbs: "Verbs", gf_words: "Words", gf_min_abbr: "min", gf_per_day_lbl: "Exercises/day", gf_all_tenses: "all tenses", gf_ki_title: "Your AI suggestion — Intermediate level.", gf_ki_sub: " Already filled in — adjust anything freely.", gf_period: "Period", gf_tense: "Tense", gf_conj_verbs: "Conjugate verbs", gf_num_verbs: "Number of verbs", gf_per_tense: "per tense", gf_new_words: "New words", gf_vocab: "Vocabulary", gf_learn_new: "learn new", gf_ex_per_day: "exercises per day", gf_daily_auto: "Your daily challenge — adapts automatically.", gf_overview: "Challenge overview", gf_sum: "Over {weeks}: {verbs} verbs in {tenses}, plus {words} new words.", gf_start_cta: "Start your challenge · {n} exercises/day", gf_h1_pre: "To become a ", gf_h1_post: ", take on a challenge with us:", gf_choose_sub: "Pick your type of challenge.", ch_for_lang: "For", gf_suggest_h: "Suggest one for me", gf_level_mid: "LEVEL: INTERMEDIATE", gf_suggest_s: "We'll build a matching challenge in seconds — tuned to your level.", gf_ind_h: "Custom challenge", gf_ind_s: "Set the period, tenses, verbs & words yourself.", gf_or_time: "or by time", gf_by_time: "By time", gf_time_h: "I set my time", gf_time_s: "\"I want to practise … minutes a day\" — we'll work out your challenge.", gf_back: "back", gf_time_q: "How many minutes do you want to practise daily?", gf_time_qs: "We'll calculate your ideal daily challenge automatically.", gf_mins_day: "Minutes per day", gf_mins_min: "at least 3 min recommended", gf_ex_approx: "Exercises per day · ≈ {n} min", gf_vw_daily: "~{v} verbs & {w} words daily.", gf_sum_time: "{mins} minutes a day = {per} exercises/day. In 2 weeks you'll learn about {verbs} verbs and {words} new words.", gs_title: "Your challenge is set{name}.", gs_sub: "Have fun quizzing — picture yourself soon speaking your favourite language fluently. 🌟", gs_set_verbs: "Choose verbs →", gs_set_hint: "pick from Saved, type your own, or get suggestions", gs_later: "Later", gc_daily_done: "Daily challenge done!", gc_done_plan: "You've completed your {d}-day challenge{name}! Time for a new one.", gc_done_named: "{name}, you did {n} exercises today — awesome!", gc_done_anon: "You did {n} exercises today — awesome!", gc_ex_today: "Exercises today", gc_streak_lbl: "Day streak", gc_plan_day: "Plan day", report_general: "Report a problem", report_general_sub: "Bug or problem — screenshot welcome", report_attach: "Attach screenshot", report_shot_hint: "A screenshot helps us find the problem faster.", type_word: "Type word", type_sentence: "Type sentence", spk_translate: "Translate this", qi_title: "How do you want to practice?", qi_sub: "Pick a mode — each trains a different skill.", qi_foot: "Tip: change tense & verb filters after picking a mode.", qi_back: "Overview", mdesc_cards: "Flip cards — see the answer, no pressure", mdesc_choice: "Multiple choice — pick the right form", mdesc_speed: "60-second sprint — how many can you do?", mdesc_type: "Type the form or translate a sentence", mdesc_speak: "Say it out loud — speech recognition",
      paywall_lock: "🔒 Quiz & Saved are Premium", paywall_h1: "Conjugate without thinking", paywall_sub: "The Quiz trains you actively until the forms stick — and Saved lets you practise exactly the vocabulary that matters to you.", paywall_unlock: "Unlock Premium", paywall_later: "Maybe later", pw_feat1: "Interactive Quiz", pw_feat1v: "4 modes", pw_feat2: "Saved & vocab lists", pw_feat2v: "unlimited", pw_feat3: "Conjugation & Learn", pw_feat3v: "stays free",
      offer_badge: "🚀 WELCOME OFFER · −{disc} %", offer_expires: "Offer expires in {t}", offer_instead: "instead of", offer_mo: "mo.", offer_yr: "/ year", offer_you_pay: "you pay:", offer_save: "you save {save} € (−{disc} %)", offer_secure: "Secure offer", offer_trial: "Try free for 24 h first", offer_trial_b: "24 h Premium free", offer_close: "Close offer", offer_price_label: "Price: {price} € per year, instead of {eq} € billed monthly",
      plan_hero_h1: "Learn without limits", plan_hero_sub: "Unlimited Quiz & Saved in all 5 languages", plan_annual: "Annual plan", plan_monthly: "Monthly plan", plan_best: "★ Most popular", plan_bonus: "🎁 Welcome bonus", plan_per_mo: "/ month", plan_per_yr: "/ year", plan_instead: "instead of", plan_save: "you save {save} € (−{disc} %)", plan_mo_label: "~{price} € / month · instead of {eq} €", plan_flex: "flexible · equiv. {eq} € / year", plan_feat1: "Interactive conjugation quiz", plan_feat2: "Saved & vocab lists", plan_feat3: "5 languages — ES, FR, EN, NL, DE", plan_feat4: "All devices · no ads", plan_cta: "Continue to payment", plan_cancelable: "cancel anytime", plan_have_account: "Already have an account?", sign_in: "Sign in", plan_coupon: "Redeem coupon code", pr_title: "Pricing & Plans", pr_eyebrow: "Pricing", pr_free: "Free", pr_premium: "Premium", pr_feat_conj: "Conjugate verbs · all tenses", pr_active: "You have Premium – thank you! 💜", pr_anon: "Guest", pr_konto: "Account", pr_quiz_day: "20/day", pr_trial_note: "🎁 With an account: 2 extra days of Premium, free", pr_feat_goals: "Challenges & progress", ap_lock: "🔓 Free account", ap_h1: "Quiz with a free account", ap_sub: "Create a free account to practice with the quiz — plus 2 days of Premium, free.", ap_feat1: "20 quiz cards per day", ap_feat2: "2 days of Premium, free", ap_feat3: "Progress on all your devices", ap_cta: "Create free account", ql_lock: "🔓 Daily limit reached", ql_h1: "20 cards done for today!", ql_sub: "Nice work! With Premium you practice without limits — or come back tomorrow for 20 fresh cards.", ql_feat1: "Unlimited quiz — every mode", ql_cta: "Unlock Premium", coupon_title: "Coupon code", coupon_need_login: "Please sign in first to redeem a code.", coupon_sign_in: "Sign in now", coupon_ph: "Enter code", coupon_redeem: "Redeem", coupon_redeeming: "Redeeming…",
      menu_rate: "Rate app", menu_logout: "Sign out", menu_cancel_sub: "Cancel subscription", menu_sub_active_until: "✓ Subscription cancelled — active until {date}", menu_delete_acc: "Delete account", cancel_title: "Cancel subscription", cancel_body: "Your Premium runs until {date} — after that you switch to the free version automatically. Your account stays.", cancel_no: "Go back", cancel_yes: "Cancel now", delete_title: "Delete account", delete_warn_days: "⚠️ You lose {n} paid days", delete_warn_body: "Your subscription is active until {date}. If you cancel first, you can still use the remaining time.", delete_cancel_first: "Cancel subscription first", delete_anyway: "Delete anyway", delete_data: "All data will be permanently deleted.", delete_yes: "Delete",
      sub_runs_until: "Your subscription runs until {date} — you can continue using the app until then.", sub_end_period: "end of the current billing period", goodbye_heading: "Sorry to see you go — but you’re a pro now!", goodbye_love: "All the best.", goodbye_data: "Of course we’ll delete your data.", goodbye_btn: "Goodbye! 👋", pay_error: "Payment could not be started. Please try again.", bonus_trial: "Secure Premium", bonus_welcome: "Claim welcome bonus", bonus_quiz: "Get Quiz & Saved!", ios_homescreen: "Add ConjuExpert to your home screen!", ios_share: "Share → Add to Home Screen", ios_close: "Close", ios_how: "How to", pwa_home: "ConjuExpert on your home screen!", pwa_nostore: "No app store needed.", ios_help_title: "Add it on your iPhone", ios_help_1: "In Safari, tap the <b>Share button</b> (square with an up arrow) at the top.", ios_help_2: "Choose <b>“Add to Home Screen”</b>.", ios_help_3: "Tap <b>“Add”</b> at the top right — done!", and_help_title: "Add it on your Android", and_help_1: "Tap the <b>menu</b> (⋮) at the top right.", and_help_2: "Choose <b>“Install app”</b> or <b>“Add to Home screen”</b>.", and_help_3: "Confirm with <b>“Install”</b> — done!", pin_help_ios: "Guide for iPhone", pin_help_android: "Guide for Android", rev_kicker: "20 seconds · big impact", rev_heading: "just before you keep going …", rev_body1: "You’ve already been at it for <b>{mins} minutes</b> today — amazing!", rev_body2: "Help others find their favourite language too: with a <b>quick rating</b>, ConjuExpert gets found — your biggest support for us. 💛", rev_rate: "Rate now →", rev_feedback: "Prefer to leave feedback?", rev_snooze: "Remind me later", paysuc_sub: "All Premium features are now unlocked! Enjoy the quiz and learning your favourite language 🎉", paysuc_feat1: "Quiz — all modes & languages", paysuc_feat2: "Favourites & vocab lists", paysuc_feat3: "Unlimited · no ads", menu_logged_in: "Signed in as", menu_edit_profile: "Edit profile", menu_tarife: "Plans & prices", menu_pin: "Pin app icon", pin_title: "Add ConjuExpert to your home screen", menu_login: "Sign up / Log in", msub_konto: "Save your progress", msub_profil: "Name \u00b7 languages \u00b7 level", msub_pin: "Add to home screen", msub_tarife: "All features", msub_rate: "Support us \u2014 5 stars", pin_sub: "– and you can conjugate and quiz right away.", pin_tip: "Tip", pin_guide_for: "Here’s the guide for:", pin_step_ios: "Share → „Add to Home Screen“", pin_step_android: "Menu → „Install app“", pin_cta: "Add now", pin_later: "Later", pin_iphone: "iPhone / iPad", pin_android: "Android", menu_share: "Recommend app", err_cancel_fail: "Cancellation failed. Please try again.", err_delete_fail: "Deletion failed. Please try again.", guest_login_sub: "Sign in to save your progress and vocabulary.", guest_login_cta: "Sign in now →", login_welcome_back: "Welcome back", login_almost_done: "Almost there!", login_create_acct: "Create account", login_reset_pw: "Reset password", login_sub_login: "Save favourites & progress on all devices", login_sub_login_pay: "Sign in — you'll continue to payment right away.", login_sub_signup: "Free — data stored securely in Germany", login_sub_signup_pay: "Great that you chose Premium — first create an account to complete your subscription.", login_sub_reset: "We'll send you a reset link", login_done_signup: "Confirmation email sent!\nPlease check your inbox.", login_done_reset: "Reset link sent!\nPlease check your inbox.", login_pw_ph: "Password (min. 6 chars)", login_forgot_pw: "Forgot password?", login_btn_signup: "Create account", login_btn_reset: "Send reset link", login_or: "or", login_google: "Sign in with Google", login_apple: "Sign in with Apple", login_no_account: "No account yet?", login_has_account: "Already registered?", login_do_register: "Register", login_back: "← Back to login", login_data: "🔒 Data stored in Frankfurt, DE", goal_ai: "AI suggestion", goal_ai_badge: "MED.", goal_time: "By time", goal_time_note: "10 min/day", goal_custom: "Custom", goal_custom_note: "8 verbs · 20 words", goal_daily: "exercises per day", goal_time_approx: "≈ 6 min · adjustable"
    },
    de: {
      tagline: "konjugieren · quiz · lernen", hi: "Hi, {name} 👋", ready: "Bereit, wenn du es bist, {name}",
      cj_acc: "Konto anlegen", cj_later: "Später", cj_reorder_head: "Ordne die Kacheln frei an", cj_reorder_text: "Zieh deine Lieblingssprache an die erste Stelle — sie wird deine Startsprache. Tippst du das ConjuExpert-Icon auf dem Home-Bildschirm an, öffnet sich die App sofort darin. Auch die Menüleiste unten lässt sich so anordnen.", cj_no_thx: "Nein danke",
      lang_start_set: "{lang} öffnet jetzt zuerst", lang_reorder_hint: "Lange drücken & ziehen zum Anordnen",
      theme_add: "Hinzufügen", theme_add_ph: "Eigenes Thema…",
      cj_p1_head: "Stark — schon 5 Verben!", cj_p1_text: "Leg dir ein kostenloses Konto an: Dein Fortschritt bleibt erhalten und du übst <b>2 Tage länger</b> mit dem Premiumtarif – Quiz + Merken.",
      cj_p2_head: "Immer griffbereit", cj_p2_text: "Leg ConjuExpert wie eine App auf deinen Home-Bildschirm – ein Tipp, und du konjugierst &amp; quizzt in Sekunden.", cj_p2_yes: "Auf den Home-Bildschirm",
      cj_p3_head: "Moment – geh nicht ohne deinen Fortschritt!", cj_p3_text: "Mit einem kostenlosen Konto (10 Sekunden) bleibt alles erhalten – und du sicherst dir <b>2 weitere Tage</b> Premiumtarif (Quiz + Merken).", cj_p3_yes: "Fortschritt sichern", cj_p3_no: "Trotzdem gehen",
      cj_tend_head: "Deine 24 h Premiumtarif-Test sind vorbei", cj_tend_text: "Konjugieren &amp; Lernen bleiben kostenlos. Willst du weiter quizzen? Mit einem kostenlosen Konto übst du im Quiz „Karte“ (20 Runden/Tag) – und sicherst dir <b>2 Tage Premiumtarif</b> gratis dazu.", cj_tend_yes: "Konto anlegen – Quiz + 2 Tage", cj_tend_no: "Nur nachschlagen &amp; lernen",
      cj_help_head: "Hilf uns, besser zu werden", cj_help_text: "Bitte hilf uns dabei, besser zu werden und dir und den anderen ConjuExperts die bestmöglichen Erlebnisse zu verschaffen. Wir sind ganz frisch am Start und brauchen deine Mithilfe, falls es irgendwo „klemmt“.", cj_p8_head: "Schön, dass du wieder da bist!", cj_p8_text: "Dein Fortschritt ist noch da. Sichere ihn mit einem kostenlosen Konto, bevor er verloren geht.",
      cj_fb_head: "Wie läuft's für dich?", cj_fb_text: "Sag uns ehrlich: Was gefällt dir am besten – und was sollen wir besser machen?", cj_fb_gift: "🎁 Gib uns dein Feedback und erhalte einen <b>5-€-Code</b> auf das Jahres-Abo.", cj_fb_rate_q: "Wie gefällt dir ConjuExpert?", cj_fb_ph: "Dein Feedback…", cj_fb_send: "Feedback geben &amp; 5 € sichern", cj_fb_sending: "Wird gesendet…", cj_fb_err: "Konnte nicht gesendet werden – bitte erneut versuchen.",
      cj_fbt_head: "Danke fürs Feedback!", cj_fbt_text: "Hier ist dein Geschenk: Mit dem Code <b>WILLKOMMEN</b> bekommst du den Premiumtarif für <b>24,99 €/Jahr</b> statt 29,99 € – gültig bis zum Ende deines Tests.", cj_fb_secure: "Code sichern &amp; Premium holen",
      hint_quiz_cards_h: "Karten: Verben entspannt einprägen", hint_quiz_cards_1: "Zeitform &amp; Lieblingsthema wählen, dazu die Richtung (Muttersprache ↔ Lernsprache).", hint_quiz_cards_2: "Verb + Zeitform ansehen, Form im Kopf überlegen — tippe die Karte zum Umdrehen.", hint_quiz_cards_3: "Unbekannte Wörter im Beispielsatz antippen → übersetzen &amp; speichern.", hint_quiz_cards_4: "Kein Druck, kein Tippen: ideal zum Kennenlernen und schnellen Wiederholen.", hint_quiz_speed_h: "Speed: 60 Sekunden Vollgas", hint_quiz_speed_1: "Zeitform &amp; Thema wählen, dann starten — du hast 60 Sekunden.", hint_quiz_speed_2: "Tippe die richtige Form so schnell wie möglich an — jede richtige zählt.", hint_quiz_speed_3: "Ideal, um Formen schnell abrufbar zu machen — mit etwas Zeitdruck.",
      hint_quiz_choice_h: "Auswahl: die richtige Form schnell erkennen", hint_quiz_choice_1: "Perfekter Einstieg in eine neue Zeitform.", hint_quiz_choice_2: "Zeitform &amp; Lieblingsthema wählen.", hint_quiz_choice_3: "Verb + geforderte Zeitform + vier Varianten — tippe die richtige an, sofortige Rückmeldung.", hint_quiz_choice_4: "Unbekannte Wörter im Beispielsatz antippen → übersetzen &amp; speichern.",
      hint_quiz_type_h: "Tippen: Konjugationen aktiv schreiben", hint_quiz_type_1: "Selbst Schreiben verankert die Formen mit am stärksten — neben <b>Sprechen</b> der intensivste Modus.", hint_quiz_type_2: "Zeitform, Lieblingsthema &amp; Richtung wählen — einzelne Verben oder ganzen Satz übersetzen.", hint_quiz_type_3: "Unbekannte Wörter im Beispielsatz antippen → übersetzen &amp; speichern.",
      hint_quiz_speak_h: "Sprechen: laut aussprechen", hint_quiz_speak_1: "Selbst Sprechen verankert die Formen mit am stärksten — neben <b>Schreiben</b> der intensivste Modus.", hint_quiz_speak_2: "Zeitform, Lieblingsthema &amp; Richtung wählen — einzelne Verben oder ganzen Satz.", hint_quiz_speak_3: "Mikrofon antippen zum Starten und Beenden der Spracheingabe.", hint_quiz_speak_4: "Unbekannte Wörter antippen → übersetzen &amp; speichern.",
      hint_quiz_texte_h: "Quizze dein Lese- & Hörverständnis", hint_quiz_texte_1: "Lieblingsthema, Zeitform &amp; Art der Verben wählen.", hint_quiz_texte_2: "Am Ende warten Verständnisfragen auf dich.", hint_quiz_texte_3: "Jedes Wort im Text antippen → übersetzen &amp; speichern.", hint_quiz_texte_4: "Tipp: „Gemerkte Wörter einbauen“ aktivieren — deine Wörter erscheinen in der Geschichte.",
      hint_learn_h: "Willkommen im Lernbereich", hint_learn_1: "Jede Zeitform wird zweisprachig erklärt — mit automatisch erzeugten Beispielen.", hint_learn_2: "Nutze die Zeitform-Auswahl oben wie einen <b>Spickzettel</b>, um zwischen den Formen zu springen.", hint_learn_3: "Tipp ein Beispielwort an, um es in deinen Wortschatz zu legen.",
      hint_saved_verbs_h: "Gemerkte Verben", hint_saved_verbs_1: "Alle Verben, die du beim Konjugieren mit ☆ gespeichert hast.", hint_saved_verbs_2: "Verb antippen → volle Konjugation wieder öffnen.", hint_saved_verbs_3: "Direkt im <b>Quiz</b> auswählen &amp; gezielt üben.", hint_saved_verbs_4: "So baust du dir deine persönliche Übungsliste auf.",
      hint_saved_vocab_h: "Dein Wortschatz", hint_saved_vocab_1: "Eigenes Thema anlegen (z. B. „Arztbesuch“) &amp; Übungsrichtung wählen.", hint_saved_vocab_2: "✨ MEGA-FEATURE: neue Wörter generieren — unter „Neu“ z. B. „Adjektive“ eingeben und „10 neue Wörter vorschlagen“ tippen.", hint_saved_vocab_3: "Gemerkte Wörter lassen sich zusätzlich in die Quiz-Texte einbauen.",
      tab_conjugate: "Konjugieren", tab_quiz: "Quiz", tab_learn: "Lernen", conjugate: "Konjugieren",
      saved: "Gespeicherte Verben", recent: "Zuletzt", clear: "löschen",
      empty_title: "Verb eingeben zum Konjugieren", empty_sub: "Alle Zeitformen in {n} Sprachen — tippe ein Verb oder 🎲 zum Start.",
      regular: "regelmäßig", irregular: "unregelmäßig", recommended: "Empfohlen", ad_cta: "Üben →",
      mode: "Modus", m_type: "⌨ Tippen", m_choice: "◉ Auswahl", m_speed: "⚡ Speed", m_texte: "📖 Texte", mdesc_texte: "Lies eine KI-Geschichte — übersetzen, Verben einsetzen oder Fragen beantworten", texte_question: "Verständnis", texte_cloze: "Verben einsetzen", texte_translate: "Übersetzen", texte_new: "Neue Geschichte", texte_writing: "Deine Geschichte wird geschrieben…", texte_error: "Konnte keine Geschichte schreiben — versuch es nochmal.", texte_comprehension: "Verständnisfragen", texte_done: "Geschichte geschafft!", texte_fill_hint: "Setze das Verb in die richtige Zeitform", texte_learn: "Verb lernen", texte_translation: "Übersetzung", texte_read: "Vorlesen", texte_speed: "Welches Tempo?", texte_voice: "Welche Stimme?", texte_voice_auto: "Automatisch (beste)", texte_almost: "gleich fertig …", texte_voice_f: "Weiblich", texte_voice_m: "Männlich", texte_pause: "Pause", texte_resume: "Weiter", texte_mywords_lbl: "Mein Wortschatz", texte_mywords: "Gemerkte Wörter einbauen",
      which_tense: "Zeitform", tense_word: "Zeitform", all_tenses: "Alle Zeitformen", all_themes: "Alle Themen", which_verbs: "Verben", which_dir: "Richtung", dir_produce: "PRODUZIEREN", dir_recognize: "ERKENNEN", dir_random: "ZUFÄLLIG", which_theme: "Themen", quiz_mode_hd: "Quiz-Modus", explain_hd: "Erklärung", req_form: "Gesucht", tip_label: "Tipp", tip_meaning: "Bedeutung", tip_sentence: "Satz", none_all: "Nichts gewählt — es werden alle Zeitformen geübt", all_btn: "Alle", none_btn: "Keine", mist_clear_title: "Alle Fehler gemeistert!", mist_clear_sub: "Stark — du hast jedes falsch gemachte Verb wiederholt.", mist_practice: "Fehler üben", view_conj: "Volle Konjugation ansehen", mist_exit: "Zurück zu allen Verben",
      correct: "richtig", accuracy: "Genauigkeit", streak: "Serie",
      type_form: "Form eintippen…", check: "Prüfen", next: "Weiter →", correct_excl: "✓ Richtig!", accent_hint: "Richtig! Achte nur auf den Akzent: {answer}", answer: "Antwort:",
      hint_type: "Tippe die richtige Form für Pronomen und Zeitform.", hint_choice: "Wähle die richtige Form — 4 Optionen.",
      challenge: "60-Sekunden-Challenge", challenge_sub: "Beantworte so viele wie möglich, bevor die Zeit abläuft. Tippe schnell die richtige Form!",
      best: "Bester:", start: "Start →", sec: "Sek", pts: "Pkt", go: "Los, los — jede richtige Antwort zählt!",
      times_up: "Zeit abgelaufen!", in60: "richtig in 60s", new_best: "🎉 Neuer Rekord!", play_again: "Nochmal →", back: "Zurück",
      tenses: "{lang} – Zeitformen", bilingual: "Zweisprachig · {a} ⇄ {b}", level: "Niveau", native: "Muttersprache",
      explanation: "Erklärung", mnemonic: "🧠 Eselsbrücke", signal_words: "Signalwörter", examples: "Beispiele", when_use: "Verwendung", compare: "Vergleich",
      fb_offline: "Live-KI-Erklärungen laufen in der App-Vorschau. Hier solange die Kernregeln:",
      fb_net: "Erklärung gerade nicht erreichbar. Hier die Kernregeln:",
      welcome: "Hey! Du wirst:", welcome_sub: "hier kannst du Verben in 5 Sprachen konjugieren, quizzen und so easy deine Lieblingssprache lernen.",
      your_name: "Dein Name…", mother_tongue: "Deine Muttersprache", skill_q: "Dein Niveau", skill_beginner: "Anfänger", skill_beginner_sub: "häufige Verben", skill_intermediate: "Mittel", skill_intermediate_sub: "+ unregelmäßige", skill_advanced: "Fortgeschr.", skill_advanced_sub: "alle Verben", lets_go: "Los geht's →", skip: "Überspringen", remove_name: "Namen entfernen", profile: "Profil", listen: "Anhören", m_cards: "🃏 Karten", flip: "Tippen zum Umdrehen", got_it: "Gewusst", again: "Nochmal üben", mistakes: "Fehler", no_mistakes: "Noch keine Fehler — sie erscheinen hier zum Wiederholen.", tab_saved: "Gemerkt", reveal: "Übersetzung zeigen", learned: "Gelernt ✓", saved_empty: "Noch keine gemerkten Verben. Tippe bei einer Konjugation auf das ☆.", tour_conj: "Das Herzstück: jedes Verb in 5 Sprachen über alle Zeitformen konjugieren — auf einen Blick.", tour_quiz: "Quize dich — Karten, Auswahl, Tippen & Sprechen — mit automatisch erzeugten KI-Beispielsätzen.", tour_learn: "Jede Zeitform zweisprachig verstehen, mit KI-Beispielen — antippen & in den Wortschatz merken.", tour_saved: "Speichere Verben & Wörter, baue deinen eigenen Wortschatz auf und übe mit Spaced Repetition — die KI schlägt automatisch Startwörter vor.", tour_more1: "Das Herzstück: jedes Verb in 5 Sprachen über alle Zeitformen – plus zweisprachiges Lernen mit KI-Beispielen.", tour_more2: "Übe mit Quiz (Karten, Auswahl, Tippen & Sprechen), merke dir Wörter und bleib mit Challenges am Ball.", tour_goals_h: "Challenges", tour_goal: "Erstelle deine persönliche Challenge — KI-Vorschlag, nach Zeit oder individuell. Verfolge täglich deinen Fortschritt und bleib motiviert.", tour_trial_head: "Dein Geschenk: 24 h Premium", tour_trial_sub: "Danach Willkommensrabatt freischalten — die Konjugationstabellen bleiben für immer kostenlos.", tour_feat1: "Quiz & Gemerkt – voll freigeschaltet", tour_feat2: "Alle Zeitformen & KI-Beispielsätze", tour_feat3: "5 Sprachen, keine Werbung", eg_step1: "Zufälliges Verb – per ★ speichern", eg_step2: "Im Quiz üben & Lieblingsthemen wählen", eg_step3: "Gespeicherte Wörter gezielt im Tab 'Gemerkt' trainieren", hero_kicker: "Hey {name} 👋", hero_plan: "Deine Challenge für heute, {name}:", hero_plan_anon: "Deine Challenge für heute:", tour_next: "Weiter", tour_start: "Los geht\u0027s", tour_skip: "Überspringen", t2_hi: "Schön, dass du da bist, {name}! 👋", t2_hi_anon: "Schön, dass du da bist! 👋", t2_ask: "Magst du einen kurzen Rundgang durch die App – oder direkt loslegen?", t2_start_tour: "App-Rundgang starten", t2_skip_tour: "Direkt loslegen", t2_overview_t: "Das erwartet dich", t2_quiz_tap_t: "Quiz · Antippen", t2_quiz_type_t: "Quiz · Eintippen", t2_quiz_text_t: "Quiz · Text", t2_prices_t: "Preise & Tarife", t2_quizmodes_x: "Aktiv üben, bis es sitzt – wähle deinen Modus.", t2_tap_x: "Die richtige Form aus 4 Möglichkeiten wählen.", t2_type_x: "Form selbst schreiben – trainiert aktiv die Schreibweise.", t2_text_x: "Thema, Zeitform & Wortschatz wählen – die KI liest dir die Geschichte vor: Hörverständnis testen & üben.", t2_conj_x: "Verb eintippen oder würfeln, Zeitform wählen – per ★ in die Merkliste.", t2_merken_x: "Wörter in Übungssätzen antippen & speichern – oder selbst anlegen.", t2_prices_x: "Konjugieren & Lernen bleiben für immer kostenlos · 24 Stunden Premium zum Testen.", t2_ov1_t: "Deine Lern-Challenge", t2_ov1_d: "Tages-, Wochen- oder Monats-Challenge festlegen – Fortschritt & Serie im Blick behalten", t2_ov2_t: "Vokabel-Merkliste", t2_ov2_d: "Wörter in Sätzen antippen & speichern – oder selbst anlegen", t2_ov3_t: "Lieblingsthemen", t2_ov3_d: "Eigene Themen unter Gemerkt anlegen und gezielt in den Quizzes üben", t2_m_cards: "Karten", t2_m_tap: "Antippen", t2_m_type: "Tippen", t2_m_speak: "Sprechen", t2_m_speed: "⚡ Speed", t2_m_text: "Text", t2_f_topic: "Thema", t2_f_tense: "Zeitform", t2_f_words: "Wortwahl", t2_v_travel: "Reisen", t2_v_saved: "Merkliste", t2_v_work: "Arbeit", t2_p1_t: "24 h Premium-Nutzung", t2_p1_d: "alles testen – ganz ohne Konto", t2_p2_t: "Mit Konto · kostenlos", t2_p2_d: "Konjugieren, Lernen & 20 Quiz-Karten/Tag", t2_p3_t: "ConjuPremium", t2_p3_d: "alles frei · Jahr 29,99 € · Monat 2,99 €", m_speak: "🎤 Sprechen", speak_tap: "Tippe aufs Mikro und sprich die Form", speak_heard: "Gehört:", speak_nomic: "Spracheingabe wird hier nicht unterstützt.", spk_form: "Wort sprechen", spk_sentence: "Satz sprechen", spk_what: "Was üben?", spk_say: "Sag es auf {lang}",
      dq_form: "Konjugierte Form", vocab_translate: "Übersetzen", offline_note: "⚡ Offline — Beispiele & Übersetzungen brauchen Internet", aux_title: "Zusammengesetzte Zeiten bilden", aux_logic: "Alle zusammengesetzten Zeiten funktionieren gleich: Du konjugierst das Hilfsverb {aux} nach Person + Zeit und hängst das unveränderliche Partizip {part} an. Nur das Hilfsverb ändert sich — das Partizip bleibt gleich.", aux_note: "Zusammengesetzte Zeiten = Hilfsverb + Partizip.", aux_participle: "Partizip", cards_hint: "Konjugiere das Verb in der geforderten Zeitform gedanklich – tippe für die Lösung", cards_hint_type: "Konjugiere das Verb in der geforderten Zeitform · tippe das Wort in das Kästchen", cards_hint_speak: "Konjugiere das Verb in der geforderten Zeitform · tippe auf das Mikro zum Einsprechen", choose_label: "Wähle aus:", tap_retry: "Antippen zum Übersetzen", dq_infinitive: "Infinitiv", dq_belongs: "Von", dq_participle: "Partizip II", dq_gerund: "Gerundium / Verlaufsform", spk_relearn: "Muss ich noch lernen", spk_correct_is: "So heißt der Satz richtig:", spk_next_sentence: "Nächster Satz →", speak_denied: "Mikrofon blockiert — erlaube den Zugriff im Browser.", speak_nospeech: "Nichts verstanden — versuch es nochmal.", mic_start: "Einmal antippen zum Aufnehmen", sent_mist_practice: "Falsche Sätze üben", spk_context: "Im Satz", cloze_instr: "Konjugiere das Verb in der geforderten Zeitform", choose_tile: "wähle die richtige Kachel", mic_stop: "Tippen wenn fertig", tap_word: "tippe ein Wort für die Bedeutung", practice_again: "Nochmal üben", sk_title: "Challenge & Serie", sk_today: "Heute", sk_streak: "Tage in Folge", sk_best: "Bestwert", sk_days: "Tage", sk_done: "Challenge geschafft!", sk_left: "Noch {n} bis zur Tages-Challenge", sk_explain: "Jede Konjugation und jede Quiz-Antwort zählt. Schaffe deine Tages-Challenge, um deine Serie zu halten — verpasst du einen Tag, beginnt sie von vorn.", sk_close: "Verstanden", dq_fuzzy: "ohne Akzente erkannt", dq_switched: "zum Infinitiv gewechselt", dq_guess: "geschätzt anhand der Endung", tfilter_hint: "Seitlich wischen · tippen zum Ein-/Ausblenden", verb_ph: "Verb eingeben…", autoread: "Antwort vorlesen", autoread_sub: "bei richtig", review: "Auswertung", native_ph: "…oder ein Verb in deiner Sprache", saved_verbs: "Verben", saved_vocab: "Wortschatz", gm_hint_tag: "nur beim 1. Mal", gm_hint_tx: "Hier sammelst du alles — <b>Wörter, Verben & eigene Listen</b>. Oben steht, was heute dran ist.", gm_due_head: "Heute fällig · aus allen Listen", gm_words_verbs: "Wörter & Verben", gm_review_now: "Jetzt wiederholen", gm_your_lists: "Deine Listen", gm_verbs: "Gemerkte Verben", gm_words: "Gemerkte Wörter", gm_words_n: "Wörter", gm_due: "fällig", gm_new_list: "Liste", gm_back: "Gemerkt", imp_open: "Liste einfügen", imp_title: "Ganze Liste einfügen", imp_help: "Eine Zeile pro Wort. Übersetzung optional: casa - Haus. Fehlt sie, übersetzen wir sie.", imp_ph: "ein Wort pro Zeile…", imp_into: "In Liste:", imp_cta: "Wörter einfügen", imp_checking: "Prüfe deine Liste…", imp_review_title: "Prüfen & einfügen", imp_review_sub: "{n} Hinweise — antippen, um einen Vorschlag zu übernehmen oder das Original zu behalten.", imp_add: "Hinzufügen", imp_added_note: "Übersetzung ergänzt", imp_orig: "war:", gm_saved_toast: "„{w}“ gemerkt → Gemerkte Wörter", gm_ch_cta_h: "Leg deine Challenge an", gm_ch_cta_s: "Dein Lernplan mit Ziel — Verben & Wörter.", gm_saved_verb_toast: "„{w}“ gemerkt → Gemerkte Verben", mv_title: "Verschieben nach", cross_open: "Aus anderer Sprache", cross_title: "Aus anderer Sprache übernehmen", cross_help: "Wähle eine Sprache und ihre Listen — die Wörter werden für dich übersetzt.", cross_srch: "Quellsprache", cross_lists: "Welche Listen?", cross_cta: "Übernehmen & übersetzen", cross_busy: "Übersetze deine Wörter…", cross_done: "{n} Wörter übernommen", cross_offline: "Braucht Internet", lch_title: "Neue Liste", lch_name_ph: "Name — z. B. Reise, Podcast…", lch_how: "Wie befüllen?", lch_empty: "Leer starten", lch_tpl: "Mit Vorlage", saved_tap_hint: "Zelle antippen zum Anhören · ✕ entfernt das Verb", ch_tab: "Challenge", ch_empty_head: "In {lang} noch keine Challenge", ch_empty: "Leg eine an und übe gezielt — jede Sprache hat ihre eigene.", ch_create: "Challenge erstellen", cs_day: "Tag", cs_left: "noch {n}", cs_done: "heute geschafft ✓", cs_start: "Challenge starten", cs_plan: "dein Lernplan", ch_moment: "„{v}“ sitzt jetzt — gemeistert!", ch_words_hint: "Wörter übst du im Wortschatz", ch_words_go: "Zum Wortschatz →", ch_new: "Neue Challenge", ch_practice: "Jetzt üben", ch_left: "noch {n} Tage", ch_done_v: "{a} von {b} Verben sitzen", ch_done_w: "{a} von {b} Wörtern", ch_edit: "Bearbeiten", ch_editdone: "Fertig", ch_add_ph: "Verb oder Wort…", ch_fill: "Vorschlagen", ch_from_saved: "Aus Gemerkt", ch_add_all: "Alle übernehmen", ch_choose: "Aus Gemerkt wählen", ch_pick_verbs: "Deine gemerkten Verben", ch_pick_words: "Deine gemerkten Wörter", ch_pick_empty_v: "Noch keine gemerkten Verben — speichere Verben beim Konjugieren mit ☆.", ch_pick_empty_w: "Noch keine gemerkten Wörter — leg sie im Wortschatz an.", ch_timeup: "Zeit um — {a} von {b} sitzen.", ch_extend: "+1 Woche", ch_mastered: "Challenge gemeistert!", ch_mastered_sub: "Alle Einträge sitzen — Zeit für eine neue Challenge.", vocab_all: "Alle", vocab_new_cat: "Neu", vocab_cats_all: "Alle Themen", vocab_cats_less: "Weniger", vocab_new_cat_q: "Name der neuen Kategorie:", vocab_add_ph: "Wort oder Satz hinzufügen…", vocab_empty: "Noch keine Wörter — füge oben dein erstes hinzu.", vocab_practice: "Üben", vocab_word: "Wort", vocab_phrase: "Satz", vocab_type_target: "Auf {lang} eintippen…", vocab_done: "Runde geschafft!", vocab_save: "Merken", vocab_saved: "Gemerkt", vocab_seeding: "Starter-Wörter werden geladen…", vocab_suggest: "10 neue Wörter vorschlagen", vocab_due: "Heute fällig", vocab_strength: "Gedächtnisstärke", vocab_starter: "5 Startwörter laden", gr_ind: "Indikativ", gr_subj: "Konjunktiv", gr_cond: "Konditional", gr_imp: "Imperativ", gr_cont: "Verlaufsform", gr_forms: "Infinite Formen", how_formed: "Wie wird es gebildet?", key_irregulars: "Wichtige unregelmäßige Verben", irr_note: "Tippe ein Verb für die volle Konjugation.", tap_save: "Wort antippen – Bedeutung & merken", report_link: "Fehler melden", report_title: "Was stimmt nicht?", r_grammar: "Falsche Grammatik", r_unnatural: "Unnatürlich", r_translation: "Falsche Übersetzung", r_other: "Sonstiges", report_note: "Notiz (optional)…", report_send: "Senden", report_thanks: "Danke — wir schauen es uns an!", acct_created: "✓ Konto angelegt — willkommen!", zt_greets: "Richtig stark heute,|Das läuft bei dir,|Du wirst besser,|Schön, dich zu sehen,|Dranbleiben lohnt sich,|Weiter so,", zt_eyebrow: "Deine Challenge", ch_adjust: "Challenge anpassen", zt_today: "Heute schon {a} von {b} Übungen", zt_left_suffix: " — noch {n} bis zu deiner Tages-Challenge.", zt_done_suffix: " — Tages-Challenge geschafft! 🎉", zt_min_left: "Min übrig", zt_verbs_prog: "Verben {a}/{b} sitzen", zt_words_prog: "Wörter {a}/{b}", zt_streak: "{n} Tage in Folge", zt_to_list: "Zur Challenge-Liste", zt_keep: "Weiter üben", zt_to_quiz: "Zum Quiz →", zt_other_head: "Andere Sprachen", zt_lang_prog: "{a}/{b} sitzen", gf_week: "Woche", gf_weeks: "Wochen", gf_verbs: "Verben", gf_words: "Wörter", gf_min_abbr: "Min.", gf_per_day_lbl: "Übungen/Tag", gf_all_tenses: "allen Zeitformen", gf_ki_title: "Dein KI-Vorschlag — Level Mittel.", gf_ki_sub: " Schon ausgefüllt — pass alles frei an.", gf_period: "Zeitraum", gf_tense: "Zeitform", gf_conj_verbs: "Verben konjugieren", gf_num_verbs: "Anzahl Verben", gf_per_tense: "je Zeitform", gf_new_words: "Neue Wörter", gf_vocab: "Wortschatz", gf_learn_new: "neu lernen", gf_ex_per_day: "Übungen pro Tag", gf_daily_auto: "Deine Tages-Challenge — passt sich automatisch an.", gf_overview: "Challenge-Übersicht", gf_sum: "In {weeks}: {verbs} Verben je Form {tenses}, dazu {words} neue Wörter.", gf_start_cta: "Starte deine Challenge · {n} Übungen/Tag", gf_h1_pre: "Um ", gf_h1_post: " zu werden, mache eine Challenge mit uns:", gf_choose_sub: "Such dir deine Challenge-Art aus.", ch_for_lang: "Für", gf_suggest_h: "Schlag mir was vor", gf_level_mid: "LEVEL: MITTEL", gf_suggest_s: "Wir bauen dir in Sekunden eine passende Challenge — abgestimmt auf dein Niveau.", gf_ind_h: "Individuelle Challenge", gf_ind_s: "Zeitraum, Zeitformen, Verben & Wörter selbst festlegen.", gf_or_time: "oder nach Zeit", gf_by_time: "Nach Zeit", gf_time_h: "Ich gebe meine Zeit vor", gf_time_s: "„Ich möchte … Minuten am Tag üben“ — wir rechnen deine Challenge aus.", gf_back: "zurück", gf_time_q: "Wie viele Minuten möchtest du täglich üben?", gf_time_qs: "Wir berechnen deine optimale Tages-Challenge automatisch.", gf_mins_day: "Minuten pro Tag", gf_mins_min: "mindestens 3 Min. empfohlen", gf_ex_approx: "Übungen pro Tag · ≈ {n} Min.", gf_vw_daily: "~{v} Verben & {w} Wörter täglich.", gf_sum_time: "Täglich {mins} Minuten = {per} Übungen/Tag. In 2 Wochen lernst du ca. {verbs} Verben und {words} neue Wörter.", gs_title: "Deine Challenge steht{name}.", gs_sub: "Viel Spaß beim Quizzen — stell dir vor, wie du bald flüssig in deiner Lieblingssprache sprichst. 🌟", gs_set_verbs: "Verben festlegen →", gs_set_hint: "aus Gemerkten wählen, selbst tippen oder vorschlagen lassen", gs_later: "Später", gc_daily_done: "Tages-Challenge geschafft!", gc_done_plan: "Du hast deine {d}-Tage-Challenge abgeschlossen{name}! Zeit für eine neue Challenge.", gc_done_named: "{name}, du hast heute {n} Übungen gemacht — stark!", gc_done_anon: "Du hast heute {n} Übungen gemacht — stark!", gc_ex_today: "Übungen heute", gc_streak_lbl: "Tage in Folge", gc_plan_day: "Plantag", report_general: "Fehler melden", report_general_sub: "Problem melden — gern mit Screenshot", report_attach: "Screenshot anhängen", report_shot_hint: "Ein Screenshot hilft uns, das Problem schneller zu finden.", type_word: "Wort tippen", type_sentence: "Satz tippen", spk_translate: "Übersetze das", qi_title: "Wie möchtest du üben?", qi_sub: "Wähl einen Modus — jeder trainiert eine andere Fähigkeit.", qi_foot: "Tipp: Zeitform- & Verbfilter stellst du nach der Auswahl ein.", qi_back: "Übersicht", mdesc_cards: "Karten umdrehen — Antwort sehen, ganz entspannt", mdesc_choice: "Multiple Choice — die richtige Form wählen", mdesc_speed: "60-Sekunden-Sprint — wie viele schaffst du?", mdesc_type: "Form tippen oder einen Satz übersetzen", mdesc_speak: "Laut aussprechen — mit Spracherkennung",
      paywall_lock: "🔒 Quiz & Merken sind Premium", paywall_h1: "Konjugieren, ohne nachzudenken", paywall_sub: "Mit dem Quiz trainierst du aktiv, bis die Formen sitzen — und mit Merken übst du genau den Wortschatz, der dir wichtig ist.", paywall_unlock: "Premium freischalten", paywall_later: "Vielleicht später", pw_feat1: "Interaktives Quiz", pw_feat1v: "4 Modi", pw_feat2: "Merken & Vokabellisten", pw_feat2v: "unbegrenzt", pw_feat3: "Konjugation & Lernen", pw_feat3v: "bleibt frei",
      offer_badge: "🚀 WILLKOMMENSANGEBOT · −{disc} %", offer_expires: "Angebot läuft ab in {t}", offer_instead: "anstatt", offer_mo: "mtl.", offer_yr: "/ Jahr", offer_you_pay: "zahlst du:", offer_save: "du sparst {save} € (−{disc} %)", offer_secure: "Angebot sichern", offer_trial: "Erst 24 h kostenlos testen", offer_trial_b: "24 h Premium gratis", offer_close: "Angebot schließen", offer_price_label: "Preis: {price} € pro Jahr, statt {eq} € bei monatlicher Abrechnung",
      plan_hero_h1: "Lerne ohne Limits", plan_hero_sub: "Unlimitiertes Quiz & Merken in allen 5 Sprachen", plan_annual: "Jahresabo", plan_monthly: "Monatsabo", plan_best: "★ Beliebteste Wahl", plan_bonus: "🎁 Willkommensbonus", plan_per_mo: "/ Monat", plan_per_yr: "/ Jahr", plan_instead: "statt", plan_save: "du sparst {save} € (−{disc} %)", plan_mo_label: "~{price} € / Monat · statt {eq} €", plan_flex: "flexibel · entspricht {eq} € / Jahr", plan_feat1: "Interaktives Konjugations-Quiz", plan_feat2: "Favoriten & Vokabellisten", plan_feat3: "5 Sprachen — ES, FR, EN, NL, DE", plan_feat4: "Auf allen Geräten · ohne Werbung", plan_cta: "Weiter zum Bezahlen", plan_cancelable: "jederzeit kündbar", plan_have_account: "Bereits Konto?", sign_in: "Anmelden", plan_coupon: "Gutscheincode einlösen", pr_title: "Preise & Tarife", pr_eyebrow: "Preise", pr_free: "Gratis", pr_premium: "Premium", pr_feat_conj: "Verben konjugieren · alle Zeiten", pr_active: "Du hast Premium – danke! 💜", pr_anon: "Anonym", pr_konto: "Konto", pr_quiz_day: "20/Tag", pr_trial_note: "🎁 Mit Konto: 2 Tage Premium gratis testen", pr_feat_goals: "Challenges & Fortschritt", ap_lock: "🔓 Kostenloses Konto", ap_h1: "Quiz mit kostenlosem Konto", ap_sub: "Erstelle ein kostenloses Konto und übe mit dem Quiz – plus 2 Tage Premium gratis.", ap_feat1: "20 Quiz-Karten pro Tag", ap_feat2: "2 Tage Premium gratis", ap_feat3: "Fortschritt auf allen Geräten", ap_cta: "Kostenloses Konto erstellen", ql_lock: "🔓 Tageslimit erreicht", ql_h1: "20 Karten für heute geschafft!", ql_sub: "Stark! Mit Premium übst du unbegrenzt – oder komm morgen für 20 neue Karten wieder.", ql_feat1: "Quiz ohne Limit – alle Modi", ql_cta: "Premium freischalten", coupon_title: "Gutscheincode", coupon_need_login: "Bitte zuerst anmelden um einen Code einzulösen.", coupon_sign_in: "Jetzt anmelden", coupon_ph: "Code eingeben", coupon_redeem: "Einlösen", coupon_redeeming: "Wird eingelöst…",
      menu_rate: "App bewerten", menu_logout: "Abmelden", menu_cancel_sub: "Abo kündigen", menu_sub_active_until: "✓ Abo gekündigt — aktiv bis {date}", menu_delete_acc: "Konto löschen", cancel_title: "Abo kündigen", cancel_body: "Dein Premium läuft noch bis zum {date} — danach wechselst du automatisch zur kostenlosen Version. Dein Konto bleibt erhalten.", cancel_no: "Abbrechen", cancel_yes: "Jetzt kündigen", delete_title: "Konto löschen", delete_warn_days: "⚠️ Du verlierst {n} bezahlte Tage", delete_warn_body: "Dein Abo ist noch bis {date} aktiv. Wenn du zuerst kündigst, kannst du die verbleibende Zeit noch nutzen.", delete_cancel_first: "Erst Abo kündigen", delete_anyway: "Trotzdem löschen", delete_data: "Alle Daten werden unwiderruflich gelöscht.", delete_yes: "Löschen",
      sub_runs_until: "Dein Abo läuft noch bis zum {date} — bis dahin kannst du die App weiterhin nutzen.", sub_end_period: "Ende des aktuellen Laufzeitraums", goodbye_heading: "Schade, dass du uns verlässt — aber du bist jetzt Profi!", goodbye_love: "Alles Liebe für dich.", goodbye_data: "Deine Daten löschen wir selbstverständlich.", goodbye_btn: "Tschüss! 👋", pay_error: "Zahlung konnte nicht gestartet werden. Bitte versuche es erneut.", bonus_trial: "Premiumfunktion sichern", bonus_welcome: "Willkommensbonus sichern", bonus_quiz: "Hol dir Quiz- & Merkfunktion!", ios_homescreen: "Für Schnellstart: ConjuExpert zum Homescreen hinzufügen!", ios_share: "Teilen → Zum Home-Bildschirm", ios_close: "Schließen", ios_how: "So geht's", pwa_home: "ConjuExpert auf deinen Homescreen!", pwa_nostore: "Kein App Store nötig.", ios_help_title: "Auf dem iPhone hinzufügen", ios_help_1: "Tippe oben in Safari auf das <b>Teilen-Symbol</b> (Quadrat mit Pfeil nach oben).", ios_help_2: "Wähle <b>„Zum Home-Bildschirm“</b>.", ios_help_3: "Tippe oben rechts auf <b>„Hinzufügen“</b> — fertig!", and_help_title: "Auf Android hinzufügen", and_help_1: "Tippe oben rechts auf das <b>Menü</b> (⋮).", and_help_2: "Wähle <b>„App installieren“</b> bzw. <b>„Zum Startbildschirm“</b>.", and_help_3: "Bestätige mit <b>„Installieren“</b> — fertig!", pin_help_ios: "Anleitung fürs iPhone", pin_help_android: "Anleitung fürs Android", rev_kicker: "20 Sekunden · großer Effekt", rev_heading: "kurz bevor du weiterlernst …", rev_body1: "Du bist heute schon <b>{mins} Minuten</b> dran – Respekt!", rev_body2: "Hilf jetzt anderen, ihre Lieblingssprache genauso zu knacken: Mit <b>einer kurzen Bewertung</b> wird ConjuExpert gefunden — dein größter Support für uns. 💛", rev_rate: "Jetzt bewerten →", rev_feedback: "Lieber einen Wunsch / Feedback loswerden?", rev_snooze: "Später erinnern", paysuc_sub: "Du kannst alle Premium-Funktionen nutzen! Viel Spaß beim Quizzen und beim Lernen deiner Lieblingssprache 🎉", paysuc_feat1: "Quiz — alle Modi & Sprachen", paysuc_feat2: "Favoriten & Vokabellisten", paysuc_feat3: "Unlimitiert · ohne Werbung", menu_logged_in: "Angemeldet als", menu_edit_profile: "Profil ändern", menu_tarife: "Tarife und Preise", menu_pin: "App-Icon pinnen", pin_title: "Leg ConjuExpert auf deinen Startbildschirm", menu_login: "Konto erstellen / Anmelden", msub_konto: "Fortschritt sichern", msub_profil: "Name \u00b7 Sprachen \u00b7 Niveau", msub_pin: "Auf den Startbildschirm", msub_tarife: "Alle Funktionen", msub_rate: "Mit 5 Sternen unterst\u00fctzen", pin_sub: "– und du kannst sofort konjugieren und quizzen.", pin_tip: "Tipp", pin_guide_for: "Hier findest du die Anleitung für:", pin_step_ios: "Teilen → „Zum Home-Bildschirm“", pin_step_android: "Menü → „App installieren“", pin_cta: "Jetzt hinzufügen", pin_later: "Vielleicht später", pin_iphone: "iPhone / iPad", pin_android: "Android", menu_share: "App weiterempfehlen", err_cancel_fail: "Kündigung fehlgeschlagen. Bitte versuche es erneut.", err_delete_fail: "Löschen fehlgeschlagen. Bitte versuche es erneut.", guest_login_sub: "Melde dich an, um Fortschritte und Wörter speichern zu können.", guest_login_cta: "Jetzt anmelden →", login_welcome_back: "Willkommen zurück", login_almost_done: "Fast geschafft!", login_create_acct: "Konto erstellen", login_reset_pw: "Passwort zurücksetzen", login_sub_login: "Favoriten & Fortschritt auf allen Geräten sichern", login_sub_login_pay: "Meld dich an — dann geht's direkt weiter zum Bezahlen.", login_sub_signup: "Kostenlos — Daten sicher in Deutschland", login_sub_signup_pay: "Super, dass du dich für Premium entschieden hast — erstelle zuerst ein Konto, um dein Abo abzuschließen.", login_sub_reset: "Wir schicken dir einen Reset-Link", login_done_signup: "Bestätigungs-E-Mail gesendet!\nBitte prüfe dein Postfach.", login_done_reset: "Reset-Link gesendet!\nPrüfe dein Postfach.", login_pw_ph: "Passwort (min. 6 Zeichen)", login_forgot_pw: "Passwort vergessen?", login_btn_signup: "Konto erstellen", login_btn_reset: "Reset-Link senden", login_or: "oder", login_google: "Mit Google anmelden", login_apple: "Mit Apple anmelden", login_no_account: "Noch kein Konto?", login_has_account: "Schon registriert?", login_do_register: "Registrieren", login_back: "← Zurück zum Login", login_data: "🔒 Daten gespeichert in Frankfurt, DE", goal_ai: "KI-Vorschlag", goal_ai_badge: "MITTEL", goal_time: "Nach Zeit", goal_time_note: "10 Min/Tag", goal_custom: "Individuell", goal_custom_note: "8 Verben · 20 Wörter", goal_daily: "Übungen pro Tag", goal_time_approx: "≈ 6 Min. · anpassbar"
    },
    es: {
      tagline: "conjugar · quiz · aprender", hi: "¡Hola, {name}! 👋", ready: "Cuando quieras, {name}",
      cj_acc: "Crear cuenta", cj_later: "Más tarde", cj_reorder_head: "Ordena los iconos a tu gusto", cj_reorder_text: "Arrastra tu idioma favorito al principio — será tu idioma de inicio, así al tocar el icono de ConjuExpert en la pantalla de inicio la app se abre directamente en él. El menú de abajo se reordena igual.", cj_no_thx: "No, gracias",
      lang_start_set: "{lang} ahora se abre primero", lang_reorder_hint: "Mantén pulsado y arrastra para reordenar",
      theme_add: "Añadir", theme_add_ph: "Tu propio tema…",
      cj_p1_head: "¡Genial — ya van 5 verbos!", cj_p1_text: "Crea una cuenta gratis: tu progreso se guarda y practicas <b>2 días más</b> con Premium – Quiz + Guardados.",
      cj_p2_head: "Siempre a mano", cj_p2_text: "Añade ConjuExpert a tu pantalla de inicio como una app – un toque y conjugas &amp; haces quiz en segundos.", cj_p2_yes: "A la pantalla de inicio",
      cj_p3_head: "Espera, ¡no te vayas sin tu progreso!", cj_p3_text: "Una cuenta gratis (10 segundos) lo conserva todo – y te da <b>2 días más</b> de Premium (Quiz + Guardados).", cj_p3_yes: "Guardar mi progreso", cj_p3_no: "Salir igualmente",
      cj_tend_head: "Tu prueba Premium de 24 h terminó", cj_tend_text: "Conjugar &amp; Aprender siguen gratis. ¿Quieres seguir con el quiz? Con una cuenta gratis practicas el quiz «Tarjetas» (20 rondas/día) – y consigues <b>2 días de Premium</b> gratis.", cj_tend_yes: "Crear cuenta – Quiz + 2 días", cj_tend_no: "Solo consultar &amp; aprender",
      cj_help_head: "Ayúdanos a mejorar", cj_help_text: "Ayúdanos a mejorar y a ofrecerte a ti y a los demás ConjuExperts la mejor experiencia posible. Acabamos de empezar y necesitamos tu ayuda si algo no funciona bien.", cj_p8_head: "¡Qué bien tenerte de vuelta!", cj_p8_text: "Tu progreso sigue aquí. Asegúralo con una cuenta gratis antes de que se pierda.",
      cj_fb_head: "¿Qué tal te va?", cj_fb_text: "Sé sincero/a: ¿qué es lo que más te gusta y qué deberíamos mejorar?", cj_fb_gift: "🎁 Danos tu opinión y recibe un <b>código de 5 €</b> para el plan anual.", cj_fb_rate_q: "¿Qué te parece ConjuExpert?", cj_fb_ph: "Tu opinión…", cj_fb_send: "Opinar &amp; lograr 5 €", cj_fb_sending: "Enviando…", cj_fb_err: "No se pudo enviar, inténtalo de nuevo.",
      cj_fbt_head: "¡Gracias por tu opinión!", cj_fbt_text: "Aquí tienes tu regalo: con el código <b>WILLKOMMEN</b> consigues Premium por <b>24,99 €/año</b> en vez de 29,99 € – válido hasta el final de tu prueba.", cj_fb_secure: "Guardar código &amp; obtener Premium",
      hint_quiz_cards_h: "Tarjetas: memoriza verbos sin estrés", hint_quiz_cards_1: "Elige tiempo verbal &amp; tema favorito, además del sentido (lengua materna ↔ idioma que aprendes).", hint_quiz_cards_2: "Mira el verbo + tiempo, piensa la forma en tu cabeza — toca la tarjeta para girarla.", hint_quiz_cards_3: "Toca las palabras desconocidas de la frase de ejemplo → traducir &amp; guardar.", hint_quiz_cards_4: "Sin presión, sin escribir: ideal para conocer las formas y repasar rápido.", hint_quiz_speed_h: "Veloz: 60 segundos a tope", hint_quiz_speed_1: "Elige tiempo &amp; tema y empieza — tienes 60 segundos.", hint_quiz_speed_2: "Toca la forma correcta lo más rápido posible — cada acierto suma.", hint_quiz_speed_3: "Ideal para recuperar las formas con rapidez, con algo de presión.",
      hint_quiz_choice_h: "Opción: reconocer rápido la forma correcta", hint_quiz_choice_1: "Una entrada perfecta a un tiempo verbal nuevo.", hint_quiz_choice_2: "Elige tiempo verbal &amp; tema favorito.", hint_quiz_choice_3: "Verbo + tiempo requerido + cuatro variantes — toca la correcta y recibe respuesta al instante.", hint_quiz_choice_4: "Toca las palabras desconocidas de la frase de ejemplo → traducir &amp; guardar.",
      hint_quiz_type_h: "Escribir: conjuga de forma activa", hint_quiz_type_1: "Escribirlo tú mismo es lo que más fija las formas — junto a <b>Hablar</b>, el modo más intensivo.", hint_quiz_type_2: "Elige tiempo, tema &amp; sentido — y si practicas verbos sueltos o traduces una frase entera.", hint_quiz_type_3: "Toca las palabras desconocidas de la frase de ejemplo → traducir &amp; guardar.",
      hint_quiz_speak_h: "Hablar: dilo en voz alta", hint_quiz_speak_1: "Decirlo tú mismo es lo que más fija las formas — junto a <b>Escribir</b>, el modo más intensivo.", hint_quiz_speak_2: "Elige tiempo, tema &amp; sentido — y si practicas verbos sueltos o una frase entera.", hint_quiz_speak_3: "Toca el micrófono para empezar y para terminar la entrada de voz.", hint_quiz_speak_4: "Toca las palabras desconocidas → traducir &amp; guardar.",
      hint_quiz_texte_h: "Textos: pon a prueba tu comprensión lectora & auditiva", hint_quiz_texte_1: "Elige tema favorito, tiempo verbal &amp; qué tipo de verbos practicar.", hint_quiz_texte_2: "Al final te esperan preguntas de comprensión.", hint_quiz_texte_3: "Toca cualquier palabra del texto → traducir &amp; guardar.", hint_quiz_texte_4: "Consejo: activa “Usar mis palabras” — tus propias palabras aparecen en la historia.",
      hint_learn_h: "Bienvenido a Aprender", hint_learn_1: "Cada tiempo verbal se explica de forma bilingüe, con ejemplos generados automáticamente.", hint_learn_2: "Usa el selector de tiempos de arriba como una <b>chuleta</b> para saltar entre formas.", hint_learn_3: "Toca cualquier palabra de ejemplo para guardarla en tu vocabulario.",
      hint_saved_verbs_h: "Verbos guardados", hint_saved_verbs_1: "Aquí se reúnen todos los verbos que guardaste con ☆ al conjugar.", hint_saved_verbs_2: "Toca un verbo para volver a abrir su conjugación completa.", hint_saved_verbs_3: "Elígelos directamente en el <b>Quiz</b> y practica con intención.", hint_saved_verbs_4: "Así creas tu propia lista de práctica personal.",
      hint_saved_vocab_h: "Tu vocabulario", hint_saved_vocab_1: "Crea tu propio tema (p. ej. “Visita al médico”) &amp; elige el sentido de práctica.", hint_saved_vocab_2: "✨ SÚPER FUNCIÓN: genera palabras nuevas — en “Nueva” escribe p. ej. “Adjetivos” y toca “Sugerir 10 palabras nuevas”.", hint_saved_vocab_3: "Tus palabras guardadas también pueden incluirse en los textos del quiz.",
      tab_conjugate: "Conjugar", tab_quiz: "Quiz", tab_learn: "Aprender", conjugate: "Conjugar",
      saved: "Verbos guardados", recent: "Recientes", clear: "borrar",
      empty_title: "Escribe un verbo para conjugar", empty_sub: "Todos los tiempos en {n} idiomas — escribe un verbo o pulsa 🎲.",
      regular: "regular", irregular: "irregular", recommended: "Recomendado", ad_cta: "Practicar →",
      mode: "Modo", m_type: "⌨ Escribir", m_choice: "◉ Opción", m_speed: "⚡ Veloz", m_texte: "📖 Textos", mdesc_texte: "Lee una historia con IA — traduce, completa verbos o responde preguntas", texte_question: "Comprensión", texte_cloze: "Completar verbos", texte_translate: "Traducir", texte_new: "Nueva historia", texte_writing: "Escribiendo tu historia…", texte_error: "No se pudo escribir una historia — inténtalo de nuevo.", texte_comprehension: "Preguntas de comprensión", texte_done: "¡Historia completada!", texte_fill_hint: "Pon el verbo en el tiempo correcto", texte_learn: "Aprender el verbo", texte_translation: "Traducción", texte_read: "Leer en voz alta", texte_speed: "¿Qué velocidad?", texte_voice: "¿Qué voz?", texte_voice_auto: "Automática (mejor)", texte_almost: "casi listo …", texte_voice_f: "Mujer", texte_voice_m: "Hombre", texte_pause: "Pausa", texte_resume: "Seguir", texte_mywords_lbl: "Mi vocabulario", texte_mywords: "Usar mis palabras",
      which_tense: "Tiempo", tense_word: "Tiempo", all_tenses: "Todos los tiempos", all_themes: "Todos los temas", which_verbs: "Verbos", which_dir: "Dirección", dir_produce: "PRODUCIR", dir_recognize: "RECONOCER", dir_random: "ALEATORIO", which_theme: "Temas", quiz_mode_hd: "Modo quiz", explain_hd: "Explicación", req_form: "Buscado", tip_label: "Consejo", tip_meaning: "Significado", tip_sentence: "Frase", none_all: "Ninguno — se practican todos los tiempos", all_btn: "Todos", none_btn: "Ninguno", mist_clear_title: "¡Errores superados!", mist_clear_sub: "¡Bien hecho! Repasaste todos los verbos que fallaste.", mist_practice: "Practicar errores", view_conj: "Ver conjugación completa", mist_exit: "Volver a todos los verbos",
      correct: "correctas", accuracy: "precisión", streak: "racha",
      type_form: "escribe la forma…", check: "Comprobar", next: "Siguiente →", correct_excl: "✓ ¡Correcto!", accent_hint: "¡Bien! Solo cuida la tilde: {answer}", answer: "Respuesta:",
      hint_type: "Escribe la forma correcta para el pronombre y el tiempo.", hint_choice: "Elige la forma correcta — 4 opciones.",
      challenge: "Reto de 60 segundos", challenge_sub: "Responde tantas como puedas antes de que acabe el tiempo. ¡Toca rápido la forma correcta!",
      best: "Mejor:", start: "Empezar →", sec: "seg", pts: "pts", go: "¡Vamos! Cada acierto suma.",
      times_up: "¡Se acabó el tiempo!", in60: "correctas en 60s", new_best: "🎉 ¡Nuevo récord!", play_again: "Jugar otra vez →", back: "Atrás",
      tenses: "Tiempos de {lang}", bilingual: "Bilingüe · {a} ⇄ {b}", level: "Nivel", native: "Lengua materna",
      explanation: "Explicación", mnemonic: "🧠 Regla mnemotécnica", signal_words: "Palabras clave", examples: "Ejemplos", when_use: "Cuándo usar", compare: "Comparar",
      fb_offline: "Las explicaciones con IA funcionan en la vista previa. Mientras, las reglas básicas:",
      fb_net: "No se pudo cargar la explicación. Aquí las reglas básicas:",
      welcome: "¡Hey! Vas a:", welcome_sub: "conjugar verbos en 5 idiomas, hacer quizzes y aprender tu idioma favorito de forma fácil.",
      your_name: "Tu nombre…", mother_tongue: "Tu lengua materna", skill_q: "Tu nivel", skill_beginner: "Principiante", skill_beginner_sub: "verbos comunes", skill_intermediate: "Medio", skill_intermediate_sub: "+ irregulares", skill_advanced: "Avanzado", skill_advanced_sub: "todos", lets_go: "¡Vamos! →", skip: "Omitir", remove_name: "Quitar nombre", profile: "Perfil", listen: "Escuchar", m_cards: "🃏 Tarjetas", flip: "Toca para girar", got_it: "Lo sé", again: "Repasar", mistakes: "Errores", no_mistakes: "Aún no hay errores — aparecerán aquí para repasar.", tab_saved: "Guardados", reveal: "Ver traducción", learned: "Aprendido ✓", saved_empty: "Aún no hay verbos guardados. Pulsa la ☆ en una conjugación para guardarlo.", tour_conj: "El núcleo: conjuga cualquier verbo en 5 idiomas, en todos los tiempos — de un vistazo.", tour_quiz: "Ponte a prueba — tarjetas, opción, escribir y hablar — con frases de ejemplo generadas por IA.", tour_learn: "Entiende cada tiempo de forma bilingüe, con ejemplos de IA que puedes tocar y guardar.", tour_saved: "Guarda verbos y palabras, crea tu vocabulario y practícalo con repetición espaciada.", tour_more1: "Lo esencial: cada verbo en 5 idiomas y todos los tiempos, más aprendizaje bilingüe con ejemplos de IA.", tour_more2: "Practica con el quiz (tarjetas, opción, escribir y hablar), guarda palabras y avanza con challenges.", tour_goals_h: "Challenges", tour_goal: "Crea tu challenge personal — sugerencia IA, por tiempo o a medida. Sigue tu progreso diario y mantente constante.", tour_trial_head: "Tu regalo: 24 h Premium", tour_trial_sub: "Después activa tu descuento de bienvenida — las tablas de conjugación siempre son gratis.", tour_feat1: "Quiz y Guardados — todo desbloqueado", tour_feat2: "Todos los tiempos y frases con IA", tour_feat3: "5 idiomas, sin anuncios", eg_step1: "Verbo aleatorio – guarda con ★", eg_step2: "Practica en el Quiz y elige temas favoritos", eg_step3: "Entrena las palabras guardadas en 'Guardados'", hero_kicker: "¡Hola {name}! 👋", hero_plan: "Tu challenge de hoy, {name}:", hero_plan_anon: "Tu challenge de hoy:", tour_next: "Siguiente", tour_start: "Empezar", tour_skip: "Omitir", t2_hi: "¡Qué bien que estés aquí, {name}! 👋", t2_hi_anon: "¡Qué bien que estés aquí! 👋", t2_ask: "¿Quieres un recorrido rápido por la app — o empezar directamente?", t2_start_tour: "Empezar el recorrido", t2_skip_tour: "Empezar directamente", t2_overview_t: "Esto te espera", t2_quiz_tap_t: "Quiz · Tocar", t2_quiz_type_t: "Quiz · Escribir", t2_quiz_text_t: "Quiz · Texto", t2_prices_t: "Planes y precios", t2_quizmodes_x: "Practica activamente hasta dominarlo — elige tu modo.", t2_tap_x: "Elige la forma correcta entre 4 opciones.", t2_type_x: "Escribe tú la forma — entrena la ortografía de forma activa.", t2_text_x: "Elige tema, tiempo y vocabulario — la IA te lee la historia: pon a prueba tu comprensión auditiva.", t2_conj_x: "Escribe un verbo o tira el dado, elige el tiempo — guárdalo con ★.", t2_merken_x: "Toca y guarda palabras en frases de práctica — o añádelas tú.", t2_prices_x: "Conjugar y aprender son gratis para siempre · 24 h de Premium para probar", t2_ov1_t: "Tu reto de aprendizaje", t2_ov1_d: "Fija una challenge diaria, semanal o mensual — sigue tu progreso y racha", t2_ov2_t: "Lista de vocabulario", t2_ov2_d: "Toca y guarda palabras en frases — o añádelas tú", t2_ov3_t: "Temas favoritos", t2_ov3_d: "Crea tus propios temas en Guardado y practícalos en los quizzes", t2_m_cards: "Tarjetas", t2_m_tap: "Tocar", t2_m_type: "Escribir", t2_m_speak: "Hablar", t2_m_speed: "⚡ Veloz", t2_m_text: "Texto", t2_f_topic: "Tema", t2_f_tense: "Tiempo", t2_f_words: "Palabras", t2_v_travel: "Viajes", t2_v_saved: "Mi lista", t2_v_work: "trabajo", t2_p1_t: "24 h Premium", t2_p1_d: "prueba todo — sin cuenta", t2_p2_t: "Con cuenta · gratis", t2_p2_d: "Conjugar, Aprender y 20 tarjetas / día", t2_p3_t: "ConjuPremium", t2_p3_d: "todo libre · anual 29,99 € · mensual 2,99 €", m_speak: "🎤 Hablar", speak_tap: "Toca el micro y di la forma", speak_heard: "Oído:", speak_nomic: "La entrada de voz no está disponible aquí.", spk_form: "Decir palabra", spk_sentence: "Decir frase", spk_what: "¿Qué practicar?", spk_say: "Dilo en {lang}",
      dq_form: "Forma conjugada", vocab_translate: "Traducir", offline_note: "⚡ Sin conexión — ejemplos y traducciones necesitan internet", aux_title: "Formar los tiempos compuestos", aux_logic: "Todos los tiempos compuestos se forman igual: conjugas el verbo auxiliar {aux} según persona y tiempo, y añades el participio invariable {part}. Solo cambia el auxiliar — el participio no cambia.", aux_note: "Tiempos compuestos = verbo auxiliar + participio.", aux_participle: "Participio", cards_hint: "Conjuga el verbo en el tiempo pedido mentalmente – toca para ver la solución", cards_hint_type: "Conjuga el verbo en el tiempo pedido · escríbelo en la casilla", cards_hint_speak: "Conjuga el verbo en el tiempo pedido · toca el micro para hablar", choose_label: "Elige:", tap_retry: "Tocar para traducir", dq_infinitive: "Infinitivo", dq_belongs: "De", dq_participle: "Participio", dq_gerund: "Gerundio", spk_relearn: "Sigo aprendiendo — ver respuesta", spk_correct_is: "La frase correcta:", spk_next_sentence: "Siguiente frase →", speak_denied: "Micrófono bloqueado — permite el acceso en el navegador.", speak_nospeech: "No te he oído — inténtalo de nuevo.", mic_start: "Toca una vez para grabar", sent_mist_practice: "Practicar frases falladas", spk_context: "En una frase", cloze_instr: "Conjuga el verbo en el tiempo pedido", choose_tile: "elige la casilla correcta", mic_stop: "Toca al terminar", tap_word: "toca una palabra para ver su significado", practice_again: "Practicar otra vez", sk_title: "Challenge y racha", sk_today: "Hoy", sk_streak: "Días seguidos", sk_best: "Récord", sk_days: "días", sk_done: "¡Challenge lograda!", sk_left: "{n} más para la challenge de hoy", sk_explain: "Cada conjugación y respuesta del quiz cuenta. Completa tu challenge diaria para mantener tu racha — si faltas un día, se reinicia.", sk_close: "Entendido", dq_fuzzy: "reconocido sin tildes", dq_switched: "cambiado al infinitivo", dq_guess: "deducido por la terminación", tfilter_hint: "Desliza · toca para mostrar / ocultar un tiempo", verb_ph: "Escribe un verbo…", autoread: "Leer la respuesta", autoread_sub: "si es correcta", review: "Resumen", native_ph: "…o un verbo en tu idioma", saved_verbs: "Verbos", saved_vocab: "Vocabulario", gm_hint_tag: "solo la 1.ª vez", gm_hint_tx: "Aquí se guarda todo — <b>palabras, verbos y tus listas</b>. Arriba: lo que toca hoy.", gm_due_head: "Para hoy · de todas las listas", gm_words_verbs: "palabras y verbos", gm_review_now: "Repasar ahora", gm_your_lists: "Tus listas", gm_verbs: "Verbos guardados", gm_words: "Palabras guardadas", gm_words_n: "palabras", gm_due: "para hoy", gm_new_list: "Lista", gm_back: "Guardado", imp_open: "Pegar lista", imp_title: "Pegar una lista entera", imp_help: "Una palabra por línea. Traducción opcional: casa - Haus. Si falta, la traducimos.", imp_ph: "una palabra por línea…", imp_into: "En la lista:", imp_cta: "Añadir palabras", imp_checking: "Revisando tu lista…", imp_review_title: "Revisar y añadir", imp_review_sub: "{n} avisos — toca para aceptar o mantener el original.", imp_add: "Añadir", imp_added_note: "traducción añadida", imp_orig: "era:", gm_saved_toast: "«{w}» guardado → Palabras guardadas", gm_ch_cta_h: "Crea tu challenge", gm_ch_cta_s: "Tu plan con meta — verbos y palabras.", gm_saved_verb_toast: "«{w}» guardado → Verbos guardados", mv_title: "Mover a", cross_open: "De otro idioma", cross_title: "Copiar de otro idioma", cross_help: "Elige un idioma y sus listas — traducimos las palabras por ti.", cross_srch: "Idioma origen", cross_lists: "¿Qué listas?", cross_cta: "Copiar y traducir", cross_busy: "Traduciendo tus palabras…", cross_done: "{n} palabras copiadas", cross_offline: "Necesita internet", lch_title: "Nueva lista", lch_name_ph: "Nombre — p. ej. Viaje, Podcast…", lch_how: "¿Cómo llenarla?", lch_empty: "Empezar vacía", lch_tpl: "Con plantilla", saved_tap_hint: "Toca una celda para oírla · ✕ elimina el verbo", ch_tab: "Challenge", ch_empty_head: "Aún no hay challenge en {lang}", ch_empty: "Crea una y practica con foco — cada idioma tiene la suya.", ch_create: "Crear challenge", cs_day: "Día", cs_left: "quedan {n}", cs_done: "¡hecho hoy! ✓", cs_start: "Empezar challenge", cs_plan: "tu plan", ch_moment: "«{v}» ya lo dominas — ¡hecho!", ch_words_hint: "Las palabras se practican en tu Vocabulario", ch_words_go: "Al Vocabulario →", ch_new: "Nueva challenge", ch_practice: "Practicar ahora", ch_left: "quedan {n} días", ch_done_v: "{a} de {b} verbos dominados", ch_done_w: "{a} de {b} palabras", ch_edit: "Editar", ch_editdone: "Listo", ch_add_ph: "Verbo o palabra…", ch_fill: "Sugerir", ch_from_saved: "De Guardados", ch_add_all: "Añadir todos", ch_choose: "Elegir de guardados", ch_pick_verbs: "Tus verbos guardados", ch_pick_words: "Tus palabras guardadas", ch_pick_empty_v: "Aún no hay verbos guardados — guárdalos con ☆ al conjugar.", ch_pick_empty_w: "Aún no hay palabras guardadas — añádelas en Vocabulario.", ch_timeup: "Se acabó el tiempo — {a} de {b} dominados.", ch_extend: "+1 semana", ch_mastered: "¡Challenge dominada!", ch_mastered_sub: "Todo dominado — hora de una nueva challenge.", vocab_all: "Todo", vocab_new_cat: "Nueva", vocab_cats_all: "Todos los temas", vocab_cats_less: "Menos", vocab_new_cat_q: "Nombre de la nueva categoría:", vocab_add_ph: "Añade una palabra o frase…", vocab_empty: "Aún no hay palabras — añade la primera arriba.", vocab_practice: "Practicar", vocab_word: "palabra", vocab_phrase: "frase", vocab_type_target: "Escríbelo en {lang}…", vocab_done: "¡Ronda completada!", vocab_save: "Guardar", vocab_saved: "Guardado", vocab_seeding: "Cargando palabras iniciales…", vocab_suggest: "Sugerir 10 palabras nuevas", vocab_due: "Para hoy", vocab_strength: "Fuerza de memoria", vocab_starter: "Cargar 5 palabras iniciales", gr_ind: "Indicativo", gr_subj: "Subjuntivo", gr_cond: "Condicional", gr_imp: "Imperativo", gr_cont: "Continuo", gr_forms: "Formas no personales", how_formed: "¿Cómo se forma?", key_irregulars: "Verbos irregulares clave", irr_note: "Toca un verbo para ver su conjugación completa.", tap_save: "toca una palabra – significado y guardar", report_link: "Reportar error", report_title: "¿Qué falla?", r_grammar: "Gramática incorrecta", r_unnatural: "Poco natural", r_translation: "Traducción incorrecta", r_other: "Otra cosa", report_note: "Nota (opcional)…", report_send: "Enviar", report_thanks: "¡Gracias, lo revisaremos!", acct_created: "✓ Cuenta creada — ¡bienvenido/a!", zt_greets: "Lo estás petando hoy,|Vas genial,|Cada vez mejor,|Qué bien verte,|La constancia compensa,|Sigue así,", zt_eyebrow: "Tu challenge", ch_adjust: "Ajustar challenge", zt_today: "Hoy ya {a} de {b} ejercicios", zt_left_suffix: " — faltan {n} para tu challenge diaria.", zt_done_suffix: " — ¡challenge diaria lograda! 🎉", zt_min_left: "min restantes", zt_verbs_prog: "Verbos {a}/{b} dominados", zt_words_prog: "Palabras {a}/{b}", zt_streak: "{n} días seguidos", zt_to_list: "A tu lista de challenge", zt_keep: "Seguir practicando", zt_to_quiz: "Al quiz →", zt_other_head: "Otros idiomas", zt_lang_prog: "{a}/{b} dominados", gf_week: "semana", gf_weeks: "semanas", gf_verbs: "Verbos", gf_words: "Palabras", gf_min_abbr: "min", gf_per_day_lbl: "Ejercicios/día", gf_all_tenses: "todos los tiempos", gf_ki_title: "Tu propuesta de IA — nivel medio.", gf_ki_sub: " Ya rellenado — ajústalo libremente.", gf_period: "Periodo", gf_tense: "Tiempo", gf_conj_verbs: "Conjugar verbos", gf_num_verbs: "Número de verbos", gf_per_tense: "por tiempo", gf_new_words: "Palabras nuevas", gf_vocab: "Vocabulario", gf_learn_new: "aprender", gf_ex_per_day: "ejercicios por día", gf_daily_auto: "Tu challenge diaria — se adapta sola.", gf_overview: "Resumen de la challenge", gf_sum: "En {weeks}: {verbs} verbos en {tenses}, más {words} palabras nuevas.", gf_start_cta: "Empieza tu challenge · {n} ejercicios/día", gf_h1_pre: "Para convertirte en ", gf_h1_post: ", haz una challenge con nosotros:", gf_choose_sub: "Elige tu tipo de challenge.", ch_for_lang: "Para", gf_suggest_h: "Propón una", gf_level_mid: "NIVEL: MEDIO", gf_suggest_s: "Te creamos una challenge a medida en segundos, según tu nivel.", gf_ind_h: "Challenge personalizada", gf_ind_s: "Define tú el periodo, los tiempos, los verbos y las palabras.", gf_or_time: "o por tiempo", gf_by_time: "Por tiempo", gf_time_h: "Yo pongo mi tiempo", gf_time_s: "«Quiero practicar … minutos al día» — calculamos tu challenge.", gf_back: "atrás", gf_time_q: "¿Cuántos minutos quieres practicar al día?", gf_time_qs: "Calculamos automáticamente tu challenge diaria ideal.", gf_mins_day: "Minutos al día", gf_mins_min: "mínimo 3 min recomendado", gf_ex_approx: "Ejercicios por día · ≈ {n} min", gf_vw_daily: "~{v} verbos y {w} palabras al día.", gf_sum_time: "{mins} minutos al día = {per} ejercicios/día. En 2 semanas aprenderás unos {verbs} verbos y {words} palabras nuevas.", gs_title: "Tu challenge está lista{name}.", gs_sub: "Disfruta del quiz — imagínate hablando pronto con fluidez tu idioma favorito. 🌟", gs_set_verbs: "Elegir verbos →", gs_set_hint: "elige de Guardados, escríbelos o pide sugerencias", gs_later: "Más tarde", gc_daily_done: "¡Challenge diaria hecha!", gc_done_plan: "¡Has completado tu challenge de {d} días{name}! Hora de una nueva.", gc_done_named: "{name}, hoy has hecho {n} ejercicios — ¡genial!", gc_done_anon: "Hoy has hecho {n} ejercicios — ¡genial!", gc_ex_today: "Ejercicios hoy", gc_streak_lbl: "Días seguidos", gc_plan_day: "Día del plan", report_general: "Reportar un problema", report_general_sub: "Error o problema — captura bienvenida", report_attach: "Adjuntar captura", report_shot_hint: "Una captura nos ayuda a encontrar el problema más rápido.", type_word: "Escribir palabra", type_sentence: "Escribir frase", spk_translate: "Traduce esto", qi_title: "¿Cómo quieres practicar?", qi_sub: "Elige un modo — cada uno entrena una habilidad distinta.", qi_foot: "Consejo: ajusta los filtros de tiempo y verbos tras elegir.", qi_back: "Resumen", mdesc_cards: "Voltear tarjetas — ver la respuesta, sin presión", mdesc_choice: "Opción múltiple — elige la forma correcta", mdesc_speed: "Sprint de 60 s — ¿cuántas puedes?", mdesc_type: "Escribe la forma o traduce una frase", mdesc_speak: "Dílo en voz alta — reconocimiento de voz",
      paywall_lock: "🔒 El Quiz y Guardados son Premium", paywall_h1: "Conjuga sin pensar", paywall_sub: "El Quiz te entrena activamente hasta que las formas se quedan fijas — y Guardados te permite practicar exactamente el vocabulario que te importa.", paywall_unlock: "Desbloquear Premium", paywall_later: "Quizás más tarde", pw_feat1: "Quiz interactivo", pw_feat1v: "4 modos", pw_feat2: "Guardados y listas de vocab.", pw_feat2v: "ilimitado", pw_feat3: "Conjugación y Aprender", pw_feat3v: "sigue gratis",
      offer_badge: "🚀 OFERTA DE BIENVENIDA · −{disc} %", offer_expires: "La oferta expira en {t}", offer_instead: "en vez de", offer_mo: "mes.", offer_yr: "/ año", offer_you_pay: "pagas:", offer_save: "ahorras {save} € (−{disc} %)", offer_secure: "Aprovechar oferta", offer_trial: "Probar 24 h gratis primero", offer_trial_b: "24 h Premium gratis", offer_close: "Cerrar oferta", offer_price_label: "Precio: {price} € al año, en vez de {eq} € mensuales",
      plan_hero_h1: "Aprende sin límites", plan_hero_sub: "Quiz y Guardados ilimitados en los 5 idiomas", plan_annual: "Plan anual", plan_monthly: "Plan mensual", plan_best: "★ Más popular", plan_bonus: "🎁 Bono de bienvenida", plan_per_mo: "/ mes", plan_per_yr: "/ año", plan_instead: "en vez de", plan_save: "ahorras {save} € (−{disc} %)", plan_mo_label: "~{price} € / mes · en vez de {eq} €", plan_flex: "flexible · equiv. {eq} € / año", plan_feat1: "Quiz de conjugación interactivo", plan_feat2: "Guardados y listas de vocabulario", plan_feat3: "5 idiomas — ES, FR, EN, NL, DE", plan_feat4: "Todos los dispositivos · sin anuncios", plan_cta: "Continuar al pago", plan_cancelable: "cancela cuando quieras", plan_have_account: "¿Ya tienes cuenta?", sign_in: "Iniciar sesión", plan_coupon: "Canjear código de descuento", pr_title: "Precios y planes", pr_eyebrow: "Precios", pr_free: "Gratis", pr_premium: "Premium", pr_feat_conj: "Conjugar verbos · todos los tiempos", pr_active: "Tienes Premium, ¡gracias! 💜", pr_anon: "Anónimo", pr_konto: "Cuenta", pr_quiz_day: "20/día", pr_trial_note: "🎁 Con cuenta: 2 días de Premium gratis", pr_feat_goals: "Challenges y progreso", ap_lock: "🔓 Cuenta gratis", ap_h1: "Quiz con cuenta gratis", ap_sub: "Crea una cuenta gratis para practicar con el quiz, y 2 días de Premium gratis.", ap_feat1: "20 tarjetas de quiz al día", ap_feat2: "2 días de Premium gratis", ap_feat3: "Progreso en todos tus dispositivos", ap_cta: "Crear cuenta gratis", ql_lock: "🔓 Límite diario alcanzado", ql_h1: "¡20 tarjetas hechas por hoy!", ql_sub: "¡Bien hecho! Con Premium practicas sin límites, o vuelve mañana para 20 tarjetas nuevas.", ql_feat1: "Quiz sin límite — todos los modos", ql_cta: "Desbloquear Premium", coupon_title: "Código de descuento", coupon_need_login: "Por favor, inicia sesión para canjear un código.", coupon_sign_in: "Iniciar sesión", coupon_ph: "Introduce el código", coupon_redeem: "Canjear", coupon_redeeming: "Canjeando…",
      menu_rate: "Valorar la app", menu_logout: "Cerrar sesión", menu_cancel_sub: "Cancelar suscripción", menu_sub_active_until: "✓ Suscripción cancelada — activa hasta {date}", menu_delete_acc: "Eliminar cuenta", cancel_title: "Cancelar suscripción", cancel_body: "Tu Premium está activo hasta el {date} — luego cambias automáticamente a la versión gratuita. Tu cuenta se conserva.", cancel_no: "Volver", cancel_yes: "Cancelar ahora", delete_title: "Eliminar cuenta", delete_warn_days: "⚠️ Perderás {n} días de pago", delete_warn_body: "Tu suscripción está activa hasta el {date}. Si cancelas primero, puedes aprovechar el tiempo restante.", delete_cancel_first: "Cancelar suscripción primero", delete_anyway: "Eliminar de todas formas", delete_data: "Todos los datos se eliminarán definitivamente.", delete_yes: "Eliminar",
      sub_runs_until: "Tu suscripción sigue activa hasta el {date} — puedes seguir usando la app hasta entonces.", sub_end_period: "fin del período de facturación actual", goodbye_heading: "Una pena que te vayas — ¡pero ya eres un experto!", goodbye_love: "Todo lo mejor para ti.", goodbye_data: "Por supuesto, eliminaremos tus datos.", goodbye_btn: "¡Adiós! 👋", pay_error: "No se pudo iniciar el pago. Por favor, inténtalo de nuevo.", bonus_trial: "Asegurar Premium", bonus_welcome: "Aprovechar bono de bienvenida", bonus_quiz: "¡Consigue Quiz y Guardados!", ios_homescreen: "¡Añade ConjuExpert a tu pantalla de inicio!", ios_share: "Compartir → Añadir a pantalla de inicio", ios_close: "Cerrar", ios_how: "Cómo se hace", pwa_home: "¡ConjuExpert en tu pantalla de inicio!", pwa_nostore: "Sin tienda de apps.", ios_help_title: "Añádelo en tu iPhone", ios_help_1: "En Safari, toca arriba el <b>botón Compartir</b> (cuadrado con una flecha hacia arriba).", ios_help_2: "Elige <b>“Añadir a pantalla de inicio”</b>.", ios_help_3: "Toca <b>“Añadir”</b> arriba a la derecha — ¡listo!", and_help_title: "Añádelo en tu Android", and_help_1: "Toca el <b>menú</b> (⋮) arriba a la derecha.", and_help_2: "Elige <b>“Instalar app”</b> o <b>“Añadir a pantalla de inicio”</b>.", and_help_3: "Confirma con <b>“Instalar”</b> — ¡listo!", pin_help_ios: "Guía para iPhone", pin_help_android: "Guía para Android", rev_kicker: "20 segundos · gran impacto", rev_heading: "antes de seguir aprendiendo …", rev_body1: "¡Llevas ya <b>{mins} minutos</b> hoy — ¡impresionante!", rev_body2: "Ayuda a otros a descubrir su idioma favorito: con una <b>breve valoración</b>, más gente encuentra ConjuExpert — tu mayor apoyo para nosotros. 💛", rev_rate: "Valorar ahora →", rev_feedback: "¿Prefieres dejar un comentario?", rev_snooze: "Recordármelo después", paysuc_sub: "¡Ya puedes usar todas las funciones Premium! Disfruta del quiz y el aprendizaje de tu idioma favorito 🎉", paysuc_feat1: "Quiz — todos los modos e idiomas", paysuc_feat2: "Favoritos y listas de vocabulario", paysuc_feat3: "Ilimitado · sin anuncios", menu_logged_in: "Conectado como", menu_edit_profile: "Editar perfil", menu_tarife: "Tarifas y precios", menu_pin: "Fijar icono", pin_title: "Añade ConjuExpert a tu pantalla de inicio", menu_login: "Crear cuenta / Entrar", msub_konto: "Guarda tu progreso", msub_profil: "Nombre \u00b7 idiomas \u00b7 nivel", msub_pin: "A la pantalla de inicio", msub_tarife: "Todas las funciones", msub_rate: "Ap\u00f3yanos con 5 estrellas", pin_sub: "– y podrás conjugar y hacer quizzes al instante.", pin_tip: "Consejo", pin_guide_for: "Aquí tienes la guía para:", pin_step_ios: "Compartir → „Añadir a inicio“", pin_step_android: "Menú → „Instalar app“", pin_cta: "Añadir ahora", pin_later: "Más tarde", pin_iphone: "iPhone / iPad", pin_android: "Android", menu_share: "Recomendar app", err_cancel_fail: "Cancelación fallida. Inténtalo de nuevo.", err_delete_fail: "Eliminación fallida. Inténtalo de nuevo.", guest_login_sub: "Inicia sesión para guardar tu progreso y vocabulario.", guest_login_cta: "Iniciar sesión →", login_welcome_back: "Bienvenido de nuevo", login_almost_done: "¡Casi listo!", login_create_acct: "Crear cuenta", login_reset_pw: "Restablecer contraseña", login_sub_login: "Guarda favoritos y progreso en todos los dispositivos", login_sub_login_pay: "Inicia sesión — continuarás al pago de inmediato.", login_sub_signup: "Gratis — datos guardados en Alemania", login_sub_signup_pay: "Genial que elegiste Premium — crea primero una cuenta para completar tu suscripción.", login_sub_reset: "Te enviaremos un enlace de restablecimiento", login_done_signup: "¡Correo de confirmación enviado!\nRevisa tu bandeja de entrada.", login_done_reset: "¡Enlace enviado!\nRevisa tu bandeja de entrada.", login_pw_ph: "Contraseña (mín. 6 caracteres)", login_forgot_pw: "¿Olvidaste tu contraseña?", login_btn_signup: "Crear cuenta", login_btn_reset: "Enviar enlace", login_or: "o", login_google: "Iniciar sesión con Google", login_apple: "Iniciar sesión con Apple", login_no_account: "¿Sin cuenta aún?", login_has_account: "¿Ya tienes cuenta?", login_do_register: "Registrarse", login_back: "← Volver al inicio de sesión", login_data: "🔒 Datos guardados en Frankfurt, DE", goal_ai: "Sugerencia IA", goal_ai_badge: "MEDIO", goal_time: "Por tiempo", goal_time_note: "10 min/día", goal_custom: "A medida", goal_custom_note: "8 verbos · 20 palabras", goal_daily: "ejercicios al día", goal_time_approx: "≈ 6 min · ajustable"
    },
    nl: {
      tagline: "vervoegen · quiz · leren", hi: "Hoi, {name} 👋", ready: "Klaar wanneer jij het bent, {name}",
      cj_acc: "Account aanmaken", cj_later: "Later", cj_reorder_head: "Orden de tegels zoals jij wilt", cj_reorder_text: "Sleep je favoriete taal naar voren — dat wordt je starttaal, dus als je het ConjuExpert-icoon op je beginscherm aantikt opent de app er meteen in. De menubalk onderaan orden je net zo.", cj_no_thx: "Nee, bedankt",
      lang_start_set: "{lang} opent nu eerst", lang_reorder_hint: "Lang indrukken & slepen om te ordenen",
      theme_add: "Toevoegen", theme_add_ph: "Eigen thema…",
      cj_p1_head: "Mooi — al 5 werkwoorden!", cj_p1_text: "Maak een gratis account: je voortgang blijft bewaard en je oefent <b>2 dagen langer</b> met Premium – Quiz + Bewaard.",
      cj_p2_head: "Altijd bij de hand", cj_p2_text: "Zet ConjuExpert als een app op je beginscherm – één tik en je vervoegt &amp; quiz in seconden.", cj_p2_yes: "Naar beginscherm",
      cj_p3_head: "Wacht – ga niet zonder je voortgang!", cj_p3_text: "Een gratis account (10 seconden) bewaart alles – en geeft je <b>2 dagen extra</b> Premium (Quiz + Bewaard).", cj_p3_yes: "Voortgang opslaan", cj_p3_no: "Toch weggaan",
      cj_tend_head: "Je proefperiode van 24 u Premium is voorbij", cj_tend_text: "Vervoegen &amp; Leren blijven gratis. Wil je verder quizzen? Met een gratis account oefen je de quiz „Kaarten“ (20 rondes/dag) – plus <b>2 dagen Premium</b> gratis.", cj_tend_yes: "Account aanmaken – Quiz + 2 dagen", cj_tend_no: "Alleen opzoeken &amp; leren",
      cj_help_head: "Help ons beter te worden", cj_help_text: "Help ons alsjeblieft beter te worden — en jou en alle andere ConjuExperts de best mogelijke ervaring te geven. We zijn net gestart en hebben je hulp echt nodig als er ergens iets hapert.", cj_p8_head: "Fijn dat je er weer bent!", cj_p8_text: "Je voortgang staat er nog. Bewaar hem met een gratis account voordat hij verdwijnt.",
      cj_fb_head: "Hoe gaat het bij jou?", cj_fb_text: "Wees eerlijk: wat vind je het leukst – en wat kunnen wij beter doen?", cj_fb_gift: "🎁 Geef je feedback en ontvang een <b>code van € 5</b> op het jaarabonnement.", cj_fb_rate_q: "Wat vind je van ConjuExpert?", cj_fb_ph: "Jouw feedback…", cj_fb_send: "Feedback geven &amp; € 5 krijgen", cj_fb_sending: "Versturen…", cj_fb_err: "Kon niet verzonden worden – probeer opnieuw.",
      cj_fbt_head: "Bedankt voor je feedback!", cj_fbt_text: "Hier is je cadeau: met de code <b>WILLKOMMEN</b> krijg je Premium voor <b>€ 24,99/jaar</b> in plaats van € 29,99 – geldig tot het einde van je proefperiode.", cj_fb_secure: "Code opslaan &amp; Premium halen",
      hint_quiz_cards_h: "Kaarten: werkwoorden ontspannen inprenten", hint_quiz_cards_1: "Kies tijd &amp; favoriet thema, plus de richting (moedertaal ↔ doeltaal).", hint_quiz_cards_2: "Bekijk werkwoord + tijd, bedenk de vorm in je hoofd — tik de kaart om te draaien.", hint_quiz_cards_3: "Tik onbekende woorden in de voorbeeldzin → vertalen &amp; opslaan.", hint_quiz_cards_4: "Geen druk, geen typen: ideaal om vormen te leren kennen en snel te herhalen.", hint_quiz_speed_h: "Speed: 60 seconden vol focus", hint_quiz_speed_1: "Kies tijd &amp; thema en start — je hebt 60 seconden.", hint_quiz_speed_2: "Tik de juiste vorm zo snel mogelijk aan — elk goed antwoord telt.", hint_quiz_speed_3: "Ideaal om vormen snel paraat te krijgen, met wat tijdsdruk.",
      hint_quiz_choice_h: "Keuze: de juiste vorm snel herkennen", hint_quiz_choice_1: "Een perfecte start in een nieuwe tijd.", hint_quiz_choice_2: "Kies tijd &amp; favoriet thema.", hint_quiz_choice_3: "Werkwoord + gevraagde tijd + vier varianten — tik de juiste aan voor directe feedback.", hint_quiz_choice_4: "Tik onbekende woorden in de voorbeeldzin → vertalen &amp; opslaan.",
      hint_quiz_type_h: "Typen: vervoegingen actief schrijven", hint_quiz_type_1: "Zelf schrijven verankert de vormen het sterkst — naast <b>Spreken</b> de intensiefste modus.", hint_quiz_type_2: "Kies tijd, thema &amp; richting — en of je losse werkwoorden oefent of een hele zin vertaalt.", hint_quiz_type_3: "Tik onbekende woorden in de voorbeeldzin → vertalen &amp; opslaan.",
      hint_quiz_speak_h: "Spreken: zeg het hardop", hint_quiz_speak_1: "Zelf spreken verankert de vormen het sterkst — naast <b>Typen</b> de intensiefste modus.", hint_quiz_speak_2: "Kies tijd, thema &amp; richting — en of je losse werkwoorden oefent of een hele zin.", hint_quiz_speak_3: "Tik op de microfoon om te beginnen en te stoppen met de spraakinvoer.", hint_quiz_speak_4: "Tik onbekende woorden → vertalen &amp; opslaan.",
      hint_quiz_texte_h: "Teksten: test je lees- & luistervaardigheid", hint_quiz_texte_1: "Kies favoriet thema, tijd &amp; welk soort werkwoorden je wilt oefenen.", hint_quiz_texte_2: "Aan het eind wachten begripsvragen op je.", hint_quiz_texte_3: "Tik elk woord in de tekst aan → vertalen &amp; opslaan.", hint_quiz_texte_4: "Tip: zet “Mijn woorden gebruiken” aan — je eigen woorden verschijnen in het verhaal.",
      hint_learn_h: "Welkom bij Leren", hint_learn_1: "Elke tijd wordt tweetalig uitgelegd, met automatisch gegenereerde voorbeelden.", hint_learn_2: "Gebruik de tijdkiezer bovenaan als een <b>spiekbriefje</b> om tussen vormen te springen.", hint_learn_3: "Tik op een voorbeeldwoord om het aan je woordenschat toe te voegen.",
      hint_saved_verbs_h: "Opgeslagen werkwoorden", hint_saved_verbs_1: "Hier verzamelen zich alle werkwoorden die je tijdens het vervoegen met ☆ opsloeg.", hint_saved_verbs_2: "Tik een werkwoord aan om de volledige vervoeging weer te openen.", hint_saved_verbs_3: "Kies ze direct in de <b>Quiz</b> en oefen gericht.", hint_saved_verbs_4: "Zo bouw je je eigen persoonlijke oefenlijst op.",
      hint_saved_vocab_h: "Jouw woordenschat", hint_saved_vocab_1: "Maak een eigen thema (bijv. “Doktersbezoek”) &amp; kies de oefenrichting.", hint_saved_vocab_2: "✨ MEGA-FEATURE: genereer nieuwe woorden — onder “Nieuw” typ je bijv. “Bijvoeglijke naamwoorden” en tik “10 nieuwe woorden voorstellen”.", hint_saved_vocab_3: "Je opgeslagen woorden kunnen ook in de quizteksten worden verwerkt.",
      tab_conjugate: "Vervoegen", tab_quiz: "Quiz", tab_learn: "Leren", conjugate: "Vervoegen",
      saved: "Opgeslagen werkwoorden", recent: "Recent", clear: "wissen",
      empty_title: "Typ een werkwoord om te vervoegen", empty_sub: "Alle tijden in {n} talen — typ een werkwoord of tik 🎲.",
      regular: "regelmatig", irregular: "onregelmatig", recommended: "Aanbevolen", ad_cta: "Oefenen →",
      mode: "Modus", m_type: "⌨ Typen", m_choice: "◉ Keuze", m_speed: "⚡ Speed", m_texte: "📖 Teksten", mdesc_texte: "Lees een AI-verhaal — vertaal, vul werkwoorden in of beantwoord vragen", texte_question: "Begrip", texte_cloze: "Werkwoorden invullen", texte_translate: "Vertalen", texte_new: "Nieuw verhaal", texte_writing: "Je verhaal wordt geschreven…", texte_error: "Kon geen verhaal schrijven — probeer opnieuw.", texte_comprehension: "Begripsvragen", texte_done: "Verhaal voltooid!", texte_fill_hint: "Zet het werkwoord in de juiste tijd", texte_learn: "Werkwoord leren", texte_translation: "Vertaling", texte_read: "Voorlezen", texte_speed: "Welk tempo?", texte_voice: "Welke stem?", texte_voice_auto: "Automatisch (beste)", texte_almost: "bijna klaar …", texte_voice_f: "Vrouw", texte_voice_m: "Man", texte_pause: "Pauze", texte_resume: "Verder", texte_mywords_lbl: "Mijn woorden", texte_mywords: "Mijn woorden gebruiken",
      which_tense: "Tijd", tense_word: "Tijd", all_tenses: "Alle tijden", all_themes: "Alle thema's", which_verbs: "Werkwoorden", which_dir: "Richting", dir_produce: "PRODUCEREN", dir_recognize: "HERKENNEN", dir_random: "WILLEKEURIG", which_theme: "Thema's", quiz_mode_hd: "Quizmodus", explain_hd: "Uitleg", req_form: "Gevraagd", tip_label: "Tip", tip_meaning: "Betekenis", tip_sentence: "Zin", none_all: "Niets gekozen — alle tijden worden geoefend", all_btn: "Alle", none_btn: "Geen", mist_clear_title: "Alle fouten weggewerkt!", mist_clear_sub: "Goed gedaan — je hebt elk fout werkwoord herhaald.", mist_practice: "Fouten oefenen", view_conj: "Volledige vervoeging", mist_exit: "Terug naar alle werkwoorden",
      correct: "goed", accuracy: "nauwkeurigheid", streak: "reeks",
      type_form: "typ de vorm…", check: "Controleren", next: "Volgende →", correct_excl: "✓ Goed!", accent_hint: "Goed! Let alleen op het accent: {answer}", answer: "Antwoord:",
      hint_type: "Typ de juiste vorm voor het voornaamwoord en de tijd.", hint_choice: "Kies de juiste vorm — 4 opties.",
      challenge: "60-seconden-uitdaging", challenge_sub: "Beantwoord er zoveel mogelijk voordat de tijd om is. Tik snel de juiste vorm!",
      best: "Beste:", start: "Start →", sec: "sec", pts: "ptn", go: "Ga ga ga — elke goede tik is een punt.",
      times_up: "Tijd voorbij!", in60: "goed in 60s", new_best: "🎉 Nieuw record!", play_again: "Opnieuw →", back: "Terug",
      tenses: "{lang} tijden", bilingual: "Tweetalig · {a} ⇄ {b}", level: "Niveau", native: "Moedertaal",
      explanation: "Uitleg", mnemonic: "🧠 Ezelsbruggetje", signal_words: "Signaalwoorden", examples: "Voorbeelden", when_use: "Wanneer gebruiken", compare: "Vergelijken",
      fb_offline: "Live AI-uitleg werkt in de app-preview. Hier alvast de kernregels:",
      fb_net: "Kon de uitleg niet laden. Hier de kernregels:",
      welcome: "Hey! Je gaat:", welcome_sub: "werkwoorden in 5 talen vervoegen, quizzen en op een makkelijke manier je favoriete taal leren.",
      your_name: "Je naam…", mother_tongue: "Je moedertaal", skill_q: "Je niveau", skill_beginner: "Beginner", skill_beginner_sub: "veelgebruikt", skill_intermediate: "Middel", skill_intermediate_sub: "+ onregelmatig", skill_advanced: "Gevorderd", skill_advanced_sub: "alle", lets_go: "Let's go →", skip: "Overslaan", remove_name: "Naam verwijderen", profile: "Profiel", listen: "Luister", m_cards: "🃏 Kaarten", flip: "Tik om te draaien", got_it: "Gewust", again: "Nog oefenen", mistakes: "Fouten", no_mistakes: "Nog geen fouten — ze verschijnen hier om te herhalen.", tab_saved: "Bewaard", reveal: "Toon vertaling", learned: "Geleerd ✓", saved_empty: "Nog geen bewaarde werkwoorden. Tik op de ☆ bij een vervoeging.", tour_conj: "De kern: vervoeg elk werkwoord in 5 talen, in alle tijden — in één oogopslag.", tour_quiz: "Test jezelf — kaarten, keuze, typen & spreken — met AI-voorbeeldzinnen elke ronde.", tour_learn: "Begrijp elke tijd tweetalig, met AI-voorbeelden die je kunt aantikken en opslaan.", tour_saved: "Bewaar werkwoorden & woorden, bouw je woordenschat op en oefen met gespreide herhaling.", tour_more1: "De kern: elk werkwoord in 5 talen door alle tijden — plus tweetalig leren met AI-voorbeelden.", tour_more2: "Oefen met de quiz (kaarten, keuze, typen & spreken), bewaar woorden en blijf op koers met challenges.", tour_goals_h: "Challenges", tour_goal: "Stel je persoonlijke challenge in — AI-voorstel, op tijd of volledig eigen. Volg je dagelijkse voortgang en blijf gemotiveerd.", tour_trial_head: "Jouw cadeau: 24 u Premium", tour_trial_sub: "Daarna je welkomstkorting vrijspelen — de vervoegingstabellen blijven altijd gratis.", tour_feat1: "Quiz & Bewaard — volledig vrij", tour_feat2: "Alle tijden & AI-voorbeeldzinnen", tour_feat3: "5 talen, geen advertenties", eg_step1: "Willekeurig werkwoord – sla op met ★", eg_step2: "Oefen in Quiz & kies favoriete thema's", eg_step3: "Train opgeslagen woorden onder 'Bewaard'", hero_kicker: "Hé {name} 👋", hero_plan: "Jouw challenge voor vandaag, {name}:", hero_plan_anon: "Jouw challenge voor vandaag:", tour_next: "Volgende", tour_start: "Beginnen", tour_skip: "Overslaan", t2_hi: "Fijn dat je er bent, {name}! 👋", t2_hi_anon: "Fijn dat je er bent! 👋", t2_ask: "Wil je een korte rondleiding door de app — of meteen beginnen?", t2_start_tour: "Rondleiding starten", t2_skip_tour: "Meteen beginnen", t2_overview_t: "Dit staat je te wachten", t2_quiz_tap_t: "Quiz · Tikken", t2_quiz_type_t: "Quiz · Typen", t2_quiz_text_t: "Quiz · Tekst", t2_prices_t: "Abonnementen & prijzen", t2_quizmodes_x: "Actief oefenen tot het zit — kies je modus.", t2_tap_x: "Kies de juiste vorm uit 4 opties.", t2_type_x: "Schrijf de vorm zelf — traint actief je spelling.", t2_text_x: "Kies thema, tijd & woorden — de AI leest je verhaal voor: test & train je luistervaardigheid.", t2_conj_x: "Typ een werkwoord of gooi de dobbelsteen, kies de tijd — bewaar met ★.", t2_merken_x: "Tik & bewaar woorden in oefenzinnen — of voeg ze zelf toe.", t2_prices_x: "Vervoegen & leren blijven voor altijd gratis · 24 uur Premium om te proberen", t2_ov1_t: "Jouw leer-challenge", t2_ov1_d: "Stel een dag-, week- of maand-challenge in — volg voortgang & reeks", t2_ov2_t: "Woordenlijst", t2_ov2_d: "Tik & bewaar woorden in zinnen — of voeg ze zelf toe", t2_ov3_t: "Favoriete thema's", t2_ov3_d: "Maak je eigen thema's onder Bewaard en oefen ze in de quizzes", t2_m_cards: "Kaarten", t2_m_tap: "Tikken", t2_m_type: "Typen", t2_m_speak: "Spreken", t2_m_speed: "⚡ Speed", t2_m_text: "Tekst", t2_f_topic: "Thema", t2_f_tense: "Tijd", t2_f_words: "Woorden", t2_v_travel: "Reizen", t2_v_saved: "Mijn lijst", t2_v_work: "werk", t2_p1_t: "24 u Premium", t2_p1_d: "alles testen — zonder account", t2_p2_t: "Met account · gratis", t2_p2_d: "Vervoegen, Leren & 20 quizkaarten / dag", t2_p3_t: "ConjuPremium", t2_p3_d: "alles vrij · jaar €29,99 · maand €2,99", m_speak: "🎤 Spreken", speak_tap: "Tik op de microfoon en zeg de vorm", speak_heard: "Gehoord:", speak_nomic: "Spraakinvoer wordt hier niet ondersteund.", spk_form: "Woord zeggen", spk_sentence: "Zin zeggen", spk_what: "Wat oefenen?", spk_say: "Zeg het in {lang}",
      dq_form: "Vervoegde vorm", vocab_translate: "Vertalen", offline_note: "⚡ Offline — voorbeelden & vertalingen vereisen internet", aux_title: "Samengestelde tijden vormen", aux_logic: "Alle samengestelde tijden werken hetzelfde: je vervoegt het hulpwerkwoord {aux} naar persoon + tijd en voegt het onveranderlijke voltooid deelwoord {part} toe. Alleen het hulpwerkwoord verandert — het deelwoord blijft gelijk.", aux_note: "Samengestelde tijden = hulpwerkwoord + voltooid deelwoord.", aux_participle: "Voltooid deelwoord", cards_hint: "Vervoeg het werkwoord in de gevraagde tijd in gedachten – tik voor de oplossing", cards_hint_type: "Vervoeg het werkwoord in de gevraagde tijd · typ het in het vak", cards_hint_speak: "Vervoeg het werkwoord in de gevraagde tijd · tik op de microfoon om te spreken", choose_label: "Kies:", tap_retry: "Tik om te vertalen", dq_infinitive: "Hele werkwoord", dq_belongs: "Van", dq_participle: "Voltooid deelwoord", dq_gerund: "Onvoltooid deelwoord", spk_relearn: "Nog aan het leren — toon antwoord", spk_correct_is: "De juiste zin:", spk_next_sentence: "Volgende zin →", speak_denied: "Microfoon geblokkeerd — geef toegang in je browser.", speak_nospeech: "Niet verstaan — probeer opnieuw.", mic_start: "Tik één keer om op te nemen", sent_mist_practice: "Foute zinnen oefenen", spk_context: "In een zin", cloze_instr: "Vervoeg het werkwoord in de gevraagde tijd", choose_tile: "kies de juiste tegel", mic_stop: "Tik als je klaar bent", tap_word: "tik op een woord voor de betekenis", practice_again: "Opnieuw oefenen", sk_title: "Challenge & reeks", sk_today: "Vandaag", sk_streak: "Dagen op rij", sk_best: "Record", sk_days: "dagen", sk_done: "Challenge gehaald!", sk_left: "Nog {n} tot de challenge van vandaag", sk_explain: "Elke vervoeging en quizantwoord telt. Haal je dag-challenge om je reeks te behouden — mis je een dag, dan begint hij opnieuw.", sk_close: "Begrepen", dq_fuzzy: "herkend zonder accenten", dq_switched: "naar hele werkwoord gewisseld", dq_guess: "geschat op basis van de uitgang", tfilter_hint: "Veeg opzij · tik om een tijd te tonen / verbergen", verb_ph: "Typ een werkwoord…", autoread: "Antwoord voorlezen", autoread_sub: "bij goed", review: "Overzicht", native_ph: "…of een werkwoord in je taal", saved_verbs: "Werkwoorden", saved_vocab: "Woordenschat", gm_hint_tag: "alleen de 1e keer", gm_hint_tx: "Hier verzamel je alles — <b>woorden, werkwoorden & eigen lijsten</b>. Bovenaan: wat vandaag aan de beurt is.", gm_due_head: "Vandaag te doen · uit alle lijsten", gm_words_verbs: "woorden & werkwoorden", gm_review_now: "Nu herhalen", gm_your_lists: "Jouw lijsten", gm_verbs: "Bewaarde werkwoorden", gm_words: "Bewaarde woorden", gm_words_n: "woorden", gm_due: "te doen", gm_new_list: "Lijst", gm_back: "Bewaard", imp_open: "Lijst plakken", imp_title: "Hele lijst plakken", imp_help: "Eén woord per regel. Vertaling optioneel: casa - huis. Ontbreekt die, dan vertalen wij.", imp_ph: "één woord per regel…", imp_into: "In lijst:", imp_cta: "Woorden toevoegen", imp_checking: "Je lijst controleren…", imp_review_title: "Controleren & toevoegen", imp_review_sub: "{n} tips — tik om over te nemen of het origineel te houden.", imp_add: "Toevoegen", imp_added_note: "vertaling toegevoegd", imp_orig: "was:", gm_saved_toast: "‘{w}’ bewaard → Bewaarde woorden", gm_ch_cta_h: "Start je challenge", gm_ch_cta_s: "Je leerplan met doel — werkwoorden & woorden.", gm_saved_verb_toast: "‘{w}’ bewaard → Bewaarde werkwoorden", mv_title: "Verplaatsen naar", cross_open: "Uit een andere taal", cross_title: "Overnemen uit een andere taal", cross_help: "Kies een taal en zijn lijsten — de woorden worden voor je vertaald.", cross_srch: "Brontaal", cross_lists: "Welke lijsten?", cross_cta: "Overnemen & vertalen", cross_busy: "Je woorden vertalen…", cross_done: "{n} woorden overgenomen", cross_offline: "Heeft internet nodig", lch_title: "Nieuwe lijst", lch_name_ph: "Naam — bijv. Reis, Podcast…", lch_how: "Hoe vullen?", lch_empty: "Leeg beginnen", lch_tpl: "Met sjabloon", saved_tap_hint: "Tik op een cel om te horen · ✕ verwijdert het werkwoord", ch_tab: "Challenge", ch_empty_head: "Nog geen challenge in {lang}", ch_empty: "Maak er een en oefen gericht — elke taal heeft zijn eigen challenge.", ch_create: "Challenge maken", cs_day: "Dag", cs_left: "nog {n}", cs_done: "vandaag klaar ✓", cs_start: "Challenge starten", cs_plan: "jouw plan", ch_moment: "‚{v}' zit erin — onder de knie!", ch_words_hint: "Woorden oefen je in je Woordenschat", ch_words_go: "Naar Woordenschat →", ch_new: "Nieuwe challenge", ch_practice: "Nu oefenen", ch_left: "nog {n} dagen", ch_done_v: "{a} van {b} werkwoorden", ch_done_w: "{a} van {b} woorden", ch_edit: "Bewerken", ch_editdone: "Klaar", ch_add_ph: "Werkwoord of woord…", ch_fill: "Voorstellen", ch_from_saved: "Uit Bewaard", ch_add_all: "Alle toevoegen", ch_choose: "Uit bewaard kiezen", ch_pick_verbs: "Je bewaarde werkwoorden", ch_pick_words: "Je bewaarde woorden", ch_pick_empty_v: "Nog geen bewaarde werkwoorden — bewaar ze met ☆ bij het vervoegen.", ch_pick_empty_w: "Nog geen bewaarde woorden — voeg ze toe in Woordenschat.", ch_timeup: "Tijd om — {a} van {b} onder de knie.", ch_extend: "+1 week", ch_mastered: "Challenge voltooid!", ch_mastered_sub: "Alles zit — tijd voor een nieuwe challenge.", vocab_all: "Alle", vocab_new_cat: "Nieuw", vocab_cats_all: "Alle thema's", vocab_cats_less: "Minder", vocab_new_cat_q: "Naam van de nieuwe categorie:", vocab_add_ph: "Voeg een woord of zin toe…", vocab_empty: "Nog geen woorden — voeg hierboven je eerste toe.", vocab_practice: "Oefenen", vocab_word: "woord", vocab_phrase: "zin", vocab_type_target: "Typ het in {lang}…", vocab_done: "Ronde voltooid!", vocab_save: "Bewaren", vocab_saved: "Bewaard", vocab_seeding: "Startwoorden laden…", vocab_suggest: "10 nieuwe woorden voorstellen", vocab_due: "Vandaag aan de beurt", vocab_strength: "Geheugenkracht", vocab_starter: "5 startwoorden laden", gr_ind: "Aantonende wijs", gr_subj: "Aanvoegende wijs", gr_cond: "Voorwaardelijk", gr_imp: "Gebiedende wijs", gr_cont: "Duurvorm", gr_forms: "Onbepaalde vormen", how_formed: "Hoe wordt het gevormd?", key_irregulars: "Belangrijke onregelmatige werkwoorden", irr_note: "Tik op een werkwoord voor de volledige vervoeging.", tap_save: "tik op een woord – betekenis & bewaren", report_link: "Fout melden", report_title: "Wat klopt er niet?", r_grammar: "Verkeerde grammatica", r_unnatural: "Onnatuurlijk", r_translation: "Verkeerde vertaling", r_other: "Iets anders", report_note: "Notitie (optioneel)…", report_send: "Versturen", report_thanks: "Bedankt — we kijken ernaar!", acct_created: "✓ Account aangemaakt — welkom!", zt_greets: "Sterk bezig vandaag,|Het loopt lekker,|Je wordt beter,|Goed je te zien,|Volhouden loont,|Ga zo door,", zt_eyebrow: "Jouw challenge", ch_adjust: "Challenge aanpassen", zt_today: "Vandaag al {a} van {b} oefeningen", zt_left_suffix: " — nog {n} tot je dag-challenge.", zt_done_suffix: " — dag-challenge gehaald! 🎉", zt_min_left: "min over", zt_verbs_prog: "Werkwoorden {a}/{b} onder de knie", zt_words_prog: "Woorden {a}/{b}", zt_streak: "{n} dagen op rij", zt_to_list: "Naar je challenge-lijst", zt_keep: "Verder oefenen", zt_to_quiz: "Naar de quiz →", zt_other_head: "Andere talen", zt_lang_prog: "{a}/{b} onder de knie", gf_week: "week", gf_weeks: "weken", gf_verbs: "Werkwoorden", gf_words: "Woorden", gf_min_abbr: "min", gf_per_day_lbl: "Oefeningen/dag", gf_all_tenses: "alle tijden", gf_ki_title: "Jouw AI-voorstel — niveau gemiddeld.", gf_ki_sub: " Al ingevuld — pas alles vrij aan.", gf_period: "Periode", gf_tense: "Tijd", gf_conj_verbs: "Werkwoorden vervoegen", gf_num_verbs: "Aantal werkwoorden", gf_per_tense: "per tijd", gf_new_words: "Nieuwe woorden", gf_vocab: "Woordenschat", gf_learn_new: "nieuw leren", gf_ex_per_day: "oefeningen per dag", gf_daily_auto: "Je dag-challenge — past zich automatisch aan.", gf_overview: "Challenge-overzicht", gf_sum: "In {weeks}: {verbs} werkwoorden in {tenses}, plus {words} nieuwe woorden.", gf_start_cta: "Start je challenge · {n} oefeningen/dag", gf_h1_pre: "Om een ", gf_h1_post: " te worden, doe een challenge met ons:", gf_choose_sub: "Kies je soort challenge.", ch_for_lang: "Voor", gf_suggest_h: "Stel er een voor", gf_level_mid: "NIVEAU: GEMIDDELD", gf_suggest_s: "We bouwen in seconden een passende challenge — afgestemd op jouw niveau.", gf_ind_h: "Eigen challenge", gf_ind_s: "Bepaal zelf periode, tijden, werkwoorden & woorden.", gf_or_time: "of op tijd", gf_by_time: "Op tijd", gf_time_h: "Ik bepaal mijn tijd", gf_time_s: "\"Ik wil … minuten per dag oefenen\" — wij rekenen je challenge uit.", gf_back: "terug", gf_time_q: "Hoeveel minuten wil je dagelijks oefenen?", gf_time_qs: "Wij berekenen automatisch je ideale dag-challenge.", gf_mins_day: "Minuten per dag", gf_mins_min: "minstens 3 min aanbevolen", gf_ex_approx: "Oefeningen per dag · ≈ {n} min", gf_vw_daily: "~{v} werkwoorden & {w} woorden per dag.", gf_sum_time: "{mins} minuten per dag = {per} oefeningen/dag. In 2 weken leer je ongeveer {verbs} werkwoorden en {words} nieuwe woorden.", gs_title: "Je challenge staat{name}.", gs_sub: "Veel plezier met quizzen — stel je voor hoe je straks vloeiend je favoriete taal spreekt. 🌟", gs_set_verbs: "Werkwoorden kiezen →", gs_set_hint: "kies uit Bewaard, typ zelf of laat voorstellen", gs_later: "Later", gc_daily_done: "Dag-challenge gehaald!", gc_done_plan: "Je hebt je challenge van {d} dagen voltooid{name}! Tijd voor een nieuwe.", gc_done_named: "{name}, je hebt vandaag {n} oefeningen gedaan — sterk!", gc_done_anon: "Je hebt vandaag {n} oefeningen gedaan — sterk!", gc_ex_today: "Oefeningen vandaag", gc_streak_lbl: "Dagen op rij", gc_plan_day: "Plandag", report_general: "Fout melden", report_general_sub: "Probleem melden — screenshot mag", report_attach: "Screenshot toevoegen", report_shot_hint: "Een screenshot helpt ons het probleem sneller te vinden.", type_word: "Woord typen", type_sentence: "Zin typen", spk_translate: "Vertaal dit", qi_title: "Hoe wil je oefenen?", qi_sub: "Kies een modus — elk traint een andere vaardigheid.", qi_foot: "Tip: stel tijd- & werkwoordfilters in na het kiezen.", qi_back: "Overzicht", mdesc_cards: "Kaarten omdraaien — antwoord zien, ontspannen", mdesc_choice: "Meerkeuze — kies de juiste vorm", mdesc_speed: "Sprint van 60 s — hoeveel haal je?", mdesc_type: "Typ de vorm of vertaal een zin", mdesc_speak: "Zeg het hardop — spraakherkenning",
      paywall_lock: "🔒 Quiz & Bewaard zijn Premium", paywall_h1: "Vervoegen zonder nadenken", paywall_sub: "De Quiz traint je actief totdat de vormen blijven hangen — en met Bewaard oefen je precies de woordenschat die jou belangrijk is.", paywall_unlock: "Premium ontgrendelen", paywall_later: "Misschien later", pw_feat1: "Interactieve Quiz", pw_feat1v: "4 modi", pw_feat2: "Bewaard & woordenlijsten", pw_feat2v: "onbeperkt", pw_feat3: "Vervoeging & Leren", pw_feat3v: "blijft gratis",
      offer_badge: "🚀 WELKOMSTAANBIEDING · −{disc} %", offer_expires: "Aanbieding verloopt in {t}", offer_instead: "in plaats van", offer_mo: "mnd.", offer_yr: "/ jaar", offer_you_pay: "je betaalt:", offer_save: "je bespaart {save} € (−{disc} %)", offer_secure: "Aanbieding aannemen", offer_trial: "Eerst 24 u gratis uitproberen", offer_trial_b: "24 u Premium gratis", offer_close: "Aanbieding sluiten", offer_price_label: "Prijs: {price} € per jaar, in plaats van {eq} € maandelijks",
      plan_hero_h1: "Leer zonder limieten", plan_hero_sub: "Onbeperkte Quiz & Bewaard in alle 5 talen", plan_annual: "Jaarabonnement", plan_monthly: "Maandabonnement", plan_best: "★ Populairste keuze", plan_bonus: "🎁 Welkomstbonus", plan_per_mo: "/ maand", plan_per_yr: "/ jaar", plan_instead: "i.p.v.", plan_save: "je bespaart {save} € (−{disc} %)", plan_mo_label: "~{price} € / maand · i.p.v. {eq} €", plan_flex: "flexibel · gelijk aan {eq} € / jaar", plan_feat1: "Interactieve vervoeging-quiz", plan_feat2: "Bewaard & woordenlijsten", plan_feat3: "5 talen — ES, FR, EN, NL, DE", plan_feat4: "Alle apparaten · geen advertenties", plan_cta: "Doorgaan naar betaling", plan_cancelable: "op elk moment opzegbaar", plan_have_account: "Al een account?", sign_in: "Inloggen", plan_coupon: "Kortingscode inwisselen", pr_title: "Prijzen & abonnementen", pr_eyebrow: "Prijzen", pr_free: "Gratis", pr_premium: "Premium", pr_feat_conj: "Werkwoorden vervoegen · alle tijden", pr_active: "Je hebt Premium – bedankt! 💜", pr_anon: "Anoniem", pr_konto: "Account", pr_quiz_day: "20/dag", pr_trial_note: "🎁 Met account: 2 dagen Premium gratis testen", pr_feat_goals: "Challenges & voortgang", ap_lock: "🔓 Gratis account", ap_h1: "Quiz met gratis account", ap_sub: "Maak een gratis account om met de quiz te oefenen — plus 2 dagen Premium gratis.", ap_feat1: "20 quizkaarten per dag", ap_feat2: "2 dagen Premium gratis", ap_feat3: "Voortgang op al je apparaten", ap_cta: "Gratis account aanmaken", ql_lock: "🔓 Daglimiet bereikt", ql_h1: "20 kaarten klaar voor vandaag!", ql_sub: "Goed gedaan! Met Premium oefen je onbeperkt — of kom morgen terug voor 20 nieuwe kaarten.", ql_feat1: "Onbeperkte quiz — elke modus", ql_cta: "Premium ontgrendelen", coupon_title: "Kortingscode", coupon_need_login: "Log eerst in om een code in te wisselen.", coupon_sign_in: "Nu inloggen", coupon_ph: "Code invoeren", coupon_redeem: "Inwisselen", coupon_redeeming: "Inwisselen…",
      menu_rate: "App beoordelen", menu_logout: "Uitloggen", menu_cancel_sub: "Abonnement opzeggen", menu_sub_active_until: "✓ Abonnement opgezegd — actief tot {date}", menu_delete_acc: "Account verwijderen", cancel_title: "Abonnement opzeggen", cancel_body: "Je Premium loopt door tot {date} — daarna schakel je automatisch over naar de gratis versie. Je account blijft behouden.", cancel_no: "Terug", cancel_yes: "Nu opzeggen", delete_title: "Account verwijderen", delete_warn_days: "⚠️ Je verliest {n} betaalde dagen", delete_warn_body: "Je abonnement loopt nog tot {date}. Als je eerst opzegt, kun je de resterende tijd nog gebruiken.", delete_cancel_first: "Eerst abonnement opzeggen", delete_anyway: "Toch verwijderen", delete_data: "Alle gegevens worden permanent verwijderd.", delete_yes: "Verwijderen",
      sub_runs_until: "Je abonnement loopt tot {date} — je kunt de app tot dan blijven gebruiken.", sub_end_period: "einde van de huidige facturatieperiode", goodbye_heading: "Jammer dat je weggaat — maar je bent nu een pro!", goodbye_love: "Veel liefs voor je.", goodbye_data: "Uiteraard verwijderen we je gegevens.", goodbye_btn: "Tot ziens! 👋", pay_error: "Betaling kon niet worden gestart. Probeer het opnieuw.", bonus_trial: "Premium veiligstellen", bonus_welcome: "Welkomstbonus claimen", bonus_quiz: "Haal Quiz & Bewaard!", ios_homescreen: "Zet ConjuExpert op je startscherm!", ios_share: "Delen → Toevoegen aan startscherm", ios_close: "Sluiten", ios_how: "Zo doe je dat", pwa_home: "ConjuExpert op je startscherm!", pwa_nostore: "Geen app store nodig.", ios_help_title: "Voeg het toe op je iPhone", ios_help_1: "Tik in Safari bovenaan op de <b>Deel-knop</b> (vierkant met pijl omhoog).", ios_help_2: "Kies <b>“Zet op beginscherm”</b>.", ios_help_3: "Tik rechtsboven op <b>“Voeg toe”</b> — klaar!", and_help_title: "Voeg het toe op je Android", and_help_1: "Tik rechtsboven op het <b>menu</b> (⋮).", and_help_2: "Kies <b>“App installeren”</b> of <b>“Zet op beginscherm”</b>.", and_help_3: "Bevestig met <b>“Installeren”</b> — klaar!", pin_help_ios: "Gids voor iPhone", pin_help_android: "Gids voor Android", rev_kicker: "20 seconden · groot effect", rev_heading: "even voordat je verder gaat …", rev_body1: "Je bent vandaag al <b>{mins} minuten</b> bezig — geweldig!", rev_body2: "Help anderen ook hun favoriete taal te ontdekken: met een <b>korte beoordeling</b> wordt ConjuExpert gevonden — je grootste steun voor ons. 💛", rev_rate: "Nu beoordelen →", rev_feedback: "Liever feedback geven?", rev_snooze: "Later herinneren", paysuc_sub: "Je kunt alle Premium-functies gebruiken! Veel plezier met quizzen en het leren van je favoriete taal 🎉", paysuc_feat1: "Quiz — alle modi & talen", paysuc_feat2: "Favorieten & woordenlijsten", paysuc_feat3: "Onbeperkt · geen advertenties", menu_logged_in: "Aangemeld als", menu_edit_profile: "Profiel bewerken", menu_tarife: "Tarieven en prijzen", menu_pin: "App-icoon vastzetten", pin_title: "Zet ConjuExpert op je startscherm", menu_login: "Account maken / Inloggen", msub_konto: "Voortgang bewaren", msub_profil: "Naam \u00b7 talen \u00b7 niveau", msub_pin: "Op je startscherm", msub_tarife: "Alle functies", msub_rate: "Steun ons \u2014 5 sterren", pin_sub: "– en je kunt meteen vervoegen en quizzen.", pin_tip: "Tip", pin_guide_for: "Hier vind je de uitleg voor:", pin_step_ios: "Deel → „Zet op beginscherm“", pin_step_android: "Menu → „App installeren“", pin_cta: "Nu toevoegen", pin_later: "Later", pin_iphone: "iPhone / iPad", pin_android: "Android", menu_share: "App aanbevelen", err_cancel_fail: "Opzeggen mislukt. Probeer het opnieuw.", err_delete_fail: "Verwijderen mislukt. Probeer het opnieuw.", guest_login_sub: "Meld je aan om voortgang en woorden op te slaan.", guest_login_cta: "Nu aanmelden →", login_welcome_back: "Welkom terug", login_almost_done: "Bijna klaar!", login_create_acct: "Account aanmaken", login_reset_pw: "Wachtwoord resetten", login_sub_login: "Bewaar favorieten & voortgang op alle apparaten", login_sub_login_pay: "Meld je aan — je gaat direct door naar betalen.", login_sub_signup: "Gratis — gegevens veilig in Duitsland", login_sub_signup_pay: "Fijn dat je voor Premium koos — maak eerst een account aan om je abonnement af te ronden.", login_sub_reset: "We sturen je een reset-link", login_done_signup: "Bevestigingsmail verzonden!\nControleer je inbox.", login_done_reset: "Reset-link verzonden!\nControleer je inbox.", login_pw_ph: "Wachtwoord (min. 6 tekens)", login_forgot_pw: "Wachtwoord vergeten?", login_btn_signup: "Account aanmaken", login_btn_reset: "Reset-link versturen", login_or: "of", login_google: "Aanmelden met Google", login_apple: "Aanmelden met Apple", login_no_account: "Nog geen account?", login_has_account: "Al geregistreerd?", login_do_register: "Registreren", login_back: "← Terug naar inloggen", login_data: "🔒 Gegevens opgeslagen in Frankfurt, DE", goal_ai: "AI-voorstel", goal_ai_badge: "MIDDEN", goal_time: "Naar tijd", goal_time_note: "10 min/dag", goal_custom: "Eigen", goal_custom_note: "8 werkw. · 20 woorden", goal_daily: "oefeningen per dag", goal_time_approx: "≈ 6 min · aanpasbaar"
    },
    fr: {
      tagline: "conjuguer · quiz · apprendre", hi: "Salut, {name} 👋", ready: "Quand tu veux, {name}",
      cj_acc: "Créer un compte", cj_later: "Plus tard", cj_reorder_head: "Organise les tuiles à ta façon", cj_reorder_text: "Place ta langue préférée en premier — elle devient ta langue de démarrage : touche l'icône ConjuExpert sur ton écran d'accueil et l'appli s'ouvre directement dedans. La barre de menu en bas se réorganise de la même façon.", cj_no_thx: "Non merci",
      lang_start_set: "{lang} s'ouvre maintenant en premier", lang_reorder_hint: "Appui long & glisser pour réorganiser",
      theme_add: "Ajouter", theme_add_ph: "Ton propre thème…",
      cj_p1_head: "Bravo — déjà 5 verbes !", cj_p1_text: "Crée un compte gratuit : ta progression est conservée et tu t'entraînes <b>2 jours de plus</b> avec Premium – Quiz + Enregistrés.",
      cj_p2_head: "Toujours à portée", cj_p2_text: "Ajoute ConjuExpert à ton écran d'accueil comme une appli – un appui et tu conjugues &amp; quiz en quelques secondes.", cj_p2_yes: "Ajouter à l'écran d'accueil",
      cj_p3_head: "Attends – ne pars pas sans ta progression !", cj_p3_text: "Un compte gratuit (10 secondes) garde tout – et t'offre <b>2 jours de plus</b> de Premium (Quiz + Enregistrés).", cj_p3_yes: "Sauvegarder ma progression", cj_p3_no: "Partir quand même",
      cj_tend_head: "Ton essai Premium de 24 h est terminé", cj_tend_text: "Conjuguer &amp; Apprendre restent gratuits. Envie de continuer le quiz ? Avec un compte gratuit, tu t'entraînes au quiz « Cartes » (20 tours/jour) – plus <b>2 jours de Premium</b> offerts.", cj_tend_yes: "Créer un compte – Quiz + 2 jours", cj_tend_no: "Juste consulter &amp; apprendre",
      cj_help_head: "Aide-nous à progresser", cj_help_text: "Aide-nous à nous améliorer — et à offrir à toi et aux autres ConjuExperts la meilleure expérience possible. On vient tout juste de démarrer et on a vraiment besoin de ton aide si quelque chose coince.", cj_p8_head: "Content de te revoir !", cj_p8_text: "Ta progression est encore là. Sauvegarde-la avec un compte gratuit avant qu'elle ne disparaisse.",
      cj_fb_head: "Comment ça se passe pour toi ?", cj_fb_text: "Sois honnête : qu'est-ce que tu préfères – et que devrions-nous améliorer ?", cj_fb_gift: "🎁 Donne-nous ton avis et reçois un <b>code de 5 €</b> sur l'abonnement annuel.", cj_fb_rate_q: "Comment trouves-tu ConjuExpert ?", cj_fb_ph: "Ton avis…", cj_fb_send: "Donner mon avis &amp; obtenir 5 €", cj_fb_sending: "Envoi…", cj_fb_err: "Échec de l'envoi – réessaie.",
      cj_fbt_head: "Merci pour ton retour !", cj_fbt_text: "Voici ton cadeau : avec le code <b>WILLKOMMEN</b>, tu obtiens Premium pour <b>24,99 €/an</b> au lieu de 29,99 € – valable jusqu'à la fin de ton essai.", cj_fb_secure: "Garder le code &amp; passer Premium",
      hint_quiz_cards_h: "Cartes : mémoriser les verbes en douceur", hint_quiz_cards_1: "Choisis un temps &amp; un thème favori, ainsi que le sens (langue maternelle ↔ langue apprise).", hint_quiz_cards_2: "Regarde le verbe + le temps, trouve la forme dans ta tête — touche la carte pour la retourner.", hint_quiz_cards_3: "Touche les mots inconnus de la phrase d'exemple → traduire &amp; enregistrer.", hint_quiz_cards_4: "Sans pression, sans saisie : idéal pour découvrir les formes et réviser vite.", hint_quiz_speed_h: "Rapide : 60 secondes à fond", hint_quiz_speed_1: "Choisis un temps &amp; un thème, puis démarre — tu as 60 secondes.", hint_quiz_speed_2: "Touche la bonne forme le plus vite possible — chaque bonne réponse compte.", hint_quiz_speed_3: "Idéal pour rendre les formes vite accessibles, avec un peu de pression.",
      hint_quiz_choice_h: "Choix : reconnaître vite la bonne forme", hint_quiz_choice_1: "Une entrée parfaite dans un nouveau temps.", hint_quiz_choice_2: "Choisis un temps &amp; un thème favori.", hint_quiz_choice_3: "Verbe + temps demandé + quatre variantes — touche la bonne pour un retour immédiat.", hint_quiz_choice_4: "Touche les mots inconnus de la phrase d'exemple → traduire &amp; enregistrer.",
      hint_quiz_type_h: "Saisie : écrire les conjugaisons activement", hint_quiz_type_1: "Écrire soi-même ancre le plus les formes — avec <b>Parler</b>, le mode le plus intensif.", hint_quiz_type_2: "Choisis le temps, le thème &amp; le sens — et si tu travailles des verbes seuls ou traduis une phrase entière.", hint_quiz_type_3: "Touche les mots inconnus de la phrase d'exemple → traduire &amp; enregistrer.",
      hint_quiz_speak_h: "Parler : prononce à voix haute", hint_quiz_speak_1: "Parler soi-même ancre le plus les formes — avec <b>Saisie</b>, le mode le plus intensif.", hint_quiz_speak_2: "Choisis le temps, le thème &amp; le sens — et si tu travailles des verbes seuls ou une phrase entière.", hint_quiz_speak_3: "Touche le micro pour démarrer et pour arrêter la saisie vocale.", hint_quiz_speak_4: "Touche les mots inconnus → traduire &amp; enregistrer.",
      hint_quiz_texte_h: "Textes : teste ta compréhension écrite & orale", hint_quiz_texte_1: "Choisis un thème favori, un temps &amp; quel type de verbes pratiquer.", hint_quiz_texte_2: "À la fin, des questions de compréhension t'attendent.", hint_quiz_texte_3: "Touche n'importe quel mot du texte → traduire &amp; enregistrer.", hint_quiz_texte_4: "Astuce : active « Utiliser mes mots » — tes propres mots apparaissent dans l'histoire.",
      hint_learn_h: "Bienvenue dans Apprendre", hint_learn_1: "Chaque temps est expliqué en bilingue, avec des exemples générés automatiquement.", hint_learn_2: "Utilise le sélecteur de temps en haut comme un <b>aide-mémoire</b> pour passer d'une forme à l'autre.", hint_learn_3: "Touche un mot d'exemple pour l'enregistrer dans ton vocabulaire.",
      hint_saved_verbs_h: "Verbes enregistrés", hint_saved_verbs_1: "Ici se réunissent tous les verbes que tu as enregistrés avec ☆ en conjuguant.", hint_saved_verbs_2: "Touche un verbe pour rouvrir sa conjugaison complète.", hint_saved_verbs_3: "Sélectionne-les directement dans le <b>Quiz</b> et entraîne-toi de façon ciblée.", hint_saved_verbs_4: "C'est ainsi que tu construis ta propre liste d'entraînement.",
      hint_saved_vocab_h: "Ton vocabulaire", hint_saved_vocab_1: "Crée ton propre thème (p. ex. « Visite chez le médecin ») &amp; choisis le sens d'entraînement.", hint_saved_vocab_2: "✨ SUPER FONCTION : génère de nouveaux mots — sous « Nouvelle » tape p. ex. « Adjectifs » et touche « Suggérer 10 nouveaux mots ».", hint_saved_vocab_3: "Tes mots enregistrés peuvent aussi être intégrés aux textes du quiz.",
      tab_conjugate: "Conjuguer", tab_quiz: "Quiz", tab_learn: "Apprendre", conjugate: "Conjuguer",
      saved: "Verbes enregistrés", recent: "Récents", clear: "effacer",
      empty_title: "Saisis un verbe à conjuguer", empty_sub: "Tous les temps en {n} langues — saisis un verbe ou appuie sur 🎲.",
      regular: "régulier", irregular: "irrégulier", recommended: "Recommandé", ad_cta: "S'entraîner →",
      mode: "Mode", m_type: "⌨ Saisie", m_choice: "◉ Choix", m_speed: "⚡ Rapide", m_texte: "📖 Textes", mdesc_texte: "Lis une histoire IA — traduis, complète les verbes ou réponds aux questions", texte_question: "Compréhension", texte_cloze: "Compléter les verbes", texte_translate: "Traduire", texte_new: "Nouvelle histoire", texte_writing: "Rédaction de ton histoire…", texte_error: "Impossible d'écrire une histoire — réessaie.", texte_comprehension: "Questions de compréhension", texte_done: "Histoire terminée !", texte_fill_hint: "Mets le verbe au bon temps", texte_learn: "Apprendre le verbe", texte_translation: "Traduction", texte_read: "Lire à voix haute", texte_speed: "Quelle vitesse ?", texte_voice: "Quelle voix ?", texte_voice_auto: "Automatique (meilleure)", texte_almost: "presque terminé …", texte_voice_f: "Femme", texte_voice_m: "Homme", texte_pause: "Pause", texte_resume: "Reprendre", texte_mywords_lbl: "Mon vocabulaire", texte_mywords: "Utiliser mes mots",
      which_tense: "Temps", tense_word: "Temps", all_tenses: "Tous les temps", all_themes: "Tous les thèmes", which_verbs: "Verbes", which_dir: "Direction", dir_produce: "PRODUIRE", dir_recognize: "RECONNAÎTRE", dir_random: "ALÉATOIRE", which_theme: "Thèmes", quiz_mode_hd: "Mode quiz", explain_hd: "Explication", req_form: "Demandé", tip_label: "Astuce", tip_meaning: "Sens", tip_sentence: "Phrase", none_all: "Aucun — tous les temps sont révisés", all_btn: "Tous", none_btn: "Aucun", mist_clear_title: "Erreurs maîtrisées !", mist_clear_sub: "Bravo — tu as revu chaque verbe raté.", mist_practice: "Réviser les erreurs", view_conj: "Voir la conjugaison", mist_exit: "Revenir à tous les verbes",
      correct: "correctes", accuracy: "précision", streak: "série",
      type_form: "saisis la forme…", check: "Vérifier", next: "Suivant →", correct_excl: "✓ Correct !", accent_hint: "Bien ! Attention juste à l’accent : {answer}", answer: "Réponse :",
      hint_type: "Saisis la forme correcte pour le pronom et le temps.", hint_choice: "Choisis la bonne forme — 4 options.",
      challenge: "Défi de 60 secondes", challenge_sub: "Réponds au maximum avant la fin du temps. Touche vite la bonne forme !",
      best: "Record :", start: "Commencer →", sec: "sec", pts: "pts", go: "Allez ! Chaque bonne réponse compte.",
      times_up: "Temps écoulé !", in60: "correctes en 60s", new_best: "🎉 Nouveau record !", play_again: "Rejouer →", back: "Retour",
      tenses: "Temps du {lang}", bilingual: "Bilingue · {a} ⇄ {b}", level: "Niveau", native: "Langue maternelle",
      explanation: "Explication", mnemonic: "🧠 Moyen mnémotechnique", signal_words: "Mots signaux", examples: "Exemples", when_use: "Quand l'utiliser", compare: "Comparer",
      fb_offline: "Les explications IA fonctionnent dans l'aperçu. En attendant, les règles clés :",
      fb_net: "Impossible de charger l'explication. Voici les règles clés :",
      welcome: "Hey ! Tu vas :", welcome_sub: "conjuguer des verbes en 5 langues, faire des quiz et apprendre facilement ta langue préférée.",
      your_name: "Ton nom…", mother_tongue: "Ta langue maternelle", skill_q: "Ton niveau", skill_beginner: "Débutant", skill_beginner_sub: "verbes courants", skill_intermediate: "Moyen", skill_intermediate_sub: "+ irréguliers", skill_advanced: "Avancé", skill_advanced_sub: "tous", lets_go: "C'est parti →", skip: "Passer", remove_name: "Retirer le nom", profile: "Profil", listen: "Écouter", m_cards: "🃏 Cartes", flip: "Touche pour retourner", got_it: "Je sais", again: "À revoir", mistakes: "Erreurs", no_mistakes: "Aucune erreur — elles apparaîtront ici à revoir.", tab_saved: "Favoris", reveal: "Voir la traduction", learned: "Appris ✓", saved_empty: "Aucun verbe enregistré pour le moment. Touche la ★ sur une conjugaison.", tour_conj: "Le cœur : conjugue n\u2019importe quel verbe en 5 langues, à tous les temps — en un coup d\u2019œil.", tour_quiz: "Teste-toi — cartes, choix, saisie & oral — avec des phrases d\u2019exemple générées par IA.", tour_learn: "Comprends chaque temps en bilingue, avec des exemples IA à toucher et mémoriser.", tour_saved: "Mémorise verbes & mots, construis ton vocabulaire et révise-le en répétition espacée.", tour_more1: "L’essentiel : chaque verbe dans 5 langues à tous les temps — plus un apprentissage bilingue avec exemples IA.", tour_more2: "Entraîne-toi avec le quiz (cartes, choix, saisie & oral), mémorise des mots et progresse avec des challenges.", tour_goals_h: "Challenges", tour_goal: "Crée ton challenge personnel — suggestion IA, par temps ou sur-mesure. Suis tes progrès quotidiens et reste motivé(e).", tour_trial_head: "Ton cadeau : 24 h Premium", tour_trial_sub: "Ensuite, débloque ta remise de bienvenue — les tableaux de conjugaison restent toujours gratuits.", tour_feat1: "Quiz & Favoris — tout débloqué", tour_feat2: "Tous les temps & phrases IA", tour_feat3: "5 langues, sans pub", eg_step1: "Verbe au hasard – touche ★ pour garder", eg_step2: "Pratique en Quiz & choisis tes thèmes", eg_step3: "Entraîne les mots gardés dans l'onglet 'Favoris'", hero_kicker: "Salut {name} 👋", hero_plan: "Ton challenge du jour, {name} :", hero_plan_anon: "Ton challenge du jour :", tour_next: "Suivant", tour_start: "Commencer", tour_skip: "Passer", t2_hi: "Ravi de te voir ici, {name} ! 👋", t2_hi_anon: "Ravi de te voir ici ! 👋", t2_ask: "Tu veux un petit tour de l'appli — ou commencer directement ?", t2_start_tour: "Démarrer la visite", t2_skip_tour: "Commencer directement", t2_overview_t: "Voici ce qui t'attend", t2_quiz_tap_t: "Quiz · Toucher", t2_quiz_type_t: "Quiz · Saisie", t2_quiz_text_t: "Quiz · Texte", t2_prices_t: "Offres & tarifs", t2_quizmodes_x: "Entraîne-toi activement jusqu'à la maîtrise — choisis ton mode.", t2_tap_x: "Choisis la bonne forme parmi 4 options.", t2_type_x: "Écris la forme toi-même — entraîne activement l'orthographe.", t2_text_x: "Choisis thème, temps & vocabulaire — l'IA lit ton histoire à voix haute : teste ta compréhension orale.", t2_conj_x: "Saisis un verbe ou lance le dé, choisis le temps — garde-le avec ★.", t2_merken_x: "Touche & garde des mots dans les phrases d'exemple — ou ajoute les tiens.", t2_prices_x: "Conjuguer & apprendre restent gratuits pour toujours · 24 h de Premium à l'essai", t2_ov1_t: "Ton défi d’apprentissage", t2_ov1_d: "Fixe un challenge quotidien, hebdomadaire ou mensuel — suis tes progrès & ta série", t2_ov2_t: "Liste de vocabulaire", t2_ov2_d: "Touche & garde des mots dans des phrases — ou ajoute les tiens", t2_ov3_t: "Thèmes favoris", t2_ov3_d: "Crée tes propres thèmes dans Mémorisés et entraîne-les dans les quiz", t2_m_cards: "Cartes", t2_m_tap: "Toucher", t2_m_type: "Saisie", t2_m_speak: "Parler", t2_m_speed: "⚡ Rapide", t2_m_text: "Texte", t2_f_topic: "Thème", t2_f_tense: "Temps", t2_f_words: "Mots", t2_v_travel: "Voyages", t2_v_saved: "Ma liste", t2_v_work: "travail", t2_p1_t: "24 h Premium", t2_p1_d: "tout tester — sans compte", t2_p2_t: "Avec compte · gratuit", t2_p2_d: "Conjuguer, Apprendre & 20 cartes / jour", t2_p3_t: "ConjuPremium", t2_p3_d: "tout débloqué · an 29,99 € · mois 2,99 €", m_speak: "🎤 Parler", speak_tap: "Touche le micro et dis la forme", speak_heard: "Entendu :", speak_nomic: "La saisie vocale n’est pas disponible ici.", spk_form: "Dire un mot", spk_sentence: "Dire une phrase", spk_what: "Quoi pratiquer ?", spk_say: "Dis-le en {lang}",
      dq_form: "Forme conjuguée", vocab_translate: "Traduire", offline_note: "⚡ Hors ligne — exemples et traductions nécessitent internet", aux_title: "Former les temps composés", aux_logic: "Tous les temps composés se forment pareil : tu conjugues l'auxiliaire {aux} selon la personne et le temps, puis tu ajoutes le participe passé invariable {part}. Seul l'auxiliaire change — le participe reste identique.", aux_note: "Temps composés = auxiliaire + participe passé.", aux_participle: "Participe passé", cards_hint: "Conjugue le verbe au temps demandé mentalement – touche pour la solution", cards_hint_type: "Conjugue le verbe au temps demandé · tape-le dans la case", cards_hint_speak: "Conjugue le verbe au temps demandé · touche le micro pour parler", choose_label: "Choisis :", tap_retry: "Toucher pour traduire", dq_infinitive: "Infinitif", dq_belongs: "De", dq_participle: "Participe passé", dq_gerund: "Gérondif", spk_relearn: "À revoir — voir la réponse", spk_correct_is: "La phrase correcte :", spk_next_sentence: "Phrase suivante →", speak_denied: "Micro bloqué — autorise l'accès dans le navigateur.", speak_nospeech: "Je n'ai pas entendu — réessaie.", mic_start: "Touche une fois pour enregistrer", sent_mist_practice: "Réviser les phrases ratées", spk_context: "Dans une phrase", cloze_instr: "Conjugue le verbe au temps demandé", choose_tile: "choisis la bonne case", mic_stop: "Touche quand c'est fini", tap_word: "touche un mot pour sa traduction", practice_again: "Réviser encore", sk_title: "Challenge & série", sk_today: "Aujourd'hui", sk_streak: "Jours d'affilée", sk_best: "Record", sk_days: "jours", sk_done: "Challenge réussie !", sk_left: "Encore {n} pour le challenge du jour", sk_explain: "Chaque conjugaison et réponse de quiz compte. Termine ton challenge du jour pour garder ta série — un jour manqué la remet à zéro.", sk_close: "Compris", dq_fuzzy: "reconnu sans accents", dq_switched: "passé à l\u2019infinitif", dq_guess: "déduit d\u2019après la terminaison", tfilter_hint: "Glisse · touche pour afficher / masquer un temps", verb_ph: "Saisis un verbe…", autoread: "Lire la réponse", autoread_sub: "si correct", review: "Bilan", native_ph: "…ou un verbe dans ta langue", saved_verbs: "Verbes", saved_vocab: "Vocabulaire", gm_hint_tag: "seulement la 1re fois", gm_hint_tx: "Tu rassembles tout ici — <b>mots, verbes & tes listes</b>. En haut : ce qui est à revoir aujourd'hui.", gm_due_head: "À revoir · toutes les listes", gm_words_verbs: "mots & verbes", gm_review_now: "Réviser", gm_your_lists: "Tes listes", gm_verbs: "Verbes enregistrés", gm_words: "Mots enregistrés", gm_words_n: "mots", gm_due: "à revoir", gm_new_list: "Liste", gm_back: "Enregistré", imp_open: "Coller une liste", imp_title: "Coller toute une liste", imp_help: "Un mot par ligne. Traduction facultative : casa - maison. Sinon on la traduit.", imp_ph: "un mot par ligne…", imp_into: "Dans la liste :", imp_cta: "Ajouter les mots", imp_checking: "Vérification de ta liste…", imp_review_title: "Vérifier & ajouter", imp_review_sub: "{n} suggestions — touche pour accepter ou garder l'original.", imp_add: "Ajouter", imp_added_note: "traduction ajoutée", imp_orig: "avant :", gm_saved_toast: "« {w} » enregistré → Mots enregistrés", gm_ch_cta_h: "Lance ton challenge", gm_ch_cta_s: "Ton plan avec objectif — verbes & mots.", gm_saved_verb_toast: "« {w} » enregistré → Verbes enregistrés", mv_title: "Déplacer vers", cross_open: "D'une autre langue", cross_title: "Reprendre d'une autre langue", cross_help: "Choisis une langue et ses listes — on traduit les mots pour toi.", cross_srch: "Langue source", cross_lists: "Quelles listes ?", cross_cta: "Reprendre & traduire", cross_busy: "Traduction de tes mots…", cross_done: "{n} mots repris", cross_offline: "Nécessite internet", lch_title: "Nouvelle liste", lch_name_ph: "Nom — p. ex. Voyage, Podcast…", lch_how: "Comment la remplir ?", lch_empty: "Commencer vide", lch_tpl: "Avec modèle", saved_tap_hint: "Touche une cellule pour l'écouter · ✕ retire le verbe", ch_tab: "Challenge", ch_empty_head: "Pas encore de challenge en {lang}", ch_empty: "Crées-en un et entraîne-toi ciblé — chaque langue a la sienne.", ch_create: "Créer un challenge", cs_day: "Jour", cs_left: "encore {n}", cs_done: "fait aujourd'hui ✓", cs_start: "Démarrer le challenge", cs_plan: "ton plan", ch_moment: "« {v} » est acquis — maîtrisé !", ch_words_hint: "Les mots se révisent dans ton Vocabulaire", ch_words_go: "Vers le Vocabulaire →", ch_new: "Nouveau challenge", ch_practice: "S'entraîner", ch_left: "encore {n} jours", ch_done_v: "{a} de {b} verbes maîtrisés", ch_done_w: "{a} de {b} mots", ch_edit: "Modifier", ch_editdone: "Terminé", ch_add_ph: "Verbe ou mot…", ch_fill: "Proposer", ch_from_saved: "Depuis Favoris", ch_add_all: "Tout ajouter", ch_choose: "Choisir parmi les favoris", ch_pick_verbs: "Tes verbes favoris", ch_pick_words: "Tes mots favoris", ch_pick_empty_v: "Pas encore de verbes favoris — garde-les avec ☆ en conjuguant.", ch_pick_empty_w: "Pas encore de mots favoris — ajoute-les dans Vocabulaire.", ch_timeup: "Temps écoulé — {a} sur {b} maîtrisés.", ch_extend: "+1 semaine", ch_mastered: "Challenge maîtrisée !", ch_mastered_sub: "Tout est acquis — place à un nouveau challenge.", vocab_all: "Tout", vocab_new_cat: "Nouvelle", vocab_cats_all: "Tous les thèmes", vocab_cats_less: "Moins", vocab_new_cat_q: "Nom de la nouvelle catégorie :", vocab_add_ph: "Ajoute un mot ou une phrase…", vocab_empty: "Pas encore de mots — ajoute le premier ci-dessus.", vocab_practice: "Réviser", vocab_word: "mot", vocab_phrase: "phrase", vocab_type_target: "Écris-le en {lang}…", vocab_done: "Tour terminé !", vocab_save: "Garder", vocab_saved: "Gardé", vocab_seeding: "Chargement des mots de départ…", vocab_suggest: "Suggérer 10 nouveaux mots", vocab_due: "À revoir aujourd'hui", vocab_strength: "Force mémoire", vocab_starter: "Charger 5 mots de départ", gr_ind: "Indicatif", gr_subj: "Subjonctif", gr_cond: "Conditionnel", gr_imp: "Impératif", gr_cont: "Forme progressive", gr_forms: "Formes non personnelles", how_formed: "Comment se forme-t-il ?", key_irregulars: "Verbes irréguliers clés", irr_note: "Touche un verbe pour voir sa conjugaison complète.", tap_save: "touche un mot – sens & garder", report_link: "Signaler une erreur", report_title: "Qu'est-ce qui ne va pas ?", r_grammar: "Grammaire incorrecte", r_unnatural: "Pas naturel", r_translation: "Mauvaise traduction", r_other: "Autre chose", report_note: "Remarque (facultatif)…", report_send: "Envoyer", report_thanks: "Merci — on regarde ça !", acct_created: "✓ Compte créé — bienvenue !", zt_greets: "Tu assures aujourd'hui,|Tu es en forme,|Tu progresses,|Content de te voir,|La régularité paie,|Continue,", zt_eyebrow: "Ton challenge", ch_adjust: "Modifier le challenge", zt_today: "Déjà {a} sur {b} exercices aujourd'hui", zt_left_suffix: " — encore {n} pour ton challenge du jour.", zt_done_suffix: " — challenge du jour réussi ! 🎉", zt_min_left: "min restantes", zt_verbs_prog: "Verbes {a}/{b} maîtrisés", zt_words_prog: "Mots {a}/{b}", zt_streak: "{n} jours d'affilée", zt_to_list: "Vers ta liste de challenge", zt_keep: "Continuer à réviser", zt_to_quiz: "Vers le quiz →", zt_other_head: "Autres langues", zt_lang_prog: "{a}/{b} maîtrisés", gf_week: "semaine", gf_weeks: "semaines", gf_verbs: "Verbes", gf_words: "Mots", gf_min_abbr: "min", gf_per_day_lbl: "Exercices/jour", gf_all_tenses: "tous les temps", gf_ki_title: "Ta suggestion IA — niveau intermédiaire.", gf_ki_sub: " Déjà rempli — ajuste tout librement.", gf_period: "Période", gf_tense: "Temps", gf_conj_verbs: "Conjuguer des verbes", gf_num_verbs: "Nombre de verbes", gf_per_tense: "par temps", gf_new_words: "Nouveaux mots", gf_vocab: "Vocabulaire", gf_learn_new: "à apprendre", gf_ex_per_day: "exercices par jour", gf_daily_auto: "Ta challenge du jour — s'adapte toute seule.", gf_overview: "Aperçu de la challenge", gf_sum: "En {weeks} : {verbs} verbes en {tenses}, plus {words} nouveaux mots.", gf_start_cta: "Lance ta challenge · {n} exercices/jour", gf_h1_pre: "Pour devenir un ", gf_h1_post: ", relève une challenge avec nous :", gf_choose_sub: "Choisis ton type de challenge.", ch_for_lang: "Pour", gf_suggest_h: "Propose-m'en une", gf_level_mid: "NIVEAU : MOYEN", gf_suggest_s: "On te crée une challenge adaptée en quelques secondes, selon ton niveau.", gf_ind_h: "Challenge personnalisée", gf_ind_s: "Définis toi-même la période, les temps, les verbes et les mots.", gf_or_time: "ou par temps", gf_by_time: "Par temps", gf_time_h: "Je fixe mon temps", gf_time_s: "« Je veux m'entraîner … minutes par jour » — on calcule ta challenge.", gf_back: "retour", gf_time_q: "Combien de minutes veux-tu t'entraîner par jour ?", gf_time_qs: "On calcule automatiquement ta challenge quotidienne idéale.", gf_mins_day: "Minutes par jour", gf_mins_min: "3 min minimum conseillé", gf_ex_approx: "Exercices par jour · ≈ {n} min", gf_vw_daily: "~{v} verbes et {w} mots par jour.", gf_sum_time: "{mins} minutes par jour = {per} exercices/jour. En 2 semaines tu apprendras environ {verbs} verbes et {words} nouveaux mots.", gs_title: "Ta challenge est prête{name}.", gs_sub: "Amuse-toi bien — imagine-toi bientôt parler couramment ta langue préférée. 🌟", gs_set_verbs: "Choisir les verbes →", gs_set_hint: "choisis dans Enregistrés, saisis ou demande des suggestions", gs_later: "Plus tard", gc_daily_done: "Challenge du jour réussie !", gc_done_plan: "Tu as terminé ta challenge de {d} jours{name} ! Place à une nouvelle.", gc_done_named: "{name}, tu as fait {n} exercices aujourd'hui — bravo !", gc_done_anon: "Tu as fait {n} exercices aujourd'hui — bravo !", gc_ex_today: "Exercices aujourd'hui", gc_streak_lbl: "Jours d'affilée", gc_plan_day: "Jour du plan", report_general: "Signaler un problème", report_general_sub: "Bug ou problème — capture bienvenue", report_attach: "Joindre une capture", report_shot_hint: "Une capture nous aide à trouver le problème plus vite.", type_word: "Écrire un mot", type_sentence: "Écrire une phrase", spk_translate: "Traduis ceci", qi_title: "Comment veux-tu t'entraîner ?", qi_sub: "Choisis un mode — chacun entraîne une compétence.", qi_foot: "Astuce : règle les filtres de temps et de verbes après.", qi_back: "Aperçu", mdesc_cards: "Retourner des cartes — voir la réponse, sans stress", mdesc_choice: "Choix multiple — choisis la bonne forme", mdesc_speed: "Sprint de 60 s — combien en fais-tu ?", mdesc_type: "Écris la forme ou traduis une phrase", mdesc_speak: "Dis-le à voix haute — reconnaissance vocale",
      paywall_lock: "🔒 Le Quiz et Mémorisés sont Premium", paywall_h1: "Conjugue sans réfléchir", paywall_sub: "Le Quiz t'entraîne activement jusqu'à ce que les formes soient ancrées — et Mémorisés te permet de pratiquer exactement le vocabulaire qui compte pour toi.", paywall_unlock: "Débloquer Premium", paywall_later: "Peut-être plus tard", pw_feat1: "Quiz interactif", pw_feat1v: "4 modes", pw_feat2: "Mémorisés & listes de vocab.", pw_feat2v: "illimité", pw_feat3: "Conjugaison & Apprendre", pw_feat3v: "reste gratuit",
      offer_badge: "🚀 OFFRE DE BIENVENUE · −{disc} %", offer_expires: "L'offre expire dans {t}", offer_instead: "au lieu de", offer_mo: "mois.", offer_yr: "/ an", offer_you_pay: "tu paies :", offer_save: "tu économises {save} € (−{disc} %)", offer_secure: "Profiter de l'offre", offer_trial: "Essayer 24 h gratuit d'abord", offer_trial_b: "24 h Premium gratuit", offer_close: "Fermer l'offre", offer_price_label: "Prix : {price} € par an, au lieu de {eq} € mensuels",
      plan_hero_h1: "Apprends sans limites", plan_hero_sub: "Quiz & Mémorisés illimités dans les 5 langues", plan_annual: "Abonnement annuel", plan_monthly: "Abonnement mensuel", plan_best: "★ Le plus populaire", plan_bonus: "🎁 Bonus de bienvenue", plan_per_mo: "/ mois", plan_per_yr: "/ an", plan_instead: "au lieu de", plan_save: "tu économises {save} € (−{disc} %)", plan_mo_label: "~{price} € / mois · au lieu de {eq} €", plan_flex: "flexible · équiv. {eq} € / an", plan_feat1: "Quiz de conjugaison interactif", plan_feat2: "Mémorisés & listes de vocabulaire", plan_feat3: "5 langues — ES, FR, EN, NL, DE", plan_feat4: "Tous appareils · sans pub", plan_cta: "Continuer vers le paiement", plan_cancelable: "annulable à tout moment", plan_have_account: "Déjà un compte ?", sign_in: "Se connecter", plan_coupon: "Utiliser un code promo", pr_title: "Tarifs & abonnements", pr_eyebrow: "Tarifs", pr_free: "Gratuit", pr_premium: "Premium", pr_feat_conj: "Conjuguer les verbes · tous les temps", pr_active: "Tu as Premium – merci ! 💜", pr_anon: "Anonyme", pr_konto: "Compte", pr_quiz_day: "20/jour", pr_trial_note: "🎁 Avec compte : 2 jours de Premium offerts", pr_feat_goals: "Challenges & progrès", ap_lock: "🔓 Compte gratuit", ap_h1: "Quiz avec un compte gratuit", ap_sub: "Crée un compte gratuit pour t'entraîner avec le quiz — plus 2 jours de Premium offerts.", ap_feat1: "20 cartes de quiz par jour", ap_feat2: "2 jours de Premium offerts", ap_feat3: "Progression sur tous tes appareils", ap_cta: "Créer un compte gratuit", ql_lock: "🔓 Limite quotidienne atteinte", ql_h1: "20 cartes faites pour aujourd'hui !", ql_sub: "Bravo ! Avec Premium tu t'entraînes sans limite — ou reviens demain pour 20 nouvelles cartes.", ql_feat1: "Quiz sans limite — tous les modes", ql_cta: "Débloquer Premium", coupon_title: "Code promo", coupon_need_login: "Connecte-toi d'abord pour utiliser un code.", coupon_sign_in: "Se connecter maintenant", coupon_ph: "Saisir le code", coupon_redeem: "Utiliser", coupon_redeeming: "En cours…",
      menu_rate: "Évaluer l'app", menu_logout: "Se déconnecter", menu_cancel_sub: "Résilier l'abonnement", menu_sub_active_until: "✓ Abonnement résilié — actif jusqu'au {date}", menu_delete_acc: "Supprimer le compte", cancel_title: "Résilier l'abonnement", cancel_body: "Ton Premium court jusqu'au {date} — ensuite tu passes automatiquement à la version gratuite. Ton compte reste.", cancel_no: "Retour", cancel_yes: "Résilier maintenant", delete_title: "Supprimer le compte", delete_warn_days: "⚠️ Tu perdras {n} jours payés", delete_warn_body: "Ton abonnement est actif jusqu'au {date}. Si tu résilie d'abord, tu peux encore utiliser le temps restant.", delete_cancel_first: "D'abord résilier l'abonnement", delete_anyway: "Supprimer quand même", delete_data: "Toutes les données seront définitivement supprimées.", delete_yes: "Supprimer",
      sub_runs_until: "Ton abonnement court jusqu'au {date} — tu peux continuer à utiliser l'app jusqu'alors.", sub_end_period: "fin de la période de facturation en cours", goodbye_heading: "Dommage que tu partes — mais tu es un pro maintenant !", goodbye_love: "Tout le meilleur pour toi.", goodbye_data: "Bien sûr, nous supprimerons tes données.", goodbye_btn: "Au revoir ! 👋", pay_error: "Le paiement n'a pas pu démarrer. Veuillez réessayer.", bonus_trial: "Sécuriser Premium", bonus_welcome: "Profiter du bonus de bienvenue", bonus_quiz: "Obtenir Quiz & Mémorisés !", ios_homescreen: "Ajoute ConjuExpert à ton écran d'accueil !", ios_share: "Partager → Ajouter à l'écran d'accueil", ios_close: "Fermer", ios_how: "Comment faire", pwa_home: "ConjuExpert sur ton écran d'accueil !", pwa_nostore: "Pas besoin d'app store.", ios_help_title: "Ajoute-le sur ton iPhone", ios_help_1: "Dans Safari, touche en haut le <b>bouton Partager</b> (carré avec une flèche vers le haut).", ios_help_2: "Choisis <b>« Sur l'écran d'accueil »</b>.", ios_help_3: "Touche <b>« Ajouter »</b> en haut à droite — c'est fait !", and_help_title: "Ajoute-le sur ton Android", and_help_1: "Touche le <b>menu</b> (⋮) en haut à droite.", and_help_2: "Choisis <b>« Installer l'application »</b> ou <b>« Sur l'écran d'accueil »</b>.", and_help_3: "Confirme avec <b>« Installer »</b> — c'est fait !", pin_help_ios: "Guide pour iPhone", pin_help_android: "Guide pour Android", rev_kicker: "20 secondes · grand impact", rev_heading: "avant que tu continues …", rev_body1: "Tu es déjà sur l'app depuis <b>{mins} minutes</b> aujourd'hui — bravo !", rev_body2: "Aide les autres à trouver leur langue préférée : avec un <b>court avis</b>, ConjuExpert est trouvé — ton plus grand soutien pour nous. 💛", rev_rate: "Évaluer maintenant →", rev_feedback: "Préfères-tu laisser un commentaire ?", rev_snooze: "Me rappeler plus tard", paysuc_sub: "Tu peux utiliser toutes les fonctions Premium ! Profite du quiz et de l'apprentissage de ta langue préférée 🎉", paysuc_feat1: "Quiz — tous les modes & langues", paysuc_feat2: "Mémorisés & listes de vocabulaire", paysuc_feat3: "Illimité · sans pub", menu_logged_in: "Connecté en tant que", menu_edit_profile: "Modifier le profil", menu_tarife: "Tarifs et prix", menu_pin: "Épingler l'icône", pin_title: "Ajoute ConjuExpert à ton écran d'accueil", menu_login: "Cr\u00e9er un compte / Se connecter", msub_konto: "Sauvegarde ta progression", msub_profil: "Nom \u00b7 langues \u00b7 niveau", msub_pin: "Sur l\u0027\u00e9cran d\u0027accueil", msub_tarife: "Toutes les fonctions", msub_rate: "Soutiens-nous \u2014 5 \u00e9toiles", pin_sub: "– et tu peux conjuguer et t'entraîner aussitôt.", pin_tip: "Astuce", pin_guide_for: "Voici le guide pour :", pin_step_ios: "Partager → „Écran d’accueil“", pin_step_android: "Menu → „Installer l’app“", pin_cta: "Ajouter", pin_later: "Plus tard", pin_iphone: "iPhone / iPad", pin_android: "Android", menu_share: "Recommander l'app", err_cancel_fail: "Résiliation échouée. Réessaie.", err_delete_fail: "Suppression échouée. Réessaie.", guest_login_sub: "Connecte-toi pour sauvegarder ta progression et ton vocabulaire.", guest_login_cta: "Se connecter maintenant →", login_welcome_back: "Content de te revoir", login_almost_done: "Presque là !", login_create_acct: "Créer un compte", login_reset_pw: "Réinitialiser le mot de passe", login_sub_login: "Sauvegarde favoris & progression sur tous les appareils", login_sub_login_pay: "Connecte-toi — tu passeras directement au paiement.", login_sub_signup: "Gratuit — données en sécurité en Allemagne", login_sub_signup_pay: "Super d'avoir choisi Premium — crée d'abord un compte pour finaliser ton abonnement.", login_sub_reset: "Nous t'enverrons un lien de réinitialisation", login_done_signup: "Email de confirmation envoyé !\nVérifie ta boîte mail.", login_done_reset: "Lien de réinitialisation envoyé !\nVérifie ta boîte mail.", login_pw_ph: "Mot de passe (min. 6 caractères)", login_forgot_pw: "Mot de passe oublié ?", login_btn_signup: "Créer un compte", login_btn_reset: "Envoyer le lien", login_or: "ou", login_google: "Se connecter avec Google", login_apple: "Se connecter avec Apple", login_no_account: "Pas encore de compte ?", login_has_account: "Déjà inscrit(e) ?", login_do_register: "S'inscrire", login_back: "← Retour à la connexion", login_data: "🔒 Données enregistrées à Frankfurt, DE", goal_ai: "Suggestion IA", goal_ai_badge: "MOY.", goal_time: "Par temps", goal_time_note: "10 min/jour", goal_custom: "Personnalisé", goal_custom_note: "8 verbes · 20 mots", goal_daily: "exercices par jour", goal_time_approx: "≈ 6 min · ajustable"
    }
  };
})();
;
/* Grammar tips per language */
(function () {
  window.GRAMMAR = {
    en: [
      {
        title: "Regular verbs",
        body: "Most English verbs are regular: form the past and the participle by adding <b>-ed</b> (work → worked → worked). After a short vowel + consonant, double it (stop → stopped). A final <b>-y</b> after a consonant becomes <b>-ied</b> (try → tried)."
      },
      {
        title: "Irregular verbs",
        body: "A small but very frequent group has its own past and participle: <b>go → went → gone</b>, <b>see → saw → seen</b>, <b>be → was/were → been</b>. There is no rule — learn them in threes (infinitive · past · participle)."
      },
      {
        title: "Third person -s",
        body: "In the present, add <b>-s</b> for he / she / it: she <i>works</i>. After o, s, x, z, ch, sh add <b>-es</b> (go → goes), and consonant + y → <b>-ies</b> (fly → flies)."
      },
      {
        title: "Building tenses",
        body: "English loves helpers: <b>will</b> + verb for the future, <b>would</b> + verb for the conditional, <b>have/has</b> + participle for the present perfect."
      }
    ],
    de: [
      {
        title: "Regelmäßige (schwache) Verben",
        body: "Schwache Verben bilden das Präteritum mit <b>-te</b> und das Partizip mit <b>ge…-t</b>: machen → machte → gemacht. Endet der Stamm auf <b>d/t</b>, wird ein <b>-e-</b> eingeschoben: arbeiten → arbeit<b>e</b>te → gearbeit<b>e</b>t."
      },
      {
        title: "Unregelmäßige (starke) Verben",
        body: "Starke Verben ändern den Stammvokal (Ablaut): <b>sprechen → sprach → gesprochen</b>, <b>gehen → ging → gegangen</b>. Oft ändert sich auch der Vokal in der 2./3. Person Präsens: ich spreche, du <b>sprichst</b>, er <b>spricht</b>."
      },
      {
        title: "haben oder sein im Perfekt?",
        body: "Die meisten Verben nehmen <b>haben</b>. Verben der Bewegung und Zustandsänderung nehmen <b>sein</b>: ich <b>bin</b> gegangen, sie <b>ist</b> gefahren, es <b>ist</b> geworden."
      },
      {
        title: "Futur & Konjunktiv",
        body: "Futur I = <b>werden</b> + Infinitiv (ich werde machen). Konjunktiv II drückt Wünsche/Irreales aus; im Alltag oft mit <b>würde</b> + Infinitiv (ich würde gehen) statt der alten Form (ich ginge)."
      }
    ],
    es: [
      {
        title: "Tres conjugaciones: -ar · -er · -ir",
        body: "Quita la terminación y añade las desinencias. Presente regular: habl<b>o</b>, habl<b>as</b>, habl<b>a</b>… / com<b>o</b>, com<b>es</b>, com<b>e</b>… / viv<b>o</b>, viv<b>es</b>, viv<b>e</b>…"
      },
      {
        title: "Verbos irregulares",
        body: "Algunos cambian la raíz (e→ie, o→ue): <b>querer → quiero</b>, <b>poder → puedo</b>. Otros son totalmente irregulares: <b>ser, ir, haber, hacer, tener</b>. Son los más usados, así que vale la pena memorizarlos."
      },
      {
        title: "Futuro y condicional",
        body: "Se forman sobre el <b>infinitivo completo</b> + terminaciones: hablar<b>é</b>, hablar<b>ás</b>… / hablar<b>ía</b>, hablar<b>ías</b>… Por eso un infinitivo irregular (tendr-, har-, podr-) afecta a ambos tiempos."
      },
      {
        title: "El subjuntivo",
        body: "Expresa deseo, duda o emoción: <i>espero que <b>hables</b></i>. Para los verbos en -ar usa terminaciones en -e; para -er/-ir, en -a."
      }
    ],
    nl: [
      {
        title: "Regelmatige werkwoorden",
        body: "Neem de stam (ik-vorm) en voeg toe: tegenwoordige tijd <b>stam / stam+t / stam+t</b>. De voltooide tijd is <b>ge…+t/d</b>: werken → gewerkt, maken → gemaakt."
      },
      {
        title: "'t kofschip",
        body: "Eindigt de stam op een van de medeklinkers in <b>’t kofschip</b> (t, k, f, s, ch, p)? Dan krijg je <b>-te / -t</b>. Anders <b>-de / -d</b>: werk<b>te</b> · gewerk<b>t</b>, maar speel<b>de</b> · gespeel<b>d</b>."
      },
      {
        title: "Onregelmatige werkwoorden",
        body: "Sterke werkwoorden veranderen de klinker: <b>lopen → liep → gelopen</b>, <b>zien → zag → gezien</b>. <b>Zijn</b> en <b>hebben</b> zijn volledig onregelmatig en heel frequent."
      },
      {
        title: "hebben of zijn?",
        body: "De voltooide tijd gebruikt meestal <b>hebben</b>. Bij beweging of verandering gebruik je <b>zijn</b>: ik <b>ben</b> gegaan, hij <b>is</b> gekomen, het <b>is</b> geworden."
      }
    ],
    fr: [
      {
        title: "Trois groupes : -er · -ir · -re",
        body: "1er groupe (-er, le plus grand) : <b>parler → je parle, tu parles, il parle…</b> 2e groupe (-ir avec -iss-) : <b>finir → je finis, nous finissons</b>. 3e groupe (-re et irréguliers) : <b>vendre → je vends, il vend</b>."
      },
      {
        title: "Verbes irréguliers",
        body: "Les plus fréquents sont irréguliers : <b>être, avoir, aller, faire, dire, pouvoir, vouloir</b>. Ils changent de radical : <i>je vais, nous allons, ils vont</i>. Mieux vaut les apprendre par cœur."
      },
      {
        title: "Le passé composé : avoir ou être ?",
        body: "Passé composé = auxiliaire au présent + participe passé. La plupart des verbes prennent <b>avoir</b> (j'ai mangé). Les verbes de mouvement et les pronominaux prennent <b>être</b> : <i>je suis allé, elle est venue</i> (accord avec le sujet)."
      },
      {
        title: "Futur, conditionnel & imparfait",
        body: "Futur et conditionnel se forment sur le <b>radical du futur</b> (souvent l'infinitif) : <i>je parlerai / je parlerais</i>. L'imparfait se forme sur le radical du <b>nous</b> au présent : <i>nous parlons → je parlais</i>."
      }
    ]
  };

  /* ====================================================================
     Pre-written grammar lessons for the most common tenses, in a warm,
     patient-teacher tone. The Learn tab shows these INSTANTLY (no AI wait,
     works offline). Target-language parts (name, explain_t, signal words w,
     example sentences s, compare.with) are stored once; everything that
     depends on the learner's mother tongue lives under `n` per UI language
     (de/en/es/nl/fr). Example verbs are wrapped in **double asterisks**.
     Rarer tenses still fall back to the on-demand AI explainer.
     ==================================================================== */
  window.GRAMMAR_STATIC = {
    en: {
      present: {
        name: "Present Simple",
        explain_t: "Use the present simple for habits, routines, facts and things that are generally true. Don't forget the little **-s** for he, she and it.",
        signals: [{ w: "every day" }, { w: "usually" }, { w: "always" }, { w: "never" }],
        examples: [{ s: "I **work** from home on Fridays." }, { s: "She **drinks** coffee every morning." }],
        compare: { with: "Present Continuous" },
        n: {
          en: { explain_n: "It's your everyday workhorse: habits, facts and routines. Just remember the -s for he/she/it.", mnemonic: "he, she, it — the 's' must fit!", signals: ["every day", "usually", "always", "never"], examples: ["I work from home on Fridays.", "She drinks coffee every morning."], use: ["Habits and routines", "Facts and general truths"], avoid: ["Not for something happening right now — that's the present continuous."], compare_rows: [["general, always true", "happening right now"]], compare_note: "Present simple = in general; present continuous = at this very moment." },
          de: { explain_n: "Dein Alltagshelfer für Gewohnheiten, Tatsachen und Routinen. Denk nur an das -s bei he/she/it.", mnemonic: "he, she, it — das ‚s‘ muss mit!", signals: ["jeden Tag", "normalerweise", "immer", "nie"], examples: ["Ich arbeite freitags von zu Hause.", "Sie trinkt jeden Morgen Kaffee."], use: ["Gewohnheiten und Routinen", "Tatsachen und Allgemeingültiges"], avoid: ["Nicht für etwas, das gerade jetzt passiert — das ist das Present Continuous."], compare_rows: [["allgemein, immer wahr", "gerade im Moment"]], compare_note: "Present Simple = allgemein; Present Continuous = genau jetzt." },
          es: { explain_n: "Tu herramienta diaria: hábitos, hechos y rutinas. Solo recuerda la -s para he/she/it.", mnemonic: "he, she, it — ¡la ‘s’ no se va!", signals: ["cada día", "normalmente", "siempre", "nunca"], examples: ["Trabajo desde casa los viernes.", "Ella bebe café cada mañana."], use: ["Hábitos y rutinas", "Hechos y verdades generales"], avoid: ["No para algo que ocurre justo ahora (eso es el present continuous)."], compare_rows: [["general, siempre cierto", "justo ahora"]], compare_note: "Present simple = en general; present continuous = en este momento." },
          nl: { explain_n: "Je dagelijkse hulp: gewoontes, feiten en routines. Vergeet de -s niet bij he/she/it.", mnemonic: "he, she, it — de ‘s’ moet erbij!", signals: ["elke dag", "meestal", "altijd", "nooit"], examples: ["Ik werk op vrijdag thuis.", "Zij drinkt elke ochtend koffie."], use: ["Gewoontes en routines", "Feiten en algemene waarheden"], avoid: ["Niet voor iets dat nu bezig is (dat is present continuous)."], compare_rows: [["algemeen, altijd waar", "nu bezig"]], compare_note: "Present simple = algemeen; present continuous = nu op dit moment." },
          fr: { explain_n: "Ton outil de tous les jours : habitudes, faits et routines. Pense juste au -s pour he/she/it.", mnemonic: "he, she, it — le ‘s’ est de rigueur !", signals: ["chaque jour", "d'habitude", "toujours", "jamais"], examples: ["Je travaille chez moi le vendredi.", "Elle boit un café chaque matin."], use: ["Habitudes et routines", "Faits et vérités générales"], avoid: ["Pas pour une action en cours en ce moment (c'est le present continuous)."], compare_rows: [["général, toujours vrai", "juste maintenant"]], compare_note: "Present simple = en général ; present continuous = en ce moment." }
        }
      },
      presentCont: {
        name: "Present Continuous",
        explain_t: "Use **am/is/are + verb-ing** for actions happening right now or around the present time. It captures the live, in-progress moment.",
        signals: [{ w: "now" }, { w: "right now" }, { w: "at the moment" }, { w: "today" }],
        examples: [{ s: "I **am working** right now." }, { s: "They **are watching** a film." }],
        compare: { with: "Present Simple" },
        n: {
          en: { explain_n: "am/is/are + -ing shows the action live, in progress at this moment.", mnemonic: "Picture a webcam: it's happening as we speak — '-ing'.", signals: ["now", "right now", "at the moment", "today"], examples: ["I am working right now.", "They are watching a film."], use: ["Actions happening right now", "Temporary situations around now"], avoid: ["Not with state verbs like know, want, like."], compare_rows: [["happening right now", "in general / always"]], compare_note: "Continuous = this moment; simple = a general habit." },
          de: { explain_n: "am/is/are + -ing zeigt die Handlung live, gerade im Gange.", mnemonic: "Stell dir eine Webcam vor: es passiert jetzt — ‚-ing‘.", signals: ["jetzt", "gerade jetzt", "im Moment", "heute"], examples: ["Ich arbeite gerade.", "Sie schauen einen Film."], use: ["Handlungen, die gerade jetzt passieren", "Vorübergehende Situationen rund um jetzt"], avoid: ["Nicht mit Zustandsverben wie know, want, like."], compare_rows: [["gerade jetzt", "allgemein / immer"]], compare_note: "Continuous = dieser Moment; Simple = allgemeine Gewohnheit." },
          es: { explain_n: "am/is/are + -ing muestra la acción en directo, en curso ahora mismo.", mnemonic: "Imagina una webcam: ocurre mientras hablamos — ‘-ing’.", signals: ["ahora", "ahora mismo", "en este momento", "hoy"], examples: ["Estoy trabajando ahora mismo.", "Están viendo una película."], use: ["Acciones que ocurren justo ahora", "Situaciones temporales en torno a ahora"], avoid: ["No con verbos de estado como know, want, like."], compare_rows: [["justo ahora", "en general / siempre"]], compare_note: "Continuous = este momento; simple = hábito general." },
          nl: { explain_n: "am/is/are + -ing toont de handeling live, nu bezig.", mnemonic: "Denk aan een webcam: het gebeurt nu — ‘-ing’.", signals: ["nu", "op dit moment", "momenteel", "vandaag"], examples: ["Ik ben nu aan het werk.", "Ze kijken een film."], use: ["Handelingen die nu gebeuren", "Tijdelijke situaties rond nu"], avoid: ["Niet met toestandswerkwoorden zoals know, want, like."], compare_rows: [["nu bezig", "in het algemeen / altijd"]], compare_note: "Continuous = dit moment; simple = algemene gewoonte." },
          fr: { explain_n: "am/is/are + -ing montre l'action en direct, en cours en ce moment.", mnemonic: "Imagine une webcam : ça se passe là, maintenant — ‘-ing’.", signals: ["maintenant", "en ce moment", "actuellement", "aujourd'hui"], examples: ["Je suis en train de travailler.", "Ils regardent un film."], use: ["Actions en cours en ce moment", "Situations temporaires autour de maintenant"], avoid: ["Pas avec les verbes d'état comme know, want, like."], compare_rows: [["en ce moment", "en général / toujours"]], compare_note: "Continuous = cet instant ; simple = habitude générale." }
        }
      },
      past: {
        name: "Simple Past",
        explain_t: "Use the simple past for finished actions at a definite time in the past. Regular verbs add **-ed**; many common verbs are irregular (go → went).",
        signals: [{ w: "yesterday" }, { w: "last week" }, { w: "in 2020" }, { w: "ago" }],
        examples: [{ s: "I **visited** my grandparents yesterday." }, { s: "We **went** to Rome last summer." }],
        compare: { with: "Present Perfect" },
        n: {
          en: { explain_n: "Finished actions at a clear past time. Regular = -ed; irregular verbs just have to be learned.", mnemonic: "A clear 'when' in the past → simple past.", signals: ["yesterday", "last week", "in 2020", "ago"], examples: ["I visited my grandparents yesterday.", "We went to Rome last summer."], use: ["Completed actions with a definite past time", "A sequence of past events (a story)"], avoid: ["Not when the time is unspecified or still relevant — use the present perfect."], compare_rows: [["finished, definite time", "link to now, no exact time"]], compare_note: "I saw it yesterday (simple past) vs. I have seen it (present perfect)." },
          de: { explain_n: "Abgeschlossene Handlungen zu einem klaren Zeitpunkt in der Vergangenheit. Regelmäßig = -ed; unregelmäßige lernst du auswendig.", mnemonic: "Ein klares ‚wann‘ in der Vergangenheit → Simple Past.", signals: ["gestern", "letzte Woche", "2020", "vor"], examples: ["Ich habe gestern meine Großeltern besucht.", "Wir sind letzten Sommer nach Rom gefahren."], use: ["Abgeschlossene Handlungen mit klarem Zeitpunkt", "Eine Abfolge von Ereignissen (eine Geschichte)"], avoid: ["Nicht, wenn die Zeit unbestimmt oder noch relevant ist — dann Present Perfect."], compare_rows: [["abgeschlossen, feste Zeit", "Bezug zu jetzt, keine genaue Zeit"]], compare_note: "I saw it yesterday (Simple Past) vs. I have seen it (Present Perfect)." },
          es: { explain_n: "Acciones terminadas en un momento claro del pasado. Regular = -ed; los irregulares se aprenden de memoria.", mnemonic: "Un ‘cuándo’ claro en el pasado → simple past.", signals: ["ayer", "la semana pasada", "en 2020", "hace"], examples: ["Ayer visité a mis abuelos.", "Fuimos a Roma el verano pasado."], use: ["Acciones terminadas con un momento concreto", "Una secuencia de hechos (una historia)"], avoid: ["No si el tiempo es indefinido o aún relevante — usa el present perfect."], compare_rows: [["terminado, tiempo concreto", "conexión con el ahora, sin hora exacta"]], compare_note: "I saw it yesterday (simple past) vs. I have seen it (present perfect)." },
          nl: { explain_n: "Afgeronde handelingen op een duidelijk moment in het verleden. Regelmatig = -ed; onregelmatige leer je uit het hoofd.", mnemonic: "Een duidelijk ‘wanneer’ in het verleden → simple past.", signals: ["gisteren", "vorige week", "in 2020", "geleden"], examples: ["Ik bezocht gisteren mijn grootouders.", "We gingen vorige zomer naar Rome."], use: ["Afgeronde handelingen met een concreet moment", "Een reeks gebeurtenissen (een verhaal)"], avoid: ["Niet als de tijd onbepaald of nog relevant is — gebruik present perfect."], compare_rows: [["afgerond, vaste tijd", "verband met nu, geen exacte tijd"]], compare_note: "I saw it yesterday (simple past) vs. I have seen it (present perfect)." },
          fr: { explain_n: "Actions terminées à un moment précis du passé. Régulier = -ed ; les irréguliers s'apprennent par cœur.", mnemonic: "Un ‘quand’ clair dans le passé → simple past.", signals: ["hier", "la semaine dernière", "en 2020", "il y a"], examples: ["Hier, j'ai rendu visite à mes grands-parents.", "Nous sommes allés à Rome l'été dernier."], use: ["Actions terminées avec un moment précis", "Une suite d'événements (un récit)"], avoid: ["Pas si le moment est indéfini ou encore d'actualité — utilise le present perfect."], compare_rows: [["terminé, moment précis", "lien avec maintenant, sans heure exacte"]], compare_note: "I saw it yesterday (simple past) vs. I have seen it (present perfect)." }
        }
      },
      perfect: {
        name: "Present Perfect",
        explain_t: "Use **have/has + past participle** for past actions that connect to now: life experience, recent news, or something with no specific time.",
        signals: [{ w: "ever" }, { w: "never" }, { w: "already" }, { w: "yet" }],
        examples: [{ s: "I **have visited** Japan twice." }, { s: "She **has just finished** her homework." }],
        compare: { with: "Simple Past" },
        n: {
          en: { explain_n: "have/has + participle links the past to now — experiences and results, no exact time.", mnemonic: "Past with a bridge to the present: have + done.", signals: ["ever", "never", "already", "yet"], examples: ["I have visited Japan twice.", "She has just finished her homework."], use: ["Life experiences (no exact time)", "Recent actions with a result now"], avoid: ["Not with a finished past time word like 'yesterday' — use the simple past."], compare_rows: [["link to now, no exact time", "finished, definite time"]], compare_note: "I have seen it (perfect) vs. I saw it yesterday (simple past)." },
          de: { explain_n: "have/has + Partizip verbindet die Vergangenheit mit dem Jetzt — Erfahrungen und Ergebnisse, ohne genaue Zeit.", mnemonic: "Vergangenheit mit Brücke zur Gegenwart: have + done.", signals: ["jemals", "nie", "schon", "noch (nicht)"], examples: ["Ich war schon zweimal in Japan.", "Sie hat ihre Hausaufgaben gerade fertig."], use: ["Lebenserfahrungen (ohne genaue Zeit)", "Kürzliche Handlungen mit Ergebnis jetzt"], avoid: ["Nicht mit abgeschlossenem Zeitwort wie ‚yesterday‘ — dann Simple Past."], compare_rows: [["Bezug zu jetzt, keine genaue Zeit", "abgeschlossen, feste Zeit"]], compare_note: "I have seen it (Perfect) vs. I saw it yesterday (Simple Past)." },
          es: { explain_n: "have/has + participio conecta el pasado con el ahora — experiencias y resultados, sin hora exacta.", mnemonic: "Pasado con un puente al presente: have + done.", signals: ["alguna vez", "nunca", "ya", "todavía"], examples: ["He estado en Japón dos veces.", "Acaba de terminar los deberes."], use: ["Experiencias de la vida (sin hora exacta)", "Acciones recientes con resultado ahora"], avoid: ["No con un tiempo pasado cerrado como ‘yesterday’ — usa el simple past."], compare_rows: [["conexión con el ahora, sin hora", "terminado, tiempo concreto"]], compare_note: "I have seen it (perfect) vs. I saw it yesterday (simple past)." },
          nl: { explain_n: "have/has + voltooid deelwoord verbindt het verleden met nu — ervaringen en resultaten, zonder exacte tijd.", mnemonic: "Verleden met een brug naar het heden: have + done.", signals: ["ooit", "nooit", "al", "nog (niet)"], examples: ["Ik ben twee keer in Japan geweest.", "Ze heeft haar huiswerk net af."], use: ["Levenservaringen (zonder exacte tijd)", "Recente handelingen met een resultaat nu"], avoid: ["Niet met een afgesloten tijd zoals ‘yesterday’ — gebruik simple past."], compare_rows: [["verband met nu, geen tijd", "afgerond, vaste tijd"]], compare_note: "I have seen it (perfect) vs. I saw it yesterday (simple past)." },
          fr: { explain_n: "have/has + participe relie le passé au présent — expériences et résultats, sans moment précis.", mnemonic: "Un passé avec un pont vers le présent : have + done.", signals: ["déjà (ever)", "jamais", "déjà", "encore / pas encore"], examples: ["Je suis allé au Japon deux fois.", "Elle vient de finir ses devoirs."], use: ["Expériences de vie (sans moment précis)", "Actions récentes avec un résultat maintenant"], avoid: ["Pas avec un marqueur de passé fini comme ‘yesterday’ — utilise le simple past."], compare_rows: [["lien avec maintenant, sans heure", "terminé, moment précis"]], compare_note: "I have seen it (perfect) vs. I saw it yesterday (simple past)." }
        }
      },
      future: {
        name: "Future (will)",
        explain_t: "Use **will + base verb** for predictions, spontaneous decisions and promises. For fixed plans, English often prefers 'going to'.",
        signals: [{ w: "tomorrow" }, { w: "soon" }, { w: "next year" }, { w: "I think" }],
        examples: [{ s: "I **will call** you tomorrow." }, { s: "It **will rain** later." }],
        compare: { with: "Present (going to)" },
        n: {
          en: { explain_n: "will + base verb: predictions, on-the-spot decisions and promises.", mnemonic: "Decide on the spot? 'I'll do it!' = will.", signals: ["tomorrow", "soon", "next year", "I think"], examples: ["I will call you tomorrow.", "It will rain later."], use: ["Predictions about the future", "Spontaneous decisions and promises"], avoid: ["For arranged plans, 'going to' often sounds more natural."], compare_rows: [["spontaneous / prediction", "already planned"]], compare_note: "I'll help (decided now) vs. I'm going to help (planned)." },
          de: { explain_n: "will + Grundform: Vorhersagen, spontane Entscheidungen und Versprechen.", mnemonic: "Spontan entschieden? ‚I'll do it!‘ = will.", signals: ["morgen", "bald", "nächstes Jahr", "ich glaube"], examples: ["Ich rufe dich morgen an.", "Es wird später regnen."], use: ["Vorhersagen über die Zukunft", "Spontane Entscheidungen und Versprechen"], avoid: ["Für feste Pläne klingt ‚going to‘ oft natürlicher."], compare_rows: [["spontan / Vorhersage", "schon geplant"]], compare_note: "I'll help (jetzt entschieden) vs. I'm going to help (geplant)." },
          es: { explain_n: "will + verbo base: predicciones, decisiones espontáneas y promesas.", mnemonic: "¿Decisión en el momento? ‘I'll do it!’ = will.", signals: ["mañana", "pronto", "el año que viene", "creo que"], examples: ["Te llamaré mañana.", "Lloverá más tarde."], use: ["Predicciones sobre el futuro", "Decisiones espontáneas y promesas"], avoid: ["Para planes fijos, ‘going to’ suele sonar más natural."], compare_rows: [["espontáneo / predicción", "ya planeado"]], compare_note: "I'll help (decidido ahora) vs. I'm going to help (planeado)." },
          nl: { explain_n: "will + basisvorm: voorspellingen, spontane beslissingen en beloftes.", mnemonic: "Nu beslist? ‘I'll do it!’ = will.", signals: ["morgen", "binnenkort", "volgend jaar", "ik denk"], examples: ["Ik bel je morgen.", "Het gaat later regenen."], use: ["Voorspellingen over de toekomst", "Spontane beslissingen en beloftes"], avoid: ["Voor vaste plannen klinkt ‘going to’ vaak natuurlijker."], compare_rows: [["spontaan / voorspelling", "al gepland"]], compare_note: "I'll help (nu beslist) vs. I'm going to help (gepland)." },
          fr: { explain_n: "will + verbe de base : prédictions, décisions spontanées et promesses.", mnemonic: "Décidé sur le moment ? ‘I'll do it!’ = will.", signals: ["demain", "bientôt", "l'année prochaine", "je pense"], examples: ["Je t'appellerai demain.", "Il pleuvra plus tard."], use: ["Prédictions sur l'avenir", "Décisions spontanées et promesses"], avoid: ["Pour les projets prévus, ‘going to’ sonne souvent plus naturel."], compare_rows: [["spontané / prédiction", "déjà prévu"]], compare_note: "I'll help (décidé maintenant) vs. I'm going to help (prévu)." }
        }
      }
    },
    es: {
      present: {
        name: "Presente",
        explain_t: "El presente sirve para hábitos, rutinas, hechos y verdades generales. Las terminaciones cambian según -ar / -er / -ir: **hablo, como, vivo**.",
        signals: [{ w: "hoy" }, { w: "siempre" }, { w: "normalmente" }, { w: "todos los días" }],
        examples: [{ s: "Yo **hablo** español en casa." }, { s: "Ella **vive** en Madrid." }],
        compare: { with: "Presente continuo" },
        n: {
          es: { explain_n: "Para hábitos, rutinas y verdades generales. Fíjate en las terminaciones -ar/-er/-ir.", mnemonic: "Tres familias: -ar, -er, -ir — cada una con su melodía.", signals: ["hoy", "siempre", "normalmente", "todos los días"], examples: ["Yo hablo español en casa.", "Ella vive en Madrid."], use: ["Hábitos y rutinas", "Hechos y verdades generales"], avoid: ["No para algo en curso ahora mismo (eso es 'estoy hablando')."], compare_rows: [["en general", "justo en este momento"]], compare_note: "hablo (general) vs. estoy hablando (ahora mismo)." },
          de: { explain_n: "Für Gewohnheiten, Routinen und allgemein Gültiges. Achte auf die Endungen -ar/-er/-ir.", mnemonic: "Drei Familien: -ar, -er, -ir — jede mit eigener Melodie.", signals: ["heute", "immer", "normalerweise", "jeden Tag"], examples: ["Ich spreche zu Hause Spanisch.", "Sie wohnt in Madrid."], use: ["Gewohnheiten und Routinen", "Tatsachen und Allgemeingültiges"], avoid: ["Nicht für etwas, das gerade läuft (das ist ‚estoy hablando‘)."], compare_rows: [["allgemein", "genau im Moment"]], compare_note: "hablo (allgemein) vs. estoy hablando (gerade jetzt)." },
          en: { explain_n: "For habits, routines and general truths. Watch the -ar/-er/-ir endings.", mnemonic: "Three families: -ar, -er, -ir — each with its own tune.", signals: ["today", "always", "usually", "every day"], examples: ["I speak Spanish at home.", "She lives in Madrid."], use: ["Habits and routines", "Facts and general truths"], avoid: ["Not for something in progress right now (that's 'estoy hablando')."], compare_rows: [["in general", "right at this moment"]], compare_note: "hablo (general) vs. estoy hablando (right now)." },
          nl: { explain_n: "Voor gewoontes, routines en algemene waarheden. Let op de uitgangen -ar/-er/-ir.", mnemonic: "Drie families: -ar, -er, -ir — elk met eigen melodie.", signals: ["vandaag", "altijd", "meestal", "elke dag"], examples: ["Ik spreek thuis Spaans.", "Zij woont in Madrid."], use: ["Gewoontes en routines", "Feiten en algemene waarheden"], avoid: ["Niet voor iets dat nu bezig is (dat is ‘estoy hablando’)."], compare_rows: [["in het algemeen", "precies nu"]], compare_note: "hablo (algemeen) vs. estoy hablando (nu)." },
          fr: { explain_n: "Pour les habitudes, les routines et les vérités générales. Observe les terminaisons -ar/-er/-ir.", mnemonic: "Trois familles : -ar, -er, -ir — chacune sa mélodie.", signals: ["aujourd'hui", "toujours", "normalement", "tous les jours"], examples: ["Je parle espagnol à la maison.", "Elle habite à Madrid."], use: ["Habitudes et routines", "Faits et vérités générales"], avoid: ["Pas pour une action en cours (c'est ‘estoy hablando’)."], compare_rows: [["en général", "juste en ce moment"]], compare_note: "hablo (général) vs. estoy hablando (maintenant)." }
        }
      },
      imperfect: {
        name: "Pretérito imperfecto",
        explain_t: "El imperfecto describe el pasado sin un final claro: cómo eran las cosas, acciones repetidas o de fondo. Terminaciones suaves: **-aba / -ía**.",
        signals: [{ w: "antes" }, { w: "siempre" }, { w: "todos los días" }, { w: "mientras" }],
        examples: [{ s: "De niño **jugaba** en el parque." }, { s: "**Llovía** cuando salí." }],
        compare: { with: "Pretérito (indefinido)" },
        n: {
          es: { explain_n: "El telón de fondo del pasado: cómo era, costumbres y acciones en curso.", mnemonic: "Imperfecto = la película de fondo; indefinido = el ‘clic’ de la foto.", signals: ["antes", "siempre", "todos los días", "mientras"], examples: ["De niño jugaba en el parque.", "Llovía cuando salí."], use: ["Descripciones y situaciones en el pasado", "Acciones habituales o repetidas"], avoid: ["No para una acción puntual y terminada (eso es el indefinido)."], compare_rows: [["de fondo, sin final claro", "puntual y terminado"]], compare_note: "Llovía (de fondo) vs. llovió ayer (hecho terminado)." },
          de: { explain_n: "Der Hintergrund der Vergangenheit: wie es war, Gewohnheiten und laufende Handlungen.", mnemonic: "Imperfecto = der Hintergrundfilm; Indefinido = der ‚Klick‘ des Fotos.", signals: ["früher", "immer", "jeden Tag", "während"], examples: ["Als Kind spielte ich im Park.", "Es regnete, als ich rausging."], use: ["Beschreibungen und Situationen in der Vergangenheit", "Gewohnheiten oder wiederholte Handlungen"], avoid: ["Nicht für eine einmalige, abgeschlossene Handlung (das ist das Indefinido)."], compare_rows: [["Hintergrund, kein klares Ende", "einmalig und abgeschlossen"]], compare_note: "Llovía (Hintergrund) vs. llovió ayer (abgeschlossene Tatsache)." },
          en: { explain_n: "The backdrop of the past: how things were, habits and ongoing actions.", mnemonic: "Imperfecto = the background movie; indefinido = the camera 'click'.", signals: ["before", "always", "every day", "while"], examples: ["As a child I used to play in the park.", "It was raining when I left."], use: ["Descriptions and past situations", "Habitual or repeated actions"], avoid: ["Not for a single, completed action (that's the indefinido)."], compare_rows: [["backdrop, no clear end", "single, completed"]], compare_note: "Llovía (background) vs. llovió ayer (completed fact)." },
          nl: { explain_n: "De achtergrond van het verleden: hoe het was, gewoontes en lopende handelingen.", mnemonic: "Imperfecto = de achtergrondfilm; indefinido = de ‘klik’ van de foto.", signals: ["vroeger", "altijd", "elke dag", "terwijl"], examples: ["Als kind speelde ik in het park.", "Het regende toen ik vertrok."], use: ["Beschrijvingen en situaties in het verleden", "Gewoontes of herhaalde handelingen"], avoid: ["Niet voor één afgeronde handeling (dat is het indefinido)."], compare_rows: [["achtergrond, geen duidelijk einde", "eenmalig en afgerond"]], compare_note: "Llovía (achtergrond) vs. llovió ayer (afgerond feit)." },
          fr: { explain_n: "La toile de fond du passé : comment c'était, les habitudes et les actions en cours.", mnemonic: "Imperfecto = le film de fond ; indefinido = le ‘clic’ de la photo.", signals: ["avant", "toujours", "tous les jours", "pendant que"], examples: ["Enfant, je jouais dans le parc.", "Il pleuvait quand je suis sorti."], use: ["Descriptions et situations au passé", "Actions habituelles ou répétées"], avoid: ["Pas pour une action unique et terminée (c'est l'indefinido)."], compare_rows: [["toile de fond, sans fin nette", "unique et terminé"]], compare_note: "Llovía (fond) vs. llovió ayer (fait terminé)." }
        }
      },
      past: {
        name: "Pretérito (indefinido)",
        explain_t: "El indefinido cuenta acciones puntuales y terminadas en el pasado, con un momento concreto. Es el tiempo de la narración: **hablé, comí, viví**.",
        signals: [{ w: "ayer" }, { w: "anoche" }, { w: "el año pasado" }, { w: "de repente" }],
        examples: [{ s: "Ayer **comí** paella." }, { s: "**Viajamos** a México en 2019." }],
        compare: { with: "Pretérito imperfecto" },
        n: {
          es: { explain_n: "Acciones puntuales y terminadas con un momento claro. El tiempo de contar historias.", mnemonic: "Indefinido = el ‘clic’ de la foto: un momento concreto, terminado.", signals: ["ayer", "anoche", "el año pasado", "de repente"], examples: ["Ayer comí paella.", "Viajamos a México en 2019."], use: ["Acciones terminadas con momento concreto", "Hechos que hacen avanzar la historia"], avoid: ["No para descripciones o costumbres (eso es el imperfecto)."], compare_rows: [["puntual y terminado", "de fondo, sin final claro"]], compare_note: "comí ayer (terminado) vs. comía siempre (costumbre)." },
          de: { explain_n: "Einmalige, abgeschlossene Handlungen mit klarem Zeitpunkt. Die Erzählzeit.", mnemonic: "Indefinido = der ‚Klick‘ des Fotos: ein konkreter, abgeschlossener Moment.", signals: ["gestern", "gestern Abend", "letztes Jahr", "plötzlich"], examples: ["Gestern habe ich Paella gegessen.", "2019 sind wir nach Mexiko gereist."], use: ["Abgeschlossene Handlungen mit klarem Zeitpunkt", "Ereignisse, die die Geschichte vorantreiben"], avoid: ["Nicht für Beschreibungen oder Gewohnheiten (das ist das Imperfecto)."], compare_rows: [["einmalig und abgeschlossen", "Hintergrund, kein klares Ende"]], compare_note: "comí ayer (abgeschlossen) vs. comía siempre (Gewohnheit)." },
          en: { explain_n: "Single, completed actions at a clear time. The storytelling tense.", mnemonic: "Indefinido = the camera 'click': one concrete, finished moment.", signals: ["yesterday", "last night", "last year", "suddenly"], examples: ["Yesterday I ate paella.", "We travelled to Mexico in 2019."], use: ["Completed actions at a clear time", "Events that move the story forward"], avoid: ["Not for descriptions or habits (that's the imperfecto)."], compare_rows: [["single, completed", "backdrop, no clear end"]], compare_note: "comí ayer (completed) vs. comía siempre (habit)." },
          nl: { explain_n: "Eenmalige, afgeronde handelingen op een duidelijk moment. De verteltijd.", mnemonic: "Indefinido = de ‘klik’ van de foto: één concreet, afgerond moment.", signals: ["gisteren", "gisteravond", "vorig jaar", "plotseling"], examples: ["Gisteren at ik paella.", "We reisden in 2019 naar Mexico."], use: ["Afgeronde handelingen op een duidelijk moment", "Gebeurtenissen die het verhaal voortstuwen"], avoid: ["Niet voor beschrijvingen of gewoontes (dat is het imperfecto)."], compare_rows: [["eenmalig en afgerond", "achtergrond, geen duidelijk einde"]], compare_note: "comí ayer (afgerond) vs. comía siempre (gewoonte)." },
          fr: { explain_n: "Actions uniques et terminées à un moment précis. Le temps du récit.", mnemonic: "Indefinido = le ‘clic’ de la photo : un moment concret, terminé.", signals: ["hier", "hier soir", "l'an dernier", "soudain"], examples: ["Hier, j'ai mangé une paella.", "Nous avons voyagé au Mexique en 2019."], use: ["Actions terminées à un moment précis", "Événements qui font avancer le récit"], avoid: ["Pas pour les descriptions ou les habitudes (c'est l'imperfecto)."], compare_rows: [["unique et terminé", "toile de fond, sans fin nette"]], compare_note: "comí ayer (terminé) vs. comía siempre (habitude)." }
        }
      },
      perfect: {
        name: "Pretérito perfecto",
        explain_t: "El pretérito perfecto une el pasado con el presente: **haber (he, has, ha...) + participio**. Para acciones recientes o dentro de un periodo aún abierto (hoy, esta semana).",
        signals: [{ w: "hoy" }, { w: "esta semana" }, { w: "ya" }, { w: "alguna vez" }],
        examples: [{ s: "Hoy **he comido** muy bien." }, { s: "**Hemos visto** esa película." }],
        compare: { with: "Pretérito (indefinido)" },
        n: {
          es: { explain_n: "Une pasado y presente: haber + participio. Para lo reciente o un periodo aún abierto.", mnemonic: "he + -ado/-ido: el pasado que todavía ‘toca’ el hoy.", signals: ["hoy", "esta semana", "ya", "alguna vez"], examples: ["Hoy he comido muy bien.", "Hemos visto esa película."], use: ["Acciones recientes con efecto ahora", "Periodo de tiempo aún no terminado (hoy, este año)"], avoid: ["No con un tiempo cerrado como ‘ayer’ (eso es el indefinido)."], compare_rows: [["periodo abierto / reciente", "momento cerrado en el pasado"]], compare_note: "he comido hoy (perfecto) vs. comí ayer (indefinido)." },
          de: { explain_n: "Verbindet Vergangenheit und Gegenwart: haber + Partizip. Für Kürzliches oder einen noch offenen Zeitraum.", mnemonic: "he + -ado/-ido: die Vergangenheit, die das Heute noch ‚berührt‘.", signals: ["heute", "diese Woche", "schon", "jemals"], examples: ["Heute habe ich sehr gut gegessen.", "Wir haben diesen Film gesehen."], use: ["Kürzliche Handlungen mit Wirkung jetzt", "Noch nicht beendeter Zeitraum (heute, dieses Jahr)"], avoid: ["Nicht mit abgeschlossenem Zeitwort wie ‚ayer‘ (das ist das Indefinido)."], compare_rows: [["offener Zeitraum / kürzlich", "abgeschlossener Moment"]], compare_note: "he comido hoy (Perfecto) vs. comí ayer (Indefinido)." },
          en: { explain_n: "Links past and present: haber + participle. For the recent past or a period that's still open.", mnemonic: "he + -ado/-ido: the past that still 'touches' today.", signals: ["today", "this week", "already", "ever"], examples: ["I've eaten really well today.", "We have seen that film."], use: ["Recent actions with an effect now", "A time period not yet over (today, this year)"], avoid: ["Not with a closed time like 'ayer' (that's the indefinido)."], compare_rows: [["open period / recent", "closed moment in the past"]], compare_note: "he comido hoy (perfecto) vs. comí ayer (indefinido)." },
          nl: { explain_n: "Verbindt verleden en heden: haber + deelwoord. Voor het recente of een nog open periode.", mnemonic: "he + -ado/-ido: het verleden dat het heden nog ‘raakt’.", signals: ["vandaag", "deze week", "al", "ooit"], examples: ["Vandaag heb ik heel goed gegeten.", "We hebben die film gezien."], use: ["Recente handelingen met effect nu", "Periode die nog niet voorbij is (vandaag, dit jaar)"], avoid: ["Niet met een afgesloten tijd zoals ‘ayer’ (dat is het indefinido)."], compare_rows: [["open periode / recent", "afgesloten moment in verleden"]], compare_note: "he comido hoy (perfecto) vs. comí ayer (indefinido)." },
          fr: { explain_n: "Relie passé et présent : haber + participe. Pour le récent ou une période encore ouverte.", mnemonic: "he + -ado/-ido : le passé qui ‘touche’ encore aujourd'hui.", signals: ["aujourd'hui", "cette semaine", "déjà", "jamais (ever)"], examples: ["Aujourd'hui, j'ai très bien mangé.", "Nous avons vu ce film."], use: ["Actions récentes avec effet maintenant", "Période pas encore terminée (aujourd'hui, cette année)"], avoid: ["Pas avec un temps fermé comme ‘ayer’ (c'est l'indefinido)."], compare_rows: [["période ouverte / récent", "moment fermé au passé"]], compare_note: "he comido hoy (perfecto) vs. comí ayer (indefinido)." }
        }
      },
      future: {
        name: "Futuro",
        explain_t: "El futuro simple expresa predicciones, planes y promesas. Se forma sobre el **infinitivo + terminación** (-é, -ás, -á...): hablaré, comeré, viviré.",
        signals: [{ w: "mañana" }, { w: "pronto" }, { w: "el año que viene" }, { w: "luego" }],
        examples: [{ s: "Mañana **hablaré** con el jefe." }, { s: "**Lloverá** por la tarde." }],
        compare: { with: "Presente (ir a + infinitivo)" },
        n: {
          es: { explain_n: "Predicciones, planes y promesas. Se construye sobre el infinitivo + terminación.", mnemonic: "Infinitivo entero + -é/-ás/-á: hablar → hablaré.", signals: ["mañana", "pronto", "el año que viene", "luego"], examples: ["Mañana hablaré con el jefe.", "Lloverá por la tarde."], use: ["Predicciones sobre el futuro", "Planes y promesas"], avoid: ["En el habla cotidiana, ‘voy a hablar’ suele sonar más natural."], compare_rows: [["futuro / predicción", "plan inmediato (ir a)"]], compare_note: "hablaré (futuro) vs. voy a hablar (plan cercano)." },
          de: { explain_n: "Vorhersagen, Pläne und Versprechen. Gebildet aus Infinitiv + Endung.", mnemonic: "Ganzer Infinitiv + -é/-ás/-á: hablar → hablaré.", signals: ["morgen", "bald", "nächstes Jahr", "später"], examples: ["Morgen spreche ich mit dem Chef.", "Am Nachmittag wird es regnen."], use: ["Vorhersagen über die Zukunft", "Pläne und Versprechen"], avoid: ["Im Alltag klingt ‚voy a hablar‘ oft natürlicher."], compare_rows: [["Zukunft / Vorhersage", "unmittelbarer Plan (ir a)"]], compare_note: "hablaré (Futur) vs. voy a hablar (naher Plan)." },
          en: { explain_n: "Predictions, plans and promises. Built on the infinitive + ending.", mnemonic: "Whole infinitive + -é/-ás/-á: hablar → hablaré.", signals: ["tomorrow", "soon", "next year", "later"], examples: ["Tomorrow I'll speak with the boss.", "It will rain in the afternoon."], use: ["Predictions about the future", "Plans and promises"], avoid: ["In everyday speech, 'voy a hablar' often sounds more natural."], compare_rows: [["future / prediction", "immediate plan (ir a)"]], compare_note: "hablaré (future) vs. voy a hablar (near plan)." },
          nl: { explain_n: "Voorspellingen, plannen en beloftes. Gevormd op de infinitief + uitgang.", mnemonic: "Hele infinitief + -é/-ás/-á: hablar → hablaré.", signals: ["morgen", "binnenkort", "volgend jaar", "later"], examples: ["Morgen spreek ik met de baas.", "Het zal 's middags regenen."], use: ["Voorspellingen over de toekomst", "Plannen en beloftes"], avoid: ["In spreektaal klinkt ‘voy a hablar’ vaak natuurlijker."], compare_rows: [["toekomst / voorspelling", "direct plan (ir a)"]], compare_note: "hablaré (toekomst) vs. voy a hablar (nabij plan)." },
          fr: { explain_n: "Prédictions, projets et promesses. Formé sur l'infinitif + terminaison.", mnemonic: "Infinitif entier + -é/-ás/-á : hablar → hablaré.", signals: ["demain", "bientôt", "l'année prochaine", "plus tard"], examples: ["Demain, je parlerai au chef.", "Il pleuvra l'après-midi."], use: ["Prédictions sur l'avenir", "Projets et promesses"], avoid: ["À l'oral, ‘voy a hablar’ sonne souvent plus naturel."], compare_rows: [["futur / prédiction", "projet immédiat (ir a)"]], compare_note: "hablaré (futur) vs. voy a hablar (projet proche)." }
        }
      },
      subjunctive: {
        name: "Subjuntivo (presente)",
        explain_t: "El subjuntivo no describe hechos, sino deseos, dudas, emociones y peticiones. Suele aparecer tras **que**: espero que **vengas**.",
        signals: [{ w: "espero que" }, { w: "ojalá" }, { w: "para que" }, { w: "es importante que" }],
        examples: [{ s: "Espero que **tengas** un buen día." }, { s: "Quiero que me **llames**." }],
        compare: { with: "Presente (indicativo)" },
        n: {
          es: { explain_n: "El mundo de lo no-real: deseos, dudas, emociones y peticiones, casi siempre tras ‘que’.", mnemonic: "WEIRDO: Wish, Emotion, Impersonal, Request, Doubt, Ojalá → subjuntivo.", signals: ["espero que", "ojalá", "para que", "es importante que"], examples: ["Espero que tengas un buen día.", "Quiero que me llames."], use: ["Deseos y peticiones (quiero que, espero que)", "Duda, emoción y expresiones impersonales"], avoid: ["No para hechos seguros (eso es el indicativo)."], compare_rows: [["deseo / duda / subjetivo", "hecho seguro y real"]], compare_note: "Creo que viene (hecho) vs. Espero que venga (deseo)." },
          de: { explain_n: "Die Welt des Nicht-Realen: Wünsche, Zweifel, Gefühle und Bitten, fast immer nach ‚que‘.", mnemonic: "WEIRDO: Wunsch, Emotion, Unpersönlich, Bitte, Zweifel, Ojalá → Subjuntivo.", signals: ["ich hoffe, dass", "hoffentlich", "damit", "es ist wichtig, dass"], examples: ["Ich hoffe, dass du einen schönen Tag hast.", "Ich möchte, dass du mich anrufst."], use: ["Wünsche und Bitten (quiero que, espero que)", "Zweifel, Gefühl und unpersönliche Ausdrücke"], avoid: ["Nicht für sichere Tatsachen (das ist der Indikativ)."], compare_rows: [["Wunsch / Zweifel / subjektiv", "sichere, reale Tatsache"]], compare_note: "Creo que viene (Tatsache) vs. Espero que venga (Wunsch)." },
          en: { explain_n: "The world of the non-real: wishes, doubts, emotions and requests, almost always after 'que'.", mnemonic: "WEIRDO: Wish, Emotion, Impersonal, Request, Doubt, Ojalá → subjunctive.", signals: ["I hope that", "if only / hopefully", "so that", "it's important that"], examples: ["I hope you have a good day.", "I want you to call me."], use: ["Wishes and requests (quiero que, espero que)", "Doubt, emotion and impersonal expressions"], avoid: ["Not for certain facts (that's the indicative)."], compare_rows: [["wish / doubt / subjective", "certain, real fact"]], compare_note: "Creo que viene (fact) vs. Espero que venga (wish)." },
          nl: { explain_n: "De wereld van het niet-reële: wensen, twijfels, emoties en verzoeken, bijna altijd na ‘que’.", mnemonic: "WEIRDO: Wens, Emotie, Onpersoonlijk, Verzoek, Twijfel, Ojalá → subjuntivo.", signals: ["ik hoop dat", "hopelijk", "zodat", "het is belangrijk dat"], examples: ["Ik hoop dat je een fijne dag hebt.", "Ik wil dat je me belt."], use: ["Wensen en verzoeken (quiero que, espero que)", "Twijfel, emotie en onpersoonlijke uitdrukkingen"], avoid: ["Niet voor zekere feiten (dat is de indicatief)."], compare_rows: [["wens / twijfel / subjectief", "zeker, reëel feit"]], compare_note: "Creo que viene (feit) vs. Espero que venga (wens)." },
          fr: { explain_n: "Le monde du non-réel : souhaits, doutes, émotions et demandes, presque toujours après ‘que’.", mnemonic: "WEIRDO : Wish, Emotion, Impersonnel, Requête, Doute, Ojalá → subjonctif.", signals: ["j'espère que", "si seulement", "pour que", "il est important que"], examples: ["J'espère que tu passes une bonne journée.", "Je veux que tu m'appelles."], use: ["Souhaits et demandes (quiero que, espero que)", "Doute, émotion et expressions impersonnelles"], avoid: ["Pas pour des faits certains (c'est l'indicatif)."], compare_rows: [["souhait / doute / subjectif", "fait certain et réel"]], compare_note: "Creo que viene (fait) vs. Espero que venga (souhait)." }
        }
      }
    },
    de: {
      present: {
        name: "Präsens",
        explain_t: "Das Präsens nutzt du für die Gegenwart, Gewohnheiten und allgemein Gültiges — und im Deutschen oft auch für die nahe Zukunft. Endungen: **-e, -st, -t**.",
        signals: [{ w: "heute" }, { w: "immer" }, { w: "jeden Tag" }, { w: "gerade" }],
        examples: [{ s: "Ich **arbeite** im Büro." }, { s: "Morgen **fahre** ich nach Berlin." }],
        compare: { with: "Futur I" },
        n: {
          de: { explain_n: "Für Gegenwart, Gewohnheiten und Allgemeines — oft auch für Geplantes in naher Zukunft.", mnemonic: "ich -e, du -st, er/sie/es -t: die Treppe der Endungen.", signals: ["heute", "immer", "jeden Tag", "gerade"], examples: ["Ich arbeite im Büro.", "Morgen fahre ich nach Berlin."], use: ["Gegenwart und Gewohnheiten", "Geplante nahe Zukunft (mit Zeitangabe)"], avoid: ["Bei Sätzen über Vergangenes brauchst du Perfekt oder Präteritum."], compare_rows: [["jetzt / geplant nah", "ausdrücklich in der Zukunft (werden)"]], compare_note: "Morgen fahre ich (Präsens, geplant) vs. Ich werde fahren (Futur, betont)." },
          en: { explain_n: "For the present, habits and general truths — and often the near future too. Endings: -e, -st, -t.", mnemonic: "ich -e, du -st, er/sie/es -t: the staircase of endings.", signals: ["today", "always", "every day", "right now"], examples: ["I work in the office.", "Tomorrow I'm going to Berlin."], use: ["The present and habits", "Planned near future (with a time word)"], avoid: ["For past events you need the Perfekt or Präteritum."], compare_rows: [["now / planned soon", "explicitly future (werden)"]], compare_note: "Morgen fahre ich (present, planned) vs. Ich werde fahren (future, emphatic)." },
          es: { explain_n: "Para el presente, los hábitos y lo general — y a menudo también el futuro cercano. Terminaciones: -e, -st, -t.", mnemonic: "ich -e, du -st, er/sie/es -t: la escalera de terminaciones.", signals: ["hoy", "siempre", "cada día", "ahora mismo"], examples: ["Trabajo en la oficina.", "Mañana voy a Berlín."], use: ["El presente y los hábitos", "Futuro cercano planeado (con marcador de tiempo)"], avoid: ["Para hechos pasados necesitas el Perfekt o el Präteritum."], compare_rows: [["ahora / planeado cercano", "futuro explícito (werden)"]], compare_note: "Morgen fahre ich (presente, planeado) vs. Ich werde fahren (futuro, enfático)." },
          nl: { explain_n: "Voor het heden, gewoontes en algemene zaken — en vaak ook de nabije toekomst. Uitgangen: -e, -st, -t.", mnemonic: "ich -e, du -st, er/sie/es -t: de trap van uitgangen.", signals: ["vandaag", "altijd", "elke dag", "nu"], examples: ["Ik werk op kantoor.", "Morgen ga ik naar Berlijn."], use: ["Het heden en gewoontes", "Geplande nabije toekomst (met tijdwoord)"], avoid: ["Voor verleden heb je het Perfekt of Präteritum nodig."], compare_rows: [["nu / gepland dichtbij", "expliciet toekomst (werden)"]], compare_note: "Morgen fahre ich (heden, gepland) vs. Ich werde fahren (toekomst, nadruk)." },
          fr: { explain_n: "Pour le présent, les habitudes et le général — et souvent le futur proche aussi. Terminaisons : -e, -st, -t.", mnemonic: "ich -e, du -st, er/sie/es -t : l'escalier des terminaisons.", signals: ["aujourd'hui", "toujours", "chaque jour", "là, maintenant"], examples: ["Je travaille au bureau.", "Demain je vais à Berlin."], use: ["Le présent et les habitudes", "Futur proche prévu (avec un mot de temps)"], avoid: ["Pour le passé, il faut le Perfekt ou le Präteritum."], compare_rows: [["maintenant / prévu proche", "futur explicite (werden)"]], compare_note: "Morgen fahre ich (présent, prévu) vs. Ich werde fahren (futur, insistant)." }
        }
      },
      past: {
        name: "Präteritum",
        explain_t: "Das Präteritum ist die geschriebene Erzählvergangenheit (Bücher, Berichte) und wird bei **sein, haben** und Modalverben auch gesprochen: ich **war**, ich **hatte**.",
        signals: [{ w: "damals" }, { w: "gestern" }, { w: "als" }, { w: "früher" }],
        examples: [{ s: "Gestern **war** ich krank." }, { s: "Sie **machte** die Tür zu." }],
        compare: { with: "Perfekt" },
        n: {
          de: { explain_n: "Die Erzählvergangenheit der Schrift; gesprochen vor allem bei sein, haben und Modalverben.", mnemonic: "Geschichten & ‚war/hatte/konnte‘ → Präteritum.", signals: ["damals", "gestern", "als", "früher"], examples: ["Gestern war ich krank.", "Sie machte die Tür zu."], use: ["Geschriebene Erzählungen und Berichte", "sein, haben und Modalverben — auch gesprochen"], avoid: ["Im Gespräch klingt bei den meisten Verben das Perfekt natürlicher."], compare_rows: [["geschrieben / war, hatte", "gesprochener Alltag"]], compare_note: "Ich war da (Präteritum) vs. Ich bin da gewesen (Perfekt)." },
          en: { explain_n: "The written narrative past; spoken mainly with sein, haben and modal verbs.", mnemonic: "Stories & 'war/hatte/konnte' → Präteritum.", signals: ["back then", "yesterday", "when", "in the past"], examples: ["Yesterday I was ill.", "She closed the door."], use: ["Written stories and reports", "sein, haben and modal verbs — even when spoken"], avoid: ["In conversation, the Perfekt sounds more natural for most verbs."], compare_rows: [["written / war, hatte", "everyday spoken German"]], compare_note: "Ich war da (Präteritum) vs. Ich bin da gewesen (Perfekt)." },
          es: { explain_n: "El pasado narrativo escrito; hablado sobre todo con sein, haben y los verbos modales.", mnemonic: "Relatos y ‘war/hatte/konnte’ → Präteritum.", signals: ["entonces", "ayer", "cuando", "antes"], examples: ["Ayer estaba enfermo.", "Ella cerró la puerta."], use: ["Relatos e informes escritos", "sein, haben y modales — también al hablar"], avoid: ["Al hablar, el Perfekt suena más natural con la mayoría de verbos."], compare_rows: [["escrito / war, hatte", "alemán hablado cotidiano"]], compare_note: "Ich war da (Präteritum) vs. Ich bin da gewesen (Perfekt)." },
          nl: { explain_n: "Het geschreven verteltijd-verleden; gesproken vooral bij sein, haben en modale werkwoorden.", mnemonic: "Verhalen & ‘war/hatte/konnte’ → Präteritum.", signals: ["toen", "gisteren", "als/toen", "vroeger"], examples: ["Gisteren was ik ziek.", "Zij deed de deur dicht."], use: ["Geschreven verhalen en verslagen", "sein, haben en modale werkwoorden — ook gesproken"], avoid: ["In gesprek klinkt het Perfekt natuurlijker bij de meeste werkwoorden."], compare_rows: [["geschreven / war, hatte", "alledaags gesproken Duits"]], compare_note: "Ich war da (Präteritum) vs. Ich bin da gewesen (Perfekt)." },
          fr: { explain_n: "Le passé narratif écrit ; à l'oral surtout avec sein, haben et les modaux.", mnemonic: "Récits & ‘war/hatte/konnte’ → Präteritum.", signals: ["à l'époque", "hier", "quand/lorsque", "autrefois"], examples: ["Hier, j'étais malade.", "Elle a fermé la porte."], use: ["Récits et rapports écrits", "sein, haben et les modaux — même à l'oral"], avoid: ["À l'oral, le Perfekt est plus naturel pour la plupart des verbes."], compare_rows: [["écrit / war, hatte", "allemand parlé du quotidien"]], compare_note: "Ich war da (Präteritum) vs. Ich bin da gewesen (Perfekt)." }
        }
      },
      perfect: {
        name: "Perfekt",
        explain_t: "Das Perfekt ist die gesprochene Vergangenheit: **haben/sein + Partizip II**. Wähle ‚sein‘ bei Bewegung und Zustandswechsel (gehen, kommen), sonst ‚haben‘.",
        signals: [{ w: "gestern" }, { w: "letzte Woche" }, { w: "schon" }, { w: "vorhin" }],
        examples: [{ s: "Ich **habe** Pizza **gegessen**." }, { s: "Wir **sind** nach Hause **gegangen**." }],
        compare: { with: "Präteritum" },
        n: {
          de: { explain_n: "Die gesprochene Vergangenheit: haben/sein + Partizip II. ‚sein‘ bei Bewegung/Zustandswechsel.", mnemonic: "Bewegung von A nach B? → sein. Sonst → haben.", signals: ["gestern", "letzte Woche", "schon", "vorhin"], examples: ["Ich habe Pizza gegessen.", "Wir sind nach Hause gegangen."], use: ["Vergangenes im Gespräch und in E-Mails", "Handlungen mit Ergebnis bis jetzt"], avoid: ["Verwechsle das Hilfsverb nicht: ‚Ich habe gegangen‘ ist falsch — ‚Ich bin gegangen‘."], compare_rows: [["gesprochener Alltag", "geschriebene Erzählung"]], compare_note: "Ich habe gegessen (Perfekt, gesprochen) vs. Ich aß (Präteritum, schriftlich)." },
          en: { explain_n: "The spoken past: haben/sein + past participle. Use 'sein' for movement and change of state.", mnemonic: "Movement from A to B? → sein. Otherwise → haben.", signals: ["yesterday", "last week", "already", "just now"], examples: ["I ate pizza. (Ich habe Pizza gegessen.)", "We went home. (Wir sind nach Hause gegangen.)"], use: ["Past events in speech and emails", "Actions with a result up to now"], avoid: ["Don't mix up the auxiliary: 'Ich habe gegangen' is wrong — 'Ich bin gegangen'."], compare_rows: [["everyday spoken", "written narrative"]], compare_note: "Ich habe gegessen (Perfekt, spoken) vs. Ich aß (Präteritum, written)." },
          es: { explain_n: "El pasado hablado: haben/sein + participio. Usa ‘sein’ con movimiento y cambio de estado.", mnemonic: "¿Movimiento de A a B? → sein. Si no → haben.", signals: ["ayer", "la semana pasada", "ya", "hace un rato"], examples: ["Comí pizza. (Ich habe Pizza gegessen.)", "Fuimos a casa. (Wir sind nach Hause gegangen.)"], use: ["Pasado al hablar y en correos", "Acciones con resultado hasta ahora"], avoid: ["No confundas el auxiliar: ‘Ich habe gegangen’ es incorrecto — ‘Ich bin gegangen’."], compare_rows: [["habla cotidiana", "relato escrito"]], compare_note: "Ich habe gegessen (Perfekt, hablado) vs. Ich aß (Präteritum, escrito)." },
          nl: { explain_n: "Het gesproken verleden: haben/sein + voltooid deelwoord. ‘sein’ bij beweging en toestandsverandering.", mnemonic: "Beweging van A naar B? → sein. Anders → haben.", signals: ["gisteren", "vorige week", "al", "net"], examples: ["Ik heb pizza gegeten. (Ich habe Pizza gegessen.)", "We zijn naar huis gegaan. (Wir sind nach Hause gegangen.)"], use: ["Verleden in gesprek en e-mails", "Handelingen met resultaat tot nu"], avoid: ["Verwar het hulpwerkwoord niet: ‘Ich habe gegangen’ is fout — ‘Ich bin gegangen’."], compare_rows: [["alledaags gesproken", "geschreven verhaal"]], compare_note: "Ich habe gegessen (Perfekt, gesproken) vs. Ich aß (Präteritum, geschreven)." },
          fr: { explain_n: "Le passé parlé : haben/sein + participe II. Emploie ‘sein’ pour le mouvement et le changement d'état.", mnemonic: "Mouvement de A à B ? → sein. Sinon → haben.", signals: ["hier", "la semaine dernière", "déjà", "tout à l'heure"], examples: ["J'ai mangé une pizza. (Ich habe Pizza gegessen.)", "Nous sommes rentrés. (Wir sind nach Hause gegangen.)"], use: ["Le passé à l'oral et dans les e-mails", "Actions avec un résultat jusqu'à maintenant"], avoid: ["Ne confonds pas l'auxiliaire : ‘Ich habe gegangen’ est faux — ‘Ich bin gegangen’."], compare_rows: [["oral du quotidien", "récit écrit"]], compare_note: "Ich habe gegessen (Perfekt, oral) vs. Ich aß (Präteritum, écrit)." }
        }
      },
      future: {
        name: "Futur I",
        explain_t: "Das Futur I bildest du mit **werden + Infinitiv**. Du nutzt es für betonte Zukunft, Vorhersagen und Vermutungen (oft mit ‚wohl‘).",
        signals: [{ w: "morgen" }, { w: "bald" }, { w: "nächstes Jahr" }, { w: "wohl" }],
        examples: [{ s: "Ich **werde** dich **anrufen**." }, { s: "Es **wird** wohl **regnen**." }],
        compare: { with: "Präsens" },
        n: {
          de: { explain_n: "werden + Infinitiv: für betonte Zukunft, Vorhersagen und Vermutungen.", mnemonic: "werden + Infinitiv hinten: ‚Ich werde … anrufen.‘", signals: ["morgen", "bald", "nächstes Jahr", "wohl"], examples: ["Ich werde dich anrufen.", "Es wird wohl regnen."], use: ["Betonte oder ferne Zukunft", "Vorhersagen und Vermutungen (wohl)"], avoid: ["Für klar geplante nahe Zukunft reicht oft das Präsens."], compare_rows: [["betonte Zukunft (werden)", "geplant nah (Präsens)"]], compare_note: "Ich werde fahren (Futur, betont) vs. Morgen fahre ich (Präsens, geplant)." },
          en: { explain_n: "werden + infinitive: for emphasised future, predictions and assumptions.", mnemonic: "werden + infinitive at the end: 'Ich werde … anrufen.'", signals: ["tomorrow", "soon", "next year", "probably (wohl)"], examples: ["I will call you.", "It will probably rain."], use: ["Emphasised or distant future", "Predictions and assumptions (wohl)"], avoid: ["For clearly planned near future, the present tense is often enough."], compare_rows: [["emphasised future (werden)", "planned soon (present)"]], compare_note: "Ich werde fahren (future, emphatic) vs. Morgen fahre ich (present, planned)." },
          es: { explain_n: "werden + infinitivo: para el futuro enfático, predicciones y suposiciones.", mnemonic: "werden + infinitivo al final: ‘Ich werde … anrufen.’", signals: ["mañana", "pronto", "el año que viene", "probablemente (wohl)"], examples: ["Te llamaré.", "Probablemente lloverá."], use: ["Futuro enfático o lejano", "Predicciones y suposiciones (wohl)"], avoid: ["Para un futuro cercano ya planeado, suele bastar el presente."], compare_rows: [["futuro enfático (werden)", "planeado cercano (presente)"]], compare_note: "Ich werde fahren (futuro, enfático) vs. Morgen fahre ich (presente, planeado)." },
          nl: { explain_n: "werden + infinitief: voor nadrukkelijke toekomst, voorspellingen en vermoedens.", mnemonic: "werden + infinitief achteraan: ‘Ich werde … anrufen.’", signals: ["morgen", "binnenkort", "volgend jaar", "wel/wohl"], examples: ["Ik zal je bellen.", "Het zal wel regenen."], use: ["Nadrukkelijke of verre toekomst", "Voorspellingen en vermoedens (wohl)"], avoid: ["Voor duidelijk geplande nabije toekomst volstaat vaak het Präsens."], compare_rows: [["nadrukkelijke toekomst (werden)", "gepland dichtbij (Präsens)"]], compare_note: "Ich werde fahren (toekomst, nadruk) vs. Morgen fahre ich (Präsens, gepland)." },
          fr: { explain_n: "werden + infinitif : pour le futur insistant, les prédictions et les suppositions.", mnemonic: "werden + infinitif à la fin : ‘Ich werde … anrufen.’", signals: ["demain", "bientôt", "l'année prochaine", "sans doute (wohl)"], examples: ["Je t'appellerai.", "Il va sans doute pleuvoir."], use: ["Futur insistant ou lointain", "Prédictions et suppositions (wohl)"], avoid: ["Pour un futur proche clairement prévu, le présent suffit souvent."], compare_rows: [["futur insistant (werden)", "prévu proche (présent)"]], compare_note: "Ich werde fahren (futur, insistant) vs. Morgen fahre ich (présent, prévu)." }
        }
      },
      subjunctive: {
        name: "Konjunktiv II",
        explain_t: "Der Konjunktiv II drückt Irreales, Höflichkeit und Wünsche aus. Im Alltag meist mit **würde + Infinitiv**; bei sein/haben/Modalverben die eigene Form: **wäre, hätte, könnte**.",
        signals: [{ w: "wenn" }, { w: "würde" }, { w: "hätte" }, { w: "an deiner Stelle" }],
        examples: [{ s: "Ich **würde** gern **kommen**." }, { s: "Wenn ich Zeit **hätte**, …" }],
        compare: { with: "Indikativ" },
        n: {
          de: { explain_n: "Für Irreales, höfliche Bitten und Wünsche. Meist ‚würde + Infinitiv‘, sonst wäre/hätte/könnte.", mnemonic: "Träum oder bitte höflich? → würde / wäre / hätte / könnte.", signals: ["wenn", "würde", "hätte", "an deiner Stelle"], examples: ["Ich würde gern kommen.", "Wenn ich Zeit hätte, …"], use: ["Irreale Bedingungen (wenn … wäre)", "Höfliche Bitten und Wünsche"], avoid: ["Nicht für echte, reale Tatsachen (das ist der Indikativ)."], compare_rows: [["irreal / höflich / Wunsch", "reale Tatsache"]], compare_note: "Ich habe Zeit (real) vs. Ich hätte Zeit (irreal/Wunsch)." },
          en: { explain_n: "For the unreal, polite requests and wishes. Usually 'würde + infinitive', else wäre/hätte/könnte.", mnemonic: "Dreaming or being polite? → würde / wäre / hätte / könnte.", signals: ["if (wenn)", "would (würde)", "had (hätte)", "in your place"], examples: ["I would love to come.", "If I had time, …"], use: ["Unreal conditions (wenn … wäre)", "Polite requests and wishes"], avoid: ["Not for real, true facts (that's the indicative)."], compare_rows: [["unreal / polite / wish", "real fact"]], compare_note: "Ich habe Zeit (real) vs. Ich hätte Zeit (unreal/wish)." },
          es: { explain_n: "Para lo irreal, las peticiones corteses y los deseos. Suele ser ‘würde + infinitivo’, si no wäre/hätte/könnte.", mnemonic: "¿Sueñas o pides con cortesía? → würde / wäre / hätte / könnte.", signals: ["si (wenn)", "haría / sería", "tuviera / tendría", "en tu lugar"], examples: ["Me encantaría ir.", "Si tuviera tiempo, …"], use: ["Condiciones irreales (wenn … wäre)", "Peticiones corteses y deseos"], avoid: ["No para hechos reales y verdaderos (eso es el indicativo)."], compare_rows: [["irreal / cortés / deseo", "hecho real"]], compare_note: "Ich habe Zeit (real) vs. Ich hätte Zeit (irreal/deseo)." },
          nl: { explain_n: "Voor het irreële, beleefde verzoeken en wensen. Meestal ‘würde + infinitief’, anders wäre/hätte/könnte.", mnemonic: "Droom je of vraag je beleefd? → würde / wäre / hätte / könnte.", signals: ["als (wenn)", "zou", "had / zou hebben", "in jouw plaats"], examples: ["Ik zou graag komen.", "Als ik tijd had, …"], use: ["Irreële voorwaarden (wenn … wäre)", "Beleefde verzoeken en wensen"], avoid: ["Niet voor echte, ware feiten (dat is de indicatief)."], compare_rows: [["irreëel / beleefd / wens", "reëel feit"]], compare_note: "Ich habe Zeit (reëel) vs. Ich hätte Zeit (irreëel/wens)." },
          fr: { explain_n: "Pour l'irréel, les demandes polies et les souhaits. Souvent ‘würde + infinitif’, sinon wäre/hätte/könnte.", mnemonic: "Tu rêves ou tu demandes poliment ? → würde / wäre / hätte / könnte.", signals: ["si (wenn)", "ferait / serait", "aurait", "à ta place"], examples: ["J'aimerais beaucoup venir.", "Si j'avais le temps, …"], use: ["Conditions irréelles (wenn … wäre)", "Demandes polies et souhaits"], avoid: ["Pas pour des faits réels et vrais (c'est l'indicatif)."], compare_rows: [["irréel / poli / souhait", "fait réel"]], compare_note: "Ich habe Zeit (réel) vs. Ich hätte Zeit (irréel/souhait)." }
        }
      }
    },
    nl: {
      present: {
        name: "Tegenwoordige tijd",
        explain_t: "De tegenwoordige tijd gebruik je voor het heden, gewoontes en feiten. Stam voor ik, **stam + t** voor jij/hij/zij; bij ‚jij‘ na het werkwoord valt de -t weg.",
        signals: [{ w: "nu" }, { w: "altijd" }, { w: "elke dag" }, { w: "vaak" }],
        examples: [{ s: "Ik **werk** in Amsterdam." }, { s: "Zij **woont** in Utrecht." }],
        compare: { with: "Toekomende tijd" },
        n: {
          nl: { explain_n: "Voor het heden, gewoontes en feiten. Onthoud: ‘t kofschip’ bepaalt later -te/-de.", mnemonic: "ik = stam, jij/hij = stam + t (maar ‘werk jij?’ zonder t).", signals: ["nu", "altijd", "elke dag", "vaak"], examples: ["Ik werk in Amsterdam.", "Zij woont in Utrecht."], use: ["Het heden en gewoontes", "Feiten en algemene waarheden"], avoid: ["Vergeet de -t niet bij hij/zij/het."], compare_rows: [["nu / algemeen", "uitdrukkelijk toekomst (zullen)"]], compare_note: "Ik werk morgen (gepland) vs. Ik zal werken (nadruk op toekomst)." },
          de: { explain_n: "Für das Heute, Gewohnheiten und Fakten. Merke: ‚t kofschip‘ entscheidet später über -te/-de.", mnemonic: "ik = Stamm, jij/hij = Stamm + t (aber ‚werk jij?‘ ohne t).", signals: ["jetzt", "immer", "jeden Tag", "oft"], examples: ["Ich arbeite in Amsterdam.", "Sie wohnt in Utrecht."], use: ["Gegenwart und Gewohnheiten", "Fakten und Allgemeingültiges"], avoid: ["Vergiss das -t bei hij/zij/het nicht."], compare_rows: [["jetzt / allgemein", "ausdrücklich Zukunft (zullen)"]], compare_note: "Ik werk morgen (geplant) vs. Ik zal werken (Zukunft betont)." },
          en: { explain_n: "For the present, habits and facts. Note: 't kofschip' later decides -te/-de.", mnemonic: "ik = stem, jij/hij = stem + t (but 'werk jij?' drops the t).", signals: ["now", "always", "every day", "often"], examples: ["I work in Amsterdam.", "She lives in Utrecht."], use: ["The present and habits", "Facts and general truths"], avoid: ["Don't forget the -t for hij/zij/het."], compare_rows: [["now / general", "explicitly future (zullen)"]], compare_note: "Ik werk morgen (planned) vs. Ik zal werken (future emphasised)." },
          es: { explain_n: "Para el presente, los hábitos y los hechos. Nota: ‘t kofschip’ decide luego -te/-de.", mnemonic: "ik = raíz, jij/hij = raíz + t (pero ‘werk jij?’ sin t).", signals: ["ahora", "siempre", "cada día", "a menudo"], examples: ["Trabajo en Ámsterdam.", "Ella vive en Utrecht."], use: ["El presente y los hábitos", "Hechos y verdades generales"], avoid: ["No olvides la -t con hij/zij/het."], compare_rows: [["ahora / general", "futuro explícito (zullen)"]], compare_note: "Ik werk morgen (planeado) vs. Ik zal werken (futuro enfático)." },
          fr: { explain_n: "Pour le présent, les habitudes et les faits. Note : ‘t kofschip’ décidera -te/-de.", mnemonic: "ik = radical, jij/hij = radical + t (mais ‘werk jij?’ sans t).", signals: ["maintenant", "toujours", "chaque jour", "souvent"], examples: ["Je travaille à Amsterdam.", "Elle habite à Utrecht."], use: ["Le présent et les habitudes", "Faits et vérités générales"], avoid: ["N'oublie pas le -t pour hij/zij/het."], compare_rows: [["maintenant / général", "futur explicite (zullen)"]], compare_note: "Ik werk morgen (prévu) vs. Ik zal werken (futur insistant)." }
        }
      },
      past: {
        name: "Verleden tijd",
        explain_t: "De onvoltooid verleden tijd (imperfectum) vertelt over het verleden, vooral beschrijvingen en gewoontes. Regelmatig: **-te(n) / -de(n)** — ‘t kofschip’ kiest -te.",
        signals: [{ w: "gisteren" }, { w: "toen" }, { w: "vroeger" }, { w: "altijd" }],
        examples: [{ s: "Ik **werkte** in een café." }, { s: "Wij **woonden** in Gent." }],
        compare: { with: "Voltooid tegenwoordige tijd" },
        n: {
          nl: { explain_n: "Vertelt over het verleden: beschrijvingen, gewoontes en de achtergrond van een verhaal.", mnemonic: "‘t kofschip’ → -te; anders -de. (werken → werkte; wonen → woonde)", signals: ["gisteren", "toen", "vroeger", "altijd"], examples: ["Ik werkte in een café.", "Wij woonden in Gent."], use: ["Beschrijvingen en gewoontes in het verleden", "De verhaallijn in geschreven verhalen"], avoid: ["Voor één afgeronde gebeurtenis in spreektaal kies je vaak het perfectum."], compare_rows: [["beschrijving / gewoonte", "afgeronde gebeurtenis (gesproken)"]], compare_note: "Ik werkte daar (beschrijving) vs. Ik heb daar gewerkt (gebeurtenis)." },
          de: { explain_n: "Erzählt über die Vergangenheit: Beschreibungen, Gewohnheiten und Hintergrund.", mnemonic: "‚t kofschip‘ → -te; sonst -de. (werken → werkte; wonen → woonde)", signals: ["gestern", "damals", "früher", "immer"], examples: ["Ich arbeitete in einem Café.", "Wir wohnten in Gent."], use: ["Beschreibungen und Gewohnheiten in der Vergangenheit", "Der rote Faden in geschriebenen Geschichten"], avoid: ["Für ein einzelnes abgeschlossenes Ereignis im Gespräch oft das Perfekt."], compare_rows: [["Beschreibung / Gewohnheit", "abgeschlossenes Ereignis (gesprochen)"]], compare_note: "Ik werkte daar (Beschreibung) vs. Ik heb daar gewerkt (Ereignis)." },
          en: { explain_n: "Tells about the past: descriptions, habits and the background of a story.", mnemonic: "'t kofschip' → -te; otherwise -de. (werken → werkte; wonen → woonde)", signals: ["yesterday", "then", "in the past", "always"], examples: ["I worked in a café.", "We lived in Ghent."], use: ["Descriptions and habits in the past", "The storyline in written stories"], avoid: ["For one finished event in speech, the perfect tense is often preferred."], compare_rows: [["description / habit", "finished event (spoken)"]], compare_note: "Ik werkte daar (description) vs. Ik heb daar gewerkt (event)." },
          es: { explain_n: "Habla del pasado: descripciones, hábitos y el trasfondo de una historia.", mnemonic: "‘t kofschip’ → -te; si no -de. (werken → werkte; wonen → woonde)", signals: ["ayer", "entonces", "antes", "siempre"], examples: ["Trabajaba en una cafetería.", "Vivíamos en Gante."], use: ["Descripciones y hábitos en el pasado", "El hilo de las historias escritas"], avoid: ["Para un único hecho terminado al hablar, suele preferirse el perfectum."], compare_rows: [["descripción / hábito", "hecho terminado (hablado)"]], compare_note: "Ik werkte daar (descripción) vs. Ik heb daar gewerkt (hecho)." },
          fr: { explain_n: "Parle du passé : descriptions, habitudes et l'arrière-plan d'un récit.", mnemonic: "‘t kofschip’ → -te ; sinon -de. (werken → werkte ; wonen → woonde)", signals: ["hier", "alors", "autrefois", "toujours"], examples: ["Je travaillais dans un café.", "Nous habitions à Gand."], use: ["Descriptions et habitudes au passé", "Le fil des récits écrits"], avoid: ["Pour un seul événement terminé à l'oral, on préfère souvent le perfectum."], compare_rows: [["description / habitude", "événement terminé (oral)"]], compare_note: "Ik werkte daar (description) vs. Ik heb daar gewerkt (événement)." }
        }
      },
      perfect: {
        name: "Voltooid tegenwoordige tijd",
        explain_t: "Het perfectum is het gesproken verleden: **hebben/zijn + voltooid deelwoord** (ge-…-t/-d). Kies ‘zijn’ bij beweging en verandering (gaan, komen, worden).",
        signals: [{ w: "gisteren" }, { w: "net" }, { w: "al" }, { w: "vorige week" }],
        examples: [{ s: "Ik **heb** pizza **gegeten**." }, { s: "Wij **zijn** naar huis **gegaan**." }],
        compare: { with: "Verleden tijd" },
        n: {
          nl: { explain_n: "Het gesproken verleden: hebben/zijn + voltooid deelwoord. ‘zijn’ bij beweging/verandering.", mnemonic: "ge- + stam + t/d; beweging van A naar B? → zijn.", signals: ["gisteren", "net", "al", "vorige week"], examples: ["Ik heb pizza gegeten.", "Wij zijn naar huis gegaan."], use: ["Het verleden in gesprek en e-mails", "Afgeronde handelingen met gevolg nu"], avoid: ["Verwar het hulpwerkwoord niet: ‘ik heb gegaan’ is fout — ‘ik ben gegaan’."], compare_rows: [["gesproken gebeurtenis", "beschrijving / gewoonte"]], compare_note: "Ik heb gewerkt (perfectum, gebeurtenis) vs. Ik werkte (imperfectum, beschrijving)." },
          de: { explain_n: "Das gesprochene Perfekt: hebben/zijn + Partizip. ‚zijn‘ bei Bewegung/Veränderung.", mnemonic: "ge- + Stamm + t/d; Bewegung von A nach B? → zijn.", signals: ["gestern", "gerade", "schon", "letzte Woche"], examples: ["Ich habe Pizza gegessen.", "Wir sind nach Hause gegangen."], use: ["Vergangenes im Gespräch und in E-Mails", "Abgeschlossene Handlungen mit Folge jetzt"], avoid: ["Verwechsle das Hilfsverb nicht: ‚ik heb gegaan‘ ist falsch — ‚ik ben gegaan‘."], compare_rows: [["gesprochenes Ereignis", "Beschreibung / Gewohnheit"]], compare_note: "Ik heb gewerkt (Perfektum, Ereignis) vs. Ik werkte (Imperfektum, Beschreibung)." },
          en: { explain_n: "The spoken past: hebben/zijn + past participle. Use 'zijn' for movement/change.", mnemonic: "ge- + stem + t/d; movement from A to B? → zijn.", signals: ["yesterday", "just", "already", "last week"], examples: ["I ate pizza. (Ik heb pizza gegeten.)", "We went home. (Wij zijn naar huis gegaan.)"], use: ["The past in speech and emails", "Finished actions with a result now"], avoid: ["Don't mix up the auxiliary: 'ik heb gegaan' is wrong — 'ik ben gegaan'."], compare_rows: [["spoken event", "description / habit"]], compare_note: "Ik heb gewerkt (perfectum, event) vs. Ik werkte (imperfectum, description)." },
          es: { explain_n: "El pasado hablado: hebben/zijn + participio. Usa ‘zijn’ con movimiento/cambio.", mnemonic: "ge- + raíz + t/d; ¿movimiento de A a B? → zijn.", signals: ["ayer", "recién", "ya", "la semana pasada"], examples: ["Comí pizza. (Ik heb pizza gegeten.)", "Fuimos a casa. (Wij zijn naar huis gegaan.)"], use: ["El pasado al hablar y en correos", "Acciones terminadas con resultado ahora"], avoid: ["No confundas el auxiliar: ‘ik heb gegaan’ es incorrecto — ‘ik ben gegaan’."], compare_rows: [["hecho hablado", "descripción / hábito"]], compare_note: "Ik heb gewerkt (perfectum, hecho) vs. Ik werkte (imperfectum, descripción)." },
          fr: { explain_n: "Le passé parlé : hebben/zijn + participe passé. Emploie ‘zijn’ pour le mouvement/changement.", mnemonic: "ge- + radical + t/d ; mouvement de A à B ? → zijn.", signals: ["hier", "juste", "déjà", "la semaine dernière"], examples: ["J'ai mangé une pizza. (Ik heb pizza gegeten.)", "Nous sommes rentrés. (Wij zijn naar huis gegaan.)"], use: ["Le passé à l'oral et dans les e-mails", "Actions terminées avec un résultat maintenant"], avoid: ["Ne confonds pas l'auxiliaire : ‘ik heb gegaan’ est faux — ‘ik ben gegaan’."], compare_rows: [["événement oral", "description / habitude"]], compare_note: "Ik heb gewerkt (perfectum, événement) vs. Ik werkte (imperfectum, description)." }
        }
      },
      future: {
        name: "Toekomende tijd",
        explain_t: "De toekomende tijd vorm je met **zullen + infinitief**. In het Nederlands gebruik je voor geplande dingen vaak gewoon de tegenwoordige tijd of ‘gaan’.",
        signals: [{ w: "morgen" }, { w: "straks" }, { w: "volgend jaar" }, { w: "binnenkort" }],
        examples: [{ s: "Ik **zal** je **bellen**." }, { s: "Het **zal** wel **regenen**." }],
        compare: { with: "Tegenwoordige tijd" },
        n: {
          nl: { explain_n: "zullen + infinitief, voor de toekomst, beloftes en vermoedens. Vaak volstaat ook ‘gaan’ of het heden.", mnemonic: "zal/zult/zullen + hele werkwoord achteraan.", signals: ["morgen", "straks", "volgend jaar", "binnenkort"], examples: ["Ik zal je bellen.", "Het zal wel regenen."], use: ["Voornemens, beloftes en vermoedens", "Nadrukkelijke toekomst"], avoid: ["Voor gewone plannen klinkt ‘ik ga bellen’ of het heden vaak natuurlijker."], compare_rows: [["nadruk op toekomst (zullen)", "gepland (heden / gaan)"]], compare_note: "Ik zal werken (nadruk) vs. Ik werk morgen (gewoon gepland)." },
          de: { explain_n: "zullen + Infinitiv, für Zukunft, Versprechen und Vermutungen. Oft reicht auch ‚gaan‘ oder das Präsens.", mnemonic: "zal/zult/zullen + ganzes Verb am Ende.", signals: ["morgen", "gleich", "nächstes Jahr", "bald"], examples: ["Ich werde dich anrufen.", "Es wird wohl regnen."], use: ["Vorsätze, Versprechen und Vermutungen", "Betonte Zukunft"], avoid: ["Für normale Pläne klingt ‚ik ga bellen‘ oder das Präsens natürlicher."], compare_rows: [["betonte Zukunft (zullen)", "geplant (Präsens / gaan)"]], compare_note: "Ik zal werken (betont) vs. Ik werk morgen (einfach geplant)." },
          en: { explain_n: "zullen + infinitive, for the future, promises and assumptions. Often 'gaan' or the present is enough.", mnemonic: "zal/zult/zullen + full verb at the end.", signals: ["tomorrow", "later", "next year", "soon"], examples: ["I'll call you.", "It will probably rain."], use: ["Intentions, promises and assumptions", "Emphasised future"], avoid: ["For ordinary plans, 'ik ga bellen' or the present sounds more natural."], compare_rows: [["emphasised future (zullen)", "planned (present / gaan)"]], compare_note: "Ik zal werken (emphasis) vs. Ik werk morgen (just planned)." },
          es: { explain_n: "zullen + infinitivo, para el futuro, promesas y suposiciones. A menudo basta ‘gaan’ o el presente.", mnemonic: "zal/zult/zullen + verbo entero al final.", signals: ["mañana", "luego", "el año que viene", "pronto"], examples: ["Te llamaré.", "Probablemente lloverá."], use: ["Intenciones, promesas y suposiciones", "Futuro enfático"], avoid: ["Para planes normales, ‘ik ga bellen’ o el presente suena más natural."], compare_rows: [["futuro enfático (zullen)", "planeado (presente / gaan)"]], compare_note: "Ik zal werken (énfasis) vs. Ik werk morgen (simplemente planeado)." },
          fr: { explain_n: "zullen + infinitif, pour le futur, les promesses et les suppositions. Souvent ‘gaan’ ou le présent suffit.", mnemonic: "zal/zult/zullen + verbe entier à la fin.", signals: ["demain", "tout à l'heure", "l'année prochaine", "bientôt"], examples: ["Je t'appellerai.", "Il va sans doute pleuvoir."], use: ["Intentions, promesses et suppositions", "Futur insistant"], avoid: ["Pour des projets ordinaires, ‘ik ga bellen’ ou le présent sonne plus naturel."], compare_rows: [["futur insistant (zullen)", "prévu (présent / gaan)"]], compare_note: "Ik zal werken (insistance) vs. Ik werk morgen (simplement prévu)." }
        }
      }
    },
    fr: {
      present: {
        name: "Présent",
        explain_t: "Le présent sert aux habitudes, aux faits et à ce qui se passe maintenant. Les terminaisons dépendent du groupe (-er / -ir / -re) : **je parle, je finis, je vends**.",
        signals: [{ w: "aujourd'hui" }, { w: "toujours" }, { w: "souvent" }, { w: "maintenant" }],
        examples: [{ s: "Je **parle** français." }, { s: "Elle **habite** à Lyon." }],
        compare: { with: "Futur simple" },
        n: {
          fr: { explain_n: "Pour les habitudes, les faits et le moment présent. Surveille les trois groupes (-er/-ir/-re).", mnemonic: "1er groupe -er : je -e, tu -es, il -e — le plus régulier.", signals: ["aujourd'hui", "toujours", "souvent", "maintenant"], examples: ["Je parle français.", "Elle habite à Lyon."], use: ["Habitudes et routines", "Faits et vérités générales"], avoid: ["Pour le passé, utilise le passé composé ou l'imparfait."], compare_rows: [["maintenant / général", "explicitement futur"]], compare_note: "Je parle (présent) vs. Je parlerai (futur)." },
          de: { explain_n: "Für Gewohnheiten, Fakten und den Moment jetzt. Achte auf die drei Gruppen (-er/-ir/-re).", mnemonic: "1. Gruppe -er: je -e, tu -es, il -e — die regelmäßigste.", signals: ["heute", "immer", "oft", "jetzt"], examples: ["Ich spreche Französisch.", "Sie wohnt in Lyon."], use: ["Gewohnheiten und Routinen", "Fakten und Allgemeingültiges"], avoid: ["Für Vergangenes nimm das Passé composé oder Imparfait."], compare_rows: [["jetzt / allgemein", "ausdrücklich Zukunft"]], compare_note: "Je parle (Präsens) vs. Je parlerai (Futur)." },
          en: { explain_n: "For habits, facts and the present moment. Watch the three groups (-er/-ir/-re).", mnemonic: "1st group -er: je -e, tu -es, il -e — the most regular.", signals: ["today", "always", "often", "now"], examples: ["I speak French.", "She lives in Lyon."], use: ["Habits and routines", "Facts and general truths"], avoid: ["For the past, use the passé composé or imparfait."], compare_rows: [["now / general", "explicitly future"]], compare_note: "Je parle (present) vs. Je parlerai (future)." },
          es: { explain_n: "Para hábitos, hechos y el momento presente. Atención a los tres grupos (-er/-ir/-re).", mnemonic: "1er grupo -er: je -e, tu -es, il -e — el más regular.", signals: ["hoy", "siempre", "a menudo", "ahora"], examples: ["Hablo francés.", "Ella vive en Lyon."], use: ["Hábitos y rutinas", "Hechos y verdades generales"], avoid: ["Para el pasado, usa el passé composé o el imparfait."], compare_rows: [["ahora / general", "explícitamente futuro"]], compare_note: "Je parle (presente) vs. Je parlerai (futuro)." },
          nl: { explain_n: "Voor gewoontes, feiten en het moment nu. Let op de drie groepen (-er/-ir/-re).", mnemonic: "1e groep -er: je -e, tu -es, il -e — de meest regelmatige.", signals: ["vandaag", "altijd", "vaak", "nu"], examples: ["Ik spreek Frans.", "Zij woont in Lyon."], use: ["Gewoontes en routines", "Feiten en algemene waarheden"], avoid: ["Voor het verleden gebruik je de passé composé of imparfait."], compare_rows: [["nu / algemeen", "expliciet toekomst"]], compare_note: "Je parle (heden) vs. Je parlerai (toekomst)." }
        }
      },
      past: {
        name: "Imparfait",
        explain_t: "L'imparfait décrit le passé sans fin nette : décors, habitudes et actions de fond. Formé sur le radical du **nous** au présent + **-ais, -ais, -ait…**",
        signals: [{ w: "avant" }, { w: "souvent" }, { w: "tous les jours" }, { w: "pendant que" }],
        examples: [{ s: "Quand j'étais petit, je **jouais** dehors." }, { s: "Il **pleuvait** ce matin." }],
        compare: { with: "Passé composé" },
        n: {
          fr: { explain_n: "La toile de fond du passé : décor, habitudes et actions en cours.", mnemonic: "Radical du ‘nous’ + -ais : nous parlons → je parlais.", signals: ["avant", "souvent", "tous les jours", "pendant que"], examples: ["Quand j'étais petit, je jouais dehors.", "Il pleuvait ce matin."], use: ["Descriptions et décors au passé", "Habitudes et actions répétées"], avoid: ["Pas pour une action unique et terminée (c'est le passé composé)."], compare_rows: [["décor, sans fin nette", "action ponctuelle terminée"]], compare_note: "Il pleuvait (décor) vs. Il a plu (fait terminé)." },
          de: { explain_n: "Der Hintergrund der Vergangenheit: Beschreibung, Gewohnheiten und laufende Handlungen.", mnemonic: "Stamm von ‚nous‘ + -ais: nous parlons → je parlais.", signals: ["früher", "oft", "jeden Tag", "während"], examples: ["Als ich klein war, spielte ich draußen.", "Heute Morgen regnete es."], use: ["Beschreibungen und Kulissen in der Vergangenheit", "Gewohnheiten und wiederholte Handlungen"], avoid: ["Nicht für eine einmalige, abgeschlossene Handlung (das ist das Passé composé)."], compare_rows: [["Kulisse, kein klares Ende", "einmalige, abgeschlossene Handlung"]], compare_note: "Il pleuvait (Kulisse) vs. Il a plu (abgeschlossene Tatsache)." },
          en: { explain_n: "The backdrop of the past: descriptions, habits and ongoing actions.", mnemonic: "Stem of 'nous' + -ais: nous parlons → je parlais.", signals: ["before", "often", "every day", "while"], examples: ["When I was little, I played outside.", "It was raining this morning."], use: ["Descriptions and settings in the past", "Habits and repeated actions"], avoid: ["Not for a single, completed action (that's the passé composé)."], compare_rows: [["backdrop, no clear end", "single, completed action"]], compare_note: "Il pleuvait (backdrop) vs. Il a plu (completed fact)." },
          es: { explain_n: "El trasfondo del pasado: descripciones, hábitos y acciones en curso.", mnemonic: "Raíz de ‘nous’ + -ais: nous parlons → je parlais.", signals: ["antes", "a menudo", "todos los días", "mientras"], examples: ["Cuando era pequeño, jugaba fuera.", "Esta mañana llovía."], use: ["Descripciones y escenarios del pasado", "Hábitos y acciones repetidas"], avoid: ["No para una acción única y terminada (eso es el passé composé)."], compare_rows: [["trasfondo, sin fin nítida", "acción puntual terminada"]], compare_note: "Il pleuvait (trasfondo) vs. Il a plu (hecho terminado)." },
          nl: { explain_n: "De achtergrond van het verleden: beschrijvingen, gewoontes en lopende handelingen.", mnemonic: "Stam van ‘nous’ + -ais: nous parlons → je parlais.", signals: ["vroeger", "vaak", "elke dag", "terwijl"], examples: ["Toen ik klein was, speelde ik buiten.", "Het regende vanochtend."], use: ["Beschrijvingen en decors in het verleden", "Gewoontes en herhaalde handelingen"], avoid: ["Niet voor één afgeronde handeling (dat is de passé composé)."], compare_rows: [["decor, geen duidelijk einde", "eenmalige, afgeronde handeling"]], compare_note: "Il pleuvait (decor) vs. Il a plu (afgerond feit)." }
        }
      },
      perfect: {
        name: "Passé composé",
        explain_t: "Le passé composé raconte les actions ponctuelles et terminées : **avoir/être + participe passé**. Mouvement et verbes pronominaux prennent **être** (accord avec le sujet).",
        signals: [{ w: "hier" }, { w: "ce matin" }, { w: "soudain" }, { w: "une fois" }],
        examples: [{ s: "Hier, j'**ai mangé** au restaurant." }, { s: "Elle **est arrivée** à midi." }],
        compare: { with: "Imparfait" },
        n: {
          fr: { explain_n: "Actions ponctuelles et terminées : avoir/être + participe. ‘être’ pour le mouvement et les pronominaux.", mnemonic: "Mouvement ou pronominal ? → être (et accord avec le sujet).", signals: ["hier", "ce matin", "soudain", "une fois"], examples: ["Hier, j'ai mangé au restaurant.", "Elle est arrivée à midi."], use: ["Actions ponctuelles et terminées", "Événements qui font avancer le récit"], avoid: ["Pas pour les descriptions ou les habitudes (c'est l'imparfait)."], compare_rows: [["action ponctuelle terminée", "décor / habitude"]], compare_note: "J'ai mangé (fait) vs. Je mangeais (en train de, habitude)." },
          de: { explain_n: "Einmalige, abgeschlossene Handlungen: avoir/être + Partizip. ‚être‘ bei Bewegung und Reflexivverben.", mnemonic: "Bewegung oder reflexiv? → être (und Angleichung ans Subjekt).", signals: ["gestern", "heute Morgen", "plötzlich", "einmal"], examples: ["Gestern habe ich im Restaurant gegessen.", "Sie ist um zwölf angekommen."], use: ["Einmalige, abgeschlossene Handlungen", "Ereignisse, die die Geschichte vorantreiben"], avoid: ["Nicht für Beschreibungen oder Gewohnheiten (das ist das Imparfait)."], compare_rows: [["einmalige abgeschlossene Handlung", "Kulisse / Gewohnheit"]], compare_note: "J'ai mangé (Tatsache) vs. Je mangeais (gerade dabei, Gewohnheit)." },
          en: { explain_n: "Single, completed actions: avoir/être + participle. Use 'être' for movement and reflexive verbs.", mnemonic: "Movement or reflexive? → être (and agree with the subject).", signals: ["yesterday", "this morning", "suddenly", "once"], examples: ["Yesterday I ate at a restaurant.", "She arrived at noon."], use: ["Single, completed actions", "Events that move the story forward"], avoid: ["Not for descriptions or habits (that's the imparfait)."], compare_rows: [["single completed action", "backdrop / habit"]], compare_note: "J'ai mangé (fact) vs. Je mangeais (in progress, habit)." },
          es: { explain_n: "Acciones puntuales y terminadas: avoir/être + participio. ‘être’ con movimiento y verbos pronominales.", mnemonic: "¿Movimiento o pronominal? → être (y concuerda con el sujeto).", signals: ["ayer", "esta mañana", "de repente", "una vez"], examples: ["Ayer comí en un restaurante.", "Ella llegó a mediodía."], use: ["Acciones puntuales y terminadas", "Hechos que hacen avanzar la historia"], avoid: ["No para descripciones o hábitos (eso es el imparfait)."], compare_rows: [["acción puntual terminada", "trasfondo / hábito"]], compare_note: "J'ai mangé (hecho) vs. Je mangeais (en curso, hábito)." },
          nl: { explain_n: "Eenmalige, afgeronde handelingen: avoir/être + deelwoord. ‘être’ bij beweging en wederkerende werkwoorden.", mnemonic: "Beweging of wederkerend? → être (en congruentie met het onderwerp).", signals: ["gisteren", "vanochtend", "plotseling", "een keer"], examples: ["Gisteren at ik in een restaurant.", "Zij is om twaalf uur aangekomen."], use: ["Eenmalige, afgeronde handelingen", "Gebeurtenissen die het verhaal voortstuwen"], avoid: ["Niet voor beschrijvingen of gewoontes (dat is de imparfait)."], compare_rows: [["eenmalige afgeronde handeling", "decor / gewoonte"]], compare_note: "J'ai mangé (feit) vs. Je mangeais (bezig, gewoonte)." }
        }
      },
      future: {
        name: "Futur simple",
        explain_t: "Le futur simple exprime les prédictions, les projets et les promesses. Il se forme sur l'**infinitif + -ai, -as, -a…** : je parlerai, je finirai.",
        signals: [{ w: "demain" }, { w: "bientôt" }, { w: "l'année prochaine" }, { w: "un jour" }],
        examples: [{ s: "Demain, je **parlerai** au directeur." }, { s: "Il **pleuvra** ce soir." }],
        compare: { with: "Présent (futur proche : aller +)" },
        n: {
          fr: { explain_n: "Prédictions, projets et promesses. Construit sur l'infinitif + -ai/-as/-a.", mnemonic: "Infinitif entier + -ai : parler → je parlerai.", signals: ["demain", "bientôt", "l'année prochaine", "un jour"], examples: ["Demain, je parlerai au directeur.", "Il pleuvra ce soir."], use: ["Prédictions sur l'avenir", "Projets et promesses"], avoid: ["À l'oral, le futur proche ‘je vais parler’ est très fréquent."], compare_rows: [["futur (lointain / formel)", "futur proche (aller + infinitif)"]], compare_note: "Je parlerai (futur simple) vs. Je vais parler (futur proche)." },
          de: { explain_n: "Vorhersagen, Pläne und Versprechen. Gebildet aus Infinitiv + -ai/-as/-a.", mnemonic: "Ganzer Infinitiv + -ai: parler → je parlerai.", signals: ["morgen", "bald", "nächstes Jahr", "eines Tages"], examples: ["Morgen spreche ich mit dem Direktor.", "Heute Abend wird es regnen."], use: ["Vorhersagen über die Zukunft", "Pläne und Versprechen"], avoid: ["Im Gespräch ist das Futur proche ‚je vais parler‘ sehr häufig."], compare_rows: [["Futur (fern / formell)", "nahe Zukunft (aller + Infinitiv)"]], compare_note: "Je parlerai (Futur simple) vs. Je vais parler (Futur proche)." },
          en: { explain_n: "Predictions, plans and promises. Built on the infinitive + -ai/-as/-a.", mnemonic: "Whole infinitive + -ai: parler → je parlerai.", signals: ["tomorrow", "soon", "next year", "one day"], examples: ["Tomorrow I'll speak with the director.", "It will rain tonight."], use: ["Predictions about the future", "Plans and promises"], avoid: ["In speech, the near future 'je vais parler' is very common."], compare_rows: [["future (distant / formal)", "near future (aller + infinitive)"]], compare_note: "Je parlerai (futur simple) vs. Je vais parler (futur proche)." },
          es: { explain_n: "Predicciones, planes y promesas. Se forma sobre el infinitivo + -ai/-as/-a.", mnemonic: "Infinitivo entero + -ai: parler → je parlerai.", signals: ["mañana", "pronto", "el año que viene", "algún día"], examples: ["Mañana hablaré con el director.", "Esta noche lloverá."], use: ["Predicciones sobre el futuro", "Planes y promesas"], avoid: ["Al hablar, el futuro próximo ‘je vais parler’ es muy frecuente."], compare_rows: [["futuro (lejano / formal)", "futuro próximo (aller + infinitivo)"]], compare_note: "Je parlerai (futur simple) vs. Je vais parler (futur proche)." },
          nl: { explain_n: "Voorspellingen, plannen en beloftes. Gevormd op de infinitief + -ai/-as/-a.", mnemonic: "Hele infinitief + -ai: parler → je parlerai.", signals: ["morgen", "binnenkort", "volgend jaar", "ooit"], examples: ["Morgen spreek ik met de directeur.", "Het zal vanavond regenen."], use: ["Voorspellingen over de toekomst", "Plannen en beloftes"], avoid: ["In spreektaal is de nabije toekomst ‘je vais parler’ heel gewoon."], compare_rows: [["toekomst (ver / formeel)", "nabije toekomst (aller + infinitief)"]], compare_note: "Je parlerai (futur simple) vs. Je vais parler (futur proche)." }
        }
      },
      subjunctive: {
        name: "Subjonctif",
        explain_t: "Le subjonctif exprime le souhait, le doute, l'émotion et la nécessité. Il suit souvent **que** : il faut que tu **viennes**, je veux que tu **sois** là.",
        signals: [{ w: "il faut que" }, { w: "je veux que" }, { w: "bien que" }, { w: "pour que" }],
        examples: [{ s: "Il faut que je **parte**." }, { s: "Je veux que tu **sois** heureux." }],
        compare: { with: "Indicatif (présent)" },
        n: {
          fr: { explain_n: "Le mode du subjectif : souhait, doute, émotion et nécessité, souvent après ‘que’.", mnemonic: "Souhait, doute, obligation après ‘que’ → subjonctif.", signals: ["il faut que", "je veux que", "bien que", "pour que"], examples: ["Il faut que je parte.", "Je veux que tu sois heureux."], use: ["Souhait, volonté et nécessité (il faut que, je veux que)", "Doute, émotion et certaines conjonctions (bien que, pour que)"], avoid: ["Pas pour un fait certain (c'est l'indicatif)."], compare_rows: [["souhait / doute / subjectif", "fait certain et réel"]], compare_note: "Je sais qu'il vient (fait) vs. Je veux qu'il vienne (souhait)." },
          de: { explain_n: "Der Modus des Subjektiven: Wunsch, Zweifel, Gefühl und Notwendigkeit, oft nach ‚que‘.", mnemonic: "Wunsch, Zweifel, Notwendigkeit nach ‚que‘ → Subjonctif.", signals: ["es ist nötig, dass", "ich will, dass", "obwohl", "damit"], examples: ["Ich muss gehen.", "Ich möchte, dass du glücklich bist."], use: ["Wunsch, Wille und Notwendigkeit (il faut que, je veux que)", "Zweifel, Gefühl und bestimmte Konjunktionen (bien que, pour que)"], avoid: ["Nicht für sichere Tatsachen (das ist der Indikativ)."], compare_rows: [["Wunsch / Zweifel / subjektiv", "sichere, reale Tatsache"]], compare_note: "Je sais qu'il vient (Tatsache) vs. Je veux qu'il vienne (Wunsch)." },
          en: { explain_n: "The mood of the subjective: wish, doubt, emotion and necessity, often after 'que'.", mnemonic: "Wish, doubt, necessity after 'que' → subjonctif.", signals: ["it is necessary that", "I want (that)", "although", "so that"], examples: ["I have to go.", "I want you to be happy."], use: ["Wish, will and necessity (il faut que, je veux que)", "Doubt, emotion and certain conjunctions (bien que, pour que)"], avoid: ["Not for a certain fact (that's the indicative)."], compare_rows: [["wish / doubt / subjective", "certain, real fact"]], compare_note: "Je sais qu'il vient (fact) vs. Je veux qu'il vienne (wish)." },
          es: { explain_n: "El modo de lo subjetivo: deseo, duda, emoción y necesidad, a menudo tras ‘que’.", mnemonic: "Deseo, duda, necesidad tras ‘que’ → subjonctif.", signals: ["es necesario que", "quiero que", "aunque", "para que"], examples: ["Tengo que irme.", "Quiero que seas feliz."], use: ["Deseo, voluntad y necesidad (il faut que, je veux que)", "Duda, emoción y ciertas conjunciones (bien que, pour que)"], avoid: ["No para un hecho seguro (eso es el indicativo)."], compare_rows: [["deseo / duda / subjetivo", "hecho seguro y real"]], compare_note: "Je sais qu'il vient (hecho) vs. Je veux qu'il vienne (deseo)." },
          nl: { explain_n: "De wijs van het subjectieve: wens, twijfel, emotie en noodzaak, vaak na ‘que’.", mnemonic: "Wens, twijfel, noodzaak na ‘que’ → subjonctif.", signals: ["het is nodig dat", "ik wil dat", "hoewel", "zodat"], examples: ["Ik moet gaan.", "Ik wil dat je gelukkig bent."], use: ["Wens, wil en noodzaak (il faut que, je veux que)", "Twijfel, emotie en bepaalde voegwoorden (bien que, pour que)"], avoid: ["Niet voor een zeker feit (dat is de indicatief)."], compare_rows: [["wens / twijfel / subjectief", "zeker, reëel feit"]], compare_note: "Je sais qu'il vient (feit) vs. Je veux qu'il vienne (wens)." }
        }
      }
    }
  };
})();
;
/* ===== Supabase Auth bridge ===== */
(function(){
  var SUPA_URL = 'https://lrhmyboevoxtlvoxnrny.supabase.co';
  var SUPA_KEY = 'sb_publishable_HJMTA3em7L69hzbQrwgwOA_WsYgyN3P';
  var client = supabase.createClient(SUPA_URL, SUPA_KEY);
  window.__supa = client;
  window.__supaUser = null;

  client.auth.getSession().then(function(r){
    window.__supaUser = r.data && r.data.session && r.data.session.user || null;
    document.dispatchEvent(new CustomEvent('supa-auth', {detail: window.__supaUser}));
  });
  client.auth.onAuthStateChange(function(_e, session){
    window.__supaUser = session && session.user || null;
    document.dispatchEvent(new CustomEvent('supa-auth', {detail: window.__supaUser}));
  });
})();
;
/* ===== ConjuExpert AI bridge — Cloudflare Worker proxy ===== */
(function(){
  // Same-Origin-Route (Cloudflare-Worker an conjuexpert.app/api/ai* gebunden).
  // Ermoeglicht WAF-Rate-Limiting + entfernt die oeffentliche workers.dev-URL.
  var WORKER = '/api/ai';
  var queue = [], busy = false, lastCall = 0, INTERVAL = 300;
  function delay(ms){ return new Promise(function(r){setTimeout(r,ms);}); }
  async function callWorker(prompt, attempt){
    attempt = attempt || 0;
    var resp = await fetch(WORKER, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({prompt: prompt})
    });
    var d = await resp.json();
    if(!resp.ok){
      if(resp.status===429 && attempt < 5){
        await delay(3000 * (attempt + 1));
        return callWorker(prompt, attempt + 1);
      }
      throw new Error((d.error&&d.error.message)||'AI error');
    }
    return d.text || '';
  }
  async function processQueue(){
    if(busy) return; busy = true;
    while(queue.length){
      var wait = lastCall + INTERVAL - Date.now();
      if(wait > 0) await delay(wait);
      var item = queue.shift();
      lastCall = Date.now();
      try{ item.resolve(await callWorker(item.prompt)); }
      catch(e){ item.reject(e); }
    }
    busy = false;
  }
  function enqueue(prompt){
    return new Promise(function(resolve,reject){
      queue.push({prompt:prompt,resolve:resolve,reject:reject});
      processQueue();
    });
  }
  window.claude = { complete: enqueue };
  window.__hasAI = function(){ return true; };
  window.aiComplete = enqueue;
  // streaming variant: yields the model's text as it arrives (onText gets the accumulated text)
  async function streamComplete(prompt, onText){
    var resp = await fetch(WORKER, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({prompt:prompt, stream:true}) });
    var ct = (resp.headers.get('content-type') || '');
    if (ct.indexOf('application/json') >= 0 || !resp.body || !resp.body.getReader) {
      var d = await resp.json().catch(function(){ return {}; });
      if (!resp.ok) throw new Error((d.error && d.error.message) || ('AI error ' + resp.status));
      var t = d.text || ''; if (onText) { try { onText(t); } catch(e){} } return t;
    }
    var reader = resp.body.getReader();
    var dec = new TextDecoder();
    var acc = '';
    while (true) {
      var r = await reader.read();
      if (r.done) break;
      acc += dec.decode(r.value, { stream: true });
      if (onText) { try { onText(acc); } catch(e){} }
    }
    return acc;
  }
  window.aiStream = streamComplete;
})();
;
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// tweaks-panel.jsx
// Reusable Tweaks shell + form-control helpers.
// Exports (to window): useTweaks, TweaksPanel, TweakSection, TweakRow, TweakSlider,
//   TweakToggle, TweakRadio, TweakSelect, TweakText, TweakNumber, TweakColor, TweakButton.
//
// Owns the host protocol (listens for __activate_edit_mode / __deactivate_edit_mode,
// posts __edit_mode_available / __edit_mode_set_keys / __edit_mode_dismissed) so
// individual prototypes don't re-roll it. Ships a consistent set of controls so you
// don't hand-draw <input type="range">, segmented radios, steppers, etc.
//
// Usage (in an HTML file that loads React + Babel):
//
//   const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
//     "primaryColor": "#D97757",
//     "palette": ["#D97757", "#29261b", "#f6f4ef"],
//     "fontSize": 16,
//     "density": "regular",
//     "dark": false
//   }/*EDITMODE-END*/;
//
//   function App() {
//     const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
//     return (
//       <div style={{ fontSize: t.fontSize, color: t.primaryColor }}>
//         Hello
//         <TweaksPanel>
//           <TweakSection label="Typography" />
//           <TweakSlider label="Font size" value={t.fontSize} min={10} max={32} unit="px"
//                        onChange={(v) => setTweak('fontSize', v)} />
//           <TweakRadio  label="Density" value={t.density}
//                        options={['compact', 'regular', 'comfy']}
//                        onChange={(v) => setTweak('density', v)} />
//           <TweakSection label="Theme" />
//           <TweakColor  label="Primary" value={t.primaryColor}
//                        options={['#D97757', '#2A6FDB', '#1F8A5B', '#7A5AE0']}
//                        onChange={(v) => setTweak('primaryColor', v)} />
//           <TweakColor  label="Palette" value={t.palette}
//                        options={[['#D97757', '#29261b', '#f6f4ef'],
//                                  ['#475569', '#0f172a', '#f1f5f9']]}
//                        onChange={(v) => setTweak('palette', v)} />
//           <TweakToggle label="Dark mode" value={t.dark}
//                        onChange={(v) => setTweak('dark', v)} />
//         </TweaksPanel>
//       </div>
//     );
//   }
//
// TweakRadio is the segmented control for 2–3 short options (auto-falls-back to
// TweakSelect past ~16/~10 chars per label); reach for TweakSelect directly when
// options are many or long. For color tweaks always curate 3-4 options rather than
// a free picker; an option can also be a whole 2–5 color palette (the stored value
// is the array). The Tweak* controls are a floor, not a ceiling — build custom
// controls inside the panel if a tweak calls for UI they don't cover.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

const __TWEAKS_STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    transform:scale(var(--dc-inv-zoom,1));transform-origin:bottom right;
    background:rgba(250,249,247,.78);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:default;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0;
    scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.15) transparent}
  .twk-body::-webkit-scrollbar{width:8px}
  .twk-body::-webkit-scrollbar-track{background:transparent;margin:2px}
  .twk-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px;
    border:2px solid transparent;background-clip:content-box}
  .twk-body::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.25);
    border:2px solid transparent;background-clip:content-box}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;
    color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}

  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}

  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25);background:rgba(255,255,255,.85)}
  select.twk-field{padding-right:22px;
    background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center}

  .twk-slider{appearance:none;-webkit-appearance:none;width:100%;height:4px;margin:6px 0;
    border-radius:999px;background:rgba(0,0,0,.12);outline:none}
  .twk-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;
    width:14px;height:14px;border-radius:50%;background:#fff;
    border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}
  .twk-slider::-moz-range-thumb{width:14px;height:14px;border-radius:50%;
    background:#fff;border:.5px solid rgba(0,0,0,.12);box-shadow:0 1px 3px rgba(0,0,0,.2);cursor:default}

  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:default;padding:4px 6px;line-height:1.2;
    overflow-wrap:anywhere}

  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:default;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}

  .twk-num{display:flex;align-items:center;box-sizing:border-box;min-width:0;height:26px;padding:0 0 0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6)}
  .twk-num-lbl{font-weight:500;color:rgba(41,38,27,.6);cursor:ew-resize;
    user-select:none;padding-right:8px}
  .twk-num input{flex:1;min-width:0;height:100%;border:0;background:transparent;
    font:inherit;font-variant-numeric:tabular-nums;text-align:right;padding:0 8px 0 0;
    outline:none;color:inherit;-moz-appearance:textfield}
  .twk-num input::-webkit-inner-spin-button,.twk-num input::-webkit-outer-spin-button{
    -webkit-appearance:none;margin:0}
  .twk-num-unit{padding-right:8px;color:rgba(41,38,27,.45)}

  .twk-btn{appearance:none;height:26px;padding:0 12px;border:0;border-radius:7px;
    background:rgba(0,0,0,.78);color:#fff;font:inherit;font-weight:500;cursor:default}
  .twk-btn:hover{background:rgba(0,0,0,.88)}
  .twk-btn.secondary{background:rgba(0,0,0,.06);color:inherit}
  .twk-btn.secondary:hover{background:rgba(0,0,0,.1)}

  .twk-swatch{appearance:none;-webkit-appearance:none;width:56px;height:22px;
    border:.5px solid rgba(0,0,0,.1);border-radius:6px;padding:0;cursor:default;
    background:transparent;flex-shrink:0}
  .twk-swatch::-webkit-color-swatch-wrapper{padding:0}
  .twk-swatch::-webkit-color-swatch{border:0;border-radius:5.5px}
  .twk-swatch::-moz-color-swatch{border:0;border-radius:5.5px}

  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:46px;
    padding:0;border:0;border-radius:6px;overflow:hidden;cursor:default;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);
    transition:transform .12s cubic-bezier(.3,.7,.4,1),box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px);
    box-shadow:0 0 0 .5px rgba(0,0,0,.18),0 4px 10px rgba(0,0,0,.12)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),
    0 2px 6px rgba(0,0,0,.15)}
  .twk-chip>span{position:absolute;top:0;bottom:0;right:0;width:34%;
    display:flex;flex-direction:column;box-shadow:-1px 0 0 rgba(0,0,0,.1)}
  .twk-chip>span>i{flex:1;box-shadow:0 -1px 0 rgba(0,0,0,.1)}
  .twk-chip>span>i:first-child{box-shadow:none}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── useTweaks ───────────────────────────────────────────────────────────────
// Single source of truth for tweak values. setTweak persists via the host
// (__edit_mode_set_keys → host rewrites the EDITMODE block on disk).
function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults);
  // Accepts either setTweak('key', value) or setTweak({ key: value, ... }) so a
  // useState-style call doesn't write a "[object Object]" key into the persisted
  // JSON block.
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : {
      [keyOrEdits]: val
    };
    setValues(prev => ({
      ...prev,
      ...edits
    }));
    window.parent.postMessage({
      type: '__edit_mode_set_keys',
      edits
    }, '*');
    // Same-window signal so in-page listeners (deck-stage rail thumbnails)
    // can react — the parent message only reaches the host, not peers.
    window.dispatchEvent(new CustomEvent('tweakchange', {
      detail: edits
    }));
  }, []);
  return [values, setTweak];
}

// ── TweaksPanel ─────────────────────────────────────────────────────────────
// Floating shell. Registers the protocol listener BEFORE announcing
// availability — if the announce ran first, the host's activate could land
// before our handler exists and the toolbar toggle would silently no-op.
// The close button posts __edit_mode_dismissed so the host's toolbar toggle
// flips off in lockstep; the host echoes __deactivate_edit_mode back which
// is what actually hides the panel.
function TweaksPanel({
  title = 'Tweaks',
  children
}) {
  const [open, setOpen] = React.useState(false);
  const dragRef = React.useRef(null);
  const offsetRef = React.useRef({
    x: 16,
    y: 16
  });
  const PAD = 16;
  const clampToViewport = React.useCallback(() => {
    const panel = dragRef.current;
    if (!panel) return;
    const w = panel.offsetWidth,
      h = panel.offsetHeight;
    const maxRight = Math.max(PAD, window.innerWidth - w - PAD);
    const maxBottom = Math.max(PAD, window.innerHeight - h - PAD);
    offsetRef.current = {
      x: Math.min(maxRight, Math.max(PAD, offsetRef.current.x)),
      y: Math.min(maxBottom, Math.max(PAD, offsetRef.current.y))
    };
    panel.style.right = offsetRef.current.x + 'px';
    panel.style.bottom = offsetRef.current.y + 'px';
  }, []);
  React.useEffect(() => {
    if (!open) return;
    clampToViewport();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', clampToViewport);
      return () => window.removeEventListener('resize', clampToViewport);
    }
    const ro = new ResizeObserver(clampToViewport);
    ro.observe(document.documentElement);
    return () => ro.disconnect();
  }, [open, clampToViewport]);
  React.useEffect(() => {
    const onMsg = e => {
      const t = e?.data?.type;
      if (t === '__activate_edit_mode') setOpen(true);else if (t === '__deactivate_edit_mode') setOpen(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({
      type: '__edit_mode_available'
    }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);
  const dismiss = () => {
    setOpen(false);
    window.parent.postMessage({
      type: '__edit_mode_dismissed'
    }, '*');
  };
  const onDragStart = e => {
    const panel = dragRef.current;
    if (!panel) return;
    const r = panel.getBoundingClientRect();
    const sx = e.clientX,
      sy = e.clientY;
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    const move = ev => {
      offsetRef.current = {
        x: startRight - (ev.clientX - sx),
        y: startBottom - (ev.clientY - sy)
      };
      clampToViewport();
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, __TWEAKS_STYLE), /*#__PURE__*/React.createElement("div", {
    ref: dragRef,
    className: "twk-panel",
    "data-omelette-chrome": "",
    style: {
      right: offsetRef.current.x,
      bottom: offsetRef.current.y
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-hd",
    onMouseDown: onDragStart
  }, /*#__PURE__*/React.createElement("b", null, title), /*#__PURE__*/React.createElement("button", {
    className: "twk-x",
    "aria-label": "Close tweaks",
    onMouseDown: e => e.stopPropagation(),
    onClick: dismiss
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "twk-body"
  }, children)));
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TweakSection({
  label,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "twk-sect"
  }, label), children);
}
function TweakRow({
  label,
  value,
  children,
  inline = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: inline ? 'twk-row twk-row-h' : 'twk-row'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label), value != null && /*#__PURE__*/React.createElement("span", {
    className: "twk-val"
  }, value)), children);
}

// ── Controls ────────────────────────────────────────────────────────────────

function TweakSlider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label,
    value: `${value}${unit}`
  }, /*#__PURE__*/React.createElement("input", {
    type: "range",
    className: "twk-slider",
    "aria-label": label,
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange(Number(e.target.value))
  }));
}
function TweakToggle({
  label,
  value,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-row twk-row-h"
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-lbl"
  }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "twk-toggle",
    "data-on": value ? '1' : '0',
    role: "switch",
    "aria-checked": !!value,
    onClick: () => onChange(!value)
  }, /*#__PURE__*/React.createElement("i", null)));
}
function TweakRadio({
  label,
  value,
  options,
  onChange
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  // The active value is read by pointer-move handlers attached for the lifetime
  // of a drag — ref it so a stale closure doesn't fire onChange for every move.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  // Segments wrap mid-word once per-segment width runs out. The track is
  // ~248px (280 panel − 28 body pad − 4 seg pad), each button loses 12px
  // to its own padding, and 11.5px system-ui averages ~6.3px/char — so 2
  // options fit ~16 chars each, 3 fit ~10. Past that (or >3 options), fall
  // back to a dropdown rather than wrap.
  const labelLen = o => String(typeof o === 'object' ? o.label : o).length;
  const maxLen = options.reduce((m, o) => Math.max(m, labelLen(o)), 0);
  const fitsAsSegments = maxLen <= ({
    2: 16,
    3: 10
  }[options.length] ?? 0);
  if (!fitsAsSegments) {
    // <select> emits strings — map back to the original option value so the
    // fallback stays type-preserving (numbers, booleans) like the segment path.
    const resolve = s => {
      const m = options.find(o => String(typeof o === 'object' ? o.value : o) === s);
      return m === undefined ? s : typeof m === 'object' ? m.value : m;
    };
    return /*#__PURE__*/React.createElement(TweakSelect, {
      label: label,
      value: value,
      options: options,
      onChange: s => onChange(resolve(s))
    });
  }
  const opts = options.map(o => typeof o === 'object' ? o : {
    value: o,
    label: o
  });
  const idx = Math.max(0, opts.findIndex(o => o.value === value));
  const n = opts.length;
  const segAt = clientX => {
    const r = trackRef.current.getBoundingClientRect();
    const inner = r.width - 4;
    const i = Math.floor((clientX - r.left - 2) / inner * n);
    return opts[Math.max(0, Math.min(n - 1, i))].value;
  };
  const onPointerDown = e => {
    setDragging(true);
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    const move = ev => {
      if (!trackRef.current) return;
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    const up = () => {
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    role: "radiogroup",
    onPointerDown: onPointerDown,
    className: dragging ? 'twk-seg dragging' : 'twk-seg'
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-seg-thumb",
    style: {
      left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
      width: `calc((100% - 4px) / ${n})`
    }
  }), opts.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "radio",
    "aria-checked": o.value === value
  }, o.label))));
}
function TweakSelect({
  label,
  value,
  options,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("select", {
    className: "twk-field",
    "aria-label": label,
    value: value,
    onChange: e => onChange(e.target.value)
  }, options.map(o => {
    const v = typeof o === 'object' ? o.value : o;
    const l = typeof o === 'object' ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: v,
      value: v
    }, l);
  })));
}
function TweakText({
  label,
  value,
  placeholder,
  onChange
}) {
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("input", {
    className: "twk-field",
    type: "text",
    "aria-label": label,
    value: value,
    placeholder: placeholder,
    onChange: e => onChange(e.target.value)
  }));
}
function TweakNumber({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange
}) {
  const clamp = n => {
    if (min != null && n < min) return min;
    if (max != null && n > max) return max;
    return n;
  };
  const startRef = React.useRef({
    x: 0,
    val: 0
  });
  const onScrubStart = e => {
    e.preventDefault();
    startRef.current = {
      x: e.clientX,
      val: value
    };
    const decimals = (String(step).split('.')[1] || '').length;
    const move = ev => {
      const dx = ev.clientX - startRef.current.x;
      const raw = startRef.current.val + dx * step;
      const snapped = Math.round(raw / step) * step;
      onChange(clamp(Number(snapped.toFixed(decimals))));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "twk-num"
  }, /*#__PURE__*/React.createElement("span", {
    className: "twk-num-lbl",
    onPointerDown: onScrubStart
  }, label), /*#__PURE__*/React.createElement("input", {
    type: "number",
    "aria-label": label,
    value: value,
    min: min,
    max: max,
    step: step,
    onChange: e => onChange(clamp(Number(e.target.value)))
  }), unit && /*#__PURE__*/React.createElement("span", {
    className: "twk-num-unit"
  }, unit));
}

// Relative-luminance contrast pick — checkmarks drawn over a swatch need to
// read on both #111 and #fafafa without per-option configuration. Hex input
// only (#rgb / #rrggbb); named or rgb()/hsl() colors fall through to "light".
function __twkIsLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, c => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = n >> 16 & 255,
    g = n >> 8 & 255,
    b = n & 255;
  return r * 299 + g * 587 + b * 114 > 148000;
}
const __TwkCheck = ({
  light
}) => /*#__PURE__*/React.createElement("svg", {
  viewBox: "0 0 14 14",
  "aria-hidden": "true"
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.2",
  fill: "none",
  strokeWidth: "2.2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  stroke: light ? 'rgba(0,0,0,.78)' : '#fff'
}));

// TweakColor — curated color/palette picker. Each option is either a single
// hex string or an array of 1-5 hex strings; the card adapts — a lone color
// renders solid, a palette renders colors[0] as the hero (left ~2/3) with the
// rest stacked in a sharp column on the right. onChange emits the
// option in the shape it was passed (string stays string, array stays array).
// Without options it falls back to the native color input for back-compat.
function TweakColor({
  label,
  value,
  options,
  onChange
}) {
  if (!options || !options.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "twk-row twk-row-h"
    }, /*#__PURE__*/React.createElement("div", {
      className: "twk-lbl"
    }, /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("input", {
      type: "color",
      className: "twk-swatch",
      "aria-label": label,
      value: value,
      onChange: e => onChange(e.target.value)
    }));
  }
  // Native <input type=color> emits lowercase hex per the HTML spec, so
  // compare case-insensitively. String() guards JSON.stringify(undefined),
  // which returns the primitive undefined (no .toLowerCase).
  const key = o => String(JSON.stringify(o)).toLowerCase();
  const cur = key(value);
  return /*#__PURE__*/React.createElement(TweakRow, {
    label: label
  }, /*#__PURE__*/React.createElement("div", {
    className: "twk-chips",
    role: "radiogroup"
  }, options.map((o, i) => {
    const colors = Array.isArray(o) ? o : [o];
    const [hero, ...rest] = colors;
    const sup = rest.slice(0, 4);
    const on = key(o) === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: "twk-chip",
      role: "radio",
      "aria-checked": on,
      "data-on": on ? '1' : '0',
      "aria-label": colors.join(', '),
      title: colors.join(' · '),
      style: {
        background: hero
      },
      onClick: () => onChange(o)
    }, sup.length > 0 && /*#__PURE__*/React.createElement("span", null, sup.map((c, j) => /*#__PURE__*/React.createElement("i", {
      key: j,
      style: {
        background: c
      }
    }))), on && /*#__PURE__*/React.createElement(__TwkCheck, {
      light: __twkIsLight(hero)
    }));
  })));
}
function TweakButton({
  label,
  onClick,
  secondary = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: secondary ? 'twk-btn secondary' : 'twk-btn',
    onClick: onClick
  }, label);
}
Object.assign(window, {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRow,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakSelect,
  TweakText,
  TweakNumber,
  TweakColor,
  TweakButton
});
;
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Kunju Expert — main app (v2: 5 languages, audio, translation, filters, favorites, mixed quiz, highlight) */
const {
  useState,
  useEffect,
  useRef,
  useMemo
} = React;
const LANG_ORDER = ["de", "es", "en", "nl", "fr"];
// User-chosen language-tile order. order[0] is the language the app opens with.
function langOrder() {
  const saved = recall("kunju-langorder", null);
  if (!Array.isArray(saved)) return LANG_ORDER.slice();
  const valid = saved.filter(c => LANG_ORDER.includes(c));
  LANG_ORDER.forEach(c => { if (!valid.includes(c)) valid.push(c); });
  return valid.length ? valid : LANG_ORDER.slice();
}
function moveLangToFront(code) {
  const next = [code, ...langOrder().filter(c => c !== code)];
  persist("kunju-langorder", next);
  return next;
}
const LANG_META = {
  de: {
    code: "DE",
    color: "#ff3b5c"
  },
  es: {
    code: "ES",
    color: "#ff9f0a"
  },
  en: {
    code: "EN",
    color: "#0a84ff"
  },
  nl: {
    code: "NL",
    color: "#30c95a"
  },
  fr: {
    code: "FR",
    color: "#1b1813"
  }
};
const RAINBOW = ["#ff3b5c", "#ff7a18", "#ffc400", "#34c759", "#00bcd4", "#0a84ff", "#a557ff", "#ff5ea8"];

/* Per-(learning-)language hero claim — in the TARGET language, not the UI language. */
const HERO_CLAIM = {
  de: {
    pre: "Sprich ",
    lng: "Deutsch",
    accent: "souverän.",
    c2: "#ff7a18"
  },
  es: {
    pre: "¡Habla ",
    lng: "español",
    accent: "con confianza!",
    c2: "#ff5ea8"
  },
  en: {
    pre: "Speak ",
    lng: "English",
    accent: "with confidence",
    c2: "#00bcd4"
  },
  nl: {
    pre: "Spreek ",
    lng: "Nederlands",
    accent: "met vertrouwen",
    c2: "#00bcd4"
  },
  fr: {
    pre: "Parle ",
    lng: "français",
    accent: "avec assurance",
    c2: "#ff5ea8"
  }
};
const HERO_CONFETTI = [{
  top: 12,
  left: 22,
  w: 7,
  h: 7,
  rot: 18,
  o: 1
}, {
  top: 26,
  left: "82%",
  w: 18,
  h: 6,
  rot: -22,
  o: 1
}, {
  top: 58,
  left: 16,
  w: 16,
  h: 5,
  rot: 35,
  o: 0.9
}, {
  top: 16,
  left: "58%",
  w: 6,
  h: 6,
  rot: 0,
  o: 0.9
}, {
  top: 104,
  left: "90%",
  w: 8,
  h: 8,
  rot: 25,
  o: 0.85
}, {
  top: 132,
  left: 26,
  w: 13,
  h: 5,
  rot: -14,
  o: 0.8
}];

/* Short formation hints for regular verbs, per language + tense id (memory aid). */
const TENSE_HINTS = {
  es: {
    present: "-o · -as/-es",
    imperfect: "-aba / -ía",
    past: "-é·-aste·-ó",
    perfect: "he + -ado/-ido",
    pluperfect: "había + -ado/-ido",
    future: "Inf. + -é",
    subjunctive: "-e / -a",
    subjunctiveImp: "-ara / -iera",
    conditional: "Inf. + -ía",
    imperative: "¡-a! / ¡-e!",
    continuous: "estoy + -ando/-iendo",
    continuousPerfect: "he estado + -ndo",
    gerund: "-ando / -iendo",
    participle: "-ado / -ido"
  },
  en: {
    present: "base (+ -s)",
    presentCont: "am/is/are + -ing",
    past: "-ed",
    pastCont: "was/were + -ing",
    perfect: "have + -ed",
    perfectCont: "have been + -ing",
    pluperfect: "had + -ed",
    future: "will + base",
    subjunctive: "base form",
    conditional: "would + base",
    imperative: "base!",
    gerund: "-ing"
  },
  de: {
    present: "-e · -st · -t",
    past: "-te",
    perfect: "haben/sein + ge-…-t",
    pluperfect: "hatte/war + ge-…-t",
    future: "werden + Inf.",
    subjunctive: "würde + Inf.",
    subjunctive1: "-e · -est · -e",
    conditional: "würde + Inf.",
    imperative: "Stamm!",
    gerund: "-end"
  },
  fr: {
    present: "-e·-es·-e / -is",
    past: "-ais",
    perfect: "avoir/être + -é",
    pluperfect: "avais + -é",
    future: "Inf. + -ai",
    subjunctive: "-e",
    conditional: "Inf. + -ais",
    conditionalPast: "aurais + -é",
    imperative: "-e !",
    gerund: "-ant"
  },
  nl: {
    present: "- / -t",
    past: "-te / -de",
    perfect: "hebben/zijn + ge-…",
    pluperfect: "had + ge-…",
    future: "zullen + Inf.",
    subjunctive: "-e",
    conditional: "zou + Inf.",
    imperative: "stam!",
    gerund: "-end"
  }
};
function tenseHint(lang, id) {
  return (TENSE_HINTS[lang] || {})[id] || "";
}
/* For tenses whose regular endings change per person, a single fixed hint
   (e.g. FR "-ais", DE "-te") mismatches the shown form. Derive the ending that
   matches THIS form from the answer's suffix. `pre` is the prefix shown before
   the ending. Falls back to the static tenseHint when nothing matches. */
const PERSON_ENDINGS = {
  fr: {
    past: {
      pre: "-",
      ends: ["ais", "ait", "ions", "iez", "aient"]
    },
    conditional: {
      pre: "Inf. + -",
      ends: ["ais", "ait", "ions", "iez", "aient"]
    },
    future: {
      pre: "Inf. + -",
      ends: ["ai", "as", "ons", "ez", "ont", "a"]
    }
  },
  es: {
    imperfect: {
      pre: "-",
      ends: ["ábamos", "abais", "aban", "abas", "aba", "íamos", "íais", "ían", "ías", "ía"]
    },
    future: {
      pre: "Inf. + -",
      ends: ["emos", "éis", "án", "ás", "é", "á"]
    },
    conditional: {
      pre: "Inf. + -",
      ends: ["íamos", "íais", "ían", "ías", "ía"]
    }
  },
  de: {
    present: {
      pre: "-",
      ends: ["en", "st", "t", "e"]
    },
    past: {
      pre: "-",
      ends: ["test", "tet", "ten", "te"]
    }
  },
  nl: {
    present: {
      pre: "-",
      ends: ["en", "t"]
    },
    past: {
      pre: "-",
      ends: ["ten", "den", "te", "de"]
    }
  }
};
function quizHint(lang, q) {
  const cfg = q && PERSON_ENDINGS[lang] && PERSON_ENDINGS[lang][q.tenseId];
  if (cfg && q.answer) {
    const a = q.answer.toLowerCase().trim();
    let best = "";
    cfg.ends.forEach(e => {
      if (a.endsWith(e) && e.length > best.length) best = e;
    });
    if (best) return cfg.pre + best;
  }
  return tenseHint(lang, q ? q.tenseId : null);
}
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
  ser: {
    de: "Dauerhaft & Identität · ≠ estar (Zustand/Ort)",
    en: "Permanent & identity · ≠ estar (state/place)",
    es: "Permanente & identidad · ≠ estar (estado/lugar)",
    nl: "Permanent & identiteit · ≠ estar (staat/locatie)",
    fr: "Permanent & identité · ≠ estar (état/lieu)"
  },
  estar: {
    de: "Zustand, Befindlichkeit & Ort · ≠ ser (Identität)",
    en: "State, feeling & location · ≠ ser (identity)",
    es: "Estado, sentimiento & ubicación · ≠ ser (identidad)",
    nl: "Toestand & locatie · ≠ ser (identiteit)",
    fr: "État & lieu · ≠ ser (identité)"
  },
  gustar: {
    de: "Konstr.: me gusta/gustan · Subjekt = das Gemochte",
    en: "Constr.: me gusta/gustan · subject = what is liked",
    es: "Constr.: me gusta/gustan · sujeto = lo que gusta",
    nl: "Constr.: me gusta/gustan · onderwerp = het gewaardeerde",
    fr: "Constr.: me gusta/gustan · sujet = ce qui plaît"
  }
};
const ES_GUSTAR_VERBS = new Set(["gustar", "encantar", "molestar", "faltar", "doler", "interesar", "parecer", "importar", "quedar", "sorprender", "aburrir", "preocupar", "apetecer", "convenir"]);
/* Group each tense into a mood/family for headers + ordering. */
const TENSE_GROUP = {
  present: "ind",
  imperfect: "ind",
  past: "ind",
  presentCont: "ind",
  pastCont: "ind",
  perfect: "ind",
  perfectCont: "ind",
  pluperfect: "ind",
  future: "ind",
  subjunctive: "subj",
  subjunctive1: "subj",
  subjunctiveImp: "subj",
  conditional: "cond",
  conditionalPast: "cond",
  imperative: "imp",
  continuous: "cont",
  continuousPerfect: "cont",
  gerund: "forms",
  participle: "forms"
};
const GROUP_ORDER = ["ind", "subj", "cond", "imp", "cont", "forms"];
function tenseGroup(id) {
  return TENSE_GROUP[id] || "ind";
}
function QModeIcon({
  id
}) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };
  if (id === "cards") return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", _extends({
    x: "3",
    y: "6",
    width: "13",
    height: "15",
    rx: "2.5"
  }, p)), /*#__PURE__*/React.createElement("path", _extends({
    d: "M8 3.5h9.5A2.5 2.5 0 0 1 20 6v12"
  }, p)));
  if (id === "choice") return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", _extends({
    x: "3.5",
    y: "4.5",
    width: "17",
    height: "6",
    rx: "3"
  }, p)), /*#__PURE__*/React.createElement("rect", _extends({
    x: "3.5",
    y: "13.5",
    width: "17",
    height: "6",
    rx: "3"
  }, p)), /*#__PURE__*/React.createElement("circle", {
    cx: "16.5",
    cy: "16.5",
    r: "1.4",
    fill: "currentColor",
    stroke: "none"
  }));
  if (id === "type") return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", _extends({
    x: "2.5",
    y: "6",
    width: "19",
    height: "12",
    rx: "2.5"
  }, p)), /*#__PURE__*/React.createElement("path", _extends({
    d: "M7 10h.01M11 10h.01M15 10h.01M8 14h8"
  }, p)));
  if (id === "speed") return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", _extends({
    d: "M13 2 4 14h7l-1 8 9-12h-7z"
  }, p)));
  if (id === "speak") return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", _extends({
    x: "9",
    y: "3",
    width: "6",
    height: "11",
    rx: "3"
  }, p)), /*#__PURE__*/React.createElement("path", _extends({
    d: "M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"
  }, p)));
  if (id === "texte") return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "24",
    height: "24",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", _extends({
    d: "M12 6.5C10.5 5 8 4.5 4.5 4.8V18c3.5-.3 6 .2 7.5 1.7"
  }, p)), /*#__PURE__*/React.createElement("path", _extends({
    d: "M12 6.5C13.5 5 16 4.5 19.5 4.8V18c-3.5-.3-6 .2-7.5 1.7"
  }, p)));
  return null;
}
function TenseDropdown({
  lang,
  tenses,
  isOn,
  onToggle,
  onAll,
  onNone,
  single,
  onClose,
  hideLbl
}) {
  const [open, setOpen] = useState(false);
  const onCount = tenses.filter(t => isOn(t.id)).length;
  const cur = single ? (tenses.find(t => isOn(t.id)) || {}).label : null;
  const summary = single ? cur || "—" : onCount === tenses.length || onCount === 0 ? tr("all_tenses") : onCount + " / " + tenses.length;
  return /*#__PURE__*/React.createElement("div", {
    className: "tdwrap",
    style: {
      "--lc": LANG_META[lang].color
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "tdbtn" + (open ? " open" : ""),
    onClick: () => setOpen(o => !o)
  }, !hideLbl && /*#__PURE__*/React.createElement("span", {
    className: "tdbtn-lbl"
  }, tr("tense_word")), /*#__PURE__*/React.createElement("span", {
    className: "tdbtn-sum"
  }, summary), /*#__PURE__*/React.createElement("span", {
    className: "tdbtn-caret"
  }, open ? "▴" : "▾")), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "tdbackdrop",
    onClick: () => setOpen(false)
  }), /*#__PURE__*/React.createElement("div", {
    className: "tdmenu"
  }, !single && /*#__PURE__*/React.createElement("div", {
    className: "tdactions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "tdaction",
    onClick: onAll
  }, "\u2713 ", tr("all_btn")), /*#__PURE__*/React.createElement("button", {
    className: "tdaction",
    onClick: onNone
  }, "\u2715 ", tr("none_btn"))), /*#__PURE__*/React.createElement("div", {
    className: "tdlist"
  }, tenses.map((t, i) => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    className: "tditem" + (isOn(t.id) ? " on" : ""),
    style: {
      "--cc": RAINBOW[i % RAINBOW.length]
    },
    onClick: () => {
      onToggle(t.id);
      if (single) setOpen(false);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tdcheck"
  }, isOn(t.id) ? "✓" : ""), /*#__PURE__*/React.createElement("span", {
    className: "tdlabel"
  }, t.label)))))));
}
function OneDropdown({
  lang,
  options,
  valueId,
  onPick
}) {
  const [open, setOpen] = useState(false);
  const cur = (options.find(o => o.id === valueId) || options[0] || {}).label;
  return /*#__PURE__*/React.createElement("div", {
    className: "tdwrap",
    style: {
      "--lc": LANG_META[lang].color
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "tdbtn" + (open ? " open" : ""),
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", {
    className: "tdbtn-sum"
  }, cur), /*#__PURE__*/React.createElement("span", {
    className: "tdbtn-caret"
  }, open ? "▴" : "▾")), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "tdbackdrop",
    onClick: () => setOpen(false)
  }), /*#__PURE__*/React.createElement("div", {
    className: "tdmenu"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tdlist"
  }, options.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.id,
    className: "tditem" + (valueId === o.id ? " on" : ""),
    style: {
      "--cc": "var(--lc)"
    },
    onClick: () => {
      onPick(o.id);
      setOpen(false);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "tdcheck"
  }, valueId === o.id ? "✓" : ""), /*#__PURE__*/React.createElement("span", {
    className: "tdlabel"
  }, o.label)))))));
}
function MultiDropdown({
  lang,
  options,
  isOn,
  onToggle,
  onAll,
  onNone,
  onAdd,
  onRemove,
  removable
}) {
  const [open, setOpen] = useState(false);
  const [newVal, setNewVal] = useState("");
  function commitAdd() {
    const v = newVal.trim();
    if (!v || !onAdd) return;
    onAdd(v);
    setNewVal("");
  }
  const onCount = options.filter(o => isOn(o.id)).length;
  const summary = onCount === options.length || onCount === 0 ? tr("all_themes") : onCount + " / " + options.length;
  return /*#__PURE__*/React.createElement("div", {
    className: "tdwrap",
    style: {
      "--lc": LANG_META[lang].color
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "tdbtn" + (open ? " open" : ""),
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", {
    className: "tdbtn-sum"
  }, summary), /*#__PURE__*/React.createElement("span", {
    className: "tdbtn-caret"
  }, open ? "▴" : "▾")), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "tdbackdrop",
    onClick: () => setOpen(false)
  }), /*#__PURE__*/React.createElement("div", {
    className: "tdmenu"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tdactions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "tdaction",
    onClick: onAll
  }, "\u2713 ", tr("all_btn")), /*#__PURE__*/React.createElement("button", {
    className: "tdaction",
    onClick: onNone
  }, "\u2715 ", tr("none_btn"))), /*#__PURE__*/React.createElement("div", {
    className: "tdlist"
  }, options.map(o => /*#__PURE__*/React.createElement("div", {
    key: o.id,
    className: "tditem-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "tditem" + (isOn(o.id) ? " on" : ""),
    style: {
      "--cc": "var(--lc)"
    },
    onClick: () => onToggle(o.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "tdcheck"
  }, isOn(o.id) ? "✓" : ""), /*#__PURE__*/React.createElement("span", {
    className: "tdlabel"
  }, o.label)), onRemove && removable && removable(o.id) ? /*#__PURE__*/React.createElement("button", {
    className: "tdremove",
    "aria-label": tr("ios_close"),
    onClick: e => {
      e.stopPropagation();
      onRemove(o.id);
    }
  }, "✕") : null)), onAdd ? /*#__PURE__*/React.createElement("div", {
    className: "tdadd"
  }, /*#__PURE__*/React.createElement("input", {
    className: "tdadd-input",
    value: newVal,
    placeholder: tr("theme_add_ph"),
    maxLength: 40,
    onChange: e => setNewVal(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") commitAdd();
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "tdadd-btn",
    disabled: !newVal.trim(),
    onClick: commitAdd
  }, "+ ", tr("theme_add"))) : null))));
}

/* 5 most important irregular verbs per language (for the Learn overview). */
const IRR_TOP = {
  es: ["ser", "estar", "tener", "hacer", "ir", "haber", "poder", "decir"],
  en: ["be", "have", "do", "go", "say", "get", "make", "know"],
  de: ["sein", "haben", "werden", "gehen", "kommen", "geben", "nehmen", "wissen"],
  fr: ["être", "avoir", "aller", "faire", "pouvoir", "vouloir", "venir", "prendre"],
  nl: ["zijn", "hebben", "gaan", "doen", "komen", "zien", "geven", "nemen"]
};
/* A reliably-regular sample verb per language, for showing the regular pattern. */
const REG_SAMPLE = {
  es: "hablar",
  en: "work",
  de: "machen",
  fr: "parler",
  nl: "werken"
};
function persist(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {}
}
function recall(k, d) {
  try {
    const v = localStorage.getItem(k);
    return v == null ? d : JSON.parse(v);
  } catch (e) {
    return d;
  }
}
/* Reset quiz scores once per browser session (so each session starts fresh). */
try {
  if (!sessionStorage.getItem("kunju-sess")) {
    Object.keys(localStorage).filter(k => k.indexOf("kunju-score-") === 0).forEach(k => localStorage.removeItem(k));
    sessionStorage.setItem("kunju-sess", "1");
  }
} catch (e) {}

/* UI localization: driven by mother tongue (only the 5 app langs; else English). */
const NATIVE_TO_UI = {
  German: "de",
  English: "en",
  Spanish: "es",
  Dutch: "nl",
  French: "fr"
};
function uiFromNative(n) {
  return NATIVE_TO_UI[n] || "en";
}
/* Guess the learner's mother tongue from the browser so the very first screen
   isn't in a language they can't read. Falls back to English. */
function detectNative() {
  const map = {
    de: "German",
    en: "English",
    es: "Spanish",
    nl: "Dutch",
    fr: "French",
    it: "Italian",
    pt: "Portuguese",
    pl: "Polish",
    tr: "Turkish",
    ru: "Russian",
    ar: "Arabic",
    zh: "Chinese"
  };
  try {
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    for (const l of langs) {
      const code = String(l).slice(0, 2).toLowerCase();
      if (map[code]) return map[code];
    }
  } catch (e) {}
  return "English";
}
let UILANG = "en";
function tr(k, vars) {
  const dict = window.UI && window.UI[UILANG] || window.UI && window.UI.en || {};
  let s = dict[k] != null ? dict[k] : (window.UI && window.UI.en[k]) != null ? window.UI.en[k] : k;
  if (vars) Object.keys(vars).forEach(p => {
    s = s.split("{" + p + "}").join(vars[p]);
  });
  return s;
}
function savedVoiceURI(base) {
  try {
    return localStorage.getItem("kunju-voice-" + base) || "";
  } catch (e) {
    return "";
  }
}
function setSavedVoice(base, uri) {
  try {
    uri ? localStorage.setItem("kunju-voice-" + base, uri) : localStorage.removeItem("kunju-voice-" + base);
  } catch (e) {}
}
function savedGender(base) {
  try {
    return localStorage.getItem("kunju-voicegender-" + base) || "";
  } catch (e) {
    return "";
  }
}
function setSavedGender(base, g) {
  try {
    g ? localStorage.setItem("kunju-voicegender-" + base, g) : localStorage.removeItem("kunju-voicegender-" + base);
  } catch (e) {}
}
// names that signal a higher-quality / more natural voice vs. robotic "compact" ones
const NICE_VOICE = /(neural|natural|enhanced|premium|wavenet|siri|google|amélior|verbessert|mejorad)/i;
const BAD_VOICE = /(compact|eloquence|fred|albert|zarvox|whisper|bad news|good news|bells|trinoids|cellos)/i;
// best-effort gender guess from the voice name (device voices rarely expose gender directly)
const VOICE_F = /(\bfemale\b|weiblich|\bfrau\b|femenin|\bmujer\b|\bvrouw\b|\bfemme\b|m[oó]nica|paulina|marisol|angelina|esperanza|pen[eé]lope|luc[ií]a|\banna\b|petra|helena|marlene|katja|vicki|samantha|karen|moira|tessa|serena|fiona|victoria|allison|\bava\b|susan|\bzoe\b|\bkate\b|catherine|\bnora\b|am[eé]lie|audrey|aur[eé]lie|\bmarie\b|virginie|chantal|\bjulie\b|ellen|claire|femke|laura|sof[ií]a|\bsara\b|in[eé]s|hedda|gisela|seraphina|amala|elvira|abril|dalia|paloma|triana|jenny|aria|michelle|sonia|libby|maisie|emma|denise|eloise|jacqueline|coralie|josephine|colette|fenna|maartje)/i;
const VOICE_M = /(\bmale\b|m[aä]nnlich|\bmann\b|masculin|\bhombre\b|\bman\b|jorge|diego|\bjuan\b|carlos|pablo|enrique|miguel|yannick|markus|\bmartin\b|stefan|boris|conrad|\bhans\b|\bdaniel\b|\balex\b|\bfred\b|\btom\b|aaron|arthur|gordon|oliver|\blee\b|rishi|\balbert\b|thomas|nicolas|mathieu|\bpaul\b|xander|\bbram\b|ruben|maarten|\bluca\b|killian|bernd|christoph|ralf|[aá]lvaro|dario|elias|saul|ryan|guy|\beric\b|brian|liam|henri|jerome|maurten|kasper)/i;
function voiceGender(name) {
  const n = (name || "").toLowerCase();
  if (VOICE_F.test(n)) return "f";
  if (VOICE_M.test(n)) return "m";
  return "";
}
/* Grammatik-Wächter (DE): erkennt den häufigsten KI-Fehler — eine einfache
   Präteritum-Form, die fälschlich in einen Perfekt-/Futur-Rahmen gesetzt wurde
   (z. B. "Haben sie die Karten schon SCHICKTEN?" statt "geschickt"). */
const DE_PERF_AUX = ["habe", "hast", "hat", "haben", "habt", "bin", "bist", "ist", "sind", "seid", "werde", "wirst", "wird", "werden", "werdet"];
function deClozeBadFrame(full, answer) {
  try {
    const s = " " + String(full).toLowerCase().replace(/[?!.,;:]/g, " ").replace(/\s+/g, " ") + " ";
    const form = String(answer).toLowerCase().trim();
    if (!form || form.indexOf(" ") >= 0) return false; // nur einfache (einwortige) Formen
    const fi = s.indexOf(" " + form + " ");
    if (fi < 0) return false;
    // Ein Perfekt/Futur-Hilfsverb VOR der einfachen Form → der Satz erwartet ein
    // Partizip/Infinitiv, nicht die Präteritum-Form. Das ist der Fehler.
    return DE_PERF_AUX.some(a => { const ai = s.indexOf(" " + a + " "); return ai >= 0 && ai < fi; });
  } catch (e) { return false; }
}
// Deterministische, immer grammatikalisch korrekte Beispiel-Vorlage (Fallback).
function deClozeTemplate(qq) {
  try {
    const ans = String(qq.answer || "").trim();
    let pron = String(qq.pronoun || "").split("/")[0].trim();
    if (!ans || !pron) return null;
    const cap = pron.charAt(0).toUpperCase() + pron.slice(1);
    const full = cap + " " + ans + ".";
    const gap = full.replace(ans, "…");
    return { full, gap, native: "" };
  } catch (e) { return null; }
}
// turn a raw device-voice name into a short, friendly label (mostly just the first name)
function cleanVoiceName(name) {
  let s = String(name || "");
  s = s.replace(/\([^)]*\)/g, " "); // drop "(Enhanced)" etc.
  s = s.replace(/\b(microsoft|google|apple|siri|amazon|online|offline|natural|neural|enhanced|premium|compact|voice|stimme)\b/gi, " ");
  s = s.replace(/\b(deutsch|german|englisch|english|spanisch|spanish|espa[nñ]ol|franz[oö]sisch|french|fran[cç]ais|niederl[aä]ndisch|dutch|nederlands)\b/gi, " ");
  s = s.replace(/[-–—,:].*/, " "); // keep the part before a dash/comma
  s = s.replace(/\s+/g, " ").trim();
  if (s.length < 2) s = String(name || "").replace(/\s+/g, " ").trim();
  return s.length > 13 ? s.slice(0, 12) + "…" : s;
}
function pickVoice(lang) {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;
  const lc = (lang || "").toLowerCase(),
    base = lc.split("-")[0];
  // honour a specific chosen voice first
  const pref = savedVoiceURI(base);
  if (pref) {
    const pv = voices.find(v => v.voiceURI === pref);
    if (pv) return pv;
  }
  const exact = voices.filter(v => (v.lang || "").toLowerCase() === lc);
  const baseM = voices.filter(v => (v.lang || "").toLowerCase().split("-")[0] === base);
  let pool = exact.length ? exact : baseM;
  if (!pool.length) return null;
  // narrow to the requested gender; if none is detected by name, at least avoid the opposite gender.
  // Default to a female voice when the user hasn't explicitly chosen one (Auto) — softly: if no
  // female voice exists we keep the full pool so the best available voice is still used.
  const gender = savedGender(base) || "f";
  if (gender) {
    const gm = pool.filter(v => voiceGender(v.name) === gender);
    if (gm.length) {
      pool = gm;
    } else {
      const other = gender === "f" ? "m" : "f";
      const notOther = pool.filter(v => voiceGender(v.name) !== other);
      if (notOther.length) pool = notOther;
    }
  }
  // prefer natural-sounding voices, penalise robotic/novelty ones; local & default break ties
  const rank = v => (NICE_VOICE.test(v.name) ? 4 : 0) + (BAD_VOICE.test(v.name) ? -4 : 0) + (v.localService ? 1 : 0) + (v.default ? 1 : 0);
  return pool.slice().sort((a, b) => rank(b) - rank(a))[0];
}
let TTS_RATE = 1.0;
try {
  const _r = parseFloat(localStorage.getItem("kunju-ttsrate"));
  if (_r) TTS_RATE = _r;
} catch (e) {}
function applyTtsRate(r) {
  TTS_RATE = r;
  try {
    localStorage.setItem("kunju-ttsrate", String(r));
  } catch (e) {}
}
function speak(text, lang) {
  if (!window.speechSynthesis || !text || text === "—") return;
  try {
    const clean = String(text).replace(/…/g, " ").replace(/\s+/g, " ").trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = lang;
    u.rate = TTS_RATE;
    const v = pickVoice(lang);
    if (v) {
      u.voice = v;
      u.lang = v.lang;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) {}
}
// read a whole story aloud, queued sentence by sentence (reliable for long texts)
function speakStory(sents, lang) {
  if (!window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {}
  const v = pickVoice(lang);
  (sents || []).forEach(txt => {
    const clean = String(txt || "").replace(/…/g, " ").replace(/\s+/g, " ").trim();
    if (!clean) return;
    try {
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = v && v.lang || lang;
      u.rate = TTS_RATE;
      if (v) u.voice = v;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  });
}
// small stable hash for caching a story's translation by content + native language
function strHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = h * 31 + s.charCodeAt(i) | 0;
  }
  return (h >>> 0).toString(36);
}
// warm up the voice list (some browsers load it asynchronously)
if (window.speechSynthesis) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  } catch (e) {}
}
const esc = s => (s || "").replace(/[<>&]/g, c => ({
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;"
})[c]);
function diffHTML(actual, baseline) {
  if (!baseline || actual === baseline || actual === "—") return esc(actual);
  const a = actual,
    b = baseline;
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let s = 0;
  while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  const mid = a.slice(p, a.length - s);
  if (!mid) return esc(actual);
  return esc(a.slice(0, p)) + '<mark class="irrmark">' + esc(mid) + "</mark>" + esc(a.slice(a.length - s));
}
function suggestionsFor(lang) {
  const eng = window.CONJ[lang];
  const set = new Set(eng.samples);
  const tr = window.TRANS[lang];
  if (tr) Object.keys(tr).forEach(k => set.add(k));
  return Array.from(set).sort();
}

/* ---------- Reverse lookup / deconjugation ----------
   Type an inflected form ("siendo", "hago", "ging", "fui") and find which
   infinitive + person + tense it belongs to, by enumerating a pool of known
   verbs and matching every conjugated form. Catches the irregular forms that
   are impossible to reverse-engineer by eye. */
function deburr(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function infBase(langCode, inf) {
  return (inf || "").replace(/^to /, "").trim().toLowerCase();
}

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
  es: ["abandonar", "acabar", "acompañar", "alcanzar", "animar", "apoyar", "aprovechar", "avisar", "borrar", "calcular", "celebrar", "cenar", "cobrar", "comentar", "comunicar", "considerar", "controlar", "crear", "cruzar", "cuidar", "dedicar", "dudar", "echar", "eliminar", "empujar", "entregar", "entrenar", "evitar", "expresar", "formar", "golpear", "imaginar", "importar", "indicar", "informar", "intentar", "inventar", "juntar", "levantar", "lograr", "luchar", "manejar", "mencionar", "molestar", "montar", "observar", "ordenar", "pelear", "perdonar", "preparar", "presentar", "quemar", "quitar", "realizar", "regresar", "reparar", "reservar", "respetar", "respirar", "saludar", "salvar", "secar", "separar", "sumar", "superar", "tirar", "tratar", "votar"],
  de: ["abholen", "aufräumen", "bauen", "bedeuten", "begrüßen", "beobachten", "bezahlen", "bilden", "buchen", "decken", "drehen", "drücken", "erlauben", "erreichen", "fehlen", "feiern", "fühlen", "füllen", "gründen", "heiraten", "kämpfen", "liefern", "loben", "melden", "mischen", "nutzen", "ordnen", "prüfen", "sorgen", "tauschen", "teilen", "töten", "trennen", "verletzen", "vermieten", "verpassen", "verstecken", "vertrauen", "vorbereiten", "wundern", "zählen", "zerstören", "beenden", "bemerken", "betonen", "bewerten", "bedienen"],
  en: ["agree", "attack", "bake", "behave", "blame", "borrow", "breathe", "brush", "burn", "celebrate", "charge", "cheer", "connect", "consider", "contain", "cough", "crash", "cry", "decorate", "discover", "discuss", "divide", "dress", "expect", "explore", "fail", "gather", "greet", "guess", "hate", "heat", "hire", "hunt", "imagine", "improve", "increase", "introduce", "invite", "kick", "knock", "lift", "manage", "mark", "measure", "mention", "mix", "name", "notice", "paint", "park", "plant", "prepare", "present", "pretend", "prevent", "print", "promise", "protect", "prove", "provide", "raise", "receive", "recognize", "record", "reduce", "refuse", "remove", "repair", "reply", "rescue", "respect", "shout", "sign", "solve", "sort", "spell", "support", "surprise", "survive", "taste", "train", "treat", "trust", "type", "vote", "waste", "whisper", "wrap", "yell"],
  nl: ["bedoelen", "begroeten", "behandelen", "bellen", "bereiden", "beschermen", "betekenen", "boeken", "drukken", "duwen", "filmen", "fluisteren", "huilen", "kammen", "letten", "oefenen", "planten", "poetsen", "regelen", "schilderen", "slepen", "trainen", "vegen", "verbeteren", "vertalen", "wisselen", "zorgen", "afmaken", "bewaren", "controleren", "koppelen", "markeren", "ontmoeten", "registreren", "verzamelen"],
  fr: ["accompagner", "ajouter", "allumer", "amuser", "apprécier", "arrêter", "attraper", "augmenter", "baisser", "bavarder", "briller", "brosser", "brûler", "cacher", "calculer", "cesser", "classer", "coller", "commander", "comparer", "conserver", "consulter", "copier", "coucher", "couper", "crier", "décider", "déclarer", "décorer", "dépenser", "dessiner", "deviner", "discuter", "échouer", "emprunter", "enseigner", "exprimer", "fonctionner", "former", "frapper", "goûter", "habiller", "imaginer", "indiquer", "louer", "mériter", "noter", "pardonner", "pleurer", "poser", "pousser", "prêter", "profiter", "proposer", "ramasser", "refuser", "réparer", "respecter", "retrouver", "sauter", "sembler", "sonner", "souhaiter", "toucher", "tricher", "vérifier", "verser", "voler", "agir", "définir", "établir", "fournir", "guérir", "ralentir", "réunir", "rougir", "salir", "unir"]
};

/* Third batch — large C1-level set of vetted REGULAR verbs. */
const EXTRA_VERBS3 = {
  es: ["acelerar", "aclarar", "acomodar", "acumular", "adaptar", "adelantar", "adoptar", "afectar", "afirmar", "agrupar", "ajustar", "alargar", "aliviar", "alojar", "alterar", "amenazar", "anotar", "anticipar", "anular", "apuntar", "arrancar", "arrastrar", "arriesgar", "asegurar", "asignar", "asociar", "bloquear", "bromear", "calmar", "cancelar", "capturar", "cargar", "castigar", "causar", "citar", "clasificar", "combinar", "compensar", "conectar", "conquistar", "conservar", "contemplar", "contratar", "conversar", "cooperar", "coordinar", "copiar", "cultivar", "declarar", "decorar", "denunciar", "depositar", "derribar", "desarrollar", "designar", "destacar", "destinar", "detallar", "determinar", "dialogar", "disculpar", "diseñar", "disparar", "divorciar", "doblar", "documentar", "dominar", "donar", "ejecutar", "elaborar", "elevar", "embarcar", "emocionar", "emplear", "enamorar", "encajar", "encargar", "enfadar", "enfocar", "enfrentar", "engañar", "ensayar", "enumerar", "equipar", "escalar", "estacionar", "estimar", "estimular", "estirar", "estrenar", "estropear", "examinar", "experimentar", "explorar", "exportar", "expulsar", "fabricar", "facilitar", "fallar", "fascinar", "felicitar", "fijar", "fomentar", "formular", "fracasar", "frenar", "fundar", "generar", "grabar", "heredar", "identificar", "ignorar", "iluminar", "ilustrar", "implicar", "impulsar", "incorporar", "ingresar", "inspirar", "instalar", "integrar", "intercambiar", "interpretar", "investigar", "juzgar", "lamentar", "lanzar", "liberar", "limitar", "localizar", "madurar", "manipular", "memorizar", "mezclar", "modificar", "motivar", "multiplicar", "negociar", "nombrar", "obligar", "ocasionar", "odiar", "orientar", "originar", "otorgar", "participar", "pasear", "penetrar", "pescar", "planear", "plantar", "plantear", "precisar", "premiar", "presionar", "procesar", "proclamar", "procurar", "programar", "progresar", "promocionar", "proporcionar", "protagonizar", "protestar", "provocar", "rascar", "rebajar", "rechazar", "reclamar", "recopilar", "recuperar", "redactar", "reflejar", "reformar", "registrar", "relacionar", "relajar", "rellenar", "rematar", "restaurar", "resultar", "retirar", "retrasar", "revelar", "revisar", "rodear", "saborear", "sancionar", "seleccionar", "señalar", "simular", "solicitar", "solucionar", "soportar", "sospechar", "subrayar", "sujetar", "suplicar", "telefonear", "titular", "tolerar", "trasladar", "triunfar", "valorar", "ventilar", "vibrar", "vigilar", "vincular", "visualizar", "sacudir", "interrumpir", "sobrevivir", "percibir", "resumir", "transmitir", "suprimir"],
  de: ["ändern", "ärgern", "atmen", "beantragen", "bedrohen", "beeinflussen", "befragen", "begleiten", "behaupten", "beleidigen", "belohnen", "berichten", "beruhigen", "beschädigen", "bestrafen", "beteiligen", "betrachten", "bewundern", "blühen", "dichten", "drohen", "ehren", "einkaufen", "entwickeln", "erfüllen", "ergänzen", "erhöhen", "erkundigen", "ermöglichen", "ernähren", "erschöpfen", "erwähnen", "erwarten", "fördern", "freuen", "fürchten", "gehorchen", "genehmigen", "gewöhnen", "glänzen", "hindern", "husten", "klagen", "korrigieren", "kritisieren", "kürzen", "lagern", "leisten", "lenken", "lösen", "malen", "merken", "montieren", "nähen", "nicken", "pflanzen", "pflegen", "plaudern", "präsentieren", "produzieren", "quälen", "rasieren", "rechnen", "reagieren", "reduzieren", "reinigen", "riskieren", "schaden", "schalten", "schminken", "schonen", "servieren", "siegen", "spazieren", "speichern", "spenden", "sperren", "spülen", "stärken", "strafen", "stürzen", "summen", "tanken", "trauern", "tropfen", "überlegen", "überqueren", "überraschen", "übersetzen", "umarmen", "unterrichten", "unterstützen", "verändern", "verbessern", "verbrauchen", "verlangen", "vermuten", "verpacken", "versichern", "versorgen", "verteilen", "verwenden", "verzichten", "warnen", "wechseln", "widmen", "wirken", "würzen", "zaubern", "zelten", "zweifeln"],
  en: ["accomplish", "acquire", "adapt", "address", "adjust", "admire", "advise", "alarm", "amaze", "analyze", "announce", "appreciate", "approach", "approve", "argue", "arrange", "assist", "assume", "attach", "attempt", "attend", "attract", "avoid", "balance", "behave", "belong", "bother", "brake", "brighten", "calculate", "cancel", "capture", "care", "cause", "challenge", "chase", "cheat", "chew", "claim", "clap", "classify", "combine", "comment", "communicate", "compare", "compete", "complain", "concentrate", "conclude", "confirm", "confuse", "congratulate", "conquer", "consist", "contact", "contribute", "control", "convince", "cooperate", "copy", "correct", "cure", "damage", "dare", "declare", "decrease", "defeat", "defend", "define", "delay", "deliver", "demand", "deny", "depend", "deserve", "design", "desire", "destroy", "develop", "disagree", "disappear", "disappoint", "distribute", "disturb", "double", "doubt", "drag", "earn", "educate", "embarrass", "employ", "encourage", "ensure", "entertain", "escape", "examine", "exchange", "exist", "expand", "experience", "express", "extend", "fasten", "film", "fold", "force", "frighten", "gather", "generate", "glance", "govern", "grab", "greet", "handle", "harm", "heal", "hesitate", "identify", "ignore", "illustrate", "imagine", "imitate", "impress", "include", "increase", "indicate", "influence", "inform", "injure", "inspire", "install", "instruct", "intend", "interrupt", "introduce", "invent", "investigate", "involve", "join", "judge", "kiss", "knock", "label", "launch", "link", "list", "locate", "lock", "manage", "manufacture", "march", "measure", "melt", "mend", "mention", "mind", "murder", "obey", "observe", "obtain", "occupy", "offend", "operate", "organize", "owe", "pack", "paint", "participate", "perform", "persuade", "pick", "plant", "please", "point", "polish", "possess", "pour", "practice", "praise", "prefer", "prepare", "present", "preserve", "pretend", "prevent", "produce", "promise", "pronounce", "protect", "provide", "publish", "punish", "realize", "recognize", "recommend", "record", "reduce", "refuse", "regret", "reject", "relate", "relax", "release", "remember", "remind", "remove", "repair", "repeat", "replace", "reply", "report", "represent", "require", "rescue", "respect", "respond", "retire", "reveal", "review", "reward", "rob", "rub", "ruin", "satisfy", "scratch", "seal", "search", "separate", "settle", "shape", "share", "shave", "shout", "sign", "slip", "smell", "solve", "sort", "spell", "spoil", "spray", "squeeze", "stare", "start", "state", "stay", "steer", "stir", "strengthen", "stretch", "study", "succeed", "suffer", "suggest", "supply", "support", "suppose", "surround", "survive", "suspect", "switch", "talk", "taste", "tease", "threaten", "tidy", "tip", "trace", "train", "translate", "travel", "treat", "trust", "type", "unite", "use", "vary", "visit", "vote", "warn", "waste", "weigh", "whisper", "wipe", "wonder", "worry", "wrap", "yawn", "yell"],
  nl: ["aankleden", "aanraken", "afmaken", "antwoorden", "bewaren", "bestuderen", "controleren", "dromen", "fietsen", "filmen", "fluisteren", "groeten", "haasten", "herstellen", "herinneren", "kammen", "kloppen", "koppelen", "letten", "markeren", "melden", "missen", "mompelen", "noemen", "oefenen", "ontmoeten", "ontspannen", "openen", "pakken", "parkeren", "planten", "poetsen", "redden", "regelen", "registreren", "rekenen", "schilderen", "slepen", "sparen", "spelen", "stoppen", "strepen", "tekenen", "tellen", "trainen", "vegen", "verbeteren", "verbranden", "verdienen", "vergroten", "verhuizen", "verkleinen", "vermenigvuldigen", "verminderen", "veroorzaken", "versieren", "vertalen", "verwarmen", "verzamelen", "voorbereiden", "wandelen", "wensen", "wisselen", "zorgen"],
  fr: ["accélérer", "accepter", "accompagner", "accrocher", "accuser", "acheter", "admirer", "adorer", "affirmer", "ajouter", "allumer", "améliorer", "amuser", "analyser", "annoncer", "apercevoir", "apprécier", "approcher", "arrêter", "arroser", "assurer", "attacher", "attaquer", "attraper", "augmenter", "avaler", "avancer", "bâiller", "baisser", "balayer", "bavarder", "blesser", "boucher", "bouger", "briller", "brosser", "brûler", "cacher", "calculer", "calmer", "camper", "casser", "causer", "cesser", "changer", "chanter", "charger", "chasser", "chauffer", "chercher", "classer", "coller", "commander", "comparer", "compléter", "compliquer", "compter", "conserver", "consulter", "continuer", "copier", "corriger", "coucher", "couper", "crier", "critiquer", "cultiver", "danser", "déchirer", "décider", "déclarer", "décorer", "découper", "décrire", "défendre", "dégoûter", "déjeuner", "demander", "démolir", "dépenser", "déranger", "dessiner", "détester", "deviner", "dîner", "diriger", "discuter", "distribuer", "diviser", "donner", "doubler", "durer", "échanger", "échouer", "éclairer", "économiser", "écouter", "effacer", "embrasser", "emmener", "emprunter", "encourager", "enfermer", "enlever", "enseigner", "entourer", "entrer", "envoyer", "épargner", "espérer", "essayer", "essuyer", "étaler", "éteindre", "étonner", "étudier", "éviter", "examiner", "exiger", "expliquer", "exprimer", "fabriquer", "fâcher", "faciliter", "fatiguer", "fermer", "fêter", "filmer", "fixer", "former", "fournir", "frapper", "frotter", "gagner", "garder", "gâter", "goûter", "grandir", "gratter", "griller", "habiller", "habiter", "hésiter", "identifier", "ignorer", "imaginer", "imiter", "indiquer", "insister", "installer", "interroger", "inventer", "inviter", "jeter", "jouer", "juger", "laisser", "laver", "lever", "libérer", "limiter", "livrer", "louer", "manquer", "marcher", "marquer", "mélanger", "menacer", "mériter", "mesurer", "modifier", "monter", "montrer", "mordre", "nager", "négliger", "nettoyer", "noter", "obliger", "observer", "occuper", "offrir", "organiser", "oser", "oublier", "pardonner", "parler", "partager", "participer", "passer", "patiner", "pêcher", "peindre", "penser", "percer", "perdre", "photographier", "piquer", "placer", "plaisanter", "pleurer", "plier", "plonger", "porter", "poser", "posséder", "pousser", "préférer", "préparer", "présenter", "prêter", "prier", "produire", "profiter", "programmer", "prononcer", "proposer", "protéger", "prouver", "punir", "quitter", "raconter", "ralentir", "ramasser", "ranger", "rappeler", "rapporter", "rassurer", "réagir", "réaliser", "recevoir", "réchauffer", "recommander", "réfléchir", "refuser", "regarder", "régler", "regretter", "remarquer", "remercier", "remplacer", "remplir", "rencontrer", "renforcer", "renverser", "réparer", "répéter", "répondre", "reposer", "représenter", "réserver", "résoudre", "respecter", "ressembler", "rester", "retenir", "retirer", "réunir", "réussir", "réveiller", "réviser", "rouler", "sauter", "sauver", "sécher", "sembler", "séparer", "serrer", "servir", "signer", "situer", "soigner", "souffler", "souhaiter", "soulever", "soupçonner", "sourire", "subir", "supporter", "supposer", "surveiller", "taper", "téléphoner", "terminer", "tirer", "tomber", "toucher", "tourner", "tousser", "tracer", "traduire", "trahir", "traîner", "traiter", "transformer", "transporter", "travailler", "traverser", "tremper", "tricher", "tromper", "trouver", "utiliser", "vendre", "vérifier", "verser", "viser", "visiter", "voler", "voter", "voyager"]
};
function verbPool(langCode) {
  const eng = window.CONJ[langCode];
  const set = new Set(eng.samples || []);
  (eng.irregulars || []).forEach(v => set.add(v));
  (EXTRA_VERBS[langCode] || []).forEach(v => set.add(v));
  (EXTRA_VERBS2[langCode] || []).forEach(v => set.add(v));
  if (langCode === "es" || langCode === "en") (EXTRA_VERBS3[langCode] || []).forEach(v => set.add(v));
  const trd = window.TRANS[langCode];
  if (trd) Object.keys(trd).forEach(k => set.add(k));
  const idx = _LIDX[langCode];
  if (idx != null) CONCEPTS.forEach(row => {
    if (row[idx]) set.add(row[idx]);
  });
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
  (eng.samples || []).forEach(v => set.add(v));
  (EXTRA_VERBS[langCode] || []).forEach(v => set.add(v));
  if (skill === "beginner") {
    irr.slice(0, 24).forEach(v => set.add(v));
  } else {
    irr.forEach(v => set.add(v));
    (EXTRA_VERBS2[langCode] || []).forEach(v => set.add(v));
  }
  if (skill === "advanced") {
    if (langCode === "es" || langCode === "en") (EXTRA_VERBS3[langCode] || []).forEach(v => set.add(v));
    const trd = window.TRANS[langCode];
    if (trd) Object.keys(trd).forEach(k => set.add(k));
  }
  return Array.from(set);
}

/* Build a concrete challenge list (verbs + words) from the learner's saved items,
   topped up from the level pool so it reaches the requested counts. done = number
   of successful spaced-repetition hits (>=3 = "mastered"). */
function buildChallengeLists(data, lang) {
  const n = Math.max(0, (data && data.verbs) || 0);
  const m = Math.max(0, (data && data.words) || 0);
  const skill = recall("kunju-skill", "beginner");
  function uniqPush(arr, seen, raw, stripTo) {
    const t = stripTo ? String(raw || "").replace(/^to /, "").trim() : String(raw || "").trim();
    const k = t.toLowerCase();
    if (t && !seen[k]) { seen[k] = 1; arr.push(t); return true; }
    return false;
  }
  const verbs = [], vseen = {};
  (recall("kunju-favs", []) || []).filter(f => f.lang === lang && f.verb).forEach(f => { if (verbs.length < n) uniqPush(verbs, vseen, f.verb, true); });
  if (verbs.length < n) {
    let pool = [];
    try { pool = quizPool(lang, skill) || []; } catch (e) {}
    for (let i = 0; i < pool.length && verbs.length < n; i++) uniqPush(verbs, vseen, pool[i], true);
  }
  const words = [], wseen = {};
  (getVocab() || []).filter(x => x.lang === lang && x.term).forEach(x => { if (words.length < m) uniqPush(words, wseen, x.term, false); });
  return { verbList: verbs.map(v => ({ v: v, done: 0, lastDay: "" })), wordList: words.map(w => ({ w: w, done: 0, lastDay: "" })) };
}
/* Mastery: ein Eintrag „sitzt" nach 3 richtigen Antworten an 3 VERSCHIEDENEN Tagen. */
const CH_DONE = 3;
/* Challenge pro Sprache: der Slot kunju-goal-data-<lang> ist die Quelle der
   Wahrheit; kunju-goal-data bleibt ein Spiegel der AKTIVEN Sprache, damit alle
   bestehenden recall("kunju-goal-data")-Leser automatisch das Richtige sehen. */
function persistGoal(lang, g) {
  persist("kunju-goal-data-" + lang, g);
  persist("kunju-goal-data", g);
}
function creditChallengeVerb(lang, verb) {
  const g = recall("kunju-goal-data", null);
  if (!g || !Array.isArray(g.verbList)) return;
  const base = String(verb || "").replace(/^to /, "").trim().toLowerCase();
  if (!base) return;
  const today = new Date().toDateString();
  let changed = false,
    mastered = false;
  g.verbList.forEach(it => {
    if (String(it.v || "").toLowerCase() === base && it.lastDay !== today && (it.done || 0) < CH_DONE) {
      it.done = (it.done || 0) + 1;
      it.lastDay = today;
      changed = true;
      if (it.done >= CH_DONE) mastered = true;
    }
  });
  if (changed) persistGoal(lang, g);
  return mastered ? base : null; // base = verb that just "sitzt"
}
function creditChallengeWord(lang, term) {
  const g = recall("kunju-goal-data", null);
  if (!g || !Array.isArray(g.wordList)) return;
  const t = String(term || "").trim().toLowerCase();
  if (!t) return;
  const today = new Date().toDateString();
  let changed = false;
  g.wordList.forEach(it => {
    if (String(it.w || "").toLowerCase() === t && it.lastDay !== today && (it.done || 0) < CH_DONE) {
      it.done = (it.done || 0) + 1;
      it.lastDay = today;
      changed = true;
    }
  });
  if (changed) persistGoal(lang, g);
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
const INF_SUF = {
  es: ["ar", "er", "ir"],
  fr: ["er", "re", "ir"],
  de: ["en", "n"],
  nl: ["en", "n"],
  en: []
};

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
    suf.forEach(s => set.add(pre + s));
  }
  return Array.from(set).filter(c => c.length >= 2 && suf.some(s => c.endsWith(s)));
}
function enCandidates(w) {
  const c = new Set();
  const undbl = s => s.length > 1 && s[s.length - 1] === s[s.length - 2] ? s.slice(0, -1) : null;
  if (w.endsWith("ing")) {
    const s = w.slice(0, -3);
    c.add(s);
    c.add(s + "e");
    const d = undbl(s);
    if (d) c.add(d);
  }
  if (w.endsWith("ied")) {
    c.add(w.slice(0, -3) + "y");
  }
  if (w.endsWith("ed")) {
    const s = w.slice(0, -2);
    c.add(s);
    c.add(s + "e");
    const d = undbl(s);
    if (d) c.add(d);
    c.add(w.slice(0, -1));
  }
  if (w.endsWith("ies")) {
    c.add(w.slice(0, -3) + "y");
  }
  if (w.endsWith("es")) {
    c.add(w.slice(0, -2));
    c.add(w.slice(0, -1));
  }
  if (w.endsWith("s") && !w.endsWith("ss")) {
    c.add(w.slice(0, -1));
  }
  return Array.from(c).filter(x => x.length >= 2);
}
/* When several made-up infinitives verify (ambiguous ending), keep only the
   best one: the shortest base (bogus reconstructions embed inflectional letters
   into the stem, so they are longer), then the most productive verb-class. */
function pruneGuess(langCode, groups) {
  let min = Infinity;
  groups.forEach(g => {
    min = Math.min(min, g.base.length);
  });
  Array.from(groups.entries()).forEach(([k, g]) => {
    if (g.base.length > min) groups.delete(k);
  });
  const order = INF_SUF[langCode] || [];
  if (order.length) {
    const pri = b => {
      for (let k = 0; k < order.length; k++) if (b.endsWith(order[k])) return order.length - k;
      return 0;
    };
    let best = 0;
    groups.forEach(g => {
      best = Math.max(best, pri(g.base));
    });
    Array.from(groups.entries()).forEach(([k, g]) => {
      if (pri(g.base) < best) groups.delete(k);
    });
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
    if (!g) {
      g = {
        infinitive: r.infinitive,
        base: ib,
        isIrregular: r.isIrregular,
        tenseId: t.id,
        tenseLabel: t.label,
        indices: [],
        pronouns: [],
        noPerson: allSame
      };
      groups.set(key, g);
    }
    if (g.indices.indexOf(i) < 0) {
      g.indices.push(i);
      g.pronouns.push(r.pronouns[i]);
    }
  }
  function scan(matchFn) {
    pool.forEach(cand => {
      const r = eng.conjugate(cand);
      if (!r || r.error) return;
      r.tenses.forEach(t => {
        if (!t.forms) return;
        const allSame = t.forms.every(f => f === t.forms[0]);
        t.forms.forEach((f, i) => {
          if (f && f !== "—" && matchFn(norm(f))) record(r, t, i, allSame);
        });
      });
    });
  }
  scan(f => f === input); // 1) exact full-form match

  if (groups.size === 0) {
    // 2) bare participle / gerund inside compound tenses
    const isGerund = /(ndo|ant|ing)$/.test(input); // -ndo (es), -ant (fr), -ing (en)
    pool.forEach(cand => {
      const r = eng.conjugate(cand);
      if (!r || r.error) return;
      r.tenses.forEach(t => {
        if (!t.forms) return;
        t.forms.forEach(f => {
          if (!f || f === "—" || f.indexOf(" ") < 0) return;
          if (norm(f.split(" ").pop()) === input) {
            const ib = infBase(langCode, r.infinitive);
            const key = ib + (isGerund ? "|__ger" : "|__pp");
            if (!groups.has(key)) groups.set(key, {
              infinitive: r.infinitive,
              base: ib,
              isIrregular: r.isIrregular,
              tenseId: isGerund ? "gerund" : "participle",
              tenseLabel: isGerund ? tr("dq_gerund") : tr("dq_participle"),
              indices: [],
              pronouns: [],
              noPerson: true
            });
          }
        });
      });
    });
  }
  let fuzzy = false;
  if (groups.size === 0 && dinput !== input) {
    // 3) accent-insensitive fallback
    fuzzy = true;
    scan(f => deburr(f) === dinput);
  }
  let guessed = false;
  if (groups.size === 0) {
    // 4) rule-based reconstruction (verified by re-conjugation)
    const isGer = /(ndo|ant|ing)$/.test(input);
    ruleCandidates(langCode, input).forEach(cand => {
      const r = eng.conjugate(cand);
      if (!r || r.error) return;
      if (infBase(langCode, r.infinitive) !== cand) return; // candidate must be its own clean infinitive
      r.tenses.forEach(t => {
        if (!t.forms) return;
        const allSame = t.forms.every(f => f === t.forms[0]);
        t.forms.forEach((f, i) => {
          if (!f || f === "—") return;
          if (norm(f) === input) record(r, t, i, allSame);else if (f.indexOf(" ") >= 0 && norm(f.split(" ").pop()) === input) {
            const ib = infBase(langCode, r.infinitive);
            const key = ib + (isGer ? "|__ger" : "|__pp");
            if (!groups.has(key)) groups.set(key, {
              infinitive: r.infinitive,
              base: ib,
              isIrregular: r.isIrregular,
              tenseId: isGer ? "gerund" : "participle",
              tenseLabel: isGer ? tr("dq_gerund") : tr("dq_participle"),
              indices: [],
              pronouns: [],
              noPerson: true
            });
          }
        });
      });
    });
    if (groups.size > 0) {
      guessed = true;
      pruneGuess(langCode, groups);
    }
  }
  if (groups.size === 0) return null;
  const analyses = Array.from(groups.values());
  const infinitives = [];
  analyses.forEach(a => {
    if (!infinitives.some(x => x.base === a.base)) infinitives.push({
      infinitive: a.infinitive,
      base: a.base,
      isIrregular: a.isIrregular
    });
  });
  return {
    input: (raw || "").trim(),
    analyses,
    infinitives,
    fuzzy,
    guessed
  };
}

/* ---------- Sponsor slot (single contextual recommendation) ---------- */
/* Swap these objects to change the paying partner per language. */
const SPONSORS = {
  de: {
    name: "DeutschDaily",
    letter: "D",
    color: "#ff3b5c",
    tag: "Spaced-repetition trainer for German verbs",
    link: "https://example.com/de"
  },
  es: {
    name: "Verbaes",
    letter: "V",
    color: "#ff9f0a",
    tag: "Master Spanish tenses with 5-min drills",
    link: "https://example.com/es"
  },
  en: {
    name: "FluentList",
    letter: "F",
    color: "#0a84ff",
    tag: "Build English fluency in 5 minutes a day",
    link: "https://example.com/en"
  },
  nl: {
    name: "NederLearn",
    letter: "N",
    color: "#30c95a",
    tag: "Practice Dutch verbs the smart way",
    link: "https://example.com/nl"
  },
  fr: {
    name: "ParlezPlus",
    letter: "P",
    color: "#1b1813",
    tag: "Your interactive French grammar coach",
    link: "https://example.com/fr"
  }
};
function AdCard({
  sponsor,
  hook,
  onClick,
  onDismiss
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "adcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "adcard-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "adlabel"
  }, /*#__PURE__*/React.createElement("span", {
    className: "addot"
  }), tr("recommended")), /*#__PURE__*/React.createElement("button", {
    className: "adclose",
    title: "Dismiss",
    onClick: onDismiss
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    className: "adcard-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "adicon",
    style: {
      background: sponsor.color
    }
  }, sponsor.letter), /*#__PURE__*/React.createElement("div", {
    className: "adtext"
  }, /*#__PURE__*/React.createElement("div", {
    className: "adtitle"
  }, hook), /*#__PURE__*/React.createElement("div", {
    className: "addesc"
  }, sponsor.name, " \xB7 ", sponsor.tag))), /*#__PURE__*/React.createElement("a", {
    className: "adcta",
    href: sponsor.link,
    target: "_blank",
    rel: "noopener noreferrer",
    onClick: onClick
  }, tr("ad_cta")));
}

/* Cross-language verb equivalents (all chosen to conjugate correctly). Order: de, es, en, nl, fr */
const CONCEPTS = [["sein", "ser", "be", "zijn", "être"], ["haben", "tener", "have", "hebben", "avoir"], ["gehen", "ir", "go", "gaan", "aller"], ["kommen", "venir", "come", "komen", "venir"], ["machen", "hacer", "make", "maken", "faire"], ["sehen", "ver", "see", "zien", "voir"], ["essen", "comer", "eat", "eten", "manger"], ["trinken", "beber", "drink", "drinken", "boire"], ["sprechen", "hablar", "speak", "spreken", "parler"], ["wollen", "querer", "want", "willen", "vouloir"], ["können", "poder", "can", "kunnen", "pouvoir"], ["wissen", "saber", "know", "weten", "savoir"], ["geben", "dar", "give", "geven", "donner"], ["nehmen", "tomar", "take", "nemen", "prendre"], ["finden", "encontrar", "find", "vinden", "trouver"], ["schreiben", "escribir", "write", "schrijven", "écrire"], ["lesen", "leer", "read", "lezen", "lire"], ["schlafen", "dormir", "sleep", "slapen", "dormir"], ["arbeiten", "trabajar", "work", "werken", "travailler"], ["kaufen", "comprar", "buy", "kopen", "acheter"], ["wohnen", "vivir", "live", "wonen", "vivre"], ["sagen", "decir", "say", "zeggen", "dire"], ["fahren", "conducir", "drive", "rijden", "conduire"], ["spielen", "jugar", "play", "spelen", "jouer"], ["helfen", "ayudar", "help", "helpen", "aider"], ["bringen", "traer", "bring", "brengen", "apporter"], ["denken", "pensar", "think", "denken", "penser"]];
const _LIDX = {
  de: 0,
  es: 1,
  en: 2,
  nl: 3,
  fr: 4
};
function conceptTranslate(verb, from, to) {
  const v = (verb || "").trim().toLowerCase();
  const fi = _LIDX[from],
    ti = _LIDX[to];
  for (const row of CONCEPTS) {
    if (row[fi] === v) return row[ti];
  }
  return null;
}

/* Verb meaning in the learner's mother tongue, when we can know it instantly
   (same language, a built-in cross-language equivalent, or the English gloss). */
function nativeMeaningInstant(langCode, base, nativeName) {
  const nCode = NATIVE_TO_UI[nativeName];
  if (nCode === langCode) return base;
  if (nCode) {
    const ct = conceptTranslate(base, langCode, nCode);
    if (ct) return ct;
  }
  if (nativeName === "English") {
    const m = window.lookupMeaning(langCode, base);
    if (m) return m;
  }
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
  es: {
    detect: v => /(ar|er|ir)se$/.test(v),
    strip: v => v.slice(0, -2),
    pron: ["me", "te", "se", "nos", "os", "se"],
    place: "before"
  },
  fr: {
    detect: v => /^se /.test(v) || /^s'/.test(v),
    strip: v => v.replace(/^se /, "").replace(/^s'/, ""),
    pron: ["me", "te", "se", "nous", "vous", "se"],
    place: "before",
    elide: true
  },
  de: {
    detect: v => /^sich /.test(v),
    strip: v => v.replace(/^sich /, ""),
    pron: ["mich", "dich", "sich", "uns", "euch", "sich"],
    place: "after"
  },
  nl: {
    detect: v => /^zich /.test(v),
    strip: v => v.replace(/^zich /, ""),
    pron: ["me", "je", "zich", "ons", "je", "zich"],
    place: "after"
  }
};
function conjugateMaybeReflexive(langCode, input) {
  const eng = window.CONJ[langCode];
  const v = (input || "").trim().toLowerCase();
  const R = REFLEX[langCode];
  if (R && R.detect(v)) {
    const r = eng.conjugate(R.strip(v));
    if (!r || r.error) return r;
    // French reflexive compound tenses take être, not avoir
    const FR_ETRE = {
      ai: "suis",
      as: "es",
      a: "est",
      avons: "sommes",
      avez: "êtes",
      ont: "sont",
      avais: "étais",
      avait: "était",
      avions: "étions",
      aviez: "étiez",
      avaient: "étaient"
    };
    const out = Object.assign({}, r, {
      infinitive: v,
      reflexive: true
    });
    out.tenses = r.tenses.map(t => ({
      id: t.id,
      label: t.label,
      reg: null,
      forms: t.forms.map((f, i) => {
        if (!f || f === "—") return f;
        const p = R.pron[i];
        let form = f;
        if (langCode === "fr" && /perfect/.test(t.id)) {
          form = form.replace(/^(\S+)/, w => FR_ETRE[w] || w); // avoir → être
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
function AccentBar({
  lang,
  onInsert
}) {
  return null; // removed per request — users type accents on their own keyboard
}

/* Mistakes pool (wrong answers, per language) */
function mKey(m) {
  return m.verb + "|" + m.tenseLabel + "|" + m.pronoun;
}
function getMistakes(lang) {
  return recall("kunju-mistakes-" + lang, []);
}
function addMistake(lang, q) {
  const list = getMistakes(lang);
  if (list.some(m => mKey(m) === mKey(q))) return;
  list.unshift({
    verb: q.verb,
    tenseLabel: q.tenseLabel,
    pronoun: q.pronoun,
    answer: q.answer,
    options: q.options,
    isIrregular: q.isIrregular,
    ttsLang: q.ttsLang,
    lang
  });
  persist("kunju-mistakes-" + lang, list.slice(0, 40));
}
function removeMistake(lang, q) {
  persist("kunju-mistakes-" + lang, getMistakes(lang).filter(m => mKey(m) !== mKey(q)));
}
/* Sentence-mistakes pool (wrong/unknown sentences), per target language. */
function getSentMist(tc) {
  return recall("kunju-sentmist-" + tc, []);
}
function addSentMist(tc, s) {
  if (!s || !s.t) return;
  const list = getSentMist(tc);
  if (list.some(x => x.t === s.t)) return;
  list.unshift({
    n: s.n,
    t: s.t
  });
  persist("kunju-sentmist-" + tc, list.slice(0, 40));
}
function removeSentMist(tc, s) {
  if (!s) return;
  persist("kunju-sentmist-" + tc, getSentMist(tc).filter(x => x.t !== s.t));
}

/* Daily goal + streak */
const DAILY_GOAL = 12;
function getPersonalGoal() {
  const g = recall("kunju-goal-data", null);
  return g && g.perDay ? g.perDay : DAILY_GOAL;
}
function readDaily() {
  const today = new Date().toDateString();
  const y = new Date(Date.now() - 86400000).toDateString();
  const d = recall("kunju-daily", {
    date: "",
    count: 0
  });
  const st = recall("kunju-streak", {
    last: "",
    streak: 0,
    best: 0
  });
  const count = d.date === today ? d.count : 0;
  let streak = st.streak || 0;
  if (st.last !== today && st.last !== y) streak = 0;
  return {
    count,
    goal: getPersonalGoal(),
    streak,
    best: st.best || 0
  };
}
function bumpDaily() {
  const today = new Date().toDateString();
  const y = new Date(Date.now() - 86400000).toDateString();
  let d = recall("kunju-daily", {
    date: "",
    count: 0
  });
  if (d.date !== today) d = {
    date: today,
    count: 0
  };
  d.count += 1;
  persist("kunju-daily", d);
  let st = recall("kunju-streak", {
    last: "",
    streak: 0,
    best: 0
  });
  if (d.count >= getPersonalGoal() && st.last !== today) {
    st.streak = st.last === y ? (st.streak || 0) + 1 : 1;
    st.last = today;
    st.best = Math.max(st.best || 0, st.streak);
    persist("kunju-streak", st);
  }
  return readDaily();
}

/* Free-account quiz limit: 20 quiz cards per calendar day (premium = unlimited). */
const QUIZ_FREE_LIMIT = 20;
function readQuizDayCount() {
  const today = new Date().toDateString();
  const q = recall("kunju-quizday", {
    date: "",
    count: 0
  });
  return q.date === today ? q.count : 0;
}
function bumpQuizDay() {
  const today = new Date().toDateString();
  let q = recall("kunju-quizday", {
    date: "",
    count: 0
  });
  if (q.date !== today) q = {
    date: today,
    count: 0
  };
  q.count += 1;
  persist("kunju-quizday", q);
  return q.count;
}

/* Export / share a conjugation */
const PROMO = [["DE", "Verben konjugieren, üben & lernen"], ["EN", "conjugate, quiz & learn verbs"], ["ES", "conjuga, practica y aprende verbos"], ["NL", "werkwoorden vervoegen, oefenen & leren"], ["FR", "conjuguer, réviser & apprendre"]];
const PROMO_H = 234;
function makeConjCanvas(result, langCode, meaning) {
  const eng = window.CONJ[langCode];
  const RB = ["#ff3b5c", "#ff7a18", "#ffc400", "#34c759", "#00bcd4", "#0a84ff", "#a557ff", "#ff5ea8"];
  const W = 880,
    pad = 46,
    lineH = 32,
    headH = 150,
    tenseGap = 20;
  const H = headH + result.tenses.reduce((a, t) => a + 40 + t.forms.length * lineH + tenseGap, 0) + PROMO_H;
  const c = document.createElement("canvas");
  const SC = 2;
  c.width = W * SC;
  c.height = H * SC;
  const x = c.getContext("2d");
  x.scale(SC, SC);
  x.fillStyle = "#f6f7fb";
  x.fillRect(0, 0, W, H);
  x.fillStyle = "#ffffff";
  x.fillRect(0, 0, W, headH - 16);
  const grad = x.createLinearGradient(0, 0, W, 0);
  ["#ff3b5c", "#ff7a18", "#ffc400", "#34c759", "#00bcd4", "#0a84ff", "#a557ff"].forEach((col, i, arr) => grad.addColorStop(i / (arr.length - 1), col));
  x.fillStyle = grad;
  x.fillRect(0, 0, W, 10);
  x.fillStyle = "#14151a";
  x.font = "700 46px sans-serif";
  x.fillText(result.infinitive, pad, 78);
  x.fillStyle = "#707888";
  x.font = "500 19px sans-serif";
  x.fillText(eng.name + (meaning ? "  ·  " + meaning : ""), pad, 108);
  // regular/irregular pill
  const pillTxt = result.isIrregular ? "irregular" : "regular";
  x.font = "600 14px sans-serif";
  const pw = x.measureText(pillTxt).width + 22;
  x.fillStyle = result.isIrregular ? "#ffe3cc" : "#d6f5e0";
  roundRect(x, pad, 120, pw, 24, 12);
  x.fill();
  x.fillStyle = result.isIrregular ? "#d4660a" : "#1a9b46";
  x.fillText(pillTxt, pad + 11, 137);
  x.fillStyle = "#a557ff";
  x.font = "700 16px sans-serif";
  x.textAlign = "right";
  x.fillText("ConjuExpert", W - pad, 78);
  x.textAlign = "left";
  let y = headH + 18;
  result.tenses.forEach((t, ti) => {
    x.fillStyle = RB[ti % RB.length];
    roundRect(x, pad, y - 15, 12, 12, 3);
    x.fill();
    x.fillStyle = "#14151a";
    x.font = "600 22px sans-serif";
    x.fillText(t.label, pad + 24, y + 2);
    y += 36;
    t.forms.forEach((f, i) => {
      if (i % 2 === 0) {
        x.fillStyle = "#ffffff";
        x.fillRect(pad, y - 21, W - pad * 2, lineH);
      }
      x.fillStyle = "#9098a8";
      x.font = "15px sans-serif";
      x.fillText(result.pronouns[i], pad + 14, y);
      x.fillStyle = "#14151a";
      x.font = "600 18px monospace";
      x.fillText(f, pad + 210, y);
      y += lineH;
    });
    y += tenseGap;
  });
  // promo / ad block
  const py = H - PROMO_H + 8;
  x.fillStyle = "#101018";
  x.fillRect(0, py, W, PROMO_H - 8);
  x.fillStyle = grad;
  x.fillRect(0, py, W, 5);
  x.fillStyle = "#ffffff";
  x.font = "700 24px sans-serif";
  x.fillText("Conju", pad, py + 44);
  const cw = x.measureText("Conju").width;
  const ew = x.measureText("Expert").width;
  const eg = x.createLinearGradient(pad + cw, 0, pad + cw + ew, 0);
  eg.addColorStop(0, "#ff3b5c");
  eg.addColorStop(0.25, "#ff7a18");
  eg.addColorStop(0.5, "#ffc400");
  eg.addColorStop(0.7, "#34c759");
  eg.addColorStop(0.85, "#0a84ff");
  eg.addColorStop(1, "#a557ff");
  x.fillStyle = eg;
  x.fillText("Expert", pad + cw, py + 44);
  x.fillStyle = "#8a93b0";
  x.font = "500 14px sans-serif";
  x.textAlign = "right";
  x.fillText("free verb conjugator", W - pad, py + 44);
  x.textAlign = "left";
  PROMO.forEach((p, i) => {
    const ly = py + 78 + i * 23;
    x.fillStyle = "#6b7390";
    x.font = "700 12px sans-serif";
    x.fillText(p[0], pad, ly);
    x.fillStyle = "#dfe2ee";
    x.font = "15px sans-serif";
    x.fillText(p[1], pad + 36, ly);
  });
  x.fillStyle = "#ffd24a";
  x.font = "600 16px sans-serif";
  x.fillText("📱  Download free — iOS App Store · Google Play", pad, py + 78 + 5 * 23 + 12);
  return c;
}
function roundRect(x, rx, ry, w, h, r) {
  x.beginPath();
  x.moveTo(rx + r, ry);
  x.arcTo(rx + w, ry, rx + w, ry + h, r);
  x.arcTo(rx + w, ry + h, rx, ry + h, r);
  x.arcTo(rx, ry + h, rx, ry, r);
  x.arcTo(rx, ry, rx + w, ry, r);
  x.closePath();
}
function canvasToBlob(c) {
  return new Promise(res => c.toBlob(res, "image/png"));
}
function fileName(result, langCode) {
  return result.infinitive.replace(/[^\p{L}]/gu, "_") + "_" + langCode;
}
function exportImage(result, langCode, meaning) {
  makeConjCanvas(result, langCode, meaning).toBlob(b => {
    if (!b) return;
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u;
    a.download = fileName(result, langCode) + ".png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1500);
  }, "image/png");
}
function exportPDF(result, langCode, meaning) {
  const eng = window.CONJ[langCode];
  const native = recall("kunju-native", "German");
  const skill = recall("kunju-skill", "beginner");
  const sec = result.tenses.map(t => {
    const rows = t.forms.map((f, i) => `<tr><td class="p">${esc(result.pronouns[i])}</td><td class="f">${esc(f)}</td></tr>`).join("");
    const ex = recall(`kunju-tex2-${langCode}-${result.infinitive}-${t.id}-${native}-${skill}`, null);
    const exHtml = ex && ex.s ? `<div class="ex"><span class="exs">${fmtVerbMark(ex.s)}</span>${ex.n ? `<span class="exn">${esc(ex.n)}</span>` : ""}</div>` : "";
    return `<div class="tense"><h3>${esc(t.label)}</h3><table>${rows}</table>${exHtml}</div>`;
  }).join("");
  const LC = {
    DE: "#ff3b5c",
    EN: "#0a84ff",
    ES: "#ff9f0a",
    NL: "#30c95a",
    FR: "#a557ff"
  };
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
.bname b{font-weight:700;background:linear-gradient(90deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#0a84ff,#a557ff);-webkit-background-clip:text;background-clip:text;color:transparent}
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
.fname b{font-weight:700;background:linear-gradient(90deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#0a84ff,#a557ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.ftag{font-size:10px;color:#9098a8;display:block;margin-top:1px}
.langs{display:grid;grid-template-columns:1fr 1fr;gap:5px 20px;margin-bottom:14px}
.lang{font-size:12.5px;color:#555;display:flex;gap:9px;align-items:center}
.lc{font-size:9.5px;font-weight:700;letter-spacing:.1em;min-width:22px;font-family:ui-monospace,monospace}
.url{font-weight:700;font-size:13px;background:linear-gradient(90deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#0a84ff,#a557ff);-webkit-background-clip:text;background-clip:text;color:transparent;margin-top:10px;display:block}
.ex{margin-top:5px;padding:5px 0 0;border-top:1px dashed #edf0f5}
.exs{display:block;font-size:12px;color:#3a3f52;font-style:italic;line-height:1.45}
.exs b{color:#a557ff;font-style:normal;font-weight:700}
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
      ${PROMO.map(p => `<div class="lang"><span class="lc" style="color:${LC[p[0]] || "#9098a8"}">${p[0]}</span>${esc(p[1])}</div>`).join("")}
    </div>
    <span class="url">conjuexpert.app</span>
  </div>
</div>
${RB}
<script>onload=function(){setTimeout(function(){window.print()},400)}<\/script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
function rateApp() {
  window.open("https://conjuexpert.app/bewertungen/", "_blank");
}
async function shareApp() {
  const lang = (navigator.language || navigator.userLanguage || "en").toLowerCase().slice(0, 2);
  const slogans = {
    de: {
      title: "ConjuExpert — KI-Support für 5 Sprachen 🌍",
      text: "🌍✨ 5 Sprachen. KI-Support. Ein Klick.\n\nMit ConjuExpert konjugierst du Verben auf Deutsch, Spanisch, Englisch, Niederländisch & Französisch – mit KI-Support. Sofort. Kostenlos. Kein Download nötig.",
      copied: "Link kopiert – einfach in WhatsApp, Instagram oder eine E-Mail einfügen! 🎉"
    },
    es: {
      title: "ConjuExpert — Soporte IA para 5 idiomas 🌍",
      text: "🌍✨ 5 idiomas. Soporte IA. Un clic.\n\nCon ConjuExpert conjugas verbos en alemán, español, inglés, neerlandés y francés – con soporte de IA. Al instante. Gratis. Sin descargas.",
      copied: "¡Enlace copiado – pégalo en WhatsApp, Instagram o un correo! 🎉"
    },
    nl: {
      title: "ConjuExpert — AI-ondersteuning voor 5 talen 🌍",
      text: "🌍✨ 5 talen. AI-ondersteuning. Één klik.\n\nMet ConjuExpert vervoeg je werkwoorden in het Duits, Spaans, Engels, Nederlands & Frans – met AI-ondersteuning. Direct. Gratis. Geen download nodig.",
      copied: "Link gekopieerd – plak het in WhatsApp, Instagram of een e-mail! 🎉"
    },
    fr: {
      title: "ConjuExpert — Support IA pour 5 langues 🌍",
      text: "🌍✨ 5 langues. Support IA. Un clic.\n\nAvec ConjuExpert, conjuguez des verbes en allemand, espagnol, anglais, néerlandais et français – avec le support de l'IA. Instantané. Gratuit. Sans téléchargement.",
      copied: "Lien copié – colle-le dans WhatsApp, Instagram ou un e-mail ! 🎉"
    },
    en: {
      title: "ConjuExpert — AI support for 5 languages 🌍",
      text: "🌍✨ 5 languages. AI support. One click.\n\nWith ConjuExpert you conjugate verbs in German, Spanish, English, Dutch & French – with AI support. Instant. Free. No download needed.",
      copied: "Link copied – paste it into WhatsApp, Instagram or an email! 🎉"
    }
  };
  const s = slogans[lang] || slogans.en;
  const shareData = {
    title: s.title,
    text: s.text,
    url: "https://conjuexpert.app"
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await navigator.clipboard.writeText(s.text + "\n\n👉 conjuexpert.app");
    if (window.__toast) window.__toast(s.copied);
  } catch (e) {
    if (e && e.name !== "AbortError") {
      try {
        await navigator.clipboard.writeText("https://conjuexpert.app");
      } catch {}
    }
  }
}
async function shareConjugation(result, langCode, meaning) {
  try {
    const blob = await canvasToBlob(makeConjCanvas(result, langCode, meaning));
    const file = new File([blob], fileName(result, langCode) + ".png", {
      type: "image/png"
    });
    if (navigator.canShare && navigator.canShare({
      files: [file]
    })) {
      await navigator.share({
        files: [file],
        title: result.infinitive,
        text: result.infinitive + " — ConjuExpert"
      });
      return;
    }
  } catch (e) {
    if (e && e.name === "AbortError") return;
  }
  const lines = [result.infinitive + (meaning ? " (" + meaning + ")" : "")];
  result.tenses.forEach(t => {
    lines.push("\n" + t.label);
    result.pronouns.forEach((p, i) => lines.push(p + ": " + t.forms[i]));
  });
  const text = lines.join("\n") + "\n\n— ConjuExpert";
  try {
    if (navigator.share) {
      await navigator.share({
        title: result.infinitive,
        text
      });
      return;
    }
    await navigator.clipboard.writeText(text);
    if (window.__toast) window.__toast("Copied to clipboard — paste it into WhatsApp etc.");
  } catch (e) {}
}

/* ---------- Language selector ---------- */
function LanguageBar({
  lang,
  setLang
}) {
  const [order, setOrder] = useState(() => langOrder());
  const [dragCode, setDragCode] = useState(null);
  const lpTimer = useRef(null);
  const lpFired = useRef(false);
  const wrapRef = useRef(null);
  const orderRef = useRef(order);
  orderRef.current = order;
  React.useEffect(() => {
    if (!dragCode) return;
    function move(e) {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const x = e.clientX;
      const rects = [].slice.call(wrap.querySelectorAll(".langbtn")).map(b => {
        const r = b.getBoundingClientRect();
        return { code: b.getAttribute("data-code"), mid: r.left + r.width / 2 };
      });
      let target = rects.findIndex(r => x < r.mid);
      if (target === -1) target = rects.length - 1;
      const cur = orderRef.current.indexOf(dragCode);
      if (target >= 0 && target !== cur) {
        const next = orderRef.current.slice();
        next.splice(cur, 1);
        next.splice(target, 0, dragCode);
        setOrder(next);
      }
      if (e.cancelable) e.preventDefault();
    }
    function up() {
      persist("kunju-langorder", orderRef.current);
      setDragCode(null);
    }
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragCode]);
  function startPress(code) {
    lpFired.current = false;
    lpTimer.current = setTimeout(() => {
      lpFired.current = true;
      if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
      setDragCode(code);
    }, 350);
  }
  function endPress() {
    if (lpTimer.current) { clearTimeout(lpTimer.current); lpTimer.current = null; }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "langbar" + (dragCode ? " reordering" : ""),
    ref: wrapRef
  }, order.map(code => {
    const meta = LANG_META[code];
    const engine = window.CONJ[code];
    const active = lang === code;
    return /*#__PURE__*/React.createElement("button", {
      key: code,
      "data-code": code,
      className: "langbtn" + (active ? " active" : "") + (order[0] === code ? " langstart" : "") + (dragCode === code ? " dragging" : ""),
      style: active ? {
        "--lc": meta.color
      } : {},
      title: tr("lang_reorder_hint"),
      onClick: () => {
        if (lpFired.current) { lpFired.current = false; return; }
        setLang(code);
      },
      onPointerDown: () => startPress(code),
      onPointerUp: endPress,
      onPointerLeave: endPress,
      onPointerCancel: endPress,
      onContextMenu: e => e.preventDefault()
    }, /*#__PURE__*/React.createElement("span", {
      className: "langstripe",
      style: {
        background: meta.color
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "langflag"
    }, meta.code), /*#__PURE__*/React.createElement("span", {
      className: "langname"
    }, engine.name));
  }));
}

/* ---------- Tabs ---------- */
function Tabs({
  tab,
  setTab,
  profile
}) {
  const ITEMS = {
    conjugate: { label: tr("tab_conjugate"), icon: "▦" },
    quiz: { label: tr("tab_quiz"), icon: "◆" },
    grammar: { label: tr("tab_learn"), icon: "✦" },
    saved: { label: tr("tab_saved"), icon: "★" }
  };
  const IDS = ["conjugate", "quiz", "grammar", "saved"];
  const [order, setOrder] = useState(() => {
    const s = recall("kunju-taborder", null);
    if (!Array.isArray(s)) return IDS.slice();
    const v = s.filter(x => IDS.includes(x));
    IDS.forEach(x => { if (!v.includes(x)) v.push(x); });
    return v.length ? v : IDS.slice();
  });
  const [dragId, setDragId] = useState(null);
  const lpTimer = useRef(null);
  const lpFired = useRef(false);
  const wrapRef = useRef(null);
  const orderRef = useRef(order);
  orderRef.current = order;
  React.useEffect(() => {
    if (!dragId) return;
    function move(e) {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const x = e.clientX;
      const rects = [].slice.call(wrap.querySelectorAll(".tab[data-id]")).map(b => {
        const r = b.getBoundingClientRect();
        return { id: b.getAttribute("data-id"), mid: r.left + r.width / 2 };
      });
      let target = rects.findIndex(r => x < r.mid);
      if (target === -1) target = rects.length - 1;
      const cur = orderRef.current.indexOf(dragId);
      if (target >= 0 && target !== cur) {
        const next = orderRef.current.slice();
        next.splice(cur, 1);
        next.splice(target, 0, dragId);
        setOrder(next);
      }
      if (e.cancelable) e.preventDefault();
    }
    function up() {
      persist("kunju-taborder", orderRef.current);
      setDragId(null);
    }
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [dragId]);
  function startPress(id) {
    lpFired.current = false;
    lpTimer.current = setTimeout(() => {
      lpFired.current = true;
      if (navigator.vibrate) try { navigator.vibrate(10); } catch (e) {}
      setDragId(id);
    }, 350);
  }
  function endPress() {
    if (lpTimer.current) { clearTimeout(lpTimer.current); lpTimer.current = null; }
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "tabs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tabs-track" + (dragId ? " reordering" : ""),
    ref: wrapRef
  }, order.map(id => /*#__PURE__*/React.createElement("button", {
    key: id,
    "data-id": id,
    className: "tab" + (tab === id ? " active" : "") + (dragId === id ? " dragging" : ""),
    onClick: () => {
      if (lpFired.current) { lpFired.current = false; return; }
      setTab(id);
    },
    onPointerDown: () => startPress(id),
    onPointerUp: endPress,
    onPointerLeave: endPress,
    onPointerCancel: endPress,
    onContextMenu: e => e.preventDefault()
  }, /*#__PURE__*/React.createElement("span", {
    className: "tab-icon"
  }, ITEMS[id].icon), /*#__PURE__*/React.createElement("span", {
    className: "tab-label"
  }, ITEMS[id].label))), profile));
}

/* ---------- Tense card ---------- */
function TenseCard({
  tense,
  pronouns,
  color,
  openDefault,
  ttsLang,
  highlight,
  sound,
  verb,
  langCode,
  engineName,
  hl,
  hint,
  onLearn
}) {
  const [open, setOpen] = useState(openDefault);
  const [tenseEx, setTenseEx] = useState(null);
  const native = recall("kunju-native", "German");
  function fetchTenseEx(fresh, attempt) {
    attempt = attempt || 0;
    const idx = tense.forms.findIndex(f => f && f !== "—");
    if (idx < 0) return;
    const form = tense.forms[idx];
    const pron = pronouns[idx];
    const skill = recall("kunju-skill", "beginner");
    const key = `kunju-tex2-${langCode}-${verb}-${tense.id}-${native}-${skill}`;
    const cached = recall(key, null);
    if (cached && !fresh) {
      setTenseEx({
        open: true,
        s: cached.s,
        n: cached.n
      });
      return;
    }
    if (!window.__hasAI()) {
      setTenseEx({
        open: true,
        error: 1
      });
      return;
    }
    const sameLang = native === engineName;
    const splitLang = langCode === "de" || langCode === "nl";
    const isCompound = form.indexOf(" ") >= 0;
    const freshTxt = fresh ? ` Give a DIFFERENT example than usual (variety #${Math.floor(Math.random() * 1000)}).` : "";
    const formInstr = isCompound && splitLang ? `that correctly expresses the ${tense.label} of "${verb}" for "${pron}" — its parts are ${form.split(" ").map(p => `"${p}"`).join(" + ")}. Use natural ${engineName} word order: the finite/auxiliary verb stays in SECOND position and the participle or infinitive moves to the very END of the clause (e.g. "du **hast** mir das Buch gestern **gegeben**"). Wrap EACH of those verb parts in **double asterisks** where they actually stand.` : `that uses exactly the verb form "${form}" — the ${tense.label} form (${pron}) of "${verb}". Wrap that exact verb form in **double asterisks**.`;
    const sepNote = splitLang ? ` IMPORTANT: if "${verb}" is a separable-prefix verb (trennbares Verb / scheidbaar werkwoord), split the prefix to the END of the main clause in simple tenses (e.g. "ausbreiten" → "Das Feuer breitete sich schnell aus", NEVER "ausbreitete"; "aufstehen" → "Ich stehe früh auf").` : "";
    const checkNote = ` Before replying, silently PROOFREAD the sentence and guarantee it is 100% correct standard ${engineName}: correct verb position, separable-prefix placement, case government, article/adjective/subject agreement and natural word order. If anything is off, fix it; output ONLY the corrected, fully grammatical sentence.`;
    const lvlNote = skill === "advanced" ? " Use richer C1-level vocabulary and, where natural, a subordinating clause." : skill === "intermediate" ? " Use everyday B1-level vocabulary." : " Use very simple A1–A2 vocabulary (max 7 words total).";
    const prompt = `Write ONE short, natural everyday sentence in ${engineName}${lvlNote} ${formInstr}${freshTxt}${sepNote} The sentence MUST be fully grammatical and idiomatic: use the verb with its correct case government, prepositions and subject (e.g. dative verbs like "gefallen"/"helfen" take a dative object; in German say "auf der Party", not "in der Party"). The sentence MUST end with proper punctuation (. ! or ?).${checkNote} ${sameLang ? `For "n", repeat the same sentence WITHOUT the asterisks.` : `For "n", give a natural ${native} translation of the whole sentence.`} Do NOT use any double-quote (") character inside either sentence. Reply with ONLY minified JSON and nothing else, exactly: {"s":"...","n":"..."}`;
    if (fresh) setTenseEx({
      open: true,
      loading: true
    });
    window.aiComplete(prompt).then(txt => {
      let j = null;
      try {
        j = looseParse(txt);
      } catch (_) {
        j = null;
      }
      if (!j || !j.s) {
        if (attempt < 1) {
          fetchTenseEx(fresh, attempt + 1);
          return;
        }
        setTenseEx({
          open: true,
          error: 1
        });
        return;
      }
      const out = {
        s: j.s,
        n: j.n || ""
      };
      persist(key, out);
      setTenseEx({
        open: true,
        s: out.s,
        n: out.n
      });
    }).catch(() => {
      if (attempt < 1) {
        fetchTenseEx(fresh, attempt + 1);
        return;
      }
      setTenseEx({
        open: true,
        error: 1
      });
    });
  }
  function toggleTenseEx() {
    if (tenseEx && (tenseEx.s || tenseEx.loading || tenseEx.error)) {
      setTenseEx(prev => ({
        ...prev,
        open: !prev.open
      }));
    } else {
      setTenseEx({
        open: true,
        loading: true
      });
      fetchTenseEx(false);
    }
  }
  const hasAnyForm = tense.forms.some(f => f && f !== "—");
  return /*#__PURE__*/React.createElement("div", {
    className: "tcard" + (open ? " open" : ""),
    style: {
      "--tc": LANG_META[langCode].color,
      "--dot": color
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "tcard-head",
    onClick: () => setOpen(o => !o)
  }, /*#__PURE__*/React.createElement("span", {
    className: "tcard-dot"
  }), /*#__PURE__*/React.createElement("span", {
    className: "tcard-title"
  }, tense.label, hint && /*#__PURE__*/React.createElement("span", {
    className: "tcard-hint"
  }, hint)), onLearn && /*#__PURE__*/React.createElement("span", {
    role: "button",
    tabIndex: 0,
    title: tr("tab_learn"),
    onClick: e => {
      e.stopPropagation();
      onLearn(tense.id);
    },
    onKeyDown: e => {
      if (e.key === "Enter" || e.key === " ") {
        e.stopPropagation();
        onLearn(tense.id);
      }
    },
    style: {
      flex: "none",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      marginRight: "8px",
      fontSize: "11px",
      fontWeight: 700,
      color: "var(--tc)",
      background: "color-mix(in srgb, var(--tc) 12%, var(--surface))",
      border: "1px solid color-mix(in srgb, var(--tc) 32%, var(--border))",
      borderRadius: "999px",
      padding: "3px 9px",
      cursor: "pointer",
      whiteSpace: "nowrap"
    }
  }, "\u2726 ", tr("tab_learn")), /*#__PURE__*/React.createElement("span", {
    className: "tcard-caret"
  }, open ? "−" : "+")), /*#__PURE__*/React.createElement("div", {
    className: "tcard-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tcard-rows"
  }, tense.forms.map((f, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "conjrow" + (hl && hl.indexOf(i) >= 0 ? " matched" : "")
  }, /*#__PURE__*/React.createElement("span", {
    className: "pron"
  }, pronouns[i]), /*#__PURE__*/React.createElement("span", {
    className: "form",
    dangerouslySetInnerHTML: {
      __html: highlight && tense.reg ? diffHTML(f, tense.reg[i]) : esc(f)
    }
  }), sound && f && f !== "—" && /*#__PURE__*/React.createElement("button", {
    className: "speakbtn",
    title: "Listen",
    onClick: ev => {
      ev.stopPropagation();
      speak(f, ttsLang);
    }
  }, /*#__PURE__*/React.createElement("span", { className: "ico-spk", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='1em' height='1em' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='display:block'><path d='M11 5 6 9H2v6h4l5 4V5z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/><path d='M19 5a9 9 0 0 1 0 14'/></svg>" } })))))), hasAnyForm && /*#__PURE__*/React.createElement("div", {
    className: "tcard-exbtn-row"
  }, /*#__PURE__*/React.createElement("button", {
    className: "tcard-exbtn",
    onClick: toggleTenseEx
  }, tenseEx && tenseEx.open ? "▾ Beispiel" : "＋ Beispiel")), tenseEx && tenseEx.open && /*#__PURE__*/React.createElement("div", {
    className: "exrow2"
  }, tenseEx.loading && /*#__PURE__*/React.createElement("span", {
    className: "exloading"
  }, "\u2026"), tenseEx.error && /*#__PURE__*/React.createElement("span", {
    className: "exloading"
  }, "No example available."), tenseEx.s && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "exrow2-top"
  }, /*#__PURE__*/React.createElement(WordSentence, {
    text: stripMark(tenseEx.s),
    fromName: engineName,
    toName: native,
    cachePrefix: `kunju-wtr-${langCode}-nat`,
    accent: true,
    saveLang: langCode,
    saveDir: "fromTarget"
  }), /*#__PURE__*/React.createElement("div", {
    className: "exrow2-btns"
  }, sound && /*#__PURE__*/React.createElement("button", {
    className: "speakbtn",
    title: "Listen",
    onClick: ev => {
      ev.stopPropagation();
      speak(stripMark(tenseEx.s), ttsLang);
    }
  }, /*#__PURE__*/React.createElement("span", { className: "ico-spk", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='1em' height='1em' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='display:block'><path d='M11 5 6 9H2v6h4l5 4V5z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/><path d='M19 5a9 9 0 0 1 0 14'/></svg>" } })), /*#__PURE__*/React.createElement("button", {
    className: "speakbtn exrefresh",
    title: "New example",
    onClick: ev => {
      ev.stopPropagation();
      fetchTenseEx(true);
    }
  }, "\u21BB"))), /*#__PURE__*/React.createElement("span", {
    className: "exnative2"
  }, tenseEx.n)))));
}

/* ---------- Deconjugation banner ---------- */
function DeconjBanner({
  deconj,
  lang,
  activeInf,
  onView
}) {
  const multi = deconj.infinitives.length > 1;
  const color = LANG_META[lang].color;
  return /*#__PURE__*/React.createElement("div", {
    className: "deconj",
    style: {
      "--lc": color
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "deconj-eyebrow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "deconj-turn"
  }, "\u21A9"), tr("dq_form")), /*#__PURE__*/React.createElement("div", {
    className: "deconj-form"
  }, "\u201C", deconj.input, "\u201D"), /*#__PURE__*/React.createElement("div", {
    className: "deconj-lines"
  }, deconj.analyses.map((a, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: "deconj-line" + (a.base === activeInf ? " on" : ""),
    onClick: () => multi && onView(a.base),
    disabled: !multi,
    style: {
      cursor: multi ? "pointer" : "default"
    }
  }, !a.noPerson && /*#__PURE__*/React.createElement("span", {
    className: "deconj-pron"
  }, a.pronouns.join(" / ")), /*#__PURE__*/React.createElement("span", {
    className: "deconj-tense"
  }, a.tenseLabel), multi && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "deconj-arrow"
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    className: "deconj-inf-mini"
  }, a.infinitive))))), /*#__PURE__*/React.createElement("div", {
    className: "deconj-foot"
  }, multi ? /*#__PURE__*/React.createElement("div", {
    className: "deconj-chips"
  }, /*#__PURE__*/React.createElement("span", {
    className: "deconj-inf-label"
  }, tr("dq_belongs")), deconj.infinitives.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.base,
    className: "deconj-chip" + (it.base === activeInf ? " on" : ""),
    onClick: () => onView(it.base)
  }, it.infinitive))) : /*#__PURE__*/React.createElement("div", {
    className: "deconj-inf-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "deconj-inf-label"
  }, tr("dq_infinitive")), /*#__PURE__*/React.createElement("span", {
    className: "deconj-inf"
  }, deconj.infinitives[0].infinitive), /*#__PURE__*/React.createElement("span", {
    className: "badge " + (deconj.infinitives[0].isIrregular ? "irr" : "reg")
  }, deconj.infinitives[0].isIrregular ? tr("irregular") : tr("regular"))), deconj.guessed ? /*#__PURE__*/React.createElement("span", {
    className: "deconj-fuzzy"
  }, "\u2248 ", tr("dq_guess")) : deconj.fuzzy && /*#__PURE__*/React.createElement("span", {
    className: "deconj-fuzzy"
  }, "\u2248 ", tr("dq_fuzzy"))));
}

/* ---------- Conjugate view ---------- */
function ConjugateView({
  engine,
  lang,
  verb,
  setVerb,
  result,
  onConjugate,
  t,
  favs,
  toggleFav,
  history,
  clearHistory,
  pickVerb,
  adVisible,
  onAdClick,
  onAdDismiss,
  name,
  translating,
  deconj,
  activeInf,
  onViewInf,
  onTab,
  onLearnTense
}) {
  const inputRef = useRef(null);
  const diceRef = useRef([]);
  const [hidden, setHidden] = useState({});
  const sugg = useMemo(() => suggestionsFor(lang), [lang]);
  const engMeaning = result && !result.error ? window.lookupMeaning(lang, result.infinitive.replace(/^to /, "")) : null;
  const [meaning, setMeaning] = useState(null);
  useEffect(() => {
    if (!result || result.error) {
      setMeaning(null);
      return;
    }
    const base = result.infinitive.replace(/^to /, "");
    const nativeName = recall("kunju-native", "German");
    const inst = nativeMeaningInstant(lang, base, nativeName);
    if (inst) {
      setMeaning(inst);
      return;
    }
    const key = `kunju-vtr-${lang}-${base}-${nativeName}`;
    const cached = recall(key, null);
    if (cached != null) {
      setMeaning(cached);
      return;
    }
    const fallback = nativeName === "English" ? engMeaning || null : null;
    if (!window.__hasAI()) {
      setMeaning(fallback);
      return;
    }
    setMeaning(null);
    let cancelled = false;
    window.aiComplete(`Translate the ${window.CONJ[lang].name} verb "${base}" into ${nativeName}. Reply with ONLY the ${nativeName} translation in its base/infinitive form, nothing else.`).then(txt => {
      if (cancelled) return;
      const t = String(txt || "").trim().replace(/^["'«»]+|["'«».]+$/g, "").split("\n")[0].trim();
      if (t) {
        persist(key, t);
        setMeaning(t);
      } else setMeaning(fallback);
    }).catch(() => {
      if (!cancelled) setMeaning(fallback);
    });
    return () => {
      cancelled = true;
    };
  }, [result, lang]);
  const isFav = result && !result.error && favs.some(x => x.lang === lang && x.verb === result.infinitive);
  const hlCells = useMemo(() => {
    if (!deconj || !activeInf) return null;
    const m = {};
    deconj.analyses.forEach(a => {
      if (a.base === activeInf && a.indices.length) m[a.tenseId] = (m[a.tenseId] || []).concat(a.indices);
    });
    return m;
  }, [deconj, activeInf]);
  const langHist = history.filter(x => x.lang === lang && !favs.some(f => f.lang === lang && f.verb === x.verb)).slice(0, 10);
  function rnd() {
    const pool = verbPool(lang);
    let v = null;
    for (let i = 0; i < 25; i++) {
      v = pool[Math.floor(Math.random() * pool.length)];
      if (diceRef.current.indexOf(v) < 0) break;
    }
    diceRef.current = [v, ...diceRef.current].slice(0, Math.min(40, Math.floor(pool.length / 2)));
    setVerb(v);
    onConjugate(v);
  }
  const [nativeVerb, setNativeVerb] = useState("");
  const [nativeBusy, setNativeBusy] = useState(false);
  const natName = recall("kunju-native", "German");
  const natCode = NATIVE_TO_UI[natName];
  const natBadge = natCode ? natCode.toUpperCase() : nativeLabel(natName).slice(0, 2).toUpperCase();
  function submitNative() {
    const w = (nativeVerb || "").trim().toLowerCase();
    if (!w || nativeBusy) return;
    if (natCode === lang) {
      setVerb(w);
      onConjugate(w);
      setNativeVerb("");
      return;
    }
    if (natCode) {
      const ct = conceptTranslate(w, natCode, lang);
      if (ct) {
        setVerb(ct);
        onConjugate(ct);
        setNativeVerb("");
        return;
      }
    }
    const key = `kunju-n2t-${natName}-${lang}-${w}`;
    const cached = recall(key, null);
    if (cached) {
      setVerb(cached);
      onConjugate(cached);
      setNativeVerb("");
      return;
    }
    if (!window.__hasAI()) return;
    setNativeBusy(true);
    window.aiComplete(`Translate the ${natName} verb "${w}" to its ${engine.name} infinitive. Reply with ONLY the single infinitive word in ${engine.name}, lowercase, no article, no extra text.`).then(txt => {
      const out = String(txt || "").trim().toLowerCase().replace(/^to\s+/, "").split(/\s+/)[0].replace(/[^a-zà-ÿ'’\-]/gi, "");
      setNativeBusy(false);
      if (out) {
        persist(key, out);
        setVerb(out);
        onConjugate(out);
        setNativeVerb("");
      }
    }).catch(() => setNativeBusy(false));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "view"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inputrow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inputfield"
  }, /*#__PURE__*/React.createElement("span", {
    className: "inputlead",
    style: {
      "--lc": LANG_META[lang].color
    }
  }, LANG_META[lang].code), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    value: verb,
    "aria-label": "Verb eingeben",
    placeholder: translating ? "↔ translating…" : "…",
    disabled: translating,
    onChange: e => setVerb(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") onConjugate(verb);
    },
    autoComplete: "off",
    autoCapitalize: "off",
    spellCheck: "false"
  }), verb && /*#__PURE__*/React.createElement("button", {
    className: "clearbtn",
    onClick: () => {
      setVerb("");
      inputRef.current && inputRef.current.focus();
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("button", {
    className: "dicebtn",
    title: "Random verb",
    onClick: rnd,
    "aria-label": "Random verb",
    style: {
      color: LANG_META[lang].color
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "26",
    height: "26",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2.5",
    y: "2.5",
    width: "19",
    height: "19",
    rx: "6.5",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "8",
    r: "1.85",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "8",
    r: "1.85",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "1.85",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "16",
    r: "1.85",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "16",
    r: "1.85",
    fill: "#fff"
  })))), /*#__PURE__*/React.createElement(AccentBar, {
    lang: lang,
    onInsert: c => {
      setVerb(verb + c);
      inputRef.current && inputRef.current.focus();
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "cta",
    onClick: () => onConjugate(verb)
  }, /*#__PURE__*/React.createElement("span", {
    className: "cta-rainbow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "cta-label"
  }, tr("conjugate"))), favs.filter(f => f.lang === lang).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "recent"
  }, /*#__PURE__*/React.createElement("div", {
    className: "recent-head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "recent-title"
  }, "\u2605 ", tr("saved"), " \xB7 ", favs.filter(f => f.lang === lang).length)), /*#__PURE__*/React.createElement("div", {
    className: "recent-chips"
  }, favs.filter(f => f.lang === lang).slice(0, 4).map((it, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: "recentchip",
    onClick: () => pickVerb(it.lang, it.verb)
  }, /*#__PURE__*/React.createElement("span", {
    className: "rc-flag"
  }, LANG_META[it.lang].code), it.verb)))), result && result.error && /*#__PURE__*/React.createElement("div", {
    className: "errorbox"
  }, result.error), result && !result.error && /*#__PURE__*/React.createElement("div", {
    className: "resultwrap"
  }, deconj && /*#__PURE__*/React.createElement(DeconjBanner, {
    deconj: deconj,
    lang: lang,
    activeInf: activeInf,
    onView: onViewInf
  }), /*#__PURE__*/React.createElement("div", {
    className: "resulthead",
    style: {
      "--lc": LANG_META[lang].color
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "rh-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rh-lang"
  }, LANG_META[lang].code), /*#__PURE__*/React.createElement("span", {
    className: "badge " + (result.isIrregular ? "irr" : "reg")
  }, result.isIrregular ? tr("irregular") : tr("regular")), /*#__PURE__*/React.createElement("button", {
    className: "starbtn" + (isFav ? " on" : ""),
    title: "Save verb",
    onClick: () => toggleFav(lang, result.infinitive)
  }, isFav ? "★" : "☆")), /*#__PURE__*/React.createElement("h2", {
    className: "rh-verb"
  }, result.infinitive), meaning && meaning.toLowerCase() !== result.infinitive.replace(/^to /, "").toLowerCase() && /*#__PURE__*/React.createElement("div", {
    className: "rh-meaning"
  }, /*#__PURE__*/React.createElement("b", null, result.infinitive.replace(/^to /, "")), /*#__PURE__*/React.createElement("em", null, meaning)), /*#__PURE__*/React.createElement("div", {
    className: "rh-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "exportbtn",
    title: "Share (WhatsApp \u2026)",
    onClick: () => shareConjugation(result, lang, meaning)
  }, "\u2197"), /*#__PURE__*/React.createElement("button", {
    className: "exportbtn pdf",
    title: "Save as image (PNG)",
    onClick: () => exportImage(result, lang, meaning)
  }, "PNG"), /*#__PURE__*/React.createElement("button", {
    className: "exportbtn pdf",
    title: "Save as PDF",
    onClick: () => exportPDF(result, lang, meaning)
  }, "PDF"))), /*#__PURE__*/React.createElement("div", {
    className: "formalnote"
  }, "\u24D8 ", FORMALITY[lang]), /*#__PURE__*/React.createElement("div", {
    className: "qfilter-block",
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "recent-title qfilter-lbl"
  }, tr("which_tense")), /*#__PURE__*/React.createElement(TenseDropdown, {
    lang: lang,
    tenses: result.tenses,
    isOn: id => !hidden[id],
    onToggle: id => setHidden(h => {
      const next = {
        ...h,
        [id]: !h[id]
      };
      persist(`kunju-tenses-${lang}`, result.tenses.map(t2 => t2.id).filter(x => !next[x]));
      return next;
    }),
    onAll: () => {
      setHidden({});
      persist(`kunju-tenses-${lang}`, result.tenses.map(t2 => t2.id));
    },
    onNone: () => {
      const h = {};
      result.tenses.forEach(t2 => {
        h[t2.id] = true;
      });
      setHidden(h);
      persist(`kunju-tenses-${lang}`, []);
    }
  })), (() => {
    const perf = result.tenses.find(t2 => t2.id === "perfect");
    const pf0 = perf && perf.forms && perf.forms[0];
    const isEtreVerb = lang === "fr" && pf0 && (pf0.startsWith("suis ") || pf0.includes(" suis "));
    const isSeinVerb = lang === "de" && pf0 && pf0.startsWith("bin ");
    const isZijnVerb = lang === "nl" && pf0 && pf0.startsWith("ben ");
    const esNote = lang === "es" && result.infinitive && (() => {
      const n = ES_VERB_NOTES[result.infinitive] || (ES_GUSTAR_VERBS.has(result.infinitive) ? ES_VERB_NOTES.gustar : null);
      return n ? n[UILANG] || n.en : null;
    })();
    return /*#__PURE__*/React.createElement(React.Fragment, null, esNote && /*#__PURE__*/React.createElement("div", {
      className: "verb-note"
    }, "\uD83D\uDCA1 ", esNote), GROUP_ORDER.map(g => {
      const inGroup = result.tenses.map((t2, i) => ({
        t2,
        i
      })).filter(x => tenseGroup(x.t2.id) === g && !hidden[x.t2.id]);
      if (!inGroup.length) return null;
      return /*#__PURE__*/React.createElement(React.Fragment, {
        key: g
      }, g !== "ind" && /*#__PURE__*/React.createElement("div", {
        className: "tgrouphead"
      }, tr("gr_" + g)), inGroup.map(({
        t2,
        i
      }) => {
        const hint = isEtreVerb && FR_ETRE_TENSES.has(t2.id) ? "Fém. +e · Plur. +s" : isSeinVerb && DE_NL_AUX_TENSES.has(t2.id) ? "Hilfsverb: sein" : isZijnVerb && DE_NL_AUX_TENSES.has(t2.id) ? "Hulpww.: zijn" : null;
        return /*#__PURE__*/React.createElement(TenseCard, {
          key: t2.id,
          tense: t2,
          pronouns: result.pronouns,
          color: RAINBOW[i % RAINBOW.length],
          openDefault: true,
          ttsLang: engine.ttsLang,
          highlight: t.highlight && result.isIrregular,
          sound: t.sound,
          verb: result.infinitive,
          langCode: lang,
          engineName: engine.name,
          hl: hlCells && hlCells[t2.id],
          hint: hint,
          onLearn: onLearnTense
        });
      }));
    }));
  })(), t.sponsor && adVisible && SPONSORS[lang] && /*#__PURE__*/React.createElement(AdCard, {
    sponsor: SPONSORS[lang],
    hook: result.isIrregular ? `Drill irregular ${engine.name} verbs` : `Practice ${engine.name} verbs daily`,
    onClick: onAdClick,
    onDismiss: onAdDismiss
  })), !result && /*#__PURE__*/React.createElement("div", {
    className: "emptystate emptyguide"
  }, /*#__PURE__*/React.createElement("div", {
    className: "eg-hero",
    style: {
      "--lc": LANG_META[lang].color,
      "--lc2": HERO_CLAIM[lang].c2
    }
  }, HERO_CONFETTI.map((c, i) => {
    const cc = [LANG_META[lang].color, HERO_CLAIM[lang].c2, "#ffc400", "#34c759"];
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      className: "eg-confetti",
      style: {
        top: c.top,
        left: c.left,
        width: c.w,
        height: c.h,
        opacity: c.o,
        transform: `rotate(${c.rot}deg)`,
        background: cc[i % cc.length],
        borderRadius: c.w === c.h ? "50%" : "2px"
      }
    });
  }), name && /*#__PURE__*/React.createElement("p", {
    className: "eg-kicker"
  }, tr("hero_kicker", {
    name
  })), /*#__PURE__*/React.createElement("h2", {
    className: "eg-l1"
  }, HERO_CLAIM[lang].pre, /*#__PURE__*/React.createElement("span", {
    className: "eg-lng"
  }, HERO_CLAIM[lang].lng)), /*#__PURE__*/React.createElement("div", {
    className: "eg-accent"
  }, HERO_CLAIM[lang].accent, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 200 13",
    preserveAspectRatio: "none",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 8 C 45 2, 90 2, 130 6 S 185 11, 197 5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "3.5",
    strokeLinecap: "round",
    opacity: "0.5"
  }))), /*#__PURE__*/React.createElement("p", {
    className: "eg-plan"
  }, name ? tr("hero_plan", {
    name
  }) : tr("hero_plan_anon"))), /*#__PURE__*/React.createElement("div", {
    className: "eg-cards"
  }, /*#__PURE__*/React.createElement("button", {
    className: "eg-card",
    onClick: rnd
  }, /*#__PURE__*/React.createElement("span", {
    className: "eg-ic",
    style: {
      color: LANG_META[lang].color
    }
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "2.5",
    y: "2.5",
    width: "19",
    height: "19",
    rx: "6.5",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "8",
    r: "1.85",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "8",
    r: "1.85",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "1.85",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "16",
    r: "1.85",
    fill: "#fff"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "16",
    cy: "16",
    r: "1.85",
    fill: "#fff"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "eg-tx"
  }, /*#__PURE__*/React.createElement("b", {
    className: "eg-n"
  }, "1"), tr("eg_step1")), /*#__PURE__*/React.createElement("span", {
    className: "eg-go"
  }, "\u2192")), /*#__PURE__*/React.createElement("button", {
    className: "eg-card",
    onClick: () => onTab && onTab("quiz")
  }, /*#__PURE__*/React.createElement("span", {
    className: "eg-ic eg-ic-glyph",
    style: {
      color: LANG_META[lang].color
    }
  }, "\u25C6"), /*#__PURE__*/React.createElement("span", {
    className: "eg-tx"
  }, /*#__PURE__*/React.createElement("b", {
    className: "eg-n"
  }, "2"), tr("eg_step2")), /*#__PURE__*/React.createElement("span", {
    className: "eg-go"
  }, "\u2192")), /*#__PURE__*/React.createElement("button", {
    className: "eg-card",
    onClick: () => onTab && onTab("saved")
  }, /*#__PURE__*/React.createElement("span", {
    className: "eg-ic eg-ic-glyph",
    style: {
      color: LANG_META[lang].color
    }
  }, "\u2605"), /*#__PURE__*/React.createElement("span", {
    className: "eg-tx"
  }, /*#__PURE__*/React.createElement("b", {
    className: "eg-n"
  }, "3"), tr("eg_step3")), /*#__PURE__*/React.createElement("span", {
    className: "eg-go"
  }, "\u2192")))));
}

/* ---------- Quiz ---------- */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function norm(s) {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}
function buildQuestion(lang, tenseId, pool) {
  const eng = window.CONJ[lang];
  for (let tries = 0; tries < 22; tries++) {
    const v = pick(pool);
    const r = eng.conjugate(v);
    if (!r || r.error) continue;
    let t;
    // Non-finite forms (Partizip I / gerund / present participle) have no person —
    // never quiz them with a pronoun. They stay visible in the conjugation table only.
    if (tenseId === "all") t = pick(r.tenses.filter(x => !x.nonFinite));else if (Array.isArray(tenseId)) {
      const avail = r.tenses.filter(x => tenseId.indexOf(x.id) >= 0 && !x.nonFinite);
      if (!avail.length) continue;
      t = pick(avail);
    } else {
      t = r.tenses.find(x => x.id === tenseId && !x.nonFinite);
      if (!t) continue;
    }
    const idxs = [];
    t.forms.forEach((f, i) => {
      if (f && f !== "—") idxs.push(i);
    });
    if (!idxs.length) continue;
    const pi = pick(idxs);
    const answer = t.forms[pi];
    // distractors: prefer forms from the same selected tense(s); only widen if too few
    const allowed = tenseId === "all" ? null : Array.isArray(tenseId) ? tenseId : [tenseId];
    const cand = new Set();
    r.tenses.forEach(tt => {
      if (tt.nonFinite) return;
      if (allowed && allowed.indexOf(tt.id) < 0) return;
      tt.forms.forEach(f => {
        if (f && f !== "—" && norm(f) !== norm(answer)) cand.add(f);
      });
    });
    if (cand.size < 3) r.tenses.forEach(tt => tt.nonFinite || tt.forms.forEach(f => {
      if (f && f !== "—" && norm(f) !== norm(answer)) cand.add(f);
    }));
    const distract = shuffle([...cand]).slice(0, 3);
    const options = shuffle([answer, ...distract]);
    return {
      lang,
      verb: r.infinitive,
      tenseId: t.id,
      tenseLabel: t.label,
      pronoun: r.pronouns[pi],
      answer,
      options,
      isIrregular: r.isIrregular,
      ttsLang: eng.ttsLang
    };
  }
  return null;
}

/* Sentence-speaking helpers: varied topics + warm feedback lines */
const SPK_THEMES = [{
  id: "random",
  topic: ""
}, {
  id: "shopping",
  topic: "shopping and stores"
}, {
  id: "office",
  topic: "an official or government appointment (bureaucracy)"
}, {
  id: "doctor",
  topic: "a doctor, pharmacy or health situation"
}, {
  id: "family",
  topic: "family, kids and home life"
}, {
  id: "travel",
  topic: "travelling, trains and asking directions"
}, {
  id: "restaurant",
  topic: "a restaurant, café or ordering food"
}, {
  id: "work",
  topic: "work, office and appointments"
}, {
  id: "freetime",
  topic: "free time, hobbies and sport"
}, {
  id: "sport",
  topic: "sport, exercise and the gym"
}, {
  id: "pregnancy",
  topic: "pregnancy, baby and expecting a child"
}, {
  id: "finance",
  topic: "finance, money, banking and the economy"
}, {
  id: "proverb",
  topic: "a well-known traditional proverb or saying from a country where the language is spoken"
}];
const THEME_LABELS = {
  de: {
    random: "Zufällig",
    shopping: "Einkaufen",
    office: "Behörde",
    doctor: "Arztbesuch",
    family: "Familie",
    travel: "Reisen",
    restaurant: "Restaurant",
    work: "Arbeit",
    freetime: "Freizeit",
    sport: "Sport",
    pregnancy: "Schwangerschaft",
    finance: "Finanzen & Wirtschaft",
    proverb: "Sprichworte"
  },
  en: {
    random: "Random",
    shopping: "Shopping",
    office: "Authorities",
    doctor: "Doctor",
    family: "Family",
    travel: "Travel",
    restaurant: "Restaurant",
    work: "Work",
    freetime: "Free time",
    sport: "Sport",
    pregnancy: "Pregnancy",
    finance: "Finance & economy",
    proverb: "Proverbs"
  },
  es: {
    random: "Aleatorio",
    shopping: "Compras",
    office: "Trámites",
    doctor: "Médico",
    family: "Familia",
    travel: "Viajes",
    restaurant: "Restaurante",
    work: "Trabajo",
    freetime: "Ocio",
    sport: "Deporte",
    pregnancy: "Embarazo",
    finance: "Finanzas y economía",
    proverb: "Refranes"
  },
  nl: {
    random: "Willekeurig",
    shopping: "Winkelen",
    office: "Overheid",
    doctor: "Dokter",
    family: "Familie",
    travel: "Reizen",
    restaurant: "Restaurant",
    work: "Werk",
    freetime: "Vrije tijd",
    sport: "Sport",
    pregnancy: "Zwangerschap",
    finance: "Financiën & economie",
    proverb: "Spreekwoorden"
  },
  fr: {
    random: "Aléatoire",
    shopping: "Achats",
    office: "Démarches",
    doctor: "Médecin",
    family: "Famille",
    travel: "Voyages",
    restaurant: "Restaurant",
    work: "Travail",
    freetime: "Loisirs",
    sport: "Sport",
    pregnancy: "Grossesse",
    finance: "Finance & économie",
    proverb: "Proverbes"
  }
};
function themeLabel(id) {
  if (id && id.startsWith("cat:")) return id.slice(4);
  const m = THEME_LABELS[UILANG] || THEME_LABELS.en;
  return m[id] || id;
}

/* Verb-group filters for the quiz (per language). "words" = practice with the
   learner's saved vocabulary woven into the example sentences. */
const VERB_GROUPS = {
  es: [{
    id: "all"
  }, {
    id: "challenge"
  }, {
    id: "words"
  }, {
    id: "saved"
  }, {
    id: "irregular"
  }, {
    id: "ar",
    suf: "ar"
  }, {
    id: "er",
    suf: "er"
  }, {
    id: "ir",
    suf: "ir"
  }],
  fr: [{
    id: "all"
  }, {
    id: "challenge"
  }, {
    id: "words"
  }, {
    id: "saved"
  }, {
    id: "irregular"
  }, {
    id: "er",
    suf: "er"
  }, {
    id: "ir",
    suf: "ir"
  }, {
    id: "re",
    suf: "re"
  }],
  de: [{
    id: "all"
  }, {
    id: "challenge"
  }, {
    id: "words"
  }, {
    id: "saved"
  }, {
    id: "irregular"
  }, {
    id: "regular"
  }],
  nl: [{
    id: "all"
  }, {
    id: "challenge"
  }, {
    id: "words"
  }, {
    id: "saved"
  }, {
    id: "irregular"
  }, {
    id: "regular"
  }],
  en: [{
    id: "all"
  }, {
    id: "challenge"
  }, {
    id: "words"
  }, {
    id: "saved"
  }, {
    id: "irregular"
  }, {
    id: "regular"
  }]
};
const GROUP_LABELS = {
  de: {
    all: "Alle",
    challenge: "Challenge",
    words: "Gespeicherte Wörter",
    saved: "Gespeicherte Verben",
    irregular: "Unregelmäßig",
    regular: "Regelmäßig"
  },
  en: {
    all: "All",
    challenge: "Challenge",
    words: "Saved words",
    saved: "Saved verbs",
    irregular: "Irregular",
    regular: "Regular"
  },
  es: {
    all: "Todos",
    challenge: "Challenge",
    words: "Palabras guardadas",
    saved: "Verbos guardados",
    irregular: "Irregulares",
    regular: "Regulares"
  },
  nl: {
    all: "Alle",
    challenge: "Challenge",
    words: "Bewaarde woorden",
    saved: "Bewaarde werkwoorden",
    irregular: "Onregelmatig",
    regular: "Regelmatig"
  },
  fr: {
    all: "Tous",
    challenge: "Challenge",
    words: "Mots mémorisés",
    saved: "Verbes mémorisés",
    irregular: "Irréguliers",
    regular: "Réguliers"
  }
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
function praiseLine() {
  const a = PRAISE[UILANG] || PRAISE.en;
  return _withName(a[Math.floor(Math.random() * a.length)]);
}
function cheerLine() {
  const a = CHEER[UILANG] || CHEER.en;
  return _withName(a[Math.floor(Math.random() * a.length)]);
}
/* Milestone praise (no emoji — the confetti carries the celebration). */
const MILESTONE_LINES = {
  de: { m5: "5 in Folge — stark!", m10: "10 am Stück — beeindruckend!", more: "{n} in Folge!" },
  en: { m5: "5 in a row — strong!", m10: "10 straight — impressive!", more: "{n} in a row!" },
  es: { m5: "¡5 seguidas — genial!", m10: "¡10 seguidas — impresionante!", more: "¡{n} seguidas!" },
  nl: { m5: "5 op rij — sterk!", m10: "10 op rij — indrukwekkend!", more: "{n} op rij!" },
  fr: { m5: "5 d'affilée — fort !", m10: "10 d'affilée — impressionnant !", more: "{n} d'affilée !" }
};
function isStreakMilestone(s) { return s === 5 || s === 10 || (s > 10 && s % 10 === 0); }
function praiseFor(streak) {
  if (isStreakMilestone(streak)) {
    const m = MILESTONE_LINES[UILANG] || MILESTONE_LINES.en;
    const line = streak === 5 ? m.m5 : streak === 10 ? m.m10 : m.more;
    return _withName(line.replace("{n}", streak));
  }
  return praiseLine();
}
/* Short, restrained confetti burst in CI colors — non-blocking, self-removing,
   skipped when the user prefers reduced motion. */
function fireConfetti(intensity) {
  try {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const COLORS = ["#ff3b5c", "#ff7a18", "#ffc400", "#34c759", "#00bcd4", "#0a84ff", "#a557ff"];
    const n = intensity >= 10 ? 30 : 18;
    const wrap = document.createElement("div");
    wrap.className = "confetti-wrap";
    document.body.appendChild(wrap);
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      p.className = "confetti-bit";
      p.style.background = COLORS[i % COLORS.length];
      p.style.left = (50 + (Math.random() * 36 - 18)) + "vw";
      p.style.top = "44vh";
      wrap.appendChild(p);
      const dx = (Math.random() * 2 - 1) * 230;
      const dy = (Math.random() * -1 - 0.25) * 170;
      const rot = (Math.random() * 2 - 1) * 540;
      p.animate([
        { transform: "translate(0,0) rotate(0deg)", opacity: 1 },
        { transform: "translate(" + dx * 0.5 + "px," + dy + "px) rotate(" + rot * 0.5 + "deg)", opacity: 1, offset: 0.45 },
        { transform: "translate(" + dx + "px," + (dy + 340) + "px) rotate(" + rot + "deg)", opacity: 0 }
      ], { duration: 1150 + Math.random() * 450, easing: "cubic-bezier(.2,.6,.3,1)" });
    }
    setTimeout(() => wrap.remove(), 1750);
  } catch (e) {}
}

/* Tappable sentence: tap a word to see its translation (shown as a stable chip
   below — robust on mobile, never clipped). Direction set via from/to. */
function WordSentence({
  text,
  fromName,
  toName,
  cachePrefix,
  big,
  accent,
  saveLang,
  saveDir,
  showHint,
  wordChip,
  inline,
  savedSet,
  onSaved
}) {
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
  function clean(w) {
    return w.replace(/[^\p{L}\p{N}'’\-]/gu, "").toLowerCase();
  }
  function savedW(w) {
    const c = clean(w);
    return !!(c && savedSet && savedSet.has(deburr(norm(c))));
  }
  const underlineStyle = {
    textDecoration: "underline",
    textDecorationColor: "var(--lc, #a557ff)",
    textDecorationThickness: "2px",
    textUnderlineOffset: "3px"
  };
  function tap(w, i) {
    const c = clean(w);
    if (!c) return;
    if (openW && openW.i === i) {
      setOpenW(null);
      return;
    }
    setOpenW({
      w: c,
      i
    });
    if (trans[c] != null) return;
    const key = `${cachePrefix}-${c}`;
    const cached = recall(key, null);
    if (cached != null) {
      setTrans(t => ({
        ...t,
        [c]: cached
      }));
      return;
    }
    if (!window.__hasAI()) {
      setTrans(t => ({
        ...t,
        [c]: "—"
      }));
      return;
    }
    setTrans(t => ({
      ...t,
      [c]: "…"
    }));
    window.aiComplete(`In the ${fromName} sentence "${text}", what does the word "${c}" mean in ${toName}? Reply with ONLY the ${toName} translation, 1–3 words, no punctuation, no extra text.`).then(r => {
      const out = String(r || "").trim().replace(/^["'.]+|["'.]+$/g, "").split("\n")[0].trim() || "—";
      persist(key, out);
      setTrans(t => ({
        ...t,
        [c]: out
      }));
    }).catch(() => setTrans(t => ({
      ...t,
      [c]: "—"
    })));
  }
  function saveWord() {
    if (!saveLang || !openW) return;
    const c = openW.w;
    // Aus dem Text gemerkte Wörter landen immer in „Gemerkte Wörter". Verben
    // verschiebt man bei Bedarf selbst (Listen-Kürzel → „Gemerkte Verben") —
    // automatische Verb-Erkennung war zu fehleranfällig (z. B. „Hand" → „han").
    function afterTrans(tvRaw) {
      const tv = !tvRaw || tvRaw === "…" || tvRaw === "—" ? "" : tvRaw;
      const term = saveDir === "fromTarget" ? c : tv || c;
      const native = saveDir === "fromTarget" ? tv : c;
      // Aus dem Text gemerkte Wörter landen im Sammelplatz „Gemerkte Wörter"
      // (generalCat). Keine automatische KI-Themenzuordnung mehr — man sortiert
      // selbst in eigene Listen. Kurzer Hinweis zeigt, wohin es ging.
      const entry = {
        id: Date.now() + "",
        lang: saveLang,
        term,
        trans: native,
        cat: generalCat(),
        kind: "word",
        created: Date.now(),
        nat: recall("kunju-native", "German")
      };
      const list = getVocab();
      if (!list.some(x => x.lang === entry.lang && norm(x.term) === norm(entry.term))) saveVocab([entry, ...list]);
      setSaved(s => ({ ...s, [c]: true }));
      if (window.__toast) window.__toast(tr("gm_saved_toast", { w: c }));
    }
    setSaved(s => ({
      ...s,
      [c]: "saving"
    }));
    const have = trans[c];
    if (have && have !== "…" && have !== "—") {
      afterTrans(have);
      return;
    }
    // translation not loaded yet — fetch it, then save
    const tkey = `${cachePrefix}-${c}`;
    const tc = recall(tkey, null);
    if (tc != null) {
      setTrans(t => ({
        ...t,
        [c]: tc
      }));
      afterTrans(tc);
      return;
    }
    if (!window.__hasAI()) {
      afterTrans("");
      return;
    }
    window.aiComplete(`In the ${fromName} sentence "${text}", what does the word "${c}" mean in ${toName}? Reply with ONLY the ${toName} translation, 1–3 words, no punctuation, no extra text.`).then(r => {
      const out = String(r || "").trim().replace(/^["'«».]+|["'«».]+$/g, "").split("\n")[0].trim();
      if (out) {
        persist(tkey, out);
        setTrans(t => ({
          ...t,
          [c]: out
        }));
      }
      afterTrans(out);
    }).catch(() => afterTrans(""));
  }
  function chipInner() {
    const c = openW.w;
    const isSaved = !!(savedSet && savedSet.has(deburr(norm(c))));
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, c), " \u2192 ", /*#__PURE__*/React.createElement("span", null, trans[c] || "…"), saveLang && (isSaved ? /*#__PURE__*/React.createElement("button", {
      className: "wsave saved",
      onClick: () => onSaved && onSaved()
    }, "\u2713 ", tr("tab_saved"), " \u2192") : saved[c] === "saving" ? /*#__PURE__*/React.createElement("span", {
      className: "wsave saved"
    }, "\u2026") : saved[c] ? /*#__PURE__*/React.createElement("span", {
      className: "wsave saved"
    }, "\u2713 ", tr("vocab_saved")) : /*#__PURE__*/React.createElement("button", {
      className: "wsave",
      onClick: saveWord
    }, "+ ", tr("vocab_save"))));
  }
  if (inline) return /*#__PURE__*/React.createElement("span", {
    className: "wsent" + (big ? " big" : "") + (accent ? " accent" : ""),
    style: {
      lineHeight: "inherit"
    }
  }, parts.map((w, i) => {
    if (/^\s+$/.test(w) || !clean(w)) return /*#__PURE__*/React.createElement("span", {
      key: i
    }, w);
    const isOpen = openW && openW.i === i;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("span", {
      className: "wword" + (isOpen ? " open" : ""),
      style: savedW(w) ? underlineStyle : undefined,
      onClick: () => tap(w, i)
    }, w), isOpen && /*#__PURE__*/React.createElement("span", {
      className: "wtrans-inline",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        verticalAlign: "middle",
        margin: "1px 5px",
        padding: "3px 10px",
        borderRadius: "999px",
        background: "color-mix(in srgb, var(--lc, #a557ff) 13%, var(--surface))",
        border: "1px solid color-mix(in srgb, var(--lc, #a557ff) 32%, var(--border))",
        fontSize: "13px",
        fontWeight: 600,
        whiteSpace: "nowrap"
      }
    }, chipInner()));
  }));
  return /*#__PURE__*/React.createElement("div", {
    className: "wsentwrap"
  }, hintVisible && /*#__PURE__*/React.createElement("div", {
    className: "word-tap-hint"
  }, txtIco(IC_TAP, "W\xF6rter antippen \u2192 Bedeutung & merken")), /*#__PURE__*/React.createElement("div", {
    className: "wsent" + (big ? " big" : "") + (accent ? " accent" : "")
  }, parts.map((w, i) => {
    if (/^\s+$/.test(w) || !clean(w)) return /*#__PURE__*/React.createElement("span", {
      key: i
    }, w);
    const isOpen = openW && openW.i === i;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("span", {
      className: "wword" + (isOpen ? " open" : ""),
      style: savedW(w) ? underlineStyle : undefined,
      onClick: () => tap(w, i)
    }, w), wordChip && isOpen && /*#__PURE__*/React.createElement("span", {
      className: "wtrans-inline",
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        verticalAlign: "middle",
        margin: "1px 5px",
        padding: "3px 10px",
        borderRadius: "999px",
        background: "color-mix(in srgb, var(--lc, #a557ff) 13%, var(--surface))",
        border: "1px solid color-mix(in srgb, var(--lc, #a557ff) 32%, var(--border))",
        fontSize: "13px",
        fontWeight: 600,
        whiteSpace: "nowrap"
      }
    }, chipInner()));
  })), !wordChip && openW && /*#__PURE__*/React.createElement("div", {
    className: "wtrans"
  }, chipInner()));
}
function QuizView({
  lang,
  favs,
  toggleFav,
  sound,
  skill,
  onSkill,
  onStudy,
  onActivity,
  isActive,
  onTab,
  onHint
}) {
  const eng = window.CONJ[lang];
  const tenseOpts = useMemo(() => {
    const r = eng.conjugate(eng.samples[0]);
    return r && r.tenses ? r.tenses.filter(t => !t.nonFinite).map(t => ({
      id: t.id,
      label: t.label
    })) : [];
  }, [lang]);
  const pool = useMemo(() => {
    const base = quizPool(lang, skill || "beginner");
    const favVerbs = favs.filter(f => f.lang === lang).map(f => f.verb);
    favVerbs.forEach(v => {
      if (base.indexOf(v) < 0) base.push(v);
    });
    // add 4 extra copies of each favorite → ~5× higher pick probability
    for (let i = 0; i < 4; i++) favVerbs.forEach(v => base.push(v));
    return base;
  }, [lang, favs, skill]);
  const [mode, setMode] = useState("cards");
  // First time the user opens a given quiz mode, ask for its explainer popup.
  useEffect(() => {
    if (isActive && onHint) onHint("quiz_" + mode);
  }, [mode, isActive]);
  const allTenseIds = useMemo(() => tenseOpts.map(t => t.id), [tenseOpts]);
  const [tenseSel, setTenseSel] = useState([]);
  const [mistMode, setMistMode] = useState(false);
  const allTensesOn = tenseSel.length > 0 && tenseSel.length === allTenseIds.length;
  const [selGroup, setSelGroup] = useState(() => recall("kunju-quiz-group", "all"));
  const _chActive = (() => {
    const g = recall("kunju-goal-data", null);
    return !!(g && Array.isArray(g.verbList) && g.verbList.length);
  })();
  // "Challenge" nur als Auswahl zeigen, wenn wirklich eine aktiv ist (#28/🅔)
  const groups = (VERB_GROUPS[lang] || [{
    id: "all"
  }]).filter(g => g.id !== "challenge" || _chActive);
  function pickGroup(id) {
    setSelGroup(id);
    persist("kunju-quiz-group", id);
    clozeMyWordsRef.current = id === "words"; // saved vocab → into example sentences
  }
  const filteredPool = useMemo(() => {
    if (selGroup === "all" || selGroup === "words") return pool; // "words" keeps all verbs; saved vocab goes into the sentences
    if (selGroup === "challenge") {
      // Vorrangig (nicht exklusiv): noch nicht „sitzende" Challenge-Verben mehrfach
      // gewichtet + der normale Pool für Abwechslung.
      const g = recall("kunju-goal-data", null);
      const cv = ((g && g.verbList) || []).filter(x => (x.done || 0) < CH_DONE).map(x => String(x.v || "").replace(/^to /, "").trim()).filter(Boolean);
      if (!cv.length) return pool;
      const weighted = [];
      for (let i = 0; i < 4; i++) cv.forEach(v => weighted.push(v));
      pool.forEach(v => weighted.push(v));
      return weighted;
    }
    if (selGroup === "saved") {
      const f = (favs || []).filter(x => x.lang === lang).map(x => x.verb).filter(v => pool.includes(v));
      return f.length ? f : pool;
    }
    const irr = new Set(window.CONJ[lang].irregulars || []);
    if (selGroup === "irregular") {
      const f = pool.filter(v => irr.has(v));
      return f.length ? f : pool;
    }
    if (selGroup === "regular") {
      const f = pool.filter(v => !irr.has(v));
      return f.length ? f : pool;
    }
    const g = groups.find(x => x.id === selGroup);
    if (g && g.suf) {
      const f = pool.filter(v => v.endsWith(g.suf));
      return f.length ? f : pool;
    }
    return pool;
  }, [pool, selGroup, lang, favs]);
  const [q, setQ] = useState(null);
  const [val, setVal] = useState("");
  const [state, setState] = useState("idle");
  const [picked, setPicked] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [transl, setTransl] = useState(null);
  const translReqRef = useRef(""); // guards against stale async translations landing on the next card
  const [prevCards, setPrevCards] = useState([]);
  const [speedLog, setSpeedLog] = useState([]);
  const [mver, setMver] = useState(0);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [micHint, setMicHint] = useState(false); // true → native Prompt half nicht, geräte­genaue Anleitung zeigen
  const [msg, setMsg] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(() => recall("kunju-autospeak", false));
  function toggleAutoSpeak() {
    setAutoSpeak(v => {
      const n = !v;
      persist("kunju-autospeak", n);
      return n;
    });
  }
  const [spkMode, setSpkMode] = useState("form");
  const [typeMode, setTypeMode] = useState("form");
  const [revealed, setRevealed] = useState(false);
  const [sentMistMode, setSentMistMode] = useState(false);
  const [smver, setSmver] = useState(0);
  const [cloze, setCloze] = useState(null);
  const [topicsSel, setTopicsSel] = useState(["random"]);
  const [sent, setSent] = useState(null);
  const [spkTarget, setSpkTarget] = useState(lang);
  const [score, setScore] = useState({
    right: 0,
    total: 0,
    streak: 0
  });
  const inRef = useRef(null);
  const [chMoment, setChMoment] = useState(null); // Verb, das gerade „sitzt" → kurzer Erfolgsmoment (🅓)
  const chMomentTimer = useRef(null);
  function showChMoment(verb) {
    const v = String(verb || "").replace(/^to /, "").trim();
    if (!v) return;
    setChMoment(v);
    try {
      fireConfetti(6);
    } catch (e) {}
    if (chMomentTimer.current) clearTimeout(chMomentTimer.current);
    chMomentTimer.current = setTimeout(() => setChMoment(null), 3200);
  }
  // „Fehler melden"-Link unter KI-Beispielsätzen
  function reportBtn() {
    if (!cloze || cloze.loading || !cloze.full) return null;
    return /*#__PURE__*/React.createElement("button", {
      className: "rep-link",
      onClick: () => window.__openReport && window.__openReport({ kind: "sentence", lang: lang, sentence: cloze.full, translation: cloze.native, verb: q && q.verb, tense: q && q.tenseLabel, pronoun: q && q.pronoun })
    }, /*#__PURE__*/React.createElement("span", { className: "rep-link-ic", dangerouslySetInnerHTML: { __html: IC_FLAG } }), tr("report_link"));
  }
  const recentRef = useRef([]);
  const recentSentRef = useRef({});
  const recRef = useRef(null);
  const transcriptRef = useRef("");
  const mediaRecRef = useRef(null); // MediaRecorder für Server-Spracherkennung (Browser ohne Web Speech API)
  const mediaChunksRef = useRef([]);
  // ---- TEXTE (story) mode ----
  const [texteMode, setTexteMode] = useState("question"); // Texte = Lesen + Verständnisfragen
  const [story, setStory] = useState(null); // null | {loading} | {error} | {sentences:[{t,n}], topic}
  const [storyIdx, setStoryIdx] = useState(0);
  const [clozeItem, setClozeItem] = useState(null); // null | {loading} | {full,gap,answer,inf,tenseLabel,tenseId,nogap}
  const [questions, setQuestions] = useState(null); // null | {loading} | {error} | [{q,options,answer}]
  const [qIdx, setQIdx] = useState(0);
  const [explain, setExplain] = useState(""); // short rule hint shown on a wrong cloze answer
  const [genProg, setGenProg] = useState(""); // progress while a new story is being generated
  const [genSecs, setGenSecs] = useState(0); // elapsed seconds while generating (for the countdown)
  const [transOpen, setTransOpen] = useState(false); // native translation collapsed/expanded in Texte mode
  const [storyTrans, setStoryTrans] = useState(null); // lazily generated translation of the whole story (in the user's native language)
  const [reading, setReadingState] = useState("idle"); // read-aloud: idle | playing | paused
  const [readIdx, setReadIdx] = useState(0); // index of the sentence currently being read
  const [useMyWords, setUseMyWords] = useState(() => recall("kunju-texte-mywords", false)); // weave the learner's saved words into the story
  const useMyWordsRef = useRef(recall("kunju-texte-mywords", false));
  const clozeMyWordsRef = useRef(recall("kunju-quiz-group", "all") === "words"); // driven by the "Welche Wörter?" group = "words"
  const [ttsRate, setTtsRateState] = useState(() => recall("kunju-ttsrate", 1.0)); // read-aloud speed
  const [voices, setVoices] = useState(() => (window.speechSynthesis ? window.speechSynthesis.getVoices() : []) || []);
  const ttsBase = (window.CONJ[lang] && window.CONJ[lang].ttsLang || lang).toLowerCase().split("-")[0];
  const [voiceSel, setVoiceSel] = useState("");
  const [voiceGenderSel, setVoiceGenderSel] = useState("");
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const upd = () => setVoices(window.speechSynthesis.getVoices() || []);
    upd();
    try {
      window.speechSynthesis.addEventListener("voiceschanged", upd);
    } catch (e) {}
    return () => {
      try {
        window.speechSynthesis.removeEventListener("voiceschanged", upd);
      } catch (e) {}
    };
  }, []);
  useEffect(() => {
    setVoiceSel(savedVoiceURI(ttsBase));
    setVoiceGenderSel(savedGender(ttsBase));
  }, [ttsBase, lang]);
  const langVoices = voices.filter(v => (v.lang || "").toLowerCase().split("-")[0] === ttsBase);
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
  const nativeLangCode = (LANG_META[nativeCode] || {
    code: "?"
  }).code;
  // Custom topics are shared app-wide via kunju-vocab-catnames (same store the
  // Saved/vocab area uses), so adding one here makes it show up everywhere.
  const [customCatNames, setCustomCatNames] = useState(() => recall("kunju-vocab-catnames", []));
  const allThemes = customCatNames.length ? [...SPK_THEMES, ...customCatNames.map(n => ({
    id: "cat:" + n,
    topic: n
  }))] : SPK_THEMES;
  function addCustomTopic(name) {
    name = (name || "").trim();
    if (!name) return;
    if (!customCatNames.includes(name)) {
      const upd = [...customCatNames, name];
      setCustomCatNames(upd);
      persist("kunju-vocab-catnames", upd);
    }
    setTopicsSel(["cat:" + name]);
  }
  function removeCustomTopic(id) {
    if (!id || id.indexOf("cat:") !== 0) return;
    const name = id.slice(4);
    const upd = customCatNames.filter(x => x !== name);
    setCustomCatNames(upd);
    persist("kunju-vocab-catnames", upd);
    setTopicsSel(prev => {
      const n = prev.filter(t => t !== id);
      return n.length ? n : ["random"];
    });
  }
  function reloadTenses() {
    const saved = recall(`kunju-tenses-${lang}`, null);
    const ids = eng.conjugate(eng.samples[0]);
    const all = ids && ids.tenses ? ids.tenses.map(t => t.id) : [];
    const valid = Array.isArray(saved) ? saved.filter(id => all.indexOf(id) >= 0) : [];
    setTenseSel(valid.length ? valid : all);
  }
  useEffect(() => {
    reloadTenses();
    setMistMode(false);
    // Restore the remembered verb group (e.g. "Gespeicherte Verben"), but only
    // if it still exists for this language — suffix groups differ per language.
    const remembered = recall("kunju-quiz-group", "all");
    const validIds = (VERB_GROUPS[lang] || [{ id: "all" }]).map(g => g.id);
    const nextGroup = validIds.indexOf(remembered) >= 0 ? remembered : "all";
    setSelGroup(nextGroup);
    clozeMyWordsRef.current = nextGroup === "words";
    setSpkTarget(lang);
    recentRef.current = [];
    setSpeedBest(recall(`kunju-speedbest-${lang}`, 0));
  }, [lang]);
  useEffect(() => {
    if (isActive) reloadTenses();
    // „Jetzt üben" aus der Challenge-Liste: einmalig die Gruppe auf „challenge" setzen.
    if (isActive) {
      const pend = recall("kunju-quiz-pending-group", null);
      if (pend) {
        persist("kunju-quiz-pending-group", null);
        if ((VERB_GROUPS[lang] || []).some(x => x.id === pend)) pickGroup(pend);
      }
    } else {
      // Tab verlassen: Vorlesen stoppen, damit das Play/Stop-Feld nicht hängen bleibt.
      setReading("idle");
      readIdxRef.current = 0;
      setReadIdx(0);
      if (window.speechSynthesis) try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }, [isActive]);
  function toggleTense(id) {
    setTenseSel(prev => {
      const next = prev.indexOf(id) >= 0 ? prev.filter(x => x !== id) : allTenseIds.filter(x => prev.indexOf(x) >= 0 || x === id);
      persist(`kunju-tenses-${lang}`, next);
      return next;
    });
  }
  function setAllTenses(on) {
    const next = on ? allTenseIds.slice() : [];
    setTenseSel(next);
    persist(`kunju-tenses-${lang}`, next);
  }
  const scoreKey = `kunju-score-${lang}-${mode}`;
  useEffect(() => {
    setScore(recall(scoreKey, {
      right: 0,
      total: 0,
      streak: 0
    }));
  }, [scoreKey]);
  useEffect(() => {
    if ((mode === "choice" || mode === "type" || mode === "speed" || mode === "speak") && q) fetchTransl(q.verb);
    if (mode === "cards" && q && thisDir === "native") fetchTransl(q.verb);
    if ((mode === "choice" || mode === "cards" || mode === "type" && typeMode === "form" || mode === "speak" && spkMode === "form") && q) fetchCloze(q);else setCloze(null); /* eslint-disable-next-line */
  }, [q, mode, spkMode, typeMode, thisDir]);
  useEffect(() => {
    if (mode === "type" && typeMode === "sentence" && !sent) genSentence(lang); /* eslint-disable-next-line */
  }, [mode, typeMode]);
  function newQ() {
    if (mistMode) {
      const list = getMistakes(lang);
      return list.length ? pick(list) : null;
    }
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
    if (recRef.current) {
      try {
        recRef.current.onend = null;
        recRef.current.stop();
      } catch (e) {}
      recRef.current = null;
    }
    setQ(newQ());
    setVal("");
    setState("idle");
    setPicked(null);
    setFlipped(false);
    setTransl(null);
    setHeard("");
    setListening(false);
    setMsg("");
    setRevealed(false);
    if (mode === "cards") setThisDir(cardDir === "mix" ? Math.random() < 0.5 ? "target" : "native" : cardDir);
    if (mode === "type") setTimeout(() => inRef.current && inRef.current.focus({
      preventScroll: true
    }), 50);
    if (mode === "speak" && spkMode === "sentence") genSentence();else setSent(null);
  }
  function fetchTransl(rawVerb) {
    const base = (rawVerb || "").replace(/^to /, "");
    const reqId = lang + "|" + base; // identifies this request; a later card invalidates it
    translReqRef.current = reqId;
    const nativeName = recall("kunju-native", "German");
    const key = `kunju-vtr-${lang}-${base}-${nativeName}`;
    const cached = recall(key, null);
    if (cached != null) {
      setTransl(cached);
      return;
    }
    const nCode = NATIVE_TO_UI[nativeName];
    if (nCode === lang) {
      setTransl(base);
      return;
    }
    if (nCode) {
      const ct = conceptTranslate(base, lang, nCode);
      if (ct) {
        persist(key, ct);
        setTransl(ct);
        return;
      }
    }
    if (nativeName === "English") {
      const m = window.lookupMeaning(lang, base);
      if (m) {
        persist(key, m);
        setTransl(m);
        return;
      }
    }
    if (!window.__hasAI()) {
      setTransl("");
      return;
    }
    setTransl("…");
    window.aiComplete(`Translate the ${eng.name} verb "${base}" into ${nativeName}. Reply with ONLY the ${nativeName} translation in its base/infinitive form, nothing else.`).then(txt => {
      const t = String(txt || "").trim().replace(/^["'«»]+|["'«».]+$/g, "").split("\n")[0].trim();
      persist(key, t);
      if (translReqRef.current === reqId) setTransl(t); // ignore if the user already moved to another card
    }).catch(() => { if (translReqRef.current === reqId) setTransl(""); });
  }
  function flipCard() {
    if (!flipped) {
      setFlipped(true);
      if (q) fetchTransl(q.verb);
    }
  }
  function toggleTopic(id) {
    setTopicsSel(prev => {
      if (id === "random") return ["random"]; // random is the exclusive "any topic" option
      const without = prev.filter(x => x !== "random"); // picking a real theme drops "random"
      const next = without.includes(id) ? without.filter(x => x !== id) : [...without, id];
      return next.length ? next : ["random"]; // nothing specific left → back to random
    });
  }
  function pickClozeTopic(id) {
    setTopicsSel([id]);
    if (typeMode === "sentence") {
      setVal("");
      setState("idle");
      setRevealed(false);
      setMsg("");
      genSentence(lang, 0, id);
    } else if (q) {
      fetchCloze(q, 0, id);
    }
  }
  const clozeTokenRef = useRef(0);
  function fetchCloze(qq, attempt, topicOverride) {
    attempt = attempt || 0;
    const curTopic = topicOverride || (topicsSel.length ? topicsSel[Math.floor(Math.random() * topicsSel.length)] : "random");
    if (!qq || !qq.answer || qq.answer === "—") {
      setCloze(null);
      return;
    }
    const myTok = attempt === 0 ? ++clozeTokenRef.current : clozeTokenRef.current;
    const targetName = window.CONJ[lang].name;
    const nativeName = recall("kunju-native", "German");
    const lvl = skill === "advanced" ? "C1-level" : skill === "intermediate" ? "B1-level" : "very simple A1–A2";
    const advConn = skill === "advanced" ? ` Make it a more complex sentence that naturally uses a subordinating connector (e.g. German: obwohl/trotzdem/damit/während/sodass; Spanish: aunque/a pesar de que/para que; French: bien que/quoique/afin que/pourtant; Dutch: hoewel/zodat/terwijl), like "Trotz der Umstände hielten sie durch."` : "";
    const theme = allThemes.find(t => t.id === curTopic);
    const topicTxt = theme && theme.topic ? ` The sentence should relate to: ${theme.topic}.` : "";
    // Optionally weave one of the learner's saved words into the example sentence.
    const mwPool = clozeMyWordsRef.current ? gatherMyWords() : [];
    const myWord = mwPool.length ? mwPool[Math.floor(Math.random() * mwPool.length)] : "";
    const myWordTxt = myWord ? ` If it fits naturally, also use the learner's saved ${targetName} word "${myWord}" somewhere in the sentence.` : "";
    const key = `kunju-cloze7-${lang}-${qq.verb}-${qq.tenseLabel}-${qq.pronoun}-${skill}-${nativeName}-${curTopic}${myWord ? "-mw:" + norm(myWord) : ""}`;
    const cached = recall(key, null);
    if (cached != null) {
      setCloze(cached);
      return;
    }
    if (!window.__hasAI()) {
      setCloze(null);
      return;
    }
    setCloze({
      loading: true
    });
    const splitLang = lang === "de" || lang === "nl";
    const isCompound = qq.answer.indexOf(" ") >= 0;
    const isProverb = curTopic === "proverb";
    const provN = isProverb ? Math.floor(Math.random() * 40) : 0;
    const clozeStyles = [" Make it a normal statement.", " Phrase it as a QUESTION ending with '?'.", " Phrase it as an EXCLAMATION ending with '!'.", " Make it a short line of spoken dialogue."];
    const clozeStyle = isProverb ? "" : clozeStyles[Math.floor(Math.random() * clozeStyles.length)];
    const prompt = isProverb ? `Give ONE of the MOST FAMOUS, standard ${targetName} proverbs ("Sprichwort") — the kind every native speaker knows and that appears in proverb collections (e.g. for German: "Übung macht den Meister", "Morgenstund hat Gold im Mund", "Wer A sagt, muss auch B sagen"). It must be a real, complete proverb in standard ${targetName}, NOT regional slang, NOT an everyday idiom, NOT invented. Pick a varied one (variety #${provN}). Wrap its main conjugated verb in **double asterisks**. Then give its meaning in ${nativeName}. Do NOT use double-quote characters. Reply with ONLY minified JSON: {"t":"<the proverb with **verb**>","n":"<${nativeName} meaning>"}` : `Write ONE short, natural ${lvl} sentence in ${targetName} (max 9 words) ${splitLang && isCompound ? `that correctly expresses the ${qq.tenseLabel} of "${qq.verb}" for "${qq.pronoun}" — its parts are ${qq.answer.split(" ").map(p => `"${p}"`).join(" + ")}. Use natural ${targetName} word order: the finite/auxiliary verb stays in SECOND position and the participle or infinitive moves to the END of the clause (e.g. "Ich habe das Buch gestern gelesen").` : `that CONTAINS exactly the verb form "${qq.answer}" (the ${qq.tenseLabel} of "${qq.verb}", ${qq.pronoun}).`}${clozeStyle}${advConn}${splitLang ? ` IMPORTANT: if "${qq.verb}" is a separable-prefix verb (trennbares Verb / scheidbaar werkwoord), split the prefix to the END of the main clause in simple tenses (e.g. "ausbreiten" → "Das Feuer breitete sich schnell aus", NEVER "ausbreitete").` : ""}${topicTxt}${myWordTxt} End with proper punctuation (. ! or ?). Before replying, silently PROOFREAD and guarantee the sentence is 100% correct standard ${targetName} (verb position, separable-prefix split, case government, agreement, word order); if anything is off, fix it and output only the corrected sentence. Above all it must sound NATURAL to a native speaker in everyday register — pick a context and sentence type where exactly "${qq.answer}" is idiomatic. In German the simple-past Präteritum of everyday verbs belongs in written narration, NOT in spoken questions or dialogue (a native would say the Perfekt there), so if the requested style would sound stilted with this form, use whatever sentence type sounds most natural instead. Then give a natural ${nativeName} translation of the WHOLE sentence — and in that translation render the verb "${qq.verb}" with its most standard, DIRECT ${nativeName} equivalent (the dictionary meaning), NOT a loose synonym or paraphrase, so the practised verb is clearly recognizable in the translation. Do NOT use double-quote characters. Reply with ONLY minified JSON and nothing else: {"t":"<${targetName} sentence>","n":"<${nativeName} translation>"}`;
    window.aiComplete(prompt).then(txt => {
      if (clozeTokenRef.current !== myTok) return; // stale response — a newer question is active
      let j = null;
      try {
        j = looseParse(txt);
      } catch (_) {
        j = null;
      }
      if (isProverb) {
        let raw = j && j.t ? String(j.t).trim() : "";
        if (!raw) {
          if (attempt < 1) {
            fetchCloze(qq, attempt + 1, curTopic);
            return;
          }
          setCloze(null);
          return;
        }
        const full = raw.replace(/\*\*/g, "");
        // proverbs are independent of the quiz verb → show the full saying (no gap to avoid a verb mismatch)
        const out = {
          full,
          gap: full,
          native: j && j.n ? String(j.n).trim() : "",
          proverb: true
        };
        persist(key, out);
        setCloze(out);
        return;
      }
      const s = j && j.t ? String(j.t).trim() : "";
      const stripMark = t => t.replace(/\*\*/g, "");
      // build a gap: prefer **markers** from AI, fall back to regex word match
      const full = stripMark(s);
      let gap = full,
        hit = false;
      const markedGap = s.replace(/\*\*(.+?)\*\*/, "…");
      if (markedGap !== s) {
        gap = stripMark(markedGap);
        hit = true;
      }
      if (!hit) {
        const mkRe = w => {
          const e = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          try {
            return new RegExp("(?<![\\p{L}])" + e + "(?![\\p{L}])", "iu");
          } catch (x) {
            return new RegExp("\\b" + e + "\\b", "i");
          }
        };
        const wordList = splitLang && isCompound ? qq.answer.split(/\s+/) : [qq.answer];
        wordList.forEach(w => {
          const r = mkRe(w);
          if (r.test(gap)) {
            gap = gap.replace(r, "…");
            hit = true;
          }
        });
      }
      if (!s || !hit) {
        if (attempt < 1) {
          fetchCloze(qq, attempt + 1, curTopic);
          return;
        }
        // Quality gate: only ever show an example that actually contains the exact
        // form being practised ("${qq.answer}"). If the AI dropped it or changed
        // it (e.g. declined a participle: kommend → kommende), the sentence is
        // misleading — show no example rather than a wrong one.
        setCloze(null);
        return;
      }
      // Grammatik-Wächter (DE, Präteritum): wurde die einfache Form in einen
      // Perfekt-/Futur-Rahmen gezwängt (z. B. "haben … schickten"), neu generieren —
      // und nach Versuchen lieber eine korrekte Vorlage als einen falschen Satz zeigen.
      if (lang === "de" && !isCompound && /pr[äa]teritum/i.test(qq.tenseLabel || "") && deClozeBadFrame(full, qq.answer)) {
        if (attempt < 2) {
          fetchCloze(qq, attempt + 1, curTopic);
          return;
        }
        const tpl = deClozeTemplate(qq);
        if (tpl) {
          persist(key, tpl);
          setCloze(tpl);
          return;
        }
        setCloze(null);
        return;
      }
      const out = {
        full,
        gap,
        native: j && j.n ? String(j.n).trim() : ""
      };
      persist(key, out);
      setCloze(out);
    }).catch(() => {
      if (clozeTokenRef.current !== myTok) return;
      if (attempt < 1) fetchCloze(qq, attempt + 1, curTopic);else setCloze(null);
    });
  }
  useEffect(() => {
    setPrevCards([]);
    if (mode === "speed") {
      setSpeedState("idle");
      setQ(newQ());
    } else next();
    /* eslint-disable-next-line */
  }, [lang, tenseSel.join(","), mistMode, selGroup, mode]);
  function setModeP(m) {
    setMode(m);
    persist("kunju-mode", m);
  }
  function bumpMist() {
    setMver(v => v + 1);
  }
  function record(ok) {
    const ns = {
      right: score.right + (ok ? 1 : 0),
      total: score.total + 1,
      streak: ok ? score.streak + 1 : 0
    };
    setScore(ns);
    persist(scoreKey, ns);
    if (!ok) {
      addMistake(lang, q);
      bumpMist();
    } else if (mistMode) {
      removeMistake(lang, q);
      bumpMist();
    }
    if (ok && q && creditChallengeVerb(lang, q.verb)) showChMoment(q.verb);
    onActivity && onActivity();
    if (ok && isStreakMilestone(ns.streak)) fireConfetti(ns.streak);
    return ns.streak;
  }
  function check() {
    if (!q || state !== "idle") return;
    if (typeMode === "sentence") {
      if (!sent || !sent.t) return;
      const clean = s => norm(s).replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
      const ct = clean(sent.t),
        cv = clean(val);
      // typed → require an exact match (accents matter); allow only minor accent slips when otherwise identical
      const ok = cv === ct || deburr(cv) === deburr(ct) && cv.split(" ").length === ct.split(" ").length;
      const accentSlip = ok && cv !== ct;
      const st = record(ok);
      setState(ok ? "correct" : "wrong");
      setMsg(ok ? accentSlip ? tr("accent_hint") : praiseFor(st) : cheerLine());
      return;
    }
    const exact = norm(val) === norm(q.answer);
    const accentOnly = !exact && deburr(norm(val)) === deburr(norm(q.answer)) && norm(val).length > 0;
    const ok = exact || accentOnly;
    const st = record(ok);
    setState(ok ? "correct" : "wrong");
    setMsg(accentOnly ? tr("accent_hint", {
      answer: q.answer
    }) : ok ? praiseFor(st) : cheerLine());
    if (ok && autoSpeak) speak(q.answer, q.ttsLang);
  }
  function choose(opt) {
    if (!q || state !== "idle") return;
    setPicked(opt);
    const ok = norm(opt) === norm(q.answer);
    const st = record(ok);
    setState(ok ? "correct" : "wrong");
    setMsg(ok ? praiseFor(st) : cheerLine());
    if (ok && autoSpeak) speak(q.answer, q.ttsLang);
  }

  // speed timer
  useEffect(() => {
    if (mode !== "speed" || speedState !== "running") return;
    if (timeLeft <= 0) {
      setSpeedState("done");
      setSpeedBest(b => {
        const nb = Math.max(b, speedScore);
        persist(speedBestKey, nb);
        return nb;
      });
      return;
    }
    const id = setTimeout(() => setTimeLeft(x => x - 1), 1000);
    return () => clearTimeout(id);
    /* eslint-disable-next-line */
  }, [mode, speedState, timeLeft]);
  function startSpeed() {
    setSpeedScore(0);
    setSpeedTotal(0);
    setSpeedLog([]);
    setTimeLeft(60);
    setQ(newQ());
    setSpeedState("running");
  }
  function speedAnswer(opt) {
    if (speedState !== "running") return;
    const ok = norm(opt) === norm(q.answer);
    if (ok) { setSpeedScore(s => s + 1); if (creditChallengeVerb(lang, q.verb)) showChMoment(q.verb); } else {
      addMistake(lang, q);
      bumpMist();
    }
    setSpeedLog(l => [...l, {
      verb: q.verb,
      pronoun: q.pronoun,
      tenseLabel: q.tenseLabel,
      answer: q.answer,
      picked: opt,
      ok: ok,
      ttsLang: q.ttsLang
    }]);
    setSpeedTotal(s => s + 1);
    onActivity && onActivity();
    setQ(newQ());
  }
  function nextCard(known) {
    if (known) {
      if (creditChallengeVerb(lang, q.verb)) showChMoment(q.verb);
      if (mistMode) {
        removeMistake(lang, q);
        bumpMist();
      }
    } else {
      addMistake(lang, q);
      bumpMist();
    }
    onActivity && onActivity();
    setPrevCards(s => [...s, q].slice(-40));
    next();
  }
  function goBackCard() {
    setPrevCards(stack => {
      if (!stack.length) return stack;
      const copy = stack.slice();
      const prev = copy.pop();
      setQ(prev);
      setFlipped(false);
      setTransl(null);
      setState("idle");
      setMsg("");
      return copy;
    });
  }
  function evaluateSpoken(said, target, recLang) {
    const a = norm(said),
      tg = norm(target);
    const da = deburr(a),
      dtg = deburr(tg);
    let ok;
    if (spkMode === "sentence") {
      ok = sentSim(a, tg) >= 0.38 || sentSim(da, dtg) >= 0.5;
    } else {
      const last = tg.split(" ").pop(),
        dlast = dtg.split(" ").pop();
      const aw = a.split(" "),
        daw = da.split(" ");
      ok = a === tg || da === dtg || a.includes(tg) || da.includes(dtg) || aw.indexOf(last) >= 0 || daw.indexOf(dlast) >= 0 || daw.some(w => w.length > 2 && (w === dlast || dlast.indexOf(w) === 0 || w.indexOf(dlast) === 0));
    }
    const st = record(ok);
    setState(ok ? "correct" : "wrong");
    setMsg(ok ? praiseFor(st) : cheerLine());
    if (spkMode === "sentence" && sent) {
      if (ok) {
        if (sentMistMode) {
          removeSentMist(spkTarget, sent);
          setSmver(v => v + 1);
        }
      } else {
        addSentMist(spkTarget, sent);
        setSmver(v => v + 1);
      }
    }
    if (ok && autoSpeak) speak(target, recLang);
  }
  function listen() {
    if (state !== "idle") return;
    // tap again while recording → stop & evaluate (like sending a voice message)
    if (mediaRecRef.current) {
      try {
        mediaRecRef.current.stop();
      } catch (e) {}
      return;
    }
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch (e) {}
      return;
    }
    const target = spkMode === "sentence" && sent && sent.t ? sent.t : q.answer;
    const recLang = spkMode === "sentence" ? window.CONJ[spkTarget].ttsLang : q.ttsLang;
    // Chrome/Firefox auf iOS unterstützen die Web Speech API nicht → Stimme
    // aufnehmen und serverseitig transkribieren (gleicher /api/ai-Endpunkt).
    const _ua = detectUA();
    if (_ua.iOS && _ua.browser && _ua.browser !== "Safari") {
      startRecorder(target, recLang);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setHeard("__nomic__");
      return;
    }
    function startSR() {
      const rec = new SR();
      rec.lang = recLang;
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      transcriptRef.current = "";
      setHeard("");
      setListening(true);
      let finalT = "";
      rec.onresult = e => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalT += r[0].transcript + " ";else interim += r[0].transcript;
        }
        transcriptRef.current = (finalT + interim).trim();
        setHeard(transcriptRef.current);
      };
      rec.onerror = e => {
        const er = e && e.error;
        if (er === "not-allowed" || er === "service-not-allowed") {
          recRef.current = null;
          setListening(false);
          setHeard("__denied__");
        } else if (er === "no-speech" && !transcriptRef.current) {/* keep listening */}
      };
      rec.onend = () => {
        recRef.current = null;
        setListening(false);
        const said = transcriptRef.current;
        if (said) evaluateSpoken(said, target, recLang);
      };
      recRef.current = rec;
      try {
        rec.start();
      } catch (e) {
        recRef.current = null;
        setListening(false);
        setHeard("__nomic__");
      }
    }
    // WICHTIG (iOS): Die Spracherkennung MUSS direkt im Tap-Gesten-Handler
    // starten. Wird rec.start() erst in einem async-Callback (z. B. nach
    // getUserMedia) aufgerufen, ist der „user gesture“-Kontext weg und iOS
    // verweigert mit „not-allowed“. Deshalb hier synchron starten.
    startSR();
  }
  // Server-Spracherkennung: Audio aufnehmen (funktioniert auch dort, wo die
  // Web Speech API fehlt, z. B. Chrome auf iOS), dann an /api/ai transkribieren.
  async function startRecorder(target, recLang) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === "undefined") {
      setHeard("__nomic__");
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setHeard("__denied__");
      return;
    }
    let mime = "";
    const cands = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/mpeg"];
    for (let i = 0; i < cands.length; i++) {
      if (typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(cands[i])) { mime = cands[i]; break; }
    }
    let rec;
    try {
      rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch (e) {
      stream.getTracks().forEach(t => t.stop());
      setHeard("__nomic__");
      return;
    }
    mediaChunksRef.current = [];
    rec.ondataavailable = e => { if (e.data && e.data.size) mediaChunksRef.current.push(e.data); };
    rec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      mediaRecRef.current = null;
      setListening(false);
      const type = rec.mimeType || mime || "audio/webm";
      const blob = new Blob(mediaChunksRef.current, { type: type });
      mediaChunksRef.current = [];
      if (!blob.size) { setHeard("__nospeech__"); return; }
      setHeard("__transcribing__");
      try {
        const said = (await transcribeBlob(blob, recLang) || "").trim();
        if (!said) { setHeard("__nospeech__"); return; }
        setHeard(said);
        evaluateSpoken(said, target, recLang);
      } catch (e) {
        setHeard("__transcribe_err__");
      }
    };
    mediaRecRef.current = rec;
    setHeard("");
    setListening(true);
    try {
      rec.start();
    } catch (e) {
      stream.getTracks().forEach(t => t.stop());
      mediaRecRef.current = null;
      setListening(false);
      setHeard("__nomic__");
    }
  }
  async function transcribeBlob(blob, recLang) {
    const t = blob.type || "";
    const ext = t.indexOf("mp4") >= 0 ? "mp4" : t.indexOf("mpeg") >= 0 ? "mp3" : t.indexOf("wav") >= 0 ? "wav" : "webm";
    const form = new FormData();
    form.append("file", blob, "audio." + ext);
    const lang2 = (recLang || "").split("-")[0];
    if (lang2) form.append("language", lang2);
    if (!window.__supa) throw new Error("no backend");
    // Transkription über die Supabase-Edge-Function "transcribe" (OpenAI Whisper).
    const { data, error } = await window.__supa.functions.invoke("transcribe", { body: form });
    if (error) throw new Error(error.message || "transcription failed");
    if (data && data.error) throw new Error((data.error && data.error.message) || "transcription failed");
    return data && data.text;
  }
  // Blockiertes Mikro: löst die native Erlaubnis-Abfrage des Browsers aus.
  // Klappt der Prompt (noch nicht gefragt / einmal weggetippt) → direkt weiter aufnehmen.
  // Ist es dauerhaft blockiert → geräte­genaue Anleitung einblenden.
  async function requestMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicHint(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // wir wollten nur die Erlaubnis
      setMicHint(false);
      setHeard("");
      listen(); // jetzt erlaubt → Aufnahme direkt starten
    } catch (e) {
      setMicHint(true); // dauerhaft blockiert → Prompt kommt nicht mehr
    }
  }
  function detectUA() {
    const ua = navigator.userAgent || "";
    const iOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1);
    const android = /Android/.test(ua);
    let browser = "";
    if (/CriOS/.test(ua)) browser = "Chrome";
    else if (/FxiOS/.test(ua)) browser = "Firefox";
    else if (/EdgiOS/.test(ua)) browser = "Edge";
    else if (/SamsungBrowser/.test(ua)) browser = "Samsung Internet";
    else if (/Edg\//.test(ua)) browser = "Edge";
    else if (/Firefox/.test(ua)) browser = "Firefox";
    else if (/CriOS|Chrome|Chromium/.test(ua)) browser = "Chrome";
    else if (/Safari/.test(ua)) browser = "Safari";
    return { iOS, android, browser };
  }
  // Geräte- UND browser-genaue Anleitung. Ein echter Auto-Deeplink in die
  // OS-/Browser-Einstellungen ist von einer Webseite aus nicht erlaubt — hier
  // steht stattdessen der exakte Weg für das jeweilige Handy + den Browser.
  function micHintText() {
    const { iOS, android, browser } = detectUA();
    const L = UILANG, pick = m => m[L] || m.en;
    const b = browser || (iOS ? "Safari" : "Browser");
    if (iOS && (browser === "Safari" || !browser)) return pick({
      de: "Safari: in der Adressleiste auf „aA“ → Website-Einstellungen → Mikrofon → Erlauben. (Im privaten Tab ist das Mikro gesperrt — normalen Tab nutzen.)",
      en: "Safari: tap „aA“ in the address bar → Website Settings → Microphone → Allow. (Private tabs block the mic — use a normal tab.)",
      es: "Safari: toca „aA“ en la barra de direcciones → Ajustes del sitio → Micrófono → Permitir. (En pestañas privadas el micro está bloqueado.)",
      fr: "Safari : touche « aA » dans la barre d’adresse → Réglages du site → Micro → Autoriser. (En navigation privée, le micro est bloqué.)",
      nl: "Safari: tik op „aA“ in de adresbalk → Website-instellingen → Microfoon → Sta toe. (In privétabbladen is de microfoon geblokkeerd.)"
    });
    if (iOS) return pick({
      de: `${b}: iPhone-Einstellungen → ${b} → Mikrofon erlauben. (Im privaten Tab ist das Mikro gesperrt.)`,
      en: `${b}: iPhone Settings → ${b} → allow Microphone. (Private tabs block the mic.)`,
      es: `${b}: Ajustes del iPhone → ${b} → permitir Micrófono. (En pestañas privadas el micro está bloqueado.)`,
      fr: `${b} : Réglages de l’iPhone → ${b} → autoriser le micro. (En navigation privée, le micro est bloqué.)`,
      nl: `${b}: iPhone-instellingen → ${b} → microfoon toestaan. (In privétabbladen is de microfoon geblokkeerd.)`
    });
    if (android) return pick({
      de: `${b}: auf das Schloss-Symbol in der Adressleiste tippen → Berechtigungen → Mikrofon erlauben.`,
      en: `${b}: tap the lock icon in the address bar → Permissions → allow Microphone.`,
      es: `${b}: toca el candado en la barra de direcciones → Permisos → permite el micrófono.`,
      fr: `${b} : touche le cadenas dans la barre d’adresse → Autorisations → autorise le micro.`,
      nl: `${b}: tik op het slotje in de adresbalk → Rechten → microfoon toestaan.`
    });
    return pick({
      de: `${b}: auf das Schloss-/Info-Symbol neben der Adressleiste klicken → Website-Einstellungen → Mikrofon → Erlauben.`,
      en: `${b}: click the lock/info icon next to the address bar → Site settings → Microphone → Allow.`,
      es: `${b}: haz clic en el icono de candado/info junto a la barra de direcciones → Configuración del sitio → Micrófono → Permitir.`,
      fr: `${b} : clique sur l’icône cadenas/info à côté de la barre d’adresse → Réglages du site → Micro → Autoriser.`,
      nl: `${b}: klik op het slot-/infopictogram naast de adresbalk → Site-instellingen → Microfoon → Toestaan.`
    });
  }
  function sentSim(a, b) {
    const words = s => deburr(norm(s)).replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(w => w.length > 1);
    const aw = new Set(words(a));
    const bw = words(b);
    if (!bw.length) return 0;
    let m = 0;
    bw.forEach(w => {
      if (aw.has(w)) m++;
    });
    return m / bw.length; // recall over the target words — lenient toward extra/missing words
  }
  const genTokenRef = useRef(0);
  function genSentence(targetCode, attempt, topicOverride, forceNormal) {
    const tc = targetCode || spkTarget;
    const myTok = ++genTokenRef.current;
    if (sentMistMode && !forceNormal) {
      const list = getSentMist(tc);
      setRevealed(false);
      setHeard("");
      setMsg("");
      setState("idle");
      setSent(list.length ? pick(list) : null);
      return;
    }
    attempt = attempt || 0;
    setRevealed(false);
    setSent({
      loading: true
    });
    if (!window.__hasAI()) {
      setSent({
        error: 1
      });
      return;
    }
    const nativeName = recall("kunju-native", "German");
    const targetName = window.CONJ[tc].name;
    const tid = topicOverride || (topicsSel.length ? topicsSel[Math.floor(Math.random() * topicsSel.length)] : "random");
    const theme = allThemes.find(t => t.id === tid);
    const topic = theme && theme.topic ? theme.topic : SENT_TOPICS[Math.floor(Math.random() * SENT_TOPICS.length)];
    const mwPool = clozeMyWordsRef.current ? gatherMyWords() : [];
    const myWord = mwPool.length ? mwPool[Math.floor(Math.random() * mwPool.length)] : "";
    const myWordTxt = myWord ? ` Its ${targetName} translation should, if it fits naturally, include the saved word "${myWord}".` : "";
    const pool = tenseSel.length ? tenseSel : tenseOpts.map(t => t.id);
    const chosenId = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    const chosen = chosenId ? tenseOpts.find(t => t.id === chosenId) || {} : {};
    const oneTense = chosen.label || null;
    const tenseTxt = oneTense ? ` Write it so its ${targetName} translation naturally uses the ${oneTense} tense.` : "";
    const rkey = `${tc}|${tid}|${tenseSel.join(",")}`;
    const recent = recentSentRef.current[rkey] || [];
    const avoidTxt = attempt === 0 && recent.length ? ` Make it clearly DIFFERENT from these recent ones (no paraphrases): ${recent.slice(0, 10).map(s => `"${s}"`).join("; ")}.` : "";
    const seed = Math.floor(Math.random() * 100000);
    const lvlTxt = skill === "advanced" ? " Use richer C1-level vocabulary and a more complex structure that naturally uses a subordinating connector (in the target language e.g. Spanish: aunque, a pesar de que, para que, sin que, mientras; German: obwohl, trotzdem, damit, während, sodass; French: bien que, quoique, afin que, pourtant; Dutch: hoewel, ofschoon, zodat, terwijl)." : skill === "intermediate" ? " Use everyday B1-level vocabulary." : " Use very simple A1\u2013A2 vocabulary and a short, easy structure (max 7 words).";
    const STYLES = [" Make it a normal statement.", " Make it a QUESTION ending with '?'.", " Make it an EXCLAMATION ending with '!'.", " Make it a short line of spoken dialogue (question or exclamation), as in a real conversation."];
    const styleTxt = STYLES[Math.floor(Math.random() * STYLES.length)];
    window.aiComplete(`Write ONE short, natural everyday sentence (max 10 words) in ${nativeName} about ${topic}.${tenseTxt}${lvlTxt}${styleTxt}${myWordTxt} Make it specific and fresh, NOT a clichéd textbook line (variety seed ${seed}).${avoidTxt} Both sentences MUST end with proper punctuation (. ! or ?). Then give its natural ${targetName} translation. Do NOT use any double-quote (") character inside either sentence. Reply with ONLY minified JSON and nothing else: {"n":"...","t":"..."}`).then(txt => {
      if (genTokenRef.current !== myTok) return;
      let j = null;
      try {
        j = looseParse(txt);
      } catch (_) {
        j = null;
      }
      if (!j || !j.n || !j.t) {
        if (attempt < 2) {
          genSentence(tc, attempt + 1, tid);
          return;
        }
        setSent({
          error: 1
        });
        return;
      }
      recentSentRef.current[rkey] = [j.n, ...recent].slice(0, 30);
      setSent({
        n: j.n,
        t: j.t,
        tenseLabel: oneTense,
        tenseId: chosenId
      });
    }).catch(() => {
      if (genTokenRef.current !== myTok) return;
      if (attempt < 2) {
        genSentence(tc, attempt + 1, tid);
        return;
      }
      setSent({
        error: 1
      });
    });
  }

  // ---- TEXTE: individualized AI stories ----
  // tolerant parser for JSON arrays (looseParse only handles single objects)
  const parseArr = txt => {
    let s = String(txt || "").replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const a = s.indexOf("[");
    if (a >= 0) s = s.slice(a);
    const b = s.lastIndexOf("]");
    try {
      const j = JSON.parse(b > 0 ? s.slice(0, b + 1) : s);
      if (Array.isArray(j) && j.length) return j;
    } catch (_) {}
    // salvage: extract each {…} object individually — survives truncation, stray text or inner quotes
    const out = [];
    const objRe = /\{[^{}]*\}/g;
    let m;
    while (m = objRe.exec(s)) {
      let o = null;
      try {
        o = JSON.parse(m[0]);
      } catch (_) {
        try {
          o = looseParse(m[0]);
        } catch (e) {
          o = null;
        }
      }
      if (o && (o.t || o.n || o.q || o.v || o.inf || o.i != null)) out.push(o);
    }
    return out.length ? out : null;
  };
  // shared story library (Supabase) — each topic×level×language combo is generated once, then reused for everyone
  async function libFetch(lg, topic, level, tenses) {
    if (!window.__supa) return [];
    try {
      const {
        data
      } = await window.__supa.from("texte_stories").select("sentences,questions").eq("lang", lg).eq("topic", topic).eq("level", level).eq("tenses", tenses).limit(40);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }
  function libInsert(lg, topic, level, tenses, sentences, questions) {
    if (!window.__supa) return;
    try {
      window.__supa.from("texte_stories").insert({
        lang: lg,
        topic,
        level,
        tenses,
        sentences,
        questions: questions || null
      }).then(() => {}, () => {});
    } catch (e) {}
  }
  function useStoryRow(row, tid) {
    const sents = (row.sentences || []).filter(s => s && s.t);
    if (!sents.length) {
      setStory({
        error: 1
      });
      return;
    }
    lastStoryRef.current = sents[0].t;
    setStory({
      sentences: sents,
      questions: Array.isArray(row.questions) ? row.questions : null,
      topic: themeLabel(tid),
      gen: ++genRef.current
    });
  }
  async function buildQuestions(sentences, nativeName) {
    try {
      const full = sentences.map(s => s.t).join(" ");
      const prompt = `Read this story:\n"${full}"\nWrite 3 simple reading-comprehension questions about it in ${nativeName}, each with exactly 3 short answer options where only ONE is correct. Do NOT use double-quote characters inside any text. Reply with ONLY a minified JSON array and nothing else: [{"q":"<question in ${nativeName}>","options":["<a>","<b>","<c>"],"answer":"<exact text of the correct option>"}]`;
      const txt = await window.aiComplete(prompt);
      let arr = parseArr(txt);
      arr = (Array.isArray(arr) ? arr : []).filter(x => x && x.q && Array.isArray(x.options) && x.options.length && x.answer);
      return arr.length ? arr : null;
    } catch (e) {
      return null;
    }
  }
  // pull the already-complete {"t":"..."} sentences out of a partial (streaming) JSON array
  const parsePartial = acc => {
    const out = [];
    const re = /\{\s*"t"\s*:\s*"([^"]*)"\s*\}/g;
    let m;
    while (m = re.exec(acc)) {
      const t = m[1].trim();
      if (t) out.push({
        t
      });
    }
    return out;
  };
  // build only the story prose (fast first paint); verbs + questions are added afterwards.
  // onProgress(partialSentences) is called as sentences stream in.
  async function buildProse(myTok, tid, onProgress, myWords) {
    const nativeName = recall("kunju-native", "German");
    const targetName = window.CONJ[lang].name;
    const N = skill === "advanced" ? 35 : skill === "intermediate" ? 28 : 25;
    const theme = allThemes.find(t => t.id === tid);
    const topic = theme && theme.topic ? theme.topic : SENT_TOPICS[Math.floor(Math.random() * SENT_TOPICS.length)];
    const isSubset = tenseSel.length > 0 && tenseSel.length < tenseOpts.length;
    const selLabels = (tenseSel.length ? tenseSel : tenseOpts.map(t => t.id)).map(id => (tenseOpts.find(t => t.id === id) || {}).label).filter(Boolean);
    const tenseTxt = isSubset ? ` IMPORTANT: write the narration so that the verbs are PREDOMINANTLY in the ${targetName} ${selLabels.join(" / ")} tense${selLabels.length > 1 ? "s" : ""} — keep that tense focus throughout wherever it reads naturally.` : ` Use a natural mix of ${targetName} tenses.`;
    const grpHint = selGroup === "irregular" ? " Prefer common irregular verbs where it stays natural." : selGroup === "regular" ? " Prefer regular verbs where it stays natural." : "";
    const myWordsTxt = myWords && myWords.length ? ` IMPORTANT: the learner is practising these ${targetName} words/verbs — weave AS MANY of them as you naturally can into the story, used correctly and in context (integrate them, never just list them): ${myWords.join(", ")}.` : "";
    const ADV_CONN = {
      es: "aunque, a pesar de que, mientras, puesto que, sin embargo, de modo que, no obstante",
      de: "obwohl, während, da, sodass, dennoch, wohingegen, indessen",
      fr: "bien que, quoique, tandis que, puisque, néanmoins, de sorte que",
      nl: "hoewel, terwijl, aangezien, zodat, niettemin, ofschoon",
      en: "although, while, since, so that, nevertheless, whereas"
    };
    const styleTxt = skill === "advanced" ? ` Write LITERARY, flowing C1-level ${targetName} prose: long, complex sentences with subordinate, relative and concessive clauses, the subjunctive where natural, varied connectors (${ADV_CONN[lang] || ADV_CONN.en}), rich and idiomatic vocabulary, vivid sensory description and some dialogue. NEVER write short, choppy or list-like sentences — weave the ideas into elegant, varied prose.` : skill === "intermediate" ? ` Write natural, everyday B1-level ${targetName} with varied sentence length, connectors and some subordinate clauses, and a real narrative flow (not isolated short sentences).` : ` Write very simple A1–A2 ${targetName} with short, clear sentences and basic connectors, while still telling one coherent little story.`;
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
      const intro = isFirst ? ` This is the OPENING: establish a vivid setting, one or two named characters, and a small conflict or goal about ${topic} that drives the plot.` : ` CONTINUE the same story with the SAME characters and setting; advance the plot and do NOT repeat earlier events. The story so far ends: "${sentences.slice(-3).map(s => s.t).join(" ")}".`;
      const endTxt = isLast ? " In these final sentences, resolve the conflict and give the story a satisfying, rounded ending." : "";
      const prompt = `You are writing a real short story (a "Kurzgeschichte") in ${targetName}; write ${ask} more sentences now.${styleTxt}${intro}${tenseTxt}${grpHint}${myWordsTxt}${endTxt} Keep the SAME narrative voice and tense register throughout. CRUCIAL — vary the sentence openings strongly: NEVER begin two sentences in a row with the same word or with the subject's name; open different sentences with time or place adverbials, subordinate or participial clauses, prepositional phrases, direct speech, or an object — and refer to the protagonist mostly with pronouns or epithets instead of repeating the name. Vary sentence length, rhythm and structure, and do NOT mirror the structure of the previous sentences. Variety seed ${seed}+${sentences.length}. Do NOT use any double-quote (") character inside any sentence. Reply with ONLY a minified JSON array and nothing else: [{"t":"<${targetName} sentence>"}]`;
      let arr = null;
      for (let att = 0; att < 3 && !(Array.isArray(arr) && arr.length); att++) {
        if (att) await new Promise(r => setTimeout(r, 900 * att));
        if (storyTokenRef.current !== myTok) return null;
        let lastShown = sentences.length;
        try {
          const txt = window.aiStream ? await window.aiStream(prompt, acc => {
            if (storyTokenRef.current !== myTok) return;
            const partial = sentences.concat(parsePartial(acc));
            if (partial.length > lastShown) {
              lastShown = partial.length;
              if (onProgress) onProgress(partial.slice(0, N));
              setGenProg(Math.min(partial.length, N) + " / " + N);
            }
          }) : await window.aiComplete(prompt);
          arr = parseArr(txt);
        } catch (_) {
          arr = null;
        }
      }
      if (storyTokenRef.current !== myTok) return null;
      const before = sentences.length;
      if (Array.isArray(arr) && arr.length) sentences = sentences.concat(arr.filter(s => s && s.t).map(s => ({
        t: String(s.t).trim()
      })));
      if (storyTokenRef.current === myTok) {
        setGenProg(Math.min(sentences.length, N) + " / " + N);
        if (onProgress && sentences.length) onProgress(sentences.slice(0, N));
      }
      if (sentences.length === before) {
        if (sentences.length) break;
        return null;
      }
    }
    return sentences.length ? sentences : null;
  }
  // after the prose is on screen, fill in cloze verb tags + comprehension questions in parallel, then cache
  async function enrichStory(myTok, tid, level, tsig, sentences, cache) {
    const nativeName = recall("kunju-native", "German");
    let questions = null;
    try {
      questions = await buildQuestions(sentences, nativeName);
    } catch (e) {}
    if (storyTokenRef.current !== myTok) return;
    setStory(prev => prev && prev.gen === genRef.current ? {
      ...prev,
      questions: questions || prev.questions || null,
      enriching: false
    } : prev);
    if (cache) libInsert(lang, tid, level, tsig, sentences, questions);
    const shuffle = x => ({
      q: x.q,
      answer: x.answer,
      options: (x.options || []).slice().sort(() => Math.random() - 0.5)
    });
    setQuestions(questions && questions.length ? questions.map(shuffle) : {
      error: 1
    });
  }
  // collect the learner's saved words (vocabulary) + saved verbs for the current language
  function gatherMyWords() {
    let words = [];
    try {
      words = (getVocab() || []).filter(v => v.lang === lang && v.term).map(v => String(v.term).trim());
    } catch (e) {}
    const verbs = (favs || []).filter(f => f.lang === lang && f.verb).map(f => String(f.verb).replace(/^to /, "").trim());
    const all = [];
    const seen = {};
    verbs.concat(words).forEach(w => {
      const k = (w || "").toLowerCase();
      if (w && !seen[k]) {
        seen[k] = 1;
        all.push(w);
      }
    });
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = all[i];
      all[i] = all[j];
      all[j] = tmp;
    }
    return all.slice(0, 25);
  }
  async function genStory(forceNew) {
    const myTok = ++storyTokenRef.current;
    setStory({
      loading: true
    });
    setQuestions(null);
    setClozeItem(null);
    setStoryIdx(0);
    setQIdx(0);
    setVal("");
    setState("idle");
    setMsg("");
    setPicked(null);
    setExplain("");
    setGenProg("");
    setTransOpen(false);
    setStoryTrans(null);
    setReading("idle");
    readIdxRef.current = 0;
    setReadIdx(0);
    if (window.speechSynthesis) try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    const tid = topicsSel.length ? topicsSel[Math.floor(Math.random() * topicsSel.length)] : "random";
    const level = skill || "beginner";
    const tsig = !tenseSel.length || tenseSel.length === allTenseIds.length ? "mix" : tenseSel.slice().sort().join(",");
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
    if (!window.__hasAI()) {
      setStory({
        error: 1
      });
      return;
    }
    const myGen = ++genRef.current;
    const sentences = await buildProse(myTok, tid, partial => {
      if (storyTokenRef.current !== myTok || !partial || !partial.length) return;
      lastStoryRef.current = partial[0].t;
      setStory({
        sentences: partial,
        questions: null,
        topic: themeLabel(tid),
        enriching: true,
        streaming: true,
        gen: myGen
      });
    }, myWords);
    if (storyTokenRef.current !== myTok) return;
    if (!sentences || !sentences.length) {
      setStory({
        error: 1
      });
      return;
    }
    lastStoryRef.current = sentences[0].t;
    setStory({
      sentences,
      questions: null,
      topic: themeLabel(tid),
      enriching: true,
      gen: myGen
    });
    enrichStory(myTok, tid, level, tsig, sentences, !personalized);
  }
  function genQuestions() {
    if (!story || !story.sentences) return;
    const myTok = ++qTokRef.current;
    setQIdx(0);
    setVal("");
    setState("idle");
    setPicked(null);
    const shuffle = x => ({
      q: x.q,
      answer: x.answer,
      options: (x.options || []).slice().sort(() => Math.random() - 0.5)
    });
    if (Array.isArray(story.questions) && story.questions.length) {
      setQuestions(story.questions.map(shuffle));
      return;
    }
    setQuestions({
      loading: true
    });
    if (story.enriching) return; // background enrichment will deliver the questions
    buildQuestions(story.sentences, recall("kunju-native", "German")).then(arr => {
      if (qTokRef.current !== myTok) return;
      setQuestions(arr && arr.length ? arr.map(shuffle) : {
        error: 1
      });
    });
  }
  // cloze gaps now come from the stored verb tags — no per-sentence AI call
  function prepCloze(idx) {
    const s = story && story.sentences && story.sentences[idx];
    if (!s) {
      setClozeItem(null);
      return;
    }
    const form = s.v ? String(s.v).trim() : "";
    if (!form) {
      setClozeItem({
        full: s.t,
        gap: s.t,
        answer: "",
        nogap: true
      });
      return;
    }
    const e = form.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let re;
    try {
      re = new RegExp("(?<![\\p{L}])" + e + "(?![\\p{L}])", "u");
    } catch (x) {
      re = new RegExp("\\b" + e + "\\b");
    }
    let gap = s.t,
      hit = false;
    if (re.test(s.t)) {
      gap = s.t.replace(re, "…");
      hit = true;
    }
    const tlabel = s.tns || "";
    const topt = tenseOpts.find(t => t.label && tlabel && t.label.toLowerCase() === tlabel.toLowerCase());
    setClozeItem({
      full: s.t,
      gap: hit ? gap : s.t,
      answer: hit ? form : "",
      inf: s.inf || "",
      tenseLabel: tlabel,
      tenseId: topt ? topt.id : null,
      nogap: !hit
    });
  }
  function checkTexte() {
    if (state !== "idle") return;
    if (texteMode === "translate") {
      const s = story && story.sentences && story.sentences[storyIdx];
      if (!s) return;
      const ok = sentSim(val, s.t) >= 0.6 || deburr(norm(val)) === deburr(norm(s.t));
      setState(ok ? "correct" : "wrong");
      setMsg(ok ? praiseLine() : cheerLine());
    } else if (texteMode === "cloze") {
      const it = clozeItem;
      if (!it || !it.answer) return;
      const exact = norm(val) === norm(it.answer);
      const accentOnly = !exact && deburr(norm(val)) === deburr(norm(it.answer)) && norm(val).length > 0;
      const ok = exact || accentOnly;
      setState(ok ? "correct" : "wrong");
      setMsg(accentOnly ? tr("accent_hint", {
        answer: it.answer
      }) : ok ? praiseLine() : cheerLine());
      if (!ok) {
        const hint = tenseHint(lang, it.tenseId) || "";
        setExplain((it.tenseLabel || "") + (hint ? (it.tenseLabel ? " · " : "") + hint : ""));
      }
    }
    onActivity && onActivity();
  }
  function chooseTexte(opt) {
    if (state !== "idle") return;
    const qq = questions && questions[qIdx];
    if (!qq) return;
    setPicked(opt);
    const ok = norm(opt) === norm(qq.answer);
    setState(ok ? "correct" : "wrong");
    setMsg(ok ? praiseLine() : cheerLine());
    onActivity && onActivity();
  }
  function nextTexte() {
    setVal("");
    setState("idle");
    setMsg("");
    setPicked(null);
    setExplain("");
    if (texteMode === "question") {
      setQIdx(i => questions && i + 1 <= questions.length ? i + 1 : i);
    } else {
      const total = story && story.sentences ? story.sentences.length : 0;
      const ni = storyIdx + 1;
      setStoryIdx(ni);
      if (texteMode === "cloze" && ni < total) prepCloze(ni);
    }
  }
  function pickTexteMode(m) {
    setTexteMode(m);
    persist("kunju-textemode", m);
  }
  // collapsible native-language translation (open by default for beginners)
  // translate the whole story into the user's native language on demand (cached locally), then show it
  // read the story aloud sentence by sentence so it can be paused and resumed at the same spot
  function setReading(v) {
    readingRef.current = v;
    setReadingState(v);
  }
  function speakFrom(idx) {
    const sents = story && story.sentences || [];
    if (idx >= sents.length) {
      setReading("idle");
      readIdxRef.current = 0;
      setReadIdx(0);
      return;
    }
    readIdxRef.current = idx;
    setReadIdx(idx);
    const txt = String(sents[idx].t || "").replace(/…/g, " ").replace(/\s+/g, " ").trim();
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    if (!txt) {
      speakFrom(idx + 1);
      return;
    }
    let u;
    try {
      u = new SpeechSynthesisUtterance(txt);
    } catch (e) {
      setReading("idle");
      return;
    }
    const lng = window.CONJ[lang].ttsLang;
    const v = pickVoice(lng);
    u.lang = v && v.lang || lng;
    u.rate = TTS_RATE;
    if (v) u.voice = v;
    u.onend = () => {
      if (readingRef.current === "playing") speakFrom(idx + 1);
    };
    try {
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function playStory() {
    if (!story || !story.sentences || !story.sentences.length || !window.speechSynthesis) return;
    if (readingRef.current === "paused") {
      setReading("playing");
      try {
        window.speechSynthesis.resume();
      } catch (e) {}
      // iOS fallback: if the paused utterance got dropped, restart from the current sentence
      setTimeout(() => {
        try {
          if (readingRef.current === "playing" && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) speakFrom(readIdxRef.current);
        } catch (e) {}
      }, 260);
      return;
    }
    setReading("playing");
    speakFrom(0);
  }
  function pauseStory() {
    setReading("paused");
    try {
      window.speechSynthesis.pause();
    } catch (e) {}
  }
  function rewindStory() {
    if (!story || !story.sentences || !story.sentences.length) return;
    const ni = Math.max(0, readIdxRef.current - 2); // ~ a couple of sentences ≈ 5–10 s
    setReading("playing");
    speakFrom(ni);
  }
  function stopStory() {
    setReading("idle");
    readIdxRef.current = 0;
    setReadIdx(0);
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
  function ensureStoryTrans() {
    if (storyTrans != null) return;
    const sents = story && story.sentences || [];
    if (!sents.length) return;
    const native = recall("kunju-native", "German");
    const full = sents.map(s => s.t).join(" ");
    const key = `kunju-stortr-${native}-${strHash(full)}`;
    const cached = recall(key, null);
    if (cached) {
      setStoryTrans(cached);
      return;
    }
    if (!window.__hasAI()) {
      setStoryTrans("—");
      return;
    }
    setStoryTrans("…");
    const targetName = window.CONJ[lang].name;
    window.aiComplete(`Translate this ${targetName} short story into natural, fluent ${native}. Stay faithful to the original and keep the same flow. Reply with ONLY the ${native} translation, no quotes and no extra text:\n\n${full}`).then(txt => {
      const out = String(txt || "").trim().replace(/^["'«»]+|["'«»]+$/g, "");
      if (out) {
        persist(key, out);
        setStoryTrans(out);
      } else setStoryTrans("—");
    }).catch(() => setStoryTrans("—"));
  }
  function nativeTrans() {
    if (!story || !story.sentences) return null;
    return /*#__PURE__*/React.createElement("div", {
      className: "texte-trans"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setTransOpen(o => {
        const nv = !o;
        if (nv) ensureStoryTrans();
        return nv;
      }),
      style: {
        background: "none",
        border: "none",
        color: LANG_META[lang].color,
        cursor: "pointer",
        fontWeight: 600,
        fontSize: ".82rem",
        padding: "4px 0",
        marginTop: "4px"
      }
    }, (transOpen ? "▾ " : "▸ ") + tr("texte_translation")), transOpen && /*#__PURE__*/React.createElement("div", {
      className: "clozenative",
      style: {
        marginTop: "2px",
        textAlign: "left",
        lineHeight: 1.6
      }
    }, storyTrans || "…"));
  }
  // (re)generate the story when entering Texte mode or when the selection / level changes
  useEffect(() => {
    if (mode === "texte") genStory(); /* eslint-disable-next-line */
  }, [mode, lang, skill, topicsSel.join(","), tenseSel.join(",")]);
  // when the story is ready or the sub-mode changes, prepare that sub-mode's task
  useEffect(() => {
    if (mode !== "texte" || !story || !story.sentences) return;
    setStoryIdx(0);
    setQIdx(0);
    setVal("");
    setState("idle");
    setMsg("");
    setPicked(null);
    setExplain("");
    setTransOpen(false);
    setStoryTrans(null);
    if (texteMode === "question") genQuestions();else if (texteMode === "cloze") prepCloze(0);
    /* eslint-disable-next-line */
  }, [texteMode, story && story.gen]);
  useEffect(() => {
    texteModeRef.current = texteMode;
  }, [texteMode]);
  useEffect(() => {
    storyIdxRef.current = storyIdx;
  }, [storyIdx]);
  useEffect(() => {
    if (mode !== "texte") {
      setReading("idle");
      readIdxRef.current = 0;
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    } /* eslint-disable-next-line */
  }, [mode]);
  useEffect(() => {
    if (reading !== "idle" && sentRefs.current[readIdx]) {
      try {
        sentRefs.current[readIdx].scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      } catch (e) {}
    } /* eslint-disable-next-line */
  }, [readIdx, reading]);
  const texteLoading = mode === "texte" && !!(story && story.loading);
  useEffect(() => {
    if (!texteLoading) return;
    setGenSecs(0);
    const id = setInterval(() => setGenSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [texteLoading]);
  const pct = score.total ? Math.round(score.right / score.total * 100) : 0;
  const mistakes = (mver, getMistakes(lang));
  const MODES = [{
    id: "cards",
    label: tr("m_cards"),
    icon: "🃏"
  }, {
    id: "choice",
    label: tr("m_choice"),
    icon: "◉"
  }, {
    id: "type",
    label: tr("m_type"),
    icon: "⌨"
  }, {
    id: "speed",
    label: tr("m_speed"),
    icon: "⚡"
  }, {
    id: "speak",
    label: tr("m_speak"),
    icon: "🎤"
  }, {
    id: "texte",
    label: tr("m_texte"),
    icon: "📖"
  }];
  // normalized set of the learner's saved words/verbs (to underline them in stories)
  const savedSet = useMemo(() => {
    const s = new Set();
    try {
      (getVocab() || []).forEach(v => {
        if (v.lang === lang && v.term) s.add(deburr(norm(v.term)));
      });
    } catch (e) {}
    (favs || []).forEach(f => {
      if (f.lang === lang && f.verb) s.add(deburr(norm(String(f.verb).replace(/^to /, ""))));
    });
    return s;
  }, [lang, favs, story, mver]);
  function TenseBar() {
    if (mistMode) return null;
    const isRev = cardDir === "target";
    const fromC = isRev ? LANG_META[lang].code : nativeLangCode;
    const toC = isRev ? nativeLangCode : LANG_META[lang].code;
    const dcap = isRev ? tr("dir_recognize") : tr("dir_produce");
    return /*#__PURE__*/React.createElement("div", {
      className: "quiztenses"
    }, /*#__PURE__*/React.createElement("div", {
      className: "qfilter-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "recent-title qfilter-lbl"
    }, tr("skill_q")), /*#__PURE__*/React.createElement(OneDropdown, {
      lang: lang,
      options: [{ id: "beginner", label: tr("skill_beginner") }, { id: "intermediate", label: tr("skill_intermediate") }, { id: "advanced", label: tr("skill_advanced") }],
      valueId: skill,
      onPick: id => onSkill && onSkill(id)
    })), /*#__PURE__*/React.createElement("div", {
      className: "qfilter-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "recent-title qfilter-lbl"
    }, tr("which_tense")), /*#__PURE__*/React.createElement(TenseDropdown, {
      lang: lang,
      tenses: [...tenseOpts].sort((a, b) => (a.label || "").localeCompare(b.label || "")),
      isOn: id => tenseSel.indexOf(id) >= 0,
      onToggle: toggleTense,
      onAll: () => setAllTenses(true),
      onNone: () => setAllTenses(false),
      hideLbl: true
    }), !tenseSel.length && /*#__PURE__*/React.createElement("div", {
      className: "qfilter-hint"
    }, tr("none_all"))), groups.length > 1 && /*#__PURE__*/React.createElement("div", {
      className: "qfilter-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "recent-title qfilter-lbl"
    }, tr("which_verbs")), /*#__PURE__*/React.createElement(OneDropdown, {
      lang: lang,
      options: groups.map(g => ({
        id: g.id,
        label: groupLabel(g)
      })),
      valueId: selGroup,
      onPick: pickGroup
    })), mode !== "choice" && mode !== "texte" && /*#__PURE__*/React.createElement("div", {
      className: "qfilter-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "recent-title qfilter-lbl"
    }, tr("which_dir")), /*#__PURE__*/React.createElement("div", {
      className: "tdwrap",
      style: {
        "--lc": LANG_META[lang].color
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "tdbtn swap",
      onClick: () => {
        const d = isRev ? "native" : "target";
        setCardDir(d);
        persist("kunju-carddir", d);
        setThisDir(d);
        if (d === "native" && q) fetchTransl(q.verb);
      },
      title: tr("which_dir")
    }, /*#__PURE__*/React.createElement("span", {
      className: "tdbtn-sum"
    }, /*#__PURE__*/React.createElement("span", {
      className: "swapcode"
    }, fromC), /*#__PURE__*/React.createElement("i", {
      className: "swaparrow"
    }, "\u2192"), /*#__PURE__*/React.createElement("span", {
      className: "swapcode"
    }, toC), /*#__PURE__*/React.createElement("span", {
      className: "swapcap"
    }, dcap)), /*#__PURE__*/React.createElement("span", {
      className: "tdbtn-caret swapcaret"
    }, "\u21C4")))), /*#__PURE__*/React.createElement("div", {
      className: "qfilter-block"
    }, /*#__PURE__*/React.createElement("div", {
      className: "recent-title qfilter-lbl"
    }, tr("which_theme")), /*#__PURE__*/React.createElement(MultiDropdown, {
      lang: lang,
      options: allThemes.map(th => ({
        id: th.id,
        label: themeLabel(th.id)
      })).sort((a, b) => a.label.localeCompare(b.label)),
      isOn: id => topicsSel.includes(id),
      onToggle: toggleTopic,
      onAll: () => setTopicsSel(["random"]),
      onNone: () => setTopicsSel(["random"]),
      onAdd: addCustomTopic,
      onRemove: removeCustomTopic,
      removable: id => id.indexOf("cat:") === 0
    })));
  }
  function MistakeBar() {
    const inMist = mistMode;
    if (!inMist && mistakes.length === 0) return null;
    return /*#__PURE__*/React.createElement("button", {
      className: "mistbtn" + (inMist ? " on" : ""),
      onClick: () => {
        setMistMode(!inMist);
        if (!inMist) {
          setSelGroup("all");
          setTypeMode("form");
          setSpkMode("form");
        }
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "mistbtn-ic"
    }, inMist ? "←" : "⚠"), /*#__PURE__*/React.createElement("span", {
      className: "mistbtn-tx"
    }, inMist ? tr("mist_exit") : tr("mist_practice")), /*#__PURE__*/React.createElement("span", {
      className: "mistbtn-n"
    }, mistakes.length));
  }
  function ClozeThemes() {
    return /*#__PURE__*/React.createElement("div", {
      className: "tfilter spkthemes scrollthemes clozethemes"
    }, allThemes.map((th, i) => /*#__PURE__*/React.createElement("button", {
      key: th.id,
      className: "tfilterchip" + (topicsSel.includes(th.id) ? " on" : ""),
      style: {
        "--cc": RAINBOW[i % RAINBOW.length]
      },
      onClick: () => pickClozeTopic(th.id)
    }, /*#__PURE__*/React.createElement("span", {
      className: "dotmini"
    }), themeLabel(th.id))));
  }
  function ScoreLine() {
    return null;
  }
  function Prompt() {
    return /*#__PURE__*/React.createElement("div", {
      className: "quizprompt",
      style: {
        "--lc": LANG_META[lang].color
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "quizverb quizverb-link",
      title: tr("view_conj"),
      onClick: () => onStudy && onStudy(lang, q.verb)
    }, q.verb, " ", /*#__PURE__*/React.createElement("span", {
      className: "qm-study-ic"
    }, "\u2197")), /*#__PURE__*/React.createElement("span", {
      className: "quizarrow"
    }, "\u2192"), /*#__PURE__*/React.createElement("span", {
      className: "quizpron"
    }, q.pronoun));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "view",
    style: {
      "--lc": LANG_META[lang].color
    }
  }, chMoment && /*#__PURE__*/React.createElement("div", {
    className: "chmoment",
    onClick: () => setChMoment(null)
  }, /*#__PURE__*/React.createElement("span", {
    className: "chmoment-ic",
    dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='17' height='17' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M5 13l4 4L19 7'/></svg>" }
  }), /*#__PURE__*/React.createElement("span", null, tr("ch_moment", { v: chMoment }))), /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "quizmode-hd"
  }, tr("quiz_mode_hd")), /*#__PURE__*/React.createElement("div", {
    className: "quizmodes"
  }, MODES.map((m, i) => /*#__PURE__*/React.createElement("button", {
    key: m.id,
    className: "qmode" + (mode === m.id ? " on" : ""),
    style: {
      "--mc": LANG_META[lang].color
    },
    onClick: () => setModeP(m.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "qmode-ic"
  }, /*#__PURE__*/React.createElement(QModeIcon, {
    id: m.id
  })), /*#__PURE__*/React.createElement("span", {
    className: "qmode-lb"
  }, m.label.replace(/^[^\s]+\s/, ""))))), /*#__PURE__*/React.createElement(ExplainCard, {
    key: mode,
    seenKey: "kunju-xpl-" + mode,
    title: tr("explain_hd"),
    html: quizExplainHtml(mode)
  }), TenseBar(), q && mode !== "speed" && score.streak >= 3 && /*#__PURE__*/React.createElement("div", {
    className: "combobadge t" + (score.streak >= 10 ? "3" : score.streak >= 5 ? "2" : "1"),
    key: "cb" + score.streak,
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("span", {
    className: "combobars",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("b", {
    className: "combonum"
  }, score.streak), /*#__PURE__*/React.createElement("span", {
    className: "combolbl"
  }, ({
    de: "in Folge",
    en: "in a row",
    es: "seguidas",
    nl: "op rij",
    fr: "d'affilée"
  })[UILANG] || "in a row")), mistMode && mistakes.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "mistdone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mistdone-ic"
  }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("h3", null, tr("mist_clear_title")), /*#__PURE__*/React.createElement("p", null, tr("mist_clear_sub")), /*#__PURE__*/React.createElement("button", {
    className: "quizbtn check",
    onClick: () => setMistMode(false)
  }, tr("mist_exit"))), mode === "type" && q && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ScoreLine, null), /*#__PURE__*/React.createElement("div", {
    className: "modepick speakpick"
  }, /*#__PURE__*/React.createElement("span", {
    className: "modepick-label"
  }, "\u2328 ", tr("spk_what")), /*#__PURE__*/React.createElement("div", {
    className: "modegrid speakmodes"
  }, /*#__PURE__*/React.createElement("button", {
    className: "modebtn" + (typeMode === "form" ? " on" : ""),
    onClick: () => {
      setTypeMode("form");
    }
  }, tr("type_word")), /*#__PURE__*/React.createElement("button", {
    className: "modebtn" + (typeMode === "sentence" ? " on" : ""),
    onClick: () => {
      setTypeMode("sentence");
      setVal("");
      setState("idle");
      setRevealed(false);
      genSentence(lang);
    }
  }, tr("type_sentence")))), typeMode === "form" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "quizcard quizmodern " + state,
    style: {
      "--lc": LANG_META[lang].color
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cards-cue cards-cue-top"
  }, /*#__PURE__*/React.createElement("span", { style: { color: "var(--muted)", fontWeight: 600 } }, tr("req_form"), ": "), /*#__PURE__*/React.createElement("b", null, q.tenseLabel + " · " + q.pronoun)), /*#__PURE__*/React.createElement("div", {
    className: "qm-top",
    "data-typequiz": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flashtense"
  }, q.tenseLabel, skill !== "advanced" && (quizHint(lang, q) || auxHint(lang, q.tenseId, q.answer)) ? /*#__PURE__*/React.createElement("span", {
    className: "flashhint-inline"
  }, quizHint(lang, q) || auxHint(lang, q.tenseId, q.answer)) : null), q.isIrregular && /*#__PURE__*/React.createElement("span", {
    className: "flashtag"
  }, tr("irregular")), /*#__PURE__*/React.createElement("button", {
    className: "starbtn qm-star" + (favs.some(x => x.lang === lang && x.verb === q.verb) ? " on" : ""),
    title: "Save verb",
    onClick: () => toggleFav(lang, q.verb)
  }, favs.some(x => x.lang === lang && x.verb === q.verb) ? "★" : "☆")), /*#__PURE__*/React.createElement(QuizTip, { formation: quizHint(lang, q) || auxHint(lang, q.tenseId, q.answer), irregular: q.isIrregular, vtrans: transl, strans: skill !== "beginner" && cloze ? cloze.native : null }), /*#__PURE__*/React.createElement("div", {
    className: "qm-prompt"
  }, /*#__PURE__*/React.createElement("button", {
    className: "flashverb flashverb-link",
    title: tr("view_conj"),
    onClick: () => onStudy && onStudy(lang, q.verb)
  }, q.verb.replace(/^to /, ""), " ", /*#__PURE__*/React.createElement("span", {
    className: "qm-study-ic"
  }, "\u2197")), /*#__PURE__*/React.createElement("span", {
    className: "flashpron"
  }, q.pronoun)), cloze && (cloze.loading ? /*#__PURE__*/React.createElement("div", {
    className: "spkreveal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "exloading"
  }, "\u2026")) : /*#__PURE__*/React.createElement("div", {
    className: "spkreveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "spkreveal-row"
  }, /*#__PURE__*/React.createElement(WordSentence, {
    text: state === "idle" ? cloze.gap : cloze.full,
    fromName: window.CONJ[lang].name,
    toName: recall("kunju-native", "German"),
    cachePrefix: `kunju-wtr-${lang}-nat`,
    big: true,
    accent: true,
    saveLang: lang,
    saveDir: "fromTarget",
    showHint: true
  }), state !== "idle" && /*#__PURE__*/React.createElement("button", {
    className: "flashspeak",
    onClick: () => speak(cloze.full, q.ttsLang)
  }, /*#__PURE__*/React.createElement("span", { className: "ico-spk", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='1em' height='1em' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='display:block'><path d='M11 5 6 9H2v6h4l5 4V5z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/><path d='M19 5a9 9 0 0 1 0 14'/></svg>" } }))), cloze.native && skill === "beginner" && /*#__PURE__*/React.createElement("div", {
    className: "clozenative"
  }, cloze.native))), /*#__PURE__*/React.createElement("div", {
    className: "quizinput"
  }, /*#__PURE__*/React.createElement("input", {
    ref: inRef,
    value: val,
    "aria-label": "Antwort eingeben",
    placeholder: "\u2026",
    disabled: state !== "idle",
    onChange: e => setVal(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") {
        state === "idle" ? check() : next();
      }
    },
    autoComplete: "off",
    autoCapitalize: "off",
    spellCheck: "false",
    style: {
      height: "40px"
    }
  })), state === "correct" && /*#__PURE__*/React.createElement("div", {
    className: "feedback ok"
  }, "\u2713 ", msg || tr("correct_excl")), state === "wrong" && /*#__PURE__*/React.createElement("div", {
    className: "feedback no"
  }, msg ? msg + " · " : "✗ ", tr("answer"), " ", /*#__PURE__*/React.createElement("b", null, q.answer)), state === "idle" ? /*#__PURE__*/React.createElement("button", {
    className: "quizbtn check qm-check",
    onClick: check
  }, tr("check")) : /*#__PURE__*/React.createElement("button", {
    className: "quizbtn next",
    onClick: next
  }, tr("next"))), /*#__PURE__*/React.createElement("p", {
    className: "quizhint"
  }, tr("hint_type"))) : /*#__PURE__*/React.createElement("div", {
    className: "quizcard quizmodern " + state,
    style: {
      "--lc": LANG_META[lang].color
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "qm-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flashtense"
  }, sent && sent.tenseLabel ? sent.tenseLabel : tr("type_sentence"), sent && sent.tenseId && skill !== "advanced" && tenseHint(lang, sent.tenseId) ? /*#__PURE__*/React.createElement("span", {
    className: "flashhint-inline"
  }, tenseHint(lang, sent.tenseId)) : null)), !sent || sent.loading ? /*#__PURE__*/React.createElement("div", {
    className: "qm-prompt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "exloading"
  }, "\u2026")) : sent.error ? /*#__PURE__*/React.createElement("div", {
    className: "qm-prompt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "exloading"
  }, "\u2014")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "spkreveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "spkreveal-label"
  }, tr("spk_translate")), /*#__PURE__*/React.createElement("div", {
    className: "spkreveal-row"
  }, /*#__PURE__*/React.createElement(WordSentence, {
    text: sent.n,
    fromName: recall("kunju-native", "German"),
    toName: window.CONJ[lang].name,
    cachePrefix: `kunju-wtr-nat-${lang}`,
    big: true,
    saveLang: lang,
    saveDir: "fromNative"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "quizinput"
  }, /*#__PURE__*/React.createElement("input", {
    ref: inRef,
    value: val,
    "aria-label": "Antwort eingeben",
    placeholder: "\u2026",
    disabled: state !== "idle",
    onChange: e => setVal(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") {
        state === "idle" ? check() : next();
      }
    },
    autoComplete: "off",
    autoCapitalize: "off",
    spellCheck: "false"
  })), state === "correct" && /*#__PURE__*/React.createElement("div", {
    className: "feedback ok"
  }, "\u2713 ", msg || tr("correct_excl")), state === "wrong" && /*#__PURE__*/React.createElement("div", {
    className: "feedback no"
  }, msg || "✗"), state !== "idle" && /*#__PURE__*/React.createElement("div", {
    className: "spkreveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "spkreveal-label"
  }, tr("spk_correct_is"), " ", /*#__PURE__*/React.createElement("span", {
    className: "spkreveal-tap"
  }, "\xB7 ", tr("tap_save"))), /*#__PURE__*/React.createElement("div", {
    className: "spkreveal-row"
  }, /*#__PURE__*/React.createElement(WordSentence, {
    text: sent.t,
    fromName: window.CONJ[lang].name,
    toName: recall("kunju-native", "German"),
    cachePrefix: `kunju-wtr-${lang}-nat`,
    big: true,
    accent: true,
    saveLang: lang,
    saveDir: "fromTarget"
  }), /*#__PURE__*/React.createElement("button", {
    className: "flashspeak",
    onClick: () => speak(sent.t, window.CONJ[lang].ttsLang)
  }, /*#__PURE__*/React.createElement("span", { className: "ico-spk", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='1em' height='1em' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='display:block'><path d='M11 5 6 9H2v6h4l5 4V5z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/><path d='M19 5a9 9 0 0 1 0 14'/></svg>" } })))), state === "idle" ? /*#__PURE__*/React.createElement("button", {
    className: "quizbtn check qm-check",
    onClick: check
  }, tr("check")) : /*#__PURE__*/React.createElement("button", {
    className: "quizbtn next",
    onClick: () => {
      setVal("");
      setState("idle");
      setRevealed(false);
      setMsg("");
      genSentence(lang);
    }
  }, tr("spk_next_sentence"))))), mode === "texte" && /*#__PURE__*/React.createElement(React.Fragment, null, isActive && reading !== "idle" && story && story.sentences && typeof ReactDOM !== "undefined" && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      right: "12px",
      bottom: "calc(12px + env(safe-area-inset-bottom))",
      zIndex: 4000,
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "999px",
      boxShadow: "0 10px 30px rgba(0,0,0,.24)",
      padding: "7px 12px 7px 14px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "12px",
      fontWeight: 800,
      color: LANG_META[lang].color,
      whiteSpace: "nowrap"
    }
  }, readIdx + 1, "/", story.sentences.length), /*#__PURE__*/React.createElement("button", {
    onClick: rewindStory,
    title: "\u221210 s",
    style: {
      border: "1px solid var(--border)",
      borderRadius: "999px",
      width: "40px",
      height: "36px",
      background: "var(--surface-2)",
      color: "var(--text)",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer"
    }
  }, "\u21BA10"), /*#__PURE__*/React.createElement("button", {
    onClick: () => reading === "playing" ? pauseStory() : playStory(),
    style: {
      border: "none",
      borderRadius: "999px",
      width: "40px",
      height: "36px",
      background: LANG_META[lang].color,
      color: "#fff",
      fontSize: "15px",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "txtico",
    dangerouslySetInnerHTML: { __html: reading === "playing" ? IC_PAUSE : IC_PLAY }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: stopStory,
    style: {
      border: "1px solid var(--border)",
      borderRadius: "999px",
      width: "40px",
      height: "36px",
      background: "var(--surface-2)",
      color: "var(--text)",
      fontSize: "13px",
      cursor: "pointer"
    }
  }, "\u23F9")), typeof document !== "undefined" && document.querySelector(".phone") || document.body), /*#__PURE__*/React.createElement("div", {
    className: "quiztenses"
  }, (getVocab().some(v => v.lang === lang) || favs.some(f => f.lang === lang)) && /*#__PURE__*/React.createElement("div", {
    className: "qfilter-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "recent-title qfilter-lbl"
  }, tr("texte_mywords_lbl")), /*#__PURE__*/React.createElement("button", {
    className: "modebtn" + (useMyWords ? " on" : ""),
    style: {
      width: "100%"
    },
    onClick: () => {
      const nv = !useMyWords;
      setUseMyWords(nv);
      useMyWordsRef.current = nv;
      persist("kunju-texte-mywords", nv);
      genStory(true);
    }
  }, "\u2605 ", tr("texte_mywords"), useMyWords ? " ✓" : "")), /*#__PURE__*/React.createElement("div", {
    className: "qfilter-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "recent-title qfilter-lbl"
  }, tr("texte_speed")), /*#__PURE__*/React.createElement("div", {
    className: "modegrid"
  }, [[0.5, "0,5×"], [0.75, "0,75×"], [1, "1×"], [1.25, "1,25×"]].map(o => {
    const on = [0.5, 0.75, 1, 1.25].reduce((a, b) => Math.abs(b - ttsRate) < Math.abs(a - ttsRate) ? b : a, 1) === o[0];
    return /*#__PURE__*/React.createElement("button", {
      key: o[0],
      className: "modebtn" + (on ? " on" : ""),
      style: {
        flex: "1 1 0",
        minWidth: 0
      },
      onClick: () => {
        setTtsRateState(o[0]);
        applyTtsRate(o[0]);
        setReading("idle");
        readIdxRef.current = 0;
        if (window.speechSynthesis) try {
          window.speechSynthesis.cancel();
        } catch (e) {}
      }
    }, o[1]);
  }))), langVoices.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "qfilter-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "recent-title qfilter-lbl"
  }, tr("texte_voice")), /*#__PURE__*/React.createElement("div", {
    className: "modegrid"
  }, (() => {
    const rank = v => (NICE_VOICE.test(v.name) ? 2 : 0) - (BAD_VOICE.test(v.name) ? 2 : 0) + (v.localService ? 1 : 0);
    const ranked = langVoices.slice().sort((a, b) => rank(b) - rank(a));
    const seen = new Set();
    const list = [];
    for (const v of ranked) {
      const k = cleanVoiceName(v.name).toLowerCase();
      if (!k || seen.has(k)) continue;
      seen.add(k);
      list.push(v);
      if (list.length >= 4) break;
    }
    const opts = [{ uri: "", label: "Auto" }].concat(list.map(v => ({ uri: v.voiceURI, label: cleanVoiceName(v.name) })));
    return opts.map(o => /*#__PURE__*/React.createElement("button", {
      key: o.uri || "auto",
      className: "modebtn" + ((voiceSel || "") === o.uri ? " on" : ""),
      style: {
        flex: "1 1 0",
        minWidth: 0
      },
      onClick: () => {
        setVoiceSel(o.uri);
        setSavedVoice(ttsBase, o.uri);
        setSavedGender(ttsBase, "");
        setVoiceGenderSel("");
        setReading("idle");
        readIdxRef.current = 0;
        if (window.speechSynthesis) try {
          window.speechSynthesis.cancel();
        } catch (x) {}
        // short, self-limiting voice sample (first few words) so it can't "run away" and is clearly a preview
        const sample = story && story.sentences && story.sentences[0] ? String(story.sentences[0].t).split(/\s+/).slice(0, 4).join(" ") : "";
        if (sample) speak(sample, window.CONJ[lang].ttsLang);
      }
    }, o.label));
  })()))), /*#__PURE__*/React.createElement("button", {
    className: "quizbtn again",
    onClick: () => genStory(true),
    style: {
      width: "100%",
      marginBottom: "10px",
      minHeight: "42px",
      padding: "9px 14px",
      fontSize: "14px"
    }
  }, txtIco(IC_REDO, tr("texte_new"))), /*#__PURE__*/React.createElement("div", {
    className: "quizcard quizmodern " + state,
    style: {
      "--lc": LANG_META[lang].color
    }
  }, !story || story.loading ? /*#__PURE__*/React.createElement("div", {
    className: "qm-prompt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "exloading"
  }, "\u2026"), /*#__PURE__*/React.createElement("div", {
    className: "clozenative",
    style: {
      marginTop: "8px"
    }
  }, tr("texte_writing"), genProg ? " · " + genProg : ""), /*#__PURE__*/React.createElement("div", {
    className: "clozenative",
    style: {
      marginTop: "4px",
      fontWeight: 700
    }
  }, "\u23F1 ", (skill === "advanced" ? 40 : skill === "intermediate" ? 30 : 22) - genSecs > 0 ? "~" + ((skill === "advanced" ? 40 : skill === "intermediate" ? 30 : 22) - genSecs) + " s" : tr("texte_almost")), /*#__PURE__*/React.createElement("div", {
    className: "clozenative",
    style: {
      marginTop: "6px",
      opacity: .85
    }
  }, (TEXTE_TIPS[UILANG] || TEXTE_TIPS.en)[Math.floor(genSecs / 4) % (TEXTE_TIPS[UILANG] || TEXTE_TIPS.en).length])) : story.error ? /*#__PURE__*/React.createElement("div", {
    className: "qm-prompt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "exloading"
  }, "\u2014"), /*#__PURE__*/React.createElement("div", {
    className: "clozenative",
    style: {
      marginTop: "8px"
    }
  }, tr("texte_error"))) : /*#__PURE__*/React.createElement(React.Fragment, null, texteMode === "question" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "spkreveal"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "14.5px",
      color: LANG_META[lang].color
    }
  }, txtIco(IC_BOOK, story.topic)), /*#__PURE__*/React.createElement("button", {
    onClick: () => reading === "playing" ? pauseStory() : playStory(),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      background: "color-mix(in srgb, " + LANG_META[lang].color + " 14%, var(--surface))",
      border: "1px solid color-mix(in srgb, " + LANG_META[lang].color + " 35%, transparent)",
      borderRadius: "999px",
      padding: "5px 12px",
      color: LANG_META[lang].color,
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: ".8rem",
      cursor: "pointer",
      flexShrink: 0
    }
  }, reading === "playing" ? txtIco(IC_PAUSE, tr("texte_pause")) : reading === "paused" ? txtIco(IC_PLAY, tr("texte_resume")) : txtIco(IC_SPK, tr("texte_read")))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--muted)",
      marginTop: "3px",
      marginBottom: "9px"
    }
  }, txtIco(IC_TAP, tr("tap_save"))), /*#__PURE__*/React.createElement("div", {
    className: "spkreveal-row",
    style: {
      lineHeight: "2",
      display: "block",
      textAlign: "left",
      textWrap: "pretty",
      hyphens: "auto"
    }
  }, story.sentences.map((s, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    ref: el => {
      sentRefs.current[i] = el;
    },
    style: {
      background: reading !== "idle" && i === readIdx ? "color-mix(in srgb, " + LANG_META[lang].color + " 22%, transparent)" : "transparent",
      borderRadius: "5px",
      boxDecorationBreak: "clone",
      WebkitBoxDecorationBreak: "clone",
      transition: "background .25s"
    }
  }, /*#__PURE__*/React.createElement(WordSentence, {
    text: s.t,
    fromName: window.CONJ[lang].name,
    toName: recall("kunju-native", "German"),
    cachePrefix: `kunju-wtr-${lang}-nat`,
    big: true,
    accent: true,
    saveLang: lang,
    saveDir: "fromTarget",
    wordChip: true,
    inline: true,
    savedSet: savedSet,
    onSaved: () => onTab && onTab("saved")
  }), " "))), nativeTrans()), !questions || questions.loading ? /*#__PURE__*/React.createElement("div", {
    className: "qm-prompt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "exloading"
  }, "\u2026")) : questions.error ? /*#__PURE__*/React.createElement("div", {
    className: "clozenative",
    style: {
      marginTop: "10px"
    }
  }, tr("texte_error")) : qIdx >= questions.length ? /*#__PURE__*/React.createElement("div", {
    className: "mistdone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mistdone-ic"
  }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("h3", null, tr("texte_done"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "choose-label",
    style: {
      marginTop: "12px"
    }
  }, tr("texte_comprehension"), " \xB7 ", qIdx + 1, "/", questions.length), /*#__PURE__*/React.createElement("div", {
    className: "qm-prompt",
    style: {
      fontSize: "1.02rem"
    }
  }, questions[qIdx].q), /*#__PURE__*/React.createElement("div", {
    className: "qopts"
  }, questions[qIdx].options.map((opt, i) => {
    let cls = "qopt";
    if (state !== "idle") {
      if (norm(opt) === norm(questions[qIdx].answer)) cls += " correct";else if (picked === opt) cls += " wrong";
    }
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      className: cls,
      disabled: state !== "idle",
      onClick: () => chooseTexte(opt)
    }, opt);
  })), state === "correct" && /*#__PURE__*/React.createElement("div", {
    className: "feedback ok"
  }, "\u2713 ", msg || tr("correct_excl")), state === "wrong" && /*#__PURE__*/React.createElement("div", {
    className: "feedback no"
  }, msg || "✗"), state !== "idle" && /*#__PURE__*/React.createElement("button", {
    className: "quizbtn next",
    onClick: nextTexte
  }, tr("next"))))))), mode === "choice" && q && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ScoreLine, null), /*#__PURE__*/React.createElement("div", {
    className: "quizcard quizmodern " + state,
    style: {
      "--lc": LANG_META[lang].color
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cards-cue cards-cue-top"
  }, /*#__PURE__*/React.createElement("span", { style: { color: "var(--muted)", fontWeight: 600 } }, tr("req_form"), ": "), /*#__PURE__*/React.createElement("b", null, q.tenseLabel + " · " + q.pronoun)), /*#__PURE__*/React.createElement("div", {
    className: "qm-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flashtense"
  }, q.tenseLabel, skill !== "advanced" && (quizHint(lang, q) || auxHint(lang, q.tenseId, q.answer)) ? /*#__PURE__*/React.createElement("span", {
    className: "flashhint-inline"
  }, quizHint(lang, q) || auxHint(lang, q.tenseId, q.answer)) : null), q.isIrregular && /*#__PURE__*/React.createElement("span", {
    className: "flashtag"
  }, tr("irregular")), /*#__PURE__*/React.createElement("button", {
    className: "starbtn qm-star" + (favs.some(x => x.lang === lang && x.verb === q.verb) ? " on" : ""),
    title: "Save verb",
    onClick: () => toggleFav(lang, q.verb)
  }, favs.some(x => x.lang === lang && x.verb === q.verb) ? "★" : "☆")), /*#__PURE__*/React.createElement(QuizTip, { formation: quizHint(lang, q) || auxHint(lang, q.tenseId, q.answer), irregular: q.isIrregular, vtrans: transl, strans: skill !== "beginner" && cloze ? cloze.native : null }), /*#__PURE__*/React.createElement("div", {
    className: "qm-prompt"
  }, /*#__PURE__*/React.createElement("button", {
    className: "flashverb flashverb-link",
    title: tr("view_conj"),
    onClick: () => onStudy && onStudy(lang, q.verb)
  }, q.verb.replace(/^to /, ""), " ", /*#__PURE__*/React.createElement("span", {
    className: "qm-study-ic"
  }, "\u2197")), /*#__PURE__*/React.createElement("span", {
    className: "flashpron"
  }, q.pronoun)), cloze && (cloze.loading ? /*#__PURE__*/React.createElement("div", {
    className: "spkreveal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "exloading"
  }, "\u2026")) : /*#__PURE__*/React.createElement("div", {
    className: "spkreveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "spkreveal-row"
  }, /*#__PURE__*/React.createElement(WordSentence, {
    text: state === "idle" ? cloze.gap : cloze.full,
    fromName: window.CONJ[lang].name,
    toName: recall("kunju-native", "German"),
    cachePrefix: `kunju-wtr-${lang}-nat`,
    big: true,
    accent: true,
    saveLang: lang,
    saveDir: "fromTarget"
  }), state !== "idle" && /*#__PURE__*/React.createElement("button", {
    className: "flashspeak",
    onClick: () => speak(cloze.full, q.ttsLang)
  }, /*#__PURE__*/React.createElement("span", { className: "ico-spk", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='1em' height='1em' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='display:block'><path d='M11 5 6 9H2v6h4l5 4V5z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/><path d='M19 5a9 9 0 0 1 0 14'/></svg>" } }))), cloze.native && skill === "beginner" && /*#__PURE__*/React.createElement("div", {
    className: "clozenative"
  }, cloze.native))), reportBtn(), /*#__PURE__*/React.createElement("div", {
    className: "choose-label"
  }, tr("choose_label")), /*#__PURE__*/React.createElement("div", {
    className: "qopts"
  }, q.options.map((opt, i) => {
    let cls = "qopt";
    if (state !== "idle") {
      if (norm(opt) === norm(q.answer)) cls += " correct";else if (opt === picked) cls += " wrong";else cls += " dim";
    }
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      className: cls,
      disabled: state !== "idle",
      onClick: () => choose(opt)
    }, opt);
  })), state !== "idle" && /*#__PURE__*/React.createElement("button", {
    className: "quizbtn next",
    onClick: next
  }, tr("next"))), /*#__PURE__*/React.createElement("p", {
    className: "quizhint"
  }, tr("hint_choice"))), mode === "speed" && /*#__PURE__*/React.createElement(React.Fragment, null, speedState === "idle" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "speedstart"
  }, /*#__PURE__*/React.createElement("div", {
    className: "speedbig"
  }, "\u26A1"), /*#__PURE__*/React.createElement("h3", null, tr("challenge")), /*#__PURE__*/React.createElement("p", null, tr("challenge_sub")), /*#__PURE__*/React.createElement("div", {
    className: "speedbest"
  }, tr("best"), " ", /*#__PURE__*/React.createElement("b", null, speedBest)), /*#__PURE__*/React.createElement("button", {
    className: "quizbtn check",
    onClick: startSpeed
  }, tr("start")))), speedState === "running" && q && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "speedhud"
  }, /*#__PURE__*/React.createElement("div", {
    className: "speedtime"
  }, /*#__PURE__*/React.createElement("b", null, timeLeft), /*#__PURE__*/React.createElement("span", null, tr("sec"))), /*#__PURE__*/React.createElement("div", {
    className: "speedbar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "speedfill",
    style: {
      width: timeLeft / 60 * 100 + "%"
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "speedpts"
  }, /*#__PURE__*/React.createElement("b", null, speedScore), /*#__PURE__*/React.createElement("span", null, tr("pts")))), /*#__PURE__*/React.createElement("div", {
    className: "quizcard quizmodern",
    style: {
      "--lc": LANG_META[lang].color
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "cards-cue cards-cue-top"
  }, /*#__PURE__*/React.createElement("span", { style: { color: "var(--muted)", fontWeight: 600 } }, tr("req_form"), ": "), /*#__PURE__*/React.createElement("b", null, q.tenseLabel + " · " + q.pronoun)), /*#__PURE__*/React.createElement("div", {
    className: "qm-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flashtense"
  }, q.tenseLabel), q.isIrregular && /*#__PURE__*/React.createElement("span", {
    className: "flashtag"
  }, tr("irregular")), /*#__PURE__*/React.createElement("button", {
    className: "starbtn qm-star" + (favs.some(x => x.lang === lang && x.verb === q.verb) ? " on" : ""),
    title: "Save verb",
    onClick: () => toggleFav(lang, q.verb)
  }, favs.some(x => x.lang === lang && x.verb === q.verb) ? "★" : "☆")), /*#__PURE__*/React.createElement(QuizTip, { formation: quizHint(lang, q) || auxHint(lang, q.tenseId, q.answer), irregular: q.isIrregular, vtrans: transl }), /*#__PURE__*/React.createElement("div", {
    className: "qm-prompt"
  }, /*#__PURE__*/React.createElement("button", {
    className: "flashverb flashverb-link",
    title: tr("view_conj"),
    onClick: () => onStudy && onStudy(lang, q.verb)
  }, q.verb.replace(/^to /, ""), " ", /*#__PURE__*/React.createElement("span", {
    className: "qm-study-ic"
  }, "↗")), /*#__PURE__*/React.createElement("span", {
    className: "flashpron"
  }, q.pronoun)), /*#__PURE__*/React.createElement("div", {
    className: "qopts"
  }, q.options.map((opt, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    className: "qopt",
    onClick: () => speedAnswer(opt)
  }, opt)))), /*#__PURE__*/React.createElement("p", {
    className: "quizhint"
  }, tr("go"))), speedState === "done" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "speedstart"
  }, /*#__PURE__*/React.createElement("div", {
    className: "speedbig"
  }, "\uD83C\uDFC1"), /*#__PURE__*/React.createElement("h3", null, tr("times_up")), /*#__PURE__*/React.createElement("div", {
    className: "speedresult"
  }, /*#__PURE__*/React.createElement("b", null, speedScore), /*#__PURE__*/React.createElement("span", null, tr("in60"))), /*#__PURE__*/React.createElement("div", {
    className: "speedbest"
  }, speedScore >= speedBest && speedScore > 0 ? tr("new_best") : /*#__PURE__*/React.createElement(React.Fragment, null, tr("best"), " ", /*#__PURE__*/React.createElement("b", null, speedBest))), /*#__PURE__*/React.createElement("button", {
    className: "quizbtn check",
    onClick: startSpeed
  }, tr("play_again")), /*#__PURE__*/React.createElement("button", {
    className: "nameskip",
    onClick: () => setSpeedState("idle")
  }, tr("back"))), speedLog.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "speedreview"
  }, /*#__PURE__*/React.createElement("div", {
    className: "srev-head"
  }, tr("review"), " \xB7 ", /*#__PURE__*/React.createElement("span", {
    className: "srev-ok"
  }, "\u2713 ", speedLog.filter(x => x.ok).length), " \xB7 ", /*#__PURE__*/React.createElement("span", {
    className: "srev-no"
  }, "\u2717 ", speedLog.filter(x => !x.ok).length)), /*#__PURE__*/React.createElement("div", {
    className: "srev-list"
  }, speedLog.slice().sort((a, b) => a.ok === b.ok ? 0 : a.ok ? 1 : -1).map((x, i) => /*#__PURE__*/React.createElement("div", {
    className: "srev-row " + (x.ok ? "ok" : "no"),
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "srev-mark"
  }, x.ok ? "✓" : "✗"), /*#__PURE__*/React.createElement("span", {
    className: "srev-ctx"
  }, x.verb.replace(/^to /, ""), " \xB7 ", x.pronoun, " ", /*#__PURE__*/React.createElement("em", null, x.tenseLabel)), /*#__PURE__*/React.createElement("span", {
    className: "srev-ans"
  }, x.ok ? x.answer : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("s", null, x.picked), " ", x.answer)))))))), mode === "cards" && q && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flashcard",
    onClick: () => {
      if (flipped) setFlipped(false);else flipCard();
    }
  }, prevCards.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "flashback-btn",
    title: tr("back"),
    onClick: e => {
      e.stopPropagation();
      goBackCard();
    }
  }, "\u2039"), /*#__PURE__*/React.createElement("div", {
    className: "flashface " + (flipped ? "fback" : "ffront"),
    key: flipped ? "b" : "f",
    style: {
      "--lc": LANG_META[lang].color
    }
  }, !flipped ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "cards-cue cards-cue-top"
  }, /*#__PURE__*/React.createElement("span", { style: { color: "var(--muted)", fontWeight: 600 } }, tr("req_form"), ": "), /*#__PURE__*/React.createElement("b", null, q.tenseLabel + " · " + q.pronoun)), /*#__PURE__*/React.createElement("div", {
    className: "flashtop"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flashtense"
  }, q.tenseLabel)), /*#__PURE__*/React.createElement("div", {
    className: "flashbody"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tiprow"
  }, /*#__PURE__*/React.createElement(QuizTip, {
    formation: quizHint(lang, q) || auxHint(lang, q.tenseId, q.answer),
    irregular: q.isIrregular,
    vtrans: thisDir === "native" ? null : transl,
    strans: skill !== "beginner" && cloze ? cloze.native : null
  }), /*#__PURE__*/React.createElement("button", {
    className: "starbtn qm-star qm-star-tip" + (favs.some(x => x.lang === lang && x.verb === q.verb) ? " on" : ""),
    title: "Save verb",
    onClick: e => {
      e.stopPropagation();
      toggleFav(lang, q.verb);
    }
  }, favs.some(x => x.lang === lang && x.verb === q.verb) ? "★" : "☆")), thisDir === "native" ? transl && transl !== "…" ? /*#__PURE__*/React.createElement("span", {
    className: "flashnative"
  }, transl) : /*#__PURE__*/React.createElement("span", {
    className: "flashnative",
    style: {
      opacity: 0.3
    }
  }, "\u2026") : /*#__PURE__*/React.createElement("button", {
    className: "flashverb flashverb-link",
    title: tr("view_conj"),
    onClick: e => {
      e.stopPropagation();
      onStudy && onStudy(lang, q.verb);
    }
  }, q.verb.replace(/^to /, ""), " ", /*#__PURE__*/React.createElement("span", {
    className: "qm-study-ic"
  }, "\u2197")), /*#__PURE__*/React.createElement("span", {
    className: "flashpron"
  }, q.pronoun), cloze && !cloze.loading && /*#__PURE__*/React.createElement("div", {
    className: "flashcloze clozebox",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement(WordSentence, {
    text: cloze.gap,
    fromName: window.CONJ[lang].name,
    toName: nativeName,
    cachePrefix: `kunju-wtr-${lang}-nat`,
    big: true,
    accent: true,
    saveLang: lang,
    saveDir: "fromTarget"
  }), cloze.native && skill === "beginner" && /*#__PURE__*/React.createElement("div", {
    className: "clozenative"
  }, cloze.native))), reportBtn()) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "flashtop"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flashctx"
  }, thisDir === "native" && transl && transl !== "…" ? transl + " · " : "", q.verb.replace(/^to /, ""), " \xB7 ", q.pronoun), sound && q.answer !== "—" && /*#__PURE__*/React.createElement("button", {
    className: "flashspeak",
    onClick: e => {
      e.stopPropagation();
      speak(q.answer, q.ttsLang);
    }
  }, /*#__PURE__*/React.createElement("span", { className: "ico-spk", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='1em' height='1em' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='display:block'><path d='M11 5 6 9H2v6h4l5 4V5z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/><path d='M19 5a9 9 0 0 1 0 14'/></svg>" } }))), /*#__PURE__*/React.createElement("div", {
    className: "flashbody"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flashanswer"
  }, q.answer), cloze && !cloze.loading && /*#__PURE__*/React.createElement("div", {
    className: "flashcloze clozebox",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement(WordSentence, {
    text: cloze.full,
    fromName: window.CONJ[lang].name,
    toName: nativeName,
    cachePrefix: `kunju-wtr-${lang}-nat`,
    big: true,
    accent: true,
    saveLang: lang,
    saveDir: "fromTarget"
  }), cloze.native && /*#__PURE__*/React.createElement("div", {
    className: "clozenative"
  }, cloze.native))), reportBtn(), /*#__PURE__*/React.createElement("div", {
    className: "flashfoot"
  }, transl ? /*#__PURE__*/React.createElement("span", {
    className: "flashmean"
  }, /*#__PURE__*/React.createElement("b", null, q.verb.replace(/^to /, "")), transl === "…" ? /*#__PURE__*/React.createElement("i", null, "\u2026") : /*#__PURE__*/React.createElement("em", null, transl)) : /*#__PURE__*/React.createElement("span", {
    className: "flashmean dim"
  }, "\xB7"))))), flipped ? /*#__PURE__*/React.createElement("div", {
    className: "cardbtns"
  }, /*#__PURE__*/React.createElement("button", {
    className: "quizbtn again",
    onClick: () => nextCard(false)
  }, "\u21BB ", tr("again")), /*#__PURE__*/React.createElement("button", {
    className: "quizbtn gotit",
    onClick: () => nextCard(true)
  }, "\u2713 ", tr("got_it"))) : /*#__PURE__*/React.createElement("button", {
    className: "quizbtn next",
    onClick: () => flipCard()
  }, tr("flip"))), mode === "speak" && q && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ScoreLine, null), /*#__PURE__*/React.createElement("div", {
    className: "modepick speakpick"
  }, /*#__PURE__*/React.createElement("span", {
    className: "modepick-label"
  }, "\uD83C\uDF99 ", tr("spk_what")), /*#__PURE__*/React.createElement("div", {
    className: "modegrid speakmodes"
  }, /*#__PURE__*/React.createElement("button", {
    className: "modebtn" + (spkMode === "form" ? " on" : ""),
    onClick: () => {
      setSpkMode("form");
      setSent(null);
    }
  }, tr("spk_form")), /*#__PURE__*/React.createElement("button", {
    className: "modebtn" + (spkMode === "sentence" ? " on" : ""),
    onClick: () => {
      setSpkMode("sentence");
      genSentence();
    }
  }, tr("spk_sentence")))), spkMode === "sentence" && /*#__PURE__*/React.createElement("div", {
    className: "tfilter spkthemes scrollthemes"
  }, allThemes.map((th, i) => /*#__PURE__*/React.createElement("button", {
    key: th.id,
    className: "tfilterchip" + (topicsSel.includes(th.id) ? " on" : ""),
    style: {
      "--cc": RAINBOW[i % RAINBOW.length]
    },
    onClick: () => {
      toggleTopic(th.id);
      genSentence(undefined, 0, th.id);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "dotmini"
  }), themeLabel(th.id)))), spkMode === "sentence" && !sentMistMode && getSentMist(spkTarget).length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "mistbtn",
    style: {
      "--lc": LANG_META[lang].color
    },
    onClick: () => {
      const list = getSentMist(spkTarget);
      genTokenRef.current++;
      setSentMistMode(true);
      setRevealed(false);
      setHeard("");
      setMsg("");
      setState("idle");
      setSent(list.length ? pick(list) : null);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mistbtn-ic"
  }, "\u26A0"), /*#__PURE__*/React.createElement("span", {
    className: "mistbtn-tx"
  }, tr("sent_mist_practice")), /*#__PURE__*/React.createElement("span", {
    className: "mistbtn-n"
  }, getSentMist(spkTarget).length)), spkMode === "sentence" && sentMistMode && /*#__PURE__*/React.createElement("button", {
    className: "mistbtn on",
    style: {
      "--lc": LANG_META[lang].color
    },
    onClick: () => {
      setSentMistMode(false);
      genSentence(undefined, 0, undefined, true);
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mistbtn-ic"
  }, "\u2190"), /*#__PURE__*/React.createElement("span", {
    className: "mistbtn-tx"
  }, tr("mist_exit")), getSentMist(spkTarget).length > 0 && /*#__PURE__*/React.createElement("span", {
    className: "mistbtn-n"
  }, getSentMist(spkTarget).length)), spkMode === "sentence" && sentMistMode && !sent && /*#__PURE__*/React.createElement("div", {
    className: "mistdone"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mistdone-ic"
  }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("h3", null, tr("mist_clear_title")), /*#__PURE__*/React.createElement("button", {
    className: "quizbtn check",
    onClick: () => {
      setSentMistMode(false);
      genSentence(undefined, 0, undefined, true);
    }
  }, tr("mist_exit"))), !(spkMode === "sentence" && sentMistMode && !sent) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "quizcard " + state,
    style: {
      "--lc": LANG_META[lang].color
    }
  }, spkMode === "form" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "cards-cue cards-cue-top"
  }, /*#__PURE__*/React.createElement("span", { style: { color: "var(--muted)", fontWeight: 600 } }, tr("req_form"), ": "), /*#__PURE__*/React.createElement("b", null, q.tenseLabel + " · " + q.pronoun)), /*#__PURE__*/React.createElement("div", {
    className: "qm-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flashtense"
  }, q.tenseLabel, skill !== "advanced" && (quizHint(lang, q) || auxHint(lang, q.tenseId, q.answer)) ? /*#__PURE__*/React.createElement("span", {
    className: "flashhint-inline"
  }, quizHint(lang, q) || auxHint(lang, q.tenseId, q.answer)) : null), q.isIrregular && /*#__PURE__*/React.createElement("span", {
    className: "flashtag"
  }, tr("irregular")), /*#__PURE__*/React.createElement("button", {
    className: "starbtn qm-star" + (favs.some(x => x.lang === lang && x.verb === q.verb) ? " on" : ""),
    title: "Save verb",
    onClick: () => toggleFav(lang, q.verb)
  }, favs.some(x => x.lang === lang && x.verb === q.verb) ? "★" : "☆")), /*#__PURE__*/React.createElement(QuizTip, { formation: quizHint(lang, q) || auxHint(lang, q.tenseId, q.answer), irregular: q.isIrregular, vtrans: transl }), /*#__PURE__*/React.createElement(Prompt, null), cloze && (cloze.loading ? /*#__PURE__*/React.createElement("div", {
    className: "spkreveal"
  }, /*#__PURE__*/React.createElement("span", {
    className: "exloading"
  }, "\u2026")) : /*#__PURE__*/React.createElement("div", {
    className: "spkreveal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "spkreveal-row"
  }, /*#__PURE__*/React.createElement(WordSentence, {
    text: state === "idle" ? cloze.gap : cloze.full,
    fromName: window.CONJ[lang].name,
    toName: recall("kunju-native", "German"),
    cachePrefix: `kunju-wtr-${lang}-nat`,
    big: true,
    accent: true,
    saveLang: lang,
    saveDir: "fromTarget"
  }), state !== "idle" && /*#__PURE__*/React.createElement("button", {
    className: "flashspeak",
    onClick: () => speak(cloze.full, q.ttsLang)
  }, /*#__PURE__*/React.createElement("span", { className: "ico-spk", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='1em' height='1em' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='display:block'><path d='M11 5 6 9H2v6h4l5 4V5z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/><path d='M19 5a9 9 0 0 1 0 14'/></svg>" } }))), cloze.native && skill === "beginner" && /*#__PURE__*/React.createElement("div", {
    className: "clozenative"
  }, cloze.native)))) : /*#__PURE__*/React.createElement("div", {
    className: "spksent"
  }, (!sent || sent.loading) && /*#__PURE__*/React.createElement("span", {
    className: "exloading"
  }, "\u2026"), sent && sent.error && /*#__PURE__*/React.createElement("span", {
    className: "exloading"
  }, "\u2014"), sent && sent.n && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(WordSentence, {
    text: sent.n,
    fromName: recall("kunju-native", "German"),
    toName: window.CONJ[spkTarget].name,
    cachePrefix: `kunju-wtr-nat-${spkTarget}`,
    big: true,
    saveLang: spkTarget,
    saveDir: "fromNative"
  }), /*#__PURE__*/React.createElement("div", {
    className: "spkhintarrow"
  }, "\u2193 ", tr("spk_say", {
    lang: window.CONJ[spkTarget].name
  })))), (() => {
    const showAns = spkMode === "sentence" && sent && sent.t && (revealed || state !== "idle");
    return /*#__PURE__*/React.createElement(React.Fragment, null, !showAns && /*#__PURE__*/React.createElement("div", {
      className: "micwrap"
    }, /*#__PURE__*/React.createElement("button", {
      className: "micbtn" + (listening ? " rec" : ""),
      disabled: state !== "idle" || spkMode === "sentence" && (!sent || !sent.t),
      onClick: listen
    }, listening ? /*#__PURE__*/React.createElement("span", {
      className: "micstop"
    }) : /*#__PURE__*/React.createElement("span", {
      className: "micicon",
      dangerouslySetInnerHTML: { __html: MIC_SVG }
    })), /*#__PURE__*/React.createElement("div", {
      className: "michint"
    }, listening ? tr("mic_stop") : tr("mic_start"))), spkMode === "sentence" && sent && sent.t && state === "idle" && !revealed && /*#__PURE__*/React.createElement("button", {
      className: "relearnbtn",
      onClick: () => {
        setRevealed(true);
        if (sent) {
          addSentMist(spkTarget, sent);
          setSmver(v => v + 1);
        }
      }
    }, "\u21BB ", tr("spk_relearn")), spkMode === "form" && state === "idle" && /*#__PURE__*/React.createElement("button", {
      className: "relearnbtn",
      onClick: () => {
        setState("wrong");
        setMsg(cheerLine());
        addMistake(lang, q);
        bumpMist();
      }
    }, "\u21BB ", tr("spk_relearn")), heard === "__nomic__" && /*#__PURE__*/React.createElement("div", {
      className: "feedback no"
    }, tr("speak_nomic")), heard === "__denied__" && /*#__PURE__*/React.createElement("div", {
      className: "feedback no",
      style: { display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }
    }, /*#__PURE__*/React.createElement("span", null, tr("speak_denied")), /*#__PURE__*/React.createElement("span", {
      style: { fontSize: "13px", lineHeight: "1.45", fontWeight: 600, maxWidth: "300px" }
    }, ({ de: "Bist du im privaten / Inkognito-Modus? Dort sperrt der Browser das Mikrofon und vergisst die Erlaubnis sofort — öffne conjuexpert.app in einem normalen Tab.", en: "Are you in private / incognito mode? The browser blocks the mic there and forgets the permission — open conjuexpert.app in a normal tab.", es: "¿Estás en modo privado / incógnito? Ahí el navegador bloquea el micrófono y olvida el permiso — abre conjuexpert.app en una pestaña normal.", fr: "Tu es en navigation privée / incognito ? Le navigateur y bloque le micro et oublie l’autorisation — ouvre conjuexpert.app dans un onglet normal.", nl: "Zit je in privé / incognito? Daar blokkeert de browser de microfoon en vergeet de toestemming — open conjuexpert.app in een gewoon tabblad." })[UILANG] || "Are you in private / incognito mode? Open conjuexpert.app in a normal tab."), /*#__PURE__*/React.createElement("button", {
      className: "quizbtn check",
      type: "button",
      onClick: requestMic
    }, ({ de: "🎤 Mikrofon aktivieren", en: "🎤 Enable microphone", es: "🎤 Activar micrófono", fr: "🎤 Activer le micro", nl: "🎤 Microfoon inschakelen" })[UILANG] || "🎤 Enable microphone"), /*#__PURE__*/React.createElement("span", {
      style: { fontSize: "12px", lineHeight: "1.45", opacity: 0.85, fontWeight: 500, maxWidth: "300px" }
    }, micHintText())), heard === "__nospeech__" && /*#__PURE__*/React.createElement("div", {
      className: "feedback no"
    }, tr("speak_nospeech")), heard === "__transcribing__" && /*#__PURE__*/React.createElement("div", {
      className: "heardline"
    }, ({ de: "\u2026 erkenne deine Aufnahme \u2026", en: "\u2026 transcribing \u2026", es: "\u2026 transcribiendo \u2026", fr: "\u2026 transcription \u2026", nl: "\u2026 herkennen \u2026" })[UILANG] || "\u2026 transcribing \u2026"), heard === "__transcribe_err__" && /*#__PURE__*/React.createElement("div", {
      className: "feedback no"
    }, ({ de: "Spracherkennung gerade nicht erreichbar \u2014 bitte nochmal antippen.", en: "Speech service unavailable \u2014 tap to try again.", es: "Servicio de voz no disponible \u2014 toca para reintentar.", fr: "Service vocal indisponible \u2014 retouche pour r\u00E9essayer.", nl: "Spraakdienst niet bereikbaar \u2014 tik opnieuw." })[UILANG] || "Speech service unavailable \u2014 tap to try again."), heard && heard.indexOf("__") !== 0 && /*#__PURE__*/React.createElement("div", {
      className: "heardline"
    }, tr("speak_heard"), " \u201C", heard, "\u201D"), state === "correct" && /*#__PURE__*/React.createElement("div", {
      className: "feedback ok"
    }, "\u2713 ", msg || tr("correct_excl")), state === "wrong" && spkMode === "form" && /*#__PURE__*/React.createElement("div", {
      className: "feedback no"
    }, msg ? msg + " · " : "✗ ", tr("answer"), " ", /*#__PURE__*/React.createElement("b", null, q.answer)), state === "wrong" && spkMode === "sentence" && /*#__PURE__*/React.createElement("div", {
      className: "feedback no"
    }, msg || "✗"), showAns && /*#__PURE__*/React.createElement("div", {
      className: "spkreveal"
    }, /*#__PURE__*/React.createElement("div", {
      className: "spkreveal-label"
    }, tr("spk_correct_is"), " ", /*#__PURE__*/React.createElement("span", {
      className: "spkreveal-tap"
    }, "\xB7 ", tr("tap_save"))), /*#__PURE__*/React.createElement("div", {
      className: "spkreveal-row"
    }, /*#__PURE__*/React.createElement(WordSentence, {
      text: sent.t,
      fromName: window.CONJ[spkTarget].name,
      toName: recall("kunju-native", "German"),
      cachePrefix: `kunju-wtr-${spkTarget}-nat`,
      big: true,
      accent: true,
      saveLang: spkTarget,
      saveDir: "fromTarget"
    }), /*#__PURE__*/React.createElement("button", {
      className: "flashspeak",
      onClick: () => speak(sent.t, window.CONJ[spkTarget].ttsLang)
    }, /*#__PURE__*/React.createElement("span", { className: "ico-spk", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='1em' height='1em' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='display:block'><path d='M11 5 6 9H2v6h4l5 4V5z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/><path d='M19 5a9 9 0 0 1 0 14'/></svg>" } })))), showAns ? /*#__PURE__*/React.createElement("div", {
      className: "cardbtns"
    }, /*#__PURE__*/React.createElement("button", {
      className: "quizbtn again",
      onClick: () => {
        setRevealed(false);
        setHeard("");
        setMsg("");
        setState("idle");
      }
    }, "\u21BB ", tr("practice_again")), /*#__PURE__*/React.createElement("button", {
      className: "quizbtn next",
      onClick: next
    }, tr("spk_next_sentence"))) : state === "idle" ? spkMode === "form" && null : /*#__PURE__*/React.createElement("button", {
      className: "quizbtn next",
      onClick: next
    }, tr("next")));
  })())))), MistakeBar());
}
const NATIVE_LANGS = [{
  label: "Deutsch",
  name: "German"
}, {
  label: "English",
  name: "English"
}, {
  label: "Español",
  name: "Spanish"
}, {
  label: "Français",
  name: "French"
}, {
  label: "Nederlands",
  name: "Dutch"
}, {
  label: "Italiano",
  name: "Italian"
}, {
  label: "Português",
  name: "Portuguese"
}, {
  label: "Polski",
  name: "Polish"
}, {
  label: "Türkçe",
  name: "Turkish"
}, {
  label: "Русский",
  name: "Russian"
}, {
  label: "العربية",
  name: "Arabic"
}, {
  label: "中文",
  name: "Chinese"
}];
function nativeLabel(name) {
  const f = NATIVE_LANGS.find(l => l.name === name);
  return f ? f.label : name;
}
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const arr = x => Array.isArray(x) ? x : [];
const stripMark = s => String(s || "").replace(/\*\*/g, "");
function fmtVerbMark(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<b class="exverb">$1</b>');
}
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
  const signals = (G.signals || []).map((s, i) => ({
    w: s.w,
    t: (n.signals || [])[i] || ""
  }));
  const examples = (G.examples || []).map((e, i) => ({
    s: e.s,
    n: (n.examples || [])[i] || ""
  }));
  const compare = G.compare && G.compare.with ? {
    with: G.compare.with,
    rows: n.compare_rows || [],
    note: n.compare_note || ""
  } : {
    with: "",
    rows: []
  };
  return {
    name: G.name,
    explain_t: G.explain_t,
    explain_n: n.explain_n || "",
    mnemonic: n.mnemonic || "",
    signals,
    examples,
    use: n.use || [],
    avoid: n.avoid || [],
    compare
  };
}
function parseLLMJSON(text) {
  let s = String(text || "").trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const a = s.indexOf("{"),
    b = s.lastIndexOf("}");
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
  const a = s.indexOf("{"),
    b = s.lastIndexOf("}");
  if (a >= 0 && b > a) s = s.slice(a, b + 1);
  try {
    return JSON.parse(s);
  } catch (e) {/* fall through */}
  const out = {};
  const keyRe = /"(\w+)"\s*:\s*"/g;
  let m;
  while (m = keyRe.exec(s)) {
    const key = m[1];
    let i = keyRe.lastIndex,
      val = "";
    for (; i < s.length; i++) {
      const c = s[i];
      if (c === "\\") {
        const n = s[i + 1];
        val += n === "n" || n === "t" || n === "r" ? " " : n || "";
        i++;
        continue;
      }
      if (c === '"') {
        const rest = s.slice(i + 1).replace(/^\s+/, "");
        if (rest === "" || rest[0] === "," || rest[0] === "}") break;
        val += '"';
        continue;
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
  return /*#__PURE__*/React.createElement("div", {
    className: "learn-list"
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
    className: "lcard skel",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "sk-line w40"
  }), /*#__PURE__*/React.createElement("div", {
    className: "sk-line w90"
  }), /*#__PURE__*/React.createElement("div", {
    className: "sk-line w70"
  }))));
}
const PERFECT_FAMILY = ["perfect", "pluperfect", "continuousPerfect"];
const AUX_NAME = {
  es: "haber",
  de: "haben / sein",
  en: "have",
  nl: "hebben / zijn",
  fr: "avoir / être"
};
function AuxiliaryCard({
  lang,
  engine,
  selTense
}) {
  const data = useMemo(() => {
    if (PERFECT_FAMILY.indexOf(selTense) < 0) return null;
    const sample = REG_SAMPLE[lang] || engine.samples && engine.samples[0];
    const r = engine.conjugate(sample);
    if (!r || r.error) return null;
    const rows = [];
    PERFECT_FAMILY.forEach(id => {
      const t = r.tenses.find(x => x.id === id);
      if (!t || !t.forms) return;
      // auxiliary = each form minus its last word (the participle/gerund), which is shared
      const parts = t.forms.map(f => f && f !== "—" ? f.trim().split(/\s+/) : null);
      if (parts.some(p => !p || p.length < 2)) return;
      const participle = parts[0][parts[0].length - 1];
      const aux = parts.map(p => p.slice(0, p.length - 1).join(" "));
      rows.push({
        id,
        label: t.label,
        aux,
        participle,
        pronouns: r.pronouns
      });
    });
    return rows.length ? {
      rows,
      inf: r.infinitive,
      auxName: AUX_NAME[lang] || ""
    } : null;
  }, [lang, selTense]);
  if (!data) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "lcard auxcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lcard-tag"
  }, tr("aux_title")), /*#__PURE__*/React.createElement("p", {
    className: "auxnote",
    dangerouslySetInnerHTML: {
      __html: tr("aux_logic", {
        aux: "<b>" + data.auxName + "</b>",
        part: "<b>" + data.rows[0].participle + "</b>"
      })
    }
  }), data.rows.map(row => /*#__PURE__*/React.createElement("div", {
    className: "auxblock",
    key: row.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "auxblock-head"
  }, row.label), /*#__PURE__*/React.createElement("table", {
    className: "auxtable"
  }, /*#__PURE__*/React.createElement("tbody", null, row.pronouns.map((p, i) => row.aux[i] && /*#__PURE__*/React.createElement("tr", {
    key: i
  }, /*#__PURE__*/React.createElement("td", {
    className: "auxt-pron"
  }, p), /*#__PURE__*/React.createElement("td", {
    className: "auxt-aux"
  }, /*#__PURE__*/React.createElement("b", null, row.aux[i])), /*#__PURE__*/React.createElement("td", {
    className: "auxt-part"
  }, row.participle))))), /*#__PURE__*/React.createElement(AuxExample, {
    lang: lang,
    tenseId: row.id,
    tenseLabel: row.label,
    sample: data.inf,
    sampleForms: row.aux.map((a, i) => a + " " + row.participle),
    pronouns: data.rows[0].pronouns
  }))), /*#__PURE__*/React.createElement("div", {
    className: "auxpart"
  }, tr("aux_participle"), ": ", /*#__PURE__*/React.createElement("b", null, data.rows[0].participle)));
}
function AuxExample({
  lang,
  tenseId,
  tenseLabel,
  sample,
  sampleForms,
  pronouns
}) {
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
    if (!fresh) {
      const c = recall(key, null);
      if (c != null) {
        setEx(c);
        return;
      }
    }
    const variety = fresh ? ` Give a DIFFERENT example than before (variety #${Math.floor(Math.random() * 1000)}).` : "";
    const lvlNote = skill === "advanced" ? " Use C1-level vocabulary and a complex structure." : skill === "intermediate" ? " Use B1-level everyday vocabulary." : " Use very simple A1–A2 vocabulary (max 7 words).";
    setBusy(true);
    window.aiComplete(`Write ONE short, natural ${targetName} sentence that uses EXACTLY the verb form "${form}" (the ${tenseLabel} of "${sample}", ${pron}).${lvlNote} Keep that exact form in the sentence.${variety} Then give its natural ${nativeName} translation, rendering the verb "${sample}" with its most standard, DIRECT ${nativeName} equivalent (the dictionary meaning), NOT a loose synonym, so the practised verb is recognizable in the translation. Do NOT use double-quote characters. Reply with ONLY minified JSON and nothing else: {"t":"<${targetName} sentence>","n":"<${nativeName} translation>"}`).then(txt => {
      let j = null;
      try {
        j = looseParse(txt);
      } catch (e) {}
      setBusy(false);
      if (j && j.t && j.n) {
        persist(key, j);
        setEx(j);
      }
    }).catch(() => setBusy(false));
  }
  useEffect(() => {
    setEx(recall(key, null));
    if (recall(key, null) == null) load(false); /* eslint-disable-next-line */
  }, [lang, tenseId, sample, nativeName]);
  if (!ex) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "auxex"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auxex-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "auxex-t"
  }, busy ? "…" : ex.t), /*#__PURE__*/React.createElement("button", {
    className: "speakbtn exrefresh",
    title: "New example",
    onClick: () => load(true)
  }, "\u21BB")), /*#__PURE__*/React.createElement("div", {
    className: "auxex-n"
  }, ex.n));
}
function LearnContent({
  data,
  loading,
  engine,
  sound,
  lang,
  selTense,
  selLabel,
  onStudy
}) {
  const d = data || {};
  const hint = tenseHint(lang, selTense);
  const sample = REG_SAMPLE[lang];
  const sampleForms = useMemo(() => {
    if (!sample) return null;
    const r = engine.conjugate(sample);
    if (!r || r.error) return null;
    const t = r.tenses.find(x => x.id === selTense);
    return t ? {
      pronouns: r.pronouns,
      forms: t.forms,
      inf: r.infinitive
    } : null;
  }, [lang, selTense]);
  return /*#__PURE__*/React.createElement("div", {
    className: "learn-list",
    style: {
      "--lc": LANG_META[lang].color
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lcard formcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lcard-tag"
  }, tr("how_formed")), hint && /*#__PURE__*/React.createElement("div", {
    className: "formhint"
  }, /*#__PURE__*/React.createElement("span", {
    className: "formhint-lbl"
  }, tr("regular")), /*#__PURE__*/React.createElement("span", {
    className: "formhint-val"
  }, hint)), sampleForms && /*#__PURE__*/React.createElement("div", {
    className: "formtable"
  }, /*#__PURE__*/React.createElement("div", {
    className: "formtable-cap"
  }, tr("example"), ": ", /*#__PURE__*/React.createElement("b", null, sampleForms.inf.replace(/^to /, ""))), /*#__PURE__*/React.createElement("div", {
    className: "formwrap"
  }, sampleForms.pronouns.map((p, i) => sampleForms.forms[i] && sampleForms.forms[i] !== "—" && /*#__PURE__*/React.createElement("span", {
    className: "formitem",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "formval",
    dangerouslySetInnerHTML: {
      __html: hl3(sample, sampleForms.forms[i])
    }
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "lcard irrcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lcard-tag"
  }, tr("key_irregulars")), /*#__PURE__*/React.createElement("div", {
    className: "irrchips"
  }, (IRR_TOP[lang] || []).map(v => /*#__PURE__*/React.createElement("button", {
    className: "irrchip",
    key: v,
    onClick: () => onStudy && onStudy(lang, v)
  }, v, " ", /*#__PURE__*/React.createElement("span", {
    className: "irrchip-go"
  }, "\u2197")))), /*#__PURE__*/React.createElement("p", {
    className: "irrnote"
  }, tr("irr_note"))), loading && !data && /*#__PURE__*/React.createElement(LearnSkeleton, null), (d.explain_t || d.explain_n) && /*#__PURE__*/React.createElement("div", {
    className: "lcard explain"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lcard-tag"
  }, tr("explanation")), d.name && /*#__PURE__*/React.createElement("div", {
    className: "lc-name"
  }, d.name), /*#__PURE__*/React.createElement("p", {
    className: "lc-target"
  }, d.explain_t), /*#__PURE__*/React.createElement("p", {
    className: "lc-native"
  }, d.explain_n)), d.mnemonic && /*#__PURE__*/React.createElement("div", {
    className: "lcard mnemo"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lcard-tag"
  }, tr("mnemonic")), /*#__PURE__*/React.createElement("p", {
    className: "lc-native big"
  }, d.mnemonic)), arr(d.signals).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "lcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lcard-tag"
  }, tr("signal_words")), /*#__PURE__*/React.createElement("div", {
    className: "sigwords"
  }, d.signals.map((s, i) => /*#__PURE__*/React.createElement("span", {
    className: "sigchip",
    key: i
  }, /*#__PURE__*/React.createElement("b", null, s.w), /*#__PURE__*/React.createElement("i", null, s.t))))), arr(d.examples).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "lcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lcard-tag"
  }, tr("examples")), /*#__PURE__*/React.createElement("div", {
    className: "exlist"
  }, d.examples.map((ex, i) => /*#__PURE__*/React.createElement("div", {
    className: "exrow",
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    className: "exmain"
  }, /*#__PURE__*/React.createElement("span", {
    className: "exline",
    dangerouslySetInnerHTML: {
      __html: fmtVerbMark(ex.s)
    }
  }), sound && /*#__PURE__*/React.createElement("button", {
    className: "speakbtn",
    title: "Listen",
    onClick: () => speak(stripMark(ex.s), engine.ttsLang)
  }, /*#__PURE__*/React.createElement("span", { className: "ico-spk", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='1em' height='1em' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='display:block'><path d='M11 5 6 9H2v6h4l5 4V5z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/><path d='M19 5a9 9 0 0 1 0 14'/></svg>" } }))), /*#__PURE__*/React.createElement("div", {
    className: "exnative"
  }, ex.n))))), (arr(d.use).length > 0 || arr(d.avoid).length > 0) && /*#__PURE__*/React.createElement("div", {
    className: "lcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lcard-tag"
  }, tr("when_use")), /*#__PURE__*/React.createElement("div", {
    className: "usegrid"
  }, arr(d.use).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "usecol"
  }, d.use.map((u, i) => /*#__PURE__*/React.createElement("div", {
    className: "useli",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "usei ok"
  }, "\u2713"), u))), arr(d.avoid).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "usecol"
  }, d.avoid.map((u, i) => /*#__PURE__*/React.createElement("div", {
    className: "useli",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "usei no"
  }, "\u2715"), u))))), d.compare && d.compare.with && arr(d.compare.rows).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "lcard"
  }, /*#__PURE__*/React.createElement("div", {
    className: "lcard-tag"
  }, tr("compare")), /*#__PURE__*/React.createElement("div", {
    className: "cmp"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cmp-row head"
  }, /*#__PURE__*/React.createElement("span", null, d.name || "—"), /*#__PURE__*/React.createElement("span", null, d.compare.with)), d.compare.rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    className: "cmp-row",
    key: i
  }, /*#__PURE__*/React.createElement("span", null, r[0]), /*#__PURE__*/React.createElement("span", null, r[1])))), d.compare.note && /*#__PURE__*/React.createElement("p", {
    className: "lc-native cmp-note"
  }, d.compare.note)), /*#__PURE__*/React.createElement(AuxiliaryCard, {
    lang: lang,
    engine: engine,
    selTense: selTense
  }));
}
function LearnView({
  lang,
  engine,
  sound,
  native,
  setNative,
  onStudy,
  jumpTense,
  onJumpDone
}) {
  const tenseOpts = useMemo(() => {
    const r = engine.conjugate(engine.samples[0]);
    return r && r.tenses ? r.tenses.map(t => ({
      id: t.id,
      label: t.label
    })) : [];
  }, [lang]);
  const [selTense, setSelTense] = useState(() => jumpTense && tenseOpts.some(t => t.id === jumpTense) ? jumpTense : tenseOpts[0] ? tenseOpts[0].id : null);
  // Jump straight to a specific tense when opened from the Conjugate card.
  useEffect(() => {
    if (jumpTense && tenseOpts.some(t => t.id === jumpTense)) {
      setSelTense(jumpTense);
    }
    if (jumpTense && onJumpDone) onJumpDone(); /* eslint-disable-next-line */
  }, [jumpTense]);
  const [level, setLevel] = useState(() => recall("kunju-level", "A2"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const langMounted = useRef(false);
  useEffect(() => {
    if (!langMounted.current) {
      langMounted.current = true;
      return;
    }
    if (tenseOpts.length) setSelTense(tenseOpts[0].id);
  }, [lang]);
  const curLabel = (tenseOpts.find(t => t.id === selTense) || {}).label;
  useEffect(() => {
    if (!selTense || !curLabel) return;
    const key = `kunju-gram-v2-${lang}-${selTense}-${level}-${native}`;
    const cached = recall(key, null);
    if (cached) {
      setData(cached);
      setError(null);
      setLoading(false);
      return;
    }
    // Pre-written lesson for the common tenses → shows instantly, no AI wait,
    // works offline. Rarer tenses still fall through to the AI explainer.
    const stat = staticGrammar(lang, selTense, native);
    if (stat) {
      setData(stat);
      setError(null);
      setLoading(false);
      return;
    }
    if (!window.__hasAI()) {
      setData(null);
      setError("offline");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    window.aiComplete(buildGrammarPrompt(engine.name, curLabel, level, native)).then(txt => {
      if (cancelled) return;
      try {
        const j = parseLLMJSON(txt);
        persist(key, j);
        setData(j);
      } catch (e) {
        setError("parse");
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setError("net");
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lang, selTense, level, native, curLabel]);
  function setLvl(l) {
    setLevel(l);
    persist("kunju-level", l);
  }
  const tips = window.GRAMMAR && window.GRAMMAR[lang] || [];
  return /*#__PURE__*/React.createElement("div", {
    className: "view"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grammar-intro"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, tr("tenses", {
    lang: engine.name
  })), /*#__PURE__*/React.createElement("p", null, tr("bilingual", {
    a: engine.name,
    b: nativeLabel(native)
  })))), /*#__PURE__*/React.createElement("div", {
    className: "learnselrow"
  }, /*#__PURE__*/React.createElement(TenseDropdown, {
    lang: lang,
    tenses: tenseOpts,
    single: true,
    isOn: id => id === selTense,
    onToggle: id => setSelTense(id)
  })), /*#__PURE__*/React.createElement(LearnContent, {
    data: data,
    loading: loading,
    engine: engine,
    sound: sound,
    lang: lang,
    selTense: selTense,
    selLabel: curLabel,
    onStudy: onStudy
  }), error && !loading && /*#__PURE__*/React.createElement("div", {
    className: "learn-fallback"
  }, /*#__PURE__*/React.createElement("div", {
    className: "errorbox"
  }, error === "offline" ? tr("fb_offline") : tr("fb_net")), /*#__PURE__*/React.createElement("div", {
    className: "grammar-list"
  }, tips.map((tp, i) => /*#__PURE__*/React.createElement("div", {
    className: "gcard",
    key: i,
    style: {
      "--gc": RAINBOW[i % RAINBOW.length]
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "gcard-bar"
  }), /*#__PURE__*/React.createElement("h4", null, tp.title), /*#__PURE__*/React.createElement("p", {
    dangerouslySetInnerHTML: {
      __html: tp.body
    }
  }))))), /*#__PURE__*/React.createElement("a", {
    href: "/blog/",
    className: "learn-blog-btn",
    target: "_blank",
    rel: "noopener"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gg"
  }), /*#__PURE__*/React.createElement("span", null, {
    de: "Weiter im Blog stöbern",
    en: "Explore the Blog",
    es: "Explorar el Blog",
    nl: "Verder op de Blog",
    fr: "Explorer le Blog"
  }[UILANG] || "Weiter im Blog stöbern", " \u2192")));
}

/* ---------- Personal vocabulary ("Mein Wortschatz") ---------- */
function vocabKey() {
  return "kunju-vocab";
}
function getVocab() {
  return recall(vocabKey(), []);
}
function saveVocab(list) {
  persist(vocabKey(), list);
  schedulePushVocab();
}
/* ---- Wortschatz-Sync ans Konto (analog favorites) ----------------------------
   Sicher & additiv: beim Login Cloud→lokal vereinen (nie löschen), bei Änderung
   Upsert, beim Entfernen gezielt die eine Zeile löschen. Kein „alles ersetzen",
   damit ein frisch geladener/leerer Browser die Cloud nicht leerräumt. */
let __vocabUser = null;    // Konto-ID, sobald eingeloggt
let __vocabReady = false;  // true nach dem ersten Cloud→lokal-Merge (erst dann pushen)
let __vocabPushT = null;
function vocabRows(list, uid) {
  return (list || []).filter(x => x && x.lang && x.term).map(x => ({
    user_id: uid, lang: x.lang, term: String(x.term),
    trans: x.trans || null, cat: x.cat || null, kind: x.kind || null,
    created: typeof x.created === "number" ? x.created : null, nat: x.nat || null
  }));
}
function pushVocabCloud() {
  if (!__vocabUser || !__vocabReady || !window.__supa) return;
  const rows = vocabRows(getVocab(), __vocabUser);
  if (!rows.length) return;
  try { window.__supa.from("vocab").upsert(rows, { onConflict: "user_id,lang,term" }).then(function () {}, function () {}); } catch (e) {}
}
function schedulePushVocab() {
  if (!__vocabUser || !__vocabReady) return;
  if (__vocabPushT) clearTimeout(__vocabPushT);
  __vocabPushT = setTimeout(pushVocabCloud, 1200);
}
function deleteVocabCloud(lang, term) {
  if (!__vocabUser || !window.__supa || !lang || !term) return;
  try { window.__supa.from("vocab").delete().match({ user_id: __vocabUser, lang: lang, term: String(term) }).then(function () {}, function () {}); } catch (e) {}
}
function resetVocabSync() { __vocabUser = null; __vocabReady = false; }
async function mergeVocabFromCloud(uid) {
  if (!uid || !window.__supa) { __vocabReady = true; return; }
  __vocabUser = uid;
  try {
    const res = await window.__supa.from("vocab").select("lang,term,trans,cat,kind,created,nat").eq("user_id", uid);
    const data = res && res.data;
    if (data && data.length) {
      const local = getVocab();
      const seen = new Set(local.map(function (x) { return x.lang + "|" + norm(x.term); }));
      let added = false;
      data.forEach(function (r) {
        const k = r.lang + "|" + norm(r.term);
        if (seen.has(k)) return;
        seen.add(k); added = true;
        local.unshift({
          id: "c-" + r.lang + "-" + norm(r.term) + "-" + (r.created || 0),
          lang: r.lang, term: r.term, trans: r.trans || "",
          cat: r.cat || generalCat(),
          kind: r.kind || (String(r.term).indexOf(" ") >= 0 ? "phrase" : "word"),
          created: r.created || Date.now(), nat: r.nat || recall("kunju-native", "German")
        });
      });
      if (added) { persist(vocabKey(), local); window.dispatchEvent(new Event("kunju-vocab-synced")); }
    }
  } catch (e) {}
  __vocabReady = true;
  pushVocabCloud(); // lokal-only Wörter in die Cloud nachziehen
}
/* Words the user dismissed ("weggeklickt") count as KNOWN — keep them out of
   future AI suggestions so they never reappear. Stored per learning language. */
function vocabKnownKey() {
  return "kunju-vocab-known";
}
function getVocabKnown() {
  return recall(vocabKnownKey(), []);
}
function knownTerms(lang) {
  return getVocabKnown().filter(x => x.lang === lang).map(x => x.term).filter(Boolean);
}
function addVocabKnown(lang, term) {
  const t = (term || "").trim();
  if (!t) return;
  const cur = getVocabKnown();
  const have = new Set(cur.map(x => x.lang + "|" + norm(x.term)));
  if (have.has(lang + "|" + norm(t))) return;
  cur.push({
    lang,
    term: t
  });
  persist(vocabKnownKey(), cur);
}
function isVocabKnown(lang, term) {
  const t = norm(term || "");
  return !!t && getVocabKnown().some(x => x.lang === lang && norm(x.term) === t);
}
const VOCAB_TEMPLATES = {
  de: ["Einkaufen", "Arztbesuch", "Behörde", "Arbeit", "Reisen", "Restaurant", "Familie", "Freizeit", "Adjektive"],
  en: ["Shopping", "Doctor", "Authorities", "Work", "Travel", "Restaurant", "Family", "Free time", "Adjectives"],
  es: ["Compras", "Médico", "Trámites", "Trabajo", "Viajes", "Restaurante", "Familia", "Ocio", "Adjetivos"],
  nl: ["Winkelen", "Dokter", "Overheid", "Werk", "Reizen", "Restaurant", "Familie", "Vrije tijd", "Bijvoeglijke naamwoorden"],
  fr: ["Achats", "Médecin", "Démarches", "Travail", "Voyages", "Restaurant", "Famille", "Loisirs", "Adjectifs"]
};
function templateCats() {
  return VOCAB_TEMPLATES[UILANG] || VOCAB_TEMPLATES.en;
}
const VOCAB_TOPICS = ["shopping and groceries", "seeing a doctor, pharmacy and health", "government offices and bureaucracy", "work and the office", "travel and transport", "restaurants and ordering food", "family and home life", "free time, hobbies and sport", "common everyday adjectives"];
/* "Adjektive"-style topic detection (across the 5 UI languages + variants), so
   French/Spanish adjectives are generated with BOTH gender forms (beau / belle). */
const ADJ_NAMES = new Set(["adjektive", "adjektiv", "adjectives", "adjective", "adjetivos", "adjetivo", "adjectifs", "adjectif", "bijvoeglijke naamwoorden", "bijvoeglijk naamwoord", "adjectieven"]);
function isAdjTopic(name) {
  return ADJ_NAMES.has((name || "").trim().toLowerCase());
}
function adjFormsNote(langCode, targetNameStr, isAdj) {
  if (!isAdj || langCode !== "fr" && langCode !== "es") return "";
  const ex = langCode === "fr" ? '"beau / belle", "grand / grande", "heureux / heureuse"' : '"bueno / buena", "alto / alta", "trabajador / trabajadora"';
  return ` These are ${targetNameStr} ADJECTIVES: for each term give BOTH the masculine and feminine form, separated by " / " (e.g. ${ex}); if the two forms are identical, write the word once.`;
}
/* 50 common adjectives, one concept per row with the form in each language
   (es/fr carry both gender forms where they differ). The vocab seeder reads
   term = row[learningLang], translation = row[motherTongueCode]. Static, so
   the "Adjektive" topic fills instantly & offline; more come via AI / input. */
const ADJ_STATIC = [{
  de: "gut",
  en: "good",
  es: "bueno / buena",
  fr: "bon / bonne",
  nl: "goed"
}, {
  de: "schlecht",
  en: "bad",
  es: "malo / mala",
  fr: "mauvais / mauvaise",
  nl: "slecht"
}, {
  de: "groß",
  en: "big",
  es: "grande",
  fr: "grand / grande",
  nl: "groot"
}, {
  de: "klein",
  en: "small",
  es: "pequeño / pequeña",
  fr: "petit / petite",
  nl: "klein"
}, {
  de: "neu",
  en: "new",
  es: "nuevo / nueva",
  fr: "nouveau / nouvelle",
  nl: "nieuw"
}, {
  de: "alt",
  en: "old",
  es: "viejo / vieja",
  fr: "vieux / vieille",
  nl: "oud"
}, {
  de: "jung",
  en: "young",
  es: "joven",
  fr: "jeune",
  nl: "jong"
}, {
  de: "schön",
  en: "beautiful",
  es: "bonito / bonita",
  fr: "beau / belle",
  nl: "mooi"
}, {
  de: "hässlich",
  en: "ugly",
  es: "feo / fea",
  fr: "laid / laide",
  nl: "lelijk"
}, {
  de: "lang",
  en: "long",
  es: "largo / larga",
  fr: "long / longue",
  nl: "lang"
}, {
  de: "kurz",
  en: "short",
  es: "corto / corta",
  fr: "court / courte",
  nl: "kort"
}, {
  de: "hoch",
  en: "high",
  es: "alto / alta",
  fr: "haut / haute",
  nl: "hoog"
}, {
  de: "niedrig",
  en: "low",
  es: "bajo / baja",
  fr: "bas / basse",
  nl: "laag"
}, {
  de: "einfach",
  en: "easy",
  es: "fácil",
  fr: "facile",
  nl: "makkelijk"
}, {
  de: "schwierig",
  en: "difficult",
  es: "difícil",
  fr: "difficile",
  nl: "moeilijk"
}, {
  de: "glücklich",
  en: "happy",
  es: "feliz",
  fr: "heureux / heureuse",
  nl: "gelukkig"
}, {
  de: "traurig",
  en: "sad",
  es: "triste",
  fr: "triste",
  nl: "verdrietig"
}, {
  de: "schnell",
  en: "fast",
  es: "rápido / rápida",
  fr: "rapide",
  nl: "snel"
}, {
  de: "langsam",
  en: "slow",
  es: "lento / lenta",
  fr: "lent / lente",
  nl: "langzaam"
}, {
  de: "teuer",
  en: "expensive",
  es: "caro / cara",
  fr: "cher / chère",
  nl: "duur"
}, {
  de: "billig",
  en: "cheap",
  es: "barato / barata",
  fr: "bon marché",
  nl: "goedkoop"
}, {
  de: "heiß",
  en: "hot",
  es: "caliente",
  fr: "chaud / chaude",
  nl: "heet"
}, {
  de: "kalt",
  en: "cold",
  es: "frío / fría",
  fr: "froid / froide",
  nl: "koud"
}, {
  de: "sauber",
  en: "clean",
  es: "limpio / limpia",
  fr: "propre",
  nl: "schoon"
}, {
  de: "schmutzig",
  en: "dirty",
  es: "sucio / sucia",
  fr: "sale",
  nl: "vuil"
}, {
  de: "stark",
  en: "strong",
  es: "fuerte",
  fr: "fort / forte",
  nl: "sterk"
}, {
  de: "schwach",
  en: "weak",
  es: "débil",
  fr: "faible",
  nl: "zwak"
}, {
  de: "reich",
  en: "rich",
  es: "rico / rica",
  fr: "riche",
  nl: "rijk"
}, {
  de: "arm",
  en: "poor",
  es: "pobre",
  fr: "pauvre",
  nl: "arm"
}, {
  de: "voll",
  en: "full",
  es: "lleno / llena",
  fr: "plein / pleine",
  nl: "vol"
}, {
  de: "leer",
  en: "empty",
  es: "vacío / vacía",
  fr: "vide",
  nl: "leeg"
}, {
  de: "offen",
  en: "open",
  es: "abierto / abierta",
  fr: "ouvert / ouverte",
  nl: "open"
}, {
  de: "geschlossen",
  en: "closed",
  es: "cerrado / cerrada",
  fr: "fermé / fermée",
  nl: "gesloten"
}, {
  de: "hell",
  en: "bright",
  es: "claro / clara",
  fr: "clair / claire",
  nl: "helder"
}, {
  de: "dunkel",
  en: "dark",
  es: "oscuro / oscura",
  fr: "sombre",
  nl: "donker"
}, {
  de: "schwer",
  en: "heavy",
  es: "pesado / pesada",
  fr: "lourd / lourde",
  nl: "zwaar"
}, {
  de: "leicht",
  en: "light",
  es: "ligero / ligera",
  fr: "léger / légère",
  nl: "licht"
}, {
  de: "wichtig",
  en: "important",
  es: "importante",
  fr: "important / importante",
  nl: "belangrijk"
}, {
  de: "interessant",
  en: "interesting",
  es: "interesante",
  fr: "intéressant / intéressante",
  nl: "interessant"
}, {
  de: "langweilig",
  en: "boring",
  es: "aburrido / aburrida",
  fr: "ennuyeux / ennuyeuse",
  nl: "saai"
}, {
  de: "lustig",
  en: "funny",
  es: "divertido / divertida",
  fr: "drôle",
  nl: "grappig"
}, {
  de: "nett",
  en: "nice",
  es: "simpático / simpática",
  fr: "sympathique",
  nl: "aardig"
}, {
  de: "freundlich",
  en: "friendly",
  es: "amable",
  fr: "aimable",
  nl: "vriendelijk"
}, {
  de: "wütend",
  en: "angry",
  es: "enfadado / enfadada",
  fr: "fâché / fâchée",
  nl: "boos"
}, {
  de: "müde",
  en: "tired",
  es: "cansado / cansada",
  fr: "fatigué / fatiguée",
  nl: "moe"
}, {
  de: "gesund",
  en: "healthy",
  es: "sano / sana",
  fr: "sain / saine",
  nl: "gezond"
}, {
  de: "krank",
  en: "sick",
  es: "enfermo / enferma",
  fr: "malade",
  nl: "ziek"
}, {
  de: "trocken",
  en: "dry",
  es: "seco / seca",
  fr: "sec / sèche",
  nl: "droog"
}, {
  de: "nass",
  en: "wet",
  es: "mojado / mojada",
  fr: "mouillé / mouillée",
  nl: "nat"
}, {
  de: "gefährlich",
  en: "dangerous",
  es: "peligroso / peligrosa",
  fr: "dangereux / dangereuse",
  nl: "gevaarlijk"
}];
function generalCat() {
  return {
    de: "Allgemein",
    en: "General",
    es: "General",
    nl: "Algemeen",
    fr: "Général"
  }[UILANG] || "General";
}
const GENERAL_LABELS = ["allgemein", "general", "général", "algemeen", "generale", "généralités"];
function isGeneralCat(c) {
  return GENERAL_LABELS.indexOf((c || "").trim().toLowerCase()) >= 0;
}
const SR_DAYS = [1, 3, 7, 21, 60, 60];
function VocabView({
  lang,
  focus
}) {
  const [items, setItems] = useState(() => getVocab());
  // Kommt beim Login frischer Wortschatz aus dem Konto, sofort anzeigen.
  useEffect(() => {
    function onSync() { setItems(getVocab()); }
    window.addEventListener("kunju-vocab-synced", onSync);
    return () => window.removeEventListener("kunju-vocab-synced", onSync);
  }, []);
  const [cat, setCat] = useState(() => recall("kunju-vocab-cat", "all"));
  const [catsOpen, setCatsOpen] = useState(false); // Themen-Block auf-/zugeklappt
  const [dir, setDir] = useState("native"); // native = type mother tongue → translate to target
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [practice, setPractice] = useState(null); // {pool, idx, val, state, portion}
  const [seeding, setSeeding] = useState("");
  const skill = recall("kunju-skill", "beginner");
  const nativeName = recall("kunju-native", "German");
  const [customCatNames, setCustomCatNames] = useState(() => recall("kunju-vocab-catnames", []));
  const [hiddenCats, setHiddenCats] = useState(() => recall("kunju-vocab-cathidden", []));
  const [addingCat, setAddingCat] = useState(false);
  const [newCatVal, setNewCatVal] = useState("");
  // Über „＋ Liste" aus der Übersicht den Chooser öffnen (leer · Vorlage · einfügen · Sprache).
  useEffect(() => {
    if (recall("kunju-vocab-open-newlist", false)) {
      persist("kunju-vocab-open-newlist", false);
      setNewCatVal("");
      setChooserTpl(false);
      setShowChooser(true);
    }
  }, []);
  const [showImport, setShowImport] = useState(false);
  const [impText, setImpText] = useState("");
  const [impChecking, setImpChecking] = useState(false);
  const [impReview, setImpReview] = useState(null); // [{term,trans,newTerm,newTrans,st,use}]
  const [moveId, setMoveId] = useState(null); // Wort verschieben: offene Auswahl
  const [showCross, setShowCross] = useState(false); // „Aus anderer Sprache"-Fenster
  const [crossSrc, setCrossSrc] = useState(null);    // gewählte Quellsprache
  const [crossPick, setCrossPick] = useState({});    // cat -> bool (welche Listen)
  const [crossBusy, setCrossBusy] = useState(false);
  const [showChooser, setShowChooser] = useState(false); // „＋ Liste"-Chooser
  const [chooserTpl, setChooserTpl] = useState(false);    // Vorlagen aufgeklappt
  const customCats = useMemo(() => {
    const fromItems = new Set();
    items.forEach(it => {
      if (it.cat && !isGeneralCat(it.cat) && templateCats().indexOf(it.cat) < 0) fromItems.add(it.cat);
    });
    const merged = new Set([...customCatNames, ...fromItems]);
    return [...merged];
  }, [items, customCatNames]);
  const allCats = [generalCat(), ...templateCats(), ...customCats].filter(c => isGeneralCat(c) || hiddenCats.indexOf(c) < 0);
  function persistItems(next) {
    setItems(next);
    saveVocab(next);
  }
  function targetName() {
    return window.CONJ[lang].name;
  }

  // Pre-fill the "Adjektive" topic with the static list (instant, offline,
  // correct gender forms). Once per learning+mother-tongue pair.
  function seedAdjectives(catName) {
    const seedKey = `kunju-vadj-${lang}-${nativeName}`;
    if (recall(seedKey, false)) return;
    const code = uiFromNative(nativeName);
    if (code === lang) {
      persist(seedKey, true);
      return;
    } // mother tongue = target → nothing to learn
    const have = getVocab();
    const additions = [];
    ADJ_STATIC.forEach((a, i) => {
      const term = (a[lang] || "").trim(),
        nat = (a[code] || a.en || "").trim();
      if (!term || !nat || norm(term) === norm(nat)) return;
      if (isVocabKnown(lang, term)) return;
      if (have.some(x => x.lang === lang && norm(x.term) === norm(term)) || additions.some(x => norm(x.term) === norm(term))) return;
      additions.push({
        id: Date.now() + "-adj" + i,
        lang,
        term,
        trans: nat,
        cat: catName,
        kind: "word",
        created: Date.now() + i,
        seed: true,
        nat: nativeName
      });
    });
    if (additions.length) persistItems([...additions, ...getVocab()]);
    persist(seedKey, true);
  }
  function seedCategory(catName) {
    if (!catName || catName === "all") return;
    const idx = templateCats().indexOf(catName);
    if (idx < 0) return; // only auto-fill template categories
    if (isAdjTopic(catName)) {
      seedAdjectives(catName);
      return;
    } // static, no AI
    const seedKey = `kunju-vseed-${lang}-${catName}-${skill}-${nativeName}`;
    if (recall(seedKey, false)) return;
    if (!window.__hasAI()) return;
    const already = getVocab().filter(it => it.lang === lang && it.cat === catName).length;
    if (already >= 5) {
      persist(seedKey, true);
      return;
    }
    const topic = VOCAB_TOPICS[idx] || catName;
    const lvl = skill === "advanced" ? "advanced C1-level" : skill === "intermediate" ? "intermediate B1-level" : "basic A1–A2";
    setSeeding(catName);
    window.aiComplete(`List 5 useful ${lvl} ${targetName()} words or short phrases about "${topic}".${adjFormsNote(lang, targetName(), isAdjTopic(catName))} For each, give the ${targetName()} term and its ${nativeName} translation. Avoid duplicates. Reply with ONLY a minified JSON array, nothing else: [{"t":"<${targetName()} term>","n":"<${nativeName} translation>"}]`).then(txt => {
      let arr = null;
      try {
        let s = String(txt || "").replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
        const a = s.indexOf("["),
          b = s.lastIndexOf("]");
        if (a >= 0 && b > a) s = s.slice(a, b + 1);
        arr = JSON.parse(s);
      } catch (_) {
        arr = null;
      }
      setSeeding("");
      if (!Array.isArray(arr) || !arr.length) return; // failed — allow retry on next open
      const list = getVocab();
      const additions = [];
      arr.slice(0, 5).forEach((e, i) => {
        const term = (e && (e.t || e.term) || "").trim(),
          nat = (e && (e.n || e.trans) || "").trim();
        if (!term || !nat) return;
        if (isVocabKnown(lang, term)) return; // user dismissed it earlier → knows it
        if (list.some(x => x.lang === lang && norm(x.term) === norm(term)) || additions.some(x => norm(x.term) === norm(term))) return;
        additions.push({
          id: Date.now() + "-" + i,
          lang,
          term,
          trans: nat,
          cat: catName,
          kind: term.indexOf(" ") >= 0 ? "phrase" : "word",
          created: Date.now() + i,
          seed: true,
          nat: nativeName
        });
      });
      if (additions.length) {
        persist(seedKey, true);
        persistItems([...additions, ...getVocab()]);
      }
    }).catch(() => {
      setSeeding("");
    });
  }
  function seedCustomCategory(catName) {
    if (!catName || !window.__hasAI()) return;
    const seedKey = `kunju-vseed-${lang}-custom-${catName}`;
    if (recall(seedKey, false)) return;
    const already = getVocab().filter(it => it.lang === lang && it.cat === catName).length;
    if (already >= 3) {
      persist(seedKey, true);
      return;
    }
    const lvl = skill === "advanced" ? "advanced C1-level" : skill === "intermediate" ? "intermediate B1-level" : "basic A1–A2";
    setSeeding(catName);
    window.aiComplete(`List 5 useful ${lvl} ${targetName()} words or short phrases about "${catName}".${adjFormsNote(lang, targetName(), isAdjTopic(catName))} For each, give the ${targetName()} term and its ${nativeName} translation. Avoid duplicates. Reply with ONLY a minified JSON array: [{"t":"<${targetName()} term>","n":"<${nativeName} translation>"}]`).then(txt => {
      let arr = null;
      try {
        let s = String(txt || "").replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
        const a = s.indexOf("["),
          b = s.lastIndexOf("]");
        if (a >= 0 && b > a) s = s.slice(a, b + 1);
        arr = JSON.parse(s);
      } catch (_) {}
      setSeeding("");
      if (!Array.isArray(arr) || !arr.length) return;
      const list = getVocab();
      const additions = [];
      arr.slice(0, 5).forEach((e, i) => {
        const term = (e && (e.t || e.term) || "").trim(),
          nat = (e && (e.n || e.trans) || "").trim();
        if (!term || !nat) return;
        if (isVocabKnown(lang, term)) return; // user dismissed it earlier → knows it
        if (list.some(x => x.lang === lang && norm(x.term) === norm(term)) || additions.some(x => norm(x.term) === norm(term))) return;
        additions.push({
          id: Date.now() + "-" + i,
          lang,
          term,
          trans: nat,
          cat: catName,
          kind: term.indexOf(" ") >= 0 ? "phrase" : "word",
          created: Date.now() + i,
          seed: true,
          nat: nativeName
        });
      });
      if (additions.length) {
        persist(seedKey, true);
        persistItems([...additions, ...getVocab()]);
      }
    }).catch(() => setSeeding(""));
  }

  // starter words auto-load when a template category is opened (per category + level, once)
  useEffect(() => {
    if (cat && templateCats().indexOf(cat) >= 0) seedCategory(cat); /* eslint-disable-next-line */
  }, [cat, lang]);

  // One-time auto-refresh: upgrade existing single-form FR/ES adjectives to BOTH
  // gender forms (beau → "beau / belle"). Static map first (instant/offline),
  // then AI for any remaining adjectives in an "Adjektive" category.
  useEffect(() => {
    if (lang !== "fr" && lang !== "es") return;
    const flag = `kunju-adjfix-${lang}-v1`;
    if (recall(flag, false)) return;
    const map = {};
    ADJ_STATIC.forEach(a => {
      const v = a[lang];
      if (v && v.indexOf(" / ") >= 0) map[norm(v.split(" / ")[0])] = v;
    });
    let changed = false;
    const next = getVocab().map(it => {
      if (it.lang !== lang || !it.term || it.term.indexOf(" / ") >= 0) return it;
      const dbl = map[norm(it.term)];
      if (dbl) {
        changed = true;
        return {
          ...it,
          term: dbl,
          kind: "word"
        };
      }
      return it;
    });
    if (changed) {
      saveVocab(next);
      setItems(next);
    }
    persist(flag, true);
    if (window.__hasAI && window.__hasAI()) {
      const tName = window.CONJ[lang].name;
      next.filter(it => it.lang === lang && it.term && it.term.indexOf(" / ") < 0 && isAdjTopic(it.cat)).slice(0, 20).forEach(it => {
        window.aiComplete(`The ${tName} adjective "${it.term}": give its masculine and feminine forms separated by " / " (e.g. "beau / belle"). If both forms are identical, reply with the word once. Reply with ONLY that, nothing else.`).then(r => {
          const out = String(r || "").trim().replace(/^["'«»]+|["'«»]+$/g, "").split("\n")[0].trim();
          if (!out || norm(out) === norm(it.term) || out.indexOf(" / ") < 0) return;
          const upd = getVocab().map(x => x.id === it.id ? {
            ...x,
            term: out
          } : x);
          saveVocab(upd);
          setItems(upd);
        }).catch(() => {});
      });
    }
    /* eslint-disable-next-line */
  }, [lang]);
  function suggestMore() {
    if (seeding) return;
    const isTpl = templateCats().indexOf(cat) >= 0;
    const catName = cat === "all" || cat === generalCat() ? null : cat;
    const idx = catName ? templateCats().indexOf(catName) : -1;
    const topic = idx >= 0 ? VOCAB_TOPICS[idx] : catName || "useful everyday vocabulary";
    if (!window.__hasAI()) return;
    const lvl = skill === "advanced" ? "advanced C1-level" : skill === "intermediate" ? "intermediate B1-level" : "basic A1–A2";
    const known = knownTerms(lang);
    const knownSet = new Set(known.map(t => norm(t)));
    // Avoid both what's already saved AND words the user dismissed (= knows).
    const avoidList = [...new Set([...getVocab().filter(it => it.lang === lang).map(it => it.term), ...known])].filter(Boolean).slice(0, 60);
    const avoid = avoidList.length ? ` The learner already knows these — do NOT include any of them: ${avoidList.join(", ")}.` : "";
    const adjNote = adjFormsNote(lang, targetName(), isAdjTopic(catName) || isAdjTopic(cat));
    setSeeding(cat || "all");
    window.aiComplete(`Suggest 10 useful ${lvl} ${targetName()} words or short phrases about "${topic}".${avoid}${adjNote} For each give the ${targetName()} term and its ${nativeName} translation. Reply with ONLY a minified JSON array, nothing else: [{"t":"...","n":"..."}]`).then(txt => {
      let arr = null;
      try {
        let s = String(txt || "").replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
        const a = s.indexOf("["),
          b = s.lastIndexOf("]");
        if (a >= 0 && b > a) s = s.slice(a, b + 1);
        arr = JSON.parse(s);
      } catch (_) {
        arr = null;
      }
      setSeeding("");
      if (!Array.isArray(arr)) return;
      const list = getVocab();
      const additions = [];
      const useCat = catName || generalCat();
      arr.slice(0, 10).forEach((e, i) => {
        const term = (e && (e.t || e.term) || "").trim(),
          nat = (e && (e.n || e.trans) || "").trim();
        if (!term || !nat) return;
        if (knownSet.has(norm(term))) return; // dismissed earlier → skip
        if (list.some(x => x.lang === lang && norm(x.term) === norm(term)) || additions.some(x => norm(x.term) === norm(term))) return;
        additions.push({
          id: Date.now() + "-s" + i,
          lang,
          term,
          trans: nat,
          cat: useCat,
          kind: term.indexOf(" ") >= 0 ? "phrase" : "word",
          created: Date.now() + i,
          seed: true,
          nat: nativeName
        });
      });
      if (additions.length) persistItems([...additions, ...getVocab()]);
    }).catch(() => setSeeding(""));
  }
  function addEntry() {
    const raw = text.trim();
    if (!raw || busy) return;
    const useCat = cat === "all" ? generalCat() : cat;
    if (!window.__hasAI()) {
      const entry = {
        id: Date.now() + "",
        lang,
        term: dir === "target" ? raw : "",
        trans: dir === "native" ? raw : "",
        cat: useCat,
        kind: raw.indexOf(" ") >= 0 ? "phrase" : "word",
        created: Date.now(),
        nat: nativeName
      };
      persistItems([entry, ...items]);
      setText("");
      return;
    }
    setBusy(true);
    const from = dir === "native" ? nativeName : targetName();
    const to = dir === "native" ? targetName() : nativeName;
    window.aiComplete(`Translate this ${from} ${raw.indexOf(" ") >= 0 ? "phrase" : "word"} into ${to}: "${raw}". Reply with ONLY the ${to} translation, no quotes, no extra text.`).then(r => {
      const out = String(r || "").trim().replace(/^["'«»]+|["'«»]+$/g, "").split("\n")[0].trim();
      const entry = dir === "native" ? {
        id: Date.now() + "",
        lang,
        term: out,
        trans: raw,
        cat: useCat,
        kind: raw.indexOf(" ") >= 0 ? "phrase" : "word",
        created: Date.now(),
        nat: nativeName
      } : {
        id: Date.now() + "",
        lang,
        term: raw,
        trans: out,
        cat: useCat,
        kind: raw.indexOf(" ") >= 0 ? "phrase" : "word",
        created: Date.now(),
        nat: nativeName
      };
      persistItems([entry, ...items]);
      setText("");
      setBusy(false);
    }).catch(() => setBusy(false));
  }
  function remove(id) {
    const it = items.find(x => x.id === id);
    if (it) { addVocabKnown(lang, it.term); deleteVocabCloud(it.lang || lang, it.term); }
    persistItems(items.filter(x => x.id !== id));
  }
  // Wort in eine andere Liste verschieben (nur Kategorie ändern → Cloud-Upsert).
  function moveItem(id, newCat) {
    const cur = getVocab();
    const it = cur.find(x => x.id === id);
    if (it) { it.cat = newCat; persistItems(cur.slice()); }
    setMoveId(null);
  }
  // Falsch als Wort gemerktes Verb nach „Gemerkte Verben" verschieben (Infinitiv).
  function moveToVerbs(id) {
    const it = items.find(x => x.id === id);
    if (!it) { setMoveId(null); return; }
    let inf = it.term;
    try { const dq = deconjugate(lang, it.term); if (dq && dq.infinitives && dq.infinitives.length && dq.infinitives[0].base) inf = dq.infinitives[0].base; } catch (e) {}
    if (window.__addVerbFav) window.__addVerbFav(lang, inf);
    deleteVocabCloud(it.lang || lang, it.term);
    persistItems(items.filter(x => x.id !== id));
    setMoveId(null);
    if (window.__toast) window.__toast(tr("gm_saved_verb_toast", { w: inf }));
  }
  // „Aus anderer Sprache": Listen einer anderen Sprache übernehmen — Wörter werden
  // in die aktuelle Sprache übersetzt, native Übersetzung & Kategorie bleiben.
  function crossLangsAvail() {
    const s = new Set();
    getVocab().forEach(x => { if (x && x.lang && x.lang !== lang && x.term && LANG_META[x.lang]) s.add(x.lang); });
    return [...s];
  }
  function crossCatsFor(src) {
    const s = new Set();
    getVocab().forEach(x => { if (x && x.lang === src && x.term) s.add(x.cat || generalCat()); });
    return [...s];
  }
  async function crossRun() {
    const picked = Object.keys(crossPick).filter(c => crossPick[c]);
    if (!crossSrc || !picked.length) { setShowCross(false); return; }
    if (!window.__hasAI()) { setShowCross(false); if (window.__toast) window.__toast(tr("cross_offline")); return; }
    const src = getVocab().filter(x => x.lang === crossSrc && x.term && picked.indexOf(x.cat || generalCat()) >= 0).slice(0, 60);
    setCrossBusy(true);
    const seen = new Set(getVocab().filter(x => x.lang === lang).map(x => norm(x.term)));
    const srcName = (window.CONJ[crossSrc] && window.CONJ[crossSrc].name) || crossSrc;
    let added = 0;
    for (let i = 0; i < src.length; i++) {
      const x = src[i];
      let term = "";
      try {
        const r = await window.aiComplete(`Translate this ${srcName} word or phrase into ${targetName()}: "${x.term}". Reply with ONLY the ${targetName()} translation, no quotes, no extra text.`);
        term = String(r || "").trim().replace(/^["'«».]+|["'«».]+$/g, "").split("\n")[0].trim();
      } catch (e) {}
      if (!term || seen.has(norm(term))) continue;
      seen.add(norm(term));
      const entry = { id: Date.now() + "-cl" + i, lang: lang, term: term, trans: x.trans || "", cat: x.cat || generalCat(), kind: x.kind || (term.indexOf(" ") >= 0 ? "phrase" : "word"), created: Date.now() + i, nat: nativeName };
      persistItems([entry, ...getVocab()]);
      added++;
    }
    setCrossBusy(false); setShowCross(false); setCrossSrc(null); setCrossPick({});
    if (window.__toast) window.__toast(tr("cross_done", { n: added }));
  }
  // Ganze Liste einfügen: Zeilen parsen ("Wort - Übersetzung", auch nur "Wort").
  // Trennzeichen: Bindestrich/–/—/=, Tab, " / " oder Komma. Dubletten werden übersprungen.
  function parseImport(text) {
    const out = [], seen = new Set(getVocab().filter(x => x.lang === lang && x.term).map(x => norm(x.term)));
    String(text || "").split(/\r?\n/).forEach(line => {
      let s = String(line || "").trim();
      if (!s) return;
      let term = s, trans = "";
      const m = s.split(/\s+[-–—=]\s+|\t| \/ /);
      if (m.length > 1) { term = m[0].trim(); trans = m.slice(1).join(" ").trim(); }
      else if (s.indexOf(",") >= 0) { const c = s.split(","); term = c[0].trim(); trans = c.slice(1).join(",").trim(); }
      term = term.replace(/^[-–—•*•\d.\)\s]+/, "").trim();
      if (!term) return;
      const k = norm(term);
      if (seen.has(k)) return;
      seen.add(k);
      out.push({ term: term, trans: trans });
    });
    return out;
  }
  // Import mit KI-Prüfung: erst prüfen (Schreibweise + Übersetzung), dann entscheidet
  // der Nutzer pro Wort. Ohne KI / sehr lange Liste → direkt einfügen (runImport).
  async function startImport() {
    const parsed = parseImport(impText);
    if (!parsed.length) { setShowImport(false); setImpText(""); return; }
    if (!window.__hasAI() || parsed.length > 40) { runImport(); return; }
    setImpChecking(true);
    const src = targetName();
    const rev = [];
    for (const p of parsed.slice(0, 40)) {
      let newTerm = p.term, newTrans = p.trans, st = "ok";
      try {
        const r = await window.aiComplete(`A learner typed this ${src} vocabulary entry. Correct the spelling and accents of the ${src} word and give its ${nativeName} translation. Word: "${p.term}"${p.trans ? `. Learner translation: "${p.trans}"` : ""}. Reply on ONE line exactly as: corrected ${src} word | ${nativeName} translation`);
        const parts = String(r || "").split("|");
        const ct = (parts[0] || "").trim().replace(/^["'«».]+|["'«».]+$/g, "").split("\n")[0].trim();
        const tt = (parts[1] || "").trim().replace(/^["'«».]+|["'«».]+$/g, "").split("\n")[0].trim();
        if (ct) newTerm = ct;
        if (tt) newTrans = tt;
        if (norm(newTerm) !== norm(p.term)) st = "sugg";
        else if (p.trans && norm(newTrans) !== norm(p.trans)) st = "sugg";
        else if (!p.trans && newTrans) st = "added";
      } catch (e) {}
      rev.push({ term: p.term, trans: p.trans, newTerm: newTerm, newTrans: newTrans, st: st, use: st === "sugg" || st === "added" });
    }
    setImpChecking(false);
    setImpReview(rev);
  }
  function addReviewed() {
    const useCat = cat === "all" ? generalCat() : cat;
    const now = Date.now();
    const seen = new Set(getVocab().filter(x => x.lang === lang).map(x => norm(x.term)));
    const additions = [];
    (impReview || []).forEach((r, i) => {
      const term = r.use ? r.newTerm : r.term;
      const trans = r.use ? r.newTrans : r.trans;
      if (!term || seen.has(norm(term))) return;
      seen.add(norm(term));
      additions.push({ id: now + "-imp" + i, lang: lang, term: term, trans: trans, cat: useCat, kind: term.indexOf(" ") >= 0 ? "phrase" : "word", created: now + i, nat: nativeName });
    });
    if (additions.length) persistItems([...additions, ...getVocab()]);
    setImpReview(null); setShowImport(false); setImpText("");
    if (window.__toast) window.__toast(tr("cross_done", { n: additions.length }));
  }
  async function runImport() {
    const useCat = cat === "all" ? generalCat() : cat;
    const parsed = parseImport(impText);
    if (!parsed.length) { setShowImport(false); setImpText(""); return; }
    const now = Date.now();
    const additions = parsed.map((p, i) => ({
      id: now + "-imp" + i, lang: lang, term: p.term, trans: p.trans,
      cat: useCat, kind: p.term.indexOf(" ") >= 0 ? "phrase" : "word", created: now + i, nat: nativeName
    }));
    persistItems([...additions, ...getVocab()]);
    setShowImport(false); setImpText("");
    // Fehlende Übersetzungen per KI nachziehen (gedeckelt, damit es nicht ausufert).
    if (window.__hasAI()) {
      const need = additions.filter(a => !a.trans).slice(0, 25);
      for (const a of need) {
        try {
          const r = await window.aiComplete(`Translate this ${targetName()} ${a.kind === "phrase" ? "phrase" : "word"} into ${nativeName}: "${a.term}". Reply with ONLY the ${nativeName} translation, no quotes, no extra text.`);
          const outT = String(r || "").trim().replace(/^["'«»]+|["'«»]+$/g, "").split("\n")[0].trim();
          if (outT) {
            const cur = getVocab();
            const it = cur.find(x => x.lang === lang && norm(x.term) === norm(a.term));
            if (it && !it.trans) { it.trans = outT; persistItems(cur.slice()); }
          }
        } catch (e) {}
      }
    }
  }
  function addCustomCat() {
    setAddingCat(true);
    setNewCatVal("");
  }
  // Chooser: leere Liste mit Namen anlegen (keine KI-Startwörter).
  function createEmptyList() {
    const name = newCatVal.trim();
    if (!name) return;
    if (!customCatNames.includes(name)) {
      const updated = [...customCatNames, name];
      setCustomCatNames(updated);
      persist("kunju-vocab-catnames", updated);
    }
    setCat(name); persist("kunju-vocab-cat", name);
    setShowChooser(false); setNewCatVal(""); setChooserTpl(false);
  }
  // Chooser: Vorlage nehmen → Liste heißt wie die Vorlage, KI füllt Startwörter.
  function pickTemplate(t) {
    setCat(t); persist("kunju-vocab-cat", t);
    setShowChooser(false); setNewCatVal(""); setChooserTpl(false);
    setTimeout(() => seedCategory(t), 80);
  }
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
  function deleteCat(c) {
    if (!c || isGeneralCat(c)) return;
    const gen = generalCat();
    // Wörter dieses Themas nach "Allgemein" verschieben (nicht löschen).
    const moved = items.map(it => it.cat === c ? {
      ...it,
      cat: gen
    } : it);
    persistItems(moved);
    // aus eigenen Kategorien entfernen
    if (customCatNames.indexOf(c) >= 0) {
      const upd = customCatNames.filter(x => x !== c);
      setCustomCatNames(upd);
      persist("kunju-vocab-catnames", upd);
    }
    // dauerhaft ausblenden (auch Vorlagen-Themen)
    if (hiddenCats.indexOf(c) < 0) {
      const uph = [...hiddenCats, c];
      setHiddenCats(uph);
      persist("kunju-vocab-cathidden", uph);
    }
    if (cat === c) {
      setCat("all");
      persist("kunju-vocab-cat", "all");
    }
    const msg = {
      de: "Thema gelöscht – die Wörter sind jetzt unter „Allgemein“.",
      en: "Topic deleted — its words moved to General.",
      es: "Tema eliminado: sus palabras pasaron a General.",
      nl: "Onderwerp verwijderd — woorden staan nu onder Algemeen.",
      fr: "Thème supprimé — les mots sont passés dans Général."
    }[UILANG] || "Topic deleted.";
    if (window.__toast) window.__toast(msg);
  }
  const langItems = items.filter(it => it.lang === lang && (!it.nat || it.nat === nativeName));
  const shown = cat === "all" ? langItems : isGeneralCat(cat) ? langItems.filter(it => isGeneralCat(it.cat)) : langItems.filter(it => it.cat === cat);

  // ----- practice (self-typing, portions of 30) -----
  function vmistKey() {
    return `kunju-vmist-${lang}`;
  }
  function getVMist() {
    return recall(vmistKey(), []);
  }
  function addVMist(it) {
    const l = getVMist();
    if (!l.some(x => norm(x.term) === norm(it.term))) persist(vmistKey(), [{
      term: it.term,
      trans: it.trans,
      cat: it.cat,
      kind: it.kind
    }, ...l].slice(0, 100));
  }
  function removeVMist(it) {
    persist(vmistKey(), getVMist().filter(x => norm(x.term) !== norm(it.term)));
  }
  // ----- spaced repetition -----
  function srKey() {
    return `kunju-sr-${lang}`;
  }
  function getSR() {
    return recall(srKey(), {});
  }
  function srInfo(term) {
    return getSR()[norm(term)] || {
      lvl: 0,
      due: 0
    };
  }
  function srAnswer(term, ok) {
    const m = getSR();
    const cur = m[norm(term)] || {
      lvl: 0,
      due: 0
    };
    const now = Date.now();
    let lvl, due;
    if (ok) {
      lvl = Math.min(cur.lvl + 1, 6);
      due = now + SR_DAYS[Math.min(lvl - 1, 5)] * 864e5;
    } else {
      lvl = 0;
      due = now;
    }
    m[norm(term)] = {
      lvl,
      due
    };
    persist(srKey(), m);
  }
  function isDue(term) {
    return (srInfo(term).due || 0) <= Date.now();
  }
  const dueItems = langItems.filter(it => it.term && it.trans && isDue(it.term));
  function startDuePractice() {
    const pool = shuffle(dueItems).slice(0, 30);
    if (!pool.length) return;
    setPractice({
      pool,
      idx: 0,
      val: "",
      state: "idle",
      due: true,
      right: 0
    });
  }
  function startPractice(portion) {
    const pool = shuffle(shown.filter(it => it.term && it.trans)).slice(portion * 30, portion * 30 + 30);
    if (!pool.length) return;
    setPractice({
      pool,
      idx: 0,
      val: "",
      state: "idle",
      portion,
      right: 0
    });
  }
  function startMistPractice() {
    const pool = shuffle(getVMist());
    if (!pool.length) return;
    setPractice({
      pool,
      idx: 0,
      val: "",
      state: "idle",
      mist: true,
      right: 0
    });
  }
  function checkPractice() {
    if (!practice || practice.state !== "idle") return;
    const cur = practice.pool[practice.idx];
    const ok = deburr(norm(practice.val)) === deburr(norm(cur.term));
    if (ok) {
      if (practice.mist) removeVMist(cur);
    } else addVMist(cur);
    srAnswer(cur.term, ok);
    if (ok) creditChallengeWord(lang, cur.term);
    setPractice(p => p ? {
      ...p,
      state: ok ? "correct" : "wrong",
      right: p.right + (ok ? 1 : 0)
    } : p);
  }
  function nextPractice() {
    setPractice(p => {
      if (!p) return p;
      if (p.idx + 1 >= p.pool.length) return {
        ...p,
        done: true
      };
      return {
        ...p,
        idx: p.idx + 1,
        val: "",
        state: "idle"
      };
    });
  }
  if (practice && !practice.done) {
    const cur = practice.pool[practice.idx];
    return /*#__PURE__*/React.createElement("div", {
      className: "view",
      style: {
        "--lc": LANG_META[lang].color
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "vocpr-head"
    }, /*#__PURE__*/React.createElement("button", {
      className: "nameskip",
      onClick: () => setPractice(null)
    }, "\u2190 ", tr("back")), /*#__PURE__*/React.createElement("span", {
      className: "vocpr-count"
    }, practice.idx + 1, " / ", practice.pool.length)), /*#__PURE__*/React.createElement("div", {
      className: "quizcard quizmodern",
      style: {
        "--lc": LANG_META[lang].color
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "qm-top"
    }, /*#__PURE__*/React.createElement("span", {
      className: "flashtense"
    }, cur.cat), /*#__PURE__*/React.createElement("span", {
      className: "flashtense vockind"
    }, cur.kind === "phrase" ? tr("vocab_phrase") : tr("vocab_word"))), /*#__PURE__*/React.createElement("div", {
      className: "qm-prompt"
    }, /*#__PURE__*/React.createElement("span", {
      className: "flashverb"
    }, cur.trans)), /*#__PURE__*/React.createElement("div", {
      className: "quizinput"
    }, /*#__PURE__*/React.createElement("input", {
      value: practice.val,
      "aria-label": "Antwort eingeben",
      placeholder: "\u2026",
      disabled: practice.state !== "idle",
      onChange: e => setPractice(p => ({
        ...p,
        val: e.target.value
      })),
      onKeyDown: e => {
        if (e.key === "Enter") {
          practice.state === "idle" ? checkPractice() : nextPractice();
        }
      },
      autoComplete: "off",
      autoCapitalize: "off",
      spellCheck: "false"
    })), practice.state === "correct" && /*#__PURE__*/React.createElement("div", {
      className: "feedback ok"
    }, "\u2713 ", praiseLine()), practice.state === "wrong" && /*#__PURE__*/React.createElement("div", {
      className: "feedback no"
    }, "\u2717 ", tr("answer"), " ", /*#__PURE__*/React.createElement("b", null, cur.term)), practice.state === "idle" ? /*#__PURE__*/React.createElement("button", {
      className: "quizbtn check qm-check",
      onClick: checkPractice
    }, tr("check")) : /*#__PURE__*/React.createElement("button", {
      className: "quizbtn next",
      onClick: nextPractice
    }, tr("next"))));
  }
  if (practice && practice.done) {
    return /*#__PURE__*/React.createElement("div", {
      className: "view",
      style: {
        "--lc": LANG_META[lang].color
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "mistdone"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mistdone-ic"
    }, "\uD83C\uDF89"), /*#__PURE__*/React.createElement("h3", null, practice.right, " / ", practice.pool.length), /*#__PURE__*/React.createElement("p", null, tr("vocab_done")), /*#__PURE__*/React.createElement("button", {
      className: "quizbtn check",
      onClick: () => setPractice(null)
    }, tr("back"))));
  }
  const portions = Math.ceil(shown.filter(it => it.term && it.trans).length / 30);
  return /*#__PURE__*/React.createElement("div", {
    className: "view",
    style: {
      "--lc": "var(--ink)"
    }
  }, focus && /*#__PURE__*/React.createElement("div", {
    className: "voc-title"
  }, cat === "all" ? tr("vocab_all") : isGeneralCat(cat) ? tr("gm_words") : cat, /*#__PURE__*/React.createElement("small", null, " · ", shown.length)), /*#__PURE__*/React.createElement("div", {
    className: "vocadd",
    style: {
      "--lc": "var(--ink)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "vocdir"
  }, /*#__PURE__*/React.createElement("button", {
    className: "vocdirbtn" + (dir === "native" ? " on" : ""),
    onClick: () => setDir("native")
  }, nativeLabel(nativeName), " \u2192 ", targetName()), /*#__PURE__*/React.createElement("button", {
    className: "vocdirbtn" + (dir === "target" ? " on" : ""),
    onClick: () => setDir("target")
  }, targetName(), " \u2192 ", nativeLabel(nativeName))), /*#__PURE__*/React.createElement("div", {
    className: "vocaddrow"
  }, /*#__PURE__*/React.createElement("input", {
    className: "vocinput",
    value: text,
    "aria-label": tr("vocab_add_ph"),
    placeholder: busy ? "↔ …" : tr("vocab_add_ph"),
    disabled: busy,
    onChange: e => setText(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter") addEntry();
    },
    autoComplete: "off",
    spellCheck: "false"
  }), /*#__PURE__*/React.createElement("button", {
    className: "vocaddbtn",
    onClick: addEntry,
    disabled: busy || !text.trim()
  }, "+")), !focus && /*#__PURE__*/React.createElement("div", {
    className: "voccats" + (catsOpen ? " open" : "")
  }, /*#__PURE__*/React.createElement("button", {
    className: "voccat" + (cat === "all" ? " on" : ""),
    onClick: () => {
      setCat("all");
      persist("kunju-vocab-cat", "all");
    }
  }, tr("vocab_all")), allCats.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    className: "voccat" + (cat === c ? " on" : ""),
    onClick: () => {
      setCat(c);
      persist("kunju-vocab-cat", c);
    }
  }, c, cat === c && !isGeneralCat(c) && /*#__PURE__*/React.createElement("span", {
    role: "button",
    "aria-label": {
      de: "Thema löschen",
      en: "Delete topic",
      es: "Eliminar tema",
      nl: "Onderwerp verwijderen",
      fr: "Supprimer le thème"
    }[UILANG] || "Delete topic",
    onClick: e => {
      e.stopPropagation();
      deleteCat(c);
    },
    style: {
      marginLeft: "6px",
      fontWeight: 700,
      opacity: 0.7
    }
  }, "×")))), !focus && /*#__PURE__*/React.createElement("div", {
    className: "voccats-actions"
  }, allCats.length > 5 ? /*#__PURE__*/React.createElement("button", {
    className: "voccat-toggle",
    onClick: () => setCatsOpen(o => !o)
  }, catsOpen ? tr("vocab_cats_less") : tr("vocab_cats_all")) : null, /*#__PURE__*/React.createElement("button", {
    className: "voccat addcat",
    onClick: addCustomCat
  }, "+ ", tr("vocab_new_cat")))), (shown.filter(it => it.term && it.trans).length > 0 || getVMist().length > 0) && /*#__PURE__*/React.createElement("div", {
    className: "vocpractice-bar"
  }, dueItems.length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "quizbtn vocstart vocdue",
    onClick: startDuePractice
  }, /*#__PURE__*/React.createElement("span", { className: "due-ic", dangerouslySetInnerHTML: { __html: DUE_BARS } }), tr("vocab_due"), " \xB7 ", dueItems.length), Array.from({
    length: portions
  }).map((_, p) => /*#__PURE__*/React.createElement("button", {
    key: p,
    className: "quizbtn vocstart" + (dueItems.length > 0 ? " ghost" : ""),
    onClick: () => startPractice(p)
  }, "\u25B6 ", tr("vocab_practice"), " ", portions > 1 ? `· ${p * 30 + 1}–${Math.min((p + 1) * 30, shown.length)}` : "")), getVMist().length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "mistbtn vocmist",
    style: {
      "--lc": LANG_META[lang].color
    },
    onClick: startMistPractice
  }, /*#__PURE__*/React.createElement("span", {
    className: "mistbtn-ic"
  }, "\u26A0"), /*#__PURE__*/React.createElement("span", {
    className: "mistbtn-tx"
  }, tr("mist_practice")), /*#__PURE__*/React.createElement("span", {
    className: "mistbtn-n"
  }, getVMist().length))), /*#__PURE__*/React.createElement("button", {
    className: "vocsuggest",
    onClick: suggestMore,
    disabled: !!seeding
  }, seeding ? txtIco(IC_SPARK, "…") : txtIco(IC_SPARK, tr("vocab_suggest"))), /*#__PURE__*/React.createElement("button", {
    className: "vocsuggest vocimport",
    onClick: () => setShowImport(true)
  }, txtIco("<svg viewBox='0 0 24 24' width='15' height='15' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><rect x='6' y='4' width='12' height='16' rx='2'/><path d='M9.5 4h5v2.4h-5z'/><path d='M9 11h6M9 15h4'/></svg>", tr("imp_open"))), crossLangsAvail().length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "vocsuggest voccross",
    onClick: () => { setCrossSrc(null); setCrossPick({}); setShowCross(true); }
  }, txtIco("<svg viewBox='0 0 24 24' width='15' height='15' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='9'/><path d='M3 12h18M12 3c2.5 2.4 3.8 5.5 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.5-3.8-9S9.5 5.4 12 3z'/></svg>", tr("cross_open"))), showCross && /*#__PURE__*/React.createElement("div", {
    className: "vimp-bg",
    onClick: () => { if (!crossBusy) setShowCross(false); }
  }, /*#__PURE__*/React.createElement("div", {
    className: "vimp-card",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", { className: "vimp-h" }, tr("cross_title")),
    crossBusy ? /*#__PURE__*/React.createElement("p", { className: "vimp-sub" }, tr("cross_busy"))
    : /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("p", { className: "vimp-sub" }, tr("cross_help")),
      /*#__PURE__*/React.createElement("div", { className: "cross-h" }, tr("cross_srch")),
      /*#__PURE__*/React.createElement("div", { className: "cross-langs" }, crossLangsAvail().map(l => /*#__PURE__*/React.createElement("button", {
        key: l, className: "cross-lang" + (crossSrc === l ? " on" : ""), onClick: () => { setCrossSrc(l); setCrossPick({}); }
      }, (LANG_META[l] && LANG_META[l].code) || l))),
      crossSrc ? /*#__PURE__*/React.createElement(React.Fragment, null,
        /*#__PURE__*/React.createElement("div", { className: "cross-h" }, tr("cross_lists")),
        /*#__PURE__*/React.createElement("div", { className: "cross-cats" }, crossCatsFor(crossSrc).map(c => /*#__PURE__*/React.createElement("button", {
          key: c, className: "cross-cat" + (crossPick[c] ? " on" : ""), onClick: () => setCrossPick(p => Object.assign({}, p, { [c]: !p[c] }))
        }, /*#__PURE__*/React.createElement("span", { className: "cross-cb" }, crossPick[c] ? "✓" : ""), /*#__PURE__*/React.createElement("span", null, isGeneralCat(c) ? tr("gm_words") : c)))) ) : null,
      /*#__PURE__*/React.createElement("button", {
        className: "vimp-cta", onClick: crossRun,
        disabled: !crossSrc || !Object.keys(crossPick).some(c => crossPick[c])
      }, tr("cross_cta"))))), showImport && /*#__PURE__*/React.createElement("div", {
    className: "vimp-bg",
    onClick: () => setShowImport(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "vimp-card",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", { className: "vimp-h" }, tr("imp_title")),
    /*#__PURE__*/React.createElement("p", { className: "vimp-sub" }, tr("imp_help")),
    /*#__PURE__*/React.createElement("textarea", {
      className: "vimp-ta", value: impText, placeholder: tr("imp_ph"), autoFocus: true,
      onChange: e => setImpText(e.target.value), spellCheck: "false"
    }),
    /*#__PURE__*/React.createElement("div", { className: "vimp-into" }, tr("imp_into"), " ", /*#__PURE__*/React.createElement("b", null, cat === "all" ? tr("gm_words") : cat)),
    /*#__PURE__*/React.createElement("button", { className: "vimp-cta", onClick: startImport, disabled: !impText.trim() || impChecking }, impChecking ? tr("imp_checking") : tr("imp_cta")))), impReview && /*#__PURE__*/React.createElement("div", {
    className: "vimp-bg",
    onClick: () => setImpReview(null)
  }, /*#__PURE__*/React.createElement("div", {
    className: "vimp-card",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", { className: "vimp-h" }, tr("imp_review_title")),
    /*#__PURE__*/React.createElement("p", { className: "vimp-sub" }, tr("imp_review_sub", { n: impReview.filter(r => r.st !== "ok").length })),
    /*#__PURE__*/React.createElement("div", { className: "imprev-list" }, impReview.map((r, idx) => /*#__PURE__*/React.createElement("button", {
      key: idx,
      className: "imprev-row" + (r.st !== "ok" ? " flag" : "") + (r.use ? " use" : ""),
      onClick: () => { if (r.st !== "ok") setImpReview(list => list.map((x, j) => j === idx ? Object.assign({}, x, { use: !x.use }) : x)); }
    }, /*#__PURE__*/React.createElement("span", { className: "imprev-ck" }, r.st === "ok" ? "✓" : (r.use ? "✓" : "○")),
      /*#__PURE__*/React.createElement("span", { className: "imprev-mid" },
        /*#__PURE__*/React.createElement("span", { className: "imprev-term" }, r.use ? r.newTerm : r.term, r.trans || r.newTrans ? /*#__PURE__*/React.createElement("small", null, " · ", r.use ? r.newTrans : r.trans) : null),
        r.st !== "ok" ? /*#__PURE__*/React.createElement("span", { className: "imprev-note" }, r.st === "added" ? tr("imp_added_note") : (tr("imp_orig") + " " + r.term + (r.trans ? " · " + r.trans : ""))) : null)))),
    /*#__PURE__*/React.createElement("button", { className: "vimp-cta", onClick: addReviewed }, tr("imp_add")))), showChooser && /*#__PURE__*/React.createElement("div", {
    className: "vimp-bg",
    onClick: () => setShowChooser(false)
  }, /*#__PURE__*/React.createElement("div", {
    className: "vimp-card",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", { className: "vimp-h" }, tr("lch_title")),
    /*#__PURE__*/React.createElement("input", { className: "lch-name", value: newCatVal, placeholder: tr("lch_name_ph"), onChange: e => setNewCatVal(e.target.value), spellCheck: "false", autoComplete: "off" }),
    /*#__PURE__*/React.createElement("div", { className: "cross-h" }, tr("lch_how")),
    /*#__PURE__*/React.createElement("div", { className: "lch-opts" },
      /*#__PURE__*/React.createElement("button", { className: "lch-opt", disabled: !newCatVal.trim(), onClick: createEmptyList },
        /*#__PURE__*/React.createElement("span", { className: "lch-ic", dangerouslySetInnerHTML: { __html: IC_PLUS2 } }),
        /*#__PURE__*/React.createElement("span", { className: "lch-t" }, tr("lch_empty"))),
      /*#__PURE__*/React.createElement("button", { className: "lch-opt" + (chooserTpl ? " on" : ""), onClick: () => setChooserTpl(o => !o) },
        /*#__PURE__*/React.createElement("span", { className: "lch-ic", dangerouslySetInnerHTML: { __html: IC_LIST } }),
        /*#__PURE__*/React.createElement("span", { className: "lch-t" }, tr("lch_tpl")),
        /*#__PURE__*/React.createElement("span", { className: "lch-car" }, chooserTpl ? "▴" : "▾")),
      chooserTpl ? /*#__PURE__*/React.createElement("div", { className: "lch-tpls" }, templateCats().map(t => /*#__PURE__*/React.createElement("button", { key: t, className: "lch-tpl-chip", onClick: () => pickTemplate(t) }, t))) : null,
      /*#__PURE__*/React.createElement("button", { className: "lch-opt", onClick: () => { setShowChooser(false); setShowImport(true); } },
        /*#__PURE__*/React.createElement("span", { className: "lch-ic", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='17' height='17' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><rect x='6' y='4' width='12' height='16' rx='2'/><path d='M9.5 4h5v2.4h-5z'/><path d='M9 11h6M9 15h4'/></svg>" } }),
        /*#__PURE__*/React.createElement("span", { className: "lch-t" }, tr("imp_open"))),
      crossLangsAvail().length > 0 ? /*#__PURE__*/React.createElement("button", { className: "lch-opt", onClick: () => { setShowChooser(false); setCrossSrc(null); setCrossPick({}); setShowCross(true); } },
        /*#__PURE__*/React.createElement("span", { className: "lch-ic", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='17' height='17' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='9'/><path d='M3 12h18M12 3c2.5 2.4 3.8 5.5 3.8 9s-1.3 6.6-3.8 9c-2.5-2.4-3.8-5.5-3.8-9S9.5 5.4 12 3z'/></svg>" } }),
        /*#__PURE__*/React.createElement("span", { className: "lch-t" }, tr("cross_open"))) : null))), moveId && (() => {
    const mit = items.find(x => x.id === moveId);
    if (!mit) return null;
    let isVerb = false;
    try { const dq = deconjugate(lang, mit.term); isVerb = !!(dq && dq.infinitives && dq.infinitives.length); } catch (e) {}
    const curCat = mit.cat || generalCat();
    const targets = allCats.filter(c => norm(c) !== norm(curCat));
    return /*#__PURE__*/React.createElement("div", { className: "vmove-bg", onClick: () => setMoveId(null) },
      /*#__PURE__*/React.createElement("div", { className: "vmove-card", onClick: e => e.stopPropagation() },
        /*#__PURE__*/React.createElement("div", { className: "vmove-h" }, tr("mv_title"), " ", /*#__PURE__*/React.createElement("b", null, mit.term)),
        /*#__PURE__*/React.createElement("div", { className: "vmove-list" },
          isVerb ? /*#__PURE__*/React.createElement("button", { className: "vmove-opt vmove-verb", onClick: () => moveToVerbs(mit.id) },
            /*#__PURE__*/React.createElement("span", { className: "vmove-ic", dangerouslySetInnerHTML: { __html: IC_STAR2 } }),
            /*#__PURE__*/React.createElement("span", null, tr("gm_verbs"))) : null,
          targets.map(c => /*#__PURE__*/React.createElement("button", { key: c, className: "vmove-opt", onClick: () => moveItem(mit.id, c) },
            /*#__PURE__*/React.createElement("span", { className: "vmove-ic", dangerouslySetInnerHTML: { __html: isGeneralCat(c) ? IC_INBOX : IC_LIST } }),
            /*#__PURE__*/React.createElement("span", null, isGeneralCat(c) ? tr("gm_words") : c)))),
        /*#__PURE__*/React.createElement("button", { className: "vmove-cancel", onClick: () => setMoveId(null) }, tr("gf_back"))));
  })(), addingCat && /*#__PURE__*/React.createElement("div", {
    onClick: () => setAddingCat(false),
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 600,
      background: "rgba(0,0,0,.55)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      animation: "fade .18s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "var(--surface)",
      borderRadius: "24px",
      width: "min(320px,100%)",
      boxShadow: "0 24px 60px rgba(0,0,0,.35)",
      overflow: "hidden",
      animation: "fade .2s ease"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(135deg,#a557ff22,#a557ff18)",
      padding: "22px 20px 16px",
      textAlign: "center",
      borderBottom: "1px solid var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "36px",
      lineHeight: 1,
      marginBottom: "8px"
    }
  }, "\uD83D\uDCC1"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: "17px",
      color: "var(--text)",
      marginBottom: "4px"
    }
  }, "Neue Kategorie"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12.5px",
      color: "var(--muted)",
      lineHeight: 1.4
    }
  }, "Die KI schl\xE4gt danach automatisch", /*#__PURE__*/React.createElement("br", null), "5 passende Startw\xF6rter vor \u2728")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 18px 18px",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("input", {
    autoFocus: true,
    className: "nameinput",
    "aria-label": "Kategoriename",
    value: newCatVal,
    onChange: e => setNewCatVal(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter" && newCatVal.trim()) commitNewCat();
      if (e.key === "Escape") setAddingCat(false);
    },
    placeholder: "z. B. Reisen, Kochen, Sport\u2026",
    style: {
      fontSize: "15px",
      margin: 0
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "namebtn",
    onClick: commitNewCat,
    disabled: !newCatVal.trim(),
    style: {
      margin: 0,
      opacity: newCatVal.trim() ? 1 : 0.4,
      transition: "opacity .15s"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "cta-rainbow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "cta-label"
  }, "Erstellen \u2713"))))), shown.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "emptystate"
  }, /*#__PURE__*/React.createElement("p", {
    className: "emptystate-title"
  }, seeding ? "✨" : "📒"), /*#__PURE__*/React.createElement("p", {
    className: "emptystate-sub"
  }, seeding ? tr("vocab_seeding") : tr("vocab_empty"))) : /*#__PURE__*/React.createElement("div", {
    className: "voclist"
  }, shown.map(it => /*#__PURE__*/React.createElement("div", {
    className: "vocitem",
    key: it.id,
    style: {
      "--lc": "var(--ink)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "vocitem-main"
  }, /*#__PURE__*/React.createElement("span", {
    className: "vocterm"
  }, it.term || "…", it.term && /*#__PURE__*/React.createElement("button", {
    className: "vocspk",
    onClick: () => speak(it.term, window.CONJ[lang].ttsLang)
  }, /*#__PURE__*/React.createElement("span", { className: "ico-spk", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='1em' height='1em' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='display:block'><path d='M11 5 6 9H2v6h4l5 4V5z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/><path d='M19 5a9 9 0 0 1 0 14'/></svg>" } }))), /*#__PURE__*/React.createElement("span", {
    className: "voctrans"
  }, it.trans), it.term && /*#__PURE__*/React.createElement("span", {
    className: "vocmeter",
    title: tr("vocab_strength")
  }, /*#__PURE__*/React.createElement("span", {
    className: "rb",
    style: { clipPath: "inset(0 " + (100 - (Math.min(srInfo(it.term).lvl, 6) <= 0 ? 10 : Math.round(Math.min(srInfo(it.term).lvl, 6) / 6 * 100))) + "% 0 0)" }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "voccatchip",
    title: tr("mv_title"),
    onClick: () => setMoveId(it.id)
  }, isGeneralCat(it.cat) ? tr("gm_words") : it.cat), /*#__PURE__*/React.createElement("button", {
    className: "vocx",
    onClick: () => remove(it.id)
  }, "\u2715")))));
}

/* ---------- Challenge list view (3rd tab on the Saved page) ---------- */
function ChallengeView({ lang, onNew, onPractice, onWords, canEdit = true }) {
  const h = React.createElement;
  const [, setTick] = useState(0);
  const g = recall("kunju-goal-data", null);
  // Beim Leeren der Verbliste NICHT rauswerfen: Bearbeiten-Modus automatisch an,
  // damit man neue Verben hinzufügen / gemerkte übernehmen kann.
  // Standard-Tarif (canEdit=false): vorgegebene Challenge, nur ansehen.
  const [edit, setEdit] = useState(() => canEdit && (recall("kunju-challenge-pending-edit", false) || !!g && !((g.verbList || []).length)));
  useEffect(() => { if (recall("kunju-challenge-pending-edit", false)) persist("kunju-challenge-pending-edit", false); }, []);
  const [vIn, setVIn] = useState("");
  const [wIn, setWIn] = useState("");
  const [picker, setPicker] = useState(null); // null | "v" | "w" — Auswahl aus gemerkter Liste
  const force = () => setTick(t => t + 1);
  const vl = (g && g.verbList) || [];
  const wl = (g && g.wordList) || [];
  const vDone = vl.filter(x => (x.done || 0) >= CH_DONE).length;
  const wDone = wl.filter(x => (x.done || 0) >= CH_DONE).length;
  const allDone = (vl.length + wl.length) > 0 && vDone === vl.length && wDone === wl.length;
  useEffect(() => { if (allDone) { try { fireConfetti(8); } catch (e) {} } }, [allDone]);
  if (!g) {
    // Challenges sind pro Sprache: klar machen, DASS für die aktive Sprache noch
    // keine besteht (sonst wirkt es, als sei eine Challenge einer anderen Sprache weg).
    const langName = (window.CONJ[lang] && window.CONJ[lang].name) || (LANG_META[lang] && LANG_META[lang].code) || "";
    const lc = (LANG_META[lang] && LANG_META[lang].color) || "#7a5cff";
    return h("div", { className: "ch-empty", style: { "--lc": lc } },
      h("div", { className: "ch-empty-pill" }, h("span", { className: "ch-empty-dot" }), langName),
      h("p", { className: "ch-empty-head" }, tr("ch_empty_head", { lang: langName })),
      h("p", { className: "ch-empty-tx" }, tr("ch_empty")),
      h("button", { className: "quizbtn check ch-cta", onClick: onNew }, tr("ch_create")));
  }
  function save(fn) { const gg = recall("kunju-goal-data", null); if (!gg) return; fn(gg); persistGoal(lang, gg); force(); }
  function setItem(kind, i, done) { save(gg => { const a = kind === "v" ? gg.verbList : gg.wordList; if (a && a[i]) { a[i].done = done; a[i].lastDay = done >= CH_DONE ? new Date().toDateString() : ""; } }); }
  // Weggeklickte Vorschläge merken, damit „Vorschlagen" nicht dieselben erneut bringt.
  function chRej(kind) { return recall("kunju-ch-rej-" + kind + "-" + lang, []); }
  function addChRej(kind, name) { const n = String(name || "").toLowerCase().trim(); if (!n) return; const cur = chRej(kind); if (cur.indexOf(n) < 0) { cur.push(n); persist("kunju-ch-rej-" + kind + "-" + lang, cur); } }
  function removeItem(kind, i) { save(gg => { const a = kind === "v" ? gg.verbList : gg.wordList; if (a && a[i]) { addChRej(kind, kind === "v" ? a[i].v : a[i].w); a.splice(i, 1); } }); }
  function removeName(kind, t) { addChRej(kind, t); save(gg => { const a = kind === "v" ? gg.verbList : gg.wordList; if (!a) return; const i = a.findIndex(x => String(kind === "v" ? x.v : x.w).toLowerCase() === String(t).toLowerCase()); if (i >= 0) a.splice(i, 1); }); }
  function addVerb(v) { const t = String(v || "").replace(/^to /, "").trim(); if (!t) return; save(gg => { gg.verbList = gg.verbList || []; if (!gg.verbList.some(x => String(x.v).toLowerCase() === t.toLowerCase())) gg.verbList.push({ v: t, done: 0, lastDay: "" }); }); }
  function addWord(w) { const t = String(w || "").trim(); if (!t) return; save(gg => { gg.wordList = gg.wordList || []; if (!gg.wordList.some(x => String(x.w).toLowerCase() === t.toLowerCase())) gg.wordList.push({ w: t, done: 0, lastDay: "" }); }); }
  function fillVerbs() { save(gg => { const target = gg.verbs || 0; const rej = new Set(chRej("v")); const have = new Set((gg.verbList || []).map(x => String(x.v).toLowerCase())); let pool = []; try { pool = quizPool(lang, recall("kunju-skill", "beginner")) || []; } catch (e) {} for (let i = 0; i < pool.length && (gg.verbList || []).length < target; i++) { const v = String(pool[i]).replace(/^to /, "").trim(); const vl = v.toLowerCase(); if (v && !have.has(vl) && !rej.has(vl)) { have.add(vl); gg.verbList.push({ v: v, done: 0, lastDay: "" }); } } }); }
  // Wörter: aus dem gemerkten Vokabular vorschlagen (für Wörter gibt es keinen Verb-Pool).
  function fillWords() { save(gg => { const target = gg.words || 0; gg.wordList = gg.wordList || []; const rej = new Set(chRej("w")); const have = new Set(gg.wordList.map(x => String(x.w).toLowerCase())); const pool = (getVocab() || []).filter(x => x.lang === lang && x.term).map(x => String(x.term).trim()).filter(Boolean); for (let i = 0; i < pool.length && gg.wordList.length < target; i++) { const w = pool[i]; const wl = w.toLowerCase(); if (w && !have.has(wl) && !rej.has(wl)) { have.add(wl); gg.wordList.push({ w: w, done: 0, lastDay: "" }); } } }); }
  const days = (g.weeks || 2) * 7;
  const passed = g.startDate ? Math.floor((Date.now() - new Date(g.startDate).getTime()) / 86400000) : 0;
  const left = Math.max(0, days - passed);
  const inV = new Set(vl.map(x => String(x.v).toLowerCase()));
  const inW = new Set(wl.map(x => String(x.w).toLowerCase()));
  const allSavedV = Array.from(new Set((recall("kunju-favs", []) || []).filter(f => f.lang === lang && f.verb).map(f => String(f.verb).replace(/^to /, "").trim()).filter(Boolean)));
  const allSavedW = Array.from(new Set((getVocab() || []).filter(x => x.lang === lang && x.term).map(x => String(x.term).trim()).filter(Boolean)));
  const savedVerbs = allSavedV.filter(v => !inV.has(v.toLowerCase()));
  const savedWords = allSavedW.filter(w => !inW.has(w.toLowerCase()));
  const item = (label, done, kind, i) => {
    const st = (done || 0) >= CH_DONE ? "done" : (done || 0) > 0 ? "learn" : "open";
    return h("div", { className: "ch-item ch-" + st, key: kind + i },
      h("span", { className: "ch-dot" }),
      h("span", { className: "ch-label" }, label),
      edit
        ? h("button", { className: "ch-rm", "aria-label": "remove", onClick: () => removeItem(kind, i) }, "✕")
        : h("button", { className: "ch-mark" + (st === "done" ? " on" : ""), title: st === "done" ? tr("again") : tr("learned"), onClick: () => setItem(kind, i, st === "done" ? 0 : CH_DONE) }, "✓"));
  };
  const addRow = (kind) => {
    const val = kind === "v" ? vIn : wIn;
    const setVal = kind === "v" ? setVIn : setWIn;
    const add = (t) => { kind === "v" ? addVerb(t) : addWord(t); };
    const doAdd = () => { add(val); setVal(""); };
    const open = picker === kind;
    const all = kind === "v" ? allSavedV : allSavedW;
    const inSet = kind === "v" ? inV : inW;
    const notIn = all.filter(c => !inSet.has(c.toLowerCase()));
    const addOne = c => kind === "v" ? addVerb(c) : addWord(c);
    return h("div", { className: "ch-edit" },
      h("div", { className: "ch-addrow" },
        h("input", { className: "ch-input", value: val, placeholder: tr("ch_add_ph"), onChange: e => setVal(e.target.value), onKeyDown: e => { if (e.key === "Enter") doAdd(); } }),
        // "+": Text vorhanden → hinzufügen; leer → gemerkte Liste hier aufklappen
        h("button", { className: "ch-addbtn", title: tr("ch_choose"), onClick: () => { if (String(val).trim()) doAdd(); else setPicker(open ? null : kind); } }, "+")),
      h("div", { className: "ch-addbtns" },
        h("button", { className: "ch-choose" + (open ? " on" : ""), onClick: () => setPicker(open ? null : kind) },
          h("span", { className: "ch-choose-ic", dangerouslySetInnerHTML: { __html: IC_LIST } }),
          tr("ch_choose"),
          h("span", { className: "ch-choose-car" }, open ? "▴" : "▾")),
        h("button", { className: "ch-fill", onClick: kind === "v" ? fillVerbs : fillWords }, tr("ch_fill"))),
      // Inline-Dropdown (öffnet an Ort und Stelle, kein Popup)
      open ? h("div", { className: "ch-pick-inline" },
        all.length
          ? h("div", { className: "ch-pick-list" }, all.map((c, ci) => {
              const on = inSet.has(c.toLowerCase());
              return h("button", { key: ci, className: "chpick-row" + (on ? " on" : ""), onClick: () => on ? removeName(kind, c) : addOne(c) },
                h("span", { className: "chpick-lb" }, c),
                h("span", { className: "chpick-mk" }, on ? "✓" : "+"));
            }))
          : h("p", { className: "chpick-empty" }, kind === "v" ? tr("ch_pick_empty_v") : tr("ch_pick_empty_w")),
        notIn.length ? h("button", { className: "ch-from-all", onClick: () => notIn.forEach(addOne) }, tr("ch_add_all")) : null) : null);
  };
  const section = (kind) => {
    const lst = kind === "v" ? vl : wl;
    if (!lst.length && !edit) return null;
    const head = (kind === "v" ? tr("saved_verbs") + " · " + tr("ch_done_v", { a: vDone, b: vl.length }) : tr("saved_vocab") + " · " + tr("ch_done_w", { a: wDone, b: wl.length }));
    return h("div", { className: "ch-sec" },
      h("div", { className: "ch-sec-h" }, head),
      lst.map((x, i) => item(kind === "v" ? x.v : x.w, x.done, kind, i)),
      edit ? addRow(kind) : null,
      kind === "w" && lst.length && !edit
        ? h("button", { className: "ch-wordhint", onClick: () => onWords && onWords() },
            h("span", null, tr("ch_words_hint")),
            h("span", { className: "ch-wordhint-go" }, tr("ch_words_go")))
        : null);
  };
  return h("div", { className: "ch-wrap" },
    h("div", { className: "ch-head" },
      h("b", null, "Challenge · ", h("span", { style: { color: LANG_META[lang].color } }, window.CONJ[lang].name)),
      canEdit ? h("button", { className: "ch-editbtn" + (edit ? " on" : ""), onClick: () => setEdit(e => !e) }, edit ? tr("ch_editdone") : tr("ch_edit")) : null),
    allDone
      ? h("div", { className: "ch-master" }, h("b", null, tr("ch_mastered")), h("span", null, tr("ch_mastered_sub")))
      : (g.startDate && left <= 0
          ? h("div", { className: "ch-timeup" },
              h("b", null, tr("ch_timeup", { a: vDone + wDone, b: vl.length + wl.length })),
              h("div", { className: "ch-timeup-btns" },
                h("button", { className: "ch-extend", onClick: () => save(gg => { gg.weeks = (gg.weeks || 2) + 1; }) }, tr("ch_extend")),
                h("button", { className: "nameskip", onClick: onNew }, tr("ch_new"))))
          : (g.startDate ? h("div", { className: "ch-sub" }, tr("ch_left", { n: left })) : null)),
    section("v"),
    section("w"),
    h("div", { className: "ch-btns" },
      h("button", { className: "quizbtn check ch-go", onClick: onPractice }, tr("ch_practice")),
      h("button", { className: "nameskip", onClick: onNew }, tr("ch_new"))));
}
/* ---------- Saved verbs (heart tab) ---------- */
/* ---------- Gemerkt: Bibliotheks-Übersicht (Landing der Gemerkt-Seite) ---------- */
const IC_INBOX = "<svg viewBox='0 0 24 24' width='17' height='17' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M4 13l2.3-7A1 1 0 0 1 7.2 5h9.6a1 1 0 0 1 1 .8L20 13v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z'/><path d='M4 13h4l1.4 2.4h5.2L16 13h4'/></svg>";
const IC_STAR2 = "<svg viewBox='0 0 24 24' width='17' height='17' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M12 4l2.3 4.7 5.2.8-3.8 3.6.9 5.1L12 16.6 7.4 18.8l.9-5.1L4.5 9.5l5.2-.8z'/></svg>";
const IC_TARGET = "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='8'/><circle cx='12' cy='12' r='3.4'/></svg>";
const IC_CHEV = "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9.5 6l6 6-6 6'/></svg>";
const IC_CHEVL = "<svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M14.5 6l-6 6 6 6'/></svg>";
const IC_PLUS2 = "<svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 5v14M5 12h14'/></svg>";
const IC_ACT = "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M3 12h3.4l2.4 7 4-15 2.5 8H21'/></svg>";
const IC_INFO = "<svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='8.5'/><path d='M12 11v5M12 7.6h.01'/></svg>";
const IC_X2 = "<svg viewBox='0 0 24 24' width='14' height='14' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M6 6l12 12M18 6L6 18'/></svg>";
function srMapFor(lang) { return recall("kunju-sr-" + lang, {}); }
function vocabDueCount(lang) {
  const m = srMapFor(lang), now = Date.now();
  return getVocab().filter(it => it && it.lang === lang && it.term && it.trans && (((m[norm(it.term)] && m[norm(it.term)].due) || 0) <= now)).length;
}
function vocabLists(lang) {
  const m = srMapFor(lang), now = Date.now();
  const groups = {};
  getVocab().forEach(it => {
    if (!it || it.lang !== lang || !it.term) return;
    const c = it.cat || generalCat();
    (groups[c] = groups[c] || []).push(it);
  });
  return Object.keys(groups).map(c => {
    const arr = groups[c];
    const due = arr.filter(x => x.trans && (((m[norm(x.term)] && m[norm(x.term)].due) || 0) <= now)).length;
    const mastered = arr.filter(x => ((m[norm(x.term)] && m[norm(x.term)].lvl) || 0) >= 5).length;
    return { cat: c, count: arr.length, due: due, pct: arr.length ? mastered / arr.length : 0, general: isGeneralCat(c) };
  }).sort((a, b) => (b.general - a.general) || (b.count - a.count));
}
function GemerktOverview({ lang, favs, onOpenList, onVerbs, onChallenge, onNewList, onNewChallenge }) {
  const h = React.createElement;
  const lists = vocabLists(lang);
  const dueTotal = vocabDueCount(lang);
  const favCount = (favs || []).filter(f => f.lang === lang && f.verb).length;
  const goal = recall("kunju-goal-data", null);
  const hasCh = !!(goal && Array.isArray(goal.verbList) && goal.verbList.length);
  const lc = (LANG_META[lang] && LANG_META[lang].color) || "#ff9f0a";
  const chDay = hasCh ? (goal.startDate ? Math.min((goal.weeks || 2) * 7, Math.floor((Date.now() - new Date(goal.startDate)) / 864e5) + 1) : 1) : 0;
  const gd = hasCh ? (goal.weeks || 2) * 7 : 14;
  const ico = svg => h("span", { className: "gm-ic", dangerouslySetInnerHTML: { __html: svg } });
  const chev = h("span", { className: "gm-chev", dangerouslySetInnerHTML: { __html: IC_CHEV } });
  const metaEl = (l) => h("span", { className: "gm-meta" }, l.count + " " + tr("gm_words_n"), h("span", { className: "gm-bar" }, h("i", { style: { width: Math.round(l.pct * 100) + "%" } })));
  const dueBadge = (n) => n > 0 ? h("span", { className: "gm-badge", style: { "--lc": lc } }, n + " " + tr("gm_due")) : null;
  return h("div", { className: "view", style: { gap: 0 } },
    dueTotal > 0 ? h("button", { className: "gm-hero", onClick: () => onOpenList("all") },
      h("span", { className: "gm-hero-rb" }),
      h("span", { className: "gm-hero-top" },
        h("span", { className: "gm-hero-ic", dangerouslySetInnerHTML: { __html: IC_ACT } }),
        h("span", null,
          h("span", { className: "gm-hero-lbl" }, tr("gm_due_head")),
          h("span", { className: "gm-hero-num" }, dueTotal, " ", h("small", null, tr("gm_words_verbs"))))),
      h("span", { className: "gm-hero-cta" }, h("span", { className: "gm-hero-play", dangerouslySetInnerHTML: { __html: IC_PLAY } }), tr("gm_review_now"))) : null,
    hasCh ? h("button", { className: "gm-row gm-ch", onClick: onChallenge },
      ico(IC_TARGET),
      h("span", { className: "gm-mid" },
        h("span", { className: "gm-nm" }, tr("zt_eyebrow"), " · ", h("b", { style: { color: lc } }, window.CONJ[lang].name)),
        h("span", { className: "gm-meta" }, tr("cs_day") + " " + chDay + " / " + gd)),
      chev) : h("button", { className: "gm-chcta", onClick: onNewChallenge, style: { "--lc": lc } },
      h("span", { className: "gm-chcta-ic", dangerouslySetInnerHTML: { __html: IC_TARGET } }),
      h("span", { className: "gm-chcta-mid" },
        h("span", { className: "gm-chcta-h" }, tr("gm_ch_cta_h")),
        h("span", { className: "gm-chcta-s" }, tr("gm_ch_cta_s"))),
      h("span", { className: "gm-chcta-chev", dangerouslySetInnerHTML: { __html: IC_CHEV } })),
    h("div", { className: "gm-seclbl" }, tr("gm_your_lists")),
    h("button", { className: "gm-row", onClick: onVerbs },
      ico(IC_STAR2),
      h("span", { className: "gm-mid" }, h("span", { className: "gm-nm" }, tr("gm_verbs")), h("span", { className: "gm-meta" }, favCount + " " + tr("saved_verbs"))),
      chev),
    lists.map(l => h("button", { className: "gm-row", key: l.cat, onClick: () => onOpenList(l.cat) },
      ico(l.general ? IC_INBOX : IC_LIST),
      h("span", { className: "gm-mid" }, h("span", { className: "gm-nm" }, l.general ? tr("gm_words") : l.cat), metaEl(l)),
      dueBadge(l.due),
      chev)),
    h("button", { className: "gm-addliste", onClick: onNewList }, h("span", { className: "gm-ic-plus", dangerouslySetInnerHTML: { __html: IC_PLUS2 } }), " ", tr("gm_new_list")));
}
function SavedTab({
  lang,
  favs,
  toggleFav,
  pickVerb,
  onActivity,
  onHint,
  onOpenGoal,
  onTab,
  challengeEditable
}) {
  const [sub, setSub] = useState(() => recall("kunju-saved-sub", "home"));
  const h = React.createElement;
  // Erklär-Hinweis nur in den Detail-Ansichten (nicht auf der Übersicht).
  useEffect(() => {
    if (onHint && sub !== "home") onHint("saved_" + sub);
  }, [sub]);
  function pick(s) {
    setSub(s);
    persist("kunju-saved-sub", s);
  }
  function openList(cat) {
    persist("kunju-vocab-cat", cat);
    pick("vocab");
  }
  if (sub === "home") {
    return h(GemerktOverview, {
      lang: lang,
      favs: favs,
      onOpenList: openList,
      onVerbs: () => pick("verbs"),
      onChallenge: () => pick("challenge"),
      onNewList: () => { persist("kunju-vocab-open-newlist", true); openList("all"); },
      onNewChallenge: onOpenGoal
    });
  }
  const view = sub === "verbs" ? h(SavedView, {
    lang: lang,
    favs: favs,
    toggleFav: toggleFav,
    pickVerb: pickVerb,
    onActivity: onActivity
  }) : sub === "vocab" ? h(VocabView, {
    lang: lang,
    focus: true
  }) : h(ChallengeView, {
    lang: lang,
    canEdit: challengeEditable !== false,
    onNew: onOpenGoal,
    onPractice: () => { persist("kunju-quiz-pending-group", "challenge"); onTab && onTab("quiz"); },
    onWords: () => pick("vocab")
  });
  return h("div", { className: "view", style: { gap: 0 } },
    h("div", { className: "gm-backbar" },
      h("button", { className: "gm-back", onClick: () => pick("home") },
        h("span", { dangerouslySetInnerHTML: { __html: IC_CHEVL } }), " ", tr("gm_back"))),
    view);
}
function SavedCell({
  base,
  from,
  to
}) {
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
    window.aiComplete(`Translate the ${window.CONJ[from].name} verb "${base}" to its ${window.CONJ[to].name} infinitive. Reply with ONLY the single infinitive word or short phrase in ${window.CONJ[to].name}, lowercase, no article, no quotes, no extra text.`).then(txt => {
      let out = String(txt || "").trim().toLowerCase().split("\n")[0].replace(/^["'«»]+|["'«».]+$/g, "").replace(/[^\p{L}\s'’\-]/gu, "").trim();
      setLoading(false);
      if (out) {
        persist(xkey, out);
        setVal(out);
      } else if (triedRef.current < 2) {
        setTimeout(fetchT, 400);
      }
    }).catch(() => {
      setLoading(false);
      if (triedRef.current < 2) setTimeout(fetchT, 600);
    });
  }
  useEffect(() => {
    setVal(seed());
    triedRef.current = 0; /* eslint-disable-next-line */
  }, [base, from, to]);
  useEffect(() => {
    if (val == null) {
      const t = setTimeout(fetchT, 80);
      return () => clearTimeout(t);
    } /* eslint-disable-next-line */
  }, [val, base, from, to]);
  if (val) return /*#__PURE__*/React.createElement("button", {
    className: "vtcell vtword",
    onClick: () => speak(val, window.CONJ[to].ttsLang)
  }, /*#__PURE__*/React.createElement("span", null, val), /*#__PURE__*/React.createElement("span", {
    className: "vtspk"
  }, /*#__PURE__*/React.createElement("span", { className: "ico-spk", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='1em' height='1em' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='display:block'><path d='M11 5 6 9H2v6h4l5 4V5z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/><path d='M19 5a9 9 0 0 1 0 14'/></svg>" } })));
  return /*#__PURE__*/React.createElement("button", {
    className: "vtcell vtword empty",
    onClick: fetchT,
    title: tr("tap_retry") || ""
  }, loading ? "…" : "↻");
}
function SavedView({
  lang,
  favs,
  toggleFav,
  pickVerb,
  onActivity
}) {
  const langFavs = favs.filter(f => f.lang === lang);
  const [pr, setPr] = useState(null); // {pool, idx, val, state, mist}
  const vpool = useMemo(() => langFavs.map(f => f.verb), [langFavs.length, lang]);
  const vmistKey = `kunju-vbmist-${lang}`;
  const vsrKey = `kunju-vbsr-${lang}`;
  function getVbMist() {
    const m = recall(vmistKey, []);
    return m.filter(v => vpool.indexOf(v) >= 0);
  }
  function vbDue() {
    const sr = recall(vsrKey, {});
    const now = Date.now();
    return vpool.filter(v => !sr[v] || sr[v] <= now);
  }
  function schedule(v, ok) {
    const sr = recall(vsrKey, {});
    const SR = [1, 3, 7, 21, 60];
    const lvlk = `${vsrKey}-lvl`;
    const lv = recall(lvlk, {});
    let n = ok ? Math.min((lv[v] || 0) + 1, SR.length) : 0;
    lv[v] = n;
    persist(lvlk, lv);
    sr[v] = Date.now() + (ok ? SR[Math.max(0, n - 1)] : 0.0007) * 86400000;
    persist(vsrKey, sr);
  }
  function addVbMist(v) {
    const m = recall(vmistKey, []);
    if (m.indexOf(v) < 0) {
      m.push(v);
      persist(vmistKey, m);
    }
  }
  function rmVbMist(v) {
    persist(vmistKey, recall(vmistKey, []).filter(x => x !== v));
  }
  const natName = recall("kunju-native", "German");
  const natCode = NATIVE_TO_UI[natName];
  const [transLang, setTransLang] = useState(() => recall("kunju-savedtrans", natCode || "en"));
  function setTL(v) {
    setTransLang(v);
    persist("kunju-savedtrans", v);
  }
  function LangSelect({
    value,
    onChange
  }) {
    const [open, setOpen] = useState(false);
    return /*#__PURE__*/React.createElement("div", {
      className: "vtdrop"
    }, /*#__PURE__*/React.createElement("button", {
      className: "vtdrop-btn",
      onClick: () => setOpen(o => !o)
    }, window.CONJ[value].name, /*#__PURE__*/React.createElement("span", {
      className: "vtdrop-car"
    }, "\u25BE")), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "vtdrop-back",
      onClick: () => setOpen(false)
    }), /*#__PURE__*/React.createElement("div", {
      className: "vtdrop-menu"
    }, LANG_ORDER.map(c => /*#__PURE__*/React.createElement("button", {
      key: c,
      className: "vtdrop-opt" + (c === value ? " on" : ""),
      onClick: () => {
        onChange(c);
        setOpen(false);
      }
    }, window.CONJ[c].name)))));
  }
  function vbMeaning(base) {
    if (natCode === lang) return base;
    if (natCode) {
      const ct = conceptTranslate(base, lang, natCode);
      if (ct) return ct;
    }
    if (natName === "English") {
      const m = window.lookupMeaning(lang, base);
      if (m) return m;
    }
    return recall(`kunju-vtr-${lang}-${base}-${natName}`, null);
  }
  function buildVbQ(verbList) {
    const v = verbList[Math.floor(Math.random() * verbList.length)];
    const base = (v || "").replace(/^to /, "");
    return {
      verb: v,
      base,
      prompt: vbMeaning(base),
      answer: base
    };
  }
  function ensureMeaning(base) {
    if (vbMeaning(base) != null) return;
    if (!window.__hasAI()) return;
    window.aiComplete(`Translate the ${window.CONJ[lang].name} verb "${base}" into ${natName}. Reply with ONLY the ${natName} translation in its base/infinitive form, nothing else.`).then(txt => {
      const t = String(txt || "").trim().replace(/^["'«».]+|["'«».]+$/g, "").split("\n")[0].trim();
      if (t) {
        persist(`kunju-vtr-${lang}-${base}-${natName}`, t);
        setPr(p => p && p.q && p.q.base === base ? {
          ...p,
          q: {
            ...p.q,
            prompt: t
          }
        } : p);
      }
    }).catch(() => {});
  }
  function startVbPractice(mode) {
    const src = mode === "mist" ? getVbMist() : mode === "due" ? vbDue() : vpool;
    if (!src.length) return;
    const q = buildVbQ(src);
    if (!q) return;
    ensureMeaning(q.base);
    setPr({
      mode,
      q,
      val: "",
      state: "idle",
      right: 0,
      total: 0
    });
  }
  function vbCheck() {
    setPr(p => {
      if (!p || p.state !== "idle") return p;
      const ok = norm(p.val) === norm(p.q.answer) || deburr(norm(p.val)) === deburr(norm(p.q.answer));
      if (ok) {
        schedule(p.q.verb, true);
        if (p.mode === "mist") rmVbMist(p.q.verb);
      } else {
        schedule(p.q.verb, false);
        addVbMist(p.q.verb);
      }
      onActivity && onActivity();
      return {
        ...p,
        state: ok ? "correct" : "wrong",
        right: p.right + (ok ? 1 : 0),
        total: p.total + 1,
        msg: ok ? praiseLine() : cheerLine()
      };
    });
  }
  function vbNext() {
    setPr(p => {
      if (!p) return p;
      const src = p.mode === "mist" ? getVbMist() : p.mode === "due" ? vbDue() : vpool;
      if (!src.length) return null;
      const q = buildVbQ(src);
      if (q) ensureMeaning(q.base);
      return q ? {
        ...p,
        q,
        val: "",
        state: "idle"
      } : null;
    });
  }
  if (!langFavs.length) {
    return /*#__PURE__*/React.createElement("div", {
      className: "view"
    }, /*#__PURE__*/React.createElement("div", {
      className: "emptystate"
    }, /*#__PURE__*/React.createElement("div", {
      className: "emptystate-rings"
    }, RAINBOW.slice(0, 6).map((c, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        background: c,
        animationDelay: i * 0.12 + "s"
      }
    }))), /*#__PURE__*/React.createElement("p", {
      className: "emptystate-title"
    }, "\u2605"), /*#__PURE__*/React.createElement("p", {
      className: "emptystate-sub"
    }, tr("saved_empty"))));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "view",
    style: {
      "--lc": LANG_META[lang].color
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "grammar-intro"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, tr("saved"), " \xB7 ", langFavs.length))), pr ? /*#__PURE__*/React.createElement("div", {
    className: "quizcard quizmodern",
    style: {
      "--lc": LANG_META[lang].color
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "qm-top"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flashtense"
  }, tr("vocab_translate") || "→"), /*#__PURE__*/React.createElement("span", {
    className: "flashtag"
  }, LANG_META[lang].code)), /*#__PURE__*/React.createElement("div", {
    className: "qm-prompt"
  }, /*#__PURE__*/React.createElement("span", {
    className: "flashverb"
  }, pr.q.prompt || "…")), /*#__PURE__*/React.createElement("div", {
    className: "quizinput"
  }, /*#__PURE__*/React.createElement("input", {
    value: pr.val,
    "aria-label": "Antwort eingeben",
    disabled: pr.state !== "idle",
    placeholder: "\u2026",
    autoFocus: true,
    onChange: e => setPr(p => ({
      ...p,
      val: e.target.value
    })),
    onKeyDown: e => {
      if (e.key === "Enter") {
        pr.state === "idle" ? vbCheck() : vbNext();
      }
    }
  })), pr.state === "correct" && /*#__PURE__*/React.createElement("div", {
    className: "feedback ok"
  }, "\u2713 ", pr.msg), pr.state === "wrong" && /*#__PURE__*/React.createElement("div", {
    className: "feedback no"
  }, pr.msg, " \xB7 ", tr("answer"), " ", /*#__PURE__*/React.createElement("b", null, pr.q.answer)), pr.state === "idle" ? /*#__PURE__*/React.createElement("button", {
    className: "quizbtn check qm-check",
    onClick: vbCheck
  }, tr("check")) : /*#__PURE__*/React.createElement("button", {
    className: "quizbtn next",
    onClick: vbNext
  }, tr("next")), /*#__PURE__*/React.createElement("button", {
    className: "nameskip",
    onClick: () => setPr(null)
  }, tr("back"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "vocpractice-bar"
  }, vbDue().length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "quizbtn vocstart vocdue",
    onClick: () => startVbPractice("due")
  }, /*#__PURE__*/React.createElement("span", { className: "due-ic", dangerouslySetInnerHTML: { __html: DUE_BARS } }), tr("vocab_due"), " \xB7 ", vbDue().length), /*#__PURE__*/React.createElement("button", {
    className: "quizbtn vocstart" + (vbDue().length > 0 ? " ghost" : ""),
    onClick: () => startVbPractice("all")
  }, "\u25B6 ", tr("vocab_practice")), getVbMist().length > 0 && /*#__PURE__*/React.createElement("button", {
    className: "mistbtn vocmist",
    style: {
      "--lc": LANG_META[lang].color
    },
    onClick: () => startVbPractice("mist")
  }, /*#__PURE__*/React.createElement("span", {
    className: "mistbtn-ic"
  }, "\u26A0"), /*#__PURE__*/React.createElement("span", {
    className: "mistbtn-tx"
  }, tr("mist_practice")), /*#__PURE__*/React.createElement("span", {
    className: "mistbtn-n"
  }, getVbMist().length))), /*#__PURE__*/React.createElement("div", {
    className: "vtable"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vtrow vthead"
  }, /*#__PURE__*/React.createElement("div", {
    className: "vth vtfirst"
  }, "\u2605"), /*#__PURE__*/React.createElement("div", {
    className: "vth"
  }, /*#__PURE__*/React.createElement(LangSelect, {
    value: transLang,
    onChange: setTL
  }))), langFavs.map(it => {
    const base = it.verb.replace(/^to /, "");
    const rk = it.lang + "|" + it.verb;
    return /*#__PURE__*/React.createElement("div", {
      className: "vtrow",
      key: rk
    }, /*#__PURE__*/React.createElement("div", {
      className: "vtcell vtfirst",
      style: {
        "--lc": LANG_META[it.lang].color
      }
    }, /*#__PURE__*/React.createElement("button", {
      className: "vtx",
      title: tr("learned"),
      onClick: () => toggleFav(it.lang, it.verb)
    }, "\u2715"), /*#__PURE__*/React.createElement("button", {
      className: "vtverb",
      onClick: () => pickVerb(it.lang, it.verb)
    }, base), /*#__PURE__*/React.createElement("span", {
      className: "vtbadge"
    }, LANG_META[it.lang].code)), /*#__PURE__*/React.createElement(SavedCell, {
      base: base,
      from: it.lang,
      to: transLang
    }));
  })), /*#__PURE__*/React.createElement("p", {
    className: "quizhint",
    style: {
      marginTop: 4
    }
  }, tr("saved_tap_hint"))));
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
function AppTweaks({
  t,
  setTweak,
  name,
  commitName
}) {
  return /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakSection, {
    label: "Profile"
  }), /*#__PURE__*/React.createElement(TweakText, {
    label: "Your name",
    value: name,
    placeholder: "Your name\u2026",
    onChange: v => commitName(v)
  }), /*#__PURE__*/React.createElement(TweakText, {
    label: "Gemini API key (for AI offline)",
    value: recall("kunju-gemini-key", ""),
    placeholder: "AIza\u2026 \u2014 your own key",
    onChange: v => persist("kunju-gemini-key", v.trim())
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Look & feel"
  }), /*#__PURE__*/React.createElement(TweakSelect, {
    label: "Theme",
    value: t.theme,
    options: [{
      value: "auto",
      label: "Auto (system)"
    }, {
      value: "light",
      label: "Light"
    }, {
      value: "dark",
      label: "Dark"
    }, {
      value: "playful",
      label: "Playful"
    }],
    onChange: v => setTweak("theme", v)
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Rainbow",
    value: t.accent,
    options: ["vivid", "soft", "mono"],
    onChange: v => setTweak("accent", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Learning aids"
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Highlight irregular parts",
    value: t.highlight,
    onChange: v => setTweak("highlight", v)
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Pronunciation buttons",
    value: t.sound,
    onChange: v => setTweak("sound", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Monetization (demo)"
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Sponsor recommendation slot",
    value: t.sponsor,
    onChange: v => setTweak("sponsor", v)
  }), /*#__PURE__*/React.createElement(TweakSection, {
    label: "Typography & shape"
  }), /*#__PURE__*/React.createElement(TweakSelect, {
    label: "Font",
    value: t.font,
    options: [{
      value: "space",
      label: "Space Grotesk"
    }, {
      value: "sora",
      label: "Sora"
    }, {
      value: "jakarta",
      label: "Plus Jakarta"
    }],
    onChange: v => setTweak("font", v)
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Corner radius",
    value: t.radius,
    min: 8,
    max: 34,
    step: 1,
    unit: "px",
    onChange: v => setTweak("radius", v)
  }), /*#__PURE__*/React.createElement(TweakRadio, {
    label: "Density",
    value: t.density,
    options: ["compact", "regular", "comfy"],
    onChange: v => setTweak("density", v)
  }));
}

/* ---------- Onboarding: name ---------- */
function NameGate({
  initial,
  onSubmit,
  onClose,
  editing,
  native,
  setNative,
  skill,
  setSkill
}) {
  const [val, setVal] = useState(initial || "");
  const ref = useRef(null);
  useEffect(() => {
    setTimeout(() => ref.current && ref.current.focus(), 220);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "namegate"
  }, /*#__PURE__*/React.createElement("div", {
    className: "namecard"
  }, editing && /*#__PURE__*/React.createElement("button", {
    className: "namex",
    onClick: onClose
  }, "\xD7"), /*#__PURE__*/React.createElement("h2", {
    className: "namehead"
  }, tr("welcome")), /*#__PURE__*/React.createElement("div", {
    className: "namebrandrow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-mark big"
  }, RAINBOW.slice(0, 5).map((c, i) => /*#__PURE__*/React.createElement("i", {
    key: i,
    style: {
      background: c
    }
  }))), /*#__PURE__*/React.createElement("p", {
    className: "namebrand"
  }, "Conju", /*#__PURE__*/React.createElement("b", null, "Expert"))), /*#__PURE__*/React.createElement("p", {
    className: "namesub"
  }, tr("welcome_sub")), /*#__PURE__*/React.createElement("input", {
    ref: ref,
    id: "ob-name",
    name: "given-name",
    type: "text",
    className: "nameinput",
    value: val,
    "aria-label": tr("your_name"),
    placeholder: tr("your_name"),
    maxLength: 24,
    onChange: e => setVal(e.target.value),
    onKeyDown: e => {
      if (e.key === "Enter" && val.trim()) onSubmit(val.trim());
    },
    autoComplete: "given-name",
    autoCapitalize: "words",
    spellCheck: "false"
  }), /*#__PURE__*/React.createElement("div", {
    className: "namefield"
  }, /*#__PURE__*/React.createElement("label", {
    className: "namelabel",
    htmlFor: "ob-native"
  }, tr("mother_tongue")), /*#__PURE__*/React.createElement("div", {
    className: "nativewrap"
  }, /*#__PURE__*/React.createElement("select", {
    id: "ob-native",
    className: "nativesel",
    "aria-label": tr("mother_tongue"),
    value: native,
    onChange: e => setNative(e.target.value)
  }, NATIVE_LANGS.map(l => /*#__PURE__*/React.createElement("option", {
    key: l.name,
    value: l.name
  }, l.label))), /*#__PURE__*/React.createElement("span", {
    className: "nativecaret"
  }, "\u25BE"))), /*#__PURE__*/React.createElement("div", {
    className: "namefield"
  }, /*#__PURE__*/React.createElement("label", {
    className: "namelabel",
    id: "ob-skill-label"
  }, tr("skill_q")), /*#__PURE__*/React.createElement("div", {
    className: "skillseg",
    role: "radiogroup",
    "aria-labelledby": "ob-skill-label"
  }, ["beginner", "intermediate", "advanced"].map(s => /*#__PURE__*/React.createElement("button", {
    key: s,
    type: "button",
    role: "radio",
    "aria-checked": skill === s ? "true" : "false",
    "aria-label": tr("skill_" + s),
    className: "skillbtn" + (skill === s ? " on" : ""),
    onClick: () => setSkill(s)
  }, /*#__PURE__*/React.createElement("b", null, tr("skill_" + s)))))),/*#__PURE__*/React.createElement("button", {
    className: "tourbtn",
    disabled: !val.trim(),
    onClick: () => onSubmit(val.trim())
  }, tr("lets_go")), /*#__PURE__*/React.createElement("button", {
    className: "nameskip",
    onClick: () => onSubmit("")
  }, editing ? tr("remove_name") : tr("skip"))));
}

/* ---------- Onboarding: feature tour ---------- */
function TourMock({
  kind
}) {
  const h = React.createElement;
  if (kind === "overview") {
    return h("div", { className: "tmock", key: "ov", style: { display: "flex", flexDirection: "column", gap: "9px" } },
      [[tr("t2_ov1_t"), tr("t2_ov1_d")],
       [tr("t2_ov2_t"), tr("t2_ov2_d")],
       [tr("t2_ov3_t"), tr("t2_ov3_d")]].map((r, i) =>
        h("div", { key: i, style: { display: "flex", gap: "10px", alignItems: "flex-start", textAlign: "left" } },
          h("span", { style: { width: "8px", height: "8px", borderRadius: "50%", background: "var(--text)", flex: "none", marginTop: "5px" } }),
          h("span", null,
            h("b", { style: { display: "block", fontSize: "13px", color: "var(--text)" } }, r[0]),
            h("span", { style: { fontSize: "11.5px", color: "var(--muted)" } }, r[1])))));
  }
  if (kind === "quizmodes") {
    return h("div", { className: "tmock", key: "qm", style: { display: "flex", flexWrap: "wrap", gap: "7px", justifyContent: "center" } },
      [tr("t2_m_cards"), tr("t2_m_tap"), tr("t2_m_type"), tr("t2_m_speak"), tr("t2_m_speed"), tr("t2_m_text")].map((m, i) =>
        h("span", { key: i, style: { border: "1px solid var(--border)", background: "var(--surface)", borderRadius: "999px", padding: "7px 12px", fontSize: "12.5px", fontWeight: 700, color: "var(--text)" } }, m)));
  }
  if (kind === "type") {
    return h("div", { className: "tmock", key: "ty" },
      h("div", { className: "tm-q" }, "hablar → ", h("b", null, "nosotros")),
      h("div", { style: { display: "flex", alignItems: "center", gap: "8px", border: "1.5px solid var(--border)", background: "var(--surface)", borderRadius: "12px", padding: "13px", marginTop: "10px" } },
        h("b", { style: { fontSize: "16px" } }, "hablamos"),
        h("span", { style: { marginLeft: "auto", color: "#1f7a4d", fontWeight: 800 } }, "✓")));
  }
  if (kind === "text") {
    return h("div", { className: "tmock", key: "tx" },
      h("div", { style: { display: "flex", gap: "6px" } },
        [[tr("t2_f_topic"), tr("t2_v_travel")], [tr("t2_f_tense"), "Presente"], [tr("t2_f_words"), tr("t2_v_saved")]].map((c, i) =>
          h("div", { key: i, style: { flex: 1, border: "1px solid var(--border)", borderRadius: "10px", padding: "8px 4px", textAlign: "center", background: "var(--surface)", animation: "tmpop .5s cubic-bezier(.34,1.4,.5,1) both", animationDelay: (0.08 + i * 0.12) + "s" } },
            h("div", { style: { fontSize: "8.5px", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" } }, c[0]),
            h("div", { style: { fontSize: "12px", fontWeight: 700, marginTop: "2px" } }, c[1])))),
      h("div", { style: { marginTop: "10px", border: "1px solid var(--border)", borderRadius: "10px", padding: "10px", fontSize: "12.5px", lineHeight: 1.5, background: "var(--surface)", textAlign: "left" } },
        h("span", { className: "tm-story-read" }, "Hoy viajamos a Madrid. Caminamos por el centro y hablamos con la gente…")));
  }
  if (kind === "merken") {
    return h("div", { className: "tmock", key: "mk", style: { position: "relative" } },
      h("div", { style: { fontSize: "13.5px", lineHeight: 1.6, textAlign: "left", position: "relative" } }, "No me gusta este ",
        h("b", { className: "tm-word", style: { position: "relative" } }, "trabajo",
          h("span", { className: "tm-tapdot", style: { left: "50%", top: "50%" } })), " los lunes."),
      h("div", { className: "tm-additem", style: { display: "flex", alignItems: "center", gap: "8px", marginTop: "10px", border: "1px solid var(--border)", borderRadius: "10px", padding: "9px 11px", fontWeight: 700, fontSize: "13px", background: "var(--surface)" } }, "★ trabajo",
        h("span", { style: { marginLeft: "auto", color: "var(--muted)", fontWeight: 600 } }, tr("t2_v_work"))));
  }
  if (kind === "preise") {
    return h("div", { className: "tmock", key: "pr", style: { display: "flex", flexDirection: "column", gap: "7px" } },
      [[tr("t2_p1_t"), tr("t2_p1_d"), false],
       [tr("t2_p2_t"), tr("t2_p2_d"), false],
       [tr("t2_p3_t"), tr("t2_p3_d"), true]].map((r, i) =>
        h("div", { key: i, style: { border: r[2] ? "1.5px solid transparent" : "1px solid var(--border)", background: r[2] ? "linear-gradient(var(--surface),var(--surface)) padding-box, var(--brand-rainbow) border-box" : "var(--surface)", borderRadius: "12px", padding: "10px 12px", textAlign: "left" } },
          h("b", { style: { fontSize: "13px" } }, r[0]),
          h("div", { style: { fontSize: "11px", color: "var(--muted)", marginTop: "2px" } }, r[1]))));
  }
  if (kind === "trial") {
    return /*#__PURE__*/React.createElement("div", {
      className: "tmock",
      key: "trial",
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
        gap: "8px"
      }
    }, [tr("tour_feat1"), tr("tour_feat2"), tr("tour_feat3")].map((t, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "tm-row",
      style: {
        animationDelay: 0.2 + i * 0.13 + "s",
        gap: "9px",
        justifyContent: "flex-start",
        width: "100%"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--col)",
        fontWeight: 800,
        flex: "none"
      }
    }, "\u2713"), /*#__PURE__*/React.createElement("span", {
      style: {
        textAlign: "left",
        color: "var(--text)",
        fontSize: "13px",
        fontWeight: 600
      }
    }, t))));
  }
  if (kind === "conjugate") {
    return /*#__PURE__*/React.createElement("div", {
      className: "tmock",
      key: "c"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tm-input"
    }, /*#__PURE__*/React.createElement("span", {
      className: "tm-cursor"
    }), "hablar"), /*#__PURE__*/React.createElement("div", {
      className: "tm-rows"
    }, ["yo · hablo", "tú · hablas", "él · habla", "nosotros · hablamos"].map((r, i) => /*#__PURE__*/React.createElement("div", {
      className: "tm-row",
      style: {
        animationDelay: 0.25 + i * 0.13 + "s"
      },
      key: i
    }, /*#__PURE__*/React.createElement("span", null, r.split(" · ")[0]), /*#__PURE__*/React.createElement("b", null, r.split(" · ")[1])))));
  }
  if (kind === "quiz") {
    return /*#__PURE__*/React.createElement("div", {
      className: "tmock",
      key: "q"
    }, /*#__PURE__*/React.createElement("div", {
      className: "tm-q"
    }, "comer \u2192 ", /*#__PURE__*/React.createElement("b", null, "nosotros")), /*#__PURE__*/React.createElement("div", {
      className: "tm-opts"
    }, ["comemos", "coméis", "comen", "comían"].map((o, i) => /*#__PURE__*/React.createElement("div", {
      className: "tm-opt" + (i === 0 ? " ok" : ""),
      style: {
        animationDelay: 0.2 + i * 0.1 + "s"
      },
      key: i
    }, o, i === 0 && /*#__PURE__*/React.createElement("span", {
      className: "tm-check"
    }, "\u2713")))));
  }
  if (kind === "learn") {
    return /*#__PURE__*/React.createElement("div", {
      className: "tmock",
      key: "l"
    }, [["Presente", 0], ["Pretérito", 1], ["Futuro", 2], ["Subjuntivo", 3]].map((c, i) => /*#__PURE__*/React.createElement("div", {
      className: "tm-lcard",
      style: {
        animationDelay: 0.15 + i * 0.12 + "s",
        "--lc": RAINBOW[i]
      },
      key: i
    }, /*#__PURE__*/React.createElement("span", {
      className: "tm-ldot"
    }), /*#__PURE__*/React.createElement("b", null, c[0]))));
  }
  if (kind === "goals") {
    return /*#__PURE__*/React.createElement("div", {
      className: "tmock",
      key: "g"
    }, [{
      icon: "✨",
      label: tr("goal_ai"),
      badge: tr("goal_ai_badge"),
      badgeCol: "#9a4bf0"
    }, {
      icon: "⏱",
      label: tr("goal_time"),
      note: tr("goal_time_note"),
      noteCol: "var(--muted)"
    }, {
      icon: "⚙️",
      label: tr("goal_custom"),
      note: tr("goal_custom_note"),
      noteCol: "var(--muted)"
    }].map((opt, i) => /*#__PURE__*/React.createElement("div", {
      className: "tm-row",
      key: i,
      style: {
        animationDelay: 0.15 + i * 0.13 + "s",
        gap: "10px"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "14px"
      }
    }, opt.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: "12.5px",
        color: "var(--text)"
      }
    }, opt.label), opt.badge && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "9.5px",
        fontWeight: 800,
        color: opt.badgeCol,
        background: "color-mix(in srgb,#a557ff 11%,var(--surface))",
        borderRadius: "5px",
        padding: "2px 6px",
        letterSpacing: "0.03em"
      }
    }, opt.badge), opt.note && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "11px",
        color: opt.noteCol,
        fontWeight: 600
      }
    }, opt.note))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        borderRadius: "12px",
        padding: "10px 13px",
        background: "color-mix(in srgb,#7a5cff 9%,var(--surface))",
        border: "1px solid color-mix(in srgb,#7a5cff 20%,var(--border))",
        animation: "tmpop 0.45s cubic-bezier(.34,1.4,.5,1) 0.54s both"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "26px",
        fontWeight: 800,
        color: "var(--text)",
        lineHeight: 1,
        fontFamily: "var(--font-display)"
      }
    }, "12"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "12px",
        lineHeight: 1.4
      }
    }, /*#__PURE__*/React.createElement("b", {
      style: {
        color: "var(--text)",
        fontFamily: "var(--font-display)"
      }
    }, "12 ", tr("goal_daily")), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("small", {
      style: {
        color: "var(--muted)"
      }
    }, tr("goal_time_approx")))));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "tmock",
    key: "s"
  }, [["DE", "gehen"], ["ES", "tener"], ["FR", "être"]].map((c, i) => /*#__PURE__*/React.createElement("div", {
    className: "tm-srow",
    style: {
      animationDelay: 0.2 + i * 0.14 + "s"
    },
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "tm-star"
  }, "\u2605"), /*#__PURE__*/React.createElement("span", {
    className: "tm-sl"
  }, c[0]), /*#__PURE__*/React.createElement("b", null, c[1]), /*#__PURE__*/React.createElement("span", {
    className: "tm-spk"
  }, /*#__PURE__*/React.createElement("span", { className: "ico-spk", "aria-hidden": "true", dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='1em' height='1em' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='display:block'><path d='M11 5 6 9H2v6h4l5 4V5z'/><path d='M15.5 8.5a5 5 0 0 1 0 7'/><path d='M19 5a9 9 0 0 1 0 14'/></svg>" } })))));
}
function TourGate({
  onDone
}) {
  const h = React.createElement;
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const nm = (recall("kunju-name", "") || "").trim();
  const RB = ["#ff3b5c", "#ff7a18", "#ffc400", "#34c759", "#0a84ff", "#a557ff"];
  const Logo = () => h("span", { className: "pp-mark" }, RB.slice(0, 5).map((c, k) => h("i", { key: k, style: { background: c } })));
  if (!started) {
    return h("div", { className: "namegate", onClick: onDone },
      h("div", { className: "pinpop tourpop", onClick: e => e.stopPropagation(), style: { textAlign: "center" } },
        h("button", { className: "pp-x", onClick: onDone, title: tr("tour_skip") }, "\xD7"),
        h("div", { className: "pp-head", style: { justifyContent: "center" } }, Logo(),
          h("span", { className: "pp-ey" }, "Conju", h("b", null, "Expert"))),
        h("h2", { className: "pp-title", style: { marginTop: "14px" } }, nm ? tr("t2_hi", { name: nm }) : tr("t2_hi_anon")),
        h("p", { className: "pp-sub" }, tr("t2_ask")),
        h("button", { className: "tourbtn", style: { marginTop: "16px" }, onClick: () => setStarted(true) }, tr("t2_start_tour")),
        h("button", { onClick: onDone, style: { width: "100%", marginTop: "10px", padding: "12px", background: "none", border: "0", cursor: "pointer", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "14px", color: "var(--muted)" } }, tr("t2_skip_tour"))));
  }
  const slides = [
    { kind: "overview", title: tr("t2_overview_t") },
    { kind: "text", title: tr("t2_quiz_text_t"), text: tr("t2_text_x") },
    { kind: "conjugate", title: tr("tab_conjugate"), text: tr("t2_conj_x") },
    { kind: "merken", title: tr("tab_saved"), text: tr("t2_merken_x") },
    { kind: "preise", title: tr("t2_prices_t"), text: tr("t2_prices_x") }
  ];
  const last = i === slides.length - 1;
  const s = slides[i];
  return h("div", { className: "namegate", onClick: onDone },
    h("div", { className: "pinpop tourpop", onClick: e => e.stopPropagation() },
      h("button", { className: "pp-x", onClick: onDone, title: tr("tour_skip") }, "\xD7"),
      h("div", { className: "pp-head" }, Logo(),
        h("span", { className: "pp-ey" }, "Conju", h("b", null, "Expert")),
        h("span", { className: "tour-step" }, i + 1, " / ", slides.length)),
      h("h2", { className: "pp-title tour-title" }, s.title),
      s.text ? h("p", { className: "pp-sub" }, s.text) : null,
      h("div", { className: "tour-demo", style: { "--col": "var(--text)" } }, h(TourMock, { kind: s.kind })),
      h("div", { className: "tourdots" }, slides.map((_, k) => h("span", { key: k, className: "tourdot" + (k === i ? " on" : "") }))),
      h("div", { style: { display: "flex", gap: "10px", width: "100%" } }, i > 0 ? h("button", { onClick: () => setI(i - 1), "aria-label": "back", style: { flex: "0 0 auto", padding: "0 18px", background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "14px", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px", cursor: "pointer" } }, "‹") : null, h("button", { className: "tourbtn", style: { flex: 1 }, onClick: () => last ? onDone() : setI(i + 1) }, last ? tr("tour_start") : tr("tour_next")))));
}

/* ---------- Contextual first-open feature hints ----------
   Shown shortly after a user first opens a section or a specific quiz mode /
   Saved sub-area, because most people click the welcome tour away too fast.
   One key set per kind in window.UI (all 5 UI languages):
   learn · quiz_cards/choice/type/speak/texte · saved_verbs/saved_vocab. */
const HINT_ICON_OPEN = "<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'>";
/* ConjuExpert internal mark (ascending rainbow bars) — used as the "due today"
   indicator instead of a flame: it signals progress, not heat. */
const DUE_BARS = "<svg viewBox='0 0 100 100' width='15' height='15' fill='none' aria-hidden='true'><rect x='16' y='33' width='9' height='34' rx='3.5' fill='#ff3b5c'/><rect x='31' y='21' width='9' height='58' rx='3.5' fill='#ff8a18'/><rect x='46' y='10' width='9' height='80' rx='3.5' fill='#ffc400'/><rect x='61' y='26' width='9' height='48' rx='3.5' fill='#1fbf6b'/><rect x='76' y='36' width='9' height='28' rx='3.5' fill='#0a84ff'/></svg>";
/* Aufklappbare Erklärungs-Karte im Quiz-Screen (Design 2026) */
const EXPLAIN_BULB = "<svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c.7.7 1 1.3 1 2h6c0-.7.3-1.3 1-2a6 6 0 0 0-4-10z'/></svg>";
const EXPLAIN_CARET = "<svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>";
const MIC_SVG = "<svg viewBox='0 0 24 24' width='34' height='34' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><rect x='9' y='2.5' width='6' height='11' rx='3'/><path d='M5.5 11a6.5 6.5 0 0 0 13 0'/><path d='M12 17.5V21M8.5 21h7'/></svg>";
/* Schlanke CI-Icons statt Emojis (currentColor erbt die jeweilige Textfarbe) */
const IC_REDO = "<svg viewBox='0 0 24 24' width='15' height='15' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M20 11a8 8 0 1 0-2.3 6'/><path d='M20 4v6h-6'/></svg>";
const IC_BOOK = "<svg viewBox='0 0 24 24' width='15' height='15' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15.5H5.5A1.5 1.5 0 0 0 4 21z'/><path d='M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15.5h5.5A1.5 1.5 0 0 1 20 21z'/></svg>";
const IC_SPK = "<svg viewBox='0 0 24 24' width='14' height='14' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M4 9.5v5h3.5L13 19V5L7.5 9.5z'/><path d='M16.5 8.8a4.5 4.5 0 0 1 0 6.4'/></svg>";
const IC_PAUSE = "<svg viewBox='0 0 24 24' width='14' height='14' fill='currentColor' aria-hidden='true'><rect x='6' y='5' width='4' height='14' rx='1.2'/><rect x='14' y='5' width='4' height='14' rx='1.2'/></svg>";
const IC_PLAY = "<svg viewBox='0 0 24 24' width='14' height='14' fill='currentColor' aria-hidden='true'><path d='M8 5.2v13.6L19 12z'/></svg>";
const IC_TAP = "<svg viewBox='0 0 24 24' width='14' height='14' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M9 11.5V5.5a1.5 1.5 0 0 1 3 0V11'/><path d='M12 10.5V9a1.5 1.5 0 0 1 3 0v2'/><path d='M15 11v-.5a1.5 1.5 0 0 1 3 0V15a5 5 0 0 1-5 5h-1a4 4 0 0 1-3-1.4L6.2 15a1.6 1.6 0 0 1 2.4-2.1L9 13.3'/></svg>";
const IC_PENCIL = "<svg viewBox='0 0 24 24' width='15' height='15' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M14.5 5.5l4 4M4 20l1-4L16 5a2 2 0 0 1 3 3L8 19z'/></svg>";
const IC_LIST = "<svg viewBox='0 0 24 24' width='16' height='16' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M9 6h11M9 12h11M9 18h11'/><path d='M4 6h.01M4 12h.01M4 18h.01'/></svg>";
const IC_SPARK = "<svg viewBox='0 0 24 24' width='15' height='15' fill='none' stroke='currentColor' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M12 3l1.7 5.1a3 3 0 0 0 1.9 1.9L21 12l-5.4 1.7a3 3 0 0 0-1.9 1.9L12 21l-1.7-5.4a3 3 0 0 0-1.9-1.9L3 12l5.4-1.7a3 3 0 0 0 1.9-1.9z'/></svg>";
function txtIco(svg, label) {
  return React.createElement(React.Fragment, null, React.createElement("span", { className: "txtico", dangerouslySetInnerHTML: { __html: svg } }), " ", label);
}
const IC_FLAG = "<svg viewBox='0 0 24 24' width='13' height='13' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M5 21V4M5 4c3-2 6 2 9 0s5-1 5-1v9s-2 1-5 1-6-2-9 0'/></svg>";
const APP_VER = (() => { try { const sc = [...document.scripts].find(x => /app\.js/.test(x.src || "")); const m = sc && sc.src.match(/[?&]v=([\w.-]+)/); return m ? m[1] : ""; } catch (e) { return ""; } })();
// Nutzer-Meldung an die Edge-Function 'report' (speichert + mailt an hello@). Best effort.
function sendReport(payload) {
  try {
    const u = window.__supaUser || null;
    const body = Object.assign({ app_version: APP_VER }, payload || {});
    if (u) { body.user_id = u.id; body.user_email = u.email; }
    if (window.__supa && window.__supa.functions) return window.__supa.functions.invoke("report", { body });
  } catch (e) {}
  return Promise.resolve();
}
/* Melde-Sheet: falscher/komischer Inhalt oder allgemeines Feedback */
function ReportSheet({ ctx, onClose }) {
  const h = React.createElement;
  const isSentence = ctx.kind === "sentence";
  const [reason, setReason] = useState(isSentence ? "" : "feedback");
  const [note, setNote] = useState("");
  const [shot, setShot] = useState(null);
  const [sent, setSent] = useState(false);
  const reasons = [["grammar", tr("r_grammar")], ["unnatural", tr("r_unnatural")], ["translation", tr("r_translation")], ["other", tr("r_other")]];
  function pickShot(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f || !/^image\//.test(f.type)) return;
    const img = new Image();
    img.onload = function () {
      const max = 1200;
      let w = img.width, hh = img.height;
      if (w > max || hh > max) { const sc = max / Math.max(w, hh); w = Math.round(w * sc); hh = Math.round(hh * sc); }
      const cv = document.createElement("canvas"); cv.width = w; cv.height = hh;
      cv.getContext("2d").drawImage(img, 0, 0, w, hh);
      try { setShot(cv.toDataURL("image/jpeg", 0.7)); } catch (er) {}
      try { URL.revokeObjectURL(img.src); } catch (er) {}
    };
    img.src = URL.createObjectURL(f);
  }
  function submit() {
    sendReport({ kind: ctx.kind, lang: ctx.lang, reason: reason || "feedback", note: note, screenshot: shot, verb: ctx.verb, tense: ctx.tense, pronoun: ctx.pronoun, sentence: ctx.sentence, translation: ctx.translation });
    setSent(true);
    setTimeout(onClose, 1300);
  }
  return h("div", { className: "chpick-bg", onClick: onClose },
    h("div", { className: "chpick chrep", onClick: e => e.stopPropagation() },
      sent
        ? h("p", { className: "chrep-thanks" }, "✓ ", tr("report_thanks"))
        : h(React.Fragment, null,
            h("div", { className: "chpick-hd" }, h("b", null, isSentence ? tr("report_title") : tr("report_general")), h("button", { className: "chpick-x", "aria-label": "close", onClick: onClose }, "×")),
            isSentence && ctx.sentence ? h("p", { className: "chrep-sent" }, ctx.sentence) : null,
            isSentence ? h("div", { className: "chrep-reasons" }, reasons.map(r => h("button", { key: r[0], className: "chrep-reason" + (reason === r[0] ? " on" : ""), onClick: () => setReason(r[0]) }, r[1]))) : null,
            h("textarea", { className: "chrep-note", value: note, placeholder: tr("report_note"), onChange: e => setNote(e.target.value), rows: 3 }),
            shot
              ? h("div", { style: { position: "relative", display: "inline-block", marginTop: "8px" } },
                  h("img", { src: shot, alt: "", style: { maxWidth: "128px", maxHeight: "128px", borderRadius: "10px", border: "1px solid var(--border)", display: "block" } }),
                  h("button", { "aria-label": "remove", onClick: () => setShot(null), style: { position: "absolute", top: "-8px", right: "-8px", width: "24px", height: "24px", borderRadius: "50%", border: "none", background: "var(--text)", color: "var(--bg)", fontSize: "15px", lineHeight: "24px", cursor: "pointer" } }, "×"))
              : h("label", { style: { display: "inline-flex", alignItems: "center", gap: "8px", marginTop: "8px", padding: "10px 15px", borderRadius: "12px", border: "2px solid transparent", background: "linear-gradient(var(--surface-2),var(--surface-2)) padding-box, linear-gradient(90deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff) border-box", color: "var(--text)", fontSize: "13.5px", fontWeight: 700, cursor: "pointer" } },
                  h("span", { style: { display: "inline-flex" }, dangerouslySetInnerHTML: { __html: MENU_SVG["✉"].replace("width='20' height='20'", "width='17' height='17'") } }),
                  tr("report_attach"),
                  h("input", { type: "file", accept: "image/*", onChange: pickShot, style: { display: "none" } })),
            h("p", { style: { fontSize: "12px", color: "var(--muted)", margin: "8px 0 0" } }, tr("report_shot_hint")),
            h("button", { className: "quizbtn check chrep-send", disabled: isSentence && !reason && !note.trim() && !shot, onClick: submit }, tr("report_send")))));
}
function quizExplainHtml(mode) {
  const parts = [1, 2, 3, 4].map(n => {
    const k = "hint_quiz_" + mode + "_" + n;
    const v = tr(k);
    return v === k ? "" : v;
  }).filter(Boolean);
  return parts.length ? parts.join(" ") : tr("mdesc_" + mode);
}
function ExplainCard({ title, html, seenKey }) {
  const [open, setOpen] = useState(() => !recall(seenKey, false));
  useEffect(() => { persist(seenKey, true); }, [seenKey]);
  const h = React.createElement;
  return h("div", { className: "explaincard" + (open ? " open" : "") },
    h("button", { className: "explaincard-hd", onClick: () => setOpen(o => !o) },
      h("span", { className: "explaincard-ic", dangerouslySetInnerHTML: { __html: EXPLAIN_BULB } }),
      h("span", { className: "explaincard-t" }, title),
      h("span", { className: "explaincard-car", dangerouslySetInnerHTML: { __html: EXPLAIN_CARET } })),
    h("div", { className: "explaincard-body", dangerouslySetInnerHTML: { __html: html } }));
}
function QuizTip({ formation, irregular, vtrans, strans }) {
  const [open, setOpen] = useState(false);
  const h = React.createElement;
  const hasVtrans = vtrans && vtrans !== "…";
  if (!formation && !irregular && !hasVtrans && !strans) return null;
  return h("div", { className: "quiztip" + (open ? " open" : "") },
    h("button", { className: "quiztip-hd", type: "button", onClick: e => { e.stopPropagation(); setOpen(o => !o); } },
      h("span", { className: "quiztip-ic", dangerouslySetInnerHTML: { __html: EXPLAIN_BULB } }),
      h("span", { className: "quiztip-t" }, tr("tip_label")),
      h("span", { className: "quiztip-car", dangerouslySetInnerHTML: { __html: EXPLAIN_CARET } })),
    h("div", { className: "quiztip-body" },
      hasVtrans ? h("div", null, h("span", { className: "quiztip-k" }, tr("tip_meaning") + ": "), h("b", null, vtrans)) : null,
      strans ? h("div", null, h("span", { className: "quiztip-k" }, tr("tip_sentence") + ": "), h("b", null, strans)) : null,
      formation ? h("div", null, h("span", { className: "quiztip-k" }, tr("how_formed") + ": "), h("b", null, formation)) : null,
      h("div", null, irregular ? tr("irregular") : tr("regular"))));
}
const FEATURE_HINTS = {
  learn: {
    svg: HINT_ICON_OPEN + "<path d='M2.5 9 12 4.5 21.5 9 12 13.5z'/><path d='M6 11v4.4c0 1.1 2.7 2.4 6 2.4s6-1.3 6-2.4V11'/></svg>"
  },
  quiz_cards: {
    svg: HINT_ICON_OPEN + "<rect x='3' y='6' width='13' height='14' rx='2'/><path d='M8 3h11a2 2 0 0 1 2 2v12'/></svg>"
  },
  quiz_choice: {
    svg: HINT_ICON_OPEN + "<path d='M10 7h10M10 12h10M10 17h10'/><path d='M4.4 7 5.3 8 7 6M4.4 12l.9 1L7 11M4.4 17l.9 1L7 16'/></svg>"
  },
  quiz_type: {
    svg: HINT_ICON_OPEN + "<rect x='3' y='6' width='18' height='12' rx='2'/><path d='M7 10h.01M11 10h.01M15 10h.01M8 14h8'/></svg>"
  },
  quiz_speak: {
    svg: HINT_ICON_OPEN + "<rect x='9' y='3' width='6' height='11' rx='3'/><path d='M6 11a6 6 0 0 0 12 0M12 17v4'/></svg>"
  },
  quiz_texte: {
    svg: HINT_ICON_OPEN + "<path d='M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z'/><path d='M14 3v4h4M9 13h6M9 17h4'/></svg>"
  },
  quiz_speed: {
    svg: HINT_ICON_OPEN + "<path d='M13 2 4 14h7l-1 8 9-12h-7z'/></svg>"
  },
  saved_verbs: {
    svg: HINT_ICON_OPEN + "<path d='M18 20.5 12 16l-6 4.5V5.6A1.6 1.6 0 0 1 7.6 4h8.8A1.6 1.6 0 0 1 18 5.6z'/></svg>"
  },
  saved_vocab: {
    svg: HINT_ICON_OPEN + "<rect x='5' y='3' width='14' height='18' rx='2'/><path d='M9 3v18M13 8h3M13 12h3'/></svg>"
  }
};
function FeatureHint({
  kind,
  onClose
}) {
  const meta = FEATURE_HINTS[kind] || FEATURE_HINTS.learn;
  return /*#__PURE__*/React.createElement("div", {
    className: "namegate",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "namecard hintcard",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "namex",
    onClick: onClose,
    title: tr("tour_skip")
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "tourhead-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tourbadge",
    style: {
      background: "#2c2823"
    },
    dangerouslySetInnerHTML: {
      __html: meta.svg
    }
  }), /*#__PURE__*/React.createElement("h2", {
    className: "namehead",
    style: {
      margin: 0
    }
  }, tr("hint_" + kind + "_h"))), /*#__PURE__*/React.createElement("ul", {
    className: "hintlist",
    style: {
      "--col": "var(--text)"
    }
  }, [1, 2, 3, 4].map((n, i) => {
    const txt = tr("hint_" + kind + "_" + n);
    if (!txt || txt === "hint_" + kind + "_" + n) return null;
    return /*#__PURE__*/React.createElement("li", {
      key: n,
      style: {
        animationDelay: 0.06 + i * 0.09 + "s"
      },
      dangerouslySetInnerHTML: {
        __html: txt
      }
    });
  })), /*#__PURE__*/React.createElement("button", {
    className: "namebtn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("span", {
    className: "cta-rainbow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "cta-label"
  }, tr("got_it")))));
}
const UI_LOCALE = {
  de: "de-DE",
  en: "en-GB",
  es: "es-ES",
  nl: "nl-NL",
  fr: "fr-FR"
};
function fmtDate(iso) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString(UI_LOCALE[UILANG] || "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/* ---------- App ---------- */
/* ===== User Menu ===== */
function AccountDeletedModal({
  onClose,
  wasPremium
}) {
  const until = wasPremium?.until ? new Date(wasPremium.until) : null;
  const untilStr = until ? fmtDate(until) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(0,0,0,.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface)",
      borderRadius: "24px",
      padding: "32px 24px",
      maxWidth: "340px",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "16px",
      textAlign: "center",
      boxShadow: "0 20px 60px rgba(0,0,0,.2)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "48px",
      lineHeight: 1
    }
  }, "\uD83D\uDC4B"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "20px",
      fontWeight: 800,
      color: "var(--text)",
      letterSpacing: "-.02em",
      marginBottom: "10px"
    }
  }, tr("goodbye_heading")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "var(--muted)",
      lineHeight: 1.6
    }
  }, tr("goodbye_love"), /*#__PURE__*/React.createElement("br", null), tr("goodbye_data")), wasPremium && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "12px",
      background: "var(--surface-2)",
      borderRadius: "12px",
      padding: "12px 14px",
      fontSize: "13px",
      color: "var(--text)",
      lineHeight: 1.5,
      border: "1px solid var(--border)"
    }
  }, tr("sub_runs_until", {
    date: untilStr || tr("sub_end_period")
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: "100%",
      padding: "15px",
      borderRadius: "16px",
      border: "none",
      background: "linear-gradient(100deg,#ef1f4d,#ef6a12,#d99a00,#159a43,#0a74e6,#9542ee)",
      color: "#fff",
      fontSize: "15px",
      fontWeight: 800,
      cursor: "pointer",
      marginTop: "4px"
    }
  }, tr("goodbye_btn"))));
}
const DD_ITEM = {
  width: "100%",
  padding: "9px 10px",
  background: "none",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  textAlign: "left",
  fontSize: "13px",
  color: "var(--text)",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};
const MENU_SVG = {
  "👤":"<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='8' r='3.5'/><path d='M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6'/></svg>",
  "💎":"<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><path d='M5 3h14l3 6-10 12L2 9z'/><path d='M2 9h20'/></svg>",
  "⭐":"<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><path d='M12 4l2.3 4.9 5.2.6-3.9 3.6 1.1 5.1L12 16.1 7.2 18.8l1.1-5.1L4.4 10.1l5.2-.6z'/></svg>",
  "🔑":"<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><path d='M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4'/><path d='M10 17l5-5-5-5M15 12H3'/></svg>",
  "✉":"<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='5' width='18' height='14' rx='2'/><path d='M3.5 6.5 12 13l8.5-6.5'/></svg>"
};
function MenuRow({
  onClick,
  bg,
  glyph,
  fav,
  label,
  sub,
  danger
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      width: "100%",
      padding: "9px 8px",
      border: "none",
      background: "none",
      cursor: "pointer",
      textAlign: "left",
      borderRadius: "12px"
    }
  }, fav ? /*#__PURE__*/React.createElement("img", {
    src: "/favicon.svg",
    alt: "",
    style: {
      width: "38px",
      height: "38px",
      borderRadius: "11px",
      flexShrink: 0,
      display: "block"
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: "38px",
      height: "38px",
      borderRadius: "11px",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      color: "var(--text)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "18px",
      flexShrink: 0
    },
    dangerouslySetInnerHTML: MENU_SVG[glyph] ? { __html: MENU_SVG[glyph] } : undefined
  }, MENU_SVG[glyph] ? null : glyph), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: "13.5px",
      color: danger ? "#e0245e" : "var(--text)",
      lineHeight: 1.25
    }
  }, label), sub && /*#__PURE__*/React.createElement("small", {
    style: {
      display: "block",
      color: "var(--muted)",
      fontSize: "11px",
      marginTop: "2px"
    }
  }, sub)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted)",
      opacity: 0.45,
      fontSize: "17px",
      flexShrink: 0
    }
  }, "\u203A"));
}
function UserChip({
  avatar,
  label,
  onClick,
  nav
}) {
  if (nav) {
    return /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: onClick,
      className: "tab tabprofile"
    }, /*#__PURE__*/React.createElement("span", {
      className: "tabprofile-av"
    }, avatar), /*#__PURE__*/React.createElement("span", {
      className: "tab-label"
    }, tr("profile")));
  }
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      background: "none",
      border: "1px solid var(--border)",
      borderRadius: "20px",
      padding: "3px 9px 3px 4px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "5px",
      fontFamily: "inherit"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-greet",
    style: {
      pointerEvents: "none",
      fontSize: "13.5px",
      fontWeight: 800
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "9px",
      color: "var(--muted)",
      pointerEvents: "none"
    }
  }, "\u25BE"));
}
function UserMenu({
  user,
  greet,
  name,
  isPremium,
  premiumUntil,
  onDeleted,
  onEditName,
  onTarife,
  onPin,
  nav
}) {
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
    if (!open) return;
    function onClickOut(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onClickOut);
    return () => document.removeEventListener("pointerdown", onClickOut);
  }, [open]);
  function openPanel(p) {
    setPanel(p);
    setOpen(false);
    setDeleteErr("");
    setCancelErr("");
  }
  async function cancelSubscription() {
    setCancelling(true);
    setCancelErr("");
    try {
      const {
        data,
        error
      } = await window.__supa.functions.invoke("cancel-subscription");
      if (error) throw new Error(error.message || "Fehler");
      setCancelledUntil(data?.premiumUntil || premiumUntil || null);
      setPanel(null);
    } catch (e) {
      setCancelErr(e.message || tr("err_cancel_fail"));
    }
    setCancelling(false);
  }
  async function deleteAccount() {
    setDeleting(true);
    setDeleteErr("");
    try {
      const {
        data,
        error
      } = await window.__supa.functions.invoke("delete-account");
      if (error) throw new Error(error.message || "Fehler");
      await window.__supa.auth.signOut();
      if (onDeleted) onDeleted(data);
    } catch (e) {
      setDeleteErr(e.message || tr("err_delete_fail"));
      setDeleting(false);
    }
  }
  const avatar = /*#__PURE__*/React.createElement("div", {
    style: {
      width: "22px",
      height: "22px",
      borderRadius: "50%",
      background: "linear-gradient(100deg,#ef1f4d,#ef6a12,#d99a00,#159a43,#0a74e6,#9542ee)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      fontWeight: 800,
      color: "#fff",
      flexShrink: 0
    }
  }, initial);

  // Days remaining on active subscription
  const activeUntil = cancelledUntil || premiumUntil;
  const daysLeft = activeUntil ? Math.max(0, Math.ceil((new Date(activeUntil) - Date.now()) / 86400000)) : 0;
  const untilStr = activeUntil ? fmtDate(new Date(activeUntil)) : null;
  const hasActiveSub = isPremium && !cancelledUntil; // paid and not yet cancelled

  const __ov = (...kids) => /*#__PURE__*/React.createElement("div", {
    onClick: () => setPanel(null),
    style: { position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "color-mix(in srgb, var(--bg) 80%, rgba(0,0,0,0.45))" }
  }, /*#__PURE__*/React.createElement("div", {
    className: "namecard",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", { className: "namex", onClick: () => setPanel(null) }, "×"), ...kids));
  const __ttl = (t, col) => /*#__PURE__*/React.createElement("div", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "21px", letterSpacing: "-0.02em", margin: "4px 0 0", color: col || "var(--text)" } }, t);
  const __body = (t) => /*#__PURE__*/React.createElement("div", { style: { fontSize: "13.5px", lineHeight: 1.55, color: "var(--muted)", margin: "8px 0 0", textAlign: "center" } }, t);
  const __err = (t) => t && /*#__PURE__*/React.createElement("div", { style: { fontSize: "12px", color: "#ff453a", marginTop: "10px" } }, t);
  const __ico = (e) => /*#__PURE__*/React.createElement("div", { style: { fontSize: "30px", lineHeight: 1, marginBottom: "2px" } }, e);
  const __primary = (label, fn, dis, bg, shadow) => /*#__PURE__*/React.createElement("button", { onClick: fn, disabled: dis, className: "namebtn", style: { background: bg, marginTop: "18px", boxShadow: shadow } }, /*#__PURE__*/React.createElement("span", { className: "cta-label" }, label));
  const __text = (label, fn) => /*#__PURE__*/React.createElement("button", { onClick: fn, style: { width: "100%", marginTop: "10px", padding: "9px", background: "none", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "var(--muted)" } }, label);
  const __BRAND = "linear-gradient(100deg,#ef1f4d,#ef6a12,#d99a00,#159a43,#0a74e6,#9542ee)";
  const __BSHADOW = "0 14px 30px -12px rgba(165,87,255,.55)";
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(UserChip, {
    avatar: avatar,
    label: greet,
    nav: nav,
    onClick: () => { setPanel(null); setOpen(o => !o); }
  }), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: nav ? "absolute" : "fixed",
      left: nav ? "auto" : "10px",
      right: nav ? "0" : "auto",
      top: nav ? "auto" : "calc(env(safe-area-inset-top, 0px) + 52px)",
      bottom: nav ? "calc(100% + 10px)" : "auto",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      boxShadow: "0 8px 28px rgba(0,0,0,.13)",
      padding: "8px",
      width: "min(300px, calc(100vw - 20px))",
      maxHeight: "calc(100dvh - 140px)",
      overflowY: "auto",
      zIndex: 100000
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "6px 10px 8px",
      borderBottom: "1px solid var(--border)",
      marginBottom: "4px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--muted)"
    }
  }, tr("menu_logged_in")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "12px",
      fontWeight: "600",
      wordBreak: "break-all"
    }
  }, user.email)), panel === null && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(MenuRow, {
    onClick: () => {
      onEditName && onEditName();
      setOpen(false);
    },
    bg: "#f1ecff",
    glyph: "👤",
    label: tr("menu_edit_profile"),
    sub: tr("msub_profil")
  }), /*#__PURE__*/React.createElement(MenuRow, {
    onClick: () => {
      onPin && onPin();
      setOpen(false);
    },
    fav: true,
    label: tr("menu_pin"),
    sub: tr("msub_pin")
  }), /*#__PURE__*/React.createElement(MenuRow, {
    onClick: () => {
      onTarife && onTarife();
      setOpen(false);
    },
    bg: "#efeaff",
    glyph: "💎",
    label: tr("menu_tarife"),
    sub: tr("msub_tarife")
  }), /*#__PURE__*/React.createElement(MenuRow, {
    onClick: () => {
      rateApp();
      setOpen(false);
    },
    bg: "#fff4e0",
    glyph: "⭐",
    label: tr("menu_rate"),
    sub: tr("msub_rate")
  }), /*#__PURE__*/React.createElement(MenuRow, {
    onClick: () => {
      window.__openReport && window.__openReport({ kind: "general" });
      setOpen(false);
    },
    bg: "#eaf6ff",
    glyph: "✉",
    label: tr("report_general"),
    sub: tr("report_general_sub")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: "1px",
      background: "var(--border)",
      margin: "3px 0"
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      window.__supa.auth.signOut();
      setOpen(false);
    },
    style: DD_ITEM
  }, /*#__PURE__*/React.createElement("span", { style: { display: "inline-flex", width: "18px", height: "18px", verticalAlign: "-3px", marginRight: "2px" }, dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><path d='M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3'/><path d='M16 16l4-4-4-4M20 12H9'/></svg>" } }), " ", tr("menu_logout")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: "1px",
      background: "var(--border)",
      margin: "3px 0"
    }
  }), hasActiveSub && /*#__PURE__*/React.createElement("button", {
    onClick: () => openPanel("cancel"),
    style: DD_ITEM
  }, /*#__PURE__*/React.createElement("span", { style: { display: "inline-flex", width: "18px", height: "18px", verticalAlign: "-3px", marginRight: "2px" }, dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><path d='M6.5 9a5.5 5.5 0 0 1 11 0c0 5 2.2 6.5 2.2 6.5H4.3S6.5 14 6.5 9z'/><path d='M10.2 19a2 2 0 0 0 3.6 0'/></svg>" } }), " ", tr("menu_cancel_sub")), isPremium && cancelledUntil && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "7px 10px",
      fontSize: "12px",
      color: "var(--muted)",
      lineHeight: 1.5
    }
  }, tr("menu_sub_active_until", {
    date: untilStr
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => openPanel("delete"),
    style: {
      ...DD_ITEM,
      color: "#ff453a"
    }
  }, /*#__PURE__*/React.createElement("span", { style: { display: "inline-flex", width: "18px", height: "18px", verticalAlign: "-3px", marginRight: "2px" }, dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='18' height='18' fill='none' stroke='currentColor' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><path d='M4 7h16M9 7V5.4A1.4 1.4 0 0 1 10.4 4h3.2A1.4 1.4 0 0 1 15 5.4V7'/><path d='M6 7l1 13a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 20l1-13'/><path d='M10 11v6M14 11v6'/></svg>" } }), " ", tr("menu_delete_acc")))), panel === "cancel" && __ov(
    __ico("🔔"),
    __ttl(tr("cancel_title")),
    __body(tr("cancel_body", { date: untilStr })),
    __err(cancelErr),
    __primary(tr("cancel_no"), () => setPanel(null), false, __BRAND, __BSHADOW),
    __text(cancelling ? "…" : tr("cancel_yes"), cancelSubscription)
  ), panel === "delete" && __ov(
    __ico("🗑"),
    __ttl(tr("delete_title"), "#ff453a"),
    hasActiveSub ? /*#__PURE__*/React.createElement(React.Fragment, null,
      /*#__PURE__*/React.createElement("div", { style: { background: "rgba(255,69,58,0.08)", border: "1px solid rgba(255,69,58,0.25)", borderRadius: "12px", padding: "11px 13px", margin: "12px 0 0", fontSize: "12.5px", lineHeight: 1.5, textAlign: "left" } },
        /*#__PURE__*/React.createElement("div", { style: { fontWeight: 700, color: "#ff453a", marginBottom: "3px" } }, tr("delete_warn_days", { n: daysLeft })),
        /*#__PURE__*/React.createElement("div", { style: { color: "var(--muted)" } }, tr("delete_warn_body", { date: untilStr }))
      ),
      __err(deleteErr),
      __primary(tr("delete_cancel_first"), () => openPanel("cancel"), false, __BRAND, __BSHADOW),
      /*#__PURE__*/React.createElement("button", { onClick: deleteAccount, disabled: deleting, style: { width: "100%", marginTop: "10px", padding: "13px", background: "rgba(255,69,58,0.1)", border: "1.5px solid #ff453a", borderRadius: "14px", cursor: "pointer", fontSize: "14px", fontWeight: "700", color: "#ff453a", fontFamily: "var(--font-display)" } }, deleting ? "…" : tr("delete_anyway")),
      __text(tr("cancel_no"), () => setPanel(null))
    ) : /*#__PURE__*/React.createElement(React.Fragment, null,
      __body(tr("delete_data")),
      __err(deleteErr),
      __primary(deleting ? "…" : tr("delete_yes"), deleteAccount, deleting, "#ff453a", "0 14px 30px -12px rgba(255,69,58,.5)"),
      __text(tr("cancel_no"), () => setPanel(null))
    )
  ));
}
function GuestMenu({
  name,
  greet,
  onLogin,
  onEditName,
  onTarife,
  onPin,
  nav
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    function onClickOut(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onClickOut);
    return () => document.removeEventListener("pointerdown", onClickOut);
  }, [open]);
  const avatar = /*#__PURE__*/React.createElement("div", {
    style: {
      width: "22px",
      height: "22px",
      borderRadius: "50%",
      background: "linear-gradient(100deg,#ef1f4d,#ef6a12,#d99a00,#159a43,#0a74e6,#9542ee)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "10px",
      fontWeight: 800,
      color: "#fff",
      flexShrink: 0
    }
  }, (name || "").trim().charAt(0).toUpperCase() || "★");
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(UserChip, {
    avatar: avatar,
    label: greet,
    nav: nav,
    onClick: () => setOpen(o => !o)
  }), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: nav ? "absolute" : "fixed",
      left: nav ? "auto" : "10px",
      right: nav ? "0" : "auto",
      top: nav ? "auto" : "calc(env(safe-area-inset-top, 0px) + 52px)",
      bottom: nav ? "calc(100% + 10px)" : "auto",
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "16px",
      boxShadow: "0 8px 28px rgba(0,0,0,.13)",
      padding: "8px",
      width: "min(300px, calc(100vw - 20px))",
      maxHeight: "calc(100dvh - 140px)",
      overflowY: "auto",
      zIndex: 100000
    }
  }, /*#__PURE__*/React.createElement(MenuRow, {
    onClick: () => {
      onLogin();
      setOpen(false);
    },
    bg: "#fde9f3",
    glyph: "🔑",
    label: tr("menu_login"),
    sub: tr("msub_konto")
  }), /*#__PURE__*/React.createElement(MenuRow, {
    onClick: () => {
      onEditName();
      setOpen(false);
    },
    bg: "#f1ecff",
    glyph: "👤",
    label: tr("menu_edit_profile"),
    sub: tr("msub_profil")
  }), /*#__PURE__*/React.createElement(MenuRow, {
    onClick: () => {
      onPin();
      setOpen(false);
    },
    fav: true,
    label: tr("menu_pin"),
    sub: tr("msub_pin")
  }), /*#__PURE__*/React.createElement(MenuRow, {
    onClick: () => {
      onTarife();
      setOpen(false);
    },
    bg: "#efeaff",
    glyph: "💎",
    label: tr("menu_tarife"),
    sub: tr("msub_tarife")
  }), /*#__PURE__*/React.createElement(MenuRow, {
    onClick: () => {
      rateApp();
      setOpen(false);
    },
    bg: "#fff4e0",
    glyph: "⭐",
    label: tr("menu_rate"),
    sub: tr("msub_rate")
  })));
}

/* ===== Login Modal ===== */
function LoginModal({
  onClose,
  fromPayment
}) {
  const [mode, setMode] = useState(fromPayment ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState(() => recall("kunju-name", ""));
  const knownName = (recall("kunju-name", "") || "").trim();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const emailRef = useRef(null);
  useEffect(() => {
    setTimeout(() => emailRef.current && emailRef.current.focus(), 200);
  }, []);
  // Supabase-Fehler in eine verständliche Meldung in der UI-Sprache übersetzen.
  function friendlyAuthErr(e) {
    const code = (e && (e.code || e.error_code)) || "";
    const msg = ((e && e.message) || "").toLowerCase();
    const status = e && e.status;
    const L = UILANG;
    const pick = m => m[L] || m.en;
    if (code === "over_email_send_rate_limit" || status === 429 || msg.includes("rate limit")) {
      return pick({
        de: "Zu viele Anmelde-Versuche in kurzer Zeit. Bitte in etwa einer Stunde noch einmal versuchen.",
        en: "Too many attempts in a short time. Please try again in about an hour.",
        es: "Demasiados intentos en poco tiempo. Inténtalo de nuevo en aproximadamente una hora.",
        fr: "Trop de tentatives en peu de temps. Réessaie dans environ une heure.",
        nl: "Te veel pogingen in korte tijd. Probeer het over ongeveer een uur opnieuw."
      });
    }
    if (msg.includes("already registered") || msg.includes("already been registered") || code === "user_already_exists") {
      return pick({
        de: "Diese E-Mail ist bereits registriert. Melde dich an oder setze dein Passwort zurück.",
        en: "This email is already registered. Log in or reset your password.",
        es: "Este correo ya está registrado. Inicia sesión o restablece tu contraseña.",
        fr: "Cet e-mail est déjà enregistré. Connecte-toi ou réinitialise ton mot de passe.",
        nl: "Dit e-mailadres is al geregistreerd. Log in of stel je wachtwoord opnieuw in."
      });
    }
    if (code === "invalid_credentials" || msg.includes("invalid login credentials")) {
      return pick({
        de: "E-Mail oder Passwort stimmt nicht.",
        en: "Email or password is incorrect.",
        es: "El correo o la contraseña no son correctos.",
        fr: "L’e-mail ou le mot de passe est incorrect.",
        nl: "E-mailadres of wachtwoord klopt niet."
      });
    }
    return (e && e.message) || "Fehler";
  }
  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const supa = window.__supa;
      if (mode === "reset") {
        const {
          error
        } = await supa.auth.resetPasswordForEmail(email, {
          redirectTo: "https://conjuexpert.app"
        });
        if (error) throw error;
        setDone(true);
      } else if (mode === "login") {
        const {
          error
        } = await supa.auth.signInWithPassword({
          email,
          password: pw
        });
        if (error) throw error;
        onClose();
      } else {
        const fn = firstName.trim();
        if (!fn) {
          setErr(tr("your_name"));
          setLoading(false);
          return;
        }
        const {
          error
        } = await supa.auth.signUp({
          email,
          password: pw,
          options: {
            data: {
              first_name: fn
            }
          }
        });
        if (error) throw error;
        persist("kunju-name", fn);
        setDone(true);
      }
    } catch (e) {
      setErr(friendlyAuthErr(e));
    }
    setLoading(false);
  }
  const headings = {
    login: tr("login_welcome_back"),
    signup: fromPayment ? (knownName ? tr("login_almost_done").replace(/\s*[!！。.]+\s*$/, "") + ", " + knownName + "!" : tr("login_almost_done")) : tr("login_create_acct"),
    reset: tr("login_reset_pw")
  };
  const subs = {
    login: fromPayment ? tr("login_sub_login_pay") : tr("login_sub_login"),
    signup: fromPayment ? tr("login_sub_signup_pay") : tr("login_sub_signup"),
    reset: tr("login_sub_reset")
  };
  const doneText = {
    signup: {
      icon: "📧",
      msg: tr("login_done_signup")
    },
    reset: {
      icon: "🔑",
      msg: tr("login_done_reset")
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "namegate",
    onClick: e => {
      if (e.target === e.currentTarget) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "namecard"
  }, /*#__PURE__*/React.createElement("button", {
    className: "namex",
    onClick: onClose
  }, "\xD7"), /*#__PURE__*/React.createElement("span", {
    className: "brand-mark big"
  }, RAINBOW.slice(0, 5).map((c, i) => /*#__PURE__*/React.createElement("i", {
    key: i,
    style: {
      background: c
    }
  }))), /*#__PURE__*/React.createElement("h2", {
    className: "namehead"
  }, headings[mode]), /*#__PURE__*/React.createElement("p", {
    className: "namesub"
  }, subs[mode]), done ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "12px 0 8px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "42px",
      marginBottom: "10px"
    }
  }, (doneText[mode] || doneText.signup).icon), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 16px",
      color: "var(--muted)",
      fontSize: "14px",
      whiteSpace: "pre-line"
    }
  }, (doneText[mode] || doneText.signup).msg), /*#__PURE__*/React.createElement("button", {
    className: "namebtn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("span", {
    className: "cta-rainbow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "cta-label"
  }, "OK"))) : /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    style: {
      width: "100%"
    }
  }, mode === "signup" && !knownName && /*#__PURE__*/React.createElement("input", {
    type: "text",
    name: "given-name",
    "aria-label": tr("your_name"),
    placeholder: tr("your_name"),
    value: firstName,
    onChange: e => setFirstName(e.target.value),
    required: true,
    maxLength: 40,
    className: "nameinput",
    style: {
      marginBottom: "10px",
      fontWeight: 400,
      fontSize: "16px"
    },
    autoComplete: "given-name"
  }), /*#__PURE__*/React.createElement("input", {
    ref: emailRef,
    type: "email",
    name: "email",
    "aria-label": "E-Mail",
    placeholder: "E-Mail",
    value: email,
    onChange: e => setEmail(e.target.value),
    required: true,
    className: "nameinput",
    style: {
      marginBottom: "10px",
      fontWeight: 400,
      fontSize: "16px"
    },
    autoComplete: "email"
  }), mode !== "reset" && /*#__PURE__*/React.createElement("input", {
    type: "password",
    name: "password",
    "aria-label": tr("login_pw_ph"),
    placeholder: tr("login_pw_ph"),
    value: pw,
    onChange: e => setPw(e.target.value),
    required: true,
    minLength: "6",
    className: "nameinput",
    style: {
      marginBottom: mode === "login" ? "6px" : "14px",
      fontWeight: 400,
      fontSize: "16px"
    },
    autoComplete: mode === "login" ? "current-password" : "new-password"
  }), mode === "login" && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "12px",
      textAlign: "right",
      margin: "0 0 12px",
      color: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => {
      setMode("reset");
      setErr("");
      setPw("");
    },
    style: {
      cursor: "pointer",
      textDecoration: "underline"
    }
  }, tr("login_forgot_pw"))), mode === "reset" && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "14px"
    }
  }), err && /*#__PURE__*/React.createElement("p", {
    style: {
      color: "#ff453a",
      fontSize: "13px",
      margin: "0 0 10px",
      textAlign: "left"
    }
  }, err), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    className: "namebtn",
    disabled: loading
  }, /*#__PURE__*/React.createElement("span", {
    className: "cta-rainbow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "cta-label"
  }, loading ? "…" : mode === "login" ? tr("sign_in") : mode === "signup" ? tr("login_btn_signup") : tr("login_btn_reset")))), !done && mode !== "reset" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      width: "100%",
      margin: "4px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: "1px",
      background: "var(--border)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "12px",
      color: "var(--muted)"
    }
  }, tr("login_or")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: "1px",
      background: "var(--border)"
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: async () => {
      await window.__supa.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://conjuexpert.app"
        }
      });
    },
    style: {
      width: "100%",
      padding: "12px",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      color: "var(--text)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "#4285F4",
    d: "M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#34A853",
    d: "M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#FBBC05",
    d: "M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "#EA4335",
    d: "M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"
  })), tr("login_google")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "13px",
      marginTop: "12px",
      color: "var(--muted)"
    }
  }, mode === "login" ? tr("login_no_account") + " " : tr("login_has_account") + " ", /*#__PURE__*/React.createElement("span", {
    onClick: () => {
      setMode(mode === "login" ? "signup" : "login");
      setErr("");
    },
    style: {
      color: "var(--tc,#a557ff)",
      cursor: "pointer",
      textDecoration: "underline"
    }
  }, mode === "login" ? tr("login_do_register") : tr("sign_in")))), !done && mode === "reset" && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "13px",
      marginTop: "12px",
      color: "var(--muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => {
      setMode("login");
      setErr("");
    },
    style: {
      color: "var(--tc,#a557ff)",
      cursor: "pointer",
      textDecoration: "underline"
    }
  }, tr("login_back"))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "11px",
      color: "var(--muted)",
      marginTop: "8px",
      opacity: 0.7
    }
  }, tr("login_data"))));
}

/* ---------- Monetization ---------- */
const M_PRICE = 2.99;
const A_PRICE_BONUS = 24.99;
const A_PRICE_FULL = 29.99;
const A_EQ = +(M_PRICE * 12).toFixed(2);
const BONUS_MS = 7 * 24 * 60 * 60 * 1000;
(function () {
  if (!recall("kunju-first-open", null)) persist("kunju-first-open", Date.now());
})();
function isBonusActive() {
  const first = recall("kunju-first-open", null);
  if (!first) return false;
  return Date.now() - first < BONUS_MS;
}
function getAPrice() {
  return isBonusActive() ? A_PRICE_BONUS : A_PRICE_FULL;
}
function getASave() {
  return +(A_EQ - getAPrice()).toFixed(2);
}
function getADisc() {
  return Math.round(getASave() / A_EQ * 100);
}
function fEur(n) {
  return String(n.toFixed(2)).replace(".", ",");
}
const RCTA = React.forwardRef(function RCTA({
  label,
  onClick
}, ref) {
  return /*#__PURE__*/React.createElement("button", {
    className: "rcta",
    onClick: onClick,
    ref: ref
  }, /*#__PURE__*/React.createElement("span", null, label));
});
function FeatureBox({
  rows
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "feature-box"
  }, rows.map(([label, meta], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "feature-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fcheck"
  }, "\u2713"), /*#__PURE__*/React.createElement("span", null, label), meta && /*#__PURE__*/React.createElement("span", {
    className: "fmeta"
  }, meta))));
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
  const [ms, setMs] = useState(() => {
    const f = recall("kunju-first-open", null);
    return f ? Math.max(0, f + BONUS_MS - Date.now()) : 0;
  });
  useEffect(() => {
    const t = setInterval(() => {
      const f = recall("kunju-first-open", null);
      setMs(f ? Math.max(0, f + BONUS_MS - Date.now()) : 0);
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return ms;
}
function formatCountdown(ms) {
  if (ms <= 0) return "";
  const s = Math.floor(ms / 1000),
    h = Math.floor(s / 3600),
    m = Math.floor(s % 3600 / 60),
    sec = s % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}T ${h % 24}h`;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
function PinSheet({
  onClose
}) {
  const [view, setView] = useState("choose");
  if (view === "ios") return /*#__PURE__*/React.createElement(IOSHelpModal, {
    onClose: onClose
  });
  if (view === "android") return /*#__PURE__*/React.createElement(AndroidHelpModal, {
    onClose: onClose
  });
  const RB = ["#ff3b5c", "#ff7a18", "#ffc400", "#34c759", "#0a84ff"];
  const barsSvg = `<svg viewBox="0 0 100 100" fill="none"><rect x="16" y="33" width="9" height="34" rx="3.5" fill="#ff3b5c"/><rect x="31" y="21" width="9" height="58" rx="3.5" fill="#ff8a18"/><rect x="46" y="10" width="9" height="80" rx="3.5" fill="#ffc400"/><rect x="61" y="26" width="9" height="48" rx="3.5" fill="#1fbf6b"/><rect x="76" y="36" width="9" height="28" rx="3.5" fill="#0a84ff"/></svg>`;
  const plusSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v8M8 12h8"></path></svg>`;
  const appleSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.8zM14.1 4.9c.7-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.9 1.1.1 2.2-.5 2.8-1.3z"></path></svg>`;
  const androidSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.6 9.5l1.4-2.5c.1-.1 0-.3-.1-.3-.1-.1-.3 0-.3.1l-1.4 2.5C16 8.8 14.6 8.5 13 8.5s-3 .3-4.2.8L7.4 6.8c-.1-.1-.2-.2-.3-.1-.1 0-.2.2-.1.3l1.4 2.5C5.7 11 4 13.5 4 16.5h18c0-3-1.7-5.5-4.4-7zM8.8 13.4c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7zm6.4 0c-.4 0-.7-.3-.7-.7s.3-.7.7-.7.7.3.7.7-.3.7-.7.7z"></path></svg>`;
  const h = React.createElement;
  const gh = (s2, i) => h("span", {
    key: i,
    className: "pp-gh" + (s2 ? " s2" : "")
  });
  return h("div", {
    className: "namegate",
    onClick: onClose
  }, h("div", {
    className: "pinpop",
    onClick: e => e.stopPropagation()
  }, h("button", {
    className: "pp-x",
    onClick: onClose,
    title: tr("ios_close")
  }, "×"), h("div", {
    className: "pp-head"
  }, h("span", {
    className: "pp-mark"
  }, RB.map((c, i) => h("i", {
    key: i,
    style: {
      background: c
    }
  }))), h("span", {
    className: "pp-ey"
  }, "Conju", h("b", null, "Expert"), " · ", tr("pin_tip"))), h("h2", {
    className: "pp-title"
  }, tr("pin_title")), h("p", {
    className: "pp-sub"
  }, tr("pin_sub")), h("div", {
    className: "pp-stage"
  }, h("div", {
    className: "pp-phone"
  }, h("span", {
    className: "pp-island"
  }), h("div", {
    className: "pp-screen"
  }, h("div", {
    className: "pp-sbar"
  }, h("span", null, "9:41"), h("span", null, "•••")), h("div", {
    className: "pp-grid"
  }, gh(false, 0), gh(true, 1), gh(false, 2), gh(true, 3), gh(true, 4), h("span", {
    key: "slot",
    className: "pp-slot"
  }, h("span", {
    className: "pp-slotbox",
    dangerouslySetInnerHTML: {
      __html: plusSvg
    }
  }), h("span", {
    className: "pp-slotpulse"
  }), h("span", {
    className: "pp-ce",
    dangerouslySetInnerHTML: {
      __html: barsSvg
    }
  })), gh(false, 6), gh(true, 7), gh(false, 8), gh(true, 9), gh(false, 10), gh(true, 11)), h("div", {
    className: "pp-dock"
  }, gh(false, "d0"), gh(false, "d1"), gh(false, "d2"), gh(false, "d3"))))), h("p", {
    className: "pp-bhint"
  }, tr("pin_guide_for")), h("div", {
    className: "pp-btns"
  }, h("button", {
    className: "pp-b",
    onClick: () => setView("ios")
  }, h("span", {
    dangerouslySetInnerHTML: {
      __html: appleSvg
    }
  }), "iPhone"), h("button", {
    className: "pp-b",
    onClick: () => setView("android")
  }, h("span", {
    dangerouslySetInnerHTML: {
      __html: androidSvg
    }
  }), "Android")), h("button", {
    className: "pp-skip",
    onClick: onClose
  }, tr("pin_later"))));
}
function InstallBanner({
  onInstall,
  onDismiss,
  onHow
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "install-bar",
    role: "banner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "install-bar-icon"
  }, "\uD83D\uDCF1"), /*#__PURE__*/React.createElement("span", {
    className: "install-bar-text"
  }, tr("pwa_home"), /*#__PURE__*/React.createElement("small", null, tr("pwa_nostore"))), /*#__PURE__*/React.createElement("button", {
    className: "install-bar-btn",
    onClick: onHow
  }, tr("ios_how")), /*#__PURE__*/React.createElement("button", {
    className: "install-bar-x",
    onClick: onDismiss,
    "aria-label": "Schlie\xDFen"
  }, "\u2715"));
}
function IOSInstallBanner({
  onDismiss,
  onHow
}) {
  const [help, setHelp] = useState(false);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "install-bar",
    role: "banner",
    style: {
      flexWrap: "wrap",
      gap: "8px 10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "install-bar-icon"
  }, "\uD83D\uDCF1"), /*#__PURE__*/React.createElement("span", {
    className: "install-bar-text",
    style: {
      minWidth: "180px"
    }
  }, tr("ios_homescreen"), /*#__PURE__*/React.createElement("small", null, tr("ios_share"))), /*#__PURE__*/React.createElement("button", {
    className: "install-bar-btn",
    onClick: onHow
  }, tr("ios_how")), /*#__PURE__*/React.createElement("button", {
    className: "install-bar-x",
    onClick: onDismiss,
    "aria-label": tr("ios_close")
  }, "\u2715")), help && /*#__PURE__*/React.createElement(IOSHelpModal, {
    onClose: () => setHelp(false)
  }));
}

/* Short step-by-step explainer for adding the app to the iOS home screen
   (Safari can't trigger this from a tap — the user must use the Share menu). */
function AndroidHelpModal({
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "namegate",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "namecard hintcard",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "namex",
    onClick: onClose,
    title: tr("ios_close")
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "tourhead-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tourbadge",
    style: {
      background: "#1a9b46"
    }
  }, "\U0001F916"), /*#__PURE__*/React.createElement("h2", {
    className: "namehead",
    style: {
      margin: 0
    }
  }, tr("and_help_title"))), /*#__PURE__*/React.createElement("ul", {
    className: "hintlist",
    style: {
      "--col": "#1a9b46"
    }
  }, [1, 2, 3].map((n, i) => /*#__PURE__*/React.createElement("li", {
    key: n,
    style: {
      animationDelay: 0.06 + i * 0.09 + "s"
    },
    dangerouslySetInnerHTML: {
      __html: tr("and_help_" + n)
    }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "namebtn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("span", {
    className: "cta-rainbow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "cta-label"
  }, tr("got_it")))));
}
function IOSHelpModal({
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "namegate",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "namecard hintcard",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "namex",
    onClick: onClose,
    title: tr("ios_close")
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "tourhead-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tourbadge",
    style: {
      background: "#1b1813"
    }
  }, "\uD83D\uDCF1"), /*#__PURE__*/React.createElement("h2", {
    className: "namehead",
    style: {
      margin: 0
    }
  }, tr("ios_help_title"))), /*#__PURE__*/React.createElement("ul", {
    className: "hintlist",
    style: {
      "--col": "#a557ff"
    }
  }, [1, 2, 3].map((n, i) => /*#__PURE__*/React.createElement("li", {
    key: n,
    style: {
      animationDelay: 0.06 + i * 0.09 + "s"
    },
    dangerouslySetInnerHTML: {
      __html: tr("ios_help_" + n)
    }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "namebtn",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("span", {
    className: "cta-rainbow"
  }), /*#__PURE__*/React.createElement("span", {
    className: "cta-label"
  }, tr("got_it")))));
}
function BonusBar({
  onOpen,
  trialExpiry,
  bonusActive,
  name
}) {
  const trialMs = useCountdown(trialExpiry);
  const onTrial = trialExpiry && trialMs > 0;
  const cd = formatCountdown(trialMs);
  const label = onTrial ? (name ? name + ", " : "") + tr("bonus_trial") : bonusActive ? tr("bonus_welcome") : tr("bonus_quiz");
  return /*#__PURE__*/React.createElement("button", {
    className: "c-bonusbanner",
    onClick: onOpen,
    style: {
      width: "100%",
      background: "linear-gradient(100deg,#ef1f4d,#ef6a12,#d99a00,#159a43,#0a74e6,#9542ee)",
      border: "none",
      padding: "6px 12px",
      fontSize: "12px",
      fontWeight: 700,
      cursor: "pointer",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      letterSpacing: "0.01em",
      textShadow: "0 1px 3px rgba(0,0,0,.2)",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", null, label), onTrial && cd && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      background: "rgba(0,0,0,.25)",
      borderRadius: "8px",
      padding: "2px 8px",
      fontVariantNumeric: "tabular-nums",
      letterSpacing: "0.05em",
      fontSize: "11px"
    }
  }, "\u23F1 ", cd));
}
/* ===== Customer-Journey-Popups (Design 2026 · Sand/Ink/Regenbogen) ===== */
function JBadge({ name }) {
  const wrap = children => /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
    strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round"
  }, children);
  if (name === "bars") return /*#__PURE__*/React.createElement("svg", { viewBox: "0 0 24 24", fill: "none" },
    /*#__PURE__*/React.createElement("rect", { x: 3, y: 13, width: 2.4, height: 7, rx: 1.2, fill: "#ff3b5c" }),
    /*#__PURE__*/React.createElement("rect", { x: 7.2, y: 9, width: 2.4, height: 11, rx: 1.2, fill: "#ff8a18" }),
    /*#__PURE__*/React.createElement("rect", { x: 11.4, y: 6, width: 2.4, height: 14, rx: 1.2, fill: "#ffc400" }),
    /*#__PURE__*/React.createElement("rect", { x: 15.6, y: 10.5, width: 2.4, height: 9.5, rx: 1.2, fill: "#1fbf6b" }),
    /*#__PURE__*/React.createElement("rect", { x: 19.8, y: 14, width: 2.4, height: 6, rx: 1.2, fill: "#0a84ff" }));
  if (name === "reorder") return wrap([
    /*#__PURE__*/React.createElement("rect", { key: 1, x: 3.5, y: 3.5, width: 7, height: 7, rx: 1.8 }),
    /*#__PURE__*/React.createElement("rect", { key: 2, x: 13.5, y: 3.5, width: 7, height: 7, rx: 1.8 }),
    /*#__PURE__*/React.createElement("rect", { key: 3, x: 3.5, y: 13.5, width: 7, height: 7, rx: 1.8 }),
    /*#__PURE__*/React.createElement("rect", { key: 4, x: 13.5, y: 13.5, width: 7, height: 7, rx: 1.8 })
  ]);
  if (name === "home") return wrap([
    /*#__PURE__*/React.createElement("path", { key: 1, d: "M12 3v11" }),
    /*#__PURE__*/React.createElement("path", { key: 2, d: "m8 10 4 4 4-4" }),
    /*#__PURE__*/React.createElement("path", { key: 3, d: "M5 20h14" })
  ]);
  if (name === "save") return wrap(/*#__PURE__*/React.createElement("path", { d: "M6 3h12v18l-6-4-6 4z" }));
  if (name === "clock") return wrap([
    /*#__PURE__*/React.createElement("circle", { key: 1, cx: 12, cy: 12, r: 9 }),
    /*#__PURE__*/React.createElement("path", { key: 2, d: "M12 7.5V12l3 2" })
  ]);
  if (name === "smile") return wrap([
    /*#__PURE__*/React.createElement("circle", { key: 1, cx: 12, cy: 12, r: 9 }),
    /*#__PURE__*/React.createElement("path", { key: 2, d: "M8.5 14.5s1.3 1.5 3.5 1.5 3.5-1.5 3.5-1.5" }),
    /*#__PURE__*/React.createElement("path", { key: 3, d: "M9 9.5h.01" }),
    /*#__PURE__*/React.createElement("path", { key: 4, d: "M15 9.5h.01" })
  ]);
  if (name === "chat") return wrap(/*#__PURE__*/React.createElement("path", { d: "M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" }));
  return null;
}
function JCloseIcon() {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", { d: "M6 6l12 12M18 6 6 18" }));
}
/* Animated demo: a row of tiles where one is press-held, lifted and dragged to a
   new spot and back — shows the reorder gesture instead of only describing it. */
function ReorderDemo() {
  const h = React.createElement;
  // Echte Sprach-Kacheln (gleiche Klassen wie die App-Leiste) → identischer Look.
  const LS = [["de", "DE", "Deutsch", "#ff3b5c"], ["es", "ES", "Español", "#ff9f0a"], ["en", "EN", "English", "#0a84ff"], ["nl", "NL", "Nederlands", "#30c95a"], ["fr", "FR", "Français", "#1b1813"]];
  return h("div", { className: "rdemo langbar reordering", "aria-hidden": "true" },
    LS.map(([code, cc, name, color], i) => h("button", {
      key: code, type: "button",
      className: "langbtn" + (i === 0 ? " active" : "") + (i === 1 ? " dragging rmover" : ""),
      style: i === 0 ? { "--lc": color } : null
    },
      h("span", { className: "langstripe", style: { background: color } }),
      h("span", { className: "langflag" }, cc),
      h("span", { className: "langname" }, name))));
}
function JourneyPop({ badge, media, head, html, primaryLabel, primaryKind, onPrimary, secondaryLabel, onSecondary, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return /*#__PURE__*/React.createElement("div", { className: "cj-ov", onClick: onClose },
    /*#__PURE__*/React.createElement("div", { className: "cj-pop", onClick: e => e.stopPropagation() },
      /*#__PURE__*/React.createElement("button", { className: "cj-x", "aria-label": tr("ios_close"), onClick: onClose }, /*#__PURE__*/React.createElement(JCloseIcon)),
      media ? /*#__PURE__*/React.createElement("div", { className: "cj-media" }, media) : badge && /*#__PURE__*/React.createElement("div", { className: "cj-badge" }, /*#__PURE__*/React.createElement(JBadge, { name: badge })),
      /*#__PURE__*/React.createElement("div", { className: "cj-head" }, head),
      html && /*#__PURE__*/React.createElement("p", { className: "cj-text", dangerouslySetInnerHTML: { __html: html } }),
      /*#__PURE__*/React.createElement("div", { className: "cj-btns" },
        /*#__PURE__*/React.createElement("button", { className: "cj-btn " + (primaryKind || "ink"), onClick: onPrimary }, primaryLabel),
        secondaryLabel && /*#__PURE__*/React.createElement("button", { className: "cj-btn ghost", onClick: onSecondary }, secondaryLabel)
      )
    )
  );
}
function FeedbackPop({ onSubmit, onClose }) {
  const [stars, setStars] = useState(0);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(false);
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  async function submit() {
    if (sending || !body.trim()) return;
    setSending(true); setErr(false);
    const ok = await onSubmit(stars, body.trim());
    if (!ok) { setSending(false); setErr(true); }
  }
  return /*#__PURE__*/React.createElement("div", { className: "cj-ov", onClick: onClose },
    /*#__PURE__*/React.createElement("div", { className: "cj-pop", onClick: e => e.stopPropagation() },
      /*#__PURE__*/React.createElement("button", { className: "cj-x", "aria-label": tr("ios_close"), onClick: onClose }, /*#__PURE__*/React.createElement(JCloseIcon)),
      /*#__PURE__*/React.createElement("div", { className: "cj-badge" }, /*#__PURE__*/React.createElement(JBadge, { name: "chat" })),
      /*#__PURE__*/React.createElement("div", { className: "cj-head" }, tr("cj_fb_head")),
      /*#__PURE__*/React.createElement("p", { className: "cj-text", dangerouslySetInnerHTML: { __html: tr("cj_fb_text") } }),
      /*#__PURE__*/React.createElement("div", { className: "cj-stars", role: "radiogroup", "aria-label": tr("cj_fb_rate_q") },
        [1, 2, 3, 4, 5].map(i => /*#__PURE__*/React.createElement("button", {
          key: i, type: "button", className: "cj-star" + (i <= stars ? " on" : ""),
          "aria-label": i + "/5", onClick: () => setStars(i)
        }, i <= stars ? "★" : "☆"))
      ),
      /*#__PURE__*/React.createElement("textarea", {
        className: "cj-ta", rows: 3, value: body, placeholder: tr("cj_fb_ph"),
        onChange: e => setBody(e.target.value)
      }),
      /*#__PURE__*/React.createElement("div", { className: "cj-gift", dangerouslySetInnerHTML: { __html: tr("cj_fb_gift") } }),
      err && /*#__PURE__*/React.createElement("div", { className: "cj-err" }, tr("cj_fb_err")),
      /*#__PURE__*/React.createElement("div", { className: "cj-btns" },
        /*#__PURE__*/React.createElement("button", {
          className: "cj-btn ink", disabled: sending || !body.trim(), onClick: submit
        }, sending ? tr("cj_fb_sending") : tr("cj_fb_send"))
      )
    )
  );
}
function ReviewPrompt({
  name,
  onRate,
  onFeedback,
  onClose
}) {
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  const hi = name ? name + ", " : "";
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 9999,
      background: "rgba(10,8,20,0.6)",
      backdropFilter: "blur(7px)",
      WebkitBackdropFilter: "blur(7px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      animation: "fade 0.2s ease both"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: "relative",
      width: "100%",
      maxWidth: "362px",
      background: "var(--surface)",
      borderRadius: "26px",
      boxShadow: "0 34px 80px -22px rgba(0,0,0,0.6)",
      overflow: "hidden",
      animation: "skup 0.34s cubic-bezier(.22,1,.36,1) both"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "linear-gradient(100deg,#ef1f4d,#ef6a12,#d99a00,#159a43,#0a74e6,#9542ee)",
      padding: "22px 22px 18px",
      textAlign: "center",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "inline-block",
      fontSize: "10px",
      fontWeight: 800,
      letterSpacing: "0.09em",
      textTransform: "uppercase",
      background: "rgba(255,255,255,0.24)",
      borderRadius: "999px",
      padding: "4px 11px",
      marginBottom: "11px"
    }
  }, "\u2B50 ", tr("rev_kicker")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "36px",
      lineHeight: 1,
      marginBottom: "7px"
    }
  }, "\uD83D\uDE80"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: "19px",
      lineHeight: 1.2
    }
  }, hi, tr("rev_heading"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px 22px 20px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 11px",
      fontSize: "15px",
      lineHeight: 1.5,
      color: "var(--text)"
    },
    dangerouslySetInnerHTML: {
      __html: tr("rev_body1", {
        mins: "30"
      })
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "0 0 18px",
      fontSize: "13.8px",
      lineHeight: 1.55,
      color: "var(--muted)"
    },
    dangerouslySetInnerHTML: {
      __html: tr("rev_body2")
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: onRate,
    style: {
      width: "100%",
      border: "none",
      borderRadius: "15px",
      padding: "15px",
      background: "linear-gradient(100deg,#ef1f4d,#ef6a12,#d99a00,#159a43,#0a74e6,#9542ee)",
      color: "#fff",
      fontFamily: "var(--font-display)",
      fontWeight: 800,
      fontSize: "16px",
      cursor: "pointer",
      boxShadow: "0 14px 32px -12px rgba(165,87,255,0.6)"
    }
  }, "\u2B50 ", tr("rev_rate")), /*#__PURE__*/React.createElement("button", {
    onClick: onFeedback,
    style: {
      width: "100%",
      marginTop: "10px",
      border: "none",
      background: "none",
      color: "var(--lang-color,#a557ff)",
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "13.5px",
      cursor: "pointer"
    }
  }, "\uD83D\uDCA1 ", tr("rev_feedback")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: "100%",
      marginTop: "3px",
      border: "none",
      background: "none",
      color: "var(--muted)",
      fontSize: "12.5px",
      cursor: "pointer",
      padding: "6px"
    }
  }, tr("rev_snooze")))));
}
function PaymentSuccess({
  name,
  onClose
}) {
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape" || e.key === "Enter") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "paysuc-bg",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "paysuc-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "paysuc-modal"
  }, /*#__PURE__*/React.createElement("div", {
    className: "paysuc-glow",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "paysuc-logo"
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-mark big",
    style: {
      display: "grid",
      width: "72px",
      height: "72px",
      borderRadius: "22px",
      padding: "11px",
      margin: "0 auto",
      boxShadow: "0 12px 40px -8px rgba(165,87,255,.45)"
    }
  }, RAINBOW.slice(0, 5).map((c, i) => /*#__PURE__*/React.createElement("i", {
    key: i,
    style: {
      background: c
    }
  }))), /*#__PURE__*/React.createElement("span", {
    className: "paysuc-check",
    "aria-hidden": "true"
  }, "\u2713")), /*#__PURE__*/React.createElement("h2", {
    className: "paysuc-h1",
    id: "paysuc-title"
  }, name ? `Super${name ? ", " + name : ""}!` : "Super!"), /*#__PURE__*/React.createElement("p", {
    className: "paysuc-sub"
  }, tr("paysuc_sub")), /*#__PURE__*/React.createElement("div", {
    className: "paysuc-perks"
  }, [["🎯", tr("paysuc_feat1")], ["⭐", tr("paysuc_feat2")], ["♾️", tr("paysuc_feat3")]].map(([icon, text]) => /*#__PURE__*/React.createElement("div", {
    key: icon,
    className: "paysuc-perk"
  }, /*#__PURE__*/React.createElement("span", {
    className: "paysuc-perk-icon"
  }, icon), /*#__PURE__*/React.createElement("span", null, text)))), /*#__PURE__*/React.createElement("button", {
    className: "paysuc-cta",
    onClick: onClose,
    autoFocus: true
  }, /*#__PURE__*/React.createElement("span", null, tr("lets_go")))));
}
function WelcomeOffer({
  onSecure,
  onTrial,
  afterTrial
}) {
  const A_PRICE = A_PRICE_BONUS;
  const A_SAVE = +(A_EQ - A_PRICE_BONUS).toFixed(2);
  const A_DISC = Math.round(A_SAVE / A_EQ * 100);
  const ctaRef = useRef(null);
  const ms = useBonusCountdown();
  const cd = formatCountdown(ms);
  useEffect(() => {
    ctaRef.current && ctaRef.current.focus();
    const onKey = e => {
      if (e.key === "Escape") onTrial();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "offer-bg",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "offer-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "offer-modal"
  }, /*#__PURE__*/React.createElement("button", {
    className: "offer-close",
    onClick: onTrial,
    "aria-label": tr("offer_close")
  }), /*#__PURE__*/React.createElement("span", {
    className: "deal-badge",
    "aria-hidden": "true"
  }, tr("offer_badge", {
    disc: A_DISC
  })), cd && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      background: "linear-gradient(135deg,rgba(231,21,107,.12),rgba(165,87,255,.12))",
      border: "1px solid rgba(165,87,255,.3)",
      borderRadius: "12px",
      padding: "8px 14px",
      marginBottom: "4px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "16px"
    }
  }, "\u23F1"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "13px",
      color: "var(--text)"
    }
  }, tr("offer_expires", {
    t: ""
  }), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#1b1813",
      fontVariantNumeric: "tabular-nums"
    }
  }, cd))), /*#__PURE__*/React.createElement("h2", {
    className: "offer-h1",
    id: "offer-title"
  }, tr("paywall_h1")), /*#__PURE__*/React.createElement("p", {
    className: "offer-sub"
  }, tr("paywall_sub")), /*#__PURE__*/React.createElement("div", {
    className: "offer-price",
    "aria-label": tr("offer_price_label", {
      price: fEur(A_PRICE),
      eq: fEur(A_EQ)
    })
  }, /*#__PURE__*/React.createElement("span", {
    className: "offer-price-line"
  }, /*#__PURE__*/React.createElement("b", null, tr("offer_instead")), " ", tr("offer_mo"), " ", fEur(M_PRICE), " \u20AC \xD7 12 = ", fEur(A_EQ), " \u20AC ", tr("offer_yr")), /*#__PURE__*/React.createElement("span", {
    className: "offer-price-zahlst",
    "aria-hidden": "true"
  }, tr("offer_you_pay")), /*#__PURE__*/React.createElement("span", {
    className: "offer-price-num",
    "aria-hidden": "true"
  }, fEur(A_PRICE), " \u20AC", /*#__PURE__*/React.createElement("span", {
    className: "offer-price-per"
  }, " ", tr("offer_yr"))), /*#__PURE__*/React.createElement("span", {
    className: "offer-savings"
  }, tr("offer_save", {
    save: fEur(A_SAVE),
    disc: A_DISC
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement(RCTA, {
    label: tr("offer_secure"),
    onClick: onSecure,
    ref: ctaRef
  })), /*#__PURE__*/React.createElement("button", {
    className: "mghost",
    onClick: onTrial
  }, afterTrial ? tr("paywall_later") : tr("offer_trial"))));
}
function PaywallSheet({
  onUpgrade,
  onClose,
  lock,
  title,
  sub,
  rows,
  cta
}) {
  const ctaRef = useRef(null);
  useEffect(() => {
    ctaRef.current && ctaRef.current.focus();
    const onKey = e => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "paywall-bg",
    onClick: onClose,
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "paywall-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "paywall-sheet",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "paywall-grab",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "lock-tag",
    "aria-hidden": "true"
  }, lock || tr("paywall_lock")), /*#__PURE__*/React.createElement("h2", {
    className: "paywall-h1",
    id: "paywall-title"
  }, title || tr("paywall_h1")), /*#__PURE__*/React.createElement("p", {
    className: "paywall-sub"
  }, sub || tr("paywall_sub")), /*#__PURE__*/React.createElement(FeatureBox, {
    rows: rows || [[tr("pw_feat1"), tr("pw_feat1v")], [tr("pw_feat2"), tr("pw_feat2v")], [tr("pw_feat3"), tr("pw_feat3v")]]
  }), /*#__PURE__*/React.createElement(RCTA, {
    label: cta || tr("paywall_unlock"),
    onClick: onUpgrade,
    ref: ctaRef
  }), /*#__PURE__*/React.createElement("button", {
    className: "mghost",
    onClick: onClose
  }, tr("paywall_later"))));
}
function PricingSheet({
  onClose,
  onContinue,
  isPremium,
  onAccount
}) {
  const h = React.createElement;
  const RB = ["#ff3b5c", "#ff7a18", "#ffc400", "#34c759", "#0a84ff"];
  const eur = n => n.toFixed(2).replace(".", ",");
  const moEq = eur(A_PRICE_FULL / 12);
  const eq = eur(A_EQ);
  const cell = v => h("span", {
    className: "pr-rc " + (v === true ? "yes" : v === false ? "no" : "val")
  }, v === true ? "✓" : v === false ? "–" : v);
  const row = (label, a, k, p) => h("div", {
    className: "pr-row",
    key: label
  }, h("span", {
    className: "pr-rl"
  }, label), cell(a), cell(k), cell(p));
  return h("div", {
    className: "namegate",
    onClick: onClose
  }, h("div", {
    className: "pinpop pr-pop",
    onClick: e => e.stopPropagation()
  }, h("button", {
    className: "pp-x",
    onClick: onClose,
    title: tr("ios_close")
  }, "×"), h("div", {
    className: "pp-head"
  }, h("span", {
    className: "pp-mark"
  }, RB.map((c, i) => h("i", {
    key: i,
    style: {
      background: c
    }
  }))), h("span", {
    className: "pp-ey"
  }, "Conju", h("b", null, "Expert"), " · ", tr("pr_eyebrow"))), h("h2", {
    className: "pp-title"
  }, tr("pr_title")), h("p", {
    className: "pp-sub"
  }, tr("plan_hero_sub")), h("div", {
    className: "pr-table"
  }, h("div", {
    className: "pr-thead"
  }, h("span", null, ""), h("span", {
    className: "pr-th-anon"
  }, tr("pr_anon")), h("span", {
    className: "pr-th-konto"
  }, tr("pr_konto")), h("span", {
    className: "pr-th-prem"
  }, tr("pr_premium"))), row(tr("pr_feat_conj"), true, true, true), row(tr("plan_feat3"), true, true, true), row(tr("plan_feat1"), false, tr("pr_quiz_day"), "∞"), row(tr("plan_feat2"), false, false, true), row(tr("pr_feat_goals"), false, false, true), row(tr("plan_feat4"), false, false, true)), onAccount ? h("button", {
    className: "pr-trial-note pr-trial-btn",
    onClick: onAccount
  }, tr("pr_trial_note"), h("span", { className: "pr-trial-go" }, " →")) : h("p", {
    className: "pr-trial-note"
  }, tr("pr_trial_note")), h("div", {
    className: "pr-plans"
  }, h("button", {
    className: "pr-plan best",
    onClick: () => onContinue("annual")
  }, h("span", {
    className: "pr-badge"
  }, tr("plan_best")), h("div", {
    className: "pr-pname"
  }, tr("plan_annual")), h("div", {
    className: "pr-pprice"
  }, eur(A_PRICE_FULL), " ", h("span", null, "€ ", tr("plan_per_yr"))), h("div", {
    className: "pr-pnote"
  }, tr("plan_mo_label", {
    price: moEq,
    eq: eq
  }))), h("button", {
    className: "pr-plan",
    onClick: () => onContinue("monthly")
  }, h("div", {
    className: "pr-pname"
  }, tr("plan_monthly")), h("div", {
    className: "pr-pprice"
  }, eur(M_PRICE), " ", h("span", null, "€ ", tr("plan_per_mo"))), h("div", {
    className: "pr-pnote"
  }, tr("plan_flex", {
    eq: eq
  })))), isPremium ? h("div", {
    className: "pr-active"
  }, tr("pr_active")) : h("button", {
    className: "pr-cta",
    onClick: () => onContinue("annual")
  }, tr("paywall_unlock")), h("button", {
    className: "pp-skip",
    onClick: onClose
  }, tr("paywall_later")), h("div", {
    className: "pr-trust"
  }, "🔒 Stripe · SSL · ", tr("plan_cancelable"))));
}
function PlanSelect({
  plan,
  setPlan,
  onNext,
  onClose,
  onLogin,
  onCouponLogin,
  supaUser,
  onPremium,
  openCoupon
}) {
  const backRef = useRef(null);
  const plans = ["monthly", "annual"];
  const A_PRICE = getAPrice();
  const A_SAVE = getASave();
  const A_DISC = getADisc();
  const bonusActive = isBonusActive();
  const [showCode, setShowCode] = useState(openCoupon || false);
  const [code, setCode] = useState("");
  const [codeState, setCodeState] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const [redeemed, setRedeemed] = useState(false);
  async function redeemCode() {
    if (!supaUser?.id) {
      setCodeState("err");
      setErrMsg("Bitte zuerst anmelden");
      return;
    }
    setCodeState("loading");
    try {
      const {
        data,
        error
      } = await window.__supa.functions.invoke("redeem-code", {
        body: {
          code: code.trim(),
          userId: supaUser.id
        }
      });
      if (error) {
        const body = await error.context?.json?.().catch(() => null);
        setCodeState("err");
        setErrMsg(body?.error || error.message || "Fehler");
        return;
      }
      if (data?.error) {
        setCodeState("err");
        setErrMsg(data.error);
        return;
      }
      onPremium();
      setRedeemed(true);
    } catch (e) {
      setCodeState("err");
      setErrMsg(e?.message || "Verbindungsfehler");
    }
  }
  useEffect(() => {
    backRef.current && backRef.current.focus();
    const onKey = e => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  function onCardKey(e, id) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setPlan(id);
    }
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      setPlan(plans[(plans.indexOf(id) + 1) % plans.length]);
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      setPlan(plans[(plans.indexOf(id) - 1 + plans.length) % plans.length]);
    }
  }
  if (redeemed) return /*#__PURE__*/React.createElement("div", {
    className: "plansel-bg",
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "plansel-sheet",
    style: {
      justifyContent: "center",
      alignItems: "center",
      padding: "32px 24px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "20px",
      maxWidth: "320px",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      marginBottom: "4px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-mark big",
    style: {
      display: "grid",
      margin: "0 auto",
      width: "72px",
      height: "72px",
      borderRadius: "22px",
      padding: "11px",
      boxShadow: "0 12px 40px -8px rgba(165,87,255,.45)"
    }
  }, RAINBOW.slice(0, 5).map((c, i) => /*#__PURE__*/React.createElement("i", {
    key: i,
    style: {
      background: c
    }
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      bottom: "-6px",
      right: "-6px",
      fontSize: "22px",
      lineHeight: 1
    }
  }, "\u2705")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "26px",
      fontWeight: 800,
      letterSpacing: "-.03em",
      color: "var(--text)",
      marginBottom: "8px"
    }
  }, "Premium aktiviert!"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "14px",
      color: "var(--muted)",
      lineHeight: 1.5,
      textWrap: "balance"
    }
  }, "Die App steht dir jetzt vollumf\xE4nglich zur Verf\xFCgung \u2014 ohne Einschr\xE4nkungen.")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      background: "var(--surface-2)",
      borderRadius: "16px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }
  }, [["🎯", "Konjugations-Quiz — alle Sprachen"], ["⭐", "Favoriten & Vokabellisten"], ["🌍", "Spanisch, Französisch, Italienisch, Portugiesisch, Deutsch"], ["♾️", "Unlimitiert, ohne Werbung"]].map(([icon, text]) => /*#__PURE__*/React.createElement("div", {
    key: text,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "13.5px",
      color: "var(--text)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "28px",
      height: "28px",
      borderRadius: "8px",
      background: "var(--surface)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "14px",
      flexShrink: 0,
      boxShadow: "var(--shadow-sm)"
    }
  }, icon), /*#__PURE__*/React.createElement("span", null, text)))), /*#__PURE__*/React.createElement("button", {
    className: "paysuc-cta",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("span", null, "Jetzt loslegen \u2192")))));
  return /*#__PURE__*/React.createElement("div", {
    className: "plansel-bg",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "plansel-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "plansel-sheet"
  }, /*#__PURE__*/React.createElement("div", {
    className: "plansel-bar"
  }, /*#__PURE__*/React.createElement("button", {
    className: "plansel-back",
    ref: backRef,
    onClick: onClose,
    "aria-label": "Zur\xFCck"
  }, "\u2039"), /*#__PURE__*/React.createElement("span", {
    id: "plansel-title",
    style: {
      fontSize: "15px",
      fontWeight: 700,
      color: "var(--text)"
    }
  }, "Premium freischalten"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "plansel-hero"
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-mark big",
    style: {
      margin: "0 auto 14px",
      display: "grid"
    }
  }, RAINBOW.slice(0, 5).map((c, i) => /*#__PURE__*/React.createElement("i", {
    key: i,
    style: {
      background: c
    }
  }))), /*#__PURE__*/React.createElement("h2", {
    className: "plansel-hero-h1"
  }, tr("plan_hero_h1")), /*#__PURE__*/React.createElement("p", {
    className: "plansel-hero-sub"
  }, tr("plan_hero_sub"))), /*#__PURE__*/React.createElement("div", {
    className: "plansel-content"
  }, /*#__PURE__*/React.createElement("div", {
    className: "plan-cards",
    role: "radiogroup",
    "aria-label": "Abonnement w\xE4hlen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "plan-card annual" + (plan === "annual" ? " sel" : ""),
    onClick: () => setPlan("annual"),
    onKeyDown: e => onCardKey(e, "annual"),
    role: "radio",
    "aria-checked": plan === "annual",
    "aria-label": tr("plan_annual") + ": " + fEur(A_PRICE) + " € " + tr("plan_per_yr"),
    tabIndex: 0
  }, /*#__PURE__*/React.createElement("span", {
    className: "plan-best-badge",
    "aria-hidden": "true"
  }, bonusActive ? tr("plan_bonus") : tr("plan_best")), /*#__PURE__*/React.createElement("div", {
    className: "plan-radio" + (plan === "annual" ? " on" : ""),
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "plan-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "plan-name"
  }, tr("plan_annual")), /*#__PURE__*/React.createElement("div", {
    className: "plan-meta"
  }, tr("plan_mo_label", {
    price: fEur(+(A_PRICE / 12).toFixed(2)),
    eq: fEur(A_EQ)
  })), /*#__PURE__*/React.createElement("div", {
    className: "savings-tag"
  }, tr("plan_save", {
    save: fEur(A_SAVE),
    disc: A_DISC
  }))), /*#__PURE__*/React.createElement("div", {
    className: "plan-price",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("b", null, fEur(A_PRICE), " \u20AC"), /*#__PURE__*/React.createElement("small", null, " ", tr("plan_per_yr")))), /*#__PURE__*/React.createElement("div", {
    className: "plan-card" + (plan === "monthly" ? " sel" : ""),
    onClick: () => setPlan("monthly"),
    onKeyDown: e => onCardKey(e, "monthly"),
    role: "radio",
    "aria-checked": plan === "monthly",
    "aria-label": tr("plan_monthly") + ": " + fEur(M_PRICE) + " € " + tr("plan_per_mo"),
    tabIndex: 0
  }, /*#__PURE__*/React.createElement("div", {
    className: "plan-radio" + (plan === "monthly" ? " on" : ""),
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("div", {
    className: "plan-info"
  }, /*#__PURE__*/React.createElement("div", {
    className: "plan-name"
  }, tr("plan_monthly")), /*#__PURE__*/React.createElement("div", {
    className: "plan-meta"
  }, tr("plan_flex", {
    eq: fEur(A_EQ)
  }))), /*#__PURE__*/React.createElement("div", {
    className: "plan-price",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("b", null, fEur(M_PRICE), " \u20AC"), /*#__PURE__*/React.createElement("small", null, " ", tr("plan_per_mo"))))), /*#__PURE__*/React.createElement("div", {
    className: "plansel-features"
  }, [tr("plan_feat1"), tr("plan_feat2"), tr("plan_feat3"), tr("plan_feat4")].map(text => /*#__PURE__*/React.createElement("div", {
    key: text,
    className: "plansel-feature-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "plansel-fcheck"
  }, "\u2713"), /*#__PURE__*/React.createElement("span", null, text)))), /*#__PURE__*/React.createElement("button", {
    className: "plansel-cta",
    onClick: onNext
  }, tr("plan_cta")), !showCode && /*#__PURE__*/React.createElement("button", {
    className: "plansel-coupon-cta",
    onClick: () => setShowCode(true),
    style: {
      width: "100%",
      marginTop: "10px",
      padding: "13px",
      borderRadius: "14px",
      border: "1.6px dashed #c9a6ff",
      background: "rgba(165,87,255,0.08)",
      color: "var(--text)",
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "14.5px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px"
    }
  }, "\uD83C\uDF81 ", tr("plan_coupon")), /*#__PURE__*/React.createElement("div", {
    className: "plansel-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "trust-badges"
  }, /*#__PURE__*/React.createElement("span", {
    className: "trust-badge"
  }, /*#__PURE__*/React.createElement("span", {
    className: "trust-icon"
  }, "\uD83D\uDD12"), "Stripe"), /*#__PURE__*/React.createElement("span", {
    className: "trust-sep"
  }), /*#__PURE__*/React.createElement("span", {
    className: "trust-badge"
  }, /*#__PURE__*/React.createElement("span", {
    className: "trust-icon"
  }, "\u2713"), "SSL"), /*#__PURE__*/React.createElement("span", {
    className: "trust-sep"
  }), /*#__PURE__*/React.createElement("span", {
    className: "trust-badge"
  }, /*#__PURE__*/React.createElement("span", {
    className: "trust-icon"
  }, "\u21A9"), tr("plan_cancelable"))), /*#__PURE__*/React.createElement("div", {
    className: "plansel-footer-links"
  }, /*#__PURE__*/React.createElement("button", {
    className: "plansel-footer-btn",
    onClick: onLogin
  }, tr("plan_have_account"), " ", /*#__PURE__*/React.createElement("b", null, tr("sign_in"))))), showCode && /*#__PURE__*/React.createElement("div", {
    className: "coupon-box"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "2px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "13px",
      fontWeight: 700,
      color: "var(--text)"
    }
  }, tr("coupon_title")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setShowCode(false);
      setCodeState(null);
      setCode("");
    },
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "18px",
      color: "var(--muted)",
      lineHeight: 1,
      padding: "0 2px"
    }
  }, "\xD7")), !supaUser ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "4px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "var(--muted)",
      marginBottom: "10px"
    }
  }, tr("coupon_need_login")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setShowCode(false);
      (onCouponLogin || onLogin)();
    },
    style: {
      padding: "11px 24px",
      borderRadius: "12px",
      border: "none",
      background: "linear-gradient(100deg,#ef1f4d,#ef6a12,#d99a00,#159a43,#0a74e6,#9542ee)",
      color: "#fff",
      fontWeight: 700,
      fontSize: "14px",
      cursor: "pointer"
    }
  }, tr("coupon_sign_in"))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("input", {
    value: code,
    "aria-label": "Code",
    onChange: e => setCode(e.target.value.toUpperCase()),
    placeholder: tr("coupon_ph"),
    autoFocus: true,
    style: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "1.5px solid var(--border)",
      fontSize: "16px",
      fontFamily: "monospace",
      fontWeight: 700,
      background: "var(--surface)",
      color: "var(--text)",
      outline: "none",
      letterSpacing: "0.08em",
      textAlign: "center"
    },
    onKeyDown: e => e.key === "Enter" && redeemCode()
  }), /*#__PURE__*/React.createElement("button", {
    onClick: redeemCode,
    disabled: !code.trim() || codeState === "loading",
    style: {
      width: "100%",
      padding: "13px",
      borderRadius: "12px",
      border: "none",
      background: !code.trim() || codeState === "loading" ? "var(--border)" : "linear-gradient(100deg,#ef1f4d,#ef6a12,#d99a00,#159a43,#0a74e6,#9542ee)",
      color: !code.trim() || codeState === "loading" ? "var(--muted)" : "#fff",
      fontWeight: 700,
      fontSize: "15px",
      cursor: !code.trim() || codeState === "loading" ? "default" : "pointer",
      transition: "background .2s, color .2s"
    }
  }, codeState === "loading" ? tr("coupon_redeeming") : tr("coupon_redeem")), codeState === "err" && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "13px",
      color: "#ff453a",
      textAlign: "center",
      marginTop: "-4px"
    }
  }, errMsg))))));
}

/* ---------- GoalSuccess ---------- */
function GoalSuccess({
  name,
  goal,
  onClose,
  onQuiz,
  onCurate
}) {
  const perDay = goal?.perDay || 12;
  const weeks = goal?.weeks || 2;
  const verbs = goal?.verbs || null;
  const words = goal?.words || null;
  return /*#__PURE__*/React.createElement("div", {
    className: "streakmodal-bg",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "zt-board",
    style: {
      alignItems: "stretch",
      gap: "16px",
      padding: "28px 24px 24px"
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "zt-x",
    onClick: onClose
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "10px",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "56px",
      height: "56px",
      borderRadius: "18px",
      background: "linear-gradient(100deg,#ef1f4d,#ef6a12,#d99a00,#159a43,#0a74e6,#9542ee)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "26px",
      boxShadow: "0 10px 28px -10px #7a5cff"
    }
  }, "\u2713"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "22px",
      fontWeight: 900,
      letterSpacing: "-0.03em",
      margin: "0 0 6px",
      lineHeight: 1.15
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: "linear-gradient(95deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#0a84ff,#a557ff)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent"
    }
  }, tr("gs_title", { name: name ? ", " + name : "" }))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "13.5px",
      color: "var(--muted)",
      margin: 0,
      lineHeight: 1.6,
      maxWidth: "280px"
    }
  }, tr("gs_sub")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "10px",
      background: "var(--surface-2)",
      borderRadius: "16px",
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "20px",
      fontWeight: 800,
      color: "var(--text)"
    }
  }, perDay), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--muted)",
      fontWeight: 600,
      marginTop: "2px"
    }
  }, tr("gf_per_day_lbl"))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "1px",
      background: "var(--border)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "20px",
      fontWeight: 800,
      color: "#0a84ff"
    }
  }, weeks), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--muted)",
      fontWeight: 600,
      marginTop: "2px"
    }
  }, weeks === 1 ? tr("gf_week") : tr("gf_weeks"))), verbs && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "1px",
      background: "var(--border)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "20px",
      fontWeight: 800,
      color: "#34c759"
    }
  }, verbs), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--muted)",
      fontWeight: 600,
      marginTop: "2px"
    }
  }, tr("gf_verbs")))), words && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "1px",
      background: "var(--border)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "20px",
      fontWeight: 800,
      color: "#ff7a18"
    }
  }, words), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--muted)",
      fontWeight: 600,
      marginTop: "2px"
    }
  }, tr("gf_words"))))), /*#__PURE__*/React.createElement("button", {
    className: "gsec gsec-primary",
    onClick: onCurate
  }, /*#__PURE__*/React.createElement("span", {
    className: "gsec-ic",
    dangerouslySetInnerHTML: {
      __html: IC_PENCIL
    }
  }), /*#__PURE__*/React.createElement("span", null, tr("gs_set_verbs"))), /*#__PURE__*/React.createElement("div", {
    className: "gsec-hint"
  }, tr("gs_set_hint")), /*#__PURE__*/React.createElement("button", {
    className: "zt-act",
    onClick: onClose,
    style: {
      textAlign: "center"
    }
  }, tr("gs_later"))));
}

/* ---------- GoalCelebration ---------- */
function GoalCelebration({
  name,
  daily,
  goal,
  onClose,
  onNewGoal
}) {
  const planDay = goal?.startDate ? Math.min((goal.weeks || 2) * 7, Math.floor((Date.now() - new Date(goal.startDate)) / 86400000) + 1) : null;
  const goalDays = goal ? (goal.weeks || 2) * 7 : null;
  const planDone = planDay !== null && planDay >= goalDays;
  React.useEffect(() => { fireConfetti(10); }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "streakmodal-bg",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "zt-board",
    style: {
      textAlign: "center",
      alignItems: "center",
      gap: "14px",
      padding: "32px 24px 24px"
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("div", {
    className: "celebmark",
    dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='34' height='34' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='M5 13l4 4L19 7'/></svg>" }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "26px",
      fontWeight: 900,
      letterSpacing: "-0.03em",
      margin: "0 0 6px"
    }
  }, planDone ? tr("ch_mastered") : tr("gc_daily_done")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "14px",
      color: "var(--muted)",
      margin: 0,
      lineHeight: 1.5
    }
  }, planDone ? tr("gc_done_plan", { d: goalDays, name: name ? ", " + name : "" }) : name ? tr("gc_done_named", { name: name, n: daily.goal }) : tr("gc_done_anon", { n: daily.goal }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "12px",
      width: "100%",
      background: "var(--surface-2)",
      borderRadius: "16px",
      padding: "14px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "22px",
      fontWeight: 800,
      color: "var(--text)"
    }
  }, daily.count), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--muted)",
      fontWeight: 600,
      marginTop: "2px"
    }
  }, tr("gc_ex_today"))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "1px",
      background: "var(--border)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "22px",
      fontWeight: 800,
      color: "var(--text)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "7px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "combobars"
  }, /*#__PURE__*/React.createElement("i"), /*#__PURE__*/React.createElement("i"), /*#__PURE__*/React.createElement("i"), /*#__PURE__*/React.createElement("i")), daily.streak), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--muted)",
      fontWeight: 600,
      marginTop: "2px"
    }
  }, tr("gc_streak_lbl"))), planDay && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "1px",
      background: "var(--border)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "22px",
      fontWeight: 800,
      color: "#34c759"
    }
  }, planDay, "/", goalDays), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "11px",
      color: "var(--muted)",
      fontWeight: 600,
      marginTop: "2px"
    }
  }, tr("gc_plan_day"))))), planDone ? /*#__PURE__*/React.createElement("button", {
    className: "gcta",
    style: {
      width: "100%"
    },
    onClick: onNewGoal
  }, /*#__PURE__*/React.createElement("span", {
    className: "gg"
  }), /*#__PURE__*/React.createElement("span", null, tr("ch_new"), " \u2192")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "8px",
      width: "100%"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "zt-act primary",
    style: {
      flex: 2
    },
    onClick: onClose
  }, tr("zt_keep")), /*#__PURE__*/React.createElement("button", {
    className: "zt-act",
    style: {
      flex: 1
    },
    onClick: () => {
      onClose();
      setTimeout(onNewGoal, 50);
    }
  }, tr("ch_adjust")))));
}

/* ---------- Zieltafel ---------- */
function Zieltafel({
  name,
  lang,
  daily,
  goal,
  onClose,
  onAdjustGoal,
  onQuiz,
  onChallenge,
  onSwitchLang
}) {
  const LNAME = {
    de: "Deutsch",
    es: "Spanisch",
    en: "Englisch",
    nl: "Niederländisch",
    fr: "Französisch"
  }[lang] || "der Sprache";
  const HL = tr("zt_greets").split("|");
  const hl = React.useRef(HL[Math.floor(Math.random() * HL.length)]).current;
  const who = name || "du";
  const shown = Math.min(daily.count, daily.goal);
  const left = Math.max(0, daily.goal - daily.count);
  const initMsg = `Wobei hakt's gerade${name ? `, ${name}` : ""}? Lass uns das im Dialog auf ${LNAME} üben.`;
  const [messages, setMessages] = React.useState([{
    role: "ai",
    text: initMsg
  }]);
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
    const history = [...messages, {
      role: "user",
      text: msg
    }];
    setMessages(history);
    setLoading(true);
    try {
      const sys = `Du bist eine freundliche Sprachlehrerin in ConjuExpert. Die Nutzerin/der Nutzer heißt ${name || "jemand"} und lernt ${LNAME}. Sei kurz (2–3 Sätze), warm und konkret. Antworte auf Deutsch, außer bei Übungen auf ${LNAME}.`;
      const conv = history.map(m => m.role === "ai" ? `Lehrerin: ${m.text}` : `Lernende/r: ${m.text}`).join("\n");
      const reply = await window.claude.complete(`${sys}\n\nGespräch:\n${conv}\nLehrerin:`);
      setMessages(m => [...m, {
        role: "ai",
        text: reply.trim()
      }]);
    } catch (e) {
      setMessages(m => [...m, {
        role: "ai",
        text: "Ups, da ist etwas schiefgelaufen. Versuch es nochmal!"
      }]);
    }
    setLoading(false);
  }
  const goalDays = goal ? (goal.weeks || 2) * 7 : 14;
  const goalVerbs = goal ? goal.verbs : null;
  const goalWords = goal ? goal.words : null;
  const vTot = goal && Array.isArray(goal.verbList) ? goal.verbList.length : goalVerbs;
  const wTot = goal && Array.isArray(goal.wordList) ? goal.wordList.length : goalWords;
  const vMast = goal && Array.isArray(goal.verbList) ? goal.verbList.filter(x => (x.done || 0) >= CH_DONE).length : 0;
  const wMast = goal && Array.isArray(goal.wordList) ? goal.wordList.filter(x => (x.done || 0) >= CH_DONE).length : 0;
  const minsLeft = Math.max(1, Math.round(left * 0.5));
  const planDay = goal?.startDate ? Math.min(goalDays, Math.floor((Date.now() - new Date(goal.startDate)) / 86400000) + 1) : daily.streak;
  // Multi-Sprach-Übersicht: alle anderen Sprachen mit laufender Challenge auf
  // einen Blick (Serie & Tagesziel bleiben global, Challenges sind pro Sprache).
  const h = React.createElement;
  const otherLangs = ["de", "es", "en", "nl", "fr"].filter(l => l !== lang).map(l => {
    const g = recall("kunju-goal-data-" + l, null);
    const vl = g && Array.isArray(g.verbList) ? g.verbList : [];
    const wl = g && Array.isArray(g.wordList) ? g.wordList : [];
    const tot = vl.length + wl.length;
    if (!tot) return null;
    const mast = vl.filter(x => (x.done || 0) >= CH_DONE).length + wl.filter(x => (x.done || 0) >= CH_DONE).length;
    return { l: l, tot: tot, mast: mast, pct: mast / tot };
  }).filter(Boolean);
  const othersEl = otherLangs.length ? h("div", { className: "zt-others" },
    h("div", { className: "zt-others-h" }, tr("zt_other_head")),
    otherLangs.map(o => h("button", {
      key: o.l, className: "zt-olang", style: { "--lc": LANG_META[o.l].color },
      onClick: () => onSwitchLang && onSwitchLang(o.l)
    },
      h("span", { className: "zt-ol-dot" }),
      h("span", { className: "zt-ol-nm" }, window.CONJ[o.l].name),
      h("span", { className: "zt-ol-bar" }, h("i", { style: { width: o.pct * 100 + "%" } })),
      h("span", { className: "zt-ol-ct" }, tr("zt_lang_prog", { a: o.mast, b: o.tot })),
      h("span", { className: "zt-ol-arr" }, "→")))) : null;
  return /*#__PURE__*/React.createElement("div", {
    className: "streakmodal-bg",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "zt-board",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "zt-x",
    onClick: onClose
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "zt-eye"
  }, /*#__PURE__*/React.createElement("span", {
    className: "zt-k"
  }, tr("zt_eyebrow"), " \xB7 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: LANG_META[lang].color
    }
  }, window.CONJ[lang].name), goal ? /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text)"
    }
  }, tr("cs_day"), " ", planDay, " / ", goalDays)) : ""), /*#__PURE__*/React.createElement("button", {
    className: "zt-e",
    onClick: onAdjustGoal,
    title: tr("ch_adjust"),
    "aria-label": tr("ch_adjust"),
    dangerouslySetInnerHTML: { __html: IC_PENCIL }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "zt-greet"
  }, hl, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "zt-nm"
  }, who, ".")), /*#__PURE__*/React.createElement("p", {
    className: "zt-sub"
  }, tr("zt_today", { a: shown, b: daily.goal }), left > 0 ? tr("zt_left_suffix", { n: left }) : tr("zt_done_suffix"))), /*#__PURE__*/React.createElement("div", {
    className: "zt-prog"
  }, /*#__PURE__*/React.createElement("div", {
    className: "zt-pr"
  }, /*#__PURE__*/React.createElement("span", {
    className: "zt-a"
  }, tr("sk_today"), " ", /*#__PURE__*/React.createElement("small", null, shown, " / ", daily.goal)), left > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "12px",
      color: "var(--muted)",
      fontWeight: 600
    }
  }, "\u2248 ", minsLeft, " ", tr("zt_min_left"))), /*#__PURE__*/React.createElement("div", {
    className: "zt-pbar"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: Math.min(daily.count / daily.goal, 1) * 100 + "%"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "16px",
      marginTop: "2px",
      fontSize: "12.5px",
      fontWeight: 700
    }
  }, vTot && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted)"
    }
  }, tr("zt_verbs_prog", { a: vMast, b: vTot })), wTot && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted)"
    }
  }, tr("zt_words_prog", { a: wMast, b: wTot })), daily.streak > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--muted)",
      display: "inline-flex",
      alignItems: "center",
      gap: "5px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "combobars"
  }, /*#__PURE__*/React.createElement("i"), /*#__PURE__*/React.createElement("i"), /*#__PURE__*/React.createElement("i"), /*#__PURE__*/React.createElement("i")), tr("zt_streak", { n: daily.streak })))), /*#__PURE__*/React.createElement("button", {
    className: "zt-chbtn",
    onClick: onChallenge
  }, /*#__PURE__*/React.createElement("span", {
    className: "zt-chbtn-ic",
    dangerouslySetInnerHTML: { __html: IC_LIST }
  }), /*#__PURE__*/React.createElement("span", null, tr("zt_to_list")), /*#__PURE__*/React.createElement("span", {
    className: "zt-chbtn-arr"
  }, "\u2192")), othersEl, /*#__PURE__*/React.createElement("div", {
    className: "zt-acts"
  }, /*#__PURE__*/React.createElement("button", {
    className: "zt-act primary",
    onClick: onClose
  }, tr("zt_keep")), /*#__PURE__*/React.createElement("button", {
    className: "zt-act",
    onClick: onQuiz
  }, tr("zt_to_quiz")))));
}

/* ---------- GoalFlow ---------- */
function GoalFlow({
  step,
  setStep,
  name,
  lang,
  onClose,
  onCreate
}) {
  const eng = window.CONJ[lang] || window.CONJ["de"];
  const tenseOpts = React.useMemo(() => {
    const r = eng.conjugate(eng.samples[0]);
    return r && r.tenses ? r.tenses.filter(t => !t.nonFinite).map(t => ({
      id: t.id,
      label: t.label
    })) : [];
  }, [lang]);
  const allTenseIds = React.useMemo(() => tenseOpts.map(t => t.id), [tenseOpts]);
  const [tenseSel, setTenseSel] = useState(() => allTenseIds.slice());
  React.useEffect(() => {
    setTenseSel(allTenseIds.slice());
  }, [allTenseIds]);
  const tenseCount = tenseSel.length || 1;
  function toggleTense(id) {
    setTenseSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }
  const [verbs, setVerbs] = useState(8);
  const [words, setWords] = useState(20);
  const [weeks, setWeeks] = useState(2);
  const [timeMins, setTimeMins] = useState(10);
  const WEEK_OPTS = [1, 2, 3, 4];
  const days = weeks * 7;
  // Aufwand pro Niveau: Anfänger brauchen mehr Wiederholungen und mehr Zeit pro
  // Übung, Fortgeschrittene weniger. (Wdh./Verb-Zeitform · Wdh./Wort · Sek./Übung)
  const skill = recall("kunju-skill", "beginner");
  const GOAL_RATE = {
    beginner: { vb: 6, word: 5, sec: 24 },
    intermediate: { vb: 5, word: 4, sec: 20 },
    advanced: { vb: 4, word: 3, sec: 16 }
  };
  const rate = GOAL_RATE[skill] || GOAL_RATE.beginner;
  // Zeitformen wirken sub-linear: ist der Verbstamm bekannt, kostet jede weitere
  // Zeitform weniger. (1 Zeitform = 1×, 9 Zeitformen ≈ 4,2× statt 9×.)
  const tenseFactor = 1 + (tenseCount - 1) * 0.4;
  const reps = Math.round(verbs * rate.vb * tenseFactor + words * rate.word);
  const perDay = Math.max(6, Math.round(reps / days));
  const minsEst = Math.max(3, Math.round(perDay * rate.sec / 60));
  const tenseText = !tenseSel.length || tenseSel.length === allTenseIds.length ? tr("gf_all_tenses") : tenseSel.map(id => (tenseOpts.find(t => t.id === id) || {}).label).filter(Boolean).join(", ");
  const weeksLabel = weeks + " " + (weeks === 1 ? tr("gf_week") : tr("gf_weeks"));

  // Zeit-Pfad: from minutes → perDay → back-calc plan totals (same unit as Form: distinct items)
  const timPerDay = Math.max(6, Math.round(timeMins * 60 / rate.sec));
  const timDays = 14; // fixed 2-week plan for time path
  const timTF = 1 + (3 - 1) * 0.4; // Zeit-Pfad nimmt ~3 Zeitformen an
  const timVerbs = Math.max(4, Math.round(timPerDay * timDays * 0.35 / (rate.vb * timTF)));
  const timWords = Math.max(8, Math.round(timPerDay * timDays * 0.65 / rate.word));
  function cycleWeeks() {
    setWeeks(w => WEEK_OPTS[(WEEK_OPTS.indexOf(w) + 1) % WEEK_OPTS.length]);
  }
  const Wordmark = () => /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    className: "cw-c"
  }, "Conju"), /*#__PURE__*/React.createElement("span", {
    className: "cw-e"
  }, "Expert"));
  const Stepper = ({
    value,
    set,
    min = 1
  }) => /*#__PURE__*/React.createElement("span", {
    className: "gstep"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => set(Math.max(min, value - 1))
  }, "\u2013"), /*#__PURE__*/React.createElement("span", {
    className: "gnum"
  }, value), /*#__PURE__*/React.createElement("button", {
    onClick: () => set(value + 1)
  }, "+"));
  const renderForm = prefilled => /*#__PURE__*/React.createElement(React.Fragment, null, prefilled && /*#__PURE__*/React.createElement("div", {
    className: "gkibanner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gkic"
  }, "\u2728"), /*#__PURE__*/React.createElement("span", {
    className: "gkit"
  }, /*#__PURE__*/React.createElement("b", null, tr("gf_ki_title")), tr("gf_ki_sub"))), /*#__PURE__*/React.createElement("div", {
    className: "qfilter-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "qfilter-lbl"
  }, tr("gf_period")), /*#__PURE__*/React.createElement("button", {
    className: "tdbtn",
    onClick: cycleWeeks
  }, /*#__PURE__*/React.createElement("span", {
    className: "tdbtn-sum"
  }, weeks, " ", weeks === 1 ? tr("gf_week") : tr("gf_weeks")), /*#__PURE__*/React.createElement("span", {
    className: "tdbtn-caret"
  }, "\u25BE"))), /*#__PURE__*/React.createElement("div", {
    className: "qfilter-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "qfilter-lbl"
  }, tr("gf_tense")), /*#__PURE__*/React.createElement(TenseDropdown, {
    lang: lang,
    tenses: tenseOpts,
    isOn: id => tenseSel.includes(id),
    onToggle: toggleTense,
    onAll: () => setTenseSel(allTenseIds.slice()),
    onNone: () => setTenseSel([]),
    hideLbl: true
  })), /*#__PURE__*/React.createElement("div", {
    className: "qfilter-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "qfilter-lbl"
  }, tr("gf_conj_verbs")), /*#__PURE__*/React.createElement("div", {
    className: "gstepwrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gsl"
  }, tr("gf_num_verbs"), /*#__PURE__*/React.createElement("small", null, tr("gf_per_tense"))), /*#__PURE__*/React.createElement(Stepper, {
    value: verbs,
    set: setVerbs
  }))), /*#__PURE__*/React.createElement("div", {
    className: "qfilter-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "qfilter-lbl"
  }, tr("gf_new_words")), /*#__PURE__*/React.createElement("div", {
    className: "gstepwrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gsl"
  }, tr("gf_vocab"), /*#__PURE__*/React.createElement("small", null, tr("gf_learn_new"))), /*#__PURE__*/React.createElement(Stepper, {
    value: words,
    set: setWords
  }))), /*#__PURE__*/React.createElement("div", {
    className: "gderive"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gbig"
  }, minsEst, /*#__PURE__*/React.createElement("small", {
    className: "gbig-u"
  }, " ", tr("gf_min_abbr"))), /*#__PURE__*/React.createElement("span", {
    className: "gdt"
  }, /*#__PURE__*/React.createElement("b", null, perDay, " ", tr("gf_ex_per_day")), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("small", null, tr("gf_daily_auto")))), /*#__PURE__*/React.createElement("div", {
    className: "gsumlbl"
  }, tr("gf_overview")), /*#__PURE__*/React.createElement("div", {
    className: "gsummary"
  }, tr("gf_sum", { weeks: weeksLabel, verbs: verbs, tenses: tenseText, words: words })), /*#__PURE__*/React.createElement("button", {
    className: "gcta",
    onClick: () => onCreate({
      weeks,
      verbs,
      words,
      tenseCount,
      perDay
    })
  }, /*#__PURE__*/React.createElement("span", {
    className: "gg"
  }), /*#__PURE__*/React.createElement("span", null, tr("gf_start_cta", { n: perDay }))));
  return /*#__PURE__*/React.createElement("div", {
    className: "goal-bg",
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    className: "goal-sheet",
    style: {
      "--lc": "var(--text)",
      "--lang-color": "var(--text)",
      "--cc": "var(--text)"
    },
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("button", {
    className: "goal-x",
    onClick: onClose
  }, "\xD7"), step === "choose" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
    className: "goal-h1"
  }, tr("gf_h1_pre"), /*#__PURE__*/React.createElement(Wordmark, null), tr("gf_h1_post")), /*#__PURE__*/React.createElement("div", {
    className: "qfilter-lbl"
  }, tr("gf_choose_sub")), /*#__PURE__*/React.createElement("div", {
    className: "goal-langpill",
    style: { "--lc": LANG_META[lang].color }
  }, /*#__PURE__*/React.createElement("span", { className: "glp-dot" }), tr("ch_for_lang"), " ", /*#__PURE__*/React.createElement("b", null, window.CONJ[lang].name)), /*#__PURE__*/React.createElement("div", {
    className: "gchoice sug",
    onClick: () => setStep("suggest")
  }, /*#__PURE__*/React.createElement("span", {
    className: "gci"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M12 3.2l1.7 4.1 4.1 1.7-4.1 1.7L12 14.8l-1.7-4.1L6.2 9l4.1-1.7z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M18.5 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "gct"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gh"
  }, tr("gf_suggest_h"), " ", /*#__PURE__*/React.createElement("span", {
    className: "glvl"
  }, tr("gf_level_mid"))), /*#__PURE__*/React.createElement("span", {
    className: "gs"
  }, tr("gf_suggest_s"))), /*#__PURE__*/React.createElement("span", {
    className: "ggo"
  }, "\u2192")), /*#__PURE__*/React.createElement("div", {
    className: "gchoice ind",
    onClick: () => setStep("individual")
  }, /*#__PURE__*/React.createElement("span", {
    className: "gci"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "7.5",
    x2: "20",
    y2: "7.5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4",
    y1: "16.5",
    x2: "20",
    y2: "16.5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "9",
    cy: "7.5",
    r: "2.6",
    fill: "var(--surface)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "15",
    cy: "16.5",
    r: "2.6",
    fill: "var(--surface)"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "gct"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gh"
  }, tr("gf_ind_h")), /*#__PURE__*/React.createElement("span", {
    className: "gs"
  }, tr("gf_ind_s"))), /*#__PURE__*/React.createElement("span", {
    className: "ggo"
  }, "\u2192")), /*#__PURE__*/React.createElement("div", {
    className: "gorsep"
  }, tr("gf_or_time")), /*#__PURE__*/React.createElement("div", {
    className: "gchoice tim",
    onClick: () => setStep("time")
  }, /*#__PURE__*/React.createElement("span", {
    className: "gci"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12.5",
    r: "8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 8v4.5l3 1.8"
  }))), /*#__PURE__*/React.createElement("span", {
    className: "gct"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gh"
  }, tr("gf_time_h")), /*#__PURE__*/React.createElement("span", {
    className: "gs"
  }, tr("gf_time_s"))), /*#__PURE__*/React.createElement("span", {
    className: "ggo"
  }, "\u2192"))), step === "suggest" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "gback",
    onClick: () => setStep("choose"),
    style: { cursor: "pointer" }
  }, /*#__PURE__*/React.createElement("button", {
    className: "gbackbtn",
    onClick: () => setStep("choose")
  }, "\u2039"), /*#__PURE__*/React.createElement("span", {
    className: "gbt"
  }, tr("gf_suggest_h"), " \xB7 ", tr("gf_back"))), renderForm(true)), step === "individual" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "gback",
    onClick: () => setStep("choose"),
    style: { cursor: "pointer" }
  }, /*#__PURE__*/React.createElement("button", {
    className: "gbackbtn",
    onClick: () => setStep("choose")
  }, "\u2039"), /*#__PURE__*/React.createElement("span", {
    className: "gbt"
  }, tr("gf_ind_h"), " \xB7 ", tr("gf_back"))), renderForm(false)), step === "time" && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "gback",
    onClick: () => setStep("choose"),
    style: { cursor: "pointer" }
  }, /*#__PURE__*/React.createElement("button", {
    className: "gbackbtn",
    onClick: () => setStep("choose")
  }, "\u2039"), /*#__PURE__*/React.createElement("span", {
    className: "gbt"
  }, tr("gf_by_time"), " \xB7 ", tr("gf_back"))), /*#__PURE__*/React.createElement("div", {
    className: "gkibanner"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gkic"
  }, "\u23F1"), /*#__PURE__*/React.createElement("span", {
    className: "gkit"
  }, /*#__PURE__*/React.createElement("b", null, tr("gf_time_q")), " ", tr("gf_time_qs"))), /*#__PURE__*/React.createElement("div", {
    className: "gmins-row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gml"
  }, tr("gf_mins_day"), /*#__PURE__*/React.createElement("small", null, tr("gf_mins_min"))), /*#__PURE__*/React.createElement("div", {
    className: "gmins-btns"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setTimeMins(m => Math.max(3, m - 1))
  }, "\u2013"), /*#__PURE__*/React.createElement("span", {
    className: "gmval"
  }, timeMins), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTimeMins(m => m + 1)
  }, "+"))), /*#__PURE__*/React.createElement("div", {
    className: "gderive"
  }, /*#__PURE__*/React.createElement("span", {
    className: "gbig"
  }, timPerDay), /*#__PURE__*/React.createElement("span", {
    className: "gdt"
  }, /*#__PURE__*/React.createElement("b", null, tr("gf_ex_approx", { n: timeMins })), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("small", null, tr("gf_vw_daily", { v: timVerbs, w: timWords })))), /*#__PURE__*/React.createElement("div", {
    className: "gsumlbl"
  }, tr("gf_overview")), /*#__PURE__*/React.createElement("div", {
    className: "gsummary"
  }, tr("gf_sum_time", { mins: timeMins, per: timPerDay, verbs: timVerbs, words: timWords })), /*#__PURE__*/React.createElement("button", {
    className: "gcta",
    onClick: () => onCreate({
      weeks: 2,
      verbs: timVerbs,
      words: timWords,
      tenseCount: 3,
      perDay: timPerDay
    })
  }, /*#__PURE__*/React.createElement("span", {
    className: "gg"
  }), /*#__PURE__*/React.createElement("span", null, tr("gf_start_cta", { n: timPerDay }))))));
}
function Toast({
  msg,
  onDone
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: "88px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(20,21,26,0.93)",
      color: "#fff",
      borderRadius: "14px",
      padding: "11px 20px",
      fontSize: "14px",
      fontWeight: 500,
      lineHeight: 1.4,
      zIndex: 9999,
      maxWidth: "calc(100vw - 40px)",
      textAlign: "center",
      boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
      whiteSpace: "pre-wrap",
      animation: "fade 0.18s ease",
      pointerEvents: "none"
    }
  }, msg);
}
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [toastMsg, setToastMsg] = useState(null);
  const [lang, setLang] = useState(() => langOrder()[0] || "de");
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
  function setNat(n) {
    setNative(n);
    persist("kunju-native", n);
  }
  function setSkl(s) {
    setSkill(s);
    persist("kunju-skill", s);            // Spiegel: aktive Sprache
    persist("kunju-skill-" + lang, s);    // Niveau pro Sprache
  }
  // Niveau ist pro Sprache: beim Sprachwechsel das gespeicherte Niveau der
  // aktiven Sprache laden und den globalen Schlüssel spiegeln (damit alle
  // bestehenden recall("kunju-skill")-Leser automatisch das Richtige bekommen).
  useEffect(() => {
    const s = recall("kunju-skill-" + lang, null) || recall("kunju-skill", "beginner");
    setSkill(s);
    persist("kunju-skill", s);
  }, [lang]);
  // Challenge pro Sprache: beim Sprachwechsel/Start die Challenge der aktiven
  // Sprache laden und in den globalen Spiegel schreiben. Migration: eine
  // bestehende (globale) Challenge einmalig der aktuellen Sprache zuordnen.
  useEffect(() => {
    // Einmalige Migration: bestehende (globale) Challenge der Sprache zuordnen,
    // aus der ihre Verben stammen (per Konjugations-Engine erkannt).
    if (!recall("kunju-goal-migrated", false)) {
      const old = recall("kunju-goal-data", null);
      if (old && Array.isArray(old.verbList) && old.verbList.length) {
        // Sprache anhand der Verb-Pools erkennen (die Challenge-Verben stammen daraus).
        const sample = old.verbList.slice(0, 3).map(x => String(x.v || "").replace(/^to /, "").trim().toLowerCase()).filter(Boolean);
        let best = lang, bestN = 0;
        for (const l of ["de", "es", "en", "nl", "fr"]) {
          let pool = [];
          try { pool = (quizPool(l, "advanced") || []).map(p => String(p).replace(/^to /, "").toLowerCase()); } catch (e) {}
          const setp = new Set(pool);
          const n = sample.filter(v => setp.has(v)).length;
          if (n > bestN) { bestN = n; best = l; }
        }
        if (!recall("kunju-goal-data-" + best, null)) persist("kunju-goal-data-" + best, old);
      }
      persist("kunju-goal-migrated", true);
    }
    const g = recall("kunju-goal-data-" + lang, null);
    persist("kunju-goal-data", g);
    setGoal(g);
    setGoalSet(!!(g && Array.isArray(g.verbList)));
    setDaily(readDaily());
  }, [lang]);
  function commitName(n) {
    setName(n);
    persist("kunju-name", n);
    setShowOnboard(false);
    if (recall("kunju-tour", null) === null) setShowTour(true);
  }
  function finishTour() {
    persist("kunju-tour", true);
    setShowTour(false);
    startTrial();
  }
  // Contextual first-open hints (learn tab · each quiz mode · each Saved area).
  const [featureHint, setFeatureHint] = useState(null);
  const [pendingHint, setPendingHint] = useState(null);
  function requestHint(kind) {
    /* Feature-Hint-Popups deaktiviert — Erklärung steht jetzt inline im Screen */
  }
  function closeFeatureHint() {
    if (featureHint) persist("kunju-hint-" + featureHint, true);
    setFeatureHint(null);
  }
  UILANG = uiFromNative(native);
  useEffect(() => {
    window.__toast = msg => setToastMsg(msg);
    // Verb aus dem Text ins konto-synchronisierte „Gemerkte Verben" legen (Infinitiv).
    window.__addVerbFav = (lg, vb) => {
      if (!lg || !vb) return;
      setFavs(prev => {
        if (prev.some(x => x.lang === lg && x.verb === vb)) return prev;
        const nx = [{ lang: lg, verb: vb }, ...prev];
        persist("kunju-favs", nx);
        if (__vocabUser && window.__supa) { try { window.__supa.from("favorites").insert({ user_id: __vocabUser, lang: lg, verb: vb }); } catch (e) {} }
        return nx;
      });
    };
    return () => {
      window.__toast = null;
      window.__addVerbFav = null;
    };
  }, []);

  // --- Monetization ---
  const [isPremium, setIsPremium] = useState(() => recall("kunju-premium", false));
  const [premiumUntil, setPremiumUntil] = useState(() => recall("kunju-premium-until", null));
  const [showPaySuccess, setShowPaySuccess] = useState(false);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  // Customer-journey behavioural popups (one at a time). journey ∈
  // p1 (5 verbs) · p2 (~12 rounds → home screen) · p3 (last chance) ·
  // tend (24h over, anonymous) · p8 (welcome back, anonymous).
  const [journey, setJourney] = useState(null);
  const [showFbThanks, setShowFbThanks] = useState(false);

  // After ~30 min of total active use, ask once for a rating (gentle snooze on "later")
  useEffect(() => {
    if (recall("kunju-review-done", false)) return;
    const TARGET = 1800; // 30 minutes
    let secs = recall("kunju-active-secs", 0);
    const id = setInterval(() => {
      if (document.visibilityState && document.visibilityState !== "visible") return;
      secs += 15;
      persist("kunju-active-secs", secs);
      if (secs >= TARGET && recall("kunju-name", "")) {
        setShowReviewPrompt(true);
        clearInterval(id);
      }
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
      if (window.plausible) {
        const plan = params.get("plan");
        plausible(plan === "monthly" ? "abo_monthly" : "abo_annual");
      }
      window.history.replaceState({}, "", "/");
      // Background verify: sync DB status once webhook has likely landed
      if (window.__supa) {
        setTimeout(() => {
          window.__supa.auth.getUser().then(({
            data
          }) => {
            if (!data?.user) return;
            window.__supa.from("profiles").select("is_premium").eq("id", data.user.id).single().then(({
              data: profile
            }) => {
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
  const [trialExpiry, setTrialExpiry] = useState(() => {
    const d = recall("kunju-trial", null);
    return d ? d.exp : null;
  });
  function hasPaidAccess() {
    if (trialExpiry && Date.now() < trialExpiry) return true;
    if (authResolved && !supaUser) return false;
    const premExpired = isPremium && premiumUntil && new Date(premiumUntil) < new Date();
    return !premExpired && isPremium;
  }
  // Quiz access tier:
  //   "unlimited" → Premium or active trial (no daily cap)
  //   "limited"   → free account (20 quiz cards per day)
  //   "blocked"   → anonymous (must create a free account first)
  function quizTier() {
    if (hasPaidAccess()) return "unlimited";
    if (supaUser) return "limited";
    return "blocked";
  }
  const [authResolved, setAuthResolved] = useState(false);
  const paywallOnExpiryShown = useRef(false);
  const [showOffer, setShowOffer] = useState(false);
  const [bonusActive] = useState(() => isBonusActive());
  const deferredInstall = useRef(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIOSInstall, setShowIOSInstall] = useState(false);
  const [showPin, setShowPin] = useState(false);
  useEffect(() => {
    if (recall("kunju-install-dismissed", false)) return;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone === true || !!(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
    if (isStandalone) return;
    // Deferred Prompt evtl. schon vor React-Mount gefeuert
    if (window.__deferredInstallPrompt) {
      deferredInstall.current = window.__deferredInstallPrompt;
      window.__deferredInstallPrompt = null;
    }
    const handler = e => {
      e.preventDefault();
      deferredInstall.current = e;
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const installed = () => {
      setShowInstall(false);
      persist("kunju-install-dismissed", true);
    };
    window.addEventListener("appinstalled", installed);
    if (isIOS && isSafari) setShowIOSInstall(true);else if (deferredInstall.current) setShowInstall(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  async function handleInstall() {
    if (!deferredInstall.current) {
      dismissInstall();
      return;
    }
    deferredInstall.current.prompt();
    const {
      outcome
    } = await deferredInstall.current.userChoice;
    deferredInstall.current = null;
    setShowInstall(false);
    if (outcome === "accepted") persist("kunju-install-dismissed", true);
  }
  function dismissInstall() {
    persist("kunju-install-dismissed", true);
    setShowInstall(false);
  }
  function dismissIOSInstall() {
    persist("kunju-install-dismissed", true);
    setShowIOSInstall(false);
  }
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAcctPrompt, setShowAcctPrompt] = useState(false);
  const [showQuizLimit, setShowQuizLimit] = useState(false);
  const [showPlanSelect, setShowPlanSelect] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [pendingCoupon, setPendingCoupon] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(false);
  const [selPlan, setSelPlan] = useState("annual");
  function openPlanSelect() {
    if (!supaUser) {
      setPendingPayment(true);
      setShowLogin(true);
      return;
    }
    setShowPlanSelect(true);
  }
  async function goToStripe() {
    if (!supaUser) {
      setPendingPayment(true);
      setShowPlanSelect(false);
      setShowLogin(true);
      return;
    }
    try {
      const {
        data,
        error
      } = await window.__supa.functions.invoke("create-checkout-session", {
        body: {
          plan: selPlan === "annual" && (isBonusActive() || recall("kunju-fb-given", false)) ? "annual_bonus" : selPlan,
          userId: supaUser.id,
          email: supaUser.email
        }
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
    persist("kunju-trial", {
      exp
    });
    persist("kunju-offer-seen", Date.now());
    setTrialExpiry(exp);
    setShowOffer(false);
  }
  const savedDeepLinkRef = useRef(false);
  // Frisches Laden startet „Gemerkt" immer auf der Bibliotheks-Übersicht — nicht
  // im zuletzt geöffneten Detail (z. B. Challenge-Editor), das sonst klebenbleibt.
  const didResetSavedRef = useRef(false);
  if (!didResetSavedRef.current) {
    didResetSavedRef.current = true;
    try { if (recall("kunju-saved-sub", "home") !== "home") persist("kunju-saved-sub", "home"); } catch (e) {}
  }
  function handleTabSwitch(id) {
    // Merken (saved) stays Premium-only.
    if (id === "saved" && !hasPaidAccess()) {
      setShowPaywall(true);
      return;
    }
    // „Gemerkt" öffnet immer die Bibliotheks-Übersicht — außer ein Deep-Link
    // (z. B. direkt nach dem Challenge-Anlegen) will gezielt einen Unterbereich zeigen.
    if (id === "saved") {
      if (savedDeepLinkRef.current) savedDeepLinkRef.current = false;
      else persist("kunju-saved-sub", "home");
    }
    // Quiz: anonymous → create-account prompt; free account → 20/day cap.
    if (id === "quiz") {
      const tier = quizTier();
      if (tier === "blocked") {
        setShowAcctPrompt(true);
        return;
      }
      if (tier === "limited" && readQuizDayCount() >= QUIZ_FREE_LIMIT) {
        setShowQuizLimit(true);
        return;
      }
    }
    setTab(id);
  }
  // Beim Tab-Wechsel immer nach oben scrollen, damit der Header (Begrüßung,
  // Logo, Sprachen, Challenge) statisch oben bleibt und nicht „mitwandert".
  useEffect(() => {
    try { window.scrollTo(0, 0); } catch (e) {}
    const se = document.scrollingElement; if (se) se.scrollTop = 0;
    const ph = document.querySelector(".phone"); if (ph) ph.scrollTop = 0;
  }, [tab]);
  // Jump from a Conjugate card straight into the Learn tab at that tense.
  const [learnJump, setLearnJump] = useState(null);
  function goToLearnTense(tenseId) {
    setLearnJump(tenseId);
    setTab("grammar");
  }

  // After auth resolves: enforce tab access — kick users who got in before auth was ready
  useEffect(() => {
    if (!authResolved) return;
    if (tab === "saved") {
      if (!hasPaidAccess()) {
        setTab("conjugate");
        setShowPaywall(true);
      }
      return;
    }
    if (tab === "quiz") {
      const tier = quizTier();
      if (tier === "blocked") {
        setTab("conjugate");
        setShowAcctPrompt(true);
      } else if (tier === "limited" && readQuizDayCount() >= QUIZ_FREE_LIMIT) {
        setTab("conjugate");
        setShowQuizLimit(true);
      }
    }
  }, [authResolved, supaUser, isPremium, premiumUntil, trialExpiry]);

  // Learn is a whole-tab hint; quiz modes & Saved areas request theirs from
  // inside their views (see requestHint passed down below).
  useEffect(() => {
    // Open every tab at the top (the .content container keeps its scroll otherwise).
    const c = document.querySelector(".content");
    if (c) c.scrollTop = 0;
    if (tab === "grammar") requestHint("learn");
  }, [tab]);

  // Show a requested hint shortly after, unless a bigger modal is up. Once each.
  useEffect(() => {
    if (!pendingHint) return;
    if (recall("kunju-hint-" + pendingHint, false)) {
      setPendingHint(null);
      return;
    }
    if (showOnboard || showTour || showPaywall || featureHint) return;
    const id = setTimeout(() => {
      setFeatureHint(pendingHint);
      setPendingHint(null);
    }, 1600);
    return () => clearTimeout(id);
  }, [pendingHint, showOnboard, showTour, showPaywall, featureHint]);

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

  // After the 24h trial ends, show the welcome-bonus offer (24,99 €/yr) once,
  // as long as we're still inside the 7-day bonus window and not yet premium.
  const welcomeOfferShown = useRef(false);
  useEffect(() => {
    if (welcomeOfferShown.current) return;
    if (showOnboard || showTour || showPaywall) return;
    if (isPremium) return;
    if (!bonusActive) return; // 7-day window over
    if (!trialExpiry || Date.now() < trialExpiry) return; // still inside the 24h trial
    if (recall("kunju-welcomeoffer-seen", false)) return; // show once
    welcomeOfferShown.current = true;
    /* Willkommensrabatt abgeschafft — WelcomeOffer-Popup deaktiviert */
  }, [showOnboard, showTour, showPaywall, isPremium, bonusActive, trialExpiry]);

  // Load-time journey triggers for anonymous users (one per load, prioritised):
  //   T-End-Anon → 24h trial over, no account
  //   P8         → returning visitor (gap since last visit), no account
  const loadJourneyShown = useRef(false);
  useEffect(() => {
    if (loadJourneyShown.current) return;
    if (!authResolved) return;
    if (showOnboard || showTour) return;
    const lastSeen = recall("kunju-lastseen", 0);
    const now = Date.now();
    const returning = lastSeen && now - lastSeen > 6 * 60 * 60 * 1000; // ≥6h gap
    persist("kunju-lastseen", now);
    if (supaUser) return; // journey nudges are for anonymous schnupperer
    loadJourneyShown.current = true;
    const trialOver = trialExpiry && now >= trialExpiry;
    if (trialOver && !recall("kunju-j-tend", false)) {
      setJourney(j => j || "tend");
    } else if (returning && recall("kunju-name", "") && now - recall("kunju-j-p8-at", 0) > 24 * 60 * 60 * 1000) {
      setJourney(j => j || "p8");
    }
  }, [authResolved, supaUser, trialExpiry, showOnboard, showTour]);

  // P3 · Letzte Chance — anonymous, trial about to end (<60 min left) or exit intent.
  const p3Shown = useRef(false);
  useEffect(() => {
    if (recall("kunju-j-p3", false)) return;
    function maybe() {
      if (p3Shown.current) return;
      if (supaUser || !trialExpiry) return;
      const left = trialExpiry - Date.now();
      if (left > 0 && left < 60 * 60 * 1000) {
        p3Shown.current = true;
        setJourney(j => j || "p3");
      }
    }
    const id = setInterval(maybe, 30000);
    maybe();
    // Desktop exit-intent: pointer leaves the top of the viewport.
    const onLeave = e => {
      if (p3Shown.current || supaUser || !trialExpiry) return;
      if (Date.now() >= trialExpiry) return;
      if (e.clientY <= 0) { p3Shown.current = true; setJourney(j => j || "p3"); }
    };
    document.addEventListener("mouseout", onLeave);
    return () => { clearInterval(id); document.removeEventListener("mouseout", onLeave); };
  }, [supaUser, trialExpiry]);

  // Loggt sich jemand ein, während gerade ein Conversion-Nudge offen liegt
  // (z. B. über den Header-Login statt über den Nudge-Button), diesen Nudge
  // sofort schließen — „Hol dir ein Konto" ergibt für Eingeloggte keinen Sinn.
  // Hilfe- und Kachel-Tipp bleiben stehen (gelten auch für Konto-Nutzer).
  useEffect(() => {
    if (supaUser && journey && ["p1", "p2", "p3", "tend", "p8"].indexOf(journey) >= 0) {
      setJourney(null);
    }
  }, [supaUser, journey]);

  // Submit P5 feedback: write to the reviews table + flag the profile so the
  // €5 discount (annual_bonus, server-verified) becomes available. Returns ok.
  async function submitFeedback(stars, body) {
    try {
      if (!window.__supa || !supaUser) return false;
      const ins = await window.__supa.from("reviews").insert({
        user_id: supaUser.id,
        name: name || supaUser.email.split("@")[0],
        stars: stars || 5,
        body: body
      });
      if (ins.error) return false;
      const codeExpiry = premiumUntil || (trialExpiry ? new Date(trialExpiry).toISOString() : null);
      await window.__supa.from("profiles").upsert({
        id: supaUser.id,
        feedback_given: true,
        welcome_code: "WILLKOMMEN",
        code_expires_at: codeExpiry
      });
      persist("kunju-fb-given", true);
      persist("kunju-review-done", true);
      setShowReviewPrompt(false);
      setShowFbThanks(true);
      return true;
    } catch (e) {
      return false;
    }
  }
  function closeJourney() {
    if (journey === "p1") persist("kunju-j-p1", true);
    else if (journey === "p2") persist("kunju-j-p2", true);
    else if (journey === "p3") persist("kunju-j-p3", true);
    else if (journey === "tend") persist("kunju-j-tend", true);
    else if (journey === "p8") { persist("kunju-j-p8-at", Date.now()); }
    else if (journey === "reorder") persist("kunju-j-reorder", true);
    else if (journey === "help") persist("kunju-j-help", true);
    setJourney(null);
  }
  function journeyAccount() {
    closeJourney();
    setShowLogin(true);
  }
  function journeyHomeScreen() {
    closeJourney();
    if (deferredInstall.current) handleInstall();else setShowPin(true);
  }

  // Auth: listen for Supabase login/logout
  useEffect(() => {
    function onAuth(e) {
      setAuthResolved(true);
      const user = e.detail;
      setSupaUser(user);
      if (!user) {
        // Logged out or no session — premium requires an account, reset stale state
        resetVocabSync(); // keine weiteren Cloud-Schreibvorgänge ohne Konto
        if (recall("kunju-premium", false)) {
          persist("kunju-premium", false);
          persist("kunju-premium-until", null);
          setIsPremium(false);
          setPremiumUntil(null);
        }
        return;
      }
      // Use the first name from the login profile (Google / email signup),
      // not the email prefix — only when the user hasn't set a name yet.
      if (!recall("kunju-name", null)) {
        const m = user.user_metadata || {};
        const full = (m.full_name || m.name || "").trim();
        const fn = (m.given_name || m.first_name || (full ? full.split(/\s+/)[0] : "")).trim();
        if (fn) { persist("kunju-name", fn); setName(fn); }
      }
      // One-time welcome gift: creating/using a free account grants 2 days of
      // Premium. Stored device-locally (mirrors the existing trial mechanism);
      // skipped if the user already has Premium or already received it here.
      if (!recall("kunju-acct-trial", false) && !recall("kunju-premium", false)) {
        const exp = Date.now() + 2 * 24 * 60 * 60 * 1000;
        persist("kunju-trial", {
          exp
        });
        persist("kunju-acct-trial", true);
        if (window.plausible) plausible("trial_start");
        setTrialExpiry(exp);
        // Bestätigung nach der Konto-Erstellung (E-Mail bestätigt + zurück in der App)
        setToastMsg(tr("acct_created"));
      }
      if (user && window.__supa) {
        // Wortschatz aus dem Konto laden & vereinen (Listen überleben Gerätewechsel)
        mergeVocabFromCloud(user.id);
        // Load cloud favorites + premium status on login
        window.__supa.from("favorites").select("lang,verb").eq("user_id", user.id).then(({
          data
        }) => {
          if (data && data.length) {
            setFavs(prev => {
              const merged = [...prev];
              data.forEach(f => {
                if (!merged.some(x => x.lang === f.lang && x.verb === f.verb)) merged.push(f);
              });
              persist("kunju-favs", merged);
              return merged;
            });
          }
        });
        window.__supa.from("profiles").select("is_premium,premium_until").eq("id", user.id).single().then(({
          data: p
        }) => {
          if (p?.is_premium) {
            persist("kunju-premium", true);
            setIsPremium(true);
          } else if (recall("kunju-premium", false)) {
            // DB says not premium but localStorage says yes → expired/cancelled
            persist("kunju-premium", false);
            setIsPremium(false);
            if (!paywallOnExpiryShown.current) {
              paywallOnExpiryShown.current = true;
              setShowPaywall(true);
            }
          }
          if (p?.premium_until) {
            persist("kunju-premium-until", p.premium_until);
            setPremiumUntil(p.premium_until);
          }
        });
        // Return to coupon box or stripe after login if user came from there
        if (pendingCoupon) {
          setShowLogin(false);
          setShowPlanSelect(true);
        } else if (pendingPayment) {
          setShowLogin(false);
          setPendingPayment(false);
          const plan = selPlan === "annual" && isBonusActive() ? "annual_bonus" : selPlan;
          window.__supa.functions.invoke("create-checkout-session", {
            body: {
              plan,
              userId: user.id,
              email: user.email
            }
          }).then(({
            data,
            error
          }) => {
            if (error || !data?.url) {
              setToastMsg(tr("pay_error"));
              return;
            }
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
  const adSession = useRef({
    shown: 0,
    dismissed: false,
    conjSince: 999
  });
  const [adVisible, setAdVisible] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [sysDark, setSysDark] = useState(() => !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches));
  const [daily, setDaily] = useState(() => readDaily());
  const [showGoalCelebration, setShowGoalCelebration] = useState(false);
  const [showGoalSuccess, setShowGoalSuccess] = useState(false);
  const [reportCtx, setReportCtx] = useState(null); // Melde-Sheet (Fehler/Feedback)
  useEffect(() => { window.__openReport = (c) => setReportCtx(Object.assign({ kind: "general", lang: lang }, c || {})); }, [lang]);
  // Beim 3. App-Start einmalig um Mithilfe bitten (Fehler melden).
  useEffect(() => {
    if (sessionStorage.getItem("kunju-openctr")) return;
    sessionStorage.setItem("kunju-openctr", "1");
    const n = recall("kunju-opens", 0) + 1;
    persist("kunju-opens", n);
    if (n >= 3 && !recall("kunju-j-help", false)) setJourney(j => j || "help");
  }, []);
  const [showStreak, setShowStreak] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [goalStep, setGoalStep] = useState("choose");
  const [goalSet, setGoalSet] = useState(() => recall("kunju-goal", false));
  const [goal, setGoal] = useState(() => recall("kunju-goal-data", null));
  // Eine echte, aktive Challenge = gespeicherte Liste mit mind. einem Eintrag.
  // (Der reine kunju-goal-Flag kann nach abgebrochenen Flows veralten.)
  function hasRealChallenge() {
    return !!(goal && Array.isArray(goal.verbList) && (goal.verbList.length || (goal.wordList || []).length));
  }
  // Standard-Challenge (Konto ohne Premium): fest vorgegeben, nichts einzustellen.
  // An ~20 Karten/Tag angelehnt — kompakter 2-Wochen-Plan.
  function createPresetChallenge() {
    const data = { weeks: 2, verbs: 8, words: 0, tenseCount: 2, perDay: 12, preset: true };
    const saved = {
      ...data,
      startDate: new Date().toDateString(),
      ...buildChallengeLists(data, lang)
    };
    persist("kunju-goal", true);
    persistGoal(lang, saved);
    setGoalSet(true);
    setGoal(saved);
    setDaily(readDaily());
    return saved;
  }
  // Einheitlicher Challenge-Einstieg: Konto zuerst (anonym). Premium legt frei an,
  // Standard bekommt eine vorgegebene Challenge. Zieltafel bei echter Challenge.
  function openChallenge() {
    if (typeof closeSkHint === "function") closeSkHint();
    if (hasRealChallenge()) { setShowStreak(true); return; }  // echte Challenge → Zieltafel
    if (hasPaidAccess()) { setGoalStep("choose"); setShowGoal(true); return; } // Premium/Trial → frei anlegen
    if (!supaUser) { setShowPaywall(true); return; }          // anonym ohne Zugang → erst Konto anlegen
    createPresetChallenge();                                  // Konto ohne Premium → Standard-Challenge
    setShowStreak(true);
  }
  const [skHint, setSkHint] = useState(() => !recall("kunju-skhint", false));
  function closeSkHint() {
    setSkHint(false);
    persist("kunju-skhint", true);
  }
  const [offline, setOffline] = useState(() => !navigator.onLine);
  useEffect(() => {
    const on = () => setOffline(false),
      off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  function onActivity() {
    // Free accounts: each quiz card counts toward the 20/day cap.
    // (Merken/vocab practice is Premium-only, so it never reaches the "limited" tier.)
    if (tab === "quiz" && quizTier() === "limited") {
      const used = bumpQuizDay();
      if (used >= QUIZ_FREE_LIMIT) setShowQuizLimit(true);
    }
    const prev = daily.count;
    const next = bumpDaily();
    setDaily(next);
    if (prev < next.goal && next.count >= next.goal) {
      setShowGoalCelebration(true);
    }
    bumpJourney();
  }
  // Behavioural journey counter (anonymous only): P1 after 5 verbs,
  // P2 (home-screen tip) after ~12 rounds. One window, gated, shown once.
  function bumpJourney() {
    // Reorder-Hinweis: einmalig für ALLE Nutzer (auch eingeloggte), nach etwas Nutzung.
    if (!recall("kunju-j-reorder", false)) {
      const acts = recall("kunju-acts", 0) + 1;
      persist("kunju-acts", acts);
      if (acts >= 8) setJourney(j => j || "reorder");
    }
    if (supaUser) return; // P1/P2 target anonymous schnupperer
    const r = recall("kunju-jrounds", 0) + 1;
    persist("kunju-jrounds", r);
    const standalone = window.navigator.standalone === true || !!(window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);
    if (r === 5 && !recall("kunju-j-p1", false)) {
      setJourney(j => j || "p1");
    } else if (r >= 12 && !standalone && !recall("kunju-j-p2", false) && !recall("kunju-install-dismissed", false)) {
      setJourney(j => j || "p2");
    }
  }
  const adTimer = useRef(null);
  function maybeShowAd() {
    const s = adSession.current;
    if (s.dismissed) return;
    if (s.shown >= 1 && s.conjSince < 4) return;
    const today = new Date().toDateString();
    const day = recall("kunju-adday", {
      d: "",
      n: 0
    });
    const todayN = day.d === today ? day.n : 0;
    if (todayN >= 8) return;
    s.shown += 1;
    s.conjSince = 0;
    persist("kunju-adday", {
      d: today,
      n: todayN + 1
    });
    if (adTimer.current) clearTimeout(adTimer.current);
    adTimer.current = setTimeout(() => setAdVisible(true), 400);
  }
  function onAdClick() {
    const n = recall("kunju-adclicks", 0) + 1;
    persist("kunju-adclicks", n);
  }
  function onAdDismiss() {
    adSession.current.dismissed = true;
    setAdVisible(false);
  }
  const engine = window.CONJ[lang];
  const pendingRef = useRef(null);
  function addHistory(lg, vb) {
    setHistory(h => {
      const nx = [{
        lang: lg,
        verb: vb
      }, ...h.filter(x => !(x.lang === lg && x.verb === vb))].slice(0, 24);
      persist("kunju-history", nx);
      return nx;
    });
  }
  function switchLang(newLang) {
    if (newLang === lang) return;
    const cur = result && !result.error ? result.infinitive.replace(/^to /, "") : verb.trim().toLowerCase();
    const target = cur ? conceptTranslate(cur, lang, newLang) : null;
    if (target) {
      pendingRef.current = target;
      setLang(newLang);
      return;
    }
    if (cur && window.__hasAI()) {
      pendingRef.current = null;
      setTranslating(true);
      const fromName = window.CONJ[lang].name,
        toName = window.CONJ[newLang].name;
      setLang(newLang);
      window.aiComplete(`Translate the verb "${cur}" from ${fromName} to its ${toName} infinitive. Reply with ONLY the single infinitive word in ${toName}, lowercase, no article, no extra text.`).then(txt => {
        const w = String(txt || "").trim().toLowerCase().replace(/^to\s+/, "").split(/\s+/)[0].replace(/[^a-zà-ÿ'’-]/gi, "");
        if (w) {
          setVerb(w);
          const r = window.CONJ[newLang].conjugate(w);
          setResult(r);
          if (r && !r.error) addHistory(newLang, r.infinitive);
        }
        setTranslating(false);
      }).catch(() => setTranslating(false));
      return;
    }
    setLang(newLang);
  }
  useEffect(() => {
    persist("kunju-lang", lang);
    setAdVisible(false);
    setDeconj(null);
    setActiveInf(null);
    if (pendingRef.current) {
      const vb = pendingRef.current;
      pendingRef.current = null;
      setVerb(vb);
      const r = conjugateMaybeReflexive(lang, vb);
      setResult(r);
      if (r && !r.error) {
        setLastVerb(vb);
        addHistory(lang, r.infinitive);
        adSession.current.conjSince += 1;
        maybeShowAd();
      }
    } else {
      setResult(null);
      setVerb("");
    }
  }, [lang]);
  function finishConjugate(lg, v, r) {
    setResult(r);
    if (r && !r.error) {
      setLastVerb(v);
      addHistory(lg, r.infinitive);
      adSession.current.conjSince += 1;
      setAdVisible(false);
      maybeShowAd();
      onActivity();
    }
  }
  function onConjugate(v) {
    const raw = (v || "").trim();
    if (!raw) {
      setResult(null);
      setDeconj(null);
      setActiveInf(null);
      return;
    }

    // 0) Reflexive infinitive (lavarse / se laver / sich freuen / zich …) → conjugate directly.
    const Rfx = REFLEX[lang];
    if (Rfx && Rfx.detect(raw.toLowerCase())) {
      setDeconj(null);
      setActiveInf(null);
      finishConjugate(lang, raw, conjugateMaybeReflexive(lang, raw));
      return;
    }

    // 1) Already a known infinitive → conjugate it directly.
    if (isKnownInfinitive(lang, raw)) {
      setDeconj(null);
      setActiveInf(null);
      finishConjugate(lang, raw, conjugateMaybeReflexive(lang, raw));
      return;
    }
    // 2) Looks inflected → reverse-lookup the infinitive, person & tense.
    const dq = deconjugate(lang, raw);
    if (dq) {
      const target = dq.infinitives[0];
      setDeconj(dq);
      setActiveInf(target.base);
      setVerb(target.base); // auto-switch the field to the infinitive
      finishConjugate(lang, target.base, conjugateMaybeReflexive(lang, target.base));
      return;
    }
    // 3) Nothing recognised → fall back (shows the engine's guidance/error).
    setDeconj(null);
    setActiveInf(null);
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
    if (lg !== lang) {
      pendingRef.current = vb;
      setLang(lg);
    } else {
      setVerb(vb);
      onConjugate(vb);
    }
  }
  // Deep-Link von den SEO-Verb-Seiten: ?lang=es&verb=estar → direkt dieses Verb
  // konjugieren (zeigt die richtige Form). Läuft einmalig beim Laden.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dlVerb = (params.get("verb") || "").trim().toLowerCase().replace(/[^a-zà-ÿ'’\- ]/gi, "");
    if (!dlVerb) return;
    let dlLang = (params.get("lang") || "").trim().toLowerCase();
    if (!window.CONJ || !window.CONJ[dlLang]) dlLang = lang;
    pickVerb(dlLang, dlVerb);
    // Onboarding (NameGate/Tour) für Deep-Link-Besucher überspringen: sie sollen
    // SOFORT ihre Konjugation sehen — der Aha-Moment, der konvertiert.
    setShowOnboard(false);
    setShowTour(false);
    // Deep-Link-Parameter aus der URL entfernen (UTM bleibt für Analytics erhalten)
    const url = new URL(window.location.href);
    ["verb", "lang", "tense", "pron"].forEach(k => url.searchParams.delete(k));
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  }, []);
  // Deep-Link von der Landingpage: ?checkout=annual|monthly → direkt die
  // Tarif-Auswahl öffnen (identisch zum „Premium holen"-Button in der App).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const co = (params.get("checkout") || "").trim().toLowerCase();
    if (co !== "annual" && co !== "monthly") return;
    setSelPlan(co === "monthly" ? "monthly" : "annual");
    setShowOnboard(false);
    setShowTour(false);
    openPlanSelect();
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  }, []);
  function toggleFav(lg, vb) {
    const exists = favs.some(x => x.lang === lg && x.verb === vb);
    const nx = exists ? favs.filter(x => !(x.lang === lg && x.verb === vb)) : [{
      lang: lg,
      verb: vb
    }, ...favs];
    persist("kunju-favs", nx);
    setFavs(nx);
    if (supaUser && window.__supa) {
      if (exists) window.__supa.from("favorites").delete().match({
        user_id: supaUser.id,
        lang: lg,
        verb: vb
      });else window.__supa.from("favorites").insert({
        user_id: supaUser.id,
        lang: lg,
        verb: vb
      });
    }
  }
  function clearHistory() {
    setHistory(h => {
      const nx = h.filter(x => x.lang !== lang);
      persist("kunju-history", nx);
      return nx;
    });
  }
  useEffect(() => {
    const root = document.getElementById("approot");
    let th = t.theme;
    if (th === "auto") th = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.dataset.theme = th;
    root.dataset.accent = t.accent;
    root.dataset.font = t.font;
    root.dataset.density = t.density;
    root.style.setProperty("--radius", t.radius + "px");
    root.style.setProperty("--lang-color", LANG_META[lang].color);
  }, [t, sysDark, lang]);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const h = e => setSysDark(e.matches);
    mq.addEventListener ? mq.addEventListener("change", h) : mq.addListener(h);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", h) : mq.removeListener(h);
    };
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "device"
  }, /*#__PURE__*/React.createElement("div", {
    className: "phone"
  }, /*#__PURE__*/React.createElement("header", {
    className: "appbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "appbar-side appbar-left"
  }, /*#__PURE__*/React.createElement("span", {
    className: "appbar-greet"
  }, name ? tr("hi", { name: name }) : supaUser ? tr("hi", { name: supaUser.email.split("@")[0] }) : "👋")), /*#__PURE__*/React.createElement("div", {
    className: "appbar-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "brand-name",
    style: {
      color: "var(--text)"
    }
  }, "Conju", /*#__PURE__*/React.createElement("b", null, "Expert"))), /*#__PURE__*/React.createElement("div", {
    className: "appbar-side appbar-right"
  }, /*#__PURE__*/React.createElement("button", {
    className: "streakpill",
    onClick: () => openChallenge(),
    title: tr("sk_title")
  }, /*#__PURE__*/React.createElement("span", {
    className: "sbars",
    "data-done": daily.count >= daily.goal ? "1" : "0"
  }, [0, 1, 2, 3, 4].map(i => {
    const filled = Math.round(Math.min(daily.count / daily.goal, 1) * 5);
    const on = i < filled;
    const cols = ["#ff3b5c", "#ff8a18", "#ffc400", "#1fbf6b", "#a557ff"];
    return /*#__PURE__*/React.createElement("i", {
      key: i,
      className: on ? "on" : "",
      style: on ? {
        background: cols[i],
        color: cols[i]
      } : undefined
    });
  })), /*#__PURE__*/React.createElement("span", {
    className: "streakflame",
    dangerouslySetInnerHTML: { __html: "<svg viewBox='0 0 24 24' width='12' height='12' fill='none' stroke='currentColor' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 13l4 4L19 7'/></svg>" }
  }), /*#__PURE__*/React.createElement("b", {
    className: "streaknum" + (daily.streak > 0 ? "" : " zero")
  }, daily.streak)))), showLogin && /*#__PURE__*/React.createElement(LoginModal, {
    onClose: () => setShowLogin(false),
    fromPayment: pendingPayment
  }), showDeletedMsg && /*#__PURE__*/React.createElement(AccountDeletedModal, {
    onClose: () => setShowDeletedMsg(false),
    wasPremium: deletedWasPremium
  }), showInstall && /*#__PURE__*/React.createElement(InstallBanner, {
    onInstall: handleInstall,
    onDismiss: dismissInstall,
    onHow: () => setShowPin(true)
  }), showIOSInstall && !showInstall && /*#__PURE__*/React.createElement(IOSInstallBanner, {
    onDismiss: dismissIOSInstall,
    onHow: () => setShowPin(true)
  }), showPin && /*#__PURE__*/React.createElement(PinSheet, {
    onClose: () => setShowPin(false),
    onAndroid: handleInstall
  }), (!isPremium || !supaUser) && /*#__PURE__*/React.createElement(BonusBar, {
    onOpen: () => openPlanSelect(),
    trialExpiry: trialExpiry,
    bonusActive: bonusActive,
    name: name
  }), /*#__PURE__*/React.createElement(LanguageBar, {
    lang: lang,
    setLang: switchLang
  }), (() => {
    // Aktive Challenge → Status-/Rückhol-Leiste. Keine Challenge (aber onboarded)
    // → einladende „Challenge starten"-Leiste (sichtbarer Einstieg, #27).
    const onboarded = !!(name && String(name).trim());
    if (hasRealChallenge() && hasPaidAccess()) {
      const gd = (goal.weeks || 2) * 7;
      const day = goal.startDate ? Math.min(gd, Math.floor((Date.now() - new Date(goal.startDate)) / 86400000) + 1) : 1;
      const left = Math.max(0, (daily.goal || 0) - (daily.count || 0));
      const done = left <= 0;
      return /*#__PURE__*/React.createElement("button", {
        className: "chstrip",
        onClick: () => openChallenge(),
        title: tr("sk_title")
      }, /*#__PURE__*/React.createElement("span", {
        className: "chstrip-ic",
        dangerouslySetInnerHTML: { __html: IC_LIST }
      }), /*#__PURE__*/React.createElement("span", {
        className: "chstrip-main"
      }, "Challenge \xB7 ", tr("cs_day"), " ", day, "/", gd), /*#__PURE__*/React.createElement("span", {
        className: "chstrip-right" + (done ? " done" : "")
      }, done ? tr("cs_done") : tr("cs_left", { n: left })), /*#__PURE__*/React.createElement("span", {
        className: "chstrip-arr"
      }, "›"));
    }
    if (!hasRealChallenge() && onboarded) {
      return /*#__PURE__*/React.createElement("button", {
        className: "chstrip chstrip-start",
        onClick: () => openChallenge(),
        title: tr("sk_title")
      }, /*#__PURE__*/React.createElement("span", {
        className: "chstrip-ic",
        dangerouslySetInnerHTML: { __html: IC_LIST }
      }), /*#__PURE__*/React.createElement("span", {
        className: "chstrip-main"
      }, tr("cs_start")), /*#__PURE__*/React.createElement("span", {
        className: "chstrip-right"
      }, tr("cs_plan")), /*#__PURE__*/React.createElement("span", {
        className: "chstrip-arr"
      }, "›"));
    }
    return null;
  })(), /*#__PURE__*/React.createElement(Tabs, {
    tab: tab,
    setTab: handleTabSwitch,
    profile: supaUser ? /*#__PURE__*/React.createElement(UserMenu, {
      user: supaUser,
      name: name,
      isPremium: isPremium,
      premiumUntil: premiumUntil,
      nav: true,
      greet: tr("hi", { name: name || supaUser.email.split("@")[0] }),
      onDeleted: info => {
        setDeletedWasPremium(isPremium ? { until: info?.premiumUntil || null } : null);
        persist("kunju-premium", false);
        persist("kunju-premium-until", null);
        setIsPremium(false);
        setPremiumUntil(null);
        setShowDeletedMsg(true);
      },
      onEditName: () => setShowOnboard(true),
      onTarife: () => setShowPricing(true),
      onPin: () => setShowPin(true)
    }) : /*#__PURE__*/React.createElement(GuestMenu, {
      name: name,
      nav: true,
      greet: name ? tr("hi", { name }) : tr("menu_login"),
      onLogin: () => setShowLogin(true),
      onEditName: () => setShowOnboard(true),
      onTarife: () => setShowPricing(true),
      onPin: () => setShowPin(true)
    })
  }), offline && /*#__PURE__*/React.createElement("div", {
    className: "offlinebar"
  }, tr("offline_note")), /*#__PURE__*/React.createElement("main", {
    className: "content"
  }, tab === "conjugate" && /*#__PURE__*/React.createElement(ConjugateView, {
    engine: engine,
    lang: lang,
    verb: verb,
    setVerb: setVerb,
    result: result,
    onConjugate: onConjugate,
    t: t,
    favs: favs,
    toggleFav: toggleFav,
    history: history,
    clearHistory: clearHistory,
    pickVerb: pickVerb,
    adVisible: adVisible,
    onAdClick: onAdClick,
    onAdDismiss: onAdDismiss,
    name: name,
    translating: translating,
    deconj: deconj,
    activeInf: activeInf,
    onViewInf: viewInfinitive,
    onTab: handleTabSwitch,
    onLearnTense: goToLearnTense
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: tab === "quiz" ? "contents" : "none"
    }
  }, /*#__PURE__*/React.createElement(QuizView, {
    lang: lang,
    favs: favs,
    toggleFav: toggleFav,
    sound: t.sound,
    skill: skill,
    onSkill: setSkl,
    onStudy: pickVerb,
    onActivity: onActivity,
    isActive: tab === "quiz",
    onTab: handleTabSwitch,
    onHint: requestHint
  })), tab === "grammar" && /*#__PURE__*/React.createElement(LearnView, {
    lang: lang,
    engine: engine,
    sound: t.sound,
    native: native,
    setNative: setNat,
    onStudy: pickVerb,
    jumpTense: learnJump,
    onJumpDone: () => setLearnJump(null)
  }), tab === "saved" && /*#__PURE__*/React.createElement(SavedTab, {
    key: "saved-" + recall("kunju-saved-sub", "home"),
    lang: lang,
    favs: favs,
    toggleFav: toggleFav,
    pickVerb: pickVerb,
    onActivity: onActivity,
    onHint: requestHint,
    onOpenGoal: () => { setGoalStep("choose"); setShowGoal(true); },
    onTab: handleTabSwitch,
    challengeEditable: hasPaidAccess()
  })), /*#__PURE__*/React.createElement(AppTweaks, {
    t: t,
    setTweak: setTweak,
    name: name,
    commitName: commitName
  }), showPaySuccess && /*#__PURE__*/React.createElement(PaymentSuccess, {
    name: name,
    onClose: () => setShowPaySuccess(false)
  }), showReviewPrompt && (supaUser && !isPremium && !recall("kunju-fb-given", false)
    ? /*#__PURE__*/React.createElement(FeedbackPop, {
        onSubmit: submitFeedback,
        onClose: () => {
          setShowReviewPrompt(false);
          persist("kunju-active-secs", 600);
        }
      })
    : /*#__PURE__*/React.createElement(ReviewPrompt, {
    name: name,
    onRate: () => {
      persist("kunju-review-done", true);
      setShowReviewPrompt(false);
      rateApp();
    },
    onFeedback: () => {
      persist("kunju-review-done", true);
      setShowReviewPrompt(false);
      try {
        window.location.href = "mailto:hello@conjuexpert.app?subject=" + encodeURIComponent("Wunsch / Feedback zu ConjuExpert");
      } catch (e) {}
    },
    onClose: () => {
      setShowReviewPrompt(false);
      persist("kunju-active-secs", 600);
    }
  })), showFbThanks && /*#__PURE__*/React.createElement(JourneyPop, {
    badge: "smile",
    head: tr("cj_fbt_head"),
    html: tr("cj_fbt_text"),
    primaryLabel: tr("cj_fb_secure"),
    primaryKind: "rb",
    onPrimary: () => { setShowFbThanks(false); setSelPlan("annual"); openPlanSelect(); },
    secondaryLabel: tr("cj_later"),
    onSecondary: () => setShowFbThanks(false),
    onClose: () => setShowFbThanks(false)
  }), journey && !showOnboard && !showTour && !showPaywall && !showLogin && !showPlanSelect && /*#__PURE__*/React.createElement(JourneyPop, {
    badge: journey === "reorder" ? null : journey === "p1" ? "bars" : journey === "p2" ? "home" : journey === "p3" ? "save" : journey === "tend" ? "clock" : "smile",
    media: journey === "reorder" ? /*#__PURE__*/React.createElement(ReorderDemo) : null,
    head: tr(journey === "help" ? "cj_help_head" : journey === "reorder" ? "cj_reorder_head" : journey === "p1" ? "cj_p1_head" : journey === "p2" ? "cj_p2_head" : journey === "p3" ? "cj_p3_head" : journey === "tend" ? "cj_tend_head" : "cj_p8_head"),
    html: tr(journey === "help" ? "cj_help_text" : journey === "reorder" ? "cj_reorder_text" : journey === "p1" ? "cj_p1_text" : journey === "p2" ? "cj_p2_text" : journey === "p3" ? "cj_p3_text" : journey === "tend" ? "cj_tend_text" : "cj_p8_text"),
    primaryLabel: tr(journey === "help" ? "report_general" : journey === "reorder" ? "cj_p2_yes" : journey === "p2" ? "cj_p2_yes" : journey === "p3" ? "cj_p3_yes" : journey === "tend" ? "cj_tend_yes" : "cj_acc"),
    primaryKind: "ink",
    onPrimary: journey === "help" ? () => { closeJourney(); if (window.__openReport) window.__openReport({ kind: "general" }); } : (journey === "reorder" || journey === "p2" ? journeyHomeScreen : journeyAccount),
    secondaryLabel: journey === "reorder" ? tr("sk_close") : tr(journey === "help" ? "cj_later" : journey === "p2" ? "cj_no_thx" : journey === "p3" ? "cj_p3_no" : journey === "tend" ? "cj_tend_no" : "cj_later"),
    onSecondary: closeJourney,
    onClose: closeJourney
  }), showOnboard && /*#__PURE__*/React.createElement(NameGate, {
    initial: name,
    editing: !!name,
    native: native,
    setNative: setNat,
    skill: skill,
    setSkill: setSkl,
    onSubmit: commitName,
    onClose: () => setShowOnboard(false)
  }), !showOnboard && showTour && /*#__PURE__*/React.createElement(TourGate, {
    onDone: finishTour
  }), featureHint && !showOnboard && !showTour && !showPaywall && /*#__PURE__*/React.createElement(FeatureHint, {
    kind: featureHint,
    onClose: closeFeatureHint
  }), showOffer && !showOnboard && !showTour && !showPaywall && /*#__PURE__*/React.createElement(WelcomeOffer, {
    afterTrial: true,
    onSecure: () => {
      persist("kunju-welcomeoffer-seen", true);
      setShowOffer(false);
      setShowPlanSelect(true);
    },
    onTrial: () => {
      persist("kunju-welcomeoffer-seen", true);
      setShowOffer(false);
    }
  }), showPaywall && /*#__PURE__*/React.createElement(PaywallSheet, {
    onUpgrade: () => {
      setShowPaywall(false);
      openPlanSelect();
    },
    onClose: () => setShowPaywall(false)
  }), showAcctPrompt && /*#__PURE__*/React.createElement(PaywallSheet, {
    lock: tr("ap_lock"),
    title: tr("ap_h1"),
    sub: tr("ap_sub"),
    rows: [[tr("ap_feat1"), ""], [tr("ap_feat2"), ""], [tr("ap_feat3"), ""]],
    cta: tr("ap_cta"),
    onUpgrade: () => {
      setShowAcctPrompt(false);
      setShowLogin(true);
    },
    onClose: () => setShowAcctPrompt(false)
  }), showQuizLimit && /*#__PURE__*/React.createElement(PaywallSheet, {
    lock: tr("ql_lock"),
    title: tr("ql_h1"),
    sub: tr("ql_sub"),
    rows: [[tr("ql_feat1"), ""], [tr("plan_feat2"), ""], [tr("pr_feat_goals"), ""]],
    cta: tr("ql_cta"),
    onUpgrade: () => {
      setShowQuizLimit(false);
      openPlanSelect();
    },
    onClose: () => {
      setShowQuizLimit(false);
      if (tab === "quiz") setTab("conjugate");
    }
  }), showPricing && /*#__PURE__*/React.createElement(PricingSheet, {
    onClose: () => setShowPricing(false),
    isPremium: isPremium,
    onAccount: supaUser ? null : () => {
      setShowPricing(false);
      setShowLogin(true);
    },
    onContinue: plan => {
      setShowPricing(false);
      setSelPlan(plan || "annual");
      openPlanSelect();
    }
  }), showPlanSelect && /*#__PURE__*/React.createElement(PlanSelect, {
    plan: selPlan,
    setPlan: setSelPlan,
    onNext: () => {
      goToStripe();
    },
    onClose: () => setShowPlanSelect(false),
    onLogin: () => {
      setShowPlanSelect(false);
      setShowLogin(true);
    },
    onCouponLogin: () => {
      setPendingCoupon(true);
      setShowPlanSelect(false);
      setShowLogin(true);
    },
    supaUser: supaUser,
    onPremium: () => {
      persist("kunju-premium", true);
      setIsPremium(true);
    },
    openCoupon: pendingCoupon
  }), showGoalSuccess && /*#__PURE__*/React.createElement(GoalSuccess, {
    name: name,
    goal: goal,
    onClose: () => setShowGoalSuccess(false),
    onQuiz: () => {
      setShowGoalSuccess(false);
      handleTabSwitch("quiz");
    },
    onCurate: () => {
      setShowGoalSuccess(false);
      savedDeepLinkRef.current = true;
      persist("kunju-saved-sub", "challenge");
      persist("kunju-challenge-pending-edit", true);
      handleTabSwitch("saved");
    }
  }), showGoalCelebration && /*#__PURE__*/React.createElement(GoalCelebration, {
    name: name,
    daily: daily,
    goal: goal,
    onClose: () => setShowGoalCelebration(false),
    onNewGoal: () => {
      setShowGoalCelebration(false);
      // Lernziele are Premium.
      if (!hasPaidAccess()) {
        setShowPaywall(true);
        return;
      }
      setGoalStep("choose");
      setShowGoal(true);
    }
  }), showStreak && /*#__PURE__*/React.createElement(Zieltafel, {
    name: name,
    lang: lang,
    daily: daily,
    goal: goal,
    onClose: () => setShowStreak(false),
    onAdjustGoal: () => {
      setShowStreak(false);
      if (!hasPaidAccess()) { setShowPaywall(true); return; } // Standard: vorgegeben, nicht einstellbar
      setGoalStep("choose");
      setShowGoal(true);
    },
    onQuiz: () => {
      setShowStreak(false);
      handleTabSwitch("quiz");
    },
    onSwitchLang: (l) => switchLang(l),
    onChallenge: () => {
      setShowStreak(false);
      savedDeepLinkRef.current = true;
      persist("kunju-saved-sub", "challenge");
      handleTabSwitch("saved");
    }
  }), showGoal && /*#__PURE__*/React.createElement(GoalFlow, {
    step: goalStep,
    setStep: setGoalStep,
    name: name,
    lang: lang,
    onClose: () => setShowGoal(false),
    onCreate: data => {
      persist("kunju-goal", true);
      const saved = data ? {
        ...data,
        startDate: new Date().toDateString(),
        ...buildChallengeLists(data, lang)
      } : null;
      if (saved) persistGoal(lang, saved);
      setGoalSet(true);
      setGoal(saved);
      setDaily(readDaily());
      setShowGoal(false);
      // Beim ALLERERSTEN Anlegen (egal über welchen Weg) direkt in die
      // Übungsverben-Auswahl springen – der Fokus soll zuerst darauf liegen.
      if (saved && !recall("kunju-challenge-first-done", false)) {
        persist("kunju-challenge-first-done", true);
        savedDeepLinkRef.current = true;
        persist("kunju-saved-sub", "challenge");
        persist("kunju-challenge-pending-edit", true);
        handleTabSwitch("saved");
      } else {
        setShowGoalSuccess(true);
      }
    }
  })), toastMsg && /*#__PURE__*/React.createElement(Toast, {
    msg: toastMsg,
    onDone: () => setToastMsg(null)
  }), reportCtx && /*#__PURE__*/React.createElement(ReportSheet, {
    ctx: reportCtx,
    onClose: () => setReportCtx(null)
  }));
}
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      error
    };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        padding: "32px 22px",
        textAlign: "center",
        fontFamily: "system-ui,sans-serif",
        color: "#14151a",
        background: "#f3f4f8"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "40px",
        marginBottom: "16px"
      }
    }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: "0 0 10px",
        fontSize: "20px"
      }
    }, "Oops \u2014 die App ist abgest\xFCrzt"), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "0 0 24px",
        color: "#707888",
        fontSize: "15px",
        maxWidth: "340px"
      }
    }, "Ein unerwarteter Fehler ist aufgetreten. Deine gespeicherten Daten bleiben erhalten."), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        this.setState({
          error: null
        });
      },
      style: {
        background: "#1b1813",
        color: "#fff",
        border: "none",
        borderRadius: "14px",
        padding: "12px 28px",
        fontSize: "15px",
        fontWeight: 600,
        cursor: "pointer"
      }
    }, "App neu starten"));
  }
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(ErrorBoundary, null, /*#__PURE__*/React.createElement(App, null)));
;
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
}
;(function(){try{var s=document.getElementById('app-splash');if(!s)return;requestAnimationFrame(function(){requestAnimationFrame(function(){s.style.opacity='0';setTimeout(function(){if(s&&s.parentNode)s.parentNode.removeChild(s);},400);});});}catch(e){}})();
