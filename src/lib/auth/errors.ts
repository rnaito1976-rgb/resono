const AUTH_REASON_MESSAGES: Record<string, string> = {
  missing_code: "認証コードが取得できませんでした。もう一度ログインしてください。",
  "{}": "認証に失敗しました。Googleログインをもう一度お試しください。",
  server_error: "認証サーバーでエラーが発生しました。しばらくしてからお試しください。",
  access_denied: "ログインがキャンセルされました。",
  invalid_request:
    "認証リクエストが無効です。Supabase の Redirect URL 設定を確認してください。",
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

  if (!trimmed || trimmed === "{}" || trimmed === "[object Object]") {
    return AUTH_REASON_MESSAGES["{}"] ?? "ログインに失敗しました。もう一度お試しください。";
  }

  if (AUTH_REASON_MESSAGES[trimmed]) {
    return AUTH_REASON_MESSAGES[trimmed];
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

  return `ログインに失敗しました: ${trimmed}`;
}

export function getAuthApiErrorMessage(error: {
  message?: string | null;
  code?: string | null;
  status?: number | string | null;
}): string {
  const message = error.message?.trim();

  if (message && message !== "{}" && message !== "[object Object]") {
    return message;
  }

  if (error.code?.trim()) {
    return error.code.trim();
  }

  if (error.status) {
    return `auth_error_${error.status}`;
  }

  return "auth_callback_failed";
}
