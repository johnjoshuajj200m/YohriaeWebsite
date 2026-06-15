import { createFileRoute } from "@tanstack/react-router";
import { respondToAnalyticsApiRequest } from "@/lib/admin/analytics-api.server";

export const Route = createFileRoute("/api/analytics")({
  server: {
    handlers: {
      POST: async ({ request }) => respondToAnalyticsApiRequest(request),
    },
  },
});
