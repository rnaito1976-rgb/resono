"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FrequencySpinner } from "@/components/frequency-color/FrequencySpinner";
import { ProfilePhotoClarity } from "@/components/profile-photo/ProfilePhotoClarity";
import { ProfilePhotoRingFrame } from "@/components/profile-photo/ProfilePhotoRingFrame";
import { ProfilePhotoSamples } from "@/components/profile-photo/ProfilePhotoSamples";
import { ProfilePhotoTips } from "@/components/profile-photo/ProfilePhotoTips";
import {
  getProfilePhotoSizes,
  getProfilePhotoSrc,
} from "@/lib/images/profilePhoto";
import {
  OPTIMIZING_MESSAGE,
  optimizeProfilePhoto,
  revokeOptimizedPreviewUrl,
  type PhotoClarityResult,
} from "@/lib/profile-photo";
import { uploadMemberPhoto } from "@/lib/storage";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";

type ProfilePhotoUploadProps = {
  memberId: string;
  value: string;
  frequencyColor?: FrequencyColorHex;
  onChange: (url: string) => void;
};

type UploadPhase = "idle" | "optimizing" | "uploading" | "ready";

export function ProfilePhotoUpload({
  memberId,
  value,
  frequencyColor,
  onChange,
}: ProfilePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clarity, setClarity] = useState<PhotoClarityResult | null>(null);
  const [ringVisible, setRingVisible] = useState(Boolean(value));
  const [error, setError] = useState<string | null>(null);

  const displayUrl = previewUrl ?? (value ? getProfilePhotoSrc(value, 800) : null);
  const isBusy = phase === "optimizing" || phase === "uploading";
  const showGuidance = !displayUrl;

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        revokeOptimizedPreviewUrl(previewRef.current);
      }
    };
  }, []);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError(null);
    setPhase("optimizing");
    setRingVisible(false);

    try {
      const optimized = await optimizeProfilePhoto(file);

      if (previewRef.current) {
        revokeOptimizedPreviewUrl(previewRef.current);
      }

      previewRef.current = optimized.previewUrl;
      setPreviewUrl(optimized.previewUrl);
      setClarity(optimized.clarity);

      setPhase("uploading");

      const uploadFile = new File([optimized.blob], "profile.jpg", {
        type: "image/jpeg",
      });
      const result = await uploadMemberPhoto(memberId, uploadFile);

      if (result.error || !result.url) {
        setError(result.error ?? "アップロードに失敗しました");
        setPhase("idle");
        return;
      }

      onChange(result.url);
      setPhase("ready");
      window.setTimeout(() => setRingVisible(true), 80);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "写真の処理に失敗しました"
      );
      setPhase("idle");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-8">
      <ProfilePhotoRingFrame
        color={frequencyColor}
        visible={ringVisible}
        className="mx-auto w-full max-w-[320px] rounded-[32px]"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-[32px] bg-white/[0.04]">
          {displayUrl ? (
            <Image
              key={displayUrl}
              src={displayUrl}
              alt="プロフィール写真"
              fill
              className="object-cover"
              sizes={getProfilePhotoSizes("card")}
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center">
              <p className="text-[14px] leading-relaxed text-white/40">
                あなたの世界観が伝わる一枚を選びましょう
              </p>
            </div>
          )}

          {isBusy ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0A0A0A]/72 px-8 text-center backdrop-blur-sm">
              <FrequencySpinner size={28} />
              <p className="text-[15px] leading-relaxed text-[#F6F6F6]/85">
                {OPTIMIZING_MESSAGE}
              </p>
            </div>
          ) : null}
        </div>
      </ProfilePhotoRingFrame>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        disabled={isBusy}
        onClick={() => inputRef.current?.click()}
        className="flex h-12 w-full items-center justify-center rounded-full border border-border bg-white/[0.03] text-[15px] font-medium text-[#F6F6F6] transition-opacity disabled:opacity-40"
      >
        {isBusy ? "処理しています..." : displayUrl ? "別の写真を選ぶ" : "写真を選ぶ"}
      </button>

      <p className="text-center text-[12px] text-white/40">
        正方形（1:1）に自動で最適化されます · 5MB以下
      </p>

      {clarity ? <ProfilePhotoClarity clarity={clarity} /> : null}

      {showGuidance ? (
        <>
          <ProfilePhotoSamples />
          <ProfilePhotoTips />
        </>
      ) : null}

      {error ? <p className="text-[13px] text-red-300">{error}</p> : null}
    </div>
  );
}
