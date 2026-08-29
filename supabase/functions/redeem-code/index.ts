import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://conjuexpert.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supaUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supaUser.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { code } = await req.json();
  if (!code) {
    return new Response(JSON.stringify({ error: "Missing code" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supaAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Rate-Limit: maximal 10 Einlöseversuche pro Nutzer innerhalb von 15
  // Minuten, um Brute-Force-Erraten gültiger Codes zu verhindern. Der
  // Versuch wird atomar protokolliert, bevor der Code selbst geprüft wird.
  const { data: attemptAllowed, error: attemptError } = await supaAdmin.rpc(
    "check_and_record_redeem_attempt",
    { p_user_id: user.id }
  );

  if (attemptError) {
    return new Response(JSON.stringify({ error: attemptError.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!attemptAllowed) {
    return new Response(
      JSON.stringify({ error: "Zu viele Versuche. Bitte warte 15 Minuten und versuche es erneut." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: promo, error: promoError } = await supaAdmin
    .from("promo_codes")
    .select("code, months, days, active, max_uses, current_uses, expires_at")
    .eq("code", code.trim().toUpperCase())
    .eq("active", true)
    .single();

  if (promoError || !promo) {
    return new Response(JSON.stringify({ error: "Ungültiger Code" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Nutzungslimit prüfen. max_uses === null bedeutet unbegrenzt nutzbar.
  if (promo.max_uses !== null && (promo.current_uses ?? 0) >= promo.max_uses) {
    return new Response(JSON.stringify({ error: "Ungültiger Code" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Ablaufdatum prüfen. expires_at === null bedeutet kein Ablauf.
  if (promo.expires_at && new Date(promo.expires_at).getTime() < Date.now()) {
    return new Response(JSON.stringify({ error: "Ungültiger Code" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verhindern, dass derselbe Nutzer denselben Code mehrfach einlöst.
  const { data: alreadyRedeemed } = await supaAdmin
    .from("user_promo_redemptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("promo_code", promo.code)
    .maybeSingle();

  if (alreadyRedeemed) {
    return new Response(JSON.stringify({ error: "Code bereits eingelöst" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Nutzungszähler atomar per RPC prüfen UND erhöhen (schließt die Read-then-
  // Write-Race der vorherigen SELECT-dann-UPDATE-Logik). Kein Datensatz
  // zurück => Limit wurde inzwischen erreicht (z. B. durch eine parallele
  // Anfrage kurz vor max_uses).
  const { data: usageRows, error: usageError } = await supaAdmin.rpc(
    "increment_promo_code_usage",
    { p_code: promo.code }
  );

  if (usageError) {
    return new Response(JSON.stringify({ error: usageError.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!usageRows || usageRows.length === 0) {
    return new Response(JSON.stringify({ error: "Ungültiger Code" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Wochen-/Tage-genaue Codes (days) haben Vorrang vor Monats-Codes (months);
  // ohne beides gilt der Code als zeitlich unbegrenzt (2099).
  const premiumUntil = promo.days
    ? new Date(Date.now() + promo.days * 24 * 60 * 60 * 1000).toISOString()
    : promo.months
    ? new Date(Date.now() + promo.months * 30 * 24 * 60 * 60 * 1000).toISOString()
    : "2099-12-31T00:00:00.000Z";

  const { error: profileError } = await supaAdmin.from("profiles").upsert({
    id: user.id,
    is_premium: true,
    premium_until: premiumUntil,
  });

  if (profileError) {
    return new Response(JSON.stringify({ error: profileError.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Einlösung festhalten — UNIQUE-Constraint (user_id, promo_code) verhindert
  // Race-Condition-basierte Mehrfach-Einlösungen auf DB-Ebene zusätzlich ab.
  await supaAdmin
    .from("user_promo_redemptions")
    .insert({ user_id: user.id, promo_code: promo.code });

  return new Response(JSON.stringify({ success: true, premium_until: premiumUntil }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
