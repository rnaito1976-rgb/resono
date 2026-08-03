import Image from "next/image";
import Link from "next/link";
import { ProfilePhotoRing } from "@/components/frequency-color/ProfilePhotoRing";
import { BandActivityFeed } from "@/components/member-detail/BandActivityFeed";
import { ProfileTabHeading } from "@/components/member-detail/ProfileTabHeading";
import { BandListItem } from "@/components/bands/BandsEmptyState";
import {
  getProfilePhotoSrc,
} from "@/lib/images/profilePhoto";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import type { Band, BandActivityFeedItem, MutualResonateMember } from "@/types/band";
import type { Member } from "@/types/member";
import { SectionBlock } from "@/components/ui";
import { RecruitmentPartsList } from "@/components/recruitment/RecruitmentPartsList";

type LookingForSlideProps = {
  member: Member;
  isOwnProfile?: boolean;
  mutualMembers?: MutualResonateMember[];
  memberBands?: Band[];
  bandActivities?: BandActivityFeedItem[];
  bandDataLoading?: boolean;
};

export function LookingForSlide({
  member,
  isOwnProfile = false,
  mutualMembers = [],
  memberBands = [],
  bandActivities = [],
  bandDataLoading = false,
}: LookingForSlideProps) {
  return (
    <div className="flex h-full flex-col space-y-8 px-6 pb-8 pt-4">
      {isOwnProfile ? (
        <ProfileTabHeading
          eyebrow="Band"
          title="Band"
          description="募集パートやバンド活動の情報。"
        />
      ) : null}

      {isOwnProfile ? (
        <SectionBlock label="共鳴した人">
          {mutualMembers.length > 0 ? (
            <div className="space-y-3">
              {mutualMembers.map(({ member: resonateMember, frequencyColor, conversationId }) => {
                const color = frequencyColor as FrequencyColorHex | undefined;

                return (
                  <div
                    key={resonateMember.id}
                    className="flex items-center gap-4 rounded-[24px] border border-border bg-subtle px-4 py-4"
                  >
                    <Link href={`/member/${resonateMember.id}`} className="shrink-0">
                      <ProfilePhotoRing color={color} className="h-14 w-14 rounded-full">
                        <div className="relative h-14 w-14 overflow-hidden rounded-full">
                          <Image
                            src={getProfilePhotoSrc(resonateMember.photo, 112)}
                            alt={resonateMember.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                            loading="lazy"
                          />
                        </div>
                      </ProfilePhotoRing>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/member/${resonateMember.id}`}
                        className="text-[17px] font-medium"
                      >
                        {resonateMember.name}
                      </Link>
                      <p className="mt-1 text-[13px] text-white/45">
                        {resonateMember.music.instruments.join(", ") || "パート未設定"}
                      </p>
                    </div>
                    {conversationId ? (
                      <Link
                        href={`/messages/${conversationId}`}
                        className="shrink-0 rounded-full border border-border px-3 py-2 text-[13px] text-primary"
                      >
                        メッセージ
                      </Link>
                    ) : null}
                  </div>
                );
              })}
              <Link
                href="/bands/new"
                className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-medium text-primary-foreground transition-quiet active:opacity-85"
              >
                Bandを作成
              </Link>
            </div>
          ) : (
            <div className="rounded-[28px] border border-border bg-subtle px-6 py-8 text-center">
              <p className="text-[15px] leading-relaxed text-white/55">
                まだ共鳴した人がいません。
                <br />
                Homeから気になる人に共鳴してみましょう。
              </p>
              <Link href="/" className="mt-6 inline-flex text-[15px] text-primary">
                Homeへ戻る
              </Link>
            </div>
          )}
        </SectionBlock>
      ) : null}
      {isOwnProfile && memberBands.length > 0 ? (
        <SectionBlock label="所属Band">
          <div className="space-y-3">
            {memberBands.map((band) => (
              <BandListItem key={band.id} band={band} />
            ))}
          </div>
        </SectionBlock>
      ) : null}
      {isOwnProfile ? (
        <SectionBlock label="Activity">
          {bandDataLoading ? (
            <p className="text-[15px] leading-relaxed text-white/45">読み込み中...</p>
          ) : (
            <BandActivityFeed activities={bandActivities} isOwnProfile={isOwnProfile} />
          )}
        </SectionBlock>
      ) : null}
      <SectionBlock label="募集パート">
        {member.lookingFor.parts.length > 0 ? (
          <RecruitmentPartsList
            targetMemberId={member.id}
            parts={member.lookingFor.parts}
            isOwnProfile={isOwnProfile}
            variant="rows"
          />
        ) : (
          <p className="text-[15px] leading-relaxed text-white/50">
            まだ募集パートは設定されていません。
          </p>
        )}
      </SectionBlock>
      {member.lookingFor.bandVision ? (
        <SectionBlock label="Band Vision">
          <p>{member.lookingFor.bandVision}</p>
        </SectionBlock>
      ) : null}
      {member.lookingFor.commitment ? (
        <SectionBlock label="活動頻度">
          <p>{member.lookingFor.commitment}</p>
        </SectionBlock>
      ) : null}
      {member.lookingFor.liveHistory && member.lookingFor.liveHistory.length > 0 ? (
        <SectionBlock label="Live History">
          <div className="space-y-2">
            {member.lookingFor.liveHistory.map((entry) => (
              <p key={entry} className="text-[15px] leading-relaxed text-white/75">
                {entry}
              </p>
            ))}
          </div>
        </SectionBlock>
      ) : null}
      {member.lookingFor.setList && member.lookingFor.setList.length > 0 ? (
        <SectionBlock label="Set List">
          <div className="space-y-2">
            {member.lookingFor.setList.map((entry) => (
              <p key={entry} className="text-[15px] leading-relaxed text-white/75">
                {entry}
              </p>
            ))}
          </div>
        </SectionBlock>
      ) : null}
      {!isOwnProfile && memberBands.length > 0 ? (
        <SectionBlock label="所属Band">
          <div className="space-y-3">
            {memberBands.map((band) => (
              <BandListItem key={band.id} band={band} />
            ))}
          </div>
        </SectionBlock>
      ) : null}
      {!isOwnProfile ? (
        <SectionBlock label="Activity">
          {bandDataLoading ? (
            <p className="text-[15px] leading-relaxed text-white/45">読み込み中...</p>
          ) : (
            <BandActivityFeed activities={bandActivities} isOwnProfile={isOwnProfile} />
          )}
        </SectionBlock>
      ) : null}
    </div>
  );
}
