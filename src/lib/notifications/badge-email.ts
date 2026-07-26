import { getMemberById } from "@/lib/members";
import { isEmailConfigured, sendEmail } from "@/lib/notifications/send-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl, isSupabaseConfigured } from "@/lib/supabase/env";

const COOLDOWN_MINUTES = 30;

type BadgeEmailKind = "message" | "band" | "resonance";

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
  kind: BadgeEmailKind,
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
    console.error("[BadgeEmail] cooldown lookup:", error.message);
    return false;
  }

  return Boolean(data?.last_sent_at && data.last_sent_at > cutoff);
}

async function recordCooldown(
  memberId: string,
  kind: BadgeEmailKind,
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
    console.error("[BadgeEmail] cooldown record:", error.message);
  }
}

async function sendBadgeEmail(
  memberId: string,
  kind: BadgeEmailKind,
  scopeId: string,
  subject: string,
  body: string,
  actionUrl: string
): Promise<void> {
  if (!isSupabaseConfigured() || !isEmailConfigured()) {
    return;
  }

  if (await isWithinCooldown(memberId, kind, scopeId)) {
    return;
  }

  const email = await getEmailForMember(memberId);
  if (!email) {
    return;
  }

  const siteUrl = getSiteUrl();
  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #111;">
      <p>${body}</p>
      <p><a href="${actionUrl}" style="color: #111;">Resonoで確認する</a></p>
      <p style="color: #666; font-size: 12px;">このメールは Resono の未読通知です。</p>
    </div>
  `.trim();

  const text = `${body}\n\nResonoで確認する: ${actionUrl}`;

  const sent = await sendEmail({
    to: email,
    subject,
    html,
    text,
  });

  if (sent) {
    await recordCooldown(memberId, kind, scopeId);
  }
}

export async function notifyMessageBadgeEmail(input: {
  recipientMemberId: string;
  senderMemberId: string;
  conversationId: string;
}): Promise<void> {
  const sender = await getMemberById(input.senderMemberId);
  const senderName = sender?.name ?? "メンバー";

  await sendBadgeEmail(
    input.recipientMemberId,
    "message",
    input.conversationId,
    `Resono: ${senderName}さんから新しいメッセージ`,
    `${senderName}さんから新しいメッセージが届きました。`,
    `${getSiteUrl()}/messages/${input.conversationId}`
  );
}

export async function notifyBandBadgeEmail(input: {
  recipientMemberId: string;
  bandId: string;
  bandName: string;
  preview: string;
}): Promise<void> {
  await sendBadgeEmail(
    input.recipientMemberId,
    "band",
    input.bandId,
    `Resono: バンド「${input.bandName}」に新しいActivity`,
    `バンド「${input.bandName}」に新しいActivityがあります。${input.preview}`,
    `${getSiteUrl()}/bands/${input.bandId}`
  );
}

export async function notifyResonanceBadgeEmail(input: {
  recipientMemberId: string;
  senderMemberId: string;
  isMutual: boolean;
  conversationId?: string | null;
}): Promise<void> {
  const sender = await getMemberById(input.senderMemberId);
  const senderName = sender?.name ?? "メンバー";

  if (input.isMutual && input.conversationId) {
    await sendBadgeEmail(
      input.recipientMemberId,
      "resonance",
      input.senderMemberId,
      `Resono: ${senderName}さんとお互いに共鳴`,
      `${senderName}さんとお互いに共鳴しました。メッセージを送れます。`,
      `${getSiteUrl()}/messages/${input.conversationId}`
    );
    return;
  }

  await sendBadgeEmail(
    input.recipientMemberId,
    "resonance",
    input.senderMemberId,
    `Resono: ${senderName}さんから共鳴`,
    `${senderName}さんから共鳴が届きました。`,
    `${getSiteUrl()}/member/${input.senderMemberId}`
  );
}

export async function notifyBandMembersBadgeEmail(input: {
  bandId: string;
  bandName: string;
  preview: string;
  excludeMemberIds?: string[];
}): Promise<void> {
  const admin = createAdminClient();
  if (!admin) {
    return;
  }

  const { data: memberships, error } = await admin
    .from("band_members")
    .select("member_id")
    .eq("band_id", input.bandId);

  if (error) {
    console.error("[BadgeEmail] band members lookup:", error.message);
    return;
  }

  const excluded = new Set(input.excludeMemberIds ?? []);

  await Promise.all(
    (memberships ?? [])
      .filter((row) => !excluded.has(row.member_id))
      .map((row) =>
        notifyBandBadgeEmail({
          recipientMemberId: row.member_id,
          bandId: input.bandId,
          bandName: input.bandName,
          preview: input.preview,
        })
      )
  );
}
