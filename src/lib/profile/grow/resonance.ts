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
  let bestPoints: string[] = [];

  for (const target of targets) {
    const previous = buildResonanceReason(before, target);
    const next = buildResonanceReason(after, target);
    const delta = next.score - previous.score;

    if (delta > bestDelta) {
      bestDelta = delta;
      bestPoints = next.commonPoints.filter(
        (point) => !previous.commonPoints.includes(point)
      );
    }
  }

  if (bestDelta <= 0) {
    return null;
  }

  return {
    scoreDelta: bestDelta,
    commonPoints: bestPoints.slice(0, 3),
  };
}
