import { useQuery } from "@tanstack/react-query";
import { fetchAdminAnalytics } from "@/lib/admin/analytics.functions";
import type { Ga4AnalyticsData, Ga4DateRange } from "@/lib/admin/analytics.types";

const STALE_TIME_MS = 5 * 60 * 1000;
const REFETCH_INTERVAL_MS = 60 * 1000;

export function useAdminAnalytics(range: Ga4DateRange, enabled = true) {
  return useQuery({
    queryKey: ["admin-ga4-analytics", range],
    enabled,
    staleTime: STALE_TIME_MS,
    gcTime: STALE_TIME_MS * 2,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: true,
    queryFn: async () => {
      const result = await fetchAdminAnalytics({ data: { range } });
      if (!result.ok) {
        throw new Error(result.error);
      }
      return result.analytics as Ga4AnalyticsData;
    },
  });
}
