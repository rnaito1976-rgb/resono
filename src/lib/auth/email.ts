const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AUTH_ERROR_CODE_MESSAGES: Record<string, string> = {
  email_address_invalid:
    "メールアドレスを確認してください。テスト用ドメイン（example.com など）は利用できません。",
  email_address_not_authorized:
    "このメールアドレスに確認メールを送信できません。Google ログインをご利用ください。",
  email_exists:
    "このメールアドレスはすでに登録されています。ログインページからお試しください。",
  user_already_exists:
    "このメールアドレスはすでに登録されています。ログインページからお試しください。",
  over_email_send_rate_limit:
    "確認メールの送信上限に達しました。1時間ほど待ってから再試行するか、Google ログインをご利用ください。",
  email_not_confirmed:
    "メールアドレスの確認が完了していません。確認メールのリンクを開くか、再送してください。",
  invalid_credentials:
    "メールアドレスまたはパスワードが正しくありません。",
  weak_password: "パスワードは6文字以上で入力してください。",
  signup_disabled: "現在、新規登録を受け付けていません。",
  email_provider_disabled: "メールアドレスでの登録は現在ご利用いただけません。",
  unexpected_failure:
    "確認メールの送信に失敗しました。時間をおいて再試行するか、Google ログインをご利用ください。",
};

export type AuthErrorLike = {
  message?: string | null;
  code?: string | null;
  status?: number | null;
};

export type AuthErrorContext = "signup" | "signin" | "callback";

/** Normalize common IME / full-width mistakes before auth. */
export function normalizeEmailInput(email: string): string {
  return email
    .trim()
    .replace(/\u3000/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/＠/g, "@")
    .replace(/[．。]/g, ".")
    .toLowerCase();
}

export function validateEmailForAuth(email: string): string | null {
  const normalized = normalizeEmailInput(email);

  if (!normalized) {
    return "メールアドレスを入力してください";
  }

  if (!EMAIL_PATTERN.test(normalized)) {
    return "メールアドレスの形式が正しくありません。@を含む半角英数字で入力してください";
  }

  return null;
}

export function translateEmailAuthError(error: AuthErrorLike): string | null {
  const code = error.code?.trim();
  if (code && AUTH_ERROR_CODE_MESSAGES[code]) {
    return AUTH_ERROR_CODE_MESSAGES[code];
  }

  const message = error.message?.trim() ?? "";
  const normalized = message.toLowerCase();

  if (
    normalized.includes("unable to validate email address") ||
    normalized.includes("invalid format")
  ) {
    return "メールアドレスの形式が正しくありません。@を含む半角英数字で入力してください";
  }

  if (normalized.includes("not authorized")) {
    return AUTH_ERROR_CODE_MESSAGES.email_address_not_authorized;
  }

  if (
    normalized.includes("email address") &&
    normalized.includes("invalid")
  ) {
    return AUTH_ERROR_CODE_MESSAGES.email_address_invalid;
  }

  if (normalized.includes("invalid email")) {
    return "メールアドレスの形式が正しくありません。@を含む半角英数字で入力してください";
  }

  if (normalized.includes("confirmation email")) {
    return AUTH_ERROR_CODE_MESSAGES.unexpected_failure;
  }

  return null;
}

function isEmptyAuthMessage(message: string): boolean {
  return !message || message === "{}" || message === "[object Object]";
}

export function translateAuthError(
  error: AuthErrorLike,
  context: AuthErrorContext = "signin"
): string {
  const code = error.code?.trim();
  if (code && AUTH_ERROR_CODE_MESSAGES[code]) {
    return AUTH_ERROR_CODE_MESSAGES[code];
  }

  const emailError = translateEmailAuthError(error);
  if (emailError) {
    return emailError;
  }

  const message = error.message?.trim() ?? "";
  const normalized = message.toLowerCase();

  if (
    normalized.includes("rate limit") ||
    normalized.includes("over_email_send_rate_limit")
  ) {
    return AUTH_ERROR_CODE_MESSAGES.over_email_send_rate_limit;
  }

  if (normalized.includes("confirmation email")) {
    return AUTH_ERROR_CODE_MESSAGES.unexpected_failure;
  }

  if (isEmptyAuthMessage(message)) {
    if (context === "signup" || error.status === 500) {
      return AUTH_ERROR_CODE_MESSAGES.unexpected_failure;
    }

    return "認証に失敗しました。もう一度お試しください。";
  }

  const translations: Record<string, string> = {
    "Invalid login credentials": AUTH_ERROR_CODE_MESSAGES.invalid_credentials,
    "Email not confirmed": AUTH_ERROR_CODE_MESSAGES.email_not_confirmed,
    "User already registered": AUTH_ERROR_CODE_MESSAGES.user_already_exists,
    "Signup requires a valid password": AUTH_ERROR_CODE_MESSAGES.weak_password,
    "email rate limit exceeded": AUTH_ERROR_CODE_MESSAGES.over_email_send_rate_limit,
    "Error sending confirmation email": AUTH_ERROR_CODE_MESSAGES.unexpected_failure,
  };

  return translations[message] ?? message;
}
