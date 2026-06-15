import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { IMAGES } from "@/assets/images";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/team")({
  head: () =>
    buildPageHead({
      title: "Our Team — Leadership, Staff & Advisors | YOHRIAE",
      description:
        "Meet the people behind YOHRIAE — the leadership, staff, and advisors driving youth health, human rights, and empowerment programs in Northern Nigeria.",
      path: "/team",
    }),
  component: Team,
});

const TEAM_PHOTOS = [
  { src: IMAGES.team, caption: "YOHRIAE organizational team" },
  { src: IMAGES.partner, caption: "Partnership engagement with community leaders" },
  { src: IMAGES.hero, caption: "Team and community partners" },
] as const;

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
          <>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-lg font-semibold">Our people in action</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Individual staff profiles will be added here. For safeguarding reasons, limited
                senior-leadership detail is shared publicly.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {TEAM_PHOTOS.map(({ src, caption }) => (
                <figure
                  key={caption}
                  className="brand-card group overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={src}
                    alt={caption}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <figcaption className="px-4 py-3 text-sm text-muted-foreground">
                    {caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <article
                key={m.id}
                className="brand-card overflow-hidden rounded-lg border border-border bg-card"
              >
                {m.photo_url ? (
                  <img
                    src={m.photo_url}
                    alt={m.name}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-primary text-4xl font-bold text-white">
                    {m.name.charAt(0)}
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold">{m.name}</h3>
                  <p className="text-sm font-medium text-primary">{m.role}</p>
                  {m.bio && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
