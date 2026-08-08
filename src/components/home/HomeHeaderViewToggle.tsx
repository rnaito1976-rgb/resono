"use client";

import { MembersViewToggle } from "@/components/members/MembersViewToggle";
import { useMembersViewModeOptional } from "@/components/members/MembersViewProvider";

export function HomeHeaderViewToggle() {
  const context = useMembersViewModeOptional();
  if (!context) {
    return null;
  }

  const { viewMode, setViewMode } = context;

  return <MembersViewToggle value={viewMode} onChange={setViewMode} />;
}
