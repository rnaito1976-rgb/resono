import { InstrumentsEditor } from "@/components/member-detail/InstrumentsEditor";
import type { Member } from "@/types/member";
import { SectionBlock, TagList } from "@/components/ui";

type MusicSlideProps = {
  member: Member;
  isOwnProfile?: boolean;
};

export function MusicSlide({ member, isOwnProfile = false }: MusicSlideProps) {
  return (
    <div className="flex h-full flex-col space-y-8 px-6 pb-8 pt-4">
      <SectionBlock label="Instruments">
        {isOwnProfile ? (
          <InstrumentsEditor initialInstruments={member.music.instruments} />
        ) : (
          <TagList items={member.music.instruments} />
        )}
      </SectionBlock>
      <SectionBlock label="Genres">
        <TagList items={member.music.genres} variant="primary" />
      </SectionBlock>
      <SectionBlock label="Favorite">
        <TagList items={member.music.favoriteArtists} />
      </SectionBlock>
    </div>
  );
}
