import { z } from "zod";
import { getGa4Analytics, getGa4Credentials } from "./ga4.server";
import type { Ga4DateRange } from "./analytics.types";
import { GA_NOT_CONFIGURED, normalizeGa4Error } from "./analytics-errors";

const rangeSchema = z.object({
  range: z.enum(["today", "7d", "30d", "12m"]),
});

export type AdminAnalyticsResponse =
  | { ok: true; analytics: Awaited<ReturnType<typeof getGa4Analytics>> }
  | { ok: false; error: string };

async function assertAnalyticsAccess(userId: string) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: adminRow }, { data: roleRows }] = await Promise.all([
      supabaseAdmin.from("admins").select("role").eq("user_id", userId).maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).limit(1),
    ]);

    if (!adminRow && !(roleRows && roleRows.length > 0)) {
      throw new Error("Forbidden: analytics access requires an admin dashboard role.");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("Missing Supabase")) {
      throw new Error("Supabase server configuration is missing.");
    }
    throw err instanceof Error ? err : new Error(message);
  }
}

async function getAuthenticatedUserId(request: Request) {
  const SUPABASE_URL =
    process.env.SUPABASE_URL?.trim() ?? process.env.VITE_SUPABASE_URL?.trim();
  const SUPABASE_PUBLISHABLE_KEY =
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Supabase server configuration is missing.");
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: sign in to view analytics.");
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) {
    throw new Error("Unauthorized: missing access token.");
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error("Unauthorized: invalid session.");
  }

  return data.user.id;
}

export async function runAdminAnalyticsRequest(
  range: Ga4DateRange,
  request: Request,
): Promise<AdminAnalyticsResponse> {
  console.info("[ga4] Analytics request, range:", range);

  const credentials = getGa4Credentials();
  if ("error" in credentials) {
    console.warn("[ga4] Analytics blocked — API credentials not configured.");
    return { ok: false, error: GA_NOT_CONFIGURED };
  }

  try {
    const userId = await getAuthenticatedUserId(request);
    await assertAnalyticsAccess(userId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized.";
    console.error("[ga4] Analytics auth failed:", message);
    return { ok: false, error: message };
  }

  try {
    const analytics = await getGa4Analytics(range);
    console.info("[ga4] Analytics loaded for property", analytics.propertyId);
    return { ok: true, analytics };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load Google Analytics data.";
    console.error("[ga4] Analytics fetch failed:", message);
    return { ok: false, error: normalizeGa4Error(message) };
  }
}

export async function handleAdminAnalyticsHttpRequest(
  request: Request,
): Promise<{ status: number; body: AdminAnalyticsResponse }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    console.error("[ga4] Invalid JSON body on /api/analytics");
    return {
      status: 400,
      body: { ok: false, error: "Invalid request body." },
    };
  }

  const parsed = rangeSchema.safeParse(body);
  if (!parsed.success) {
    console.error("[ga4] Invalid range in request body");
    return {
      status: 400,
      body: { ok: false, error: "Invalid analytics date range." },
    };
  }

  const result = await runAdminAnalyticsRequest(parsed.data.range, request);
  const status = result.ok ? 200 : result.error === GA_NOT_CONFIGURED ? 503 : 400;
  return { status, body: result };
}
