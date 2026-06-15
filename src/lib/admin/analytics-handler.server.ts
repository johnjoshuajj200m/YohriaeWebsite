import { z } from "zod";
import { getGa4Analytics, getGa4Credentials } from "./ga4.server";
import type { Ga4AnalyticsData, Ga4DateRange } from "./analytics.types";
import { GA_NOT_CONFIGURED, GA_SERVER_ERROR } from "./analytics-errors";
import {
  readSupabaseAnonKey,
  readSupabaseUrl,
  validateGa4Env,
  validateSupabasePublicEnv,
  validateSupabaseServiceEnv,
} from "@/lib/env.server";

const rangeSchema = z.object({
  range: z.enum(["today", "7d", "30d", "12m"]),
});

export type AdminAnalyticsResponse =
  | { ok: true; analytics: Ga4AnalyticsData }
  | { ok: false; error: string; details?: string };

function errorMessage(error: unknown) {
  return String(error instanceof Error ? error.message : error);
}

function unhandledAnalyticsResponse(error: unknown): AdminAnalyticsResponse {
  console.error("[ga4] unhandled error", error);
  return {
    ok: false,
    error: GA_SERVER_ERROR,
    details: errorMessage(error),
  };
}

async function assertAnalyticsAccess(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const serviceEnv = validateSupabaseServiceEnv();
    if (!serviceEnv.ok) {
      return { ok: false, error: serviceEnv.message };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: adminRow }, { data: roleRows }] = await Promise.all([
      supabaseAdmin.from("admins").select("role").eq("user_id", userId).maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).limit(1),
    ]);

    if (!adminRow && !(roleRows && roleRows.length > 0)) {
      return { ok: false, error: "Forbidden: analytics access requires an admin dashboard role." };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[ga4] unhandled error", err);
    return { ok: false, error: message || "Could not verify admin access." };
  }
}

async function getAuthenticatedUserId(
  request: Request,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  try {
    const publicEnv = validateSupabasePublicEnv();
    if (!publicEnv.ok) {
      return { ok: false, error: publicEnv.message };
    }

    const SUPABASE_URL = readSupabaseUrl();
    const SUPABASE_PUBLISHABLE_KEY = readSupabaseAnonKey();
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      return { ok: false, error: publicEnv.message };
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return { ok: false, error: "Unauthorized: sign in to view analytics." };
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return { ok: false, error: "Unauthorized: missing access token." };
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return { ok: false, error: "Unauthorized: invalid session." };
    }

    return { ok: true, userId: data.user.id };
  } catch (err) {
    console.error("[ga4] unhandled error", err);
    return { ok: false, error: errorMessage(err) || "Unauthorized." };
  }
}

export async function runAdminAnalyticsRequest(
  range: Ga4DateRange,
  request: Request,
): Promise<AdminAnalyticsResponse> {
  try {
    console.info("[ga4] Analytics request, range:", range);

    const ga4Env = validateGa4Env();
    if (!ga4Env.ok) {
      console.warn("[ga4] Analytics blocked —", ga4Env.message);
      return { ok: false, error: GA_NOT_CONFIGURED, details: ga4Env.message };
    }

    const credentials = getGa4Credentials();
    if ("error" in credentials) {
      console.warn(
        "[ga4] Analytics blocked — credentials check failed:",
        credentials.error,
        credentials.details ?? "",
      );
      return { ok: false, error: credentials.error, details: credentials.details };
    }

    const auth = await getAuthenticatedUserId(request);
    if (!auth.ok) {
      console.error("[ga4] Analytics auth failed:", auth.error);
      return { ok: false, error: auth.error };
    }

    const access = await assertAnalyticsAccess(auth.userId);
    if (!access.ok) {
      console.error("[ga4] Analytics access denied:", access.error);
      return { ok: false, error: access.error };
    }

    const gaResult = await getGa4Analytics(range);
    if (!gaResult.ok) {
      return {
        ok: false,
        error: gaResult.error,
        details: gaResult.details,
      };
    }

    console.info("[ga4] Analytics loaded for property", gaResult.data.propertyId);
    return { ok: true, analytics: gaResult.data };
  } catch (error) {
    return unhandledAnalyticsResponse(error);
  }
}

export async function handleAdminAnalyticsHttpRequest(
  request: Request,
): Promise<{ status: number; body: AdminAnalyticsResponse }> {
  try {
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
    const status = result.ok
      ? 200
      : result.error === GA_NOT_CONFIGURED
        ? 503
        : result.error === GA_SERVER_ERROR
          ? 500
          : 400;
    return { status, body: result };
  } catch (error) {
    return {
      status: 500,
      body: unhandledAnalyticsResponse(error),
    };
  }
}
