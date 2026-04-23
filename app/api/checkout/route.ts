import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/env";
import {
  sendBookingTelegramNotification,
  sendBookingWhatsAppNotification,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { getMileageEstimate } from "@/lib/routing";
import { getStripeClient } from "@/lib/stripe";
import { bookingPayloadSchema } from "@/lib/validations/booking";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Please correct the highlighted fields and try again.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const payload = parsed.data;
    const estimate = await getMileageEstimate(
      payload.pickupAddress,
      payload.dropoffAddress,
    );
    const fareTotal = estimate.fareCents;

    const booking = await prisma.booking.create({
      data: {
        customerName: payload.customerName,
        email: payload.email,
        phone: payload.phone,
        pickupAddress: payload.pickupAddress,
        dropoffAddress: payload.dropoffAddress,
        pickupTime: payload.pickupTime,
        passengers: payload.passengers,
        luggage: payload.luggage,
        fareTotal,
        status:
          payload.paymentMethod === "cash" ? "CONFIRMED" : "PENDING_PAYMENT",
      },
    });

    const appUrl = getAppUrl();

    if (payload.paymentMethod === "cash") {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: fareTotal,
          currency: "usd",
          status: "PENDING",
        },
      });

      const notificationPayload = {
        bookingId: booking.id,
        customerName: booking.customerName,
        pickupAddress: booking.pickupAddress,
        dropoffAddress: booking.dropoffAddress,
        pickupTime: booking.pickupTime,
        passengers: booking.passengers,
        luggage: booking.luggage,
        fareTotal: booking.fareTotal,
        paymentLabel: "Cash due at pickup",
      };

      try {
        await sendBookingWhatsAppNotification(notificationPayload);
      } catch (error) {
        console.error("WhatsApp notification failed", error);
      }

      try {
        await sendBookingTelegramNotification(notificationPayload);
      } catch (error) {
        console.error("Telegram notification failed", error);
      }

      return NextResponse.json({
        url: `${appUrl}/success?bookingId=${booking.id}&paymentMethod=cash`,
      });
    }

    const session = await getStripeClient().checkout.sessions.create({
      mode: "payment",
      success_url: `${appUrl}/success?bookingId=${booking.id}&paymentMethod=card`,
      cancel_url: `${appUrl}/cancel?bookingId=${booking.id}`,
      customer_email: booking.email,
      metadata: {
        bookingId: booking.id,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: fareTotal,
            product_data: {
              name: "Airport taxi booking",
              description: `${booking.pickupAddress} -> ${booking.dropoffAddress}`,
            },
          },
        },
      ],
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe Checkout did not return a redirect URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session creation failed", error);
    return NextResponse.json(
      { error: "Unable to create checkout session right now." },
      { status: 500 },
    );
  }
}
