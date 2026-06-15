import { createFileRoute } from "@tanstack/react-router";
import { dispatchServerApiRoute } from "@/lib/api/server-api-routes.server";
import { jsonGa4UnhandledError } from "@/lib/api/json-response.server";

export const Route = createFileRoute("/api/analytics")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const response = await dispatchServerApiRoute(request);
          if (response) return response;
          return jsonGa4UnhandledError(new Error("Analytics route dispatch failed."));
        } catch (error) {
          return jsonGa4UnhandledError(error);
        }
      },
    },
  },
});
