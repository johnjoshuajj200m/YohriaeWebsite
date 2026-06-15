import { createFileRoute, Link } from "@tanstack/react-router";
import { buildPageHead } from "@/lib/seo";
import { buildPartnerPageSchema } from "@/lib/schema";

export const Route = createFileRoute("/partner")({
  head: () =>
    buildPageHead({
      title: "Partner With YOHRIAE — Donors, NGOs & Community Collaboration",
      description:
        "Partner with YOHRIAE to advance youth health, human rights, advocacy, and community empowerment programs in Northern Nigeria.",
      path: "/partner",
      jsonLd: buildPartnerPageSchema(),
    }),
});
