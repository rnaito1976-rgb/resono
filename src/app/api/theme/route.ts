import { NextResponse } from "next/server";
import { DEFAULT_FREQUENCY_COLOR } from "@/lib/frequency-color/palette";
import { getFrequencyColorByUserId } from "@/lib/frequency-color/server";
import { getAuthSession } from "@/lib/supabase/auth";

export async function GET() {
  const user = await getAuthSession();

  if (!user) {
    return NextResponse.json({ color: DEFAULT_FREQUENCY_COLOR });
  }

  const color = await getFrequencyColorByUserId(user.id);

  return NextResponse.json({
    color: color ?? DEFAULT_FREQUENCY_COLOR,
  });
}
