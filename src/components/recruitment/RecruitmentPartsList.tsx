"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import {
  getMyRecruitmentApplicationsAction,
  getRecruitmentApplicantsAction,
  toggleRecruitmentApplicationAction,
} from "@/lib/actions/recruitment";
import { normalizeRecruitmentPart } from "@/lib/recruitment/part";
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
};

type ApplicantGroup = {
  part: string;
  applicants: { id: string; name: string }[];
};

export function RecruitmentPartsList({
  targetMemberId,
  parts,
  isOwnProfile = false,
  highlightedParts = [],
  variant = "chips",
  initialAppliedParts = [],
}: RecruitmentPartsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn } = useAuthUser();
  const loginHref = buildLoginHref(pathname);
  const [appliedParts, setAppliedParts] = useState<string[]>(initialAppliedParts);
  const [applicantGroups, setApplicantGroups] = useState<ApplicantGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const highlightedSet = useMemo(() => new Set(highlightedParts), [highlightedParts]);
  const appliedNormalized = useMemo(
    () => new Set(appliedParts.map(normalizeRecruitmentPart)),
    [appliedParts]
  );

  const applicantsByPart = useMemo(() => {
    const map = new Map<string, ApplicantGroup["applicants"]>();
    for (const group of applicantGroups) {
      map.set(normalizeRecruitmentPart(group.part), group.applicants);
    }
    return map;
  }, [applicantGroups]);

  useEffect(() => {
    setAppliedParts(initialAppliedParts);
  }, [initialAppliedParts, targetMemberId]);

  useEffect(() => {
    if (!isLoggedIn) {
      setAppliedParts([]);
      setApplicantGroups([]);
      return;
    }

    if (isOwnProfile) {
      void getRecruitmentApplicantsAction(targetMemberId).then((result) => {
        if ("parts" in result && result.parts) {
          setApplicantGroups(result.parts);
        }
      });
      return;
    }

    void getMyRecruitmentApplicationsAction(targetMemberId).then((result) => {
      setAppliedParts(result.appliedParts);
    });
  }, [isLoggedIn, isOwnProfile, targetMemberId]);

  function togglePart(part: string) {
    if (isOwnProfile || isPending) {
      return;
    }

    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await toggleRecruitmentApplicationAction({
        targetMemberId,
        part,
      });

      if ("error" in result && result.error) {
        if ("requiresLogin" in result && result.requiresLogin) {
          router.push(loginHref);
          return;
        }

        setError(result.error);
        return;
      }

      if (!("applied" in result)) {
        return;
      }

      const normalized = normalizeRecruitmentPart(part);

      setAppliedParts((current) => {
        if (result.applied) {
          if (current.some((item) => normalizeRecruitmentPart(item) === normalized)) {
            return current;
          }
          return [...current, part];
        }

        return current.filter((item) => normalizeRecruitmentPart(item) !== normalized);
      });
    });
  }

  if (parts.length === 0) {
    return null;
  }

  if (variant === "rows") {
    return (
      <div className="space-y-3">
        {parts.map((part) => {
          const isApplied = appliedNormalized.has(normalizeRecruitmentPart(part));
          const applicants = applicantsByPart.get(normalizeRecruitmentPart(part)) ?? [];

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
                  isOwnProfile && "cursor-default"
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
          const isHighlighted = highlightedSet.has(part);
          const isApplied = appliedNormalized.has(normalizeRecruitmentPart(part));
          const applicants = applicantsByPart.get(normalizeRecruitmentPart(part)) ?? [];

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
                  !isOwnProfile && "active:opacity-85"
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
