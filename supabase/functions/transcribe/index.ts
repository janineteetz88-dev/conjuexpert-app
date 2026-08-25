import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "https://conjuexpert.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Whisper akzeptiert bis zu 25 MB, aber Aussprache-Snippets im Quiz sind
// wenige Sekunden lang. 8 MB deckt das großzügig ab und begrenzt gleichzeitig
// die OpenAI-Kosten pro Aufruf.
const MAX_FILE_BYTES = 8 * 1024 * 1024;

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: { message: "Method Not Allowed" } }, 405);

  // Der öffentliche Anon-/Publishable-Key ist selbst ein gültiges JWT — ohne
  // diese Prüfung könnte jeder Inhaber des öffentlichen Keys die Function
  // beliebig oft aufrufen und Kosten gegen den OpenAI-Account verursachen.
  // Ein echter Nutzer-Login ist deshalb Pflicht.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: { message: "Unauthorized" } }, 401);

  const supaUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error: authError } = await supaUser.auth.getUser();
  if (authError || !user) return json({ error: { message: "Unauthorized" } }, 401);

  const supaAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Rate-Limit: maximal 20 Transkriptionen pro Nutzer innerhalb von 10
  // Minuten. Verhindert Kosten-Abuse gegen den OpenAI-Account, auch durch
  // legitim eingeloggte Accounts. Atomar protokolliert vor dem OpenAI-Call.
  const { data: attemptAllowed, error: attemptError } = await supaAdmin.rpc(
    "check_and_record_transcribe_attempt",
    { p_user_id: user.id }
  );
  if (attemptError) return json({ error: { message: attemptError.message } }, 500);
  if (!attemptAllowed) {
    return json({ error: { message: "Zu viele Anfragen. Bitte kurz warten." } }, 429);
  }

  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return json({ error: { message: "OPENAI_API_KEY not configured" } }, 500);

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") return json({ error: { message: "Missing audio file" } }, 400);
    if ((file as File).size > MAX_FILE_BYTES) {
      return json({ error: { message: "Audiodatei zu groß" } }, 413);
    }
    const language = (form.get("language") || "").toString().trim();

    const oa = new FormData();
    oa.append("file", file, (file as File).name || "audio.webm");
    oa.append("model", "whisper-1");
    oa.append("response_format", "json");
    if (language) oa.append("language", language);

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}` },
      body: oa,
    });
    const data = await res.json();
    if (!res.ok) return json({ error: data.error || { message: "transcription failed" } }, res.status);
    return json({ text: data.text || "" });
  } catch (err) {
    return json({ error: { message: (err as Error).message } }, 500);
  }
});
