import { Suspense } from "react";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { HeaderActionLink } from "@/components/navigation/HeaderActionLink";
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
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <AppPageHeader
        backHref="/"
        backLabel="ホームに戻る"
        eyebrow="Bands"
        title="Band"
        subtitle="共鳴から生まれたバンドたち。"
        actions={<HeaderActionLink href="/bands/new">作成</HeaderActionLink>}
      />
      <Suspense fallback={<BandsListSkeleton />}>
        <BandsContent />
      </Suspense>
    </main>
  );
}
