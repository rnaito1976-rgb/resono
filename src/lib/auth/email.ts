const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalize common IME / full-width mistakes before auth. */
export function normalizeEmailInput(email: string): string {
  return email
    .trim()
    .replace(/\u3000/g, "")
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

export function translateEmailAuthError(message: string): string | null {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("unable to validate email address") ||
    normalized.includes("invalid format")
  ) {
    return "メールアドレスの形式が正しくありません。@を含む半角英数字で入力してください";
  }

  if (
    normalized.includes("email address") &&
    normalized.includes("invalid")
  ) {
    return "このメールアドレスは利用できません。Gmail など一般的なメールアドレスをお試しください";
  }

  if (normalized.includes("invalid email")) {
    return "メールアドレスの形式が正しくありません。@を含む半角英数字で入力してください";
  }

  return null;
}
