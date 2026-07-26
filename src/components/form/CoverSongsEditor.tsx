"use client";

import { FormField, FormInput } from "@/components/FormField";
import {
  addCoverSongRow,
  formatCoverSongForEdit,
  getCoverSongsForEditor,
  hasCoverSongContent,
  removeCoverSongRow,
  updateCoverSongFromEdit,
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
  const rows = getCoverSongsForEditor(value, memberId);

  function emit(nextRows: CoverSong[]) {
    onChange(nextRows.length > 0 ? nextRows : undefined);
  }

  function handleLineChange(index: number, raw: string) {
    emit(updateCoverSongFromEdit(rows, index, raw));
  }

  function handleAddRow() {
    onChange(addCoverSongRow(rows, memberId));
  }

  function handleRemoveRow(index: number) {
    emit(removeCoverSongRow(rows, index));
  }

  return (
    <div className="space-y-4">
      {rows.map((song, index) => (
        <div key={song.id} className="flex items-end gap-3">
          <div className="min-w-0 flex-1">
            <FormField
              label={index === 0 ? "曲" : `曲 ${index + 1}`}
              hint={index === 0 ? "アーティスト - 曲名" : undefined}
            >
              <FormInput
                value={formatCoverSongForEdit(song)}
                placeholder="Muse - Plug in baby"
                onChange={(event) => handleLineChange(index, event.target.value)}
              />
            </FormField>
          </div>

          {rows.length > 1 || hasCoverSongContent(song) ? (
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
