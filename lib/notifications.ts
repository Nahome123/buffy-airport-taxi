import "server-only";

import {
  getTelegramBotToken,
  getTelegramChatId,
  getTwilioAccountSid,
  getTwilioAuthToken,
  getTwilioWhatsAppFrom,
  getTwilioWhatsAppTo,
} from "@/lib/env";

type BookingNotificationInput = {
  bookingId: string;
  customerName: string;
  phone: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupTime: Date | string;
  passengers: number;
  luggage: number;
  fareTotal: number;
  paymentLabel?: string;
};

function isWhatsAppConfigured() {
  return Boolean(
    getTwilioAccountSid() &&
      getTwilioAuthToken() &&
      getTwilioWhatsAppFrom() &&
      getTwilioWhatsAppTo(),
  );
}

export async function sendBookingWhatsAppNotification(
  booking: BookingNotificationInput,
) {
  if (!isWhatsAppConfigured()) {
    return;
  }

  const accountSid = getTwilioAccountSid();
  const authToken = getTwilioAuthToken();
  const from = getTwilioWhatsAppFrom();
  const to = getTwilioWhatsAppTo();

  if (!accountSid || !authToken || !from || !to) {
    return;
  }

  const body = [
    "New Buffy Airport Taxi booking confirmed.",
    `Booking: ${booking.bookingId}`,
    `Customer: ${booking.customerName}`,
    `Phone: ${booking.phone}`,
    `Pickup: ${booking.pickupAddress}`,
    `Dropoff: ${booking.dropoffAddress}`,
    `Time: ${new Date(booking.pickupTime).toLocaleString("en-US")}`,
    `Passengers: ${booking.passengers}`,
    `Luggage: ${booking.luggage}`,
    `Fare: $${(booking.fareTotal / 100).toFixed(2)}`,
    `Payment: ${booking.paymentLabel ?? "Card paid"}`,
  ].join("\n");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: to,
        Body: body,
      }).toString(),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Twilio WhatsApp notification failed: ${errorText}`);
  }
}

function isTelegramConfigured() {
  return Boolean(getTelegramBotToken() && getTelegramChatId());
}

export async function sendBookingTelegramNotification(
  booking: BookingNotificationInput,
) {
  if (!isTelegramConfigured()) {
    return;
  }

  const botToken = getTelegramBotToken();
  const chatId = getTelegramChatId();

  if (!botToken || !chatId) {
    return;
  }

  const text = [
    "New Buffy Airport Taxi booking confirmed",
    "",
    `Booking: ${booking.bookingId}`,
    `Customer: ${booking.customerName}`,
    `Phone: ${booking.phone}`,
    `Pickup: ${booking.pickupAddress}`,
    `Dropoff: ${booking.dropoffAddress}`,
    `Time: ${new Date(booking.pickupTime).toLocaleString("en-US")}`,
    `Passengers: ${booking.passengers}`,
    `Luggage: ${booking.luggage}`,
    `Fare: $${(booking.fareTotal / 100).toFixed(2)}`,
    `Payment: ${booking.paymentLabel ?? "Card paid"}`,
  ].join("\n");

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram notification failed: ${errorText}`);
  }
}
