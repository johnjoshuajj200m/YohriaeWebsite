import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getGa4Analytics } from "./ga4.server";
import type { Ga4DateRange } from "./analytics.types";
import { normalizeGa4Error } from "./analytics-errors";

async function assertAnalyticsAccess(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [{ data: adminRow }, { data: roleRows }] = await Promise.all([
    supabaseAdmin.from("admins").select("role").eq("user_id", userId).maybeSingle(),
    supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).limit(1),
  ]);

  if (!adminRow && !(roleRows && roleRows.length > 0)) {
    throw new Error("Forbidden: analytics access requires an admin dashboard role.");
  }
}

async function getAuthenticatedUserId() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Supabase server configuration is missing.");
  }

  const request = getRequest();
  const authHeader = request?.headers.get("authorization");

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

export const fetchAdminAnalytics = createServerFn({ method: "POST" })
  .validator(
    z.object({
      range: z.enum(["today", "7d", "30d", "12m"]),
    }),
  )
  .handler(async ({ data }) => {
    const userId = await getAuthenticatedUserId();
    await assertAnalyticsAccess(userId);

    try {
      const analytics = await getGa4Analytics(data.range as Ga4DateRange);
      return { ok: true as const, analytics };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load Google Analytics data.";
      return { ok: false as const, error: normalizeGa4Error(message) };
    }
  });
