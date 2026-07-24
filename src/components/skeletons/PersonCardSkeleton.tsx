export function PersonCardSkeleton() {
  return (
    <article
      aria-hidden
      className="overflow-hidden rounded-[28px] bg-subtle animate-pulse"
    >
      <div className="aspect-square w-full bg-white/[0.06]" />
      <div className="space-y-4 px-6 pb-8 pt-6">
        <div className="h-4 w-24 rounded-full bg-white/[0.08]" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-white/[0.06]" />
          <div className="h-3 w-4/5 rounded-full bg-white/[0.06]" />
        </div>
        <div className="h-12 w-full rounded-full bg-white/[0.08]" />
      </div>
    </article>
  );
}
