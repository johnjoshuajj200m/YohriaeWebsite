import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-eyebrow">YOHRIAE Admin</p>
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function AdminStatCard({
  label,
  value,
  hint,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "primary" | "magenta" | "cyan" | "gold";
}) {
  const accentColor =
    accent === "magenta"
      ? "var(--brand-magenta)"
      : accent === "cyan"
        ? "var(--brand-cyan)"
        : accent === "gold"
          ? "var(--brand-gold)"
          : "var(--primary)";

  return (
    <div className="brand-card rounded-xl border border-border bg-background p-5">
      <div className="mb-4 h-1 w-12 rounded-full" style={{ backgroundColor: accentColor }} />
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background px-6 py-14 text-center">
      <p className="text-lg font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft: "bg-amber-50 text-amber-800 border-amber-200",
    new: "bg-[color-mix(in_srgb,var(--brand-cyan)_12%,white)] text-primary border-[color-mix(in_srgb,var(--brand-cyan)_30%,white)]",
    read: "bg-surface text-muted-foreground border-border",
    replied: "bg-emerald-50 text-emerald-700 border-emerald-200",
    upcoming:
      "bg-[color-mix(in_srgb,var(--brand-cyan)_12%,white)] text-primary border-[color-mix(in_srgb,var(--brand-cyan)_30%,white)]",
    ongoing:
      "bg-[color-mix(in_srgb,var(--brand-gold)_16%,white)] text-foreground border-[color-mix(in_srgb,var(--brand-gold)_35%,white)]",
    past: "bg-surface text-muted-foreground border-border",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    inactive: "bg-surface text-muted-foreground border-border",
    provisioned: "bg-amber-50 text-amber-800 border-amber-200",
    "email sent": "bg-emerald-50 text-emerald-700 border-emerald-200",
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-surface text-muted-foreground border-border",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] ?? "bg-surface text-foreground border-border"}`}
    >
      {status}
    </span>
  );
}
