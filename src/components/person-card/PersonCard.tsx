import { PersonCardContent } from "@/components/person-card/PersonCardContent";
import { PersonCardFeedActions } from "@/components/person-card/PersonCardFeedActions";
import { PersonCardOwnLinks } from "@/components/person-card/PersonCardOwnLinks";
import type { PersonCardData } from "@/components/person-card/types";

/** Server-rendered person card; only action buttons hydrate on client. */
export function PersonCard({
  member,
  variant = "default",
  recommendation,
  resonanceReason,
  resonanceStatus,
  isOwnCard = false,
  priority = false,
  initialAppliedParts,
  initialRecruitmentApplicants,
}: PersonCardData) {
  const actions = isOwnCard ? (
    <PersonCardOwnLinks />
  ) : (
    <PersonCardFeedActions
      memberId={member.id}
      member={member}
      resonanceReason={resonanceReason}
      resonanceStatus={resonanceStatus}
    />
  );

  return (
    <PersonCardContent
      member={member}
      variant={variant}
      recommendation={recommendation}
      resonanceReason={resonanceReason}
      isOwnCard={isOwnCard}
      priority={priority}
      actions={actions}
      initialAppliedParts={initialAppliedParts}
      initialRecruitmentApplicants={initialRecruitmentApplicants}
    />
  );
}
