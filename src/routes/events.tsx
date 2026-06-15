import { createFileRoute } from "@tanstack/react-router";
import { buildPageHead } from "@/lib/seo";
import { buildEventsPageSchema } from "@/lib/schema";
import { fetchPublishedEventsForSchema } from "@/lib/schema-data";

export const Route = createFileRoute("/events")({
  loader: async () => ({
    eventsForSchema: await fetchPublishedEventsForSchema(),
  }),
  head: ({ loaderData }) =>
    buildPageHead({
      title: "Events — Trainings, Dialogues & Community Outreach | YOHRIAE",
      description:
        "See upcoming and past YOHRIAE events: youth dialogues, health trainings, advocacy convenings, and community outreach across Northern Nigeria.",
      path: "/events",
      jsonLd: buildEventsPageSchema(loaderData?.eventsForSchema ?? []),
    })
});
