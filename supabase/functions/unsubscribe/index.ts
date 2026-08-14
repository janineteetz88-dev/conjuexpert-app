// Abmeldung von den ConjuExpert-Lifecycle-Mails.
// Setzt profiles.email_optout = true anhand des eindeutigen unsubscribe_token.
//
// - GET  /unsubscribe?token=<uuid>  → Abmeldung + kleine Bestätigungsseite
// - POST /unsubscribe?token=<uuid>  → RFC 8058 One-Click (List-Unsubscribe-Post)
//
// Öffentlich erreichbar (verify_jwt = false): der Token selbst ist das Geheimnis.
// Benötigt SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (automatisch vorhanden).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function page(title: string, msg: string, status: number): Response {
  const html = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#f5f5f7;">
<div style="max-width:460px;margin:60px auto;background:#fff;border-radius:20px;padding:40px 32px;text-align:center;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
<div style="height:4px;border-radius:4px;background:linear-gradient(to right,#ff3b5c,#ff7a18,#ffc400,#34c759,#0a84ff,#a557ff);margin:0 auto 24px;max-width:120px;"></div>
<h1 style="font-size:22px;color:#111827;margin:0 0 12px;">${title}</h1>
<p style="font-size:15px;color:#374151;line-height:1.55;margin:0 0 24px;">${msg}</p>
<a href="https://conjuexpert.app" style="display:inline-block;background:#e71583;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:12px;">Zu ConjuExpert →</a>
</div></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

async function optOut(token: string): Promise<boolean> {
  const supa = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
  const { data, error } = await supa
    .from("profiles")
    .update({ email_optout: true })
    .eq("unsubscribe_token", token)
    .select("id");
  return !error && !!data && data.length > 0;
}

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get("token") ?? "";

  // One-Click-POST (RFC 8058): 200 zurückgeben, keine HTML-Seite.
  if (req.method === "POST") {
    if (UUID_RE.test(token)) await optOut(token);
    return new Response(null, { status: 200 });
  }

  if (req.method !== "GET") return new Response("Method Not Allowed", { status: 405 });

  if (!UUID_RE.test(token)) {
    return page("Link ungültig", "Dieser Abmelde-Link ist ungültig oder unvollständig.", 400);
  }
  const ok = await optOut(token);
  return ok
    ? page("Abgemeldet ✓", "Du erhältst keine Onboarding-Mails mehr von ConjuExpert. Deine Login- und Konto-Mails bleiben davon unberührt.", 200)
    : page("Schon erledigt", "Wir konnten dich keiner aktiven Anmeldung zuordnen – vermutlich bist du bereits abgemeldet.", 200);
});
