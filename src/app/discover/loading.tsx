import { FrequencySpinner } from "@/components/frequency-color/FrequencySpinner";

export default function DiscoverLoading() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-mobile flex-col bg-black px-5 pb-8 pt-6">
      <div className="mb-4 mt-4 space-y-3">
        <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-8 w-56 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-full max-w-xs animate-pulse rounded-full bg-white/[0.06]" />
      </div>

      <div className="flex flex-1 flex-col justify-center items-center gap-3">
        <FrequencySpinner size={24} />
        <p className="text-[14px] text-white/45">読み込んでいます...</p>
      </div>
    </div>
  );
}
