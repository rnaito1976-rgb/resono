import Link from "next/link";
import type { Band } from "@/types/band";

type BandsEmptyStateProps = {
  showCreate?: boolean;
};

export function BandsEmptyState({ showCreate = true }: BandsEmptyStateProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 text-center">
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
  unreadCount?: number;
};

export function BandListItem({ band, unreadCount = 0 }: BandListItemProps) {
  return (
    <Link
      href={`/bands/${band.id}`}
      className="relative block rounded-[28px] border border-border bg-subtle px-6 py-5 transition-quiet active:opacity-85"
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Band</p>
      <h3 className="mt-2 text-[22px] font-light tracking-tight">{band.name}</h3>
      <p className="mt-2 text-[13px] text-white/45">
        {new Date(band.createdAt).toLocaleDateString("ja-JP")} 結成
      </p>
      {unreadCount > 0 ? (
        <span className="absolute right-5 top-5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
