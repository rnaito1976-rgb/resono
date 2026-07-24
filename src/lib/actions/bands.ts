"use server";

import { revalidatePath } from "next/cache";
import { blendFrequencyColors } from "@/lib/frequency-color/utils";
import { getMemberByUserId } from "@/lib/members";
import { getMutualResonateMembers } from "@/lib/bands/queries";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { BandActivityKind } from "@/types/band";
import type { FrequencyColorHex } from "@/lib/frequency-color/types";

export async function createBandAction(input: {
  name: string;
  memberIds: string[];
}) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabaseが設定されていません。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const creator = await getMemberByUserId(user.id);
  if (!creator) {
    return { error: "プロフィールが見つかりません。" };
  }

  let creatorMemberId = creator.id;

  const { data: ownMemberRow, error: ownMemberError } = await supabase
    .from("members")
    .select("id, user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (ownMemberError) {
    console.error("[createBandAction] own member lookup:", ownMemberError.message);
  }

  if (ownMemberRow?.id) {
    creatorMemberId = ownMemberRow.id;
  } else if (!creator.userId) {
    const { data: linkedMember, error: linkError } = await supabase
      .from("members")
      .update({ user_id: user.id })
      .eq("id", creator.id)
      .select("id")
      .maybeSingle();

    if (linkError || !linkedMember?.id) {
      return { error: "プロフィールの紐付けに失敗しました。" };
    }

    creatorMemberId = linkedMember.id;
  }

  const selectedIds = [...new Set(input.memberIds)].filter(
    (id) => id !== creatorMemberId
  );

  if (selectedIds.length === 0) {
    return { error: "共鳴済みメンバーを1人以上選んでください。" };
  }

  const mutualMembers = await getMutualResonateMembers(creatorMemberId);
  const mutualIds = new Set(mutualMembers.map((item) => item.member.id));

  if (!selectedIds.every((id) => mutualIds.has(id))) {
    return { error: "共鳴済みメンバーのみ選択できます。" };
  }

  const name = input.name.trim();
  if (!name) {
    return { error: "Band名を入力してください。" };
  }

  const memberIds = [creatorMemberId, ...selectedIds];
  const colors = mutualMembers
    .filter((item) => selectedIds.includes(item.member.id) && item.frequencyColor)
    .map((item) => item.frequencyColor!)
    .slice(0, 3);

  let accentColor: FrequencyColorHex | undefined;
  if (colors.length >= 2) {
    accentColor = blendFrequencyColors(colors[0], colors[1]);
  } else if (colors.length === 1) {
    accentColor = colors[0];
  }

  const { data: band, error: bandError } = await supabase
    .from("bands")
    .insert({
      name,
      accent_color: accentColor ?? null,
      activity_status: "forming",
      created_by_member_id: creatorMemberId,
    })
    .select("id")
    .single();

  if (bandError || !band) {
    return { error: bandError?.message ?? "Bandの作成に失敗しました。" };
  }

  const { error: membersError } = await supabase.from("band_members").insert(
    memberIds.map((memberId) => ({
      band_id: band.id,
      member_id: memberId,
    }))
  );

  if (membersError) {
    return { error: membersError.message };
  }

  const now = new Date().toISOString();
  const timelineRows = [
    {
      band_id: band.id,
      kind: "band_formed",
      title: "Band結成",
      body: `${name} が始まりました。`,
      occurred_at: now,
    },
    ...selectedIds.map((memberId) => {
      const mutual = mutualMembers.find((item) => item.member.id === memberId);
      return {
        band_id: band.id,
        kind: "first_resonance",
        title: "初めて共鳴",
        body: `${mutual?.member.name ?? "メンバー"} との共鳴から。`,
        occurred_at: mutual?.resonatedAt ?? now,
      };
    }),
  ];

  const { error: timelineError } = await supabase
    .from("band_timeline_events")
    .insert(timelineRows);

  if (timelineError) {
    return { error: timelineError.message };
  }

  revalidatePath("/bands");
  revalidatePath(`/bands/${band.id}`);

  return { success: true, bandId: band.id };
}

export async function createBandActivityAction(input: {
  bandId: string;
  kind: BandActivityKind;
  body?: string;
  title?: string;
  mediaUrl?: string;
}) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabaseが設定されていません。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "ログインが必要です。" };
  }

  const member = await getMemberByUserId(user.id);
  if (!member) {
    return { error: "プロフィールが見つかりません。" };
  }

  const payload = {
    band_id: input.bandId,
    author_member_id: member.id,
    kind: input.kind,
    body: input.body?.trim() || null,
    title: input.title?.trim() || null,
    media_url: input.mediaUrl?.trim() || null,
  };

  const { data: activity, error } = await supabase
    .from("band_activities")
    .insert(payload)
    .select("id, kind, title, body")
    .single();

  if (error || !activity) {
    return { error: error?.message ?? "投稿に失敗しました。" };
  }

  const timelineKind =
    input.kind === "video" ? "video_added" : ("activity" as const);
  const timelineTitle =
    input.kind === "video"
      ? "演奏動画を追加"
      : input.kind === "photo"
        ? "写真を追加"
        : "Activity";

  await supabase.from("band_timeline_events").insert({
    band_id: input.bandId,
    kind: timelineKind,
    title: timelineTitle,
    body: activity.body ?? activity.title ?? undefined,
    activity_id: activity.id,
  });

  revalidatePath(`/bands/${input.bandId}`);
  return { success: true };
}
