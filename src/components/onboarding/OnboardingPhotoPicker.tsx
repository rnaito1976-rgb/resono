"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ProfilePhotoPlaceholder } from "@/components/profile/ProfilePhotoPlaceholder";
import { uploadMemberPhoto } from "@/lib/storage";
import { hasCustomPhotoUrl } from "@/lib/onboarding/status";

type OnboardingPhotoPickerProps = {
  memberId: string;
  value: string | undefined;
  onChange: (url: string) => void;
  onSkip?: () => void;
  skipped?: boolean;
};

export function OnboardingPhotoPicker({
  memberId,
  value,
  onChange,
  onSkip,
  skipped = false,
}: OnboardingPhotoPickerProps) {
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

  const hasPhoto = hasCustomPhotoUrl(value ?? "");

  return (
    <div className="space-y-6">
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="group relative mx-auto block aspect-square w-full max-w-[280px] overflow-hidden rounded-[32px] bg-subtle transition-transform active:scale-[0.99]"
      >
        {hasPhoto ? (
          <Image
            src={value ?? ""}
            alt="プロフィール写真"
            fill
            className="object-cover"
            sizes="280px"
          />
        ) : (
          <ProfilePhotoPlaceholder className="rounded-[32px]" />
        )}
        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/10 to-transparent p-6">
          <span className="rounded-full border border-border bg-black/40 px-5 py-2.5 text-[14px] font-medium text-white backdrop-blur-sm">
            {isUploading ? "アップロード中..." : hasPhoto ? "写真を変更" : "写真を選ぶ"}
          </span>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {onSkip ? (
        <button
          type="button"
          onClick={onSkip}
          className={`mx-auto block rounded-full border px-5 py-2.5 text-[14px] transition-quiet ${
            skipped
              ? "border-primary/40 bg-primary/10 text-foreground"
              : "border-border text-white/55 active:opacity-80"
          }`}
        >
          No image
        </button>
      ) : null}

      <p className="text-center text-[13px] leading-relaxed text-white/40">
        写真は任意です。No image を選べば、あとから追加できます。
      </p>

      {error ? <p className="text-center text-[13px] text-red-300">{error}</p> : null}
    </div>
  );
}
