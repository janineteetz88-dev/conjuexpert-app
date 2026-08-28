// request-school-callback
// Öffentliches Rückruf-Formular für Sprachschulen, verlinkt von
// /landing/sprachschulen/. Kein fester Kalender-Slot — die Schule wählt nur
// einen Wunsch-Wochentag (Di/Mi/Do), wir rufen dann zwischen 11 und 12:30 Uhr
// zurück und bestätigen den genauen Zeitpunkt manuell. Nach dem Vorbild von
// immobilien-bannewitz.de: möglichst wenig Aufwand für die anfragende Person,
// Verbindlichkeit entsteht erst im Rückruf, nicht im Formular.
//
// Öffentlich erreichbar (verify_jwt = false) — kein Login nötig.
// Deploy: siehe README.md in diesem Ordner.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("EMAIL_FROM") ?? "ConjuExpert <hello@conjuexpert.app>";
const NOTIFY_TO = ["kontakt@tb-kreiser.de", "hello@conjuexpert.app"];

const ALLOWED_DAYS = new Set(["Dienstag", "Donnerstag"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://conjuexpert.app",
  "Access-Control-Allow-Headers": "content-type",
};

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

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  // Honeypot: unsichtbares Feld im Formular, das nur Bots ausfüllen.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true }, 200); // stiller Erfolg, damit Bots nichts lernen
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const preferredDay = String(body.preferredDay ?? "").trim();

  if (!name || !email || !preferredDay) {
    return json({ error: "Bitte Name, E-Mail und Wunschtag angeben." }, 400);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ error: "E-Mail-Adresse sieht ungültig aus." }, 400);
  }
  if (!ALLOWED_DAYS.has(preferredDay)) {
    return json({ error: "Bitte Dienstag oder Donnerstag wählen." }, 400);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const { error: insertErr } = await admin.from("school_callback_requests").insert({
    name, email, phone: phone || null, preferred_day: preferredDay,
  });
  if (insertErr) return json({ error: "Konnte die Anfrage nicht speichern." }, 500);

  const html = `
    <h2>Neue Rückruf-Anfrage — Sprachschule</h2>
    <ul>
      <li><b>Name/Schule:</b> ${name}</li>
      <li><b>E-Mail:</b> ${email}</li>
      ${phone ? `<li><b>Telefon:</b> ${phone}</li>` : ""}
      <li><b>Wunschtag:</b> ${preferredDay}, zwischen 11:00 und 12:30 Uhr</li>
    </ul>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: NOTIFY_TO,
      reply_to: email,
      subject: `Rückruf-Anfrage: ${name} (${preferredDay})`,
      html,
    }),
  });
  if (!res.ok) {
    // Anfrage ist gespeichert, nur die Benachrichtigung ist fehlgeschlagen —
    // kein Nutzerfehler, aber serverseitig sichtbar machen.
    console.error("Resend failed:", res.status, await res.text());
  }

  return json({ ok: true }, 200);
});
