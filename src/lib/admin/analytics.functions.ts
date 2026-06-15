import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { runAdminAnalyticsRequest } from "./analytics-handler.server";
import type { Ga4DateRange } from "./analytics.types";
import { ANALYTICS_API_UNREACHABLE } from "./analytics-errors";

export const fetchAdminAnalytics = createServerFn({ method: "POST" })
  .validator(
    z.object({
      range: z.enum(["today", "7d", "30d", "12m"]),
    }),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    if (!request) {
      console.error("[ga4] Server function missing request context");
      return { ok: false as const, error: ANALYTICS_API_UNREACHABLE };
    }

    console.info("[ga4] fetchAdminAnalytics server function handler, range:", data.range);
    return runAdminAnalyticsRequest(data.range as Ga4DateRange, request);
  });
