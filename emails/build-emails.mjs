/**
 * build-emails.mjs
 *
 * Generiert die Lifecycle-Mail-Serie (4 Mails) in 5 Sprachen (DE/EN/ES/NL/FR)
 * aus einem gemeinsamen, email-sicheren Layout (Tabellen + Inline-Styles) in
 * der echten ConjuExpert-CI. Ausgabe: emails/<lang>/<datei>.html
 *
 * Zwei Bausteine im Produkt:
 *   1) 24-h-Premium-Trial  → gratis testen (kein Preisbezug)
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
const LOGO = `${BASE}/logo-stripe-full.png`;
const RAINBOW = "linear-gradient(to right,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff)";
const CTA_BG = "#e71583"; // Button: solides CI-Pink
const CTA_FALLBACK = "#e71583"; // solide Button-Farbe (Gmail u.a. ohne Verlauf)
const LINK = "#0b4f9e"; // Verlinkungen: dunkles Blau statt Babyblau
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
    file: "email-1-welcome.html", utm: "welcome", accent: "#a557ff", price: false, cap: null, banner: false,
    de: { subject: "Willkommen – 24 h Premium geschenkt 🎁", pre: "Dein Konto ist da – 24 Stunden Premium sind schon freigeschaltet.",
      eyebrow: "Willkommen bei ConjuExpert", h1: "24 Stunden Premium – geschenkt.",
      paras: ["Hallo {{name}}, schön, dass du da bist! Ab jetzt sind 24 Stunden lang alle Premium-Funktionen für dich freigeschaltet – ganz ohne Bezahlung.", "Das kannst du sofort ausprobieren:", "Die Konjugationstabellen bleiben übrigens für immer kostenlos."],
      features: ["🎯 Quiz – aktiv üben, bis die Formen sitzen", "📌 Merken – genau den Wortschatz speichern, der dir wichtig ist", "📈 Lernziele – deinen Fortschritt im Blick behalten"],
      cta: "Premium jetzt ausprobieren →" },
    en: { subject: "Welcome – 24h of Premium on us 🎁", pre: "Your account is ready – 24 hours of Premium are already unlocked.",
      eyebrow: "Welcome to ConjuExpert", h1: "24 hours of Premium – on us.",
      paras: ["Hi {{name}}, great to have you here! For the next 24 hours, every Premium feature is unlocked for you – completely free.", "Here's what to try right away:", "And don't worry – the conjugation tables stay free forever."],
      features: ["🎯 Quiz – practise actively until the forms stick", "📌 Saved – keep exactly the vocabulary that matters to you", "📈 Goals – keep an eye on your progress"],
      cta: "Try Premium now →" },
    es: { subject: "Bienvenido/a – 24 h de Premium de regalo 🎁", pre: "Tu cuenta está lista: 24 horas de Premium ya están activadas.",
      eyebrow: "Bienvenido/a a ConjuExpert", h1: "24 horas de Premium – de regalo.",
      paras: ["Hola {{name}}, ¡qué bien tenerte aquí! Durante las próximas 24 horas tienes desbloqueadas todas las funciones Premium, totalmente gratis.", "Esto puedes probarlo ya mismo:", "Por cierto, las tablas de conjugación son gratis para siempre."],
      features: ["🎯 Quiz – practica activamente hasta dominar las formas", "📌 Guardado – guarda justo el vocabulario que te importa", "📈 Objetivos – sigue tu progreso de un vistazo"],
      cta: "Probar Premium ahora →" },
    nl: { subject: "Welkom – 24 uur Premium cadeau 🎁", pre: "Je account is klaar – 24 uur Premium staat al voor je klaar.",
      eyebrow: "Welkom bij ConjuExpert", h1: "24 uur Premium – cadeau.",
      paras: ["Hoi {{name}}, leuk dat je er bent! De komende 24 uur zijn alle Premium-functies voor je vrijgeschakeld – helemaal gratis.", "Dit kun je meteen uitproberen:", "De vervoegingstabellen blijven trouwens voor altijd gratis."],
      features: ["🎯 Quiz – actief oefenen tot de vormen blijven zitten", "📌 Opgeslagen – bewaar precies de woorden die voor jou belangrijk zijn", "📈 Doelen – houd je voortgang in de gaten"],
      cta: "Premium nu uitproberen →" },
    fr: { subject: "Bienvenue – 24 h de Premium offertes 🎁", pre: "Ton compte est prêt – 24 heures de Premium sont déjà débloquées.",
      eyebrow: "Bienvenue chez ConjuExpert", h1: "24 heures de Premium – offertes.",
      paras: ["Bonjour {{name}}, ravi de t'accueillir ! Pendant les prochaines 24 heures, toutes les fonctions Premium sont débloquées pour toi – entièrement gratuites.", "À tester tout de suite :", "Et rassure-toi : les tableaux de conjugaison restent gratuits pour toujours."],
      features: ["🎯 Quiz – t'entraîner activement jusqu'à maîtriser les formes", "📌 Enregistrés – garder exactement le vocabulaire qui compte pour toi", "📈 Objectifs – suivre ta progression d'un coup d'œil"],
      cta: "Essayer Premium maintenant →" },
  },
  {
    file: "email-2-trial-ending.html", utm: "trial-ending", accent: "#f97316", price: true, cap: "capNow", banner: false,
    de: { subject: "Dein Gratis-Tag endet bald", pre: "Dein Gratis-Tag endet bald – mit Feedback behältst du Premium für 5 € weniger.",
      eyebrow: "Dein Gratis-Tag endet bald", h1: "Premium behalten?",
      paras: ["Hallo {{name}}, dein kostenloser Premium-Tag läuft gleich aus. Wenn dir Quiz & Merken gefallen haben, kannst du sie dauerhaft behalten.", "Gib uns kurz dein Feedback zur App – dafür bekommst du einen 5-€-Code und zahlst fürs Jahresabo nur 24,99 € statt 29,99 €."],
      cta: "Feedback geben & 5 € sichern →" },
    en: { subject: "Your free day is ending soon", pre: "Your free day is ending soon – give feedback and keep Premium for €5 less.",
      eyebrow: "Your free day is ending", h1: "Keep Premium?",
      paras: ["Hi {{name}}, your free Premium day is almost over. If you enjoyed Quiz & Saved, you can keep them for good.", "Give us your quick feedback on the app – you'll get a €5 code and pay just €24.99 instead of €29.99 for the annual plan."],
      cta: "Give feedback & save €5 →" },
    es: { subject: "Tu día gratis está por terminar", pre: "Tu día gratis está por terminar: con tu opinión mantienes Premium por 5 € menos.",
      eyebrow: "Tu día gratis termina pronto", h1: "¿Mantienes Premium?",
      paras: ["Hola {{name}}, tu día Premium gratis está por terminar. Si te gustaron el Quiz y Guardado, puedes mantenerlos para siempre.", "Cuéntanos brevemente tu opinión sobre la app: recibirás un código de 5 € y pagarás solo 24,99 € en vez de 29,99 € por el plan anual."],
      cta: "Dar opinión y ahorrar 5 € →" },
    nl: { subject: "Je gratis dag loopt bijna af", pre: "Je gratis dag loopt bijna af – met feedback houd je Premium voor € 5 minder.",
      eyebrow: "Je gratis dag loopt bijna af", h1: "Premium behouden?",
      paras: ["Hoi {{name}}, je gratis Premium-dag loopt bijna af. Vond je Quiz & Opgeslagen fijn? Dan kun je ze blijven gebruiken.", "Geef ons kort je feedback over de app – je krijgt een code van € 5 en betaalt maar € 24,99 in plaats van € 29,99 voor het jaarabonnement."],
      cta: "Feedback geven & € 5 besparen →" },
    fr: { subject: "Ta journée gratuite se termine bientôt", pre: "Ta journée gratuite se termine bientôt – donne ton avis et garde Premium pour 5 € de moins.",
      eyebrow: "Ta journée gratuite se termine", h1: "Garder Premium ?",
      paras: ["Bonjour {{name}}, ta journée Premium gratuite touche à sa fin. Si tu as aimé le Quiz et les Enregistrés, tu peux les garder pour de bon.", "Donne-nous vite ton avis sur l'appli – tu recevras un code de 5 € et ne paieras que 24,99 € au lieu de 29,99 € pour l'abonnement annuel."],
      cta: "Donner mon avis & économiser 5 € →" },
  },
  {
    file: "email-3-reminder.html", utm: "reminder", accent: "#ea580c", price: true, cap: "capNow", banner: false,
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
    file: "email-4-last-chance.html", utm: "last-chance", accent: "#ef4444", price: true, cap: "capNow", banner: false,
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
];

/* ─── Renderer ───────────────────────────────────────────────────────────── */
function renderEmail(lang, mail) {
  const c = COMMON[lang];
  const p = PRICE[lang];
  const m = mail[lang];
  const accent = mail.accent;
  const href = `${BASE}/?utm_source=email&amp;utm_medium=lifecycle&amp;utm_campaign=${mail.utm}&amp;lang=${lang}`;

  const banner = mail.banner
    ? `    <tr>
      <td align="center" style="background:linear-gradient(to right,#ef4444,#f97316);padding:10px 24px;">
        <p style="margin:0;font-size:12px;font-weight:700;color:#ffffff;letter-spacing:.5px;text-transform:uppercase;">${m.bannerTxt}</p>
      </td>
    </tr>\n`
    : "";

  const paras = m.paras
    .map((t) => `        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.55;">${t}</p>`)
    .join("\n");

  const features = m.features
    ? `        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:4px 0 20px;">
${m.features.map((f) => `          <tr><td style="padding:7px 0;font-size:15px;color:#111827;line-height:1.45;">${f}</td></tr>`).join("\n")}
        </table>\n`
    : "";

  const price = mail.price
    ? `        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:4px auto 24px;">
          <tr>
            <td align="center" style="background:#faf5ff;border:2px solid ${accent};border-radius:16px;padding:18px 32px;">
              <p style="margin:0 0 2px;font-size:13px;color:#6b7280;">${c[mail.cap]}</p>
              <p style="margin:0;font-size:34px;font-weight:900;color:#111827;letter-spacing:-1px;">${p.now} <span style="font-size:15px;font-weight:600;color:#6b7280;">${c.perYear}</span> <span style="font-size:15px;font-weight:600;color:#9ca3af;text-decoration:line-through;">${p.was}</span></p>
              <p style="margin:6px 0 0;display:inline-block;background:#fef3c7;color:#92400e;font-size:12px;font-weight:700;padding:3px 10px;border-radius:8px;">${p.badge}</p>
              <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;line-height:1.4;">${c.priceSub}</p>
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
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

<!-- Preheader (im Posteingang sichtbar, in der Mail versteckt) -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${m.pre}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f7">
<tr><td align="center" style="padding:32px 16px;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

    <!-- Rainbow bar (CI) -->
    <tr>
      <td height="4" style="background:${RAINBOW};font-size:0;line-height:0;">&nbsp;</td>
    </tr>

${banner}    <tr>
      <td align="center" style="padding:32px 40px 28px;">

        <!-- Logo -->
        <img src="${LOGO}" alt="ConjuExpert" width="170" style="display:block;border:0;height:auto;line-height:100%;outline:none;text-decoration:none;margin:0 auto 24px;" />

        <!-- Eyebrow -->
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${accent};text-transform:uppercase;letter-spacing:1px;">${m.eyebrow}</p>
        <!-- Headline -->
        <h1 style="margin:0 0 18px;font-size:34px;font-weight:900;color:#111827;letter-spacing:-1px;line-height:1.1;">${m.h1}</h1>

        <!-- Body -->
        <div style="text-align:left;">
${paras}
${features}        </div>

${price}        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" bgcolor="${CTA_FALLBACK}" style="border-radius:14px;background-color:${CTA_FALLBACK};background:${CTA_BG};">
              <a href="${href}" style="display:block;padding:16px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;">${m.cta}</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:16px 40px;border-top:1px solid #f3f4f6;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.6;">
          <a href="{{unsubscribe_url}}" style="color:#9ca3af;">${c.unsub}</a> · <a href="${BASE}/datenschutz.html" style="color:#9ca3af;">${c.privacy}</a> · <a href="${BASE}/agb.html" style="color:#9ca3af;">${c.terms}</a><br>
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
