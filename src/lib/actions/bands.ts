"use server";

import { revalidatePath } from "next/cache";
import { blendFrequencyColors } from "@/lib/frequency-color/utils";
import { getMemberByUserId } from "@/lib/members";
import { resolveCurrentMemberId } from "@/lib/members/resolve";
import { getMutualResonateMembers, getAddableMutualMembersForBand } from "@/lib/bands/queries";
import { parseArtistSongLine } from "@/lib/form";
import {
  type CoverSongEntry,
  normalizeCoverSongKey,
} from "@/lib/music/band-cover-songs";
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

  void import("@/lib/live/events").then(({ publishLiveEvent }) =>
    Promise.all([
      publishLiveEvent({
        kind: "new_band",
        title: name,
        subtitle: "新しいBandが登場",
        href: `/bands/${band.id}`,
        actorMemberId: creatorMemberId,
        bandId: band.id,
      }),
      publishLiveEvent({
        kind: "band_formed",
        title: name,
        subtitle: "Bandが結成されました",
        href: `/bands/${band.id}`,
        actorMemberId: creatorMemberId,
        bandId: band.id,
      }),
    ])
  );

  revalidatePath("/bands");
  revalidatePath("/");
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

  const body = input.body?.trim() || "";
  const title = input.title?.trim() || "";
  const mediaUrl = input.mediaUrl?.trim() || "";

  if (input.kind === "text") {
    if (!body) {
      return { error: "テキストを入力してください。" };
    }
  } else if (!mediaUrl) {
    return {
      error:
        input.kind === "photo"
          ? "写真を投稿するには、画像URLを入力してください。"
          : "動画を投稿するには、動画URLを入力してください。",
    };
  }

  const payload = {
    band_id: input.bandId,
    author_member_id: member.id,
    kind: input.kind,
    body: body || null,
    title: title || null,
    media_url: mediaUrl || null,
  };

  const { data: activity, error } = await supabase
    .from("band_activities")
    .insert(payload)
    .select("id, kind, title, body")
    .single();

  if (error || !activity) {
    if (error?.message.includes("band_activities_check")) {
      return {
        error:
          input.kind === "text"
            ? "テキストを入力してください。"
            : "画像または動画のURLを入力してください。",
      };
    }

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

  if (input.kind === "video") {
    void import("@/lib/live/events").then(({ publishLiveEvent }) =>
      publishLiveEvent({
        kind: "new_video",
        title: band?.name ?? "Band",
        subtitle: activity.title?.trim() || activity.body?.trim() || "演奏動画を追加",
        href: `/bands/${input.bandId}`,
        photo: input.mediaUrl?.trim() || undefined,
        actorMemberId: member.id,
        bandId: input.bandId,
      })
    );
  }

  revalidatePath("/");
  revalidatePath("/me");
  revalidatePath(`/bands/${input.bandId}`);
  return { success: true };
}

async function assertBandMembership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bandId: string,
  memberId: string
) {
  const { data: membership } = await supabase
    .from("band_members")
    .select("member_id")
    .eq("band_id", bandId)
    .eq("member_id", memberId)
    .maybeSingle();

  return Boolean(membership);
}

function normalizeCoverSongInput(raw: string): CoverSongEntry | null {
  const parsed = parseArtistSongLine(raw.trim());
  const title = parsed.title.trim();
  if (!title) {
    return null;
  }

  return {
    artist: parsed.artist?.trim() ?? "",
    title,
  };
}

export async function addBandCoverSongAction(input: {
  bandId: string;
  raw: string;
}) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabaseが設定されていません。" };
  }

  const song = normalizeCoverSongInput(input.raw);
  if (!song) {
    return { error: "曲名を入力してください。" };
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

  if (!(await assertBandMembership(supabase, input.bandId, member.id))) {
    return { error: "このBandのメンバーではありません。" };
  }

  const { error } = await supabase.from("band_cover_songs").insert({
    band_id: input.bandId,
    added_by_member_id: member.id,
    artist: song.artist,
    title: song.title,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "この曲はすでにSet Listにあります。" };
    }
    return { error: error.message };
  }

  revalidatePath(`/bands/${input.bandId}`);
  revalidatePath("/me");
  return { success: true };
}

export async function addBandCoverSongsAction(input: {
  bandId: string;
  songs: CoverSongEntry[];
}) {
  if (!isSupabaseConfigured()) {
    return { error: "Supabaseが設定されていません。" };
  }

  const songs = input.songs
    .map((song) => ({
      artist: song.artist.trim(),
      title: song.title.trim(),
    }))
    .filter((song) => song.title.length > 0);

  if (songs.length === 0) {
    return { error: "追加する曲がありません。" };
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

  if (!(await assertBandMembership(supabase, input.bandId, member.id))) {
    return { error: "このBandのメンバーではありません。" };
  }

  const { data: existingRows, error: existingError } = await supabase
    .from("band_cover_songs")
    .select("artist, title")
    .eq("band_id", input.bandId);

  if (existingError) {
    return { error: existingError.message };
  }

  const existingKeys = new Set(
    (existingRows ?? []).map((row) => normalizeCoverSongKey(row.artist, row.title))
  );
  const rows = songs
    .filter((song) => !existingKeys.has(normalizeCoverSongKey(song.artist, song.title)))
    .map((song) => ({
      band_id: input.bandId,
      added_by_member_id: member.id,
      artist: song.artist,
      title: song.title,
    }));

  if (rows.length === 0) {
    return { error: "選択した曲はすでにSet Listにあります。" };
  }

  const { error } = await supabase.from("band_cover_songs").insert(rows);
  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/bands/${input.bandId}`);
  revalidatePath("/me");
  return { success: true, addedCount: rows.length };
}

export async function removeBandCoverSongAction(input: {
  bandId: string;
  songId: string;
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

  if (!(await assertBandMembership(supabase, input.bandId, member.id))) {
    return { error: "このBandのメンバーではありません。" };
  }

  const { error } = await supabase
    .from("band_cover_songs")
    .delete()
    .eq("id", input.songId)
    .eq("band_id", input.bandId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/bands/${input.bandId}`);
  revalidatePath("/me");
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
