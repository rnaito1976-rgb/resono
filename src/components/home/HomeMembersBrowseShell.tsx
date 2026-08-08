"use client";

import { MembersViewToggle } from "@/components/members/MembersViewToggle";
import { MembersViewProvider, useMembersViewMode } from "@/components/members/MembersViewProvider";
import type { ReactNode } from "react";

export function HomeMembersViewToggleBar() {
  const { viewMode, setViewMode } = useMembersViewMode();

  return (
    <div className="flex justify-end">
      <MembersViewToggle value={viewMode} onChange={setViewMode} />
    </div>
  );
}

export function HomeMembersBrowseProvider({ children }: { children: ReactNode }) {
  return <MembersViewProvider>{children}</MembersViewProvider>;
}
