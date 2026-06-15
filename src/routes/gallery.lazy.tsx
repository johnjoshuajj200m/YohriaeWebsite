import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import {
  PublicQueryError,
  PublicQueryLoading,
  PublicQueryNotice,
  publicQueryErrorMessage,
} from "@/components/PublicQueryState";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { GALLERY } from "@/assets/images";
import { supabase } from "@/integrations/supabase/client";
import { buildPageHead } from "@/lib/seo";
import { buildGalleryPageSchema } from "@/lib/schema";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/gallery")({
  component: Gallery,
});

type GalleryImage = { id: string; image_url: string; caption?: string | null };
const CATEGORIES = ["All", "Health", "Advocacy", "Training", "Youth", "Partnerships"] as const;

function getCategory(caption?: string | null) {
  const value = (caption ?? "").toLowerCase();
  if (value.includes("health") || value.includes("aids") || value.includes("hiv")) return "Health";
  if (value.includes("rights") || value.includes("advocacy") || value.includes("paralegal")) {
    return "Advocacy";
  }
  if (value.includes("training") || value.includes("workshop") || value.includes("capacity")) {
    return "Training";
  }
  if (value.includes("academy") || value.includes("youth") || value.includes("football")) {
    return "Youth";
  }
  if (value.includes("partner") || value.includes("leaders") || value.includes("joint")) {
    return "Partnerships";
  }
  return "Advocacy";
}

function Gallery() {
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("All");

  const {
    data: images = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
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

  const fallback = GALLERY.map((g) => ({
    id: g.id,
    image_url: g.src,
    caption: g.caption,
  }));

  const list: GalleryImage[] = isError || images.length === 0 ? fallback : images;
  const filtered =
    active === "All" ? list : list.filter((img) => getCategory(img.caption) === active);

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Moments from the field"
        description="Real photographs from our programs, trainings, and community engagements."
        compact
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <PublicQueryLoading message="Loading gallery…" />
        ) : (
          <>
            <div className="mb-10 flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader
                eyebrow="Documentary archive"
                title="Programs, trainings, outreach, and partners"
                description="Browse field moments by collection. These images help donors and partners see the real work behind the reports."
              />
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActive(category)}
                    className={`rounded-sm border px-3 py-2 text-xs font-semibold transition-colors ${
                      active === category
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {isError ? (
              <PublicQueryNotice
                message={`We couldn't refresh the gallery right now (${publicQueryErrorMessage(error)}). Showing selected program photos.`}
                onRetry={() => refetch()}
              />
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((img) => (
                <figure key={img.id} className="card-ngo group overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setLightbox(img)}
                    className="block w-full text-left"
                    aria-label={img.caption ? `View: ${img.caption}` : "View image"}
                  >
                    <img
                      src={img.image_url}
                      alt={img.caption ?? "YOHRIAE program photograph"}
                      width={1280}
                      height={960}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full object-cover"
                    />
                    {img.caption && (
                      <figcaption className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                        {img.caption}
                      </figcaption>
                    )}
                  </button>
                </figure>
              ))}
            </div>
          </>
        )}
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-sm p-2 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightbox.image_url}
              alt={lightbox.caption ?? "YOHRIAE program photograph"}
              width={1280}
              height={960}
              className="max-h-[85vh] w-full rounded-sm object-contain"
            />
            {lightbox.caption && (
              <p className="mt-3 text-center text-sm text-white/80">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
