import { buildPageHead } from "@/lib/seo";
import { buildProgramsPageSchema } from "@/lib/schema";
import { PROGRAMS } from "@/lib/programs-data";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/programs")({
  head: () =>
    buildPageHead({
      title: "Our Programs — Health, Rights, Leadership & Empowerment | YOHRIAE",
      description:
        "Explore YOHRIAE programs: health education, human rights advocacy, youth empowerment, GBV prevention, mental health support, and community engagement in Northern Nigeria.",
      path: "/programs",
      jsonLd: buildProgramsPageSchema(
        PROGRAMS.map((p) => ({
          name: p.title,
          description: p.body,
          serviceType: p.category,
        })),
      ),
    })
});
