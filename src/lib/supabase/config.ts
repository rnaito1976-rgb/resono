export function getSupabaseConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return "Supabase の環境変数が設定されていません。";
  }

  if (url.includes("/rest/v1")) {
    return "Supabase URL が正しくありません。末尾の /rest/v1 は不要です。";
  }

  if (!url.startsWith("https://") || !url.includes(".supabase.co")) {
    return "Supabase URL の形式が正しくありません。";
  }

  return null;
}
