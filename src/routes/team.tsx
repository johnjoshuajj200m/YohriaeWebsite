import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Our Team — YOHRIAE" },
      { name: "description", content: "Meet the people behind YOHRIAE — our leadership, staff and advisors." },
      { property: "og:title", content: "Our Team — YOHRIAE" },
      { property: "og:url", content: "/team" },
    ],
    links: [{ rel: "canonical", href: "/team" }],
  }),
  component: Team,
});

function Team() {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("published", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <PageHero
        eyebrow="Our team"
        title="The people behind the work"
        description="A passionate, multidisciplinary team of advocates, health professionals and community organisers."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading team…</p>
        ) : members.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-display text-xl">Team profiles coming soon</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Our leadership and staff profiles will be added here. Limited senior-leadership-only
              detail is shared publicly for safeguarding reasons.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <article key={m.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                {m.photo_url ? (
                  <img src={m.photo_url} alt={m.name} loading="lazy" className="aspect-square w-full object-cover" />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center brand-gradient text-5xl font-black text-white">
                    {m.name.charAt(0)}
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-bold">{m.name}</h3>
                  <p className="text-sm font-semibold text-primary">{m.role}</p>
                  {m.bio && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
