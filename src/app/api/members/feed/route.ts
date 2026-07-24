import { NextResponse } from "next/server";
import { getMemberByUserId, getMembersPage } from "@/lib/members";
import { FEED_PAGE_SIZE, type MembersFeedPage } from "@/lib/members/feed";
import { isMemberOwnedByUser } from "@/lib/members/ownership";
import { rankRecommendations } from "@/lib/recommendation/scoring";
import { buildResonanceReason } from "@/lib/resonance/matching";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0));
  const limit = Math.min(
    Math.max(1, Number(searchParams.get("limit") ?? FEED_PAGE_SIZE)),
    FEED_PAGE_SIZE
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const viewer = user ? await getMemberByUserId(user.id) : undefined;

  const page = await getMembersPage(offset, limit);
  const feedMembers = page.members.filter((member) => {
    if (viewer && member.id === viewer.id) {
      return false;
    }

    if (user && isMemberOwnedByUser(member, user.id)) {
      return false;
    }

    return true;
  });

  const items = viewer
    ? rankRecommendations(viewer, feedMembers).map(({ member, recommendation }) => ({
        member,
        recommendation,
        reason: buildResonanceReason(viewer, member),
      }))
    : feedMembers.map((member) => ({
        member,
        recommendation: undefined,
        reason: undefined,
      }));

  const payload: MembersFeedPage = {
    items,
    nextOffset: page.hasMore ? offset + limit : null,
    hasMore: page.hasMore,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
    },
  });
}
