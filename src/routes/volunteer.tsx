import { buildPageHead } from "@/lib/seo";
import { buildVolunteerPageSchema } from "@/lib/schema";
import { VOLUNTEER_OPPORTUNITIES } from "@/lib/site-config";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/volunteer")({
  head: () =>
    buildPageHead({
      title: "Volunteer With YOHRIAE — Support Youth, Health & Rights Programs",
      description:
        "Use your time and skills to support YOHRIAE's youth health, human rights, advocacy, and community outreach programs across Northern Nigeria.",
      path: "/volunteer",
      jsonLd: buildVolunteerPageSchema([...VOLUNTEER_OPPORTUNITIES]),
    }),
});
