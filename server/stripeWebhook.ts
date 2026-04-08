import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Use placeholder if key not set to avoid crash at startup; Stripe API calls will fail gracefully
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder_replace_me", {
  apiVersion: "2025-03-31.basil",
});

function tierFromPriceId(priceId: string): "pro" | "trade" | null {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_TRADE_PRICE_ID) return "trade";
  return null;
}

export function registerStripeWebhook(app: Express) {
  // MUST use raw body for Stripe signature verification
  app.post(
    "/api/stripe/webhook",
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          (req as any).rawBody ?? req.body,
          sig as string,
          webhookSecret
        );
      } catch (err: any) {
        console.error("[Stripe Webhook] Signature verification failed:", err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }

      // Handle test events — return verified immediately
      if (event.id.startsWith("evt_test_")) {
        console.log("[Stripe Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Stripe Webhook] Event: ${event.type} (${event.id})`);

      const db = await getDb();
      if (!db) {
        console.error("[Stripe Webhook] DB not available");
        return res.status(500).json({ error: "DB unavailable" });
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.user_id
              ? parseInt(session.metadata.user_id, 10)
              : null;
            const customerId = session.customer as string | null;
            const subscriptionId = session.subscription as string | null;

            if (!userId || !customerId || !subscriptionId) break;

            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const subItem = subscription.items.data[0];
            const priceId = subItem?.price.id ?? "";
            const tier = tierFromPriceId(priceId) ?? "pro";

            const periodEnd = subItem?.current_period_end
              ? new Date(subItem.current_period_end * 1000)
              : null;

            await db
              .update(users)
              .set({
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                subscriptionTier: tier,
                subscriptionExpiresAt: periodEnd,
              })
              .where(eq(users.id, userId));

            console.log(`[Stripe Webhook] User ${userId} upgraded to ${tier}`);
            break;
          }

          case "invoice.paid": {
            const invoice = event.data.object as Stripe.Invoice;
            const subscriptionId = (invoice as any).subscription as string | null;
            const customerId = invoice.customer as string | null;
            if (!subscriptionId || !customerId) break;

            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const subItem = subscription.items.data[0];
            const priceId = subItem?.price.id ?? "";
            const tier = tierFromPriceId(priceId) ?? "pro";
            const periodEnd = subItem?.current_period_end
              ? new Date(subItem.current_period_end * 1000)
              : null;

            await db
              .update(users)
              .set({
                subscriptionTier: tier,
                subscriptionExpiresAt: periodEnd,
              })
              .where(eq(users.stripeCustomerId, customerId));

            console.log(`[Stripe Webhook] Invoice paid — subscription renewed for customer ${customerId}`);
            break;
          }

          case "customer.subscription.deleted":
          case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            if (
              event.type === "customer.subscription.deleted" ||
              subscription.status === "canceled" ||
              subscription.status === "unpaid"
            ) {
              await db
                .update(users)
                .set({
                  subscriptionTier: "free",
                  stripeSubscriptionId: null,
                  subscriptionExpiresAt: null,
                })
                .where(eq(users.stripeCustomerId, customerId));
              console.log(`[Stripe Webhook] Subscription cancelled for customer ${customerId}`);
            } else if (subscription.status === "active") {
            const subItem = subscription.items.data[0];
            const priceId = subItem?.price.id ?? "";
            const tier = tierFromPriceId(priceId) ?? "pro";
            const periodEnd = subItem?.current_period_end
              ? new Date(subItem.current_period_end * 1000)
              : null;
              await db
                .update(users)
                .set({ subscriptionTier: tier, subscriptionExpiresAt: periodEnd })
                .where(eq(users.stripeCustomerId, customerId));
            }
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err: any) {
        console.error("[Stripe Webhook] Handler error:", err.message);
        return res.status(500).json({ error: "Internal handler error" });
      }

      res.json({ received: true });
    }
  );
}
