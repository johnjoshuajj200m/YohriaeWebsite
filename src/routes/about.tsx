import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { CheckCircle2, Target, Compass, HeartHandshake, ArrowRight } from "lucide-react";
import { IMAGES } from "@/assets/images";
import { CORE_VALUES, IMPACT_STATS, SITE, TESTIMONIALS } from "@/lib/site-config";
import { CountUpStat } from "@/components/CountUpStat";
import { buildPageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    buildPageHead({
      title: "About YOHRIAE — Our Story, Mission, Vision and Values",
      description:
        "YOHRIAE is a youth-led nonprofit working across Northern Nigeria on health, human rights, advocacy, and community empowerment. Learn our story, mission, and values.",
      path: "/about",
    }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="A youth-led organization for rights, health and dignity"
        description={`Since ${SITE.founded}, YOHRIAE has worked across Northern Nigeria to defend rights, improve health, and empower young people and vulnerable communities.`}
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeader eyebrow="Our story" title="From youth advocacy to community impact" />
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              YOHRIAE — the Youth Health and Right Initiative for Advocacy and Empowerment — was
              founded in {SITE.founded} to respond to deep gaps in health access, human rights
              protection, and opportunity for young people across Northern Nigeria. What began as a
              small group of advocates has grown into a multi-program organization delivering
              evidence-based interventions in partnership with national and international funders.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              We are {SITE.registration.toLowerCase()}, committed to transparency, accountability,
              and community ownership in everything we do.
            </p>
            <Link to="/founder" className="prose-link mt-6 inline-flex items-center gap-1 text-sm">
              Read the founder's story <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <img
            src={IMAGES.about}
            alt="YOHRIAE team at a community session"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-sm object-cover shadow-soft"
          />
        </div>

        <div className="mt-20 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "History",
              body: `Founded in ${SITE.founded}, YOHRIAE grew from youth-led advocacy into a community-facing nonprofit working across health, rights, leadership, mental health, and empowerment.`,
              image: IMAGES.hero,
            },
            {
              title: "Founder story",
              body: "The organization was shaped by a belief that communities are not passive beneficiaries. They are partners, leaders, and protectors of their own futures.",
              image: IMAGES.founder,
            },
            {
              title: "Community story",
              body: "YOHRIAE's work starts with listening: youth groups, community leaders, service providers, and vulnerable people naming the barriers they face and the support they need.",
              image: IMAGES.partner,
            },
          ].map((item) => (
            <article key={item.title} className="card-ngo overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="p-6">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {IMPACT_STATS.map((s) => (
              <div key={s.label} className="bg-background px-6 py-10 text-center">
                <dt className="text-3xl font-bold text-primary">
                  <CountUpStat value={s.value} />
                </dt>
                <dd className="mt-2 text-sm text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              Icon: Target,
              title: "Mission",
              body: "To promote health, protect human rights, and empower young people and vulnerable communities through evidence-based interventions, advocacy, and partnerships.",
            },
            {
              Icon: Compass,
              title: "Vision",
              body: "Healthier, more inclusive and resilient communities where every young person can claim their rights and reach their full potential.",
            },
            {
              Icon: HeartHandshake,
              title: "Approach",
              body: "Rights-based, community-centered, and evidence-driven — co-designed with the communities we serve.",
            },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="card-ngo p-7">
              <div className="icon-box h-11 w-11">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <section className="mt-16 rounded-sm border border-border bg-surface p-6 sm:p-8">
          <p className="text-eyebrow">Organization Details</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="card-ngo p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Executive Director
              </p>
              <p className="mt-2 text-lg font-bold">{SITE.executiveDirector}</p>
            </div>
            <div className="card-ngo p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Organization
              </p>
              <p className="mt-2 text-lg font-bold">
                {SITE.longName} ({SITE.name})
              </p>
            </div>
          </div>
        </section>

        <h2 className="mt-16 text-2xl font-bold">Core values</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_VALUES.map((v) => (
            <li
              key={v}
              className="flex items-center gap-3 rounded-sm border border-border bg-background px-4 py-3"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm font-medium">{v}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-16 text-2xl font-bold">Thematic areas</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Health and well-being",
            "Youth empowerment",
            "Human rights and social justice",
            "Gender-based violence prevention",
            "Community engagement and education",
            "Adolescent development",
            "Advocacy and policy influence",
          ].map((t) => (
            <div
              key={t}
              className="rounded-sm border border-border bg-surface px-4 py-3 text-sm font-medium"
            >
              {t}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Testimonials"
            title="What people say about us"
            align="center"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="card-ngo p-6">
                <blockquote className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 border-t border-border pt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold">Ready to work with us?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore our programs or reach out to discuss partnership opportunities.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/programs" className="btn-primary">
            View Programs
          </Link>
          <Link to="/contact" className="btn-outline">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  );
}
