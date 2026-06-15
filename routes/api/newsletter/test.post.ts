import { respondToNewsletterTestRequestLazy } from "../../../src/lib/api/server-api-routes.server";

type NitroApiEvent = {
  req: Request;
  request?: Request;
};

/** Nitro route: POST /api/newsletter/test — send admin test notification. */
export default async function (event: NitroApiEvent) {
  const request = event.req ?? event.request;
  if (!request) {
    return new Response(
      JSON.stringify({ ok: false, error: "Missing request on /api/newsletter/test" }),
      { status: 500, headers: { "content-type": "application/json; charset=utf-8" } },
    );
  }
  return respondToNewsletterTestRequestLazy(request);
}
