import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  ANALYTICS_API_PATH,
  respondToAnalyticsApiRequest,
} from "./lib/admin/analytics-api.server";
import { isJsonApiRequest, jsonErrorResponse } from "./lib/api/json-response.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function normalizeCatastrophicSsrResponse(
  response: Response,
  request: Request,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  const captured =
    consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`);
  const capturedMessage =
    captured instanceof Error ? captured.message : "Server error.";
  console.error("[ga4] SSR catastrophic error:", captured);

  if (isJsonApiRequest(request)) {
    return jsonErrorResponse(capturedMessage, 500);
  }

  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    if (url.pathname === ANALYTICS_API_PATH) {
      return respondToAnalyticsApiRequest(request);
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response, request);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Server error.";
      console.error("[ga4] Server entry error:", message, error);

      if (isJsonApiRequest(request)) {
        return jsonErrorResponse(message, 500);
      }

      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
