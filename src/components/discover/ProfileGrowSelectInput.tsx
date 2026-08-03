"use client";

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
  PROFILE_GROW_PRODUCTION_GROUPS,
  PROFILE_GROW_SONG_GROUPS,
  PROFILE_GROW_STYLE_GROUPS,
  PROFILE_GROW_STUDIO_GROUPS,
  PROFILE_GROW_WANTED_GEAR_GROUPS,
} from "@/lib/profile/grow/catalogs";
import { WELCOME_ARTIST_CATALOG } from "@/lib/welcome/onboarding-data";
import type { ProfileGrowQuestion } from "@/types/profile-grow";

const SONG_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_SONG_GROUPS);
const LIVE_HOUSE_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_LIVE_HOUSE_GROUPS);
const STUDIO_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_STUDIO_GROUPS);
const FESTIVAL_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_FESTIVAL_GROUPS);
const GEAR_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_GEAR_GROUPS);
const WANTED_GEAR_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_WANTED_GEAR_GROUPS);
const PRODUCTION_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_PRODUCTION_GROUPS);
const STYLE_CATALOG = flattenProfileGrowCatalog(PROFILE_GROW_STYLE_GROUPS);

type ProfileGrowSelectInputProps = {
  question: ProfileGrowQuestion;
  selected: string[];
  onSelectedChange: (values: string[]) => void;
  listMaxHeight?: number;
};

export function ProfileGrowSelectInput({
  question,
  selected,
  onSelectedChange,
  listMaxHeight,
}: ProfileGrowSelectInputProps) {
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
          catalogKey="songs"
          groups={PROFILE_GROW_SONG_GROUPS}
          catalog={SONG_CATALOG}
          placeholder="曲名やアーティストを検索"
          {...pickerProps}
        />
      );

    case "liveHouses":
      return (
        <ProfileGrowSearchPicker
          catalogKey="live_houses"
          groups={PROFILE_GROW_LIVE_HOUSE_GROUPS}
          catalog={LIVE_HOUSE_CATALOG}
          placeholder="ライブハウスを検索"
          {...pickerProps}
        />
      );

    case "studios":
      return (
        <ProfileGrowSearchPicker
          catalogKey="studios"
          groups={PROFILE_GROW_STUDIO_GROUPS}
          catalog={STUDIO_CATALOG}
          placeholder="スタジオを検索"
          {...pickerProps}
        />
      );

    case "festivals":
      return (
        <ProfileGrowSearchPicker
          catalogKey="festivals"
          groups={PROFILE_GROW_FESTIVAL_GROUPS}
          catalog={FESTIVAL_CATALOG}
          placeholder="フェスを検索"
          {...pickerProps}
        />
      );

    case "gear":
      return (
        <ProfileGrowSearchPicker
          catalogKey="gear"
          groups={PROFILE_GROW_GEAR_GROUPS}
          catalog={GEAR_CATALOG}
          placeholder="機材を検索"
          {...pickerProps}
        />
      );

    case "wantedGear":
      return (
        <ProfileGrowSearchPicker
          catalogKey="wanted_gear"
          groups={PROFILE_GROW_WANTED_GEAR_GROUPS}
          catalog={WANTED_GEAR_CATALOG}
          placeholder="欲しい機材を検索"
          {...pickerProps}
        />
      );

    case "production":
      return (
        <ProfileGrowSearchPicker
          catalogKey="production"
          groups={PROFILE_GROW_PRODUCTION_GROUPS}
          catalog={PRODUCTION_CATALOG}
          placeholder="DAWや制作機材を検索"
          {...pickerProps}
        />
      );

    case "style":
      return (
        <ProfileGrowSearchPicker
          catalogKey="style"
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
          catalogKey="artists"
          groups={[{ label: "Suggestions", items: [...WELCOME_ARTIST_CATALOG.slice(0, 12)] }]}
          catalog={WELCOME_ARTIST_CATALOG}
          {...pickerProps}
        />
      );
  }
}
