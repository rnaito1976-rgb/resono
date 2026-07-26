"use server";

import { revalidatePath } from "next/cache";
import { blendFrequencyColors } from "@/lib/frequency-color/utils";
import { getMemberByUserId } from "@/lib/members";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import { getMutualResonateMembers, getAddableMutualMembersForBand } from "@/lib/bands/queries";
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

  void import("@/lib/notifications/badge-email").then(({ notifyBandMembersBadgeEmail }) =>
    notifyBandMembersBadgeEmail({
      bandId: band.id,
      bandName: name,
      preview: "Bandが結成されました。",
      excludeMemberIds: [creatorMemberId],
    }).catch((error) => {
      console.error("[BadgeEmail] band formed notification:", error);
    })
  );

  revalidatePath("/bands");
  revalidatePath("/me");
  revalidatePath(`/bands/${band.id}`);

  return { success: true, bandId: band.id };
}

export async function addBandMembersAction(input: {
  bandId: string;
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

  const actor = await getMemberByUserId(user.id);
  if (!actor) {
    return { error: "プロフィールが見つかりません。" };
  }

  const { data: membership } = await supabase
    .from("band_members")
    .select("member_id")
    .eq("band_id", input.bandId)
    .eq("member_id", actor.id)
    .maybeSingle();

  if (!membership) {
    return { error: "このBandのメンバーではありません。" };
  }

  const selectedIds = [...new Set(input.memberIds)].filter((id) => id !== actor.id);
  if (selectedIds.length === 0) {
    return { error: "追加するメンバーを選んでください。" };
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("band_members")
    .select("member_id")
    .eq("band_id", input.bandId);

  if (existingError) {
    return { error: existingError.message };
  }

  const existingIds = new Set((existingRows ?? []).map((row) => row.member_id));
  const newMemberIds = selectedIds.filter((id) => !existingIds.has(id));

  if (newMemberIds.length === 0) {
    return { error: "選択したメンバーはすでに参加しています。" };
  }

  const mutualMembers = await getMutualResonateMembers(actor.id);
  const mutualIds = new Set(mutualMembers.map((item) => item.member.id));

  if (!newMemberIds.every((id) => mutualIds.has(id))) {
    return { error: "共鳴済みメンバーのみ追加できます。" };
  }

  const { data: band, error: bandError } = await supabase
    .from("bands")
    .select("name")
    .eq("id", input.bandId)
    .maybeSingle();

  if (bandError || !band) {
    return { error: bandError?.message ?? "Bandが見つかりません。" };
  }

  const { error: insertError } = await supabase.from("band_members").insert(
    newMemberIds.map((memberId) => ({
      band_id: input.bandId,
      member_id: memberId,
    }))
  );

  if (insertError) {
    return { error: insertError.message };
  }

  const now = new Date().toISOString();
  const timelineRows = newMemberIds.map((memberId) => {
    const mutual = mutualMembers.find((item) => item.member.id === memberId);
    return {
      band_id: input.bandId,
      kind: "member_joined" as const,
      title: "メンバー加入",
      body: `${mutual?.member.name ?? "メンバー"} がBandに加わりました。`,
      occurred_at: now,
    };
  });

  const { error: timelineError } = await supabase
    .from("band_timeline_events")
    .insert(timelineRows);

  if (timelineError) {
    console.error("[addBandMembersAction] timeline:", timelineError.message);
  }

  void import("@/lib/notifications/badge-email").then(({ notifyBandMembersBadgeEmail }) =>
    notifyBandMembersBadgeEmail({
      bandId: input.bandId,
      bandName: band.name,
      preview: `${newMemberIds.length}人のメンバーが加わりました。`,
      excludeMemberIds: [actor.id, ...newMemberIds],
    }).catch((error) => {
      console.error("[BadgeEmail] band member added notification:", error);
    })
  );

  revalidatePath("/bands");
  revalidatePath("/me");
  revalidatePath(`/bands/${input.bandId}`);

  return { success: true, addedCount: newMemberIds.length };
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

  const { data: band } = await supabase
    .from("bands")
    .select("name")
    .eq("id", input.bandId)
    .maybeSingle();

  const preview =
    activity.body?.trim() ||
    activity.title?.trim() ||
    timelineTitle;

  void import("@/lib/notifications/badge-email").then(({ notifyBandMembersBadgeEmail }) =>
    notifyBandMembersBadgeEmail({
      bandId: input.bandId,
      bandName: band?.name ?? "Band",
      preview,
      excludeMemberIds: [member.id],
    }).catch((error) => {
      console.error("[BadgeEmail] band activity notification:", error);
    })
  );

  revalidatePath("/me");
  revalidatePath(`/bands/${input.bandId}`);
  return { success: true };
}

export async function getBandUnreadCountAction(): Promise<number> {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  const { getAuthSession } = await import("@/lib/supabase/auth");
  const { resolveCurrentMemberId } = await import("@/lib/members/resolve");
  const user = await getAuthSession();

  if (!user) {
    return 0;
  }

  const memberId = await resolveCurrentMemberId();
  if (!memberId) {
    return 0;
  }

  const { getBandUnreadCountForMember } = await import("@/lib/bands/unread");
  return getBandUnreadCountForMember(memberId);
}

export async function getBandUnreadSummaryAction(): Promise<
  import("@/lib/bands/unread").BandUnreadSummary
> {
  if (!isSupabaseConfigured()) {
    return { total: 0, byBandId: {} };
  }

  const { getAuthSession } = await import("@/lib/supabase/auth");
  const { resolveCurrentMemberId } = await import("@/lib/members/resolve");
  const user = await getAuthSession();

  if (!user) {
    return { total: 0, byBandId: {} };
  }

  const memberId = await resolveCurrentMemberId();
  if (!memberId) {
    return { total: 0, byBandId: {} };
  }

  const { getBandUnreadSummaryForMember } = await import("@/lib/bands/unread");
  return getBandUnreadSummaryForMember(memberId);
}

export async function markBandAsSeenAction(bandId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const member = await getMemberByUserId(user.id);
  if (!member) {
    return;
  }

  const { markBandAsSeen } = await import("@/lib/bands/unread");
  await markBandAsSeen(bandId, member.id);
  revalidatePath("/bands");
  revalidatePath("/me");
  revalidatePath(`/bands/${bandId}`);
}

export async function getAddableMutualMembersForBandAction(bandId: string) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabaseが設定されていません。", members: [] };
  }

  const memberId = await resolveCurrentMemberId();
  if (!memberId) {
    return { error: "ログインが必要です。", members: [] };
  }

  const members = await getAddableMutualMembersForBand(bandId, memberId);
  return { members };
}
