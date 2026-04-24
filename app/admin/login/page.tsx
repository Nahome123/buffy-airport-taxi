import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin-login-form";
import { SiteNav } from "@/components/site-nav";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10 sm:px-10">
      <div className="w-full">
        <SiteNav currentPath="/admin/login" accentLabel="Private Admin Access" />
        <div className="mt-8 grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="buffalo-card rounded-[2.5rem] border border-white/10 p-8 sm:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-[color:var(--color-gold)]">
            Private Dispatch Access
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold text-white">
            Keep the admin board private and route trips from one place
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200/82">
            This login gate protects the operations dashboard so only the admin
            can review paid bookings, add drivers, and assign rides across the
            schedule.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.6rem] border border-white/10 bg-black/14 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-gold)]">
                Included
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-100">
                Cookie-based admin session and guarded dashboard access.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-white/10 bg-black/14 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-gold)]">
                Dispatch
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-100">
                Driver roster creation plus per-booking assignment from the same
                screen.
              </p>
            </div>
          </div>
        </section>

        <section className="panel rounded-[2.2rem] border border-[#e6d5c1] p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
            Admin Login
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--color-copy)]">
            Sign in to the dispatch board
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-copy-muted)]">
            Use the admin credentials from your environment variables.
          </p>
          <div className="mt-8">
            <AdminLoginForm />
          </div>
        </section>
        </div>
      </div>
    </main>
  );
}
