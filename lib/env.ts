function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000"
  );
}

export function getStripeSecretKey() {
  return getRequiredEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret() {
  return getRequiredEnv("STRIPE_WEBHOOK_SECRET");
}

export function getAdminUsername() {
  return getRequiredEnv("ADMIN_USERNAME");
}

export function getAdminPassword() {
  return getRequiredEnv("ADMIN_PASSWORD");
}

export function getAdminSessionSecret() {
  return getRequiredEnv("ADMIN_SESSION_SECRET");
}

export function getGoogleAnalyticsMeasurementId() {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || null;
}

export function getTwilioAccountSid() {
  return process.env.TWILIO_ACCOUNT_SID?.trim() || null;
}

export function getTwilioAuthToken() {
  return process.env.TWILIO_AUTH_TOKEN?.trim() || null;
}

export function getTwilioWhatsAppFrom() {
  return process.env.TWILIO_WHATSAPP_FROM?.trim() || null;
}

export function getTwilioWhatsAppTo() {
  return process.env.TWILIO_WHATSAPP_TO?.trim() || null;
}

export function getTelegramBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN?.trim() || null;
}

export function getTelegramChatId() {
  return process.env.TELEGRAM_CHAT_ID?.trim() || null;
}

export function getMapboxAccessToken() {
  return process.env.MAPBOX_ACCESS_TOKEN?.trim() || null;
}
