import type { EmailOtpType } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/supabase/env";

export type AuthEmailHookPayload = {
  user: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
};

const SUBJECTS: Partial<Record<string, string>> = {
  signup: "Resono: メールアドレスの確認",
  recovery: "Resono: パスワードの再設定",
  magiclink: "Resono: ログインリンク",
  email_change: "Resono: 新しいメールアドレスの確認",
  invite: "Resono: 招待",
};

export function getAuthEmailSubject(actionType: string): string {
  return SUBJECTS[actionType] ?? "Resono: 認証メール";
}

export function buildAuthEmailConfirmationUrl(
  emailData: AuthEmailHookPayload["email_data"]
): string {
  const redirectTarget = emailData.redirect_to?.trim() || `${getSiteUrl()}/auth/callback`;
  const url = new URL(redirectTarget);
  url.searchParams.set("token_hash", emailData.token_hash);
  url.searchParams.set("type", emailData.email_action_type);
  return url.toString();
}

export function buildAuthEmailBodies(input: {
  actionType: string;
  recipientEmail: string;
  confirmationUrl: string;
  token: string;
}): { subject: string; html: string; text: string } {
  const subject = getAuthEmailSubject(input.actionType);
  const intro =
    input.actionType === "signup"
      ? "Resono へようこそ。メールアドレスを確認してください。"
      : input.actionType === "recovery"
        ? "Resono のパスワード再設定リクエストを受け付けました。"
        : "Resono の認証メールです。";

  const html = `
    <div style="font-family: sans-serif; line-height: 1.7; color: #111;">
      <p>${intro}</p>
      <p><a href="${input.confirmationUrl}" style="color: #111;">こちらをクリックして続行</a></p>
      <p style="color: #666; font-size: 13px;">確認コード: ${input.token}</p>
      <p style="color: #666; font-size: 12px;">心当たりがない場合はこのメールを無視してください。</p>
    </div>
  `.trim();

  const text = `${intro}\n\n${input.confirmationUrl}\n\n確認コード: ${input.token}`;

  return { subject, html, text };
}

export function toEmailOtpType(value: string): EmailOtpType | null {
  const allowed: EmailOtpType[] = [
    "signup",
    "invite",
    "magiclink",
    "recovery",
    "email_change",
    "email",
  ];

  return allowed.includes(value as EmailOtpType) ? (value as EmailOtpType) : null;
}

export function getSendEmailHookSecret(): string | null {
  const raw = process.env.SEND_EMAIL_HOOK_SECRET?.trim();
  if (!raw) {
    return null;
  }

  return raw.replace(/^v1,whsec_/, "");
}
