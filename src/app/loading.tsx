import { HomeFeedSkeleton } from "@/components/skeletons/HomeFeedSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <div className="px-6 pb-5 pt-10">
        <div className="h-6 w-32 animate-pulse rounded-full bg-white/[0.08]" />
        <div className="mt-3 h-4 w-56 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
      <HomeFeedSkeleton count={2} />
    </main>
  );
}
