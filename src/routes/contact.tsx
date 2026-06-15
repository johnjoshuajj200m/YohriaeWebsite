import { createFileRoute } from "@tanstack/react-router";
import { buildPageHead } from "@/lib/seo";
import { buildContactPageSchema } from "@/lib/schema";

export const Route = createFileRoute("/contact")({
  head: () =>
    buildPageHead({
      title: "Contact YOHRIAE — Partnerships, Media & General Inquiries",
      description:
        "Get in touch with YOHRIAE for partnerships, media, volunteering, or general inquiries. Email, WhatsApp, and phone contact details for Northern Nigeria.",
      path: "/contact",
      jsonLd: buildContactPageSchema(),
    })
});
