import { notFound } from "next/navigation";
import { BandPageClient } from "@/components/bands/BandPageClientLoader";
import { getBandDetail } from "@/lib/bands/queries";
import { getMemberById } from "@/lib/members";
import {
  collectMemberCoverSongEntries,
  filterNewCoverSongEntries,
} from "@/lib/music/band-cover-songs";
import { requireViewer } from "@/lib/navigation/require-viewer";

type BandPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BandPage({ params }: BandPageProps) {
  const { id } = await params;
  const { memberId } = await requireViewer({ loginNext: `/bands/${id}` });

  const [member, detail] = await Promise.all([
    getMemberById(memberId),
    getBandDetail(id, memberId),
  ]);

  if (!member || !detail) {
    notFound();
  }

  const profileCoverSongs = filterNewCoverSongEntries(
    collectMemberCoverSongEntries(member),
    detail.coverSongs.map((song) => ({ artist: song.artist, title: song.title }))
  );

  return <BandPageClient detail={detail} profileCoverSongs={profileCoverSongs} />;
}
