import { PageHero } from "@/components/PageHero";
import { Quote } from "lucide-react";
import { IMAGES } from "@/assets/images";
import { SITE } from "@/lib/site-config";
import { buildPageHead } from "@/lib/seo";
import { buildFounderPageSchema } from "@/lib/schema";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/founder")({
  component: Founder,
});

function Founder() {
  return (
    <>
      <PageHero
        eyebrow="Leadership"
        title="A vision born of community"
        description="The story behind YOHRIAE and the conviction that drives our work."
      />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <img
              src={IMAGES.founder}
              alt="YOHRIAE founder at a community advocacy session"
              width={640}
              height={800}
              loading="lazy"
              decoding="async"
              className="aspect-[4/5] w-full rounded-lg object-cover"
            />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Executive Director: {SITE.executiveDirector}
            </p>
          </div>
          <div>
            <Quote className="h-7 w-7 text-primary" />
            <blockquote className="mt-3 text-xl font-semibold leading-snug text-foreground sm:text-2xl">
              &ldquo;Communities are not problems to be solved. They are leaders waiting for the
              opportunity to shape their own futures.&rdquo;
            </blockquote>
            <div className="mt-8 max-w-none">
              <p className="text-base leading-relaxed text-muted-foreground">
                YOHRIAE was founded in 2019 in response to the urgent gaps young people and
                vulnerable communities in Northern Nigeria faced in accessing health, exercising
                their rights and finding pathways to opportunity. Our founder has spent over a
                decade alongside communities — listening, organising, and building the kind of trust
                that turns conversations into change.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                The vision is simple, but the work is hard: a Northern Nigeria where every young
                person knows their rights, can protect their health, and has the tools to lead.
                Everything YOHRIAE does — from peer education in clinics to advocacy with
                policymakers — flows from that founding belief.
              </p>
              <p className="mt-4 text-sm font-semibold text-primary">
                Executive Director: {SITE.executiveDirector}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
