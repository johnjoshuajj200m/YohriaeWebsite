import { Link } from "@tanstack/react-router";
import { BookOpen, Calendar, FileText, Images } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { buildPageHead } from "@/lib/seo";
import { buildResourcesPageSchema } from "@/lib/schema";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/resources")({
  component: Resources,
});

function Resources() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Updates, reports, events, and program stories"
        description="Access public information about YOHRIAE's work, community activities, advocacy, and learning."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              to: "/blog",
              title: "Blog",
              body: "Read updates, reports, and field stories.",
              Icon: FileText,
            },
            {
              to: "/events",
              title: "Events",
              body: "View upcoming and past YOHRIAE activities.",
              Icon: Calendar,
            },
            {
              to: "/gallery",
              title: "Gallery",
              body: "See program photos and community moments.",
              Icon: Images,
            },
          ].map(({ to, title, body, Icon }) => (
            <Link
              key={to}
              to={to}
              className="brand-card rounded-lg border border-border bg-background p-6 hover:shadow-soft"
            >
              <Icon className="h-7 w-7 text-primary" />
              <h2 className="mt-4 text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Open <BookOpen className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
