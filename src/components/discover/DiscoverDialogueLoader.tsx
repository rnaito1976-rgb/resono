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
  member: Member;
};

export function DiscoverConversationLoader({ member }: DiscoverConversationLoaderProps) {
  return <ProfileConversationFlow member={member} />;
}
