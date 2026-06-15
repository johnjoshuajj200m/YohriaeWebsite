import { Link, createLazyFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { PROGRAM_IMAGES } from "@/assets/images";
import { ArrowRight } from "lucide-react";
import { analyticsEvents } from "@/lib/analytics";
import { PROGRAMS } from "@/lib/programs-data";

export const Route = createLazyFileRoute("/programs")({
  component: Programs,
});

function Programs() {
  const featured = PROGRAMS.filter((p) => p.featured);
  const others = PROGRAMS.filter((p) => !p.featured);

  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="Programs that create lasting community impact"
        description="Across all our work, YOHRIAE adopts a rights-based, community-centered, and evidence-driven approach."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Featured initiatives"
          title="Core programs driving our impact"
          description="These flagship initiatives combine community trust with documented outcomes and partner-ready reporting."
        />

        <div className="mt-12 space-y-8">
          {featured.map((p) => (
            <article
              key={p.title}
              className="card-ngo overflow-hidden lg:grid lg:grid-cols-[1.1fr_0.9fr]"
            >
              <img
                src={PROGRAM_IMAGES[p.imageKey]}
                alt={p.title}
                width={1280}
                height={800}
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] w-full object-cover lg:aspect-auto lg:min-h-[300px]"
              />
              <div className="p-8 lg:p-10">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {p.category}
                </p>
                <h2 className="mt-2 text-xl font-bold sm:text-2xl">{p.title}</h2>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{p.tagline}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                <div className="mt-6 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Impact signal
                    </p>
                    <p className="mt-1 text-lg font-bold text-primary">{p.stat}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Outcome
                    </p>
                    <p className="mt-1 text-sm leading-relaxed">{p.outcome}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <SectionHeader
          eyebrow="All programs"
          title="Full program portfolio"
          description="Each program is designed with community input and delivered through trusted local networks."
          align="center"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {others.map(({ Icon, title, tagline, body, focus, imageKey, stat, outcome, category }) => (
            <article key={title} className="card-ngo overflow-hidden">
              <img
                src={PROGRAM_IMAGES[imageKey]}
                alt={title}
                width={1280}
                height={720}
                loading="lazy"
                decoding="async"
                className="aspect-[16/9] w-full object-cover"
              />
              <div className="p-7">
                <div className="flex items-start gap-4">
                  <div className="icon-box h-11 w-11 shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {category}
                    </p>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">{tagline}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{body}</p>
                <div className="mt-5 rounded-sm bg-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Impact
                  </p>
                  <p className="mt-1 text-sm font-bold text-primary">{stat}</p>
                  <p className="mt-2 text-sm text-foreground">{outcome}</p>
                </div>
                <ul className="mt-4 grid gap-1.5 text-sm text-foreground/85">
                  {focus.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-primary py-14">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-xl font-bold text-white sm:text-2xl">
            Interested in supporting a program?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            Partner with us to fund, scale, or co-implement programs in your community of interest.
          </p>
          <Link
            to="/partner"
            onClick={() => analyticsEvents.partnerClick("programs_cta")}
            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-white px-6 py-3 text-sm font-semibold text-primary hover:bg-white/95"
          >
            Partner With Us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
