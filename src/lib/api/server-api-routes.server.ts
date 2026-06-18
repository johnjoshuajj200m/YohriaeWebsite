import {
  jsonErrorResponse,
  jsonGa4UnhandledError,
  jsonResponse,
} from "@/lib/api/json-response.server";

export const SERVER_API_VERSION = "ga4-newsletter-diag-1";

export const HEALTH_API_PATH = "/api/health";
export const ANALYTICS_API_PATH = "/api/analytics";
export const GA4_STATUS_API_PATH = "/api/ga4/status";
export const NEWSLETTER_TEST_API_PATH = "/api/newsletter/test";
export const NEWSLETTER_STATUS_API_PATH = "/api/newsletter/status";

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

export async function respondToGa4StatusRequest(): Promise<Response> {
  try {
    const { describeGa4Config } = await import("@/lib/admin/ga4.server");
    const status = describeGa4Config();
    return jsonResponse({ ok: true, status });
  } catch (error) {
    return jsonGa4UnhandledError(error);
  }
}

export async function respondToNewsletterTestRequestLazy(request: Request): Promise<Response> {
  try {
    const { respondToNewsletterTestRequest } = await import("@/lib/admin/newsletter-test.server");
    return await respondToNewsletterTestRequest(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[newsletter-test] unhandled error", error);
    return jsonErrorResponse("Newsletter test endpoint failed.", 500, message);
  }
}

export async function respondToNewsletterStatusRequestLazy(request: Request): Promise<Response> {
  try {
    const { respondToNewsletterStatusRequest } = await import("@/lib/admin/newsletter-test.server");
    return await respondToNewsletterStatusRequest(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[newsletter-status] unhandled error", error);
    return jsonErrorResponse("Newsletter status endpoint failed.", 500, message);
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

  if (path === GA4_STATUS_API_PATH) {
    return respondToGa4StatusRequest();
  }

  if (path === NEWSLETTER_TEST_API_PATH) {
    return respondToNewsletterTestRequestLazy(request);
  }

  if (path === NEWSLETTER_STATUS_API_PATH) {
    return respondToNewsletterStatusRequestLazy(request);
  }

  return null;
}
