export function buildLoginHref(nextPath?: string | null): string {
  if (!nextPath || nextPath === "/login" || nextPath.startsWith("/login?")) {
    return "/login";
  }

  return `/login?next=${encodeURIComponent(nextPath)}`;
}
