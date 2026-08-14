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
    envoyer:{ present: ["envoie","envoies","envoie","envoyons","envoyez","envoient"], imparfait: ["envoyais","envoyais","envoyait","envoyions","envoyiez","envoyaient"], futStem: "enverr", pp: "envoyé", aux: "avoir", subj: ["envoie","envoies","envoie","envoyions","envoyiez","envoient"], ppr: "envoyant", erType: true },
    falloir:{ present: ["faut","faut","faut","faut","faut","faut"], imparfait: ["fallait","fallait","fallait","fallait","fallait","fallait"], futStem: "faudr", pp: "fallu", aux: "avoir", subj: ["faille","faille","faille","faille","faille","faille"], imp: ["—","—","—","—","—","—"], ppr: "—", onlyIndices: [2] }
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
      // Stammwechsel vor STUMMER Endung (-e, -es, -ent): lever→lève, espérer→
      // espère, régler→règle; -eler/-eter verdoppeln (appeler→appelle) außer
      // der è-Gruppe (acheter→achète, geler→gèle, …).
      const GRAVE_ELER = /^(acheter|racheter|geler|dégeler|congeler|surgeler|peler|modeler|remodeler|ciseler|démanteler|écarteler|marteler|haleter|fureter|crocheter)$/;
      let silentStem = null;
      const m1 = /^(.+)e([lt])$/.exec(stem);
      const m2 = m1 ? null : /^(.+)e([bcdfgmnprsvz]|[bcdfgptv][rl])$/.exec(stem);
      const m3 = /^(.+)é([bcdfgmnprstvz]|[bcdfgptv][rl]|ch|gn|qu)$/.exec(stem);
      if (m1) silentStem = GRAVE_ELER.test(verb) ? m1[1] + "è" + m1[2] : stem + m1[2];
      else if (m2) silentStem = m2[1] + "è" + m2[2];
      else if (m3) silentStem = m3[1] + "è" + m3[2];
      const sil = (e) => (silentStem || stem) + e;
      // Futur/Conditionnel: e-Gruppe behält den gewechselten Stamm (lèverai,
      // appellerai); é-Gruppe behält é (espérerai — traditionell).
      const futStem = (silentStem && !m3) ? silentStem + "er" : verb;
      return {
        present: [sil("e"), sil("es"), sil("e"), sft("ons"), sft("ez"), sil("ent")],
        imparfait: E_IMPARF.map(e => sft(e)),
        subj: [sil("e"), sil("es"), sil("e"), stem + "ions", stem + "iez", sil("ent")],
        ppr: sft("ant"),
        futStem: futStem, pp: stem + "é", aux: "avoir", erType: true
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
    // Mit être kongruiert das Participe: Plural bekommt -s (sommes allés).
    const ppAt = (i) => (data.aux === "être" && i >= 3 && !/s$/.test(data.pp)) ? data.pp + "s" : data.pp;
    const pc = auxPresent(data.aux).map((a, i) => data.pp === "—" ? "—" : `${a} ${ppAt(i)}`);
    const auxImp = data.aux === "être"
      ? ["étais","étais","était","étions","étiez","étaient"]
      : ["avais","avais","avait","avions","aviez","avaient"];
    const pqp = auxImp.map((a, i) => data.pp === "—" ? "—" : `${a} ${ppAt(i)}`);
    const auxCond = data.aux === "être"
      ? ["serais","serais","serait","serions","seriez","seraient"]
      : ["aurais","aurais","aurait","aurions","auriez","auraient"];
    const condPasse = auxCond.map((a, i) => data.pp === "—" ? "—" : `${a} ${ppAt(i)}`);
    const ppr = data.ppr || (impStem + "ant");
    let imp = data.imp;
    if (!imp) { let tu = present[1]; if (data.erType) tu = tu.replace(/s$/, ""); imp = ["—", tu, "—", present[3], present[4], "—"]; }
    const tenses = [
      { id: "present", label: "Présent", forms: present },
      { id: "past", label: "Imparfait", forms: imparfait },
      { id: "perfect", label: "Passé composé", forms: pc },
      { id: "pluperfect", label: "Plus-que-parfait", forms: pqp },
      { id: "future", label: "Futur simple", forms: futur },
      { id: "subjunctive", label: "Subjonctif", forms: subj },
      { id: "conditional", label: "Conditionnel", forms: conditionnel },
      { id: "conditionalPast", label: "Conditionnel passé", forms: condPasse },
      { id: "imperative", label: "Impératif", forms: imp },
      { id: "gerund", label: "Participe présent", forms: PRON.map(() => ppr) }
    ];
    // Impersonal verbs (e.g. falloir) only conjugate for "il / elle" — blank out every other pronoun.
    if (data.onlyIndices) {
      const allowed = new Set(data.onlyIndices);
      tenses.forEach((t) => { t.forms = t.forms.map((f, i) => allowed.has(i) ? f : "—"); });
    }
    return tenses;
  }

  // Otherwise-regular verbs of movement/state that take être (not avoir) in compound tenses.
  const FR_ETRE_ONLY = ["monter", "descendre", "rester", "arriver", "entrer", "rentrer", "tomber", "retourner"];

  // Reflexive Verben (se lever, s'appeler): Pronomen me/te/se/nous/vous/se
  // (mit Elision) voranstellen, zusammengesetzte Zeiten MIT être.
  const FR_REFL = ["me", "te", "se", "nous", "vous", "se"];
  const frVowel = (w) => /^[aeiouâàêéèîôûh]/i.test(w);
  function frReflexivize(tenses) {
    const map = (t) => (f, i) => {
      if (!f || f === "—") return f;
      if (t.id === "imperative") return i === 1 ? f + "-toi" : i === 3 ? f + "-nous" : i === 4 ? f + "-vous" : "—";
      if (t.nonFinite) return (frVowel(f) ? "s'" : "se ") + f;
      const p = FR_REFL[i];
      return (p.length === 2 && frVowel(f) ? p[0] + "'" : p + " ") + f;
    };
    tenses.forEach(t => { t.forms = t.forms.map(map(t)); if (t.reg) t.reg = t.reg.map(map(t)); });
  }
  function conjugate(input) {
    const raw = (input || "").trim().toLowerCase();
    const refl = raw.startsWith("se ") || raw.startsWith("s'");
    const verb = clean(input);
    if (!verb) return null;
    const reg = regularData(verb);
    if (!reg) return { error: "French verbs end in -er, -ir or -re. Try e.g. parler, finir, vendre." };
    const irr = IRR[verb];
    let data = reg, isIrr = false;
    if (irr) { isIrr = true; data = Object.assign({}, irr); }
    else if (FR_ETRE_ONLY.includes(verb)) { isIrr = true; data = Object.assign({}, reg, { aux: "être" }); }
    if (refl) data = Object.assign({}, data, { aux: "être" });
    const tenses = build(verb, data);
    if (isIrr) { const regT = build(verb, refl ? Object.assign({}, reg, { aux: "être" }) : reg); tenses.forEach((t, i) => { t.reg = regT[i].forms; }); }
    if (refl) frReflexivize(tenses);
    return { isIrregular: isIrr, infinitive: refl ? (frVowel(verb) ? "s'" : "se ") + verb : verb, pronouns: PRON, tenses };
  }

  window.CONJ.fr = {
    name: "Français", flag: "🇫🇷", ttsLang: "fr-FR",
    placeholder: "p.ex. parler, finir, vendre…",
    samples: ["parler", "finir", "vendre", "être", "avoir", "aller", "faire", "venir", "prendre", "voir", "pouvoir", "manger"],
    irregulars: Object.keys(IRR),
    conjugate
  };
})();
