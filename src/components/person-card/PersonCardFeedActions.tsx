"use client";

import Link from "next/link";
import { ResonateButton } from "@/components/ResonateButton";
import { Button } from "@/components/ui/button";
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
  const profileSheet = useProfileSheetOptional();

  return (
    <>
      <ResonateButton memberId={memberId} initialStatus={resonanceStatus} />
      {profileSheet ? (
        <Button
          type="button"
          variant="outline"
          className="w-full tracking-wide"
          onClick={() => profileSheet.openProfile(memberId)}
        >
          もっと知る
        </Button>
      ) : (
        <Button asChild variant="outline" className="w-full tracking-wide">
          <Link href={`/member/${memberId}`}>もっと知る</Link>
        </Button>
      )}
    </>
  );
}
