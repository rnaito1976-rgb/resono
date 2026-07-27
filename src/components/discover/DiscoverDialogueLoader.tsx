"use client";

import { MinimalRegistrationFlow } from "@/components/onboarding/MinimalRegistrationFlow";
import dynamic from "next/dynamic";
import type { Member } from "@/types/member";

const ProfileConversationFlow = dynamic(
  () =>
    import("@/components/discover/ProfileConversationFlow").then((module) => ({
      default: module.ProfileConversationFlow,
    })),
  {
    loading: () => (
      <div className="mx-auto flex min-h-dvh max-w-mobile flex-col bg-black px-5 pb-8 pt-6">
        <div className="mb-4 mt-4 space-y-3">
          <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="h-8 w-56 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-[14px] text-white/45">読み込んでいます...</p>
        </div>
      </div>
    ),
  }
);

type OnboardingRegistrationLoaderProps = {
  memberId: string;
  initialPhase?: "registration" | "frequency";
  skipPhoto?: boolean;
};

export function OnboardingRegistrationLoader({
  memberId,
  initialPhase = "registration",
  skipPhoto = false,
}: OnboardingRegistrationLoaderProps) {
  return (
    <MinimalRegistrationFlow
      memberId={memberId}
      initialPhase={initialPhase}
      skipPhoto={skipPhoto}
    />
  );
}

type DiscoverConversationLoaderProps = {
  memberId: string;
  initialMember: Member;
};

export function DiscoverConversationLoader({
  memberId,
  initialMember,
}: DiscoverConversationLoaderProps) {
  return (
    <ProfileConversationFlow memberId={memberId} initialMember={initialMember} />
  );
}
