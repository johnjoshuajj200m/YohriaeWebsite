import { createFileRoute } from "@tanstack/react-router";
import { respondToAnalyticsApiRequest } from "@/lib/admin/analytics-api.server";
import { jsonGa4UnhandledError } from "@/lib/api/json-response.server";

export const Route = createFileRoute("/api/analytics")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          return await respondToAnalyticsApiRequest(request);
        } catch (error) {
          return jsonGa4UnhandledError(error);
        }
      },
    },
  },
});
