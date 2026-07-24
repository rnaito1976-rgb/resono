"use client";

import dynamic from "next/dynamic";
import type { Member } from "@/types/member";

const MinimalRegistrationFlow = dynamic(
  () =>
    import("@/components/onboarding/MinimalRegistrationFlow").then((module) => ({
      default: module.MinimalRegistrationFlow,
    })),
  {
    loading: () => (
      <div className="mx-auto flex min-h-dvh max-w-mobile items-center justify-center bg-background px-6">
        <p className="text-[14px] text-white/45">読み込んでいます...</p>
      </div>
    ),
    ssr: false,
  }
);

const ProfileConversationFlow = dynamic(
  () =>
    import("@/components/discover/ProfileConversationFlow").then((module) => ({
      default: module.ProfileConversationFlow,
    })),
  {
    loading: () => (
      <div className="mx-auto flex min-h-dvh max-w-mobile items-center justify-center bg-background px-6">
        <p className="text-[14px] text-white/45">読み込んでいます...</p>
      </div>
    ),
    ssr: false,
  }
);

type OnboardingRegistrationLoaderProps = {
  memberId: string;
  initialPhase?: "registration" | "frequency";
};

export function OnboardingRegistrationLoader({
  memberId,
  initialPhase = "registration",
}: OnboardingRegistrationLoaderProps) {
  return <MinimalRegistrationFlow memberId={memberId} initialPhase={initialPhase} />;
}

type DiscoverConversationLoaderProps = {
  member: Member;
};

export function DiscoverConversationLoader({ member }: DiscoverConversationLoaderProps) {
  return <ProfileConversationFlow member={member} />;
}
