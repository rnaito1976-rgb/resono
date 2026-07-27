"use client";

import { useEffect, useRef } from "react";
import { WelcomeArtistPicker } from "@/components/welcome/WelcomeArtistPicker";
import { WelcomePartsPicker } from "@/components/welcome/WelcomePartsPicker";
import { WelcomeSoundsPicker } from "@/components/welcome/WelcomeSoundsPicker";
import {
  ProfileGrowSearchPicker,
  flattenProfileGrowCatalog,
} from "@/components/discover/ProfileGrowSearchPicker";
import {
  PROFILE_GROW_FESTIVAL_GROUPS,
  PROFILE_GROW_GEAR_GROUPS,
  PROFILE_GROW_LIVE_HOUSE_GROUPS,
  PROFILE_GROW_SONG_GROUPS,
  PROFILE_GROW_STYLE_GROUPS,
  PROFILE_GROW_STUDIO_GROUPS,
} from "@/lib/profile/grow/catalogs";
import { MOBILE_CHAT_TEXTAREA_CLASS } from "@/lib/mobile/input-classes";
import { WELCOME_ARTIST_CATALOG } from "@/lib/welcome/onboarding-data";
import { cn } from "@/lib/utils";
import type { ProfileGrowQuestion } from "@/types/profile-grow";

const SONG_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_SONG_GROUPS);
const LIVE_HOUSE_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_LIVE_HOUSE_GROUPS);
const STUDIO_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_STUDIO_GROUPS);
const FESTIVAL_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_FESTIVAL_GROUPS);
const GEAR_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_GEAR_GROUPS);
const STYLE_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_STYLE_GROUPS);

type ProfileGrowQuestionInputProps = {
  question: ProfileGrowQuestion;
  freeText: string;
  onFreeTextChange: (value: string) => void;
  selected: string[];
  onSelectedChange: (values: string[]) => void;
  listMaxHeight?: number;
};

export function ProfileGrowQuestionInput({
  question,
  freeText,
  onFreeTextChange,
  selected,
  onSelectedChange,
  listMaxHeight,
}: ProfileGrowQuestionInputProps) {
  if (question.inputMode === "free") {
    return (
      <ProfileGrowFreeTextInput value={freeText} onChange={onFreeTextChange} />
    );
  }

  return (
    <ProfileGrowSelectInput
      question={question}
      selected={selected}
      onSelectedChange={onSelectedChange}
      listMaxHeight={listMaxHeight}
    />
  );
}

function ProfileGrowFreeTextInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) {
      return;
    }

    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, 128)}px`;
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={1}
      placeholder="思いつくまま返信してみて"
      enterKeyHint="send"
      autoComplete="off"
      autoCorrect="on"
      className={cn(MOBILE_CHAT_TEXTAREA_CLASS)}
    />
  );
}

function ProfileGrowSelectInput({
  question,
  selected,
  onSelectedChange,
  listMaxHeight,
}: {
  question: ProfileGrowQuestion;
  selected: string[];
  onSelectedChange: (values: string[]) => void;
  listMaxHeight?: number;
}) {
  const pickerProps = {
    selected,
    onChange: onSelectedChange,
    listMaxHeight,
  };

  switch (question.picker) {
    case "artists":
    case "bands":
      return (
        <div className="flex min-h-0 flex-col" style={{ maxHeight: listMaxHeight }}>
          <WelcomeArtistPicker selected={selected} onChange={onSelectedChange} />
        </div>
      );

    case "genres":
      return (
        <div className="flex min-h-0 flex-col" style={{ maxHeight: listMaxHeight }}>
          <WelcomeSoundsPicker
            selected={selected}
            onChange={onSelectedChange}
            placeholder="ジャンルを検索"
          />
        </div>
      );

    case "parts":
    case "members":
      return (
        <div
          className="min-h-0 overflow-y-auto scrollbar-hide"
          style={{ maxHeight: listMaxHeight }}
        >
          <WelcomePartsPicker selected={selected} onChange={onSelectedChange} />
        </div>
      );

    case "cover":
    case "songs":
      return (
        <ProfileGrowSearchPicker
          groups={PROFILE_GROW_SONG_GROUPS}
          catalog={SONG_CATALOG}
          placeholder="曲名やアーティストを検索"
          {...pickerProps}
        />
      );

    case "liveHouses":
      return (
        <ProfileGrowSearchPicker
          groups={PROFILE_GROW_LIVE_HOUSE_GROUPS}
          catalog={LIVE_HOUSE_CATALOG}
          placeholder="ライブハウスを検索"
          {...pickerProps}
        />
      );

    case "studios":
      return (
        <ProfileGrowSearchPicker
          groups={PROFILE_GROW_STUDIO_GROUPS}
          catalog={STUDIO_CATALOG}
          placeholder="スタジオを検索"
          {...pickerProps}
        />
      );

    case "festivals":
      return (
        <ProfileGrowSearchPicker
          groups={PROFILE_GROW_FESTIVAL_GROUPS}
          catalog={FESTIVAL_CATALOG}
          placeholder="フェスを検索"
          {...pickerProps}
        />
      );

    case "gear":
      return (
        <ProfileGrowSearchPicker
          groups={PROFILE_GROW_GEAR_GROUPS}
          catalog={GEAR_CATALOG}
          placeholder="機材を検索"
          {...pickerProps}
        />
      );

    case "style":
      return (
        <ProfileGrowSearchPicker
          groups={PROFILE_GROW_STYLE_GROUPS}
          catalog={STYLE_CATALOG}
          placeholder="スタイルを検索"
          max={3}
          {...pickerProps}
        />
      );

    default:
      return (
        <ProfileGrowSearchPicker
          groups={[{ label: "Suggestions", items: [...WELCOME_ARTIST_CATALOG.slice(0, 12)] }]}
          catalog={WELCOME_ARTIST_CATALOG}
          {...pickerProps}
        />
      );
  }
}
