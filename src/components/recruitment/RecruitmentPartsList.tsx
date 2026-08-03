"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useRecruitmentApplications } from "@/hooks/useRecruitmentApplications";
import { useRecruitmentApplicants } from "@/hooks/useRecruitmentApplicants";
import { normalizeRecruitmentPart } from "@/lib/recruitment/part";
import type { RecruitmentPartApplicants } from "@/lib/recruitment/applications";
import { useAuthUser } from "@/hooks/useAuthUser";
import { buildLoginHref } from "@/lib/navigation/login-redirect";
import { cn } from "@/lib/utils";

type RecruitmentPartsListProps = {
  targetMemberId: string;
  parts: string[];
  isOwnProfile?: boolean;
  highlightedParts?: string[];
  variant?: "chips" | "rows";
  initialAppliedParts?: string[];
  initialApplicants?: RecruitmentPartApplicants[];
};

export function RecruitmentPartsList({
  targetMemberId,
  parts,
  isOwnProfile = false,
  highlightedParts = [],
  variant = "chips",
  initialAppliedParts = [],
  initialApplicants = [],
}: RecruitmentPartsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn } = useAuthUser();
  const loginHref = buildLoginHref(pathname);
  const [error, setError] = useState<string | null>(null);

  const { appliedParts, toggle, pendingParts } = useRecruitmentApplications(
    targetMemberId,
    initialAppliedParts
  );
  const { applicantGroups } = useRecruitmentApplicants(
    targetMemberId,
    initialApplicants
  );

  const highlightedSet = useMemo(() => new Set(highlightedParts), [highlightedParts]);
  const appliedNormalized = useMemo(
    () => new Set(appliedParts.map(normalizeRecruitmentPart)),
    [appliedParts]
  );

  const applicantsByPart = useMemo(() => {
    const map = new Map<string, RecruitmentPartApplicants["applicants"]>();
    for (const group of applicantGroups) {
      map.set(normalizeRecruitmentPart(group.part), group.applicants);
    }
    return map;
  }, [applicantGroups]);

  function togglePart(part: string) {
    if (isOwnProfile) {
      return;
    }

    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }

    setError(null);

    void toggle(part).then((result) => {
      if (result && "error" in result && result.error) {
        if ("requiresLogin" in result && result.requiresLogin) {
          router.push(loginHref);
          return;
        }

        setError(result.error);
      }
    });
  }

  if (parts.length === 0) {
    return null;
  }

  if (variant === "rows") {
    return (
      <div className="space-y-3">
        {parts.map((part) => {
          const normalized = normalizeRecruitmentPart(part);
          const isApplied = appliedNormalized.has(normalized);
          const isPending = pendingParts.has(normalized);
          const applicants = applicantsByPart.get(normalized) ?? [];

          return (
            <div key={part} className="space-y-2">
              <button
                type="button"
                disabled={isOwnProfile || isPending}
                onClick={() => togglePart(part)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-quiet",
                  isApplied
                    ? "border-primary/35 bg-primary/10"
                    : "border-border bg-white/5 active:opacity-85",
                  isOwnProfile && "cursor-default",
                  isPending && "opacity-70"
                )}
              >
                <span className="text-base font-medium">{part}</span>
                {isOwnProfile ? (
                  <span className="text-xs uppercase tracking-[0.15em] text-primary">
                    Open
                  </span>
                ) : isApplied ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-primary">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    応募済
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-[0.15em] text-primary">
                    Open
                  </span>
                )}
              </button>

              {isOwnProfile && applicants.length > 0 ? (
                <p className="px-1 text-[13px] text-white/50">
                  応募: {applicants.map((applicant) => applicant.name).join("、")}
                </p>
              ) : null}
            </div>
          );
        })}

        {error ? (
          <p className="text-[13px] text-red-400/90" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2">
        {parts.map((part) => {
          const normalized = normalizeRecruitmentPart(part);
          const isHighlighted = highlightedSet.has(part);
          const isApplied = appliedNormalized.has(normalized);
          const isPending = pendingParts.has(normalized);
          const applicants = applicantsByPart.get(normalized) ?? [];

          return (
            <div key={part} className="space-y-1">
              <button
                type="button"
                disabled={isOwnProfile || isPending}
                onClick={() => togglePart(part)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] transition-quiet",
                  isApplied
                    ? "border border-primary/40 bg-primary/10 text-white"
                    : isHighlighted
                      ? "border border-primary/40 bg-primary/10 text-white"
                      : "border border-border bg-white/[0.04] text-white/90",
                  !isOwnProfile && "active:opacity-85",
                  isPending && "opacity-70"
                )}
              >
                {part}
                {isOwnProfile ? (
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-primary/70">
                    Open
                  </span>
                ) : isApplied ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium tracking-wide text-primary">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                    応募済
                  </span>
                ) : (
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-[0.12em]",
                      isHighlighted ? "text-primary" : "text-primary/70"
                    )}
                  >
                    Open
                  </span>
                )}
              </button>

              {isOwnProfile && applicants.length > 0 ? (
                <p className="px-1 text-[12px] text-white/50">
                  応募: {applicants.map((applicant) => applicant.name).join("、")}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      {error ? (
        <p className="text-[13px] text-red-400/90" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
