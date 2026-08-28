// book-school-call
// Öffentliches Buchungstool für 20-Min.-Kennenlerngespräche mit Sprachschulen,
// verlinkt von /landing/sprachschulen/. Kein Google Calendar — eigene, feste
// Slot-Logik (Di–Do, 11:00/11:20/11:40/12:00) plus Mail-Benachrichtigung.
//
// Öffentlich erreichbar (verify_jwt = false) — kein Login, jeder darf einen
// freien Slot buchen. Schutz: Honeypot-Feld + DB-Unique-Constraint gegen
// Doppelbuchung (kein Vertrauen auf Client-seitige Validierung).
//
// Deploy: siehe README.md in diesem Ordner.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("EMAIL_FROM") ?? "ConjuExpert <hello@conjuexpert.app>";
const NOTIFY_TO = ["kontakt@tb-kreiser.de", "hello@conjuexpert.app"];

const ALLOWED_WEEKDAYS = new Set([2, 3, 4]); // Di, Mi, Do (0=So)
const ALLOWED_TIMES = new Set(["11:00", "11:20", "11:40", "12:00"]);
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

function isValidSlot(dateStr: string, timeStr: string): boolean {
  if (!ALLOWED_TIMES.has(timeStr)) return false;
  const d = new Date(`${dateStr}T${timeStr}:00`);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) return false;
  // Wochentag anhand des Datumsanteils prüfen, unabhängig von der Serverzeitzone.
  const [y, m, dd] = dateStr.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, (m ?? 1) - 1, dd ?? 1)).getUTCDay();
  return ALLOWED_WEEKDAYS.has(weekday);
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

  const schoolName = String(body.schoolName ?? "").trim();
  const contactName = String(body.contactName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const slotDate = String(body.slotDate ?? "").trim();
  const slotTime = String(body.slotTime ?? "").trim();
  const interestedModel = String(body.interestedModel ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!schoolName || !contactName || !email || !slotDate || !slotTime) {
    return json({ error: "Bitte alle Pflichtfelder ausfüllen." }, 400);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ error: "E-Mail-Adresse sieht ungültig aus." }, 400);
  }
  if (!isValidSlot(slotDate, slotTime)) {
    return json({ error: "Dieser Termin liegt außerhalb der buchbaren Zeiten (Di–Do, 11:00–12:30)." }, 400);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const { error: insertErr } = await admin.from("school_call_bookings").insert({
    school_name: schoolName,
    contact_name: contactName,
    email,
    phone: phone || null,
    slot_date: slotDate,
    slot_time: slotTime,
    interested_model: interestedModel || null,
    message: message || null,
  });

  if (insertErr) {
    // Unique-Constraint (slot_date, slot_time) → Slot schon vergeben.
    if (insertErr.code === "23505") {
      return json({ error: "Dieser Termin ist gerade eben vergeben worden. Bitte einen anderen wählen." }, 409);
    }
    return json({ error: "Konnte den Termin nicht speichern." }, 500);
  }

  const niceDate = new Date(`${slotDate}T00:00:00`).toLocaleDateString("de-DE", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
  const html = `
    <h2>Neue Terminanfrage — Sprachschulen-Kennenlerngespräch</h2>
    <p><b>${niceDate}, ${slotTime} Uhr</b> (20 Min.)</p>
    <ul>
      <li><b>Schule:</b> ${schoolName}</li>
      <li><b>Ansprechpartner:in:</b> ${contactName}</li>
      <li><b>E-Mail:</b> ${email}</li>
      ${phone ? `<li><b>Telefon:</b> ${phone}</li>` : ""}
      ${interestedModel ? `<li><b>Interessiert an:</b> ${interestedModel}</li>` : ""}
    </ul>
    ${message ? `<p><b>Nachricht:</b><br>${message.replace(/\n/g, "<br>")}</p>` : ""}
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: NOTIFY_TO,
      reply_to: email,
      subject: `Terminanfrage: ${schoolName} — ${niceDate}, ${slotTime} Uhr`,
      html,
    }),
  });
  if (!res.ok) {
    // Termin ist gespeichert, nur die Benachrichtigung ist fehlgeschlagen — nicht
    // als Nutzerfehler zurückgeben, aber serverseitig sichtbar machen.
    console.error("Resend failed:", res.status, await res.text());
  }

  return json({ ok: true }, 200);
});
