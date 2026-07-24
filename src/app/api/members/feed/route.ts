import { NextResponse } from "next/server";
import { getMemberByUserId } from "@/lib/members";
import { buildMembersFeedPage } from "@/lib/members/feed-builder";
import { FEED_PAGE_SIZE } from "@/lib/members/feed";
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

  const payload = await buildMembersFeedPage(offset, limit, {
    viewer,
    userId: user?.id,
  });

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
    },
  });
}
