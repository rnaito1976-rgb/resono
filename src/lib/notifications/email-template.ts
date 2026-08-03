export const RESONO_EMAIL_COLORS = {
  background: "#0a0a0a",
  card: "#111111",
  border: "#2e2e2e",
  foreground: "#f5f5f5",
  muted: "rgba(255,255,255,0.45)",
  subtle: "rgba(255,255,255,0.08)",
  primary: "#5ef2c8",
  primaryForeground: "#0a0a0a",
} as const;

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export function escapeHtmlEmail(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

type ResonoEmailCta = {
  label: string;
  href: string;
};

type BuildResonoEmailHtmlInput = {
  preheader?: string;
  eyebrow?: string;
  title?: string;
  bodyHtml: string;
  cta?: ResonoEmailCta;
  secondaryHtml?: string;
  footerNote?: string;
};

export function buildResonoEmailHtml(input: BuildResonoEmailHtmlInput): string {
  const preheader = input.preheader
    ? `<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtmlEmail(input.preheader)}</span>`
    : "";

  const eyebrow = input.eyebrow
    ? `<p style="margin:0 0 12px;font-size:11px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;color:${RESONO_EMAIL_COLORS.primary};">${escapeHtmlEmail(input.eyebrow)}</p>`
    : "";

  const title = input.title
    ? `<h1 style="margin:0 0 20px;font-size:22px;font-weight:400;letter-spacing:0.02em;line-height:1.5;color:${RESONO_EMAIL_COLORS.foreground};">${escapeHtmlEmail(input.title)}</h1>`
    : "";

  const cta = input.cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 0;">
        <tr>
          <td>
            <a href="${input.cta.href}" style="display:inline-block;padding:14px 28px;border-radius:999px;background:${RESONO_EMAIL_COLORS.primary};color:${RESONO_EMAIL_COLORS.primaryForeground};font-size:15px;font-weight:500;text-decoration:none;">
              ${escapeHtmlEmail(input.cta.label)}
            </a>
          </td>
        </tr>
      </table>`
    : "";

  const secondary = input.secondaryHtml
    ? `<div style="margin-top:24px;font-size:13px;line-height:1.7;color:${RESONO_EMAIL_COLORS.muted};">${input.secondaryHtml}</div>`
    : "";

  const footerNote = input.footerNote
    ? `<p style="margin:0;font-size:12px;line-height:1.7;color:${RESONO_EMAIL_COLORS.muted};">${input.footerNote}</p>`
    : `<p style="margin:0;font-size:12px;line-height:1.7;color:${RESONO_EMAIL_COLORS.muted};">Resono — 共鳴する仲間と、バンドを始めよう。</p>`;

  return `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Resono</title>
  </head>
  <body style="margin:0;padding:0;background:${RESONO_EMAIL_COLORS.background};">
    ${preheader}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${RESONO_EMAIL_COLORS.background};">
      <tr>
        <td align="center" style="padding:48px 20px 56px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
            <tr>
              <td align="center" style="padding:0 0 32px;">
                <span style="font-family:${FONT_STACK};font-size:26px;font-weight:500;letter-spacing:0.35em;color:${RESONO_EMAIL_COLORS.foreground};">RESONO</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px;border:1px solid ${RESONO_EMAIL_COLORS.border};border-radius:20px;background:${RESONO_EMAIL_COLORS.card};font-family:${FONT_STACK};">
                ${eyebrow}
                ${title}
                <div style="font-size:15px;line-height:1.85;color:${RESONO_EMAIL_COLORS.muted};">
                  ${input.bodyHtml}
                </div>
                ${cta}
                ${secondary}
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 8px 0;font-family:${FONT_STACK};">
                ${footerNote}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
}

export function buildResonoEmailText(input: {
  title?: string;
  paragraphs: string[];
  cta?: ResonoEmailCta;
  footerLines?: string[];
}): string {
  const lines = [
    "RESONO",
    "",
    ...(input.title ? [input.title, ""] : []),
    ...input.paragraphs,
  ];

  if (input.cta) {
    lines.push("", `${input.cta.label}: ${input.cta.href}`);
  }

  if (input.footerLines?.length) {
    lines.push("", ...input.footerLines);
  }

  lines.push("", "—", "Resono — 共鳴する仲間と、バンドを始めよう。");

  return lines.join("\n");
}

export function buildResonoBodyParagraph(text: string): string {
  return `<p style="margin:0 0 16px;color:${RESONO_EMAIL_COLORS.foreground};">${escapeHtmlEmail(text)}</p>`;
}

export function buildResonoMutedParagraph(text: string): string {
  return `<p style="margin:0 0 12px;color:${RESONO_EMAIL_COLORS.muted};">${escapeHtmlEmail(text)}</p>`;
}

export function buildResonoQuoteBlock(htmlContent: string): string {
  return `<div style="margin:20px 0 0;padding:18px 20px;border-radius:16px;background:${RESONO_EMAIL_COLORS.subtle};border:1px solid ${RESONO_EMAIL_COLORS.border};color:${RESONO_EMAIL_COLORS.foreground};font-size:15px;line-height:1.85;white-space:pre-wrap;">${htmlContent}</div>`;
}

export function buildResonoCodeBlock(code: string): string {
  return `<p style="margin:16px 0 0;padding:14px 16px;border-radius:12px;background:${RESONO_EMAIL_COLORS.subtle};border:1px solid ${RESONO_EMAIL_COLORS.border};font-size:14px;letter-spacing:0.12em;color:${RESONO_EMAIL_COLORS.foreground};">確認コード: ${escapeHtmlEmail(code)}</p>`;
}

export function buildResonoSettingsFooter(settingsUrl: string): {
  html: string;
  textLine: string;
} {
  return {
    html: `通知設定は <a href="${settingsUrl}" style="color:${RESONO_EMAIL_COLORS.primary};text-decoration:none;">こちら</a> から変更できます。`,
    textLine: `通知設定: ${settingsUrl}`,
  };
}

export function buildResonoInlineLink(
  href: string,
  label: string
): string {
  return `<a href="${href}" style="color:${RESONO_EMAIL_COLORS.primary};text-decoration:none;">${escapeHtmlEmail(label)}</a>`;
}
