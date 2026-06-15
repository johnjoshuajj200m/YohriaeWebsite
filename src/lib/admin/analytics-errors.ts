export const GA_NOT_CONFIGURED = "Google Analytics API is not configured yet.";

export const ANALYTICS_API_UNREACHABLE = "Analytics API route is not reachable.";

/** JSON API route for admin GA4 analytics (handled by Nitro / TanStack server route). */
export const ANALYTICS_API_PATH = "/api/analytics";

/** @deprecated Use GA_NOT_CONFIGURED */
export const GA_NOT_CONNECTED = GA_NOT_CONFIGURED;

export function looksLikeHtml(text: string) {
  const s = text.trim().toLowerCase();
  return (
    s.startsWith("<!doctype") ||
    s.startsWith("<html") ||
    s.includes("<body") ||
    s.includes("</html>") ||
    s.includes("this page didn't load")
  );
}

export function isGa4ConfigError(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("not configured") ||
    lower.includes("ga4_property_id") ||
    lower.includes("google_client_email") ||
    lower.includes("google_private_key") ||
    lower.includes("ga4_service_account_json") ||
    lower.includes("missing google analytics") ||
    lower.includes("invalid json")
  );
}

export function sanitizeAnalyticsError(message: string): string {
  const trimmed = message.trim();
  if (!trimmed || looksLikeHtml(trimmed) || trimmed.length > 280) {
    return ANALYTICS_API_UNREACHABLE;
  }
  if (isGa4ConfigError(trimmed) || trimmed === GA_NOT_CONFIGURED) {
    return GA_NOT_CONFIGURED;
  }
  return trimmed;
}

export function normalizeGa4Error(message: string) {
  return sanitizeAnalyticsError(message);
}

export function getAnalyticsErrorDisplay(error: unknown) {
  const raw =
    error instanceof Error ? error.message : "Could not load Google Analytics data.";
  const message = sanitizeAnalyticsError(raw);

  if (message === ANALYTICS_API_UNREACHABLE) {
    return {
      title: ANALYTICS_API_UNREACHABLE,
      message:
        "The analytics server endpoint did not return JSON. Redeploy the latest Vercel build so POST /api/analytics is served by the Nitro handler.",
    };
  }

  if (message === GA_NOT_CONFIGURED) {
    return {
      title: GA_NOT_CONFIGURED,
      message: `${GA4_SETUP_HINT} Required: ${GA4_SETUP_ENV_VARS.join(", ")}.`,
    };
  }

  return {
    title: "Could not load Google Analytics",
    message,
  };
}

export const GA4_SETUP_ENV_VARS = [
  "GA4_PROPERTY_ID",
  "GOOGLE_CLIENT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
] as const;

export const GA4_SETUP_HINT =
  "Add GA4_PROPERTY_ID, GOOGLE_CLIENT_EMAIL, and GOOGLE_PRIVATE_KEY to your Vercel server environment, grant the service account Viewer access in GA4, then redeploy.";
