// Send-Email-Hook für Supabase Auth.
// Rendert die ConjuExpert-CI-Templates (mehrsprachig, je user_metadata.lang)
// und verschickt sie über Resend.
//
// Aktivierung: Supabase → Authentication → Hooks → "Send Email" → diese
// Function als HTTP-Hook eintragen. Benötigte Function-Secrets:
//   RESEND_API_KEY          (Resend API-Key)
//   SEND_EMAIL_HOOK_SECRET  (von Supabase generiert, Format "v1,whsec_...")
//   EMAIL_FROM              (optional, Default "ConjuExpert <hello@conjuexpert.app>")
//   SUPABASE_URL            (automatisch vorhanden)
//
// Hinweis: Inhalt bewusst mit emails/build-supabase-emails.mjs synchron halten
// (gleiche Texte/CI). Deploy ist inert, solange der Hook im Dashboard nicht aktiv ist.

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const LANGS = ["de", "en", "es", "nl", "fr"] as const;
type Lang = (typeof LANGS)[number];
type Key = "confirm" | "magic" | "reset";

const BASE = "https://conjuexpert.app";
const RAINBOW = "linear-gradient(to right,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff)";
const RAINBOW_FB = "#211d15"; // solider Fallback (Clients ohne Verläufe → Tinte, wirkt als Rahmen)
// Einheitliche CI mit den Lifecycle-Mails: Sand-Fläche, Tinte-Text/Button, Regenbogen-Highlights.
const SAND_BG = "#f4eede";
const CARD = "#fffdf6";
const INK = "#211d15";
const BODY_TXT = "#574f3b";
const MUTED = "#8b8068";
const HAIRLINE = "#e7dcc6";
const CTA_BG = "#211d15"; // Button-Füllung: Tinte (mit Regenbogen-Rand)
const LINK = "#0b4f9e";
const LEGAL = "Janine Kreiser · Blasewitzer Straße 41 · 01307 Dresden";

const ACTION_TO_KEY: Record<string, Key> = {
  signup: "confirm", email: "confirm", email_change: "confirm", invite: "confirm",
  magiclink: "magic", recovery: "reset",
};

// Persönliche Anrede pro Sprache (z. B. "Hallo Janine,").
const HELLO: Record<Lang, string> = { de: "Hallo", en: "Hi", es: "Hola", nl: "Hoi", fr: "Bonjour" };
// Personalisierter Header-Eyebrow der Willkommens-Mail (z. B. "Willkommen, Janine").
const WELCOME: Record<Lang, string> = { de: "Willkommen", en: "Welcome", es: "Bienvenido/a", nl: "Welkom", fr: "Bienvenue" };

function escHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

// Entfernt eine evtl. vorhandene generische Anrede am Anfang des ersten Absatzes,
// damit wir sie durch die personalisierte Begrüßung ersetzen können.
function stripLeadingGreeting(s: string): string {
  const t = s.replace(/^(hallo|hi|hola|hoi|bonjour)\s*[,:]\s*/i, "");
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

const FOOT: Record<Lang, { privacy: string; terms: string; fallback: string }> = {
  de: { privacy: "Datenschutz", terms: "AGB", fallback: "Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:" },
  en: { privacy: "Privacy", terms: "Terms", fallback: "If the button doesn't work, copy this link into your browser:" },
  es: { privacy: "Privacidad", terms: "Términos", fallback: "Si el botón no funciona, copia este enlace en tu navegador:" },
  nl: { privacy: "Privacy", terms: "Voorwaarden", fallback: "Werkt de knop niet? Kopieer dan deze link in je browser:" },
  fr: { privacy: "Confidentialité", terms: "CGU", fallback: "Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :" },
};

type Copy = { subject: string; pre: string; eyebrow: string; h1: string; paras: string[]; cta: string };
const C: Record<Key, { accent: string } & Record<Lang, Copy>> = {
  confirm: {
    accent: "#a557ff",
    de: { subject: "Bestätige deine E-Mail – ConjuExpert", pre: "Noch ein Klick – dann ist dein Konto aktiv (inkl. 48 h Premium).", eyebrow: "Schön, dass du da bist", h1: "Nur noch ein Klick.", paras: ["Hallo, schön, dass du da bist – wir freuen uns riesig über deine Anmeldung! Bestätige jetzt nur noch kurz deine E-Mail-Adresse, um dein Konto zu aktivieren und 48 Stunden Premium gratis freizuschalten."], cta: "E-Mail bestätigen →" },
    en: { subject: "Confirm your email – ConjuExpert", pre: "One more click – then your account is active (incl. 48h Premium).", eyebrow: "So glad you're here", h1: "Just one more click.", paras: ["Hi, so glad you're here – we're thrilled you signed up! Just confirm your email address to activate your account and unlock 48 hours of Premium for free."], cta: "Confirm email →" },
    es: { subject: "Confirma tu correo – ConjuExpert", pre: "Un clic más y tu cuenta estará activa (con 48 h de Premium).", eyebrow: "¡Qué bien que estés aquí!", h1: "Solo un clic más.", paras: ["Hola: ¡Qué bien que estés aquí! Nos hace muchísima ilusión que te hayas registrado. Confirma tu dirección de correo para activar tu cuenta y desbloquear 48 horas de Premium gratis."], cta: "Confirmar correo →" },
    nl: { subject: "Bevestig je e-mail – ConjuExpert", pre: "Nog één klik – dan is je account actief (incl. 48 uur Premium).", eyebrow: "Fijn dat je er bent", h1: "Nog één klik.", paras: ["Hoi, fijn dat je er bent – we zijn superblij met je aanmelding! Bevestig even je e-mailadres om je account te activeren en 48 uur Premium gratis vrij te schakelen."], cta: "E-mail bevestigen →" },
    fr: { subject: "Confirme ton e-mail – ConjuExpert", pre: "Encore un clic – et ton compte est actif (avec 48 h de Premium).", eyebrow: "Ravis de t'accueillir", h1: "Encore un clic.", paras: ["Bonjour, ravis de t'accueillir – ton inscription nous fait vraiment plaisir ! Confirme simplement ton adresse e-mail pour activer ton compte et débloquer 48 heures de Premium gratuites."], cta: "Confirmer l'e-mail →" },
  },
  magic: {
    accent: "#a557ff",
    de: { subject: "Dein Login-Link – ConjuExpert", pre: "Mit einem Klick einloggen – Link nur kurz gültig.", eyebrow: "Dein Login-Link", h1: "Mit einem Klick einloggen.", paras: ["Klicke auf den Button, um dich bei ConjuExpert anzumelden. Aus Sicherheitsgründen ist der Link nur kurze Zeit gültig.", "Wenn du das nicht angefordert hast, kannst du diese E-Mail ignorieren."], cta: "Jetzt einloggen →" },
    en: { subject: "Your login link – ConjuExpert", pre: "Log in with one click – link valid briefly.", eyebrow: "Your login link", h1: "Log in with one click.", paras: ["Click the button to sign in to ConjuExpert. For security, the link is only valid for a short time.", "If you didn't request this, you can ignore this email."], cta: "Sign in now →" },
    es: { subject: "Tu enlace de acceso – ConjuExpert", pre: "Inicia sesión con un clic – el enlace caduca pronto.", eyebrow: "Tu enlace de acceso", h1: "Inicia sesión con un clic.", paras: ["Haz clic en el botón para iniciar sesión en ConjuExpert. Por seguridad, el enlace solo es válido un rato.", "Si no lo solicitaste, puedes ignorar este correo."], cta: "Iniciar sesión →" },
    nl: { subject: "Je inloglink – ConjuExpert", pre: "Log in met één klik – link is kort geldig.", eyebrow: "Je inloglink", h1: "Inloggen met één klik.", paras: ["Klik op de knop om in te loggen bij ConjuExpert. Om veiligheidsredenen is de link maar kort geldig.", "Heb je dit niet aangevraagd? Dan kun je deze e-mail negeren."], cta: "Nu inloggen →" },
    fr: { subject: "Ton lien de connexion – ConjuExpert", pre: "Connecte-toi en un clic – lien valable peu de temps.", eyebrow: "Ton lien de connexion", h1: "Connexion en un clic.", paras: ["Clique sur le bouton pour te connecter à ConjuExpert. Pour des raisons de sécurité, le lien n'est valable que peu de temps.", "Si tu n'es pas à l'origine de cette demande, ignore cet e-mail."], cta: "Se connecter →" },
  },
  reset: {
    accent: "#a557ff",
    de: { subject: "Passwort zurücksetzen – ConjuExpert", pre: "Neues Passwort festlegen – Link nur kurz gültig.", eyebrow: "Passwort zurücksetzen", h1: "Neues Passwort festlegen.", paras: ["Du hast angefordert, dein Passwort zurückzusetzen. Klicke auf den Button, um ein neues festzulegen.", "Wenn du das nicht warst, kannst du diese E-Mail ignorieren – dein Passwort bleibt unverändert."], cta: "Passwort zurücksetzen →" },
    en: { subject: "Reset your password – ConjuExpert", pre: "Set a new password – link valid briefly.", eyebrow: "Reset password", h1: "Set a new password.", paras: ["You requested to reset your password. Click the button to set a new one.", "If this wasn't you, you can ignore this email – your password stays unchanged."], cta: "Reset password →" },
    es: { subject: "Restablecer contraseña – ConjuExpert", pre: "Crea una nueva contraseña – el enlace caduca pronto.", eyebrow: "Restablecer contraseña", h1: "Crea una nueva contraseña.", paras: ["Solicitaste restablecer tu contraseña. Haz clic en el botón para crear una nueva.", "Si no fuiste tú, puedes ignorar este correo: tu contraseña no cambiará."], cta: "Restablecer contraseña →" },
    nl: { subject: "Wachtwoord opnieuw instellen – ConjuExpert", pre: "Stel een nieuw wachtwoord in – link is kort geldig.", eyebrow: "Wachtwoord opnieuw instellen", h1: "Nieuw wachtwoord instellen.", paras: ["Je hebt gevraagd om je wachtwoord opnieuw in te stellen. Klik op de knop om een nieuw wachtwoord te kiezen.", "Was jij dit niet? Negeer deze e-mail dan – je wachtwoord blijft ongewijzigd."], cta: "Wachtwoord resetten →" },
    fr: { subject: "Réinitialiser ton mot de passe – ConjuExpert", pre: "Définis un nouveau mot de passe – lien valable peu de temps.", eyebrow: "Réinitialiser le mot de passe", h1: "Définir un nouveau mot de passe.", paras: ["Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton pour en définir un nouveau.", "Si ce n'est pas toi, ignore cet e-mail – ton mot de passe reste inchangé."], cta: "Réinitialiser →" },
  },
};

function renderHtml(lang: Lang, key: Key, url: string, firstName: string): string {
  const m = C[key][lang];
  const accent = C[key].accent;
  const f = FOOT[lang];
  const name = firstName.trim();
  // Persönliche Begrüßung als erster Absatz; ist kein Name vorhanden, bleibt es
  // bei der generischen Anrede ("Hallo,").
  const greeting = name ? `${HELLO[lang]} ${escHtml(name)},` : `${HELLO[lang]},`;
  // "Oben im Header" der Willkommens-Mail ebenfalls personalisieren.
  const eyebrow = key === "confirm" && name ? `${WELCOME[lang]}, ${escHtml(name)}` : m.eyebrow;
  const body = m.paras.map((t, i) => (i === 0 ? stripLeadingGreeting(t) : t)).filter(Boolean);
  const paras = [greeting, ...body]
    .map((t) => `        <p style="margin:0 0 16px;font-size:15px;color:${BODY_TXT};line-height:1.55;">${t}</p>`)
    .join("\n");
  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<title>${m.subject}</title>
</head>
<body style="margin:0;padding:0;background-color:${SAND_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${m.pre}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${SAND_BG}">
<tr><td align="center" style="padding:32px 16px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:${CARD};border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(33,29,21,0.10);">
    <tr><td height="4" bgcolor="${RAINBOW_FB}" style="background:${RAINBOW};font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr>
      <td align="center" style="padding:32px 40px 28px;">
        <img src="${BASE}/logo-wordmark.png" alt="ConjuExpert" width="200" style="display:block;border:0;height:auto;line-height:100%;outline:none;text-decoration:none;margin:0 auto 24px;" />
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${INK};text-transform:uppercase;letter-spacing:1px;">${eyebrow}</p>
        <h1 style="margin:0 0 18px;font-size:32px;font-weight:900;color:${INK};letter-spacing:-1px;line-height:1.1;">${m.h1}</h1>
        <div style="text-align:left;">
${paras}
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
          <tr><td bgcolor="${RAINBOW_FB}" style="background:${RAINBOW};border-radius:16px;padding:2px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td align="center" bgcolor="${CTA_BG}" style="background:${CTA_BG};border-radius:14px;">
                <a href="${url}" style="display:block;padding:15px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;">${m.cta}</a>
              </td>
            </tr></table>
          </td></tr>
        </table>
        <p style="margin:18px 0 0;font-size:12px;color:${MUTED};line-height:1.5;text-align:left;">${f.fallback}<br>
          <a href="${url}" style="color:${LINK};word-break:break-all;">${url}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 40px;border-top:1px solid ${HAIRLINE};">
        <p style="margin:0;font-size:12px;color:${MUTED};text-align:center;line-height:1.6;">
          <a href="${BASE}/datenschutz.html" style="color:${MUTED};">${f.privacy}</a> · <a href="${BASE}/agb.html" style="color:${MUTED};">${f.terms}</a><br>
          ${LEGAL}
        </p>
      </td>
    </tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const secret = (Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "").replace("v1,whsec_", "");
  if (!secret) return json({ error: "SEND_EMAIL_HOOK_SECRET not configured" }, 500);

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  let data: {
    user: { email: string; user_metadata?: Record<string, unknown> };
    email_data: { token: string; token_hash: string; redirect_to: string; email_action_type: string };
  };
  try {
    data = new Webhook(secret).verify(payload, headers) as typeof data;
  } catch (err) {
    return json({ error: `Invalid signature: ${err}` }, 401);
  }

  const user = data.user ?? ({} as typeof data.user);
  const ed = data.email_data ?? ({} as typeof data.email_data);
  const action = ed.email_action_type ?? "signup";
  const key = ACTION_TO_KEY[action] ?? "confirm";

  let lang = String(user.user_metadata?.lang ?? "de").slice(0, 2).toLowerCase() as Lang;
  if (!LANGS.includes(lang)) lang = "de";

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const url =
    `${SUPABASE_URL}/auth/v1/verify?token=${ed.token_hash}` +
    `&type=${action}&redirect_to=${encodeURIComponent(ed.redirect_to ?? "")}`;

  const md = user.user_metadata ?? {};
  const firstName = String(
    md.first_name ?? md.given_name ?? String(md.full_name ?? md.name ?? "").split(" ")[0] ?? "",
  ).slice(0, 40);
  const html = renderHtml(lang, key, url, firstName);
  const subject = C[key][lang].subject;

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return json({ error: "RESEND_API_KEY not configured" }, 500);
  const from = Deno.env.get("EMAIL_FROM") ?? "ConjuExpert <hello@conjuexpert.app>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [user.email], subject, html }),
  });
  if (!res.ok) return json({ error: `Resend failed: ${await res.text()}` }, 502);

  return json({}, 200);
});
