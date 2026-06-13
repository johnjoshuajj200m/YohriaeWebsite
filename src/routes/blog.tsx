import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — YOHRIAE" },
      { name: "description", content: "Stories, insights and updates from YOHRIAE — youth voices, advocacy wins and program impact across Northern Nigeria." },
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
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-display text-xl">No posts yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Stories and updates will appear here as soon as they're published.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} to="/blog" className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg">
                {p.cover_url && (
                  <img src={p.cover_url} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                )}
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    {p.published_at ? new Date(p.published_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : ""}
                  </p>
                  <h3 className="mt-1 text-lg font-bold group-hover:text-primary">{p.title}</h3>
                  {p.excerpt && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">{p.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
