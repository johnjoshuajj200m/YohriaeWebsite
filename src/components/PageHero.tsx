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
    <section className="border-b border-border bg-surface">
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
          compact ? "py-12 sm:py-14" : "py-14 sm:py-16 lg:py-20"
        }`}
      >
        <div className="max-w-3xl">
          {eyebrow && <p className="text-eyebrow">{eyebrow}</p>}
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
          {children && <div className="mt-7">{children}</div>}
        </div>
      </div>
    </section>
  );
}
