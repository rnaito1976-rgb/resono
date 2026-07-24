import type { ResonanceReason } from "@/lib/resonance/matching";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type CacheRow = {
  target_member_id: string;
  score: number;
  reason: unknown;
};

function parseReason(raw: unknown, score: number): ResonanceReason {
  if (raw && typeof raw === "object" && "score" in raw) {
    return raw as ResonanceReason;
  }

  return {
    score,
    commonPoints: [],
    aiComment: "",
  };
}

/** ⑬ DBキャッシュから共鳴理由を一括取得（ヒット分のみ返す） */
export async function getResonanceReasonsFromCache(
  viewerMemberId: string,
  targetMemberIds: string[]
): Promise<Map<string, ResonanceReason>> {
  const uniqueTargets = [...new Set(targetMemberIds.filter(Boolean))];
  const result = new Map<string, ResonanceReason>();

  if (!isSupabaseConfigured() || uniqueTargets.length === 0) {
    return result;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resonance_match_cache")
    .select("target_member_id, score, reason")
    .eq("viewer_member_id", viewerMemberId)
    .in("target_member_id", uniqueTargets);

  if (error) {
    console.error("[Supabase] getResonanceReasonsFromCache:", error.message);
    return result;
  }

  for (const row of (data ?? []) as CacheRow[]) {
    result.set(row.target_member_id, parseReason(row.reason, row.score));
  }

  return result;
}

/** ⑬ 計算済み共鳴理由をDBへ保存（upsert） */
export async function saveResonanceReasonsToCache(
  viewerMemberId: string,
  entries: Array<{ targetMemberId: string; reason: ResonanceReason }>
): Promise<void> {
  if (!isSupabaseConfigured() || entries.length === 0) {
    return;
  }

  const supabase = await createClient();
  const rows = entries.map(({ targetMemberId, reason }) => ({
    viewer_member_id: viewerMemberId,
    target_member_id: targetMemberId,
    score: reason.score,
    reason,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("resonance_match_cache")
    .upsert(rows, { onConflict: "viewer_member_id,target_member_id" });

  if (error) {
    console.error("[Supabase] saveResonanceReasonsToCache:", error.message);
  }
}

/** ⑬ プロフィール更新時に関連キャッシュを無効化 */
export async function invalidateResonanceCacheForMember(memberId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("resonance_match_cache")
    .delete()
    .or(`viewer_member_id.eq.${memberId},target_member_id.eq.${memberId}`);

  if (error) {
    console.error("[Supabase] invalidateResonanceCacheForMember:", error.message);
  }
}
