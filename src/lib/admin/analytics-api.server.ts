import { handleAdminAnalyticsHttpRequest } from "./analytics-handler.server";
import { jsonErrorResponse, jsonResponse } from "@/lib/api/json-response.server";
import { ANALYTICS_API_PATH } from "./analytics-errors";

export { ANALYTICS_API_PATH };

export async function respondToAnalyticsApiRequest(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonErrorResponse("Method not allowed.", 405);
  }

  try {
    console.info("[ga4] POST /api/analytics");
    const { status, body } = await handleAdminAnalyticsHttpRequest(request);
    return jsonResponse(body as Record<string, unknown>, status);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error.";
    console.error("[ga4] /api/analytics handler error:", message, error);
    return jsonErrorResponse(message, 500);
  }
}
