import { Suspense } from "react";
import { AppTopBar } from "@/components/navigation/AppTopBar";
import { HeaderActionLink } from "@/components/navigation/HeaderActionLink";
import {
  ScrollPageIntro,
  StickyPageTitle,
  StickyScrollPage,
} from "@/components/navigation/StickyScrollPage";
import { BandsEmptyState } from "@/components/bands/BandsEmptyState";
import { BandsList } from "@/components/bands/BandsList";
import { getBandsForMember } from "@/lib/bands/queries";
import { requireViewer } from "@/lib/navigation/require-viewer";

function BandsListSkeleton() {
  return (
    <div className="space-y-4 px-5 pb-8">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-[24px] bg-white/[0.06]"
        />
      ))}
    </div>
  );
}

async function BandsContent() {
  const { memberId } = await requireViewer({ loginNext: "/bands" });
  const bands = await getBandsForMember(memberId);

  if (bands.length === 0) {
    return <BandsEmptyState />;
  }

  return <BandsList bands={bands} />;
}

export function BandsPageContent() {
  return (
    <StickyScrollPage
      sticky={
        <>
          <div className="px-5 pt-6">
            <AppTopBar
              backHref="/"
              backLabel="ホームに戻る"
              trailing={<HeaderActionLink href="/bands/new">作成</HeaderActionLink>}
            />
          </div>
          <StickyPageTitle eyebrow="Bands" title="Band" />
        </>
      }
    >
      <ScrollPageIntro>共鳴から生まれたバンドたち。</ScrollPageIntro>
      <Suspense fallback={<BandsListSkeleton />}>
        <BandsContent />
      </Suspense>
    </StickyScrollPage>
  );
}
