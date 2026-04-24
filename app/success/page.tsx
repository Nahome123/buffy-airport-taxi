import type { Metadata } from "next";
import Link from "next/link";

import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Booking Confirmed",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string; paymentMethod?: string }>;
}) {
  const { bookingId, paymentMethod } = await searchParams;
  const isCashBooking = paymentMethod === "cash";

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-8 sm:px-10">
      <SiteNav
        currentPath="/success"
        accentLabel={isCashBooking ? "Booking Confirmed" : "Payment Complete"}
      />
      <section className="panel mx-auto mt-8 w-full max-w-3xl rounded-[2.25rem] border border-[#e9d7c6] p-8 text-center sm:p-12">
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-sm font-bold uppercase tracking-[0.2em] ${
            isCashBooking
              ? "bg-[linear-gradient(180deg,#fff6dc,#f5d996)] text-amber-800"
              : "bg-[linear-gradient(180deg,#eff9ef,#c9e9d3)] text-emerald-700"
          }`}
        >
          {isCashBooking ? "Cash" : "Paid"}
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-slate-950">
          {isCashBooking
            ? "Cash ride booked, Buffalo trip secured"
            : "Payment received, Buffalo ride secured"}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {isCashBooking
            ? "Your airport transfer request has been confirmed with cash selected for payment. The trip is already visible in the admin dashboard so it can be dispatched right away."
            : "Your airport transfer request has been received. Once the Stripe webhook is delivered, the booking will be marked as confirmed in the admin dashboard."}
        </p>
        {bookingId ? (
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Booking reference: <span className="font-mono">{bookingId}</span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-deep))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:brightness-110"
          >
            Book Another Ride
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View Dispatch Board
          </Link>
        </div>
      </section>
    </main>
  );
}
