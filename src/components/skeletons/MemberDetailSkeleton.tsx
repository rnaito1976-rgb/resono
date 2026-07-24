type MemberDetailSkeletonProps = {
  variant?: "page" | "sheet";
};

/** ⑮ プロフィール表示中のスケルトンUI */
export function MemberDetailSkeleton({ variant = "page" }: MemberDetailSkeletonProps) {
  const heightClass = variant === "sheet" ? "h-[80dvh]" : "h-dvh";

  return (
    <div className={`flex ${heightClass} flex-col bg-background`} aria-hidden>
      <div className="space-y-4 px-6 pb-4 pt-2">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/10" />
        <div className="h-6 w-40 animate-pulse rounded-full bg-white/[0.08]" />
        <div className="flex gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-4 w-16 animate-pulse rounded-full bg-white/[0.06]"
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6">
        <div className="h-72 w-full animate-pulse rounded-3xl bg-white/[0.06]" />
        <div className="mt-8 space-y-3">
          <div className="h-8 w-48 animate-pulse rounded-full bg-white/[0.08]" />
          <div className="h-4 w-full animate-pulse rounded-full bg-white/[0.05]" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/[0.05]" />
        </div>
      </div>

      <div className="px-5 pb-8 pt-4">
        <div className="h-12 w-full animate-pulse rounded-full bg-white/[0.08]" />
      </div>
    </div>
  );
}
