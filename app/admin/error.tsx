"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
      <section className="panel w-full rounded-[2.25rem] border border-[#e9d7c6] p-8 text-center sm:p-12">
        <h1 className="text-3xl font-semibold text-slate-950">
          Admin dashboard unavailable
        </h1>
        <p className="mt-4 text-slate-600">
          We could not load bookings right now. This usually means the database
          is not configured or migrations have not been run yet.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-deep))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:brightness-110"
        >
          Try Again
        </button>
      </section>
    </main>
  );
}
