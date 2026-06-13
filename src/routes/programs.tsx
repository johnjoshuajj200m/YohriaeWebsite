import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { Heart, Sprout, Scale, Shield, Users, GraduationCap, Megaphone } from "lucide-react";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Programs — YOHRIAE" },
      { name: "description", content: "YOHRIAE programs span health, youth empowerment, human rights, GBV prevention, community engagement, adolescent development and advocacy." },
      { property: "og:title", content: "Our Programs — YOHRIAE" },
      { property: "og:url", content: "/programs" },
    ],
    links: [{ rel: "canonical", href: "/programs" }],
  }),
  component: Programs,
});

const PROGRAMS = [
  {
    Icon: Heart,
    title: "Health & Well-being",
    tagline: "Promoting healthy communities and improved access to care",
    body: "We improve health and well-being by increasing access to information, services and support — across HIV, SRHR, mental health and community health.",
    focus: ["HIV prevention, testing & treatment", "Sexual & reproductive health and rights", "Mental health & psychosocial support", "Health systems strengthening", "Referral & linkage to care"],
  },
  {
    Icon: Sprout,
    title: "Youth Empowerment",
    tagline: "Equipping young people to lead and thrive",
    body: "Leadership, skills and opportunities so young people become active contributors to their communities and economy.",
    focus: ["Leadership development", "Vocational & livelihood skills", "Entrepreneurship development", "Civic engagement", "Mentorship & career guidance"],
  },
  {
    Icon: Scale,
    title: "Human Rights & Social Justice",
    tagline: "Dignity, equality and inclusion",
    body: "We advance rights, challenge discrimination and strengthen protection mechanisms for those most at risk.",
    focus: ["Human rights education", "Legal empowerment", "Documentation & reporting", "Access to justice", "Community-based advocacy"],
  },
  {
    Icon: Shield,
    title: "GBV Prevention & Response",
    tagline: "Building safer communities for everyone",
    body: "Survivor-centered prevention, support and norms transformation.",
    focus: ["GBV prevention", "Survivor support & referral", "Community awareness", "Gender equality promotion", "Capacity building for service providers"],
  },
  {
    Icon: Users,
    title: "Community Engagement & Education",
    tagline: "Empowering communities through knowledge and participation",
    body: "Mobilisation, behaviour change and ownership so change is led by communities themselves.",
    focus: ["Community mobilisation", "Public awareness", "Social & behaviour change", "Community dialogue", "Volunteer engagement"],
  },
  {
    Icon: GraduationCap,
    title: "Youth & Adolescent Development",
    tagline: "Supporting the next generation",
    body: "Information, support and safe spaces that foster healthy growth and positive life outcomes.",
    focus: ["Adolescent health", "Life skills", "Education support", "Peer mentorship", "Safe spaces for young people"],
  },
  {
    Icon: Megaphone,
    title: "Advocacy & Policy Influence",
    tagline: "Voice that moves systems",
    body: "Evidence-based advocacy and stakeholder engagement to shift policies and practices.",
    focus: ["Policy dialogues", "Stakeholder engagement", "Research & evidence", "Capacity strengthening", "Advocacy tools & materials"],
  },
];

function Programs() {
  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="Programs that change lives"
        description="Across all our work, YOHRIAE adopts a rights-based, community-centered, and evidence-driven approach."
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {PROGRAMS.map(({ Icon, title, tagline, body, focus }) => (
            <article key={title} className="group rounded-3xl border border-border bg-card p-7 transition-shadow hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl brand-gradient text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold">{title}</h2>
                  <p className="text-sm font-semibold text-primary">{tagline}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{body}</p>
              <ul className="mt-4 grid gap-1.5 text-sm text-foreground/85">
                {focus.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full brand-gradient" />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
