type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim()
  );
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    console.warn("[Email] RESEND_API_KEY or EMAIL_FROM is not configured.");
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[Email] Resend API error:", response.status, body);
    return false;
  }

  return true;
}
