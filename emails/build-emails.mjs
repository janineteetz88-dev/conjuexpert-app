/**
 * build-emails.mjs
 *
 * Generiert die Lifecycle-Mail-Serie (4 Mails) in 5 Sprachen (DE/EN/ES/NL/FR)
 * aus einem gemeinsamen, email-sicheren Layout (Tabellen + Inline-Styles) in
 * der echten ConjuExpert-CI. Ausgabe: emails/<lang>/<datei>.html
 *
 * Zwei Bausteine im Produkt:
 *   1) 48-h-Premium-Trial  → mit Konto gratis testen (kein Preisbezug)
 *   2) 5-€-Feedback-Code   → Jahresabo 24,99 € statt 29,99 €
 *      (Der 5-€-Code entsteht NUR durch App-Feedback; einen Willkommensrabatt
 *       gibt es nicht mehr.)
 *
 * Merge-Feld in den Vorlagen: {{name}}
 *
 *   node emails/build-emails.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const LANGS = ["de", "en", "es", "nl", "fr"];

const BASE = "https://conjuexpert.app";
const LOGO = `${BASE}/logo-wordmark.png`;
/* ─── ConjuExpert-CI „Sand & Ink" + Regenbogen-Highlight ─────────────────────
 * Warmes Sand als Fläche, dunkle Tinte als Text/Button — und der ConjuExpert-
 * Regenbogen als Marken-Highlight (Akzentleiste oben, Button-Rand, Preisrahmen),
 * genau wie Landing/App: --brand-rainbow und .btn-primary (Tinte-Füllung mit
 * Regenbogen-Rand). Kein Pink, kein Grün als Akzent. */
const SAND_BG      = "#f4eede"; // Seiten-Hintergrund (Sand)
const CARD         = "#fffdf6"; // Karten-Fläche (warmes Weiß)
const INK          = "#211d15"; // Überschriften / Tinte
const BODY_TXT     = "#574f3b"; // Fließtext (warm)
const MUTED        = "#8b8068"; // gedämpft (Footer, Kleingedrucktes)
const HAIRLINE     = "#e7dcc6"; // feine Trennlinie auf Sand
// Marken-Highlight: der ConjuExpert-Regenbogen (= --brand-rainbow aus Landing/App).
const RAINBOW      = "linear-gradient(90deg,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff)";
const RAINBOW_FB   = "#211d15"; // solider Fallback (Clients ohne Verläufe → Tinte, wirkt als klarer Rahmen/Bar)
const EYEBROW      = "#211d15"; // Eyebrow in Tinte (Gradient-Text ist in Mails unzuverlässig/oft unsichtbar)
const CTA_BG       = "#211d15"; // Button-Füllung: Tinte (mit Regenbogen-Rand, wie .btn-primary)
const PRICE_BG     = "#faf6ec"; // Preisbox-Fläche (helles Sand)
const BADGE_BG     = "#fef3c7"; // Rabatt-Badge Fläche (warmes Amber – Highlight)
const BADGE_TXT    = "#92400e"; // Rabatt-Badge Text
const LEGAL = "Janine Kreiser · Blasewitzer Straße 41 · 01307 Dresden";

/* ─── Preise je Sprache (EU-Komma, EN-Punkt) ─────────────────────────────── */
const PRICE = {
  de: { now: "24,99 €", was: "29,99 €", badge: "−5 € · ≈ 17 %" },
  en: { now: "€24.99", was: "€29.99", badge: "−€5 · ≈ 17%" },
  es: { now: "24,99 €", was: "29,99 €", badge: "−5 € · ≈ 17 %" },
  nl: { now: "€ 24,99", was: "€ 29,99", badge: "−€ 5 · ≈ 17 %" },
  fr: { now: "24,99 €", was: "29,99 €", badge: "−5 € · ≈ 17 %" },
};

/* ─── Gemeinsame Bausteine je Sprache ────────────────────────────────────── */
const COMMON = {
  de: { perYear: "/ Jahr", capNow: "Jahresabo · mit 5-€-Feedback-Code",
        priceSub: "Regulär 29,99 €/Jahr · monatlich 2,99 € (= 35,88 €/Jahr).",
        unsub: "Abmelden", privacy: "Datenschutz", terms: "AGB" },
  en: { perYear: "/ year", capNow: "Annual plan · with €5 feedback code",
        priceSub: "Regular price €29.99/year · monthly €2.99 (= €35.88/year).",
        unsub: "Unsubscribe", privacy: "Privacy", terms: "Terms" },
  es: { perYear: "/ año", capNow: "Plan anual · con código de 5 € por tu opinión",
        priceSub: "Precio normal 29,99 €/año · mensual 2,99 € (= 35,88 €/año).",
        unsub: "Darse de baja", privacy: "Privacidad", terms: "Términos" },
  nl: { perYear: "/ jaar", capNow: "Jaarabonnement · met €5-feedbackcode",
        priceSub: "Normale prijs € 29,99/jaar · maandelijks € 2,99 (= € 35,88/jaar).",
        unsub: "Afmelden", privacy: "Privacy", terms: "Voorwaarden" },
  fr: { perYear: "/ an", capNow: "Abonnement annuel · avec code −5 € pour ton avis",
        priceSub: "Prix normal 29,99 €/an · mensuel 2,99 € (= 35,88 €/an).",
        unsub: "Se désabonner", privacy: "Confidentialité", terms: "CGU" },
};

/* ─── Inhalte je Mail × Sprache ──────────────────────────────────────────── */
const MAILS = [
  {
    file: "email-1-welcome.html", utm: "welcome", accent: "#1a9b46", price: false, cap: null, banner: false,
    de: { subject: "Willkommen – 48 h Premium geschenkt 🎁", pre: "Dein Konto ist da – 48 Stunden Premium sind schon freigeschaltet.",
      eyebrow: "Willkommen bei ConjuExpert", h1: "48 Stunden Premium – geschenkt.",
      paras: ["Super, du hast dir ein Konto angelegt! Dafür kannst du jetzt 48 Stunden lang alle Premium-Funktionen nutzen – ganz ohne Bezahlung. Und das Kartendreh-Quiz mit 20 Karten pro Tag bleibt für dich sogar für immer gratis.", "Das kannst du sofort ausprobieren:", "Die Konjugationstabellen bleiben übrigens ebenfalls für immer kostenlos."],
      features: ["🎯 Quiz – aktiv üben, bis die Formen sitzen", "📌 Merken – genau den Wortschatz speichern, der dir wichtig ist", "📈 Lernziele – deinen Fortschritt im Blick behalten"],
      cta: "Premium jetzt ausprobieren →" },
    en: { subject: "Welcome – 48h of Premium on us 🎁", pre: "Your account is ready – 48 hours of Premium are already unlocked.",
      eyebrow: "Welcome to ConjuExpert", h1: "48 hours of Premium – on us.",
      paras: ["Great, you've created an account! That gets you 48 hours with every Premium feature unlocked – completely free. And the flip-card quiz with 20 cards a day stays free for you forever.", "Here's what to try right away:", "And don't worry – the conjugation tables stay free forever too."],
      features: ["🎯 Quiz – practise actively until the forms stick", "📌 Saved – keep exactly the vocabulary that matters to you", "📈 Goals – keep an eye on your progress"],
      cta: "Try Premium now →" },
    es: { subject: "Bienvenido/a – 48 h de Premium de regalo 🎁", pre: "Tu cuenta está lista: 48 horas de Premium ya están activadas.",
      eyebrow: "Bienvenido/a a ConjuExpert", h1: "48 horas de Premium – de regalo.",
      paras: ["¡Genial, te has creado una cuenta! Por eso ahora tienes 48 horas con todas las funciones Premium desbloqueadas, totalmente gratis. Y el quiz de girar cartas con 20 cartas al día se queda gratis para ti para siempre.", "Esto puedes probarlo ya mismo:", "Por cierto, las tablas de conjugación también son gratis para siempre."],
      features: ["🎯 Quiz – practica activamente hasta dominar las formas", "📌 Guardado – guarda justo el vocabulario que te importa", "📈 Objetivos – sigue tu progreso de un vistazo"],
      cta: "Probar Premium ahora →" },
    nl: { subject: "Welkom – 48 uur Premium cadeau 🎁", pre: "Je account is klaar – 48 uur Premium staat al voor je klaar.",
      eyebrow: "Welkom bij ConjuExpert", h1: "48 uur Premium – cadeau.",
      paras: ["Super, je hebt een account aangemaakt! Daarmee kun je nu 48 uur lang alle Premium-functies gebruiken – helemaal gratis. En de kaartdraai-quiz met 20 kaarten per dag blijft voor jou zelfs voor altijd gratis.", "Dit kun je meteen uitproberen:", "De vervoegingstabellen blijven trouwens ook voor altijd gratis."],
      features: ["🎯 Quiz – actief oefenen tot de vormen blijven zitten", "📌 Opgeslagen – bewaar precies de woorden die voor jou belangrijk zijn", "📈 Doelen – houd je voortgang in de gaten"],
      cta: "Premium nu uitproberen →" },
    fr: { subject: "Bienvenue – 48 h de Premium offertes 🎁", pre: "Ton compte est prêt – 48 heures de Premium sont déjà débloquées.",
      eyebrow: "Bienvenue chez ConjuExpert", h1: "48 heures de Premium – offertes.",
      paras: ["Super, tu t'es créé un compte ! Tu profites donc maintenant de 48 heures avec toutes les fonctions Premium débloquées – entièrement gratuit. Et le quiz cartes à retourner avec 20 cartes par jour reste gratuit pour toi, pour toujours.", "À tester tout de suite :", "Et rassure-toi : les tableaux de conjugaison restent eux aussi gratuits pour toujours."],
      features: ["🎯 Quiz – t'entraîner activement jusqu'à maîtriser les formes", "📌 Enregistrés – garder exactement le vocabulaire qui compte pour toi", "📈 Objectifs – suivre ta progression d'un coup d'œil"],
      cta: "Essayer Premium maintenant →" },
  },
  {
    file: "email-2-trial-ending.html", utm: "trial-ending", link: "feedback=1", accent: "#1a9b46", price: true, cap: "capNow", banner: false,
    de: { subject: "Deine Gratis-Testzeit endet bald", pre: "Deine Gratis-Testzeit endet bald – mit Feedback behältst du Premium für 5 € weniger.",
      eyebrow: "Deine Gratis-Testzeit endet bald", h1: "Premium behalten?",
      paras: ["Hallo {{name}}, deine kostenlose Premium-Testzeit läuft gleich aus. Wenn dir Quiz & Merken gefallen haben, kannst du sie dauerhaft behalten.", "Gib uns kurz dein Feedback zur App – dafür bekommst du einen 5-€-Code und zahlst fürs Jahresabo nur 24,99 € statt 29,99 €."],
      cta: "Feedback geben & 5 € sichern →" },
    en: { subject: "Your free trial is ending soon", pre: "Your free trial is ending soon – give feedback and keep Premium for €5 less.",
      eyebrow: "Your free trial is ending", h1: "Keep Premium?",
      paras: ["Hi {{name}}, your free Premium trial is almost over. If you enjoyed Quiz & Saved, you can keep them for good.", "Give us your quick feedback on the app – you'll get a €5 code and pay just €24.99 instead of €29.99 for the annual plan."],
      cta: "Give feedback & save €5 →" },
    es: { subject: "Tu prueba gratis está por terminar", pre: "Tu prueba gratis está por terminar: con tu opinión mantienes Premium por 5 € menos.",
      eyebrow: "Tu prueba gratis termina pronto", h1: "¿Mantienes Premium?",
      paras: ["Hola {{name}}, tu prueba Premium gratis está por terminar. Si te gustaron el Quiz y Guardado, puedes mantenerlos para siempre.", "Cuéntanos brevemente tu opinión sobre la app: recibirás un código de 5 € y pagarás solo 24,99 € en vez de 29,99 € por el plan anual."],
      cta: "Dar opinión y ahorrar 5 € →" },
    nl: { subject: "Je gratis proefperiode loopt bijna af", pre: "Je gratis proefperiode loopt bijna af – met feedback houd je Premium voor € 5 minder.",
      eyebrow: "Je gratis proefperiode loopt bijna af", h1: "Premium behouden?",
      paras: ["Hoi {{name}}, je gratis Premium-proefperiode loopt bijna af. Vond je Quiz & Opgeslagen fijn? Dan kun je ze blijven gebruiken.", "Geef ons kort je feedback over de app – je krijgt een code van € 5 en betaalt maar € 24,99 in plaats van € 29,99 voor het jaarabonnement."],
      cta: "Feedback geven & € 5 besparen →" },
    fr: { subject: "Ton essai gratuit se termine bientôt", pre: "Ton essai gratuit se termine bientôt – donne ton avis et garde Premium pour 5 € de moins.",
      eyebrow: "Ton essai gratuit se termine", h1: "Garder Premium ?",
      paras: ["Bonjour {{name}}, ton essai Premium gratuit touche à sa fin. Si tu as aimé le Quiz et les Enregistrés, tu peux les garder pour de bon.", "Donne-nous vite ton avis sur l'appli – tu recevras un code de 5 € et ne paieras que 24,99 € au lieu de 29,99 € pour l'abonnement annuel."],
      cta: "Donner mon avis & économiser 5 € →" },
  },
  {
    file: "email-3-reminder.html", utm: "reminder", link: "feedback=1", accent: "#1a9b46", price: true, cap: "capNow", banner: false,
    de: { subject: "5 € Rabatt fürs Feedback: 24,99 € statt 29,99 €", pre: "Dein Feedback zur App bringt dir 5 € Rabatt: Jahresabo für 24,99 € statt 29,99 €.",
      eyebrow: "5 € für dein Feedback", h1: "24,99 € statt 29,99 €.",
      paras: ["Hallo {{name}}, hast du schon Premium? Für ein kurzes Feedback zur App bekommst du einen 5-€-Code – damit kostet das Jahresabo 24,99 € statt 29,99 €.", "So sicherst du dir ein ganzes Jahr Quiz, Merken & Lernziele zum besten Preis."],
      cta: "Feedback geben & 5 € sichern →" },
    en: { subject: "€5 off for your feedback: €24.99 instead of €29.99", pre: "Your feedback earns you €5 off: annual plan for €24.99 instead of €29.99.",
      eyebrow: "€5 for your feedback", h1: "€24.99 instead of €29.99.",
      paras: ["Hi {{name}}, not on Premium yet? For a short piece of feedback on the app you'll get a €5 code – that makes the annual plan €24.99 instead of €29.99.", "That's a whole year of Quiz, Saved & Goals at the best price."],
      cta: "Give feedback & save €5 →" },
    es: { subject: "5 € de descuento por tu opinión: 24,99 € en vez de 29,99 €", pre: "Tu opinión te da 5 € de descuento: plan anual por 24,99 € en vez de 29,99 €.",
      eyebrow: "5 € por tu opinión", h1: "24,99 € en vez de 29,99 €.",
      paras: ["Hola {{name}}, ¿aún no tienes Premium? Por una breve opinión sobre la app recibes un código de 5 €: así el plan anual cuesta 24,99 € en vez de 29,99 €.", "Así consigues un año entero de Quiz, Guardado y Objetivos al mejor precio."],
      cta: "Dar opinión y ahorrar 5 € →" },
    nl: { subject: "€ 5 korting voor je feedback: € 24,99 i.p.v. € 29,99", pre: "Je feedback levert je € 5 korting op: jaarabonnement voor € 24,99 i.p.v. € 29,99.",
      eyebrow: "€ 5 voor je feedback", h1: "€ 24,99 i.p.v. € 29,99.",
      paras: ["Hoi {{name}}, nog geen Premium? Voor korte feedback over de app krijg je een code van € 5 – daarmee kost het jaarabonnement € 24,99 i.p.v. € 29,99.", "Zo pak je een heel jaar Quiz, Opgeslagen & Doelen voor de beste prijs."],
      cta: "Feedback geven & € 5 besparen →" },
    fr: { subject: "5 € de réduction pour ton avis : 24,99 € au lieu de 29,99 €", pre: "Ton avis te rapporte 5 € de réduction : abonnement annuel à 24,99 € au lieu de 29,99 €.",
      eyebrow: "5 € pour ton avis", h1: "24,99 € au lieu de 29,99 €.",
      paras: ["Bonjour {{name}}, pas encore Premium ? Pour un court avis sur l'appli, tu reçois un code de 5 € – l'abonnement annuel passe ainsi à 24,99 € au lieu de 29,99 €.", "C'est une année entière de Quiz, Enregistrés et Objectifs au meilleur prix."],
      cta: "Donner mon avis & économiser 5 € →" },
  },
  {
    file: "email-4-last-chance.html", utm: "last-chance", link: "feedback=1", accent: "#1a9b46", price: true, cap: "capNow", banner: false,
    de: { subject: "Deine 5 € fürs Feedback warten noch", pre: "Noch kein Feedback abgegeben? Dein 5-€-Code fürs Jahresabo wartet.",
      eyebrow: "5 € für dein Feedback", h1: "5 € sparen – für dein Feedback.",
      paras: ["Hallo {{name}}, du hast Quiz, Merken & Lernziele ausprobiert? Erzähl uns kurz, wie es war.", "Für dein Feedback bekommst du einen 5-€-Code – damit kostet das Jahresabo 24,99 € statt 29,99 €."],
      cta: "Feedback geben & 5 € sichern →" },
    en: { subject: "Your €5 for feedback is still waiting", pre: "Haven't left feedback yet? Your €5 code for the annual plan is waiting.",
      eyebrow: "€5 for your feedback", h1: "Save €5 – for your feedback.",
      paras: ["Hi {{name}}, tried Quiz, Saved & Goals? Tell us briefly how it went.", "For your feedback you'll get a €5 code – that makes the annual plan €24.99 instead of €29.99."],
      cta: "Give feedback & save €5 →" },
    es: { subject: "Tus 5 € por opinar siguen esperando", pre: "¿Aún no has dejado tu opinión? Tu código de 5 € para el plan anual te espera.",
      eyebrow: "5 € por tu opinión", h1: "Ahorra 5 € – por tu opinión.",
      paras: ["Hola {{name}}, ¿probaste Quiz, Guardado y Objetivos? Cuéntanos brevemente qué tal.", "Por tu opinión recibes un código de 5 €: así el plan anual cuesta 24,99 € en vez de 29,99 €."],
      cta: "Dar opinión y ahorrar 5 € →" },
    nl: { subject: "Je € 5 voor feedback wacht nog", pre: "Nog geen feedback gegeven? Je code van € 5 voor het jaarabonnement wacht.",
      eyebrow: "€ 5 voor je feedback", h1: "Bespaar € 5 – voor je feedback.",
      paras: ["Hoi {{name}}, Quiz, Opgeslagen & Doelen geprobeerd? Vertel ons kort hoe het ging.", "Voor je feedback krijg je een code van € 5 – daarmee kost het jaarabonnement € 24,99 i.p.v. € 29,99."],
      cta: "Feedback geven & € 5 besparen →" },
    fr: { subject: "Tes 5 € pour ton avis t'attendent encore", pre: "Pas encore donné ton avis ? Ton code de 5 € pour l'abonnement annuel t'attend.",
      eyebrow: "5 € pour ton avis", h1: "Économise 5 € – pour ton avis.",
      paras: ["Bonjour {{name}}, tu as essayé Quiz, Enregistrés et Objectifs ? Dis-nous vite ce que tu en as pensé.", "Pour ton avis, tu reçois un code de 5 € – l'abonnement annuel passe ainsi à 24,99 € au lieu de 29,99 €."],
      cta: "Donner mon avis & économiser 5 € →" },
  },
  {
    // Transaktions-Mail: verschickt von der Edge-Function send-feedback-code
    // direkt nach dem Absenden des App-Feedbacks (nicht vom Lifecycle-Cron).
    file: "email-5-feedback-code.html", utm: "feedback-code", link: "checkout=annual", accent: "#1a9b46", price: true, cap: "capNow", banner: false,
    de: { subject: "Dein 5-€-Code DANKE5 ist da 🎁", pre: "Danke für dein Feedback – dein 5-€-Rabatt aufs Jahresabo ist freigeschaltet.",
      eyebrow: "Danke für dein Feedback", h1: "5 € gespart – Code DANKE5.",
      paras: ["Hallo {{name}}, danke für dein Feedback! Dein 5-€-Code <b>DANKE5</b> ist freigeschaltet – das Jahresabo kostet dich damit 24,99 € statt 29,99 €.", "Ein Klick, und der Rabatt ist automatisch angewendet:"],
      cta: "Premium für 24,99 € sichern →" },
    en: { subject: "Your €5 code DANKE5 is here 🎁", pre: "Thanks for your feedback – your €5 discount on the annual plan is unlocked.",
      eyebrow: "Thanks for your feedback", h1: "€5 off – code DANKE5.",
      paras: ["Hi {{name}}, thanks for your feedback! Your €5 code <b>DANKE5</b> is unlocked – the annual plan is now €24.99 instead of €29.99.", "One click and the discount is applied automatically:"],
      cta: "Get Premium for €24.99 →" },
    es: { subject: "Tu código de 5 € DANKE5 ya está aquí 🎁", pre: "Gracias por tu opinión: tu descuento de 5 € en el plan anual está activado.",
      eyebrow: "Gracias por tu opinión", h1: "5 € menos – código DANKE5.",
      paras: ["Hola {{name}}, ¡gracias por tu opinión! Tu código de 5 € <b>DANKE5</b> está activado: el plan anual te cuesta 24,99 € en vez de 29,99 €.", "Un clic y el descuento se aplica automáticamente:"],
      cta: "Consigue Premium por 24,99 € →" },
    nl: { subject: "Je code van € 5 DANKE5 is er 🎁", pre: "Bedankt voor je feedback – je korting van € 5 op het jaarabonnement staat klaar.",
      eyebrow: "Bedankt voor je feedback", h1: "€ 5 korting – code DANKE5.",
      paras: ["Hoi {{name}}, bedankt voor je feedback! Je code van € 5 <b>DANKE5</b> staat klaar – het jaarabonnement kost je nu € 24,99 in plaats van € 29,99.", "Eén klik en de korting wordt automatisch toegepast:"],
      cta: "Premium voor € 24,99 halen →" },
    fr: { subject: "Ton code de 5 € DANKE5 est là 🎁", pre: "Merci pour ton avis – ta réduction de 5 € sur l'abonnement annuel est débloquée.",
      eyebrow: "Merci pour ton avis", h1: "5 € de moins – code DANKE5.",
      paras: ["Bonjour {{name}}, merci pour ton avis ! Ton code de 5 € <b>DANKE5</b> est débloqué – l'abonnement annuel te revient à 24,99 € au lieu de 29,99 €.", "Un clic et la réduction s'applique automatiquement :"],
      cta: "Passer Premium pour 24,99 € →" },
  },
];

/* ─── Renderer ───────────────────────────────────────────────────────────── */
function renderEmail(lang, mail) {
  const c = COMMON[lang];
  const p = PRICE[lang];
  const m = mail[lang];
  // Optionaler Deep-Link je Mail (z. B. "feedback=1" öffnet in der App das
  // Feedback-Formular; "checkout=annual" öffnet direkt den rabattierten Kauf).
  const link = mail.link ? `${mail.link}&amp;` : "";
  const href = `${BASE}/?${link}utm_source=email&amp;utm_medium=lifecycle&amp;utm_campaign=${mail.utm}&amp;lang=${lang}`;

  const banner = mail.banner
    ? `    <tr>
      <td align="center" bgcolor="${RAINBOW_FB}" style="background:${RAINBOW};padding:10px 24px;">
        <p style="margin:0;font-size:12px;font-weight:700;color:#ffffff;letter-spacing:.5px;text-transform:uppercase;">${m.bannerTxt}</p>
      </td>
    </tr>\n`
    : "";

  const paras = m.paras
    .map((t) => `        <p style="margin:0 0 16px;font-size:15px;color:${BODY_TXT};line-height:1.55;">${t}</p>`)
    .join("\n");

  const features = m.features
    ? `        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:4px 0 20px;">
${m.features.map((f) => `          <tr><td style="padding:7px 0;font-size:15px;color:${INK};line-height:1.45;">${f}</td></tr>`).join("\n")}
        </table>\n`
    : "";

  const price = mail.price
    ? `        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:4px auto 24px;">
          <tr>
            <!-- Regenbogen-Rand: Verlaufs-Zelle mit 2px Innenabstand, Fallback = Tinte -->
            <td bgcolor="${RAINBOW_FB}" style="background:${RAINBOW};border-radius:16px;padding:2px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" bgcolor="${PRICE_BG}" style="background:${PRICE_BG};border-radius:14px;padding:18px 32px;">
                    <p style="margin:0 0 2px;font-size:13px;color:${MUTED};">${c[mail.cap]}</p>
                    <p style="margin:0;font-size:34px;font-weight:900;color:${INK};letter-spacing:-1px;">${p.now} <span style="font-size:15px;font-weight:600;color:${MUTED};">${c.perYear}</span> <span style="font-size:15px;font-weight:600;color:${MUTED};text-decoration:line-through;">${p.was}</span></p>
                    <p style="margin:6px 0 0;display:inline-block;background:${BADGE_BG};color:${BADGE_TXT};font-size:12px;font-weight:700;padding:3px 10px;border-radius:8px;">${p.badge}</p>
                    <p style="margin:10px 0 0;font-size:12px;color:${MUTED};line-height:1.4;">${c.priceSub}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>\n`
    : "";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>${m.subject}</title>
<!-- Subject: ${m.subject} -->
<!-- Preheader: ${m.pre} -->
<!-- Merge-Feld: {{name}} -->
</head>
<body style="margin:0;padding:0;background-color:${SAND_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

<!-- Preheader (im Posteingang sichtbar, in der Mail versteckt) -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${m.pre}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${SAND_BG}">
<tr><td align="center" style="padding:32px 16px;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:${CARD};border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(33,29,21,0.10);">

    <!-- Akzentleiste: ConjuExpert-Regenbogen (Fallback = Tinte) -->
    <tr>
      <td height="4" bgcolor="${RAINBOW_FB}" style="background:${RAINBOW};font-size:0;line-height:0;">&nbsp;</td>
    </tr>

${banner}    <tr>
      <td align="center" style="padding:32px 40px 28px;">

        <!-- Logo -->
        <img src="${LOGO}" alt="ConjuExpert" width="200" style="display:block;border:0;height:auto;line-height:100%;outline:none;text-decoration:none;margin:0 auto 24px;" />

        <!-- Eyebrow -->
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${EYEBROW};text-transform:uppercase;letter-spacing:1px;">${m.eyebrow}</p>
        <!-- Headline -->
        <h1 style="margin:0 0 18px;font-size:34px;font-weight:900;color:${INK};letter-spacing:-1px;line-height:1.1;">${m.h1}</h1>

        <!-- Body -->
        <div style="text-align:left;">
${paras}
${features}        </div>

${price}        <!-- CTA: Tinte-Button mit Regenbogen-Rand (wie .btn-primary; Fallback = reine Tinte) -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td bgcolor="${RAINBOW_FB}" style="background:${RAINBOW};border-radius:16px;padding:2px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${CTA_BG}" style="background:${CTA_BG};border-radius:14px;">
                    <a href="${href}" style="display:block;padding:15px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;">${m.cta}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:16px 40px;border-top:1px solid ${HAIRLINE};">
        <p style="margin:0;font-size:12px;color:${MUTED};text-align:center;line-height:1.6;">
          <a href="{{unsubscribe_url}}" style="color:${MUTED};">${c.unsub}</a> · <a href="${BASE}/datenschutz.html" style="color:${MUTED};">${c.privacy}</a> · <a href="${BASE}/agb.html" style="color:${MUTED};">${c.terms}</a><br>
          ${LEGAL}
        </p>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>
`;
}

/* ─── Schreiben ──────────────────────────────────────────────────────────── */
let count = 0;
for (const lang of LANGS) {
  const dir = join(ROOT, lang);
  mkdirSync(dir, { recursive: true });
  for (const mail of MAILS) {
    writeFileSync(join(dir, mail.file), renderEmail(lang, mail), "utf8");
    count++;
  }
}
console.log(`✅ ${count} E-Mails generiert (${MAILS.length} Mails × ${LANGS.length} Sprachen) unter emails/<lang>/`);
