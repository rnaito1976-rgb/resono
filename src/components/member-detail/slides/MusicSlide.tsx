import { CoverSongCard } from "@/components/member-detail/music/CoverSongCard";
import { MusicDnaChart } from "@/components/member-detail/music/MusicDnaChart";
import { ProfileTabHeading } from "@/components/member-detail/ProfileTabHeading";
import {
  MusicEmptyHint,
  MusicPageSection,
  MusicResonanceSummary,
} from "@/components/member-detail/music/MusicPageSection";
import { MusicTagGrid } from "@/components/member-detail/music/MusicTagGrid";
import { buildMusicPageView } from "@/lib/music/profile-display";
import type { Member } from "@/types/member";

type MusicSlideProps = {
  member: Member;
  isOwnProfile?: boolean;
};

export function MusicSlide({ member, isOwnProfile = false }: MusicSlideProps) {
  const view = buildMusicPageView(member, { showResonance: !isOwnProfile });
  const resonance = view.sectionResonance;

  return (
    <div className="flex h-full flex-col space-y-10 px-6 pb-10 pt-4">
      {isOwnProfile ? (
        <ProfileTabHeading
          eyebrow="Music"
          title="Music"
          description="好きなアーティストや音楽の傾向。"
        />
      ) : null}

      {resonance ? (
        <MusicResonanceSummary
          points={[
            ...resonance.favoriteArtists,
            ...resonance.coverSongs,
            ...resonance.favoriteGenres,
          ]}
        />
      ) : null}

      <MusicPageSection
        title="Favorite Artists"
        description="好きなアーティスト"
        resonancePoints={resonance?.favoriteArtists}
      >
        {view.favoriteArtists.length > 0 ? (
          <MusicTagGrid items={view.favoriteArtists} />
        ) : (
          <MusicEmptyHint>まだ好きなアーティストが登録されていません。</MusicEmptyHint>
        )}
      </MusicPageSection>

      <MusicPageSection
        title="Want to Cover"
        description="コピーしてみたい曲"
        resonancePoints={resonance?.coverSongs}
      >
        {view.coverSongs.length > 0 ? (
          <div className="space-y-6">
            {view.coverSongs.map((song) => (
              <CoverSongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <MusicEmptyHint>まだコピーしてみたい曲が登録されていません。</MusicEmptyHint>
        )}
      </MusicPageSection>

      <MusicPageSection
        title="Dream Bands"
        description="コピーしたいバンド"
        resonancePoints={resonance?.dreamBands}
      >
        {view.dreamBands.length > 0 ? (
          <MusicTagGrid items={view.dreamBands} />
        ) : (
          <MusicEmptyHint>まだDream Bandsが登録されていません。</MusicEmptyHint>
        )}
      </MusicPageSection>

      <MusicPageSection
        title="Favorite Genres"
        description="好きなジャンル"
        resonancePoints={resonance?.favoriteGenres}
      >
        {view.favoriteGenres.length > 0 ? (
          <MusicTagGrid items={view.favoriteGenres} />
        ) : (
          <MusicEmptyHint>まだ好きなジャンルが登録されていません。</MusicEmptyHint>
        )}
      </MusicPageSection>

      <MusicPageSection
        title="Music DNA"
        resonancePoints={resonance?.musicDna}
      >
        <MusicDnaChart bars={view.musicDna} />
      </MusicPageSection>
    </div>
  );
}
