import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-community.jpg";
import a from "@/assets/program-advocacy.jpg";
import b from "@/assets/program-health.jpg";
import c from "@/assets/program-youth.jpg";
import d from "@/assets/program-gbv.jpg";

const FALLBACK = [
  { id: "f1", image_url: heroImg, caption: "Community gathering" },
  { id: "f2", image_url: a, caption: "Advocacy session" },
  { id: "f3", image_url: b, caption: "Health outreach" },
  { id: "f4", image_url: c, caption: "Youth training" },
  { id: "f5", image_url: d, caption: "Community dialogue" },
];

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — YOHRIAE" },
      { name: "description", content: "Photographs from YOHRIAE programs, events and community moments." },
      { property: "og:title", content: "YOHRIAE Gallery" },
      { property: "og:url", content: "/gallery" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: Gallery,
});

function Gallery() {
  const { data: images = [] } = useQuery({
    queryKey: ["gallery-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const list = images.length > 0 ? images : FALLBACK;

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Moments from the field"
        description="Snapshots from our programs, trainings and community engagements."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {list.map((img) => (
            <figure key={img.id} className="group relative overflow-hidden rounded-xl bg-secondary">
              <img
                src={img.image_url}
                alt={img.caption ?? ""}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {img.caption && (
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-3 text-xs font-semibold text-white transition-transform duration-300 group-hover:translate-y-0">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
