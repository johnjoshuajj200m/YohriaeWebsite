import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CountUpStat } from "@/components/CountUpStat";
import { HERO_LCP } from "@/lib/lcp-images";
import { HERO_STATS, SITE } from "@/lib/site-config";
import { analyticsEvents } from "@/lib/analytics";

const STAT_ACCENTS = ["#C2188F", "#00A7C8", "#F5A623"] as const;

export function HeroSection() {
  return (
    <>
      <section
        className="relative isolate overflow-hidden bg-[#0f4c81]"
        style={{ minHeight: "min(75vh, 640px)" }}
      >
        <div className="absolute inset-0">
          <picture>
            <source srcSet={HERO_LCP.srcSet} sizes={HERO_LCP.sizes} type="image/webp" />
            <img
              src={HERO_LCP.jpgSrc}
              alt="Advancing Youth Health, Rights, and Community Empowerment"
              width={HERO_LCP.width}
              height={HERO_LCP.height}
              className="h-full w-full object-cover object-[60%_center] sm:object-[65%_center]"
              loading="eager"
              decoding="sync"
              fetchPriority="high"
            />
          </picture>
          <div className="absolute inset-0 hero-scrim hidden md:block" aria-hidden />
          <div className="absolute inset-0 hero-scrim-vertical md:hidden" aria-hidden />
        </div>

        <div className="relative mx-auto flex min-h-[inherit] max-w-7xl items-center px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-xl lg:max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="accent-bar" aria-hidden />
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-white/90">
                {SITE.registration}
              </p>
            </div>

            <h1 className="mt-4 text-[2.125rem] font-bold leading-[1.12] text-white sm:text-[2.5rem] md:text-[2.625rem] lg:text-[2.875rem]">
              Advancing Youth Health, Rights, and Community Empowerment
            </h1>

            <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-white/90 sm:text-base md:text-lg">
              YOHRIAE empowers young people and vulnerable communities through health education,
              human rights advocacy, leadership development, and community action.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link to="/programs" className="btn-primary justify-center sm:justify-start">
                Explore Programs
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                to="/partner"
                onClick={() => analyticsEvents.partnerClick("home_hero")}
                className="btn-ghost-light justify-center sm:justify-start"
              >
                Partner With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="defer-paint border-b border-border bg-background" aria-label="Impact highlights">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {HERO_STATS.map((s, i) => (
              <div
                key={s.label}
                className="card-ngo flex items-center justify-between gap-4 border-t-[3px] px-5 py-5 sm:flex-col sm:items-start sm:justify-center sm:px-6 sm:py-7 sm:text-left"
                style={{ borderTopColor: STAT_ACCENTS[i % STAT_ACCENTS.length] }}
              >
                <dt className="order-2 text-sm font-medium text-muted-foreground sm:order-none sm:mt-1">
                  {s.label}
                </dt>
                <dd className="order-1 text-3xl font-bold tracking-tight text-primary sm:order-none sm:text-[2.25rem]">
                  <CountUpStat value={s.value} />
                </dd>
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
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:py-4 sm:px-6 lg:px-8">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--brand-magenta)]">
          Latest
        </p>
        <p className="flex-1 text-sm text-foreground">
          YOHRIAE continues to deliver health education, rights advocacy, and youth leadership
          programs across Northern Nigeria.
        </p>
        <Link to="/about" className="prose-link inline-flex shrink-0 items-center gap-1 text-sm">
          Our story <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
