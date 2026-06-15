import { handleAdminAnalyticsHttpRequest } from "./analytics-handler.server";
import { jsonErrorResponse, jsonGa4UnhandledError, jsonResponse } from "@/lib/api/json-response.server";
import { ANALYTICS_API_PATH } from "@/lib/api/server-api-routes.server";

export { ANALYTICS_API_PATH };

export async function respondToAnalyticsApiRequest(request: Request): Promise<Response> {
  try {
    if (request.method !== "POST") {
      return jsonErrorResponse("Method not allowed.", 405);
    }

    console.info("[ga4] POST /api/analytics");
    const { status, body } = await handleAdminAnalyticsHttpRequest(request);
    return jsonResponse(body as Record<string, unknown>, status);
  } catch (error) {
    return jsonGa4UnhandledError(error);
  }
}
