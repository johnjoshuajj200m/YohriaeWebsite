import { respondToNewsletterStatusRequestLazy } from "../../../src/lib/api/server-api-routes.server";

/** Nitro route: GET /api/newsletter/status — Resend config status. */
export default async function () {
  return respondToNewsletterStatusRequestLazy();
}
