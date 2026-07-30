import { translateAuthError } from "@/lib/auth/email";

const AUTH_REASON_MESSAGES: Record<string, string> = {
  missing_code: "認証コードが取得できませんでした。もう一度ログインしてください。",
  server_error: "認証サーバーでエラーが発生しました。しばらくしてからお試しください。",
  access_denied: "ログインがキャンセルされました。",
  invalid_request:
    "認証リクエストが無効です。Supabase の Redirect URL 設定を確認してください。",
  auth_callback_failed: "ログインに失敗しました。もう一度お試しください。",
  unexpected_failure:
    "確認メールの送信に失敗しました。時間をおいて再試行するか、Google ログインをご利用ください。",
};

export function formatAuthFailureReason(rawReason?: string | null): string {
  if (!rawReason) {
    return "ログインに失敗しました。もう一度お試しください。";
  }

  let reason = rawReason;

  try {
    reason = decodeURIComponent(rawReason);
  } catch {
    reason = rawReason;
  }

  const trimmed = reason.trim();

  if (AUTH_REASON_MESSAGES[trimmed]) {
    return AUTH_REASON_MESSAGES[trimmed];
  }

  const translated = translateAuthError(
    { message: trimmed, code: trimmed },
    "callback"
  );

  if (translated !== trimmed) {
    return translated;
  }

  if (
    trimmed.includes("code verifier") ||
    trimmed.includes("code_verifier") ||
    trimmed.includes("both auth code and code verifier")
  ) {
    return "ログイン状態の確認に失敗しました。ブラウザの Cookie を有効にして、もう一度お試しください。";
  }

  if (trimmed.includes("redirect") || trimmed.includes("Redirect URL")) {
    return "リダイレクト URL の設定が一致していません。Supabase の Redirect URLs を確認してください。";
  }

  if (!trimmed || trimmed === "{}" || trimmed === "[object Object]") {
    return "ログインに失敗しました。もう一度お試しください。";
  }

  return `ログインに失敗しました: ${trimmed}`;
}

export function getAuthApiErrorMessage(error: {
  message?: string | null;
  code?: string | null;
  status?: number | string | null;
}): string {
  const translated = translateAuthError(
    {
      message: error.message,
      code: error.code,
      status:
        typeof error.status === "string"
          ? Number.parseInt(error.status, 10) || null
          : error.status ?? null,
    },
    "callback"
  );

  if (translated) {
    return translated;
  }

  return "auth_callback_failed";
}
