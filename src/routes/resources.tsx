import { createFileRoute, Link } from "@tanstack/react-router";
import { buildPageHead } from "@/lib/seo";
import { buildResourcesPageSchema } from "@/lib/schema";

export const Route = createFileRoute("/resources")({
  head: () =>
    buildPageHead({
      title: "Resources — Blog, Events, Reports & Stories | YOHRIAE",
      description:
        "Public resources from YOHRIAE: blog updates, events, reports, and photo stories from our work on youth health, rights, and community empowerment.",
      path: "/resources",
      jsonLd: buildResourcesPageSchema(),
    })
});
