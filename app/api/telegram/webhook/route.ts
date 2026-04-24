import { NextResponse } from "next/server";

import {
  answerTelegramCallbackQuery,
  isTelegramWebhookRequestValid,
  sendBookingTelegramNotification,
  sendBookingWhatsAppNotification,
  updateTelegramApprovalMessage,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type TelegramCallbackUpdate = {
  callback_query?: {
    id: string;
    data?: string;
    message?: {
      message_id: number;
      chat?: {
        id: number;
      };
    };
  };
};

export async function POST(request: Request) {
  const secretHeader = request.headers.get("x-telegram-bot-api-secret-token");

  if (!isTelegramWebhookRequestValid(secretHeader)) {
    return new NextResponse("Invalid Telegram webhook token.", { status: 401 });
  }

  const update = (await request.json()) as TelegramCallbackUpdate;
  const callbackQuery = update.callback_query;

  if (!callbackQuery?.id || !callbackQuery.data) {
    return NextResponse.json({ ok: true });
  }

  const [action, bookingId] = callbackQuery.data.split(":");

  if (!bookingId || (action !== "approve" && action !== "reject")) {
    await answerTelegramCallbackQuery(callbackQuery.id, "This action is invalid.");
    return NextResponse.json({ ok: true });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    await answerTelegramCallbackQuery(callbackQuery.id, "Booking not found.");
    return NextResponse.json({ ok: true });
  }

  if (booking.status !== "AWAITING_APPROVAL") {
    await answerTelegramCallbackQuery(
      callbackQuery.id,
      `Already ${booking.status.replaceAll("_", " ").toLowerCase()}.`,
    );
    return NextResponse.json({ ok: true });
  }

  const decisionTime = new Date();

  if (action === "reject") {
    const rejectedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        approvalDecisionAt: decisionTime,
      },
    });

    await answerTelegramCallbackQuery(callbackQuery.id, "Booking rejected.");

    if (callbackQuery.message?.chat?.id && callbackQuery.message.message_id) {
      await updateTelegramApprovalMessage(
        {
          chatId: callbackQuery.message.chat.id,
          messageId: callbackQuery.message.message_id,
        },
        [
          "Booking rejected",
          "",
          `Booking: ${rejectedBooking.id}`,
          `Customer: ${rejectedBooking.customerName}`,
          `Phone: ${rejectedBooking.phone}`,
          "Decision: Rejected in Telegram",
        ].join("\n"),
      );
    }

    return NextResponse.json({ ok: true });
  }

  if (booking.paymentMethod === "CASH") {
    const approvedCashBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        approvalDecisionAt: decisionTime,
      },
    });

    const existingPayment = await prisma.payment.findFirst({
      where: { bookingId },
    });

    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          bookingId,
          amount: approvedCashBooking.fareTotal,
          currency: "usd",
          status: "PENDING",
        },
      });
    }

    await answerTelegramCallbackQuery(callbackQuery.id, "Cash booking approved.");

    if (callbackQuery.message?.chat?.id && callbackQuery.message.message_id) {
      await updateTelegramApprovalMessage(
        {
          chatId: callbackQuery.message.chat.id,
          messageId: callbackQuery.message.message_id,
        },
        [
          "Booking approved",
          "",
          `Booking: ${approvedCashBooking.id}`,
          `Customer: ${approvedCashBooking.customerName}`,
          `Phone: ${approvedCashBooking.phone}`,
          "Payment: Cash due at pickup",
          "Status: Confirmed",
        ].join("\n"),
      );
    }

    const notificationPayload = {
      bookingId: approvedCashBooking.id,
      customerName: approvedCashBooking.customerName,
      phone: approvedCashBooking.phone,
      pickupAddress: approvedCashBooking.pickupAddress,
      dropoffAddress: approvedCashBooking.dropoffAddress,
      pickupTime: approvedCashBooking.pickupTime,
      passengers: approvedCashBooking.passengers,
      luggage: approvedCashBooking.luggage,
      fareTotal: approvedCashBooking.fareTotal,
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

    return NextResponse.json({ ok: true });
  }

  const approvedCardBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "PENDING_PAYMENT",
      approvalDecisionAt: decisionTime,
    },
  });

  await answerTelegramCallbackQuery(callbackQuery.id, "Booking approved for checkout.");

  if (callbackQuery.message?.chat?.id && callbackQuery.message.message_id) {
    await updateTelegramApprovalMessage(
      {
        chatId: callbackQuery.message.chat.id,
        messageId: callbackQuery.message.message_id,
      },
      [
        "Booking approved",
        "",
        `Booking: ${approvedCardBooking.id}`,
        `Customer: ${approvedCardBooking.customerName}`,
        `Phone: ${approvedCardBooking.phone}`,
        "Payment: Rider can now continue to Stripe checkout",
      ].join("\n"),
    );
  }

  return NextResponse.json({ ok: true });
}
