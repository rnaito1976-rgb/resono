"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { SelectableChip } from "@/components/onboarding/SelectableChip";
import { WelcomePickerSection } from "@/components/welcome/WelcomePickerSection";
import { WELCOME_ARTIST_CATALOG, WELCOME_ARTIST_GROUPS } from "@/lib/welcome/onboarding-data";
import { cn } from "@/lib/utils";
import {
  WELCOME_ARTIST_MAX,
  WELCOME_ARTIST_MIN,
} from "@/types/welcome-onboarding";

type WelcomeArtistPickerProps = {
  selected: string[];
  onChange: (next: string[]) => void;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function WelcomeArtistPicker({ selected, onChange }: WelcomeArtistPickerProps) {
  const [query, setQuery] = useState("");

  const atMax = selected.length >= WELCOME_ARTIST_MAX;

  const filteredGroups = useMemo(() => {
    const normalized = normalize(query);

    return WELCOME_ARTIST_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((artist) => {
        if (selected.includes(artist)) {
          return false;
        }

        if (!normalized) {
          return true;
        }

        return normalize(artist).includes(normalized);
      }),
    })).filter((group) => group.items.length > 0);
  }, [query, selected]);

  const customCandidate = useMemo(() => {
    const value = query.trim();
    if (!value || atMax) {
      return null;
    }

    const exists =
      WELCOME_ARTIST_CATALOG.some((artist) => normalize(artist) === normalize(value)) ||
      selected.some((artist) => normalize(artist) === normalize(value));

    return exists ? null : value;
  }, [atMax, query, selected]);

  function addArtist(name: string) {
    const value = name.trim();
    if (!value || selected.includes(value) || selected.length >= WELCOME_ARTIST_MAX) {
      return;
    }

    onChange([...selected, value]);
    setQuery("");
  }

  function removeArtist(name: string) {
    onChange(selected.filter((artist) => artist !== name));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selected.map((artist) => (
            <button
              key={artist}
              type="button"
              onClick={() => removeArtist(artist)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/35 bg-[var(--frequency-color-soft)] px-3 py-1.5 text-[14px] text-foreground transition-quiet active:opacity-80"
            >
              {artist}
              <X className="h-3.5 w-3.5 opacity-70" strokeWidth={2} />
            </button>
          ))}
        </div>
      ) : null}

      <p className="text-[13px] text-white/45">
        {selected.length}/{WELCOME_ARTIST_MAX} 組選択中
        {selected.length < WELCOME_ARTIST_MIN
          ? ` · あと${WELCOME_ARTIST_MIN - selected.length}組以上`
          : null}
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-8 pb-2">
          {customCandidate ? (
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => addArtist(customCandidate)}
                className="rounded-full border border-dashed border-primary/40 px-4 py-2.5 text-[15px] text-primary transition-quiet active:opacity-85"
              >
                + {customCandidate}
              </button>
            </div>
          ) : null}

          {filteredGroups.map((group) => (
            <WelcomePickerSection key={group.label} label={group.label}>
              <div className="flex flex-wrap gap-2.5">
                {group.items.map((artist) => (
                  <SelectableChip
                    key={artist}
                    label={artist}
                    selected={false}
                    onToggle={() => !atMax && addArtist(artist)}
                  />
                ))}
              </div>
            </WelcomePickerSection>
          ))}

          {filteredGroups.length === 0 && !customCandidate ? (
            <p className="w-full px-1 py-2 text-[14px] text-white/45">
              該当するアーティストが見つかりません
            </p>
          ) : null}
        </div>
      </div>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="アーティストを検索"
        className={cn(
          "w-full shrink-0 rounded-2xl border border-border bg-subtle px-4 py-3.5 text-[16px] outline-none transition-quiet placeholder:text-muted focus:border-primary/35 focus:ring-1 focus:ring-primary/15",
          atMax && "opacity-60"
        )}
        disabled={atMax}
      />
    </div>
  );
}
