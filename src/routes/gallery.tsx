import { createFileRoute } from "@tanstack/react-router";
import { buildPageHead } from "@/lib/seo";
import { buildGalleryPageSchema } from "@/lib/schema";

export const Route = createFileRoute("/gallery")({
  head: () =>
    buildPageHead({
      title: "Photo Gallery — Community Programs & Events | YOHRIAE",
      description:
        "Browse photographs from YOHRIAE programs, advocacy events, trainings, and community engagement across Northern Nigeria.",
      path: "/gallery",
      jsonLd: buildGalleryPageSchema(),
    })
});
