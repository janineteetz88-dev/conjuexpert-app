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
    feed: { past: "fed", pp: "fed" },
    ring: { past: "rang", pp: "rung" }
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
      { id: "gerund", label: "Gerund / Present Participle", forms: PRON.map(() => ger) }
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
