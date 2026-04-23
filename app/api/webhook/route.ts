import Stripe from "stripe";

import { getStripeWebhookSecret } from "@/lib/env";
import {
  sendBookingTelegramNotification,
  sendBookingWhatsAppNotification,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing Stripe signature.", { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;

  try {
    event = await getStripeClient().webhooks.constructEventAsync(
      payload,
      signature,
      getStripeWebhookSecret(),
    );
  } catch (error) {
    console.error("Webhook signature verification failed", error);
    return new Response("Invalid signature.", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!bookingId) {
      return new Response("Missing booking metadata.", { status: 400 });
    }

    const booking = await prisma.$transaction(async (transaction) => {
      const updatedBooking = await transaction.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          stripeSessionId: session.id,
        },
      });

      const existingPayment = paymentIntentId
        ? await transaction.payment.findUnique({
            where: {
              stripePaymentId: paymentIntentId,
            },
          })
        : null;

      if (existingPayment) {
        await transaction.payment.update({
          where: {
            id: existingPayment.id,
          },
          data: {
            amount: updatedBooking.fareTotal,
            currency: session.currency ?? "usd",
            status: "PAID",
          },
        });
      } else {
        await transaction.payment.create({
          data: {
            bookingId,
            stripePaymentId: paymentIntentId,
            amount: updatedBooking.fareTotal,
            currency: session.currency ?? "usd",
            status: "PAID",
          },
        });
      }

      return updatedBooking;
    });

    try {
      await sendBookingWhatsAppNotification({
        bookingId: booking.id,
        customerName: booking.customerName,
        pickupAddress: booking.pickupAddress,
        dropoffAddress: booking.dropoffAddress,
        pickupTime: booking.pickupTime,
        passengers: booking.passengers,
        luggage: booking.luggage,
        fareTotal: booking.fareTotal,
        paymentLabel: "Card paid via Stripe",
      });
    } catch (error) {
      console.error("WhatsApp notification failed", error);
    }

    try {
      await sendBookingTelegramNotification({
        bookingId: booking.id,
        customerName: booking.customerName,
        pickupAddress: booking.pickupAddress,
        dropoffAddress: booking.dropoffAddress,
        pickupTime: booking.pickupTime,
        passengers: booking.passengers,
        luggage: booking.luggage,
        fareTotal: booking.fareTotal,
        paymentLabel: "Card paid via Stripe",
      });
    } catch (error) {
      console.error("Telegram notification failed", error);
    }
  }

  return new Response("ok", { status: 200 });
}
