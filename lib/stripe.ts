import Stripe from "stripe";

import { getStripeSecretKey } from "@/lib/env";

declare global {
  var stripeClient: Stripe | undefined;
}

export function getStripeClient() {
  if (!globalThis.stripeClient) {
    globalThis.stripeClient = new Stripe(getStripeSecretKey(), {
      apiVersion: "2026-03-25.dahlia",
    });
  }

  return globalThis.stripeClient;
}
