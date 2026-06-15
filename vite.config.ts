// vite-tanstack-config bundles TanStack Start, React, Tailwind, Nitro, and path aliases.
// Do NOT add those plugins manually or the app will break with duplicate plugins.
import { imagetools } from "vite-imagetools";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    plugins: [imagetools()],
    build: {
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react-dom") || /node_modules\/react\//.test(id)) {
              return "vendor-react";
            }
            if (
              id.includes("node_modules/@tanstack/react-router") ||
              id.includes("node_modules/@tanstack/router-core")
            ) {
              return "vendor-router";
            }
            if (id.includes("node_modules/lucide-react")) {
              return "vendor-ui";
            }
            if (
              id.includes("node_modules/@tanstack/react-query") ||
              id.includes("node_modules/@tanstack/query-core")
            ) {
              return "vendor-query";
            }
            if (id.includes("node_modules/@supabase")) {
              return "vendor-supabase";
            }
            if (id.includes("node_modules/recharts")) {
              return "vendor-charts";
            }
          },
        },
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Force Nitro on with the Vercel preset so production builds emit a
  // Build Output API v3 bundle at `.vercel/output/`. Vercel auto-detects this
  // (no Framework Preset / Output Directory config needed in the Vercel UI).
  // Outside this preset (e.g. local `npm run build` for inspection) Nitro is
  // still enabled; switch the preset via the NITRO_PRESET env var if needed.
  nitro: {
    preset: "vercel",
    // @ts-expect-error Nitro scanDirs registers routes/ before the SSR catch-all on Vercel.
    scanDirs: ["routes"],
  },
});
