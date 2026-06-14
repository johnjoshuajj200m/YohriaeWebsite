import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { IMAGES } from "@/assets/images";
import { CountUpStat } from "@/components/CountUpStat";
import { HERO_STATS, SITE } from "@/lib/site-config";
import { analyticsEvents } from "@/lib/analytics";

export function HeroSection() {
  return (
    <>
      <section className="relative min-h-[520px] overflow-hidden bg-[#0a2540] lg:min-h-[580px]">
        <div className="absolute inset-0">
          <img
            src={IMAGES.hero}
            alt="YOHRIAE community engagement session in Northern Nigeria"
            width={1920}
            height={1080}
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#0a2540]/75" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
              {SITE.registration}
            </p>
            <h1 className="mt-5 text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-[2.75rem]">
              Advancing Youth Health, Rights, and Community Empowerment
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              {SITE.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/programs" className="btn-primary">
                Explore Programs
              </Link>
              <Link
                to="/partner"
                onClick={() => analyticsEvents.partnerClick("home_hero")}
                className="btn-ghost-light"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <dl className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="px-2 py-8 text-center sm:py-10">
                <dt className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  <CountUpStat value={s.value} />
                </dt>
                <dd className="mt-2 text-sm font-medium text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

export function HeroAnnouncement() {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Latest</p>
        <p className="flex-1 text-sm text-foreground">
          YOHRIAE continues to deliver health education, rights advocacy, and youth leadership
          programs across Northern Nigeria.
        </p>
        <Link to="/about" className="prose-link inline-flex shrink-0 items-center gap-1 text-sm">
          Our story <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
