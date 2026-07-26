"use client";

import { useEffect } from "react";
import { MemberDetailFrame } from "@/components/member-detail/MemberDetailFrame";
import { MemberThemeScope } from "@/components/frequency-color/MemberThemeScope";
import { MemberDetailSkeleton } from "@/components/skeletons/MemberDetailSkeleton";
import { useMemberProfile } from "@/hooks/useMemberProfile";
import { PROFILE_SHEET_HEIGHT } from "@/lib/navigation/home-scroll";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";

type ProfileBottomSheetProps = {
  memberId: string | null;
  onClose: () => void;
};

/** ⑭ プロフィールをフルページ遷移せず Bottom Sheet で表示（200ms以内の体感遷移） */
export function ProfileBottomSheet({ memberId, onClose }: ProfileBottomSheetProps) {
  const { data, isLoading, isError } = useMemberProfile(memberId);

  useEffect(() => {
    if (!memberId) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [memberId, onClose]);

  if (!memberId) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end">
      <button
        type="button"
        aria-label="プロフィールを閉じる"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="プロフィール"
        className="relative mx-auto flex w-full max-w-mobile flex-col overflow-hidden rounded-t-[28px] bg-background shadow-2xl animate-in slide-in-from-bottom duration-200"
        style={{ height: PROFILE_SHEET_HEIGHT }}
      >
        <div className="flex shrink-0 justify-center pb-1 pt-3">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {isLoading ? (
          <MemberDetailSkeleton variant="sheet" />
        ) : isError || !data ? (
          <div className="px-6 py-16 text-center text-[14px] text-muted">
            プロフィールを読み込めませんでした
          </div>
        ) : data.isOwnProfile ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <MemberDetailFrame
              {...data}
              variant="sheet"
              onClose={onClose}
            />
          </div>
        ) : (
          <MemberThemeScope
            className="flex min-h-0 flex-1 flex-col"
            color={data.member.frequencyColor as FrequencyColorHex | undefined}
          >
            <MemberDetailFrame
              {...data}
              variant="sheet"
              onClose={onClose}
            />
          </MemberThemeScope>
        )}
      </div>
    </div>
  );
}
