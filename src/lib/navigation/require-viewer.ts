import { redirect } from "next/navigation";
import { cache } from "react";
import { getMemberOnboardingState } from "@/lib/members/onboarding-state";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import { getAuthSession } from "@/lib/supabase/auth";
import type { User } from "@supabase/supabase-js";

type RequireViewerOptions = {
  loginNext?: string;
};

export type TabViewer = {
  user: User;
  memberId: string;
};

const resolveTabViewer = cache(async (): Promise<TabViewer> => {
  const user = await getAuthSession();

  if (!user) {
    redirect("/login");
  }

  const memberId = await resolveCurrentMemberId();
  if (!memberId) {
    redirect("/onboarding");
  }

  const onboarding = await getMemberOnboardingState(user.id, memberId);
  if (!onboarding.complete) {
    redirect("/onboarding");
  }

  return { user, memberId };
});

/** Cached viewer load shared across tab routes in one request. */
export async function getTabViewer(): Promise<TabViewer> {
  return resolveTabViewer();
}

/** Fast auth gate for tab routes (session cookie + member id only). */
export async function requireViewer(
  options: RequireViewerOptions = {}
): Promise<TabViewer> {
  const user = await getAuthSession();

  if (!user) {
    redirect(options.loginNext ? `/login?next=${options.loginNext}` : "/login");
  }

  return resolveTabViewer();
}
