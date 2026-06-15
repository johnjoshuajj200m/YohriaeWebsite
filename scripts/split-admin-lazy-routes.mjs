/**
 * Splits admin route files into route config + .lazy.tsx component chunks.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

const adminDir = path.resolve(import.meta.dirname, "../src/routes/admin");
const files = readdirSync(adminDir).filter((f) => f.endsWith(".tsx") && !f.endsWith(".lazy.tsx"));

for (const file of files) {
  const name = file.replace(/\.tsx$/, "");
  const mainPath = path.join(adminDir, file);
  const lazyPath = path.join(adminDir, `${name}.lazy.tsx`);
  if (existsSync(lazyPath)) continue;

  const content = readFileSync(mainPath, "utf8");
  const routeMatch = content.match(
    /export const Route = createFileRoute\("([^"]+)"\)\(\{([\s\S]*?)\n\}\);/,
  );
  if (!routeMatch) {
    console.warn(`skip admin/${file}: no Route`);
    continue;
  }

  const routePath = routeMatch[1];
  const routeBody = routeMatch[2];
  const componentMatch = routeBody.match(/^\s*component:\s*(\w+),?\s*$/m);
  if (!componentMatch) continue;

  const routeStart = content.indexOf(routeMatch[0]);
  const beforeRoute = content.slice(0, routeStart).trimEnd();
  const afterRoute = content.slice(routeStart + routeMatch[0].length).trimStart();

  const newRouteBody = routeBody.replace(/^\s*component:\s*\w+,?\s*$/m, "").trimEnd();
  const headImports = beforeRoute
    .split("\n")
    .filter((line) => line.startsWith("import "))
    .filter((line) => {
      if (line.includes("createFileRoute")) return true;
      return ["buildPageHead", "@/lib/seo", "@/lib/schema"].some((k) => line.includes(k));
    });

  const mainFile = `${headImports.join("\n") || 'import { createFileRoute } from "@tanstack/react-router";'}

export const Route = createFileRoute("${routePath}")({
${newRouteBody}
});
`;

  const lazyFile = `${beforeRoute}
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("${routePath}")({
  component: ${componentMatch[1]},
});

${afterRoute}
`;

  writeFileSync(mainPath, mainFile, "utf8");
  writeFileSync(lazyPath, lazyFile, "utf8");
  console.log(`split admin/${file} → admin/${name}.lazy.tsx`);
}
