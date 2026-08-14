// Nimmt Nutzer-Meldungen (falsche/komische KI-Inhalte + allgemeines Feedback)
// entgegen: speichert in public.content_reports (service_role) und schickt eine
// Benachrichtigung an hello@conjuexpert.app via Resend (best effort).
// verify_jwt:false, damit auch anonyme Lernende melden koennen.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const jhead = { ...cors, "Content-Type": "application/json" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers: jhead });

  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch (_) { /* ignore */ }
  const clip = (s: unknown, n = 600) => (s == null ? null : String(s).slice(0, n));
  const row = {
    lang: clip(b.lang, 8),
    kind: clip(b.kind, 20),
    reason: clip(b.reason, 40),
    note: clip(b.note, 1000),
    verb: clip(b.verb, 120),
    tense: clip(b.tense, 120),
    pronoun: clip(b.pronoun, 60),
    sentence: clip(b.sentence, 800),
    translation: clip(b.translation, 800),
    app_version: clip(b.app_version, 40),
    user_email: clip(b.user_email, 200),
    user_id: (typeof b.user_id === "string" && (b.user_id as string).length <= 64) ? b.user_id : null,
    user_agent: clip(req.headers.get("user-agent"), 400),
  };

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  try {
    const sb = createClient(SUPABASE_URL, SERVICE);
    const { error } = await sb.from("content_reports").insert(row);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: jhead });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: jhead });
  }

  // Benachrichtigung an hello@ (best effort, blockiert die Antwort nicht bei Fehler)
  try {
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const esc = (s: unknown) => String(s ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
      const subject = `⚐ Meldung: ${row.reason || "feedback"} (${row.lang || "?"})`;
      const html =
        `<h2>Neue Meldung in ConjuExpert</h2>` +
        `<p><b>Grund:</b> ${esc(row.reason)} · <b>Sprache:</b> ${esc(row.lang)} · <b>Typ:</b> ${esc(row.kind)}</p>` +
        (row.sentence ? `<p><b>Satz:</b> ${esc(row.sentence)}</p>` : "") +
        (row.translation ? `<p><b>Übersetzung:</b> ${esc(row.translation)}</p>` : "") +
        (row.verb ? `<p><b>Verb:</b> ${esc(row.verb)} · <b>Zeit:</b> ${esc(row.tense)} · <b>Pronomen:</b> ${esc(row.pronoun)}</p>` : "") +
        (row.note ? `<p><b>Notiz:</b> ${esc(row.note)}</p>` : "") +
        `<hr><p style=\"color:#888;font-size:12px\">User: ${esc(row.user_email) || "anonym"} · App ${esc(row.app_version)}<br>${esc(row.user_agent)}</p>`;
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: Deno.env.get("EMAIL_FROM") ?? "ConjuExpert <hello@conjuexpert.app>",
          to: ["hello@conjuexpert.app"],
          subject,
          html,
        }),
      });
    }
  } catch (_) { /* Mail best-effort; Meldung ist bereits gespeichert */ }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: jhead });
});
