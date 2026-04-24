import type { Metadata } from "next";
import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { formatCurrencyFromCents, formatPickupDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Find Your Booking",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BookingLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;
  const normalizedReference = reference?.trim() ?? "";

  const booking = normalizedReference
    ? await prisma.booking.findUnique({
        where: { id: normalizedReference },
        select: {
          id: true,
          customerName: true,
          pickupAddress: true,
          dropoffAddress: true,
          pickupTime: true,
          fareTotal: true,
          status: true,
          paymentMethod: true,
          assignedDriver: {
            select: {
              name: true,
              vehicleLabel: true,
            },
          },
          payments: {
            select: {
              status: true,
            },
          },
        },
      })
    : null;

  const searchedButMissing = normalizedReference.length > 0 && !booking;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-8 sm:px-10">
      <SiteNav currentPath="/lookup" accentLabel="Booking Lookup" />

      <section className="panel mx-auto mt-8 w-full max-w-4xl rounded-[2.25rem] border border-[#e9d7c6] p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Rider Self-Service
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Find your trip with the booking reference code
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Paste the reference code from your confirmation or approval screen to
          check the booking status, route summary, and dispatch progress later.
        </p>

        <form className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            name="reference"
            defaultValue={normalizedReference}
            placeholder="Enter booking reference"
            className="w-full rounded-[1.4rem] border border-[#ddcbbb] bg-[#fff8ef] px-5 py-4 text-sm text-slate-900 outline-none focus:border-[var(--color-accent)]"
          />
          <button
            type="submit"
            className="rounded-[1.4rem] bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-deep))] px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:brightness-105"
          >
            Find Booking
          </button>
        </form>

        {searchedButMissing ? (
          <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            We could not find a booking with that reference. Double-check the
            code and try again.
          </div>
        ) : null}

        {booking ? (
          <section className="mt-8 rounded-[2rem] border border-[#ead8c8] bg-[#fbf4ec] p-6">
            <div className="flex flex-col gap-4 border-b border-[#ead8c8] pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">
                  Booking Found
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  {booking.customerName}
                </h2>
              </div>
              <div className="rounded-[1.3rem] border border-[#ddcbbb] bg-white px-4 py-3 text-sm text-slate-600">
                Reference: <span className="font-mono text-slate-900">{booking.id}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <LookupCard label="Status">
                <StatusBadge value={booking.status} />
              </LookupCard>
              <LookupCard label="Payment">
                <p className="text-sm font-semibold text-slate-950">
                  {booking.paymentMethod === "CASH" ? "Cash" : "Card"}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {booking.payments.length > 0
                    ? `Payment record: ${booking.payments
                        .map((payment) => payment.status.replaceAll("_", " "))
                        .join(", ")}`
                    : booking.paymentMethod === "CASH"
                      ? "Payment is due later for cash bookings."
                      : "Waiting for payment progress."}
                </p>
              </LookupCard>
              <LookupCard label="Pickup time">
                <p className="text-sm font-semibold text-slate-950">
                  {formatPickupDate(booking.pickupTime)}
                </p>
              </LookupCard>
              <LookupCard label="Estimated fare">
                <p className="text-sm font-semibold text-slate-950">
                  {formatCurrencyFromCents(booking.fareTotal)}
                </p>
              </LookupCard>
              <LookupCard label="Pickup address">
                <p className="text-sm leading-6 text-slate-700">{booking.pickupAddress}</p>
              </LookupCard>
              <LookupCard label="Dropoff address">
                <p className="text-sm leading-6 text-slate-700">{booking.dropoffAddress}</p>
              </LookupCard>
              <LookupCard label="Assigned driver">
                <p className="text-sm font-semibold text-slate-950">
                  {booking.assignedDriver?.name ?? "Dispatch still assigning a driver"}
                </p>
                {booking.assignedDriver?.vehicleLabel ? (
                  <p className="mt-2 text-sm text-slate-600">
                    Vehicle: {booking.assignedDriver.vehicleLabel}
                  </p>
                ) : null}
              </LookupCard>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-deep))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:brightness-105"
              >
                Book Another Ride
              </Link>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function LookupCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.4rem] border border-[#ead8c8] bg-white/80 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-accent)]">
        {label}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    AWAITING_APPROVAL: "bg-sky-100 text-sky-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    PENDING_PAYMENT: "bg-amber-100 text-amber-700",
    CANCELLED: "bg-rose-100 text-rose-700",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${styles[value] ?? "bg-slate-100 text-slate-700"}`}
    >
      {value.replaceAll("_", " ")}
    </span>
  );
}
