import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, BookOpen } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — YOHRIAE" },
      {
        name: "description",
        content:
          "Stories, insights and updates from YOHRIAE — youth voices, advocacy wins and program impact across Northern Nigeria.",
      },
      { property: "og:title", content: "YOHRIAE Blog" },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: Blog,
});

function Blog() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <>
      <PageHero
        eyebrow="Stories"
        title="Voices from the work"
        description="Reports, reflections and impact stories from our communities and team."
      />
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading posts…</p>
        ) : posts.length === 0 ? (
          <div className="card-ngo mx-auto max-w-xl p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-primary/50" />
            <p className="mt-4 text-lg font-semibold">No posts yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Stories and updates will appear here as soon as they're published.
            </p>
          </div>
        ) : (
          <>
            {featured && (
              <article className="card-ngo mb-12 overflow-hidden lg:grid lg:grid-cols-2">
                {featured.cover_url ? (
                  <img
                    src={featured.cover_url}
                    alt=""
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover lg:aspect-auto lg:min-h-[320px]"
                  />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-primary/5 lg:aspect-auto">
                    <BookOpen className="h-12 w-12 text-primary/30" />
                  </div>
                )}
                <div className="flex flex-col justify-center p-8 lg:p-10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Latest ·{" "}
                    {featured.published_at
                      ? new Date(featured.published_at).toLocaleDateString(undefined, {
                          dateStyle: "long",
                        })
                      : ""}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">{featured.title}</h2>
                  {featured.excerpt && (
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                      {featured.excerpt}
                    </p>
                  )}
                  <Link to="/blog" className="prose-link mt-6 inline-flex items-center gap-1 text-sm">
                    Read full story <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            )}

            {rest.length > 0 && (
              <>
                <SectionHeader eyebrow="More stories" title="Insights and updates" />
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p) => (
                    <Link
                      key={p.id}
                      to="/blog"
                      className="card-ngo group overflow-hidden transition-shadow hover:shadow-soft"
                    >
                      {p.cover_url ? (
                        <img
                          src={p.cover_url}
                          alt=""
                          loading="lazy"
                          className="aspect-video w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-primary/5">
                          <BookOpen className="h-8 w-8 text-primary/30" />
                        </div>
                      )}
                      <div className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {p.published_at
                            ? new Date(p.published_at).toLocaleDateString(undefined, {
                                dateStyle: "medium",
                              })
                            : ""}
                        </p>
                        <h3 className="mt-1 text-lg font-bold group-hover:text-primary">
                          {p.title}
                        </h3>
                        {p.excerpt && (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                            {p.excerpt}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </>
  );
}
