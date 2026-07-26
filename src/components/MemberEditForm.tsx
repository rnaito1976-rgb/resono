"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, useTransition } from "react";
import {
  updateFrequencyColorAction,
  updateMemberAction,
} from "@/lib/actions/member";
import { useFrequencyColor } from "@/components/frequency-color/FrequencyColorProvider";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { withAlpha } from "@/lib/frequency-color/utils";
import { formatInfluencesForEdit, joinList, splitList } from "@/lib/form";
import { queryKeys } from "@/lib/query/keys";
import {
  FormField,
  FormGroupHeading,
  FormInput,
  FormSection,
} from "@/components/FormField";
import { FormPickerSheet } from "@/components/form/FormPickerSheet";
import { FormTagPickerTrigger } from "@/components/form/FormTagPickerTrigger";
import { FrequencyColorSwatchGrid } from "@/components/frequency-color/FrequencyColorSwatchGrid";
import { AppPageHeader } from "@/components/navigation/AppPageHeader";
import { ProfilePhotoUpload } from "@/components/profile-photo/ProfilePhotoUpload";
import { WelcomeArtistPicker } from "@/components/welcome/WelcomeArtistPicker";
import { WelcomePartsPicker } from "@/components/welcome/WelcomePartsPicker";
import { WelcomeSoundsPicker } from "@/components/welcome/WelcomeSoundsPicker";
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
import type { CoverSong } from "@/types/music-profile";

function coverSongTitle(member: Member): string {
  return member.music.coverSongs?.[0]?.title ?? "";
}

function withCoverSongTitle(member: Member, title: string): Member {
  const trimmed = title.trim();
  const rest = member.music.coverSongs?.slice(1) ?? [];

  if (!trimmed) {
    return {
      ...member,
      music: {
        ...member.music,
        coverSongs: rest.length > 0 ? rest : undefined,
      },
    };
  }

  const existing = member.music.coverSongs?.[0];
  const nextSong: CoverSong = {
    id: existing?.id ?? `cover-${member.id}`,
    title: trimmed,
    artist: existing?.artist ?? "",
    artworkUrl: existing?.artworkUrl,
    sourceProvider: existing?.sourceProvider,
    externalUrl: existing?.externalUrl,
  };

  return {
    ...member,
    music: {
      ...member.music,
      coverSongs: [nextSong, ...rest],
    },
  };
}

type MemberEditFormProps = {
  member: Member;
};

type PickerKind = "favoriteArtists" | "dreamBands" | "favoriteGenres" | "lookingForParts";

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      if (
        frequencyColor &&
        frequencyColor !== initialFrequencyColor
      ) {
        const colorResult = await updateFrequencyColorAction(frequencyColor);
        if (colorResult?.error) {
          setError(colorResult.error);
          return;
        }
        setColor(frequencyColor);
      }

      const payload = prepareMemberForSave(member);
      const result = await updateMemberAction(payload);
      if (result?.error) {
        setError(result.error);
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.members.feed() }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.members.profile(payload.id),
        }),
      ]);
      router.refresh();
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
            <FormField label="演奏パート" hint="カンマ区切り・任意（例: ギター, ボーカル）">
              <FormInput
                value={joinList(member.music.instruments)}
                onChange={(event) =>
                  updateNested("music", "instruments", splitList(event.target.value))
                }
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
            <FormField label="好きなアーティスト" hint="タップして選択">
              <FormTagPickerTrigger
                selected={member.music.favoriteArtists ?? []}
                placeholder="アーティストを選択"
                onClick={() => setActivePicker("favoriteArtists")}
              />
            </FormField>
            <FormField label="好きなジャンル" hint="タップして選択">
              <FormTagPickerTrigger
                selected={member.music.genres ?? []}
                placeholder="ジャンルを選択"
                onClick={() => setActivePicker("favoriteGenres")}
              />
            </FormField>
            <FormField
              label="Influences"
              hint="カンマ区切り・任意（例: 竹内まりや, Cornelius, 羊文学）"
            >
              <FormInput
                value={formatInfluencesForEdit(member.portrait.influences)}
                onChange={(event) =>
                  updateNested("portrait", "influences", splitList(event.target.value))
                }
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
            <FormField label="曲名">
              <FormInput
                value={coverSongTitle(member)}
                placeholder="ライラック"
                onChange={(event) =>
                  setMember((current) => withCoverSongTitle(current, event.target.value))
                }
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
            <FormField label="活動頻度" hint="任意（例: 週1リハ、月2ライブ）">
              <FormInput
                value={member.lookingFor.commitment}
                onChange={(event) =>
                  updateNested("lookingFor", "commitment", event.target.value)
                }
              />
            </FormField>
          </FormSection>

          <ProfileItemFields
            member={member}
            section="band"
            onUpdate={updateProfileItemField}
          />
        </section>

        <Link
          href="/discover"
          className="flex items-center justify-between rounded-2xl border border-border bg-white/[0.04] px-5 py-4 text-[15px] text-white/80 transition-colors active:bg-white/[0.07]"
        >
          <span>Discover a Story</span>
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="sticky bottom-0 border-t border-border bg-background px-5 pb-8 pt-4">
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
