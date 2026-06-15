/**
 * Strips component exports from route files that have matching .lazy.tsx files.
 * Keeps head(), loader(), and imports required by the Route config only.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const routesDir = path.join(root, "src/routes");

const LAZY_ROUTES = [
  "about",
  "blog",
  "contact",
  "donate",
  "events",
  "founder",
  "gallery",
  "partner",
  "programs",
  "resources",
  "team",
  "volunteer",
];

for (const name of LAZY_ROUTES) {
  const mainPath = path.join(routesDir, `${name}.tsx`);
  const lazyPath = path.join(routesDir, `${name}.lazy.tsx`);
  if (!existsSync(mainPath) || !existsSync(lazyPath)) continue;

  const content = readFileSync(mainPath, "utf8");
  const routeStart = content.indexOf("export const Route = createFileRoute");
  if (routeStart === -1) continue;

  const beforeRoute = content.slice(0, routeStart);
  const afterRouteStart = content.slice(routeStart);
  const routeEnd = afterRouteStart.indexOf("\n});");
  if (routeEnd === -1) continue;

  let routeBlock = afterRouteStart.slice(0, routeEnd + 4);
  routeBlock = routeBlock.replace(/,?\s*\n\s*component:\s*\w+,?\s*/g, "\n");

  const usedImports = beforeRoute
    .split("\n")
    .filter((line) => line.startsWith("import "))
    .filter((line) => {
      const ids = [...line.matchAll(/(?:import\s+(?:\{([^}]+)\}|(\w+))|from)/g)]
        .flatMap((m) => (m[1] ?? m[2] ?? "").split(","))
        .map((s) => s.trim().split(/\s+as\s+/)[0].trim())
        .filter(Boolean);
      return ids.some((id) => routeBlock.includes(id));
    });

  const needsCreateFileRoute = routeBlock.includes("createFileRoute");
  const imports = [...usedImports];
  if (
    needsCreateFileRoute &&
    !imports.some((l) => l.includes("createFileRoute"))
  ) {
    imports.push('import { createFileRoute } from "@tanstack/react-router";');
  }

  writeFileSync(mainPath, `${imports.join("\n")}\n\n${routeBlock}\n`, "utf8");
  console.log(`stripped component from ${name}.tsx`);
}
