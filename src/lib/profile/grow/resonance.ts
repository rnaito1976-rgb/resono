import { getMembersPage } from "@/lib/members";
import { buildResonanceReason } from "@/lib/resonance/matching";
import type { ProfileGrowResonanceInsight } from "@/types/profile-grow";
import type { Member } from "@/types/member";

export async function compareProfileGrowResonance(
  before: Member,
  after: Member
): Promise<ProfileGrowResonanceInsight | null> {
  const page = await getMembersPage(0, 12);
  const targets = page.members.filter((member) => member.id !== after.id);

  let bestDelta = 0;
  let bestScore = 0;
  let bestPoints: string[] = [];

  for (const target of targets) {
    const previous = buildResonanceReason(before, target);
    const next = buildResonanceReason(after, target);
    const delta = next.score - previous.score;

    if (delta > bestDelta || (delta === bestDelta && next.score > bestScore)) {
      bestDelta = delta;
      bestScore = next.score;
      bestPoints =
        next.commonPoints.filter((point) => !previous.commonPoints.includes(point)).length > 0
          ? next.commonPoints.filter((point) => !previous.commonPoints.includes(point))
          : next.commonPoints;
    }
  }

  if (bestDelta <= 0 && bestPoints.length === 0) {
    return null;
  }

  // スコアが上がっていなくても、新しい共鳴ポイントがあれば Discover に出す
  if (bestDelta <= 0) {
    const fallback = targets
      .map((target) => buildResonanceReason(after, target))
      .sort((a, b) => b.score - a.score)[0];

    if (!fallback || fallback.commonPoints.length === 0) {
      return null;
    }

    return {
      scoreDelta: 0,
      score: fallback.score,
      commonPoints: fallback.commonPoints.slice(0, 5),
    };
  }

  return {
    scoreDelta: bestDelta,
    score: bestScore,
    commonPoints: bestPoints.slice(0, 5),
  };
}
