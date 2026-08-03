"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ResonateButton } from "@/components/ResonateButton";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/useAuthUser";
import { buildLoginHref } from "@/lib/navigation/login-redirect";
import { prefetchMemberProfile } from "@/lib/profile/prefetch";
import { useProfileSheetOptional } from "@/providers/ProfileSheetProvider";
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { ResonanceStatus } from "@/lib/resonance/status";
import type { Member } from "@/types/member";

type PersonCardFeedActionsProps = {
  memberId: string;
  member: Member;
  resonanceReason?: ResonanceReason;
  resonanceStatus?: ResonanceStatus;
};

export function PersonCardFeedActions({
  memberId,
  member,
  resonanceReason,
  resonanceStatus,
}: PersonCardFeedActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuthUser();
  const profileSheet = useProfileSheetOptional();
  const loginHref = buildLoginHref(pathname);

  function prefetchProfile() {
    if (!isLoggedIn) {
      return;
    }

    void prefetchMemberProfile(queryClient, memberId, { light: true });
  }

  function handleLearnMore() {
    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }

    profileSheet?.openProfile(memberId, {
      member,
      resonanceReason,
      resonanceStatus,
    });
  }

  return (
    <>
      <ResonateButton memberId={memberId} initialStatus={resonanceStatus} />
      {profileSheet ? (
        <Button
          type="button"
          variant="outline"
          className="w-full tracking-wide"
          onPointerEnter={prefetchProfile}
          onTouchStart={prefetchProfile}
          onClick={handleLearnMore}
        >
          もっと知る
        </Button>
      ) : (
        <Button asChild variant="outline" className="w-full tracking-wide">
          <Link href={isLoggedIn ? `/member/${memberId}` : loginHref}>もっと知る</Link>
        </Button>
      )}
    </>
  );
}
