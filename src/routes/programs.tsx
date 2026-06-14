import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";
import { PROGRAM_IMAGES } from "@/assets/images";
import { ArrowRight, Heart, Sprout, Scale, Shield, Users, GraduationCap, Megaphone, Brain } from "lucide-react";
import { analyticsEvents } from "@/lib/analytics";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs — YOHRIAE" },
      {
        name: "description",
        content:
          "YOHRIAE programs span health education, human rights advocacy, youth empowerment, GBV prevention, community engagement, and policy influence.",
      },
      { property: "og:title", content: "Our Programs — YOHRIAE" },
      { property: "og:url", content: "/programs" },
    ],
    links: [{ rel: "canonical", href: "/programs" }],
  }),
  component: Programs,
});

const PROGRAMS: {
  Icon: typeof Heart;
  title: string;
  tagline: string;
  body: string;
  focus: string[];
  imageKey: keyof typeof PROGRAM_IMAGES;
  stat: string;
  outcome: string;
  category: string;
  featured?: boolean;
}[] = [
  {
    Icon: Heart,
    title: "Health Education",
    imageKey: "health",
    category: "Health",
    featured: true,
    tagline: "Promoting healthy communities and improved access to care",
    stat: "1,800+ people reached",
    outcome: "Better health literacy, safer choices, and stronger referral pathways.",
    body: "We improve health and well-being by increasing access to information, services, and support — across HIV, SRHR, mental health, and community health.",
    focus: [
      "HIV prevention, testing & treatment",
      "Sexual & reproductive health and rights",
      "Mental health & psychosocial support",
      "Health systems strengthening",
      "Referral & linkage to care",
    ],
  },
  {
    Icon: Scale,
    title: "Human Rights Advocacy",
    imageKey: "rights",
    category: "Advocacy",
    featured: true,
    tagline: "Dignity, equality and inclusion",
    stat: "30+ empowerment sessions",
    outcome: "Communities understand rights, reporting options, and protection routes.",
    body: "We advance rights, challenge discrimination, and strengthen protection mechanisms for those most at risk.",
    focus: [
      "Human rights education",
      "Legal empowerment",
      "Documentation & reporting",
      "Access to justice",
      "Community-based advocacy",
    ],
  },
  {
    Icon: Sprout,
    title: "Leadership Development",
    imageKey: "leadership",
    category: "Youth",
    tagline: "Equipping young people to lead and thrive",
    stat: "450+ youth engaged",
    outcome: "Young people gain practical confidence, civic voice, and peer leadership skills.",
    body: "Leadership, skills, and opportunities so young people become active contributors to their communities and economy.",
    focus: [
      "Leadership development",
      "Vocational & livelihood skills",
      "Entrepreneurship development",
      "Civic engagement",
      "Mentorship & career guidance",
    ],
  },
  {
    Icon: Users,
    title: "Community Outreach",
    imageKey: "outreach",
    category: "Community",
    tagline: "Empowering communities through knowledge and participation",
    stat: "20+ communities served",
    outcome: "Local stakeholders shape solutions and sustain change beyond one event.",
    body: "Mobilisation, behaviour change, and ownership so change is led by communities themselves.",
    focus: [
      "Community mobilisation",
      "Public awareness",
      "Social & behaviour change",
      "Community dialogue",
      "Volunteer engagement",
    ],
  },
  {
    Icon: Brain,
    title: "Mental Health Support",
    imageKey: "mentalHealth",
    category: "Health",
    tagline: "Safe spaces and psychosocial care",
    stat: "Peer support embedded",
    outcome:
      "Mental health conversations become safer, less stigmatized, and more connected to care.",
    body: "Psychosocial support, safe spaces, and referral pathways for young people facing mental health challenges.",
    focus: [
      "Peer counselling",
      "Safe spaces for young people",
      "Psychosocial first aid",
      "Referral pathways",
      "Stigma reduction",
    ],
  },
  {
    Icon: Shield,
    title: "GBV Prevention & Response",
    imageKey: "gbv",
    category: "Protection",
    tagline: "Building safer communities for everyone",
    stat: "Protection pathways strengthened",
    outcome: "Survivors and at-risk groups are connected to safer support and referral options.",
    body: "Survivor-centered prevention, support, and norms transformation.",
    focus: [
      "GBV prevention",
      "Survivor support & referral",
      "Community awareness",
      "Gender equality promotion",
      "Capacity building for service providers",
    ],
  },
  {
    Icon: GraduationCap,
    title: "Youth Empowerment",
    imageKey: "empowerment",
    category: "Youth",
    tagline: "Supporting the next generation",
    stat: "Sport and skills pathways",
    outcome: "Youth build belonging, discipline, confidence, and routes to opportunity.",
    body: "Information, support, and safe spaces that foster healthy growth and positive life outcomes.",
    focus: [
      "Adolescent health",
      "Life skills",
      "Education support",
      "Peer mentorship",
      "Safe spaces for young people",
    ],
  },
  {
    Icon: Megaphone,
    title: "Advocacy & Policy Influence",
    imageKey: "advocacy",
    category: "Advocacy",
    tagline: "Voice that moves systems",
    stat: "Partner-ready advocacy",
    outcome: "Community evidence is translated into policy dialogue and stakeholder action.",
    body: "Evidence-based advocacy and stakeholder engagement to shift policies and practices.",
    focus: [
      "Policy dialogues",
      "Stakeholder engagement",
      "Research & evidence",
      "Capacity strengthening",
      "Advocacy tools & materials",
    ],
  },
];

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
                loading="lazy"
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
                loading="lazy"
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
