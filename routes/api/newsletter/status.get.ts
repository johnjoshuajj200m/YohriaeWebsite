import { respondToNewsletterStatusRequestLazy } from "../../../src/lib/api/server-api-routes.server";

type NitroApiEvent = {
  req: Request;
  request?: Request;
};

/** Nitro route: GET /api/newsletter/status — Resend config status. */
export default async function (event: NitroApiEvent) {
  const request = event.req ?? event.request;
  if (!request) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing request on /api/newsletter/status" }),
      { status: 500, headers: { "content-type": "application/json; charset=utf-8" } },
    );
  }
  return respondToNewsletterStatusRequestLazy(request);
}
