import { createFileRoute, Link } from "@tanstack/react-router";
import { buildPageHead } from "@/lib/seo";
import { buildDonatePageSchema } from "@/lib/schema";

export const Route = createFileRoute("/donate")({
  head: () =>
    buildPageHead({
      title: "Donate to YOHRIAE — Fund Youth Health, Rights & Empowerment",
      description:
        "Your gift supports YOHRIAE's community work on youth health, human rights, advocacy, and empowerment in Northern Nigeria. Give securely today.",
      path: "/donate",
      jsonLd: buildDonatePageSchema(),
    })
});
