// Lifecycle-Mail-Versand für ConjuExpert.
// Wird stündlich von pg_cron (via pg_net) aufgerufen und verschickt die
// Onboarding-Serie (Willkommen → Testzeit endet → Erinnerung → Letzte Chance)
// über Resend – gesteuert am echten Konto-/Trial-Zustand (Tabelle profiles).
//
// Fälligkeit + Schutzregeln stecken in der SQL-Funktion public.lifecycle_due(stage).
// Idempotenz über public.email_log (pro Nutzer & Stufe genau einmal).
//
// Auth: Shared Secret im Header x-cron-secret. Erwarteter Wert liegt in Supabase
// Vault ('lifecycle_cron_secret') und wird per rpc get_lifecycle_cron_secret()
// gelesen — so ist kein zusätzliches Function-Secret nötig.
//
// Scharfschalten: erst wenn public.app_settings.lifecycle_enabled = 'true' ist,
// werden echte Nutzer angeschrieben. Vorher läuft der Cron harmlos leer.
//
// Testlauf: POST ?test=1&to=<email> (mit gültigem x-cron-secret) → alle 4
// Vorlagen (Standard: de) an <email>, ohne DB/Log zu berühren und unabhängig
// vom Enabled-Flag. Antwort enthält je Stufe die Resend Message-ID.
//
// Vorhandene Function-Secrets (projektweit, schon gesetzt):
//   RESEND_API_KEY                            (Resend API-Key)
//   EMAIL_FROM                                (optional, Default "ConjuExpert <hello@conjuexpert.app>")
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY  (automatisch vorhanden)
//
// Vorlagen sind die generierten HTML-Dateien auf der Live-Seite
// (emails/<lang>/<datei>.html) — eine Quelle der Wahrheit (build-emails.mjs).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE = "https://conjuexpert.app";
const LANGS = ["de", "en", "es", "nl", "fr"] as const;
type Lang = (typeof LANGS)[number];

// native_lang steht als Klartext-Wort in profiles ("German", "English", …).
function toLang(native: string | null): Lang {
  const n = (native ?? "").trim().toLowerCase();
  if (n.startsWith("eng")) return "en";
  if (n.startsWith("span") || n.startsWith("espa") || n.startsWith("españ")) return "es";
  if (n.startsWith("dut") || n.startsWith("ned") || n.startsWith("nied")) return "nl";
  if (n.startsWith("fre") || n.startsWith("fra") || n.startsWith("franz")) return "fr";
  return "de"; // Default: Deutsch (auch für "German"/"Deutsch"/unbekannt)
}

const STAGES = [
  { key: "welcome", file: "email-1-welcome.html" },
  { key: "trial-ending", file: "email-2-trial-ending.html" },
  { key: "reminder", file: "email-3-reminder.html" },
  { key: "last-chance", file: "email-4-last-chance.html" },
] as const;

// Vorlagen-Cache je (lang,file), damit nicht pro Empfänger neu geladen wird.
const tplCache = new Map<string, string>();
async function loadTemplate(lang: Lang, file: string): Promise<string> {
  const cacheKey = `${lang}/${file}`;
  const cached = tplCache.get(cacheKey);
  if (cached) return cached;
  const res = await fetch(`${BASE}/emails/${lang}/${file}`, { headers: { "cache-control": "no-cache" } });
  if (!res.ok) throw new Error(`template ${cacheKey} → HTTP ${res.status}`);
  const html = await res.text();
  tplCache.set(cacheKey, html);
  return html;
}

function subjectOf(html: string): string {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return (m?.[1] ?? "ConjuExpert").trim();
}

// {{name}} und {{unsubscribe_url}} füllen; fehlt der Name, die Anrede glätten.
function personalize(html: string, firstName: string, unsubUrl: string): string {
  const name = (firstName ?? "").trim();
  let out = html.split("{{name}}").join(name);
  if (!name) out = out.replace(/(Hallo|Hi|Hola|Hoi|Bonjour)\s+,/g, "$1,");
  return out.split("{{unsubscribe_url}}").join(unsubUrl);
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

const FROM = Deno.env.get("EMAIL_FROM") ?? "ConjuExpert <hello@conjuexpert.app>";
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

// Gibt die Resend Message-ID zurück (für Nachverfolgung/Zustellungsbeleg).
async function sendMail(to: string, subject: string, html: string, unsubUrl: string): Promise<string> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject,
      html,
      // Bessere Zustellbarkeit + Ein-Klick-Abmeldung (RFC 8058).
      headers: {
        "List-Unsubscribe": `<${unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  const data = await res.json().catch(() => ({}));
  return (data && typeof data.id === "string") ? data.id : "";
}

function unsubscribeUrl(token: string): string {
  return `${SUPABASE_URL}/functions/v1/unsubscribe?token=${token}`;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);
  if (!RESEND_KEY) return json({ error: "RESEND_API_KEY not configured" }, 500);

  const supa = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { persistSession: false },
  });

  // Auth: erwartetes Secret aus Vault holen und mit Header vergleichen.
  const { data: expected, error: secErr } = await supa.rpc("get_lifecycle_cron_secret");
  if (secErr || !expected || req.headers.get("x-cron-secret") !== expected) {
    return json({ error: "Unauthorized" }, 401);
  }

  const url = new URL(req.url);

  // ── Testlauf: alle 4 Vorlagen an ?to=<email>, ohne DB/Log, ohne Enabled-Flag ──
  if (url.searchParams.get("test") === "1") {
    const testTo = url.searchParams.get("to") ?? "";
    if (!testTo.includes("@")) return json({ error: "valid ?to=<email> required" }, 400);
    const lang = (url.searchParams.get("lang") as Lang);
    const useLang = LANGS.includes(lang) ? lang : "de";
    const results: Record<string, string> = {};
    for (const st of STAGES) {
      try {
        const tpl = await loadTemplate(useLang, st.file);
        const unsub = unsubscribeUrl("TEST-TOKEN");
        const id = await sendMail(testTo, `[TEST] ${subjectOf(tpl)}`, personalize(tpl, "Janine", unsub), unsub);
        results[st.key] = id ? `sent id=${id}` : "sent";
      } catch (e) {
        results[st.key] = `error: ${e instanceof Error ? e.message : String(e)}`;
      }
    }
    return json({ test: true, to: testTo, from: FROM, lang: useLang, results }, 200);
  }

  // ── Echter Lauf: nur wenn scharfgeschaltet ──
  const { data: enabledRow } = await supa
    .from("app_settings").select("value").eq("key", "lifecycle_enabled").maybeSingle();
  if (enabledRow?.value !== "true") {
    return json({ ok: true, paused: true, note: "lifecycle_enabled != true" }, 200);
  }

  const summary: Record<string, { sent: number; failed: number }> = {};
  for (const st of STAGES) {
    summary[st.key] = { sent: 0, failed: 0 };
    const { data: due, error } = await supa.rpc("lifecycle_due", { stage: st.key });
    if (error) { summary[st.key].failed = -1; continue; }
    for (const row of (due ?? []) as Array<{
      user_id: string; email: string; first_name: string | null;
      native_lang: string | null; unsubscribe_token: string;
    }>) {
      try {
        const lang = toLang(row.native_lang);
        const tpl = await loadTemplate(lang, st.file);
        const unsub = unsubscribeUrl(row.unsubscribe_token);
        await sendMail(row.email, subjectOf(tpl), personalize(tpl, row.first_name ?? "", unsub), unsub);
        // Erst nach erfolgreichem Versand protokollieren (Idempotenz).
        const { error: logErr } = await supa
          .from("email_log").insert({ user_id: row.user_id, email_key: st.key });
        if (logErr) throw new Error(`log insert: ${logErr.message}`);
        summary[st.key].sent++;
      } catch (_e) {
        summary[st.key].failed++;
      }
    }
  }
  return json({ ok: true, summary }, 200);
});
