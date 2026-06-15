import { createFileRoute, Link } from "@tanstack/react-router";
import { buildPageHead } from "@/lib/seo";
import { buildAboutPageSchema } from "@/lib/schema";

export const Route = createFileRoute("/about")({
  head: () =>
    buildPageHead({
      title: "About YOHRIAE — Our Story, Mission, Vision and Values",
      description:
        "YOHRIAE is a youth-led nonprofit working across Northern Nigeria on health, human rights, advocacy, and community empowerment. Learn our story, mission, and values.",
      path: "/about",
      jsonLd: buildAboutPageSchema(),
    })
});
