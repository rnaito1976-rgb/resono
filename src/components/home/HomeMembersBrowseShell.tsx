"use client";

import { MembersViewProvider } from "@/components/members/MembersViewProvider";
import type { ReactNode } from "react";

export function HomeMembersBrowseProvider({ children }: { children: ReactNode }) {
  return <MembersViewProvider>{children}</MembersViewProvider>;
}
