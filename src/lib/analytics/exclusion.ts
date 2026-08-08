import type { User } from "@supabase/supabase-js";

export const GA_OPT_OUT_STORAGE_KEY = "resono:ga-opt-out";

function parseCsv(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** Server-side: skip GA for listed auth users (set GA_EXCLUDED_USER_EMAILS or GA_EXCLUDED_USER_IDS). */
export function shouldExcludeUserFromAnalytics(user: User | null): boolean {
  if (!user) {
    return false;
  }

  const excludedIds = parseCsv(process.env.GA_EXCLUDED_USER_IDS);
  if (excludedIds.includes(user.id)) {
    return true;
  }

  const excludedEmails = parseCsv(process.env.GA_EXCLUDED_USER_EMAILS).map((email) =>
    email.toLowerCase(),
  );
  if (user.email && excludedEmails.includes(user.email.toLowerCase())) {
    return true;
  }

  return false;
}
