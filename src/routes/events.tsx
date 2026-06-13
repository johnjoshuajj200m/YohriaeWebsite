import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — YOHRIAE" },
      { name: "description", content: "Upcoming and past YOHRIAE events: dialogues, trainings, advocacy convenings and community outreach." },
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

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Convenings, trainings & community moments"
        description="Join us for advocacy events, training workshops and community outreach across Northern Nigeria."
      />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading events…</p>
        ) : events.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-display text-xl">No events yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Upcoming events will be listed here. Subscribe via the contact page to be notified.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {events.map((e) => (
              <li key={e.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="grid gap-0 sm:grid-cols-[160px_1fr]">
                  {e.cover_url ? (
                    <img src={e.cover_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex aspect-video items-center justify-center brand-gradient p-6 text-center text-white sm:aspect-auto">
                      <Calendar className="h-10 w-10" />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">
                      {new Date(e.starts_at).toLocaleDateString(undefined, { dateStyle: "long" })}
                    </p>
                    <h2 className="mt-1 text-xl font-bold">{e.title}</h2>
                    {e.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" /> {e.location}
                      </p>
                    )}
                    {e.description && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">{e.description}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
