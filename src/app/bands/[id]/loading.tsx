/** ⑮ バンド詳細のスケルトン */
export default function Loading() {
  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <div className="space-y-4 px-6 pb-5 pt-10">
        <div className="h-6 w-40 animate-pulse rounded-full bg-white/[0.08]" />
      </div>
      <div className="mx-5 h-40 animate-pulse rounded-[28px] bg-white/[0.06]" />
      <div className="mt-6 space-y-3 px-5">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-2xl bg-white/[0.05]"
          />
        ))}
      </div>
    </main>
  );
}
