import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/env";
import { sendBookingTelegramApprovalRequest } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { getMileageEstimate } from "@/lib/routing";
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
        status: "AWAITING_APPROVAL",
        paymentMethod: payload.paymentMethod === "cash" ? "CASH" : "CARD",
      },
    });

    const appUrl = getAppUrl();

    try {
      await sendBookingTelegramApprovalRequest({
        bookingId: booking.id,
        customerName: booking.customerName,
        phone: payload.phone,
        pickupAddress: booking.pickupAddress,
        dropoffAddress: booking.dropoffAddress,
        pickupTime: booking.pickupTime,
        passengers: booking.passengers,
        luggage: booking.luggage,
        fareTotal: booking.fareTotal,
        paymentLabel:
          payload.paymentMethod === "cash"
            ? "Cash booking waiting for approval"
            : "Card checkout waiting for approval",
      });
    } catch (error) {
      console.error("Telegram approval request failed", error);
    }

    return NextResponse.json({
      url: `${appUrl}/booking/${booking.id}/pending`,
    });
  } catch (error) {
    console.error("Checkout session creation failed", error);
    return NextResponse.json(
      { error: "Unable to create checkout session right now." },
      { status: 500 },
    );
  }
}
