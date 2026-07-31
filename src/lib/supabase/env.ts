export function getSupabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    ""
  ).trim();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

const PRODUCTION_SITE_URL = "https://resono-fwdi.vercel.app";

function normalizeSiteUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function isLocalSiteUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/** Outbound email links should never fall back to localhost. */
export function getEmailSiteUrl(): string {
  const emailExplicit = process.env.EMAIL_SITE_URL?.trim();
  if (emailExplicit) {
    return normalizeSiteUrl(emailExplicit);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl && !isLocalSiteUrl(siteUrl)) {
    return normalizeSiteUrl(siteUrl);
  }

  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return normalizeSiteUrl(`https://${vercelUrl}`);
  }

  return PRODUCTION_SITE_URL;
}

export function getSiteUrl(): string {
  if (process.env.NODE_ENV === "development") {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (explicit) {
      return explicit.replace(/\/$/, "");
    }

    const port = process.env.PORT?.trim() || "3001";
    return `http://localhost:${port}`;
  }

  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  if (process.env.VERCEL_ENV === "production") {
    return "https://resono-fwdi.vercel.app";
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl.replace(/\/$/, "")}`;
  }

  const port = process.env.PORT?.trim() || "3000";
  return `http://localhost:${port}`;
}

export function getEmailRedirectUrl(): string {
  return `${getSiteUrl()}/auth/callback`;
}
