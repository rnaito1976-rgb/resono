const MENU_RETURN_KEY = "resono:menu-return";

export function setMenuReturnPath(path: string) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(MENU_RETURN_KEY, path);
}

export function peekMenuReturnPath(fallback = "/"): string {
  if (typeof window === "undefined") {
    return fallback;
  }

  return sessionStorage.getItem(MENU_RETURN_KEY) ?? fallback;
}

export function consumeMenuReturnPath(fallback = "/"): string {
  const path = peekMenuReturnPath(fallback);

  if (typeof window !== "undefined") {
    sessionStorage.removeItem(MENU_RETURN_KEY);
  }

  return path;
}
