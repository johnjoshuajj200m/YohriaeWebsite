import type { Ga4AnalyticsData, Ga4DateRange } from "./analytics.types";
import { supabase } from "@/integrations/supabase/client";
import {
  ANALYTICS_API_PATH,
  ANALYTICS_API_UNREACHABLE,
  GA_NOT_CONFIGURED,
  sanitizeAnalyticsError,
} from "./analytics-errors";

export type AdminAnalyticsApiResult =
  | { ok: true; analytics: Ga4AnalyticsData }
  | { ok: false; error: string };

function logAnalyticsFetchFailed(details: {
  url: string;
  status?: number;
  contentType?: string;
  detail?: string;
}) {
  console.error("[ga4] analytics fetch failed", details);
}

function isJsonContentType(contentType: string) {
  return contentType.toLowerCase().includes("application/json");
}

/**
 * Loads GA4 admin analytics via POST /api/analytics (JSON-only Vercel server route).
 */
export async function fetchAdminAnalyticsApi(range: Ga4DateRange): Promise<AdminAnalyticsApiResult> {
  const url = ANALYTICS_API_PATH;
  console.info("[ga4] Calling analytics API at", url, "range:", range);

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ range }),
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    logAnalyticsFetchFailed({ url, detail: raw.slice(0, 200) });
    return { ok: false, error: ANALYTICS_API_UNREACHABLE };
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!isJsonContentType(contentType)) {
    const text = await response.text().catch(() => "");
    logAnalyticsFetchFailed({
      url,
      status: response.status,
      contentType,
      detail: text.slice(0, 200),
    });
    return { ok: false, error: ANALYTICS_API_UNREACHABLE };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    logAnalyticsFetchFailed({ url, status: response.status, contentType, detail: "invalid json" });
    return { ok: false, error: ANALYTICS_API_UNREACHABLE };
  }

  if (!payload || typeof payload !== "object") {
    logAnalyticsFetchFailed({ url, status: response.status, contentType, detail: "empty payload" });
    return { ok: false, error: ANALYTICS_API_UNREACHABLE };
  }

  const result = payload as { ok?: boolean; error?: string; analytics?: Ga4AnalyticsData };

  if (!result.ok) {
    const error = sanitizeAnalyticsError(String(result.error ?? ""));
    logAnalyticsFetchFailed({
      url,
      status: response.status,
      contentType,
      detail: error === GA_NOT_CONFIGURED ? "credentials missing" : error,
    });
    return { ok: false, error };
  }

  if (result.analytics?.source !== "ga4") {
    logAnalyticsFetchFailed({ url, status: response.status, contentType, detail: "invalid payload shape" });
    return { ok: false, error: ANALYTICS_API_UNREACHABLE };
  }

  return { ok: true, analytics: result.analytics };
}
