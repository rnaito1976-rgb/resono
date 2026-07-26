/** ⑮ バンド一覧のスケルトン */
export default function Loading() {
  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <div className="space-y-4 px-6 pb-5 pt-10">
        <div className="h-6 w-24 animate-pulse rounded-full bg-white/[0.08]" />
        <div className="mt-3 h-8 w-32 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
      <div className="space-y-4 px-5 pb-8">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-[24px] bg-white/[0.06]"
          />
        ))}
      </div>
    </main>
  );
}
