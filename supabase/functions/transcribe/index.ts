import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: { message: "Method Not Allowed" } }, 405);

  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return json({ error: { message: "OPENAI_API_KEY not configured" } }, 500);

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") return json({ error: { message: "Missing audio file" } }, 400);
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
