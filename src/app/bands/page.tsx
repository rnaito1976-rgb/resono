import { redirect } from "next/navigation";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { HeaderActionLink } from "@/components/navigation/HeaderActionLink";
import { BandsEmptyState, BandListItem } from "@/components/bands/BandsEmptyState";
import { getBandsForMember, getViewerMemberId } from "@/lib/bands/queries";
import { getBandUnreadSummaryForMember } from "@/lib/bands/unread";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BandsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/bands");
  }

  const memberId = await getViewerMemberId();
  if (!memberId) {
    redirect("/onboarding");
  }

  const bands = await getBandsForMember(memberId);
  const unreadSummary = await getBandUnreadSummaryForMember(memberId);

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppPageHeader
        backHref="/"
        backLabel="ホームに戻る"
        eyebrow="Bands"
        title="Band"
        actions={
          bands.length > 0 ? (
            <HeaderActionLink href="/bands/new">作成</HeaderActionLink>
          ) : null
        }
      />

      {bands.length === 0 ? (
        <BandsEmptyState />
      ) : (
        <div className="space-y-4 px-5 pb-8">
          {bands.map((band) => (
            <BandListItem
              key={band.id}
              band={band}
              unreadCount={unreadSummary.byBandId[band.id] ?? 0}
            />
          ))}
        </div>
      )}
    </main>
  );
}
