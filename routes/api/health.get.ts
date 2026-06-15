import { respondToHealthRequest } from "../../src/lib/api/server-api-routes.server";

/** Nitro route: GET /api/health (registered before SSR catch-all on Vercel). */
export default function () {
  return respondToHealthRequest();
}
