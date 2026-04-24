import "server-only";

import { prisma } from "@/lib/prisma";

const DEFAULT_BASE_FARE_CENTS = 500;
const DEFAULT_FARE_RATE_PER_MILE_CENTS = 130;
const DISPATCH_SETTINGS_ID = "default";

export async function hasDispatchSettingsTable() {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'DispatchSettings'
    ) AS "exists"
  `;

  return rows[0]?.exists ?? false;
}

export async function getFareSettings() {
  const tableExists = await hasDispatchSettingsTable();

  if (!tableExists) {
    return {
      baseFareCents: DEFAULT_BASE_FARE_CENTS,
      fareRatePerMileCents: DEFAULT_FARE_RATE_PER_MILE_CENTS,
    };
  }

  const settings = await prisma.dispatchSettings.upsert({
    where: { id: DISPATCH_SETTINGS_ID },
    update: {},
    create: {
      id: DISPATCH_SETTINGS_ID,
      fareRatePerMileCents: DEFAULT_FARE_RATE_PER_MILE_CENTS,
    },
  });

  return {
    baseFareCents: DEFAULT_BASE_FARE_CENTS,
    fareRatePerMileCents: settings.fareRatePerMileCents,
  };
}

export function formatFareRateLabel(fareRatePerMileCents: number) {
  return `$${(fareRatePerMileCents / 100).toFixed(2)}`;
}
