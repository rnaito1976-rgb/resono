"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ResonateButton } from "@/components/ResonateButton";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/useAuthUser";
import { buildLoginHref } from "@/lib/navigation/login-redirect";
import { useProfileSheetOptional } from "@/providers/ProfileSheetProvider";
import type { ResonanceStatus } from "@/lib/resonance/status";

type PersonCardFeedActionsProps = {
  memberId: string;
  resonanceStatus?: ResonanceStatus;
};

export function PersonCardFeedActions({
  memberId,
  resonanceStatus,
}: PersonCardFeedActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn } = useAuthUser();
  const profileSheet = useProfileSheetOptional();
  const loginHref = buildLoginHref(pathname);

  function handleLearnMore() {
    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }

    profileSheet?.openProfile(memberId);
  }

  return (
    <>
      <ResonateButton memberId={memberId} initialStatus={resonanceStatus} />
      {profileSheet ? (
        <Button
          type="button"
          variant="outline"
          className="w-full tracking-wide"
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
