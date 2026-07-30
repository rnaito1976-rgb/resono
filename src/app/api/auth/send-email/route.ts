import { NextResponse, type NextRequest } from "next/server";
import { Webhook } from "standardwebhooks";
import {
  buildAuthEmailBodies,
  buildAuthEmailConfirmationUrl,
  getSendEmailHookSecret,
  type AuthEmailHookPayload,
} from "@/lib/auth/send-email-hook";
import { isEmailConfigured, sendEmail } from "@/lib/notifications/send-email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isEmailConfigured()) {
    console.error("[Auth send-email hook] RESEND is not configured");
    return NextResponse.json(
      { error: { message: "Email provider is not configured" } },
      { status: 500 }
    );
  }

  const hookSecret = getSendEmailHookSecret();
  if (!hookSecret) {
    console.error("[Auth send-email hook] SEND_EMAIL_HOOK_SECRET is missing");
    return NextResponse.json(
      { error: { message: "Hook secret is not configured" } },
      { status: 500 }
    );
  }

  const payload = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  let verified: AuthEmailHookPayload;
  try {
    const wh = new Webhook(hookSecret);
    verified = wh.verify(payload, headers) as AuthEmailHookPayload;
  } catch (error) {
    console.error("[Auth send-email hook] signature verification failed:", error);
    return NextResponse.json(
      { error: { message: "Invalid hook signature" } },
      { status: 401 }
    );
  }

  const { user, email_data: emailData } = verified;
  const recipient = user.email?.trim();

  if (!recipient || !emailData?.token_hash || !emailData.email_action_type) {
    return NextResponse.json(
      { error: { message: "Invalid hook payload" } },
      { status: 400 }
    );
  }

  const confirmationUrl = buildAuthEmailConfirmationUrl(emailData);
  const { subject, html, text } = buildAuthEmailBodies({
    actionType: emailData.email_action_type,
    recipientEmail: recipient,
    confirmationUrl,
    token: emailData.token,
  });

  const sent = await sendEmail({
    to: recipient,
    subject,
    html,
    text,
  });

  if (!sent) {
    return NextResponse.json(
      { error: { message: "Failed to send auth email" } },
      { status: 500 }
    );
  }

  return NextResponse.json({});
}
