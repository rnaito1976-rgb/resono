"use client";

import { useRef, useState } from "react";
import { FormField, FormInput } from "@/components/FormField";
import {
  coverSongsToEditLines,
  createEmptyCoverSong,
  editLinesToCoverSongs,
  getCoverSongsForEditor,
} from "@/lib/music/cover-songs";
import type { CoverSong } from "@/types/music-profile";

type CoverSongsEditorProps = {
  memberId: string;
  value: CoverSong[] | undefined;
  onChange: (songs: CoverSong[] | undefined) => void;
};

export function CoverSongsEditor({
  memberId,
  value,
  onChange,
}: CoverSongsEditorProps) {
  const songsRef = useRef(getCoverSongsForEditor(value, memberId));
  const [lines, setLines] = useState(() => coverSongsToEditLines(value));

  function commit(nextLines: string[], nextSongs = songsRef.current) {
    const songs = [...nextSongs];

    while (songs.length < nextLines.length) {
      songs.push(createEmptyCoverSong(memberId));
    }

    const committed = editLinesToCoverSongs(nextLines, memberId, songs);
    songsRef.current = getCoverSongsForEditor(committed, memberId);
    onChange(committed);
  }

  function handleLineChange(index: number, raw: string) {
    const nextLines = lines.map((line, lineIndex) =>
      lineIndex === index ? raw : line
    );

    setLines(nextLines);
    commit(nextLines);
  }

  function handleAddRow() {
    const nextLines = [...lines, ""];
    const nextSongs = [...songsRef.current, createEmptyCoverSong(memberId)];

    songsRef.current = nextSongs;
    setLines(nextLines);
  }

  function handleRemoveRow(index: number) {
    let nextLines = lines.filter((_, lineIndex) => lineIndex !== index);
    let nextSongs = songsRef.current.filter((_, songIndex) => songIndex !== index);

    if (nextLines.length === 0) {
      nextLines = [""];
      nextSongs = [createEmptyCoverSong(memberId, 0)];
    }

    songsRef.current = nextSongs;
    setLines(nextLines);
    commit(nextLines, nextSongs);
  }

  return (
    <div className="space-y-4">
      {lines.map((line, index) => (
        <div
          key={songsRef.current[index]?.id ?? `cover-line-${index}`}
          className="flex items-end gap-3"
        >
          <div className="min-w-0 flex-1">
            <FormField
              label={index === 0 ? "曲" : `曲 ${index + 1}`}
              hint={index === 0 ? "アーティスト - 曲名" : undefined}
            >
              <FormInput
                value={line}
                placeholder="Muse - Plug in baby"
                onChange={(event) => handleLineChange(index, event.target.value)}
              />
            </FormField>
          </div>

          {lines.length > 1 || line.trim() ? (
            <button
              type="button"
              onClick={() => handleRemoveRow(index)}
              className="mb-3 shrink-0 rounded-full border border-border px-3 py-2 text-[13px] text-white/55 transition-quiet active:bg-white/[0.05]"
            >
              削除
            </button>
          ) : null}
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddRow}
        className="text-[14px] font-medium text-primary transition-quiet active:opacity-70"
      >
        曲を追加
      </button>
    </div>
  );
}
