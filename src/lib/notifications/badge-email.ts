import { getMemberById } from "@/lib/members";
import {
  buildResonoBodyParagraph,
  buildResonoEmailHtml,
  buildResonoEmailText,
  buildResonoSettingsFooter,
} from "@/lib/notifications/email-template";
import { isEmailNotificationEnabled } from "@/lib/notifications/preferences";
import { isEmailConfigured, sendEmail } from "@/lib/notifications/send-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEmailSiteUrl, isSupabaseConfigured } from "@/lib/supabase/env";

type BadgeEmailKind = "message";

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

async function hasAlreadySent(
  memberId: string,
  kind: BadgeEmailKind,
  scopeId: string
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) {
    return true;
  }

  const { data, error } = await admin
    .from("badge_email_cooldowns")
    .select("member_id")
    .eq("member_id", memberId)
    .eq("kind", kind)
    .eq("scope_id", scopeId)
    .maybeSingle();

  if (error) {
    console.error("[BadgeEmail] sent lookup:", error.message);
    return false;
  }

  return Boolean(data);
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

  if (!(await isEmailNotificationEnabled(memberId, "messages"))) {
    return;
  }

  if (await hasAlreadySent(memberId, kind, scopeId)) {
    return;
  }

  const email = await getEmailForMember(memberId);
  if (!email) {
    return;
  }

  const settingsUrl = `${getEmailSiteUrl()}/menu/notifications`;
  const settingsFooter = buildResonoSettingsFooter(settingsUrl);
  const html = buildResonoEmailHtml({
    preheader: body,
    eyebrow: "Message",
    bodyHtml: buildResonoBodyParagraph(body),
    cta: {
      label: "Resonoで確認する",
      href: actionUrl,
    },
    secondaryHtml: settingsFooter.html,
  });

  const text = buildResonoEmailText({
    paragraphs: [body],
    cta: {
      label: "Resonoで確認する",
      href: actionUrl,
    },
    footerLines: [settingsFooter.textLine],
  });

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
  messageId: string;
}): Promise<void> {
  const sender = await getMemberById(input.senderMemberId);
  const senderName = sender?.name ?? "メンバー";

  await sendBadgeEmail(
    input.recipientMemberId,
    "message",
    input.messageId,
    `Resono: ${senderName}さんから新しいメッセージ`,
    `${senderName}さんから新しいメッセージが届きました。`,
    `${getEmailSiteUrl()}/messages/${input.conversationId}`
  );
}
