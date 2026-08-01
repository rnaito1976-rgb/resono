import { notFound, redirect } from "next/navigation";
import { BandPageClient } from "@/components/bands/BandPageClientLoader";
import { getBandDetail } from "@/lib/bands/queries";
import { getMemberByUserId } from "@/lib/members";
import {
  collectMemberCoverSongEntries,
  filterNewCoverSongEntries,
} from "@/lib/music/band-cover-songs";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type BandPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BandPage({ params }: BandPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/bands/${id}`);
  }

  const member = await getMemberByUserId(user.id);
  if (!member) {
    redirect("/onboarding");
  }

  const detail = await getBandDetail(id, member.id);
  if (!detail) {
    notFound();
  }

  const profileCoverSongs = filterNewCoverSongEntries(
    collectMemberCoverSongEntries(member),
    detail.coverSongs.map((song) => ({ artist: song.artist, title: song.title }))
  );

  return <BandPageClient detail={detail} profileCoverSongs={profileCoverSongs} />;
}
