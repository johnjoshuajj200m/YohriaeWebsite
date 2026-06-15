import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  compact,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      aria-labelledby="page-hero-title"
      className="relative isolate overflow-hidden border-b border-border bg-surface"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[var(--brand-magenta)] via-[var(--brand-cyan)] to-[var(--brand-gold)]"
      />
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
          compact ? "py-12 sm:py-14" : "py-14 sm:py-16 lg:py-20"
        }`}
      >
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="eyebrow-line text-eyebrow">
              <span>{eyebrow}</span>
            </p>
          )}
          <h1
            id="page-hero-title"
            className="mt-3 text-foreground"
          >
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
          {children && <div className="mt-7">{children}</div>}
        </div>
      </div>
    </section>
  );
}
