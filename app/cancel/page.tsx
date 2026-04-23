import Link from "next/link";

import { SiteNav } from "@/components/site-nav";

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-8 sm:px-10">
      <SiteNav currentPath="/cancel" accentLabel="Checkout Paused" />
      <section className="panel mx-auto mt-8 w-full max-w-3xl rounded-[2.25rem] border border-[#e9d7c6] p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,#fff4dc,#f1c98e)] text-xs font-bold uppercase tracking-[0.22em] text-amber-800">
          On Hold
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-slate-950">
          Checkout paused before payment
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          No payment was collected. You can go back and resubmit the booking
          when you are ready.
        </p>
        {bookingId ? (
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Pending booking reference:{" "}
            <span className="font-mono">{bookingId}</span>
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-deep))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:brightness-110"
          >
            Return To Booking Form
          </Link>
          <Link
            href="/admin/login"
            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Admin Login
          </Link>
        </div>
      </section>
    </main>
  );
}
