import "server-only";

import {
  getTelegramBotToken,
  getTelegramChatId,
  getTelegramWebhookSecret,
  getTwilioAccountSid,
  getTwilioAuthToken,
  getTwilioWhatsAppFrom,
  getTwilioWhatsAppTo,
} from "@/lib/env";

type BookingNotificationInput = {
  bookingId: string;
  customerName: string;
  phone?: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupTime: Date | string;
  passengers: number;
  luggage: number;
  fareTotal: number;
  paymentLabel?: string;
};

type TelegramEditableMessageTarget = {
  chatId: number;
  messageId: number;
};

function formatPhoneLine(phone?: string | null) {
  const normalizedPhone = phone?.trim();
  return `Phone: ${normalizedPhone || "Not provided"}`;
}

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
    formatPhoneLine(booking.phone),
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

async function sendTelegramRequest<TBody extends object>(
  method: string,
  body: TBody,
) {
  const botToken = getTelegramBotToken();

  if (!botToken) {
    return null;
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Telegram ${method} failed: ${errorText}`);
  }

  return response.json();
}

export async function sendBookingTelegramNotification(
  booking: BookingNotificationInput,
) {
  if (!isTelegramConfigured()) {
    return;
  }

  const chatId = getTelegramChatId();

  if (!chatId) {
    return;
  }

  const text = [
    "New Buffy Airport Taxi booking confirmed",
    "",
    `Booking: ${booking.bookingId}`,
    `Customer: ${booking.customerName}`,
    formatPhoneLine(booking.phone),
    `Pickup: ${booking.pickupAddress}`,
    `Dropoff: ${booking.dropoffAddress}`,
    `Time: ${new Date(booking.pickupTime).toLocaleString("en-US")}`,
    `Passengers: ${booking.passengers}`,
    `Luggage: ${booking.luggage}`,
    `Fare: $${(booking.fareTotal / 100).toFixed(2)}`,
    `Payment: ${booking.paymentLabel ?? "Card paid"}`,
  ].join("\n");

  await sendTelegramRequest("sendMessage", {
    chat_id: chatId,
    text,
  });
}

export async function sendBookingTelegramLeadNotification(
  booking: BookingNotificationInput,
) {
  if (!isTelegramConfigured()) {
    return;
  }

  const chatId = getTelegramChatId();

  if (!chatId) {
    return;
  }

  const text = [
    "New Buffy Airport Taxi booking started",
    "",
    `Booking: ${booking.bookingId}`,
    `Customer: ${booking.customerName}`,
    formatPhoneLine(booking.phone),
    `Pickup: ${booking.pickupAddress}`,
    `Dropoff: ${booking.dropoffAddress}`,
    `Time: ${new Date(booking.pickupTime).toLocaleString("en-US")}`,
    `Passengers: ${booking.passengers}`,
    `Luggage: ${booking.luggage}`,
    `Estimated Fare: $${(booking.fareTotal / 100).toFixed(2)}`,
    `Payment: ${booking.paymentLabel ?? "Checkout started"}`,
  ].join("\n");

  await sendTelegramRequest("sendMessage", {
    chat_id: chatId,
    text,
  });
}

export async function sendBookingTelegramApprovalRequest(
  booking: BookingNotificationInput,
) {
  if (!isTelegramConfigured()) {
    return;
  }

  const chatId = getTelegramChatId();

  if (!chatId) {
    return;
  }

  const text = [
    "Approval needed for Buffy Airport Taxi",
    "",
    `Booking: ${booking.bookingId}`,
    `Customer: ${booking.customerName}`,
    formatPhoneLine(booking.phone),
    `Pickup: ${booking.pickupAddress}`,
    `Dropoff: ${booking.dropoffAddress}`,
    `Time: ${new Date(booking.pickupTime).toLocaleString("en-US")}`,
    `Passengers: ${booking.passengers}`,
    `Luggage: ${booking.luggage}`,
    `Estimated Fare: $${(booking.fareTotal / 100).toFixed(2)}`,
    `Payment: ${booking.paymentLabel ?? "Awaiting approval"}`,
  ].join("\n");

  await sendTelegramRequest("sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Approve",
            callback_data: `approve:${booking.bookingId}`,
          },
          {
            text: "Reject",
            callback_data: `reject:${booking.bookingId}`,
          },
        ],
      ],
    },
  });
}

export async function answerTelegramCallbackQuery(
  callbackQueryId: string,
  text: string,
) {
  await sendTelegramRequest("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  });
}

export async function updateTelegramApprovalMessage(
  target: TelegramEditableMessageTarget,
  text: string,
) {
  await sendTelegramRequest("editMessageText", {
    chat_id: target.chatId,
    message_id: target.messageId,
    text,
    reply_markup: {
      inline_keyboard: [],
    },
  });
}

export function isTelegramWebhookRequestValid(secretHeader: string | null) {
  const expectedSecret = getTelegramWebhookSecret();

  if (!expectedSecret) {
    return true;
  }

  return secretHeader === expectedSecret;
}
