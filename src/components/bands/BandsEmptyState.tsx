import Link from "next/link";
import type { Band } from "@/types/band";

type BandsEmptyStateProps = {
  showCreate?: boolean;
};

export function BandsEmptyState({ showCreate = true }: BandsEmptyStateProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 text-center">
      <div className="mb-10 flex h-40 w-40 items-center justify-center rounded-[32px] border border-border bg-white/[0.03]">
        <div className="relative h-24 w-24">
          <span className="absolute left-3 top-4 h-10 w-10 rounded-full bg-primary/20" />
          <span className="absolute right-2 top-8 h-8 w-8 rounded-full bg-white/10" />
          <span className="absolute bottom-3 left-8 h-12 w-12 rounded-[18px] border border-border bg-subtle" />
        </div>
      </div>

      <h2 className="text-[28px] font-light tracking-tight text-foreground">
        まだBandはありません
      </h2>
      <p className="mt-4 max-w-[24ch] text-[15px] leading-relaxed text-white/45">
        共鳴した仲間とBandを作ると、
        <br />
        ここに活動の記録が残ります。
      </p>

      {showCreate ? (
        <Link
          href="/bands/new"
          className="mt-10 flex h-12 min-w-[180px] items-center justify-center rounded-full bg-primary px-8 text-[15px] font-medium text-primary-foreground transition-quiet active:opacity-85"
        >
          Bandを作成
        </Link>
      ) : null}
    </div>
  );
}

type BandListItemProps = {
  band: Band;
};

export function BandListItem({ band }: BandListItemProps) {
  return (
    <Link
      href={`/bands/${band.id}`}
      className="block rounded-[28px] border border-border bg-subtle px-6 py-5 transition-quiet active:opacity-85"
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Band</p>
      <h3 className="mt-2 text-[22px] font-light tracking-tight">{band.name}</h3>
      <p className="mt-2 text-[13px] text-white/45">
        {new Date(band.createdAt).toLocaleDateString("ja-JP")} 結成
      </p>
    </Link>
  );
}
