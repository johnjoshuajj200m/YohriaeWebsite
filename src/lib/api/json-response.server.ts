export function isJsonApiRequest(request: Request): boolean {
  const url = new URL(request.url);
  return (
    request.headers.get("x-tsr-serverFn") === "true" ||
    url.pathname.startsWith("/_serverFn/") ||
    url.pathname.startsWith("/api/")
  );
}

export function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function jsonErrorResponse(error: string, status = 500, details?: string) {
  const body: Record<string, unknown> = { ok: false, error };
  if (details) body.details = details;
  return jsonResponse(body, status);
}

export function jsonGa4UnhandledError(error: unknown, status = 500) {
  console.error("[ga4] unhandled error", error);
  const details = String(error instanceof Error ? error.message : error);
  return jsonErrorResponse("Google Analytics server error.", status, details);
}
