import { NextResponse } from "next/server";
import { z } from "zod";

import { getFareSettings } from "@/lib/fare-settings";
import { getMileageEstimate } from "@/lib/routing";

export const runtime = "nodejs";

const fareEstimateSchema = z.object({
  pickupAddress: z.string().trim().min(5, "Pickup address is required."),
  dropoffAddress: z.string().trim().min(5, "Dropoff address is required."),
});

export async function GET() {
  try {
    const settings = await getFareSettings();

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Fare settings lookup failed", error);
    return NextResponse.json(
      { error: "Unable to load fare settings right now." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = fareEstimateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter both pickup and dropoff addresses to estimate the fare." },
        { status: 400 },
      );
    }

    const estimate = await getMileageEstimate(
      parsed.data.pickupAddress,
      parsed.data.dropoffAddress,
    );
    const settings = await getFareSettings();

    return NextResponse.json({
      ...estimate,
      ...settings,
    });
  } catch (error) {
    console.error("Fare estimate failed", error);
    return NextResponse.json(
      { error: "Unable to calculate distance-based pricing right now." },
      { status: 500 },
    );
  }
}
