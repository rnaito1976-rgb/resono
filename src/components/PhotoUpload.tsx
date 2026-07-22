"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FormField } from "@/components/FormField";
import { uploadMemberPhoto } from "@/lib/storage";

type PhotoUploadProps = {
  memberId: string;
  value: string;
  onChange: (url: string) => void;
};

export function PhotoUpload({ memberId, value, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    const result = await uploadMemberPhoto(memberId, file);

    setIsUploading(false);
    event.target.value = "";

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.url) {
      onChange(result.url);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-subtle">
        <Image
          src={value}
          alt="プロフィール写真"
          fill
          className="object-cover"
          sizes="390px"
        />
        {isUploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <p className="text-sm text-white/80">アップロード中...</p>
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="flex h-12 w-full items-center justify-center rounded-full border border-white/15 text-[15px] font-medium text-white transition-opacity disabled:opacity-40"
      >
        {isUploading ? "アップロード中..." : "写真を選ぶ"}
      </button>

      <FormField label="または URL を入力">
        <input
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/25"
          required
        />
      </FormField>

      {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
    </div>
  );
}
