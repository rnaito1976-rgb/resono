import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { getEmailSiteUrl } from "../src/lib/supabase/env";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY?.trim();
const emailFrom = process.env.EMAIL_FROM?.trim();
const memberQuery = process.argv[2]?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!memberQuery) {
  console.error("Usage: npx tsx scripts/send-test-email.ts <member-name-or-email>");
  process.exit(1);
}

if (!resendApiKey || !emailFrom) {
  console.error("Missing RESEND_API_KEY or EMAIL_FROM in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function resolveRecipientEmail(): Promise<{ name: string; email: string }> {
  if (memberQuery.includes("@")) {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) {
      throw new Error(error.message);
    }

    const user = data.users.find(
      (entry) => entry.email?.toLowerCase() === memberQuery.toLowerCase()
    );
    if (!user?.email) {
      throw new Error(`No auth user found for ${memberQuery}`);
    }

    const { data: member } = await supabase
      .from("members")
      .select("name")
      .eq("user_id", user.id)
      .maybeSingle();

    return { name: member?.name ?? memberQuery, email: user.email };
  }

  const { data: members, error } = await supabase
    .from("members")
    .select("id, name, user_id")
    .ilike("name", `%${memberQuery}%`);

  if (error) {
    throw new Error(error.message);
  }

  const member = members?.find((entry) => entry.name.toLowerCase() === memberQuery.toLowerCase())
    ?? members?.[0];

  if (!member?.user_id) {
    throw new Error(`No linked member found for "${memberQuery}"`);
  }

  const { data, error: userError } = await supabase.auth.admin.getUserById(member.user_id);
  if (userError || !data.user.email) {
    throw new Error(userError?.message ?? "Recipient email not found");
  }

  return { name: member.name, email: data.user.email };
}

async function sendTestEmail() {
  const recipient = await resolveRecipientEmail();
  const settingsUrl = getEmailSiteUrl();
  const subject = "Resono: テストメール";
  const body = `${recipient.name}さん、Resono のメール通知テストです。`;
  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #111;">
      <p>${body}</p>
      <p><a href="${settingsUrl}/menu/notifications" style="color: #111;">通知設定を確認する</a></p>
    </div>
  `.trim();
  const text = `${body}\n\n通知設定: ${settingsUrl}/menu/notifications`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [recipient.email],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`Resend API error (${response.status}): ${bodyText}`);
  }

  console.log(`Sent test email to ${recipient.name} (${recipient.email})`);
}

sendTestEmail().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
