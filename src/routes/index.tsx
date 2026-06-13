import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, HandHeart, Megaphone, Shield, Sparkles, Users, Calendar, BookOpen, Camera } from "lucide-react";
import heroImg from "@/assets/hero-community.jpg";
import advocacyImg from "@/assets/program-advocacy.jpg";
import healthImg from "@/assets/program-health.jpg";
import youthImg from "@/assets/program-youth.jpg";
import gbvImg from "@/assets/program-gbv.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YOHRIAE — Empowering Youth, Health & Human Rights in Northern Nigeria" },
      {
        name: "description",
        content:
          "YOHRIAE empowers young people and vulnerable communities across Northern Nigeria through health, human rights, advocacy and sustainable development.",
      },
      { property: "og:title", content: "YOHRIAE — Activating Empowerment. Igniting Change." },
      {
        property: "og:description",
        content:
          "A youth-led NGO advancing health, human rights and empowerment across Northern Nigeria since 2019.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const STATS = [
  { value: "2019", label: "Established" },
  { value: "10,000+", label: "Lives reached" },
  { value: "7", label: "Thematic programs" },
  { value: "15+", label: "Partners & donors" },
];

const PROGRAMS = [
  { title: "Health & Well-being", desc: "HIV prevention, SRHR, mental health and access to care.", img: healthImg, color: "from-brand-magenta/20 to-transparent" },
  { title: "Youth Empowerment", desc: "Leadership, skills, livelihoods and civic engagement.", img: youthImg, color: "from-brand-cyan/20 to-transparent" },
  { title: "Human Rights & Justice", desc: "Rights education, legal literacy and protection.", img: advocacyImg, color: "from-brand-orange/20 to-transparent" },
  { title: "GBV Prevention & Response", desc: "Survivor-centered support and community action.", img: gbvImg, color: "from-brand-magenta/20 to-transparent" },
];

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImg} alt="" width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-ink/85 via-brand-ink/70 to-primary/60" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-3xl text-white">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Activating Empowerment · Igniting Change
            </p>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Youth, health and human rights —{" "}
              <span className="bg-gradient-to-r from-white via-brand-orange to-white bg-clip-text text-transparent">
                together we rise.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
              YOHRIAE is a youth-led organisation working across Northern Nigeria to protect rights,
              improve health, prevent violence and unlock the potential of young people and
              vulnerable communities.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary shadow-lg shadow-black/20 transition-transform hover:scale-105"
              >
                <Heart className="h-4 w-4" /> Donate now
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                Our story <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white/90 hover:text-white"
              >
                Partner with us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-background px-6 py-8 text-center">
              <p className="text-3xl font-black brand-gradient-text sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] brand-gradient-text">Our mission</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-foreground sm:text-4xl md:text-5xl">
              Empowering young people and vulnerable communities through health, rights and opportunity.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Since 2019, YOHRIAE has worked alongside communities across Northern Nigeria to deliver
              evidence-based, rights-based and community-centered programs. We believe sustainable
              change happens when people are informed, protected, and equipped to lead.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/programs" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Explore programs <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/founder" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary">
                Meet our founder
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl brand-gradient opacity-30 blur-2xl" aria-hidden />
            <img
              src={advocacyImg}
              alt="A young Nigerian woman speaking at a YOHRIAE advocacy session"
              loading="lazy"
              width={1280}
              height={896}
              className="relative aspect-[4/3] w-full rounded-3xl object-cover shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="bg-secondary/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] brand-gradient-text">What we do</p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">Programs that build healthier, fairer communities</h2>
            </div>
            <Link to="/programs" className="text-sm font-semibold text-primary hover:underline">
              All programs →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROGRAMS.map((p) => (
              <article key={p.title} className="group overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={p.img} alt={p.title} loading="lazy" width={1280} height={896} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${p.color}`} aria-hidden />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-foreground">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] brand-gradient-text">How we work</p>
        <h2 className="mx-auto mt-2 max-w-2xl text-center text-3xl font-black sm:text-4xl">
          A rights-based, community-centered approach
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { Icon: Shield, title: "Rights-based", desc: "Every intervention upholds the dignity, agency and protection of those we serve." },
            { Icon: Users, title: "Community-led", desc: "We co-design with communities so change is owned, sustained and locally rooted." },
            { Icon: Megaphone, title: "Evidence-driven", desc: "We document, measure and advocate based on what works in real conditions." },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-border bg-background p-7">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl brand-gradient text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GET INVOLVED */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl brand-gradient p-10 text-white sm:p-14 lg:p-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                Join us. Empower communities.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
                Your support helps us protect rights, prevent violence, improve health and create
                opportunities for thousands of young people across Northern Nigeria.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/donate" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-primary hover:scale-105">
                  <HandHeart className="h-4 w-4" /> Donate
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20">
                  Partner with us
                </Link>
              </div>
            </div>
            <ul className="grid gap-4 text-sm sm:grid-cols-2">
              {[
                { Icon: Calendar, label: "Attend an event" },
                { Icon: BookOpen, label: "Read our stories" },
                { Icon: Camera, label: "Explore the gallery" },
                { Icon: Users, label: "Volunteer with us" },
              ].map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
                  <Icon className="h-5 w-5" />
                  <span className="font-semibold">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
