/** ⑮ メッセージ一覧のスケルトン */
export default function Loading() {
  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <div className="space-y-4 px-6 pb-5 pt-10">
        <div className="h-6 w-32 animate-pulse rounded-full bg-white/[0.08]" />
        <div className="mt-3 h-4 w-56 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
      <div className="space-y-3 px-5 pb-8">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-2xl border border-border/40 p-4"
          >
            <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-white/[0.08]" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-28 animate-pulse rounded-full bg-white/[0.08]" />
              <div className="h-3 w-full animate-pulse rounded-full bg-white/[0.05]" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
