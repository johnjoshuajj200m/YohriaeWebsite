import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Handshake,
  HeartPulse,
  MapPin,
  Megaphone,
  Scale,
} from "lucide-react";
import { CountUpStat } from "@/components/CountUpStat";
import { HeroAnnouncement, HeroSection } from "@/components/HeroSection";
import { SectionHeader } from "@/components/SectionHeader";
import { IMAGES, PROGRAM_IMAGES } from "@/assets/images";
import {
  HOME_PROGRAMS,
  IMPACT_STATS,
  SITE,
  TESTIMONIALS,
  CORE_VALUES,
} from "@/lib/site-config";
import { analyticsEvents } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "YOHRIAE — Empowering Young People. Building Stronger Communities.",
      },
      {
        name: "description",
        content: SITE.description,
      },
      { property: "og:title", content: SITE.tagline },
      { property: "og:description", content: SITE.description },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const FEATURED_PROGRAMS = [
  {
    ...HOME_PROGRAMS[0],
    image: PROGRAM_IMAGES.health,
    category: "Health",
    metrics: [
      { value: "1,800+", label: "People reached" },
      { value: "20+", label: "Communities" },
    ],
  },
  {
    ...HOME_PROGRAMS[1],
    image: PROGRAM_IMAGES.rights,
    category: "Advocacy",
    metrics: [
      { value: "30+", label: "Sessions delivered" },
      { value: "450+", label: "Youth engaged" },
    ],
  },
] as const;

const FOCUS_AREAS = [
  {
    title: "Health & Well-being",
    desc: "Health literacy, SRHR, mental health support, and referral pathways for young people and communities.",
    Icon: HeartPulse,
  },
  {
    title: "Rights & Advocacy",
    desc: "Human rights education, legal empowerment, policy dialogue, and community-based protection.",
    Icon: Scale,
  },
  {
    title: "Youth Leadership",
    desc: "Capacity building, mentorship, civic engagement, and pathways to economic opportunity.",
    Icon: Megaphone,
  },
] as const;

function Home() {
  const { data: events = [] } = useQuery({
    queryKey: ["events-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, starts_at, location, description, cover_url")
        .eq("published", true)
        .order("starts_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["blog-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, excerpt, published_at, cover_url")
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <HeroSection />
      <HeroAnnouncement />

      {/* About */}
      <section className="section-padding mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeader
              eyebrow="About YOHRIAE"
              title="A youth-led organization advancing health, rights, and dignity"
              description={`Since ${SITE.founded}, we have worked alongside communities across Northern Nigeria to deliver evidence-based, rights-based programs that protect young people and build local capacity.`}
            />
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              We believe sustainable change happens when communities are informed, protected, and
              equipped to lead. Our work spans health education, human rights advocacy, mental
              health support, leadership development, and community empowerment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/about" className="btn-primary">
                Our Story
              </Link>
              <Link to="/team" className="btn-outline">
                Meet the Team
              </Link>
            </div>
          </div>
          <div>
            <img
              src={IMAGES.about}
              alt="YOHRIAE advocacy session with community members"
              loading="lazy"
              width={1280}
              height={896}
              className="aspect-[4/3] w-full rounded-sm object-cover shadow-soft"
            />
          </div>
        </div>
      </section>

      {/* Impact stats */}
      <section className="border-y border-border bg-surface section-padding">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Our Impact"
            title="Evidence of community trust and program delivery"
            description="YOHRIAE pairs deep community relationships with documentation, learning, and partner accountability."
            align="center"
          />
          <dl className="mt-14 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {IMPACT_STATS.map((s) => (
              <div key={s.label} className="bg-background px-6 py-10 text-center">
                <dt className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  <CountUpStat value={s.value} />
                </dt>
                <dd className="mt-2 text-sm font-medium text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Focus areas */}
      <section className="section-padding mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Our Focus Areas"
          title="Building healthier, more inclusive communities"
          description="We concentrate on areas where health, rights, and youth leadership intersect — and where community action can create lasting change."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FOCUS_AREAS.map(({ title, desc, Icon }) => (
            <article key={title} className="card-ngo p-7">
              <div className="icon-box h-10 w-10">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Focus Area
              </p>
              <h3 className="mt-1 text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              <Link to="/programs" className="prose-link mt-5 inline-flex items-center gap-1 text-sm">
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Featured programs */}
      <section className="border-t border-border bg-surface section-padding">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Our Programs"
            title="Impactful initiatives transforming communities"
            description="Rights-based, community-centered interventions designed with the people we serve."
          />
          <div className="mt-12 space-y-8">
            {FEATURED_PROGRAMS.map((p) => (
              <article
                key={p.slug}
                className="card-ngo overflow-hidden lg:grid lg:grid-cols-[1.1fr_0.9fr]"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover lg:aspect-auto lg:min-h-[280px]"
                />
                <div className="flex flex-col justify-center p-8 lg:p-10">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {p.category}
                  </p>
                  <h3 className="mt-2 text-xl font-bold sm:text-2xl">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                  <dl className="mt-6 flex flex-wrap gap-8">
                    {p.metrics.map((m) => (
                      <div key={m.label}>
                        <dt className="text-2xl font-bold text-primary">{m.value}</dt>
                        <dd className="mt-0.5 text-xs font-medium text-muted-foreground">
                          {m.label}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    to="/programs"
                    className="prose-link mt-6 inline-flex items-center gap-1 text-sm"
                  >
                    Learn more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOME_PROGRAMS.slice(2).map((p) => (
              <article key={p.slug} className="card-ngo p-5">
                <h3 className="text-base font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {p.desc}
                </p>
                <p className="mt-3 text-xs font-medium text-primary">{p.stat}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/programs" className="btn-outline">
              View All Programs
            </Link>
          </div>
        </div>
      </section>

      {/* Values strip */}
      <section className="border-y border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Our core values
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {CORE_VALUES.map((v) => (
              <li key={v} className="text-sm font-medium text-foreground">
                {v}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Voices From the Field"
          title="Trusted by communities and partners"
          align="center"
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card-ngo flex flex-col p-7">
              <blockquote className="flex-1 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-5">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Events & Blog */}
      <section className="border-t border-border bg-surface section-padding">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <SectionHeader
                eyebrow="Events"
                title="Convenings and community moments"
                description="Trainings, advocacy dialogues, and outreach activities across Northern Nigeria."
              />
              {events.length === 0 ? (
                <div className="card-ngo mt-8 p-8 text-center">
                  <Calendar className="mx-auto h-8 w-8 text-primary/60" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Upcoming events will be listed here.
                  </p>
                  <Link to="/events" className="prose-link mt-4 inline-block text-sm">
                    View events page
                  </Link>
                </div>
              ) : (
                <ul className="mt-8 divide-y divide-border border border-border rounded-sm bg-background">
                  {events.map((e) => (
                    <li key={e.id} className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {new Date(e.starts_at).toLocaleDateString(undefined, {
                          dateStyle: "long",
                        })}
                      </p>
                      <h3 className="mt-1 text-base font-semibold">{e.title}</h3>
                      {e.location && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {e.location}
                        </p>
                      )}
                      {e.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {e.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/events" className="prose-link mt-5 inline-flex items-center gap-1 text-sm">
                All events <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div>
              <SectionHeader
                eyebrow="Latest News"
                title="Stories and updates from our work"
                description="Reports, reflections, and impact stories from our communities and team."
              />
              {posts.length === 0 ? (
                <div className="card-ngo mt-8 p-8 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-primary/60" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Stories and updates will appear here as they are published.
                  </p>
                  <Link to="/blog" className="prose-link mt-4 inline-block text-sm">
                    View blog
                  </Link>
                </div>
              ) : (
                <ul className="mt-8 space-y-4">
                  {posts.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/blog"
                        className="card-ngo group block overflow-hidden transition-shadow hover:shadow-soft"
                      >
                        <div className="grid sm:grid-cols-[120px_1fr]">
                          {p.cover_url ? (
                            <img
                              src={p.cover_url}
                              alt=""
                              loading="lazy"
                              className="aspect-video h-full w-full object-cover sm:aspect-auto"
                            />
                          ) : (
                            <div className="flex aspect-video items-center justify-center bg-primary/5 sm:aspect-auto">
                              <BookOpen className="h-6 w-6 text-primary/40" />
                            </div>
                          )}
                          <div className="p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                              {p.published_at
                                ? new Date(p.published_at).toLocaleDateString(undefined, {
                                    dateStyle: "medium",
                                  })
                                : ""}
                            </p>
                            <h3 className="mt-1 text-base font-semibold group-hover:text-primary">
                              {p.title}
                            </h3>
                            {p.excerpt && (
                              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                {p.excerpt}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/blog" className="prose-link mt-5 inline-flex items-center gap-1 text-sm">
                Read all stories <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="section-padding mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="Gallery"
            title="Documenting our work in the field"
            description="Real photographs from programs, trainings, and community engagements."
          />
          <Link to="/gallery" className="btn-outline shrink-0">
            View Gallery
          </Link>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {[IMAGES.impactHealth, IMAGES.impactMentalHealth, IMAGES.partner].map((src, i) => (
            <img
              key={i}
              src={src}
              alt="YOHRIAE program activity"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-sm object-cover shadow-soft"
            />
          ))}
        </div>
      </section>

      {/* Partner / Donate CTA */}
      <section className="border-t border-border bg-primary">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                Get Involved
              </p>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                Partner with or support YOHRIAE
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/85">
                We collaborate with donors, NGOs, government agencies, youth networks, and community
                leaders to scale accountable local impact across health, rights, and empowerment.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link
                to="/donate"
                onClick={() => analyticsEvents.donateClick("home_donate_cta")}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-white px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-white/95"
              >
                Donate
              </Link>
              <Link
                to="/partner"
                onClick={() => analyticsEvents.partnerClick("home_donate_cta")}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Handshake className="h-4 w-4" /> Become a Partner
              </Link>
              <Link
                to="/volunteer"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Volunteer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
