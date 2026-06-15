import { useQuery } from "@tanstack/react-query";
import { fetchAdminAnalyticsApi } from "@/lib/admin/analytics-fetch";
import type { Ga4AnalyticsData, Ga4DateRange } from "@/lib/admin/analytics.types";

const STALE_TIME_MS = 5 * 60 * 1000;
const REFETCH_INTERVAL_MS = 60 * 1000;

export class Ga4QueryError extends Error {
  details?: string;
  constructor(message: string, details?: string) {
    super(message);
    this.name = "Ga4QueryError";
    this.details = details;
  }
}

export function useAdminAnalytics(range: Ga4DateRange, enabled = true) {
  return useQuery({
    queryKey: ["admin-ga4-analytics", range],
    enabled,
    staleTime: STALE_TIME_MS,
    gcTime: STALE_TIME_MS * 2,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: true,
    queryFn: async (): Promise<Ga4AnalyticsData> => {
      const result = await fetchAdminAnalyticsApi(range);
      if (!result.ok) {
        throw new Ga4QueryError(result.error, result.details);
      }
      return result.analytics;
    },
    retry: false,
  });
}
