import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { CheckCircle2, Target, Compass, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About YOHRIAE — Our Story, Mission and Values" },
      { name: "description", content: "Learn about YOHRIAE: our history, mission, vision, core values and thematic areas across Northern Nigeria." },
      { property: "og:title", content: "About YOHRIAE" },
      { property: "og:description", content: "Our story, mission, vision and values." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="A youth-led movement for rights, health and dignity"
        description="Since 2019, YOHRIAE has worked across Northern Nigeria to defend rights, improve health and empower young people and vulnerable communities."
      />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none text-foreground">
          <h2 className="text-2xl font-black sm:text-3xl">Our story</h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            YOHRIAE — the Youth Health and Rights Initiative for Advocacy and Empowerment — was
            founded in 2019 to respond to deep gaps in health access, human rights protection and
            opportunity for young people and vulnerable populations across Northern Nigeria. What
            began as a small group of advocates has grown into a multi-program organisation
            delivering evidence-based interventions in partnership with national and international
            funders.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { Icon: Target, title: "Mission", body: "To promote health, protect human rights and empower young people and vulnerable communities through evidence-based interventions, advocacy and partnerships." },
            { Icon: Compass, title: "Vision", body: "Healthier, more inclusive and resilient communities where every young person can claim their rights and reach their full potential." },
            { Icon: HeartHandshake, title: "Approach", body: "Rights-based, community-centered and evidence-driven — co-designed with the communities we serve." },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl brand-gradient text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-2xl font-black sm:text-3xl">Core values</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {["Dignity & respect", "Equity & inclusion", "Integrity & accountability", "Community ownership", "Evidence-based action", "Collaboration"].map((v) => (
            <li key={v} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="font-semibold">{v}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-16 text-2xl font-black sm:text-3xl">Thematic areas</h2>
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
            <div key={t} className="rounded-lg bg-secondary/60 px-4 py-3 text-sm font-medium">
              {t}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
