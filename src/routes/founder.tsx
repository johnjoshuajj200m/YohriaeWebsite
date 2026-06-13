import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Quote } from "lucide-react";

export const Route = createFileRoute("/founder")({
  head: () => ({
    meta: [
      { title: "Founder — YOHRIAE" },
      { name: "description", content: "Meet the founder of YOHRIAE and learn about the vision that shapes our work across Northern Nigeria." },
      { property: "og:title", content: "Meet the YOHRIAE Founder" },
      { property: "og:url", content: "/founder" },
    ],
    links: [{ rel: "canonical", href: "/founder" }],
  }),
  component: Founder,
});

function Founder() {
  return (
    <>
      <PageHero eyebrow="Leadership" title="A vision born of community" description="The story behind YOHRIAE and the conviction that drives our work." />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl brand-gradient">
              <div className="flex h-full w-full items-center justify-center bg-black/10 text-white">
                <span className="text-7xl font-black">Y</span>
              </div>
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Founder & Executive Director</p>
          </div>
          <div>
            <Quote className="h-8 w-8 text-primary" />
            <blockquote className="mt-3 text-2xl font-display leading-snug text-foreground sm:text-3xl">
              "Communities are not problems to be solved. They are leaders waiting for the
              opportunity to shape their own futures."
            </blockquote>
            <div className="prose prose-lg mt-8 max-w-none">
              <p className="text-base leading-relaxed text-muted-foreground">
                YOHRIAE was founded in 2019 in response to the urgent gaps young people and
                vulnerable communities in Northern Nigeria faced in accessing health, exercising
                their rights and finding pathways to opportunity. Our founder has spent over a
                decade alongside communities — listening, organising, and building the kind of
                trust that turns conversations into change.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                The vision is simple, but the work is hard: a Northern Nigeria where every young
                person knows their rights, can protect their health, and has the tools to lead.
                Everything YOHRIAE does — from peer education in clinics to advocacy with
                policymakers — flows from that founding belief.
              </p>
              <p className="mt-4 text-sm italic text-muted-foreground">
                A full biography and message from the founder will be published here.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
