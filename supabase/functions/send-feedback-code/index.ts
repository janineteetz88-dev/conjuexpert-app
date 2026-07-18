// send-feedback-code
// Verschickt direkt nach dem App-Feedback die Bestätigungs-Mail mit dem
// 5-€-Code DANKE5 (Vorlage emails/<lang>/email-5-feedback-code.html auf der
// Live-Seite). Der eigentliche Rabatt hängt serverseitig am profiles-Flag
// feedback_given (annual_bonus, 24,99 €) — diese Mail ist die Zustellung/
// Erinnerung mit direktem Kauf-Deeplink.
//
// Auth: wird aus der App per supabase.functions.invoke() mit dem User-JWT
// aufgerufen; wir identifizieren den Nutzer über getUser() (ANON + Header).
// Idempotenz: pro Nutzer genau einmal (email_log, email_key = 'feedback-code').

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE = "https://conjuexpert.app";
const LANGS = ["de", "en", "es", "nl", "fr"] as const;
type Lang = (typeof LANGS)[number];

const FROM = Deno.env.get("EMAIL_FROM") ?? "ConjuExpert <hello@conjuexpert.app>";
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://conjuexpert.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toLang(native: string | null): Lang {
  const n = (native ?? "").trim().toLowerCase();
  if (n.startsWith("eng")) return "en";
  if (n.startsWith("span") || n.startsWith("espa") || n.startsWith("españ")) return "es";
  if (n.startsWith("dut") || n.startsWith("ned") || n.startsWith("nied")) return "nl";
  if (n.startsWith("fre") || n.startsWith("fra") || n.startsWith("franz")) return "fr";
  return "de";
}

async function loadTemplate(lang: Lang): Promise<string> {
  const res = await fetch(`${BASE}/emails/${lang}/email-5-feedback-code.html`, {
    headers: { "cache-control": "no-cache" },
  });
  if (!res.ok) throw new Error(`template ${lang} → HTTP ${res.status}`);
  return await res.text();
}

function subjectOf(html: string): string {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return (m?.[1] ?? "ConjuExpert").trim();
}

function personalize(html: string, firstName: string, unsubUrl: string): string {
  const name = (firstName ?? "").trim();
  let out = html.split("{{name}}").join(name);
  if (!name) out = out.replace(/(Hallo|Hi|Hola|Hoi|Bonjour)\s+,/g, "$1,");
  return out.split("{{unsubscribe_url}}").join(unsubUrl);
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);
  if (!RESEND_KEY) return json({ error: "RESEND_API_KEY not configured" }, 500);

  // Nutzer über sein JWT identifizieren.
  const authHeader = req.headers.get("Authorization") ?? "";
  const supaUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: { user }, error: authErr } = await supaUser.auth.getUser();
  if (authErr || !user) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { persistSession: false },
  });

  // Idempotenz: pro Nutzer genau einmal.
  const { data: already } = await admin
    .from("email_log").select("user_id").eq("user_id", user.id).eq("email_key", "feedback-code").maybeSingle();
  if (already) return json({ ok: true, already: true }, 200);

  const { data: prof } = await admin
    .from("profiles").select("first_name, native_lang, unsubscribe_token, email_optout")
    .eq("id", user.id).maybeSingle();

  const to = user.email ?? "";
  if (!to.includes("@")) return json({ error: "no email on user" }, 400);

  const lang = toLang(prof?.native_lang ?? null);
  const token = prof?.unsubscribe_token ?? "";
  const unsubUrl = `${SUPABASE_URL}/functions/v1/unsubscribe?token=${token}`;
  const tpl = await loadTemplate(lang);
  const html = personalize(tpl, prof?.first_name ?? "", unsubUrl);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: subjectOf(tpl),
      html,
      headers: {
        "List-Unsubscribe": `<${unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });
  if (!res.ok) return json({ error: `Resend ${res.status}: ${await res.text()}` }, 502);
  const sent = await res.json().catch(() => ({}));

  // Erst nach erfolgreichem Versand protokollieren (Idempotenz).
  await admin.from("email_log").insert({ user_id: user.id, email_key: "feedback-code" });

  return json({ ok: true, id: sent?.id ?? null }, 200);
});
