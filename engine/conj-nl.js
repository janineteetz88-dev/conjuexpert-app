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
    wassen:   { pastSg: "waste", pastPl: "wasten", participle: "gewassen", aux: "hebben" },
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
  // Längster-zuerst, damit z. B. "vooruit" vor "voor" greift (verhindert Fehl-Zerlegung).
  const NL_SEP = ["aan","af","bij","in","mee","na","om","onder","op","over","toe","uit","voor","weg","terug","door","samen","neer","tegen","vast","los","klaar","thuis","open","dicht","achteruit","vooruit","binnen","buiten","mis"].sort((a, b) => b.length - a.length);
  const NL_SEIN_BASE = ["staan","komen","gaan","lopen","vallen","stijgen","springen","rijden","vliegen","groeien"];
  // Not separable, even though they start with a string that's also a NL_SEP prefix (e.g. "mis" in "missen").
  const NL_NOT_SEPARABLE = ["missen"];
  // Untrennbare Verben, die wie Präfix+Basis aussehen: openen ist NICHT op+enen.
  const NL_NOSEP = ["openen", "opereren", "toetsen", "omarmen", "overtuigen", "overleggen", "overwegen", "overleven", "overlijden", "overhandigen", "overtreffen", "onderzoeken", "ondertekenen", "ondersteunen", "onderbouwen"];
  function nlSplit(verb) {
    if (NL_NOSEP.indexOf(verb) >= 0) return null;
    if (NL_NOT_SEPARABLE.includes(verb)) return null;
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
  // Höflichkeits-Imperativ: Stamm+t ("koopt u", "weest u"), mit Vokal-Dehnung
  // bei offener Silbe ("ga" → "gaat u", "sta" → "staat u").
  function nlPoliteImp(imp) {
    if (imp.endsWith("t")) return imp + " u";
    if (/(^|[^aeiou])[aou]$/.test(imp)) return imp + imp.slice(-1) + "t u";
    return imp + "t u";
  }
  function nlBaseData(base) {
    const reg = regularData(base);
    const irr = IRR[base];
    if (!irr) return { data: reg, isIrr: false };
    return { data: {
      present: irr.presentFull || reg.present,
      past: [irr.pastSg, irr.pastSg, irr.pastSg, irr.pastPl, irr.pastPl, irr.pastPl],
      subjunctive: irr.subj || reg.subjunctive,
      // Gebiedende wijs: kein hij/zij-Imperativ (—); Höflichkeitsform = Stamm+t
      // ("koopt u", "weest u"), nicht die Du-Form ("koop u").
      imperative: ["—", (irr.imp != null ? irr.imp : reg.imperative[1]), "—", "laten we " + base, (irr.presentFull ? irr.presentFull[4] : reg.imperative[4]), (irr.imp != null ? nlPoliteImp(irr.imp) : reg.imperative[5])],
      participle: irr.participle,
      aux: irr.aux || "hebben"
    }, isIrr: true };
  }
  function nlSeparableTenses(verb, prefix, base) {
    const { data, isIrr } = nlBaseData(base);
    const aux = (NL_SEIN_BASE.indexOf(base) >= 0) ? "zijn" : data.aux;
    const suf = (arr) => arr.map((f) => f === "—" ? "—" : `${f} … ${prefix}`);
    // "laten we opstaan" bleibt ganz; alle anderen (auch "sta u") bekommen den Präfix ans Ende
    const imp = data.imperative.map((f) => f === "—" ? "—" : (f.indexOf("laten we ") === 0 ? f.replace("laten we " + base, "laten we " + verb) : `${f} … ${prefix}`));
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

  // Native -eren-Verben mit Schwa in der letzten Silbe: KEINE Dehnung
  // (luisteren → luister, nicht "luisteer"). Lehnwörter auf -eren
  // (studeren → studeer, controleren → controleer) dehnen dagegen regulär.
  const NL_SCHWA_EREN = ["luisteren","fluisteren","herinneren","schilderen","verbeteren","verminderen","veranderen","verwijderen","ergeren","verzekeren","bewonderen","verwonderen","stotteren","mopperen","bibberen","fladderen","hameren","jammeren","kletteren","donderen","hinderen","plunderen"];
  function stemOf(verb) {
    let stem = verb.endsWith("en") ? verb.slice(0, -2) : verb.replace(/n$/, "");
    // Schwa-Endsilben (-elen/-enen/-emen/-igen bei mehrsilbigem Kern) und Stämme
    // auf -w werden NICHT gedehnt: oefenen → oefen, koppelen → koppel, duwen → duw.
    const core0 = stem.replace(/^(be|ge|er|her|ont|ver)/, "");
    const core = /[aeiou]/.test(core0) ? core0 : stem;
    const vGroups = (core.match(/[aeiou]+/g) || []).length;
    const schwa = ((/e[lnm]$/.test(stem) || /ig$/.test(stem)) && vGroups >= 2) || (/er$/.test(stem) && NL_SCHWA_EREN.indexOf(verb) >= 0) || /w$/.test(stem);
    if (/([bcdfghklmnprst])\1$/.test(stem)) {
      stem = stem.slice(0, -1); // double consonant => short vowel, do NOT lengthen
    } else if (!schwa && /(^|[^aeiou])[aeiou][^aeiou]$/.test(stem)) {
      // auch vokal-anlautende Stämme dehnen: eten → "et" → "eet"
      const v = stem[stem.length - 2]; stem = stem.slice(0, -1) + v + stem.slice(-1);
    }
    // Final-obstruent devoicing (v/z -> f/s) is a spelling convention for the infinitive
    // stem, but the underlying consonant is still voiced — needed for the 't kofschip check below.
    const devoiced = /[vz]$/.test(stem);
    stem = stem.replace(/v$/, "f").replace(/z$/, "s");
    return { stem, devoiced };
  }

  function regularData(verb) {
    const { stem, devoiced } = stemOf(verb);
    const lastSound = /ch$/.test(stem) ? "ch" : stem.slice(-1);
    const voiceless = !devoiced && KOFSCHIP.includes(lastSound);
    const t = voiceless ? "t" : "d";
    const pastSing = stem + t + "e";
    const pastPlur = stem + t + "en";
    const stT = stem.endsWith("t") ? stem : stem + "t";
    // Don't double the final consonant if the stem already ends in the suffix letter (zet+t -> zet, not zett).
    // Unbetonte Präfixe (be-, ge-, er-, her-, ont-, ver-) bekommen KEIN ge-:
    // geloven→geloofd, verhuizen→verhuisd (nicht "gegeloofd"/"geverhuisd").
    const ge = /^(be|ge|er|her|ont|ver)/.test(verb) ? "" : "ge";
    const participle = ge + (stem.endsWith(t) ? stem : stem + t);
    return {
      present: [stem, stT, stT, verb, verb, verb],
      past: [pastSing, pastSing, pastSing, pastPlur, pastPlur, pastPlur],
      subjunctive: [verb.replace(/n$/, ""), verb.replace(/n$/, ""), verb.replace(/n$/, ""), verb, verb, verb], // Aanvoegende wijs = Infinitiv minus -n (hebben→hebbe, lopen→lope)
      imperative: ["—", stem, "—", "laten we " + verb, stT, stT + " u"],
      participle,
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
    const gerund = verb === "zijn" ? "zijnde" : verb + "d";
    return [
      { id: "present", label: "Tegenwoordige tijd", forms: data.present },
      { id: "past", label: "Verleden tijd", forms: data.past },
      { id: "perfect", label: "Voltooid tegenwoordige tijd", forms: perfect },
      { id: "pluperfect", label: "Voltooid verleden tijd", forms: pluperfect },
      { id: "future", label: "Toekomende tijd", forms: future },
      { id: "subjunctive", label: "Aanvoegende wijs", forms: data.subjunctive },
      { id: "conditional", label: "Voorwaardelijke wijs", forms: conditional },
      { id: "imperative", label: "Gebiedende wijs", forms: data.imperative },
      { id: "gerund", label: "Onvoltooid deelwoord", forms: PRON.map(() => gerund) }
    ];
  }

  // Reflexive Verben (zich wassen): Basisverb konjugieren, me/je/zich/ons/je/
  // zich hinter das finite Verb ("was me", "heb me gewassen").
  const NL_REFL = ["me", "je", "zich", "ons", "je", "zich"];
  function nlReflexivize(tenses) {
    const map = (t) => (f, i) => {
      if (!f || f === "—") return f;
      if (t.nonFinite) return "zich " + f;
      if (t.id === "imperative") return /^laten we /.test(f) ? f + " ons" : f + " " + NL_REFL[i];
      const sp = f.indexOf(" ");
      return sp < 0 ? f + " " + NL_REFL[i] : f.slice(0, sp) + " " + NL_REFL[i] + f.slice(sp);
    };
    tenses.forEach(t => { t.forms = t.forms.map(map(t)); if (t.reg) t.reg = t.reg.map(map(t)); });
  }
  function conjugate(input) {
    let verb = clean(input);
    const refl = verb.startsWith("zich ");
    if (refl) verb = verb.slice(5).trim();
    if (!verb) return null;
    if (!verb.endsWith("en") && !verb.endsWith("n")) {
      return { error: "Dutch verbs end in -en. Try e.g. werken, maken, lopen." };
    }
    const reg = regularData(verb);
    const sep = nlSplit(verb);
    if (sep) {
      const tenses = nlSeparableTenses(verb, sep.prefix, sep.base);
      if (refl) nlReflexivize(tenses);
      return { isIrregular: !!IRR[sep.base], infinitive: refl ? "zich " + verb : verb, pronouns: PRON, tenses, separable: true };
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
        imperative: ["—", impForm, "—", "laten we " + verb, (irr.presentFull ? irr.presentFull[4] : reg.imperative[4]), nlPoliteImp(impForm)],
        participle: irr.participle,
        aux: irr.aux || "hebben"
      };
    }
    const tenses = buildTenses(verb, data);
    if (isIrr) { const regT = buildTenses(verb, reg); tenses.forEach((t, i) => { t.reg = regT[i].forms; }); }
    if (refl) nlReflexivize(tenses);
    return { isIrregular: isIrr, infinitive: refl ? "zich " + verb : verb, pronouns: PRON, tenses };
  }

  window.CONJ.nl = {
    name: "Nederlands", flag: "🇳🇱", ttsLang: "nl-NL",
    placeholder: "bijv. werken, maken, lopen…",
    samples: ["werken", "maken", "lopen", "zijn", "hebben", "gaan", "zien", "eten", "geven", "komen", "denken", "blijven"],
    irregulars: Object.keys(IRR),
    conjugate
  };
})();
