import { createFileRoute } from "@tanstack/react-router";
import { buildPageHead } from "@/lib/seo";
import { buildTeamPageSchema } from "@/lib/schema";

export const Route = createFileRoute("/team")({
  head: () =>
    buildPageHead({
      title: "Our Team — Leadership, Staff & Advisors | YOHRIAE",
      description:
        "Meet the people behind YOHRIAE — the leadership, staff, and advisors driving youth health, human rights, and empowerment programs in Northern Nigeria.",
      path: "/team",
      jsonLd: buildTeamPageSchema(),
    })
});
