import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ExternalLink, MapPin } from "lucide-react";
import { analyticsEvents } from "@/lib/analytics";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — YOHRIAE" },
      {
        name: "description",
        content:
          "Upcoming and past YOHRIAE events: dialogues, trainings, advocacy convenings and community outreach.",
      },
      { property: "og:title", content: "YOHRIAE Events" },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: Events,
});

function Events() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("published", true)
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upcoming = events.filter((e) => new Date(e.starts_at) >= new Date());
  const past = events.filter((e) => new Date(e.starts_at) < new Date());

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Convenings, trainings & community moments"
        description="Join us for advocacy events, training workshops and community outreach across Northern Nigeria."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading events…</p>
        ) : events.length === 0 ? (
          <div className="card-ngo mx-auto max-w-xl p-10 text-center">
            <Calendar className="mx-auto h-10 w-10 text-primary/50" />
            <p className="mt-4 text-lg font-semibold">No events yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Upcoming events will be listed here. Subscribe via the footer to be notified.
            </p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="mb-16">
                <SectionHeader eyebrow="Upcoming" title="Register for upcoming events" />
                <ul className="mt-8 space-y-4">
                  {upcoming.map((e) => (
                    <EventCard key={e.id} event={e} highlight />
                  ))}
                </ul>
              </div>
            )}

            <SectionHeader
              eyebrow={upcoming.length > 0 ? "Past events" : "All events"}
              title="Event archive"
              description="A record of trainings, dialogues, and community engagements."
            />
            <ul className="mt-8 space-y-4">
              {(upcoming.length > 0 ? past : events).map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}

function EventCard({
  event: e,
  highlight,
}: {
  event: {
    id: string;
    title: string;
    starts_at: string;
    location: string | null;
    description: string | null;
    image_url: string | null;
    registration_link: string | null;
  };
  highlight?: boolean;
}) {
  return (
    <li className={`card-ngo overflow-hidden ${highlight ? "border-primary/30" : ""}`}>
      <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
        {e.image_url ? (
          <img src={e.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-primary/5 sm:aspect-auto">
            <Calendar className="h-10 w-10 text-primary/40" />
          </div>
        )}
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {new Date(e.starts_at).toLocaleDateString(undefined, { dateStyle: "long" })}
          </p>
          <h2 className="mt-1 text-xl font-bold">{e.title}</h2>
          {e.location && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {e.location}
            </p>
          )}
          {e.description && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{e.description}</p>
          )}
          {e.registration_link && (
            <a
              href={e.registration_link}
              target="_blank"
              rel="noreferrer"
              onClick={() => analyticsEvents.eventRegistration(e.title, e.id)}
              className="btn-outline mt-4 inline-flex text-sm"
            >
              Register <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
