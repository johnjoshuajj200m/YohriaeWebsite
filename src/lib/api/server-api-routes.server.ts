import { jsonGa4UnhandledError, jsonResponse } from "@/lib/api/json-response.server";

export const SERVER_API_VERSION = "latest-ga4-fix";

export const HEALTH_API_PATH = "/api/health";
export const ANALYTICS_API_PATH = "/api/analytics";

export function normalizeApiPathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

export function respondToHealthRequest(): Response {
  return jsonResponse({ ok: true, version: SERVER_API_VERSION });
}

export async function respondToAnalyticsApiRequestLazy(request: Request): Promise<Response> {
  try {
    const { respondToAnalyticsApiRequest } = await import("@/lib/admin/analytics-api.server");
    return await respondToAnalyticsApiRequest(request);
  } catch (error) {
    return jsonGa4UnhandledError(error);
  }
}

export async function dispatchServerApiRoute(request: Request): Promise<Response | null> {
  const path = normalizeApiPathname(new URL(request.url).pathname);

  if (path === HEALTH_API_PATH) {
    return respondToHealthRequest();
  }

  if (path === ANALYTICS_API_PATH) {
    return respondToAnalyticsApiRequestLazy(request);
  }

  return null;
}
