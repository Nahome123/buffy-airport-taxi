import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  addDriver,
  assignDriverToBooking,
  deleteBooking,
  logoutAdmin,
} from "@/app/admin/actions";
import { getAdminDashboardData } from "@/lib/admin-dashboard";
import { formatCurrencyFromCents, formatPickupDate } from "@/lib/format";
import { requireAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dispatch Board",
  robots: {
    index: false,
    follow: false,
  },
};

const buffaloImageUrl =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Niagara_Square%2C_Buffalo%2C_NY_01.jpg";

export default async function AdminPage() {
  await requireAdminSession();

  const { bookings, drivers, schemaReady } = await getAdminDashboardData();
  const todaysTrips = bookings.filter((booking) => {
    const today = new Date();
    return (
      booking.pickupTime.getDate() === today.getDate() &&
      booking.pickupTime.getMonth() === today.getMonth() &&
      booking.pickupTime.getFullYear() === today.getFullYear()
    );
  }).length;
  const awaitingApprovalTrips = bookings.filter(
    (booking) => booking.status === "AWAITING_APPROVAL",
  ).length;
  const unassignedTrips = bookings.filter((booking) => !booking.assignedDriverId).length;

  const paidRevenue = bookings
    .flatMap((booking) => booking.payments)
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const assignedTrips = bookings.filter((booking) => booking.assignedDriverId).length;
  const activeDrivers = drivers.filter((driver) => driver.isActive).length;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 sm:px-10">
      <div className="buffalo-card animate-rise rounded-[2.25rem] border border-white/10 p-8">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.32em] text-[color:var(--color-gold)]">
              Buffalo Dispatch Board
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              Private admin board for bookings and driver dispatch
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200/82">
              Review bookings, confirm who is driving each trip, and keep the
              assignment flow behind a private login.
            </p>
            <nav className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/"
                className="rounded-full border border-white/15 bg-white/6 px-4 py-2 text-sm font-medium text-white transition hover:border-[color:var(--color-gold)] hover:bg-white/8"
              >
                Booking Form
              </Link>
              <Link
                href="/admin/login"
                className="rounded-full border border-[color:var(--color-gold)] bg-white/12 px-4 py-2 text-sm font-medium text-white"
              >
                Admin Access
              </Link>
            </nav>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/15 bg-white/6 px-5 py-2 text-sm font-medium text-white transition hover:border-[color:var(--color-gold)] hover:bg-white/8"
            >
              Back To Booking Form
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="rounded-full border border-white/15 bg-black/20 px-5 py-2 text-sm font-medium text-white transition hover:border-rose-300 hover:bg-rose-500/20"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <StatCard label="Total bookings" value={String(bookings.length)} />
          <StatCard label="Trips today" value={String(todaysTrips)} />
          <StatCard label="Awaiting approval" value={String(awaitingApprovalTrips)} />
          <StatCard label="Unassigned trips" value={String(unassignedTrips)} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <StatCard label="Assigned trips" value={String(assignedTrips)} />
          <StatCard label="Active drivers" value={String(activeDrivers)} />
          <StatCard label="Revenue" value={formatCurrencyFromCents(paidRevenue)} />
        </div>

        {!schemaReady ? (
          <section className="mt-8 rounded-[1.8rem] border border-amber-300/40 bg-amber-100/90 px-5 py-4 text-sm text-amber-950">
            Driver assignment is temporarily unavailable because the latest
            database migration has not been applied yet. The admin page will
            still show bookings, and driver tools will light up after
            `npx prisma migrate dev` succeeds.
          </section>
        ) : null}

        <div className="mt-8 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="panel overflow-hidden rounded-[1.9rem] border border-[#ead8c8]">
            {bookings.length === 0 ? (
              <div className="px-6 py-16 text-center text-slate-500">
                No bookings yet. Submit the booking form to see records here.
              </div>
            ) : (
              <>
                <div className="hidden grid-cols-[1fr_0.85fr_0.8fr_0.75fr_1.1fr_1fr] gap-4 border-b border-[#ead8c8] bg-[#f5ebdf] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-copy-muted)] xl:grid">
                  <span>Customer</span>
                  <span>Pickup Time</span>
                  <span>Status</span>
                  <span>Fare</span>
                  <span>Route</span>
                  <span>Driver</span>
                </div>
                <div className="divide-y divide-[#ead8c8]">
                  {bookings.map((booking) => (
                    <article
                      key={booking.id}
                      className="grid gap-5 px-6 py-6 xl:grid-cols-[1fr_0.85fr_0.8fr_0.75fr_1.1fr_1fr] xl:items-start"
                    >
                      <div>
                        <h2 className="text-base font-semibold text-slate-950">
                          {booking.customerName}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">{booking.email}</p>
                        <p className="mt-1 text-sm text-slate-500">{booking.phone}</p>
                      </div>
                      <div className="text-sm text-slate-700">
                        {formatPickupDate(booking.pickupTime)}
                      </div>
                      <div className="flex flex-col gap-2">
                        <StatusBadge value={booking.status} />
                        <span className="text-xs text-slate-500">
                          Payments:{" "}
                          {booking.payments.length > 0
                            ? booking.payments.map((payment) => payment.status).join(", ")
                            : "none"}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-950">
                        {formatCurrencyFromCents(booking.fareTotal)}
                      </div>
                      <div className="space-y-3 text-sm text-slate-600">
                        <p>
                          <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">
                            Pickup
                          </span>
                          {booking.pickupAddress}
                        </p>
                        <p>
                          <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">
                            Dropoff
                          </span>
                          {booking.dropoffAddress}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="rounded-[1.3rem] border border-[#ead8c8] bg-[#fbf4ec] p-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">
                            Current Driver
                          </p>
                          <p className="mt-2 text-sm font-medium text-slate-900">
                            {booking.assignedDriver?.name ?? "Unassigned"}
                          </p>
                          {booking.assignedAt ? (
                            <p className="mt-1 text-xs text-slate-500">
                              Assigned {formatPickupDate(booking.assignedAt)}
                            </p>
                          ) : null}
                        </div>

                        <form action={assignDriverToBooking} className="space-y-2">
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-copy-muted)]">
                            Assign driver
                            <select
                              name="driverId"
                              defaultValue={booking.assignedDriverId ?? ""}
                              disabled={!schemaReady}
                              className="mt-2 w-full rounded-[1rem] border border-[#ddcbbb] bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--color-accent)]"
                            >
                              <option value="">Unassigned</option>
                              {drivers
                                .filter((driver) => driver.isActive)
                                .map((driver) => (
                                  <option key={driver.id} value={driver.id}>
                                    {driver.name}
                                    {driver.vehicleLabel ? ` - ${driver.vehicleLabel}` : ""}
                                  </option>
                                ))}
                            </select>
                          </label>
                          <button
                            type="submit"
                            disabled={!schemaReady}
                            className="w-full rounded-[1rem] border border-[#d7b89e] bg-[linear-gradient(135deg,#d9875c,#b6461e)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
                          >
                            Save Assignment
                          </button>
                        </form>

                        <form action={deleteBooking}>
                          <input type="hidden" name="bookingId" value={booking.id} />
                          <button
                            type="submit"
                            className="w-full rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            Delete Trip
                          </button>
                        </form>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

          <aside className="space-y-4">
            <section className="panel rounded-[1.9rem] border border-[#ead8c8] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Dispatch Controls
              </p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                Operational snapshot
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.3rem] border border-[#ead8c8] bg-[#fbf4ec] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">
                    Approval queue
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {awaitingApprovalTrips}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Trips still waiting for a Telegram approval or rejection.
                  </p>
                </div>
                <div className="rounded-[1.3rem] border border-[#ead8c8] bg-[#fbf4ec] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">
                    Dispatch gaps
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {unassignedTrips}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Bookings that still need a driver assignment on the board.
                  </p>
                </div>
                <div className="rounded-[1.3rem] border border-[#ead8c8] bg-[#fbf4ec] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent)]">
                    Fare rate control
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="text"
                      value="$1.30"
                      readOnly
                      className="w-full rounded-[1rem] border border-[#ddcbbb] bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none"
                    />
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
                      Placeholder
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Reserved space for a future dispatch fare-rate override.
                    Current booking calculations still use the live app pricing
                    logic, not this admin placeholder yet.
                  </p>
                </div>
              </div>
            </section>

            <section className="panel rounded-[1.9rem] border border-[#ead8c8] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Add Driver
              </p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                Build your dispatch roster
              </h2>
              <form action={addDriver} className="mt-5 space-y-4">
                <label className="block text-sm font-medium text-[var(--color-copy-muted)]">
                  Driver name
                  <input
                    name="name"
                    type="text"
                    required
                    disabled={!schemaReady}
                    className="mt-2 w-full rounded-[1rem] border border-[#ddcbbb] bg-[#fff8ef] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--color-accent)]"
                  />
                </label>
                <label className="block text-sm font-medium text-[var(--color-copy-muted)]">
                  Phone
                  <input
                    name="phone"
                    type="tel"
                    disabled={!schemaReady}
                    className="mt-2 w-full rounded-[1rem] border border-[#ddcbbb] bg-[#fff8ef] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--color-accent)]"
                  />
                </label>
                <label className="block text-sm font-medium text-[var(--color-copy-muted)]">
                  Vehicle
                  <input
                    name="vehicleLabel"
                    type="text"
                    placeholder="Black SUV, Toyota Camry, Van 2"
                    disabled={!schemaReady}
                    className="mt-2 w-full rounded-[1rem] border border-[#ddcbbb] bg-[#fff8ef] px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--color-accent)]"
                  />
                </label>
                <button
                  type="submit"
                  disabled={!schemaReady}
                  className="w-full rounded-[1rem] bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-deep))] px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:brightness-105"
                >
                  Add Driver
                </button>
              </form>
            </section>

            <section className="panel rounded-[1.9rem] border border-[#ead8c8] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Driver Roster
              </p>
              <div className="mt-4 space-y-3">
                {drivers.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No drivers yet. Add your first driver to start dispatching.
                  </p>
                ) : (
                  drivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="rounded-[1.3rem] border border-[#ead8c8] bg-[#fbf4ec] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {driver.name}
                          </p>
                          {driver.vehicleLabel ? (
                            <p className="mt-1 text-sm text-slate-600">
                              {driver.vehicleLabel}
                            </p>
                          ) : null}
                          {driver.phone ? (
                            <p className="mt-1 text-xs text-slate-500">{driver.phone}</p>
                          ) : null}
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--color-copy-muted)]">
                        Assigned trips:{" "}
                        {
                          bookings.filter((booking) => booking.assignedDriverId === driver.id)
                            .length
                        }
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <div className="hover-lift overflow-hidden rounded-[1.9rem] border border-white/10 bg-black/14">
              <Image
                src={buffaloImageUrl}
                alt="Downtown Buffalo at Niagara Square."
                width={2795}
                height={3727}
                className="animate-pan h-full w-full object-cover"
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.8rem] border border-white/10 bg-black/14 p-5">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--color-gold)]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
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
