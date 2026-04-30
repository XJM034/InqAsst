export function normalizeApiBaseUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "";
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, "");

  try {
    const url = new URL(withoutTrailingSlash);

    if (
      url.pathname === "/swagger-ui" ||
      url.pathname === "/swagger-ui/" ||
      url.pathname.endsWith("/swagger-ui/index.html")
    ) {
      return url.origin;
    }

    if (url.pathname === "/api" || url.pathname === "/api/") {
      return url.origin;
    }

    return withoutTrailingSlash;
  } catch {
    return withoutTrailingSlash;
  }
}
