# airport-taxi

Production-style MVP for scheduling airport taxi bookings with server-side fare calculation, Stripe Checkout or cash bookings, Prisma/PostgreSQL persistence, and a simple admin dashboard.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL
- Stripe Checkout + webhook handling
- Zod validation
- Mapbox Geocoding + Directions for mileage pricing

## Environment Variables

Copy `.env.example` to `.env.local` or `.env` and fill in:

```bash


## Setup

1. Install dependencies:

```bash
npm install
```

2. Generate the Prisma client:

```bash
npx prisma generate
```

3. Create and apply the initial migration:

```bash
npx prisma migrate dev --name init
```

4. Start the Next.js app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Mileage Pricing

The booking form now calculates a distance-based estimate after the rider enters
pickup and dropoff addresses.

- Pricing is `$2.00 per mile` plus a `$10.00` base fee
- The estimate uses Mapbox geocoding and driving directions
- Checkout recalculates the same fare on the server before creating the Stripe session
- Riders can choose either card checkout or a cash booking during submission

## Admin Access

The admin dashboard is now private:

- Visit `http://localhost:3000/admin/login`
- Sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD`
- The app creates a signed admin session cookie using `ADMIN_SESSION_SECRET`

From the admin dashboard you can:

- review bookings and payment state
- add drivers to the roster
- assign bookings to specific drivers

## Optional Live Integrations

### Google Analytics

If you set `NEXT_PUBLIC_GA_MEASUREMENT_ID`, the app will load the Google tag
and track page visits across the site.

### WhatsApp booking alerts

If you set the Twilio WhatsApp environment variables, the app will send a
WhatsApp notification after Stripe confirms a card booking through the webhook
or immediately after a cash booking is created.

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `TWILIO_WHATSAPP_TO`

### Telegram booking alerts

If you set the Telegram environment variables, the app will send a Telegram
message after Stripe confirms a card booking through the webhook or immediately
after a cash booking is created.

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Stripe Local Webhook Forwarding

In a separate terminal, log in to Stripe CLI if needed:

```bash
stripe login
```

Forward local webhook events to the route handler:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Copy the printed webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Local Test Flow

1. Start PostgreSQL and make sure `DATABASE_URL` points to it.
2. Run `npx prisma migrate dev --name init`.
3. Run `npm run dev`.
4. Run `stripe listen --forward-to localhost:3000/api/webhook`.
5. Visit `http://localhost:3000`.
6. Submit the booking form.
7. Complete the payment in Stripe Checkout using a Stripe test card such as `4242 4242 4242 4242`.
8. After the webhook is delivered, visit `http://localhost:3000/admin` and confirm:
   - the booking status is `CONFIRMED`
   - a `PAID` payment record exists for the booking

## Notes

- Fare logic lives in `lib/fare.ts` and uses integer cents.
- Checkout creation happens in `app/api/checkout/route.ts`.
- Webhook verification and booking/payment updates happen in `app/api/webhook/route.ts`.
- The admin page fetches bookings server-side with Prisma in `app/admin/page.tsx`.
