// send-code-mail — 5-€-Gutschein-Mailstrecke (Code WILLKOMMEN)
//
// Zwei Betriebsarten:
//   1) Tag-0 (aus der App, mit User-JWT):  POST { kind: "day0" }
//      → schickt „Hier ist dein Code" an den eingeloggten Nutzer (einmalig).
//   2) Cron (geplant, mit Header x-cron-secret): scannt profiles und schickt
//      Tag-3-Erinnerung („nur noch X Tage") bzw. Tag-7-Mail („verfällt heute").
//
// Nötige Function-Secrets:
//   RESEND_API_KEY, EMAIL_FROM (optional), CRON_SECRET,
//   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY  (automatisch)
//
// Deploy:  supabase functions deploy send-code-mail
// Cron:    siehe README.md (pg_cron ruft diese Function täglich mit x-cron-secret auf)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE = "https://conjuexpert.app";
const RAINBOW = "linear-gradient(to right,#ff3b5c,#ff7a18,#ffc400,#34c759,#00bcd4,#0a84ff,#a557ff)";
const CTA_BG = "#e71583";
const LINK = "#0b4f9e";
const LEGAL = "Janine Kreiser · Blasewitzer Straße 41 · 01307 Dresden";
const CODE = "WILLKOMMEN";
const CTA_URL = `${BASE}/#abo=${CODE}`;

type Lang = "de" | "en" | "es" | "nl" | "fr";
const LANGS: Lang[] = ["de", "en", "es", "nl", "fr"];
function langFromNative(n: string | null | undefined): Lang {
  const s = String(n || "").toLowerCase();
  if (s.startsWith("eng")) return "en";
  if (s.startsWith("span") || s.startsWith("esp")) return "es";
  if (s.startsWith("dutch") || s.startsWith("neder")) return "nl";
  if (s.startsWith("fren") || s.startsWith("fran")) return "fr";
  return "de";
}

const HELLO: Record<Lang, string> = { de: "Hallo", en: "Hi", es: "Hola", nl: "Hoi", fr: "Salut" };
const FOOT: Record<Lang, string> = {
  de: "Du bekommst diese E-Mail, weil du ConjuExpert nutzt.",
  en: "You’re receiving this because you use ConjuExpert.",
  es: "Recibes este correo porque usas ConjuExpert.",
  nl: "Je ontvangt deze e-mail omdat je ConjuExpert gebruikt.",
  fr: "Tu reçois cet e-mail car tu utilises ConjuExpert.",
};

// {n} wird in day3 durch die Rest-Tage ersetzt.
type Msg = { subject: string; eyebrow: string; h1: string; paras: string[]; cta: string };
const C: Record<"day0" | "day3" | "day7", Record<Lang, Msg>> = {
  day0: {
    de: { subject: "Dein 5-€-Gutschein ist da 🎁", eyebrow: "Dein Geschenk", h1: "Hier ist dein Code", cta: "Jahresabo sichern",
      paras: ["danke für dein Feedback – das hilft uns riesig! 💛", "Mit deinem Code bekommst du den Premiumtarif für <b>24,99 €/Jahr statt 29,99 €</b>. Der Code ist <b>7 Tage</b> gültig."] },
    en: { subject: "Your €5 coupon is here 🎁", eyebrow: "Your gift", h1: "Here’s your code", cta: "Get the yearly plan",
      paras: ["thanks for your feedback – it means a lot! 💛", "With your code you get Premium for <b>€24.99/year instead of €29.99</b>. The code is valid for <b>7 days</b>."] },
    es: { subject: "Tu cupón de 5 € está aquí 🎁", eyebrow: "Tu regalo", h1: "Aquí tienes tu código", cta: "Conseguir el plan anual",
      paras: ["¡gracias por tu opinión, nos ayuda muchísimo! 💛", "Con tu código consigues Premium por <b>24,99 €/año en vez de 29,99 €</b>. El código es válido <b>7 días</b>."] },
    nl: { subject: "Je coupon van € 5 is er 🎁", eyebrow: "Jouw cadeau", h1: "Hier is je code", cta: "Jaarabonnement nemen",
      paras: ["bedankt voor je feedback – daar hebben we veel aan! 💛", "Met je code krijg je Premium voor <b>€ 24,99/jaar i.p.v. € 29,99</b>. De code is <b>7 dagen</b> geldig."] },
    fr: { subject: "Ton bon de 5 € est arrivé 🎁", eyebrow: "Ton cadeau", h1: "Voici ton code", cta: "Prendre l’abonnement annuel",
      paras: ["merci pour ton avis – ça nous aide énormément ! 💛", "Avec ton code, tu obtiens Premium pour <b>24,99 €/an au lieu de 29,99 €</b>. Le code est valable <b>7 jours</b>."] },
  },
  day3: {
    de: { subject: "Nur noch {n} Tage für deine 5 €", eyebrow: "Erinnerung", h1: "Dein Gutschein läuft", cta: "Jetzt einlösen",
      paras: ["kleiner Reminder: dein 5-€-Code wartet noch auf dich.", "In <b>{n} Tagen</b> verfällt er. Sichere dir das Jahresabo für <b>24,99 € statt 29,99 €</b>."] },
    en: { subject: "Only {n} days left for your €5", eyebrow: "Reminder", h1: "Your coupon is running out", cta: "Redeem now",
      paras: ["quick reminder: your €5 code is still waiting.", "It expires in <b>{n} days</b>. Grab the yearly plan for <b>€24.99 instead of €29.99</b>."] },
    es: { subject: "Solo quedan {n} días para tus 5 €", eyebrow: "Recordatorio", h1: "Tu cupón está por caducar", cta: "Canjear ahora",
      paras: ["un recordatorio: tu código de 5 € sigue esperándote.", "Caduca en <b>{n} días</b>. Consigue el plan anual por <b>24,99 € en vez de 29,99 €</b>."] },
    nl: { subject: "Nog maar {n} dagen voor je € 5", eyebrow: "Herinnering", h1: "Je coupon loopt af", cta: "Nu inwisselen",
      paras: ["kleine herinnering: je code van € 5 wacht nog op je.", "Over <b>{n} dagen</b> vervalt hij. Pak het jaarabonnement voor <b>€ 24,99 i.p.v. € 29,99</b>."] },
    fr: { subject: "Plus que {n} jours pour tes 5 €", eyebrow: "Rappel", h1: "Ton bon expire bientôt", cta: "Utiliser maintenant",
      paras: ["petit rappel : ton code de 5 € t’attend encore.", "Il expire dans <b>{n} jours</b>. Prends l’abonnement annuel pour <b>24,99 € au lieu de 29,99 €</b>."] },
  },
  day7: {
    de: { subject: "Heute läuft dein 5-€-Code ab", eyebrow: "Letzte Chance", h1: "Nur noch heute", cta: "Jetzt sichern",
      paras: ["dein 5-€-Gutschein verfällt <b>heute</b>.", "Sichere dir das Jahresabo für <b>24,99 € statt 29,99 €</b>, bevor der Code weg ist."] },
    en: { subject: "Your €5 code expires today", eyebrow: "Last chance", h1: "Today only", cta: "Get it now",
      paras: ["your €5 coupon expires <b>today</b>.", "Grab the yearly plan for <b>€24.99 instead of €29.99</b> before the code is gone."] },
    es: { subject: "Tu código de 5 € caduca hoy", eyebrow: "Última oportunidad", h1: "Solo hoy", cta: "Conseguir ahora",
      paras: ["tu cupón de 5 € caduca <b>hoy</b>.", "Consigue el plan anual por <b>24,99 € en vez de 29,99 €</b> antes de que desaparezca."] },
    nl: { subject: "Je code van € 5 verloopt vandaag", eyebrow: "Laatste kans", h1: "Alleen vandaag", cta: "Nu pakken",
      paras: ["je coupon van € 5 vervalt <b>vandaag</b>.", "Pak het jaarabonnement voor <b>€ 24,99 i.p.v. € 29,99</b> voordat de code weg is."] },
    fr: { subject: "Ton code de 5 € expire aujourd’hui", eyebrow: "Dernière chance", h1: "Aujourd’hui seulement", cta: "En profiter",
      paras: ["ton bon de 5 € expire <b>aujourd’hui</b>.", "Prends l’abonnement annuel pour <b>24,99 € au lieu de 29,99 €</b> avant qu’il ne disparaisse."] },
  },
};

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function renderHtml(lang: Lang, kind: "day0" | "day3" | "day7", firstName: string, daysLeft: number): string {
  const m = C[kind][lang];
  const sub = (t: string) => t.replace(/\{n\}/g, String(daysLeft));
  const name = (firstName || "").trim();
  const greeting = name ? `${HELLO[lang]} ${escHtml(name)},` : `${HELLO[lang]},`;
  const paras = [greeting, ...m.paras.map(sub)]
    .map((t) => `        <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.55;">${t}</p>`)
    .join("\n");
  const codeBox = `        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 18px;"><tr><td align="center" style="border:2px dashed #e71583;border-radius:12px;padding:14px;"><span style="font-family:monospace;font-size:22px;font-weight:800;letter-spacing:3px;color:#111827;">${CODE}</span></td></tr></table>`;
  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="x-apple-disable-message-reformatting"><title>${sub(m.subject)}</title></head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f7"><tr><td align="center" style="padding:32px 16px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
    <tr><td height="4" style="background:${RAINBOW};font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td align="center" style="padding:32px 40px 28px;">
        <img src="${BASE}/logo-wordmark.png" alt="ConjuExpert" width="200" style="display:block;border:0;height:auto;margin:0 auto 24px;" />
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#e71583;text-transform:uppercase;letter-spacing:1px;">${sub(m.eyebrow)}</p>
        <h1 style="margin:0 0 18px;font-size:32px;font-weight:900;color:#111827;letter-spacing:-1px;line-height:1.1;">${sub(m.h1)}</h1>
        <div style="text-align:left;">
${paras}
        </div>
${codeBox}
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="${CTA_BG}" style="border-radius:14px;background:${CTA_BG};"><a href="${CTA_URL}" style="display:block;padding:16px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;">${m.cta}</a></td></tr></table>
        <p style="margin:18px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;text-align:left;"><a href="${CTA_URL}" style="color:${LINK};word-break:break-all;">${CTA_URL}</a></p>
    </td></tr>
    <tr><td style="padding:0 40px 30px;"><p style="margin:0;font-size:11px;color:#b6bcc7;line-height:1.5;text-align:center;">${FOOT[lang]}<br>${LEGAL}</p></td></tr>
  </table>
</td></tr></table></body></html>`;
}

async function sendMail(to: string, subject: string, html: string): Promise<boolean> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return false;
  const from = Deno.env.get("EMAIL_FROM") ?? "ConjuExpert <hello@conjuexpert.app>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  return res.ok;
}

const cors = {
  "Access-Control-Allow-Origin": "https://conjuexpert.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};
const jsonRes = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

function admin() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // ---- Cron-Modus: Tag-3 / Tag-7-Erinnerungen ----
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret) {
    if (cronSecret !== Deno.env.get("CRON_SECRET")) return jsonRes({ error: "forbidden" }, 403);
    const db = admin();
    const nowMs = Date.now();
    const { data: rows, error } = await db.from("profiles")
      .select("id, first_name, native_lang, code_expires_at, code_mail3_sent, code_mail7_sent")
      .eq("feedback_given", true).eq("is_premium", false).not("welcome_code", "is", null)
      .not("code_expires_at", "is", null);
    if (error) return jsonRes({ error: error.message }, 500);
    let sent = 0;
    for (const r of rows ?? []) {
      const exp = new Date(r.code_expires_at as string).getTime();
      if (isNaN(exp) || exp <= nowMs) continue;                 // schon abgelaufen → nichts
      const daysLeft = Math.ceil((exp - nowMs) / 86400000);
      let kind: "day3" | "day7" | null = null;
      if (daysLeft <= 1 && !r.code_mail7_sent) kind = "day7";
      else if (daysLeft <= 4 && daysLeft > 1 && !r.code_mail3_sent) kind = "day3";
      if (!kind) continue;
      const { data: u } = await db.auth.admin.getUserById(r.id as string);
      const email = u?.user?.email;
      if (!email) continue;
      const lang = langFromNative(r.native_lang as string);
      const m = C[kind][lang];
      const ok = await sendMail(email, m.subject.replace(/\{n\}/g, String(daysLeft)),
        renderHtml(lang, kind, (r.first_name as string) || "", daysLeft));
      if (ok) {
        await db.from("profiles").update(kind === "day7" ? { code_mail7_sent: true } : { code_mail3_sent: true }).eq("id", r.id);
        sent++;
      }
    }
    return jsonRes({ ok: true, sent });
  }

  // ---- Tag-0: aus der App (User-JWT) ----
  const auth = req.headers.get("Authorization");
  if (!auth) return jsonRes({ error: "unauthorized" }, 401);
  const asUser = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: { user }, error: aerr } = await asUser.auth.getUser();
  if (aerr || !user?.email) return jsonRes({ error: "unauthorized" }, 401);

  const db = admin();
  const { data: p } = await db.from("profiles")
    .select("first_name, native_lang, feedback_given, welcome_code, is_premium, code_mail0_sent")
    .eq("id", user.id).maybeSingle();
  if (!p || !p.feedback_given || !p.welcome_code || p.is_premium) return jsonRes({ ok: true, skipped: true });
  if (p.code_mail0_sent) return jsonRes({ ok: true, already: true });

  const lang = langFromNative(p.native_lang as string);
  const ok = await sendMail(user.email, C.day0[lang].subject, renderHtml(lang, "day0", (p.first_name as string) || "", 7));
  if (ok) await db.from("profiles").update({ code_mail0_sent: true }).eq("id", user.id);
  return jsonRes({ ok });
});
