import { getMemberById } from "@/lib/members";
import { isEmailNotificationEnabled } from "@/lib/notifications/preferences";
import { isEmailConfigured, sendEmail } from "@/lib/notifications/send-email";
import { calculateResonanceMatch, partsMatch } from "@/lib/resonance/matching";
import { createAdminClient } from "@/lib/supabase/admin";
import { rowToMemberList } from "@/lib/supabase/mappers";
import { MEMBER_LIST_COLUMNS } from "@/lib/supabase/member-columns";
import { getEmailSiteUrl, isSupabaseConfigured } from "@/lib/supabase/env";
import type { Member } from "@/types/member";

const COOLDOWN_MINUTES = 30;
const COMPATIBLE_SCORE_THRESHOLD = 55;
const MAX_RECIPIENTS = 25;

type EncounterEmailKind = "resonance_member" | "band_recruitment";

async function getEmailForMember(memberId: string): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  const { data: member, error: memberError } = await admin
    .from("members")
    .select("user_id")
    .eq("id", memberId)
    .maybeSingle();

  if (memberError || !member?.user_id) {
    return null;
  }

  const { data, error } = await admin.auth.admin.getUserById(member.user_id);
  if (error || !data.user.email) {
    return null;
  }

  return data.user.email;
}

async function isWithinCooldown(
  memberId: string,
  kind: EncounterEmailKind,
  scopeId: string
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) {
    return true;
  }

  const cutoff = new Date(Date.now() - COOLDOWN_MINUTES * 60 * 1000).toISOString();
  const { data, error } = await admin
    .from("badge_email_cooldowns")
    .select("last_sent_at")
    .eq("member_id", memberId)
    .eq("kind", kind)
    .eq("scope_id", scopeId)
    .maybeSingle();

  if (error) {
    console.error("[MatchEmail] cooldown lookup:", error.message);
    return false;
  }

  return Boolean(data?.last_sent_at && data.last_sent_at > cutoff);
}

async function recordCooldown(
  memberId: string,
  kind: EncounterEmailKind,
  scopeId: string
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) {
    return;
  }

  const { error } = await admin.from("badge_email_cooldowns").upsert(
    {
      member_id: memberId,
      kind,
      scope_id: scopeId,
      last_sent_at: new Date().toISOString(),
    },
    { onConflict: "member_id,kind,scope_id" }
  );

  if (error) {
    console.error("[MatchEmail] cooldown record:", error.message);
  }
}

type SendEncounterEmailOptions = {
  force?: boolean;
};

async function sendEncounterEmail(
  input: {
    recipientMemberId: string;
    kind: EncounterEmailKind;
    scopeId: string;
    preferenceKey: "resonanceMembers" | "bandRecruitment";
    subject: string;
    body: string;
    actionUrl: string;
  },
  options: SendEncounterEmailOptions = {}
): Promise<boolean> {
  if (!isSupabaseConfigured() || !isEmailConfigured()) {
    return false;
  }

  if (
    !options.force &&
    !(await isEmailNotificationEnabled(input.recipientMemberId, input.preferenceKey))
  ) {
    return false;
  }

  if (
    !options.force &&
    (await isWithinCooldown(input.recipientMemberId, input.kind, input.scopeId))
  ) {
    return false;
  }

  const email = await getEmailForMember(input.recipientMemberId);
  if (!email) {
    return false;
  }

  const settingsUrl = `${getEmailSiteUrl()}/menu/notifications`;
  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #111;">
      <p>${input.body}</p>
      <p><a href="${input.actionUrl}" style="color: #111;">Resonoで確認する</a></p>
      <p style="color: #666; font-size: 12px;">通知設定は<a href="${settingsUrl}" style="color: #666;">こちら</a>から変更できます。</p>
    </div>
  `.trim();

  const text = `${input.body}\n\nResonoで確認する: ${input.actionUrl}\n\n通知設定: ${settingsUrl}`;

  const sent = await sendEmail({
    to: email,
    subject: input.subject,
    html,
    text,
  });

  if (sent) {
    await recordCooldown(input.recipientMemberId, input.kind, input.scopeId);
  }

  return sent;
}

async function fetchRegisteredMembers(excludeMemberId: string): Promise<Member[]> {
  const admin = createAdminClient();
  if (!admin) {
    return [];
  }

  const { data, error } = await admin
    .from("members")
    .select(MEMBER_LIST_COLUMNS)
    .not("user_id", "is", null)
    .neq("id", excludeMemberId)
    .order("resonance_rate", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[MatchEmail] members lookup:", error.message);
    return [];
  }

  return (data ?? []).map(rowToMemberList);
}

function matchesRecruitment(recipient: Member, poster: Member): boolean {
  const recruitingParts = poster.lookingFor.parts.filter((part) => part.trim().length > 0);
  if (!recruitingParts.length) {
    return false;
  }

  const instruments = recipient.music.instruments ?? [];
  if (!instruments.length) {
    return false;
  }

  return recruitingParts.some((part) =>
    instruments.some((instrument) => partsMatch(instrument, part))
  );
}

export type BackfillNotificationEmailResult = {
  actorMemberId: string;
  actorName: string;
  sent: number;
  skipped: number;
};

export async function backfillNotificationEmailsForMember(
  actorMemberId: string,
  options: { force?: boolean } = { force: true }
): Promise<BackfillNotificationEmailResult> {
  const actor = await getMemberById(actorMemberId);
  if (!actor) {
    return {
      actorMemberId,
      actorName: actorMemberId,
      sent: 0,
      skipped: 0,
    };
  }

  let sent = 0;
  let skipped = 0;

  const candidates = await fetchRegisteredMembers(actorMemberId);
  const scored = candidates
    .map((recipient) => ({
      recipient,
      score: calculateResonanceMatch(recipient, actor),
    }))
    .filter(({ score }) => score >= COMPATIBLE_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RECIPIENTS);

  for (const { recipient, score } of scored) {
    const delivered = await sendEncounterEmail(
      {
        recipientMemberId: recipient.id,
        kind: "resonance_member",
        scopeId: actorMemberId,
        preferenceKey: "resonanceMembers",
        subject: "Resono: 相性の良いメンバーが参加しました",
        body: `${actor.name}さんがResonoに参加しました。共鳴度 ${score}%。プロフィールを見てみましょう。`,
        actionUrl: `${getEmailSiteUrl()}/member/${actorMemberId}`,
      },
      options
    );

    if (delivered) {
      sent += 1;
    } else {
      skipped += 1;
    }
  }

  if (actor.lookingFor.parts.some((part) => part.trim().length > 0)) {
    const partsLabel = actor.lookingFor.parts.slice(0, 3).join("・");
    const matched = candidates.filter((recipient) => matchesRecruitment(recipient, actor));

    for (const recipient of matched.slice(0, MAX_RECIPIENTS)) {
      const delivered = await sendEncounterEmail(
        {
          recipientMemberId: recipient.id,
          kind: "band_recruitment",
          scopeId: actorMemberId,
          preferenceKey: "bandRecruitment",
          subject: "Resono: あなたに合うバンド募集",
          body: `${actor.name}さんが${partsLabel}の募集を公開しました。`,
          actionUrl: `${getEmailSiteUrl()}/member/${actorMemberId}`,
        },
        options
      );

      if (delivered) {
        sent += 1;
      } else {
        skipped += 1;
      }
    }
  }

  return {
    actorMemberId,
    actorName: actor.name,
    sent,
    skipped,
  };
}

export async function notifyCompatibleMemberJoinedEmail(actorMemberId: string): Promise<void> {
  const actor = await getMemberById(actorMemberId);
  if (!actor) {
    return;
  }

  const candidates = await fetchRegisteredMembers(actorMemberId);
  const scored = candidates
    .map((recipient) => ({
      recipient,
      score: calculateResonanceMatch(recipient, actor),
    }))
    .filter(({ score }) => score >= COMPATIBLE_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RECIPIENTS);

  await Promise.all(
    scored.map(({ recipient, score }) =>
      sendEncounterEmail({
        recipientMemberId: recipient.id,
        kind: "resonance_member",
        scopeId: actorMemberId,
        preferenceKey: "resonanceMembers",
        subject: `Resono: 相性の良いメンバーが参加しました`,
        body: `${actor.name}さんがResonoに参加しました。共鳴度 ${score}%。プロフィールを見てみましょう。`,
        actionUrl: `${getEmailSiteUrl()}/member/${actorMemberId}`,
      })
    )
  );
}

export async function notifyCompatibleMemberUpdatedEmail(actorMemberId: string): Promise<void> {
  const actor = await getMemberById(actorMemberId);
  if (!actor) {
    return;
  }

  const candidates = await fetchRegisteredMembers(actorMemberId);
  const scored = candidates
    .map((recipient) => ({
      recipient,
      score: calculateResonanceMatch(recipient, actor),
    }))
    .filter(({ score }) => score >= COMPATIBLE_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RECIPIENTS);

  await Promise.all(
    scored.map(({ recipient, score }) =>
      sendEncounterEmail({
        recipientMemberId: recipient.id,
        kind: "resonance_member",
        scopeId: actorMemberId,
        preferenceKey: "resonanceMembers",
        subject: `Resono: 相性の良いメンバーがプロフィールを更新`,
        body: `${actor.name}さんがプロフィールを更新しました。共鳴度 ${score}%。`,
        actionUrl: `${getEmailSiteUrl()}/member/${actorMemberId}`,
      })
    )
  );
}

export async function notifyMatchingRecruitmentEmail(posterMemberId: string): Promise<void> {
  const poster = await getMemberById(posterMemberId);
  if (!poster || !poster.lookingFor.parts.some((part) => part.trim().length > 0)) {
    return;
  }

  const candidates = await fetchRegisteredMembers(posterMemberId);
  const partsLabel = poster.lookingFor.parts.slice(0, 3).join("・");

  const matched = candidates.filter((recipient) => matchesRecruitment(recipient, poster));

  await Promise.all(
    matched.slice(0, MAX_RECIPIENTS).map((recipient) =>
      sendEncounterEmail({
        recipientMemberId: recipient.id,
        kind: "band_recruitment",
        scopeId: posterMemberId,
        preferenceKey: "bandRecruitment",
        subject: `Resono: あなたに合うバンド募集`,
        body: `${poster.name}さんが${partsLabel}の募集を公開しました。`,
        actionUrl: `${getEmailSiteUrl()}/member/${posterMemberId}`,
      })
    )
  );
}
