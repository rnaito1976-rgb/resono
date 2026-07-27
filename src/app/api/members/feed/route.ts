import { NextResponse } from "next/server";
import { buildMembersFeedPage } from "@/lib/members/feed-builder";
import { FEED_PAGE_SIZE } from "@/lib/members/feed";
import { getViewerContext } from "@/lib/members/viewer-context";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0));
  const limit = Math.min(
    Math.max(1, Number(searchParams.get("limit") ?? FEED_PAGE_SIZE)),
    FEED_PAGE_SIZE
  );
  const fast = searchParams.get("fast") === "1";

  const { user, member: viewer } = await getViewerContext();

  const payload = await buildMembersFeedPage(offset, limit, {
    viewer,
    userId: user?.id,
    fast,
  });

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "private, max-age=30, stale-while-revalidate=90",
    },
  });
}
