"use client";

import { useMemo } from "react";
import { PersonCard } from "@/components/PersonCard";
import type { Member } from "@/types/member";

type WelcomeProfileBackdropProps = {
  members: Member[];
  visible?: boolean;
};

export function WelcomeProfileBackdrop({
  members,
  visible = true,
}: WelcomeProfileBackdropProps) {
  const scrollMembers = useMemo(() => {
    if (!members.length) {
      return [];
    }

    const featured = members.slice(0, 8);
    return [...featured, ...featured];
  }, [members]);

  if (!scrollMembers.length) {
    return null;
  }

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden blur-[0.4px] transition-opacity ease-in-out ${
        visible ? "opacity-90" : "opacity-0"
      }`}
      style={{ transitionDuration: "1200ms" }}
    >
      <div className="animate-welcome-scroll flex flex-col gap-5 px-5 pt-6">
        {scrollMembers.map((member, index) => (
          <PersonCard
            key={`${member.id}-${index}`}
            member={member}
            variant="ambient"
          />
        ))}
      </div>
    </div>
  );
}
