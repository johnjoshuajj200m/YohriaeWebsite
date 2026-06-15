// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
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
