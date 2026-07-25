/**
 * build-supabase-emails.mjs
 *
 * Generiert die Supabase-Auth-Mail-Templates (Bestätigung, Magic-Link,
 * Passwort-Reset) in der ConjuExpert-CI – zum direkten Einfügen in
 * Supabase → Authentication → Emails.
 *
 * Verwendet die Supabase-Go-Variablen (z. B. {{ .ConfirmationURL }}),
 * die NICHT vom Generator ersetzt werden, sondern wörtlich im Template
 * stehen bleiben und von Supabase zur Sendezeit gefüllt werden.
 *
 * Ausgabe: emails/supabase/<lang>/<datei>.html
 *
 *   node emails/build-supabase-emails.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const LANGS = ["de", "en", "es", "nl", "fr"];

const BASE = "https://conjuexpert.app";
const LOGO = `${BASE}/logo-wordmark.png`;
const RAINBOW = "linear-gradient(to right,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff)";
const CTA_BG = "#e71583"; // Button: solides CI-Pink
const CTA_FALLBACK = "#e71583"; // solide Button-Farbe (Gmail u.a. ohne Verlauf)
const LINK = "#0b4f9e"; // Verlinkungen: dunkles Blau statt Babyblau
const LEGAL = "Janine Kreiser · Blasewitzer Straße 41 · 01307 Dresden";
const CONFIRM = "{{ .ConfirmationURL }}"; // Supabase-Variable – bleibt wörtlich stehen

const FOOT = {
  de: { privacy: "Datenschutz", terms: "AGB", fallback: "Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:" },
  en: { privacy: "Privacy", terms: "Terms", fallback: "If the button doesn't work, copy this link into your browser:" },
  es: { privacy: "Privacidad", terms: "Términos", fallback: "Si el botón no funciona, copia este enlace en tu navegador:" },
  nl: { privacy: "Privacy", terms: "Voorwaarden", fallback: "Werkt de knop niet? Kopieer dan deze link in je browser:" },
  fr: { privacy: "Confidentialité", terms: "CGU", fallback: "Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :" },
};

/* ─── Auth-Templates × Sprache ───────────────────────────────────────────── */
const TEMPLATES = [
  {
    file: "confirm-signup.html", key: "confirm", accent: "#a557ff", dashboard: "Confirm signup",
    de: { subject: "Bestätige deine E-Mail – ConjuExpert", pre: "Noch ein Klick – dann ist dein Konto aktiv (inkl. 48 h Premium).", eyebrow: "Schön, dass du da bist", h1: "Nur noch ein Klick.", paras: ["Hallo, schön, dass du da bist – wir freuen uns riesig über deine Anmeldung! Bestätige jetzt nur noch kurz deine E-Mail-Adresse, um dein Konto zu aktivieren und 48 Stunden Premium gratis freizuschalten."], cta: "E-Mail bestätigen →" },
    en: { subject: "Confirm your email – ConjuExpert", pre: "One more click – then your account is active (incl. 48h Premium).", eyebrow: "So glad you're here", h1: "Just one more click.", paras: ["Hi, so glad you're here – we're thrilled you signed up! Just confirm your email address to activate your account and unlock 48 hours of Premium for free."], cta: "Confirm email →" },
    es: { subject: "Confirma tu correo – ConjuExpert", pre: "Un clic más y tu cuenta estará activa (con 48 h de Premium).", eyebrow: "¡Qué bien que estés aquí!", h1: "Solo un clic más.", paras: ["Hola: ¡Qué bien que estés aquí! Nos hace muchísima ilusión que te hayas registrado. Confirma tu dirección de correo para activar tu cuenta y desbloquear 48 horas de Premium gratis."], cta: "Confirmar correo →" },
    nl: { subject: "Bevestig je e-mail – ConjuExpert", pre: "Nog één klik – dan is je account actief (incl. 48 uur Premium).", eyebrow: "Fijn dat je er bent", h1: "Nog één klik.", paras: ["Hoi, fijn dat je er bent – we zijn superblij met je aanmelding! Bevestig even je e-mailadres om je account te activeren en 48 uur Premium gratis vrij te schakelen."], cta: "E-mail bevestigen →" },
    fr: { subject: "Confirme ton e-mail – ConjuExpert", pre: "Encore un clic – et ton compte est actif (avec 48 h de Premium).", eyebrow: "Ravis de t'accueillir", h1: "Encore un clic.", paras: ["Bonjour, ravis de t'accueillir – ton inscription nous fait vraiment plaisir ! Confirme simplement ton adresse e-mail pour activer ton compte et débloquer 48 heures de Premium gratuites."], cta: "Confirmer l'e-mail →" },
  },
  {
    file: "magic-link.html", key: "magic", accent: "#a557ff", dashboard: "Magic Link",
    de: { subject: "Dein Login-Link – ConjuExpert", pre: "Mit einem Klick einloggen – Link nur kurz gültig.", eyebrow: "Dein Login-Link", h1: "Mit einem Klick einloggen.", paras: ["Klicke auf den Button, um dich bei ConjuExpert anzumelden. Aus Sicherheitsgründen ist der Link nur kurze Zeit gültig.", "Wenn du das nicht angefordert hast, kannst du diese E-Mail ignorieren."], cta: "Jetzt einloggen →" },
    en: { subject: "Your login link – ConjuExpert", pre: "Log in with one click – link valid briefly.", eyebrow: "Your login link", h1: "Log in with one click.", paras: ["Click the button to sign in to ConjuExpert. For security, the link is only valid for a short time.", "If you didn't request this, you can ignore this email."], cta: "Sign in now →" },
    es: { subject: "Tu enlace de acceso – ConjuExpert", pre: "Inicia sesión con un clic – el enlace caduca pronto.", eyebrow: "Tu enlace de acceso", h1: "Inicia sesión con un clic.", paras: ["Haz clic en el botón para iniciar sesión en ConjuExpert. Por seguridad, el enlace solo es válido un rato.", "Si no lo solicitaste, puedes ignorar este correo."], cta: "Iniciar sesión →" },
    nl: { subject: "Je inloglink – ConjuExpert", pre: "Log in met één klik – link is kort geldig.", eyebrow: "Je inloglink", h1: "Inloggen met één klik.", paras: ["Klik op de knop om in te loggen bij ConjuExpert. Om veiligheidsredenen is de link maar kort geldig.", "Heb je dit niet aangevraagd? Dan kun je deze e-mail negeren."], cta: "Nu inloggen →" },
    fr: { subject: "Ton lien de connexion – ConjuExpert", pre: "Connecte-toi en un clic – lien valable peu de temps.", eyebrow: "Ton lien de connexion", h1: "Connexion en un clic.", paras: ["Clique sur le bouton pour te connecter à ConjuExpert. Pour des raisons de sécurité, le lien n'est valable que peu de temps.", "Si tu n'es pas à l'origine de cette demande, ignore cet e-mail."], cta: "Se connecter →" },
  },
  {
    file: "reset-password.html", key: "reset", accent: "#a557ff", dashboard: "Reset Password",
    de: { subject: "Passwort zurücksetzen – ConjuExpert", pre: "Neues Passwort festlegen – Link nur kurz gültig.", eyebrow: "Passwort zurücksetzen", h1: "Neues Passwort festlegen.", paras: ["Du hast angefordert, dein Passwort zurückzusetzen. Klicke auf den Button, um ein neues festzulegen.", "Wenn du das nicht warst, kannst du diese E-Mail ignorieren – dein Passwort bleibt unverändert."], cta: "Passwort zurücksetzen →" },
    en: { subject: "Reset your password – ConjuExpert", pre: "Set a new password – link valid briefly.", eyebrow: "Reset password", h1: "Set a new password.", paras: ["You requested to reset your password. Click the button to set a new one.", "If this wasn't you, you can ignore this email – your password stays unchanged."], cta: "Reset password →" },
    es: { subject: "Restablecer contraseña – ConjuExpert", pre: "Crea una nueva contraseña – el enlace caduca pronto.", eyebrow: "Restablecer contraseña", h1: "Crea una nueva contraseña.", paras: ["Solicitaste restablecer tu contraseña. Haz clic en el botón para crear una nueva.", "Si no fuiste tú, puedes ignorar este correo: tu contraseña no cambiará."], cta: "Restablecer contraseña →" },
    nl: { subject: "Wachtwoord opnieuw instellen – ConjuExpert", pre: "Stel een nieuw wachtwoord in – link is kort geldig.", eyebrow: "Wachtwoord opnieuw instellen", h1: "Nieuw wachtwoord instellen.", paras: ["Je hebt gevraagd om je wachtwoord opnieuw in te stellen. Klik op de knop om een nieuw wachtwoord te kiezen.", "Was jij dit niet? Negeer deze e-mail dan – je wachtwoord blijft ongewijzigd."], cta: "Wachtwoord resetten →" },
    fr: { subject: "Réinitialiser ton mot de passe – ConjuExpert", pre: "Définis un nouveau mot de passe – lien valable peu de temps.", eyebrow: "Réinitialiser le mot de passe", h1: "Définir un nouveau mot de passe.", paras: ["Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton pour en définir un nouveau.", "Si ce n'est pas toi, ignore cet e-mail – ton mot de passe reste inchangé."], cta: "Réinitialiser →" },
  },
];

/* ─── Renderer ───────────────────────────────────────────────────────────── */
function render(lang, tpl) {
  const f = FOOT[lang];
  const m = tpl[lang];
  const accent = tpl.accent;

  const paras = m.paras
    .map((t) => `        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.55;">${t}</p>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>${m.subject}</title>
<!-- Supabase-Template: ${tpl.dashboard} · Sprache: ${lang} -->
<!-- Subject (in Supabase separat eintragen): ${m.subject} -->
<!-- Variablen: {{ .ConfirmationURL }} · {{ .Token }} · {{ .SiteURL }} · {{ .Email }} -->
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${m.pre}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f7">
<tr><td align="center" style="padding:32px 16px;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

    <!-- Rainbow bar (CI) -->
    <tr>
      <td height="4" style="background:${RAINBOW};font-size:0;line-height:0;">&nbsp;</td>
    </tr>

    <tr>
      <td align="center" style="padding:32px 40px 28px;">

        <!-- Logo -->
        <img src="${LOGO}" alt="ConjuExpert" width="200" style="display:block;border:0;height:auto;line-height:100%;outline:none;text-decoration:none;margin:0 auto 24px;" />

        <!-- Eyebrow + Headline -->
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${accent};text-transform:uppercase;letter-spacing:1px;">${m.eyebrow}</p>
        <h1 style="margin:0 0 18px;font-size:32px;font-weight:900;color:#111827;letter-spacing:-1px;line-height:1.1;">${m.h1}</h1>

        <!-- Body -->
        <div style="text-align:left;">
${paras}
        </div>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
          <tr>
            <td align="center" bgcolor="${CTA_FALLBACK}" style="border-radius:14px;background-color:${CTA_FALLBACK};background:${CTA_BG};">
              <a href="${CONFIRM}" style="display:block;padding:16px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;">${m.cta}</a>
            </td>
          </tr>
        </table>

        <!-- Fallback-Link -->
        <p style="margin:18px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;text-align:left;">${f.fallback}<br>
          <a href="${CONFIRM}" style="color:${LINK};word-break:break-all;">${CONFIRM}</a>
        </p>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:16px 40px;border-top:1px solid #f3f4f6;">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.6;">
          <a href="${BASE}/datenschutz.html" style="color:#9ca3af;">${f.privacy}</a> · <a href="${BASE}/agb.html" style="color:#9ca3af;">${f.terms}</a><br>
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
  const dir = join(ROOT, "supabase", lang);
  mkdirSync(dir, { recursive: true });
  for (const tpl of TEMPLATES) {
    writeFileSync(join(dir, tpl.file), render(lang, tpl), "utf8");
    count++;
  }
}
console.log(`✅ ${count} Supabase-Auth-Templates generiert (${TEMPLATES.length} × ${LANGS.length} Sprachen) unter emails/supabase/<lang>/`);

