/**
 * build-emails.mjs
 *
 * Generiert die Lifecycle-Mail-Serie (4 Mails) in 5 Sprachen (DE/EN/ES/NL/FR)
 * aus einem gemeinsamen, email-sicheren Layout (Tabellen + Inline-Styles) in
 * der echten ConjuExpert-CI. Ausgabe: emails/<lang>/<datei>.html
 *
 * Zwei getrennte Uhren im Produkt:
 *   1) 24-h-Premium-Trial  → gratis testen (kein Preisbezug)
 *   2) 7-Tage-Willkommensfenster → Jahresabo 24,99 € statt 29,99 €
 *
 * Merge-Felder in den Vorlagen: {{name}}, {{days}}
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
  de: { perYear: "/ Jahr", capNow: "Jahresabo · Willkommenspreis", capToday: "Jahresabo · nur noch heute",
        priceSub: "Danach 29,99 €/Jahr · monatlich 2,99 € (= 35,88 €/Jahr).",
        unsub: "Abmelden", privacy: "Datenschutz", terms: "AGB" },
  en: { perYear: "/ year", capNow: "Annual plan · welcome price", capToday: "Annual plan · today only",
        priceSub: "After that €29.99/year · monthly €2.99 (= €35.88/year).",
        unsub: "Unsubscribe", privacy: "Privacy", terms: "Terms" },
  es: { perYear: "/ año", capNow: "Plan anual · precio de bienvenida", capToday: "Plan anual · solo hoy",
        priceSub: "Después 29,99 €/año · mensual 2,99 € (= 35,88 €/año).",
        unsub: "Darse de baja", privacy: "Privacidad", terms: "Términos" },
  nl: { perYear: "/ jaar", capNow: "Jaarabonnement · welkomstprijs", capToday: "Jaarabonnement · alleen vandaag",
        priceSub: "Daarna € 29,99/jaar · maandelijks € 2,99 (= € 35,88/jaar).",
        unsub: "Afmelden", privacy: "Privacy", terms: "Voorwaarden" },
  fr: { perYear: "/ an", capNow: "Abonnement annuel · prix de bienvenue", capToday: "Abonnement annuel · aujourd'hui seulement",
        priceSub: "Ensuite 29,99 €/an · mensuel 2,99 € (= 35,88 €/an).",
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
    de: { subject: "Dein Gratis-Tag endet bald", pre: "Dein Gratis-Tag endet bald – so behältst du Premium günstiger.",
      eyebrow: "Dein Gratis-Tag endet bald", h1: "Premium behalten?",
      paras: ["Hallo {{name}}, dein kostenloser Premium-Tag läuft gleich aus. Wenn dir Quiz & Merken gefallen haben, kannst du sie dauerhaft behalten.", "Als Willkommen bekommst du das Jahresabo gerade günstiger – noch {{days}} Tage:"],
      cta: "Premium sichern →" },
    en: { subject: "Your free day is ending soon", pre: "Your free day is ending soon – here's how to keep Premium for less.",
      eyebrow: "Your free day is ending", h1: "Keep Premium?",
      paras: ["Hi {{name}}, your free Premium day is almost over. If you enjoyed Quiz & Saved, you can keep them for good.", "As a welcome, the annual plan is cheaper right now – for {{days}} more days:"],
      cta: "Get Premium →" },
    es: { subject: "Tu día gratis está por terminar", pre: "Tu día gratis está por terminar: así mantienes Premium más barato.",
      eyebrow: "Tu día gratis termina pronto", h1: "¿Mantienes Premium?",
      paras: ["Hola {{name}}, tu día Premium gratis está por terminar. Si te gustaron el Quiz y Guardado, puedes mantenerlos para siempre.", "Como bienvenida, el plan anual está más barato ahora mismo – durante {{days}} días más:"],
      cta: "Conseguir Premium →" },
    nl: { subject: "Je gratis dag loopt bijna af", pre: "Je gratis dag loopt bijna af – zo houd je Premium goedkoper.",
      eyebrow: "Je gratis dag loopt bijna af", h1: "Premium behouden?",
      paras: ["Hoi {{name}}, je gratis Premium-dag loopt bijna af. Vond je Quiz & Opgeslagen fijn? Dan kun je ze blijven gebruiken.", "Als welkom is het jaarabonnement nu goedkoper – nog {{days}} dagen:"],
      cta: "Premium nemen →" },
    fr: { subject: "Ta journée gratuite se termine bientôt", pre: "Ta journée gratuite se termine bientôt – garde Premium à prix réduit.",
      eyebrow: "Ta journée gratuite se termine", h1: "Garder Premium ?",
      paras: ["Bonjour {{name}}, ta journée Premium gratuite touche à sa fin. Si tu as aimé le Quiz et les Enregistrés, tu peux les garder pour de bon.", "En cadeau de bienvenue, l'abonnement annuel est moins cher en ce moment – encore {{days}} jours :"],
      cta: "Obtenir Premium →" },
  },
  {
    file: "email-3-reminder.html", utm: "reminder", accent: "#ea580c", price: true, cap: "capNow", banner: false,
    de: { subject: "Noch {{days}} Tage: 24,99 € statt 29,99 €", pre: "Noch {{days}} Tage: Jahresabo für 24,99 € statt 29,99 €.",
      eyebrow: "Dein Willkommenspreis", h1: "24,99 € statt 29,99 €.",
      paras: ["Hallo {{name}}, dein Willkommenspreis gilt nur noch {{days}} Tage. Danach kostet das Jahresabo regulär 29,99 €.", "Sichere dir jetzt ein ganzes Jahr Quiz, Merken & Lernziele zum besten Preis."],
      cta: "24,99 €/Jahr sichern →" },
    en: { subject: "{{days}} days left: €24.99 instead of €29.99", pre: "{{days}} days left: annual plan for €24.99 instead of €29.99.",
      eyebrow: "Your welcome price", h1: "€24.99 instead of €29.99.",
      paras: ["Hi {{name}}, your welcome price is valid for {{days}} more days. After that, the annual plan is €29.99 as usual.", "Grab a full year of Quiz, Saved & Goals at the best price now."],
      cta: "Get €24.99/year →" },
    es: { subject: "Quedan {{days}} días: 24,99 € en vez de 29,99 €", pre: "Quedan {{days}} días: plan anual por 24,99 € en vez de 29,99 €.",
      eyebrow: "Tu precio de bienvenida", h1: "24,99 € en vez de 29,99 €.",
      paras: ["Hola {{name}}, tu precio de bienvenida solo dura {{days}} días más. Después, el plan anual cuesta 29,99 € de forma habitual.", "Consigue ahora un año entero de Quiz, Guardado y Objetivos al mejor precio."],
      cta: "Conseguir 24,99 €/año →" },
    nl: { subject: "Nog {{days}} dagen: € 24,99 i.p.v. € 29,99", pre: "Nog {{days}} dagen: jaarabonnement voor € 24,99 i.p.v. € 29,99.",
      eyebrow: "Je welkomstprijs", h1: "€ 24,99 i.p.v. € 29,99.",
      paras: ["Hoi {{name}}, je welkomstprijs geldt nog maar {{days}} dagen. Daarna kost het jaarabonnement gewoon € 29,99.", "Pak nu een heel jaar Quiz, Opgeslagen & Doelen voor de beste prijs."],
      cta: "€ 24,99/jaar nemen →" },
    fr: { subject: "Encore {{days}} jours : 24,99 € au lieu de 29,99 €", pre: "Encore {{days}} jours : abonnement annuel à 24,99 € au lieu de 29,99 €.",
      eyebrow: "Ton prix de bienvenue", h1: "24,99 € au lieu de 29,99 €.",
      paras: ["Bonjour {{name}}, ton prix de bienvenue n'est valable que {{days}} jours de plus. Ensuite, l'abonnement annuel revient à 29,99 €.", "Profite maintenant d'une année entière de Quiz, Enregistrés et Objectifs au meilleur prix."],
      cta: "Profiter à 24,99 €/an →" },
  },
  {
    file: "email-4-last-chance.html", utm: "last-chance", accent: "#ef4444", price: true, cap: "capToday", banner: true,
    de: { subject: "Letzter Tag für 24,99 €", pre: "Letzter Tag: 24,99 € statt 29,99 € – danach vorbei.", bannerTxt: "⏰ Heute läuft dein Willkommenspreis aus",
      eyebrow: "Letzter Tag", h1: "Heute endet dein Willkommenspreis.",
      paras: ["Hallo {{name}}, das ist deine letzte Gelegenheit: Heute bekommst du das Jahresabo noch für 24,99 € statt 29,99 €.", "Ab morgen gilt wieder der reguläre Preis."],
      cta: "Jetzt noch sichern →" },
    en: { subject: "Last day for €24.99", pre: "Last day: €24.99 instead of €29.99 – then it's gone.", bannerTxt: "⏰ Your welcome price ends today",
      eyebrow: "Last day", h1: "Your welcome price ends today.",
      paras: ["Hi {{name}}, this is your last chance: today you can still get the annual plan for €24.99 instead of €29.99.", "From tomorrow, the regular price applies again."],
      cta: "Get it now →" },
    es: { subject: "Último día por 24,99 €", pre: "Último día: 24,99 € en vez de 29,99 € – después se acaba.", bannerTxt: "⏰ Hoy termina tu precio de bienvenida",
      eyebrow: "Último día", h1: "Hoy termina tu precio de bienvenida.",
      paras: ["Hola {{name}}, esta es tu última oportunidad: hoy todavía consigues el plan anual por 24,99 € en vez de 29,99 €.", "A partir de mañana vuelve el precio habitual."],
      cta: "Conseguirlo ahora →" },
    nl: { subject: "Laatste dag voor € 24,99", pre: "Laatste dag: € 24,99 i.p.v. € 29,99 – daarna voorbij.", bannerTxt: "⏰ Vandaag eindigt je welkomstprijs",
      eyebrow: "Laatste dag", h1: "Vandaag eindigt je welkomstprijs.",
      paras: ["Hoi {{name}}, dit is je laatste kans: vandaag krijg je het jaarabonnement nog voor € 24,99 i.p.v. € 29,99.", "Vanaf morgen geldt weer de gewone prijs."],
      cta: "Nu nog nemen →" },
    fr: { subject: "Dernier jour à 24,99 €", pre: "Dernier jour : 24,99 € au lieu de 29,99 € – ensuite c'est fini.", bannerTxt: "⏰ Aujourd'hui, ton prix de bienvenue se termine",
      eyebrow: "Dernier jour", h1: "Aujourd'hui, ton prix de bienvenue se termine.",
      paras: ["Bonjour {{name}}, c'est ta dernière chance : aujourd'hui, l'abonnement annuel est encore à 24,99 € au lieu de 29,99 €.", "Dès demain, le prix habituel s'applique de nouveau."],
      cta: "En profiter maintenant →" },
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
<!-- Merge-Felder: {{name}}, {{days}} -->
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
