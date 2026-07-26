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
