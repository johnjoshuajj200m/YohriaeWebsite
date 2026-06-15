import { respondToAnalyticsApiRequestLazy } from "../../src/lib/api/server-api-routes.server";
import { jsonGa4UnhandledError } from "../../src/lib/api/json-response.server";

type NitroApiEvent = {
  req: Request;
  request?: Request;
};

function getRequest(event: NitroApiEvent) {
  return event.req ?? event.request;
}

/** Nitro route: POST /api/analytics (registered before SSR catch-all on Vercel). */
export default async function (event: NitroApiEvent) {
  try {
    const request = getRequest(event);
    if (!request) {
      return jsonGa4UnhandledError(new Error("Missing request on /api/analytics"));
    }
    return await respondToAnalyticsApiRequestLazy(request);
  } catch (error) {
    return jsonGa4UnhandledError(error);
  }
}
