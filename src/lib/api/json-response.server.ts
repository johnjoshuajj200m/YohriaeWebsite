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

export function jsonErrorResponse(error: string, status = 500) {
  return jsonResponse({ ok: false, error }, status);
}
