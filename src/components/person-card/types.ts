import type { RecommendationResult } from "@/lib/recommendation/scoring";
import type { ResonanceReason } from "@/lib/resonance/matching";
import type { ResonanceStatus } from "@/lib/resonance/status";
import type { Member } from "@/types/member";

export type PersonCardData = {
  member: Member;
  variant?: "default" | "ambient";
  recommendation?: RecommendationResult;
  resonanceReason?: ResonanceReason;
  resonanceStatus?: ResonanceStatus;
  isOwnCard?: boolean;
  priority?: boolean;
};
