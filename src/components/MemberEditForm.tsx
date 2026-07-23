"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { updateMemberAction } from "@/lib/actions/member";
import { joinList, splitList } from "@/lib/form";
import { FormField, FormInput, FormSection, FormTextarea } from "@/components/FormField";
import { PhotoUpload } from "@/components/PhotoUpload";
import type { Member } from "@/types/member";

type MemberEditFormProps = {
  member: Member;
};

export function MemberEditForm({ member: initialMember }: MemberEditFormProps) {
  const [member, setMember] = useState(initialMember);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<T extends keyof Member>(key: T, value: Member[T]) {
    setMember((current) => ({ ...current, [key]: value }));
  }

  function updateNested<
    K extends "portrait" | "music" | "fashion" | "mood" | "lookingFor",
  >(section: K, key: keyof Member[K], value: Member[K][keyof Member[K]]) {
    setMember((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateMemberAction(member);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-5 py-4">
          <Link
            href={`/member/${member.id}`}
            className="text-[15px] text-white/70 transition-opacity active:opacity-70"
          >
            キャンセル
          </Link>
          <h1 className="text-sm font-medium tracking-[0.2em] text-white/90">
            プロフィール編集
          </h1>
          <button
            type="submit"
            disabled={isPending}
            className="text-[15px] font-medium text-primary transition-opacity disabled:opacity-40"
          >
            {isPending ? "保存中..." : "保存"}
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-10 px-5 py-6 pb-28">
        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-300">
            {error}
          </div>
        ) : null}

        <FormSection title="Basic">
          <FormField label="名前" hint="後から設定できます">
            <FormInput
              value={member.name}
              onChange={(event) => updateField("name", event.target.value)}
            />
          </FormField>
          <FormField label="プロフィール写真">
            <PhotoUpload
              memberId={member.id}
              value={member.photo}
              onChange={(url) => updateField("photo", url)}
            />
          </FormField>
          <FormField label="タグ" hint="カンマ区切り">
            <FormInput
              value={joinList(member.tags)}
              onChange={(event) => updateField("tags", splitList(event.target.value))}
            />
          </FormField>
          <FormField label="AIによる一言">
            <FormTextarea
              value={member.aiComment}
              onChange={(event) => updateField("aiComment", event.target.value)}
              required
            />
          </FormField>
        </FormSection>

        <FormSection title="Portrait">
          <FormField label="自己紹介">
            <FormTextarea
              value={member.portrait.bio}
              onChange={(event) => updateNested("portrait", "bio", event.target.value)}
              required
            />
          </FormField>
          <FormField label="年齢">
            <FormInput
              type="number"
              min={1}
              value={member.portrait.age}
              onChange={(event) =>
                updateNested("portrait", "age", Number(event.target.value))
              }
              required
            />
          </FormField>
          <FormField label="場所">
            <FormInput
              value={member.portrait.location}
              onChange={(event) =>
                updateNested("portrait", "location", event.target.value)
              }
              required
            />
          </FormField>
          <FormField label="Influences" hint="カンマ区切り">
            <FormInput
              value={joinList(member.portrait.influences)}
              onChange={(event) =>
                updateNested("portrait", "influences", splitList(event.target.value))
              }
            />
          </FormField>
        </FormSection>

        <FormSection title="Music">
          <FormField label="Genres" hint="カンマ区切り">
            <FormInput
              value={joinList(member.music.genres)}
              onChange={(event) =>
                updateNested("music", "genres", splitList(event.target.value))
              }
            />
          </FormField>
          <FormField label="Favorite Artists" hint="カンマ区切り">
            <FormInput
              value={joinList(member.music.favoriteArtists)}
              onChange={(event) =>
                updateNested("music", "favoriteArtists", splitList(event.target.value))
              }
            />
          </FormField>
          <FormField label="Instruments" hint="カンマ区切り">
            <FormInput
              value={joinList(member.music.instruments)}
              onChange={(event) =>
                updateNested("music", "instruments", splitList(event.target.value))
              }
            />
          </FormField>
          <FormField label="Listening Mood">
            <FormInput
              value={member.music.listeningMood}
              onChange={(event) =>
                updateNested("music", "listeningMood", event.target.value)
              }
              required
            />
          </FormField>
        </FormSection>

        <FormSection title="Fashion">
          <FormField label="Style">
            <FormInput
              value={member.fashion.style}
              onChange={(event) => updateNested("fashion", "style", event.target.value)}
              required
            />
          </FormField>
          <FormField label="Colors" hint="カンマ区切り">
            <FormInput
              value={joinList(member.fashion.colors)}
              onChange={(event) =>
                updateNested("fashion", "colors", splitList(event.target.value))
              }
            />
          </FormField>
          <FormField label="Brands" hint="カンマ区切り">
            <FormInput
              value={joinList(member.fashion.brands)}
              onChange={(event) =>
                updateNested("fashion", "brands", splitList(event.target.value))
              }
            />
          </FormField>
          <FormField label="Description">
            <FormTextarea
              value={member.fashion.description}
              onChange={(event) =>
                updateNested("fashion", "description", event.target.value)
              }
              required
            />
          </FormField>
        </FormSection>

        <FormSection title="Mood">
          <FormField label="Keywords" hint="カンマ区切り">
            <FormInput
              value={joinList(member.mood.keywords)}
              onChange={(event) =>
                updateNested("mood", "keywords", splitList(event.target.value))
              }
            />
          </FormField>
          <FormField label="Atmosphere">
            <FormTextarea
              value={member.mood.atmosphere}
              onChange={(event) =>
                updateNested("mood", "atmosphere", event.target.value)
              }
              required
            />
          </FormField>
          <FormField label="Creative Time">
            <FormInput
              value={member.mood.creativeTime}
              onChange={(event) =>
                updateNested("mood", "creativeTime", event.target.value)
              }
              required
            />
          </FormField>
          <FormField label="Description">
            <FormTextarea
              value={member.mood.description}
              onChange={(event) =>
                updateNested("mood", "description", event.target.value)
              }
              required
            />
          </FormField>
        </FormSection>

        <FormSection title="Looking For">
          <FormField label="募集パート" hint="カンマ区切り">
            <FormInput
              value={joinList(member.lookingFor.parts)}
              onChange={(event) =>
                updateNested("lookingFor", "parts", splitList(event.target.value))
              }
            />
          </FormField>
          <FormField label="Band Vision">
            <FormTextarea
              value={member.lookingFor.bandVision}
              onChange={(event) =>
                updateNested("lookingFor", "bandVision", event.target.value)
              }
              required
            />
          </FormField>
          <FormField label="Commitment">
            <FormTextarea
              value={member.lookingFor.commitment}
              onChange={(event) =>
                updateNested("lookingFor", "commitment", event.target.value)
              }
              required
            />
          </FormField>
        </FormSection>
      </div>

      <div className="sticky bottom-0 border-t border-white/5 bg-background px-5 pb-8 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-medium text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {isPending ? "保存中..." : "変更を保存"}
        </button>
      </div>
    </form>
  );
}
