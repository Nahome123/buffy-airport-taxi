import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (booking.paymentMethod !== "CARD") {
    return NextResponse.json(
      { error: "Cash bookings do not use Stripe checkout." },
      { status: 400 },
    );
  }

  if (booking.status !== "PENDING_PAYMENT") {
    return NextResponse.json(
      { error: "This booking is not approved for checkout yet." },
      { status: 409 },
    );
  }

  const stripe = getStripeClient();

  if (booking.stripeSessionId) {
    const existingSession = await stripe.checkout.sessions.retrieve(
      booking.stripeSessionId,
    );

    if (existingSession.url) {
      return NextResponse.json({ url: existingSession.url });
    }
  }

  const appUrl = getAppUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl}/success?bookingId=${booking.id}&paymentMethod=card`,
    cancel_url: `${appUrl}/booking/${booking.id}/pending`,
    customer_email: booking.email,
    metadata: {
      bookingId: booking.id,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: booking.fareTotal,
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
    data: {
      stripeSessionId: session.id,
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe Checkout did not return a redirect URL." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
