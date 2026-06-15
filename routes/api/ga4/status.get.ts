import { respondToGa4StatusRequest } from "../../../src/lib/api/server-api-routes.server";

/** Nitro route: GET /api/ga4/status — diagnostic for GA4 env vars. */
export default async function () {
  return respondToGa4StatusRequest();
}
