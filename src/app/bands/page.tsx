import { redirect } from "next/navigation";
import Link from "next/link";
import { BandsEmptyState, BandListItem } from "@/components/bands/BandsEmptyState";
import { getBandsForMember, getViewerMemberId } from "@/lib/bands/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BandsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/bands");
  }

  const memberId = await getViewerMemberId();
  if (!memberId) {
    redirect("/onboarding");
  }

  const bands = await getBandsForMember(memberId);

  return (
    <main className="mx-auto min-h-dvh max-w-mobile bg-background">
      <header className="px-5 pb-4 pt-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          Bands
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <h1 className="text-[28px] font-light tracking-tight">Band</h1>
          {bands.length > 0 ? (
            <Link
              href="/bands/new"
              className="rounded-full border border-white/10 px-4 py-2 text-[13px] text-white/75 transition-quiet active:opacity-70"
            >
              作成
            </Link>
          ) : null}
        </div>
      </header>

      {bands.length === 0 ? (
        <BandsEmptyState />
      ) : (
        <div className="space-y-4 px-5 pb-8">
          {bands.map((band) => (
            <BandListItem key={band.id} band={band} />
          ))}
        </div>
      )}
    </main>
  );
}
