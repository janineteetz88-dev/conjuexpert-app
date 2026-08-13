import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://conjuexpert.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_LANGS = ["de", "es", "en", "nl", "fr"];
const ALLOWED_LEVELS = ["beginner", "intermediate", "advanced"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body, status) => new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { lang, topic, level, tenses, sentences, questions } = body || {};

  // Dieselben Bounds, die vorher in der RLS-Policy texte_stories_insert_bounded
  // standen (siehe Migration 20260709_lock_texte_stories_insert.sql) — jetzt
  // serverseitig, da direkter Client-Insert nicht mehr erlaubt ist.
  if (!ALLOWED_LANGS.includes(lang)) return json({ error: "Invalid lang" }, 400);
  if (!ALLOWED_LEVELS.includes(level)) return json({ error: "Invalid level" }, 400);
  if (typeof topic !== "string" || !topic.length || topic.length > 40) {
    return json({ error: "Invalid topic" }, 400);
  }
  const tensesStr = tenses == null ? "" : String(tenses);
  if (tensesStr.length > 160) return json({ error: "Invalid tenses" }, 400);
  if (!Array.isArray(sentences) || sentences.length < 1 || sentences.length > 80) {
    return json({ error: "Invalid sentences" }, 400);
  }

  const supaAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { error } = await supaAdmin.from("texte_stories").insert({
    lang,
    topic,
    level,
    tenses: tensesStr,
    sentences,
    questions: questions || null,
  });

  if (error) return json({ error: "Insert failed" }, 500);
  return json({ ok: true }, 200);
});
