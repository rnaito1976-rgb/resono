"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  saveMemberEditAction,
} from "@/lib/actions/member";
import { useFrequencyColor } from "@/components/frequency-color/FrequencyColorProvider";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { withAlpha } from "@/lib/frequency-color/utils";
import { queryKeys } from "@/lib/query/keys";
import {
  FormField,
  FormGroupHeading,
  FormInput,
  FormSection,
  FormTextarea,
} from "@/components/FormField";
import { FormPickerSheet } from "@/components/form/FormPickerSheet";
import { CoverSongsEditor } from "@/components/form/CoverSongsEditor";
import { ActivityStylePicker } from "@/components/form/ActivityStylePicker";
import { FormTagPickerTrigger } from "@/components/form/FormTagPickerTrigger";
import { FrequencyColorSwatchGrid } from "@/components/frequency-color/FrequencyColorSwatchGrid";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { ProfilePhotoUpload } from "@/components/profile-photo/ProfilePhotoUpload";
import {
  ProfileGrowSearchPicker,
  flattenProfileGrowCatalog,
} from "@/components/discover/ProfileGrowSearchPicker";
import { WelcomeArtistPicker } from "@/components/welcome/WelcomeArtistPicker";
import { WelcomePartsPicker } from "@/components/welcome/WelcomePartsPicker";
import { WelcomeSoundsPicker } from "@/components/welcome/WelcomeSoundsPicker";
import { formatInfluencesForEdit, joinList, mergePublicInfluences, splitList } from "@/lib/form";
import {
  PROFILE_GROW_FESTIVAL_GROUPS,
  PROFILE_GROW_GEAR_GROUPS,
  PROFILE_GROW_LIVE_HOUSE_GROUPS,
  PROFILE_GROW_SONG_GROUPS,
  PROFILE_GROW_STUDIO_GROUPS,
} from "@/lib/profile/grow/catalogs";
import {
  formatProfileItemForEdit,
  getProfileItemLabel,
  getProfileItemsForEditSection,
  parseProfileItemFromEdit,
  prepareMemberForSave,
  setProfileItem,
  syncMemberFromProfileItems,
  syncProfileItemsFromMemberFields,
} from "@/lib/profile/items";
import type { ProfileEditSection, ProfileItemKind } from "@/types/profile-item";
import type { Member } from "@/types/member";
import type { MemberMusicProfile } from "@/types/music-profile";

const SONG_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_SONG_GROUPS);
const LIVE_HOUSE_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_LIVE_HOUSE_GROUPS);
const STUDIO_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_STUDIO_GROUPS);
const FESTIVAL_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_FESTIVAL_GROUPS);
const GEAR_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_GEAR_GROUPS);

type MemberEditFormProps = {
  member: Member;
};

type PickerKind =
  | "instruments"
  | "favoriteArtists"
  | "favoriteSongs"
  | "dreamBands"
  | "favoriteGenres"
  | "favoriteLiveHouses"
  | "favoriteStudios"
  | "favoriteFestivals"
  | "gear"
  | "lookingForParts";

type MusicListKey = keyof Pick<
  MemberMusicProfile,
  | "favoriteSongs"
  | "favoriteLiveHouses"
  | "favoriteStudios"
  | "favoriteFestivals"
  | "gear"
  | "videos"
>;

type LookingForListKey = "setList" | "liveHistory";

function ProfileItemFields({
  member,
  section,
  onUpdate,
}: {
  member: Member;
  section: ProfileEditSection;
  onUpdate: (kind: ProfileItemKind, raw: string) => void;
}) {
  const items = getProfileItemsForEditSection(member, section);

  if (items.length === 0) {
    return null;
  }

  return (
    <FormSection title="プロフィール項目">
      {items.map((item) => (
        <FormField key={item.kind} label={getProfileItemLabel(item.kind)}>
          <FormInput
            value={formatProfileItemForEdit(item)}
            onChange={(event) => onUpdate(item.kind, event.target.value)}
          />
        </FormField>
      ))}
    </FormSection>
  );
}

export function MemberEditForm({ member: initialMember }: MemberEditFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { color: viewerColor, setColor } = useFrequencyColor();
  const viewerColorRef = useRef(viewerColor);
  const [member, setMember] = useState(initialMember);
  const initialFrequencyColor = initialMember.frequencyColor as
    | FrequencyColorHex
    | undefined;
  const [frequencyColor, setFrequencyColor] = useState<
    FrequencyColorHex | undefined
  >(initialFrequencyColor);
  const [activePicker, setActivePicker] = useState<PickerKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    viewerColorRef.current = viewerColor;
  }, [viewerColor]);

  useEffect(() => {
    if (!frequencyColor) {
      return;
    }

    setColor(frequencyColor, { persist: false });
  }, [frequencyColor, setColor]);

  useEffect(() => {
    return () => {
      setColor(viewerColorRef.current, { persist: false });
    };
  }, [setColor]);

  function updateField<T extends keyof Member>(key: T, value: Member[T]) {
    setMember((current) => ({ ...current, [key]: value }));
  }

  function updateNested<
    K extends "music" | "lookingFor" | "portrait",
  >(section: K, key: keyof Member[K], value: Member[K][keyof Member[K]]) {
    setMember((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  }

  function updateProfileItemField(kind: ProfileItemKind, raw: string) {
    setMember((current) =>
      syncMemberFromProfileItems(
        setProfileItem(current, parseProfileItemFromEdit(kind, raw))
      )
    );
  }

  function updateFavoriteArtists(artists: string[]) {
    setMember((current) =>
      syncProfileItemsFromMemberFields({
        ...current,
        music: {
          ...current.music,
          favoriteArtists: artists,
        },
      })
    );
  }

  function updateDreamBands(bands: string[]) {
    setMember((current) => ({
      ...current,
      music: {
        ...current.music,
        dreamBands: bands.length > 0 ? bands : undefined,
      },
    }));
  }

  function updateMusicList(key: MusicListKey, values: string[]) {
    setMember((current) => ({
      ...current,
      music: {
        ...current.music,
        [key]: values.length > 0 ? values : undefined,
      },
    }));
  }

  function updateLookingForList(key: LookingForListKey, values: string[]) {
    setMember((current) => ({
      ...current,
      lookingFor: {
        ...current.lookingFor,
        [key]: values.length > 0 ? values : undefined,
      },
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const payload = prepareMemberForSave(member);
      const colorChanged =
        Boolean(frequencyColor) && frequencyColor !== initialFrequencyColor;

      const result = await saveMemberEditAction({
        member: payload,
        frequencyColor: colorChanged ? frequencyColor! : undefined,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (colorChanged && frequencyColor) {
        setColor(frequencyColor);
      }

      // 保存済みの内容をキャッシュへ先に反映して、遷移先で待たせない
      queryClient.setQueryData(queryKeys.members.profile(payload.id), (current) =>
        current && typeof current === "object"
          ? { ...current, member: payload }
          : current
      );
      void queryClient.invalidateQueries({ queryKey: ["members", "feed"] });

      router.replace(`/member/${payload.id}`);
    });
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl">
        <AppPageHeader
          backHref={`/member/${member.id}`}
          backLabel="プロフィールに戻る"
          eyebrow="Profile"
          title="プロフィール編集"
          actions={
            <button
              type="submit"
              disabled={isPending}
              className="text-[15px] font-medium text-primary transition-opacity disabled:opacity-40"
            >
              {isPending ? "保存中..." : "保存"}
            </button>
          }
        />
      </header>

      <div className="flex-1 space-y-12 px-5 py-6 pb-28">
        <p className="text-[14px] leading-relaxed text-white/45">
          基本情報とプロフィール項目は、いつでもここで編集できます。AIとの会話で新しい項目も追加できます。
        </p>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-300">
            {error}
          </div>
        ) : null}

        <section className="space-y-6">
          <FormGroupHeading label="About" />

          <FormSection title="Profile Photo">
            <ProfilePhotoUpload
              memberId={member.id}
              value={member.photo}
              frequencyColor={frequencyColor}
              onChange={(url) => updateField("photo", url)}
            />
          </FormSection>

          <FormSection title="Basic">
            <FormField label="名前" hint="任意">
              <FormInput
                value={member.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </FormField>
            <FormField label="演奏パート" hint="タップして選択">
              <FormTagPickerTrigger
                selected={member.music.instruments ?? []}
                placeholder="パートを選択"
                onClick={() => setActivePicker("instruments")}
              />
            </FormField>
            <FormField label="自己紹介 / Bio" hint="任意">
              <FormTextarea
                rows={4}
                value={member.portrait.bio}
                onChange={(event) =>
                  updateNested("portrait", "bio", event.target.value)
                }
                placeholder="あなたの音楽や活動について"
              />
            </FormField>
            <FormField
              label="Values / 大切にしていること"
              hint="カンマ区切り・任意"
            >
              <FormInput
                value={formatInfluencesForEdit(member.portrait.influences)}
                onChange={(event) =>
                  updateNested(
                    "portrait",
                    "influences",
                    mergePublicInfluences(member.portrait.influences, event.target.value)
                  )
                }
                placeholder="例: メロディ, ライブ映え, 丁寧な音作り"
              />
            </FormField>
          </FormSection>

          <FormSection title="Frequency Color">
            <FormField
              label="あなたのサインカラー"
              hint="プロフィールやResono全体に静かに反映されます"
            >
              <div className="rounded-2xl border border-border bg-white/[0.03] px-4 py-5">
                <div className="mb-5 flex items-center gap-4">
                  <div
                    className="size-12 shrink-0 rounded-full transition-quiet"
                    style={{
                      backgroundColor: frequencyColor ?? "rgba(255,255,255,0.08)",
                      boxShadow: frequencyColor
                        ? `0 0 0 1px ${withAlpha(frequencyColor, 0.35)}, 0 0 24px ${withAlpha(frequencyColor, 0.22)}`
                        : undefined,
                    }}
                  />
                  <p className="text-[14px] leading-relaxed text-white/55">
                    オンボーディングで選んだ色を、いつでも変更できます。
                  </p>
                </div>
                <FrequencyColorSwatchGrid
                  selected={frequencyColor}
                  onSelect={setFrequencyColor}
                  columns={8}
                />
              </div>
            </FormField>
          </FormSection>

          <ProfileItemFields
            member={member}
            section="about"
            onUpdate={updateProfileItemField}
          />
        </section>

        <section className="space-y-6">
          <FormGroupHeading label="Music" />

          <FormSection title="Music">
            <FormField label="活動スタイル" hint="任意 · どんなバンド活動をしたいか">
              <ActivityStylePicker
                value={member.music.activityStyles ?? []}
                onChange={(activityStyles) =>
                  updateNested(
                    "music",
                    "activityStyles",
                    activityStyles.length > 0 ? activityStyles : undefined
                  )
                }
              />
            </FormField>
            <FormField label="好きなアーティスト" hint="タップして選択">
              <FormTagPickerTrigger
                selected={member.music.favoriteArtists ?? []}
                placeholder="アーティストを選択"
                onClick={() => setActivePicker("favoriteArtists")}
              />
            </FormField>
            <FormField label="Favorite Songs" hint="タップして選択">
              <FormTagPickerTrigger
                selected={member.music.favoriteSongs ?? []}
                placeholder="曲を選択"
                onClick={() => setActivePicker("favoriteSongs")}
              />
            </FormField>
            <FormField label="好きなジャンル" hint="タップして選択">
              <FormTagPickerTrigger
                selected={member.music.genres ?? []}
                placeholder="ジャンルを選択"
                onClick={() => setActivePicker("favoriteGenres")}
              />
            </FormField>
          </FormSection>

          <FormSection title="Dream Bands">
            <p className="text-[14px] leading-relaxed text-white/55">コピーしたいバンド</p>
            <FormField label="バンド名" hint="タップして選択">
              <FormTagPickerTrigger
                selected={member.music.dreamBands ?? []}
                placeholder="バンドを選択"
                onClick={() => setActivePicker("dreamBands")}
              />
            </FormField>
          </FormSection>

          <FormSection title="Want to Cover">
            <p className="text-[14px] leading-relaxed text-white/55">コピーしてみたい曲</p>
            <CoverSongsEditor
              memberId={member.id}
              value={member.music.coverSongs}
              onChange={(coverSongs) => updateNested("music", "coverSongs", coverSongs)}
            />
          </FormSection>

          <FormSection title="Covered Before">
            <p className="text-[14px] leading-relaxed text-white/55">コピーしたことのある曲</p>
            <CoverSongsEditor
              memberId={member.id}
              idPrefix="covered"
              value={member.music.coveredSongs}
              onChange={(coveredSongs) => updateNested("music", "coveredSongs", coveredSongs)}
            />
          </FormSection>

          <FormSection title="Places & Gear">
            <FormField label="Favorite Live Houses" hint="タップして選択">
              <FormTagPickerTrigger
                selected={member.music.favoriteLiveHouses ?? []}
                placeholder="ライブハウスを選択"
                onClick={() => setActivePicker("favoriteLiveHouses")}
              />
            </FormField>
            <FormField label="Favorite Studios" hint="タップして選択">
              <FormTagPickerTrigger
                selected={member.music.favoriteStudios ?? []}
                placeholder="スタジオを選択"
                onClick={() => setActivePicker("favoriteStudios")}
              />
            </FormField>
            <FormField label="Favorite Festivals" hint="タップして選択">
              <FormTagPickerTrigger
                selected={member.music.favoriteFestivals ?? []}
                placeholder="フェスを選択"
                onClick={() => setActivePicker("favoriteFestivals")}
              />
            </FormField>
            <FormField label="Gear" hint="タップして選択">
              <FormTagPickerTrigger
                selected={member.music.gear ?? []}
                placeholder="機材を選択"
                onClick={() => setActivePicker("gear")}
              />
            </FormField>
            <FormField label="Videos" hint="URLをカンマ区切り・任意">
              <FormInput
                value={joinList(member.music.videos ?? [])}
                onChange={(event) =>
                  updateMusicList("videos", splitList(event.target.value))
                }
                placeholder="https://..."
              />
            </FormField>
          </FormSection>

          <ProfileItemFields
            member={member}
            section="music"
            onUpdate={updateProfileItemField}
          />
        </section>

        <section className="space-y-6">
          <FormGroupHeading label="Band" />

          <FormSection title="Looking For">
            <FormField label="募集パート" hint="タップして選択">
              <FormTagPickerTrigger
                selected={member.lookingFor.parts ?? []}
                placeholder="パートを選択"
                onClick={() => setActivePicker("lookingForParts")}
              />
            </FormField>
            <FormField label="Band Vision / Style" hint="任意">
              <FormTextarea
                rows={3}
                value={member.lookingFor.bandVision}
                onChange={(event) =>
                  updateNested("lookingFor", "bandVision", event.target.value)
                }
                placeholder="組みたいバンド像や大切にしたいこと"
              />
            </FormField>
            <FormField label="活動頻度 / Schedule" hint="任意（例: 週1リハ、月2ライブ）">
              <FormInput
                value={member.lookingFor.commitment}
                onChange={(event) =>
                  updateNested("lookingFor", "commitment", event.target.value)
                }
              />
            </FormField>
            <FormField label="Set List" hint="カンマ区切り・任意">
              <FormInput
                value={joinList(member.lookingFor.setList ?? [])}
                onChange={(event) =>
                  updateLookingForList("setList", splitList(event.target.value))
                }
                placeholder="曲名を入力"
              />
            </FormField>
            <FormField label="Live History" hint="カンマ区切り、または改行・任意">
              <FormTextarea
                rows={3}
                value={(member.lookingFor.liveHistory ?? []).join("\n")}
                onChange={(event) =>
                  updateLookingForList(
                    "liveHistory",
                    event.target.value
                      .split(/[\n,、]/)
                      .map((item) => item.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="印象に残っているライブなど"
              />
            </FormField>
          </FormSection>

          <ProfileItemFields
            member={member}
            section="band"
            onUpdate={updateProfileItemField}
          />
        </section>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background px-5 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          type="submit"
          disabled={isPending}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-medium text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {isPending ? "保存中..." : "保存する"}
        </button>
      </div>
      </form>

      <FormPickerSheet
        open={activePicker === "instruments"}
        title="演奏パート"
        onClose={() => setActivePicker(null)}
      >
        <WelcomePartsPicker
          selected={member.music.instruments ?? []}
          onChange={(parts) => updateNested("music", "instruments", parts)}
        />
      </FormPickerSheet>

      <FormPickerSheet
        open={activePicker === "favoriteArtists"}
        title="好きなアーティスト"
        onClose={() => setActivePicker(null)}
      >
        <WelcomeArtistPicker
          selected={member.music.favoriteArtists ?? []}
          onChange={updateFavoriteArtists}
        />
      </FormPickerSheet>

      <FormPickerSheet
        open={activePicker === "favoriteSongs"}
        title="Favorite Songs"
        onClose={() => setActivePicker(null)}
      >
        <ProfileGrowSearchPicker
          catalogKey="songs"
          groups={PROFILE_GROW_SONG_GROUPS}
          catalog={SONG_CATALOG}
          selected={member.music.favoriteSongs ?? []}
          onChange={(values) => updateMusicList("favoriteSongs", values)}
          placeholder="曲名やアーティストを検索"
          listMaxHeight={360}
        />
      </FormPickerSheet>

      <FormPickerSheet
        open={activePicker === "dreamBands"}
        title="コピーしたいバンド"
        onClose={() => setActivePicker(null)}
      >
        <WelcomeArtistPicker
          selected={member.music.dreamBands ?? []}
          onChange={updateDreamBands}
        />
      </FormPickerSheet>

      <FormPickerSheet
        open={activePicker === "favoriteGenres"}
        title="好きなジャンル"
        onClose={() => setActivePicker(null)}
      >
        <WelcomeSoundsPicker
          selected={member.music.genres ?? []}
          placeholder="ジャンルを検索"
          onChange={(genres) => updateNested("music", "genres", genres)}
        />
      </FormPickerSheet>

      <FormPickerSheet
        open={activePicker === "favoriteLiveHouses"}
        title="Favorite Live Houses"
        onClose={() => setActivePicker(null)}
      >
        <ProfileGrowSearchPicker
          catalogKey="live_houses"
          groups={PROFILE_GROW_LIVE_HOUSE_GROUPS}
          catalog={LIVE_HOUSE_CATALOG}
          selected={member.music.favoriteLiveHouses ?? []}
          onChange={(values) => updateMusicList("favoriteLiveHouses", values)}
          placeholder="ライブハウスを検索"
          listMaxHeight={360}
        />
      </FormPickerSheet>

      <FormPickerSheet
        open={activePicker === "favoriteStudios"}
        title="Favorite Studios"
        onClose={() => setActivePicker(null)}
      >
        <ProfileGrowSearchPicker
          catalogKey="studios"
          groups={PROFILE_GROW_STUDIO_GROUPS}
          catalog={STUDIO_CATALOG}
          selected={member.music.favoriteStudios ?? []}
          onChange={(values) => updateMusicList("favoriteStudios", values)}
          placeholder="スタジオを検索"
          listMaxHeight={360}
        />
      </FormPickerSheet>

      <FormPickerSheet
        open={activePicker === "favoriteFestivals"}
        title="Favorite Festivals"
        onClose={() => setActivePicker(null)}
      >
        <ProfileGrowSearchPicker
          catalogKey="festivals"
          groups={PROFILE_GROW_FESTIVAL_GROUPS}
          catalog={FESTIVAL_CATALOG}
          selected={member.music.favoriteFestivals ?? []}
          onChange={(values) => updateMusicList("favoriteFestivals", values)}
          placeholder="フェスを検索"
          listMaxHeight={360}
        />
      </FormPickerSheet>

      <FormPickerSheet
        open={activePicker === "gear"}
        title="Gear"
        onClose={() => setActivePicker(null)}
      >
        <ProfileGrowSearchPicker
          catalogKey="gear"
          groups={PROFILE_GROW_GEAR_GROUPS}
          catalog={GEAR_CATALOG}
          selected={member.music.gear ?? []}
          onChange={(values) => updateMusicList("gear", values)}
          placeholder="機材を検索"
          listMaxHeight={360}
        />
      </FormPickerSheet>

      <FormPickerSheet
        open={activePicker === "lookingForParts"}
        title="募集パート"
        onClose={() => setActivePicker(null)}
      >
        <WelcomePartsPicker
          selected={member.lookingFor.parts ?? []}
          onChange={(parts) => updateNested("lookingFor", "parts", parts)}
        />
      </FormPickerSheet>
    </>
  );
}
