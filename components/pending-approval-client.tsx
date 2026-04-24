"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

type PendingApprovalClientProps = {
  bookingId: string;
};

type BookingStatusResponse = {
  id: string;
  status: "AWAITING_APPROVAL" | "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED";
  paymentMethod: "CARD" | "CASH";
  fareTotal: number;
  customerName: string;
};

export function PendingApprovalClient({
  bookingId,
}: PendingApprovalClientProps) {
  const [booking, setBooking] = useState<BookingStatusResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    async function refreshBooking() {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          cache: "no-store",
        });
        const result = (await response.json()) as
          | BookingStatusResponse
          | { error: string };

        if (!response.ok || !("status" in result)) {
          if (!cancelled) {
            setErrorMessage(
              "We could not refresh your booking status right now. Please try again in a moment.",
            );
          }
          return;
        }

        if (!cancelled) {
          setBooking(result);
          setErrorMessage(null);
        }
      } catch {
        if (!cancelled) {
          setErrorMessage(
            "We could not refresh your booking status right now. Please try again in a moment.",
          );
        }
      }
    }

    void refreshBooking();
    const interval = window.setInterval(() => {
      void refreshBooking();
    }, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [bookingId]);

  function continueToCheckout() {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}/checkout`, {
          method: "POST",
        });
        const result = (await response.json()) as
          | { url: string }
          | { error: string };

        if (!response.ok || !("url" in result)) {
          setErrorMessage(
            "Checkout is not ready yet. Wait for approval or refresh this page.",
          );
          return;
        }

        window.location.assign(result.url);
      } catch {
        setErrorMessage(
          "We could not continue to checkout right now. Please try again in a moment.",
        );
      }
    });
  }

  const status = booking?.status ?? "AWAITING_APPROVAL";
  const paymentMethod = booking?.paymentMethod ?? "CARD";

  return (
    <section className="panel mx-auto mt-8 w-full max-w-3xl rounded-[2.25rem] border border-[#e9d7c6] p-8 text-center sm:p-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,#fff4dc,#f1c98e)] text-xs font-bold uppercase tracking-[0.22em] text-amber-800">
        {status === "AWAITING_APPROVAL"
          ? "Waiting"
          : status === "PENDING_PAYMENT"
            ? "Approved"
            : status === "CONFIRMED"
              ? "Confirmed"
              : "Closed"}
      </div>

      {status === "AWAITING_APPROVAL" ? (
        <>
          <h1 className="mt-6 text-3xl font-semibold text-slate-950">
            Waiting for dispatcher approval
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            We sent your trip request to the dispatcher on Telegram. Once it is
            approved, this page will unlock the next step automatically.
          </p>
        </>
      ) : null}

      {status === "PENDING_PAYMENT" && paymentMethod === "CARD" ? (
        <>
          <h1 className="mt-6 text-3xl font-semibold text-slate-950">
            Approved and ready for checkout
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Your trip was approved. Continue to Stripe checkout when you are
            ready to pay.
          </p>
        </>
      ) : null}

      {status === "CONFIRMED" && paymentMethod === "CASH" ? (
        <>
          <h1 className="mt-6 text-3xl font-semibold text-slate-950">
            Cash trip approved and confirmed
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Your cash booking was approved by dispatch and the ride is now
            confirmed.
          </p>
        </>
      ) : null}

      {status === "CANCELLED" ? (
        <>
          <h1 className="mt-6 text-3xl font-semibold text-slate-950">
            This request was not approved
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            The dispatcher rejected this booking request. You can return to the
            booking form and submit a new trip if needed.
          </p>
        </>
      ) : null}

      <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Booking reference: <span className="font-mono">{bookingId}</span>
      </p>

      {errorMessage ? (
        <div className="mt-4 rounded-[1.35rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {status === "PENDING_PAYMENT" && paymentMethod === "CARD" ? (
          <button
            type="button"
            onClick={continueToCheckout}
            disabled={isPending}
            className="rounded-full bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-deep))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:brightness-75"
          >
            {isPending ? "Opening checkout..." : "Continue To Secure Checkout"}
          </button>
        ) : null}
        <Link
          href="/"
          className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Return To Booking Form
        </Link>
      </div>
    </section>
  );
}
