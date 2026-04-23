import { NextResponse } from "next/server";
import { z } from "zod";

import { getAddressSuggestions } from "@/lib/routing";

export const runtime = "nodejs";

const suggestionsSchema = z.object({
  query: z.string().trim().min(3, "Enter at least 3 characters."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = suggestionsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await getAddressSuggestions(parsed.data.query);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Address suggestion lookup failed", error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
