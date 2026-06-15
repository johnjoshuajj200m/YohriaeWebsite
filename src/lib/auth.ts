export const AUTH_CALLBACK_PATH = "/auth/callback";
export const AUTH_INITIATE_PATH = "/auth/initiate";
export const DEFAULT_POST_AUTH_PATH = "/admin";

export function getAuthCallbackUrl(nextPath = DEFAULT_POST_AUTH_PATH) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const next = encodeURIComponent(nextPath.startsWith("/") ? nextPath : `/${nextPath}`);
  return `${origin}${AUTH_CALLBACK_PATH}?next=${next}`;
}

export function normalizeRedirectPath(redirectUri?: string) {
  if (!redirectUri) return DEFAULT_POST_AUTH_PATH;
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  try {
    const url = new URL(redirectUri, origin || "https://yohriae.local");
    if (origin && url.origin !== origin) return DEFAULT_POST_AUTH_PATH;
    return url.pathname + url.search + url.hash || DEFAULT_POST_AUTH_PATH;
  } catch {
    if (redirectUri.startsWith("/")) return redirectUri;
    return DEFAULT_POST_AUTH_PATH;
  }
}
