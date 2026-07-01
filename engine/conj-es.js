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
    reír: { present: ["río","ríes","ríe","reímos","reís","ríen"], preterite: ["reí","reíste","rió","reímos","reísteis","rieron"], subjunctive: ["ría","rías","ría","riamos","riáis","rían"], imperative: ["—","ríe","ría","riamos","reíd","rían"], participle: "reído", gerund: "riendo" },
    vestir: { present: ["visto","vistes","viste","vestimos","vestís","visten"], preterite: ["vestí","vestiste","vistió","vestimos","vestisteis","vistieron"], subjunctive: ["vista","vistas","vista","vistamos","vistáis","vistan"], imperative: ["—","viste","vista","vistamos","vestid","vistan"], gerund: "vistiendo" },
    medir: { present: ["mido","mides","mide","medimos","medís","miden"], preterite: ["medí","mediste","midió","medimos","medisteis","midieron"], subjunctive: ["mida","midas","mida","midamos","midáis","midan"], imperative: ["—","mide","mida","midamos","medid","midan"], gerund: "midiendo" },
    aparecer: { present: ["aparezco","apareces","aparece","aparecemos","aparecéis","aparecen"], subjunctive: ["aparezca","aparezcas","aparezca","aparezcamos","aparezcáis","aparezcan"], imperative: ["—","aparece","aparezca","aparezcamos","apareced","aparezcan"] }
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
