import { CoverSongCard } from "@/components/member-detail/music/CoverSongCard";
import { MusicDnaChart } from "@/components/member-detail/music/MusicDnaChart";
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
      {resonance ? (
        <MusicResonanceSummary
          points={[
            ...resonance.favoriteArtists,
            ...resonance.coverSongs,
            ...resonance.playingStyle,
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
        description="コピーしたい曲"
        resonancePoints={resonance?.coverSongs}
      >
        {view.coverSongs.length > 0 ? (
          <div className="space-y-3">
            {view.coverSongs.map((song) => (
              <CoverSongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <MusicEmptyHint>今コピーしたい曲がまだ登録されていません。</MusicEmptyHint>
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
        title="Playing Style"
        description="演奏スタイル"
        resonancePoints={resonance?.playingStyle}
      >
        {view.playingStyle.length > 0 ? (
          <MusicTagGrid items={view.playingStyle} />
        ) : (
          <MusicEmptyHint>まだ演奏スタイルが登録されていません。</MusicEmptyHint>
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
