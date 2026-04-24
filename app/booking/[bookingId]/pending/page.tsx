import type { Metadata } from "next";

import { PendingApprovalClient } from "@/components/pending-approval-client";
import { SiteNav } from "@/components/site-nav";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Awaiting Approval",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PendingBookingPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-8 sm:px-10">
      <SiteNav currentPath="/booking" accentLabel="Approval In Progress" />
      <PendingApprovalClient bookingId={bookingId} />
    </main>
  );
}
