"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  updateFrequencyColorAction,
  updateMemberAction,
} from "@/lib/actions/member";
import { applyFrequencyColorVariables } from "@/lib/frequency-color/css";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";
import { withAlpha } from "@/lib/frequency-color/utils";
import { joinList, splitList } from "@/lib/form";
import { FormField, FormInput, FormSection } from "@/components/FormField";
import { FrequencyColorSwatchGrid } from "@/components/frequency-color/FrequencyColorSwatchGrid";
import { PhotoUpload } from "@/components/PhotoUpload";
import type { Member } from "@/types/member";

type MemberEditFormProps = {
  member: Member;
};

export function MemberEditForm({ member: initialMember }: MemberEditFormProps) {
  const [member, setMember] = useState(initialMember);
  const initialFrequencyColor = initialMember.frequencyColor as
    | FrequencyColorHex
    | undefined;
  const [frequencyColor, setFrequencyColor] = useState<
    FrequencyColorHex | undefined
  >(initialFrequencyColor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (frequencyColor) {
      applyFrequencyColorVariables(document.documentElement, frequencyColor);
    }
  }, [frequencyColor]);

  function updateField<T extends keyof Member>(key: T, value: Member[T]) {
    setMember((current) => ({ ...current, [key]: value }));
  }

  function updateNested<
    K extends "music" | "lookingFor",
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
      if (
        frequencyColor &&
        frequencyColor !== initialFrequencyColor
      ) {
        const colorResult = await updateFrequencyColorAction(frequencyColor);
        if (colorResult?.error) {
          setError(colorResult.error);
          return;
        }
      }

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
            戻る
          </Link>
          <h1 className="text-sm font-medium tracking-[0.2em] text-white/90">
            プロフィール
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
        <p className="text-[14px] leading-relaxed text-white/45">
          名前や写真、Frequency Colorを変更できます。音楽的な輪郭はAIとの短い対話で深まります。
        </p>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[14px] text-red-300">
            {error}
          </div>
        ) : null}

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
          <FormField label="プロフィール写真" hint="任意">
            <PhotoUpload
              memberId={member.id}
              value={member.photo}
              onChange={(url) => updateField("photo", url)}
            />
          </FormField>
        </FormSection>

        <FormSection title="Frequency Color">
          <FormField
            label="あなたのサインカラー"
            hint="プロフィールやResono全体に静かに反映されます"
          >
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-5">
              <div className="mb-5 flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-full transition-quiet"
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

        <FormSection title="Music">
          <FormField label="好きなアーティスト" hint="カンマ区切り・任意">
            <FormInput
              value={joinList(member.music.favoriteArtists)}
              onChange={(event) =>
                updateNested("music", "favoriteArtists", splitList(event.target.value))
              }
            />
          </FormField>
        </FormSection>

        <FormSection title="Looking For">
          <FormField label="募集パート" hint="カンマ区切り・任意">
            <FormInput
              value={joinList(member.lookingFor.parts)}
              onChange={(event) =>
                updateNested("lookingFor", "parts", splitList(event.target.value))
              }
            />
          </FormField>
        </FormSection>

        <Link
          href="/discover"
          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-[15px] text-white/80 transition-colors active:bg-white/[0.07]"
        >
          <span>AIと少し話して、共鳴を深める</span>
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="sticky bottom-0 border-t border-white/5 bg-background px-5 pb-8 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-[15px] font-medium text-primary-foreground transition-opacity disabled:opacity-40"
        >
          {isPending ? "保存中..." : "保存する"}
        </button>
      </div>
    </form>
  );
}
