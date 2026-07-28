import type { ResonanceReason } from "@/lib/resonance/matching";
import { isCurrentResonanceReason } from "@/lib/resonance/matching";
import { isMissingSchemaObject, logSupabaseError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type CacheRow = {
  target_member_id: string;
  score: number;
  reason: unknown;
};

function parseReason(raw: unknown, score: number): ResonanceReason | undefined {
  if (raw && typeof raw === "object" && "score" in raw) {
    const parsed = raw as ResonanceReason;
    if (isCurrentResonanceReason(parsed)) {
      return parsed;
    }
    return undefined;
  }

  if (!Number.isFinite(score)) {
    return undefined;
  }

  // 旧キャッシュは破棄して再計算させる
  return undefined;
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
    if (!isMissingSchemaObject(error, "resonance_match_cache")) {
      logSupabaseError("getResonanceReasonsFromCache", error);
    }
    return result;
  }

  for (const row of (data ?? []) as CacheRow[]) {
    const reason = parseReason(row.reason, row.score);
    if (reason) {
      result.set(row.target_member_id, reason);
    }
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
    if (!isMissingSchemaObject(error, "resonance_match_cache")) {
      logSupabaseError("saveResonanceReasonsToCache", error);
    }
  }
}

/** プロフィール更新時に関連キャッシュを無効化 */
export async function invalidateResonanceCacheForMember(
  memberId: string,
  options?: { clearAllFeeds?: boolean }
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("resonance_match_cache")
    .delete()
    .or(`viewer_member_id.eq.${memberId},target_member_id.eq.${memberId}`);

  if (error) {
    if (!isMissingSchemaObject(error, "resonance_match_cache")) {
      logSupabaseError("invalidateResonanceCacheForMember", error);
    }
  }

  void import("@/lib/members/feed-builder").then(({ clearRankedFeedCache }) => {
    clearRankedFeedCache(options?.clearAllFeeds ? undefined : memberId);
  });
}
