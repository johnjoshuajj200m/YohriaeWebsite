import { createFileRoute } from "@tanstack/react-router";
import { SITE } from "@/lib/site-config";
import { buildPageHead } from "@/lib/seo";
import { buildFounderPageSchema } from "@/lib/schema";

export const Route = createFileRoute("/founder")({
  head: () =>
    buildPageHead({
      title: `Meet the Founder — ${SITE.executiveDirector} | YOHRIAE`,
      description: `Read the founder's story behind YOHRIAE and the conviction that drives our work on youth health, human rights, and community empowerment in Northern Nigeria.`,
      path: "/founder",
      type: "profile",
      jsonLd: buildFounderPageSchema(),
    }),
});
