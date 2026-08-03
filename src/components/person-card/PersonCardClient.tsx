"use client";

import { memo } from "react";
import { PersonCardContent } from "@/components/person-card/PersonCardContent";
import { PersonCardFeedActions } from "@/components/person-card/PersonCardFeedActions";
import { PersonCardOwnLinks } from "@/components/person-card/PersonCardOwnLinks";
import type { PersonCardData } from "@/components/person-card/types";

/** Client bundle for cards loaded after initial SSR (infinite scroll). */
function PersonCardClientComponent(props: PersonCardData) {
  const { member, isOwnCard = false, resonanceReason, resonanceStatus } = props;
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

  return <PersonCardContent {...props} actions={actions} />;
}

export const PersonCardClient = memo(PersonCardClientComponent);
