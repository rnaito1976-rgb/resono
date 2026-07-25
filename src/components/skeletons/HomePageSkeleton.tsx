import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";
import { PersonCardSkeleton } from "@/components/skeletons/PersonCardSkeleton";

export function HomePageSkeleton() {
  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <div className="px-5 pb-5 pt-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="h-6 w-28 animate-pulse rounded-full bg-white/[0.08]" />
            <div className="mt-2 h-4 w-52 animate-pulse rounded-full bg-white/[0.06]" />
          </div>
          <div className="h-9 w-20 animate-pulse rounded-full bg-white/[0.06]" />
        </div>
      </div>
      <div className="flex flex-col gap-14 px-5 pb-20 pt-6">
        <PersonCardSkeleton />
        <HomeFeedSkeleton count={3} />
      </div>
    </main>
  );
}
