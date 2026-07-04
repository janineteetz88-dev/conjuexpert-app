import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://conjuexpert.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// The discounted annual price (24,99 €) is the feedback reward. Only grant it
// when the user has actually left feedback (a reviews row) and the code window
// (code_expires_at = end of trial) has not passed. Anything unverified falls
// back to the regular annual price — we never block the purchase.
async function feedbackDiscountValid(userId: string): Promise<boolean> {
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { count } = await admin
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (!count) return false;
    const { data: profile } = await admin
      .from("profiles")
      .select("code_expires_at")
      .eq("id", userId)
      .single();
    // No expiry stored → treat as still valid (feedback exists). Otherwise honour it.
    if (profile?.code_expires_at && new Date(profile.code_expires_at) < new Date()) {
      return false;
    }
    return true;
  } catch (_e) {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  const { plan, userId, email } = await req.json();
  if (!plan || !userId) {
    return new Response(JSON.stringify({ error: "Missing plan or userId" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const secretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
  // Resolve the effective plan: a bonus request only stays "annual_bonus" if the
  // feedback discount checks out; otherwise it degrades to the full annual price.
  const effectivePlan = plan === "annual_bonus" && !(await feedbackDiscountValid(userId))
    ? "annual"
    : plan;
  const priceId = effectivePlan === "annual_bonus"
    ? Deno.env.get("STRIPE_PRICE_ANNUAL_BONUS")!
    : effectivePlan === "annual"
    ? Deno.env.get("STRIPE_PRICE_ANNUAL")!
    : Deno.env.get("STRIPE_PRICE_MONTHLY")!;

  const params = new URLSearchParams({
    mode: "subscription",
    "payment_method_types[0]": "card",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    "metadata[userId]": userId,
    allow_promotion_codes: "true",
    success_url: `https://conjuexpert.app/?payment=success&plan=${effectivePlan === "monthly" ? "monthly" : "annual"}`,
    cancel_url: "https://conjuexpert.app/?payment=cancel",
    locale: "de",
  });
  if (email) params.set("customer_email", email);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify({ error: data.error?.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ url: data.url }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
