import { NextResponse } from "next/server";
import type { HomeBootstrapPayload } from "@/lib/home/bootstrap";
import { DEFAULT_FREQUENCY_COLOR } from "@/lib/frequency-color/palette";
import { getFrequencyColorByUserId } from "@/lib/frequency-color/server";
import { getMemberByUserId } from "@/lib/members";
import { buildMembersFeedPage } from "@/lib/members/feed-builder";
import { INITIAL_FEED_PAGE_SIZE } from "@/lib/members/feed";
import { getMemberOnboardingState } from "@/lib/members/onboarding-state";
import { getAuthSession } from "@/lib/supabase/auth";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";

export async function GET() {
  const user = await getAuthSession();

  if (!user) {
    const feed = await buildMembersFeedPage(0, INITIAL_FEED_PAGE_SIZE, { fast: true });

    return NextResponse.json({
      user: null,
      member: null,
      feed,
      frequencyColor: DEFAULT_FREQUENCY_COLOR,
      redirect: null,
    } satisfies HomeBootstrapPayload);
  }

  const member = await getMemberByUserId(user.id, { columns: "list" });
  const [onboarding, feed, frequencyColor] = await Promise.all([
    getMemberOnboardingState(user.id),
    buildMembersFeedPage(0, INITIAL_FEED_PAGE_SIZE, {
      viewer: member,
      userId: user.id,
      fast: true,
    }),
    getFrequencyColorByUserId(user.id),
  ]);

  const redirect = member && !onboarding.complete ? "/onboarding" : null;

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    member: member ?? null,
    feed,
    frequencyColor:
      (member?.frequencyColor as FrequencyColorHex | undefined) ??
      frequencyColor ??
      DEFAULT_FREQUENCY_COLOR,
    redirect,
  } satisfies HomeBootstrapPayload);
}
