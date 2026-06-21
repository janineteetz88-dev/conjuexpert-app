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

  const { data: promo, error: promoError } = await supaAdmin
    .from("promo_codes")
    .select("code, months, active, max_uses, current_uses")
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

  const premiumUntil = promo.months
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

  // Nutzungszähler erhöhen und nur deaktivieren, wenn das Limit erreicht ist.
  // max_uses === null => unbegrenzt nutzbar (z. B. öffentlicher Aktionscode),
  // bleibt also dauerhaft aktiv.
  const newUses = (promo.current_uses ?? 0) + 1;
  const reachedLimit = promo.max_uses !== null && newUses >= promo.max_uses;
  const { error: usageError } = await supaAdmin
    .from("promo_codes")
    .update({ current_uses: newUses, active: reachedLimit ? false : true })
    .eq("code", promo.code);

  if (usageError) {
    console.error("promo_codes usage update failed:", usageError.message);
  }

  return new Response(JSON.stringify({ success: true, premium_until: premiumUntil }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
