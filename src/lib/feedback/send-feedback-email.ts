import { MENU_FEEDBACK } from "@/lib/menu/copy";
import {
  buildResonoEmailHtml,
  buildResonoEmailText,
  buildResonoQuoteBlock,
  escapeHtmlEmail,
} from "@/lib/notifications/email-template";
import { isEmailConfigured, sendEmail } from "@/lib/notifications/send-email";

export type FeedbackCategory = (typeof MENU_FEEDBACK.categories)[number]["id"];

const FEEDBACK_MAX_LENGTH = 5000;
const DEFAULT_FEEDBACK_RECIPIENTS = [
  "r.naito1976@gmail.com",
  "hello@resono.band",
] as const;

function parseEmailList(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function getFeedbackRecipientEmails(): string[] {
  const fromEnv = [
    ...parseEmailList(process.env.FEEDBACK_TO),
    ...parseEmailList(process.env.SUPPORT_EMAIL),
  ];

  if (fromEnv.length > 0) {
    return [...new Set(fromEnv)];
  }

  return [...DEFAULT_FEEDBACK_RECIPIENTS];
}

export function getFeedbackCategoryLabel(category: FeedbackCategory): string {
  return (
    MENU_FEEDBACK.categories.find((item) => item.id === category)?.label ?? category
  );
}

export function isFeedbackEmailConfigured(): boolean {
  return isEmailConfigured() && getFeedbackRecipientEmails().length > 0;
}

type SendFeedbackEmailInput = {
  category: FeedbackCategory;
  message: string;
  memberName?: string;
  memberEmail?: string;
  memberId?: string;
};

export async function sendFeedbackEmail(
  input: SendFeedbackEmailInput
): Promise<{ success: true } | { error: string }> {
  const message = input.message.trim();

  if (!message) {
    return { error: "内容を入力してください" };
  }

  if (message.length > FEEDBACK_MAX_LENGTH) {
    return { error: `内容は${FEEDBACK_MAX_LENGTH}文字以内で入力してください` };
  }

  if (!isFeedbackEmailConfigured()) {
    console.error("[Feedback] Email is not configured (RESEND_API_KEY, EMAIL_FROM, FEEDBACK_TO).");
    return {
      error: "送信設定が完了していません。時間をおいて再度お試しください。",
    };
  }

  const recipients = getFeedbackRecipientEmails();
  if (recipients.length === 0) {
    return {
      error: "送信先が設定されていません。時間をおいて再度お試しください。",
    };
  }

  const categoryLabel = getFeedbackCategoryLabel(input.category);
  const senderLabel = input.memberName?.trim() || "Resono member";
  const subjectPreview =
    message.length > 48 ? `${message.slice(0, 48)}…` : message;
  const subject = `[Resono Feedback] ${categoryLabel} — ${subjectPreview}`;

  const metaLines = [
    `カテゴリ: ${categoryLabel}`,
    `メンバー: ${senderLabel}`,
    input.memberId ? `Member ID: ${input.memberId}` : null,
    input.memberEmail ? `返信先: ${input.memberEmail}` : null,
  ].filter((line): line is string => Boolean(line));

  const text = buildResonoEmailText({
    title: categoryLabel,
    paragraphs: ["【フィードバック内容】", message, "", ...metaLines],
  });

  const html = buildResonoEmailHtml({
    preheader: message,
    eyebrow: "Feedback",
    title: categoryLabel,
    bodyHtml: buildResonoQuoteBlock(escapeHtmlEmail(message)),
    secondaryHtml: metaLines.map((line) => escapeHtmlEmail(line)).join("<br />"),
    footerNote: "Resono — ユーザーの声をもとに育っています。",
  });

  let sentCount = 0;

  for (const recipient of recipients) {
    const sent = await sendEmail({
      to: recipient,
      subject,
      html,
      text,
      replyTo: input.memberEmail,
    });

    if (sent) {
      sentCount += 1;
    }
  }

  if (sentCount === 0) {
    return { error: "送信に失敗しました。時間をおいて再度お試しください。" };
  }

  if (sentCount < recipients.length) {
    console.warn(
      `[Feedback] Partial delivery: ${sentCount}/${recipients.length} recipients`
    );
  }

  return { success: true };
}
