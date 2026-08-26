import Stripe from "https://esm.sh/stripe@14?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
  });

  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();

  let stripeEvent;
  try {
    stripeEvent = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Kauf-Protokoll (purchase_events): Historie für den wöchentlichen
  // Kaufstrecken-Check ("0 Verkäufe"-Alarm). Darf die eigentliche
  // Webhook-Verarbeitung NIE gefährden — deshalb fail-safe.
  const logPurchaseEvent = async (fields: Record<string, unknown>) => {
    try {
      await supabase.from("purchase_events").insert(fields);
    } catch (e) {
      console.error("purchase_events insert failed:", e);
    }
  };

  if (stripeEvent.type === "checkout.session.completed") {
    const session = stripeEvent.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (!userId) return new Response("No userId in metadata", { status: 400 });

    const sub = await stripe.subscriptions.retrieve(session.subscription as string);
    const premiumUntil = new Date(sub.current_period_end * 1000).toISOString();

    await supabase.from("profiles").upsert({
      id: userId,
      is_premium: true,
      premium_until: premiumUntil,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
    });

    await logPurchaseEvent({
      event_type: "checkout.session.completed",
      user_id: userId,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
    });
  }

  if (stripeEvent.type === "customer.subscription.deleted") {
    const sub = stripeEvent.data.object as Stripe.Subscription;
    await supabase
      .from("profiles")
      .update({ is_premium: false, premium_until: null, stripe_subscription_id: null })
      .eq("stripe_customer_id", sub.customer);

    await logPurchaseEvent({
      event_type: "customer.subscription.deleted",
      stripe_customer_id: sub.customer,
      stripe_subscription_id: sub.id,
    });
  }

  if (stripeEvent.type === "invoice.payment_failed") {
    const invoice = stripeEvent.data.object as Stripe.Invoice;
    await supabase
      .from("profiles")
      .update({ is_premium: false })
      .eq("stripe_customer_id", invoice.customer);

    await logPurchaseEvent({
      event_type: "invoice.payment_failed",
      stripe_customer_id: invoice.customer,
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
