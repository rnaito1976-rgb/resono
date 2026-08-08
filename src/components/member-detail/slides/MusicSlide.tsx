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
import { getActivityStyleLabel } from "@/lib/music/activity-style";
import type { Member } from "@/types/member";
import type { MusicPageView } from "@/types/music-profile";

type MusicSlideProps = {
  member: Member;
  isOwnProfile?: boolean;
  musicResonance?: MusicPageView["sectionResonance"];
};

export function MusicSlide({
  member,
  isOwnProfile = false,
  musicResonance,
}: MusicSlideProps) {
  const view = buildMusicPageView(member, {
    showResonance: !isOwnProfile,
    sectionResonance: musicResonance,
  });
  const resonance = view.sectionResonance;
  const activityStyleLabel = getActivityStyleLabel(member.music.activityStyle);

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
        title="Activity Style"
        description="どんなバンド活動をしたいか"
      >
        {activityStyleLabel ? (
          <MusicTagGrid items={[activityStyleLabel]} />
        ) : (
          <MusicEmptyHint>まだ活動スタイルが登録されていません。</MusicEmptyHint>
        )}
      </MusicPageSection>

      {(member.music.playingStyle?.length ?? 0) > 0 ? (
        <MusicPageSection
          title="Playing Style"
          description="どういうふうに演奏する人か"
        >
          <MusicTagGrid items={member.music.playingStyle ?? []} />
        </MusicPageSection>
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
        title="Covered Before"
        description="コピーしたことのある曲"
      >
        {member.music.coveredSongs && member.music.coveredSongs.length > 0 ? (
          <div className="space-y-6">
            {member.music.coveredSongs.map((song) => (
              <CoverSongCard key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <MusicEmptyHint>まだコピーしたことのある曲が登録されていません。</MusicEmptyHint>
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

      {member.music.favoriteSongs && member.music.favoriteSongs.length > 0 ? (
        <MusicPageSection title="Favorite Songs" description="好きな曲">
          <MusicTagGrid items={member.music.favoriteSongs} />
        </MusicPageSection>
      ) : null}

      {member.music.favoriteLiveHouses && member.music.favoriteLiveHouses.length > 0 ? (
        <MusicPageSection title="Favorite Live Houses" description="お気に入りのライブハウス">
          <MusicTagGrid items={member.music.favoriteLiveHouses} />
        </MusicPageSection>
      ) : null}

      {member.music.favoriteStudios && member.music.favoriteStudios.length > 0 ? (
        <MusicPageSection title="Favorite Studios" description="お気に入りのスタジオ">
          <MusicTagGrid items={member.music.favoriteStudios} />
        </MusicPageSection>
      ) : null}

      {member.music.favoriteFestivals && member.music.favoriteFestivals.length > 0 ? (
        <MusicPageSection title="Favorite Festivals" description="お気に入りのフェス">
          <MusicTagGrid items={member.music.favoriteFestivals} />
        </MusicPageSection>
      ) : null}

      {member.music.gear && member.music.gear.length > 0 ? (
        <MusicPageSection title="Gear" description="愛用の機材">
          <MusicTagGrid items={member.music.gear} />
        </MusicPageSection>
      ) : null}

      {member.music.videos && member.music.videos.length > 0 ? (
        <MusicPageSection title="Videos" description="動画">
          <MusicTagGrid items={member.music.videos} />
        </MusicPageSection>
      ) : null}
    </div>
  );
}
